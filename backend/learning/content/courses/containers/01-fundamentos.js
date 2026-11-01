// Módulo "Fundamentos" (iniciante) do curso de Containers (Docker) — 18 lições, 8 questões cada
// (3 múltipla escolha + 1 lacuna, duas vezes por lição). Ver ../../index.js para o formato e a
// validação de boot. Todos os exemplos usam containers Linux e a sintaxe atual: `docker compose`
// (v2, com espaço), BuildKit como builder padrão e Compose sem a chave `version:`.
// Para não repetir 144 vezes o mesmo objeto literal, as questões usam dois helpers locais:
// mcq(id, prompt, slot, certa, erradas, explicação) monta as 4 alternativas colocando a certa na
// posição `slot` ('a'..'d') e as 3 erradas, em ordem, nas demais (assim a letra correta é
// escolhida à mão e variada entre as questões); fill(id, prompt, code, accept, explicação) produz
// a questão de lacuna (___) no formato esperado pela validação do boot.
// Segurança e privacidade (LGPD): o módulo ensina desde o início a não colocar segredos em
// imagens/Dockerfile/ENV versionado, os perigos de --privileged e do socket do Docker, publicar
// portas só quando necessário (127.0.0.1), usar imagens de origem confiável e tratar com cuidado
// dados pessoais em volumes. Nenhum exemplo usa dados pessoais; as senhas dos exemplos são
// claramente fictícias ("senha-de-teste") e vêm sempre com aviso para nunca usar em produção.
// Evitamos de propósito números de versão/tamanho/limites que envelhecem: tags nos exemplos são
// apenas ilustrativas e a lição de imagens ensina a consultar a documentação da imagem.
const mcq = (id, prompt, slot, right, wrong, explanation) => {
  const texts = [...wrong];
  texts.splice('abcd'.indexOf(slot), 0, right);
  return {
    id,
    kind: 'mcq',
    prompt,
    choices: texts.map((text, i) => ({ id: 'abcd'[i], text })),
    answer: slot,
    explanation
  };
};

const fill = (id, prompt, code, accept, explanation) => ({ id, kind: 'fill', prompt, code, accept, explanation });

module.exports = {
  id: 'fundamentos-containers',
  levelKey: 'beginner',
  order: 1,
  title: 'Fundamentos',
  subtitle: 'Imagens, containers, Dockerfile, volumes, redes e Compose — do zero a rodar aplicações',
  accent: '#2496ed',
  lessons: [
    {
      id: 'ctr-01-o-que-sao-containers',
      title: 'O que são containers',
      goal: 'Entender o problema que os containers resolvem e a diferença entre imagem e container.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'O problema do "funciona na minha máquina"',
            body: 'Todo programa depende de coisas além do próprio código: a versão da linguagem (Python, Node...), bibliotecas, configurações e até o sistema operacional. Se a sua máquina tem uma versão e o servidor tem outra, o mesmo código pode funcionar aqui e quebrar lá. É a clássica frase "funciona na minha máquina". Containers existem para acabar com essa diferença de ambiente.'
          },
          {
            title: 'O que é um container',
            body: 'Um container é um processo (ou um pequeno grupo de processos) do seu sistema rodando isolado do resto, junto com tudo o que ele precisa: o programa e suas dependências, empacotados. Ele NÃO é um computador inteiro dentro do computador: é só o seu programa, em um "cercadinho" com os próprios arquivos, rede e lista de processos.'
          },
          {
            title: 'Imagem vs container',
            body: 'A imagem é o pacote pronto, somente leitura: o molde que contém o programa e suas dependências. O container é a imagem em execução. Uma analogia: a imagem é como o arquivo de um programa instalado no disco; o container é esse programa rodando agora, como processo. A partir de UMA imagem você pode iniciar vários containers independentes.',
            code: '# a mesma imagem, dois containers independentes\ndocker run -d --name site1 nginx:stable\ndocker run -d --name site2 nginx:stable'
          },
          {
            title: 'Isolamento de processos',
            body: 'Dentro do container, o programa enxerga apenas o próprio mundo: seus arquivos, sua rede e seus processos. Os processos do seu computador não aparecem lá dentro, e dois containers não mexem um no outro por padrão. Isso evita conflitos (por exemplo, duas aplicações que exigem versões diferentes da mesma biblioteca convivem sem problema). Atenção: isolamento reduz riscos, mas não é uma caixa-forte — por isso só execute imagens de origem confiável.'
          },
          {
            title: 'Portabilidade',
            body: 'Como a imagem leva o programa e as dependências juntos, a mesma imagem roda do mesmo jeito no seu notebook, no computador de um colega, em um servidor ou na nuvem — basta ter um motor de containers instalado (e uma arquitetura de processador compatível). Você deixa de documentar "instale a versão tal, configure isso e aquilo" e passa a entregar a imagem.'
          },
          {
            title: 'Para que containers são usados',
            body: 'Usos comuns: padronizar o ambiente de desenvolvimento do time; rodar um banco de dados ou outro serviço sem instalá-lo no computador; testar o mesmo programa em versões diferentes de uma linguagem; rodar testes automáticos (CI); e publicar aplicações em servidores e na nuvem de forma repetível. Ao longo do curso você vai praticar vários desses usos.'
          }
        ]
      },
      questions: [
        mcq('q1', 'Qual problema os containers ajudam a resolver?', 'b',
          'As diferenças de ambiente (versões, bibliotecas, configurações) que fazem um programa funcionar em uma máquina e quebrar em outra',
          ['A falta de linguagens de programação modernas', 'A lentidão da internet ao baixar páginas web', 'A necessidade de escrever código em mais de uma linguagem'],
          'Ao empacotar o programa com suas dependências, o ambiente fica o mesmo em qualquer lugar.'),
        mcq('q2', 'Qual é a diferença entre imagem e container?', 'c',
          'A imagem é o pacote pronto, somente leitura; o container é essa imagem em execução',
          ['O container é o arquivo no disco e a imagem é o processo rodando', 'São o mesmo conceito com dois nomes', 'A imagem só serve para fotos e o container para código'],
          'Imagem = molde/pacote; container = instância em execução criada a partir dela.'),
        mcq('q3', 'O que é, de forma geral, um container?', 'a',
          'Um processo isolado que roda junto com o programa e as dependências empacotadas',
          ['Um computador completo, com hardware próprio, dentro do seu computador', 'Uma pasta compartilhada na rede', 'Um programa que só funciona no Windows'],
          'O container é um processo isolado, não um computador inteiro.'),
        fill('q4', 'Complete o termo:', 'Uma ___ é o pacote somente leitura a partir do qual os containers são criados.',
          ['imagem', 'imagens', 'image'],
          'A imagem contém o programa e suas dependências; o container é criado a partir dela.'),
        mcq('q5', 'O que você pode fazer a partir de UMA única imagem?', 'd',
          'Iniciar vários containers independentes',
          ['Iniciar apenas um container por vez, nunca dois', 'Nada: a imagem só pode ser aberta, não executada', 'Iniciar vários containers, mas todos compartilhando o mesmo processo'],
          'Cada container é uma instância separada; a mesma imagem pode gerar quantos você precisar.'),
        mcq('q6', 'Qual destes é um uso típico de containers?', 'c',
          'Rodar um banco de dados de teste sem instalá-lo diretamente no computador',
          ['Substituir o processador do servidor', 'Aumentar a velocidade da conexão com a internet', 'Apagar automaticamente erros de código'],
          'Rodar serviços prontos sem instalar nada no sistema é um dos usos mais comuns.'),
        mcq('q7', 'Sobre o isolamento dos containers, qual afirmação é a mais correta?', 'b',
          'Reduz conflitos e riscos, mas não é uma garantia absoluta: convém usar imagens de origem confiável',
          ['É perfeito: nenhum container jamais pode afetar a máquina', 'Não existe: todos os containers enxergam todos os processos da máquina', 'Só existe se o container estiver parado'],
          'Isolamento ajuda muito, mas não substitui cuidado com a procedência das imagens.'),
        fill('q8', 'Complete o termo:', 'Para a aplicação rodar igual em qualquer lugar, a imagem a empacota junto com as suas ___.',
          ['dependências', 'dependencias', 'dependency', 'dependencies', 'bibliotecas'],
          'O código mais as dependências (versão da linguagem, bibliotecas) formam o pacote portátil.')
      ]
    },
    {
      id: 'ctr-02-containers-vs-vms',
      title: 'Containers vs máquinas virtuais',
      goal: 'Comparar containers e máquinas virtuais: kernel compartilhado, leveza e isolamento.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Máquina virtual: um computador simulado',
            body: 'Uma máquina virtual (VM) simula um computador inteiro. Um software chamado hypervisor divide o hardware real entre várias VMs, e cada VM instala o seu próprio sistema operacional completo, com kernel próprio. O kernel é o núcleo do sistema operacional: quem conversa com o hardware e controla processos, memória e arquivos.'
          },
          {
            title: 'Container: kernel compartilhado',
            body: 'Containers não trazem um sistema operacional completo nem um kernel próprio: todos usam o kernel do sistema que os hospeda (o host). Cada container leva só o programa e as bibliotecas de que precisa. Por isso um container Linux precisa de um kernel Linux por baixo.',
            code: '# VM:        hardware -> hypervisor -> SO convidado (kernel próprio) -> app\n# Container: hardware -> SO do host (um só kernel) -> container -> app'
          },
          {
            title: 'Leveza e velocidade',
            body: 'Como não há um sistema operacional inteiro para ligar, um container normalmente inicia em segundos (ou menos) e consome bem menos memória e disco que uma VM. Isso permite rodar muito mais containers que VMs na mesma máquina e criá-los e descartá-los com facilidade.'
          },
          {
            title: 'Isolamento e limites',
            body: 'Na VM, o isolamento é mais forte: cada uma tem seu próprio kernel, separado por uma fronteira de hardware virtualizado. No container, o kernel é compartilhado — uma falha séria no kernel do host pode afetar todos eles. Por isso, para rodar código de terceiros não confiável, VMs (ou camadas extras de proteção) oferecem uma barreira mais robusta. Containers ajudam muito, mas não são limite de segurança perfeito.'
          },
          {
            title: 'Namespaces e cgroups (visão geral)',
            body: 'Duas funções do kernel Linux fazem o container acontecer. Namespaces controlam O QUE o processo enxerga (seus próprios processos, rede, pontos de montagem), criando a sensação de isolamento. Cgroups (control groups) controlam QUANTO ele pode usar (limites de CPU, memória etc.). Você não precisa mexer neles diretamente: o Docker faz isso por você.'
          },
          {
            title: 'Um alerta e quando usar cada um',
            body: 'Containers não substituem as VMs: eles resolvem outro problema (empacotar e rodar aplicações de forma leve). Muitas vezes os dois se combinam — por exemplo, containers rodando dentro de VMs na nuvem. Lembre ainda: no Windows e no macOS não existe kernel Linux nativo, então o Docker Desktop executa uma VM Linux leve por baixo, e seus containers rodam dentro dela.'
          }
        ]
      },
      questions: [
        mcq('q1', 'Qual é a principal diferença de arquitetura entre uma VM e um container?', 'd',
          'A VM tem sistema operacional (e kernel) próprio; containers compartilham o kernel do host',
          ['Containers têm um kernel próprio mais pesado que o da VM', 'A VM compartilha o kernel do host e o container não', 'Não há diferença: ambos simulam hardware'],
          'VMs trazem um SO completo sobre um hypervisor; containers usam o kernel do host.'),
        mcq('q2', 'Por que containers costumam iniciar mais rápido e gastar menos recursos que VMs?', 'a',
          'Porque não precisam inicializar um sistema operacional completo',
          ['Porque rodam em um processador especial', 'Porque não executam nenhum programa de verdade', 'Porque só funcionam sem rede'],
          'Sem SO inteiro para ligar, o container é basicamente um processo isolado.'),
        mcq('q3', 'Em relação ao isolamento, qual afirmação é a mais correta?', 'c',
          'VMs têm isolamento mais forte, pois cada uma tem seu próprio kernel; o kernel compartilhado dos containers amplia a superfície de risco',
          ['Containers têm isolamento sempre mais forte que VMs', 'Os dois têm exatamente o mesmo nível de isolamento', 'Nenhum dos dois oferece qualquer isolamento'],
          'Kernel compartilhado é eficiente, mas exige mais cuidado com segurança.'),
        fill('q4', 'Complete o termo:', 'Todos os containers de um host compartilham o ___ do sistema operacional.',
          ['kernel', 'núcleo', 'nucleo'],
          'O kernel é o núcleo do SO; é ele que containers compartilham, ao contrário das VMs.'),
        mcq('q5', 'O que fazem os namespaces do kernel Linux, em visão geral?', 'b',
          'Controlam o que o processo enxerga (processos, rede, pontos de montagem), criando o isolamento',
          ['Limitam quanto de CPU e memória o processo pode usar', 'Criptografam o disco do container', 'Baixam imagens do registry'],
          'Namespaces = visão isolada; cgroups = limites de uso.'),
        mcq('q6', 'Para que servem os cgroups, em visão geral?', 'a',
          'Para limitar e medir recursos (CPU, memória etc.) que um grupo de processos pode usar',
          ['Para dar nome às imagens', 'Para escolher a porta do container', 'Para instalar o Docker'],
          'Cgroups impõem limites de uso de recursos.'),
        mcq('q7', 'Por que o Docker Desktop no Windows executa uma VM Linux por baixo?', 'd',
          'Porque containers Linux precisam de um kernel Linux, que o Windows não tem nativamente',
          ['Porque containers só funcionam dentro de VMs em qualquer sistema', 'Porque o Windows não consegue rodar nenhum programa em container', 'Porque a VM deixa os containers mais rápidos que no Linux'],
          'Containers Linux usam o kernel Linux; no Windows ele vem de uma VM leve.'),
        fill('q8', 'Complete o termo:', 'O software que divide o hardware entre várias máquinas virtuais se chama ___.',
          ['hypervisor', 'hipervisor'],
          'O hypervisor cria e gerencia as VMs.')
      ]
    },
    {
      id: 'ctr-03-docker-arquitetura-instalacao',
      title: 'Docker: arquitetura e instalação',
      goal: 'Conhecer as peças do Docker (cliente, daemon, registry), as formas de instalação e como verificar que tudo funciona.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Cliente, daemon e registry',
            body: 'O Docker tem três peças. O cliente é o comando docker que você digita no terminal. O daemon (dockerd) é o serviço em segundo plano que de fato cria e gerencia imagens e containers. O registry é o servidor que guarda imagens para baixar e enviar (o Docker Hub é o mais conhecido). Quando você digita um comando, o cliente apenas manda o pedido ao daemon.',
            code: '# você  ->  docker (cliente)  ->  dockerd (daemon)  ->  registry (imagens)'
          },
          {
            title: 'Docker Desktop vs Docker Engine',
            body: 'O Docker Engine é o motor em si (daemon + cliente), usado direto no Linux e em servidores. O Docker Desktop é um aplicativo para Windows, macOS e Linux que traz o Engine, uma interface gráfica e o necessário para rodar containers Linux nesses sistemas. Para estudar no Windows, o caminho mais comum é o Docker Desktop. Verifique os termos de licença do Docker Desktop para o seu uso (por exemplo, em empresas).'
          },
          {
            title: 'WSL2 no Windows (visão geral)',
            body: 'No Windows, o Docker Desktop costuma usar o WSL2 (Windows Subsystem for Linux 2), que roda um kernel Linux real de forma leve e integrada. É ele que permite rodar containers Linux no Windows com bom desempenho. Se o Docker não iniciar, verificar se o WSL2 está instalado e habilitado é um dos primeiros passos.'
          },
          {
            title: 'Verificando a instalação',
            body: 'Três comandos para conferir: docker version mostra as versões do cliente e do servidor (daemon) — se o servidor não aparecer, o daemon não está rodando; docker info mostra detalhes do ambiente (quantidade de containers e imagens, driver de armazenamento etc.); docker run hello-world baixa uma imagem minúscula de teste, cria um container que imprime uma mensagem e termina — prova que o ciclo completo funciona.',
            code: 'docker version\ndocker info\ndocker run hello-world'
          },
          {
            title: 'Padrão OCI e alternativas',
            body: 'OCI (Open Container Initiative) é o padrão aberto que define o formato das imagens e como containers são executados. Graças a ele, imagens funcionam em ferramentas diferentes. O Podman é uma dessas alternativas ao Docker, com comandos muito parecidos — aqui só o mencionamos; o curso usa Docker.'
          },
          {
            title: 'Containers Linux vs Windows e um cuidado de segurança',
            body: 'Existem containers Linux e containers Windows (para programas Windows), mas quase tudo que você vai encontrar e usar neste curso é Linux; é o padrão no Docker Desktop. Cuidado: quem consegue falar com o daemon do Docker tem, na prática, poder de administrador sobre a máquina. Por isso, dar acesso ao Docker (por exemplo, colocar um usuário no grupo docker no Linux) deve ser feito com consciência.'
          }
        ]
      },
      questions: [
        mcq('q1', 'Qual é o papel do daemon (dockerd)?', 'c',
          'É o serviço em segundo plano que cria e gerencia imagens e containers',
          ['É o comando que você digita no terminal', 'É o site onde as imagens ficam guardadas', 'É a interface gráfica do Docker Desktop'],
          'O cliente (docker) pede; o daemon executa.'),
        mcq('q2', 'O que é um registry?', 'b',
          'Um servidor que guarda imagens para baixar e enviar, como o Docker Hub',
          ['Um arquivo com as senhas do Docker', 'Um tipo de container especial', 'O kernel do Linux'],
          'Registry = repositório de imagens.'),
        mcq('q3', 'No Windows, qual tecnologia o Docker Desktop costuma usar para rodar containers Linux?', 'd',
          'WSL2, que fornece um kernel Linux de forma leve e integrada',
          ['O Internet Explorer', 'O prompt de comando antigo (cmd) como motor', 'Nenhuma: containers Linux rodam direto no kernel do Windows'],
          'O WSL2 é a base mais comum do Docker Desktop no Windows.'),
        fill('q4', 'Complete o comando que baixa e roda uma imagem de teste minúscula:', 'docker ___ hello-world',
          ['run', 'container run'],
          'docker run hello-world confirma que cliente, daemon, download de imagem e execução funcionam.'),
        mcq('q5', 'Ao rodar docker version, o bloco do "Server" não aparece e há erro de conexão. O que isso sugere?', 'a',
          'Que o daemon provavelmente não está rodando (ou o cliente não consegue alcançá-lo)',
          ['Que a imagem hello-world está corrompida', 'Que o Docker está atualizado demais', 'Que o computador não tem internet'],
          'O cliente funciona sozinho, mas sem daemon não há servidor para responder.'),
        mcq('q6', 'O que é OCI?', 'd',
          'Um padrão aberto para o formato de imagens e a execução de containers',
          ['Uma marca de processador', 'Um comando do Docker', 'O nome da empresa que criou o WSL2'],
          'O padrão OCI permite que imagens funcionem em diferentes ferramentas, como Docker e Podman.'),
        mcq('q7', 'Por que acesso ao daemon do Docker deve ser dado com cuidado?', 'c',
          'Porque quem controla o daemon tem, na prática, poder de administrador sobre a máquina',
          ['Porque o Docker cobra por cada usuário adicional', 'Porque o daemon apaga o disco se houver dois usuários', 'Não precisa de cuidado: o daemon é totalmente inofensivo'],
          'Com o daemon dá para montar pastas do host e criar containers privilegiados, então o acesso equivale a ser admin.'),
        fill('q8', 'Complete o nome do daemon do Docker:', 'O serviço em segundo plano que gerencia os containers se chama ___.',
          ['dockerd', 'docker daemon'],
          'dockerd é o daemon; o comando docker é o cliente.')
      ]
    },
    {
      id: 'ctr-19-linux-terminal-essencial',
      title: 'Linux e terminal para quem usa containers',
      goal: 'Dominar o mínimo de shell Linux para se virar dentro de containers: navegar, redirecionar, checar permissões, instalar pacotes e lidar com o Windows.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'O shell e como navegar',
            body: 'Quando você abre um terminal dentro de um container (docker run -it imagem sh), quem conversa com você é um shell: o programa que lê seus comandos e os executa. Os dois mais comuns são o sh (simples, presente em praticamente toda imagem) e o bash (mais recursos, mas nem toda imagem o traz). Imagens enxutas como a alpine só têm o sh, então use sh como padrão e tente bash só se existir. Para se orientar: pwd mostra a pasta atual; ls lista arquivos (ls -la mostra todos, inclusive ocultos, com permissões); cd muda de pasta; cat mostra o conteúdo de um arquivo; echo imprime um texto. Um caminho absoluto começa com / (a raiz do sistema), como /etc/hosts; um caminho relativo parte da pasta atual, como ./app ou ../tmp. Pastas comuns: /etc (configurações), /var (dados variáveis, como logs e bancos), /tmp (temporários), /app (convenção para a pasta da aplicação, definida por WORKDIR).',
            code: 'docker run -it --rm alpine sh\npwd              # /\nls -la /etc      # lista a pasta /etc\ncat /etc/os-release\ncd /tmp && pwd   # /tmp'
          },
          {
            title: 'Variáveis de ambiente no shell e códigos de saída',
            body: 'No shell, NOME=valor cria uma variável, e $NOME (ou ${NOME}) usa o valor. Mas uma variável simples só existe no próprio shell: programas que ele inicia não a enxergam. Com export NOME=valor ela passa a ser variável de ambiente, herdada pelos programas filhos. O comando env lista as variáveis de ambiente atuais. Outro conceito: todo comando termina com um código de saída (0 = sucesso, outro número = erro), guardado em $? logo depois. Dá para encadear: cmd1 && cmd2 executa cmd2 só se cmd1 teve sucesso; cmd1 || cmd2 executa cmd2 só se cmd1 falhou; cmd1 ; cmd2 executa os dois sempre.',
            code: 'NOME=ana\nsh -c \'echo "[$NOME]"\'   # [] (não foi exportada)\nexport NOME=ana\nsh -c \'echo "[$NOME]"\'   # [ana]\nls /nao-existe\necho $?                   # diferente de 0\nls /etc && echo "achou" || echo "não achou"'
          },
          {
            title: 'Entrada, saída e redirecionamento',
            body: 'Todo programa tem três fluxos: stdin (entrada, número 0), stdout (saída normal, 1) e stderr (saída de erros, 2). É exatamente por isso que o docker logs mostra o que o programa escreve em stdout e stderr. No shell você redireciona esses fluxos: > envia o stdout para um arquivo, APAGANDO o conteúdo anterior; >> acrescenta ao final sem apagar; 2> redireciona só os erros; 2>&1 manda os erros para o mesmo destino do stdout; e o pipe | liga a saída de um comando à entrada do próximo. O destino especial /dev/null descarta tudo o que for enviado a ele.',
            code: 'echo primeira > nota.txt     # cria/substitui\necho segunda >> nota.txt     # acrescenta\ncat nota.txt | wc -l         # 2 (conta as linhas)\nls /nao-existe 2>/dev/null   # esconde o erro\nls /nao-existe /etc > saida.txt 2>&1   # saída e erro no arquivo'
          },
          {
            title: 'Usuários e permissões',
            body: 'Por padrão, o processo de um container roda como root, o administrador, que tem UID 0 e pode quase tudo dentro do container. whoami mostra o usuário atual; id mostra UID e grupos. Cada arquivo tem dono, grupo e permissões. Em ls -l aparece algo como -rwxr-x---: o primeiro caractere é o tipo (- arquivo, d pasta), e os nove seguintes são três trios para dono, grupo e outros, cada um com r (ler), w (escrever) e x (executar; em pastas, entrar). chmod muda permissões (chmod 640 arquivo ou chmod +x script.sh) e chown muda o dono (chown app:app arquivo). Por que isso importa em containers: quando você usa USER para rodar como não-root, esse usuário precisa conseguir ler e escrever nas pastas que usa; e arquivos de um bind mount mantêm o dono do host, então podem dar permission denied. A saída certa é ajustar o dono (chown, COPY --chown, ou a opção -u do run), NUNCA liberar tudo com chmod 777: isso deixa qualquer usuário alterar o arquivo.',
            code: 'ls -l /etc/hostname\n# -rw-r--r-- 1 root root 13 ...  (dono lê e escreve; os demais só leem)\nid\n# uid=0(root) gid=0(root) ...\nchmod 640 config.txt     # dono lê/escreve, grupo lê, outros nada\nchown app:app dados.txt'
          },
          {
            title: 'Processos e o PID 1',
            body: 'ps lista os processos (em imagens muito enxutas ele pode nem existir; docker top, do lado de fora, também mostra). Cada processo tem um PID. kill PID envia ao processo um sinal pedindo que encerre (SIGTERM); kill -9 PID o mata à força (SIGKILL), sem chance de limpeza. Dentro de um container, o processo principal (o CMD/ENTRYPOINT) é o PID 1. O container vive enquanto o PID 1 viver: se ele termina, o container para. É para o PID 1 que o docker stop envia o sinal de parada.',
            code: 'docker run -d --name espera alpine sleep 300\ndocker exec espera ps\n# PID 1 é o "sleep 300"\ndocker stop espera ; docker rm espera'
          },
          {
            title: 'Instalar pacotes, baixar arquivos e editar',
            body: 'Imagens são enxutas e muitas vezes faltam ferramentas. Em Debian/Ubuntu (e imagens como python:...-slim) use apt-get: primeiro apt-get update (as listas de pacotes costumam vir vazias na imagem) e depois apt-get install -y pacote (-y responde sim sozinho, essencial em build). No Alpine, o gerenciador é o apk: apk add pacote (apk add --no-cache evita guardar o índice). Para baixar arquivos: curl -fsSL URL ou wget URL (o alpine geralmente já traz um wget simples, mas o curl costuma precisar ser instalado). Um pacote instalado dentro de um container em execução some quando ele é recriado; para valer sempre, instale no Dockerfile. Para criar um arquivo pequeno sem editor, use um heredoc: cat > arquivo <<EOF seguido das linhas e fechado por EOF sozinho na linha.',
            code: '# Debian/Ubuntu\napt-get update && apt-get install -y curl\n# Alpine\napk add --no-cache curl\n\ncat > saudacao.txt <<EOF\nOlá, container!\nSegunda linha\nEOF'
          },
          {
            title: 'Windows e PowerShell: o que muda',
            body: 'Dentro do container o shell é Linux, mas no seu computador o terminal pode ser outro. No PowerShell: a continuação de linha é a crase (`) e não a barra invertida (\\); aspas simples não expandem variáveis, enquanto aspas duplas expandem $VAR pelo PowerShell ANTES de chegar ao Docker; a pasta atual é ${PWD} (no bash, $(pwd)); e caminhos são do tipo C:\\Users\\voce\\projeto. No WSL2 (um Linux dentro do Windows), você usa um terminal Linux de verdade: caminhos como /home/voce/projeto, e os discos do Windows ficam em /mnt/c (por exemplo, /mnt/c/Users/voce). Projetos dentro do sistema de arquivos do WSL costumam ser bem mais rápidos com Docker do que os que ficam em /mnt/c. No Git Bash, o programa pode converter caminhos que começam com / de forma inesperada; se acontecer, prefira o PowerShell ou o WSL.',
            code: '# bash / WSL\ndocker run --rm \\\n  -v "$(pwd)":/app:ro alpine ls /app\n\n# PowerShell\ndocker run --rm `\n  -v ${PWD}:/app:ro alpine ls /app'
          }
        ]
      },
      questions: [
        mcq('q1', 'Você precisa abrir um shell em um container baseado na imagem alpine, sem saber se há bash. Qual a escolha mais segura?', 'b',
          'sh, porque praticamente toda imagem o tem, enquanto imagens enxutas como a alpine não trazem o bash',
          ['bash, pois toda imagem Linux o inclui', 'powershell, que vem em toda imagem', 'cmd, o prompt do Windows'],
          'Use sh como padrão; bash só se a imagem o tiver.'),
        mcq('q2', 'O que este comando imprime?\nexport NOME=ana\nsh -c \'echo "[$NOME]"\'', 'c',
          '[ana], porque export torna a variável visível aos programas que o shell inicia',
          ['[], porque variáveis nunca passam para outros programas', '[$NOME], porque as aspas simples impedem tudo', 'Um erro: NOME não pode ser definida no shell'],
          'Sem export a variável existiria só no shell atual e o sh -c imprimiria [].'),
        mcq('q3', 'Qual é o conteúdo final do arquivo?\necho a > f.txt\necho b >> f.txt\ncat f.txt', 'a',
          'Duas linhas: a e depois b (o > criou o arquivo e o >> acrescentou)',
          ['Só b, pois o >> apaga o que havia', 'Só a, pois o >> é ignorado', 'Vazio, pois echo não escreve em arquivos'],
          '> substitui o conteúdo; >> acrescenta ao final.'),
        fill('q4', 'Complete o comando que instala o curl em uma imagem Alpine:', 'apk ___ --no-cache curl',
          ['add'],
          'No Alpine usa-se apk add; no Debian/Ubuntu, apt-get install.'),
        mcq('q5', 'O que este comando imprime se a pasta /nao-existe não existir?\ncd /nao-existe && echo ok || echo erro', 'd',
          'erro, porque o cd falha, o && é pulado e o || executa o echo erro',
          ['ok, pois o echo sempre roda', 'ok e erro, as duas linhas', 'Nada: o shell aborta'],
          '&& só continua se o anterior teve sucesso; || só continua se ele falhou.'),
        mcq('q6', 'Um arquivo mostra -rw-r--r-- com dono root. Um processo rodando como o usuário app (não-root) tenta gravar nele. O que acontece e qual a conduta correta?', 'b',
          'Dá permission denied, pois só o dono (root) tem w; a correção é ajustar o dono ou usar -u/--chown, e não liberar com chmod 777',
          ['Grava normalmente, pois "outros" têm w', 'Grava normalmente, pois todo usuário é root no container', 'Dá erro, e o certo é sempre aplicar chmod 777'],
          'Os três trios são dono/grupo/outros; chmod 777 deixa qualquer usuário alterar o arquivo.'),
        mcq('q7', 'Um container roda com CMD ["sleep", "300"]. Se o processo sleep terminar, o que acontece?', 'c',
          'O container para, porque o processo principal (PID 1) terminou',
          ['O container continua rodando vazio', 'O Docker reinicia o sleep sozinho sempre', 'Nada: processos só terminam com docker rm'],
          'O container vive enquanto o PID 1 viver.'),
        fill('q8', 'Complete o caractere de continuação de linha no PowerShell:', 'docker run --rm ___\n  -v ${PWD}:/app:ro alpine ls /app',
          ['`', 'crase', 'backtick'],
          'No PowerShell usa-se a crase (`); no bash e no WSL, a barra invertida (\\).')
      ]
    },
    {
      id: 'ctr-04-imagens-docker-hub',
      title: 'Imagens e Docker Hub',
      goal: 'Entender nomes e tags de imagem, baixar, listar e remover imagens, e escolher imagens com critério.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Registry e Docker Hub',
            body: 'Imagens ficam guardadas em registries. O Docker Hub (hub.docker.com) é o registry público padrão: quando você pede uma imagem sem informar outro endereço, o Docker procura lá. Empresas também têm registries próprios e privados. Cada imagem fica em um repositório, e um repositório pode ter várias versões, identificadas por tags.'
          },
          {
            title: 'Nome da imagem: repositório:tag',
            body: 'O nome completo tem a forma repositório:tag. O repositório diz QUAL imagem (nginx, python, redis...) e a tag diz QUAL versão ou variante (por exemplo, uma versão específica ou uma variante enxuta chamada slim). Os exemplos abaixo são só ilustrativos: consulte a página da imagem no Docker Hub para ver as tags que existem hoje.',
            code: 'nginx:stable\npython:3.12-slim\nredis:7'
          },
          {
            title: 'A tag latest não é "a mais recente garantida"',
            body: 'Se você não escrever a tag, o Docker usa latest. Mas latest é só um nome comum, uma tag como outra qualquer: quem publica a imagem decide o que ela aponta, e pode estar desatualizada, ou mudar de repente para uma versão incompatível. Em estudos tudo bem, mas em projetos reais prefira tags explícitas (ex.: python:3.12-slim) para que o resultado seja repetível.'
          },
          {
            title: 'Baixar, listar e remover',
            body: 'docker pull baixa uma imagem para o seu computador (docker run também baixa sozinho se faltar). docker images lista as imagens locais. docker rmi remove uma imagem local — o Docker recusa se algum container (mesmo parado) ainda a usa. Remover uma imagem local não apaga nada do registry.',
            code: 'docker pull nginx:stable\ndocker images\ndocker rmi nginx:stable'
          },
          {
            title: 'Imagens oficiais e confiança',
            body: 'No Docker Hub, as "Docker Official Images" são mantidas por um programa de curadoria, e há também publicadores verificados. Qualquer pessoa pode publicar imagens, então uma imagem desconhecida pode trazer software malicioso ou desatualizado e com falhas. Prefira imagens oficiais ou de publicadores confiáveis, leia a descrição e a documentação e desconfie de nomes parecidos com os de imagens famosas.'
          },
          {
            title: 'Digest, camadas e tamanho',
            body: 'Além da tag, cada versão de uma imagem tem um digest: um identificador único calculado a partir do conteúdo (começa com sha256:). Tags podem ser movidas para outra versão; um digest sempre aponta para exatamente o mesmo conteúdo. Uma imagem é formada por camadas empilhadas e reaproveitadas entre imagens, o que economiza disco e download. O tamanho aparece em docker images: imagens menores (como variantes slim) baixam mais rápido e têm menos software para ter falhas.',
            code: '# fixando pelo digest (exemplo ilustrativo)\ndocker pull nginx@sha256:<digest-da-imagem>'
          }
        ]
      },
      questions: [
        mcq('q1', 'No nome "python:3.12-slim", o que significa o trecho depois dos dois pontos?', 'a',
          'A tag: indica a versão ou variante da imagem',
          ['O nome da empresa que publicou', 'O registry onde ela está', 'A porta usada pelo container'],
          'O formato é repositório:tag.'),
        mcq('q2', 'O que a tag latest garante?', 'd',
          'Nada além de ser um nome de tag: pode estar desatualizada ou mudar sem aviso',
          ['Que é sempre a versão mais nova existente', 'Que a imagem é a mais segura', 'Que a imagem é a menor possível'],
          'latest é apenas a tag padrão; em projetos reais use tags explícitas.'),
        mcq('q3', 'Qual comando lista as imagens que você já tem no computador?', 'b',
          'docker images',
          ['docker ps', 'docker pull', 'docker list-hub'],
          'docker images (ou docker image ls) mostra as imagens locais; docker ps lista containers.'),
        fill('q4', 'Complete o comando que baixa uma imagem do registry:', 'docker ___ nginx:stable',
          ['pull', 'image pull'],
          'docker pull baixa a imagem para o computador.'),
        mcq('q5', 'O que acontece se você tentar remover com docker rmi uma imagem usada por um container (mesmo parado)?', 'c',
          'O Docker recusa, pois a imagem ainda está em uso; é preciso remover o container antes',
          ['A imagem é removida e o container passa a funcionar sem ela', 'O container é removido automaticamente', 'A imagem também é apagada do Docker Hub'],
          'Um container depende das camadas da imagem, então o Docker protege contra a remoção.'),
        mcq('q6', 'Por que preferir imagens oficiais ou de publicadores confiáveis?', 'b',
          'Porque qualquer pessoa pode publicar imagens, e uma imagem desconhecida pode ser maliciosa ou desatualizada',
          ['Porque imagens oficiais não precisam de atualização nunca', 'Porque só elas funcionam no Docker', 'Porque imagens de terceiros são proibidas por lei'],
          'A procedência é uma defesa básica de segurança na cadeia de suprimentos.'),
        mcq('q7', 'Qual é a vantagem de referenciar uma imagem pelo digest?', 'a',
          'Ele aponta sempre para exatamente o mesmo conteúdo, enquanto uma tag pode ser movida',
          ['Ele deixa a imagem mais rápida', 'Ele dispensa o uso de registry', 'Ele substitui a necessidade de baixar a imagem'],
          'O digest é calculado a partir do conteúdo (sha256:...), então é imutável.'),
        fill('q8', 'Complete o comando que remove uma imagem local:', 'docker ___ nginx:stable',
          ['rmi', 'image rm', 'image remove'],
          'docker rmi (ou docker image rm) remove imagens locais.')
      ]
    },
    {
      id: 'ctr-05-rodando-containers',
      title: 'Rodando containers: docker run',
      goal: 'Criar, listar, parar, reiniciar, remover e inspecionar containers com os comandos essenciais.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'docker run: criar e iniciar',
            body: 'docker run imagem faz três coisas de uma vez: baixa a imagem se ela não existir localmente, cria um container novo a partir dela e o inicia. Cada docker run cria um container NOVO. O container vive enquanto o seu processo principal estiver rodando; quando o processo termina, o container para.',
            code: 'docker run hello-world'
          },
          {
            title: 'Segundo plano e nome: -d e --name',
            body: 'Por padrão o terminal fica "preso" ao container. A flag -d (detach) roda o container em segundo plano e devolve o terminal. --name escolhe um nome fácil; sem isso o Docker inventa um nome aleatório. Nomes de container são únicos: não dá para ter dois containers com o mesmo nome (mesmo parados).',
            code: 'docker run -d --name web nginx:stable'
          },
          {
            title: 'Modo interativo: -it e --rm',
            body: 'Para conversar com o container pelo teclado, use -i (mantém a entrada aberta) e -t (cria um terminal); juntos, -it. Muito usado para abrir um shell dentro da imagem. A flag --rm remove o container automaticamente quando ele terminar, evitando acumular containers parados — ótima para testes rápidos.',
            code: 'docker run -it --rm alpine sh\n# dentro do container:  ls   e depois   exit'
          },
          {
            title: 'Listar: docker ps',
            body: 'docker ps lista os containers em execução. docker ps -a (all) lista todos, inclusive os que já terminaram (status Exited). Se o seu container "sumiu" do docker ps, procure-o com -a: provavelmente ele terminou.',
            code: 'docker ps\ndocker ps -a'
          },
          {
            title: 'Parar, iniciar, reiniciar e remover',
            body: 'docker stop pede ao processo para encerrar com calma (e o força depois de um tempo). docker start inicia de novo um container parado, o MESMO container, com o mesmo nome. docker restart faz stop + start. docker rm apaga um container parado (para apagar um em execução, pare antes ou use -f, que força). Você pode usar o nome ou o início do ID do container.',
            code: 'docker stop web\ndocker start web\ndocker restart web\ndocker stop web && docker rm web'
          },
          {
            title: 'Olhar dentro: logs e exec',
            body: 'docker logs mostra o que o programa do container escreveu na saída (stdout/stderr) — a primeira coisa a olhar quando algo dá errado. docker exec executa um comando adicional dentro de um container que JÁ está rodando; com -it você abre um shell nele. Diferença importante: docker run cria um container novo; docker exec entra em um existente.',
            code: 'docker logs web\ndocker exec -it web sh'
          }
        ]
      },
      questions: [
        mcq('q1', 'O que o comando docker run nginx:stable faz?', 'c',
          'Baixa a imagem se faltar, cria um container novo e o inicia',
          ['Apenas baixa a imagem, sem criar container', 'Entra em um container que já existe', 'Remove a imagem nginx:stable'],
          'run = (pull se preciso) + create + start, sempre com um container novo.'),
        mcq('q2', 'O que a flag -d faz em docker run -d --name web nginx:stable?', 'a',
          'Roda o container em segundo plano, devolvendo o terminal',
          ['Apaga o container ao terminar', 'Define o nome do container', 'Abre um terminal interativo'],
          '-d = detach (segundo plano); --name é que define o nome.'),
        mcq('q3', 'Qual comando lista também os containers que já terminaram?', 'd',
          'docker ps -a',
          ['docker ps', 'docker images -a', 'docker logs -a'],
          'docker ps mostra só os em execução; -a mostra todos.'),
        fill('q4', 'Complete a flag que roda o container em segundo plano:', 'docker run ___ --name web nginx:stable',
          ['-d', '--detach'],
          '-d (ou --detach) devolve o terminal imediatamente.'),
        mcq('q5', 'Para que serve a flag --rm?', 'b',
          'Remove o container automaticamente quando ele terminar',
          ['Remove a imagem depois do uso', 'Reinicia o container se ele falhar', 'Remove os logs do container'],
          '--rm evita acumular containers parados em testes.'),
        mcq('q6', 'Qual a diferença entre docker run e docker exec?', 'c',
          'run cria um container novo; exec executa um comando dentro de um container que já está em execução',
          ['São idênticos', 'exec cria containers e run só entra em containers existentes', 'exec só funciona com containers parados'],
          'exec precisa de um container rodando.'),
        mcq('q7', 'Qual comando abre um shell interativo dentro do container web, que já está rodando?', 'd',
          'docker exec -it web sh',
          ['docker run -it web sh', 'docker logs -it web sh', 'docker start -it web sh --new'],
          'exec -it abre um terminal em um container existente. (Algumas imagens usam bash em vez de sh.)'),
        fill('q8', 'Complete o comando que lista todos os containers, inclusive os parados:', 'docker ___ -a',
          ['ps', 'container ls', 'container ps', 'container list'],
          'docker ps -a (ou docker container ls -a) lista todos.')
      ]
    },
    {
      id: 'ctr-06-portas-e-acesso',
      title: 'Portas e acesso',
      goal: 'Publicar portas com -p, entender EXPOSE e limitar o acesso ao próprio computador com 127.0.0.1.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'O container tem a sua própria rede',
            body: 'Um servidor dentro do container (por exemplo, o nginx na porta 80) escuta na rede PRIVADA do container. Por padrão, nada de fora, nem o seu navegador, consegue chegar nela. Para acessar, é preciso publicar a porta: ligar uma porta do seu computador (host) a uma porta do container.'
          },
          {
            title: '-p host:container',
            body: 'A flag -p (ou --publish) usa o formato -p PORTA_DO_HOST:PORTA_DO_CONTAINER. A primeira é onde você acessa no seu computador; a segunda é onde o programa escuta dentro do container. Atenção à ordem: host primeiro, container depois.',
            code: 'docker run -d --name web -p 8080:80 nginx:stable'
          },
          {
            title: 'Acessando pelo navegador',
            body: 'Com o container acima rodando, abra http://localhost:8080 (ou use curl). localhost significa "este próprio computador". O pedido entra pela porta 8080 do host e o Docker o encaminha para a porta 80 do container. Para ver o mapeamento atual, use docker ps (coluna PORTS) ou docker port web.',
            code: 'curl http://localhost:8080\ndocker port web'
          },
          {
            title: 'EXPOSE não publica nada',
            body: 'No Dockerfile, a instrução EXPOSE 80 serve só como documentação: avisa quem lê (e algumas ferramentas) em qual porta o programa escuta. Ela NÃO abre a porta para o host. Quem publica é o -p no docker run (ou a chave ports no Compose). Sem -p, o container fica inacessível a partir do host.'
          },
          {
            title: 'Publicar só para si: 127.0.0.1',
            body: 'Se você escreve apenas -p 8080:80, a porta é publicada em todas as interfaces de rede do host: outros computadores da sua rede podem conseguir acessá-la. Para serviços que só você usa (um banco de teste, uma página de desenvolvimento), prefixe com 127.0.0.1: assim só o seu próprio computador alcança. É uma boa prática de segurança: exponha apenas o que precisa e para quem precisa. Em Linux, publicar portas pode até passar por cima de firewalls simples, o que reforça o cuidado.',
            code: 'docker run -d --name web -p 127.0.0.1:8080:80 nginx:stable'
          },
          {
            title: 'Porta ocupada',
            body: 'Duas coisas não podem usar a mesma porta do host ao mesmo tempo. Se a 8080 já está em uso (por outro container ou programa), o docker run falha com "port is already allocated" ou erro parecido. A solução: escolher outra porta do host (como -p 8081:80) ou parar quem está usando a porta. Já a porta DENTRO do container pode ser igual em vários containers, porque cada um tem a sua rede.',
            code: 'docker run -d --name web2 -p 8081:80 nginx:stable'
          }
        ]
      },
      questions: [
        mcq('q1', 'Em -p 8080:80, qual porta é a do seu computador (host)?', 'b',
          '8080',
          ['80', 'As duas', 'Nenhuma: -p não envolve o host'],
          'O formato é host:container, então 8080 é a do host e 80 a do container.'),
        mcq('q2', 'Um container nginx foi iniciado SEM -p. O que acontece ao abrir http://localhost:8080?', 'd',
          'Não acessa: sem publicar a porta, o container fica inacessível a partir do host',
          ['Abre a página normalmente, pois o nginx usa a porta 80', 'Abre a página porque o Docker publica tudo por padrão', 'O Docker publica a porta sozinho na primeira requisição'],
          'É preciso publicar a porta explicitamente com -p.'),
        mcq('q3', 'O que a instrução EXPOSE 80 faz em um Dockerfile?', 'a',
          'Apenas documenta a porta em que o programa escuta; não publica nada para o host',
          ['Publica a porta 80 no host automaticamente', 'Bloqueia a porta 80', 'Instala um servidor web na imagem'],
          'EXPOSE é informativo; quem publica é -p (ou ports no Compose).'),
        fill('q4', 'Complete a flag que publica uma porta:', 'docker run -d ___ 8080:80 nginx:stable',
          ['-p', '--publish'],
          '-p (ou --publish) mapeia porta_do_host:porta_do_container.'),
        mcq('q5', 'Qual comando publica a porta 5432 do container SOMENTE para o próprio computador?', 'c',
          'docker run -p 127.0.0.1:5432:5432 imagem',
          ['docker run -p 5432:5432 imagem', 'docker run -p 0.0.0.0:5432:5432 imagem', 'docker run -p 5432 imagem'],
          'Prefixar com 127.0.0.1 limita o acesso ao localhost; sem o prefixo a porta fica aberta a outras máquinas da rede.'),
        mcq('q6', 'Ao subir um segundo container com -p 8080:80, aparece "port is already allocated". Qual a solução mais direta?', 'd',
          'Usar outra porta do host, como -p 8081:80, ou parar quem usa a 8080',
          ['Reinstalar o Docker', 'Mudar a porta 80 DENTRO do container, pois ela é a que conflita', 'Apagar todas as imagens'],
          'O conflito é na porta do HOST; as portas internas de containers diferentes não colidem.'),
        mcq('q7', 'Por que não expor ao mundo um banco de dados de testes?', 'b',
          'Porque, sem proteção adequada, qualquer um que alcance a porta pode tentar acessar os dados; limite ao 127.0.0.1',
          ['Porque bancos de dados não funcionam em rede', 'Porque o Docker proíbe portas acima de 1024', 'Não há motivo: expor sempre é seguro'],
          'Princípio do menor acesso: publique somente o necessário e para quem precisa.'),
        fill('q8', 'Complete o endereço que limita a porta publicada ao seu próprio computador:', 'docker run -d -p ___:8080:80 nginx:stable',
          ['127.0.0.1'],
          '127.0.0.1 é o endereço de loopback: só o próprio computador acessa.')
      ]
    },
    {
      id: 'ctr-07-variaveis-comandos-inspect',
      title: 'Variáveis de ambiente, comandos e inspect',
      goal: 'Configurar containers com variáveis de ambiente, trocar o comando executado, ler exit codes e usar docker inspect.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Variáveis de ambiente com -e',
            body: 'Variáveis de ambiente são pares NOME=valor que o programa lê ao iniciar, uma forma comum de configurar aplicações sem mudar o código (modo de execução, endereço de um serviço, etc.). No docker run, cada -e (ou --env) define uma delas dentro do container. A mesma imagem pode se comportar de modos diferentes só trocando as variáveis.',
            code: 'docker run --rm -e APP_MODE=teste alpine env'
          },
          {
            title: 'Várias variáveis: --env-file',
            body: 'Com muitas variáveis, coloque-as em um arquivo de texto (uma NOME=valor por linha) e use --env-file. Cuidado de segurança: arquivos de ambiente costumam guardar senhas e chaves. Nunca os envie ao Git (adicione-os ao .gitignore) nem os copie para dentro de uma imagem. E lembre que quem consegue rodar docker inspect no container vê as variáveis, então não trate isso como cofre de segredos.',
            code: '# arquivo app.env (fictício)\nAPP_MODE=teste\nTAMANHO_PAGINA=20\n\ndocker run --rm --env-file app.env alpine env'
          },
          {
            title: 'Trocando o comando executado',
            body: 'Toda imagem tem um comando padrão. Para executar outra coisa, escreva o comando depois do nome da imagem: ele substitui o padrão só nesta execução. Se o comando usar variáveis, envolva em aspas simples para que quem expanda $VARIAVEL seja o shell DENTRO do container, não o seu terminal. (No PowerShell, aspas simples também não expandem; no cmd.exe, use aspas duplas.)',
            code: 'docker run --rm alpine echo "Olá, container"\ndocker run --rm -e APP_MODE=teste alpine sh -c \'echo $APP_MODE\''
          },
          {
            title: 'Exit codes',
            body: 'Todo programa termina devolvendo um exit code (código de saída): 0 significa sucesso; qualquer outro número indica algum erro. O docker run repassa o código do programa. Containers parados mostram o código em docker ps -a, na coluna STATUS (por exemplo, Exited (0) ou Exited (1)). No Linux/macOS o último código fica em $?; no PowerShell, em $LASTEXITCODE.',
            code: 'docker run --rm alpine sh -c \'exit 3\'\necho $?              # bash: 3\n# PowerShell:  $LASTEXITCODE'
          },
          {
            title: 'docker inspect',
            body: 'docker inspect nome devolve um grande JSON com tudo sobre o container (ou imagem, volume, rede): estado, variáveis de ambiente, portas, montagens, rede, comando executado, exit code. É a ferramenta para responder "como esse container foi realmente criado?".',
            code: 'docker inspect web'
          },
          {
            title: 'Extraindo um campo com --format',
            body: 'O JSON é longo; --format (ou -f) usa um modelo para mostrar só o que interessa, com a sintaxe {{.Campo.SubCampo}}. Em PowerShell e bash, use aspas simples em volta do modelo.',
            code: 'docker inspect --format \'{{.State.Status}}\' web\ndocker inspect --format \'{{.State.ExitCode}}\' web'
          }
        ]
      },
      questions: [
        mcq('q1', 'O que faz a flag -e em docker run?', 'd',
          'Define uma variável de ambiente dentro do container',
          ['Executa o container em modo exclusivo', 'Expõe uma porta', 'Edita a imagem original'],
          '-e NOME=valor injeta a variável no ambiente do processo do container.'),
        mcq('q2', 'Qual cuidado ter com um arquivo usado em --env-file que contém senhas?', 'c',
          'Não versioná-lo no Git (usar .gitignore) nem copiá-lo para dentro da imagem',
          ['Nenhum: arquivos .env são públicos por natureza', 'Enviá-lo ao repositório para que o time tenha acesso', 'Copiá-lo para a imagem com COPY para ficar sempre junto'],
          'Segredos ficam fora do controle de versão e fora das imagens, que podem ser compartilhadas.'),
        mcq('q3', 'O que faz o comando docker run --rm alpine echo oi?', 'b',
          'Executa echo oi no lugar do comando padrão da imagem e, ao terminar, remove o container',
          ['Altera permanentemente o comando padrão da imagem alpine', 'Falha, pois o echo não existe em containers', 'Cria um container que nunca termina'],
          'O texto depois do nome da imagem substitui o comando padrão apenas naquela execução.'),
        fill('q4', 'Complete a flag que define uma variável de ambiente:', 'docker run --rm ___ APP_MODE=teste alpine env',
          ['-e', '--env'],
          '-e (ou --env) define NOME=valor dentro do container.'),
        mcq('q5', 'O que significa um exit code 0?', 'a',
          'O programa terminou com sucesso',
          ['O programa terminou com erro', 'O programa nem chegou a iniciar', 'O container foi removido'],
          'Zero é sucesso; valores diferentes de zero indicam erro.'),
        mcq('q6', 'Qual comando mostra só o estado (running, exited...) de um container chamado web?', 'b',
          'docker inspect --format \'{{.State.Status}}\' web',
          ['docker inspect --state web', 'docker logs --format status web', 'docker ps --inspect web'],
          'O modelo {{.State.Status}} extrai apenas o campo de estado do JSON do inspect.'),
        mcq('q7', 'O que este comando imprime?\ndocker run --rm -e APP_MODE=teste alpine sh -c \'echo $APP_MODE\'', 'c',
          'teste',
          ['APP_MODE', 'Nada, porque as aspas simples impedem a leitura da variável dentro do container', '$APP_MODE'],
          'As aspas simples impedem o seu terminal de expandir; quem expande é o sh dentro do container, onde a variável existe.'),
        fill('q8', 'Complete o exit code de um programa que terminou com sucesso:', 'Exited (___) 5 seconds ago',
          ['0'],
          'No docker ps -a, Exited (0) indica término com sucesso.')
      ]
    },
    {
      id: 'ctr-08-ciclo-de-vida-inspecao',
      title: 'Ciclo de vida e inspeção',
      goal: 'Reconhecer os estados de um container e usar logs, stats, top, cp, pause e políticas de restart.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Estados de um container',
            body: 'Um container passa por estados. created: foi criado mas ainda não iniciado. running: o processo principal está em execução. paused: os processos foram congelados. exited: o processo principal terminou (com sucesso ou erro) e o container está parado, mas ainda existe no disco até ser removido. Existem outros estados menos comuns (como restarting, quando o Docker o está reiniciando).',
            code: 'docker create --name teste alpine   # created\ndocker start teste                  # running -> exited (acabou rápido)\ndocker ps -a'
          },
          {
            title: 'Logs ao vivo e recortados',
            body: 'docker logs -f acompanha a saída em tempo real (como um "tail -f"; Ctrl+C sai sem parar o container). --tail N mostra apenas as N últimas linhas, útil quando o log é enorme. Combine: docker logs -f --tail 50 web. Também existem --since e -t (timestamps).',
            code: 'docker logs -f --tail 50 web'
          },
          {
            title: 'Consumo de recursos: stats e top',
            body: 'docker stats mostra, ao vivo, CPU, memória, rede e disco de cada container em execução (Ctrl+C para sair). docker top nome lista os processos que rodam dentro de um container específico, semelhante ao comando ps do Linux. Servem para descobrir um container "pesado" ou confirmar que o processo esperado está ativo.',
            code: 'docker stats\ndocker top web'
          },
          {
            title: 'Copiando arquivos: docker cp',
            body: 'docker cp copia arquivos entre o seu computador e um container, nos dois sentidos, mesmo com o container parado. A sintaxe é cp origem destino, usando nome:caminho para o lado do container. Serve para pegar um log ou um arquivo de configuração; para dados que precisam persistir, o certo são volumes (veremos mais à frente).',
            code: 'docker cp web:/etc/nginx/nginx.conf ./nginx.conf\ndocker cp ./index.html web:/usr/share/nginx/html/'
          },
          {
            title: 'Pausar e retomar',
            body: 'docker pause congela todos os processos do container: ele continua existindo e na memória, mas não executa nada. docker unpause retoma de onde parou. Não confunda com docker stop, que ENCERRA o processo (o container vai para exited). Pausar é útil, por exemplo, para tirar uma "foto" consistente do estado ou aliviar a máquina por um momento.',
            code: 'docker pause web\ndocker unpause web'
          },
          {
            title: 'Políticas de restart',
            body: 'Com --restart você diz ao Docker o que fazer quando o container terminar. no (padrão): nunca reinicia. on-failure: reinicia só se terminar com erro (exit code diferente de 0). always: sempre reinicia, inclusive quando o Docker reinicia. unless-stopped: como always, exceto se você parou o container manualmente. É assim que serviços voltam sozinhos depois de um reboot. Por último, docker events mostra em tempo real os eventos do Docker (container iniciado, parado...) — só o citamos aqui.',
            code: 'docker run -d --name web --restart unless-stopped nginx:stable'
          }
        ]
      },
      questions: [
        mcq('q1', 'Qual estado indica que o processo principal terminou, mas o container ainda existe?', 'a',
          'exited',
          ['created', 'running', 'paused'],
          'Exited = parado após terminar; só some do disco com docker rm.'),
        mcq('q2', 'O que o docker logs -f --tail 50 web faz?', 'b',
          'Mostra as últimas 50 linhas do log e continua acompanhando novas linhas em tempo real',
          ['Apaga as primeiras 50 linhas do log', 'Mostra 50 containers ao vivo', 'Reinicia o container 50 vezes'],
          '--tail limita as linhas iniciais; -f acompanha a saída ao vivo.'),
        mcq('q3', 'Qual a diferença entre docker pause e docker stop?', 'c',
          'pause congela os processos e mantém o container na memória; stop encerra o processo e o container vai para exited',
          ['pause apaga o container e stop apenas o esconde', 'São o mesmo comando com nomes diferentes', 'pause só funciona com containers parados'],
          'Pausar suspende; parar encerra.'),
        fill('q4', 'Complete a opção que limita o log às últimas linhas:', 'docker logs -f --___ 50 web',
          ['tail'],
          '--tail 50 mostra as últimas 50 linhas.'),
        mcq('q5', 'Qual comando mostra o consumo ao vivo de CPU e memória dos containers?', 'd',
          'docker stats',
          ['docker top', 'docker events', 'docker cp'],
          'stats = recursos; top = processos de um container; events = eventos do Docker.'),
        mcq('q6', 'Para copiar um arquivo do container web para a pasta atual do computador, qual comando está correto?', 'a',
          'docker cp web:/etc/hostname ./hostname.txt',
          ['docker cp ./hostname.txt /etc/hostname web', 'docker exec cp web /etc/hostname', 'docker logs web:/etc/hostname'],
          'cp aceita origem e destino; o lado do container usa nome:caminho.'),
        mcq('q7', 'Qual política faz o container voltar após um reboot, MENOS se você o parou manualmente?', 'c',
          '--restart unless-stopped',
          ['--restart no', '--restart on-failure', '--restart never'],
          'unless-stopped respeita a sua parada manual; always reiniciaria mesmo assim em certas situações.'),
        fill('q8', 'Complete a política que reinicia o container, exceto se ele foi parado manualmente:', 'docker run -d --restart ___ nginx:stable',
          ['unless-stopped'],
          'unless-stopped é a política mais usada para serviços de longa duração.')
      ]
    },
    {
      id: 'ctr-21-docker-dia-a-dia',
      title: 'Mais opções e comandos do dia a dia',
      goal: 'Usar com segurança search, create, attach, stop/kill, rename, diff, wait, mais opções de run e os comandos de gerenciamento.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'docker search e a confiança nos resultados',
            body: 'docker search termo procura imagens no Docker Hub direto do terminal e lista nome, descrição, estrelas e se é oficial. Serve para uma primeira pista, mas a saída é curta e não mostra o publicador, as tags nem a documentação. Antes de usar uma imagem, abra a página dela no Docker Hub e confira o publicador (imagem oficial ou publicador verificado), as tags e a descrição. Para listar só as oficiais, use o filtro is-official=true.',
            code: 'docker search nginx\ndocker search --filter is-official=true nginx'
          },
          {
            title: 'create vs run vs start',
            body: 'docker run = (baixar se preciso) + create + start. docker create faz só a criação: o container nasce no estado created, com todas as opções, mas sem executar. Depois, docker start inicia esse mesmo container (com -a ele já anexa à saída). É útil para preparar um container para ser iniciado depois, ou separar a configuração da execução.',
            code: 'docker create --name preparado alpine echo "oi"\ndocker start -a preparado   # inicia e mostra a saída\ndocker ps -a'
          },
          {
            title: 'attach vs exec e como sair sem matar',
            body: 'docker attach conecta seu terminal ao processo PRINCIPAL do container (PID 1): você vê e digita na entrada e saída dele. Já docker exec inicia um processo NOVO dentro do container. Diferença prática: sair de um exec só encerra aquele processo; sair do attach (por exemplo, com exit ou Ctrl+C) pode encerrar o processo principal e, com isso, o container. Para desanexar sem matar, em um container iniciado com -it use a sequência Ctrl+P seguida de Ctrl+Q. Na dúvida, prefira exec.',
            code: 'docker run -dit --name sessao alpine sh\ndocker attach sessao   # Ctrl+P Ctrl+Q para sair sem parar\ndocker exec -it sessao sh   # este exit não afeta o container'
          },
          {
            title: 'stop vs kill, rename, diff e wait',
            body: 'docker stop manda ao PID 1 um SIGTERM (pedido educado de encerramento) e, se ele não sair em alguns segundos (ajustável com -t), manda SIGKILL. docker kill manda direto SIGKILL (por padrão), sem chance de limpeza; com -s você escolhe outro sinal. Três utilitários: docker rename nome-antigo nome-novo troca o nome; docker diff nome lista os arquivos adicionados (A), alterados (C) ou removidos (D) na camada do container em relação à imagem, ótimo para descobrir onde o programa escreve; docker wait nome fica bloqueado até o container parar e imprime o código de saída.',
            code: 'docker stop web\ndocker kill web\ndocker rename web site\ndocker diff site\ndocker wait site   # imprime o exit code ao parar'
          },
          {
            title: 'Mais opções do docker run',
            body: '-w/--workdir define a pasta de trabalho dentro do container para o comando. -u/--user define o usuário (nome ou UID:GID), em vez de root. --hostname define o nome da máquina que o container enxerga. --entrypoint troca o ENTRYPOINT da imagem. Em detalhe, -i mantém a entrada (stdin) aberta e -t aloca um pseudoterminal: -it é para sessões interativas; só -i serve para ler dados de um pipe; só -t aloca o terminal sem permitir digitar.',
            code: 'docker run --rm -w /tmp alpine pwd\ndocker run --rm -u 1000:1000 alpine id\ndocker run --rm --hostname laboratorio alpine hostname\ndocker run --rm --entrypoint sh alpine -c "echo oi"\necho oi | docker run --rm -i alpine cat'
          },
          {
            title: '--rm como padrão e ferramentas pontuais',
            body: 'Para tarefas descartáveis, adote --rm como hábito: o container some ao terminar e você não acumula parados. Isso permite usar o Docker como uma caixa de ferramentas: rodar uma ferramenta ou linguagem sem instalá-la, usando docker run --rm imagem comando. Ao montar uma pasta com -v, lembre das permissões (aula de Linux): arquivos criados pelo container ficam com o dono do usuário dele, normalmente root; -u evita isso quando for o caso.',
            code: 'docker run --rm python:3.12-slim python -c "print(2 + 2)"\ndocker run --rm -v "$(pwd)":/work -w /work alpine ls -la'
          },
          {
            title: 'Comandos de gerenciamento e revisão',
            body: 'O Docker organiza os comandos por grupo: docker container ls, docker image ls, docker volume ls e docker network ls. Os aliases antigos (docker ps, docker images) continuam funcionando, mas a forma com o grupo é mais regular e fácil de lembrar (docker container --help lista todas as operações de um grupo). Revisando o que já vimos: docker port mostra as portas publicadas, docker top lista os processos de um container e docker cp copia arquivos entre o computador e o container.',
            code: 'docker container ls -a\ndocker image ls\ndocker volume ls\ndocker network ls\ndocker port web\ndocker top web'
          }
        ]
      },
      questions: [
        mcq('q1', 'Você achou uma imagem com docker search. Qual a conduta mais segura antes de usá-la?', 'c',
          'Abrir a página dela no Docker Hub e conferir o publicador (oficial ou verificado), as tags e a documentação',
          ['Usá-la na hora, pois aparecer na busca prova que é confiável', 'Escolher a de mais estrelas sem olhar o resto', 'Rodá-la com --privileged para testar'],
          'A busca no terminal é só uma pista; a procedência se confere no Docker Hub.'),
        mcq('q2', 'Qual a diferença entre docker create e docker run?', 'b',
          'create só cria o container (estado created), sem executá-lo; run baixa se preciso, cria e inicia',
          ['create inicia o container e run só o cria', 'São idênticos', 'create remove o container ao terminar'],
          'run = create + start; depois docker start inicia um container criado.'),
        mcq('q3', 'Qual afirmação sobre attach e exec é correta?', 'd',
          'attach conecta ao processo principal (sair pode encerrá-lo); exec inicia um processo novo, e sair dele não afeta o container; Ctrl+P Ctrl+Q desanexa sem parar',
          ['attach cria um container novo e exec conecta ao existente', 'Ctrl+C no attach nunca afeta o container', 'exec encerra sempre o container ao sair'],
          'Na dúvida, use exec; para desanexar do attach use Ctrl+P Ctrl+Q.'),
        fill('q4', 'Complete a opção que define a pasta de trabalho do comando no container:', 'docker run --rm ___ /tmp alpine pwd',
          ['-w', '--workdir'],
          '-w (ou --workdir) escolhe a pasta de trabalho; o comando acima imprime /tmp.'),
        mcq('q5', 'Qual a diferença entre docker stop e docker kill?', 'a',
          'stop envia SIGTERM e, se o processo não sair a tempo, SIGKILL; kill envia direto SIGKILL (por padrão)',
          ['stop apaga o container e kill apenas o pausa', 'kill dá chance de limpeza e stop não', 'São idênticos'],
          'SIGTERM permite encerrar com calma; SIGKILL mata sem aviso.'),
        mcq('q6', 'O que este comando imprime?\necho oi | docker run --rm -i alpine cat', 'c',
          'oi, pois -i mantém o stdin aberto e o cat devolve o que o pipe enviou',
          ['Nada, pois sem -t o container não lê entrada', 'Um erro, pois cat não existe no alpine', 'cat'],
          '-i mantém a entrada aberta (útil para pipes); -t é só o pseudoterminal.'),
        mcq('q7', 'Você quer saber quais arquivos o programa criou ou alterou na camada de um container em relação à imagem. Qual comando usar?', 'd',
          'docker diff nome',
          ['docker wait nome', 'docker rename nome', 'docker search nome'],
          'diff mostra A (adicionado), C (alterado) e D (removido); wait espera o container parar e imprime o exit code.'),
        fill('q8', 'Complete o grupo que corresponde ao comando antigo docker ps:', 'docker ___ ls -a',
          ['container'],
          'docker container ls é o equivalente em forma de grupo de docker ps.')
      ]
    },
    {
      id: 'ctr-09-dockerfile-basico',
      title: 'Dockerfile básico',
      goal: 'Escrever um Dockerfile simples e construir uma imagem com docker build, entendendo contexto e .dockerignore.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'O que é um Dockerfile',
            body: 'Um Dockerfile é um arquivo de texto (chamado Dockerfile, sem extensão) com a receita para construir uma imagem: uma lista de instruções, executadas em ordem. Em vez de criar uma imagem na mão, você descreve os passos, e qualquer pessoa reproduz o mesmo resultado com um único comando.'
          },
          {
            title: 'FROM e WORKDIR',
            body: 'FROM escolhe a imagem base, o ponto de partida (por exemplo, uma imagem com Python já instalado). Quase todo Dockerfile começa com ele. WORKDIR define a pasta de trabalho dentro da imagem: ela é criada se não existir, e as instruções seguintes (COPY, RUN, CMD) passam a rodar nela.',
            code: 'FROM python:3.12-slim\nWORKDIR /app'
          },
          {
            title: 'COPY e RUN',
            body: 'COPY origem destino copia arquivos da sua pasta (o contexto de build) para dentro da imagem. RUN executa um comando DURANTE O BUILD (por exemplo, instalar dependências) e grava o resultado na imagem. RUN roda uma vez, na construção; não é o que o container executa ao iniciar.',
            code: 'COPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\nCOPY app.py .'
          },
          {
            title: 'CMD e EXPOSE',
            body: 'CMD define o comando que o container executa ao iniciar, o processo principal (só vale o último CMD do arquivo). Diferente do RUN, não roda no build. EXPOSE documenta a porta em que o programa escuta (lembre: não publica nada). Juntos, fecham o exemplo completo.',
            code: 'FROM python:3.12-slim\nWORKDIR /app\nCOPY app.py .\nEXPOSE 8000\nCMD ["python", "app.py"]'
          },
          {
            title: 'docker build',
            body: 'docker build constrói a imagem a partir do Dockerfile. -t dá nome e tag (-t nome:tag); sem tag vira latest. O ponto final é o contexto de build: a pasta cujo conteúdo é enviado ao Docker e onde o COPY procura arquivos. O build atual usa o BuildKit por padrão. Depois, é só rodar a imagem com docker run.',
            code: 'docker build -t meu-app:1.0 .\ndocker run --rm meu-app:1.0'
          },
          {
            title: 'Contexto de build e .dockerignore',
            body: 'Tudo no contexto pode ser enviado ao Docker e copiado por um COPY . . — inclusive coisas que não deveriam ir para a imagem, como a pasta .git, node_modules, arquivos .env com segredos e logs. O arquivo .dockerignore, na raiz do contexto, lista o que deve ser ignorado (um padrão por linha, como o .gitignore). Isso deixa o build mais rápido e evita vazar segredos para dentro da imagem.',
            code: '# .dockerignore\n.git\nnode_modules\n.env\n*.log'
          }
        ]
      },
      questions: [
        mcq('q1', 'O que é um Dockerfile?', 'c',
          'Um arquivo de texto com as instruções para construir uma imagem',
          ['Um container em execução', 'Um registry local', 'O arquivo que o Docker gera ao parar um container'],
          'O Dockerfile é a "receita" da imagem.'),
        mcq('q2', 'Qual a diferença entre RUN e CMD?', 'd',
          'RUN executa durante o build e grava o resultado na imagem; CMD define o comando que roda quando o container inicia',
          ['RUN roda ao iniciar o container; CMD roda no build', 'São idênticos', 'RUN só serve para baixar imagens'],
          'Build-time (RUN) vs run-time (CMD).'),
        mcq('q3', 'O que o ponto final em docker build -t meu-app:1.0 . representa?', 'a',
          'O contexto de build: a pasta atual, de onde o COPY lê os arquivos',
          ['O nome da imagem', 'A tag da imagem', 'A porta publicada'],
          'O último argumento do build é o contexto; o ponto é a pasta atual.'),
        fill('q4', 'Complete a instrução que escolhe a imagem base:', '___ python:3.12-slim\nWORKDIR /app',
          ['FROM'],
          'FROM define a imagem de partida e normalmente é a primeira instrução.'),
        mcq('q5', 'Para que serve o .dockerignore?', 'b',
          'Para listar arquivos e pastas do contexto que não devem ser enviados ao build nem copiados para a imagem',
          ['Para impedir que o container acesse a internet', 'Para ignorar erros de build', 'Para esconder a imagem no Docker Hub'],
          'Evita incluir .git, node_modules, .env e afins, deixando o build mais rápido e seguro.'),
        mcq('q6', 'O que faz a instrução WORKDIR /app?', 'd',
          'Define /app como a pasta de trabalho (criando-a se preciso) para as instruções seguintes',
          ['Copia a pasta app do computador para a imagem', 'Publica a porta /app', 'Apaga a pasta /app'],
          'WORKDIR muda o diretório atual dentro da imagem.'),
        mcq('q7', 'No Dockerfile abaixo, qual linha NÃO é executada durante o build, e sim ao iniciar o container?\nFROM python:3.12-slim\nWORKDIR /app\nCOPY app.py .\nCMD ["python", "app.py"]', 'a',
          'CMD ["python", "app.py"]',
          ['COPY app.py .', 'WORKDIR /app', 'FROM python:3.12-slim'],
          'CMD apenas registra o comando padrão; ele roda quando o container inicia.'),
        fill('q8', 'Complete a flag que dá nome e tag à imagem:', 'docker build ___ meu-app:1.0 .',
          ['-t', '--tag'],
          '-t (ou --tag) nome:tag nomeia a imagem construída.')
      ]
    },
    {
      id: 'ctr-10-camadas-e-cache',
      title: 'Camadas e cache de build',
      goal: 'Entender como as instruções viram camadas, como o cache acelera o build e como ordenar o Dockerfile para aproveitá-lo.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Cada instrução, uma camada',
            body: 'Uma imagem é uma pilha de camadas somente leitura. Instruções que alteram o sistema de arquivos (como COPY e RUN) geram uma nova camada com as diferenças em relação à anterior. A imagem final é o conjunto empilhado. Camadas podem ser compartilhadas entre imagens e entre builds, o que economiza disco e tempo.'
          },
          {
            title: 'O cache de build',
            body: 'Ao construir, o Docker compara cada instrução com a do build anterior. Se a instrução é idêntica (e, no caso do COPY, os arquivos copiados não mudaram), ele reaproveita a camada pronta, sem executá-la de novo; no log aparece como CACHED. Reconstruir sem mudanças fica quase instantâneo.'
          },
          {
            title: 'Invalidação do cache',
            body: 'Quando uma instrução muda (ou os arquivos que ela copia mudam), o cache dessa camada é invalidado, e TODAS as instruções seguintes também são refeitas, mesmo que não tenham mudado. Por isso a ordem importa: o que muda pouco deve vir primeiro; o que muda com frequência (seu código) deve vir por último.'
          },
          {
            title: 'Copie o manifesto de dependências antes do código',
            body: 'Padrão clássico: copie primeiro só o arquivo que lista as dependências (package.json e package-lock.json no Node, requirements.txt no Python), instale-as, e só depois copie o resto do código. Assim, editar o código invalida apenas a última camada; a instalação de dependências, que é lenta, permanece em cache até a lista de dependências mudar.',
            code: '# BOM\nFROM node:22-slim\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\n\n# RUIM: qualquer edição de código refaz o npm ci\n# COPY . .\n# RUN npm ci'
          },
          {
            title: '--no-cache',
            body: 'Às vezes você quer ignorar o cache: por exemplo, para garantir que o RUN baixe as versões mais novas dos pacotes, já que o cache não percebe que algo mudou "lá fora". Use docker build --no-cache. Faz o build inteiro do zero, mais lento; use só quando necessário.',
            code: 'docker build --no-cache -t meu-app:1.0 .'
          },
          {
            title: 'Camadas são permanentes: cuidado com segredos',
            body: 'Como as camadas só acumulam, apagar um arquivo em um RUN posterior NÃO o remove das camadas anteriores: ele continua dentro da imagem e pode ser extraído por quem a tiver. Por isso, nunca copie senhas, chaves ou arquivos .env para dentro da imagem, nem "para depois apagar". Por fim, é comum juntar comandos relacionados em um único RUN com && para reduzir camadas desnecessárias.'
          }
        ]
      },
      questions: [
        mcq('q1', 'Qual instrução NORMALMENTE gera uma nova camada na imagem?', 'b',
          'RUN e COPY, que alteram o sistema de arquivos',
          ['Apenas FROM', 'Nenhuma: a imagem é uma camada única', 'Somente comentários no Dockerfile'],
          'Instruções que modificam arquivos (RUN, COPY) criam camadas.'),
        mcq('q2', 'O que o Docker faz quando uma instrução e seus arquivos são idênticos aos do build anterior?', 'a',
          'Reaproveita a camada do cache, sem executá-la de novo',
          ['Executa de novo, por segurança', 'Apaga a camada e ignora a instrução', 'Falha o build'],
          'Isso é o cache: aparece como CACHED no log do build.'),
        mcq('q3', 'Se você muda uma instrução no meio do Dockerfile, o que acontece com as instruções seguintes?', 'd',
          'O cache delas é invalidado e elas são refeitas',
          ['Continuam em cache, pois não mudaram', 'São ignoradas', 'Só são refeitas se você usar --no-cache'],
          'A invalidação "cai em cascata" a partir da instrução alterada.'),
        fill('q4', 'Complete a flag que faz o build ignorar o cache:', 'docker build ___ -t meu-app:1.0 .',
          ['--no-cache'],
          '--no-cache refaz todas as camadas do zero.'),
        mcq('q5', 'Por que copiar o package.json antes do restante do código?', 'c',
          'Para que a instalação de dependências fique em cache e só rode de novo quando a lista de dependências mudar',
          ['Porque o Docker exige essa ordem', 'Para que o código fique fora da imagem', 'Para reduzir o tamanho do package.json'],
          'Editar o código passa a invalidar só a camada final.'),
        mcq('q6', 'O que está ruim neste Dockerfile em relação ao cache?\nFROM node:22-slim\nWORKDIR /app\nCOPY . .\nRUN npm ci', 'a',
          'Qualquer edição de código invalida o COPY . . e força npm ci a rodar de novo',
          ['O npm ci não pode vir depois de um COPY', 'O WORKDIR deveria ser o último comando', 'Nada: essa é a melhor ordem possível'],
          'Copie primeiro o manifesto (package*.json), rode npm ci, e só depois copie o código.'),
        mcq('q7', 'Você copiou um arquivo .env com uma senha para a imagem e depois o apagou com RUN rm. A senha está segura?', 'b',
          'Não: ela continua nas camadas anteriores e pode ser extraída da imagem',
          ['Sim: o rm remove o arquivo de todas as camadas', 'Sim, desde que a imagem seja pequena', 'Sim, mas só se a tag não for latest'],
          'Camadas só acumulam. Segredos nunca devem entrar na imagem.'),
        fill('q8', 'Complete o arquivo copiado antes do código para aproveitar o cache de dependências do Node:', 'COPY ___ ./\nRUN npm ci\nCOPY . .',
          ['package*.json', 'package.json', 'package.json package-lock.json', './package.json', 'package-lock.json package.json'],
          'O package.json (e o lock) mudam pouco; o código muda muito.')
      ]
    },
    {
      id: 'ctr-11-cmd-entrypoint-env-arg',
      title: 'CMD, ENTRYPOINT, ENV e ARG',
      goal: 'Diferenciar CMD e ENTRYPOINT, formas shell e exec, ENV e ARG, e conhecer USER e LABEL.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Forma shell vs forma exec',
            body: 'CMD, ENTRYPOINT e RUN aceitam duas formas. Forma shell: texto simples (CMD python app.py), executado por um shell (/bin/sh -c), que fica como processo principal. Forma exec: uma lista JSON com aspas duplas (CMD ["python", "app.py"]), que executa o programa diretamente, sem shell. Prefira a forma exec para CMD/ENTRYPOINT: o programa vira o processo principal e recebe corretamente os sinais de parada (como o do docker stop), encerrando com calma.',
            code: '# forma shell\nCMD python app.py\n\n# forma exec (recomendada)\nCMD ["python", "app.py"]'
          },
          {
            title: 'CMD: o comando padrão, substituível',
            body: 'CMD define o comando (ou argumentos) padrão do container. Quem roda a imagem pode substituí-lo escrevendo outro comando depois do nome da imagem no docker run. Se houver mais de um CMD no Dockerfile, vale só o último.',
            code: 'CMD ["python", "app.py"]\n\n# substituindo na execução:\ndocker run --rm meu-app python --version'
          },
          {
            title: 'ENTRYPOINT: o executável fixo',
            body: 'ENTRYPOINT define o programa que SEMPRE roda; o que você escrever depois do nome da imagem no docker run é ACRESCENTADO a ele como argumentos, em vez de substituí-lo. Para trocar o ENTRYPOINT de verdade, é preciso a flag --entrypoint. Use quando a imagem deve se comportar como um programa único.'
          },
          {
            title: 'ENTRYPOINT + CMD juntos',
            body: 'Combinados (na forma exec), o CMD vira os argumentos PADRÃO do ENTRYPOINT. O comando final é ENTRYPOINT + CMD; se você passar argumentos no docker run, eles substituem só o CMD.',
            code: 'ENTRYPOINT ["python", "app.py"]\nCMD ["--porta", "8000"]\n\n# docker run meu-app                  -> python app.py --porta 8000\n# docker run meu-app --porta 9000     -> python app.py --porta 9000'
          },
          {
            title: 'ENV e ARG',
            body: 'ENV define uma variável de ambiente que existe na imagem e também quando o container roda (pode ser sobrescrita com -e). ARG define uma variável só para o momento do BUILD, valor passado com --build-arg; ela não existe no container em execução. Nenhuma das duas é lugar para segredos: ambas ficam registradas nos metadados e no histórico da imagem (docker history, docker inspect).',
            code: 'ARG VERSAO_APP=1.0\nENV APP_MODE=producao\n\ndocker build --build-arg VERSAO_APP=2.0 -t meu-app .'
          },
          {
            title: 'USER e LABEL (introdução)',
            body: 'Por padrão, o processo do container roda como root dentro dele, o que é arriscado se o programa for comprometido. A instrução USER muda o usuário (por exemplo, USER app) para as instruções seguintes e para o processo principal; muitas imagens já trazem um usuário pronto para isso. LABEL apenas anexa metadados (chave=valor) à imagem, como autor, versão ou descrição — não muda o comportamento.',
            code: 'FROM python:3.12-slim\nLABEL versao="1.0" descricao="App de exemplo"\nRUN useradd --create-home app\nUSER app\nCMD ["python", "app.py"]'
          }
        ]
      },
      questions: [
        mcq('q1', 'Qual a vantagem da forma exec (CMD ["python", "app.py"]) sobre a forma shell?', 'd',
          'O programa roda diretamente como processo principal e recebe corretamente os sinais de parada',
          ['É a única que aceita argumentos', 'Executa mais rápido por usar mais CPU', 'Evita que o container use rede'],
          'Sem shell no meio, o sinal do docker stop chega ao programa.'),
        mcq('q2', 'Qual afirmação sobre CMD está correta?', 'b',
          'É o comando padrão e pode ser substituído escrevendo outro comando depois da imagem no docker run',
          ['Não pode ser substituído de forma alguma', 'Roda durante o build, como o RUN', 'Só aceita a forma shell'],
          'CMD é padrão; o que vem depois da imagem no docker run o substitui.'),
        mcq('q3', 'Com este Dockerfile, o que executa docker run meu-app --porta 9000?\nENTRYPOINT ["python", "app.py"]\nCMD ["--porta", "8000"]', 'c',
          'python app.py --porta 9000',
          ['python app.py --porta 8000', 'python app.py --porta 8000 --porta 9000', '--porta 9000, sem o python'],
          'Os argumentos do run substituem o CMD, mas o ENTRYPOINT permanece.'),
        fill('q4', 'Complete a instrução que fornece os argumentos padrão do ENTRYPOINT:', 'ENTRYPOINT ["python"]\n___ ["app.py"]',
          ['CMD'],
          'Com ENTRYPOINT na forma exec, o CMD funciona como os argumentos padrão.'),
        mcq('q5', 'Qual a diferença entre ENV e ARG?', 'a',
          'ENV existe no container em execução; ARG só existe durante o build',
          ['ARG existe no container; ENV só no build', 'Não há diferença', 'ENV só funciona no Windows'],
          'ARG é para o build (--build-arg); ENV também vale em runtime.'),
        mcq('q6', 'O que faz este trecho?\nLABEL versao="1.0"\nUSER app\nCMD ["python", "app.py"]', 'c',
          'LABEL só registra metadado; USER faz o processo principal rodar como o usuário app em vez de root',
          ['LABEL define uma variável de ambiente e USER cria o usuário app', 'USER publica a porta do app e LABEL a protege', 'Todas as linhas rodam como root'],
          'USER troca o usuário (o usuário precisa existir na imagem); LABEL é só informação.'),
        mcq('q7', 'Por que não usar ENV ou ARG para guardar uma senha de produção no Dockerfile?', 'd',
          'Porque os valores ficam registrados na imagem e podem ser vistos com docker history ou docker inspect',
          ['Porque o Docker não aceita senhas', 'Porque ENV só aceita números', 'Não há problema: ARG apaga o valor depois do build'],
          'Segredos devem ser fornecidos na execução por meios apropriados, não gravados na imagem.'),
        fill('q8', 'Complete a flag que passa um valor para um ARG no build:', 'docker build ___ VERSAO_APP=2.0 -t meu-app .',
          ['--build-arg'],
          '--build-arg NOME=valor define o ARG no momento do build.')
      ]
    },
    {
      id: 'ctr-23-dockerfile-referencia',
      title: 'Dockerfile: referência das instruções',
      goal: 'Consolidar as instruções do Dockerfile (FROM, RUN, COPY/ADD, ARG, VOLUME, HEALTHCHECK etc.), as opções do build e o docker init.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'FROM e RUN em mais detalhe',
            body: 'As instruções que já conhecemos (WORKDIR, COPY, CMD, ENTRYPOINT, ENV, EXPOSE, USER, LABEL) continuam como vistas; aqui aprofundamos o que falta. FROM imagem AS nome dá um nome ao estágio, para referenciá-lo depois; FROM scratch parte de uma imagem totalmente vazia, usada para empacotar um programa autossuficiente. RUN tem duas formas: a forma shell (RUN apt-get update && apt-get install -y curl) roda dentro de /bin/sh -c, por isso aceita &&, pipes e variáveis; a forma exec (RUN ["apt-get", "update"]) executa o programa direto, sem shell e sem expansão de variáveis.',
            code: 'FROM python:3.12-slim AS base\nRUN apt-get update && apt-get install -y curl\nRUN ["echo", "forma exec"]\n\nFROM scratch\n# imagem vazia'
          },
          {
            title: 'COPY vs ADD e --chown',
            body: 'COPY copia arquivos do contexto de build para a imagem; com --chown=usuário:grupo já define o dono dos arquivos copiados (o usuário precisa existir). ADD faz o mesmo e mais duas coisas: aceita uma URL como origem e extrai automaticamente arquivos tar locais. Essa mágica surpreende e torna o resultado menos previsível, por isso a recomendação é usar COPY e, se precisar baixar algo, usar RUN com curl (conferindo a integridade do que baixou). Use ADD só quando você realmente quer a extração automática.',
            code: 'COPY --chown=app:app app.py /app/\n# ADD extrai o tar local automaticamente:\nADD pacote.tar.gz /opt/\n# preferível:\nCOPY app.py /app/'
          },
          {
            title: 'ARG e escopo, ONBUILD e STOPSIGNAL',
            body: 'ARG NOME=padrão declara um argumento com valor padrão, que --build-arg pode sobrescrever. O escopo importa: um ARG declarado ANTES do FROM só vale nas linhas FROM; para usá-lo dentro do estágio, é preciso declará-lo de novo (ARG NOME) depois do FROM. Dentro do estágio, o ARG vale a partir da declaração. ONBUILD registra uma instrução que só roda quando OUTRA imagem usar esta como base (FROM); é pouco usada hoje e pode surpreender quem herda. STOPSIGNAL define qual sinal o docker stop envia ao processo principal (o padrão é SIGTERM).',
            code: 'ARG VERSAO=3.12\nFROM python:${VERSAO}-slim\nARG VERSAO          # redeclarado: agora vale no estágio\nRUN echo "Python ${VERSAO}"\nSTOPSIGNAL SIGINT\nONBUILD COPY . /app'
          },
          {
            title: 'VOLUME e seus efeitos colaterais',
            body: 'VOLUME /dados declara que aquela pasta é um ponto de montagem de volume: se ninguém monta nada nela, o Docker cria um volume anônimo ao rodar o container. Efeito colateral importante: alterações feitas nessa pasta por instruções do Dockerfile DEPOIS do VOLUME são descartadas. Além disso, os volumes anônimos se acumulam sem nome e passam despercebidos. Por isso a recomendação é não usar VOLUME no Dockerfile e declarar volumes na hora de rodar (-v) ou no Compose.',
            code: 'VOLUME /dados\nRUN echo teste > /dados/a.txt   # descartado: não fica na imagem'
          },
          {
            title: 'HEALTHCHECK e SHELL (apresentação)',
            body: 'HEALTHCHECK ensina o Docker a testar se o programa está saudável: ele roda um comando periodicamente (com opções como --interval, --timeout e --retries); código de saída 0 significa saudável e 1, não saudável. O estado (starting, healthy, unhealthy) aparece no docker ps. Ele só funciona se o comando existir na imagem (curl, por exemplo). O intermediário aprofunda. SHELL ["/bin/bash", "-c"] troca o shell usado pela forma shell das instruções seguintes (padrão: /bin/sh -c).',
            code: 'HEALTHCHECK --interval=30s --timeout=3s --retries=3 \\\n  CMD curl -f http://localhost:8000/ || exit 1\nSHELL ["/bin/bash", "-c"]'
          },
          {
            title: 'Comentários, # syntax= e docker build em detalhe',
            body: 'Linhas começando com # são comentários. Na primeira linha, uma diretiva de parser como # syntax=docker/dockerfile:1 indica ao BuildKit qual versão da sintaxe do Dockerfile usar. O argumento final do docker build é o contexto (a pasta cujo conteúdo o build pode usar; também pode ser a URL de um repositório Git, que só se deve usar se você confia nele). -f aponta para um Dockerfile com outro nome ou lugar, e -t pode ser repetido para aplicar várias tags à mesma imagem.',
            code: '# syntax=docker/dockerfile:1\nFROM alpine\n\n# build:\ndocker build -f ci.Dockerfile -t meu-app:1.0 -t meu-app:latest .'
          },
          {
            title: 'docker init: ponto de partida, não receita final',
            body: 'docker init, na pasta do projeto, faz perguntas (linguagem, versão, porta, comando de início) e gera arquivos de partida: Dockerfile, compose.yaml e .dockerignore, entre outros. Economiza tempo, mas é um MODELO: leia tudo antes de usar; confira a imagem base, o usuário (não-root), as portas publicadas e o que é copiado, e ajuste ao seu projeto. Nunca execute o resultado às cegas, nem coloque segredos nos arquivos gerados.',
            code: 'docker init\n# revise Dockerfile, compose.yaml e .dockerignore antes de usar\ndocker compose up -d --build'
          }
        ]
      },
      questions: [
        mcq('q1', 'O que significa FROM scratch em um Dockerfile?', 'c',
          'Partir de uma imagem totalmente vazia, útil para empacotar um programa que não precisa de mais nada',
          ['Copiar o conteúdo do diretório atual para a imagem', 'Usar a imagem mais recente do Docker Hub', 'Apagar a imagem anterior'],
          'scratch é uma imagem base vazia.'),
        mcq('q2', 'Por que se recomenda COPY em vez de ADD na maioria dos casos?', 'a',
          'Porque o ADD tem comportamentos extras (URL e extração automática de tar) que surpreendem; o COPY faz só a cópia',
          ['Porque o ADD não copia arquivos', 'Porque o COPY aceita URLs e o ADD não', 'Porque o ADD apaga o contexto de build'],
          'Explícito é melhor: use ADD apenas quando quiser extrair um tar local automaticamente.'),
        mcq('q3', 'O que acontece com a variável neste Dockerfile?\nARG VERSAO=3.12\nFROM python:${VERSAO}-slim\nRUN echo "[$VERSAO]"', 'b',
          'O FROM usa 3.12, mas dentro do estágio a variável não existe e o RUN imprime []; é preciso redeclarar ARG VERSAO depois do FROM',
          ['Os dois enxergam 3.12', 'O FROM falha, pois não aceita variáveis', 'O RUN imprime [3.12] porque ARG vale em todo o arquivo'],
          'Um ARG antes do FROM só vale nas linhas FROM.'),
        fill('q4', 'Complete a instrução que define o sinal enviado pelo docker stop:', '___ SIGINT',
          ['STOPSIGNAL'],
          'STOPSIGNAL troca o sinal de parada (o padrão é SIGTERM).'),
        mcq('q5', 'O que acontece com este trecho?\nVOLUME /dados\nRUN echo teste > /dados/a.txt', 'd',
          'O arquivo escrito pelo RUN depois do VOLUME é descartado e não fica na imagem final',
          ['O arquivo fica na imagem e também no volume', 'O VOLUME copia o arquivo para o computador', 'O build falha com erro de sintaxe'],
          'Alterações na pasta depois da declaração do VOLUME são descartadas.'),
        mcq('q6', 'Como o Docker interpreta o resultado de um HEALTHCHECK?', 'c',
          'O comando sair com 0 indica saudável e com 1 indica não saudável; o estado aparece no docker ps',
          ['0 indica não saudável e 1 saudável', 'Só importa se o comando imprimir texto', 'O HEALTHCHECK publica a porta do container'],
          'O código de saída decide o estado do container.'),
        mcq('q7', 'O que faz este comando?\ndocker build -f ci.Dockerfile -t meu-app:1.0 -t meu-app:latest .', 'a',
          'Constrói a imagem a partir do arquivo ci.Dockerfile, usando a pasta atual como contexto, e aplica as duas tags',
          ['Executa um container chamado ci', 'Constrói duas imagens diferentes', 'Usa ci.Dockerfile como contexto de build'],
          '-f escolhe o Dockerfile; -t pode ser repetido; o último argumento é o contexto.'),
        fill('q8', 'Complete o comando que gera arquivos de partida (Dockerfile, compose.yaml) na pasta do projeto:', 'docker ___',
          ['init'],
          'docker init gera um modelo; revise tudo antes de usar.')
      ]
    },
    {
      id: 'ctr-12-volumes-persistencia',
      title: 'Volumes e persistência',
      goal: 'Persistir dados fora do container com volumes nomeados, bind mounts e tmpfs, com cuidado com dados pessoais.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Containers são efêmeros',
            body: 'Tudo que um container grava vai para a sua camada gravável, uma camada fina por cima das camadas somente leitura da imagem. Ao remover o container (docker rm), essa camada é apagada junto com os dados. Por isso, qualquer dado que precisa durar (um banco de dados, uploads) NÃO deve ficar só na camada do container: precisa de um volume ou de uma montagem.'
          },
          {
            title: 'Volume nomeado',
            body: 'Um volume é uma área de armazenamento gerenciada pelo Docker, que vive fora do ciclo de vida do container. Você dá um nome e o liga a uma pasta do container com -v nome:caminho_no_container. Se o volume não existir, o Docker o cria. Depois que o container é removido, o volume continua, e um container novo pode usá-lo e ver os mesmos dados.',
            code: 'docker run --rm -v meus-dados:/dados alpine sh -c \'echo teste > /dados/a.txt\'\ndocker run --rm -v meus-dados:/dados alpine cat /dados/a.txt'
          },
          {
            title: 'Bind mount: uma pasta do seu computador',
            body: 'Um bind mount liga uma pasta ou arquivo ESPECÍFICO do host a um caminho do container. Útil em desenvolvimento: você edita o código no computador e o container enxerga na hora. O caminho do host deve ser absoluto. Em PowerShell use ${PWD} para a pasta atual; no bash, $(pwd). O container passa a ter acesso real àquela pasta do host, então monte apenas o necessário e, se só precisa ler, acrescente :ro (somente leitura).',
            code: '# PowerShell\ndocker run --rm -v ${PWD}:/app:ro alpine ls /app\n\n# bash\ndocker run --rm -v "$(pwd)":/app:ro alpine ls /app'
          },
          {
            title: '-v vs --mount',
            body: 'Há duas sintaxes. -v é curta (origem:destino:opções). --mount é mais longa e explícita, com chave=valor separados por vírgula, e mais clara de ler. Diferença prática: num bind mount, se a pasta do host não existe, -v a cria silenciosamente (como root), enquanto --mount dá erro — o que evita surpresas. O tipo vem em type=volume ou type=bind.',
            code: '-v meus-dados:/dados\n--mount type=volume,source=meus-dados,target=/dados\n\n# PowerShell, bind com --mount\n--mount type=bind,source="${PWD}",target=/app'
          },
          {
            title: 'tmpfs: só na memória',
            body: 'Um tmpfs é uma montagem guardada apenas na memória RAM do host: some quando o container para. Serve para dados temporários ou sensíveis que não devem ir para o disco, e costuma ser mais rápido. Não confunda com volume: tmpfs NÃO persiste.',
            code: 'docker run --rm --tmpfs /tmp alpine df /tmp'
          },
          {
            title: 'Gerenciando volumes',
            body: 'docker volume ls lista os volumes; docker volume create nome cria um; docker volume inspect nome mostra detalhes (como o driver e onde fica); docker volume rm nome remove, apagando DEFINITIVAMENTE os dados (e só funciona se nenhum container o estiver usando). Os dados de um volume não aparecem como "arquivos comuns" do Windows: o Docker os mantém na sua própria área.',
            code: 'docker volume create meus-dados\ndocker volume ls\ndocker volume inspect meus-dados\ndocker volume rm meus-dados'
          },
          {
            title: 'Dados pessoais em volumes: LGPD',
            body: 'Volumes guardam dados reais, e dados pessoais (de clientes, usuários, funcionários) são protegidos pela LGPD. Cuidados: guarde só o necessário e pelo tempo necessário; controle quem acessa o host e o volume; faça backups protegidos (e criptografados); apague volumes quando os dados não forem mais necessários; e em desenvolvimento e testes use dados fictícios, nunca cópias de dados reais. Lembre que apagar o container NÃO apaga o volume — os dados continuam no disco.'
          }
        ]
      },
      questions: [
        mcq('q1', 'O que acontece com os dados gravados na camada gravável de um container quando ele é removido com docker rm?', 'a',
          'São apagados junto com o container',
          ['Ficam salvos para sempre na imagem', 'Vão automaticamente para um volume', 'São enviados ao Docker Hub'],
          'Os containers são efêmeros; para persistir, use volumes ou bind mounts.'),
        mcq('q2', 'Qual afirmação sobre -v e --mount está correta?', 'c',
          '--mount é mais explícito (chave=valor) e, em bind mounts, dá erro se a pasta do host não existir, enquanto -v a cria',
          ['-v e --mount não podem montar volumes', '--mount só funciona no Windows', 'Os dois sempre criam a pasta do host sem aviso'],
          '--mount evita criar pastas por engano.'),
        mcq('q3', 'Qual opção guarda os dados apenas na memória e os perde quando o container para?', 'b',
          'tmpfs',
          ['Volume nomeado', 'Bind mount', 'docker cp'],
          'tmpfs usa RAM e não persiste.'),
        fill('q4', 'Complete o comando que cria um volume:', 'docker volume ___ meus-dados',
          ['create'],
          'docker volume create nome cria um volume nomeado.'),
        mcq('q5', 'Dois comandos são executados em sequência:\ndocker run --rm -v meus-dados:/dados alpine sh -c \'echo teste > /dados/a.txt\'\ndocker run --rm -v meus-dados:/dados alpine cat /dados/a.txt\nO que o segundo imprime?', 'd',
          'teste, porque os dados estão no volume, que sobrevive ao container',
          ['Nada, porque o primeiro container foi removido com --rm e levou os dados', 'Um erro: volumes não podem ser reutilizados', 'a.txt'],
          'O --rm removeu o container, mas o volume nomeado permanece.'),
        mcq('q6', 'O que faz docker volume rm meus-dados?', 'b',
          'Remove o volume e apaga definitivamente os dados dele (desde que nenhum container o use)',
          ['Apenas esconde o volume, mantendo os dados', 'Remove os containers que usavam o volume', 'Faz um backup antes de remover'],
          'A remoção é irreversível: confira antes com docker volume ls e inspect.'),
        mcq('q7', 'Um volume guarda dados pessoais de usuários. Qual conduta está alinhada com a LGPD?', 'a',
          'Guardar só o necessário, controlar o acesso, proteger os backups e apagar os dados quando não forem mais necessários',
          ['Copiar os dados reais para o ambiente de testes para ficar mais realista', 'Deixar o volume acessível a qualquer um, já que o container está isolado', 'Manter os dados para sempre, por precaução'],
          'Minimização, controle de acesso, segurança e descarte são princípios básicos; testes usam dados fictícios.'),
        fill('q8', 'Complete o tipo de montagem que liga uma pasta específica do computador ao container:', '--mount type=___,source=${PWD},target=/app',
          ['bind'],
          'type=bind monta um caminho do host; type=volume usa um volume gerenciado pelo Docker.')
      ]
    },
    {
      id: 'ctr-13-redes-basicas',
      title: 'Redes básicas',
      goal: 'Fazer containers conversarem entre si por nome usando redes definidas pelo usuário.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'A rede bridge padrão',
            body: 'Ao iniciar um container sem pedir nada de rede, ele entra na rede bridge padrão: uma rede virtual privada criada pelo Docker. Cada container ganha um endereço IP interno e pode acessar a internet, e containers da mesma bridge conseguem se alcançar pelo IP. Mas há uma limitação importante: na bridge padrão eles NÃO se encontram pelo nome.'
          },
          {
            title: 'Rede definida pelo usuário e DNS por nome',
            body: 'Você pode criar uma rede própria. Nela, o Docker oferece um DNS interno: cada container pode ser encontrado pelo seu nome (ou pelo nome do serviço, no Compose). Como IPs mudam a cada recriação, usar nomes é o jeito certo de ligar uma aplicação ao seu banco ou ao seu cache. Para conectar um container a uma rede, use --network.',
            code: 'docker network create minha-rede\ndocker run -d --name web --network minha-rede nginx:stable'
          },
          {
            title: 'Um container acessando outro',
            body: 'Com a rede criada, qualquer container nela alcança o web pelo nome, usando a porta INTERNA do serviço (no nginx, a 80) — não a porta publicada no host.',
            code: 'docker run --rm --network minha-rede alpine wget -qO- http://web'
          },
          {
            title: 'A armadilha do localhost',
            body: 'Dentro de um container, localhost (127.0.0.1) é o PRÓPRIO container, não o seu computador nem outro container. Um erro muito comum é configurar uma aplicação em container para falar com o banco em localhost:5432. Se o banco está em outro container, o endereço correto é o nome dele na rede (por exemplo, db:5432).'
          },
          {
            title: 'Não é preciso publicar portas entre containers',
            body: 'A flag -p serve para abrir uma porta ao HOST (seu navegador, seu computador). Containers na mesma rede conversam diretamente, sem -p. Isso é bom para a segurança: um banco só precisa estar acessível para a aplicação, então não o publique no host sem necessidade, e, quando precisar, limite a 127.0.0.1. Dá até para separar containers em redes diferentes, para que não se enxerguem.'
          },
          {
            title: 'Comandos de rede e drivers',
            body: 'docker network ls lista as redes; docker network inspect nome mostra detalhes (inclusive quais containers estão nela e seus IPs); docker network rm nome remove uma rede sem uso. Em visão geral, há ainda outros drivers: host faz o container usar diretamente a rede do computador, sem isolamento de rede (e sem precisar de -p; o comportamento varia no Docker Desktop); none dá ao container nenhuma rede, ideal para tarefas totalmente isoladas.',
            code: 'docker network ls\ndocker network inspect minha-rede\ndocker network rm minha-rede'
          }
        ]
      },
      questions: [
        mcq('q1', 'Na rede bridge padrão, como os containers se comunicam?', 'c',
          'Pelo endereço IP interno; o DNS por nome de container não está disponível ali',
          ['Pelo nome do container, sempre', 'Não conseguem se comunicar de forma alguma', 'Somente através de portas publicadas com -p'],
          'Para resolução de nomes, use uma rede definida pelo usuário.'),
        mcq('q2', 'Qual a vantagem de criar uma rede com docker network create?', 'd',
          'Os containers conectados a ela podem se encontrar pelo nome, graças ao DNS interno do Docker',
          ['Eles ganham acesso mais rápido à internet', 'Eles passam a ter o mesmo IP', 'Elas dispensam o uso de imagens'],
          'IPs mudam, nomes não: ótimo para ligar app e banco.'),
        mcq('q3', 'Uma aplicação em container precisa acessar um banco rodando em OUTRO container. Qual endereço de host ela deve usar?', 'b',
          'O nome do container (ou serviço) do banco na rede compartilhada, como db',
          ['localhost, pois é tudo o mesmo computador', '127.0.0.1', 'O endereço do site docker.com'],
          'localhost dentro de um container aponta para ele mesmo.'),
        fill('q4', 'Complete o comando que cria uma rede:', 'docker network ___ minha-rede',
          ['create'],
          'docker network create nome cria uma rede bridge definida pelo usuário.'),
        mcq('q5', 'Dois containers estão na mesma rede definida pelo usuário. Preciso de -p para que um acesse o outro?', 'a',
          'Não: -p só é necessário para acessar a partir do host; entre containers da mesma rede usa-se a porta interna',
          ['Sim, sempre, nas duas pontas', 'Sim, mas só no container que recebe', 'Só se estiverem em computadores diferentes'],
          'Manter portas sem publicar reduz a superfície de ataque.'),
        mcq('q6', 'O que faz este comando?\ndocker run --rm --network minha-rede alpine ping -c 1 web', 'c',
          'Cria um container alpine temporário na minha-rede que envia um ping ao container chamado web e depois é removido',
          ['Publica a porta web no host', 'Remove a rede minha-rede', 'Cria uma rede chamada web'],
          'A resolução do nome web só funciona porque a rede é definida pelo usuário.'),
        mcq('q7', 'O que faz o driver de rede none?', 'b',
          'Deixa o container sem rede alguma',
          ['Compartilha a rede do computador com o container', 'Cria uma rede mais rápida que a bridge', 'Remove todas as redes do Docker'],
          'none = sem rede; host = rede do computador (sem isolamento de rede).'),
        fill('q8', 'Complete a flag que conecta o container a uma rede:', 'docker run -d --name web ___ minha-rede nginx:stable',
          ['--network', '--net'],
          '--network (ou --net) escolhe a rede do container.')
      ]
    },
    {
      id: 'ctr-20-yaml-essencial',
      title: 'YAML essencial para o Compose',
      goal: 'Ler e escrever YAML sem tropeçar: indentação, mapas, listas, aspas, blocos de texto, âncoras e validação.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'O que é YAML e por que a indentação manda',
            body: 'YAML é um formato de texto para descrever dados de forma legível, muito usado em arquivos de configuração, como o compose.yaml. A estrutura é definida pela INDENTAÇÃO: itens mais recuados pertencem ao item acima. Duas regras de ouro: use apenas ESPAÇOS (tabs são proibidos na indentação) e mantenha a quantidade de espaços consistente no mesmo nível (dois espaços por nível é o costume). Um espaço a mais ou a menos muda o significado ou gera erro.',
            code: 'services:\n  web:\n    image: nginx:stable'
          },
          {
            title: 'Mapas e listas',
            body: 'Um mapa é um conjunto de pares chave: valor (note o espaço depois dos dois pontos). Uma lista é uma sequência de itens, cada um iniciado por hífen e espaço (- item). Mapas e listas se aninham livremente. No Compose, services é um mapa de serviços, e ports é uma lista de portas.',
            code: 'web:                 # mapa com duas chaves\n  image: nginx:stable\n  ports:             # a chave ports tem uma lista\n    - "8080:80"\n    - "8443:443"'
          },
          {
            title: 'Valores simples (escalares) e aspas',
            body: 'Os valores simples são strings, números (3, 1.5), booleanos (true, false) e nulo (null ou vazio). Texto normalmente dispensa aspas, mas elas ajudam a evitar armadilhas. Mapeamentos de porta como 8080:80 devem ficar entre aspas: o YAML pode interpretar números separados por dois pontos como outro tipo de número (a notação sexagesimal, de base 60, em versões antigas do YAML), e a documentação do Compose recomenda aspas. Valores como yes, no, on e off são lidos como booleanos em algumas versões e leitores de YAML: se você quer o TEXTO, escreva entre aspas. Aspas também protegem texto com ": " (dois-pontos e espaço, que parece um novo par) ou " #" (espaço e cerquilha, que começa um comentário).',
            code: 'ports:\n  - "8080:80"            # entre aspas\nmodo: "yes"              # texto, não booleano\ntitulo: "Olá: mundo # sem comentário"\nreplicas: 3              # número\nativo: true              # booleano'
          },
          {
            title: 'Comentários e textos de várias linhas',
            body: 'Tudo depois de um # (precedido de espaço, ou no início da linha) é comentário e é ignorado. Para textos longos há dois blocos: | (literal) preserva as quebras de linha exatamente como escritas, ideal para scripts; > (dobrado) junta as linhas em uma só, trocando as quebras por espaços, ideal para frases longas. As linhas do bloco ficam recuadas sob a chave.',
            code: '# isto é um comentário\nscript: |\n  echo linha 1\n  echo linha 2\nfrase: >\n  um texto longo\n  em duas linhas\n# script vale "echo linha 1\\necho linha 2\\n"\n# frase vale "um texto longo em duas linhas\\n"'
          },
          {
            title: 'Listas de mapas e formas equivalentes',
            body: 'Um item de lista pode ser um mapa inteiro: o hífen marca o início do item e as chaves seguintes ficam alinhadas com a primeira. É assim que o Compose descreve montagens detalhadas. Além disso, algumas chaves do Compose aceitam duas formas equivalentes: environment pode ser um mapa (CHAVE: valor) ou uma lista de CHAVE=valor. Escolha uma e mantenha o padrão no arquivo.',
            code: '# mapa\nenvironment:\n  APP_MODE: teste\n\n# lista (equivalente)\nenvironment:\n  - APP_MODE=teste\n\n# lista de mapas\nvolumes:\n  - type: bind\n    source: ./site\n    target: /usr/share/nginx/html'
          },
          {
            title: 'Âncoras e aliases (visão geral)',
            body: 'Para não repetir blocos, o YAML permite dar um nome a um trecho com & (âncora) e reaproveitá-lo com * (alias). A chave especial <<: * mescla o conteúdo da âncora no mapa atual, e o que você escrever ao lado a sobrescreve. No Compose é comum guardar o bloco comum em uma chave de topo que começa com x- (extensão, ignorada pelo Compose) e referenciá-lo nos serviços.',
            code: 'x-comum: &comum\n  restart: unless-stopped\n  environment:\n    APP_MODE: teste\n\nservices:\n  a:\n    <<: *comum\n    image: nginx:stable\n  b:\n    <<: *comum\n    image: redis:7'
          },
          {
            title: 'Erros típicos e como validar',
            body: 'Erros comuns: usar tab; esquecer o espaço depois de dois-pontos (chave:valor); desalinhar um item (ports recuado diferente de image, por exemplo); misturar espaços e números diferentes no mesmo nível; esquecer aspas em valores ambíguos. Para validar sem subir nada, rode docker compose config: ele lê o arquivo, aponta erros e mostra o resultado final já interpretado (com âncoras expandidas). Cuidado: a saída pode mostrar valores de variáveis, até senhas, então não cole esse resultado em chats ou tickets sem conferir. Curiosidade útil: JSON válido costuma ser YAML válido, então chaves, colchetes e aspas funcionam, mas o estilo por indentação é o padrão.',
            code: 'docker compose config           # valida e mostra o arquivo final\ndocker compose config --quiet   # só valida (sem imprimir)'
          }
        ]
      },
      questions: [
        mcq('q1', 'Qual regra de indentação do YAML está correta?', 'd',
          'Usar espaços (nunca tabs) e manter a mesma quantidade em cada nível',
          ['Usar tabs, pois são mais rápidos de digitar', 'Misturar tabs e espaços, desde que pareça alinhado', 'A indentação não importa, só os dois-pontos'],
          'Tabs são proibidos na indentação; a consistência de espaços define a hierarquia.'),
        mcq('q2', 'Qual forma é equivalente a este trecho?\nenvironment:\n  APP_MODE: teste', 'a',
          'environment:\n  - APP_MODE=teste',
          ['environment:\n  - APP_MODE: teste:', 'environment: APP_MODE - teste', 'environment:\n  - teste=APP_MODE'],
          'O environment aceita mapa (CHAVE: valor) ou lista de CHAVE=valor.'),
        mcq('q3', 'Por que escrever ports: - "8080:80" com aspas?', 'c',
          'Porque, sem aspas, o YAML pode interpretar valores como 8080:80 como outro tipo de número (sexagesimal, em versões antigas) em vez de texto',
          ['Porque sem aspas o Docker não publica portas', 'Porque aspas deixam a porta mais rápida', 'Porque o YAML só aceita números dentro de aspas'],
          'Aspas garantem que o valor seja uma string; é a recomendação da documentação do Compose.'),
        fill('q4', 'Complete o caractere que inicia um comentário em YAML:', '___ isto é ignorado pelo Compose\nservices:\n  web:\n    image: nginx:stable',
          ['#'],
          'Tudo depois de # (no início da linha ou após um espaço) é comentário.'),
        mcq('q5', 'Qual a diferença entre | e > em blocos de texto?\nscript: |\n  a\n  b\nfrase: >\n  a\n  b', 'b',
          '| preserva as quebras de linha (a e b em linhas separadas); > as dobra em espaços (a b)',
          ['| junta as linhas e > as preserva', 'Os dois produzem exatamente o mesmo resultado', '| apaga o texto e > o mantém'],
          'Literal (|) para scripts; dobrado (>) para frases longas.'),
        mcq('q6', 'O que faz <<: *comum no serviço a?\nx-comum: &comum\n  restart: unless-stopped\nservices:\n  a:\n    <<: *comum\n    image: nginx:stable', 'd',
          'Mescla no serviço a o conteúdo da âncora comum, aplicando restart: unless-stopped a ele',
          ['Cria um novo serviço chamado comum', 'Apaga o serviço a', 'Comenta o restante do arquivo'],
          '&nome cria a âncora; *nome a reutiliza; <<: mescla no mapa atual.'),
        mcq('q7', 'O que há de errado neste YAML?\nservices:\n  web:\n    image: nginx\n   ports:\n      - "80:80"', 'a',
          'A chave ports está recuada diferente de image (com 3 espaços), quebrando a estrutura e causando erro',
          ['Nada: o YAML aceita qualquer recuo', 'As aspas em "80:80" são proibidas', 'Falta a chave version: no topo'],
          'Chaves do mesmo nível devem ter a mesma indentação.'),
        fill('q8', 'Complete o comando que valida o compose.yaml e mostra o arquivo final já interpretado:', 'docker compose ___',
          ['config'],
          'docker compose config valida e imprime o resultado; cuidado, ele pode mostrar valores sensíveis.')
      ]
    },
    {
      id: 'ctr-14-docker-compose-basico',
      title: 'Docker Compose básico',
      goal: 'Descrever e subir vários serviços com um arquivo compose.yaml e os comandos docker compose.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Por que Compose',
            body: 'Aplicações reais têm vários containers (site, API, banco, cache), cada um com portas, volumes, variáveis e redes. Digitar tudo em vários docker run é cansativo e fácil de errar. O Docker Compose permite descrever tudo em um único arquivo YAML e subir ou derrubar o conjunto com um comando. O arquivo também documenta como rodar o projeto.'
          },
          {
            title: 'Estrutura do arquivo',
            body: 'O arquivo se chama compose.yaml (ou docker-compose.yml). Na versão atual do Compose (v2) NÃO se escreve a chave version: no topo — ela é obsoleta. A chave principal é services: cada serviço (web, db...) é um container descrito com image: (imagem pronta) ou build: (pasta com um Dockerfile) e ports:, na mesma lógica do -p. YAML usa indentação com espaços (nunca tabs), e a indentação define a hierarquia.',
            code: 'services:\n  web:\n    image: nginx:stable\n    ports:\n      - "127.0.0.1:8080:80"'
          },
          {
            title: 'environment, volumes e build',
            body: 'environment: define variáveis de ambiente (como -e). volumes: dentro do serviço liga um volume ou pasta ao container; volumes nomeados precisam ser declarados também na chave volumes: no nível de cima. build: aponta para a pasta do Dockerfile. Para segredos, não escreva senhas reais em arquivos versionados: use env_file: apontando para um arquivo fora do Git.',
            code: 'services:\n  app:\n    build: .\n    environment:\n      - APP_MODE=teste\n      - REDIS_HOST=cache\n    depends_on:\n      - cache\n  cache:\n    image: redis:7\n    volumes:\n      - dados-cache:/data\n\nvolumes:\n  dados-cache:'
          },
          {
            title: 'Rede automática e depends_on',
            body: 'O Compose cria uma rede para o projeto e conecta todos os serviços: eles se encontram pelo NOME DO SERVIÇO (no exemplo, a app acessa o cache em REDIS_HOST=cache). depends_on controla a ORDEM de inicialização (o cache é iniciado antes da app), mas não garante que o cache já esteja pronto para receber conexões — a aplicação deve saber tentar de novo, ou usar healthchecks (recurso que só citamos aqui).'
          },
          {
            title: 'Comandos do dia a dia',
            body: 'Atenção: o comando é docker compose, com ESPAÇO (o antigo docker-compose com hífen é a versão antiga). Rode na pasta do arquivo. up -d cria e inicia tudo em segundo plano; ps lista os serviços; logs -f acompanha os logs; exec entra em um serviço em execução; down para e remove containers e redes do projeto.',
            code: 'docker compose up -d\ndocker compose ps\ndocker compose logs -f app\ndocker compose exec app sh\ndocker compose down'
          },
          {
            title: 'down e os volumes: cuidado',
            body: 'docker compose down NÃO remove os volumes nomeados: os dados sobrevivem e voltam no próximo up. Já docker compose down -v remove também os volumes declarados no arquivo, APAGANDO os dados. Use -v apenas quando tiver certeza (por exemplo, para recomeçar um banco de testes do zero). Se você alterar o código e a imagem precisar ser reconstruída, use docker compose up -d --build.',
            code: 'docker compose down        # mantém os volumes\ndocker compose down -v     # apaga os volumes (dados!)'
          }
        ]
      },
      questions: [
        mcq('q1', 'Para que serve o Docker Compose?', 'b',
          'Descrever vários containers em um arquivo YAML e subir ou derrubar todos com um comando',
          ['Para compilar programas em C', 'Para criar máquinas virtuais completas', 'Para baixar imagens mais rápido'],
          'Compose organiza aplicações com múltiplos serviços.'),
        mcq('q2', 'Qual afirmação sobre o Compose atual (v2) está correta?', 'a',
          'O comando é docker compose (com espaço) e o arquivo não usa a chave version:',
          ['O comando é docker-compose, com hífen, e o arquivo exige version:', 'O arquivo precisa começar com version: "3"', 'O comando é docker composer'],
          'No Compose v2, a chave version: é obsoleta e o comando tem espaço.'),
        mcq('q3', 'O que significa este trecho?\nservices:\n  web:\n    image: nginx:stable\n    ports:\n      - "127.0.0.1:8080:80"', 'c',
          'Sobe o serviço web com nginx:stable, acessível só pelo próprio computador em http://localhost:8080',
          ['Sobe o nginx acessível a qualquer computador da rede na porta 80', 'Constrói uma imagem a partir de um Dockerfile', 'Cria o serviço, mas sem publicar porta alguma'],
          'A mesma lógica do -p 127.0.0.1:8080:80.'),
        fill('q4', 'Complete o comando que cria e inicia os serviços em segundo plano:', 'docker compose ___ -d',
          ['up'],
          'docker compose up -d sobe tudo em segundo plano.'),
        mcq('q5', 'O que o depends_on garante?', 'd',
          'A ordem de inicialização dos serviços, mas não que o serviço dependido já esteja pronto para conexões',
          ['Que o serviço dependido está pronto e saudável', 'Que os serviços usem a mesma imagem', 'Que os dados sejam copiados entre containers'],
          'Para esperar o serviço ficar pronto, a aplicação deve tentar de novo ou usar healthcheck.'),
        mcq('q6', 'O que acontece ao rodar docker compose down -v?', 'd',
          'Remove os containers, as redes e também os volumes declarados no arquivo, apagando os dados',
          ['Apenas para os containers, preservando tudo', 'Remove só as imagens', 'Reinicia os serviços com mais detalhes de log'],
          'O -v remove os volumes; use com cuidado.'),
        mcq('q7', 'No Compose, como o serviço app encontra o serviço db?', 'a',
          'Pelo nome do serviço (db) na rede que o Compose cria para o projeto',
          ['Por localhost', 'Por um IP fixo que o Compose sempre atribui como 10.0.0.1', 'Não consegue, a menos que db publique porta no host'],
          'O DNS interno resolve o nome do serviço.'),
        fill('q8', 'Complete a chave que indica a imagem pronta de um serviço:', 'services:\n  web:\n    ___: nginx:stable',
          ['image'],
          'image: usa uma imagem pronta; build: constrói a partir de um Dockerfile.')
      ]
    },
    {
      id: 'ctr-22-compose-dia-a-dia',
      title: 'Compose no dia a dia',
      goal: 'Dominar o nome do projeto, build/up/run, start/stop, down vs down -v, restart e os pequenos detalhes de arquivos e versões do Compose.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'O nome do projeto prefixa tudo',
            body: 'Todo conjunto de serviços do Compose pertence a um projeto, e o nome do projeto é usado como prefixo dos recursos criados. Por padrão é o nome da pasta do arquivo; você pode mudá-lo com a opção -p, com a variável COMPOSE_PROJECT_NAME ou com a chave name: no topo do arquivo. Se a pasta se chama loja e o serviço web, o container será loja-web-1, a rede loja_default e um volume dados será loja_dados. Isso evita colisões entre projetos e explica de onde vêm os nomes que aparecem no docker ps.',
            code: 'docker compose -p loja-teste up -d\n# containers: loja-teste-web-1 ...\n# rede: loja-teste_default'
          },
          {
            title: 'build, pull e up com opções',
            body: 'docker compose build constrói as imagens dos serviços que têm build:. docker compose pull baixa as imagens dos que usam image:. docker compose up -d já cria e inicia, e recria containers cujas configurações ou imagens mudaram. Opções úteis: --build reconstrói as imagens antes de subir; --force-recreate recria os containers mesmo sem mudanças; --no-deps (com um serviço indicado) sobe apenas esse serviço, sem os serviços dos quais ele depende.',
            code: 'docker compose build\ndocker compose pull\ndocker compose up -d --build\ndocker compose up -d --force-recreate\ndocker compose up -d --no-deps web'
          },
          {
            title: 'start, stop, restart e down: não são a mesma coisa',
            body: 'stop para os containers, mas os mantém; start inicia os já existentes; restart faz as duas coisas. Esses comandos NÃO recriam nada: se você mudou o arquivo, eles não aplicam a mudança. Para aplicar mudanças use up -d. docker compose down, ao contrário, para e REMOVE containers e redes do projeto.',
            code: 'docker compose stop\ndocker compose start\ndocker compose restart web\ndocker compose up -d      # aplica mudanças do arquivo'
          },
          {
            title: 'run --rm para tarefas pontuais e exec',
            body: 'docker compose run --rm serviço comando cria um container NOVO e descartável, usando a configuração daquele serviço (imagem, variáveis, volumes e redes), para executar uma tarefa pontual, como uma migração de banco ou abrir um shell. Os serviços dos quais ele depende são iniciados. Por padrão, as portas do serviço não são publicadas no run. Já docker compose exec executa um comando em um container que JÁ está rodando. Resumo: run = container novo para uma tarefa; exec = entrar no que existe.',
            code: 'docker compose run --rm app sh\ndocker compose run --rm app echo "tarefa pontual"\ndocker compose exec db sh'
          },
          {
            title: 'Observando: logs, ps, top e config',
            body: 'docker compose logs -f --tail 50 app acompanha os últimos 50 registros do serviço app. docker compose ps lista os containers do projeto e seu estado. docker compose top mostra os processos de cada serviço. docker compose config valida o arquivo e mostra a versão final, já com variáveis substituídas e âncoras expandidas; como pode exibir valores sensíveis, não o compartilhe sem conferir.',
            code: 'docker compose logs -f --tail 50 app\ndocker compose ps\ndocker compose top\ndocker compose config'
          },
          {
            title: 'down, down -v, rm, container_name e restart',
            body: 'down remove containers e redes, mas preserva os volumes nomeados (os dados continuam); down -v remove também os volumes declarados no arquivo, APAGANDO os dados. Faça backup antes e nunca use -v em um banco de dados real por reflexo. docker compose rm remove containers parados dos serviços. A chave container_name fixa o nome do container; geralmente é melhor evitá-la: nomes fixos podem colidir com outros projetos ou containers e impedem criar várias réplicas do mesmo serviço. A chave restart define o que fazer quando o container termina: no (padrão), always, on-failure (só se terminar com erro) e unless-stopped (sempre, exceto se você o parou).',
            code: 'docker compose down        # mantém os volumes\ndocker compose down -v     # apaga volumes: dados!\n\nservices:\n  app:\n    image: nginx:stable\n    restart: unless-stopped'
          },
          {
            title: 'v1 vs v2, nomes de arquivo e o .env',
            body: 'O comando atual é docker compose (com espaço), um plugin do Docker (v2). O docker-compose com hífen é a versão antiga (v1), legada: não use em projetos novos. O Compose procura, na pasta, arquivos com os nomes compose.yaml (preferido), compose.yml, docker-compose.yaml ou docker-compose.yml; com -f você indica outro arquivo. Em visão geral: se existir um arquivo .env na pasta, o Compose o lê para substituir variáveis ${NOME} dentro do compose.yaml (e ${NOME:-padrão} usa um valor padrão se a variável não existir). Não confunda com env_file:, que injeta variáveis dentro do container. Como o .env costuma ter segredos, mantenha-o fora do Git; o intermediário aprofunda isso.',
            code: '# compose.yaml\nservices:\n  web:\n    image: nginx:stable\n    ports:\n      - "127.0.0.1:${APP_PORT:-8080}:80"\n\n# docker compose -f outro.yaml up -d'
          }
        ]
      },
      questions: [
        mcq('q1', 'A pasta do projeto se chama loja e o serviço se chama web. Qual será, por padrão, o nome do container criado pelo Compose v2?', 'a',
          'loja-web-1',
          ['web', 'loja_web.container', 'docker-web-loja'],
          'O nome do projeto (pasta) prefixa os recursos: projeto-serviço-número.'),
        mcq('q2', 'O que faz docker compose up -d --no-deps web?', 'c',
          'Sobe apenas o serviço web, sem iniciar os serviços dos quais ele depende',
          ['Sobe todos os serviços menos o web', 'Remove as dependências do web do arquivo', 'Reconstrói a imagem do web'],
          '--no-deps ignora os serviços dependentes; --build é que reconstrói.'),
        mcq('q3', 'Você mudou a imagem de um serviço no compose.yaml. Qual comando aplica a mudança?', 'd',
          'docker compose up -d, que recria os containers cuja configuração mudou',
          ['docker compose restart, pois reinicia e relê o arquivo', 'docker compose stop', 'docker compose ps'],
          'start, stop e restart não recriam containers; o up -d sim.'),
        fill('q4', 'Complete o comando que cria um container descartável do serviço app para abrir um shell:', 'docker compose ___ --rm app sh',
          ['run'],
          'compose run cria um container novo e descartável com a configuração do serviço.'),
        mcq('q5', 'O que será publicado neste trecho se não existir a variável APP_PORT (nem arquivo .env)?\nports:\n  - "127.0.0.1:${APP_PORT:-8080}:80"', 'b',
          'A porta 8080 do próprio computador, ligada à porta 80 do container',
          ['A porta 80 em todas as interfaces', 'Nada: o Compose dá erro', 'A porta APP_PORT literal'],
          '${NOME:-padrão} usa o padrão (8080) quando a variável não existe.'),
        mcq('q6', 'Qual é o cuidado ao usar docker compose config?', 'd',
          'Ele valida o arquivo e mostra a versão final, mas pode exibir valores sensíveis (como senhas de variáveis); não compartilhe a saída sem conferir',
          ['Ele apaga os containers do projeto', 'Ele publica o arquivo na internet', 'Ele não mostra variáveis nunca'],
          'A saída traz variáveis já substituídas, inclusive credenciais.'),
        mcq('q7', 'Sobre container_name e restart, qual afirmação é correta?', 'a',
          'container_name fixo costuma ser evitado (pode colidir e impede réplicas); restart: on-failure reinicia o container só se ele terminar com erro',
          ['container_name é obrigatório; restart: on-failure reinicia sempre', 'container_name permite várias réplicas; on-failure nunca reinicia', 'Os dois são ignorados pelo Compose'],
          'Prefira deixar o Compose nomear; escolha a política de restart conforme a necessidade.'),
        fill('q8', 'Complete a opção que define o nome do projeto:', 'docker compose ___ loja-teste up -d',
          ['-p', '--project-name'],
          '-p (ou --project-name) muda o prefixo dos recursos do projeto.')
      ]
    },
    {
      id: 'ctr-15-servicos-prontos',
      title: 'Rodando serviços prontos',
      goal: 'Subir PostgreSQL, Redis, Nginx e MySQL em containers, persistir dados e conectar com segurança.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Serviços sem instalar nada',
            body: 'Um dos maiores usos do Docker é rodar serviços prontos — bancos, caches, servidores web — sem instalá-los no sistema: um comando sobe, outro remove, e você pode ter versões diferentes lado a lado. Cada imagem oficial documenta, no Docker Hub, suas variáveis de ambiente, portas e onde guarda os dados — leia essa página. O Nginx, por exemplo, serve arquivos de uma pasta (aqui, só leitura) com tudo o que você já viu.',
            code: 'docker run -d --name site -p 127.0.0.1:8080:80 -v ${PWD}/site:/usr/share/nginx/html:ro nginx:stable'
          },
          {
            title: 'PostgreSQL: variáveis e volume',
            body: 'A imagem do PostgreSQL exige a variável POSTGRES_PASSWORD (senha do superusuário postgres). Sem ela o container não inicia. Os dados devem ir para um volume nomeado, senão somem ao remover o container; no exemplo (tag 16), o diretório de dados é /var/lib/postgresql/data — em versões mais novas o caminho recomendado pode mudar, então confirme na documentação da imagem. A porta padrão é a 5432. ATENÇÃO: a senha abaixo é FICTÍCIA, só para estudo. Nunca use senhas de exemplo em produção.',
            code: 'docker run -d --name pg \\\n  -e POSTGRES_PASSWORD=senha-de-teste \\\n  -v dados-pg:/var/lib/postgresql/data \\\n  -p 127.0.0.1:5432:5432 \\\n  postgres:16\n\n# PowerShell: troque a barra \\ do fim da linha pela crase `'
          },
          {
            title: 'psql via docker exec',
            body: 'Para conversar com o banco sem instalar nenhum cliente no computador, rode o psql (o cliente de linha de comando do PostgreSQL) DENTRO do container, com docker exec -it. A opção -U escolhe o usuário. Dentro do psql, \\l lista os bancos e \\q sai.',
            code: 'docker exec -it pg psql -U postgres'
          },
          {
            title: 'Conectando a partir de outro container',
            body: 'Uma aplicação em container NÃO usa localhost para chegar ao banco: usa o nome do serviço (ou do container) na rede compartilhada. No Compose isso vem de graça. Veja como a string de conexão aponta para db, e note que o banco não precisa publicar porta nenhuma se só a aplicação o acessa.',
            code: 'services:\n  app:\n    build: .\n    environment:\n      - DATABASE_URL=postgres://postgres:senha-de-teste@db:5432/postgres\n  db:\n    image: postgres:16\n    environment:\n      - POSTGRES_PASSWORD=senha-de-teste\n    volumes:\n      - dados-pg:/var/lib/postgresql/data\n\nvolumes:\n  dados-pg:'
          },
          {
            title: 'Redis: cuidado com a exposição',
            body: 'O Redis é um banco de dados em memória muito usado como cache; escuta na porta 6379. Por padrão a imagem oficial sobe SEM senha, então nunca publique o Redis em todas as interfaces: deixe-o acessível só por outros containers da rede, ou no máximo em 127.0.0.1. Para testar, use o redis-cli dentro do container: ele responde PONG ao comando ping.',
            code: 'docker run -d --name cache redis:7\ndocker exec -it cache redis-cli ping\n# PONG'
          },
          {
            title: 'MySQL e MariaDB',
            body: 'A imagem do MySQL exige uma senha para o usuário root, pela variável MYSQL_ROOT_PASSWORD; MYSQL_DATABASE cria um banco inicial. Os dados ficam em /var/lib/mysql, onde se monta o volume. A porta padrão é a 3306. O MariaDB é muito parecido e usa variáveis análogas (consulte a documentação da imagem para os nomes exatos).',
            code: 'docker run -d --name mysql \\\n  -e MYSQL_ROOT_PASSWORD=senha-de-teste \\\n  -e MYSQL_DATABASE=exemplo \\\n  -v dados-mysql:/var/lib/mysql \\\n  mysql:8.4'
          },
          {
            title: 'Senhas de exemplo e dados pessoais',
            body: 'Todas as senhas deste curso, como senha-de-teste, são fictícias e públicas: nunca as use em sistemas reais. Em produção, forneça credenciais por mecanismos próprios (gerenciadores de segredos, arquivos fora do Git), nunca dentro da imagem ou do compose.yaml versionado. E lembre: um banco em volume pode guardar dados pessoais protegidos pela LGPD; em estudos e testes, use apenas dados fictícios, e não exponha o banco à rede sem necessidade.'
          }
        ]
      },
      questions: [
        mcq('q1', 'Você sobe um PostgreSQL em container SEM volume e depois remove o container com docker rm. O que acontece com os dados?', 'd',
          'São perdidos, pois estavam só na camada gravável do container',
          ['Ficam salvos automaticamente no Docker Hub', 'Ficam guardados na imagem postgres', 'Ficam para sempre na pasta do usuário do Windows'],
          'Para persistir os dados do banco, monte um volume no diretório de dados.'),
        mcq('q2', 'Qual variável define a senha do usuário root na imagem do MySQL?', 'c',
          'MYSQL_ROOT_PASSWORD',
          ['MYSQL_SECRET_KEY', 'DB_ROOT', 'ROOT_ACCESS_TOKEN'],
          'MYSQL_ROOT_PASSWORD é obrigatória (ou uma das opções equivalentes documentadas pela imagem).'),
        mcq('q3', 'O que faz o comando docker exec -it pg psql -U postgres?', 'a',
          'Abre o cliente psql dentro do container pg, conectando como usuário postgres',
          ['Cria um novo container chamado psql', 'Instala o psql no seu computador', 'Remove o usuário postgres'],
          'exec roda um comando em container existente; assim não precisa instalar o cliente no host.'),
        fill('q4', 'Complete a variável obrigatória que define a senha do PostgreSQL:', 'docker run -d --name pg -e ___=senha-de-teste postgres:16',
          ['POSTGRES_PASSWORD'],
          'Sem POSTGRES_PASSWORD, a imagem oficial do PostgreSQL não inicia (a senha do exemplo é fictícia).'),
        mcq('q5', 'Uma API em container precisa acessar o banco no serviço db. O endereço correto do banco é:', 'b',
          'db:5432, usando o nome do serviço na rede',
          ['localhost:5432', '127.0.0.1:5432', 'docker:5432, sempre'],
          'Entre containers, use o nome do serviço; localhost é o próprio container.'),
        mcq('q6', 'Por que não publicar o Redis (sem senha) em todas as interfaces de rede?', 'a',
          'Porque qualquer pessoa que alcançar a porta poderia ler e alterar os dados',
          ['Porque o Redis não funciona em rede', 'Porque o Docker bloqueia a porta 6379 por padrão', 'Porque Redis só funciona com imagem latest'],
          'Exponha só o necessário: rede interna dos containers ou 127.0.0.1.'),
        mcq('q7', 'Sobre as senhas de exemplo como senha-de-teste, qual conduta está correta?', 'c',
          'Usá-las só em estudo/testes locais; em produção, usar credenciais fortes e fornecidas por meios seguros, fora do Git e da imagem',
          ['Usá-las também em produção para facilitar', 'Gravá-las no Dockerfile da imagem final', 'Publicá-las no repositório do projeto como parte da documentação real'],
          'Senhas de exemplo são públicas por natureza.'),
        fill('q8', 'Complete o cliente de linha de comando do PostgreSQL executado dentro do container:', 'docker exec -it pg ___ -U postgres',
          ['psql'],
          'psql é o cliente interativo do PostgreSQL.')
      ]
    },
    {
      id: 'ctr-16-dockerizando-uma-aplicacao',
      title: 'Dockerizando uma aplicação do zero',
      goal: 'Empacotar uma aplicação Node simples: escrever o Dockerfile, construir, rodar, ver logs e iterar.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'A aplicação de exemplo',
            body: 'Vamos empacotar um servidor web mínimo em Node, num arquivo server.js, sem dependências externas. Repare em dois detalhes: ele lê a porta da variável de ambiente PORT e escuta no endereço 0.0.0.0; e escreve logs com console.log, que vão para a saída padrão. Já temos também um package.json (e o package-lock.json gerado pelo npm).',
            code: 'const http = require("http");\nconst PORT = process.env.PORT || 3000;\n\nhttp.createServer((req, res) => {\n  console.log(req.method + " " + req.url);\n  res.end("Ola do container!");\n}).listen(PORT, "0.0.0.0", () => {\n  console.log("Ouvindo na porta " + PORT);\n});'
          },
          {
            title: 'O Dockerfile, passo a passo',
            body: 'Escolhemos uma imagem base do Node com tag explícita; definimos a pasta de trabalho; copiamos primeiro só os arquivos de dependências e instalamos (para aproveitar o cache); depois copiamos o código; definimos a variável PORT, documentamos a porta com EXPOSE e indicamos o comando de início na forma exec. O npm ci instala exatamente o que está no package-lock.json (por isso o lock precisa existir); --omit=dev dispensa dependências só de desenvolvimento.',
            code: 'FROM node:22-slim\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --omit=dev\nCOPY server.js ./\nENV PORT=3000\nEXPOSE 3000\nCMD ["node", "server.js"]'
          },
          {
            title: 'Construir, rodar e ver os logs',
            body: 'Construímos a imagem com tag, rodamos publicando a porta (aqui limitada ao próprio computador) e verificamos. docker logs mostra o que o console.log escreveu. Teste em http://localhost:3000 ou com curl.',
            code: 'docker build -t meu-app:1.0 .\ndocker run -d --name minha-app -p 127.0.0.1:3000:3000 meu-app:1.0\ncurl http://localhost:3000\ndocker logs -f minha-app'
          },
          {
            title: 'A armadilha do 0.0.0.0',
            body: 'Dentro do container, se o servidor escutar só em 127.0.0.1 (ou localhost), ele aceita conexões apenas de dentro do próprio container: a porta publicada com -p nunca o alcança, e o navegador mostra conexão recusada ou resposta vazia. Para funcionar, o servidor precisa escutar em 0.0.0.0, que significa "todas as interfaces do container". Quem controla quem pode acessar é o -p (por exemplo, com 127.0.0.1 no lado do host), não o endereço interno.'
          },
          {
            title: '.dockerignore e logs em stdout',
            body: 'Crie um .dockerignore com node_modules, .git e .env: evita copiar para dentro da imagem uma pasta de dependências feita no seu sistema (que pode ser incompatível com o Linux da imagem) e, sobretudo, impede que arquivos com segredos entrem na imagem. Quanto aos logs, escreva na saída padrão (console.log) e não em arquivos dentro do container: o docker logs só enxerga stdout e stderr.',
            code: '# .dockerignore\nnode_modules\n.git\n.env\n*.log'
          },
          {
            title: 'Usuário não-root (visão geral)',
            body: 'Por padrão o processo roda como root dentro do container. Se a aplicação for comprometida, o invasor ganha privilégios altos ali dentro. A imagem oficial do Node já inclui um usuário comum chamado node; basta trocar para ele com USER node depois das instruções que precisam de root (como a instalação). Em outras imagens, é preciso criar o usuário primeiro.',
            code: 'RUN npm ci --omit=dev\nCOPY server.js ./\nUSER node\nCMD ["node", "server.js"]'
          },
          {
            title: 'Iterar: editar, reconstruir, recriar',
            body: 'Um container já criado NÃO muda sozinho quando você reconstrói a imagem: ele continua usando a imagem antiga. O ciclo é: editar o código, construir de novo (de preferência com uma tag nova, como 1.1), remover o container antigo e rodar um novo. O cache faz o rebuild ser rápido quando só o código mudou. Mais adiante você verá como o Compose automatiza isso.',
            code: 'docker build -t meu-app:1.1 .\ndocker rm -f minha-app\ndocker run -d --name minha-app -p 127.0.0.1:3000:3000 meu-app:1.1'
          }
        ]
      },
      questions: [
        mcq('q1', 'Por que o servidor Node do exemplo escuta em 0.0.0.0 e não em 127.0.0.1?', 'a',
          'Porque, escutando só em 127.0.0.1 dentro do container, a porta publicada com -p não conseguiria alcançá-lo',
          ['Porque 0.0.0.0 é mais rápido', 'Porque 127.0.0.1 não existe em Linux', 'Porque o Docker proíbe o endereço 127.0.0.1'],
          '0.0.0.0 = todas as interfaces do container; o acesso externo é controlado pelo -p.'),
        mcq('q2', 'O que significa este comando?\ndocker run -d --name minha-app -p 127.0.0.1:3000:3000 meu-app:1.0', 'b',
          'Roda a imagem em segundo plano, acessível em localhost:3000 apenas a partir do próprio computador',
          ['Roda a imagem acessível a todos os computadores da rede na porta 3000', 'Constrói a imagem meu-app:1.0', 'Roda em primeiro plano sem publicar porta'],
          'O prefixo 127.0.0.1 limita o acesso ao localhost.'),
        mcq('q3', 'Você alterou o server.js e reconstruiu a imagem, mas o container antigo continua com o comportamento velho. Por quê?', 'd',
          'Porque um container já criado continua usando a imagem antiga; é preciso removê-lo e rodar um novo a partir da imagem reconstruída',
          ['Porque o docker build não funciona com Node', 'Porque o cache apagou o código', 'Porque as imagens só podem ser construídas uma vez'],
          'O container guarda a referência à imagem usada na criação; imagem nova exige container novo.'),
        fill('q4', 'Complete o comando que acompanha os logs do container em tempo real:', 'docker ___ -f minha-app',
          ['logs', 'container logs'],
          'docker logs -f segue a saída (stdout/stderr) do container.'),
        mcq('q5', 'Por que o app escreve logs com console.log, na saída padrão, em vez de em um arquivo dentro do container?', 'c',
          'Porque o docker logs captura stdout e stderr; arquivos internos ficam presos no container e podem crescer sem controle',
          ['Porque o Node não sabe escrever em arquivos', 'Porque containers não têm sistema de arquivos', 'Porque logs em arquivo são ilegais'],
          'Boa prática: logs em stdout/stderr, deixando a coleta para o Docker ou a plataforma.'),
        mcq('q6', 'Qual o benefício de adicionar USER node ao Dockerfile?', 'b',
          'O processo roda como usuário comum, reduzindo o estrago caso a aplicação seja comprometida',
          ['A aplicação fica mais rápida', 'A imagem passa a ter acesso à internet', 'O Docker deixa de exigir a imagem base'],
          'Menor privilégio: evite rodar como root quando não for necessário.'),
        mcq('q7', 'Por que colocar node_modules e .env no .dockerignore?', 'd',
          'Para não copiar dependências feitas em outro sistema e, principalmente, para não levar segredos para dentro da imagem',
          ['Para que o Node reconheça os arquivos mais rápido', 'Para o Docker poder publicar a porta', 'Para apagar esses arquivos do seu computador'],
          'O .dockerignore mantém fora do contexto o que não deve entrar na imagem.'),
        fill('q8', 'Complete o endereço que significa "todas as interfaces do container":', '.listen(PORT, "___")',
          ['0.0.0.0'],
          'Escutar em 0.0.0.0 permite que a porta publicada alcance o servidor.')
      ]
    },
    {
      id: 'ctr-17-limpeza-boas-praticas',
      title: 'Limpeza e boas práticas iniciais',
      goal: 'Liberar espaço com segurança (cuidando dos volumes) e adotar hábitos básicos de qualidade e segurança.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Quanto espaço o Docker usa: docker system df',
            body: 'Com o tempo, imagens, containers parados, volumes e cache de build se acumulam e ocupam disco. docker system df mostra um resumo do uso por categoria, incluindo quanto é "reclaimable" (recuperável). Olhar antes de limpar evita sustos.',
            code: 'docker system df'
          },
          {
            title: 'Removendo o que sobrou: prune',
            body: 'Os comandos prune removem recursos sem uso. docker container prune remove todos os containers parados. docker image prune remove imagens "dangling" (sem tag, geralmente restos de builds antigos); com -a remove todas as imagens não usadas por nenhum container. docker builder prune limpa o cache de build. Cada um pede confirmação, e você pode listar antes (docker ps -a, docker images) para conferir.',
            code: 'docker container prune\ndocker image prune\ndocker builder prune'
          },
          {
            title: 'docker system prune e o cuidado com volumes',
            body: 'docker system prune combina várias limpezas: remove containers parados, redes sem uso, imagens dangling e cache de build. Por padrão NÃO remove volumes, de propósito, porque volumes guardam dados; só os remove se você acrescentar --volumes. O comando docker volume prune remove volumes que nenhum container usa — mas "sem uso" inclui os volumes de containers PARADOS, ou seja, o banco que você só desligou. Dependendo da versão, ele remove só volumes anônimos ou todos os não usados: confira sempre com docker volume ls e faça backup do que importa antes.',
            code: 'docker system prune              # preserva volumes\ndocker system prune --volumes    # apaga volumes sem uso: dados!\ndocker volume ls'
          },
          {
            title: 'Tags explícitas em vez de latest',
            body: 'Prefira sempre tags explícitas nas imagens base e nas suas próprias: python:3.12-slim em vez de python ou python:latest, e meu-app:1.2 em vez de meu-app:latest. Assim o resultado é repetível: o mesmo Dockerfile gera a mesma base amanhã. Com latest, o mesmo comando pode produzir resultados diferentes sem que você perceba.'
          },
          {
            title: 'Um processo principal por container e logs em stdout',
            body: 'Cada container deve ter UM processo principal (um serviço: só a app, só o banco, só o cache). Isso facilita atualizar, escalar, reiniciar e diagnosticar cada parte separadamente, e usa o ciclo de vida do container como o ciclo de vida do serviço. Os logs devem ir para stdout e stderr, assim o docker logs e as plataformas de monitoramento os coletam, sem arquivos presos dentro do container.'
          },
          {
            title: 'Segredos e .dockerignore',
            body: 'Nunca guarde segredos (senhas, tokens, chaves) na imagem: nem no Dockerfile, nem em ENV/ARG, nem em arquivos copiados — lembre-se de que as camadas guardam tudo e qualquer pessoa com a imagem pode extraí-los. Passe-os na execução por meios adequados e mantenha arquivos como .env fora do Git. O .dockerignore ajuda a impedir que cheguem à imagem sem querer.'
          },
          {
            title: 'Menos privilégio',
            body: 'Boas práticas de segurança, em visão geral: não rode como root sem necessidade (use USER); evite --privileged, que quase remove o isolamento do container e dá a ele quase os mesmos poderes do host; nunca monte o socket do Docker (/var/run/docker.sock) dentro de um container, pois isso dá controle total do Docker, e portanto da máquina, a quem estiver lá; use imagens de origem confiável e reconstrua as suas periodicamente para receber correções; publique só as portas necessárias, limitadas a 127.0.0.1 quando possível.'
          }
        ]
      },
      questions: [
        mcq('q1', 'Qual é a prática mais adequada para a imagem base de um projeto real?', 'c',
          'Usar uma tag explícita, como python:3.12-slim, para que o resultado seja repetível',
          ['Usar sempre latest para pegar a versão mais nova automaticamente', 'Omitir a tag para o Docker decidir', 'Trocar a imagem base a cada build'],
          'latest pode mudar sem aviso; tags explícitas dão previsibilidade.'),
        mcq('q2', 'O que o docker system prune (sem opções adicionais) NÃO remove por padrão?', 'a',
          'Os volumes',
          ['Containers parados', 'Imagens dangling', 'O cache de build'],
          'Volumes só são incluídos com --volumes, justamente para proteger dados.'),
        mcq('q3', 'Por que é arriscado rodar docker volume prune às cegas?', 'b',
          'Porque volumes de containers parados contam como "sem uso" e podem ser apagados, junto com dados importantes como os de um banco',
          ['Porque ele reinicia o Docker', 'Porque ele remove todas as imagens', 'Não há risco algum'],
          'Confira com docker volume ls e faça backup antes de podar volumes.'),
        fill('q4', 'Complete o comando que mostra o uso de disco do Docker:', 'docker system ___',
          ['df'],
          'docker system df resume o espaço usado por imagens, containers, volumes e cache.'),
        mcq('q5', 'Qual é a recomendação sobre processos em um container?', 'd',
          'Cada container deve ter um processo principal, ou seja, um serviço',
          ['Colocar app, banco e cache todos no mesmo container', 'Rodar sempre dois processos para ter redundância', 'Não importa, é só questão de gosto'],
          'Um serviço por container facilita atualizar, reiniciar, escalar e diagnosticar.'),
        mcq('q6', 'Onde uma aplicação em container deve escrever seus logs?', 'c',
          'Na saída padrão (stdout) e de erro (stderr), para o docker logs coletá-los',
          ['Em arquivos dentro do container, sem limite de tamanho', 'No Dockerfile', 'Em um arquivo na pasta do Windows sem montar volume'],
          'Logs em stdout/stderr são coletados facilmente e não ficam presos no container.'),
        mcq('q7', 'Qual conjunto de práticas está alinhado à segurança?', 'a',
          'Segredos fora da imagem e do Git, usuário não-root e evitar --privileged e o socket do Docker nos containers',
          ['Colocar senhas em ENV para facilitar e rodar como root por padrão', 'Montar /var/run/docker.sock em todo container para automatizar tarefas', 'Usar --privileged sempre, para evitar erros de permissão'],
          'Menor privilégio e segredos fora das imagens são princípios básicos.'),
        fill('q8', 'Complete o comando que remove imagens dangling (sem tag):', 'docker image ___',
          ['prune', 'prune -f'],
          'docker image prune remove imagens dangling; com -a, as não usadas por containers.')
      ]
    },
    {
      id: 'ctr-18-referencia-rapida-e-erros',
      title: 'Referência rápida e leitura de erros',
      goal: 'Consolidar os comandos, usar --help, --filter e --format e resolver os erros mais comuns do Docker.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'A ajuda embutida',
            body: 'Você não precisa decorar tudo: docker --help lista os comandos; docker run --help mostra todas as flags do run; docker container --help ou docker volume --help mostram os subcomandos de cada grupo. Além disso, a documentação oficial do Docker é a fonte mais confiável e atualizada. Atenção: a flag -h não é ajuda em todos os comandos (no docker run, por exemplo, ela define o hostname); use --help.',
            code: 'docker --help\ndocker run --help\ndocker volume --help'
          },
          {
            title: 'Filtrando e formatando a saída',
            body: '--filter (ou -f) limita a lista ao que interessa, no formato chave=valor; --format escolhe as colunas ou campos que aparecem, com modelos {{.Campo}}. Juntos, deixam a saída enxuta e fácil de usar em scripts. Use aspas simples em volta do modelo (cuidado no cmd.exe, que prefere aspas duplas).',
            code: 'docker ps -a --filter status=exited\ndocker images --filter dangling=true\ndocker ps --format \'{{.Names}}: {{.Status}}\''
          },
          {
            title: 'Erro: "port is already allocated" e "name already in use"',
            body: '"Bind for 0.0.0.0:8080 failed: port is already allocated": a porta do host já está em uso por outro container ou programa. Solução: escolher outra porta do host (-p 8081:80) ou parar quem a usa. "Conflict. The container name "/web" is already in use": já existe um container (talvez parado) com esse nome. Solução: usar outro nome, iniciar o existente com docker start web, ou removê-lo com docker rm web e criar de novo.',
            code: 'docker ps -a\ndocker rm web\ndocker run -d --name web -p 8081:80 nginx:stable'
          },
          {
            title: 'Erro: imagem não encontrada',
            body: '"Unable to find image ... locally" seguido de "pull access denied", "repository does not exist" ou "manifest ... not found", e "No such image" em comandos como docker rmi e docker inspect, indicam que o nome ou a tag não existe (ou não está disponível para você). Verifique erros de digitação, a tag no Docker Hub e, se a imagem for de um registry privado, se você fez docker login. Para comandos locais, confira o nome em docker images.'
          },
          {
            title: 'Erros de conexão e de permissão com o Docker',
            body: '"Cannot connect to the Docker daemon ... Is the docker daemon running?" (ou, no Windows, um erro mencionando o pipe docker_engine) significa que o cliente não alcançou o daemon: normalmente o Docker Desktop (ou o serviço dockerd) não está iniciado. Inicie-o e confira com docker version. "permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock" (Linux) significa que o seu usuário não tem permissão no socket. Use sudo ou, de forma consciente, inclua o usuário no grupo docker (que equivale a poder de administrador). NUNCA resolva com chmod 777 no socket.'
          },
          {
            title: 'Roteiro de diagnóstico e mapa de comandos',
            body: 'Container com problema? 1) docker ps -a: ele está rodando ou saiu, e com que exit code? 2) docker logs: o que o programa disse? 3) docker inspect: como ele foi realmente criado? 4) docker exec: entre e investigue (se estiver rodando). Resumo geral: imagens (pull, images, rmi, build), containers (run, ps, stop, start, rm, logs, exec), dados (volume), rede (network), orquestração (compose up/down) e limpeza (system df, prune).',
            code: 'docker ps -a\ndocker logs --tail 50 web\ndocker inspect --format \'{{.State.ExitCode}}\' web\ndocker exec -it web sh'
          }
        ]
      },
      questions: [
        mcq('q1', 'Ao subir um container aparece "port is already allocated". Qual a interpretação e solução mais direta?', 'b',
          'A porta do host já está em uso; escolha outra porta do host (como -p 8081:80) ou pare quem a usa',
          ['A imagem está corrompida e deve ser removida', 'O Docker não tem permissão de rede; reinstalar o Windows', 'O container não pode usar a porta 80 nunca'],
          'Conflito de porta no host, resolvido mudando o lado esquerdo do -p ou liberando a porta.'),
        mcq('q2', 'O que mostra este comando?\ndocker ps --format \'{{.Names}}: {{.Status}}\'', 'd',
          'O nome e o status de cada container em execução, uma linha por container',
          ['Apenas o ID de cada imagem', 'O consumo de CPU de cada container', 'Remove containers que estejam com status parado'],
          '--format escolhe os campos exibidos; o ps sem -a lista só os que estão rodando.'),
        mcq('q3', 'Aparece "container name /web is already in use". O que fazer?', 'c',
          'Usar outro nome, iniciar o container existente com docker start web, ou removê-lo com docker rm web antes de criar de novo',
          ['Reinstalar o Docker', 'Apagar todas as imagens', 'Ignorar: o container foi criado mesmo assim'],
          'Nomes são únicos, mesmo entre containers parados.'),
        fill('q4', 'Complete a opção que filtra a lista pelo estado dos containers:', 'docker ps -a --___ status=exited',
          ['filter'],
          '--filter (ou -f) restringe a lista; status=exited mostra os que já terminaram.'),
        mcq('q5', 'Aparece "Cannot connect to the Docker daemon". Qual é a causa mais provável?', 'a',
          'O daemon não está em execução (por exemplo, o Docker Desktop está fechado)',
          ['A imagem pedida não existe', 'A porta do host está ocupada', 'O Dockerfile tem um erro de sintaxe'],
          'O cliente não alcançou o daemon: inicie o Docker Desktop (ou o serviço) e confira com docker version.'),
        mcq('q6', 'No Linux, aparece "permission denied ... /var/run/docker.sock". Qual conduta é a adequada?', 'd',
          'Usar sudo ou adicionar conscientemente o usuário ao grupo docker, sabendo que isso equivale a poder de administrador; nunca usar chmod 777 no socket',
          ['Dar chmod 777 no socket para liberar a todos', 'Rodar todos os containers com --privileged', 'Remover o socket do sistema'],
          'Abrir o socket a todos entrega controle da máquina a qualquer usuário.'),
        mcq('q7', 'Aparece "pull access denied ... repository does not exist or may require docker login". O que verificar?', 'b',
          'O nome e a tag da imagem (erro de digitação) e, se for uma imagem privada, se fez docker login',
          ['Se o container tem volume montado', 'Se a porta 80 está publicada', 'Se o exit code é zero'],
          'O registry não achou (ou não deixou você acessar) aquela imagem/tag.'),
        fill('q8', 'Complete a flag que mostra as opções disponíveis de um comando:', 'docker run ___',
          ['--help'],
          'docker run --help lista todas as flags do run. (No run, -h significa hostname, não ajuda.)')
      ]
    }
  ]
};
