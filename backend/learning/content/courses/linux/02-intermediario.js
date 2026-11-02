// Módulo "Intermediário" do curso de Linux — 17 lições (primeira metade do módulo), 8 questões cada
// (3 múltipla escolha + 1 lacuna, duas vezes por lição). Ver ../../index.js para o formato e a
// validação de boot. Aprofunda o nível iniciante: boot, kernel, pacotes, usuários/PAM, permissões
// avançadas, processos, systemd, discos/LVM/RAID, sistemas de arquivos, redes, firewall, SSH,
// serviços de rede, shell avançado, sed/awk/jq, regex e agendamento. Exemplos de shell/texto/regex
// foram executados num bash real; comandos específicos de Linux têm saídas rotuladas como exemplo
// (variam por distribuição). Sem números de versão. Helpers locais (mcq, fill, sl) produzem o
// formato esperado pela validação do boot: mcq recebe a letra correta e as 4 alternativas na ordem
// a, b, c, d; fill recebe prompt, código com a lacuna ___ e as respostas aceitas (1ª canônica).
// Segurança e privacidade (LGPD): nenhum dado pessoal real; senhas, chaves e hashes são
// fictícios ou <placeholders>; endereços apenas de documentação (192.0.2.0/24, 198.51.100.0/24,
// 203.0.113.0/24) ou privados; ataques só conceituais e defensivos; comandos destrutivos
// (particionamento, mkfs, rm) sempre com aviso, em VM/disco de teste e com backup.
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
  id: 'intermediario-linux',
  levelKey: 'intermediate',
  order: 2,
  title: 'Intermediário',
  subtitle: 'Boot, kernel, pacotes, PAM, ACLs, processos, systemd, LVM/RAID, redes, firewall, SSH, shell avançado, sed/awk/jq, regex e automação',
  accent: '#eab308',
  lessons: [
    {
      id: 'lni-01-boot-linux',
      title: 'O processo de boot',
      goal: 'Entender cada etapa entre ligar a máquina e ter um sistema pronto, e saber diagnosticar e recuperar um boot com problema.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'A cadeia do boot',
            'Ligar o computador dispara uma cadeia em que cada etapa carrega a próxima: firmware (BIOS ou UEFI) -> bootloader (GRUB, systemd-boot) -> kernel + initramfs -> init (systemd, PID 1) -> serviços e login. Saber a ordem é a chave do diagnóstico: o ponto em que a máquina para diz qual etapa falhou (tela do fabricante, menu do GRUB, erro do kernel ou serviço que não sobe).',
            'firmware (UEFI/BIOS)\n   -> bootloader (GRUB)\n      -> kernel + initramfs\n         -> systemd (PID 1)\n            -> targets e serviços -> login'
          ),
          sl(
            'Firmware: BIOS e UEFI',
            'O firmware é o primeiro código a rodar: testa o hardware básico e procura algo para iniciar. A BIOS clássica lê o primeiro setor do disco (MBR). A UEFI, mais moderna, lê arquivos .efi de uma partição especial FAT chamada ESP (EFI System Partition), normalmente montada em /boot/efi, e costuma usar discos GPT. O Secure Boot (UEFI) só aceita carregar bootloaders e kernels assinados por chaves confiáveis.',
            'ls /sys/firmware/efi        # existe só se iniciou em modo UEFI\n# exemplo (varia): efivars  fw_platform_size  runtime ...'
          ),
          sl(
            'Bootloader e linha de comando do kernel',
            'O bootloader (GRUB é o mais comum; systemd-boot é uma alternativa simples para UEFI) mostra o menu, escolhe um kernel e entrega a ele uma linha de comando com parâmetros, como root=UUID=... (onde está o sistema raiz), ro (monta a raiz somente leitura no início), quiet (menos mensagens) e systemd.unit=rescue.target (qual target iniciar). No menu do GRUB, a tecla e edita a entrada só desta vez, sem gravar nada. A linha em uso fica em /proc/cmdline.',
            'cat /proc/cmdline\n# exemplo (varia):\n# BOOT_IMAGE=/vmlinuz-... root=UUID=<uuid> ro quiet splash'
          ),
          sl(
            'Kernel e initramfs',
            'O kernel é carregado na memória, inicializa o hardware e precisa montar o sistema de arquivos raiz. Mas o driver do disco, o LVM ou a criptografia podem estar em módulos que ficam DENTRO desse disco. A solução é o initramfs: um mini sistema de arquivos temporário, carregado na memória junto com o kernel, contendo só o necessário (drivers, scripts) para localizar e montar a raiz real. Depois disso ele cede o lugar ao sistema verdadeiro.',
            'ls /boot\n# exemplo (varia): vmlinuz-...  initrd.img-...  grub/\n# (em algumas distribuições o initramfs chama-se initramfs-....img)'
          ),
          sl(
            'systemd como PID 1 e os targets',
            'Com a raiz montada, o kernel executa o primeiro processo do espaço de usuário: o init, que hoje na maioria das distribuições é o systemd, com PID 1. Ele inicia o resto, guiado por targets (grupos de unidades que representam um estado): multi-user.target é o modo texto com rede e serviços; graphical.target é o multi-user mais a interface gráfica. O target padrão é consultado e alterado com systemctl.',
            'systemctl get-default\n# exemplo: graphical.target\nsudo systemctl set-default multi-user.target\n# na próxima inicialização, sobe em modo texto'
          ),
          sl(
            'Diagnóstico: dmesg, journalctl -b e systemd-analyze',
            'dmesg mostra o buffer de mensagens do kernel (hardware, drivers, erros de disco) — pode exigir sudo. journalctl -b mostra todo o log do boot atual (kernel + serviços); -b -1 mostra o boot anterior, útil quando a máquina travou e foi reiniciada. systemd-analyze dá o tempo total do boot, e systemd-analyze blame lista as unidades da mais lenta para a mais rápida.',
            'sudo dmesg | tail -n 3\njournalctl -b -p err        # só erros deste boot\njournalctl -b -1 | tail     # fim do boot anterior\nsystemd-analyze\nsystemd-analyze blame | head -n 3'
          ),
          sl(
            'Quando não inicia: recuperação',
            'Conceito: descubra em que etapa parou e use o menor recurso que resolve. Pelo menu do GRUB dá para escolher outro kernel (um mais antigo que funcionava) ou editar a linha do kernel e acrescentar systemd.unit=rescue.target (monta os sistemas de arquivos e dá um shell de root, com poucos serviços) ou systemd.unit=emergency.target (ainda mais mínimo: só a raiz, em geral somente leitura). Esses modos pedem a senha de root; se a raiz estiver ilegível, um pendrive/live USB permite montar o disco e consertar. Antes de qualquer reparo grave, faça backup.',
            '# no GRUB: tecla e, ao fim da linha que começa com linux, acrescente:\nsystemd.unit=rescue.target\n# e inicie com Ctrl+x (vale só para este boot)'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a ordem correta das etapas do boot de um Linux moderno?', 'c', [
          'Kernel -> firmware -> bootloader -> systemd -> serviços, pois o kernel precisa carregar primeiro o hardware que o firmware vai usar',
          'Bootloader -> firmware -> initramfs -> kernel -> systemd, já que o bootloader fica gravado na placa e precisa ser lido antes do firmware',
          'Firmware (BIOS/UEFI) -> bootloader -> kernel com initramfs -> systemd (PID 1) -> serviços',
          'Firmware -> systemd -> kernel -> bootloader -> serviços'
        ], 'O firmware é o primeiro a rodar e acha o bootloader; este carrega kernel e initramfs; o kernel inicia o PID 1 (systemd), que sobe os serviços.'),
        mcq('q2', 'O que diferencia a UEFI da BIOS clássica no ponto de partida do boot?', 'b', [
          'A UEFI não usa bootloader, pois o kernel é iniciado diretamente pela placa-mãe, e por isso o Secure Boot é desnecessário em máquinas com disco GPT, que dispensam qualquer partição especial',
          'A UEFI carrega arquivos .efi de uma partição ESP (FAT) e pode usar Secure Boot; a BIOS lê o primeiro setor (MBR) do disco',
          'A BIOS clássica exige discos GPT com partição ESP, enquanto a UEFI exige discos MBR com setor de boot tradicional no primeiro setor do disco',
          'A UEFI substitui o kernel por um sistema de arquivos temporário'
        ], 'A UEFI procura executáveis .efi na ESP (em /boot/efi). A BIOS executa o código do MBR. O Secure Boot é recurso da UEFI.'),
        mcq('q3', 'Para que serve o initramfs?', 'd', [
          'Guardar o histórico de comandos da sessão de login',
          'Substituir o sistema de arquivos raiz de forma definitiva, mantendo tudo na memória',
          'Armazenar as senhas dos usuários durante o boot',
          'Fornecer, na memória, os drivers e scripts mínimos para o kernel encontrar e montar o sistema de arquivos raiz real'
        ], 'Se o driver do disco, o LVM ou a criptografia estiverem em módulos no próprio disco, o initramfs oferece o necessário para chegar à raiz real.'),
        fill('q4', 'Complete o comando que exibe o log (kernel e serviços) apenas do boot atual.', 'journalctl ___', ['-b', '-b 0', '--boot'], 'journalctl -b filtra pelo boot atual; -b -1 seria o anterior.'),
        mcq('q5', 'Um servidor sem interface gráfica deve iniciar em modo texto, com rede e serviços. Qual target representa isso?', 'a', [
          'multi-user.target',
          'graphical.target, que acrescenta a interface gráfica e os serviços de rede',
          'rescue.target',
          'poweroff.target'
        ], 'multi-user.target é o modo texto completo. graphical.target acrescenta a interface gráfica; rescue.target é manutenção.'),
        mcq('q6', 'Você acrescentou systemd.unit=emergency.target à linha do kernel no GRUB (tecla e). O que ocorre?', 'c', [
          'O sistema inicia normalmente, apenas com mais mensagens de depuração',
          'O kernel é recompilado com opções de emergência na próxima inicialização',
          'O boot para num ambiente mínimo (raiz, em geral somente leitura) com shell de root, para reparos; a mudança vale só para este boot',
          'O sistema grava a alteração em /etc/default/grub de forma permanente, e todas as próximas inicializações passam a usar o target de emergência até que ele seja revertido com update-grub'
        ], 'Editar a entrada no menu do GRUB (tecla e) vale só para aquela inicialização. O target emergency é ainda mais mínimo que o rescue.'),
        mcq('q7', 'A máquina travou ontem e foi reiniciada. Como ler o final do log do boot ANTERIOR?', 'b', [
          'dmesg -b -1',
          'journalctl -b -1 | tail',
          'systemd-analyze blame -1',
          'cat /proc/cmdline'
        ], 'journalctl -b -1 lê o boot anterior (precisa de journal persistente). dmesg só mostra o buffer do boot atual.'),
        fill('q8', 'Complete o comando para fazer o sistema iniciar por padrão em modo texto.', 'sudo systemctl ___ multi-user.target', ['set-default'], 'set-default define o target padrão; get-default apenas consulta.')
      ]
    },
    {
      id: 'lni-02-kernel-modulos',
      title: 'Kernel e módulos',
      goal: 'Entender o que o kernel faz, como carregar e descarregar módulos e como inspecionar e ajustar o sistema em execução via /proc, /sys e sysctl.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que o kernel faz e os dois espaços',
            'O kernel é o núcleo do sistema: gerencia processos (quem roda e quando), memória (quanto cada um recebe), dispositivos (via drivers), rede e sistemas de arquivos. Ele roda no espaço do kernel, com acesso total ao hardware. Seus programas rodam no espaço de usuário, isolados: para qualquer coisa que exija o hardware (abrir arquivo, enviar pacote) pedem ao kernel por meio de chamadas de sistema (syscalls). Um erro num programa comum derruba só ele; um erro no kernel pode derrubar a máquina inteira.',
            'uname -r\n# exemplo (varia): <versao-do-kernel>-generic\nuname -a\n# exemplo (varia): Linux servidor1 <versao> ... x86_64 GNU/Linux'
          ),
          sl(
            'Versões e LTS (visão geral)',
            'uname -r mostra a versão do kernel em execução. O projeto mantém várias linhas de versões; algumas são marcadas como LTS (suporte de longo prazo) e recebem correções de segurança por anos — por isso distribuições estáveis costumam escolher uma LTS e aplicar correções sobre ela. Atualizar o kernel instalado não muda o que está rodando: só vale após reiniciar (ou com técnicas de live patch, fora do escopo aqui).',
            'ls /boot | grep vmlinuz\n# exemplo (varia): lista os kernels instalados\nuname -r   # o que está rodando agora'
          ),
          sl(
            'Módulos carregáveis: lsmod, modinfo',
            'Em vez de embutir todos os drivers, o kernel carrega módulos (arquivos .ko) sob demanda, ligando e desligando funções com o sistema no ar. lsmod lista os carregados (nome, tamanho, quantos usam). modinfo mostra dados de um módulo: descrição, licença, dependências e parâmetros. Muitos módulos são carregados sozinhos quando o hardware é detectado.',
            'lsmod | head -n 4\n# exemplo (varia): Module  Size  Used by\nmodinfo loop | head -n 3\n# exemplo (varia): filename: .../loop.ko ... description: ...'
          ),
          sl(
            'modprobe e rmmod; carregar no boot',
            'modprobe <modulo> carrega o módulo E resolve as dependências (carrega antes os módulos de que ele precisa); modprobe -r descarrega com as dependências. rmmod é a versão simples: descarrega um módulo, sem tratar dependências. (insmod, a contraparte simples do carregamento, recebe o caminho do arquivo .ko e também não resolve dependências — por isso prefere-se modprobe.) Para carregar um módulo a cada boot, liste-o em um arquivo em /etc/modules-load.d/. Para impedir que um módulo seja carregado, use uma linha blacklist em /etc/modprobe.d/.',
            'sudo modprobe vfat\nsudo modprobe -r vfat\necho vfat | sudo tee /etc/modules-load.d/vfat.conf\necho "blacklist pcspkr" | sudo tee /etc/modprobe.d/sem-bip.conf'
          ),
          sl(
            '/proc e /sys: o kernel como arquivos',
            'O kernel expõe seu estado como arquivos virtuais (não ocupam disco). /proc tem informações de processos (/proc/<PID>/) e do sistema: /proc/cpuinfo, /proc/meminfo, /proc/cmdline. /sys mostra a estrutura de dispositivos e drivers, e alguns arquivos ali aceitam escrita para mudar comportamento. É assim que ferramentas como lsmod e ps funcionam: leem esses arquivos. Ler é seguro; escrever em /proc ou /sys muda o kernel em execução, então só faça sabendo o efeito.',
            'head -n 2 /proc/meminfo\n# exemplo: MemTotal: ... kB\nls /sys/class/net\n# exemplo (varia): eth0  lo'
          ),
          sl(
            'sysctl: ajustar parâmetros do kernel',
            'Parâmetros do kernel ficam em /proc/sys e são manipulados com sysctl. sysctl net.ipv4.ip_forward lê; sudo sysctl -w net.ipv4.ip_forward=1 altera, mas só até o próximo boot. Para persistir, grave em um arquivo .conf dentro de /etc/sysctl.d/ (por exemplo 99-rede.conf, com a linha net.ipv4.ip_forward = 1) e aplique com sudo sysctl --system, que relê todos os arquivos de configuração.',
            'sysctl net.ipv4.ip_forward\n# exemplo: net.ipv4.ip_forward = 0\nsudo sysctl -w net.ipv4.ip_forward=1     # temporário\necho "net.ipv4.ip_forward = 1" | sudo tee /etc/sysctl.d/99-rede.conf\nsudo sysctl --system                      # aplica os arquivos'
          ),
          sl(
            'DKMS e dmesg (visão geral)',
            'Módulos que não fazem parte do kernel (por exemplo, drivers de terceiros) precisam ser compilados para cada versão do kernel. O DKMS automatiza isso: guarda o código-fonte e recompila o módulo sempre que um kernel novo é instalado, evitando que o driver "suma" depois de uma atualização. Se um módulo falhar ao carregar, a explicação costuma estar no buffer do kernel: dmesg (ou journalctl -k) mostra os erros e avisos de drivers.',
            'dkms status\n# exemplo (varia): <modulo>/<versao>, <kernel>, x86_64: installed\nsudo dmesg | tail -n 5\njournalctl -k -b | tail -n 5'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que um programa comum, como um editor de texto, não acessa o disco diretamente?', 'd', [
          'Porque o disco só aceita escrita de processos com PID 1',
          'Porque programas rodam no espaço do kernel e precisam de uma licença para sair dele',
          'Porque o sistema de arquivos é montado dentro de cada processo, isolado dos demais',
          'Porque programas rodam no espaço de usuário, isolados, e pedem ao kernel (syscalls) qualquer acesso ao hardware'
        ], 'O kernel, no espaço do kernel, é o único com acesso direto ao hardware; programas usam chamadas de sistema.'),
        mcq('q2', 'Qual a vantagem de modprobe sobre insmod para carregar um módulo?', 'b', [
          'modprobe compila o módulo a partir do código-fonte do kernel antes de carregá-lo, enquanto insmod só aceita módulos prontos',
          'modprobe resolve e carrega as dependências do módulo; insmod carrega só o arquivo .ko informado',
          'modprobe grava o módulo em /etc/modules-load.d/ para carregar em todo boot, enquanto insmod carrega só até o próximo reinício',
          'insmod exige sudo e modprobe não exige'
        ], 'modprobe consulta as dependências e carrega o que falta. A persistência no boot vem de /etc/modules-load.d/.'),
        mcq('q3', 'O que é o conteúdo de /proc e /sys?', 'a', [
          'Arquivos virtuais criados pelo kernel que refletem o estado do sistema, sem ocupar espaço de disco',
          'Cópias de segurança dos módulos do kernel e das configurações de hardware, restauradas automaticamente em caso de falha',
          'Diretórios onde o administrador instala programas de terceiros e guarda os arquivos de configuração de cada usuário do sistema',
          'Partições de swap usadas quando falta memória'
        ], 'São sistemas de arquivos virtuais: ler um deles consulta o kernel naquele instante.'),
        fill('q4', 'Complete o comando que carrega o módulo vfat resolvendo suas dependências.', 'sudo ___ vfat', ['modprobe'], 'modprobe carrega o módulo com dependências; modprobe -r o descarrega.'),
        mcq('q5', 'Você executou sudo sysctl -w net.ipv4.ip_forward=1 e depois reiniciou. O que acontece com o valor?', 'c', [
          'Continua 1, pois sysctl -w grava automaticamente o valor em /etc/sysctl.conf e o reaplica a cada novo boot do sistema operacional',
          'Vira 1 também em todos os containers futuros, por herança do kernel',
          'Volta ao valor anterior, porque -w só altera o kernel em execução; para persistir é preciso um arquivo em /etc/sysctl.d/',
          'O boot falha, pois o parâmetro foi alterado sem reiniciar o serviço de rede'
        ], 'sysctl -w é temporário. Grave em /etc/sysctl.d/*.conf e aplique com sysctl --system.'),
        mcq('q6', 'Para que serve o DKMS?', 'd', [
          'Descompactar módulos .ko enviados por e-mail',
          'Bloquear módulos suspeitos antes de serem carregados',
          'Medir a latência das chamadas de sistema do kernel',
          'Recompilar automaticamente módulos de fora da árvore do kernel a cada nova versão de kernel instalada'
        ], 'Sem DKMS, um driver de terceiros deixaria de funcionar ao atualizar o kernel até ser recompilado manualmente.'),
        mcq('q7', 'Um módulo não carrega. Onde procurar a mensagem de erro do driver?', 'a', [
          'No buffer do kernel, com dmesg ou journalctl -k',
          'Em /etc/modules-load.d/, que guarda o log do carregamento',
          'Na saída de uname -r, que lista os módulos com falha',
          'Na saída do lsmod, que mostra o último erro de cada módulo'
        ], 'Erros de drivers vão para o log do kernel; dmesg e journalctl -k os exibem.'),
        fill('q8', 'Complete o comando que relê todos os arquivos de configuração, incluindo /etc/sysctl.d/, e aplica os parâmetros.', 'sudo sysctl ___', ['--system'], '--system carrega os arquivos de /etc/sysctl.d, /run/sysctl.d, /usr/lib/sysctl.d e /etc/sysctl.conf.')
      ]
    },
    {
      id: 'lni-35-hardware-dispositivos-udev',
      title: 'Hardware e dispositivos: udev, lspci e lsusb',
      goal: 'Descobrir o hardware da máquina, entender como o kernel e o udev criam e nomeiam dispositivos em /dev e diagnosticar um dispositivo que não funciona.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Descobrindo o hardware',
            'Antes de mexer em drivers, descubra o que existe. lscpu resume a CPU (modelo, núcleos, arquitetura). lspci lista dispositivos da placa (vídeo, rede, controladoras); com -k mostra também qual driver do kernel está em uso e quais módulos poderiam atendê-lo; com -nn acrescenta os IDs numéricos [fabricante:dispositivo], úteis para pesquisar. lsusb lista dispositivos USB. lsblk mostra discos e partições. Para um inventário geral, lshw -short e dmidecode (que lê as tabelas DMI/SMBIOS: fabricante, modelo, memória) exigem sudo. sensors (pacote lm-sensors) mostra temperaturas e ventoinhas, e smartctl -a /dev/sda (pacote smartmontools) mostra a saúde SMART de um disco.',
            'lspci -k\n# exemplo (varia por máquina/distribuição):\n# 00:02.0 VGA compatible controller: <fabricante> <modelo>\n#         Kernel driver in use: <driver>\n#         Kernel modules: <modulo>\nlsusb\n# exemplo: Bus 001 Device 004: ID 1234:abcd <fabricante> <produto>\nlsblk'
          ),
          sl(
            '/proc e /sys como fonte de dados',
            'As ferramentas acima leem os arquivos virtuais do kernel. /proc/cpuinfo detalha cada processador; /sys organiza dispositivos em árvore (/sys/class/net lista interfaces, /sys/block lista discos, /sys/class/thermal traz sensores). Ler é seguro e útil em scripts, quando a ferramenta não está instalada. Escrever nesses arquivos altera o kernel em execução, então só faça isso sabendo o efeito.',
            'grep -m1 "model name" /proc/cpuinfo\n# exemplo: model name : <modelo da CPU>\nls /sys/class/net\n# exemplo (varia): eth0  lo  wlan0'
          ),
          sl(
            'Nós em /dev: bloco e caractere, major e minor',
            'No Linux, dispositivos aparecem como arquivos especiais em /dev. Um dispositivo de bloco (b) é acessado em blocos de tamanho fixo, com leitura em qualquer posição: discos e partições (/dev/sda, /dev/nvme0n1p1). Um dispositivo de caractere (c) é lido como fluxo de bytes: terminais, /dev/null, portas seriais. O kernel identifica cada dispositivo por dois números: major (qual driver cuida dele) e minor (qual dispositivo daquele driver). No ls -l, eles aparecem no lugar do tamanho, e a primeira letra da permissão mostra o tipo.',
            'ls -l /dev/sda /dev/null\n# exemplo (varia):\n# brw-rw---- 1 root disk 8, 0 ... /dev/sda\n# crw-rw-rw- 1 root root 1, 3 ... /dev/null\n#  ^ b = bloco, c = caractere; "8, 0" = major, minor'
          ),
          sl(
            'udev: eventos e nomes persistentes',
            'O kernel avisa quando um dispositivo aparece ou some (um evento). O udev (o serviço systemd-udevd) recebe o evento, cria ou remove o nó em /dev, aplica nome, dono, grupo e permissões segundo regras e carrega o módulo necessário. Isso é o hotplug: ao espetar um pendrive, aparece um nó novo, como /dev/sdb. O problema é que sdb pode virar sdc em outro dia. Por isso o udev também cria links estáveis em /dev/disk/by-uuid, by-label e by-id (e, para placas de rede, nomes previsíveis). Em /etc/fstab, prefira UUID= a /dev/sdX.',
            'ls -l /dev/disk/by-uuid\n# exemplo: <uuid> -> ../../sda1\nudevadm monitor\n# exemplo: espete um pendrive e veja eventos "add" ...\n# (Ctrl+C para sair)'
          ),
          sl(
            'Regras udev e udevadm',
            'Regras são arquivos .rules em /etc/udev/rules.d/ (do administrador; têm prioridade) e em /usr/lib/udev/rules.d/ (da distribuição, às vezes /lib/udev/rules.d/). São lidas em ordem alfabética, por isso o prefixo numérico (ex.: 99-local.rules). Cada linha casa atributos com == e atribui resultados com =. udevadm info -a -n /dev/sdb mostra os atributos do dispositivo para escrever a regra; udevadm monitor mostra eventos ao vivo; udevadm test simula o tratamento de um dispositivo. Depois de editar, recarregue com udevadm control --reload e reaplique com udevadm trigger.',
            '# /etc/udev/rules.d/99-leitor.rules (exemplo com IDs fictícios)\nSUBSYSTEM=="usb", ATTR{idVendor}=="1234", ATTR{idProduct}=="abcd", GROUP="leitores", MODE="0660"\n\nsudo udevadm control --reload\nsudo udevadm trigger'
          ),
          sl(
            'Drivers, firmware e drivers proprietários',
            'Um driver pode estar embutido no kernel (built-in) ou ser um módulo carregado sob demanda. Muitos dispositivos (Wi-Fi, GPUs, placas de rede) ainda precisam de firmware: um blob binário enviado ao dispositivo, que fica em /usr/lib/firmware (ou /lib/firmware) e costuma vir do pacote linux-firmware. Sem ele, o dmesg mostra algo como falha ao carregar firmware. Drivers proprietários (comum em GPUs) são módulos fora da árvore do kernel e de código fechado. Riscos: precisam ser recompilados a cada kernel novo (o DKMS automatiza isso), podem falhar numa atualização e, com Secure Boot ativo, o kernel recusa módulos não assinados, a menos que você assine o módulo e cadastre a chave (MOK).',
            'ls /usr/lib/firmware | head -n 3\n# exemplo (varia): nomes de arquivos de firmware\nsudo dmesg | grep -i firmware\n# exemplo: ... firmware: failed to load <arquivo> (-2)'
          ),
          sl(
            'Dispositivo que não funciona e segurança',
            'Siga um roteiro: 1) o hardware aparece? (lspci -nn, lsusb); 2) há driver? (lspci -k, lsmod); 3) o que o kernel disse? (sudo dmesg, journalctl -k, que filtra só mensagens do kernel; procure erros e pedido de firmware); 4) as permissões deixam o seu usuário usá-lo? (ls -l no nó em /dev). Segurança: não use chmod 666 em dispositivos para resolver permissão, pois qualquer usuário passaria a acessá-los. Crie um grupo específico, ponha só quem precisa nele (usermod -aG) e use uma regra udev com GROUP= e MODE="0660". Isso é o princípio do menor privilégio.',
            'journalctl -k -p warning | tail\nlsmod | grep <modulo>\nsudo groupadd leitores\nsudo usermod -aG leitores <usuario>   # vale no próximo login'
          )
        ]
      },
      questions: [
        mcq('q1', 'Você quer saber qual driver do kernel está atendendo a placa de rede de uma máquina. Qual comando mostra isso diretamente?', 'c', [
          'lsusb -t, que lista a árvore de dispositivos USB com os drivers de cada porta da placa-mãe',
          'lscpu, que informa o modelo do processador e os módulos de rede associados a ele',
          'lspci -k, que lista dispositivos PCI com "Kernel driver in use" e os módulos possíveis',
          'dmidecode, que lê a BIOS e informa o driver carregado'
        ], 'lspci -k mostra, para cada dispositivo PCI, o driver em uso e os módulos candidatos. dmidecode e lscpu não tratam de drivers.'),
        mcq('q2', 'Na linha "brw-rw---- 1 root disk 8, 16 ... /dev/sdb", o que significam a letra b e os números 8, 16?', 'a', [
          'b indica dispositivo de bloco; 8 é o major (driver) e 16 é o minor (qual dispositivo daquele driver)',
          'b indica backup; 8 e 16 são o tamanho do disco em gigabytes, separados por vírgula',
          'b indica dispositivo de caractere; 8 é o número de partições e 16 é o número de arquivos',
          'b indica que o disco está bloqueado; 8 e 16 são o UID do dono e o GID do grupo, e que o dono pode desbloqueá-lo com chmod'
        ], 'A primeira letra é o tipo (b bloco, c caractere). Major identifica o driver e minor identifica a instância; no lugar do tamanho aparecem esses dois números.'),
        mcq('q3', 'O pendrive aparecia como /dev/sdb e hoje apareceu como /dev/sdc, quebrando uma montagem manual. Qual é a boa prática para referenciá-lo em /etc/fstab?', 'd', [
          'Fixar /dev/sdb por um chmod no arquivo, para o kernel reservar esse nome, e repetir o comando a cada boot em /etc/rc.local',
          'Reiniciar a máquina antes de cada uso, para a ordem dos discos voltar ao padrão',
          'Apontar para o nome do módulo de armazenamento carregado, que não muda entre boots',
          'Usar UUID= (ou LABEL=), que corresponde aos links estáveis criados pelo udev em /dev/disk/by-uuid'
        ], 'Nomes sdX dependem da ordem de detecção. UUID e label identificam o sistema de arquivos e não mudam.'),
        fill('q4', 'Complete o comando que lista dispositivos PCI mostrando também o driver do kernel em uso.', 'lspci ___', ['-k', '-nnk', '-kn'], 'A opção -k exibe "Kernel driver in use" e "Kernel modules".'),
        mcq('q5', 'Leia a regra em /etc/udev/rules.d/99-leitor.rules:\nSUBSYSTEM=="usb", ATTR{idVendor}=="1234", ATTR{idProduct}=="abcd", GROUP="leitores", MODE="0660"\nQual é o efeito?', 'b', [
          'Bloqueia o dispositivo USB com esses IDs, impedindo que o kernel o reconheça',
          'Quando o USB com esses IDs aparece, o nó fica com grupo leitores e permissão rw para dono e grupo, sem acesso a outros',
          'Cria o grupo leitores e adiciona automaticamente todos os usuários do sistema nele, pois GROUP= executa groupadd e usermod em lote',
          'Dá permissão total (leitura, escrita e execução) a todos os usuários que espetarem o dispositivo'
        ], '== casa atributos; = atribui. GROUP define o grupo e MODE 0660 libera dono e grupo. Outros ficam sem acesso: é o menor privilégio. O grupo precisa existir, e os membros são adicionados com usermod.'),
        mcq('q6', 'Após instalar um driver de GPU proprietário com Secure Boot ativo, o módulo não carrega e o dmesg fala em chave/assinatura ausente. Qual é a causa mais provável?', 'c', [
          'O linux-firmware está desatualizado e precisa ser removido para o módulo funcionar',
          'O udev bloqueou o módulo por falta de regra em /etc/udev/rules.d/, já que sem regra explícita nenhum módulo proprietário é aceito',
          'O Secure Boot recusa módulos não assinados; é preciso assinar o módulo e cadastrar a chave (MOK) ou ajustar o Secure Boot',
          'O driver proprietário só funciona em discos MBR, e o Secure Boot exige GPT'
        ], 'Com Secure Boot, o kernel só carrega módulos assinados por chave confiável. Drivers fora da árvore (DKMS) precisam de assinatura com a chave cadastrada.'),
        mcq('q7', 'Uma placa Wi-Fi nova não aparece como interface. lspci -nn mostra o dispositivo, mas lspci -k não mostra driver em uso. Qual é a melhor próxima ação?', 'a', [
          'Ver sudo dmesg ou journalctl -k em busca de erros e de pedido de firmware, e conferir se o linux-firmware tem o arquivo',
          'Rodar chmod 666 em todos os arquivos de /dev para liberar a placa',
          'Apagar /etc/udev/rules.d/ inteira e reinstalar o kernel',
          'Trocar a placa, pois dispositivo sem driver em uso é defeito de hardware confirmado, e pedir reembolso ao fabricante antes de qualquer outro teste de software'
        ], 'O hardware existe (aparece no lspci), então o problema é driver ou firmware. As mensagens do kernel indicam o que falta. chmod em /dev não ajuda e é inseguro.'),
        fill('q8', 'Complete o comando para o udev reler as regras depois de editar um arquivo .rules.', 'sudo udevadm ___ --reload', ['control'], 'udevadm control --reload recarrega as regras; udevadm trigger reaplica aos dispositivos existentes.')
      ]
    },
    {
      id: 'lni-03-pacotes-profundidade',
      title: 'Gerenciamento de pacotes em profundidade',
      goal: 'Entender as camadas dpkg/rpm e APT/DNF, repositórios e assinaturas, inspecionar pacotes, travar versões e avaliar com segurança fontes de software de terceiros.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Duas camadas: dpkg/rpm e APT/DNF',
            'Um pacote é um arquivo (.deb no mundo Debian, .rpm no Red Hat) com arquivos do programa, metadados e scripts de instalação. As ferramentas de baixo nível, dpkg e rpm, instalam, removem e consultam pacotes locais, mas NÃO baixam nada nem resolvem dependências: se faltar uma biblioteca, reclamam. As de alto nível, APT (apt) e DNF (dnf), consultam repositórios, calculam as dependências, baixam tudo e chamam dpkg/rpm para instalar.',
            'sudo dpkg -i app_1.0_amd64.deb   # baixo nível: pode falhar por dependência\nsudo apt install ./app_1.0_amd64.deb   # alto nível: resolve e baixa dependências\nsudo rpm -i app-1.0.x86_64.rpm\nsudo dnf install ./app-1.0.x86_64.rpm'
          ),
          sl(
            'Repositórios e chaves GPG',
            'Repositórios são servidores com pacotes e índices. No Debian/Ubuntu ficam em /etc/apt/sources.list e em arquivos de /etc/apt/sources.list.d/; no Fedora/RHEL, arquivos .repo em /etc/yum.repos.d/. Para garantir que o pacote é autêntico e não foi alterado, os repositórios são assinados com chaves GPG: o gerenciador confere a assinatura com a chave pública que você confiou. Adicionar um repositório significa confiar nele para instalar código como root. No APT atual, a chave fica num arquivo próprio referenciado por signed-by (o antigo apt-key é obsoleto).',
            '# exemplo de arquivo .repo\n[exemplo]\nname=Repositorio de exemplo\nbaseurl=https://repo.exemplo.org/el/\$releasever/\nenabled=1\ngpgcheck=1\ngpgkey=https://repo.exemplo.org/chave.pub'
          ),
          sl(
            'Descobrir: o que o pacote contém e quem é dono do arquivo',
            'Duas perguntas inversas. "Que arquivos este pacote instalou?": dpkg -L <pacote> (Debian) ou rpm -ql <pacote> (Red Hat). "A qual pacote pertence este arquivo?": dpkg -S <caminho> ou rpm -qf <caminho>. Para listar o que está instalado: dpkg -l ou rpm -qa. São consultas somente de leitura, ótimas para investigar de onde veio um binário.',
            'dpkg -L curl | head -n 3\n# exemplo: /.  /usr  /usr/bin ...\ndpkg -S /usr/bin/curl\n# exemplo: curl: /usr/bin/curl\nrpm -qf /usr/bin/curl\n# exemplo: curl-...x86_64'
          ),
          sl(
            'Versões: policy, hold e pinning',
            'apt-cache policy <pacote> mostra a versão instalada (Installed), a candidata (Candidate: a que o apt instalaria) e de quais repositórios cada versão vem. Para impedir que um pacote seja atualizado: sudo apt-mark hold <pacote> (e unhold para soltar); no DNF existe o plugin versionlock. Já o pinning, em /etc/apt/preferences.d/, define prioridades entre repositórios/versões. Atenção: travar versão congela também as correções de segurança desse pacote, então use por pouco tempo e reavalie.',
            'apt-cache policy curl\n# exemplo (varia):\n# curl:\n#   Installed: <versao-instalada>\n#   Candidate: <versao-candidata>\n#   Version table: ...\nsudo apt-mark hold curl\napt-mark showhold'
          ),
          sl(
            'Compilar do código-fonte',
            'Às vezes só há o fonte (tarball). O ritual clássico é ./configure (verifica o ambiente e gera o Makefile), make (compila) e sudo make install (copia os arquivos). Por padrão instala em /usr/local, área reservada ao que o administrador instala por fora do gerenciador, evitando misturar com /usr. O problema: o gerenciador de pacotes não sabe o que foi instalado, então não consegue listar, atualizar nem remover limpo. Alternativas: usar o pacote da distribuição, gerar um pacote com ferramentas como checkinstall, ou instalar num prefixo próprio (./configure --prefix=...). Compile apenas fontes de origem confiável, conferindo a assinatura ou o hash divulgado.',
            './configure --prefix=/usr/local\nmake\nsudo make install     # arquivos ficam em /usr/local/bin, /usr/local/lib...\n# alternativa: sudo checkinstall  (gera um pacote e o instala, permitindo remoção limpa)'
          ),
          sl(
            'Snap, Flatpak e AppImage',
            'São formas de distribuir aplicativos com suas próprias dependências, independentes da distribuição. Snap (Canonical) e Flatpak rodam o app em sandbox com permissões declaradas e se atualizam por lojas/repositórios próprios (Flathub é o mais conhecido no Flatpak). AppImage é um único arquivo executável que roda sem instalação nem sandbox obrigatória: você baixa, dá permissão de execução e roda. Vantagem: versões novas e portabilidade; custo: mais espaço em disco e confiança na origem de quem empacotou.',
            'flatpak install flathub org.exemplo.App\nflatpak run org.exemplo.App\nsnap list\nchmod +x App-x86_64.AppImage && ./App-x86_64.AppImage'
          ),
          sl(
            'Terceiros e cadeia de suprimentos; atualizações automáticas',
            'Cada repositório, PPA, script de instalação ou pacote de terceiros é uma extensão da sua confiança: se o autor for comprometido, o código malicioso chega como "atualização" e roda como root (ataque à cadeia de suprimentos). Boas práticas: prefira os repositórios oficiais da distribuição, confira a origem e a assinatura da chave, desconfie de curl ... | sudo bash e remova o que não usa mais. Para correções de segurança, habilite atualizações automáticas só de segurança: unattended-upgrades (Debian/Ubuntu) ou dnf-automatic (Fedora/RHEL), com monitoramento de falhas.',
            'sudo apt install unattended-upgrades\nsudo dpkg-reconfigure -plow unattended-upgrades\n# Fedora/RHEL: sudo dnf install dnf-automatic'
          )
        ]
      },
      questions: [
        mcq('q1', 'Ao instalar um .deb com dpkg -i, aparece o erro "dependency problems". Por quê?', 'c', [
          'O arquivo .deb foi corrompido durante o download e precisa ser baixado de novo antes de qualquer instalação',
          'O arquivo .deb foi corrompido durante o download',
          'O dpkg é de baixo nível: não baixa nem resolve dependências; o apt install ./arquivo.deb faria isso',
          'O dpkg exige a opção --force-all antes de instalar qualquer pacote que não tenha vindo diretamente de um repositório'
        ], 'dpkg/rpm instalam o que você mandar; resolver e baixar dependências é função do APT/DNF.'),
        mcq('q2', 'Qual é a função das chaves GPG dos repositórios?', 'b', [
          'Criptografar o conteúdo dos pacotes para que ninguém na rede os leia durante o download, funcionando como o HTTPS dos espelhos',
          'Permitir conferir que os pacotes e índices vêm de quem você escolheu confiar e não foram alterados',
          'Limitar quantos usuários podem instalar pacotes por dia, bloqueando contas que excedam a cota definida no repositório',
          'Acelerar o download escolhendo o espelho mais próximo'
        ], 'A assinatura prova autenticidade e integridade; ela não cifra os dados. Adicionar uma chave é decidir confiar naquele repositório.'),
        mcq('q3', 'Neste trecho, qual versão o apt instalaria ao rodar apt install web?\nweb:\n  Installed: 1.0-1\n  Candidate: 1.2-3\n  Version table:\n     1.2-3 500\n *** 1.0-1 100', 'a', [
          '1.2-3, pois é a Candidate (a que o apt escolheu como a mais adequada)',
          '1.0-1, pois é a que tem os três asteriscos, marca usada pelo apt para indicar a versão que será mantida na atualização',
          '1.0-1, porque o número 100 ao lado dela indica a versão mais recente disponível no repositório',
          'Nenhuma: o apt exige informar a versão quando há duas disponíveis'
        ], 'Installed é a atual, Candidate é a que seria instalada. Os números são prioridades de pinning, não versões.'),
        fill('q4', 'Complete o comando (Debian/Ubuntu) que lista os arquivos instalados pelo pacote curl.', 'dpkg ___ curl', ['-L', '--listfiles'], 'dpkg -L lista os arquivos do pacote; o equivalente no RPM é rpm -ql.'),
        mcq('q5', 'O que faz sudo apt-mark hold nginx e qual é o cuidado?', 'd', [
          'Reinicia o nginx quando o pacote for atualizado',
          'Baixa o nginx, mas não o instala até confirmação',
          'Remove o nginx mantendo a configuração em /etc',
          'Impede que o pacote seja atualizado, o que também o deixa sem correções de segurança até ser liberado com unhold'
        ], 'hold congela a versão. É útil por pouco tempo; depois, reavalie ou use unhold.'),
        mcq('q6', 'Depois de sudo make install, por que o programa é difícil de manter?', 'c', [
          'Porque o make install só funciona para o usuário root',
          'Porque o binário fica sempre fora do PATH',
          'Porque o gerenciador de pacotes não registra o que foi copiado para /usr/local, então não lista, atualiza nem remove de forma limpa',
          'Porque programas compilados não recebem permissões de execução'
        ], 'Sem registro no gerenciador, a remoção é manual. Pacote da distribuição ou checkinstall resolvem isso.'),
        mcq('q7', 'Qual afirmação sobre AppImage e Flatpak é correta?', 'b', [
          'Ambos exigem que o aplicativo seja compilado a partir do fonte na sua máquina, usando as bibliotecas de desenvolvimento da distribuição, antes de poder ser executado',
          'Flatpak roda o aplicativo em sandbox com permissões declaradas; AppImage é um arquivo executável único que roda sem instalação',
          'AppImage atualiza sozinho todas as bibliotecas do sistema operacional',
          'Os dois são gerenciados pelo dpkg e aparecem em dpkg -l'
        ], 'Ambos trazem as próprias dependências. Em qualquer formato, vale confiar apenas na origem de quem empacotou.'),
        fill('q8', 'Complete o comando (Red Hat/Fedora) que mostra a qual pacote pertence o arquivo /usr/bin/ssh.', 'rpm ___ /usr/bin/ssh', ['-qf', '-q -f', '--query --file'], 'rpm -qf consulta o dono do arquivo; no Debian, dpkg -S faz o mesmo.')
      ]
    },
    {
      id: 'lni-04-usuarios-autenticacao-pam',
      title: 'Usuários e autenticação em profundidade',
      goal: 'Ler /etc/passwd e /etc/shadow, gerenciar contas e grupos, configurar sudo com segurança e entender o papel do PAM.',
      xp: 20,
      intro: {
        slides: [
          sl(
            '/etc/passwd: um registro por conta',
            'Cada linha de /etc/passwd tem 7 campos separados por dois-pontos: nome de login : senha (hoje só um x, indicando que o hash está em /etc/shadow) : UID : GID primário : comentário (GECOS) : diretório home : shell de login. O arquivo é legível por todos (programas precisam traduzir UID em nome), por isso nunca guarda segredos. Contas de serviço costumam ter UID baixo e um shell que impede o login.',
            'ana:x:1001:1001:Ana Exemplo:/home/ana:/bin/bash\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\n# campos: nome:senha:UID:GID:comentario:home:shell\nid ana\n# exemplo: uid=1001(ana) gid=1001(ana) groups=1001(ana),27(sudo)'
          ),
          sl(
            '/etc/shadow e /etc/gshadow: hashes e expiração',
            '/etc/shadow guarda o que é sensível e só root (e, em algumas distribuições, o grupo shadow) lê. Campos: nome : hash : último dia de troca (em dias desde 1970) : mínimo de dias entre trocas : máximo de dias de validade : dias de aviso : dias de inatividade : data de expiração da conta. O hash começa com um prefixo que indica o algoritmo, como $6$ (SHA-512) ou $y$ (yescrypt). Senha nunca fica em texto puro: o sistema só guarda o hash (com sal) e compara o hash do que você digitou. Um ! ou * no lugar do hash significa que não há login por senha (conta bloqueada ou sem senha). /etc/gshadow faz o papel equivalente para grupos.',
            'ana:$6$<sal>$<hash-fictício>:20000:0:90:7:::\n# ! ou * no campo do hash = login por senha impossível\nsudo chage -l ana\n# exemplo: Last password change : ...\n#          Password expires      : ...'
          ),
          sl(
            'useradd, usermod, userdel e chage; grupos',
            'useradd -m -s /bin/bash ana cria a conta (-m cria o home, -s define o shell); passwd ana define a senha; userdel -r ana remove a conta e o home. usermod altera contas existentes. Todo usuário tem um grupo primário (campo GID do passwd, dono padrão dos arquivos que cria) e pode ter grupos suplementares. ARMADILHA: usermod -G docker ana SUBSTITUI todos os suplementares; para adicionar, use usermod -aG docker ana (-a = append). chage ajusta a validade da senha: -M 90 (máximo de dias), -E AAAA-MM-DD (expiração da conta), -l (lista).',
            'sudo useradd -m -s /bin/bash ana\nsudo passwd ana\nsudo usermod -aG sudo ana     # acrescenta; sem -a, substitui\nsudo chage -M 90 ana\nsudo userdel -r ana           # remove também o home (cuidado: apaga dados)'
          ),
          sl(
            'sudoers, visudo e sudoers.d',
            'O sudo consulta /etc/sudoers para saber quem pode rodar o quê como quem. Um erro de sintaxe nesse arquivo pode quebrar o sudo para todos, por isso edite SEMPRE com sudo visudo, que valida antes de salvar. Prefira acrescentar arquivos em /etc/sudoers.d/ (um por finalidade, com permissão 0440; nomes com ponto ou terminados em ~ são ignorados), em vez de mexer no arquivo principal. Formato: quem  máquina=(como-quem)  comandos. Grupos levam % na frente. Exemplo: ana ALL=(ALL:ALL) ALL libera tudo.',
            'sudo visudo -f /etc/sudoers.d/deploy\n# conteúdo do arquivo:\ndeploy ALL=(root) /usr/bin/systemctl restart app\n%admin ALL=(ALL:ALL) ALL'
          ),
          sl(
            'NOPASSWD e seus riscos',
            'A tag NOPASSWD: dispensa a senha. É conveniente em automações, mas qualquer sessão comprometida da conta (um script, uma chave SSH roubada, um terminal esquecido) vira root sem barreira. Reduza o risco: libere só os comandos exatos necessários (caminho completo e argumentos), nunca ALL; evite comandos que abrem shell ou editores (vim, less, bash), pois permitem escapar para um shell de root. Registre o uso: o sudo grava cada comando em log (por exemplo, no journal ou em /var/log/auth.log).',
            '# ruim: qualquer comando como root, sem senha\ndeploy ALL=(ALL) NOPASSWD: ALL\n# melhor: um comando específico\ndeploy ALL=(root) NOPASSWD: /usr/bin/systemctl restart app'
          ),
          sl(
            'PAM: a pilha de autenticação',
            'PAM (Pluggable Authentication Modules) é a camada que programas como login, sshd e sudo usam para autenticar; a política fica em /etc/pam.d/<serviço>, sem recompilar nada. Cada linha tem tipo, flag de controle e módulo. Os tipos formam pilhas: auth (quem é você? senha, MFA), account (a conta pode entrar agora? expirada, bloqueada, horário), password (regras para trocar a senha) e session (preparar/encerrar a sessão). As flags: required (precisa passar, mas continua avaliando), requisite (falhou, para na hora), sufficient (passou, encerra com sucesso se nada required falhou antes), optional. Exemplos de módulos: pam_unix (senhas locais) e pam_faillock (bloqueio após falhas). Cuidado: um erro em /etc/pam.d pode trancar todos fora; mantenha uma sessão root aberta enquanto testa.',
            'auth     required   pam_faillock.so preauth\nauth     sufficient pam_unix.so\nauth     required   pam_deny.so\naccount  required   pam_unix.so'
          ),
          sl(
            'Bloqueio, contas de serviço e auditoria de acessos',
            'faillock (pam_faillock; em sistemas mais antigos pam_tally2) conta falhas de login e bloqueia a conta temporariamente: faillock --user ana mostra as falhas e faillock --user ana --reset limpa. Contas de serviço (que rodam daemons) não devem ter login: crie com useradd --system --shell /usr/sbin/nologin. Bloquear senha: usermod -L ana (usermod -U desbloqueia); expirar conta: usermod -e AAAA-MM-DD. Para auditar: last mostra logins anteriores (/var/log/wtmp), lastb as tentativas FALHAS (/var/log/btmp, exige root) e w quem está logado agora e o que executa.',
            'sudo useradd --system --shell /usr/sbin/nologin --no-create-home meuapp\nsudo usermod -L ana\nlast -n 3\nsudo lastb -n 3\nw'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que indica esta linha de /etc/passwd?\nmeuapp:x:998:998:Servico do app:/var/lib/meuapp:/usr/sbin/nologin', 'b', [
          'Que a senha da conta é a letra x, guardada sem criptografia no próprio arquivo /etc/passwd, que qualquer usuário da máquina consegue ler',
          'Que é uma conta de serviço sem login interativo: o shell nologin recusa sessões; o hash (se houver) fica em /etc/shadow',
          'Que a conta pertence ao grupo 998 e ao usuário root',
          'Que o diretório /var/lib/meuapp é o shell da conta e que o programa nologin será executado ao abrir cada sessão do serviço de rede'
        ], 'O x remete ao /etc/shadow. O shell /usr/sbin/nologin impede login interativo, típico de contas de serviço.'),
        mcq('q2', 'No campo do hash de /etc/shadow aparece um ! no lugar do hash. O que significa?', 'd', [
          'A senha expirou e precisa ser trocada no próximo login',
          'A senha está em texto puro e deve ser trocada',
          'A conta foi removida, mas ainda consta no arquivo',
          'Não há login por senha possível (conta bloqueada ou sem senha definida)'
        ], 'Um ! (ou *) não corresponde a nenhum hash válido, então nenhuma senha digitada confere.'),
        mcq('q3', 'Ana está nos grupos sudo e docker. Você roda sudo usermod -G docker ana. Qual o resultado?', 'a', [
          'Ana fica só com docker como suplementar: perde sudo, pois sem -a o comando substitui a lista',
          'Ana fica nos grupos sudo e docker, pois a opção -G acrescenta o novo grupo à lista de suplementares já existente',
          'Ana passa a ter docker como grupo primário e sudo como suplementar, na ordem em que aparecem em /etc/group',
          'O comando falha porque Ana já pertence a um grupo suplementar'
        ], 'Use usermod -aG docker ana para acrescentar. Sem -a, a lista de suplementares é substituída.'),
        fill('q4', 'Complete o comando para editar o arquivo sudoers com validação de sintaxe antes de salvar.', 'sudo ___', ['visudo'], 'visudo bloqueia o arquivo e valida a sintaxe; um sudoers quebrado pode impedir o uso do sudo.'),
        mcq('q5', 'Qual regra de sudoers é a mais segura para uma conta de deploy que precisa reiniciar um serviço?', 'c', [
          'deploy ALL=(ALL) NOPASSWD: /usr/bin/systemctl *, /usr/bin/journalctl *',
          'deploy ALL=(ALL) NOPASSWD: /usr/bin/vim, /usr/bin/less',
          'deploy ALL=(root) NOPASSWD: /usr/bin/systemctl restart app',
          'deploy ALL=(ALL) ALL com a senha de root compartilhada na equipe'
        ], 'Menor privilégio: um único comando com argumentos fixos. vim e less permitem escapar para um shell de root.'),
        mcq('q6', 'Num arquivo de /etc/pam.d, o que representa o tipo account?', 'b', [
          'Confere a senha digitada contra o hash armazenado e, se estiver correta, libera o acesso ao sistema',
          'Verifica se a conta pode entrar agora (expirada, bloqueada, restrição de horário)',
          'Define as regras para troca de senha',
          'Executa tarefas ao abrir e fechar a sessão, como montar o diretório home do usuário e registrar o início do login no log'
        ], 'auth verifica identidade; account verifica a validade/permissão da conta; password cuida da troca; session prepara a sessão.'),
        mcq('q7', 'Você suspeita de tentativas de adivinhar senhas. Qual comando lista os logins que FALHARAM?', 'c', [
          'last -n 20 -f /var/log/wtmp',
          'w -h -s',
          'sudo lastb',
          'id ana && last ana'
        ], 'lastb lê /var/log/btmp, que registra as tentativas falhas. last mostra os logins bem-sucedidos.'),
        fill('q8', 'Complete o comando que lista a política de validade da senha da conta ana (dias até expirar etc.).', 'sudo ___ -l ana', ['chage'], 'chage -l lista os dados de expiração; -M, -E e outras opções os alteram.')
      ]
    },
    {
      id: 'lni-37-autenticacao-centralizada',
      title: 'Autenticação centralizada: LDAP, SSSD e Kerberos',
      goal: 'Entender como máquinas Linux usam um diretório central (LDAP, Kerberos, AD/FreeIPA) via NSS, PAM e SSSD, e os cuidados de segurança e de proteção de dados pessoais.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que centralizar identidades',
            'Com poucas máquinas, contas locais em /etc/passwd resolvem. Com dezenas, criar o mesmo usuário em cada uma vira trabalho e risco: contas esquecidas após um desligamento, senhas diferentes por servidor, nenhuma visão central de quem acessa o quê. Um diretório central guarda usuários e grupos em um só lugar; as máquinas consultam esse serviço. Ganhos: criação e remoção em um ponto, senha única (ou login único), políticas e auditoria centralizadas. Custo: o diretório vira peça crítica, e precisa ser protegido e ter redundância.',
            'Antes: conta em cada servidor (/etc/passwd x N)\nDepois: servidor -> consulta -> diretório central (LDAP/AD/FreeIPA)'
          ),
          sl(
            'LDAP: a árvore de diretório',
            'LDAP é um protocolo para consultar um diretório organizado como árvore. Cada entrada tem um nome distinto (DN), que é o caminho único até ela, lido da folha para a raiz: uid=maria,ou=pessoas,dc=example,dc=org (dc = componente de domínio, ou = unidade organizacional). Uma entrada tem atributos (uid, cn, mail, uidNumber, memberOf...). A consulta usa uma base (-b), um filtro e, se preciso, uma conta de leitura (bind DN). Use ldaps:// ou StartTLS para proteger a conexão.',
            'ldapsearch -x -H ldaps://ldap.example.org -D "cn=leitor,dc=example,dc=org" -W -b "ou=pessoas,dc=example,dc=org" "(uid=maria)" cn uidNumber\n# -x senha simples  -H servidor  -D conta  -W pede a senha  -b base\n# exemplo: dn: uid=maria,ou=pessoas,dc=example,dc=org'
          ),
          sl(
            'NSS e PAM: duas perguntas diferentes',
            'O Linux faz duas perguntas distintas. NSS responde "quem é esse usuário/grupo?" (UID, home, shell); o arquivo /etc/nsswitch.conf diz em que fontes procurar e em que ordem. PAM responde "esta senha vale? esta conta pode entrar?" e é configurado em /etc/pam.d/. Para usar um diretório, o NSS ganha a fonte sss e o PAM ganha o módulo pam_sss. O comando getent consulta o NSS e mostra o que o sistema enxerga, locais e remotos.',
            '# /etc/nsswitch.conf (trecho, exemplo)\npasswd: files sss\ngroup:  files sss\n# lê /etc/passwd primeiro; se não achar, pergunta ao SSSD\n\ngetent passwd maria\n# exemplo: maria:*:10001:10001:<nome>:/home/maria:/bin/bash'
          ),
          sl(
            'SSSD, cache offline e realm join',
            'O SSSD é o serviço intermediário: fala com LDAP, Kerberos, AD ou FreeIPA, guarda cache e entrega o resultado ao NSS e ao PAM. Sua configuração fica em /etc/sssd/sssd.conf, que deve pertencer ao root com permissão 0600, pois pode ter dados sensíveis, ou o serviço não inicia. Com cache_credentials = True, o usuário consegue entrar mesmo com o servidor inacessível (modo offline, útil em notebooks). Em redes AD ou FreeIPA, o realmd automatiza a ligação: realm discover descobre o domínio, e realm join o ingressa (instalando e configurando SSSD, Kerberos e PAM). Para criar o diretório pessoal no primeiro login, ative o mkhomedir (pam_mkhomedir ou oddjob-mkhomedir).',
            '# /etc/sssd/sssd.conf (visão geral, exemplo)\n[sssd]\ndomains = example.org\n[domain/example.org]\nid_provider = ad\ncache_credentials = True\n\nrealm discover example.org\nsudo realm join example.org -U <administrador>\nrealm list'
          ),
          sl(
            'Kerberos: tickets em vez de senha na rede',
            'Kerberos autentica por tickets, sem enviar a senha pela rede. O usuário prova quem é ao KDC (Key Distribution Center) e recebe um TGT (ticket-granting ticket); com ele pede tickets de serviço a cada serviço (SSH, arquivos), que têm validade limitada e permitem login único (SSO). kinit usuario@EXAMPLE.ORG obtém o TGT, klist lista os tickets e kdestroy os apaga. O realm costuma ser escrito em maiúsculas. Duas dependências: relógios sincronizados (diferença de poucos minutos entre cliente e KDC faz a autenticação falhar; use NTP/chrony) e DNS correto (Kerberos localiza o KDC e os serviços por nome).',
            'kinit maria@EXAMPLE.ORG\nklist\n# exemplo (varia):\n# Ticket cache: ...\n# Default principal: maria@EXAMPLE.ORG\n# krbtgt/EXAMPLE.ORG@EXAMPLE.ORG   <- o TGT\nkdestroy'
          ),
          sl(
            'sudo, SSH e usuários centrais; riscos',
            'Com o SSSD, usuários do diretório entram por SSH como os locais (o sshd usa o PAM, UsePAM yes). Para administração, dê sudo a um grupo central, não a pessoas: uma linha em /etc/sudoers.d/ (editada com visudo -f) como %admins-ti ALL=(ALL) ALL. Assim, quem sai do grupo perde o sudo em todas as máquinas. Riscos: LDAP em texto puro (ldap:// sem TLS) expõe senhas e dados na rede, então exija ldaps:// ou StartTLS; a conta de serviço usada para consultar o diretório deve ter só leitura do necessário, pois uma conta poderosa comprometida compromete todos; e a queda do diretório é mitigada por réplicas e pelo cache do SSSD.',
            '# /etc/sudoers.d/ti  (editar com: sudo visudo -f /etc/sudoers.d/ti)\n%admins-ti ALL=(ALL) ALL\n\n# /etc/ssh/sshd_config\nUsePAM yes'
          ),
          sl(
            'LGPD: o diretório é uma base de dados pessoais',
            'Nome, usuário, e-mail, cargo, horários de acesso e logs de login são dados pessoais. Logo, o diretório e seus logs devem seguir os princípios da LGPD (Lei 13.709/2018): coletar o mínimo necessário (finalidade), restringir o acesso a quem precisa (quem pode consultar ou editar o diretório, com contas nominais e privilégio mínimo), registrar quem acessou e alterou (auditoria), proteger com TLS e backups cifrados e guardar logs só pelo tempo necessário. No desligamento de um colaborador, desative a conta e remova dos grupos no mesmo dia, para encerrar acessos, e depois apague ou anonimize os dados conforme a política de retenção da organização. Este conteúdo é uma introdução técnica e não substitui orientação jurídica ou do encarregado (DPO) da sua organização.',
            '# checklist de desligamento (exemplo)\n1. desativar a conta no diretório\n2. remover de grupos (sudo, VPN, sistemas)\n3. revogar chaves SSH e tokens\n4. aplicar a política de retenção de dados'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é o principal ganho de segurança operacional de centralizar usuários num diretório?', 'c', [
          'Eliminar a necessidade de senhas e de TLS, pois o diretório autentica pelo endereço IP',
          'Fazer o /etc/passwd de cada servidor ficar vazio e assim impedir qualquer conta local',
          'Criar, alterar e desativar contas e grupos em um ponto só, evitando contas esquecidas após desligamentos e dando visão central de acessos',
          'Tornar cada servidor independente, para que a queda do diretório não afete nenhum login'
        ], 'Um ponto central reduz contas órfãs e permite política e auditoria únicas. O custo é que o diretório vira peça crítica, daí réplicas e cache.'),
        mcq('q2', 'Em "uid=maria,ou=pessoas,dc=example,dc=org", o que é essa string e como se lê?', 'a', [
          'É um DN: o caminho único da entrada na árvore LDAP, lido da folha (a pessoa) até a raiz (o domínio)',
          'É uma URL que o navegador abre para listar as pessoas do domínio',
          'É uma senha codificada em partes, onde cada componente dc é um caractere',
          'É um endereço de e-mail escrito com vírgulas para uso em arquivos de configuração do Kerberos, usado para sincronizar o relógio entre cliente e KDC'
        ], 'O DN (distinguished name) identifica a entrada: uid é o atributo da folha, ou é a unidade organizacional e dc os componentes do domínio.'),
        mcq('q3', 'No arquivo /etc/nsswitch.conf aparece "passwd: files sss". Qual é o significado?', 'd', [
          'Senhas de usuários são buscadas só no SSSD, ignorando totalmente /etc/passwd',
          'Os arquivos de grupo são verificados pelo Kerberos, depois por arquivos locais, conforme a ordem definida em /etc/krb5.conf para cada tipo de banco',
          'O PAM deve consultar o SSSD antes de qualquer outro módulo de autenticação',
          'Ao resolver um usuário, o sistema consulta primeiro os arquivos locais (/etc/passwd) e, se não achar, o SSSD'
        ], 'O NSS lê as fontes em ordem. files é local e sss é o SSSD. PAM é configurado em /etc/pam.d/, não aqui.'),
        fill('q4', 'Complete o comando que lista os tickets Kerberos do usuário atual.', '___', ['klist'], 'klist exibe o cache de tickets, incluindo o TGT (krbtgt). kinit obtém e kdestroy apaga.'),
        mcq('q5', 'Um cliente Linux não consegue obter ticket (kinit falha com erro de diferença de relógio) apesar de a senha estar correta. Qual é a causa mais provável e a correção?', 'b', [
          'A senha expirou; a correção é editar o /etc/passwd local para renová-la',
          'O relógio do cliente está muito diferente do KDC; sincronize com NTP/chrony e confira o DNS',
          'O realm foi escrito em maiúsculas; a correção é usar minúsculas em todos os comandos kerberos',
          'O sudoers não tem o grupo central; a correção é adicionar a linha em /etc/sudoers.d/'
        ], 'Kerberos usa timestamps nos tickets e tolera pouca diferença de relógio. NTP e DNS corretos são pré-requisitos.'),
        mcq('q6', 'Qual configuração expõe senhas na rede ao consultar um diretório LDAP?', 'd', [
          'Usar ldaps:// para o servidor, com o certificado validado pelo cliente',
          'Usar ldap:// com StartTLS obrigatório antes de enviar a senha',
          'Usar uma conta de serviço com permissão só de leitura nos atributos necessários, compartilhada entre todos os servidores da empresa',
          'Usar ldap:// em texto puro com autenticação simples (bind com senha) em rede não confiável'
        ], 'Bind simples sobre ldap:// sem TLS trafega a senha legível. Use ldaps:// ou StartTLS e uma conta de serviço de privilégio mínimo.'),
        mcq('q7', 'Um colaborador foi desligado. Do ponto de vista técnico e da LGPD, qual conduta é adequada?', 'a', [
          'Desativar a conta e remover dos grupos (sudo, VPN, sistemas) o quanto antes, revogar chaves/tokens e aplicar a política de retenção aos dados e logs, sem apagar tudo sem critério',
          'Esperar a próxima auditoria anual e manter a conta ativa para consultas eventuais',
          'Apagar todos os logs do servidor para eliminar qualquer dado pessoal, inclusive os de auditoria de terceiros',
          'Trocar apenas o nome da conta e manter as permissões, para preservar o histórico'
        ], 'Acesso deve ser encerrado logo; os dados seguem a retenção definida (finalidade, necessidade). Apagar logs indiscriminadamente prejudica a auditoria. Não substitui orientação jurídica.'),
        fill('q8', 'Complete o comando que mostra como o sistema enxerga o usuário maria, seja local ou vindo do SSSD.', 'getent ___ maria', ['passwd'], 'getent consulta as bases do NSS (passwd, group...) na ordem do nsswitch.conf.')
      ]
    },
    {
      id: 'lni-05-permissoes-avancadas-acl',
      title: 'Permissões avançadas, ACLs e controle de acesso',
      goal: 'Usar setuid/setgid/sticky, ACLs, atributos de arquivo, umask e capabilities, e entender o papel de SELinux e AppArmor sem desativá-los.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'setuid, setgid e sticky bit',
            'Além de rwx, existem três bits especiais. setuid (4) em um executável faz o programa rodar com os privilégios do DONO do arquivo, não de quem o chamou: é como o passwd, de usuário comum, consegue escrever em /etc/shadow. setgid (2) em executável roda com o grupo do arquivo; em DIRETÓRIO, os arquivos novos herdam o grupo do diretório (ótimo para pastas de equipe). sticky (1) em diretório permite apagar ou renomear um arquivo só ao dono dele (ou ao dono do diretório/root): é o t de /tmp. No ls -l, aparecem como s no lugar do x do dono (setuid), s no do grupo (setgid) e t no de outros (sticky); S ou T maiúsculos indicam o bit ligado sem a permissão x.',
            'ls -l /usr/bin/passwd\n# exemplo: -rwsr-xr-x 1 root root ... /usr/bin/passwd\nls -ld /tmp\n# exemplo: drwxrwxrwt ... /tmp'
          ),
          sl(
            'chmod com os bits especiais',
            'Simbolicamente: chmod u+s programa (setuid), chmod g+s pasta (setgid), chmod +t pasta (sticky). Em octal, um quarto dígito à esquerda soma 4 (setuid), 2 (setgid) e 1 (sticky): 4755 = setuid + rwxr-xr-x; 2775 em uma pasta de equipe = setgid + rwxrwxr-x; 1777 = sticky + rwxrwxrwx (o padrão de /tmp). Para os dígitos normais: r=4, w=2, x=1.',
            'chmod 2775 /srv/projeto      # setgid: arquivos novos herdam o grupo\nchmod 1777 /srv/publico       # sticky: só o dono apaga o próprio arquivo\nchmod u+s ./meu_programa      # setuid (cuidado)\nls -ld /srv/projeto\n# exemplo: drwxrwsr-x ... /srv/projeto'
          ),
          sl(
            'Por que setuid é perigoso e como auditar',
            'Um programa setuid de root com uma falha (estouro de memória, comando externo chamado sem caminho completo, opção que abre um shell) entrega root a quem o explorar. Por isso o conjunto de binários setuid deve ser mínimo e conhecido. Auditoria: find / -perm -4000 -type f 2>/dev/null lista os arquivos com setuid (-perm -4000 = "tem esse bit ligado"); compare a lista com o esperado e investigue novidades. O Linux ignora setuid em scripts interpretados, e partições com a opção de montagem nosuid desativam o efeito do bit (bom para /tmp e mídias externas).',
            'find / -perm -4000 -type f 2>/dev/null\n# exemplo (varia): /usr/bin/passwd  /usr/bin/sudo  /usr/bin/mount ...\nfind / -perm -2000 -type f 2>/dev/null   # setgid'
          ),
          sl(
            'ACLs POSIX: getfacl e setfacl',
            'As permissões dono/grupo/outros não expressam "dar leitura só à Ana e escrita à equipe X". ACLs (listas de controle de acesso) adicionam entradas por usuário ou grupo. setfacl -m u:ana:rw relatorio.txt dá rw à Ana; setfacl -m g:equipe:rx pasta faz o mesmo para um grupo; getfacl mostra tudo; setfacl -x u:ana remove uma entrada e setfacl -b remove todas. O ls -l passa a mostrar um + ao fim das permissões. A máscara (mask) é o teto das permissões de usuários/grupos nomeados: se a máscara for r--, a entrada rw da Ana vale só r (o getfacl mostra #effective). ACL padrão (setfacl -d -m ...) em um diretório é herdada pelos arquivos criados dentro dele.',
            'setfacl -m u:ana:rw relatorio.txt\ngetfacl relatorio.txt\n# exemplo:\n# user::rw-\n# user:ana:rw-\n# group::r--\n# mask::rw-\n# other::r--\nsetfacl -d -m g:equipe:rwx /srv/projeto   # padrão para novos arquivos'
          ),
          sl(
            'chattr e lsattr: atributos de arquivo',
            'Em sistemas como ext4 e XFS, atributos extras ficam num nível abaixo das permissões. lsattr os lista; chattr os altera. O +i (imutável) impede que o arquivo seja alterado, apagado, renomeado ou ganhe novos links — até pelo root, que precisa antes executar chattr -i. O +a (append-only) só permite acrescentar dados, útil para logs. Serve para proteger arquivos críticos, mas lembre-se de que root pode retirar o atributo: não substitui o controle de acesso.',
            'sudo chattr +i /etc/resolv.conf\nlsattr /etc/resolv.conf\n# exemplo: ----i---------e------- /etc/resolv.conf\nsudo rm /etc/resolv.conf\n# exemplo: rm: cannot remove ...: Operation not permitted\nsudo chattr -i /etc/resolv.conf'
          ),
          sl(
            'umask em profundidade',
            'O umask é uma máscara que REMOVE permissões de arquivos e diretórios novos. A base é 666 para arquivos (o sistema não cria arquivo executável por padrão) e 777 para diretórios; cada bit ligado no umask é desligado do resultado. Cálculo: umask 022 -> arquivos 644, diretórios 755. umask 027 -> arquivos 640, diretórios 750 (outros sem acesso). umask 077 -> arquivos 600, diretórios 700 (só o dono). Conferido no shell: o resultado é base AND NOT umask.',
            'umask            # mostra o atual, ex.: 0022\numask 027\ntouch a; mkdir d\nls -ld a d\n# a -> -rw-r----- ; d -> drwxr-x---\nfor u in 022 027 077; do printf \'%s -> arq %03o dir %03o\\n\' $u $((0666 & ~0$u)) $((0777 & ~0$u)); done\n# 022 -> arq 644 dir 755\n# 027 -> arq 640 dir 750\n# 077 -> arq 600 dir 700'
          ),
          sl(
            'Capabilities, SELinux e AppArmor',
            'Capabilities dividem o poder do root em partes: em vez de setuid root, dê só a que o programa precisa. Exemplo: cap_net_bind_service permite abrir portas abaixo de 1024 sem ser root. getcap -r /usr/bin lista; setcap cap_net_bind_service+ep /usr/local/bin/app concede. SELinux (Fedora/RHEL) e AppArmor (Ubuntu/SUSE/Debian) são controle de acesso obrigatório (MAC): mesmo sendo dono ou root, o processo só faz o que a política do seu contexto/perfil permite. No SELinux, arquivos e processos têm contextos (ls -Z, ps -Z) e o modo é visto com getenforce: Enforcing (aplica), Permissive (só registra) ou Disabled. Diante de um bloqueio, NÃO desative o SELinux: leia o log (audit), corrija o contexto (restorecon) ou ajuste a política; setenforce 0 serve só para confirmar rapidamente que é o SELinux e deve ser revertido. No AppArmor, aa-status mostra os perfis em enforce/complain.',
            'getenforce\n# exemplo: Enforcing\nls -Z /var/www/html\n# exemplo: unconfined_u:object_r:httpd_sys_content_t:s0 ...\nsudo restorecon -Rv /var/www/html\nsudo aa-status        # AppArmor\nsudo setcap cap_net_bind_service+ep /usr/local/bin/app\ngetcap /usr/local/bin/app'
          )
        ]
      },
      questions: [
        mcq('q1', 'Que informação importante traz a saída abaixo?\n-rwsr-xr-x 1 root root 59976 ... /usr/bin/exemplo', 'd', [
          'O programa só pode ser executado pelo root',
          'O grupo root é o dono herdado dos arquivos criados pelo programa',
          'O programa não tem nenhuma permissão de execução',
          'O bit setuid está ligado: quem executar o programa o roda com os privilégios do dono (root)'
        ], 'O s no lugar do x do dono indica setuid. É por isso que a lista desses arquivos precisa ser curta e auditada.'),
        mcq('q2', 'Com umask 027, quais permissões recebem um arquivo e um diretório recém-criados?', 'a', [
          'Arquivo 640 e diretório 750',
          'Arquivo 750 e diretório 640',
          'Arquivo 027 e diretório 027',
          'Arquivo 666 e diretório 777, pois o umask só vale para o root'
        ], 'Arquivos partem de 666 e diretórios de 777; remove-se o 027: 666 -> 640 e 777 -> 750.'),
        mcq('q3', 'O que significa o t em drwxrwxrwt, a permissão de /tmp?', 'c', [
          'Que o diretório é temporário e é apagado a cada hora',
          'Que só o root pode criar arquivos ali',
          'Sticky bit: todos criam arquivos, mas cada um só apaga ou renomeia os seus (além do dono do diretório e do root)',
          'Que os arquivos do diretório são transmitidos via rede (transfer)'
        ], 'O sticky bit (1777) evita que um usuário apague os arquivos dos outros em diretórios compartilhados.'),
        fill('q4', 'Complete o comando que lista, para auditoria, todos os arquivos regulares com o bit setuid ligado.', 'find / -perm ___ -type f 2>/dev/null', ['-4000', '/4000', '-u=s', '/u=s'], '-perm -4000 casa arquivos com o bit setuid; compare o resultado com o conjunto esperado.'),
        mcq('q5', 'Após setfacl -m u:ana:rw relatorio.txt, o getfacl mostra mask::r-- e user:ana:rw- #effective:r--. Qual a leitura?', 'b', [
          'Ana tem rw, pois a entrada nomeada do usuário prevalece sobre a máscara, que só afeta o grupo dono do arquivo',
          'A máscara limita as permissões de usuários e grupos nomeados: Ana efetivamente só lê',
          'A ACL foi removida pela máscara e restam só as permissões básicas de dono, grupo e outros',
          'O dono do arquivo perdeu a leitura por causa da máscara'
        ], 'A máscara é o teto das entradas nomeadas e do grupo; só o dono e "outros" ficam fora dela.'),
        mcq('q6', 'Depois de sudo chattr +i /etc/exemplo.conf, o root tenta rm /etc/exemplo.conf. O que acontece?', 'c', [
          'O arquivo é removido, pois root ignora atributos e o chattr +i só vale para usuários comuns da máquina',
          'O arquivo é movido para a lixeira do sistema',
          'A remoção falha com "Operation not permitted" até que o atributo seja retirado com chattr -i',
          'O arquivo é removido, porque o root ignora atributos, e o atributo +i passa a valer para o diretório que o continha'
        ], 'Imutável bloqueia alteração, remoção e renomeação, inclusive para o root.'),
        mcq('q7', 'Um servidor Apache em Fedora recebe "Permission denied" ao ler arquivos novos em /var/www, mas as permissões de arquivo estão certas. Qual é a abordagem correta?', 'a', [
          'Verificar o log de auditoria e o contexto SELinux (ls -Z) e corrigir com restorecon; setenforce 0 só como teste temporário',
          'Executar setenforce 0 e deixar assim definitivamente, pois o SELinux só atrapalha servidores web em produção, como a maioria dos tutoriais recomenda',
          'Dar chmod -R 777 em todo o /var/www e reiniciar o Apache, já que permissões abertas resolvem qualquer negação de acesso do sistema',
          'Desinstalar o Apache e usar outro servidor web'
        ], 'Contextos SELinux são uma camada além das permissões. Corrija o contexto; desativar o SELinux remove uma proteção importante.'),
        fill('q8', 'Complete o comando que permite ao programa abrir portas abaixo de 1024 sem rodar como root.', 'sudo ___ cap_net_bind_service+ep /usr/local/bin/app', ['setcap'], 'setcap concede capabilities a um executável; getcap as consulta. Melhor que setuid root: privilégio mínimo.')
      ]
    },
    {
      id: 'lni-06-processos-profundidade',
      title: 'Processos em profundidade',
      goal: 'Entender como processos nascem e morrem, inspecioná-los em /proc, controlá-los com sinais, prioridades e limites, e executá-los de forma robusta.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'fork, exec e a árvore de processos',
            'Todo processo nasce de outro. fork() cria uma cópia do processo atual (o filho, com novo PID e o PPID do pai); exec() troca o programa em execução dentro do processo por outro. É assim que o shell roda "ls": faz fork e, no filho, exec de /bin/ls. O resultado é uma árvore, cuja raiz é o PID 1 (systemd). pstree a desenha e ps -ef --forest mostra com PID e PPID. Se um pai morre antes dos filhos, estes ficam órfãos e são adotados pelo PID 1.',
            'pstree -p | head -n 4\n# exemplo: systemd(1)-+-sshd(850)---sshd(2210)---bash(2251)\nps -o pid,ppid,stat,cmd -p $$\n# exemplo: PID PPID STAT CMD / 2251 2210 Ss bash'
          ),
          sl(
            'Estados: R, S, D, Z, T',
            'A coluna STAT do ps indica o estado. R: executando (ou pronto para executar). S: dormindo, esperando um evento (interrompível). D: dormindo ininterruptível, normalmente aguardando E/S de disco ou rede — não responde a sinais até terminar, e muitos D prolongados indicam problema de armazenamento. T: parado (Ctrl+Z ou SIGSTOP). Z: zumbi — o processo terminou, mas o pai ainda não leu seu código de saída (wait()), então resta só uma entrada na tabela de processos. Um zumbi não consome CPU nem memória relevante e NÃO pode ser morto com kill (já morreu): resolve-se fazendo o pai coletá-lo ou encerrando o pai, quando o PID 1 o adota e limpa.',
            'ps aux | head -n 3\n# exemplo: USER PID %CPU %MEM VSZ RSS TTY STAT START TIME COMMAND\nps -eo pid,stat,cmd | awk \'$2 ~ /^Z/\'   # lista zumbis'
          ),
          sl(
            '/proc/<PID>/, lsof e strace',
            'Cada processo tem uma pasta em /proc/<PID>/: cmdline (a linha de comando, com argumentos separados por byte nulo), status (estado, UID, memória), fd/ (links para os arquivos abertos) e environ (variáveis de ambiente). Cuidado: segredos passados por variáveis de ambiente ou argumentos (senhas, tokens) ficam visíveis aí — environ só é legível pelo dono do processo e root, mas cmdline costuma ser legível por todos, e aparece no ps. Passe segredos por arquivo com permissão restrita, não por argumento. lsof lista arquivos e portas abertos (lsof -p PID; lsof -i :80). strace mostra as chamadas de sistema de um processo (strace -p PID, ou strace comando): poderoso para ver por que um programa trava ou falha ao abrir um arquivo; exige permissão sobre o processo e deve ser usado com critério.',
            'tr \'\\0\' \' \' < /proc/$$/cmdline; echo\n# exemplo: -bash\ngrep -E \'^(Name|State)\' /proc/$$/status\n# exemplo: Name: bash / State: S (sleeping)\nls -l /proc/$$/fd | head -n 4\nsudo lsof -i :22\nstrace -e trace=openat -p <PID>'
          ),
          sl(
            'Sinais e trap',
            'Sinais são avisos assíncronos enviados a um processo. kill -l lista todos. Os principais: SIGTERM (15, pedido educado de encerramento, padrão do kill; o programa pode tratar e limpar), SIGINT (2, Ctrl+C), SIGHUP (1, terminal fechado; muitos daemons o usam para recarregar a configuração), SIGKILL (9, mata na hora; NÃO pode ser capturado nem ignorado, sem limpeza) e SIGSTOP/SIGCONT (pausa e retoma). Prefira TERM e só use -9 se o processo não responder. Em scripts, trap comando SINAL define o que fazer ao receber o sinal, como apagar temporários.',
            'kill -TERM 2345        # igual a kill 2345\nkill -9 2345           # último recurso\nkill -HUP 850          # muitos daemons recarregam a configuração\ntrap \'echo limpando; exit 1\' INT TERM   # no script'
          ),
          sl(
            'Prioridades e limites: nice, renice, ionice, ulimit',
            'nice ajusta a prioridade de CPU de um processo novo: vai de -20 (mais prioridade) a 19 (menos); o padrão é 0, e só o root pode usar valores negativos. nice -n 10 comando roda "com educação", cedendo CPU; renice -n 5 -p PID muda um processo já em execução. ionice -c 3 comando (classe idle) só usa o disco quando ninguém mais precisa — ideal para backups. ulimit mostra/define limites do shell e seus filhos: ulimit -n (arquivos abertos), ulimit -a (todos). Limites impedem que um processo descontrolado consuma todos os recursos.',
            'nice -n 10 tar czf /tmp/copia.tgz /srv/dados\nrenice -n 5 -p 2345\nionice -c 3 rsync -a /srv/dados/ /mnt/backup/\nulimit -n\n# exemplo: 1024'
          ),
          sl(
            'nohup, disown, setsid, timeout, pgrep/pkill e cgroups',
            'Fechar o terminal envia SIGHUP aos processos da sessão. nohup comando & ignora o HUP (saída vai para nohup.out); disown tira um job já iniciado da lista do shell para não receber o HUP; setsid roda o comando numa nova sessão, desligado do terminal. timeout 5 comando encerra o comando se passar de 5 segundos e retorna o código 124. pgrep -a nome lista PIDs por nome e pkill -f padrão envia sinal por padrão da linha de comando — confira sempre com pgrep antes, pois um padrão amplo pode atingir processos demais. Os cgroups são o recurso do kernel que agrupa processos e limita CPU, memória e E/S (a base dos containers e do systemd): systemd-cgls mostra a hierarquia.',
            'nohup ./coletor.sh > coletor.log 2>&1 &\nsetsid ./job.sh > /dev/null 2>&1 < /dev/null &\ntimeout 5 sleep 30; echo $?\n# saída: 124\npgrep -a sshd\nsystemd-cgls | head'
          )
        ]
      },
      questions: [
        mcq('q1', 'Como o shell executa o comando ls?', 'b', [
          'Carrega o código do ls dentro do próprio shell, sem criar processo, o que explica por que o ls não aparece em ps',
          'Faz fork (cria um filho) e, no filho, exec troca o programa por /bin/ls',
          'Cria um container isolado com o ls instalado',
          'Pede ao PID 1 (systemd) para iniciar o ls em segundo plano e devolver a saída ao terminal'
        ], 'fork cria o processo filho; exec substitui seu programa. O pai (shell) aguarda o término.'),
        mcq('q2', 'O ps mostra um processo no estado Z. O que é correto fazer?', 'd', [
          'Enviar kill -9 ao zumbi para liberar a memória',
          'Aumentar a prioridade dele com renice',
          'Reiniciar o disco, pois Z indica falha de armazenamento',
          'Tratar o pai: ele deve coletar o código de saída; se necessário, encerrar o pai, e o PID 1 limpa o zumbi'
        ], 'O zumbi já terminou: só resta a entrada na tabela até o pai chamar wait(). Matar o pai faz o PID 1 adotar e limpar.'),
        mcq('q3', 'Por que passar uma senha como argumento de linha de comando (programa --senha=<valor>) é arriscado?', 'a', [
          'Porque a linha de comando fica visível a outros usuários em ps e /proc/<PID>/cmdline e pode ir parar em históricos',
          'Porque o shell criptografa o argumento e o programa não consegue lê-lo, de modo que recebe apenas texto ilegível e a autenticação falha',
          'Porque argumentos longos são cortados pelo kernel e a senha vira inválida, já que o kernel limita a linha de comando a poucos caracteres por processo',
          'Porque o kernel recusa argumentos que contenham letras maiúsculas'
        ], 'cmdline é legível por outros usuários. Prefira arquivo com permissão restrita ou variável cuidadosamente controlada.'),
        fill('q4', 'Complete o comando que lista os PIDs e a linha de comando dos processos chamados sshd.', 'pgrep ___ sshd', ['-a', '-al', '-la', '-fa', '-af'], 'pgrep -a imprime PID e linha de comando; sem -a, só o PID. pkill usa os mesmos padrões para enviar sinais.'),
        mcq('q5', 'Qual a diferença entre SIGTERM e SIGKILL?', 'c', [
          'SIGKILL permite que o programa faça a limpeza antes de sair, enquanto SIGTERM mata de imediato, sem que o processo possa tratá-lo ou registrar nada',
          'Ambos são idênticos; mudam apenas os números 15 e 9',
          'SIGTERM pede o encerramento e pode ser tratado (trap) para limpar; SIGKILL é imposto pelo kernel e não pode ser capturado ou ignorado',
          'SIGTERM só funciona para processos do root'
        ], 'Use TERM primeiro, para o programa limpar; KILL (9) apenas se não responder.'),
        mcq('q6', 'Qual comando roda um backup pesado causando o mínimo de impacto na CPU e no disco?', 'b', [
          'sudo renice -n -20 -p <PID> durante o backup, dando ao rsync a maior prioridade de CPU',
          'nice -n 15 ionice -c 3 rsync -a /srv/dados/ /mnt/backup/',
          'ulimit -n 1 e depois rsync, para limitar os arquivos abertos',
          'nohup rsync -a /srv/dados/ /mnt/backup/ &'
        ], 'nice baixa a prioridade de CPU e ionice -c 3 (idle) só usa o disco ocioso. nohup apenas sobrevive ao fechamento do terminal.'),
        mcq('q7', 'O que imprime este trecho?\ntimeout 2 sleep 10; echo $?', 'd', [
          '0, pois o sleep terminou normalmente antes de o tempo limite do timeout expirar',
          '2, o tempo configurado em segundos, que timeout devolve como código quando interrompe o comando',
          '15, o número do SIGTERM, que o timeout devolve como código ao encerrar o comando',
          '124, o código de saída de timeout quando o limite de tempo estoura'
        ], 'timeout encerra o comando após o prazo e retorna 124 (se o comando terminar antes, devolve o código dele).'),
        fill('q8', 'Complete o comando que executa o script desligado do terminal, em nova sessão, para não receber SIGHUP ao fechar o terminal.', '___ ./job.sh > /dev/null 2>&1 < /dev/null &', ['setsid', 'nohup'], 'setsid cria uma nova sessão; nohup também protege do HUP. Ambos mantêm o job vivo após fechar o terminal.')
      ]
    },
    {
      id: 'lni-07-systemd-profundidade',
      title: 'systemd em profundidade',
      goal: 'Escrever e depurar unidades de serviço, usar drop-ins, entender dependências e ordem, ler logs por unidade e rodar serviços sem privilégios.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Unidades e onde ficam',
            'O systemd gerencia unidades, cada uma descrita por um arquivo: .service (um processo/daemon), .socket (ativa um serviço quando chega conexão), .timer (agenda a ativação de um serviço), .mount (um ponto de montagem), .target (um grupo/estado) e outras. Os arquivos que vêm dos pacotes ficam em /usr/lib/systemd/system (em algumas distribuições /lib/systemd/system); os do administrador, em /etc/systemd/system, que tem precedência. Nunca edite os arquivos de /usr/lib: uma atualização do pacote os sobrescreve. Depois de criar ou alterar arquivos de unidade à mão, rode systemctl daemon-reload para o systemd relê-los.',
            'systemctl list-units --type=service --state=running | head -n 4\nsystemctl cat sshd.service       # mostra o arquivo (o nome varia: ssh.service no Debian)\nsudo systemctl daemon-reload'
          ),
          sl(
            'Anatomia de um .service',
            'Três seções. [Unit]: descrição e relações com outras unidades. [Service]: como executar — ExecStart (o comando, com caminho absoluto), Type, User, WorkingDirectory, Environment, Restart. [Install]: o que acontece no systemctl enable — WantedBy=multi-user.target faz o serviço iniciar no boot em modo multiusuário (cria um link simbólico). Salve em /etc/systemd/system/meuapp.service.',
            '[Unit]\nDescription=Meu app de exemplo\nAfter=network-online.target\nWants=network-online.target\n\n[Service]\nType=simple\nUser=meuapp\nWorkingDirectory=/opt/meuapp\nEnvironment=PORT=8080\nExecStart=/usr/bin/node /opt/meuapp/server.js\nRestart=on-failure\nRestartSec=5\n\n[Install]\nWantedBy=multi-user.target'
          ),
          sl(
            'Type, Restart, User e variáveis',
            'Type=simple (padrão): o processo iniciado por ExecStart é o serviço, que continua em primeiro plano. Type=forking: o programa faz fork e o pai sai (daemons antigos). Type=oneshot: roda uma tarefa e termina (scripts). Restart= decide quando reiniciar: no (padrão), on-failure (saída com erro, morte por sinal ou timeout), always (sempre que parar). RestartSec= é a espera. User= e Group= definem a conta (nunca root sem necessidade). Environment=CHAVE=valor define variáveis; EnvironmentFile=/caminho lê de um arquivo (com o prefixo - o arquivo é opcional) — guarde segredos em arquivo com permissão 600, não direto na unidade, que é legível por todos.',
            '[Service]\nType=oneshot\nUser=backup\nEnvironmentFile=/etc/backup/env     # arquivo com modo 600, dono root\nExecStart=/usr/local/bin/backup.sh'
          ),
          sl(
            'Dependências e ordem: Wants, Requires, After',
            'São dois eixos independentes. Dependência (quem precisa de quem): Wants= é fraca (tenta iniciar a outra unidade, mas segue sem ela se falhar); Requires= é forte (se a outra falhar ou for parada, esta também falha/para). Ordem (quem inicia antes): After= e Before=. Requires sem After inicia as duas ao mesmo tempo! Por isso o par comum é Requires=db.service junto de After=db.service. Para rede, o padrão é After=network-online.target com Wants=network-online.target.',
            '[Unit]\nRequires=postgresql.service\nAfter=postgresql.service\n# Requires = depende; After = só depois que ela subiu'
          ),
          sl(
            'systemctl edit e drop-ins',
            'Para ajustar um serviço de pacote sem tocar no arquivo original, use drop-ins: sudo systemctl edit nginx.service abre um editor e grava /etc/systemd/system/nginx.service.d/override.conf, que mescla as diretivas com o arquivo original e sobrevive às atualizações (systemctl edit já recarrega a configuração). Em listas como ExecStart=, para substituir o comando, primeiro zere a diretiva com uma linha vazia (ExecStart=) e depois defina a nova. systemctl cat mostra o resultado unificado. sudo systemctl edit --full copia o arquivo inteiro para /etc.',
            'sudo systemctl edit meuapp.service\n# no editor:\n[Service]\nEnvironment=PORT=9090\nRestart=always\nsystemctl cat meuapp.service    # original + drop-in'
          ),
          sl(
            'Operar, ler status e logs, depurar',
            'systemctl start|stop|restart|enable|disable e enable --now (habilita e inicia). systemctl status mostra o estado (active/failed), o PID, e as últimas linhas do log. Em status ou nos logs aparece o código de saída: status=1/FAILURE (o programa saiu com erro), 203/EXEC (o systemd não conseguiu executar o ExecStart: caminho errado ou sem permissão de execução), 200/CHDIR (WorkingDirectory inexistente) e 217/USER (User= inexistente). journalctl -u meuapp -n 50 mostra as últimas 50 linhas daquela unidade; -f acompanha em tempo real; --since "1 hour ago" filtra. systemd-analyze verify meuapp.service aponta erros de sintaxe antes de iniciar.',
            'sudo systemctl enable --now meuapp\nsystemctl status meuapp --no-pager\n# exemplo (varia): Active: failed (Result: exit-code) ... status=203/EXEC\njournalctl -u meuapp -n 20 --no-pager\nsystemd-analyze verify /etc/systemd/system/meuapp.service'
          ),
          sl(
            'Timers e serviços sem privilégio',
            'Um .timer ativa o serviço de mesmo nome: meuapp-backup.timer dispara meuapp-backup.service. Com OnCalendar= define-se a agenda e Persistent=true executa depois de um boot a tarefa que foi perdida com a máquina desligada; systemctl list-timers lista os agendamentos e próximos disparos (veremos em detalhe na lição de agendamento). Para endurecer serviços: User= comum (ou DynamicUser=yes, que cria uma conta temporária), NoNewPrivileges=true (impede ganhar privilégios), PrivateTmp=true (um /tmp só do serviço) e ProtectSystem=strict (sistema de arquivos somente leitura, exceto o que você liberar com ReadWritePaths=). Quanto menos o serviço pode, menor o estrago se for invadido.',
            '# meuapp-backup.timer\n[Timer]\nOnCalendar=daily\nPersistent=true\n[Install]\nWantedBy=timers.target\n\n# trecho de endurecimento no .service\nNoNewPrivileges=true\nPrivateTmp=true\nProtectSystem=strict\nReadWritePaths=/var/lib/meuapp'
          )
        ]
      },
      questions: [
        mcq('q1', 'Onde você deve criar a unidade de um serviço próprio?', 'c', [
          '/usr/lib/systemd/system/, pois é onde ficam todas as unidades e o systemd lê esse diretório com prioridade sobre os demais',
          '/proc/systemd/, que o kernel lê no boot',
          '/etc/systemd/system/, que é da administração local e tem precedência sobre os arquivos dos pacotes',
          '/boot/systemd/, junto do kernel, pois o systemd é carregado no boot antes de o sistema raiz ser montado'
        ], 'Os arquivos de /usr/lib vêm dos pacotes e são sobrescritos em atualizações. Depois de criar o arquivo, rode daemon-reload.'),
        mcq('q2', 'Qual a diferença entre Requires=db.service e After=db.service?', 'a', [
          'Requires declara dependência (se db falhar, esta unidade também); After define só a ordem de início; usar Requires sem After pode iniciar as duas ao mesmo tempo',
          'São sinônimos, e o systemd aceita qualquer um',
          'After declara a dependência forte, que derruba a unidade se a outra falhar, e Requires define apenas a ordem de início, sem afetar uma à outra quando uma delas falha',
          'Requires cria um link simbólico no boot; After inicia o serviço agora'
        ], 'Dependência e ordem são eixos independentes. O par usual é Requires= com After=.'),
        mcq('q3', 'No arquivo abaixo, o que acontece se o processo node sair com erro?\n[Service]\nUser=meuapp\nExecStart=/usr/bin/node /opt/meuapp/server.js\nRestart=on-failure\nRestartSec=5', 'd', [
          'O serviço fica parado até alguém executar systemctl start',
          'O serviço é reiniciado como root após 5 minutos',
          'O systemd reinicia imediatamente, ignorando RestartSec',
          'O systemd o reinicia depois de 5 segundos, rodando como o usuário meuapp'
        ], 'on-failure reinicia em saídas com erro; RestartSec é a espera em segundos; User define a conta do processo.'),
        fill('q4', 'Complete o comando executado depois de criar ou editar manualmente um arquivo de unidade, para o systemd relê-lo.', 'sudo systemctl ___', ['daemon-reload'], 'daemon-reload recarrega os arquivos de unidade; não reinicia os serviços por si só.'),
        mcq('q5', 'systemctl status mostra "status=203/EXEC". Qual a causa mais provável?', 'b', [
          'O serviço usou memória demais e foi morto pelo kernel (OOM killer), o que o systemd registra com esse código específico',
          'O systemd não conseguiu executar o ExecStart: caminho errado, arquivo inexistente ou sem permissão de execução',
          'O usuário definido em User= não existe',
          'O WorkingDirectory aponta para uma pasta que não existe'
        ], '203/EXEC é falha ao executar o comando. Usuário inexistente seria 217/USER e diretório inexistente, 200/CHDIR.'),
        mcq('q6', 'Por que ajustar um serviço de pacote com systemctl edit (drop-in) é melhor do que editar /usr/lib/systemd/system/nginx.service?', 'c', [
          'Porque drop-ins são mais rápidos de executar, já que o systemd lê apenas o override.conf e ignora o arquivo original',
          'Porque o arquivo em /usr/lib é somente leitura para o systemd e nunca é lido, já que só /etc/systemd/system é consultado',
          'Porque o drop-in fica em /etc e sobrevive às atualizações do pacote, que sobrescrevem o arquivo original',
          'Porque o drop-in desabilita as demais diretivas do original'
        ], 'O drop-in (override.conf) é mesclado ao original e não é tocado pelo pacote.'),
        mcq('q7', 'Como ver as últimas 30 linhas de log somente do serviço meuapp?', 'a', [
          'journalctl -u meuapp -n 30',
          'systemctl logs meuapp --lines=30 --follow',
          'dmesg -u meuapp -n 30',
          'journalctl -b meuapp --lines=30 --kernel-only'
        ], 'journalctl -u filtra por unidade e -n limita as linhas; -f acompanharia em tempo real.'),
        fill('q8', 'Complete o comando que habilita o serviço para o boot E o inicia agora.', 'sudo systemctl enable ___ meuapp', ['--now'], 'enable --now = enable + start. Sem --now, o serviço só inicia no próximo boot.')
      ]
    },
    {
      id: 'lni-08-particionamento-lvm-raid',
      title: 'Particionamento, LVM e RAID',
      goal: 'Particionar discos, montar sistemas de arquivos de forma persistente, usar swap, LVM e RAID por software e monitorar a saúde dos discos, com cuidado para não apagar dados.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'AVISO: comandos de disco apagam dados',
            'Particionar, formatar (mkfs), criar RAID/LVM e escrever com dd destroem o conteúdo anterior, sem lixeira e sem desfazer. Regras de ouro: (1) pratique em uma VM ou disco de teste, nunca no disco do seu trabalho; (2) confirme o dispositivo com lsblk antes de cada comando (um erro de letra, sdb em vez de sda, apaga o sistema); (3) faça backup antes; (4) releia o comando antes de dar Enter. Os dispositivos aparecem como /dev/sda, /dev/nvme0n1 etc., e suas letras/números podem mudar entre boots.',
            'lsblk -o NAME,SIZE,TYPE,FSTYPE,MOUNTPOINTS\n# exemplo (varia):\n# NAME   SIZE TYPE FSTYPE MOUNTPOINTS\n# sda     40G disk\n# |-sda1  39G part ext4   /\n# sdb     10G disk          <- disco de teste (vazio)'
          ),
          sl(
            'MBR vs GPT e ferramentas',
            'A tabela de partições descreve como o disco é dividido. MBR (clássica): até 4 partições primárias (ou 3 primárias + uma estendida com lógicas) e limite de cerca de 2 TiB por disco. GPT: muitas partições (128 por padrão), discos enormes, cópia de segurança da tabela no fim do disco e identificadores únicos; é o necessário para boot UEFI. Ferramentas: fdisk (interativa, entende MBR e GPT), gdisk (GPT) e parted (também em modo script). Nada é gravado em fdisk até você digitar w; q sai sem salvar.',
            'sudo fdisk /dev/sdb      # SÓ em disco de teste\n# comandos: g (nova tabela GPT)  n (nova partição)  p (listar)  w (gravar)  q (sair sem gravar)\nsudo parted /dev/sdb print'
          ),
          sl(
            'Sistema de arquivos, UUID e blkid',
            'Uma partição vazia precisa de um sistema de arquivos: mkfs.ext4 /dev/sdb1 (ou mkfs.xfs). Para montar: sudo mount /dev/sdb1 /dados. Nomes como /dev/sdb1 podem mudar se você adicionar discos; o UUID (identificador gravado no sistema de arquivos) não muda. blkid e lsblk -f mostram UUID e tipo. Use UUID no /etc/fstab.',
            'sudo mkfs.ext4 /dev/sdb1      # APAGA a partição\nsudo blkid /dev/sdb1\n# exemplo: /dev/sdb1: UUID="<uuid>" TYPE="ext4"\nsudo mkdir -p /dados && sudo mount /dev/sdb1 /dados'
          ),
          sl(
            '/etc/fstab e swap',
            'O /etc/fstab lista o que montar no boot, uma linha por montagem, com 6 campos: (1) dispositivo (de preferência UUID=...), (2) ponto de montagem, (3) tipo, (4) opções (defaults, noatime, ro, nofail — este último evita que a falta do disco trave o boot), (5) dump (quase sempre 0), (6) pass: ordem de verificação com fsck no boot (1 para a raiz, 2 para as demais, 0 para não verificar). Antes de reiniciar, teste com sudo mount -a: se houver erro, corrija na hora — um fstab errado pode derrubar o boot para o modo de emergência. Swap é espaço em disco usado como extensão da memória: pode ser uma partição ou um arquivo (mkswap + swapon); swapon --show lista.',
            'UUID=<uuid-raiz>   /       ext4  errors=remount-ro        0  1\nUUID=<uuid-dados>  /dados  ext4  defaults,noatime,nofail  0  2\nUUID=<uuid-swap>   none    swap  sw                       0  0\n\n# swap em arquivo:\nsudo fallocate -l 1G /swapfile\nsudo chmod 600 /swapfile\nsudo mkswap /swapfile && sudo swapon /swapfile'
          ),
          sl(
            'LVM: PV, VG, LV',
            'O LVM (Logical Volume Manager) coloca uma camada flexível entre discos e sistemas de arquivos. PV (volume físico): disco/partição preparado com pvcreate. VG (grupo de volumes): reunião de PVs, criado com vgcreate. LV (volume lógico): "partição" cortada do VG com lvcreate, onde você faz mkfs e monta. Vantagem: crescer sem parar — lvextend aumenta o LV (e a opção -r já redimensiona o sistema de arquivos junto) e vgextend acrescenta mais discos ao VG. Reduzir é mais arriscado (e o XFS não encolhe), então planeje o crescimento e mantenha backup.',
            'sudo pvcreate /dev/sdb /dev/sdc          # APAGA o conteúdo\nsudo vgcreate vg0 /dev/sdb /dev/sdc\nsudo lvcreate -n dados -L 5G vg0\nsudo mkfs.ext4 /dev/vg0/dados\nsudo lvextend -r -L +2G /dev/vg0/dados   # cresce LV e sistema de arquivos\nsudo pvs; sudo vgs; sudo lvs'
          ),
          sl(
            'RAID por software com mdadm',
            'RAID combina discos para ganhar desempenho e/ou tolerância a falhas. No Linux, o mdadm cria RAID por software (/dev/md0). Níveis: RAID 0 (striping: mais velocidade e capacidade, SEM redundância; um disco morre, perde tudo); RAID 1 (espelho: dados duplicados, sobrevive à perda de um disco); RAID 5 (paridade distribuída, mínimo de 3 discos, sobrevive à perda de 1); RAID 6 (dupla paridade, mínimo de 4, sobrevive à perda de 2); RAID 10 (espelhos listrados: bom desempenho e redundância). cat /proc/mdstat e mdadm --detail /dev/md0 mostram a saúde. RAID NÃO é backup: apagar um arquivo, ransomware ou corrupção lógica são replicados instantaneamente, e um incêndio atinge todos os discos.',
            'sudo mdadm --create /dev/md0 --level=1 --raid-devices=2 /dev/sdb /dev/sdc   # APAGA os discos\ncat /proc/mdstat\n# exemplo: md0 : active raid1 sdc[1] sdb[0] ...  [UU]\nsudo mdadm --detail /dev/md0'
          ),
          sl(
            'SMART: prever falhas de disco',
            'Discos modernos têm autodiagnóstico SMART. O pacote smartmontools traz o smartctl: smartctl -H /dev/sda dá um veredito geral (PASSED ou FAILED) e smartctl -a mostra atributos (setores realocados, horas ligado, temperatura) e o histórico de erros. Aumento de setores realocados ou pendentes é sinal de alerta mesmo com PASSED. Combinado a RAID e a backup testado, é a defesa em camadas contra perda de dados.',
            'sudo smartctl -H /dev/sda\n# exemplo (varia): SMART overall-health self-assessment test result: PASSED\nsudo smartctl -a /dev/sda | head -n 20'
          )
        ]
      },
      questions: [
        mcq('q1', 'Você vai rodar sudo mkfs.ext4 /dev/sdb1 num servidor com dois discos. Qual a atitude mais segura antes?', 'b', [
          'Rodar o comando com --force para evitar perguntas e confirmar o resultado depois com blkid, que restaura os dados apagados se algo der errado',
          'Conferir com lsblk que /dev/sdb1 é mesmo a partição pretendida (e vazia ou com backup), idealmente testando antes em uma VM',
          'Confiar que o mkfs recusa formatar partições com dados',
          'Desmontar apenas o disco sda, para protegê-lo'
        ], 'mkfs destrói o conteúdo anterior. Confirmar o dispositivo e ter backup evita o erro clássico de formatar o disco errado.'),
        mcq('q2', 'Qual vantagem do GPT sobre o MBR?', 'd', [
          'O GPT funciona sem sistema de arquivos',
          'O GPT é o único que aceita o formato ext4',
          'O GPT limita o disco a 2 TiB para economizar espaço de metadados',
          'O GPT suporta discos grandes e muitas partições, guarda uma cópia da tabela no fim do disco e é usado no boot UEFI'
        ], 'MBR: 4 partições primárias e cerca de 2 TiB. GPT supera esses limites e é o formato normal para UEFI.'),
        mcq('q3', 'Que afirmação sobre o /etc/fstab abaixo é correta?\nUUID=<a>  /dados  ext4  defaults,nofail  0  2\nUUID=<b>  none    swap  sw              0  0', 'c', [
          'O disco de dados é montado somente leitura e a swap é um arquivo comum',
          'O fsck do disco de dados roda antes do da raiz, porque o campo pass 2 tem prioridade sobre o 1, e a segunda linha desativa a swap durante o boot inteiro do sistema',
          'O disco de dados é montado em /dados (o nofail evita travar o boot se faltar, e o fsck o verifica depois da raiz); a segunda linha ativa uma área de swap',
          'Ambas as linhas montam sistemas de arquivos ext4 em /dados'
        ], 'Campo 6 = 2 verifica depois da raiz (1). nofail evita falha do boot se o disco faltar. Tipo swap ativa espaço de troca.'),
        fill('q4', 'Complete o comando que monta tudo o que está no /etc/fstab, permitindo testar o arquivo antes de reiniciar.', 'sudo ___ -a', ['mount'], 'mount -a tenta montar todas as entradas; erros aparecem na hora e evitam um boot em modo de emergência.'),
        mcq('q5', 'No LVM, qual comando aumenta em 2 GiB um volume lógico já existente e também redimensiona o sistema de arquivos?', 'a', [
          'lvextend -r -L +2G /dev/vg0/dados',
          'pvcreate -L +2G /dev/vg0/dados',
          'vgcreate -r +2G vg0 /dev/vg0/dados',
          'mkfs.ext4 -r -L +2G /dev/vg0/dados'
        ], 'lvextend aumenta o LV; -r cuida do sistema de arquivos. pvcreate prepara discos e vgcreate cria grupos.'),
        mcq('q6', 'Um espelho RAID 1 com dois discos protege contra qual situação?', 'd', [
          'Exclusão acidental de um arquivo, pois o espelho guarda versões antigas de cada arquivo em um dos discos do conjunto',
          'Ransomware, pois o segundo disco do espelho fica isolado da rede e não recebe as gravações criptografadas feitas pelo malware',
          'Incêndio na sala do servidor',
          'Falha física de um dos dois discos; não substitui backup, porque apagões lógicos são replicados nos dois'
        ], 'RAID dá disponibilidade diante de falha de hardware. Backup (de preferência fora do local) protege contra erros e ataques.'),
        mcq('q7', 'O que o smartctl -H /dev/sda informa?', 'b', [
          'A velocidade de leitura do disco em MB/s',
          'O veredito geral de saúde SMART do disco (PASSED ou FAILED); atributos como setores realocados vêm de smartctl -a',
          'A lista de partições montadas',
          'Quais arquivos estão corrompidos e em quais setores do disco, gerando um relatório que o fsck usa para reparar tudo automaticamente'
        ], 'SMART é autodiagnóstico do disco. Mesmo com PASSED, observe os atributos de alerta.'),
        fill('q8', 'Complete o comando que mostra o UUID e o tipo de sistema de arquivos de /dev/sdb1.', 'sudo ___ /dev/sdb1', ['blkid'], 'blkid imprime UUID, TYPE e rótulo; lsblk -f é uma alternativa.')
      ]
    },
    {
      id: 'lni-09-sistemas-arquivos-profundidade',
      title: 'Sistemas de arquivos em profundidade',
      goal: 'Comparar sistemas de arquivos, entender inodes, journaling e links, escolher opções de montagem seguras e conhecer reparo, snapshots e montagens de rede.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Panorama dos sistemas de arquivos',
            'ext4 é o padrão em muitas distribuições: maduro, robusto, pode crescer e (desmontado) encolher. XFS: excelente com arquivos grandes e muitos acessos paralelos, padrão no RHEL; cresce, mas não encolhe. Btrfs: copy-on-write com snapshots, subvolumes e checksums de dados. ZFS (conceito): sistema de arquivos e gerenciador de volumes juntos, com checksums, snapshots e RAID próprio; sua licença é incompatível com a do kernel, então vem como módulo externo. F2FS é pensado para memória flash; exFAT e NTFS servem principalmente para trocar dados com Windows e macOS (sem donos e permissões Unix).',
            'lsblk -f\n# exemplo (varia): FSTYPE ext4 / xfs / btrfs / vfat ...\ndf -hT\n# exemplo: Filesystem Type Size Used Avail Use% Mounted on'
          ),
          sl(
            'Inodes e blocos',
            'Os dados ficam em blocos de tamanho fixo. Cada arquivo tem um inode: estrutura com os metadados (dono, permissões, tamanho, datas, contador de links) e a localização dos blocos. O NOME do arquivo não está no inode: está numa entrada de diretório, que associa um nome a um número de inode. Há um número fixo de inodes por sistema de arquivos (definido na criação, em ext4). Por isso é possível ter espaço livre e mesmo assim receber "No space left on device": os inodes acabaram (milhões de arquivos minúsculos). df -i mostra o uso de inodes; ls -i e stat mostram o número de um arquivo.',
            'df -i /\n# exemplo: Filesystem Inodes IUsed IFree IUse% Mounted on\n#          /dev/sda1 2621440 180000 2441440 7% /\nls -i arquivo.txt\n# exemplo: 131074 arquivo.txt\nstat arquivo.txt | head -n 3'
          ),
          sl(
            'Journaling, fsck e xfs_repair',
            'Sem proteção, uma queda de energia no meio de uma escrita deixaria metadados inconsistentes. O journal (diário) registra antes as operações de metadados que vai fazer; após uma queda, o sistema as reaplica ou descarta e volta consistente em segundos (ext4 e XFS fazem isso). Quando o sistema de arquivos ainda assim está danificado, usa-se fsck (ext4: e2fsck) ou xfs_repair, SEMPRE com o sistema de arquivos desmontado: verificar um sistema montado e em uso pode corromper dados. Antes de reparar, faça backup/imagem. fsck -n e xfs_repair -n só inspecionam, sem alterar.',
            'sudo umount /dev/sdb1\nsudo fsck -n /dev/sdb1          # só relata, sem corrigir\nsudo fsck /dev/sdb1             # corrige (pode pedir confirmações)\nsudo xfs_repair -n /dev/sdb1    # para XFS (somente verificação)'
          ),
          sl(
            'Links físicos e simbólicos',
            'Link físico (hard link, ln origem nome): um segundo NOME para o MESMO inode. Ambos são o arquivo "de verdade"; o contador de links sobe e os dados só são liberados quando o contador chega a 0. Só existe dentro do mesmo sistema de arquivos e não se aplica a diretórios. Link simbólico (ln -s alvo nome): um arquivo pequeno que guarda o CAMINHO do alvo. Pode apontar para diretórios e outros sistemas de arquivos; se o alvo for removido, o link fica quebrado (dangling). ls -li mostra inodes e o contador; readlink mostra o alvo de um simbólico.',
            'ln dados.txt copia-fisica.txt\nln -s /srv/dados.txt atalho.txt\nls -li dados.txt copia-fisica.txt atalho.txt\n# exemplo (varia):\n# 5001 -rw-r--r-- 2 ana ana 10 ... dados.txt\n# 5001 -rw-r--r-- 2 ana ana 10 ... copia-fisica.txt\n# 5002 lrwxrwxrwx 1 ana ana 14 ... atalho.txt -> /srv/dados.txt'
          ),
          sl(
            'Opções de montagem e /proc/mounts',
            'As opções de mount endurecem o sistema. ro: somente leitura. noexec: não permite executar binários nesse ponto. nosuid: ignora setuid/setgid. nodev: ignora arquivos de dispositivo. Partições com dados de usuário ou temporários (/tmp, /var/tmp, pendrives) se beneficiam de noexec,nosuid,nodev; noexec não impede rodar um script passando-o a um interpretador, então é uma camada, não uma muralha. Remontar sem desmontar: mount -o remount,ro /dados. findmnt e /proc/mounts mostram o que está montado, com as opções ativas.',
            'findmnt /tmp\n# exemplo (varia): TARGET SOURCE FSTYPE OPTIONS\n#          /tmp   tmpfs  tmpfs  rw,nosuid,nodev,noexec\nsudo mount -o remount,ro /dados\ngrep /dados /proc/mounts'
          ),
          sl(
            'Snapshots, cotas, fragmentação',
            'Snapshots (Btrfs, ZFS, LVM) congelam o estado em um instante, quase sem custo de espaço no início (copy-on-write): ótimos antes de uma atualização arriscada. Não são backup: ficam no mesmo disco. Cotas de disco limitam o espaço por usuário/grupo (ext4: quota/edquota; XFS: cotas por usuário, grupo e projeto). Fragmentação: ext4 e XFS alocam de forma a mantê-la baixa; em SSD não é preocupação e manter espaço livre ajuda mais do que desfragmentar (ext4 tem e4defrag, raramente necessário).',
            'sudo btrfs subvolume snapshot -r /dados /dados/.snap-antes   # exemplo Btrfs\nsudo lvcreate -s -n antes -L 1G /dev/vg0/dados             # snapshot LVM\nsudo edquota -u ana                                         # edita a cota (ext4/xfs com cotas ativas)'
          ),
          sl(
            'Montagens de rede: NFS e CIFS',
            'NFS (nativo de Unix) e CIFS/SMB (compatível com Windows/Samba) montam pastas de outro servidor como se fossem locais. No fstab, adicione _netdev para só montar depois da rede. Com CIFS, NÃO coloque usuário e senha na linha do fstab (legível por todos): use um arquivo de credenciais com permissão 600, de dono root, e a opção credentials=. Prefira redes confiáveis ou criptografia, e restrinja no servidor quem pode montar. Exemplos usam endereços de documentação.',
            '192.0.2.20:/export/dados  /mnt/dados  nfs   defaults,_netdev,ro  0  0\n//192.0.2.30/publico  /mnt/smb  cifs  credentials=/etc/smb-cred,_netdev  0  0\nsudo chmod 600 /etc/smb-cred     # arquivo com username=... e password=<senha>'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual característica distingue o XFS do ext4 no redimensionamento?', 'c', [
          'O XFS não pode crescer, mas encolhe com o sistema montado, ao contrário do ext4, que só aceita ser redimensionado com ferramentas offline',
          'O ext4 só cresce e nunca encolhe, e o XFS pode ser reduzido sem desmontar o sistema de arquivos',
          'O XFS pode crescer, mas não pode ser encolhido; o ext4 pode encolher (desmontado)',
          'Ambos crescem e encolhem com o sistema montado'
        ], 'XFS: crescer sim, encolher não. ext4 encolhe com o sistema desmontado. Planeje o tamanho.'),
        mcq('q2', 'Um servidor tem 30% de espaço livre, mas o aplicativo recebe "No space left on device" ao criar arquivos. O que verificar?', 'd', [
          'A temperatura do disco',
          'A tabela de partições, que deve ser MBR',
          'O journal, que sempre ocupa o espaço restante',
          'df -i: os inodes podem ter acabado (muitos arquivos pequenos), mesmo com blocos livres'
        ], 'Cada arquivo consome um inode; no ext4 o total é fixo. df -i revela a exaustão.'),
        mcq('q3', 'Você criou ln dados.txt copia.txt (físico) e ln -s dados.txt atalho.txt (simbólico), e depois executou rm dados.txt. O que ocorre?', 'a', [
          'copia.txt continua com o conteúdo, e atalho.txt fica quebrado (aponta para um caminho que não existe mais)',
          'Os dois continuam funcionando normalmente, pois o link simbólico guarda uma cópia do conteúdo do arquivo original',
          'copia.txt é apagado junto com o original, porque ambos são o mesmo inode, e atalho.txt continua com o conteúdo copiado',
          'Os dois são apagados junto com o original'
        ], 'O link físico é outro nome para o mesmo inode: os dados só somem quando o contador chega a 0. O simbólico guarda só o caminho.'),
        fill('q4', 'Complete o comando que cria um link simbólico chamado atalho.txt para dados.txt.', 'ln ___ dados.txt atalho.txt', ['-s', '--symbolic'], 'ln sem -s cria link físico; ln -s cria simbólico.'),
        mcq('q5', 'Para que a partição /tmp não permita executar binários nem honre setuid, quais opções de montagem usar?', 'b', [
          'ro,nofail,noatime,sync',
          'noexec,nosuid,nodev',
          'defaults,sync,noatime,dirsync',
          'nouser,auto'
        ], 'noexec impede execução de binários, nosuid ignora setuid/setgid e nodev ignora arquivos de dispositivo. Veja o efeito com findmnt ou /proc/mounts.'),
        mcq('q6', 'Qual a forma correta de rodar fsck para reparar um ext4 suspeito?', 'c', [
          'Com o sistema montado e em uso, para economizar tempo',
          'Durante uma gravação intensa, pois o journal garante que o reparo não corrompa os blocos que estão em uso naquele momento',
          'Com o sistema de arquivos desmontado (ou em modo de recuperação), e após backup; fsck -n permite só inspecionar',
          'Apenas apagando o diretório lost+found'
        ], 'Verificar um sistema montado e ativo pode piorar a corrupção. Desmonte, faça backup e use -n para ver antes.'),
        mcq('q7', 'Qual prática é adequada ao montar um compartilhamento CIFS no fstab?', 'd', [
          'Escrever usuário e senha na linha do fstab, pois o arquivo só é lido no boot',
          'Usar permissão 777 no arquivo de credenciais, para o mount conseguir ler',
          'Tratar o snapshot do servidor como backup completo',
          'Usar credentials=/etc/smb-cred com o arquivo em modo 600, dono root, e _netdev para esperar a rede'
        ], 'O fstab é legível por todos: segredos ficam em arquivo restrito. Um snapshot, por sua vez, não é backup externo.'),
        fill('q8', 'Complete o comando que mostra o uso de inodes do sistema de arquivos raiz.', 'df ___ /', ['-i', '--inodes'], 'df -i troca blocos por inodes (Inodes, IUsed, IFree).')
      ]
    },
    {
      id: 'lni-36-linux-desktop',
      title: 'Linux no desktop: gráficos, áudio, Bluetooth e energia',
      goal: 'Entender a pilha gráfica e de áudio do desktop, configurar dual boot, energia e Flatpak e manter o desktop seguro e privado.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'A pilha gráfica',
            'Do hardware à janela: o kernel tem o subsistema DRM/KMS, que conversa com a GPU e define resolução e taxa de atualização (modesetting). Em cima dele roda um servidor de exibição, que recebe desenhos dos aplicativos e entrada de teclado e mouse: X11 (o clássico, servidor Xorg) ou Wayland, em que o próprio compositor (GNOME Shell/Mutter, KWin do KDE, Sway) faz o papel de servidor. Um display manager (GDM, SDDM, LightDM) mostra a tela de login e inicia a sessão. O ambiente de desktop (GNOME, KDE Plasma, Xfce) é o conjunto de painel, janelas, configurações e aplicativos.',
            'echo $XDG_SESSION_TYPE\n# exemplo (varia): wayland   ou   x11\nsystemctl status display-manager\n# exemplo: mostra o gerenciador de login ativo (gdm, sddm...)'
          ),
          sl(
            'X11 vs Wayland e drivers de GPU',
            'No X11, qualquer aplicativo na sessão pode, em geral, observar teclas digitadas e capturar a tela de outros: é prático para ferramentas antigas, mas fraco em isolamento. No Wayland, cada aplicativo só vê as próprias janelas, e captura de tela ou compartilhamento exige permissão pelo compositor (via portais); aplicativos X11 antigos rodam por uma camada de compatibilidade (XWayland). Quanto aos drivers de GPU: o Mesa é a pilha livre (OpenGL/Vulkan) e atende bem GPUs Intel e AMD, usando módulos do próprio kernel; para algumas GPUs NVIDIA o driver proprietário é a opção de desempenho, com os riscos de lni-35 (recompilação por kernel, Secure Boot). Diagnóstico geral: lspci -k para ver o driver e glxinfo -B (pacote mesa-utils) para ver qual renderizador está em uso.',
            'lspci -k | grep -A3 -i vga\nglxinfo -B | grep -i "renderer"\n# exemplo (varia): OpenGL renderer string: <modelo da GPU>'
          ),
          sl(
            'Áudio: ALSA, PulseAudio e PipeWire',
            'O ALSA é a camada do kernel e das bibliotecas que fala com a placa de som. Acima dele, um servidor de som mistura fluxos de vários aplicativos e permite escolher saída e volume por aplicativo: PulseAudio, o tradicional, e PipeWire, o mais novo, que também cobre vídeo/captura de tela e atende aplicações feitas para PulseAudio por compatibilidade. Para diagnosticar: pactl info mostra o servidor em uso, pactl list short sinks lista as saídas (sinks), e wpctl status (PipeWire) mostra dispositivos e volumes. Na maioria das vezes, falta de som é saída errada selecionada ou dispositivo mudo, não defeito.',
            'pactl info | grep "Server Name"\npactl list short sinks\nwpctl status\n# exemplo (varia): lista saídas; o padrão aparece marcado com *'
          ),
          sl(
            'Bluetooth e impressão',
            'O Bluetooth é gerenciado pelo serviço bluetooth (BlueZ). Na linha de comando usa-se bluetoothctl, um console interativo: power on liga o adaptador, scan on procura dispositivos, pair <endereço> faz o pareamento, connect <endereço> conecta e trust <endereço> aceita reconexão automática. Se o serviço não estiver ativo, systemctl status bluetooth mostra a causa; rfkill list revela bloqueio por software ou por chave física. A impressão usa o CUPS, serviço que mantém filas e drivers; sua interface web local fica em http://localhost:631 e lpstat -p lista impressoras. Não exponha a porta 631 para a rede sem necessidade.',
            'bluetoothctl\n[bluetooth]# power on\n[bluetooth]# scan on\n[bluetooth]# pair <endereco>\nrfkill list\nlpstat -p'
          ),
          sl(
            'Energia: suspensão, hibernação, TLP e powertop',
            'Suspender (systemctl suspend) mantém a RAM alimentada e desliga o resto: retoma rápido, mas ainda gasta bateria. Hibernar (systemctl hibernate) grava o conteúdo da memória em swap e desliga de vez, e por isso exige swap suficiente e configurada para isso. Em notebooks, o TLP aplica ajustes automáticos de economia (disco, USB, Wi-Fi, CPU) e powertop mostra o que mais consome e sugere ajustes. Ambos são ferramentas de ajuste fino: aplique, teste a estabilidade e reverta o que causar problema (por exemplo, dispositivo USB que desliga sozinho).',
            'systemctl suspend\nsystemctl hibernate        # exige swap configurada\nsudo powertop              # relatório interativo de consumo\nsudo tlp-stat -s           # situação do TLP (exemplo)'
          ),
          sl(
            'Dual boot com Windows',
            'Dual boot é ter dois sistemas no mesmo computador, com um bootloader (em geral o GRUB) oferecendo o menu. Em UEFI, os dois compartilham a mesma partição EFI (ESP, FAT, em /boot/efi). Instale o Windows primeiro, reduza a partição dele pelo Windows e só então instale o Linux; faça backup antes. O GRUB acha o Windows com o os-prober (sudo os-prober; depois update-grub ou grub-mkconfig, conforme a distribuição). Conflito clássico de hora: o Linux assume que o relógio de hardware (RTC) guarda UTC; o Windows assume hora local. Resultado: a hora sai errada em um dos sistemas, em geral por algumas horas. Solução do lado do Linux: timedatectl set-local-rtc 1 (RTC em hora local); para voltar ao padrão, set-local-rtc 0. A outra opção é configurar o Windows para UTC.',
            'timedatectl\n# exemplo (varia): RTC in local TZ: no   <- Linux usa UTC\nsudo timedatectl set-local-rtc 1   # RTC em hora local\nsudo timedatectl set-local-rtc 0   # volta ao UTC\nsudo os-prober'
          ),
          sl(
            'Flatpak, sandbox e privacidade do desktop',
            'O Flatpak instala aplicativos com suas dependências, isolados em sandbox: o app só enxerga o que suas permissões liberam (pasta pessoal, rede, câmera), e o acesso a arquivos, câmera ou captura de tela passa por portais, que pedem sua escolha. flatpak info --show-permissions <app> mostra o que um app pediu; flatpak override --user --nofilesystem=home <app> retira o acesso à pasta pessoal. Boas práticas de segurança e privacidade: criptografe o disco (LUKS) para proteger um notebook perdido; bloqueie a tela ao sair; atualize sistema e navegador, a maior superfície de ataque; instale extensões do shell e do navegador só de origem conhecida, pois rodam com seus privilégios; revise permissões de câmera, microfone e tela; e desative telemetria e coleta de dados opcionais quando houver essa opção.',
            'flatpak list\nflatpak info --show-permissions <app-id>\nflatpak override --user --nofilesystem=home <app-id>\n# exemplo: o app deixa de ver sua pasta pessoal'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a ordem correta da pilha gráfica, do hardware ao que o usuário vê?', 'b', [
          'Ambiente de desktop -> display manager -> compositor -> GPU, já que o desktop controla o hardware, com o servidor de exibição tratando só a entrada do teclado e do mouse',
          'GPU com DRM/KMS no kernel -> servidor de exibição (X11 ou compositor Wayland) -> display manager inicia a sessão -> ambiente de desktop',
          'Display manager -> kernel -> GPU -> Wayland, porque a tela de login precisa existir antes do kernel',
          'Mesa -> PulseAudio -> GPU -> X11, porque o Mesa gerencia o áudio da placa'
        ], 'O kernel (DRM/KMS) fala com a GPU; o servidor de exibição desenha e trata entrada; o display manager faz o login; o desktop oferece painel e aplicativos.'),
        mcq('q2', 'Qual vantagem de segurança o Wayland costuma ter em relação ao X11?', 'd', [
          'Criptografa automaticamente tudo o que é desenhado na tela',
          'Dispensa o kernel, reduzindo a superfície de ataque do sistema',
          'Impede que o usuário instale aplicativos de origem desconhecida, bloqueando a execução de qualquer binário que não venha dos repositórios oficiais',
          'Cada aplicativo enxerga só as próprias janelas, e captura de tela ou compartilhamento passa por permissão do compositor (portais)'
        ], 'No X11 clássico, aplicativos da mesma sessão podem observar entrada e tela de outros. No Wayland esse acesso é mediado pelo compositor.'),
        mcq('q3', 'Sem som no notebook. pactl list short sinks mostra duas saídas e a padrão é o HDMI de um monitor sem alto-falantes. Qual é a ação mais provável de resolver?', 'c', [
          'Reinstalar o kernel, porque a placa de som é um módulo e foi corrompida, e depois recriar o initramfs para recarregar o driver de áudio',
          'Desinstalar o PipeWire e instalar o ALSA no lugar',
          'Escolher como padrão a saída dos alto-falantes internos (pelas configurações de som ou pactl/wpctl) e conferir se não está mudo',
          'Trocar o display manager, pois o áudio depende da tela de login'
        ], 'O ALSA não é substituível pelo servidor de som: PulseAudio/PipeWire rodam sobre ele. Saída errada ou mudo é a causa mais comum.'),
        fill('q4', 'Complete o comando do console do bluetoothctl que inicia a busca por dispositivos.', '[bluetooth]# scan ___', ['on'], 'scan on começa a procurar; scan off para. Depois vêm pair, trust e connect.'),
        mcq('q5', 'Qual diferença descreve corretamente suspender e hibernar?', 'a', [
          'Suspender mantém a RAM alimentada e retoma rápido; hibernar grava a memória em swap e desliga, exigindo swap suficiente',
          'Suspender grava a memória em swap e desliga; hibernar mantém a RAM alimentada e retoma em segundos',
          'Os dois são idênticos, mudando apenas o nome conforme o ambiente de desktop',
          'Suspender desliga o sistema e apaga a sessão; hibernar só desliga a tela e libera os processos da memória, exigindo reiniciar o gerenciador de login'
        ], 'Suspensão usa a RAM (alimentada); hibernação usa o swap para guardar o estado, então precisa de swap configurada para isso.'),
        mcq('q6', 'Num dual boot com Windows, a hora fica errada em horas após alternar de sistema. Qual é a causa e uma solução do lado do Linux?', 'd', [
          'Defeito da bateria da placa-mãe; a solução é trocar a bateria e reinstalar o GRUB, e depois reconfigurar o fuso horário pelo instalador gráfico da distribuição',
          'O os-prober sobrescreve o relógio; a solução é remover o os-prober',
          'O fuso horário é gravado dentro da partição EFI; a solução é formatar a ESP',
          'O Linux guarda UTC no relógio de hardware e o Windows hora local; use timedatectl set-local-rtc 1 (ou configure o Windows para UTC)'
        ], 'Os dois sistemas interpretam o RTC de modo diferente. Alinhar a interpretação resolve; set-local-rtc 1 faz o Linux usar hora local.'),
        mcq('q7', 'Um tutorial pede para instalar uma extensão do shell, de autor desconhecido, "para acelerar o desktop". Qual é a postura segura?', 'b', [
          'Instalar, porque extensões rodam isoladas e não acessam seus arquivos',
          'Desconfiar: extensões rodam com seus privilégios, então prefira origem conhecida (repositório da distribuição ou fonte oficial), revise o que ela faz e instale só se precisar',
          'Instalar com sudo, para o sistema confiar nela e verificar seu conteúdo',
          'Desativar a atualização do navegador, que causa conflito com extensões do shell'
        ], 'Extensões de shell e de navegador executam código com seu usuário. Origem desconhecida é risco de roubo de dados; mantenha tudo atualizado.'),
        fill('q8', 'Complete o comando que faz o Linux voltar a tratar o relógio de hardware como UTC.', 'sudo timedatectl set-local-rtc ___', ['0'], 'set-local-rtc 0 define RTC em UTC (padrão do Linux); 1 define hora local.')
      ]
    },
    {
      id: 'lni-10-redes-linux',
      title: 'Redes no Linux',
      goal: 'Configurar e diagnosticar a rede com ip, nmcli/netplan, resolvectl, ss e tcpdump, e entender nomes de interface, DNS, hostname e encaminhamento de pacotes.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'ip: endereços, links, rotas e vizinhos',
            'O comando ip (pacote iproute2) substituiu ifconfig e route. ip addr (ou ip a) mostra endereços; ip link mostra as interfaces (estado UP/DOWN, MAC); ip route mostra a tabela de rotas, em que a linha "default via ..." é o gateway padrão (para onde vai o tráfego sem rota mais específica); ip neigh mostra a tabela de vizinhos/ARP, que associa IPs da rede local a endereços MAC. Alterações feitas com ip add, del e set valem só até o reinício. Os exemplos usam endereços privados ou de documentação.',
            'ip -br addr\n# exemplo (varia): lo UNKNOWN 127.0.0.1/8 ; enp3s0 UP 192.168.1.50/24\nip route\n# exemplo: default via 192.168.1.1 dev enp3s0 ...\n#          192.168.1.0/24 dev enp3s0 proto kernel scope link src 192.168.1.50\nsudo ip addr add 192.168.1.60/24 dev enp3s0   # temporário'
          ),
          sl(
            'Nomes previsíveis de interface',
            'Antigamente as placas eram eth0, eth1..., e a ordem podia mudar entre boots. Hoje o systemd/udev usa nomes previsíveis, derivados do firmware ou da posição no barramento: enp3s0 (Ethernet no barramento PCI 3, slot 0), eno1 (onboard), ens3 (slot hotplug, comum em VMs), wlp2s0 (Wi-Fi). lo é a interface de loopback (127.0.0.1), interna à máquina. Em VMs e containers, eth0 ainda é comum.',
            'ip -br link\n# exemplo (varia):\n# lo      UNKNOWN 00:00:00:00:00:00\n# enp3s0  UP      <endereço MAC>'
          ),
          sl(
            'Configuração persistente',
            'Para sobreviver ao reboot, use a ferramenta da distribuição. NetworkManager (desktops e muitos servidores): nmcli con show e nmcli con mod "Wired" ipv4.addresses 192.168.1.50/24 ipv4.method manual. systemd-networkd: arquivos .network em /etc/systemd/network/. Netplan (Ubuntu): YAML em /etc/netplan/*.yaml que gera a configuração do NetworkManager ou do networkd; use sudo netplan try (reverte sozinho se você perder o acesso) antes de sudo netplan apply. Debian clássico: /etc/network/interfaces. Em acesso remoto, um erro aqui derruba a conexão: tenha acesso de console.',
            '# /etc/netplan/50-exemplo.yaml\nnetwork:\n  version: 2\n  ethernets:\n    enp3s0:\n      dhcp4: false\n      addresses: [192.168.1.50/24]\n      routes:\n        - to: default\n          via: 192.168.1.1\n      nameservers:\n        addresses: [192.168.1.1]\n# sudo netplan try'
          ),
          sl(
            'DNS, hostname e /etc/hosts',
            '/etc/resolv.conf lista os servidores DNS usados pelas aplicações. Com systemd-resolved, ele costuma apontar para 127.0.0.53 (um stub local), e resolvectl status mostra os servidores reais por interface e resolvectl query nome.exemplo testa uma resolução. /etc/hosts é consultado antes do DNS (a ordem fica em /etc/nsswitch.conf) e serve para nomes locais fixos. O nome da máquina é lido e alterado com hostnamectl (hostnamectl set-hostname servidor1).',
            'cat /etc/resolv.conf\n# exemplo (varia): nameserver 127.0.0.53\nresolvectl status | head -n 8\nresolvectl query exemplo.org\nhostnamectl\n192.168.1.50  servidor1   # linha de /etc/hosts'
          ),
          sl(
            'ss e ferramentas de teste',
            'ss -tulpn lista os sockets que estão ESCUTANDO: t (TCP), u (UDP), l (listening), p (processo dono, exige root), n (números, sem resolver nomes). A coluna de endereço local importa: 0.0.0.0:22 ou [::]:22 significa "aceita de qualquer interface"; 127.0.0.1:5432 significa só conexões locais. Para testar caminho: ping (alcançabilidade; ICMP pode ser bloqueado), traceroute (cada salto no caminho) e mtr (traceroute contínuo com perdas). Método em camadas: link (ip link) -> endereço (ip addr) -> rota/gateway (ip route, ping do gateway) -> DNS (resolvectl query) -> porta do serviço (ss, nc).',
            'sudo ss -tulpn\n# exemplo (varia):\n# tcp LISTEN 0 128 0.0.0.0:22     0.0.0.0:* users:(("sshd",pid=850,fd=3))\n# tcp LISTEN 0 244 127.0.0.1:5432 0.0.0.0:* users:(("postgres",pid=912,fd=6))\nping -c 3 192.168.1.1\nmtr -rwc 5 exemplo.org'
          ),
          sl(
            'tcpdump: observando pacotes (com ética)',
            'tcpdump captura e mostra pacotes que passam por uma interface, com filtros: sudo tcpdump -i eth0 port 53 mostra só consultas DNS; -n evita resolver nomes, -c 20 para depois de 20 pacotes, -w captura.pcap grava num arquivo. Use somente em redes e máquinas suas ou com autorização formal: capturas podem conter dados pessoais, senhas e tokens de terceiros (LGPD). Minimize: filtre por porta/host, capture o mínimo de tempo, guarde o arquivo com acesso restrito e apague quando acabar o diagnóstico.',
            'sudo tcpdump -i eth0 -n port 53 -c 5\n# exemplo: IP 192.168.1.50.51234 > 192.168.1.1.53: A? exemplo.org\nsudo tcpdump -i eth0 -n host 192.0.2.10 -w /tmp/diag.pcap -c 100'
          ),
          sl(
            'Bridges, bonding, VLAN e IP forwarding',
            'Visão geral: bridge liga interfaces como um switch virtual (usada por VMs e containers); bonding agrega várias placas numa só (redundância ou capacidade); VLAN separa redes lógicas no mesmo cabo, com uma etiqueta numérica (ex.: ip link add link enp3s0 name enp3s0.10 type vlan id 10). IP forwarding: por padrão, o Linux descarta pacotes que chegam e não são para ele; para atuar como roteador, ative net.ipv4.ip_forward=1 (sysctl; persistente em /etc/sysctl.d/) e controle o que passa com o firewall. Ative apenas quando a máquina for mesmo um roteador/gateway.',
            'sysctl net.ipv4.ip_forward\n# exemplo: net.ipv4.ip_forward = 0\nsudo sysctl -w net.ipv4.ip_forward=1\necho "net.ipv4.ip_forward = 1" | sudo tee /etc/sysctl.d/99-forward.conf'
          )
        ]
      },
      questions: [
        mcq('q1', 'Na saída de ip route, qual linha indica o gateway padrão?\n192.168.1.0/24 dev enp3s0 proto kernel scope link src 192.168.1.50\ndefault via 192.168.1.1 dev enp3s0', 'b', [
          'A primeira, pois mostra a rede local, que é de onde o sistema envia todo o tráfego sem rota específica',
          'A segunda: default via 192.168.1.1 é para onde vai o tráfego sem rota mais específica',
          'Nenhuma das duas, pois o gateway padrão só aparece na tabela de vizinhos exibida por ip neigh',
          'As duas, que são equivalentes'
        ], 'A rota default envia ao gateway tudo que não pertence às redes diretamente conectadas.'),
        mcq('q2', 'O que sugere o nome de interface enp3s0, em vez de eth0?', 'c', [
          'Uma interface Wi-Fi no canal 3',
          'Uma interface virtual criada pelo Docker',
          'Um nome previsível: Ethernet (en) no barramento PCI 3, slot 0, estável entre reboots',
          'Uma placa que está com defeito (p de problema)'
        ], 'Os nomes previsíveis derivam de firmware e posição no barramento, evitando trocas de ordem entre boots.'),
        mcq('q3', 'Você rodou sudo ip addr add 192.168.1.60/24 dev enp3s0 e reiniciou. O que acontece com o endereço?', 'a', [
          'Desaparece: ip altera só a configuração em execução; para persistir use NetworkManager, systemd-networkd ou netplan',
          'Permanece, pois o comando ip grava a configuração em /etc/hosts e em /etc/network, relida a cada boot pelo systemd',
          'Permanece, pois o kernel lembra de todos os comandos ip',
          'Passa a ser o gateway padrão'
        ], 'Mudanças com ip são voláteis. Em acesso remoto, use netplan try para testar e reverter automaticamente.'),
        fill('q4', 'Complete o comando que exibe a tabela de vizinhos (ARP) da rede local.', 'ip ___ show', ['neigh', 'neighbor', 'neighbour', 'n'], 'ip neigh associa IPs da rede local a endereços MAC.'),
        mcq('q5', 'O /etc/resolv.conf contém nameserver 127.0.0.53. Como descobrir os servidores DNS reais?', 'd', [
          'Apagar o arquivo, e o sistema detecta de novo',
          'Rodar hostnamectl, que lista os servidores DNS configurados, as rotas de cada interface e o estado das resoluções mais recentes do sistema operacional',
          'Editar o /etc/hosts com os servidores desejados',
          'Rodar resolvectl status, pois 127.0.0.53 é o stub local do systemd-resolved, que encaminha para os servidores configurados por interface'
        ], 'Com systemd-resolved, o resolv.conf aponta para o stub local; resolvectl mostra a configuração real.'),
        mcq('q6', 'Em ss -tulpn, a linha mostra "tcp LISTEN 0 244 127.0.0.1:5432 ... postgres". Quem consegue conectar?', 'b', [
          'Qualquer host da rede, pois 5432 é uma porta de banco de dados e o PostgreSQL aceita conexões de todas as interfaces por padrão',
          'Somente processos da própria máquina, pois o serviço escuta apenas no loopback',
          'Somente o usuário root, que é o único com permissão para abrir conexões na porta 5432',
          'Ninguém, pois LISTEN significa que a porta está fechada'
        ], '127.0.0.1 é o loopback. Para aceitar da rede o serviço escutaria em 0.0.0.0 ou num IP da interface.'),
        mcq('q7', 'Qual cuidado é essencial ao usar tcpdump?', 'c', [
          'Rodá-lo sempre com -w para esconder o conteúdo',
          'Capturar o tráfego de toda a rede por dias seguidos, sem filtros, pois dados excedentes ajudam em investigações futuras e dispensam novas coletas',
          'Usar só em redes e máquinas suas ou autorizadas, filtrar o mínimo necessário e proteger/apagar as capturas, que podem conter dados pessoais e senhas',
          'Desativar o firewall antes da captura'
        ], 'Capturas expõem dados de terceiros; minimize escopo, tempo e guarda (LGPD).'),
        fill('q8', 'Complete o parâmetro do kernel que, com valor 1, permite ao Linux encaminhar pacotes entre interfaces (atuar como roteador).', 'sudo sysctl -w net.ipv4.___=1', ['ip_forward'], 'ip_forward=1 habilita o roteamento; sem ele, pacotes não destinados à máquina são descartados.')
      ]
    },
    {
      id: 'lni-39-diagnostico-rede-ferramentas',
      title: 'Ferramentas de diagnóstico de rede',
      goal: 'Usar ss, nc, curl, dig, mtr, tcpdump, iperf3, nmap e ethtool para diagnosticar problemas por camadas, com ética e cuidado com dados pessoais.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Metodologia: diagnóstico por camadas',
            'Em vez de testar ao acaso, suba a pilha da base ao topo e pare onde falhar: 1) link: cabo/Wi-Fi conectado? (ip link, ethtool); 2) IP: a interface tem endereço? (ip addr); 3) rota: existe gateway e ele responde? (ip route, ping do gateway); 4) DNS: o nome resolve? (dig, resolvectl); 5) porta: o serviço aceita conexão? (nc, curl); 6) aplicação: o serviço responde certo? (curl -v, logs). Truque útil: se ping para um IP funciona e para o nome não, o problema é DNS, não a rede.',
            'ip link ; ip addr ; ip route\nping -c 2 192.0.2.1      # gateway/IP (exemplo)\nping -c 2 example.org    # falhou? compare com o IP -> DNS\nnc -vz example.org 443   # a porta abre?\ncurl -I https://example.org   # a aplicação responde?'
          ),
          sl(
            'ss, ip -s link, ethtool e vizinhos',
            'ss lista sockets: ss -tulpn mostra portas TCP (t) e UDP (u) em escuta (l), com o processo dono (p), em números (n); sem -l, ss -t mostra conexões estabelecidas. ip -s link exibe contadores por interface: bytes, pacotes, erros e descartes (dropped); erros crescendo apontam cabo ou driver. ethtool eth0 mostra velocidade, duplex e se há link (Link detected). ip neigh (ou arp -n) mostra a tabela de vizinhos: IP e MAC dos hosts da rede local, útil para ver se o gateway responde na camada 2.',
            'ss -tulpn\n# exemplo: LISTEN 0 128 0.0.0.0:22 ... users:(("sshd",pid=...))\nip -s link show eth0\nsudo ethtool eth0 | grep -E "Speed|Link"\n# exemplo: Speed: 1000Mb/s   Link detected: yes\nip neigh'
          ),
          sl(
            'nc e curl: testar porta e aplicação',
            'nc (netcat) abre conexões TCP/UDP brutas. nc -vz host 443 testa se a porta aceita conexão: -z não envia dados e -v detalha o resultado ("succeeded" ou "refused"/"timed out"). Recusada (refused) costuma indicar host alcançável e nada escutando; tempo esgotado (timed out) sugere firewall descartando ou rota quebrada. Em laboratório, nc -l 9000 cria um ouvinte simples (a sintaxe varia conforme a implementação do nc, por vezes -l -p 9000). curl mostra a camada de aplicação: -I só cabeçalhos; -v detalha DNS, conexão, TLS e HTTP; --resolve força um nome a um IP (testar um servidor novo antes de mudar o DNS); -w mede tempos.',
            'nc -vz example.org 443\n# exemplo: Connection to example.org 443 port [tcp/https] succeeded!\ncurl -s -o /dev/null -w "dns=%{time_namelookup} conexao=%{time_connect} tls=%{time_appconnect} total=%{time_total}" https://example.org\ncurl -I --resolve example.org:443:203.0.113.10 https://example.org'
          ),
          sl(
            'dig: consultas DNS',
            'dig faz consultas DNS e mostra a resposta completa. Argumentos: dig example.org A (tipo do registro: A = IPv4, AAAA = IPv6, MX = e-mail, NS = servidores de nomes, TXT, CNAME = apelido). +short mostra só a resposta. @servidor consulta um servidor específico (ex.: dig @1.1.1.1 compara o seu resolvedor com outro). +trace segue a delegação da raiz até o servidor autoritativo, mostrando onde quebra. No cabeçalho, status: NOERROR (ok), NXDOMAIN (o nome não existe), SERVFAIL (o servidor falhou ao resolver).',
            'dig +short example.org A\n# exemplo: 203.0.113.10\ndig example.org MX @192.0.2.53\ndig +trace example.org\n# exemplo de cabeçalho: ;; ->>HEADER<<- opcode: QUERY, status: NXDOMAIN'
          ),
          sl(
            'mtr e traceroute; iperf3',
            'traceroute e mtr mostram o caminho (saltos/roteadores) até o destino. mtr combina traceroute e ping contínuo: mtr -r -c 10 host faz um relatório de 10 envios. Como ler: perda (Loss%) só num salto do meio, com os seguintes normais, geralmente é roteador limitando respostas ICMP e não problema real; perda que começa num salto e continua até o destino é problema real a partir dali. Latência que sobe e se mantém indica o trecho lento. Para medir vazão entre dois hosts SEUS: num deles iperf3 -s e no outro iperf3 -c <IP-do-servidor>; o resultado em Mbits/s separa lentidão da rede de lentidão da aplicação.',
            'mtr -r -c 10 example.org\n# exemplo: Host  Loss%  Snt  Last  Avg ...\n#         1. gateway   0.0%  10  1.0 ...\n#         5. ???      50.0%  10  ...  <- salto do meio\n#         9. destino   0.0%  10  ...  <- ok: só limita ICMP\niperf3 -s                    # no servidor\niperf3 -c 192.168.1.10       # no cliente (exemplo)'
          ),
          sl(
            'tcpdump e privacidade',
            'tcpdump captura pacotes numa interface. Filtros: host 192.0.2.10, port 53, combináveis com and; -i escolhe a interface; -nn não resolve nomes nem portas (mais rápido, mais claro); -c N para após N pacotes; -w arquivo.pcap grava a captura e -r arquivo.pcap a lê depois. Capture só em redes e máquinas suas ou com autorização. Um pcap pode conter dados pessoais (usuários, URLs, cookies, e conteúdo sem TLS), logo, pela LGPD: capture o mínimo necessário (filtro estreito, tempo curto), guarde em local protegido, compartilhe só o essencial e apague quando acabar o diagnóstico.',
            'sudo tcpdump -nn -i eth0 host 192.0.2.10 and port 53 -c 5\nsudo tcpdump -nn -i eth0 port 443 -w captura.pcap -c 100\ntcpdump -nn -r captura.pcap | head\n# exemplo: IP 192.168.1.50.51234 > 192.0.2.53.53: A? example.org'
          ),
          sl(
            'nmap: descoberta com ética e lei',
            'nmap descobre hosts e portas abertas. -sn lista quais hosts estão ativos sem varrer portas; -p 22,80,443 testa portas específicas; -sV tenta identificar o serviço e a versão. Estados: open (há serviço aceitando), closed (host responde, mas nada escuta) e filtered (um firewall descarta, e o nmap não sabe se está aberto). Use para auditar a SUA rede e comparar o que está exposto com o que deveria estar. Varrer redes de terceiros sem autorização escrita pode violar a lei: a Lei 12.737/2012 tipificou a invasão de dispositivo informático alheio (art. 154-A do Código Penal), e varreduras podem ser vistas como etapa de ataque e violar termos de provedores. Em dúvida, não varra; peça autorização por escrito e defina o escopo. Não substitui orientação jurídica.',
            'nmap -sn 192.168.1.0/24          # sua rede (exemplo)\nnmap -p 22,80,443 192.168.1.10\nnmap -sV -p 22 192.168.1.10\n# exemplo: 22/tcp open ssh   443/tcp filtered https'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual comando lista as portas TCP e UDP em escuta, com o processo dono, em números?', 'c', [
          'ip -s link, que exibe contadores de pacotes por interface e as portas associadas',
          'ethtool eth0, que mostra velocidade, duplex e as portas em escuta do adaptador',
          'ss -tulpn, em que t = TCP, u = UDP, l = escuta, p = processo e n = numérico',
          'ip neigh, que lista IP e MAC dos vizinhos e as portas abertas deles'
        ], 'ss -tulpn é o comando padrão para ver o que escuta. ip -s link é sobre contadores; ethtool, sobre link físico; ip neigh, sobre vizinhos L2.'),
        mcq('q2', 'nc -vz db.example.org 5432 retorna "Connection refused". O que isso indica?', 'a', [
          'O host foi alcançado, mas nada aceita conexão nessa porta (serviço parado ou escutando em outro endereço); tempo esgotado sugeriria firewall descartando',
          'Que o firewall do caminho está descartando os pacotes, sem responder',
          'Que o DNS não conseguiu resolver o nome db.example.org',
          'Que o cabo de rede está desconectado'
        ], 'Refused vem do host, que respondeu rejeitando; timed out é o sinal de pacotes descartados. DNS e cabo falhariam antes.'),
        mcq('q3', 'Qual é o uso do comando curl com a opção -w "%{time_namelookup} %{time_connect} %{time_total}"?', 'd', [
          'Gravar a resposta em um arquivo com o nome do host e a hora da consulta',
          'Forçar o curl a esperar o tempo informado antes de cada tentativa de conexão, repetindo até o limite de tentativas definido por --retry',
          'Limitar a velocidade da transferência de acordo com o valor de time_total',
          'Medir quanto tempo levam a resolução de DNS, a conexão e a requisição inteira, ajudando a achar em que etapa está a lentidão'
        ], '-w imprime variáveis ao final; as time_* separam DNS, conexão, TLS e total.'),
        fill('q4', 'Complete a consulta para exibir apenas a resposta, sem o restante da saída do dig.', 'dig +___ example.org A', ['short'], '+short mostra só os valores da resposta. +trace segue a delegação e @servidor escolhe o resolvedor.'),
        mcq('q5', 'Você não abre https://example.org no navegador. ping 192.0.2.1 (gateway) funciona, ping 203.0.113.10 funciona, mas ping example.org dá "Name or service not known". Qual é a camada provável do problema?', 'b', [
          'Link físico, pois o cabo parece defeituoso, já que o ping ao nome falha, e convém testar com outro cabo e outra porta do switch',
          'DNS: a conectividade IP e a rota estão ok, mas o nome não resolve; investigue com dig e resolvectl',
          'Aplicação, pois o servidor web não está respondendo',
          'Rota padrão, pois o gateway não está alcançável'
        ], 'Ping a IPs funciona (link, IP e rota ok); só o nome falha. Isso aponta para o DNS.'),
        mcq('q6', 'Num relatório mtr, o salto 5 tem 50% de perda, mas os saltos 6 a 9, incluindo o destino, têm 0%. Como interpretar?', 'c', [
          'Há perda real de 50% no caminho, e é preciso trocar o provedor imediatamente, abrindo chamado com o provedor com o relatório mtr anexado',
          'O destino está desligado, pois a perda no salto 5 prova isso',
          'Provavelmente o roteador do salto 5 limita respostas ICMP; sem perda nos saltos seguintes e no destino, não há problema real ali',
          'O mtr está com defeito e deve ser substituído pelo ping'
        ], 'Perda real se propaga até os saltos seguintes. Perda isolada num salto do meio costuma ser limitação de resposta ICMP desse roteador.'),
        mcq('q7', 'Você capturou tráfego com tcpdump -w captura.pcap para depurar um problema. Qual conduta é adequada, e qual regra vale para nmap?', 'd', [
          'Guardar o pcap indefinidamente em uma pasta compartilhada como documentação; usar nmap em redes de clientes sem aviso, pois é só descoberta',
          'Enviar o pcap completo por e-mail ao suporte; varrer a rede vizinha para comparar',
          'Capturar a rede inteira por dias, pois mais dados facilitam a análise; varrer só IPs públicos de terceiros, que são abertos',
          'Capturar o mínimo (filtro e tempo curtos), proteger o arquivo, compartilhar só o necessário e apagar depois; usar nmap só na sua rede ou com autorização escrita'
        ], 'O pcap pode ter dados pessoais (LGPD: minimização, proteção, descarte). Varreduras exigem autorização; a Lei 12.737/2012 trata da invasão de dispositivos alheios.'),
        fill('q8', 'Complete o comando que lê e exibe, sem resolver nomes, o arquivo de captura captura.pcap.', 'tcpdump -nn ___ captura.pcap', ['-r'], '-r lê um arquivo; -w grava. Ler não exige estar na rede capturada.')
      ]
    },
    {
      id: 'lni-11-firewall-nftables-ufw',
      title: 'Firewall: nftables, iptables, ufw e firewalld',
      goal: 'Entender filtragem de pacotes com política padrão negar, escrever regras em nftables, usar ufw/firewalld e aplicar regras sem se trancar fora.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Conceito: filtrar pacotes',
            'Firewall decide o destino de cada pacote: aceitar, descartar (drop) ou rejeitar. No Linux isso é feito pelo netfilter, no kernel, que oferece ganchos (hooks) por onde o pacote passa: prerouting, input (destinado à própria máquina), forward (atravessando-a), output (originado nela) e postrouting. Regras são avaliadas em ordem e a primeira que casa decide. Um filtro stateless olha cada pacote isolado; um stateful (conntrack) acompanha as conexões, e por isso uma única regra "aceitar o que pertence a conexões estabelecidas" libera as respostas sem abrir portas. Princípio de segurança: política padrão negar (drop) e liberar só o necessário.',
            'entrada -> prerouting -> [roteamento] -> input -> processo local\n                               \\-> forward -> postrouting -> saída\nprocesso local -> output -> postrouting'
          ),
          sl(
            'nftables: tabelas, cadeias e regras',
            'nftables é o framework atual (substitui iptables). Uma tabela (família inet cobre IPv4 e IPv6) contém cadeias; uma cadeia de base declara o gancho e a política; as regras ficam dentro. Exemplo de proteção de um servidor: aceitar o loopback, aceitar conexões estabelecidas/relacionadas, aceitar SSH e web, e descartar o resto pela política. Ferramentas: sudo nft list ruleset mostra tudo; sudo nft -c -f arquivo apenas verifica a sintaxe; sudo nft -f arquivo aplica. Para persistir, grave em /etc/nftables.conf e habilite o serviço nftables.',
            'table inet filter {\n  chain input {\n    type filter hook input priority 0; policy drop;\n    iif lo accept\n    ct state established,related accept\n    tcp dport 22 accept\n    tcp dport { 80, 443 } accept\n  }\n}'
          ),
          sl(
            'iptables (legado) e a ordem das regras',
            'iptables é a ferramenta anterior, com o mesmo conceito (tabelas, cadeias INPUT/FORWARD/OUTPUT, alvos ACCEPT/DROP). Em muitos sistemas ele hoje é uma camada de compatibilidade sobre o nftables. -A acrescenta ao fim da cadeia, -I insere no início, -P define a política, -L -n -v lista. A ORDEM importa: o pacote é decidido pela primeira regra que casa; um DROP geral posto antes da regra do SSH bloqueia o SSH. Regras criadas pelo comando vivem só na memória: precisam ser salvas (iptables-save, ou pacote iptables-persistent no Debian/Ubuntu).',
            'sudo iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT\nsudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT\nsudo iptables -P INPUT DROP     # política: só depois das regras de aceitação!\nsudo iptables -L -n -v --line-numbers'
          ),
          sl(
            'ufw e firewalld: interfaces simplificadas',
            'ufw (Ubuntu) e firewalld (Fedora/RHEL) são front-ends: você escreve regras de alto nível e eles geram as regras de netfilter. ufw: sudo ufw allow 22/tcp, sudo ufw enable, sudo ufw status verbose; padrão: nega entrada e permite saída. firewalld trabalha com zonas (conjuntos de regras associadas a interfaces/origens, como public ou internal): sudo firewall-cmd --zone=public --add-service=https --permanent e depois sudo firewall-cmd --reload; --list-all mostra a zona. Sem --permanent, a regra vale só até o reload ou reboot.',
            'sudo ufw allow 22/tcp\nsudo ufw allow 443/tcp\nsudo ufw enable\nsudo ufw status verbose\nsudo firewall-cmd --permanent --add-service=https\nsudo firewall-cmd --reload\nsudo firewall-cmd --list-all'
          ),
          sl(
            'NAT e masquerade (visão geral)',
            'NAT altera endereços dos pacotes. Num gateway, o masquerade troca o endereço de origem dos pacotes da rede interna (privada) pelo endereço da interface de saída, permitindo que várias máquinas compartilhem um IP público. Exige IP forwarding ligado (net.ipv4.ip_forward=1) e regras de forward adequadas. Em nftables, fica numa cadeia no gancho postrouting de uma tabela do tipo nat.',
            'table ip nat {\n  chain postrouting {\n    type nat hook postrouting priority 100;\n    oifname "eth0" masquerade\n  }\n}'
          ),
          sl(
            'Não se trancar fora',
            'O erro clássico: ativar política negar sem ter liberado o SSH, ou aplicar regras erradas, e perder o acesso a um servidor remoto. Proteja-se: (1) libere o SSH antes de ativar o firewall (ufw allow 22/tcp antes de ufw enable); (2) mantenha uma sessão SSH já aberta e teste a nova regra abrindo uma SEGUNDA conexão antes de fechar a primeira; (3) tenha console de emergência (painel da VM/provedor); (4) agende uma reversão automática com at: se algo der errado, ela limpa as regras sozinha; se der certo, cancele o job com atrm.',
            'echo "nft flush ruleset" | sudo at now + 5 minutes\n# aplique as regras, teste numa 2ª sessão e, se estiver tudo certo:\natq          # lista os jobs agendados\nsudo atrm <número-do-job>'
          ),
          sl(
            'Logs de bloqueio e fail2ban',
            'Para entender o que é barrado, registre antes de descartar, limitando o ritmo para não encher o log: uma regra com log prefix "nft-drop: " (e limit rate) seguida do drop; as mensagens aparecem no log do kernel (journalctl -k | grep nft-drop). fail2ban (defensivo) lê logs de serviços, como falhas de login no SSH, e bane temporariamente o IP de origem com uma regra de firewall após N tentativas; configure em /etc/fail2ban/jail.local (não edite o jail.conf) e consulte com sudo fail2ban-client status sshd. Reduz ruído e força bruta, mas não substitui chaves SSH e senhas fortes.',
            '# em nftables, no fim da cadeia input:\nlimit rate 5/minute log prefix "nft-drop: "\njournalctl -k | grep nft-drop\nsudo fail2ban-client status sshd\n# exemplo: Currently banned: 2'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual o papel da regra ct state established,related accept?', 'c', [
          'Bloquear todas as conexões novas vindas da internet',
          'Aceitar qualquer pacote destinado à porta 22',
          'Aceitar pacotes que pertencem a conexões já iniciadas (e as relacionadas a elas), liberando respostas sem abrir portas novas',
          'Registrar em log todos os pacotes descartados pela política, com o endereço de origem e a porta, no journal do kernel e no firewall'
        ], 'Isso é filtragem stateful via conntrack: as respostas das conexões que a própria máquina iniciou passam.'),
        mcq('q2', 'Com o conjunto de regras abaixo, o que acontece com um pacote TCP para a porta 8080?\nchain input {\n  type filter hook input priority 0; policy drop;\n  ct state established,related accept\n  tcp dport 22 accept\n}', 'b', [
          'É aceito, porque nenhuma regra o proíbe explicitamente e o netfilter libera por padrão o que não foi bloqueado',
          'É descartado pela política padrão drop, pois nenhuma regra o aceita',
          'É aceito, pois o protocolo TCP é considerado confiável e passa pelo filtro sem consulta às regras',
          'É redirecionado para a porta 22, pois essa é a única regra de aceitação do conjunto'
        ], 'Com política drop, tudo o que nenhuma regra aceita é descartado. É a postura "negar por padrão".'),
        mcq('q3', 'Em iptables, a regra "-A INPUT -j DROP" foi inserida ANTES de "-A INPUT -p tcp --dport 22 -j ACCEPT". Qual o efeito?', 'd', [
          'O SSH funciona, pois o ACCEPT é mais específico e tem prioridade',
          'O iptables reordena as regras automaticamente por especificidade',
          'O iptables recusa carregar a segunda regra',
          'O SSH é bloqueado: a primeira regra que casa decide, e o DROP geral casa antes'
        ], 'A ordem importa: regras específicas de ACCEPT devem vir antes do DROP geral (ou use a política da cadeia).'),
        fill('q4', 'Complete o comando do ufw que libera conexões SSH (TCP, porta 22).', 'sudo ufw ___ 22/tcp', ['allow'], 'ufw allow 22/tcp; libere o SSH antes de ufw enable para não se trancar fora.'),
        mcq('q5', 'Você vai ativar uma política de negar tudo em um servidor remoto via SSH. Qual a abordagem mais segura?', 'a', [
          'Liberar o SSH primeiro, manter a sessão aberta, testar numa segunda sessão e agendar com at a limpeza das regras como reversão automática',
          'Ativar a política e depois liberar o SSH pela sessão que já estava aberta, se ela ainda estiver conectada, e então testar o acesso em outro terminal',
          'Desativar o SSH e usar apenas telnet temporariamente',
          'Reiniciar o servidor logo após aplicar, para as regras valerem'
        ], 'Regras ordenadas, teste em sessão paralela e rede de segurança (at, console) evitam perder o acesso.'),
        mcq('q6', 'Você executou sudo firewall-cmd --add-service=https (sem --permanent) e, depois de um reboot, a porta 443 voltou a ser bloqueada. Por quê?', 'c', [
          'O firewalld não suporta o serviço https na zona public e só o libera quando o iptables estiver instalado no sistema',
          'O reboot apagou o arquivo da zona public',
          'Sem --permanent, a regra vale só na configuração em execução; use --permanent e firewall-cmd --reload',
          'O https só pode ser liberado por iptables'
        ], 'No firewalld há configuração em execução e permanente; --permanent grava para os próximos boots.'),
        mcq('q7', 'Para que serve o fail2ban?', 'a', [
          'Ler logs de serviços e banir temporariamente, via firewall, IPs que falham repetidamente no login; não substitui senhas fortes e chaves',
          'Criptografar o tráfego entre cliente e servidor SSH',
          'Substituir o netfilter como filtro de pacotes do kernel, aplicando as regras antes de o tráfego chegar à interface de rede, na camada de hardware',
          'Renovar certificados TLS automaticamente'
        ], 'fail2ban reage a padrões nos logs criando bans temporários; é uma camada extra, não a principal.'),
        fill('q8', 'Complete a regra nftables que faz NAT de saída trocando a origem pelo IP da interface eth0.', 'oifname "eth0" ___', ['masquerade'], 'masquerade, na cadeia de postrouting, é o NAT de saída de gateways; exige ip_forward ligado.')
      ]
    },
    {
      id: 'lni-12-ssh-avancado',
      title: 'SSH avançado',
      goal: 'Usar config, agente, ProxyJump e túneis com consciência dos riscos, endurecer o sshd e gerenciar chaves e known_hosts com segurança.',
      xp: 20,
      intro: {
        slides: [
          sl(
            '~/.ssh/config: atalhos e padrões',
            'Em vez de digitar parâmetros longos, descreva cada destino em ~/.ssh/config: Host é o apelido; HostName, o endereço real; User, o usuário; Port, a porta; IdentityFile, a chave privada a usar (IdentitiesOnly yes evita tentar todas as chaves do agente). Depois, basta ssh app. O arquivo e a pasta ~/.ssh devem ter permissões restritas (chmod 700 ~/.ssh; chmod 600 ~/.ssh/config), ou o ssh reclama.',
            'Host app\n    HostName 192.0.2.10\n    User deploy\n    Port 22\n    IdentityFile ~/.ssh/id_ed25519_app\n    IdentitiesOnly yes\n\n# uso: ssh app'
          ),
          sl(
            'Chaves ed25519 e ssh-agent',
            'Prefira chaves ed25519: ssh-keygen -t ed25519 -C "notebook-pessoal". Defina sempre uma passphrase. A chave PRIVADA (id_ed25519) nunca sai da sua máquina: não a copie para servidores, e-mails, repositórios ou chats; só a pública (.pub) vai para ~/.ssh/authorized_keys do servidor (ssh-copy-id faz isso). O ssh-agent guarda a chave já destravada na memória para você digitar a passphrase uma vez: eval "$(ssh-agent -s)", ssh-add ~/.ssh/id_ed25519, e ssh-add -l lista as chaves carregadas.',
            'ssh-keygen -t ed25519 -C "notebook-pessoal"\nssh-copy-id -i ~/.ssh/id_ed25519.pub deploy@192.0.2.10\neval "$(ssh-agent -s)"\nssh-add ~/.ssh/id_ed25519\nssh-add -l\n# exemplo: 256 SHA256:<fingerprint> notebook-pessoal (ED25519)'
          ),
          sl(
            'ProxyJump: acessar hosts por um bastion',
            'Servidores internos não precisam de IP público: um único bastion (jump host), bem protegido, recebe o SSH externo e você chega ao interno através dele. ssh -J bastion deploy@10.0.0.5 faz o salto; no config, ProxyJump bastion. A conexão ao destino continua criptografada ponta a ponta entre você e o destino, e a chave permanece local (diferente de agent forwarding). Menos portas expostas, ponto único para logs e MFA.',
            'Host bastion\n    HostName 192.0.2.5\n    User ana\nHost interno\n    HostName 10.0.0.5\n    User deploy\n    ProxyJump bastion\n\n# uso: ssh interno      (ou: ssh -J bastion deploy@10.0.0.5)'
          ),
          sl(
            'Túneis: -L, -R e -D (e seus riscos)',
            'Túneis encaminham portas por dentro do SSH. -L (local): abre uma porta na SUA máquina e leva ao destino visto do servidor: ssh -L 8080:127.0.0.1:80 app faz localhost:8080 chegar à porta 80 do servidor app. -R (remoto): abre uma porta no SERVIDOR que volta para a sua máquina ou rede. -D (dinâmico): cria um proxy SOCKS local (ssh -D 1080 app). -N dispensa o shell. Riscos: um túnel -R ou um destino interno contorna o firewall e expõe serviços internos; mantenha o bind em 127.0.0.1 (não use GatewayPorts yes sem necessidade) e feche os túneis ao terminar. Em servidores, restrinja com AllowTcpForwarding no sshd_config.',
            'ssh -N -L 8080:127.0.0.1:80 app          # localhost:8080 -> porta 80 do app\nssh -N -R 9000:127.0.0.1:3000 app         # porta 9000 do app -> seu localhost:3000\nssh -N -D 1080 app                         # proxy SOCKS em localhost:1080'
          ),
          sl(
            'Agent forwarding: conveniente e arriscado',
            'Com ssh -A (ForwardAgent yes), o servidor intermediário pode pedir assinaturas ao SEU agente local. Quem tiver root nesse servidor (ou o comprometer) pode usar o socket do agente enquanto você está conectado e se autenticar como você em outros destinos — sem ter roubado a chave, mas com o mesmo efeito. Por isso: evite ForwardAgent em hosts que não sejam totalmente confiáveis e prefira ProxyJump, que não expõe o agente; no ssh-add, -c exige confirmação a cada uso.',
            '# evite:\nssh -A deploy@servidor\n# prefira (sem expor o agente ao servidor intermediário):\nssh -J bastion deploy@10.0.0.5'
          ),
          sl(
            'Endurecer o sshd_config',
            'O arquivo do servidor é /etc/ssh/sshd_config (e /etc/ssh/sshd_config.d/*.conf). Boas práticas: PermitRootLogin no (entre com usuário comum e use sudo), PasswordAuthentication no (só chaves; teste ANTES se a chave funciona em outra sessão), AllowUsers ana deploy (lista de contas permitidas), PubkeyAuthentication yes, MaxAuthTries baixo. Mudar a Port reduz o ruído de logs de varreduras, mas NÃO é segurança (qualquer scanner a encontra): é obscuridade. Antes de recarregar, valide com sudo sshd -t, depois sudo systemctl reload sshd (o nome da unidade pode ser ssh no Debian/Ubuntu) e mantenha uma sessão aberta para não se trancar. Complementos: fail2ban, MFA (chave + segundo fator, p. ex. TOTP via PAM ou chave de hardware) e certificados SSH — uma CA assina chaves com validade e usuários permitidos, evitando gerenciar authorized_keys e known_hosts um a um.',
            '# /etc/ssh/sshd_config (trecho)\nPermitRootLogin no\nPasswordAuthentication no\nPubkeyAuthentication yes\nAllowUsers ana deploy\nMaxAuthTries 3\n\nsudo sshd -t && sudo systemctl reload sshd'
          ),
          sl(
            'known_hosts, StrictHostKeyChecking e transferência de arquivos',
            'Na primeira conexão, o ssh mostra o fingerprint da chave do servidor e grava em ~/.ssh/known_hosts. Nas próximas, compara: se mudar, aparece "REMOTE HOST IDENTIFICATION HAS CHANGED". Pode ser reinstalação do servidor, mas também um ataque de interceptação (man-in-the-middle): confirme por outro canal antes de remover a entrada com ssh-keygen -R host. StrictHostKeyChecking=yes recusa hosts desconhecidos; accept-new aceita novos mas bloqueia mudanças; no desativa a proteção e deve ser evitado. Para copiar: scp arquivo deploy@192.0.2.10:/tmp/, sftp deploy@192.0.2.10 (sessão interativa) e rsync -a -e "ssh -p 2222" origem/ destino:/pasta/ (só diferenças, sobre SSH).',
            'scp relatorio.txt deploy@192.0.2.10:/tmp/\nsftp deploy@192.0.2.10\nrsync -a -e "ssh -p 2222" ./site/ deploy@192.0.2.10:/var/www/site/\nssh-keygen -R 192.0.2.10      # só depois de confirmar o motivo da mudança'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que faz ssh interno com este ~/.ssh/config?\nHost bastion\n    HostName 192.0.2.5\n    User ana\nHost interno\n    HostName 10.0.0.5\n    User deploy\n    ProxyJump bastion', 'd', [
          'Conecta ao 192.0.2.5 como deploy e depois abre um shell no 10.0.0.5 como ana',
          'Conecta diretamente ao 10.0.0.5, ignorando a configuração do bastion',
          'Copia a chave privada para o bastion e a usa de lá',
          'Conecta ao 10.0.0.5 como deploy, passando pelo bastion (192.0.2.5, como ana) como salto'
        ], 'ProxyJump encadeia o salto. A autenticação no destino acontece ponta a ponta, sem expor a chave ao bastion.'),
        mcq('q2', 'Qual é o tratamento correto de uma chave privada SSH?', 'b', [
          'Copiá-la para cada servidor que você administra, para que ele possa se conectar a outros sem pedir passphrase',
          'Mantê-la só na sua máquina, com passphrase e permissão 600, e distribuir apenas a chave pública',
          'Enviá-la por e-mail criptografado ao administrador do servidor, que a instala em ~/.ssh/authorized_keys para liberar o seu acesso',
          'Guardá-la em um repositório privado do Git, junto do código'
        ], 'A pública vai ao authorized_keys; a privada fica com você. O ssh-agent evita redigitar a passphrase.'),
        mcq('q3', 'O que faz ssh -N -L 8080:127.0.0.1:80 app?', 'c', [
          'Abre no servidor app a porta 8080, ligada à porta 80 da sua máquina, para que outras pessoas acessem o seu serviço local',
          'Cria um proxy SOCKS na porta 8080 da sua máquina, pelo qual todo o tráfego do navegador será encaminhado ao servidor app',
          'Abre a porta 8080 na sua máquina e leva o tráfego, pelo túnel, à porta 80 do ponto de vista do servidor app',
          'Copia o arquivo da porta 80 para a 8080'
        ], '-L é port forwarding local; -R seria o oposto (porta no servidor) e -D, o SOCKS.'),
        fill('q4', 'Complete a opção que usa o host bastion como salto para chegar a 10.0.0.5.', 'ssh ___ bastion deploy@10.0.0.5', ['-J'], '-J (ProxyJump) conecta através de um jump host.'),
        mcq('q5', 'Por que ssh -A (agent forwarding) é arriscado em servidores intermediários?', 'a', [
          'Quem tiver root nesse servidor pode usar o seu agente enquanto você está conectado e se autenticar como você em outros destinos',
          'Porque o -A desativa a criptografia da conexão',
          'Porque o agente envia a chave privada para o servidor, que a grava em disco, onde qualquer usuário do servidor consegue lê-la depois da desconexão',
          'Porque o -A faz o servidor copiar a pasta ~/.ssh inteira'
        ], 'O agente não entrega a chave, mas assina pedidos de quem alcançar o socket. ProxyJump evita esse risco.'),
        mcq('q6', 'Qual conjunto é uma configuração de endurecimento coerente para o sshd?', 'd', [
          'Mudar apenas a porta para 2222, que esconde o serviço dos scanners, e manter o login por senha e como root liberados, para facilitar a administração remota da equipe de suporte',
          'PermitRootLogin yes e PasswordAuthentication yes, com senhas longas',
          'Desativar o firewall e confiar apenas em fail2ban',
          'PermitRootLogin no, PasswordAuthentication no (após testar a chave), AllowUsers com as contas necessárias, sshd -t antes de recarregar e sessão aberta durante o teste'
        ], 'Trocar a porta é obscuridade, não segurança. Teste a sintaxe com sshd -t e mantenha uma sessão para não se trancar.'),
        mcq('q7', 'Ao conectar, aparece "REMOTE HOST IDENTIFICATION HAS CHANGED". O que fazer?', 'b', [
          'Apagar todo o known_hosts e conectar de novo, sem investigar',
          'Investigar: confirmar por outro canal se o servidor foi reinstalado e comparar fingerprints; só então remover a entrada antiga com ssh-keygen -R',
          'Configurar StrictHostKeyChecking=no para o aviso nunca mais aparecer',
          'Ignorar, pois o aviso só vem de problemas de rede ou de troca do endereço IP do servidor e some sozinho depois de algumas conexões bem-sucedidas'
        ], 'A chave do host mudou: pode ser legítimo ou um ataque de interceptação. Desativar a verificação remove a proteção.'),
        fill('q8', 'Complete o tipo de chave moderno recomendado ao gerar um par com ssh-keygen.', 'ssh-keygen -t ___', ['ed25519'], 'ed25519 é curta, rápida e considerada forte; use sempre com passphrase.')
      ]
    },
    {
      id: 'lni-38-vpn-wireguard-openvpn',
      title: 'VPN no Linux: WireGuard e OpenVPN',
      goal: 'Montar um túnel VPN com WireGuard, entender roteamento, DNS, NAT e gestão de chaves, e conhecer OpenVPN e IPsec e as implicações de privacidade.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Para que serve uma VPN (e para que não serve)',
            'Uma VPN cria um túnel cifrado entre dois pontos, como se fossem da mesma rede privada. Usos: acesso remoto seguro à rede da empresa ou de casa, e ligar redes de duas filiais. O que ela NÃO é: ferramenta de anonimato. O tráfego só passa cifrado até o servidor da VPN, que enxerga de onde você veio e para onde vai; quem opera esse servidor pode registrar. Comparação com o túnel SSH: ssh -L/-D expõe uma porta ou um proxy para uma aplicação específica; a VPN cria uma interface de rede e roteia todo o tráfego escolhido, de qualquer aplicativo.',
            'Túnel SSH: uma porta/aplicação\n  ssh -L 8080:10.0.0.5:80 usuario@servidor\nVPN: interface de rede (wg0) + rotas, para todo o tráfego escolhido'
          ),
          sl(
            'WireGuard: chaves',
            'O WireGuard é uma VPN simples, em espaço de kernel, que roda sobre UDP. Cada ponta (peer) tem um par de chaves: a privada fica só na própria máquina; a pública é entregue à outra ponta. A configuração é a troca de chaves públicas. Gere as chaves com umask restritiva, para só o dono ler a privada. Nunca compartilhe a privada, nem a coloque em repositório, chat ou ticket; nos exemplos ela aparece como <placeholder>.',
            'umask 077\nwg genkey | tee privatekey | wg pubkey > publickey\ncat publickey      # esta pode ser compartilhada\n# privatekey: nunca compartilhar. Exemplo de formato: <chave-privada>'
          ),
          sl(
            'WireGuard: o arquivo wg0.conf',
            'A interface é descrita em /etc/wireguard/wg0.conf (o arquivo deve ter permissão 600, pois contém a chave privada). [Interface] define a própria ponta: Address (IP dentro do túnel), PrivateKey, e ListenPort (porta UDP, no servidor). Cada [Peer] define uma ponta remota: PublicKey, AllowedIPs (ver próximo slide), Endpoint (IP:porta para alcançá-la, necessário em quem inicia a conexão) e PersistentKeepalive (envia um pacote a cada tantos segundos para manter aberta a tradução de um NAT/firewall no meio do caminho, útil em clientes atrás de NAT).',
            '# /etc/wireguard/wg0.conf  (cliente, exemplo; endereços de documentação)\n[Interface]\nAddress = 10.8.0.2/24\nPrivateKey = <chave-privada-do-cliente>\n\n[Peer]\nPublicKey = <chave-publica-do-servidor>\nAllowedIPs = 10.8.0.0/24\nEndpoint = 203.0.113.10:51820\nPersistentKeepalive = 25'
          ),
          sl(
            'AllowedIPs: roteamento e túnel total vs dividido',
            'AllowedIPs tem duas funções: define quais destinos são enviados por aquele peer (rotas) e quais IPs de origem são aceitos vindos dele (filtro). Túnel dividido (split): só as redes listadas passam pela VPN, como AllowedIPs = 10.8.0.0/24 ou a rede interna da empresa; o resto da internet sai pela conexão normal. Túnel total: AllowedIPs = 0.0.0.0/0 (e ::/0 para IPv6) envia todo o tráfego pelo servidor. O total protege em redes Wi-Fi públicas, mas passa a depender do servidor. Subir e conferir: wg-quick up wg0 aplica o arquivo (cria interface e rotas) e wg show lista peers, último handshake e tráfego; sem handshake recente, a conexão não está funcionando.',
            'sudo wg-quick up wg0\nsudo wg show\n# exemplo (varia):\n# interface: wg0\n# peer: <chave-publica>\n#   latest handshake: 12 seconds ago\n#   transfer: 1.2 MiB received, 0.8 MiB sent\nsudo wg-quick down wg0'
          ),
          sl(
            'Servidor: encaminhamento, NAT e firewall',
            'Para que o servidor encaminhe pacotes dos clientes para outras redes ou para a internet, o kernel precisa permitir o encaminhamento de IP: net.ipv4.ip_forward=1 (persistente em /etc/sysctl.d/99-vpn.conf; aplique com sysctl --system). Para o túnel total, a saída para a internet usa NAT (masquerade) na interface de saída, e o firewall deve liberar a porta UDP do WireGuard (ex.: 51820) e encaminhar só o que a política permitir, não tudo. Lembre também do firewall do provedor de nuvem (security groups): ele precisa liberar a mesma porta UDP.',
            '# /etc/sysctl.d/99-vpn.conf\nnet.ipv4.ip_forward=1\n\n# nftables, trecho mínimo (exemplo; eth0 = saída)\ntable ip nat {\n  chain postrouting {\n    type nat hook postrouting priority srcnat;\n    oifname "eth0" masquerade\n  }\n}\n# liberar também: udp dport 51820 accept'
          ),
          sl(
            'Boot, DNS e vazamento de DNS',
            'Para subir o túnel no boot use o serviço do systemd: systemctl enable --now wg-quick@wg0 (o nome após @ é o do arquivo wg0.conf). Em um túnel total, o DNS também precisa passar pelo túnel: no [Interface] do cliente, a linha DNS = 10.8.0.1 (o resolvedor da VPN) é aplicada pelo wg-quick. Se o DNS continuar saindo pela rede local, ocorre um vazamento de DNS: o provedor local ou a rede pública vê os nomes que você consulta, mesmo com o tráfego cifrado. Teste com resolvectl status ou dig mostrando qual servidor responde.',
            'sudo systemctl enable --now wg-quick@wg0\n# no [Interface] do cliente:\nDNS = 10.8.0.1\nresolvectl status wg0\n# exemplo: DNS Servers: 10.8.0.1'
          ),
          sl(
            'OpenVPN, IPsec, chaves, revogação e privacidade',
            'OpenVPN é uma VPN madura baseada em certificados X.509 (uma CA própria emite certificados por cliente); o cliente usa um arquivo .ovpn com servidor, CA, certificado e chave, e roda em UDP (porta 1194 por padrão) ou TCP. IPsec (por exemplo, com strongSwan, usando IKE) é padrão para ligar redes e é suportado por muitos roteadores, com configuração mais complexa. Gestão de chaves: uma chave por dispositivo/pessoa; se um aparelho for perdido ou alguém sair, remova o [Peer] correspondente no servidor (ou revogue o certificado no OpenVPN) e recarregue. Privacidade (LGPD): logs de conexão relacionam pessoa, origem e horário e são dados pessoais; registre o mínimo, restrinja o acesso e guarde por tempo limitado, informando os usuários da VPN. Não substitui orientação jurídica.',
            '# revogar acesso no WireGuard (servidor)\nsudo wg set wg0 peer <chave-publica-do-cliente> remove\n# e remover o bloco [Peer] de wg0.conf para não voltar no reinício'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual afirmação sobre VPN está correta?', 'b', [
          'Torna o usuário anônimo para o destino e para o operador da VPN, pois o tráfego é cifrado',
          'Cria um túnel cifrado até o servidor da VPN; o operador do servidor vê origem e destino e pode registrar logs, então não é ferramenta de anonimato',
          'Substitui a necessidade de firewall e de atualizações no servidor, porque todo o tráfego fica protegido, e por isso o servidor pode ficar sem monitoramento',
          'Funciona só para navegador web, já que é um recurso de proxy HTTP'
        ], 'A VPN protege o trajeto até o servidor, não esconde de quem opera a VPN. Firewall e atualizações continuam necessários.'),
        mcq('q2', 'Qual é a diferença entre um túnel SSH (ssh -L) e uma VPN WireGuard?', 'c', [
          'O túnel SSH cria uma interface de rede e rotas; a VPN expõe uma porta para uma aplicação',
          'O túnel SSH usa UDP e a VPN usa só TCP, por isso a VPN é mais lenta',
          'O túnel SSH atende uma porta/aplicação específica; a VPN cria uma interface (wg0) e roteia o tráfego escolhido de qualquer aplicativo',
          'Não há diferença prática: ambos alteram a tabela de rotas do sistema, criam interface e protegem o tráfego de qualquer aplicativo do mesmo jeito'
        ], 'ssh -L redireciona uma porta; a VPN é uma interface de rede com rotas, servindo qualquer aplicativo. O WireGuard usa UDP.'),
        mcq('q3', 'Leia o trecho de um cliente: "[Peer] ... AllowedIPs = 0.0.0.0/0". O que isso configura?', 'a', [
          'Túnel total: todo o tráfego IPv4 do cliente é enviado pelo peer (servidor), que passa a depender de NAT e DNS adequados',
          'Túnel dividido: só a rede 10.8.0.0/24 passa pela VPN',
          'Uma lista de IPs bloqueados: nenhum endereço é aceito deste peer',
          'A porta UDP em que o cliente escuta pelas conexões'
        ], '0.0.0.0/0 casa qualquer destino IPv4. Em AllowedIPs funciona como rota e filtro. Para split, liste só as redes internas.'),
        fill('q4', 'Complete o comando que sobe a interface WireGuard descrita em /etc/wireguard/wg0.conf.', 'sudo wg-quick ___ wg0', ['up'], 'wg-quick up cria a interface e as rotas; down desfaz.'),
        mcq('q5', 'Os clientes conectam (wg show mostra handshake), mas o túnel total não alcança a internet. O que verificar no servidor?', 'd', [
          'Se o PersistentKeepalive do servidor é maior que 25 segundos',
          'Se a chave pública do servidor foi copiada para o arquivo privatekey do cliente, pois isso invalidaria o handshake e a resolução de nomes do servidor',
          'Se o arquivo wg0.conf está com permissão 777 para todos lerem',
          'Se net.ipv4.ip_forward=1 está ativo e se há NAT (masquerade) na interface de saída, além de o firewall permitir o encaminhamento'
        ], 'Handshake funcionando indica que o túnel existe. Sem ip_forward e NAT, o servidor não repassa nem traduz os pacotes dos clientes.'),
        mcq('q6', 'Com VPN em túnel total, o dig mostra respostas de um resolvedor da rede Wi-Fi local, não do resolvedor da VPN. Isso é:', 'b', [
          'Normal, pois o DNS nunca passa por túneis VPN',
          'Um vazamento de DNS: os nomes consultados ficam visíveis à rede local; configure DNS = <resolvedor da VPN> no [Interface] e confira com resolvectl',
          'Uma falha do arquivo publickey, que precisa ser regerado',
          'Sinal de que o servidor está sem ip_forward'
        ], 'DNS à parte do túnel revela os domínios acessados. Aponte o DNS do cliente para o resolvedor dentro da VPN.'),
        mcq('q7', 'Um notebook com acesso à VPN foi perdido. Qual é a ação adequada, e o que entra em jogo na LGPD?', 'c', [
          'Aguardar: sem a senha do usuário, a chave privada do WireGuard é inútil para qualquer pessoa',
          'Trocar a porta UDP do servidor, mantendo o peer cadastrado, pois a chave pública permanece válida',
          'Remover o peer correspondente no servidor (ou revogar o certificado, no OpenVPN) e emitir nova chave para o novo aparelho; os logs de conexão são dados pessoais e devem ser mínimos e protegidos',
          'Apagar todos os logs do servidor e manter as chaves como estão'
        ], 'A chave privada no aparelho dá acesso até ser revogada: remova o peer. Logs de VPN ligam pessoa e horário, então são dados pessoais.'),
        fill('q8', 'Complete a linha de sysctl que habilita o encaminhamento de pacotes IPv4 no servidor.', 'net.ipv4.ip_forward=___', ['1'], 'Valor 1 liga o encaminhamento; 0 desliga. Persista em /etc/sysctl.d/.')
      ]
    },
    {
      id: 'lni-13-servicos-de-rede',
      title: 'Serviços de rede',
      goal: 'Conhecer os serviços de rede mais comuns (web, proxy reverso, TLS, DNS, DHCP, NTP, compartilhamento de arquivos) e operá-los com o princípio de instalar o mínimo, expor pouco e testar antes de recarregar.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Princípios: mínimo, fechado, atualizado, testado',
            'Cada serviço instalado é superfície de ataque. Instale só o que a máquina precisa; confira o que escuta com sudo ss -tulpn e feche (firewall ou bind em 127.0.0.1) o que não precisa ser acessível de fora; mantenha tudo atualizado; rode com usuário sem privilégios (os servidores web já abrem a porta como root e trocam para www-data/nginx); e SEMPRE teste a configuração antes de recarregar: um arquivo com erro pode derrubar um serviço no ar. O padrão é testar -> recarregar (reload aplica sem derrubar conexões) -> verificar.',
            'sudo ss -tulpn\n# exemplo (varia): ... 0.0.0.0:80 nginx ... 127.0.0.1:3306 mysqld ...\nsudo nginx -t && sudo systemctl reload nginx'
          ),
          sl(
            'nginx: server blocks',
            'No nginx, cada site é um bloco server dentro de http. listen define a porta, server_name o domínio atendido, root a pasta dos arquivos estáticos e location trata caminhos específicos. Em Debian/Ubuntu os arquivos ficam em /etc/nginx/sites-available/ e são ativados por link simbólico em sites-enabled/; em outras distribuições, em /etc/nginx/conf.d/*.conf. Logs: /var/log/nginx/access.log (cada requisição) e error.log (problemas). nginx -t valida a sintaxe e systemctl reload nginx aplica.',
            'server {\n    listen 80;\n    server_name exemplo.org www.exemplo.org;\n    root /var/www/exemplo;\n    index index.html;\n\n    location / {\n        try_files $uri $uri/ =404;\n    }\n}'
          ),
          sl(
            'Apache: virtual hosts',
            'No Apache, o equivalente é o VirtualHost: ServerName define o domínio, DocumentRoot a pasta do site e ErrorLog/CustomLog os logs. O serviço e o pacote se chamam apache2 no Debian/Ubuntu e httpd no Fedora/RHEL, com os arquivos em /etc/apache2/ ou /etc/httpd/. Em Debian há atalhos (a2ensite, a2enmod). O teste de sintaxe é apachectl configtest (ou apache2ctl configtest) antes de recarregar o serviço.',
            '<VirtualHost *:80>\n    ServerName exemplo.org\n    DocumentRoot /var/www/exemplo\n    ErrorLog /var/log/apache2/exemplo-error.log\n    CustomLog /var/log/apache2/exemplo-access.log combined\n</VirtualHost>\n\napachectl configtest\n# saída esperada: Syntax OK'
          ),
          sl(
            'Proxy reverso e TLS com Certbot',
            'Proxy reverso: o nginx recebe as requisições do público e as repassa a uma aplicação interna (Node, Python...) com proxy_pass, que fica escutando só em 127.0.0.1, sem exposição direta. Ele também pode terminar o TLS (HTTPS), cuidar de cache e balancear carga. Certificados gratuitos e confiáveis vêm do Let\'s Encrypt, por meio do cliente Certbot: sudo certbot --nginx -d exemplo.org obtém o certificado (validando que você controla o domínio, normalmente pela porta 80) e ajusta o nginx. Os certificados duram poucos meses; a renovação é automática (um timer do systemd ou cron instalado pelo pacote). Teste com sudo certbot renew --dry-run.',
            'location / {\n    proxy_pass http://127.0.0.1:3000;\n    proxy_set_header Host $host;\n    proxy_set_header X-Forwarded-For $remote_addr;\n}\n\nsudo certbot --nginx -d exemplo.org\nsudo certbot renew --dry-run\nsystemctl list-timers | grep certbot'
          ),
          sl(
            'DNS, DHCP e NTP',
            'DNS: bind (BIND 9, servidor autoritativo e/ou recursivo, o mais completo), unbound (resolvedor recursivo com cache, leve e seguro) e dnsmasq (cache DNS + DHCP simples para redes pequenas). Cuidado com resolvedores recursivos abertos à internet: podem ser abusados em ataques de amplificação; restrinja a redes internas. DHCP: entrega IP, gateway e DNS por empréstimo (lease) aos clientes; um DHCP "intruso" na rede pode desviar o tráfego. NTP: mantém o relógio correto; o chrony é o cliente/servidor moderno. Hora certa importa para logs, certificados TLS e autenticação. chronyc tracking mostra o desvio e chronyc sources os servidores de tempo.',
            '# dnsmasq (trecho): faixa DHCP com concessão de 12 horas\ndhcp-range=192.168.1.100,192.168.1.200,12h\nchronyc tracking\n# exemplo (varia): System time : 0.000012 seconds fast of NTP time\nchronyc sources'
          ),
          sl(
            'Samba, NFS e e-mail (visão geral)',
            'Samba implementa o protocolo SMB/CIFS: compartilha pastas e impressoras com Windows (configuração em /etc/samba/smb.conf; testparm valida). NFS compartilha pastas entre Unix/Linux: o servidor lista em /etc/exports quem acessa e com quais opções (exportfs -ra aplica). Restrinja por rede/host e use ro quando bastar. E-mail (conceitual): SMTP envia/entrega entre servidores, IMAP/POP3 entregam ao leitor. Operar um servidor de e-mail próprio é difícil e arriscado (um relay aberto vira fonte de spam; é preciso SPF, DKIM e DMARC); na prática, use um provedor.',
            '# /etc/exports\n/export/dados  192.168.1.0/24(ro,sync)\nsudo exportfs -ra\n\n# /etc/samba/smb.conf\n[publico]\n   path = /srv/publico\n   read only = yes\ntestparm'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é o procedimento recomendado ao alterar a configuração de um nginx em produção?', 'b', [
          'Salvar o arquivo e executar systemctl restart nginx imediatamente, o que derruba as conexões em andamento e garante que a nova configuração seja aplicada por completo',
          'Validar com nginx -t e, se estiver OK, recarregar com systemctl reload nginx e verificar o serviço',
          'Apagar o arquivo antigo e esperar o nginx recriá-lo a partir do modelo padrão na próxima reinicialização',
          'Editar direto a cópia em /usr/sbin/nginx'
        ], 'nginx -t detecta erros de sintaxe antes de afetar o site; reload aplica sem derrubar as conexões em curso.'),
        mcq('q2', 'No trecho abaixo, qual é a função da diretiva root?\nserver {\n    listen 80;\n    server_name exemplo.org;\n    root /var/www/exemplo;\n}', 'c', [
          'Define o usuário root como dono do processo',
          'Define a porta em que o servidor escuta',
          'Define a pasta de onde os arquivos estáticos do site são servidos',
          'Define o endereço IP do servidor'
        ], 'listen é a porta, server_name o domínio e root a pasta raiz do conteúdo.'),
        mcq('q3', 'Por que, num proxy reverso, a aplicação interna deve escutar em 127.0.0.1:3000 e não em 0.0.0.0:3000?', 'a', [
          'Para que só o proxy local a alcance, evitando acesso direto da rede ao aplicativo sem passar pelo proxy',
          'Porque 0.0.0.0 não é aceito pelo proxy_pass, que só consegue se conectar a endereços do loopback',
          'Porque o TLS só funciona no loopback',
          'Porque o nginx não consegue se conectar a outras interfaces'
        ], 'Escutar no loopback reduz a superfície: o único caminho é o proxy, que pode aplicar TLS, limites e regras.'),
        fill('q4', 'Complete a opção que apenas testa a sintaxe da configuração do nginx.', 'sudo nginx ___', ['-t'], 'nginx -t testa a configuração; -T testa e a despeja na tela.'),
        mcq('q5', 'Sobre certificados do Let\'s Encrypt com Certbot, o que é correto?', 'd', [
          'O certificado dura para sempre e dispensa renovação',
          'A renovação precisa ser feita manualmente a cada acesso ao site, com o comando certbot revoke seguido de nova emissão do certificado completo',
          'O Certbot só funciona com Apache',
          'A renovação costuma ser automática por timer/cron, e certbot renew --dry-run testa o processo sem emitir certificado definitivo'
        ], 'Certificados têm validade curta e o pacote agenda a renovação. O dry-run confirma que ela funcionará.'),
        mcq('q6', 'Qual associação entre serviço e função está correta?', 'b', [
          'chrony: servidor de arquivos para Windows, compatível com o protocolo SMB e com autenticação por domínio',
          'dnsmasq: cache DNS e DHCP para redes pequenas; chrony: sincronização de hora (NTP)',
          'unbound: servidor DHCP e de impressão, que distribui endereços IP e envia trabalhos para as impressoras da rede',
          'NFS: protocolo de envio de e-mail entre servidores'
        ], 'dnsmasq combina DNS e DHCP; chrony mantém o relógio; NFS compartilha pastas e SMTP envia e-mail.'),
        mcq('q7', 'O ss -tulpn de um servidor mostra 0.0.0.0:3306 (MySQL), que só a própria aplicação, na mesma máquina, deveria usar. Qual ação adequada?', 'c', [
          'Nenhuma: bancos de dados devem escutar em todas as interfaces',
          'Instalar mais um banco para dividir a carga',
          'Configurar o banco para escutar apenas em 127.0.0.1 (ou um IP interno) e/ou bloquear a porta no firewall',
          'Trocar apenas o número da porta para 3307'
        ], 'Exposição desnecessária é risco. Limite o bind e/ou filtre no firewall; mudar a porta não protege.'),
        fill('q8', 'Complete o comando que valida a configuração do Apache antes de recarregá-lo.', 'sudo apachectl ___', ['configtest', '-t'], 'apachectl configtest (ou -t) imprime Syntax OK se não houver erro; no Debian, apache2ctl.')
      ]
    },
    {
      id: 'lni-14-shell-avancado',
      title: 'Shell avançado',
      goal: 'Escrever scripts bash robustos e seguros: quoting, arrays, expansões, here-docs, set -euo pipefail, trap, getopts e boas práticas de depuração e segurança.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Quoting: a causa nº 1 de bugs',
            'O shell divide o resultado de variáveis sem aspas em palavras (word splitting) e expande curingas (globbing). Por isso, quote SEMPRE: "$var". Aspas duplas preservam espaços e ainda expandem $var; aspas simples não expandem nada. Arrays guardam várias palavras com segurança: use "${lista[@]}" (cada elemento vira um argumento, mesmo com espaços). Arrays associativos (declare -A) mapeiam chave -> valor. O shellcheck é um analisador estático que aponta esses erros antes de você rodar o script.',
            `f="meu arquivo.txt"; touch "$f"
ls $f          # ERRADO: ls: cannot access 'meu' ... 'arquivo.txt'
ls "$f"        # certo: meu arquivo.txt
frutas=(maca "uva verde" pera)
echo "\${#frutas[@]}"           # 3
for x in "\${frutas[@]}"; do echo "[$x]"; done   # [maca] [uva verde] [pera]
declare -A idade; idade[ana]=30; echo "\${idade[ana]}"   # 30`
          ),
          sl(
            'Expansão de parâmetros',
            'O bash manipula strings sem chamar programas externos. ${v:-padrão}: usa "padrão" se v estiver vazia/ausente. ${v:=padrão}: idem, e também atribui. ${#v}: tamanho. ${v#padrão} e ${v##padrão}: removem do INÍCIO o menor/maior trecho que casa. ${v%padrão} e ${v%%padrão}: removem do FIM o menor/maior. ${v/a/b}: substitui a primeira ocorrência (// substitui todas). Memorize: # está à esquerda no teclado (início), % à direita (fim).',
            `arq=/var/log/app.tar.gz
echo "\${arq##*/}"     # app.tar.gz   (nome do arquivo)
echo "\${arq%.gz}"      # /var/log/app.tar
echo "\${arq%%.*}"      # /var/log/app
echo "\${arq#/var}"     # /log/app.tar.gz
echo "\${#arq}"         # 19
unset x; echo "\${x:-padrao}"   # padrao
echo "\${arq/log/tmp}"  # /var/tmp/app.tar.gz`
          ),
          sl(
            'Here-docs, here-strings, printf e processos substituídos',
            'Here-doc (<<EOF) envia várias linhas à entrada de um comando; com o delimitador entre aspas (<<\'EOF\') o texto é literal, sem expandir variáveis. Here-string (<<<"texto") entrega uma string como entrada. printf é mais previsível que echo: echo -n e echo -e variam entre shells, e um argumento como -n pode ser tomado como opção; printf \'%s\\n\' "$x" imprime exatamente o texto. Substituição de processo <(comando) apresenta a saída de um comando como se fosse um arquivo: diff <(sort A) <(sort B).',
            `nome=Ana
cat <<EOF
Ola $nome
EOF
# Ola Ana
cat <<'EOF'
Ola $nome
EOF
# Ola $nome
grep -c a <<< "banana"          # 1
printf '%s\\n' "-n"              # -n   (echo "-n" não imprime nada)
printf '%5.2f|%-5s|%05d\\n' 3.14159 ab 42   #  3.14|ab   |00042
diff <(sort A) <(sort B)`
          ),
          sl(
            'Subshells, chaves e a armadilha do pipe',
            '( ... ) roda os comandos em um subshell: um processo filho, cujas variáveis e cd não afetam o shell original. { ...; } agrupa no MESMO shell (precisa de espaço depois de { e ; antes de }). Cada etapa de um pipe também roda em subshell: um while read alimentado por pipe perde as variáveis alteradas dentro dele. A solução é a substituição de processo, que mantém o laço no shell atual.',
            `x=1; (x=2); echo $x          # 1  (subshell não altera)
{ x=3; }; echo $x             # 3  (mesmo shell)
cont=0; printf 'a\\nb\\n' | while read l; do cont=$((cont+1)); done; echo $cont   # 0 (!)
cont=0; while read l; do cont=$((cont+1)); done < <(printf 'a\\nb\\n'); echo $cont # 2`
          ),
          sl(
            'set -euo pipefail e suas armadilhas',
            'É o "modo estrito" mais usado. set -e: encerra o script quando um comando falha. set -u: erro ao usar variável não definida (pega typos como $DIRETORIO vazio, que viraria rm -rf /$DIRETORIO...). set -o pipefail: o pipeline falha se QUALQUER etapa falhar (sem isso, vale só o código da última). Armadilhas: o set -e é ignorado em comandos testados (if, while, lado esquerdo de && e ||), então "false && echo a; echo depois" continua; em x=$(comando), a falha só é pega se for a atribuição pura; ((i++)) devolve 1 quando i era 0 e derruba o script. Não é mágico: trate erros importantes explicitamente.',
            `set -euo pipefail
false | true; echo $?          # com pipefail: 1 (sem ele: 0)
bash -c 'set -e; false && echo a; echo depois'   # imprime: depois
bash -c 'set -e; x=$(false); echo nao-chega'     # encerra sem imprimir`
          ),
          sl(
            'trap, mktemp, getopts, funções e depuração',
            'trap \'comandos\' EXIT executa a limpeza quando o script termina, normalmente ou por erro. mktemp cria arquivos/diretórios temporários com nome único e permissão restrita (mktemp -d para diretório): evita nomes previsíveis em /tmp, que permitem ataques de substituição. getopts lê opções: "vf:" aceita -v e -f valor (em $OPTARG); depois de processar, shift $((OPTIND-1)) descarta as opções e deixa os argumentos restantes. Funções e bibliotecas: defina funções e reutilize com source ./lib.sh (ou . ./lib.sh). Depuração: bash -x script.sh imprime cada comando com + antes de executar. Portabilidade: #!/bin/sh costuma ser dash em Debian/Ubuntu e não tem arrays, [[ ]] nem <( ); use #!/usr/bin/env bash quando precisar de recursos do bash.',
            `tmp=$(mktemp -d)
trap 'rm -rf -- "$tmp"; echo limpo' EXIT
while getopts "vf:" op; do
  case $op in
    v) v=1 ;;
    f) arq=$OPTARG ;;
    *) echo "uso: $0 [-v] [-f arq]" >&2; exit 2 ;;
  esac
done
shift $((OPTIND-1))
bash -x -c 'a=2; echo $((a*3))'
# + a=2
# + echo 6`
          ),
          sl(
            'Segurança de scripts',
            'Nunca passe entrada não confiável a eval, a bash -c ou a comandos montados por concatenação: é injeção de comandos. Quote sempre as variáveis e use -- para encerrar opções (rm -- "$arq": um nome de arquivo começando com - não vira opção). Não vaze segredos: argumentos aparecem em ps e /proc/<PID>/cmdline, e comandos digitados vão para o histórico. Leia senhas com read -rs (sem eco), use arquivos com permissão 600 ou variáveis de ambiente cuidadosamente, e jamais coloque tokens no código ou em repositórios. Valide entradas (listas de valores permitidos), use caminhos absolutos para comandos críticos e evite curl ... | bash sem ler o conteúdo.',
            `# PERIGOSO: entrada do usuário vira código
eval "rm $arquivo_do_usuario"
# melhor:
rm -- "$arquivo_validado"
read -rs -p "Senha: " SENHA   # sem eco; não passar como argumento de outro programa`
          )
        ]
      },
      questions: [
        mcq('q1', 'O que ocorre com os comandos abaixo?\nf="meu arquivo.txt"; touch "$f"\nls $f', 'c', [
          'Lista meu arquivo.txt normalmente',
          'Apaga o arquivo, pois a variável sem aspas é interpretada como uma opção do ls que remove o que foi listado do diretório',
          'Falha: o shell divide em duas palavras (meu e arquivo.txt) e o ls procura dois arquivos inexistentes; o correto é ls "$f"',
          'Imprime apenas a palavra meu'
        ], 'Variáveis sem aspas sofrem word splitting. O shellcheck avisa sobre esse tipo de erro.'),
        mcq('q2', 'Qual a diferença entre <<EOF e <<\'EOF\' em um here-doc?', 'd', [
          'Nenhuma: as aspas são ignoradas',
          'Com aspas, o texto é gravado em arquivo temporário',
          'Sem aspas, o texto é interpretado como outro script e executado',
          'Sem aspas, variáveis como $nome são expandidas; com aspas simples no delimitador, o texto é literal'
        ], 'Com <<\'EOF\' o texto é literal. Isso também protege de expansões indesejadas ao escrever arquivos de configuração.'),
        mcq('q3', 'Quais efeitos tem set -euo pipefail, e qual armadilha existe?', 'a', [
          'Encerra em comando falho (-e), erra com variável não definida (-u) e falha se qualquer etapa do pipe falhar; mas -e é ignorado em testes como if e no lado esquerdo de &&',
          'Faz o script tratar toda falha de qualquer comando, inclusive dentro de if, while e listas com && e ||, e ainda limpa os temporários ao encerrar, garantindo que nenhum erro passe despercebido no pipeline',
          'Faz o script rodar em background e ignorar sinais',
          'Ativa a depuração e imprime cada comando executado'
        ], '-x (não -e) imprime os comandos. O modo estrito ajuda, mas não substitui tratar erros importantes.'),
        fill('q4', 'Complete a expansão que remove tudo até a última barra de arq=/var/log/app.tar.gz, deixando app.tar.gz.', 'echo "${arq___*/}"', ['##'], '${var##*/} remove o maior prefixo que casa com */ (é o basename). ${var#*/} removeria só o menor.'),
        mcq('q5', 'O script imprime 0 em vez de 2. Qual a causa e a correção?\ncont=0\nprintf \'a\\nb\\n\' | while read l; do cont=$((cont+1)); done\necho $cont', 'b', [
          'O read não funciona quando a entrada vem de printf, pois ele só lê de arquivos; troque printf por echo e o laço contará certo',
          'O pipe executa o while em um subshell, então a alteração de cont se perde; use while ... done < <(printf ...)',
          'A variável cont precisa ser declarada com declare -A',
          'O while exige set -e para contar, pois sem ele o shell encerra o laço depois da primeira linha lida do pipe e não atualiza a variável'
        ], 'Cada etapa de um pipe roda em subshell. A substituição de processo mantém o laço no shell atual.'),
        mcq('q6', 'Qual a combinação correta para criar um temporário seguro e garantir que seja apagado ao final?', 'd', [
          'tmp=/tmp/dados e rm -rf /tmp/dados no último comando',
          'tmp=/tmp/$RANDOM e esquecer a limpeza, pois o /tmp é limpo no boot',
          'tmp=$(date +%s) e trap em SIGKILL',
          'tmp=$(mktemp -d) e trap \'rm -rf -- "$tmp"\' EXIT'
        ], 'mktemp gera nome único com permissão restrita; trap ... EXIT limpa mesmo se o script falhar.'),
        mcq('q7', 'Qual prática torna um script mais seguro?', 'c', [
          'Montar comandos com entradas do usuário e executar com eval, para ser flexível',
          'Passar a senha do banco como argumento (--senha=...), para o processo filho ler fácil, já que o ambiente do filho é protegido e ninguém consegue ver os argumentos de outro processo',
          'Quotar variáveis, usar -- antes de nomes de arquivos, ler segredos com read -rs ou de arquivo com permissão 600 e nunca usar eval com entrada não confiável',
          'Remover as aspas das variáveis para o shell expandir curingas'
        ], 'eval com entrada externa é injeção de comandos; argumentos vazam em ps; sem aspas, nomes com espaços ou curingas quebram o script.'),
        fill('q8', 'Complete a variável do getopts que, após o laço, indica o índice do primeiro argumento que não é opção (usada em shift $((___-1))).', 'shift $((___-1))', ['OPTIND', '$OPTIND'], 'shift $((OPTIND-1)) descarta as opções já processadas e deixa os argumentos em $1, $2...')
      ]
    },
    {
      id: 'lni-15-sed-awk-jq',
      title: 'sed, awk e jq',
      goal: 'Transformar e analisar texto e JSON na linha de comando com sed, awk, jq e utilitários como column, paste, join e comm.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'sed: endereços e comandos',
            'O sed lê linha a linha, aplica comandos e imprime. Um comando pode ter endereço: um número (2), um intervalo (2,5), a última linha ($) ou uma regex (/admin/). -n suprime a impressão automática e p imprime só o que você pede; d apaga; a\\texto acrescenta DEPOIS da linha, i\\texto insere ANTES e c\\texto substitui a linha. y/abc/xyz/ troca caractere a caractere. -i edita o arquivo no lugar (use -i.bak para guardar cópia de segurança antes). O hold space (h/H/g/G) é um segundo buffer para casos avançados, como juntar linhas; só o conhecemos de nome por aqui.',
            `printf 'a\\nb\\nc\\n' | sed -n '2,3p'      # b c
printf 'a\\nb\\nc\\n' | sed '2d'            # a c
printf 'a\\nb\\nc\\n' | sed '2i\\inserido'   # a inserido b c
printf 'a\\nb\\nc\\n' | sed '2c\\trocada'    # a trocada c
echo abc | sed 'y/abc/xyz/'               # xyz
sed -i.bak 's/a/X/' arquivo.txt           # cria arquivo.txt.bak`
          ),
          sl(
            'sed: substituição com grupos',
            's/regex/novo/flags substitui. Flag g troca todas as ocorrências da linha. & no texto novo é o trecho que casou. Com -E (regex estendida), (grupos) capturam e \\1, \\2 os reutilizam, permitindo reordenar. Vários comandos podem ser separados por ; ou -e.',
            `echo 'Ana Silva' | sed -E 's/([A-Za-z]+) ([A-Za-z]+)/\\2, \\1/'   # Silva, Ana
echo 'preco 10' | sed 's/[0-9]\\+/(&)/'                         # preco (10)
sed 's/x/y/g;s/a/b/' <<< "xax"                                  # yby`
          ),
          sl(
            'awk: campos, padrões, BEGIN e END',
            'O awk processa linha por linha, dividindo em campos: $1, $2, ... $NF (o último); $0 é a linha toda. -F define o separador. Um programa é uma lista de "padrão { ação }". NR é o número da linha atual e NF a quantidade de campos. BEGIN roda antes de ler qualquer linha e END depois da última. Condições como $9==401 filtram. printf formata a saída como no C.',
            `awk -F: '{print $1}' <<< "root:x:0:0"                         # root
awk 'BEGIN{print "ini"} NR==2{print $2} END{print NR " linhas"}' <<< $'a b\\nc d\\ne f'
# ini / d / 3 linhas
awk '{b+=$NF} END{printf "total=%d media=%.1f\\n", b, b/NR}' acesso.log
# total=1059 media=176.5`
          ),
          sl(
            'awk: arrays associativos e funções',
            'Arrays do awk são associativos: c[$1]++ conta ocorrências por chave (valor inicial 0). No END, for (k in c) percorre as chaves (ordem não garantida; combine com sort). Funções embutidas: length(s), substr(s,início,tamanho), index(s,t), toupper, tolower, split(s,arr,sep), sprintf. Um uso clássico é resumir logs: quantas requisições por IP.',
            `awk '{c[$1]++} END{for(k in c) print k, c[k]}' acesso.log | sort
# 192.0.2.10 2
# 198.51.100.7 3
# 203.0.113.9 1
awk 'BEGIN{print length("abcd"), toupper("ab"), substr("abcdef",2,3), index("abc","c")}'
# 4 AB bcd 3`
          ),
          sl(
            'jq: consultar e transformar JSON',
            'jq é o "sed/awk do JSON". O filtro . representa a entrada; .campo acessa um campo; .[] itera sobre um array; | encadeia filtros (como pipe); select(condição) filtra; map(filtro) aplica a cada elemento; length conta itens. A saída vem formatada e strings aparecem entre aspas: -r (raw) as imprime sem aspas, útil em scripts; -c deixa a saída compacta. Instale com o gerenciador de pacotes (apt install jq).',
            `echo '{"nome":"Ana","itens":[{"id":1,"ok":true},{"id":2,"ok":false}]}' > d.json
jq -r '.nome' d.json                          # Ana
jq '.itens | length' d.json                   # 2
jq '.itens[] | select(.ok) | .id' d.json      # 1
jq -c '.itens | map(.id)' d.json              # [1,2]`
          ),
          sl(
            'column, paste, join e comm',
            'column -t alinha texto em colunas legíveis. paste junta arquivos lado a lado (-d define o separador). join une duas listas por um campo comum, como um JOIN de banco (as entradas devem estar ordenadas por esse campo). comm compara DOIS arquivos ordenados e mostra três colunas: só no 1º, só no 2º, em ambos; -12 mostra só as linhas comuns (suprime as colunas 1 e 2). Ordene antes com sort.',
            `printf 'nome valor\\nana 1\\nrui 22\\n' | column -t
# nome  valor / ana   1 / rui   22
printf '1 ana\\n2 rui\\n' > p1; printf '1 SP\\n2 RJ\\n' > p2; join p1 p2
# 1 ana SP / 2 rui RJ
printf 'a\\nb\\nc\\n' > A; printf 'b\\nc\\nd\\n' > B; comm -12 A B     # b c`
          ),
          sl(
            'Pipelines de análise de log (dados fictícios)',
            'Combinar as peças resolve a maioria das análises: extrair campo -> contar -> ordenar. Em acesso.log (IPs de documentação), "quais IPs mais acessam?" é awk \'{print $1}\' | sort | uniq -c | sort -rn. "Quais IPs receberam 401 (não autorizado) e quantas vezes?" é awk filtrando o campo de status. Para logs reais, trate IPs e usuários como dados pessoais (LGPD): minimize, anonimize ao compartilhar e defina retenção.',
            `awk '{print $1}' acesso.log | sort | uniq -c | sort -rn
#       3 198.51.100.7
#       2 192.0.2.10
#       1 203.0.113.9
awk '$(NF-1)==401{c[$1]++} END{for(k in c) print k, c[k]}' acesso.log
# 198.51.100.7 3`
          )
        ]
      },
      questions: [
        mcq('q1', 'O que imprime printf \'a\\nb\\nc\\n\' | sed -n \'2,3p\'?', 'b', [
          'a e b',
          'b e c',
          'Todas as linhas, com a 2 e a 3 duplicadas',
          'Somente a linha c'
        ], '-n desliga a impressão automática e 2,3p imprime só as linhas 2 a 3.'),
        mcq('q2', 'Qual é a saída?\necho \'Ana Silva\' | sed -E \'s/([A-Za-z]+) ([A-Za-z]+)/\\2, \\1/\'', 'd', [
          'Ana, Silva',
          'Ana Silva, Ana Silva',
          '\\2, \\1',
          'Silva, Ana'
        ], 'Os grupos capturam cada palavra; \\2 e \\1 as reutilizam na ordem inversa.'),
        mcq('q3', 'Com o arquivo acesso.log do exemplo, o que faz awk \'{c[$1]++} END{for(k in c) print k, c[k]}\'?', 'a', [
          'Imprime cada valor distinto do 1º campo (IP) com a quantidade de linhas em que aparece (ordem não garantida)',
          'Soma os valores do último campo',
          'Imprime só a primeira linha do arquivo',
          'Ordena o arquivo por IP e remove os duplicados, imprimindo cada endereço uma única vez, sem contagem, em ordem alfabética estrita'
        ], 'c[$1]++ conta por chave; o END percorre o array. Para ordem, passe pelo sort.'),
        fill('q4', 'Complete a expressão do awk que imprime o ÚLTIMO campo de cada linha do /etc/passwd (o shell de login).', 'awk -F: \'{print ___}\' /etc/passwd', ['$NF'], '$NF é o campo de número NF (o último); $1 é o primeiro e $0 a linha inteira.'),
        mcq('q5', 'Dado d.json = {"itens":[{"id":1,"ok":true},{"id":2,"ok":false}]}, o que imprime jq \'.itens[] | select(.ok) | .id\' d.json?', 'c', [
          '[1,2]',
          '2',
          '1',
          'true'
        ], '.itens[] itera; select(.ok) mantém só os com ok verdadeiro; .id extrai o id.'),
        mcq('q6', 'Para que serve comm -12 A B e qual o requisito?', 'b', [
          'Mostra as linhas só do arquivo A, sem exigir ordenação, e descarta as que também aparecem no arquivo B',
          'Mostra as linhas comuns aos dois arquivos, que precisam estar ordenados',
          'Junta A e B lado a lado, separados por vírgula, mantendo a ordem original das linhas de cada um',
          'Compara os bytes dos dois arquivos, um a um, e imprime a diferença entre eles'
        ], '-1 e -2 suprimem as colunas "só em A" e "só em B"; sobram as linhas em comum. Ordene com sort antes.'),
        mcq('q7', 'Qual pipeline mostra os IPs do acesso.log, do que mais acessa para o que menos acessa?', 'd', [
          'sort acesso.log | uniq -c | sort -n | awk \'{print $2, $1}\' | head -n 20',
          'awk \'{print $1}\' acesso.log | uniq -c | sort -rn | head -n 5',
          'sed -n \'1p\' acesso.log | sort -rn',
          'awk \'{print $1}\' acesso.log | sort | uniq -c | sort -rn'
        ], 'uniq só junta linhas adjacentes, por isso o sort antes; sort -rn ordena as contagens do maior para o menor.'),
        fill('q8', 'Complete a opção do jq que imprime strings sem aspas (modo raw).', 'jq ___ \'.nome\' d.json', ['-r', '--raw-output'], 'jq -r mostra Ana em vez de "Ana", útil para atribuir a variáveis no shell.')
      ]
    },
    {
      id: 'lni-16-regex',
      title: 'Expressões regulares',
      goal: 'Dominar regex em grep, sed e awk: sabores (BRE, ERE, PCRE), âncoras, classes, quantificadores, grupos, referências, limites de validação e o risco de ReDoS.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Três sabores: BRE, ERE e PCRE',
            'Uma regex descreve um padrão de texto. Há sabores diferentes. BRE (básica): o padrão do grep e do sed; os operadores +, ?, | e ( ) são LITERAIS e precisam de barra para virar operadores no GNU (a\\+, \\(ab\\)). ERE (estendida): grep -E, sed -E e awk; +, ?, |, ( ) e { } já são operadores, e é a forma mais legível. PCRE (compatível com Perl): grep -P, quando disponível, acrescenta \\d, lookahead/lookbehind e quantificadores preguiçosos (.*?). Confirme sempre qual sabor sua ferramenta usa.',
            `echo "a+b" | grep 'a+b'        # a+b   (BRE: + é literal)
echo "aab" | grep 'a\\+b'        # aab   (BRE GNU: \\+ é operador)
echo "aab" | grep -E 'a+b'      # aab   (ERE: + é operador)
echo "foo123" | grep -oP '\\d+'  # 123   (PCRE)`
          ),
          sl(
            'Âncoras, curinga e classes',
            'Âncoras: ^ início da linha, $ fim da linha ("^abc$" casa só a linha exata). O ponto . casa qualquer caractere; para o ponto literal, escape: \\. . Colchetes [abc] casam um caractere do conjunto, [a-z] um intervalo, [^0-9] qualquer caractere EXCETO dígitos. Classes POSIX, que funcionam em grep, sed e awk e respeitam o idioma: [[:alpha:]] letras, [[:digit:]] dígitos, [[:alnum:]] letras e dígitos, [[:upper:]] e [[:lower:]], [[:space:]] espaços e quebras. Note os colchetes duplos: a classe vai DENTRO de um conjunto.',
            `echo "Linha1" | grep -E '^[[:upper:]][[:lower:]]+[[:digit:]]$'   # Linha1
echo "a.b" | grep -o 'a\\.b'      # a.b
echo "axb" | grep -c 'a.b'       # 1  (. casa x)
echo "axb" | grep -cF 'a.b'      # 0  (-F: texto fixo, sem regex)`
          ),
          sl(
            'Quantificadores e a gula (greedy)',
            'Quantificadores dizem quantas vezes repetir o item anterior: * (zero ou mais), + (uma ou mais), ? (zero ou uma), {n} (exatamente n), {n,m} (entre n e m). Por padrão são gulosos: casam o MÁXIMO possível. Em "<b>x</b><b>y</b>", o padrão <b>.*</b> casa tudo do primeiro <b> até o último </b>. No PCRE, .*? é preguiçoso e para no primeiro </b>. Em ERE, uma alternativa é excluir o caractere final: <b>[^<]*</b>.',
            `echo "<b>x</b><b>y</b>" | grep -oE '<b>.*</b>'      # <b>x</b><b>y</b>
echo "<b>x</b><b>y</b>" | grep -oP '<b>.*?</b>'     # <b>x</b>  e  <b>y</b>
echo "2025-03-10" | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}'   # 2025-03-10`
          ),
          sl(
            'Grupos, alternância e referências',
            'Parênteses agrupam (para aplicar quantificadores ao grupo) e capturam o trecho. \\1, \\2... referenciam o que o grupo 1, 2... capturou: (ab)\\1 casa "abab", mas não "abcd". A barra | é a alternância ("ou"): cat|dog casa um ou outro; use parênteses para delimitar o alcance: ^(cat|dog)s?$. Para usar um metacaractere como texto, escape com barra invertida: \\. \\* \\( \\$. No sed, os grupos servem também ao reordenar texto (s/(a)(b)/\\2\\1/).',
            `echo "abab" | grep -E '(ab)\\1'          # abab
echo "abcab" | grep -E '(ab)c\\1'        # abcab
echo "cat dog" | grep -oE 'cat|dog'      # cat  dog
echo "abc abc" | sed -E 's/(a)(b)/\\2\\1/g'   # bac bac`
          ),
          sl(
            'Expressões úteis e o limite da validação',
            'Útil: IPv4 (formato) \\b([0-9]{1,3}\\.){3}[0-9]{1,3}\\b; data ISO [0-9]{4}-[0-9]{2}-[0-9]{2}; e-mail simples [[:alnum:]._+-]+@[[:alnum:].-]+\\.[[:alpha:]]{2,}. Mas regex verifica FORMA, não significado: 999.999.999.999 casa com o padrão de IP, e 2025-13-45 casa com o de data. E-mail válido pelo padrão da internet é bem mais complexo do que qualquer regex razoável, e a única prova de que existe é enviar uma mensagem e receber a confirmação. Documentos com dígito verificador (como CPF) exigem cálculo em código, além do formato. Use a regex como filtro rápido, nunca como única validação — e teste sempre com dados fictícios.',
            `echo "ip 192.0.2.10 e 10.0.0.1" | grep -oE '([0-9]{1,3}\\.){3}[0-9]{1,3}'
# 192.0.2.10
# 10.0.0.1
echo "999.999.999.999" | grep -E '^([0-9]{1,3}\\.){3}[0-9]{1,3}$'   # casa (!)
echo "2025-13-45" | grep -E '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'         # casa (!)
echo "ana@exemplo.com" | grep -E '^[[:alnum:]._+-]+@[[:alnum:].-]+\\.[[:alpha:]]{2,}$'`
          ),
          sl(
            'Opções do grep e comparação entre ferramentas',
            'grep -o imprime só o trecho que casou (um por linha), -E ativa ERE, -c conta linhas, -i ignora maiúsculas, -v inverte, -w casa palavra inteira, -n mostra número da linha, -F trata o padrão como texto fixo. sed e awk usam regex também: sed (BRE por padrão, ERE com -E), awk (ERE; use /padrão/ como condição). Para o mesmo problema, grep -E, sed -E e awk aceitam praticamente a mesma sintaxe ERE; o que muda é a ação (filtrar, substituir, calcular).',
            `echo "foo123" | grep -oP '(?<=foo)\\d+'    # 123 (lookbehind, só PCRE)
echo 'x' | awk '/^x$/{print "ok"}'         # ok
echo "banana" | grep -o 'an'                # an  an`
          ),
          sl(
            'ReDoS: backtracking catastrófico (visão geral)',
            'Motores com backtracking (PCRE, Perl, Python, JavaScript) tentam caminhos alternativos quando um não casa. Com padrões ambíguos, como quantificadores aninhados (a+)+ ou (a|a)*, e uma entrada que quase casa (muitos "a" seguidos de um caractere diferente), o número de caminhos cresce exponencialmente e um único pedido pode travar a CPU: é o ReDoS (negação de serviço por regex), risco real quando a regex vem de usuários ou valida texto de usuários. Defesas: evitar quantificadores aninhados e alternâncias sobrepostas, limitar o tamanho da entrada, usar timeouts e preferir motores sem backtracking (como RE2 e os de grep -E/awk, baseados em autômatos). Por isso, nunca aceite regex arbitrária vinda de fora.',
            `# padrão perigoso (conceito): (a+)+$
# entrada que quase casa: aaaaaaaaaaaaaaaaaaaaaaaa!
# em motores com backtracking, o tempo explode com o tamanho da entrada`
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual comando imprime 123 a partir de "foo123", usando \\d?', 'c', [
          'echo "foo123" | grep -o \'\\d+\'',
          'echo "foo123" | grep -oE \'\\d+\' | head -n 1',
          'echo "foo123" | grep -oP \'\\d+\'',
          'echo "foo123" | grep -F \'\\d+\' | head -n 1'
        ], '\\d é do PCRE (grep -P, quando disponível). Em BRE/ERE use [0-9] ou [[:digit:]].'),
        mcq('q2', 'Qual comando casa a data 2025-03-10 mas também aceita, indevidamente, 2025-13-45?', 'd', [
          'grep -E \'^[0-9]{2}/[0-9]{2}/[0-9]{4}$\' datas.txt',
          'grep -F \'2025-03-10\'',
          'grep -E \'^[0-9]{4}$\'',
          'grep -E \'^[0-9]{4}-[0-9]{2}-[0-9]{2}$\''
        ], 'Regex confere a forma, não o calendário: mês 13 e dia 45 têm o mesmo formato. Valide o significado em código.'),
        mcq('q3', 'Qual é a saída?\necho "<b>x</b><b>y</b>" | grep -oE \'<b>.*</b>\'', 'a', [
          '<b>x</b><b>y</b> (uma linha só: o .* é guloso)',
          '<b>x</b> e <b>y</b> em duas linhas separadas, pois o ERE faz a busca preguiçosa por padrão',
          'Nada, pois o ERE não aceita o curinga .* depois de uma tag e exige o modo PCRE',
          'x e y, sem as tags, cada um impresso em uma linha'
        ], 'O quantificador guloso casa até o último </b>. Para parar no primeiro, use PCRE (.*?) ou [^<]*.'),
        fill('q4', 'Complete a opção do grep que ativa regex estendida (ERE), para que + e {2,} sejam operadores.', 'echo "ana@exemplo.com" | grep ___ \'^[[:alnum:]._+-]+@[[:alnum:].-]+\\.[[:alpha:]]{2,}$\'', ['-E', '--extended-regexp', '-Eq', '-Ei'], 'grep -E (ou egrep) usa ERE. Em BRE seria preciso escapar: \\+ e \\{2,\\}.'),
        mcq('q5', 'O que o padrão (ab)\\1 casa em grep -E?', 'b', [
          'Qualquer sequência de dois caracteres, pois o 1 depois da barra indica a quantidade de repetições',
          'abab: o \\1 repete o texto capturado pelo primeiro grupo',
          'ab seguido do número 1, pois a barra invertida só transforma o dígito em literal',
          'Somente a linha "ab\\1" escrita literalmente'
        ], 'Referência para trás: \\1 casa de novo exatamente o que o grupo 1 capturou.'),
        mcq('q6', 'O que é ReDoS e como reduzir o risco?', 'd', [
          'Um vírus que se espalha por regex; basta usar grep -i',
          'Uma falha de disco causada por excesso de leituras de arquivos de log; reduza instalando mais memória RAM e movendo o log para um disco mais rápido e dedicado do servidor',
          'Uma falha do shell ao ler arquivos grandes; use set -e',
          'Esgotar a CPU com uma entrada que provoca backtracking exponencial; evite quantificadores aninhados, limite a entrada, use timeouts ou motores sem backtracking'
        ], 'Padrões como (a+)+$ com entrada quase casando disparam backtracking catastrófico. Não aceite regex arbitrária de fora.'),
        mcq('q7', 'Por que validar e-mail ou CPF apenas com regex é frágil?', 'a', [
          'A regex confere o formato, não a existência nem o dígito verificador; e-mail real exige confirmação por mensagem e CPF exige cálculo em código',
          'Porque regex não aceita o caractere @ nem pontos em sequência, e por isso nenhum e-mail real passa por um padrão de validação escrito por uma pessoa experiente',
          'Porque regex só funciona com números',
          'Porque o grep não aceita ponto em padrões'
        ], 'Formato correto não garante validade. Use a regex como filtro inicial e valide o resto com lógica e confirmação.'),
        fill('q8', 'Complete a classe POSIX que casa um dígito, dentro dos colchetes.', 'echo "x9" | grep -o \'[[:___:]]\'', ['digit'], '[[:digit:]] equivale a [0-9] e respeita o idioma; outras classes: alpha, alnum, upper, lower, space.')
      ]
    },
    {
      id: 'lni-17-agendamento-automacao',
      title: 'Agendamento e automação',
      goal: 'Agendar tarefas com cron, anacron, systemd timers e at, evitar execuções sobrepostas, escrever scripts idempotentes e proteger tarefas agendadas.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'cron em profundidade',
            'Cada linha de um crontab tem 5 campos de horário seguidos do comando: minuto, hora, dia do mês, mês, dia da semana (0-7, em que 0 e 7 são domingo). * = qualquer valor, */5 = a cada 5, 1-5 = intervalo, 1,15 = lista. Atalhos: @reboot, @daily, @hourly. O crontab de usuário (crontab -e) tem 5 campos + comando e roda como aquele usuário. O de sistema (/etc/crontab e arquivos em /etc/cron.d/) tem um SEXTO campo, o usuário que executa. As pastas /etc/cron.hourly, cron.daily, cron.weekly e cron.monthly contêm scripts executáveis (sem campo de horário). No Debian, o run-parts ignora nomes com ponto: backup.sh NÃO roda na cron.daily, mas backup roda.',
            '# crontab de usuário: min hora dia mes dsem comando\n30 2 * * 1-5 /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1\n*/10 * * * * /usr/local/bin/coleta.sh\n\n# /etc/cron.d/relatorio (tem o campo de usuário)\n0 6 * * * root /usr/local/bin/relatorio.sh'
          ),
          sl(
            'Ambiente do cron e variáveis',
            'O cron roda com ambiente mínimo: PATH curto (por exemplo /usr/bin:/bin), shell /bin/sh, sem suas variáveis e sem seu terminal. Por isso "funciona no terminal, mas não no cron": use caminhos absolutos para comandos e arquivos. Variáveis podem ser definidas no topo do crontab: PATH=, SHELL=/bin/bash e MAILTO= (para onde enviar a saída; vazio desativa o e-mail). Sem redirecionar, a saída do job vira e-mail local. Redirecione para um log: >> arquivo 2>&1. Atenção: no crontab o caractere % tem significado especial (vira quebra de linha) e precisa ser escrito \\%, como em date +\\%F.',
            'SHELL=/bin/bash\nPATH=/usr/local/bin:/usr/bin:/bin\nMAILTO=admin@exemplo.org\n0 3 * * * /usr/local/bin/limpeza.sh >> /var/log/limpeza.log 2>&1\n15 3 * * * tar czf /backup/dados-$(date +\\%F).tgz /srv/dados'
          ),
          sl(
            'anacron e systemd timers',
            'Cron perde a execução se a máquina estiver desligada na hora. anacron resolve isso para notebooks e desktops: roda tarefas periódicas (diárias, semanais, mensais) que "perdeu", depois de ligar, com um atraso configurável em /etc/anacrontab. Os systemd timers fazem o mesmo e mais: um arquivo .timer agenda um .service de mesmo nome. OnCalendar= define a agenda (ex.: *-*-* 02:30:00 ou daily); Persistent=true executa, ao ligar, a execução perdida; systemctl list-timers mostra próximos disparos; systemd-analyze calendar "Mon *-*-* 03:00" confere a expressão. Vantagens: logs no journal, dependências, limites de recursos.',
            '# /etc/systemd/system/limpeza.timer\n[Unit]\nDescription=Limpeza diaria\n[Timer]\nOnCalendar=*-*-* 02:30:00\nPersistent=true\n[Install]\nWantedBy=timers.target\n\nsudo systemctl enable --now limpeza.timer\nsystemctl list-timers\nsystemd-analyze calendar "Mon *-*-* 03:00"'
          ),
          sl(
            'at e batch: tarefas únicas',
            'Para rodar algo UMA vez no futuro, use at. at 02:00 (e depois digite os comandos, terminando com Ctrl+D) ou echo "comando" | at now + 1 hour. atq lista os jobs pendentes e atrm <número> remove. batch executa quando a carga do sistema estiver baixa. É útil, por exemplo, para agendar a reversão de uma mudança arriscada. O serviço atd precisa estar ativo.',
            'echo "/usr/local/bin/migracao.sh" | at 02:00\nat now + 30 minutes\natq\n# exemplo: 3  Mon Mar 10 02:00:00 2025 a ana\natrm 3'
          ),
          sl(
            'Evitar execuções sobrepostas: flock',
            'Se um job demora mais que o intervalo, o cron inicia outra cópia por cima da anterior (corrupção, carga dobrada). O flock usa um arquivo de trava (lockfile): flock -n /var/lock/job.lock comando executa apenas se conseguir a trava; com -n (não bloquear), se já houver outra instância ele sai imediatamente com código 1 em vez de esperar. A trava é do kernel e é liberada sozinha quando o processo termina, mesmo se travar. Alternativa portátil: mkdir "$lock" (operação atômica: só um processo consegue criar) com trap para remover no fim; ela exige a limpeza no trap, senão uma queda deixa a trava presa.',
            '*/5 * * * * flock -n /var/lock/coleta.lock /usr/local/bin/coleta.sh\n\n# alternativa portátil (testada em bash):\nlock=/tmp/exemplo.lock.d\nif mkdir "$lock" 2>/dev/null; then\n  trap \'rmdir "$lock"\' EXIT\n  echo "rodando"; sleep 2; echo "fim"\nelse\n  echo "ja em execucao, saindo"; exit 0\nfi'
          ),
          sl(
            'Idempotência, logs, códigos de saída e falhas',
            'Um script agendado deve ser idempotente: rodar duas vezes (por atraso, sobreposição ou repetição manual) dá o mesmo resultado que uma. Exemplos: mkdir -p, rsync em vez de copiar tudo, gravar em arquivo temporário e mv ao final (atômico), checar antes de agir. Use set -euo pipefail e termine com código 0 só se deu certo (diferente de 0 indica falha). Registre: logger -t meujob "mensagem" envia ao journal/syslog. Notifique falhas: MAILTO no cron, OnFailure= no systemd (aciona uma unidade de alerta) ou um ping de monitoramento no fim do script; sem notificação, falhas silenciosas passam meses. Cuidado com dados pessoais nos logs (minimize e defina retenção).',
            '#!/usr/bin/env bash\nset -euo pipefail\ntmp=$(mktemp)\ntrap \'rm -f -- "$tmp"\' EXIT\ngerar_relatorio > "$tmp"\nmv -- "$tmp" /srv/relatorios/diario.txt   # troca atômica\nlogger -t relatorio "concluido com sucesso"'
          ),
          sl(
            'Fuso horário, horário de verão e segurança',
            'Cron e timers usam o fuso horário do sistema. Com horário de verão, uma tarefa às 02:30 pode ser pulada (a hora some) ou rodar duas vezes (a hora repete); evite agendar entre 01:00 e 03:00 ou mantenha servidores em UTC. Segurança: tarefas agendadas como root são um caminho clássico de elevação de privilégio. Se um script de root está num arquivo ou diretório gravável por outros, qualquer usuário pode alterá-lo e ser executado como root. Regras: script e diretórios-pai de dono root e sem escrita para grupo/outros (chmod 755 ou 700; nunca em /tmp), use o usuário de menor privilégio possível (crontab do usuário em vez do sistema), caminhos absolutos e, se necessário, restrinja quem usa cron com /etc/cron.allow e /etc/cron.deny.',
            'ls -l /usr/local/bin/backup.sh\n# exemplo bom: -rwxr-xr-x 1 root root ... backup.sh\n# ruim:        -rwxrwxrwx 1 root root ... backup.sh   (qualquer um altera)\nsudo chown root:root /usr/local/bin/backup.sh\nsudo chmod 755 /usr/local/bin/backup.sh'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que faz esta linha de crontab?\n30 2 * * 1-5 /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1', 'c', [
          'Executa o script às 2h30 todos os dias do mês, mas apenas em dezembro, redirecionando os erros para o arquivo de log e a saída para o e-mail',
          'Executa o script a cada 30 minutos, das 2h às 5h, de segunda a sexta-feira, e grava a saída no log',
          'Executa o script às 02:30, de segunda a sexta-feira, acrescentando saída e erros ao log',
          'Executa o script às 30:02 de cada dia 1 a 5 do mês'
        ], 'Campos: minuto 30, hora 2, qualquer dia do mês, qualquer mês, dias da semana 1-5 (segunda a sexta).'),
        mcq('q2', 'Um script funciona no terminal, mas falha no cron com "comando não encontrado". Qual a causa mais provável e a correção?', 'b', [
          'O cron só executa scripts escritos em Python ou em sh, e ignora completamente qualquer linha que chame um binário do sistema',
          'O cron usa um ambiente mínimo (PATH curto); use caminhos absolutos ou defina PATH= no crontab',
          'O cron não aceita redirecionamento de saída para arquivos, e por isso a saída sempre vai para a tela do usuário',
          'O script precisa de permissão 777'
        ], 'O ambiente do cron não herda suas variáveis. Caminho absoluto e PATH= no topo resolvem.'),
        mcq('q3', 'No Debian, o arquivo /etc/cron.daily/backup.sh (executável) não roda. Qual a explicação?', 'd', [
          'O cron.daily só executa arquivos de dono usuário comum',
          'O diretório cron.daily precisa de um campo de horário em cada arquivo',
          'O nome precisa terminar em .sh para ser reconhecido',
          'O run-parts ignora nomes com ponto; renomeie para backup, sem extensão'
        ], 'O run-parts do Debian só executa nomes com letras, dígitos, hífen e sublinhado. Teste com run-parts --test /etc/cron.daily.'),
        fill('q4', 'Complete a opção do flock que desiste imediatamente (sem esperar) se outra instância já estiver rodando.', 'flock ___ /var/lock/job.lock /usr/local/bin/job.sh', ['-n', '--nonblock', '--nb'], 'flock -n não bloqueia: se a trava estiver ocupada, sai com código 1. Evita execuções sobrepostas.'),
        mcq('q5', 'Um notebook costuma ficar desligado às 02:30, quando roda a limpeza diária. Qual solução recupera a execução perdida?', 'a', [
          'Um timer systemd com Persistent=true (ou anacron), que executa a tarefa perdida após ligar',
          'Trocar o cron por @reboot, que roda a tarefa uma vez a cada meia-noite e recupera as execuções perdidas',
          'Adicionar flock -n no comando, que agenda de novo a execução perdida assim que a máquina é ligada de novo',
          'Usar % no crontab para repetir a execução'
        ], 'Persistent=true grava o último disparo e compensa o atraso; anacron faz o mesmo com tarefas periódicas.'),
        mcq('q6', 'O que significa um script agendado ser idempotente?', 'c', [
          'Rodar sempre como root',
          'Rodar mais rápido a cada nova execução, pois guarda em cache o resultado das execuções anteriores e pula todas as etapas já concluídas',
          'Poder rodar mais de uma vez (atraso, repetição, sobreposição) com o mesmo resultado final, sem efeitos colaterais acumulados',
          'Registrar todas as execuções por e-mail'
        ], 'Escrever em temporário e mover ao final, usar mkdir -p e rsync são práticas idempotentes.'),
        mcq('q7', 'Um script /usr/local/bin/backup.sh roda como root pelo cron, mas tem modo 777. Qual o risco?', 'd', [
          'Nenhum: o cron limpa as permissões antes de executar',
          'O cron deixa de rodar o script',
          'O script roda mais devagar por causa da verificação de permissões, pois o cron confere o modo do arquivo antes de cada execução e atrasa quando ele é muito aberto',
          'Qualquer usuário pode alterar o script e seu código será executado como root na próxima execução (elevação de privilégio)'
        ], 'Scripts de root devem pertencer ao root e não ser graváveis por outros (e o mesmo vale para os diretórios-pai).'),
        fill('q8', 'Complete o subcomando do systemctl que lista os timers ativos e seus próximos disparos.', 'systemctl ___', ['list-timers'], 'list-timers mostra NEXT, LEFT, LAST e a unidade ativada por cada timer.')
      ]
    },
    {
      id: 'lni-18-logs-monitoramento',
      title: 'Logs e monitoramento',
      goal: 'Ler, filtrar, rotacionar e vigiar logs e métricas do sistema, respeitando retenção e privacidade.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'journald e rsyslog: dois jeitos de guardar logs',
            'O systemd-journald coleta mensagens do kernel, dos serviços e do stdout/stderr das units e as guarda em formato binário e estruturado (com campos como unidade, PID e prioridade), consultado com journalctl. O rsyslog é o daemon clássico do syslog: grava texto puro em arquivos de /var/log e pode enviar logs a outro servidor. Muitas distribuições rodam os dois: o journald recebe tudo e repassa ao rsyslog. Em várias instalações o journal fica só em memória (/run/log/journal) e some no reinício, a menos que seja tornado persistente (slide 4).',
            'journalctl -n 3 --no-pager\n# exemplo (varia por distribuição):\n# nov 02 10:15:01 srv CRON[2210]: (root) CMD (run-parts /etc/cron.hourly)\n# nov 02 10:15:07 srv sshd[2233]: Accepted publickey for ana from 192.0.2.10 port 51514 ssh2\n# nov 02 10:16:44 srv systemd[1]: Started Daily apt download activities.'
          ),
          sl(
            'Facilidades e severidades do syslog',
            'Toda mensagem syslog tem uma facilidade (de onde vem: kern, user, mail, daemon, auth, authpriv, cron, local0 a local7) e uma severidade de 0 a 7: 0 emerg, 1 alert, 2 crit, 3 err, 4 warning, 5 notice, 6 info, 7 debug. Quanto MENOR o número, MAIS grave. Filtrar por severidade inclui o nível pedido e os mais graves: journalctl -p err mostra err (3), crit, alert e emerg. Você também pode passar o número: -p 3 equivale a -p err.',
            'journalctl -p err -b\n# mostra do boot atual só severidades 0 a 3 (emerg, alert, crit, err)\njournalctl -p warning..err -b\n# faixa: de warning até err'
          ),
          sl(
            '/var/log em detalhe',
            'Arquivos de texto comuns: syslog (Debian/Ubuntu) ou messages (família RHEL) para mensagens gerais; auth.log (Debian) ou secure (RHEL) para logins, sudo e SSH; kern.log e dmesg para o kernel; cron, mail.log, apt/ e subpastas de serviços como nginx/ (access.log e error.log). Três arquivos são BINÁRIOS e não se lêem com cat: wtmp (logins bem-sucedidos), btmp (tentativas falhas) e lastlog (último login de cada usuário). Use last, lastb e lastlog para lê-los. Os nomes exatos variam por distribuição.',
            'last -n 3\n# exemplo (varia por distribuição):\n# ana   pts/0   192.0.2.10   Mon Nov  2 10:15   still logged in\n# ana   pts/0   192.0.2.10   Fri Oct 30 18:02 - 18:40  (00:37)\n# reboot system boot  6.x.y-generic   Fri Oct 30 08:00   still running\nsudo lastb -n 2     # tentativas de login falhas (btmp)\nlastlog             # último login de cada usuário'
          ),
          sl(
            'journalctl na prática e journal persistente',
            'Filtros combináveis: -u UNIDADE (um serviço), -p (prioridade), --since e --until (tempo, ex.: "1 hour ago", "2026-11-02 09:00"), -b (boot atual; -b -1 é o anterior), -k (kernel), -f (acompanhar ao vivo) e -o json (saída estruturada para ferramentas). Para tornar o journal persistente, crie /var/log/journal (ou ponha Storage=persistent em /etc/systemd/journald.conf) e reinicie o systemd-journald. Limite o tamanho com SystemMaxUse= e consulte com journalctl --disk-usage; para limpar, journalctl --vacuum-time=2weeks.',
            'journalctl -u nginx --since "1 hour ago" -p warning\njournalctl -u nginx -n 1 -o json   # um objeto JSON por entrada\nsudo mkdir -p /var/log/journal && sudo systemctl restart systemd-journald\njournalctl --disk-usage            # exemplo: Archived and active journals take up 120.0M'
          ),
          sl(
            'logrotate: evitar que o disco encha',
            'Sem rotação, um log cresce até lotar o disco. O logrotate roda (normalmente diário, via timer ou cron) e lê /etc/logrotate.conf e /etc/logrotate.d/*. Diretivas: daily/weekly define a frequência; rotate N guarda N arquivos antigos e apaga o excedente (rotate 14 + daily = cerca de 14 dias de histórico); compress comprime os antigos; delaycompress adia a compressão um ciclo; missingok ignora log ausente; notifempty não rotaciona vazio; postrotate...endscript roda um comando depois, para o serviço reabrir o arquivo. Teste sem executar com logrotate -d ARQUIVO.',
            '/var/log/meuapp/*.log {\n    daily\n    rotate 14\n    compress\n    delaycompress\n    missingok\n    notifempty\n    create 0640 meuapp adm\n    postrotate\n        systemctl reload meuapp > /dev/null 2>&1 || true\n    endscript\n}'
          ),
          sl(
            'Monitoramento básico, métricas e auditoria',
            'Instantâneos: uptime (carga), free -h (memória), vmstat 1 (CPU, memória, swap, I/O), iostat -x (disco), top/htop (processos). Para histórico e alertas usa-se uma pilha: o node_exporter expõe as métricas da máquina em HTTP (porta 9100, caminho /metrics), o Prometheus coleta ("scrape") periodicamente e guarda séries temporais, o Grafana desenha painéis e o Alertmanager avisa por e-mail/chat. Alerte sobre sintomas acionáveis (disco acima de 85%, serviço fora do ar), não sobre tudo. Já o auditd registra eventos de segurança por regras: auditctl -w /etc/passwd -p wa -k passwd_mudou vigia escrita/atributos, e ausearch -k passwd_mudou consulta.',
            'curl -s http://localhost:9100/metrics | head -n 2\n# exemplo:\n# # HELP node_cpu_seconds_total Seconds the CPUs spent in each mode.\n# # TYPE node_cpu_seconds_total counter\nsudo auditctl -w /etc/passwd -p wa -k passwd_mudou\nsudo ausearch -k passwd_mudou'
          ),
          sl(
            'LGPD: logs também têm dados pessoais',
            'Logs guardam IPs, nomes de usuário, URLs com parâmetros e às vezes e-mails e tokens: são dados pessoais ou podem identificar alguém. Boas práticas: minimização (não registre o que não precisa; nunca registre senhas, tokens ou corpo de requisições com dados pessoais), retenção limitada com prazo definido e aplicado pelo logrotate/journald (não guarde para sempre), acesso restrito (modo 0640, grupo adm, sudo para quem precisa) e auditoria de quem leu. Ao compartilhar logs para suporte, anonimize IPs e usuários antes.',
            'ls -l /var/log/auth.log\n# exemplo: -rw-r----- 1 root adm 48211 Nov  2 10:16 /var/log/auth.log\n# 0640: só o dono escreve, o grupo adm lê, os outros não têm acesso'
          )
        ]
      },
      questions: [
        mcq('q1', 'Após reiniciar o servidor, journalctl -b -1 diz que não há entradas do boot anterior, embora o serviço rsyslog não esteja instalado. Qual a causa mais provável?', 'b', [
          'O journald não registra mensagens do kernel, só as das units, e por isso o boot anterior não aparece',
          'O journal estava só em memória e some no reinício; é preciso torná-lo persistente (/var/log/journal)',
          'O logrotate apagou o journal durante a rotação diária, pois ele cuida também dos arquivos binários do journald',
          'O -b -1 só funciona se o rsyslog estiver ativo, porque é ele quem guarda o histórico completo entre boots'
        ], 'Em muitas instalações o journal é volátil e some no reinício. Criar /var/log/journal (ou Storage=persistent em journald.conf) e reiniciar o journald o torna persistente. O journald tem sua própria limpeza (SystemMaxUse, vacuum).'),
        mcq('q2', 'Qual comando mostra do boot atual apenas mensagens de severidade err (3) e mais graves?', 'd', [
          'journalctl -b -p 3..7',
          'journalctl -b --level=info',
          'journalctl -b -k',
          'journalctl -b -p err'
        ], 'Menor número = mais grave, e -p err inclui err, crit, alert e emerg. A faixa 3..7 traria também warning, notice, info e debug; -k filtra pelo kernel (não por severidade).'),
        mcq('q3', 'Como ver erros e avisos do nginx na última hora?', 'a', [
          'journalctl -u nginx --since "1 hour ago" -p warning',
          'journalctl -k -p warning --since "1 hour ago" | grep nginx',
          'journalctl -u nginx -p warning --until "1 hour ago"',
          'journalctl -f -u nginx -p warning'
        ], '-u escolhe a unidade, --since limita o tempo e -p warning inclui warning e mais graves. -k é kernel, -f acompanha ao vivo e as outras opções citadas não existem dessa forma.'),
        fill('q4', 'Complete para listar só os logs da unidade ssh (ou sshd):', 'journalctl ___ ssh', ['-u', '--unit'], '-u (ou --unit) filtra por unidade do systemd. O nome da unidade do SSH varia: ssh em Debian/Ubuntu, sshd em RHEL.'),
        mcq('q5', 'Um /etc/logrotate.d/meuapp tem daily, rotate 14 e compress. Quanto histórico de logs ele mantém e em que forma?', 'c', [
          'Os 14 dias mais recentes inteiros, sem compressão, e o resto é arquivado em outra pasta',
          'Apenas 14 linhas por dia, comprimidas ao fim de cada semana pelo compress',
          'Cerca de 14 dias de logs rotacionados, os antigos comprimidos, e o excedente é apagado',
          'Os logs de 14 meses, porque rotate conta ciclos mensais quando compress está ativo'
        ], 'daily define o ciclo diário e rotate 14 guarda 14 arquivos antigos, apagando o excedente; compress comprime os rotacionados. Para testar sem alterar nada: logrotate -d.'),
        mcq('q6', 'Qual a função de cada peça na pilha de monitoramento node_exporter + Prometheus + Grafana?', 'b', [
          'O Prometheus expõe métricas em /metrics, o node_exporter as armazena e o Grafana envia os alertas por e-mail',
          'O node_exporter expõe as métricas, o Prometheus as coleta e guarda e o Grafana as mostra em painéis',
          'O Grafana coleta métricas do kernel, o node_exporter faz a rotação dos logs e o Prometheus audita os acessos',
          'O node_exporter lê o auditd, o Prometheus bloqueia IPs suspeitos e o Grafana aplica correções automáticas'
        ], 'node_exporter expõe (porta 9100, /metrics), Prometheus faz scrape e armazena séries temporais, Grafana visualiza; avisos ficam com o Alertmanager. Nenhum deles audita ou bloqueia sozinho.'),
        mcq('q7', 'Um log de acesso guarda IP e usuário de clientes e fica legível por todos, sem prazo de apagamento. Qual ajuste está mais alinhado à LGPD?', 'd', [
          'Mantê-lo para sempre, pois logs são evidência e a lei não trata IP como dado pessoal',
          'Trocar o formato para binário, já que dados pessoais só importam quando estão em texto puro',
          'Compartilhar o arquivo inteiro com o suporte do fornecedor para acelerar o diagnóstico',
          'Definir retenção com prazo, acesso 0640 com grupo adm e registrar só o necessário'
        ], 'Minimização, retenção limitada e acesso restrito são o caminho. IP pode identificar uma pessoa, formato binário não resolve acesso, e compartilhar sem anonimizar amplia o risco.'),
        fill('q8', 'Complete para simular o logrotate (modo debug, sem alterar arquivos) no arquivo de configuração do meuapp:', 'sudo ___ -d /etc/logrotate.d/meuapp', ['logrotate'], 'logrotate -d mostra o que seria feito sem rotacionar de fato; -f força a rotação. É a forma segura de validar a configuração.')
      ]
    },
    {
      id: 'lni-19-desempenho',
      title: 'Desempenho',
      goal: 'Ler load average, free, vmstat e iostat, aplicar o método USE e ajustar o sistema só depois de medir.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Recursos e o método USE',
            'Desempenho é a disputa por quatro recursos: CPU, memória, disco e rede. O método USE propõe olhar, para cada recurso, três coisas: Utilização (quanto do tempo/capacidade está ocupado), Saturação (trabalho esperando em fila porque o recurso não dá conta) e Erros (falhas contadas). Uma CPU a 100% de utilização com fila longa está saturada; um disco com poucos MB/s mas fila alta também. Regra de ouro: meça antes de ajustar, mude UMA coisa por vez e meça de novo.',
            '# Recurso   Utilização         Saturação                  Erros\n# CPU       %us+%sy (vmstat)   r > nº de núcleos          -\n# Memória   used/available     swap in/out (si/so), OOM   OOM killer no dmesg\n# Disco     %util (iostat)     await alto, fila           erros no dmesg\n# Rede      banda usada        drops/overruns             ip -s link (errors)'
          ),
          sl(
            'Load average: como ler',
            'O uptime mostra três médias de carga: 1, 5 e 15 minutos. Carga é o número médio de tarefas que querem CPU (rodando ou na fila) MAIS as que estão em espera ininterrupta de I/O (estado D) no Linux. Compare com o número de núcleos (nproc): em 4 núcleos, carga 4,0 é ocupação total; 8,0 indica fila de cerca de uma tarefa por núcleo esperando. Se 1 min é maior que 15 min, a carga está subindo; menor, está caindo. Carga alta com CPU ociosa costuma indicar disco lento (estado D).',
            'uptime\n# exemplo: 10:20:01 up 12 days, 3:04, 2 users, load average: 0.52, 0.48, 0.40\nnproc\n# exemplo: 4\n# carga 0.52 em 4 núcleos: folga grande'
          ),
          sl(
            'free: buff/cache não é memória ocupada',
            'O Linux usa memória livre como cache de arquivos (buff/cache) para acelerar o disco e a devolve na hora que um programa precisa. Por isso "free" baixo é normal. A coluna que responde "quanto posso usar sem swap" é available. Use free -h para unidades legíveis. Só há problema real quando available é pequeno e o swap está sendo usado ativamente.',
            'free -h\n# exemplo (valores fictícios):\n#               total   used   free  shared  buff/cache  available\n# Mem:           7.7Gi  1.9Gi  410Mi   120Mi       5.4Gi      5.5Gi\n# Swap:          2.0Gi     0B  2.0Gi\n# free parece baixo (410Mi), mas available é 5.5Gi: sistema saudável'
          ),
          sl(
            'vmstat, swap, thrashing e OOM killer',
            'vmstat 1 imprime uma linha por segundo (ignore a primeira, que é a média desde o boot). Colunas: r (processos prontos para rodar), b (bloqueados em I/O), si/so (memória lida/escrita do swap), bi/bo (blocos de disco), us/sy/id (CPU de usuário, sistema, ociosa), wa (espera de I/O), st (tempo roubado pelo hipervisor). Swap usado e parado é inofensivo; si/so altos e constantes indicam thrashing: o sistema gasta o tempo trocando páginas e tudo fica lento. Se a memória acaba de vez, o OOM killer do kernel mata um processo; confirme no log do kernel (dmesg ou journalctl -k) procurando "Out of memory" e "Killed process".',
            'vmstat 1 3\n# exemplo (valores fictícios):\n#  r  b   swpd   free   buff   cache   si   so   bi   bo   in   cs us sy id wa st\n#  1  0      0 419840  81920 5600000    0    0   12   30  210  400  5  2 92  1  0\n# thrashing seria: si e so em centenas por segundo, wa alto, id baixo\nsudo dmesg | grep -i "out of memory"'
          ),
          sl(
            'Disco: iostat, sar, pidstat e iotop',
            'iostat -x 1 (pacote sysstat) mostra por dispositivo: r/s e w/s (operações por segundo), await (tempo médio de espera por operação, em ms) e %util (quanto do tempo o dispositivo esteve ocupado; perto de 100% em disco comum indica saturação, embora em SSD/NVMe com paralelismo %util diga menos). O nome e a ordem das colunas variam com a versão. O sar coleta histórico (sar -u CPU, sar -r memória, sar -d disco). pidstat -d mostra o I/O por processo e iotop mostra os processos que mais usam disco (exige root).',
            'iostat -x 1 2\n# exemplo (colunas variam): Device  r/s  w/s  await  %util\n#                         sda    3.0  420.0  85.4   98.7\n# fila longa (await alto) e %util ~99%: disco saturado\nsar -u 1 3     # CPU a cada segundo, 3 vezes\npidstat -d 1   # I/O por processo'
          ),
          sl(
            'perf, strace, ulimit e sysctl',
            'perf (perf top) mostra onde a CPU gasta tempo, até em funções do kernel; strace -c -p PID resume as chamadas de sistema de um processo e strace -p mostra cada uma (custo alto: use por pouco tempo). ulimit -n mostra o limite de arquivos abertos do shell atual; limites persistentes de serviços ficam na unit (LimitNOFILE=) ou em /etc/security/limits.conf. sysctl lê e ajusta parâmetros do kernel: sysctl vm.swappiness mostra; sysctl -w muda só até o reinício; para persistir, crie um arquivo em /etc/sysctl.d/ e aplique com sysctl --system. Ajuste com prudência: um valor copiado da internet sem medir pode piorar.',
            'ulimit -n\n# exemplo: 1024\nsysctl vm.swappiness\n# exemplo: vm.swappiness = 60\nsudo sysctl -w vm.swappiness=10          # temporário\necho "vm.swappiness = 10" | sudo tee /etc/sysctl.d/99-local.conf\nsudo sysctl --system                     # aplica os arquivos'
          )
        ]
      },
      questions: [
        mcq('q1', 'uptime mostra "load average: 8.10, 7.90, 5.00" num servidor de 4 núcleos. O que isso indica?', 'c', [
          'Que a CPU está a 8,10% de uso, valor baixo e saudável para quatro núcleos',
          'Que há 8 núcleos ativos e 4 deles estão ociosos, aguardando novas tarefas',
          'Fila de ~2 tarefas por núcleo e carga em alta (1 min maior que 15 min)',
          'Que a memória está 8 vezes acima do limite e o swap foi esgotado por completo'
        ], 'Carga é número médio de tarefas querendo CPU (ou em I/O ininterrupto). Em 4 núcleos, 8 é o dobro da capacidade, e 1 min maior que 15 min indica que está piorando.'),
        mcq('q2', 'free -h mostra free de 300Mi, buff/cache de 5,4Gi e available de 5,5Gi. Qual a leitura correta?', 'a', [
          'A memória está saudável: o cache é devolvido sob demanda e available é o que importa',
          'A memória está quase esgotada, pois free é de só 300Mi e o kernel logo acionará o OOM killer',
          'O cache de 5,4Gi é desperdício e deve ser limpo manualmente antes de rodar aplicações',
          'O sistema precisa de swap imediatamente, já que free está abaixo de 500Mi'
        ], 'buff/cache é memória usada como cache e liberada quando necessário; available estima o que pode ser usado sem swap. Limpar o cache só piora o desempenho do disco.'),
        mcq('q3', 'No vmstat, as colunas si e so ficam em centenas por segundo, com wa alto e id baixo. O que está acontecendo?', 'd', [
          'O disco está ocioso e a CPU espera por tarefas novas, sem nada na fila de execução',
          'A rede está saturada e perdendo pacotes por falta de buffers nas interfaces',
          'O hipervisor está roubando CPU da máquina virtual (coluna st)',
          'Thrashing: o sistema troca páginas com o swap o tempo todo e fica lento'
        ], 'si/so contínuos são leitura/escrita constantes do swap, sinal de falta de memória. Solução: reduzir uso, adicionar RAM ou limitar processos, não apenas aumentar o swap.'),
        fill('q4', 'Complete para mostrar o limite de arquivos abertos do shell atual:', 'ulimit -___', ['n'], 'ulimit -n mostra o limite de descritores de arquivo abertos; ulimit -a lista todos os limites. Para serviços systemd, use LimitNOFILE= na unit.'),
        mcq('q5', 'iostat -x mostra %util de 99% e await de 85 ms em sda, com CPU ociosa. Pelo método USE, qual o diagnóstico?', 'b', [
          'Erro de disco: um %util tão alto só ocorre quando há setores defeituosos e relocações',
          'Saturação do disco: há fila e espera longa, o gargalo é o I/O e não a CPU',
          'Subutilização do disco: await alto significa que ele quase não é usado',
          'Falta de memória: %util mede a ocupação da RAM pelo cache'
        ], 'Utilização perto de 100% com await alto indica fila de I/O, ou seja, saturação. Erros apareceriam no dmesg. A CPU ociosa com carga alta aponta para processos em estado D esperando disco.'),
        mcq('q6', 'Um processo grande some sem mensagem de erro própria, e o servidor estava com pouca memória. Onde confirmar a causa mais provável?', 'b', [
          'Em /var/log/wtmp, que registra os processos encerrados e o motivo de cada um',
          'No log do kernel (dmesg), procurando "Out of memory" ou "Killed process"',
          'No resultado de ulimit -n, que mostra quais processos o kernel matou',
          'No arquivo /etc/sysctl.d/, onde o OOM killer anota suas decisões'
        ], 'O OOM killer mata o processo escolhido e registra no log do kernel. wtmp guarda logins e ulimit mostra limites, não histórico de mortes.'),
        mcq('q7', 'Um serviço está lento e você quer ver quais chamadas de sistema ele mais faz, por pouco tempo e sem alterar o código. Qual ferramenta?', 'a', [
          'strace -c -p PID, que resume as chamadas de sistema do processo em execução',
          'iotop, que lista em tempo real as chamadas de sistema feitas por cada processo',
          'ulimit -a, que revela as chamadas de sistema mais frequentes do shell atual',
          'sar -d, que conta chamadas de sistema por dispositivo'
        ], 'strace acompanha chamadas de sistema de um processo (com custo, então por pouco tempo). iotop e sar -d falam de disco; ulimit mostra limites.'),
        fill('q8', 'Complete para alterar vm.swappiness até o próximo reinício (sem persistir):', 'sudo sysctl ___ vm.swappiness=10', ['-w'], 'sysctl -w altera o valor em tempo de execução. Para persistir, grave em /etc/sysctl.d/99-local.conf e rode sysctl --system.')
      ]
    },
    {
      id: 'lni-20-backup-recuperacao',
      title: 'Backup e recuperação',
      goal: 'Planejar backups com 3-2-1, RPO e RTO, escolher ferramentas, e provar que a restauração funciona.',
      xp: 20,
      intro: {
        slides: [
          sl(
            '3-2-1, RPO e RTO',
            'A regra 3-2-1: pelo menos 3 cópias dos dados (o original e 2 backups), em 2 tipos de mídia diferentes, com 1 cópia fora do local (outro prédio ou nuvem). RPO (Recovery Point Objective) é a quantidade máxima de dados que você aceita perder, medida em tempo: backup diário implica RPO de até 24 horas. RTO (Recovery Time Objective) é o tempo máximo aceitável para voltar a operar. RAID e snapshots NÃO são backup: RAID protege contra falha de disco mas replica a exclusão acidental e o ransomware; um snapshot no mesmo disco some junto com ele.',
            '# Exemplo: backup diário às 02:00; falha às 17:00\n# dados perdidos = 17:00 - 02:00 = 15 horas\n# RPO da estratégia (pior caso) = 24 h\n# RTO = tempo para restaurar (medido em um teste!)'
          ),
          sl(
            'Completo, incremental e diferencial',
            'Backup completo copia tudo: simples de restaurar, mas lento e grande. Incremental copia só o que mudou desde o último backup de qualquer tipo: pequeno e rápido, mas a restauração exige o completo mais TODOS os incrementais em ordem. Diferencial copia o que mudou desde o último completo: cresce a cada dia, mas a restauração usa só o completo mais o último diferencial.',
            '# Domingo: completo. Segunda a quarta: incremental. Falha na quinta cedo:\n# restaurar = completo (dom) + seg + ter + qua\n# Se fossem diferenciais: completo (dom) + diferencial de quarta'
          ),
          sl(
            'rsync e tar com permissões',
            'rsync -a copia recursivamente preservando permissões, donos, datas e links; só transfere o que mudou. -H preserva hard links, -A as ACLs e -X os atributos estendidos; --delete remove no destino o que não existe mais na origem (perigoso: teste antes com -n, o dry-run). A barra final importa: /dados/ copia o CONTEÚDO, /dados copia a pasta. Com --link-dest=PASTA_ANTERIOR, arquivos inalterados viram hard links da cópia anterior: cada pasta datada parece um backup completo, mas só ocupa o espaço do que mudou. Para empacotar, tar --acls --xattrs -czpf preserva ACLs e atributos; restaure como root para manter donos.',
            'rsync -aHAXn --delete /dados/ /backup/atual/    # -n: só simula\nrsync -a --link-dest=/backup/2026-11-01 /dados/ /backup/2026-11-02/\nsudo tar --acls --xattrs -czpf /backup/dados.tar.gz -C /dados .\nsudo tar --acls --xattrs -xzpf /backup/dados.tar.gz -C /restaura'
          ),
          sl(
            'Snapshots, restic e borg',
            'Snapshot (LVM, Btrfs, ZFS) congela o estado em um instante, quase de graça e rápido: ótimo para voltar atrás e para obter uma visão consistente a copiar, mas ele fica no mesmo armazenamento, então NÃO substitui backup. restic e borg fazem backup moderno: dividem os dados em blocos e deduplicam (blocos repetidos são guardados uma vez, então muitos backups ocupam pouco), criptografam o repositório e mantêm instantâneos nomeados, com política de retenção.',
            'restic -r /mnt/backup init\nrestic -r /mnt/backup backup ~/dados\nrestic -r /mnt/backup snapshots\nrestic -r /mnt/backup restore latest --target /tmp/restauracao\n# a senha do repositório é pedida; guarde-a fora da máquina'
          ),
          sl(
            'Bancos de dados e dd',
            'Copiar os arquivos de um banco em execução gera cópia inconsistente (escritas no meio). Faça dump lógico, que o próprio servidor entrega consistente: pg_dump -Fc nome > arquivo.dump (PostgreSQL) ou mysqldump --single-transaction nome > arquivo.sql (MySQL/MariaDB com InnoDB). O dd copia bloco a bloco e serve para imagens de disco inteiro. Perigo: if= é a entrada (origem) e of= a saída (destino); inverter os dois sobrescreve o disco bom com o conteúdo do outro e destrói os dados. Confira com lsblk antes e treine só com discos de teste.',
            'pg_dump -Fc loja_teste > loja_teste.dump\nmysqldump --single-transaction loja_teste > loja_teste.sql\n# ATENÇÃO: destrutivo se invertido. Só em disco de teste.\nsudo dd if=/dev/sdX of=imagem.img bs=4M status=progress\n# if = origem (lê)   of = destino (escreve)'
          ),
          sl(
            'Teste, criptografia, agenda e LGPD',
            'Um backup que nunca foi restaurado é uma esperança, não um backup. Teste periodicamente: restaure em outro diretório ou máquina, compare (diff -r, sha256sum -c) e cronometre para conhecer o RTO real. Criptografe os backups (restic/borg já fazem; para arquivos soltos, gpg), agende (cron/timer), registre a saída em log e monitore falhas (avise se o backup não rodou). LGPD: backups contêm dados pessoais, então valem as mesmas regras: acesso restrito, criptografia, local protegido e prazo de retenção definido; quando um titular pede exclusão, o dado sai da base viva e dos backups ao expirarem pelo ciclo de retenção.',
            '30 2 * * * /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1\nsha256sum backup.tar.gz > backup.tar.gz.sha256\nsha256sum -c backup.tar.gz.sha256   # exemplo de saída: backup.tar.gz: OK'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual configuração cumpre a regra 3-2-1?', 'b', [
          'Dados no SSD, snapshot LVM no mesmo SSD e RAID 1 entre dois discos do mesmo servidor',
          'Original no servidor, cópia em disco externo e outra em armazenamento na nuvem, em outro local',
          'Dados no servidor e duas cópias em pastas diferentes do mesmo disco, ambas montadas em /backup',
          'Dados no servidor e três backups completos gravados no mesmo disco externo em dias distintos'
        ], 'Três cópias (original + 2), duas mídias diferentes e uma fora do local. RAID e snapshots no mesmo equipamento, ou várias cópias no mesmo disco, falham juntos.'),
        mcq('q2', 'Backup diário às 02:00; o disco falha às 17:00 e você restaura o último backup. Quanto de dados foi perdido, no máximo, nesse dia?', 'd', [
          'Nenhum dado, porque o RTO cobre as alterações recentes',
          '24 horas, pois sempre se perde um dia inteiro',
          '2 horas, a diferença entre 17:00 e a hora de início do backup',
          '15 horas de alterações, entre 02:00 e 17:00'
        ], 'Tudo que mudou depois do backup das 02:00 se perde: 15 horas. Isso ilustra o RPO (até 24 h no pior caso); RTO é o tempo para voltar a operar, não protege dados.'),
        mcq('q3', 'Backup completo no domingo e incrementais de segunda a quarta. O disco falha na quinta cedo. O que é preciso para restaurar?', 'c', [
          'Apenas o incremental de quarta, que contém tudo até aquele dia',
          'O completo de domingo e o incremental de quarta, ignorando os de segunda e terça',
          'O completo de domingo mais os incrementais de segunda, terça e quarta, em ordem',
          'O completo de domingo, já que os incrementais são opcionais'
        ], 'Cada incremental guarda só a mudança desde o backup anterior, então a cadeia inteira é necessária. Com diferenciais bastaria o completo mais o último diferencial.'),
        fill('q4', 'Complete para que o tar preserve as ACLs ao criar o pacote:', 'tar --___ --xattrs -czpf dados.tar.gz dados/', ['acls'], '--acls guarda as ACLs e --xattrs os atributos estendidos; -p preserva permissões. Restaure como root para manter os donos.'),
        mcq('q5', 'Ao usar dd para clonar um disco, o que acontece se você inverter if= e of=?', 'a', [
          'O disco de origem é sobrescrito com o conteúdo do destino, e os dados são destruídos',
          'O dd detecta a inversão e aborta, pois recusa escrever em dispositivo de bloco montado',
          'Nada de grave: o dd copia nos dois sentidos e mantém ambos iguais',
          'O dd apenas gera um arquivo vazio, pois of= só aceita arquivos comuns'
        ], 'if é a origem e of o destino. Invertido, o dd grava o conteúdo do "destino" sobre o disco bom. Confirme com lsblk e treine em discos de teste.'),
        mcq('q6', 'Para fazer backup de um PostgreSQL em produção, qual abordagem gera uma cópia consistente?', 'd', [
          'Compactar os arquivos de log do servidor, que contêm todas as tabelas',
          'Copiar o diretório de dados com cp -r enquanto o banco está recebendo escritas',
          'Tirar um print das tabelas pelo cliente e salvar em texto',
          'Executar pg_dump -Fc, que gera um dump lógico consistente do banco em uso'
        ], 'O dump lógico é entregue pelo servidor de forma consistente. Copiar os arquivos de um banco ativo pode pegar escritas pela metade; logs não contêm os dados.'),
        mcq('q7', 'Qual prática torna o backup confiável e alinhado à LGPD?', 'b', [
          'Guardá-lo em texto puro numa pasta pública da rede para facilitar o acesso rápido de todos',
          'Criptografá-lo, restringir o acesso, definir retenção e testar a restauração, sem confiar apenas no log de sucesso',
          'Mantê-lo indefinidamente para atender a eventuais pedidos futuros de auditoria ou de clientes',
          'Confiar no código de saída do backup.sh e restaurar só quando houver um desastre real'
        ], 'Backups contêm dados pessoais: criptografia, acesso restrito e prazo definido. E só um teste de restauração comprova que o backup serve e revela o RTO real.'),
        fill('q8', 'Complete para criar backups incrementais por hard links, usando a pasta de ontem como referência:', 'rsync -a --___=/backup/ontem /dados/ /backup/hoje/', ['link-dest'], '--link-dest faz arquivos inalterados virarem hard links da cópia anterior: cada pasta parece completa, mas ocupa só o espaço das mudanças.')
      ]
    },
    {
      id: 'lni-21-containers-no-linux',
      title: 'Containers no Linux',
      goal: 'Entender o que o kernel entrega a um container (namespaces e cgroups) e usar Docker/Podman com segurança.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Container não é máquina virtual',
            'Uma VM roda um sistema operacional inteiro, com kernel próprio, sobre hardware virtual. Um container é um ou mais processos comuns do host, isolados por recursos do próprio kernel Linux: todos os containers compartilham o MESMO kernel do host. Por isso sobem em milissegundos e pesam pouco, mas o isolamento é mais fraco que o de uma VM: uma falha grave no kernel afeta todos. Dois recursos do kernel fazem a mágica: namespaces (o que o processo enxerga) e cgroups (quanto ele pode usar).',
            'ls -l /proc/self/ns\n# exemplo (varia por kernel): cgroup  ipc  mnt  net  pid  time  user  uts\n# cada item é um namespace do qual o processo atual participa'
          ),
          sl(
            'Namespaces e cgroups',
            'Namespaces dão a cada container uma visão própria: pid (árvore de processos, o primeiro processo é o PID 1), net (interfaces e portas de rede próprias), mnt (pontos de montagem/sistema de arquivos), uts (hostname), ipc (comunicação entre processos) e user (mapeamento de UIDs: o root do container pode ser um usuário comum no host). Cgroups (control groups) LIMITAM e contabilizam recursos de um grupo de processos: memória máxima, CPU, I/O, número de processos. Resumo: namespace isola a visão; cgroup limita o consumo.',
            '# docker run --memory=256m --cpus=1 nginx\n# --memory e --cpus configuram limites via cgroups\n# se passar do limite de memória, o kernel mata o processo (OOM) dentro do cgroup'
          ),
          sl(
            'unshare: um namespace na unha',
            'Você consegue criar namespaces sem Docker: unshare executa um programa em namespaces novos. Com --pid --fork --mount-proc o novo bash vira PID 1 de uma árvore própria, e o ps só enxerga os processos dele. Requer root (ou user namespace). Isso mostra que um container é só um processo com visão restrita, não "uma máquina dentro da máquina".',
            'sudo unshare --pid --fork --mount-proc bash\nps aux\n# exemplo (só o bash e o ps aparecem):\n# USER  PID  COMMAND\n# root    1  bash\n# root   12  ps aux\nexit'
          ),
          sl(
            'Docker e Podman: comandos básicos',
            'docker run cria e inicia um container a partir de uma imagem; -d solta em segundo plano, --name dá nome, -p HOST:CONTAINER publica uma porta. docker ps lista os que rodam (-a inclui parados); docker exec -it NOME sh abre um shell dentro de um container em execução; docker logs NOME mostra a saída (-f acompanha); docker images lista imagens locais; docker stop e docker rm param e removem. O Podman usa os mesmos subcomandos (podman run, podman ps...) e dispensa um daemon.',
            'docker run -d --name web -p 8080:80 nginx\ndocker ps\n# exemplo: CONTAINER ID  IMAGE  COMMAND  STATUS  PORTS                 NAMES\n#          3f2a9c1b7d10  nginx  ...      Up 5s   0.0.0.0:8080->80/tcp  web\ndocker logs web\ndocker exec -it web sh'
          ),
          sl(
            'Imagem vs container, volumes e redes',
            'A imagem é o molde, só leitura, feito de camadas. O container é uma instância em execução: ganha uma camada de escrita fina por cima da imagem, que SOME quando o container é removido. Para dados que precisam durar, use volumes (docker run -v dados:/var/lib/dados, gerenciado pelo Docker) ou bind mounts (-v /pasta/host:/pasta). Na rede, o padrão é uma bridge com NAT; em redes criadas pelo usuário (docker network create), os containers se alcançam pelo NOME. Detalhes e boas práticas estão no curso de Containers.',
            'docker volume create dados\ndocker run -d --name db -v dados:/var/lib/dados minha-imagem\ndocker rm -f db        # o container some, o volume "dados" continua\ndocker network create rede-app'
          ),
          sl(
            'Rootless e o socket do Docker',
            'O daemon do Docker roda como root e escuta no socket /var/run/docker.sock. Quem fala com ele manda criar containers com qualquer opção, inclusive montar o disco inteiro do host dentro do container e editar /etc/shadow: por isso estar no grupo docker (ou montar o socket dentro de um container) EQUIVALE a ser root na máquina. Mitigações: Podman e o modo rootless (o daemon e os containers rodam sem privilégios no host, com user namespace), conceder o grupo docker só a quem já seria administrador, não expor o socket pela rede e não montá-lo em containers.',
            'ls -l /var/run/docker.sock\n# exemplo: srw-rw---- 1 root docker 0 Nov  2 08:00 /var/run/docker.sock\n# quem está no grupo docker controla o daemon (root)\npodman run --rm alpine id   # exemplo rootless: uid=0(root) dentro, usuário comum no host'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual a principal diferença técnica entre container e máquina virtual?', 'c', [
          'O container emula hardware completo, enquanto a VM compartilha as bibliotecas da imagem',
          'A VM compartilha o kernel do host e o container traz kernel próprio dentro da imagem',
          'O container usa o kernel do host, isolado por namespaces; a VM roda um kernel próprio',
          'Não há diferença: ambos rodam um sistema operacional completo sobre hardware virtual'
        ], 'O container é um processo do host com visão e consumo restritos pelo kernel. A VM emula hardware e roda outro kernel, com isolamento mais forte porém mais pesado.'),
        mcq('q2', 'Você quer impedir que um container use mais de 256 MB de RAM. Qual recurso do kernel faz isso?', 'd', [
          'Namespace pid, que limita a quantidade de processos que o container consegue enxergar',
          'Namespace mnt, que controla o espaço total do sistema de arquivos do container',
          'Namespace user, que reduz os privilégios do root dentro do container',
          'Cgroups, que limitam e contabilizam memória, CPU e I/O de um grupo de processos'
        ], 'Namespaces isolam o que se enxerga; cgroups limitam quanto se consome. A opção docker run --memory configura um limite via cgroups.'),
        mcq('q3', 'O que faz docker run -d --name web -p 8080:80 nginx?', 'a', [
          'Inicia em segundo plano o container web e liga a porta 8080 do host à 80 do container',
          'Baixa o nginx e o instala no host na porta 80, expondo a 8080 como proxy reverso local',
          'Inicia o container em primeiro plano e liga a porta 80 do host à porta 8080 do container',
          'Cria só a imagem web a partir do nginx, sem executar nada, e reserva a 8080'
        ], '-d solta em segundo plano, --name nomeia e -p HOST:CONTAINER publica a porta (a primeira é a do host). A imagem nginx é usada; nada é instalado no host.'),
        fill('q4', 'Complete para abrir um shell dentro do container web que já está rodando:', 'docker ___ -it web sh', ['exec'], 'docker exec executa um comando dentro de um container em execução (-it dá terminal interativo). docker logs mostra a saída e docker run cria um container novo.'),
        mcq('q5', 'Você remove um container (docker rm) que gravava dados na própria camada de escrita, sem volume. O que acontece com esses dados?', 'b', [
          'Ficam guardados na imagem, que é atualizada com as mudanças feitas pelo container',
          'São sempre perdidos com a camada de escrita; persistir exige volume ou bind mount',
          'Vão automaticamente para /var/lib/docker e podem ser reanexados ao próximo container',
          'Permanecem no host em /tmp até o próximo reinício'
        ], 'A imagem é só leitura. A camada de escrita do container some com ele. Volumes e bind mounts guardam dados fora dessa camada.'),
        mcq('q6', 'Por que dar a um usuário comum acesso ao socket do Docker (grupo docker) equivale a dar root?', 'b', [
          'O socket do Docker guarda a senha do root em texto puro no arquivo /var/run/docker.sock',
          'O daemon roda como root e deixa criar containers que montam e alteram o disco do host',
          'O grupo docker é só um apelido para o grupo wheel, que já possui todos os privilégios',
          'Containers rootful desativam o sudo e deixam o usuário trocar de conta sem autenticação'
        ], 'Quem controla o daemon pode iniciar um container que monte / do host e alterar qualquer arquivo. Rootless/Podman e restringir o grupo docker reduzem esse risco.'),
        mcq('q7', 'Qual afirmação sobre Podman rootless está correta?', 'd', [
          'Ele precisa de um daemon root e usa o mesmo socket do Docker, só com outra interface de linha de comando',
          'Ele roda containers como root real do host e depois remove as capacidades do processo',
          'Ele só funciona dentro de máquinas virtuais, pois exige um kernel próprio e isolado',
          'Roda sem daemon nem privilégios no host, mapeando o root do container a um usuário comum'
        ], 'No modo rootless o uid 0 do container corresponde a um usuário sem privilégios no host, o que limita o estrago de uma fuga do container.'),
        fill('q8', 'Complete para rodar um bash em novos namespaces de PID, com /proc remontado:', 'sudo unshare --pid --fork --mount-___ bash', ['proc'], '--mount-proc remonta /proc no novo namespace, para que o ps mostre só os processos dele. Sem isso, o ps ainda leria o /proc do host.')
      ]
    },
    {
      id: 'lni-22-virtualizacao-kvm',
      title: 'Virtualização (KVM, QEMU e libvirt)',
      goal: 'Montar um laboratório de VMs com KVM/libvirt, escolhendo disco, rede e imagem de forma segura.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Hipervisores tipo 1 e tipo 2',
            'Hipervisor é o software que cria e executa máquinas virtuais. Tipo 1 (bare metal) roda diretamente sobre o hardware e há sistemas feitos para isso (Xen, VMware ESXi, Hyper-V); o KVM transforma o próprio kernel Linux em hipervisor, por isso costuma ser tratado como tipo 1. Tipo 2 roda como um programa comum dentro de um sistema operacional completo: VirtualBox e VMware Workstation. Tipo 2 é prático para estudos e desktop; tipo 1 é o padrão em servidores.',
            '# tipo 1: hardware -> hipervisor (KVM no kernel Linux) -> VMs\n# tipo 2: hardware -> sistema operacional -> VirtualBox -> VMs'
          ),
          sl(
            'Extensões de hardware (VT-x e AMD-V)',
            'Para o KVM funcionar bem, a CPU precisa de extensões de virtualização: Intel VT-x (flag vmx em /proc/cpuinfo) ou AMD-V (flag svm). A contagem de linhas com essas flags mostra se existem: um número maior que 0 indica suporte; 0 significa que a CPU não tem, ou que está desligado na BIOS/UEFI (ou não exposto, numa VM aninhada). Com KVM carregado, existe o dispositivo /dev/kvm e o módulo kvm_intel ou kvm_amd aparece no lsmod.',
            "grep -Ec '(vmx|svm)' /proc/cpuinfo\n# exemplo: 8   (uma linha por CPU lógica com a flag)\n# equivalente antigo: egrep -c '(vmx|svm)' /proc/cpuinfo\nlsmod | grep kvm\n# exemplo: kvm_intel  ...\nls -l /dev/kvm"
          ),
          sl(
            'KVM, QEMU e libvirt: quem faz o quê',
            'KVM é o módulo do kernel que usa VT-x/AMD-V para executar o código da VM quase na velocidade nativa. QEMU é o programa em espaço de usuário que emula os dispositivos (disco, rede, vídeo) e roda cada VM como um processo. libvirt é a camada de gerenciamento (API e daemon) que organiza VMs, redes e discos. Sobre ela, virsh é a linha de comando e virt-manager a interface gráfica; virt-install cria VMs.',
            'virsh list --all\n# exemplo:\n#  Id   Name     State\n# -----------------------\n#  1    lab-01   running\n#  -    lab-02   shut off\nvirsh start lab-02\nvirsh shutdown lab-01      # pede desligamento limpo\nvirsh destroy lab-01       # "tira da tomada" (não apaga a VM)'
          ),
          sl(
            'Discos virtuais e snapshots',
            'O disco da VM é um arquivo no host. raw é simples e rápido, ocupando todo o tamanho. qcow2 (formato do QEMU) aloca sob demanda (thin provisioning), suporta snapshots, compressão e imagens-base com cópia na escrita (backing file): várias VMs partem da mesma imagem-base. qemu-img cria e inspeciona. Snapshot de VM serve para voltar atrás em testes; não substitui backup, porque mora ao lado do disco original.',
            'qemu-img create -f qcow2 lab-01.qcow2 20G\nqemu-img info lab-01.qcow2\n# exemplo: file format: qcow2 / virtual size: 20 GiB / disk size: 196 KiB\nvirsh snapshot-create-as lab-01 antes-do-teste\nvirsh snapshot-list lab-01'
          ),
          sl(
            'Redes de VM: NAT e bridge',
            'No modo NAT (padrão do libvirt, rede default com ponte virbr0, geralmente 192.168.122.0/24) as VMs acessam o exterior através do host, mas máquinas externas NÃO conseguem iniciar conexão até elas: é o mais seguro e o ideal para laboratório. No modo bridge a VM entra na mesma rede local do host e recebe um IP dessa LAN, ficando alcançável pelos demais equipamentos: útil para servir serviços, mas exposta como qualquer outra máquina da rede (então precisa ser endurecida). Existe também rede isolada, só entre VMs.',
            'virsh net-list --all\n# exemplo: Name: default  State: active  Autostart: yes\nip -br addr show virbr0\n# exemplo: virbr0  UP  192.168.122.1/24'
          ),
          sl(
            'cloud-init, VM vs container e laboratório seguro',
            'Imagens de nuvem (qcow2 prontas das distribuições) são genéricas: o cloud-init configura cada VM no primeiro boot a partir de dados do usuário (user-data): cria usuário, instala chaves SSH, pacotes e comandos. Assim a mesma imagem vira várias VMs diferentes. VM x container: a VM tem kernel próprio e isolamento mais forte, porém é mais pesada; o container é leve e rápido, com isolamento menor. Em laboratório: use rede NAT ou isolada, nunca dados reais, snapshots antes de experimentos e mantenha o host atualizado, pois uma falha no hipervisor atinge todas as VMs.',
            '#cloud-config\nusers:\n  - name: aluno\n    ssh_authorized_keys:\n      - ssh-ed25519 AAAA...chave-publica-ficticia aluno@lab\npackages:\n  - nginx'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual classificação está correta?', 'c', [
          'VirtualBox é tipo 1, pois roda os convidados diretamente sobre o hardware, sem sistema anfitrião',
          'VMware ESXi é tipo 2, pois depende de um sistema operacional completo instalado antes dele',
          'VirtualBox é tipo 2 (roda sobre um sistema operacional); o KVM faz do kernel Linux um hipervisor',
          'O KVM é tipo 2, pois é instalado como aplicativo gráfico dentro do desktop do usuário'
        ], 'Tipo 2 roda como programa sobre um sistema operacional (VirtualBox). KVM é um módulo do kernel que o transforma em hipervisor, e ESXi roda direto no hardware.'),
        mcq('q2', 'grep -Ec "(vmx|svm)" /proc/cpuinfo imprime 0. O que isso sugere?', 'a', [
          'Não há VT-x/AMD-V disponível: a CPU não tem, ou está desligado na BIOS/UEFI',
          'O KVM está carregado e funcionando, mas sem VMs ligadas no momento',
          'A CPU suporta virtualização com folga e liberou todos os núcleos para as VMs',
          'O sistema só aceita containers, pois as flags vmx e svm são exclusivas deles'
        ], 'Esses flags indicam as extensões de virtualização. Zero significa que não existem para o sistema; verifique a BIOS/UEFI ou se está numa VM sem virtualização aninhada.'),
        mcq('q3', 'Qual descrição do trio KVM/QEMU/libvirt está correta?', 'b', [
          'KVM gerencia redes e discos, QEMU é o módulo do kernel e libvirt emula a CPU',
          'KVM é o módulo do kernel que usa VT-x/AMD-V, QEMU emula dispositivos e libvirt gerencia as VMs',
          'libvirt executa o código da VM, KVM oferece a interface gráfica e QEMU grava os snapshots do host',
          'QEMU só funciona em Windows, KVM só em macOS e libvirt é um antivírus de VMs'
        ], 'KVM acelera a execução via hardware; QEMU cria os dispositivos virtuais e roda cada VM como processo; libvirt (virsh, virt-manager) organiza e gerencia.'),
        fill('q4', 'Complete para listar todas as VMs (ligadas e desligadas) no libvirt:', 'virsh ___ --all', ['list'], 'virsh list mostra as VMs em execução; --all inclui as desligadas.'),
        mcq('q5', 'Por que o qcow2 costuma ser preferido ao raw em laboratórios?', 'd', [
          'Porque é sempre mais rápido que o raw e nunca exige espaço adicional no host',
          'Porque dispensa o QEMU e funciona direto no hipervisor tipo 2 do desktop',
          'Porque cifra o conteúdo do disco por padrão sem precisar de senha',
          'Porque aloca espaço sob demanda e permite snapshots e imagens-base'
        ], 'qcow2 é thin provisioned e tem snapshots e backing files. O raw é simples e muito rápido, mas ocupa o tamanho inteiro. Nenhum dos dois cifra por padrão.'),
        mcq('q6', 'Você quer que outras máquinas da sua rede acessem um servidor web rodando numa VM. Qual modo de rede, e que cuidado ele traz?', 'c', [
          'NAT: as máquinas externas já alcançam a VM por padrão, sem nenhum cuidado extra',
          'Rede isolada: ela permite acesso externo, mas só se o kvm_intel estiver carregado',
          'Bridge: a VM recebe IP da LAN e fica alcançável, exigindo firewall e atualizações',
          'Loopback: a VM aparece como localhost em todas as máquinas da rede'
        ], 'Em bridge a VM entra na LAN. No NAT padrão, só a VM inicia conexões para fora. Rede isolada fala apenas com outras VMs.'),
        mcq('q7', 'Para que serve o cloud-init ao usar uma imagem de nuvem em uma VM?', 'a', [
          'Configurar a VM no primeiro boot (usuário, chaves, pacotes)',
          'Acelerar a CPU virtual ao ativar as extensões vmx e svm do processador',
          'Fazer o backup do disco qcow2 para a nuvem a cada hora, de forma agendada',
          'Substituir o hipervisor, permitindo rodar VMs sem KVM nem QEMU instalados'
        ], 'Imagens de nuvem são genéricas; o cloud-init as personaliza no primeiro boot. Não mexe na CPU, nem faz backup, nem substitui o hipervisor.'),
        fill('q8', 'Complete para criar um disco virtual no formato qcow2 de 20 GB:', 'qemu-img create -f ___ lab.img 20G', ['qcow2'], 'qemu-img create -f FORMATO ARQUIVO TAMANHO cria o disco; qcow2 aloca espaço sob demanda.')
      ]
    },
    {
      id: 'lni-23-hardening-servidor',
      title: 'Hardening de servidor',
      goal: 'Reduzir a superfície de ataque de um servidor com um conjunto prático e verificável de medidas.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Superfície de ataque mínima',
            'Hardening é reduzir as formas de atacar o servidor. O primeiro passo é saber o que está exposto: ss -tulpn lista portas TCP e UDP em escuta, com o processo dono (precisa de sudo para ver todos). Endereço 0.0.0.0 ou [::] significa "todas as interfaces"; 127.0.0.1 significa só local. O que não é necessário, remova ou desabilite (systemctl disable --now, apt remove). Cada pacote e serviço a menos é um alvo a menos e uma atualização a menos para acompanhar.',
            'sudo ss -tulpn\n# exemplo (varia):\n# Netid State  Local Address:Port  Process\n# tcp   LISTEN 0.0.0.0:22          users:(("sshd",pid=812,fd=3))\n# tcp   LISTEN 0.0.0.0:5432        users:(("postgres",pid=640,fd=5))   <- banco exposto!\n# tcp   LISTEN 127.0.0.1:6379      users:(("redis-server",pid=701,fd=6))\nsudo systemctl disable --now cups'
          ),
          sl(
            'Atualizações automáticas de segurança',
            'A maioria dos ataques bem-sucedidos explora falhas já corrigidas. Mantenha o sistema atualizado: em Debian/Ubuntu, o pacote unattended-upgrades aplica automaticamente as atualizações de segurança (configurado em /etc/apt/apt.conf.d/); em família RHEL, o dnf-automatic. Automatize segurança, e deixe atualizações grandes (mudança de versão de banco, por exemplo) para janelas planejadas, com backup e teste. Reinicie quando o kernel for atualizado.',
            'sudo apt install unattended-upgrades\nsudo dpkg-reconfigure -plow unattended-upgrades\n# em RHEL: sudo dnf install dnf-automatic && sudo systemctl enable --now dnf-automatic.timer'
          ),
          sl(
            'SSH endurecido e fail2ban',
            'No /etc/ssh/sshd_config: PermitRootLogin no (nada de login direto como root), PasswordAuthentication no (só chaves), PubkeyAuthentication yes e AllowUsers (ou AllowGroups) restringindo quem entra. Antes de recarregar, valide com sshd -t e mantenha uma sessão aberta para poder desfazer, senão um erro tranca você fora. O fail2ban lê os logs e bane temporariamente IPs que erram muito (jail sshd): configure em /etc/fail2ban/jail.local e consulte com fail2ban-client status sshd. Ele reduz ruído e força bruta, mas não substitui chaves.',
            'PermitRootLogin no\nPasswordAuthentication no\nPubkeyAuthentication yes\nAllowUsers ana deploy\n# validar e aplicar:\n#   sudo sshd -t && sudo systemctl reload ssh     (em RHEL a unit é sshd)\n# [sshd]\n# enabled = true\n# maxretry = 5\n# bantime = 1h'
          ),
          sl(
            'Firewall, usuários, sudo e senhas',
            'Firewall com política padrão de negar a entrada e abrir só o necessário (ufw default deny incoming, ufw allow 22/tcp, ufw allow 443/tcp). Usuários e sudo mínimos: cada pessoa com conta própria, sem contas compartilhadas, sudo apenas para quem precisa e, se possível, só para comandos específicos; remova contas sem uso. Permissões: sem arquivos graváveis por todos (find / -xdev -type f -perm -0002 lista os suspeitos), segredos em 600. Senhas: use chaves SSH e senhas longas únicas em gerenciador; para dar uma segunda camada, MFA no SSH por PAM (TOTP).',
            'sudo ufw default deny incoming\nsudo ufw default allow outgoing\nsudo ufw allow 22/tcp\nsudo ufw allow 443/tcp\nsudo ufw enable\nsudo ufw status verbose'
          ),
          sl(
            'Kernel, SELinux/AppArmor e montagens',
            'sysctl de segurança (visão geral), por exemplo net.ipv4.tcp_syncookies=1 (proteção contra SYN flood), net.ipv4.conf.all.rp_filter=1 (filtro de origem falsificada), net.ipv4.conf.all.accept_redirects=0 e kernel.dmesg_restrict=1 (dmesg só para root), em /etc/sysctl.d/. SELinux (família RHEL) e AppArmor (Ubuntu/Debian/SUSE) são controles de acesso obrigatórios (MAC): limitam o que cada processo pode tocar, mesmo que ele rode como root ou seja comprometido. Mantenha em modo enforcing (getenforce mostra Enforcing; aa-status no AppArmor). Em /etc/fstab, montar /tmp com noexec,nosuid,nodev impede executar programas e usar binários setuid ali; alguns instaladores precisam de exec em /tmp, então teste.',
            'getenforce            # exemplo: Enforcing\nsudo aa-status        # exemplo: apparmor module is loaded.\n# /etc/fstab\ntmpfs  /tmp  tmpfs  defaults,noexec,nosuid,nodev  0  0\nsudo mount -o remount /tmp'
          ),
          sl(
            'Auditoria, logs centralizados, backups e checklist',
            'lynis audit system analisa o servidor e sugere melhorias; os benchmarks do CIS (Center for Internet Security) são guias de configuração segura por sistema, bons como referência (o lynis e o auditd ajudam a verificá-los). Logs centralizados (envio por rsyslog ou journal-remote para outro servidor/SIEM) impedem que um invasor apague seus rastros; trate-os como dados pessoais (retenção e acesso). Backups testados e fora da máquina são a última defesa. Checklist: superfície mínima, atualizações, SSH só com chaves, firewall deny-by-default, fail2ban, sudo mínimo, permissões, MAC ativo, logs centralizados, backups com teste de restauração.',
            'sudo lynis audit system\n# exemplo de final do relatório: Hardening index : NN [####    ]\n# (o valor e as sugestões variam; trate-os como roteiro, não como nota final)'
          )
        ]
      },
      questions: [
        mcq('q1', 'sudo ss -tulpn mostra a linha "tcp LISTEN 0.0.0.0:5432" pertencente ao processo postgres num servidor web. Qual a leitura e a ação correta?', 'd', [
          'O banco só aceita conexões locais; nada a fazer, pois 0.0.0.0 significa localhost nesse contexto',
          'O processo postgres está parado e a linha é só um resquício do último boot do sistema',
          'A porta 5432 é do SSH; mantenha, pois ela é necessária para administrar o servidor remotamente',
          'O PostgreSQL escuta em todas as interfaces; restrinja a 127.0.0.1 e feche a 5432 no firewall'
        ], '0.0.0.0 significa todas as interfaces. Banco de dados não deve ficar exposto: use listen_addresses restrito e regras de firewall, e acesse por túnel/rede privada quando preciso.'),
        mcq('q2', 'Qual conjunto de diretivas do sshd_config endurece o acesso?', 'c', [
          'PermitRootLogin yes, PasswordAuthentication yes e PubkeyAuthentication no, com AllowUsers *',
          'PermitRootLogin prohibit-password e PasswordAuthentication yes para todos os usuários',
          'PermitRootLogin no, PasswordAuthentication no, PubkeyAuthentication yes e AllowUsers',
          'PermitEmptyPasswords yes e AllowUsers *, para facilitar a administração remota'
        ], 'Sem root direto, sem senha, com chaves e lista de usuários permitidos. Senhas vazias e login por senha ampliam muito a superfície.'),
        mcq('q3', 'Você alterou o sshd_config em um servidor remoto. Qual a sequência mais segura?', 'a', [
          'Validar com sshd -t, recarregar e testar um novo login, sempre mantendo a sessão atual aberta',
          'Reiniciar o servidor inteiro e esperar para ver se o SSH volta a responder normalmente',
          'Fechar a sessão atual, recarregar o sshd e então tentar logar de novo pelo cliente',
          'Apagar o arquivo sshd_config para que o serviço assuma o padrão da distribuição'
        ], 'sshd -t detecta erros de sintaxe. Manter a sessão aberta permite desfazer se algo der errado; fechar antes de testar pode trancar você fora.'),
        fill('q4', 'Complete para negar por padrão toda a entrada no ufw:', 'sudo ufw default ___ incoming', ['deny'], 'Política deny-by-default: nada entra a menos que uma regra permita (allow 22/tcp, allow 443/tcp). Depois ative com ufw enable.'),
        mcq('q5', 'Qual o papel do fail2ban?', 'b', [
          'Criptografar as senhas dos usuários no /etc/shadow com um algoritmo de hash mais forte',
          'Ler logs e banir temporariamente IPs com muitas falhas de login, reduzindo força bruta',
          'Impedir qualquer login por SSH fora do horário comercial, bloqueando o serviço por agenda',
          'Substituir o firewall, abrindo e fechando portas conforme a carga do servidor'
        ], 'O fail2ban cria regras temporárias de bloqueio a partir de padrões nos logs. É complemento, não substitui chaves SSH nem firewall.'),
        mcq('q6', 'O que a montagem de /tmp com noexec,nosuid,nodev dificulta?', 'c', [
          'Escrever arquivos em /tmp, pois o noexec bloqueia toda gravação no diretório',
          'Ler arquivos de /tmp por outros usuários do sistema, tornando-o privado para cada usuário',
          'Executar programas e usar binários setuid ou de dispositivo colocados em /tmp',
          'Montar partições USB, que passam a ser negadas conforme as regras do /etc/fstab'
        ], 'noexec impede executar binários a partir do ponto de montagem, nosuid ignora bits setuid e nodev ignora arquivos de dispositivo. A gravação continua permitida.'),
        mcq('q7', 'Por que enviar os logs para um servidor central é uma medida de hardening?', 'b', [
          'Porque duplica o espaço em disco e assim o logrotate deixa de ser necessário',
          'Porque um invasor que apaga os logs locais não apaga as cópias já enviadas',
          'Porque logs remotos não contêm dados pessoais e dispensam retenção definida',
          'Porque o servidor central bloqueia automaticamente os ataques que aparecem nos logs'
        ], 'Cópias remotas preservam evidências após uma invasão. Os logs centrais ainda têm dados pessoais (IPs, usuários) e exigem retenção e acesso restrito.'),
        fill('q8', 'Complete para rodar a auditoria geral de segurança com o Lynis:', 'sudo lynis ___ system', ['audit'], 'lynis audit system analisa configurações e gera sugestões; trate o resultado como roteiro de melhorias.')
      ]
    },
    {
      id: 'lni-24-criptografia-luks-gpg',
      title: 'Criptografia no Linux (hash, GPG, OpenSSL, LUKS)',
      goal: 'Verificar integridade, cifrar e assinar arquivos, proteger discos com LUKS e guardar chaves com cuidado.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Hash: verificar integridade de downloads',
            'Uma função de hash (SHA-256) transforma qualquer conteúdo em um resumo de tamanho fixo. É de mão única (não dá para recuperar o arquivo) e qualquer mudança, por pequena que seja, altera completamente o resultado. Por isso serve para conferir se um download chegou íntegro: calcule o hash e compare com o publicado. Atenção: hash NÃO é criptografia (não protege sigilo) e, se o hash vier do mesmo site comprometido, não prova autenticidade; por isso as distribuições também publicam assinaturas GPG dos arquivos de hashes. sha256sum -c lê uma lista "hash  arquivo" e confere cada um.',
            'echo -n abc | sha256sum\n# ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad  -\nsha256sum a.txt > SHA256SUMS\nsha256sum -c SHA256SUMS\n# a.txt: OK\n# depois de alterar o arquivo:\n# a.txt: FAILED\n# sha256sum: WARNING: 1 computed checksum did NOT match'
          ),
          sl(
            'GPG: cifrar e decifrar',
            'O GPG usa um par de chaves: a chave pública pode ser distribuída; a privada é secreta e fica só com o dono. Para enviar algo confidencial, você cifra com a chave PÚBLICA do destinatário; só a privada dele decifra. Gere seu par com gpg --full-generate-key (gpg --gen-key é a versão rápida) e protege a privada com uma frase secreta. gpg --symmetric cifra com uma frase secreta, sem par de chaves. Listar: gpg --list-keys.',
            'gpg --full-generate-key\ngpg --list-keys\ngpg --encrypt --recipient ana@example.org relatorio.txt   # cria relatorio.txt.gpg\ngpg --decrypt relatorio.txt.gpg > relatorio.txt\ngpg --symmetric --armor segredo.txt                       # só frase secreta'
          ),
          sl(
            'GPG: assinar, verificar e confiar em chaves',
            'Assinar prova AUTORIA e integridade (não sigilo): você assina com a sua chave privada e qualquer pessoa verifica com a sua pública. gpg --detach-sign arquivo gera arquivo.sig; gpg --verify arquivo.sig arquivo confere. Para usar a chave pública de outra pessoa: gpg --import chave.asc e depois confira a impressão digital (fingerprint) com gpg --fingerprint, comparando por OUTRO canal (telefone, em pessoa, site oficial): chave importada sem essa checagem pode ser de um impostor.',
            'gpg --detach-sign --armor release.tar.gz     # gera release.tar.gz.asc\ngpg --verify release.tar.gz.asc release.tar.gz\n# exemplo: Good signature from "Ana Exemplo <ana@example.org>"\ngpg --import chave-da-ana.asc\ngpg --fingerprint ana@example.org\n# compare os 40 caracteres hex com os informados pela Ana por outro canal'
          ),
          sl(
            'OpenSSL: enc, dgst, chaves e CSRs',
            'O openssl é um canivete: openssl enc cifra arquivos com uma frase secreta (use -aes-256-cbc -pbkdf2 -salt; a opção -pbkdf2 evita derivação fraca); atenção, enc não autentica os dados, então para arquivos prefira GPG ou ferramentas modernas. openssl dgst -sha256 arquivo calcula o hash. Para TLS, você gera uma chave privada e um CSR (pedido de assinatura de certificado) que a autoridade certificadora assina; openssl x509 -noout -dates -subject lê datas e dono de um certificado.',
            'openssl enc -aes-256-cbc -pbkdf2 -salt -in dados.txt -out dados.enc\nopenssl enc -d -aes-256-cbc -pbkdf2 -in dados.enc -out dados.txt\nopenssl dgst -sha256 dados.txt\nopenssl genpkey -algorithm RSA -out servidor.key -pkeyopt rsa_keygen_bits:3072\nopenssl req -new -key servidor.key -out servidor.csr\nopenssl x509 -in cert.pem -noout -dates -subject'
          ),
          sl(
            'LUKS e dm-crypt: disco inteiro',
            'LUKS (com dm-crypt, no kernel) cifra uma partição ou disco inteiro de forma transparente: sem a frase secreta, o conteúdo é ilegível. Fluxo com cryptsetup: luksFormat (DESTRÓI os dados existentes: só em disco de teste), open (cria /dev/mapper/NOME), criar sistema de arquivos, montar; ao terminar, desmontar e close. A frase fica em "slots" de chave (há vários) e pode ser trocada. Faça backup do CABEÇALHO LUKS (luksHeaderBackup) e guarde fora do disco: se o cabeçalho for corrompido, os dados ficam irrecuperáveis mesmo com a senha. LUKS protege disco desligado ou roubado; com o volume aberto, o sistema enxerga tudo.',
            '# ATENÇÃO: luksFormat apaga a partição. Use um disco de teste.\nsudo cryptsetup luksFormat /dev/sdX1\nsudo cryptsetup open /dev/sdX1 cofre        # aparece /dev/mapper/cofre\nsudo mkfs.ext4 /dev/mapper/cofre\nsudo mount /dev/mapper/cofre /mnt/cofre\nsudo umount /mnt/cofre && sudo cryptsetup close cofre\nsudo cryptsetup luksHeaderBackup /dev/sdX1 --header-backup-file cabecalho.img'
          ),
          sl(
            'Arquivos, chaves SSH e certificados TLS',
            'Para pastas e arquivos, o eCryptfs e o fscrypt (suporte do kernel por diretório) cifram sem cifrar o disco inteiro (visão geral), e gpg/age servem para arquivos avulsos. Chaves SSH: ssh-keygen -t ed25519 gera o par; proteja a privada (~/.ssh/id_ed25519) com frase secreta e modo 600 (o ssh recusa chave privada legível por outros); compartilhe só a .pub. Certificados TLS reúnem a chave pública, a identidade e a assinatura da autoridade; a chave privada do servidor (privkey.pem) é secreta e jamais deve ir para o Git.',
            'ssh-keygen -t ed25519 -C "ana@laptop"\nls -l ~/.ssh/id_ed25519*\n# exemplo: -rw------- ... id_ed25519      (privada: 600)\n#          -rw-r--r-- ... id_ed25519.pub  (pública)\nchmod 600 ~/.ssh/id_ed25519'
          ),
          sl(
            'Onde guardar chaves e a LGPD',
            'Nunca guarde a chave ao lado dos dados que ela protege: um backup cifrado cuja senha está no mesmo servidor, ou um disco LUKS com a chave em arquivo no próprio disco, não protege nada. Guarde a chave em outro lugar (gerenciador de senhas, cofre, cópia offline), com acesso restrito e sem perder a única cópia (chave perdida = dado perdido). LGPD (Lei 13.709/2018): o controlador deve adotar medidas de segurança técnicas e administrativas aptas a proteger os dados pessoais; criptografia em repouso (LUKS, backups cifrados) e em trânsito (TLS, SSH) são medidas usuais e reduzem o impacto de perda ou roubo de equipamento, mas não substituem controle de acesso. Isto é conteúdo educacional, não orientação jurídica.',
            '# Errado: chave junto dos dados\n#   /srv/backup/dados.tar.gz.gpg\n#   /srv/backup/senha.txt\n# Melhor: a senha fica no gerenciador de senhas / cofre, fora desse servidor'
          )
        ]
      },
      questions: [
        mcq('q1', 'Ao verificar um download com sha256sum -c SHA256SUMS, aparece "imagem.iso: FAILED". O que fazer?', 'c', [
          'Ignorar, pois FAILED só indica que o arquivo está cifrado e não pode ser comparado',
          'Executar a imagem mesmo assim, já que um único bit diferente não altera o resultado do hash',
          'Descartar o arquivo (corrompido ou alterado) e baixá-lo de novo, conferindo a fonte do hash',
          'Reaplicar sha256sum -c até aparecer OK, pois a primeira verificação é apenas um teste'
        ], 'Qualquer alteração, mínima que seja, muda o hash. FAILED significa conteúdo diferente do esperado (corrupção ou adulteração). Hash não cifra nada.'),
        mcq('q2', 'Qual cuidado vale para uma chave privada SSH no seu diretório pessoal?', 'a', [
          'Modo 600 e frase secreta; o ssh recusa a chave se outros usuários puderem ler o arquivo',
          'Modo 644, para que o servidor consiga lê-la durante a autenticação do usuário',
          'Enviá-la por e-mail à equipe de TI, que guarda uma cópia reserva em texto puro',
          'Mantê-la no repositório Git do projeto, junto do código, para sincronizar entre máquinas'
        ], 'A privada é secreta: só o dono lê (600) e a frase adiciona proteção. Só a .pub é compartilhada com o servidor. Chaves no Git ou e-mail ficam expostas.'),
        mcq('q3', 'Você quer enviar um arquivo confidencial para a Ana com GPG. Qual chave cifra e qual decifra?', 'd', [
          'Cifra com a sua chave privada e a Ana decifra com a sua chave pública',
          'Cifra com a sua chave pública e só você consegue decifrar depois',
          'Cifra com a chave privada da Ana, que você recebeu por e-mail',
          'Cifra com a chave pública da Ana e só a chave privada dela decifra'
        ], 'O destinatário publica a chave pública (qualquer um cifra); apenas a privada dele decifra. Cifrar com a própria privada é o que se faz ao assinar, não para sigilo.'),
        fill('q4', 'Complete para verificar uma assinatura destacada:', 'gpg --___ release.tar.gz.asc release.tar.gz', ['verify'], 'gpg --verify ARQUIVO_DE_ASSINATURA ARQUIVO confere a assinatura com a chave pública do assinante (que você já importou e cuja impressão digital conferiu).'),
        mcq('q5', 'Depois de gpg --import chave-da-ana.asc, qual passo evita usar a chave de um impostor?', 'b', [
          'Rodar sha256sum na chave e comparar com o valor exibido pelo próprio arquivo .asc',
          'Sempre conferir a impressão digital (gpg --fingerprint) com a Ana por outro canal',
          'Executar gpg --symmetric na chave, para torná-la privada antes do uso',
          'Apagar a chave pública e pedir à Ana que envie a privada para validar'
        ], 'A impressão digital identifica a chave; comparar por outro canal (telefone, pessoalmente, site oficial) prova que é dela. Chave privada jamais deve ser enviada.'),
        mcq('q6', 'Um disco LUKS foi desligado e o cabeçalho foi corrompido; não há backup dele. A senha está correta. Qual a consequência?', 'd', [
          'Nada: a senha é suficiente e o cryptsetup reconstrói o cabeçalho a partir dos dados do disco',
          'Só os arquivos recentes se perdem; os mais antigos continuam acessíveis',
          'O disco passa a abrir sem senha, pois a ausência de cabeçalho desativa a cifra',
          'Os dados ficam irrecuperáveis: o cabeçalho guarda os slots com a chave mestra cifrada'
        ], 'O cabeçalho contém os key slots que protegem a chave mestra. Sem ele (ou backup via luksHeaderBackup guardado fora do disco) a senha não serve.'),
        mcq('q7', 'Um notebook com LUKS é roubado desligado. Qual a leitura correta sobre proteção?', 'a', [
          'Os dados estão protegidos se a frase for forte; aberto e desbloqueado, o disco é legível',
          'Os dados estão expostos, pois LUKS só protege enquanto o notebook está ligado e em uso',
          'Os dados estão seguros mesmo se a chave estiver em arquivo no próprio disco aberto',
          'O ladrão consegue ler tudo, pois LUKS cifra só os nomes dos arquivos'
        ], 'LUKS cifra o conteúdo em repouso; desligado, sem a frase, o ladrão não lê. Com o volume aberto o sistema enxerga tudo, e chave guardada no mesmo disco anula a proteção.'),
        fill('q8', 'Complete para conferir uma lista de hashes:', 'sha256sum ___ SHA256SUMS', ['-c', '--check'], 'sha256sum -c (ou --check) lê o arquivo de hashes e imprime OK ou FAILED para cada item.')
      ]
    },
    {
      id: 'lni-25-ansible-automacao',
      title: 'Automação com Ansible',
      goal: 'Descrever a configuração de servidores como código idempotente, com playbooks, inventário e segredos protegidos.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que automatizar e o que é idempotência',
            'Configurar servidores à mão não escala, não se repete e não deixa registro. Com automação, a configuração vira código: versionada no Git, revisada e reaplicável. O Ansible é "sem agente": roda no seu computador e fala com os servidores por SSH. Seu princípio-chave é a idempotência: aplicar a mesma tarefa uma, duas ou dez vezes leva ao mesmo estado final. Uma tarefa que já está satisfeita reporta ok e não mexe em nada; só reporta changed quando precisou alterar.',
            '# 1ª execução: apt instala nginx          -> changed\n# 2ª execução: nginx já está instalado     -> ok (nada foi mexido)\n# idempotente: o estado final é o mesmo, e a 2ª vez não causa mudanças'
          ),
          sl(
            'Inventário e módulos',
            'O inventário lista as máquinas e as agrupa. Os módulos são as unidades de trabalho, cada um descreve um estado desejado: apt (pacotes Debian/Ubuntu), copy (copia um arquivo), template (copia gerando o arquivo a partir de um modelo Jinja2), service (iniciar/habilitar serviços), user (contas) e file (arquivos, pastas, permissões, links). Teste a conexão com o módulo ping (ele checa SSH e Python, não faz ICMP).',
            '# inventario.ini\n[web]\nweb1.example.org\nweb2.example.org\n\n[db]\ndb1.example.org ansible_user=deploy\n\n# teste:\n# ansible all -i inventario.ini -m ping'
          ),
          sl(
            'Playbook YAML: instalar e habilitar um serviço',
            'Um playbook é um arquivo YAML (a indentação importa, com espaços) com uma lista de plays; cada play escolhe hosts, opções e tarefas. become: true eleva privilégio (sudo) para as tarefas que precisam de root, como instalar pacotes. Cada tarefa tem name legível e um módulo com parâmetros declarando o estado (state: present, started, absent...). Este playbook instala o nginx e garante que está iniciado e habilitado no boot.',
            '- name: Instalar e habilitar nginx\n  hosts: web\n  become: true\n  tasks:\n    - name: Instalar nginx\n      ansible.builtin.apt:\n        name: nginx\n        state: present\n        update_cache: true\n\n    - name: Iniciar e habilitar nginx\n      ansible.builtin.service:\n        name: nginx\n        state: started\n        enabled: true'
          ),
          sl(
            'Executar com --check e --diff',
            'ansible-playbook -i inventario.ini site.yml executa. Antes de mexer em produção, use --check (modo simulação: mostra o que MUDARIA sem alterar nada) e --diff (mostra as diferenças de conteúdo nos arquivos). -K pede a senha do sudo, quando necessária. O final traz o PLAY RECAP, contagem por host: ok, changed, failed, unreachable.',
            'ansible-playbook -i inventario.ini site.yml --check --diff\n# PLAY RECAP exemplo, 2ª execução real:\n# web1.example.org : ok=3  changed=0  unreachable=0  failed=0\n# changed=0: nada precisou mudar (idempotência)'
          ),
          sl(
            'Variáveis, templates Jinja2 e handlers',
            'Variáveis tornam o playbook reutilizável: vars no play, ou arquivos em group_vars/ e host_vars/. Templates Jinja2 (.j2) usam {{ variavel }} e são renderizados pelo módulo template com a variável de cada host. Handlers são tarefas que só rodam quando notificadas por uma tarefa que mudou algo: por exemplo, recarregar o nginx só se o arquivo de configuração realmente mudou.',
            '- name: Gerar nginx.conf\n  ansible.builtin.template:\n    src: nginx.conf.j2\n    dest: /etc/nginx/nginx.conf\n    mode: "0644"\n  notify: Recarregar nginx\n# no template: worker_processes {{ nginx_workers }};'
          ),
          sl(
            'Segredos, roles e Infraestrutura como Código',
            'Segredos (senhas, tokens, chaves) NUNCA entram em texto puro no Git. O Ansible Vault cifra arquivos: ansible-vault encrypt group_vars/all/vault.yml; rode com --ask-vault-pass (ou um arquivo de senha fora do repositório) e edite com ansible-vault edit. Roles organizam o código em pastas padrão (tasks/, handlers/, templates/, defaults/) para reaproveitar. cloud-init configura a VM no primeiro boot; ferramentas como Terraform criam a infraestrutura e o Ansible a configura: tudo como código versionado (IaC), com revisão e histórico.',
            'ansible-vault encrypt group_vars/all/vault.yml\nansible-playbook -i inventario.ini site.yml --ask-vault-pass\n# estrutura de uma role:\n# roles/nginx/{tasks,handlers,templates,defaults}/main.yml'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que significa dizer que uma tarefa do Ansible é idempotente?', 'b', [
          'Ela sempre reinicia o serviço ao final, para garantir que o estado novo foi aplicado em todos',
          'Aplicá-la várias vezes resulta no mesmo estado final, sem alterações extras se já estiver satisfeita',
          'Ela só pode ser executada uma vez por host, e a segunda execução gera erro',
          'Ela aplica a configuração em todos os hosts ao mesmo tempo, em paralelo'
        ], 'Idempotência: o resultado é o mesmo não importa quantas vezes se execute; o que já está no estado desejado aparece como ok, sem alteração.'),
        mcq('q2', 'Na segunda execução do playbook, o recap mostra "ok=3 changed=0 failed=0". O que isso indica?', 'd', [
          'Que o Ansible ignorou as tarefas por já terem sido executadas antes em outro servidor',
          'Que as três tarefas falharam silenciosamente, mas o failed não conta erros de pacote',
          'Que o playbook rodou em modo --check e nada foi realmente aplicado',
          'Que o servidor já estava no estado desejado e nada precisou ser alterado'
        ], 'changed=0 com ok=3 mostra que as 3 tarefas verificaram o estado e já estava correto. É o comportamento esperado de playbooks idempotentes.'),
        mcq('q3', 'Qual módulo copia um arquivo para o servidor substituindo variáveis do modelo, como o número de workers de cada host?', 'a', [
          'template, que renderiza um modelo Jinja2 e grava o resultado no destino',
          'copy, que copia o arquivo local exatamente como está, sem interpretar variáveis',
          'file, que cria pastas e ajusta permissões, mas não grava conteúdo de modelos',
          'service, que controla o início, o fim e a habilitação de serviços'
        ], 'template processa {{ variaveis }}. copy envia o conteúdo literal, file lida com atributos e service com unidades do systemd.'),
        fill('q4', 'Complete para simular o playbook sem alterar nada nos servidores:', 'ansible-playbook -i inventario.ini site.yml --___ --diff', ['check'], '--check (-C) simula as tarefas e --diff mostra as diferenças de arquivos que seriam aplicadas.'),
        mcq('q5', 'Uma tarefa apt falha com "permission denied" ao rodar como usuário comum no servidor. Qual o ajuste mais adequado?', 'c', [
          'Rodar o playbook sempre como root via SSH, trocando PermitRootLogin para yes no servidor',
          'Trocar o módulo apt por copy, que não exige privilégios de administrador',
          'Adicionar become: true ao play, elevando o privilégio por sudo nas tarefas que precisam',
          'Tirar a verificação de permissões do apt com a opção --no-check-perms'
        ], 'become: true usa sudo (com -K se pedir senha) para as tarefas administrativas, mantendo o login de root desabilitado. Não existe a opção citada.'),
        mcq('q6', 'Uma tarefa usa ansible.builtin.apt com name: nginx e state: started. O que acontece?', 'a', [
          'Falha: started não é um estado válido do apt (use present, latest ou absent)',
          'O apt instala o nginx e também inicia o serviço no mesmo passo, habilitando-o no boot',
          'O Ansible converte started em present automaticamente e segue com as demais tarefas',
          'A tarefa é ignorada porque o módulo apt só aceita o parâmetro state em maiúsculas'
        ], 'Estados de serviço (started, enabled) pertencem ao módulo service; o apt aceita present, absent, latest e afins.'),
        mcq('q7', 'Onde guardar a senha do banco usada pelo playbook, que está num repositório Git compartilhado?', 'd', [
          'Em texto puro no group_vars/all.yml, desde que o repositório seja privado e restrito',
          'Em um comentário do playbook, ofuscada com base64 para não ficar legível de imediato',
          'No histórico do shell, para o usuário digitá-la a cada execução e nunca gravá-la',
          'Cifrado com ansible-vault, nunca em texto puro, com a senha do vault fora do repositório'
        ], 'Segredos nunca em texto puro no Git (mesmo privado: o histórico preserva). Vault cifra o arquivo; base64 não é cifra.'),
        fill('q8', 'Complete para cifrar um arquivo de segredos com o Ansible Vault:', 'ansible-vault ___ group_vars/all/vault.yml', ['encrypt'], 'ansible-vault encrypt cifra o arquivo; edit edita; view mostra. Rode o playbook com --ask-vault-pass.')
      ]
    },
    {
      id: 'lni-26-compilacao-desenvolvimento',
      title: 'Compilação e ferramentas de desenvolvimento',
      goal: 'Compilar programas em C com gcc e make, entender bibliotecas, ldd e depuração, e instalar a partir do código-fonte sem sujar o sistema.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'gcc: do código ao executável',
            'O gcc (ou clang) transforma código-fonte em executável em etapas: pré-processamento (resolve #include e #define, opção -E), compilação para assembly (-S), montagem em objeto (-c, gera .o) e ligação (junta objetos e bibliotecas e gera o executável). -o nomeia a saída, -Wall liga avisos úteis e -g inclui informações de depuração. Compilar e ligar em passos separados permite recompilar só o que mudou.',
            '// ola.c\n#include <stdio.h>\nint main(void) { puts("Olá, Linux!"); return 0; }\n\n// terminal:\n// gcc -Wall -g -o ola ola.c\n// ./ola      ->  Olá, Linux!\n// gcc -c ola.c   ->  gera ola.o (objeto, sem ligação)'
          ),
          sl(
            'make e Makefile',
            'O make automatiza a compilação lendo um Makefile com regras: alvo: dependências, seguidas da receita (comandos), que PRECISA começar com um caractere TAB, não com espaços. O make compara datas e só refaz alvos cujas dependências mudaram. Variáveis (CC, CFLAGS) evitam repetição; $@ é o alvo e $< a primeira dependência; .PHONY marca alvos que não são arquivos (como clean).',
            'CC = gcc\nCFLAGS = -Wall -g\n\nola: ola.o\n\t$(CC) $(CFLAGS) -o $@ ola.o\n\nola.o: ola.c\n\t$(CC) $(CFLAGS) -c ola.c\n\n.PHONY: clean\nclean:\n\trm -f ola ola.o\n# uso: make   |   make clean'
          ),
          sl(
            'Cabeçalhos, bibliotecas e pacotes -dev',
            'Cabeçalhos (.h) declaram funções e ficam em /usr/include (por ex., #include <stdio.h>). Bibliotecas ficam em /usr/lib ou /usr/lib/x86_64-linux-gnu; -lNOME liga a libNOME (-lm liga a libm), -I acrescenta pasta de cabeçalhos e -L pasta de bibliotecas. As distribuições separam o pacote da biblioteca em execução (libssl3) do pacote de desenvolvimento com cabeçalhos: -dev (Debian/Ubuntu) ou -devel (RHEL). Faltou o cabeçalho? Instale o -dev. O pkg-config informa as flags corretas.',
            'gcc -o cripto cripto.c $(pkg-config --cflags --libs openssl)\n# erro típico de pacote -dev ausente:\n# fatal error: openssl/ssl.h: No such file or directory\nsudo apt install libssl-dev        # RHEL: sudo dnf install openssl-devel'
          ),
          sl(
            'Ligação dinâmica vs estática e ldd',
            'Ligação dinâmica (o padrão) deixa as bibliotecas compartilhadas (.so) separadas: executável pequeno, e uma correção na biblioteca beneficia todos os programas. Ligação estática (-static, bibliotecas .a) copia tudo para dentro do executável: maior, independente do sistema, mas precisa recompilar para receber correções. ldd mostra as bibliotecas dinâmicas exigidas; "not found" significa que falta uma. Estático dá "not a dynamic executable".',
            'ldd ./ola\n# exemplo (varia):\n# linux-vdso.so.1 (0x00007ffd...)\n# libc.so.6 => /lib/x86_64-linux-gnu/libc.so.6 (0x00007f...)\n# /lib64/ld-linux-x86-64.so.2 (0x00007f...)\ngcc -static -o ola-estatico ola.c\nldd ./ola-estatico   # not a dynamic executable'
          ),
          sl(
            'ldconfig, LD_LIBRARY_PATH e o formato ELF',
            'O carregador dinâmico procura bibliotecas num cache gerado pelo ldconfig a partir de /etc/ld.so.conf e /etc/ld.so.conf.d/*.conf; ao instalar uma biblioteca em pasta nova, adicione-a lá e rode sudo ldconfig. LD_LIBRARY_PATH acrescenta pastas só para um processo, útil em testes, mas arriscado: quem controla essa variável (ou uma pasta gravável nela) pode fazer o programa carregar uma biblioteca maliciosa; por isso é ignorada em programas setuid, e não deve ficar fixa em perfis do sistema. O formato dos executáveis e bibliotecas no Linux é o ELF; file ./ola identifica; readelf e objdump (apenas citados aqui) inspecionam cabeçalhos e desmontam o código.',
            'file ./ola\n# exemplo: ELF 64-bit LSB pie executable, x86-64, dynamically linked ...\necho "/opt/minhalib/lib" | sudo tee /etc/ld.so.conf.d/minhalib.conf\nsudo ldconfig\nLD_LIBRARY_PATH=/opt/teste/lib ./ola    # só para este comando'
          ),
          sl(
            'gdb e valgrind em visão geral',
            'O gdb depura: compile com -g, abra com gdb ./ola e use break main (ponto de parada), run, next (próxima linha), step (entra na função), print variavel, backtrace (pilha de chamadas) e quit. Em caso de falha de segmentação (segfault), o backtrace mostra onde ocorreu. O valgrind (ferramenta memcheck, padrão) executa o programa e detecta vazamentos de memória e acessos inválidos, ao custo de execução bem mais lenta.',
            'gdb ./ola\n# (gdb) break main\n# (gdb) run\n# (gdb) next\n# (gdb) print contador\n# (gdb) backtrace\n# (gdb) quit\nvalgrind --leak-check=full ./ola'
          ),
          sl(
            'configure, make, make install e DESTDIR',
            'Muitos programas do código-fonte seguem ./configure && make && make install. ./configure verifica dependências e define opções (--prefix=/usr/local é o padrão recomendado para instalações manuais); make compila; make install copia para o prefixo (exige root). Instalar à mão deixa arquivos que o gerenciador de pacotes desconhece: prefira o pacote da distribuição. Para criar pacotes ou testar, use DESTDIR=/tmp/pkg make install: tudo é instalado dentro dessa pasta, sem tocar o sistema real.',
            './configure --prefix=/usr/local\nmake -j4\nmake DESTDIR=/tmp/pkg install     # instala dentro de /tmp/pkg/usr/local/...\nfind /tmp/pkg -type f | head\nsudo make install                  # só depois de conferir'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que gcc -c ola.c produz?', 'd', [
          'O executável final ola, já pronto para rodar sem outra etapa',
          'O arquivo pré-processado ola.i, sem nenhuma compilação',
          'Um arquivo de assembly ola.s, pronto para ser editado à mão',
          'O arquivo objeto ola.o, compilado mas sem a etapa de ligação'
        ], '-c compila e monta, mas não liga. -E pararia no pré-processamento e -S no assembly. A ligação gera o executável.'),
        mcq('q2', 'Ao rodar make, aparece "Makefile:5: *** missing separator". Qual a causa mais comum?', 'b', [
          'Falta o pacote gcc, e o make usa esse erro para avisar a ausência do compilador',
          'A receita foi indentada com espaços em vez de um caractere TAB',
          'O alvo clean deve ser declarado antes de qualquer outro alvo do arquivo',
          'O Makefile precisa ser salvo com a extensão .mk para ser reconhecido'
        ], 'Em Makefile as linhas de receita começam com TAB; espaços causam "missing separator". A ordem dos alvos e a extensão não são a causa.'),
        mcq('q3', 'ldd ./programa mostra "libssl.so.3 => not found". Qual a solução mais adequada?', 'c', [
          'Exportar LD_LIBRARY_PATH=/ no ~/.bashrc para o sistema procurar em todo lugar',
          'Recompilar o programa com -static, o que torna a biblioteca desnecessária em qualquer caso',
          'Instalar o pacote que fornece a libssl.so.3 (e rodar ldconfig se instalada em pasta nova)',
          'Copiar a pasta /usr/include para dentro da pasta do programa'
        ], '"not found" indica biblioteca ausente: instale o pacote de execução (e atualize o cache com ldconfig se necessário). LD_LIBRARY_PATH global é arriscado e -static exige as bibliotecas estáticas.'),
        fill('q4', 'Complete para ligar a biblioteca matemática (libm) ao compilar calc.c:', 'gcc -o calc calc.c -___', ['lm'], '-lNOME liga a libNOME: -lm liga a libm (funções como sqrt e pow). Bibliotecas ficam em /usr/lib e os cabeçalhos em /usr/include.'),
        mcq('q5', 'A compilação falha com "fatal error: zlib.h: No such file or directory". O que falta?', 'a', [
          'O pacote de desenvolvimento da zlib (zlib1g-dev ou zlib-devel), com cabeçalhos',
          'Apenas rodar sudo ldconfig, que regenera os cabeçalhos ausentes a partir das .so',
          'O pacote da zlib em execução, pois os cabeçalhos vêm junto da biblioteca .so',
          'Um Makefile novo, porque o erro vem da sintaxe do make e não de arquivos ausentes'
        ], 'Cabeçalhos (.h) vêm no pacote -dev/-devel. O pacote de execução traz só a biblioteca .so, e ldconfig só atualiza o cache de bibliotecas.'),
        mcq('q6', 'Qual a diferença prática entre ligação estática e dinâmica?', 'b', [
          'A estática gera executáveis menores e a dinâmica copia as bibliotecas para dentro do binário',
          'A dinâmica usa .so compartilhadas do sistema e depende delas; a estática embute o código',
          'A estática só funciona em C++ e a dinâmica só em C',
          'A dinâmica impede que o sistema atualize a biblioteca sem recompilar o programa'
        ], 'Dinâmica: executável pequeno e atualizável via biblioteca do sistema, mas depende dela. Estática: executável maior, autônomo, que precisa ser recompilado para receber correções.'),
        mcq('q7', 'Um programa em C vaza memória e às vezes lê além de um vetor. Qual ferramenta detecta esses problemas executando o programa?', 'c', [
          'readelf, que lista os acessos inválidos à memória a partir dos cabeçalhos ELF',
          'ldd, que verifica vazamentos nas bibliotecas dinâmicas carregadas',
          'valgrind (memcheck), que aponta vazamentos e acessos inválidos à memória',
          'pkg-config, que audita o código-fonte antes da compilação'
        ], 'O valgrind monitora as operações de memória na execução. readelf/ldd inspecionam o binário e suas bibliotecas; pkg-config informa flags de compilação.'),
        fill('q8', 'Complete para instalar o programa dentro de /tmp/pkg, sem tocar o sistema real:', 'make ___=/tmp/pkg install', ['DESTDIR'], 'DESTDIR=/tmp/pkg faz o make install gravar sob essa pasta, útil para empacotar ou inspecionar antes de instalar de verdade.')
      ]
    },
    {
      id: 'lni-27-ambientes-dev-linguagens',
      title: 'Ambientes de desenvolvimento no Linux',
      goal: 'Montar ambientes de Python, Node e outras linguagens isolados, sem quebrar o sistema e sem expor segredos.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Python do sistema e o seu Python',
            'O python3 que vem com a distribuição é usado por ferramentas do próprio sistema (instaladores, utilitários): mexer nele pode quebrar o sistema. Por isso nunca use sudo pip install. Distribuições recentes (Debian, Ubuntu, Fedora) marcam esse Python como "externally managed" (PEP 668): pip install fora de um ambiente isolado falha com o erro externally-managed-environment, de propósito. A saída certa é um ambiente virtual por projeto (venv) ou, para aplicativos de linha de comando, o pipx, que cria um venv isolado para cada programa.',
            'python3 -m venv .venv\nsource .venv/bin/activate\npip install requests\npip list\ndeactivate\n# no Debian/Ubuntu pode faltar o pacote: sudo apt install python3-venv\n# aplicativos de CLI: pipx install nomedoapp'
          ),
          sl(
            'Node: pacote do sistema ou nvm',
            'O pacote nodejs da distribuição costuma ser antigo ou de uma versão só. O nvm (Node Version Manager) instala várias versões no seu diretório pessoal (~/.nvm), sem sudo, e troca entre elas: nvm install --lts, nvm use. Um arquivo .nvmrc no projeto fixa a versão. Cuidado com o instalador do nvm: ele é baixado e executado como script, então leia-o antes (e use a versão oficial do projeto). npm ci instala exatamente o que está no package-lock.json; evite npm install -g com sudo (configure o prefixo no seu home).',
            'nvm install --lts\nnvm use --lts\nnode --version      # exemplo: v22.x (varia)\necho "22" > .nvmrc  # fixa a versão do projeto\nnpm ci'
          ),
          sl(
            'Ruby, Go e Java em visão geral',
            'Cada linguagem tem seu estilo, mas a ideia é a mesma: versão por projeto e dependências fora do sistema. Ruby: rbenv (ou rvm) para versões e bundler (Gemfile) para dependências. Go: baixa-se o toolchain (em /usr/local/go ou pelo gerenciador) e os módulos ficam no go.mod, compilando em um binário único. Java: instala-se o JDK por pacote (openjdk), e update-alternatives --config java escolhe a versão ativa; SDKMAN gerencia várias. Sempre prefira instalar no seu usuário do que mexer em /usr.',
            'update-alternatives --config java   # escolhe qual java o sistema usa\njava -version\ngo version\nbundle install   # Ruby: instala as gems do Gemfile do projeto'
          ),
          sl(
            'PATH e ~/.local/bin',
            'PATH é a lista de diretórios (separados por :) onde o shell procura comandos, na ordem: o primeiro que contiver o nome vence. Programas instalados para o seu usuário (pipx, pip --user) vão para ~/.local/bin; ele precisa estar no PATH. which -a mostra todas as ocorrências de um comando e type mostra qual será usado. Nunca ponha . (diretório atual) no PATH: um arquivo malicioso numa pasta poderia ser executado no lugar de um comando comum.',
            'echo $PATH\n# exemplo: /home/ana/.local/bin:/usr/local/bin:/usr/bin:/bin\n# em ~/.profile ou ~/.bashrc:\nexport PATH="$HOME/.local/bin:$PATH"\nwhich -a python3\ntype python3'
          ),
          sl(
            'Dependências do sistema, do projeto e isolamento',
            'Distinga: dependências do sistema (bibliotecas e ferramentas instaladas por apt/dnf, como libpq-dev ou gcc) e dependências do projeto (bibliotecas da linguagem listadas em requirements.txt, package.json, Gemfile). As do projeto ficam isoladas por projeto; as do sistema são poucas, documentadas no README. Para isolar mais: venv (Python), node_modules local, containers (Docker/Podman) e devcontainers (ambiente de desenvolvimento descrito em .devcontainer/devcontainer.json, que o editor abre dentro de um container). Gerenciadores de versão e scripts de projeto (Makefile: make test, make run) deixam todos do time rodando do mesmo jeito.',
            '.PHONY: test run\ntest:\n\tpython -m pytest\nrun:\n\tpython app.py\n# make test   |   make run'
          ),
          sl(
            'Variáveis de ambiente, .env e permissões',
            'Configurações e segredos (senhas, chaves de API) entram no programa por variáveis de ambiente, não escritos no código. export NOME=valor define para o shell e seus filhos. Em desenvolvimento usa-se um arquivo .env, que NUNCA vai para o Git: ponha .env no .gitignore, versione só um .env.example com nomes e valores falsos, e restrinja com chmod 600 .env. Evite passar segredos como argumento na linha de comando (aparecem no ps e no histórico). Desenvolva com seu usuário comum: rodar servidores de desenvolvimento como root é desnecessário e perigoso.',
            'echo ".env" >> .gitignore\ncp .env.example .env && chmod 600 .env\nset -a; . ./.env; set +a      # carrega as variáveis do arquivo no shell\n# .env.example\n# DATABASE_URL=postgres://usuario:senha-ficticia@localhost/loja_dev'
          )
        ]
      },
      questions: [
        mcq('q1', 'Num Ubuntu recente, pip install requests termina com "externally-managed-environment". O que fazer?', 'a', [
          'Criar um venv (python3 -m venv .venv) ou usar pipx para aplicativos',
          'Repetir o comando com sudo pip install, que ignora a proteção do sistema',
          'Remover o arquivo EXTERNALLY-MANAGED do sistema, desativando o aviso para todos',
          'Reinstalar o sistema operacional, pois o Python do sistema está corrompido'
        ], 'O erro é uma proteção proposital (PEP 668). A solução é isolar: venv por projeto ou pipx para aplicativos. sudo pip e remover a proteção arriscam quebrar ferramentas do sistema.'),
        mcq('q2', 'Por que evitar sudo pip install?', 'c', [
          'Porque o pip só funciona dentro de ambientes virtuais, mesmo quando executado com sudo',
          'Porque o sudo impede o pip de baixar pacotes pela internet e de gravar em /usr',
          'Porque mistura pacotes ao Python do sistema e pode quebrar ferramentas do apt',
          'Porque o pip como root cifra os pacotes e os torna ilegíveis aos programas do sistema'
        ], 'Pacotes instalados por pip no Python do sistema se misturam aos do gerenciador de pacotes, podendo sobrescrever versões que ferramentas do sistema esperam.'),
        mcq('q3', 'Qual sequência cria e ativa um ambiente virtual Python no diretório do projeto?', 'b', [
          'python3 venv .venv && cd .venv && pip install requests',
          'python3 -m venv .venv && source .venv/bin/activate',
          'pip install venv && ./venv activate',
          'sudo apt install .venv && python3 --activate'
        ], 'python3 -m venv .venv cria o ambiente e source .venv/bin/activate o ativa (o prompt ganha o prefixo). As demais sintaxes não existem.'),
        fill('q4', 'Complete para criar um ambiente virtual Python:', 'python3 -m ___ .venv', ['venv'], 'O módulo venv da biblioteca padrão cria o ambiente isolado. No Debian/Ubuntu pode ser preciso instalar python3-venv antes.'),
        mcq('q5', 'PATH=/home/ana/.local/bin:/usr/local/bin:/usr/bin e existe um "ferramenta" em ~/.local/bin e outro em /usr/bin. Qual executa?', 'd', [
          'O de /usr/bin, que é o dos binários da distribuição e por isso tem prioridade sobre o resto',
          'Os dois, em sequência, da esquerda para a direita',
          'Nenhum, pois nomes repetidos no PATH geram erro de ambiguidade',
          'O de ~/.local/bin, pois o shell sempre usa a primeira ocorrência encontrada no PATH'
        ], 'O shell percorre o PATH da esquerda para a direita e executa o primeiro encontrado; which -a lista todos.'),
        mcq('q6', 'Qual a vantagem do nvm sobre o pacote nodejs da distribuição para desenvolver?', 'c', [
          'Instala o Node em /usr, para todos os usuários, com a versão mais antiga disponível',
          'Dispensa o npm, pois o nvm já traz os pacotes do projeto',
          'Instala várias versões no diretório do usuário, sem sudo, e troca por projeto',
          'Garante que o Node rode como root, evitando problemas de permissão'
        ], 'nvm trabalha em ~/.nvm: várias versões, sem privilégio de administrador, com .nvmrc por projeto. Não substitui o npm.'),
        mcq('q7', 'Como tratar o arquivo .env com senhas de desenvolvimento?', 'b', [
          'Versioná-lo no Git privado, pois o repositório é restrito ao time de desenvolvimento',
          'Pô-lo no .gitignore, versionar só um .env.example com valores falsos e dar chmod 600',
          'Salvá-lo em /tmp com permissão 777, para que todos os scripts do time o leiam',
          'Copiar o conteúdo para a linha de comando de cada script, para evitar o arquivo'
        ], 'Segredos não vão ao Git (o histórico preserva). .env.example documenta os nomes sem valores reais, e 600 restringe a leitura. Argumentos de linha de comando aparecem no ps e no histórico.'),
        fill('q8', 'Complete para impedir que o .env entre no Git:', 'echo ".env" >> .___', ['gitignore'], 'O arquivo .gitignore lista padrões ignorados pelo Git. Se o .env já foi commitado, ele continua no histórico: é preciso trocar os segredos.')
      ]
    },
    {
      id: 'lni-28-publicando-aplicacao',
      title: 'Publicando uma aplicação',
      goal: 'Colocar uma aplicação no ar com usuário dedicado, systemd, nginx, TLS, firewall e deploy com rollback.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Arquitetura típica e menor privilégio',
            'O desenho clássico: a internet chega ao firewall (só portas 80 e 443), ao nginx (termina o TLS e faz proxy reverso) e dali à aplicação (gunicorn, node...), que escuta SOMENTE em 127.0.0.1:8000, e ao banco, também local. A aplicação não fica exposta diretamente. Ela roda como um usuário de sistema dedicado, sem shell de login e sem privilégios: se for comprometida, o estrago é limitado (princípio do menor privilégio).',
            'sudo useradd --system --home-dir /srv/meuapp --create-home --shell /usr/sbin/nologin meuapp\ngetent passwd meuapp\n# exemplo: meuapp:x:998:998::/srv/meuapp:/usr/sbin/nologin\n# internet -> :443 nginx -> 127.0.0.1:8000 app -> 127.0.0.1:5432 banco'
          ),
          sl(
            'A aplicação como serviço systemd',
            'Uma unit descreve como o systemd gerencia o app: User e Group (conta dedicada), WorkingDirectory, ExecStart (caminho absoluto do programa, sem shell), EnvironmentFile (variáveis em arquivo), Restart=on-failure (reinicia se cair) e endurecimentos como NoNewPrivileges=true e PrivateTmp=true. O arquivo fica em /etc/systemd/system/meuapp.service. Após criar ou editar, rode systemctl daemon-reload; depois enable --now liga e inicia.',
            '[Unit]\nDescription=Meu App\nAfter=network.target\n\n[Service]\nUser=meuapp\nGroup=meuapp\nWorkingDirectory=/srv/meuapp/current\nEnvironmentFile=/etc/meuapp/meuapp.env\nExecStart=/srv/meuapp/venv/bin/gunicorn --bind 127.0.0.1:8000 app:app\nRestart=on-failure\nNoNewPrivileges=true\nPrivateTmp=true\n\n[Install]\nWantedBy=multi-user.target'
          ),
          sl(
            'Segredos em EnvironmentFile (600)',
            'Senhas e chaves ficam em um arquivo fora do código e do Git, como /etc/meuapp/meuapp.env, com linhas NOME=valor (sem export). O systemd lê o arquivo antes de baixar privilégios, então ele pode pertencer a root com modo 600: a aplicação recebe as variáveis, mas nenhum outro usuário lê o arquivo. Confira com ls -l. Lembre que as variáveis ficam no ambiente do processo (visíveis ao root e ao próprio usuário), então a segurança geral continua importando.',
            'sudo install -d -m 0750 /etc/meuapp\nsudo install -m 0600 -o root -g root /dev/null /etc/meuapp/meuapp.env\n# conteúdo (valores fictícios):\n# DATABASE_URL=postgres://meuapp:senha-ficticia@127.0.0.1/meuapp\n# SECRET_KEY=troque-por-um-valor-aleatorio\nls -l /etc/meuapp/meuapp.env   # -rw------- 1 root root ...'
          ),
          sl(
            'nginx como proxy reverso e TLS',
            'O nginx recebe as conexões, redireciona HTTP para HTTPS e repassa à aplicação (proxy_pass), enviando cabeçalhos que indicam o cliente real. Valide a sintaxe com nginx -t antes de recarregar. O Let\'s Encrypt emite certificados gratuitos via certbot (certbot --nginx -d app.example.org); a validação HTTP-01 acessa a porta 80, então ela precisa estar aberta, e a renovação é automática (teste: certbot renew --dry-run).',
            'server {\n    listen 80;\n    server_name app.example.org;\n    return 301 https://$host$request_uri;\n}\nserver {\n    listen 443 ssl;\n    server_name app.example.org;\n    ssl_certificate     /etc/letsencrypt/live/app.example.org/fullchain.pem;\n    ssl_certificate_key /etc/letsencrypt/live/app.example.org/privkey.pem;\n    location / {\n        proxy_pass http://127.0.0.1:8000;\n        proxy_set_header Host $host;\n        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n        proxy_set_header X-Forwarded-Proto $scheme;\n    }\n}\n# sudo nginx -t && sudo systemctl reload nginx'
          ),
          sl(
            'Firewall, logs, health check e monitoramento',
            'Firewall: abra só 22 (administração), 80 e 443; a porta 8000 da aplicação NÃO é aberta. Logs: a app escreve em stdout e o journal guarda (journalctl -u meuapp -f); os do nginx ficam em /var/log/nginx/ e precisam de rotação. Logs de acesso têm IPs (dados pessoais): defina retenção. Health check: um endpoint simples (/health) que retorna 200 permite verificar o serviço (curl -fsS) e alimentar o monitoramento e o balanceador.',
            'sudo ufw allow 22/tcp\nsudo ufw allow 80/tcp\nsudo ufw allow 443/tcp\nsudo ufw status\ncurl -fsS http://127.0.0.1:8000/health && echo OK\njournalctl -u meuapp -n 20 --no-pager'
          ),
          sl(
            'Deploy por versão, link current e rollback',
            'Em vez de sobrescrever a pasta da aplicação, cada versão vai para um diretório próprio (/srv/meuapp/releases/AAAAMMDD-HHMM) e um link simbólico current aponta para a versão ativa; a unit usa /srv/meuapp/current. Publicar = preparar a nova pasta, trocar o link (ln -sfn, onde -n evita criar o link dentro da pasta de destino) e reiniciar. Rollback = apontar o link de volta para a versão anterior e reiniciar, em segundos. Guarde as últimas versões e mantenha configuração e segredos fora delas.',
            'sudo ln -sfn /srv/meuapp/releases/20261102-1030 /srv/meuapp/current\nsudo systemctl restart meuapp\nreadlink /srv/meuapp/current\n# rollback:\nsudo ln -sfn /srv/meuapp/releases/20261030-0900 /srv/meuapp/current\nsudo systemctl restart meuapp'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que a aplicação (gunicorn) escuta em 127.0.0.1:8000 e só o nginx fica nas portas 80/443?', 'd', [
          'Porque o gunicorn não consegue escutar em outra interface que não seja a local',
          'Porque a porta 8000 é reservada pelo kernel para o nginx',
          'Para o tráfego passar duas vezes pela rede e ficar mais lento, o que reduz ataques',
          'Para a app não ficar exposta e o nginx concentrar o TLS e o repasse'
        ], 'Escutar em 127.0.0.1 impede acesso externo direto; o nginx é o único ponto exposto, onde se concentram TLS e controles.'),
        mcq('q2', 'Para que serve o usuário dedicado com shell /usr/sbin/nologin que executa o serviço?', 'a', [
          'Limita o estrago se a app for comprometida: sem login e sem privilégios extras',
          'Permite que a aplicação use a porta 443 diretamente, dispensando o nginx na frente',
          'Impede que o systemd leia o arquivo de unit do serviço durante a inicialização',
          'Substitui o firewall, bloqueando conexões originadas de IPs desconhecidos'
        ], 'Menor privilégio: conta própria, sem shell e com permissões mínimas. Não resolve portas privilegiadas nem substitui firewall.'),
        mcq('q3', 'Qual a melhor forma de guardar a senha do banco usada pelo serviço systemd?', 'c', [
          'Direto no ExecStart, para que apareça no systemctl status e facilite o diagnóstico',
          'No código-fonte da aplicação, versionado, com um comentário para não esquecer',
          'Em EnvironmentFile=/etc/meuapp/meuapp.env com modo 600, nunca no Git',
          'Em um arquivo dentro de /srv/meuapp/current com permissão 644'
        ], 'Fora do código, fora do Git e com modo restrito. No ExecStart, a senha apareceria no status e no ps; 644 permitiria leitura por qualquer usuário.'),
        fill('q4', 'Complete para apontar o link current para a versão nova, sem criar o link dentro da pasta de destino:', 'sudo ln -sfn /srv/meuapp/releases/v42 ___', ['/srv/meuapp/current'], 'ln -sfn troca o link simbólico (-s simbólico, -f força, -n não segue o link já existente como diretório). Depois reinicie o serviço. Rollback é apontar para a versão anterior.'),
        mcq('q5', 'Depois de editar um server block do nginx, qual sequência evita derrubar o site por erro de sintaxe?', 'b', [
          'systemctl restart nginx e verificar no navegador',
          'nginx -t e, se estiver ok, systemctl reload nginx',
          'Apagar /etc/nginx/nginx.conf e deixar o nginx recriar a configuração',
          'Reiniciar o servidor inteiro, pois o nginx só lê a configuração no boot'
        ], 'nginx -t valida a configuração sem aplicar; reload aplica sem derrubar conexões. restart com erro pode deixar o serviço fora do ar.'),
        mcq('q6', 'O certbot falha na validação HTTP-01 do Let\'s Encrypt. Qual a causa mais provável?', 'd', [
          'A porta 8000 da aplicação está aberta no firewall e confunde o validador',
          'O certificado só pode ser emitido para endereços IP, nunca para nomes de domínio',
          'O nginx precisa estar parado durante toda a vida útil do certificado',
          'A porta 80 está bloqueada ou o domínio não aponta para o servidor'
        ], 'O desafio HTTP-01 acessa o domínio na porta 80; firewall bloqueando ou DNS incorreto impedem a validação.'),
        mcq('q7', 'Uma versão nova apresentou erro. Como fazer rollback rápido com diretórios por versão?', 'a', [
          'Apontar o link current para a pasta da versão anterior e reiniciar o serviço',
          'Apagar a pasta atual e restaurar o backup da noite anterior do servidor inteiro',
          'Editar o código no servidor, linha a linha, até voltar ao comportamento antigo',
          'Reinstalar o nginx e o gunicorn, que guardam as versões anteriores da aplicação'
        ], 'Com releases separados, voltar é só trocar o link e reiniciar. Editar em produção ou restaurar o servidor inteiro é lento e arriscado.'),
        fill('q8', 'Complete para fazer o systemd reler as units depois de criar o arquivo meuapp.service:', 'sudo systemctl ___', ['daemon-reload'], 'systemctl daemon-reload relê os arquivos de unit. Depois, systemctl enable --now meuapp liga no boot e inicia agora.')
      ]
    },
    {
      id: 'lni-29-bancos-de-dados-linux',
      title: 'Bancos de dados no Linux',
      goal: 'Instalar, proteger, fazer backup lógico e operar PostgreSQL e MariaDB/MySQL com mínimo privilégio e atenção à LGPD.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Instalar pelos pacotes e conhecer o serviço',
            'O caminho mais simples e atualizável é o pacote da distribuição: postgresql, ou mariadb-server (e mysql-server). O banco vira um serviço systemd (postgresql, mariadb) e guarda tudo em um diretório de dados: /var/lib/postgresql/VERSÃO/main no Debian/Ubuntu (/var/lib/pgsql/data em RHEL) e /var/lib/mysql no MariaDB/MySQL. Não mexa nesses arquivos à mão nem copie com o banco ligado; a administração é pelas ferramentas do banco.',
            'sudo apt install postgresql        # ou: sudo apt install mariadb-server\nsystemctl status postgresql\nsudo -u postgres psql -c "SELECT version();"\nsudo ss -tlnp | grep -E "5432|3306"'
          ),
          sl(
            'Usuários, roles e autenticação',
            'No PostgreSQL, usuários são roles. Local, por padrão, usa autenticação peer: o usuário do sistema operacional é o papel do banco (sudo -u postgres psql). A aplicação deve ter o seu papel com login e senha, DONO só do seu banco e SEM superusuário. No MariaDB/MySQL, cria-se o usuário e concedem-se somente as permissões necessárias (SELECT, INSERT, UPDATE, DELETE) no banco da aplicação. Senhas fortes, únicas, geradas e guardadas fora do código.',
            "-- PostgreSQL (psql como postgres)\nCREATE ROLE meuapp LOGIN PASSWORD '<senha-forte-aqui>';\nCREATE DATABASE loja OWNER meuapp;\n\n-- MariaDB/MySQL\nCREATE USER 'meuapp'@'localhost' IDENTIFIED BY '<senha-forte-aqui>';\nGRANT SELECT, INSERT, UPDATE, DELETE ON loja.* TO 'meuapp'@'localhost';"
          ),
          sl(
            'Não exponha a porta do banco à internet',
            'Banco de dados quase nunca deve aceitar conexões da internet. Restrinja a escuta: no PostgreSQL, listen_addresses = \'localhost\' em postgresql.conf; no MariaDB/MySQL, bind-address = 127.0.0.1. Confirme com ss -tlnp (o endereço deve ser 127.0.0.1, não 0.0.0.0) e reforce com o firewall bloqueando 5432 e 3306. Para administrar à distância, use um túnel SSH (ssh -L 5432:127.0.0.1:5432 usuario@servidor) em vez de abrir a porta.',
            "# postgresql.conf\nlisten_addresses = 'localhost'\n# mariadb: /etc/mysql/mariadb.conf.d/50-server.cnf\n# bind-address = 127.0.0.1\nsudo ss -tlnp | grep -E '5432|3306'\n# exemplo certo: LISTEN 0 244 127.0.0.1:5432\nssh -L 5432:127.0.0.1:5432 usuario@servidor.example.org"
          ),
          sl(
            'pg_hba.conf em visão geral',
            'No PostgreSQL, o pg_hba.conf define quem pode se conectar, de onde, em qual banco e como se autentica. Cada linha tem: tipo (local ou host), banco, usuário, endereço e método (peer, scram-sha-256...). A leitura é de cima para baixo e vale a PRIMEIRA linha que casar. Prefira scram-sha-256 a métodos antigos e nunca use trust em servidor real, nem 0.0.0.0/0. Depois de alterar, recarregue (systemctl reload postgresql).',
            '# TYPE  DATABASE  USER      ADDRESS         METHOD\nlocal   all       postgres                  peer\nhost    loja      meuapp    127.0.0.1/32    scram-sha-256\n# lê-se: o papel meuapp pode conectar ao banco loja, a partir da máquina local,\n# autenticando por senha (scram-sha-256)'
          ),
          sl(
            'Backup lógico, restauração e cron',
            'O dump lógico gera um arquivo consistente com o banco em uso. PostgreSQL: pg_dump -Fc loja > loja.dump (formato custom, restaurado com pg_restore; o texto SQL puro se restaura com psql -f). MariaDB/MySQL: mysqldump --single-transaction loja > loja.sql, restaurado com mysql loja < loja.sql. Restaure em um banco novo para testar. No cron, não coloque a senha na linha de comando (aparece no ps): use ~/.pgpass (modo 600) ou ~/.my.cnf. Crie backups cifrados, com retenção e teste de restauração.',
            'sudo -u postgres pg_dump -Fc loja > /backup/loja-$(date +%F).dump\nsudo -u postgres createdb loja_teste\nsudo -u postgres pg_restore -d loja_teste /backup/loja-2026-11-02.dump\nmysqldump --single-transaction loja > loja.sql\nmysql loja_teste < loja.sql\n# cron: 0 3 * * * /usr/local/bin/backup-db.sh >> /var/log/backup-db.log 2>&1'
          ),
          sl(
            'Memória, monitoramento e segurança',
            'Os parâmetros de memória são visão geral: no PostgreSQL shared_buffers (porção da RAM, comumente cerca de um quarto) e work_mem (por operação); no MariaDB innodb_buffer_pool_size. Alocar demais causa swap e OOM, então ajuste medindo. Monitore conexões (SELECT count(*) FROM pg_stat_activity;), espaço em disco, consultas lentas (slow query log) e use exportadores (postgres_exporter) para o Prometheus. Segurança: TLS (ssl = on) para conexões remotas, senhas fortes, mínimo privilégio, disco cifrado com LUKS e atualizações em dia.',
            "sudo -u postgres psql -c \"SELECT count(*) FROM pg_stat_activity;\"\n# exemplo:  count\n#           -------\n#               7\ndf -h /var/lib/postgresql"
          ),
          sl(
            'LGPD: dados pessoais no banco',
            'Bancos concentram dados pessoais (nome, e-mail, documentos). Aplique: minimização (guarde só as colunas necessárias para a finalidade), controle de acesso (papéis distintos para app, relatórios e administração; ninguém acessa com a conta do dono sem necessidade), auditoria de quem acessou, retenção e eliminação (rotinas que apagam ou anonimizam dados vencidos, como DELETE ... WHERE criado_em < ...), cuidado com logs que gravam valores de consultas (log_statement) e com backups, que carregam os mesmos dados: cifre, restrinja e dê prazo. Conteúdo educacional, não orientação jurídica.',
            "-- retenção: apagar dados vencidos (exemplo fictício, teste antes)\nDELETE FROM sessoes WHERE criado_em < now() - interval '90 days';\n-- pseudonimizar em vez de guardar o dado cru\n-- guardar hash/identificador interno no lugar do documento, quando possível"
          )
        ]
      },
      questions: [
        mcq('q1', 'sudo ss -tlnp mostra "LISTEN 0.0.0.0:3306" para o mysqld num servidor com IP público. Qual o problema e a correção?', 'b', [
          'Nenhum: 0.0.0.0 significa que só o próprio servidor consegue conectar ao banco',
          'Escuta em todas as interfaces; use bind-address = 127.0.0.1 e feche a 3306',
          'A porta 3306 pertence ao SSH; deve ser fechada para encerrar o acesso remoto',
          'O mysqld está parado e o ss só mostra um registro antigo, basta reiniciar o serviço'
        ], '0.0.0.0 é "todas as interfaces". Restrinja o bind a 127.0.0.1 e reforce com firewall; acesso remoto de administração por túnel SSH.'),
        mcq('q2', 'No pg_hba.conf há a linha "host loja meuapp 127.0.0.1/32 scram-sha-256". O que ela permite?', 'c', [
          'Qualquer usuário conectar de qualquer endereço ao banco loja, sem exigir senha alguma',
          'O papel meuapp conectar ao banco loja de qualquer endereço da internet, com senha',
          'O papel meuapp conectar ao banco loja pela própria máquina, com senha scram-sha-256',
          'O superusuário postgres conectar localmente, via autenticação peer'
        ], 'Tipo host, banco loja, usuário meuapp, endereço 127.0.0.1/32 (só local) e método scram-sha-256 (senha). Vale a primeira linha que casar.'),
        mcq('q3', 'Qual conta a aplicação deve usar para conectar ao banco?', 'a', [
          'Um papel próprio, sem superusuário, com só as permissões necessárias nas suas tabelas',
          'O superusuário postgres, para evitar erros de permissão em produção e acelerar o deploy',
          'O papel root do sistema, já que ele é o dono do diretório de dados do banco',
          'Uma conta sem senha, pois o banco já escuta somente em 127.0.0.1 e é considerado local'
        ], 'Menor privilégio: se a aplicação for comprometida (por exemplo, por SQL injection), o dano fica limitado. Superusuário e contas sem senha ampliam o risco.'),
        fill('q4', 'Complete para um dump consistente do MariaDB/MySQL (InnoDB) sem travar as tabelas:', 'mysqldump --single-___ loja > loja.sql', ['transaction'], '--single-transaction faz o dump numa transação consistente de InnoDB sem bloquear escritas. O arquivo se restaura com mysql loja < loja.sql.'),
        mcq('q5', 'Você gerou o dump com pg_dump -Fc loja > loja.dump. Como restaurar em um banco novo para testar?', 'd', [
          'Rodar psql -f loja.dump, como se faz com qualquer script SQL de texto',
          'Copiar loja.dump para /var/lib/postgresql e reiniciar o serviço do banco',
          'Abrir loja.dump em um editor e colar o conteúdo no psql',
          'Criar o banco (createdb) e usar pg_restore -d loja_teste loja.dump'
        ], 'O formato custom (-Fc) é lido pelo pg_restore. O psql -f serve para dumps em texto SQL puro. Restaurar sempre em banco de teste valida o backup.'),
        mcq('q6', 'Num script de backup no cron, qual a forma mais segura de fornecer a senha do banco?', 'b', [
          'Escrevê-la na linha do comando, em texto puro, para o script ser autoexplicativo',
          'Usar ~/.pgpass (ou ~/.my.cnf) com modo 600, nunca na linha de comando nem no Git',
          'Gravá-la dentro do próprio script, que fica com permissão 755 para todos',
          'Deixar a senha em branco e liberar o acesso sem autenticação no pg_hba.conf'
        ], 'Argumentos na linha de comando aparecem no ps e nos logs. Arquivos de credenciais com 600 limitam a leitura. trust no pg_hba.conf desprotege o banco.'),
        mcq('q7', 'Qual prática do banco está alinhada à LGPD?', 'c', [
          'Guardar todos os dados dos clientes para sempre, pois podem ser úteis no futuro do negócio',
          'Registrar o valor completo de todas as consultas nos logs para facilitar auditorias futuras',
          'Coletar só as colunas necessárias, restringir o acesso por papéis e eliminar dados vencidos',
          'Compartilhar um login único de administrador entre toda a equipe para simplificar o acesso'
        ], 'Minimização, acesso restrito e eliminação por prazo. Logs com valores e logins compartilhados aumentam a exposição e impedem rastrear quem acessou.'),
        fill('q8', 'Complete a diretiva para o PostgreSQL escutar apenas localmente:', "listen_addresses = '___'", ['localhost', '127.0.0.1'], "listen_addresses define em quais interfaces o PostgreSQL escuta; 'localhost' impede conexões remotas diretas.")
      ]
    },
    {
      id: 'lni-30-terminal-produtivo-tmux',
      title: 'Terminal produtivo (tmux, dotfiles, histórico)',
      goal: 'Trabalhar mais rápido e com segurança no terminal: tmux, dotfiles, histórico, atalhos e ferramentas modernas.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'tmux: sessões que sobrevivem à queda do SSH',
            'Quando a conexão SSH cai, os programas do terminal recebem o sinal de encerramento e morrem, inclusive aquele backup de horas. O tmux é um multiplexador de terminal: ele roda como um servidor em segundo plano e mantém suas sessões vivas. Você desanexa (detach) e anexa (attach) de novo de qualquer lugar. Fluxo: criar a sessão, trabalhar, desanexar (Ctrl+b, depois d) ou perder a conexão, e reanexar depois.',
            'tmux new -s trabalho        # cria e entra na sessão "trabalho"\n# ... roda a tarefa longa ... depois: Ctrl+b  d   (desanexa)\ntmux ls\n# exemplo: trabalho: 1 windows (created Mon Nov  2 10:00:00 2026)\ntmux attach -t trabalho     # volta exatamente de onde parou\ntmux kill-session -t trabalho'
          ),
          sl(
            'Janelas, painéis e o screen',
            'Todos os atalhos do tmux começam pelo prefixo Ctrl+b e depois uma tecla. Janelas (como abas): c cria, n/p vão para a próxima/anterior, 0 a 9 escolhem pelo número. Painéis (divisões da janela): % divide em esquerda/direita, " divide em cima/baixo, setas movem o foco, x fecha o painel, z amplia/restaura. O screen é o antecessor, com ideia igual e atalhos com prefixo Ctrl+a: screen -S nome cria, Ctrl+a d desanexa, screen -r nome volta, screen -ls lista.',
            '# prefixo: Ctrl+b\n# c  nova janela      n/p  próxima/anterior\n# %  divide |        "    divide --\n# d  desanexa        x    fecha painel\nscreen -S backup     # alternativa: Ctrl+a d desanexa\nscreen -r backup'
          ),
          sl(
            '~/.bashrc, aliases, funções e dotfiles',
            'O ~/.bashrc é lido pelos shells interativos do bash; ~/.profile (ou ~/.bash_profile) pelos de login. Nele ficam aliases (atalhos), funções (que aceitam argumentos) e variáveis de PATH. Dotfiles são esses arquivos de configuração (.bashrc, .vimrc, .tmux.conf, .gitconfig): vale versioná-los em um repositório Git e usar links simbólicos para a pasta pessoal. Nunca coloque segredos neles (tokens, senhas, chaves): um repositório de dotfiles costuma ser público ou compartilhado. Segredos vão em um arquivo local não versionado, carregado pelo .bashrc se existir.',
            "alias ll='ls -lah'\nmkcd() { mkdir -p \"$1\" && cd \"$1\"; }\n[ -f ~/.bashrc.local ] && . ~/.bashrc.local    # segredos/ajustes só desta máquina, fora do Git\nsource ~/.bashrc                             # recarrega sem abrir outro terminal"
          ),
          sl(
            'Histórico, HISTCONTROL e segredos',
            'O bash guarda os comandos em memória (limite HISTSIZE) e grava em ~/.bash_history ao sair (limite HISTFILESIZE). Ctrl+R busca no histórico (digite parte do comando; repita para o próximo resultado); history lista; !! repete o último. Com HISTCONTROL=ignorespace, comandos que começam com ESPAÇO não são gravados; ignoredups descarta repetições seguidas e ignoreboth faz as duas coisas. Isso não torna seguro digitar segredos: eles continuam visíveis no ps, em logs de auditoria e na tela. Prefira ler a senha de forma interativa (read -s) ou de um arquivo com modo 600. O histórico pode conter dados pessoais: trate-o como tal.',
            'export HISTSIZE=5000 HISTFILESIZE=10000\nexport HISTCONTROL=ignoreboth\n curl -u ana:senha-ficticia ...   # começa com espaço: não é gravado, mas aparece no ps!\nread -s -p "Senha: " SENHA; echo      # digitação sem eco, fora do histórico'
          ),
          sl(
            'Atalhos do readline',
            'A linha de comando do bash usa a biblioteca readline, com atalhos estilo Emacs: Ctrl+A vai ao início da linha e Ctrl+E ao fim; Alt+B e Alt+F andam por palavra; Ctrl+W apaga a palavra anterior, Ctrl+U apaga do cursor ao início, Ctrl+K do cursor ao fim, Ctrl+Y cola o que foi apagado; Alt+. insere o último argumento do comando anterior; Ctrl+L limpa a tela; Ctrl+C cancela o comando; Ctrl+D encerra a sessão (fim de entrada). Dominar esses atalhos economiza muito tempo.',
            'mkdir /srv/projeto/novo\ncd Alt+.          # insere /srv/projeto/novo: cd /srv/projeto/novo\n# Ctrl+A  início   Ctrl+E  fim   Ctrl+W  apaga palavra   Ctrl+U  apaga até o início'
          ),
          sl(
            'fzf, ripgrep, fd, bat, watch e xargs -P',
            'fzf é um buscador difuso interativo (também melhora o Ctrl+R); ripgrep (rg) busca texto em arquivos de forma rápida, respeitando o .gitignore; fd é um find mais simples; bat é um cat com cores e numeração (em Debian/Ubuntu os executáveis podem se chamar fdfind e batcat). watch -n 2 comando repete o comando a cada 2 segundos. xargs monta comandos a partir da entrada; com -P N roda até N processos em paralelo, e find -print0 com xargs -0 trata nomes com espaços. Para trabalhar remotamente, ssh com tmux: -t força terminal, e tmux new -As nome anexa se existir ou cria.',
            'rg "ERRO" /var/log/meuapp/\nwatch -n 2 df -h\nfind . -name "*.log" -print0 | xargs -0 -P 4 -n 1 gzip   # comprime 4 por vez\nssh servidor.example.org -t tmux new -As trabalho\n# saída típica do gzip em paralelo: a1.log.gz a2.log.gz a3.log.gz'
          )
        ]
      },
      questions: [
        mcq('q1', 'Você iniciou um backup longo dentro de uma sessão tmux e a conexão SSH caiu. O que acontece com o backup?', 'a', [
          'Continua no servidor dentro do tmux; reconecte e use tmux attach',
          'É encerrado na hora, porque o tmux também recebe o sinal de desconexão do SSH',
          'Fica suspenso até o próximo reinício do servidor',
          'É copiado para uma nova sessão criada automaticamente pelo próprio tmux'
        ], 'O servidor do tmux roda independentemente da conexão; a sessão continua viva e você reanexa com tmux attach -t NOME.'),
        mcq('q2', 'No tmux, como desanexar da sessão sem encerrá-la?', 'd', [
          'Digitar exit, que esconde a sessão',
          'Pressionar Ctrl+D duas vezes seguidas',
          'Pressionar Ctrl+b e depois x, que fecha o painel mas mantém a sessão',
          'Pressionar Ctrl+b e depois d'
        ], 'Ctrl+b é o prefixo e d é o detach. exit ou Ctrl+D encerram o shell (e a sessão, se for o último painel); x fecha o painel.'),
        mcq('q3', 'Qual atalho do readline move o cursor para o início da linha, e qual apaga tudo do cursor até o início?', 'c', [
          'Ctrl+E move ao início e Ctrl+K apaga do cursor até o início da linha',
          'Ctrl+W move ao início e Ctrl+Y apaga tudo do cursor até o início da linha',
          'Ctrl+A move ao início e Ctrl+U apaga do cursor até o início',
          'Ctrl+L move ao início e Ctrl+C apaga o texto do cursor até o início'
        ], 'Ctrl+A vai ao início; Ctrl+U apaga até o início; Ctrl+E vai ao fim e Ctrl+K apaga até o fim; Ctrl+W apaga uma palavra.'),
        fill('q4', 'Complete para criar uma sessão tmux chamada trabalho:', 'tmux ___ -s trabalho', ['new', 'new-session'], 'tmux new -s NOME (new-session) cria e anexa à sessão. Depois, tmux attach -t NOME volta a ela.'),
        mcq('q5', 'Por que digitar uma senha direto na linha de comando é má ideia, mesmo usando um espaço antes do comando?', 'b', [
          'Porque o bash recusa executar comandos que contenham a palavra senha em qualquer posição',
          'Porque aparece no ps, em logs e na tela, mesmo sem entrar no histórico',
          'Porque o espaço inicial grava o comando duas vezes no histórico, o que o torna visível',
          'Porque o ssh apaga automaticamente a senha da memória após dez segundos de uso'
        ], 'O espaço (com ignorespace) só evita a gravação no histórico. Argumentos de comando ficam visíveis a outros usuários no ps; prefira read -s ou arquivo com modo 600.'),
        mcq('q6', 'Ao versionar seus dotfiles em um repositório Git, o que NUNCA deve entrar?', 'd', [
          'Aliases e funções de uso pessoal, pois não funcionam em outras máquinas ou distribuições',
          'O arquivo .tmux.conf, por conter atalhos exclusivos',
          'As configurações de cores do terminal e do editor',
          'Tokens, senhas e chaves de API, que devem sempre ficar em arquivo local fora do repositório'
        ], 'Dotfiles costumam ser compartilhados: segredos nunca vão nele. Um arquivo local não versionado (carregado pelo .bashrc se existir) guarda o que for sensível.'),
        mcq('q7', 'O que faz find . -name "*.log" -print0 | xargs -0 -P 4 gzip?', 'a', [
          'Comprime os .log, até 4 gzip por vez, tratando bem nomes com espaços',
          'Procura 4 arquivos .log e compacta todos eles em um único arquivo comprimido',
          'Comprime cada .log 4 vezes seguidas, para aumentar a taxa de compressão de cada um',
          'Lista os arquivos .log em 4 colunas e envia o resultado de cada coluna ao gzip'
        ], '-P 4 limita a 4 processos em paralelo; -print0 com -0 separa por byte nulo, o que protege nomes com espaços. Cada processo comprime arquivos separados.'),
        fill('q8', 'Complete para que o bash não grave no histórico comandos iniciados por espaço:', 'export HISTCONTROL=ignore___', ['space', 'both'], 'ignorespace descarta comandos que começam com espaço; ignoreboth soma o ignoredups. Isso não esconde o comando do ps.')
      ]
    },
    {
      id: 'lni-31-troubleshooting-sistematico',
      title: 'Diagnóstico sistemático',
      goal: 'Diagnosticar problemas com método: delimitar, testar uma hipótese por vez e usar o checklist certo para cada sintoma.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Metodologia',
            'Diagnosticar é um processo, não um palpite. 1) Reproduzir ou descrever o sintoma com precisão (o que falha, desde quando, qual mensagem). 2) Delimitar: o que mudou recentemente? Afeta tudo ou só um usuário, um host, um horário? 3) Formular uma hipótese testável. 4) Testar UMA coisa por vez: se mudar cinco coisas ao mesmo tempo, não saberá qual resolveu. 5) Desfazer o que não ajudou, para não acumular mudanças. 6) Documentar a causa-raiz (não só o remendo) e a prevenção. Antes de alterar configurações, faça uma cópia.',
            '# anotar: horário, comando, saída, o que foi alterado\ncp -a /etc/meuapp/app.conf /etc/meuapp/app.conf.bak-20261102\n# mudar UMA coisa, testar, e só então a próxima'
          ),
          sl(
            'Disco cheio: df, inodes, du e arquivos apagados abertos',
            'df -h mostra o uso por sistema de arquivos; df -i mostra inodes (cada arquivo usa um): é possível receber "No space left on device" com muito espaço livre se os inodes acabaram, por exemplo com milhões de arquivos pequenos. du -xh --max-depth=1 /var | sort -h acha os maiores diretórios (-x não cruza sistemas de arquivos). Um caso clássico: você apaga um log gigante, mas o espaço não volta, porque um processo ainda o mantém aberto: lsof +L1 lista arquivos apagados (link count 0) ainda abertos; reinicie o serviço (ou esvazie com truncate antes de apagar).',
            'df -h /var\n# exemplo: /dev/sda2  50G  49G  1.0G  98% /var\ndf -i /var\n# exemplo: Inodes IUsed IFree IUse%  ->  3276800 3276800 0 100%\nsudo du -xh --max-depth=1 /var | sort -h | tail -n 5\nsudo lsof +L1\n# exemplo: java  1234 app  4w  REG  8,2  40000000000  0  /var/log/app/app.log (deleted)'
          ),
          sl(
            'Memória, OOM, CPU alta e processo em estado D',
            'Memória: dmesg -T | grep -i -E "out of memory|killed process" revela o OOM killer (o kernel mata um processo quando a memória acaba). CPU alta: top (tecle P para ordenar por CPU) e pidstat 1 mostram quem consome; investigue o que o processo faz antes de matá-lo. Processo travado: ps -eo pid,stat,cmd mostra o estado; D significa espera ininterruptível, quase sempre por I/O (disco ou NFS com problema): kill -9 não resolve, é preciso tratar o dispositivo/montagem. Muitos em D elevam o load average com a CPU ociosa.',
            'sudo dmesg -T | grep -i "killed process"\n# exemplo: Out of memory: Killed process 4321 (java) total-vm:...\nps -eo pid,stat,wchan:20,cmd | awk \'$2 ~ /^D/\'\npidstat 1 3'
          ),
          sl(
            'Rede e DNS: de baixo para cima',
            'Siga as camadas: link e IP (ip -br addr), rota (ip route), alcance de um IP (ping), resolução de nome (dig, resolvectl status, /etc/resolv.conf), porta e serviço (ss -tulpn, curl -v). Se ping para um IP funciona mas para o nome falha, o problema é o DNS, não a rede. dig +short example.org mostra a resposta; dig @IP_DO_SERVIDOR testa um servidor específico. ss -tulpn mostra quem escuta em cada porta (uma porta ocupada impede outro serviço de subir).',
            'ip -br addr\nip route\nping -c 2 192.0.2.1          # IP responde?\nping -c 2 example.org        # nome responde? (se não, DNS)\ndig +short example.org\nsudo ss -tulpn | grep :443'
          ),
          sl(
            'Permissão negada: namei, ACL e SELinux',
            'Permission denied raramente é só o arquivo: é preciso ter permissão de execução (x) em CADA diretório do caminho. namei -l /caminho/do/arquivo lista as permissões de todos os componentes do caminho e revela o diretório que bloqueia. Verifique id (usuário e grupos), ls -l, getfacl (ACLs). Em sistemas com SELinux, ls -Z mostra o contexto e getenforce o modo; recusas aparecem em ausearch -m avc; com AppArmor, procure DENIED no journal. Também confira se o sistema de arquivos está montado como somente leitura ou noexec.',
            'namei -l /srv/app/config/app.yml\n# exemplo:\n# f: /srv/app/config/app.yml\n# drwxr-xr-x root root /\n# drwxr-xr-x root root srv\n# drwx------ root root app      <- aqui o usuário comum é barrado\n# drwxr-xr-x root root config\n# -rw-r--r-- root root app.yml\nid\ngetfacl /srv/app/config/app.yml'
          ),
          sl(
            'Serviço que não sobe e boot falho',
            'Serviço: systemctl status NOME mostra o estado e as últimas linhas; journalctl -xeu NOME traz o log completo da unidade (-x acrescenta explicações, -e vai ao fim, -u escolhe a unidade). Causas comuns: erro de configuração (teste com nginx -t, apachectl configtest), caminho no ExecStart errado, usuário inexistente, porta já em uso e permissão em arquivos. Boot falho (visão geral): no menu do GRUB escolha o modo de recuperação (recovery) ou edite a linha do kernel; use um pendrive live para reparar; erros de montagem costumam vir de uma linha incorreta do /etc/fstab (a opção nofail evita travar o boot por discos opcionais).',
            'systemctl status meuapp\njournalctl -xeu meuapp\nsystemctl cat meuapp        # mostra a unit efetiva\nsudo ss -tulpn | grep :8000 # a porta já está em uso?'
          ),
          sl(
            'strace para "arquivo não encontrado" e a causa-raiz',
            'Quando um programa diz "arquivo não encontrado" mas não diz qual, o strace mostra as chamadas de sistema: filtre as de arquivo e procure ENOENT (no such file or directory). Ele revela o caminho exato que o programa tentou abrir. Resolvido o problema, registre a causa-raiz (por que aconteceu, não só o que foi feito), o horário, a correção e a prevenção (alerta, teste, mudança de processo). Esse registro evita repetir o incidente e ajuda quem vier depois.',
            'strace -f -e trace=file ./meuprograma 2>&1 | grep ENOENT\n# exemplo:\n# openat(AT_FDCWD, "/etc/meuapp/config.yml", O_RDONLY) = -1 ENOENT (No such file or directory)\n# causa: o programa procura /etc/meuapp/config.yml, que não existe'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um serviço parou de subir depois de você alterar cinco parâmetros de uma vez. Qual a melhor abordagem?', 'c', [
          'Alterar mais cinco parâmetros, aumentando as chances de acertar a combinação certa',
          'Reinstalar o serviço e deixar todas as mudanças para depois, sem anotar nada',
          'Desfazer, aplicar sempre uma mudança por vez, testando a cada uma e anotando o resultado',
          'Reiniciar o servidor, pois isso corrige a maioria das configurações erradas'
        ], 'Uma mudança por vez permite saber qual causou o efeito; desfazer o que não ajuda evita acumular ruído, e as anotações viram documentação da causa-raiz.'),
        mcq('q2', 'Um programa grava "No space left on device", mas df -h mostra 40% de uso. Qual a próxima verificação?', 'b', [
          'free -h, pois a mensagem se refere à memória RAM e ao espaço de swap',
          'df -i: os inodes podem ter acabado mesmo com espaço livre em blocos',
          'ulimit -n, que mostra o espaço restante em disco para cada usuário',
          'lsblk, que informa quantos arquivos o disco ainda comporta ao todo'
        ], 'O espaço pode sobrar enquanto os inodes (um por arquivo) acabam, por exemplo por milhões de arquivos pequenos. df -i mostra IUse%.'),
        mcq('q3', 'Você apagou um log de 40 GB mas df continua mostrando o disco cheio. Qual comando identifica a causa?', 'a', [
          'sudo lsof +L1, que lista arquivos apagados ainda abertos por algum processo',
          'sudo fsck /var, que recupera o espaço marcado como usado pelo log',
          'sudo mount -o remount /var, que libera todos os arquivos pendentes',
          'sudo iostat -x, que mostra os arquivos apagados que ainda estão em disco'
        ], 'Enquanto um processo mantém o arquivo aberto, o espaço só é liberado quando ele o fecha. lsof +L1 lista os arquivos com zero links ainda abertos; reiniciar o serviço resolve.'),
        fill('q4', 'Complete para procurar no log do kernel os processos mortos pelo OOM killer:', 'sudo dmesg -T | grep -i "killed ___"', ['process'], 'O OOM killer registra "Out of memory: Killed process PID (nome)". Também pode-se usar journalctl -k.'),
        mcq('q5', 'Um usuário recebe "Permission denied" em /srv/app/config/app.yml, que tem modo 644. Qual comando mostra as permissões de todos os diretórios do caminho?', 'd', [
          'chmod -R 755 /srv/app, que corrige de uma vez todos os componentes do caminho',
          'ls -l /srv/app/config/app.yml, que já exibe o caminho inteiro e seus donos',
          'ulimit -p /srv/app/config/app.yml, que lista as permissões do caminho',
          'namei -l /srv/app/config/app.yml, listando cada componente do caminho'
        ], 'É preciso x em cada diretório; o 644 do arquivo não basta se /srv/app barra o usuário. namei -l revela onde. Ajustar com chmod -R sem entender amplia permissões desnecessariamente.'),
        mcq('q6', 'Um serviço não inicia depois do deploy. Qual o primeiro passo mais eficiente?', 'c', [
          'Reinstalar o sistema operacional para limpar configurações antigas',
          'Mudar o modo de todos os arquivos para 777 e tentar de novo',
          'Ler systemctl status e journalctl -xeu NOME, que mostram o erro da unidade',
          'Apagar o arquivo da unit e criá-lo de novo a partir de um exemplo da internet'
        ], 'O log da unidade quase sempre diz o motivo (caminho, usuário, porta, permissão, configuração inválida). Chutar mudanças em massa dificulta achar a causa.'),
        mcq('q7', 'ping para 192.0.2.1 responde, mas ping para example.org diz "Name or service not known". Qual a conclusão?', 'a', [
          'A rede e a rota funcionam; o problema está na resolução de nomes (DNS)',
          'O cabo de rede está desconectado, pois o ping por nome precisa de mais banda',
          'O firewall bloqueia todo o tráfego de saída da máquina',
          'A porta 443 do destino está fechada'
        ], 'Se um IP responde, a camada de rede está funcionando; falhar só no nome aponta para DNS (resolv.conf, resolvectl, dig).'),
        fill('q8', 'Complete para que o strace mostre apenas chamadas de sistema relacionadas a arquivos:', 'strace -f -e trace=___ ./meuprograma', ['file'], 'trace=file filtra as chamadas que recebem nomes de arquivos (open, openat, stat...). Procure ENOENT no resultado para achar o arquivo ausente.')
      ]
    },
    {
      id: 'lni-32-linux-na-nuvem',
      title: 'Linux na nuvem',
      goal: 'Usar instâncias Linux na nuvem com acesso por chave, cloud-init, firewall do provedor e atenção a custos e metadados.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Instâncias, imagens, regiões e tipos',
            'Na nuvem (IaaS) você aluga máquinas virtuais sob demanda, chamadas instâncias. A instância nasce de uma imagem (um disco pronto com o sistema operacional) e de um tipo/tamanho (quantidade de vCPU e memória). Fica em uma região (local geográfico) e em uma zona (datacenter dentro da região). Você paga por uso, então o que fica ligado gera custo. Os nomes dos recursos mudam de provedor para provedor, mas os conceitos se repetem.',
            '# imagem (Ubuntu, Debian...) + tipo (2 vCPU, 4 GB) + região  =  instância\n# a instância recebe um IP privado e (opcionalmente) um IP público'
          ),
          sl(
            'Acesso por SSH com par de chaves e usuário padrão',
            'Imagens de nuvem não têm senha: no momento da criação, você indica uma chave pública, que o provedor (via cloud-init) instala no ~/.ssh/authorized_keys do usuário padrão da imagem. O nome desse usuário varia por imagem e provedor (por exemplo ubuntu, debian ou ec2-user): consulte a documentação. O login direto como root costuma vir desabilitado. A chave privada fica só no seu computador, com modo 600, jamais na imagem, em e-mail ou no Git.',
            'chmod 600 ~/.ssh/minha-chave\nssh -i ~/.ssh/minha-chave ubuntu@203.0.113.10\n# 203.0.113.10: endereço de documentação (exemplo)\nsudo apt update && sudo apt upgrade -y'
          ),
          sl(
            'cloud-init e user-data',
            'O cloud-init roda no primeiro boot e configura a instância a partir do user-data que você informa na criação: criar usuários, instalar chaves e pacotes, gravar arquivos e executar comandos (runcmd). Assim cada instância nasce pronta e igual às outras. O arquivo começa com #cloud-config. Acompanhe com cloud-init status e o log /var/log/cloud-init-output.log. Atenção: o user-data pode ser lido de dentro da instância e aparece no painel do provedor; não ponha segredos nele.',
            '#cloud-config\npackage_update: true\npackages:\n  - nginx\n  - fail2ban\nruncmd:\n  - systemctl enable --now nginx\n# depois do boot:\n# cloud-init status    ->  status: done'
          ),
          sl(
            'Discos, volumes, IP elástico e snapshots',
            'O disco raiz vem da imagem. Volumes de bloco são discos extras que persistem independentemente da instância: aparecem em lsblk como novos dispositivos; você cria o sistema de arquivos (mkfs), monta e coloca no /etc/fstab por UUID com a opção nofail. O IP público padrão geralmente muda quando a instância é parada e iniciada de novo; um IP estático (elástico, reservado) mantém o endereço para o DNS apontar. Snapshots de volume e imagens da instância servem para recuperação e para clonar; combine com backups fora da conta/região.',
            'lsblk\n# exemplo: nvme1n1  100G  disk   (volume novo, ainda sem sistema de arquivos)\nsudo mkfs.ext4 /dev/nvme1n1\nsudo blkid /dev/nvme1n1                  # pega o UUID\n# /etc/fstab\nUUID=<uuid-do-volume>  /dados  ext4  defaults,nofail  0  2'
          ),
          sl(
            'Grupos de segurança: o firewall do provedor',
            'O grupo de segurança é um firewall virtual do provedor, aplicado fora da VM (stateful: a resposta a uma conexão permitida volta sem regra extra). Por padrão tudo que entra é negado até você criar regras de entrada: SSH (22) somente do seu IP (um /32, não 0.0.0.0/0), 80 e 443 abertos ao mundo se for um site; banco de dados jamais aberto à internet. Ele não substitui o firewall dentro da instância (ufw/nftables): use os dois (defesa em profundidade) e revise as regras.',
            '# regras de entrada (exemplo):\n#  TCP 22   origem 198.51.100.7/32   (administração, só do seu IP)\n#  TCP 80   origem 0.0.0.0/0\n#  TCP 443  origem 0.0.0.0/0\n#  5432: nenhuma regra (banco só acessível pela rede privada)'
          ),
          sl(
            'Metadados da instância e o risco de SSRF',
            'Dentro da instância existe um serviço de metadados, em um endereço especial (169.254.169.254, acessível só de dentro) que informa dados da própria VM e pode entregar credenciais temporárias associadas a ela. O risco é o SSRF (Server-Side Request Forgery): uma aplicação web vulnerável que busca URLs a pedido do usuário pode ser enganada a consultar o serviço de metadados e devolver essas credenciais ao atacante. Defesas (visão geral): validar e restringir URLs que o servidor busca, exigir o modo de metadados com token quando o provedor oferece, limitar saída de rede e dar à instância só as permissões mínimas.',
            '# somente dentro da instância (exemplo conceitual):\n# curl -s http://169.254.169.254/...\n# Defesa: a aplicação nunca deve buscar URLs arbitrárias fornecidas por usuários\n# sem validar destino, e a instância deve ter o mínimo de permissões'
          ),
          sl(
            'Atualização, hardening, custos e backups',
            'Ao criar a instância: atualize (apt update && apt upgrade), ative atualizações automáticas de segurança, endureça o SSH (só chaves, sem root), mantenha firewall e fail2ban e crie usuário comum com sudo. Custos: instâncias ligadas, discos (mesmo órfãos), IPs reservados sem uso, snapshots e tráfego de saída geram cobrança; desligue/remova o que não usa, marque recursos com tags e configure alertas de orçamento. Backups e snapshots: teste a restauração e guarde cópia fora do local. LGPD: saiba em que região os dados ficam, criptografe volumes e restrinja o acesso.',
            'sudo apt install unattended-upgrades\n# /etc/ssh/sshd_config\n# PasswordAuthentication no\n# PermitRootLogin no\n# tags de custo: ambiente=teste  dono=ana  prazo=2026-12-01'
          )
        ]
      },
      questions: [
        mcq('q1', 'Você criou uma instância Ubuntu com uma chave SSH e tenta ssh root@IP, sem sucesso. O que provavelmente falta?', 'b', [
          'Digitar a senha de root, que o provedor envia por e-mail na criação da instância',
          'Usar o usuário padrão da imagem (ubuntu); o root direto costuma estar bloqueado',
          'Instalar o Windows Server para habilitar o acesso remoto por chave pública',
          'Reiniciar a instância três vezes até o SSH passar a aceitar o login do root'
        ], 'Imagens de nuvem normalmente não têm senha e bloqueiam root por SSH; a chave pública fica no usuário padrão da imagem, cujo nome varia.'),
        mcq('q2', 'Qual é a forma correta de conectar, e que cuidado vale para a chave privada?', 'a', [
          'ssh -i ~/.ssh/minha-chave ubuntu@203.0.113.10, com a chave em modo 600',
          'ssh ubuntu@203.0.113.10 --key minha-chave.pub, usando a chave pública para autenticar',
          'ssh -p minha-chave ubuntu@203.0.113.10, com a chave em modo 777 para todos os serviços',
          'ssh -k ubuntu@203.0.113.10 e enviar a chave privada por e-mail ao provedor'
        ], '-i indica o arquivo da chave privada; o ssh recusa chaves legíveis por outros. A chave pública é a que vai para o servidor.'),
        mcq('q3', 'Para que serve o user-data do cloud-init, e o que NÃO deve entrar nele?', 'd', [
          'Para configurar o hipervisor do provedor; senhas podem entrar, pois só o provedor consegue ler o conteúdo',
          'Para fazer backup da instância; segredos podem entrar, pois o conteúdo é cifrado pelo provedor no painel',
          'Para definir o firewall do provedor; chaves privadas podem entrar, por serem cifradas durante o envio',
          'Configurar a instância no primeiro boot; segredos não devem entrar, pois ele é legível de dentro'
        ], 'O user-data automatiza o primeiro boot, mas pode ser lido por quem acessa a instância e aparece no painel; segredos ficam em gerenciador próprio.'),
        fill('q4', 'Complete para conectar usando a chave privada ~/.ssh/minha-chave:', 'ssh -___ ~/.ssh/minha-chave ubuntu@203.0.113.10', ['i'], 'ssh -i ARQUIVO usa essa identidade (chave privada). O arquivo precisa ter modo 600.'),
        mcq('q5', 'Qual regra de entrada de SSH é a mais adequada no grupo de segurança?', 'c', [
          'TCP 22 aberto para 0.0.0.0/0, pois o fail2ban já protege o servidor contra força bruta',
          'Todas as portas abertas para a internet durante a fase de testes',
          'TCP 22 liberado apenas para o seu IP (/32) ou rede de administração',
          'TCP 22 fechado e senha de root liberada pela porta 80'
        ], 'Restringir a origem reduz muito a superfície. O fail2ban é um complemento, não um motivo para expor a porta ao mundo.'),
        mcq('q6', 'Após parar e iniciar a instância, o IP público mudou e o DNS quebrou. Qual a solução?', 'a', [
          'Reservar um IP estático (elástico) e apontar o DNS para ele',
          'Trocar o nome do servidor com hostnamectl, que fixa o IP público',
          'Deixar o DNS apontando para o IP privado, que é o mesmo da internet',
          'Desativar o firewall do provedor para que o IP deixe de mudar'
        ], 'Em muitos provedores o IP público dinâmico muda ao parar/iniciar. Um IP reservado mantém o endereço (e deve ser liberado se não usado, para não gerar custo).'),
        mcq('q7', 'O que é o risco de SSRF em relação ao serviço de metadados (169.254.169.254)?', 'd', [
          'Um ataque que derruba o serviço de metadados com muitas requisições, apagando a instância',
          'Um erro de DNS que impede a instância de descobrir o próprio IP',
          'A troca de chaves SSH dos usuários pelo próprio provedor sem aviso',
          'Uma aplicação induzida a requisitar essa URL interna e vazar as credenciais da instância'
        ], 'SSRF faz o servidor fazer a requisição por ordem do atacante; o endereço de metadados só responde de dentro da instância e pode expor credenciais. Validar URLs e usar permissões mínimas mitiga.'),
        fill('q8', 'Complete para consultar o andamento do cloud-init na instância:', 'cloud-init ___', ['status'], 'cloud-init status mostra se está running, done ou error; os logs ficam em /var/log/cloud-init.log e cloud-init-output.log.')
      ]
    },
    {
      id: 'lni-33-lgpd-servidores',
      title: 'Privacidade e LGPD em servidores Linux',
      goal: 'Identificar onde há dados pessoais em um servidor e aplicar retenção, acesso, criptografia e eliminação com critério.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Onde há dados pessoais em um servidor',
            'Dado pessoal é toda informação relacionada a uma pessoa natural identificada ou identificável (LGPD, art. 5º, I): nome, e-mail, CPF, mas também IP e identificadores quando permitem identificar alguém. Em um servidor Linux eles aparecem em muitos lugares além do banco de dados: logs (IP, usuário, URLs), arquivos enviados, backups, e-mails (filas e caixas), histórico do shell (~/.bash_history), dumps de memória (core dumps), arquivos temporários, swap e caches. Primeiro passo: um inventário de onde estão, para quê servem e quem acessa; o que você não mapeia, não protege.',
            'sudo grep -rlE "[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+" /var/log 2>/dev/null | head   # logs com e-mails\nls -l ~/.bash_history\nls -ld /var/lib/systemd/coredump 2>/dev/null\n# onde pode haver dado pessoal: logs, banco, uploads, backups, e-mails, histórico, core dumps, swap'
          ),
          sl(
            'Conceitos básicos da Lei 13.709/2018',
            'Titular é a pessoa a quem os dados se referem. Controlador é quem decide sobre o tratamento (por exemplo, a empresa que opera o serviço); operador trata os dados em nome do controlador (um fornecedor de hospedagem, por exemplo); o encarregado é o canal entre controlador, titulares e a ANPD, a autoridade nacional. Princípios que orientam a técnica: finalidade (usar para um propósito definido), necessidade (coletar o mínimo), segurança (medidas técnicas e administrativas, art. 46), prevenção e responsabilização (demonstrar o cumprimento). Todo tratamento precisa de base legal. Isto é conteúdo educacional e não substitui orientação jurídica.',
            '# finalidade  -> para que preciso deste dado?\n# necessidade -> dá para coletar/registrar menos?\n# segurança   -> quem acessa, está cifrado, há registro de acesso?\n# prazo       -> até quando guardo e como elimino?'
          ),
          sl(
            'Retenção, rotação e pseudonimização de logs',
            'Defina um prazo e faça o sistema aplicá-lo. Logs de arquivo: logrotate com rotate N (ex.: daily + rotate 30 mantém cerca de 30 dias). Journal: SystemMaxUse= e MaxRetentionSec= em journald.conf. Backups e arquivos antigos: find -mtime +30 -delete (teste antes com -print). Minimização em logs: mascare ou anonimize o que não precisa estar completo, como o último octeto do IPv4. Atenção ao vocabulário: anonimização é irreversível (o dado deixa de identificar a pessoa por meios razoáveis); pseudonimização (por exemplo, trocar o usuário por um hash com sal) ainda permite reidentificar com informação adicional, então continua sendo dado pessoal.',
            "find /srv/backup -type f -name 'backup-*.tar.gz' -mtime +30 -print    # primeiro só lista\nfind /srv/backup -type f -name 'backup-*.tar.gz' -mtime +30 -delete\nsed -E 's/^([0-9]+\\.[0-9]+\\.[0-9]+)\\.[0-9]+/\\1.0/' access.log\n# entrada:  192.0.2.57 - - [02/Nov/2026:10:00:01 +0000] \"GET / HTTP/1.1\" 200 512\n# saída:    192.0.2.0 - - [02/Nov/2026:10:00:01 +0000] \"GET / HTTP/1.1\" 200 512"
          ),
          sl(
            'Controle de acesso, auditoria e criptografia',
            'Acesso: modo 640 ou 600 em arquivos com dados pessoais, grupos específicos, contas pessoais (nada de login compartilhado), sudo só para quem precisa e com registro. Auditoria: o auditd vigia leituras/gravações em pastas sensíveis e guarda quem acessou; registre os acessos aos sistemas. Criptografia em trânsito: TLS (HTTPS, banco com ssl) e SSH; nada de FTP, Telnet ou HTTP puro para dados pessoais. Criptografia em repouso: LUKS no disco, backups cifrados, gerenciador de chaves separado dos dados. Criptografia não substitui controle de acesso.',
            'sudo chmod 640 /srv/app/dados-clientes.csv\nsudo chown root:equipe-dados /srv/app/dados-clientes.csv\nsudo auditctl -w /srv/app/dados-clientes.csv -p r -k acesso_dados_clientes\nsudo ausearch -k acesso_dados_clientes'
          ),
          sl(
            'Core dumps, swap e histórico',
            'Quando um programa trava, o sistema pode gravar um core dump com a memória do processo: nela podem estar senhas, tokens e dados pessoais em texto puro. Se não precisa deles, desative: ulimit -c 0 na sessão ou serviço, e Storage=none em /etc/systemd/coredump.conf (com systemd-coredump). A swap também guarda trechos da memória: use swap cifrada ou LUKS. O histórico do shell pode registrar senhas digitadas: HISTCONTROL=ignorespace, limitar HISTFILESIZE e nunca digitar segredos na linha de comando.',
            'ulimit -c 0\n# /etc/systemd/coredump.conf\n# [Coredump]\n# Storage=none\nHISTFILESIZE=1000   # no ~/.bashrc'
          ),
          sl(
            'Eliminação segura: os limites do shred',
            'shred sobrescreve o arquivo antes de apagá-lo, mas só funciona se cada escrita cair no mesmo lugar físico. Isso NÃO é garantido em: SSD/NVMe (o controlador remapeia blocos), sistemas de arquivos copy-on-write (Btrfs, ZFS), sistemas com journaling ou snapshots, e dados que já foram copiados para backups, caches e logs. A melhor estratégia é criptografia + descarte da chave (crypto-erase): se o volume é LUKS, destruir os slots/cabeçalho torna os dados irrecuperáveis. Para descartar o equipamento: apagamento de mídia inteira (como blkdiscard em SSDs, quando suportado) ou destruição física.',
            'shred -u -n 1 relatorio-temporario.txt     # ok em disco simples; não confie em SSD/COW\n# crypto-erase (LUKS): destruir o cabeçalho/chave inutiliza o volume inteiro\n# melhor ainda: já ter cifrado desde o início'
          ),
          sl(
            'Registro de acessos e resposta a incidentes',
            'Incidente de segurança com dados pessoais (vazamento, acesso indevido) exige resposta organizada: conter (isolar a máquina, revogar credenciais), preservar evidências (logs, cópia forense), avaliar o impacto (quais dados, quantos titulares), corrigir a causa e comunicar. A LGPD (art. 48) prevê que o controlador comunique à ANPD e aos titulares incidentes que possam acarretar risco ou dano relevante, em prazo razoável; há sanções administrativas, incluindo multas. Ter logs de acesso íntegros e centralizados, e um plano escrito de resposta, ajuda a agir rápido. Consulte o encarregado e o jurídico da organização: este conteúdo não é orientação jurídica.',
            '# plano de resposta (resumo)\n# 1. conter    2. preservar evidências    3. avaliar impacto\n# 4. corrigir  5. comunicar (ANPD/titulares, conforme a lei)   6. documentar e melhorar'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual destes locais de um servidor pode conter dados pessoais e é facilmente esquecido?', 'd', [
          'Somente o banco de dados de produção, que é o único local de armazenamento oficial',
          'O arquivo /etc/hostname, que guarda o nome da máquina',
          'O diretório /usr/share/doc, que guarda a documentação dos pacotes',
          'Logs, backups, histórico do shell e core dumps, além do banco'
        ], 'IPs e usuários nos logs, cópias em backups, comandos digitados e memória em core dumps podem conter dados pessoais. Um inventário completo evita pontos cegos.'),
        mcq('q2', 'Na LGPD, qual a diferença entre controlador e operador?', 'c', [
          'O operador decide as finalidades e o controlador só executa ordens técnicas',
          'O controlador é o titular dos dados e o operador é a autoridade nacional',
          'O controlador decide o tratamento; o operador trata em nome do controlador',
          'Não há diferença: ambos os termos designam o titular dos dados'
        ], 'Controlador decide finalidades e meios; operador trata em seu nome (como um fornecedor de hospedagem). Titular é a pessoa dos dados; ANPD é a autoridade.'),
        mcq('q3', 'Trocar o nome de usuário nos logs por um hash com sal, guardando a tabela de correspondência, é:', 'b', [
          'Anonimização irreversível, e os dados deixam de ser pessoais em qualquer caso concreto',
          'Pseudonimização: reidentificável com a tabela, logo ainda é dado pessoal',
          'Criptografia em repouso dos logs, o que dispensa por completo o controle de acesso',
          'Uma violação da lei, pois a LGPD proíbe qualquer tratamento de logs de acesso'
        ], 'Se há como reverter (tabela de correspondência, sal conhecido), é pseudonimização e a proteção continua necessária. Anonimização exige que a reidentificação não seja razoavelmente possível.'),
        fill('q4', 'Complete para apagar os backups com mais de 30 dias (depois de conferir a lista com -print):', "find /srv/backup -type f -name 'backup-*.tar.gz' -mtime +30 ___", ['-delete'], 'find ... -delete apaga o que casou; teste sempre antes com -print. Isso aplica o prazo de retenção definido.'),
        mcq('q5', 'Por que shred -u arquivo.txt não garante eliminar o dado em um SSD com Btrfs?', 'a', [
          'Porque SSD e copy-on-write gravam em locais físicos novos, deixando cópias antigas',
          'Porque o shred só consegue apagar arquivos menores que 1 MB por execução do comando',
          'Porque o shred só funciona em discos magnéticos de 5400 rpm ou mais lentos que isso',
          'Porque o shred cifra o arquivo em vez de sobrescrevê-lo, mantendo-o legível'
        ], 'Sobrescrita pressupõe escrever no mesmo lugar físico. SSDs remapeiam blocos e sistemas COW/snapshots mantêm versões antigas. Prefira criptografia + descarte da chave.'),
        mcq('q6', 'Por que desativar core dumps (ulimit -c 0 ou Storage=none) quando não são necessários?', 'c', [
          'Porque eles ocupam espaço na RAM, que é um recurso caro em servidores',
          'Porque o kernel deixa de funcionar quando há um core dump aberto',
          'Porque a memória do processo gravada em disco pode conter senhas e dados pessoais',
          'Porque a LGPD proíbe qualquer arquivo com extensão core em servidores de produção'
        ], 'O core dump é uma cópia da memória do processo, que pode conter segredos e dados pessoais. Sem necessidade de depuração, não gravar reduz o risco.'),
        mcq('q7', 'Detectado um acesso indevido a uma base com dados pessoais, qual a sequência mais adequada?', 'd', [
          'Apagar os logs para evitar que a informação se espalhe e seguir sem avisar ninguém da equipe',
          'Reinstalar o servidor imediatamente, sem guardar nenhuma cópia, para eliminar o problema',
          'Esperar um mês para ver se há novos acessos antes de qualquer ação',
          'Conter o acesso, preservar evidências, avaliar impacto, corrigir e comunicar conforme a lei'
        ], 'Contenção e evidências vêm primeiro; apagar logs destrói provas. A LGPD prevê comunicação à ANPD e aos titulares em incidentes que possam gerar risco ou dano relevante.'),
        fill('q8', 'Complete para desativar a geração de core dumps na sessão atual:', 'ulimit -c ___', ['0'], 'ulimit -c define o tamanho máximo de core dump; 0 desativa. Em serviços systemd, use LimitCORE=0.')
      ]
    },
    {
      id: 'lni-34-projeto-servidor-endurecido',
      title: 'Projeto: servidor web endurecido',
      goal: 'Reunir as peças do nível intermediário em um servidor web seguro, com backup testado, logs e verificações de segurança e LGPD.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O plano e a ordem dos passos',
            'Vamos montar, em uma VM de teste (Ubuntu/Debian, endereços de documentação), um servidor web com uma aplicação em um usuário dedicado. Ordem: 1) usuário comum com sudo, 2) SSH só com chaves, 3) firewall, 4) atualizações automáticas, 5) aplicação como serviço systemd, 6) nginx com TLS, 7) backup agendado com teste de restauração, 8) logs com logrotate e monitoramento básico, 9) checklists de segurança e LGPD. A ordem importa: nunca desligue a senha do SSH antes de provar que a chave funciona em outra sessão.',
            '# arquitetura\n# internet -> ufw (22,80,443) -> nginx :443 (TLS) -> app 127.0.0.1:8000 (usuário "meuapp")\n# dados: /srv/meuapp   segredos: /etc/meuapp/meuapp.env (600)   backups: /srv/backup'
          ),
          sl(
            'Usuário comum, sudo e SSH com chaves',
            'No seu computador: ssh-keygen -t ed25519 e ssh-copy-id usuario@IP envia a chave pública. No servidor, como administrador, crie um usuário comum no grupo sudo. SÓ DEPOIS de abrir uma segunda sessão com a chave e confirmar que funciona, endureça /etc/ssh/sshd_config: PermitRootLogin no, PasswordAuthentication no, PubkeyAuthentication yes e AllowUsers. Valide a sintaxe (sshd -t) e recarregue; mantenha a sessão antiga aberta até testar o novo login.',
            'sudo adduser admin                 # pergunta senha e dados; use valores fictícios\nsudo usermod -aG sudo admin         # em RHEL: -aG wheel\nssh-copy-id admin@203.0.113.10      # no seu computador\n# /etc/ssh/sshd_config\nPermitRootLogin no\nPasswordAuthentication no\nPubkeyAuthentication yes\nAllowUsers admin\nsudo sshd -t && sudo systemctl reload ssh'
          ),
          sl(
            'Firewall, atualizações e fail2ban',
            'Firewall com política padrão de negar a entrada, liberando só o necessário. Cuidado: libere a porta 22 ANTES de ativar o ufw, ou você se tranca fora. Atualizações automáticas de segurança com unattended-upgrades e fail2ban para reduzir a força bruta no SSH. Confirme o resultado com ufw status verbose e com ss -tulpn (só 22, 80, 443 escutando para fora; a app em 127.0.0.1).',
            'sudo ufw default deny incoming\nsudo ufw default allow outgoing\nsudo ufw allow 22/tcp\nsudo ufw allow 80/tcp\nsudo ufw allow 443/tcp\nsudo ufw enable\nsudo apt install -y unattended-upgrades fail2ban\nsudo ss -tulpn'
          ),
          sl(
            'Aplicação como serviço e nginx com TLS',
            'A aplicação roda como o usuário de sistema meuapp, escutando só em 127.0.0.1:8000 e lendo segredos do EnvironmentFile (modo 600, dono root). O nginx termina o TLS (certificado do Let\'s Encrypt via certbot) e faz proxy_pass para a app. Valide com nginx -t, recarregue e confira a renovação com certbot renew --dry-run. (As units e o server block completos estão na lição de publicação; aqui os comandos de ligação.)',
            'sudo useradd --system --home-dir /srv/meuapp --create-home --shell /usr/sbin/nologin meuapp\nsudo systemctl daemon-reload\nsudo systemctl enable --now meuapp\nsudo certbot --nginx -d app.example.org\nsudo nginx -t && sudo systemctl reload nginx\nsudo certbot renew --dry-run\ncurl -fsS https://app.example.org/health'
          ),
          sl(
            'Backup agendado e teste de restauração',
            'O script abaixo foi executado em ambiente de teste: cria um tar.gz datado, grava o hash (com o cd para que o caminho no arquivo .sha256 seja só o nome, o que permite conferir de qualquer lugar), e apaga cópias com mais de 14 dias (retenção). set -euo pipefail faz o script parar no primeiro erro e em variáveis não definidas; ${1:?...} exige o argumento. Agende com cron e SEMPRE teste a restauração: o segundo script confere o hash, extrai em pasta temporária e compara com a origem.',
            '#!/usr/bin/env bash\nset -euo pipefail\nORIGEM="${1:?uso: backup.sh ORIGEM DESTINO}"\nDESTINO="${2:?uso: backup.sh ORIGEM DESTINO}"\nRETENCAO_DIAS=14\nARQ="backup-$(date +%Y%m%d-%H%M%S).tar.gz"\numask 077\nmkdir -p "$DESTINO"\ntar -czf "$DESTINO/$ARQ" -C "$ORIGEM" .\n( cd "$DESTINO" && sha256sum "$ARQ" > "$ARQ.sha256" )\nfind "$DESTINO" -name \'backup-*.tar.gz*\' -mtime +"$RETENCAO_DIAS" -delete\necho "ok: $DESTINO/$ARQ"'
          ),
          sl(
            'Rodando o teste de restauração',
            'Saída real do teste, em diretórios temporários com dados fictícios: o segundo script confere o hash (OK), restaura em pasta temporária e compara com a origem (diff -r). Quando a origem mudou depois do backup, o diff acusa a diferença e o script termina com erro: isso não é falha da restauração, e sim lembrete de que as alterações posteriores ao backup (RPO) não estão na cópia. Em produção, rode o teste em outra máquina e agende o backup no cron, enviando a cópia para fora do servidor e cifrada.',
            '# backup + teste (saída real, diretórios temporários)\n./backup.sh dados bk\n# ok: bk/backup-20261102-103701.tar.gz\n./testa-restauracao.sh bk dados\n# backup-20261102-103701.tar.gz: OK\n# restauracao OK: conteudo identico\n# depois de criar dados/3:\n# Only in dados: 3     (código de saída 1)\n# agenda (cron do root):\n30 2 * * * /usr/local/bin/backup.sh /srv/meuapp /srv/backup >> /var/log/backup.log 2>&1'
          ),
          sl(
            'Logs, monitoramento e checklists',
            'Logs: logrotate para os da aplicação e do backup (daily, rotate 14, compress, 0640), journal com limite e acesso restrito; retenção é decisão de LGPD, não só de espaço. Monitoramento básico: df -h, free -h, uptime, systemctl --failed e um health check periódico; alertas de disco e serviço. Checklist de segurança: superfície mínima (ss -tulpn), updates automáticos, SSH só chaves, firewall deny-by-default, fail2ban, sudo mínimo, segredos em 600 fora do Git, backups testados. Checklist de LGPD: inventário de dados, finalidade e minimização nos logs, retenção com prazo, acesso restrito, TLS e disco/backups cifrados, procedimento de incidente.',
            '/var/log/meuapp/*.log /var/log/backup.log {\n    daily\n    rotate 14\n    compress\n    missingok\n    notifempty\n    create 0640 meuapp adm\n}\nsystemctl --failed\ndf -h /srv'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual a ordem segura para endurecer o SSH em um servidor remoto?', 'c', [
          'Desativar PasswordAuthentication primeiro e criar as chaves depois, se o login por senha falhar',
          'Fechar todas as sessões, editar o sshd_config e reiniciar o servidor inteiro de uma vez',
          'Criar usuário com sudo, testar a chave em outra sessão e só então desativar senha e root, nunca antes',
          'Apagar o sshd_config e deixar o serviço usar o padrão, que já é considerado o mais seguro'
        ], 'O risco é se trancar fora. Provar que a chave funciona em uma segunda sessão, validar a sintaxe e manter a sessão aberta evitam isso.'),
        mcq('q2', 'No backup.sh, o que fazem set -euo pipefail e ${1:?uso: ...}?', 'b', [
          'Executam o script em modo silencioso e ignoram erros causados por argumentos ausentes ou nulos',
          'Param no primeiro erro ou variável indefinida; ${1:?...} aborta se faltar o argumento',
          'Cifram o backup e exigem uma senha como primeiro argumento do script na execução',
          'Agendam o script no cron e verificam se o primeiro argumento existe no disco do sistema'
        ], 'set -e para em erros, -u trata variável indefinida como erro e pipefail considera falhas dentro de pipes. ${1:?msg} aborta se $1 estiver vazio/ausente.'),
        mcq('q3', 'O testa-restauracao.sh imprime "OK" no hash, mas depois "Only in dados: 3" e sai com código 1. Qual a leitura correta?', 'd', [
          'O backup está corrompido e deve ser descartado para evitar restaurações incorretas depois',
          'A restauração falhou porque o tar não extraiu o arquivo 3 da cópia do backup',
          'O hash está errado, pois o sha256sum não detecta arquivos novos na origem',
          'O arquivo 3 foi criado após o backup: a cópia está íntegra, só não tem mudanças posteriores'
        ], 'O hash OK prova a integridade do arquivo; o diff mostra a diferença entre a origem atual e o backup, resultado de alterações posteriores. É o RPO em ação.'),
        fill('q4', 'Complete para liberar a porta HTTPS no ufw:', 'sudo ufw ___ 443/tcp', ['allow'], 'ufw allow 443/tcp abre a porta. Com política default deny incoming, só o que for permitido entra. Libere a 22 antes de ativar o ufw.'),
        mcq('q5', 'Por que o backup.sh usa ( cd "$DESTINO" && sha256sum "$ARQ" > "$ARQ.sha256" )?', 'a', [
          'Para o .sha256 guardar só o nome, e a conferência funcionar de dentro da pasta',
          'Para o sha256sum cifrar o arquivo enquanto calcula o hash do conteúdo inteiro',
          'Para o cron conseguir ler a variável $ARQ em outro processo do sistema operacional',
          'Para impedir que o find apague o arquivo .sha256 por engano durante a limpeza'
        ], 'sha256sum grava o caminho como foi passado; sem o cd, o .sha256 teria bk/..., e sha256sum -c falharia de dentro da pasta. O hash não cifra nada.'),
        mcq('q6', 'Qual conjunto de portas deve aparecer escutando para fora (0.0.0.0) no servidor final deste projeto?', 'b', [
          '22, 80, 443 e 8000, para depurar a aplicação',
          '22, 80 e 443; a aplicação (8000) e o banco ficam em 127.0.0.1',
          'Só 5432 e 8000, pois o nginx dispensa portas públicas',
          'Todas as portas altas, para facilitar o acesso do monitoramento'
        ], 'Só SSH, HTTP (redireciona e valida o certificado) e HTTPS. A aplicação e o banco escutam só em 127.0.0.1 e não são abertos no firewall.'),
        mcq('q7', 'Qual medida do projeto atende melhor ao princípio de retenção limitada da LGPD?', 'a', [
          'logrotate com rotate e prazo definido, e backups antigos apagados automaticamente',
          'Guardar logs e backups sem nenhum limite de tempo, pois o disco é barato hoje em dia',
          'Mover os logs para o diretório de um usuário comum, que não passa pelo logrotate',
          'Deixar os logs legíveis a todos para facilitar a auditoria'
        ], 'Retenção com prazo, aplicada automaticamente, evita acumular dados pessoais sem finalidade. Acesso amplo e guarda indefinida vão contra os princípios de necessidade e segurança.'),
        fill('q8', 'Complete para validar a sintaxe do sshd_config antes de recarregar o serviço:', 'sudo ___ -t', ['sshd'], 'sshd -t testa a configuração e informa erros sem aplicar nada. Só recarregue depois de passar, mantendo uma sessão aberta.')
      ]
    },
  ]
};
