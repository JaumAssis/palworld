// Módulo "Intermediário" — 23 lições, 8 questões cada (3 múltipla escolha + 1 lacuna, duas vezes
// por lição). Ver ../../index.js para o formato e a validação de boot. Comandos Docker reais
// (docker compose v2, BuildKit como padrão, sem `version:` no Compose) em containers Linux, com
// notas sobre PowerShell onde o usuário Windows pode tropeçar. Mesmo padrão de ./01-*.js.
// Para não repetir 184 vezes o mesmo objeto literal, as questões usam helpers locais (mcq e fill)
// que produzem exatamente o formato esperado pela validação do boot: mcq recebe a letra da resposta
// correta e as 4 alternativas na ordem a, b, c, d (a posição da certa é escolhida à mão e variada);
// fill recebe prompt, código com a lacuna ___ e a lista de respostas aceitas (a 1ª é a canônica).
// sl() monta um slide (code opcional).
// Segurança e privacidade (LGPD): segredos nunca no código/imagem/histórico de camadas, mínimo
// privilégio (não-root, cap-drop, read-only), nenhum dado pessoal real nos exemplos (credenciais e
// valores são fictícios) e logs/volumes/backups tratados como possíveis detentores de dados
// pessoais (minimização, retenção, criptografia). Nenhum tamanho de imagem, limite de pull ou
// versão exata sujeita a mudança é afirmado — só conceitos e sintaxe estável.
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
  id: 'intermediario-containers',
  levelKey: 'intermediate',
  order: 2,
  title: 'Intermediário',
  subtitle: 'Dockerfile avançado, multi-stage, BuildKit, registries, Compose, redes, volumes, segurança, depuração e CI/CD',
  accent: '#2496ed',
  lessons: [
    {
      id: 'cti-01-dockerfile-boas-praticas',
      title: 'Dockerfile avançado e boas práticas',
      goal: 'Escrever Dockerfiles que aproveitam o cache, geram imagens menores e rodam com menos privilégios.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Ordem das instruções: o que muda pouco vem primeiro',
            'Cada instrução gera uma camada e o cache é invalidado a partir da primeira camada que mudou — todas as seguintes são refeitas. Por isso, coloque no topo o que muda raramente (base, pacotes do sistema, arquivos de dependências) e no fim o que muda sempre (seu código). O truque clássico: copiar só o arquivo de dependências, instalar, e só então copiar o resto.',
            'FROM node:22-alpine\nWORKDIR /app\nCOPY package.json package-lock.json ./\nRUN npm ci\nCOPY . .\nCMD ["node", "server.js"]'
          ),
          sl(
            'COPY vs ADD',
            'COPY apenas copia arquivos e pastas do contexto de build para a imagem — simples e previsível. ADD faz o mesmo, mas também extrai automaticamente arquivos .tar locais e aceita uma URL como origem. Esses comportamentos extras surpreendem (baixar da rede sem verificação, extrair sem você pedir). Regra prática: use COPY sempre; ADD só quando você realmente quer extrair um tar local.',
            'COPY ./config /app/config      # preferido\nADD ./pacote.tar.gz /opt/       # extrai sozinho: use só se for isso que você quer'
          ),
          sl(
            'RUN combinado e limpeza do cache do apt',
            'Uma camada nunca perde arquivos que já continha: se você baixa pacotes num RUN e apaga o cache em outro RUN, os arquivos continuam guardados na camada anterior e a imagem não encolhe. Por isso o update, o install e a limpeza ficam no MESMO RUN, encadeados com &&. Com apt-get install, use -y (sem perguntas) e --no-install-recommends (não instala pacotes "recomendados" que você não pediu), e apague /var/lib/apt/lists no final.',
            'RUN apt-get update \\\n && apt-get install -y --no-install-recommends curl ca-certificates \\\n && rm -rf /var/lib/apt/lists/*'
          ),
          sl(
            'Fixar a base e etiquetar com LABEL',
            'FROM node:latest muda sem aviso: o build de hoje pode não ser igual ao de amanhã (reprodutibilidade quebrada). Prefira uma tag específica (node:22-alpine, python:3.12-slim) — e, para máximo rigor, o digest (veremos adiante). LABEL grava metadados na imagem; o padrão OCI define chaves como org.opencontainers.image.source (de onde veio o código), .version e .licenses. Não muda o comportamento: ferramentas e registries leem esses dados.',
            'FROM python:3.12-slim\nLABEL org.opencontainers.image.source="https://github.com/exemplo/app" \\\n      org.opencontainers.image.version="1.4.2" \\\n      org.opencontainers.image.licenses="MIT"'
          ),
          sl(
            'USER e HEALTHCHECK (prévia)',
            'Por padrão o processo roda como root dentro do container. Crie um usuário comum e mude para ele com a instrução USER: se o app for comprometido, o atacante terá menos poder. HEALTHCHECK ensina o Docker a testar se o app está realmente saudável, não só "rodando" — vamos detalhá-lo numa lição própria; aqui basta saber que ele existe no Dockerfile.',
            'RUN useradd --system --no-create-home app\nUSER app\nHEALTHCHECK CMD curl -f http://localhost:3000/health || exit 1'
          ),
          sl(
            'Lint com hadolint',
            'hadolint é um linter de Dockerfile: lê o arquivo (sem construir nada) e avisa sobre más práticas — tag latest, apt-get sem limpeza, ADD no lugar de COPY, falta de USER — e também confere os comandos dentro dos RUN. Roda como programa local ou como container, e cabe bem num pipeline de CI para barrar problemas antes do build.',
            'docker run --rm -i hadolint/hadolint < Dockerfile'
          )
        ]
      },
      questions: [
        mcq('q1', 'Neste Dockerfile, qual é o problema de cache?\nFROM python:3.12-slim\nWORKDIR /app\nCOPY . .\nRUN pip install -r requirements.txt\nCMD ["python", "app.py"]', 'b', [
          'CMD precisa vir antes do RUN',
          'Qualquer mudança no código invalida o COPY . . e força reinstalar todas as dependências; o ideal é copiar requirements.txt antes',
          'WORKDIR não pode ser usado com imagens slim',
          'O pip não funciona em imagens slim'
        ], 'Como COPY . . vem antes do pip install, qualquer edição de código refaz a instalação. Copiando só requirements.txt primeiro, a camada de dependências fica em cache.'),
        mcq('q2', 'Qual é a recomendação geral entre COPY e ADD para arquivos locais?', 'd', [
          'ADD sempre, pois faz mais coisas',
          'ADD, porque é mais rápido que COPY',
          'São idênticos, tanto faz',
          'COPY, porque é explícito; ADD tem extras (extrair tar, baixar URL) que surpreendem'
        ], 'COPY faz só o que diz. ADD extrai tars e aceita URLs, comportamentos implícitos que convém evitar.'),
        mcq('q3', 'Por que rodar "RUN rm -rf /var/lib/apt/lists/*" num RUN separado não reduz o tamanho da imagem?', 'a', [
          'Os arquivos continuam guardados na camada anterior; o rm só os esconde na camada nova',
          'O Docker ignora o comando rm',
          'O apt recria os arquivos a cada build',
          'O rm não funciona dentro de containers'
        ], 'Camadas são acumulativas: o que entrou numa camada fica nela. A limpeza precisa estar no mesmo RUN que baixou os pacotes.'),
        fill('q4', 'Complete a flag que evita instalar pacotes "recomendados" que você não pediu:', 'RUN apt-get update && apt-get install -y ___ curl && rm -rf /var/lib/apt/lists/*', ['--no-install-recommends'], '--no-install-recommends instala só as dependências obrigatórias, deixando a imagem menor.'),
        mcq('q5', 'Qual o principal problema de usar FROM node:latest?', 'c', [
          'A tag latest sempre aponta para a versão mais antiga',
          'A tag latest não existe no Docker Hub',
          'A base pode mudar sem aviso, então o mesmo Dockerfile pode gerar imagens diferentes em dias diferentes',
          'A tag latest desativa o cache de build'
        ], 'latest é uma tag mutável. Fixar uma versão específica torna o build reprodutível.'),
        mcq('q6', 'Para que serve LABEL org.opencontainers.image.source="https://github.com/exemplo/app"?', 'b', [
          'Para baixar o código-fonte durante o build',
          'Para registrar na imagem, de forma padronizada, de onde veio o código — sem alterar o comportamento',
          'Para definir de qual repositório o container fará pull em runtime',
          'Para criptografar a imagem'
        ], 'Labels OCI são metadados lidos por registries e ferramentas; não afetam a execução.'),
        mcq('q7', 'O que o hadolint faz?', 'd', [
          'Constrói imagens mais rápido que o docker build',
          'Remove automaticamente camadas desnecessárias de uma imagem pronta',
          'Escaneia vulnerabilidades dentro do container em execução',
          'Analisa o Dockerfile e avisa sobre más práticas (tag latest, ADD indevido, falta de USER etc.)'
        ], 'hadolint é um linter estático de Dockerfile. Vulnerabilidades em imagens são outro assunto (scanners como Trivy).'),
        fill('q8', 'Complete a instrução que faz o processo rodar como o usuário "app" em vez de root:', 'RUN useradd --system app\n___ app', ['USER'], 'USER define o usuário das instruções seguintes e do processo do container.')
      ]
    },
    {
      id: 'cti-02-multi-stage',
      title: 'Multi-stage builds',
      goal: 'Separar build e runtime para entregar imagens finais enxutas, sem compiladores nem código-fonte.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O problema: ferramentas de build vão para produção',
            'Para compilar um app você precisa de compilador, SDK, dependências de desenvolvimento, código-fonte. Para RODAR, quase nada disso é necessário. Num Dockerfile de estágio único, tudo fica na imagem final: maior, com mais superfície de ataque (mais software = mais vulnerabilidades possíveis) e mais lenta de baixar.'
          ),
          sl(
            'Estágios nomeados e COPY --from',
            'Um Dockerfile pode ter vários FROM; cada um começa um estágio novo, do zero. Dê nome ao estágio com AS. Só o ÚLTIMO estágio vira a imagem final (a menos que você escolha outro com --target); os anteriores servem de "oficina". Para trazer apenas o resultado da oficina, use COPY --from=<estágio> origem destino.',
            'FROM golang:1.23 AS build\nWORKDIR /src\nCOPY . .\nRUN go build -o /out/app .\n\nFROM debian:stable-slim\nCOPY --from=build /out/app /usr/local/bin/app\nCMD ["app"]'
          ),
          sl(
            'Exemplo Go: binário estático em imagem mínima',
            'Go compila para um único binário. Desligando o CGO (CGO_ENABLED=0), o binário fica estático, sem depender de bibliotecas do sistema — e pode rodar até em FROM scratch, a imagem vazia. A imagem final contém o binário e nada mais: sem shell, sem compilador, sem código-fonte.',
            'FROM golang:1.23 AS build\nWORKDIR /src\nCOPY . .\nRUN CGO_ENABLED=0 go build -o /out/app .\n\nFROM scratch\nCOPY --from=build /out/app /app\nENTRYPOINT ["/app"]'
          ),
          sl(
            'Exemplo Node: build com devDependencies, runtime só com o necessário',
            'Em apps com TypeScript ou bundlers, o build precisa de pacotes de desenvolvimento (compilador, linters). O estágio de build instala tudo e gera a pasta dist; o estágio final instala só as dependências de produção e copia o dist pronto. O compilador nunca chega à imagem final.',
            'FROM node:22-alpine AS build\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM node:22-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --omit=dev\nCOPY --from=build /app/dist ./dist\nUSER node\nCMD ["node", "dist/server.js"]'
          ),
          sl(
            'Exemplo Java em visão geral',
            'Mesma ideia: o estágio de build usa uma imagem com JDK e Maven (ou Gradle) para gerar o .jar; o estágio final usa uma imagem só com o ambiente de execução Java (JRE) e recebe apenas o .jar. O JDK, o Maven e o cache de dependências ficam para trás.',
            'FROM maven:3-eclipse-temurin-21 AS build\nWORKDIR /src\nCOPY . .\nRUN mvn -q package -DskipTests\n\nFROM eclipse-temurin:21-jre\nCOPY --from=build /src/target/app.jar /app.jar\nCMD ["java", "-jar", "/app.jar"]'
          ),
          sl(
            '--target: parar em um estágio',
            'docker build --target <estágio> constrói somente até aquele estágio, e a imagem resultante é a daquele estágio. Serve para gerar uma imagem de teste ou de depuração a partir do mesmo Dockerfile (por exemplo, o estágio build com todas as ferramentas), sem criar um segundo arquivo. COPY --from também aceita uma imagem externa (COPY --from=nginx:stable ...), não só estágios.',
            'docker build --target build -t app:build .\ndocker build -t app:1.0 .      # sem --target: usa o último estágio'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual a principal vantagem do multi-stage build?', 'c', [
          'Fazer o container rodar em várias CPUs ao mesmo tempo',
          'Permitir que um container rode várias aplicações',
          'Deixar compiladores e dependências de build fora da imagem final, que fica menor e com menos superfície de ataque',
          'Dispensar o uso de Dockerfile'
        ], 'Build e runtime ficam em estágios separados; só o resultado é copiado para a imagem final.'),
        mcq('q2', 'Em um Dockerfile com três estágios e sem usar --target, qual vira a imagem final?', 'a', [
          'O último estágio',
          'O primeiro estágio',
          'Todos, empilhados em uma só imagem',
          'O estágio com o maior nome'
        ], 'Por padrão, a imagem final é a do último FROM.'),
        mcq('q3', 'O que faz "COPY --from=build /out/app /app"?', 'd', [
          'Copia o arquivo da máquina host para o estágio build',
          'Copia /app do contexto de build para /out/app',
          'Baixa o arquivo /out/app da internet',
          'Copia /out/app do estágio chamado build para /app do estágio atual'
        ], '--from aponta para outro estágio (ou imagem) como origem da cópia.'),
        fill('q4', 'Complete a flag que constrói apenas até o estágio chamado "build":', 'docker build ___ build -t app:build .', ['--target'], '--target <nome> para a construção no estágio indicado e usa o resultado como imagem.'),
        mcq('q5', 'Neste trecho, o que existe na imagem final?\nFROM golang:1.23 AS build\nRUN CGO_ENABLED=0 go build -o /out/app .\nFROM scratch\nCOPY --from=build /out/app /app\nENTRYPOINT ["/app"]', 'b', [
          'O compilador Go e o código-fonte, além do binário',
          'Apenas o binário /app (e os metadados da imagem), sem shell nem compilador',
          'Uma cópia completa do estágio build',
          'Nada: scratch não permite COPY'
        ], 'scratch é vazio; a imagem contém só o que foi copiado. O binário estático (CGO desligado) roda sem bibliotecas do sistema.'),
        mcq('q6', 'Num app Node com TypeScript, por que o estágio final costuma rodar "npm ci --omit=dev"?', 'c', [
          'Porque o npm ci não funciona com devDependencies',
          'Para compilar o TypeScript mais rápido',
          'Para instalar só as dependências necessárias em produção; o compilador e outras ferramentas de dev ficam no estágio de build',
          'Para desativar o cache do npm'
        ], '--omit=dev ignora as devDependencies, que só eram necessárias para construir o dist.'),
        mcq('q7', 'Para que serve "docker build --target build -t app:build ."?', 'a', [
          'Gerar uma imagem a partir do estágio build, útil para testes ou depuração com as ferramentas de build',
          'Construir a imagem final e apagar o estágio build',
          'Enviar o estágio build ao registry',
          'Compilar o projeto apenas no host, sem usar o Dockerfile'
        ], '--target escolhe o estágio onde parar; a imagem resultante é a daquele estágio.'),
        fill('q8', 'Complete a palavra que dá nome a um estágio:', 'FROM node:22 ___ build', ['AS'], 'FROM imagem AS nome cria um estágio nomeado, referenciável por COPY --from e --target.')
      ]
    },
    {
      id: 'cti-03-imagens-base',
      title: 'Escolhendo imagens base e reduzindo tamanho',
      goal: 'Comparar alpine, slim, distroless e scratch, entender glibc vs musl e usar .dockerignore.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Menor nem sempre é melhor: o triângulo',
            'Ao escolher a imagem base você equilibra três coisas: tamanho/superfície de ataque (menos software = menos para atualizar e menos vulnerabilidades possíveis), compatibilidade (o seu software precisa funcionar nela) e facilidade de depurar (ter shell e ferramentas ajuda). Não existe imagem perfeita: a escolha depende do app.'
          ),
          sl(
            'Alpine e a diferença glibc vs musl',
            'Alpine é uma distribuição minúscula. Ela usa a biblioteca C musl e o gerenciador apk, enquanto Debian e Ubuntu usam a glibc. Consequência: um binário compilado para glibc pode não rodar na Alpine, e pacotes que trazem partes pré-compiladas (comum em Python e Node com módulos nativos) podem faltar ou precisar ser compilados — build mais lento e, às vezes, comportamentos sutilmente diferentes. Para pacotes do sistema, use apk.',
            'FROM alpine:3\nRUN apk add --no-cache curl'
          ),
          sl(
            'Variantes slim',
            'Tags -slim (python:3.12-slim, node:22-slim) são o Debian reduzido: glibc, sem as ferramentas de compilação e extras. Ficam pequenas e, por usarem glibc, costumam dar menos surpresas de compatibilidade que a Alpine com dependências nativas. É uma ótima escolha padrão quando se quer equilíbrio.'
          ),
          sl(
            'Distroless e scratch',
            'Distroless (imagens do Google) contém só o seu app e o runtime da linguagem — sem shell, sem gerenciador de pacotes, sem utilitários. Pouquíssimo software para atacar. scratch é a imagem completamente vazia: serve para binários estáticos (como Go com CGO desligado) que não precisam de nada do sistema; lembre que nem certificados de CA existem nela, então um app que faz HTTPS precisa trazê-los.',
            'FROM gcr.io/distroless/static-debian12\nCOPY --from=build /out/app /app\nENTRYPOINT ["/app"]'
          ),
          sl(
            '.dockerignore: não envie lixo ao contexto de build',
            'O docker build envia ao builder todo o diretório (o "contexto"). Um arquivo .dockerignore, na raiz do contexto, lista o que NÃO enviar — com sintaxe parecida com .gitignore. Vantagens: build mais rápido, cache menos invalidado e, importante para segurança, impede que COPY . . leve para dentro da imagem o .git, o .env e outros arquivos com segredos.',
            'node_modules\n.git\n.env\n*.log\nDockerfile\ncompose.yaml'
          ),
          sl(
            'Depurando imagens mínimas',
            'Sem shell, docker exec -it app sh falha: não há /bin/sh para executar. Alternativas: usar a variante de depuração da imagem (algumas distroless oferecem uma com shell), construir uma imagem de debug a partir do estágio de build (--target), ou anexar um container auxiliar com ferramentas ao mesmo namespace de rede do alvo (veremos na lição de depuração). Vale o trade-off: produção enxuta, depuração com um passo extra.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual a diferença de base entre a Alpine e a maioria das imagens Debian/Ubuntu que pode causar problemas de compatibilidade?', 'b', [
          'A Alpine não usa Linux',
          'A Alpine usa a biblioteca C musl, e Debian/Ubuntu usam glibc; binários feitos para glibc podem não rodar na Alpine',
          'A Alpine só roda em ARM',
          'A Alpine não aceita volumes'
        ], 'musl e glibc são implementações diferentes da biblioteca C; software compilado para uma pode falhar na outra.'),
        mcq('q2', 'Qual característica define uma imagem distroless?', 'd', [
          'Vem com todas as ferramentas de depuração instaladas',
          'É exatamente igual à Ubuntu, mas com outro nome',
          'Só funciona com Go',
          'Contém basicamente o app e seu runtime, sem shell nem gerenciador de pacotes'
        ], 'Menos software = menor superfície de ataque, mas sem shell para depurar.'),
        mcq('q3', 'Para que tipo de programa FROM scratch é adequado?', 'a', [
          'Binários estáticos que não dependem de bibliotecas do sistema',
          'Qualquer app Python',
          'Apps que precisam de shell para iniciar',
          'Apps Java que usam o JRE do sistema'
        ], 'scratch é vazio: só roda o que for autossuficiente, como um binário Go estático.'),
        fill('q4', 'Complete o nome do arquivo que lista o que não deve ir ao contexto de build:', 'cat ___\nnode_modules\n.git\n.env', ['.dockerignore'], '.dockerignore reduz o contexto e evita copiar segredos e lixo para a imagem.'),
        mcq('q5', 'Além de acelerar o build, por que o .dockerignore é importante para segurança?', 'c', [
          'Porque criptografa o contexto de build',
          'Porque impede o container de acessar a internet',
          'Porque evita que COPY . . leve .env, .git e outros arquivos sensíveis para dentro da imagem',
          'Porque remove vulnerabilidades da imagem base'
        ], 'Sem ignorar, um COPY . . pode embutir segredos e histórico do Git na imagem.'),
        mcq('q6', 'Por que python:3.12-slim costuma dar menos problemas com dependências nativas que a Alpine?', 'b', [
          'Porque é maior que a Debian completa',
          'Porque usa glibc, o que costuma ser compatível com pacotes pré-compilados',
          'Porque inclui um compilador de C por padrão',
          'Porque não tem gerenciador de pacotes'
        ], 'slim é Debian reduzido (glibc); muitos pacotes pré-compilados são feitos para glibc.'),
        mcq('q7', 'Por que "docker exec -it app sh" falha numa imagem distroless e qual é uma saída possível?', 'd', [
          'Porque o Docker bloqueia exec em imagens distroless; não há saída',
          'Porque falta memória; basta aumentar --memory',
          'Porque exec só funciona com Alpine; trocar de base',
          'Porque não existe shell na imagem; use uma variante de depuração ou um container auxiliar com ferramentas'
        ], 'Sem /bin/sh não há o que executar. O trade-off das imagens mínimas é depurar de forma indireta.'),
        fill('q8', 'Complete o gerenciador de pacotes da Alpine:', 'RUN ___ add --no-cache curl', ['apk'], 'apk é o gerenciador de pacotes da Alpine (Debian/Ubuntu usam apt-get).')
      ]
    },
    {
      id: 'cti-24-dockerfile-node-python',
      title: 'Dockerfiles idiomáticos: Node.js e Python',
      goal: 'Montar Dockerfiles de Node.js e Python com cache eficiente, usuário sem privilégios e servidor adequado a produção.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Node: npm ci e a ordem das camadas',
            'npm install resolve as versões e pode atualizar o package-lock.json; npm ci instala EXATAMENTE o que está no lockfile, apaga o node_modules anterior e falha se package.json e lockfile divergirem. Em build de imagem você quer reprodutibilidade, então use npm ci. Para o cache funcionar, copie só package*.json (package.json e package-lock.json) antes do código: enquanto as dependências não mudarem, a camada do npm ci vem do cache, mesmo que você edite o código a cada build.',
            'FROM node:22-slim\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .'
          ),
          sl(
            'Node: produção, dependências de dev e usuário node',
            'NODE_ENV=production faz muitas bibliotecas (e o próprio npm) adotarem o modo de produção. Dependências de desenvolvimento (compilador, testes, linters) não devem ir para a imagem final: use npm ci --omit=dev no estágio final, ou rode npm prune --omit=dev depois de compilar. O .dockerignore deve listar node_modules (para o COPY . . não levar o node_modules da sua máquina por cima do instalado na imagem), .git e .env. As imagens oficiais do Node já trazem um usuário comum chamado node: basta usar USER node.',
            'ENV NODE_ENV=production\nRUN npm ci --omit=dev\nCOPY --chown=node:node . .\nUSER node'
          ),
          sl(
            'Node: CMD direto e escutar em 0.0.0.0',
            'Prefira CMD ["node", "server.js"] a CMD ["npm", "start"]. Com npm start, o npm vira o PID 1 e roda o seu app como processo filho; os sinais de parada (SIGTERM) nem sempre chegam ao app, que então não encerra com graça e é morto à força depois do timeout. Com node direto, o app é o PID 1 e recebe o sinal. Outro erro clássico: se o servidor escuta só em 127.0.0.1, ele aceita conexões apenas de DENTRO do próprio container — a porta publicada com -p não funciona. Dentro do container, escute em 0.0.0.0 (todas as interfaces do container). Publicar no host em 127.0.0.1 continua sendo uma decisão do -p.',
            'CMD ["node", "server.js"]\n# no código: server.listen(3000, "0.0.0.0")'
          ),
          sl(
            'Front-end estático: multi-stage servido por Nginx',
            'Um front-end (React, Vue etc.) depois de compilado vira arquivos estáticos (HTML, JS, CSS). Para compilar você precisa de Node e de devDependencies; para SERVIR basta um servidor web. Então: estágio de build com Node gera a pasta de saída (dist ou build, conforme a ferramenta) e o estágio final é um Nginx que recebe só essa pasta. A imagem final não tem Node, nem node_modules, nem código-fonte.',
            'FROM node:22-slim AS build\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM nginx:stable\nCOPY --from=build /app/dist /usr/share/nginx/html'
          ),
          sl(
            'Python: base slim, variáveis de ambiente e cache de dependências',
            'Para Python a escolha padrão é python:3.12-slim (Debian reduzido, glibc, boa compatibilidade com pacotes pré-compilados). Duas variáveis são quase obrigatórias: PYTHONDONTWRITEBYTECODE=1 evita criar arquivos .pyc dentro da imagem e PYTHONUNBUFFERED=1 desliga o buffer da saída, de modo que os prints e logs aparecem na hora em docker logs (sem ela, podem demorar a aparecer). Como no Node, copie requirements.txt ANTES do código para aproveitar o cache, e instale com pip install --no-cache-dir: o cache de downloads do pip não tem utilidade na imagem e só a deixaria maior.',
            'FROM python:3.12-slim\nENV PYTHONDONTWRITEBYTECODE=1 \\\n    PYTHONUNBUFFERED=1\nWORKDIR /app\nCOPY requirements.txt ./\nRUN pip install --no-cache-dir -r requirements.txt\nCOPY . .'
          ),
          sl(
            'Python: venv em multi-stage e dependências com compilação nativa',
            'Alguns pacotes (drivers de banco, criptografia, ciência de dados) precisam compilar código C quando não há wheel pronta (wheel é o pacote pré-compilado do pip). Compilar exige gcc e cabeçalhos — o pacote build-essential do Debian — que NÃO devem ficar na imagem final. Solução: no estágio de build, instale build-essential, crie um ambiente virtual (venv) em um caminho fixo e instale as dependências nele; no estágio final, copie apenas esse venv e ponha o bin dele no PATH. Funciona porque os dois estágios usam a mesma base e o mesmo caminho. O compilador fica para trás.',
            'FROM python:3.12-slim AS build\nRUN apt-get update \\\n && apt-get install -y --no-install-recommends build-essential \\\n && rm -rf /var/lib/apt/lists/*\nRUN python -m venv /venv\nENV PATH="/venv/bin:$PATH"\nCOPY requirements.txt ./\nRUN pip install --no-cache-dir -r requirements.txt\n\nFROM python:3.12-slim\nCOPY --from=build /venv /venv\nENV PATH="/venv/bin:$PATH"'
          ),
          sl(
            'Python: usuário comum e servidor de produção',
            'Os servidores de desenvolvimento (flask run, python manage.py runserver, uvicorn --reload) não foram feitos para produção: pouca robustez e desempenho. Use um servidor de produção: gunicorn para apps WSGI/ASGI (Flask, Django), ou uvicorn sem --reload (FastAPI). Tal como no Node, escute em 0.0.0.0 — gunicorn recebe isso com -b 0.0.0.0:8000. E rode como usuário sem privilégios, criado com useradd e ativado com USER. A forma exec do CMD (lista) mantém o servidor como PID 1, recebendo os sinais.',
            'RUN useradd --system --no-create-home app\nUSER app\nCMD ["gunicorn", "-b", "0.0.0.0:8000", "app:app"]'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual a diferença essencial entre npm ci e npm install num Dockerfile?', 'c', [
          'npm ci instala também as devDependencies e o npm install nunca',
          'npm ci só funciona em imagens Alpine',
          'npm ci instala exatamente o que está no lockfile e falha se ele divergir do package.json; é mais reprodutível',
          'npm ci atualiza as versões para as mais novas'
        ], 'Em builds queremos o mesmo resultado sempre; npm ci respeita o lockfile e acusa inconsistências.'),
        mcq('q2', 'Por que CMD ["node", "server.js"] é preferível a CMD ["npm", "start"]?', 'a', [
          'Com node direto o app é o PID 1 e recebe SIGTERM; com npm start o sinal pode não chegar ao app',
          'Porque npm start não existe em produção',
          'Porque node direto usa menos memória do que qualquer outro comando',
          'Porque npm start publica a porta automaticamente'
        ], 'O npm como intermediário pode não repassar sinais ao processo filho, atrapalhando o encerramento gracioso.'),
        mcq('q3', 'Um app Node escuta em 127.0.0.1:3000 dentro do container e você usou -p 3000:3000. O que acontece?', 'd', [
          'Funciona normalmente, pois 127.0.0.1 é o host',
          'O Docker troca o endereço para 0.0.0.0 sozinho',
          'O container é encerrado ao iniciar',
          'A conexão vinda do host não funciona; o servidor deve escutar em 0.0.0.0 dentro do container'
        ], '127.0.0.1 dentro do container é o loopback do próprio container; o tráfego publicado chega por outra interface.'),
        fill('q4', 'Complete a flag que instala só as dependências de produção:', 'RUN npm ci --___=dev', ['omit'], '--omit=dev ignora as devDependencies, deixando a imagem final menor e com menos superfície de ataque.'),
        mcq('q5', 'No Dockerfile multi-stage de um front-end estático, o que contém a imagem final (Nginx)?\nFROM node:22-slim AS build\nRUN npm run build\nFROM nginx:stable\nCOPY --from=build /app/dist /usr/share/nginx/html', 'b', [
          'O Node, o node_modules e o código-fonte completo',
          'Apenas o Nginx e os arquivos estáticos gerados em dist',
          'Nada: COPY --from não funciona com Nginx',
          'Dois servidores: Node e Nginx'
        ], 'Só o resultado do build é copiado; ferramentas de build ficam no estágio anterior.'),
        mcq('q6', 'Para que serve ENV PYTHONUNBUFFERED=1 na imagem de uma app Python?', 'd', [
          'Impede que o Python grave arquivos .pyc',
          'Acelera o pip install',
          'Faz o Python rodar como root',
          'Desliga o buffer da saída, para logs e prints aparecerem na hora em docker logs'
        ], 'PYTHONDONTWRITEBYTECODE é a variável dos .pyc; PYTHONUNBUFFERED trata do buffer de saída.'),
        mcq('q7', 'Neste Dockerfile Python, o que chega à imagem final?\nFROM python:3.12-slim AS build\nRUN apt-get install -y build-essential\nRUN python -m venv /venv\nRUN /venv/bin/pip install --no-cache-dir -r requirements.txt\nFROM python:3.12-slim\nCOPY --from=build /venv /venv', 'a', [
          'O venv com as dependências instaladas, mas não o build-essential',
          'O build-essential e o venv',
          'Apenas o requirements.txt',
          'Nada, pois o venv fica no estágio build'
        ], 'COPY --from traz só /venv; o compilador instalado no primeiro estágio fica para trás.'),
        fill('q8', 'Complete o servidor de produção Python que escuta em todas as interfaces:', 'CMD ["___", "-b", "0.0.0.0:8000", "app:app"]', ['gunicorn'], 'gunicorn é um servidor de produção; -b define o endereço de escuta (0.0.0.0 para aceitar tráfego publicado).')
      ]
    },
    {
      id: 'cti-25-dockerfile-java-go-dotnet-php',
      title: 'Dockerfiles idiomáticos: Java, Go, .NET e PHP',
      goal: 'Aplicar multi-stage, cache e usuário comum nas stacks Java, Go, .NET e PHP, respeitando as particularidades de cada uma.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Java: JDK para construir, JRE para rodar',
            'O JDK inclui o compilador e as ferramentas de build; para executar um .jar basta o JRE. Multi-stage de novo: o estágio de build usa uma imagem com JDK e Maven (ou Gradle) e gera o JAR; o estágio final usa uma imagem só com JRE. O JAR "fat" (ou uber-jar) já leva dentro todas as dependências, então o runtime só precisa de java -jar. Para o cache: copie o pom.xml antes do código e baixe as dependências numa camada própria — assim elas só são baixadas de novo quando o pom muda. Alternativa com BuildKit: um cache mount no repositório local do Maven (~/.m2), que persiste entre builds sem entrar na imagem.',
            'FROM maven:3-eclipse-temurin-21 AS build\nWORKDIR /src\nCOPY pom.xml .\nRUN mvn -q dependency:go-offline\nCOPY src ./src\nRUN mvn -q package -DskipTests\n\n# alternativa: RUN --mount=type=cache,target=/root/.m2 mvn -q package'
          ),
          sl(
            'Java: camadas do Spring Boot, memória e inicialização',
            'Num JAR fat, qualquer mudança no código refaz uma camada enorme (dependências + código). O Spring Boot oferece um modo em camadas: o JAR é dividido em partes (dependências, que mudam pouco, e o seu código, que muda sempre), e o Dockerfile copia cada parte numa camada própria, para o cache reaproveitar as dependências. Visão geral: a ideia é a mesma de copiar o package.json antes. Sobre memória: as JVMs modernas enxergam o limite de memória do container (cgroup) e dimensionam o heap a partir dele; você ajusta a fração com -XX:MaxRAMPercentage. Deixe folga: além do heap a JVM usa memória fora dele, e passar do limite faz o container ser morto (OOM). A JVM também leva mais tempo para iniciar que um binário Go; isso importa com healthchecks (use start_period) e escalas rápidas.',
            'ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "/app.jar"]'
          ),
          sl(
            'Go: binário estático em imagem mínima',
            'Go gera um único binário. Com CGO_ENABLED=0 ele não depende da libc do sistema e roda em scratch (imagem vazia) ou distroless. -ldflags="-s -w" remove a tabela de símbolos e informações de depuração, reduzindo o binário (mas dificultando depuração). Atenção ao que a imagem mínima NÃO tem: sem certificados de CA, chamadas HTTPS a serviços externos falham — copie o ca-certificates.crt do estágio de build; sem banco de fusos horários, time.LoadLocation falha — copie /usr/share/zoneinfo (ou embuta os dados no próprio binário com o pacote time/tzdata).',
            'FROM golang:1.23 AS build\nWORKDIR /src\nCOPY go.mod go.sum ./\nRUN go mod download\nCOPY . .\nRUN CGO_ENABLED=0 go build -ldflags="-s -w" -o /out/app .\n\nFROM scratch\nCOPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/\nCOPY --from=build /usr/share/zoneinfo /usr/share/zoneinfo\nCOPY --from=build /out/app /app\nENTRYPOINT ["/app"]'
          ),
          sl(
            '.NET: SDK para publicar, aspnet para rodar',
            'A Microsoft mantém imagens separadas: sdk (compilador e ferramentas, para o build) e aspnet (somente o runtime do ASP.NET, para a imagem final). Para o cache, copie só o arquivo .csproj e rode dotnet restore (baixa os pacotes NuGet) ANTES de copiar o código; depois dotnet publish -c Release gera a saída otimizada. A porta padrão do ASP.NET mudou entre versões das imagens, então defina explicitamente com ASPNETCORE_URLS (http://+:8080 escuta em todas as interfaces na 8080). Portas acima de 1024 permitem rodar sem root. Crie/use um usuário comum com USER.',
            'FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build\nWORKDIR /src\nCOPY *.csproj ./\nRUN dotnet restore\nCOPY . .\nRUN dotnet publish -c Release -o /out\n\nFROM mcr.microsoft.com/dotnet/aspnet:9.0\nWORKDIR /app\nCOPY --from=build /out .\nENV ASPNETCORE_URLS=http://+:8080\nRUN useradd --system --no-create-home appuser\nUSER appuser\nENTRYPOINT ["dotnet", "App.dll"]'
          ),
          sl(
            'PHP: php-fpm e Nginx em containers separados',
            'PHP em produção costuma usar php-fpm (FastCGI Process Manager): um processo que executa os scripts PHP mas NÃO fala HTTP. Quem fala HTTP com o navegador é o Nginx, que repassa os arquivos .php ao php-fpm por FastCGI. Boa prática: um container para cada papel (um php:fpm e um nginx), na mesma rede do Compose, com o código acessível aos dois. Na configuração do Nginx, a diretiva fastcgi_pass aponta para o nome do serviço PHP e a porta do fpm (por padrão, 9000). Extensões do PHP (pdo_mysql, gd...) se instalam na imagem com docker-php-ext-install (e docker-php-ext-enable para extensões já compiladas).',
            'FROM php:fpm\nRUN docker-php-ext-install pdo_mysql\n\n# nginx.conf (trecho):\n#   location ~ \\.php$ {\n#     fastcgi_pass php:9000;\n#   }'
          ),
          sl(
            'PHP: Composer, permissões e volumes',
            'O Composer gerencia as dependências PHP. Padrão multi-stage: um estágio com a imagem do Composer roda composer install --no-dev (sem pacotes de desenvolvimento) e gera a pasta vendor; o estágio final copia só o vendor e o código. Permissões: o php-fpm roda como www-data, e pastas de escrita (storage, cache, uploads) precisam ser graváveis por ele — ajuste com chown/chmod na imagem ou no volume. Uploads e arquivos gerados pelo app devem ficar num volume, senão somem quando o container for recriado. Uploads de usuários podem conter dados pessoais: trate o volume como dado sensível.',
            'FROM composer:2 AS vendor\nWORKDIR /app\nCOPY composer.json composer.lock ./\nRUN composer install --no-dev --no-interaction\n\nFROM php:fpm\nCOPY --from=vendor /app/vendor /var/www/html/vendor\nCOPY . /var/www/html\nRUN chown -R www-data:www-data /var/www/html/storage'
          )
        ]
      },
      questions: [
        mcq('q1', 'Neste Dockerfile Java, qual a finalidade de copiar o pom.xml e rodar dependency:go-offline antes do COPY src?\nCOPY pom.xml .\nRUN mvn -q dependency:go-offline\nCOPY src ./src\nRUN mvn -q package', 'b', [
          'Compilar o código duas vezes, para garantir',
          'Baixar as dependências numa camada própria, que fica em cache enquanto o pom.xml não mudar',
          'Evitar que o Maven rode no estágio final',
          'Gerar o JAR fat'
        ], 'Mudar só o código não invalida a camada das dependências, como no truque do package.json.'),
        mcq('q2', 'Para limitar o heap da JVM a uma fração da memória do container, qual opção se usa?', 'd', [
          '-Xdocker=75',
          '--memory=75% na linha do java',
          'CGO_ENABLED=0',
          '-XX:MaxRAMPercentage=75.0, pois a JVM moderna respeita o limite do cgroup'
        ], 'MaxRAMPercentage define quanto da memória disponível (limite do container) o heap pode usar; sobra espaço para memória fora do heap.'),
        mcq('q3', 'Um app Go em FROM scratch falha ao chamar um serviço HTTPS externo. Qual a causa provável?', 'c', [
          'Go não suporta HTTPS',
          'O -ldflags="-s -w" desativa TLS',
          'A imagem scratch não tem certificados de CA; é preciso copiá-los do estágio de build',
          'scratch bloqueia toda a rede'
        ], 'scratch é vazia: sem certificados de CA, a validação TLS falha. O mesmo vale para o banco de fusos horários.'),
        fill('q4', 'Complete o comando que gera a saída otimizada de uma app .NET:', 'RUN dotnet ___ -c Release -o /out', ['publish'], 'dotnet publish compila em Release e reúne o que é preciso para rodar no diretório indicado.'),
        mcq('q5', 'Neste trecho .NET, por que dotnet restore vem antes do COPY . .?\nCOPY *.csproj ./\nRUN dotnet restore\nCOPY . .\nRUN dotnet publish -c Release -o /out', 'a', [
          'Para o download dos pacotes NuGet ficar numa camada em cache, refeita só quando o .csproj mudar',
          'Porque o restore só funciona antes do código existir',
          'Porque o publish exige restore em outro container',
          'Para apagar o .csproj depois'
        ], 'Mesma lógica das outras linguagens: dependências primeiro, código depois. A imagem sdk é só do build; a final usa aspnet.'),
        mcq('q6', 'Qual a relação entre Nginx e php-fpm numa stack PHP em containers?', 'c', [
          'O php-fpm serve HTTP direto ao navegador e o Nginx só guarda o código',
          'Ambos precisam estar no mesmo container, obrigatoriamente',
          'O Nginx fala HTTP com o cliente e repassa os .php ao php-fpm por FastCGI (fastcgi_pass nome-do-servico:9000)',
          'O Nginx compila o PHP'
        ], 'php-fpm não fala HTTP; o Nginx faz a ponte. Em containers separados, o nome do serviço é o endereço.'),
        mcq('q7', 'Qual o papel de composer install --no-dev num estágio de build?', 'b', [
          'Instalar todas as ferramentas de teste na imagem final',
          'Instalar só as dependências de produção na pasta vendor, que é copiada para a imagem final',
          'Atualizar o PHP para a última versão',
          'Criar o volume de uploads'
        ], '--no-dev dispensa pacotes de desenvolvimento; o estágio final recebe apenas o vendor pronto.'),
        fill('q8', 'Complete o utilitário das imagens PHP oficiais que instala extensões:', 'RUN docker-php-ext-___ pdo_mysql', ['install'], 'docker-php-ext-install compila e instala a extensão; docker-php-ext-enable apenas habilita as já disponíveis.')
      ]
    },
    {
      id: 'cti-04-buildkit',
      title: 'BuildKit e build avançado',
      goal: 'Usar cache mounts, secrets de build, ARG, buildx e multi-plataforma para builds rápidos e seguros.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'BuildKit: o motor de build atual',
            'BuildKit é o motor que executa docker build nas versões atuais do Docker (já é o padrão). Ele constrói estágios independentes em paralelo, pula estágios que ninguém usa, cacheia melhor e adiciona recursos novos dentro do Dockerfile, como as montagens temporárias de RUN --mount. Uma primeira linha opcional # syntax=docker/dockerfile:1 pede a sintaxe estável mais recente do Dockerfile.'
          ),
          sl(
            'Cache mounts: reaproveitar o cache do gerenciador de pacotes',
            'RUN --mount=type=cache,target=<pasta> monta uma pasta persistente entre builds, só durante aquele RUN. Ideal para o cache de downloads do pip, npm, apt, Maven: mesmo quando a camada precisa ser refeita (porque requirements.txt mudou), os pacotes já baixados não são baixados de novo. E o cache NÃO entra na imagem final — acelera sem engordar.',
            '# syntax=docker/dockerfile:1\nFROM python:3.12-slim\nCOPY requirements.txt .\nRUN --mount=type=cache,target=/root/.cache/pip \\\n    pip install -r requirements.txt'
          ),
          sl(
            'Secrets de build: usar sem gravar',
            'Às vezes o build precisa de uma credencial (um token para baixar pacote privado). Se você usar COPY, ENV ou ARG, o valor fica gravado nas camadas e aparece no docker history — vazou para sempre. Com RUN --mount=type=secret o segredo é montado como arquivo em /run/secrets/<id> apenas durante aquele RUN e não é salvo em nenhuma camada. Você o entrega no comando de build com --secret.',
            '# no Dockerfile\nRUN --mount=type=secret,id=npmtoken \\\n    NPM_TOKEN="$(cat /run/secrets/npmtoken)" npm ci\n\n# no build\ndocker build --secret id=npmtoken,src=./npmtoken.txt -t app:1.0 .'
          ),
          sl(
            'ARG e --build-arg',
            'ARG declara uma variável disponível só durante o build; o valor padrão vem do Dockerfile e pode ser trocado com --build-arg NOME=valor. Serve para parametrizar versões e flags. Atenção: ARGs ficam visíveis no docker history da imagem, então NUNCA coloque senhas ou tokens em ARG — para isso existem os secrets de build.',
            'ARG APP_VERSION=1.0\nLABEL org.opencontainers.image.version=$APP_VERSION\n\n# docker build --build-arg APP_VERSION=1.4.2 -t app .'
          ),
          sl(
            'buildx e multi-plataforma',
            'docker buildx é a interface completa do BuildKit. Uma imagem pode ser construída para várias arquiteturas de CPU (linux/amd64, linux/arm64) de uma vez, via --platform, resultando num manifesto único: quem puxa recebe automaticamente a variante da sua máquina. Útil para servidores ARM e notebooks com chip ARM. Construir várias plataformas pode exigir um builder dedicado (docker buildx create --use) e costuma terminar com --push, pois o resultado multi-arquitetura vive no registry.',
            'docker buildx create --use\ndocker buildx build --platform linux/amd64,linux/arm64 -t exemplo/app:1.0 --push .'
          ),
          sl(
            'bake e --progress',
            'docker buildx bake lê um arquivo (docker-bake.hcl ou o próprio Compose) que define vários alvos de build com seus parâmetros e constrói todos com um comando — bom para projetos com várias imagens. E --progress controla a saída do build: auto (padrão, painel resumido) ou plain (log completo, linha a linha), o melhor para descobrir por que um build falhou.',
            'docker buildx bake\ndocker build --progress=plain -t app .'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que um cache mount (RUN --mount=type=cache) faz?', 'a', [
          'Mantém uma pasta de cache (ex.: downloads do pip) entre builds sem incluí-la na imagem final',
          'Grava o cache dentro de cada camada da imagem',
          'Monta o disco do host dentro do container em produção',
          'Compartilha a imagem entre dois hosts'
        ], 'O cache persiste entre builds, mas só existe durante o RUN — a imagem não engorda.'),
        mcq('q2', 'Por que RUN --mount=type=secret é melhor que passar um token com ARG?', 'c', [
          'Porque é mais rápido de digitar',
          'Porque ARG não funciona com tokens',
          'Porque o segredo é montado só durante o RUN e não fica nas camadas nem no docker history',
          'Porque criptografa a imagem inteira'
        ], 'ARG e ENV gravam valores na imagem/metadados; o secret mount não deixa rastro nas camadas.'),
        mcq('q3', 'Qual afirmação sobre ARG está correta?', 'b', [
          'Fica disponível no container em execução e é seguro para senhas',
          'Existe só durante o build, mas aparece no docker history, então não serve para segredos',
          'É criptografado automaticamente pelo BuildKit',
          'Só pode ser definido dentro do Compose'
        ], 'ARG é para parametrizar o build; valores sensíveis devem usar secrets de build.'),
        fill('q4', 'Complete a flag que sobrescreve um ARG no momento do build:', 'docker build ___ APP_VERSION=1.4.2 -t app .', ['--build-arg'], '--build-arg NOME=valor substitui o valor padrão do ARG declarado no Dockerfile.'),
        mcq('q5', 'Neste trecho, onde o segredo "npmtoken" fica disponível e como ele é entregue?\nRUN --mount=type=secret,id=npmtoken cat /run/secrets/npmtoken', 'd', [
          'Na variável de ambiente NPMTOKEN, definida com ENV',
          'Em /etc/npmtoken, copiado com COPY',
          'No docker history, para auditoria',
          'Como arquivo em /run/secrets/npmtoken apenas durante o RUN, fornecido com docker build --secret id=npmtoken,src=...'
        ], 'O id liga o --mount ao --secret passado no comando de build; o arquivo some após o RUN.'),
        mcq('q6', 'O que docker buildx build --platform linux/amd64,linux/arm64 permite?', 'a', [
          'Gerar uma imagem para duas arquiteturas de CPU, de modo que cada máquina baixe a variante certa',
          'Rodar o container em dois hosts ao mesmo tempo',
          'Construir a imagem para Windows e Linux sem alterar nada',
          'Dobrar a velocidade do build'
        ], 'O registry guarda um manifesto com uma variante por plataforma.'),
        mcq('q7', 'Para que serve docker buildx bake?', 'c', [
          'Para assar (compactar) camadas em uma só',
          'Para publicar imagens sem login',
          'Para construir vários alvos definidos em um arquivo (docker-bake.hcl ou Compose) com um único comando',
          'Para escanear vulnerabilidades'
        ], 'bake descreve builds múltiplos de forma declarativa.'),
        fill('q8', 'Complete o valor que mostra o log completo do build, linha a linha:', 'docker build --progress=___ -t app .', ['plain'], '--progress=plain desativa o painel resumido e imprime todas as saídas — ótimo para depurar falhas.')
      ]
    },
    {
      id: 'cti-05-tags-registries',
      title: 'Tags, versionamento e registries',
      goal: 'Versionar imagens com semver, fixar por digest e enviar/baixar de registries com credenciais seguras.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Tags e semver',
            'Uma tag é um rótulo apontando para uma imagem (nome:tag). O versionamento semântico (semver) usa MAJOR.MINOR.PATCH: PATCH para correções compatíveis, MINOR para novidades compatíveis, MAJOR para mudanças que quebram compatibilidade. É comum publicar a mesma imagem com várias tags: 1.4.2, 1.4, 1 e talvez latest.',
            'docker build -t exemplo/app:1.4.2 .\ndocker tag exemplo/app:1.4.2 exemplo/app:1.4'
          ),
          sl(
            'Tags mutáveis vs imutáveis',
            'Uma tag é só um ponteiro e pode ser movida para outra imagem. latest, 1 e 1.4 são "mutáveis": hoje apontam para um conteúdo, amanhã para outro. Já uma tag completa como 1.4.2 é, por convenção, imutável (algumas registries podem impor isso). Para deploys previsíveis, use tags completas e nunca dependa de latest em produção.'
          ),
          sl(
            'Digest: identidade exata por conteúdo',
            'Todo conteúdo de imagem tem um digest, um hash sha256 do seu manifesto. Referenciar por digest (nome@sha256:...) aponta SEMPRE para exatamente aquele conteúdo — nenhuma tag movida muda isso. É a forma mais forte de fixar uma base ou uma versão de deploy. Veja o digest com docker images --digests.',
            'docker images --digests\ndocker pull nginx@sha256:<digest-completo>\n# FROM nginx:stable@sha256:<digest-completo>'
          ),
          sl(
            'docker tag, login, push e pull',
            'O nome completo é registry/namespace/repositório:tag; sem o host do registry, o Docker assume o Docker Hub. docker tag cria um novo nome para a MESMA imagem (não copia dados). docker login autentica; docker push envia; docker pull baixa. Para enviar a outro registry, a imagem precisa ter o nome com aquele host.',
            'docker tag app:1.4.2 ghcr.io/exemplo/app:1.4.2\ndocker push ghcr.io/exemplo/app:1.4.2\ndocker pull ghcr.io/exemplo/app:1.4.2'
          ),
          sl(
            'Registries e credenciais',
            'Registries comuns: Docker Hub (padrão), GitHub Container Registry (ghcr.io), Amazon ECR, Azure Container Registry (ACR) e os da Google Cloud (Artifact Registry/GCR). Registries privados exigem login. Use tokens de acesso com o MENOR escopo possível (um servidor que só baixa imagens recebe token só de leitura), nunca a senha da conta, e passe o token por stdin para não ficar no histórico do shell nem na lista de processos.',
            'echo "$REGISTRY_TOKEN" | docker login ghcr.io -u meu-usuario --password-stdin\n\n# PowerShell:\n# $env:REGISTRY_TOKEN | docker login ghcr.io -u meu-usuario --password-stdin'
          ),
          sl(
            'Retenção: não acumular imagens para sempre',
            'Cada push cria imagens novas e o registry cresce (custo e bagunça). Defina uma política de retenção: apagar imagens sem tag e builds antigos de branches temporárias, mas manter as versões de release que você pode precisar restaurar. Imagens antigas também carregam vulnerabilidades conhecidas — menos imagens velhas disponíveis, menos risco de alguém implantá-las por engano.'
          )
        ]
      },
      questions: [
        mcq('q1', 'No versionamento semântico, o que indica o número MAJOR na versão 2.4.1?', 'b', [
          'Correções de bugs compatíveis',
          'Mudanças que podem quebrar compatibilidade com versões anteriores',
          'O número de builds feitos',
          'A quantidade de camadas da imagem'
        ], 'MAJOR sobe com mudanças incompatíveis; MINOR com novidades compatíveis; PATCH com correções.'),
        mcq('q2', 'Por que tags como latest e 1.4 são consideradas mutáveis?', 'd', [
          'Porque o Docker as apaga após 24 horas',
          'Porque só funcionam em ambiente de desenvolvimento',
          'Porque são criptografadas',
          'Porque são apenas ponteiros que podem passar a apontar para outra imagem'
        ], 'Tags podem ser movidas; por isso latest não serve para deploys reprodutíveis.'),
        mcq('q3', 'O que garante que "nginx@sha256:..." sempre traga o mesmo conteúdo?', 'a', [
          'O digest é um hash do conteúdo (manifesto) da imagem; mudou o conteúdo, mudou o digest',
          'O Docker Hub bloqueia atualizações em digests',
          'O digest é só o número da versão',
          'O digest expira e é renovado'
        ], 'Referência por digest é endereçamento por conteúdo.'),
        fill('q4', 'Complete o comando que cria um novo nome para a mesma imagem (por exemplo, para enviá-la ao GHCR):', 'docker ___ app:1.0 ghcr.io/exemplo/app:1.0', ['tag'], 'docker tag adiciona outro nome/tag à imagem existente, sem copiar dados.'),
        mcq('q5', 'Por que usar "echo $TOKEN | docker login ... --password-stdin" em vez de --password "$TOKEN"?', 'c', [
          'Porque --password-stdin é mais rápido',
          'Porque --password não existe',
          'Para o token não ficar no histórico do shell nem visível na lista de processos',
          'Porque assim o token vira o nome da imagem'
        ], 'Passar segredos em argumentos de linha de comando os expõe; stdin evita isso.'),
        mcq('q6', 'Qual nome de imagem será enviado ao GitHub Container Registry?', 'b', [
          'exemplo/app:1.0',
          'ghcr.io/exemplo/app:1.0',
          'app:1.0',
          'registry/ghcr/app'
        ], 'O host do registry faz parte do nome; sem host, o Docker usa o Docker Hub.'),
        mcq('q7', 'Qual o sentido de uma política de retenção num registry?', 'd', [
          'Impedir novos pushes',
          'Criptografar as imagens antigas',
          'Duplicar cada imagem em dois registries',
          'Apagar imagens antigas ou sem tag, mantendo releases importantes, para reduzir custo e risco'
        ], 'Limpar o que não é mais necessário economiza espaço e evita implantar imagens obsoletas e vulneráveis.'),
        fill('q8', 'Complete o comando que envia a imagem ao registry:', 'docker ___ ghcr.io/exemplo/app:1.0', ['push'], 'docker push envia a imagem (após docker login) ao registry indicado no nome.')
      ]
    },
    {
      id: 'cti-06-compose-config',
      title: 'Compose avançado: variáveis e múltiplos arquivos',
      goal: 'Parametrizar o Compose com variáveis, .env e env_file e combinar arquivos para dev e produção.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Variáveis no arquivo: ${VAR}',
            'O Compose substitui ${NOME} no YAML pelo valor da variável de ambiente (ou do arquivo .env). Dá para definir um padrão com ${NOME:-padrão} (usado se a variável não existe ou está vazia) e exigir a variável com ${NOME:?mensagem} (o Compose aborta com a mensagem se faltar). Assim o mesmo compose.yaml serve em máquinas diferentes.',
            'services:\n  web:\n    image: exemplo/web:${TAG:-latest}\n    ports:\n      - "${PORT:-8080}:80"\n  db:\n    image: postgres:17\n    environment:\n      POSTGRES_PASSWORD: ${DB_PASSWORD:?defina DB_PASSWORD}'
          ),
          sl(
            '.env, env_file e environment: três coisas diferentes',
            'O arquivo .env (na pasta do projeto) alimenta a SUBSTITUIÇÃO ${...} do próprio YAML — ele não entra no container por si só. Já environment: define variáveis dentro do container, e env_file: carrega um arquivo inteiro de variáveis para dentro do container. Se a mesma variável existir no shell e no .env, o valor do shell vence.',
            'services:\n  api:\n    image: exemplo/api:1.0\n    env_file:\n      - .env.api\n    environment:\n      LOG_LEVEL: info'
          ),
          sl(
            'Mantenha os arquivos .env fora do Git',
            'Arquivos .env costumam conter senhas e tokens: coloque-os no .gitignore e jamais faça commit com valores reais. Versione apenas um .env.example com nomes de variáveis e valores fictícios, para quem clona o projeto saber o que preencher. Detalharemos segredos numa lição própria.',
            '# .gitignore\n.env\n.env.*\n!.env.example\n\n# .env.example\nDB_PASSWORD=troque-esta-senha\nPORT=8080'
          ),
          sl(
            'Vários arquivos com -f: o último vence',
            'Você pode passar vários arquivos: docker compose -f compose.yaml -f compose.prod.yaml up -d. Os arquivos são mesclados em ordem; valores do arquivo posterior sobrescrevem ou se somam aos do anterior (listas como ports são acrescentadas; valores simples são trocados). Um arquivo base mais um arquivo por ambiente evita copiar e colar.',
            'docker compose -f compose.yaml -f compose.prod.yaml up -d'
          ),
          sl(
            'compose.override.yaml',
            'Se você roda docker compose up sem -f, o Compose lê compose.yaml e, automaticamente, também compose.override.yaml, se existir. É o lugar ideal para ajustes de desenvolvimento (bind mount do código, porta de debug). Em produção, passe -f explicitamente apenas com os arquivos desejados — assim o override de dev não é carregado por acidente.',
            '# compose.override.yaml (só dev)\nservices:\n  api:\n    volumes:\n      - ./src:/app/src\n    ports:\n      - "9229:9229"'
          ),
          sl(
            'docker compose config: ver o resultado final',
            'docker compose config mostra o YAML FINAL, com variáveis já substituídas e arquivos mesclados — ótimo para conferir o que será realmente executado e achar erros de indentação ou variável faltando. Cuidado: ele imprime os valores reais, inclusive senhas; não cole essa saída em chats, issues nem logs de CI.',
            'docker compose config\ndocker compose -f compose.yaml -f compose.prod.yaml config'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que significa image: exemplo/web:${TAG:-latest}?', 'c', [
          'A tag é sempre "latest"',
          'O Compose falha se TAG não existir',
          'Usa o valor de TAG se existir e não for vazio; senão, usa latest',
          'TAG é uma pasta dentro da imagem'
        ], '${VAR:-padrão} fornece um valor padrão quando a variável não está definida ou está vazia.'),
        mcq('q2', 'Qual a diferença entre o arquivo .env e a chave env_file: no Compose?', 'a', [
          '.env alimenta a substituição ${...} no YAML; env_file carrega variáveis para dentro do container',
          'São idênticos',
          '.env só funciona em produção; env_file só em dev',
          '.env define volumes; env_file define redes'
        ], '.env é para interpolação do arquivo Compose; env_file injeta variáveis no ambiente do container.'),
        mcq('q3', 'No comando docker compose -f compose.yaml -f compose.prod.yaml up -d, quem prevalece em caso de conflito?', 'd', [
          'O compose.yaml, por ser o primeiro',
          'O arquivo com menos linhas',
          'Ocorre erro sempre que houver conflito',
          'O compose.prod.yaml, por vir depois'
        ], 'Os arquivos são mesclados em ordem e os posteriores sobrescrevem os anteriores.'),
        fill('q4', 'Complete o comando que imprime o Compose final, com variáveis substituídas e arquivos mesclados:', 'docker compose ___', ['config'], 'docker compose config valida e mostra a configuração resolvida.'),
        mcq('q5', 'Quando o compose.override.yaml é carregado automaticamente?', 'b', [
          'Sempre, inclusive com -f explícito',
          'Ao rodar docker compose sem -f, junto com o compose.yaml',
          'Somente se o nome do projeto for "override"',
          'Nunca; precisa ser sempre passado com -f'
        ], 'Sem -f, o Compose lê compose.yaml e compose.override.yaml. Com -f, só os arquivos informados.'),
        mcq('q6', 'O que faz POSTGRES_PASSWORD: ${DB_PASSWORD:?defina DB_PASSWORD}?', 'c', [
          'Define a senha padrão como "defina DB_PASSWORD"',
          'Ignora a variável se ela não existir',
          'Interrompe com a mensagem de erro se DB_PASSWORD não estiver definida',
          'Gera uma senha aleatória'
        ], '${VAR:?msg} torna a variável obrigatória e aborta com a mensagem se faltar.'),
        mcq('q7', 'Por que ter cuidado ao compartilhar a saída de docker compose config?', 'a', [
          'Porque ela mostra os valores reais das variáveis, inclusive senhas e tokens',
          'Porque apaga os containers',
          'Porque revela o código-fonte do app',
          'Porque reinicia os serviços'
        ], 'A configuração resolvida contém segredos já substituídos; trate-a como sensível.'),
        fill('q8', 'Complete a chave que carrega um arquivo de variáveis para dentro do container:', 'services:\n  api:\n    ___: .env.api', ['env_file'], 'env_file lê o arquivo e define cada linha como variável de ambiente do container.')
      ]
    },
    {
      id: 'cti-07-compose-organizacao',
      title: 'Compose avançado: profiles, restart, escala e watch',
      goal: 'Organizar projetos Compose com profiles, include/extends, políticas de restart, escala e visão geral do watch.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'profiles: serviços opcionais',
            'Nem todo serviço deve subir sempre (uma ferramenta de administração do banco, um serviço de depuração, testes). Marque-o com profiles: [nome]. Serviços SEM profile sobem sempre; serviços com profile só sobem se o profile for ativado com --profile nome (ou a variável COMPOSE_PROFILES).',
            'services:\n  api:\n    image: exemplo/api:1.0\n  adminer:\n    image: adminer\n    profiles: ["debug"]\n\n# docker compose up -d                  -> só a api\n# docker compose --profile debug up -d  -> api + adminer'
          ),
          sl(
            'Reaproveitar configuração: extends e include',
            'extends permite que um serviço herde a configuração de OUTRO serviço (do mesmo ou de outro arquivo), ajustando só o que muda — bom para evitar repetir blocos. include, no topo do arquivo, traz um Compose inteiro (com seus serviços, redes e volumes) para dentro do seu projeto — útil para dividir projetos grandes em partes ou reutilizar uma infraestrutura pronta. Ambos dependem de versões recentes do Compose v2.',
            '# extends\nservices:\n  worker:\n    extends:\n      file: base.yaml\n      service: app\n    command: ["node", "worker.js"]\n\n# include\ninclude:\n  - path: ./infra/compose.yaml'
          ),
          sl(
            'restart: o que fazer quando o processo sai',
            'restart define a política: no (padrão, nunca reinicia), always (sempre reinicia, inclusive ao subir o Docker), on-failure (só se sair com erro, com limite opcional on-failure:5) e unless-stopped (como always, mas não volta após você parar manualmente). Em serviços de longa duração, unless-stopped ou on-failure são escolhas comuns. Atenção: a política reage ao processo SAIR, não a "estar doente" (healthcheck vem na próxima lição).',
            'services:\n  api:\n    image: exemplo/api:1.0\n    restart: unless-stopped'
          ),
          sl(
            'Redes e volumes nomeados no topo do arquivo',
            'No topo do compose.yaml, as chaves networks e volumes declaram recursos nomeados que os serviços usam pelo nome. Um volume nomeado sobrevive a docker compose down (só é apagado com down -v), enquanto os containers e a rede padrão são removidos. Declarar redes explícitas permite segmentar o ambiente (próximas lições).',
            'services:\n  db:\n    image: postgres:17\n    volumes:\n      - dados:/var/lib/postgresql/data\n    networks: [backend]\n\nvolumes:\n  dados:\nnetworks:\n  backend:'
          ),
          sl(
            'up --build e --scale',
            'docker compose up --build reconstrói as imagens dos serviços que têm build: antes de subir (sem ele, o Compose reutiliza a imagem existente). docker compose up -d --scale web=3 cria 3 réplicas do serviço. Limite importante: réplicas não podem disputar a MESMA porta do host — um serviço com ports: "8080:80" ou com container_name fixo não escala; para isso, publique só o proxy e deixe as réplicas atrás dele.',
            'docker compose up -d --build\ndocker compose up -d --scale worker=3'
          ),
          sl(
            'compose watch: visão geral',
            'docker compose watch (ou up --watch) observa arquivos e age automaticamente conforme regras em develop.watch: sync copia o arquivo alterado para dentro do container em execução (sem rebuild), rebuild reconstrói e recria o serviço (ex.: quando package.json muda) e sync+restart copia e reinicia o processo. Voltaremos a ele na lição de Docker no desenvolvimento.',
            'services:\n  web:\n    build: .\n    develop:\n      watch:\n        - action: sync\n          path: ./src\n          target: /app/src\n        - action: rebuild\n          path: package.json'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que acontece com um serviço que tem profiles: ["debug"] ao rodar docker compose up -d (sem --profile)?', 'd', [
          'Sobe normalmente junto com os demais',
          'O Compose dá erro de configuração',
          'Sobe, mas sem rede',
          'Não sobe; só sobe se o profile debug for ativado'
        ], 'Serviços com profile só são iniciados quando o profile é habilitado.'),
        mcq('q2', 'O que faz restart: unless-stopped?', 'a', [
          'Reinicia o container se ele cair ou o Docker reiniciar, exceto se você o parou manualmente',
          'Nunca reinicia o container',
          'Reinicia apenas se você pedir com docker restart',
          'Reinicia só quando o healthcheck falha'
        ], 'unless-stopped lembra que você parou o container de propósito e não o religa.'),
        mcq('q3', 'Por que docker compose up --scale web=3 falha se o serviço web tem ports: ["8080:80"]?', 'c', [
          'Porque o Compose só permite uma réplica por projeto',
          'Porque a porta 80 está reservada',
          'Porque três containers não podem publicar a mesma porta 8080 do host',
          'Porque --scale só funciona com volumes'
        ], 'A porta do host é única. Réplicas devem ficar atrás de um proxy que publica a porta.'),
        fill('q4', 'Complete a chave que marca um serviço como opcional, ativado só por --profile:', 'services:\n  adminer:\n    image: adminer\n    ___: ["debug"]', ['profiles'], 'profiles associa o serviço a perfis que precisam ser ativados.'),
        mcq('q5', 'Qual a diferença geral entre include e extends?', 'b', [
          'extends traz projetos inteiros; include herda um serviço',
          'include traz um Compose inteiro para o projeto; extends herda a configuração de um serviço',
          'São sinônimos',
          'include só funciona com imagens do Docker Hub'
        ], 'include compõe arquivos Compose; extends reaproveita a definição de um serviço específico.'),
        mcq('q6', 'O que acontece com um volume nomeado ao rodar docker compose down (sem -v)?', 'b', [
          'É apagado junto com os containers',
          'Permanece; só é apagado com down -v ou removendo-o manualmente',
          'É movido para a pasta do projeto',
          'É convertido em bind mount'
        ], 'Volumes nomeados guardam dados e sobrevivem ao down comum, por segurança.'),
        mcq('q7', 'No compose watch, qual a diferença entre as ações sync e rebuild?', 'd', [
          'sync apaga o volume; rebuild o recria',
          'sync reinicia o host; rebuild reinicia o container',
          'São idênticas',
          'sync copia arquivos alterados para o container em execução; rebuild reconstrói a imagem e recria o serviço'
        ], 'sync é rápido (só copia); rebuild é necessário quando algo como dependências muda.'),
        fill('q8', 'Complete a flag que força o Compose a reconstruir as imagens antes de subir:', 'docker compose up -d ___', ['--build'], 'up --build reconstrói as imagens dos serviços com build: antes de iniciar.')
      ]
    },
    {
      id: 'cti-08-healthchecks',
      title: 'Healthchecks e ordem de inicialização',
      goal: 'Configurar healthchecks, interpretar estados e fazer um serviço esperar a dependência ficar saudável.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Rodando não é o mesmo que pronto',
            'Um container está "running" assim que o processo principal começa — mas o app pode ainda estar carregando, sem conexão com o banco, ou travado. Um healthcheck é um comando que o Docker executa periodicamente dentro do container para responder: "este serviço está realmente funcionando?". Código de saída 0 = saudável; 1 = não saudável.'
          ),
          sl(
            'HEALTHCHECK no Dockerfile e suas opções',
            'As opções ajustam o teste: --interval (de quanto em quanto tempo testar), --timeout (quanto esperar por uma resposta antes de contar falha), --retries (quantas falhas CONSECUTIVAS até marcar unhealthy) e --start-period (tempo de carência para o app iniciar: falhas nesse período não contam). O comando usado precisa existir dentro da imagem (um curl, um script, o próprio binário do app).',
            'HEALTHCHECK --interval=15s --timeout=3s --start-period=20s --retries=3 \\\n  CMD curl -f http://localhost:3000/health || exit 1'
          ),
          sl(
            'healthcheck no Compose',
            'No Compose o healthcheck também pode ser definido (ou sobrescrever o do Dockerfile) com as chaves test, interval, timeout, retries e start_period. test aceita a forma lista: ["CMD", ...] executa direto; ["CMD-SHELL", "..."] executa por um shell, permitindo pipes e ||. Para o PostgreSQL usa-se pg_isready.',
            'services:\n  db:\n    image: postgres:17\n    healthcheck:\n      test: ["CMD-SHELL", "pg_isready -U app -d appdb"]\n      interval: 5s\n      timeout: 3s\n      retries: 5\n      start_period: 10s'
          ),
          sl(
            'Estados: starting, healthy, unhealthy',
            'Durante o start_period (e até o primeiro sucesso) o estado é starting; depois do teste passar, healthy; após o número de falhas consecutivas definido em retries, unhealthy. docker ps mostra o estado entre parênteses no STATUS, e docker inspect traz o histórico dos últimos testes, incluindo a saída do comando.',
            'docker ps\n# STATUS: Up 2 minutes (healthy)\ndocker inspect --format "{{json .State.Health}}" meu-container'
          ),
          sl(
            'Esperar a dependência: depends_on com condition',
            'depends_on sozinho só controla a ORDEM de start (db é iniciado antes da api), não espera o banco ficar pronto. Com condition você escolhe o que esperar: service_started (padrão, só iniciou), service_healthy (o healthcheck da dependência está healthy) e service_completed_successfully (a dependência terminou com código 0 — ideal para migrations). Mesmo assim, o app deve tentar reconectar: bancos podem cair depois.',
            'services:\n  api:\n    image: exemplo/api:1.0\n    depends_on:\n      db:\n        condition: service_healthy\n  db:\n    image: postgres:17\n    healthcheck:\n      test: ["CMD-SHELL", "pg_isready -U app"]'
          ),
          sl(
            'Readiness vs liveness, e reiniciar por falha',
            'Dois conceitos (nomes do mundo Kubernetes): readiness = "posso receber tráfego agora?"; liveness = "ainda estou vivo ou preciso ser reiniciado?". O healthcheck do Docker marca o estado, mas o Docker comum NÃO reinicia automaticamente um container unhealthy: a política restart só reage ao processo sair. Quem age sobre unhealthy são orquestradores (Swarm, Kubernetes) ou ferramentas auxiliares. Para reiniciar por falha, faça o app sair com erro quando estiver irrecuperável e use restart.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que um container "running" pode não estar pronto para atender?', 'a', [
          'Porque running só indica que o processo principal iniciou; o app pode ainda estar carregando ou travado',
          'Porque running significa que o container foi apagado',
          'Porque o Docker só marca running quando o disco está cheio',
          'Porque running só vale para containers sem rede'
        ], 'O Docker sabe que o processo existe, não se ele está funcionando — daí os healthchecks.'),
        mcq('q2', 'Para que serve o start_period (ou --start-period) de um healthcheck?', 'c', [
          'Definir de quanto em quanto tempo o teste roda',
          'Definir o tempo máximo de uma resposta',
          'Dar carência ao app para iniciar: falhas nesse período não contam para as retries',
          'Definir quando o container será apagado'
        ], 'interval é a frequência, timeout é a espera por teste, start_period é a carência inicial.'),
        mcq('q3', 'Com interval: 10s e retries: 3, quando o container passa a unhealthy?', 'b', [
          'Na primeira falha',
          'Depois de 3 falhas consecutivas do teste',
          'Depois de 3 horas',
          'Nunca; unhealthy não existe no Docker'
        ], 'retries conta falhas consecutivas; um sucesso zera a contagem.'),
        fill('q4', 'Complete a condition para a api esperar o healthcheck do db:', 'depends_on:\n  db:\n    condition: ___', ['service_healthy'], 'service_healthy só libera a dependente quando o healthcheck da dependência está healthy.'),
        mcq('q5', 'O que acontece, no Docker comum, quando um container fica unhealthy e tem restart: always?', 'd', [
          'É reiniciado imediatamente pela política restart',
          'É apagado',
          'Passa a rodar com mais memória',
          'Continua rodando como unhealthy; restart só reage ao processo sair'
        ], 'Quem reinicia por unhealthy é um orquestrador ou ferramenta auxiliar, não a política restart.'),
        mcq('q6', 'No conceito readiness vs liveness, o que a readiness responde?', 'a', [
          'Se o serviço está pronto para receber tráfego agora',
          'Se o host tem espaço em disco',
          'Se a imagem foi assinada',
          'Se o container precisa de mais CPUs'
        ], 'Liveness: preciso reiniciar? Readiness: posso receber tráfego?'),
        mcq('q7', 'Qual o efeito de depends_on: [db] sem condition?', 'c', [
          'A api só inicia quando o banco aceita conexões',
          'O Compose cria um healthcheck automático',
          'Garante apenas a ordem de início dos containers, sem esperar o banco ficar pronto',
          'O banco é reiniciado a cada falha da api'
        ], 'O padrão é service_started: só espera o container iniciar.'),
        fill('q8', 'Complete a chave que define o comando do healthcheck no Compose:', 'healthcheck:\n  ___: ["CMD-SHELL", "pg_isready -U app"]', ['test'], 'test recebe o comando a executar; sai com 0 se saudável.')
      ]
    },
    {
      id: 'cti-09-redes-avancadas',
      title: 'Redes avançadas',
      goal: 'Segmentar serviços em redes, usar aliases e DNS, controlar a publicação de portas e conhecer host, macvlan e overlay.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'DNS embutido e aliases',
            'Em redes criadas pelo usuário (a rede padrão do Compose é uma delas), o Docker mantém um DNS interno: cada container é encontrado pelo nome do serviço, e os containers chamam uns aos outros assim (api conecta em db:5432, sem IP). Você ainda pode dar nomes extras a um serviço numa rede com aliases. Se um serviço tem várias réplicas, o nome resolve para os IPs delas, distribuindo as conexões.',
            'services:\n  db:\n    image: postgres:17\n    networks:\n      backend:\n        aliases:\n          - banco\n          - db-primario'
          ),
          sl(
            'Várias redes e segmentação frontend/backend',
            'Um serviço pode participar de várias redes, e containers só se enxergam se compartilham uma rede. Isso permite segmentar: o proxy fica na rede frontend; a api participa de frontend e backend; o banco fica SÓ em backend. Resultado: o proxy fala com a api, a api fala com o banco, mas o proxy não alcança o banco — se o proxy for comprometido, o banco não está ao alcance direto.',
            'services:\n  proxy:\n    networks: [frontend]\n  api:\n    networks: [frontend, backend]\n  db:\n    networks: [backend]\n\nnetworks:\n  frontend:\n  backend:'
          ),
          sl(
            'Publicar vs não publicar portas',
            'Publicar (ports / -p) abre uma porta do HOST para o container: é o que dá acesso a quem está fora do Docker. Dentro da mesma rede, containers conversam em qualquer porta onde o serviço escute, sem publicar nada. Portanto, publique só o necessário (o proxy) e nunca o banco. EXPOSE no Dockerfile apenas documenta a porta; não a publica.',
            'services:\n  api:\n    image: exemplo/api:1.0\n    ports:\n      - "8080:3000"   # host:container\n  db:\n    image: postgres:17   # sem ports: só acessível pela rede'
          ),
          sl(
            'Ligar a porta em um IP específico',
            'Por padrão, "8080:80" publica em todas as interfaces do host (0.0.0.0): qualquer máquina que alcance o host pode acessar. Prefixando um IP, você restringe: "127.0.0.1:8080:80" só aceita conexões da própria máquina. Isso é essencial para bancos e painéis administrativos acessados só localmente. No Linux, portas publicadas pelo Docker podem passar por cima de regras de firewall comuns como o ufw, então confiar só nelas não basta.',
            'docker run -d -p 127.0.0.1:5432:5432 postgres:17\n\n# Compose\nports:\n  - "127.0.0.1:5432:5432"'
          ),
          sl(
            '--network host e seus riscos',
            'Com --network host o container usa diretamente a pilha de rede do host: sem isolamento, sem NAT, sem -p; qualquer porta que o app abrir já está aberta no host (podendo conflitar com outros serviços e alcançar serviços que só escutam em localhost). Isso derruba a segmentação, então evite, salvo casos específicos (ex.: desempenho de rede ou protocolos especiais). No Docker Desktop o comportamento do modo host difere do Linux.',
            'docker run --rm --network host nginx'
          ),
          sl(
            'macvlan, ipvlan e overlay: visão geral',
            'macvlan e ipvlan dão ao container um endereço próprio na rede física, como se fosse uma máquina separada (útil para integrar com equipamentos que esperam um IP na LAN). overlay conecta containers de vários hosts em uma rede virtual única, usada por clusters (Swarm). Para a maioria dos projetos de um host só, redes bridge definidas pelo usuário bastam.'
          ),
          sl(
            'Rede interna e comunicação entre redes',
            'Uma rede marcada como internal (internal: true no Compose, --internal no docker network create) não tem saída para fora: os containers nela conversam entre si, mas não alcançam a internet nem recebem acesso externo. Ótima para o banco. Containers de redes diferentes só conversam se algum container estiver nas duas (como a api) ou se houver uma ligação explícita.',
            'networks:\n  backend:\n    internal: true\n\n# docker network create --internal privada'
          )
        ]
      },
      questions: [
        mcq('q1', 'Como a api alcança o banco usando "db:5432" em uma rede do Compose?', 'b', [
          'Pelo arquivo /etc/hosts do host, editado manualmente',
          'O DNS embutido do Docker resolve o nome do serviço para o IP do container na rede compartilhada',
          'Pela porta 5432 publicada no host, obrigatoriamente',
          'Pelo IP fixo que o Docker sempre dá ao primeiro container'
        ], 'Redes definidas pelo usuário têm DNS interno que resolve nomes de serviços e aliases.'),
        mcq('q2', 'Na segmentação proxy [frontend], api [frontend, backend], db [backend], o que é verdade?', 'd', [
          'O proxy acessa o banco diretamente',
          'O banco acessa a internet pelo proxy',
          'A api não consegue falar com ninguém',
          'O proxy não alcança o banco, pois não compartilham rede; a api alcança os dois'
        ], 'Containers só se enxergam se compartilham alguma rede. A api faz a ponte.'),
        mcq('q3', 'Neste Compose, o que é verdade?\nservices:\n  api:\n    ports: ["127.0.0.1:8080:3000"]\n    networks: [backend]\n  db:\n    image: postgres:17\n    networks: [backend]', 'a', [
          'A api só é acessível do host em 127.0.0.1:8080, e a api alcança o db por nome sem que o db publique portas',
          'O db está acessível de qualquer máquina na porta 5432',
          'A api é acessível por qualquer IP do host na porta 8080',
          'A api não consegue alcançar o db porque o db não tem ports'
        ], 'O prefixo 127.0.0.1 restringe ao loopback; a comunicação interna por rede não precisa de publicação.'),
        fill('q4', 'Complete o modo de rede em que o container compartilha a pilha de rede do host:', 'docker run --rm --network ___ nginx', ['host'], '--network host remove o isolamento de rede do container.'),
        mcq('q5', 'Qual o principal risco do --network host?', 'c', [
          'O container fica sem acesso à internet',
          'Os dados são apagados ao parar',
          'Não há isolamento de rede: portas do container ficam direto no host e podem conflitar ou alcançar serviços locais',
          'O Docker deixa de registrar logs'
        ], 'Perder a rede isolada significa perder a segmentação.'),
        mcq('q6', 'O que uma rede marcada com internal: true proporciona?', 'b', [
          'Maior velocidade de rede',
          'Containers conversam entre si, mas sem acesso à internet ou entrada externa',
          'Criptografia automática do tráfego',
          'Permite publicar portas sem limite'
        ], 'Redes internas isolam os containers do mundo externo — ideal para bancos.'),
        mcq('q7', 'Em visão geral, para que serve uma rede macvlan?', 'd', [
          'Conectar containers só na memória RAM',
          'Criar túneis VPN automaticamente',
          'Substituir o DNS embutido',
          'Dar ao container um endereço próprio na rede física, como se fosse outra máquina'
        ], 'macvlan/ipvlan integram o container à LAN; overlay conecta hosts de um cluster.'),
        fill('q8', 'Complete a chave que dá nomes extras a um serviço dentro de uma rede:', 'networks:\n  backend:\n    ___: [db-primario]', ['aliases'], 'aliases adiciona nomes DNS alternativos para o serviço naquela rede.')
      ]
    },
    {
      id: 'cti-10-volumes-dados',
      title: 'Volumes e dados em detalhe',
      goal: 'Escolher entre volume e bind mount, tratar permissões, fazer backup e restore e cuidar de dados pessoais.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Volume nomeado vs bind mount',
            'Volume nomeado: o Docker gerencia onde os dados ficam; é portátil entre máquinas e a escolha padrão para dados de aplicação (bancos). Bind mount: você mapeia uma pasta específica do host para dentro do container — ótimo para código em desenvolvimento ou arquivos de configuração. A sintaxe longa --mount é mais explícita: com bind mount ela dá erro se a pasta do host não existir, enquanto -v cria a pasta (como root) silenciosamente.',
            'docker run -v dados:/var/lib/postgresql/data postgres:17        # volume nomeado\ndocker run -v "$(pwd)/config:/etc/app:ro" exemplo/app            # bind mount\ndocker run --mount type=bind,src="$(pwd)/config",dst=/etc/app,readonly exemplo/app\n\n# PowerShell: troque $(pwd) por ${PWD}'
          ),
          sl(
            'Permissões: UID e GID',
            'O Linux controla acesso por números: UID e GID, não por nomes. Os arquivos de um bind mount mantêm o dono NUMÉRICO do host. Se o app roda como UID 1000 no container e a pasta pertence ao UID 0 (root) no host, ele não consegue escrever (erro "permission denied"). Soluções: ajustar o dono da pasta para o UID usado no container, ou rodar o container com --user "UID:GID" compatível. Evite "resolver" com chmod 777.',
            'docker run --user "$(id -u):$(id -g)" -v "$(pwd)/saida:/saida" exemplo/gerador'
          ),
          sl(
            'Somente leitura (:ro) e tmpfs',
            'Acrescentar :ro ao final da montagem torna o diretório somente leitura dentro do container — use sempre que o app só precisa ler (configurações, e na hora do backup). tmpfs monta um diretório em MEMÓRIA: rápido e some quando o container para, perfeito para temporários e dados que não devem tocar o disco. Ele combina bem com --read-only (lição de segurança).',
            'docker run --rm -v config:/etc/app:ro alpine ls /etc/app\ndocker run --rm --tmpfs /tmp alpine df /tmp'
          ),
          sl(
            'Backup e restore com container auxiliar',
            'Para copiar o conteúdo de um volume, suba um container descartável (--rm) que monte o volume e uma pasta do host, e empacote com tar. O restore faz o caminho inverso. Cuidado: copiar os arquivos de um banco em funcionamento pode gerar backup inconsistente — prefira a ferramenta do próprio banco (como pg_dump) ou pare o container antes. Teste o restore: backup que nunca foi restaurado é uma esperança.',
            '# backup\ndocker run --rm -v dados:/data:ro -v "$(pwd)":/backup alpine tar czf /backup/dados.tar.gz -C /data .\n\n# restore (volume vazio)\ndocker run --rm -v dados:/data -v "$(pwd)":/backup alpine tar xzf /backup/dados.tar.gz -C /data'
          ),
          sl(
            'Volume vazio vs populado',
            'Na primeira vez que um volume nomeado VAZIO é montado numa pasta que a imagem já tem com conteúdo, o Docker copia esse conteúdo para o volume. Um bind mount, ao contrário, esconde o que a imagem tinha naquela pasta, mostrando apenas a pasta do host. Dica prática: imagens de banco costumam rodar os scripts de inicialização só quando a pasta de dados está vazia; com o volume já populado, mudar o script de init não surte efeito.'
          ),
          sl(
            'Drivers de volume e dados pessoais (LGPD)',
            'Volumes aceitam drivers: o padrão (local) usa o disco do host, mas drivers de terceiros podem guardar em NFS, nuvem etc. — conceito útil para clusters. Quanto a dados pessoais (nome, CPF, e-mail, qualquer coisa que identifique alguém), um volume é um depósito: aplique a LGPD — colete só o necessário, defina por quanto tempo guardar, criptografe em repouso (disco ou volume criptografado) e proteja os backups com a mesma seriedade. Lembre que apagar a pessoa também exige apagar das cópias de backup dentro do prazo definido.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual a diferença essencial entre volume nomeado e bind mount?', 'c', [
          'O volume só funciona no Windows; o bind mount, no Linux',
          'O bind mount é sempre criptografado',
          'No volume nomeado o Docker gerencia o local; no bind mount você escolhe uma pasta específica do host',
          'Não há diferença'
        ], 'Volumes são gerenciados pelo Docker (ótimos para dados de app); bind mounts mapeiam pastas do host (ótimos para dev e configs).'),
        mcq('q2', 'O app roda como UID 1000 no container e a pasta montada pertence ao UID 0 no host. O que provavelmente ocorre ao escrever?', 'a', [
          'Erro de permissão negada, pois o Linux compara UIDs numéricos',
          'Funciona normalmente, pois o container é root',
          'O Docker converte o UID automaticamente',
          'A pasta é apagada'
        ], 'Permissões se baseiam no número do UID/GID; ajuste o dono da pasta ou use --user compatível.'),
        mcq('q3', 'Qual o papel de um driver de volume?', 'd', [
          'Instalar o Docker no host',
          'Compilar a imagem',
          'Definir a porta do volume',
          'Permitir guardar os dados do volume em outro tipo de armazenamento (NFS, nuvem etc.), em vez do disco local'
        ], 'O driver local é o padrão; drivers de terceiros ampliam onde os dados vivem.'),
        fill('q4', 'Complete a opção que monta um diretório em memória, que some quando o container para:', 'docker run --rm --___ /tmp alpine df /tmp', ['tmpfs'], '--tmpfs monta um sistema de arquivos em RAM, ideal para temporários.'),
        mcq('q5', 'O que faz o comando abaixo?\ndocker run --rm -v dados:/data:ro -v "$(pwd)":/backup alpine tar czf /backup/dados.tar.gz -C /data .', 'b', [
          'Restaura o volume dados a partir de dados.tar.gz',
          'Cria um backup compactado do volume dados na pasta atual do host, lendo o volume em modo somente leitura',
          'Apaga o volume dados',
          'Copia a pasta atual para dentro do volume dados'
        ], 'O volume é montado em /data (só leitura) e o tar grava o arquivo em /backup, que é a pasta atual do host.'),
        mcq('q6', 'O que acontece na primeira montagem de um volume nomeado vazio em uma pasta que a imagem já tem com conteúdo?', 'c', [
          'O conteúdo da imagem é apagado',
          'O container não inicia',
          'O Docker copia o conteúdo da imagem para o volume; um bind mount, ao contrário, esconderia esse conteúdo',
          'O volume vira somente leitura'
        ], 'Esse é o comportamento de populamento de volumes nomeados vazios; bind mounts sobrepõem a pasta.'),
        mcq('q7', 'Um volume guarda dados pessoais de clientes. Qual conjunto de práticas alinha com a LGPD?', 'a', [
          'Coletar só o necessário, definir prazo de retenção, criptografar em repouso e proteger/limpar também os backups',
          'Guardar tudo para sempre, sem criptografia, para facilitar',
          'Copiar os dados reais para o ambiente de desenvolvimento',
          'Deixar o volume com permissão 777'
        ], 'Minimização, retenção, criptografia e controle dos backups são pilares; dados reais não devem ir para dev.'),
        fill('q8', 'Complete o sufixo que deixa a montagem somente leitura dentro do container:', 'docker run --rm -v config:/etc/app:___ alpine ls /etc/app', ['ro'], ':ro impede escrita no diretório montado, reduzindo o dano em caso de falha ou invasão.')
      ]
    },
    {
      id: 'cti-26-bancos-em-containers',
      title: 'Bancos de dados em containers na prática',
      goal: 'Inicializar, conectar, fazer backup e atualizar bancos em containers com segurança e atenção à LGPD.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Variáveis de inicialização',
            'As imagens oficiais configuram o banco na PRIMEIRA subida por variáveis de ambiente. PostgreSQL: POSTGRES_PASSWORD (obrigatória; sem ela a imagem não inicia), POSTGRES_USER e POSTGRES_DB. MySQL/MariaDB: MYSQL_ROOT_PASSWORD, MYSQL_DATABASE, MYSQL_USER e MYSQL_PASSWORD. Detalhe importante: elas só valem quando o diretório de dados está vazio. Se o volume já tem dados, mudar a variável depois NÃO muda a senha nem recria o banco — a inicialização não roda de novo.',
            'services:\n  db:\n    image: postgres:16\n    environment:\n      POSTGRES_USER: app\n      POSTGRES_PASSWORD: senha-de-exemplo\n      POSTGRES_DB: appdb'
          ),
          sl(
            'Scripts em /docker-entrypoint-initdb.d e o caminho do volume',
            'Arquivos .sql e .sh colocados em /docker-entrypoint-initdb.d (normalmente via bind mount somente leitura) são executados em ordem alfabética na inicialização — e SÓ quando o diretório de dados está vazio, como as variáveis. Servem para criar tabelas e dados sintéticos iniciais. Os dados do banco ficam num diretório que muda por imagem; monte o volume nele: no PostgreSQL tradicionalmente /var/lib/postgresql/data (confira a documentação da sua versão da imagem), em MySQL/MariaDB /var/lib/mysql, em MongoDB /data/db. Montar o volume no caminho errado deixa os dados na camada gravável do container, que se perde ao recriá-lo.',
            '    volumes:\n      - db_data:/var/lib/postgresql/data\n      - ./init:/docker-entrypoint-initdb.d:ro'
          ),
          sl(
            'Healthcheck de banco e como conectar',
            'Container "running" não significa banco pronto para conexões. Use o utilitário da própria imagem como healthcheck: pg_isready no PostgreSQL e mysqladmin ping no MySQL/MariaDB; a api espera com depends_on e condition: service_healthy. Sobre endereços: de OUTRO container na mesma rede do Compose, use o nome do serviço e a porta interna (db:5432); localhost ali seria o próprio container da api. Do SEU host (cliente SQL no computador), use localhost e a porta publicada no lado esquerdo do mapeamento. Se o banco não precisa ser acessado do host, nem publique porta.',
            '    healthcheck:\n      test: ["CMD-SHELL", "pg_isready -U app -d appdb"]\n      interval: 5s\n      retries: 10\n    ports:\n      - "127.0.0.1:5433:5432"   # host: localhost:5433 | outros containers: db:5432'
          ),
          sl(
            'Backup lógico e restore',
            'Backup lógico é um arquivo com os comandos SQL (ou formato próprio) para recriar os dados: pg_dump no PostgreSQL, mysqldump no MySQL/MariaDB. Rode dentro do container com docker compose exec, usando -T (sem pseudo-terminal) quando redirecionar ou fizer pipe. O restore usa psql ou mysql lendo o arquivo. Cuidado no Windows: no PowerShell clássico, o operador > grava em UTF-16 por padrão e < não é suportado, o que corrompe dumps. Alternativas seguras: gerar o arquivo DENTRO do container (pg_dump -f) e copiar com docker compose cp, ou usar o cmd/um shell Linux (WSL).',
            'docker compose exec -T db pg_dump -U app appdb > backup.sql\ndocker compose exec -T db psql -U app appdb < backup.sql\n\n# alternativa sem redirecionamento do shell:\ndocker compose exec db pg_dump -U app -f /tmp/backup.sql appdb\ndocker compose cp db:/tmp/backup.sql ./backup.sql'
          ),
          sl(
            'Atualizar a versão major do banco',
            'Trocar a tag (postgres:15 para postgres:16) em cima do volume antigo não funciona: o formato dos arquivos de dados entre versões major é incompatível e o banco novo se recusa a iniciar (ou pior, você corre risco de perder dados). O caminho seguro: (1) faça dump com a versão antiga; (2) suba a versão nova com um volume NOVO e vazio; (3) restaure o dump; (4) valide; só então descarte o volume antigo. Existem ferramentas de upgrade in-place (como pg_upgrade), mais complexas. Atualizações minor dentro da mesma major, em geral, só trocam a imagem. Sempre faça backup antes e teste o procedimento fora de produção.'
          ),
          sl(
            'Segurança e LGPD',
            'Não exponha a porta do banco na internet: publicar "5432:5432" abre em todas as interfaces do host; prefira não publicar ou usar 127.0.0.1. Senhas fora do compose: as imagens aceitam variantes _FILE (POSTGRES_PASSWORD_FILE, MYSQL_ROOT_PASSWORD_FILE) apontando para um arquivo, como os de /run/secrets do Docker secrets. Em desenvolvimento e testes use dados SINTÉTICOS, nunca cópia da produção. E lembre: um dump é uma cópia completa dos dados — inclusive pessoais. Pela LGPD, backups também precisam de minimização, prazo de retenção definido (e descarte), criptografia e acesso restrito a quem precisa.',
            '    environment:\n      POSTGRES_PASSWORD_FILE: /run/secrets/db_password\n    secrets:\n      - db_password'
          )
        ]
      },
      questions: [
        mcq('q1', 'Você adicionou um script .sql em /docker-entrypoint-initdb.d, mas o volume do banco já tinha dados. O que acontece?', 'd', [
          'O script roda sempre, a cada subida do container',
          'O banco antigo é apagado e recriado',
          'O container recusa iniciar',
          'O script não roda: ele só é executado quando o diretório de dados está vazio'
        ], 'A inicialização (variáveis e scripts) acontece só na primeira subida, com o diretório de dados vazio.'),
        mcq('q2', 'Dado o trecho abaixo, como um container "api" na mesma rede se conecta ao banco, e como um cliente SQL na sua máquina?\n  db:\n    image: postgres:16\n    ports:\n      - "127.0.0.1:5433:5432"', 'b', [
          'api usa localhost:5433 e o cliente da máquina usa db:5432',
          'api usa db:5432 e o cliente da máquina usa localhost:5433',
          'Ambos usam db:5433',
          'Ambos usam localhost:5432'
        ], 'Entre containers vale o nome do serviço e a porta interna; do host vale a porta publicada.'),
        mcq('q3', 'Por que usar pg_isready (ou mysqladmin ping) como healthcheck do banco?', 'a', [
          'Porque o container pode estar em execução sem o banco já aceitar conexões; o teste confirma que está pronto',
          'Para criar um backup automático',
          'Para trocar a senha do banco',
          'Para publicar a porta do banco'
        ], 'running não é pronto; com condition: service_healthy a api só inicia depois do banco responder.'),
        fill('q4', 'Complete a ferramenta de backup lógico do PostgreSQL:', 'docker compose exec -T db ___ -U app appdb > backup.sql', ['pg_dump'], 'pg_dump gera o dump; o -T evita o pseudo-terminal ao redirecionar a saída. No PowerShell clássico prefira gerar o arquivo dentro do container e usar docker compose cp.'),
        mcq('q5', 'Qual a forma segura de passar de uma versão major do PostgreSQL para outra?', 'c', [
          'Apenas trocar a tag da imagem mantendo o volume antigo',
          'Apagar o volume e recomeçar sem backup',
          'Fazer dump na versão antiga, subir a nova com volume vazio, restaurar e validar',
          'Copiar os arquivos do volume para outra máquina'
        ], 'Os arquivos de dados são incompatíveis entre majors; dump/restore (ou ferramentas de upgrade) é o caminho.'),
        mcq('q6', 'Do ponto de vista da LGPD, como tratar um arquivo backup.sql de um banco com dados de clientes?', 'a', [
          'Como dado pessoal: retenção definida, criptografia e acesso restrito',
          'Como lixo técnico, sem regras, por ser apenas um arquivo',
          'Pode ser enviado a qualquer pessoa da equipe por e-mail',
          'Só importa se o banco estiver publicado na internet'
        ], 'O dump contém os mesmos dados pessoais do banco; minimização, prazo, criptografia e controle de acesso valem também para ele.'),
        mcq('q7', 'Qual a diferença de risco entre "5432:5432" e "127.0.0.1:5432:5432" em ports?', 'd', [
          'Nenhuma, são equivalentes',
          'O primeiro só aceita conexões locais',
          'O segundo desativa a senha do banco',
          'O primeiro publica em todas as interfaces do host (pode ficar acessível pela rede/internet); o segundo só no loopback'
        ], 'Sem IP, o Docker publica em todas as interfaces do host; com 127.0.0.1 só a própria máquina alcança.'),
        fill('q8', 'Complete o sufixo que faz a imagem ler a senha de um arquivo (ex.: de um secret):', 'POSTGRES_PASSWORD___: /run/secrets/db_password', ['_FILE', '_file'], 'A variante _FILE evita colocar a senha em texto no compose ou no ambiente.')
      ]
    },
    {
      id: 'cti-11-limites-recursos',
      title: 'Limites de recursos',
      goal: 'Limitar memória, CPU e processos, entender OOM kill (137) e monitorar o consumo.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que sempre limitar',
            'Sem limites, um container pode consumir toda a memória e CPU do host, derrubando os vizinhos (o efeito "vizinho barulhento"). Um vazamento de memória, um laço infinito ou uma fork bomb (processo que se multiplica sem parar) num único container viraria uma pane geral. Limites transformam essas falhas em problemas contidos: só aquele container sofre.'
          ),
          sl(
            'Memória: --memory e --memory-swap',
            '--memory define o teto de RAM (512m, 2g). Se o processo tentar ultrapassar, o kernel o mata (OOM kill). --memory-swap define o total de memória + swap permitido; quando é IGUAL a --memory, o container não usa swap. Defina o teto com folga acima do consumo normal medido, não um chute.',
            'docker run -d --memory 512m --memory-swap 512m exemplo/api:1.0'
          ),
          sl(
            'CPU, processos e ulimits',
            '--cpus 1.5 limita o container ao equivalente a 1,5 CPU de tempo de processamento. --pids-limit 200 limita o número de processos/threads: barra fork bombs. --ulimit ajusta limites do processo, como arquivos abertos (nofile), no formato soft:hard.',
            'docker run -d --cpus 1.5 --pids-limit 200 --ulimit nofile=1024:2048 exemplo/api:1.0'
          ),
          sl(
            'OOM kill e o código de saída 137',
            'Quando o container excede a memória e o kernel o encerra, ele sai com código 137 (128 + 9, de SIGKILL). 137 também aparece quando você usa docker kill ou quando o docker stop esgota o tempo e envia SIGKILL — por isso confirme com docker inspect: o campo OOMKilled indica se foi falta de memória. A reação certa é investigar o consumo (vazamento? limite baixo demais?), não apenas aumentar o limite.',
            'docker inspect --format "{{.State.OOMKilled}} {{.State.ExitCode}}" api\n# true 137'
          ),
          sl(
            'docker stats: consumo ao vivo',
            'docker stats mostra, em tempo real, CPU %, memória usada/limite, rede e I/O de cada container. Use para escolher limites realistas (observe sob carga) e para notar vazamentos (memória só sobe). Com --no-stream imprime uma vez só, bom para scripts.',
            'docker stats\ndocker stats --no-stream'
          ),
          sl(
            'Limites no Compose',
            'No Compose, escreva os limites junto do serviço. Formas simples: mem_limit, cpus e pids_limit. A forma deploy.resources.limits também é respeitada pelo docker compose atual e é a recomendada para declarar limites e reservas. Em ambos, valor ausente = sem limite.',
            'services:\n  api:\n    image: exemplo/api:1.0\n    pids_limit: 200\n    deploy:\n      resources:\n        limits:\n          cpus: "0.50"\n          memory: 512M'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual o principal motivo para sempre definir limites de recursos em containers?', 'b', [
          'Containers sem limite não iniciam',
          'Conter o dano: um container com vazamento ou laço infinito não derruba o host nem os vizinhos',
          'Deixar a imagem menor',
          'Aumentar a velocidade de download'
        ], 'Limites isolam falhas de consumo a um único container.'),
        mcq('q2', 'O que acontece quando --memory-swap tem o mesmo valor de --memory?', 'd', [
          'O container usa o dobro da memória',
          'O limite de memória é ignorado',
          'O container é reiniciado a cada minuto',
          'O container não pode usar swap'
        ], '--memory-swap é o total de memória + swap; sendo igual à memória, não sobra swap.'),
        mcq('q3', 'Um container saiu com código 137. Qual a melhor verificação para saber se foi falta de memória?', 'a', [
          'docker inspect e ver State.OOMKilled',
          'Reiniciar o Docker',
          'Apagar o volume',
          'Trocar a imagem por alpine'
        ], '137 é SIGKILL, que também vem de docker kill ou timeout do stop; OOMKilled=true confirma o OOM.'),
        fill('q4', 'Complete a flag que limita o container a 1,5 CPU:', 'docker run -d ___ 1.5 exemplo/api:1.0', ['--cpus'], '--cpus define o teto de tempo de CPU disponível ao container.'),
        mcq('q5', 'Qual limite barra uma fork bomb dentro do container?', 'c', [
          '--memory-swap',
          '--ulimit nofile',
          '--pids-limit',
          '--cpus'
        ], '--pids-limit restringe o número de processos/threads, impedindo multiplicação descontrolada.'),
        mcq('q6', 'Para que serve o docker stats?', 'b', [
          'Para ver o histórico de builds',
          'Para ver, ao vivo, CPU, memória, rede e I/O dos containers',
          'Para atualizar as imagens',
          'Para listar volumes sem uso'
        ], 'Ajuda a medir consumo real e escolher limites adequados.'),
        mcq('q7', 'O que o trecho abaixo define?\nservices:\n  api:\n    deploy:\n      resources:\n        limits:\n          cpus: "0.50"\n          memory: 512M', 'd', [
          'Reserva garantida de 512M para outros serviços',
          'O container deve usar sempre 0,5 CPU',
          'Que o serviço terá 512 processos',
          'Teto de meia CPU e 512 MB de memória para o serviço api'
        ], 'limits são tetos; ao passar do teto de memória, o container sofre OOM kill.'),
        fill('q8', 'Complete a flag que limita a 100 o número de processos (proteção contra fork bomb):', 'docker run -d ___ 100 exemplo/api:1.0', ['--pids-limit'], '--pids-limit limita processos e threads do container.')
      ]
    },
    {
      id: 'cti-12-pid1-sinais',
      title: 'PID 1, sinais e encerramento gracioso',
      goal: 'Garantir que o app receba SIGTERM e encerre direito, usando forma exec, exec "$@", init e STOPSIGNAL.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O processo principal é o PID 1',
            'Dentro do container, o processo iniciado por ENTRYPOINT/CMD é o PID 1 (primeiro processo do namespace). Quando ele termina, o container termina. O PID 1 tem duas peculiaridades no Linux: sinais SEM um tratador instalado pelo programa são ignorados (o comportamento padrão de "encerrar" não vale para ele) e ele é responsável por "colher" processos filhos órfãos. Um app que não trata SIGTERM pode simplesmente ignorar o pedido de parada.'
          ),
          sl(
            'docker stop: SIGTERM, espera, SIGKILL',
            'docker stop envia SIGTERM ao PID 1 e espera (10 segundos por padrão); se o processo não encerrar, envia SIGKILL, que mata sem chance de limpeza (conexões cortadas, gravações incompletas) e resulta em código 137. Você pode mudar a espera com -t / --time, e no Compose com stop_grace_period. Encerramento gracioso = tratar SIGTERM, terminar requisições em andamento, fechar conexões e sair.',
            'docker stop -t 30 api\n\n# Compose\nservices:\n  api:\n    stop_grace_period: 30s'
          ),
          sl(
            'Forma exec vs forma shell',
            'Forma shell (CMD npm start) vira /bin/sh -c "npm start": o PID 1 é o sh, não o seu app, e muitos shells não repassam o SIGTERM ao filho — o stop espera o timeout e acaba em SIGKILL. Forma exec (CMD ["npm", "start"] ou melhor, CMD ["node", "server.js"]) executa o programa direto como PID 1, que recebe os sinais. Prefira sempre a forma exec (lista JSON, com aspas duplas).',
            '# ruim: o sh é o PID 1\nCMD node server.js\n\n# bom: o node é o PID 1\nCMD ["node", "server.js"]'
          ),
          sl(
            'Scripts de entrypoint: exec "$@"',
            'Muitos containers usam um script de entrada para preparar o ambiente (gerar config, esperar algo) e só depois iniciar o app. Se o script termina com o comando "cru", o shell continua sendo o PID 1 e o app vira filho. Termine com exec "$@": exec SUBSTITUI o processo do shell pelo comando recebido (o CMD), que passa a ser o PID 1 e recebe os sinais.',
            '#!/bin/sh\nset -e\n# ...preparação...\nexec "$@"\n\n# Dockerfile\nENTRYPOINT ["./entrypoint.sh"]\nCMD ["node", "server.js"]'
          ),
          sl(
            '--init, tini e processos zumbis',
            'Quando um processo filho termina, o pai precisa "colher" seu status; filhos que ficam sem essa colheita viram zumbis (ocupam entrada na tabela de processos). Se o PID 1 é um app que cria subprocessos e não os colhe, zumbis se acumulam. docker run --init (ou init: true no Compose) coloca um mini init (tini) como PID 1: ele repassa sinais ao seu app e colhe os órfãos. Barato e útil quando o app cria subprocessos.',
            'docker run --init exemplo/app\n\n# Compose\nservices:\n  app:\n    init: true'
          ),
          sl(
            'STOPSIGNAL',
            'Nem todo programa encerra graciosamente com SIGTERM: alguns usam outro sinal (o Nginx faz o encerramento gracioso com SIGQUIT). A instrução STOPSIGNAL do Dockerfile (ou stop_signal no Compose) muda o sinal que docker stop envia primeiro. O timeout e o SIGKILL final continuam valendo.',
            'STOPSIGNAL SIGQUIT'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que um app pode "ignorar" docker stop quando é o PID 1?', 'c', [
          'Porque docker stop só funciona em containers sem volumes',
          'Porque o PID 1 não pode receber sinais de jeito nenhum',
          'Porque sinais sem tratador instalado pelo programa são ignorados pelo PID 1, então o app precisa tratar SIGTERM',
          'Porque o Docker envia SIGSTOP'
        ], 'O kernel não aplica a ação padrão de encerrar ao PID 1; o app precisa registrar tratador para SIGTERM.'),
        mcq('q2', 'O que o docker stop faz, por padrão?', 'a', [
          'Envia SIGTERM, espera um tempo (10 s) e, se o processo não sair, envia SIGKILL',
          'Envia SIGKILL imediatamente',
          'Pausa o container sem enviar sinais',
          'Apaga o container e a imagem'
        ], 'O prazo é ajustável com -t. O SIGKILL final resulta em código 137.'),
        mcq('q3', 'Qual forma de CMD faz o node receber o SIGTERM como PID 1?', 'd', [
          'CMD node server.js',
          'CMD /bin/sh -c "node server.js"',
          'CMD npm run start >> log.txt',
          'CMD ["node", "server.js"]'
        ], 'A forma exec executa o programa direto; a forma shell coloca um sh como PID 1.'),
        fill('q4', 'Complete o comando que substitui o shell do script pelo comando recebido, para ele virar o PID 1:', '#!/bin/sh\nset -e\n___ "$@"', ['exec'], 'exec substitui o processo do shell; sem ele, o shell fica como PID 1 e pode não repassar sinais.'),
        mcq('q5', 'Para que serve docker run --init?', 'b', [
          'Para reiniciar o container a cada hora',
          'Para colocar um mini init (tini) como PID 1, que repassa sinais e colhe processos zumbis',
          'Para criar um volume de inicialização',
          'Para rodar o container como root'
        ], 'O init cuida dos sinais e da colheita de órfãos para o app.'),
        mcq('q6', 'O que faz a instrução STOPSIGNAL SIGQUIT?', 'c', [
          'Impede o container de ser parado',
          'Reinicia o container ao receber SIGQUIT',
          'Altera o sinal que o docker stop envia primeiro ao PID 1',
          'Envia SIGQUIT ao host'
        ], 'Útil para programas cujo encerramento gracioso usa um sinal diferente de SIGTERM.'),
        mcq('q7', 'Qual o problema deste entrypoint?\n#!/bin/sh\nset -e\nsleep 2\nnode server.js', 'a', [
          'Falta exec: o shell continua PID 1 e o node vira filho, podendo não receber o SIGTERM',
          'O sleep não funciona em containers',
          'set -e é proibido',
          'O node não pode rodar dentro de scripts'
        ], 'Termine com exec node server.js (ou exec "$@") para que o app seja o PID 1.'),
        fill('q8', 'Complete a flag que define para 30 segundos o prazo do docker stop antes do SIGKILL:', 'docker stop ___ 30 api', ['-t', '--time'], 'docker stop -t SEGUNDOS (ou --time) altera o tempo de espera antes do SIGKILL.')
      ]
    },
    {
      id: 'cti-13-logs-monitoramento',
      title: 'Logs e monitoramento básico',
      goal: 'Ler e rotacionar logs, observar eventos e consumo e manter dados pessoais fora dos logs.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Logs vão para stdout e stderr',
            'No mundo de containers, o app deve escrever seus logs na saída padrão (stdout) e de erro (stderr), não em arquivos dentro do container. O Docker captura esses fluxos e os entrega ao driver de log. docker logs lê o que foi capturado: -f acompanha em tempo real, --tail N mostra as últimas N linhas, --since 10m limita ao período, -t inclui horário. Em imagens como a do Nginx, os arquivos de log são ligados ao stdout/stderr exatamente por isso.',
            'docker logs -f --tail 100 api\ndocker logs --since 10m -t api'
          ),
          sl(
            'Drivers de log',
            'O driver de log decide para onde vão os logs capturados. O padrão é json-file (arquivos JSON no disco do host). Existem outros — local (formato otimizado, com rotação por padrão), journald, syslog, fluentd, gelf — que enviam a sistemas centralizados. Você escolhe por container (--log-driver) ou como padrão do daemon.'
          ),
          sl(
            'Rotação: não deixe o disco encher',
            'O json-file, por padrão, NÃO tem limite de tamanho: um container muito falante pode encher o disco do host e derrubar tudo. Configure max-size (tamanho de cada arquivo) e max-file (quantos arquivos guardar). Assim os logs mais antigos são descartados automaticamente. Faça isso por container ou como padrão em daemon.json.',
            'docker run -d --log-opt max-size=10m --log-opt max-file=3 exemplo/api:1.0\n\n# Compose\nservices:\n  api:\n    logging:\n      driver: json-file\n      options:\n        max-size: "10m"\n        max-file: "3"'
          ),
          sl(
            'docker events e docker stats',
            'docker events é um fluxo de acontecimentos do Docker em tempo real: container start, die, oom, health_status, network connect... Com ele você descobre QUANDO e POR QUE algo mudou (por exemplo, um die com exitCode=137 junto de um oom). docker stats mostra o consumo ao vivo de CPU, memória, rede e disco por container.',
            'docker events --filter event=die --filter event=oom\ndocker stats --no-stream'
          ),
          sl(
            'Monitoramento de verdade: cAdvisor, Prometheus e Grafana',
            'Para acompanhar ao longo do tempo você precisa guardar e visualizar métricas. Combinação clássica: cAdvisor expõe métricas dos containers; Prometheus coleta e armazena essas métricas em série temporal; Grafana desenha painéis e alertas. Cada um roda como container, tipicamente no mesmo Compose. É uma visão geral — o essencial é saber que o consumo histórico e os alertas vêm dessa camada, não do docker stats.'
          ),
          sl(
            'Logs estruturados e LGPD',
            'Logs estruturados (uma linha JSON por evento, com campos como nível, mensagem e id da requisição) são mais fáceis de filtrar e buscar que texto livre. E atenção à LGPD: log é um lugar onde dados pessoais vazam sem querer. NÃO registre CPF, e-mail, telefone, endereço, senhas, tokens ou corpo de requisições com esses dados. Registre identificadores opacos (id de usuário interno), mascare o que for inevitável e defina retenção curta (a rotação ajuda).',
            '{"nivel":"info","msg":"pedido criado","pedido_id":4821,"usuario_id":"u_77"}\n\n// evite: {"msg":"login","email":"maria@exemplo.com","senha":"..."}'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual a abordagem recomendada para logs de aplicações em containers?', 'b', [
          'Gravar em arquivos dentro do container e apagá-los ao parar',
          'Escrever em stdout/stderr (de preferência estruturados em JSON) para o Docker capturar e entregar ao driver de log',
          'Enviar logs por e-mail a cada linha',
          'Não registrar logs'
        ], 'O Docker captura stdout/stderr; formatos estruturados facilitam busca e análise.'),
        mcq('q2', 'Qual o risco do driver json-file com a configuração padrão?', 'a', [
          'Sem rotação, os arquivos de log podem crescer sem limite e encher o disco do host',
          'Ele criptografa os logs e perde a chave',
          'Ele apaga os logs a cada minuto',
          'Ele só funciona com Compose'
        ], 'Configure max-size e max-file para limitar o espaço usado.'),
        mcq('q3', 'O que faz este trecho?\nlogging:\n  driver: json-file\n  options:\n    max-size: "10m"\n    max-file: "3"', 'd', [
          'Limita o container a 3 CPUs e 10 MB de RAM',
          'Cria 3 réplicas do container',
          'Envia os logs para 3 servidores',
          'Mantém no máximo 3 arquivos de log de até 10 MB cada, descartando os mais antigos'
        ], 'max-size limita cada arquivo e max-file limita quantos são mantidos (rotação).'),
        fill('q4', 'Complete a flag que acompanha os logs em tempo real:', 'docker logs ___ --tail 100 api', ['-f', '--follow'], 'docker logs -f segue o fluxo de logs, como tail -f.'),
        mcq('q5', 'O que o docker events mostra?', 'c', [
          'O histórico de commits da imagem',
          'Os logs da aplicação',
          'Acontecimentos do Docker em tempo real, como start, die, oom e health_status',
          'Somente o consumo de memória'
        ], 'Útil para descobrir quando e por que um container caiu ou mudou de estado.'),
        mcq('q6', 'Qual a divisão de papéis em cAdvisor + Prometheus + Grafana?', 'b', [
          'cAdvisor desenha gráficos; Grafana coleta; Prometheus gera logs',
          'cAdvisor expõe métricas dos containers; Prometheus coleta e armazena; Grafana visualiza e alerta',
          'Os três servem apenas para build de imagens',
          'Prometheus e Grafana substituem o Docker'
        ], 'É a pilha clássica de monitoramento de métricas de containers.'),
        mcq('q7', 'Qual prática de logging está alinhada à LGPD?', 'd', [
          'Registrar o corpo completo das requisições, para facilitar o suporte',
          'Guardar logs com e-mails e CPFs por tempo indeterminado',
          'Registrar senhas para diagnosticar falhas de login',
          'Registrar identificadores opacos, nunca dados pessoais ou segredos, e manter retenção curta com rotação'
        ], 'Logs não devem conter dados pessoais ou segredos; minimização e retenção curta reduzem risco.'),
        fill('q8', 'Complete a opção que define o tamanho máximo de cada arquivo de log:', 'docker run -d --log-opt ___=10m exemplo/api:1.0', ['max-size'], 'max-size (junto com max-file) ativa a rotação de logs do json-file.')
      ]
    },
    {
      id: 'cti-14-seguranca-containers',
      title: 'Segurança básica de containers',
      goal: 'Aplicar mínimo privilégio: usuário não-root, read-only, capabilities, no-new-privileges e imagens confiáveis e escaneadas.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Rode como usuário não-root',
            'Containers compartilham o kernel do host. Se o processo é root dentro do container e uma falha permite escapar, o atacante chega ao host com poder máximo. Rodar como usuário comum limita o estrago: crie o usuário no Dockerfile e use USER (ou --user no run). Imagens oficiais costumam trazer um usuário pronto (como "node"). Lembre de ajustar permissões de pastas onde o app precisa escrever.',
            'FROM node:22-alpine\nWORKDIR /app\nCOPY --chown=node:node . .\nUSER node\nCMD ["node", "server.js"]'
          ),
          sl(
            'Sistema de arquivos somente leitura',
            '--read-only monta o sistema de arquivos raiz do container como leitura: se um invasor conseguir executar código, não consegue gravar binários nem alterar o app. Como muitos apps precisam de uma pasta temporária, combine com --tmpfs /tmp (em memória) e com volumes só onde há necessidade real de gravar.',
            'docker run --read-only --tmpfs /tmp -v dados:/app/dados exemplo/app:1.0'
          ),
          sl(
            'Capabilities: o poder do root em pedaços',
            'O Linux divide os poderes do root em "capabilities" (abrir portas baixas, mudar dono de arquivo, mexer na rede...). Por padrão o Docker concede um conjunto reduzido. Aplique o mínimo privilégio: remova tudo com --cap-drop ALL e devolva só o que o app realmente precisa com --cap-add. Muitos apps não precisam de nenhuma (portas acima de 1024 dispensam NET_BIND_SERVICE).',
            'docker run --cap-drop ALL --cap-add NET_BIND_SERVICE exemplo/web:1.0'
          ),
          sl(
            'no-new-privileges',
            '--security-opt no-new-privileges:true impede que processos dentro do container ganhem privilégios novos (por exemplo, via binários setuid). É uma trava barata que bloqueia escaladas simples e raramente causa problemas.',
            'docker run --security-opt no-new-privileges:true exemplo/app:1.0'
          ),
          sl(
            'Nunca --privileged; cuidado com o docker.sock',
            '--privileged desliga quase todas as barreiras: o container ganha acesso a dispositivos do host e a todas as capabilities — na prática, quase um root do host. Evite sempre. Outra armadilha comum: montar /var/run/docker.sock dentro do container. Esse socket é a API do Docker; quem o controla pode criar containers privilegiados e ler o host — equivale a dar root do host ao container. Só monte com plena consciência (e prefira alternativas).',
            '# PERIGOSO: evite\ndocker run -v /var/run/docker.sock:/var/run/docker.sock exemplo/ferramenta\ndocker run --privileged exemplo/app'
          ),
          sl(
            'Imagens confiáveis, escaneamento e atualização',
            'Prefira imagens oficiais ou de publicadores verificados do Docker Hub, com tag fixa, e desconfie de imagens aleatórias. Escaneie suas imagens em busca de vulnerabilidades conhecidas com ferramentas como Trivy ou Docker Scout: elas listam pacotes vulneráveis e a gravidade. Vulnerabilidades surgem com o tempo, então atualize a base e RECONSTRUA as imagens com regularidade, não só quando o código muda.',
            'trivy image exemplo/app:1.0\ndocker scout cves exemplo/app:1.0'
          ),
          sl(
            'Juntando tudo no Compose',
            'As mesmas travas existem no Compose: user, read_only, cap_drop, security_opt e tmpfs. Aplicar esse conjunto por padrão e relaxar só o que um serviço comprovadamente precisa é a forma saudável de endurecer sem quebrar tudo.',
            'services:\n  api:\n    image: exemplo/api:1.0\n    user: "1000:1000"\n    read_only: true\n    tmpfs: ["/tmp"]\n    cap_drop: ["ALL"]\n    security_opt:\n      - no-new-privileges:true'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que rodar o processo como usuário não-root é recomendado?', 'c', [
          'Porque root não pode abrir arquivos',
          'Porque deixa o container mais rápido',
          'Para limitar o estrago se o app for comprometido ou houver escape para o host',
          'Porque o Docker exige'
        ], 'Menos privilégio dentro do container significa menos poder para um invasor.'),
        mcq('q2', 'O que --read-only faz e como contornar a necessidade de gravar em /tmp?', 'a', [
          'Torna o sistema de arquivos raiz somente leitura; use --tmpfs /tmp e volumes só onde precisar gravar',
          'Impede o container de ler arquivos',
          'Desativa a rede',
          'Apaga o /tmp'
        ], 'read-only protege o app de alterações; tmpfs e volumes cobrem os pontos de escrita legítimos.'),
        mcq('q3', 'Por que evitar --privileged?', 'd', [
          'Porque aumenta o tamanho da imagem',
          'Porque desativa o cache',
          'Porque impede logs',
          'Porque dá ao container acesso a dispositivos e capabilities do host, quase um root do host'
        ], '--privileged derruba as principais barreiras de isolamento.'),
        fill('q4', 'Complete o valor que remove todas as capabilities do container (depois adiciona-se só as necessárias):', 'docker run --cap-drop ___ exemplo/app:1.0', ['ALL'], '--cap-drop ALL remove todas as capabilities; --cap-add devolve só as necessárias.'),
        mcq('q5', 'Qual o risco de montar /var/run/docker.sock dentro de um container?', 'b', [
          'Nenhum, é só um arquivo de log',
          'Quem controla o container controla o daemon do Docker, o que equivale a root no host',
          'O socket só funciona uma vez',
          'O container perde a rede'
        ], 'O socket é a API do Docker: permite criar containers privilegiados e acessar o host.'),
        mcq('q6', 'Qual escolha de imagem é mais segura?', 'c', [
          'Qualquer imagem popular encontrada em um blog, com tag latest',
          'Uma imagem sem dono identificado que "funciona"',
          'Uma imagem oficial ou de publicador verificado, com tag fixa, e mantida atualizada',
          'A imagem mais antiga, por ser mais testada'
        ], 'Origem confiável, versão fixa e atualização frequente reduzem riscos de cadeia de suprimentos.'),
        mcq('q7', 'Para que servem Trivy e Docker Scout, e o que fazer com o resultado?', 'a', [
          'Escaneiam imagens atrás de vulnerabilidades conhecidas; atualize a base/dependências e reconstrua a imagem',
          'Aceleram o download de imagens',
          'Criptografam volumes',
          'Substituem o Dockerfile'
        ], 'Scanners listam CVEs em pacotes; a correção costuma ser atualizar e reconstruir.'),
        fill('q8', 'Complete a opção de segurança que impede ganho de novos privilégios no container:', 'docker run --security-opt ___:true exemplo/app:1.0', ['no-new-privileges'], 'no-new-privileges bloqueia escalada via binários setuid e similares.')
      ]
    },
    {
      id: 'cti-15-segredos-config',
      title: 'Segredos e configuração',
      goal: 'Separar configuração e segredos do código e da imagem, usar Compose secrets e agir se um segredo vazar.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Configuração fora do código (12-factor)',
            'O princípio do 12-factor app: configuração que muda entre ambientes (endereço do banco, chaves, modo de log) fica FORA do código e da imagem, vinda do ambiente. Assim a MESMA imagem roda em dev, homologação e produção, mudando só a configuração injetada. Em Compose isso vira variáveis, env_file e arquivos específicos por ambiente (compose.prod.yaml).'
          ),
          sl(
            'Variáveis de ambiente vs arquivos',
            'Variáveis de ambiente são simples, mas vazam fácil: aparecem em docker inspect, podem ser herdadas por processos filhos, caem em dumps de erro e em logs de depuração. Para segredos (senhas, chaves, tokens), prefira ARQUIVOS montados com permissão restrita, lidos pelo app só quando necessário. Muitas imagens oficiais aceitam variáveis com sufixo _FILE para isso.'
          ),
          sl(
            'Compose secrets',
            'A chave secrets do Compose monta cada segredo como arquivo somente leitura em /run/secrets/<nome> dentro do container (em memória, sem entrar na imagem). O segredo vem de um arquivo local (file:) ou de uma variável. A imagem do Postgres lê a senha de POSTGRES_PASSWORD_FILE. Observe que o arquivo-fonte precisa ficar fora do Git.',
            'services:\n  db:\n    image: postgres:17\n    environment:\n      POSTGRES_PASSWORD_FILE: /run/secrets/db_password\n    secrets:\n      - db_password\n\nsecrets:\n  db_password:\n    file: ./secrets/db_password.txt'
          ),
          sl(
            '.env, .gitignore e .env.example',
            'Nunca faça commit de arquivos com valores reais. Coloque .env, pastas de segredos e chaves no .gitignore (e no .dockerignore, para não entrarem na imagem). Versione um .env.example com nomes e valores fictícios para documentar o que preencher. Cada ambiente tem seus PRÓPRIOS segredos: nunca reutilize a senha de produção em desenvolvimento.',
            '# .gitignore\n.env\nsecrets/\n*.pem\n\n# .dockerignore\n.env\nsecrets/\n.git'
          ),
          sl(
            'Segredos não ficam "apagados" nas camadas',
            'Cada instrução do Dockerfile fica registrada: docker history mostra os comandos, ENV e ARG usados. Se você copia um segredo (COPY .env, ARG TOKEN=...) e o apaga numa camada seguinte, ele continua existindo na camada anterior e quem tiver a imagem pode extraí-lo. A saída certa é nunca colocá-lo na imagem: use secrets de build (RUN --mount=type=secret) e injete os de runtime ao executar.',
            'docker history exemplo/app:1.0\n# mostra RUN, ENV, ARG de cada camada'
          ),
          sl(
            'Segredo vazou: o que fazer',
            'Se um segredo foi parar no Git, numa imagem publicada ou num log, assuma que está comprometido. Primeiro REVOGUE e ROTACIONE: invalide a credencial antiga e gere uma nova (feito isso, o vazamento perde o valor). Depois corrija a origem, remova do histórico/registry se possível, verifique acessos suspeitos nos logs do serviço e, se envolver dados pessoais, avalie a obrigação de comunicar conforme a LGPD. Apagar o arquivo num novo commit NÃO basta: o histórico do Git guarda o valor.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual o ganho de manter a configuração fora da imagem (12-factor)?', 'b', [
          'A imagem fica proibida de ler variáveis',
          'A mesma imagem roda em ambientes diferentes, mudando só a configuração injetada',
          'O container não precisa de rede',
          'Dispensa o uso de Dockerfile'
        ], 'Separar config do código permite promover a mesma imagem entre dev, homologação e produção.'),
        mcq('q2', 'Por que variáveis de ambiente são menos seguras que arquivos para segredos?', 'd', [
          'Porque variáveis não aceitam senhas longas',
          'Porque variáveis de ambiente são criptografadas e perdem a chave',
          'Porque arquivos sempre são públicos',
          'Porque variáveis aparecem em docker inspect, são herdadas por processos filhos e vazam em dumps e logs de depuração'
        ], 'Segredos em arquivos com permissão restrita têm menos pontos de exposição.'),
        mcq('q3', 'Onde o Compose monta um segredo declarado como db_password dentro do container?', 'a', [
          '/run/secrets/db_password, como arquivo somente leitura',
          'Na variável de ambiente DB_PASSWORD',
          'Na imagem, como uma nova camada',
          'No registry'
        ], 'Compose secrets viram arquivos em /run/secrets, sem entrar na imagem.'),
        fill('q4', 'Complete o sufixo que faz a imagem do Postgres ler a senha de um arquivo:', 'environment:\n  POSTGRES_PASSWORD___: /run/secrets/db_password', ['_FILE'], 'Variáveis com sufixo _FILE indicam um arquivo de onde o valor será lido.'),
        mcq('q5', 'Um Dockerfile faz COPY .env . e depois RUN rm .env. O segredo está protegido?', 'c', [
          'Sim, o rm remove o arquivo de toda a imagem',
          'Sim, pois o Docker criptografa as camadas',
          'Não: o arquivo continua na camada do COPY e pode ser extraído por quem tiver a imagem',
          'Sim, desde que se use docker history'
        ], 'Camadas são acumulativas; apagar depois não remove o conteúdo da camada anterior.'),
        mcq('q6', 'Um token foi commitado por engano no Git. Qual a PRIMEIRA ação?', 'b', [
          'Apagar o arquivo num novo commit e seguir em frente',
          'Revogar/rotacionar o token imediatamente, pois deve ser considerado comprometido',
          'Esperar para ver se alguém usa',
          'Renomear o repositório'
        ], 'O histórico do Git preserva o valor; só revogar e gerar um novo encerra o risco.'),
        mcq('q7', 'Qual conjunto de práticas com arquivos .env está correto?', 'a', [
          '.env no .gitignore (e .dockerignore) e um .env.example com valores fictícios versionado',
          'Fazer commit do .env com os valores reais, para o time todo usar',
          'Copiar o .env para dentro da imagem',
          'Usar a mesma senha de produção em todos os ambientes'
        ], 'Valores reais ficam fora do Git e da imagem; o exemplo documenta os nomes.'),
        fill('q8', 'Complete o comando que mostra as instruções (RUN, ENV, ARG...) usadas em cada camada de uma imagem:', 'docker ___ exemplo/app:1.0', ['history', 'image history'], 'docker history revela os comandos das camadas — e, por isso, segredos colocados em ENV/ARG ali ficam visíveis.')
      ]
    },
    {
      id: 'cti-16-depuracao',
      title: 'Depuração de containers',
      goal: 'Diagnosticar containers que caem, exit codes, portas em uso, falhas de DNS e builds quebrados.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Ferramentas de investigação',
            'Siga uma ordem: o que o container diz (logs), em que estado está (ps, inspect), o que roda dentro dele (exec, top) e o que aconteceu no Docker (events). docker logs mostra a saída do app; docker exec -it abre um comando dentro de um container em execução; docker inspect traz toda a configuração e o estado em JSON (use --format para extrair um campo); docker top lista os processos do container; docker events mostra os acontecimentos recentes.',
            'docker logs --tail 50 api\ndocker exec -it api sh\ndocker inspect --format "{{.State.ExitCode}} {{.State.Error}}" api\ndocker top api'
          ),
          sl(
            'Códigos de saída (exit codes)',
            'O código de saída conta por que o container terminou. 0: terminou com sucesso. 1: erro genérico do app. 125: o próprio docker run falhou (opção inválida, erro do daemon). 126: o comando existe, mas não pode ser executado (sem permissão de execução). 127: comando não encontrado. 137: morto por SIGKILL (128+9) — OOM kill, docker kill ou timeout do stop. 139: SIGSEGV (128+11), falha de segmentação no programa. 143: encerrado por SIGTERM (128+15). Regra: acima de 128, o sinal é código-128.',
            'docker ps -a\n# STATUS: Exited (137) 3 minutes ago'
          ),
          sl(
            'Container que sai imediatamente e restart loops',
            'Um container vive enquanto o PID 1 vive. Se ele sai logo ao iniciar, o processo terminou: erro de configuração (veja docker logs), comando errado ou — erro clássico — um serviço que roda em segundo plano (daemon) e devolve o controle, fazendo o PID 1 acabar. O app deve rodar em primeiro plano. Com restart: always e um app que falha ao iniciar, surge o restart loop: o STATUS fica "Restarting" e RestartCount sobe. Olhe os logs da última tentativa e o exit code.',
            'docker ps\n# STATUS: Restarting (1) 4 seconds ago\ndocker inspect --format "{{.RestartCount}}" api'
          ),
          sl(
            'Porta já em uso',
            'Erros como "port is already allocated" ou "address already in use" significam que a porta do HOST escolhida já está ocupada por outro processo ou outro container. Descubra quem usa (docker ps mostra as portas publicadas; no host, ferramentas como ss/netstat) e então pare o outro processo ou publique em outra porta do host (por exemplo 8081:80). Lembre: o conflito é na porta do host, não na do container.',
            'docker run -d -p 8081:80 nginx'
          ),
          sl(
            'Problemas de DNS e rede entre containers',
            'Erros do tipo "could not resolve host db" ou conexão recusada costumam ter causas simples: os containers não estão na mesma rede, o nome usado não é o do serviço, ou o app usa localhost — que dentro de um container é ELE MESMO, não o banco. Para investigar sem instalar nada no container do app, use um container de depuração com ferramentas de rede, como nicolaka/netshoot, entrando no mesmo namespace de rede do alvo.',
            'docker run --rm -it --network container:api nicolaka/netshoot\n# dentro dele:\nnslookup db\ncurl -v http://db:5432'
          ),
          sl(
            'Depurando falhas de build e imagens',
            'Quando um build falha, veja o log COMPLETO com --progress=plain (e --no-cache se suspeitar de cache estragado). Para olhar dentro de uma imagem que sobe e cai, sobrescreva o entrypoint e abra um shell: assim você inspeciona os arquivos que o build gerou.',
            'docker build --progress=plain --no-cache -t app:debug .\ndocker run --rm -it --entrypoint sh app:debug'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que indicam os códigos de saída 126 e 127?', 'c', [
          '126: sucesso; 127: erro genérico',
          '126: falta de memória; 127: falha de rede',
          '126: o comando existe mas não pode ser executado (permissão); 127: comando não encontrado',
          '126 e 127 são os mesmos que 137'
        ], '126 e 127 vêm do shell: não executável e não encontrado, respectivamente.'),
        mcq('q2', 'Um container com CMD ["service", "nginx", "start"] sai logo após iniciar. Qual a causa mais provável?', 'a', [
          'O serviço sobe em segundo plano e o processo principal (PID 1) termina, encerrando o container',
          'O Nginx não é compatível com Docker',
          'Falta de memória',
          'A porta 80 está bloqueada'
        ], 'O container vive enquanto o PID 1 vive; o app deve rodar em primeiro plano (ex.: nginx -g "daemon off;").'),
        mcq('q3', 'O erro "port is already allocated" ao rodar -p 8080:80 significa o quê?', 'd', [
          'A porta 80 do container está ocupada',
          'O Docker está sem internet',
          'A imagem está corrompida',
          'A porta 8080 do host já está em uso por outro processo ou container; escolha outra porta do host ou libere-a'
        ], 'O conflito é na porta do host (lado esquerdo do mapeamento).'),
        fill('q4', 'Complete o comando que lista os processos rodando dentro do container "api":', 'docker ___ api', ['top'], 'docker top mostra os processos do container sem precisar entrar nele.'),
        mcq('q5', 'A api não resolve o nome "db". Qual abordagem de investigação é adequada?', 'b', [
          'Reinstalar o Docker',
          'Conferir se estão na mesma rede e se o nome é o do serviço (não localhost), usando um container como nicolaka/netshoot no namespace de rede da api',
          'Aumentar a memória do container',
          'Trocar a imagem por latest'
        ], 'Dentro de um container, localhost é o próprio container; o netshoot traz nslookup/curl sem alterar a imagem do app.'),
        mcq('q6', 'Qual par código/sinal está correto?', 'c', [
          '137 = SIGTERM; 143 = SIGKILL',
          '139 = SIGKILL; 137 = SIGSEGV',
          '137 = SIGKILL; 139 = SIGSEGV; 143 = SIGTERM',
          '143 = SIGSEGV; 139 = SIGTERM'
        ], 'Acima de 128, o sinal é o código menos 128: 9 (KILL), 11 (SEGV), 15 (TERM).'),
        mcq('q7', 'Um container está em "Restarting" com restart: always. Como começar a investigar?', 'a', [
          'Ler docker logs (última tentativa), conferir o exit code e o RestartCount em docker inspect',
          'Ignorar: é comportamento normal',
          'Apagar todas as imagens',
          'Desativar a rede'
        ], 'O loop indica que o app falha ao iniciar; logs e exit code apontam a causa.'),
        fill('q8', 'Complete a opção que substitui o entrypoint para abrir um shell na imagem:', 'docker run --rm -it ___ sh app:debug', ['--entrypoint'], '--entrypoint sobrescreve o comando de entrada, útil para inspecionar uma imagem que cai ao subir.')
      ]
    },
    {
      id: 'cti-17-docker-desenvolvimento',
      title: 'Docker no desenvolvimento',
      goal: 'Usar bind mounts, watch, ferramentas descartáveis e testes em containers mantendo paridade dev/prod.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Bind mount + hot reload',
            'Em desenvolvimento você quer editar o código no seu editor e ver o resultado sem reconstruir a imagem. Monte a pasta do projeto como bind mount dentro do container e use um servidor de dev que recarrega ao detectar mudanças (nodemon, Vite, flask --reload). Truque comum no Node: um volume anônimo em /app/node_modules para o bind mount não esconder as dependências instaladas na imagem. No Windows, projetos dentro do sistema de arquivos do WSL2 costumam ter melhor desempenho que pastas do Windows.',
            'services:\n  web:\n    build: .\n    command: npm run dev\n    volumes:\n      - ./:/app\n      - /app/node_modules\n    ports:\n      - "3000:3000"'
          ),
          sl(
            'compose watch como alternativa',
            'Em vez de bind mount, docker compose watch observa arquivos e sincroniza só o que mudou para dentro do container (sync), reconstrói quando algo estrutural muda, como package.json (rebuild), ou sincroniza e reinicia o processo (sync+restart). Evita problemas de permissão e desempenho do bind mount e mantém o ambiente mais próximo da imagem real.',
            'services:\n  web:\n    build: .\n    develop:\n      watch:\n        - action: sync\n          path: ./src\n          target: /app/src\n        - action: rebuild\n          path: package.json\n\n# docker compose watch'
          ),
          sl(
            'Dev containers: visão geral',
            'Dev containers levam a ideia além: o PRÓPRIO ambiente de desenvolvimento (linguagem, ferramentas, extensões) roda em um container, descrito em .devcontainer/devcontainer.json. O editor (como o VS Code) se conecta a ele. Resultado: quem clona o repositório tem o mesmo ambiente, sem instalar nada na máquina — ótimo para onboarding e para evitar o "na minha máquina funciona".'
          ),
          sl(
            'Ferramentas descartáveis com docker run --rm',
            'Precisa de uma ferramenta pontual (um linter, uma versão específica do Node, um conversor) sem instalar no seu sistema? Rode num container efêmero: --rm remove o container ao sair; -v monta a pasta atual; -w define o diretório de trabalho. Seu sistema permanece limpo e a versão é exatamente a da tag.',
            'docker run --rm -v "$(pwd)":/app -w /app node:22-alpine npm --version\n\n# PowerShell: troque "$(pwd)" por "${PWD}"'
          ),
          sl(
            'Testes em containers',
            'Rodar os testes dentro de containers garante o mesmo ambiente local e no CI. Com Compose, docker compose run --rm <serviço> <comando> sobe um container descartável do serviço (e suas dependências, como o banco de teste), executa o comando e o remove. Dá para ter um estágio de teste no Dockerfile e construí-lo com --target.',
            'docker compose run --rm api npm test'
          ),
          sl(
            'Paridade dev/prod e banco local',
            'Quanto mais o ambiente de dev se parece com o de produção (mesma imagem base, mesmo tipo de banco e cache), menos surpresas na hora do deploy. Use o mesmo compose.yaml e deixe as diferenças no compose.override.yaml. Banco local em container é ótimo para dev: suba o Postgres com volume nomeado e popule com dados FICTÍCIOS (seed). Jamais copie dados reais de produção — com dados pessoais de pessoas reais — para a máquina de desenvolvimento: viola o princípio de minimização da LGPD e multiplica o risco de vazamento.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual a ideia do bind mount com hot reload no desenvolvimento?', 'b', [
          'Copiar o código para o registry a cada alteração',
          'Mapear o código do host para o container; ao editar, o servidor de dev recarrega sem reconstruir a imagem',
          'Apagar o container a cada salvamento',
          'Criptografar o código-fonte'
        ], 'O container enxerga os mesmos arquivos do host em tempo real.'),
        mcq('q2', 'Qual a vantagem do compose watch em relação ao bind mount?', 'd', [
          'Dispensa o Compose',
          'Roda sem containers',
          'Só funciona com Java',
          'Sincroniza só o que mudou e permite rebuild em mudanças estruturais, evitando problemas de permissão/desempenho do bind mount'
        ], 'watch usa regras sync, rebuild e sync+restart.'),
        mcq('q3', 'O que são dev containers (visão geral)?', 'a', [
          'Ambientes de desenvolvimento completos descritos em devcontainer.json e executados em containers, aos quais o editor se conecta',
          'Imagens que só funcionam em produção',
          'Um tipo de volume',
          'Containers sem rede'
        ], 'Padronizam o ambiente da equipe sem instalar ferramentas na máquina.'),
        fill('q4', 'Complete a flag que remove o container automaticamente ao sair:', 'docker run ___ -v "$(pwd)":/app -w /app node:22-alpine npm test', ['--rm'], '--rm apaga o container ao terminar — ideal para ferramentas e testes descartáveis.'),
        mcq('q5', 'Para que serve "docker run --rm -v "$(pwd)":/app -w /app node:22-alpine npm test"?', 'c', [
          'Para publicar o projeto no Docker Hub',
          'Para instalar permanentemente o Node no host',
          'Para rodar os testes num container efêmero com a pasta atual montada, sem instalar o Node no sistema',
          'Para apagar a pasta /app'
        ], '-v monta a pasta, -w define o diretório de trabalho e --rm limpa o container.'),
        mcq('q6', 'Por que buscar paridade entre dev e produção?', 'b', [
          'Para dev e produção usarem a mesma senha',
          'Para reduzir diferenças de ambiente e as surpresas no deploy, mantendo as diferenças em arquivos de override',
          'Para dispensar testes',
          'Para eliminar o uso de imagens'
        ], 'Mesmo tipo de banco/base e mesma estrutura de Compose diminuem o "funciona na minha máquina".'),
        mcq('q7', 'Qual a prática correta para o banco local de desenvolvimento em container?', 'd', [
          'Restaurar um dump real de produção com dados de clientes',
          'Usar a mesma senha e o mesmo banco de produção',
          'Compartilhar o volume entre vários desenvolvedores',
          'Popular com dados fictícios (seed), sem dados pessoais reais'
        ], 'Dados pessoais reais em dev violam a minimização (LGPD) e ampliam o risco de vazamento.'),
        fill('q8', 'Complete o subcomando que executa um comando único num container descartável de um serviço do Compose:', 'docker compose ___ --rm api npm test', ['run'], 'docker compose run sobe um container do serviço apenas para aquele comando.')
      ]
    },
    {
      id: 'cti-27-servicos-de-apoio',
      title: 'Serviços de apoio no desenvolvimento',
      goal: 'Subir filas, S3, e-mail, cache, busca e identidade locais com Compose, de forma segura e só quando necessário.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O padrão: dependências de dev com Compose e regras de ouro',
            'Em vez de instalar RabbitMQ, Redis ou Elasticsearch na sua máquina, descreva-os num compose de desenvolvimento e suba com um comando; cada integrante do time tem o mesmo ambiente e dá para descartar tudo depois. Regras: (1) credenciais de EXEMPLO, óbvias e que nunca servem em produção; (2) publique portas só em 127.0.0.1, para que ninguém na rede alcance seus serviços; (3) nenhum dado pessoal real nesses serviços — use dados sintéticos; (4) use profiles para ligar só o que você precisa naquele momento, economizando memória.',
            'services:\n  cache:\n    image: redis:7\n    ports:\n      - "127.0.0.1:6379:6379"\n  busca:\n    image: opensearchproject/opensearch:2\n    profiles: ["search"]'
          ),
          sl(
            'Fila (RabbitMQ) e armazenamento S3 (MinIO)',
            'RabbitMQ: use a imagem com sufixo management, que traz um painel web. Ele expõe duas portas: 5672 é o protocolo AMQP (por onde a aplicação publica e consome mensagens) e 15672 é o painel de gerenciamento (HTTP, para humanos). Usuário e senha iniciais por variáveis (RABBITMQ_DEFAULT_USER e RABBITMQ_DEFAULT_PASS). MinIO é um armazenamento compatível com a API S3 da AWS: seu código usa o mesmo SDK S3 apontando para o MinIO local. Tem uma porta de API e outra de console web, usuário/senha raiz por variáveis (MINIO_ROOT_USER, MINIO_ROOT_PASSWORD) e os buckets (as "pastas" raiz) são criados pelo console ou por um cliente de linha de comando.',
            '  rabbit:\n    image: rabbitmq:management\n    environment:\n      RABBITMQ_DEFAULT_USER: dev\n      RABBITMQ_DEFAULT_PASS: dev-senha-exemplo\n    ports:\n      - "127.0.0.1:5672:5672"     # AMQP (aplicação)\n      - "127.0.0.1:15672:15672"   # painel web'
          ),
          sl(
            'E-mail capturado (Mailpit), Redis e Memcached',
            'Em desenvolvimento você NÃO quer que o app envie e-mails de verdade (pode alcançar pessoas reais). Mailpit (ou o MailHog, mais antigo) é um servidor SMTP falso: recebe tudo e mostra numa caixa de entrada web. Convenção: SMTP na porta 1025 e interface web na 8025. Seu app aponta para mailpit:1025 e você lê as mensagens em localhost:8025. Redis (porta 6379) e Memcached (11211) são caches em memória: em dev, normalmente sem volume, pois perder o conteúdo ao parar não faz mal. Atenção: por padrão o Redis não vem com senha — mais um motivo para publicar só em 127.0.0.1. Para testar rapidamente: docker compose exec cache redis-cli ping devolve PONG.',
            '  mail:\n    image: axllent/mailpit\n    ports:\n      - "127.0.0.1:8025:8025"   # caixa de entrada web\n      - "127.0.0.1:1025:1025"   # SMTP\n\n# app: SMTP_HOST=mail  SMTP_PORT=1025'
          ),
          sl(
            'Busca: Elasticsearch/OpenSearch e a memória',
            'Elasticsearch e OpenSearch são motores de busca pesados em memória. Em dev, rode um nó só (discovery.type=single-node) e limite o heap da JVM com ES_JAVA_OPTS (OpenSearch usa OPENSEARCH_JAVA_OPTS). Em Linux e no WSL2, um erro muito comum é o container cair com "max virtual memory areas vm.max_map_count too low": o kernel do host precisa de vm.max_map_count de pelo menos 262144, ajustado com sysctl no host (a configuração vale para todos os containers, pois eles compartilham o kernel). Versões recentes também trazem segurança ativada ou exigem uma senha inicial — leia a documentação da versão e, se desligar a segurança, que seja só em dev e com a porta em 127.0.0.1. Por pesar tanto, ponha a busca num profile.',
            'sudo sysctl -w vm.max_map_count=262144\ndocker compose --profile search up -d'
          ),
          sl(
            'Identidade (Keycloak) e Kafka em visão geral',
            'Keycloak é um servidor de identidade (login, OAuth2/OIDC, usuários e papéis). O modo start-dev sobe com banco embutido e sem HTTPS obrigatório, só para desenvolvimento; o usuário administrador inicial é definido por variáveis de ambiente (o nome delas varia por versão — consulte a documentação). Nunca use o modo dev em produção e nunca importe usuários reais para ele. Kafka é uma plataforma de log de eventos e costuma ser o serviço de apoio mais complicado: além de ser mais pesado, exige configurar os advertised listeners, os endereços que o broker anuncia aos clientes. Quem está DENTRO da rede do Compose alcança o broker por um nome (kafka:9092), quem está no host por outro (localhost:porta) — um único endereço não serve aos dois, e isso gera os erros de conexão mais frequentes.',
            '  keycloak:\n    image: quay.io/keycloak/keycloak\n    command: start-dev\n    ports:\n      - "127.0.0.1:8080:8080"'
          ),
          sl(
            'Apps self-hosted: WordPress + MariaDB',
            'Muitos apps prontos seguem o mesmo padrão: app + banco + volumes. Exemplo clássico, WordPress com MariaDB: o app recebe o endereço do banco pelo NOME do serviço (WORDPRESS_DB_HOST: db), um volume guarda os dados do banco e outro os arquivos do WordPress (temas, uploads). Com volumes nomeados, docker compose down preserva os dados; só down -v os apaga. Lembre que um site real guarda dados pessoais (usuários, comentários): se for sair do ambiente de teste, trate backup, atualização e senhas com o mesmo rigor de produção.',
            'services:\n  app:\n    image: wordpress\n    environment:\n      WORDPRESS_DB_HOST: db\n      WORDPRESS_DB_USER: wp\n      WORDPRESS_DB_PASSWORD: senha-de-exemplo\n      WORDPRESS_DB_NAME: wp\n    ports:\n      - "127.0.0.1:8080:80"\n    volumes:\n      - wp_files:/var/www/html\n  db:\n    image: mariadb:11\n    environment:\n      MARIADB_DATABASE: wp\n      MARIADB_USER: wp\n      MARIADB_PASSWORD: senha-de-exemplo\n      MARIADB_RANDOM_ROOT_PASSWORD: "1"\n    volumes:\n      - db_data:/var/lib/mysql\nvolumes:\n  wp_files:\n  db_data:'
          )
        ]
      },
      questions: [
        mcq('q1', 'No serviço RabbitMQ abaixo, para que serve cada porta?\n  rabbit:\n    image: rabbitmq:management\n    ports:\n      - "127.0.0.1:5672:5672"\n      - "127.0.0.1:15672:15672"', 'a', [
          '5672 é o AMQP usado pela aplicação; 15672 é o painel web de gerenciamento',
          '5672 é o painel web; 15672 é o AMQP',
          'Ambas são painéis web',
          'Ambas são exclusivas para backup'
        ], 'A aplicação conecta por AMQP (5672); o humano abre o painel (15672) no navegador.'),
        mcq('q2', 'Qual a utilidade do Mailpit no desenvolvimento?', 'c', [
          'Enviar e-mails em massa com mais velocidade',
          'Servir de banco de dados para o app',
          'Capturar os e-mails enviados pelo app em uma caixa de entrada local, sem entregá-los a ninguém de verdade',
          'Criptografar o tráfego SMTP para a internet'
        ], 'O app envia por SMTP para o Mailpit; você lê na interface web e nada chega a destinatários reais.'),
        mcq('q3', 'O que significa publicar "127.0.0.1:15672:15672" em vez de "15672:15672"?', 'b', [
          'O painel fica acessível a toda a rede',
          'Só a própria máquina acessa o painel; outras máquinas da rede não',
          'O painel deixa de precisar de senha',
          'A porta 15672 é bloqueada para o próprio host'
        ], 'Amarrar ao loopback restringe o acesso à máquina local, uma boa prática para serviços de dev.'),
        fill('q4', 'Complete a flag que liga apenas os serviços do profile "search":', 'docker compose ___ search up -d', ['--profile'], 'Serviços com profiles só sobem quando o profile é ativado com --profile (ou COMPOSE_PROFILES).'),
        mcq('q5', 'O container do Elasticsearch/OpenSearch cai em Linux/WSL2 com erro sobre vm.max_map_count. Qual a correção?', 'd', [
          'Reinstalar o Docker Compose',
          'Trocar a porta publicada para 9201',
          'Adicionar mais um volume',
          'Aumentar vm.max_map_count no kernel do host/WSL2 (ex.: sysctl -w vm.max_map_count=262144)'
        ], 'Containers compartilham o kernel do host; o parâmetro é do kernel, não do container.'),
        mcq('q6', 'Por que o Kafka é considerado mais complexo de rodar em containers do que o Redis?', 'b', [
          'Porque só funciona no Windows',
          'Porque exige advertised listeners: clientes dentro e fora da rede do Compose precisam de endereços diferentes, e além disso é mais pesado',
          'Porque não aceita portas publicadas',
          'Porque não pode usar volumes'
        ], 'O broker anuncia um endereço aos clientes; acertar um que sirva ao container e ao host é a fonte clássica de erro.'),
        mcq('q7', 'No exemplo WordPress + MariaDB, como o app encontra o banco e o que preserva os dados após docker compose down?\n  app:\n    environment:\n      WORDPRESS_DB_HOST: db\n  db:\n    volumes:\n      - db_data:/var/lib/mysql', 'c', [
          'Pelo IP do host; os dados somem no down',
          'Por localhost; os dados ficam na camada do container',
          'Pelo nome do serviço (db); o volume nomeado db_data sobrevive ao down (só down -v o apaga)',
          'Por variável no Dockerfile; nada preserva os dados'
        ], 'O DNS do Compose resolve o nome do serviço; volumes nomeados persistem entre recriações.'),
        fill('q8', 'Complete o comando que testa o Redis do serviço "cache" (a resposta esperada é PONG):', 'docker compose exec cache redis-cli ___', ['ping', 'PING'], 'redis-cli ping devolve PONG quando o servidor responde.')
      ]
    },
    {
      id: 'cti-28-testes-com-containers',
      title: 'Testes de integração com containers',
      goal: 'Rodar testes contra dependências reais e descartáveis (Testcontainers ou Compose), de forma rápida, isolada e sem dados pessoais.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que testar com dependências reais',
            'Testes de unidade com mocks (bancos e filas "de mentira") são rápidos, mas o mock só faz o que você programou: ele não detecta SQL inválido, migration quebrada, diferença de comportamento entre bancos, serialização errada ou timeout. Um teste de integração contra o banco REAL (a mesma tecnologia da produção) pega esses erros antes do deploy. O problema clássico era montar esse ambiente; com containers, ele sobe sob demanda e é descartado ao final.'
          ),
          sl(
            'Testcontainers: containers descartáveis a partir do código do teste',
            'Testcontainers é uma biblioteca (existe para Java, Node, Python, Go, .NET e outras) que usa o Docker para subir containers DIRETO do código do teste: o teste pede um PostgreSQL, a biblioteca sobe, devolve os dados de conexão e, ao fim, derruba. Você não precisa de compose nem de banco instalado: só do Docker acessível. Exemplo em Node/TypeScript: cria-se o container com uma imagem (a tag é ilustrativa), start() espera ficar pronto, getConnectionUri() devolve a URL e stop() encerra.',
            'import { PostgreSqlContainer } from "@testcontainers/postgresql";\n\nconst container = await new PostgreSqlContainer("postgres:16-alpine").start();\nconst url = container.getConnectionUri();\n// ... rodar testes usando url ...\nawait container.stop();'
          ),
          sl(
            'Portas aleatórias, espera pelo pronto e o Ryuk',
            'Três detalhes fazem a biblioteca ser confiável. (1) Porta aleatória: ela NÃO usa a porta fixa 5432 no host; mapeia a do container para uma porta livre qualquer e informa qual (por isso se usa getConnectionUri ou getMappedPort, nunca um número escrito à mão). Isso evita conflito com outro banco já rodando e permite testes em paralelo. (2) Espera por readiness: cada módulo tem uma estratégia de espera (aguarda uma linha de log, uma porta aberta ou um healthcheck) e só devolve o controle quando o serviço está pronto. (3) Limpeza automática: um container auxiliar chamado Ryuk, iniciado junto, observa os containers do teste e os remove se o processo de teste morrer, mesmo com falha ou Ctrl+C. Nada de lixo acumulado.'
          ),
          sl(
            'Alternativa: docker compose para a suíte inteira',
            'Sem biblioteca, dá para usar o Compose: um serviço "tests" com profile test roda a suíte e depende do banco (com healthcheck). docker compose --profile test up --abort-on-container-exit --exit-code-from tests sobe tudo, para quando um container terminar e devolve como código de saída o do serviço "tests" — essencial para a CI saber se passou ou falhou (--exit-code-from já implica --abort-on-container-exit, mas escrever os dois é comum). Depois, docker compose down -v remove containers e volumes, garantindo um ambiente limpo na próxima vez. É mais simples de começar; o Testcontainers dá mais controle por teste.',
            'docker compose --profile test up --abort-on-container-exit --exit-code-from tests\ndocker compose --profile test down -v'
          ),
          sl(
            'Banco efêmero, seed, isolamento e velocidade',
            'Cada execução deve começar de um estado conhecido: banco novo, migrations aplicadas e um seed com dados SINTÉTICOS. Para isolar testes entre si: um banco/schema por suíte (ou nome único por worker), ou transação revertida (rollback) no fim de cada teste. Em paralelo, nunca compartilhe estado sem isolamento. Para ganhar velocidade: reutilize um container por suíte em vez de um por teste, mantenha a imagem já baixada e guarde os dados do banco em tmpfs (memória) — como o banco é descartável, não há por que gravar em disco.',
            '  db:\n    image: postgres:16\n    environment:\n      POSTGRES_PASSWORD: senha-de-teste\n    tmpfs:\n      - /var/lib/postgresql/data'
          ),
          sl(
            'CI e privacidade (LGPD)',
            'Em CI, o runner precisa de acesso a um daemon Docker. Runners hospedados em VM costumam ter o Docker pronto; se os jobs rodam eles mesmos dentro de containers, é comum montar o /var/run/docker.sock — mas isso dá ao job controle total do Docker do host (equivale a root; veremos o risco na lição de ferramentas), então só faça em runners confiáveis e isolados, ou use um Docker-in-Docker/daemon dedicado. Sobre dados: NUNCA use dump de produção como massa de teste — ele contém dados pessoais, e a LGPD exige finalidade e minimização; usar em teste e em CI (com logs e cache) multiplica as cópias e o risco de vazamento. Gere dados sintéticos (nomes e documentos fictícios).'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual a principal vantagem de testar contra um banco real em container em vez de um mock?', 'c', [
          'O teste fica sempre mais rápido que com mock',
          'Dispensa escrever testes de unidade',
          'Detecta problemas que o mock esconde, como SQL inválido, migrations quebradas e diferenças de comportamento do banco',
          'Permite usar dados reais de clientes'
        ], 'O mock só reproduz o que foi programado; o banco real valida SQL, esquema e comportamento de verdade.'),
        mcq('q2', 'Por que o Testcontainers publica o container numa porta aleatória do host?', 'd', [
          'Por segurança, porque portas fixas são proibidas pelo Docker',
          'Porque o Docker não permite a porta 5432',
          'Para esconder a porta do código de teste',
          'Para evitar conflito com serviços já rodando e permitir testes em paralelo; o código obtém a porta pela API (getMappedPort ou a URI)'
        ], 'Por isso nunca se escreve a porta à mão: pergunta-se à biblioteca qual foi mapeada.'),
        mcq('q3', 'Qual o papel do container "Ryuk" no Testcontainers?', 'b', [
          'Executar os testes dentro dele',
          'Remover automaticamente os containers do teste, mesmo se o processo de teste morrer',
          'Armazenar os dados sintéticos',
          'Publicar a imagem no registry'
        ], 'Ryuk é um container auxiliar de limpeza que evita lixo acumulado.'),
        fill('q4', 'Complete a flag que faz o comando devolver o código de saída do serviço "tests":', 'docker compose --profile test up --abort-on-container-exit ___ tests', ['--exit-code-from'], '--exit-code-from usa o código do serviço indicado como código de saída do comando, o que a CI usa para decidir sucesso ou falha.'),
        mcq('q5', 'O que faz este trecho em um banco de testes?\n  db:\n    image: postgres:16\n    tmpfs:\n      - /var/lib/postgresql/data', 'a', [
          'Guarda os dados em memória: mais rápido, e tudo some quando o container para',
          'Guarda os dados num volume nomeado permanente',
          'Criptografa os dados em disco',
          'Faz backup automático dos dados'
        ], 'tmpfs usa memória; para banco descartável de teste é uma ótima otimização.'),
        mcq('q6', 'Um colega propõe usar um dump do banco de produção como massa de teste. Qual a resposta correta?', 'd', [
          'Ótima ideia, pois é o dado mais realista',
          'Pode, desde que só rode em CI',
          'Pode, se o dump ficar no repositório Git',
          'Não: o dump contém dados pessoais; use dados sintéticos para respeitar a LGPD e evitar cópias espalhadas'
        ], 'Dados pessoais de produção em testes e CI multiplicam cópias e riscos; seed sintético resolve.'),
        mcq('q7', 'Por que montar /var/run/docker.sock num job de CI exige cuidado?', 'b', [
          'Porque deixa o job mais lento',
          'Porque dá ao job controle total do Docker do host, equivalente a acesso root',
          'Porque apaga as imagens do runner',
          'Porque impede o uso do Compose'
        ], 'Quem controla o daemon pode subir containers privilegiados e acessar o sistema do host.'),
        fill('q8', 'Complete a classe que cria um PostgreSQL descartável no Testcontainers para Node:', 'const c = await new ___("postgres:16-alpine").start();', ['PostgreSqlContainer'], 'O módulo @testcontainers/postgresql expõe PostgreSqlContainer; start() só retorna quando o banco está pronto.')
      ]
    },
    {
      id: 'cti-18-proxy-reverso',
      title: 'Proxy reverso e múltiplos serviços',
      goal: 'Colocar Nginx ou Traefik na frente dos serviços, rotear por host/path e publicar apenas o proxy.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é um proxy reverso',
            'Um proxy reverso recebe as requisições de fora e as encaminha ao serviço interno certo. Vantagens: um único ponto de entrada (uma porta 80/443 para vários serviços), terminação de TLS (HTTPS) centralizada, roteamento por domínio ou caminho, e os serviços internos ficam sem portas publicadas. Nginx e Traefik são os mais comuns em projetos com Compose.'
          ),
          sl(
            'Nginx no Compose e descoberta por DNS',
            'No Nginx, proxy_pass aponta para o NOME do serviço do Compose — o DNS embutido o resolve, sem IP fixo. Só o proxy publica portas; api e web ficam acessíveis apenas pela rede interna. Atenção: o Nginx resolve esses nomes ao iniciar; se o serviço não existir ainda, ele falha com "host not found in upstream" — use depends_on.',
            'services:\n  proxy:\n    image: nginx:stable\n    ports:\n      - "80:80"\n    volumes:\n      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro\n    depends_on: [api, web]\n  api:\n    build: ./api      # sem ports\n  web:\n    build: ./web      # sem ports'
          ),
          sl(
            'Roteamento por host e por path',
            'Por host: o proxy olha o domínio da requisição (server_name) e escolhe o destino — api.exemplo.com vai para a api, app.exemplo.com para a web. Por path: o proxy olha o caminho (location) — /api/ vai para a api e o resto para a web. Também se combinam. Os headers Host e X-Forwarded-* informam ao app a origem original.',
            'server {\n  listen 80;\n  server_name app.exemplo.com;\n\n  location /api/ {\n    proxy_pass http://api:3000/;\n    proxy_set_header Host $host;\n    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n  }\n  location / {\n    proxy_pass http://web:80;\n  }\n}'
          ),
          sl(
            'Só o proxy publica portas',
            'Regra de ouro: apenas o proxy tem ports:. Bancos, caches e a própria api não precisam estar na internet nem no host — o proxy os alcança pela rede do Compose. Menos portas expostas = menos superfície de ataque. Se precisar acessar o banco para administração, publique em 127.0.0.1 ou use um túnel.'
          ),
          sl(
            'HTTPS: TLS e Let\'s Encrypt em visão geral',
            'O HTTPS cifra o tráfego entre o navegador e o proxy; o proxy "termina" o TLS e conversa em HTTP simples com os serviços dentro da rede privada. Os certificados vêm de uma autoridade certificadora; a Let\'s Encrypt emite certificados gratuitos e automatizados (protocolo ACME), de validade curta, que precisam ser renovados automaticamente. Requer um domínio público apontando para o servidor e as portas 80/443 acessíveis. Ferramentas como o Certbot, o Traefik e o Caddy fazem a emissão e renovação.'
          ),
          sl(
            'Traefik: roteamento por labels',
            'O Traefik descobre serviços sozinho lendo as labels dos containers via socket do Docker: você declara a regra de roteamento no próprio serviço, sem editar arquivo de proxy. Atenção à segurança: para isso ele acessa /var/run/docker.sock, o que (lição de segurança) equivale a muito poder sobre o host. Mitigue montando o socket somente leitura, mantendo o Traefik atualizado e, melhor ainda, usando um proxy de socket que exponha só o necessário.',
            'services:\n  api:\n    image: exemplo/api:1.0\n    labels:\n      - "traefik.http.routers.api.rule=Host(`api.exemplo.com`)"\n      - "traefik.http.services.api.loadbalancer.server.port=3000"'
          ),
          sl(
            'Logs do proxy e LGPD',
            'Os logs de acesso do proxy guardam o endereço IP dos visitantes, e o IP pode ser considerado dado pessoal. Aplique a LGPD: registre só o necessário, defina retenção curta (use rotação de logs), restrinja quem acessa esses logs e evite registrar cabeçalhos ou parâmetros de URL com informações pessoais.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual a principal função de um proxy reverso no Compose?', 'c', [
          'Compilar o código',
          'Armazenar o banco de dados',
          'Receber as requisições de fora e encaminhá-las ao serviço interno certo, num ponto de entrada único',
          'Construir imagens'
        ], 'O proxy centraliza a entrada, o TLS e o roteamento.'),
        mcq('q2', 'Por que os logs de acesso do proxy exigem atenção à LGPD?', 'a', [
          'Porque registram IPs dos visitantes, que podem ser dados pessoais; convém limitar retenção e acesso',
          'Porque os logs do Nginx são proibidos por lei',
          'Porque o Docker criptografa os logs automaticamente',
          'Porque só guardam o nome do container'
        ], 'IP pode identificar uma pessoa; use retenção curta, rotação e acesso restrito.'),
        mcq('q3', 'Neste arranjo, quem deve ter ports: no Compose?', 'd', [
          'Todos os serviços, para facilitar',
          'Somente o banco de dados',
          'Somente a api',
          'Somente o proxy; api, web e banco ficam acessíveis só pela rede interna'
        ], 'Menos portas publicadas = menor superfície de ataque.'),
        fill('q4', 'Complete a diretiva do Nginx que encaminha a requisição para o serviço api (resolvido pelo DNS do Compose):', 'location /api/ {\n  ___ http://api:3000/;\n}', ['proxy_pass'], 'proxy_pass aponta para o destino; o nome api é resolvido pelo DNS embutido do Docker.'),
        mcq('q5', 'Qual a diferença entre roteamento por host e por path?', 'b', [
          'Por host usa o IP do container; por path usa a porta',
          'Por host escolhe o destino pelo domínio da requisição; por path escolhe pelo caminho da URL (ex.: /api/)',
          'São a mesma coisa',
          'Por path só funciona com HTTPS'
        ], 'server_name roteia por domínio; location roteia por caminho.'),
        mcq('q6', 'Como funciona a terminação de TLS no proxy com Let\'s Encrypt?', 'c', [
          'Cada container precisa ter seu próprio certificado',
          'O certificado é fixo e nunca expira',
          'O proxy faz o HTTPS com o navegador (certificado gratuito e de validade curta, renovado automaticamente) e fala HTTP com os serviços na rede interna',
          'O Let\'s Encrypt hospeda o site'
        ], 'O TLS é centralizado no proxy; os certificados da Let\'s Encrypt são automatizados via ACME.'),
        mcq('q7', 'Qual cuidado de segurança vem com o Traefik descobrindo serviços pelo Docker?', 'a', [
          'Ele acessa o docker.sock, que dá grande poder sobre o host; mitigue com somente leitura, atualização e proxy de socket',
          'Nenhum, o Traefik não usa o socket',
          'Ele exige --privileged sempre',
          'Ele publica o banco automaticamente'
        ], 'O acesso ao socket do Docker é sensível e merece mitigação.'),
        fill('q8', 'Complete a diretiva do Nginx que define para qual domínio o bloco responde (roteamento por host):', 'server {\n  listen 80;\n  ___ app.exemplo.com;\n}', ['server_name'], 'server_name faz o Nginx escolher o bloco pelo domínio da requisição.')
      ]
    },
    {
      id: 'cti-19-arquitetura-multiservico',
      title: 'Arquitetura multi-serviço com Compose',
      goal: 'Montar de ponta a ponta um projeto com proxy, web, api, banco, cache, migrations, redes, volumes e healthchecks.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'A arquitetura do projeto',
            'Vamos montar um sistema típico: um proxy (Nginx) é a única porta de entrada; atrás dele, web (front-end) e api; a api conversa com um banco (PostgreSQL) e um cache (Redis). Uma tarefa única, migrate, prepara o esquema do banco antes da api subir. Duas redes: frontend (proxy, web, api) e backend (api, db, cache, migrate), de modo que o proxy não alcança o banco. Só o proxy publica portas.'
          ),
          sl(
            'Parte 1: proxy, web e api',
            'O proxy publica a porta 80 e monta o nginx.conf somente leitura. web e api não têm ports:. A api participa das duas redes e espera o banco saudável e a migration terminar. A senha do banco chega por Compose secret (arquivo), nunca no YAML.',
            'services:\n  proxy:\n    image: nginx:stable\n    ports: ["80:80"]\n    volumes:\n      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro\n    networks: [frontend]\n    depends_on: [web, api]\n  web:\n    build: ./web\n    networks: [frontend]\n  api:\n    build: ./api\n    environment:\n      DB_HOST: db\n      DB_PASSWORD_FILE: /run/secrets/db_password\n      CACHE_HOST: cache\n    secrets: [db_password]\n    networks: [frontend, backend]\n    depends_on:\n      db:\n        condition: service_healthy\n      migrate:\n        condition: service_completed_successfully\n      cache:\n        condition: service_started'
          ),
          sl(
            'Parte 2: banco, cache, volume e rede',
            'O banco usa volume nomeado para persistir dados e um healthcheck com pg_isready; só está na rede backend. O cache é Redis, também só no backend (sem persistência obrigatória: é cache, pode recomeçar vazio). No fim, declaramos redes, volume e o secret (arquivo fora do Git).',
            '  db:\n    image: postgres:17\n    environment:\n      POSTGRES_USER: app\n      POSTGRES_DB: appdb\n      POSTGRES_PASSWORD_FILE: /run/secrets/db_password\n    secrets: [db_password]\n    volumes:\n      - dados:/var/lib/postgresql/data\n    networks: [backend]\n    healthcheck:\n      test: ["CMD-SHELL", "pg_isready -U app -d appdb"]\n      interval: 5s\n      retries: 5\n  cache:\n    image: redis:7\n    networks: [backend]\n\nvolumes:\n  dados:\nnetworks:\n  frontend:\n  backend:\nsecrets:\n  db_password:\n    file: ./secrets/db_password.txt'
          ),
          sl(
            'Migrations: tarefa única antes da api',
            'migrate é um serviço de "executa e termina": usa a mesma imagem da api, roda o comando de migração e sai com código 0. Por isso leva restart: "no" (com always ele ficaria reiniciando em loop após terminar). A api espera por ele com condition: service_completed_successfully — se a migration falhar (código diferente de 0), a api nem inicia.',
            '  migrate:\n    build: ./api\n    command: ["npm", "run", "migrate"]\n    restart: "no"\n    environment:\n      DB_HOST: db\n      DB_PASSWORD_FILE: /run/secrets/db_password\n    secrets: [db_password]\n    networks: [backend]\n    depends_on:\n      db:\n        condition: service_healthy'
          ),
          sl(
            'A ordem de inicialização resultante',
            'Pelas dependências, o Compose inicia nesta ordem: db sobe e fica healthy; cache sobe; migrate roda e termina com sucesso; api sobe; web sobe; proxy sobe por último. Se algo falhar no caminho, o que depende dele não inicia — e o erro aparece cedo, nos logs, em vez de virar uma api quebrada. Ainda assim, a api deve reconectar caso o banco oscile depois.'
          ),
          sl(
            'Subindo e verificando o projeto',
            'Construa e suba tudo, confira o estado e a saúde dos serviços, leia os logs de um deles e valide o YAML final. Para derrubar, down remove containers e redes mantendo o volume com os dados; down -v apagaria também o volume — cuidado em ambientes com dados reais.',
            'docker compose up -d --build\ndocker compose ps\ndocker compose logs -f api\ndocker compose config\ndocker compose down'
          )
        ]
      },
      questions: [
        mcq('q1', 'Neste projeto, por que o proxy não consegue alcançar o banco?', 'c', [
          'Porque o banco bloqueia conexões de containers',
          'Porque o proxy não tem imagem',
          'Porque o proxy está só na rede frontend e o db só na backend; não compartilham rede',
          'Porque o banco publica a porta 5432 só para a api'
        ], 'Containers só se enxergam se compartilham alguma rede; a api faz a ponte entre as duas.'),
        mcq('q2', 'O que faz depends_on migrate: condition: service_completed_successfully na api?', 'a', [
          'A api só inicia depois que o serviço migrate terminar com código de saída 0',
          'A api inicia junto e reinicia se migrate falhar',
          'A api espera migrate ficar healthy',
          'A api executa as migrations por conta própria'
        ], 'Serve para tarefas de execução única: se falhar, o que depende dela não sobe.'),
        mcq('q3', 'Por que o serviço migrate usa restart: "no"?', 'd', [
          'Porque migrations não podem ser reiniciadas',
          'Porque o Compose proíbe restart em tarefas',
          'Porque o banco reinicia sozinho',
          'Porque é uma tarefa que termina; com restart always ele seria reiniciado em loop depois de concluir'
        ], 'Um serviço one-shot sai com 0 de propósito; a política padrão (no) não o religa.'),
        fill('q4', 'Complete a condition que espera um serviço de tarefa única terminar com sucesso:', 'depends_on:\n  migrate:\n    condition: ___', ['service_completed_successfully'], 'Essa condition libera o dependente apenas quando a dependência saiu com código 0.'),
        mcq('q5', 'O que acontece com os dados do banco ao rodar docker compose down?', 'b', [
          'São apagados junto com o container',
          'Permanecem no volume nomeado dados; só down -v (ou remoção manual) apaga o volume',
          'São enviados ao registry',
          'São criptografados e movidos para o proxy'
        ], 'Volumes nomeados sobrevivem ao down comum.'),
        mcq('q6', 'Como a senha do banco chega aos containers neste projeto?', 'c', [
          'Escrita diretamente no compose.yaml, em texto puro',
          'Embutida na imagem com ENV',
          'Por Compose secret: arquivo local fora do Git montado em /run/secrets/db_password e lido via POSTGRES_PASSWORD_FILE',
          'Passada pelo proxy em cada requisição'
        ], 'Segredos ficam fora do YAML e da imagem, entregues como arquivos somente leitura.'),
        mcq('q7', 'Qual afirmação sobre portas neste projeto está correta?', 'a', [
          'Apenas o proxy publica porta no host (80); web, api, db e cache são acessíveis só pela rede interna',
          'Todos os serviços publicam portas',
          'Somente o banco publica porta',
          'Nenhum serviço pode ser acessado de fora, nem o proxy'
        ], 'Um único ponto de entrada reduz a superfície de ataque.'),
        fill('q8', 'Complete o subcomando que lista o estado e a saúde dos serviços do projeto:', 'docker compose ___', ['ps'], 'docker compose ps mostra serviços, estado e (healthy)/(unhealthy).')
      ]
    },
    {
      id: 'cti-20-imagens-por-dentro',
      title: 'Imagens por dentro',
      goal: 'Entender camadas, a camada gravável, digests e os comandos history, inspect, save/load, export/import e commit.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Camadas somente leitura e a camada gravável',
            'Uma imagem é uma pilha de camadas somente leitura, uma por instrução que altera arquivos. Quando um container inicia, o Docker coloca por cima uma fina camada GRAVÁVEL: tudo que o container escreve vai para ela (cópia-na-escrita: um arquivo da imagem é copiado para a camada gravável quando modificado). Ao remover o container, essa camada some. Camadas das imagens são compartilhadas: várias imagens e containers com a mesma base usam as mesmas camadas no disco.'
          ),
          sl(
            'docker history e docker image inspect',
            'docker history mostra as camadas de uma imagem, do comando que a criou ao tamanho — ótimo para ver o que engorda a imagem (e, como vimos, o que foi parar nela por engano). docker image inspect devolve o JSON completo: variáveis de ambiente, CMD/ENTRYPOINT, portas expostas, labels, lista de camadas e arquiteturas.',
            'docker history exemplo/app:1.0\ndocker image inspect exemplo/app:1.0'
          ),
          sl(
            'Endereçamento por conteúdo e digest',
            'Camadas e imagens são identificadas por um hash (sha256) do próprio conteúdo. Mudou um único byte, muda o hash; mesmo conteúdo, mesmo hash — por isso duas imagens com a mesma camada a guardam uma só vez, e referenciar por digest (nome@sha256:...) garante exatamente o conteúdo esperado. As tags são só apelidos apontando para esses hashes.'
          ),
          sl(
            'docker save e docker load',
            'docker save empacota UMA imagem (todas as camadas, tags e metadados) num arquivo .tar; docker load importa esse arquivo em outro Docker. Útil para levar imagens a ambientes sem acesso ao registry (isolados, offline) ou fazer cópias de segurança.',
            'docker save -o app.tar exemplo/app:1.0\ndocker load -i app.tar'
          ),
          sl(
            'docker export e docker import',
            'docker export despeja o sistema de arquivos de um CONTAINER em um tar, "achatado": sem camadas, sem histórico e sem metadados da imagem (ENV, CMD, ENTRYPOINT se perdem). docker import cria uma imagem nova a partir desse tar, mas ela nasce sem essas configurações. Resumo: save/load preservam a imagem; export/import só o conteúdo de arquivos.',
            'docker export meu-container > fs.tar\ndocker import fs.tar exemplo/app:achatada'
          ),
          sl(
            'docker commit e por que evitar',
            'docker commit transforma o estado atual de um container (incluindo a camada gravável) em uma nova imagem. Parece prático, mas evite: o resultado não é reproduzível (ninguém sabe o que foi feito dentro), não há Dockerfile para revisar, e ele captura lixo — logs, caches, e até segredos que estavam no container. Prefira sempre atualizar o Dockerfile e reconstruir.',
            'docker commit meu-container exemplo/app:manual   # evite em produção'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que acontece com os arquivos que um container grava na sua camada gravável quando ele é removido?', 'b', [
          'Ficam salvos na imagem',
          'São perdidos; para persistir é preciso usar volumes',
          'Vão automaticamente para o registry',
          'Ficam guardados no volume padrão'
        ], 'A camada gravável pertence ao container; dados importantes devem ir em volumes.'),
        mcq('q2', 'Duas imagens usam a mesma base. O que acontece com as camadas da base no disco?', 'd', [
          'São duplicadas para cada imagem',
          'São apagadas após o primeiro uso',
          'Só funciona se as imagens tiverem o mesmo nome',
          'São compartilhadas: a camada é armazenada uma única vez'
        ], 'Camadas idênticas (mesmo hash) são reaproveitadas.'),
        mcq('q3', 'Para que serve docker history?', 'a', [
          'Mostrar as camadas de uma imagem e os comandos que as criaram',
          'Mostrar os logs de um container',
          'Listar volumes',
          'Recuperar containers apagados'
        ], 'É útil para ver o que engorda a imagem e o que foi parar nela.'),
        fill('q4', 'Complete o comando que empacota uma imagem, com camadas e tags, em um arquivo tar:', 'docker ___ -o app.tar exemplo/app:1.0', ['save', 'image save'], 'docker save gera o tar da imagem; docker load faz o caminho de volta.'),
        mcq('q5', 'Qual a diferença entre docker save e docker export?', 'c', [
          'São idênticos',
          'save é para containers; export é para imagens',
          'save preserva a imagem (camadas e metadados); export achata o sistema de arquivos de um container, perdendo histórico e configurações como ENV e CMD',
          'export envia ao registry; save apaga'
        ], 'save/load mantêm a imagem íntegra; export/import só carregam arquivos.'),
        mcq('q6', 'Por que evitar docker commit para gerar imagens de produção?', 'b', [
          'Porque é proibido pelo Docker',
          'Porque não é reproduzível, não tem Dockerfile para revisar e pode capturar lixo e segredos do container',
          'Porque só funciona no Windows',
          'Porque apaga o container original'
        ], 'Imagens devem nascer de um Dockerfile versionado e reconstruível.'),
        mcq('q7', 'O que significa uma imagem ser endereçável por conteúdo?', 'd', [
          'Seu nome depende do conteúdo do README',
          'Seu endereço IP depende do conteúdo',
          'A tag latest sempre aponta para o mesmo lugar',
          'Seu identificador (digest) é o hash do conteúdo: mudou algo, muda o digest; mesmo conteúdo, mesmo digest'
        ], 'Tags são apelidos mutáveis; o digest é a identidade do conteúdo.'),
        fill('q8', 'Complete o comando que importa uma imagem de um arquivo tar gerado pelo save:', 'docker ___ -i app.tar', ['load', 'image load'], 'docker load restaura imagens a partir do tar do docker save.')
      ]
    },
    {
      id: 'cti-21-cicd-containers',
      title: 'CI/CD com containers',
      goal: 'Montar um pipeline build, test, scan, push e deploy, com tag por commit, cache e credenciais seguras.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O pipeline típico',
            'Um pipeline de entrega com containers segue etapas: build (construir a imagem), test (rodar os testes, de preferência no container), scan (escanear vulnerabilidades, com Trivy ou Scout), push (enviar ao registry) e deploy (colocar a imagem no ambiente). Cada etapa só roda se a anterior passar: uma imagem com falha de teste ou vulnerabilidade crítica nunca chega ao registry de produção.'
          ),
          sl(
            'Tag por commit SHA',
            'Marque cada imagem com o hash do commit que a gerou (ex.: app:3f2a9c1). Assim cada imagem é rastreável até o código exato, é imutável por construção (cada commit gera uma tag nova) e o rollback é simples: reimplante a tag do commit anterior. Evite depender de latest. Em Actions o hash está em github.sha.',
            'docker build -t ghcr.io/exemplo/app:$GIT_SHA .\ndocker push ghcr.io/exemplo/app:$GIT_SHA'
          ),
          sl(
            'Cache em CI',
            'Runners de CI costumam começar do zero, sem cache de camadas — o build ficaria sempre lento. A solução é exportar e importar o cache do BuildKit para um local persistente: --cache-to e --cache-from (no Actions, type=gha usa o cache do próprio GitHub; type=registry guarda o cache no registry). Combinado com a boa ordem do Dockerfile, o build só refaz o que mudou.'
          ),
          sl(
            'Autenticação no registry com tokens',
            'O pipeline precisa fazer login para enviar imagens. Use um token com escopo mínimo (apenas escrever no registry necessário), guardado no cofre de segredos do CI (no GitHub, Secrets) — jamais no repositório nem no workflow em texto puro. No GitHub Actions com GHCR, o GITHUB_TOKEN automático, com permissions: packages: write, evita criar um token manual.'
          ),
          sl(
            'Exemplo com GitHub Actions',
            'O fluxo mais comum usa ações oficiais da Docker: setup-buildx, login-action e build-push-action. O trecho abaixo faz login no GHCR, constrói, aplica a tag por SHA, usa cache e envia. Confira as versões atuais das ações ao adotar (fixar por hash de commit é uma prática ainda mais segura).',
            'permissions:\n  contents: read\n  packages: write\njobs:\n  image:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: docker/setup-buildx-action@v3\n      - uses: docker/login-action@v3\n        with:\n          registry: ghcr.io\n          username: ${{ github.actor }}\n          password: ${{ secrets.GITHUB_TOKEN }}\n      - uses: docker/build-push-action@v6\n        with:\n          context: .\n          push: true\n          tags: ghcr.io/${{ github.repository }}:${{ github.sha }}\n          cache-from: type=gha\n          cache-to: type=gha,mode=max'
          ),
          sl(
            'Não vazar segredos nos logs',
            'Logs de CI são lidos por muita gente e guardados por muito tempo. Nunca imprima segredos (echo $TOKEN, set -x com variáveis sensíveis, docker build --build-arg TOKEN=...: o ARG fica no histórico da imagem!). Os cofres de CI mascaram o valor exato do segredo nos logs, mas transformações dele (base64, partes) podem escapar. Para segredos de build, use secrets do BuildKit (--secret) em vez de ARG.'
          ),
          sl(
            'Promover a mesma imagem entre ambientes',
            'Construa UMA vez e promova a mesma imagem (o mesmo digest) por dev, homologação e produção, adicionando tags (ex.: promover o commit aprovado para a tag de release). Reconstruir a imagem para cada ambiente invalida o teste: o que foi validado deixa de ser o que vai para produção. As diferenças entre ambientes ficam na configuração externa, não na imagem.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual a ordem típica de um pipeline de containers e por que ela importa?', 'a', [
          'build, test, scan, push, deploy: cada etapa só roda se a anterior passar, barrando imagens com falhas',
          'deploy, build, test, push, scan',
          'push, deploy, test, scan, build',
          'As etapas não têm ordem'
        ], 'Falhar cedo evita publicar ou implantar uma imagem quebrada ou vulnerável.'),
        mcq('q2', 'Qual a vantagem de taguear imagens com o SHA do commit?', 'c', [
          'Reduz o tamanho da imagem',
          'Faz o build ficar mais rápido',
          'Rastreabilidade até o código exato, tags imutáveis por construção e rollback simples',
          'Dispensa o registry'
        ], 'Cada commit gera uma tag nova; para voltar, reimplanta-se a tag anterior.'),
        mcq('q3', 'Por que configurar cache explícito (cache-from/cache-to) em CI?', 'd', [
          'Para armazenar senhas',
          'Para dispensar testes',
          'Para executar o deploy em paralelo',
          'Porque o runner começa do zero e, sem cache exportado/importado, todo build refaria todas as camadas'
        ], 'O cache do BuildKit precisa ser persistido fora do runner efêmero.'),
        fill('q4', 'Complete a variável de contexto do GitHub Actions com o hash do commit na tag:', 'tags: ghcr.io/exemplo/app:${{ github.___ }}', ['sha'], 'github.sha é o hash do commit que disparou o workflow.'),
        mcq('q5', 'Como o pipeline deve autenticar-se no registry?', 'b', [
          'Com a senha pessoal da conta, escrita no workflow',
          'Com um token de escopo mínimo, guardado no cofre de segredos do CI (ou o GITHUB_TOKEN com permissions: packages: write no GHCR)',
          'Sem autenticação, pois registries são públicos',
          'Com o token commitado no repositório'
        ], 'Escopo mínimo e cofre de segredos reduzem o dano caso o pipeline seja comprometido.'),
        mcq('q6', 'Qual prática evita vazar segredos pelo pipeline?', 'c', [
          'Passar o token com --build-arg para o Dockerfile',
          'Usar echo $TOKEN para conferir o valor',
          'Entregar segredos de build com --secret (secrets do BuildKit) e nunca imprimi-los; o mascaramento do CI não cobre transformações',
          'Guardar o token em um arquivo dentro do repositório'
        ], 'ARG vai para o histórico da imagem e logs são amplamente visíveis.'),
        mcq('q7', 'Por que promover a mesma imagem (mesmo digest) entre ambientes em vez de reconstruir por ambiente?', 'a', [
          'Porque o que foi testado é exatamente o que vai para produção; as diferenças ficam na configuração externa',
          'Porque reconstruir é proibido',
          'Porque a imagem de produção precisa ser maior',
          'Porque o registry cobra por build'
        ], 'Reconstruir por ambiente invalida os testes feitos na imagem anterior.'),
        fill('q8', 'Complete o contexto que lê segredos do cofre do GitHub Actions:', 'password: ${{ ___.REGISTRY_TOKEN }}', ['secrets'], 'secrets.NOME lê o valor guardado no cofre do repositório/organização, sem expô-lo no YAML.')
      ]
    },
    {
      id: 'cti-22-context-docker-remoto',
      title: 'Docker context e Docker remoto',
      goal: 'Operar daemons remotos com contexts e SSH e entender por que expor a API do Docker ou dar acesso ao grupo docker é perigoso.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'docker context: várias conexões, um CLI',
            'O Docker CLI é só um cliente: ele fala com um daemon, que pode estar na sua máquina ou em outra. Um context é uma conexão nomeada a um daemon. Você cria contexts, lista, e alterna com docker context use — todos os comandos seguintes passam a rodar naquele daemon. Também dá para usar um context só em um comando com --context.',
            'docker context ls\ndocker context create producao --docker "host=ssh://deploy@servidor.exemplo.com"\ndocker context use producao\ndocker --context producao ps'
          ),
          sl(
            'DOCKER_HOST=ssh://',
            'A variável DOCKER_HOST faz o CLI usar um daemon remoto, e o esquema ssh:// leva a conversa por um túnel SSH, usando suas chaves e sem expor nenhuma porta nova do Docker. Requer SSH funcionando e o Docker no servidor. Cuidado com o contexto atual: rodar docker compose down achando que está na máquina local, quando o context ativo é a produção, é um erro clássico — confira sempre onde você está antes de comandos destrutivos.',
            'DOCKER_HOST=ssh://deploy@servidor.exemplo.com docker ps\n\n# PowerShell:\n# $env:DOCKER_HOST = "ssh://deploy@servidor.exemplo.com"\n# docker ps'
          ),
          sl(
            'Expor a API do Docker sem TLS é gravíssimo',
            'O daemon pode escutar em uma porta TCP (a clássica 2375, sem criptografia nem autenticação). Quem alcançar essa porta controla o Docker: pode criar um container que monta o disco do host e assumir a máquina inteira — é acesso root remoto, sem senha. Nunca exponha a API sem proteção; já houve muitos servidores comprometidos (inclusive para mineração de criptomoedas) por esse motivo.'
          ),
          sl(
            'Formas seguras de acesso remoto',
            'Prefira SSH com chaves (como no DOCKER_HOST=ssh://), com usuário dedicado, autenticação por chave, sem senha, e firewall limitando origens. Se precisar da API em TCP, use TLS com autenticação mútua por certificados de cliente (porta 2376) e restrinja por firewall. Em ambos os casos, registre quem acessa e use o princípio do menor privilégio.'
          ),
          sl(
            'Grupo docker é praticamente root',
            'No Linux, quem pertence ao grupo docker pode falar com o daemon sem sudo — e, como ele pode iniciar um container que monte o sistema de arquivos do host como leitura e escrita, na prática pode virar root na máquina. Adicionar alguém a esse grupo é concedê-lo poder equivalente ao do root. Conceda apenas a pessoas e contas de confiança (inclusive contas de CI).'
          ),
          sl(
            'Docker rootless: visão geral',
            'No modo rootless, o próprio daemon e os containers rodam sob um usuário comum, sem privilégios de root no host. Se houver um escape de container ou uma invasão da API, o atacante cai com os poderes limitados daquele usuário, não com os de root. Há restrições (por exemplo, portas abaixo de 1024, alguns modos de rede e de armazenamento), mas é uma camada de defesa valiosa quando viável.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que é um docker context?', 'b', [
          'Um tipo de volume',
          'Uma conexão nomeada a um daemon Docker (local ou remoto) que o CLI pode alternar',
          'Um perfil de Compose',
          'Uma imagem especial'
        ], 'O CLI é um cliente; o context define com qual daemon ele conversa.'),
        mcq('q2', 'O que faz DOCKER_HOST=ssh://deploy@servidor docker ps?', 'd', [
          'Abre um terminal SSH comum, sem Docker',
          'Lista só os containers locais',
          'Instala o Docker no servidor',
          'Executa o comando contra o daemon do servidor, usando um túnel SSH'
        ], 'O esquema ssh:// leva a API do Docker por SSH, sem expor porta nova.'),
        mcq('q3', 'Por que expor a API do Docker na porta 2375 sem TLS é gravíssimo?', 'a', [
          'Quem alcançar a porta controla o Docker e pode assumir o host (é um root remoto sem autenticação)',
          'Porque deixa a rede mais lenta',
          'Porque corrompe as imagens',
          'Porque a porta 2375 só aceita leitura'
        ], 'A API permite criar containers que montam o host: acesso total.'),
        fill('q4', 'Complete o subcomando que passa a usar o context "producao" nos comandos seguintes:', 'docker context ___ producao', ['use'], 'docker context use alterna o contexto ativo; confira onde está antes de comandos destrutivos.'),
        mcq('q5', 'Por que adicionar um usuário ao grupo docker deve ser feito com cautela?', 'c', [
          'Porque o grupo docker não existe no Linux',
          'Porque o usuário perde acesso a arquivos',
          'Porque, na prática, equivale a dar root: ele pode iniciar containers que montam o sistema de arquivos do host',
          'Porque limita o usuário a 10 containers'
        ], 'Acesso ao daemon significa poder equivalente ao do root.'),
        mcq('q6', 'Qual a ideia do Docker rootless?', 'b', [
          'Rodar containers sem imagem',
          'Rodar o daemon e os containers como usuário comum, limitando o dano se houver escape ou invasão',
          'Remover a necessidade de redes',
          'Dispensar o uso de volumes'
        ], 'Menos privilégio no host reduz o impacto de uma falha, com algumas limitações de funcionalidades.'),
        mcq('q7', 'Qual a forma mais adequada de administrar um Docker remoto?', 'd', [
          'Abrir a porta 2375 para a internet',
          'Compartilhar a senha de root do servidor',
          'Expor o docker.sock em um site',
          'SSH com chaves e usuário dedicado (ou TLS com certificado de cliente), com firewall restringindo a origem'
        ], 'Acesso autenticado, cifrado e restrito é o mínimo para um daemon remoto.'),
        fill('q8', 'Complete o esquema da URL de DOCKER_HOST que leva o acesso por um túnel SSH:', 'DOCKER_HOST=___://deploy@servidor.exemplo.com docker ps', ['ssh'], 'ssh:// usa as chaves e o túnel SSH, sem expor a API do Docker.')
      ]
    },
    {
      id: 'cti-29-ferramentas-ecossistema',
      title: 'Ferramentas do ecossistema',
      goal: 'Conhecer ferramentas de visualização, inspeção, segurança e atualização de imagens, e os riscos de dar acesso ao docker.sock.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Interfaces e visibilidade',
            'Docker Desktop é a interface gráfica oficial para Windows, macOS e Linux: lista containers, imagens, volumes, logs e inclui o motor Docker. Portainer é uma interface web para gerenciar containers, redes, volumes e stacks Compose, inclusive de servidores remotos; ele roda ele mesmo como container. No terminal, lazydocker e ctop mostram painéis interativos com containers, uso de CPU/memória e logs, sem sair do shell. Em comum: tornam o Docker mais visível, mas cada uma é uma superfície a mais — use só o que você precisa.'
          ),
          sl(
            'O risco do docker.sock',
            'O Docker é controlado por uma API acessada pelo socket /var/run/docker.sock. Quem fala com esse socket manda no Docker — e, na prática, no host: basta criar um container que monte a raiz do host (ou rodar privilegiado) para ler e escrever qualquer arquivo como root. Por isso, montar o socket num container (Portainer, lazydocker, CI, Watchtower) dá a ele acesso equivalente a root no host. Montar com :ro NÃO resolve: só impede mexer no arquivo do socket; a API continua totalmente utilizável. Medidas: monte o socket só em ferramentas confiáveis, não exponha a interface de gerenciamento na internet (use 127.0.0.1, VPN ou proxy autenticado), troque a senha padrão logo no primeiro acesso e mantenha a ferramenta atualizada.',
            '  portainer:\n    image: portainer/portainer-ce\n    ports:\n      - "127.0.0.1:9443:9443"\n    volumes:\n      - /var/run/docker.sock:/var/run/docker.sock   # acesso root ao host!'
          ),
          sl(
            'Inspecionando imagens: docker history, dive e hadolint',
            'docker history <imagem> lista as camadas, o comando que criou cada uma e o tamanho — útil para achar onde a imagem engordou e, atenção, onde um segredo foi embutido (comandos e ENV ficam visíveis). dive abre uma interface no terminal para navegar camada por camada, ver quais arquivos foram adicionados/alterados e quanto espaço é desperdiçado (arquivos apagados numa camada seguinte continuam ocupando espaço). hadolint, visto antes, olha o Dockerfile (antes do build) em busca de más práticas; dive e history analisam a imagem já construída.',
            'docker history minha-imagem:1.0\ndive minha-imagem:1.0'
          ),
          sl(
            'Segurança: Trivy, Docker Scout, Grype e Syft',
            'Scanners comparam o conteúdo da imagem (pacotes do sistema e dependências da aplicação) com bases de vulnerabilidades conhecidas (CVEs). Trivy é um scanner amplo (imagens, sistemas de arquivos, repositórios, configurações IaC). Docker Scout é a solução integrada ao ecossistema Docker (docker scout cves). Grype é outro scanner de vulnerabilidades e Syft gera o SBOM, a lista de materiais de software (tudo o que há na imagem), que pode alimentar o Grype. O resultado muda com o tempo: uma imagem sem problemas hoje pode ter CVEs amanhã, então escaneie na CI e periodicamente, e priorize pelo que é explorável no seu contexto (há falsos positivos).',
            'trivy image minha-imagem:1.0\ndocker scout cves minha-imagem:1.0'
          ),
          sl(
            'Atualização: Dependabot/Renovate e o risco do Watchtower',
            'Fixar versões dá reprodutibilidade, mas elas envelhecem. Dependabot e Renovate são bots que vigiam seus arquivos (Dockerfile, compose, dependências) e abrem pull requests com as novas tags ou digests; a CI roda os testes e uma pessoa revisa antes de aceitar — atualização com controle. Watchtower faz diferente: monitora a imagem dos containers em execução e, quando sai uma nova, baixa e recria o container sozinho. Vantagem: simplicidade, bom para laboratório. Riscos em produção: entra versão com defeito (ou comprometida) sem revisão nem teste, sem plano de rollback, e ele precisa do docker.sock. Em produção prefira PR + CI + versão fixada e deploy deliberado.'
          ),
          sl(
            'docker init, extensões e quando usar cada uma',
            'docker init, executado na pasta do projeto, detecta a linguagem e gera Dockerfile, compose.yaml e .dockerignore iniciais — ótimo ponto de partida, mas REVISE (usuário, versões, portas). Docker Desktop Extensions são complementos instaláveis dentro do Docker Desktop (visualizadores, scanners, ferramentas de banco), em visão geral: úteis no dia a dia do desenvolvedor, e como qualquer software de terceiros merecem confiança verificada. Resumo de uso: Desktop/lazydocker no dia a dia local; hadolint na CI antes do build; dive para otimizar; Trivy/Scout na CI e no registry; Dependabot/Renovate para manter atualizado; Portainer só se o time precisa de painel e com o acesso protegido.',
            'docker init'
          )
        ]
      },
      questions: [
        mcq('q1', 'Para que serve a ferramenta dive?', 'b', [
          'Escanear CVEs na imagem',
          'Navegar pelas camadas de uma imagem e ver quais arquivos cada uma adiciona e quanto espaço se desperdiça',
          'Atualizar containers automaticamente',
          'Validar a sintaxe do compose.yaml'
        ], 'dive é uma ferramenta de inspeção de camadas; scanners de CVE são outra categoria (Trivy, Scout, Grype).'),
        mcq('q2', 'Por que montar /var/run/docker.sock num container é arriscado?', 'a', [
          'Quem controla o socket controla o Docker e, na prática, o host: equivale a acesso root',
          'Porque o socket não funciona dentro de containers',
          'Porque apaga os logs do host',
          'Porque limita o container a 1 CPU'
        ], 'Com a API do Docker é possível criar containers que montam o sistema de arquivos do host como root.'),
        mcq('q3', 'No trecho abaixo, o :ro torna o acesso ao socket seguro?\n    volumes:\n      - /var/run/docker.sock:/var/run/docker.sock:ro', 'd', [
          'Sim, torna o socket totalmente inofensivo',
          'Sim, desde que o container seja Alpine',
          'Sim, porque :ro bloqueia a criação de containers',
          'Não: :ro só impede alterar o arquivo do socket; a API do Docker continua usável com todo o poder'
        ], 'O que importa é poder falar com a API, não escrever no arquivo do socket.'),
        fill('q4', 'Complete o comando que mostra as camadas e os comandos que criaram a imagem:', 'docker ___ minha-imagem:1.0', ['history'], 'docker history lista camadas, comandos e tamanhos — inclusive segredos mal colocados em ENV ou RUN.'),
        mcq('q5', 'O que fazem Dependabot e Renovate em relação ao Dockerfile?', 'c', [
          'Reconstroem a imagem em produção automaticamente',
          'Bloqueiam o uso de tags',
          'Abrem pull requests propondo novas tags ou digests, para a CI testar e uma pessoa revisar',
          'Apagam imagens antigas do registry'
        ], 'É atualização com controle: mudança proposta, testada e revisada antes de entrar.'),
        mcq('q6', 'Qual o principal risco de usar Watchtower em produção?', 'a', [
          'Atualiza containers sozinho quando surge imagem nova, sem revisão nem testes, e precisa do docker.sock',
          'Só funciona com imagens do Docker Hub públicas',
          'Impede o uso de volumes',
          'Não consegue recriar containers'
        ], 'Uma versão defeituosa ou comprometida entra sem validação; e ainda é uma ferramenta com poder de root no host.'),
        mcq('q7', 'O que faz o comando docker init na pasta de um projeto?', 'c', [
          'Inicializa o Docker Swarm',
          'Apaga imagens sem uso',
          'Gera Dockerfile, compose.yaml e .dockerignore iniciais, que devem ser revisados',
          'Escaneia vulnerabilidades do projeto'
        ], 'É um gerador de arquivos de partida; a revisão (usuário, versões, portas) continua sendo sua.'),
        fill('q8', 'Complete o subcomando do Trivy que escaneia uma imagem de container:', 'trivy ___ minha-imagem:1.0', ['image'], 'trivy image procura vulnerabilidades conhecidas nos pacotes e dependências da imagem.')
      ]
    },
    {
      id: 'cti-23-boas-praticas-producao',
      title: 'Boas práticas de produção',
      goal: 'Reunir imutabilidade, stateless, config externa, limites, healthchecks, logs, rollback, backups e observabilidade em um checklist.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Imagens imutáveis',
            'Em produção, um container em execução nunca é "consertado" por dentro (nada de docker exec para editar arquivos). Para mudar algo, constrói-se uma nova imagem versionada e recria-se o container. Isso garante que o que roda é exatamente o que foi testado e que qualquer instância pode ser substituída por outra idêntica.'
          ),
          sl(
            'Stateless: o estado fica fora do container',
            'Um container deve ser descartável. Estado (dados de usuários, uploads, sessões) vive em volumes, bancos e serviços externos — nunca só na camada gravável do container. Assim você pode atualizar, mover ou escalar sem perder dados. O que for estado precisa de backup; o resto, não.'
          ),
          sl(
            'Config e segredos externos; menor privilégio',
            'A mesma imagem em todos os ambientes, com configuração e segredos injetados de fora (variáveis, arquivos, Compose secrets, cofres). Combine com tudo que vimos de segurança: usuário não-root, sistema de arquivos somente leitura quando possível, capabilities mínimas, imagens oficiais atualizadas e escaneadas, nenhuma porta além do necessário.'
          ),
          sl(
            'Healthchecks, limites, restart e logs',
            'Defina healthcheck em cada serviço, limites de memória/CPU/processos, uma política de restart adequada (unless-stopped ou on-failure) e rotação de logs (max-size/max-file). São quatro linhas de configuração que evitam as quedas mais comuns: app travado sem ninguém notar, vizinho barulhento, reinício manual toda vez, disco cheio de logs.',
            'services:\n  api:\n    image: ghcr.io/exemplo/api:1.4.2\n    restart: unless-stopped\n    healthcheck:\n      test: ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"]\n    deploy:\n      resources:\n        limits:\n          memory: 512M\n    logging:\n      driver: json-file\n      options:\n        max-size: "10m"\n        max-file: "3"'
          ),
          sl(
            'Atualização e rollback com tags',
            'Atualize apontando para uma nova tag fixa e deixando o Compose recriar só o que mudou: docker compose pull baixa as imagens novas e docker compose up -d recria os containers com imagem diferente. Rollback = voltar o arquivo para a tag anterior e rodar up -d de novo — possível só porque as tags de versão (ou digests) são fixas e imutáveis, e não latest. Antes de migrações de banco irreversíveis, tenha backup.',
            'docker compose pull\ndocker compose up -d'
          ),
          sl(
            'Backups, retenção e observabilidade mínima',
            'Faça backup do que é estado (bancos, volumes), criptografado, guardado fora do servidor, com retenção definida (importante para a LGPD, que também pede que dados de quem solicitou exclusão não fiquem para sempre em cópias) e com restauração TESTADA. Para observar, o mínimo é: logs acessíveis e rotacionados, healthchecks, docker stats/alertas de disco e memória e, conforme cresce, métricas com Prometheus/Grafana. Para vários servidores, alta disponibilidade e escala automática, orquestradores como Docker Swarm ou Kubernetes entram em cena — Compose em um host único atende muitos projetos.'
          ),
          sl(
            'Checklist de produção',
            'Imagem com tag fixa (nunca latest) e escaneada; roda como não-root, sem --privileged e sem docker.sock; sem segredos na imagem ou no Git; configuração externa; portas mínimas (só o proxy); healthcheck + limites + restart + logs rotacionados; volumes só para o estado, com backup testado e dados pessoais tratados conforme a LGPD; deploy automatizado a partir do CI, promovendo a mesma imagem; plano de rollback e monitoramento básico.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que significa tratar imagens como imutáveis em produção?', 'c', [
          'Nunca atualizar a aplicação',
          'Usar sempre a tag latest',
          'Não alterar containers em execução; para mudar, gerar uma nova imagem versionada e recriar o container',
          'Impedir o uso de volumes'
        ], 'O que roda é exatamente o que foi construído e testado; mudanças vêm por novas imagens.'),
        mcq('q2', 'Por que o container deve ser stateless?', 'a', [
          'Para poder ser substituído, movido ou escalado sem perder dados, que ficam em volumes e serviços externos',
          'Para ocupar menos disco',
          'Para dispensar o Dockerfile',
          'Para não precisar de rede'
        ], 'O estado vive fora da camada gravável; o container é descartável.'),
        mcq('q3', 'O que torna o rollback simples em produção?', 'd', [
          'Usar a tag latest e esperar',
          'Apagar o volume e recriar',
          'Reconstruir a imagem antiga manualmente',
          'Tags de versão fixas (ou digests): basta voltar a tag anterior e rodar docker compose up -d'
        ], 'Com tags imutáveis, a versão anterior continua disponível no registry.'),
        fill('q4', 'Complete a política de restart que reinicia o container, exceto se foi parado manualmente:', 'restart: ___', ['unless-stopped'], 'unless-stopped mantém o serviço no ar após falhas e reinício do Docker, respeitando uma parada manual.'),
        mcq('q5', 'Qual prática de backup está alinhada às boas práticas de produção?', 'b', [
          'Copiar os dados para a mesma máquina, sem testar',
          'Backup criptografado, fora do servidor, com retenção definida e restauração testada',
          'Guardar tudo indefinidamente, sem controle',
          'Fazer backup só da imagem'
        ], 'Backups sem teste de restauração, sem criptografia ou sem retenção são fonte de risco (e de problemas com a LGPD).'),
        mcq('q6', 'Qual item contraria o checklist de produção?', 'c', [
          'Tag de versão fixa e imagem escaneada',
          'Usuário não-root e portas mínimas',
          'Usar a tag latest e --privileged por conveniência',
          'Healthcheck, limites e logs rotacionados'
        ], 'latest e --privileged minam reprodutibilidade e segurança.'),
        mcq('q7', 'Quando faz sentido considerar Swarm ou Kubernetes em vez de Compose num único host?', 'a', [
          'Quando precisa de vários servidores, alta disponibilidade e escala/auto-recuperação automáticas',
          'Sempre, mesmo para um app simples',
          'Nunca; Compose faz tudo',
          'Apenas para guardar logs'
        ], 'Orquestradores resolvem multi-host; para um host único, Compose costuma bastar.'),
        fill('q8', 'Complete o subcomando que baixa as imagens novas antes de recriar os serviços numa atualização:', 'docker compose ___\ndocker compose up -d', ['pull'], 'pull busca as imagens atualizadas; depois up -d recria só o que mudou.')
      ]
    }
  ]
};
