// Módulo "Avançado" do curso de Containers (Docker) — lições 8 questões cada (3 múltipla escolha +
// 1 lacuna, duas vezes por lição). Ver ../../index.js para o formato e a validação de boot.
// Assume o conteúdo dos níveis iniciante e intermediário e aprofunda nos internals (namespaces,
// cgroups, capabilities/seccomp/LSM, runtime, overlayfs, rootless, Podman, OCI, registries, cadeia
// de suprimentos, hardening, redes e operação do daemon). Exemplos sem dados pessoais; segredos
// sempre fora da imagem e do versionamento.
module.exports = {
  id: 'avancado-containers',
  levelKey: 'advanced',
  order: 3,
  title: 'Avançado',
  subtitle: 'Namespaces, cgroups, runtimes, overlayfs, rootless, OCI, cadeia de suprimentos, hardening e operação do daemon',
  accent: '#2496ed',
  lessons: [
    {
      id: 'cta-01-namespaces',
      title: 'Namespaces: o isolamento por dentro',
      goal: 'Entender como o kernel Linux isola processos com namespaces e por que um container é apenas um processo comum com visão restrita.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Container é só um processo',
            body: 'Não existe "objeto container" dentro do kernel Linux. Um container é um processo (e seus filhos) iniciado com visões isoladas de certos recursos do sistema e com limites de consumo. O isolamento de VISÃO vem dos namespaces; os limites de uso vêm dos cgroups (próxima lição). Por isso você enxerga o processo do container na lista de processos do host, com um PID diferente do que ele vê por dentro.',
            code: 'docker run -d --name web nginx\ndocker inspect -f \'{{.State.Pid}}\' web\n# 48213   <- PID do processo no host\nps -o pid,ppid,cmd -p 48213'
          },
          {
            title: 'Os tipos de namespace',
            body: 'Um namespace faz um recurso global parecer privado. Os principais: pid (árvore de processos e numeração de PIDs), net (interfaces, rotas, iptables, portas), mnt (pontos de montagem e sistema de arquivos visível), uts (hostname e domainname), ipc (filas de mensagens e memória compartilhada System V), user (mapeamento de UID/GID) e cgroup (visão da hierarquia de cgroups). Existe ainda o namespace time, menos usado. Cada tipo isola UM recurso: um processo pode compartilhar o net do host e ter mnt próprio, por exemplo.'
          },
          {
            title: 'Inspecionando com /proc/<pid>/ns',
            body: 'Cada processo expõe seus namespaces como links simbólicos em /proc/<pid>/ns. O número entre colchetes é o inode do namespace: dois processos com o MESMO número em net:[...] estão no mesmo namespace de rede. Comparar esses números é a forma mais direta de saber se um container compartilha algo com o host.',
            code: 'ls -l /proc/self/ns\n# net -> \'net:[4026531840]\'   (host)\nls -l /proc/48213/ns/net\n# net -> \'net:[4026532601]\'   (container: outro número = outro namespace)'
          },
          {
            title: 'Ferramentas: lsns, unshare e nsenter',
            body: 'lsns lista os namespaces existentes, quantos processos há em cada e qual processo os criou. unshare cria um novo namespace e executa um comando dentro dele (ex.: unshare --pid --fork --mount-proc bash dá um shell com árvore de PIDs própria). nsenter ENTRA nos namespaces de um processo existente, escolhidos por flags: -n (rede), -p (pid), -m (mount), -u (uts), -i (ipc), -U (user), -t PID indica o processo alvo. É assim que se depura a rede de um container sem ferramentas dentro da imagem.',
            code: 'sudo lsns -t net\nsudo unshare --pid --fork --mount-proc bash   # PID 1 aqui dentro\nsudo nsenter -t 48213 -n ip addr             # roda o ip do HOST na rede do container'
          },
          {
            title: 'PID namespace na prática',
            body: 'Dentro de um pid namespace o primeiro processo é o PID 1 e só enxerga seus descendentes; o mesmo processo tem outro PID (maior) visto do host. O host enxerga tudo, o container não enxerga o host. O mount namespace, junto com uma troca de raiz (pivot_root/chroot) para a camada da imagem, é o que faz o container ver apenas o seu próprio sistema de arquivos. O uts namespace é o motivo de cada container ter seu hostname.'
          },
          {
            title: 'Compartilhar com o host: --pid=host e --net=host',
            body: 'As flags --pid=host, --net=host, --ipc=host e --uts=host fazem o container reutilizar o namespace do host em vez de criar um novo. Com --net=host não há isolamento de rede: o processo abre portas diretamente na interface do host e enxerga todo o tráfego local, mas ganha desempenho e dispensa -p. Com --pid=host o container vê e pode sinalizar todos os processos do host (e, com capabilities como SYS_PTRACE, inspecioná-los). Cada flag remove uma barreira: use só quando indispensável (ferramentas de monitoramento, por exemplo) e nunca em cargas não confiáveis.',
            code: 'docker run --rm --net=host nginx          # escuta na porta 80 do HOST, sem -p\ndocker run --rm --pid=host alpine ps aux   # lista processos do host'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual afirmação descreve melhor um container Linux?',
          choices: [
            { id: 'a', text: 'Uma máquina virtual leve com kernel próprio' },
            { id: 'b', text: 'Um objeto do kernel criado pela chamada de sistema container_create' },
            { id: 'c', text: 'Um processo comum do host, executado com namespaces e cgroups' },
            { id: 'd', text: 'Um arquivo compactado que o dockerd descompacta em memória' }
          ],
          answer: 'c',
          explanation: 'O kernel não tem a noção de container: é um processo normal com visão isolada (namespaces) e limites (cgroups).'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual namespace isola o hostname do container?',
          choices: [
            { id: 'a', text: 'uts' },
            { id: 'b', text: 'ipc' },
            { id: 'c', text: 'mnt' },
            { id: 'd', text: 'cgroup' }
          ],
          answer: 'a',
          explanation: 'uts isola hostname e domainname; ipc isola recursos de comunicação entre processos; mnt os pontos de montagem.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Dois processos mostram o mesmo valor em /proc/<pid>/ns/net (por exemplo net:[4026531840]). O que isso significa?',
          choices: [
            { id: 'a', text: 'Eles têm o mesmo PID em namespaces diferentes' },
            { id: 'b', text: 'Eles usam o mesmo hostname' },
            { id: 'c', text: 'Ambos estão bloqueados por seccomp' },
            { id: 'd', text: 'Eles compartilham o mesmo namespace de rede' }
          ],
          answer: 'd',
          explanation: 'O número é o inode do namespace: igual = mesmo namespace.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o diretório do /proc onde ficam os links dos namespaces de um processo.',
          code: 'ls -l /proc/$$/___',
          accept: ['ns', '/proc/$$/ns'],
          explanation: 'Os links simbólicos ficam em /proc/<pid>/ns (net, pid, mnt, uts, ipc, user, cgroup).'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Um container com PID 1 interno aparece no host com o PID 48213. Por quê?',
          choices: [
            { id: 'a', text: 'O dockerd renumera o processo ao iniciá-lo' },
            { id: 'b', text: 'O pid namespace traduz a numeração: o mesmo processo tem PIDs diferentes em cada namespace' },
            { id: 'c', text: 'Há dois processos distintos, um no host e outro no container' },
            { id: 'd', text: 'O cgroup reserva PIDs baixos para o container' }
          ],
          answer: 'b',
          explanation: 'Cada pid namespace tem sua própria numeração; o host vê o PID real no seu namespace.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual ferramenta entra nos namespaces de um processo já em execução (por exemplo, para rodar ip addr na rede de um container)?',
          choices: [
            { id: 'a', text: 'unshare' },
            { id: 'b', text: 'lsns' },
            { id: 'c', text: 'chroot' },
            { id: 'd', text: 'nsenter' }
          ],
          answer: 'd',
          explanation: 'nsenter entra em namespaces existentes; unshare cria novos; lsns apenas lista.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual é o principal risco de rodar um container com --pid=host?',
          choices: [
            { id: 'a', text: 'Ele enxerga e pode sinalizar os processos do host, removendo uma barreira de isolamento' },
            { id: 'b', text: 'O container perde acesso ao próprio sistema de arquivos' },
            { id: 'c', text: 'O container passa a usar o PID 1 do host como init próprio' },
            { id: 'd', text: 'O hostname do container é apagado' }
          ],
          answer: 'a',
          explanation: 'Sem pid namespace próprio, o container vê toda a árvore de processos do host.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a flag do nsenter que entra no namespace de REDE do processo 48213.',
          code: 'sudo nsenter -t 48213 ___ ip addr',
          accept: ['-n', '--net'],
          explanation: '-n (ou --net) seleciona o namespace de rede; é a base da depuração de rede de containers.'
        }
      ]
    },
    {
      id: 'cta-02-cgroups',
      title: 'cgroups: limites e contabilidade de recursos',
      goal: 'Entender como os control groups limitam e medem CPU, memória, I/O e processos e como o Docker traduz suas flags em arquivos de cgroup.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O que são cgroups',
            body: 'Se namespaces limitam o que o processo ENXERGA, cgroups (control groups) limitam o que ele CONSOME e medem esse consumo. Um cgroup é um grupo de processos ao qual controllers aplicam regras: cpu, memory, io e pids são os mais usados. A interface é um sistema de arquivos: cada cgroup é um diretório e cada limite é um arquivo que você lê ou escreve.'
          },
          {
            title: 'cgroups v1 vs v2',
            body: 'No v1 há uma hierarquia SEPARADA por controller (/sys/fs/cgroup/memory/..., /sys/fs/cgroup/cpu/...), e um mesmo processo pode estar em árvores diferentes para cada controller, o que complica a gestão. O v2 tem uma hierarquia unificada única em /sys/fs/cgroup, com nomes de arquivo consistentes e melhor contabilidade. Distribuições recentes usam v2 por padrão. Para saber qual está em uso, veja o tipo do sistema de arquivos montado.',
            code: 'stat -fc %T /sys/fs/cgroup\n# cgroup2fs  -> v2\n# tmpfs      -> v1 (hierarquias por controller abaixo)\ncat /sys/fs/cgroup/cgroup.controllers\n# cpuset cpu io memory hugetlb pids'
          },
          {
            title: 'Arquivos de controle no v2',
            body: 'Cada diretório de cgroup tem arquivos como: cgroup.procs (PIDs do grupo), memory.max (limite rígido de memória), memory.high (limite brando), memory.current (uso atual), cpu.max (cota de CPU), cpu.stat (estatísticas, incluindo throttling), pids.max (máximo de processos), io.max (limites de IO por dispositivo) e memory.events (contadores como oom e oom_kill). O valor especial max significa sem limite. O Docker (com driver systemd) cria um cgroup por container, normalmente sob system.slice com nome docker-<id>.scope.'
          },
          {
            title: 'cpu.max e throttling',
            body: 'cpu.max tem o formato "QUOTA PERIODO", ambos em microssegundos: o grupo pode usar QUOTA µs de CPU a cada PERIODO µs. "50000 100000" = meio núcleo; "200000 100000" = dois núcleos; "max 100000" = sem limite. Ao esgotar a cota dentro do período, os processos são pausados até o próximo período: isso é throttling, NÃO é morte do processo. Ele aparece em cpu.stat (nr_throttled, throttled_usec) e se manifesta como latência alta.',
            code: 'cat /sys/fs/cgroup/system.slice/docker-<id>.scope/cpu.max\n# 50000 100000     -> --cpus=0.5\ncat .../cpu.stat\n# nr_periods 1200\n# nr_throttled 340\n# throttled_usec 8120000'
          },
          {
            title: 'memory.max, memory.high e o OOM do cgroup',
            body: 'memory.high é um limite brando: ao ultrapassá-lo o kernel freia o grupo (força reclamação de memória e atrasa as alocações), mas não mata ninguém. memory.max é o teto rígido: se o grupo o atinge e não há como recuperar memória, o OOM killer do cgroup mata um processo DENTRO do grupo, sem derrubar o host. Os eventos são contados em memory.events (oom_kill). Um container morto por OOM sai com código 137 (128 + SIGKILL 9), e docker inspect mostra .State.OOMKilled como true.'
          },
          {
            title: 'Como o Docker mapeia as flags',
            body: '--memory=256m define memory.max = 268435456 bytes (256 x 1024 x 1024). --cpus=1.5 vira uma cota de 150000 sobre um período de 100000 no cpu.max. --pids-limit=100 vira pids.max=100 (protege contra fork bomb). --cpu-shares/--cpu-weight dão peso relativo (só pesa sob disputa, não é teto). Limitar é essencial em produção: sem limites, um container pode consumir todo o host.',
            code: 'docker run -d --name api --memory=256m --cpus=1.5 --pids-limit=100 app\ncat /sys/fs/cgroup/system.slice/docker-<id>.scope/memory.max   # 268435456\ncat /sys/fs/cgroup/system.slice/docker-<id>.scope/cpu.max      # 150000 100000'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual a principal diferença estrutural entre cgroups v1 e v2?',
          choices: [
            { id: 'a', text: 'O v2 só controla memória, o v1 controla tudo' },
            { id: 'b', text: 'O v1 usa arquivos e o v2 usa chamadas de sistema' },
            { id: 'c', text: 'O v2 usa uma hierarquia unificada; o v1 tem uma hierarquia separada por controller' },
            { id: 'd', text: 'O v2 exige um daemon dedicado para funcionar' }
          ],
          answer: 'c',
          explanation: 'No v2 todos os controllers compartilham a mesma árvore em /sys/fs/cgroup.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O arquivo cpu.max de um container contém "150000 100000". Quanta CPU ele pode usar?',
          choices: [
            { id: 'a', text: '15% de um núcleo' },
            { id: 'b', text: 'Até 1,5 núcleo' },
            { id: 'c', text: 'Exatamente 1 núcleo, com prioridade 1,5' },
            { id: 'd', text: 'Sem limite, pois 150000 é só o peso' }
          ],
          answer: 'b',
          explanation: 'QUOTA/PERIODO = 150000/100000 = 1,5 CPU.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Um container atinge a cota de CPU de cpu.max antes do fim do período. O que acontece?',
          choices: [
            { id: 'a', text: 'O container é encerrado com código 137' },
            { id: 'b', text: 'Seus processos são pausados até o próximo período (throttling)' },
            { id: 'c', text: 'O kernel aumenta automaticamente a cota' },
            { id: 'd', text: 'O processo é movido para outro host' }
          ],
          answer: 'b',
          explanation: 'Excesso de CPU gera throttling (latência), nunca morte; excesso de memória é que dispara OOM.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o arquivo do cgroup v2 que define o LIMITE RÍGIDO de memória.',
          code: 'echo 268435456 > /sys/fs/cgroup/meu-grupo/___',
          accept: ['memory.max'],
          explanation: 'memory.max é o teto; ao atingi-lo sem recuperação possível, o OOM killer do cgroup entra em ação.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Qual a diferença entre memory.high e memory.max?',
          choices: [
            { id: 'a', text: 'high é para swap e max para RAM, ambos sem matar processos' },
            { id: 'b', text: 'high mata o container e max apenas registra um aviso' },
            { id: 'c', text: 'São sinônimos; só mudam de nome entre v1 e v2' },
            { id: 'd', text: 'high freia o grupo sem matar; max é o teto rígido que pode acionar o OOM killer do cgroup' }
          ],
          answer: 'd',
          explanation: 'memory.high é um limite brando (reclamação e atraso); memory.max é o limite duro.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Com --memory=256m, qual valor o Docker grava em memory.max?',
          choices: [
            { id: 'a', text: '268435456' },
            { id: 'b', text: '256000000' },
            { id: 'c', text: '262144' },
            { id: 'd', text: '256' }
          ],
          answer: 'a',
          explanation: '256 x 1024 x 1024 = 268435456 bytes.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Um container terminou com exit code 137 e OOMKilled=true. Qual a interpretação correta?',
          choices: [
            { id: 'a', text: 'O processo terminou normalmente com sucesso' },
            { id: 'b', text: 'O dockerd reiniciou o container por falta de CPU' },
            { id: 'c', text: 'O OOM killer do cgroup matou o processo (128 + SIGKILL 9) por exceder memory.max' },
            { id: 'd', text: 'Uma porta já estava em uso' }
          ],
          answer: 'c',
          explanation: '137 = 128 + 9 (SIGKILL); OOMKilled confirma que a causa foi memória.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a saída esperada do comando para um host com cgroups v2.',
          code: 'stat -fc %T /sys/fs/cgroup\n# ___',
          accept: ['cgroup2fs'],
          explanation: 'cgroup2fs indica v2 (hierarquia unificada); tmpfs indica o layout do v1.'
        }
      ]
    },
    {
      id: 'cta-03-capabilities-seccomp-lsm',
      title: 'Capabilities, seccomp, AppArmor e SELinux',
      goal: 'Entender como o poder do root é dividido em capabilities e como seccomp e os módulos de segurança do kernel restringem o que um container pode fazer.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Root dividido em capabilities',
            body: 'Historicamente "root" era tudo ou nada. O Linux dividiu o poder do root em dezenas de capabilities, cada uma liberando um tipo de operação privilegiada: CAP_NET_BIND_SERVICE (abrir portas abaixo de 1024), CAP_NET_ADMIN (configurar rede, rotas e firewall), CAP_SYS_ADMIN (a "capability coringa": montar sistemas de arquivos e muito mais), CAP_CHOWN (trocar dono de arquivos), CAP_KILL, CAP_SYS_PTRACE (inspecionar processos) e outras. O usuário root DENTRO de um container sem capabilities extras é bem menos poderoso que o root do host.'
          },
          {
            title: 'O conjunto padrão do Docker',
            body: 'Por padrão o Docker concede um subconjunto pequeno, que inclui CHOWN, DAC_OVERRIDE, FOWNER, SETUID, SETGID, KILL, NET_BIND_SERVICE, NET_RAW, SYS_CHROOT, MKNOD, SETFCAP, SETPCAP, FSETID e AUDIT_WRITE. NÃO estão no padrão: SYS_ADMIN, NET_ADMIN, SYS_PTRACE, SYS_MODULE e similares. Boa prática: remover tudo e adicionar de volta só o necessário (princípio do menor privilégio).',
            code: 'docker run --rm --cap-drop ALL --cap-add NET_BIND_SERVICE app\n# remove todas, devolve apenas a de bind em portas baixas'
          },
          {
            title: 'Lendo as capabilities de um processo',
            body: 'Em /proc/<pid>/status a linha CapEff mostra, em hexadecimal, as capabilities efetivas (CapPrm as permitidas, CapBnd o conjunto limite). Zero em tudo significa nenhuma capability. A ferramenta capsh --decode=<hex> traduz o valor para nomes legíveis.',
            code: 'grep Cap /proc/self/status\n# CapEff: 0000000000000000    <- container com --cap-drop ALL\ncapsh --decode=00000000a80425fb'
          },
          {
            title: 'seccomp: filtro de syscalls',
            body: 'seccomp filtra as chamadas de sistema (syscalls) que um processo pode fazer. O perfil padrão do Docker libera as syscalls comuns e bloqueia as perigosas ou raramente necessárias (como reboot, kexec_load, carregar módulos do kernel, entre outras), respondendo com erro. É ativo por padrão em todo container. Você pode trocar o perfil com --security-opt seccomp=perfil.json; seccomp=unconfined desliga (evite).',
            code: 'docker run --rm --security-opt seccomp=meu-perfil.json app\n# NUNCA em produção:\ndocker run --security-opt seccomp=unconfined app'
          },
          {
            title: 'no-new-privileges',
            body: 'A opção --security-opt no-new-privileges impede que um processo do container ganhe privilégios adicionais via execução de binários setuid/setgid ou file capabilities. Mesmo que exista um binário setuid na imagem, a escalada não ocorre. É uma defesa barata e recomendada para quase toda carga.',
            code: 'docker run --rm --security-opt no-new-privileges:true app'
          },
          {
            title: 'AppArmor e SELinux (LSMs)',
            body: 'AppArmor e SELinux são Linux Security Modules: controle de acesso obrigatório (MAC) aplicado pelo kernel, independente do usuário. O Docker aplica por padrão o perfil AppArmor docker-default em hosts com AppArmor (família Debian/Ubuntu); em hosts com SELinux (família Red Hat), cada container recebe um rótulo próprio, e volumes precisam do sufixo :z (compartilhado) ou :Z (privado) para serem relabelados. Ambos limitam o que arquivos e recursos o container toca mesmo que ele seja root.'
          },
          {
            title: '--privileged: desliga quase tudo',
            body: 'docker run --privileged concede TODAS as capabilities, dá acesso a todos os dispositivos do host e desativa os perfis seccomp e AppArmor padrão. Na prática, o root do container pode montar discos do host e escapar do isolamento. Só use em casos muito específicos (ex.: Docker-in-Docker de CI controlado) e prefira --cap-add e --device pontuais.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que são capabilities no Linux?',
          choices: [
            { id: 'a', text: 'Limites de CPU e memória aplicados a processos' },
            { id: 'b', text: 'Permissões de leitura e escrita de arquivos por usuário' },
            { id: 'c', text: 'Regras de firewall por container' },
            { id: 'd', text: 'Divisões granulares dos privilégios do root, concedidas individualmente a um processo' }
          ],
          answer: 'd',
          explanation: 'Capabilities fatiam o poder do root (ex.: CAP_NET_ADMIN, CAP_CHOWN).'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual capability permite a um processo não-root abrir a porta 80 dentro do container?',
          choices: [
            { id: 'a', text: 'CAP_NET_ADMIN' },
            { id: 'b', text: 'CAP_NET_BIND_SERVICE' },
            { id: 'c', text: 'CAP_SYS_ADMIN' },
            { id: 'd', text: 'CAP_KILL' }
          ],
          answer: 'b',
          explanation: 'CAP_NET_BIND_SERVICE libera portas abaixo de 1024; NET_ADMIN é para configurar a rede.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Um container mostra CapEff: 0000000000000000 em /proc/self/status. O que isso indica?',
          choices: [
            { id: 'a', text: 'O processo não tem nenhuma capability efetiva' },
            { id: 'b', text: 'O processo tem todas as capabilities' },
            { id: 'c', text: 'O seccomp está desligado' },
            { id: 'd', text: 'O container roda com --privileged' }
          ],
          answer: 'a',
          explanation: 'Todos os bits em zero = conjunto vazio de capabilities efetivas.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a flag que remove todas as capabilities antes de adicionar só a necessária.',
          code: 'docker run --cap-drop ___ --cap-add NET_BIND_SERVICE app',
          accept: ['ALL', 'all'],
          explanation: '--cap-drop ALL parte de zero; depois --cap-add devolve apenas o que a aplicação precisa.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Qual é a função do perfil seccomp padrão do Docker?',
          choices: [
            { id: 'a', text: 'Limitar a memória do container' },
            { id: 'b', text: 'Criptografar o tráfego de rede entre containers' },
            { id: 'c', text: 'Bloquear chamadas de sistema perigosas ou raramente necessárias' },
            { id: 'd', text: 'Assinar as imagens antes da execução' }
          ],
          answer: 'c',
          explanation: 'seccomp filtra syscalls; o perfil padrão libera as comuns e nega as de alto risco.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que faz --security-opt no-new-privileges?',
          choices: [
            { id: 'a', text: 'Impede o container de criar novos processos' },
            { id: 'b', text: 'Remove o usuário root da imagem' },
            { id: 'c', text: 'Impede ganhar privilégios novos por binários setuid/setgid ou file capabilities' },
            { id: 'd', text: 'Bloqueia todas as conexões de rede de saída' }
          ],
          answer: 'c',
          explanation: 'Mesmo com binário setuid na imagem, a elevação de privilégio não acontece.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual efeito de docker run --privileged?',
          choices: [
            { id: 'a', text: 'Concede todas as capabilities e acesso a dispositivos, e desativa seccomp e AppArmor padrão' },
            { id: 'b', text: 'Apenas permite ao container usar a porta 80' },
            { id: 'c', text: 'Executa o container com mais memória' },
            { id: 'd', text: 'Ativa o SELinux em modo estrito' }
          ],
          answer: 'a',
          explanation: 'É quase o oposto de hardening: o container ganha poder próximo ao do root do host.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a opção de segurança que impede ganhar privilégios novos via binários setuid.',
          code: 'docker run --security-opt ___:true app',
          accept: ['no-new-privileges'],
          explanation: 'no-new-privileges bloqueia a elevação de privilégio por setuid/setgid e file capabilities.'
        }
      ]
    },
    {
      id: 'cta-04-runtime-containerd-runc',
      title: 'A pilha de runtime: containerd, shim e runc',
      goal: 'Conhecer as camadas entre o comando docker e o kernel, o formato OCI de runtime e as alternativas de sandbox.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Do docker ao kernel: a cadeia',
            body: 'Ao rodar docker run, o CLI fala com o dockerd (a API do Docker); este delega a containerd, que gerencia imagens, snapshots e ciclo de vida; o containerd inicia um containerd-shim por container; o shim chama o runc, que de fato cria namespaces, cgroups, monta o rootfs, aplica seccomp/capabilities e dá exec no processo. Depois o runc termina; o shim permanece como pai do processo. Cada camada tem um papel e pode ser trocada ou usada isoladamente.',
            code: 'docker CLI -> dockerd -> containerd -> containerd-shim-runc-v2 -> runc -> processo do container\nps -ef --forest | grep -E \'containerd|runc\''
          },
          {
            title: 'Por que existe o shim',
            body: 'O shim fica como processo pai do container depois que o runc sai. Ele mantém stdin/stdout abertos, coleta o código de saída e permite que o dockerd/containerd sejam reiniciados SEM matar os containers em execução (daemonless containers). Também evita um processo runc residente por container.'
          },
          {
            title: 'OCI Runtime Spec e config.json',
            body: 'A OCI (Open Container Initiative) padroniza o contrato entre o gerenciador e o runtime. Um "bundle" OCI é um diretório com um rootfs/ e um arquivo config.json que descreve o container: ociVersion, process (args, env, cwd, user, capabilities), root (caminho do rootfs, readonly), mounts, hostname e a seção linux (namespaces, cgroupsPath, resources, seccomp). Qualquer runtime compatível executa o mesmo bundle. O runc gera um modelo com runc spec.',
            code: 'mkdir bundle && cd bundle\nrunc spec          # gera config.json padrão\n# {"ociVersion": "...", "process": {...}, "root": {"path": "rootfs"}, "linux": {"namespaces": [...]}}\nrunc run meu-container'
          },
          {
            title: 'CRI e Kubernetes',
            body: 'A CRI (Container Runtime Interface) é a API pela qual o kubelet do Kubernetes controla um runtime de alto nível. containerd (com plugin CRI) e CRI-O implementam a CRI. O Kubernetes removeu o dockershim, então hoje o kubelet fala direto com containerd ou CRI-O; imagens construídas com Docker continuam funcionando porque seguem o padrão OCI. Distinção: CRI fica entre o orquestrador e o runtime de alto nível; a OCI Runtime Spec fica entre este e o runtime de baixo nível (runc).'
          },
          {
            title: 'Runtimes alternativos',
            body: 'Como o contrato é a OCI, dá para trocar o runc: crun (escrito em C, leve e rápido na inicialização), gVisor (runsc: um kernel em espaço de usuário que intercepta as syscalls do container, reduzindo a superfície exposta ao kernel real) e Kata Containers (cada container/pod roda dentro de uma micro-VM com kernel próprio, dando isolamento de hardware). No Docker, registre o runtime no daemon.json e escolha por container com --runtime.',
            code: 'docker run --rm --runtime=runsc alpine dmesg\n# daemon.json: {"runtimes": {"runsc": {"path": "/usr/local/bin/runsc"}}}\ndocker info | grep -i runtime'
          },
          {
            title: 'Quando usar sandbox',
            body: 'Containers comuns compartilham o kernel do host: uma vulnerabilidade de kernel pode permitir fuga. Sandbox (gVisor, Kata) é indicado para código não confiável ou multi-tenant (plataformas que executam código de clientes, CI de terceiros). O custo: sobrecarga de desempenho (principalmente I/O e syscalls no gVisor) e compatibilidade parcial. Para cargas internas confiáveis, runc com hardening costuma bastar.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual é a ordem correta da cadeia ao rodar um container com Docker?',
          choices: [
            { id: 'a', text: 'docker CLI -> runc -> containerd -> dockerd -> shim' },
            { id: 'b', text: 'dockerd -> docker CLI -> shim -> containerd -> runc' },
            { id: 'c', text: 'containerd -> docker CLI -> runc -> dockerd -> shim' },
            { id: 'd', text: 'docker CLI -> dockerd -> containerd -> shim -> runc' }
          ],
          answer: 'd',
          explanation: 'O runc fica na ponta, falando com o kernel; o CLI fica na ponta oposta.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual componente realmente cria os namespaces e cgroups e executa o processo do container?',
          choices: [
            { id: 'a', text: 'dockerd' },
            { id: 'b', text: 'runc' },
            { id: 'c', text: 'containerd-shim' },
            { id: 'd', text: 'docker CLI' }
          ],
          answer: 'b',
          explanation: 'O runc é o runtime de baixo nível que implementa a OCI Runtime Spec.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual a principal razão de existir o containerd-shim?',
          choices: [
            { id: 'a', text: 'Compilar o Dockerfile' },
            { id: 'b', text: 'Traduzir comandos Docker para Kubernetes' },
            { id: 'c', text: 'Aplicar o perfil seccomp padrão' },
            { id: 'd', text: 'Manter o container vivo e coletar a saída mesmo se o dockerd/containerd reiniciarem' }
          ],
          answer: 'd',
          explanation: 'O shim é pai do processo após o runc sair, preservando stdio e código de saída.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o nome do arquivo, dentro do bundle OCI, que descreve o container para o runtime.',
          code: 'ls bundle/\n# rootfs/  ___',
          accept: ['config.json'],
          explanation: 'O bundle OCI = rootfs/ + config.json.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que é a CRI (Container Runtime Interface)?',
          choices: [
            { id: 'a', text: 'A API entre o kubelet do Kubernetes e o runtime de alto nível, como containerd ou CRI-O' },
            { id: 'b', text: 'O formato do arquivo config.json' },
            { id: 'c', text: 'O padrão de empacotamento de imagens' },
            { id: 'd', text: 'Um driver de rede para containers' }
          ],
          answer: 'a',
          explanation: 'CRI liga orquestrador e runtime; a OCI Runtime Spec liga runtime de alto e baixo nível.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual alternativa descreve o gVisor (runsc)?',
          choices: [
            { id: 'a', text: 'Uma micro-VM com kernel Linux próprio para cada container' },
            { id: 'b', text: 'Um compilador de Dockerfile em C' },
            { id: 'c', text: 'Um kernel em espaço de usuário que intercepta as syscalls do container' },
            { id: 'd', text: 'Um registry de imagens assinado' }
          ],
          answer: 'c',
          explanation: 'Kata usa micro-VMs; gVisor reimplementa a interface de syscalls em espaço de usuário.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Em qual situação sandbox como gVisor ou Kata é mais justificado?',
          choices: [
            { id: 'a', text: 'Rodar um banco de dados interno com máxima performance de disco' },
            { id: 'b', text: 'Executar código não confiável ou multi-tenant que compartilharia o kernel do host' },
            { id: 'c', text: 'Reduzir o tamanho da imagem' },
            { id: 'd', text: 'Acelerar o build do Dockerfile' }
          ],
          answer: 'b',
          explanation: 'Sandbox reduz o risco de fuga via kernel ao custo de desempenho e compatibilidade.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a flag que escolhe o runtime gVisor em um container específico.',
          code: 'docker run --rm --___=runsc alpine uname -a',
          accept: ['runtime', '--runtime'],
          explanation: '--runtime seleciona um runtime previamente registrado no daemon.json.'
        }
      ]
    },
    {
      id: 'cta-05-overlayfs-storage',
      title: 'Camadas por dentro: overlay2 e storage drivers',
      goal: 'Entender como o overlay2 empilha camadas, como funciona copy-on-write e por que cargas de I/O pesado pedem volumes.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O que o overlay2 faz',
            body: 'O storage driver padrão do Docker na maioria dos hosts Linux é o overlay2, baseado no OverlayFS do kernel. Ele monta várias pastas empilhadas como UM único diretório. As camadas da imagem são pastas somente leitura no host; o container ganha uma camada fina gravável por cima. Dentro de /var/lib/docker/overlay2/ há uma pasta por camada (nome é um hash), normalmente com subpastas como diff (o conteúdo da camada) e, para as camadas do container, também merged e work.',
            code: 'docker info | grep -E \'Storage Driver|Backing Filesystem\'\n# Storage Driver: overlay2\n# Backing Filesystem: extfs\nls /var/lib/docker/overlay2/<id>/\n# diff  link  lower  merged  work'
          },
          {
            title: 'lowerdir, upperdir, workdir e merged',
            body: 'Um mount overlay tem quatro peças: lowerdir (uma ou mais camadas SOMENTE LEITURA, separadas por ":", a primeira é a mais alta), upperdir (a camada gravável, onde vão todas as escritas), workdir (diretório de trabalho interno do overlay, precisa estar no mesmo sistema de arquivos do upperdir) e merged (a visão unificada que o container enxerga como seu "/"). Você pode ver isso em mount ou nas opções do mount do container.',
            code: 'mount | grep overlay\n# overlay on /var/lib/docker/overlay2/<id>/merged type overlay\n#   (lowerdir=/var/lib/docker/overlay2/l/AAA:/var/lib/docker/overlay2/l/BBB,\n#    upperdir=/var/lib/docker/overlay2/<id>/diff,\n#    workdir=/var/lib/docker/overlay2/<id>/work)'
          },
          {
            title: 'Copy-on-write e a primeira escrita',
            body: 'Ler um arquivo vem da camada onde ele existe, sem custo extra. Na PRIMEIRA escrita em um arquivo que mora em uma camada de baixo, o overlay faz copy-up: copia o arquivo INTEIRO para o upperdir e só então aplica a modificação. Em um arquivo de vários GB, alterar 1 byte já copia tudo na primeira vez (latência e espaço). Depois do copy-up, as escritas seguintes são normais. Por isso evitar escrever em arquivos grandes que vêm da imagem.'
          },
          {
            title: 'Whiteouts: como apagar em camadas read-only',
            body: 'Camadas de baixo nunca mudam; então apagar um arquivo que existe nelas é feito criando um whiteout no upperdir: um arquivo especial (dispositivo de caractere 0/0) com o mesmo nome, que "esconde" o arquivo de baixo na visão merged. Para apagar um diretório inteiro e recriar vazio usa-se um marcador "opaque" no diretório. Consequência prática: apagar um arquivo em um RUN posterior NÃO reduz o tamanho da imagem, porque o dado continua na camada anterior. O comando docker diff mostra as mudanças do container (A adicionado, C alterado, D apagado).',
            code: 'docker exec web rm /etc/nginx/nginx.conf\ndocker diff web\n# C /etc/nginx\n# D /etc/nginx/nginx.conf'
          },
          {
            title: 'Inodes e espaço',
            body: 'Cada arquivo em cada camada consome um inode do sistema de arquivos de suporte (backing filesystem). Muitas imagens com muitos arquivos pequenos (node_modules, por exemplo) podem esgotar os inodes de /var/lib/docker antes do espaço em disco: o sintoma é "no space left on device" mesmo com df mostrando espaço livre; confirme com df -i. O overlay2 exige um backing filesystem compatível (ex.: ext4 ou xfs com d_type habilitado).',
            code: 'df -h /var/lib/docker   # espaço: 40% usado\ndf -i /var/lib/docker   # inodes: 100% usado  <- causa do erro'
          },
          {
            title: 'Por que volumes para I/O pesado',
            body: 'Escritas na camada do container passam pelo overlay (copy-up, lookup em várias camadas, mais metadados), o que custa desempenho e ainda se perde quando o container é removido. Volumes e bind mounts NÃO passam pelo overlay: são montados direto do sistema de arquivos do host dentro do container. Bancos de dados, filas e logs de alto volume devem usar volumes para ter I/O próximo do nativo e dados persistentes.',
            code: 'docker run -d -v pgdata:/var/lib/postgresql/data postgres   # I/O direto no host, fora do overlay'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'No overlay2, onde o container grava suas alterações?',
          choices: [
            { id: 'a', text: 'Diretamente nas camadas da imagem, alterando-as' },
            { id: 'b', text: 'No upperdir, uma camada fina gravável por cima das camadas somente leitura' },
            { id: 'c', text: 'No workdir, que guarda os dados definitivos' },
            { id: 'd', text: 'Somente em memória RAM' }
          ],
          answer: 'b',
          explanation: 'As camadas de imagem (lowerdir) são imutáveis; o upperdir recebe todas as escritas.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual é o papel do campo merged?',
          choices: [
            { id: 'a', text: 'Guarda apenas os arquivos apagados' },
            { id: 'b', text: 'Armazena os metadados do registry' },
            { id: 'c', text: 'É o diretório de trabalho temporário do kernel' },
            { id: 'd', text: 'É a visão unificada das camadas que o container enxerga como seu sistema de arquivos raiz' }
          ],
          answer: 'd',
          explanation: 'merged = lowerdirs + upperdir sobrepostos.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Um arquivo de 2 GB existe na imagem e o container altera 1 byte dele pela primeira vez. O que o overlay faz?',
          choices: [
            { id: 'a', text: 'Copia o arquivo inteiro (2 GB) para o upperdir antes de aplicar a escrita' },
            { id: 'b', text: 'Escreve só o byte alterado no upperdir' },
            { id: 'c', text: 'Recusa a escrita porque a camada é somente leitura' },
            { id: 'd', text: 'Move o arquivo para o workdir e o apaga da imagem' }
          ],
          answer: 'a',
          explanation: 'Isso é o copy-up: custo na primeira escrita, grande para arquivos grandes.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o nome do diretório do mount overlay que recebe as escritas.',
          code: 'overlay ... lowerdir=/l/A:/l/B,___=/o/diff,workdir=/o/work',
          accept: ['upperdir'],
          explanation: 'upperdir é a camada gravável; lowerdir são as somente leitura; workdir é interno do overlay.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Você apaga um arquivo de 500 MB em um RUN posterior do Dockerfile. O que acontece com o tamanho da imagem?',
          choices: [
            { id: 'a', text: 'Diminui 500 MB, pois o arquivo é removido do disco' },
            { id: 'b', text: 'Diminui metade, pela compressão' },
            { id: 'c', text: 'Não diminui: um whiteout esconde o arquivo, mas o dado continua na camada anterior' },
            { id: 'd', text: 'O build falha por conflito de camadas' }
          ],
          answer: 'c',
          explanation: 'Camadas são imutáveis; apagar só cria um whiteout na camada nova.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O container retorna "no space left on device", mas df -h mostra espaço livre em /var/lib/docker. Qual verificação faz sentido?',
          choices: [
            { id: 'a', text: 'docker login, pois falta autenticação' },
            { id: 'b', text: 'docker network prune, pois a rede está cheia' },
            { id: 'c', text: 'Aumentar --memory do container' },
            { id: 'd', text: 'df -i, pois os inodes podem ter acabado' }
          ],
          answer: 'd',
          explanation: 'Muitos arquivos pequenos esgotam inodes antes do espaço em bytes.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que bancos de dados devem usar volumes em vez da camada gravável do container?',
          choices: [
            { id: 'a', text: 'Volumes são sempre criptografados e a camada não' },
            { id: 'b', text: 'Volumes ficam fora do overlay, com I/O próximo do nativo e dados que sobrevivem à remoção do container' },
            { id: 'c', text: 'A camada do container não aceita arquivos maiores que 1 GB' },
            { id: 'd', text: 'Volumes dispensam permissões de arquivo' }
          ],
          answer: 'b',
          explanation: 'Evitam copy-up e overhead do overlay, além de persistirem.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o comando que lista as mudanças (A, C, D) feitas na camada gravável do container web.',
          code: 'docker ___ web',
          accept: ['diff'],
          explanation: 'docker diff mostra arquivos adicionados (A), alterados (C) e apagados (D).'
        }
      ]
    },
    {
      id: 'cta-06-rootless-userns',
      title: 'Rootless e user namespaces',
      goal: 'Entender o mapeamento de UID/GID dos user namespaces, o userns-remap e o Docker rootless e por que reduzem o impacto de uma fuga.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O problema: root do container é root do host?',
            body: 'Por padrão, o UID 0 dentro do container é o UID 0 do host, restrito apenas por capabilities, seccomp e LSMs. Se um atacante escapar do container, ele chega ao host como root de verdade. O user namespace resolve isto traduzindo IDs: o UID 0 dentro do container corresponde a um UID sem privilégios fora dele.'
          },
          {
            title: 'Mapeamento em /proc/<pid>/uid_map',
            body: 'O arquivo /proc/<pid>/uid_map tem linhas com três números: UID_inicial_dentro, UID_inicial_fora, tamanho. A linha "0 100000 65536" significa: os UIDs 0..65535 dentro correspondem a 100000..165535 fora; o UID 1000 de dentro é o 101000 no host (100000 + 1000). gid_map faz o mesmo para grupos. Arquivos criados pelo container aparecem no host com o dono traduzido.',
            code: 'cat /proc/48213/uid_map\n#          0     100000      65536\n# dentro 0   -> fora 100000\n# dentro 1000 -> fora 101000'
          },
          {
            title: '/etc/subuid e /etc/subgid',
            body: 'Um usuário comum só pode mapear faixas de UIDs/GIDs que o administrador reservou para ele em /etc/subuid e /etc/subgid, no formato usuario:inicio:quantidade. Por exemplo "alice:100000:65536" reserva 65536 IDs a partir de 100000. Esses arquivos são a base tanto do userns-remap quanto do modo rootless.',
            code: 'cat /etc/subuid\n# alice:100000:65536\n# dockremap:165536:65536'
          },
          {
            title: 'userns-remap no daemon',
            body: 'Com "userns-remap" no /etc/docker/daemon.json, o daemon (ainda rodando como root) executa todos os containers em um user namespace, mapeando o root do container para um UID alto de uma faixa do subuid (com o valor default, o Docker cria o usuário dockremap). Reduz o impacto de fuga, mas tem restrições: volumes e arquivos precisam de permissões coerentes com a faixa mapeada e algumas flags (como --privileged ou --net=host) conflitam com o modo.',
            code: '{\n  "userns-remap": "default"\n}'
          },
          {
            title: 'Docker rootless',
            body: 'No modo rootless, o PRÓPRIO daemon e os containers rodam sob um usuário comum, sem root em nenhum ponto (instalação via dockerd-rootless-setuptool.sh install). Isso protege até contra vulnerabilidades do daemon. O socket fica no diretório de runtime do usuário, e o cliente aponta para ele com DOCKER_HOST. Em outras palavras: mesmo que o container e o daemon sejam comprometidos, o atacante tem só os privilégios daquele usuário comum.',
            code: 'dockerd-rootless-setuptool.sh install\nexport DOCKER_HOST=unix:///run/user/1000/docker.sock\ndocker run --rm alpine id'
          },
          {
            title: 'Limitações do rootless',
            body: 'Portas abaixo de 1024 não podem ser abertas por padrão (ajuste o sysctl net.ipv4.ip_unprivileged_port_start); a rede passa por um componente em espaço de usuário (como slirp4netns ou rootlesskit), o que reduz o desempenho de rede; limites de cgroups exigem cgroups v2 com delegação (via systemd) ao usuário; alguns storage drivers e recursos (como certos modos de rede e AppArmor) têm restrições. É uma troca consciente: mais segurança, menos recursos.',
            code: 'sudo sysctl net.ipv4.ip_unprivileged_port_start=80   # permite bind em 80 sem root'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual é o risco de um container rodar com UID 0 SEM user namespace?',
          choices: [
            { id: 'a', text: 'Se houver fuga, o atacante chega ao host como root real' },
            { id: 'b', text: 'O container não consegue ler arquivos da imagem' },
            { id: 'c', text: 'O Docker recusa iniciar o processo' },
            { id: 'd', text: 'A rede do container fica sem rota' }
          ],
          answer: 'a',
          explanation: 'Sem remapeamento, o UID 0 do container é o UID 0 do host.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Em uid_map, a linha "0 100000 65536" está ativa. Qual UID do host corresponde ao UID 1000 dentro do container?',
          choices: [
            { id: 'a', text: '1000' },
            { id: 'b', text: '100000' },
            { id: 'c', text: '101000' },
            { id: 'd', text: '165536' }
          ],
          answer: 'c',
          explanation: '100000 + 1000 = 101000.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual o conteúdo de /etc/subuid?',
          choices: [
            { id: 'a', text: 'Lista de usuários com permissão de sudo' },
            { id: 'b', text: 'Hashes de senha dos usuários' },
            { id: 'c', text: 'Faixas de UIDs que cada usuário pode usar para mapeamento (usuario:inicio:quantidade)' },
            { id: 'd', text: 'UIDs reservados para o kernel' }
          ],
          answer: 'c',
          explanation: 'Define quais IDs subordinados o usuário pode mapear em user namespaces.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o nome do arquivo que reserva faixas de GIDs subordinados (par do subuid).',
          code: 'cat /etc/___\n# alice:100000:65536',
          accept: ['subgid', '/etc/subgid'],
          explanation: '/etc/subgid é para grupos o que /etc/subuid é para usuários.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Qual a diferença entre userns-remap e Docker rootless?',
          choices: [
            { id: 'a', text: 'No userns-remap o daemon ainda roda como root; no rootless daemon e containers rodam sem root' },
            { id: 'b', text: 'São o mesmo recurso com nomes diferentes' },
            { id: 'c', text: 'userns-remap roda sem root e o rootless exige root' },
            { id: 'd', text: 'O rootless só funciona em Windows' }
          ],
          answer: 'a',
          explanation: 'Rootless remove o root também do daemon.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual é uma limitação típica do Docker rootless?',
          choices: [
            { id: 'a', text: 'Não poder usar imagens de registries' },
            { id: 'b', text: 'Não suportar volumes de nenhum tipo' },
            { id: 'c', text: 'Executar apenas uma vez por host' },
            { id: 'd', text: 'Não abrir portas abaixo de 1024 sem ajustar o sysctl, além de rede em espaço de usuário mais lenta' }
          ],
          answer: 'd',
          explanation: 'Por padrão usuários comuns não fazem bind em portas baixas.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que user namespaces reduzem o impacto de uma fuga de container?',
          choices: [
            { id: 'a', text: 'Eles criptografam o sistema de arquivos do container' },
            { id: 'b', text: 'O root do container corresponde a um UID sem privilégios no host' },
            { id: 'c', text: 'Eles impedem qualquer syscall' },
            { id: 'd', text: 'Eles desligam o acesso à rede' }
          ],
          answer: 'b',
          explanation: 'Quem escapa herda apenas o UID mapeado, sem privilégios.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a chave do daemon.json que ativa o remapeamento de user namespace.',
          code: '{ "___": "default" }',
          accept: ['userns-remap'],
          explanation: 'userns-remap com o valor default usa o usuário dockremap e as faixas de subuid/subgid.'
        }
      ]
    },
    {
      id: 'cta-07-podman-ecossistema',
      title: 'Podman e o ecossistema de containers',
      goal: 'Conhecer Podman, Buildah, Skopeo, Quadlet e containerd/nerdctl e saber quando cada um faz sentido em relação ao Docker.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Podman: sem daemon',
            body: 'O Podman executa containers sem um daemon central: cada comando faz fork/exec direto (usando um runtime OCI como crun ou runc), então não há um processo root permanente nem um socket único que concentre poder. O container é filho do processo do usuário (monitorado por um pequeno processo conmon). Vantagens: menos superfície de ataque e integração natural com o systemd.'
          },
          {
            title: 'Rootless por padrão e compatibilidade',
            body: 'O Podman foi pensado para rodar rootless por padrão, usando user namespaces e /etc/subuid, /etc/subgid. A CLI é intencionalmente compatível com a do Docker: podman run, build, ps, images, pull, push têm as mesmas flags principais, e muitos usam alias docker=podman. Existe suporte a Compose (via podman compose ou podman-compose) e um socket de API compatível com o Docker, opcional, para ferramentas que o exigem.',
            code: 'alias docker=podman\ndocker run --rm -p 8080:80 nginx   # executa o Podman, rootless'
          },
          {
            title: 'Pods',
            body: 'Um pod no Podman é um grupo de containers que compartilham namespaces (rede e IPC, por exemplo), igual ao pod do Kubernetes: dentro dele, os containers conversam por localhost. Dá para gerar YAML Kubernetes a partir de containers/pods existentes (podman generate kube) e rodar YAML do Kubernetes localmente (podman kube play), facilitando o caminho de desenvolvimento para o cluster.',
            code: 'podman pod create --name app -p 8080:80\npodman run -d --pod app nginx\npodman run -d --pod app redis\npodman generate kube app > app.yaml'
          },
          {
            title: 'Buildah e Skopeo',
            body: 'Buildah constrói imagens OCI sem daemon, com Dockerfile/Containerfile ou comandos passo a passo (buildah from, run, commit), útil em pipelines. Skopeo manipula imagens e registries SEM daemon e sem baixar para o disco local: inspecionar metadados remotos (skopeo inspect), copiar entre registries (skopeo copy) e sincronizar. Ambos fazem parte da mesma família de ferramentas que o Podman.',
            code: 'skopeo inspect docker://alpine:latest\nskopeo copy docker://alpine:latest docker://registry.interno.example/alpine:latest\nbuildah bud -t app:1.0 .'
          },
          {
            title: 'Quadlet e systemd',
            body: 'Quadlet permite descrever containers como arquivos declarativos do systemd: você cria, por exemplo, ~/.config/containers/systemd/web.container (ou /etc/containers/systemd/ para o sistema) com seções [Container] e [Install], e o gerador do Podman converte em unidades .service. Assim o systemd cuida de iniciar no boot, reiniciar e logar (journalctl), sem daemon. Há extensões também para volumes, redes e pods.',
            code: '# ~/.config/containers/systemd/web.container\n[Container]\nImage=docker.io/library/nginx:stable\nPublishPort=8080:80\n\n[Install]\nWantedBy=default.target'
          },
          {
            title: 'Docker vs Podman vs containerd/nerdctl',
            body: 'Docker: ecossistema mais amplo (Desktop, Compose, Buildx), daemon único. Podman: sem daemon, rootless por padrão, ótimo em servidores Linux e em ambientes que priorizam segurança e systemd. containerd com nerdctl: nerdctl é uma CLI compatível com a do Docker que fala direto com o containerd, usada em infraestrutura e em Kubernetes. Como tudo segue o padrão OCI, as imagens são portáveis entre eles. A escolha depende de segurança, ferramentas de equipe e integração (Kubernetes, systemd, CI).'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual a principal diferença arquitetural do Podman em relação ao Docker?',
          choices: [
            { id: 'a', text: 'Só roda containers Windows' },
            { id: 'b', text: 'Usa máquinas virtuais completas por container' },
            { id: 'c', text: 'Exige um registry próprio' },
            { id: 'd', text: 'Não usa um daemon central permanente: cada comando executa o container diretamente' }
          ],
          answer: 'd',
          explanation: 'Sem daemon, não existe um processo root único concentrando o poder.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Como é possível reaproveitar muitos comandos Docker com o Podman?',
          choices: [
            { id: 'a', text: 'A CLI do Podman é compatível, e muitos usam alias docker=podman' },
            { id: 'b', text: 'O Podman converte automaticamente o Dockerfile em Kubernetes' },
            { id: 'c', text: 'Basta renomear o binário do dockerd' },
            { id: 'd', text: 'Não é possível; os comandos são totalmente diferentes' }
          ],
          answer: 'a',
          explanation: 'A compatibilidade da CLI é um objetivo do projeto.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que é um pod no Podman?',
          choices: [
            { id: 'a', text: 'Uma imagem base compartilhada entre hosts' },
            { id: 'b', text: 'Um tipo de volume' },
            { id: 'c', text: 'Um grupo de containers que compartilham namespaces, como rede, comunicando-se via localhost' },
            { id: 'd', text: 'Um plugin de logs' }
          ],
          answer: 'c',
          explanation: 'O conceito é o mesmo do pod do Kubernetes.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a ferramenta que inspeciona uma imagem de registry sem daemon e sem baixá-la.',
          code: '___ inspect docker://alpine:latest',
          accept: ['skopeo'],
          explanation: 'Skopeo inspeciona, copia e sincroniza imagens entre registries sem precisar de daemon.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Para que serve o Buildah?',
          choices: [
            { id: 'a', text: 'Orquestrar clusters de containers' },
            { id: 'b', text: 'Construir imagens OCI sem daemon, por Containerfile ou comandos passo a passo' },
            { id: 'c', text: 'Assinar imagens com cosign' },
            { id: 'd', text: 'Medir o consumo de CPU de containers' }
          ],
          answer: 'b',
          explanation: 'Buildah foca na construção de imagens; não é orquestrador nem assinador.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que o Quadlet faz?',
          choices: [
            { id: 'a', text: 'Compila código Go em containers' },
            { id: 'b', text: 'Converte arquivos declarativos (como web.container) em unidades systemd para rodar containers do Podman' },
            { id: 'c', text: 'Cria redes overlay entre hosts' },
            { id: 'd', text: 'Substitui o runc' }
          ],
          answer: 'b',
          explanation: 'Integra containers ao systemd: boot, reinício e logs via journal.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual afirmação sobre nerdctl está correta?',
          choices: [
            { id: 'a', text: 'É um daemon que substitui o containerd' },
            { id: 'b', text: 'É o runtime de baixo nível equivalente ao runc' },
            { id: 'c', text: 'É um registry de imagens' },
            { id: 'd', text: 'É uma CLI compatível com a do Docker que fala direto com o containerd' }
          ],
          answer: 'd',
          explanation: 'nerdctl dá a experiência do Docker sobre o containerd.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o alias que faz comandos docker executarem o Podman.',
          code: 'alias docker=___',
          accept: ['podman'],
          explanation: 'Como a CLI é compatível, o alias costuma funcionar para o uso básico.'
        }
      ]
    },
    {
      id: 'cta-08-oci-image-spec',
      title: 'Especificação de imagem OCI e como o pull funciona',
      goal: 'Entender manifest, config, camadas, digests e image index da OCI e o caminho exato que um docker pull percorre.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Imagem = manifest + config + camadas',
            body: 'Pela OCI Image Spec, uma imagem é composta por: um manifest (JSON que lista as partes), um config (JSON com metadados de execução e do sistema de arquivos) e uma ou mais camadas (blobs, cada uma um arquivo tar comprimido). Tudo é armazenado como blobs endereçados pelo hash do conteúdo. O manifest referencia o config e as camadas pelos seus digests.',
            code: '{\n  "schemaVersion": 2,\n  "mediaType": "application/vnd.oci.image.manifest.v1+json",\n  "config": { "mediaType": "application/vnd.oci.image.config.v1+json", "digest": "sha256:aaa...", "size": 1469 },\n  "layers": [\n    { "mediaType": "application/vnd.oci.image.layer.v1.tar+gzip", "digest": "sha256:bbb...", "size": 3400000 }\n  ]\n}'
          },
          {
            title: 'Digest e endereçamento por conteúdo',
            body: 'Um digest tem o formato algoritmo:hex, como sha256: seguido de 64 caracteres hexadecimais, calculado sobre os bytes do blob. Mesmo conteúdo = mesmo digest; qualquer byte diferente muda o digest. Isso torna blobs imutáveis e verificáveis (o cliente confere o hash ao baixar), permite cache e deduplicação entre imagens e permite referenciar uma imagem de forma exata: nome@sha256:... nunca muda, ao contrário de uma tag.',
            code: 'docker pull alpine@sha256:<64 hex>\n# o ID da imagem no Docker é o digest do config'
          },
          {
            title: 'Camadas: tar + compressão',
            body: 'Cada camada é um tar das mudanças de sistema de arquivos em relação à anterior (arquivos novos, alterados e whiteouts para remoções), comprimido, normalmente com gzip (media type application/vnd.oci.image.layer.v1.tar+gzip) ou zstd (...tar+zstd). Importante: o digest listado no manifest é o do blob COMPRIMIDO; o config lista em rootfs.diff_ids os digests das camadas DESCOMPRIMIDAS (diff IDs).'
          },
          {
            title: 'O config da imagem',
            body: 'O blob de config contém: architecture e os (plataforma), config (Env, Cmd, Entrypoint, WorkingDir, User, ExposedPorts, Labels), rootfs (type "layers" e a lista diff_ids na ordem) e history (um registro por instrução de build). É o config que diz COMO executar a imagem; o manifest diz ONDE estão os blobs.'
          },
          {
            title: 'Image index (multi-arch)',
            body: 'Para suportar várias plataformas com um mesmo nome:tag, existe o image index (application/vnd.oci.image.index.v1+json): uma lista "manifests" em que cada item aponta, por digest, para o manifest de uma plataforma, com um campo platform (architecture, os). O cliente escolhe a entrada que bate com a sua máquina. No Docker, o equivalente histórico é a manifest list. Inspecione com docker buildx imagetools inspect.',
            code: 'docker buildx imagetools inspect alpine\n# Manifests:\n#   Platform: linux/amd64\n#   Platform: linux/arm64'
          },
          {
            title: 'Como o docker pull funciona por baixo',
            body: '1) O cliente pede o manifest ao registry (GET /v2/<nome>/manifests/<tag ou digest>). 2) Se vier um index, escolhe o manifest da plataforma e o busca pelo digest. 3) Baixa o config (GET /v2/<nome>/blobs/<digest>). 4) Baixa em paralelo só as camadas que ainda não tem localmente (por digest) e verifica cada hash. 5) Descomprime e registra as camadas no storage. Por isso um pull de imagem parecida é rápido: as camadas iguais já existem.'
          },
          {
            title: 'Artefatos OCI',
            body: 'Como o registry é só um armazenamento de blobs por digest, ele pode guardar outros tipos de conteúdo além de imagens (chamados artefatos OCI): charts Helm, SBOMs, assinaturas, políticas. Um manifest pode usar artifactType e um campo subject para se associar a outra imagem (a API de referrers lista o que aponta para um digest). É a base para guardar assinaturas e SBOMs ao lado da imagem. Ferramentas como ORAS publicam artefatos genéricos.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Quais são os três componentes de uma imagem segundo a OCI Image Spec?',
          choices: [
            { id: 'a', text: 'Manifest, config e camadas' },
            { id: 'b', text: 'Dockerfile, compose e volume' },
            { id: 'c', text: 'Namespace, cgroup e capability' },
            { id: 'd', text: 'Index, kernel e bootloader' }
          ],
          answer: 'a',
          explanation: 'O manifest aponta para o config e para as camadas por digest.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual é o formato correto de um digest OCI?',
          choices: [
            { id: 'a', text: 'Um número de versão como 1.25.3' },
            { id: 'b', text: 'Um UUID gerado pelo registry' },
            { id: 'c', text: 'sha256: seguido de 64 caracteres hexadecimais' },
            { id: 'd', text: 'O nome da imagem em base64' }
          ],
          answer: 'c',
          explanation: 'Digest = algoritmo:hex do conteúdo do blob.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Por que referenciar uma imagem como nome@sha256:... é mais seguro que usar uma tag?',
          choices: [
            { id: 'a', text: 'O digest é menor e baixa mais rápido' },
            { id: 'b', text: 'O digest dispensa autenticação no registry' },
            { id: 'c', text: 'O digest é criptografado com a chave do host' },
            { id: 'd', text: 'O digest identifica o conteúdo exato e não pode ser reapontado, enquanto a tag pode mudar' }
          ],
          answer: 'd',
          explanation: 'Tags são ponteiros mutáveis; digest é função do conteúdo.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o algoritmo de hash usado nos digests de imagens mais comuns.',
          code: 'FROM alpine@___:3b9f...e1',
          accept: ['sha256'],
          explanation: 'Digests típicos usam sha256 (64 hex).'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'No manifest, o digest de uma camada se refere a qual versão do conteúdo?',
          choices: [
            { id: 'a', text: 'Ao conteúdo descomprimido; o comprimido fica no config' },
            { id: 'b', text: 'Ao blob comprimido; os digests descomprimidos (diff_ids) ficam no config' },
            { id: 'c', text: 'Ao nome da tag da camada' },
            { id: 'd', text: 'Ao hash do Dockerfile inteiro' }
          ],
          answer: 'b',
          explanation: 'Manifest -> blob comprimido; config rootfs.diff_ids -> descomprimido.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual a função de um image index?',
          choices: [
            { id: 'a', text: 'Listar manifests por plataforma (os/architecture) sob um mesmo nome:tag, para multi-arch' },
            { id: 'b', text: 'Indexar os arquivos dentro de uma camada' },
            { id: 'c', text: 'Armazenar o cache de build' },
            { id: 'd', text: 'Listar os registries confiáveis' }
          ],
          answer: 'a',
          explanation: 'O cliente escolhe a entrada compatível com sua plataforma.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'No docker pull, em que ordem ocorrem os passos centrais?',
          choices: [
            { id: 'a', text: 'Baixar todas as camadas, depois descobrir o manifest' },
            { id: 'b', text: 'Executar o container, depois baixar as camadas' },
            { id: 'c', text: 'Obter o manifest (ou index), obter o config e baixar apenas as camadas ausentes, verificando os digests' },
            { id: 'd', text: 'Descomprimir tudo em /etc, depois pedir o index' }
          ],
          answer: 'c',
          explanation: 'Primeiro o manifest diz o que existe; depois blobs por digest, só os que faltam.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o subcomando que mostra o index e as plataformas de uma imagem.',
          code: 'docker buildx imagetools ___ alpine',
          accept: ['inspect'],
          explanation: 'imagetools inspect exibe o manifest list/index com todas as plataformas.'
        }
      ]
    },
    {
      id: 'cta-09-registries-avancados',
      title: 'Registries avançados',
      goal: 'Operar um registry próprio com TLS e autenticação, usar cache/mirror, lidar com rate limits e manter o armazenamento sob controle.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Rodando seu próprio registry',
            body: 'A imagem registry:2 (Distribution, a implementação de referência) é um registry completo em um container. Armazena os blobs em um volume (/var/lib/registry por padrão). Registry próprio dá controle de dados, latência baixa e independência de rate limits, mas você assume segurança, backup e manutenção.',
            code: 'docker run -d --name registry -p 5000:5000 -v registry-data:/var/lib/registry registry:2\ndocker tag app:1.0 localhost:5000/app:1.0\ndocker push localhost:5000/app:1.0'
          },
          {
            title: 'TLS e autenticação',
            body: 'Fora de localhost, o Docker exige HTTPS no registry: configure certificado e chave (REGISTRY_HTTP_TLS_CERTIFICATE e REGISTRY_HTTP_TLS_KEY) ou termine o TLS em um proxy reverso. Nunca desative TLS com insecure-registries em produção. Para autenticação básica use htpasswd (REGISTRY_AUTH=htpasswd, REGISTRY_AUTH_HTPASSWD_REALM e REGISTRY_AUTH_HTPASSWD_PATH com senhas em bcrypt), ou autenticação por token/OIDC em soluções maiores. Um registry sem auth e sem TLS permite a qualquer um ler e sobrescrever suas imagens.',
            code: 'docker run -d -p 443:443 -v /certs:/certs -v /auth:/auth \\\n  -e REGISTRY_HTTP_ADDR=0.0.0.0:443 \\\n  -e REGISTRY_HTTP_TLS_CERTIFICATE=/certs/fullchain.pem \\\n  -e REGISTRY_HTTP_TLS_KEY=/certs/privkey.pem \\\n  -e REGISTRY_AUTH=htpasswd -e REGISTRY_AUTH_HTPASSWD_REALM=Registry \\\n  -e REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd registry:2'
          },
          {
            title: 'Pull-through cache (mirror)',
            body: 'O registry:2 pode atuar como cache de pull-through do Docker Hub configurando o proxy remoto (REGISTRY_PROXY_REMOTEURL=https://registry-1.docker.io). Os clientes apontam o daemon para ele com registry-mirrors no daemon.json: o daemon tenta o mirror primeiro e, se falhar, cai para o Hub. O mirror só vale para o Docker Hub (imagens sem prefixo de registry); outros registries precisam ser referenciados explicitamente.',
            code: '# daemon.json do cliente\n{ "registry-mirrors": ["https://mirror.interno.example"] }'
          },
          {
            title: 'Rate limits do Docker Hub',
            body: 'O Docker Hub limita a quantidade de pulls por período, com limites mais altos para usuários autenticados e planos pagos. Em CI, onde muitas máquinas compartilham o mesmo IP, estourar o limite é comum e falha o pipeline. Mitigações: fazer docker login nos pipelines, usar um mirror/cache próprio, copiar as imagens base para seu registry (skopeo copy) e reduzir pulls desnecessários com cache de camadas.'
          },
          {
            title: 'Imutabilidade de tags',
            body: 'Uma tag é um ponteiro mutável: alguém pode dar push de outra imagem para app:1.0. Para garantir reprodutibilidade, use digests em deploys, adote versões únicas (por commit/build) e ative, quando o registry permitir, a política de imutabilidade de tags (por exemplo, nos registries gerenciados da nuvem e em soluções como Harbor), que rejeita a sobrescrita de uma tag existente.'
          },
          {
            title: 'Garbage collection',
            body: 'Apagar uma tag ou manifest não remove os blobs do disco: eles ficam órfãos. No registry:2, habilite a exclusão (REGISTRY_STORAGE_DELETE_ENABLED=true) para permitir deletar manifests pela API e depois execute o garbage collector, que remove blobs sem referência: registry garbage-collect /etc/docker/registry/config.yml. Execute com o registry em modo somente leitura ou parado para evitar apagar blobs de um push em andamento.',
            code: 'docker exec registry registry garbage-collect /etc/docker/registry/config.yml'
          },
          {
            title: 'Replicação, retenção e limpeza',
            body: 'Em operação real: replicação copia imagens entre registries (regiões diferentes, DR ou entre ambientes) e é oferecida por Harbor e registries gerenciados; políticas de retenção (por exemplo, manter só as N últimas tags ou as dos últimos X dias, sempre preservando as em produção) evitam o crescimento infinito do armazenamento; e a limpeza deve ser agendada junto com o GC. Monitore o uso de disco e faça backup do storage e das configurações.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual imagem oficial roda um registry Docker próprio, de referência?',
          choices: [
            { id: 'a', text: 'docker:dind' },
            { id: 'b', text: 'nginx:registry' },
            { id: 'c', text: 'registry:2' },
            { id: 'd', text: 'containerd:latest' }
          ],
          answer: 'c',
          explanation: 'registry:2 (Distribution) é a implementação de referência.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Por que não é aceitável publicar um registry em produção sem TLS e autenticação?',
          choices: [
            { id: 'a', text: 'Qualquer um poderia ler, sobrescrever ou interceptar as imagens' },
            { id: 'b', text: 'O Docker deixa de reconhecer as camadas' },
            { id: 'c', text: 'Os digests deixam de ser calculados' },
            { id: 'd', text: 'O registry apaga as tags sozinho' }
          ],
          answer: 'a',
          explanation: 'Sem TLS há interceptação; sem auth, acesso irrestrito de leitura/escrita.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Como o daemon do Docker é configurado para usar um pull-through cache?',
          choices: [
            { id: 'a', text: 'Com a flag --cache em cada docker run' },
            { id: 'b', text: 'Alterando o Dockerfile de cada imagem' },
            { id: 'c', text: 'Com o comando docker mirror enable' },
            { id: 'd', text: 'Com registry-mirrors no daemon.json apontando para o mirror' }
          ],
          answer: 'd',
          explanation: 'O daemon consulta o mirror antes do Docker Hub.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o valor que habilita a exclusão de manifests via API no registry:2.',
          code: '-e REGISTRY_STORAGE_DELETE_ENABLED=___',
          accept: ['true'],
          explanation: 'Sem isso a API de delete é recusada; e os blobs só somem depois do garbage collection.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Um CI compartilhado falha com erro de limite de pulls do Docker Hub. Qual mitigação NÃO resolve?',
          choices: [
            { id: 'a', text: 'Fazer docker login no pipeline' },
            { id: 'b', text: 'Aumentar a memória do runner de CI' },
            { id: 'c', text: 'Usar um mirror/cache próprio' },
            { id: 'd', text: 'Copiar as imagens base para o registry interno' }
          ],
          answer: 'b',
          explanation: 'Memória do runner não tem relação com a cota de pulls.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual a diferença entre apagar um manifest e executar o garbage collection?',
          choices: [
            { id: 'a', text: 'São a mesma operação' },
            { id: 'b', text: 'O GC apaga somente as tags e preserva os blobs' },
            { id: 'c', text: 'O GC reinicia o registry e recria o storage' },
            { id: 'd', text: 'Apagar remove a referência; o GC remove do disco os blobs que ficaram sem referência' }
          ],
          answer: 'd',
          explanation: 'Blobs órfãos continuam ocupando espaço até o GC.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual prática garante que um deploy use sempre exatamente a mesma imagem, mesmo que alguém dê push em uma tag existente?',
          choices: [
            { id: 'a', text: 'Referenciar a imagem pelo digest sha256' },
            { id: 'b', text: 'Usar sempre a tag latest' },
            { id: 'c', text: 'Usar a tag do mês corrente' },
            { id: 'd', text: 'Reduzir o número de camadas' }
          ],
          answer: 'a',
          explanation: 'Digest é imutável; tags podem ser reapontadas.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o subcomando do binário registry que remove blobs sem referência.',
          code: 'registry ___ /etc/docker/registry/config.yml',
          accept: ['garbage-collect'],
          explanation: 'registry garbage-collect lê a configuração e apaga blobs órfãos.'
        }
      ]
    },
    {
      id: 'cta-10-supply-chain',
      title: 'Segurança da cadeia de suprimentos',
      goal: 'Controlar a origem e a integridade de imagens com varredura, SBOM, proveniência, assinatura, digests e políticas de admissão.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'CVEs e triagem',
            body: 'Uma CVE é um identificador público de vulnerabilidade conhecida. Scanners (Trivy, Grype, Docker Scout) comparam os pacotes da imagem com bases de CVEs. A saída pode ter centenas de itens; triagem é decidir o que fazer: a gravidade (CVSS) importa, mas também se há correção disponível, se o componente é realmente usado em tempo de execução (alcançabilidade) e se está exposto. Muitas CVEs de pacotes do SO são irrelevantes para o seu caso. Um documento VEX registra que uma CVE existe mas não é explorável no produto. Meta: corrigir o que é crítico e explorável, reduzir ruído removendo pacotes desnecessários.',
            code: 'trivy image --severity HIGH,CRITICAL --ignore-unfixed app:1.0\ngrype app:1.0'
          },
          {
            title: 'SBOM',
            body: 'SBOM (Software Bill of Materials) é a lista de componentes e versões dentro de uma imagem, em formatos padronizados como SPDX e CycloneDX. Com um SBOM você responde rapidamente "estamos afetados pela nova vulnerabilidade X?" sem reanalisar tudo. Gere com ferramentas como syft ou no build com BuildKit (--sbom=true) e guarde junto da imagem no registry.',
            code: 'syft app:1.0 -o spdx-json > sbom.spdx.json\ndocker buildx build --sbom=true --provenance=true -t registry.example/app:1.0 --push .'
          },
          {
            title: 'Proveniência, atestados e SLSA',
            body: 'Proveniência é o registro verificável de COMO e ONDE o artefato foi construído: repositório e commit de origem, sistema de build, parâmetros. É publicada como atestado (attestation, formato in-toto), assinado. SLSA (pronuncia-se "salsa") é um framework com níveis crescentes de garantia sobre a cadeia de build (build scriptado, proveniência gerada pela plataforma, build isolado e não falsificável). Objetivo: provar que a imagem veio do seu pipeline e não foi adulterada.'
          },
          {
            title: 'Assinatura de imagens',
            body: 'Assinar uma imagem prova autoria e integridade do digest. cosign (projeto Sigstore) assina e verifica imagens, com chave própria ou no modo keyless (identidade via OIDC, com certificado de curta duração e registro em log de transparência). Notation (Notary Project) é outra opção padrão. O Docker Content Trust (DOCKER_CONTENT_TRUST=1, baseado em Notary v1) é o mecanismo legado do Docker. Assina-se o DIGEST, não a tag.',
            code: 'cosign sign registry.example/app@sha256:<digest>\ncosign verify registry.example/app:1.0 \\\n  --certificate-identity=ci@example.org --certificate-oidc-issuer=https://issuer.example'
          },
          {
            title: 'Fixar a base por digest e atualizar com automação',
            body: 'FROM alpine:3 muda com o tempo; FROM alpine@sha256:<digest> é exato e reprodutível (um build de hoje e de amanhã usam a mesma base). O custo: você deixa de receber patches automaticamente. A solução é automação: ferramentas como Renovate e Dependabot abrem PRs atualizando o digest quando sai uma base nova, passando pelo seu CI (varredura + testes).',
            code: 'FROM node:22-slim@sha256:<digest-da-base>\n# Renovate/Dependabot atualizam o digest via pull request'
          },
          {
            title: 'Imagens mínimas',
            body: 'Quanto menos componentes, menor a superfície de ataque e menos CVEs a triar. Opções: bases enxutas (alpine, slim), distroless (sem shell nem gerenciador de pacotes, só o runtime da aplicação) e scratch (vazia, para binários estáticos). Combine com multi-stage para não levar compiladores ao runtime. O trade-off é depuração mais difícil (use containers efêmeros de depuração).'
          },
          {
            title: 'Política de admissão',
            body: 'Assinar e gerar SBOM só ajuda se alguém EXIGIR. Em orquestradores como o Kubernetes, um admission controller (por exemplo Kyverno, OPA Gatekeeper ou o policy-controller do Sigstore) intercepta a criação de pods e pode rejeitar imagens que: não estejam assinadas por uma identidade confiável, venham de registries não permitidos, usem tag em vez de digest ou tenham CVEs críticas. É o ponto onde a cadeia de suprimentos vira regra imposta.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Ao triar um relatório com centenas de CVEs, qual conjunto de critérios é mais útil?',
          choices: [
            { id: 'a', text: 'Somente a ordem alfabética dos pacotes' },
            { id: 'b', text: 'Somente o tamanho do pacote afetado' },
            { id: 'c', text: 'Gravidade, existência de correção, uso real do componente em runtime e exposição' },
            { id: 'd', text: 'Corrigir tudo na ordem em que aparece' }
          ],
          answer: 'c',
          explanation: 'A triagem combina severidade com explorabilidade e contexto.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Para que serve um SBOM?',
          choices: [
            { id: 'a', text: 'Limitar a CPU do container' },
            { id: 'b', text: 'Listar os componentes e versões de uma imagem, para saber rapidamente se uma vulnerabilidade nova a afeta' },
            { id: 'c', text: 'Criptografar as camadas da imagem' },
            { id: 'd', text: 'Acelerar o pull das camadas' }
          ],
          answer: 'b',
          explanation: 'SBOM é o inventário de software; formatos comuns: SPDX e CycloneDX.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que registra a proveniência (atestado) de uma imagem?',
          choices: [
            { id: 'a', text: 'Quantas vezes a imagem foi baixada' },
            { id: 'b', text: 'Como, onde e a partir de qual código/pipeline ela foi construída, de forma assinada' },
            { id: 'c', text: 'A lista de portas expostas' },
            { id: 'd', text: 'O tamanho de cada camada' }
          ],
          answer: 'b',
          explanation: 'Proveniência prova a origem do build; SLSA define níveis de garantia.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o comando do cosign que assina a imagem identificada por digest.',
          code: 'cosign ___ registry.example/app@sha256:<digest>',
          accept: ['sign'],
          explanation: 'cosign sign cria a assinatura (armazenada no registry); cosign verify a valida.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Por que assinar o digest e não a tag?',
          choices: [
            { id: 'a', text: 'O digest é mais curto e rápido de assinar' },
            { id: 'b', text: 'Tags não podem ser assinadas por nenhuma ferramenta' },
            { id: 'c', text: 'O digest dispensa o registry' },
            { id: 'd', text: 'A tag pode ser reapontada para outro conteúdo; o digest identifica o conteúdo exato' }
          ],
          answer: 'd',
          explanation: 'Assinatura só tem valor se amarrada a conteúdo imutável.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual a vantagem e o custo de fixar a imagem base por digest?',
          choices: [
            { id: 'a', text: 'Builds reprodutíveis, mas sem patches automáticos, o que exige automação para atualizar o digest' },
            { id: 'b', text: 'Imagem menor, mas sem poder usar multi-stage' },
            { id: 'c', text: 'Mais velocidade de execução, sem custo algum' },
            { id: 'd', text: 'Elimina a necessidade de varredura' }
          ],
          answer: 'a',
          explanation: 'Renovate/Dependabot resolvem o custo propondo PRs com o novo digest.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual o papel de um admission controller na cadeia de suprimentos?',
          choices: [
            { id: 'a', text: 'Comprimir as camadas durante o pull' },
            { id: 'b', text: 'Gerar o SBOM automaticamente no build' },
            { id: 'c', text: 'Rejeitar na criação do pod imagens que não cumpram a política (assinatura, origem, digest, CVEs)' },
            { id: 'd', text: 'Substituir o runtime runc' }
          ],
          answer: 'c',
          explanation: 'Admissão impõe a política no momento do deploy.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a variável que ativa o Docker Content Trust (mecanismo legado de assinatura).',
          code: 'export DOCKER_CONTENT_TRUST=___',
          accept: ['1'],
          explanation: 'Com valor 1, o cliente só aceita imagens assinadas (baseado em Notary v1).'
        }
      ]
    },
    {
      id: 'cta-11-hardening',
      title: 'Hardening de containers e do host',
      goal: 'Aplicar um conjunto concreto de controles que reduzem o risco de containers e do host Docker, incluindo API, segredos, detecção e multi-tenancy.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'CIS Benchmark e docker-bench-security',
            body: 'O CIS Docker Benchmark é um guia de configuração segura do host, do daemon, das imagens e dos containers em execução. O script docker-bench-security (open source) audita automaticamente um host Docker contra essas recomendações e imprime PASS, WARN e INFO por item. Use como checklist periódico e em CI de infraestrutura, tratando cada WARN como um item a avaliar, não como verdade absoluta.',
            code: 'git clone https://github.com/docker/docker-bench-security.git\ncd docker-bench-security\nsudo sh docker-bench-security.sh'
          },
          {
            title: 'Rootfs somente leitura e menos privilégios',
            body: 'Um container com sistema de arquivos raiz somente leitura impede que um invasor grave binários ou scripts nele: use --read-only e libere apenas os pontos que a aplicação precisa escrever com --tmpfs ou volumes. Combine com usuário não-root (--user), --cap-drop ALL, no-new-privileges e limites de recursos. Cada controle fecha um caminho de ataque diferente (defesa em profundidade).',
            code: 'docker run -d --read-only --tmpfs /tmp \\\n  --user 10001:10001 --cap-drop ALL \\\n  --security-opt no-new-privileges:true \\\n  --pids-limit 200 --memory 256m app:1.0'
          },
          {
            title: 'Perfis seccomp customizados',
            body: 'O perfil padrão é um bom começo, mas uma aplicação específica usa poucas syscalls. Um perfil customizado (JSON com defaultAction e lista de syscalls permitidas) reduz a superfície ainda mais. Fluxo recomendado: gerar o perfil observando a aplicação em testes (por exemplo com strace ou ferramentas de profile), revisar, aplicar com --security-opt seccomp=perfil.json e testar bem, pois um bloqueio excessivo quebra a aplicação com erros de operação não permitida.',
            code: '{\n  "defaultAction": "SCMP_ACT_ERRNO",\n  "syscalls": [\n    { "names": ["read", "write", "exit_group", "futex"], "action": "SCMP_ACT_ALLOW" }\n  ]\n}'
          },
          {
            title: 'A API do Docker nunca exposta sem TLS mútuo',
            body: 'Quem acessa a API do daemon controla o host como root: pode iniciar um container que monta / e ler ou alterar qualquer arquivo. Nunca exponha o daemon por TCP sem TLS, e na porta sem TLS (2375) isso é um desastre comum de invasões (mineração de criptomoedas). Quando precisar de acesso remoto, use a porta com TLS (2376) com autenticação mútua: --tlsverify exige certificado de cliente assinado pela mesma CA. Alternativa mais simples: acesso por SSH (DOCKER_HOST=ssh://usuario@host).',
            code: 'dockerd -H tcp://0.0.0.0:2376 --tlsverify \\\n  --tlscacert=ca.pem --tlscert=server-cert.pem --tlskey=server-key.pem'
          },
          {
            title: 'Grupo docker equivale a root e docker.sock',
            body: 'Quem está no grupo docker pode rodar um container que monta o sistema de arquivos do host e, na prática, tem root no host. Trate a participação nesse grupo como acesso root. O mesmo vale para montar /var/run/docker.sock dentro de um container: o processo passa a controlar o daemon inteiro. Evite (ferramentas de CI e proxies devem usar alternativas, como socket proxy restrito ou modo rootless).',
            code: 'docker run --rm -v /:/host alpine cat /host/etc/shadow   # qualquer membro do grupo docker consegue'
          },
          {
            title: 'Segredos',
            body: 'Segredos não devem ficar na imagem (ENV, ARG ou COPY no Dockerfile), pois ficam visíveis em docker history, docker inspect e nas camadas. Prefira arquivos montados em tempo de execução: Docker secrets (em /run/secrets/nome), secrets do build com BuildKit (--mount=type=secret) e gerenciadores de segredos externos. Permissões restritas, rotação e mínimo escopo reduzem o dano de um vazamento. Não registre segredos nem dados pessoais em logs.'
          },
          {
            title: 'Detecção em runtime e multi-tenancy',
            body: 'Falco (projeto CNCF) observa syscalls e eventos do kernel e dispara alertas por regras, como "shell iniciado dentro de um container", "leitura de arquivo sensível" ou "conexão de saída inesperada". Para multi-tenancy: containers compartilham o kernel, então NÃO são fronteira de segurança forte entre clientes não confiáveis. Para isso, combine limites (cgroups, quotas), user namespaces, redes isoladas e, quando o risco é alto, sandbox (gVisor/Kata) ou VMs separadas por tenant.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual a função do docker-bench-security?',
          choices: [
            { id: 'a', text: 'Assinar imagens com cosign' },
            { id: 'b', text: 'Gerar SBOMs de imagens' },
            { id: 'c', text: 'Limitar a CPU de containers' },
            { id: 'd', text: 'Auditar um host Docker contra as recomendações do CIS Docker Benchmark' }
          ],
          answer: 'd',
          explanation: 'O script verifica configuração do host, daemon, imagens e containers.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual combinação de flags reduz a superfície de um container que não precisa gravar em disco?',
          choices: [
            { id: 'a', text: '--privileged com --net=host' },
            { id: 'b', text: '--read-only com --tmpfs só onde necessário, --cap-drop ALL e usuário não-root' },
            { id: 'c', text: '--user root com --cap-add ALL' },
            { id: 'd', text: '--pid=host com seccomp=unconfined' }
          ],
          answer: 'b',
          explanation: 'Cada flag fecha um caminho de ataque; as outras opções os abrem.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual é o risco de expor o daemon na porta TCP 2375?',
          choices: [
            { id: 'a', text: 'A API não tem autenticação nem criptografia, dando controle root do host a quem alcançá-la' },
            { id: 'b', text: 'Apenas lentidão na rede' },
            { id: 'c', text: 'Perda dos logs do daemon' },
            { id: 'd', text: 'Impede o uso do Compose' }
          ],
          answer: 'a',
          explanation: 'A 2375 é sem TLS; qualquer cliente que alcance a porta controla o host.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a porta convencional da API do Docker protegida por TLS.',
          code: 'dockerd -H tcp://0.0.0.0:___ --tlsverify --tlscacert=ca.pem --tlscert=server-cert.pem --tlskey=server-key.pem',
          accept: ['2376'],
          explanation: '2376 é a porta convencional com TLS; 2375 é a sem criptografia e deve ser evitada.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Por que pertencer ao grupo docker equivale a ter acesso root?',
          choices: [
            { id: 'a', text: 'Porque o grupo docker recebe a senha do root' },
            { id: 'b', text: 'Porque o grupo docker desabilita o sudo' },
            { id: 'c', text: 'Porque é possível iniciar um container que monta o sistema de arquivos do host e alterá-lo livremente' },
            { id: 'd', text: 'Porque o grupo docker pode editar o kernel' }
          ],
          answer: 'c',
          explanation: 'A API permite bind mounts arbitrários, e o container roda como root.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual a forma mais adequada de entregar uma senha de banco a um container?',
          choices: [
            { id: 'a', text: 'Gravá-la com ENV no Dockerfile' },
            { id: 'b', text: 'Passá-la com ARG no build' },
            { id: 'c', text: 'Montá-la como arquivo em tempo de execução (Docker secrets ou gerenciador de segredos), com permissões restritas' },
            { id: 'd', text: 'Escrevê-la no README do repositório' }
          ],
          answer: 'c',
          explanation: 'ENV e ARG ficam visíveis em histórico e inspect; arquivos montados em /run/secrets não entram na imagem.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'O que o Falco faz?',
          choices: [
            { id: 'a', text: 'Detecta comportamento suspeito em runtime analisando syscalls e eventos com regras e gerando alertas' },
            { id: 'b', text: 'Constrói imagens sem daemon' },
            { id: 'c', text: 'Assina o digest das imagens' },
            { id: 'd', text: 'Cria redes overlay entre hosts' }
          ],
          answer: 'a',
          explanation: 'Falco é detecção em tempo de execução, complementando prevenção.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a flag que torna o sistema de arquivos raiz do container somente leitura.',
          code: 'docker run --___ --tmpfs /tmp app:1.0',
          accept: ['read-only'],
          explanation: '--read-only protege contra gravação de binários; --tmpfs libera diretórios temporários necessários.'
        }
      ]
    },
    {
      id: 'cta-12-redes-internas',
      title: 'Redes por dentro: veth, bridge, iptables e VXLAN',
      goal: 'Entender como o Docker monta a rede de um container com veth, bridge, NAT e DNS embutido e como inspecionar tudo isso com ferramentas do Linux.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'veth pairs e a bridge docker0',
            body: 'Cada container tem um namespace de rede próprio. O Docker o liga ao host com um par veth: um cabo virtual de duas pontas, uma dentro do container (normalmente eth0) e outra no host (vethXXXX), conectada à bridge. A bridge padrão chama-se docker0 e funciona como um switch virtual de camada 2; ela tem o IP de gateway da sub-rede (por padrão 172.17.0.0/16). Redes definidas pelo usuário criam bridges próprias (br-<id>).',
            code: 'ip link show master docker0\n# 15: veth3a1b2c@if14: ... master docker0\ndocker exec web ip addr show eth0\n# 14: eth0@if15: ... inet 172.17.0.2/16'
          },
          {
            title: 'NAT de saída: MASQUERADE',
            body: 'Para o container acessar a internet, o tráfego sai com o IP privado 172.17.x.x, que não é roteável. O Docker adiciona uma regra na tabela nat do iptables (cadeia POSTROUTING) com a ação MASQUERADE, que troca o IP de origem pelo do host. O host também precisa ter o encaminhamento de pacotes habilitado (net.ipv4.ip_forward=1).',
            code: 'sudo iptables -t nat -S POSTROUTING\n# -A POSTROUTING -s 172.17.0.0/16 ! -o docker0 -j MASQUERADE'
          },
          {
            title: 'DNAT: como funciona -p 8080:80',
            body: 'Publicar uma porta cria uma regra DNAT na cadeia DOCKER da tabela nat: pacotes que chegam ao host na porta 8080 têm o destino reescrito para o IP e porta do container. Isso mostra que "-p" é só NAT no kernel (e, conforme a configuração, um docker-proxy para conexões locais), e que o Docker manipula o firewall do host, inclusive contornando regras de ufw/firewalld simples. Quem precisa restringir acesso deve publicar na interface certa (-p 127.0.0.1:8080:80) ou usar a cadeia DOCKER-USER.',
            code: 'sudo iptables -t nat -S DOCKER\n# -A DOCKER ! -i docker0 -p tcp -m tcp --dport 8080 -j DNAT --to-destination 172.17.0.2:80'
          },
          {
            title: 'DNS embutido em 127.0.0.11',
            body: 'Em redes definidas pelo usuário, o Docker injeta um servidor DNS embutido acessível em 127.0.0.11 dentro do container (visível em /etc/resolv.conf). Ele resolve nomes de containers e aliases da mesma rede e encaminha o restante para os DNS do host. Na bridge padrão (docker0) NÃO há essa resolução por nome, apenas por links legados ou IP.',
            code: 'docker exec api cat /etc/resolv.conf\n# nameserver 127.0.0.11\n# options ndots:0'
          },
          {
            title: 'ip netns e nsenter para inspecionar',
            body: 'Os namespaces de rede do Docker não aparecem no ip netns list por padrão, porque ficam em /var/run/docker/netns. O caminho mais prático é pegar o PID do container e usar nsenter -n, rodando as ferramentas do HOST dentro da rede do container: ip addr, ip route, ss -tulpn, tcpdump. Assim funciona mesmo em imagens sem nenhuma ferramenta de rede.',
            code: 'PID=$(docker inspect -f \'{{.State.Pid}}\' web)\nsudo nsenter -t $PID -n ip route\nsudo nsenter -t $PID -n ss -tulpn\ndocker network inspect bridge   # Subnet, Gateway, Containers'
          },
          {
            title: 'Overlay (VXLAN), macvlan e MTU',
            body: 'Overlay conecta containers em hosts diferentes (Docker Swarm) encapsulando os quadros em VXLAN sobre UDP (porta 4789); o encapsulamento adiciona 50 bytes de cabeçalho, então a MTU do overlay costuma ser 1450 sobre uma rede de 1500. macvlan dá ao container um endereço MAC e IP próprios na rede física, parecendo uma máquina da LAN (por padrão o host não alcança seus próprios containers macvlan). MTU incompatível causa sintomas clássicos: conexões que abrem mas travam ao enviar pacotes grandes.',
            code: 'docker network create -d macvlan --subnet=192.168.1.0/24 --gateway=192.168.1.1 -o parent=eth0 lan\n# overlay: MTU 1500 - 50 (VXLAN) = 1450'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que é um par veth no contexto do Docker?',
          choices: [
            { id: 'a', text: 'Um volume compartilhado entre dois containers' },
            { id: 'b', text: 'Um perfil seccomp' },
            { id: 'c', text: 'Um tipo de storage driver' },
            { id: 'd', text: 'Um cabo virtual de duas pontas ligando o namespace de rede do container ao host (bridge)' }
          ],
          answer: 'd',
          explanation: 'Uma ponta vira eth0 no container; a outra fica no host, ligada à bridge.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual regra de iptables permite que containers acessem a internet com o IP do host?',
          choices: [
            { id: 'a', text: 'DNAT na cadeia PREROUTING da tabela filter' },
            { id: 'b', text: 'MASQUERADE na cadeia POSTROUTING da tabela nat' },
            { id: 'c', text: 'DROP na cadeia INPUT' },
            { id: 'd', text: 'ACCEPT na tabela mangle' }
          ],
          answer: 'b',
          explanation: 'MASQUERADE troca o IP de origem privado pelo do host na saída.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Uma regra mostra: -A DOCKER ! -i docker0 -p tcp --dport 8080 -j DNAT --to-destination 172.17.0.2:80. O que ela implementa?',
          choices: [
            { id: 'a', text: 'Um limite de 8080 conexões por container' },
            { id: 'b', text: 'A resolução DNS do container' },
            { id: 'c', text: 'O bloqueio da porta 80 no host' },
            { id: 'd', text: 'A publicação -p 8080:80 do container 172.17.0.2' }
          ],
          answer: 'd',
          explanation: 'DNAT reescreve o destino: host:8080 vira container:80.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o endereço do servidor DNS embutido do Docker em redes definidas pelo usuário.',
          code: 'cat /etc/resolv.conf\nnameserver ___',
          accept: ['127.0.0.11'],
          explanation: 'O DNS embutido escuta em 127.0.0.11 dentro de cada container em redes definidas pelo usuário.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Por que o nsenter -t PID -n é preferível a docker exec para depurar rede?',
          choices: [
            { id: 'a', text: 'Executa as ferramentas do host na rede do container, mesmo que a imagem não tenha nenhuma' },
            { id: 'b', text: 'É mais rápido por usar outro kernel' },
            { id: 'c', text: 'Altera a rede do host para igualar a do container' },
            { id: 'd', text: 'Cria um novo container temporário' }
          ],
          answer: 'a',
          explanation: 'Entra só no namespace de rede, preservando as ferramentas do host.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Uma rede overlay VXLAN adiciona 50 bytes de cabeçalho. Com a rede física em MTU 1500, qual MTU interna é adequada?',
          choices: [
            { id: 'a', text: '1500' },
            { id: 'b', text: '1550' },
            { id: 'c', text: '1450' },
            { id: 'd', text: '1400' }
          ],
          answer: 'c',
          explanation: '1500 - 50 = 1450; MTU maior que isso causa fragmentação ou perda de pacotes.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual característica descreve a rede macvlan?',
          choices: [
            { id: 'a', text: 'Todos os containers compartilham o IP do host' },
            { id: 'b', text: 'O container recebe MAC e IP próprios na rede física, aparecendo como uma máquina da LAN' },
            { id: 'c', text: 'O tráfego é encapsulado em VXLAN sobre UDP 4789' },
            { id: 'd', text: 'Só funciona dentro de uma única máquina, sem acesso à LAN' }
          ],
          answer: 'b',
          explanation: 'macvlan expõe o container diretamente na rede física; VXLAN é do overlay.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a tabela do iptables que contém as regras de NAT (MASQUERADE e DNAT) do Docker.',
          code: 'sudo iptables -t ___ -S DOCKER',
          accept: ['nat'],
          explanation: 'As regras de tradução de endereços ficam na tabela nat.'
        }
      ]
    },
    {
      id: 'cta-13-docker-daemon-operacao',
      title: 'Operando o Docker daemon',
      goal: 'Configurar, diagnosticar, manter e atualizar o dockerd em produção, incluindo daemon.json, disco, logs, API e eventos.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O daemon.json',
            body: 'A configuração do daemon fica em /etc/docker/daemon.json (JSON). Chaves comuns: storage-driver (overlay2), log-driver e log-opts, live-restore, registry-mirrors, default-address-pools, insecure-registries (evite), data-root (onde ficam os dados, padrão /var/lib/docker) e as opções de TLS. A maioria das mudanças exige reiniciar o daemon; um JSON inválido impede o daemon de subir, então valide antes de aplicar. Evite definir a mesma opção no daemon.json e em flags do serviço systemd (gera conflito).',
            code: '{\n  "storage-driver": "overlay2",\n  "log-driver": "json-file",\n  "log-opts": { "max-size": "10m", "max-file": "3" },\n  "live-restore": true,\n  "registry-mirrors": ["https://mirror.interno.example"]\n}'
          },
          {
            title: 'Logs com rotação',
            body: 'O log-driver padrão (json-file) guarda a saída dos containers em arquivos sem limite de tamanho por padrão, o que pode encher o disco. Configure log-opts max-size e max-file para rotacionar (no exemplo, até 3 arquivos de 10 MB = 30 MB por container). A mudança no daemon.json vale para containers CRIADOS depois; os existentes precisam ser recriados. Alternativas: journald, syslog ou drivers de agregação.'
          },
          {
            title: 'live-restore',
            body: 'Com live-restore true, os containers continuam rodando enquanto o daemon é parado, reiniciado ou atualizado, e o daemon os reassume ao voltar. Reduz o downtime em manutenção do dockerd. Limitações: não vale para todas as mudanças (por exemplo, trocar o storage driver exige reiniciar tudo) e não é compatível com Swarm. É diferente de um restart policy, que religa containers que pararam.'
          },
          {
            title: 'Redes: default-address-pools',
            body: 'Ao criar redes, o Docker pega sub-redes de um conjunto padrão, que pode colidir com VPNs ou a rede da empresa. default-address-pools define as faixas: base (bloco CIDR) e size (tamanho do prefixo de cada rede). Com base 10.10.0.0/16 e size 24, cada rede recebe um /24 e cabem 2^(24-16) = 256 redes.',
            code: '{\n  "default-address-pools": [\n    { "base": "10.10.0.0/16", "size": 24 }\n  ]\n}'
          },
          {
            title: 'TLS na API, systemd e logs do daemon',
            body: 'Para acesso remoto, a API usa as chaves tlsverify, tlscacert, tlscert e tlskey (com hosts em 2376) para exigir certificados de cliente. O daemon roda como unidade systemd: systemctl status docker mostra o estado e journalctl -u docker lê os logs do próprio dockerd (erros de configuração, falhas de start, avisos de disco). Primeiro diagnóstico quando o Docker não sobe: journalctl -u docker -e.',
            code: 'sudo systemctl status docker\nsudo journalctl -u docker --since "1 hour ago"\nsudo journalctl -u docker -e'
          },
          {
            title: 'Disco cheio em /var/lib/docker',
            body: 'Imagens antigas, containers parados, volumes órfãos, cache de build e logs consomem /var/lib/docker. docker system df resume o uso (docker system df -v detalha por item). Limpe com docker system prune (remove containers parados, redes sem uso, imagens dangling e cache de build), -a inclui imagens sem container, e --volumes inclui volumes sem uso (cuidado: apaga dados). Para o cache: docker builder prune; para imagens: docker image prune. Use filtros (--filter until=24h) e nunca rode prune com volumes em produção sem conferir.',
            code: 'docker system df -v\ndocker system prune --filter until=168h\ndocker builder prune'
          },
          {
            title: 'Atualização, socket, API e eventos',
            body: 'Atualize o daemon pelo gerenciador de pacotes, de preferência com live-restore e janela planejada, lendo as notas de versão. O daemon expõe a Engine API REST pelo socket /var/run/docker.sock; o CLI é só um cliente dela, e existem SDKs oficiais (Go, Python). Acesso ao socket = root, então proteja-o. docker events transmite em tempo real os eventos (create, start, die, oom, health_status) e aceita --filter, útil para auditoria e automação.',
            code: 'curl --unix-socket /var/run/docker.sock http://localhost/containers/json\ndocker events --filter type=container --filter event=die'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Onde fica o arquivo padrão de configuração do daemon Docker no Linux?',
          choices: [
            { id: 'a', text: '/var/lib/docker/config.yml' },
            { id: 'b', text: '/etc/docker/daemon.json' },
            { id: 'c', text: '/etc/containerd/docker.toml' },
            { id: 'd', text: '/usr/bin/dockerd.conf' }
          ],
          answer: 'b',
          explanation: 'daemon.json em /etc/docker é a configuração do dockerd.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Por que configurar max-size e max-file em log-opts?',
          choices: [
            { id: 'a', text: 'Para acelerar o docker pull' },
            { id: 'b', text: 'Para criptografar os logs' },
            { id: 'c', text: 'Para limitar a memória do container' },
            { id: 'd', text: 'Para rotacionar os logs json-file e evitar que encham o disco' }
          ],
          answer: 'd',
          explanation: 'Sem rotação, o json-file cresce sem limite.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que o live-restore true permite?',
          choices: [
            { id: 'a', text: 'Manter containers rodando enquanto o daemon é reiniciado ou atualizado' },
            { id: 'b', text: 'Restaurar automaticamente imagens apagadas' },
            { id: 'c', text: 'Reverter a versão do Docker' },
            { id: 'd', text: 'Reiniciar containers que falharam' }
          ],
          answer: 'a',
          explanation: 'Os containers continuam e são reassumidos quando o daemon volta.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o comando que lê os logs do próprio daemon sob systemd.',
          code: 'sudo journalctl -u ___ -e',
          accept: ['docker', 'docker.service'],
          explanation: 'O dockerd roda como unidade systemd chamada docker.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Com default-address-pools base 10.10.0.0/16 e size 24, quantas redes /24 cabem?',
          choices: [
            { id: 'a', text: '24' },
            { id: 'b', text: '65536' },
            { id: 'c', text: '256' },
            { id: 'd', text: '16' }
          ],
          answer: 'c',
          explanation: '2^(24-16) = 256 sub-redes.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual comando mostra um resumo do uso de disco do Docker por imagens, containers, volumes e cache?',
          choices: [
            { id: 'a', text: 'docker stats' },
            { id: 'b', text: 'docker system events' },
            { id: 'c', text: 'docker volume ls' },
            { id: 'd', text: 'docker system df' }
          ],
          answer: 'd',
          explanation: 'Com -v detalha por item; é o primeiro passo antes de prune.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual o risco de rodar docker system prune --volumes?',
          choices: [
            { id: 'a', text: 'Reiniciar o daemon' },
            { id: 'b', text: 'Apagar volumes sem uso, o que pode eliminar dados importantes' },
            { id: 'c', text: 'Apagar as configurações do daemon.json' },
            { id: 'd', text: 'Desinstalar o runc' }
          ],
          answer: 'b',
          explanation: 'Volumes órfãos podem conter dados persistentes; confira antes.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a chave do daemon.json que mantém os containers rodando durante o restart do daemon.',
          code: '{ "___": true }',
          accept: ['live-restore'],
          explanation: 'live-restore reduz o downtime em manutenção e atualização do dockerd.'
        }
      ]
    },
    {
      id: 'cta-14-swarm',
      title: 'Docker Swarm: orquestração nativa',
      goal: 'Entender o modelo do Swarm (nós, services, tasks, stacks, overlay, secrets) e saber operar um deploy com rolling update e rollback.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Por que orquestrar e o que é o Swarm',
            body: 'Com vários servidores, rodar docker run em cada um não escala: ninguém reinicia o container no outro nó se um servidor cair, nem distribui réplicas. Um orquestrador recebe o estado desejado ("3 réplicas desta imagem") e trabalha continuamente para que a realidade bata com ele. O Docker Swarm (modo swarm) é o orquestrador embutido no próprio Docker Engine: não exige instalar nada além do Docker. Você ativa o modo na máquina e ela passa a fazer parte de um cluster.',
            code: 'docker swarm init --advertise-addr 192.168.1.10\n# esta máquina vira o primeiro manager do cluster\n# e imprime o comando de join para outros nós'
          },
          {
            title: 'Nós: manager e worker',
            body: 'Um cluster Swarm tem dois papéis de nó. Managers guardam o estado do cluster e tomam as decisões de agendamento; eles mantêm esse estado replicado pelo algoritmo de consenso Raft, que precisa de maioria (quórum) para funcionar. Por isso se usa um número ímpar de managers (3 ou 5): com 3, o cluster tolera a perda de 1. Workers apenas executam tarefas. Para adicionar nós, o manager fornece um token por papel.',
            code: 'docker swarm join-token worker   # mostra o comando de join de worker\ndocker swarm join --token <token> 192.168.1.10:2377   # rodado no novo nó\ndocker node ls                   # lista nós, papel e status (no manager)'
          },
          {
            title: 'Services e tasks',
            body: 'No Swarm você não cria containers diretamente: cria um service, que descreve o estado desejado (imagem, réplicas, portas, limites). O Swarm divide o service em tasks; cada task é uma unidade de agendamento que executa exatamente um container em algum nó. Se um container morre ou o nó cai, o Swarm cria uma nova task em outro lugar para voltar ao número de réplicas pedido. docker service ps mostra as tasks e onde elas rodam.',
            code: 'docker service create --name web --replicas 3 -p 8080:80 nginx\ndocker service ls          # services e réplicas (ex.: 3/3)\ndocker service ps web      # tasks, nós e estado\ndocker service scale web=5 # muda o número de réplicas'
          },
          {
            title: 'Stacks: Compose file no cluster',
            body: 'Um stack é um conjunto de services definido por um arquivo no formato Compose e implantado com docker stack deploy. A chave deploy do arquivo (usada pelo Swarm, ignorada em docker compose up comum) define réplicas, estratégia de atualização, limites e posicionamento. Os services do stack ganham o prefixo do nome do stack e compartilham uma rede overlay criada para ele.',
            code: 'services:\n  web:\n    image: nginx:stable\n    ports:\n      - "8080:80"\n    deploy:\n      replicas: 3\n      update_config:\n        parallelism: 1\n        delay: 10s\n      placement:\n        constraints:\n          - node.role == worker\n# docker stack deploy -c compose.yaml loja'
          },
          {
            title: 'Rolling update e rollback',
            body: 'Atualizar um service troca as tasks aos poucos: parallelism diz quantas tasks atualizar por vez e delay o intervalo entre lotes, evitando derrubar tudo junto. Se a nova versão falha, o failure action (por exemplo rollback) devolve a versão anterior. Também é possível voltar manualmente com docker service rollback. Healthchecks tornam o rolling update confiável, pois o Swarm só considera a task pronta quando ela fica saudável.',
            code: 'docker service update --image minhaapp:2.0 \\\n  --update-parallelism 1 --update-delay 10s \\\n  --update-failure-action rollback web\ndocker service rollback web   # volta à especificação anterior'
          },
          {
            title: 'Overlay, routing mesh, secrets e configs',
            body: 'Uma rede overlay conecta containers em nós diferentes como se estivessem na mesma LAN, com tráfego encapsulado entre os hosts; services na mesma overlay se encontram pelo nome via DNS. O routing mesh publica a porta de um service em TODOS os nós do cluster: uma requisição que chega a qualquer nó é roteada a uma task saudável, mesmo se ela estiver em outro nó. Secrets guardam dados sensíveis (senhas, chaves) criptografados nos logs Raft dos managers, e só são entregues aos nós que rodam tasks que precisam deles, montados como arquivo em /run/secrets/<nome> dentro do container. Configs são o equivalente para dados não sensíveis.',
            code: 'printf \'senha-de-exemplo\' | docker secret create db_pass -\ndocker service create --name db --secret db_pass \\\n  -e POSTGRES_PASSWORD_FILE=/run/secrets/db_pass postgres\ndocker network create -d overlay backend'
          },
          {
            title: 'Placement, limites e o ecossistema',
            body: 'Constraints restringem onde as tasks podem rodar (por exemplo node.role == manager ou rótulos de nó), e docker node update --availability drain esvazia um nó para manutenção, movendo suas tasks. O Swarm é simples e rápido de adotar, mas tem um conjunto de recursos menor que o Kubernetes: ecossistema de extensões, controle fino de rede, armazenamento e políticas é mais limitado. Por isso muitas equipes migraram para Kubernetes; ainda assim, o Swarm segue válido para clusters pequenos e simples. A escolha deve vir dos requisitos, não de moda.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que é uma task no Docker Swarm?',
          choices: [
            { id: 'a', text: 'Um nó worker do cluster' },
            { id: 'b', text: 'A unidade de agendamento que executa um container em um nó, parte de um service' },
            { id: 'c', text: 'O arquivo Compose usado no deploy' },
            { id: 'd', text: 'Uma rede overlay entre dois nós' }
          ],
          answer: 'b',
          explanation: 'O service é dividido em tasks; cada task roda um container em algum nó.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Por que se recomenda um número ímpar de managers?',
          choices: [
            { id: 'a', text: 'Managers pares não conseguem agendar tasks' },
            { id: 'b', text: 'Cada manager precisa de uma porta distinta' },
            { id: 'c', text: 'Workers só se juntam a managers ímpares' },
            { id: 'd', text: 'O Raft precisa de maioria (quórum), e um número ímpar tolera falhas sem empate' }
          ],
          answer: 'd',
          explanation: 'Com 3 managers a maioria é 2, tolerando a queda de 1; com 4 a tolerância continua 1.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual é o efeito do routing mesh?',
          choices: [
            { id: 'a', text: 'A porta publicada de um service fica acessível em todos os nós e é roteada a uma task saudável' },
            { id: 'b', text: 'Cada nó expõe uma porta aleatória diferente' },
            { id: 'c', text: 'O tráfego só chega ao nó onde a task roda' },
            { id: 'd', text: 'Ele criptografa os volumes dos services' }
          ],
          answer: 'a',
          explanation: 'Qualquer nó do cluster aceita a conexão e a encaminha a uma task do service.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o comando que lista as tasks do service web e onde elas rodam.',
          code: 'docker service ___ web',
          accept: ['ps', 'docker service ps web'],
          explanation: 'docker service ps mostra as tasks, o nó e o estado atual de cada uma.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Ao ler este trecho de compose.yaml, o que a chave abaixo define?\n\ndeploy:\n  replicas: 4\n  update_config:\n    parallelism: 2\n    delay: 30s',
          choices: [
            { id: 'a', text: 'Quatro nós, cada um atualizado a cada 2 s' },
            { id: 'b', text: 'Dois services, com atraso de 30 s no boot' },
            { id: 'c', text: 'Quatro réplicas, atualizadas de duas em duas, com 30 s entre os lotes' },
            { id: 'd', text: 'Quatro lotes de atualização com duas réplicas cada, sem intervalo' }
          ],
          answer: 'c',
          explanation: 'parallelism é o tamanho do lote e delay é a pausa entre lotes durante o rolling update.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Onde um secret do Swarm aparece dentro do container?',
          choices: [
            { id: 'a', text: 'Como variável de ambiente automática' },
            { id: 'b', text: 'Na imagem, dentro de uma camada nova' },
            { id: 'c', text: 'Como arquivo em /run/secrets/<nome>' },
            { id: 'd', text: 'Em um volume nomeado do host' }
          ],
          answer: 'c',
          explanation: 'Secrets são montados como arquivos em memória; a aplicação lê o arquivo.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual comando prepara um nó para manutenção, movendo suas tasks para outros nós?',
          choices: [
            { id: 'a', text: 'docker node update --availability drain <nó>' },
            { id: 'b', text: 'docker node rm --force <nó>' },
            { id: 'c', text: 'docker swarm leave --all' },
            { id: 'd', text: 'docker service rollback <nó>' }
          ],
          answer: 'a',
          explanation: 'O modo drain impede novas tasks no nó e reagenda as que já rodavam nele.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o comando que reverte um service à especificação anterior.',
          code: 'docker service ___ web',
          accept: ['rollback', 'docker service rollback web'],
          explanation: 'docker service rollback volta o service para a versão de especificação anterior.'
        }
      ]
    },
    {
      id: 'cta-15-k8s-introducao',
      title: 'Kubernetes para quem vem do Docker',
      goal: 'Entender a arquitetura do Kubernetes e seus objetos centrais (Pod, Deployment, Service) e mapear o que você já conhece de Docker e Compose.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Por que Kubernetes',
            body: 'Kubernetes é uma plataforma de orquestração de containers de código aberto. Ela cobre o que o docker run sozinho não resolve em escala: agendar containers em muitos nós, reiniciar o que falha, escalar réplicas, atualizar sem parar, descobrir serviços e balancear carga. Seu modelo é declarativo: você descreve o estado desejado em objetos e controladores trabalham em loop para fazer a realidade convergir para ele.'
          },
          {
            title: 'Arquitetura em visão geral',
            body: 'O control plane é o cérebro: o API server (única porta de entrada, tudo passa por ele), o etcd (banco chave-valor que guarda o estado do cluster), o scheduler (decide em qual nó cada Pod roda) e os controllers (loops que reconciliam estado atual com desejado). Em cada nó roda o kubelet, agente que garante que os containers dos Pods designados ao nó estejam rodando, e um container runtime (como containerd ou CRI-O), com o qual o kubelet fala pela interface CRI (Container Runtime Interface). Você conversa com o cluster pela CLI kubectl, que chama o API server.'
          },
          {
            title: 'Pod: a menor unidade',
            body: 'O Pod é a menor unidade implantável: um ou mais containers que compartilham rede (mesmo IP e portas) e volumes, e sempre são agendados juntos no mesmo nó. Normalmente há um container por Pod. Pods são efêmeros: quando morrem, não ressuscitam sozinhos; por isso quase nunca se cria Pod direto, e sim um objeto que o gerencia.',
            code: 'apiVersion: v1\nkind: Pod\nmetadata:\n  name: web\nspec:\n  containers:\n    - name: nginx\n      image: nginx:stable\n      ports:\n        - containerPort: 80'
          },
          {
            title: 'Deployment e ReplicaSet',
            body: 'Um Deployment declara quantas réplicas de um Pod você quer e como atualizá-las. Ele cria e gerencia um ReplicaSet, que mantém o número de Pods e recria os que somem; a cada nova versão, o Deployment cria um novo ReplicaSet e faz a troca gradual. O selector escolhe quais Pods pertencem ao Deployment (precisa casar com os labels do template) e template descreve o Pod.',
            code: 'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: web\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: web\n  template:\n    metadata:\n      labels:\n        app: web\n    spec:\n      containers:\n        - name: nginx\n          image: nginx:stable'
          },
          {
            title: 'Service e Namespace',
            body: 'Como Pods mudam de IP o tempo todo, o Service dá um endereço estável e DNS interno a um conjunto de Pods selecionados por label, balanceando entre eles. Tipos: ClusterIP (padrão, acessível só dentro do cluster), NodePort (abre uma porta em cada nó) e LoadBalancer (pede um balanceador externo ao provedor de nuvem). No Service, port é a porta exposta e targetPort a do container. Namespaces dividem o cluster em espaços lógicos para organizar e isolar recursos (por exemplo dev e prod).',
            code: 'apiVersion: v1\nkind: Service\nmetadata:\n  name: web\nspec:\n  type: ClusterIP\n  selector:\n    app: web\n  ports:\n    - port: 80\n      targetPort: 80'
          },
          {
            title: 'kubectl e declarativo vs imperativo',
            body: 'O modo imperativo diz o que fazer (kubectl create, kubectl run); o declarativo entrega o arquivo com o estado desejado e deixa o cluster calcular a diferença: kubectl apply -f. O declarativo é o padrão profissional porque o arquivo vira a fonte de verdade e pode ir para o Git. Comandos de dia a dia: get lista recursos, describe mostra detalhes e eventos (ótimo para achar por que um Pod não sobe), logs mostra a saída de um container e exec abre um comando dentro dele. A opção -n escolhe o namespace.',
            code: 'kubectl apply -f deployment.yaml\nkubectl get pods -n dev\nkubectl describe pod web-abc123\nkubectl logs web-abc123\nkubectl exec -it web-abc123 -- sh'
          },
          {
            title: 'Do Compose ao Kubernetes e ambientes locais',
            body: 'Mapa mental: service do Compose vira Deployment (mais Service para ser alcançado), ports vira Service, volumes vira PersistentVolumeClaim, environment vira ConfigMap/Secret e a rede padrão do Compose vira o DNS interno do cluster. Para aprender sem nuvem há clusters locais: kind (cluster dentro de containers Docker), minikube (cluster local em VM ou container) e k3s (distribuição leve de Kubernetes, também usada em servidores pequenos).'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual componente guarda o estado do cluster Kubernetes?',
          choices: [
            { id: 'a', text: 'kubelet' },
            { id: 'b', text: 'scheduler' },
            { id: 'c', text: 'kube-proxy do nó' },
            { id: 'd', text: 'etcd' }
          ],
          answer: 'd',
          explanation: 'O etcd é o banco chave-valor consultado e atualizado pelo API server.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual é a função do kubelet?',
          choices: [
            { id: 'a', text: 'Decidir em qual nó cada Pod roda' },
            { id: 'b', text: 'Agente em cada nó que garante os containers dos Pods designados a ele' },
            { id: 'c', text: 'Guardar o estado do cluster' },
            { id: 'd', text: 'Receber os comandos do kubectl' }
          ],
          answer: 'b',
          explanation: 'O scheduler escolhe o nó; o kubelet executa o Pod nele usando o runtime via CRI.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Por que quase nunca se cria um Pod diretamente em produção?',
          choices: [
            { id: 'a', text: 'Pods são efêmeros e não se recriam sozinhos; um Deployment os gerencia' },
            { id: 'b', text: 'Pods não aceitam mais de um container' },
            { id: 'c', text: 'Pods não têm rede própria' },
            { id: 'd', text: 'Só o Deployment consegue usar imagens públicas' }
          ],
          answer: 'a',
          explanation: 'O Deployment, via ReplicaSet, repõe Pods que somem e controla as atualizações.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o comando declarativo que aplica o estado descrito no arquivo.',
          code: 'kubectl ___ -f deployment.yaml',
          accept: ['apply', 'kubectl apply -f deployment.yaml'],
          explanation: 'kubectl apply compara o arquivo com o estado do cluster e aplica a diferença.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'No Service abaixo, o que seleciona os Pods de destino?\n\nspec:\n  type: ClusterIP\n  selector:\n    app: web\n  ports:\n    - port: 80\n      targetPort: 8080',
          choices: [
            { id: 'a', text: 'O nome do Service, que precisa ser igual ao da imagem' },
            { id: 'b', text: 'O campo type, que escolhe Pods por tipo' },
            { id: 'c', text: 'O selector app: web casa com labels dos Pods; o tráfego vai à porta 8080 do container' },
            { id: 'd', text: 'A porta 80, que busca Pods com esse número' }
          ],
          answer: 'c',
          explanation: 'selector filtra por labels; port é a porta do Service e targetPort a do container.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual tipo de Service só é acessível de dentro do cluster?',
          choices: [
            { id: 'a', text: 'NodePort' },
            { id: 'b', text: 'ClusterIP' },
            { id: 'c', text: 'LoadBalancer' },
            { id: 'd', text: 'Todos, desde que usem a mesma porta' }
          ],
          answer: 'b',
          explanation: 'ClusterIP é o padrão e tem IP virtual interno; NodePort e LoadBalancer expõem para fora.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'No mapa Compose para Kubernetes, o que corresponde a volumes (dados persistentes)?',
          choices: [
            { id: 'a', text: 'Namespace' },
            { id: 'b', text: 'ReplicaSet' },
            { id: 'c', text: 'Service do tipo NodePort' },
            { id: 'd', text: 'PersistentVolumeClaim' }
          ],
          answer: 'd',
          explanation: 'Um PVC solicita armazenamento persistente e é montado no Pod.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o comando que abre um shell dentro de um Pod.',
          code: 'kubectl ___ -it web-abc123 -- sh',
          accept: ['exec', 'kubectl exec -it web-abc123 -- sh'],
          explanation: 'kubectl exec roda um comando em um container do Pod, de forma análoga ao docker exec.'
        }
      ]
    },
    {
      id: 'cta-16-k8s-config-volumes-atualizacao',
      title: 'Kubernetes: configuração, armazenamento e atualização',
      goal: 'Configurar apps com ConfigMap e Secret, persistir dados com PVC, definir probes e recursos e entender atualização, Ingress, RBAC, StatefulSet e Job/CronJob.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'ConfigMap e Secret',
            body: 'ConfigMap guarda configuração não sensível em pares chave-valor; Secret guarda dados sensíveis (senhas, tokens). Atenção: por padrão, os valores de um Secret são apenas codificados em base64, o que NÃO é criptografia, e qualquer pessoa com acesso de leitura ao objeto os decodifica. A proteção real vem de RBAC restritivo, criptografia em repouso do etcd habilitada no cluster e, idealmente, um gerenciador de segredos externo. Para criar um Secret sem codificar à mão use stringData.',
            code: 'apiVersion: v1\nkind: Secret\nmetadata:\n  name: db\ntype: Opaque\nstringData:\n  senha: troque-me-exemplo\n---\napiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: app-config\ndata:\n  LOG_LEVEL: info'
          },
          {
            title: 'Entregando a configuração ao Pod',
            body: 'Há dois jeitos: variáveis de ambiente (env com valueFrom/configMapKeyRef ou secretKeyRef, ou envFrom para importar todas as chaves) e volumes montados, em que cada chave vira um arquivo. Variáveis são lidas só na criação do container; arquivos montados de ConfigMap/Secret podem ser atualizados no Pod em execução (a aplicação precisa reler). Para segredos, montar como arquivo costuma ser preferível, pois variáveis vazam mais fácil em dumps e logs.',
            code: 'containers:\n  - name: app\n    image: minhaapp:1.0\n    env:\n      - name: DB_SENHA\n        valueFrom:\n          secretKeyRef:\n            name: db\n            key: senha\n    volumeMounts:\n      - name: cfg\n        mountPath: /etc/app\nvolumes:\n  - name: cfg\n    configMap:\n      name: app-config'
          },
          {
            title: 'PV, PVC e StorageClass',
            body: 'O Pod é efêmero; para dados que sobrevivem é preciso armazenamento persistente. PersistentVolume (PV) é um pedaço de armazenamento no cluster; PersistentVolumeClaim (PVC) é o pedido de uso feito pela aplicação (tamanho e modo de acesso); StorageClass descreve o tipo de armazenamento e permite provisionamento dinâmico: ao criar o PVC, o PV é criado automaticamente. accessModes como ReadWriteOnce indica leitura e escrita por um nó por vez.',
            code: 'apiVersion: v1\nkind: PersistentVolumeClaim\nmetadata:\n  name: dados\nspec:\n  accessModes:\n    - ReadWriteOnce\n  resources:\n    requests:\n      storage: 5Gi\n  storageClassName: padrao'
          },
          {
            title: 'Probes, requests e limits',
            body: 'Três probes: livenessProbe diz se o container está vivo (falhou, o kubelet o reinicia); readinessProbe diz se está pronto para receber tráfego (falhou, o Pod sai dos endpoints do Service, sem reiniciar); startupProbe protege apps lentas na partida, suspendendo as outras até passar. resources.requests é o que o scheduler reserva ao escolher o nó; resources.limits é o teto: passar do limite de memória leva a OOMKilled, e o de CPU causa throttling (lentidão), sem matar.',
            code: 'resources:\n  requests:\n    cpu: 250m\n    memory: 128Mi\n  limits:\n    cpu: 500m\n    memory: 256Mi\nreadinessProbe:\n  httpGet:\n    path: /ready\n    port: 8080\nlivenessProbe:\n  httpGet:\n    path: /healthz\n    port: 8080'
          },
          {
            title: 'Atualização e rollback',
            body: 'O Deployment usa por padrão a estratégia RollingUpdate: sobe Pods novos e remove antigos gradualmente. maxSurge é quantos Pods extras podem existir acima do desejado durante a troca, e maxUnavailable quantos podem ficar indisponíveis. A readinessProbe é essencial: sem ela o Kubernetes pode mandar tráfego a Pods ainda não prontos. Cada mudança no template gera uma revisão, e dá para voltar.',
            code: 'kubectl set image deployment/web nginx=nginx:1.27\nkubectl rollout status deployment/web\nkubectl rollout undo deployment/web\nkubectl rollout history deployment/web'
          },
          {
            title: 'Ingress, RBAC, StatefulSet e Job/CronJob',
            body: 'Ingress (networking.k8s.io/v1) roteia tráfego HTTP/HTTPS externo para Services por host e caminho; só funciona com um Ingress controller instalado. RBAC controla quem faz o quê na API: Role/ClusterRole definem verbos permitidos sobre recursos, RoleBinding/ClusterRoleBinding os atribuem a usuários ou ServiceAccounts; aplique o menor privilégio. StatefulSet, diferente do Deployment, dá aos Pods identidade estável (nomes ordenados como db-0, db-1), ordem de criação e volume próprio por réplica via volumeClaimTemplates, adequado a bancos. Job (batch/v1) executa uma tarefa até concluir; CronJob a agenda com sintaxe cron no campo schedule.',
            code: 'apiVersion: batch/v1\nkind: CronJob\nmetadata:\n  name: backup\nspec:\n  schedule: "0 3 * * *"\n  jobTemplate:\n    spec:\n      template:\n        spec:\n          restartPolicy: OnFailure\n          containers:\n            - name: backup\n              image: minhaapp-backup:1.0'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que é correto sobre os valores de um Secret do Kubernetes por padrão?',
          choices: [
            { id: 'a', text: 'São criptografados com AES automaticamente no etcd' },
            { id: 'b', text: 'Ficam em base64, que não é criptografia; a proteção vem de RBAC e criptografia em repouso' },
            { id: 'c', text: 'Só podem ser lidos pelo Pod que os usa' },
            { id: 'd', text: 'São hash irreversível, impossível de decodificar' }
          ],
          answer: 'b',
          explanation: 'Base64 é só codificação reversível; proteja com RBAC, criptografia do etcd e gestor de segredos.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que acontece quando a readinessProbe de um Pod falha?',
          choices: [
            { id: 'a', text: 'O container é reiniciado imediatamente' },
            { id: 'b', text: 'O Deployment é apagado' },
            { id: 'c', text: 'O Pod é movido para outro namespace' },
            { id: 'd', text: 'O Pod deixa de receber tráfego do Service, sem ser reiniciado' }
          ],
          answer: 'd',
          explanation: 'Readiness controla o envio de tráfego; liveness é a que reinicia.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual é a diferença entre requests e limits?',
          choices: [
            { id: 'a', text: 'requests é a reserva usada pelo scheduler; limits é o teto de uso do container' },
            { id: 'b', text: 'requests é o teto e limits a reserva' },
            { id: 'c', text: 'Ambos só valem para armazenamento' },
            { id: 'd', text: 'requests vale para CPU e limits só para rede' }
          ],
          answer: 'a',
          explanation: 'O scheduler usa requests para escolher o nó; limits restringe consumo (memória excedida causa OOMKilled).'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o campo do container que reinicia o container quando o app trava.',
          code: 'containers:\n  - name: app\n    ___:\n      httpGet:\n        path: /healthz\n        port: 8080',
          accept: ['livenessProbe', 'liveness'],
          explanation: 'livenessProbe detecta travamento e o kubelet reinicia o container.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Lendo o PVC abaixo, o que ele pede?\n\nspec:\n  accessModes:\n    - ReadWriteOnce\n  resources:\n    requests:\n      storage: 5Gi',
          choices: [
            { id: 'a', text: 'Cinco réplicas do volume em cinco nós' },
            { id: 'b', text: 'Um volume somente leitura de 5 GB para todos os nós' },
            { id: 'c', text: 'Cinco gibibytes de armazenamento com leitura e escrita por um nó por vez' },
            { id: 'd', text: 'Cinco PVs idênticos' }
          ],
          answer: 'c',
          explanation: 'accessModes define o modo de acesso e requests.storage o tamanho solicitado.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Quando preferir StatefulSet a Deployment?',
          choices: [
            { id: 'a', text: 'Quando se quer o rollback mais rápido possível' },
            { id: 'b', text: 'Quando o app não usa rede' },
            { id: 'c', text: 'Quando cada réplica precisa de identidade estável e volume próprio, como num banco' },
            { id: 'd', text: 'Sempre que houver mais de uma réplica' }
          ],
          answer: 'c',
          explanation: 'StatefulSet dá nomes ordenados e volumeClaimTemplates por réplica.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual objeto agenda uma tarefa periódica usando sintaxe cron?',
          choices: [
            { id: 'a', text: 'CronJob' },
            { id: 'b', text: 'Ingress' },
            { id: 'c', text: 'StatefulSet' },
            { id: 'd', text: 'ConfigMap' }
          ],
          answer: 'a',
          explanation: 'O CronJob (batch/v1) cria Jobs conforme o campo schedule.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o comando que desfaz a última atualização do Deployment web.',
          code: 'kubectl rollout ___ deployment/web',
          accept: ['undo', 'kubectl rollout undo deployment/web'],
          explanation: 'kubectl rollout undo volta à revisão anterior do Deployment.'
        }
      ]
    },
    {
      id: 'cta-27-k8s-workloads-escala',
      title: 'Kubernetes: workloads e escala',
      goal: 'Escolher o tipo de workload, controlar onde os Pods rodam (scheduler, taints, afinidade) e escalar e atualizar com segurança (HPA, PDB, QoS, rollout).',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'DaemonSet: um Pod por nó',
            body: 'Um Deployment diz QUANTAS réplicas você quer; um DaemonSet (apps/v1) garante UM Pod em cada nó do cluster (ou em cada nó que casar com um filtro). Quando um nó entra no cluster, o Pod é criado nele; quando sai, o Pod some. É a escolha para agentes que precisam existir em todo nó: coletor de logs, agente de monitoramento, plugin de rede ou de armazenamento. Não há campo replicas: o número de Pods é o número de nós elegíveis.',
            code: 'apiVersion: apps/v1\nkind: DaemonSet\nmetadata:\n  name: coletor-logs\nspec:\n  selector:\n    matchLabels:\n      app: coletor-logs\n  template:\n    metadata:\n      labels:\n        app: coletor-logs\n    spec:\n      containers:\n        - name: agente\n          image: coletor:1.0'
          },
          {
            title: 'Scheduler: requests são a base do agendamento',
            body: 'O scheduler escolhe o nó de cada Pod novo em duas etapas: filtra os nós que NÃO servem (sem CPU/memória livres, com taint que o Pod não tolera, fora do nodeSelector) e pontua os que sobraram para escolher o melhor. A conta de "cabe ou não" usa resources.requests, e não o consumo real nem os limits. Por isso requests muito altos desperdiçam capacidade (o nó parece cheio mas está ocioso) e requests ausentes fazem o scheduler empilhar Pods sem saber o que cada um precisa. O jeito mais simples de restringir nós é o nodeSelector: o Pod só vai para nós que tenham o label indicado.',
            code: 'spec:\n  nodeSelector:\n    disco: ssd\n  containers:\n    - name: app\n      image: minhaapp:1.0\n      resources:\n        requests:\n          cpu: 250m\n          memory: 128Mi'
          },
          {
            title: 'Taints, tolerations e afinidade',
            body: 'Um taint é uma "marca de repulsa" colocada em um NÓ: Pods sem a toleration correspondente não são agendados nele (efeito NoSchedule; PreferNoSchedule é apenas uma preferência; NoExecute também expulsa os Pods que já estavam lá). A toleration, colocada no POD, só PERMITE entrar em nó com aquele taint: ela não obriga nem atrai. Para dedicar nós a uma carga, combine taint (afasta os outros) com nodeSelector ou afinidade (atrai a carga certa). A afinidade de nó (nodeAffinity) é um nodeSelector mais expressivo, com regra obrigatória (required...) ou preferencial (preferred...). A afinidade/antiafinidade entre Pods aproxima ou afasta Pods uns dos outros; o topologyKey define o que conta como "mesmo lugar" (kubernetes.io/hostname = mesmo nó).',
            code: '# no nó:\nkubectl taint nodes no1 dedicado=logs:NoSchedule\n\n# no Pod:\ntolerations:\n  - key: dedicado\n    operator: Equal\n    value: logs\n    effect: NoSchedule\n\n# antiafinidade: réplicas em nós diferentes\naffinity:\n  podAntiAffinity:\n    requiredDuringSchedulingIgnoredDuringExecution:\n      - labelSelector:\n          matchLabels:\n            app: web\n        topologyKey: kubernetes.io/hostname'
          },
          {
            title: 'HPA, VPA e Cluster Autoscaler',
            body: 'O HorizontalPodAutoscaler (autoscaling/v2) ajusta o número de réplicas de um Deployment conforme uma métrica: CPU, memória ou métricas customizadas. Em métricas de recurso, "70% de utilização" é medido em relação ao request do Pod, então o HPA exige requests definidos e um metrics-server instalado no cluster para fornecer as medições. O VerticalPodAutoscaler (um complemento) recomenda ou ajusta os requests/limits de cada Pod, em vez de mudar a quantidade; evite que HPA e VPA ajam sobre a mesma métrica. O Cluster Autoscaler trabalha em outro nível: adiciona nós quando há Pods que não cabem (Pending) e remove nós subutilizados. Resumo: HPA escala Pods, VPA dimensiona Pods, Cluster Autoscaler escala nós.',
            code: 'apiVersion: autoscaling/v2\nkind: HorizontalPodAutoscaler\nmetadata:\n  name: web\nspec:\n  scaleTargetRef:\n    apiVersion: apps/v1\n    kind: Deployment\n    name: web\n  minReplicas: 2\n  maxReplicas: 10\n  metrics:\n    - type: Resource\n      resource:\n        name: cpu\n        target:\n          type: Utilization\n          averageUtilization: 70'
          },
          {
            title: 'QoS e despejo por pressão de memória',
            body: 'O Kubernetes classifica cada Pod em uma classe de QoS a partir dos requests e limits: Guaranteed (todos os containers têm requests IGUAIS aos limits, em CPU e memória), Burstable (tem alguma request/limit, mas não cumpre a regra do Guaranteed) e BestEffort (nenhuma request nem limit). Quando o nó fica sem memória, o kubelet despeja Pods para se proteger, e a classe define a ordem: BestEffort primeiro, depois Burstable que passam do que pediram, e Guaranteed por último. Se o nó realmente esgota a memória, o kernel também pode matar processos (OOM). Conclusão: cargas importantes devem declarar requests e limits.',
            code: 'resources:\n  requests:\n    cpu: 500m\n    memory: 256Mi\n  limits:\n    cpu: 500m\n    memory: 256Mi\n# requests = limits em todos os containers => Guaranteed'
          },
          {
            title: 'PodDisruptionBudget e topologySpreadConstraints',
            body: 'Interrupções voluntárias (drenar um nó para manutenção, atualização de nós, Cluster Autoscaler removendo um nó) despejam Pods de propósito. O PodDisruptionBudget (policy/v1) limita isso: define, para um conjunto de Pods, quantos precisam continuar disponíveis (minAvailable) ou quantos podem faltar (maxUnavailable); um drain que violaria o orçamento espera. Ele NÃO protege contra falhas involuntárias, como o nó cair de repente. Já o topologySpreadConstraints distribui as réplicas de forma equilibrada por zonas ou nós (maxSkew é a diferença máxima aceita entre os grupos; topologyKey escolhe o critério), sendo uma alternativa mais suave à antiafinidade.',
            code: 'apiVersion: policy/v1\nkind: PodDisruptionBudget\nmetadata:\n  name: web\nspec:\n  minAvailable: 2\n  selector:\n    matchLabels:\n      app: web'
          },
          {
            title: 'Estratégias de rollout em detalhe',
            body: 'No RollingUpdate do Deployment, dois parâmetros definem o ritmo: maxSurge (quantos Pods a MAIS que o desejado podem existir durante a troca) e maxUnavailable (quantos Pods a MENOS podem ficar indisponíveis). Ambos aceitam número ou porcentagem. Com 4 réplicas, maxSurge: 1 e maxUnavailable: 0, o Deployment sobe um Pod novo, espera ficar pronto (readinessProbe) e só então remove um antigo: nunca há menos de 4 prontos e nunca mais de 5 Pods. É o mais seguro, mas exige capacidade extra no cluster. Com maxUnavailable alto a troca é mais rápida e a capacidade, temporariamente menor. A outra estratégia, Recreate, derruba todos os Pods antigos antes de subir os novos: causa indisponibilidade, mas serve quando duas versões não podem coexistir.',
            code: 'spec:\n  replicas: 4\n  strategy:\n    type: RollingUpdate\n    rollingUpdate:\n      maxSurge: 1\n      maxUnavailable: 0'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual workload é indicado para um agente de logs que precisa rodar em todos os nós do cluster?',
          choices: [
            { id: 'a', text: 'Deployment com replicas igual ao número de nós, fixado à mão' },
            { id: 'b', text: 'DaemonSet, que mantém um Pod em cada nó elegível' },
            { id: 'c', text: 'StatefulSet com um volume por nó' },
            { id: 'd', text: 'CronJob executado a cada minuto' }
          ],
          answer: 'b',
          explanation: 'O DaemonSet acompanha a entrada e a saída de nós automaticamente; um Deployment não garante um Pod por nó.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Que valor o scheduler usa para decidir se um Pod cabe em um nó?',
          choices: [
            { id: 'a', text: 'O consumo real de CPU medido naquele instante' },
            { id: 'b', text: 'Os limits do container' },
            { id: 'c', text: 'O tamanho da imagem' },
            { id: 'd', text: 'Os requests do Pod comparados à capacidade livre do nó' }
          ],
          answer: 'd',
          explanation: 'O agendamento é baseado em requests; limits só valem em execução (teto) e o consumo real não entra na conta de reserva.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O nó no1 tem o taint dedicado=logs:NoSchedule. Um Pod tem esta toleration e nenhum nodeSelector:\n\ntolerations:\n  - key: dedicado\n    operator: Equal\n    value: logs\n    effect: NoSchedule\n\nO que acontece?',
          choices: [
            { id: 'a', text: 'O Pod é obrigado a rodar em no1' },
            { id: 'b', text: 'O Pod nunca roda em nenhum nó, pois só tolera taints' },
            { id: 'c', text: 'O Pod PODE rodar em no1, mas também pode ir a outros nós sem taint' },
            { id: 'd', text: 'O taint é removido do nó no1' }
          ],
          answer: 'c',
          explanation: 'Toleration permite, não atrai nem obriga. Para dedicar o nó, combine taint com nodeSelector ou afinidade.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o campo que define o critério de "mesmo lugar" na antiafinidade (aqui, o mesmo nó).',
          code: 'podAntiAffinity:\n  requiredDuringSchedulingIgnoredDuringExecution:\n    - labelSelector:\n        matchLabels:\n          app: web\n      ___: kubernetes.io/hostname',
          accept: ['topologyKey', 'topologykey'],
          explanation: 'topologyKey escolhe o domínio de topologia; com kubernetes.io/hostname cada nó é um domínio, então as réplicas se espalham por nós.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Qual é a classe de QoS do Pod abaixo?\n\nresources:\n  requests:\n    cpu: 500m\n    memory: 256Mi\n  limits:\n    cpu: 500m\n    memory: 256Mi',
          choices: [
            { id: 'a', text: 'Guaranteed, pois requests e limits são iguais em CPU e memória' },
            { id: 'b', text: 'Burstable, pois tem limits' },
            { id: 'c', text: 'BestEffort, pois não usa GPU' },
            { id: 'd', text: 'Depende do namespace' }
          ],
          answer: 'a',
          explanation: 'Guaranteed exige requests = limits em todos os containers, para CPU e memória. Sem nada definido seria BestEffort; qualquer outra combinação, Burstable.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que o HPA com métrica de CPU em porcentagem exige para funcionar?',
          choices: [
            { id: 'a', text: 'Um StatefulSet no lugar do Deployment' },
            { id: 'b', text: 'Limits de memória em todos os nós' },
            { id: 'c', text: 'Requests de CPU nos Pods e um metrics-server fornecendo as medições' },
            { id: 'd', text: 'Um DaemonSet de monitoramento em cada nó' }
          ],
          answer: 'c',
          explanation: 'A porcentagem é calculada sobre o request, e as medições vêm do metrics-server. Sem eles o HPA não consegue calcular a utilização.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Com este PodDisruptionBudget, o que acontece ao drenar um nó para manutenção?\n\nspec:\n  minAvailable: 2\n  selector:\n    matchLabels:\n      app: web',
          choices: [
            { id: 'a', text: 'O drain ignora o orçamento, pois é uma ação de administrador' },
            { id: 'b', text: 'O despejo de um Pod web só ocorre se ao menos 2 Pods web continuarem disponíveis; senão o drain espera' },
            { id: 'c', text: 'O PDB impede que o nó caia por falha de hardware' },
            { id: 'd', text: 'Os Pods web passam a ser recriados em todos os nós' }
          ],
          answer: 'b',
          explanation: 'O PDB limita interrupções voluntárias via API de despejo. Não evita falhas involuntárias como a queda súbita de um nó.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Com 4 réplicas e maxSurge 1, queremos que nunca haja Pod indisponível durante a troca. Complete.',
          code: 'rollingUpdate:\n  maxSurge: 1\n  maxUnavailable: ___',
          accept: ['0'],
          explanation: 'Com maxUnavailable 0, um Pod novo precisa ficar pronto antes de um antigo ser removido: nunca há menos de 4 disponíveis (e no máximo 5 Pods existem).'
        }
      ]
    },
    {
      id: 'cta-28-k8s-seguranca',
      title: 'Kubernetes: segurança',
      goal: 'Proteger um cluster em camadas: RBAC e ServiceAccounts de menor privilégio, securityContext, Pod Security, NetworkPolicy, Secrets e políticas de admissão, com atenção à LGPD.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'RBAC em profundidade',
            body: 'RBAC (rbac.authorization.k8s.io/v1) decide quem pode fazer o quê na API. Uma Role lista permissões DENTRO de um namespace; uma ClusterRole vale para o cluster todo (recursos globais, como nós) ou serve de modelo reutilizável. Para conceder, usa-se RoleBinding (liga a regra a um sujeito dentro de um namespace) ou ClusterRoleBinding (em todo o cluster). Cada regra combina apiGroups, resources e verbs (get, list, watch, create, update, patch, delete). O RBAC é aditivo: só existem permissões concedidas, não há regra de "negar". Aplique o menor privilégio e lembre que ler Secrets (get/list) equivale a ler as senhas. Para auditar o que um sujeito pode, use kubectl auth can-i.',
            code: 'apiVersion: rbac.authorization.k8s.io/v1\nkind: Role\nmetadata:\n  name: leitor-pods\n  namespace: dev\nrules:\n  - apiGroups: [""]\n    resources: ["pods"]\n    verbs: ["get", "list"]\n---\napiVersion: rbac.authorization.k8s.io/v1\nkind: RoleBinding\nmetadata:\n  name: leitor-pods\n  namespace: dev\nsubjects:\n  - kind: ServiceAccount\n    name: leitor\n    namespace: dev\nroleRef:\n  kind: Role\n  name: leitor-pods\n  apiGroup: rbac.authorization.k8s.io'
          },
          {
            title: 'ServiceAccounts e tokens',
            body: 'Pessoas usam credenciais externas; os Pods usam ServiceAccounts, identidades que existem dentro de um namespace. Se você não escolher, o Pod usa a ServiceAccount default do namespace. O Pod recebe um token para falar com a API, montado como arquivo, e hoje esses tokens são projetados: temporários e vinculados ao Pod. A prática segura é criar uma ServiceAccount por aplicação, dar a ela só as permissões necessárias e, se o app NÃO precisa chamar a API do Kubernetes (a maioria), desligar a montagem do token com automountServiceAccountToken: false, para que um atacante que invada o container não encontre credencial pronta.',
            code: 'apiVersion: v1\nkind: ServiceAccount\nmetadata:\n  name: app\n  namespace: dev\nautomountServiceAccountToken: false'
          },
          {
            title: 'securityContext: endurecendo o container',
            body: 'O securityContext define como o processo roda. As opções-chave: runAsNonRoot: true (recusa iniciar como root), readOnlyRootFilesystem: true (o sistema de arquivos do container fica somente leitura; use volumes para o que precisa gravar), allowPrivilegeEscalation: false (impede ganhar mais privilégios do que o processo pai), capabilities com drop: ["ALL"] (remove as capabilities do Linux, adicionando de volta só as indispensáveis) e seccompProfile do tipo RuntimeDefault (filtro de chamadas de sistema padrão do runtime). Juntas, reduzem muito o estrago de uma invasão.',
            code: 'securityContext:\n  runAsNonRoot: true\n  readOnlyRootFilesystem: true\n  allowPrivilegeEscalation: false\n  capabilities:\n    drop: ["ALL"]\n  seccompProfile:\n    type: RuntimeDefault'
          },
          {
            title: 'Pod Security Standards e Admission',
            body: 'Os Pod Security Standards são três perfis: privileged (sem restrições), baseline (bloqueia o que escala privilégios de forma conhecida, como containers privilegiados e hostNetwork) e restricted (boas práticas atuais: não-root, sem escalada, capabilities removidas, seccomp). O Pod Security Admission aplica um perfil por NAMESPACE, via labels, em três modos: enforce (rejeita Pods que violam), audit (registra no log de auditoria) e warn (avisa quem criou). Estratégia comum: começar com warn/audit para descobrir o que quebraria e só então passar a enforce.',
            code: 'apiVersion: v1\nkind: Namespace\nmetadata:\n  name: prod\n  labels:\n    pod-security.kubernetes.io/enforce: restricted\n    pod-security.kubernetes.io/warn: restricted'
          },
          {
            title: 'NetworkPolicy: isolando o tráfego',
            body: 'Por padrão, todo Pod fala com todo Pod do cluster. A NetworkPolicy (networking.k8s.io/v1) restringe isso: quando uma política seleciona um Pod para uma direção (Ingress = entrada, Egress = saída), só o tráfego explicitamente permitido passa naquela direção. O padrão recomendado é um default deny por namespace (podSelector vazio seleciona todos os Pods) e, depois, políticas que liberam apenas o necessário. Importante: a política só é aplicada se o CNI do cluster a suportar; caso contrário o objeto é aceito, mas ignorado. Ao bloquear egress, lembre de permitir o DNS.',
            code: 'apiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: nega-entrada\n  namespace: prod\nspec:\n  podSelector: {}\n  policyTypes:\n    - Ingress\n---\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: api-recebe-do-front\n  namespace: prod\nspec:\n  podSelector:\n    matchLabels:\n      app: api\n  policyTypes:\n    - Ingress\n  ingress:\n    - from:\n        - podSelector:\n            matchLabels:\n              app: front'
          },
          {
            title: 'Secrets, admissão por política, registries e auditoria',
            body: 'Secret não é cofre: base64 é só codificação. Proteja em camadas: RBAC restritivo, criptografia em repouso do etcd (habilitada na configuração do API server) e, idealmente, um gerenciador externo de segredos (como Vault ou serviços de nuvem), com ferramentas como o External Secrets que sincronizam o valor para o cluster. Controladores de admissão por política (Kyverno, OPA Gatekeeper) validam ou barram objetos na criação: exigir securityContext, proibir imagens com tag latest ou de registries fora de uma lista confiável. A auditoria do API server registra quem fez o quê e quando, permitindo investigar incidentes. Nada disso substitui o hardening da imagem e do nó.'
          },
          {
            title: 'Privacidade e LGPD: isolar dados pessoais',
            body: 'A LGPD exige medidas de segurança e minimização de acesso a dados pessoais. No Kubernetes, isso se traduz em: separar sistemas que tratam dados pessoais em namespaces próprios; conceder acesso por Role/RoleBinding de menor privilégio, restrito àquele namespace (evite ClusterRoleBinding amplos); aplicar NetworkPolicy para que só os serviços necessários alcancem o banco; manter os Secrets e o etcd criptografados; e usar a auditoria para saber quem acessou o quê. Em ambientes de teste, use dados fictícios. Essas medidas reduzem o impacto de um incidente, mas a conformidade completa depende também de processos e de validação jurídica.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Para limitar o acesso a um sistema que trata dados pessoais, qual combinação segue o menor privilégio?',
          choices: [
            { id: 'a', text: 'Tudo no namespace default e cluster-admin para a equipe' },
            { id: 'b', text: 'Um ClusterRoleBinding com todos os verbos para todos os recursos' },
            { id: 'c', text: 'Compartilhar o arquivo kubeconfig do administrador' },
            { id: 'd', text: 'Namespace próprio, Role com só os verbos necessários e RoleBinding limitado àquele namespace' }
          ],
          answer: 'd',
          explanation: 'Namespace + Role + RoleBinding restringem o alcance. cluster-admin e bindings amplos violam o menor privilégio.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Dados esta Role e este RoleBinding (namespace dev), o que a ServiceAccount leitor consegue fazer?\n\nrules:\n  - apiGroups: [""]\n    resources: ["pods"]\n    verbs: ["get", "list"]\n---\nsubjects:\n  - kind: ServiceAccount\n    name: leitor\n    namespace: dev\nroleRef:\n  kind: Role\n  name: leitor-pods',
          choices: [
            { id: 'a', text: 'Consultar e listar Pods no namespace dev, sem poder apagá-los nem criar' },
            { id: 'b', text: 'Apagar Pods em qualquer namespace' },
            { id: 'c', text: 'Ler os Secrets do namespace dev' },
            { id: 'd', text: 'Nada, porque falta uma ClusterRole' }
          ],
          answer: 'a',
          explanation: 'A Role só concede get/list em pods, e o RoleBinding vale no namespace dev. Qualquer outro verbo ou recurso é negado por padrão.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Uma aplicação web nunca chama a API do Kubernetes. Qual é a prática recomendada para a ServiceAccount dela?',
          choices: [
            { id: 'a', text: 'Usar a conta default e dar cluster-admin por precaução' },
            { id: 'b', text: 'Usar uma ServiceAccount dedicada, sem permissões, com automountServiceAccountToken: false' },
            { id: 'c', text: 'Gravar o token na imagem para facilitar o acesso' },
            { id: 'd', text: 'Compartilhar a mesma ServiceAccount entre todos os namespaces' }
          ],
          answer: 'b',
          explanation: 'Sem necessidade de acessar a API, não monte token: um invasor do container não encontra credencial pronta.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a opção que faz o Kubernetes recusar iniciar o container como root.',
          code: 'securityContext:\n  ___: true\n  readOnlyRootFilesystem: true',
          accept: ['runAsNonRoot', 'runasnonroot'],
          explanation: 'runAsNonRoot: true impede o container de iniciar com UID 0.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Qual é o efeito do label abaixo em um Namespace?\n\npod-security.kubernetes.io/enforce: restricted',
          choices: [
            { id: 'a', text: 'Apenas gera avisos para quem cria Pods' },
            { id: 'b', text: 'Criptografa os Secrets do namespace' },
            { id: 'c', text: 'Pods que violam o perfil restricted são rejeitados na criação' },
            { id: 'd', text: 'Bloqueia todo tráfego de rede do namespace' }
          ],
          answer: 'c',
          explanation: 'enforce rejeita; warn avisa e audit registra. O perfil restricted exige práticas como não-root e seccomp.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Esta NetworkPolicy está aplicada no namespace prod (com um CNI que suporta políticas). O que ela faz?\n\nspec:\n  podSelector: {}\n  policyTypes:\n    - Ingress',
          choices: [
            { id: 'a', text: 'Nega toda entrada de tráfego nos Pods do namespace, até que outras políticas liberem o necessário' },
            { id: 'b', text: 'Libera toda a entrada para todos os Pods' },
            { id: 'c', text: 'Bloqueia apenas a saída dos Pods' },
            { id: 'd', text: 'É ignorada porque o podSelector está vazio' }
          ],
          answer: 'a',
          explanation: 'podSelector vazio seleciona todos os Pods; sem regras ingress, nada é permitido na entrada (default deny). Sem CNI compatível, seria ignorada.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual afirmação sobre Secrets do Kubernetes está correta?',
          choices: [
            { id: 'a', text: 'base64 é criptografia forte, então o valor está protegido' },
            { id: 'b', text: 'Secrets só podem ser lidos pelo Pod que os usa, nunca por usuários' },
            { id: 'c', text: 'Colocar o Secret em um ConfigMap o torna mais seguro' },
            { id: 'd', text: 'base64 é só codificação: a proteção vem de RBAC, criptografia do etcd e, de preferência, um gerenciador externo' }
          ],
          answer: 'd',
          explanation: 'Quem tem permissão de leitura decodifica o valor facilmente. Proteja com camadas.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o subcomando que verifica se um sujeito tem permissão para uma ação.',
          code: 'kubectl auth ___ delete pods -n dev --as=system:serviceaccount:dev:leitor',
          accept: ['can-i', 'can-i delete pods -n dev --as=system:serviceaccount:dev:leitor'],
          explanation: 'kubectl auth can-i responde yes ou no e é a forma rápida de auditar o RBAC.'
        }
      ]
    },
    {
      id: 'cta-29-k8s-pacotes-extensibilidade',
      title: 'Kubernetes: Helm, Kustomize, CRDs e Operators',
      goal: 'Gerenciar YAML entre ambientes com Helm e Kustomize, usar o kubectl com mais precisão e entender como CRDs e Operators estendem o Kubernetes.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O problema: YAML duplicado por ambiente',
            body: 'Uma aplicação real tem Deployment, Service, Ingress, ConfigMap e mais. Para dev, homologação e produção, quase tudo é igual; muda número de réplicas, imagem, domínio, limites de recursos. Copiar a pasta inteira para cada ambiente cria divergência e bugs (corrigiu em um, esqueceu nos outros). Existem duas respostas populares: Helm, que usa TEMPLATES com valores substituíveis, e Kustomize, que parte de uma BASE e aplica PATCHES por ambiente, sem templates.'
          },
          {
            title: 'Helm: chart, values e release',
            body: 'Helm é o gerenciador de pacotes do Kubernetes. Um chart é uma pasta com: Chart.yaml (nome, versão do chart, versão do app), values.yaml (valores padrão configuráveis) e templates/ (YAML com marcações da linguagem de templates do Go, como {{ .Values.replicas }}). Ao instalar um chart no cluster, o resultado é um release: uma instância nomeada, com histórico de revisões. O mesmo chart pode gerar vários releases (por exemplo, um por ambiente) com valores diferentes, passados por arquivo (-f) ou por --set.',
            code: '# templates/deployment.yaml (trecho)\nspec:\n  replicas: {{ .Values.replicas }}\n  template:\n    spec:\n      containers:\n        - name: web\n          image: {{ .Values.imagem }}\n\n# values.yaml\nreplicas: 2\nimagem: minhaapp:1.0'
          },
          {
            title: 'Comandos do Helm',
            body: 'helm install cria um release; helm upgrade aplica nova versão do chart ou novos valores (cada um gera uma revisão); helm rollback volta a uma revisão anterior; helm history lista as revisões; helm list mostra os releases. Para olhar antes de aplicar: helm template renderiza os templates em YAML localmente, sem tocar no cluster, e helm lint verifica o chart em busca de erros. Repositórios de charts são adicionados com helm repo add.',
            code: 'helm lint ./meu-chart\nhelm template web ./meu-chart -f values-prod.yaml\nhelm install web ./meu-chart -f values-prod.yaml\nhelm upgrade web ./meu-chart --set replicas=4\nhelm history web\nhelm rollback web 1'
          },
          {
            title: 'Cuidados: charts de terceiros e segredos em values',
            body: 'Um chart de terceiros é código que gera objetos no SEU cluster, possivelmente com permissões amplas: leia o resultado de helm template, confira imagens e RBAC, fixe a versão do chart (nada de "a mais recente" em produção) e prefira fontes confiáveis. Outro risco clássico: segredos em values.yaml. Esse arquivo costuma ir para o Git; senhas e tokens ali ficam no histórico para sempre e também aparecem nos dados do release. Mantenha segredos fora dos values versionados: use um gerenciador externo de segredos, ou ferramentas que guardam o segredo cifrado no Git, e referencie um Secret já existente.'
          },
          {
            title: 'Kustomize: base e overlays',
            body: 'O Kustomize, embutido no kubectl, trabalha sem templates: você tem uma base com os YAMLs comuns e, para cada ambiente, um overlay com um kustomization.yaml que referencia a base e aplica patches (pedaços de YAML que alteram ou acrescentam campos) e transformações como trocar a imagem ou adicionar um prefixo de nome. Como a base continua sendo YAML válido, é simples de ler e de revisar no Git. Aplica-se com kubectl apply -k.',
            code: '# overlays/prod/kustomization.yaml\nresources:\n  - ../../base\npatches:\n  - path: mais-replicas.yaml\n\n# aplicar:\nkubectl apply -k overlays/prod\n# só ver o YAML final:\nkubectl kustomize overlays/prod'
          },
          {
            title: 'kubectl avançado',
            body: 'Antes de aplicar, simule: --dry-run=client valida e processa localmente, sem falar com o servidor; --dry-run=server envia ao API server, que valida e executa a admissão, mas NÃO grava nada. kubectl diff -f arquivo mostra o que mudaria em relação ao estado atual do cluster. O server-side apply (--server-side) faz o API server calcular e registrar quais campos cada "dono" gerencia, evitando conflitos entre ferramentas. Para extrair dados: -o jsonpath seleciona campos da saída. Para descobrir campos de um recurso: kubectl explain mostra a documentação da API.',
            code: 'kubectl apply -f app.yaml --dry-run=server\nkubectl diff -f app.yaml\nkubectl get pods -o jsonpath="{.items[*].metadata.name}"\nkubectl explain deployment.spec.strategy'
          },
          {
            title: 'CRDs e Operators',
            body: 'A API do Kubernetes é extensível: uma CustomResourceDefinition (CRD) registra um NOVO tipo de objeto (por exemplo, kind: BancoDeDados), que passa a ser criado e consultado com kubectl como qualquer outro. Um tipo novo, sozinho, é só dado; quem lhe dá comportamento é um controller, um programa que roda em loop de reconciliação: lê o estado desejado (o que está no objeto), observa o estado real e age (cria Pods, faz backup, promove réplica) até os dois coincidirem. O padrão Operator é exatamente CRD + controller que codifica o conhecimento de um operador humano. Para bancos de dados, operators automatizam instalação, backup, failover e upgrade, mas avalie a maturidade do operator e teste o restore antes de confiar dados a ele. (Não confunda com o "operador" da LGPD, que é outro conceito.)',
            code: 'apiVersion: exemplo.org/v1\nkind: BancoDeDados\nmetadata:\n  name: clientes\nspec:\n  replicas: 3\n  backupDiario: true'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'No vocabulário do Helm, o que é um release?',
          choices: [
            { id: 'a', text: 'O arquivo values.yaml com os valores padrão' },
            { id: 'b', text: 'A pasta com templates do chart' },
            { id: 'c', text: 'Uma instância nomeada de um chart instalada no cluster, com histórico de revisões' },
            { id: 'd', text: 'Um repositório público de charts' }
          ],
          answer: 'c',
          explanation: 'Chart é o pacote; release é a instalação dele. O mesmo chart pode ter vários releases.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Você quer ver o YAML final que o Helm geraria, sem instalar nada no cluster. Qual comando usar?',
          choices: [
            { id: 'a', text: 'helm rollback' },
            { id: 'b', text: 'helm template' },
            { id: 'c', text: 'helm history' },
            { id: 'd', text: 'helm list' }
          ],
          answer: 'b',
          explanation: 'helm template renderiza localmente. Também ajuda a revisar charts de terceiros antes de instalar.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual é a função de kubectl diff -f app.yaml?',
          choices: [
            { id: 'a', text: 'Mostrar o que mudaria no cluster se o arquivo fosse aplicado' },
            { id: 'b', text: 'Apagar do cluster o que não está no arquivo' },
            { id: 'c', text: 'Gerar documentação dos campos do recurso' },
            { id: 'd', text: 'Converter o YAML em chart do Helm' }
          ],
          answer: 'a',
          explanation: 'diff compara o arquivo com o estado vivo. Documentação de campos é kubectl explain.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o comando que volta o release web à revisão 1.',
          code: 'helm ___ web 1',
          accept: ['rollback', 'helm rollback web 1'],
          explanation: 'helm rollback RELEASE REVISÃO restaura uma revisão anterior; helm history lista as revisões disponíveis.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que este kustomization.yaml de um overlay faz?\n\nresources:\n  - ../../base\npatches:\n  - path: mais-replicas.yaml',
          choices: [
            { id: 'a', text: 'Renderiza templates Go com valores do values.yaml' },
            { id: 'b', text: 'Instala um chart do repositório base' },
            { id: 'c', text: 'Cria um novo tipo de objeto na API' },
            { id: 'd', text: 'Parte do YAML da base e aplica o patch mais-replicas.yaml por cima, gerando o YAML do ambiente' }
          ],
          answer: 'd',
          explanation: 'Kustomize não usa templates: reutiliza a base e sobrepõe alterações por ambiente. Aplica-se com kubectl apply -k.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Por que não se deve colocar senhas no values.yaml versionado no Git?',
          choices: [
            { id: 'a', text: 'O Helm não aceita texto sensível' },
            { id: 'b', text: 'O arquivo vai para o histórico do repositório e para os dados do release: o segredo fica exposto; use um gerenciador de segredos' },
            { id: 'c', text: 'Senhas deixam o chart mais lento' },
            { id: 'd', text: 'Só é problema se o repositório for público há mais de um ano' }
          ],
          answer: 'b',
          explanation: 'Segredos no Git permanecem no histórico. Referencie um Secret já existente ou use gerenciador externo.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'O que caracteriza um Operator?',
          choices: [
            { id: 'a', text: 'Um usuário humano com permissão de administrador' },
            { id: 'b', text: 'Um tipo de Service que expõe o banco de dados' },
            { id: 'c', text: 'Uma CRD mais um controller que reconcilia o estado observado com o desejado descrito no objeto' },
            { id: 'd', text: 'Uma imagem base maior que a do container comum' }
          ],
          answer: 'c',
          explanation: 'A CRD define o novo tipo; o controller em loop de reconciliação o torna real, automatizando tarefas operacionais.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete para validar o arquivo no API server (incluindo admissão) sem gravar nada no cluster.',
          code: 'kubectl apply -f app.yaml --dry-run=___',
          accept: ['server'],
          explanation: 'dry-run=server consulta o API server sem persistir; dry-run=client apenas processa localmente.'
        }
      ]
    },
    {
      id: 'cta-30-k8s-rede-mesh-ebpf',
      title: 'Kubernetes: rede, service mesh e eBPF',
      goal: 'Entender o modelo de rede do Kubernetes (CNI, kube-proxy, DNS, tipos de Service, Ingress) e o papel de service mesh e eBPF.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O modelo de rede e o CNI',
            body: 'O Kubernetes impõe um modelo simples: cada Pod recebe seu próprio IP e todos os Pods do cluster conseguem se comunicar diretamente, entre nós diferentes, SEM NAT entre eles (o IP que o destino vê é o IP real do Pod de origem). O Kubernetes não implementa essa rede: delega a um plugin que segue a especificação CNI (Container Network Interface). O plugin configura a interface e o IP de cada Pod ao criá-lo e faz os Pods se alcançarem entre nós. Exemplos de plugins: Calico, Cilium e Flannel. Recursos como NetworkPolicy dependem de o plugin escolhido oferecê-los.'
          },
          {
            title: 'kube-proxy: como um Service roteia',
            body: 'O IP de um Service (ClusterIP) é virtual: nenhum processo escuta nele. Em cada nó, o kube-proxy observa os Services e seus endpoints (os Pods selecionados) e programa o kernel com regras (modo iptables ou IPVS) que redirecionam o tráfego destinado ao IP virtual para o IP de um Pod de verdade, sorteando entre eles. Assim, os Pods podem mudar e o endereço do Service permanece. Divisão de papéis: o CNI cuida da rede dos Pods; o kube-proxy cuida do roteamento dos Services (alguns plugins modernos conseguem assumir essa função).'
          },
          {
            title: 'CoreDNS e nomes de serviço',
            body: 'O cluster tem um DNS interno, normalmente o CoreDNS, e cada Pod é configurado para usá-lo. Todo Service ganha um nome no formato servico.namespace.svc.cluster.local (cluster.local é o domínio padrão, configurável). Dentro do mesmo namespace basta o nome curto (db); de outro namespace use servico.namespace (db.dados) ou o nome completo. É assim que um app se conecta ao banco sem conhecer IP algum.',
            code: '# Pod no namespace "dev" falando com o Service "db":\n#   mesmo namespace:   db\n#   outro namespace:   db.dados\n#   nome completo:     db.dados.svc.cluster.local\nkubectl exec -it web -n dev -- nslookup db.dados'
          },
          {
            title: 'Tipos de Service em profundidade',
            body: 'ClusterIP (padrão): IP virtual interno. NodePort: além do ClusterIP, abre uma porta em todos os nós, alcançando o Service de fora. LoadBalancer: pede ao provedor de nuvem um balanceador externo apontando para o Service. ExternalName: não tem seletor nem proxy; o DNS devolve um CNAME para um nome externo (útil para apelidar um serviço fora do cluster). Headless (clusterIP: None): sem IP virtual; a consulta DNS devolve diretamente os IPs dos Pods, e o cliente decide a quem falar. É o tipo usado com StatefulSet para dar a cada réplica um nome estável (db-0.db...).',
            code: 'apiVersion: v1\nkind: Service\nmetadata:\n  name: db\nspec:\n  clusterIP: None\n  selector:\n    app: db\n  ports:\n    - port: 5432\n---\napiVersion: v1\nkind: Service\nmetadata:\n  name: pagamentos\nspec:\n  type: ExternalName\n  externalName: api.exemplo.com'
          },
          {
            title: 'Ingress, Ingress controllers e Gateway API',
            body: 'Um Service LoadBalancer por aplicação sai caro e é limitado a L4. O Ingress (networking.k8s.io/v1) descreve regras HTTP/HTTPS (host e caminho, TLS) e um Ingress controller (programa instalado no cluster, como NGINX ou Traefik) as lê e as implementa; sem controller, o objeto Ingress não faz nada. A Gateway API é a evolução da ideia: separa papéis (a equipe de infraestrutura define o Gateway; as equipes de aplicação criam rotas como HTTPRoute) e é mais expressiva (headers, pesos, outros protocolos). Os dois convivem hoje.'
          },
          {
            title: 'Service mesh',
            body: 'Em muitos microsserviços, repetir em cada app a lógica de criptografia, retries, timeouts e métricas é trabalhoso. Um service mesh move isso para a infraestrutura: um proxy sidecar é injetado em cada Pod e intercepta todo o tráfego, e um plano de controle o configura. Ganhos: mTLS automático entre serviços (criptografia e identidade mútua), retries e timeouts uniformes, divisão de tráfego e observabilidade (métricas e traces) sem alterar o código. Custos: mais consumo de recursos, latência adicional, mais peças para operar e depurar. Exemplos: Istio e Linkerd; há também variações sem sidecar. Só adote se o problema justificar a complexidade.'
          },
          {
            title: 'eBPF',
            body: 'eBPF permite carregar pequenos programas dentro do kernel Linux sem alterar o kernel nem carregar módulos. Antes de rodar, um verificador (verifier) analisa o programa e rejeita o que puder travar ou comprometer o kernel; depois ele é anexado a eventos (pacotes de rede, chamadas de sistema, funções do kernel). Como roda no kernel, é muito eficiente. Usos no mundo de containers: rede e políticas (o Cilium usa eBPF), observabilidade com baixo overhead e segurança em runtime (Falco e Tetragon podem observar chamadas de sistema para detectar comportamento suspeito). Exige kernel adequado e privilégios para carregar programas.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que o modelo de rede do Kubernetes garante entre Pods?',
          choices: [
            { id: 'a', text: 'Cada Pod tem IP próprio e todos os Pods se comunicam diretamente, sem NAT entre eles' },
            { id: 'b', text: 'Pods só se comunicam dentro do mesmo nó' },
            { id: 'c', text: 'Todos os Pods compartilham o IP do nó' },
            { id: 'd', text: 'A comunicação entre nós precisa de NAT e portas publicadas' }
          ],
          answer: 'a',
          explanation: 'O requisito é conectividade Pod a Pod sem NAT. Quem implementa é o plugin CNI.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual par de funções está correto?',
          choices: [
            { id: 'a', text: 'CNI escolhe o nó do Pod; kube-proxy cria os volumes' },
            { id: 'b', text: 'CNI faz o DNS; kube-proxy emite certificados' },
            { id: 'c', text: 'CNI configura a rede e o IP dos Pods; kube-proxy programa o roteamento dos Services (iptables ou IPVS)' },
            { id: 'd', text: 'CNI executa containers; kube-proxy guarda o estado no etcd' }
          ],
          answer: 'c',
          explanation: 'Quem escolhe o nó é o scheduler; DNS é o CoreDNS; o estado fica no etcd.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que significa o nome abaixo?\n\ndb.dados.svc.cluster.local',
          choices: [
            { id: 'a', text: 'Um Pod chamado db no namespace svc' },
            { id: 'b', text: 'Um Ingress chamado dados no host db' },
            { id: 'c', text: 'Um domínio público registrado como cluster.local' },
            { id: 'd', text: 'O Service db no namespace dados, no domínio padrão do cluster' }
          ],
          answer: 'd',
          explanation: 'Formato: servico.namespace.svc.dominio-do-cluster. É resolvido pelo DNS interno.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete para criar um Service headless (sem IP virtual).',
          code: 'spec:\n  clusterIP: ___\n  selector:\n    app: db',
          accept: ['None', 'none'],
          explanation: 'clusterIP: None cria um Service headless: o DNS devolve os IPs dos Pods diretamente.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que este Service faz?\n\nkind: Service\nmetadata:\n  name: pagamentos\nspec:\n  type: ExternalName\n  externalName: api.exemplo.com',
          choices: [
            { id: 'a', text: 'Abre uma porta em todos os nós apontando para api.exemplo.com' },
            { id: 'b', text: 'Faz o DNS do cluster responder com um CNAME para api.exemplo.com, sem proxy' },
            { id: 'c', text: 'Cria um balanceador externo na nuvem' },
            { id: 'd', text: 'Seleciona Pods com o label api.exemplo.com' }
          ],
          answer: 'b',
          explanation: 'ExternalName só devolve um CNAME; não tem seletor nem roteia tráfego.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Você criou um objeto Ingress, mas nenhuma rota HTTP funciona. Qual é a causa mais provável?',
          choices: [
            { id: 'a', text: 'O Ingress só funciona com Services headless' },
            { id: 'b', text: 'O Ingress exige o modo Recreate no Deployment' },
            { id: 'c', text: 'O kube-proxy foi desligado' },
            { id: 'd', text: 'Não há um Ingress controller instalado para implementar as regras' }
          ],
          answer: 'd',
          explanation: 'O Ingress é só a descrição das regras; é o controller que as aplica.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual é o principal benefício e o principal custo de um service mesh com sidecars?',
          choices: [
            { id: 'a', text: 'Benefício: mTLS, retries e observabilidade sem mudar o código; custo: mais recursos, latência e complexidade' },
            { id: 'b', text: 'Benefício: dispensa o CNI; custo: nenhum' },
            { id: 'c', text: 'Benefício: substitui o scheduler; custo: perde-se o DNS' },
            { id: 'd', text: 'Benefício: torna as imagens menores; custo: mais camadas' }
          ],
          answer: 'a',
          explanation: 'O mesh adiciona um proxy por Pod e um plano de controle. Vale quando os ganhos justificam a operação extra.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete: antes de um programa eBPF rodar no kernel, ele precisa ser aprovado pelo ___.',
          code: '# programa eBPF -> ___ -> executa no kernel',
          accept: ['verifier', 'verificador'],
          explanation: 'O verifier do kernel analisa o programa e rejeita o que puder comprometer a estabilidade ou a segurança.'
        }
      ]
    },
    {
      id: 'cta-31-containers-gerenciados',
      title: 'Serviços gerenciados de containers e nuvem',
      goal: 'Comparar Kubernetes gerenciado, containers serverless e self-hosted, entendendo responsabilidade compartilhada, identidade sem chaves, custos e residência de dados (LGPD).',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Kubernetes gerenciado',
            body: 'Operar o control plane do Kubernetes (API server, etcd, scheduler, controllers) com alta disponibilidade, backup e atualização dá trabalho. Os serviços de Kubernetes gerenciado, como EKS (AWS), AKS (Azure) e GKE (Google Cloud), entregam o control plane pronto e mantido pelo provedor. Você ainda cuida dos nós de trabalho (os servidores onde os Pods rodam: tamanho, atualização do sistema, escala), embora alguns provedores ofereçam modos em que também gerenciam os nós. A API continua sendo a do Kubernetes, o que preserva o conhecimento e os manifests.'
          },
          {
            title: 'Containers sem Kubernetes e o modelo serverless',
            body: 'Nem toda aplicação precisa de Kubernetes. Há serviços que recebem a imagem e cuidam de executá-la: AWS ECS (com o modo Fargate, sem gerenciar servidores), Google Cloud Run e Azure Container Apps. No modelo "serverless containers", a plataforma escala conforme a demanda, inclusive até zero instâncias quando não há tráfego, e a cobrança é por uso. A contrapartida é o cold start: a primeira requisição após ficar em zero espera uma instância subir, o que adiciona latência. Costumam suportar bem apps stateless e sem estado local; cargas com disco persistente ou conexões longas pedem análise.',
            code: '# o contrato típico: uma imagem + variáveis + porta\nimagem:   registro.exemplo/app:1.4.2\nporta:    8080\nescala:   0 a N instâncias conforme as requisições'
          },
          {
            title: 'Registries gerenciados e self-hosted vs gerenciado',
            body: 'Os provedores oferecem registries gerenciados (privados, integrados à identidade da nuvem, com varredura de vulnerabilidades e replicação), o que evita operar o próprio registry. A comparação geral entre self-hosted e gerenciado: self-hosted dá mais controle (configuração, localização, ajuste fino) e pode ser mais barato em certos cenários, mas você assume a operação, a segurança, as atualizações e a disponibilidade. Gerenciado reduz a carga operacional e acelera a entrega, em troca de custo recorrente e dependência do provedor. Portabilidade: contêineres seguem o padrão OCI e o Kubernetes é o mesmo em toda parte, mas o lock-in aparece nos serviços proprietários em volta (filas, bancos, redes, identidade) que a aplicação passa a usar.'
          },
          {
            title: 'Responsabilidade compartilhada',
            body: 'Na nuvem vale o modelo de responsabilidade compartilhada: o provedor é responsável pela segurança DA nuvem (datacenters, hardware, virtualização e, em serviços gerenciados, a camada que ele opera, como o control plane); o cliente é responsável pela segurança NA nuvem: imagens, dependências, configuração, RBAC, rede, segredos, dados e quem acessa o quê. Quanto mais gerenciado o serviço, mais o provedor assume, mas dados, acessos e configuração continuam sendo seus. Vale especialmente para a LGPD: contratar um serviço gerenciado não transfere a sua obrigação de proteger dados pessoais.'
          },
          {
            title: 'Identidade de workload sem chaves estáticas',
            body: 'Como o container acessa um bucket, uma fila ou um banco da nuvem? O erro comum é gerar uma chave de acesso fixa e colocá-la em variável de ambiente, Secret ou, pior, na imagem: ela não expira, vaza em logs e histórico de camadas e é difícil de rotacionar. A alternativa é a identidade de workload: associa-se à carga (conta de serviço do Pod, tarefa, serviço) um papel com permissões mínimas, e a plataforma entrega credenciais temporárias, renovadas automaticamente, só para aquela carga. Nenhum segredo de longa duração precisa ser guardado. Os nomes variam (papéis de serviço, workload identity, identidades gerenciadas), mas a ideia é a mesma.',
            code: '# NAO FAÇA: chave estática dentro da imagem\nENV CHAVE_ACESSO=exemplo-nao-use\n\n# FAÇA: papel atribuído à carga de trabalho\n# (a plataforma injeta credenciais temporárias)'
          },
          {
            title: 'Controle de custos',
            body: 'Em nuvem, desperdício vira fatura. Boas práticas: definir requests e limits corretos (requests inflados reservam capacidade ociosa; sem limits, uma carga descontrolada consome tudo); usar autoscaling para acompanhar a demanda, inclusive reduzindo à noite ou a zero quando o serviço permite; manter imagens enxutas (menos armazenamento, pulls mais rápidos, partida mais rápida); apagar ambientes ociosos e recursos órfãos (discos, balanceadores, IPs); etiquetar recursos por equipe/projeto para ver quem gasta e configurar orçamentos com alertas.'
          },
          {
            title: 'Região, residência de dados e LGPD',
            body: 'Escolher a região da nuvem define onde os dados ficam fisicamente, e isso inclui bancos, backups, réplicas, logs e imagens de registry que contenham dados. Se dados pessoais são armazenados ou processados em outro país, pode haver transferência internacional de dados pessoais, que a LGPD admite apenas em hipóteses previstas e com salvaguardas adequadas. Com um provedor de nuvem, normalmente a empresa é a controladora e o provedor atua como operador (ou suboperador), o que pede contrato com as responsabilidades de segurança e tratamento. Isto é uma visão geral, não aconselhamento jurídico: valide o caso concreto com profissional da área.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'No que consiste, em geral, um serviço de Kubernetes gerenciado como EKS, AKS ou GKE?',
          choices: [
            { id: 'a', text: 'O provedor cuida de tudo, inclusive do código e dos dados da aplicação' },
            { id: 'b', text: 'Um Kubernetes que só roda com imagens do próprio provedor' },
            { id: 'c', text: 'O provedor opera o control plane; você cuida da aplicação, da configuração e (na maioria dos modos) dos nós' },
            { id: 'd', text: 'Uma versão sem API, usada apenas pela interface web' }
          ],
          answer: 'c',
          explanation: 'O control plane é do provedor; a API é a mesma do Kubernetes. Dados, imagens e configuração continuam sob sua responsabilidade.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual é o par vantagem/contrapartida típico dos containers serverless (como Cloud Run ou Container Apps)?',
          choices: [
            { id: 'a', text: 'Disco persistente ilimitado; custo fixo alto' },
            { id: 'b', text: 'Escala até zero e cobrança por uso; cold start na primeira requisição após ficar em zero' },
            { id: 'c', text: 'Acesso root ao host; sem escala automática' },
            { id: 'd', text: 'Sem necessidade de imagem; só código-fonte' }
          ],
          answer: 'b',
          explanation: 'A plataforma sobe instâncias sob demanda; por isso a primeira requisição após zero pode ser mais lenta.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual é a troca típica ao escolher um registry gerenciado em vez de operar o próprio?',
          choices: [
            { id: 'a', text: 'Perde-se o padrão OCI' },
            { id: 'b', text: 'A imagem deixa de poder ser baixada por containers' },
            { id: 'c', text: 'Você passa a precisar de mais servidores' },
            { id: 'd', text: 'Menos operação e manutenção, em troca de custo recorrente e dependência do provedor' }
          ],
          answer: 'd',
          explanation: 'Self-hosted dá controle e exige operação; gerenciado reduz a operação e aumenta a dependência.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o nome do modelo em que provedor e cliente dividem as responsabilidades de segurança.',
          code: '# Modelo de responsabilidade ___ entre provedor e cliente',
          accept: ['compartilhada', 'Compartilhada'],
          explanation: 'No modelo de responsabilidade compartilhada, o provedor protege a nuvem; o cliente protege o que coloca nela.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que há de errado neste trecho de Dockerfile e qual é a alternativa?\n\nFROM minhaapp:base\nENV CHAVE_ACESSO=exemplo-nao-use',
          choices: [
            { id: 'a', text: 'Uma credencial estática fica na imagem; use identidade de workload com credenciais temporárias' },
            { id: 'b', text: 'ENV não existe no Dockerfile' },
            { id: 'c', text: 'Falta a variável de região da nuvem' },
            { id: 'd', text: 'O problema é só o nome da variável' }
          ],
          answer: 'a',
          explanation: 'Chaves fixas na imagem vazam pelo histórico de camadas e não expiram. Papéis atribuídos à carga entregam credenciais temporárias.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual conjunto de práticas ajuda a controlar custos de containers na nuvem?',
          choices: [
            { id: 'a', text: 'Remover todos os limits para evitar reinícios' },
            { id: 'b', text: 'Superdimensionar os requests e manter réplicas máximas o tempo todo' },
            { id: 'c', text: 'Requests e limits corretos, autoscaling, imagens enxutas e limpeza de recursos ociosos' },
            { id: 'd', text: 'Usar sempre a imagem maior disponível' }
          ],
          answer: 'c',
          explanation: 'Dimensionamento correto, escala conforme a demanda e imagens menores reduzem consumo e fatura.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Uma empresa guarda dados pessoais de clientes em um banco numa região de nuvem em outro país. Qual cuidado se aplica em visão geral?',
          choices: [
            { id: 'a', text: 'Nenhum, pois a nuvem não tem localização física' },
            { id: 'b', text: 'Avaliar se há transferência internacional de dados pessoais, ter contrato com o provedor e validar com o jurídico' },
            { id: 'c', text: 'Basta criptografar a senha do banco' },
            { id: 'd', text: 'Apagar os backups imediatamente' }
          ],
          answer: 'b',
          explanation: 'A região determina onde os dados ficam. A LGPD condiciona a transferência internacional; contrato e análise jurídica são necessários.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete: a identidade de workload evita guardar uma chave ___ de longa duração.',
          code: '# papel atribuído à carga em vez de chave ___',
          accept: ['estática', 'estatica', 'fixa'],
          explanation: 'Chaves estáticas não expiram e vazam facilmente; credenciais temporárias de papéis são renovadas automaticamente.'
        }
      ]
    },
    {
      id: 'cta-17-padroes-de-design',
      title: 'Padrões de projeto para containers',
      goal: 'Projetar aplicações que se comportam bem em containers: um processo por container, sidecar, init container, 12-factor, estado externo, desligamento gracioso e design para falha.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Um processo por container',
            body: 'A regra de ouro: cada container deve ter uma responsabilidade principal (web, banco, worker), não "tudo num só". Isso facilita escalar cada parte de forma independente, atualizar, ver logs e limitar recursos. Não significa literalmente uma única thread: um servidor pode gerar processos filhos. Significa evitar empacotar serviços diferentes (e um SSH ou supervisor para gerenciá-los) em uma imagem. A composição acontece no nível do Pod/stack.'
          },
          {
            title: 'Sidecar, ambassador e adapter',
            body: 'Padrões de composição que usam containers auxiliares no mesmo Pod (mesma rede e volumes). Sidecar estende a aplicação sem alterar seu código, por exemplo coletar logs, renovar certificados ou fazer proxy de rede (malha de serviços). Ambassador é um proxy que representa um serviço externo para a aplicação (ela fala com localhost; o ambassador cuida de balanceamento, retries e roteamento). Adapter padroniza a saída da aplicação, por exemplo convertendo métricas para o formato que o Prometheus entende.'
          },
          {
            title: 'Init container',
            body: 'Init containers rodam antes dos containers principais, um de cada vez, até terminarem com sucesso; só então a aplicação inicia. Servem para preparar o ambiente: esperar um serviço ficar disponível, rodar migrações, baixar arquivos ou ajustar permissões de um volume. Diferem dos sidecars por terem fim; falhando, o Pod reinicia a sequência.',
            code: 'spec:\n  initContainers:\n    - name: espera-db\n      image: busybox:stable\n      command: ["sh", "-c", "until nc -z db 5432; do sleep 2; done"]\n  containers:\n    - name: app\n      image: minhaapp:1.0'
          },
          {
            title: 'Os 12 fatores essenciais',
            body: 'O 12-factor é um conjunto de boas práticas para apps de nuvem. Os mais ligados a containers: configuração no ambiente (nada de config fixa na imagem, para a mesma imagem rodar em dev e prod); processos stateless e sem compartilhar nada entre si; serviços de apoio (banco, fila) tratados como recursos anexados, trocáveis por configuração; logs como fluxo de eventos para stdout/stderr, deixando a plataforma coletar; dev e prod o mais parecidos possível; e descartabilidade: processos sobem rápido e podem ser encerrados a qualquer momento.'
          },
          {
            title: 'Stateless, stateful, pets e cattle',
            body: 'Uma aplicação stateless não guarda estado local entre requisições: sessão, uploads e cache vão para banco, Redis ou armazenamento de objetos. Assim qualquer réplica atende qualquer requisição, e réplicas são intercambiáveis e escaláveis. Stateful exige identidade e dados duráveis, com cuidados extras. A metáfora pets vs cattle: pets são servidores únicos, nomeados e curados à mão; cattle são recursos idênticos e descartáveis, substituídos quando falham. Containers favorecem cattle. Relacionada, infraestrutura imutável: não se altera um container em execução; muda-se a imagem e recria-se.'
          },
          {
            title: 'Desligamento gracioso',
            body: 'Ao parar, o orquestrador envia SIGTERM e, após um prazo, SIGKILL. Uma aplicação bem projetada captura o SIGTERM, para de aceitar novas conexões, termina as requisições em andamento, fecha conexões de banco e sai com código 0. Para isso o app precisa ser o PID 1 ou receber o sinal (use a forma exec de CMD/ENTRYPOINT). O prazo de tolerância deve cobrir o pior caso de requisição em andamento.',
            code: 'process.on(\'SIGTERM\', () => {\n  server.close(() => process.exit(0)); // para de aceitar e termina as ativas\n});'
          },
          {
            title: 'Idempotência e design para falha',
            body: 'Falhas são normais: containers morrem, redes oscilam, dependências caem. Projete assumindo isso. Idempotência é a propriedade de repetir uma operação sem efeito extra além da primeira vez; com retries (inevitáveis) ela evita cobrar duas vezes ou duplicar registros, por exemplo usando chaves de idempotência e comandos como CREATE IF NOT EXISTS. Complete com timeouts, retries com backoff exponencial, circuit breakers, healthchecks honestos e dependências opcionais degradando com elegância. A configuração externa permite trocar valores sem reconstruir a imagem.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual é o objetivo de um sidecar?',
          choices: [
            { id: 'a', text: 'Rodar uma vez antes da aplicação e terminar' },
            { id: 'b', text: 'Substituir o banco de dados da aplicação' },
            { id: 'c', text: 'Compilar a imagem durante a execução' },
            { id: 'd', text: 'Estender a aplicação (logs, proxy, certificados) em um container auxiliar no mesmo Pod' }
          ],
          answer: 'd',
          explanation: 'Sidecars rodam junto ao app, compartilhando rede e volumes.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que distingue um init container de um sidecar?',
          choices: [
            { id: 'a', text: 'O init container só roda depois do Pod terminar' },
            { id: 'b', text: 'O init container roda antes e precisa terminar com sucesso; o sidecar roda junto da aplicação' },
            { id: 'c', text: 'O init container usa outro kernel' },
            { id: 'd', text: 'Não há diferença prática' }
          ],
          answer: 'b',
          explanation: 'Init containers preparam o ambiente e têm fim; sidecars acompanham o app.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Por que um app stateless é mais fácil de escalar?',
          choices: [
            { id: 'a', text: 'Qualquer réplica atende qualquer requisição, pois o estado fica fora do container' },
            { id: 'b', text: 'Ele não usa CPU' },
            { id: 'c', text: 'Ele dispensa rede' },
            { id: 'd', text: 'Ele só roda em uma réplica' }
          ],
          answer: 'a',
          explanation: 'Sem estado local, as réplicas são intercambiáveis.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o sinal enviado primeiro pelo orquestrador para pedir o encerramento gracioso.',
          code: 'process.on(\'___\', () => server.close())',
          accept: ['SIGTERM', 'sigterm'],
          explanation: 'SIGTERM pede o encerramento; só depois do prazo vem o SIGKILL.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Na metáfora pets vs cattle, o que representa cattle?',
          choices: [
            { id: 'a', text: 'Servidores únicos mantidos à mão por anos' },
            { id: 'b', text: 'Bancos de dados com backup manual' },
            { id: 'c', text: 'Recursos idênticos e descartáveis, substituídos em caso de falha' },
            { id: 'd', text: 'Containers que nunca são reiniciados' }
          ],
          answer: 'c',
          explanation: 'Cattle são intercambiáveis; containers favorecem essa abordagem.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual prática do 12-factor se aplica a logs em containers?',
          choices: [
            { id: 'a', text: 'Gravar em arquivos dentro da imagem' },
            { id: 'b', text: 'Escrever em stdout/stderr e deixar a plataforma coletar' },
            { id: 'c', text: 'Enviar cada log por e-mail ao time' },
            { id: 'd', text: 'Rotacionar manualmente dentro do container' }
          ],
          answer: 'b',
          explanation: 'Logs como fluxo de eventos para a saída padrão; a infraestrutura os roteia.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Para que serve a idempotência diante de retries?',
          choices: [
            { id: 'a', text: 'Fazer a operação rodar mais rápido' },
            { id: 'b', text: 'Impedir que a operação seja repetida' },
            { id: 'c', text: 'Criptografar a requisição' },
            { id: 'd', text: 'Repetir a operação sem produzir efeito adicional além do primeiro' }
          ],
          answer: 'd',
          explanation: 'Retries são inevitáveis; operação idempotente evita duplicar efeitos.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o termo da prática em que não se altera um container em execução, mas se troca a imagem: infraestrutura ___.',
          code: '# infraestrutura ___\n# muda a imagem, recria o container',
          accept: ['imutável', 'imutavel', 'immutable'],
          explanation: 'Infraestrutura imutável: toda mudança gera nova imagem e recriação.'
        }
      ]
    },
    {
      id: 'cta-18-observabilidade',
      title: 'Observabilidade de containers',
      goal: 'Coletar e correlacionar logs, métricas e traces, usar Prometheus e Grafana, definir alertas com SLI/SLO e manter a telemetria em conformidade com a LGPD.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Os três pilares',
            body: 'Observabilidade é a capacidade de entender o estado interno do sistema a partir do que ele emite. Três tipos de sinal: logs (registros de eventos, ricos em detalhe), métricas (números agregados ao longo do tempo, baratos e ótimos para tendências e alertas) e traces (o caminho de uma requisição por vários serviços, mostrando onde o tempo foi gasto). Cada um responde perguntas diferentes e eles se complementam.'
          },
          {
            title: 'Métricas de host e containers',
            body: 'O cAdvisor coleta uso de CPU, memória, rede e disco por container e expõe como métricas. O node exporter faz o mesmo para o host (CPU, disco, memória, rede da máquina). Ambos expõem endpoints HTTP que um coletor lê. Complementam docker stats, que é pontual e manual, com histórico consultável e alertável.'
          },
          {
            title: 'Prometheus: pull e tipos de métrica',
            body: 'O Prometheus é um banco de séries temporais que usa o modelo pull: ele busca (scrape) periodicamente o endpoint /metrics de cada alvo, descoberto por configuração. Tipos: counter só cresce (total de requisições, de erros; zera ao reiniciar); gauge sobe e desce (memória em uso, itens na fila); histogram distribui observações em faixas (buckets), permitindo calcular percentis de latência. Rótulos (labels) criam dimensões, mas cuidado: rótulo com muitos valores únicos (ID de usuário) explode o custo.',
            code: 'scrape_configs:\n  - job_name: app\n    scrape_interval: 15s\n    static_configs:\n      - targets: ["app:8080"]'
          },
          {
            title: 'PromQL e Grafana',
            body: 'PromQL é a linguagem de consulta. Como counters só crescem, o usual é medir a taxa com rate() numa janela: rate(http_requests_total[5m]) dá requisições por segundo na média dos últimos 5 minutos. Para latência, histogram_quantile calcula percentis sobre os buckets de um histogram. O Grafana é a camada de visualização: conecta a fontes como Prometheus e Loki e monta dashboards e alertas.',
            code: 'rate(http_requests_total[5m])\nhistogram_quantile(0.95,\n  sum by (le) (rate(http_request_duration_seconds_bucket[5m])))'
          },
          {
            title: 'Logs centralizados e tracing',
            body: 'Logs em cada container somem quando o container some; por isso se coleta (agente como Promtail, Fluent Bit ou Filebeat) e envia a um local central e pesquisável: Loki (indexa só rótulos, barato) ou a pilha ELK (Elasticsearch, Logstash/Beats, Kibana, com indexação completa do texto). Tracing distribuído acompanha uma requisição entre serviços: cada etapa é um span, e o conjunto compõe o trace. OpenTelemetry é o padrão aberto de instrumentação e formato para traces, métricas e logs, independente de fornecedor.'
          },
          {
            title: 'Alertas, SLI e SLO',
            body: 'Alerta bom avisa sobre sintoma que afeta o usuário e exige ação, não sobre cada oscilação. SLI (indicador) é uma medida do serviço, como a proporção de requisições bem-sucedidas ou a latência do percentil 95. SLO (objetivo) é a meta para esse indicador num período, por exemplo "99,9% de sucesso em 30 dias". A diferença entre 100% e o SLO é o orçamento de erro, que orienta quanto risco de mudança é aceitável. Alerte por consumo do orçamento, não por métrica interna isolada.'
          },
          {
            title: 'Correlação e privacidade (LGPD)',
            body: 'Para ligar os sinais, propague um ID de correlação (request ID ou trace ID) por todos os serviços e inclua-o em cada linha de log: dado um trace lento, você encontra os logs exatos. Atenção à LGPD (Lei 13.709/2018): telemetria também pode conter dados pessoais (CPF, e-mail, IP, tokens, corpo de requisições). Aplique minimização: não registre o que não precisa, mascare ou omita campos sensíveis, use identificadores não reversíveis, defina retenção curta, restrinja o acesso às ferramentas e proteja o armazenamento. Nunca registre senhas ou segredos.',
            code: '{"ts":"2026-01-10T12:00:00Z","trace_id":"4bf92f35","nivel":"erro",\n "msg":"falha ao processar pedido","usuario_id":"u-8f3a (pseudônimo)"}'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual sinal de observabilidade mostra o caminho de uma requisição por vários serviços?',
          choices: [
            { id: 'a', text: 'Gauge' },
            { id: 'b', text: 'Trace' },
            { id: 'c', text: 'Métrica de counter' },
            { id: 'd', text: 'Healthcheck' }
          ],
          answer: 'b',
          explanation: 'Um trace é composto de spans, um por etapa em cada serviço.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Como o Prometheus obtém as métricas dos alvos?',
          choices: [
            { id: 'a', text: 'Os alvos empurram por e-mail' },
            { id: 'b', text: 'Lendo os logs dos containers' },
            { id: 'c', text: 'Por SSH em cada nó' },
            { id: 'd', text: 'Por pull: faz scrape periódico do endpoint /metrics' }
          ],
          answer: 'd',
          explanation: 'O modelo é pull; os alvos expõem /metrics.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual tipo de métrica só cresce e zera ao reiniciar o processo?',
          choices: [
            { id: 'a', text: 'Counter' },
            { id: 'b', text: 'Gauge' },
            { id: 'c', text: 'Histogram, sempre' },
            { id: 'd', text: 'Label' }
          ],
          answer: 'a',
          explanation: 'Counter acumula (total de requisições); gauge pode subir e descer.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a função PromQL usada para calcular a taxa por segundo de um counter numa janela.',
          code: '___(http_requests_total[5m])',
          accept: ['rate', 'rate()'],
          explanation: 'rate calcula a variação média por segundo do counter na janela.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que é um SLO?',
          choices: [
            { id: 'a', text: 'O número de réplicas do serviço' },
            { id: 'b', text: 'O tamanho do dashboard no Grafana' },
            { id: 'c', text: 'A meta para um indicador (SLI) num período, como 99,9% de sucesso em 30 dias' },
            { id: 'd', text: 'Uma consulta PromQL' }
          ],
          answer: 'c',
          explanation: 'SLI mede; SLO define o alvo; a folga vira orçamento de erro.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual é a diferença básica entre Loki e Elasticsearch no tratamento de logs?',
          choices: [
            { id: 'a', text: 'Loki só funciona para métricas' },
            { id: 'b', text: 'Elasticsearch não pesquisa texto' },
            { id: 'c', text: 'Loki indexa principalmente os rótulos; Elasticsearch indexa o conteúdo do texto' },
            { id: 'd', text: 'Ambos guardam apenas traces' }
          ],
          answer: 'c',
          explanation: 'Loki é mais barato por indexar menos; ELK permite buscas de texto completo.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'No log JSON abaixo, qual campo permite ligar a linha a um trace?\n\n{"trace_id":"4bf92f35","nivel":"erro","msg":"timeout"}',
          choices: [
            { id: 'a', text: 'trace_id' },
            { id: 'b', text: 'nivel' },
            { id: 'c', text: 'msg' },
            { id: 'd', text: 'o formato JSON em si' }
          ],
          answer: 'a',
          explanation: 'O trace_id é o ID de correlação com o trace distribuído.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete: a medida de um serviço como a proporção de requisições bem-sucedidas chama-se ___ (sigla de indicador de nível de serviço).',
          code: 'SLI = proporção de sucesso\n# a sigla: ___',
          accept: ['SLI', 'sli'],
          explanation: 'SLI é o indicador; o SLO é a meta sobre ele.'
        }
      ]
    },
    {
      id: 'cta-19-performance',
      title: 'Desempenho: build, I/O, CPU e rede',
      goal: 'Identificar e reduzir gargalos de build, pull, inicialização, disco, CPU e rede em containers, sempre medindo antes de otimizar.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Medir antes de otimizar',
            body: 'Otimizar sem medir é chute. Primeiro defina a métrica (tempo de build, tamanho de imagem, latência p95, uso de CPU), meça a linha de base, mude uma coisa por vez e meça de novo. Para uso de recursos em tempo real use docker stats, que mostra CPU, memória, rede e I/O por container; para carga use ferramentas de benchmark adequadas ao serviço (por exemplo wrk ou k6 para HTTP). Otimize o gargalo real, não o que parece lento.',
            code: 'docker stats --no-stream\n# CPU %, MEM USAGE / LIMIT, NET I/O, BLOCK I/O por container'
          },
          {
            title: 'Tempo de build: cache de camadas',
            body: 'Cada instrução do Dockerfile gera uma camada que é reaproveitada do cache enquanto ela e tudo acima dela não mudarem; ao invalidar uma camada, todas as seguintes são refeitas. Por isso, ordene do que muda menos para o que muda mais: copie primeiro os arquivos de dependência (package.json e lockfile), instale, e só depois copie o código. Assim, alterar um arquivo de código não refaz a instalação de dependências. O .dockerignore reduz o contexto enviado e evita invalidações por arquivos irrelevantes.',
            code: 'COPY package.json package-lock.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build'
          },
          {
            title: 'Cache do BuildKit e cache remoto',
            body: 'O BuildKit permite um cache de diretório que persiste entre builds mesmo quando a camada é invalidada, útil para gerenciadores de pacotes. Em CI, onde cada runner começa limpo, o cache pode ser exportado e importado de um registry com --cache-to e --cache-from, de modo que builds novos reaproveitem camadas anteriores.',
            code: 'RUN --mount=type=cache,target=/root/.npm npm ci\n\ndocker buildx build \\\n  --cache-from type=registry,ref=reg.exemplo/app:cache \\\n  --cache-to type=registry,ref=reg.exemplo/app:cache,mode=max \\\n  -t reg.exemplo/app:1.0 .'
          },
          {
            title: 'Tamanho da imagem e inicialização',
            body: 'Imagens menores são puxadas mais rápido (menos bytes na rede e no disco), reduzem a superfície de ataque e aceleram o escalonamento. Use bases enxutas, multi-stage e remova caches de pacotes na mesma camada em que foram criados. O tempo de inicialização depende também da aplicação: carregar classes, abrir pools de conexão, aquecer caches. Medir quanto o app leva até ficar pronto guia o uso de startup probes e a escolha entre tecnologias de runtime.'
          },
          {
            title: 'I/O: volume, bind mount e overlay',
            body: 'Escrever no sistema de arquivos do container (overlayfs, camada gravável) é mais lento e passa por copy-on-write; para escrita intensa (bancos, cache em disco) use volumes, que gravam direto no sistema de arquivos do host sem a camada union. Bind mounts apontam para um diretório do host e têm desempenho próximo ao nativo no Linux, mas no Docker Desktop (Windows e macOS) a pasta cruza a fronteira entre sistema do host e a VM Linux, o que pode deixá-los bem mais lentos em projetos com muitos arquivos (como node_modules). Alternativas: volume nomeado para dependências ou, no Windows, manter o projeto dentro do sistema de arquivos do WSL2.'
          },
          {
            title: 'CPU: limits e throttling',
            body: 'Limites de CPU (--cpus, ou limits.cpu no Kubernetes) são aplicados pelo cgroup como cota de tempo por período. Se o processo usa a cota antes do fim do período, é pausado até o próximo: o throttling. O efeito é aumento de latência sem o container ser morto, e pode ocorrer mesmo com CPU "sobrando" no host. Limites de CPU muito baixos prejudicam apps com picos. Diferente da memória (ao passar do limite, OOMKilled), a CPU é compressível: excesso vira espera, não morte.'
          },
          {
            title: 'Rede: bridge, host e overhead',
            body: 'No modo bridge padrão, o tráfego passa por NAT e pela rede virtual do Docker, o que adiciona uma pequena sobrecarga, normalmente irrelevante, mas perceptível em cargas de altíssimo volume de pacotes. Com --network host o container usa a pilha de rede do host, sem NAT nem mapeamento de portas, com menor latência, mas sem isolamento de rede e com risco de conflito de portas; só no Linux. Para comunicação entre containers, uma rede definida pelo usuário com DNS interno é o equilíbrio usual. Decida por medição, não por suposição.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual é o primeiro passo recomendado antes de otimizar?',
          choices: [
            { id: 'a', text: 'Reduzir todos os limites de CPU' },
            { id: 'b', text: 'Trocar a base por outra mais popular' },
            { id: 'c', text: 'Desativar o cache de camadas' },
            { id: 'd', text: 'Medir a linha de base e identificar o gargalo real' }
          ],
          answer: 'd',
          explanation: 'Sem medição não se sabe o que melhorar nem se melhorou.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Para aproveitar o cache de camadas, qual ordem de instruções é mais eficiente em um app Node?',
          choices: [
            { id: 'a', text: 'Copiar todo o código antes de instalar dependências' },
            { id: 'b', text: 'Copiar package.json e lockfile, instalar dependências e só depois copiar o código' },
            { id: 'c', text: 'Instalar dependências antes de copiar qualquer arquivo' },
            { id: 'd', text: 'A ordem é irrelevante para o cache' }
          ],
          answer: 'b',
          explanation: 'Mudar o código não invalida a camada de instalação, que vem antes.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Para que servem --cache-from e --cache-to em CI?',
          choices: [
            { id: 'a', text: 'Reaproveitar camadas entre builds exportando/importando cache de um registry' },
            { id: 'b', text: 'Limitar CPU durante o build' },
            { id: 'c', text: 'Assinar a imagem final' },
            { id: 'd', text: 'Escolher a plataforma da imagem' }
          ],
          answer: 'a',
          explanation: 'Runners efêmeros começam sem cache; o cache remoto resolve isso.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o comando que mostra uso de CPU e memória por container, sem ficar atualizando.',
          code: 'docker ___ --no-stream',
          accept: ['stats', 'docker stats --no-stream'],
          explanation: 'docker stats exibe o consumo de recursos dos containers.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Por que bind mounts podem ser lentos no Docker Desktop?',
          choices: [
            { id: 'a', text: 'Bind mounts são sempre criptografados' },
            { id: 'b', text: 'O Docker Desktop não suporta overlayfs' },
            { id: 'c', text: 'Os arquivos cruzam a fronteira entre o sistema do host e a VM Linux' },
            { id: 'd', text: 'Bind mounts usam rede por TCP obrigatoriamente em todos os sistemas' }
          ],
          answer: 'c',
          explanation: 'No Linux nativo o bind mount é quase nativo; no Desktop há essa travessia.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que acontece quando um container ultrapassa seu limite de CPU?',
          choices: [
            { id: 'a', text: 'Recebe OOMKilled imediatamente' },
            { id: 'b', text: 'É sofrido throttling (pausas), aumentando a latência, sem ser morto' },
            { id: 'c', text: 'O Docker recria o container em outro host' },
            { id: 'd', text: 'Recebe mais CPU automaticamente' }
          ],
          answer: 'b',
          explanation: 'CPU é compressível; memória acima do limite leva a OOMKilled.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual é uma desvantagem de --network host?',
          choices: [
            { id: 'a', text: 'Impede acesso à internet' },
            { id: 'b', text: 'Aumenta a latência por NAT extra' },
            { id: 'c', text: 'Cria uma rede overlay' },
            { id: 'd', text: 'Perde o isolamento de rede e pode haver conflito de portas com o host' }
          ],
          answer: 'd',
          explanation: 'O container compartilha a pilha de rede do host.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a instrução do BuildKit que usa um cache persistente de diretório no RUN.',
          code: 'RUN --mount=type=___,target=/root/.npm npm ci',
          accept: ['cache', 'type=cache'],
          explanation: 'type=cache mantém o diretório entre builds, acelerando instalações.'
        }
      ]
    },
    {
      id: 'cta-32-gpu-hardware-arm',
      title: 'Containers com GPU, dispositivos e outras arquiteturas',
      goal: 'Dar a containers acesso controlado a dispositivos e GPUs, empacotar cargas de IA/ML com boas práticas e lidar com ARM versus x86.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O container usa o kernel e os drivers do host',
            body: 'Um container não traz kernel nem drivers de hardware: ele usa o kernel do host. Por isso, para acessar hardware, o host precisa ter o driver instalado e o dispositivo precisa ser exposto ao container. Por padrão o container enxerga só um conjunto mínimo de dispositivos (como /dev/null e /dev/zero), com acesso limitado pelo cgroup de dispositivos. Imagem alguma consegue "instalar" um driver de kernel por dentro do container.'
          },
          {
            title: 'Acesso a dispositivos com --device',
            body: 'A forma correta de dar acesso a um dispositivo (uma porta serial, uma câmera) é expor só aquele dispositivo com --device. A flag cria o arquivo de dispositivo no container e libera o acesso no cgroup de devices; as permissões r (ler), w (escrever) e m (mknod) podem ser restritas com um sufixo. O processo ainda precisa de permissão de arquivo, geralmente via grupo do dispositivo (--group-add). Evite --privileged: ele concede quase todos os dispositivos e capabilities do host, o que é desproporcional e perigoso para resolver um problema de hardware.',
            code: 'docker run --rm --device=/dev/ttyUSB0:/dev/ttyUSB0:rw --group-add dialout minhaapp:1.0'
          },
          {
            title: 'GPU NVIDIA e o NVIDIA Container Toolkit',
            body: 'Para usar GPU NVIDIA, o driver NVIDIA fica instalado no host e o NVIDIA Container Toolkit conecta o runtime ao driver: ao iniciar o container, ele injeta os dispositivos e as bibliotecas do driver do host. Depois, o comando é simples: docker run --gpus all. Dentro, nvidia-smi confirma se a GPU está visível. A imagem traz as bibliotecas do APLICATIVO (CUDA, cuDNN, frameworks), mas não o driver. Atenção à compatibilidade: a versão do CUDA da imagem precisa ser suportada pelo driver do host; driver mais antigo que o exigido pelas libs quebra a carga.',
            code: 'docker run --rm --gpus all nvidia/cuda:EXEMPLO-base nvidia-smi\n\n# escolher só uma GPU:\ndocker run --rm --gpus device=0 minhaapp-ml:1.0'
          },
          {
            title: 'CDI: Container Device Interface',
            body: 'Cada fabricante de hardware tinha seu próprio jeito de integrar com runtimes. O CDI (Container Device Interface) é uma especificação aberta que padroniza isso: o fabricante (ou uma ferramenta) gera uma descrição de dispositivos, com os nomes qualificados no formato fabricante/classe=nome, e os runtimes compatíveis sabem expor o dispositivo ao container a partir dessa descrição. O resultado é suporte uniforme a GPUs e outros aceleradores entre runtimes diferentes, sem lógica específica em cada um.'
          },
          {
            title: 'Cargas de IA/ML: imagens, modelos e reprodutibilidade',
            body: 'Imagens base de CUDA têm variações: base (mínima), runtime (com as bibliotecas para executar) e devel (com compiladores, bem maior). Use runtime em produção e devel só para compilar (multi-stage). Imagens de ML ficam grandes: gerenciar camadas e cache é essencial. Modelos podem ter muitos gigabytes: NÃO os coloque na imagem; guarde em volume ou cache persistente (ou baixe de um armazenamento de modelos na partida), assim a imagem é pequena e o modelo é versionado à parte. Para reprodutibilidade, fixe versões de CUDA, do framework e das dependências, referencie a base por digest e registre a versão do modelo usada.'
          },
          {
            title: 'ARM versus x86',
            body: 'Imagens são específicas de arquitetura de CPU: amd64 (x86-64) e arm64 (ARM). Máquinas com chip ARM (muitos notebooks e servidores de nuvem) rodam imagens arm64 nativamente. Imagens multi-arch (um índice apontando para uma imagem por plataforma) deixam o mesmo nome funcionar em ambas, e --platform escolhe qual usar. Rodar uma imagem de outra arquitetura funciona por emulação, mas é bem mais lento e pode falhar em programas que usam instruções específicas; o Docker avisa quando a plataforma da imagem não bate com a do host. Prefira imagens nativas; em produção, cuide de que os nós e as imagens combinem.',
            code: 'docker run --rm --platform linux/arm64 alpine uname -m\n# aarch64\n\n# aviso típico de incompatibilidade:\n# WARNING: The requested image\'s platform (linux/amd64) does not match\n# the detected host platform (linux/arm64/v8)'
          },
          {
            title: 'Kubernetes: device plugins',
            body: 'No Kubernetes, o kubelet não conhece GPUs por conta própria. Um device plugin (instalado, em geral, como DaemonSet, que você já conhece) anuncia ao kubelet um recurso estendido, como nvidia.com/gpu. O Pod pede esse recurso em resources.limits, em quantidades inteiras, e o scheduler só o coloca em nós que o ofereçam. Não é preciso --gpus: o plugin e o runtime fazem a ligação. Para misturar nós ARM e x86, use labels como kubernetes.io/arch no nodeSelector.',
            code: 'resources:\n  limits:\n    nvidia.com/gpu: 1'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Por que o driver de uma GPU precisa estar instalado no host e não dentro da imagem?',
          choices: [
            { id: 'a', text: 'Porque imagens não podem conter bibliotecas' },
            { id: 'b', text: 'Porque a GPU só funciona com imagens Alpine' },
            { id: 'c', text: 'Porque o Docker baixa o driver depois da partida' },
            { id: 'd', text: 'Porque o container usa o kernel do host, e drivers de kernel pertencem ao host' }
          ],
          answer: 'd',
          explanation: 'O container compartilha o kernel do host. A imagem traz as bibliotecas da aplicação (CUDA etc.), não o driver.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Uma aplicação precisa ler uma porta serial do host. Qual é a abordagem adequada?',
          choices: [
            { id: 'a', text: 'Expor apenas aquele dispositivo com --device, ajustando permissões de grupo' },
            { id: 'b', text: 'Usar --privileged para liberar tudo' },
            { id: 'c', text: 'Montar o / do host dentro do container' },
            { id: 'd', text: 'Reinstalar o driver dentro da imagem' }
          ],
          answer: 'a',
          explanation: '--device concede só o necessário. --privileged dá quase todos os dispositivos e capabilities do host.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'No uso de GPU NVIDIA com containers, como fica a divisão entre host e imagem?',
          choices: [
            { id: 'a', text: 'O host só fornece a CPU; o driver vem na imagem' },
            { id: 'b', text: 'Tanto o driver quanto o toolkit devem estar dentro da imagem' },
            { id: 'c', text: 'O driver fica no host com o NVIDIA Container Toolkit; a imagem traz as bibliotecas da aplicação' },
            { id: 'd', text: 'Nada é necessário no host' }
          ],
          answer: 'c',
          explanation: 'O toolkit injeta no container o que vem do driver do host; a imagem carrega CUDA/frameworks compatíveis com esse driver.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a flag que expõe as GPUs do host ao container (com o NVIDIA Container Toolkit).',
          code: 'docker run --rm --___ all minhaapp-ml:1.0 nvidia-smi',
          accept: ['gpus', '--gpus'],
          explanation: '--gpus all expõe todas as GPUs; --gpus device=0 escolhe apenas uma.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que significa esta mensagem em um notebook com chip ARM?\n\nWARNING: The requested image\'s platform (linux/amd64) does not match the detected host platform (linux/arm64/v8)',
          choices: [
            { id: 'a', text: 'A imagem está corrompida e precisa ser baixada de novo' },
            { id: 'b', text: 'A imagem é x86 (amd64) e o host é ARM: rodará por emulação, mais lenta e com possíveis falhas; prefira uma imagem arm64' },
            { id: 'c', text: 'O host está sem memória' },
            { id: 'd', text: 'A imagem é multi-arch e foi dividida em duas partes' }
          ],
          answer: 'b',
          explanation: 'O aviso indica incompatibilidade de arquitetura. Imagens multi-arch evitam o problema, pois o cliente escolhe a variante nativa.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual é a melhor forma de lidar com um modelo de IA de dezenas de gigabytes?',
          choices: [
            { id: 'a', text: 'Embutir na imagem a cada build para garantir portabilidade' },
            { id: 'b', text: 'Colocar o modelo no repositório de código' },
            { id: 'c', text: 'Compactar com ZIP e copiar com COPY a cada mudança de código' },
            { id: 'd', text: 'Guardá-lo em volume ou cache persistente, versionado à parte, mantendo a imagem pequena' }
          ],
          answer: 'd',
          explanation: 'Imagens enormes tornam builds e pulls lentos. Um volume/cache mantém o modelo reaproveitável e versionado separadamente.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'O que este trecho de Pod indica?\n\nresources:\n  limits:\n    nvidia.com/gpu: 1',
          choices: [
            { id: 'a', text: 'Que o Pod usa 1% de uma GPU compartilhada' },
            { id: 'b', text: 'Que o Pod deve rodar como root' },
            { id: 'c', text: 'Que o Pod pede uma GPU, anunciada por um device plugin, e só será agendado em um nó que a ofereça' },
            { id: 'd', text: 'Que o nó tem um taint de GPU' }
          ],
          answer: 'c',
          explanation: 'Recursos estendidos são pedidos em quantidades inteiras em limits; o scheduler considera o que cada nó anuncia.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a flag que escolhe a arquitetura da imagem a ser executada.',
          code: 'docker run --rm --___ linux/arm64 alpine uname -m',
          accept: ['platform', '--platform'],
          explanation: '--platform seleciona a variante do índice multi-arch (ou força emulação se não for nativa).'
        }
      ]
    },
    {
      id: 'cta-20-builds-reproduziveis',
      title: 'Builds reproduzíveis e multiplataforma',
      goal: 'Tornar builds previsíveis (lockfiles, digests, SOURCE_DATE_EPOCH) e gerar imagens multiplataforma com buildx, bake e manifest lists.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Por que reprodutibilidade',
            body: 'Um build reproduzível produz o mesmo resultado a partir das mesmas entradas. Isso permite auditar (o que está em produção veio deste código?), depurar ("funciona na minha máquina" some) e confiar em assinaturas e scans. Os inimigos são entradas que mudam sem aviso: tags flutuantes de imagens base, dependências sem versão fixa, downloads sem verificação, horários e ordem de arquivos. A reprodutibilidade completa (bit a bit) é difícil; o objetivo prático é reduzir ao máximo a variação.'
          },
          {
            title: 'Fixando dependências e bases',
            body: 'Use lockfiles (package-lock.json, poetry.lock, go.sum) e instale a partir deles (npm ci), não versões flutuantes. Para a imagem base, uma tag como node:20 pode apontar para conteúdos diferentes amanhã; o digest sha256 identifica o conteúdo exato e é imutável. Combine tag legível e digest, e deixe uma automação (como Dependabot ou Renovate) propor atualizações revisáveis, para não ficar preso a versões com vulnerabilidades.',
            code: 'FROM node:20-slim@sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef\nCOPY package.json package-lock.json ./\nRUN npm ci'
          },
          {
            title: 'Timestamps e SOURCE_DATE_EPOCH',
            body: 'Datas de criação e de modificação de arquivos mudam a cada build e alteram o hash resultante. SOURCE_DATE_EPOCH é uma convenção: uma variável de ambiente com um instante Unix fixo (por exemplo o do commit) que ferramentas usam em vez da hora atual. O BuildKit a respeita para normalizar timestamps de camadas quando configurado. Junto com ordem estável de arquivos, aproxima builds idênticos.',
            code: 'export SOURCE_DATE_EPOCH=$(git log -1 --pretty=%ct)\ndocker buildx build --build-arg SOURCE_DATE_EPOCH=$SOURCE_DATE_EPOCH .'
          },
          {
            title: 'Multiplataforma: buildx e manifest list',
            body: 'Imagens são específicas de arquitetura (amd64, arm64). Para um nome de imagem funcionar em ambos, existe a manifest list (índice OCI): um índice que aponta para uma imagem por plataforma, e o cliente puxa a correta automaticamente. O docker buildx build com --platform gera todas e pode publicá-las juntas com --push.',
            code: 'docker buildx build \\\n  --platform linux/amd64,linux/arm64 \\\n  -t reg.exemplo/app:1.0 --push .'
          },
          {
            title: 'Emulação QEMU vs cross-compilation',
            body: 'Há duas formas de produzir a imagem de uma arquitetura diferente da sua. Emulação (QEMU): o build executa binários de outra arquitetura de forma emulada, funciona sem mudar o Dockerfile mas é bem mais lento. Cross-compilation: compilar nativamente no host para o alvo, usando as variáveis BUILDPLATFORM e TARGETPLATFORM / TARGETARCH em um estágio multi-stage; é rápido, mas exige suporte da linguagem (comum em Go e Rust). Outra opção é builders remotos nativos, um nó de cada arquitetura.',
            code: 'FROM --platform=$BUILDPLATFORM golang:1.23 AS build\nARG TARGETOS TARGETARCH\nRUN GOOS=$TARGETOS GOARCH=$TARGETARCH go build -o /app ./cmd/app'
          },
          {
            title: 'buildx bake com HCL',
            body: 'O docker buildx bake descreve builds em arquivo (HCL, JSON ou Compose) em vez de longas linhas de comando: vários alvos, plataformas, tags e argumentos versionados no Git e reproduzíveis em CI e local. Com ele um único comando constrói todos os alvos de um grupo.',
            code: 'group "default" {\n  targets = ["app"]\n}\ntarget "app" {\n  context   = "."\n  platforms = ["linux/amd64", "linux/arm64"]\n  tags      = ["reg.exemplo/app:1.0"]\n}\n# docker buildx bake'
          },
          {
            title: 'Alternativas ao Dockerfile',
            body: 'Alguns ecossistemas geram imagens sem escrever Dockerfile. Cloud Native Buildpacks (comando pack build) detectam a linguagem e montam a imagem com camadas e bases mantidas por terceiros. Jib (Maven e Gradle) constrói imagens de aplicações Java sem daemon Docker, separando dependências e classes em camadas. ko faz o mesmo para aplicações Go. Ganham padronização e rapidez; perdem controle fino sobre cada camada. Escolha pelo equilíbrio entre conveniência e controle.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Por que fixar a base por digest em vez de só pela tag?',
          choices: [
            { id: 'a', text: 'O digest deixa a imagem menor' },
            { id: 'b', text: 'O digest identifica o conteúdo exato e imutável, enquanto a tag pode mudar' },
            { id: 'c', text: 'A tag não funciona com FROM' },
            { id: 'd', text: 'O digest acelera o pull em 10 vezes' }
          ],
          answer: 'b',
          explanation: 'A tag é um ponteiro móvel; o digest é o hash do conteúdo.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Para que serve SOURCE_DATE_EPOCH?',
          choices: [
            { id: 'a', text: 'Definir a arquitetura do alvo' },
            { id: 'b', text: 'Escolher o registry de destino' },
            { id: 'c', text: 'Limitar o tempo máximo de build' },
            { id: 'd', text: 'Fixar o instante usado nos timestamps, evitando variação do horário do build' }
          ],
          answer: 'd',
          explanation: 'Ferramentas usam o valor fixo no lugar da hora atual.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que é uma manifest list (índice OCI)?',
          choices: [
            { id: 'a', text: 'Um índice que aponta para uma imagem por plataforma sob um mesmo nome' },
            { id: 'b', text: 'Uma lista de vulnerabilidades da imagem' },
            { id: 'c', text: 'Um arquivo com os volumes do container' },
            { id: 'd', text: 'A lista de camadas de uma única arquitetura' }
          ],
          answer: 'a',
          explanation: 'O cliente seleciona a entrada da sua arquitetura ao puxar.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a opção do buildx que define as arquiteturas alvo.',
          code: 'docker buildx build --___ linux/amd64,linux/arm64 -t app:1.0 .',
          accept: ['platform', '--platform'],
          explanation: '--platform lista as plataformas alvo do build.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Qual é a principal desvantagem da emulação QEMU em builds multiplataforma?',
          choices: [
            { id: 'a', text: 'Não funciona com Dockerfile' },
            { id: 'b', text: 'Gera imagens com arquitetura errada' },
            { id: 'c', text: 'É bem mais lenta que compilar nativamente ou fazer cross-compilation' },
            { id: 'd', text: 'Exige a troca de registry' }
          ],
          answer: 'c',
          explanation: 'Emular instruções de outra CPU custa desempenho; em contrapartida, não exige mudar o Dockerfile.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'No trecho abaixo, o que BUILDPLATFORM representa?\n\nFROM --platform=$BUILDPLATFORM golang:1.23 AS build\nARG TARGETARCH',
          choices: [
            { id: 'a', text: 'A arquitetura da imagem final, igual a TARGETARCH' },
            { id: 'b', text: 'O nome do registry usado' },
            { id: 'c', text: 'A plataforma onde o build roda; TARGETARCH é a arquitetura da imagem final' },
            { id: 'd', text: 'O nome do builder remoto' }
          ],
          answer: 'c',
          explanation: 'Compila-se nativamente no BUILDPLATFORM para o alvo indicado por TARGETARCH.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual é a vantagem de buildx bake?',
          choices: [
            { id: 'a', text: 'Descrever vários alvos, plataformas e tags em arquivo versionado e reproduzível' },
            { id: 'b', text: 'Substituir completamente o Dockerfile' },
            { id: 'c', text: 'Executar containers em produção' },
            { id: 'd', text: 'Criptografar o contexto de build' }
          ],
          answer: 'a',
          explanation: 'O HCL do bake registra a configuração de build no repositório.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o nome da ferramenta de Java que monta imagens sem Dockerfile nem daemon Docker.',
          code: '# Maven/Gradle: plugin ___',
          accept: ['Jib', 'jib'],
          explanation: 'Jib constrói imagens de apps Java em camadas otimizadas, sem Dockerfile.'
        }
      ]
    },
    {
      id: 'cta-21-cicd-gitops',
      title: 'CI/CD avançado e GitOps',
      goal: 'Construir e promover imagens em pipelines seguros, escolher estratégias de deploy e entender GitOps com Argo CD e Flux.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O problema do socket do Docker em CI',
            body: 'Para construir imagens dentro do CI é tentador montar /var/run/docker.sock no job. Quem acessa esse socket controla o daemon, que roda como root no host: na prática, é acesso root à máquina e a todos os outros containers. Um job de uma pull request maliciosa ou comprometida pode escapar. Alternativas: Docker-in-Docker (daemon próprio, mas exige container privilegiado, que também é arriscado) ou construtores que dispensam daemon privilegiado.'
          },
          {
            title: 'Construtores sem daemon privilegiado',
            body: 'BuildKit rootless, kaniko e buildah constroem imagens a partir de Dockerfile sem precisar do daemon do host (kaniko e buildah dentro do container ou do pod, sem privilégio total). Buildah dispensa daemon e pode rodar rootless. O principal ganho é reduzir o raio de ação de um compromisso do pipeline. Avalie a manutenção ativa e o suporte de cada projeto antes de adotar, pois o cenário de ferramentas muda.',
            code: '# exemplo conceitual com buildah (sem daemon)\nbuildah bud -t reg.exemplo/app:1.0 .\nbuildah push reg.exemplo/app:1.0'
          },
          {
            title: 'Runners efêmeros e cache',
            body: 'Runners efêmeros são criados para um único job e destruídos depois: não carregam credenciais, caches e arquivos de jobs anteriores, o que reduz vazamento e contaminação entre builds. O custo é começar sem cache; por isso se usa cache remoto de camadas (registry) ou cache de dependências do próprio CI, com chave baseada no hash do lockfile para invalidar na mudança correta. Cuidado para que o cache de pull requests de terceiros não envenene o das branches protegidas.'
          },
          {
            title: 'Promoção por digest entre ambientes',
            body: 'Construa a imagem uma única vez e promova a mesma imagem por dev, homologação e produção, em vez de reconstruir em cada ambiente. O que foi testado é então exatamente o que vai para produção. A referência imutável é o digest (image@sha256:...), pois tags podem ser sobrescritas. A promoção pode ser só uma atualização de referência ou uma nova tag apontando para o mesmo digest, depois de passar nos testes, scan e assinatura.',
            code: 'docker buildx imagetools create \\\n  -t reg.exemplo/app:prod reg.exemplo/app@sha256:<digest-testado>'
          },
          {
            title: 'Estratégias de deploy',
            body: 'Rolling: substitui as instâncias aos poucos; simples e sem custo extra, mas por um tempo duas versões convivem. Blue-green: mantém dois ambientes completos; prepara o novo (green) e troca o tráfego de uma vez, com rollback quase imediato, ao custo de duplicar recursos. Canário: envia uma pequena fração do tráfego à nova versão, observa métricas e amplia gradualmente, limitando o impacto de uma falha. A escolha depende de risco, custo e compatibilidade de dados entre versões.'
          },
          {
            title: 'GitOps: Argo CD e Flux',
            body: 'GitOps usa o Git como fonte única da verdade do estado desejado da infraestrutura e das aplicações. Um agente dentro do cluster (Argo CD ou Flux) observa o repositório e reconcilia o cluster com ele, em modelo pull: o cluster busca mudanças, em vez de o CI ter credenciais para empurrá-las. Vantagens: histórico e revisão por pull request, auditoria, rollback com git revert e detecção de deriva (drift) entre o cluster e o Git. O pipeline de CI só publica a imagem e atualiza a referência no repositório de configuração.'
          },
          {
            title: 'Segurança do pipeline',
            body: 'O pipeline é alvo valioso: tem acesso a código, segredos e produção. Boas práticas: tokens de menor privilégio e curta duração (por exemplo identidade federada OIDC no lugar de chaves estáticas); segredos guardados no cofre do CI e mascarados nos logs, nunca no repositório nem em ARG/camadas; escopo por ambiente; aprovação manual para produção; branches protegidas e revisão obrigatória; versões fixas (por digest ou commit) das actions e imagens usadas no pipeline; separação entre jobs que rodam código não confiável e jobs com segredos. Registre auditoria de quem aprovou e implantou.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Por que montar /var/run/docker.sock em um job de CI é perigoso?',
          choices: [
            { id: 'a', text: 'O socket impede o uso de cache' },
            { id: 'b', text: 'Torna o build mais lento por criptografia' },
            { id: 'c', text: 'Só funciona em Windows' },
            { id: 'd', text: 'Dá controle do daemon, que roda como root no host, equivalente a acesso root à máquina' }
          ],
          answer: 'd',
          explanation: 'Quem fala com o daemon pode criar containers privilegiados com o host montado.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual é a vantagem de runners efêmeros?',
          choices: [
            { id: 'a', text: 'Mantêm cache de todos os projetos para sempre' },
            { id: 'b', text: 'Cada job começa limpo, sem credenciais ou resíduos de jobs anteriores' },
            { id: 'c', text: 'Dispensam autenticação no registry' },
            { id: 'd', text: 'Executam mais de um job em paralelo no mesmo container' }
          ],
          answer: 'b',
          explanation: 'Efêmeros reduzem vazamento e contaminação entre execuções.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Por que promover a imagem por digest entre ambientes?',
          choices: [
            { id: 'a', text: 'Garante que o artefato testado seja exatamente o que vai para produção, pois o digest é imutável' },
            { id: 'b', text: 'O digest é menor que a tag' },
            { id: 'c', text: 'Evita a necessidade de registry' },
            { id: 'd', text: 'Permite reconstruir a imagem a cada ambiente' }
          ],
          answer: 'a',
          explanation: 'Tags podem ser reatribuídas; o digest identifica o conteúdo.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o nome da estratégia que envia uma pequena fração do tráfego à nova versão antes de ampliar.',
          code: '# estratégia de deploy: ___ (fração do tráfego)',
          accept: ['canário', 'canario', 'canary'],
          explanation: 'No canário, a nova versão recebe pouco tráfego e é observada antes de ser ampliada.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Qual é a característica central do GitOps com Argo CD ou Flux?',
          choices: [
            { id: 'a', text: 'O CI empurra mudanças usando credenciais de administrador do cluster' },
            { id: 'b', text: 'O Git é substituído por um banco de dados' },
            { id: 'c', text: 'Um agente no cluster reconcilia o estado com o repositório Git (modelo pull)' },
            { id: 'd', text: 'Só funciona sem Kubernetes' }
          ],
          answer: 'c',
          explanation: 'O Git é a fonte da verdade e o agente corrige deriva automaticamente.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual destas é uma boa prática de segurança em pipelines?',
          choices: [
            { id: 'a', text: 'Salvar tokens de produção no repositório' },
            { id: 'b', text: 'Usar identidade federada OIDC de curta duração em vez de chaves estáticas' },
            { id: 'c', text: 'Dar a todo job permissão de administrador' },
            { id: 'd', text: 'Imprimir os segredos no log para depurar' }
          ],
          answer: 'b',
          explanation: 'Credenciais temporárias e de menor privilégio reduzem o impacto de vazamentos.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual estratégia mantém dois ambientes completos e troca o tráfego de uma vez?',
          choices: [
            { id: 'a', text: 'Rolling update' },
            { id: 'b', text: 'Canário' },
            { id: 'c', text: 'Recreate parcial por réplica' },
            { id: 'd', text: 'Blue-green' }
          ],
          answer: 'd',
          explanation: 'Blue-green permite voltar quase instantaneamente ao ambiente antigo.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o termo: o Git como fonte da verdade do estado desejado, reconciliado por um agente, chama-se ___.',
          code: '# prática: ___ (Argo CD / Flux)',
          accept: ['GitOps', 'gitops'],
          explanation: 'GitOps é a operação baseada em Git com reconciliação contínua.'
        }
      ]
    },
    {
      id: 'cta-22-dados-stateful',
      title: 'Dados persistentes e cargas stateful',
      goal: 'Decidir quando rodar banco em container e operar dados com backup consistente, restore testado, migrações, upgrades, criptografia e retenção.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Banco em container: quando sim e quando não',
            body: 'Rodar banco em container é ótimo em desenvolvimento, testes e CI (rápido, descartável, versão idêntica à produção). Em produção é possível e comum, mas exige cuidado: armazenamento durável, backups, monitoramento, ajuste de recursos e um plano de alta disponibilidade. Muitas equipes preferem um serviço gerenciado (o provedor cuida de backup, patches e failover), por custo operacional. A decisão é entre controle e responsabilidade operacional; não existe resposta única.'
          },
          {
            title: 'Volumes, drivers e armazenamento em rede',
            body: 'Dados do banco devem ficar em volume (nomeado) ou outro armazenamento persistente, nunca na camada gravável do container. Volumes aceitam drivers para armazenamento remoto (NFS, SAN, nuvem). Em Kubernetes, a interface CSI (Container Storage Interface) padroniza como provedores de armazenamento se integram, e StorageClass/PVC consomem isso. Armazenamento em rede traz latência e atenção ao desempenho de I/O e ao acesso concorrente: muitos bancos exigem que só uma instância escreva nos arquivos de dados.'
          },
          {
            title: 'Backups consistentes e snapshots',
            body: 'Copiar arquivos de dados com o banco escrevendo pode gerar cópia corrompida. Formas consistentes: dump lógico com a ferramenta do banco (pg_dump, mysqldump), backup físico com a ferramenta oficial ou snapshot de volume/armazenamento coordenado (por exemplo, com o banco em modo de backup ou com cópia crash-consistent que o banco sabe recuperar). Guarde backups fora do host e do mesmo domínio de falha, com criptografia e controle de acesso. A regra 3-2-1: três cópias, duas mídias, uma fora do local.',
            code: 'docker exec db pg_dump -U app -Fc appdb > /backup/appdb.dump'
          },
          {
            title: 'Restore testado',
            body: 'Backup que nunca foi restaurado é uma esperança, não um backup. Teste periodicamente a restauração em ambiente isolado e meça o tempo necessário: o RTO (tempo para voltar) e o RPO (quanta perda de dados é aceitável, definindo a frequência do backup). Automatize o teste e verifique a integridade dos dados restaurados.',
            code: 'docker exec -i db pg_restore -U app -d appdb_teste --clean < /backup/appdb.dump'
          },
          {
            title: 'Migrações de esquema',
            body: 'O esquema evolui com a aplicação. Use uma ferramenta de migração versionada (Flyway, Liquibase, Alembic, Prisma Migrate, entre outras) com scripts no repositório, executados de forma controlada, e não por alguém logado no banco. Em rolling update, versões antiga e nova da app convivem, então migrações devem ser compatíveis com ambas: o padrão expandir e contrair (primeiro adicionar colunas, depois migrar o uso, e só depois remover o que ficou obsoleto). Evite migrações destrutivas e bloqueantes sem plano.'
          },
          {
            title: 'Replicação e upgrade de versão',
            body: 'Replicação mantém cópias do banco em outros nós: réplicas de leitura distribuem consultas e uma réplica standby pode assumir se o primário falhar (failover). Vem com atraso de replicação e a necessidade de lidar com perda de dados em falha. Upgrades de versão maior geralmente mudam o formato dos dados e exigem procedimento próprio (dump e restore ou ferramenta de upgrade); trocar a tag da imagem não basta e pode impedir o banco de subir. Rotina: ler as notas de versão, fazer backup, testar em cópia, ter plano de reversão e então executar.'
          },
          {
            title: 'Criptografia e retenção',
            body: 'Criptografia em repouso protege os dados caso discos, snapshots ou backups sejam acessados indevidamente: criptografia de volume ou disco, do armazenamento ou do próprio banco, com chaves guardadas separadamente em um gerenciador de chaves. Em trânsito use TLS entre aplicação e banco. Defina também retenção: por quanto tempo guardar dados e backups, e como eliminar de forma comprovada quando o prazo vence, incluindo cópias nos backups. Dados pessoais só devem permanecer enquanto houver finalidade (veja a lição de LGPD).'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Onde os dados de um banco em container devem ficar?',
          choices: [
            { id: 'a', text: 'Na camada gravável, pois é mais rápida' },
            { id: 'b', text: 'Em volume ou outro armazenamento persistente, fora da camada gravável do container' },
            { id: 'c', text: 'Na própria imagem' },
            { id: 'd', text: 'Em variáveis de ambiente' }
          ],
          answer: 'b',
          explanation: 'Sem volume, os dados somem com o container e o overlay é pior para I/O.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Por que copiar os arquivos de dados com o banco ativo pode ser arriscado?',
          choices: [
            { id: 'a', text: 'Os arquivos ficam criptografados' },
            { id: 'b', text: 'O Docker bloqueia leitura de volumes' },
            { id: 'c', text: 'A cópia dobra o tamanho dos dados' },
            { id: 'd', text: 'A cópia pode ficar inconsistente, pois o banco continua escrevendo' }
          ],
          answer: 'd',
          explanation: 'Use dump, ferramenta oficial de backup ou snapshot coordenado.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que o RPO representa?',
          choices: [
            { id: 'a', text: 'A quantidade máxima de perda de dados aceitável, que orienta a frequência de backup' },
            { id: 'b', text: 'O tempo para restaurar o serviço' },
            { id: 'c', text: 'O número de réplicas de leitura' },
            { id: 'd', text: 'O tamanho máximo do volume' }
          ],
          answer: 'a',
          explanation: 'RTO é o tempo para voltar; RPO é a perda tolerável de dados.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o comando usado para gerar um dump lógico do PostgreSQL.',
          code: 'docker exec db ___ -U app appdb > dump.sql',
          accept: ['pg_dump', 'pg_dump -U app'],
          explanation: 'pg_dump gera um dump lógico consistente do banco.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Em um rolling update, por que migrações devem ser compatíveis com duas versões da app?',
          choices: [
            { id: 'a', text: 'Porque o banco duplica as tabelas durante o update' },
            { id: 'b', text: 'Porque apenas a versão antiga acessa o banco' },
            { id: 'c', text: 'Porque versão antiga e nova coexistem durante a troca' },
            { id: 'd', text: 'Porque migrações não podem alterar colunas' }
          ],
          answer: 'c',
          explanation: 'O padrão expandir e contrair mantém a compatibilidade.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Por que trocar apenas a tag da imagem não é suficiente para atualizar um banco para uma versão maior?',
          choices: [
            { id: 'a', text: 'A tag nova nunca baixa' },
            { id: 'b', text: 'O banco apaga o volume sozinho ao subir' },
            { id: 'c', text: 'O formato dos dados pode mudar e exigir procedimento próprio de upgrade' },
            { id: 'd', text: 'Imagens de banco não têm tags' }
          ],
          answer: 'c',
          explanation: 'Faça backup, teste em cópia e siga o procedimento de upgrade do banco.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'O que é CSI no Kubernetes?',
          choices: [
            { id: 'a', text: 'Interface padrão para integrar provedores de armazenamento ao cluster' },
            { id: 'b', text: 'Um tipo de Ingress' },
            { id: 'c', text: 'Um algoritmo de criptografia' },
            { id: 'd', text: 'O formato de imagem OCI' }
          ],
          answer: 'a',
          explanation: 'A Container Storage Interface permite drivers de armazenamento plugáveis.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a regra de backup: três cópias, duas mídias, uma fora do local, conhecida como regra ___.',
          code: '# regra de backup ___',
          accept: ['3-2-1', '321'],
          explanation: 'A regra 3-2-1 reduz o risco de perder todas as cópias.'
        }
      ]
    },
    {
      id: 'cta-23-lgpd-containers',
      title: 'Privacidade e LGPD em ambientes de containers',
      goal: 'Aplicar os princípios da LGPD à operação de containers: dados pessoais em volumes, imagens, logs e dumps, minimização, segredos, ambientes de teste e resposta a incidentes.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'LGPD: noções jurídicas básicas',
            body: 'A Lei Geral de Proteção de Dados (Lei 13.709/2018) regula o tratamento de dados pessoais (informação relacionada a pessoa natural identificada ou identificável) por pessoas e organizações. Papéis: titular (a pessoa a quem os dados se referem), controlador (quem decide sobre o tratamento) e operador (quem trata em nome do controlador, seguindo suas instruções); a ANPD é a autoridade nacional. Princípios relevantes para a engenharia: finalidade, adequação, necessidade (minimização), segurança, prevenção e responsabilização. Este conteúdo é técnico e geral, não substitui orientação jurídica.'
          },
          {
            title: 'Onde dados pessoais se escondem em containers',
            body: 'Dados pessoais aparecem em mais lugares do que parece: volumes de bancos e uploads; dumps e backups; logs de aplicação e de acesso (IPs, e-mails, corpo de requisições); variáveis de ambiente; imagens (arquivos de teste, dumps copiados por engano); caches; sistemas de telemetria e traces; e arquivos temporários e core dumps. Mapeie onde cada dado está, por quanto tempo e quem acessa. Sem inventário não há como proteger, atender solicitações de titulares nem eliminar com segurança.'
          },
          {
            title: 'Minimização, criptografia, retenção e acesso',
            body: 'Colete e guarde só o necessário para a finalidade. Proteja em trânsito (TLS) e em repouso (criptografia de volumes, de backups e do banco). Defina retenção: prazos para cada tipo de dado e para backups e logs, com eliminação ao fim do tratamento, incluindo cópias. Controle acesso por menor privilégio e registre auditoria de quem acessou o quê; separe ambientes e contas. Medidas técnicas e administrativas de segurança são exigidas pela lei, de acordo com o risco.'
          },
          {
            title: 'Segredos e o histórico de camadas',
            body: 'Cada instrução do Dockerfile cria uma camada imutável: apagar um arquivo ou variável em uma camada seguinte não o remove da camada anterior, e qualquer pessoa com a imagem recupera o conteúdo (docker history mostra comandos, e as camadas podem ser extraídas). Por isso, segredos nunca devem entrar na imagem via COPY, ENV ou ARG. Use segredos de build do BuildKit (--mount=type=secret), que não ficam nas camadas, e segredos de execução entregues por Docker/Swarm secrets, Kubernetes Secrets com RBAC ou gestor externo. Imagens publicadas em registries públicos que carregam chaves ou dados já vazaram: trate como comprometidas e rotacione as credenciais imediatamente.',
            code: 'RUN --mount=type=secret,id=npmtoken \\\n    NPM_TOKEN=$(cat /run/secrets/npmtoken) npm ci\n\ndocker history minhaapp:1.0   # revela o que foi executado em cada camada'
          },
          {
            title: 'Ambientes de teste sem dados reais',
            body: 'Copiar produção para desenvolvimento e teste multiplica o risco: ambientes têm menos controles. Use dados sintéticos (gerados) ou dados anonimizados de forma que não seja possível reidentificar a pessoa por meios razoáveis. Atenção: pseudonimização (trocar identificador mantendo chave de reversão) ainda é dado pessoal; só anonimização efetiva deixa de ser. Imagens e fixtures do repositório e de CI não devem conter dados reais.'
          },
          {
            title: 'Resposta a incidentes em visão geral',
            body: 'Prepare-se antes do incidente: plano documentado, papéis claros, canais de contato, logs e auditoria que permitam reconstruir o ocorrido. Fluxo geral: detectar, conter (isolar o container ou nó, revogar credenciais), investigar escopo e causa, erradicar e recuperar, e aprender com o ocorrido. A LGPD prevê que o controlador comunique à ANPD e ao titular incidentes de segurança que possam acarretar risco ou dano relevante, em prazo razoável conforme regulamentação; envolva o encarregado (DPO) e o jurídico logo no início.'
          },
          {
            title: 'Operador e controlador na prática',
            body: 'Quem hospeda o sistema de outro (por exemplo, uma empresa que opera a infraestrutura de um cliente) costuma atuar como operador e deve seguir as instruções do controlador; quem decide por que e como os dados são usados é o controlador. O contrato deve definir responsabilidades, segurança e subcontratação (um provedor de nuvem pode ser suboperador). Ambos respondem por segurança nos limites de seu papel. A classificação concreta de cada caso depende dos fatos e deve ser validada por profissional jurídico.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Na LGPD, quem é o operador?',
          choices: [
            { id: 'a', text: 'A pessoa a quem os dados se referem' },
            { id: 'b', text: 'Quem decide sobre as finalidades do tratamento' },
            { id: 'c', text: 'A autoridade que fiscaliza a lei' },
            { id: 'd', text: 'Quem trata dados pessoais em nome do controlador, seguindo suas instruções' }
          ],
          answer: 'd',
          explanation: 'O titular é a pessoa; o controlador decide; o operador executa em nome dele.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Por que apagar um segredo em uma camada posterior do Dockerfile não resolve o vazamento?',
          choices: [
            { id: 'a', text: 'O Docker não permite apagar arquivos' },
            { id: 'b', text: 'A camada anterior continua na imagem com o conteúdo' },
            { id: 'c', text: 'A camada nova duplica o segredo' },
            { id: 'd', text: 'O segredo vai para o log do host' }
          ],
          answer: 'b',
          explanation: 'Camadas são imutáveis e cumulativas; quem tem a imagem pode extrair o segredo.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual é a forma adequada de usar um token durante o build sem gravá-lo nas camadas?',
          choices: [
            { id: 'a', text: 'Segredo de build do BuildKit com --mount=type=secret' },
            { id: 'b', text: 'ARG com o valor no Dockerfile' },
            { id: 'c', text: 'ENV com o valor na imagem' },
            { id: 'd', text: 'COPY do arquivo de token e rm depois' }
          ],
          answer: 'a',
          explanation: 'O mount de secret fica disponível só durante o RUN, sem ser persistido.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o comando que mostra as instruções que geraram cada camada de uma imagem.',
          code: 'docker ___ minhaapp:1.0',
          accept: ['history', 'docker history minhaapp:1.0'],
          explanation: 'docker history lista as camadas e os comandos que as criaram.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Qual prática serve melhor a um ambiente de testes?',
          choices: [
            { id: 'a', text: 'Copiar o banco de produção integralmente' },
            { id: 'b', text: 'Usar CPFs reais de clientes antigos' },
            { id: 'c', text: 'Usar dados sintéticos ou efetivamente anonimizados' },
            { id: 'd', text: 'Manter o dump de produção dentro da imagem' }
          ],
          answer: 'c',
          explanation: 'Ambientes de teste têm menos controles; evite dados pessoais reais.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual afirmação sobre pseudonimização é correta?',
          choices: [
            { id: 'a', text: 'É equivalente a anonimização efetiva' },
            { id: 'b', text: 'Dado pseudonimizado ainda pode ser dado pessoal, pois é possível reverter com informação adicional' },
            { id: 'c', text: 'Elimina a necessidade de segurança' },
            { id: 'd', text: 'Torna o dado público' }
          ],
          answer: 'b',
          explanation: 'Só a anonimização efetiva, irreversível por meios razoáveis, deixa de ser dado pessoal.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Ao descobrir que uma imagem pública continha uma chave de acesso, o que fazer primeiro?',
          choices: [
            { id: 'a', text: 'Apenas apagar a tag da imagem' },
            { id: 'b', text: 'Esperar para ver se alguém usa' },
            { id: 'c', text: 'Trocar a cor do logo da imagem' },
            { id: 'd', text: 'Revogar e rotacionar a credencial, tratando-a como comprometida' }
          ],
          answer: 'd',
          explanation: 'Cópias e caches da imagem podem já existir; rotacione a credencial.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o princípio da LGPD que manda tratar só o estritamente necessário para a finalidade.',
          code: '# princípio da ___ (minimização)',
          accept: ['necessidade', 'Necessidade'],
          explanation: 'O princípio da necessidade limita o tratamento ao mínimo para atingir a finalidade.'
        }
      ]
    },
    {
      id: 'cta-24-troubleshooting-avancado',
      title: 'Diagnóstico avançado de containers',
      goal: 'Investigar falhas além do docker logs: nsenter, tcpdump em netns, strace, OOM, disco cheio, zumbis, DNS, containers que não param e o daemon.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Classificar a falha antes de agir',
            body: 'Uma boa investigação começa separando a camada do problema. Aplicação: o processo falha ou devolve erro (logs, código de saída, stack trace). Imagem: falta binário, biblioteca, permissão ou arquitetura errada (erros como exec format error ou not found ao iniciar). Rede: DNS, porta, firewall, rede errada (timeouts, connection refused). Host: disco cheio, memória esgotada, daemon com problema (vários containers afetados ao mesmo tempo). Perguntar "o que mudou?" e "afeta só este container ou todos?" já reduz muito o espaço de busca.'
          },
          {
            title: 'nsenter e containers efêmeros de depuração',
            body: 'Imagens enxutas (distroless, scratch) não têm shell nem ferramentas, e docker exec não ajuda. O nsenter entra nos namespaces de um processo a partir do host, usando as ferramentas do host sobre o ambiente do container (rede, PID, mount). Basta descobrir o PID do container e escolher os namespaces. Conceito relacionado: containers efêmeros de depuração, que anexam um container com ferramentas ao namespace do alvo (kubectl debug no Kubernetes e o docker debug, recurso do Docker Desktop/subscrição, seguem essa ideia), sem alterar a imagem.',
            code: 'PID=$(docker inspect -f \'{{.State.Pid}}\' meu-app)\nsudo nsenter -t $PID -n ip addr   # -n entra no namespace de rede\nsudo nsenter -t $PID -n ss -tlnp'
          },
          {
            title: 'Capturando tráfego e chamadas de sistema',
            body: 'tcpdump dentro do netns do container captura o tráfego exato que ele vê, usando o tcpdump do host via nsenter, sem instalá-lo na imagem. strace mostra as chamadas de sistema de um processo (arquivos abertos, conexões, erros como ENOENT ou EACCES), revelando por que um app não encontra um arquivo ou não conecta. Exige privilégio (ptrace) e deve ser usado com cautela em produção por reduzir o desempenho do processo.',
            code: 'sudo nsenter -t $PID -n tcpdump -i eth0 -nn port 5432\nsudo strace -f -p $PID -e trace=network,openat'
          },
          {
            title: 'OOM, disco cheio e zumbis',
            body: 'OOM: o kernel mata processos quando a memória (ou o limite do cgroup) esgota. O container sai com código 137 (128 mais o sinal 9) e docker inspect indica State.OOMKilled como true; o dmesg do host registra a morte. Disco cheio: docker system df mostra o uso (imagens, containers, volumes, cache de build) e docker system prune limpa o que não é usado (cuidado com volumes); logs sem rotação são causa comum. Zumbis são processos terminados cujo pai não coletou o status; acumulam quando o PID 1 não trata filhos: use --init (ou tini) ou um PID 1 adequado.',
            code: 'docker inspect -f \'{{.State.OOMKilled}} {{.State.ExitCode}}\' meu-app\nsudo dmesg | grep -i "killed process"\ndocker system df'
          },
          {
            title: 'Core dumps e DNS interno',
            body: 'Core dumps gravam a memória de um processo que travou, útil para análise com depurador, mas podem conter dados sensíveis (senhas, dados pessoais): proteja, restrinja e descarte com critério. O padrão de onde são gravados depende da configuração do kernel do host. DNS interno: em redes definidas pelo usuário, o Docker oferece resolução por nome de container/service através de um servidor DNS embutido; falhas comuns são estar em redes diferentes, usar a rede bridge padrão (sem resolução por nome) ou erro de nome. Teste de dentro do container com nslookup ou getent hosts, e confira /etc/resolv.conf.',
            code: 'docker exec app getent hosts db\ndocker network inspect minha-rede   # quem está conectado'
          },
          {
            title: 'Container que não para e daemon travado',
            body: 'docker stop envia SIGTERM e, após o prazo (10 segundos por padrão, ajustável com -t), SIGKILL. Se demora sempre o prazo inteiro, o app provavelmente não trata SIGTERM (ou o sinal não chega por usar a forma shell de CMD). docker kill envia o sinal imediatamente. Processo em estado D (esperando I/O, por exemplo disco ou NFS travado) pode ignorar até SIGKILL. Se o próprio docker deixa de responder, investigue o serviço do daemon no host, que no Linux com systemd é lido com journalctl.',
            code: 'docker stop -t 30 meu-app     # aumenta o prazo antes do SIGKILL\nsudo systemctl status docker\nsudo journalctl -u docker --since "1 hour ago"'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Um container termina com código 137 e State.OOMKilled igual a true. Qual é a causa mais provável?',
          choices: [
            { id: 'a', text: 'O app fez exit(0) normalmente' },
            { id: 'b', text: 'O kernel o encerrou por falta de memória (limite do cgroup excedido)' },
            { id: 'c', text: 'A imagem tem arquitetura errada' },
            { id: 'd', text: 'O DNS interno falhou' }
          ],
          answer: 'b',
          explanation: '137 é 128 mais SIGKILL; OOMKilled confirma que foi por memória.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual é a utilidade do nsenter em um container sem shell?',
          choices: [
            { id: 'a', text: 'Instalar pacotes na imagem original' },
            { id: 'b', text: 'Reconstruir a imagem sem cache' },
            { id: 'c', text: 'Trocar o runtime do container' },
            { id: 'd', text: 'Executar ferramentas do host dentro dos namespaces do container, como o de rede' }
          ],
          answer: 'd',
          explanation: 'nsenter -t PID -n usa as ferramentas do host no netns do alvo.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Se vários containers diferentes falham ao mesmo tempo, a falha provavelmente está em qual camada?',
          choices: [
            { id: 'a', text: 'No host (recursos, disco ou daemon)' },
            { id: 'b', text: 'Em uma imagem específica' },
            { id: 'c', text: 'No código de um só serviço' },
            { id: 'd', text: 'No Dockerfile de um app' }
          ],
          answer: 'a',
          explanation: 'Falhas simultâneas em vários containers apontam para causa comum, o host.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o comando que lê os logs do serviço do daemon Docker via systemd.',
          code: 'sudo journalctl -u ___',
          accept: ['docker', 'docker.service'],
          explanation: 'journalctl -u docker mostra os logs do serviço do daemon.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Para que serve strace em um container com problema?',
          choices: [
            { id: 'a', text: 'Alterar a imagem em execução' },
            { id: 'b', text: 'Medir o tamanho das camadas' },
            { id: 'c', text: 'Ver as chamadas de sistema do processo, como arquivos abertos e erros de acesso' },
            { id: 'd', text: 'Listar vulnerabilidades' }
          ],
          answer: 'c',
          explanation: 'strace revela, por exemplo, ENOENT em arquivos ausentes.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que significa o comando docker inspect -f \'{{.State.Pid}}\' app?',
          choices: [
            { id: 'a', text: 'Obter o ID da imagem' },
            { id: 'b', text: 'Listar os PIDs de todos os containers' },
            { id: 'c', text: 'Obter o PID do processo principal do container no host' },
            { id: 'd', text: 'Exibir a porta publicada' }
          ],
          answer: 'c',
          explanation: 'O PID serve de alvo para nsenter, strace e outras ferramentas do host.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que docker stop pode levar sempre o prazo completo antes de encerrar?',
          choices: [
            { id: 'a', text: 'O app não trata SIGTERM e só morre quando vem o SIGKILL' },
            { id: 'b', text: 'O prazo é gasto na reconstrução da imagem' },
            { id: 'c', text: 'O docker stop só funciona após reiniciar o host' },
            { id: 'd', text: 'Containers não aceitam sinais' }
          ],
          answer: 'a',
          explanation: 'Trate SIGTERM e use a forma exec do CMD para o sinal chegar ao app.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o comando que mostra o espaço usado por imagens, containers, volumes e cache.',
          code: 'docker system ___',
          accept: ['df', 'docker system df'],
          explanation: 'docker system df resume o uso de disco do Docker.'
        }
      ]
    },
    {
      id: 'cta-25-docker-desktop-wsl2-windows',
      title: 'Docker no Windows e macOS por dentro',
      goal: 'Entender que o Docker Desktop usa uma VM Linux, como o WSL2 funciona como backend e os cuidados com desempenho, memória, quebras de linha e modos de isolamento.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Docker Desktop executa uma VM Linux',
            body: 'Containers Linux precisam do kernel Linux. No Windows e no macOS não existe esse kernel nativo, então o Docker Desktop executa o Docker Engine dentro de uma máquina virtual Linux leve e o CLI do seu sistema se conecta a ela. Isso explica comportamentos: portas publicadas passam por camadas de rede extras, bind mounts atravessam a fronteira host-VM (mais lentos) e a VM tem limites próprios de CPU e memória.'
          },
          {
            title: 'WSL2 como backend',
            body: 'No Windows, o backend recomendado é o WSL2 (Windows Subsystem for Linux 2), que roda um kernel Linux real em uma VM leve e gerenciada pelo Windows. O Docker Desktop cria suas próprias distribuições internas e permite integração com suas distros WSL (como Ubuntu): o comando docker funciona dentro delas, apontando para o mesmo engine. A alternativa antiga era Hyper-V com VM dedicada, de recursos mais rígidos.',
            code: 'wsl -l -v                 # lista distros e versão (precisa ser 2)\nwsl --update              # atualiza o kernel do WSL2\nwsl --shutdown            # desliga a VM do WSL2 (aplica .wslconfig)'
          },
          {
            title: 'Onde ficam os dados',
            body: 'Imagens, containers e volumes do Docker Desktop ficam em discos virtuais (arquivos VHDX) em formato ext4, dentro do perfil do usuário no Windows. Esses arquivos crescem conforme o uso, mas nem sempre encolhem sozinhos ao liberar espaço; é possível compactá-los com ferramentas apropriadas após limpar com docker system prune. Backup e migração dos dados do Docker lidam com esses discos; trate-os como dados sensíveis, pois podem conter segredos e dados de aplicações.'
          },
          {
            title: 'Desempenho: mantenha o código no WSL2',
            body: 'Acessar arquivos entre os dois mundos tem custo: arquivos do Windows (como /mnt/c) acessados por processos Linux passam por uma camada de tradução e ficam bem mais lentos que o sistema de arquivos nativo do WSL2 (como /home/usuario). Para bind mounts e builds, coloque o repositório dentro do sistema de arquivos do WSL2 e edite com o VS Code usando a extensão do WSL. O contrário (arquivos Linux acessados a partir do Windows) também é mais lento; escolha onde o trabalho principal acontece.'
          },
          {
            title: 'Limites de memória: .wslconfig',
            body: 'O WSL2 pode consumir muita memória do Windows. O arquivo .wslconfig, na pasta do perfil do usuário (%UserProfile%), define limites globais da VM na seção [wsl2]. Após editar, rode wsl --shutdown para aplicar. No Docker Desktop com backend WSL2 esses limites vêm daí (e não dos controles de recursos do modo Hyper-V).',
            code: '[wsl2]\nmemory=6GB\nprocessors=4\nswap=2GB'
          },
          {
            title: 'Containers Windows, isolamento e portabilidade de scripts',
            body: 'Existem containers Windows (imagens baseadas em Windows, só executam em host Windows) e containers Linux; o Docker Desktop alterna o modo. Containers Windows têm dois modos de isolamento: process, que compartilha o kernel do host (rápido, exige versão compatível) e Hyper-V, que usa uma VM leve por container (mais isolamento, mais custo), escolhidos com --isolation. Outro problema clássico: quebra de linha. Scripts .sh salvos com CRLF falham no Linux com erros como bad interpreter ^M; use LF, configure o Git (.gitattributes com eol=lf para scripts) e o editor. Cuidado também com caminhos de volume em Windows (C:\\ vs /c/ ou /mnt/c) e conversão automática de caminhos do Git Bash.',
            code: '# .gitattributes\n*.sh text eol=lf\n\n# Windows: escolher o isolamento\ndocker run --isolation=hyperv mcr.microsoft.com/windows/nanoserver cmd'
          },
          {
            title: 'Licenciamento e alternativas',
            body: 'O Docker Desktop possui termos de licenciamento que podem exigir assinatura paga conforme o tamanho e o uso da organização. Verifique sempre os termos oficiais vigentes antes de adotá-lo em empresa. Alternativas existem: usar o Docker Engine direto dentro de uma distro WSL2, Podman Desktop, Rancher Desktop, Colima (macOS/Linux) e Lima. Elas diferem em compatibilidade, integração e suporte, e a escolha deve considerar o time, a segurança e a conformidade.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Por que o Docker Desktop precisa de uma VM Linux no Windows e no macOS?',
          choices: [
            { id: 'a', text: 'Para criptografar as imagens' },
            { id: 'b', text: 'Porque o Docker não roda sem Hyper-V no macOS' },
            { id: 'c', text: 'Para executar apenas containers Windows' },
            { id: 'd', text: 'Containers Linux exigem um kernel Linux, que esses sistemas não têm nativamente' }
          ],
          answer: 'd',
          explanation: 'O engine roda na VM Linux e o CLI do host se conecta a ela.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Para melhor desempenho de build e bind mounts com WSL2, onde manter o projeto?',
          choices: [
            { id: 'a', text: 'Em /mnt/c, pois é nativo' },
            { id: 'b', text: 'Dentro do sistema de arquivos do WSL2, como em /home/usuario' },
            { id: 'c', text: 'Dentro da imagem Docker' },
            { id: 'd', text: 'Em um drive de rede' }
          ],
          answer: 'b',
          explanation: 'Acesso entre os sistemas de arquivos tem sobrecarga; o ext4 do WSL2 é nativo ao Linux.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual é o efeito do comando wsl --shutdown depois de editar .wslconfig?',
          choices: [
            { id: 'a', text: 'Desliga a VM do WSL2 para que as novas configurações sejam aplicadas na próxima inicialização' },
            { id: 'b', text: 'Apaga todas as distros instaladas' },
            { id: 'c', text: 'Reinstala o Docker Desktop' },
            { id: 'd', text: 'Remove os volumes do Docker' }
          ],
          answer: 'a',
          explanation: 'As configurações do .wslconfig só valem quando a VM reinicia.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o campo do .wslconfig que limita a memória da VM.',
          code: '[wsl2]\n___=6GB',
          accept: ['memory', 'Memory'],
          explanation: 'memory define o teto de memória da VM do WSL2.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Um script .sh criado no Windows falha no container com bad interpreter com ^M. Qual é a causa?',
          choices: [
            { id: 'a', text: 'O script não tem permissão de rede' },
            { id: 'b', text: 'A imagem não tem espaço em disco' },
            { id: 'c', text: 'O arquivo foi salvo com quebras de linha CRLF em vez de LF' },
            { id: 'd', text: 'A VM está sem memória' }
          ],
          answer: 'c',
          explanation: 'Use LF, por exemplo com eol=lf no .gitattributes.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual é a diferença entre os isolamentos process e Hyper-V em containers Windows?',
          choices: [
            { id: 'a', text: 'Process usa VM; Hyper-V compartilha o kernel' },
            { id: 'b', text: 'Process compartilha o kernel do host; Hyper-V usa uma VM leve por container, com mais isolamento' },
            { id: 'c', text: 'São idênticos e só mudam de nome' },
            { id: 'd', text: 'Process serve só para containers Linux' }
          ],
          answer: 'b',
          explanation: 'Hyper-V custa mais, mas isola melhor e permite maior compatibilidade de versões.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'O que são os arquivos VHDX do Docker Desktop?',
          choices: [
            { id: 'a', text: 'Logs de acesso ao registry' },
            { id: 'b', text: 'Arquivos de configuração do Compose' },
            { id: 'c', text: 'Certificados TLS' },
            { id: 'd', text: 'Discos virtuais onde ficam imagens, containers e volumes' }
          ],
          answer: 'd',
          explanation: 'Eles crescem com o uso e merecem proteção, pois guardam dados das aplicações.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o comando que lista as distros WSL e a versão de cada uma.',
          code: 'wsl -l ___',
          accept: ['-v', '-v', '--verbose', 'v'],
          explanation: 'wsl -l -v mostra o estado e a versão (1 ou 2) de cada distro.'
        }
      ]
    },
    {
      id: 'cta-26-projeto-integrador',
      title: 'Projeto integrador: arquitetura completa e endurecida',
      goal: 'Reunir tudo em uma arquitetura de produção (app, banco, cache, proxy, observabilidade) e aplicar um checklist final de segurança, LGPD, desempenho e operação.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'A arquitetura alvo',
            body: 'Cenário: uma API web com banco relacional e cache, atrás de um proxy reverso com TLS, com monitoramento. Componentes: proxy (Nginx ou Traefik) como única porta exposta; app (API) e worker; banco e cache em redes internas; Prometheus e Grafana para métricas, e coleta central de logs. Todo o projeto usa dados sintéticos: nenhum dado pessoal real em repositório, imagens ou ambientes de teste.'
          },
          {
            title: 'Redes segmentadas',
            body: 'Divida em redes: uma de frente (proxy e app) e uma de dados (app, banco e cache), marcada como internal para não ter saída à internet. O proxy só enxerga o app; o banco e o cache nunca publicam portas no host e só são alcançáveis pelo app. A observabilidade usa rede própria. Assim, o comprometimento de uma peça limita o alcance lateral do atacante.',
            code: 'networks:\n  frente:\n  dados:\n    internal: true\nservices:\n  proxy:\n    networks: [frente]\n  app:\n    networks: [frente, dados]\n  db:\n    networks: [dados]'
          },
          {
            title: 'Imagens e containers endurecidos',
            body: 'Imagens multi-stage e enxutas, base fixada por digest, usuário não-root (USER), sistema de arquivos somente leitura quando possível (read_only), capabilities removidas (cap_drop: [ALL]) e no-new-privileges. Sem segredos em camadas, ARG ou ENV: use secrets montados como arquivos. Healthchecks honestos, limites de CPU e memória para evitar vizinhos barulhentos, e init/PID 1 tratando sinais para desligar de forma graciosa.',
            code: '  app:\n    image: reg.exemplo/app@sha256:<digest>\n    user: "10001:10001"\n    read_only: true\n    cap_drop: [ALL]\n    security_opt: ["no-new-privileges:true"]\n    secrets: [db_pass]\n    healthcheck:\n      test: ["CMD", "wget", "-qO-", "http://localhost:8080/healthz"]\n    deploy:\n      resources:\n        limits:\n          cpus: "1.0"\n          memory: 512M'
          },
          {
            title: 'Dados, backup e observabilidade',
            body: 'Banco em volume nomeado, criptografado em repouso, com backup agendado consistente (dump), cópia fora do host, retenção definida e restore testado periodicamente. Métricas via Prometheus, painéis e alertas por SLO no Grafana, logs centralizados com ID de correlação e sem dados pessoais, com retenção curta e acesso restrito. Migrações de esquema versionadas e compatíveis com rolling update.'
          },
          {
            title: 'CI/CD: scan, assinatura, deploy e rollback',
            body: 'Pipeline: build em runner efêmero sem expor o socket do Docker, testes, scan de vulnerabilidades e de segredos, geração de SBOM, push para o registry e assinatura da imagem (por exemplo com cosign), registrando o digest. Promoção do mesmo digest entre ambientes, com aprovação para produção e tokens de menor privilégio. Deploy rolling, blue-green ou canário com readiness e healthchecks; rollback pronto e testado (voltar ao digest anterior). Políticas de admissão podem exigir só imagens assinadas.'
          },
          {
            title: 'Checklist final: segurança, LGPD, desempenho, operação',
            body: 'Segurança: não-root, capabilities mínimas, rede segmentada, TLS, segredos fora de camadas, imagens e dependências atualizadas e escaneadas, socket do Docker nunca exposto. LGPD: inventário dos dados pessoais, minimização, criptografia em trânsito e repouso, retenção e eliminação, acesso mínimo e auditoria, ambientes de teste sem dados reais, plano de resposta a incidentes. Desempenho: cache de build, imagens pequenas, limites medidos, I/O em volumes, medir antes de otimizar. Operação: healthchecks, observabilidade e alertas, backups com restore testado, runbooks, rollback, desligamento gracioso e documentação.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual é o papel da rede marcada como internal: true no Compose?',
          choices: [
            { id: 'a', text: 'Publicar automaticamente as portas dos containers' },
            { id: 'b', text: 'Impedir que os containers dessa rede tenham saída para fora (internet), isolando os dados' },
            { id: 'c', text: 'Criptografar o tráfego entre containers' },
            { id: 'd', text: 'Remover o DNS interno da rede' }
          ],
          answer: 'b',
          explanation: 'Em redes internal não há gateway externo; é ideal para banco e cache.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Por que o banco e o cache não devem publicar portas no host?',
          choices: [
            { id: 'a', text: 'Porque portas publicadas deixam o banco mais lento sempre' },
            { id: 'b', text: 'Porque Compose não permite publicar portas de bancos' },
            { id: 'c', text: 'Porque o proxy exige a porta do banco' },
            { id: 'd', text: 'Para só serem alcançáveis pelo app na rede interna, reduzindo a superfície de ataque' }
          ],
          answer: 'd',
          explanation: 'Quanto menos exposição externa, menor a superfície de ataque.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual combinação endurece o container da aplicação?',
          choices: [
            { id: 'a', text: 'Usuário não-root, sistema de arquivos somente leitura, cap_drop ALL e no-new-privileges' },
            { id: 'b', text: 'Rodar como root com privileged' },
            { id: 'c', text: 'Montar o socket do Docker para facilitar logs' },
            { id: 'd', text: 'Usar a tag latest e chaves em ENV' }
          ],
          answer: 'a',
          explanation: 'Reduz privilégios e a capacidade de persistência do atacante.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a chave do serviço no Compose que roda o processo com UID não-root.',
          code: 'app:\n  ___: "10001:10001"',
          accept: ['user', 'user:'],
          explanation: 'user define o UID:GID com que o processo roda dentro do container.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Qual é a melhor referência de imagem para promoção entre ambientes?',
          choices: [
            { id: 'a', text: 'A tag latest, que sempre é a mais nova' },
            { id: 'b', text: 'Um nome de imagem sem versão' },
            { id: 'c', text: 'O digest sha256 da imagem testada e assinada' },
            { id: 'd', text: 'Uma tag sobrescrita a cada build' }
          ],
          answer: 'c',
          explanation: 'O digest é imutável e identifica o artefato exato.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Na parte de dados do projeto, qual prática garante que o backup serve?',
          choices: [
            { id: 'a', text: 'Guardar o backup só no mesmo disco do banco' },
            { id: 'b', text: 'Nunca restaurar para não arriscar' },
            { id: 'c', text: 'Testar periodicamente a restauração em ambiente isolado' },
            { id: 'd', text: 'Fazer backup sem criptografia' }
          ],
          answer: 'c',
          explanation: 'Backup não testado é só uma esperança; meça também RTO e RPO.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual item de LGPD faz parte do checklist de revisão final?',
          choices: [
            { id: 'a', text: 'Inventariar dados pessoais, minimizar, definir retenção e usar dados sintéticos em testes' },
            { id: 'b', text: 'Copiar produção para testes para ficar realista' },
            { id: 'c', text: 'Registrar corpos de requisição completos nos logs' },
            { id: 'd', text: 'Manter dumps em imagens públicas' }
          ],
          answer: 'a',
          explanation: 'Minimização, retenção e ambientes sem dados reais são medidas técnicas da LGPD.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o comando que, no Kubernetes, desfaz a última atualização do Deployment app.',
          code: 'kubectl rollout ___ deployment/app',
          accept: ['undo', 'kubectl rollout undo deployment/app'],
          explanation: 'Ter o rollback pronto e testado faz parte do checklist de operação.'
        }
      ]
    },
  ]
};
