// Módulo "Avançado" do curso de Linux — lições de 8 questões cada (3 múltipla escolha + 1 lacuna,
// duas vezes por lição). Ver ../../index.js para o formato e a validação de boot. Assume os níveis
// iniciante e intermediário e aprofunda nos internals do kernel (arquitetura, syscalls, memória,
// escalonador, sistemas de arquivos, E/S, rede, namespaces/cgroups), segurança, eBPF, profiling,
// depuração, compilação do kernel, boot/firmware, systemd avançado, segurança de servidores e
// automação em escala. Saídas mostradas são EXEMPLOS didáticos (variam por kernel/distribuição);
// números são fictícios e coerentes. Segurança e privacidade (LGPD): nenhum dado pessoal real,
// segredos sempre como <placeholder>, só conceitos defensivos e comandos destrutivos com aviso e
// em ambiente de teste. Helpers locais: mcq(id, prompt, letraCorreta, [4 textos], explicação),
// fill(id, prompt, código com ___, aceitas, explicação) e sl(título, corpo, código?).
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
  id: 'avancado-linux',
  levelKey: 'advanced',
  order: 3,
  title: 'Avançado',
  subtitle: 'Internals do kernel, memória, escalonador, E/S, rede, namespaces/cgroups, eBPF, profiling, segurança e automação em escala',
  accent: '#eab308',
  lessons: [
    {
      id: 'lna-01-arquitetura-kernel',
      title: 'Arquitetura do kernel',
      goal: 'Entender como o kernel Linux se organiza (monolítico modular, modos de privilégio, subsistemas, VFS) e acompanhar o caminho de uma chamada read() pelas camadas.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Monolítico, porém modular',
            'O Linux é um kernel MONOLÍTICO: escalonador, memória, sistemas de arquivos, pilha de rede e drivers rodam todos no mesmo espaço de endereçamento privilegiado, chamando uns aos outros por simples chamadas de função. Isso é rápido, mas um bug em qualquer parte pode derrubar tudo. Em um microkernel, quase tudo (drivers, sistemas de arquivos) rodaria como processos comuns e se comunicaria por mensagens. O Linux ganha flexibilidade com MÓDULOS: código (arquivos .ko) que pode ser carregado e descarregado em tempo de execução sem reiniciar, mas que, uma vez carregado, passa a ser parte do kernel com os mesmos privilégios.',
            'lsmod | head -3\n# Module                  Size  Used by          <- exemplo (varia)\n# ext4                  900000  2\n# e1000e                300000  0\nmodinfo ext4 | head -2\n# filename:  /lib/modules/<versão>/kernel/fs/ext4/ext4.ko'
          ),
          sl(
            'Espaço de usuário e espaço de kernel',
            'A CPU oferece modos de privilégio. No x86 há anéis de 0 (mais privilegiado) a 3; o Linux usa na prática dois: o modo kernel (anel 0), que executa instruções privilegiadas e acessa todo o hardware e toda a memória, e o modo usuário (anel 3), onde rodam seus programas, sem acesso direto a dispositivos nem à memória do kernel ou de outros processos. Um programa comum só obtém serviços do kernel (abrir arquivo, criar processo, enviar pacote) por uma CHAMADA DE SISTEMA (syscall): uma instrução especial que troca o modo da CPU para kernel, executa o código do kernel em nome do processo e volta ao modo usuário. A syscall é a fronteira, a "API" do kernel.',
            'programa  --(syscall)-->  KERNEL (modo 0)  --> hardware\n modo usuário (3)       ^ troca de modo da CPU\n  sem acesso direto a disco, NIC, memória alheia'
          ),
          sl(
            'Interrupções e exceções',
            'O kernel também entra em ação sem que o programa peça. Uma INTERRUPÇÃO é um sinal ASSÍNCRONO de hardware: a placa de rede avisa que chegou um pacote, o disco avisa que terminou uma leitura, o temporizador dispara (base do escalonamento por tempo). A CPU para o que fazia, executa o tratador da interrupção e retoma. Uma EXCEÇÃO é SÍNCRONA: gerada pela própria instrução em execução, como divisão por zero, instrução inválida ou falta de página (page fault, que pode ser perfeitamente normal: o kernel carrega a página e continua). Se a exceção é um erro real (acesso a endereço inválido), o kernel envia um sinal ao processo, por exemplo SIGSEGV.',
            'cat /proc/interrupts | head -3\n#            CPU0       CPU1          <- exemplo (varia)\n#   0:         12          0   IO-APIC   timer'
          ),
          sl(
            'Subsistemas e a árvore do código',
            'O kernel se divide em subsistemas que o código-fonte reflete em diretórios: kernel/ (escalonador e núcleo), mm/ (memória virtual), fs/ (VFS e sistemas de arquivos), net/ (pilha de rede), drivers/ (a maior parte do código: dispositivos), ipc/ (comunicação entre processos: filas de mensagens, semáforos, memória compartilhada System V), arch/ (código específico de cada arquitetura: x86, arm64...), security/ (LSMs como SELinux e AppArmor), block/ (camada de blocos) e include/ (cabeçalhos). Cada subsistema cuida de uma responsabilidade: o escalonador decide quem usa a CPU; a memória virtual dá a cada processo seu espaço de endereços; o VFS unifica arquivos; a rede implementa os protocolos; os drivers falam com o hardware.',
            'linux/\n├── arch/    <- x86, arm64, ...\n├── kernel/  <- escalonador, sinais, tempo\n├── mm/      <- memória virtual\n├── fs/      <- VFS, ext4, xfs, ...\n├── net/     <- TCP/IP, netfilter\n├── drivers/ <- hardware (maior parte)\n├── ipc/  security/  block/  include/'
          ),
          sl(
            '/proc e /sys: janelas para o kernel',
            'O kernel expõe seu estado como sistemas de arquivos VIRTUAIS (não ocupam disco; o conteúdo é gerado na hora quando você lê). O /proc (procfs) mostra processos (/proc/<pid>/...) e informações globais como /proc/meminfo, /proc/cpuinfo, /proc/interrupts; o subdiretório /proc/sys contém parâmetros ajustáveis, a mesma coisa que o comando sysctl lê e escreve. O /sys (sysfs) mostra o modelo de dispositivos e drivers do kernel de forma estruturada (/sys/class, /sys/block, /sys/devices) e, nos sistemas com cgroups v2, a hierarquia de cgroups costuma estar montada em /sys/fs/cgroup. Ler é observar; escrever em certos arquivos é CONFIGURAR o kernel em tempo real, por isso exige root.',
            'cat /proc/sys/kernel/hostname      # mesmo que: sysctl kernel.hostname\nls /sys/class/net                   # interfaces de rede (ex.: lo eth0)\nls /proc/self/                      # o processo que executa o ls'
          ),
          sl(
            'Tudo é arquivo: o VFS e o caminho de um read()',
            'A abstração "tudo é arquivo" funciona porque o kernel tem o VFS (Virtual File System): uma camada comum que define as operações (open, read, write...) e delega ao sistema de arquivos concreto (ext4, XFS, procfs, pipe, socket). Por isso o mesmo read() lê um arquivo ext4, um arquivo de /proc ou um pipe. Quando um programa chama read(), a libc executa a syscall; o kernel acha o descritor, o VFS chama a implementação do sistema de arquivos; se os dados estão no page cache (memória), retorna direto; se não, a camada de blocos e o driver buscam no dispositivo, e a interrupção de fim de E/S acorda o processo, que estava bloqueado.',
            'read(fd, buf, n)         [modo usuário]\n   │ syscall\n   ▼\nVFS ─▶ sistema de arquivos (ext4, xfs, procfs...)\n   │            │\n   │       page cache ──hit──▶ copia p/ buf e retorna\n   │            │ miss\n   │            ▼\n   │      camada de blocos ─▶ driver ─▶ disco\n   └◀── interrupção de fim de E/S acorda o processo'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que significa dizer que o kernel Linux é "monolítico modular"?', 'c', [
          'Cada subsistema roda como processo isolado em modo usuário e se comunica por mensagens, e os módulos são serviços reiniciáveis',
          'O kernel é compilado como um único arquivo fixo, e para trocar um driver é necessário recompilar e reiniciar o sistema',
          'Os subsistemas compartilham o mesmo espaço privilegiado e partes (como drivers) podem ser carregadas como módulos .ko',
          'O kernel é dividido em um núcleo mínimo privilegiado e drivers que rodam sempre em modo usuário, comunicando-se por syscalls'
        ], 'Monolítico: tudo no mesmo espaço privilegiado, com chamadas diretas. Modular: partes carregáveis em tempo de execução. A descrição de processos trocando mensagens é a de um microkernel.'),
        mcq('q2', 'Um programa em modo usuário quer enviar bytes por um socket. Qual é o mecanismo regular para pedir isso ao kernel?', 'b', [
          'Escrever diretamente nos registradores da placa de rede, já que o hardware é mapeado para todos os processos',
          'Executar uma chamada de sistema, que troca a CPU para o modo kernel durante o serviço',
          'Ler e escrever em /proc/net, que aceita pacotes brutos vindos de qualquer processo, sem checar permissões',
          'Gerar uma interrupção de hardware pelo programa para chamar o tratador da placa'
        ], 'A fronteira usuário/kernel é a syscall. Acesso direto ao hardware é bloqueado pelo modo de privilégio, e interrupções são geradas pelo hardware, não pelo programa.'),
        mcq('q3', 'Qual evento é uma EXCEÇÃO (síncrona), e não uma interrupção (assíncrona)?', 'd', [
          'A placa de rede sinalizando a chegada de um pacote',
          'O disco avisando que terminou uma leitura pedida antes e acordando o processo que esperava',
          'O temporizador do sistema disparando a cada tique',
          'Uma falta de página (page fault) em endereço ainda não mapeado'
        ], 'Exceções nascem da própria instrução em execução (page fault, divisão por zero). As demais opções são sinais externos de hardware, assíncronos. Page fault pode ser normal: o kernel mapeia a página e retoma.'),
        fill('q4', 'Complete com o nome do diretório do sysfs, que lista as interfaces de rede em /___/class/net.', 'ls /___/class/net', ['sys', '/sys'], 'O sysfs é montado em /sys e organiza dispositivos e drivers; /sys/class/net lista as interfaces.'),
        mcq('q5', 'No caminho de um read() em um arquivo cujos dados NÃO estão em memória, qual é a ordem correta?', 'a', [
          'syscall, VFS, sistema de arquivos, page cache (miss), camada de blocos, driver, disco, interrupção acorda o processo',
          'syscall, driver, disco, VFS, page cache, sistema de arquivos e retorno direto ao programa',
          'libc, disco, camada de blocos, VFS, syscall e interrupção de retorno ao modo usuário',
          'VFS, syscall, page cache, driver e depois o sistema de arquivos grava o resultado no buffer, antes de acordar o processo bloqueado'
        ], 'A syscall entra no kernel, o VFS delega ao sistema de arquivos, que consulta o page cache; no miss desce para blocos e driver, e a interrupção de fim de E/S acorda o processo.'),
        mcq('q6', 'Em que diretório da árvore do código-fonte do kernel está, em essência, a memória virtual?', 'c', [
          'kernel/, que contém a gerência de páginas e de swap além do escalonador',
          'arch/, onde fica a lógica de alocação comum a todas as arquiteturas',
          'mm/, dedicado à gerência de memória',
          'fs/, que abriga o gerenciador de páginas junto com o VFS'
        ], 'mm/ é o subsistema de memória. kernel/ tem escalonador e núcleo, arch/ tem código específico de arquitetura e fs/ tem VFS e sistemas de arquivos.'),
        mcq('q7', 'Você roda "cat /proc/sys/kernel/hostname". O que é esse arquivo?', 'b', [
          'Um arquivo comum em disco, gravado na instalação e lido do volume raiz',
          'Uma entrada virtual do kernel (parâmetro ajustável), gerada na leitura e equivalente a sysctl kernel.hostname',
          'Um cache de nomes mantido pelo serviço de DNS local, atualizado por resolvedores, consultado pelo resolvedor a cada pedido',
          'Um link simbólico para /etc/hostname criado pelo systemd no boot'
        ], '/proc/sys expõe parâmetros do kernel como arquivos virtuais; ler e escrever neles equivale ao sysctl. Não ocupam disco.'),
        fill('q8', 'Complete com a sigla da camada que permite o mesmo read() funcionar em ext4, pipes e /proc.', 'Camada comum de arquivos do kernel: ___ (Virtual File System)', ['VFS', 'vfs'], 'O VFS define as operações genéricas e delega ao sistema de arquivos concreto.')
      ]
    },
    {
      id: 'lna-02-syscalls-abi',
      title: 'Chamadas de sistema e ABI',
      goal: 'Entender o que é uma syscall, ler a saída do strace, interpretar erros (errno) e conhecer vDSO, ptrace, seccomp e a estabilidade da ABI.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'O que é uma syscall e o papel da libc',
            'Uma syscall é uma função do kernel identificada por um NÚMERO. Na arquitetura x86-64, por convenção, o número vai no registrador rax, os argumentos em rdi, rsi, rdx, r10, r8 e r9, a instrução "syscall" troca para o modo kernel e o resultado volta em rax (um valor negativo pequeno significa erro, o negativo do código errno). Os números e registradores variam por arquitetura. Você raramente faz isso à mão: a libc (glibc, musl) oferece funções-invólucro (wrappers) como open(), read() e write(), que arrumam os registradores, executam a instrução e, se houve erro, devolvem -1 e gravam o código na variável errno. printf() é ainda uma camada acima: formata em um buffer em espaço de usuário e só chama write() quando esvazia o buffer.',
            'printf("oi\\n")   ->  libc (buffer)  ->  write(1, "oi\\n", 3)  ->  kernel\n# x86-64 (exemplo): rax=1 (write), rdi=1, rsi=ptr, rdx=3, instrução syscall'
          ),
          sl(
            'strace: ver as syscalls de um programa',
            'O strace executa um programa (ou se anexa a um processo com -p) e imprime cada syscall com argumentos e retorno. Formato: nome(argumentos) = retorno. Um retorno -1 vem seguido do nome do errno e do texto. Opções úteis: -f segue processos e threads filhos, -e trace=openat filtra por syscall, -o arquivo grava em arquivo, -c mostra apenas um resumo com contagem e tempo por syscall, -p PID anexa a um processo em execução. Lembre que o strace desacelera bastante o alvo e pode capturar dados sensíveis (argumentos de read/write incluem o conteúdo de arquivos e sockets): use com cuidado em produção.',
            'strace -f -o /tmp/t.txt cat /etc/hostname      # exemplo (varia)\n# execve("/usr/bin/cat", ["cat", "/etc/hostname"], ...) = 0\n# openat(AT_FDCWD, "/etc/hostname", O_RDONLY) = 3\n# read(3, "srv01\\n", 131072) = 6\n# write(1, "srv01\\n", 6) = 6\n# close(3) = 0\n# openat(AT_FDCWD, "/nao/existe", O_RDONLY) = -1 ENOENT (No such file or directory)'
          ),
          sl(
            'Syscalls que você verá o tempo todo',
            'execve(programa, argv, env) substitui a imagem do processo atual por outro programa (é como o shell inicia comandos, depois de criar o filho). openat abre arquivo e devolve um descritor (3, 4...; 0, 1 e 2 são stdin, stdout e stderr); read e write movem bytes por um descritor e retornam quantos bytes foram transferidos. mmap mapeia memória: anônima (malloc grande, pilhas de threads) ou um arquivo (carregamento de bibliotecas dinâmicas). futex é a base de mutexes e variáveis de condição em espaço de usuário: o processo só entra no kernel para DORMIR esperando uma trava; muitos futex WAIT em um programa multithread indicam contenção ou espera por evento. clone cria um novo fluxo de execução; com flags diferentes cria uma thread (compartilha memória) ou um processo (fork é implementado com ele).',
            '# exemplos de linhas (varia)\nmmap(NULL, 8192, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f0000100000\nfutex(0x55d000001000, FUTEX_WAIT_PRIVATE, 2, NULL) = 0\nclone(child_stack=0x7f00001ff000, flags=CLONE_VM|CLONE_FS|CLONE_FILES|CLONE_THREAD...) = 4321'
          ),
          sl(
            'Custo de uma syscall e o vDSO',
            'Uma syscall custa mais que uma chamada de função: há troca de modo da CPU, salvamento de registradores, verificações e, dependendo das mitigações de segurança do processador, efeitos em caches e no TLB. Por isso programas eficientes agrupam trabalho: usar buffers (escrever 64 KiB de uma vez em vez de 1 byte por vez), readv/writev, e evitar syscalls em laços quentes. Algumas leituras são tão frequentes que o kernel as evita: o vDSO (virtual dynamic shared object) é uma pequena biblioteca que o kernel mapeia em todo processo, contendo funções como clock_gettime e gettimeofday que LEEM dados de tempo mantidos pelo kernel em uma página compartilhada, sem trocar de modo. Por isso essas chamadas aparecem pouco ou nada no strace. Você vê o vDSO em ldd como linux-vdso.so.1.',
            'ldd /bin/true | head -1\n# linux-vdso.so.1 (0x00007ffc...)   <- não é um arquivo em disco'
          ),
          sl(
            'Erros: errno',
            'Quando uma syscall falha, o código errno diz o motivo. Os mais comuns: ENOENT (arquivo ou diretório não existe: caminho errado, ou componente do caminho ausente), EACCES (permissão negada pelas permissões de arquivo/ACL/LSM: o arquivo existe, mas o usuário não tem o acesso pedido), EPERM (operação não permitida: o tipo de operação exige privilégio ou capability que o processo não tem, como chown por um usuário comum ou montar um sistema de arquivos), EAGAIN (tente de novo: recurso temporariamente indisponível, comum em E/S não bloqueante) e EINTR (a syscall foi interrompida por um sinal). Distinguir EACCES de EPERM e de ENOENT no strace costuma resolver "não funciona" em minutos: o primeiro pede ajustar permissões, o segundo privilégio, o terceiro o caminho.',
            '# exemplos (varia)\nopenat(AT_FDCWD, "/etc/app.conf", O_RDONLY) = -1 EACCES (Permission denied)\nchown("/etc/app.conf", 0, 0) = -1 EPERM (Operation not permitted)'
          ),
          sl(
            'ptrace, seccomp e a ABI estável',
            'ptrace é a syscall que permite a um processo observar e controlar outro (ler memória e registradores, parar nas syscalls): é a base de strace e gdb. Por ser poderosa, é restrita: o parâmetro kernel.yama.ptrace_scope (em /proc/sys/kernel/yama/ptrace_scope), quando o módulo Yama está ativo, limita quem pode se anexar a quais processos. seccomp é o filtro de syscalls: um processo instala um programa (seccomp-bpf) que, para cada syscall, decide permitir, devolver um errno, matar o processo ou notificar; é usado por Docker, navegadores e pelo systemd (SystemCallFilter=) para reduzir a superfície de ataque. Por fim, o kernel Linux mantém estável a interface para o espaço de usuário (números de syscall, estruturas, /proc e /sys documentados): "não quebre o espaço de usuário". Já as APIs INTERNAS do kernel mudam livremente, por isso módulos externos precisam ser recompilados.',
            '# seccomp em um serviço systemd (conceito)\nSystemCallFilter=@system-service\nSystemCallErrorNumber=EPERM'
          ),
          sl(
            'Exemplo mínimo em Python (descrição)',
            'Dá para ver a fronteira sem C. A função os.getpid() chama o wrapper getpid da libc. Com ctypes é possível chamar a libc e até a função syscall(), passando o número: em x86-64, 39 é getpid (em outras arquiteturas o número é outro, por isso na prática se usa o wrapper). Rodar o programa sob strace mostra a mesma syscall. Não é preciso executar agora: o objetivo é perceber que o Python, a libc e o kernel formam camadas, e que o strace mostra a camada inferior.',
            'import ctypes, os\nlibc = ctypes.CDLL(None)\nprint(os.getpid(), libc.syscall(39))   # x86-64: iguais\n# strace -e trace=getpid python3 prog.py\n# getpid() = 4242      <- exemplo'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a relação entre a libc, as syscalls e a ABI do kernel?', 'd', [
          'A libc contém o código real de abrir e ler arquivos, e o kernel só fornece o hardware, então trocar a libc muda o comportamento do disco',
          'As syscalls são funções internas do kernel com assinatura estável, e os módulos externos as chamam diretamente sem precisar de recompilação',
          'A libc executa tudo em modo usuário e só pede ao kernel a instalação de módulos, enquanto read e write são emulados, o que explica o custo extra de cada chamada de biblioteca',
          'A libc oferece invólucros sobre a interface de syscalls, que o kernel mantém estável para o espaço de usuário, enquanto suas APIs internas mudam'
        ], 'Os wrappers da libc convertem chamadas em syscalls (devolvendo -1 e errno em erro). A interface para o espaço de usuário é estável (binários antigos seguem rodando), mas as APIs internas do kernel não são, por isso módulos externos exigem recompilação.'),
        mcq('q2', 'No strace aparece: openat(AT_FDCWD, "/etc/app.conf", O_RDONLY) = -1 EACCES (Permission denied). O que isso indica?', 'a', [
          'O caminho foi resolvido e o arquivo existe, mas o processo não tem permissão de leitura sobre ele',
          'O arquivo não existe, e o programa precisa criá-lo antes de abrir',
          'O processo não tem a capability necessária para a operação, independentemente das permissões do arquivo',
          'A syscall foi interrompida por um sinal e deve ser repetida pelo programa, o que costuma ocorrer em E/S não bloqueante'
        ], 'EACCES significa permissão negada em um caminho existente (permissões, ACL ou LSM). ENOENT seria arquivo ausente, EPERM falta de privilégio para a operação e EINTR interrupção por sinal.'),
        mcq('q3', 'Um serviço multithread mostra, no strace -f, milhares de linhas futex(..., FUTEX_WAIT_PRIVATE, ...) em várias threads. Qual é a leitura mais provável?', 'c', [
          'As threads estão lendo arquivos de configuração repetidamente via mmap',
          'O serviço está criando processos filhos em excesso por clone',
          'As threads estão dormindo esperando travas (mutex) ou eventos, o que sugere contenção ou espera por trabalho',
          'O kernel está recusando syscalls por filtro seccomp, e o programa tenta novamente, registrando cada tentativa no log de auditoria'
        ], 'futex é o mecanismo de espera de mutexes e variáveis de condição: o WAIT coloca a thread para dormir até outra acordá-la. Muitas esperas sugerem contenção ou ociosidade por falta de trabalho.'),
        fill('q4', 'Complete com a opção do strace que segue também os processos e threads filhos.', 'strace ___ -o saida.txt ./app', ['-f'], 'Sem -f, o strace só acompanha o processo inicial; -f segue filhos criados por fork/clone.'),
        mcq('q5', 'Por que clock_gettime costuma aparecer pouco ou nada no strace de um programa que consulta a hora o tempo todo?', 'b', [
          'O strace oculta syscalls de tempo por segurança, já que revelam o relógio do sistema',
          'O vDSO deixa a leitura acontecer em espaço de usuário, sem troca de modo, a partir de dados mantidos pelo kernel',
          'A hora é guardada em um registrador da CPU que o programa consulta sem ajuda do kernel',
          'A libc mantém um relógio próprio, sincronizado com o kernel só no início do programa, corrigindo a deriva por conta própria depois'
        ], 'O vDSO é mapeado em todo processo e expõe funções como clock_gettime que leem uma página de dados atualizada pelo kernel, evitando a troca de modo.'),
        mcq('q6', 'Um programa grava 1 milhão de linhas pequenas chamando write() uma vez por linha, e está lento. Qual ajuste ataca a causa?', 'd', [
          'Trocar write por read, que é mais barata por não alterar dados e não exigir troca de modo',
          'Aumentar o número de threads para que cada uma execute mais syscalls',
          'Usar ptrace para acelerar a entrada no kernel',
          'Usar um buffer em espaço de usuário e gravar em blocos maiores'
        ], 'Cada syscall tem custo de troca de modo. Agrupar trabalho (buffering, writev) reduz a quantidade de syscalls. Mais threads não eliminam o custo por chamada.'),
        mcq('q7', 'Qual afirmação sobre ptrace e seccomp está correta?', 'c', [
          'seccomp permite a um processo ler a memória de outro, e ptrace filtra syscalls por programa BPF',
          'ptrace é usado só pelo kernel internamente, e seccomp é o mecanismo do gdb para parar em syscalls',
          'ptrace permite observar e controlar outro processo (base de strace e gdb) e seccomp-bpf filtra as syscalls que um processo pode fazer',
          'seccomp e ptrace são equivalentes e ambos exigem recompilar o kernel para serem ativados'
        ], 'ptrace é a interface de depuração/observação; seccomp-bpf reduz a superfície de ataque restringindo syscalls. O acesso a ptrace pode ser limitado por Yama (ptrace_scope).'),
        fill('q8', 'Complete com o nome do errno para "arquivo ou diretório inexistente".', 'openat(AT_FDCWD, "/nao/existe", O_RDONLY) = -1 ___ (No such file or directory)', ['ENOENT', 'enoent'], 'ENOENT: o caminho ou um de seus componentes não existe.')
      ]
    },
    {
      id: 'lna-03-memoria',
      title: 'Gerenciamento de memória',
      goal: 'Entender memória virtual, paginação, page cache, swap, overcommit, OOM killer e interpretar free, /proc/meminfo e smaps (RSS, PSS, VSZ).',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Memória virtual e paginação',
            'Cada processo enxerga um espaço de endereços VIRTUAL só seu; a MMU (hardware) traduz endereços virtuais em físicos usando tabelas de páginas mantidas pelo kernel, uma por processo. A memória é dividida em PÁGINAS, de 4 KiB (4096 bytes) no tamanho padrão. Em x86-64 a tabela tem 4 níveis: cada tabela ocupa uma página (4 KiB) e tem 512 entradas de 8 bytes; 9 bits de índice por nível x 4 níveis + 12 bits de deslocamento dentro da página = 48 bits de endereço virtual. Como percorrer 4 níveis a cada acesso seria caro, a CPU guarda traduções recentes no TLB (Translation Lookaside Buffer); acerto no TLB evita a caminhada pelas tabelas. Continhas: 1 GiB / 4 KiB = 262144 páginas; com 8 bytes por entrada final, mapear 1 GiB gasta 262144 x 8 = 2 MiB de tabelas.',
            'endereço virtual (48 bits)\n[ 9 | 9 | 9 | 9 | 12 ]\n  │   │   │   │    └─ deslocamento na página (4096 B)\n  └───┴───┴───┴─ índices nos 4 níveis (512 entradas de 8 B cada)\nTLB: cache de traduções página virtual -> quadro físico'
          ),
          sl(
            'O espaço de endereçamento de um processo',
            'Um processo tem regiões: texto (o código executável, somente leitura), dados (variáveis globais inicializadas e a área .bss das não inicializadas), heap (memória dinâmica de malloc, cresce por brk ou por mmap), a área de mapeamentos mmap (bibliotecas compartilhadas, arquivos mapeados, alocações grandes) e a pilha (variáveis locais e chamadas, cresce para baixo). /proc/<pid>/maps lista cada região com permissões (r, w, x, p/s). Um ponto central: reservar endereços não consome RAM. A memória física só é alocada na primeira vez que a página é tocada, por meio de uma falta de página (page fault) que o kernel resolve entregando uma página zerada. Por isso um malloc de 1 GiB pode ser instantâneo e o processo só ocupa RAM para o que realmente escrever.',
            'cat /proc/self/maps | head -4        # exemplo (varia)\n# 55d0...-55d0... r--p ... /usr/bin/cat       (texto/rodata)\n# 55d0...-55d0... r-xp ... /usr/bin/cat       (código)\n# 7f00...-7f00... rw-p ... [heap]\n# 7ffc...-7ffc... rw-p ... [stack]'
          ),
          sl(
            'mmap, page cache e memória anônima vs de arquivo',
            'mmap mapeia no espaço do processo um arquivo (acessar a memória equivale a acessar o arquivo) ou memória anônima (sem arquivo por trás). Essa distinção é fundamental: memória de ARQUIVO (código de programas, bibliotecas, dados de arquivos lidos) está no page cache; se estiver limpa, o kernel pode descartá-la a qualquer momento e relê-la do disco depois, e se estiver suja é gravada antes. Memória ANÔNIMA (heap, pilha) não tem cópia em disco: para liberar RAM o kernel só pode movê-la para o swap. O page cache usa a RAM ociosa para acelerar leituras e escritas e encolhe quando os processos precisam de memória, por isso o "free" mostra a coluna buff/cache e uma coluna available (estimativa do que se pode usar sem recorrer ao swap).',
            'free -h                                   # exemplo didático (varia)\n#         total   used   free  shared  buff/cache  available\n# Mem:     8.0Gi  1.5Gi  0.5Gi   0.1Gi      6.0Gi       6.2Gi\n# Swap:    2.0Gi    0B   2.0Gi\n# Pouca "free" e muita "buff/cache" é NORMAL: o cache é reaproveitável.'
          ),
          sl(
            'Swap, overcommit e OOM killer',
            'Swap é espaço em disco (partição ou arquivo) para onde páginas anônimas pouco usadas são movidas. O parâmetro vm.swappiness ajusta a tendência de usar swap em vez de descartar cache de arquivo. Overcommit: o kernel pode prometer mais memória virtual do que a RAM+swap disponíveis, apostando que os processos não vão tocar tudo. vm.overcommit_memory = 0 usa uma heurística (padrão: recusa pedidos obviamente absurdos), 1 aceita tudo e 2 aplica um limite estrito (vm.overcommit_ratio). Se a aposta falha e a memória acaba sem como recuperar, o OOM killer escolhe um processo para matar, pontuando-os em /proc/<pid>/oom_score; você influencia com /proc/<pid>/oom_score_adj (de -1000, que protege o processo da escolha, a +1000, que o torna candidato preferido). A ocorrência fica no log do kernel.',
            'cat /proc/sys/vm/overcommit_memory          # 0 = heurística (exemplo)\necho -500 | sudo tee /proc/1234/oom_score_adj   # menos provável de ser morto\ndmesg | grep -i "out of memory"\n# Out of memory: Killed process 1234 (app) ...   <- exemplo'
          ),
          sl(
            'Hugepages, NUMA e slab',
            'Hugepages são páginas maiores (2 MiB em x86-64, equivalentes a 512 páginas de 4 KiB): menos entradas de tabela e menos pressão no TLB, o que ajuda cargas com muita memória, como bancos de dados e máquinas virtuais. Existem as reservadas explicitamente (HugeTLB, vm.nr_hugepages) e as transparentes (THP, configuradas em /sys/kernel/mm/transparent_hugepage/enabled), que o kernel monta sozinho e que podem trazer latência imprevisível em algumas cargas: ajuste só com medição. NUMA (Non-Uniform Memory Access): em servidores com vários soquetes, cada CPU acessa mais rápido a memória do seu próprio nó que a dos outros; numactl e numastat mostram e controlam a política. O slab é o alocador do kernel para objetos pequenos e frequentes (inodes, dentries, estruturas de rede): /proc/slabinfo e o comando slabtop mostram quanto há em cada cache de objetos.',
            'grep -i huge /proc/meminfo           # HugePages_Total, Hugepagesize: 2048 kB (exemplo)\nnumactl --hardware                   # nós NUMA e memória por nó\nsudo slabtop -o | head -5            # maiores caches do slab'
          ),
          sl(
            'Medindo: /proc/meminfo, VSZ, RSS e PSS',
            '/proc/meminfo traz os totais do sistema: MemTotal, MemFree, MemAvailable, Buffers e Cached (cache), AnonPages (memória anônima), Dirty (páginas sujas aguardando gravação), SwapTotal/SwapFree, Slab. Por processo há três medidas distintas. VSZ é o tamanho virtual total mapeado, inclusive o que nunca foi tocado: engana para quem quer saber uso real. RSS é a parte residente na RAM, mas conta páginas COMPARTILHADAS (bibliotecas) inteiras em cada processo, então somar RSS superestima. PSS divide cada página compartilhada entre os processos que a usam: uma biblioteca de 4 MiB residente em 4 processos custa 1 MiB de PSS a cada um, e a soma dos PSS é o total real. Os campos Rss e Pss estão em /proc/<pid>/smaps (e resumidos em smaps_rollup).',
            'grep -E "MemTotal|MemAvailable|Dirty" /proc/meminfo     # exemplo (varia)\n# MemTotal:        8000000 kB\n# MemAvailable:    6200000 kB\n# Dirty:               120 kB\ngrep -E "^(Rss|Pss)" /proc/1234/smaps_rollup\n# Rss:   40000 kB\n# Pss:   25000 kB'
          )
        ]
      },
      questions: [
        mcq('q1', 'Com páginas de 4 KiB e entradas de tabela de 8 bytes, quantas páginas tem 1 GiB e quanto de tabela (nível folha) é preciso para mapeá-lo?', 'b', [
          '131072 páginas e 1 MiB de tabela',
          '262144 páginas e 2 MiB de tabela',
          '262144 páginas e 8 MiB de tabela',
          '1048576 páginas e 8 MiB de tabela'
        ], '1 GiB / 4 KiB = 262144 páginas; 262144 x 8 bytes = 2 MiB de entradas. As outras opções erram a divisão ou o tamanho da entrada.'),
        mcq('q2', 'Qual memória só pode ser liberada da RAM, em caso de falta, movendo-a para o swap?', 'd', [
          'As páginas do código de um programa carregado do disco, porque estão em uso constante',
          'As páginas limpas do page cache de um arquivo lido há pouco tempo',
          'As páginas de uma biblioteca compartilhada mapeada por vários processos, mesmo quando ninguém as usa',
          'As páginas anônimas, como heap e pilha, que não possuem cópia em arquivo'
        ], 'Memória de arquivo limpa pode ser descartada e relida do disco. Memória anônima não tem arquivo de apoio, então só o swap permite liberá-la.'),
        mcq('q3', 'Em um servidor, free -h mostra pouca memória em "free", muita em "buff/cache" e "available" alto. Qual é a leitura correta?', 'a', [
          'Situação normal: o kernel usa RAM ociosa como cache, e ela é devolvida aos processos quando necessário',
          'Há vazamento de memória em algum processo, e o cache indica que o kernel está retendo páginas que deveriam ter sido liberadas',
          'O sistema está prestes a invocar o OOM killer, pois a memória livre é pequena',
          'O swap está sendo usado intensamente, e o cache é a prova disso'
        ], 'O page cache aproveita RAM ociosa e é reclamável. O que importa é "available". OOM e thrashing de swap teriam sinais próprios (available baixo, atividade de swap, dmesg).'),
        fill('q4', 'Complete com o arquivo de /proc/<pid> que ajusta a vulnerabilidade do processo ao OOM killer (de -1000 a 1000).', 'echo -500 | sudo tee /proc/1234/___', ['oom_score_adj'], 'oom_score_adj desloca a pontuação usada pelo OOM killer: -1000 protege o processo e valores altos o tornam candidato preferencial.'),
        mcq('q5', 'Quatro processos usam a mesma biblioteca de 8 MiB, toda residente. Para somar o consumo real de memória do grupo sem contar a biblioteca quatro vezes, qual métrica usar?', 'c', [
          'VSZ, pois mostra o tamanho total mapeado',
          'RSS, pois conta o que está residente na RAM, de forma exata para cada processo',
          'PSS, que divide cada página compartilhada entre os processos que a usam, de modo que a soma dos PSS nunca conta uma página duas vezes',
          'oom_score, pois pondera o uso de memória de cada processo'
        ], 'Somar RSS contaria a biblioteca 4 vezes (32 MiB); com PSS cada processo paga 2 MiB e a soma dos PSS reflete o total real. VSZ inclui até o que nunca foi tocado.'),
        mcq('q6', 'Um programa faz malloc de uma região maior que a RAM e o pedido é aceito com overcommit em modo heurístico. Mais tarde o processo é morto pelo kernel. O que aconteceu?', 'b', [
          'O malloc reservou RAM física de imediato, e o kernel a retomou por ser excessiva, pois o overcommit não existe em modo heurístico',
          'Só endereços foram prometidos; ao tocar as páginas faltou memória real, e o OOM killer escolheu uma vítima',
          'O swap preencheu o disco e o kernel encerrou o processo por política de quota, sem registrar nada no log do kernel',
          'O TLB estourou e a MMU encerrou o processo com SIGSEGV por falta de entradas'
        ], 'Overcommit promete endereços sem reservar RAM. Se muitos processos tocarem suas páginas e não houver como recuperar memória, o OOM killer mata alguém, pontuado por oom_score.'),
        mcq('q7', 'Por que hugepages de 2 MiB podem acelerar uma carga que usa dezenas de GiB de memória?', 'd', [
          'Elas dispensam a tabela de páginas, e o endereço virtual passa a ser igual ao físico',
          'Elas ficam sempre no swap, o que libera RAM para o page cache',
          'Elas eliminam o page fault, pois toda a memória é zerada na inicialização do processo, deixando de depender do kernel após isso',
          'Cada página cobre 512 páginas de 4 KiB, o que reduz entradas de tabela e a pressão sobre o TLB'
        ], '2 MiB = 512 páginas de 4 KiB. Menos entradas para traduzir significa mais acertos no TLB e tabelas menores. Elas continuam usando tabelas de páginas e podem causar latência (THP), então se mede antes.'),
        fill('q8', 'Complete com o arquivo de /proc/<pid> que lista as regiões do espaço de endereçamento (heap, pilha, bibliotecas) com permissões.', 'cat /proc/self/___', ['maps'], 'maps lista cada região virtual com permissões; smaps acrescenta detalhes por região, como Rss e Pss.')
      ]
    },
    {
      id: 'lna-04-escalonador',
      title: 'Escalonador de processos',
      goal: 'Entender tempo compartilhado, justiça (CFS/EEVDF), classes de escalonamento, afinidade, troca de contexto e load average, e simular um round-robin.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Tempo compartilhado, preempção e o dilema latência x vazão',
            'Há quase sempre mais tarefas prontas para rodar do que CPUs. O escalonador (scheduler, em kernel/sched/) reparte o tempo: cada tarefa roda uma fatia e outra assume. O kernel tem controle sobre isso porque é PREEMPTIVO: uma interrupção de temporizador (o tique) devolve o controle ao kernel, que pode tirar a tarefa da CPU mesmo sem ela concordar; uma tarefa mais urgente que acorda também pode preemptar a atual. Fatias curtas dão boa LATÊNCIA (tempo de resposta: quem acorda roda logo) mas geram mais trocas de contexto e menos trabalho útil por segundo; fatias longas melhoram a VAZÃO (trabalho total concluído) e pioram a resposta. Servidores de batch preferem vazão; desktops e serviços interativos, latência.',
            'tarefa A ██████ ▓ preemptada pelo tique\ntarefa B        ██████ ▓\ntarefa A               ██████\n          fatias mais curtas -> resposta melhor, mais trocas'
          ),
          sl(
            'Troca de contexto e threads vs processos',
            'Trocar a tarefa em execução exige salvar registradores e estado da atual, carregar os da próxima e, se for outro PROCESSO, trocar o espaço de endereços (tabelas de páginas), o que esfria TLB e caches da CPU. O custo direto é pequeno, o indireto (caches frios) pode ser relevante e cresce com trocas em excesso. No Linux, thread e processo são o mesmo tipo de entidade escalonável (uma "tarefa"), criada pela syscall clone: com flags que compartilham memória, arquivos abertos e sinais (CLONE_VM e outras) nasce uma thread; sem compartilhar, um processo (fork). Trocar entre threads do MESMO processo é mais barato porque o espaço de endereços não muda. Em /proc/<pid>/status, voluntary_ctxt_switches conta as vezes em que a tarefa cedeu a CPU (bloqueou em E/S ou lock) e nonvoluntary_ctxt_switches as vezes em que foi preemptada: muitas involuntárias indicam disputa por CPU.',
            'grep ctxt /proc/self/status               # exemplo (varia)\n# voluntary_ctxt_switches:        3\n# nonvoluntary_ctxt_switches:     0\npidstat -w -p 1234 1                      # cswch/s e nvcswch/s'
          ),
          sl(
            'Prioridade normal: nice e justiça (CFS/EEVDF)',
            'Tarefas comuns usam o escalonamento "normal" (SCHED_OTHER), em que a prioridade é o valor nice, de -20 (mais prioridade) a 19 (mais "gentil", menos CPU). Aumentar nice é livre; diminuir abaixo de 0 exige privilégio (CAP_SYS_NICE). Nice não é uma fila rígida: converte-se em PESO. A ideia do CFS (Completely Fair Scheduler) é a justiça por tempo virtual: cada tarefa acumula um vruntime, o tempo de CPU consumido ponderado pelo peso; o escalonador escolhe a tarefa com MENOR vruntime, ou seja, a que foi mais prejudicada. Tarefa com peso maior acumula vruntime mais devagar e por isso recebe mais CPU. Kernels recentes trocaram o CFS pelo EEVDF, que mantém a noção de justiça e acrescenta controle melhor de latência. Duas tarefas ligadas à CPU com nice diferentes continuam ambas rodando, só em proporção distinta.',
            'nice -n 10 ./compressao.sh          # inicia com nice 10\nrenice -n 5 -p 1234                  # muda uma tarefa em execução\nps -o pid,ni,cmd -p 1234             # coluna NI'
          ),
          sl(
            'Classes de escalonamento e chrt',
            'Além do normal, existem classes de TEMPO REAL, que sempre têm preferência sobre as normais. SCHED_FIFO (prioridades estáticas 1 a 99) roda até bloquear, terminar ou ceder: se ficar em laço infinito, nada de prioridade menor roda naquela CPU. SCHED_RR é igual, mas reveza em fatias as tarefas de mesma prioridade. SCHED_DEADLINE é declarativo: a tarefa informa quanto tempo de CPU precisa (runtime) dentro de um período e prazo, e o kernel garante ou recusa a admissão. Há também SCHED_BATCH e SCHED_IDLE, para trabalho em segundo plano. O comando chrt lê e muda a política. Tempo real mal usado pode travar a máquina: use só quando necessário, com testes, e o kernel ainda tem um limite de segurança para tempo real (sched_rt_runtime_us).',
            'chrt -p 1234                         # mostra a política e a prioridade\nsudo chrt -f -p 50 1234              # coloca em SCHED_FIFO prioridade 50\nchrt -m                              # faixas de prioridade por política'
          ),
          sl(
            'Afinidade de CPU, cpuset e ionice',
            'Afinidade fixa uma tarefa a certas CPUs: taskset -c 0,1 comando inicia restrito às CPUs 0 e 1; taskset -cp PID mostra ou muda a de um processo existente. Serve para isolar cargas, melhorar o uso de cache e respeitar a topologia NUMA, mas reduz a liberdade do escalonador de balancear a carga. O controlador cpuset dos cgroups faz o mesmo para grupos de processos (cpuset.cpus), e o parâmetro de boot isolcpus reserva CPUs fora do balanceamento comum. Para disco existe o ionice: classes 1 (tempo real), 2 (best-effort, com níveis 0 a 7) e 3 (idle, só usa o disco quando ninguém mais usa); o efeito depende do escalonador de E/S em uso. Backup em segundo plano costuma rodar com nice alto e ionice idle.',
            'taskset -c 0,1 ./app                 # só CPUs 0 e 1\ntaskset -cp 1234                     # afinidade atual (exemplo: 0-3)\nionice -c 3 nice -n 19 ./backup.sh   # baixa prioridade de CPU e disco'
          ),
          sl(
            'Load average, filas de execução e cgroups de CPU',
            'O load average (uptime, /proc/loadavg) mostra três médias (1, 5 e 15 minutos) do número de tarefas que estão rodando, prontas para rodar ou, no Linux, em espera ininterruptível de E/S (estado D). Comparar com o número de CPUs (nproc) é o que dá sentido: load 4 em 4 CPUs é uso cheio; load 8 indica em média o dobro de tarefas que CPUs, e pode ser falta de CPU OU disco lento (tarefas em D), então confirme com vmstat (coluna r, fila de execução), mpstat e iostat. No controlador de CPU dos cgroups v2, cpu.weight define a divisão proporcional entre grupos quando há disputa e cpu.max impõe um teto (quota por período), detalhado em outra lição.',
            'uptime                       # exemplo didático (varia)\n# 10:00:00 up 3 days, load average: 8.10, 6.40, 4.20\nnproc                        # 4  -> carga média ~2x as CPUs\nvmstat 1 3                   # coluna r = fila de execução'
          ),
          sl(
            'Simulação: round-robin com quantum 2',
            'Para fixar a ideia de tempo compartilhado, simulamos um round-robin: três tarefas precisam de 5, 3 e 8 unidades de CPU, cada uma recebe fatias (quantum) de 2 unidades em fila circular. Em FIFO puro (A, B, C em sequência) C só começaria a rodar em t=8; no round-robin, B e C começam logo (t=2 e t=4), o que melhora a resposta, ao custo de acrescentar trocas. Este programa foi executado e a saída abaixo é o resultado real dele.',
            'from collections import deque\nburst = {"A": 5, "B": 3, "C": 8}\nq, t = 2, 0\nfila, resta = deque(burst), dict(burst)\nwhile fila:\n    p = fila.popleft()\n    run = min(q, resta[p]); t += run; resta[p] -= run\n    print(p, "roda", run, "-> t =", t)\n    if resta[p]: fila.append(p)\n# A 2 (t=2) B 2 (4) C 2 (6) A 2 (8) B 1 (9)\n# C 2 (11) A 1 (12) C 2 (14) C 2 (16)\n# B termina em t=9, A em 12, C em 16'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um serviço interativo responde devagar porque tarefas pesadas ocupam a CPU por fatias longas. Qual trade-off descreve melhor o ajuste de fatias menores?', 'a', [
          'A latência de resposta melhora, mas há mais trocas de contexto e menos trabalho útil por segundo (vazão menor)',
          'A vazão total aumenta, porque trocar de tarefa com frequência é gratuito para a CPU, já que registradores e caches não precisam ser salvos',
          'Nada muda, pois a preempção só ocorre quando uma tarefa termina por conta própria',
          'A latência piora, porque fatias menores impedem que tarefas novas sejam escalonadas'
        ], 'Fatias curtas, sustentadas pela preempção por tique, dão resposta melhor e custam trocas de contexto (caches frios). Fatias longas favorecem a vazão. Preempção não depende da cooperação da tarefa.'),
        mcq('q2', 'Dois processos ligados à CPU competem em uma CPU: um com nice 0 e outro com nice 10. O que o escalonador de tempo virtual faz?', 'c', [
          'Executa o de nice 0 até terminar, só então iniciando o de nice 10',
          'Divide a CPU em partes exatamente iguais, pois o nice só vale para tempo real',
          'Dá peso maior ao de nice 0, cujo vruntime cresce mais devagar, e o de nice 10 ainda roda, em fatia menor',
          'Bloqueia o de nice 10 até que nenhum processo com nice menor exista no sistema, como acontece com tarefas em SCHED_IDLE'
        ], 'Nice vira peso: quem tem peso maior acumula vruntime mais devagar e recebe mais CPU. O de nice 10 não é inanimado, só recebe proporção menor.'),
        mcq('q3', 'Uma tarefa SCHED_FIFO de prioridade 50 entra em um laço infinito sem bloquear. O que acontece com as tarefas normais naquela CPU?', 'd', [
          'Continuam rodando normalmente, pois o escalonador reserva uma fatia mínima de CPU a cada classe, graças ao limite do cgroup raiz',
          'São migradas automaticamente para a classe de tempo real, para igualar as prioridades',
          'O kernel reduz o nice da tarefa FIFO até ela ceder a CPU voluntariamente',
          'Ficam sem CPU naquela CPU enquanto a tarefa FIFO estiver pronta, sujeitas apenas ao limite de segurança de tempo real'
        ], 'Classes de tempo real têm preferência estrita sobre as normais; FIFO só cede ao bloquear ou ceder. Por isso é arriscado, e o kernel mantém um limite (sched_rt_runtime_us) para evitar travamento total.'),
        fill('q4', 'Complete com o comando que restringe um programa a determinadas CPUs (afinidade).', '___ -c 0,1 ./app', ['taskset'], 'taskset define/mostra a afinidade de CPU; -c recebe a lista de CPUs.'),
        mcq('q5', 'Na simulação round-robin com quantum 2 e tarefas A=5, B=3 e C=8 (fila A, B, C), em que instante a tarefa B termina?', 'b', [
          't = 6',
          't = 9',
          't = 11',
          't = 16'
        ], 'Sequência: A (0-2), B (2-4), C (4-6), A (6-8), B roda mais 1 e termina em t=9. A termina em 12 e C em 16.'),
        mcq('q6', 'uptime mostra load average 8.10, 6.40, 4.20 em uma máquina de 4 CPUs. Qual é a interpretação mais correta?', 'a', [
          'Há em média o dobro de tarefas prontas (ou em E/S ininterrupta) que CPUs, e piorando',
          'A CPU está a 8% de uso, então há bastante folga para novas cargas no momento',
          'Há 8 processos zumbis consumindo CPU, que devem ser encerrados com kill para normalizar a carga',
          'O valor 8.10 é a porcentagem de uso da CPU no último minuto, medida por todos os núcleos'
        ], 'O load average conta tarefas executáveis e em estado D, e só faz sentido comparado ao número de CPUs. Valores crescentes (1 min maior que 15 min) indicam piora. A causa pode ser CPU ou E/S.'),
        mcq('q7', 'Em /proc/<pid>/status, nonvoluntary_ctxt_switches cresce muito para um serviço. O que isso sugere?', 'c', [
          'O serviço cede a CPU o tempo todo por esperar disco, então o gargalo é de E/S',
          'O serviço foi criado com clone e compartilha a memória com o pai, o que gera trocas, pois threads do mesmo processo disputam a mesma CPU',
          'O serviço está sendo preemptado com frequência, ou seja, há disputa por CPU com outras tarefas',
          'O serviço usa SCHED_DEADLINE, que gera trocas involuntárias por natureza'
        ], 'Trocas involuntárias ocorrem quando o escalonador tira a tarefa da CPU (fatia esgotada, outra mais urgente). Trocas voluntárias vêm de bloqueios em E/S ou locks.'),
        fill('q8', 'Complete com o número da classe idle do ionice (usa o disco só quando ninguém mais usa).', 'ionice -c ___ ./backup.sh', ['3', 'idle'], 'Classes do ionice: 1 tempo real, 2 best-effort, 3 idle.')
      ]
    },
    {
      id: 'lna-37-tempo-clocks-kernel',
      title: 'Tempo e relógios no kernel',
      goal: 'Entender fontes de relógio, os relógios REALTIME, MONOTONIC e BOOTTIME, timers, ajuste de tempo (slew vs step), NTP/chrony/PTP, RTC, segundos intercalares e as consequências do tempo para TLS, Kerberos e logs.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'De onde vem o tempo: clocksource',
            'O kernel não tem um relógio mágico: ele conta tempo lendo um contador de hardware, chamado CLOCKSOURCE. Os mais conhecidos em x86 são o TSC (um contador dentro da própria CPU, lido por instrução, muito rápido e acessível pelo vDSO sem entrar no kernel), o HPET (temporizador de eventos de alta precisão da placa-mãe, mais lento de ler) e o ACPI PM timer (mais lento ainda). O kernel escolhe o melhor disponível por uma nota de qualidade, mas o TSC só é confiável se for estável e sincronizado entre CPUs; se o kernel detectar instabilidade, troca para outra fonte. Você vê as opções e a atual em /sys/devices/system/clocksource/clocksource0/. Em máquinas virtuais, costuma haver uma fonte paravirtualizada própria do hipervisor.',
            'cat /sys/devices/system/clocksource/clocksource0/available_clocksource\n# tsc hpet acpi_pm              <- exemplo (varia)\ncat /sys/devices/system/clocksource/clocksource0/current_clocksource\n# tsc                           <- exemplo'
          ),
          sl(
            'REALTIME, MONOTONIC e BOOTTIME',
            'Um programa pergunta as horas por clock_gettime com um relógio escolhido. CLOCK_REALTIME é a hora de parede: segundos desde 1970-01-01 UTC (época Unix). É o que o usuário vê, mas PODE DAR SALTOS: se alguém acerta a hora, ou o NTP faz um ajuste em degrau, o valor pula para frente ou para trás. CLOCK_MONOTONIC conta desde um ponto arbitrário (geralmente o boot) e NUNCA retrocede nem sofre degraus (pode ter a velocidade ajustada de leve pelo NTP, ver adiante), mas NÃO conta o tempo em que o sistema ficou suspenso. CLOCK_BOOTTIME é como o monotônico, porém conta também o tempo de suspensão. Regra prática: para DATA e HORA mostradas a pessoas ou gravadas em registros, use REALTIME; para MEDIR DURAÇÃO, timeouts e intervalos, use MONOTONIC (ou BOOTTIME se a suspensão deve contar).',
            'import time\ninicio = time.monotonic()      # relógio monotônico\ntrabalho()\ndur = time.monotonic() - inicio  # duração correta, mesmo se a hora de parede mudar\nagora = time.time()            # hora de parede (CLOCK_REALTIME): pode saltar'
          ),
          sl(
            'Demonstração: por que usar monotônico',
            'Imagine medir uma operação de 2 segundos com time.time(). Se, durante ela, o NTP atrasa a hora de parede em 5 segundos (um degrau), a conta dá 2 - 5 = -3 segundos: uma duração NEGATIVA, que quebra timeouts, métricas e limites de taxa. Com time.monotonic() o degrau não existe e a duração continua 2. Em Python você pode ver os dois relógios lado a lado (no Linux e no Windows funcionam). O experimento abaixo foi executado: a duração medida pelo monotônico nunca é menor que o tempo dormido, enquanto o valor de time.time() depende da hora de parede. A simulação do degrau é só aritmética: duas leituras da hora de parede, com um salto no meio.',
            'import time\nm0 = time.monotonic(); time.sleep(0.2)\nprint(time.monotonic() - m0 >= 0.2)   # True (executado)\n# simulação do degrau (aritmética):\nt0, t1 = 1000.0, 1000.0 + 2 - 5        # hora de parede salta 5 s para trás\nprint(t1 - t0)                         # -3.0  duração negativa!'
          ),
          sl(
            'Timers, jiffies, hrtimers e tickless',
            'O kernel também precisa ACORDAR coisas em momentos certos (escalonamento por tempo, timeouts, sleep). O mecanismo clássico é o TICK: uma interrupção periódica do temporizador em HZ vezes por segundo (HZ é definido na configuração do kernel). O contador global de ticks é o JIFFIES, e timers simples têm a resolução de um tick. Para precisão maior existem os HRTIMERS (timers de alta resolução), que programam o dispositivo de eventos do relógio para o instante exato com resolução de nanossegundos em hardware adequado; é o que sustenta nanosleep, timerfd e clock_nanosleep precisos. Por fim, manter um tick periódico em CPU ociosa gasta energia e acorda a CPU à toa. O modo TICKLESS (NO_HZ) desliga o tick em CPUs ociosas (e, com NO_HZ_FULL, opcionalmente nas ocupadas com uma só tarefa), acordando apenas no próximo evento necessário.',
            'grep -E "CONFIG_HZ=|CONFIG_NO_HZ|CONFIG_HIGH_RES_TIMERS" /boot/config-$(uname -r)\n# exemplo (varia): CONFIG_HZ=250  CONFIG_NO_HZ_IDLE=y  CONFIG_HIGH_RES_TIMERS=y'
          ),
          sl(
            'Ajustar o relógio: slew e step; NTP e chrony',
            'Relógios de hardware derivam: cada oscilador corre um pouco rápido ou lento. NTP, por rede, e daemons como chrony e ntpd estimam o erro e o corrigem pela syscall adjtimex (clock_adjtime). Há duas formas. SLEW: o kernel altera levemente a VELOCIDADE do relógio até o erro sumir, sem saltos. O ajuste máximo é de 500 ppm (500 microssegundos por segundo, ou seja 0,0005 s por segundo). STEP: o relógio salta direto para o valor correto, usado só quando o erro é grande demais para o slew. Conta: corrigir 0,1 s de erro com slew máximo leva 0,1 / 0,0005 = 200 s. Por isso daemons fazem slew para erros pequenos e step apenas para grandes (no chrony, por exemplo, a diretiva makestep define quando permitir o degrau, em geral no início). O comando chronyc tracking mostra o estado.',
            'chronyc tracking                       # exemplo (varia)\n# Reference ID    : C0A80001 (ntp1.interno.example)\n# Stratum         : 3\n# System time     : 0.000012 seconds fast of NTP time   <- 12 microssegundos adiantado\n# Last offset     : -0.000004 seconds\n# RMS offset      : 0.000020 seconds\n# Frequency       : 12.345 ppm slow\n# Leap status     : Normal'
          ),
          sl(
            'PTP, RTC e hwclock; segundos intercalares e fusos',
            'NTP chega a precisões da ordem de milissegundos ou melhor, pela internet ou LAN. O PTP (IEEE 1588) usa carimbos de tempo feitos pelo hardware da placa de rede e chega a precisão muito melhor em redes preparadas: o ptp4l sincroniza o relógio de hardware da placa (PHC) e o phc2sys o copia para o CLOCK_REALTIME do sistema. O RTC é o relógio de hardware alimentado por bateria, que mantém a hora com a máquina desligada; o kernel o lê no boot e o hwclock o manipula: hwclock --show lê, hwclock --systohc copia a hora do SISTEMA para o RTC, hwclock --hctosys copia do RTC para o sistema. Em Linux, a convenção é manter o RTC em UTC (timedatectl mostra se está em UTC ou hora local). Segundo intercalar: a rotação da Terra é irregular, então UTC às vezes ganha um segundo (23:59:60). O tempo Unix NÃO conta segundos intercalares, o que causa repetição ou salto. Muitos provedores usam o SMEAR: diluem o segundo extra em horas, em passos mínimos, sem 23:59:60; misturar fontes com smear e sem smear gera diferença de até meio segundo. Fusos: guarde e processe em UTC, converta para o fuso local só na exibição (base tzdata em /usr/share/zoneinfo).',
            'timedatectl                            # exemplo: mostra Local time, UTC, RTC in local TZ: no\nsudo hwclock --systohc                 # sistema -> RTC (após acertar com chrony)\nsudo hwclock --hctosys                 # RTC -> sistema'
          ),
          sl(
            'Impacto do tempo e segurança (NTS)',
            'Hora errada quebra coisas que parecem não ter relação. TLS: certificados têm validade (not before, not after); relógio muito adiantado ou atrasado faz certificados válidos parecerem expirados ou ainda não válidos. Kerberos: tickets só são aceitos se a diferença de relógio estiver dentro de uma tolerância curta, na casa de minutos. Logs: correlacionar eventos entre servidores exige relógios sincronizados, e em investigações a hora errada invalida a linha do tempo. Bancos de dados e sistemas distribuídos: ordenação por timestamp, expiração de locks e leases, TTL e replicação dependem de relógios; saltos para trás podem gerar duplicidade ou dados fora de ordem. SEGURANÇA: o NTP clássico não autentica o servidor por padrão. Um atacante na rede pode responder com hora falsa (spoofing) para fazer certificados expirados parecerem válidos ou derrubar autenticação. Defesas: usar várias fontes confiáveis, restringir quem responde, e usar NTS (Network Time Security), que autentica o servidor com TLS e protege os pacotes de tempo; no chrony, a opção nts na linha server o ativa.',
            '# /etc/chrony/chrony.conf (exemplo)\nserver ntp.example.org iso nts\nmakestep 1.0 3      # permite step só nas 3 primeiras atualizações se o erro passar de 1 s'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um serviço mede a duração de uma operação com time.time() antes e depois. Durante ela, o NTP faz um degrau para trás. Qual é o efeito e a correção?', 'b', [
          'Nenhum efeito, pois time.time() é monotônico no Linux; o monotonic() seria menos preciso por não ser sincronizado',
          'A duração pode sair errada ou negativa; deve-se usar time.monotonic() (CLOCK_MONOTONIC), que não sofre degraus',
          'A duração fica correta e o degrau só altera o RTC; basta rodar hwclock antes de cada medição para evitar erro',
          'A duração fica correta, mas o log perde ordem; corrigir exige trocar o clocksource de tsc para hpet'
        ], 'A hora de parede (REALTIME) pode saltar; o relógio monotônico não retrocede, por isso é o certo para medir intervalos.'),
        mcq('q2', 'Um notebook mede o tempo com CLOCK_MONOTONIC e depois fica suspenso por uma hora. Qual relógio, entre os monotônicos, continua contando durante a suspensão?', 'd', [
          'CLOCK_MONOTONIC, pois ele usa o TSC, e o TSC continua contando mesmo na suspensão',
          'CLOCK_REALTIME, que é monotônico por definição e já inclui a hora suspensa',
          'Nenhum deles: o kernel para todos os relógios na suspensão e os retoma ao acordar',
          'CLOCK_BOOTTIME, que inclui o tempo suspenso desde o boot'
        ], 'MONOTONIC não conta a suspensão; BOOTTIME conta. REALTIME não é monotônico: pode saltar.'),
        mcq('q3', 'Por que alguns provedores de nuvem usam leap smear?', 'a', [
          'Para diluir o segundo extra em horas, em passos mínimos, evitando um 23:59:60 que muitos softwares tratam mal',
          'Para atrasar o RTC em um segundo na meia-noite e reescrever a hora de parede de todos os logs já gravados',
          'Para trocar o UTC por hora local nos servidores, já que segundos intercalares só existem em alguns fusos',
          'Porque o tempo Unix conta segundos intercalares, e o smear os retira da contagem para igualar todos os servidores'
        ], 'O smear espalha o segundo extra, sem 23:59:60. O tempo Unix não conta segundos intercalares, e misturar fontes com e sem smear gera diferenças.'),
        fill('q4', 'Complete o cálculo: erro de 0,1 s corrigido por slew no máximo de 0,0005 s por segundo leva quantos segundos?', 'erro = 0.1 s\ntaxa = 0.0005\ntempo = erro / taxa = ___ s', ['200', '200.0', '200 s'], '0,1 / 0,0005 = 200 s. Por isso erros grandes costumam ser corrigidos por step, não por slew.'),
        mcq('q5', 'Na saída de exemplo do chronyc tracking, o que significa "System time : 0.000012 seconds fast of NTP time"?', 'c', [
          'O relógio do sistema está atrasado cerca de 12 milissegundos em relação ao NTP',
          'A fonte NTP está a 12 microssegundos de distância de rede, o que dá o atraso de ida e volta',
          'O chrony já deu um degrau de 12 microssegundos hoje e agora o erro é zero',
          'O relógio do sistema está adiantado cerca de 12 microssegundos em relação ao tempo NTP estimado'
        ], '0,000012 s são 12 microssegundos, e fast significa adiantado. Não é distância de rede nem degrau.'),
        mcq('q6', 'Depois de acertar a hora do sistema com o chrony, qual comando grava essa hora no RTC?', 'b', [
          'hwclock --hctosys, que copia a hora do sistema para o relógio de hardware',
          'hwclock --systohc, que copia a hora do sistema para o relógio de hardware',
          'timedatectl set-timezone, que grava o fuso e atualiza o RTC com a hora atual do sistema',
          'chronyc makestep, que força o RTC a seguir a fonte NTP, sem passar pelo sistema'
        ], 'systohc vai do sistema para o RTC; hctosys faz o contrário. O fuso e o makestep não escrevem no RTC.'),
        mcq('q7', 'Um atacante na rede responde ao pedido NTP de um servidor com uma hora dois anos no passado. Qual é o risco e uma mitigação adequada?', 'd', [
          'O RTC é o único afetado e o TLS segue intacto, pois certificados usam a hora do servidor remoto; basta reiniciar o serviço de rede',
          'O risco é só de lentidão, pois o kernel rejeita qualquer step; a mitigação é aumentar o HZ',
          'O clocksource troca de tsc para hpet, o que desliga o TLS até o próximo boot; a mitigação é usar hwclock',
          'Certificados vencidos podem parecer válidos; várias fontes e NTS autenticam o servidor de tempo'
        ], 'Sem autenticação, hora falsa pode revalidar certificados expirados e quebrar investigações. Várias fontes confiáveis e NTS reduzem o risco.'),
        fill('q8', 'Complete o arquivo do sysfs que mostra o clocksource em uso.', 'cat /sys/devices/system/clocksource/clocksource0/___', ['current_clocksource'], 'current_clocksource mostra o relógio em uso; available_clocksource lista as opções.')
      ]
    },
    {
      id: 'lna-05-sistemas-arquivos-internals',
      title: 'Sistemas de arquivos por dentro',
      goal: 'Entender os objetos do VFS, o caminho de escrita, durabilidade (fsync), journaling, ext4/XFS, copy-on-write, xattr e inotify.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Os objetos do VFS: superblock, inode, dentry e file',
            'O VFS representa tudo com quatro objetos. O SUPERBLOCK descreve um sistema de arquivos montado (tipo, tamanho de bloco, estado). O INODE guarda os metadados de um arquivo: dono, permissões, tamanho, datas e onde estão os dados; ele NÃO guarda o nome. O nome vive na DENTRY (entrada de diretório), que liga um nome a um inode; um diretório é basicamente uma lista de pares nome-inode. O objeto FILE representa um arquivo ABERTO por um processo: tem a posição de leitura/escrita atual e as flags de abertura, e é o que o descritor de arquivo (fd) referencia. Como o nome é separado do inode, um hard link é apenas outro nome para o mesmo inode (o inode tem um contador de links), e o arquivo só é liberado quando o contador chega a zero E nenhum processo o mantém aberto. Um link simbólico, ao contrário, é um arquivo cujo conteúdo é um caminho.',
            'ls -li a.txt b.txt      # mesmo número de inode = hard links (exemplo)\n# 131074 -rw-r--r-- 2 user user 10 ... a.txt\n# 131074 -rw-r--r-- 2 user user 10 ... b.txt   <- contador de links = 2\nstat a.txt              # Inode, Links, Size, Blocks'
          ),
          sl(
            'Caches e o caminho de escrita (write-back)',
            'O VFS mantém caches: de dentries (resolver /a/b/c sem ir ao disco), de inodes e, principalmente, de páginas (page cache). Na escrita, write() copia os dados para páginas do page cache, marca-as como sujas e RETORNA: o dado ainda não está no disco. Threads do kernel (flushers) gravam as páginas sujas depois (write-back), disparadas por tempo ou por volume, controlados por vm.dirty_background_ratio, vm.dirty_ratio e vm.dirty_expire_centisecs. Isso dá desempenho enorme, mas significa que, numa queda de energia, o que estava só no cache se perde. Para durabilidade a aplicação precisa pedir: fsync(fd) força os dados e metadados daquele arquivo ao dispositivo antes de retornar; fdatasync faz o mesmo para os dados (e metadados necessários para lê-los), pulando metadados como datas; sync grava tudo. Criar ou renomear um arquivo também altera o diretório, que pode exigir fsync no diretório.',
            'write(fd, ...) -> page cache (suja) -> retorna      # rápido, NÃO durável\n   ...segundos depois: flusher grava no disco (write-back)\nfsync(fd)  -> só retorna após dados no dispositivo     # durável\n# ajustes (exemplo de leitura): cat /proc/sys/vm/dirty_ratio'
          ),
          sl(
            'Journaling e consistência após queda',
            'Sem proteção, uma queda no meio de uma operação que altera vários metadados (alocar bloco, atualizar inode e diretório) deixa o sistema de arquivos inconsistente, exigindo um fsck demorado. O JOURNAL (diário) resolve: o sistema grava antes, em uma área sequencial, a descrição das alterações; após a queda, o kernel reaplica as transações completas e descarta as incompletas, em segundos. No ext4 há três modos: data=ordered (padrão: os dados são gravados ANTES de os metadados correspondentes irem ao journal; metadados protegidos e nunca apontam para dados antigos), data=writeback (só metadados no journal; a ordem dos dados é livre, e após queda um arquivo pode conter lixo antigo) e data=journal (dados e metadados passam pelo journal: mais seguro e mais lento, escreve duas vezes). Atenção: o journal protege a consistência do SISTEMA de arquivos, não a lógica da aplicação. O padrão seguro de aplicação é: escrever em arquivo temporário, fsync, rename para o nome final (atômico) e fsync do diretório.',
            'mount | grep " / "        # exemplo: ... type ext4 (rw,relatime)\n# opção de montagem: data=ordered | data=writeback | data=journal\ngrava tmp -> fsync(tmp) -> rename(tmp, final) -> fsync(diretório)'
          ),
          sl(
            'ext4 e XFS por dentro',
            'O ext4 divide o disco em grupos de blocos (blocos tipicamente de 4 KiB) e usa EXTENTS: em vez de listar cada bloco de um arquivo, guarda intervalos contíguos (início e tamanho), o que reduz metadados e fragmentação em arquivos grandes; usa também alocação atrasada (decide onde gravar só no write-back). Os inodes do ext4 são criados na formatação em número FIXO: é possível receber "No space left on device" com espaço livre se os inodes acabarem (milhões de arquivos minúsculos); df -i mostra. O XFS divide o volume em grupos de alocação (AGs) independentes, permitindo operações em paralelo em vários núcleos, aloca inodes dinamicamente e se destaca com arquivos grandes e alta concorrência; em contrapartida, um XFS não pode ser reduzido (só ampliado).',
            'df -i /var                        # exemplo (varia)\n# Filesystem   Inodes  IUsed  IFree IUse% Mounted on\n# /dev/sda2    655360 655360      0  100% /var   <- sem inodes, mesmo com espaço\nxfs_info /dados                    # agcount = nº de grupos de alocação'
          ),
          sl(
            'Copy-on-write: Btrfs e ZFS',
            'Em um sistema CoW, blocos nunca são sobrescritos no lugar: uma alteração grava um NOVO bloco e depois atualiza, de forma atômica, os ponteiros da árvore até a raiz. Consequências: o estado em disco é sempre consistente (dispensa o journal tradicional), snapshots são quase instantâneos e baratos (apenas guardam a raiz antiga e compartilham os blocos não alterados), checksums de dados e metadados detectam corrupção silenciosa, e clones por referência (reflink) copiam arquivos sem duplicar blocos. O custo é maior fragmentação em escritas aleatórias e mais trabalho de gerência de espaço. Btrfs e ZFS são os exemplos; o XFS também suporta reflink em algumas configurações.',
            'cp --reflink=auto grande.img clone.img   # em FS com reflink: cópia sem duplicar blocos\nbtrfs subvolume snapshot /dados /dados/.snap-hoje   # snapshot barato (exemplo)'
          ),
          sl(
            'O_DIRECT, drop_caches, xattr e inotify',
            'O_DIRECT é uma flag de open() que contorna o page cache: a E/S vai direto entre a memória do programa e o dispositivo, com exigências de alinhamento; bancos de dados que gerenciam seu próprio cache a usam. A escrita em /proc/sys/vm/drop_caches (valores 1, 2 ou 3, após sync) descarta cache limpo; serve para benchmarks reproduzíveis, mas NÃO deve ser usada em produção como "limpeza": ela joga fora cache útil e provoca uma enxurrada de leituras de disco, sem resolver problema algum. Atributos estendidos (xattr) são metadados extras em pares chave-valor associados ao inode (namespaces user., security., system., trusted.); o SELinux guarda o rótulo em security.selinux, e getfattr/setfattr os manipulam. O inotify é a API do kernel para ser AVISADO de eventos em arquivos e diretórios (criar, modificar, apagar, mover) sem fazer polling; o comando inotifywait (pacote inotify-tools) a expõe, e fs.inotify.max_user_watches limita as vigias.',
            'sync; echo 3 | sudo tee /proc/sys/vm/drop_caches   # SÓ em teste/benchmark\ngetfattr -d -m - arquivo                             # lista xattrs\ninotifywait -m -e create,modify /dados/entrada       # eventos em tempo real'
          )
        ]
      },
      questions: [
        mcq('q1', 'Em termos de objetos do VFS, onde fica registrado o NOME de um arquivo?', 'd', [
          'No inode, junto com permissões e tamanho',
          'No superblock do sistema de arquivos montado',
          'No objeto file, criado quando o processo abre o arquivo, que guarda a posição de leitura',
          'Na dentry (entrada de diretório), que associa um nome a um inode, e o inode nunca guarda o nome'
        ], 'O inode guarda metadados e localização dos dados, não o nome. Dentries ligam nomes a inodes, o que permite vários nomes (hard links) para o mesmo inode.'),
        mcq('q2', 'Qual associação entre recurso e finalidade está correta?', 'b', [
          'O_DIRECT mantém o arquivo normalmente no page cache; xattr compacta o arquivo; inotify cria cópias de segurança',
          'O_DIRECT contorna o page cache; xattr guarda metadados extras; inotify avisa sobre eventos de arquivos',
          'O_DIRECT cria links simbólicos; xattr altera o dono do arquivo; inotify verifica a integridade dos blocos',
          'O_DIRECT criptografa os dados; xattr define a cota de disco; inotify descarta o cache de dentries'
        ], 'O_DIRECT evita o page cache, xattr são atributos estendidos (como security.selinux) e inotify entrega notificações de eventos do sistema de arquivos.'),
        mcq('q3', 'Uma aplicação grava um arquivo com write(), recebe sucesso e a máquina perde energia 2 segundos depois, sem fsync. Qual é o resultado possível?', 'a', [
          'Os dados podem ter ficado só no page cache (write-back pendente) e se perder; fsync antes da queda teria garantido a gravação',
          'Os dados estão garantidos, pois write() só retorna depois de gravar no dispositivo',
          'O journal reaplica automaticamente os dados da aplicação, pois protege também o conteúdo',
          'O sistema de arquivos é sempre destruído e precisa ser reformatado'
        ], 'write() retorna depois de copiar para o page cache. A durabilidade exige fsync/fdatasync. O journal protege a consistência do sistema de arquivos, não o conteúdo que a aplicação não sincronizou.'),
        fill('q4', 'Complete com o nome do arquivo em /proc/sys/vm usado para descartar caches (apenas em testes).', 'sync; echo 3 | sudo tee /proc/sys/vm/___', ['drop_caches'], 'drop_caches descarta page cache e caches de dentries/inodes limpos. Em produção só prejudica: o cache útil é perdido.'),
        mcq('q5', 'No ext4, qual modo de journal grava os dados ANTES de confirmar os metadados e é o padrão?', 'c', [
          'data=writeback, que grava metadados no journal e deixa os dados soltos, o que evita a perda de dados na queda de energia',
          'data=journal, que passa dados e metadados pelo journal e escreve duas vezes em todas as transações',
          'data=ordered, que garante que os metadados não apontem para dados ainda não gravados',
          'data=direct, que contorna o page cache e o journal'
        ], 'ordered (padrão) protege os metadados sem duplicar a escrita de dados. writeback pode deixar lixo antigo em arquivos após queda; journal é mais seguro e lento. data=direct não existe.'),
        mcq('q6', 'Por que um snapshot em um sistema de arquivos copy-on-write como Btrfs ou ZFS é quase instantâneo e barato?', 'd', [
          'Porque o sistema copia todo o volume em segundo plano antes de liberar o comando, usando espaço equivalente ao do volume original',
          'Porque o snapshot só vale enquanto o volume está desmontado, evitando alterações',
          'Porque o snapshot é gravado só na RAM e perdido na reinicialização',
          'Porque blocos nunca são sobrescritos: o snapshot guarda a raiz antiga e compartilha os blocos que não mudaram'
        ], 'Em CoW, alterações vão para blocos novos e os ponteiros são atualizados atomicamente; manter a raiz antiga preserva o estado anterior sem copiar dados.'),
        mcq('q7', 'Um servidor ext4 responde "No space left on device", mas df -h mostra 40% de espaço livre. Qual é a causa mais provável e como confirmar?', 'b', [
          'O journal está cheio; confirmar com dmesg e reiniciar o serviço de journal, depois de limpar os logs antigos',
          'Os inodes acabaram (muitos arquivos pequenos, número fixo na formatação); confirmar com df -i',
          'O page cache ocupou todo o espaço livre; confirmar com free e drop_caches, e esvaziar o cache antes da próxima gravação',
          'As cotas de swap foram excedidas; confirmar com swapon --show'
        ], 'Inodes do ext4 são criados na formatação em número fixo. Com IUse% em 100%, não se criam mais arquivos mesmo com blocos livres. XFS aloca inodes dinamicamente.'),
        fill('q8', 'Complete com a opção do df que mostra o uso de inodes.', 'df ___ /var', ['-i', '--inodes'], 'df -i exibe inodes totais, usados e livres por sistema de arquivos.')
      ]
    },
    {
      id: 'lna-06-io-armazenamento-avancado',
      title: 'E/S e armazenamento avançado',
      goal: 'Entender a camada de blocos, escalonadores de E/S, NVMe vs SATA, device-mapper, benchmarks com fio, iostat -x, TRIM, RAID e recursos de Btrfs/ZFS e io_uring.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'A camada de blocos e os escalonadores de E/S',
            'Entre o sistema de arquivos e o driver do disco fica a camada de blocos: ela recebe requisições (ler/gravar setores), pode reordená-las e mesclá-las, e as entrega ao driver. A implementação moderna se chama blk-mq (multi-queue): filas por CPU que alimentam as filas de hardware do dispositivo, para escalar em máquinas com muitos núcleos. Sobre ela atua o escalonador de E/S, escolhido por dispositivo: none (não reordena; indicado para NVMe e dispositivos rápidos, onde o próprio hardware decide), mq-deadline (impõe prazos de atendimento para leituras e escritas, evitando que uma fique esperando para sempre; bom para SATA e discos rotativos) e bfq (reparte a banda de forma justa entre processos, priorizando a interatividade; comum em desktops e discos lentos). O arquivo de cada dispositivo em /sys/block mostra e troca o escalonador, com o ativo entre colchetes.',
            'cat /sys/block/sda/queue/scheduler          # exemplo (varia)\n# mq-deadline [none] bfq\necho mq-deadline | sudo tee /sys/block/sda/queue/scheduler   # troca (não persiste)\n# nvme0n1 costuma aparecer com [none]'
          ),
          sl(
            'NVMe vs SATA',
            'Um SSD SATA conversa com o sistema por AHCI, que define uma única fila de comandos com 32 posições: o interface foi desenhado para discos rotativos. O NVMe é um protocolo feito para memória flash sobre PCIe: suporta MUITAS filas, cada uma com muitos comandos pendentes, idealmente uma por CPU, sem disputa de travas, com baixa latência e muito paralelismo. É o que justifica o escalonador none em NVMe e explica por que profundidade de fila (iodepth) alta em testes faz diferença no NVMe e quase nenhuma em um HDD. Os nomes de dispositivo ilustram: SATA aparece como /dev/sda, /dev/sdb; NVMe como /dev/nvme0n1 (controlador 0, namespace 1) e partições /dev/nvme0n1p1.',
            'lsblk -d -o NAME,ROTA,TYPE,SIZE        # exemplo (ROTA=1 disco rotativo, 0 SSD)\n# NAME      ROTA TYPE  SIZE\n# sda          0 disk  500G\n# nvme0n1      0 disk  1T'
          ),
          sl(
            'device-mapper: blocos virtuais',
            'O device-mapper é o framework do kernel que cria dispositivos de bloco VIRTUAIS mapeados sobre outros, aparecendo em /dev/mapper e em /dev/dm-N. É a base de várias tecnologias que você já conhece e de outras: o LVM (volumes lógicos lineares, em faixas, thin e snapshots), o dm-crypt (criptografia transparente do volume, usada pelo LUKS), o dm-raid (RAID via código do md) e o dm-verity (verificação de integridade somente leitura por uma árvore de hashes: cada leitura é conferida, e qualquer alteração é detectada; usado em imagens de sistema imutáveis e em cadeia de confiança de boot). O comando dmsetup e o lsblk mostram a pilha: por exemplo, uma partição física, sobre ela um volume dm-crypt e sobre ele volumes LVM.',
            'lsblk                                       # exemplo de pilha\n# sda\n# └─sda2          crypto_LUKS\n#   └─cripto      dm-crypt\n#     ├─vg-raiz   LVM   /\n#     └─vg-dados  LVM   /dados\nsudo dmsetup ls'
          ),
          sl(
            'fio: benchmarks de verdade e suas armadilhas',
            'O fio gera cargas de E/S configuráveis. Um perfil típico: leitura aleatória de blocos de 4 KiB com fila de 32, durante 30 segundos. Armadilhas comuns: (1) sem --direct=1, a E/S passa pelo page cache e você mede a RAM, não o disco; (2) um arquivo pequeno, que cabe na memória, gera o mesmo erro; use um tamanho bem maior que a RAM ou direct; (3) o perfil precisa imitar a aplicação: sequencial vs aleatório, tamanho de bloco, proporção leitura/escrita, iodepth e número de jobs; um resultado de leitura sequencial de 1 MiB não diz nada sobre um banco de dados com acessos de 8 KiB; (4) SSDs mudam de comportamento com o tempo e o espaço ocupado: repita e observe a variância. AVISO: apontar --filename para um dispositivo de bloco cru com escrita DESTRÓI os dados; teste em arquivo de um volume descartável.',
            'fio --name=teste --filename=/dados/fio.tmp --size=4G \\\n    --rw=randread --bs=4k --iodepth=32 --ioengine=libaio \\\n    --direct=1 --runtime=30 --time_based\n# saída resume IOPS, banda e latências (valores variam)'
          ),
          sl(
            'iostat -x: lendo a saída',
            'iostat -x 1 (pacote sysstat) imprime métricas por dispositivo a cada segundo (a primeira amostra é a média desde o boot: ignore). Campos principais: r/s e w/s (operações por segundo), rkB/s e wkB/s (vazão), r_await e w_await (tempo médio, em ms, que uma E/S espera desde que foi enfileirada até terminar: inclui a fila), aqu-sz (tamanho médio da fila) e %util (fração do tempo em que o dispositivo teve E/S pendente). Em um disco rotativo, %util perto de 100 com await e aqu-sz altos indica saturação. Em NVMe e SSDs, que processam muitas E/S em paralelo, %util de 100 não significa que o dispositivo esgotou a capacidade: olhe o await e a fila. Os nomes das colunas variam um pouco por versão.',
            'iostat -x 1 2                       # exemplo didático (varia)\n# Device  r/s   w/s  rkB/s  wkB/s  r_await w_await aqu-sz %util\n# sda    10.0 220.0  400.0 9000.0     8.0    45.0   12.0  99.0\n# await de 45 ms em escrita + fila de 12 + %util 99 em HDD = saturado'
          ),
          sl(
            'TRIM, alinhamento e RAID em software vs hardware',
            'TRIM (discard) informa ao SSD quais blocos o sistema de arquivos liberou, para que o controlador os apague com antecedência e mantenha o desempenho de escrita. fstrim -v /ponto executa sob demanda, e muitas distribuições trazem um timer semanal (fstrim.timer); a opção de montagem discard faz o TRIM contínuo, com custo em algumas cargas. Alinhamento: partições devem começar em múltiplos do tamanho da página/bloco do dispositivo; o padrão atual de iniciar em 1 MiB (setor 2048 de 512 bytes) cobre os casos comuns, e parted -a optimal ou fdisk modernos fazem isso. RAID em software (md/mdadm) usa a CPU e o kernel, é transparente e portável entre máquinas; RAID de hardware usa controladora própria com cache (muitas vezes com bateria), mas prende você ao formato e ao firmware da controladora. Lembrete: RAID dá disponibilidade, NÃO é backup (exclusão e corrupção replicam).',
            'sudo fstrim -v /                    # exemplo: /: 20 GiB (...) trimmed\nsystemctl list-timers fstrim.timer\nsudo parted /dev/sdX align-check optimal 1   # TESTE o alinhamento (sdX = placeholder)'
          ),
          sl(
            'Btrfs e ZFS avançado, e io_uring',
            'Btrfs e ZFS oferecem snapshots (versões somente leitura, instantâneas), send/receive (serializa um snapshot, ou só a diferença entre dois, para replicar em outro volume ou máquina: base de backups incrementais eficientes) e scrub (lê todos os dados e confere os checksums, reparando a partir de cópias redundantes quando existem: detecta corrupção silenciosa antes que seja tarde; deve ser agendado). io_uring é uma interface de E/S assíncrona do kernel: aplicação e kernel compartilham duas filas em memória (submissão e conclusão); a aplicação enfileira várias operações e as submete com uma única syscall (ou até com polling, sem syscall), reduzindo o custo por operação em E/S de alto volume. Por ampliar a superfície do kernel acessível a processos, alguns ambientes restringem seu uso; avalie a política de segurança.',
            'btrfs scrub start /dados            # verifica checksums (exemplo)\nzpool scrub tanque                   # ZFS (nome do pool de exemplo)\nbtrfs send -p /snap/ontem /snap/hoje | ssh <host> btrfs receive /backup'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual escalonador de E/S costuma ser indicado para um SSD NVMe, onde o próprio dispositivo gerencia muitas filas?', 'c', [
          'bfq, porque reordena as requisições para minimizar o movimento da cabeça de leitura',
          'mq-deadline com prazos longos, porque o NVMe só aceita uma requisição por vez',
          'none, que não reordena e deixa o hardware paralelo decidir',
          'cfq, que divide fatias de tempo por processo e é o padrão do blk-mq'
        ], 'Em dispositivos rápidos e paralelos, reordenar no software só acrescenta custo, então none é o usual. Não há cabeça de leitura em NVMe, e o cfq foi removido junto com o modelo antigo de uma fila.'),
        mcq('q2', 'Por que aumentar o iodepth em um teste fio faz grande diferença no NVMe e pouca em um HDD?', 'a', [
          'O NVMe atende muitas requisições em paralelo por filas múltiplas; o HDD processa praticamente uma por vez, limitado pelo movimento mecânico',
          'O HDD só aceita iodepth 1, e valores maiores são rejeitados pelo driver',
          'O NVMe usa mais CPU quando a fila é maior, o que aumenta o tempo de resposta',
          'O iodepth só afeta a E/S sequencial, que é igual em ambos os dispositivos'
        ], 'NVMe foi projetado para muitas filas profundas. Em HDD o paralelismo útil é baixo; enfileirar mais só aumenta a espera.'),
        mcq('q3', 'Qual componente do device-mapper verifica a integridade de um volume somente leitura por uma árvore de hashes?', 'd', [
          'dm-crypt, que cifra o volume com LUKS e confere a senha na abertura',
          'LVM thin, que mantém checksums de cada bloco alocado',
          'dm-raid, que compara cópias entre discos a cada leitura, ao custo de uma tabela de metadados extra',
          'dm-verity, que confere cada leitura contra a árvore de hashes em volume somente leitura'
        ], 'dm-verity detecta qualquer alteração em um volume imutável. dm-crypt garante confidencialidade, não integridade verificada por hash; o LVM não faz verificação desse tipo.'),
        fill('q4', 'Complete com o arquivo em /sys/block/<dev>/queue que mostra o escalonador de E/S ativo.', 'cat /sys/block/sda/queue/___', ['scheduler'], 'O arquivo scheduler lista as opções, com a ativa entre colchetes.'),
        mcq('q5', 'Um teste fio com arquivo de 1 GiB, sem --direct=1, em uma máquina com 16 GiB de RAM, reporta vazão altíssima para leitura. Qual é a explicação provável?', 'b', [
          'O disco é NVMe, e todos os NVMe atingem esse valor em leitura aleatória, graças às filas múltiplas do protocolo',
          'As leituras foram atendidas pelo page cache, então o teste mediu a memória e não o dispositivo',
          'O escalonador mq-deadline duplica as leituras para somar banda, ao reordenar e repetir os pedidos de leitura',
          'O fio ignora o sistema de arquivos e lê direto da controladora'
        ], 'Arquivo pequeno e sem O_DIRECT cabe no cache: o resultado reflete a RAM. Use --direct=1 e dados maiores que a memória, com perfil parecido com o da aplicação.'),
        mcq('q6', 'No iostat -x de um disco rotativo aparece w_await = 45, aqu-sz = 12 e %util = 99. Qual é a leitura mais adequada?', 'd', [
          'O dispositivo está ocioso, pois o %util mede o consumo de CPU do disco',
          'O disco está saudável, já que 45 ms é só o tempo de seek de um único acesso',
          'O problema é de rede, pois await mede o tempo de resposta do cliente',
          'As escritas esperam em fila longa e o dispositivo está saturado'
        ], 'Await alto (inclui a fila), fila média alta e %util perto de 100 em HDD indicam saturação. Em NVMe, %util 100 sozinho não prova saturação.'),
        mcq('q7', 'Qual é a função do scrub em Btrfs e ZFS?', 'a', [
          'Conferir os checksums de todos os dados e reparar com cópias redundantes',
          'Apagar snapshots antigos e liberar espaço automaticamente',
          'Replicar um snapshot incremental para outra máquina',
          'Informar ao SSD quais blocos foram liberados para que sejam apagados pelo controlador'
        ], 'Scrub verifica a integridade. Replicação incremental é send/receive; informar blocos livres é o TRIM.'),
        fill('q8', 'Complete com o comando que executa o TRIM sob demanda em um sistema de arquivos montado.', 'sudo ___ -v /', ['fstrim'], 'fstrim envia o discard dos blocos livres ao dispositivo; muitas distribuições o agendam com fstrim.timer.')
      ]
    },
    {
      id: 'lna-36-dispositivos-drivers',
      title: 'O modelo de dispositivos e drivers do kernel',
      goal: 'Entender o driver model (barramento, dispositivo, driver, probe), ler o sysfs e os nós de /dev, acompanhar enumeração PCI/USB, interrupções, DMA/IOMMU, firmware e hotplug, e proteger a máquina contra dispositivos maliciosos.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Barramento, dispositivo e driver',
            'O kernel organiza o hardware em um modelo com três peças. O BARRAMENTO (bus) é o meio por onde dispositivos são ligados e descobertos (PCI, USB, plataforma, I2C...). O DISPOSITIVO (device) é uma instância concreta, com identificação. O DRIVER é o código que sabe controlar certa família de dispositivos e declara uma tabela de IDs que suporta. Quando um dispositivo aparece (ou um driver é carregado), o núcleo do barramento compara os IDs do dispositivo com a tabela de cada driver. Se há casamento (match), o kernel chama a função PROBE do driver: ela reserva recursos (memória de registradores, interrupção), inicializa o hardware e o deixa pronto. Quando o dispositivo some ou o driver é descarregado, o kernel chama REMOVE, que desfaz tudo. Um dispositivo sem driver compatível continua listado, apenas sem funcionar.',
            'dispositivo (IDs)  --match-->  driver (tabela de IDs)\n                         |\n                         +--> probe(): inicializa, pede IRQ, registra\n   (retirada)            +--> remove(): libera recursos'
          ),
          sl(
            'sysfs: a visão do modelo',
            'O sysfs, montado em /sys, é uma janela virtual para esse modelo: cada objeto do kernel vira diretório e cada atributo vira um arquivo pequeno. Três visões principais. /sys/devices é a hierarquia REAL, como o hardware está ligado (placa-mãe, ponte PCI, dispositivo). /sys/bus/<barramento>/devices e /sys/bus/<barramento>/drivers listam, por barramento, quais dispositivos e drivers existem, com links simbólicos para a hierarquia real; dentro de cada driver, links mostram quais dispositivos ele controla. /sys/class agrupa por FUNÇÃO, sem se importar com o barramento (net, block, tty, input, backlight). Ler atributos é seguro e comum em diagnóstico; escrever em alguns arquivos configura o dispositivo (por exemplo, um atributo que desliga a autorização de um dispositivo USB) e exige root.',
            'ls /sys/bus/pci/drivers | head -3          # exemplo (varia)\nls /sys/class/net                           # lo eth0 (exemplo)\nreadlink -f /sys/class/net/eth0/device      # caminho real no /sys/devices (exemplo)'
          ),
          sl(
            'Nós em /dev: major, minor, devtmpfs e udev',
            'Programas falam com dispositivos por arquivos especiais em /dev. Um nó de dispositivo não guarda dados: guarda um par de números. O MAJOR identifica o driver (ou a classe do dispositivo) e o MINOR identifica qual instância desse driver. O tipo vem na primeira letra do ls -l: c é dispositivo de CARACTERE (fluxo de bytes sem blocos, como terminais e /dev/null) e b é dispositivo de BLOCO (acesso aleatório em blocos, como discos). Quem cria os nós? O kernel mantém o devtmpfs, um sistema de arquivos em memória montado em /dev, onde cria nós básicos assim que os dispositivos surgem. Por cima, o UDEV (systemd-udevd), um daemon em ESPAÇO DE USUÁRIO, recebe os eventos do kernel (uevents) e aplica regras: ajusta dono, grupo e modo, cria links simbólicos estáveis como /dev/disk/by-uuid e pode executar ações. O nome do kernel (sda) pode mudar entre boots; os links do udev são estáveis.',
            'ls -l /dev/sda /dev/null          # exemplo (varia)\n# brw-rw---- 1 root disk 8, 0 ... /dev/sda     <- b = bloco, major 8, minor 0\n# crw-rw-rw- 1 root root 1, 3 ... /dev/null    <- c = caractere, major 1, minor 3\nls -l /dev/disk/by-uuid | head -2             # links estáveis criados pelo udev'
          ),
          sl(
            'PCI, USB, IDs e carregamento por alias',
            'PCI e PCIe são barramentos ENUMERÁVEIS: no boot e no hotplug o kernel varre o barramento e lê de cada função um identificador de fornecedor (vendor ID) e de dispositivo (device ID), além de classe. USB funciona de modo parecido: ao conectar, o dispositivo é enumerado e informa vendor ID, product ID e classe (teclado, armazenamento...). Os comandos lspci -nn e lsusb mostram esses pares em hexadecimal. Como o módulo certo é carregado sozinho? Cada dispositivo gera um uevent com uma string MODALIAS construída a partir dos IDs (por exemplo, começa com pci: ou usb:). O udev chama o modprobe com esse alias; o modprobe consulta os aliases que cada módulo declara (arquivo modules.alias gerado por depmod) e carrega o módulo que casa. Por isso conectar um dispositivo conhecido costuma carregar o driver sem nenhum comando seu.',
            'lspci -nn | head -2                        # exemplo (varia)\n# 00:1f.6 Ethernet controller [0200]: <fabricante> <modelo> [vvvv:dddd]\ncat /sys/bus/pci/devices/0000:00:1f.6/modalias   # exemplo\n# pci:v0000VVVVd0000DDDDsv...                 <- v = vendor, d = device\nmodprobe -R pci:v0000VVVVd0000DDDD...         # mostra o módulo que casa (exemplo)'
          ),
          sl(
            'Interrupções, MSI-X, DMA e IOMMU',
            'Quando um dispositivo precisa de atenção (chegou pacote, terminou leitura), ele sinaliza uma interrupção. O /proc/interrupts lista cada IRQ com a contagem por CPU, o controlador e o nome de quem a registrou. As interrupções tradicionais usam linhas físicas, às vezes compartilhadas. MSI e MSI-X são o modo moderno do PCIe: o dispositivo sinaliza ESCREVENDO em um endereço especial de memória, sem linha dedicada. O MSI-X permite muitos vetores por dispositivo, e placas de rede o usam para ter um vetor por fila de recepção, cada um atendido por uma CPU diferente (a afinidade pode ser vista e ajustada em /proc/irq/N/smp_affinity), o que distribui a carga. Já o DMA permite que o dispositivo leia e escreva diretamente na memória principal, sem a CPU copiar os dados: é a base do desempenho de disco e rede. O risco é que um dispositivo (ou firmware) com defeito ou malicioso escreva em qualquer lugar da memória. A IOMMU resolve isso: traduz os endereços que cada dispositivo usa e só deixa alcançar as regiões que o kernel mapeou para ele, isolando dispositivos entre si e do kernel (também é a base de passar um dispositivo PCI inteiro a uma VM).',
            'cat /proc/interrupts | head -4              # exemplo (varia)\n#        CPU0   CPU1\n#  40:   9100      0   PCI-MSIX  eth0-rx-0\n#  41:      0   8800   PCI-MSIX  eth0-rx-1       <- um vetor MSI-X por fila\ncat /proc/irq/40/smp_affinity_list            # CPUs que podem atender a IRQ 40'
          ),
          sl(
            'Device Tree, ACPI e firmware de dispositivo',
            'Nem todo hardware é enumerável: um controlador soldado na placa não se anuncia como um dispositivo PCI. O kernel precisa ser TOLDO que ele existe. Em x86 e servidores, quem descreve é o ACPI: tabelas fornecidas pelo firmware. Em muitas placas ARM e embarcados, usa-se a DEVICE TREE: um arquivo de texto (.dts) compilado em binário (.dtb) que descreve dispositivos, endereços e interrupções, entregue ao kernel pelo bootloader (em sistemas que a usam, aparece em /sys/firmware/devicetree). Outra peça: muitos dispositivos (placas Wi-Fi, GPUs, placas de rede) precisam de FIRMWARE, um programa que roda no próprio chip e não vem no driver. O driver pede o arquivo ao kernel com request_firmware, que o procura em /lib/firmware (em distribuições, costuma vir do pacote linux-firmware). Se o arquivo falta, o driver carrega, mas o dispositivo não funciona, e o dmesg registra a falha de carga do firmware.',
            'ls /lib/firmware | head -3                    # exemplo (varia)\ndmesg | grep -i firmware                       # falha de carga aparece aqui (exemplo)\n# Device Tree: meu-board.dts --(dtc)--> meu-board.dtb --> bootloader --> kernel'
          ),
          sl(
            'Hotplug e segurança contra dispositivos maliciosos',
            'Hotplug é conectar e remover dispositivos com o sistema ligado: o kernel enumera, emite o uevent, o udev aplica regras e o modprobe carrega o driver. A conveniência é também superfície de ataque. Um dispositivo USB pode MENTIR sobre o que é: um pendrive adulterado pode se apresentar como TECLADO e digitar comandos (ataque tipo BadUSB). O ID de fornecedor não prova nada, pois é só o que o dispositivo declara. Interfaces com acesso direto à memória (Thunderbolt/PCIe externo) podem tentar DMA para ler ou alterar memória. Defesas: o USBGuard aplica uma política (allow, block, reject) por dispositivo, classe ou ID, e pode bloquear tudo o que não está na lista; o atributo authorized do sysfs USB autoriza ou nega um dispositivo; a IOMMU habilitada limita o alcance do DMA; Thunderbolt tem níveis de segurança e autorização de dispositivos (ferramenta boltctl); e travar a tela e controlar o acesso físico continuam essenciais.',
            'usbguard list-devices                       # exemplo: lista com id, estado (allow/block)\nusbguard allow-device <numero>               # libera um dispositivo conhecido\ncat /sys/bus/usb/devices/1-1/authorized       # 1 = autorizado, 0 = negado (exemplo)'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um novo dispositivo PCI aparece no barramento e o kernel tem um driver cuja tabela de IDs combina com ele. O que o driver model faz em seguida?', 'c', [
          'Recompila o driver com os parâmetros do dispositivo e só então o associa ao barramento, criando o nó correspondente em /dev',
          'Cria o nó em /dev e entrega o controle ao udev, que escolhe e inicializa o driver inteiramente em espaço de usuário',
          'Casa o dispositivo com o driver e chama o probe dele para inicializar o hardware; na retirada, o remove',
          'Chama primeiro o remove do driver para limpar o estado anterior e, ao terminar, o dispositivo passa a aparecer no sysfs'
        ], 'O núcleo do barramento faz o match pelos IDs e chama probe, que inicializa o dispositivo; remove desfaz na retirada. O udev cuida de regras e nós em /dev, não de inicializar o driver.'),
        mcq('q2', 'Qual é a divisão de trabalho entre devtmpfs e udev para o conteúdo de /dev?', 'a', [
          'O kernel cria nós básicos no devtmpfs; o udev, em espaço de usuário, trata uevents e aplica regras (permissões, links estáveis)',
          'O udev cria todos os nós dentro do kernel durante a compilação, e o devtmpfs guarda em memória só os links de /dev/disk/by-uuid, sem criar nós de dispositivo',
          'O devtmpfs aplica regras de permissão por fabricante, e o udev se limita a carregar o firmware que o driver pede ao kernel durante o boot',
          'Ambos rodam no kernel: o devtmpfs trata dispositivos de bloco e o udev trata os de caractere, cada um em seu subdiretório'
        ], 'O devtmpfs é mantido pelo kernel e já traz os nós; o udev (daemon em espaço de usuário) reage aos uevents e ajusta dono, modo e links estáveis.'),
        mcq('q3', 'Dada a saída de exemplo "brw-rw---- 1 root disk 8, 0 ... /dev/sda", o que se conclui?', 'd', [
          'É um dispositivo de caractere (c), com driver de número 8, instância 0, e qualquer usuário pode lê-lo',
          'É um link simbólico para o disco real, e 8, 0 é o tamanho do arquivo em blocos',
          'É um diretório que agrupa os dispositivos de disco, e 8, 0 indica quantos discos e partições existem nele',
          'É um nó de bloco (b): major 8 identifica o driver, minor 0 a instância, e só root e o grupo disk acessam'
        ], 'A primeira letra b indica dispositivo de bloco; major e minor identificam driver e instância. O modo rw-rw---- libera root e grupo, não os demais.'),
        fill('q4', 'Complete com o diretório onde o kernel procura os arquivos de firmware que o driver pede com request_firmware.', 'ls /lib/___', ['firmware', '/firmware'], 'O kernel busca os blobs em /lib/firmware (geralmente instalados pelo pacote linux-firmware); se faltam, o dmesg registra a falha.'),
        mcq('q5', 'Na saída de exemplo de /proc/interrupts, as linhas "eth0-rx-0" e "eth0-rx-1" têm contagens crescendo em CPUs diferentes (PCI-MSIX). O que isso indica?', 'b', [
          'Há dois cabos conectados à placa, cada um em uma CPU diferente, e esse arranjo é exigido pelo padrão PCIe para as placas de rede',
          'A placa usa MSI-X com um vetor por fila de recepção, e cada fila é atendida por uma CPU, distribuindo a carga',
          'A IRQ está duplicada por erro e a CPU1 está repetindo o trabalho da CPU0, o que desperdiça processamento',
          'A placa usa linhas de interrupção físicas compartilhadas entre as filas, e o kernel alterna a CPU em rodízio'
        ], 'MSI-X permite vários vetores; placas de rede o usam por fila, e a afinidade (smp_affinity) distribui as filas entre CPUs.'),
        mcq('q6', 'Você conecta um dispositivo USB conhecido e o módulo certo é carregado sozinho. Qual é o mecanismo?', 'a', [
          'O kernel emite um uevent com MODALIAS derivado dos IDs; o udev chama o modprobe, que acha no modules.alias o módulo que casa',
          'O init lê /etc/modules, que lista todos os drivers existentes, e carrega cada um na ordem alfabética a cada conexão',
          'O próprio dispositivo grava o driver na memória do kernel por DMA, e o kernel só valida a assinatura depois',
          'O usuário precisa rodar insmod com o caminho do .ko; sem esse comando manual nenhum driver é associado a um dispositivo novo'
        ], 'O alias nasce dos IDs do dispositivo e é resolvido pelo modprobe com o índice de aliases dos módulos. Nada disso exige insmod manual.'),
        mcq('q7', 'Um notebook corporativo será usado em eventos, onde dispositivos desconhecidos podem ser plugados. Qual combinação defensiva faz sentido?', 'c', [
          'Desativar o udev, porque é ele que aceita qualquer dispositivo, e confiar no ID de fornecedor, pois um ID não pode ser forjado',
          'Montar todos os discos como leitura apenas, o que impediria um falso teclado de digitar comandos',
          'Política do USBGuard liberando só dispositivos conhecidos e IOMMU habilitada para limitar o alcance do DMA',
          'Instalar mais drivers e firmwares, já que um dispositivo só é perigoso quando o kernel não tem driver para ele'
        ], 'O USBGuard controla quais dispositivos são aceitos (inclusive classe e ID), e a IOMMU isola o DMA. IDs são declarados pelo dispositivo e podem ser forjados.'),
        fill('q8', 'Complete: em muitas placas ARM, o hardware não enumerável é descrito por um arquivo .dtb compilado a partir da Device ___.', 'Device ___ (.dts -> .dtb)', ['Tree', 'tree'], 'A Device Tree descreve dispositivos, endereços e interrupções; o bootloader a entrega ao kernel. Em x86, essa função costuma ser do ACPI.')
      ]
    },
    {
      id: 'lna-07-rede-no-kernel',
      title: 'A pilha de rede do kernel',
      goal: 'Acompanhar um pacote pela pilha (NIC, NAPI, sockets), entender buffers, netfilter, conntrack, qdisc/tc, offloads, sysctl, ss -ti, namespaces de rede e XDP.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'O caminho de um pacote na recepção',
            'A placa de rede (NIC) recebe o quadro e, por DMA, o coloca em um anel de recepção (RX ring) na memória, sem usar a CPU para copiar. Avisa por interrupção; para não ser inundado de interrupções sob carga, o kernel usa NAPI: desliga a interrupção daquela fila e passa a fazer POLLING em lote, em contexto de softirq, voltando às interrupções quando a fila esvazia. O driver monta uma estrutura sk_buff para cada pacote e o entrega à pilha: camada de enlace, IP (roteamento, com os ganchos do netfilter), TCP ou UDP e, por fim, a fila de recepção do socket certo; a aplicação lê com recv()/read(). Se qualquer fila encher no caminho (anel, backlog de softirq, buffer do socket), o pacote é descartado, e os contadores de cada estágio dizem onde.',
            'NIC -DMA-> anel RX -IRQ-> NAPI (polling, softirq) -> driver (sk_buff)\n  -> IP (netfilter, roteamento) -> TCP/UDP -> fila do socket -> recv() da aplicação\nip -s link show eth0     # RX: bytes packets errors dropped (exemplo)'
          ),
          sl(
            'Sockets e buffers',
            'Cada socket tem um buffer de recepção e um de envio (SO_RCVBUF e SO_SNDBUF, configuráveis por setsockopt). Os limites globais ficam em net.core.rmem_max e wmem_max, e o TCP faz ajuste automático dentro de net.ipv4.tcp_rmem e tcp_wmem (mínimo, padrão, máximo). Para sockets em escuta, o backlog de conexões prontas aguardando accept() é limitado pelo argumento de listen() e por net.core.somaxconn. No ss -tn, a coluna Recv-Q de uma conexão é a quantidade de bytes recebidos que a aplicação AINDA NÃO leu (Recv-Q alto e crescente aponta uma aplicação lenta, não a rede) e Send-Q os bytes enviados ainda não confirmados pelo par. Buffer maior aumenta o que cabe em trânsito (útil em enlaces de alta latência), mas consome memória e pode aumentar a latência.',
            'ss -tn                              # exemplo (varia)\n# State  Recv-Q Send-Q Local:Port     Peer:Port\n# ESTAB  0      0      10.0.0.5:443   198.51.100.7:51000\n# ESTAB  90000  0      10.0.0.5:8080  198.51.100.9:42000  <- app não está lendo'
          ),
          sl(
            'netfilter e conntrack',
            'O netfilter é o framework de ganchos do kernel por onde passam os pacotes: PREROUTING (chegada, antes do roteamento), INPUT (destinado à máquina), FORWARD (que será roteado), OUTPUT (gerado localmente) e POSTROUTING (saída, após o roteamento). iptables e nftables registram regras nesses ganchos (filtrar, NAT). O conntrack, módulo de rastreamento de conexões, mantém uma tabela com o estado de cada fluxo (NEW, ESTABLISHED, RELATED), o que permite firewall com estado e NAT, que precisa lembrar as traduções. A tabela tem tamanho máximo (nf_conntrack_max); em servidores com muitas conexões curtas, ela pode encher, e o dmesg registra "nf_conntrack: table full, dropping packet" enquanto novos fluxos são descartados. Os valores atuais estão em /proc/sys/net/netfilter (nf_conntrack_count e nf_conntrack_max).',
            'cat /proc/sys/net/netfilter/nf_conntrack_count   # conexões rastreadas (exemplo: 1500)\ncat /proc/sys/net/netfilter/nf_conntrack_max     # limite (exemplo: 262144)\nsudo conntrack -L | head -3                       # pacote conntrack-tools'
          ),
          sl(
            'qdisc, tc e offloads',
            'Na SAÍDA, cada interface tem uma disciplina de fila (qdisc) que decide a ordem e o ritmo de transmissão dos pacotes. Muitas distribuições usam fq_codel como padrão, que combate o bufferbloat (filas longas demais que inflam a latência). O comando tc configura qdiscs e classes: tbf e htb para limitar e repartir banda, netem para SIMULAR atraso, perda e reordenação em testes. AVISO: aplicar netem ou qualquer qdisc na interface de gerência pode derrubar sua sessão SSH: teste em VM ou laboratório. Offloads transferem trabalho para a NIC ou agrupam pacotes: TSO/GSO deixam a pilha tratar segmentos grandes, que a NIC (ou a pilha, no fim) fatia, e o GRO agrupa pacotes recebidos do mesmo fluxo antes de subir a pilha. Efeito visível: um tcpdump na própria máquina pode mostrar "pacotes" maiores que o MTU, e isso é normal. ethtool -k lista os offloads.',
            'tc qdisc show dev eth0                      # ex.: qdisc fq_codel 0: root ...\n# LAB apenas (pode derrubar SSH): atraso simulado de 100 ms\nsudo tc qdisc add dev eth0 root netem delay 100ms\nsudo tc qdisc del dev eth0 root              # remove\nethtool -k eth0 | grep -E "segmentation|receive-offload"'
          ),
          sl(
            'sysctl de rede e ss -ti',
            'Parâmetros úteis: net.core.somaxconn (fila de conexões aceitas), net.core.rmem_max/wmem_max, net.ipv4.tcp_rmem/tcp_wmem, net.ipv4.tcp_congestion_control (algoritmo, como cubic ou bbr, conforme os módulos disponíveis), net.ipv4.ip_local_port_range (portas efêmeras de saída) e net.ipv4.tcp_syncookies (defesa contra inundação de SYN). Regra de ouro: MEÇA antes de ajustar; só mude um parâmetro por vez, com evidência do gargalo, registre o valor antigo e persista em /etc/sysctl.d/. O ss -ti mostra, por conexão, a visão interna do TCP: rtt:A/B (RTT suavizado e variância, em ms), cwnd:N (janela de congestionamento, em segmentos: quanto o remetente pode enviar sem confirmação), retrans (retransmissões), além de bytes enviados e recebidos. cwnd pequena com retransmissões sugere perda na rede; rtt alto sugere distância ou fila; cwnd limitada com rtt baixo pode ser limite da aplicação ou do buffer.',
            'ss -ti dst 198.51.100.7             # exemplo (varia)\n# ESTAB 0 0 10.0.0.5:443 198.51.100.7:51000\n#  cubic wscale:7,7 rtt:20/5 cwnd:10 bytes_sent:120000 retrans:0/2\nsysctl net.ipv4.tcp_congestion_control   # = cubic (exemplo)'
          ),
          sl(
            'Namespaces de rede, veth, bridge, VLAN e VXLAN',
            'Um namespace de rede (netns) é uma pilha completa isolada: suas próprias interfaces, rotas, regras de firewall, tabela de conexões e portas. É a base da rede dos containers. ip netns add cria um, e ip netns exec roda um comando dentro dele. Um par veth é um cabo virtual: o que entra em uma ponta sai na outra, e cada ponta pode ficar em um namespace diferente. Uma bridge é um switch virtual de camada 2 no kernel (docker0 é um exemplo): une várias interfaces no mesmo domínio de broadcast. VLAN (802.1Q) segmenta a camada 2 com uma etiqueta numérica, criada com ip link add ... type vlan id N. VXLAN encapsula quadros Ethernet em pacotes UDP para criar redes de camada 2 sobrepostas (overlay) entre hosts distintos, usada por redes de orquestradores.',
            'sudo ip netns add lab\nsudo ip link add v0 type veth peer name v1\nsudo ip link set v1 netns lab\nsudo ip netns exec lab ip addr          # só enxerga v1 (e lo)\nsudo ip link add link eth0 name eth0.10 type vlan id 10'
          ),
          sl(
            'XDP e eBPF na rede',
            'O XDP (eXpress Data Path) executa um programa eBPF no ponto mais cedo possível da recepção, dentro do driver, ANTES de o kernel alocar o sk_buff e antes do netfilter. O programa decide por pacote: descartar (XDP_DROP, ótimo para mitigar inundações), deixar passar (XDP_PASS), devolver pela mesma interface ou redirecionar (balanceadores de carga). Como evita boa parte do custo da pilha, é muito mais rápido que filtros mais acima. Projetos como Cilium usam eBPF para rede e segurança em clusters. Limitações: precisa de driver compatível para o melhor desempenho, privilégios (CAP_NET_ADMIN e CAP_BPF ou root) e cuidado, pois um programa errado descarta tráfego legítimo. O verificador do eBPF garante que o programa não trave o kernel (veja a lição de eBPF).',
            'sudo ip link set dev eth0 xdp obj filtro.o sec xdp   # carrega (LAB; filtro.o é um exemplo)\nsudo ip link set dev eth0 xdp off                      # remove\nip link show eth0                                      # mostra "xdp" quando carregado'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é o papel do NAPI no recebimento de pacotes?', 'b', [
          'Traduzir endereços de rede para os pacotes que atravessam o roteador',
          'Trocar interrupções por polling em lote sob carga, reduzindo a sobrecarga de uma interrupção por pacote',
          'Aumentar o tamanho do buffer do socket de acordo com a latência do enlace, evitando perdas quando a aplicação demora a ler',
          'Reordenar os pacotes TCP antes de entregar à aplicação'
        ], 'Com NAPI, a NIC interrompe uma vez, o kernel passa a consultar a fila em lote (softirq) e reativa a interrupção quando esvazia. NAT, buffers e reordenação são outros mecanismos.'),
        mcq('q2', 'No ss -tn, uma conexão mostra Recv-Q = 90000 e o valor continua crescendo. Qual é a leitura mais provável?', 'd', [
          'A rede está perdendo pacotes, e o par precisa retransmitir, o que também faria o Send-Q crescer',
          'O firewall está segurando os pacotes no conntrack',
          'A janela de congestionamento (cwnd) do remetente está pequena demais',
          'A aplicação recebe os dados mais rápido do que consegue ler'
        ], 'Recv-Q são bytes já recebidos e ainda não lidos pela aplicação: acumular indica um processo lento ou bloqueado. Perda de rede apareceria como retrans e cwnd baixa.'),
        mcq('q3', 'Um servidor com muitas conexões curtas começa a perder novos fluxos e o dmesg mostra "nf_conntrack: table full, dropping packet". O que está acontecendo?', 'c', [
          'O buffer de recepção dos sockets (rmem_max) está pequeno demais',
          'O escalonador de E/S está saturado pelos logs de rede',
          'A tabela de rastreamento de conexões atingiu nf_conntrack_max e os novos fluxos estão sendo descartados',
          'A fila de saída (qdisc) está cheia, e o netem está descartando pacotes'
        ], 'O conntrack tem um limite de entradas. Ao encher, descarta fluxos novos. A solução passa por medir (nf_conntrack_count), ajustar o limite e/ou os timeouts, ou evitar rastrear fluxos que não precisam.'),
        fill('q4', 'Complete com o parâmetro sysctl que limita a fila de conexões aceitas por sockets em escuta (net.core.___).', 'sysctl net.core.___', ['somaxconn'], 'net.core.somaxconn é o teto do backlog que listen() pode pedir.'),
        mcq('q5', 'Um tcpdump na própria máquina receptora mostra pacotes de 30 KB, maiores que o MTU de 1500 bytes. Qual é a explicação?', 'a', [
          'Offloads como GRO/GSO agrupam segmentos antes da captura; a pilha trata segmentos grandes e a NIC fatia na saída',
          'O MTU foi aumentado automaticamente pelo conntrack para melhorar a vazão',
          'O XDP está fundindo pacotes de fluxos diferentes em um só quadro',
          'O fq_codel junta pacotes de diferentes conexões para reduzir a latência'
        ], 'GRO (recepção) e TSO/GSO (envio) fazem a pilha lidar com segmentos grandes; na rede continuam sendo quadros de até o MTU. É normal e visível em capturas locais.'),
        mcq('q6', 'Em ss -ti aparece "rtt:20/5 cwnd:10 retrans:0/2". Qual é a leitura correta?', 'b', [
          'RTT de 20 segundos, com 10 conexões simultâneas e 2 falhas de DNS',
          'RTT suavizado de 20 ms com variância de 5 ms, janela de congestionamento de 10 segmentos e retransmissões registradas ao longo da vida da conexão',
          'Latência de disco de 20 ms, 10 threads e 2 processos mortos pelo OOM killer',
          'Porta de origem 20, janela de 10 bytes e 2 pacotes pendentes no firewall'
        ], 'rtt:A/B é RTT e variância em ms; cwnd é medida em segmentos; retrans indica retransmissões (atual/total). Perda de pacotes tende a reduzir a cwnd.'),
        mcq('q7', 'Qual descrição de componentes de rede virtual está correta?', 'c', [
          'Um par veth é um switch com muitas portas, e a bridge é um cabo de duas pontas',
          'Um namespace de rede compartilha as rotas do host, mas isola só o hostname',
          'Um par veth funciona como cabo virtual entre pontas que podem estar em namespaces diferentes, e a bridge é um switch virtual de camada 2',
          'VXLAN é um tipo de qdisc que limita banda por VLAN'
        ], 'veth são pares conectados (cabo). Bridge une interfaces em um domínio L2. Namespaces de rede têm pilha própria. VXLAN encapsula L2 em UDP.'),
        fill('q8', 'Complete com o subcomando do ip que cria um namespace de rede chamado lab.', 'sudo ip ___ add lab', ['netns'], 'ip netns gerencia namespaces de rede nomeados; ip netns exec roda comandos dentro deles.')
      ]
    },
    {
      id: 'lna-08-namespaces-cgroups',
      title: 'Namespaces e cgroups',
      goal: 'Dominar os 8 tipos de namespace, as ferramentas de inspeção, a hierarquia cgroups v2 com seus arquivos de controle e como containers combinam tudo.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Os 8 tipos de namespace',
            'Um namespace faz um recurso global do kernel parecer privado para um conjunto de processos. São oito: mnt (a árvore de pontos de montagem: cada processo pode ver um sistema de arquivos diferente), pid (a numeração de processos: o primeiro processo do namespace é o PID 1 e só enxerga os seus descendentes), net (interfaces, rotas, firewall e portas), uts (hostname e nome de domínio), ipc (filas de mensagens, semáforos e memória compartilhada System V e POSIX), user (mapeamento de UIDs/GIDs: o root de dentro pode ser um usuário comum de fora), cgroup (a visão da raiz da hierarquia de cgroups) e time (deslocamentos dos relógios monotônicos e de boot, útil em migração de containers). Cada namespace isola UM recurso: um processo pode compartilhar o net do host e ter mnt próprio. Namespaces limitam o que o processo VÊ; o quanto ele USA é papel dos cgroups.',
            'mnt   -> pontos de montagem        pid  -> árvore de PIDs\nnet   -> pilha de rede              uts  -> hostname\nipc   -> IPC System V/POSIX         user -> UID/GID mapeados\ncgroup-> raiz da hierarquia         time -> offsets de relógio'
          ),
          sl(
            'unshare, nsenter, lsns e /proc/<pid>/ns',
            'Cada processo expõe seus namespaces como links simbólicos em /proc/<pid>/ns (mnt, pid, net, uts, ipc, user, cgroup, time); dois processos com o MESMO número entre colchetes compartilham o namespace. O comando lsns lista os namespaces do sistema. As syscalls são clone (flags CLONE_NEW*, para criar o processo já em novos namespaces), unshare (o processo atual sai de namespaces compartilhados) e setns (entrar em um existente). Os comandos unshare e nsenter são as interfaces de shell: unshare --pid --fork --mount-proc bash cria um shell em novo PID namespace (com um /proc próprio), e nsenter -t PID -n comando executa um comando dentro do namespace de rede do processo PID, ótimo para depurar a rede de um container. unshare --user --map-root-user cria um user namespace em que você parece ser root.',
            'ls -l /proc/self/ns | head -3            # exemplo (varia)\n# cgroup -> cgroup:[4026531835]\n# ipc    -> ipc:[4026531839]\n# mnt    -> mnt:[4026531841]\nsudo unshare --pid --fork --mount-proc bash   # LAB: no novo shell, ps mostra PID 1\nsudo nsenter -t 1234 -n ip addr               # rede do processo 1234\nlsns -t net'
          ),
          sl(
            'cgroups v2: a hierarquia unificada',
            'Os cgroups (control groups) agrupam processos para MEDIR e LIMITAR recursos. No cgroups v2 há uma única hierarquia, normalmente montada em /sys/fs/cgroup (tipo de sistema de arquivos cgroup2). Cada diretório é um cgroup; criar um subdiretório cria um filho. O arquivo cgroup.procs lista os PIDs do grupo e escrever um PID nele move o processo. Controladores (cpu, memory, io, pids, cpuset...) precisam ser habilitados para os filhos por cgroup.subtree_control do pai; em v2, um cgroup com controladores habilitados para os filhos mantém seus processos nos filhos (folhas). No v1, cada controlador tinha a própria hierarquia, o que dificultava a coerência. /proc/<pid>/cgroup mostra a qual cgroup o processo pertence.',
            'stat -fc %T /sys/fs/cgroup          # cgroup2fs (v2)\ncat /sys/fs/cgroup/cgroup.controllers  # ex.: cpuset cpu io memory pids\ncat /proc/self/cgroup                  # ex.: 0::/user.slice/user-1000.slice/...\n# LAB, como root:\nmkdir /sys/fs/cgroup/teste && echo "+memory +cpu" > /sys/fs/cgroup/cgroup.subtree_control'
          ),
          sl(
            'Arquivos de controle: cpu.max, memory.max, memory.high, pids.max',
            'cpu.max recebe "quota período" em microssegundos: o grupo pode usar no máximo quota µs de CPU a cada período µs (padrão de período: 100000). "50000 100000" = 50% de UMA CPU; "200000 100000" = 2 CPUs inteiras; "max 100000" = sem limite. A razão quota/período é o número de CPUs. cpu.weight define a divisão proporcional quando há disputa. memory.max é o limite RÍGIDO: ao atingi-lo, o kernel tenta recuperar memória e, se não conseguir, aciona o OOM killer DENTRO do cgroup (o host não é afetado). memory.high é um limite BRANDO: acima dele o grupo é estrangulado e forçado a recuperar memória, sem OOM imediato. memory.current mostra o uso, e memory.events conta ocorrências (inclusive oom_kill). pids.max limita o número de tarefas e contém uma fork bomb. io.max e io.weight limitam E/S por dispositivo (identificado por major:minor).',
            '# LAB, como root (cgroup "teste" criado antes):\necho "50000 100000" > /sys/fs/cgroup/teste/cpu.max   # 0,5 CPU\necho 200M > /sys/fs/cgroup/teste/memory.max\necho 150M > /sys/fs/cgroup/teste/memory.high\necho 100 > /sys/fs/cgroup/teste/pids.max\necho $$ > /sys/fs/cgroup/teste/cgroup.procs        # move este shell\ncat /sys/fs/cgroup/teste/memory.events             # oom_kill 0 (exemplo)'
          ),
          sl(
            'systemd e slices',
            'O systemd é o gerente de cgroups das distribuições modernas: cada serviço roda em seu próprio cgroup (.service), agrupado em slices: system.slice (serviços do sistema), user.slice (sessões de usuários) e machine.slice (VMs e containers registrados). As propriedades das units se traduzem em arquivos de controle: CPUQuota=50% vira cpu.max "50000 100000", MemoryMax= vira memory.max, MemoryHigh= vira memory.high e TasksMax= vira pids.max. systemd-cgls mostra a árvore, systemd-cgtop o consumo por grupo e systemctl set-property aplica limites em um serviço em execução. systemd-run --scope -p MemoryMax=200M comando roda um comando avulso sob limite. Preferir o systemd a escrever direto em /sys/fs/cgroup evita conflito com o gerente.',
            'systemd-cgls --no-pager | head -5\nsystemctl set-property meuapp.service MemoryMax=500M CPUQuota=150%\nsystemd-run --scope -p MemoryMax=200M -p CPUQuota=50% ./tarefa.sh'
          ),
          sl(
            'Como containers combinam tudo',
            'Um container é um processo comum cercado por mecanismos do kernel. O runtime (runc, por exemplo) cria o processo com clone/unshare em novos namespaces (mnt, pid, net, uts, ipc e, no modo rootless, user), troca a raiz do sistema de arquivos para a imagem (pivot_root), coloca o processo em um cgroup com limites, reduz capabilities, aplica seccomp e um perfil de LSM. Os limites que você pede se tornam arquivos de cgroup: docker run --memory 256m define memory.max em 256 MiB; docker run --cpus 1.5 define cpu.max como "150000 100000" (1,5 CPU). Se o container exceder a memória, o OOM killer age só dentro do cgroup dele: o processo é morto com SIGKILL (o código de saída aparece como 137, ou seja, 128 + 9), e memory.events registra oom_kill, sem derrubar o host.',
            'docker run --memory 256m --cpus 1.5 --pids-limit 100 imagem\n# memory.max = 268435456  |  cpu.max = "150000 100000"  |  pids.max = 100\ndocker inspect -f \'{{.State.OOMKilled}} {{.State.ExitCode}}\' app   # true 137 (exemplo)'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual namespace isola o hostname e o nome de domínio, e qual isola a numeração de processos?', 'a', [
          'uts isola hostname e domínio; pid isola a numeração e a árvore de processos',
          'ipc isola hostname e domínio; net isola a numeração dos processos, e user isola a árvore de montagens',
          'user isola hostname e domínio; mnt isola a numeração de PIDs',
          'uts isola a pilha de rede; pid isola as filas de mensagens System V, e ipc isola os PIDs'
        ], 'uts = hostname/domainname; pid = árvore de PIDs; net = rede; ipc = IPC System V/POSIX; mnt = montagens; user = UID/GID; cgroup = raiz da hierarquia; time = relógios.'),
        mcq('q2', 'Dentro de um user namespace, um processo aparece como UID 0 (root). O que isso significa fora do namespace?', 'c', [
          'Ele tem privilégios totais sobre todo o host, pois UID 0 é UID 0 em muitos lugar',
          'Ele não consegue executar nenhuma operação privilegiada dentro do namespace',
          'O UID 0 interno é mapeado para um UID comum do host, e os privilégios valem só para recursos do namespace, e os privilégios valem somente para recursos do namespace',
          'Ele herda automaticamente CAP_SYS_ADMIN no host inteiro, mas só durante o boot, e o perde ao montar o primeiro volume'
        ], 'O mapeamento de UIDs faz o "root" interno ser um usuário comum no host. As capabilities são válidas apenas sobre recursos pertencentes ao namespace, base do modo rootless.'),
        mcq('q3', 'O arquivo cpu.max de um cgroup contém "150000 100000". Qual é o limite efetivo?', 'b', [
          '150% de uma CPU só nos primeiros 100 ms de cada segundo, liberando o restante do tempo',
          '1,5 CPU: o grupo pode consumir até 150000 µs de CPU a cada período de 100000 µs',
          '15% de uma CPU, pois a razão é período/quota, ou seja, 15000 microssegundos por segundo',
          'Sem limite, pois o valor máximo permitido é 100000'
        ], 'Quota/período = 150000/100000 = 1,5 CPU. "max 100000" seria sem limite; "50000 100000" seria 0,5 CPU.'),
        fill('q4', 'Complete com o nome do arquivo de controle que define o limite RÍGIDO de memória de um cgroup v2.', 'echo 200M > /sys/fs/cgroup/teste/memory.___', ['max'], 'memory.max é o teto rígido; ao atingi-lo sem poder recuperar memória, o OOM killer atua dentro do cgroup. memory.high apenas estrangula.'),
        mcq('q5', 'Qual a diferença entre memory.high e memory.max?', 'd', [
          'memory.high é o limite rígido que mata o processo, e memory.max só gera um aviso no log do cgroup, sem acionar o OOM killer',
          'memory.high vale para memória de arquivo e memory.max para memória de swap',
          'Ambos aplicam OOM kill imediato, e a diferença está só na unidade usada',
          'Acima de memory.high o grupo é estrangulado e forçado a recuperar memória; memory.max é o teto com OOM dentro do cgroup'
        ], 'memory.high é brando (reclamação forçada e lentidão); memory.max é rígido. Usar os dois dá uma zona de pressão antes de matar processos.'),
        mcq('q6', 'Um container com --memory 256m termina com código de saída 137 e docker inspect mostra OOMKilled true. O que ocorreu?', 'a', [
          'O processo ultrapassou memory.max do seu cgroup e foi morto com SIGKILL (128 + 9) pelo OOM killer, sem afetar o host',
          'O host ficou sem memória e o kernel reiniciou o container por política de recuperação, após registrar o evento no log do daemon',
          'O container recebeu SIGTERM do systemd por tempo de execução excessivo',
          'O namespace pid foi destruído porque o processo 1 do host terminou'
        ], '137 = 128 + 9 (SIGKILL). OOMKilled true indica que o OOM do cgroup agiu. O limite atua só no grupo.'),
        mcq('q7', 'Você quer inspecionar a rede de um container em execução usando as ferramentas do host (ip, ss). Qual comando faz isso?', 'b', [
          'unshare --pid -t PID ip addr, que cria um PID namespace igual ao do processo e executa o comando lá dentro',
          'nsenter -t PID -n ip addr, que executa o comando dentro do namespace de rede do processo',
          'lsns -t cgroup ip addr, que lista as interfaces do cgroup do processo, e permite filtrar as interfaces por nome',
          'cat /proc/PID/ns/net, que imprime as interfaces e endereços do container'
        ], 'nsenter entra em namespaces existentes (aqui -n, net). unshare cria novos namespaces; /proc/PID/ns/net é só um link que identifica o namespace.'),
        fill('q8', 'Complete com o diretório de /proc/<pid> que contém os links dos namespaces do processo.', 'ls -l /proc/self/___', ['ns', '/ns'], 'Cada arquivo em /proc/<pid>/ns (mnt, pid, net...) é um link com o identificador do namespace; ids iguais indicam namespace compartilhado.')
      ]
    },
    {
      id: 'lna-09-seguranca-kernel',
      title: 'Segurança do kernel',
      goal: 'Entender capabilities, no_new_privs, seccomp, LSMs (SELinux e AppArmor), user namespaces, proteções de memória, lockdown, auditd e defesa em profundidade.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Capabilities: dividindo o poder do root',
            'Historicamente, o UID 0 (root) pode tudo. As capabilities dividem esse poder em dezenas de privilégios independentes que podem ser dados a um processo isoladamente. Exemplos: CAP_NET_BIND_SERVICE (escutar portas abaixo de 1024), CAP_NET_ADMIN (configurar interfaces, rotas, firewall), CAP_DAC_OVERRIDE (ignorar permissões de arquivo), CAP_SYS_PTRACE (ptrace em outros processos), CAP_SETUID, CAP_BPF e CAP_PERFMON (eBPF e perf) e CAP_SYS_ADMIN, enorme e vaga, quase um "novo root": deve ser evitada. Um processo tem conjuntos (permitted, effective, inheritable, bounding e ambient); o efetivo é o que vale na prática, visível em CapEff de /proc/<pid>/status. setcap concede capabilities a um executável, getcap lista, e capsh --print mostra as do shell atual. Mínimo privilégio: um serviço web que só precisa de uma porta baixa deve ter CAP_NET_BIND_SERVICE e mais nada, rodando como usuário comum.',
            'getpcaps $$                                   # capabilities do shell atual\ngrep Cap /proc/self/status                    # CapEff: 0000000000000000 (usuário comum, exemplo)\nsudo setcap cap_net_bind_service=+ep /usr/local/bin/meuapp\ngetcap /usr/local/bin/meuapp'
          ),
          sl(
            'seccomp-bpf e no_new_privs',
            'O seccomp restringe quais syscalls um processo pode fazer. No modo filter (seccomp-bpf), o processo instala um programa BPF que examina o número e os argumentos de cada syscall e decide a ação: permitir, devolver um errno, matar o processo, gerar um sinal ou apenas registrar. Docker, Podman, navegadores e o systemd (SystemCallFilter=) o usam para reduzir a superfície de ataque: se uma vulnerabilidade só existe em uma syscall que o serviço nunca usa, ela deixa de ser alcançável. Em /proc/<pid>/status, a linha Seccomp mostra 0 (desligado), 1 (modo estrito) ou 2 (filtro). O no_new_privs (prctl PR_SET_NO_NEW_PRIVS, NoNewPrivileges=yes no systemd) impede que o processo e seus filhos GANHEM privilégios por execve (binários setuid, capabilities de arquivo). É exigido para instalar um filtro seccomp sem ser root, porque, sem ele, um programa filtrado poderia executar um binário setuid e burlar a restrição.',
            'grep -E "Seccomp|NoNewPrivs" /proc/self/status   # exemplo: Seccomp: 0, NoNewPrivs: 0\n# serviço systemd (conceito):\nNoNewPrivileges=yes\nSystemCallFilter=@system-service'
          ),
          sl(
            'LSMs: SELinux e AppArmor (controle de acesso obrigatório)',
            'Os módulos de segurança do Linux (LSMs) acrescentam o controle de acesso OBRIGATÓRIO (MAC) às permissões tradicionais (DAC): mesmo o dono do arquivo, ou o root, só faz o que a política permite. O SELinux rotula tudo (processos, arquivos, portas) com um contexto usuário:papel:tipo:nível; o núcleo é a imposição de TIPOS: um processo no domínio httpd_t só acessa objetos cujos tipos a política liberar (por exemplo, httpd_sys_content_t), então um servidor web comprometido não lê /home nem outros serviços. Modos: enforcing (aplica e registra), permissive (só registra: bom para depurar) e disabled. ls -Z e ps -Z mostram contextos, getenforce o modo. É o padrão de RHEL, Fedora e derivadas. O AppArmor confina programas por perfis baseados em CAMINHOS de arquivos, mais simples de escrever; modos enforce e complain (equivalente ao permissive); aa-status lista; é o padrão de Ubuntu, Debian e SUSE. Ambos limitam danos mesmo quando o serviço é explorado.',
            'getenforce                          # Enforcing (exemplo)\nls -Z /var/www/html                 # system_u:object_r:httpd_sys_content_t:s0 ...\nps -eZ | grep httpd                 # ...:httpd_t:s0 ... httpd\nsudo aa-status                      # perfis em enforce/complain (AppArmor)'
          ),
          sl(
            'User namespaces e Landlock',
            'Os user namespaces permitem a um usuário comum criar um ambiente onde ele parece ser root e tem capabilities sobre os recursos DAQUELE namespace. Benefícios: containers rootless, sandboxes de navegadores e de ferramentas de build sem privilégio real no host. Riscos: como dá acesso a funcionalidades do kernel antes restritas ao root (criar namespaces de rede e montagens, por exemplo), amplia a superfície de ataque, e várias vulnerabilidades do kernel foram exploradas a partir de um user namespace não privilegiado. Por isso há controles: user.max_user_namespaces=0 desativa, e algumas distribuições têm um parâmetro próprio para restringir os não privilegiados; avalie o equilíbrio entre rootless e superfície. O Landlock é um LSM de sandbox SEM privilégio: o próprio processo restringe seu acesso ao sistema de arquivos (e, em versões mais novas, à rede), de modo irreversível, útil para aplicações que se autolimitam.',
            'cat /proc/sys/user/max_user_namespaces           # exemplo: 15000 (0 = desativado)\nunshare --user --map-root-user id -u                # 0 dentro; usuário comum fora'
          ),
          sl(
            'Proteções de memória: ASLR, KASLR, NX, canário, SMEP/SMAP',
            'Várias defesas tornam a exploração de falhas de memória mais difícil. ASLR randomiza os endereços de pilha, heap e bibliotecas a cada execução, então o atacante não sabe onde está o código que quer reutilizar (kernel.randomize_va_space = 2 é a randomização completa). KASLR faz o mesmo para o próprio kernel. NX (bit de não execução) marca dados e pilha como não executáveis, impedindo rodar bytes injetados. O stack protector coloca um "canário" na pilha, verificado antes de a função retornar: um estouro de buffer o altera e o programa aborta. SMEP impede o kernel de executar código de páginas do usuário e SMAP impede o kernel de acessar dados do usuário sem permissão explícita: bloqueiam técnicas clássicas de escalada local. Nenhuma é infalível; juntas elevam o custo do ataque. Compilar programas como PIE permite que o próprio executável também seja randomizado.',
            'cat /proc/sys/kernel/randomize_va_space     # 2 = completa (exemplo)\ncat /proc/sys/kernel/kptr_restrict           # oculta endereços do kernel (valor varia)'
          ),
          sl(
            'Lockdown, Secure Boot, módulos assinados e auditd',
            'O modo lockdown impede que até o root altere o kernel em execução: bloqueia carregar módulos não assinados, acesso a /dev/mem e kexec sem assinatura, entre outros; os modos são integrity e confidentiality (o segundo também bloqueia leituras que vazariam memória do kernel), e o estado aparece em /sys/kernel/security/lockdown. Ele complementa o Secure Boot (firmware valida o bootloader, que valida o kernel) e a assinatura de módulos (modinfo -F signer mostra quem assinou): só código confiável entra no kernel. Para DETECTAR, o auditd registra eventos do kernel segundo regras: -w /etc/passwd -p wa -k identidade observa escritas e mudanças de atributos nesse arquivo, e -a always,exit -F arch=b64 -S execve -k exec registra execuções; ausearch -k busca e aureport resume. Privacidade (LGPD): logs de auditoria contêm nomes de usuário, comandos e caminhos; restrinja o acesso, defina retenção e colete só o necessário.',
            'cat /sys/kernel/security/lockdown        # [none] integrity confidentiality (exemplo)\nsudo auditctl -w /etc/passwd -p wa -k identidade\nsudo ausearch -k identidade --start today\nmodinfo -F signer ext4'
          ),
          sl(
            'Atualizações, livepatch e defesa em profundidade',
            'Vulnerabilidades de escalada de privilégio local (um usuário sem poder vira root) costumam vir de erros de memória no kernel (uso após liberação, estouro de buffer) ou de condições de corrida. Não existe camada única de proteção. O conjunto de defesas é: manter o kernel atualizado (o livepatch aplica correções de funções do kernel sem reiniciar, em serviços oferecidos pelas distribuições, para encurtar a janela de exposição entre o aviso e o reboot planejado); reduzir a superfície (descarregar ou bloquear módulos desnecessários, restringir user namespaces e eBPF não privilegiado); aplicar mínimo privilégio (capabilities, não root, no_new_privs); confinar com seccomp e LSM (para que a exploração de um serviço não alcance o resto); assinar e proteger o boot; e monitorar (auditd, alertas). Se uma camada falhar, a seguinte ainda limita o dano.',
            'uname -r                         # versão do kernel em uso (compare com o pacote instalado)\nsysctl kernel.unprivileged_bpf_disabled   # 1 ou 2 = só privilegiados (exemplo)\n# camadas: atualizar > reduzir superfície > mínimo privilégio > seccomp/LSM > monitorar'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um serviço precisa escutar a porta 443 e nada mais de privilegiado. Qual é a configuração alinhada ao mínimo privilégio?', 'c', [
          'Rodar como root, pois só o UID 0 pode abrir portas baixas',
          'Conceder CAP_SYS_ADMIN, que cobre todas as operações de rede e administração necessárias',
          'Rodar como usuário comum com apenas CAP_NET_BIND_SERVICE',
          'Dar CAP_DAC_OVERRIDE ao serviço para que ele ignore as restrições de porta'
        ], 'CAP_NET_BIND_SERVICE permite portas baixas. CAP_SYS_ADMIN é ampla demais (quase root) e CAP_DAC_OVERRIDE trata de permissões de arquivo.'),
        mcq('q2', 'Para que serve o seccomp-bpf e por que o no_new_privs costuma acompanhá-lo?', 'b', [
          'Cifra as chamadas de sistema do processo, e o no_new_privs guarda a chave',
          'Filtra as syscalls permitidas, e no_new_privs impede ganhar privilégios por execve (setuid)',
          'Reserva memória para o processo, e o no_new_privs limita o número de processos filhos e o uso de CPU',
          'Verifica a integridade dos módulos do kernel, e o no_new_privs bloqueia novos módulos durante o carregamento'
        ], 'seccomp reduz a superfície do kernel acessível. Sem no_new_privs, um programa filtrado poderia executar um binário setuid e escapar da restrição, por isso ele é exigido para filtros sem root.'),
        mcq('q3', 'Qual descrição diferencia corretamente SELinux e AppArmor?', 'a', [
          'SELinux rotula objetos com contextos e impõe tipos; AppArmor usa perfis baseados em caminhos de arquivos',
          'SELinux usa perfis por caminho, e AppArmor usa rótulos de tipos nos arquivos',
          'SELinux só funciona em containers, e AppArmor só funciona fora deles',
          'SELinux substitui as permissões tradicionais, e AppArmor só atua quando o usuário é root, enquanto ambos dispensam auditoria'
        ], 'Ambos são MAC e somam-se ao DAC (não o substituem). O SELinux é baseado em rótulos e tipos; o AppArmor, em perfis por caminho. Ambos têm modo de teste (permissive/complain).'),
        fill('q4', 'Complete com o comando que concede uma capability a um executável.', 'sudo ___ cap_net_bind_service=+ep /usr/local/bin/meuapp', ['setcap'], 'setcap grava a capability no atributo do arquivo (getcap lista). Concede só o necessário, em vez de usar setuid root.'),
        mcq('q5', 'Qual proteção marca a pilha e os dados como NÃO executáveis, impedindo que bytes injetados sejam rodados?', 'd', [
          'ASLR, que randomiza os endereços a cada execução',
          'O canário de pilha, que detecta um estouro antes do retorno da função',
          'SMAP, que proíbe o kernel de ler dados do usuário',
          'NX (bit de não execução)'
        ], 'NX impede executar regiões de dados. ASLR dificulta saber endereços, o canário detecta corrupção de pilha e SMEP/SMAP protegem a fronteira kernel/usuário.'),
        mcq('q6', 'Qual afirmação sobre user namespaces e Landlock está correta?', 'b', [
          'User namespaces dão root real sobre o host a usuários comuns, e o Landlock exige root para restringir o próprio processo',
          'User namespaces viabilizam containers rootless e sandboxes, mas ampliam a superfície de ataque do kernel; o Landlock permite ao processo restringir a si mesmo sem privilégio',
          'User namespaces eliminam a necessidade de capabilities, e o Landlock substitui o SELinux em todos os casos',
          'User namespaces só afetam o hostname, e o Landlock só afeta a rede'
        ], 'Em user namespaces os privilégios valem sobre recursos do namespace, o que é útil, mas expõe funcionalidades do kernel; por isso há controles. Landlock é um sandbox sem privilégio e irreversível para o próprio processo.'),
        mcq('q7', 'Foi publicada uma vulnerabilidade de escalada local no kernel, e o reboot só é possível no fim de semana. Qual conjunto de medidas de defesa em profundidade é mais adequado até lá?', 'c', [
          'Desativar o auditd para reduzir ruído e confiar só no firewall de borda',
          'Executar tudo como root para simplificar a resposta e o diagnóstico',
          'Livepatch (se houver), restringir user namespaces e eBPF, seccomp/LSM e monitorar com auditd',
          'Ativar o modo permissive do SELinux, que bloqueia automaticamente exploits conhecidos enquanto o reboot não ocorre'
        ], 'Não há camada única: reduzir a janela (livepatch), reduzir a superfície acessível a atacantes locais, confinar serviços e monitorar. Permissive só registra e desligar a auditoria piora a visibilidade.'),
        fill('q8', 'Complete as permissões da regra auditd que observa escrita e mudança de atributos: -p ___.', 'auditctl -w /etc/passwd -p ___ -k identidade', ['wa', 'aw'], 'Em -p: r leitura, w escrita, x execução, a mudança de atributos. "wa" observa escritas e alterações de atributos.')
      ]
    },
    {
      id: 'lna-39-selinux-apparmor-pratica',
      title: 'SELinux e AppArmor na prática',
      goal: 'Entender MAC vs DAC, ler contextos SELinux, rotular arquivos, usar booleanos e portas, diagnosticar negações com segurança, conhecer AppArmor e seguir um fluxo de trabalho que não enfraquece o sistema.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'MAC vs DAC e quem usa o quê',
            'No controle de acesso DISCRICIONÁRIO (DAC), o padrão do Unix, o DONO de um recurso decide quem acessa (modo rwx, ACLs). Tem um limite sério: um processo roda com os poderes do usuário que o iniciou, e o root ignora as permissões. Se um servidor web é comprometido, o atacante herda tudo o que aquele usuário pode ler. No controle OBRIGATÓRIO (MAC), uma POLÍTICA central, fora do controle do dono do arquivo, define o que cada processo pode fazer, e vale até para processos de root. O MAC é aplicado ALÉM do DAC: o acesso só ocorre se os dois permitirem. No Linux, o MAC é implementado por LSMs (módulos de segurança do kernel). Os dois principais: o SELinux (padrão em Fedora, RHEL e derivadas) e o AppArmor (padrão em Ubuntu e openSUSE). O objetivo é CONTENÇÃO: mesmo comprometido, o serviço só alcança o que sua política permite.',
            '# um servidor web comprometido tenta ler um arquivo 0644 de um usuário\n# DAC: permite (modo 0644 é legível por todos)\n# MAC: pode negar se a política não permite ao domínio do servidor ler aquele tipo de arquivo'
          ),
          sl(
            'SELinux: modos e contexto',
            'O SELinux tem três modos: ENFORCING (aplica a política e registra negações), PERMISSIVE (não bloqueia, só REGISTRA o que seria negado: ótimo para diagnóstico) e DISABLED (desligado). getenforce mostra o modo atual; setenforce 0 e setenforce 1 alternam entre permissive e enforcing até o próximo boot; o modo permanente fica em /etc/selinux/config (SELINUX=enforcing). Todo processo e todo objeto (arquivo, porta, socket) tem um CONTEXTO no formato usuario:papel:tipo:nível. O campo que importa no dia a dia é o TIPO: a política é escrita como regras sobre tipos, na forma "o tipo de processo (domínio) httpd_t pode ler arquivos do tipo httpd_sys_content_t". Isso se chama imposição de tipos (type enforcement). O papel agrupa domínios permitidos a um usuário SELinux, e o nível (como s0) serve a MLS/MCS, também usado para separar contêineres. Com -Z, ls e ps mostram o contexto.',
            'getenforce                              # Enforcing  (exemplo)\nls -Z /var/www/html/index.html           # exemplo\n# unconfined_u:object_r:httpd_sys_content_t:s0 /var/www/html/index.html\nps -eZ | grep httpd                      # exemplo\n# system_u:system_r:httpd_t:s0   ... httpd    <- domínio do processo'
          ),
          sl(
            'Rotulagem: restorecon, semanage fcontext e chcon',
            'O rótulo de um arquivo fica em um atributo estendido (security.selinux). Arquivos novos herdam o tipo do DIRETÓRIO onde são criados, e a política tem uma tabela do tipo esperado para cada caminho. Um erro clássico: mv PRESERVA o rótulo original (o arquivo continua com o tipo do local de origem, como user_home_t, que o servidor web não pode ler), enquanto cp cria um arquivo novo que herda o rótulo do destino. A correção é restorecon -Rv caminho, que reaplica os rótulos que a política define para aquele caminho. Para um diretório fora do padrão (como /srv/site), ensine a política com semanage fcontext -a -t tipo "regex" e depois rode restorecon: a regra persiste e sobrevive a um relabel. Já o chcon muda o rótulo na hora, mas é TEMPORÁRIO: um restorecon ou relabel o desfaz, por isso serve só para testar. matchpathcon mostra o tipo esperado de um caminho.',
            '# conteúdo web em /srv/site (exemplo)\nsudo semanage fcontext -a -t httpd_sys_content_t "/srv/site(/.*)?"\nsudo restorecon -Rv /srv/site     # aplica o rótulo da regra\nls -Z /srv/site | head -2         # confere o tipo (exemplo)'
          ),
          sl(
            'Booleanos e portas',
            'Para variações comuns, a política traz BOOLEANOS: chaves que ligam ou desligam um conjunto de regras sem escrever política. getsebool -a lista todos; setsebool altera, e a opção -P torna a mudança PERMANENTE (sem -P vale só até o reinício). Exemplo: httpd_can_network_connect permite ao servidor web abrir conexões de saída pela rede. Ligue só o booleano necessário. Portas também têm rótulos: o serviço só pode escutar em portas cujo tipo a política permite (a http_port_t, por exemplo, cobre as portas web padrão). Para um serviço em porta não padrão, use semanage port -a -t http_port_t -p tcp 8888 (e semanage port -l para listar). Ajustar booleano, rótulo ou porta é quase sempre melhor que escrever regras novas, pois usa mecanismos que a política já prevê.',
            'getsebool httpd_can_network_connect       # httpd_can_network_connect --> off (exemplo)\nsudo setsebool -P httpd_can_network_connect on\nsemanage port -l | grep http_port_t        # exemplo: tcp 80, 81, 443, ...\nsudo semanage port -a -t http_port_t -p tcp 8888'
          ),
          sl(
            'Diagnosticar negações e o risco do audit2allow',
            'Negações do SELinux são registradas como mensagens AVC no auditd (/var/log/audit/audit.log). Para vê-las: ausearch -m avc -ts recent. Ler um AVC: "denied { permissão }" diz o que foi negado; scontext é o contexto de ORIGEM (o processo); tcontext é o do ALVO (arquivo, porta); tclass é a classe do objeto (file, tcp_socket). O audit2why explica o motivo e muitas vezes sugere o remédio (um booleano), e o sealert (setroubleshoot) traduz em recomendações legíveis. O audit2allow gera um módulo de política que PERMITE tudo o que está no log. Aí mora o RISCO: o log contém negações causadas por rótulo errado, por configuração torta ou até por um ataque, e permitir tudo isso AMPLIA os poderes do domínio, às vezes de forma perigosa (ler dados de usuários, escrever em diretórios sensíveis). Regra: entenda cada linha, corrija rótulo, booleano ou porta primeiro, e use audit2allow só para regras mínimas revisadas. Desligar o SELinux (disabled) é má prática: remove a contenção para todos os serviços, e religá-lo exige relabel do sistema de arquivos.',
            'sudo ausearch -m avc -ts recent             # exemplo de AVC (varia):\n# type=AVC ... avc:  denied  { name_bind } for  pid=1234 comm="httpd" src=8888\n#   scontext=system_u:system_r:httpd_t:s0\n#   tcontext=system_u:object_r:unreserved_port_t:s0 tclass=tcp_socket permissive=0\nsudo ausearch -m avc -ts recent | audit2why   # explica (exemplo)'
          ),
          sl(
            'AppArmor: perfis por caminho',
            'O AppArmor confina PROGRAMAS por meio de PERFIS associados ao CAMINHO do executável (arquivos em /etc/apparmor.d). Um perfil lista o que o programa pode acessar: arquivos com modos (r leitura, w escrita, ix executar herdando o perfil), rede (network inet stream), capabilities. Há abstrações reutilizáveis com #include <abstractions/base>. Modos: ENFORCE (aplica e registra) e COMPLAIN (só registra as violações, como o permissive do SELinux). aa-status mostra perfis carregados e seus modos; aa-complain e aa-enforce alternam; apparmor_parser -r recarrega um perfil. Para criar perfis, o aa-genprof observa o programa e o aa-logprof atualiza o perfil com base nas negações do log. Negações aparecem no journal ou dmesg com apparmor="DENIED". Contêineres: o Docker aplica por padrão o perfil docker-default, e é possível usar perfis específicos. Comparação conceitual: o SELinux usa RÓTULOS nos objetos (o rótulo acompanha o arquivo) e é mais granular e complexo; o AppArmor usa CAMINHOS, é mais simples de ler e escrever e menos granular.',
            '# /etc/apparmor.d/usr.sbin.meu-app  (exemplo)\n# /usr/sbin/meu-app {\n#   #include <abstractions/base>\n#   /etc/meu-app.conf r,\n#   /var/log/meu-app/** rw,\n#   network inet stream,\n# }\nsudo aa-status | head -3               # exemplo: perfis em enforce e complain'
          ),
          sl(
            'Fluxo de trabalho seguro, systemd e contêineres',
            'Fluxo recomendado para um serviço novo ou alterado, em ambiente de TESTE: (1) coloque o domínio em PERMISSIVE (SELinux, até por domínio com semanage permissive -a httpd_t) ou o perfil em COMPLAIN (AppArmor), sem desligar o sistema todo; (2) exercite todas as funções do serviço; (3) leia as negações (ausearch, journalctl); (4) corrija o MÍNIMO: rótulo, booleano, porta, ou uma regra revisada; (5) volte a ENFORCING/enforce e repita os testes; (6) mantenha a auditoria ligada. Integração com o systemd: a unit pode definir SELinuxContext= ou AppArmorProfile= para o serviço. Contêineres: com SELinux, os processos de contêiner usam tipos próprios (como container_t) e os volumes montados precisam de rótulo, pedido com :z (compartilhado entre contêineres) ou :Z (privado a este contêiner) no podman e no Docker. Auditoria: os logs de AVC e DENIED mostram caminhos e nomes de usuário, que podem ser dados pessoais; trate-os com acesso restrito e retenção definida (LGPD).',
            '# volume com rótulo privado ao contêiner (exemplo)\npodman run --rm -v /srv/dados:/dados:Z imagem-exemplo\n# unit systemd (trecho, exemplo)\n# [Service]\n# AppArmorProfile=usr.sbin.meu-app'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um servidor web comprometido roda como usuário apache e tenta ler um arquivo 0644 na home de <usuario>. Com SELinux em enforcing, por que o acesso pode ser negado mesmo com o DAC permitindo?', 'a', [
          'O MAC é aplicado além do DAC, e a política pode não permitir ao tipo httpd_t ler aquele tipo de arquivo',
          'O SELinux substitui o DAC; como o modo 0644 foi ignorado, o acesso depende só do dono do arquivo',
          'O root do sistema revoga as permissões de leitura de todo usuário que roda serviços de rede ao ligar o SELinux',
          'O DAC é checado depois do MAC, e como o arquivo é legível por todos o MAC é descartado nesse caso'
        ], 'O acesso só ocorre se DAC e MAC permitirem. A política SELinux é por tipos, e o domínio do servidor web não lê, por padrão, arquivos de home.'),
        mcq('q2', 'Em "system_u:system_r:httpd_t:s0", exibido por ps -Z, qual campo a política usa principalmente para decidir o que o processo acessa, e como ele se chama?', 'c', [
          'system_u, o usuário SELinux, que define as permissões de cada arquivo acessado',
          'system_r, o papel, que lista todos os arquivos que o processo pode abrir',
          'httpd_t, o tipo (domínio do processo), base da imposição de tipos',
          's0, o nível MLS, que decide as regras de leitura e escrita do domínio'
        ], 'As regras são sobre tipos: o domínio do processo (httpd_t) contra o tipo do alvo. Usuário e papel limitam transições, e o nível serve a MLS/MCS.'),
        mcq('q3', 'Você moveu (mv) um site de /home/<usuario>/site para /var/www/html. O Apache responde 403 e o AVC mostra httpd_t negado em arquivos user_home_t. Qual a causa e a correção?', 'b', [
          'O SELinux não reconhece o diretório novo; a correção é setenforce 0 de forma permanente em /etc/selinux/config',
          'O mv preserva o rótulo de origem (user_home_t); corrigir com restorecon -Rv /var/www/html',
          'O mv reaplica o rótulo do destino, então o problema é a porta; usar semanage port',
          'O cp teria o mesmo defeito e o mv não; a solução é recriar o diretório e desligar o auditd'
        ], 'mv mantém o tipo de origem; cp cria arquivos novos que herdam o rótulo do destino. restorecon reaplica o rótulo definido pela política.'),
        fill('q4', 'Complete o comando que liga, de forma permanente, o booleano que permite ao servidor web abrir conexões de saída.', 'sudo ___ -P httpd_can_network_connect on', ['setsebool'], 'setsebool altera booleanos; -P grava a mudança de forma permanente (sem ele vale até reiniciar).'),
        mcq('q5', 'Leitura de um AVC de exemplo: "denied { name_bind } ... comm=httpd src=8888 scontext=...:httpd_t:s0 tcontext=...:unreserved_port_t:s0 tclass=tcp_socket". Qual a interpretação e o próximo passo defensável?', 'd', [
          'O arquivo de configuração tem rótulo errado; rodar chcon -R em todo o sistema de arquivos até a negação sumir',
          'O usuário não tem permissão de escrita no diretório de logs; liberar com chmod 777 e reiniciar o serviço',
          'A porta 8888 está em uso por outro processo; encerrar o outro processo resolve a negação do SELinux',
          'O httpd_t foi impedido de fazer bind na porta 8888; se legítima, rotulá-la com semanage port -a -t http_port_t -p tcp 8888'
        ], 'name_bind é o bind em porta, scontext é o processo e tcontext é a porta. A correção prevista pela política é rotular a porta, não relaxar permissões.'),
        mcq('q6', 'Qual é o risco de rodar audit2allow -a -M meu e instalar o módulo gerado sem revisar?', 'c', [
          'O módulo substitui a política inteira, e o sistema passa a funcionar em modo disabled até o reboot',
          'O audit2allow só gera regras para o root, e os serviços continuam bloqueados mesmo após a instalação',
          'Transforma em permissão toda negação do log, inclusive as de rótulo errado ou de ataque, ampliando os poderes do domínio',
          'O módulo é rejeitado pelo kernel por não ser assinado, e o log de auditoria é apagado após a tentativa'
        ], 'audit2allow permite tudo o que foi negado. Sem entender cada linha, pode-se liberar acesso indevido. Prefira corrigir rótulo, booleano ou porta e revisar o que sobrar.'),
        mcq('q7', 'Qual afirmação descreve corretamente perfis e modos do AppArmor?', 'a', [
          'Perfil associado ao caminho do executável; em complain as violações só são registradas, útil antes do enforce',
          'O perfil é associado a rótulos gravados nos arquivos; complain bloqueia tudo e registra os acessos permitidos',
          'O perfil vale para todos os programas de um usuário; o modo enforce depende do SELinux estar em permissive',
          'O perfil só pode ser criado pelo aa-genprof, e o aa-status serve para descobrir o rótulo de um arquivo'
        ], 'AppArmor é baseado em caminhos; complain registra sem bloquear. Rótulos em arquivos são do SELinux, e o aa-genprof é apenas uma das formas de criar perfis.'),
        fill('q8', 'Complete o comando que reaplica os rótulos definidos pela política depois de um semanage fcontext.', 'sudo semanage fcontext -a -t httpd_sys_content_t "/srv/site(/.*)?"\nsudo ___ -Rv /srv/site', ['restorecon'], 'O semanage fcontext só registra a regra; o restorecon aplica o rótulo aos arquivos existentes. Já o chcon seria temporário.')
      ]
    },
    {
      id: 'lna-10-ebpf-observabilidade',
      title: 'eBPF e rastreamento',
      goal: 'Entender o que é eBPF (verificador, mapas, ganchos), usar bpftrace/BCC/bpftool e ftrace/perf trace em visão geral e conhecer requisitos, riscos e privacidade.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'O que é eBPF',
            'eBPF permite executar pequenos programas dentro do kernel, sem alterar o código dele e sem módulos, disparados por eventos (a entrada de uma função, um pacote chegando, uma syscall). O programa é escrito em C restrito ou em linguagens de alto nível (bpftrace), compilado para bytecode eBPF e carregado pela syscall bpf(); o kernel o VERIFICA antes de aceitar e, em seguida, o compila para código de máquina (JIT) para rodar com desempenho quase nativo. Diferentemente de um módulo, que roda com poder total e pode travar o kernel, um programa eBPF só é aceito se provadamente seguro. Isso abriu um enorme campo: observabilidade de produção com baixo custo, redes programáveis e segurança em tempo de execução.',
            'fonte (C restrito/bpftrace) -> bytecode eBPF -> bpf() -> VERIFICADOR -> JIT\n   -> anexado a um GANCHO (evento) -> grava em MAPAS -> lido pelo espaço de usuário'
          ),
          sl(
            'Verificador e mapas',
            'O verificador analisa todos os caminhos do programa antes de carregá-lo: garante que ele termina (sem laços ilimitados), que cada acesso à memória é válido e dentro dos limites, que ponteiros são usados corretamente e que só chama funções auxiliares permitidas. Um programa que o verificador não consegue provar seguro é rejeitado. Por isso eBPF é "seguro por construção", embora o verificador seja também uma superfície de ataque cuidadosamente mantida. Os MAPAS são estruturas chave-valor residentes no kernel (hash, array, por CPU, buffer circular) que servem de memória do programa entre execuções e de canal de comunicação com o espaço de usuário: o programa conta eventos ou acumula histogramas no mapa, e uma ferramenta lê esses dados periodicamente, sem precisar enviar cada evento.',
            'sudo bpftool prog list     # programas carregados (exemplo)\n# 52: kprobe  name hello  tag ...  loaded_at ...\nsudo bpftool map list      # mapas e tipos (hash, array, ringbuf...)'
          ),
          sl(
            'Ganchos: kprobes, uprobes, tracepoints e outros',
            'Onde o programa é anexado define o que se observa. kprobe/kretprobe: entrada e retorno de quase qualquer função do kernel (flexível, mas os nomes e as assinaturas das funções mudam entre versões do kernel). uprobe/uretprobe: funções em programas de espaço de usuário (por exemplo, uma função de biblioteca). Tracepoints: pontos ESTÁVEIS definidos pelos desenvolvedores do kernel, como syscalls:sys_enter_openat, sched:sched_switch e block:block_rq_issue; são preferíveis por manterem compatibilidade. Existem ainda XDP e tc (rede), ganchos de cgroup, LSM (políticas de segurança) e perf events (amostragem). Regra prática: tracepoint quando houver; kprobe quando não.',
            'sudo bpftrace -l \'tracepoint:syscalls:sys_enter_open*\'   # lista tracepoints (exemplo)\n# tracepoint:syscalls:sys_enter_openat\n# kprobe:vfs_read   | uprobe:/lib/libc.so.6:malloc'
          ),
          sl(
            'Ferramentas: bpftrace, BCC, bpftool',
            'O bpftrace é uma linguagem de alto nível, inspirada no awk, para investigação interativa e one-liners. O BCC é uma coleção de ferramentas prontas, escritas com Python/C, com nomes consagrados: execsnoop (novos processos), opensnoop (aberturas de arquivo), biolatency (histograma de latência de disco), tcplife (vida das conexões TCP); em algumas distribuições os executáveis ganham o sufixo -bpfcc. libbpf com CO-RE ("compile uma vez, rode em qualquer lugar", usando as informações de tipos BTF do kernel) é a base de ferramentas modernas. bpftool inspeciona e gerencia programas, mapas e ligações no kernel. Em investigação, a pergunta guia é: qual evento responde minha dúvida e o que contar ou medir dele?',
            'sudo opensnoop-bpfcc          # quem abre quais arquivos (nome varia por distro)\nsudo biolatency-bpfcc 5 1      # histograma de latência de E/S de disco por 5 s\nsudo execsnoop-bpfcc           # cada exec novo, em tempo real'
          ),
          sl(
            'One-liners típicos do bpftrace (exemplos)',
            'Os dois exemplos abaixo são típicos e rotulados como EXEMPLOS: a sintaxe é a do bpftrace; ajuste ao seu kernel. O primeiro conta as chamadas de sistema por nome de processo (comm): ao pressionar Ctrl-C, o mapa @ é impresso, ordenado por contagem. O segundo mede a latência da função vfs_read gravando o instante de entrada em um mapa indexado pela thread (tid) e, ao retornar, acumulando a diferença em um histograma em potências de 2 (em nanossegundos). Para latência de disco, o histograma pronto é o biolatency do BCC. Aviso: ferramentas de rastreamento têm custo, especialmente em eventos muito frequentes: use filtros, rode por pouco tempo e evite em produção sem teste.',
            '# EXEMPLO 1: syscalls por processo\nsudo bpftrace -e \'tracepoint:raw_syscalls:sys_enter { @[comm] = count(); }\'\n# EXEMPLO 2: histograma de latência de vfs_read (ns)\nsudo bpftrace -e \'kprobe:vfs_read { @t[tid] = nsecs; }\n  kretprobe:vfs_read /@t[tid]/ { @ns = hist(nsecs - @t[tid]); delete(@t[tid]); }\''
          ),
          sl(
            'ftrace e perf trace',
            'O ftrace é o rastreador embutido no kernel, controlado pelo tracefs, geralmente em /sys/kernel/tracing (também acessível em /sys/kernel/debug/tracing). Arquivos principais: available_tracers e current_tracer (por exemplo, function para registrar chamadas de funções e function_graph para vê-las com duração e aninhamento), tracing_on (liga e desliga), trace (resultado) e set_ftrace_filter (limita as funções). O trace-cmd é uma interface mais cômoda. O perf trace é um "strace" de baixo custo baseado em tracepoints, capaz de observar um processo, um grupo ou o sistema inteiro, mostrando syscalls, tempos e falhas de página, com bem menos desaceleração que o strace tradicional. Ambos servem quando eBPF não está disponível ou quando basta um rastro simples.',
            'sudo cat /sys/kernel/tracing/available_tracers   # ex.: function_graph function nop\nsudo perf trace -p 1234                           # syscalls do PID 1234 (baixo custo)\nsudo perf trace -s -- sleep 1                     # resumo por syscall'
          ),
          sl(
            'Casos de uso, requisitos, riscos e privacidade',
            'Casos de uso: observabilidade (latência por etapa, quem usa CPU/disco/rede), rede (balanceamento e filtragem com XDP, redes de clusters como o Cilium) e segurança em tempo de execução (detecção de comportamentos suspeitos com Falco e Tetragon). Requisitos: kernel com suporte a BPF (e BTF para CO-RE) e privilégios, em kernels recentes CAP_BPF e CAP_PERFMON (e CAP_NET_ADMIN para rede) ou root; o sysctl kernel.unprivileged_bpf_disabled restringe o uso por usuários sem privilégio. Riscos: quem pode carregar eBPF vê e influencia muito do sistema, então restrinja e audite essa permissão; programas mal feitos geram sobrecarga. PRIVACIDADE (LGPD): rastrear argumentos de execve, conteúdo de read/write ou tráfego de rede pode capturar senhas, tokens e dados pessoais de usuários. Princípios: colete só metadados necessários (contagens, latências), evite capturar payloads, restrinja quem lê, defina retenção curta e encerre a coleta quando a investigação acabar.',
            'sysctl kernel.unprivileged_bpf_disabled     # 1 ou 2 = só processos privilegiados\ngrep CapEff /proc/self/status                # ver capabilities efetivas\n# CAP_BPF + CAP_PERFMON (+ CAP_NET_ADMIN) em vez de root, quando suportado'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é o papel do verificador do eBPF?', 'd', [
          'Traduzir o bytecode para código de máquina, e é o único passo de segurança antes do carregamento',
          'Cifrar os mapas antes de compartilhá-los com o espaço de usuário',
          'Conferir a assinatura digital do autor do programa antes de carregá-lo, como fazem os pacotes de distribuição',
          'Analisar o programa antes da execução e rejeitá-lo se não for provadamente seguro'
        ], 'O verificador garante terminação e segurança de memória e restringe as funções auxiliares. A compilação JIT é outra etapa, e assinatura não é a função dele.'),
        mcq('q2', 'Para que servem os mapas eBPF?', 'a', [
          'Guardar dados entre execuções do programa e comunicar resultados ao espaço de usuário, como contadores e histogramas',
          'Mapear endereços virtuais para físicos no lugar das tabelas de páginas',
          'Listar os módulos carregados e suas dependências',
          'Registrar quais usuários têm permissão para carregar programas'
        ], 'Mapas são estruturas chave-valor no kernel (hash, array, ringbuf...), usadas como estado e canal de dados, o que evita enviar cada evento ao espaço de usuário.'),
        mcq('q3', 'Você pode usar um tracepoint ou um kprobe para observar uma operação. Por que o tracepoint é preferível quando existe?', 'b', [
          'Porque ele tem custo zero, ao contrário do kprobe',
          'Porque é um ponto estável do kernel, enquanto funções de kprobe mudam entre versões',
          'Porque só o tracepoint passa pelo verificador do eBPF, o que o torna mais seguro que o kprobe',
          'Porque o tracepoint funciona sem muitos privilégio no sistema, pois roda dentro do kernel'
        ], 'Tracepoints são interface mantida com estabilidade. kprobes se anexam a funções internas, que mudam. Ambos exigem privilégios e passam pelo verificador.'),
        fill('q4', 'Complete com a ferramenta que lista programas e mapas eBPF carregados no kernel.', 'sudo ___ prog list', ['bpftool'], 'bpftool inspeciona programas, mapas e ligações; "bpftool map list" lista os mapas.'),
        mcq('q5', 'O que faz o one-liner: bpftrace -e \'tracepoint:raw_syscalls:sys_enter { @[comm] = count(); }\' ?', 'c', [
          'Imprime o conteúdo de cada chamada de sistema, com argumentos e retorno, gravando-os em um arquivo para análise posterior',
          'Mede o tempo de cada syscall e cria um histograma por processo',
          'Conta quantas syscalls cada nome de processo (comm) fez e imprime o mapa ao pressionar Ctrl-C',
          'Bloqueia as syscalls de cada processo, como um filtro seccomp'
        ], 'O gancho dispara a cada entrada de syscall; o mapa @ indexado por comm acumula contagens, impressas ao final. Não mede tempo, não captura argumentos e não bloqueia nada.'),
        mcq('q6', 'Quais privilégios, em kernels recentes, permitem usar eBPF e perf sem ser root completo?', 'a', [
          'CAP_BPF e CAP_PERFMON (e CAP_NET_ADMIN para programas de rede)',
          'CAP_SYS_BOOT e CAP_SYS_TIME',
          'CAP_NET_BIND_SERVICE e CAP_CHOWN, usadas para escutar portas baixas e trocar donos',
          'Nenhum: eBPF exige UID 0, não há outra forma'
        ], 'As capabilities CAP_BPF e CAP_PERFMON foram criadas para separar esse poder do CAP_SYS_ADMIN. O sysctl unprivileged_bpf_disabled ainda restringe o uso sem privilégio.'),
        mcq('q7', 'Uma equipe quer usar eBPF para diagnosticar lentidão em produção e propõe registrar os argumentos de todas as chamadas read/write e execve por semanas. Qual é a abordagem adequada do ponto de vista de privacidade e segurança?', 'd', [
          'Aceitar, pois os dados ficam só no kernel e não podem conter dados pessoais',
          'Aceitar, desde que os logs sejam guardados indefinidamente para auditorias futuras',
          'Registrar os payloads e filtrar depois, já que a redação posterior elimina o risco da coleta pois os dados ficam sob controle',
          'Coletar só metadados (contagens, latências), evitar payloads, restringir acesso e manter retenção curta'
        ], 'Argumentos e conteúdo de E/S podem conter senhas, tokens e dados pessoais. Minimização, controle de acesso e retenção curta reduzem o risco; a coleta deve ter prazo e finalidade.'),
        fill('q8', 'Complete com o subcomando do perf que funciona como um strace de baixo custo.', 'sudo perf ___ -p 1234', ['trace'], 'perf trace usa tracepoints para mostrar syscalls de um processo ou do sistema, com bem menos sobrecarga que o strace.')
      ]
    },
    {
      id: 'lna-11-perf-profiling',
      title: 'Profiling e desempenho',
      goal: 'Aplicar o método USE, usar perf (stat/top/record/report), ler flame graphs, interpretar contadores de hardware e fazer benchmarks e ajustes de forma rigorosa.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Método USE e método de perguntas',
            'Antes de qualquer ferramenta, organize a investigação. O método USE (de Brendan Gregg) diz: para CADA recurso (CPU, memória, disco, rede), verifique Utilização (quanto tempo está ocupado), Saturação (quanto trabalho está esperando na fila) e Erros. Isso evita o vício de olhar só o que se conhece. Exemplo de disco: utilização = %util do iostat; saturação = aqu-sz e await altos; erros = mensagens no dmesg e contadores SMART. Complemente com perguntas: qual é o sintoma exato e como é medido? Desde quando? O que mudou (deploy, dados, tráfego)? Afeta todos ou só alguns? Qual recurso está limitando? Só depois escolha a ferramenta. Uma primeira passada de 1 minuto com uptime, vmstat 1, mpstat -P ALL 1, pidstat 1, iostat -xz 1, free -m e sar -n DEV 1 já aponta o recurso suspeito.',
            'vmstat 1 5      # r = fila de execução, b = bloqueadas, si/so = swap, wa = espera de E/S\nmpstat -P ALL 1 # %usr %sys %iowait %steal por CPU\npidstat 1       # CPU por processo\niostat -xz 1    # disco: await, aqu-sz, %util'
          ),
          sl(
            'perf: stat, top, record e report',
            'O perf é o profiler do kernel Linux. perf stat comando executa e resume contadores (ciclos, instruções, trocas de contexto, faltas de cache, task-clock): visão rápida e barata. perf top mostra, ao vivo, as funções que mais consomem CPU no sistema. perf record coleta AMOSTRAS para análise posterior (por exemplo, perf record -F 99 -g -p PID -- sleep 30: 99 amostras por segundo, com pilhas de chamadas, por 30 s) e perf report abre o resultado navegável. Distinção central: AMOSTRAGEM captura, em intervalos regulares, onde a CPU está (custo baixo e constante, resultado estatístico: funções rápidas e raras podem não aparecer); RASTREAMENTO registra TODOS os eventos (strace, ftrace, eBPF; precisão total, mas custo proporcional à quantidade de eventos). Para "onde a CPU gasta tempo", amostragem é o ponto de partida.',
            'perf stat ./app\nperf record -F 99 -g -p 1234 -- sleep 30   # 99 Hz, com pilhas\nperf report                               # navega o resultado\nperf top                                  # ao vivo'
          ),
          sl(
            'Flame graphs: como ler',
            'Um flame graph é a visualização das pilhas amostradas. Leitura: cada retângulo é uma função; o EIXO VERTICAL é a profundidade da pilha (embaixo, a raiz, por exemplo main; acima, quem ela chama); o EIXO HORIZONTAL é a proporção das amostras, ou seja, a LARGURA representa tempo relativo (não ordem cronológica: as funções são ordenadas por nome). Procure os "platôs": retângulos largos sem filhos em cima são onde a CPU realmente gasta o tempo; uma função larga com muitos filhos finos mostra que o custo está distribuído abaixo dela. Dá para clicar para ampliar. Gera-se a partir do perf com os scripts do projeto FlameGraph (stackcollapse-perf.pl e flamegraph.pl). Existem também flame graphs "off-CPU", que mostram onde o processo ficou esperando (bloqueado). Dados de pilha podem expor nomes de funções internas e, em raros casos, argumentos: trate os arquivos com o mesmo cuidado de logs.',
            'perf script | stackcollapse-perf.pl | flamegraph.pl > chama.svg   # scripts do FlameGraph\n#   [  g()  ][ h() ]      <- topo: funções em CPU (platô largo = hotspot)\n#   [     f()      ]      <- f chama g e h; largura = % das amostras\n#   [    main()    ]      <- base: raiz da pilha'
          ),
          sl(
            'Contadores de hardware, IPC e caches de CPU',
            'As CPUs têm contadores (PMU) que contam eventos como ciclos, instruções, faltas de cache e erros de predição de desvio; o perf stat os lê (em máquinas virtuais podem aparecer como "not supported"). O IPC (instruções por ciclo) é instruções dividido por ciclos: por exemplo, 1,8 bilhão de instruções em 3,6 bilhões de ciclos dá IPC 0,5, o que sugere que a CPU passou muito tempo parada esperando dados (stalls, geralmente memória); um IPC alto indica que o trabalho útil flui. As CPUs têm caches L1, L2 e L3, muito mais rápidos que a RAM, que trazem dados em linhas (tipicamente de 64 bytes). Por isso a LOCALIDADE importa: acesso sequencial a um vetor aproveita a linha inteira (localidade espacial) e reuso recente de um dado o mantém no cache (localidade temporal); saltar aleatoriamente pela memória, como em listas encadeadas grandes ou percorrer uma matriz por colunas, causa faltas de cache e baixa o IPC.',
            'perf stat -e cycles,instructions,cache-misses ./app      # exemplo (valores fictícios)\n#   3,600,000,000  cycles\n#   1,800,000,000  instructions   # 0.50 insn per cycle  <- IPC baixo\n#       9,000,000  cache-misses'
          ),
          sl(
            'mpstat, pidstat, sar: por CPU, por processo e histórico',
            'mpstat -P ALL 1 mostra por CPU os percentuais de %usr, %sys, %iowait (CPU ociosa com E/S pendente), %steal (em VM: tempo que o hipervisor tomou da sua CPU) e %idle. Uma CPU a 100% com as outras ociosas indica código que não paraleliza ou afinidade mal configurada. pidstat 1 mostra o consumo por processo; com -d, o de disco; com -w, as trocas de contexto. O sar (pacote sysstat) guarda histórico coletado periodicamente, permitindo olhar o passado: sar -u (CPU), sar -r (memória), sar -q (fila e load), sar -n DEV (interfaces). Ao analisar, distinga latência (tempo de uma operação, avaliado em percentis como p50 e p99, pois a média esconde os piores casos) de vazão (operações por segundo): um sistema pode ter ótima vazão média e latência de cauda péssima para alguns usuários.',
            'mpstat -P ALL 1 3\n# CPU  %usr %sys %iowait %steal %idle      <- exemplo didático\n#   0  95.0  4.0    0.0    0.0   1.0       (uma CPU saturada)\n#   1   2.0  1.0    0.0    0.0  97.0\nsar -q -f /var/log/sa/sa02          # histórico da fila/load (caminho varia por distro)'
          ),
          sl(
            'Benchmark correto e o efeito do observador',
            'Um benchmark confiável: (1) AQUEÇA o sistema (primeiras execuções enchem caches, ativam otimizações e estabilizam a frequência) e descarte-as; (2) REPITA várias vezes e relate a variância, não um número só; prefira a MEDIANA, que resiste a outliers; (3) ISOLE: fixe o processo em CPUs (taskset), evite outras cargas, use o mesmo governador de frequência, mesmo kernel e mesmos dados; (4) mude UMA variável por vez; (5) use carga parecida com a real. Exemplo didático: seis execuções de 102, 98, 101, 99, 140 e 100 ms têm média de 106,7 ms e mediana de 100,5 ms: o outlier de 140 puxa a média, mas a mediana descreve melhor o caso típico, e a dispersão deve ser reportada. EFEITO DO OBSERVADOR: medir altera o sistema. O strace, a amostragem em alta frequência e o rastreamento detalhado acrescentam custo e podem deslocar o gargalo ou mascarar corridas; prefira amostragem de baixa frequência e confirme com uma medição externa leve.',
            'import statistics\nt = [102, 98, 101, 99, 140, 100]\nprint(round(statistics.mean(t), 1), statistics.median(t))   # 106.7 100.5\n# taskset -c 2 ./bench   (fixa a CPU)  |  repita 10x e reporte mediana e dispersão'
          ),
          sl(
            'Ajuste de sysctl: só com evidência',
            'Parâmetros do kernel (vm.swappiness, net.core.somaxconn, vm.dirty_ratio...) existem para casos específicos, e "tunings" copiados da internet frequentemente pioram o sistema ou não têm efeito. Um ciclo disciplinado: (1) medir a linha de base e identificar o gargalo; (2) formular a hipótese ("a fila de accept enche"); (3) alterar UM parâmetro, anotando o valor anterior; (4) medir de novo, nas mesmas condições; (5) manter se melhorou de forma significativa, senão reverter; (6) persistir em um arquivo de /etc/sysctl.d/ com comentário de justificativa e tratar como mudança versionada. sysctl -w altera em tempo de execução (perdido no reboot), e sysctl --system recarrega os arquivos. Ajuste feito sem medição é aposta, não engenharia.',
            'sysctl vm.swappiness                      # valor atual (anote)\nsudo sysctl -w vm.swappiness=10            # teste em tempo de execução\n# se comprovado, persista:\necho "vm.swappiness = 10  # justificativa: <chamado>" | sudo tee /etc/sysctl.d/90-app.conf\nsudo sysctl --system'
          )
        ]
      },
      questions: [
        mcq('q1', 'Pelo método USE, o que avaliar para o recurso "disco" ao investigar lentidão?', 'b', [
          'Só o espaço livre em df, pois disco cheio é a única causa de lentidão',
          'Utilização (%util), saturação (fila e await) e erros (dmesg, SMART)',
          'O número de processos zumbis, a hora do sistema e o load average de 15 minutos',
          'Só a taxa de transferência máxima do fabricante, comparada à medida'
        ], 'USE = Utilização, Saturação e Erros para cada recurso. Isso evita fixar-se em uma métrica só. Antes de ajustar sysctl, é preciso identificar o gargalo.'),
        mcq('q2', 'Qual é a diferença entre amostragem e rastreamento?', 'c', [
          'Amostragem registra todos os eventos e é a mais precisa; rastreamento escolhe eventos ao acaso, por isso gera arquivos enormes',
          'Amostragem só funciona em máquinas físicas, e rastreamento só em máquinas virtuais',
          'Amostragem vê onde a CPU está em intervalos (barata, estatística); rastreamento registra cada evento (preciso, mais caro)',
          'Não há diferença: perf record e strace usam exatamente o mesmo mecanismo'
        ], 'perf record amostra; strace, ftrace e eBPF rastreiam eventos. Amostragem pode perder funções raras, e rastrear eventos frequentes pode ser caro.'),
        mcq('q3', 'Em um flame graph, o que significam a largura e a altura de um retângulo?', 'a', [
          'Largura: proporção das amostras (tempo relativo); altura: profundidade na pilha de chamadas',
          'Largura: ordem cronológica de execução; altura: quantidade de memória usada por função, somada ao longo da execução',
          'Largura: número de threads; altura: prioridade do processo',
          'Largura: tamanho da função em bytes; altura: número de linhas de código, somado por todas as chamadas'
        ], 'O eixo horizontal representa a fração de tempo (amostras) e não a ordem temporal; o vertical, a profundidade da pilha. Platôs largos no topo indicam hotspots.'),
        fill('q4', 'Complete com o subcomando do perf que executa um programa e resume contadores (ciclos, instruções, faltas de cache).', 'perf ___ ./app', ['stat'], 'perf stat é a visão rápida e barata dos contadores; record/report fazem a análise por amostragem.'),
        mcq('q5', 'perf stat mostra 1,8 bilhão de instruções em 3,6 bilhões de ciclos. Qual é o IPC e o que sugere?', 'd', [
          'IPC 2,0: a CPU executa duas instruções por ciclo, sinal de código muito eficiente, com poucas esperas por memória',
          'IPC 5,4: valor impossível, indicando erro de medição',
          'IPC 1,0: a CPU está exatamente balanceada entre cálculo e memória, sem esperas relevantes por dados',
          'IPC 0,5: a CPU passa muitos ciclos parada, tipicamente esperando dados da memória (stalls)'
        ], 'IPC = instruções / ciclos = 1,8/3,6 = 0,5. Valor baixo sugere stalls, geralmente por faltas de cache e acesso à memória.'),
        mcq('q6', 'Seis execuções de um benchmark deram 102, 98, 101, 99, 140 e 100 ms. Qual é a conduta mais adequada?', 'b', [
          'Reportar só o menor valor (98 ms), pois é o mais próximo do ideal',
          'Descartar o aquecimento, reportar a mediana (100,5 ms) e a dispersão, e investigar o outlier',
          'Reportar a média (106,7 ms) como valor único, pois usa todas as medições, o que dispensa reportar a variância',
          'Repetir o teste só até aparecer um valor melhor que o anterior'
        ], 'Mediana e dispersão descrevem melhor o caso típico; o outlier merece investigação (outra carga, frequência, cache). Escolher o melhor resultado é viés.'),
        mcq('q7', 'Por que percorrer uma matriz grande por colunas (em uma linguagem com armazenamento por linhas) tende a ser bem mais lento que por linhas?', 'c', [
          'Porque o compilador desativa o cache de CPU quando detecta acesso por colunas',
          'Porque o kernel recusa páginas não contíguas na RAM',
          'Porque saltos grandes na memória desperdiçam as linhas de cache e causam faltas de cache, ao contrário do acesso sequencial',
          'Porque as colunas ficam automaticamente em outro soquete NUMA'
        ], 'Caches trazem linhas inteiras (por exemplo, 64 bytes). O acesso sequencial aproveita essa localidade espacial; saltar entre linhas distantes causa muitas faltas de cache e reduz o IPC.'),
        fill('q8', 'Complete com o argumento do mpstat que mostra todas as CPUs individualmente.', 'mpstat -P ___ 1', ['ALL', 'all'], 'mpstat -P ALL 1 exibe %usr, %sys, %iowait, %steal e %idle por CPU, a cada segundo.')
      ]
    },
    {
      id: 'lna-12-depuracao',
      title: 'Depuração',
      goal: 'Usar core dumps, gdb, strace/ltrace, valgrind/ASan e mensagens do kernel para investigar falhas, e proteger core dumps (privacidade e segurança).',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Core dumps: habilitar, localizar e coredumpctl',
            'Quando um processo recebe um sinal fatal (SIGSEGV, SIGABRT...), o kernel pode gravar um core dump: uma imagem da memória e dos registradores do processo no momento da falha, que o gdb abre depois. O limite de tamanho vem do ulimit -c (0 desabilita; unlimited não limita) e de LimitCORE= nas units do systemd. O destino é decidido por /proc/sys/kernel/core_pattern: um nome de arquivo (por exemplo core) ou um programa precedido de | para quem receber o dump. Em sistemas com systemd, o comum é o systemd-coredump, que guarda os dumps comprimidos e permite listar com coredumpctl list, ver detalhes com coredumpctl info e abrir no depurador com coredumpctl gdb. fs.suid_dumpable controla se processos setuid geram core (o padrão seguro é não gerar). PRIVACIDADE E SEGURANÇA: o core dump contém a MEMÓRIA do processo: senhas, chaves privadas, tokens de sessão, dados pessoais de usuários. Trate-o como dado sensível: permissões restritas (somente root), diretório protegido, disco cifrado, retenção curta com expiração automática, desabilitar quando não for necessário e nunca anexá-lo em chamados ou enviá-lo a terceiros sem sanitizar e sem base legal.',
            'ulimit -c                       # 0 = desabilitado (exemplo)\ncat /proc/sys/kernel/core_pattern   # ex.: |/usr/lib/systemd/systemd-coredump %P %u %g %s %t %c %h\ncoredumpctl list                 # dumps guardados\ncoredumpctl gdb 1234             # abre o dump do PID 1234 no gdb\n# higiene: Storage=none (ou MaxUse= pequeno) em /etc/systemd/coredump.conf se não precisa'
          ),
          sl(
            'gdb: lendo um core dump',
            'Compile (ou obtenha) o programa com símbolos de depuração (-g) para ver nomes de funções, arquivos e linhas. Abra com gdb ./app core (ou coredumpctl gdb). Comandos essenciais: bt (backtrace, a pilha de chamadas no momento da falha; bt full mostra variáveis locais), info threads (lista as threads), thread N (seleciona), thread apply all bt (pilha de TODAS as threads, ótimo em deadlocks), frame N ou up/down (muda o quadro da pilha), list (código-fonte), print variavel (valor de uma expressão, por exemplo print *ptr), info locals, info registers e x/8x $sp (examina memória). O quadro #0 é onde o programa falhou; as de cima mostram quem o chamou. Para processos em execução, gdb -p PID anexa (requer permissão de ptrace), e deve ser usado com cuidado em produção, pois pausa o processo.',
            'gdb ./app core                                    # exemplo (fictício)\n(gdb) bt\n# #0  0x0000... in process_item (it=0x0) at app.c:42\n# #1  0x0000... in main () at app.c:88\n(gdb) frame 0\n(gdb) print it\n# $1 = (struct item *) 0x0     <- ponteiro nulo\n(gdb) thread apply all bt'
          ),
          sl(
            'Lendo uma falha de segmentação',
            '"Segmentation fault (core dumped)" é o SIGSEGV: o processo acessou memória inválida (ponteiro nulo ou solto, uso após liberação, estouro de pilha ou de buffer, escrita em região somente leitura). O kernel registra uma linha no log, que você lê com dmesg ou journalctl -k: app[1234]: segfault at 0 ip 00007f... sp 00007ffc... error 4 in app[...]. "at 0" é o endereço acessado (0 sugere ponteiro nulo); "ip" é o ponteiro de instrução onde ocorreu (use addr2line -e app -f 0xENDERECO, ou o gdb, para chegar à linha, lembrando de descontar o endereço-base se o binário for PIE); "error" é um conjunto de bits do código de falta de página em x86: bit 0 (1 = violação de proteção; 0 = página não presente), bit 1 (1 = escrita, 0 = leitura) e bit 2 (1 = modo usuário). Logo, error 4 = leitura em página não presente, em modo usuário, e error 6 = escrita em página não presente.',
            'dmesg -T | grep segfault                            # exemplo (varia)\n# app[1234]: segfault at 0 ip 00007f1c... sp 00007ffc... error 4 in app[...]\n# error 4 = 0b100 -> bit2=1 (usuário), bit1=0 (leitura), bit0=0 (página não presente)\naddr2line -e app -f 0x1139                           # endereço relativo -> função e linha'
          ),
          sl(
            'strace, ltrace, valgrind, AddressSanitizer, ldd e LD_DEBUG',
            'strace mostra as syscalls (por que o programa falha ao abrir um arquivo, onde trava); ltrace mostra chamadas a bibliotecas dinâmicas. Para erros de memória: o valgrind (ferramenta memcheck) executa o programa em uma máquina virtual instrumentada e aponta acessos inválidos, uso de memória não inicializada e vazamentos, sem recompilar, mas deixando a execução muito mais lenta; o AddressSanitizer (compilar com -fsanitize=address) instrumenta o binário na compilação, com custo bem menor, e acusa estouros de buffer e uso após liberação com a linha do erro. Problemas de bibliotecas: ldd binário lista as bibliotecas dinâmicas necessárias e se foram encontradas; LD_DEBUG=libs ./app mostra a busca do carregador dinâmico (LD_DEBUG=help lista as categorias). Cuidado: o ldd pode EXECUTAR o programa em algumas implementações, então não o use em binários não confiáveis (prefira objdump -p arquivo | grep NEEDED). O perf trace oferece um rastro de syscalls de baixo custo.',
            'valgrind --leak-check=full ./app\ngcc -g -fsanitize=address -o app_asan app.c && ./app_asan\nldd ./app | grep "not found"                # bibliotecas ausentes\nLD_DEBUG=libs ./app 2>&1 | head'
          ),
          sl(
            'Mensagens do kernel: dmesg, oops e panic',
            'dmesg (ou journalctl -k) mostra o anel de mensagens do kernel: drivers, erros de disco, OOM killer, segfaults, falhas de hardware. -T converte para data legível (aproximada) e --level=err,warn filtra. Um OOPS é um erro detectado no kernel (por exemplo, desreferência de ponteiro nulo em um driver): o kernel imprime a pilha (Call Trace), os registradores e o RIP; pode matar o processo envolvido e seguir funcionando, mas marca o kernel como "tainted" (/proc/sys/kernel/tainted diferente de 0): daí em diante o sistema é considerado não confiável para depuração. Um PANIC é um erro fatal: o kernel para. kernel.panic=N reinicia automaticamente após N segundos, e kernel.panic_on_oops=1 transforma todo oops em panic. Ao ler um trace, a função mais próxima do topo da Call Trace e a linha "RIP:" mostram onde falhou; módulos listados indicam o suspeito.',
            'dmesg -T --level=err,warn | tail\ncat /proc/sys/kernel/tainted         # 0 = não contaminado (exemplo)\n# BUG: kernel NULL pointer dereference, address: 0000000000000008   <- exemplo de oops\n# RIP: 0010:meu_driver_func+0x1a/0x80 [meu_driver]'
          ),
          sl(
            'kdump/crash e SysRq',
            'O kdump reserva memória no boot (parâmetro crashkernel=) e carrega nela um segundo kernel de captura; quando o primeiro entra em panic, esse kernel sobe e grava a memória do sistema em /proc/vmcore (um arquivo vmcore) para análise offline com o utilitário crash (crash vmlinux vmcore), que lê estruturas do kernel como o gdb faz com o programa. O vmcore contém TODA a memória, incluindo a de todos os processos: aplique os mesmos cuidados de privacidade dos core dumps (acesso restrito, cifra, retenção curta). O SysRq é um conjunto de comandos de baixo nível para quando o sistema está quase travado, controlado por kernel.sysrq (máscara de funções permitidas) e acionado por teclado ou por echo letra > /proc/sysrq-trigger. Letras úteis e seguras: s (sync), m (despeja informações de memória no log), t (lista tarefas). AVISO: b reinicia IMEDIATAMENTE sem sincronizar nem desmontar; o desliga a máquina; c PROVOCA um crash do kernel (usado para testar kdump): use só em VM de teste, sem dados que importem.',
            'cat /proc/sys/kernel/sysrq               # máscara (exemplo: 176)\necho s | sudo tee /proc/sysrq-trigger     # sync (seguro)\necho m | sudo tee /proc/sysrq-trigger     # memória -> dmesg (seguro)\n# NÃO EXECUTE fora de VM de teste: b (reboot imediato), o (desliga), c (crash)'
          )
        ]
      },
      questions: [
        mcq('q1', 'O comando ulimit -c exibe 0. O que isso significa e como confirmar o destino dos dumps quando habilitados?', 'd', [
          'Os dumps estão ilimitados, e o destino fixo é sempre o diretório /tmp',
          'O processo não pode criar novos arquivos, e o destino é decidido por /etc/fstab, mesmo que haja espaço em disco',
          'Os dumps são cifrados automaticamente, e o destino aparece em /proc/cmdline, mesmo sem permissão de escrita no diretório',
          'Core dumps desabilitados; o destino é definido por /proc/sys/kernel/core_pattern'
        ], 'ulimit -c 0 desabilita; unlimited não limita. core_pattern define arquivo ou um programa receptor (|), como o systemd-coredump, que se consulta com coredumpctl.'),
        mcq('q2', 'Qual é a prática mais adequada ao tratar core dumps de um serviço que manipula dados pessoais e senhas?', 'a', [
          'Restringir o acesso, cifrar o disco, manter retenção curta com expiração e não compartilhar sem sanitizar',
          'Anexá-los sem alteração em chamados públicos, pois facilita a análise por terceiros',
          'Armazená-los indefinidamente em um diretório legível por todos os usuários para auditoria, facilitando o acesso rápido das equipes',
          'Enviá-los por e-mail à equipe inteira, já que são só binários e ilegíveis'
        ], 'O core contém a memória do processo (senhas, chaves, tokens, dados pessoais): é dado sensível. Minimize, restrinja, cifre, expire e não compartilhe sem base legal e sanitização.'),
        mcq('q3', 'Em uma aplicação multithread travada (suspeita de deadlock), qual comando do gdb mostra a pilha de chamadas de todas as threads?', 'c', [
          'info registers, que imprime a pilha de cada thread em ordem',
          'frame 0, que lista as pilhas de todas as threads ao mesmo tempo',
          'thread apply all bt',
          'list, que exibe o código das funções em execução de cada thread'
        ], 'thread apply all bt executa o backtrace em cada thread; em um deadlock, as pilhas mostram quem espera qual trava. info threads só lista as threads.'),
        fill('q4', 'Complete com o valor de ulimit -c que desabilita core dumps na sessão.', 'ulimit -c ___', ['0'], 'Zero desabilita os core dumps; unlimited remove o limite de tamanho.'),
        mcq('q5', 'O dmesg mostra: "app[1234]: segfault at 0 ip 00007f1c... error 4 in app". Qual é a interpretação mais adequada?', 'b', [
          'Escrita em uma página protegida, no modo kernel, no endereço 4, sinal de falha no hardware da CPU',
          'Leitura em modo usuário de um endereço não mapeado (0), sugerindo desreferência de ponteiro nulo',
          'Estouro de pilha em uma thread, pois error 4 indica o número da thread, que o kernel interrompeu por limite de memória',
          'Falha de hardware na memória física, que o kernel já corrigiu'
        ], 'segfault at 0 indica o endereço acessado; error 4 = bit 2 (usuário), bit 1 = 0 (leitura), bit 0 = 0 (página não presente). Use addr2line ou gdb com o ip para achar a linha.'),
        mcq('q6', 'Você suspeita de um estouro de buffer e de uso após liberação em um programa C que você mesmo compila. Qual abordagem é mais adequada e econômica?', 'd', [
          'Usar o ltrace, que lista os estouros de buffer detectados pelas chamadas de biblioteca',
          'Executar ldd no binário, que valida o acesso à memória durante a execução',
          'Habilitar ulimit -c unlimited, pois o core dump aponta automaticamente a causa raiz',
          'Compilar com -g -fsanitize=address (AddressSanitizer), de custo menor que o valgrind'
        ], 'ASan acusa estouros e uso após liberação com a linha do erro, a custo bem menor. Valgrind dispensa recompilar, mas é mais lento. ldd não executa verificação de memória (e pode executar o binário).'),
        mcq('q7', 'Diferença entre OOPS e PANIC, e o papel do kdump:', 'a', [
          'Oops: erro do kernel que pode permitir seguir (tainted); panic: fatal; kdump salva a memória (vmcore) no panic para análise com crash',
          'Oops é um erro de aplicação que gera core dump; panic é o OOM killer; kdump desativa o SysRq, e o crash limpa o dmesg do sistema e reinicia a máquina',
          'Oops e panic são sinônimos, e o kdump só formata o log de dmesg',
          'Oops reinicia sempre a máquina; panic só registra uma mensagem; kdump cifra o disco'
        ], 'Um oops é um erro do kernel que pode não derrubá-lo; panic para o sistema. O kdump usa um kernel de captura para salvar /proc/vmcore, que contém toda a memória (dado sensível).'),
        fill('q8', 'Complete com o nome do arquivo em /proc usado para acionar comandos SysRq por echo letra.', 'echo s | sudo tee /proc/sysrq-___', ['trigger'], 'echo letra > /proc/sysrq-trigger aciona funções SysRq: s sincroniza, m despeja memória, b reinicia imediatamente (perigoso).')
      ]
    },
    {
      id: 'lna-13-compilando-kernel',
      title: 'Compilando o kernel e módulos',
      goal: 'Obter e verificar o código do kernel, configurar (.config), compilar, instalar com initramfs e bootloader, conhecer LTS/DKMS e manter um fallback seguro.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Obter o código e verificar a assinatura',
            'O código oficial vem de kernel.org: tarballs (linux-X.Y.Z.tar.xz) e o repositório git. Código de kernel executa com o poder máximo da máquina: compile SOMENTE de fontes verificadas. A verificação correta usa assinatura digital, não só um hash baixado do mesmo lugar do arquivo (quem altera um altera o outro). No kernel.org, a assinatura PGP (arquivo .tar.sign) é feita sobre o tarball DESCOMPRIMIDO: descomprime-se o .xz e verifica-se com gpg. As chaves públicas de quem assina (os mantenedores listados no kernel.org) devem ser obtidas e a impressão digital conferida por um canal independente (por exemplo, WKD com gpg --locate-keys). Em distribuições, os pacotes de fonte já vêm assinados pela cadeia da própria distribuição, o que é mais simples e igualmente seguro. Compile como usuário comum e use root apenas para instalar.',
            'xz -cd linux-<versão>.tar.xz | gpg --verify linux-<versão>.tar.sign -\n# gpg: Good signature from "..."   <- só confie com a chave/impressão digital conferida\ngpg --locate-keys torvalds@kernel.org gregkh@kernel.org   # WKD\ntar xf linux-<versão>.tar.xz && cd linux-<versão>'
          ),
          sl(
            'Configuração: .config, menuconfig e companhia',
            'A configuração do kernel fica no arquivo .config na raiz da árvore, com milhares de opções CONFIG_*: y (embutida no kernel), m (módulo carregável) ou n (ausente). make menuconfig abre uma interface em texto para navegar e buscar (tecla /). Pontos de partida: copiar a configuração da distribuição (cp /boot/config-$(uname -r) .config) e rodar make olddefconfig (ou oldconfig) para atualizar às novas opções; make defconfig para um padrão da arquitetura; make localmodconfig para manter só os módulos atualmente carregados (kernel enxuto, mas SÓ para a máquina onde foi gerado: hardware não conectado deixa de ser suportado). Regra de ouro: o que é necessário para montar a raiz (driver do disco e sistema de arquivos) deve estar embutido (y) ou no initramfs. Para compilar são necessários compilador (gcc), make, flex, bison e cabeçalhos de OpenSSL e libelf. Guarde o .config no controle de versão: ele é a "receita" do seu kernel.',
            'cp /boot/config-$(uname -r) .config\nmake olddefconfig           # aceita padrões para opções novas\nmake menuconfig             # ajustes finos (tecla / para buscar)\ngrep -E "CONFIG_EXT4_FS|CONFIG_NVME" .config   # y = embutido, m = módulo'
          ),
          sl(
            'Compilar e instalar',
            'make -j$(nproc) compila em paralelo (o tempo varia muito com a máquina e a configuração). Produz o vmlinux (ELF não comprimido, usado por depuradores), a imagem de boot (em x86, arch/x86/boot/bzImage, comprimida) e os módulos .ko. make modules_install copia os módulos para /lib/modules/<versão> (precisa de root). make install instala em /boot a imagem (vmlinuz-<versão>), o System.map e o config, e chama os scripts da distribuição para gerar o initramfs e atualizar o bootloader. Defina CONFIG_LOCALVERSION (por exemplo, "-teste") para que a versão do seu kernel seja distinta e NÃO sobrescreva o kernel atual em /lib/modules e /boot. Confira antes que há espaço suficiente em /boot e em disco: árvore e objetos podem ocupar vários GiB.',
            'make -j"$(nproc)"\nsudo make modules_install      # /lib/modules/<versão>-teste\nsudo make install              # /boot/vmlinuz-<versão>-teste, System.map, config\ndf -h /boot                    # confira o espaço ANTES'
          ),
          sl(
            'initramfs, bootloader e parâmetros de boot',
            'Depois de instalar, o kernel novo precisa de um initramfs (o pequeno sistema de arquivos em memória que traz os drivers para montar a raiz) e de uma entrada no bootloader. O initramfs é gerado por update-initramfs -c -k <versão> (Debian/Ubuntu), dracut --force (família RHEL) ou mkinitcpio -P (Arch). O menu do GRUB é atualizado por update-grub (Debian/Ubuntu) ou grub2-mkconfig -o <caminho do grub.cfg> (RHEL; o caminho varia, também com UEFI); no systemd-boot, kernel-install cuida das entradas. Os parâmetros de boot são passados ao kernel na linha de comando: /proc/cmdline mostra os atuais; para um teste pontual, edite a entrada no GRUB (tecla e) e inicialize com Ctrl-X sem alterar nada em disco; para fixar, edite GRUB_CMDLINE_LINUX em /etc/default/grub e regenere o menu.',
            'sudo update-initramfs -c -k <versão>-teste     # Debian/Ubuntu\nsudo update-grub                                 # regenera o menu\ncat /proc/cmdline                                # ex.: BOOT_IMAGE=... root=UUID=... ro quiet'
          ),
          sl(
            'LTS vs mainline, módulos externos e DKMS',
            'O kernel.org mantém: a linha mainline (onde entram as novidades, mantida por Linus Torvalds), as séries stable (correções para versões recentes por um período curto) e as longterm (LTS), com suporte por vários anos, listadas na página de releases. Para servidores em produção, prefira LTS ou o kernel da distribuição, que aplica correções de segurança e backports; mainline serve para quem precisa de recurso novo ou quer testar. Módulos externos (fora da árvore), como alguns drivers de GPU, ZFS ou VirtualBox, precisam ser recompilados para cada kernel, pois a API interna não é estável. O DKMS automatiza isso: registra o código-fonte do módulo e o recompila a cada novo kernel instalado, desde que os cabeçalhos do kernel (headers) estejam instalados; dkms status lista. Com Secure Boot, esses módulos precisam ser assinados (chave MOK), senão o kernel os recusa. Módulos proprietários ou externos marcam o kernel como tainted.',
            'dkms status                               # módulos externos e kernels (exemplo)\nsudo apt install linux-headers-$(uname -r)   # cabeçalhos para o kernel atual (Debian/Ubuntu)\ncat /proc/sys/kernel/tainted                 # diferente de 0 = há módulo externo/proprietário, etc.'
          ),
          sl(
            'Fallback e segurança: não perca o acesso à máquina',
            'O risco principal é o sistema não inicializar: configuração sem o driver do disco ou do sistema de arquivos da raiz, initramfs ausente, caminho errado no bootloader. O sintoma típico é kernel panic com "VFS: Unable to mount root fs". Medidas: (1) mantenha SEMPRE o kernel antigo instalado e funcional; ele aparece no menu avançado do GRUB e é a rota de volta; (2) faça backup de /boot e do .config; (3) teste primeiro em uma VM idêntica; (4) tenha acesso fora de banda (console da nuvem, KVM) para máquinas remotas; (5) em Secure Boot, kernel e módulos próprios precisam de assinatura aceita pelo firmware/MOK, senão não sobem; (6) compile apenas de fontes verificadas e registre a versão, o .config e o hash da imagem gerada. Não há garantia de que a compilação funcione na primeira tentativa: trate como mudança planejada, com janela e plano de reversão.',
            '# no GRUB: "Advanced options" -> escolha o kernel antigo (fallback)\nuname -r                       # confirme qual kernel está rodando\nls /boot/vmlinuz-*             # mantenha o anterior instalado\n# NÃO remova o kernel antigo antes de validar o novo por alguns ciclos de uso'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a forma adequada de verificar o tarball do kernel baixado de kernel.org?', 'c', [
          'Comparar o tamanho do arquivo com o publicado na página de download',
          'Conferir um SHA-256 publicado no mesmo site, que já basta para garantir autenticidade do arquivo e da origem',
          'Verificar a assinatura PGP com a chave do mantenedor, conferida por canal independente',
          'Descompactar e compilar; se compilar sem erros, o código é confiável, sem precisar de assinaturas'
        ], 'Hash do mesmo local não prova autenticidade; assinatura com chave confiável, sim. Compilar sem erro nada diz sobre código malicioso.'),
        mcq('q2', 'No .config, qual é o significado de CONFIG_NVME_CORE=m e de CONFIG_EXT4_FS=y?', 'd', [
          'm = desabilitado; y = obrigatório em hardware recente',
          'm = embutido no kernel; y = carregado como módulo sob demanda',
          'Ambas significam módulo, com y só indicando uma versão mais nova',
          'm = módulo carregável (.ko); y = embutido na imagem do kernel'
        ], 'y inclui o código no kernel; m gera um módulo; n omite. O que é necessário para montar a raiz deve estar embutido ou no initramfs.'),
        mcq('q3', 'Um módulo externo compilado via DKMS deixa de carregar após a instalação de um kernel novo. Qual é a causa mais provável?', 'b', [
          'O kernel novo apagou todos os módulos do sistema como parte da instalação e os substituiu por versões embutidas do próprio kernel',
          'O módulo não foi recompilado para o novo kernel (faltam headers, erro de build) ou não está assinado sob Secure Boot',
          'DKMS só funciona com kernels LTS e recusa kernels mainline',
          'O initramfs não aceita módulos fora da árvore, em nenhuma circunstância'
        ], 'A API interna muda entre versões; módulos externos precisam ser recompilados (DKMS automatiza, se houver headers). Em Secure Boot, devem estar assinados. dkms status ajuda a diagnosticar.'),
        fill('q4', 'Complete com o alvo do make que copia os módulos compilados para /lib/modules/<versão>.', 'sudo make ___', ['modules_install'], 'make modules_install instala os .ko em /lib/modules/<versão>; make install instala a imagem, System.map e config em /boot.'),
        mcq('q5', 'Qual é uma sequência razoável de passos depois de make modules_install, para o kernel novo ficar bootável (Debian/Ubuntu)?', 'a', [
          'Imagem em /boot, initramfs (update-initramfs) e menu (update-grub), mantendo o kernel antigo',
          'Remover o kernel antigo, para evitar conflito de módulos, e reiniciar imediatamente sem conferir o menu',
          'Editar /etc/fstab para apontar para o novo kernel e dispensar o bootloader',
          'Executar sysctl --system para que o kernel novo seja carregado sem reiniciar, sem editar o bootloader'
        ], 'Imagem em /boot, initramfs e entrada no bootloader são os três pontos. O kernel antigo deve ser mantido como rota de volta; sysctl não troca de kernel.'),
        mcq('q6', 'Para um servidor de produção, qual escolha de kernel costuma ser mais prudente?', 'c', [
          'A última versão mainline, por ter todos os recursos recém-incluídos e pouca idade',
          'Um kernel compilado por conta própria, sem revisar a configuração, para reduzir a superfície e dispensar atualizações',
          'Um kernel LTS (ou o da distribuição), que recebe correções de segurança e backports por vários anos',
          'O kernel mais antigo disponível, pois versões antigas não recebem vulnerabilidades'
        ], 'LTS e kernels de distribuição recebem correções por longos períodos. Mainline serve a quem precisa de novidades e aceita mais mudanças; kernel antigo sem manutenção acumula vulnerabilidades.'),
        mcq('q7', 'Após instalar um kernel customizado, o boot termina em "VFS: Unable to mount root fs". Qual é a causa típica e o procedimento?', 'd', [
          'O disco quebrou fisicamente; trocar o disco e restaurar o backup',
          'O GRUB está corrompido, e o kernel antigo também não vai subir',
          'O kernel antigo foi apagado pela instalação, e não há como voltar, o que obriga a reinstalar o sistema inteiro do zero',
          'Falta o driver do disco ou do sistema de arquivos da raiz; usar o kernel antigo no GRUB e corrigir a config'
        ], 'Esse é o sintoma clássico de configuração sem o driver necessário. Por isso se mantém o kernel antigo e se testa antes em VM. Disco defeituoso não explicaria um kernel antigo funcionando.'),
        fill('q8', 'Complete com o arquivo de /proc que mostra os parâmetros de boot usados pelo kernel atual.', 'cat /proc/___', ['cmdline'], '/proc/cmdline mostra a linha de comando do kernel, como root=UUID=... e quiet.')
      ]
    },
    {
      id: 'lna-14-boot-avancado-firmware',
      title: 'Boot avançado e firmware',
      goal: 'Entender UEFI, ESP, Secure Boot, GRUB e systemd-boot, initramfs, recuperação (rd.break, init=, chroot), TPM2 e cloud-init, com os cuidados de segurança.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'UEFI vs BIOS, ESP e variáveis EFI',
            'O BIOS legado lê o MBR (os primeiros 512 bytes do disco, com um pequeno código de boot e a tabela de partições de até 4 entradas primárias) e executa seu código. O UEFI é o firmware moderno: entende GPT, lê arquivos executáveis (.efi) de uma partição especial, a ESP (EFI System Partition, formatada em FAT, tipicamente montada em /boot/efi ou /efi) e guarda a configuração de boot em variáveis EFI na NVRAM: BootOrder (a ordem) e Boot0000, Boot0001... (cada entrada aponta para um arquivo .efi, por exemplo EFI/<distro>/grubx64.efi). O efibootmgr lê e altera essas variáveis; ls /sys/firmware/efi existe somente se o sistema foi iniciado em modo UEFI. AVISO: apagar entradas de boot, reformatar a ESP ou mexer na tabela de partições pode deixar o sistema sem boot; faça backup (da ESP e da tabela de partições) e ensaie em uma VM antes de mexer em máquinas reais.',
            'ls /sys/firmware/efi >/dev/null && echo UEFI || echo BIOS   # como foi o boot\nefibootmgr -v                    # exemplo (varia)\n# BootCurrent: 0001\n# BootOrder: 0001,0000\n# Boot0001* debian  HD(1,GPT,...)/File(\\EFI\\debian\\shimx64.efi)\nfindmnt /boot/efi                # onde a ESP está montada'
          ),
          sl(
            'Secure Boot: shim e MOK',
            'No Secure Boot, o firmware só executa código assinado por chaves em que confia (banco db). As distribuições usam o shim: um pequeno carregador assinado por uma autoridade que os firmwares comuns já confiam; o shim, por sua vez, valida o GRUB e o kernel com a chave da própria distribuição ou com chaves cadastradas pelo dono da máquina, as MOK (Machine Owner Keys). Isso forma uma CADEIA DE CONFIANÇA: firmware, shim, GRUB, kernel e, com o lockdown, módulos assinados. Para carregar um módulo externo (por exemplo, via DKMS) com Secure Boot, é preciso assiná-lo com uma chave e cadastrar o certificado com mokutil --import; no próximo boot, uma tela do MOK Manager pede a confirmação com a senha escolhida. mokutil --sb-state mostra se o Secure Boot está ativo. Proteja a chave privada de assinatura como um segredo crítico: quem a possui pode assinar código aceito pela máquina.',
            'mokutil --sb-state                          # SecureBoot enabled (exemplo)\nsudo mokutil --import /var/lib/dkms/mok.pub   # cadastra a chave (pede senha de uso único)\nmokutil --list-enrolled | head\n# cadeia: firmware -> shim -> GRUB -> kernel -> módulos assinados'
          ),
          sl(
            'GRUB vs systemd-boot',
            'O GRUB é um bootloader completo, para BIOS e UEFI, que entende muitos sistemas de arquivos, LVM e criptografia; seu menu é gerado a partir de scripts em /etc/grub.d e das opções de /etc/default/grub, produzindo o arquivo de configuração (em /boot/grub/grub.cfg ou equivalente), que não se edita à mão: regenere com update-grub ou grub2-mkconfig. O systemd-boot (antes gummiboot) é um gerenciador UEFI minimalista: não tem scripts, lê entradas declarativas em arquivos /loader/entries/*.conf (a Boot Loader Specification), com as linhas title, linux, initrd e options (a linha de comando do kernel), e kernel e initrd ficam na ESP ou em uma partição de boot estendida; bootctl status mostra o estado. Menos código e configuração, mas somente UEFI. Há ainda as imagens unificadas (UKI): kernel, initramfs e linha de comando em um só arquivo .efi, que podem ser assinados em conjunto.',
            '# entrada do systemd-boot (exemplo): /boot/loader/entries/debian.conf\ntitle   Debian\nlinux   /vmlinuz-<versão>\ninitrd  /initrd.img-<versão>\noptions root=UUID=<uuid> ro quiet\n# bootctl status   |   update-grub (GRUB, Debian/Ubuntu)'
          ),
          sl(
            'initramfs e as etapas do espaço de usuário inicial',
            'O bootloader carrega o kernel e o initramfs, um pequeno arquivo cpio (comprimido) que o kernel descompacta na memória e usa como raiz temporária. Seu script ou programa /init (ou um systemd mínimo) prepara o necessário para chegar à raiz verdadeira: carrega módulos de armazenamento (NVMe, RAID, dm-crypt), ativa o LVM e o RAID, abre o volume LUKS (pedindo a senha), localiza a raiz pelo parâmetro root= do kernel (root=UUID=..., root=LABEL=... ou root=/dev/mapper/vg-raiz), monta-a e executa a troca (switch_root) para o init do sistema real, normalmente o systemd. Se algo falha nesta fase, você cai em um shell do initramfs (ou o kernel entra em panic). É gerado por dracut, mkinitcpio ou initramfs-tools, conforme a distribuição, e pode ser inspecionado com lsinitramfs (Debian) ou lsinitrd (dracut). O initramfs deve conter o que a raiz exige: um driver ausente impede o boot.',
            'lsinitramfs /boot/initrd.img-$(uname -r) | grep -E "nvme|dm-crypt" | head -3   # Debian/Ubuntu\ncat /proc/cmdline    # root=UUID=<uuid> ro quiet (exemplo)\n# fluxo: kernel -> initramfs (/init) -> módulos, LVM/RAID, LUKS -> monta raiz -> switch_root -> systemd'
          ),
          sl(
            'Recuperação: rd.break, init= e chroot por live USB',
            'No GRUB, editando a entrada (tecla e) para um boot pontual, parâmetros de recuperação: systemd.unit=rescue.target ou emergency.target (modo de resgate), init=/bin/bash (executa um shell como processo 1, no lugar do systemd, com a raiz montada somente leitura: mount -o remount,rw / para alterar) e, em sistemas com dracut, rd.break (interrompe no initramfs, antes da troca de raiz; a raiz real fica em /sysroot: mount -o remount,rw /sysroot e chroot /sysroot; em SELinux, crie /.autorelabel ao alterar senhas). Quando o sistema nem chega ao GRUB, use um live USB: identifique as partições (lsblk), monte a raiz em /mnt e a ESP em /mnt/boot/efi, faça bind mounts de /dev, /proc, /sys e /run, execute chroot /mnt e reinstale o bootloader e o initramfs (grub-install e update-grub; update-initramfs ou dracut). SEGURANÇA: quem tem acesso físico ou ao console controla a máquina por esses caminhos; mitigue com senha no GRUB, disco cifrado (LUKS: sem a frase-senha, init=/bin/bash não enxerga os dados), Secure Boot e proteção do acesso ao console da nuvem. AVISO: grub-install no disco errado pode destruir o boot de outro sistema; ensaie na VM e confirme o dispositivo com lsblk.',
            '# do live USB (exemplo; sdXN = placeholders)\nsudo mount /dev/sdX2 /mnt && sudo mount /dev/sdX1 /mnt/boot/efi\nfor d in dev proc sys run; do sudo mount --rbind /$d /mnt/$d; done\nsudo chroot /mnt\nupdate-initramfs -u -k all && update-grub'
          ),
          sl(
            'TPM2, medição de boot e cloud-init',
            'O TPM2 é um chip (ou firmware equivalente) que guarda chaves e registra o que foi executado no boot. Cada componente (firmware, bootloader, kernel, linha de comando) tem seu hash ESTENDIDO em um PCR (Platform Configuration Register): um valor que só pode ser combinado com novos hashes, nunca regravado, e que, portanto, resume toda a cadeia de boot. Usos: atestação (provar a um servidor remoto que o boot foi íntegro) e liberação de segredos: com systemd-cryptenroll --tpm2-device=auto, a chave do LUKS só é liberada se os PCRs escolhidos tiverem os valores esperados, o que permite desbloqueio automático sem senha, mas só se o boot não foi alterado. tpm2_pcrread (do pacote tpm2-tools) lista os PCRs. Em nuvem, o cloud-init roda no primeiro boot, lê metadados e user-data do serviço de metadados (endereço link-local 169.254.169.254, ou disco de configuração) e configura hostname, usuários, chaves SSH, pacotes e scripts. Cuidado: o user-data costuma ser legível a quem alcança o serviço de metadados: NÃO coloque senhas ou chaves privadas nele; busque segredos em um cofre após o boot.',
            'sudo tpm2_pcrread sha256:0,7              # PCRs de firmware (0) e Secure Boot (7)\ncloud-init status --long                    # estado do cloud-init\n#cloud-config\n# users:\n#   - name: ops\n#     ssh_authorized_keys: [ "<chave-publica>" ]   # só chaves PÚBLICAS; nunca segredos'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual afirmação sobre UEFI, ESP e bootloaders está correta?', 'b', [
          'O UEFI lê o primeiro setor do disco e executa o código do MBR, e a ESP guarda só o /home',
          'O UEFI carrega arquivos .efi da ESP (FAT) indicados por variáveis na NVRAM, e o systemd-boot é um gerenciador UEFI com entradas declarativas em /loader/entries',
          'A ESP é uma partição ext4 de swap, e o efibootmgr edita o grub.cfg diretamente',
          'O GRUB funciona só em BIOS, e o systemd-boot funciona só em BIOS com MBR'
        ], 'UEFI usa GPT e a ESP em FAT com executáveis .efi; as entradas ficam em variáveis (efibootmgr). O systemd-boot é só UEFI e usa arquivos de entrada declarativos. O GRUB roda em BIOS e UEFI.'),
        mcq('q2', 'No Secure Boot em uma distribuição comum, qual é a função do shim e das MOK?', 'c', [
          'O shim cifra o disco, e as MOK guardam as senhas dos usuários',
          'O shim substitui o kernel, e as MOK são módulos carregados no initramfs',
          'O shim, assinado por autoridade confiável pelo firmware, valida o GRUB e o kernel; as MOK permitem ao dono cadastrar chaves próprias (por exemplo, para módulos DKMS)',
          'O shim desativa o Secure Boot após o primeiro boot, e as MOK desativam o TPM'
        ], 'O shim estende a confiança do firmware para a distribuição, e as MOK dão ao dono da máquina o controle de chaves adicionais. A chave privada de assinatura deve ser tratada como segredo crítico.'),
        mcq('q3', 'Durante o boot, o sistema cai em um shell do initramfs com a mensagem de que a raiz não foi encontrada. Qual é uma causa plausível?', 'a', [
          'O parâmetro root= aponta para um UUID inexistente, ou falta no initramfs o driver do disco, do RAID/LVM ou do LUKS',
          'O GRUB não conseguiu carregar a rede, o que impede o boot por DHCP',
          'O TPM2 apagou os PCRs por segurança, e a raiz foi descartada',
          'O cloud-init removeu a partição raiz na primeira inicialização'
        ], 'O initramfs precisa de drivers e do root= correto para montar a raiz. UUID errado, módulo ausente ou volume não aberto levam ao shell de emergência.'),
        fill('q4', 'Complete com o comando que lista e edita as entradas e a ordem de boot UEFI.', '___ -v', ['efibootmgr'], 'efibootmgr -v mostra BootOrder e cada entrada Boot####; alterações erradas podem deixar a máquina sem boot, por isso se testa em VM.'),
        mcq('q5', 'Você esqueceu a senha de root de um servidor com disco NÃO cifrado e acesso ao console. Qual procedimento e qual cuidado de segurança correspondem a rd.break/init=?', 'd', [
          'Reinstalar o sistema, pois não há outro caminho; essas opções do GRUB só existem em modo BIOS',
          'Usar o parâmetro rd.break para formatar a raiz e recomeçar do zero, já com a senha nova',
          'Trocar a senha pelo cloud-init, que lê a senha do TPM2',
          'Editar a entrada no GRUB (init=/bin/bash ou rd.break), remontar a raiz com escrita, trocar a senha e relabel em SELinux; e reduzir o risco com senha no GRUB e disco cifrado, pois quem tem o console controla a máquina'
        ], 'Acesso físico/console permite esses caminhos de recuperação. Mitigações: senha no GRUB, LUKS (sem a frase-senha os dados não são lidos), Secure Boot e proteção do console remoto.'),
        mcq('q6', 'O que significa estender um PCR no TPM2, e para que serve na prática?', 'c', [
          'Aumentar o tamanho da partição cifrada, para caber mais dados protegidos',
          'Gravar a senha do LUKS em texto claro em um registrador do TPM2',
          'Combinar o hash de cada componente do boot em um valor que não pode ser regravado, permitindo atestação e a liberação de chaves só se o boot for o esperado',
          'Copiar o kernel para a NVRAM, de modo que o GRUB seja dispensável'
        ], 'PCRs só aceitam extensão (novo valor = hash do antigo com o novo componente). Resumem a cadeia de boot e permitem, por exemplo, que o LUKS só abra com o boot íntegro.'),
        mcq('q7', 'Uma equipe quer passar a senha do banco de dados no user-data do cloud-init de instâncias na nuvem, por ser prático. Qual é a avaliação correta?', 'b', [
          'É seguro, pois o user-data só é lido no primeiro boot e depois é apagado do serviço de metadados',
          'É inadequado: o user-data costuma ser acessível a quem alcança o serviço de metadados e pode aparecer em logs; use um cofre/KMS com identidade da instância',
          'É seguro se o endereço 169.254.169.254 for bloqueado só no navegador',
          'É a forma recomendada, desde que a senha seja codificada em base64'
        ], 'Base64 não é cifra, e o user-data não é um local para segredos. Use identidade da instância e um cofre (Vault/KMS), restrinja o acesso ao serviço de metadados e não registre segredos em logs.'),
        fill('q8', 'Complete com o diretório de /sys/firmware cuja existência indica que o sistema foi iniciado em modo UEFI.', 'ls /sys/firmware/___', ['efi', '/efi'], 'Em boot UEFI existe /sys/firmware/efi (com as variáveis em efivars); em BIOS legado, não.')
      ]
    },
    {
      id: 'lna-15-systemd-avancado',
      title: 'systemd avançado',
      goal: 'Dominar ordenação vs dependência, ativação por socket, sandboxing de serviços, limites de recursos, watchdog, journald e systemd-analyze, com um unit file endurecido.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Ordenação vs dependência e geradores',
            'No systemd, ORDENAÇÃO e DEPENDÊNCIA são coisas distintas. After= e Before= só definem a ordem de inicialização QUANDO ambas as units estão sendo iniciadas: não puxam nada. Wants= e Requires= definem dependência: ativar esta unit também ativa a outra (Wants= é fraco: se a outra falhar, esta segue; Requires= é forte: se a outra falhar ou for parada, esta também). Para depender E esperar, combine: Requires=postgresql.service junto de After=postgresql.service; e para esperar a rede de fato configurada, Wants=network-online.target com After=network-online.target (network.target apenas indica que a pilha foi iniciada). Há ainda Conflicts=, BindsTo= e PartOf=. Os geradores são programas (em /usr/lib/systemd/system-generators) executados bem cedo no boot que CRIAM units dinamicamente a partir de outras fontes: o systemd-fstab-generator transforma /etc/fstab em units .mount e .swap, por exemplo. systemctl list-dependencies mostra a árvore.',
            '[Unit]\nDescription=Meu app\nRequires=postgresql.service       # dependência forte\nAfter=postgresql.service          # ordem: depois do banco\nWants=network-online.target\nAfter=network-online.target\n# systemctl list-dependencies meuapp.service'
          ),
          sl(
            'Ativação por socket e por barramento',
            'Na ativação por socket, o systemd cria e escuta o socket (uma unit .socket) ANTES de o serviço existir; quando chega o primeiro cliente, ele inicia o .service e entrega o descritor já aberto (variáveis de ambiente LISTEN_FDS e LISTEN_PID; a biblioteca sd_listen_fds ajuda). Vantagens: sockets podem ser todos abertos no início, sem se preocupar com ordem de dependência (paralelismo no boot); o serviço pode iniciar sob demanda e ser reiniciado sem perder conexões em fila (o kernel as mantém no socket); privilégios podem ser menores, pois o systemd abre portas baixas. A ativação por barramento (D-Bus) é análoga: o serviço com BusName= inicia quando alguém envia mensagem para aquele nome. Também existem units .path (inicia por mudança em arquivo) e .timer (agenda, substituto moderno do cron).',
            '# meuapp.socket (exemplo)\n[Socket]\nListenStream=8080\n[Install]\nWantedBy=sockets.target\n# meuapp.service é iniciado no primeiro acesso e recebe o fd 3 (LISTEN_FDS=1)\nsystemctl list-sockets'
          ),
          sl(
            'Sandboxing de serviços',
            'O systemd oferece, na própria unit, camadas de isolamento. NoNewPrivileges=yes impede ganhar privilégios por execve. ProtectSystem=strict monta toda a hierarquia de arquivos como somente leitura (exceto /dev, /proc e /sys); full cobre /usr, /boot e /etc; as exceções graváveis vão em ReadWritePaths= (ou em StateDirectory=, que cria /var/lib/<nome> gravável). ProtectHome=yes torna /home, /root e /run/user inacessíveis. PrivateTmp=yes dá ao serviço /tmp e /var/tmp próprios. PrivateDevices=yes expõe só um /dev mínimo, sem dispositivos físicos. CapabilityBoundingSet= limita as capabilities (vazio = nenhuma). SystemCallFilter=@system-service permite só o grupo de syscalls típico de serviços (um prefixo ~ nega). RestrictAddressFamilies=AF_INET AF_INET6 AF_UNIX restringe os tipos de socket. Outros: ProtectKernelTunables, ProtectKernelModules, ProtectControlGroups, RestrictNamespaces, LockPersonality e MemoryDenyWriteExecute (que pode quebrar programas com JIT, como Java e Node). systemd-analyze security meuapp.service dá uma nota de exposição (menor é melhor) e lista o que falta.',
            'systemd-analyze security meuapp.service    # exemplo: tabela de itens e "Overall exposure level"\n# o objetivo não é nota zero: é reduzir o que o serviço realmente não precisa'
          ),
          sl(
            'Exemplo de unit endurecida',
            'Um serviço de exemplo, sem segredos, rodando como usuário próprio (criado com useradd --system), com gravação permitida apenas em /var/lib/meuapp (via StateDirectory=), sem capabilities, com filtro de syscalls e limites de recursos. Ao adotar em um serviço real, ative as diretivas aos poucos e teste: um ProtectSystem=strict pode causar erro de "Read-only file system" se o programa gravar em outro caminho (a solução é ReadWritePaths= ou StateDirectory=, não desligar o isolamento). Verifique com systemd-analyze verify e systemd-analyze security.',
            '# /etc/systemd/system/meuapp.service\n[Unit]\nDescription=Meu app (exemplo endurecido)\nAfter=network.target\n\n[Service]\nType=simple\nUser=meuapp\nGroup=meuapp\nExecStart=/opt/meuapp/bin/meuapp --porta 8080\nRestart=on-failure\nRestartSec=5\nNoNewPrivileges=yes\nProtectSystem=strict\nProtectHome=yes\nPrivateTmp=yes\nPrivateDevices=yes\nProtectKernelTunables=yes\nProtectKernelModules=yes\nProtectControlGroups=yes\nRestrictAddressFamilies=AF_INET AF_INET6 AF_UNIX\nRestrictNamespaces=yes\nLockPersonality=yes\nCapabilityBoundingSet=\nSystemCallFilter=@system-service\nSystemCallArchitectures=native\nStateDirectory=meuapp\nMemoryMax=512M\nCPUQuota=100%\nTasksMax=200\n\n[Install]\nWantedBy=multi-user.target'
          ),
          sl(
            'Controle de recursos, Restart=, watchdog e sd_notify',
            'As propriedades de recursos viram arquivos de cgroup: MemoryMax= (memory.max, limite rígido), MemoryHigh= (limite brando), CPUQuota=150% (cpu.max "150000 100000", ou seja, 1,5 CPU), CPUWeight=, TasksMax= (pids.max) e IOWeight=. Restart= define a política de reinício: no, on-failure (saída não zero, sinal ou timeout), on-abnormal, on-abort e always, com RestartSec= de espera; StartLimitIntervalSec= e StartLimitBurst= impedem laços de reinício infinitos. Com Type=notify, o serviço informa ao systemd que ficou PRONTO enviando READY=1 pelo socket indicado em NOTIFY_SOCKET (função sd_notify, ou o comando systemd-notify). Com WatchdogSec=30, o serviço precisa enviar WATCHDOG=1 periodicamente (dentro desse intervalo); se parar de enviar, o systemd o considera travado, o encerra e aplica o Restart=. Assim se detecta travamento, não apenas queda.',
            '[Service]\nType=notify\nNotifyAccess=main\nWatchdogSec=30\nRestart=on-failure\n# no programa: sd_notify(0, "READY=1");  periodicamente: sd_notify(0, "WATCHDOG=1");\n# em shell (exemplo): systemd-notify --ready ; systemd-notify WATCHDOG=1'
          ),
          sl(
            'journald: formato, persistência e limites',
            'O journald armazena logs em formato binário indexado, com campos estruturados (_SYSTEMD_UNIT, _PID, PRIORITY, MESSAGE...), que permitem consultas precisas: journalctl -u meuapp -p err --since "1 hour ago", e saída -o json para integrar. A persistência é configurada em /etc/systemd/journald.conf (Storage=): volatile guarda só em memória (/run/log/journal, perdido no reboot), persistent grava em /var/log/journal e auto persiste se esse diretório existir. Limites: SystemMaxUse= (máximo em disco), SystemKeepFree= (espaço a preservar) e MaxRetentionSec= (idade). Manutenção: journalctl --disk-usage e journalctl --vacuum-time=2weeks. Privacidade (LGPD): logs podem registrar dados pessoais (IPs, identificadores, mensagens): defina retenção mínima necessária, restrinja leitura (grupos systemd-journal/adm) e evite registrar dados sensíveis nas aplicações.',
            'journalctl --disk-usage                          # exemplo: Archived and active journals take up 120M\nsudo journalctl --vacuum-time=2weeks\n# /etc/systemd/journald.conf\n[Journal]\nStorage=persistent\nSystemMaxUse=500M\nMaxRetentionSec=1month'
          ),
          sl(
            'systemd-analyze e systemd-nspawn',
            'systemd-analyze blame lista as units pelo tempo que levaram para iniciar (útil, mas units lentas em paralelo nem sempre atrasam o boot). systemd-analyze critical-chain [unit] mostra a CADEIA CRÍTICA, isto é, a sequência de units que determina o tempo total, com @ (momento em que a unit iniciou) e + (duração): é ali que se ganha tempo. systemd-analyze verify arquivo.service checa a sintaxe e as dependências de uma unit. O systemd-nspawn executa um contêiner de sistema operacional leve, a partir de um diretório ou imagem com uma árvore do SO, usando namespaces e cgroups; machinectl lista e controla essas máquinas (list, shell, login, poweroff) e as imagens ficam em /var/lib/machines. É útil para testes e isolamento simples, sem a camada de um runtime de containers de aplicação.',
            'systemd-analyze blame | head -3          # exemplo (varia)\n# 8.2s NetworkManager-wait-online.service\nsystemd-analyze critical-chain\n# multi-user.target @9.1s\n#  └─network-online.target @9.0s\nsudo machinectl list'
          )
        ]
      },
      questions: [
        mcq('q1', 'Uma unit tem After=postgresql.service, mas não tem Wants= nem Requires=. O que acontece ao iniciar apenas essa unit?', 'd', [
          'O PostgreSQL é iniciado primeiro, pois After= cria a dependência',
          'A unit falha, porque After= exige que a outra já esteja ativa',
          'O PostgreSQL é iniciado em paralelo, sem ordem definida',
          'O PostgreSQL não é iniciado; After= apenas ordena se ambos estiverem na mesma transação de inicialização'
        ], 'Ordenação e dependência são independentes: After= só define a ordem; para puxar a outra unit é preciso Wants= ou Requires=, normalmente combinados com After=.'),
        mcq('q2', 'Qual é uma vantagem da ativação por socket?', 'a', [
          'O socket permanece aberto no systemd, então conexões em fila não se perdem enquanto o serviço reinicia, e o serviço pode iniciar sob demanda',
          'O serviço dispensa qualquer tipo de limite de recursos ou isolamento',
          'O serviço passa a rodar dentro do kernel, o que dispensa troca de contexto',
          'O firewall deixa de ser necessário, pois o socket só aceita conexões locais'
        ], 'O systemd mantém o socket e entrega o descritor ao serviço; o kernel enfileira conexões enquanto o serviço inicia ou reinicia. Não tem relação com firewall ou execução no kernel.'),
        mcq('q3', 'Após adicionar ProtectSystem=strict, um serviço que grava cache em /var/cache/meuapp passa a falhar com "Read-only file system". Qual é a correção adequada?', 'c', [
          'Remover ProtectSystem= e todas as demais diretivas de isolamento da unit, já que o isolamento é incompatível com serviços de rede',
          'Rodar o serviço como root, que ignora montagens só leitura',
          'Conceder o caminho necessário com ReadWritePaths=/var/cache/meuapp (ou CacheDirectory=/StateDirectory=)',
          'Adicionar PrivateDevices=no, para liberar a escrita em /var'
        ], 'strict deixa tudo somente leitura exceto o que for liberado explicitamente. ReadWritePaths=, StateDirectory= ou CacheDirectory= mantêm o isolamento, abrindo só o caminho exigido.'),
        fill('q4', 'Complete com o subcomando do systemd-analyze que dá uma nota de exposição de segurança de uma unit.', 'systemd-analyze ___ meuapp.service', ['security'], 'systemd-analyze security avalia diretivas de sandboxing e aponta o que falta endurecer (menor nota de exposição é melhor).'),
        mcq('q5', 'Em uma unit aparecem CPUQuota=150%, MemoryMax=512M e TasksMax=200. Qual é a tradução correta para os controles do cgroup v2?', 'b', [
          'cpu.max "150 100"; memory.high 512M; pids.max 200 por usuário, sendo o limite de CPU em porcentagem',
          'cpu.max "150000 100000" (1,5 CPU); memory.max de 512 MiB (rígido); pids.max 200',
          'cpu.weight 150; memory.swap.max 512M; io.max 200',
          'cpu.max "15000 100000" (15%); memory.min 512M; pids.current 200, conforme o manual do kernel'
        ], '150% = 1,5 CPU = quota 150000 por período de 100000 µs. MemoryMax= é o limite rígido memory.max, e TasksMax= vira pids.max.'),
        mcq('q6', 'Um serviço Type=notify com WatchdogSec=30 trava em um laço infinito, sem encerrar. O que o systemd faz?', 'c', [
          'Nada: sem sinais de erro do processo, ele não consegue saber que o serviço travou',
          'Reduz o CPUQuota até o serviço ceder',
          'Como o serviço deixou de enviar WATCHDOG=1 no intervalo, considera-o travado, o encerra e aplica a política de Restart=',
          'Envia o serviço ao journald para arquivamento e inicia uma réplica em outro host'
        ], 'O watchdog exige sinais periódicos pelo sd_notify. Sem eles, o systemd trata como falha e aplica o Restart=. Assim se detecta travamento, e não só queda.'),
        mcq('q7', 'Em um servidor, os logs do journald somem a cada reinício, e o disco precisa ficar protegido contra enchimento. Qual configuração atende?', 'b', [
          'Storage=volatile com SystemMaxUse=500M, que grava em /var/log/journal',
          'Storage=persistent (ou o diretório /var/log/journal existir com auto) e limites como SystemMaxUse= e MaxRetentionSec=',
          'Storage=none com MaxRetentionSec=1month, que guarda a retenção na NVRAM',
          'Storage=persistent sem limites, pois o journald apaga os logs sozinho ao encher o disco, respeitando o espaço livre do sistema'
        ], 'volatile guarda em /run (perdido no reboot). Persistência exige persistent (ou auto com o diretório), e os limites protegem o disco. A retenção também atende à minimização de dados pessoais.'),
        fill('q8', 'Complete com o valor de Restart= que reinicia o serviço quando ele sai com código não zero, por sinal ou timeout.', 'Restart=___', ['on-failure'], 'on-failure reinicia em falha; always reinicia sempre; no não reinicia. Combine com RestartSec= e limites de StartLimit*.')
      ]
    },
    {
      id: 'lna-16-seguranca-servidores-avancada',
      title: 'Segurança avançada de servidores',
      goal: 'Aplicar referências CIS/STIG, sysctl de hardening, SELinux/AppArmor com critério, auditd, integridade de arquivos, SSH com certificados, cadeia de suprimentos e gestão de segredos, sob um modelo de ameaças.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Referências: CIS Benchmarks e STIG',
            'Em vez de inventar uma lista de endurecimento, parta de referências reconhecidas. Os CIS Benchmarks (Center for Internet Security) são guias de configuração segura por sistema operacional, com recomendações numeradas, justificativas e comandos de verificação; costumam ter níveis (o Level 1 reúne práticas de baixo impacto, o Level 2 as mais restritivas, para ambientes de maior risco). As STIG (Security Technical Implementation Guides, publicadas pelo DISA, dos EUA) são requisitos detalhados, muito usados em ambientes governamentais. Ferramentas como OpenSCAP (oscap, com o conteúdo do SCAP Security Guide) e o Lynis avaliam o sistema contra esses perfis e geram relatórios. Use com critério: um scanner pode gerar falsos positivos, e cada controle tem impacto (por exemplo, desativar um serviço que sua aplicação usa). Fluxo: escolher o perfil, testar em ambiente de homologação, aplicar de forma automatizada, DOCUMENTAR as exceções com justificativa e reavaliar periodicamente.',
            'sudo lynis audit system                 # auditoria local (exemplo)\nsudo oscap xccdf eval --profile <perfil> --report relatorio.html <arquivo-do-conteudo.xml>\n# perfis e arquivos variam por distribuição; revise cada controle antes de aplicar'
          ),
          sl(
            'sysctl de endurecimento do kernel',
            'Parâmetros de segurança comuns (valide o efeito na sua carga antes de produção e persista em /etc/sysctl.d/): kernel.kptr_restrict=2 (esconde endereços do kernel em /proc, dificultando a exploração); kernel.dmesg_restrict=1 (dmesg só para quem tem privilégio, pois o log pode revelar endereços e detalhes do sistema); kernel.yama.ptrace_scope=1 (ptrace somente em descendentes, limita roubo de segredos da memória de outros processos); kernel.unprivileged_bpf_disabled=1 (eBPF só com privilégio); net.ipv4.conf.all.rp_filter=1 (filtro de caminho reverso: descarta pacotes cuja origem não seria roteada por aquela interface, o que combate falsificação de endereço de origem; cuidado com roteamento assimétrico); net.ipv4.conf.all.accept_redirects=0 e accept_source_route=0 (ignora redirecionamentos e roteamento pela origem); net.ipv4.tcp_syncookies=1 (resiste a inundação de SYN); fs.protected_hardlinks=1 e fs.protected_symlinks=1 (restringem links em diretórios com sticky bit, como /tmp, contra ataques de link) e fs.suid_dumpable=0 (sem core dumps de processos setuid).',
            '# /etc/sysctl.d/90-hardening.conf (exemplo; teste antes)\nkernel.kptr_restrict = 2\nkernel.dmesg_restrict = 1\nkernel.yama.ptrace_scope = 1\nnet.ipv4.conf.all.rp_filter = 1\nnet.ipv4.conf.all.accept_redirects = 0\nfs.protected_hardlinks = 1\nfs.protected_symlinks = 1\nfs.suid_dumpable = 0\n# aplicar: sudo sysctl --system'
          ),
          sl(
            'SELinux e AppArmor na prática (e o risco do audit2allow)',
            'No SELinux, antes de alterar a política, use o que já existe: os BOOLEANOS (getsebool -a lista; setsebool -P httpd_can_network_connect on liga de forma persistente), os RÓTULOS de arquivos (semanage fcontext -a -t httpd_sys_content_t "/srv/site(/.*)?" seguido de restorecon -Rv /srv/site) e as PORTAS (semanage port -a -t http_port_t -p tcp 8080). Negações aparecem como AVC no log de auditoria: ausearch -m avc -ts recent. O audit2allow gera um módulo de política a partir dessas negações, e AÍ está o risco: ele libera tudo o que foi negado, inclusive acessos que eram, justamente, bloqueio de um ataque ou de um erro de rótulo. Regra: entenda cada negação, prefira corrigir rótulo ou booleano, gere regras mínimas, revise o arquivo .te antes de instalar, e nunca deixe setenforce 0 como solução permanente. No AppArmor, os perfis ficam em /etc/apparmor.d/; comece em modo complain (aa-complain), gere e revise regras com aa-logprof, e passe a enforce (aa-enforce); aa-status mostra o estado.',
            'getsebool httpd_can_network_connect\nsudo semanage fcontext -a -t httpd_sys_content_t "/srv/site(/.*)?"\nsudo restorecon -Rv /srv/site\nsudo ausearch -m avc -ts recent | audit2allow     # só LER a sugestão; revise antes de usar -M'
          ),
          sl(
            'Regras auditd úteis e integridade de arquivos (AIDE)',
            'Regras auditd com bom retorno para pouco ruído, em /etc/audit/rules.d/*.rules (carregadas com augenrules --load): observar identidade e privilégio (-w /etc/passwd -p wa -k identidade; o mesmo para /etc/shadow, /etc/group e /etc/sudoers), carregamento de módulos do kernel (-a always,exit -F arch=b64 -S init_module,finit_module,delete_module -k modulos) e, quando fizer sentido, execuções (-S execve; gera volume alto, avalie). A opção -e 2 torna as regras imutáveis até o próximo reboot. Evite regras demais: impacto em desempenho e em volume de logs, que contêm nomes de usuários e comandos (retenção e acesso restritos, LGPD). O AIDE verifica integridade de arquivos: aide --init cria um banco de dados com hashes e atributos de um sistema em estado CONHECIDAMENTE LIMPO; aide --check compara e relata diferenças. O banco deve ficar fora da máquina ou em mídia somente leitura (senão o atacante o altera também) e ser atualizado após mudanças legítimas, como atualizações de pacotes. Alternativas de conferência por pacote: debsums e rpm -V.',
            '# /etc/audit/rules.d/90-seguranca.rules (exemplo)\n-w /etc/passwd -p wa -k identidade\n-w /etc/sudoers -p wa -k privilegio\n-a always,exit -F arch=b64 -S init_module,finit_module,delete_module -k modulos\n# sudo augenrules --load\nsudo aide --init     # estado limpo\nsudo aide --check'
          ),
          sl(
            'SSH com certificados e MFA',
            'Distribuir e revogar authorized_keys em dezenas de servidores não escala. Com certificados SSH, uma autoridade certificadora (CA) própria assina a chave pública do usuário, definindo o nome (principal) e a validade: ssh-keygen -s ca_key -I <identidade> -n <usuario> -V +1d chave.pub gera um certificado de um dia. Os servidores só precisam confiar na CA: TrustedUserCAKeys /etc/ssh/ca.pub no sshd_config. Vantagens: acesso com prazo curto que expira sozinho, sem editar authorized_keys, com trilha de identidade (-I aparece nos logs); revogação por lista (RevokedKeys). A chave privada da CA é o segredo mais crítico: guarde-a offline, em HSM ou em um serviço de assinatura com auditoria. Para MFA, combine a chave com um segundo fator: AuthenticationMethods publickey,keyboard-interactive com PAM e TOTP, ou chaves de hardware FIDO2 (tipos ed25519-sk e ecdsa-sk). Mantenha uma conta de emergência protegida, para não se trancar fora.',
            '# assinar (na máquina da CA; <> = placeholders)\nssh-keygen -s ca_key -I <identidade> -n <usuario> -V +1d <usuario>.pub\n# sshd_config (servidor)\nTrustedUserCAKeys /etc/ssh/ca.pub\nAuthenticationMethods publickey,keyboard-interactive    # chave + segundo fator\nssh-keygen -L -f <usuario>-cert.pub                      # inspeciona o certificado'
          ),
          sl(
            'Mínimo, cadeia de suprimentos e segmentação',
            'Superfície mínima: instale só os pacotes necessários (sem compiladores e ferramentas de rede em servidores que não as usam), habilite apenas os serviços exigidos (systemctl list-unit-files --state=enabled) e confira as portas em escuta (ss -tulpn). Cadeia de suprimentos de pacotes: instale somente de repositórios com assinatura verificada (gpgcheck=1 nos repositórios RPM; chaves assinadas no apt), use repositórios espelho internos para controlar quais versões entram (e manter reprodutibilidade, congelando um conjunto testado) e reduzir dependência de fontes externas no momento do deploy. Um SBOM (Software Bill of Materials, em formatos como SPDX e CycloneDX) é o inventário dos componentes de uma imagem ou aplicação, permitindo responder rapidamente "quais máquinas usam a biblioteca afetada?" quando surge uma vulnerabilidade. Segmentação: separe redes por função (borda, aplicação, dados, gerência) com política de negar por padrão entre zonas e um bastion para a administração, de modo que o comprometimento de um host não dê acesso a todos.',
            'systemctl list-unit-files --state=enabled | head\nss -tulpn                                # o que escuta e qual processo\ndpkg -l | wc -l                          # inventário (Debian); rpm -qa (RPM) — base para um SBOM'
          ),
          sl(
            'Segredos, modelo de ameaças e defesa em profundidade',
            'Gestão de segredos: senhas, chaves e tokens não pertencem ao código, às imagens, aos repositórios nem a logs. Use um cofre (HashiCorp Vault) ou o KMS/gerenciador de segredos do provedor: o acesso é dado por IDENTIDADE da máquina ou do serviço, os segredos podem ser dinâmicos e de curta duração (credenciais de banco geradas sob demanda), rotacionados e auditados. Modelo de ameaças: antes de escolher controles, responda: o que proteger (ativos, como dados pessoais sob a LGPD), de quem (atacante externo, interno mal-intencionado ou descuidado, fornecedor comprometido), por quais caminhos (vetores) e com que impacto. Daí escolha controles que previnem, detectam e permitem responder, priorizando por risco. Defesa em profundidade: camadas independentes (rede segmentada, autenticação forte, mínimo privilégio, MAC, auditoria, backups testados e imutáveis, resposta a incidentes), para que a falha de uma não exponha tudo. Dados pessoais: minimize a coleta, cifre em repouso e em trânsito, controle e registre acessos e tenha um plano de resposta e comunicação de incidentes.',
            'ameaça -> ativo -> vetor -> impacto -> controle (prevenir/detectar/responder)\n# segredos: fora do Git/imagem; acesso por identidade; rotação; auditoria\n# camadas: rede > autenticação > mínimo privilégio > MAC > auditoria > backup'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a conduta adequada ao adotar um CIS Benchmark em servidores de produção?', 'c', [
          'Aplicar todos os controles de uma vez em produção, pois o benchmark é universal e sem impacto, já que o scanner garante a compatibilidade',
          'Ignorar os benchmarks, já que cada servidor deve inventar a própria lista de endurecimento',
          'Escolher o perfil adequado, testar em homologação, automatizar a aplicação e documentar as exceções com justificativa',
          'Executar o scanner e aceitar todos os achados como verdadeiros, sem revisão humana'
        ], 'Benchmarks são pontos de partida, e cada controle tem impacto. Teste, automatize, registre exceções e reavalie. Scanners geram falsos positivos.'),
        mcq('q2', 'Qual par de parâmetros sysctl e finalidade está correto?', 'a', [
          'kernel.dmesg_restrict=1 restringe o dmesg a quem tem privilégio; fs.protected_symlinks=1 restringe seguir links simbólicos em diretórios com sticky bit como /tmp',
          'kernel.kptr_restrict=0 esconde endereços do kernel; fs.suid_dumpable=1 impede core dumps de processos setuid',
          'net.ipv4.tcp_syncookies=0 protege contra inundação de SYN; kernel.yama.ptrace_scope=0 restringe o ptrace',
          'net.ipv4.conf.all.rp_filter=0 combate a falsificação de origem; kernel.dmesg_restrict=0 oculta o log'
        ], 'dmesg_restrict=1 e protected_symlinks=1 reduzem exposição de informação e ataques de link. kptr_restrict esconde ponteiros com valores 1 ou 2; syncookies=1 e rp_filter=1 são os valores defensivos; suid_dumpable=0 é o seguro.'),
        mcq('q3', 'Qual prática ajuda a controlar a cadeia de suprimentos de pacotes de um parque de servidores?', 'd', [
          'Instalar de qualquer repositório público na hora do deploy, desabilitando a verificação de assinatura para evitar falhas',
          'Copiar binários de sites variados, por serem mais recentes, e instalá-los com permissões de root, pulando a conferência de assinaturas',
          'Compilar tudo localmente sem registrar versões, para que ninguém consiga reproduzir o ambiente, pois a reprodutibilidade não é um requisito',
          'Usar repositórios com assinatura verificada, preferencialmente um espelho interno com conjuntos de pacotes testados, e manter SBOMs'
        ], 'Assinaturas verificam origem e integridade; o espelho interno dá controle de versões e reprodutibilidade; o SBOM permite saber onde um componente vulnerável está.'),
        fill('q4', 'Complete com o parâmetro sysctl que restringe o uso do dmesg a usuários privilegiados (kernel.___).', 'kernel.___ = 1', ['dmesg_restrict'], 'kernel.dmesg_restrict=1 impede que usuários comuns leiam o log do kernel, que pode revelar endereços e detalhes úteis a um atacante.'),
        mcq('q5', 'Um serviço é bloqueado pelo SELinux, e um colega sugere executar ausearch -m avc | audit2allow -M meumod e instalar o módulo sem ler. Qual é a avaliação correta?', 'b', [
          'É a melhor prática, pois audit2allow só gera regras mínimas e seguras',
          'É arriscado: o módulo libera tudo o que foi negado, inclusive acessos que podem ser indevidos; entenda a negação, prefira corrigir rótulo ou booleano e revise o .te',
          'É inútil, pois audit2allow só funciona com o SELinux em modo disabled',
          'É adequado, desde que depois se rode setenforce 0 de forma permanente'
        ], 'audit2allow automatiza a liberação do que foi negado, sem julgar se é legítimo. Rótulos e booleanos costumam ser a solução correta; setenforce 0 permanente remove a proteção.'),
        mcq('q6', 'Qual é uma vantagem dos certificados SSH assinados por uma CA, em comparação com distribuir chaves em authorized_keys?', 'b', [
          'Eliminam a necessidade de proteger a chave privada da CA, pois o certificado é público',
          'O acesso pode ter validade curta e expirar sozinho, sem editar authorized_keys em cada servidor, e a identidade aparece nos logs',
          'Dispensam o uso de chaves privadas pelos usuários',
          'Desativam automaticamente o MFA, simplificando o login'
        ], 'Com a CA, os servidores confiam na CA (TrustedUserCAKeys), os certificados têm validade e principals, e a revogação é possível. A chave privada da CA vira o ativo mais crítico.'),
        mcq('q7', 'Uma equipe guarda a senha do banco no repositório Git, em um arquivo de configuração, "porque o repositório é privado". Qual alternativa está alinhada à boa gestão de segredos?', 'd', [
          'Mover a senha para uma variável de ambiente no Dockerfile, que mantém o segredo na imagem',
          'Cifrar o arquivo com uma senha única compartilhada por e-mail entre a equipe',
          'Manter como está e só restringir quem tem acesso de leitura ao repositório',
          'Usar um cofre (Vault/KMS) com acesso por identidade do serviço, segredos de curta duração com rotação e auditoria, fora de Git e imagens'
        ], 'Repositórios e imagens persistem e se copiam; histórico guarda o segredo para sempre. Cofres dão identidade, rotação, curta duração e auditoria. Se um segredo vazou, deve ser revogado e trocado.'),
        fill('q8', 'Complete com a opção do AIDE que compara o sistema atual com o banco de dados de referência.', 'sudo aide --___', ['check', '-c'], 'aide --init cria o banco em estado limpo; aide --check compara e relata arquivos alterados. O banco deve ficar protegido fora da máquina.')
      ]
    },
    {
      id: 'lna-17-automacao-escala',
      title: 'Automação em escala',
      goal: 'Passar de servidores pets para cattle com imagens endurecidas, Ansible avançado, Terraform, cloud-init, GitOps, controle de drift e atualização em ondas.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'De pets para cattle',
            'Um servidor "pet" tem nome próprio, foi configurado à mão ao longo dos anos e ninguém sabe reconstruí-lo: quando adoece, é tratado com carinho. É um "snowflake" (floco de neve): único, frágil e fonte de "funciona na máquina do fulano". Em um modelo "cattle" (gado), servidores são idênticos, numerados e DESCARTÁVEIS: nascem de uma imagem e de configuração em código; se um falha, é substituído, não consertado à mão. Isso exige: configuração versionada (nada de ajuste manual sem registro), observabilidade (saber que algo falhou), dados fora do servidor (bancos e volumes gerenciados) e automação de provisionamento. Ganhos: escala, repetibilidade, recuperação rápida e menor risco de erro humano. Nem tudo vira cattle (um banco de dados com estado exige cuidado), mas o princípio vale: o que não está no código não existe.',
            'pet:    srv-financeiro-01  (instalado em 2016, ajustes manuais, ninguém ousa reiniciar)\ncattle: web-001 ... web-040 (mesma imagem + mesmo código; falhou? destrói e recria)'
          ),
          sl(
            'Imagens base endurecidas, Packer e imutabilidade',
            'Uma imagem base (golden image) endurecida é construída por um pipeline: sistema mínimo, atualizações aplicadas, controles de hardening (CIS), agentes de monitoramento, e SEM segredos, chaves SSH fixas, histórico de comandos ou dados pessoais. O Packer (HashiCorp) automatiza isso: lê um template, cria a imagem em um provedor (AMI na AWS, imagem QEMU, etc.), executa provisioners (shell, Ansible) e produz uma imagem versionada. Antes de promover, teste: varredura de vulnerabilidades e verificação de conformidade. Infraestrutura IMUTÁVEL: nunca se altera um servidor em execução; para mudar, gera-se uma imagem nova e substituem-se as instâncias (rollback = voltar à imagem anterior); elimina drift, mas exige pipeline maduro. Infraestrutura MUTÁVEL: atualiza-se no local (por exemplo, com Ansible): mais flexível e mais rápida para ajustes, com maior risco de divergência com o tempo. Muitas organizações combinam: imagem endurecida imutável como base e configuração de aplicação por automação.',
            'packer build servidor.pkr.hcl      # gera imagem versionada (exemplo)\n# pipeline: build -> scan de vulnerabilidades -> testes de conformidade -> promover\n# regra: nenhum segredo dentro da imagem'
          ),
          sl(
            'Ansible avançado: roles, inventário dinâmico, serial, handlers e check',
            'Roles organizam o código reutilizável: tasks/, handlers/, defaults/, vars/, templates/, files/ e meta/ (ansible-galaxy init cria o esqueleto). Inventário dinâmico: em vez de uma lista fixa de máquinas, um plugin consulta a nuvem (por tags, regiões) e monta os grupos na hora; ansible-inventory --list mostra o resultado. serial: controla quantos hosts são alterados por vez (serial: 2, serial: "25%" ou uma lista como [1, "10%", "50%"], que cria uma onda canário), e max_fail_percentage aborta se muitos falharem. Handlers são tarefas que rodam UMA vez, no fim do play, só se algo as notificou com notify: (por exemplo, reiniciar o nginx somente se o template mudou); flush_handlers força a execução antes. O modo --check (check_mode) simula sem alterar, e --diff mostra as diferenças de arquivos; funciona bem com módulos idempotentes. Teste de roles: o Molecule cria ambientes descartáveis (contêineres ou VMs), aplica a role (converge), roda de novo para provar idempotência e executa verificações. Segredos: ansible-vault, ou busca em um cofre, nunca em texto claro no repositório.',
            '- hosts: web\n  become: true\n  serial: [1, "10%", "50%"]     # onda canário e depois lotes maiores\n  max_fail_percentage: 0\n  roles: [nginx]\n# ansible-playbook site.yml --check --diff   # simula e mostra diferenças\n# molecule test                               # create, converge, idempotence, verify, destroy'
          ),
          sl(
            'Terraform e cloud-init',
            'O Terraform descreve a infraestrutura de forma DECLARATIVA (redes, instâncias, bancos, permissões) em arquivos .tf; providers falam com cada nuvem. Fluxo: terraform init (baixa providers), terraform plan (mostra o que seria criado, alterado ou destruído, e é o artefato de revisão) e terraform apply (executa). O terraform guarda o ESTADO (state) com o mapa entre código e recursos reais, e esse arquivo pode conter dados sensíveis (senhas geradas, endereços): use backend remoto com criptografia, bloqueio (lock) contra execuções concorrentes e acesso mínimo, e nunca o versione em Git. Um plan periódico também detecta drift. O cloud-init, no primeiro boot, lê o user-data e configura o servidor: usuários, chaves SSH PÚBLICAS, pacotes, arquivos e comandos (runcmd). A primeira linha deve ser #cloud-config para o formato YAML. Não coloque segredos no user-data (ele é legível a quem alcança o serviço de metadados): entregue-os por um cofre, usando a identidade da instância.',
            '#cloud-config\npackage_update: true\npackages: [nginx]\nusers:\n  - name: ops\n    ssh_authorized_keys: ["<chave-publica>"]\nruncmd:\n  - systemctl enable --now nginx\n# terraform init && terraform plan -out=mudanca.plan   # revisar antes do apply'
          ),
          sl(
            'GitOps e revisão de mudanças',
            'No GitOps, o Git é a fonte da verdade da infraestrutura e da configuração. Toda mudança passa por pull request: revisão por pares, pipeline de CI que roda lint (ansible-lint, terraform validate), testes e o plan, e só depois do merge a mudança é aplicada, por um pipeline ou por um agente que reconcilia continuamente o estado real com o declarado (em Kubernetes, ferramentas como Argo CD e Flux). Benefícios: trilha de auditoria completa (quem mudou, quando e por quê), revisão obrigatória, rollback por git revert e ambientes reproduzíveis. Boas práticas: proteger o ramo principal (aprovações obrigatórias), assinar commits, separar permissões de quem propõe e quem aprova, e manter segredos FORA do repositório (referenciados de um cofre, ou cifrados com ferramentas como sops ou ansible-vault, com chaves guardadas à parte). Mudanças de emergência manuais devem ser registradas e depois refletidas no código.',
            'git switch -c ajuste-nginx\n# edita a role, abre PR -> CI: lint + testes + plan -> revisão -> merge\n# merge dispara o apply (pipeline) ou o agente reconcilia\n# rollback: git revert <commit>  -> novo ciclo de pipeline'
          ),
          sl(
            'Drift e conformidade contínua',
            'DRIFT é a diferença entre o estado real e o declarado no código: um hotfix feito por SSH, um pacote instalado à mão, uma regra de firewall alterada na urgência. Com o tempo, máquinas "iguais" deixam de ser, e o próximo deploy surpreende. Para detectar: execuções agendadas de ansible-playbook --check --diff, terraform plan periódico e verificações de conformidade com OpenSCAP ou Lynis; para tratar: reaplicar o código (reconciliar) ou, se a mudança for legítima, levá-la ao código por pull request. Conformidade contínua é automatizar isso: varreduras regulares contra o perfil (por exemplo, CIS), relatórios, alertas quando algo sai do padrão e correção por pipeline, em vez de uma auditoria anual. Isso gera evidências para auditorias e para a LGPD (controles técnicos de segurança comprovados), e mantém a superfície de ataque previsível.',
            '# agendado (exemplo): detecta mudanças manuais sem alterar nada\nansible-playbook site.yml --check --diff | tee drift.log\nterraform plan -detailed-exitcode    # código 2 = há diferenças (drift ou mudança pendente)'
          ),
          sl(
            'Atualização em ondas (canário)',
            'Aplicar uma mudança (atualização de kernel, nova versão, ajuste de configuração) em todos os servidores de uma vez transforma um erro em uma indisponibilidade geral. A estratégia de ondas reduz o risco: (1) aplicar a um grupo pequeno, o canário (por exemplo, 1 servidor ou 5%), retirado do balanceador durante a mudança (drenar conexões) e reinserido depois; (2) observar por um período definido métricas objetivas (taxa de erros, latência de cauda, saturação, logs) comparadas ao grupo antigo; (3) se saudável, avançar para ondas maiores (por exemplo, 10%, 50%, 100%), sempre mantendo capacidade suficiente e nunca reiniciando todas as réplicas de um serviço ao mesmo tempo; (4) ter critérios de parada e rollback automáticos ou ensaiados. No Ansible, serial com lista implementa as ondas, e max_fail_percentage aborta cedo. Para reinício por atualização de kernel, escalone os reboots respeitando a redundância.',
            'serial: [1, "10%", "50%"]      # canário (1), depois 10%, depois 50%, depois o resto\n# por onda: drenar -> atualizar -> verificar saúde -> reinserir -> observar métricas\n# falhou? pare e reverta antes da próxima onda'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual característica descreve melhor o modelo "cattle" em vez de "pets"?', 'c', [
          'Servidores únicos, configurados manualmente, com nomes próprios e cuidadosamente preservados, substituídos só após vários anos de uso',
          'Servidores sem monitoramento, pois são descartáveis demais para valer o esforço',
          'Servidores idênticos, criados a partir de imagem e código versionados, que são substituídos em caso de falha',
          'Servidores que guardam todos os dados localmente, para que a perda de um não afete os outros'
        ], 'Cattle: idênticos, descartáveis, recriados de forma automatizada, com dados fora do servidor e observabilidade. Pets: únicos, manuais e difíceis de reconstruir.'),
        mcq('q2', 'Qual afirmação sobre infraestrutura imutável está correta?', 'a', [
          'Para mudar, gera-se uma nova imagem e substituem-se as instâncias, com rollback pela imagem anterior; reduz o drift, mas exige pipeline maduro (nunca se altera a instância em execução)',
          'Permite alterar servidores em execução por SSH, desde que alguém registre depois',
          'Dispensa testes, pois a imagem raramente muda depois de criada',
          'Só funciona com bancos de dados com estado local em disco'
        ], 'Imutável significa trocar, não alterar no local. Elimina drift de instâncias, mas depende de pipeline, testes e dados fora da instância.'),
        mcq('q3', 'Você precisa atualizar 40 servidores web atrás de um balanceador com risco mínimo usando Ansible. Qual configuração é mais adequada?', 'd', [
          'Rodar em todos em paralelo com serial desligado, para terminar mais rápido',
          'Usar handlers para reiniciar todos os servidores ao mesmo tempo ao final do play',
          'Usar --check em produção como forma de aplicar e validar ao mesmo tempo',
          'Usar serial em ondas (por exemplo [1, "10%", "50%"]) com max_fail_percentage, drenando cada servidor do balanceador antes e verificando a saúde depois'
        ], 'serial em lista cria canário e ondas; max_fail_percentage aborta cedo; drenar e verificar a saúde preservam capacidade. --check simula sem alterar, e não aplica.'),
        fill('q4', 'Complete com a opção do ansible-playbook que simula a execução sem alterar o sistema.', 'ansible-playbook site.yml --___ --diff', ['check', '-C'], '--check (check_mode) simula as mudanças e, com --diff, mostra as diferenças de arquivos; é base de verificação de drift.'),
        mcq('q5', 'Por que o arquivo de estado (state) do Terraform exige cuidados especiais?', 'b', [
          'Porque é um binário que só pode ser aberto pelo próprio terraform, então não precisa de proteção',
          'Porque pode conter dados sensíveis e o mapa da infraestrutura; use backend remoto cifrado, com lock e acesso mínimo, e não o versione em Git',
          'Porque é regenerado a cada plan, e qualquer cópia local é descartada',
          'Porque o state é o único lugar onde o cloud-init guarda segredos criptografados'
        ], 'O state costuma conter atributos sensíveis. Backends remotos com criptografia, lock e controle de acesso reduzem o risco; o versionamento em Git expõe esses dados e seu histórico.'),
        mcq('q6', 'Em um fluxo GitOps, como deve ser feito um ajuste na configuração de produção?', 'c', [
          'Por SSH direto no servidor, registrando depois em uma planilha',
          'Alterando o ramo principal diretamente, sem revisão, para ser mais rápido',
          'Por pull request, com CI (lint, testes, plan), revisão e merge, que dispara o apply; rollback com git revert',
          'Por e-mail para a equipe, que aplica manualmente em cada servidor'
        ], 'GitOps usa o Git como fonte da verdade, com revisão, auditoria e reversão por revert. Segredos ficam fora do repositório. Emergências manuais devem ser levadas depois ao código.'),
        mcq('q7', 'Uma verificação periódica com terraform plan e ansible --check --diff mostra diferenças em servidores que ninguém alterou pelo pipeline. O que isso indica e qual é a ação adequada?', 'b', [
          'Falha do relógio dos servidores; sincronizar o NTP resolve',
          'Drift: alterações manuais ou fora do código; reaplicar o código ou, se legítimas, levá-las ao código por pull request',
          'Excesso de handlers; remover todos os handlers dos playbooks',
          'Problema do cloud-init; recriar todos os servidores sem investigar'
        ], 'Diferença entre o estado real e o declarado é drift. Reconciliar (reaplicar) ou formalizar a mudança no código; a conformidade contínua automatiza essa detecção e gera evidências.'),
        fill('q8', 'Complete com a primeira linha de um arquivo user-data do cloud-init em formato YAML.', '#___\npackages: [nginx]', ['cloud-config', '#cloud-config'], 'A primeira linha #cloud-config identifica o formato. Não coloque segredos no user-data.')
      ]
    },
    {
      id: 'lna-18-alta-disponibilidade-clusters',
      title: 'Alta disponibilidade e clusters',
      goal: 'Projetar serviços sem ponto único de falha, entendendo VRRP, balanceadores, quórum, fencing, RTO/RPO e a conta dos "noves".',
      xp: 30,
      intro: {
        slides: [
          sl('SPOF e a conta dos noves',
            'Um SPOF (single point of failure) é qualquer componente cuja falha derruba o serviço inteiro: um único servidor, um único switch, um único disco, uma única fonte de energia. Alta disponibilidade (HA) é remover SPOFs com redundância e detectar/trocar automaticamente. A disponibilidade é a fração do tempo em que o serviço funciona e costuma ser dita em "noves". Tempo fora do ar por ano = (1 - disponibilidade) x minutos do ano. Componentes em SÉRIE (todos precisam funcionar) multiplicam as disponibilidades e a conta PIORA; componentes REDUNDANTES em paralelo (basta um funcionar) multiplicam as indisponibilidades e a conta MELHORA. Atenção: a conta supõe falhas independentes e um failover que funciona; na prática o failover mal testado é o elo fraco.',
            `# calculado em Python (valores exatos da conta)
99%     -> 5256.00 min/ano  (cerca de 87,6 h)
99.9%   ->  525.60 min/ano  (cerca de 8,76 h)
99.99%  ->   52.56 min/ano
99.999% ->    5.26 min/ano
série:      0.99 x 0.99        = 0.9801  (98,01%)
paralelo:   1 - (0.01 x 0.01)  = 0.9999  (99,99%)`),
          sl('Ativo-passivo, ativo-ativo e IP virtual (keepalived/VRRP)',
            'Ativo-passivo: um nó atende e outro espera pronto; se o ativo falha, o passivo assume (simples, mas metade da capacidade fica parada). Ativo-ativo: todos atendem ao mesmo tempo (aproveita a capacidade, mas exige que o estado/dados suportem concorrência e que um nó sozinho aguente a carga total quando o outro cair). O keepalived implementa o VRRP: os nós disputam um IP virtual (VIP); o de maior prioridade é o MASTER e responde pelo VIP; os demais ficam BACKUP enviando/recebendo anúncios. Se os anúncios do master cessam, o backup de maior prioridade assume o VIP (e anuncia o novo dono na rede). Os clientes só conhecem o VIP e não percebem a troca de máquina. O keepalived também pode rodar scripts de verificação que baixam a prioridade se o serviço local morrer.',
            `# /etc/keepalived/keepalived.conf (nó principal; exemplo)
vrrp_instance VI_1 {
    state MASTER
    interface eth0
    virtual_router_id 51
    priority 150            # o backup usa um valor menor, ex.: 100
    virtual_ipaddress {
        192.0.2.10/24       # o IP virtual (endereço de documentação)
    }
}`),
          sl('Balanceamento com HAProxy: L4, L7 e health checks',
            'O HAProxy distribui conexões entre servidores de aplicação e retira os doentes do rodízio. Modo tcp (camada 4) encaminha conexões sem entender o protocolo: rápido e serve para qualquer serviço TCP. Modo http (camada 7) entende HTTP e permite decidir por caminho, cabeçalho ou host, reescrever cabeçalhos e checar a saúde por requisição. O health check (palavra check na linha server) testa periodicamente cada backend; quem falha sai do rodízio e volta ao recuperar. Com option httpchk o teste é uma requisição HTTP a um endpoint de saúde, que detecta aplicação travada mesmo com a porta aberta. Atenção: o balanceador também é um SPOF; por isso costuma-se duplicá-lo com keepalived/VIP.',
            `frontend web
    bind *:80
    mode http
    default_backend app

backend app
    mode http
    balance roundrobin
    option httpchk GET /saude
    server app1 10.0.0.11:8080 check
    server app2 10.0.0.12:8080 check`),
          sl('Pacemaker/Corosync, quórum e fencing',
            'Para serviços com estado (banco, discos compartilhados) o cluster precisa decidir QUEM roda o quê. O Corosync cuida da comunicação e da pertinência (quem está vivo no cluster); o Pacemaker é o gerenciador de recursos: inicia, para e move recursos (IP, sistema de arquivos, serviço) segundo regras. Quórum: o cluster só age se mais da metade dos nós se enxerga (maioria = n/2 arredondado para baixo, mais 1). Numa partição de rede, só o lado com maioria continua; o outro lado se desliga. Fencing (STONITH, "shoot the other node in the head") isola à força um nó suspeito (desligando-o pela placa de gerência ou tomada inteligente) ANTES de outro assumir seus recursos. Sem fencing ocorre o split brain: dois nós acham que são o ativo, ambos escrevem no mesmo disco/banco e os dados são corrompidos. Um nó "silencioso" pode estar só travado, não morto, por isso não basta supor que morreu.',
            `# quórum = nós // 2 + 1  (divisão inteira)
3 nós -> quórum 2   (tolera 1 falha)
4 nós -> quórum 3   (tolera 1 falha: não ganha nada sobre 3)
5 nós -> quórum 3   (tolera 2 falhas)
# visão geral (exemplo): pcs status`),
          sl('DRBD, dados versus configuração',
            'O DRBD replica um dispositivo de bloco entre servidores pela rede, como um RAID 1 em rede: o que se grava no disco do nó ativo é copiado para o par. No modo síncrono a escrita só é confirmada depois de chegar ao par (RPO próximo de zero, mas mais latência); no assíncrono confirma antes (mais rápido, porém pode perder as últimas escritas num failover). Só um nó monta o sistema de arquivos por vez, a menos que se use um sistema de arquivos de cluster. Replicar DADOS (banco, arquivos) é diferente de replicar CONFIGURAÇÃO (arquivos de serviço, certificados, regras): dados vão por replicação de bloco/banco, configuração vai por automação versionada (Ansible, Git), para que os nós não divirjam silenciosamente.'),
          sl('RTO, RPO e testes de falha',
            'RTO (recovery time objective) é o tempo máximo aceitável para restaurar o serviço após uma falha. RPO (recovery point objective) é a quantidade máxima aceitável de dados perdidos, medida em tempo: backup a cada 15 minutos implica RPO de até 15 minutos; replicação síncrona tende a RPO próximo de zero. Failover automático reduz o RTO; replicação frequente reduz o RPO; ambos custam dinheiro e complexidade. Um HA não testado não é HA: faça exercícios de falha em ambiente controlado (desligar o nó ativo, cortar a rede, encher o disco), meça o tempo real de recuperação e compare com o RTO prometido. Faça-os primeiro em homologação e, em produção, só com janela combinada e plano de reversão.',
            `RPO = quanto de dado posso perder  (ex.: 15 min)
RTO = quanto tempo posso ficar fora   (ex.: 30 min)
Teste: desligar o nó ativo -> cronometrar até o VIP responder`)
        ]
      },
      questions: [
        mcq('q1', 'Um serviço exige 99,99% de disponibilidade ao ano. Qual é, aproximadamente, o tempo total de indisponibilidade tolerado?',
          'c', ['Cerca de 8,76 horas por ano', 'Cerca de 5 minutos por ano', 'Cerca de 52 minutos por ano', 'Cerca de 5 horas por ano'],
          '(1 - 0,9999) x 525.600 min do ano = 52,56 min. Cerca de 8,76 h corresponde a 99,9%; cerca de 5 min a 99,999%.'),
        mcq('q2', 'No keepalived com VRRP, o que passa de um nó para o outro quando o master falha?',
          'a', ['O IP virtual, que o backup de maior prioridade passa a responder', 'O volume DRBD inteiro, replicado em tempo real para o nó reserva e remontado ali', 'As sessões TCP abertas dos clientes, preservadas pela tabela de conexões do kernel', 'O papel de líder do quórum, transferido pelo Corosync ao nó seguinte'],
          'O VRRP move o VIP. Os clientes só conhecem o VIP e não precisam saber qual máquina o responde.'),
        mcq('q3', 'Uma loja tem dois servidores iguais. Em ativo-ativo, qual cuidado de capacidade é essencial?',
          'b', ['Manter um dos nós desligado até a falha acontecer, para economizar energia e licenças', 'Garantir que cada nó consiga atender a carga total se o outro cair', 'Dobrar a prioridade VRRP dos dois nós para que o failover seja mais rápido', 'Dispensar os health checks, já que ambos atendem tráfego o tempo todo'],
          'Se cada nó trabalha a 70% e um cai, o sobrevivente receberia 140%: a redundância só vale se um nó sozinho aguenta tudo.'),
        fill('q4', 'Complete a linha de servidor no HAProxy para que o balanceador teste periodicamente o backend e o tire do rodízio quando falhar.',
          'backend app\n    server app1 10.0.0.11:8080 ___',
          ['check'],
          'A palavra check ativa o health check. Sem ela o HAProxy continua enviando tráfego a um servidor morto.'),
        mcq('q5', 'Qual é o papel do fencing (STONITH) num cluster?',
          'b', ['Acelerar a replicação do DRBD, priorizando as escritas do nó que está ativo agora', 'Isolar à força um nó suspeito antes de outro assumir, evitando split brain e corrupção dos dados', 'Distribuir as requisições HTTP entre os backends que passam no health check', 'Eleger como líder o nó com o maior número de conexões ativas no momento'],
          'Um nó travado pode voltar a escrever. Desligá-lo antes de promover o outro garante que só um nó grava nos dados.'),
        mcq('q6', 'Os backups rodam a cada 30 minutos e uma falha ocorre logo antes de um novo backup. Qual é o pior caso de perda de dados?',
          'd', ['Nenhuma, pois o RTO cobre a restauração dos dados do último backup', 'Duas horas, a janela típica de manutenção desse tipo de rotina', 'Os dados do último dia inteiro, já que o backup é diário', 'Até 30 minutos de dados, ou seja, RPO de 30 minutos'],
          'RPO mede a perda de dados em tempo. Já o RTO mede quanto demora para voltar ao ar. Confundir os dois é erro comum.'),
        mcq('q7', 'Dois componentes em série, cada um com 99,9% de disponibilidade, resultam em qual disponibilidade aproximada do conjunto?',
          'a', ['Cerca de 99,8%, porque as disponibilidades se multiplicam', 'Cerca de 99,9999%, já que um componente cobre a falha do outro', 'Exatamente 99,9%, a do mais fraco, sem perda adicional pela associação', 'Cerca de 100%, pois as falhas independentes se cancelam'],
          '0,999 x 0,999 = 0,998001. Em série todos precisam funcionar; só a redundância em paralelo melhora a conta.'),
        fill('q8', 'Um cluster tem 5 nós. Quantos nós formam o quórum (maioria)?',
          'nós = 5\nquórum = nós // 2 + 1   # = ___',
          ['3', 'três', 'tres'],
          '5 // 2 + 1 = 3. Com 3 nós vivos se enxergando o cluster age; o lado minoritário da partição se desliga.')
      ]
    },
    {
      id: 'lna-19-armazenamento-distribuido-rede',
      title: 'Armazenamento em rede e distribuído',
      goal: 'Compreender NFS, Samba, iSCSI, multipath, autofs e armazenamento distribuído (Ceph, GlusterFS), incluindo cache, segurança e montagens travadas.',
      xp: 30,
      intro: {
        slides: [
          sl('NAS versus SAN',
            'NAS (network attached storage) entrega ARQUIVOS pela rede: o servidor mantém o sistema de arquivos e o cliente monta um compartilhamento (NFS, SMB/CIFS). Vários clientes enxergam os mesmos arquivos ao mesmo tempo. SAN (storage area network) entrega BLOCOS: o cliente recebe um disco virtual (um LUN) pela rede (iSCSI, Fibre Channel), cria seu próprio sistema de arquivos nele e o trata como disco local. Um mesmo LUN não deve ser montado em dois clientes ao mesmo tempo com um sistema de arquivos comum (ext4, XFS), senão corrompe; só com sistema de arquivos de cluster.'),
          sl('NFS: exports, root_squash e Kerberos',
            'O NFS (use a versão 4 em novas instalações) compartilha diretórios. No servidor, /etc/exports lista diretório, clientes autorizados e opções; exportfs -ra recarrega e showmount -e (ou exportfs -v) mostra o resultado. O NFSv4 usa uma única porta TCP (2049), o que simplifica o firewall. root_squash (padrão) mapeia o root do cliente para um usuário anônimo no servidor, impedindo que um administrador de uma máquina cliente comprometida atue como root nos arquivos do servidor; no_root_squash desliga essa proteção e deve ser evitado. Por padrão o NFS confia nos UIDs que o cliente envia; com sec=krb5 a autenticação passa por Kerberos, com krb5i acrescenta integridade e com krb5p também criptografa o tráfego.',
            `# /etc/exports  (exemplo)
/srv/dados  192.0.2.0/24(rw,sync,root_squash,no_subtree_check)

# no cliente
sudo mount -t nfs4 -o sec=krb5,hard srv:/srv/dados /mnt/dados
# fstab: srv:/srv/dados /mnt/dados nfs4 hard,_netdev 0 0`),
          sl('Samba/CIFS e autofs',
            'O Samba implementa o protocolo SMB/CIFS, usado por Windows. No servidor, o smb.conf define seções de compartilhamento (path, valid users, read only) e testparm valida a sintaxe. No cliente Linux, mount -t cifs monta o compartilhamento; credenciais devem ir num arquivo de credenciais com permissão 600 (opção credentials=), nunca na linha de comando, onde aparecem na lista de processos e no histórico. O autofs monta compartilhamentos sob demanda quando alguém acessa o caminho e desmonta após um tempo ocioso (timeout): evita montagens permanentes e travamentos no boot se o servidor estiver fora.',
            `# /etc/auto.master
/mnt/rede  /etc/auto.rede  --timeout=60
# /etc/auto.rede     (chave  opções  origem)
dados  -fstype=nfs4,rw  srv:/srv/dados
# acessar /mnt/rede/dados monta; ocioso por 60 s desmonta`),
          sl('iSCSI e multipath',
            'No iSCSI o TARGET é o servidor que exporta dispositivos de bloco (LUNs) e o INITIATOR é o cliente que os consome. Cada ponta é identificada por um IQN (nome único no formato iqn.ANO-MES.dominio-invertido:nome). No cliente, iscsiadm faz a descoberta e o login; o LUN aparece como um /dev/sdX comum. Autenticação CHAP e redes dedicadas/isoladas para o tráfego iSCSI são práticas básicas. Multipath: quando há vários caminhos físicos (duas placas, dois switches) até o mesmo LUN, o kernel enxergaria cada caminho como um disco distinto; o dm-multipath os agrupa num único dispositivo /dev/mapper/mpathX, balanceando e fazendo failover se um caminho cair (multipath -ll lista).',
            `sudo iscsiadm -m discovery -t sendtargets -p 192.0.2.20
sudo iscsiadm -m node -T iqn.2024-01.example.com:disco1 -p 192.0.2.20 --login
# exemplo de nome fictício; depois: lsblk mostra um novo disco`),
          sl('Cache e consistência no NFS; hard versus soft',
            'O cliente NFS guarda em cache atributos (tamanho, data) e dados para ganhar desempenho. Consistência "close-to-open": ao fechar um arquivo o cliente envia as escritas e ao abrir confere o servidor. Entre uma abertura e outra, outro cliente pode ainda ver atributos antigos por alguns segundos. noac desativa o cache de atributos (mais consistente, bem mais lento). Quando o servidor some: com hard o cliente tenta para sempre e os processos que usam a montagem ficam bloqueados (estado D) até o servidor voltar, sem perder escritas silenciosamente; com soft a chamada falha com erro depois de um tempo (timeo e retrans), o que pode causar erros de E/S e dados incompletos em aplicações que não os tratam. Para bancos e escritas importantes use hard; soft só para leitura tolerante a falhas.'),
          sl('Armazenamento distribuído: Ceph e GlusterFS',
            'Em vez de um servidor único, o armazenamento distribuído espalha dados por muitas máquinas, com escala e tolerância a falhas. Ceph: o armazenamento básico é o RADOS; cada disco é gerenciado por um daemon OSD; os MONs mantêm o mapa do cluster; os dados de um pool são agrupados em PGs (placement groups) e o algoritmo CRUSH calcula, a partir do mapa e de regras (domínios de falha como host ou rack), em quais OSDs cada PG fica, sem tabela central de consulta. Expõe blocos (RBD), arquivos (CephFS) e objetos. GlusterFS: agrega diretórios das máquinas (bricks) em volumes (distribuído, replicado), sem servidor de metadados central. A contrapartida é complexidade operacional e dependência da rede. Segurança: restrinja exports por rede/host, libere só as portas necessárias no firewall e prefira Kerberos/TLS em dados sensíveis.')
        ]
      },
      questions: [
        mcq('q1', 'Qual par descreve corretamente a diferença entre NAS e SAN?',
          'b', ['NAS entrega blocos e SAN entrega arquivos', 'NAS entrega arquivos (NFS/SMB); SAN entrega blocos (iSCSI/FC)', 'Ambos entregam arquivos, mas a SAN usa só UDP na rede do datacenter', 'NAS é um disco local e SAN é um disco em nuvem pública, acessado por HTTP'],
          'No NAS o servidor mantém o sistema de arquivos. Na SAN o cliente recebe um LUN e cria o próprio sistema de arquivos.'),
        mcq('q2', 'Qual opção do NFS evita que o root de um cliente aja como root nos arquivos do servidor?',
          'd', ['sec=sys', 'no_root_squash', 'noac', 'root_squash'],
          'root_squash mapeia o root remoto para um usuário anônimo. no_root_squash faz o contrário e é arriscado.'),
        mcq('q3', 'Um host precisa consumir um disco de bloco exportado por um servidor de armazenamento via iSCSI. Quem é o initiator?',
          'a', ['O host que consome o disco', 'O servidor de armazenamento que exporta o LUN', 'O switch que liga os dois', 'O daemon OSD do Ceph'],
          'Target exporta, initiator consome. O initiator usa iscsiadm para descobrir e fazer login.'),
        fill('q4', 'Complete a opção do exports que mapeia o root remoto para usuário anônimo:',
          '/srv/dados 192.0.2.0/24(rw,sync,___)',
          ['root_squash'],
          'root_squash é o padrão do NFS, mas declará-lo explicita a intenção de segurança.'),
        mcq('q5', 'Um banco de dados grava arquivos num compartilhamento NFS. O servidor NFS reinicia por alguns minutos. Qual montagem protege melhor contra erros de E/S silenciosos?',
          'c', ['soft com timeo curto, para que a aplicação receba erro rápido e tente de novo', 'noac com soft, para evitar cache de atributos durante a queda', 'hard: bloqueia e retenta até o servidor voltar', 'Montar em somente leitura, para que a queda não afete o banco'],
          'hard retenta indefinidamente e evita falhas parciais; soft devolve erro à aplicação, que pode não tratá-lo.'),
        mcq('q6', 'No Ceph, qual é a função do algoritmo CRUSH?',
          'a', ['Calcular em quais OSDs cada grupo de objetos fica, sem tabela central', 'Criptografar o tráfego entre o cliente e os MONs, rotacionando chaves a cada operação de escrita', 'Montar o CephFS no cliente por meio de FUSE, com cache local', 'Fazer o balanceamento HTTP do gateway de objetos (RGW) e a terminação de TLS entre os nós'],
          'CRUSH deriva a posição dos dados do mapa do cluster e das regras de domínio de falha, o que evita um gargalo de metadados.'),
        mcq('q7', 'Um servidor tem duas placas e dois switches até o mesmo LUN iSCSI. Sem multipath, o que o kernel mostraria?',
          'b', ['Um único dispositivo, balanceado automaticamente entre os dois caminhos', 'O mesmo LUN como dois discos separados, com risco de uso incorreto', 'Nenhum disco, por conflito entre os IQN dos dois caminhos', 'Um volume RAID 0 criado automaticamente pelo iscsiadm'],
          'Cada caminho vira um /dev/sdX. O dm-multipath os une em /dev/mapper/mpathX com failover.'),
        fill('q8', 'Qual opção de montagem NFS desativa o cache de atributos, aumentando a consistência ao custo de desempenho?',
          'sudo mount -o hard,___ srv:/srv/dados /mnt/dados',
          ['noac'],
          'noac (no attribute caching) faz o cliente consultar o servidor a cada acesso a atributos.')
      ]
    },
    {
      id: 'lna-20-virtualizacao-avancada',
      title: 'Virtualização avançada',
      goal: 'Entender como KVM, QEMU, virtio e libvirt se combinam, e as opções de rede, armazenamento, desempenho, isolamento e alternativas como microVMs.',
      xp: 30,
      intro: {
        slides: [
          sl('KVM + QEMU: quem faz o quê',
            'O KVM é um módulo do kernel (kvm mais kvm_intel ou kvm_amd) que usa as extensões de virtualização do processador (Intel VT-x, AMD-V) para rodar o código do convidado diretamente na CPU, com isolamento garantido por hardware. Ele expõe o dispositivo /dev/kvm. O QEMU é um programa em espaço de usuário que cria a máquina virtual: emula dispositivos (disco, rede, vídeo), aloca a memória e pede ao KVM para executar as vCPUs. Cada VM é, no host, um processo QEMU e cada vCPU é uma thread, escalonada como qualquer outra. Sem as extensões de CPU o QEMU só emula (muito mais lento).',
            `# exemplo: a CPU anuncia suporte a virtualização?
grep -E -c "vmx|svm" /proc/cpuinfo   # > 0 indica suporte
ls -l /dev/kvm                        # existe se o módulo está carregado`),
          sl('virtio: paravirtualização',
            'Emular uma placa de rede ou de disco real (por exemplo uma Intel e1000) obriga o QEMU a imitar registradores de hardware, o que é lento. No virtio o convidado SABE que é virtual e usa drivers especiais (virtio-net, virtio-blk, virtio-scsi) que trocam dados com o hospedeiro por filas em memória compartilhada (virtqueues), com muito menos intervenções. É o padrão para obter desempenho de E/S em VMs Linux. O Windows precisa instalar os drivers virtio no convidado.'),
          sl('libvirt e virsh',
            'O libvirt é uma camada de gerenciamento: uma API e um daemon que descrevem VMs em arquivos XML (domínios), gerenciam redes virtuais e pools de armazenamento e funcionam com KVM/QEMU e outros. virsh é o cliente de linha de comando; virt-install cria VMs; virt-manager é uma interface gráfica. Os comandos básicos: virsh list --all (lista todas, inclusive paradas), start, shutdown (desligamento limpo), destroy (desliga à força, como puxar da tomada, não apaga a VM), define (registra um XML), dumpxml (mostra a definição).',
            `virsh list --all
virsh start vm-teste
virsh dumpxml vm-teste | head
# exemplo de saída de list (varia):
#  Id  Nome       Estado
#  1   vm-teste   executando`),
          sl('Rede e armazenamento das VMs',
            'Rede: o padrão do libvirt é uma rede NAT (ponte virbr0 com NAT), em que a VM sai para fora, mas não é alcançável da LAN. Com uma bridge Linux ligada à interface física (br0), a VM entra na mesma rede L2 da LAN, com IP próprio. O macvtap liga a VM diretamente a uma interface física sem bridge (mas host e VM não se falam pela mesma interface, por padrão). O Open vSwitch (OVS) é uma bridge programável para VLANs, túneis e SDN. Armazenamento: o qcow2 é um formato de imagem com cópia na escrita, alocação sob demanda (thin) e snapshots; raw é simples e rápido; volumes LVM dão desempenho próximo ao de disco; Ceph RBD dá armazenamento de bloco distribuído, útil para migração.',
            `qemu-img create -f qcow2 disco.qcow2 20G   # 20G é o tamanho virtual
qemu-img info disco.qcow2                  # mostra tamanho virtual e real`),
          sl('Desempenho e dispositivos físicos',
            'CPU pinning fixa as vCPUs em núcleos físicos específicos (e, em hosts NUMA, próximos da memória usada), reduzindo variação de latência; é feito no XML (vcpupin) ou com ferramentas. Hugepages usam páginas de memória maiores, diminuindo falhas de TLB e a sobrecarga de gerenciar memória em VMs grandes; exigem reserva prévia. PCI passthrough com VFIO entrega um dispositivo físico (GPU, placa de rede, NVMe) diretamente ao convidado, exigindo IOMMU (VT-d/AMD-Vi); dá desempenho quase nativo, mas o dispositivo fica dedicado àquela VM e costuma impedir migração ao vivo. Virtualização aninhada permite rodar KVM dentro de uma VM (útil para laboratórios; mais lenta).'),
          sl('Migração ao vivo, isolamento e alternativas',
            'Migração ao vivo move uma VM em execução para outro host: as páginas de memória são copiadas enquanto ela roda, e uma pausa breve final troca a execução; exige rede rápida, CPUs compatíveis e armazenamento acessível aos dois hosts (compartilhado, ou migrando o disco junto). Segurança: o QEMU é um programa grande e já teve falhas; mantenha-o atualizado, use confinamento (sVirt com SELinux/AppArmor) e reduza dispositivos emulados. Ataques de canal lateral (classe Spectre e semelhantes) exploram o compartilhamento de CPU entre VMs; a defesa é combinar atualizações de kernel, de microcódigo/firmware e, em casos sensíveis, não compartilhar núcleos. Contêineres compartilham o kernel do host (isolamento mais fraco, partida em milissegundos); VMs têm kernel próprio e isolamento por hardware; microVMs (Firecracker) são VMs mínimas sobre KVM, com poucos dispositivos e boot rápido; o Kata Containers roda contêineres dentro de VMs leves para somar a interface de contêiner e o isolamento de VM.')
        ]
      },
      questions: [
        mcq('q1', 'Como KVM e QEMU dividem o trabalho numa VM típica?',
          'd', ['O QEMU roda dentro do kernel e o KVM emula os dispositivos de entrada e saída', 'O KVM emula dispositivos de disco, e o QEMU só gerencia a rede virtual', 'Ambos são o mesmo módulo do kernel, carregado com modprobe qemu', 'O KVM executa a CPU do convidado em hardware e o QEMU emula os dispositivos'],
          'KVM é o módulo que usa VT-x/AMD-V; QEMU é o processo em espaço de usuário que emula dispositivos e aloca memória.'),
        mcq('q2', 'Qual é a vantagem do virtio sobre emular uma placa de rede Intel e1000?',
          'b', ['Funciona sem nenhum driver especial no convidado, inclusive em sistemas legados e antigos de 32 bits', 'O convidado sabe que é virtual e usa filas compartilhadas', 'Permite que a VM use o endereço MAC físico da placa do host e dispensa o NAT do libvirt', 'Dispensa o QEMU e a necessidade de extensões de hardware na CPU'],
          'Paravirtualização evita imitar registradores de hardware; é o caminho padrão para E/S rápida em VMs.'),
        mcq('q3', 'Uma VM deve receber IP da mesma rede da LAN e ser acessada por outros computadores. Qual rede é mais adequada?',
          'c', ['A rede NAT padrão do libvirt, com a ponte virbr0', 'Rede isolada, sem rota para fora', 'Uma bridge Linux ligada à interface física', 'Um disco qcow2 com a rede embutida'],
          'Com a bridge a VM fica no mesmo domínio L2. No NAT ela sai, mas ninguém da LAN a alcança diretamente.'),
        fill('q4', 'Qual comando do virsh lista todas as VMs, inclusive as paradas?',
          'virsh ___ --all',
          ['list'],
          'virsh list mostra só as ativas; com --all inclui as definidas e paradas.'),
        mcq('q5', 'Qual é a contrapartida principal do PCI passthrough com VFIO?',
          'a', ['O dispositivo fica dedicado à VM e costuma impedir a migração ao vivo, além de exigir IOMMU', 'O desempenho do dispositivo cai pela metade por causa da emulação no host', 'A VM perde o acesso à rede virtual do hipervisor, mantendo só o dispositivo', 'O host precisa recompilar o QEMU com suporte ao dispositivo escolhido'],
          'Dar o dispositivo físico ao convidado rende desempenho quase nativo, mas o prende àquele host e àquela VM.'),
        mcq('q6', 'Uma VM de banco de dados grande sofre com variação de latência. Que ajuste tem relação direta com isso?',
          'c', ['Trocar o qcow2 por um formato compactado, para reduzir o uso de disco', 'Reduzir o número de vCPUs a uma só, para evitar disputa por núcleos', 'Fixar vCPUs em núcleos físicos e usar hugepages', 'Desativar o virtio e voltar a usar dispositivos emulados'],
          'Pinning reduz migração de threads entre núcleos e hugepages reduz custo de gerenciar a memória; ambos diminuem a variação.'),
        mcq('q7', 'Qual descrição se aplica ao Kata Containers?',
          'b', ['Um contêiner comum que compartilha o kernel do host e dispensa qualquer tipo de virtualização', 'Contêineres executados dentro de VMs leves, com isolamento de hardware', 'Um formato de imagem de disco com snapshots internos, alternativo ao qcow2 e ao raw', 'Um substituto do libvirt, escrito para processadores ARM'],
          'Kata e Firecracker usam virtualização para somar o isolamento de VM à interface de contêiner/serverless.'),
        fill('q8', 'Complete com o formato de imagem com cópia na escrita e snapshots:',
          'qemu-img create -f ___ disco.img 20G',
          ['qcow2'],
          'qcow2 aloca espaço sob demanda e suporta snapshots. O tamanho 20G é o tamanho virtual.')
      ]
    },
    {
      id: 'lna-21-embarcados-realtime',
      title: 'Linux embarcado e tempo real',
      goal: 'Conhecer o fluxo de desenvolvimento embarcado (cross-compilation, Yocto/Buildroot, Device Tree), tempo real, resiliência, OTA e segurança/LGPD em IoT.',
      xp: 30,
      intro: {
        slides: [
          sl('Placas, cross-compilation e sistemas de build',
            'Placas de computador único (SBCs), como a família Raspberry Pi, rodam Linux em processadores como ARM, geralmente com cartão SD ou eMMC. Como a placa é lenta ou sem toolchain, compila-se no PC (x86) para outra arquitetura: isso é cross-compilation, feita com um cross-compilador (por exemplo aarch64-linux-gnu-gcc), que produz binários que NÃO rodam no PC. O comando file mostra a arquitetura do binário. Para montar a imagem inteira (bootloader, kernel, sistema raiz), usam-se sistemas de build: Buildroot (configuração via menuconfig e make, simples e rápido de aprender, gera uma imagem) e Yocto (BitBake, receitas e camadas; mais complexo e flexível, ideal para produtos com manutenção de longo prazo e gerenciamento de pacotes próprio).',
            `aarch64-linux-gnu-gcc -o ola ola.c
file ola
# exemplo de saída (varia): ELF 64-bit LSB executable, ARM aarch64`),
          sl('Device Tree',
            'Em placas ARM, o kernel não consegue descobrir o hardware sozinho como num PC com PCI/ACPI (os periféricos estão em endereços fixos do chip). O Device Tree é uma descrição em texto do hardware (CPUs, memória, UARTs, I2C, GPIOs, quais pinos fazem o quê), escrita em arquivos .dts, compilada pelo dtc para o formato binário .dtb que o bootloader entrega ao kernel. Os overlays (.dtbo) acrescentam ou modificam partes da descrição sem recompilar tudo, como ativar I2C ou SPI no Raspberry Pi. O driver só "casa" com o dispositivo se a descrição existir e estiver correta.'),
          sl('GPIO, I2C e SPI',
            'GPIO são pinos de entrada/saída digitais. A interface antiga via /sys/class/gpio está obsoleta; o caminho atual é o dispositivo de caractere /dev/gpiochipN acessado pela libgpiod (ferramentas gpiodetect, gpioinfo, gpioget, gpioset e bibliotecas), que controla propriedade do pino e evita conflito entre processos. I2C é um barramento de dois fios com endereços de dispositivo (i2cdetect -y 1, do pacote i2c-tools, lista os endereços presentes). SPI usa linhas de relógio e seleção de chip e aparece como /dev/spidevN.M. Cuidado com tensões: pinos de muitas placas toleram só 3,3 V e ligar 5 V ou cargas diretas danifica a placa.'),
          sl('Tempo real e PREEMPT_RT',
            'Tempo real não significa "rápido", e sim PREVISÍVEL: o sistema precisa responder dentro de um prazo máximo conhecido (latência determinística). O kernel padrão pode ficar longos instantes sem ser preemptado (seções com spinlocks, tratamento de interrupções). O PREEMPT_RT torna quase todo o kernel preemptível: interrupções tratadas em threads de kernel, mutexes com herança de prioridade e trechos críticos curtos, reduzindo a latência de pior caso. Os processos de tempo real usam políticas SCHED_FIFO ou SCHED_RR (chrt) com prioridade alta, e a ferramenta cyclictest mede latências. O que se avalia é o PIOR caso, não a média. Tempo real rígido também exige cuidado com paginação (mlockall), alocação e E/S bloqueante no laço crítico.'),
          sl('Resiliência: somente leitura, overlay, OTA e watchdog',
            'Dispositivos perdem energia sem aviso e a memória flash se desgasta com escritas. Por isso o sistema raiz costuma ser somente leitura (squashfs, ou ext4 montado com ro), com uma camada overlayfs sobre tmpfs (alterações somem ao reiniciar) e uma partição de dados separada para o que precisa persistir. Atualização OTA segura: duas partições do sistema (A/B); a nova imagem é baixada, tem a assinatura verificada, é gravada na partição inativa e o boot troca para ela; se o novo sistema não confirmar que está saudável, o bootloader volta à anterior (rollback). RAUC, SWUpdate e Mender são exemplos de ferramentas. O watchdog é um temporizador de hardware que reinicia o sistema se o software parar de "alimentá-lo" (escrever em /dev/watchdog); o systemd pode alimentá-lo (RuntimeWatchdogSec) e detectar travamentos totais. Em consumo de energia, ajuste governadores de CPU e desligue periféricos não usados.'),
          sl('Segurança e LGPD em IoT',
            'Segurança de dispositivos embarcados: senhas padrão iguais em todas as unidades foram a porta de entrada de grandes botnets de IoT; cada dispositivo deve ter credencial única (ou nenhuma conta com senha), serviços desnecessários desligados, atualizações assinadas e entregues por um canal confiável durante toda a vida útil, boot seguro (cadeia de assinaturas do bootloader ao kernel) e chaves nunca embutidas no firmware em texto. LGPD: quando o dispositivo coleta dado que identifica ou permite identificar uma pessoa (voz, imagem, localização, identificadores ligados a um usuário, padrões de uso da casa), é dado pessoal. Aplique minimização (coletar só o necessário, processar no próprio dispositivo quando possível), finalidade clara informada ao titular, retenção limitada, criptografia em trânsito e em repouso e controle de acesso. Dados de telemetria "técnica" também podem virar pessoais se associados a uma conta.')
        ]
      },
      questions: [
        mcq('q1', 'Você compila um programa no PC x86 com aarch64-linux-gnu-gcc. O que esperar do binário?',
          'a', ['Roda numa placa ARM de 64 bits, mas não direto no PC x86', 'Roda no PC e na placa, sem nenhuma alteração entre as arquiteturas', 'Só roda depois de ser convertido pelo compilador de device tree (dtc)', 'Roda dentro do QEMU em modo KVM, no próprio PC'],
          'Cross-compilation gera binário para a arquitetura-alvo. O comando file confirma a arquitetura do ELF.'),
        mcq('q2', 'Qual comparação entre Buildroot e Yocto está correta?',
          'c', ['Yocto gera uma imagem pronta em poucos minutos, sem nenhuma configuração prévia ou receitas', 'Buildroot usa BitBake e camadas, enquanto o Yocto usa menuconfig e make para gerar imagens', 'Buildroot é mais simples; Yocto é mais flexível, com receitas e camadas', 'Ambos são bootloaders para placas ARM de uso doméstico'],
          'Buildroot tem curva mais suave. Yocto compensa a complexidade com camadas, receitas e flexibilidade para produtos duradouros.'),
        mcq('q3', 'Por que a interface /sys/class/gpio foi substituída pela libgpiod?',
          'b', ['Porque o GPIO só funciona em processadores x86, e a sysfs é obrigatória em placas ARM modernas', 'Porque /dev/gpiochipN controla a posse dos pinos e evita conflito entre processos', 'Porque a sysfs foi removida por completo dos kernels recentes, inclusive das placas ARM', 'Porque a libgpiod dispensa a descrição do hardware no Device Tree'],
          'A interface de caractere moderna é mais segura e controlada; a sysfs de GPIO está marcada como obsoleta.'),
        fill('q4', 'O Device Tree compilado pelo dtc, que o bootloader entrega ao kernel, tem a extensão:',
          'meuboard.dts  --dtc-->  meuboard.___',
          ['dtb', '.dtb'],
          'O .dts é o texto-fonte; o .dtb é o binário. Os overlays usam .dtbo.'),
        mcq('q5', 'O que o PREEMPT_RT melhora em um sistema de controle industrial?',
          'd', ['A vazão média da rede, mesmo sob carga alta de entrada e saída', 'O uso de memória, reduzindo o consumo total do sistema', 'A velocidade média do processador, aumentando o clock efetivo', 'A previsibilidade: reduz a latência de pior caso'],
          'Tempo real é sobre prazo garantido no pior caso. A média pode até piorar um pouco.'),
        mcq('q6', 'Um dispositivo de campo recebe uma atualização defeituosa e não deve ficar inutilizável. Qual projeto atende?',
          'b', ['Sobrescrever o sistema raiz em uso e reiniciar em seguida, para ser rápido e simples de manter', 'Partições A/B, assinatura verificada e rollback se o novo sistema não confirmar saúde', 'Atualizar por pen drive, sem nenhuma verificação de integridade, para evitar dependência de rede', 'Desativar o watchdog durante a atualização, para evitar reinícios inesperados'],
          'Gravar na partição inativa e só confirmar após o boot saudável permite reverter. Sem isso uma queda de energia pode inutilizar o aparelho.'),
        mcq('q7', 'Uma câmera doméstica envia vídeo e identificador da conta do morador à nuvem. Do ponto de vista da LGPD, o que é mais adequado?',
          'c', ['Considerar dado técnico e guardar por tempo indeterminado, para análises futuras', 'Usar a mesma senha de fábrica em todas as unidades, para facilitar o suporte', 'Tratar como dado pessoal: minimizar, informar finalidade, limitar retenção e criptografar', 'Ignorar a LGPD, porque o tratamento acontece no próprio dispositivo'],
          'Imagem e identificador de conta identificam pessoas. Valem minimização, finalidade, retenção limitada e criptografia.'),
        fill('q8', 'Qual dispositivo o software escreve periodicamente para "alimentar" o watchdog de hardware e evitar o reinício?',
          'ls -l /dev/___',
          ['watchdog'],
          'Se o software travar e deixar de escrever em /dev/watchdog, o temporizador reinicia o sistema.')
      ]
    },
    {
      id: 'lna-22-modulos-kernel',
      title: 'Módulos do kernel',
      goal: 'Entender a anatomia de um módulo mínimo, como é construído e carregado, por que erros são tão graves e as alternativas seguras ao código no kernel.',
      xp: 30,
      intro: {
        slides: [
          sl('O que é um módulo e o exemplo mínimo',
            'Módulos são pedaços de código que podem ser carregados e descarregados do kernel em execução, sem reiniciar (drivers, sistemas de arquivos, protocolos). Rodam com os privilégios totais do kernel. Aviso importante: experimente SOMENTE em uma máquina virtual descartável, com snapshot, nunca no seu computador de trabalho ou num servidor. O módulo "olá, mundo" abaixo apenas registra mensagens. module_init define a função chamada ao carregar (retornar 0 indica sucesso; valor negativo faz a carga falhar) e module_exit a chamada ao remover. pr_info escreve no log do kernel (equivale a printk com nível informativo), visível com dmesg. MODULE_LICENSE declara a licença.',
            `#include <linux/init.h>
#include <linux/module.h>

static int __init ola_init(void)
{
    pr_info("ola: carregado\\n");
    return 0;
}

static void __exit ola_exit(void)
{
    pr_info("ola: removido\\n");
}

module_init(ola_init);
module_exit(ola_exit);
MODULE_LICENSE("GPL");
MODULE_DESCRIPTION("Exemplo didatico minimo");`),
          sl('Kbuild: o Makefile de módulo externo',
            'Módulos fora da árvore do kernel usam o sistema Kbuild. O Makefile só declara o objeto (obj-m += ola.o, que produzirá ola.ko) e chama o make do kernel apontando para os cabeçalhos/árvore de construção da versão EM EXECUÇÃO (/lib/modules/$(uname -r)/build, fornecidos por um pacote de headers da distribuição) com M= indicando o diretório do módulo. O módulo precisa ser compilado para exatamente a versão e a configuração do kernel em que será carregado. As linhas de comando do Makefile exigem TAB.',
            `# Makefile  (as linhas de comando começam com TAB)
obj-m += ola.o
KDIR := /lib/modules/$(shell uname -r)/build
all:
	$(MAKE) -C $(KDIR) M=$(PWD) modules
clean:
	$(MAKE) -C $(KDIR) M=$(PWD) clean`),
          sl('Carregar, inspecionar e remover',
            'insmod carrega um .ko específico (não resolve dependências); modprobe carrega pelo nome a partir de /lib/modules, resolvendo dependências (modules.dep); rmmod e modprobe -r removem; lsmod lista os carregados; modinfo mostra licença, autor, descrição e parâmetros; dmesg mostra as mensagens do kernel (pode exigir privilégios). Um módulo só pode ser removido se ninguém o usa (contador de referências).',
            `sudo insmod ola.ko
dmesg | tail -n 3
lsmod | grep ola
modinfo ./ola.ko
sudo rmmod ola
# exemplo (varia): [ 123.456] ola: carregado`),
          sl('Dispositivos de caractere (visão geral)',
            'Um módulo pode expor um dispositivo de caractere: registra-se um número de dispositivo e uma estrutura file_operations com funções chamadas quando um programa faz open, read, write ou ioctl no arquivo em /dev (o nó é criado por udev/devtmpfs). É assim que muitos drivers se apresentam ao espaço de usuário. Os dados entre usuário e kernel passam por funções próprias de cópia (copy_to_user, copy_from_user) que validam os endereços; confiar cegamente em ponteiros do usuário é uma fonte clássica de vulnerabilidades.'),
          sl('Por que um bug no kernel derruba tudo',
            'No espaço de usuário, cada processo tem seu espaço de endereços e um erro (violação de acesso) termina apenas ele. No kernel, o código roda no modo privilegiado e compartilha UM espaço de endereços com todo o resto: não há proteção de memória entre o módulo e o núcleo. Um ponteiro nulo, um acesso fora do limite ou um deadlock produz um "oops" (o kernel tenta continuar, marcado como contaminado) ou um "panic" (parada total), e dados em cache podem ser perdidos. Um módulo defeituoso também pode corromper memória de forma silenciosa. Por isso se testa em VM e se prefere, quando possível, não escrever código de kernel.'),
          sl('Licença, símbolos, DKMS e assinatura',
            'O kernel é GPL. Módulos declaram a licença; símbolos exportados com EXPORT_SYMBOL_GPL só podem ser usados por módulos com licença compatível, e carregar um módulo proprietário "contamina" (taint) o kernel, o que dificulta suporte e depuração. O DKMS (dynamic kernel module support) guarda o código-fonte de módulos externos e os recompila automaticamente a cada novo kernel instalado, evitando que o driver desapareça numa atualização. Com Secure Boot (e o modo lockdown), o kernel só carrega módulos assinados por uma chave confiável; módulos externos precisam ser assinados com uma chave própria cadastrada (por exemplo via MOK). Isso impede que um atacante com acesso root carregue código arbitrário no kernel.'),
          sl('Alternativas mais seguras',
            'Antes de escrever um módulo, pergunte se é preciso. FUSE permite implementar sistemas de arquivos em espaço de usuário (um erro derruba só o processo). eBPF executa programas pequenos no kernel depois de um verificador provar que são seguros, para observabilidade, rede e segurança. Drivers em espaço de usuário (libusb, VFIO, UIO) acessam hardware sem código no kernel. Essas opções trocam um pouco de desempenho por segurança, estabilidade e facilidade de depuração.')
        ]
      },
      questions: [
        mcq('q1', 'No módulo mínimo, qual é o papel de module_init e module_exit?',
          'c', ['Declaram a licença e a descrição do módulo, que o modinfo exibe depois, e a versão do kernel alvo', 'Compilam o módulo usando o sistema Kbuild e geram o arquivo .ko automaticamente', 'Indicam a função de carga e a de remoção do módulo', 'Criam o nó do dispositivo em /dev quando o módulo é inserido'],
          'module_init(f) registra a função de entrada (retorno 0 = sucesso) e module_exit(g) a de saída.'),
        mcq('q2', 'Por que um ponteiro nulo desreferenciado num módulo é mais grave que num programa comum?',
          'd', ['Porque o compilador do kernel não detecta erros de ponteiro nulo', 'Porque o módulo precisa de licença proprietária para acessar a memória do sistema inteiro', 'Porque módulos rodam em um processo isolado, que o kernel não consegue reiniciar sozinho', 'Porque roda em modo privilegiado e sem nenhuma proteção de memória entre ele e o resto do kernel'],
          'No espaço de usuário só o processo cai. No kernel o erro pode gerar oops ou panic e afeta o sistema todo.'),
        mcq('q3', 'Qual arquivo o Kbuild gera a partir de "obj-m += ola.o"?',
          'a', ['ola.ko, o módulo carregável', 'ola.dtb, a descrição de hardware', 'ola.so, uma biblioteca para espaço de usuário', 'ola.deb, o pacote do módulo'],
          'obj-m indica que o objeto será um módulo carregável; o resultado é um .ko.'),
        fill('q4', 'Complete a declaração de licença que permite usar símbolos exportados apenas para GPL:',
          'MODULE_LICENSE("___");',
          ['GPL'],
          'Sem licença compatível, o módulo não acessa símbolos EXPORT_SYMBOL_GPL e contamina o kernel.'),
        mcq('q5', 'Qual problema o DKMS resolve?',
          'b', ['Assina módulos com a chave do fabricante do hardware', 'Recompila módulos externos automaticamente a cada novo kernel instalado', 'Remove da memória os módulos que não estão em uso no momento', 'Troca o escalonador padrão por um escalonador de tempo real'],
          'Sem DKMS, um driver externo some após a atualização do kernel até alguém recompilá-lo.'),
        mcq('q6', 'Um módulo externo é recusado ao carregar numa máquina com Secure Boot ativo. Qual a causa provável?',
          'd', ['O módulo é grande demais para a memória disponível no sistema de teste, que tem pouca RAM', 'O dmesg está desativado e não mostra as mensagens de erro', 'O comando correto para carregar seria rmmod, e não insmod, no ambiente de teste', 'O módulo não está assinado por uma chave em que o kernel confia'],
          'Com Secure Boot/lockdown, só módulos assinados com chave cadastrada (por exemplo via MOK) são aceitos.'),
        mcq('q7', 'Você quer um sistema de arquivos personalizado e menos arriscado que um módulo. O que escolher?',
          'a', ['FUSE, que roda em espaço de usuário', 'Um rootkit com acesso direto à memória', 'Compilar o kernel inteiro com a opção em linha', 'Um módulo proprietário sem assinatura'],
          'Com FUSE um erro derruba só o processo do sistema de arquivos, não o kernel.'),
        fill('q8', 'Qual comando carrega um arquivo .ko específico (sem resolver dependências)?',
          'sudo ___ ola.ko',
          ['insmod'],
          'insmod carrega o arquivo informado; modprobe carrega pelo nome e resolve dependências. Faça isto só em VM descartável.')
      ]
    },
    {
      id: 'lna-23-shell-robusto',
      title: 'Shell robusto e portável',
      goal: 'Escrever scripts de shell previsíveis e seguros: portabilidade, shellcheck, set -euo pipefail e suas armadilhas, trap, flock, mktemp, getopts e defesa contra injeção.',
      xp: 30,
      intro: {
        slides: [
          sl('POSIX sh versus bash, e o shellcheck',
            'O padrão POSIX define o shell "sh" mínimo. Em muitas distribuições (Debian e Ubuntu, por exemplo) /bin/sh é o dash, rápido e estrito: não tem arrays, [[ ]], <( ), nem ${var,,}. O bash tem esses recursos extras (bashismos). Escolha a identidade no shebang: #!/bin/sh e escreva apenas POSIX se o script precisa rodar em qualquer lugar (Alpine, contêineres, appliances), ou #!/usr/bin/env bash e use recursos do bash conscientemente. Em POSIX prefira [ ], printf (mais previsível que echo) e $( ). O shellcheck é um analisador estático que aponta erros comuns, com códigos SCxxxx: o mais famoso é o SC2086 ("double quote to prevent globbing and word splitting"): $var sem aspas é dividido nos espaços e expandido por curingas.',
            `f="relatorio de maio.txt"
printf "[%s]\\n" $f      # sem aspas: duas palavras  -> [relatorio] [de] [maio.txt]
printf "[%s]\\n" "$f"    # com aspas: um argumento   -> [relatorio de maio.txt]
# analisar o script: shellcheck meu-script.sh`),
          sl('set -euo pipefail e suas armadilhas',
            'set -e encerra o script quando um comando falha; set -u trata variável não definida como erro (pega o typo que viraria rm -rf "$DIR/"); set -o pipefail faz um pipeline falhar se QUALQUER etapa falhar (sem ele, só o status do último comando conta, e false | true é sucesso). Mas o set -e tem armadilhas: é ignorado em contextos condicionais (comando em if/while, ou antes de && e ||), então uma função chamada dentro de um if continua após um comando interno que falha; um subshell ( ) que falha encerra só o subshell; e expressões como (( n++ )) devolvem status 1 quando o valor é 0, derrubando o script sem motivo. Trate erros esperados explicitamente (cmd || true, ou um if) e não confie no -e como única proteção. Testado no Git Bash: com pipefail, false | true derruba o script; sem ele, o script segue.',
            `#!/usr/bin/env bash
set -euo pipefail
n=0
(( n++ )) || true      # sem o || true, o status 1 mataria o script
if ! grep -q chave arquivo.txt; then
    echo "chave ausente" >&2
fi`),
          sl('trap, mktemp e flock',
            'trap executa um comando quando o script recebe um sinal ou termina: trap limpa EXIT roda a função limpa em qualquer saída normal ou por erro (com set -e); trap ... INT TERM trata Ctrl+C e término. mktemp cria arquivo (ou diretório, com -d) temporário com nome imprevisível e permissão restrita; evita nomes previsíveis como /tmp/saida.txt, que um atacante local poderia antecipar com um link simbólico. flock (util-linux) cria bloqueio para impedir execuções simultâneas, como um cron que ainda não terminou e dispara de novo; com descritor, flock -n 9 falha imediatamente se o bloqueio estiver tomado.',
            `tmp=$(mktemp -d)
limpa() { rm -rf -- "$tmp"; }
trap limpa EXIT

# bloqueio: só uma instância por vez (exemplo; flock é do util-linux)
exec 9>/var/lock/meu-job.lock
flock -n 9 || { echo "ja em execucao" >&2; exit 1; }`),
          sl('Logging, argumentos e testes',
            'Uma função log curta, que escreve data e mensagem em stderr, mantém a saída padrão limpa para dados. Para argumentos use getopts (built-in POSIX): opções curtas, com ":" depois da letra se ela recebe valor; OPTARG guarda o valor, OPTIND indica onde terminam as opções (shift $((OPTIND-1))). Para testar scripts existe o bats (Bash Automated Testing System): cada @test roda comandos e verifica com [ ] ou helpers, o que vale em CI. E saiba abandonar o shell: quando o script ganha estruturas de dados, JSON, concorrência, muitos ramos ou precisa de testes mais ricos, migre para Python ou Go; o shell é ótimo para colar programas, não para lógica de aplicação.',
            `log() { printf '%s %s\\n' "$(date +%H:%M)" "$*" >&2; }
uso() { echo "uso: $0 [-v] [-o saida] arquivo" >&2; exit 2; }
verboso=0; saida=""
while getopts 'vo:' opt; do
    case $opt in v) verboso=1;; o) saida=$OPTARG;; *) uso;; esac
done
shift $((OPTIND-1))`),
          sl('Segurança: injeção e nomes de arquivo',
            'Arquivos podem ter nomes com espaço, quebra de linha ou começar com hífen (um arquivo chamado -rf, ou -n). Sem proteção, rm $f vira opções. Defesas: sempre aspas em "$var"; o marcador -- encerra as opções (rm -- "$f"); caminhos explícitos (./*) em vez de *; para lotes, find ... -print0 | xargs -0, que separa por byte nulo e aceita qualquer nome. NUNCA use eval (ou sh -c, bash -c) com entrada externa: o texto vira código. Valide entradas contra uma lista permitida (padrão case) e passe valores como argumentos, não como código. Sobre segredos: argumentos aparecem em ps e em /proc/PID/cmdline, e vão ao histórico; leia senhas de um arquivo com permissão 600, da entrada padrão ou de um gerenciador de segredos, e jamais as grave no script ou no repositório (use <placeholder> em exemplos).',
            `rm -- "$f"                                  # nome iniciando em - não vira opção
find . -type f -name '*.tmp' -print0 | xargs -0 rm --
# ERRADO: eval "$entrada_do_usuario"   (executa o que vier)
# ERRADO: mysql -p"$SENHA" ...         (senha visível em ps)`)
        ]
      },
      questions: [
        mcq('q1', 'Um script com #!/bin/sh usa arrays e [[ ]] e falha num servidor Debian. Qual é a explicação provável?',
          'b', ['O set -e está desativado, então o bash ignora os erros de sintaxe do script', 'Nesses sistemas /bin/sh costuma ser o dash, que só implementa POSIX', 'O shellcheck bloqueia arrays durante a execução do script em produção', 'Falta chmod +x no arquivo, o que impede o uso de qualquer recurso avançado'],
          'Arrays e [[ ]] são bashismos. Use #!/usr/bin/env bash ou reescreva em POSIX.'),
        mcq('q2', 'O que o aviso SC2086 do shellcheck indica?',
          'a', ['Variável usada sem aspas pode sofrer divisão de palavras e expansão de curingas', 'Variável definida em uma função e nunca usada em nenhum outro ponto do restante do script', 'Uso de eval com entrada externa, sem nenhuma validação, dentro de um laço while do script', 'Comando dentro de pipeline sem tratamento explícito de pipefail'],
          'Sem aspas, "relatorio de maio.txt" vira três argumentos. Cite as expansões: "$var".'),
        mcq('q3', 'Com set -e ativo e SEM pipefail, o que acontece com "false | true"?',
          'd', ['O script termina com erro, pois a primeira etapa falhou', 'Gera erro de sintaxe', 'O bash ignora a linha', 'O pipeline é considerado sucesso e o script continua'],
          'Sem pipefail vale o status do último comando. Com set -o pipefail o pipeline falha.'),
        fill('q4', 'Complete para a função limpa rodar em qualquer saída do script:',
          'trap limpa ___',
          ['EXIT', 'exit', '0'],
          'O pseudo-sinal EXIT dispara ao terminar, normalmente ou por erro, ideal para apagar temporários.'),
        mcq('q5', 'Um cron roda a cada minuto, mas o job às vezes leva dois minutos e as execuções se sobrepõem. Qual ferramenta resolve?',
          'c', ['trap EXIT, que executa uma função de limpeza ao terminar', 'mktemp -d, que cria diretórios temporários com nomes imprevisíveis', 'flock, que permite uma instância por vez', 'getopts, que interpreta as opções passadas na linha de comando'],
          'flock -n falha imediatamente se o bloqueio está tomado, evitando execuções concorrentes.'),
        mcq('q6', 'Um script faz eval "$CMD" onde CMD vem de um formulário. Qual é o risco?',
          'a', ['Injeção de comandos: o texto externo é sempre executado como código', 'Perda de desempenho, porque o eval reinterpreta a linha toda duas vezes', 'Quebra do getopts, que deixa de reconhecer as opções curtas', 'Nenhum, desde que a variável CMD esteja entre aspas duplas'],
          'eval interpreta o texto como código shell. Aspas não ajudam. Valide e passe valores como argumentos.'),
        mcq('q7', 'Qual é a forma mais adequada de entregar uma senha a um script?',
          'c', ['Como argumento da linha de comando: ./job --senha "<senha>"', 'Gravada no script, que fica protegido por chmod 700 no servidor', 'Lida de um arquivo com permissão 600 ou da entrada padrão, nunca da linha de comando', 'Numa variável exportada pelo ~/.bashrc de quem executa o script'],
          'Argumentos aparecem em ps e no histórico; arquivo restrito ou stdin evita a exposição.'),
        fill('q8', 'Complete a opção do xargs que lê itens separados por byte nulo (par de find -print0):',
          'find . -type f -print0 | xargs ___ rm --',
          ['-0'],
          'Com -print0 e xargs -0, nomes com espaços, aspas ou quebras de linha passam intactos.')
      ]
    },
    {
      id: 'lna-24-programacao-sistemas',
      title: 'Programação de sistemas',
      goal: 'Entender como o shell implementa pipes e redirecionamentos e dominar descritores, processos, sinais, sockets, multiplexação, mmap, threads/futex e errno.',
      xp: 30,
      intro: {
        slides: [
          sl('Descritores de arquivo e erros (errno)',
            'No Linux quase tudo é acessado por um descritor de arquivo (fd): um inteiro que indexa a tabela de arquivos abertos do processo. 0 é a entrada padrão, 1 a saída e 2 o erro. open devolve o MENOR número livre. Arquivos, pipes, sockets, terminais e até eventos aparecem como fds, e por isso o mesmo conjunto de chamadas (read, write, close, poll) vale para todos. As chamadas de sistema sinalizam erro devolvendo -1 e definindo a variável errno (ENOENT, EACCES, EINTR, EAGAIN...); perror e strerror traduzem o número em texto. Em Python o erro vira OSError, com o atributo errno. Verifique SEMPRE o retorno.',
            `# Python (roda em Linux e Windows): o erro vem como OSError
import os, errno
try:
    os.open('/nao/existe', os.O_RDONLY)
except OSError as e:
    print(e.errno == errno.ENOENT, e.strerror)   # True No such file or directory
# no Linux: ls -l /proc/self/fd  lista os fds do processo`),
          sl('fork, exec e wait',
            'fork cria uma cópia do processo: devolve 0 no filho, o PID do filho no pai e -1 em caso de erro. exec (família execve, execlp...) SUBSTITUI a imagem do processo pelo programa novo, mantendo os fds abertos: é assim que um shell roda comandos (fork, depois exec no filho). wait/waitpid faz o pai colher o status do filho; sem isso o filho terminado vira zumbi (ocupa uma entrada na tabela de processos até ser colhido). Se o pai morre antes, o filho é adotado pelo init (PID 1).',
            `# exemplo em Python (SOMENTE Linux/Unix: os.fork não existe no Windows)
import os
pid = os.fork()
if pid == 0:
    os.execvp("echo", ["echo", "filho"])
else:
    os.waitpid(pid, 0)`),
          sl('Pipes e dup2: como o shell implementa | e >',
            'pipe() cria um canal unidirecional com dois fds: um de leitura e um de escrita. Para executar "a | b" o shell cria o pipe, faz fork duas vezes e, em cada filho, usa dup2(fd_antigo, fd_novo) para trocar o fd 1 (no filho de a) pelo lado de escrita e o fd 0 (no filho de b) pelo lado de leitura; fecha os fds que sobraram e só então faz exec. O redirecionamento "> arq" é o mesmo truque: abre o arquivo e faz dup2(fd, 1) antes do exec. É essencial FECHAR a ponta de escrita nos processos que só leem: enquanto algum fd de escrita estiver aberto, o leitor nunca recebe fim de arquivo (EOF) e fica bloqueado.',
            `int fd[2];
pipe(fd);
if (fork() == 0) {            /* filho: escritor */
    close(fd[0]);
    dup2(fd[1], 1);           /* stdout passa a ser o pipe */
    close(fd[1]);
    execlp("echo", "echo", "ola", (char *)NULL);
    _exit(127);               /* so chega aqui se o exec falhar */
}
close(fd[1]);                 /* pai: so le */
char buf[64];
ssize_t n = read(fd[0], buf, sizeof buf);
wait(NULL);`),
          sl('Sinais e sigaction',
            'Sinais são notificações assíncronas (SIGINT do Ctrl+C, SIGTERM, SIGCHLD quando um filho termina, SIGPIPE ao escrever em pipe sem leitor). sigaction é a interface recomendada para instalar tratadores (mais previsível e portável que signal): permite máscara de sinais e flags. SIGKILL e SIGSTOP não podem ser capturados nem ignorados. Dentro de um tratador só se pode chamar funções async-signal-safe (muito poucas; printf e malloc não estão entre elas): o padrão seguro é apenas marcar uma flag volátil, ou transformar o sinal em evento de fd com signalfd (ou o truque do self-pipe) e tratá-lo no laço principal. Chamadas bloqueantes interrompidas por um sinal podem falhar com EINTR e devem ser repetidas.'),
          sl('Sockets e multiplexação (select, poll, epoll)',
            'Sockets são fds de comunicação: AF_INET/AF_INET6 com SOCK_STREAM (TCP, fluxo confiável) ou SOCK_DGRAM (UDP, datagramas), e AF_UNIX (comunicação local por um caminho no sistema de arquivos, com permissões e a possibilidade de consultar as credenciais do outro lado). Um servidor que atende muitos clientes sem uma thread cada usa multiplexação: espera eventos em vários fds. select é limitado (FD_SETSIZE, tipicamente 1024) e varre todos a cada chamada; poll não tem esse limite fixo, mas ainda varre a lista inteira; epoll registra os fds uma vez e o kernel devolve só os prontos, escalando bem para dezenas de milhares de conexões (modos level-triggered e edge-triggered). Com fds não bloqueantes, um read sem dados falha com EAGAIN em vez de bloquear. O módulo selectors do Python escolhe o melhor mecanismo disponível (epoll no Linux).',
            `# testado (Windows e Linux): eco em maiusculas com selectors
sel = selectors.DefaultSelector()
srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
srv.bind(('127.0.0.1', 0)); srv.listen(); srv.setblocking(False)
sel.register(srv, selectors.EVENT_READ)
# laço: for key, _ in sel.select(): aceitar, ler, responder`),
          sl('mmap, threads/futex e inotify',
            'mmap mapeia um arquivo (ou memória anônima) no espaço de endereços: ler e escrever passa a ser acesso à memória, com o kernel paginando sob demanda; MAP_SHARED propaga mudanças ao arquivo e a outros processos, MAP_PRIVATE usa cópia na escrita. Threads POSIX (pthread_create) compartilham memória e fds do processo, o que exige sincronização: o mutex do pthread é construído sobre o futex, que só chama o kernel quando há contenção (o caso sem disputa é resolvido em espaço de usuário, atomicamente), por isso é barato. inotify avisa por um fd quando arquivos/diretórios mudam (criação, modificação, remoção), evitando ficar consultando; existe limite de watches por usuário. eventfd é um contador em um fd, útil para acordar um laço de eventos de outra thread; signalfd entrega sinais como leituras.')
        ]
      },
      questions: [
        mcq('q1', 'Em C, o que fork() devolve no processo filho?',
          'd', ['O PID do pai', '-1', 'O PID do próprio filho', '0'],
          'No filho vale 0; no pai, o PID do filho; -1 indica falha (sem memória, limite de processos).'),
        mcq('q2', 'Como o shell executa "ls > saida.txt"?',
          'c', ['Interpretando a saída do ls e gravando o resultado no arquivo depois que ele termina', 'Passando o nome do arquivo como argumento ao ls, que cuida do resto', 'Abrindo o arquivo e fazendo dup2 sobre o fd 1 no filho, antes do exec', 'Criando um socket UNIX entre o shell e o ls para transferir a saída por mensagens'],
          'O redirecionamento é feito pelo shell no filho: abre o arquivo e troca o fd 1. O ls nem sabe.'),
        mcq('q3', 'Um servidor precisa atender dezenas de milhares de conexões ociosas. Qual mecanismo escala melhor?',
          'b', ['select, por varrer todos os fds a cada chamada', 'epoll, que registra os fds uma vez e devolve só os que estão prontos', 'Um fork por cliente, com um processo bloqueado em cada conexão', 'Um laço que faz read em cada socket, em sequência, sem esperar eventos'],
          'epoll evita varrer todos os descritores. select tem limite de FD_SETSIZE e custo linear.'),
        fill('q4', 'Qual função do módulo os do Python cria um pipe e devolve dois fds (leitura, escrita)?',
          'r, w = os.___()',
          ['pipe'],
          'os.pipe() devolve (fd_leitura, fd_escrita). Nos filhos que só leem, feche a escrita para receber EOF.'),
        mcq('q5', 'Qual afirmação sobre sinais está correta?',
          'a', ['SIGKILL nunca pode ser capturado nem ignorado', 'sigaction impede o uso de SIGTERM', 'Dentro de um tratador é seguro chamar printf e malloc', 'SIGCHLD é enviado ao filho quando o pai morre'],
          'SIGKILL e SIGSTOP são incapturáveis. Tratadores devem chamar apenas funções async-signal-safe.'),
        mcq('q6', 'Um read em socket não bloqueante falha com EAGAIN. O que isso significa?',
          'd', ['O socket foi fechado pelo par durante a leitura anterior', 'A permissão de leitura foi negada ao processo', 'O processo recebeu SIGKILL enquanto esperava dados', 'Não há dados agora; repetir quando o poll/epoll indicar'],
          'EAGAIN (ou EWOULDBLOCK) indica "nada a ler por enquanto". Não é erro fatal.'),
        mcq('q7', 'Por que o mutex de threads POSIX é barato no caso sem disputa?',
          'b', ['Porque desativa todas as outras threads do processo enquanto o mutex está tomado', 'Porque usa futex: só entra no kernel quando há contenção', 'Porque executa em hardware dedicado de sincronização, fora da CPU', 'Porque copia a memória do processo para cada thread que tenta o bloqueio'],
          'O caminho rápido é uma operação atômica em espaço de usuário; o syscall futex só ocorre quando a thread precisa esperar.'),
        fill('q8', 'Complete o tipo de socket usado por TCP em Python:',
          'socket.socket(socket.AF_INET, socket.___)',
          ['SOCK_STREAM'],
          'SOCK_STREAM é TCP (fluxo confiável); SOCK_DGRAM é UDP (datagramas).')
      ]
    },
    {
      id: 'lna-38-ipc-dbus',
      title: 'Comunicação entre processos e D-Bus',
      goal: 'Conhecer os mecanismos de IPC do Linux (pipes, sockets UNIX, memória compartilhada, filas, inotify, eventfd), entender o D-Bus e o polkit, escolher o mecanismo certo e evitar falhas de segurança como TOCTOU.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Pipes e FIFOs',
            'Processos têm memória isolada, então precisam de IPC (comunicação entre processos). O mais simples é o PIPE: um canal unidirecional com um buffer dentro do kernel e duas pontas (descritor de leitura e de escrita). O pipe anônimo (pipe()) só é compartilhado por parentesco (o filho herda os descritores), e é o que o shell usa em cmd1 | cmd2. A FIFO (named pipe, criada por mkfifo) é o mesmo mecanismo com um NOME no sistema de arquivos, o que permite que processos sem parentesco o abram. Comportamento essencial: escrever em um pipe cheio bloqueia o escritor; ler de um pipe vazio bloqueia o leitor; quando TODOS os escritores fecham suas pontas e o buffer esvazia, a leitura devolve 0 bytes (fim de arquivo); escrever sem nenhum leitor gera o sinal SIGPIPE (ou o erro EPIPE). É um fluxo de bytes: não preserva limites de mensagens.',
            'import os\nr, w = os.pipe()\nos.write(w, b"oi")\nprint(os.read(r, 10))          # b\'oi\'  (executado)\nos.close(w); os.close(r)\n# FIFO (shell): mkfifo /tmp/meu.fifo  # arquivo especial com nome'
          ),
          sl(
            'Sockets UNIX',
            'Sockets UNIX (AF_UNIX) são o IPC local mais versátil: bidirecionais, usam a mesma API de sockets da rede, mas sem pilha TCP/IP. SOCK_STREAM dá um fluxo de bytes orientado a conexão (como TCP); SOCK_DGRAM preserva os limites de cada mensagem (cada send é um datagrama inteiro). O socket é normalmente um ARQUIVO especial no sistema de arquivos (por exemplo /run/app.sock), e as PERMISSÕES desse arquivo (e do diretório) decidem quem pode conectar: para conectar, o processo precisa de permissão de escrita no socket. Linux também tem sockets abstratos (nome começando com byte nulo) que não são arquivos e não têm permissões de arquivo. Dois recursos de segurança e utilidade: SO_PEERCRED deixa o servidor saber o PID, UID e GID do cliente que conectou (autenticação local confiável, pois vem do kernel); e SCM_RIGHTS permite enviar um DESCRITOR DE ARQUIVO aberto a outro processo por mensagem auxiliar (o receptor ganha um descritor próprio para o mesmo arquivo ou socket), usado por systemd e servidores para passar conexões já aceitas. O socket.socketpair() cria um par já conectado.',
            'import socket\na, b = socket.socketpair()      # no Linux é um par AF_UNIX\na.sendall(b"ping")\nprint(b.recv(10))              # b\'ping\'  (executado; no Windows usa loopback)\n# ls -l /run/app.sock\n# srw-rw---- 1 root app ... /run/app.sock   <- s = socket (exemplo)'
          ),
          sl(
            'Memória compartilhada, semáforos e filas POSIX',
            'A memória compartilhada é o IPC mais rápido para grandes volumes: dois processos mapeiam a MESMA região de memória física, e os dados NÃO são copiados. Na API POSIX, shm_open cria ou abre um objeto de memória compartilhada (aparece como arquivo em /dev/shm, que é um tmpfs), ftruncate define o tamanho e mmap com MAP_SHARED o mapeia. A API System V (shmget, ipcs, ipcrm) é a mais antiga, com chaves numéricas, e ainda existe. O preço: NENHUMA sincronização vem de graça. Se dois processos incrementam um contador ao mesmo tempo, há condição de corrida e atualizações se perdem; é preciso um semáforo ou mutex compartilhado (POSIX: sem_open/sem_wait/sem_post). As filas de mensagens POSIX (mq_open, em /dev/mqueue se montado) guardam mensagens discretas, com prioridade, e preservam os limites. Em Python, multiprocessing.shared_memory encapsula a memória compartilhada POSIX.',
            'from multiprocessing import shared_memory\ns = shared_memory.SharedMemory(create=True, size=8)\ns.buf[:3] = b"abc"\nt = shared_memory.SharedMemory(name=s.name)   # outro "processo" abre pelo nome\nprint(bytes(t.buf[:3]))        # b\'abc\'  (executado)\nt.close(); s.close(); s.unlink()   # unlink remove o objeto\n# no Linux: ls /dev/shm   <- os objetos aparecem aqui (exemplo)'
          ),
          sl(
            'Sinais, inotify e eventfd',
            'Sinais (SIGTERM, SIGHUP, SIGUSR1) são notificações assíncronas minúsculas: carregam um número, quase nenhum dado, e interrompem o fluxo do processo; servem para controle (pedir que o serviço recarregue a configuração), não para trafegar dados. O inotify observa o SISTEMA DE ARQUIVOS: você registra um diretório ou arquivo e o kernel entrega eventos (arquivo criado, modificado, movido, apagado) por um descritor que pode ser lido ou esperado com poll/epoll. Substitui a consulta periódica (polling) e é a base de ferramentas que reagem a mudanças. Há limites ajustáveis, como fs.inotify.max_user_watches. O eventfd é um descritor de arquivo que guarda um contador de 64 bits: um lado escreve (soma) e o outro lê, o que o torna um jeito leve de ACORDAR outra thread ou processo, e como é um descritor, entra no mesmo poll/epoll dos sockets. Os três são mecanismos de NOTIFICAÇÃO, não de transporte de grandes volumes.',
            'cat /proc/sys/fs/inotify/max_user_watches   # exemplo: valor numérico (varia)\ninotifywait -m /var/spool/entrada      # (pacote inotify-tools) imprime eventos\n# /var/spool/entrada/ CREATE novo.txt   <- exemplo de saída'
          ),
          sl(
            'D-Bus: barramentos, nomes, objetos e interfaces',
            'O D-Bus é um sistema de IPC de ALTO NÍVEL: um daemon (dbus-daemon ou implementação equivalente) roteia mensagens entre serviços. Há dois barramentos: o de SISTEMA (um por máquina, para serviços do sistema; socket típico em /run/dbus/system_bus_socket) e o de SESSÃO (um por login de usuário, para aplicações do desktop; endereço na variável DBUS_SESSION_BUS_ADDRESS). O modelo: um serviço conecta e pode ter um NOME BEM CONHECIDO (como org.freedesktop.systemd1); cada conexão também recebe um nome único (como :1.42). Um serviço expõe OBJETOS identificados por CAMINHOS (como /org/freedesktop/systemd1). Cada objeto implementa INTERFACES (org.freedesktop.systemd1.Manager), que definem MÉTODOS (chamadas com resposta), SINAIS (eventos transmitidos aos interessados) e PROPRIEDADES. É introspectável: dá para descobrir métodos sem documentação. Ferramentas: busctl, dbus-send e gdbus.',
            'busctl --system list | head -3                    # exemplo (varia)\nbusctl --system introspect org.freedesktop.systemd1 /org/freedesktop/systemd1\ngdbus call --system --dest org.freedesktop.systemd1 \\\n  --object-path /org/freedesktop/systemd1 \\\n  --method org.freedesktop.systemd1.Manager.ListUnits    # nome, objeto, interface.método'
          ),
          sl(
            'polkit e quem usa D-Bus',
            'O D-Bus em si define quem pode falar com quem por arquivos de política (em /usr/share/dbus-1/system.d e /etc/dbus-1/system.d), mas ações PRIVILEGIADAS precisam de autorização mais fina. É o papel do POLKIT: um serviço privilegiado que recebe uma chamada D-Bus de um usuário comum pergunta ao polkit se aquele chamador está autorizado para uma ACTION ID (como org.freedesktop.systemd1.manage-units). As regras (arquivos JavaScript em /etc/polkit-1/rules.d, além de políticas dos pacotes) decidem permitir, negar ou exigir autenticação (por exemplo, a senha do administrador). Assim o serviço roda com privilégio, mas decide caso a caso. Quem usa D-Bus: o systemd (systemctl, logind, hostnamed, timedated falam com o systemd e seus serviços por D-Bus), o NetworkManager, o BlueZ e os ambientes de desktop (notificações, bandeja, bloqueio de tela). O pkcheck consulta o polkit pela linha de comando.',
            '# Regra polkit (exemplo, JavaScript) em /etc/polkit-1/rules.d/50-exemplo.rules\n# polkit.addRule(function(action, subject) {\n#   if (action.id == "org.freedesktop.systemd1.manage-units" && subject.isInGroup("ops")) {\n#     return polkit.Result.YES;\n#   }\n# });'
          ),
          sl(
            'Escolhendo o mecanismo e segurança',
            'Guia de escolha. Pipe: fluxo simples entre processos aparentados (pipelines). Socket UNIX: conversa bidirecional, múltiplos clientes, autenticação por SO_PEERCRED, passagem de descritores. Memória compartilhada: o menor custo para muitos dados (sem cópia), porém exige sincronização e cuidado. Fila POSIX: mensagens discretas com prioridade. inotify: reagir a mudanças em arquivos. D-Bus: API estruturada, com descoberta, sinais e autorização via polkit, ao custo de mais sobrecarga que um socket direto. SEGURANÇA. (1) Permissões: socket com modo 0666 ou em diretório aberto deixa qualquer usuário local conectar; restrinja dono, grupo e modo, e verifique o par com SO_PEERCRED. Objetos de memória compartilhada em /dev/shm também têm dono e modo (use 0600 por padrão). (2) TOCTOU (Time Of Check To Time Of Use): checar e depois usar abre uma janela em que o alvo muda; exemplo, access() seguido de open() em um caminho que outro usuário pode trocar por um link simbólico em /tmp. Defesa: operar sobre o DESCRITOR já aberto (fstat), usar open com O_EXCL, mkstemp e diretórios privados. (3) Dados pessoais: memória compartilhada e arquivos em /dev/shm persistem até serem removidos (shm_unlink) e podem sobreviver a uma falha do programa; minimize o dado, limpe o conteúdo e remova o objeto (LGPD: finalidade e minimização).',
            '# anti-padrão (TOCTOU)         # padrão seguro\n# if access(p, W_OK):          # fd = open(p, O_WRONLY|O_NOFOLLOW)\n#     open(p, "w")             # fstat(fd) ... usa o fd, não o nome\n# socket: chmod 0660 + grupo dedicado; segredo em shm: modo 0600 + shm_unlink'
          )
        ]
      },
      questions: [
        mcq('q1', 'Em um pipe anônimo, o que acontece quando o leitor lê depois que TODOS os escritores fecharam suas pontas e o buffer já esvaziou?', 'd', [
          'A leitura bloqueia indefinidamente, esperando que algum escritor reabra a ponta',
          'O leitor recebe SIGPIPE, pois o canal ficou sem escritores',
          'A leitura falha com EAGAIN e o descritor continua válido para novas escritas',
          'A leitura devolve sempre 0 bytes, o que indica fim de arquivo'
        ], 'Sem escritores e com buffer vazio, read devolve 0 (EOF). SIGPIPE é do lado de quem ESCREVE sem leitores.'),
        mcq('q2', 'Um daemon cria o socket UNIX /run/app.sock com modo 0666 e atende comandos administrativos. Qual é o problema e a prática correta?', 'b', [
          'Sockets UNIX não usam permissões, então o modo é irrelevante; basta mudar o nome do arquivo',
          'Qualquer usuário local pode conectar; restringir dono, grupo e modo e conferir o cliente com SO_PEERCRED',
          'O modo 0666 impede o servidor de aceitar conexões; deve-se usar um socket abstrato, que é mais restrito por não ter arquivo',
          'O problema é o tipo SOCK_STREAM, que não preserva limites; trocar por SOCK_DGRAM resolve o controle de acesso'
        ], 'Para conectar a um socket de arquivo é preciso permissão de escrita nele; com 0666 todos têm. SO_PEERCRED dá PID, UID e GID do cliente. O socket abstrato não tem permissões de arquivo.'),
        mcq('q3', 'Você quer reagir assim que um arquivo aparecer em um diretório, sem consultar o diretório a cada segundo. Qual mecanismo se encaixa melhor?', 'c', [
          'Um eventfd compartilhado entre o diretório e o programa, que conta arquivos criados',
          'Uma FIFO aberta no diretório, que recebe os nomes dos arquivos novos',
          'O inotify, que entrega eventos de criação do sistema de arquivos por um descritor',
          'O sinal SIGUSR1, que o kernel envia ao processo quando o diretório muda'
        ], 'inotify observa o sistema de arquivos e entrega eventos por descritor. eventfd é um contador entre processos, e sinais não são enviados pelo kernel por mudanças de diretório.'),
        fill('q4', 'Complete: os objetos de memória compartilhada POSIX criados por shm_open aparecem como arquivos em /dev/___.', 'ls /dev/___', ['shm', '/shm'], 'O /dev/shm é um tmpfs onde ficam os objetos criados por shm_open; eles persistem até shm_unlink.'),
        mcq('q5', 'Dois processos incrementam o mesmo contador em memória compartilhada POSIX, sem nenhuma coordenação. O que se espera e qual a correção?', 'a', [
          'Condição de corrida com atualizações perdidas; usar um semáforo ou mutex compartilhado',
          'O kernel serializa os acessos, então o resultado costuma sair correto; nada a fazer',
          'Os dados são copiados a cada acesso, então cada processo vê uma cópia; usar MAP_PRIVATE',
          'O mmap com MAP_SHARED bloqueia o segundo processo até o primeiro fechar o objeto com close'
        ], 'Memória compartilhada não traz sincronização: leitura e escrita concorrentes se perdem. Semáforos ou mutex compartilhados resolvem.'),
        mcq('q6', 'No comando "gdbus call --system --dest org.freedesktop.systemd1 --object-path /org/freedesktop/systemd1 --method org.freedesktop.systemd1.Manager.ListUnits", como identificar as partes?', 'd', [
          'Nome do serviço: org.freedesktop.systemd1.Manager; objeto: ListUnits; método: /org/freedesktop/systemd1, no barramento de sistema',
          'Nome: system; objeto: org.freedesktop.systemd1; método: Manager, chamado no barramento de sessão do usuário',
          'Nome: /org/freedesktop/systemd1; objeto: org.freedesktop.systemd1; método: ListUnits, no barramento de sistema',
          'Serviço org.freedesktop.systemd1; objeto /org/freedesktop/systemd1; interface Manager, método ListUnits; barramento de sistema'
        ], '--dest é o nome do serviço, --object-path é o caminho do objeto e --method traz interface e método. --system escolhe o barramento de sistema.'),
        mcq('q7', 'Um serviço do barramento de sistema recebe um pedido de um usuário comum para reiniciar uma unidade. Qual é o papel do polkit?', 'b', [
          'Substituir o dbus-daemon, roteando as mensagens entre os serviços e dispensando as políticas de barramento',
          'Ser consultado pelo serviço sobre o chamador e a action ID; regras permitem, negam ou pedem autenticação',
          'Cifrar o socket do barramento para impedir que usuários comuns leiam as mensagens trocadas',
          'Dar root permanente ao usuário que fez o pedido, depois de uma única aprovação registrada no log'
        ], 'O polkit decide autorização caso a caso por action ID, com regras e autenticação; não roteia nem concede root permanente.'),
        fill('q8', 'Complete a sigla da vulnerabilidade de checar e depois usar: Time Of Check To Time Of ___ (TOCTOU).', 'TOCTOU = Time Of Check To Time Of ___', ['Use', 'use'], 'TOCTOU é a janela entre checar e usar um recurso; a defesa é operar sobre o descritor já aberto (fstat, O_EXCL, mkstemp).')
      ]
    },
    {
      id: 'lna-25-redes-avancadas-linux',
      title: 'Redes avançadas no Linux',
      goal: 'Dominar roteamento por política, VRF, bridge com VLAN, bonding, WireGuard, tc/netem, nftables (sets e NAT), conntrack, roteamento dinâmico, OVS, IPv6 e diagnóstico.',
      xp: 30,
      intro: {
        slides: [
          sl('Roteamento por política e VRF',
            'O Linux consulta uma lista de REGRAS (ip rule), em ordem de prioridade, e cada regra aponta para uma tabela de rotas. Por padrão existem as regras local (prioridade 0), main (32766) e default (32767). Adicionando regras você roteia pela origem, por marca de pacote ou por interface, usando várias tabelas (numeradas, ou nomeadas em /etc/iproute2/rt_tables): útil para um servidor com duas saídas (dois provedores) que precisa responder pela mesma interface por onde recebeu. VRF (virtual routing and forwarding) cria domínios de roteamento isolados: interfaces escravas de um VRF usam a tabela dele, permitindo redes com endereços sobrepostos no mesmo host (visão geral).',
            `ip rule add from 192.0.2.0/24 table 100
ip route add default via 198.51.100.1 dev eth1 table 100
ip rule show
# exemplo (varia): 0: from all lookup local / 32765: from 192.0.2.0/24 lookup 100 / 32766: from all lookup main
# VRF (visão geral): ip link add vrf-a type vrf table 10`),
          sl('Bridge com VLAN e bonding',
            'Uma bridge Linux age como um switch virtual; com vlan_filtering ela filtra por VLAN: cada porta aceita certas VLANs (tagged) e pode ter uma VLAN nativa (pvid, untagged). O comando bridge vlan gerencia e mostra isso. Bonding (ou teaming) agrega interfaces: active-backup (uma ativa, a outra em espera, funciona com qualquer switch), balance-rr (rodízio), balance-xor e 802.3ad (LACP, agregação dinâmica que exige configuração compatível no switch, e balanceia por fluxo, então uma única conexão não ultrapassa a velocidade de um link).',
            `ip link add br0 type bridge vlan_filtering 1
ip link set eth1 master br0
bridge vlan add dev eth1 vid 10 pvid untagged
bridge vlan show`),
          sl('WireGuard',
            'WireGuard é uma VPN simples no kernel, configurada como interface (wg0). Cada ponta tem um par de chaves; você informa a chave PÚBLICA do par. A chave privada fica num arquivo com permissão 600 e nunca vai ao repositório. Em cada [Peer], AllowedIPs tem DUAS funções: é a tabela de roteamento (quais destinos vão por este par) e o filtro de entrada (quais endereços de origem são aceitos depois de decifrados). O tráfego só é enviado a pares conhecidos, e o WireGuard não responde a pacotes de quem não tem a chave (superfície discreta).',
            `# /etc/wireguard/wg0.conf  (chaves são placeholders)
[Interface]
PrivateKey = <chave-privada-local>
Address = 10.8.0.1/24
ListenPort = 51820

[Peer]
PublicKey = <chave-publica-do-par>
AllowedIPs = 10.8.0.2/32
# subir: wg-quick up wg0   |   status: wg show`),
          sl('tc e netem (somente em ambiente próprio)',
            'tc configura disciplinas de fila (qdisc), que decidem como pacotes saem de uma interface. O netem emula condições ruins de rede (atraso, jitter, perda, duplicação, reordenação) para testar aplicações. Use SOMENTE em laboratório ou ambiente próprio: aplicado na interface errada pode derrubar a sua própria sessão SSH ou produção. Sempre saiba como desfazer (tc qdisc del) antes de aplicar.',
            `sudo tc qdisc add dev eth0 root netem delay 100ms loss 1%
tc qdisc show dev eth0
sudo tc qdisc del dev eth0 root     # desfaz`),
          sl('nftables: conjuntos, mapas e NAT',
            'O nftables substitui iptables com uma sintaxe única para IPv4/IPv6 (família inet), tabelas, cadeias e regras. Sets guardam listas de endereços/portas e permitem regras curtas e rápidas (um set de IPs bloqueados); mapas associam chaves a valores (por exemplo, porta de entrada a servidor de destino) e podem ser alterados sem recarregar a regra. NAT: SNAT reescreve a ORIGEM na saída (hook postrouting); masquerade é um SNAT que usa o endereço atual da interface (bom para IP dinâmico); DNAT reescreve o DESTINO na entrada (hook prerouting), usado para encaminhar portas. O roteador precisa de net.ipv4.ip_forward=1.',
            `table inet filtro {
    set bloqueados { type ipv4_addr; elements = { 203.0.113.5, 203.0.113.9 } }
    chain input {
        type filter hook input priority 0; policy drop;
        ct state established,related accept
        ip saddr @bloqueados drop
        tcp dport 22 accept
    }
}
table ip nat {
    chain postrouting { type nat hook postrouting priority 100; oifname "eth0" masquerade }
}`),
          sl('conntrack, roteamento dinâmico, OVS e IPv6',
            'O conntrack acompanha o estado de cada fluxo (base do ct state e do NAT): conntrack -L lista e conntrack -S mostra estatísticas. A tabela tem limite (net.netfilter.nf_conntrack_max); se enche, pacotes novos são descartados e o log do kernel registra "table full, dropping packet". Ajustes: aumentar o limite (consome memória), reduzir timeouts e evitar rastrear tráfego desnecessário. Roteamento dinâmico: FRR e BIRD são daemons que falam BGP, OSPF e outros, transformando um Linux em roteador. Open vSwitch (OVS) é um switch virtual programável (OpenFlow, VLANs, túneis VXLAN) usado em virtualização/SDN. IPv6: endereços são autoconfigurados (SLAAC), o ND (neighbor discovery) substitui o ARP, endereços fe80:: são link-local e o firewall precisa tratar IPv6 explicitamente (família inet cobre ambos).'),
          sl('Diagnóstico com tcpdump, ss e ip -s',
            'tcpdump captura pacotes (-i interface, -nn sem resolver nomes, filtros como port 53 ou host X, -c N para parar após N, -w arquivo para salvar). Capture SOMENTE em redes suas ou com autorização formal: capturas podem conter dados pessoais e credenciais; colete o mínimo (filtros, pouco tempo), guarde protegido e apague depois. ss lista sockets (-t TCP, -u UDP, -l escutando, -p processo, -n numérico). ip -s link mostra contadores por interface: erros, descartes (dropped) e overruns indicam problema físico, de driver ou de saturação.',
            `sudo tcpdump -i eth0 -nn -c 20 port 53
ss -tan state established
ip -s link show eth0
# exemplo (varia): RX: bytes packets errors dropped ...   (valores didáticos)`)
        ]
      },
      questions: [
        mcq('q1', 'Um servidor com dois provedores recebe tráfego por eth1, mas responde por eth0, e o retorno é descartado. Qual recurso resolve?',
          'a', ['Roteamento por política: ip rule por origem apontando para uma tabela com a saída de eth1', 'Aumentar o valor de nf_conntrack_max, para comportar um número bem maior de fluxos rastreados', 'Aplicar netem com perda de 1% para forçar as retransmissões a seguirem pela outra rota, a fim de testar', 'Trocar o bonding para o modo balance-rr, distribuindo os pacotes entre os links'],
          'Com ip rule from ... table N a resposta sai pela rota certa. Essa é a função do roteamento por política.'),
        mcq('q2', 'Qual é o duplo papel de AllowedIPs no WireGuard?',
          'b', ['Define a porta UDP de escuta e o MTU da interface, além do endereço do par no túnel', 'Serve de tabela de roteamento para o par e de filtro de origem do que chega dele depois de decifrado', 'Armazena a chave pública e a chave privada de cada par configurado no arquivo wg0.conf', 'Lista os servidores DNS que o túnel passa a usar'],
          'Destinos listados vão por aquele par; pacotes decifrados dele só são aceitos se a origem estiver na lista.'),
        mcq('q3', 'Qual modo de bonding agrega links por LACP e exige suporte no switch?',
          'c', ['active-backup', 'balance-rr', '802.3ad', 'broadcast'],
          '802.3ad é o LACP; active-backup funciona com qualquer switch, mas só um link fica ativo.'),
        fill('q4', 'Complete a regra de roteamento por política que usa a tabela 100 para uma origem:',
          'ip rule add from 192.0.2.0/24 ___ 100',
          ['table', 'lookup'],
          'ip rule add ... table 100 (ou lookup 100) encaminha a consulta de rotas à tabela 100.'),
        mcq('q5', 'Para testar uma aplicação sob rede ruim, você usa tc ... netem delay 100ms loss 1%. Qual cuidado é essencial?',
          'd', ['Aplicar direto na interface de produção, para ter um resultado fiel ao real', 'Dispensar o comando de desfazer, pois o netem expira sozinho em minutos', 'Combinar com tcpdump para capturar todo o tráfego, inclusive o de terceiros', 'Usar somente em ambiente próprio e saber desfazer com tc qdisc del'],
          'Atraso e perda na interface errada derrubam seu SSH. Teste em laboratório e tenha o rollback pronto.'),
        mcq('q6', 'Num gateway com IP público dinâmico, qual regra de NAT reescreve a origem usando o endereço atual da interface?',
          'c', ['dnat no hook prerouting', 'Um set de endereços bloqueados', 'masquerade no hook postrouting', 'ct state established,related accept'],
          'masquerade é um SNAT que consulta o IP da interface de saída. DNAT reescreve o destino na entrada.'),
        mcq('q7', 'O log do kernel mostra "nf_conntrack: table full, dropping packet". O que significa?',
          'b', ['O disco do roteador está cheio e o kernel não consegue mais gravar conexões no arquivo de estado', 'A tabela de conexões rastreadas atingiu o limite; pacotes novos são descartados', 'O bonding perdeu um dos links e passou ao modo active-backup', 'O WireGuard recusou a chave pública de um dos pares e derrubou as sessões TCP abertas'],
          'Revise nf_conntrack_max (memória), timeouts e o que é rastreado, e investigue a causa do excesso de conexões.'),
        fill('q8', 'Complete o filtro do tcpdump para capturar apenas o tráfego DNS (porta 53) em rede autorizada:',
          'sudo tcpdump -i eth0 -nn ___ 53',
          ['port'],
          'O filtro "port 53" restringe a captura. Quanto mais restrito, menos dado pessoal capturado.')
      ]
    },
    {
      id: 'lna-26-observabilidade-sre',
      title: 'Observabilidade e SRE em Linux',
      goal: 'Montar observabilidade (métricas, logs, traces), definir SLI/SLO e orçamento de erro, planejar capacidade, criar alertas acionáveis e conduzir incidentes sem culpados, respeitando a privacidade.',
      xp: 30,
      intro: {
        slides: [
          sl('Métricas, logs e traces',
            'Observabilidade é conseguir entender o estado interno do sistema a partir do que ele emite. Três sinais se complementam. Métricas são números amostrados ao longo do tempo (uso de CPU, requisições por segundo): baratas, fáceis de agregar e ótimas para alertas e tendências. Logs são eventos discretos com contexto (um erro, uma requisição): detalhados, mais caros de guardar. Traces seguem uma requisição por vários serviços, mostrando onde o tempo foi gasto. Métricas dizem QUE algo está errado, logs e traces ajudam a descobrir POR QUÊ.'),
          sl('node_exporter, Prometheus e Grafana',
            'O node_exporter expõe métricas do host Linux (CPU, memória, disco, rede) em texto via HTTP no caminho /metrics (porta padrão 9100). O Prometheus funciona em modelo pull: ele busca (scrape) periodicamente cada alvo configurado e guarda séries temporais, consultáveis em PromQL; o Alertmanager cuida de agrupar e enviar alertas; o Grafana monta painéis a partir dessas fontes. Restrinja o acesso à porta das métricas por firewall/rede interna ou TLS, pois elas revelam detalhes da infraestrutura.',
            `# prometheus.yml (trecho; endereço fictício)
scrape_configs:
  - job_name: nodes
    static_configs:
      - targets: ['10.0.0.11:9100']
# PromQL (exemplo): uso de CPU por instância
# 100 - avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100`),
          sl('Logs centralizados',
            'Logs só em cada máquina somem com ela e são difíceis de correlacionar. O padrão é enviar tudo a um local central: o journald (ou arquivos) alimenta um coletor (por exemplo Fluent Bit ou Vector) que encaminha a um armazenamento pesquisável; ou o rsyslog encaminha por rede. O envio deve ir criptografado (syslog sobre TLS, tipicamente na porta 6514) e autenticado, pois logs revelam muito da infraestrutura. Defina retenção, controle de acesso e formato estruturado (campos como nível, serviço, identificador de requisição).',
            `# /etc/rsyslog.d/50-remoto.conf  (exemplo; certificados configurados à parte)
*.* action(type="omfwd" target="logs.example.com" port="6514" protocol="tcp"
           StreamDriver="gtls" StreamDriverMode="1" StreamDriverAuthMode="x509/name")`),
          sl('SLI, SLO e orçamento de erro',
            'SLI (indicador) é uma medida do que o usuário percebe, como a fração de requisições bem-sucedidas e rápidas. SLO (objetivo) é a meta para o SLI numa janela, por exemplo 99,9% em 30 dias. O orçamento de erro é o que sobra: 1 - SLO. Com 99,9% em 30 dias, o orçamento é 0,1% de 43.200 minutos = 43,2 minutos de indisponibilidade (calculado). Enquanto há orçamento, a equipe pode lançar mudanças com risco; quando acaba, prioriza-se a confiabilidade. 100% não é meta realista nem desejável: custa caro e impede evoluir. SLA é o contrato com o cliente, normalmente mais folgado que o SLO interno.',
            `SLO 99.9% em 30 dias:  0.001 x 30 x 24 x 60 = 43.2 min
SLO 99.5% em 30 dias:  0.005 x 43200      = 216 min`),
          sl('Capacity planning e projeção de disco',
            'Planejar capacidade é prever quando um recurso vai acabar e agir antes. Para o disco, a projeção linear mais simples: dias restantes = (capacidade - uso) / crescimento por dia. Exemplo didático: disco de 500 GB, 320 GB usados, crescendo 2,5 GB por dia: (500 - 320) / 2,5 = 72 dias (calculado). O Prometheus tem predict_linear para estimar isso sobre séries reais. Alerte por tempo restante ("encherá em menos de 4 dias"), que dá margem para agir, e não só por percentual. Modelos lineares falham com crescimento exponencial ou sazonal: confira periodicamente com dados reais e inclua CPU, memória e rede nas tendências.',
            `capacidade=500; usado=320; crescimento=2.5
dias = (capacidade - usado) / crescimento
print(dias)   # 72.0  (valores didáticos)`),
          sl('Alertas acionáveis, runbooks e incidentes',
            'Um bom alerta indica um sintoma que afeta usuários (ou o iminente esgotamento de orçamento/recurso), exige ação humana imediata e traz contexto e link para um runbook (passo a passo de diagnóstico e mitigação). Alerta que ninguém age vira ruído e causa fadiga. Durante um incidente: declare-o, nomeie um comandante e quem comunica, MITIGUE primeiro (reverter, desviar tráfego) e investigue a causa raiz depois, registrando a linha do tempo. O post-mortem sem culpados trata falhas como falhas de sistema e processo, não de pessoas: descreve o que aconteceu, o impacto, as causas contribuintes e ações com responsáveis e prazos. Privacidade: não coloque dados pessoais (e-mails, CPFs, IPs de usuários, tokens) em rótulos de métricas ou mensagens de log sem necessidade; use identificadores internos ou mascarados, defina retenção e controle o acesso. Rótulos com valores únicos por usuário também explodem a cardinalidade e o custo.')
        ]
      },
      questions: [
        mcq('q1', 'Qual sinal de observabilidade é mais adequado para acompanhar a tendência de uso de CPU ao longo de semanas?',
          'b', ['Logs textuais livres', 'Métricas (séries temporais)', 'Traces de uma única requisição', 'Core dumps'],
          'Métricas são baratas e agregáveis, ideais para tendências e alertas. Logs e traces explicam casos específicos.'),
        mcq('q2', 'Como o Prometheus obtém as métricas de um node_exporter?',
          'd', ['O node_exporter empurra os dados ao servidor por meio de syslog', 'Recebe por e-mail diário, em formato CSV', 'Por um agente que roda dentro do Grafana e repassa os dados', 'Faz scrape periódico do endpoint HTTP /metrics'],
          'O modelo é pull: o servidor busca em intervalos configurados nos alvos (porta padrão 9100).'),
        mcq('q3', 'Qual relação entre SLI, SLO e orçamento de erro está correta?',
          'a', ['O SLI mede, o SLO é a meta para o SLI e o orçamento de erro é 1 menos o SLO', 'O SLO mede o serviço e o SLI é o contrato firmado com o cliente, com multa por descumprimento', 'O orçamento de erro é o SLO dividido por dois, expresso em minutos por mês de operação', 'SLI e SLA são nomes diferentes para o mesmo contrato com o cliente'],
          'Com SLO de 99,9%, o orçamento de erro é 0,1% da janela.'),
        fill('q4', 'Quantos minutos de orçamento de erro há num SLO de 99,9% em 30 dias? (0,001 x 43200)',
          'orçamento = 0.001 * 43200   # = ___ minutos',
          ['43,2', '43.2', '43,2 minutos', '43.2 minutos'],
          '0,1% de 43.200 minutos = 43,2 minutos (calculado).'),
        mcq('q5', 'Qual alerta é mais acionável?',
          'c', ['CPU acima de 70% por um minuto em qualquer servidor da frota', 'Disco do servidor de homologação em 50% de uso', 'Taxa de erros acima do limite do SLO por 10 minutos, com runbook', 'Memória livre abaixo de 2 GB em um servidor, sem contexto adicional'],
          'Alertas devem refletir impacto ao usuário, exigir ação e trazer runbook. Limiar arbitrário gera ruído.'),
        mcq('q6', 'Qual é a postura de um post-mortem sem culpados?',
          'd', ['Identificar quem errou, para aplicar sanções proporcionais ao impacto sobre os clientes', 'Evitar registrar a linha do tempo, para reduzir a exposição das pessoas envolvidas', 'Publicar só o resumo executivo, sem detalhes técnicos da causa', 'Analisar falhas de sistema e processo, com ações, responsáveis e prazos'],
          'Culpar pessoas esconde informação. O foco é aprender e corrigir as condições que permitiram a falha.'),
        mcq('q7', 'Qual prática protege a privacidade em observabilidade?',
          'a', ['Usar identificadores internos ou mascarados e evitar dados pessoais em rótulos e logs', 'Registrar o e-mail completo do usuário em cada rótulo de métrica, para facilitar buscas', 'Gravar tokens de acesso nos logs, para depurar falhas de autenticação', 'Manter os logs indefinidamente, por precaução, caso surja uma investigação'],
          'Dados pessoais em métricas e logs ampliam risco e cardinalidade. Minimização e retenção limitada valem aqui também.'),
        fill('q8', 'Um disco de 500 GB tem 320 GB usados e cresce 2,5 GB por dia. Em quantos dias encherá?',
          'dias = (500 - 320) / 2.5   # = ___',
          ['72', '72 dias', '72.0'],
          '180 GB livres / 2,5 GB por dia = 72 dias (verificado por script).')
      ]
    },
    {
      id: 'lna-27-forense-resposta-incidentes',
      title: 'Resposta a incidentes e forense em Linux',
      goal: 'Conduzir, de forma defensiva, a resposta a um incidente: preservar evidências, investigar, conter, erradicar, recuperar, comunicar (LGPD) e aprender.',
      xp: 30,
      intro: {
        slides: [
          sl('Ordem de volatilidade e preservação de evidências',
            'Evidências digitais somem em ritmos diferentes. A ordem de volatilidade manda coletar primeiro o que desaparece antes: registradores e caches; memória RAM e processos em execução; estado da rede (conexões, tabelas ARP, rotas); sistemas de arquivos e discos; por fim logs remotos, backups e mídias. Desligar a máquina às pressas destrói a RAM; por isso, em geral, prefere-se ISOLAR da rede (mantendo a máquina ligada) e coletar o volátil antes de qualquer desligamento. Preserve: trabalhe sobre CÓPIAS, nunca sobre o original; faça imagem do disco bit a bit com a origem somente leitura (bloqueador de escrita ou montagem ro), calcule um hash (sha256sum) antes e depois para provar que nada mudou, e mantenha a cadeia de custódia (documento de quem coletou, quando, onde, como e quem teve acesso). Em dd, if= é a origem e of= o destino: trocar os dois destrói dados, então confira duas vezes e use sempre uma mídia de destino vazia.',
            `# exemplo (dispositivos fictícios; CONFIRA if= e of= antes de rodar)
sudo dd if=/dev/sdX of=/mnt/evidencias/caso01.img bs=4M conv=noerror,sync status=progress
sha256sum /mnt/evidencias/caso01.img > caso01.img.sha256   # registre e guarde o hash`),
          sl('Onde olhar: acessos, processos e conexões',
            'Autenticação: /var/log/auth.log (Debian/Ubuntu) ou /var/log/secure (RHEL e derivados), ou journalctl -u ssh/sshd. last mostra logins bem-sucedidos (/var/log/wtmp), lastb tentativas falhas (/var/log/btmp, exige root) e w/who quem está logado agora. Processos: ps auxf (árvore), ss -tulpn (portas em escuta com processo) e ss -tnp (conexões estabelecidas), lsof -i (arquivos de rede abertos). ls -l /proc/PID/exe revela o executável real; a marca "(deleted)" indica binário apagado do disco mas ainda em execução. Anote horários, usuários e IPs de origem: são dados pessoais em potencial, trate com acesso restrito.',
            `last -n 10
sudo ss -tulpn
sudo ls -l /proc/<pid>/exe
# exemplo (varia): /proc/<pid>/exe -> /tmp/.x (deleted)   <- suspeito`),
          sl('Persistência e arquivos modificados',
            'Quem invade costuma deixar formas de voltar; a verificação defensiva olha: cron (/etc/cron*, crontab -l -u USUÁRIO), unidades e timers do systemd (/etc/systemd/system, systemctl list-unit-files), chaves SSH não reconhecidas em ~/.ssh/authorized_keys, scripts de login (~/.bashrc, ~/.profile, /etc/profile.d), /etc/ld.so.preload, contas novas ou com UID 0 em /etc/passwd e regras em /etc/sudoers.d. Arquivos alterados: find / -xdev -type f -mtime -2 lista os modificados nos últimos dois dias, mas datas podem ser falsificadas, então é indício, não prova. Mais confiável é comparar com o gerenciador de pacotes: rpm -V (ou rpm -Va) e debsums -c apontam arquivos de pacote cujo conteúdo, permissões ou dono mudaram. Também compare com um baseline de hashes feito antes do incidente. O auditd registra eventos do kernel segundo regras (ex.: auditctl -w /etc/passwd -p wa -k identidade; consultar com ausearch -k identidade).',
            `find / -xdev -type f -mtime -2 2>/dev/null | head
rpm -V openssh-server          # RHEL e derivados
debsums -c                     # Debian e derivados: lista arquivos alterados`),
          sl('Contenção, erradicação e recuperação',
            'Contenção é limitar o dano sem destruir evidências: isole a máquina da rede (regra de firewall, VLAN de quarentena ou desligar a porta do switch), bloqueie contas, REVOGUE credenciais, chaves SSH e tokens envolvidos e troque segredos que possam ter sido expostos. Erradicação: remova a causa, o que normalmente significa corrigir a vulnerabilidade e REconstruir o sistema a partir de uma imagem confiável, em vez de "limpar" um sistema comprometido (você nunca tem certeza de ter achado tudo). Recuperação: restaurar dados de um backup anterior ao incidente e verificado, retornar ao serviço em etapas e monitorar de perto sinais de reinfecção. Documente cada ação com horário.'),
          sl('Comunicação e LGPD; lições aprendidas',
            'Se o incidente envolve dados pessoais, a LGPD (Lei 13.709/2018) prevê que o controlador comunique à ANPD (Autoridade Nacional de Proteção de Dados) e ao titular a ocorrência de incidente de segurança que possa acarretar risco ou dano relevante aos titulares, em prazo razoável definido em regulamentação. A comunicação descreve, em linguagem clara, a natureza dos dados afetados, os titulares envolvidos, as medidas técnicas adotadas e os riscos. Tenha o encarregado (DPO), o jurídico e a comunicação envolvidos desde cedo e registre o incidente. Esta visão geral não substitui orientação jurídica. Por fim, faça a análise pós-incidente sem culpados: como entrou, o que detectou, o que atrasou, e quais controles (MFA, segmentação, logs centralizados, patches) serão implementados com responsáveis e prazos.')
        ]
      },
      questions: [
        mcq('q1', 'Pela ordem de volatilidade, o que se deve coletar primeiro numa máquina suspeita ainda ligada?',
          'c', ['O conteúdo do disco, por ser o dado mais importante para a análise', 'Os backups remotos, antes que sejam sobrescritos pela rotina', 'A memória e os processos em execução, e o estado da rede', 'Os logs antigos já rotacionados, que ocupam muito espaço'],
          'O que some primeiro (RAM, conexões) é coletado antes. Disco e backups persistem.'),
        mcq('q2', 'Qual conjunto de práticas preserva a validade de uma evidência de disco?',
          'a', ['Trabalhar em cópia, origem somente leitura, hash antes e depois e cadeia de custódia', 'Montar o disco original com escrita habilitada, para comparar mudanças depois da análise inicial', 'Executar fsck no original antes de copiar, para limpar erros do sistema de arquivos primeiro', 'Copiar arquivo a arquivo pelo gerenciador gráfico e descartar o hash'],
          'O hash comprova que a cópia é fiel e a cadeia de custódia comprova quem manuseou. Alterar o original invalida a prova.'),
        mcq('q3', 'Qual destes locais é um ponto de persistência a verificar?',
          'd', ['/usr/share/doc, onde ficam documentações dos pacotes instalados', 'O cache do gerenciador de pacotes, com arquivos baixados e descartáveis', 'O arquivo /var/log/lastlog, que registra o último login de cada conta', '~/.ssh/authorized_keys de contas de usuário'],
          'Chaves SSH desconhecidas permitem voltar sem senha. Cheque também cron, units do systemd e scripts de login.'),
        fill('q4', 'Em distribuições RHEL e derivadas, qual arquivo de /var/log guarda os eventos de autenticação (no Debian é o auth.log)?',
          'sudo less /var/log/___',
          ['secure'],
          '/var/log/secure é o equivalente RHEL ao auth.log do Debian/Ubuntu.'),
        mcq('q5', 'Um servidor foi comprometido. Qual abordagem de contenção e erradicação é mais adequada?',
          'b', ['Apagar os logs para ocultar o problema e reduzir o ruído na investigação do incidente em curso', 'Isolar da rede, revogar credenciais, coletar evidências e reconstruir de imagem confiável, registrando cada ação', 'Reiniciar o servidor e voltar ao serviço imediatamente, sem investigar', 'Desligar da tomada sem coletar nada e reaproveitar o mesmo disco em outra máquina da equipe'],
          'Isolar preserva evidências, revogar credenciais fecha o acesso e reconstruir evita confiar num sistema que pode ter resíduos.'),
        mcq('q6', 'Por que mtime sozinho não basta para provar quais arquivos foram alterados?',
          'd', ['Porque o mtime só existe em volumes NFS e não é mantido em discos locais comuns do servidor', 'Porque o comando find não consegue ler o mtime dos arquivos', 'Porque o mtime é imutável e confiável, o que torna qualquer comparação desnecessária', 'Porque datas podem ser falsificadas; rpm -V, debsums e baselines dão evidência mais confiável do que o mtime'],
          'O mtime é indício. Verificação de integridade de pacotes e baselines de hash dão evidência mais forte.'),
        mcq('q7', 'Um incidente expôs dados pessoais de clientes. O que a LGPD espera em termos gerais?',
          'a', ['Comunicação à ANPD e aos titulares se houver risco ou dano relevante, descrevendo o ocorrido', 'Silêncio total até concluir a perícia, por mais tempo que isso leve e quantos titulares atinja', 'Comunicar à equipe de TI, para não alarmar clientes', 'Apagar os registros do incidente depois de corrigido, para reduzir o risco de nova exposição dos dados'],
          'A comunicação é responsabilidade do controlador e envolve encarregado e jurídico. Esta lição não substitui orientação jurídica.'),
        fill('q8', 'Qual comando gera o hash SHA-256 de uma imagem de evidência?',
          '___ caso01.img',
          ['sha256sum'],
          'Registre o hash na coleta e confira depois: se divergir, a evidência foi alterada.')
      ]
    },
    {
      id: 'lna-28-criptografia-confianca-sistema',
      title: 'Criptografia e cadeia de confiança no sistema',
      goal: 'Entender LUKS2, TPM2, Secure Boot, IMA/dm-verity, assinaturas de pacotes, gestão de chaves, TLS no servidor, rotação e fontes de aleatoriedade.',
      xp: 30,
      intro: {
        slides: [
          sl('LUKS2: slots de chave e KDF',
            'O LUKS é o padrão de criptografia de disco no Linux (camada dm-crypt). O dado é cifrado com uma chave mestra de volume, e essa chave mestra fica guardada, cifrada, no cabeçalho em slots de chave (keyslots). Cada slot contém a chave mestra protegida por uma senha/chave diferente: assim você pode adicionar, trocar ou remover senhas sem recriptografar o disco inteiro (o LUKS2 admite vários slots). Para transformar a senha em chave usa-se uma função de derivação deliberadamente cara (KDF): o LUKS2 usa por padrão argon2, que exige muita memória e tempo, o que encarece ataques de força bruta com GPUs (o LUKS1 usava PBKDF2). Faça backup do cabeçalho (luksHeaderBackup) e guarde-o em local seguro: se o cabeçalho for corrompido, os dados são irrecuperáveis. AVISO: luksFormat destrói o conteúdo; pratique com um arquivo de imagem, em ambiente de teste.',
            `truncate -s 100M disco-teste.img                 # arquivo de laboratório
sudo cryptsetup luksFormat disco-teste.img        # DESTROI o conteúdo do alvo
sudo cryptsetup open disco-teste.img cofre        # cria /dev/mapper/cofre
sudo cryptsetup luksDump disco-teste.img          # mostra slots e KDF
sudo cryptsetup luksAddKey disco-teste.img        # segunda senha em outro slot`),
          sl('TPM2 e systemd-cryptenroll',
            'O TPM2 é um chip (ou firmware) seguro que guarda chaves e registra medições do boot em registradores PCR. Dá para "selar" uma chave de disco ao TPM de modo que ele só a libere se os PCRs escolhidos tiverem o valor esperado, ou seja, se a cadeia de boot não foi alterada. O systemd-cryptenroll registra esse método num slot do LUKS2, e o disco passa a abrir sozinho no boot sem digitar senha, mas só no mesmo hardware e com o mesmo estado de boot. Mantenha SEMPRE uma chave de recuperação (senha ou recovery key) em outro slot, pois uma atualização de firmware ou mudança de PCR pode impedir o desbloqueio automático. Visão geral.',
            `sudo systemd-cryptenroll --tpm2-device=auto --tpm2-pcrs=7 /dev/sdX
sudo systemd-cryptenroll --recovery-key /dev/sdX    # guarde em local seguro (fora do disco)`),
          sl('Secure Boot e a cadeia de confiança',
            'Cadeia de confiança: cada etapa verifica a assinatura da próxima antes de executá-la. No Secure Boot o firmware UEFI verifica o bootloader contra chaves guardadas em suas bases (db permitidos, dbx revogados); em distribuições comuns entra um pequeno shim assinado, que por sua vez verifica o GRUB e o kernel (e módulos), com chaves do distribuidor ou do próprio administrador (MOK). O objetivo é impedir que código não assinado rode antes do sistema operacional (bootkits). Diferencie: boot VERIFICADO impede executar o que não é confiável; boot MEDIDO (TPM) registra o que rodou, e o resultado pode ser usado para atestar ou liberar segredos.'),
          sl('IMA/EVM, dm-verity e builds reproduzíveis',
            'IMA (integrity measurement architecture) mede e pode exigir assinatura de arquivos quando são executados ou lidos; o EVM protege metadados (donos, permissões, atributos estendidos) contra adulteração offline. O dm-verity verifica, no nível de bloco, uma partição somente leitura com uma árvore de hashes (Merkle): cada bloco lido é conferido, e o hash raiz, assinado ou fixado no boot, garante que nada mudou; é a base de sistemas imutáveis e appliances. Builds reproduzíveis: compilar o mesmo código-fonte com o mesmo ambiente produz binários idênticos bit a bit, o que permite a terceiros conferir que o binário distribuído corresponde ao código-fonte aberto, mitigando adulteração na cadeia de build.'),
          sl('Assinaturas de pacotes, gestão de chaves e KMS/HSM',
            'Pacotes e repositórios são assinados: o APT verifica a assinatura dos arquivos Release/InRelease com chaves associadas ao repositório (use signed-by para limitar cada chave a seu repositório), e o RPM/DNF com gpgcheck=1. Nunca desative a verificação para "fazer funcionar". Gerenciar chaves e segredos: não deixe chaves em repositórios ou imagens. Use um KMS (serviço de gerenciamento de chaves) ou HSM (hardware que gera e usa a chave sem expô-la) e padrão de envelope encryption: uma chave de dados cifra os dados e uma chave mestra (KEK), guardada no KMS/HSM, cifra a chave de dados. Cofres como o HashiCorp Vault emitem segredos com prazo curto (TTL), controlam acesso por política e auditam cada leitura.'),
          sl('TLS no servidor, rotação e entropia',
            'Em servidores, habilite TLS 1.2 e 1.3 e desabilite SSL e TLS 1.0/1.1. O TLS 1.3 só admite suítes modernas (AEAD) e sigilo futuro (forward secrecy) é obrigatório nele; no 1.2 prefira suítes ECDHE com AES-GCM ou ChaCha20-Poly1305. HSTS é um cabeçalho (Strict-Transport-Security com max-age) que instrui o navegador a usar só HTTPS naquele domínio; ative com cuidado, pois não dá para voltar a HTTP durante o prazo. Rotação: certificados de vida curta com renovação automática (protocolo ACME, ex.: certbot) e monitoramento da data de expiração; chaves também são trocadas periodicamente e imediatamente em caso de suspeita de vazamento. Aleatoriedade: chaves precisam de bytes imprevisíveis do kernel. Em kernels modernos /dev/urandom e /dev/random usam o mesmo gerador criptográfico; a chamada getrandom() só bloqueia até a inicialização do gerador no boot. Use getrandom/os.urandom/secrets, nunca rand() ou random para segredos.',
            `# nginx (trecho)
ssl_protocols TLSv1.2 TLSv1.3;
add_header Strict-Transport-Security "max-age=31536000" always;
# validade do certificado:
# openssl x509 -enddate -noout -in cert.pem`)
        ]
      },
      questions: [
        mcq('q1', 'Qual vantagem os slots de chave do LUKS oferecem?',
          'd', ['Cifrar cada arquivo do volume com uma chave diferente', 'Dispensar a chave mestra de volume, simplificando o cabeçalho', 'Aumentar a velocidade de leitura sequencial do disco cifrado', 'Adicionar ou trocar senhas sem recriptografar o disco, pois cada slot protege a mesma chave mestra'],
          'Os dados são cifrados com a chave mestra; os slots guardam essa chave protegida por senhas distintas.'),
        mcq('q2', 'Por que o LUKS2 usa argon2 como função de derivação?',
          'c', ['Porque cifra o disco mais rápido que o AES e dispensa aceleração', 'Porque dispensa a senha e usa só a chave do TPM', 'Porque exige muita memória e tempo, encarecendo a força bruta', 'Porque compacta o cabeçalho e reduz o espaço ocupado'],
          'Um KDF caro e intensivo em memória reduz a eficiência de GPUs ao testar senhas.'),
        mcq('q3', 'Um disco foi selado ao TPM2 com PCR 7 e depois o firmware foi atualizado. O disco deixou de abrir sozinho. O que deveria existir?',
          'a', ['Um slot com senha ou chave de recuperação, sempre guardada fora do disco', 'Um segundo TPM idêntico, ligado à mesma placa-mãe e configurado com os mesmos PCRs', 'Um backup do kernel e do initramfs, anterior à atualização', 'Um certificado TLS de curta duração, emitido pela CA interna da empresa e renovado'],
          'Mudanças nas medições impedem a liberação automática. Uma chave de recuperação em outro slot salva o acesso.'),
        fill('q4', 'Complete o comando que abre o volume LUKS e cria o dispositivo em /dev/mapper/cofre:',
          'sudo cryptsetup ___ disco-teste.img cofre',
          ['open', 'luksOpen', 'luksopen'],
          'cryptsetup open (antigo luksOpen) abre o volume e cria o mapeamento descriptografado.'),
        mcq('q5', 'No Secure Boot em distribuições comuns, qual descreve a cadeia?',
          'c', ['O kernel verifica o firmware antes de carregar o shim e o GRUB', 'O usuário digita uma senha, que valida todo o disco antes do boot', 'O firmware verifica o shim assinado, que verifica o GRUB e o kernel', 'O systemd verifica o firmware depois que o sistema terminou de iniciar'],
          'Cada etapa verifica a assinatura da seguinte, partindo do firmware UEFI.'),
        mcq('q6', 'O que o dm-verity oferece em uma partição somente leitura?',
          'b', ['Compressão transparente dos blocos da partição somente leitura, para reduzir o tamanho', 'Verificação de cada bloco lido, por árvore de hashes com raiz confiável', 'Criptografia da partição, com derivação de chave por argon2', 'Replicação automática dos blocos entre os nós do cluster, para tolerar falhas de disco'],
          'Qualquer alteração em um bloco muda o hash e é detectada na leitura. É a base de sistemas imutáveis.'),
        mcq('q7', 'No envelope encryption com KMS, o que a chave mestra (KEK) faz?',
          'b', ['Cifra diretamente todos os arquivos do disco, um por vez', 'Cifra as chaves de dados, que por sua vez cifram os dados', 'Assina os pacotes do repositório usado pelo gerenciador de pacotes', 'Gera os certificados TLS usados pelos serviços internos'],
          'A KEK nunca sai do KMS/HSM; as chaves de dados cifradas podem ficar junto dos dados.'),
        fill('q8', 'Complete as versões de TLS aceitas num servidor moderno:',
          'ssl_protocols TLSv1.2 ___;',
          ['TLSv1.3'],
          'TLS 1.2 e 1.3 são as versões a manter; SSL e TLS 1.0/1.1 devem ser desativados.')
      ]
    },
    {
      id: 'lna-29-lgpd-privacidade-infra',
      title: 'Privacidade e LGPD na infraestrutura Linux',
      goal: 'Aplicar na infraestrutura os conceitos da LGPD: mapear dados, minimizar, reter e expurgar, criptografar, eliminar com segurança, auditar e lidar com backups e terceiros.',
      xp: 30,
      intro: {
        slides: [
          sl('Mapeamento: onde moram os dados pessoais',
            'Dado pessoal é informação relacionada a pessoa natural identificada ou identificável (nome, CPF, e-mail, IP em certos contextos, localização). Não se protege o que não se sabe que existe, por isso o primeiro passo é inventariar. Além dos bancos de dados, procure em arquivos de aplicação e planilhas, logs (IPs, e-mails, identificadores), backups, caches (Redis), dumps de banco esquecidos em /tmp ou no home, histórico do shell (senhas e CPFs digitados em comandos), core dumps, filas de mensagens, ferramentas de monitoramento e e-mails. Uma busca por padrão pode ajudar, com autorização e listando só nomes de arquivos (-l) para não expor o conteúdo nos seus próprios logs. Os exemplos desta lição usam apenas dados fictícios.',
            `# lista só os ARQUIVOS com padrão parecido com CPF (testado com dado fictício)
grep -rEl '[0-9]{3}\\.[0-9]{3}\\.[0-9]{3}-[0-9]{2}' /srv/dados
# resultado = pistas para o inventário, não certeza (falsos positivos existem)`),
          sl('Princípios: finalidade, necessidade e minimização',
            'A Lei Geral de Proteção de Dados (Lei 13.709/2018) se organiza em princípios, entre eles finalidade (propósito legítimo, específico e informado ao titular), adequação, necessidade (usar o mínimo indispensável), livre acesso, qualidade dos dados, transparência, segurança, prevenção, não discriminação e responsabilização (demonstrar a conformidade). Todo tratamento precisa de uma base legal (consentimento, cumprimento de obrigação legal, execução de contrato, legítimo interesse, entre outras). Na infraestrutura isso significa: coletar apenas campos necessários, não registrar dados pessoais em logs por padrão, não reaproveitar dados para outra finalidade e documentar quem é o controlador (decide) e o operador (trata em nome do controlador).'),
          sl('Retenção e expurgo automatizado',
            'Dados só devem ficar pelo tempo necessário à finalidade (ou obrigação legal). Automatize a retenção para não depender de memória humana: logrotate define quantas rotações guardar (rotate 30 com daily guarda cerca de 30 dias) e comprime; o journald limita por tempo (MaxRetentionSec) ou espaço (SystemMaxUse) em journald.conf; bancos e caches têm TTL (por exemplo EXPIRE no Redis) ou partições que se descartam por data; jobs de purga (timer do systemd ou cron) removem backups e dumps antigos. Cuidado com comandos de exclusão: teste primeiro apenas listando (find ... -print) antes de usar -delete, e faça em ambiente de teste.',
            `# /etc/logrotate.d/app  (exemplo)
/var/log/app/*.log {
    daily
    rotate 30
    compress
    missingok
}
# purga: primeiro LISTE, depois (em teste) apague
find /var/backups/dumps -type f -mtime +30 -print`),
          sl('Criptografia e controle de acesso',
            'Em trânsito: TLS entre clientes, serviços e bancos, e SSH/VPN para administração. Em repouso: LUKS no disco, criptografia no banco ou por campo para dados sensíveis, e backups criptografados com chaves guardadas separadamente. Criptografia não substitui o controle de acesso: aplique mínimo privilégio (grupos, sudo restrito, permissões de arquivo, usuários de banco por aplicação), segregue ambientes (dados reais não vão para desenvolvimento; use dados fictícios ou anonimizados) e registre acessos a dados pessoais com auditd, logs do banco e do bastion, revisando periodicamente. Os próprios logs de auditoria são sensíveis e têm retenção definida.'),
          sl('Eliminação segura, shred e crypto-shredding',
            'Apagar um arquivo (rm) só remove a referência. O shred sobrescreve o conteúdo do arquivo, mas só é confiável quando a escrita vai exatamente para o mesmo lugar físico, e isso NÃO é garantido em SSD/flash (wear leveling), em sistemas de arquivos com journal ou copy-on-write (btrfs, ZFS), em snapshots, RAID, caches e backups. A estratégia moderna é a criptografia + descarte da chave (crypto-shredding): os dados ficam sempre cifrados e, para eliminá-los, destrói-se a chave; sem ela o conteúdo é indecifrável. Combine com mídia dedicada por finalidade (um volume LUKS ou uma chave por cliente, conforme o caso) e, ao descartar o dispositivo, use os recursos de apagamento seguro do fabricante (secure erase/sanitize) ou destruição física.'),
          sl('Backups, direito de eliminação, região e terceiros',
            'O titular pode pedir a eliminação dos dados (Art. 18), observadas as exceções legais. Backups são o ponto difícil: defina retenção curta e expirável, criptografe e, se um backup for restaurado, reaplique a lista de eliminações pedidas desde então. Residência dos dados: ao escolher onde armazenar (região do provedor de nuvem), considere que a transferência internacional de dados pessoais só é permitida nas hipóteses da lei; preferir região no Brasil simplifica a análise. Terceirização: fornecedores de nuvem, suporte e monitoramento são operadores; exija contrato com obrigações de segurança e confidencialidade, saiba quais subcontratados acessam dados e avalie o que as ferramentas externas (APM, logs SaaS) recebem. Em incidentes, siga o plano de resposta com a comunicação à ANPD e aos titulares. Esta lição traz conceitos básicos e NÃO substitui orientação jurídica.')
        ]
      },
      questions: [
        mcq('q1', 'Qual destes locais costuma ser esquecido no inventário de dados pessoais?',
          'a', ['Dumps de banco em /tmp, histórico do shell, logs e backups', 'A tabela principal de clientes no banco de dados em produção', 'O diretório /usr/share/man, com as páginas de manual instaladas', 'O código-fonte compilado do kernel, em /usr/src'],
          'Dados pessoais vazam por cópias esquecidas: dumps, logs, caches, histórico, core dumps e backups.'),
        mcq('q2', 'Qual prática reflete minimização e finalidade em logs de uma aplicação?',
          'd', ['Registrar a requisição completa, com corpo e cabeçalhos, para facilitar o suporte', 'Guardar os logs indefinidamente, para uso futuro em análises de comportamento dos clientes', 'Reaproveitar os logs de autenticação em campanhas de marketing direcionadas aos mesmos usuários', 'Registrar só os campos necessários, com identificadores internos em vez de e-mail ou CPF, por tempo limitado'],
          'Coleta mínima, para finalidade definida; evite dados pessoais em log por padrão.'),
        mcq('q3', 'Para garantir que logs não fiquem além do necessário, qual abordagem é mais confiável?',
          'c', ['Pedir à equipe que apague os logs manualmente quando lembrar', 'Mover os logs antigos para outro diretório, sem apagar', 'Automatizar com logrotate/journald e purga, com retenção documentada', 'Desativar totalmente o registro de eventos de segurança, para evitar acúmulo'],
          'Automação com retenção definida cumpre a política sem depender de memória. Desativar logs de segurança é erro.'),
        fill('q4', 'A técnica de tornar dados ilegíveis destruindo a chave que os cifra chama-se crypto-___:',
          'crypto-___',
          ['shredding', 'shred'],
          'Crypto-shredding funciona mesmo quando há cópias, snapshots e SSD, desde que os dados estivessem sempre cifrados.'),
        mcq('q5', 'Por que shred não é suficiente para eliminar dados em SSD ou em btrfs?',
          'b', ['Porque o shred funciona em arquivos de texto simples e em sistemas de arquivos ext2, mas falha em binários', 'Porque a escrita pode não ir ao mesmo local físico (wear leveling, copy-on-write, snapshots)', 'Porque o shred exige conexão com a internet para baixar os padrões de sobrescrita atualizados', 'Porque ele apaga o sistema de arquivos inteiro, e não só o arquivo'],
          'Sem garantia de sobrescrita no mesmo bloco físico, restos podem persistir. Prefira cifrar e descartar a chave.'),
        mcq('q6', 'Um titular exerce o direito de eliminação, mas seus dados estão em backups. Qual abordagem é razoável?',
          'd', ['Ignorar o pedido, pois backup não é considerado dado pessoal pela lei', 'Reescrever todos os backups manualmente, toda vez que houver um novo pedido de eliminação', 'Prometer eliminação imediata em todo lugar, mesmo sem saber exatamente onde estão os dados', 'Retenção curta nos backups e reaplicar a lista de eliminações após restaurar'],
          'Backups expiram na retenção definida e, se restaurados, a lista de eliminações é reaplicada, evitando reintroduzir dados eliminados.'),
        mcq('q7', 'A empresa vai usar um serviço SaaS de logs com servidores fora do país. O que avaliar?',
          'c', ['O preço do plano e o tamanho da retenção oferecida pelo fornecedor SaaS escolhido', 'Nada, pois logs não têm dados pessoais e não precisam de análise', 'Papel de operador, contrato, conteúdo dos logs e transferência internacional', 'A aparência do painel e a velocidade das consultas feitas pela equipe de suporte'],
          'Terceiros que tratam dados são operadores: contrato, minimização do que é enviado e base para transferência internacional.'),
        fill('q8', 'Complete a diretiva do logrotate que define quantos arquivos rotacionados guardar:',
          'daily\n___ 30',
          ['rotate'],
          'rotate 30 com daily mantém cerca de 30 dias de histórico; o excedente é removido.')
      ]
    },
    {
      id: 'lna-30-distros-ecossistema',
      title: 'Distribuições e o ecossistema',
      goal: 'Entender como o Linux é desenvolvido, como distribuições empacotam e se diferenciam, o papel de libc, init e licenças, SBOM, ciclo de vida e como contribuir.',
      xp: 30,
      intro: {
        slides: [
          sl('Como o kernel é desenvolvido',
            'O kernel Linux é desenvolvido em público, em kernel.org e em listas de e-mail. O desenvolvimento é dividido em subsistemas (rede, sistemas de arquivos, drivers, memória...), cada um com mantenedores listados no arquivo MAINTAINERS. Um patch é enviado por e-mail, revisado, aceito na árvore do subsistema e, em pull requests, sobe até a árvore principal (mainline), mantida por Linus Torvalds. Um ciclo tem uma janela de integração de novidades, seguida de versões de teste (release candidates, rc) até a versão final; esse ciclo se repete em poucos meses. Algumas versões são escolhidas como LTS (suporte de longo prazo): recebem correções por anos (backports), e distribuições costumam basear-se nelas. Cada patch leva o Signed-off-by do autor, declarando que pode contribuí-lo.'),
          sl('Famílias de distribuições',
            'Uma distribuição reúne kernel, bibliotecas, ferramentas, gerenciador de pacotes, política de atualização e testes. Debian: pacotes .deb com apt, comunidade, ramos stable/testing/unstable; Ubuntu e outros derivam dele. RHEL: pacotes .rpm com dnf, suporte comercial e ciclo longo; derivados compatíveis (Rocky, AlmaLinux) e a Fedora como upstream de inovação. Arch: rolling release (atualização contínua) com pacman e o AUR da comunidade. Alpine: mínima, com musl e BusyBox, gerenciador apk, muito usada em contêineres. SUSE: SLES/openSUSE, rpm e zypper, com YaST. NixOS: configuração declarativa, pacotes em /nix/store, atualizações atômicas e rollback. A escolha depende do ciclo de vida desejado, suporte, ecossistema e pacotes necessários.'),
          sl('glibc versus musl, e init',
            'A libc é a biblioteca C que todo programa usa para falar com o kernel. A glibc (GNU) é a mais comum e compatível; a musl é menor, mais simples e estrita ao padrão, usada no Alpine. Binários compilados para glibc geralmente NÃO rodam em Alpine sem recompilar (ou sem uma camada de compatibilidade), e há diferenças sutis de comportamento (por exemplo, no resolvedor de DNS e em locales). O init é o PID 1 que inicia o sistema: o systemd é o padrão na maioria das grandes distribuições; existem alternativas como OpenRC, runit, s6 e o antigo SysVinit, mais simples, com menos recursos integrados.'),
          sl('Licenças e conformidade; SBOM',
            'GPL (o kernel é GPLv2) é copyleft: quem distribui uma obra derivada precisa fornecer o código sob a mesma licença. LGPL permite que um programa de qualquer licença use a biblioteca por ligação (linking), desde que modificações na biblioteca continuem LGPL e o usuário possa trocá-la. MIT e BSD são permissivas: exigem manter o aviso de copyright. Apache 2.0 é permissiva e inclui uma concessão explícita de patentes. Conformidade é inventariar o que se distribui, cumprir avisos e fornecer código-fonte quando exigido. Um SBOM (software bill of materials) é a lista de componentes e versões de um software (formatos como SPDX e CycloneDX): permite auditar licenças e cruzar com vulnerabilidades conhecidas rapidamente quando surge um novo CVE.'),
          sl('Ciclo de vida, EOL e distros imutáveis',
            'Cada versão de distribuição tem um período de suporte. Ao chegar ao fim de vida (EOL), deixa de receber correções de segurança: continuar rodando é acumular vulnerabilidades sem remédio. Planeje migrações antes da data, mantenha inventário de versões, teste atualizações em homologação e, se precisar mais tempo, avalie programas de suporte estendido do fornecedor. Distribuições imutáveis (por exemplo Fedora Silverblue/CoreOS, MicroOS, NixOS em outro modelo) mantêm a raiz somente leitura e atualizam por imagens completas e atômicas, com rollback; aplicações vão em contêineres ou pacotes isolados. Ganham previsibilidade e segurança e perdem a liberdade de alterar o sistema à mão.'),
          sl('Comunidade e como contribuir',
            'Contribuir não exige programar o kernel: reportar bugs com informações completas, melhorar documentação, traduzir, testar versões candidatas, triar issues, ajudar outros em fóruns e listas, empacotar software e corrigir pequenos problemas em ferramentas. Leia o guia de contribuição e o código de conduta do projeto, comece por tarefas pequenas, respeite o processo de revisão (feedback técnico faz parte) e aprenda com as discussões públicas.')
        ]
      },
      questions: [
        mcq('q1', 'Como um patch chega ao kernel principal (mainline)?',
          'b', ['Enviado direto a todos os usuários, em pacote pronto para instalação, assinado por Linus Torvalds', 'Enviado por e-mail, revisado por mantenedores e integrado por pull requests até a árvore principal', 'Publicado numa loja de patches, com aprovação automática por testes e sem nenhuma revisão humana dos mantenedores', 'Compilado por cada distribuição e depois devolvido ao projeto'],
          'O trabalho é distribuído por subsistemas, com revisão pública por e-mail e confiança em mantenedores.'),
        mcq('q2', 'Por que muitas distribuições se baseiam num kernel LTS?',
          'c', ['Porque o LTS é o kernel mais novo disponível e traz todas as novidades primeiro', 'Porque dispensa correções de segurança, já que o código congelado é considerado estável', 'Porque recebe correções (backports) por um período longo, dando estabilidade', 'Porque é livre de licença e não tem restrições de uso'],
          'LTS troca novidades por estabilidade, com correções mantidas por anos.'),
        mcq('q3', 'Um binário compilado em Debian (glibc) falha ao rodar numa imagem Alpine. Qual é a causa mais provável?',
          'd', ['O Alpine não tem kernel próprio e depende do host', 'O binário usa systemd como init, que o Alpine não suporta', 'O Alpine só executa scripts de shell, não binários nativos', 'O Alpine usa musl e o binário foi ligado à glibc'],
          'Diferenças de libc causam incompatibilidade. Recompile para musl ou use uma imagem compatível.'),
        fill('q4', 'Como se chama a lista de componentes e versões de um software, útil para auditar licenças e vulnerabilidades?',
          '___ (formatos: SPDX, CycloneDX)',
          ['SBOM', 'sbom'],
          'SBOM = software bill of materials. Quando surge um CVE, ele mostra rapidamente quem usa o componente afetado.'),
        mcq('q5', 'Uma empresa quer usar uma biblioteca LGPL em um produto fechado, ligando-a dinamicamente. O que é preciso?',
          'a', ['Sempre manter o aviso de licença, permitir a troca da biblioteca e abrir só modificações nela', 'Abrir todo o código do produto sob a licença GPL e publicar o código-fonte completo ao usuário final', 'Nada, pois a LGPL não traz nenhuma obrigação a quem apenas usa a biblioteca por ligação dinâmica', 'Pagar royalties ao autor da biblioteca a cada cópia distribuída'],
          'A LGPL permite o uso por ligação sem tornar o produto copyleft, mas modificações na biblioteca continuam LGPL.'),
        mcq('q6', 'Um servidor roda uma distribuição que atingiu o EOL. Qual é o principal risco?',
          'b', ['O desempenho cai pela metade, sem nenhuma possibilidade de ajuste fino nos serviços', 'Vulnerabilidades novas deixam de receber correção', 'O kernel deixa de iniciar após a data de fim de vida, impedindo o boot do sistema', 'Os pacotes passam a ser proibidos por lei depois do EOL'],
          'Sem atualizações de segurança, falhas conhecidas permanecem. Planeje a migração antes do EOL.'),
        mcq('q7', 'Qual característica define uma distribuição imutável?',
          'd', ['O usuário não pode instalar nenhum aplicativo, de qualquer forma', 'O kernel permanece fixo e não recebe atualizações de segurança', 'Usa software proprietário, em formato binário assinado', 'Raiz somente leitura, atualização atômica por imagem e rollback'],
          'Aplicações vão em contêineres ou camadas separadas; o sistema base muda como um todo, o que traz previsibilidade.'),
        fill('q8', 'Qual é o gerenciador de pacotes do Alpine Linux?',
          '___ add curl',
          ['apk'],
          'O Alpine usa apk (Alpine Package Keeper), com musl e BusyBox.')
      ]
    },
    {
      id: 'lna-40-empacotamento-distribuicao',
      title: 'Empacotamento e distribuição de software',
      goal: 'Montar um pacote .deb e um .rpm, entender repositórios, assinatura de pacotes e de repositórios, versionamento, formatos universais e a defesa contra pacotes maliciosos na cadeia de suprimentos.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Por que empacotar',
            'Copiar arquivos à mão para um servidor funciona uma vez; depois vira bagunça. Um PACOTE reúne os arquivos do software com METADADOS (nome, versão, arquitetura, dependências, responsável) e, às vezes, scripts de instalação. O gerenciador (apt/dpkg, dnf/rpm, zypper) entrega quatro ganhos. REPRODUTIBILIDADE: a mesma versão instala do mesmo jeito em cem máquinas. DEPENDÊNCIAS: o gerenciador resolve e instala o que o software precisa. ATUALIZAÇÕES: uma versão nova substitui a anterior de forma controlada, e o repositório distribui correções de segurança. REMOÇÃO LIMPA: como o gerenciador registra cada arquivo instalado, desinstalar remove o que foi colocado (arquivos de configuração podem ser preservados). Consultas úteis: dpkg -L pacote e rpm -ql pacote listam os arquivos; dpkg -S caminho e rpm -qf caminho dizem a qual pacote um arquivo pertence.',
            'dpkg -L coreutils | head -2          # exemplo (varia): arquivos do pacote\ndpkg -S /bin/ls                       # exemplo: coreutils: /bin/ls\nrpm -qf /usr/bin/ls                   # (famílias RPM) pacote dono do arquivo'
          ),
          sl(
            'Anatomia de um .deb',
            'Um .deb é um arquivo ar com três partes: debian-binary (versão do formato), control.tar (metadados e scripts) e data.tar (os arquivos a instalar, com a árvore a partir da raiz). Para construir um simples, monte uma árvore: a raiz do pacote contém a pasta DEBIAN com o arquivo control, e os demais diretórios espelham o destino (usr/bin/meu-app vai para /usr/bin/meu-app). O comando dpkg-deb --build (com --root-owner-group para que os arquivos pertençam a root) gera o .deb. Campos obrigatórios do control em um pacote binário: Package, Version, Architecture, Maintainer e Description (a primeira linha da descrição é o resumo, e as linhas de continuação começam com espaço). Architecture: all indica pacote independente de arquitetura (scripts, dados). Em Version, o formato é [época:]upstream[-revisão]: em 2.0-1, 2.0 é a versão original e 1 é a revisão do pacote Debian. Depends declara dependências, com versões mínimas entre parênteses. dpkg-deb --info e --contents inspecionam o resultado.',
            '# meu-app_2.0-1_all/DEBIAN/control   (EXEMPLO, sem executar)\nPackage: meu-app\nVersion: 2.0-1\nArchitecture: all\nMaintainer: Nome Exemplo <nome@example.com>\nDepends: python3, libfoo1 (>= 1.2)\nDescription: Aplicativo de exemplo\n Linha de continuacao comeca com espaco.\n# arvore: meu-app_2.0-1_all/usr/bin/meu-app\n# dpkg-deb --root-owner-group --build meu-app_2.0-1_all'
          ),
          sl(
            'Scripts de mantenedor e o risco de root',
            'Ao lado do control, a pasta DEBIAN pode ter quatro scripts: preinst (antes de desempacotar), postinst (depois de instalar e configurar), prerm (antes de remover) e postrm (depois de remover). Eles são executados com PRIVILÉGIO DE ROOT, durante a instalação, por quem quer que tenha criado o pacote. Isso é poder total: um pacote malicioso (ou com bug) pode alterar qualquer arquivo, criar usuários, instalar serviços e abrir acesso, sem nenhuma pergunta. Por isso: instalar só de fontes confiáveis, e, ao empacotar, manter os scripts MÍNIMOS, idempotentes (rodar duas vezes dá o mesmo resultado), com set -e e sem baixar nem executar código externo. O primeiro argumento informa a ação (configure, remove, upgrade...). Arquivos de configuração em /etc listados em conffiles têm tratamento especial: edições do administrador são preservadas em atualizações. Para auditar antes de instalar: dpkg-deb -e arquivo.deb dir extrai o control e os scripts.',
            '# DEBIAN/postinst (EXEMPLO mínimo)\n#!/bin/sh\nset -e\nif [ "$1" = "configure" ]; then\n  systemctl daemon-reload || true\nfi\nexit 0\n# auditar: dpkg-deb -e pacote.deb /tmp/inspecao   # extrai control e scripts'
          ),
          sl(
            'Anatomia de um .rpm e o fpm',
            'No mundo RPM, o pacote é descrito por um arquivo .spec, e o rpmbuild o transforma em .rpm (e em .src.rpm). Cabeçalho: Name, Version, Release (revisão do pacote, em geral 1%{?dist}), Summary, License, Source0 (o tarball do código), BuildArch (noarch para independentes), Requires (dependências). Depois, as SEÇÕES: %description (texto), %prep (prepara o código: %setup -q descompacta), %build (compila), %install (instala na árvore temporária %{buildroot}, e não no sistema), %files (lista os arquivos que o pacote contém) e %changelog. Também há scriptlets (%pre, %post, %preun, %postun), com o mesmo cuidado de root dos scripts do deb. O comando é rpmbuild -ba SPECS/meu-app.spec, com a árvore em ~/rpmbuild (SOURCES, SPECS, BUILD, RPMS, SRPMS). Para casos simples existe o fpm, que converte um diretório (ou outros formatos) em deb, rpm e mais, sem escrever control ou spec; é prático, mas esconde detalhes que o empacotamento oficial das distribuições exige.',
            '# SPECS/meu-app.spec   (EXEMPLO, sem executar)\nName:      meu-app\nVersion:   2.0\nRelease:   1%{?dist}\nSummary:   Aplicativo de exemplo\nLicense:   MIT\nBuildArch: noarch\nSource0:   meu-app-%{version}.tar.gz\nRequires:  python3\n\n%description\nAplicativo de exemplo.\n\n%prep\n%setup -q\n\n%build\n# nada a compilar\n\n%install\ninstall -D -m 0755 meu-app %{buildroot}%{_bindir}/meu-app\n\n%files\n%{_bindir}/meu-app\n\n%changelog\n* Mon Jan 01 2024 Nome Exemplo <nome@example.com> - 2.0-1\n- Primeiro pacote\n# fpm -s dir -t deb -n meu-app -v 2.0 ./meu-app=/usr/bin/meu-app'
          ),
          sl(
            'Repositórios, assinatura e distribuição da chave',
            'Um repositório é uma árvore de pacotes com ÍNDICES. APT: pool/ guarda os .deb; dists/<suite>/ tem o arquivo Release (com os hashes dos índices Packages, que por sua vez trazem o hash de cada .deb), assinado como InRelease (ou Release.gpg). Ferramentas: reprepro e aptly. DNF: a pasta repodata/ (com repomd.xml) é gerada pelo createrepo_c. A ASSINATURA GPG cria a cadeia de confiança: o repositório assina o índice, o índice contém os hashes, os hashes validam cada pacote. No lado RPM também se assina cada pacote (rpmsign --addsign; rpm --checksig verifica) e a configuração do cliente liga gpgcheck=1 (pacotes) e repo_gpgcheck=1 (metadados do repositório). A chave PRIVADA é o ativo crítico: guarde com senha, de preferência fora do servidor de builds (subchaves, cartão ou HSM). A chave PÚBLICA precisa chegar ao cliente por canal confiável: publique por HTTPS, divulgue a IMPRESSÃO DIGITAL (gpg --fingerprint) por um segundo canal para conferência, e no APT restrinja a chave ao repositório com signed-by, em vez de colocá-la no chaveiro global (que faria essa chave valer para qualquer repositório). Evite curl | sudo bash. A assinatura prova ORIGEM e INTEGRIDADE, não que o software seja inofensivo.',
            '# /etc/apt/sources.list.d/meu-repo.list   (EXEMPLO)\ndeb [signed-by=/etc/apt/keyrings/meu-repo.gpg] https://repo.example.org/apt stable main\n# /etc/yum.repos.d/meu-repo.repo   (EXEMPLO)\n# [meu-repo]\n# baseurl=https://repo.example.org/rpm/\n# gpgcheck=1\n# repo_gpgcheck=1\n# gpgkey=https://repo.example.org/chave-publica.asc\ngpg --show-keys --fingerprint chave-publica.asc   # confira a impressão digital por outro canal'
          ),
          sl(
            'Versionamento, dependências e conflitos',
            'O SemVer usa MAJOR.MINOR.PATCH (quebra de compatibilidade, funcionalidade nova, correção) e sufixos como 1.0.0-rc1, que é ANTERIOR a 1.0.0. Os gerenciadores têm esquemas próprios. Debian: [época:]upstream[-revisão]. Compara primeiro a ÉPOCA (um número inteiro, 0 se omitida), depois o upstream, depois a revisão; trechos numéricos comparam como números (1.0-2 é menor que 1.0-10). A época existe para corrigir esquemas que retrocederam: 1:0.5 é MAIOR que 1.0. O til ~ ordena ANTES de tudo, até do vazio, o que serve para pré-lançamentos: 1.0~rc1 é menor que 1.0. RPM tem Epoch, Version e Release com função parecida. Relações entre pacotes no Debian: Depends (obrigatória), Recommends e Suggests (opcionais), Conflicts e Breaks (incompatibilidades), Replaces e Provides (substituição e nome virtual); no RPM, Requires, Conflicts, Provides e Obsoletes. Restrições usam operadores: libfoo1 (>= 1.2).',
            'dpkg --compare-versions 1.0~rc1 lt 1.0 && echo sim        # sim (rc antes da final)\ndpkg --compare-versions 1:0.5 gt 2.0 && echo sim          # sim (a época vence)\ndpkg --compare-versions 1.0-2 lt 1.0-10 && echo sim       # sim (compara como número)'
          ),
          sl(
            'Formatos universais, contêineres, builds reproduzíveis, SBOM e cadeia de suprimentos',
            'FORMATOS UNIVERSAIS empacotam o app com suas bibliotecas, independente da distribuição. Flatpak: roda em sandbox (permissões e portais), com runtimes compartilhados e atualização por remotos como o Flathub. Snap: pacote em imagem compactada, com confinamento e atualização automática por canais, via snapd. AppImage: um único arquivo executável, sem instalar, e sem sandbox por padrão; a atualização é por conta do usuário. Custo comum: mais espaço e a responsabilidade pelas correções de segurança das bibliotecas embutidas fica com quem empacota. Uma IMAGEM DE CONTÊINER também é um pacote (camadas, em um registry, fixada por digest sha256). BUILD REPRODUZÍVEL: a mesma fonte e o mesmo ambiente produzem o MESMO binário, bit a bit (usa-se, por exemplo, SOURCE_DATE_EPOCH para fixar datas), o que permite a terceiros conferir que o binário distribuído veio do código publicado. SBOM é a lista de componentes e versões de um software (formatos SPDX e CycloneDX), útil para responder rápido a uma nova vulnerabilidade. CADEIA DE SUPRIMENTOS: ataques incluem TYPOSQUATTING (nome quase igual ao legítimo), confusão de dependências (repositório público ganha de um nome interno), mantenedor comprometido e scripts maliciosos. Defesas: usar repositórios oficiais, conferir origem (apt-cache policy) e assinatura, fixar versões e hashes, espelhar internamente e inspecionar scripts (rpm -qp --scripts pacote.rpm; dpkg-deb -e). Leitura recomendada: Debian Policy Manual, guia do novo mantenedor Debian, e as Packaging Guidelines do Fedora.',
            'apt-cache policy meu-app                # exemplo: de qual repositório vem e qual versão\nrpm -qp --scripts pacote.rpm            # mostra scriptlets ANTES de instalar\nflatpak info <app-id>                   # permissões e origem de um app Flatpak (exemplo)'
          )
        ]
      },
      questions: [
        mcq('q1', 'Neste control de exemplo: Package: meu-app / Version: 2.0-1 / Architecture: all / Depends: python3, libfoo1 (>= 1.2). Qual é a leitura correta?', 'b', [
          'Versão 2.0-1 do upstream, sem revisão; all quer dizer que o pacote funciona em x86 de 64 bits',
          'Upstream 2.0, revisão 1; all indica independência de arquitetura; exige python3 e libfoo1 na versão 1.2 ou superior',
          'Época 2 e upstream 0; all instala o pacote em todos os computadores da rede; libfoo1 deve ser a versão 1.2 exata, e não superior',
          'Upstream 1 e revisão 2.0; all é um alias de amd64; as dependências são opcionais como Recommends'
        ], 'Em [época:]upstream[-revisão], 2.0-1 tem upstream 2.0 e revisão 1. Architecture: all é independente de arquitetura, e (>= 1.2) é um mínimo.'),
        mcq('q2', 'Em um servidor interno aparece um pacote de nome muito parecido com o de uma ferramenta conhecida, vindo de um repositório não oficial, com postinst. Qual é a atitude defensiva?', 'd', [
          'Instalar em produção primeiro: se o postinst falhar, o apt desfaz tudo sozinho e o risco é nulo para o servidor',
          'Confiar no nome, pois repositórios não oficiais só aceitam pacotes assinados e revisados',
          'Aceitar, porque o postinst roda como usuário comum e o dano fica restrito ao diretório home de quem instalou',
          'Suspeitar de typosquatting e conferir origem, assinatura e scripts (dpkg-deb -e) antes de instalar'
        ], 'Scripts de mantenedor rodam como root, e o nome parecido é um sinal clássico de typosquatting. Verificar origem, assinatura e scripts vem antes.'),
        mcq('q3', 'Em um .spec, onde ficam os comandos que copiam os arquivos construídos para a árvore temporária, e onde se lista o que o pacote final contém?', 'a', [
          '%install copia para %{buildroot}, nunca para o sistema real; %files lista os arquivos do pacote',
          '%prep copia para %{buildroot}; %build lista os arquivos do pacote',
          '%files copia para o sistema real; %install lista os arquivos do pacote',
          '%build instala no sistema do desenvolvedor; %changelog lista os arquivos do pacote'
        ], '%install coloca os arquivos no buildroot (nunca no sistema real) e %files declara o conteúdo do pacote. %prep prepara o código e %build o compila.'),
        fill('q4', 'Complete o comando que constrói o .deb a partir da árvore com DEBIAN/control.', 'dpkg-deb --root-owner-group --___ meu-app_2.0-1_all', ['build', '-b'], 'dpkg-deb --build empacota a árvore; --root-owner-group faz os arquivos pertencerem a root dentro do pacote.'),
        mcq('q5', 'Qual comparação entre os formatos universais está correta?', 'c', [
          'AppImage tem sandbox forte por padrão e se atualiza sozinho; Flatpak exige um único arquivo executável',
          'Snap e Flatpak dispensam bibliotecas próprias e por isso não duplicam dependências no disco',
          'Flatpak e Snap usam sandbox e atualizam por remotos ou canais; AppImage é arquivo único, sem sandbox por padrão',
          'Os três usam o apt para resolver dependências e herdam as correções de segurança da distribuição'
        ], 'Flatpak e Snap confinam e atualizam por seus canais; AppImage é um executável único sem sandbox por padrão. Todos embutem bibliotecas, então as correções dependem de quem empacota.'),
        mcq('q6', 'Qual ordenação de versões Debian está correta, da menor para a maior?', 'd', [
          '1:0.5 < 1.0~rc1 < 1.0',
          '1.0 < 1.0~rc1 < 1:0.5',
          '1.0~rc1 < 1:0.5 < 1.0',
          '1.0~rc1 < 1.0 < 1:0.5'
        ], 'O til ordena antes de tudo (1.0~rc1 < 1.0) e a época é comparada primeiro (1:0.5 vence 1.0). Conferido com uma implementação do algoritmo do dpkg.'),
        mcq('q7', 'Você vai publicar um repositório APT próprio. Qual conjunto de práticas é o mais seguro?', 'a', [
          'Assinar o InRelease com chave protegida, publicar a pública por HTTPS com a impressão digital em outro canal, e usar signed-by',
          'Assinar com uma chave sem senha guardada no servidor de builds, e orientar os clientes a ignorar avisos de assinatura do apt',
          'Copiar a chave pública para o chaveiro global do apt, o que a faz valer para qualquer repositório',
          'Não assinar, pois HTTPS já garante que o pacote seja inofensivo e que o publicador seja confiável'
        ], 'A assinatura cria a cadeia de confiança; a chave privada deve ser protegida, e a pública verificada por outro canal e restrita ao repositório com signed-by. Assinatura prova origem e integridade, não ausência de malícia.'),
        fill('q8', 'Complete a opção do arquivo .repo do DNF que liga a verificação de assinatura dos pacotes.', 'gpgcheck=___', ['1'], 'gpgcheck=1 faz o dnf verificar a assinatura GPG de cada pacote; repo_gpgcheck=1 faz o mesmo com os metadados do repositório.')
      ]
    },
    {
      id: 'lna-31-linux-no-mundo',
      title: 'Linux no mundo',
      goal: 'Reconhecer onde o Linux roda (nuvem, Android, HPC, embarcados, WSL2, desktop e jogos), por que é a base da infraestrutura moderna e quais carreiras e certificações existem.',
      xp: 30,
      intro: {
        slides: [
          sl('Nuvem e contêineres',
            'Na nuvem, os servidores virtuais e a maioria das plataformas de contêineres rodam Linux. As razões se somam: código aberto e auditável, personalização do kernel e do userspace, custo de licenciamento zero, recursos nativos de isolamento (namespaces, cgroups) e de virtualização (KVM), grande ecossistema de ferramentas de automação e de rede e o fato de os próprios provedores contribuírem com o kernel. Kubernetes, Docker e a maioria dos serviços gerenciados são pensados em torno de Linux, e os nós de trabalho costumam ser Linux mesmo quando a interface vem de outro sistema.'),
          sl('Android, embarcados e automotivo',
            'O Android usa o kernel Linux (com adaptações), mas o userspace é próprio: não é uma distribuição GNU/Linux comum (usa a libc bionic, o runtime ART e um framework Java/Kotlin). Isso mostra que "Linux" pode se referir só ao kernel. Em embarcados e IoT o Linux roda em roteadores e appliances (como o OpenWrt), TVs, câmeras, equipamentos industriais e sistemas de infoentretenimento automotivo; compensa pelo suporte a hardware, rede e segurança, e custa mais recursos que um RTOS minimalista. Quando o prazo de resposta é crítico, usa-se PREEMPT_RT ou um RTOS ao lado.'),
          sl('Supercomputação (HPC)',
            'Os grandes supercomputadores e clusters de computação científica rodam Linux de forma predominante. Os motivos: personalização total (kernel ajustado a interconexões rápidas e a aceleradores), escalonadores de trabalhos (como o Slurm), compiladores e bibliotecas paralelas (MPI), e ausência de custo de licença por nó. Em HPC o foco é desempenho, topologia de rede e memória (NUMA), e o sistema costuma ser enxuto para reduzir o "ruído" do sistema operacional.'),
          sl('WSL2, desktop e jogos',
            'O WSL2 (Windows Subsystem for Linux 2) executa um kernel Linux REAL dentro de uma máquina virtual leve e integrada ao Windows, o que dá compatibilidade total de chamadas de sistema (o WSL1 traduzia chamadas do Windows). É ótimo para desenvolvimento, mas lembre que é uma VM: o sistema de arquivos do Windows acessado de dentro é mais lento que o do próprio Linux. No desktop, o Linux oferece diversidade de ambientes gráficos (GNOME, KDE e outros), com Wayland e X11 como sistemas de janelas. Em jogos, o Proton (do Steam) combina Wine (camada de compatibilidade para programas Windows) e componentes que traduzem gráficos, permitindo rodar muitos jogos de Windows em Linux; o SteamOS é uma distribuição Linux.',
            `wsl --list --verbose
# exemplo (varia): NAME  STATE  VERSION  ->  Ubuntu  Running  2`),
          sl('Carreira e certificações',
            'Áreas de atuação: administração de sistemas (operar servidores, usuários, backups), SRE (confiabilidade, SLOs, automação), DevOps/engenharia de plataforma (CI/CD, infraestrutura como código, contêineres), segurança (defesa, resposta a incidentes, hardening, auditoria), desenvolvimento de software em Linux, engenharia de sistemas embarcados e desenvolvimento do kernel. Cada área valoriza fundamentos comuns: shell, redes, processos, armazenamento, segurança, automação e leitura de documentação. Certificações existentes (visão geral): LPIC (LPI), CompTIA Linux+, Red Hat (RHCSA e RHCE), Linux Foundation (LFCS) e, em contêineres, CKA/CKAD (Kubernetes). Elas ajudam a estruturar o estudo, mas portfólio, projetos e experiência prática pesam muito; este curso não afirma números de mercado.')
        ]
      },
      questions: [
        mcq('q1', 'Qual afirmação descreve corretamente o Android?',
          'c', ['É uma distribuição GNU/Linux comum, com apt, glibc e as ferramentas do projeto GNU', 'Não usa o kernel Linux, e sim um kernel próprio do fabricante, escrito do zero', 'Usa o kernel Linux com userspace próprio (bionic, ART e framework)', 'É baseado no kernel do Windows, com camada de compatibilidade'],
          'Android mostra que Linux, no sentido estrito, é o kernel. O userspace pode ser totalmente diferente.'),
        mcq('q2', 'Qual é a diferença principal entre WSL1 e WSL2?',
          'b', ['O WSL2 não consegue executar comandos de shell tradicionais, só programas do Windows', 'WSL2 roda um kernel Linux real numa VM leve; o WSL1 traduzia syscalls', 'O WSL1 usa Hyper-V e o WSL2 usa uma camada de tradução de chamadas de sistema', 'O WSL2 é só uma interface gráfica para o PowerShell do Windows'],
          'WSL2 traz compatibilidade completa de syscalls por usar um kernel real numa VM.'),
        mcq('q3', 'Qual combinação de fatores mais explica a posição do Linux na infraestrutura em nuvem?',
          'a', ['Código aberto, personalização, isolamento nativo (namespaces/cgroups), KVM e ecossistema', 'Interface gráfica mais bonita do que a dos concorrentes', 'Obrigação legal de uso em contratos públicos e privados', 'Proibição contratual de outros sistemas operacionais nos data centers'],
          'A combinação de abertura, recursos técnicos e ecossistema tornou o Linux a base natural de nuvem e contêineres.'),
        fill('q4', 'Qual camada de compatibilidade, usada pelo Proton, executa programas Windows em Linux?',
          'Proton = ___ + componentes de tradução gráfica',
          ['Wine', 'wine'],
          'Wine implementa a API do Windows sobre Linux; o Proton agrega componentes para gráficos e integração com o Steam.'),
        mcq('q5', 'Por que supercomputadores e clusters de HPC adotam Linux de forma predominante?',
          'd', ['Por ser o único sistema com suporte a redes de alta velocidade e a aceleradores', 'Por ter uma interface gráfica mais leve que as demais', 'Por exigência dos fabricantes de monitores e de aceleradores gráficos para pesquisa', 'Pela personalização do kernel, pelo Slurm, pela ausência de licença por nó e pelo ecossistema científico'],
          'A possibilidade de ajustar o sistema ao hardware e o ecossistema de HPC pesam muito.'),
        mcq('q6', 'Qual perfil profissional tem foco em confiabilidade, SLOs e automação de operações?',
          'c', ['Desenvolvedor de drivers gráficos', 'Designer de interfaces', 'SRE (Site Reliability Engineer)', 'Revisor de licenças'],
          'SRE aplica engenharia de software à operação: SLOs, orçamento de erro, automação e resposta a incidentes.'),
        mcq('q7', 'Qual certificação está associada a Kubernetes?',
          'a', ['CKA (Certified Kubernetes Administrator)', 'LPIC-1, que trata de administração geral de sistemas Linux', 'RHCSA, voltada à administração de sistemas Red Hat', 'CompTIA A+, voltada a suporte básico de hardware'],
          'CKA e CKAD são da Linux Foundation, voltadas a Kubernetes. As demais focam em administração geral de sistemas.'),
        fill('q8', 'Complete o comando do WSL que lista as distribuições instaladas e a versão (1 ou 2) de cada uma:',
          'wsl --list --___',
          ['verbose', 'v'],
          'wsl --list --verbose (ou wsl -l -v) mostra nome, estado e versão do WSL.')
      ]
    },
    {
      id: 'lna-32-estudos-de-caso',
      title: 'Estudos de caso de arquitetura e ajuste',
      goal: 'Aplicar o raciocínio de arquitetura e ajuste (requisitos, riscos, configuração e medição) a seis cenários: contêineres, web, banco, bastion, build e arquivos.',
      xp: 30,
      intro: {
        slides: [
          sl('O processo de ajuste (síntese)',
            'Ajustar sem medir é adivinhar. O processo: (1) defina o requisito (latência, vazão, disponibilidade, SLO); (2) meça uma linha de base; (3) olhe os recursos pelo método USE (Utilização, Saturação e Erros de CPU, memória, disco e rede) para achar o gargalo; (4) levante uma hipótese; (5) altere UMA variável por vez; (6) meça de novo e compare; (7) registre a decisão e o rollback. Prefira percentis (p95, p99) à média, que esconde caudas. Teste carga em ambiente próprio ou de homologação, nunca contra sistemas de terceiros. Parâmetros "milagrosos" copiados da internet podem piorar: leia a documentação da sua versão.',
            `# ferramentas de medição (exemplos)
vmstat 1 5        # CPU, memória, swap, E/S
iostat -x 1 5     # disco: await, utilização
ss -s             # resumo de sockets
pidstat 1 5       # por processo`),
          sl('Caso 1: host de contêineres',
            'Requisitos: densidade de contêineres, isolamento e previsibilidade. Riscos: disco cheio por imagens, camadas e logs; vizinho barulhento consumindo CPU/memória; contêiner com privilégios demais; atualização do kernel que reinicia tudo. Configuração relevante: sistema base mínimo e atualizado; cgroups v2 com limites de CPU e memória por serviço; rotação de logs do runtime (max-size/max-file) e limpeza periódica de imagens não usadas; execução sem root (rootless) quando possível, perfis seccomp/AppArmor/SELinux; volume de dados em disco separado do sistema; cuidado com a interação do firewall do runtime com suas regras. Ajuste: observar uso por cgroup, definir limites a partir da medição real e não do palpite, e alertar sobre uso de disco.'),
          sl('Caso 2: servidor web de alto tráfego',
            'Requisitos: baixa latência de cauda e muitas conexões simultâneas. Riscos: esgotar descritores de arquivo, fila de conexões (backlog) pequena, esgotar portas efêmeras ao falar com backends (muitos sockets em TIME_WAIT), CPU gasta em TLS. Configuração relevante: limite de arquivos abertos do serviço (LimitNOFILE na unit do systemd, worker_connections no nginx), net.core.somaxconn e net.ipv4.tcp_max_syn_backlog, net.ipv4.ip_local_port_range, keepalive entre proxy e backend, reutilização de sessões TLS, cache e compressão. Ajuste: gerar carga em ambiente próprio, observar ss -s, erros do log e latência p99; aumentar um limite por vez, confirmando que o gargalo realmente era aquele.',
            `# /etc/systemd/system/nginx.service.d/limites.conf  (exemplo)
[Service]
LimitNOFILE=65535
# valor didático; defina a partir do número de conexões esperado`),
          sl('Caso 3: banco de dados',
            'Requisitos: durabilidade, latência previsível de E/S e uso eficiente de memória. Riscos: perder dados em queda de energia, swap degradando consultas, o OOM killer matando o banco, disco compartilhado com ruído. Configuração relevante: NÃO desativar o fsync em produção (acelera, mas arrisca corromper dados após uma queda); huge pages dedicadas (vm.nr_hugepages) conforme a documentação do SGBD, pois a memória do buffer é grande; transparent huge pages muitas vezes recomendadas desativadas para certos bancos; vm.swappiness baixo para preferir devolver cache a mandar memória do processo para o swap; sistema de arquivos como XFS ou ext4 com noatime, discos de log/WAL separados quando possível, agendador de E/S adequado (em NVMe costuma ser none). Ajuste: iostat -x (await, utilização), vmstat (swap), testes de fsync do próprio SGBD e consultas lentas, mudando um parâmetro por vez.'),
          sl('Casos 4 e 5: bastion e estação de build',
            'Bastion (jump host): ponto único de entrada SSH para a rede interna. Requisitos: autenticação forte e rastreabilidade. Riscos: é alvo atraente; encaminhamento de agente SSH (ssh -A) expõe chaves; contas compartilhadas. Configuração: certificados SSH ou chaves + MFA, ProxyJump em vez de agent forwarding, firewall restrito às origens conhecidas, pacotes mínimos, contas nominais e temporárias, logs enviados a um local central (que contêm dados pessoais: retenção e acesso controlados). Estação de build: requisitos de velocidade e reprodutibilidade; riscos: segredos nas compilações, dependências adulteradas, disco cheio de artefatos. Configuração: CPU/RAM/NVMe rápidos, ccache, make -j com o número de núcleos, builds em ambientes isolados e limpos (contêiner), cache de dependências, artefatos assinados, limpeza periódica, segredos injetados temporariamente. Ajuste: medir o tempo total e o uso por fase.'),
          sl('Caso 6: servidor de arquivos',
            'Requisitos: capacidade, permissões corretas, recuperação. Riscos: perda de dados por falha de disco, exclusão acidental, ransomware, vazamento por permissões frouxas. Configuração: NFS e/ou Samba com acesso restrito por rede e autenticação; ACLs e grupos por projeto; cotas por usuário; snapshots frequentes (btrfs/ZFS/LVM) para recuperar exclusões; RAID ou espelhamento para disponibilidade, mas RAID NÃO é backup (não protege contra exclusão, corrupção ou ransomware): mantenha backups separados, criptografados e testados; monitoramento SMART e verificações periódicas (scrub); auditoria de acesso a pastas com dados pessoais e retenção documentada. Ajuste: medir com fio em ambiente próprio e iostat, ajustando MTU, bonding e cache conforme o gargalo medido (rede ou disco).')
        ]
      },
      questions: [
        mcq('q1', 'Um engenheiro sugere alterar cinco parâmetros do kernel de uma vez para "resolver" a lentidão. Qual é a melhor resposta?',
          'd', ['Aceitar a proposta, pois economiza tempo de homologação', 'Mudar os parâmetros de rede, que costumam ser o gargalo', 'Esperar o próximo reinício programado e ver se melhora sozinho', 'Medir a linha de base e alterar sempre uma variável por vez'],
          'Alterar muitas coisas impede saber o que ajudou ou piorou. Meça, hipotetize, mude uma variável e compare.'),
        mcq('q2', 'Qual risco típico de um host de contêineres exige monitoramento específico?',
          'a', ['Disco cheio por imagens, camadas e logs', 'Falta de cores gráficos na saída do terminal', 'Excesso de caixas de e-mail abertas por usuários', 'Impressoras sem driver instalado no host de contêineres'],
          'Imagens, camadas e logs crescem silenciosamente. Rotação de logs, limpeza e alertas de disco mitigam.'),
        mcq('q3', 'Um servidor web recebe erros "too many open files" sob carga. Que ajuste está diretamente ligado?',
          'b', ['Reduzir o valor de vm.swappiness, para que o kernel libere mais descritores de arquivo ao serviço', 'Aumentar o limite de arquivos abertos (LimitNOFILE, worker_connections) e confirmar medindo', 'Desativar o TLS para poupar descritores de arquivo e reduzir o consumo de CPU nas conexões', 'Trocar o sistema de arquivos dos logs para ext2, que é mais simples e consome menos'],
          'Cada conexão consome um descritor. O limite do serviço precisa acompanhar a carga esperada.'),
        fill('q4', 'Qual parâmetro sysctl controla a tendência do kernel de mandar memória de processos para o swap em vez de devolver cache?',
          'sysctl vm.___',
          ['swappiness'],
          'vm.swappiness mais baixo prefere liberar cache; é comum reduzi-lo em bancos, mas ajuste com medição.'),
        mcq('q5', 'Para acelerar um banco de dados, alguém propõe desativar o fsync. Qual é o risco?',
          'c', ['Maior uso de CPU, por causa da escrita assíncrona', 'Perda da conexão com a rede durante as escritas em lote, até o próximo reinício', 'Corrupção de dados após queda de energia', 'Nenhum risco, desde que o servidor tenha RAID por hardware com bateria no controlador'],
          'O fsync garante que o dado está em armazenamento durável. Desligá-lo troca durabilidade por velocidade; não faça em produção.'),
        mcq('q6', 'Em um bastion, qual prática é preferível ao encaminhamento de agente SSH (ssh -A)?',
          'a', ['ProxyJump, com certificados ou chaves por usuário e MFA', 'Usar uma conta compartilhada de administrador, para simplificar o acesso', 'Guardar as chaves privadas dos usuários no próprio bastion', 'Abrir o SSH dos servidores internos para a internet inteira'],
          'ProxyJump não deixa o agente exposto ao bastion. Contas nominais dão rastreabilidade.'),
        mcq('q7', 'Um servidor de arquivos usa RAID 1. A equipe conclui que não precisa de backup. O que está errado?',
          'b', ['Nada, pois o RAID 1 já funciona como backup completo', 'RAID cobre falha de disco, mas não exclusão, corrupção ou ransomware', 'O RAID 1 é mais lento do que o RAID 0, o que inviabiliza o uso', 'RAID só funciona com compartilhamentos Samba, e não com NFS'],
          'Replicação reproduz o erro nos dois discos. Backup separado, criptografado e testado é indispensável.'),
        fill('q8', 'No método USE, as letras significam Utilização, Saturação e ___:',
          'USE = Utilização, Saturação, ___',
          ['Erros', 'erros', 'Errors', 'errors'],
          'Para cada recurso, veja o quanto está ocupado, se há fila esperando e se ocorrem erros.')
      ]
    },
    {
      id: 'lna-33-leitura-docs-codigo',
      title: 'Lendo documentação e código-fonte',
      goal: 'Navegar pelas seções do man, pela documentação do kernel e pelo código-fonte; acompanhar discussões técnicas, reportar bugs bem e começar a contribuir.',
      xp: 30,
      intro: {
        slides: [
          sl('As seções do man e os man 7 temáticos',
            'As páginas de manual são organizadas em seções: 1 comandos de usuário, 2 chamadas de sistema (syscalls), 3 funções de biblioteca C, 4 arquivos especiais e dispositivos, 5 formatos de arquivos e configuração, 6 jogos, 7 visões gerais, convenções e miscelânea, 8 administração do sistema. O mesmo nome pode existir em seções diferentes (printf é um comando na 1 e uma função na 3; open é syscall na 2), então se indica a seção: man 2 open. Para descobrir, use man -k palavra (ou apropos) e man -f nome. As páginas da seção 7 explicam temas inteiros e são excelentes para estudar: man 7 signal, man 7 namespaces, man 7 capabilities, man 7 hier (estrutura de diretórios), man 7 socket. As de syscall seguem um roteiro: SYNOPSIS (protótipo), DESCRIPTION, RETURN VALUE, ERRORS (lista de errno), NOTES e SEE ALSO.',
            `man 2 open        # a chamada de sistema
man 5 fstab       # formato do arquivo
man 7 signal      # visão geral dos sinais
man -k namespace  # procurar por assunto`),
          sl('Documentação do kernel, LWN e listas de e-mail',
            'O kernel tem documentação própria no diretório Documentation/ da árvore de fontes, publicada em kernel.org/doc: guias de administração, de subsistemas, de desenvolvimento (como submeter patches) e a documentação dos parâmetros de boot e do sysctl. O LWN.net publica reportagens e análises técnicas, com muito material sobre o kernel. As discussões acontecem em listas de e-mail (a lista principal é a LKML e há listas por subsistema), com arquivos públicos pesquisáveis (lore.kernel.org). Leia primeiro, para entender como a comunidade conversa, antes de escrever.'),
          sl('Lendo código-fonte: ferramentas e kernel',
            'Para ferramentas como o coreutils, obtenha o código-fonte (pelo repositório do projeto ou com o gerenciador, por exemplo apt source coreutils) e leia programas pequenos, como cat.c, para ver como a chamada de sistema e o tratamento de erros são usados na prática. Para o kernel, use busca textual (grep -rn "nome" arquivo-ou-pasta), índices de símbolos (ctags, cscope) ou o navegador Elixir (referência cruzada de identificadores, na web). O Git conta a história do código: git log --oneline -- caminho lista as mudanças de um arquivo, git blame arquivo mostra o commit que alterou cada linha, git show COMMIT exibe a mudança e a mensagem (que explica o porquê), e git log -S "texto" acha quando um texto apareceu ou sumiu.',
            `grep -rn "vfs_read" fs/ | head
git log --oneline -- fs/read_write.c | head
git blame fs/read_write.c | head
git show <commit>`),
          sl('Acompanhar uma discussão técnica',
            'Numa lista, leia a conversa em ordem cronológica, do primeiro e-mail ao último, antes de opinar. Patches vêm em versões (v1, v2, v3) com um histórico do que mudou entre elas. Observe as marcas: Reviewed-by (alguém revisou), Acked-by (mantenedor concorda), Tested-by e Signed-off-by (origem do patch). Nas listas de desenvolvimento se usa texto puro (sem HTML), com respostas intercaladas, citando só o trecho relevante; critique o código, não a pessoa. Se for fazer uma pergunta, mostre o que já tentou e leu.'),
          sl('Reportar bugs e contribuir',
            'Um bom relatório permite reproduzir o problema: versão do kernel (uname -r), distribuição e versão (cat /etc/os-release), hardware relevante, passos mínimos para reproduzir, resultado esperado e obtido, mensagens de log (dmesg, journalctl -b), se é regressão (funcionava antes e em qual versão) e se já há relato. ANTES de postar, remova dados pessoais, nomes de máquinas internas, endereços IP, tokens e senhas dos logs. Para contribuir: comece por documentação, erros de digitação e testes; leia o guia de submissão do projeto; no kernel, o fluxo é git format-patch e git send-email, com scripts/checkpatch.pl para verificar o estilo e scripts/get_maintainer.pl para saber a quem enviar. Cada contribuição pequena e bem feita constrói reputação.',
            `uname -r
cat /etc/os-release
journalctl -b -p warning | head -n 50   # REVISE e remova dados pessoais antes de compartilhar`),
          sl('Hábito de estudo',
            'Aprender Linux a fundo é prática contínua: leia uma página de manual por dia ou por semana (especialmente as da seção 7), reproduza em uma VM o que lê, mantenha anotações com comandos e explicações próprias, leia o código de um comando simples por mês, acompanhe o LWN e as notas de versão das ferramentas que você usa, e escreva o que aprendeu (um post, um runbook). Duvide do que lê: confirme em fontes primárias (man, documentação oficial, código) e teste.')
        ]
      },
      questions: [
        mcq('q1', 'Você quer a descrição da chamada de sistema open. Qual comando abre a página correta?',
          'a', ['man 2 open', 'man 5 open', 'man 7 open', 'man 8 open'],
          'A seção 2 é de chamadas de sistema; 3 é de funções de biblioteca; 5, formatos de arquivo; 8, administração.'),
        mcq('q2', 'Qual comando é mais adequado para uma visão geral sobre namespaces do kernel?',
          'd', ['man 1 namespaces', 'man 2 namespaces', 'man 8 namespaces', 'man 7 namespaces'],
          'A seção 7 reúne visões gerais por tema, como signal, capabilities e namespaces.'),
        mcq('q3', 'Qual combinação de comandos ajuda a descobrir quando e por que uma linha de um arquivo do kernel mudou?',
          'c', ['cat e wc, para contar linhas e palavras do arquivo inteiro e comparar com a versão anterior', 'ls e du, para ver data e tamanho do arquivo', 'git blame para achar o commit e git show para ler a mudança', 'make e insmod, para recompilar e carregar o módulo de teste na máquina virtual'],
          'git blame aponta o commit de cada linha; git show mostra o diff e a mensagem, que deve explicar o motivo.'),
        fill('q4', 'Complete o número da seção do manual onde ficam as chamadas de sistema:',
          'man ___ open',
          ['2'],
          'Seção 2 = chamadas de sistema (syscalls). A 3 é de funções da biblioteca C.'),
        mcq('q5', 'Qual relatório de bug é mais útil para os mantenedores?',
          'd', ['"Não funciona, urgente!", sem mais detalhes sobre o ambiente, o kernel ou os passos executados', 'Um vídeo de tela sem nenhum texto explicativo', 'O log completo do sistema, sem versão nem descrição do problema, com todos os dados pessoais', 'Versão do kernel e da distro, passos mínimos, resultado esperado e obtido, logs'],
          'Reprodutibilidade e contexto permitem diagnosticar. Informar se é regressão ajuda ainda mais.'),
        mcq('q6', 'Numa lista de e-mail do kernel, um patch aparece como "v3". O que isso indica?',
          'c', ['Que o patch usa a versão 3 do protocolo SMTP para ser enviado às listas de e-mail', 'Que o kernel está na versão 3 da série atual e que o patch vale para ela', 'A terceira versão do patch, com histórico de mudanças entre versões', 'Que três mantenedores já aceitaram o patch na árvore'],
          'Cada revisão gera uma nova versão; leia as anteriores e a lista de alterações para entender a discussão.'),
        mcq('q7', 'Antes de anexar um log de journalctl a um relato público, o que fazer?',
          'b', ['Compactar com senha fraca e enviar, para reduzir o tamanho', 'Revisar e remover sempre dados pessoais, IPs internos, tokens e senhas', 'Anexar sem revisar, para não perder informações úteis ao diagnóstico', 'Substituir o log por uma captura de tela do terminal inteiro'],
          'Logs públicos podem expor dados pessoais e segredos. Revise e anonimize antes de publicar.'),
        fill('q8', 'Qual subcomando do Git mostra, para cada linha, o commit que a alterou pela última vez?',
          'git ___ fs/read_write.c',
          ['blame'],
          'git blame é a base para entender a história de uma linha; combine com git show.')
      ]
    },
    {
      id: 'lna-34-projeto-integrador',
      title: 'Projeto integrador: frota de servidores',
      goal: 'Integrar o curso em um projeto: projetar e documentar a operação segura de uma frota (imagem base, automação, rede, SSH, observabilidade, backup, hardening, LGPD, runbooks e ADRs).',
      xp: 30,
      intro: {
        slides: [
          sl('O cenário e a arquitetura',
            'Cenário fictício: a empresa "Loja Exemplo Ltda" opera cerca de quarenta servidores Linux (aplicação web, banco de dados, cache, ferramentas internas) em nuvem e num pequeno datacenter. Requisitos: disponibilidade de 99,9%, dados de clientes sob a LGPD, equipe pequena. Arquitetura em camadas de rede segmentadas: DMZ (balanceadores/proxy), aplicação, dados e gestão (bastion, monitoramento). Regras: tráfego só entre camadas adjacentes, banco sem rota para a internet, administração somente pelo bastion. O fundamento é o princípio do privilégio mínimo aplicado à rede: se uma camada for comprometida, as outras não ficam automaticamente expostas.'),
          sl('Imagem base e provisionamento automatizados',
            'Todo servidor nasce de uma imagem base endurecida (hardening): pacotes mínimos, serviços desnecessários desativados, atualizações de segurança automáticas ou controladas, relógio sincronizado (chrony), auditd e agente de métricas. Em vez de ajustes manuais, use automação idempotente: Terraform cria a infraestrutura (VMs, redes), cloud-init configura o primeiro boot e o Ansible aplica e reaplica a configuração (idempotência: rodar de novo não muda o que já está correto). Tudo versionado no Git, com revisão, o que dá rastreabilidade e reprodutibilidade. Servidores são tratados como descartáveis: em caso de problema, recria-se a partir da imagem e do código, em vez de consertar à mão.',
            `#cloud-config
package_update: true
packages:
  - nftables
  - chrony
runcmd:
  - [systemctl, enable, --now, nftables]
  - [systemctl, enable, --now, chrony]`),
          sl('Firewall e SSH com certificados',
            'O firewall em cada host (nftables) começa em "negar tudo" (policy drop) e libera só o necessário: o SSH apenas a partir do bastion, a aplicação apenas a partir dos balanceadores. Para o SSH, em vez de espalhar chaves públicas em authorized_keys, use uma autoridade certificadora de SSH (CA): ela assina a chave pública de cada pessoa com validade curta, identificador e lista de usuários permitidos; os servidores confiam na CA (TrustedUserCAKeys). Vantagens: acesso temporário, revogação por expiração, sem acúmulo de chaves antigas e registro de quem acessou. Desative senha e login direto do root. A chave privada da CA fica offline ou em um HSM, e os exemplos usam apenas placeholders.',
            `# no servidor: /etc/ssh/sshd_config (trecho)
TrustedUserCAKeys /etc/ssh/ca_usuarios.pub
PasswordAuthentication no
PermitRootLogin no
# emitir certificado válido por 1 dia (exemplo; chave da CA protegida)
# ssh-keygen -s <ca_usuarios> -I usuario.exemplo -n deploy -V +1d <chave.pub>`),
          sl('Observabilidade, backups e recuperação de desastres',
            'Observabilidade: métricas (node_exporter e Prometheus) e logs centralizados via TLS, com SLOs definidos por serviço (por exemplo, 99,9% de requisições bem-sucedidas em 30 dias, orçamento de 43,2 minutos) e alertas acionáveis que apontam para runbooks. Backups: regra 3-2-1 (três cópias, em duas mídias diferentes, uma fora do local), criptografados, com chaves guardadas separadamente, e RESTAURAÇÃO TESTADA periodicamente, pois backup não testado é esperança. Defina RPO e RTO por sistema: se o banco precisa de RPO de 1 hora, backups a cada 6 horas não bastam, e é preciso replicação ou arquivos de log de transações contínuos. Faça exercícios de recuperação de desastres (DR) e registre o tempo real obtido.'),
          sl('Hardening de serviços e privacidade (LGPD)',
            'Cada serviço roda com usuário próprio e sandbox do systemd: NoNewPrivileges, ProtectSystem=strict (sistema de arquivos somente leitura exceto o que for permitido em ReadWritePaths), ProtectHome, PrivateTmp, CapabilityBoundingSet vazio; systemd-analyze security avalia o resultado. Privacidade: mapear onde há dados pessoais, minimizar o que é coletado e registrado em logs, definir retenção com expurgo automatizado (logrotate, TTL, purga de backups), criptografar em trânsito (TLS) e em repouso (LUKS, backups cifrados), controlar e auditar o acesso a dados de clientes e ter plano de resposta a incidentes com comunicação à ANPD e aos titulares quando aplicável. Dados de exemplo e de teste são sempre fictícios.',
            `# /etc/systemd/system/app.service.d/sandbox.conf (exemplo)
[Service]
User=app
NoNewPrivileges=yes
ProtectSystem=strict
ProtectHome=yes
PrivateTmp=yes
ReadWritePaths=/var/lib/app
CapabilityBoundingSet=`),
          sl('Runbooks, incidentes, ADRs e checklist final',
            'Runbooks documentam, passo a passo, como diagnosticar e mitigar os alertas e tarefas comuns (restaurar o banco, rotacionar um certificado, isolar um servidor). A resposta a incidentes segue o ciclo: detectar, conter, erradicar, recuperar, comunicar e aprender, com post-mortem sem culpados. As decisões importantes são registradas em ADRs (Architecture Decision Records): título, status, contexto, decisão e consequências, o que explica o porquê no futuro. Checklist final antes de ir à produção: rede segmentada e firewall em negar-por-padrão; SSH por certificados; imagem base atualizada; automação versionada; métricas, logs e alertas com SLOs; backups com restauração testada e RPO/RTO medidos; sandbox dos serviços; mapeamento de dados, retenção, criptografia e auditoria; runbooks e plano de incidentes; ADRs atualizados.')
        ]
      },
      questions: [
        mcq('q1', 'Qual é o objetivo da segmentação em DMZ, aplicação, dados e gestão?',
          'b', ['Aumentar a quantidade de IPs públicos disponíveis para a empresa e para os fornecedores, sem custo', 'Limitar o alcance de um comprometimento, liberando só o tráfego necessário entre camadas', 'Dispensar o firewall dos hosts, já que a rede cuida disso', 'Fazer todos os servidores falarem entre si livremente, para simplificar a operação diária da equipe'],
          'Privilégio mínimo na rede: o banco não precisa de rota para a internet, e a gestão passa só pelo bastion.'),
        mcq('q2', 'Por que usar Ansible e cloud-init em vez de ajustes manuais?',
          'c', ['Para impedir o uso do Git na gestão da infraestrutura', 'Para eliminar a necessidade de testes antes da produção', 'Para ter configuração idempotente, versionada e reproduzível', 'Para dispensar o hardening da imagem base, já que tudo é recriado'],
          'Automação idempotente evita divergência entre servidores e deixa histórico revisável.'),
        mcq('q3', 'Qual é a vantagem de certificados SSH de curta validade emitidos por uma CA?',
          'd', ['Dispensam totalmente o uso de chaves públicas e privadas', 'Permitem login sem identificar o usuário, para simplificar o acesso de contas compartilhadas', 'Aumentam o tamanho do authorized_keys em cada servidor da frota, facilitando auditorias', 'Dão acesso temporário, sem acumular chaves antigas, e deixam rastro de quem acessou (identificador do certificado)'],
          'A expiração faz a revogação natural. Os servidores só precisam confiar na CA.'),
        fill('q4', 'Complete a opção do systemd que torna o sistema de arquivos somente leitura para o serviço, exceto caminhos liberados:',
          'ProtectSystem=___',
          ['strict'],
          'Com strict, só os caminhos em ReadWritePaths ficam graváveis; use systemd-analyze security para avaliar.'),
        mcq('q5', 'O banco precisa de RPO de 1 hora, mas os backups ocorrem a cada 6 horas. O que está errado?',
          'a', ['Em falha, até 6 horas de dados podem ser perdidas: faltam backups frequentes ou replicação', 'O RTO está alto, e só ele precisa ser revisado, pois a perda de dados já está dentro da meta', 'Nada, porque o RPO só vale para o disco do sistema operacional', 'Falta de TLS entre o banco e a aplicação, que expõe os dados em trânsito na rede'],
          'RPO é a perda máxima aceitável. Backup a cada 6 horas implica até 6 horas de perda, acima da meta.'),
        mcq('q6', 'Qual conjunto é adequado para atender a privacidade dos dados de clientes na infraestrutura?',
          'c', ['Guardar logs com dados completos por tempo indeterminado, para auditorias e análises futuras', 'Usar dados reais de clientes em homologação, para testes mais fiéis', 'Mapear dados, minimizar, definir retenção com expurgo, criptografar e auditar acessos', 'Desativar a auditoria para economizar espaço em disco e reduzir o ruído nos relatórios da equipe'],
          'Minimização, retenção, criptografia e auditoria são os pilares técnicos de proteção de dados pessoais.'),
        mcq('q7', 'Qual é a função de um ADR?',
          'b', ['Substituir o runbook de incidentes por um documento mais curto e fácil de revisar', 'Registrar a decisão de arquitetura, com contexto e consequências', 'Aplicar automaticamente a configuração escolhida nos servidores, por meio do Ansible', 'Guardar as senhas da equipe em um cofre compartilhado'],
          'ADRs documentam decisões e seus motivos, evitando que a memória se perca quando a equipe muda.'),
        fill('q8', 'Complete a opção do sshd_config que desativa o login por senha:',
          'PasswordAuthentication ___',
          ['no'],
          'Com autenticação por chave ou certificado e senha desativada, ataques de adivinhação de senha perdem efeito.')
      ]
    },
    {
      id: 'lna-35-tendencias',
      title: 'Tendências e fronteiras',
      goal: 'Conhecer, em termos conceituais, as direções do ecossistema Linux (eBPF, Rust, sched_ext, io_uring, TEEs, distros atômicas, Wayland, cadeia de suprimentos, IA) e acompanhar a área sem se perder em modas.',
      xp: 30,
      intro: {
        slides: [
          sl('eBPF, sched_ext e extensibilidade segura',
            'O eBPF permite carregar pequenos programas no kernel em tempo de execução, depois de um verificador provar que são seguros (terminam, não acessam memória indevida). A ideia se expandiu de filtros de pacotes para observabilidade, redes (processamento muito cedo no caminho dos pacotes), segurança e controle de políticas. O sched_ext aplica o mesmo princípio ao escalonador: políticas de escalonamento escritas como programas BPF, carregadas sem recompilar o kernel, com mecanismos para voltar ao escalonador padrão se algo falhar. A lição conceitual: estender o kernel sem escrever módulos arriscados. Este curso não afirma o estado atual de nenhum projeto; consulte a documentação da versão que usa.'),
          sl('Rust no kernel e io_uring',
            'Uma grande parcela das vulnerabilidades do kernel vem de erros de memória da linguagem C. Rust oferece segurança de memória verificada em tempo de compilação, e o kernel tem trabalhado para permitir código em Rust, em especial para novos drivers, convivendo com o C existente (que não será reescrito de uma vez). O io_uring é uma interface de E/S assíncrona baseada em dois anéis de memória compartilhados entre aplicação e kernel (fila de submissão e fila de conclusão), o que reduz a quantidade de chamadas de sistema e permite operar em lote. Por ser uma superfície ampla de código no kernel, alguns ambientes restringem seu uso por segurança: faça uma avaliação de risco.'),
          sl('Computação confidencial (TEEs)',
            'Ambientes de execução confiáveis (TEEs) protegem dados EM USO: a memória de uma VM ou enclave é cifrada pelo hardware (exemplos de tecnologias: AMD SEV, Intel TDX), de modo que nem o hospedeiro, o hipervisor ou o provedor conseguem ler seu conteúdo. A atestação remota permite provar a um terceiro que o código certo roda num ambiente genuíno antes de entregar segredos. Complementa a criptografia em repouso e em trânsito. Limites: reduz, mas não elimina, riscos (falhas de implementação e canais laterais existem) e o desempenho e a compatibilidade precisam ser avaliados.'),
          sl('Distribuições imutáveis, Wayland e systemd',
            'Distribuições imutáveis e atômicas atualizam o sistema como uma imagem completa, com raiz somente leitura e rollback, empurrando aplicações para contêineres ou pacotes isolados: mais previsibilidade e segurança operacional. O Wayland é um protocolo de sistema de janelas sucessor do X11 em muitos desktops, com isolamento melhor entre aplicações (um programa não captura a tela ou as teclas de outro por padrão) e arquitetura mais simples. O systemd continua a incorporar funcionalidades (gerenciamento de serviços, rede, imagens do sistema, criptografia vinculada ao TPM...), o que gera discussões legítimas entre integração e simplicidade. Em todos os casos, avalie benefícios e custos de migração para o seu contexto.'),
          sl('Cadeia de suprimentos de software livre',
            'Quase todo software moderno depende de centenas de componentes de código aberto, muitos mantidos por poucas pessoas voluntárias. Incidentes reais mostraram que um mantenedor sobrecarregado ou uma dependência comprometida podem afetar muita gente. Defesas: conhecer suas dependências (SBOM), fixar versões e verificar assinaturas e hashes, revisar mudanças, preferir builds reproduzíveis, assinar artefatos próprios (ferramentas como o Sigstore, frameworks como o SLSA descrevem níveis de maturidade), isolar a compilação e atualizar com critério, com testes. Contribuir financeira ou tecnicamente com projetos dos quais se depende também é gestão de risco.'),
          sl('IA, infraestrutura e como acompanhar sem se perder',
            'Assistentes de IA já ajudam a escrever scripts, explicar logs e resumir documentação, e ferramentas de detecção de anomalias usam aprendizado de máquina. Cuidados: podem inventar comandos ou opções que não existem (alucinação), então revise e teste em ambiente descartável antes de aplicar, nunca cole segredos, chaves ou dados pessoais em ferramentas externas e mantenha a responsabilidade humana pelas decisões. Para acompanhar a área: leia notas de versão, o LWN.net, a documentação oficial e as listas dos projetos que você usa; estude conceitos (processos, memória, rede, armazenamento, segurança) que duram décadas; avalie novidades por maturidade do projeto, mantenedores, histórico de segurança, comunidade e estratégia de saída; experimente em laboratório; adote por necessidade e não por moda.')
        ]
      },
      questions: [
        mcq('q1', 'Qual característica torna o eBPF mais seguro que carregar um módulo comum?',
          'd', ['Roda em espaço de usuário, sem tocar no kernel', 'Dispensa privilégios por completo, mesmo para programas de rede', 'É escrito em Rust, o que garante segurança de memória', 'Um verificador analisa o programa antes de ele rodar no kernel'],
          'O verificador exige que o programa termine e respeite limites de memória, ao contrário de um módulo, que roda sem essa prova.'),
        mcq('q2', 'Qual é a ideia central do io_uring?',
          'b', ['Criptografar a memória das VMs com chaves do hardware, protegendo os dados em uso', 'Anéis compartilhados de submissão e conclusão, que reduzem chamadas de sistema em E/S assíncrona', 'Substituir o escalonador de processos por um baseado em filas', 'Montar sistemas de arquivos remotos sobre a rede, via anéis de memória compartilhada'],
          'A aplicação coloca requisições na fila e o kernel devolve resultados em outra, em lote, evitando uma syscall por operação.'),
        mcq('q3', 'Qual é o principal motivo para permitir código em Rust no kernel?',
          'a', ['Reduzir erros de segurança de memória em código novo, como drivers, sem reescrever o que já existe', 'Eliminar a necessidade de drivers, movendo tudo ao espaço de usuário', 'Substituir todo o código em C por Rust em curto prazo', 'Tornar os módulos mais lentos, em troca de simplicidade na compilação'],
          'Rust verifica segurança de memória em tempo de compilação e convive com o código C existente.'),
        fill('q4', 'O sched_ext permite escrever políticas de escalonamento como programas ___:',
          'sched_ext = escalonador extensível por ___',
          ['BPF', 'eBPF'],
          'Políticas carregadas sem recompilar o kernel, com retorno ao escalonador padrão se falharem.'),
        mcq('q5', 'O que a computação confidencial (TEEs) protege?',
          'c', ['Dados em repouso no disco, com chaves guardadas pelo administrador', 'A rede entre data centers, por túneis cifrados', 'Dados em uso, com memória cifrada por hardware e atestação remota do ambiente', 'O código-fonte do kernel contra leitura por usuários sem privilégio'],
          'Diferente de proteger dados em repouso ou em trânsito, TEEs protegem dados durante o processamento.'),
        mcq('q6', 'Qual prática ajuda a reduzir o risco da cadeia de suprimentos de software?',
          'd', ['Usar sempre a versão mais recente de qualquer dependência, sem revisar, para ganhar segurança', 'Desativar a verificação de assinaturas para acelerar os builds e reduzir falhas de rede', 'Compilar nas máquinas dos desenvolvedores, sem isolamento algum', 'Inventariar dependências (SBOM), verificar assinaturas, preferir builds reproduzíveis e isolar a compilação'],
          'Conhecer, verificar e isolar a cadeia reduz a chance de um componente adulterado chegar à produção.'),
        mcq('q7', 'Um assistente de IA sugere um comando de limpeza de disco para produção. Qual é a atitude adequada?',
          'b', ['Executar direto em produção, pois a resposta pareceu segura e vinha acompanhada de uma explicação convincente', 'Revisar, testar em ambiente descartável e nunca enviar dados sensíveis', 'Colar o conteúdo do arquivo de senhas e das chaves, para dar mais contexto ao assistente', 'Desabilitar os backups antes de executar, para liberar espaço em disco'],
          'IA pode errar ou inventar opções. A decisão e a verificação continuam humanas, e dados sensíveis não devem ser enviados a serviços externos.'),
        fill('q8', 'Qual é o protocolo de sistema de janelas sucessor do X11 em muitos desktops Linux?',
          '___ (sucessor do X11)',
          ['Wayland', 'wayland'],
          'O Wayland isola melhor as aplicações entre si e simplifica a arquitetura gráfica.')
      ]
    },
  ]
};
