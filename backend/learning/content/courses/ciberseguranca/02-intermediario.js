// Módulo "Intermediário" do curso de Cibersegurança — parte A (lições 01 a 21).
// Curso DEFENSIVO e educacional: cada ataque é explicado junto de como prevenir, detectar e responder.
// Sem exploits, payloads ou malware; dados e endereços fictícios (faixas de documentação 192.0.2.x etc.);
// segredos sempre <placeholder>. Leis (LGPD, Marco Civil, Lei 12.737/2012) só em visão geral, sem
// substituir orientação jurídica. Saídas marcadas como "ilustrativas" não foram executadas; a saída
// do exemplo em Python da lição de criptografia foi executada de verdade.
// Helpers: mcq recebe a letra correta e as 4 alternativas (a, b, c, d); fill recebe prompt, código com
// a lacuna ___ e a lista de respostas aceitas (a 1ª é a canônica); sl() monta um slide (code opcional).
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
  id: 'intermediario-ciber',
  levelKey: 'intermediate',
  order: 2,
  title: 'Intermediário',
  subtitle: 'ATT&CK, criptografia e PKI, identidade, hardening, redes defensivas, vulnerabilidades, SIEM, detecção, EDR, malware, phishing, senhas, ransomware e resposta a incidentes',
  accent: '#0ea5e9',
  lessons: [
    {
      id: 'csi-01-mitre-attack',
      title: 'A matriz MITRE ATT&CK',
      goal: 'Usar a matriz ATT&CK como vocabulário comum para descrever o comportamento de ataques e para medir a cobertura da defesa.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é o ATT&CK e por que existe',
            'MITRE ATT&CK (Adversarial Tactics, Techniques, and Common Knowledge) é uma base de conhecimento pública, mantida pela organização MITRE, que cataloga COMO atacantes reais se comportam depois de observados em incidentes. Ela não é um programa nem uma ferramenta: é um vocabulário compartilhado. Em vez de dizer "eles fizeram umas coisas estranhas no servidor", a equipe diz "usaram a técnica X da tática Y", e qualquer analista no mundo entende. Serve para descrever ataques, planejar defesas, treinar equipes e conversar com fornecedores.'
          ),
          sl(
            'Táticas: o PORQUÊ',
            'Uma TÁTICA é o objetivo do atacante em um momento do ataque, a pergunta "o que ele quer agora?". Exemplos de táticas: Acesso Inicial (entrar no ambiente), Execução (rodar código), Persistência (continuar com acesso após reinício ou troca de senha), Escalada de Privilégio (obter permissões maiores), Evasão de Defesa (não ser notado), Acesso a Credenciais, Descoberta (entender o ambiente), Movimentação Lateral (passar para outras máquinas), Coleta, Comando e Controle, Exfiltração (tirar dados) e Impacto (destruir, cifrar, interromper). As táticas formam as COLUNAS da matriz.',
            'Colunas (táticas)  ->  Acesso Inicial | Execução | Persistência | ... | Exfiltração | Impacto\nLinhas (técnicas)  ->  as formas de alcançar cada objetivo'
          ),
          sl(
            'Técnicas e subtécnicas: o COMO',
            'Uma TÉCNICA é uma forma concreta de atingir o objetivo de uma tática. Uma SUBTÉCNICA detalha uma variação da técnica. Exemplo conceitual: na tática Acesso Inicial existe a técnica Phishing (e-mail enganoso), com subtécnicas como anexo malicioso e link malicioso. Cada técnica tem um identificador que começa com T e um número (por exemplo T1566 para phishing; subtécnicas ganham um sufixo como T1566.001). Cada página descreve o que a técnica é, quais grupos já a usaram, como DETECTAR e como MITIGAR. Um erro comum é achar que técnica e tática são sinônimos: tática é o objetivo, técnica é o método.'
          ),
          sl(
            'Usando o ATT&CK para entender um ataque',
            'Quando um incidente acontece, o analista mapeia cada evidência para uma técnica. Exemplo fictício: um funcionário abre um anexo (Acesso Inicial, phishing), um script roda (Execução), cria uma tarefa agendada que se repete (Persistência), alguém lista os computadores da rede (Descoberta) e depois dados saem por um serviço de nuvem (Exfiltração). Ao ligar os pontos, o relatório mostra a sequência do ataque, ajuda a achar o que falta investigar (se há Persistência, onde ela está?) e permite comparar com outros incidentes.',
            'Evidência                         -> Tática            -> Técnica (conceito)\nAnexo aberto por usuário          -> Acesso Inicial    -> Phishing\nTarefa agendada nova              -> Persistência      -> Tarefa agendada\nListagem de máquinas da rede      -> Descoberta        -> Descoberta de sistemas remotos\nUpload grande para a nuvem        -> Exfiltração       -> Exfiltração por serviço web'
          ),
          sl(
            'Usando o ATT&CK para medir a defesa',
            'O outro uso é olhar para dentro: para cada técnica relevante ao seu negócio, pergunte "eu CONSIGO detectar isso? eu consigo bloquear?". Isso gera um mapa de cobertura, muitas vezes pintado em cores (verde: detecta e bloqueia; amarelo: só detecta; vermelho: sem visibilidade). O mapa mostra lacunas e ajuda a priorizar investimento: se várias técnicas de Persistência estão em vermelho, falta telemetria ali. Cuidado com o erro de buscar 100% de cobertura: não existe e nem é o objetivo; priorize as técnicas mais prováveis para o seu tipo de organização.'
          ),
          sl(
            'Limites e cuidados',
            'O ATT&CK descreve comportamento, NÃO ensina a atacar: ele diz o que observar e como se defender. Também não é uma lista de checagem de conformidade, nem uma garantia: estar "coberto" em uma técnica no papel não prova que a detecção funciona de verdade, por isso as detecções precisam ser testadas em laboratório próprio e com autorização. A matriz evolui com o tempo (novas técnicas surgem), então use a versão atual do site oficial em vez de decorar números. Existem matrizes separadas para ambientes corporativos, nuvem e dispositivos móveis.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Em um relatório, o analista escreve: "o atacante queria continuar com acesso mesmo se a senha fosse trocada". No ATT&CK, isso descreve qual elemento?', 'b', [
          'Uma técnica chamada Descoberta, pois ela busca entender o ambiente da vítima',
          'A tática de Persistência, que é o objetivo de manter o acesso ao longo do tempo',
          'Uma subtécnica de Impacto, porque a troca de senha afeta o serviço',
          'Um identificador T, que representa o grupo de atacantes responsável'
        ], 'Persistência é a tática (objetivo) de manter acesso. Descoberta é outra tática, Impacto trata de destruir ou interromper, e o identificador T numera técnicas, não grupos.'),
        mcq('q2', 'Qual é a relação correta entre tática, técnica e subtécnica?', 'd', [
          'Subtécnica é o objetivo geral, técnica é o método e tática é o nome do programa usado',
          'As três são sinônimos usados por fornecedores diferentes para o mesmo conceito',
          'Tática é a ferramenta usada, técnica é o grupo de atacantes e subtécnica é a data do ataque',
          'Tática é o objetivo, técnica é um modo de alcançá-lo e subtécnica é uma variação'
        ], 'A hierarquia é objetivo (tática), método (técnica) e variação do método (subtécnica). As outras opções misturam os conceitos com ferramentas, grupos ou datas.'),
        mcq('q3', 'Uma equipe pinta a matriz de vermelho nas técnicas em que não tem nenhuma visibilidade. Para que serve esse mapa?', 'a', [
          'Mostrar lacunas de detecção e ajudar a priorizar onde investir primeiro',
          'Provar para auditores que a empresa está 100% protegida contra todas as técnicas conhecidas',
          'Listar os atacantes que já invadiram a empresa, em ordem cronológica de ataque',
          'Substituir os testes das detecções, pois o mapa já confirma que elas funcionam'
        ], 'O mapa de cobertura expõe lacunas. Ele não prova proteção total, não lista atacantes e não dispensa testar as detecções.'),
        fill('q4', 'Complete: as COLUNAS da matriz ATT&CK representam os objetivos do atacante, chamados de ___.', 'colunas = ___ (objetivos); linhas = técnicas', ['táticas', 'taticas', 'tática', 'tatica'], 'As colunas são as táticas, os objetivos em cada momento do ataque. As técnicas são as formas de alcançá-los.'),
        mcq('q5', 'Durante um incidente, você encontra uma tarefa agendada desconhecida que reexecuta um script todo dia. Como mapear no ATT&CK?', 'c', [
          'Como Exfiltração, porque tarefas agendadas servem para enviar dados para fora da rede',
          'Como Descoberta, já que o script lista informações do computador a cada execução',
          'Como Persistência, porque a tarefa garante que o código volte a rodar mesmo após reinício',
          'Como Acesso Inicial, pois toda tarefa agendada marca a entrada do atacante no ambiente'
        ], 'Um mecanismo que reexecuta código ao longo do tempo serve à persistência. Exfiltração e Descoberta dependem do que o script faz, e Acesso Inicial é a entrada, que veio antes.'),
        mcq('q6', 'Uma gestora pede "cobertura de 100% da matriz ATT&CK". Qual resposta é a mais adequada?', 'a', [
          'Cobertura total não é realista; priorize técnicas prováveis e teste as detecções',
          'Ok, basta comprar uma ferramenta que declare suporte a todas as técnicas e o assunto está encerrado',
          'Impossível: o ATT&CK só serve para descrever ataques passados e não para planejar defesa',
          'Ok, mas só as táticas precisam estar cobertas; as técnicas e subtécnicas são opcionais'
        ], 'Priorizar por risco e validar as detecções é a prática correta. Declaração de suporte não garante detecção funcional, e o ATT&CK serve também para planejar defesa.'),
        mcq('q7', 'Por que o ATT&CK NÃO deve ser tratado como manual para atacar?', 'd', [
          'Porque as páginas são privadas e só o MITRE pode acessá-las',
          'Porque ele só contém ferramentas de defesa e nenhuma descrição de comportamento de atacante',
          'Porque cada técnica foi inventada pela equipe do MITRE sem relação com ataques reais',
          'Descreve comportamento e traz detecção e mitigação, não passo a passo de ataque'
        ], 'O foco do ATT&CK é descrever comportamento e orientar detecção e mitigação. Ele é público e baseado em incidentes reais observados.'),
        fill('q8', 'Os identificadores de técnicas do ATT&CK começam com a letra ___ seguida de um número (por exemplo T1566).', 'ID da técnica: ___1566', ['T', 't'], 'Os IDs de técnica começam com T (T1566 é phishing); subtécnicas acrescentam um sufixo como .001.')
      ]
    },
    {
      id: 'csi-02-kill-chain-e-diamond',
      title: 'Cyber Kill Chain e Modelo Diamante',
      goal: 'Entender duas formas de modelar uma intrusão, saber onde interromper o ataque e comparar esses modelos com o ATT&CK.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que modelar um ataque',
            'Um ataque raramente é um único evento: é uma sequência de passos. Modelos ajudam a organizar o raciocínio, a achar o ponto mais barato para interromper e a explicar o incidente para quem não é técnico. Nesta lição você vê dois modelos clássicos e como eles se encaixam com o ATT&CK da lição anterior. Nenhum modelo é "o certo": cada um responde a uma pergunta diferente.'
          ),
          sl(
            'Cyber Kill Chain: a linha do tempo',
            'A Cyber Kill Chain (cadeia de ataque), criada pela Lockheed Martin, divide uma intrusão em 7 fases em sequência: 1) Reconhecimento (pesquisar o alvo), 2) Armamento (preparar a ferramenta de ataque), 3) Entrega (levar até a vítima, por exemplo por e-mail), 4) Exploração (aproveitar uma falha ou ação do usuário), 5) Instalação (deixar um acesso persistente), 6) Comando e Controle (canal de comunicação com o atacante) e 7) Ações sobre o objetivo (roubar, cifrar, destruir). A ideia central: se você quebrar UMA corrente, o ataque inteiro falha.',
            '1 Reconhecimento -> 2 Armamento -> 3 Entrega -> 4 Exploração ->\n5 Instalação -> 6 Comando e Controle -> 7 Ações sobre o objetivo'
          ),
          sl(
            'Onde interromper: defesa em cada fase',
            'Para cada fase existe uma defesa típica. Reconhecimento: reduzir informação pública e monitorar varreduras. Entrega: filtro de e-mail, bloqueio de anexos perigosos, treinamento. Exploração: correção de vulnerabilidades (patching) e menor privilégio. Instalação: controle de aplicações e EDR. Comando e Controle: filtragem de saída (egress) e de DNS. Ações sobre o objetivo: backup, segmentação e DLP. Quanto mais CEDO você interrompe, menor o dano e mais barato é o incidente. Por isso a defesa em camadas atua em várias fases ao mesmo tempo.'
          ),
          sl(
            'Modelo Diamante: quatro vértices',
            'O Modelo Diamante analisa cada EVENTO de intrusão em quatro vértices ligados: Adversário (quem ataca), Capacidade (as ferramentas e técnicas usadas), Infraestrutura (domínios, servidores e endereços que ele usa) e Vítima (quem ou o que foi atingido). Ligações entre eles viram perguntas de investigação: que infraestrutura entregou essa capacidade? Quem mais foi vítima da mesma infraestrutura? É um modelo para CORRELACIONAR eventos e agrupar atividade, muito usado em inteligência de ameaças. Ele também tem eixos de contexto social-político e de tecnologia.',
            'Adversário ---- Capacidade\n    |    \\  /   |\n    |     \\/    |\nInfraestrutura --- Vítima'
          ),
          sl(
            'Exemplo fictício nos dois modelos',
            'Cenário: uma funcionária recebe um e-mail com um link que leva a uma página falsa de login. Na Kill Chain, isso é a fase de Entrega (e depois Exploração, pois ela digitou a senha). No Diamante: Vítima = a funcionária, Infraestrutura = o domínio falso e o servidor que o hospeda, Capacidade = o kit de página falsa de phishing, Adversário = desconhecido (ainda). Se outro colega recebeu e-mail do mesmo domínio, o vértice Infraestrutura liga os dois eventos. A defesa: bloquear o domínio, resetar a senha e ativar MFA.'
          ),
          sl(
            'Comparando com o ATT&CK',
            'Kill Chain: poucas fases, visão de alto nível, linear; boa para comunicar e escolher onde cortar. ATT&CK: centenas de técnicas, detalhado, não linear (o atacante vai e volta entre táticas); boa para detecção e cobertura. Diamante: não é uma lista de passos e sim uma forma de relacionar adversário, ferramentas, infraestrutura e vítima; boa para inteligência e atribuição. Eles se complementam: use a Kill Chain para a conversa, o ATT&CK para a engenharia de detecção e o Diamante para correlacionar campanhas. Limite da Kill Chain: foca na entrada pelo perímetro e representa pior ameaças internas ou ataques via nuvem e credenciais roubadas.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um filtro de e-mail passa a bloquear anexos executáveis vindos de fora. Em qual fase da Kill Chain essa defesa atua?', 'c', [
          'Reconhecimento, porque impede o atacante de descobrir o endereço de e-mail',
          'Instalação, pois impede que um acesso persistente seja criado depois da infecção',
          'Entrega, pois barra o meio pelo qual a ferramenta chegaria até a vítima',
          'Ações sobre o objetivo, já que protege os dados finais da empresa'
        ], 'Filtrar e-mail corta o canal de entrega. Reconhecimento é a pesquisa sobre o alvo; Instalação e Ações sobre o objetivo vêm depois.'),
        mcq('q2', 'Qual é a principal vantagem de interromper um ataque em uma fase inicial da Kill Chain?', 'a', [
          'O ataque falha antes de causar dano, e o custo do incidente é menor',
          'O atacante é identificado automaticamente e preso pelas autoridades, o que encerra o caso',
          'As fases seguintes deixam de existir para qualquer atacante, em qualquer empresa',
          'Não é mais preciso monitorar as fases posteriores nem manter backups'
        ], 'Cortar cedo evita o dano e reduz custo. Isso não identifica nem prende o atacante e não dispensa defesa em camadas.'),
        mcq('q3', 'No Modelo Diamante, qual vértice representa os domínios e servidores usados pelo atacante?', 'd', [
          'Vítima',
          'Adversário',
          'Capacidade',
          'Infraestrutura'
        ], 'Infraestrutura é o que o atacante usa para entregar e controlar: domínios, servidores e endereços. Capacidade são as ferramentas e técnicas.'),
        fill('q4', 'Complete: a Cyber Kill Chain tem a fase final chamada "Ações sobre o ___" (roubar, cifrar ou destruir).', 'Fase 7: Ações sobre o ___', ['objetivo', 'objetivos'], 'A fase 7 é Ações sobre o objetivo: o momento em que o atacante cumpre sua meta.'),
        mcq('q5', 'Dois funcionários receberam e-mails diferentes, mas ambos levavam a links do mesmo domínio falso. Qual modelo ajuda mais a ligar os dois eventos?', 'b', [
          'Kill Chain, pois ela mostra o vértice Infraestrutura repetido entre os incidentes',
          'Diamante, pois o vértice Infraestrutura aparece repetido e conecta os eventos',
          'Modelo algum serve, porque e-mails diferentes indicam atacantes diferentes',
          'ATT&CK, porque ele identifica quem é o atacante pelo nome do domínio'
        ], 'O Diamante serve para correlacionar eventos pelos vértices compartilhados. A Kill Chain ordena fases, e o ATT&CK descreve comportamentos, sem atribuir autoria só pelo domínio.'),
        mcq('q6', 'Qual afirmação compara corretamente os modelos?', 'c', [
          'A Kill Chain é mais detalhada que o ATT&CK, com centenas de técnicas por fase',
          'O Diamante substitui a Kill Chain por ser uma sequência mais longa de fases',
          'O ATT&CK é mais detalhado e não linear; a Kill Chain é mais simples e linear',
          'Os três modelos são idênticos e só mudam de nome conforme o fornecedor'
        ], 'A Kill Chain tem 7 fases lineares; o ATT&CK detalha técnicas e não é linear; o Diamante é um modelo de relações, não de fases.'),
        mcq('q7', 'Um atacante usa credenciais roubadas de um serviço em nuvem, sem enviar nenhum malware. Qual limite da Kill Chain isso ilustra?', 'd', [
          'A Kill Chain só funciona para ataques que usam e-mail',
          'A Kill Chain proíbe analisar ataques que envolvam senhas',
          'A Kill Chain exige que o atacante seja conhecido antes da análise',
          'Foi pensada para a entrada pelo perímetro e falha com credenciais legítimas'
        ], 'A Kill Chain adapta-se mal a intrusões sem malware ou via identidade; por isso é complementada por modelos como o ATT&CK.'),
        fill('q8', 'No Modelo Diamante, os quatro vértices são Adversário, Capacidade, Infraestrutura e ___.', 'Adversário, Capacidade, Infraestrutura e ___', ['vítima', 'vitima'], 'O quarto vértice é a Vítima: quem ou o que foi atingido pelo evento.')
      ]
    },
    {
      id: 'csi-03-criptografia-aplicada',
      title: 'Criptografia aplicada',
      goal: 'Escolher o tipo certo de criptografia para cada problema, guardar senhas com KDF e sal, e evitar os erros mais comuns.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Simétrica e assimétrica',
            'Criptografia SIMÉTRICA usa a MESMA chave para cifrar e decifrar (exemplo: AES). É rápida e boa para grandes volumes de dados, mas exige que os dois lados já compartilhem a chave de forma segura. Criptografia ASSIMÉTRICA usa um PAR de chaves: a pública (pode ser divulgada) e a privada (secreta). O que a pública cifra, só a privada decifra; e o que a privada assina, a pública verifica. É mais lenta, mas resolve a distribuição de chaves. Na prática combina-se as duas: a assimétrica negocia uma chave, a simétrica protege o volume de dados. Erro comum: achar que "chave pública" é segredo, ou compartilhar a privada.'
          ),
          sl(
            'Modos de operação e troca de chaves',
            'Um algoritmo de bloco como o AES cifra blocos de tamanho fixo; o MODO de operação define como encadear os blocos. O modo ECB cifra cada bloco de forma independente e repete padrões do texto original (uma imagem cifrada em ECB ainda deixa o desenho visível), por isso NÃO deve ser usado. Modos autenticados, como o GCM, além de cifrar, detectam alteração (integridade). Todo modo moderno precisa de um nonce ou IV (valor único por mensagem) que nunca deve se repetir com a mesma chave. A TROCA de chaves (como o Diffie-Hellman) permite que dois lados combinem uma chave secreta compartilhada em um canal aberto, sem enviar a chave em si.'
          ),
          sl(
            'Hash, sal e KDF para senhas',
            'Um hash transforma qualquer entrada em uma impressão digital de tamanho fixo, sem volta. Para guardar SENHAS, um hash rápido como SHA-256 puro é ruim: o atacante que vazar o banco testa bilhões de palpites por segundo. A solução tem duas partes. SAL: um valor aleatório diferente para cada usuário, guardado junto do hash; com ele, duas pessoas com a mesma senha têm hashes diferentes e tabelas pré-calculadas deixam de servir. KDF (função de derivação de chave) lenta de propósito: scrypt, bcrypt, Argon2 e PBKDF2 gastam tempo e memória, encarecendo cada palpite. Nunca invente o seu próprio esquema.'
          ),
          sl(
            'Exemplo real em Python (laboratório)',
            'O trecho abaixo usa só a biblioteca padrão do Python. A saída mostrada foi executada de verdade e foi truncada para caber. Observe: o mesmo texto com o mesmo sal gera sempre o mesmo resultado; com sal diferente, resultado totalmente diferente; e o HMAC (hash com chave) muda por completo quando um único valor da mensagem muda, o que permite detectar adulteração.',
            'import hashlib, hmac, secrets\nsenha = b"senha-de-exemplo"\nprint(hashlib.sha256(senha).hexdigest()[:16])\n# 662f21669c52e00f   (hash rápido, sem sal: evite para senhas)\nsal1 = bytes.fromhex("00112233445566778899aabbccddeeff")\nsal2 = bytes.fromhex("ffeeddccbbaa99887766554433221100")\nprint(hashlib.scrypt(senha, salt=sal1, n=2**14, r=8, p=1, dklen=32).hex()[:32])\n# d7ac80fdc2e86de83005a7b61d730c5a\nprint(hashlib.scrypt(senha, salt=sal2, n=2**14, r=8, p=1, dklen=32).hex()[:32])\n# 23bf6daf8305d7dfcabb7b2654161dde   (outro sal, outro hash)\nchave = b"chave-demo-<placeholder>"\nt1 = hmac.new(chave, b"pedido=42;valor=10.00", hashlib.sha256).hexdigest()\nt2 = hmac.new(chave, b"pedido=42;valor=99.00", hashlib.sha256).hexdigest()\nprint(hmac.compare_digest(t1, t2))   # False: mensagem adulterada\nprint(len(secrets.token_hex(16)))    # 32: 16 bytes aleatórios seguros'
          ),
          sl(
            'Assinaturas digitais e HMAC',
            'Uma ASSINATURA DIGITAL usa a chave privada para assinar um documento; qualquer pessoa com a chave pública confere que o documento veio do dono da chave (autenticidade), não foi alterado (integridade) e que o dono não pode negar a autoria (não repúdio). Já o HMAC usa uma chave SECRETA COMPARTILHADA: prova integridade e autenticidade entre quem conhece a chave, mas sem não repúdio, pois os dois lados poderiam ter gerado a etiqueta. Use hmac.compare_digest para comparar etiquetas, evitando vazamento por tempo de comparação.'
          ),
          sl(
            'Erros comuns',
            'Criar a própria criptografia (use bibliotecas consolidadas). Usar números aleatórios fracos: para segredos use secrets (ou o gerador do sistema), nunca random. Chaves e senhas dentro do código ou do repositório. Reutilizar nonce/IV com a mesma chave. Usar ECB. Confundir codificação com cifra: Base64 é só uma forma de representar bytes e NÃO protege nada. Usar MD5 ou SHA-1 para segurança. Esquecer a gestão de chaves: quem guarda, quem rotaciona e como se revoga uma chave comprometida é tão importante quanto o algoritmo. Em dados pessoais, a LGPD pede medidas técnicas adequadas; a criptografia é uma delas, sem substituir orientação jurídica.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Uma equipe precisa cifrar um arquivo de 2 GB e já tem uma chave compartilhada com segurança entre os dois lados. Qual abordagem se encaixa?', 'a', [
          'Criptografia simétrica, que é rápida para grandes volumes',
          'Criptografia assimétrica diretamente sobre os 2 GB, por ser mais segura e mais rápida que a simétrica',
          'Base64, que protege o arquivo com a chave compartilhada',
          'Calcular o hash do arquivo, que também esconde o conteúdo'
        ], 'Simétrica é rápida e adequada para volumes grandes. A assimétrica é lenta para isso, Base64 não é cifra e hash não permite recuperar o conteúdo.'),
        mcq('q2', 'Por que cada usuário deve ter um sal próprio ao guardar a senha?', 'c', [
          'Para que o sal sirva como segunda senha que o usuário digita no login',
          'Para que o hash fique menor e o banco de dados ocupe menos espaço',
          'Para que senhas iguais gerem hashes diferentes e as tabelas prontas falhem',
          'Para permitir recuperar a senha original caso o usuário a esqueça'
        ], 'O sal é público dentro do registro e serve para diferenciar os hashes. Ele não é uma senha, não reduz tamanho e não torna o hash reversível.'),
        mcq('q3', 'O banco de dados de uma aplicação foi vazado e as senhas estavam guardadas com SHA-256 puro, sem sal. Qual é o risco principal?', 'b', [
          'O SHA-256 é reversível, então basta aplicar a função inversa para ver as senhas',
          'O atacante testa muitos palpites por segundo e senhas fracas são descobertas rapidamente',
          'Risco baixo, pois o hash é irreversível e isso impede qualquer teste de palpites',
          'Só o administrador do sistema consegue comparar hashes, então o vazamento é inofensivo'
        ], 'Hash rápido e sem sal permite testar palpites em massa. O hash não é reversível, mas isso não impede ataque por tentativa; a defesa é KDF lenta com sal.'),
        fill('q4', 'Complete: para guardar senhas use uma KDF lenta de propósito, como o scrypt, o bcrypt ou o ___.', 'KDFs para senhas: scrypt, bcrypt, ___', ['argon2', 'argon2id', 'pbkdf2'], 'Argon2 (assim como PBKDF2) é uma KDF projetada para encarecer cada tentativa de adivinhar a senha.'),
        mcq('q5', 'Um desenvolvedor guarda dados "protegidos" com Base64. O que está errado?', 'd', [
          'Base64 só funciona com textos em inglês, então dados em português ficam expostos',
          'Base64 é seguro, mas precisa ser aplicado duas vezes para valer como cifra',
          'Base64 é uma cifra assimétrica que exige a chave pública do destinatário',
          'Base64 é só uma codificação reversível por qualquer pessoa, sem chave'
        ], 'Codificação não é criptografia: qualquer pessoa reverte o Base64 sem chave nenhuma.'),
        mcq('q6', 'Qual a vantagem de uma assinatura digital sobre um HMAC?', 'a', [
          'A assinatura dá não repúdio: só o dono da chave privada poderia gerá-la',
          'A assinatura é bem mais rápida e usa a mesma chave secreta nos dois lados',
          'O HMAC não detecta alteração de mensagem, enquanto a assinatura detecta',
          'A assinatura dispensa qualquer gestão de chaves'
        ], 'Com chave privada, só uma parte pode assinar, o que dá não repúdio. O HMAC detecta alteração, mas a chave é compartilhada.'),
        mcq('q7', 'Qual escolha é adequada para gerar um token de redefinição de senha?', 'c', [
          'random.randint, porque basta que o número pareça aleatório para o usuário',
          'O horário atual em segundos, pois é único a cada momento',
          'secrets.token_hex ou o gerador seguro do sistema operacional',
          'Os primeiros caracteres do hash do e-mail do usuário'
        ], 'Segredos exigem gerador criptograficamente seguro, como secrets. Os demais são previsíveis para quem conhece o contexto.'),
        fill('q8', 'Complete: o modo de operação ___ cifra cada bloco de forma independente, repete padrões do texto original e não deve ser usado.', 'Modo que NÃO deve ser usado: ___', ['ecb'], 'O ECB mantém padrões visíveis porque blocos iguais geram cifrados iguais; prefira modos autenticados como o GCM.')
      ]
    },
    {
      id: 'csi-04-pki-certificados-tls',
      title: 'PKI, certificados e TLS',
      goal: 'Entender como certificados e autoridades certificadoras criam confiança na web e diagnosticar problemas comuns de certificado.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O problema que a PKI resolve',
            'Você usa criptografia assimétrica para falar com um site. Mas como ter certeza de que a chave pública pertence mesmo ao site e não a um impostor? PKI (Public Key Infrastructure, infraestrutura de chaves públicas) é o conjunto de pessoas, regras e tecnologia que amarra uma chave pública a uma identidade por meio de CERTIFICADOS digitais. Sem isso, qualquer um poderia dizer "esta chave é do meu banco".'
          ),
          sl(
            'Certificado e Autoridade Certificadora',
            'Um certificado digital (padrão X.509) contém: o nome do dono (por exemplo o domínio), a chave pública, o período de validade, quem emitiu e uma assinatura digital do emissor. A AUTORIDADE CERTIFICADORA (AC ou CA) é a entidade confiável que verifica o pedido e assina o certificado. Seu navegador e seu sistema trazem uma lista de ACs raiz confiáveis. Se a assinatura confere e o nome bate com o site, o navegador confia.',
            'Certificado de loja.example\n  Dono (assunto): loja.example\n  Chave pública : <chave>\n  Validade      : início ... fim\n  Emissor       : AC Intermediária\n  Assinatura    : <assinatura do emissor>'
          ),
          sl(
            'Cadeia de confiança',
            'As ACs raiz ficam offline e muito protegidas; elas assinam ACs INTERMEDIÁRIAS, que por sua vez assinam os certificados dos sites (certificado final ou "folha"). O servidor envia a folha e as intermediárias; o navegador sobe a cadeia até encontrar uma raiz que já conhece. Se uma intermediária estiver faltando, alguns clientes mostram erro mesmo com certificado válido: é um problema de configuração comum. Se uma intermediária for comprometida, só a parte da cadeia abaixo dela é afetada, sem precisar trocar a raiz.'
          ),
          sl(
            'Validade, revogação e transparência',
            'Todo certificado tem data de expiração. Certificado EXPIRADO gera alerta no navegador e pode derrubar sistemas que dependem dele: inventariar e automatizar renovações é prática essencial. REVOGAÇÃO é cancelar um certificado antes do fim, por exemplo se a chave privada vazou; os meios são a CRL (lista de revogados) e o OCSP (consulta online do status). A TRANSPARÊNCIA DE CERTIFICADOS (Certificate Transparency) registra publicamente cada certificado emitido; assim o dono de um domínio pode monitorar os logs e descobrir certificados que ele não pediu.'
          ),
          sl(
            'TLS em nível conceitual',
            'TLS (Transport Layer Security) é o protocolo por trás do HTTPS. Em linhas gerais: o cliente se conecta, o servidor apresenta o certificado, o cliente valida a cadeia, a validade e se o nome bate com o endereço acessado, e os dois combinam chaves de sessão (troca de chaves). A partir daí o tráfego é cifrado e protegido contra alteração com criptografia simétrica. TLS garante confidencialidade e integridade em trânsito e autentica o servidor; não garante que o site seja honesto nem que o código dele seja seguro: um site de golpe também pode ter certificado válido.'
          ),
          sl(
            'Autoassinado, expirado e erros comuns',
            'Certificado AUTOASSINADO é assinado pela própria chave dele, sem AC: serve em laboratório e testes internos, mas em produção o navegador não tem como confiar; e acostumar usuários a clicar em "continuar mesmo assim" é um péssimo hábito, pois abre espaço para ataque de interceptação. Erros típicos de certificado: expirado, nome que não bate com o domínio, cadeia incompleta, emissor desconhecido, protocolo antigo habilitado. Conferir seus próprios certificados (laboratório ou sistemas da empresa) é rotina de higiene. Protocolos antigos (versões iniciais de SSL/TLS) devem ser desativados.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é o papel de uma Autoridade Certificadora?', 'b', [
          'Armazenar as senhas dos usuários do site para recuperá-las em caso de esquecimento',
          'Verificar o pedido e assinar o certificado, ligando a chave pública a uma identidade',
          'Cifrar todo o tráfego do site sem que o servidor participe da conexão',
          'Hospedar o site e garantir que o conteúdo dele seja honesto'
        ], 'A AC atesta a identidade assinando o certificado. Ela não guarda senhas, não cifra o tráfego por conta própria e não garante a honestidade do site.'),
        mcq('q2', 'O navegador mostra erro em um site cujo certificado é válido, mas o servidor não enviou o certificado da AC intermediária. Qual é a causa mais provável?', 'd', [
          'O certificado do servidor foi emitido para um nome de domínio diferente',
          'A chave privada do servidor foi publicada na internet',
          'O site usa HTTP puro em vez de HTTPS e por isso o erro aparece',
          'A cadeia está incompleta e o cliente não chega a uma raiz conhecida'
        ], 'Sem a intermediária o cliente não monta a cadeia até a raiz. As outras causas teriam sintomas ou mensagens diferentes.'),
        mcq('q3', 'A chave privada de um servidor vazou antes de o certificado expirar. O que fazer?', 'a', [
          'Revogar, emitir novo certificado com novas chaves e investigar o vazamento',
          'Esperar o vencimento, pois o certificado deixa de valer sozinho em pouco tempo',
          'Trocar a senha do administrador do servidor e manter o mesmo certificado e as mesmas chaves',
          'Desativar o TLS e voltar a usar HTTP até o certificado vencer'
        ], 'Chave comprometida exige revogação e novo par de chaves. Esperar o vencimento mantém o risco, e voltar para HTTP piora a situação.'),
        fill('q4', 'Complete: a lista pública que registra todos os certificados emitidos, permitindo monitorar domínios, chama-se Certificate ___.', 'Certificate ___ (registro público de emissões)', ['transparency', 'transparência', 'transparencia'], 'Certificate Transparency (transparência de certificados) permite descobrir certificados emitidos para o seu domínio sem sua autorização.'),
        mcq('q5', 'Um site de golpe exibe o cadeado do HTTPS. O que isso prova?', 'c', [
          'Que o site foi aprovado por um órgão do governo e é seguro para compras',
          'Que o dono do site é a empresa cujo nome aparece na página',
          'Conexão cifrada e nome conferido, sem garantir que o site seja honesto',
          'Que o conteúdo das páginas foi revisado e está livre de código malicioso'
        ], 'O cadeado mostra conexão cifrada e certificado válido para aquele domínio. Honestidade e segurança do conteúdo são outra questão.'),
        mcq('q6', 'Qual uso de certificado autoassinado é aceitável?', 'a', [
          'Ambiente de teste interno, com a confiança configurada de forma consciente',
          'Site de loja virtual aberto ao público, para economizar com a emissão',
          'Portal de internet banking, desde que o cliente aceite o aviso do navegador',
          'Qualquer serviço na internet, se os usuários forem instruídos a ignorar o alerta'
        ], 'Em laboratório a confiança pode ser configurada manualmente. Em serviços públicos, ensinar o usuário a ignorar alertas abre caminho a interceptação.'),
        mcq('q7', 'Uma empresa teve um serviço interno fora do ar na madrugada, sem ataque algum, pois um certificado venceu. Qual medida evita o problema?', 'd', [
          'Emitir certificados com validade de décadas para reduzir a frequência de renovação',
          'Instalar mais um firewall na frente do serviço',
          'Desativar a validação de certificado nos clientes internos',
          'Inventariar os certificados e automatizar a renovação com alertas'
        ], 'Inventário e renovação automática com alertas evitam expiração. Desativar validação enfraquece a segurança, e certificados sempre têm validade.'),
        fill('q8', 'Complete: o protocolo que protege o tráfego do HTTPS, usando certificados e chaves de sessão, chama-se ___.', 'HTTPS = HTTP sobre ___', ['tls', 'ssl/tls', 'tls/ssl'], 'TLS é o protocolo que cifra e protege a integridade do tráfego do HTTPS; SSL é o nome do antecessor, já obsoleto.')
      ]
    },
    {
      id: 'csi-05-iam-sso-federacao',
      title: 'IAM, SSO e federação de identidades',
      goal: 'Gerenciar o ciclo de vida de identidades, escolher modelos de autorização e entender SSO, SAML e OIDC de forma conceitual.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é IAM',
            'IAM (Identity and Access Management, gestão de identidades e acessos) é o conjunto de processos e ferramentas que garante que as PESSOAS e SISTEMAS certos tenham o acesso certo, aos recursos certos, pelos motivos certos. Uma IDENTIDADE é a representação digital de alguém ou algo (funcionário, terceiro, serviço, robô). Hoje a identidade é considerada o novo perímetro: com nuvem e trabalho remoto, controlar quem é quem pesa mais do que controlar a porta da rede. Revise as ideias de AAA e menor privilégio do nível iniciante, pois são a base daqui.'
          ),
          sl(
            'Ciclo de vida: joiner, mover, leaver',
            'JOINER: a pessoa entra e recebe os acessos mínimos do cargo, ideal em um pacote aprovado. MOVER: a pessoa muda de área; os acessos antigos precisam ser REMOVIDOS, não só somados, senão ela acumula permissões (o chamado "acúmulo de privilégios" ou privilege creep). LEAVER: a pessoa sai; as contas devem ser desativadas imediatamente. Contas esquecidas de ex-funcionários são uma porta aberta clássica. Boas práticas: o RH como fonte de verdade, automação do processo e revisões periódicas de acesso (recertificação), em que o gestor confirma quem ainda precisa de quê.',
            'Entrou  -> pacote mínimo do cargo\nMudou   -> remove o antigo + concede o novo\nSaiu    -> desativa contas e revoga acessos no mesmo dia'
          ),
          sl(
            'RBAC e ABAC',
            'RBAC (controle de acesso baseado em papéis): os acessos são ligados a PAPÉIS (Financeiro, Suporte) e as pessoas recebem papéis. É simples de entender e auditar; o risco é a "explosão de papéis" e papéis grandes demais. ABAC (baseado em atributos): a decisão considera atributos como departamento, horário, localização, nível do dispositivo e sensibilidade do dado, por exemplo "gerente pode ver relatórios do próprio departamento, só de dispositivo gerenciado". É mais flexível e fino, porém mais difícil de gerenciar. Muitas empresas combinam: papéis para o básico, atributos para regras de contexto.'
          ),
          sl(
            'SSO e federação',
            'SSO (Single Sign-On, login único): a pessoa faz login UMA vez em um provedor de identidade (IdP) e acessa vários sistemas (os provedores de serviço) sem digitar senha de novo. Benefícios: menos senhas para lembrar, política de segurança e MFA centralizadas, e desligar a pessoa em um lugar só. Risco: o IdP vira ponto crítico, então precisa de MFA forte e monitoramento. FEDERAÇÃO é o SSO entre organizações diferentes: uma empresa confia na identidade que outra afirma, por exemplo um parceiro entrando com a conta da própria empresa.'
          ),
          sl(
            'SAML e OIDC em nível conceitual',
            'São os dois protocolos mais comuns para SSO. SAML: antigo e muito usado em sistemas corporativos; o IdP envia uma ASSERÇÃO (documento assinado digitalmente) dizendo "esta pessoa é usuario@example.com e tem estes atributos". OIDC (OpenID Connect): mais moderno, construído sobre o OAuth 2.0 e usando JSON e tokens, comum em aplicações web e móveis; o app recebe um ID token que diz quem é o usuário. Distinção importante: OAuth 2.0 trata de AUTORIZAÇÃO (permitir que um app acesse algo em nome de alguém), enquanto o OIDC acrescenta AUTENTICAÇÃO (quem é a pessoa). Em ambos, a assinatura do IdP é validada pelo serviço, e tokens são segredos: não devem vazar em logs ou URLs.'
          ),
          sl(
            'MFA corporativo e boas práticas',
            'No SSO a MFA é aplicada no IdP e vale para todos os sistemas ligados. Prefira fatores resistentes a phishing (chaves de segurança padrão FIDO2, passkeys) para administradores e contas sensíveis; aplicativos autenticadores são melhores que SMS. Defina o que fazer quando alguém perde o fator (processo de recuperação), pois o suporte vira alvo de engenharia social. Mantenha contas de emergência (break-glass) guardadas e monitoradas. Cuidado com dados pessoais: colete só os atributos necessários na federação (LGPD, princípio da necessidade), e registre quem acessou o quê.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Uma funcionária do financeiro foi transferida para o marketing, mas continua acessando o sistema de pagamentos. Qual falha de IAM ocorreu?', 'c', [
          'Falha no leaver, pois ela deixou a empresa e a conta não foi desativada',
          'Falha no joiner, porque ela deveria ter recebido acesso ao marketing antes de entrar',
          'Falha no mover, pois os acessos antigos não foram removidos na mudança de área',
          'Falha de MFA, porque o sistema de pagamentos exigiu só a senha'
        ], 'Mudança de área sem remover o acesso anterior é privilege creep, uma falha do processo mover. Ela não saiu da empresa, e o problema não é o MFA.'),
        mcq('q2', 'O que o SSO traz de benefício principal, e qual o cuidado associado?', 'b', [
          'Elimina a necessidade de MFA, mas exige que cada sistema guarde as senhas',
          'Centraliza política e MFA, mas o IdP vira ponto crítico e exige proteção forte',
          'Permite compartilhar uma única senha entre os funcionários da empresa',
          'Dispensa o controle de acesso em cada aplicação, pois o IdP decide tudo sozinho'
        ], 'O SSO concentra a autenticação, o que facilita controle mas torna o IdP um alvo valioso. Cada aplicação ainda precisa autorizar.'),
        mcq('q3', 'Qual regra é típica de ABAC e não de RBAC?', 'd', [
          'Usuários do papel Suporte acessam o sistema de chamados',
          'Quem tem o papel Administrador pode criar contas',
          'Gerentes recebem o mesmo conjunto fixo de acessos, independentemente do departamento',
          'Gerente só vê o próprio departamento, e só de dispositivo gerenciado'
        ], 'ABAC decide por atributos de contexto, como departamento e dispositivo. As outras regras dependem só do papel.'),
        fill('q4', 'Complete: a sigla do processo de gestão dos acessos ao longo da vida do funcionário é joiner, ___, leaver.', 'joiner, ___, leaver', ['mover'], 'Joiner entra, mover muda de área (e perde acessos antigos), leaver sai e tem tudo desativado.'),
        mcq('q5', 'Qual protocolo foi construído sobre o OAuth 2.0 para acrescentar autenticação, com ID token em JSON?', 'a', [
          'OpenID Connect (OIDC)',
          'SAML, que usa asserções assinadas em XML',
          'RADIUS, usado em acesso à rede',
          'Kerberos, protocolo restrito a sistemas de arquivos'
        ], 'O OIDC acrescenta autenticação ao OAuth 2.0. SAML é outro protocolo, de natureza diferente, e os demais não são o padrão de SSO descrito.'),
        mcq('q6', 'Um parceiro externo precisa acessar o portal da empresa usando a conta da própria empresa dele. Isso é chamado de:', 'b', [
          'Escalada de privilégio, pois o parceiro ganhou acesso além do que deveria',
          'Federação de identidades, em que uma organização confia na identidade afirmada por outra',
          'Hardening, porque o acesso foi reduzido ao mínimo necessário para o portal',
          'Backup de credenciais, porque o parceiro guarda a conta em dois lugares'
        ], 'Federação é a confiança entre organizações na afirmação de identidade. Não é escalada, hardening nem backup.'),
        mcq('q7', 'Qual cuidado vale para tokens e asserções de SSO?', 'd', [
          'Podem ser colocados em URLs para facilitar o compartilhamento entre colegas',
          'Devem ser registrados completos nos logs para ajudar na depuração',
          'Não precisam de validação de assinatura se vierem da rede interna',
          'São segredos: a assinatura deve ser validada e eles não vazam em logs ou URLs'
        ], 'Token vazado equivale a credencial vazada. A assinatura do IdP deve ser sempre validada, mesmo na rede interna.'),
        fill('q8', 'Complete: o acúmulo de permissões de quem muda de função várias vezes sem perder as antigas chama-se privilege ___.', 'privilege ___ (acúmulo de permissões)', ['creep'], 'Privilege creep: o acesso só cresce porque ninguém remove o que deixou de ser necessário; a revisão periódica de acessos combate isso.')
      ]
    }
,
    {
      id: 'csi-43-inventario-de-ativos-cmdb',
      title: 'Inventário de ativos e CMDB',
      goal: 'Explicar por que o inventário de ativos é a base da segurança e saber manter um inventário com dono, criticidade e descoberta automática.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Não se protege o que não se conhece',
            'ATIVO é qualquer coisa que tem valor para a organização e precisa de proteção: computadores, servidores, software, dados, contas de usuário e até pessoas e processos. INVENTÁRIO DE ATIVOS é a lista organizada desses itens. Quase todo controle de segurança depende dele: não dá para aplicar patch em um servidor que ninguém sabe que existe, nem monitorar uma conta que ninguém registrou, nem proteger um banco de dados cuja existência foi esquecida. Por isso frameworks de segurança costumam colocar o inventário como PRIMEIRO passo. Erro comum: achar que inventário é tarefa burocrática de uma vez só; na prática ele envelhece rápido e precisa ser mantido.'
          ),
          sl(
            'Quatro famílias de ativos',
            'Um bom inventário cobre pelo menos quatro famílias. 1) HARDWARE: notebooks, servidores, switches, celulares corporativos, dispositivos IoT. 2) SOFTWARE: sistemas operacionais, aplicativos, bibliotecas e serviços em nuvem contratados. 3) DADOS: bases de clientes, documentos financeiros, backups, com a informação de onde ficam e se há dados pessoais (relação com a LGPD, que exige saber que dados pessoais a organização trata). 4) IDENTIDADES: contas de pessoas, contas de serviço usadas por sistemas, chaves e tokens. Atacantes adoram o que ninguém lista, como uma conta de serviço antiga com senha que nunca muda.',
            'Família      Exemplos (fictícios)\nHardware     srv-app-01 (192.0.2.10), notebook-0456\nSoftware     Sistema de RH v3 (fornecedor X), servidor web\nDados        Cadastro de clientes (contém dados pessoais)\nIdentidades  usuario@example.com, svc-backup (conta de serviço)'
          ),
          sl(
            'CMDB: o banco de dados dos ativos',
            'CMDB (Configuration Management Database, banco de dados de gerenciamento de configuração) é o repositório onde cada ativo vira um registro com seus atributos e RELAÇÕES. Em vez de uma planilha solta, ele diz: o servidor srv-app-01 hospeda o sistema de RH, que usa o banco bd-rh-02, que guarda dados pessoais e pertence ao departamento de pessoas. Essas relações respondem perguntas de incidente, como "se este servidor cair ou for invadido, o que mais é afetado?". Uma planilha pode ser um começo válido para organizações pequenas; o que importa é a informação ser completa, atual e consultável.'
          ),
          sl(
            'Dono e criticidade',
            'Dois atributos transformam a lista em ferramenta de segurança. O DONO DO ATIVO é a pessoa ou área responsável por ele: decide quem pode acessá-lo, aprova mudanças e responde por ele em um incidente. Ativo sem dono é ativo sem cuidado. A CRITICIDADE indica o quanto o ativo importa para o negócio (por exemplo baixa, média, alta), considerando impacto de indisponibilidade, de vazamento e de alteração indevida. Ela orienta prioridades: um servidor de alta criticidade recebe patch, backup e monitoramento antes de uma máquina de teste. Quem define a criticidade é o dono junto da segurança, não só a equipe técnica.'
          ),
          sl(
            'Descoberta automática, shadow IT e ativos órfãos',
            'Inventário feito à mão fica desatualizado. A DESCOBERTA AUTOMÁTICA usa ferramentas que consultam a própria rede, a nuvem, o antivírus ou EDR e o diretório de usuários para achar o que existe e comparar com o inventário (sempre no ambiente da organização e com autorização). Isso revela duas situações. SHADOW IT é tecnologia usada sem conhecimento ou aprovação da TI, como uma equipe que contrata um serviço de nuvem com o cartão da empresa. ATIVO ÓRFÃO é aquele que existe, mas perdeu o dono: o servidor do projeto encerrado, a conta de quem saiu da empresa. Ambos viram portas esquecidas, sem patch e sem monitoramento.'
          ),
          sl(
            'Ligação com vulnerabilidades e risco',
            'O inventário alimenta outros processos. Na gestão de vulnerabilidades (veja a lição própria), o ciclo começa descobrindo os ativos: a varredura só cobre o que está no inventário, e a pergunta "essa falha afeta algum dos nossos sistemas?" só tem resposta rápida com ele. Na gestão de risco, criticidade e dono permitem estimar o impacto e decidir prioridades. Na resposta a incidentes, as relações do CMDB mostram o que isolar. Métrica útil: cobertura do inventário, ou seja, a proporção de ativos descobertos na rede que também estão registrados com dono. Buracos nessa métrica são o primeiro alvo de trabalho.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Uma equipe de segurança quer aplicar um patch urgente em todos os servidores com certo software, mas ninguém sabe ao certo quais servidores o usam. Qual é a causa raiz do problema?', 'c', [
          'O patch foi lançado cedo demais pelo fornecedor, sem tempo para os clientes se prepararem',
          'Os servidores não são tão importantes, então o patch pode esperar o próximo ciclo trimestral',
          'Falta de um inventário de ativos atualizado, que mostraria onde o software está instalado',
          'O firewall bloqueia todas as ferramentas de atualização por padrão, sem que ninguém perceba'
        ], 'Sem inventário não se sabe o que existe nem o que está afetado. As demais opções não explicam a falta de visibilidade: o momento do patch e a importância dos servidores são outros assuntos, e o firewall não gera esse desconhecimento.'),
        mcq('q2', 'Qual das opções traz exemplos das quatro famílias de ativos (hardware, software, dados e identidades), nessa ordem?', 'a', [
          'Servidor físico, aplicativo de RH, base de clientes e conta de serviço',
          'Conta de serviço, servidor físico, aplicativo de RH e base de clientes',
          'Base de clientes, conta de serviço, servidor físico e aplicativo de RH',
          'Aplicativo de RH, base de clientes, conta de serviço e servidor físico'
        ], 'Servidor é hardware, aplicativo é software, base de clientes é dado e conta de serviço é identidade. As outras opções trazem os mesmos itens em ordem diferente, associando-os à família errada.'),
        mcq('q3', 'O que um CMDB oferece que uma lista simples de nomes de máquinas normalmente não oferece?', 'd', [
          'Bloqueio automático de qualquer tráfego suspeito que chegue aos ativos listados',
          'Correção automática de todas as vulnerabilidades dos ativos registrados, sem intervenção humana',
          'Garantia legal de conformidade com a LGPD para os dados dos ativos cadastrados',
          'Registro das relações entre ativos, como qual sistema roda em qual servidor e usa qual banco'
        ], 'O ponto forte do CMDB são os atributos e relações entre itens, úteis para medir impacto. Ele não bloqueia tráfego, não corrige falhas sozinho e não garante conformidade legal.'),
        fill('q4', 'Complete: a pessoa ou área responsável por um ativo, que decide acessos e aprova mudanças, é chamada de ___ do ativo.', 'atributo essencial: ___ do ativo', ['dono', 'proprietário', 'proprietario'], 'O dono do ativo responde por ele. Sem dono, ninguém decide acessos nem cuida de patch e monitoramento.'),
        mcq('q5', 'A descoberta automática encontra um servidor na rede que não consta no inventário e que ninguém da TI conhece. Qual é a melhor ação inicial?', 'b', [
          'Desligá-lo imediatamente da tomada, sem avisar ninguém, para eliminar o risco antes que alguém o use contra a empresa',
          'Identificar quem o criou e para quê, registrá-lo com dono e criticidade ou desativá-lo de forma controlada',
          'Ignorá-lo, já que não está no inventário e portanto não é responsabilidade da segurança',
          'Excluí-lo do relatório de descoberta para manter o inventário limpo'
        ], 'Investigar origem e finalidade, depois regularizar ou desativar com controle, é o caminho certo. Desligar sem avisar pode derrubar algo importante, e ignorar ou esconder mantém uma porta esquecida.'),
        mcq('q6', 'Um departamento contrata por conta própria um serviço de armazenamento na nuvem e passa a guardar planilhas de clientes nele, sem avisar a TI. Como isso se chama?', 'c', [
          'Ativo órfão, pois o serviço perdeu o dono original e ninguém da equipe sabe como ele funciona',
          'Criticidade alta, porque o serviço guarda dados de clientes',
          'Shadow IT, pois é tecnologia usada sem conhecimento nem aprovação da TI',
          'Descoberta automática, porque a TI achou a ferramenta'
        ], 'Uso de tecnologia sem aprovação da TI é shadow IT. Ativo órfão perdeu o dono, o que não ocorre aqui, e criticidade e descoberta são outros conceitos.'),
        mcq('q7', 'Como o inventário de ativos se relaciona com a gestão de vulnerabilidades?', 'd', [
          'Não há relação, pois a varredura de vulnerabilidades descobre sozinha tudo o que existe, incluindo o que está fora do escopo',
          'O inventário só é útil depois de uma vulnerabilidade ser explorada, para relatar o que foi perdido',
          'O inventário substitui a necessidade de varrer, pois já mostra quais falhas cada sistema possui',
          'O ciclo começa descobrindo os ativos: a varredura e a priorização só cobrem o que se sabe que existe'
        ], 'A gestão de vulnerabilidades parte do inventário e usa criticidade e dono para priorizar. A varredura não cobre o que está fora do escopo, e o inventário não substitui a varredura.'),
        fill('q8', 'Complete: um ativo que continua existindo na rede, mas perdeu o seu responsável (por exemplo, o servidor de um projeto encerrado), é chamado de ativo ___.', 'ativo ___ (sem dono)', ['órfão', 'orfão', 'orfao', 'órfao'], 'Ativo órfão é o que perdeu o dono; tende a ficar sem patch e sem monitoramento.')
      ]
    },
    {
      id: 'csi-06-active-directory-seguranca',
      title: 'Active Directory: o que é e como protegê-lo',
      goal: 'Entender a função do Active Directory nas empresas e aplicar boas práticas defensivas de administração, grupos privilegiados e tiering.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é o Active Directory',
            'O Active Directory (AD) é o serviço de diretório da Microsoft usado por grande parte das empresas: um banco central com usuários, computadores, grupos e políticas, e que autentica quem tenta entrar em máquinas e serviços da rede. Quem controla o AD controla, na prática, a empresa inteira, e por isso ele é um dos alvos mais valiosos de ataques. Esta lição é só a visão defensiva; as técnicas de ataque ao AD ficam para o nível avançado.'
          ),
          sl(
            'Domínio, controlador de domínio e OUs',
            'Um DOMÍNIO é um limite administrativo: um conjunto de contas e máquinas que compartilham o mesmo diretório. O CONTROLADOR DE DOMÍNIO (DC) é o servidor que guarda o diretório e responde aos logins. Cada DC deve ser tratado como ativo de máximo valor: poucos acessos, sem navegar na internet, atualizado e monitorado. Uma FLORESTA agrupa domínios. As UNIDADES ORGANIZACIONAIS (OUs) são pastas dentro do domínio, usadas para organizar objetos e aplicar políticas distintas (por exemplo uma OU para servidores e outra para estações).'
          ),
          sl(
            'GPO: políticas de grupo',
            'Uma GPO (Group Policy Object, política de grupo) é um conjunto de configurações aplicado automaticamente a usuários e computadores de uma OU: exigir tela bloqueada após inatividade, ativar o firewall, definir a política de senha, restringir instalação de programas, configurar auditoria. Com poucas GPOs bem desenhadas, centenas de máquinas ficam na mesma linha de base de segurança, o que liga este assunto ao hardening da próxima lição. Cuidado: quem pode EDITAR uma GPO pode alterar muitas máquinas de uma só vez, então a permissão de edição é tão sensível quanto uma conta administrativa.'
          ),
          sl(
            'Grupos privilegiados e contas',
            'Alguns grupos dão poder amplo: Domain Admins (administradores do domínio) e Enterprise Admins (da floresta) estão no topo, além de grupos que administram DCs, backup e política de grupo. Regras de ouro: poucos membros, revisão frequente, contas administrativas SEPARADAS das contas do dia a dia (o administrador usa a conta comum para ler e-mail e a de administração só para administrar), senhas longas e únicas, MFA onde possível e nada de administradores permanentes quando se pode conceder acesso temporário. Contas de serviço (usadas por sistemas) precisam de senha forte, privilégio mínimo e dono definido.',
            'Conta comum:  maria          -> e-mail, web, planilhas\nConta admin:  adm-maria      -> só para administrar servidores\n(nunca usar adm-maria para navegar ou abrir anexos)'
          ),
          sl(
            'Tiering: camadas de administração',
            'O modelo de camadas (tiering) separa o ambiente por nível de criticidade. Camada 0: o núcleo do AD (DCs, contas de maior poder). Camada 1: servidores e aplicações. Camada 2: estações de trabalho e usuários. A regra é que uma conta de camada mais alta NUNCA faz login em uma máquina de camada mais baixa, pois credenciais ficam em memória e podem ser roubadas de uma estação comprometida. Assim, um problema em um notebook de usuário não chega ao domínio. Em implantações novas, estações de administração dedicadas (PAW) reforçam essa separação.',
            'Camada 0: DCs e contas de domínio       (mais crítico)\nCamada 1: servidores e aplicações\nCamada 2: estações e usuários           (menos crítico)\nRegra: credencial de cima nunca entra em máquina de baixo'
          ),
          sl(
            'Boas práticas defensivas e monitoramento',
            'Mantenha DCs e servidores atualizados, desabilite protocolos legados que não sejam necessários, remova contas inativas, registre e monitore eventos de alto valor: criação de contas, alterações em grupos privilegiados, falhas de login em massa, mudanças em GPO e logins administrativos fora do padrão. Faça cópias de segurança do AD e teste a restauração. Uma auditoria periódica (feita por ferramentas legítimas e com autorização, no seu próprio ambiente) mostra grupos com excesso de membros e contas esquecidas. Por LGPD, o diretório guarda dados pessoais de funcionários; restrinja quem pode consultá-lo.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que o Active Directory é um alvo tão valioso para atacantes?', 'a', [
          'Quem o controla controla as contas e acessos de quase toda a rede',
          'Porque ele guarda os arquivos dos funcionários em um único servidor de armazenamento',
          'Porque é um aplicativo de e-mail com muitos usuários ativos',
          'Porque não possui mecanismo de autenticação nem registro de eventos próprios'
        ], 'O AD autentica e autoriza em toda a rede, então controlá-lo equivale a controlar a empresa. Ele não é servidor de arquivos nem de e-mail e possui registros.'),
        mcq('q2', 'Para que serve uma GPO?', 'd', [
          'Para criar o backup automático do banco de dados de produção',
          'Para cifrar o disco do controlador de domínio com uma chave nova a cada dia',
          'Para bloquear o acesso do usuário à internet a qualquer momento por padrão',
          'Aplicar configurações padronizadas, como senha e firewall, a vários computadores'
        ], 'GPOs aplicam configurações centralizadas a vários objetos. As outras opções descrevem outras funções.'),
        mcq('q3', 'Um administrador de domínio abre anexos de e-mail e navega na web usando a própria conta de Domain Admin. Qual é o problema?', 'c', [
          'Problema algum, porque administradores precisam testar o que os usuários veem',
          'A conta fica lenta por excesso de permissões, mas isso não traz risco de segurança',
          'Uma infecção nessa sessão teria acesso total ao domínio; por isso se separam as contas',
          'O e-mail só funciona com contas sem privilégio, então o administrador não receberia mensagens'
        ], 'Usar conta altamente privilegiada para tarefas arriscadas amplia enormemente o impacto de qualquer erro. Por isso se separam contas de uso diário e de administração.'),
        fill('q4', 'Complete: o servidor que guarda o diretório do AD e responde aos pedidos de login chama-se controlador de ___.', 'Controlador de ___ (DC)', ['domínio', 'dominio'], 'O controlador de domínio (DC) é o servidor central do AD e deve ser tratado como ativo de máxima criticidade.'),
        mcq('q5', 'No modelo de tiering, qual regra deve ser seguida?', 'b', [
          'Contas da Camada 2 devem administrar os controladores de domínio para agilizar o suporte',
          'Contas de camada mais alta não fazem login em máquinas de camada mais baixa',
          'Os administradores devem compartilhar a mesma senha para facilitar a troca de turno',
          'As camadas servem só para organizar o organograma e não influenciam a segurança'
        ], 'A separação evita que credenciais poderosas fiquem expostas em estações comprometidas. As outras opções quebram o modelo.'),
        mcq('q6', 'Qual evento merece alerta de alta prioridade em um AD?', 'c', [
          'Um usuário comum trocando o próprio papel de parede da estação',
          'Uma impressora reiniciando fora do horário comercial',
          'Novo membro em Domain Admins fora de uma mudança aprovada',
          'Um usuário fazendo login normal no horário de expediente'
        ], 'Mudanças em grupos privilegiados são eventos de alto valor e devem corresponder a uma mudança aprovada. As demais são rotina.'),
        mcq('q7', 'A equipe encontra 15 pessoas no grupo Domain Admins, sendo que só 3 precisam do acesso. Qual ação é a mais adequada?', 'd', [
          'Manter, pois mais administradores significam mais agilidade e risco adicional desprezível',
          'Trocar o nome do grupo para dificultar que o localizem',
          'Remover o grupo e deixar as contas com acesso direto aos servidores',
          'Reduzir a membros necessários, usar contas separadas e revisar periodicamente'
        ], 'Menor privilégio e revisão periódica reduzem a superfície de ataque. Renomear não resolve e dispersar permissões piora o controle.'),
        fill('q8', 'Complete: a sigla do conjunto de configurações aplicado automaticamente a usuários e computadores de uma OU é ___.', 'Group Policy Object = ___', ['gpo', 'gpos'], 'GPO (Group Policy Object) é o mecanismo de políticas de grupo do AD.')
      ]
    },
    {
      id: 'csi-07-hardening-cis-benchmarks',
      title: 'Hardening e CIS Benchmarks',
      goal: 'Reduzir a superfície de ataque de sistemas com linhas de base, benchmarks, gestão de configuração e controle de desvios.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é hardening',
            'Hardening (endurecimento) é reduzir a SUPERFÍCIE DE ATAQUE de um sistema: remover ou desligar o que não é necessário, trocar padrões inseguros e configurar o que sobra do jeito mais seguro possível. Todo sistema novo vem de fábrica pensando em facilidade de uso: serviços ligados, contas padrão, portas abertas. Hardening é o trabalho de trocar conveniência desnecessária por segurança, sem quebrar o negócio. Revise do nível iniciante as ideias de menor privilégio e atualização.'
          ),
          sl(
            'Linha de base (baseline)',
            'A LINHA DE BASE é o conjunto documentado de configurações seguras que todo sistema de um tipo deve ter (por exemplo "servidor Linux padrão da empresa"). Ela evita improviso: cada servidor novo nasce igual. Uma boa linha de base cobre contas e senhas, serviços ativos, portas, atualizações automáticas, registro de eventos (logs), permissões de arquivos, criptografia de disco e o que cada perfil precisa a mais. Ela deve ser versionada, revisada e ter dono, e precisa de exceções documentadas quando um sistema exigir algo diferente.'
          ),
          sl(
            'CIS Benchmarks',
            'Os CIS Benchmarks são guias de configuração segura publicados pelo CIS (Center for Internet Security), construídos por comunidade de especialistas, para centenas de produtos: sistemas operacionais, navegadores, bancos de dados, serviços de nuvem. Cada recomendação traz a descrição, a justificativa, como auditar e como corrigir, e vem em perfis: Nível 1 (ganhos de segurança com pouco impacto na operação) e Nível 2 (mais restritivo, para ambientes de maior risco, podendo afetar funcionalidades). Eles são ponto de partida: adapte à sua realidade e teste antes de aplicar em produção.'
          ),
          sl(
            'Exemplos de ações de hardening',
            'Desabilitar serviços que ninguém usa (cada serviço ligado é uma porta a mais e um software a manter). Remover ou trocar contas e senhas padrão. Fechar portas sem uso no firewall do próprio host. Exigir atualizações e criptografia de disco. Restringir permissões de arquivos e contas ao necessário. Ativar registro de eventos. Em um servidor Linux de laboratório, listar o que está escutando ajuda a decidir o que desligar, exatamente como no comando abaixo, que mostra só portas em escuta na PRÓPRIA máquina.',
            '# Em Linux, na sua própria máquina ou laboratório:\nss -tlnp\n# Cada linha é um serviço escutando; pergunte "preciso disso?"\n# Se não, desabilite: systemctl disable --now <servico>'
          ),
          sl(
            'Gestão de configuração e desvios',
            'Configurar manualmente não escala e gera diferenças entre servidores. A gestão de configuração e a INFRAESTRUTURA COMO CÓDIGO descrevem a configuração desejada em arquivos versionados e a aplicam automaticamente; assim, é possível reaplicar a linha de base do mesmo jeito sempre. Um DESVIO (drift) acontece quando um sistema muda e deixa de seguir a linha de base (alguém ajustou na mão "só para testar"). É preciso detectar desvios com varreduras periódicas de conformidade e corrigir ou documentar a exceção, com prazo e responsável.'
          ),
          sl(
            'Cuidados e equilíbrio',
            'Hardening sem teste pode derrubar sistemas: aplique primeiro em ambiente de homologação, tenha plano de reversão e comunique as equipes. Segurança máxima e utilidade andam em equilíbrio: uma configuração tão restrita que força os usuários a contornar a regra é uma má configuração. Hardening não substitui atualização, monitoramento nem backup; é uma camada. E não é uma tarefa única: revise a linha de base quando surgirem novas versões do sistema, novas ameaças ou mudanças no negócio.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é o objetivo principal do hardening?', 'b', [
          'Aumentar a velocidade do servidor ao instalar mais serviços de monitoramento',
          'Reduzir a superfície de ataque, desligando o que não é necessário',
          'Substituir a necessidade de atualizações de segurança do sistema operacional',
          'Criar contas padrão para facilitar o suporte técnico'
        ], 'Hardening reduz o que pode ser atacado. Não acelera o servidor, não substitui atualização e contas padrão são justamente um risco.'),
        mcq('q2', 'O que é uma linha de base (baseline) de segurança?', 'a', [
          'Padrão documentado de configurações seguras para sistemas do mesmo tipo',
          'Uma lista dos atacantes conhecidos que já visaram a empresa',
          'O valor mínimo de orçamento reservado para ferramentas de segurança',
          'Um relatório de incidentes ocorridos no último ano'
        ], 'A baseline é o padrão de configuração seguro. As demais opções tratam de inteligência, orçamento e incidentes.'),
        mcq('q3', 'Qual é a diferença entre o Nível 1 e o Nível 2 dos CIS Benchmarks?', 'd', [
          'O Nível 1 vale só para servidores e o Nível 2 só para estações de trabalho',
          'O Nível 2 é mais antigo e já foi descontinuado pelo CIS',
          'Não há diferença: são nomes alternativos para o mesmo conjunto de recomendações',
          'O Nível 1 pesa pouco na operação; o Nível 2 é mais restritivo'
        ], 'O Nível 1 é a base prática; o Nível 2 é para risco maior e exige mais cuidado com compatibilidade.'),
        fill('q4', 'Complete: quando um sistema muda e deixa de seguir a linha de base, dizemos que houve um ___ de configuração.', '___ de configuração (em inglês: drift)', ['desvio', 'drift'], 'Desvio (drift) é a diferença entre o estado atual e a linha de base, e deve ser detectado e corrigido ou documentado como exceção.'),
        mcq('q5', 'Em um servidor de laboratório, o comando que lista portas em escuta mostra um serviço antigo que ninguém usa. O que fazer?', 'c', [
          'Deixar como está, pois todo serviço ligado traz benefício para o sistema',
          'Mudar o nome do serviço para que não seja reconhecido',
          'Confirmar que não é necessário, desabilitar e registrar a mudança',
          'Abrir a porta no firewall da empresa inteira para facilitar o uso futuro'
        ], 'Serviço sem uso é superfície de ataque a mais. Confirme, desabilite e documente. Renomear ou abrir a porta aumentam o risco.'),
        mcq('q6', 'Por que usar infraestrutura como código para a configuração de segurança?', 'a', [
          'Descreve a configuração em arquivos versionados e a reaplica automaticamente',
          'Porque elimina a necessidade de qualquer revisão ou teste antes de ir para produção',
          'Porque o código é mais seguro que a configuração feita por pessoas, dispensando testes',
          'Porque impede que novos servidores sejam criados sem aprovação'
        ], 'O ganho é consistência e rastreabilidade. Não dispensa teste e não garante segurança por si só.'),
        mcq('q7', 'Uma equipe aplicou direto em produção, sem teste, um conjunto restritivo de recomendações e derrubou um sistema crítico. Qual lição vale?', 'd', [
          'Hardening é inviável, e a equipe deve desistir de qualquer padronização',
          'Os benchmarks são inseguros por natureza e devem ser ignorados',
          'A culpa é do sistema que não tolera segurança e deve ser substituído imediatamente',
          'Testar primeiro em homologação, ter reversão e comunicar as áreas antes de produção'
        ], 'Hardening exige teste e reversão. O problema foi de processo, não do conceito.'),
        fill('q8', 'Complete: o conjunto de superfícies que um atacante pode tentar explorar em um sistema chama-se superfície de ___.', 'superfície de ___', ['ataque'], 'Superfície de ataque é tudo o que está exposto a tentativas de exploração; hardening a reduz.')
      ]
    },
    {
      id: 'csi-08-segmentacao-ids-ips-nac',
      title: 'Segmentação, IDS/IPS e NAC',
      goal: 'Dividir a rede em zonas, posicionar sensores de detecção e controlar quais dispositivos entram na rede.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que segmentar a rede',
            'Em uma rede "plana", todo dispositivo fala com todos os outros. Basta um computador comprometido para o atacante alcançar servidores e bancos de dados. SEGMENTAÇÃO é dividir a rede em zonas e controlar o tráfego entre elas, de modo que um problema fique contido (limita a movimentação lateral e o raio de impacto). A divisão pode ser física, por VLANs (redes lógicas virtuais) ou por regras de firewall entre as sub-redes. Os protocolos de rede em si são tema do curso de Redes; aqui o foco é a ótica de segurança.'
          ),
          sl(
            'Zonas e DMZ',
            'Exemplos de zonas: usuários, servidores internos, bancos de dados, convidados (Wi-Fi de visitantes), gestão, câmeras e dispositivos IoT. A DMZ (zona desmilitarizada) é uma zona intermediária que hospeda serviços expostos à internet, como o site e o servidor de e-mail. Se um serviço da DMZ for comprometido, o atacante ainda precisa passar por outro firewall para chegar à rede interna. Regra básica entre zonas: negar por padrão e liberar só o necessário, porta a porta. A internet nunca deve falar diretamente com o banco de dados.',
            'Internet -> [Firewall] -> DMZ (site, e-mail)\n                    |\n               [Firewall interno] -> Servidores / Banco de dados\n                    |\n               Usuários  |  Convidados (isolados)'
          ),
          sl(
            'Microsegmentação',
            'A microsegmentação leva a ideia ao extremo: regras de comunicação por carga de trabalho ou até por aplicação, e não só por grandes zonas. Em vez de "a rede de servidores fala com a rede de servidores", a regra vira "o servidor web fala só com o servidor da aplicação, na porta X". É muito usada em nuvem e datacenters virtualizados, e reduz o impacto de uma intrusão. O custo é complexidade: precisa-se conhecer bem quais fluxos existem, e começar em modo de observação antes de bloquear evita derrubar sistemas legítimos.'
          ),
          sl(
            'IDS e IPS',
            'IDS (Intrusion Detection System) observa o tráfego e ALERTA quando vê algo suspeito, mas não interfere: fica "ao lado" da rede, olhando uma cópia do tráfego. IPS (Intrusion Prevention System) fica EM LINHA, no caminho do tráfego, e pode BLOQUEAR o que considera malicioso. O IPS bloqueia na hora, mas se errar (falso positivo) pode barrar tráfego legítimo e causar indisponibilidade; o IDS é mais seguro para operação, porém depende de alguém reagir ao alerta. Ambos usam assinaturas (padrões conhecidos), análise de anomalias ou as duas, e precisam de ajuste constante para reduzir ruído.',
            'IDS: copia do tráfego -> sensor -> alerta (não bloqueia)\nIPS: tráfego -> sensor em linha -> libera ou bloqueia'
          ),
          sl(
            'Onde posicionar sensores',
            'Pontos de alto valor: na borda (entre a internet e a DMZ), entre a DMZ e a rede interna, na frente de servidores críticos e entre zonas sensíveis (como a rede de pagamentos). Sensores só enxergam o que passa por eles, então são colocados onde há tráfego relevante e usam espelhamento de porta (SPAN/TAP) para receber cópia. Tráfego cifrado (TLS) limita a inspeção, por isso se combina rede com telemetria dos próprios hosts. Registre o que o sensor vê e envie ao sistema central de logs, que veremos mais adiante.'
          ),
          sl(
            'NAC: controle de acesso à rede',
            'NAC (Network Access Control) decide QUEM e O QUÊ pode conectar-se à rede, e em qual zona cai. Ele verifica a identidade (usuário ou certificado do dispositivo) e a postura do equipamento: está atualizado, com antivírus ativo, criptografado? Se estiver conforme, vai para a rede corporativa; se não, é colocado em uma VLAN de quarentena ou na rede de convidados. Resolve o problema do notebook pessoal ou desconhecido plugado na tomada da parede. Cuidados: dispositivos IoT sem suporte a agente precisam de perfis próprios, e a coleta de informações do equipamento deve respeitar a privacidade dos usuários.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é o principal benefício da segmentação de rede?', 'c', [
          'Aumentar a velocidade da internet nos computadores da empresa',
          'Dispensar o uso de senhas nos servidores internos',
          'Conter o problema em uma zona e limitar a movimentação lateral',
          'Impedir que o dispositivo seja comprometido por phishing ou malware'
        ], 'A segmentação limita o alcance de uma intrusão. Não dá garantia absoluta, não acelera a internet e não dispensa senhas.'),
        mcq('q2', 'Para que serve a DMZ?', 'b', [
          'Armazenar os backups mais sensíveis da empresa, isolados de qualquer acesso',
          'Hospedar serviços públicos em zona intermediária, separada da rede interna',
          'Substituir completamente o firewall da borda por uma única regra permissiva',
          'Servir de rede para os convidados usarem os computadores da diretoria'
        ], 'A DMZ abriga serviços públicos de forma que seu comprometimento não dê acesso direto à rede interna.'),
        mcq('q3', 'Qual é a diferença essencial entre IDS e IPS?', 'a', [
          'O IDS alerta; o IPS fica em linha e pode bloquear',
          'O IDS bloqueia o tráfego e o IPS só registra em arquivos de log',
          'Os dois são sinônimos e o nome muda conforme o fornecedor',
          'O IDS só serve para redes sem fio e o IPS só para redes cabeadas'
        ], 'IDS detecta e alerta; IPS está no caminho e previne bloqueando. As outras opções invertem ou confundem os papéis.'),
        fill('q4', 'Complete: a zona intermediária que hospeda serviços públicos, como o site da empresa, chama-se ___.', 'zona de serviços públicos = ___', ['dmz', 'zona desmilitarizada'], 'A DMZ (zona desmilitarizada) separa os serviços expostos da rede interna.'),
        mcq('q5', 'Uma empresa colocou um IPS em linha, e após uma atualização de regras começou a bloquear um sistema legítimo de vendas. Qual risco do IPS foi ilustrado?', 'd', [
          'O IPS não consegue ver tráfego cifrado, e por isso o bloqueio foi aleatório',
          'O IPS só funciona em horário comercial, então bloqueou fora dele',
          'O IPS exige que os usuários instalem programas especiais nos computadores',
          'Falso positivo que gera indisponibilidade, pois o IPS bloqueia automaticamente'
        ], 'Por estar em linha e bloquear, um falso positivo do IPS interrompe tráfego legítimo, daí a importância de testar e ajustar regras.'),
        mcq('q6', 'Um visitante conecta um notebook desconhecido em uma tomada de rede do escritório. Qual controle resolve isso?', 'c', [
          'DMZ, que isola o notebook do visitante nos servidores públicos',
          'IDS, que bloqueia automaticamente qualquer dispositivo novo',
          'NAC, que checa identidade e postura e isola o dispositivo',
          'Microsegmentação de servidores, que impede o uso de cabos de rede'
        ], 'O NAC controla quem entra na rede e em qual zona. A DMZ e a microsegmentação têm outros objetivos, e o IDS apenas alerta.'),
        mcq('q7', 'Onde faz sentido colocar um sensor de detecção?', 'b', [
          'Em um corredor de tráfego irrelevante, só para completar a cobertura visual',
          'Na borda e na frente de servidores críticos, onde passa tráfego de alto valor',
          'Dentro de cada notebook, sem sensor algum na rede',
          'Na rede de convidados, pois a rede interna é considerada confiável'
        ], 'Sensores só enxergam o que passa por eles; coloque-os em pontos de alto valor. Presumir que a rede interna é confiável é um erro clássico.'),
        fill('q8', 'Complete: dividir a rede em redes lógicas virtuais para separar grupos de dispositivos usa as chamadas ___.', 'redes lógicas virtuais = ___', ['vlan', 'vlans'], 'VLANs separam logicamente grupos de dispositivos na mesma infraestrutura física, e as regras entre elas controlam a comunicação.')
      ]
    },
    {
      id: 'csi-09-firewalls-ngfw-proxies',
      title: 'Firewalls, NGFW e proxies',
      goal: 'Diferenciar tipos de firewall e proxy, usar filtragem de DNS e entender os dilemas de privacidade da inspeção TLS.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Firewall stateful',
            'Do nível iniciante você sabe que um firewall filtra tráfego por regras. Um firewall STATEFUL (com estado) guarda uma tabela das conexões em andamento: se um computador da empresa iniciou uma conexão com um site, a resposta é aceita automaticamente, mas um pacote de resposta que ninguém pediu é descartado. É bem mais seguro e prático que o filtro simples de pacotes, que olha cada pacote isolado. As regras comuns: origem, destino, porta e protocolo, avaliadas em ordem, geralmente com a política padrão de negar o que não foi liberado.'
          ),
          sl(
            'NGFW: firewall de nova geração',
            'O NGFW (Next-Generation Firewall) soma ao stateful recursos de camada de aplicação: identifica QUAL aplicação está passando (mesmo na porta 443, ele distingue um site de vídeo de um sistema de e-mail), integra IPS, filtra por categoria de site, aplica regras por usuário e grupo (integrando com o diretório) e pode usar inteligência de ameaças. Em vez de "liberar a porta 443 para todos", você escreve "o setor de vendas pode usar o sistema X". Limite: continua dependendo de boas regras, e muito dele depende de inspecionar tráfego cifrado, o que traz dilemas vistos adiante.'
          ),
          sl(
            'Proxy direto e proxy reverso',
            'Um PROXY é um intermediário. O proxy DIRETO (forward) fica na frente dos USUÁRIOS: eles pedem páginas por ele, que aplica filtros, registra acessos e pode armazenar em cache; serve para controle de navegação. O proxy REVERSO fica na frente dos SERVIDORES: a internet fala com ele, que encaminha para os servidores internos; serve para esconder a estrutura interna, balancear carga, terminar o TLS e aplicar proteções como um WAF (firewall de aplicação web, assunto do curso de OWASP). Truque para lembrar: direto protege/controla quem sai; reverso protege quem serve.',
            'Direto : Usuários -> [Proxy direto] -> Internet\nReverso: Internet -> [Proxy reverso] -> Servidores internos'
          ),
          sl(
            'Filtragem DNS',
            'O DNS traduz nomes (loja.example) em endereços. Na FILTRAGEM DE DNS, o resolvedor da empresa recusa ou redireciona a resolução de domínios sabidamente maliciosos (phishing, distribuição de malware, comando e controle) ou de categorias bloqueadas pela política. É uma defesa barata e eficaz: o dispositivo nem chega a conectar ao servidor perigoso. Além de bloquear, gera ótimos logs: ver quais máquinas consultaram um domínio malicioso ajuda a achar infectados. Limites: o atacante pode usar endereço IP direto ou DNS cifrado externo, por isso se combina com bloqueio de saída para resolvedores não autorizados.'
          ),
          sl(
            'Inspeção TLS e o dilema de privacidade',
            'A maior parte do tráfego hoje é cifrada, o que também esconde malware e vazamentos. A INSPEÇÃO TLS faz o firewall/proxy abrir a conexão cifrada (ele encerra o TLS com o usuário usando um certificado da própria empresa e abre outra conexão ao site), inspeciona o conteúdo e recifra. Dilemas: o equipamento passa a ver senhas, e-mails pessoais e dados bancários dos funcionários; vira alvo de alto valor; pode quebrar aplicações que fixam certificados e enfraquece a segurança se mal configurado. Por isso se excluem categorias sensíveis (saúde, bancos), documenta-se a política, informa-se os funcionários e limita-se o acesso aos logs.'
          ),
          sl(
            'LGPD e transparência',
            'Monitorar tráfego envolve dados pessoais (o que a pessoa acessou, o que digitou). Em visão geral, a LGPD (Lei 13.709/2018) pede finalidade específica, necessidade (coletar só o preciso), transparência com os titulares e segurança dos dados coletados; o ideal é que a política de uso aceitável informe que há monitoramento e para quê, e que o acesso aos registros seja restrito e auditado. Isto é uma visão geral e não substitui a orientação do jurídico ou do encarregado (DPO) da sua organização.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que diferencia um firewall stateful de um filtro simples de pacotes?', 'd', [
          'O stateful só funciona para tráfego de entrada, enquanto o simples também filtra a saída',
          'O stateful lê o conteúdo dos e-mails e arquivos que atravessam a rede',
          'O stateful dispensa regras, pois aprende sozinho o que é tráfego legítimo',
          'O stateful acompanha as conexões e aceita respostas a conexões iniciadas internamente'
        ], 'O firewall com estado associa pacotes a conexões existentes. Ele não lê conteúdo de e-mails nem dispensa regras.'),
        mcq('q2', 'Uma empresa quer permitir que só o setor de vendas use determinado sistema na nuvem, mesmo ele usando a porta 443 como todos os sites. Qual recurso resolve?', 'b', [
          'Um firewall simples de pacotes, que identifica aplicações pela porta usada',
          'Um NGFW, que identifica a aplicação e aplica regras por usuário ou grupo',
          'Um proxy reverso, já que ele controla o que cada usuário acessa na internet',
          'Uma VLAN única para toda a empresa, para que as regras sejam iguais'
        ], 'O NGFW enxerga a camada de aplicação e integra identidades. O filtro simples só vê portas, e o proxy reverso fica na frente de servidores.'),
        mcq('q3', 'Qual é a posição correta de um proxy reverso?', 'a', [
          'Na frente dos servidores, recebendo a internet e repassando para dentro',
          'Na frente dos usuários, controlando a navegação deles na internet',
          'Dentro do notebook de cada funcionário, como extensão do navegador',
          'Entre dois roteadores domésticos, sem relação com servidores'
        ], 'O reverso protege e atende pelos servidores; o proxy direto é quem fica na frente dos usuários.'),
        fill('q4', 'Complete: o serviço que traduz nomes como loja.example em endereços, e que pode ser filtrado para bloquear domínios maliciosos, é o ___.', 'filtragem de ___ (nomes para endereços)', ['dns'], 'O DNS traduz nomes em endereços; filtrá-lo bloqueia domínios maliciosos antes da conexão.'),
        mcq('q5', 'Qual vantagem a filtragem de DNS traz além de bloquear?', 'c', [
          'Cifra todo o tráfego do usuário, tornando-o ilegível para qualquer observador',
          'Substitui o antivírus nas estações de trabalho, que podem ser desinstalados',
          'Os logs de consulta ajudam a achar máquinas que falaram com domínios maliciosos',
          'Garante o bloqueio do uso de endereços IP diretos pelos atacantes'
        ], 'Os logs de consulta mostram quais hosts contataram domínios suspeitos. O DNS filtrado não cifra tráfego, não substitui antivírus e não impede uso de IP direto.'),
        mcq('q6', 'Qual é um dos dilemas da inspeção TLS?', 'b', [
          'Ela torna o tráfego mais inseguro para o site, que perde a cifragem de ponta a ponta com o servidor',
          'O equipamento passa a ver dados pessoais dos usuários, como e-mails e senhas, e vira alvo valioso',
          'Ela só funciona em redes sem acesso à internet, o que a inviabiliza',
          'Ela impede que sejam registrados logs de qualquer tipo no equipamento'
        ], 'O ponto central é a exposição de conteúdo privado ao dispositivo de inspeção e as obrigações de proteger esses dados. Ela não elimina logs.'),
        mcq('q7', 'Qual medida torna a inspeção TLS mais adequada à LGPD?', 'd', [
          'Inspecionar tudo em segredo, para evitar que os funcionários mudem de comportamento',
          'Guardar todo o conteúdo inspecionado por tempo indeterminado, para uso futuro',
          'Dar acesso aos registros a toda a equipe de TI, para agilizar o suporte',
          'Excluir categorias sensíveis, comunicar a política e auditar o acesso aos logs'
        ], 'Finalidade, necessidade, transparência e segurança são os pilares. Inspeção secreta e acesso amplo vão contra esses princípios. Em caso de dúvida, consulte o jurídico.'),
        fill('q8', 'Complete: o firewall que identifica a aplicação, integra IPS e aplica regras por usuário é chamado de ___ (Next-Generation Firewall).', 'sigla: ___ (Next-Generation Firewall)', ['ngfw'], 'NGFW é a sigla de Next-Generation Firewall.')
      ]
    },
    {
      id: 'csi-10-vpn-ztna-acesso-remoto',
      title: 'VPN, ZTNA e acesso remoto seguro',
      goal: 'Escolher entre VPN, ZTNA e bastion para acesso remoto e proteger o acesso privilegiado.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é uma VPN',
            'VPN (Virtual Private Network, rede privada virtual) cria um TÚNEL cifrado sobre a internet, de modo que o tráfego que passa por ele fica protegido contra espionagem e alteração e o dispositivo se comporta como se estivesse dentro da rede da empresa. Há dois usos principais. VPN de ACESSO REMOTO: um funcionário em casa conecta ao escritório. VPN SITE-TO-SITE: liga duas redes inteiras (matriz e filial) de forma permanente. Uma VPN protege o CAMINHO; não protege contra um computador já infectado nem contra credenciais roubadas.'
          ),
          sl(
            'Split tunneling e riscos da VPN',
            'Em uma VPN de túnel completo, todo o tráfego do usuário passa pela empresa (e pode ser inspecionado). No SPLIT TUNNELING, só o tráfego destinado à empresa vai pelo túnel; o resto sai direto para a internet. Isso economiza banda, mas o notebook fica ao mesmo tempo na internet e na rede interna, e um malware pode usá-lo como ponte. Outros riscos: a VPN dá acesso amplo a toda a rede interna (uma conta roubada vira acesso a tudo), os concentradores de VPN são alvos frequentes e precisam de atualização rápida, e a ausência de MFA é falha grave.'
          ),
          sl(
            'ZTNA e Zero Trust',
            'ZERO TRUST é o princípio de nunca confiar automaticamente em nada pelo simples fato de estar "dentro" da rede: toda solicitação de acesso é verificada (quem é, como está o dispositivo, o contexto) e liberada com o mínimo necessário. ZTNA (Zero Trust Network Access) aplica isso ao acesso remoto: em vez de colocar o usuário "dentro da rede", ele recebe acesso apenas à APLICAÇÃO específica que precisa, depois de validar identidade, MFA e postura do dispositivo, e o acesso pode ser reavaliado continuamente. As demais aplicações ficam invisíveis para ele. Comparação: VPN abre a porta do prédio; ZTNA abre só a porta da sala.',
            'VPN : usuário autenticado -> rede interna inteira\nZTNA: usuário + dispositivo verificados -> só a aplicação X'
          ),
          sl(
            'Bastion (jump host)',
            'Um BASTION (ou jump host) é um servidor reforçado que funciona como ÚNICO ponto de entrada para administrar sistemas internos. Em vez de abrir a administração remota de cada servidor para a rede, os administradores conectam ao bastion (com MFA) e, de lá, aos servidores. Vantagens: um ponto único para proteger, monitorar e registrar; menos portas expostas; e possibilidade de gravar sessões. Ele precisa estar muito endurecido, com contas individuais (nada de conta compartilhada), logs enviados para fora dele e acesso restrito por origem.'
          ),
          sl(
            'Acesso privilegiado: PAM',
            'Contas administrativas são as mais perigosas. PAM (Privileged Access Management) é o conjunto de práticas e ferramentas para controlá-las: cofre de senhas (as senhas de administração ficam no cofre e são trocadas após o uso), acesso sob demanda e temporário (JIT, just-in-time: o privilégio existe só durante a tarefa), aprovação para ações críticas, gravação e auditoria das sessões e MFA obrigatória. Isso reduz a chance de uso indevido e produz evidência para investigar. Lembre do menor privilégio e da separação de contas vistos antes.'
          ),
          sl(
            'Boas práticas de acesso remoto',
            'Exija MFA em todo acesso remoto, de preferência resistente a phishing. Verifique a postura do dispositivo (atualizado, criptografado, com EDR ativo). Registre e monitore logins (horários e locais incomuns). Atualize rapidamente os equipamentos de borda. Revise quem tem acesso e retire o que não for mais necessário. Em dispositivos pessoais (BYOD), defina regras claras e separe dados corporativos dos pessoais, respeitando a privacidade do usuário. E nunca exponha serviços de administração (como o acesso remoto a desktops) diretamente à internet.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que uma VPN de acesso remoto protege?', 'a', [
          'O caminho entre o dispositivo e a rede da empresa, contra espionagem e alteração',
          'O dispositivo contra qualquer malware que ele já tenha instalado antes de conectar',
          'As credenciais do usuário caso ele as entregue em uma página falsa de phishing',
          'Os dados armazenados nos servidores internos contra erros dos administradores'
        ], 'A VPN cifra o trânsito. Ela não limpa dispositivos infectados, não impede phishing nem protege dados armazenados.'),
        mcq('q2', 'Qual é um risco típico do split tunneling?', 'c', [
          'Todo o tráfego do usuário passa pela empresa e sobrecarrega o provedor de internet',
          'A VPN deixa de cifrar o tráfego que vai para a empresa, mas isso é irrelevante',
          'O dispositivo fica na internet e na rede interna, podendo servir de ponte a malware',
          'O usuário perde acesso à internet enquanto estiver conectado à empresa'
        ], 'O split tunneling expõe o dispositivo simultaneamente a dois mundos. O tráfego da empresa continua cifrado.'),
        mcq('q3', 'Qual afirmação descreve melhor a diferença entre VPN e ZTNA?', 'd', [
          'A VPN é mais segura, pois dá acesso à rede inteira e simplifica o controle',
          'O ZTNA só funciona dentro do escritório, enquanto a VPN funciona remotamente',
          'Ambas funcionam da mesma forma e só diferem no nome comercial',
          'A VPN põe o usuário na rede; o ZTNA libera só a aplicação necessária'
        ], 'ZTNA aplica o menor privilégio por aplicação e verifica contexto, enquanto a VPN tradicional costuma dar acesso amplo à rede.'),
        fill('q4', 'Complete: o princípio de segurança que diz para não confiar automaticamente em nada só por estar dentro da rede chama-se ___ Trust.', '___ Trust (nunca confiar por padrão)', ['zero'], 'Zero Trust: toda solicitação é verificada, independentemente de onde vem.'),
        mcq('q5', 'Para que serve um bastion (jump host)?', 'b', [
          'Para guardar os backups dos servidores em uma sala com controle de acesso físico',
          'Ser o ponto único e reforçado para administrar sistemas, com sessões registradas',
          'Para substituir a necessidade de senhas nos servidores da empresa',
          'Para armazenar os arquivos pessoais dos administradores com segurança extra'
        ], 'O bastion concentra, protege e registra o acesso administrativo. Não substitui senhas nem guarda backups.'),
        mcq('q6', 'O que é acesso JIT (just-in-time) no contexto de PAM?', 'a', [
          'Privilégio concedido apenas durante o tempo necessário para a tarefa e removido em seguida',
          'Privilégio permanente concedido aos administradores no primeiro dia de trabalho',
          'Acesso sem registro, para ser mais rápido durante emergências',
          'Um tipo de VPN site-to-site usada para ligar a matriz às filiais'
        ], 'JIT reduz a janela de risco ao conceder o privilégio só quando necessário.'),
        mcq('q7', 'Uma empresa deixou o acesso remoto a desktops exposto direto na internet, apenas com senha. Qual correção é a mais adequada?', 'd', [
          'Trocar a porta padrão e considerar o problema resolvido',
          'Exigir senha mais curta para agilizar o login dos usuários',
          'Aceitar o risco, porque o acesso remoto precisa ficar aberto na internet',
          'Tirar a exposição direta e usar VPN ou ZTNA com MFA'
        ], 'Serviços de administração não devem ficar diretamente na internet; coloque-os atrás de VPN/ZTNA com MFA e monitore. Trocar a porta apenas esconde o problema.'),
        fill('q8', 'Complete: a VPN que liga permanentemente duas redes, como matriz e filial, chama-se site-to-___.', 'VPN site-to-___', ['site'], 'A VPN site-to-site conecta redes inteiras, ao contrário da VPN de acesso remoto, que conecta uma pessoa.')
      ]
    }
,
    {
      id: 'csi-11-analise-de-pacotes',
      title: 'Análise de pacotes com foco defensivo',
      goal: 'Capturar e ler tráfego da própria rede para investigar problemas e incidentes, com filtros básicos e cuidado com dados sensíveis.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Para que serve analisar pacotes',
            'Um PACOTE é um pedaço de dados que trafega na rede; uma CAPTURA é a gravação desses pacotes. Analisar capturas permite ver o que realmente aconteceu: qual máquina conversou com qual, quais serviços, se havia consulta DNS estranha, se uma senha trafegou sem cifra, se há tentativas repetidas de conexão. Em defesa, a análise de pacotes ajuda a investigar incidentes, depurar problemas e validar regras de firewall. Os protocolos em si (TCP, DNS, HTTP) são explicados no curso de Redes; aqui o foco é o uso defensivo.'
          ),
          sl(
            'Regra de ouro: só na rede própria, com autorização',
            'Capturar tráfego de uma rede que não é sua, ou sem autorização, pode configurar interceptação ilegal e violar a privacidade das pessoas (no Brasil, em visão geral: Lei 12.737/2012, Marco Civil da Internet e LGPD; isto não substitui orientação jurídica). Capture apenas em redes e dispositivos sob sua responsabilidade, com permissão por escrito quando for da empresa, e em laboratório, use tráfego gerado por você mesmo. Em redes Wi-Fi públicas ou de terceiros: não capture.'
          ),
          sl(
            'Ferramentas: tcpdump e Wireshark',
            'O tcpdump é uma ferramenta de linha de comando para capturar e filtrar pacotes; ótima em servidores sem interface gráfica. O Wireshark tem interface gráfica e decodifica centenas de protocolos, mostrando cada camada do pacote. Ambos podem salvar a captura em arquivo .pcap para estudar depois e compartilhar com colegas. Capturar exige privilégios elevados, o que reforça o cuidado: use uma conta autorizada e limite a captura no tempo e em volume.',
            '# Na PRÓPRIA máquina/laboratório (exemplo ilustrativo, não executado aqui):\nsudo tcpdump -i eth0 -w captura.pcap host 192.0.2.10 and port 53\n# -i  interface   -w  salvar em arquivo\n# o filtro (host/port) captura só o que interessa'
          ),
          sl(
            'Filtros básicos',
            'Há dois tipos de filtro. FILTRO DE CAPTURA (formato BPF, usado no tcpdump) decide o que será gravado: host 192.0.2.10, port 53, tcp, net 198.51.100.0/24, combinados com and/or/not. FILTRO DE EXIBIÇÃO do Wireshark decide o que mostrar de uma captura já feita, com sintaxe própria: ip.addr == 192.0.2.10, dns, tcp.port == 443, http.request, tcp.flags.syn == 1. Dica: filtre ao capturar para gravar menos dados (menos risco e menos espaço); filtre ao exibir para investigar. Misturar a sintaxe dos dois é um erro comum de iniciantes.',
            'Captura (BPF)      : host 192.0.2.10 and port 53\nExibição (Wireshark): ip.addr == 192.0.2.10 && dns'
          ),
          sl(
            'O que olhar em uma investigação',
            'Comece pelo resumo: quais endereços mais conversam e com quais portas. Procure padrões suspeitos: muitas tentativas de conexão a portas diferentes vindas de um mesmo endereço (varredura), consultas DNS para nomes estranhos ou muito longos, conexões periódicas e regulares a um endereço externo (possível comando e controle), grande volume saindo para fora em horário atípico, protocolos antigos sem cifra. Siga a CONVERSA (follow stream) para entender o contexto. Anote os indicadores (IPs, domínios) e as horas, e compare com os logs de firewall e DNS: a captura é uma peça, não a prova inteira.'
          ),
          sl(
            'Dados sensíveis em capturas (LGPD)',
            'Uma captura de tráfego sem cifra contém senhas, mensagens, cookies e dados pessoais: o arquivo .pcap vira um dado sensível. Cuidados: capturar o mínimo (filtros, tempo curto), guardar em local com acesso restrito e criptografado, definir quanto tempo se mantém e apagar depois, não enviar capturas a terceiros sem anonimizar (mascarar endereços e conteúdos), e nunca publicar capturas reais em fóruns. Em estudos e treinamentos, use capturas de laboratório com dados fictícios. Mesmo com TLS, os metadados (quem falou com quem e quando) ainda são informação pessoal.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual situação é adequada para capturar tráfego?', 'c', [
          'Capturar o Wi-Fi de uma cafeteria para ver o que os outros clientes acessam',
          'Capturar o tráfego do vizinho para testar se ele tem senha fraca',
          'Capturar a rede da própria empresa, com autorização escrita, para investigar',
          'Capturar a rede de um cliente sem avisá-lo, para economizar tempo da investigação'
        ], 'Só se captura rede própria ou com autorização formal. Capturar tráfego de terceiros pode ser crime e viola a privacidade.'),
        mcq('q2', 'Qual é a diferença entre filtro de captura e filtro de exibição?', 'a', [
          'O de captura define o que se grava; o de exibição, o que se mostra',
          'O de captura mostra pacotes na tela e o de exibição os grava em arquivo',
          'São o mesmo filtro, com sintaxe idêntica nas duas ferramentas',
          'O de exibição só existe no tcpdump e o de captura só no Wireshark'
        ], 'Filtro de captura reduz o que é gravado (BPF); filtro de exibição trabalha sobre o arquivo ou a captura em andamento, com sintaxe do Wireshark.'),
        mcq('q3', 'O filtro "host 192.0.2.10 and port 53" no tcpdump faz o quê?', 'b', [
          'Exibe os pacotes da rede, destacando os do endereço 192.0.2.10',
          'Captura só o tráfego do endereço 192.0.2.10 na porta 53 (DNS)',
          'Bloqueia o endereço 192.0.2.10 no firewall da empresa',
          'Envia a captura para o endereço 192.0.2.10 na porta 53'
        ], 'O filtro de captura limita o que é gravado a esse host e a essa porta. Ele não bloqueia nem envia nada.'),
        fill('q4', 'Complete: o formato de arquivo mais comum para salvar capturas de pacotes tem a extensão ___.', 'arquivo de captura: captura.___', ['pcap', '.pcap', 'pcapng'], 'O .pcap (e o .pcapng) guarda a captura para análise posterior; trate o arquivo como dado sensível.'),
        mcq('q5', 'Em uma captura, um computador abre conexões regulares, a cada minuto, para um endereço externo desconhecido, com pouco volume. O que isso pode indicar?', 'd', [
          'Uma atualização do sistema de impressão, explicação comum para tráfego periódico',
          'Falha do cabo de rede, que causa conexões periódicas por ruído elétrico',
          'Um backup feito pelo próprio sistema operacional, sem relação com segurança',
          'Possível comando e controle, que merece cruzar logs de DNS e firewall'
        ], 'Conexões periódicas a destinos desconhecidos são um indicador clássico, mas não prova sozinho: deve-se confirmar com outras fontes.'),
        mcq('q6', 'Um arquivo .pcap de um incidente contém tráfego sem cifra dos funcionários. Qual prática é mais adequada?', 'c', [
          'Publicá-lo em um fórum técnico aberto para receber ajuda da comunidade',
          'Guardá-lo em uma pasta compartilhada de toda a empresa, para consulta futura',
          'Restringir o acesso, cifrar o arquivo, definir retenção e anonimizar',
          'Mantê-lo indefinidamente no computador pessoal do analista, para estudo'
        ], 'A captura contém dados pessoais e deve ser protegida, ter retenção definida e ser anonimizada para compartilhamento.'),
        mcq('q7', 'Por que filtrar já na captura, quando possível?', 'a', [
          'Grava menos dados, reduzindo espaço e exposição de dados pessoais',
          'Porque o Wireshark não consegue abrir arquivos grandes de nenhuma forma',
          'Porque filtros de captura dispensam a autorização para capturar',
          'Porque assim a captura passa a ser cifrada automaticamente'
        ], 'Menos dados significam menos risco e menos trabalho. Filtro não substitui autorização nem cifra a captura.'),
        fill('q8', 'Complete: o filtro de exibição do Wireshark para mostrar apenas tráfego de consultas de nomes é simplesmente ___.', 'filtro de exibição: ___', ['dns'], 'No Wireshark, digitar dns na barra de filtro exibe somente pacotes do protocolo DNS.')
      ]
    },
    {
      id: 'csi-12-varredura-defensiva',
      title: 'Inventário e varredura defensiva da própria rede',
      goal: 'Descobrir o que existe na sua rede e o que está exposto, de forma autorizada, e interpretar os resultados.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Você não protege o que não conhece',
            'O primeiro passo de qualquer programa de segurança é o INVENTÁRIO: saber quais dispositivos, sistemas e serviços existem. Equipamentos esquecidos, servidores de teste ligados há anos e serviços que ninguém lembra são as portas mais comuns de problemas (o chamado shadow IT é o uso de sistemas fora do controle da TI). A VARREDURA é a técnica de perguntar à rede quem está presente e o que cada um oferece, comparando o resultado com o que DEVERIA existir. Revise do nível iniciante o conceito de superfície de ataque.'
          ),
          sl(
            'Autorização por escrito: obrigatória',
            'Varrer redes que não são suas é uma atividade que pode ser interpretada como tentativa de invasão e pode violar a legislação (em visão geral, Lei 12.737/2012 sobre invasão de dispositivo informático; isto não substitui orientação jurídica). Mesmo dentro da empresa, varreduras podem derrubar sistemas frágeis. Por isso: obtenha autorização por escrito de quem é o dono da rede, defina o ESCOPO (quais faixas), o horário, o contato de emergência e o que está proibido. Em laboratório, varra apenas máquinas virtuais suas. Se não tiver certeza de que é sua, não varra.'
          ),
          sl(
            'Nmap em conceito',
            'O Nmap é a ferramenta de referência para descobrir máquinas e portas. Em conceito, ele faz três coisas: DESCOBERTA de hosts ativos, VARREDURA DE PORTAS (quais portas respondem) e DETECÇÃO de serviços e versões (o que está rodando em cada porta). Cada porta pode estar aberta (um serviço aceita conexões), fechada (a máquina responde que não há serviço) ou filtrada (um firewall impede saber). Exemplo de uso defensivo, SOMENTE no seu laboratório e com autorização (sintaxe ilustrativa, não executada aqui):',
            '# Apenas em ambiente próprio e autorizado (faixa de documentação):\nnmap -sV 192.0.2.0/28\n# -sV tenta identificar o serviço e a versão em cada porta aberta\n# Estados possíveis: open (aberta) / closed (fechada) / filtered (filtrada)'
          ),
          sl(
            'Interpretando resultados',
            'Resultado fictício de um servidor: 22/tcp open (acesso remoto administrativo), 80/tcp open (site), 3306/tcp open (banco de dados). Pergunte para cada porta: deveria estar aberta? Para quem? O site na porta 80 é esperado; o acesso administrativo deveria estar limitado à rede de gestão; e o banco de dados aberto para toda a rede é um achado importante (deveria aceitar conexões só do servidor da aplicação). A versão do serviço permite consultar vulnerabilidades conhecidas. Resultados são fotografia de um momento: repita periodicamente.',
            'Porta   Estado  Serviço   Avaliação\n22/tcp  open    acesso remoto   restringir à rede de gestão\n80/tcp  open    site            esperado\n3306/tcp open   banco de dados  expor só à aplicação (achado)'
          ),
          sl(
            'Falsos positivos, impacto e boas práticas',
            'Ferramentas erram: podem detectar um serviço ou versão incorreta (falso positivo) ou deixar de ver algo por causa de firewall (falso negativo). Confirme os achados por outro meio antes de agir. Varreduras agressivas podem travar sistemas legados e impressoras, então comece suave e em horários combinados. Combine a varredura de rede com o inventário de ativos (uma lista oficial) para achar o que está ligado e não deveria, e o que deveria estar e sumiu. Trate o relatório como confidencial: ele é um mapa de pontos fracos. Entregue à equipe responsável com prioridades e prazos.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Antes de varrer a rede de uma empresa, o que é indispensável?', 'b', [
          'Avisar os colegas mais próximos, em conversa informal',
          'Autorização por escrito, com escopo, horário e contato de emergência definidos',
          'Instalar a ferramenta em um servidor de produção para obter resultados mais fiéis',
          'Escolher uma faixa de IPs aleatória da internet para garantir resultados imparciais'
        ], 'A autorização formal e o escopo claro protegem a empresa e o analista. Varrer faixas de terceiros é ilegal e arriscado.'),
        mcq('q2', 'O que significa uma porta no estado "filtered" em uma varredura?', 'd', [
          'A porta está aberta e o serviço está respondendo normalmente',
          'A porta está fechada e a máquina informou claramente que não há serviço',
          'A porta foi bloqueada de forma permanente pelo fabricante do equipamento',
          'Algo, como um firewall, impede saber se ela está aberta ou fechada'
        ], 'Filtrada significa que um filtro impede determinar o estado. Aberta e fechada têm respostas claras.'),
        mcq('q3', 'Uma varredura mostra um banco de dados aceitando conexões de qualquer endereço da rede. Qual é a avaliação mais adequada?', 'a', [
          'Achado importante: restringir o acesso apenas ao servidor da aplicação que precisa dele',
          'Normal, pois bancos de dados devem estar acessíveis à rede inteira para agilizar o trabalho',
          'Sem importância, desde que o banco use um nome diferente do padrão',
          'Resolvido, pois uma varredura já corrige os problemas que encontra'
        ], 'Serviços sensíveis devem aceitar conexões só de quem precisa. A varredura apenas descobre, não corrige.'),
        fill('q4', 'Complete: a ferramenta de referência para descobrir máquinas, portas e serviços em uma rede, usada com autorização, chama-se ___.', 'ferramenta de varredura: ___', ['nmap'], 'O Nmap é a ferramenta de referência para varredura e inventário de redes.'),
        mcq('q5', 'Uma varredura aponta um serviço com versão antiga. Qual é o próximo passo adequado?', 'c', [
          'Considerar confirmado e tirar o servidor do ar imediatamente, sem consultar ninguém',
          'Ignorar, pois ferramentas de varredura erram a versão com frequência',
          'Confirmar por outro meio, avaliar as vulnerabilidades da versão e priorizar a correção',
          'Publicar o resultado em redes sociais para pressionar o fornecedor'
        ], 'Os achados devem ser validados e priorizados, e o relatório é confidencial. Agir às cegas ou expor o resultado traz riscos.'),
        mcq('q6', 'Por que varreduras agressivas podem ser um problema mesmo dentro da empresa?', 'b', [
          'Porque o Nmap apaga arquivos dos equipamentos varridos por padrão',
          'Sistemas legados e impressoras podem travar com tráfego inesperado',
          'Porque a varredura cifra os dados dos sistemas varridos sem aviso',
          'Porque o resultado é idêntico, independentemente da agressividade'
        ], 'Equipamentos frágeis podem reagir mal; por isso se combinam horários e se começa com configurações suaves.'),
        mcq('q7', 'Qual é o valor de comparar a varredura com o inventário oficial de ativos?', 'd', [
          'Eliminar a necessidade de repetir a varredura nos meses seguintes',
          'Descobrir senhas esquecidas dos equipamentos listados no inventário',
          'Provar que os equipamentos usam criptografia forte nas conexões',
          'Revelar equipamentos ligados que não deveriam existir ou que sumiram'
        ], 'O contraste entre o real e o esperado expõe shadow IT e ativos esquecidos. A varredura é uma fotografia e precisa ser repetida.'),
        fill('q8', 'Complete: o uso de sistemas e serviços fora do controle e do conhecimento da área de TI chama-se shadow ___.', 'shadow ___', ['it', 'ti'], 'Shadow IT é a tecnologia usada sem o conhecimento da TI, um risco que o inventário ajuda a revelar.')
      ]
    },
    {
      id: 'csi-46-superficie-de-ataque-externa-e-osint-defensivo',
      title: 'Superfície de ataque externa e OSINT defensivo',
      goal: 'Descobrir o que a própria organização expõe na internet, incluindo domínios esquecidos, painéis e vazamentos, e monitorar isso continuamente, sempre com autorização e só sobre ativos próprios.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é superfície de ataque externa',
            'SUPERFÍCIE DE ATAQUE é o conjunto de pontos pelos quais um atacante pode tentar entrar ou obter informação. A parte EXTERNA é tudo o que a organização deixa visível a quem está na internet: sites, servidores, serviços de acesso remoto, e-mails, aplicativos e até informações públicas sobre funcionários. ASM (Attack Surface Management, gestão da superfície de ataque) é a prática de descobrir e acompanhar continuamente esses pontos, olhando de fora para dentro, como um atacante veria. A diferença para a varredura da lição anterior é a perspectiva: lá você olha a rede interna que conhece; aqui você procura o que talvez nem saiba que expôs. Tudo deve ser feito apenas sobre ativos PRÓPRIOS e com autorização.'
          ),
          sl(
            'O que costuma ficar esquecido',
            'Os achados mais comuns são coisas esquecidas. DOMÍNIOS E SUBDOMÍNIOS: um subdomínio como teste.example.com criado para um projeto antigo, que continua no ar sem atualização. Há também o caso de um nome de domínio apontando para um serviço de nuvem que a empresa já cancelou, risco conhecido como subdomain takeover (alguém registra o serviço e passa a controlar o endereço da empresa). BUCKETS (áreas de armazenamento em nuvem) com permissão pública por engano. PAINÉIS ADMINISTRATIVOS de sistemas expostos sem restrição de acesso. SERVIÇOS DE TESTE e certificados esquecidos. Cada um é um ativo sem dono, tema da lição de inventário.',
            'Achado (fictício)                         Risco\nteste.example.com sem manutenção          software desatualizado\nbucket com permissão pública              dados expostos\npainel admin acessível a qualquer IP      tentativa de senha / exploração\nsubdomínio apontando para serviço cancelado  tomada do endereço'
          ),
          sl(
            'OSINT defensivo',
            'OSINT (Open Source Intelligence, inteligência em fontes abertas) é coletar informação de fontes públicas, como buscadores, registros de domínio, repositórios de código e redes sociais. OSINT DEFENSIVO é fazer isso sobre a PRÓPRIA organização para ver o que um atacante veria: quais e-mails de funcionários aparecem publicamente, que informações técnicas vazam em anúncios de vagas ou posts, quais documentos internos estão indexados. O objetivo é reduzir a exposição e orientar a conscientização. Limites éticos e legais: não coletar dados pessoais de terceiros além do necessário, não contornar proteções e respeitar a LGPD; o mesmo método aplicado a pessoas ou organizações alheias, sem autorização, pode ser invasão de privacidade.'
          ),
          sl(
            'Vazamento de credenciais e de código',
            'Dois vazamentos frequentes merecem monitoramento. CREDENCIAIS VAZADAS: pares de e-mail e senha de funcionários que aparecem em bases públicas após o vazamento de OUTROS serviços; como muita gente reaproveita senhas, essas credenciais podem ser testadas contra os sistemas da empresa. A defesa é monitorar serviços de notificação de vazamento, forçar troca de senha, exigir MFA (autenticação multifator) e evitar reutilização. VAZAMENTO DE CÓDIGO: desenvolvedores que publicam, por engano, em repositórios públicos, chaves de acesso, tokens ou arquivos de configuração com segredos. A defesa é varrer repositórios por padrões de segredo, impedir o commit com segredos e REVOGAR imediatamente qualquer segredo exposto, pois apagar o arquivo não basta: a cópia pode já existir.'
          ),
          sl(
            'Monitoramento contínuo e resposta',
            'Uma foto única da superfície de ataque envelhece em dias, porque novos serviços, certificados e subdomínios surgem o tempo todo. Por isso o ASM é CONTÍNUO: descoberta automática periódica, comparação com o inventário e alerta quando aparece algo novo. Um fluxo prático: 1) descobrir ativos externos; 2) comparar com o inventário; 3) para cada item novo, achar o dono; 4) decidir entre regularizar, restringir o acesso ou desativar; 5) registrar e medir (quantos itens desconhecidos, quanto tempo até resolver). Ferramentas de varredura só devem apontar para domínios e IPs que pertencem à organização; escanear endereços de terceiros sem permissão pode configurar crime e violar termos de uso.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que diferencia a gestão da superfície de ataque externa da varredura defensiva da rede interna?', 'd', [
          'A externa só procura vírus em computadores de funcionários',
          'A interna é proibida por lei, e a externa é permitida em qualquer endereço',
          'Não há diferença: são nomes diferentes para a mesma prática, com o mesmo ponto de vista, usada por fornecedores distintos',
          'A externa olha de fora o que a organização expõe na internet, inclusive o que ela talvez nem saiba que expôs'
        ], 'O ASM adota a perspectiva de quem está na internet e descobre exposições esquecidas. Não é uma busca por vírus, não existe essa regra de proibição e as perspectivas são distintas.'),
        mcq('q2', 'A equipe encontra o subdomínio teste.example.com respondendo na internet, de um projeto encerrado há um ano, sem dono conhecido. Qual é a melhor ação?', 'b', [
          'Mantê-lo no ar, pois não há como saber se alguém ainda precisa dele e removê-lo poderia quebrar algum processo esquecido',
          'Achar o responsável, decidir se ainda é necessário e, se não for, desativá-lo e remover o registro DNS',
          'Trocar o nome do subdomínio para que ninguém o encontre mais',
          'Colocar um aviso de que o site está em construção'
        ], 'Um ativo esquecido deve ter dono ou ser desativado com limpeza do DNS. Manter, renomear ou colocar aviso mantém a superfície de ataque.'),
        mcq('q3', 'Uma bucket de armazenamento em nuvem da empresa está configurada com leitura pública por engano e contém planilhas de clientes. Qual é a primeira medida?', 'c', [
          'Aguardar a próxima auditoria anual para decidir o que fazer',
          'Apagar o registro do bucket no inventário para que não apareça nos relatórios',
          'Remover o acesso público imediatamente, avaliar se houve acesso indevido pelos registros e acionar o processo de incidente e de dados pessoais',
          'Informar os clientes por e-mail antes de qualquer análise técnica, para que troquem suas senhas por precaução e depois avaliar o que houve'
        ], 'Conter a exposição, investigar o acesso e acionar o processo de incidente (incluindo a análise de impacto sobre dados pessoais) é a ordem correta. Esperar, esconder ou comunicar sem apurar são erros.'),
        fill('q4', 'Complete: a sigla que significa coleta de informações em fontes públicas, usada de forma defensiva sobre a própria organização, é ___.', 'sigla: ___ (inteligência em fontes abertas)', ['osint'], 'OSINT é a coleta de informação em fontes abertas; usada sobre a própria organização, serve para reduzir a exposição.'),
        mcq('q5', 'Por que o vazamento de e-mail e senha de um funcionário em um serviço externo é um risco para a empresa?', 'a', [
          'Muita gente reutiliza senhas, e essas credenciais podem ser testadas nos sistemas da empresa',
          'Porque o serviço externo passa a controlar os servidores da empresa por causa do vazamento das credenciais',
          'Porque o e-mail do funcionário deixa de existir depois do vazamento',
          'Porque a empresa perde automaticamente o domínio na internet'
        ], 'O risco vem da reutilização de senhas, por isso se usa MFA e troca de senha. O vazamento não transfere o controle dos servidores, não apaga o e-mail nem faz perder o domínio.'),
        mcq('q6', 'Um desenvolvedor publicou por engano, em um repositório público, um arquivo de configuração com uma chave de acesso, e apagou o arquivo minutos depois. O que ainda é necessário?', 'a', [
          'Revogar e substituir a chave, pois alguém pode ter copiado o arquivo enquanto estava público',
          'Nada, pois apagar o arquivo elimina qualquer risco, já que o histórico some',
          'Avisar o desenvolvedor para ter mais cuidado da próxima vez',
          'Esperar para ver se há uso indevido antes de qualquer ação, pois o arquivo foi removido rapidamente'
        ], 'Segredo exposto deve ser considerado comprometido e revogado, pois cópias e históricos existem. Apagar, apenas orientar ou esperar não removem o risco.'),
        mcq('q7', 'Qual prática está alinhada com o uso ético e legal de ferramentas de descoberta de superfície de ataque?', 'd', [
          'Apontar a ferramenta para endereços de concorrentes para comparar a segurança deles com a nossa e usar o resultado em reuniões',
          'Varrer a faixa de IPs de um provedor de nuvem inteiro, em busca de buckets abertos',
          'Testar senhas fracas em painéis de terceiros para ver se funcionam',
          'Usar a ferramenta somente em domínios e IPs que pertencem à organização e com autorização formal'
        ], 'Só se examina o que é próprio ou foi expressamente autorizado. Varrer terceiros, mesmo por curiosidade ou comparação, pode configurar crime e violar termos de uso.'),
        fill('q8', 'Complete: como a superfície de ataque muda o tempo todo, o monitoramento deve ser ___, e não feito uma única vez.', 'monitoramento ___ (periódico e automático)', ['contínuo', 'continuo', 'continua', 'contínua'], 'Novos serviços e subdomínios surgem sempre; por isso a gestão da superfície de ataque é contínua e compara os achados com o inventário.')
      ]
    },
    {
      id: 'csi-13-gestao-de-vulnerabilidades',
      title: 'Gestão de vulnerabilidades',
      goal: 'Executar o ciclo de gestão de vulnerabilidades e priorizar correções com CVE, CVSS, EPSS e catálogos de vulnerabilidades exploradas.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Vulnerabilidade e o ciclo de gestão',
            'Uma VULNERABILIDADE é uma fraqueza em software, hardware ou configuração que pode ser explorada para causar dano. GESTÃO DE VULNERABILIDADES é o processo contínuo de achar, avaliar, priorizar, corrigir e verificar essas fraquezas. O ciclo: 1) Descobrir os ativos (inventário), 2) Varrer e identificar vulnerabilidades, 3) Avaliar e priorizar, 4) Corrigir (aplicar patch, mudar configuração ou mitigar), 5) Verificar se a correção funcionou e 6) Reportar e repetir. Não é um projeto com fim: surgem falhas novas todos os dias.'
          ),
          sl(
            'CVE e CVSS',
            'CVE (Common Vulnerabilities and Exposures) é um identificador público e único para cada vulnerabilidade conhecida, no formato CVE-ANO-NÚMERO (por exemplo, CVE-2021-12345, número fictício). Com ele, todo mundo fala da mesma falha. O CVSS (Common Vulnerability Scoring System) dá uma nota de GRAVIDADE de 0 a 10 baseada em características da falha (como é explorada, se exige autenticação, o impacto em confidencialidade, integridade e disponibilidade). Faixas qualitativas: baixa, média, alta e crítica. Armadilha comum: tratar a nota CVSS como o RISCO. Ela mede gravidade técnica genérica, não o risco no SEU ambiente.'
          ),
          sl(
            'EPSS e catálogos de vulnerabilidades exploradas',
            'Duas fontes ajudam a responder "isso está sendo atacado de verdade?". O EPSS (Exploit Prediction Scoring System) estima a PROBABILIDADE de uma vulnerabilidade ser explorada nos próximos dias, de 0 a 1 (ou em porcentagem): é uma previsão estatística. Os CATÁLOGOS DE VULNERABILIDADES EXPLORADAS (como o KEV mantido pela agência de segurança dos EUA, a CISA) listam falhas com exploração ATIVA confirmada. Se uma falha está em um catálogo desses, trate com urgência máxima, mesmo que a nota CVSS pareça média, pois já existe uso real em ataques.'
          ),
          sl(
            'Priorização com contexto',
            'Com milhares de achados, é impossível corrigir tudo ao mesmo tempo. Priorize combinando: gravidade (CVSS), probabilidade (EPSS), exploração confirmada (catálogos), EXPOSIÇÃO (o sistema está na internet?), criticidade do ativo (guarda dados pessoais? é essencial ao negócio?) e controles compensatórios existentes (há segmentação ou WAF reduzindo o risco?). Exemplo: uma falha de nota média, exposta à internet, em catálogo de exploração ativa, em servidor crítico, vem ANTES de uma falha de nota crítica em máquina isolada e sem dados.',
            'Prioridade alta = explorada ativamente + exposta + ativo crítico\nPrioridade menor = nota alta, mas isolada, sem exploração conhecida'
          ),
          sl(
            'SLAs de correção e exceções',
            'Um SLA de correção define prazos por prioridade, por exemplo: urgente em dias, alta em semanas, baixa em ciclos regulares. Os prazos exatos dependem da organização e do apetite a risco; o importante é que existam, sejam conhecidos e medidos. Nem tudo pode ser corrigido a tempo (sistema legado, janela de manutenção, risco de quebrar a produção). Nesses casos, registre uma EXCEÇÃO formal: justificativa, aprovação do dono do risco, MITIGAÇÃO temporária (isolar, restringir o acesso, monitorar) e DATA de revisão. Exceção sem prazo vira esquecimento.'
          ),
          sl(
            'Verificação e métricas',
            'Depois de corrigir, confirme com nova varredura ou teste: patch aplicado não é igual a vulnerabilidade resolvida (a máquina pode não ter reiniciado, ou o serviço continua com a versão antiga). Acompanhe métricas: tempo médio para corrigir, quantidade de itens vencidos fora do SLA, cobertura da varredura (quantos ativos são realmente varridos) e reincidência. Varreduras com credenciais (autenticadas) enxergam muito mais que as externas, mas exigem cuidado com a guarda dessas credenciais. Lembre: faça tudo com autorização e no seu próprio ambiente.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que é um identificador CVE?', 'a', [
          'Um número público e único que identifica uma vulnerabilidade',
          'Uma nota de 0 a 10 que mede o risco total para a sua empresa',
          'Um programa que corrige automaticamente falhas em sistemas operacionais',
          'Uma lista privada de senhas fracas encontradas em um ambiente'
        ], 'O CVE nomeia a vulnerabilidade para que todos falem da mesma coisa. A nota de gravidade é o CVSS, e o CVE não corrige nada.'),
        mcq('q2', 'Por que a nota CVSS não deve ser usada sozinha como o risco da empresa?', 'c', [
          'Porque o CVSS foi descontinuado e as notas deixaram de ser calculadas',
          'Porque notas altas costumam ser falsas e as baixas costumam ser verdadeiras',
          'Mede a gravidade técnica genérica e ignora exposição e exploração real',
          'Porque o CVSS se aplica a sistemas operacionais e não a aplicativos'
        ], 'O CVSS é um insumo de gravidade técnica; o risco real depende de contexto como exposição e importância do ativo.'),
        mcq('q3', 'Uma falha de nota média aparece em um catálogo de vulnerabilidades exploradas ativamente e afeta um servidor exposto à internet. O que fazer?', 'd', [
          'Deixar para o ciclo trimestral, pois a nota é média',
          'Registrar uma exceção por prazo indefinido e seguir com outras tarefas',
          'Aguardar a nota subir para crítica antes de iniciar qualquer ação',
          'Alta prioridade, pois já há exploração real e o sistema está exposto'
        ], 'Exploração ativa e exposição elevam muito o risco, mesmo com nota média.'),
        fill('q4', 'Complete: a estimativa estatística da probabilidade de uma vulnerabilidade ser explorada nos próximos dias chama-se ___.', 'sigla da estimativa de probabilidade de exploração: ___', ['epss'], 'O EPSS estima a probabilidade de exploração; complementa o CVSS, que mede gravidade.'),
        mcq('q5', 'Qual item NÃO deveria faltar em uma exceção de correção?', 'b', [
          'Uma lista de pessoas responsáveis por aplicar o patch no próximo mês',
          'Justificativa, aprovação do dono do risco, mitigação e data de revisão',
          'O apagamento do achado do relatório para não gerar cobranças',
          'A desativação das varreduras para aquele ativo'
        ], 'Exceção é um risco aceito de forma consciente, com mitigação e prazo. Apagar o achado ou parar de varrer esconde o problema.'),
        mcq('q6', 'Qual caso deveria ser corrigido primeiro?', 'a', [
          'Falha média, exposta à internet, com exploração ativa conhecida e dados pessoais',
          'Falha crítica em máquina de laboratório desligada da rede e sem dados',
          'Falha baixa em impressora isolada em uma sala, sem exposição',
          'Todas têm a mesma prioridade, pois qualquer falha pode ser usada em ataques'
        ], 'O contexto (exposição, exploração e criticidade) pesa mais que a nota isolada. Tratar tudo igual impede priorizar.'),
        mcq('q7', 'Após aplicar um patch, a equipe marca o item como resolvido sem testar. Por que é arriscado?', 'd', [
          'Porque patches costumam falhar e exigem uma segunda tentativa',
          'Porque a verificação só serve para auditorias externas, não para a segurança',
          'Porque patch aplicado é prova de correção, mas é preciso avisar o fornecedor',
          'A máquina pode não ter reiniciado ou o serviço seguir na versão antiga'
        ], 'A verificação fecha o ciclo. Patch instalado não garante que a falha foi eliminada.'),
        fill('q8', 'Complete: o prazo combinado para corrigir cada nível de prioridade chama-se ___ de correção.', 'prazo combinado por prioridade = ___ de correção (sigla)', ['sla'], 'O SLA (acordo de nível de serviço) de correção define os prazos por prioridade e permite medir o cumprimento.')
      ]
    },
    {
      id: 'csi-44-gestao-de-patches-processo',
      title: 'Gestão de patches como processo',
      goal: 'Conduzir a aplicação de correções como um processo com etapas, testes, janela, verificação e rollback, incluindo casos de emergência e sistemas que não podem reiniciar.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Patch não é só clicar em atualizar',
            'PATCH é uma correção publicada pelo fabricante para uma falha (de segurança ou de funcionamento) em um software ou firmware. GESTÃO DE PATCHES é o processo organizado de decidir quais correções aplicar, onde, quando e como confirmar que deu certo. Aplicar tudo de uma vez, sem critério, pode derrubar sistemas importantes; adiar tudo deixa falhas conhecidas abertas, e falhas conhecidas são justamente as mais usadas em ataques. O equilíbrio vem de um processo repetível, com responsáveis e registros. Ele complementa o ciclo de gestão de vulnerabilidades: lá se decide o que é prioritário, aqui se executa a correção com segurança.'
          ),
          sl(
            'As seis etapas do processo',
            'Um processo típico tem seis etapas. 1) INVENTÁRIO: saber quais sistemas existem e quais versões rodam. 2) AVALIAÇÃO: ler o aviso do fabricante, entender a falha e priorizar (gravidade, exposição, criticidade). 3) TESTE: aplicar primeiro em um ambiente de testes parecido com a produção. 4) JANELA DE IMPLANTAÇÃO: aplicar na produção em horário combinado, com aviso às áreas afetadas. 5) VERIFICAÇÃO: confirmar que o patch entrou e que o sistema funciona (versão, serviços no ar, nova varredura). 6) ROLLBACK, o plano de reverter para a versão anterior se algo der errado, preparado ANTES da janela. Pular o teste ou o rollback é o erro mais comum.',
            '1 Inventário -> 2 Avaliação -> 3 Teste -> 4 Janela de implantação\n                                          |\n                  6 Rollback (se falhar) <- 5 Verificação'
          ),
          sl(
            'Ambientes de teste e janelas de manutenção',
            'AMBIENTE DE TESTES é uma cópia, ou aproximação, da produção onde os patches são experimentados sem afetar usuários reais. Quanto mais parecido com a produção, mais confiável o teste. Muitas organizações aplicam em ondas: primeiro um grupo-piloto pequeno, depois grupos maiores, para limitar o estrago se algo falhar. JANELA DE MANUTENÇÃO (ou janela de implantação) é o intervalo combinado em que mudanças podem causar indisponibilidade, escolhido para atrapalhar o mínimo possível, como madrugadas ou finais de semana. A janela é comunicada com antecedência e registrada como uma mudança formal, com aprovação do responsável pelo sistema.'
          ),
          sl(
            'Patches emergenciais',
            'Quando uma falha está sendo explorada ativamente (por exemplo, consta em um catálogo de vulnerabilidades exploradas) e afeta sistemas expostos, esperar a janela normal pode ser perigoso. O PATCH EMERGENCIAL segue um caminho acelerado: aprovação rápida por um grupo previamente definido, teste reduzido mas não eliminado (ao menos em um grupo-piloto), comunicação imediata e rollback pronto. Atenção ao erro comum de transformar emergência em regra: se todo mês é emergência, o processo normal está lento demais ou o inventário está ruim. Toda emergência deve ser registrada e revisada depois, para ajustar o processo.'
          ),
          sl(
            'Sistemas que não podem reiniciar ou receber o patch',
            'Alguns sistemas são difíceis de corrigir: um equipamento de produção que não pode parar, um software antigo que quebra com a atualização, um fornecedor que ainda não liberou correção. Nesses casos usa-se COMPENSAÇÃO, medidas que reduzem o risco enquanto o patch não vem. Exemplos: VIRTUAL PATCHING, que é uma regra em um firewall de aplicação web ou IPS que bloqueia o tipo de tráfego que exploraria a falha, sem alterar o sistema em si; SEGMENTAÇÃO, isolando o sistema em uma rede restrita; reduzir exposição (tirar da internet) e reforçar monitoramento. A compensação não elimina a falha e deve vir com prazo e registro de exceção formal.'
          ),
          sl(
            'Métricas de conformidade e erros comuns',
            'Para saber se o processo funciona, meça. COBERTURA DE PATCHES (conformidade): proporção de sistemas que estão com as correções exigidas aplicadas dentro do prazo definido (o SLA). Outras métricas: tempo médio entre a publicação do patch e a aplicação, quantidade de sistemas fora do prazo e percentual de mudanças que precisaram de rollback. Armadilhas frequentes: aplicar o patch, mas esquecer o reinício exigido; corrigir só o sistema operacional e esquecer aplicativos e firmware; não atualizar máquinas que ficam fora do escritório; e não verificar depois. Lembre de executar tudo apenas nos ambientes da própria organização.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a ordem correta das etapas de um processo de gestão de patches?', 'b', [
          'Janela de implantação, teste, avaliação, inventário, verificação e rollback, com a verificação feita só no fim',
          'Inventário, avaliação, teste, janela de implantação, verificação e plano de rollback preparado',
          'Rollback, janela de implantação, verificação, teste, inventário e avaliação',
          'Teste, rollback, inventário, janela, avaliação e verificação'
        ], 'Primeiro se sabe o que existe, depois avalia-se, testa-se, implanta-se e verifica-se, com rollback preparado antes da janela. As demais ordens invertem etapas, como implantar antes de testar.'),
        mcq('q2', 'Uma equipe aplica um patch diretamente na produção, sem testar, porque o fabricante classificou a falha como crítica. O sistema fica fora do ar. Qual etapa foi ignorada?', 'd', [
          'A verificação, que deveria ter sido feita antes da aplicação do patch, ainda na fase de planejamento',
          'O inventário, que deveria ter impedido a publicação do patch',
          'A avaliação, que deveria ter cancelado o patch',
          'O teste em ambiente parecido com a produção, com um plano de rollback pronto'
        ], 'Testar antes e ter rollback previne esse tipo de indisponibilidade. A verificação ocorre depois da aplicação, o inventário não impede publicações, e avaliar não significa cancelar patches.'),
        mcq('q3', 'O que é rollback?', 'a', [
          'O plano de voltar o sistema à versão anterior caso o patch cause problemas',
          'O ato de adiar a aplicação do patch para o ano seguinte',
          'Uma varredura que lista todas as vulnerabilidades do sistema depois do patch',
          'A aprovação formal do patch pelo fabricante do software, antes de publicá-lo ao público'
        ], 'Rollback é a reversão planejada. Adiar é outra decisão, a varredura é verificação e a aprovação do fabricante acontece antes da publicação.'),
        fill('q4', 'Complete: o horário combinado em que mudanças como a aplicação de patches podem causar indisponibilidade chama-se janela de ___.', 'janela de ___ (ou implantação)', ['manutenção', 'manutencao', 'implantação', 'implantacao'], 'A janela de manutenção (ou de implantação) é o intervalo comunicado e aprovado para mudanças, escolhido para minimizar o impacto.'),
        mcq('q5', 'Quando é adequado usar o caminho de patch emergencial?', 'c', [
          'Quando o fabricante lançar uma atualização, para ganhar tempo',
          'Quando o responsável pelo sistema estiver de férias e não puder aprovar o processo normal de mudanças, pois a janela precisa ser cumprida',
          'Quando a falha está sendo explorada ativamente e afeta sistemas expostos, com teste reduzido e rollback pronto',
          'Quando a equipe de TI não conseguiu terminar os testes dentro do prazo normal'
        ], 'Emergência se justifica por risco real e imediato, e mesmo assim com aprovação, ao menos teste mínimo e rollback. Ganhar tempo ou atrasos internos não são emergências.'),
        mcq('q6', 'Uma máquina industrial não pode reiniciar e o fabricante ainda não liberou o patch para uma falha grave. Qual conjunto de medidas é mais adequado enquanto isso?', 'd', [
          'Manter tudo como está e retirar a máquina do inventário para não gerar alertas',
          'Instalar patches de outro fabricante, mesmo que não sejam compatíveis, para aumentar a proteção geral do equipamento e reduzir a necessidade de esperar pelo fabricante original',
          'Desativar o antivírus e o monitoramento, que podem atrapalhar a produção',
          'Segmentar em rede restrita, tirar de exposição, aplicar virtual patching se possível, monitorar e registrar a exceção com prazo'
        ], 'A compensação reduz o risco sem alterar o sistema: isolamento, menos exposição, regra de bloqueio e monitoramento, tudo formalizado. Esconder o ativo, instalar patch incompatível ou desligar proteções piora o cenário.'),
        mcq('q7', 'Qual métrica indica melhor a conformidade de patches de uma organização?', 'b', [
          'O número de vezes que a palavra patch aparece nos relatórios mensais de TI',
          'A proporção de sistemas com as correções exigidas aplicadas dentro do prazo definido',
          'A quantidade de patches publicados pelos fabricantes durante o ano, como indicador do volume de trabalho',
          'O tempo que a equipe gasta em reuniões sobre atualizações'
        ], 'A conformidade mede quantos sistemas estão corrigidos no prazo. As outras opções medem volume de texto, produção dos fabricantes ou tempo de reunião, nada disso mostra o estado dos sistemas.'),
        fill('q8', 'Complete: uma regra em um firewall de aplicação web que bloqueia o tráfego que exploraria uma falha, sem alterar o sistema vulnerável, é chamada de ___ patching.', '___ patching (compensação sem alterar o sistema)', ['virtual'], 'Virtual patching protege o sistema por fora, bloqueando o tipo de tráfego malicioso, enquanto o patch real não pode ser aplicado.')
      ]
    },
    {
      id: 'csi-45-zero-day-e-divulgacao-de-vulnerabilidades',
      title: 'Zero-day e divulgação de vulnerabilidades',
      goal: 'Entender o ciclo de vida de uma vulnerabilidade, o que é zero-day, como funciona a divulgação coordenada, CVE, bug bounty e VDP, e saber como reagir quando um zero-day é anunciado.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é um zero-day',
            'ZERO-DAY (ou 0-day) é uma vulnerabilidade que o fabricante AINDA NÃO conhece ou para a qual AINDA NÃO existe correção disponível; o nome vem de os defensores terem "zero dias" para se preparar. Quando um atacante usa essa falha antes de existir patch, fala-se em ataque zero-day. Duas confusões comuns: zero-day não significa "falha muito grave" (a gravidade é outra medida) e não significa "falha nova" (ela pode existir há anos sem ninguém notar). O termo descreve a situação: sem correção disponível e, muitas vezes, com exploração em curso. Depois que o patch sai, a falha deixa de ser zero-day e passa a ser uma vulnerabilidade conhecida.'
          ),
          sl(
            'O ciclo de vida de uma vulnerabilidade',
            'Toda vulnerabilidade passa por fases, embora a ordem varie. 1) DESCOBERTA: alguém (pesquisador, o próprio fabricante, um atacante) encontra a falha. 2) DIVULGAÇÃO: o fabricante é informado e depois o público. 3) PATCH: o fabricante publica a correção. 4) EXPLORAÇÃO: atacantes usam a falha; isso pode começar ANTES do patch (zero-day) ou depois dele, aproveitando organizações que demoram a atualizar. Um fato importante: a janela de risco continua grande depois do patch, porque a correção só protege quem a aplica. Por isso a gestão de patches é tão importante mesmo para falhas "antigas".',
            'Descoberta -> Divulgação -> Patch -> Exploração em massa\n       \\_______ possível exploração zero-day _______/'
          ),
          sl(
            'Divulgação coordenada ou responsável',
            'Quando um pesquisador acha uma falha, ele escolhe como divulgar. DIVULGAÇÃO COORDENADA (ou responsável) é o modelo em que o pesquisador avisa o fabricante em PRIVADO, combina um prazo para a correção e só depois publica detalhes. Isso dá tempo para o patch existir antes de a informação chegar a atacantes. No extremo oposto está a divulgação imediata e pública, que expõe usuários antes da correção. Existem prazos habituais, mas variam e são acordos, não regras universais. Se o fabricante ignora o aviso por muito tempo, a coordenação pode envolver um intermediário, como um centro de resposta a incidentes (CSIRT) nacional.'
          ),
          sl(
            'CVE: o identificador e quem o atribui',
            'CVE (Common Vulnerabilities and Exposures) é o identificador público e único da vulnerabilidade, no formato CVE-ANO-NÚMERO (exemplo fictício: CVE-2099-0001). Quem atribui os identificadores são as CNAs (CVE Numbering Authorities), organizações autorizadas a isso, como grandes fabricantes e coordenadores; o programa é mantido pela MITRE com apoio de agências governamentais. O CVE não é nota de gravidade (isso é o CVSS), e um zero-day pode ainda NÃO ter CVE no momento em que está sendo explorado. Ter o identificador permite que fornecedores, ferramentas de varredura e equipes falem da mesma falha.'
          ),
          sl(
            'Bug bounty, VDP e security.txt',
            'Organizações abrem canais para receber relatos de falhas. VDP (Vulnerability Disclosure Policy, política de divulgação de vulnerabilidades) é a regra pública que diz: o que pode ser testado, como reportar, o que a organização promete (não processar quem agir de boa-fé dentro das regras, responder em prazo). BUG BOUNTY é um programa que, além disso, PAGA recompensas por achados válidos, geralmente com escopo e regras definidos; pesquisadores só devem testar o que o escopo autoriza. Um arquivo chamado security.txt, publicado em um endereço padrão do site, informa em texto simples os contatos e a política. Exemplo conceitual com dados fictícios abaixo.',
            'Contact: mailto:seguranca@example.com\nExpires: <data de validade>\nPolicy: https://example.com/politica-de-divulgacao\nPreferred-Languages: pt, en'
          ),
          sl(
            'O que fazer quando um zero-day é anunciado',
            'Quando surge um alerta de zero-day que pode afetar a sua organização, a rotina é: 1) CONSULTAR o inventário para saber se e onde o produto afetado existe. 2) Ler o aviso do fabricante e de fontes confiáveis, como o CSIRT nacional. 3) Aplicar MITIGAÇÕES oficiais, como desativar um recurso, restringir acesso ou ativar uma regra, enquanto o patch não sai. 4) Reduzir exposição (tirar da internet o que não precisa estar). 5) Reforçar o MONITORAMENTO com indicadores divulgados. 6) Aplicar o patch assim que existir, seguindo o processo de patches. 7) Comunicar as partes interessadas. Pânico e improviso são piores que um plano ensaiado.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a melhor definição de zero-day?', 'a', [
          'Uma vulnerabilidade desconhecida do fabricante ou ainda sem correção disponível',
          'Qualquer vulnerabilidade descoberta nas últimas 24 horas, mesmo que o patch já exista',
          'Uma vulnerabilidade de nota máxima no CVSS, independentemente de haver correção',
          'Um ataque feito exclusivamente no primeiro dia do mês contra sistemas desatualizados'
        ], 'O termo descreve a situação de não haver correção disponível. Idade da descoberta, nota CVSS ou data do ataque não definem zero-day.'),
        mcq('q2', 'Uma falha existe há anos em um software, mas só agora foi descoberta por um atacante, que a usa antes de o fabricante saber. Essa falha é um zero-day?', 'c', [
          'Não, porque zero-day só se aplica a falhas descobertas nas últimas horas',
          'Não, pois o atacante precisaria ser um grupo patrocinado por governo para que a falha seja classificada assim',
          'Sim: o fabricante ainda não conhece a falha nem há patch, não importa há quanto tempo ela exista',
          'Sim, mas só se a falha tiver recebido nota CVSS crítica'
        ], 'Zero-day descreve ausência de conhecimento e de correção, não a idade da falha. Quem a explora e a nota CVSS não entram na definição.'),
        mcq('q3', 'Em qual fase do ciclo de vida uma vulnerabilidade já pode estar sendo explorada em um ataque zero-day?', 'b', [
          'Depois de o patch ser publicado e instalado pelos usuários do produto afetado',
          'Antes de existir patch, inclusive antes da divulgação pública da falha',
          'Depois de o CVE receber a nota CVSS',
          'Só depois do fim do programa de bug bounty'
        ], 'Zero-day implica exploração antes da correção. O CVSS, o bug bounty e a instalação do patch são etapas ou processos que não impedem exploração anterior.'),
        fill('q4', 'Complete: o modelo em que o pesquisador avisa o fabricante em privado, combina um prazo e só depois publica detalhes chama-se divulgação ___.', 'divulgação ___ (ou responsável)', ['coordenada', 'responsável', 'responsavel'], 'Na divulgação coordenada (ou responsável) o fabricante ganha tempo de criar o patch antes da publicação dos detalhes.'),
        mcq('q5', 'Qual é a diferença entre um VDP e um programa de bug bounty?', 'd', [
          'VDP é obrigatório por lei para toda empresa e bug bounty é proibido',
          'O VDP paga a mesma quantia a quem relatar, e o bug bounty não paga nada, pois aceita relatos de funcionários da própria organização',
          'São o mesmo documento com nomes diferentes, usados por fornecedores distintos',
          'O VDP define como e o que reportar, e o bug bounty acrescenta recompensas por achados válidos dentro de um escopo'
        ], 'O VDP é a política de recebimento de relatos; o bug bounty é um programa que oferece pagamento. Não há obrigação legal universal nem proibição, e o VDP em si não paga.'),
        mcq('q6', 'Sua organização lê o anúncio de um zero-day em um produto. Qual é o primeiro passo mais útil?', 'b', [
          'Esperar o patch sem fazer nada, pois ainda não existe correção',
          'Consultar o inventário para saber se e onde o produto afetado é usado, e aplicar as mitigações oficiais',
          'Publicar nas redes sociais da empresa que os sistemas estão vulneráveis, para alertar os clientes o mais rápido possível',
          'Desligar os servidores da empresa até o fim da semana'
        ], 'Saber se se está afetado, via inventário, e aplicar mitigações do fabricante reduz o risco. Esperar sem agir, divulgar a fraqueza ou parar tudo são reações ruins.'),
        mcq('q7', 'Para que serve o arquivo security.txt publicado em um site?', 'c', [
          'Para armazenar as senhas dos administradores de forma criptografada',
          'Para bloquear o acesso de pesquisadores ao site',
          'Para informar em um local padrão os contatos e a política para relatar falhas de segurança',
          'Para listar todas as vulnerabilidades ainda não corrigidas do site, de forma pública, para pressionar a equipe técnica'
        ], 'O security.txt facilita que alguém encontre como reportar uma falha. Ele não guarda senhas, não bloqueia ninguém e não publica falhas abertas.'),
        fill('q8', 'Complete: o identificador público e único de uma vulnerabilidade, no formato CVE-ANO-NÚMERO, é chamado de ___.', 'identificador de vulnerabilidade: ___', ['cve'], 'O CVE dá um nome único à falha; a gravidade é medida pelo CVSS e o CVE pode ainda não existir para um zero-day recém-explorado.')
      ]
    },
    {
      id: 'csi-14-siem-e-logs-centralizados',
      title: 'SIEM e logs centralizados',
      goal: 'Entender como logs são coletados, normalizados e correlacionados em um SIEM, e como manter qualidade e reduzir ruído.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Do log isolado à visão central',
            'No nível iniciante você viu que logs são registros de eventos. O problema é que cada sistema guarda os seus, em formatos diferentes, e um ataque deixa pistas espalhadas por vários deles. Um SIEM (Security Information and Event Management) reúne os logs em um só lugar, padroniza, procura relações entre eles e gera ALERTAS. Ele é a principal ferramenta de um SOC (Centro de Operações de Segurança, a equipe que monitora e responde a alertas 24 horas). O SIEM não é mágico: vale o que os logs e as regras que você coloca nele valem.'
          ),
          sl(
            'Coleta e normalização',
            'COLETA: os logs chegam por agentes instalados nas máquinas, por envio em protocolos como o syslog, por APIs de serviços em nuvem ou por leitura de arquivos. NORMALIZAÇÃO: cada fonte escreve de um jeito ("falha de login", "authentication failure", "4625"); o SIEM converte para campos comuns (usuário, endereço de origem, resultado, horário). Sem normalizar, não dá para escrever uma regra única que valha para todas as fontes. A hora é crítica: sincronize os relógios dos sistemas (NTP) e use fuso padronizado, senão a ordem dos eventos fica impossível de reconstruir.',
            'Fonte A: "Failed password for usuario1 from 192.0.2.50"\nFonte B: "authentication failure user=usuario1 src=192.0.2.50"\nNormalizado: evento=falha_login  usuario=usuario1  origem=192.0.2.50'
          ),
          sl(
            'Correlação',
            'CORRELAÇÃO é ligar eventos de fontes diferentes para formar uma história. Um único login falho é banal; 200 falhas em 2 minutos seguidas de um login bem-sucedido do mesmo endereço, e depois de um acesso a um servidor de arquivos a que o usuário nunca acessou, é um alerta de alta confiança. Regras de correlação costumam ter condição, janela de tempo e limite. Também se usam linhas de base de comportamento (anomalias): "este usuário nunca acessa de outro país". Os alertas devem apontar para uma ação ou investigação definida (playbook).'
          ),
          sl(
            'Fontes essenciais de log',
            'Prioridade para fontes que contam a história de um ataque: autenticação (servidor de diretório, SSO, VPN), endpoints (EDR, eventos do sistema operacional), rede (firewall, proxy, DNS), e-mail (gateway), nuvem (logs de auditoria da conta e dos serviços), aplicações críticas e bancos de dados, e sistemas de segurança (antivírus, IDS/IPS, WAF). Não colete tudo por reflexo: custo e ruído crescem. Comece pelas fontes mais valiosas e pelas perguntas que precisa responder (quem entrou? o que mudou? o que saiu?).'
          ),
          sl(
            'Retenção, qualidade e LGPD',
            'RETENÇÃO é por quanto tempo os logs ficam guardados. Muito pouco impede investigar ataques descobertos tarde (muitos são descobertos meses depois); demais gera custo e risco de privacidade. Defina prazos por tipo de log, conforme exigências legais e necessidades da investigação, e proteja os logs: acesso restrito, integridade (ninguém deve apagar o rastro do próprio erro) e cópia fora do sistema de origem. QUALIDADE: logs devem ter hora, quem, o quê, de onde e resultado; não gravar senhas, tokens ou dados pessoais desnecessários. Pela LGPD, logs com dados pessoais pedem finalidade, necessidade e segurança.'
          ),
          sl(
            'Ruído e fadiga de alertas',
            'Se o SIEM gera centenas de alertas inúteis por dia, os analistas passam a ignorá-los (fadiga de alertas) e o alerta importante se perde. Para reduzir: ajuste limites, exclua fontes ou eventos conhecidos como benignos (com cuidado e documentando), una alertas repetidos, classifique por severidade, meça a taxa de falsos positivos por regra e desligue ou refine as que nunca servem. Uma regra boa tem objetivo claro, dono e revisão periódica. Menos alertas melhores valem mais que muitos alertas ruins.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Para que serve a normalização dos logs em um SIEM?', 'b', [
          'Para reduzir o tamanho dos arquivos de log, apagando os eventos mais antigos',
          'Converter formatos diferentes em campos comuns e permitir regras únicas',
          'Para cifrar os logs de forma que ninguém, nem o analista, consiga lê-los',
          'Para impedir que novos sistemas enviem logs ao SIEM'
        ], 'A normalização padroniza campos e permite correlacionar e escrever regras únicas. Não apaga nem cifra os logs.'),
        mcq('q2', 'Qual exemplo representa correlação?', 'd', [
          'Contar quantos arquivos de log existem em cada servidor ao final do mês',
          'Guardar uma cópia de cada log em um disco externo',
          'Enviar os logs por e-mail ao gestor da segurança',
          'Ligar 200 falhas de login a um sucesso e a um acesso incomum'
        ], 'Correlação conecta eventos de fontes diferentes em uma sequência significativa.'),
        mcq('q3', 'Por que sincronizar os relógios dos sistemas é essencial para os logs?', 'a', [
          'Para reconstruir a ordem real dos eventos entre fontes diferentes durante uma investigação',
          'Para que os logs ocupem menos espaço no armazenamento',
          'Para que os usuários não possam alterar o horário dos próprios computadores pessoais',
          'Para impedir que os logs sejam enviados duas vezes ao SIEM'
        ], 'Sem horários coerentes, a linha do tempo do incidente fica inconsistente.'),
        fill('q4', 'Complete: a equipe que monitora alertas e responde a incidentes de segurança de forma contínua é o ___ (Centro de Operações de Segurança).', 'sigla da equipe de monitoramento: ___', ['soc'], 'O SOC é o centro de operações de segurança, que usa o SIEM como ferramenta principal.'),
        mcq('q5', 'Um ataque é descoberto 5 meses depois de começar, mas a retenção de logs é de 30 dias. Qual é a consequência?', 'c', [
          'Nenhuma, porque o SIEM reconstrói os eventos antigos a partir do que lembra',
          'A investigação fica mais fácil, pois há menos dados para analisar',
          'Faltam registros do início, o que dificulta saber como o ataque começou',
          'Os logs recentes serão automaticamente maiores, compensando a falta dos antigos'
        ], 'Retenção curta apaga o rastro do início do ataque. É preciso equilibrar prazos com custo e privacidade.'),
        mcq('q6', 'Qual prática melhora a qualidade dos logs?', 'b', [
          'Gravar a senha digitada junto de cada falha de login, para facilitar a análise',
          'Registrar quem, o quê, quando, de onde e resultado, sem segredos',
          'Registrar só os eventos de sucesso, para reduzir o volume',
          'Gravar tudo em arquivos editáveis por qualquer usuário do sistema'
        ], 'Bons logs são completos nos campos úteis e livres de segredos. Gravar senhas vaza credenciais e logs editáveis perdem a confiabilidade.'),
        mcq('q7', 'O SIEM gera centenas de alertas por dia, quase todos falsos, e os analistas passaram a ignorá-los. Qual a melhor resposta?', 'a', [
          'Refinar regras com limites, exceções documentadas e medição de falsos positivos',
          'Desligar o SIEM, porque alertas demais provam que a ferramenta não presta',
          'Aumentar o número de regras genéricas para cobrir mais cenários',
          'Contratar analistas para clicar em fechar nos alertas'
        ], 'O ajuste contínuo reduz o ruído e preserva a atenção dos analistas. Desligar ou aumentar regras genéricas piora o quadro.'),
        fill('q8', 'Complete: o cansaço que leva analistas a ignorar alertas quando há alertas demais chama-se fadiga de ___.', 'fadiga de ___', ['alertas', 'alerta'], 'A fadiga de alertas faz o alerta importante se perder no meio do ruído.')
      ]
    },
    {
      id: 'csi-15-deteccao-sigma-yara',
      title: 'Regras de detecção: Sigma e YARA',
      goal: 'Entender o que é uma regra de detecção, ler exemplos simples de Sigma e YARA e conduzir o ciclo de ajuste contra falsos positivos.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é uma regra de detecção',
            'Uma REGRA DE DETECÇÃO descreve, de forma que uma máquina entenda, um comportamento ou um objeto suspeito: "se aparecer este evento com estas características, gere um alerta". É a tradução da inteligência (por exemplo, uma técnica do ATT&CK) para algo que o SIEM ou o EDR executa. Uma boa regra tem objetivo claro (qual comportamento procura), é testada, tem descrição, nível de severidade, referências e sabe-se de seus falsos positivos conhecidos. Regra sem teste é suposição.'
          ),
          sl(
            'Sigma: regras para logs',
            'Sigma é um formato aberto e independente de produto para escrever regras que operam sobre LOGS. Você escreve a regra uma vez em YAML e conversores a traduzem para a linguagem de cada SIEM. Estrutura básica: título, descrição, fonte de log (qual tipo de log), detecção (condições) e falsos positivos conhecidos. O exemplo abaixo é uma regra simples e inofensiva, em formato ilustrativo, que procura muitas falhas de login em sequência (um indício de tentativa de adivinhar senhas, assunto da lição 19). Os campos foram simplificados e a regra não foi executada aqui.',
            'title: Muitas falhas de login em sequencia\nstatus: exemplo\nlogsource:\n  category: authentication\ndetection:\n  selection:\n    resultado: falha\n  condition: selection | count() by origem > 20\n  timeframe: 5m\nfalsepositives:\n  - Usuario que esqueceu a senha\n  - Sistema com credencial antiga configurada\nlevel: medium'
          ),
          sl(
            'YARA: regras para arquivos e memória',
            'YARA é uma linguagem para identificar e classificar ARQUIVOS (ou conteúdo de memória) por padrões: textos, sequências de bytes e condições. É muito usada por analistas de malware e por EDRs para reconhecer famílias conhecidas. Uma regra tem nome, metadados, strings (os padrões procurados) e uma condição (quando a regra "casa"). O exemplo abaixo procura em arquivos de TREINO uma marca de texto inofensiva que você mesmo coloca em um arquivo de laboratório; não tem relação com nenhum código real e não foi executado aqui.',
            'rule marca_de_laboratorio\n{\n  meta:\n    descricao = "Arquivo de treino com marca de texto inofensiva"\n  strings:\n    $a = "ARQUIVO-DE-TREINO-LAB"\n  condition:\n    $a\n}'
          ),
          sl(
            'Sigma x YARA: quando usar cada uma',
            'Sigma olha para EVENTOS (logs de login, de criação de processos, de rede): detecta comportamento. YARA olha para OBJETOS (arquivos, memória): detecta conteúdo. Uma intrusão costuma pedir os dois: a regra de logs percebe o comportamento estranho, e a de arquivo confirma que o programa suspeito pertence a uma família conhecida. Há ainda regras de rede (para IDS), usadas na camada de tráfego. Escolha o tipo pela fonte de dados que você tem e pela pergunta que quer responder.'
          ),
          sl(
            'Falsos positivos e falsos negativos',
            'FALSO POSITIVO: a regra dispara em uma atividade legítima (um administrador usando uma ferramenta de gestão). FALSO NEGATIVO: o ataque acontece e a regra não dispara. Os dois são inevitáveis. Regras muito amplas geram ruído e fadiga; regras muito estreitas deixam passar variações. Regra baseada em UM indicador frágil (um nome de arquivo ou um endereço) é fácil de contornar; regra baseada em comportamento é mais durável. Documente os falsos positivos conhecidos dentro da própria regra para ajudar quem a mantém.'
          ),
          sl(
            'Ciclo de ajuste',
            'Regras são vivas. Ciclo: 1) Definir o objetivo (qual técnica), 2) Escrever a regra, 3) TESTAR em laboratório, com dados controlados e autorizados, 4) Implantar primeiro em modo de observação (só registra, sem alertar), 5) Medir quantos alertas e quantos falsos positivos, 6) Ajustar (limites, exceções documentadas, refinamento), 7) Promover para produção e 8) Revisar periodicamente, pois o ambiente e as ameaças mudam. Regras de fontes públicas são ponto de partida: adapte e teste, não copie e cole em produção.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que caracteriza uma boa regra de detecção?', 'c', [
          'Ser a mais curta possível, para ocupar pouco espaço no SIEM',
          'Disparar quando houver qualquer evento de login, para garantir cobertura total',
          'Ter objetivo claro, ser testada e documentar severidade e falsos positivos',
          'Ser copiada de uma fonte pública e ativada sem alterações em produção'
        ], 'Regra boa tem propósito, teste e documentação. Regras amplas geram ruído e cópia sem teste é suposição.'),
        mcq('q2', 'Qual é a principal diferença entre Sigma e YARA?', 'a', [
          'Sigma detecta comportamento em logs; YARA, arquivos e memória por padrões',
          'Sigma analisa arquivos e YARA analisa logs de login',
          'Ambas servem para bloquear sites maliciosos',
          'Sigma só funciona em um único SIEM, enquanto YARA só funciona em antivírus'
        ], 'Sigma é independente de produto e opera sobre logs; YARA trabalha com conteúdo de arquivos e memória.'),
        mcq('q3', 'A regra de exemplo conta falhas de login por origem em 5 minutos e alerta acima de 20. Qual falso positivo é plausível?', 'b', [
          'Um atacante usando uma única tentativa por hora, o que passaria despercebido',
          'Um sistema com credencial antiga que tenta autenticar repetidamente',
          'Um arquivo de treino que contém uma marca de texto inofensiva',
          'Um certificado de TLS expirado em um servidor web'
        ], 'Um serviço com credencial desatualizada repete tentativas e dispara a regra sem ser ataque. A tentativa lenta seria um falso negativo, não positivo.'),
        fill('q4', 'Complete: quando uma regra dispara em uma atividade legítima, dizemos que houve um falso ___.', 'falso ___ (alerta sem ameaça real)', ['positivo'], 'Falso positivo é o alerta em atividade legítima; o contrário, não alertar em um ataque real, é falso negativo.'),
        mcq('q5', 'Por que implantar uma regra nova primeiro em modo de observação?', 'd', [
          'Porque regras em modo de observação ficam mais seguras contra ataques ao SIEM',
          'Porque assim ela dispensa o teste em laboratório',
          'Porque a regra só funciona depois de uma semana de espera obrigatória',
          'Medir alertas e falsos positivos antes de gerar trabalho para o SOC'
        ], 'O modo de observação permite medir e ajustar sem inundar a equipe de alertas.'),
        mcq('q6', 'Uma regra procura apenas o nome de um arquivo específico usado em um ataque antigo. Qual é a fragilidade?', 'c', [
          'Nenhuma, pois nomes de arquivo são impossíveis de mudar',
          'Ela detecta comportamento demais e gera muitos falsos positivos',
          'O atacante renomeia o arquivo; regras de comportamento duram mais',
          'Ela funciona com YARA e não funciona com Sigma'
        ], 'Indicadores frágeis, como nomes de arquivo, são fáceis de contornar. Regras baseadas em comportamento são mais duráveis.'),
        mcq('q7', 'Você encontrou uma regra Sigma pública bem avaliada. Qual a melhor prática?', 'b', [
          'Ativá-la diretamente em produção, pois a comunidade já testou no seu ambiente',
          'Usá-la como ponto de partida, adaptar aos seus campos e testar em observação',
          'Descartá-la, pois regras públicas não servem para ambientes privados',
          'Apagar os campos de falsos positivos para deixá-la mais limpa'
        ], 'Cada ambiente tem diferenças de fontes e de comportamento legítimo; a regra pública precisa de adaptação e teste.'),
        fill('q8', 'Complete: o formato aberto de regras de detecção para logs, escrito em YAML e traduzido para cada SIEM, chama-se ___.', 'formato de regras para logs: ___', ['sigma'], 'Sigma é o formato aberto para regras de logs, independente do produto de SIEM.')
      ]
    }
,
    {
      id: 'csi-16-edr-xdr-telemetria',
      title: 'EDR, XDR e telemetria de endpoint',
      goal: 'Entender o que o EDR observa, como ler uma árvore de processos e como responder isolando um host.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Endpoint e telemetria',
            'ENDPOINT é qualquer dispositivo final: notebook, desktop, servidor, celular. É onde o usuário clica, onde o malware executa e onde as credenciais vivem, por isso é o campo de batalha principal. TELEMETRIA é o conjunto de dados que o endpoint envia sobre o que acontece nele: processos iniciados, arquivos criados, conexões de rede, alterações de configuração, logins. Sem telemetria, você só descobre o ataque pelo estrago; com ela, vê o comportamento enquanto acontece e depois, na investigação.'
          ),
          sl(
            'Antivírus x EDR',
            'O antivírus tradicional compara arquivos com assinaturas de ameaças conhecidas e bloqueia o que reconhece. É útil, mas falha diante de ameaças novas ou que usam ferramentas legítimas. O EDR (Endpoint Detection and Response) vai além: grava continuamente o COMPORTAMENTO do endpoint, detecta atividades suspeitas mesmo sem assinatura, permite investigar o que aconteceu (linha do tempo) e RESPONDER remotamente (isolar a máquina, encerrar processos, coletar arquivos). Hoje muitos produtos combinam os dois. O EDR não é infalível, e precisa de pessoas que triem seus alertas.'
          ),
          sl(
            'Árvore de processos',
            'Todo processo (programa em execução) nasce de outro, o processo PAI. A ÁRVORE DE PROCESSOS mostra essa relação e é uma das melhores pistas de investigação. Cadeias normais são previsíveis; cadeias estranhas chamam atenção. Exemplo conceitual: um documento de texto (processo pai) iniciando um interpretador de comandos que em seguida acessa a internet é suspeito, porque editores de texto raramente fazem isso. Pergunte sempre: este pai costuma gerar este filho? Com qual usuário? Em que horário?',
            'Normal:      explorador de arquivos -> editor de texto\nSuspeito:    editor de texto -> interpretador de comandos -> conexão externa\nPergunta-guia: este pai costuma gerar este filho?'
          ),
          sl(
            'Respondendo: isolar o host',
            'ISOLAR O HOST significa cortar a rede do dispositivo (exceto a comunicação com a console do EDR) para conter a ameaça sem desligá-lo, pois desligar apaga evidências que estão na memória. Faça isolamento quando houver sinais confiáveis de comprometimento: um alerta de alta confiança, um processo malicioso confirmado, indícios de movimentação lateral. Outras respostas: encerrar o processo, colocar o arquivo em quarentena, revogar credenciais, coletar artefatos. Cuidado com o custo: isolar um servidor de produção para por engano interrompe o negócio; por isso existem critérios, aprovações e, para sistemas críticos, um responsável a ser avisado.'
          ),
          sl(
            'XDR: além do endpoint',
            'XDR (Extended Detection and Response) amplia a ideia: combina telemetria de várias fontes (endpoints, e-mail, rede, identidade, nuvem) em uma plataforma que correlaciona e responde. Um ataque que começa por um e-mail (fonte e-mail), rouba uma senha (identidade) e executa algo em um notebook (endpoint) fica visível como UM incidente, em vez de três alertas soltos. O valor depende de integrações boas e de dados de qualidade; o rótulo é usado de formas diferentes por fornecedores, então avalie o que ele realmente cobre. Lembre de MDR: serviço terceirizado que monitora e responde em seu nome.'
          ),
          sl(
            'Privacidade e limites',
            'Um agente de EDR enxerga muita coisa no dispositivo: arquivos, programas, endereços acessados e, dependendo da configuração, dados pessoais do funcionário. Em visão geral, a LGPD pede finalidade clara, coleta proporcional e transparência; informe na política de uso quais dados são coletados e para quê, restrinja o acesso aos consoles e limite o uso a finalidades de segurança. Mantenha o EDR atualizado e protegido contra desligamento por usuários sem privilégio. E lembre-se: um EDR não substitui backup, hardening nem menor privilégio.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a principal diferença do EDR em relação ao antivírus tradicional por assinatura?', 'd', [
          'O EDR só funciona em servidores, enquanto o antivírus funciona em notebooks',
          'O EDR é gratuito, enquanto o antivírus tradicional exige licença paga',
          'O EDR analisa só arquivos baixados da internet, e o antivírus analisa o disco inteiro',
          'O EDR registra comportamento, detecta sem assinatura e permite responder remotamente'
        ], 'O EDR vai além das assinaturas, com telemetria contínua, investigação e resposta. As outras opções descrevem diferenças inexistentes.'),
        mcq('q2', 'Em uma árvore de processos, um editor de texto inicia um interpretador de comandos que acessa a internet. Por que isso merece atenção?', 'a', [
          'Editores de texto normalmente não geram esse processo filho, o que foge do padrão',
          'Porque interpretadores de comandos são proibidos em computadores corporativos',
          'Porque a internet é proibida para qualquer processo iniciado por um usuário comum',
          'Porque a árvore de processos lista só arquivos infectados e este processo está infectado'
        ], 'A relação pai-filho incomum é um forte indício de comportamento suspeito. O interpretador de comandos em si tem usos legítimos, então o contexto importa.'),
        mcq('q3', 'Por que isolar o host é preferível, em geral, a desligá-lo imediatamente?', 'c', [
          'Porque desligar o computador propaga a ameaça para os outros dispositivos da rede',
          'Porque o isolamento elimina automaticamente o malware do disco',
          'Conter a rede preserva evidências da memória e mantém o acesso pela console',
          'Porque computadores desligados não podem ser analisados por nenhuma ferramenta'
        ], 'O isolamento contém a ameaça sem perder evidências voláteis. Ele não remove o malware, apenas impede que se espalhe ou comunique.'),
        fill('q4', 'Complete: o conjunto de dados que o endpoint envia sobre processos, arquivos e conexões chama-se ___.', 'dados de comportamento enviados pelo endpoint = ___', ['telemetria'], 'Telemetria é a base da detecção e da investigação em endpoints.'),
        mcq('q5', 'Qual cenário mostra o valor do XDR?', 'b', [
          'Um alerta isolado de um único notebook, sem relação com e-mail ou identidade',
          'Um incidente que começa em e-mail e chega ao endpoint, visto como um só',
          'Um servidor desligado para manutenção programada, que não gera dado algum',
          'Uma impressora em rede que imprime uma página de teste'
        ], 'O XDR correlaciona fontes diferentes em uma só história. Alertas soltos e dispositivos sem telemetria não mostram esse valor.'),
        mcq('q6', 'Qual cuidado de privacidade se aplica a agentes de EDR?', 'a', [
          'Informar o que é coletado e para quê, e restringir o acesso à console',
          'Esconder dos funcionários que o agente existe, para que ele não seja desligado',
          'Usar os dados coletados para avaliar a produtividade individual dos funcionários',
          'Armazenar tudo por tempo indeterminado, pois dados antigos podem ser úteis um dia'
        ], 'Finalidade, proporcionalidade, transparência e segurança são os princípios. Vigilância velada e uso fora da finalidade de segurança não se justificam.'),
        mcq('q7', 'O EDR detecta um comportamento suspeito em um servidor de produção crítico. Qual é a conduta mais apropriada?', 'd', [
          'Isolar imediatamente sem avisar ninguém, para ganhar tempo',
          'Ignorar o alerta, pois servidores de produção raramente são alvo',
          'Reiniciar o servidor várias vezes até o alerta sumir',
          'Avaliar a confiança do alerta e acionar o dono do sistema'
        ], 'Isolar um sistema crítico tem custo de negócio; o critério e o responsável devem estar definidos. Reiniciar apaga evidências e ignorar é arriscado.'),
        fill('q8', 'Complete: o programa em execução que inicia outro programa é chamado de processo ___.', 'processo ___ (que inicia o filho)', ['pai'], 'O processo pai inicia o filho; a relação pai-filho forma a árvore de processos.')
      ]
    },
    {
      id: 'csi-17-analise-de-malware-estatica',
      title: 'Análise estática de malware (segura)',
      goal: 'Conhecer como analistas examinam amostras sem executá-las, com hashes, strings, metadados e sandbox, seguindo as regras de segurança do laboratório.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Para que analisar uma amostra',
            'Quando surge um arquivo suspeito, a equipe precisa responder: o que ele faz? Quem mais pode ter sido afetado? Como detectar e se defender? A ANÁLISE DE MALWARE responde a essas perguntas. Há dois grandes tipos. ESTÁTICA: examinar a amostra SEM executá-la. DINÂMICA: executá-la em ambiente controlado e observar o comportamento. Esta lição cobre a estática, que é a mais segura e o ponto de partida; não há nenhum código de malware aqui e o objetivo é defender, nunca criar. O nível avançado aprofunda a análise.'
          ),
          sl(
            'Regras de segurança do analista',
            'Malware é perigoso; o laboratório precisa ser ISOLADO. Regras essenciais: use uma máquina virtual dedicada, sem pastas compartilhadas com o computador real e com rede desligada ou em uma rede isolada; tire um snapshot (retrato) antes e volte a ele depois; nunca analise em seu computador pessoal ou corporativo; nunca execute a amostra por curiosidade; guarde a amostra em arquivo compactado com senha e extensão alterada, para que ninguém a abra sem querer; não envie amostras de clientes a serviços públicos sem autorização, pois podem conter dados pessoais ou confidenciais (LGPD). Em caso de dúvida, não execute.',
            'Checklist do laboratório:\n[ ] máquina virtual dedicada com snapshot\n[ ] sem pasta compartilhada com o host\n[ ] rede desligada ou isolada\n[ ] amostra compactada com senha, sem extensão executável\n[ ] nunca executar na máquina de trabalho'
          ),
          sl(
            'Hashes: a impressão digital da amostra',
            'Primeiro calcule o HASH do arquivo (SHA-256, por exemplo). Ele funciona como identificador: o mesmo arquivo tem sempre o mesmo hash, e qualquer mudança de um byte muda o hash por completo. Com o hash você consulta bases de inteligência de ameaças (alguém já viu isso?), compartilha o indicador com a equipe e registra a amostra. Limite importante: se o atacante recompilar o programa, o hash muda, por isso hash identifica uma amostra exata, não a família inteira. Calcular o hash de um arquivo NÃO o executa e é seguro.',
            '# Em laboratório isolado, apenas lendo o arquivo (não executa nada):\nsha256sum amostra.bin\n# 64 caracteres hexadecimais = identificador da amostra'
          ),
          sl(
            'Strings, metadados e tipo de arquivo',
            'STRINGS são sequências de texto legíveis dentro do arquivo: endereços de sites, nomes de arquivos, mensagens, comandos. Podem revelar para onde o programa se conecta ou o que pretende fazer; mas atacantes às vezes ofuscam (escondem) o texto, então a ausência de strings também é um sinal. METADADOS do arquivo (data de compilação, nomes de bibliotecas que importa, versão, assinatura digital, tipo real do arquivo) dão contexto: um suposto documento que na verdade é um programa executável, ou um programa que importa funções para acessar a rede e mexer em arquivos, merece atenção. Confirme o tipo real do arquivo pelo conteúdo, não pela extensão.'
          ),
          sl(
            'Sandbox e relatórios',
            'Uma SANDBOX é um ambiente isolado e instrumentado em que a amostra é executada automaticamente, enquanto o sistema registra tudo: processos criados, arquivos alterados, conexões feitas. O resultado é um relatório com os INDICADORES DE COMPROMETIMENTO (IOCs), como domínios, endereços IP, hashes e chaves de registro. Serviços públicos de sandbox e de análise de arquivos existem, mas lembre: tudo que você envia pode se tornar PÚBLICO; nunca envie arquivos que contenham dados de clientes ou da empresa. Prefira sandbox interna ou a de um fornecedor com contrato adequado. Malware pode detectar sandbox e se comportar de forma diferente: o resultado é indício, não verdade absoluta.'
          ),
          sl(
            'Do achado à defesa',
            'O fim da análise é produzir proteção: IOCs para bloquear nos firewalls, no DNS e no EDR, regras de detecção (Sigma, YARA) para achar variações, uma lista de máquinas afetadas e recomendações (patch, mudança de configuração, treinamento). Documente tudo com horário, passos e evidências, e compartilhe os indicadores com a comunidade ou o CSIRT quando fizer sentido e for autorizado. Tenha também uma noção do limite legal e ético: possuir amostras para fins de defesa é prática comum de profissionais, mas distribuir malware ou usá-lo contra terceiros é crime e está fora de qualquer curso defensivo.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a diferença entre análise estática e dinâmica de malware?', 'a', [
          'A estática não executa a amostra; a dinâmica a executa em ambiente controlado',
          'A estática executa a amostra na máquina do analista; a dinâmica só lê o arquivo',
          'A estática serve para sites e a dinâmica para aplicativos de celular',
          'Não há diferença: são nomes diferentes para o mesmo processo'
        ], 'A estática não executa a amostra, o que a torna mais segura. A dinâmica observa o comportamento em execução, sempre em ambiente isolado.'),
        mcq('q2', 'Qual prática é incorreta em um laboratório de análise?', 'c', [
          'Tirar um snapshot da máquina virtual antes da análise',
          'Manter a amostra em um arquivo compactado com senha e sem extensão executável',
          'Abrir a amostra no computador de trabalho "só para ver rápido", com rede conectada',
          'Desligar a rede da máquina virtual ou usar uma rede isolada'
        ], 'Nunca se abre uma amostra na máquina de trabalho; o laboratório deve ser isolado. As outras práticas são recomendadas.'),
        mcq('q3', 'Para que serve calcular o hash SHA-256 de uma amostra?', 'b', [
          'Para executar a amostra de forma segura dentro do próprio algoritmo de hash',
          'Identificar a amostra, consultar bases e compartilhar como indicador',
          'Para descobrir o nome do autor do malware e o país onde ele mora',
          'Para remover o código malicioso do arquivo mantendo o restante intacto'
        ], 'O hash é um identificador e um indicador de comprometimento; não executa, não revela autoria e não limpa o arquivo.'),
        fill('q4', 'Complete: o ambiente isolado e instrumentado que executa uma amostra e registra o que ela faz chama-se ___.', 'ambiente de execução isolado e instrumentado = ___', ['sandbox'], 'A sandbox executa a amostra com segurança e gera relatório de comportamento e IOCs.'),
        mcq('q5', 'Um arquivo recebido tem a extensão .pdf, mas a análise do conteúdo mostra que é um programa executável. O que isso indica?', 'd', [
          'Que o arquivo é um PDF normal, só com tamanho maior que o usual',
          'Que o hash do arquivo está corrompido e deve ser recalculado',
          'Que a extensão é a única informação confiável sobre o tipo do arquivo',
          'A extensão engana o usuário; o tipo real se verifica pelo conteúdo'
        ], 'Extensão pode ser falsificada; confirme o tipo pelo conteúdo. Isso é um indício forte de arquivo malicioso disfarçado.'),
        mcq('q6', 'Um colega quer enviar a um serviço público de análise um arquivo suspeito que contém uma planilha de clientes. Qual é o risco?', 'a', [
          'Arquivos enviados podem virar públicos, expondo dados pessoais e violando a LGPD',
          'O serviço público apaga automaticamente qualquer arquivo recebido, sem análise',
          'Risco baixo, pois serviços públicos mantêm os arquivos privados por padrão',
          'O único risco é o serviço demorar mais para responder'
        ], 'Muitos serviços públicos compartilham amostras e resultados. Nunca envie dados de clientes ou confidenciais sem autorização.'),
        mcq('q7', 'Qual é o produto final de uma boa análise de malware, do ponto de vista da defesa?', 'c', [
          'Uma cópia funcional do malware para testar a rede de outras empresas',
          'O relatório com o nome do programa, sem indicadores',
          'IOCs e regras de detecção para bloquear a ameaça, mais recomendações',
          'A remoção do hash da base de inteligência para evitar identificações futuras'
        ], 'O objetivo é gerar proteção: indicadores, detecções e recomendações. Distribuir ou testar malware em terceiros é crime.'),
        fill('q8', 'Complete: um dado como um domínio, um endereço IP ou um hash que sinaliza uma possível infecção chama-se indicador de ___ (IOC).', 'indicador de ___ (IOC)', ['comprometimento', 'comprometimentos'], 'IOC significa indicador de comprometimento (Indicator of Compromise).')
      ]
    },
    {
      id: 'csi-18-analise-de-phishing-e-autenticacao-de-email',
      title: 'Análise de phishing e autenticação de e-mail',
      goal: 'Ler cabeçalhos de e-mail, entender SPF, DKIM e DMARC e conduzir a investigação de um phishing reportado.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Do aviso do usuário à investigação',
            'No nível iniciante você aprendeu a reconhecer phishing. Agora o papel é do analista: o usuário reporta uma mensagem suspeita e a equipe precisa descobrir se é golpe, quem recebeu, quem clicou e como conter. A análise usa os CABEÇALHOS do e-mail, a verificação de autenticação, o exame de links e anexos (sem abrir em máquina de trabalho) e a extração de indicadores. Tudo é feito com cuidado para não expor o analista nem os dados dos usuários.'
          ),
          sl(
            'Cabeçalhos de e-mail',
            'Todo e-mail carrega cabeçalhos técnicos que o cliente de e-mail esconde por padrão (opção "ver original" ou "mostrar cabeçalhos"). Campos úteis: From (remetente exibido, FÁCIL de falsificar), Reply-To (para onde vai a resposta, às vezes diferente do From), Return-Path (endereço de retorno técnico), Message-ID e a cadeia de Received (cada servidor pelo qual passou; leia de baixo para cima, do primeiro ao último). Desconfie de: nome exibido de uma pessoa conhecida com endereço de outro domínio, Reply-To diferente, domínio parecido com o verdadeiro e linha Received com origem inesperada. Os campos acima do seu servidor de entrada são os mais confiáveis, pois foram escritos por servidores sob seu controle.',
            'From: "Diretoria" <diretoria@empresa-exemplo.example>\nReply-To: <contato@dominio-diferente.example>\nReturn-Path: <bounce@servidor-desconhecido.example>\nAuthentication-Results: spf=fail; dkim=none; dmarc=fail\n(todos os endereços acima são fictícios)'
          ),
          sl(
            'SPF, DKIM e DMARC',
            'São três mecanismos que ajudam a verificar se o e-mail veio de quem diz. SPF: o dono do domínio publica no DNS a lista de servidores AUTORIZADOS a enviar e-mails em seu nome; o receptor confere se o servidor que entregou está na lista. DKIM: o servidor de envio ASSINA digitalmente a mensagem com uma chave privada, e o receptor valida a assinatura com a chave pública publicada no DNS; prova que o conteúdo não foi alterado e que o domínio assinante o autorizou. DMARC: o dono do domínio define a POLÍTICA quando SPF/DKIM falham e não se alinham com o domínio do From (nada, quarentena ou rejeição) e recebe relatórios. Limite: autenticação prova a origem do domínio, não a honestidade da mensagem; um golpista pode ter SPF, DKIM e DMARC corretos em um domínio parecido que ele mesmo registrou.'
          ),
          sl(
            'Passo a passo da investigação',
            '1) Preserve o original (e-mail completo com cabeçalhos) e registre quem reportou. 2) Leia cabeçalhos e o resultado de SPF, DKIM e DMARC. 3) Examine links SEM clicar: veja o endereço real, não o texto exibido, e verifique o domínio. 4) Analise anexos apenas em laboratório isolado, com hash e sandbox (lição anterior). 5) Extraia IOCs: domínios, endereços, remetentes, hashes. 6) Pesquise nos logs quem mais recebeu e quem clicou. 7) Contenha: apague as mensagens das caixas, bloqueie remetente e domínios, redefina senhas de quem digitou credenciais. 8) Comunique, oriente os usuários e ajuste as proteções.'
          ),
          sl(
            'IOCs e resposta',
            'Os indicadores de um phishing incluem o domínio do remetente, o endereço do servidor de envio, o assunto padrão, os domínios das páginas falsas e o hash dos anexos. Ao ter esses IOCs, bloqueie-os no gateway de e-mail, no DNS e no proxy, e busque retroativamente nos logs por acessos a eles. Se houver usuário que digitou a senha: redefina, revogue sessões, verifique regras de encaminhamento criadas na caixa de e-mail (um truque comum para manter acesso) e ative MFA. Reconheça quem reportou: reforça a cultura de reportar e não puna quem clicou, para que as próximas pessoas continuem avisando.'
          ),
          sl(
            'Cuidados com privacidade',
            'E-mails reportados contêm dados pessoais de remetentes, destinatários e do conteúdo. Limite o acesso ao material, não o encaminhe a serviços externos sem necessidade e sem remover dados pessoais, e mantenha-o apenas pelo tempo útil. Ao pesquisar quem mais recebeu a mensagem, use apenas dados de gateway e de logs necessários para a resposta. Não leia o conteúdo de e-mails pessoais dos funcionários além do estritamente necessário para a investigação. Esta é uma visão geral, e não substitui orientação do jurídico ou do encarregado de dados da organização.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que o SPF verifica?', 'b', [
          'Se o conteúdo da mensagem foi alterado depois de enviado, por meio de uma assinatura digital',
          'Se o servidor que entregou a mensagem está na lista de servidores autorizados pelo dono do domínio',
          'Se o texto da mensagem contém palavras associadas a golpes',
          'Se o anexo da mensagem está livre de malware'
        ], 'O SPF confere o servidor de envio contra a lista publicada no DNS. A assinatura do conteúdo é do DKIM, e o SPF não analisa texto ou anexos.'),
        mcq('q2', 'Qual é a função do DMARC?', 'd', [
          'Cifrar o conteúdo da mensagem entre remetente e destinatário',
          'Substituir o SPF e o DKIM, que deixam de ser necessários',
          'Remover automaticamente anexos suspeitos antes da entrega',
          'Definir o destino de mensagens que falham na autenticação e gerar relatórios'
        ], 'O DMARC usa SPF e DKIM, exige alinhamento com o domínio do From e define o que o receptor deve fazer, com relatórios ao dono do domínio.'),
        mcq('q3', 'Um e-mail passa em SPF, DKIM e DMARC, mas o domínio é "empresa-exemp1o.example" (com o número 1 no lugar de "l"). O que isso mostra?', 'a', [
          'Autenticação prova a origem do domínio, não a honestidade da mensagem',
          'Que a mensagem é legítima, pois passou nos testes de autenticação',
          'Que o domínio foi invadido pelo atacante, por isso a autenticação passou',
          'Que os testes de autenticação estão quebrados e devem ser desativados'
        ], 'SPF, DKIM e DMARC validam a relação com o domínio do remetente, mas não garantem que o domínio seja o verdadeiro nem que a mensagem seja honesta.'),
        fill('q4', 'Complete: o mecanismo em que o servidor de envio assina digitalmente a mensagem, validada com chave pública publicada no DNS, é o ___.', 'assinatura da mensagem validada pelo DNS = ___', ['dkim'], 'O DKIM assina a mensagem e permite verificar integridade e autorização do domínio.'),
        mcq('q5', 'Ao ler a cadeia de campos Received, qual orientação está correta?', 'c', [
          'Ler de cima para baixo, pois a primeira linha é o servidor de origem do golpista',
          'Ignorar esses campos, porque eles não têm nenhuma utilidade para a investigação',
          'Ler de baixo para cima, confiando mais nos campos dos seus próprios servidores',
          'Confiar igualmente nos campos, pois o remetente não consegue alterá-los'
        ], 'Cada servidor adiciona seu Received no topo; por isso a leitura cronológica é de baixo para cima. Os campos de servidores sob seu controle são mais confiáveis que os anteriores.'),
        mcq('q6', 'Qual é a primeira atitude correta com um link suspeito de um e-mail reportado?', 'b', [
          'Clicar nele no computador de trabalho para ver para onde leva',
          'Ver o endereço real do link sem clicar e analisar o domínio',
          'Encaminhar o e-mail aos colegas para que cada um avalie se é golpe',
          'Responder ao remetente perguntando se a mensagem é verdadeira'
        ], 'Nunca se clica no link na máquina de trabalho; o endereço real é analisado com segurança. Encaminhar espalha o risco e responder confirma que o e-mail é lido.'),
        mcq('q7', 'Um usuário digitou a senha em uma página falsa. Qual conjunto de ações é o mais completo?', 'd', [
          'Orientá-lo a não clicar em links no futuro',
          'Bloquear o domínio do link e considerar o caso encerrado',
          'Trocar o nome de usuário, mantendo a senha atual',
          'Redefinir a senha, revogar sessões, checar regras de e-mail, MFA e bloquear IOCs'
        ], 'A resposta cobre a credencial exposta, o acesso mantido e a prevenção. Só bloquear o domínio ou orientar não resolve a conta já comprometida.'),
        fill('q8', 'Complete: o endereço de um domínio ou o hash de um anexo que identifica o ataque são chamados de ___ (indicadores de comprometimento).', 'sigla de indicadores de comprometimento: ___', ['ioc', 'iocs'], 'IOC é a sigla de Indicator of Compromise, usada para bloquear e buscar a ameaça.')
      ]
    },
    {
      id: 'csi-47-seguranca-de-email-corporativo-gateway',
      title: 'Segurança de e-mail corporativo e gateway',
      goal: 'Descrever as camadas de proteção do e-mail corporativo, entender BEC e regras maliciosas de encaminhamento e planejar treinamentos de phishing éticos e transparentes.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que o e-mail precisa de camadas',
            'O e-mail continua sendo uma das principais portas de entrada de ataques porque chega diretamente às pessoas. Na lição de análise de phishing você viu SPF, DKIM e DMARC, que ajudam a provar de onde a mensagem vem. Aqui o foco é o que a organização coloca no caminho do e-mail. Nenhum controle sozinho basta, então se combinam camadas: filtro de entrada, análise de anexos e links, proteção de contas, regras de detecção, e pessoas treinadas. Cada camada pega o que escapou da anterior. Erro comum: confiar apenas no filtro e deixar de treinar as pessoas, ou o contrário.'
          ),
          sl(
            'Gateway de e-mail seguro',
            'GATEWAY DE E-MAIL SEGURO é um serviço (ou equipamento) colocado entre a internet e as caixas postais: todo e-mail que chega passa por ele antes de ser entregue. Ele faz FILTRAGEM DE SPAM (descarta mensagens em massa indesejadas), detecção de MALWARE conhecido, verificação de SPF, DKIM e DMARC, análise de reputação do remetente e bloqueio de anexos de tipos perigosos. Mensagens duvidosas, mas não certamente maliciosas, vão para a QUARENTENA: uma área à parte onde o usuário ou a equipe de segurança revisa antes de liberar. Ajustar a sensibilidade é um equilíbrio: filtro muito frouxo deixa passar ataques; muito rígido bloqueia mensagens legítimas (falso positivo).'
          ),
          sl(
            'Sandbox de anexos e reescrita de URL',
            'Anexos novos ou desconhecidos podem esconder código malicioso que nenhuma assinatura conhece ainda. A SANDBOX de anexos abre o arquivo em um ambiente isolado e descartável, observa o que ele faz (cria processos? contata servidores?) e só então decide entregar ou bloquear. Isso causa atraso de poucos minutos, aceito em troca de segurança. A REESCRITA DE URL troca os links do e-mail por um endereço intermediário do gateway: ao clicar, o serviço verifica o destino NO MOMENTO DO CLIQUE e bloqueia se estiver perigoso. Isso ajuda quando o site só vira malicioso depois da entrega da mensagem. Limite: nenhuma das duas é perfeita, por isso o usuário ainda deve desconfiar e reportar.'
          ),
          sl(
            'BEC e fraude do CEO',
            'BEC (Business Email Compromise, comprometimento de e-mail empresarial) é a fraude em que alguém se passa por uma pessoa de confiança, como o CEO, um diretor ou um fornecedor, para convencer um funcionário a fazer uma transferência, mudar dados bancários ou enviar informações sensíveis. Muitas vezes NÃO há anexo nem link malicioso, o que escapa dos filtros técnicos: o golpe é social. Sinais: urgência e sigilo ("não comente com ninguém"), pedido fora do fluxo normal, endereço de resposta diferente, mudança de conta bancária de um fornecedor. A defesa é de PROCESSO: confirmar pedidos financeiros por um segundo canal já conhecido (ligar para um número do cadastro, não o do e-mail), exigir dupla aprovação em pagamentos e alertar sobre mensagens externas parecidas com internas.'
          ),
          sl(
            'Regras de encaminhamento maliciosas e contas executivas',
            'Quando uma conta de e-mail é comprometida, o invasor às vezes cria uma REGRA DE ENCAMINHAMENTO que copia, em silêncio, mensagens para um endereço externo, ou regras que escondem avisos de segurança. A regra continua funcionando mesmo depois da troca de senha. Por isso a defesa inclui: auditar regras de caixa postal e alertar sobre regras novas de encaminhamento externo, restringir ou desativar encaminhamento automático para fora da organização e revisar registros de acesso. CONTAS EXECUTIVAS e financeiras são alvos de maior valor e merecem proteção extra: MFA resistente a phishing, monitoramento reforçado, limites para delegação de acesso e treinamento específico.'
          ),
          sl(
            'Treinamento e simulações éticas de phishing',
            'SIMULAÇÃO DE PHISHING é um exercício em que a própria organização envia mensagens falsas controladas para treinar as pessoas e medir a conscientização. Para ser ÉTICA e adequada à LGPD: 1) tenha objetivo educativo, não punitivo; 2) seja TRANSPARENTE sobre a existência do programa de simulações (política interna e comunicação geral, sem avisar a data exata); 3) não use iscas que explorem medo ou necessidade real, como falsa demissão, prêmios financeiros ou doença; 4) colete o mínimo de dados, trate resultados com confidencialidade e evite expor indivíduos publicamente; 5) ofereça aprendizado imediato a quem clicar e incentive o botão de reportar. A métrica mais valiosa costuma ser a taxa de REPORTE, não apenas a de cliques. Isto não substitui orientação jurídica.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é o papel de um gateway de e-mail seguro?', 'c', [
          'Criptografar as senhas dos funcionários usadas no e-mail',
          'Substituir o treinamento dos funcionários, pois ele detecta os golpes que chegam por e-mail, de qualquer tipo',
          'Ficar entre a internet e as caixas postais, filtrando spam, malware e remetentes suspeitos antes da entrega',
          'Apagar automaticamente todas as mensagens vindas de fora da organização'
        ], 'O gateway filtra o e-mail de entrada antes da entrega. Ele não cuida de senhas, não substitui o treinamento e não apaga tudo o que vem de fora.'),
        mcq('q2', 'Para que serve a sandbox de anexos no contexto de e-mail?', 'a', [
          'Abrir o anexo em ambiente isolado e observar seu comportamento antes de decidir pela entrega',
          'Aumentar a velocidade de entrega das mensagens para as caixas postais',
          'Guardar uma cópia dos anexos por vários anos, para auditoria',
          'Converter os anexos em imagens para que ninguém possa editá-los'
        ], 'A sandbox detona o arquivo em um ambiente descartável para ver o que ele faz. Ela não acelera a entrega (pode atrasar), não é um arquivo de auditoria nem um conversor.'),
        mcq('q3', 'Qual é a vantagem da reescrita de URL feita pelo gateway?', 'b', [
          'Torna os links mais curtos e fáceis de digitar',
          'Permite verificar o destino do link no momento do clique, mesmo que o site só tenha ficado perigoso depois da entrega',
          'Impede que o usuário veja o domínio de destino de qualquer link',
          'Impede que o usuário veja o domínio real do site, mesmo que passe o mouse sobre o link'
        ], 'A checagem no momento do clique cobre sites que mudaram depois da entrega. A reescrita não encurta por esse motivo, não esconde domínios e não oferece garantia absoluta.'),
        fill('q4', 'Complete: a área onde ficam retidas as mensagens duvidosas, para revisão antes de serem liberadas, chama-se ___.', 'área de retenção de mensagens suspeitas: ___', ['quarentena'], 'Na quarentena, mensagens suspeitas aguardam revisão da pessoa ou da equipe de segurança antes de serem liberadas ou descartadas.'),
        mcq('q5', 'Uma funcionária do financeiro recebe um e-mail aparentemente do diretor, pedindo uma transferência urgente e sigilosa para uma conta nova. Não há anexo nem link. Qual é a melhor conduta?', 'd', [
          'Fazer a transferência rapidamente, pois o diretor pediu urgência',
          'Responder ao próprio e-mail pedindo que o diretor confirme o pedido, usando o endereço de resposta recebido',
          'Encaminhar o e-mail ao grupo inteiro da empresa para ver se alguém já recebeu algo parecido',
          'Confirmar o pedido por outro canal já conhecido, como ligar para o número cadastrado, e acionar a segurança'
        ], 'Em BEC, a confirmação precisa sair do canal do pedido, por isso se usa um segundo canal confiável. Obedecer, responder para o remetente possivelmente falso ou espalhar a mensagem não resolvem.'),
        mcq('q6', 'Depois de uma conta ser comprometida, o usuário troca a senha, mas continua havendo cópia silenciosa de suas mensagens para um endereço externo. Qual é a explicação mais provável?', 'b', [
          'A troca de senha cria automaticamente um encaminhamento externo',
          'Existe uma regra de encaminhamento criada pelo invasor, que continua ativa após a troca de senha',
          'O gateway de e-mail está fazendo cópias de segurança para o provedor',
          'O navegador do usuário guardou a senha antiga e a reenvia para terceiros'
        ], 'Regras de caixa postal criadas por invasores persistem após a troca de senha; por isso se auditam regras. As outras explicações não têm base técnica realista.'),
        mcq('q7', 'Qual desenho de simulação de phishing é mais adequado do ponto de vista ético e da LGPD?', 'd', [
          'Mensagens falsas anunciando demissões em massa, para medir a reação emocional',
          'Divulgar publicamente a lista de quem clicou, para servir de exemplo para o restante da equipe e estimular mais cuidado nos próximos exercícios',
          'Isca prometendo prêmio em dinheiro e coleta das senhas digitadas, para analisar depois',
          'Iscas plausíveis sem explorar medo nem necessidade real, programa previsto em política interna, aprendizado imediato e confidencialidade'
        ], 'A simulação deve educar, ser transparente, coletar o mínimo e proteger as pessoas. Explorar medo, expor indivíduos ou coletar senhas reais fere a ética e a LGPD.'),
        fill('q8', 'Complete: a fraude em que alguém se passa por um executivo ou fornecedor por e-mail, para induzir transferências ou mudança de dados bancários, tem a sigla ___.', 'sigla da fraude do CEO por e-mail: ___', ['bec'], 'BEC (Business Email Compromise) é um golpe social, muitas vezes sem anexo nem link, combatido com processo de confirmação por segundo canal.')
      ]
    },
    {
      id: 'csi-19-ataques-a-senhas-e-defesas',
      title: 'Ataques a senhas e defesas',
      goal: 'Reconhecer força bruta, credential stuffing e password spraying, e aplicar defesas e políticas modernas de senha.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que senhas são tão visadas',
            'Senhas ainda são a forma de autenticação mais usada e a mais atacada. Entender os padrões de ataque permite DETECTAR e BLOQUEAR. Esta lição é conceitual: não mostra nem recomenda ferramentas de quebra; foca em reconhecer o comportamento nos logs e em defender. Revise do nível iniciante MFA e hash. Qualquer teste de senhas deve ocorrer apenas em sistemas seus ou com autorização por escrito.'
          ),
          sl(
            'Força bruta',
            'Na FORÇA BRUTA, o atacante tenta MUITAS senhas contra UMA conta (ou muitas combinações possíveis). Nos logs aparece como muitas falhas de login seguidas para o mesmo usuário, vindas de uma ou mais origens. Defesas: BLOQUEIO TEMPORÁRIO da conta ou atraso crescente após falhas (com cuidado, pois bloqueio rígido permite que alguém trave a conta de outra pessoa de propósito, o que é um ataque de negação de serviço), limite de tentativas por origem, CAPTCHA e MFA. Senhas longas também aumentam muito o custo.',
            'Padrão nos logs (fictício):\n10:00:01 falha usuario1 origem 192.0.2.50\n10:00:02 falha usuario1 origem 192.0.2.50\n10:00:03 falha usuario1 origem 192.0.2.50  ... (dezenas)'
          ),
          sl(
            'Credential stuffing',
            'CREDENTIAL STUFFING (preenchimento de credenciais) usa pares de usuário e senha VAZADOS em outros sites, apostando que as pessoas reutilizam a mesma senha. É automatizado e não adivinha nada: ele testa credenciais reais de outros vazamentos. Nos logs aparece como muitas contas diferentes, cada uma com poucas tentativas, muitas vezes com uma taxa de sucesso maior que a normal. O fator de risco é a reutilização de senhas. Defesas: MFA, verificar senhas novas contra listas de senhas vazadas, gerenciador de senhas para senhas únicas, detecção de automação e monitoramento de logins de origens incomuns.'
          ),
          sl(
            'Password spraying',
            'No PASSWORD SPRAYING (pulverização de senhas), o atacante tenta POUCAS senhas comuns (como "Mudar123") contra MUITAS contas, de forma lenta para escapar do bloqueio por conta: uma senha por usuário, esperando antes de repetir. Nos logs: muitas contas diferentes com UMA falha cada, da mesma origem, em intervalos longos. É o inverso da força bruta (que concentra em uma conta). Detecção: correlacionar falhas por ORIGEM e não só por usuário, alertar em muitas contas distintas com falha em um período, e vigilância de contas antigas ou de serviço. Defesas: política contra senhas fracas e comuns, MFA e bloqueio de senhas conhecidas.',
            'Força bruta:        1 conta  x  muitas senhas\nPassword spraying:  muitas contas x  poucas senhas\nCredential stuffing: pares vazados (usuário+senha) de outros sites'
          ),
          sl(
            'Hashes vazados e armazenamento',
            'Quando o banco de uma empresa vaza, o que o atacante tem são HASHES das senhas. Se foram guardados com hash rápido e sem sal, muitos podem ser recuperados por tentativa em larga escala (lembre da lição de criptografia). Com KDF lenta e sal, o custo é muito maior. Por isso as defesas incluem armazenar corretamente, notificar usuários, forçar redefinição quando há vazamento e verificar senhas escolhidas contra listas conhecidas de senhas vazadas. Para quem atua em segurança, existem serviços legítimos de consulta de e-mails vazados; use apenas para os seus próprios dados ou da organização autorizada.'
          ),
          sl(
            'Políticas modernas de senha',
            'Orientações atuais, em linha com referências como o NIST: priorize COMPRIMENTO (frases longas) em vez de regras complicadas de símbolos; não force trocas periódicas sem motivo (isso induz senhas previsíveis como "Senha1", "Senha2"), mas exija troca quando houver suspeita de comprometimento; bloqueie senhas comuns e vazadas; permita colar senhas e usar gerenciadores; ative MFA, de preferência resistente a phishing; e limite tentativas com atraso progressivo. Para contas de serviço, use cofre e rotação. Nunca registre senhas em logs nem as envie por e-mail ou chat.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Nos logs, você vê dezenas de falhas de login em segundos para a conta "usuario1", da mesma origem. Qual ataque é mais provável?', 'a', [
          'Força bruta contra uma única conta',
          'Password spraying, porque ele usa uma tentativa por conta',
          'Credential stuffing, porque ele usa muitas contas distintas',
          'Phishing, pois ele deixa falhas de login em um servidor interno'
        ], 'Muitas tentativas contra uma só conta é o padrão da força bruta. O spraying espalha poucas tentativas por muitas contas.'),
        mcq('q2', 'Qual é a principal causa do sucesso do credential stuffing?', 'd', [
          'A falta de firewall na rede da empresa',
          'O uso de criptografia forte no banco de dados do site atacado',
          'A velocidade do provedor de internet do atacante',
          'A reutilização de senhas pelas pessoas em vários serviços'
        ], 'Credential stuffing testa pares vazados em outros sites, e só funciona quando a pessoa usa a mesma senha em mais de um lugar.'),
        mcq('q3', 'Qual padrão de log aponta para password spraying?', 'c', [
          'Milhares de falhas contra o mesmo usuário em um minuto',
          'Um único login com sucesso de um endereço conhecido',
          'Muitas contas com uma falha cada, da mesma origem',
          'Falha alguma, só logins fora do horário comercial'
        ], 'No spraying, poucas senhas são testadas em muitas contas, de forma lenta para escapar do bloqueio por conta.'),
        fill('q4', 'Complete: o ataque que testa pares de usuário e senha vazados de outros sites chama-se credential ___.', 'credential ___ (preenchimento de credenciais)', ['stuffing'], 'Credential stuffing automatiza o uso de credenciais vazadas em outros serviços.'),
        mcq('q5', 'Por que o bloqueio rígido e permanente da conta após poucas falhas pode ser um problema?', 'b', [
          'Porque ele impede o uso de MFA para o usuário legítimo',
          'Alguém pode travar contas alheias de propósito (negação de serviço)',
          'Porque o bloqueio aumenta o tamanho dos logs de forma inaceitável',
          'Porque o bloqueio faz as senhas vazarem para outros sistemas'
        ], 'Bloqueio rígido pode ser abusado para travar usuários legítimos. Atraso progressivo e limite por origem equilibram melhor.'),
        mcq('q6', 'Qual política moderna de senha é recomendada?', 'a', [
          'Priorizar comprimento, bloquear senhas comuns e vazadas e trocar só com suspeita',
          'Exigir troca mensal obrigatória, pois quanto mais trocas, mais segura fica a senha',
          'Exigir muitos símbolos obrigatórios, mas limitar o tamanho máximo a 8 caracteres',
          'Proibir gerenciadores de senhas e colar senhas, para evitar vazamentos'
        ], 'Referências atuais valorizam comprimento, bloqueio de senhas fracas e troca motivada. Trocas forçadas geram senhas previsíveis.'),
        mcq('q7', 'Uma defesa eficaz contra os três ataques ao mesmo tempo é:', 'd', [
          'Exibir uma mensagem de erro detalhada que diga qual parte do login está errada',
          'Aumentar o tempo de sessão para que o usuário precise logar menos vezes',
          'Remover o registro de falhas de login para economizar espaço',
          'MFA resistente a phishing, com monitoramento e limite de tentativas'
        ], 'O MFA reduz muito o valor de uma senha descoberta. Mensagens detalhadas ajudam o atacante e remover logs elimina a detecção.'),
        fill('q8', 'Complete: no ataque de força bruta o atacante tenta muitas senhas contra uma conta; no password ___ tenta poucas senhas contra muitas contas.', 'password ___ (muitas contas, poucas senhas)', ['spraying'], 'No password spraying o atacante testa poucas senhas comuns em muitas contas, para evitar o bloqueio por conta.')
      ]
    },
    {
      id: 'csi-20-ransomware',
      title: 'Ransomware',
      goal: 'Entender as fases de um ataque de ransomware, a prevenção em camadas, o papel de backups imutáveis e as ressalvas sobre pagamento.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é ransomware',
            'RANSOMWARE é um tipo de malware que torna dados ou sistemas inacessíveis (geralmente cifrando-os) e exige um pagamento, o resgate, para devolver o acesso. Você viu o conceito no nível iniciante; aqui o foco é a anatomia e a defesa. Hoje, grupos criminosos operam como empresas, muitas vezes alugando ferramentas e acessos a outros criminosos, e o impacto vai muito além dos arquivos cifrados: operação parada, dados vazados, danos à reputação e obrigações legais. Esta lição é totalmente defensiva e não contém código.'
          ),
          sl(
            'Anatomia em fases',
            'Em geral, um ataque de ransomware moderno segue fases (compare com a Kill Chain e o ATT&CK): 1) ACESSO INICIAL, por phishing, credenciais roubadas, serviço remoto exposto ou falha não corrigida; 2) PERSISTÊNCIA e DESCOBERTA, entendendo a rede, 3) ESCALADA DE PRIVILÉGIO e MOVIMENTAÇÃO LATERAL até chegar a servidores e a contas administrativas; 4) DESATIVAÇÃO DE DEFESAS e destruição de backups acessíveis; 5) EXFILTRAÇÃO de dados, copiando informações para fora; 6) IMPACTO: cifragem em larga escala, frequentemente fora do horário de trabalho, e a nota de resgate. A fase de preparação pode durar dias ou semanas, o que é uma janela de detecção.',
            '1 Acesso inicial -> 2 Descoberta/persistência -> 3 Movimentação lateral\n-> 4 Desativar defesas e backups -> 5 Exfiltrar dados -> 6 Cifrar e exigir resgate\n(quanto mais cedo detectar, menor o dano)'
          ),
          sl(
            'Dupla extorsão',
            'Antes, bastava restaurar o backup e ignorar o resgate. Por isso os criminosos passaram a roubar os dados ANTES de cifrar: é a DUPLA EXTORSÃO. Mesmo que a vítima restaure os sistemas, ainda há a ameaça de PUBLICAR os dados roubados ou vendê-los. Variações incluem pressão sobre clientes e parceiros e ataques de negação de serviço. Consequência prática: um backup bom resolve o problema de disponibilidade, mas não o de confidencialidade; por isso a prevenção de vazamentos e a detecção de saída anormal de dados importam tanto quanto o backup. Quando há dados pessoais envolvidos, a LGPD prevê obrigações de comunicação de incidentes; não substitui orientação jurídica.'
          ),
          sl(
            'Prevenção em camadas',
            'Nenhuma medida isolada basta; combine camadas alinhadas às fases. Evitar a entrada: MFA, correção rápida de falhas, treinamento contra phishing, filtro de e-mail, nada de serviços de administração expostos à internet. Dificultar a movimentação: menor privilégio, segmentação, separação de contas administrativas, tiering. Detectar: EDR, SIEM, alertas de comportamento (muitos arquivos sendo alterados, desativação de antivírus, exclusão de cópias de segurança). Limitar o dano: backups, planos de resposta e exercícios. Cada camada falha às vezes; juntas, elevam o custo do atacante.'
          ),
          sl(
            'Backups imutáveis e a regra 3-2-1',
            'Lembre da regra 3-2-1 do nível iniciante: 3 cópias, em 2 tipos de mídia, 1 fora do local. Contra ransomware, acrescente: cópia IMUTÁVEL (não pode ser alterada nem apagada por um período, mesmo por quem tem contas administrativas) ou OFFLINE (desconectada), pois os atacantes procuram e destroem backups acessíveis. Mantenha as credenciais do backup separadas das do domínio. E o mais importante: TESTE a restauração, medindo quanto tempo leva; um backup que nunca foi restaurado é uma esperança, não uma garantia. Conheça e defina o RTO (tempo máximo tolerável de recuperação) e o RPO (quantidade máxima tolerável de dados perdidos, em tempo).'
          ),
          sl(
            'Pagar ou não pagar',
            'A recomendação geral de autoridades e especialistas é NÃO pagar, porque o pagamento financia o crime, não garante a devolução dos dados (a chave pode não funcionar ou os dados podem ser publicados mesmo assim) e marca a vítima como alvo disposto a pagar. Mas a decisão real envolve contexto: impacto à vida e à segurança, viabilidade da recuperação e obrigações legais. Há ressalvas legais: em alguns países, pagar a determinados grupos pode violar sanções; consulte o jurídico, a seguradora (se houver) e as autoridades. Comunique o incidente à polícia e ao CSIRT. Esta é uma visão geral e não substitui orientação jurídica. A melhor decisão é a que se evita: prevenir e ter backups testados.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que a "dupla extorsão" torna o backup insuficiente como única defesa?', 'c', [
          'Porque os backups são cifrados junto com os arquivos originais',
          'Porque a dupla extorsão ocorre em computadores sem antivírus',
          'O backup resolve o acesso, mas não a ameaça de publicar os dados roubados',
          'Porque o backup restaura os dados, mas elimina o direito legal sobre eles'
        ], 'O backup resolve a disponibilidade; a dupla extorsão ameaça a confidencialidade. Por isso se previne também o vazamento.'),
        mcq('q2', 'Qual fase de um ataque de ransomware costuma durar dias ou semanas, oferecendo uma janela de detecção?', 'a', [
          'A preparação, com movimentação lateral e roubo de dados antes de cifrar',
          'A cifragem em si, que normalmente leva muitos dias para ser concluída',
          'O pagamento do resgate, que se prolonga por meses',
          'A notificação das autoridades, que ocorre antes de qualquer fase técnica'
        ], 'Antes de cifrar, o atacante costuma ficar um tempo na rede; detectar a movimentação lateral e a exfiltração pode interromper o ataque.'),
        mcq('q3', 'Qual característica torna um backup realmente resistente a ransomware?', 'd', [
          'Estar em um compartilhamento de rede acessível com a conta de administrador do domínio',
          'Estar na mesma máquina dos arquivos originais, para ser rápido',
          'Ser feito uma única vez, no início do ano, para economizar espaço',
          'Ser imutável ou offline, com credenciais separadas e restauração testada'
        ], 'Os atacantes procuram e apagam backups acessíveis. Imutabilidade, isolamento e testes são o que o torna confiável.'),
        fill('q4', 'Complete: o tempo máximo tolerável para restaurar um serviço após um incidente chama-se ___ (sigla).', 'tempo máximo tolerável de recuperação = ___', ['rto'], 'RTO (Recovery Time Objective) é o tempo máximo de recuperação; o RPO limita a perda de dados.'),
        mcq('q5', 'Qual medida atua principalmente na fase de movimentação lateral?', 'b', [
          'Treinamento sobre phishing para os funcionários novos',
          'Segmentação, menor privilégio e contas administrativas separadas',
          'Aumentar o tamanho dos arquivos de log',
          'Desativar o filtro de e-mail para evitar bloqueios indevidos'
        ], 'Segmentação, menor privilégio e tiering dificultam que o atacante se espalhe. O treinamento atua na entrada, e as outras opções não ajudam.'),
        mcq('q6', 'Por que as autoridades em geral recomendam não pagar o resgate?', 'c', [
          'Porque o pagamento é proibido por lei em qualquer país, sem exceção',
          'Porque o pagamento aumenta automaticamente a nota de risco do CVSS',
          'Financia o crime, não garante a devolução e marca a vítima como alvo',
          'Porque a chave de recuperação é entregue, mas muito mais tarde'
        ], 'Pagar não garante recuperação nem impede a publicação dos dados e incentiva novos ataques. Há exceções de contexto e obrigações legais a avaliar com o jurídico.'),
        mcq('q7', 'Um alerta mostra um processo desativando o antivírus e apagando cópias de segurança locais em um servidor. Como interpretar?', 'a', [
          'Preparação típica para cifragem, que justifica isolar o host',
          'Uma rotina de manutenção normal, que não precisa de investigação',
          'Um sinal de que o servidor está obsoleto e deve ser substituído no próximo ano',
          'Um falso positivo comum, que deve ser ignorado por regra'
        ], 'Desativar defesas e destruir backups são sinais clássicos antes da cifragem. O isolamento rápido pode evitar o impacto.'),
        fill('q8', 'Complete: a regra de backup que recomenda 3 cópias, em 2 tipos de mídia, com 1 cópia fora do local chama-se regra 3-2-___.', 'regra 3-2-___', ['1'], 'Regra 3-2-1: três cópias, duas mídias, uma fora do local; hoje se acrescenta imutabilidade ou cópia offline.')
      ]
    },
    {
      id: 'csi-21-resposta-a-incidentes',
      title: 'Resposta a incidentes',
      goal: 'Conhecer o ciclo de resposta a incidentes, os papéis, os playbooks, a comunicação e a classificação de severidade.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Evento, alerta e incidente',
            'EVENTO é qualquer ocorrência observável (um login, um arquivo criado). ALERTA é um evento que uma regra considerou suspeito. INCIDENTE de segurança é um evento (ou conjunto) que compromete, ou ameaça comprometer, a confidencialidade, a integridade ou a disponibilidade de ativos, exigindo resposta. Nem todo alerta é incidente: a triagem separa falsos positivos do que importa. A RESPOSTA A INCIDENTES (IR) é o processo organizado para lidar com eles, reduzindo dano, tempo e custo, e aprendendo para o futuro.'
          ),
          sl(
            'O ciclo de resposta',
            'Modelos como o do NIST organizam a resposta em 4 grandes fases. 1) PREPARAÇÃO: antes de acontecer: plano, equipe, ferramentas, contatos, treinamentos e exercícios. 2) DETECÇÃO E ANÁLISE: identificar, confirmar, entender o escopo (o que foi afetado?), classificar a severidade e coletar evidências. 3) CONTENÇÃO, ERRADICAÇÃO E RECUPERAÇÃO: conter (impedir o avanço, por exemplo isolando hosts), erradicar (remover a causa: malware, contas, falhas) e recuperar (restaurar sistemas e voltar à operação com monitoramento reforçado). 4) PÓS-INCIDENTE: lições aprendidas, melhorias e relatório. O ciclo é contínuo: a lição aprendida volta para a preparação.',
            'Preparação -> Detecção e análise -> Contenção/Erradicação/Recuperação -> Pós-incidente\n      ^                                                                  |\n      +------------------------ lições aprendidas ----------------------+'
          ),
          sl(
            'Papéis e equipe',
            'Em um incidente, ninguém deve "fazer tudo". Papéis típicos: COORDENADOR (ou gerente do incidente), que decide e organiza; ANALISTAS técnicos, que investigam e contêm; COMUNICAÇÃO, que fala com a direção, a imprensa e os clientes de forma controlada; JURÍDICO e encarregado de dados (DPO), que avaliam obrigações legais e a LGPD; TI e donos dos sistemas afetados; e um responsável por REGISTRAR as ações com horário. Definir esses papéis antes evita confusão e discussões durante a crise. Em incidentes grandes, forme uma sala de crise com um canal único de comunicação.'
          ),
          sl(
            'Playbooks e severidade',
            'Um PLAYBOOK é um roteiro passo a passo para um tipo de incidente (phishing, ransomware, conta comprometida, vazamento de dados): quem faz o quê, em qual ordem, com quais critérios de decisão. Ele acelera a resposta e reduz erros sob pressão, e é treinado em simulações (exercícios de mesa). A SEVERIDADE classifica o incidente por impacto e urgência (por exemplo baixa, média, alta e crítica), e define prazos de resposta, quem é acionado e até onde escalar. Critérios típicos: dados pessoais ou críticos envolvidos, número de sistemas afetados, impacto no negócio, se está em andamento. Reclassifique conforme descobre mais.'
          ),
          sl(
            'Evidências, comunicação e LGPD',
            'Preserve evidências: registre horários, prints, logs e cópias de arquivos, mantendo a CADEIA DE CUSTÓDIA (quem teve acesso e quando) para que possam ser usadas na apuração. Evite ações que as destruam (reiniciar ou formatar sem coleta). Comunicação: use linguagem factual, canais definidos e quem fala é o porta-voz designado. Em visão geral, a LGPD (Lei 13.709/2018) prevê que incidentes que possam trazer risco ou dano relevante a titulares de dados sejam comunicados à autoridade (ANPD) e aos titulares, nos termos da regulamentação vigente; consulte sempre o jurídico e o encarregado, pois prazos e critérios devem ser confirmados nas normas atuais. Não invente prazos, e não esconda incidentes.'
          ),
          sl(
            'Pós-incidente e melhoria',
            'A reunião de LIÇÕES APRENDIDAS (post-mortem) ocorre em poucos dias, com foco em processo e não em culpados (cultura sem culpa, para que as pessoas relatem erros). Perguntas: o que aconteceu, como detectamos, o que funcionou, o que atrasou, o que mudar? Gere ações com dono e prazo: nova regra de detecção, correção de falha, ajuste no playbook, treinamento. Meça: tempo para detectar (MTTD) e tempo para responder ou conter (MTTR). Um incidente bem tratado deixa a organização mais forte; um incidente escondido se repete.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a diferença entre alerta e incidente?', 'b', [
          'Alerta e incidente são sinônimos, e toda notificação do SIEM é um incidente',
          'O alerta é um evento suspeito; só é incidente se a análise confirmar',
          'O incidente é menos grave que o alerta, pois ocorre depois dele',
          'O alerta é gerado só por pessoas, e o incidente só por máquinas'
        ], 'A triagem decide se o alerta é um incidente. Muitos alertas são falsos positivos ou eventos benignos.'),
        mcq('q2', 'Em qual fase do ciclo de resposta se criam o plano, a equipe e os exercícios?', 'a', [
          'Preparação',
          'Contenção, erradicação e recuperação',
          'Pós-incidente, depois que o incidente acabou',
          'Detecção e análise, durante a crise'
        ], 'A preparação ocorre antes do incidente. Lições aprendidas alimentam a preparação, mas o plano deve existir antes.'),
        mcq('q3', 'Qual é a diferença entre contenção e erradicação?', 'd', [
          'Contenção é remover a causa; erradicação é isolar os sistemas afetados',
          'Contenção é apagar os registros do incidente; erradicação é publicar o relatório',
          'Não há diferença; são nomes usados por equipes diferentes',
          'Contenção impede o avanço; erradicação remove a causa, como malware, contas e falhas'
        ], 'Primeiro se contém para limitar o dano e depois se erradica a causa; só então se recupera.'),
        fill('q4', 'Complete: o roteiro passo a passo para tratar um tipo específico de incidente, como phishing ou ransomware, chama-se ___.', 'roteiro de resposta por tipo de incidente = ___', ['playbook', 'playbooks'], 'O playbook define quem faz o quê e em qual ordem, reduzindo erros sob pressão.'),
        mcq('q5', 'Por que não reiniciar nem formatar um computador comprometido antes de coletar evidências?', 'c', [
          'Porque reiniciar piora o malware e o espalha pela rede',
          'Porque computadores comprometidos não podem ser desligados por lei',
          'Pode destruir evidências e comprometer a investigação',
          'Porque a formatação deixa o antivírus desatualizado'
        ], 'Evidências voláteis e arquivos são perdidos; coletar antes e manter a cadeia de custódia é essencial.'),
        mcq('q6', 'Qual abordagem é a mais adequada na reunião de lições aprendidas?', 'b', [
          'Identificar e punir o responsável pelo erro, para evitar que se repita',
          'Focar em processos e causas, com ações de dono e prazo, sem culpa',
          'Evitar documentar o que foi aprendido, para não expor a empresa',
          'Realizá-la um ano depois, quando as emoções tiverem passado'
        ], 'Cultura sem culpa favorece o relato de erros e a melhoria. Punição e atraso reduzem o aprendizado.'),
        mcq('q7', 'Um incidente envolve dados pessoais de clientes. Qual conduta está adequada?', 'a', [
          'Acionar jurídico e encarregado para avaliar a comunicação, sem esconder o incidente',
          'Manter o assunto em sigilo absoluto e não comunicar, para proteger a imagem',
          'Comunicar imediatamente aos clientes cada detalhe técnico, sem revisão',
          'Estimar prazos de notificação de memória e informar à autoridade por conta própria'
        ], 'Os prazos e critérios devem ser confirmados com o jurídico e as normas vigentes; esconder o incidente agrava o problema.'),
        fill('q8', 'Complete: a pessoa que decide e organiza a resposta durante um incidente é o ___ do incidente.', 'papel que decide e organiza = ___ do incidente', ['coordenador', 'gerente', 'líder', 'lider'], 'O coordenador (ou gerente) do incidente organiza a equipe e as decisões, evitando que todos façam tudo ao mesmo tempo.')
      ]
    },
    {
      id: 'csi-22-forense-digital-basica',
      title: 'Forense digital básica',
      goal: 'Entender os princípios da forense digital: preservar evidências, manter a cadeia de custódia, respeitar a ordem de volatilidade e provar integridade com hashes.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é forense digital',
            'Forense digital é a coleta, a preservação e a análise de dados de sistemas computacionais para responder perguntas sobre um incidente: o que aconteceu, quando, como e quem foi afetado. Ela serve a dois públicos: a equipe técnica (que precisa entender e conter o problema) e, quando necessário, a área jurídica ou autoridades (que podem precisar de provas). Erro comum: começar a "mexer" no computador afetado para investigar. Cada clique pode alterar datas de acesso, apagar memória e destruir justamente o que se queria analisar. A regra de ouro é: primeiro preserve, depois analise.'
          ),
          sl(
            'Princípios: preservar, documentar, reproduzir',
            'Três princípios guiam o trabalho. Preservar: alterar o mínimo possível o sistema original. Documentar: anotar cada ação, com data, hora e quem fez (um caderno de bordo). Reproduzir: outra pessoa, seguindo suas anotações, deve chegar ao mesmo resultado. Exemplo: ao receber um notebook suspeito, você anota o estado em que ele chegou (ligado ou desligado, tela, etiquetas), fotografa e só então decide o que coletar. Erro comum: investigar direto no disco original em vez de trabalhar numa cópia.'
          ),
          sl(
            'Cadeia de custódia',
            'Cadeia de custódia é o registro cronológico de quem teve posse de uma evidência, quando, onde e por quê, desde a coleta até o descarte. Funciona como o protocolo de entrega de um pacote valioso: cada transferência tem assinatura e horário. Serve para mostrar que a evidência não foi trocada nem adulterada no caminho. Um registro mínimo traz: identificação da evidência, quem coletou, data e hora, local, quem recebeu em cada transferência e onde ficou guardada. Erro comum: deixar o disco "numa gaveta aberta" sem registro; mesmo que ninguém tenha mexido, não há como provar isso.',
            'Evidência: HD-001 (disco do notebook X)\n10/03 09:10  coletado por Analista A\n10/03 11:00  entregue a Analista B (assinado)\n10/03 11:05  guardado no cofre, lacre n. 0042'
          ),
          sl(
            'Ordem de volatilidade',
            'Dados voláteis são os que desaparecem quando o equipamento é desligado ou com o passar do tempo. A ordem de volatilidade manda coletar primeiro o que some mais rápido. Do mais volátil para o menos: 1) registradores e cache do processador; 2) memória RAM (processos em execução, conexões abertas, chaves de criptografia); 3) estado da rede e processos; 4) disco (arquivos, registros do sistema); 5) mídias de backup e logs remotos. Exemplo: desligar a máquina por "segurança" antes de capturar a memória apaga processos e conexões que mostrariam o que o invasor estava fazendo. A decisão de conter (isolar da rede) costuma ser preferível a desligar, e deve ser tomada junto com o plano de resposta a incidentes.'
          ),
          sl(
            'Imagem forense e hashes de integridade',
            'Imagem forense é uma cópia bit a bit do disco inteiro, incluindo áreas apagadas e espaço livre, não só os arquivos visíveis. A análise é feita na cópia; o original fica guardado. Para provar que a cópia é fiel, usa-se hash: uma função que transforma qualquer dado em uma "impressão digital" de tamanho fixo. Mudou um único bit, o hash muda por completo. Calcula-se o hash do original e o da cópia: se forem iguais, a cópia é idêntica. O hash deve ser recalculado depois, para provar que nada mudou durante a análise. Para a coleta, usa-se um bloqueador de escrita, dispositivo ou mecanismo que impede o computador de análise de gravar algo no disco original. Funções como MD5 estão obsoletas para segurança; prefira SHA-256.',
            'hash(original) = 10f96a83...cecc72\nhash(copia)    = 10f96a83...cecc72   -> iguais: cópia fiel'
          ),
          sl(
            'Ferramentas por categoria e limites',
            'Em vez de decorar nomes, pense em categorias: aquisição de imagem de disco, captura de memória, análise de sistema de arquivos, análise de logs, linha do tempo de eventos (timeline) e verificação de hashes. A escolha depende do sistema e do caso. Ferramentas ajudam, mas não substituem método: um resultado sem cadeia de custódia e documentação vale pouco. Limites também importam: criptografia de disco, dados em nuvem de terceiros e equipamentos de funcionários exigem autorização e, às vezes, apoio do provedor. Quando o caso pode virar processo, chame o jurídico e, se preciso, um perito qualificado.'
          ),
          sl(
            'Cuidado com dados pessoais',
            'Uma imagem forense contém tudo: e-mails, fotos, conversas, dados de clientes. Isso inclui dados pessoais, protegidos pela LGPD (Lei 13.709/2018). Boas práticas: coletar só o necessário para a investigação (princípio da necessidade), restringir quem acessa as evidências, guardá-las com controle de acesso e criptografia, descartar de forma segura ao final e registrar a finalidade. Em investigações envolvendo funcionários, alinhe com RH e jurídico antes. Este conteúdo é visão geral e não substitui orientação jurídica.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um analista chega a um notebook ligado, suspeito de estar comprometido. Qual a atitude mais alinhada à forense?', 'c', [
          'Desligar imediatamente o notebook para impedir que o invasor continue agindo, pois dados voláteis são pouco importantes',
          'Abrir os arquivos recentes e navegar pelo disco para entender logo o que aconteceu, anotando depois',
          'Registrar o estado, capturar a memória e só então decidir sobre desligar',
          'Reinstalar o sistema operacional para eliminar a ameaça e depois examinar os backups mais antigos'
        ], 'Preservar vem antes de analisar, e a memória é o dado mais volátil. Desligar apaga processos e conexões; navegar no disco original altera datas de acesso; reinstalar destrói as evidências.'),
        mcq('q2', 'Para que serve a cadeia de custódia?', 'a', [
          'Mostrar que a evidência não foi trocada nem adulterada, registrando quem a manteve e quando',
          'Comprimir a imagem do disco para ocupar menos espaço no armazenamento do laboratório forense',
          'Cifrar a evidência com chave única para que só o analista principal consiga abri-la depois',
          'Substituir o hash de integridade, já que o registro de posse é uma prova mais forte do que o cálculo'
        ], 'A cadeia de custódia é um registro de posse e transferência. Não comprime, não cifra e não substitui o hash: os dois se complementam.'),
        mcq('q3', 'Qual a ordem correta de coleta, do mais para o menos volátil?', 'b', [
          'Disco, memória RAM, estado da rede, backups',
          'Memória RAM, estado da rede, disco, backups',
          'Backups, disco, estado da rede, memória RAM',
          'Estado da rede, disco, backups, memória RAM'
        ], 'A RAM some quando a máquina é desligada, por isso vem primeiro; backups são os mais duradouros e ficam por último. As outras ordens colocam dados duráveis antes de dados que desaparecem.'),
        fill('q4', 'Complete com o nome da técnica que gera uma "impressão digital" do dado e prova que uma cópia é idêntica ao original.', 'hash(original) == ___(copia)  ->  a imagem forense é fiel', ['hash', 'hashes', 'sha-256', 'sha256'], 'O hash, como o SHA-256, muda por completo se um único bit mudar; hashes iguais indicam cópia idêntica.'),
        mcq('q5', 'Por que a análise é feita numa imagem forense e não no disco original?', 'd', [
          'Porque o disco original só pode ser lido por equipamentos do fabricante, e isso encareceria muito a análise',
          'Porque a imagem é menor que o disco e a análise fica mais rápida, o que dispensa conferir o hash',
          'Porque programas de análise não funcionam em discos que estejam fisicamente conectados ao computador',
          'Porque a cópia protege o original contra alterações, que invalidariam as evidências'
        ], 'Trabalhar na cópia preserva o original intacto e permite repetir a análise. A rapidez não é o motivo, e o hash continua necessário para provar fidelidade.'),
        mcq('q6', 'Um colega calculou o hash da imagem na coleta e, após a análise, o valor era diferente. O que isso indica?', 'd', [
          'Que a análise foi mais profunda que o esperado e enriqueceu os dados da imagem original',
          'Que o algoritmo de hash envelheceu durante o processo e precisa ser trocado por outro',
          'Nada de relevante, pois diferenças pequenas de hash são normais quando o arquivo é aberto para leitura',
          'A imagem foi alterada em algum momento, e a integridade da evidência fica comprometida'
        ], 'Qualquer diferença no hash significa que o conteúdo mudou. Não existe diferença pequena aceitável: o hash é totalmente diferente para qualquer alteração.'),
        mcq('q7', 'Ao coletar a imagem de um computador de um funcionário, qual cuidado com dados pessoais é adequado?', 'c', [
          'Copiar todo o conteúdo para uma pasta compartilhada do time de TI, para facilitar a colaboração',
          'Ignorar a LGPD, porque investigações de incidente estão isentas das regras de proteção de dados',
          'Limitar o acesso às evidências, coletar o necessário e descartá-las de forma segura depois',
          'Enviar a imagem a um serviço externo gratuito de análise, que acelera a triagem de arquivos'
        ], 'A LGPD pede necessidade, controle de acesso e descarte seguro. Pasta compartilhada e serviços externos ampliam a exposição, e não há isenção automática.'),
        fill('q8', 'Complete com o termo que designa o registro de quem teve posse da evidência ao longo do tempo.', 'Cadeia de ___: registro cronológico de posse e transferência da evidência', ['custódia', 'custodia'], 'A cadeia de custódia documenta cada pessoa, data e local por onde a evidência passou.')
      ]
    },
    {
      id: 'csi-23-inteligencia-de-ameacas',
      title: 'Inteligência de ameaças',
      goal: 'Entender os níveis de inteligência de ameaças, a diferença entre IOCs e TTPs, a pirâmide da dor, as fontes, o compartilhamento com TLP e como indicadores envelhecem.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é inteligência de ameaças',
            'Inteligência de ameaças (CTI, do inglês Cyber Threat Intelligence) é informação sobre adversários e ameaças, analisada e contextualizada para apoiar decisões. Dado bruto, como uma lista de endereços IP, ainda não é inteligência; ela surge quando alguém responde: isso é relevante para a minha organização? o que devo fazer? Exemplo: saber que um grupo ataca o setor de saúde com phishing é útil para um hospital, e quase irrelevante para uma loja de roupas. Erro comum: acumular feeds enormes sem filtrar por relevância, gerando alertas demais.'
          ),
          sl(
            'Três níveis: estratégica, tática e operacional',
            'Cada nível atende um público. Estratégica: tendências de alto nível (quais ameaças crescem, riscos para o negócio); público: diretoria, para decidir investimento. Operacional: detalhes de campanhas específicas (quem está atacando, quando, com que objetivo); público: equipe de resposta e caçadores de ameaças. Tática: técnicas e comportamentos dos adversários (como o ataque acontece); público: analistas de SOC e engenharia de detecção, que criam regras. Há quem inclua um nível técnico, com indicadores como IPs e hashes, consumido por ferramentas. A mesma informação precisa ser escrita de forma diferente para cada público.'
          ),
          sl(
            'IOCs x TTPs',
            'IOC (Indicator of Compromise, indicador de comprometimento) é um vestígio observável de que algo malicioso aconteceu ou pode acontecer: um hash de arquivo, um domínio, um endereço IP, um endereço de e-mail. TTPs (Táticas, Técnicas e Procedimentos) descrevem o comportamento do adversário: como ele entra, como se move, como rouba dados (por exemplo, as técnicas do MITRE ATT&CK, visto antes). IOCs são fáceis de coletar e de bloquear, mas o atacante os troca com facilidade. TTPs são mais difíceis de detectar, porém mudar de comportamento custa caro ao atacante.',
            'IOC : dominio-malicioso.example   (muda em horas)\nTTP : envia anexo com macro e depois move-se pela rede\n      com credenciais roubadas   (muda raramente)'
          ),
          sl(
            'A pirâmide da dor',
            'A pirâmide da dor, de David Bianco, ordena os tipos de indicador pelo incômodo que causa ao atacante quando você o detecta e bloqueia. Da base ao topo: valores de hash (trivial: basta recompilar o arquivo), endereços IP (fácil: troca de servidor), nomes de domínio (simples), artefatos de rede e de host (incômodo), ferramentas (desafiador: precisa trocar de ferramenta) e TTPs (difícil: precisa mudar a forma de operar). Lição prática: bloquear hashes é rápido, mas dura pouco; investir em detecção de comportamento rende proteção mais duradoura.'
          ),
          sl(
            'Fontes e compartilhamento com TLP',
            'Fontes de CTI: internas (seus próprios logs e incidentes, as mais relevantes), abertas (publicações de pesquisadores, boletins de órgãos governamentais), comunidades setoriais e fornecedores comerciais. Compartilhar com pares ajuda todos, mas nem tudo pode circular livremente. O TLP (Traffic Light Protocol) é um código de cores que indica até onde a informação pode ser repassada: TLP:RED, apenas para os destinatários diretos; TLP:AMBER, para a organização e quem precisa saber; TLP:GREEN, para a comunidade; TLP:CLEAR, sem restrição. Erro comum: ignorar o rótulo e repassar uma informação sensível adiante. Ao compartilhar, retire dados pessoais e detalhes que identifiquem vítimas.'
          ),
          sl(
            'Qualidade e envelhecimento de indicadores',
            'Indicadores perdem valor com o tempo: um IP usado num ataque pode ser reaproveitado por uma empresa legítima semanas depois, e bloqueá-lo vira falso positivo. Por isso, todo indicador deve ter data, fonte, nível de confiança e prazo de validade. Perguntas de qualidade: de onde veio? já foi confirmado? tem contexto (que ameaça, que tipo)? ainda é válido? Boas práticas: priorizar indicadores relevantes ao seu setor, revisar periodicamente e remover os vencidos. Lista sem contexto e sem prazo gera ruído e cansaço no SOC.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual dos itens é inteligência de ameaças, e não apenas dado bruto?', 'b', [
          'Uma planilha com 50 mil endereços IP recebidos de um feed, sem data nem fonte',
          'Uma análise indicando que um grupo ativo no seu setor usa phishing com anexos, e como se defender',
          'O arquivo de log completo de um servidor web, exportado sem filtro aplicado',
          'Uma lista dos CVEs publicados no mês, sem relação com os sistemas que a empresa utiliza, copiada de um boletim público'
        ], 'Inteligência é informação analisada e contextualizada para apoiar decisão. As outras opções são dados sem contexto nem relevância definida.'),
        mcq('q2', 'A diretoria quer saber quais ameaças devem orientar o orçamento de segurança do próximo ano. Qual nível de CTI atende?', 'a', [
          'Estratégica',
          'Operacional, com detalhes das campanhas em andamento e dos IPs usados',
          'Tática, com as técnicas detalhadas de cada família de malware',
          'Técnica, com a lista de hashes mais recentes de arquivos maliciosos'
        ], 'A estratégica trata de tendências e riscos ao negócio, apoiando decisões de investimento. Os demais níveis são detalhados demais para esse público.'),
        mcq('q3', 'Qual afirmação distingue corretamente IOC de TTP?', 'd', [
          'O IOC descreve o comportamento do adversário ao longo do ataque; o TTP é um vestígio isolado como o hash de um arquivo',
          'Ambos são o mesmo conceito, mudando o nome conforme o fornecedor de inteligência escolhido',
          'O IOC existe em ataques de ransomware, enquanto o TTP só existe em ataques de phishing',
          'O IOC é um vestígio observável, como um hash ou domínio; o TTP descreve o comportamento do adversário'
        ], 'IOCs são vestígios; TTPs são comportamentos. Não são sinônimos e ambos valem para qualquer tipo de ataque.'),
        fill('q4', 'Complete com a sigla do código de cores que define até onde uma informação pode ser compartilhada.', '___:AMBER = pode ir para a organização e para quem precisa saber', ['tlp'], 'O TLP (Traffic Light Protocol) usa cores como RED, AMBER, GREEN e CLEAR para limitar a circulação.'),
        mcq('q5', 'Segundo a pirâmide da dor, por que bloquear apenas hashes de arquivos incomoda pouco o atacante?', 'c', [
          'Porque hashes não podem ser inseridos em ferramentas de bloqueio e só servem para relatórios',
          'Porque o hash identifica o comportamento, e o atacante precisaria mudar toda a sua forma de operar',
          'Porque basta recompilar ou alterar o arquivo para gerar outro hash',
          'Porque todo hash é publicado abertamente pelos atacantes, o que já elimina o valor de bloquear qualquer arquivo'
        ], 'Alterar um arquivo muda seu hash trivialmente, então o bloqueio dura pouco. Hash não descreve comportamento, e hashes podem sim ser bloqueados.'),
        mcq('q6', 'Seu SOC recebeu um indicador de IP com 8 meses de idade, sem data de validade, e vai bloqueá-lo. Qual o principal risco?', 'a', [
          'O IP pode estar com outro dono hoje, causando bloqueio indevido de serviço legítimo',
          'O bloqueio de IPs antigos sobrecarrega o firewall e o deixa mais lento para as regras recentes',
          'O IP, por ser antigo, tem mais chance de ser da própria empresa e deve ser mantido sem revisão',
          'Indicadores de IP só funcionam por 24 horas, depois são removidos automaticamente das listas'
        ], 'Endereços são reaproveitados, e indicadores envelhecem; sem validade, geram falsos positivos. Não há regra de remoção automática em 24 horas nem impacto garantido no firewall.'),
        mcq('q7', 'Você recebeu um relatório marcado TLP:RED. O que fazer?', 'b', [
          'Publicar no portal interno para a empresa inteira, já que os colaboradores são confiáveis',
          'Usar internamente e repassar só aos destinatários a quem a fonte autorizou diretamente',
          'Postar no fórum do setor, pois a informação ajuda outras empresas a se proteger',
          'Repassar a parceiros próximos, desde que assinem confidencialidade, sem consultar a fonte do relatório'
        ], 'TLP:RED restringe a informação aos destinatários diretos. Ampliar o círculo, mesmo com boa intenção, viola o combinado com quem compartilhou.'),
        fill('q8', 'Complete com a sigla que designa um vestígio observável de comprometimento, como um hash ou domínio.', '___ = Indicator of Compromise (hash, domínio, IP)', ['ioc'], 'IOC é a sigla de Indicator of Compromise, indicador de comprometimento.')
      ]
    },
    {
      id: 'csi-24-seguranca-em-nuvem',
      title: 'Segurança em nuvem',
      goal: 'Entender o modelo de responsabilidade compartilhada, os riscos de IAM e armazenamento exposto, o papel do CSPM, os logs de nuvem e o cuidado com chaves e segredos.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que muda na nuvem',
            'Computação em nuvem é usar recursos de TI (servidores, armazenamento, bancos de dados) alugados de um provedor, pela internet, sob demanda. Isso muda a segurança: você não controla mais o prédio nem o hardware, mas controla muitas configurações via painel ou código, e um clique errado pode expor dados ao mundo. Os modelos mais comuns são IaaS (você recebe infraestrutura básica e cuida de quase tudo acima dela), PaaS (você cuida do aplicativo e dos dados; a plataforma é do provedor) e SaaS (você usa um software pronto, como um e-mail corporativo, e cuida de contas e dados).'
          ),
          sl(
            'Responsabilidade compartilhada',
            'O modelo de responsabilidade compartilhada divide as tarefas. O provedor cuida da segurança DA nuvem: data centers, hardware, rede física e a camada de virtualização. O cliente cuida da segurança NA nuvem: contas e permissões, configuração dos serviços, dados e quem acessa o quê. Quanto mais "pronto" o serviço (SaaS), mais o provedor assume; quanto mais bruto (IaaS), mais sobra para o cliente. Erro muito comum: achar que "está na nuvem, então o provedor protege tudo". Dados expostos por configuração errada são responsabilidade do cliente.',
            'Provedor: prédio, hardware, rede física, virtualização\nCliente : contas, permissões, configuração, dados'
          ),
          sl(
            'IAM de nuvem',
            'IAM (Identity and Access Management) é o sistema que define quem pode fazer o quê (já visto no módulo de identidade). Na nuvem, é a primeira linha de defesa, pois tudo é controlado por contas e permissões. Práticas essenciais: MFA em todas as contas, principalmente a conta raiz (dona da assinatura, com poderes totais, que não deve ser usada no dia a dia); privilégio mínimo (conceder só o necessário); uso de papéis temporários em vez de credenciais permanentes; revisão periódica de permissões. Erro comum: dar a todos o perfil de administrador "para facilitar".'
          ),
          sl(
            'Armazenamento exposto',
            'Serviços de armazenamento de objetos (conhecidos como buckets) guardam arquivos na nuvem. Se forem configurados como públicos, qualquer pessoa com o endereço pode ler os arquivos. Muitos vazamentos reais vieram de um armazenamento aberto por engano, sem nenhuma invasão sofisticada. Defesas: manter o acesso público bloqueado por padrão, liberar apenas quando indispensável e com revisão, criptografar os dados, ativar registro de acesso e inventariar o que existe. Dados pessoais em armazenamento exposto podem configurar incidente de segurança sob a LGPD.'
          ),
          sl(
            'CSPM e logs de nuvem',
            'CSPM (Cloud Security Posture Management) é uma categoria de ferramentas que verifica continuamente a configuração dos recursos de nuvem contra boas práticas e alerta sobre desvios: armazenamento público, porta aberta para o mundo, conta sem MFA, disco sem criptografia. É como um fiscal que vistoria a casa o tempo todo. Os logs de nuvem registram chamadas administrativas (quem criou, alterou ou apagou o quê, e de qual endereço) e acessos a dados. Precisam estar ligados, guardados em local protegido e enviados ao SIEM para detecção. Sem log ativo, um incidente fica sem rastro.'
          ),
          sl(
            'Chaves e segredos',
            'Segredos são credenciais usadas por sistemas: chaves de acesso, tokens, senhas de banco de dados. O erro clássico é gravá-los no código ou em arquivos de configuração que acabam num repositório. Boas práticas: guardar segredos em um cofre de segredos gerenciado, com acesso controlado e registro; rotacionar (trocar) periodicamente; dar a cada aplicação só as permissões de que precisa; e, se um segredo vazar, revogá-lo imediatamente e investigar o uso. Em exemplos de documentação, segredos aparecem como placeholders, como <chave-de-acesso>, nunca valores reais.',
            'Errado: chave_acesso = "<chave-de-acesso>"   # no código\nCerto : ler o segredo de um cofre em tempo de execução'
          )
        ]
      },
      questions: [
        mcq('q1', 'Uma empresa colocou seus dados num serviço de armazenamento na nuvem e deixou o acesso público por engano. Quem responde pela configuração?', 'd', [
          'O provedor, pois a nuvem é protegida integralmente por ele em todas as camadas do serviço',
          'O fabricante do hardware do data center, que forneceu o equipamento de armazenamento',
          'Ninguém, pois configurações públicas não são consideradas falhas de segurança',
          'O cliente, pois configuração e dados ficam sob sua responsabilidade'
        ], 'No modelo de responsabilidade compartilhada, o provedor cuida da infraestrutura e o cliente cuida de configuração, contas e dados.'),
        mcq('q2', 'Qual item pertence à responsabilidade do PROVEDOR de nuvem?', 'a', [
          'A segurança física dos data centers',
          'A definição de quem na empresa pode criar usuários administradores',
          'A decisão de ativar ou não o MFA nas contas dos colaboradores do cliente',
          'A classificação dos dados pessoais que o cliente envia para o serviço'
        ], 'O provedor protege a infraestrutura física. Contas, MFA e classificação de dados são responsabilidades do cliente.'),
        mcq('q3', 'Qual prática melhor protege a conta raiz de uma assinatura de nuvem?', 'c', [
          'Compartilhar a senha com a equipe inteira de TI para garantir acesso em emergências',
          'Usá-la nas automações, pois ela tem poderes totais e evita erros de permissão negada em scripts',
          'Ativar MFA, não usá-la no dia a dia e criar contas com permissões limitadas para o trabalho comum',
          'Mantê-la sem MFA para que a recuperação seja rápida e dispensar a revisão de permissões, já que ela é única'
        ], 'A conta raiz tem poder total, então deve ter MFA e ficar reservada. As outras opções ampliam o risco de uso indevido ou comprometimento.'),
        fill('q4', 'Complete com a sigla da categoria de ferramentas que verifica continuamente se a configuração da nuvem segue boas práticas.', '___ = Cloud Security Posture Management', ['cspm'], 'CSPM monitora a postura de segurança da nuvem e alerta sobre configurações inseguras.'),
        mcq('q5', 'Uma aplicação precisa acessar um banco de dados na nuvem. Qual forma de guardar a senha é mais adequada?', 'b', [
          'Direto no código-fonte, para que cada versão do programa traga a senha correta',
          'Em um cofre de segredos, com rotação e acesso controlado',
          'Em um arquivo de configuração versionado no mesmo repositório do aplicativo, junto com o restante do projeto',
          'Em uma planilha compartilhada, assim a equipe consulta rápido quando precisar trocar a senha'
        ], 'Cofres de segredos controlam acesso e permitem rotação. Código, repositório e planilhas espalham a senha e dificultam revogá-la.'),
        mcq('q6', 'Um segredo de nuvem foi publicado por engano num repositório público. Qual a primeira providência?', 'd', [
          'Apagar o arquivo do repositório e considerar o problema resolvido, pois o histórico não guarda cópias',
          'Aguardar alguns dias para ver se alguém tenta usar a chave antes de agir',
          'Mudar o nome do repositório para dificultar a localização pelas pessoas',
          'Revogar ou trocar o segredo imediatamente e investigar se foi usado'
        ], 'Quem viu o segredo pode já tê-lo copiado, e o histórico do repositório mantém o conteúdo. É preciso invalidar a credencial e verificar o uso.'),
        mcq('q7', 'Por que os logs de atividade da nuvem precisam estar ativos e protegidos?', 'a', [
          'Para reconstruir quem alterou o quê durante um incidente e alimentar a detecção',
          'Para reduzir o custo mensal da assinatura, já que o provedor cobra menos de quem registra mais eventos',
          'Porque o provedor exige logs para liberar o acesso aos serviços, independentemente de uso ou configuração',
          'Para substituir o MFA, pois o registro das ações já impede acessos indevidos'
        ], 'Logs dão rastreabilidade e alimentam o SIEM. Não reduzem custo, não são exigência universal do provedor e não impedem acesso como o MFA faz.'),
        fill('q8', 'Complete com o tipo de armazenamento de objetos na nuvem que, se ficar público, expõe arquivos a qualquer pessoa.', 'Um ___ de armazenamento aberto ao público pode vazar dados', ['bucket'], 'Buckets públicos são uma fonte frequente de vazamentos por configuração incorreta.')
      ]
    },
    {
      id: 'csi-25-containers-e-kubernetes-visao',
      title: 'Containers e Kubernetes: visão de segurança',
      goal: 'Entender os riscos de imagens, privilégios, segredos e rede em containers, o papel dos scanners de imagem e a visão geral de segurança em Kubernetes.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que são containers',
            'Container é um pacote que reúne um aplicativo e tudo de que ele precisa para rodar (bibliotecas e configurações), isolado dos demais containers, mas compartilhando o kernel (o núcleo) do sistema operacional do hospedeiro. Funciona como uma marmita lacrada: leve e portátil. Uma imagem é o molde do qual o container nasce. Kubernetes é um orquestrador: um sistema que gerencia muitos containers em vários servidores, decidindo onde rodam, reiniciando os que falham e conectando-os pela rede. Esta lição dá a visão de segurança; para a prática completa, veja o curso de Containers.'
          ),
          sl(
            'Riscos das imagens',
            'A maioria dos containers nasce de imagens prontas, públicas ou internas. Riscos: imagem de origem desconhecida (pode conter software malicioso), imagem desatualizada com vulnerabilidades conhecidas, imagem inchada com ferramentas desnecessárias (maior superfície de ataque) e segredos esquecidos dentro das camadas. Defesas: usar imagens de fontes confiáveis, preferir bases mínimas, fixar versões em vez de usar a etiqueta latest (que muda sem aviso), reconstruir periodicamente para trazer correções e assinar imagens para provar a origem.'
          ),
          sl(
            'Privilégios',
            'Por padrão, muitos containers executam como root, o usuário com poder total dentro do container. Se alguém explorar uma falha no aplicativo, ganha esse poder, e alguns erros de configuração permitem escapar do container e atingir o hospedeiro. Existe ainda o modo privilegiado, que remove boa parte do isolamento. Defesas: rodar como usuário comum, sem privilégios extras; remover capacidades desnecessárias; deixar o sistema de arquivos do container somente para leitura quando possível; nunca usar o modo privilegiado sem uma necessidade comprovada e revisada.',
            'Dockerfile (trecho):\nUSER app   # roda como usuário comum, não como root'
          ),
          sl(
            'Segredos e rede',
            'Segredos (senhas, tokens, chaves) não devem ser gravados na imagem nem passados por variáveis visíveis a qualquer um; use o mecanismo de segredos da plataforma, ou um cofre, e restrinja quem lê. Quanto à rede, em Kubernetes todos os containers costumam poder conversar entre si por padrão: se um for comprometido, o atacante circula livremente. A defesa é a segmentação (já vista) via políticas de rede: liberar apenas as conexões necessárias (por exemplo, o front-end fala com a API e a API fala com o banco; o front-end não fala com o banco).'
          ),
          sl(
            'Scanner de imagem e CI',
            'Scanner de imagem é uma ferramenta que examina as camadas de uma imagem e compara os pacotes instalados com bases de vulnerabilidades conhecidas, apontando o que precisa de correção. Deve rodar no pipeline antes de a imagem ir para produção e também periodicamente, pois novas vulnerabilidades surgem depois. O scanner não encontra tudo: falhas de lógica do seu aplicativo ou configuração insegura exigem outras verificações. Erro comum: ignorar todos os achados por serem muitos; priorize os críticos e os que estão realmente expostos.'
          ),
          sl(
            'Visão geral em Kubernetes',
            'Pontos de atenção em Kubernetes: controle de acesso por papéis (RBAC, Role-Based Access Control), dando a cada pessoa e serviço só o necessário; proteção da API do cluster, que é o painel de controle e nunca deve ficar exposta sem autenticação; políticas que impeçam containers privilegiados; segredos protegidos; registros de auditoria ativados; e atualizações regulares do cluster. Uma configuração padrão não é necessariamente segura: leia as recomendações de endurecimento da própria plataforma.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que é uma imagem de container?', 'c', [
          'Um servidor físico dedicado onde cada container roda isolado dos demais',
          'Uma captura de tela do sistema, usada para documentação',
          'O molde, com aplicativo e dependências, a partir do qual os containers são criados',
          'O orquestrador responsável por reiniciar containers que falham em vários servidores'
        ], 'A imagem é o molde de um container. O orquestrador, como o Kubernetes, é outra coisa, e a imagem não é um servidor físico.'),
        mcq('q2', 'Por que usar a etiqueta latest em imagens de produção é um risco?', 'b', [
          'Ela impede que a imagem seja examinada por scanners, que só leem versões numeradas manualmente',
          'Ela pode apontar para outra versão sem aviso, e o comportamento muda sem controle',
          'Ela faz o container rodar mais devagar por usar a versão mais antiga disponível',
          'Ela só funciona em ambiente de desenvolvimento e é bloqueada pelo orquestrador em produção'
        ], 'A etiqueta latest se move para novas versões, tornando o ambiente imprevisível. Scanners a leem normalmente, e ela não aponta para a versão mais antiga.'),
        mcq('q3', 'Um container é executado como root e em modo privilegiado. Qual o problema?', 'a', [
          'Uma falha no aplicativo pode dar controle amplo e facilitar o acesso ao hospedeiro',
          'O container consome mais memória, o que aumenta a conta de nuvem sem afetar a segurança',
          'O container deixa de conseguir se conectar à rede interna do cluster',
          'Problema algum, porque o isolamento do container é completo mesmo com privilégios elevados'
        ], 'Privilégios elevados quebram parte do isolamento, e quem explorar uma falha herda esse poder. O isolamento não é completo nessa configuração.'),
        fill('q4', 'Complete com o nome do usuário de poder total que containers não devem usar para rodar aplicativos.', 'Boa prática: não executar o aplicativo como ___ dentro do container', ['root'], 'Rodar como root amplia o estrago de uma exploração; prefira um usuário comum.'),
        mcq('q5', 'Num cluster sem políticas de rede, o container do front-end foi comprometido. O que isso permite?', 'd', [
          'Nada, pois containers de front-end não têm acesso à rede do cluster',
          'Apagar automaticamente todas as imagens do repositório de imagens da empresa, já que o front-end tem permissão de administrador sobre o registro',
          'Desligar o hospedeiro físico, pois todo container comprometido controla o hardware',
          'Tentar conversar com outros containers, inclusive o banco de dados, por livre circulação interna'
        ], 'Sem políticas de rede, a circulação interna costuma ser livre. Segmentar limita esse movimento lateral. Não há controle do hardware nem acesso ao repositório de imagens por padrão.'),
        mcq('q6', 'Qual o papel do scanner de imagens no pipeline?', 'b', [
          'Garantir que o aplicativo está livre de qualquer falha de lógica de negócio, mesmo as que dependem de decisões de design',
          'Comparar os pacotes da imagem com vulnerabilidades conhecidas antes da publicação',
          'Substituir a revisão de código e o teste de segurança do aplicativo',
          'Criptografar os segredos usados pela aplicação durante a execução'
        ], 'O scanner cruza componentes com bases de vulnerabilidades. Não detecta falhas de lógica, não substitui revisão e não criptografa segredos.'),
        mcq('q7', 'Qual configuração do cluster Kubernetes merece prioridade de proteção?', 'c', [
          'A cor do painel de monitoramento usado pelos operadores',
          'O nome dos containers, que deve ser sigiloso para impedir descoberta',
          'A API do cluster, que deve exigir autenticação e não ficar exposta à internet',
          'O tamanho das imagens, que deve ser o maior possível para incluir as ferramentas de depuração'
        ], 'A API do cluster controla tudo; se exposta sem autenticação, entrega o cluster. As outras opções são irrelevantes ou contrárias à boa prática (imagens menores são melhores).'),
        fill('q8', 'Complete com a sigla do controle de acesso baseado em papéis do Kubernetes.', '___ = Role-Based Access Control (permissões por papéis)', ['rbac'], 'RBAC concede permissões a papéis, aplicando o privilégio mínimo.')
      ]
    },
    {
      id: 'csi-26-devsecops-e-cadeia-de-suprimentos',
      title: 'DevSecOps e cadeia de suprimentos de software',
      goal: 'Entender como incluir segurança no pipeline (SAST, DAST, SCA), evitar segredos no repositório, controlar dependências e noções básicas de SBOM.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é DevSecOps',
            'DevOps une desenvolvimento e operação para entregar software com rapidez, usando automação. DevSecOps acrescenta segurança a esse fluxo, desde o início: em vez de um teste de segurança apenas no fim, há verificações automáticas a cada alteração. A ideia de "shift left" é deslocar a segurança para a esquerda da linha do tempo (para mais cedo), porque corrigir uma falha no começo é mais barato. O pipeline de integração contínua (CI/CD) é a esteira automática que compila, testa e publica o software, e é o lugar natural para essas verificações. Para a profundidade em vulnerabilidades web, veja o curso de OWASP.'
          ),
          sl(
            'SAST, DAST e SCA em conceito',
            'SAST (Static Application Security Testing) analisa o código-fonte sem executá-lo, procurando padrões perigosos; é rápido e roda cedo, mas pode gerar falsos positivos. DAST (Dynamic Application Security Testing) testa o aplicativo em execução, de fora, como um usuário mal-intencionado; encontra problemas de configuração e de comportamento, mas só vê o que consegue alcançar. SCA (Software Composition Analysis) examina as dependências (bibliotecas de terceiros) em busca de vulnerabilidades conhecidas e problemas de licença. Elas se complementam: cada uma vê um tipo de problema.',
            'SAST -> lê o código (parado)\nDAST -> testa o app rodando (de fora)\nSCA  -> confere as bibliotecas de terceiros'
          ),
          sl(
            'Segredos no repositório',
            'Um dos erros mais comuns é commitar uma senha, token ou chave num repositório. Mesmo apagando depois, o histórico do controle de versão guarda o conteúdo, e em repositórios públicos robôs vasculham tudo em minutos. Defesas: nunca colocar segredos no código; ler de variáveis de ambiente ou de um cofre; usar ferramentas de varredura de segredos no commit e no pipeline; manter arquivos de configuração local fora do versionamento (por exemplo, listados no .gitignore); e, ao vazar, revogar o segredo, pois remover do histórico não basta.'
          ),
          sl(
            'Dependências e cadeia de suprimentos',
            'Cadeia de suprimentos de software é tudo o que entra no seu produto além do código que você escreveu: bibliotecas, imagens, ferramentas de build e serviços. Ataques à cadeia miram esses elos: uma biblioteca popular adulterada, um pacote com nome parecido com o de outro conhecido (typosquatting) ou um pipeline comprometido. Defesas: manter inventário de dependências, fixar versões e usar arquivos de travamento (lockfiles), buscar pacotes em fontes confiáveis, revisar mudanças relevantes, atualizar com regularidade e limitar o poder do pipeline (acesso mínimo, aprovação de mudanças).'
          ),
          sl(
            'SBOM básico',
            'SBOM (Software Bill of Materials) é a lista de ingredientes de um software: todos os componentes e suas versões. Quando surge uma vulnerabilidade numa biblioteca, quem tem o SBOM responde em minutos à pergunta: eu uso isso, e onde? Sem ele, a busca é manual e lenta. O SBOM é gerado automaticamente no build e armazenado junto de cada versão. Não elimina o risco, mas dá visibilidade, que é o primeiro passo para gerenciar. Assim como a gestão de vulnerabilidades já vista, ele precisa estar atualizado para ser útil.'
          ),
          sl(
            'Protegendo o próprio pipeline',
            'O pipeline tem credenciais poderosas (publicar em produção, acessar nuvem), por isso é alvo. Cuidados: contas e tokens do pipeline com privilégio mínimo e validade curta; segredos guardados em cofre e não em texto aberto; revisão obrigatória de mudanças na configuração do pipeline; separação entre ambientes de teste e produção; registro de auditoria de quem alterou e publicou o quê; e uso de artefatos assinados. Erro comum: tratar o servidor de CI como "infraestrutura interna sem risco".'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que significa deslocar a segurança "para a esquerda" (shift left)?', 'd', [
          'Mover a equipe de segurança para um escritório separado, longe do time de desenvolvimento',
          'Fazer os testes de segurança só depois da publicação, quando o uso real revela as falhas',
          'Retirar a segurança do pipeline para acelerar as entregas de novas versões',
          'Verificar segurança mais cedo no ciclo de desenvolvimento, quando corrigir é mais barato'
        ], 'Shift left é antecipar verificações. Deixar para depois da publicação ou retirar do pipeline é o oposto.'),
        mcq('q2', 'Qual técnica analisa o código-fonte sem executá-lo?', 'c', [
          'DAST',
          'SCA',
          'SAST',
          'CSPM'
        ], 'SAST lê o código parado. DAST testa o aplicativo rodando, SCA examina dependências e CSPM é voltado para configurações de nuvem.'),
        mcq('q3', 'Uma biblioteca de terceiros usada pelo projeto recebeu um alerta de vulnerabilidade conhecida. Qual verificação a detectaria no pipeline?', 'b', [
          'SAST, que só avalia o código escrito pela equipe e ignora o que veio de fora',
          'SCA, que compara as dependências com bases de vulnerabilidades',
          'Um teste de desempenho, que mede o tempo de resposta do aplicativo',
          'Uma revisão de estilo de código, que padroniza espaços e nomes de variáveis'
        ], 'SCA é feita para dependências. SAST foca no código próprio, e desempenho e estilo não tratam de vulnerabilidades.'),
        fill('q4', 'Complete com a sigla da lista de ingredientes de um software, com componentes e versões.', '___ = Software Bill of Materials', ['sbom'], 'O SBOM lista componentes e versões, facilitando saber onde uma biblioteca vulnerável é usada.'),
        mcq('q5', 'Uma pessoa commitou sem querer um token de acesso e depois apagou o arquivo no commit seguinte. O que fazer?', 'a', [
          'Revogar o token e gerar outro, pois o histórico ainda contém o valor',
          'Nada, porque apagar o arquivo remove o token de todas as versões anteriores',
          'Mudar o nome do projeto para que ninguém encontre o repositório',
          'Reduzir o número de colaboradores e manter o mesmo token, já que menos pessoas o verão'
        ], 'O histórico guarda o conteúdo antigo e o token pode ter sido copiado. Só a revogação elimina o risco; as outras ações não invalidam a credencial.'),
        mcq('q6', 'Qual prática reduz o risco de typosquatting em dependências?', 'a', [
          'Conferir o nome exato do pacote e baixar de fontes confiáveis, com versões fixadas',
          'Instalar qualquer pacote cujo nome seja parecido, porque o gerenciador escolhe o correto',
          'Atualizar às cegas todas as dependências para a versão mais recente diariamente',
          'Copiar pacotes de fóruns, já que o código aberto tem mais olhos revisando'
        ], 'Typosquatting explora nomes parecidos; conferir nome, origem e versões reduz o risco. Instalação às cegas e cópias de fóruns aumentam a exposição.'),
        mcq('q7', 'Por que o servidor de CI/CD precisa de proteção reforçada?', 'b', [
          'Ele armazena arquivos temporários e, por isso, comprometê-lo não causa dano relevante',
          'Ele guarda credenciais poderosas e pode publicar código em produção, sendo alvo atraente',
          'Ele é a única máquina da empresa que acessa a internet e precisa de proteção contra spam',
          'Ele foi projetado para ser imune a ataques e só precisa de backup'
        ], 'O pipeline concentra acessos e publica software; comprometê-lo contamina a produção. Não é inofensivo, nem o único com internet, nem imune.'),
        fill('q8', 'Complete com o arquivo que lista o que o controle de versão deve ignorar, como arquivos locais com segredos.', 'Arquivo ___ evita versionar arquivos de configuração local', ['.gitignore', 'gitignore'], 'O .gitignore informa ao Git quais arquivos não devem ser rastreados.')
      ]
    },
    {
      id: 'csi-27-dlp-e-classificacao-de-dados',
      title: 'DLP e classificação de dados',
      goal: 'Entender inventário e classificação de dados, rotulagem, DLP, mascaramento, minimização e descarte seguro.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Primeiro: saber o que você tem',
            'Não dá para proteger o que não se conhece. Inventário de dados é o levantamento de quais dados a organização possui, onde ficam (sistemas, nuvem, planilhas, notebooks), quem é o responsável e para que são usados. Exemplo: o RH guarda currículos e dados de folha, o comercial guarda dados de clientes, e cópias acabam em e-mails e pastas pessoais. Erro comum: proteger apenas o banco de dados principal e esquecer as planilhas exportadas que circulam por e-mail. O inventário é a base para classificar, aplicar a LGPD e responder a incidentes.'
          ),
          sl(
            'Classificação de dados',
            'Classificar é atribuir um nível de sensibilidade a cada tipo de dado, para aplicar proteção proporcional. Um esquema comum tem quatro níveis: público (pode ser divulgado, como o conteúdo do site), interno (uso da empresa, sem grande dano se vazar, como um comunicado interno), confidencial (vazamento causa dano real, como contratos e dados de clientes) e restrito (dano grave, como dados pessoais sensíveis, segredos industriais e credenciais). Cada nível define regras: quem acessa, se precisa de criptografia, se pode sair da empresa. O dono do dado, e não a TI, decide a classificação.',
            'Público      -> site, material de divulgação\nInterno      -> comunicados da empresa\nConfidencial -> contratos, dados de clientes\nRestrito     -> dados sensíveis, segredos, credenciais'
          ),
          sl(
            'Rotulagem',
            'Rotular é marcar o dado com seu nível: no cabeçalho de um documento, nos metadados de um arquivo, no assunto de um e-mail ou em etiquetas aplicadas por ferramentas. O rótulo avisa as pessoas ("isto é confidencial") e permite que sistemas apliquem regras automáticas, como bloquear o envio externo de documentos restritos. Sem rótulo, a classificação existe só na teoria. Erro comum: criar muitos níveis complexos que ninguém lembra; prefira poucos níveis, claros e com exemplos.'
          ),
          sl(
            'DLP: prevenção de perda de dados',
            'DLP (Data Loss Prevention) é um conjunto de controles que detecta e impede a saída indevida de dados. Examina e-mails, uploads para a web, cópias para pen drives e impressões, procurando padrões como números de documentos ou o rótulo confidencial, e então pode alertar, pedir justificativa ou bloquear. Funciona em pontos de rede, nos computadores e na nuvem. Limitações: gera falsos positivos, não vê dados cifrados por terceiros e não impede quem fotografa a tela. Por isso, deve vir junto com treinamento e cultura. Como monitora conteúdo, precisa de base legal, transparência e proporcionalidade (LGPD).'
          ),
          sl(
            'Mascaramento, anonimização e minimização',
            'Mascaramento esconde parte do dado: mostrar apenas os últimos dígitos de um documento, por exemplo ***.***.***-12 (valor fictício). Pseudonimização troca o identificador por um código, mantendo uma tabela de correspondência separada e protegida. Anonimização remove a possibilidade de identificar a pessoa por meios razoáveis, e dados realmente anonimizados saem do alcance da LGPD, mas é difícil de garantir. Minimização é coletar e guardar apenas o necessário: o dado que não existe não pode vazar. Em ambientes de teste, use dados fictícios ou mascarados, nunca cópias de produção.'
          ),
          sl(
            'Retenção e descarte',
            'Todo dado deve ter prazo de guarda, definido por finalidade e por exigências legais. Passado o prazo, descarte de forma segura: apagar de verdade (e não apenas mover para a lixeira), sanitizar discos e mídias antes de reutilizar ou doar, destruir fisicamente o que não pode ser reaproveitado e tratar também backups e cópias. Registre o descarte. Erro comum: guardar tudo para sempre "por precaução", ampliando o dano de qualquer vazamento. Consulte o jurídico para prazos legais específicos; este curso não os define.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual a primeira etapa para proteger bem os dados de uma organização?', 'd', [
          'Comprar uma ferramenta de DLP e ativar os bloqueios disponíveis imediatamente',
          'Criptografar os arquivos com a mesma chave para simplificar o processo de gestão',
          'Proibir o uso de e-mail para evitar qualquer vazamento por mensagem',
          'Descobrir quais dados existem, onde ficam e quem responde por eles'
        ], 'Sem inventário, não se sabe o que proteger, nem com qual intensidade. Ferramentas e criptografia ao acaso não resolvem sem esse conhecimento.'),
        mcq('q2', 'Quem deve, em princípio, definir o nível de classificação de um dado?', 'c', [
          'A equipe de infraestrutura, que administra os servidores onde o dado fica guardado',
          'O fornecedor da ferramenta de backup, que conhece o tamanho dos arquivos',
          'O dono do dado, ou seja, a área responsável pelo seu uso e pelo seu impacto',
          'O próprio usuário que abriu o arquivo, conforme seu humor e a pressa do dia'
        ], 'O dono conhece o valor e o impacto do dado. A TI aplica os controles, mas não conhece o negócio de cada informação.'),
        mcq('q3', 'Um e-mail com uma planilha de clientes marcada como Confidencial está sendo enviado a um endereço externo, e a DLP o bloqueia. Como interpretar?', 'a', [
          'A rotulagem e a DLP trabalharam juntas, aplicando a regra de que esse nível não sai da empresa',
          'A DLP falhou, pois dados de clientes podem ser enviados a qualquer destinatário',
          'A planilha foi apagada permanentemente dos servidores pela ferramenta',
          'O bloqueio ocorreu por tamanho do arquivo e nada tem a ver com a classificação, já que a ferramenta ignora rótulos de documentos'
        ], 'O rótulo permite a regra automática de bloqueio de envio externo. A DLP não apaga o arquivo e o motivo aqui é o nível de classificação.'),
        fill('q4', 'Complete com a sigla da prevenção contra a saída indevida de dados.', '___ = Data Loss Prevention', ['dlp'], 'DLP detecta e bloqueia a saída indevida de dados por e-mail, web, mídias e outros caminhos.'),
        mcq('q5', 'Qual exemplo representa mascaramento de dados?', 'c', [
          'Apagar um banco de dados inteiro ao fim do ano',
          'Enviar o mesmo arquivo por três canais diferentes para garantir entrega',
          'Exibir um documento fictício como ***.***.***-12 na tela de atendimento',
          'Guardar uma cópia do banco em outra cidade para reduzir o risco de perda'
        ], 'Mascaramento esconde parte do dado na apresentação. Apagar, duplicar ou replicar são outras operações.'),
        mcq('q6', 'Por que não é boa prática usar uma cópia completa da base de produção no ambiente de testes?', 'd', [
          'Porque ambientes de teste não aceitam bancos de dados grandes e travam durante execução, o que inviabiliza qualquer teste de carga',
          'Porque a LGPD proíbe qualquer tipo de teste de software em empresas brasileiras',
          'Porque a cópia perde a estrutura das tabelas durante o transporte para o outro ambiente',
          'Os dados reais de pessoas ficariam expostos a mais gente e em ambientes menos protegidos'
        ], 'Ambientes de teste costumam ter menos controle, então dados reais lá aumentam a exposição. A LGPD não proíbe testes, e a cópia pode manter a estrutura normalmente.'),
        mcq('q7', 'Qual atitude está de acordo com retenção e descarte seguro?', 'b', [
          'Guardar os dados por tempo indeterminado, pois um dia podem ser úteis',
          'Definir prazos de guarda e sanitizar ou destruir mídias ao fim, registrando o descarte',
          'Apagar arquivos arrastando-os para a lixeira e considerar a mídia pronta para ser doada',
          'Descartar os servidores, pois notebooks e pen drives não guardam informações relevantes'
        ], 'Retenção com prazo e descarte seguro reduzem o dano de vazamentos. Lixeira não elimina o dado, e todas as mídias podem guardar informações.'),
        fill('q8', 'Complete com o princípio que manda coletar e guardar apenas o necessário.', 'Princípio da ___: coletar e guardar apenas o necessário', ['minimização', 'minimizacao', 'necessidade'], 'A minimização (ou necessidade) reduz o volume de dados expostos em caso de incidente.')
      ]
    },
    {
      id: 'csi-28-lgpd-aplicada-seguranca',
      title: 'LGPD aplicada à segurança',
      goal: 'Entender, em visão geral, bases legais, princípios de segurança e prevenção, papel do DPO, RIPD, incidentes e comunicação, e medidas técnicas e administrativas.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Ressalva e visão geral',
            'A LGPD (Lei Geral de Proteção de Dados, Lei 13.709/2018) regula o tratamento de dados pessoais no Brasil. Dado pessoal é qualquer informação relacionada a pessoa natural identificada ou identificável (nome, CPF, e-mail, endereço IP em certos contextos). Tratamento é toda operação: coletar, armazenar, usar, compartilhar, apagar. Existem dados pessoais sensíveis, como saúde e origem racial, com proteção mais forte. Este conteúdo é uma visão geral técnica para profissionais de segurança e não substitui orientação jurídica: dúvidas sobre aplicação devem ir ao jurídico ou ao encarregado.'
          ),
          sl(
            'Bases legais em visão geral',
            'Todo tratamento precisa de uma base legal, isto é, uma justificativa prevista na lei. Exemplos de bases: consentimento da pessoa, cumprimento de obrigação legal ou regulatória, execução de contrato, proteção da vida, legítimo interesse do controlador e outras previstas na lei. O consentimento não é a única base, nem a mais conveniente em todos os casos. Para segurança, importa saber que existe uma finalidade registrada: você só pode usar o dado para o que foi informado. Erro comum: coletar dados "porque pode ser útil depois". A escolha da base cabe ao jurídico em conjunto com a área responsável.'
          ),
          sl(
            'Princípios ligados à segurança',
            'A lei lista princípios, entre eles: finalidade (usar para um propósito legítimo e informado), adequação, necessidade (só o mínimo), livre acesso, qualidade dos dados, transparência, segurança, prevenção e responsabilização e prestação de contas. Segurança: adotar medidas técnicas e administrativas aptas a proteger os dados de acessos não autorizados e de situações acidentais ou ilícitas de destruição, perda, alteração ou vazamento. Prevenção: agir para evitar danos. Responsabilização: poder demonstrar que as medidas foram adotadas, por isso registre e documente. Você já aplica isso quando usa privilégio mínimo, criptografia, logs e treinamento.'
          ),
          sl(
            'DPO e RIPD',
            'O controlador é quem decide sobre o tratamento; o operador trata os dados em nome do controlador. O encarregado, popularmente chamado de DPO (Data Protection Officer), é a pessoa indicada pelo controlador para ser canal de comunicação entre a organização, os titulares (as pessoas a quem os dados se referem) e a autoridade nacional (ANPD). O RIPD (Relatório de Impacto à Proteção de Dados Pessoais) documenta processos de tratamento que podem gerar risco às pessoas, os riscos identificados e as medidas para reduzi-los. É útil, por exemplo, antes de lançar um sistema novo que trate dados sensíveis em larga escala. A necessidade de elaborá-lo em cada caso é matéria para análise jurídica.'
          ),
          sl(
            'Incidente de segurança e comunicação',
            'Incidente de segurança com dados pessoais é um evento que causa acesso não autorizado, perda, alteração, destruição ou vazamento. Quando o incidente puder acarretar risco ou dano relevante aos titulares, a lei prevê a comunicação à ANPD e aos titulares, com informações como natureza dos dados, medidas adotadas e riscos. Prazos e formato são definidos pela autoridade e podem mudar: consulte a regulamentação vigente com o jurídico, sem decorar números. Para o time técnico, o essencial é detectar rápido, conter, registrar tudo (linha do tempo, dados afetados, quantas pessoas) e acionar imediatamente o encarregado e o jurídico, seguindo o plano de resposta a incidentes visto antes.'
          ),
          sl(
            'Medidas técnicas e administrativas',
            'Medidas técnicas: controle de acesso e MFA, criptografia em trânsito e em repouso, registros de acesso, backups, gestão de vulnerabilidades, segmentação, pseudonimização e mascaramento. Medidas administrativas: política de privacidade e de segurança, treinamentos, contratos com cláusulas de proteção de dados com fornecedores, inventário de dados, processo para atender pedidos dos titulares e plano de resposta a incidentes. Uma não substitui a outra: criptografia sem política de acesso, ou política sem controle técnico, deixa brechas. A segurança ajuda a cumprir a lei, mas conformidade exige também transparência, base legal e respeito aos direitos dos titulares.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual afirmação sobre bases legais da LGPD é correta?', 'd', [
          'O consentimento é a única base legal possível para qualquer tratamento de dados pessoais',
          'Bases legais só são necessárias para dados sensíveis, e não para dados comuns como nome e e-mail',
          'Basta a empresa decidir internamente a base mais conveniente, sem relação com a finalidade informada',
          'Todo tratamento precisa de uma base legal, e o consentimento é apenas uma das possíveis'
        ], 'A LGPD prevê várias bases, e todo tratamento precisa de uma. As outras opções limitam ou dispensam indevidamente a necessidade da base.'),
        mcq('q2', 'Uma equipe quer reaproveitar a lista de e-mails de clientes, coletada para emitir notas fiscais, em uma campanha de marketing não prevista. Qual princípio está em jogo?', 'a', [
          'Finalidade: o uso deve respeitar o propósito informado na coleta',
          'Disponibilidade: a lista precisa estar acessível aos times de marketing a qualquer momento',
          'Qualidade: a lista deve ter o maior número possível de e-mails cadastrados',
          'Transparência de código: o marketing deve publicar o código-fonte do seu sistema'
        ], 'Usar dados para finalidade diferente da informada fere o princípio da finalidade. Os demais não tratam desse problema.'),
        mcq('q3', 'Qual a função principal do encarregado (DPO)?', 'c', [
          'Administrar pessoalmente os servidores e firewalls da empresa',
          'Julgar sozinho se a empresa será multada ou não pela autoridade',
          'Servir de canal entre a organização, os titulares e a ANPD',
          'Programar as funções de criptografia usadas nos aplicativos'
        ], 'O encarregado é o ponto de comunicação com titulares e autoridade. Não administra a infraestrutura, não julga penalidades e não programa criptografia.'),
        fill('q4', 'Complete com a sigla do relatório que documenta tratamentos de dados que podem gerar risco às pessoas.', '___ = Relatório de Impacto à Proteção de Dados Pessoais', ['ripd', 'dpia'], 'O RIPD (em inglês, DPIA) descreve riscos do tratamento e as medidas para reduzi-los.'),
        mcq('q5', 'Descobriu-se que um relatório com dados de clientes foi enviado ao destinatário errado. O que o time técnico deve fazer?', 'b', [
          'Aguardar alguns meses para ver se alguém reclama antes de falar com qualquer pessoa, para não alarmar a diretoria',
          'Conter, registrar os fatos e acionar logo o encarregado e o jurídico para avaliar a comunicação',
          'Apagar os registros do ocorrido para evitar que sirvam de prova contra a empresa',
          'Comunicar aos colegas, de modo informal, nas redes sociais da empresa'
        ], 'Resposta rápida e documentada, com o encarregado e o jurídico envolvidos, é o caminho. Esperar, apagar registros ou comentar informalmente piora a situação e fere a responsabilização.'),
        mcq('q6', 'Qual item é uma medida ADMINISTRATIVA, e não técnica?', 'c', [
          'Criptografia dos dados armazenados nos servidores e nos backups da empresa',
          'Controle de acesso com MFA nas aplicações',
          'Treinamento periódico dos funcionários sobre tratamento de dados',
          'Geração de logs de acesso ao banco de dados'
        ], 'Treinamento é uma medida organizacional. Criptografia, MFA e logs são controles técnicos.'),
        mcq('q7', 'Por que a pseudonimização é útil na proteção de dados pessoais?', 'd', [
          'Garante que os dados deixam de ser pessoais para qualquer finalidade e saem da LGPD, pois o código substitui o nome de cada pessoa por um número',
          'Elimina a necessidade de controle de acesso aos dados do sistema',
          'Impede que a organização consiga voltar a identificar qualquer titular em qualquer situação',
          'Reduz a exposição ao trocar identificadores por códigos, mantendo a tabela de correspondência protegida à parte'
        ], 'Pseudonimizar reduz risco, mas a reidentificação ainda é possível com a tabela separada, então os dados continuam sendo pessoais e exigem controles.'),
        fill('q8', 'Complete com o nome dado às pessoas a quem os dados pessoais se referem.', 'Os ___ de dados são as pessoas a quem os dados se referem', ['titulares', 'titular'], 'Titular é a pessoa natural a quem se referem os dados pessoais tratados.')
      ]
    },
    {
      id: 'csi-29-gestao-de-risco-metodologias',
      title: 'Gestão de risco: metodologias',
      goal: 'Aplicar avaliação qualitativa e quantitativa de risco (SLE, ALE), manter um registro de riscos, entender apetite, tratamento e risco residual.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é risco',
            'Risco é a possibilidade de uma ameaça explorar uma vulnerabilidade e causar impacto a um ativo. Ameaça é o que pode causar dano (um ransomware), vulnerabilidade é a fraqueza (um servidor sem correção), ativo é o que tem valor (o sistema de vendas) e impacto é a consequência (parada, perdas, multa). Risco combina probabilidade (quão provável) e impacto (quão grave). Exemplo: um servidor antigo e exposto, que guarda dados de clientes, tem probabilidade alta e impacto alto. Gerir risco é decidir, com informação, o que tratar primeiro, e não eliminar todo risco, o que é impossível.'
          ),
          sl(
            'Avaliação qualitativa',
            'Na avaliação qualitativa, probabilidade e impacto recebem níveis descritivos (baixo, médio, alto) ou notas de 1 a 5, e o cruzamento dos dois forma uma matriz de risco. Exemplo: probabilidade 4 e impacto 5 resultam em nível 20, entre os mais altos. Vantagem: rápida, simples e fácil de explicar. Limitação: subjetiva (duas pessoas podem dar notas diferentes) e não diz quanto dinheiro está em jogo. Dica: defina por escrito o que significa cada nota (por exemplo, impacto 5 = parada de mais de um dia), para reduzir a subjetividade.',
            'Risco = Probabilidade x Impacto\nProb. 4 x Impacto 5 = 20  (alto)\nProb. 2 x Impacto 2 = 4   (baixo)'
          ),
          sl(
            'Avaliação quantitativa: SLE e ALE',
            'A avaliação quantitativa expressa o risco em dinheiro. SLE (Single Loss Expectancy, perda esperada por evento) é o valor estimado de uma ocorrência: valor do ativo multiplicado pelo fator de exposição (a fração do ativo perdida, de 0 a 1). ARO (Annualized Rate of Occurrence) é quantas vezes por ano se espera o evento. ALE (Annualized Loss Expectancy, perda anual esperada) é SLE vezes ARO. Exemplo FICTÍCIO: ativo vale R$ 200.000, fator de exposição 0,5, então SLE = R$ 100.000. Se o evento ocorre uma vez a cada 4 anos, ARO = 0,25, e ALE = R$ 25.000 por ano. Se um controle custa R$ 10.000 por ano e reduz o ARO a 0,05, o novo ALE é R$ 5.000: economiza R$ 20.000 ao ano, gastando R$ 10.000. Vale a pena.',
            'SLE = 200.000 x 0,5      = R$ 100.000\nALE = 100.000 x 0,25     = R$ 25.000 / ano\nCom controle: 100.000 x 0,05 = R$ 5.000 / ano'
          ),
          sl(
            'Registro de riscos',
            'O registro de riscos (ou matriz de riscos) é a planilha ou sistema onde cada risco é documentado de modo padronizado: descrição, ativo afetado, ameaça e vulnerabilidade, probabilidade, impacto, nível, dono do risco, tratamento escolhido, prazo e status. O dono do risco é a pessoa com autoridade para decidir sobre ele, normalmente um gestor da área, e não necessariamente alguém da segurança. O registro precisa ser revisado periodicamente: riscos mudam, controles são implantados e novas ameaças surgem. Erro comum: preencher uma vez e engavetar.'
          ),
          sl(
            'Apetite e tratamento',
            'Apetite de risco é o quanto de risco a organização aceita assumir para atingir seus objetivos, definido pela direção. Riscos acima do limite precisam de tratamento. As opções clássicas: mitigar (reduzir probabilidade ou impacto com controles), transferir ou compartilhar (contratar seguro, terceirizar parte do risco, lembrando que a responsabilidade legal pelos dados costuma permanecer), evitar (deixar de fazer a atividade arriscada) e aceitar (assumir conscientemente, com registro e aprovação do dono). Aceitar não é ignorar: é uma decisão documentada.'
          ),
          sl(
            'Risco residual',
            'Risco inerente é o risco antes de qualquer controle; risco residual é o que sobra depois dos controles. Exemplo: o risco de fraude num sistema era 20; após MFA e monitoramento, caiu para 8. Esses 8 são o residual e precisam ser comparados ao apetite: se estiver dentro, aceita-se formalmente; se estiver acima, novo tratamento. O risco residual nunca chega a zero. Erro comum: considerar o problema encerrado só porque um controle foi comprado, sem verificar se ele está funcionando e se o residual ficou aceitável.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual combinação descreve melhor um risco de segurança?', 'b', [
          'Uma vulnerabilidade isolada, mesmo que não exista nenhuma ameaça nem nada de valor exposto',
          'Ameaça que explora uma vulnerabilidade de um ativo, com probabilidade e impacto',
          'O custo do antivírus, que representa a proteção adquirida pela empresa',
          'Qualquer incidente que já aconteceu, sem relação com o que pode acontecer futuramente'
        ], 'Risco combina ameaça, vulnerabilidade, ativo, probabilidade e impacto. As outras opções ignoram elementos do conceito.'),
        mcq('q2', 'Em uma matriz qualitativa, um risco tem probabilidade 3 e impacto 4. Qual o nível pela fórmula Probabilidade x Impacto?', 'a', [
          '12',
          '7',
          '34',
          '1'
        ], 'Multiplicando 3 x 4 obtém-se 12. A soma daria 7, e as outras opções não seguem a fórmula.'),
        mcq('q3', 'Um ativo vale R$ 80.000, o fator de exposição é 0,5 e o evento ocorre uma vez a cada 2 anos (ARO = 0,5). Qual o ALE (valores fictícios)?', 'd', [
          'R$ 40.000 por ano',
          'R$ 80.000 por ano',
          'R$ 10.000 por ano',
          'R$ 20.000 por ano'
        ], 'SLE = 80.000 x 0,5 = 40.000; ALE = 40.000 x 0,5 = 20.000. R$ 40.000 é só o SLE, e R$ 80.000 seria o valor total do ativo.'),
        fill('q4', 'Complete com a sigla do resultado de SLE x ARO.', '___ = SLE x ARO (perda anual esperada)', ['ale'], 'ALE é a perda anual esperada, obtida multiplicando a perda por evento pela frequência anual.'),
        mcq('q5', 'Uma empresa contrata um seguro cibernético para cobrir parte dos prejuízos de um possível vazamento. Qual tratamento é esse?', 'c', [
          'Evitar o risco, deixando de realizar a atividade que o gera',
          'Aceitar o risco formalmente, sem aplicar nenhuma medida adicional',
          'Transferir ou compartilhar o risco',
          'Eliminar o risco por completo, pois o prejuízo passa a ser zero'
        ], 'Seguro transfere parte do impacto financeiro. Não elimina o risco nem substitui as obrigações legais de proteger os dados.'),
        mcq('q6', 'Após implantar controles, o risco de um sistema caiu de 20 para 8. Qual é o 8?', 'b', [
          'O risco inerente, que é o valor anterior a qualquer controle',
          'O risco residual, que deve ser comparado ao apetite de risco',
          'O risco evitado, pois a atividade foi encerrada',
          'O ALE do sistema, medido em reais por ano'
        ], 'O que sobra depois dos controles é o risco residual. O inerente era 20, e o 8 não é um valor monetário nem indica que a atividade foi encerrada.'),
        mcq('q7', 'Quem normalmente deve ser o dono de um risco no registro de riscos?', 'a', [
          'Um gestor com autoridade para decidir sobre o ativo ou processo afetado',
          'Qualquer estagiário novo, para que aprenda sobre o processo',
          'O fornecedor de antivírus, que conhece as ameaças e as vulnerabilidades do ambiente',
          'Ninguém, para evitar atribuir responsabilidade a pessoas específicas'
        ], 'O dono precisa de autoridade para decidir sobre tratamento e aceite. Sem dono, o risco não tem quem o gerencie.'),
        fill('q8', 'Complete com o nome da fração do ativo que seria perdida em uma ocorrência (valor entre 0 e 1).', 'SLE = valor do ativo x fator de ___', ['exposição', 'exposicao'], 'O fator de exposição indica a fração do valor do ativo perdida num único evento.')
      ]
    },
    {
      id: 'csi-30-governanca-politicas-normas',
      title: 'Governança: políticas, normas e procedimentos',
      goal: 'Distinguir política, norma, procedimento e diretriz, entender a hierarquia e o ciclo de vida dos documentos e os papéis de CISO, DPO e donos de ativos.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que governança',
            'Governança de segurança é o conjunto de estruturas, papéis e regras que garante que a segurança esteja alinhada aos objetivos do negócio e que alguém responda por ela. Sem governança, cada área decide sozinha, as regras se contradizem e ninguém sabe a quem recorrer. Os documentos de governança dizem o que é esperado de todos. Eles precisam ser claros, aprovados pela direção e conhecidos pelas pessoas, pois uma política que ninguém leu não protege nada.'
          ),
          sl(
            'Política, norma, procedimento e diretriz',
            'Política: documento de alto nível, aprovado pela direção, que declara intenções e regras gerais (exemplo: informações da empresa devem ser protegidas contra acesso não autorizado). Norma (ou padrão): regras obrigatórias e mensuráveis que detalham a política (exemplo: senhas com no mínimo 14 caracteres e MFA para acesso remoto). Procedimento: passo a passo operacional de como executar uma tarefa (exemplo: como criar um usuário com aprovação). Diretriz (guideline): orientação recomendada, não obrigatória, com boas práticas (exemplo: sugestões para escolher uma frase-senha). Diferença chave: política e norma são obrigatórias; diretriz é recomendação.',
            'Política      -> o que e por quê (alto nível, obrigatória)\nNorma         -> regras mensuráveis (obrigatória)\nProcedimento  -> passo a passo\nDiretriz      -> recomendação'
          ),
          sl(
            'A hierarquia documental',
            'Os documentos formam uma pirâmide. No topo, a política, estável e que muda pouco. Abaixo, normas, que detalham requisitos e mudam com mais frequência. Na base, procedimentos e instruções de trabalho, os mais detalhados e mais mutáveis. Esse arranjo permite alterar um procedimento (porque um sistema mudou) sem refazer a política. Erro comum: colocar detalhes técnicos, como nomes de produtos e versões, dentro da política, tornando-a obsoleta em meses.'
          ),
          sl(
            'Ciclo de vida dos documentos',
            'Todo documento passa por um ciclo: elaboração (por quem conhece o assunto), revisão, aprovação (pela autoridade correta), publicação e comunicação (acessível a todos, com treinamento quando preciso), aplicação e verificação (auditoria e métricas), revisão periódica (por exemplo, anual, ou quando algo muda) e retirada quando perde a validade. Controle de versão, data de aprovação e dono do documento devem constar. Exceções às regras devem ser formalizadas: quem pediu, justificativa, risco, prazo e quem aprovou.'
          ),
          sl(
            'Papéis: CISO, DPO e donos',
            'CISO (Chief Information Security Officer) é o executivo responsável pelo programa de segurança da informação: define estratégia, orça, reporta à diretoria. O DPO (encarregado) cuida da comunicação sobre dados pessoais com titulares e ANPD e orienta sobre a LGPD. Os donos de ativos (ou de informação) são os gestores responsáveis por sistemas e dados do seu negócio: classificam, aprovam acessos e aceitam riscos. A equipe de TI e de segurança opera os controles, mas não decide sozinha o que é aceitável para o negócio. Todos os colaboradores têm responsabilidades, como seguir a política e relatar incidentes.'
          ),
          sl(
            'Fazendo a governança funcionar',
            'Para a governança funcionar: linguagem simples, com exemplos; poucos documentos, bem mantidos, são melhores que muitos desatualizados; apoio visível da liderança; comunicação e treinamento; consequências claras e justas para descumprimento; e verificação de conformidade. Atenção a situações reais: se uma norma é impossível de cumprir no dia a dia, as pessoas a contornam, o que gera risco oculto. Ouça quem executa antes de publicar regras.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual documento declara em alto nível as regras gerais de segurança, aprovado pela direção?', 'a', [
          'Política',
          'Procedimento',
          'Diretriz',
          'Registro de incidentes'
        ], 'A política é o documento de topo, aprovado pela direção. Procedimento é passo a passo, diretriz é recomendação e registro de incidentes é um histórico.'),
        mcq('q2', 'A regra "senhas com no mínimo 14 caracteres" é melhor classificada como:', 'b', [
          'Diretriz, pois é uma recomendação que cada pessoa pode ignorar sem consequência',
          'Norma, pois detalha a política com um requisito mensurável e obrigatório',
          'Política, pois tem um valor numérico e deve constar do documento de nível mais alto',
          'Procedimento, pois explica o passo a passo de como criar a senha no sistema'
        ], 'Normas contêm requisitos obrigatórios e mensuráveis. Diretriz é opcional; política é de alto nível; procedimento descreve as etapas de uma tarefa.'),
        mcq('q3', 'Qual diferença descreve corretamente norma e diretriz?', 'd', [
          'Norma é opcional; diretriz é obrigatória e auditada anualmente',
          'As duas são obrigatórias, mudando só o nome do departamento que as publica',
          'As duas são opcionais e servem como material de consulta',
          'Norma é obrigatória; diretriz é uma recomendação de boas práticas'
        ], 'Normas devem ser cumpridas; diretrizes orientam, sem obrigar. As outras alternativas invertem ou igualam os conceitos.'),
        fill('q4', 'Complete com o tipo de documento que descreve o passo a passo operacional de uma tarefa.', 'O ___ explica, passo a passo, como criar um usuário com aprovação', ['procedimento'], 'O procedimento detalha a execução de uma tarefa específica, sendo o nível mais operacional.'),
        mcq('q5', 'Por que não é recomendado colocar nomes de produtos e versões no texto da política?', 'c', [
          'A política precisa ser sigilosa e nomes de produtos são informação pública, o que tornaria o documento inútil',
          'A lei proíbe citar marcas em documentos internos de qualquer empresa',
          'A política ficaria obsoleta rapidamente, pois esses detalhes mudam com frequência',
          'Os produtos mudam de nome toda semana e isso invalida o orçamento do ano'
        ], 'Detalhes mutáveis pertencem a normas e procedimentos, que são revisados com mais frequência. Nenhuma lei proíbe citar produtos em documentos internos.'),
        mcq('q6', 'Quem normalmente aceita formalmente um risco residual de um sistema de vendas?', 'c', [
          'O estagiário de suporte, por estar mais próximo do usuário',
          'A equipe de limpeza, ao identificar problemas no ambiente físico',
          'O dono do ativo ou do processo, com a ciência da segurança',
          'O fornecedor do sistema, em nome da empresa cliente'
        ], 'A decisão de aceitar risco cabe a quem responde pelo negócio, o dono. Segurança aconselha, mas não decide sozinha.'),
        mcq('q7', 'Uma norma de segurança é tão trabalhosa que as equipes a contornam. Qual o problema mais provável?', 'b', [
          'A norma está funcionando perfeitamente, pois ninguém reclama oficialmente, e os atalhos são sinal de maturidade',
          'A norma foi publicada sem ouvir quem a executa, criando risco oculto por contorno',
          'A norma deveria ser removida da política e transformada em uma lei federal',
          'A norma só precisa de mais um treinamento, sem qualquer revisão do seu conteúdo'
        ], 'Regras impraticáveis são contornadas. Ouvir quem executa e ajustar a norma reduz o risco oculto. Ausência de reclamação formal não indica eficácia.'),
        fill('q8', 'Complete com a sigla do executivo responsável pelo programa de segurança da informação.', '___ = Chief Information Security Officer', ['ciso'], 'O CISO lidera o programa de segurança e reporta à direção.')
      ]
    },
    {
      id: 'csi-31-iso-27001-sgsi',
      title: 'ISO 27001 e o SGSI',
      goal: 'Entender, em nível conceitual, o que é um SGSI, seu escopo, o ciclo PDCA, a declaração de aplicabilidade, auditorias e certificação.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é a ISO/IEC 27001',
            'A ISO/IEC 27001 é uma norma internacional que especifica os requisitos para estabelecer, implementar, manter e melhorar continuamente um SGSI, Sistema de Gestão de Segurança da Informação. Um SGSI não é uma ferramenta: é um sistema de gestão, isto é, um conjunto de políticas, processos, papéis e controles gerenciado de forma contínua. A norma não diz qual firewall comprar; ela exige que a organização gerencie riscos e comprove que o faz. Esta lição é conceitual: para os requisitos exatos, consulte o texto oficial da norma, que é atualizado de tempos em tempos.'
          ),
          sl(
            'Escopo do SGSI',
            'Escopo define o que o SGSI cobre: quais unidades, processos, locais, sistemas e ativos, e quais ficam de fora, com justificativa. Por exemplo, uma empresa pode escolher certificar apenas o serviço de hospedagem de dados, e não o departamento administrativo. Um escopo muito pequeno pode não ter valor para clientes; um escopo grande demais é difícil de manter. Erro comum: definir o escopo sem considerar interfaces com outras áreas e com fornecedores que processam os dados.'
          ),
          sl(
            'Ciclo PDCA',
            'A melhoria contínua segue o PDCA. Plan (planejar): definir contexto, escopo, política, avaliar riscos e escolher tratamentos. Do (executar): implementar os controles e os processos planejados. Check (verificar): monitorar, medir e auditar. Act (agir): corrigir desvios e melhorar. Depois, o ciclo recomeça. A ideia central é que a segurança não é um projeto com data de fim, e sim uma rotina que se revisa. A liderança tem papel essencial: apoia, aloca recursos e analisa criticamente os resultados periodicamente.',
            'Plan  -> planejar (riscos, escopo, política)\nDo    -> executar os controles\nCheck -> verificar (medir, auditar)\nAct   -> agir (corrigir, melhorar)'
          ),
          sl(
            'Gestão de risco e declaração de aplicabilidade',
            'O SGSI parte da avaliação de riscos (como visto na lição de gestão de risco) para escolher controles. A norma traz um anexo com um catálogo de controles de referência, organizado por temas (organizacionais, pessoas, físicos e tecnológicos). A declaração de aplicabilidade (SoA, Statement of Applicability) é o documento que lista cada controle do catálogo, diz se é aplicável ou não, justifica a decisão e informa se está implementado. Ela liga riscos a controles e é um dos primeiros documentos que um auditor pede. Controle excluído precisa de justificativa real, e não de simples preferência.'
          ),
          sl(
            'Auditorias e melhoria',
            'Auditoria interna é feita pela própria organização, por pessoas independentes da área auditada, para verificar se o SGSI segue os requisitos e se funciona. Auditoria externa é feita por um organismo de certificação. Ao encontrar um desvio, registra-se uma não conformidade, que exige análise da causa raiz e ação corretiva com prazo. Observações menores viram oportunidades de melhoria. Evidências (registros, logs, atas, relatórios) são o que prova que o controle funciona: sem evidência, para o auditor, não aconteceu.'
          ),
          sl(
            'Certificação',
            'A certificação é o reconhecimento, por um organismo independente e acreditado, de que o SGSI no escopo definido atende à norma. Em termos gerais, há uma auditoria inicial em etapas, a emissão do certificado e auditorias de acompanhamento periódicas, com recertificação ao fim de um ciclo definido pelo organismo. A certificação não garante que a empresa nunca sofrerá incidentes; ela mostra que há gestão estruturada de riscos. Clientes e parceiros costumam pedi-la como sinal de confiança. Prazos e custos variam; consulte organismos acreditados.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que é um SGSI?', 'a', [
          'Um sistema de gestão com políticas, processos, papéis e controles, mantido de forma contínua',
          'Um software antivírus homologado que a norma exige nos computadores da empresa, com licença renovada ao ano',
          'Um certificado emitido uma única vez que dispensa qualquer revisão futura',
          'Uma lista de senhas padrão aprovadas para uso pelos colaboradores'
        ], 'SGSI é um sistema de gestão, não um software nem um certificado único. Exige operação e revisão contínuas.'),
        mcq('q2', 'Qual o objetivo de definir o escopo do SGSI?', 'd', [
          'Esconder dos auditores as áreas com problemas, para facilitar a aprovação',
          'Obrigar os países onde a empresa atua a adotar a mesma lei',
          'Reduzir o orçamento ao mínimo, eliminando a necessidade de avaliar riscos',
          'Delimitar o que está coberto, e o que está fora, com justificativa'
        ], 'O escopo define fronteiras claras e justificadas. Usar o escopo para esconder problemas é desvio de finalidade e não substitui a gestão de riscos.'),
        mcq('q3', 'No ciclo PDCA, qual etapa corresponde a medir, monitorar e auditar?', 'd', [
          'Plan',
          'Do',
          'Act',
          'Check'
        ], 'Check é a verificação. Plan planeja, Do executa e Act corrige e melhora.'),
        fill('q4', 'Complete com a sigla da declaração que lista controles, informa se são aplicáveis e justifica as decisões.', '___ = Statement of Applicability (declaração de aplicabilidade)', ['soa'], 'A SoA relaciona os controles do catálogo à realidade da organização, justificando inclusões e exclusões.'),
        mcq('q5', 'Uma empresa decide não aplicar um controle do catálogo e escreve na SoA: "não queremos". Qual o problema?', 'a', [
          'Falta justificativa baseada em risco, e o auditor provavelmente questionará',
          'Não há problema algum, pois a SoA dispensa justificativas',
          'A empresa passa a ser obrigada a aplicar os outros controles em dobro',
          'A decisão é válida porque, na norma, os controles são opcionais por definição'
        ], 'Exclusões devem ser justificadas com base na avaliação de riscos. Excluir sem motivo gera não conformidade. A SoA exige justificativas.'),
        mcq('q6', 'Na auditoria, o auditor pede registros que mostrem que o backup foi testado. O que isso ilustra?', 'b', [
          'Que o auditor desconfia pessoalmente da equipe, sem relação com a norma',
          'A importância de evidências para provar que o controle funciona',
          'Que a norma exige testes de backup toda semana, de forma universal',
          'Que a auditoria avalia a aparência dos documentos, e não a prática'
        ], 'Sem evidência, não há como demonstrar o funcionamento. A frequência concreta depende da análise de risco da própria empresa.'),
        mcq('q7', 'O que a certificação ISO 27001 NÃO garante?', 'c', [
          'Que existe um SGSI estruturado no escopo certificado',
          'Que um organismo independente avaliou a conformidade com a norma',
          'Que a organização nunca sofrerá um incidente de segurança',
          'Que há gestão de riscos documentada e revisada'
        ], 'A certificação atesta a existência de gestão estruturada, mas não elimina a possibilidade de incidentes.'),
        fill('q8', 'Complete com o nome da ocorrência registrada quando a auditoria encontra desvio em relação ao requisito.', 'Desvio encontrado na auditoria = não ___', ['conformidade'], 'Não conformidade é o registro de um desvio, que exige análise de causa e ação corretiva.')
      ]
    },
    {
      id: 'csi-32-conformidade-pci-sox-bacen',
      title: 'Conformidade: PCI DSS, SOX e regulação financeira',
      goal: 'Ter uma visão geral de PCI DSS, SOX e da regulação do setor financeiro brasileiro, e entender o papel de auditoria e evidências.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é conformidade',
            'Conformidade (compliance) é cumprir requisitos externos (leis, regulamentos, contratos) e internos (políticas). Estar em conformidade não é o mesmo que estar seguro: conformidade é um piso mínimo exigido, e segurança é a proteção real contra ameaças. Uma empresa pode passar numa auditoria e ainda sofrer um incidente; e uma empresa segura pode falhar por não ter documentado o que faz. O ideal é usar a conformidade como alavanca para a segurança, e não como um fim em si. Atenção: esta lição é uma visão geral e não substitui revisão por especialistas e pelo jurídico, pois as regras mudam e variam conforme o caso.'
          ),
          sl(
            'PCI DSS em visão geral',
            'PCI DSS (Payment Card Industry Data Security Standard) é um padrão criado pelas bandeiras de cartão para proteger dados de cartões de pagamento. Aplica-se a quem armazena, processa ou transmite dados de cartão: lojas, processadores, plataformas de pagamento. O padrão organiza requisitos em áreas como: redes seguras, proteção dos dados armazenados e em trânsito, gestão de vulnerabilidades, controle de acesso, monitoramento e testes regulares, e política de segurança. Uma ideia valiosa é reduzir o escopo: se a empresa não guarda nem toca nos números de cartão (usando um provedor de pagamento que cuida disso), há menos sistemas a proteger. O nível de exigência depende do volume de transações e do papel da empresa; consulte o texto vigente.'
          ),
          sl(
            'SOX em visão geral',
            'SOX (Lei Sarbanes-Oxley) é uma lei dos Estados Unidos criada para dar confiabilidade às demonstrações financeiras de empresas de capital aberto. Para a segurança, o ponto é que os sistemas que geram e armazenam informações financeiras precisam de controles internos confiáveis: controle de acesso, segregação de funções (quem cria um pagamento não é quem o aprova), controle de mudanças e registros. Aplica-se a empresas com ações listadas em bolsas americanas, inclusive subsidiárias estrangeiras. Se sua empresa está sujeita, a auditoria pedirá evidências desses controles.'
          ),
          sl(
            'Regulação do setor financeiro brasileiro',
            'Instituições financeiras no Brasil seguem normas do Banco Central e do Conselho Monetário Nacional, que incluem política de segurança cibernética, requisitos para contratação de serviços de nuvem e de terceiros, plano de continuidade e comunicação de incidentes relevantes. Os detalhes (números de resoluções, prazos, limites) mudam e precisam ser verificados nos textos vigentes, com apoio do jurídico e de especialistas de compliance. Para quem está começando, vale saber três ideias: há exigência formal de gestão de riscos cibernéticos, há obrigação de gerir fornecedores críticos e há deveres de reporte de incidentes às autoridades.'
          ),
          sl(
            'Auditoria e evidências',
            'Auditoria é a verificação independente do cumprimento de requisitos. O auditor não aceita apenas a palavra: pede evidências, isto é, provas objetivas e datadas de que o controle existe e funciona. Exemplos: relatório de revisão de acessos assinado, logs de aprovação de mudanças, resultados de testes de restauração de backup, atas de reunião e capturas de configuração. Boas práticas: gerar evidências como parte da rotina (e não correr atrás no último dia), guardá-las organizadas e com controle de acesso, e lembrar que evidências podem conter dados pessoais, o que exige cuidado com a LGPD.'
          ),
          sl(
            'Como se preparar sem sofrer',
            'Passos úteis: mapear quais requisitos se aplicam ao seu negócio, usar um conjunto único de controles que atenda a vários requisitos ao mesmo tempo (por exemplo, a revisão de acessos serve para várias normas), automatizar a coleta de evidências, nomear donos para cada controle, testar internamente antes da auditoria externa e tratar as não conformidades com ação corretiva e prazo. Evite maquiar evidências: além de antiético, pode gerar consequências legais graves. Em caso de dúvida regulatória, consulte um especialista.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual afirmação sobre conformidade e segurança é adequada?', 'c', [
          'Estar em conformidade garante que a empresa não sofrerá ataque, pois a auditoria elimina as ameaças, já que auditores testam os sistemas',
          'Segurança e conformidade são sinônimos e dispensam qualquer controle técnico adicional',
          'Conformidade é um mínimo exigido; segurança real exige proteger contra ameaças, indo além do cumprimento formal',
          'Conformidade só importa para empresas pequenas, que não possuem equipes de segurança'
        ], 'Conformidade é piso, não teto: uma empresa pode estar conforme e ainda ser atacada. Não são sinônimos.'),
        mcq('q2', 'A quem se aplica, em geral, o PCI DSS?', 'a', [
          'A quem armazena, processa ou transmite dados de cartões de pagamento',
          'A quem possui site com formulário de contato, mesmo sem aceitar pagamentos',
          'Aos bancos centrais, que emitem as moedas dos países',
          'A quem usa e-mail corporativo, independentemente de lidar com cartões'
        ], 'O PCI DSS cobre quem lida com dados de cartão. As outras opções estendem ou restringem indevidamente o escopo.'),
        mcq('q3', 'Uma loja virtual usa um provedor de pagamento que recebe os dados do cartão diretamente, sem passar por seus servidores. Qual benefício isso traz para a conformidade?', 'd', [
          'Elimina todas as obrigações de segurança da loja, inclusive proteger a conta de administrador',
          'Torna o PCI DSS aplicável ao provedor e a mais ninguém, por regra',
          'Dispensa a loja de qualquer auditoria futura',
          'Reduz o escopo, pois há menos sistemas da loja tocando em dados de cartão'
        ], 'Reduzir o escopo diminui o que precisa ser protegido e auditado. Ainda restam responsabilidades, como proteger a própria loja e o acesso administrativo.'),
        fill('q4', 'Complete com o princípio SOX segundo o qual quem cria um pagamento não deve ser a mesma pessoa que o aprova.', '___ de funções: quem cria o pagamento não o aprova', ['segregação', 'segregacao', 'separação', 'separacao'], 'A segregação de funções evita que uma única pessoa controle todas as etapas de um processo crítico.'),
        mcq('q5', 'Um auditor pede provas de que a revisão de acessos foi feita. Qual item serve como evidência?', 'b', [
          'A declaração verbal do administrador de que a revisão é feita',
          'Um relatório datado da revisão, com aprovação do gestor responsável',
          'Uma frase na política dizendo que revisões deveriam acontecer',
          'Um e-mail pedindo a alguém para fazer a revisão, sem retorno nem resultado'
        ], 'Evidência é prova objetiva e datada de que a ação aconteceu. Declarações e intenções não provam execução.'),
        mcq('q6', 'Faltando um dia para a auditoria, uma equipe quer criar registros retroativos de um controle que nunca foi executado. Qual a avaliação?', 'c', [
          'Prática aceitável, desde que os documentos tenham aparência profissional',
          'Estratégia recomendada, pois auditores raramente conferem datas',
          'Fraude de evidência, que traz risco ético e legal e deve ser evitada',
          'Procedimento padrão em toda auditoria, para acelerar a certificação'
        ], 'Maquiar evidências é antiético e pode gerar consequências legais. O correto é registrar a não conformidade e tratá-la.'),
        mcq('q7', 'Sobre regras do setor financeiro brasileiro, qual atitude é prudente para um profissional júnior?', 'b', [
          'Memorizar números de resoluções e prazos deste curso e aplicá-los sem conferir',
          'Verificar os textos vigentes com jurídico e compliance, pois detalhes mudam',
          'Ignorar as normas, pois só valem para grandes bancos',
          'Seguir o que um colega lembra, sem checar a fonte'
        ], 'Normas mudam e variam por caso; a fonte oficial e a revisão especializada são o caminho seguro.'),
        fill('q8', 'Complete com o termo para a prova objetiva e datada de que um controle existe e funciona.', 'O auditor pede ___ de que o controle funciona', ['evidências', 'evidencias', 'evidência', 'evidencia'], 'Evidências são registros objetivos que demonstram a execução e a eficácia do controle.')
      ]
    },
    {
      id: 'csi-33-continuidade-bcp-dr',
      title: 'Continuidade de negócios e recuperação de desastres',
      goal: 'Entender BIA, RTO, RPO, plano de continuidade, recuperação de desastres, testes e sites alternativos.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Continuidade e recuperação: dois conceitos',
            'Continuidade de negócios (BCP, Business Continuity Plan) é a capacidade da organização de manter as funções essenciais durante e depois de uma interrupção, seja um incêndio, um ransomware ou a queda de um fornecedor. Recuperação de desastres (DR, Disaster Recovery) é a parte técnica: restaurar sistemas e dados de TI. O BCP olha para o negócio inteiro (pessoas, locais, processos); o DR olha para a tecnologia. Um depende do outro: de nada adianta restaurar o sistema se ninguém sabe como atender clientes enquanto ele está fora.'
          ),
          sl(
            'BIA: análise de impacto no negócio',
            'BIA (Business Impact Analysis) identifica quais processos são críticos e qual o impacto de pará-los ao longo do tempo (perda financeira, multas, dano à reputação). É feita conversando com as áreas, e não só com a TI. Exemplo: o faturamento de uma loja virtual para por 2 horas, e o prejuízo é pequeno; para por 3 dias, e o prejuízo é severo. O BIA ordena as prioridades: o que precisa voltar primeiro. Erro comum: tratar todos os sistemas como igualmente críticos, o que torna a recuperação inviável e cara.'
          ),
          sl(
            'RTO e RPO',
            'RTO (Recovery Time Objective) é o tempo máximo tolerável para restaurar um processo após a interrupção. Responde: em quanto tempo precisamos estar de volta? RPO (Recovery Point Objective) é a quantidade máxima de dados que se aceita perder, medida em tempo. Responde: até que ponto no passado podemos voltar? Exemplo: com RPO de 1 hora, os backups ou a replicação precisam ocorrer ao menos a cada hora; se o desastre ocorrer às 15h, aceita-se perder dados a partir das 14h. Com RTO de 4 horas, o sistema deve voltar até as 19h. Metas menores custam mais.',
            'Desastre às 15h | RPO = 1h  -> perda máxima: dados após 14h\n                | RTO = 4h  -> sistema de volta até 19h'
          ),
          sl(
            'Plano de continuidade',
            'Um plano de continuidade escrito traz: papéis e responsabilidades (quem decide, quem comunica), contatos de emergência e fornecedores, critérios de acionamento (quando declarar a crise), procedimentos de recuperação por sistema, formas de operar em modo degradado (por exemplo, atender com planilhas ou papel) e o plano de comunicação com funcionários, clientes e autoridades. Deve estar acessível mesmo se os sistemas estiverem fora do ar: uma cópia impressa ou em local independente. Erro comum: guardar o plano num servidor que será justamente o afetado.'
          ),
          sl(
            'Recuperação de desastres e sites alternativos',
            'Estratégias de DR variam em custo e velocidade. Site frio: espaço e infraestrutura básica, onde tudo precisa ser montado (barato, lento). Site morno: equipamentos prontos, com dados desatualizados que precisam ser restaurados. Site quente: ambiente pronto e dados replicados quase em tempo real (caro, rápido). Na nuvem, pode-se criar o ambiente alternativo sob demanda. Lembre da regra 3-2-1 para backups: três cópias, em duas mídias diferentes, uma delas fora do local, e idealmente uma imutável, para resistir a ransomware. Backup que nunca foi testado não é backup.'
          ),
          sl(
            'Testes e manutenção',
            'Planos precisam de teste. Tipos: leitura de mesa (tabletop), em que a equipe discute um cenário sem tocar nos sistemas; teste de restauração, em que se recupera dados reais de backup para validar; simulação com failover, em que o ambiente alternativo assume de fato; e teste completo. Cada teste gera lições aprendidas e correções no plano. Revise o plano quando a empresa mudar (novo sistema, novo fornecedor, nova unidade) e ao menos periodicamente. Um plano não testado costuma falhar quando mais se precisa dele.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual a diferença entre BCP e DR?', 'a', [
          'BCP mantém o negócio funcionando de ponta a ponta; DR trata da recuperação técnica de sistemas e dados',
          'BCP trata de servidores; DR trata de pessoas e de comunicação com a imprensa, em planos que se mantêm separados',
          'São termos idênticos, usados indistintamente em qualquer organização',
          'BCP é um software de backup; DR é uma certificação para analistas'
        ], 'O BCP é amplo (pessoas, processos, locais); o DR é o componente de TI. Não são idênticos e nenhum dos dois é um software ou certificação.'),
        mcq('q2', 'O que o BIA busca identificar?', 'd', [
          'Quais funcionários merecem bônus por desempenho em segurança',
          'Quais vulnerabilidades técnicas existem em cada servidor, classificadas por gravidade e por exposição',
          'Qual fornecedor de nuvem tem o menor preço mensal de contrato',
          'Quais processos são críticos e o impacto de interrompê-los ao longo do tempo'
        ], 'O BIA mapeia criticidade e impacto para priorizar a recuperação. Não avalia desempenho de pessoas, vulnerabilidades técnicas ou preços.'),
        mcq('q3', 'Um sistema tem RPO de 2 horas e o último backup foi feito às 08h. O desastre ocorre às 11h. A meta de RPO foi atendida?', 'd', [
          'Sim, pois o RPO mede o tempo de restauração do sistema',
          'Sim, pois qualquer backup do mesmo dia já cumpre o RPO',
          'Não é possível dizer, pois o RPO não tem relação com a perda de dados, e sim com o desempenho dos servidores',
          'Não, pois o intervalo de 3 horas sem backup excede o máximo aceito de perda'
        ], 'RPO é a perda máxima de dados aceitável em tempo. Entre 08h e 11h passaram 3 horas, acima de 2. O tempo de restauração é o RTO.'),
        fill('q4', 'Complete com a sigla do tempo máximo tolerável para restaurar um processo após a interrupção.', '___ = Recovery Time Objective', ['rto'], 'O RTO define em quanto tempo o processo precisa estar de volta.'),
        mcq('q5', 'Qual site alternativo é o mais rápido para assumir, porém o mais caro?', 'b', [
          'Site frio',
          'Site quente',
          'Site morno',
          'Site em papel'
        ], 'O site quente tem ambiente pronto e dados replicados quase em tempo real, mas custa mais. O frio exige montagem total e é mais barato.'),
        mcq('q6', 'O plano de continuidade está salvo apenas no servidor de arquivos que foi criptografado por ransomware. Qual o problema?', 'a', [
          'O plano ficou inacessível justamente na crise; é preciso cópia em local independente',
          'Problema algum, pois o plano precisa existir e não precisa ser acessado',
          'O ransomware melhora o plano ao reescrevê-lo automaticamente, tornando-o mais atualizado que antes',
          'O plano agora vale depois de pagar o resgate aos criminosos'
        ], 'Planos devem ser acessíveis mesmo com sistemas fora do ar. Pagar resgate não é parte do plano nem restaura o acesso de forma garantida.'),
        mcq('q7', 'Por que testar a restauração do backup periodicamente?', 'c', [
          'Para gerar mais cópias e ocupar o espaço de armazenamento de propósito, testando a capacidade do disco',
          'Porque backups raramente falham, e o teste serve como formalidade',
          'Para confirmar que os dados realmente voltam e que o RTO e o RPO são viáveis',
          'Porque o teste elimina a necessidade de plano de continuidade'
        ], 'Backup não testado pode estar corrompido ou incompleto. O teste valida a prática. Backups podem falhar, e o teste não substitui o plano.'),
        fill('q8', 'Complete com a sigla do tempo, medido para trás, que indica a perda máxima de dados aceita.', '___ = Recovery Point Objective', ['rpo'], 'O RPO define até que ponto no passado se aceita perder dados.')
      ]
    },
    {
      id: 'csi-34-mobile-corporativo-mdm',
      title: 'Mobile corporativo, BYOD e MDM',
      goal: 'Entender BYOD, MDM e MAM, separação de perfis, apagamento remoto, privacidade do funcionário à luz da LGPD e política de uso.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que mobile é um desafio',
            'Celulares e tablets acessam e-mail, documentos e sistemas da empresa, mas são pequenos, perdem-se com facilidade e misturam vida pessoal e profissional. Riscos: perda ou roubo do aparelho, aplicativos maliciosos, redes Wi-Fi públicas inseguras, sistema operacional desatualizado e vazamento de dados por aplicativos pessoais. Como o aparelho é pessoal para muita gente, a segurança precisa ser equilibrada com a privacidade da pessoa.'
          ),
          sl(
            'BYOD, COPE e dispositivos corporativos',
            'BYOD (Bring Your Own Device) é quando o funcionário usa o próprio aparelho para trabalhar: reduz custo para a empresa, mas diminui o controle. COPE (Corporate-Owned, Personally Enabled) é quando a empresa fornece o aparelho e permite uso pessoal limitado. Também existem aparelhos totalmente corporativos, de uso exclusivo para o trabalho. Cada modelo tem trade-offs: mais controle significa menos privacidade para o usuário e mais custo. A escolha deve vir da avaliação de risco e da política da empresa.'
          ),
          sl(
            'MDM e MAM',
            'MDM (Mobile Device Management) é a gestão do aparelho inteiro: a empresa pode exigir senha ou biometria, criptografia, atualizações, bloquear aparelhos com modificações que removem proteções do sistema, instalar configurações de e-mail e Wi-Fi, e localizar ou apagar o aparelho. MAM (Mobile Application Management) gerencia apenas os aplicativos corporativos e seus dados, sem controlar o aparelho todo. Em BYOD, o MAM costuma ser mais adequado, por ser menos invasivo. Erro comum: exigir MDM completo em aparelhos pessoais sem informar claramente o que a empresa vê e controla.'
          ),
          sl(
            'Separação de perfis (containerização)',
            'Para separar o pessoal do profissional, aparelhos modernos permitem perfis de trabalho: uma área isolada com aplicativos e dados corporativos, protegida por regras próprias, enquanto o resto do aparelho fica sob controle do usuário. Assim, é possível proibir copiar texto do e-mail corporativo para aplicativos pessoais, exigir criptografia só na área de trabalho e apagar apenas esses dados ao desligamento do funcionário. A separação protege a empresa e a privacidade do indivíduo.'
          ),
          sl(
            'Apagamento remoto e perda do aparelho',
            'Se o aparelho é perdido ou roubado, o MDM permite bloquear e apagar remotamente. Há dois tipos: apagamento total (volta ao estado de fábrica; use em aparelhos corporativos) e apagamento seletivo (remove só os dados corporativos; use em BYOD, para não destruir fotos e dados pessoais). O funcionário deve reportar a perda imediatamente. O processo precisa estar combinado em política, e o funcionário deve saber disso antes de registrar o aparelho. Criptografia ativada no aparelho reduz o risco antes mesmo do apagamento.'
          ),
          sl(
            'Privacidade do funcionário e política de uso',
            'A LGPD protege também os dados dos funcionários. A empresa deve limitar a coleta ao necessário: por exemplo, em BYOD, não há motivo para ver fotos, mensagens pessoais ou histórico de navegação particular, e a localização contínua só deve ser coletada se houver justificativa e transparência. A política de uso aceitável (e a de BYOD) deve explicar de forma clara: o que a empresa pode ver e fazer, o que não pode, requisitos mínimos (senha, atualizações), consequências e o que acontece ao fim do contrato. Consulte jurídico e RH ao desenhá-la; este conteúdo é uma visão geral.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual a principal diferença entre MDM e MAM?', 'c', [
          'O MDM serve só para tablets; o MAM serve só para celulares',
          'O MDM gerencia os aplicativos; o MAM gerencia o hardware do aparelho, em licenças separadas',
          'O MDM gerencia o aparelho inteiro; o MAM gerencia só os aplicativos corporativos e seus dados',
          'São dois nomes diferentes para o mesmo produto, sem nenhuma diferença prática'
        ], 'MDM controla o dispositivo; MAM controla apenas apps e dados corporativos, sendo menos invasivo. As outras alternativas inventam divisões que não existem.'),
        mcq('q2', 'Uma empresa adota BYOD e quer minimizar a invasão de privacidade. Qual escolha é mais adequada?', 'b', [
          'Instalar controle total do aparelho e ler todas as mensagens pessoais do funcionário',
          'Gerenciar só os aplicativos corporativos, com perfil de trabalho separado',
          'Exigir o desbloqueio do aparelho para a equipe de TI navegar nas fotos',
          'Coletar a localização contínua dos funcionários sem avisar'
        ], 'MAM com perfil separado protege a empresa limitando o acesso ao que é corporativo. As outras opções são excessivas e fogem da necessidade e da transparência exigidas pela LGPD.'),
        mcq('q3', 'Um funcionário com aparelho pessoal (BYOD) perdeu o celular. Que tipo de apagamento é mais adequado?', 'a', [
          'Seletivo, removendo apenas os dados corporativos',
          'Total, restaurando o aparelho ao estado de fábrica',
          'Sem apagamento, pois dados corporativos em celular pessoal não precisam de proteção',
          'Apagar também a conta pessoal de e-mail do funcionário'
        ], 'Em BYOD o apagamento seletivo protege a empresa sem destruir os dados pessoais do funcionário. O total é adequado para aparelhos corporativos.'),
        fill('q4', 'Complete com a sigla do modelo em que o funcionário usa o próprio aparelho para trabalhar.', '___ = Bring Your Own Device', ['byod'], 'BYOD é o modelo em que o funcionário usa o próprio aparelho para fins corporativos.'),
        mcq('q5', 'Para que serve o perfil de trabalho separado no aparelho?', 'd', [
          'Aumentar a velocidade do processador do aparelho durante o expediente, liberando mais memória para o e-mail',
          'Permitir que a empresa veja as redes sociais do funcionário',
          'Substituir a necessidade de senha ou biometria para desbloquear o aparelho',
          'Isolar dados e apps corporativos do uso pessoal, aplicando regras só à parte do trabalho'
        ], 'A separação protege dados corporativos e preserva a privacidade pessoal. Não altera desempenho nem dispensa senha.'),
        mcq('q6', 'Qual item deve constar numa boa política de BYOD?', 'c', [
          'Uma frase dizendo que o funcionário será responsabilizado por qualquer problema, sem detalhar regras',
          'A autorização para acessar livremente as mensagens pessoais do aparelho',
          'O que a empresa pode ver e controlar, requisitos mínimos de segurança e o que ocorre no desligamento',
          'A proibição de usar senha no aparelho, para facilitar o atendimento remoto'
        ], 'A política deve ser clara e transparente sobre limites, requisitos e consequências. Acesso livre ao conteúdo pessoal e ausência de senha são contrários a boas práticas e à LGPD.'),
        mcq('q7', 'O que reduz o risco de dados expostos mesmo antes de um apagamento remoto ser acionado?', 'a', [
          'Criptografia ativada no aparelho e bloqueio de tela com senha ou biometria',
          'Manter o aparelho desbloqueado para facilitar a recuperação, mesmo fora do expediente',
          'Usar a mesma senha simples nos aparelhos da empresa',
          'Desativar as atualizações do sistema para evitar mudanças'
        ], 'Criptografia e bloqueio de tela protegem os dados de quem encontrar o aparelho. As demais práticas aumentam a exposição.'),
        fill('q8', 'Complete com a sigla da gestão do aparelho móvel inteiro, que pode exigir senha, criptografia e apagamento remoto.', '___ = Mobile Device Management', ['mdm'], 'O MDM gerencia o dispositivo como um todo, com políticas e ações remotas.')
      ]
    },
    {
      id: 'csi-35-iot-e-ot-visao',
      title: 'IoT e OT: visão de segurança',
      goal: 'Entender dispositivos IoT, as diferenças entre TI e OT, ciclo de vida longo, segmentação e riscos de segurança física, em nível conceitual.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que são IoT e OT',
            'IoT (Internet of Things, internet das coisas) são dispositivos do dia a dia conectados à rede: câmeras, sensores, fechaduras, impressoras, lâmpadas e relógios inteligentes. OT (Operational Technology, tecnologia operacional) é a tecnologia que controla processos físicos: máquinas de fábricas, sistemas de energia, tratamento de água, elevadores, automação predial. Em OT, o que se controla são válvulas, motores e esteiras, não apenas dados. Por isso uma falha de segurança pode virar um problema físico, com risco a pessoas e ao meio ambiente. Esta lição é conceitual e defensiva.'
          ),
          sl(
            'Riscos típicos de IoT',
            'Dispositivos IoT são pequenos, baratos e muitas vezes lançados sem preocupação com segurança. Problemas comuns: senhas padrão de fábrica nunca trocadas, ausência de mecanismo de atualização, comunicação sem criptografia, interfaces de administração expostas à internet e falta de inventário (ninguém sabe quantos existem na rede). Um conjunto de câmeras com senha padrão pode servir de porta de entrada na rede ou ser usado em ataques de negação de serviço contra terceiros. Defesas: trocar senhas, desativar serviços inúteis, atualizar quando possível, inventariar e isolar.'
          ),
          sl(
            'TI x OT: prioridades diferentes',
            'Na TI, a prioridade clássica é a tríade CIA com ênfase em confidencialidade: proteger dados. Em OT, a ordem costuma se inverter: primeiro segurança das pessoas e disponibilidade (o processo não pode parar), depois integridade, e só então confidencialidade. Exemplo: aplicar uma correção reiniciando o servidor é rotina na TI; numa estação de tratamento de água, reiniciar o controlador no meio da operação pode ser inaceitável. Isso exige planejar janelas de manutenção, testar atualizações em ambiente separado e envolver engenheiros de operação, e não apenas a equipe de TI.',
            'TI : Confidencialidade > Integridade > Disponibilidade\nOT : Segurança física/Disponibilidade > Integridade > Confidencialidade'
          ),
          sl(
            'Ciclo de vida longo',
            'Equipamentos de TI são trocados a cada poucos anos; equipamentos industriais podem operar por décadas. Resultado: sistemas antigos que o fabricante não atualiza mais, protocolos criados quando as redes eram isoladas e não previam autenticação, e dificuldade para aplicar correções. Quando não é possível atualizar, usam-se controles compensatórios: isolar o equipamento em segmento próprio, restringir quem conversa com ele, monitorar o tráfego e controlar o acesso físico. Registrar a dívida técnica e planejar a substituição também faz parte da gestão de risco.'
          ),
          sl(
            'Segmentação e convergência',
            'Antes, redes industriais eram isoladas da internet. Hoje, a convergência entre TI e OT (dados da fábrica enviados a sistemas de gestão, manutenção remota por fornecedores) criou pontes. A defesa central é a segmentação (já vista): separar a rede de OT da rede corporativa, com uma zona intermediária controlada entre elas, regras restritivas de comunicação, acesso remoto de fornecedores apenas por canal controlado, autenticado e registrado, e monitoramento passivo que observa o tráfego sem interferir no processo. Dispositivos IoT também ficam numa rede separada, sem acesso aos sistemas críticos.'
          ),
          sl(
            'Segurança física e visão geral de governança',
            'Em OT e IoT, o acesso físico também é um controle de segurança: portas trancadas em salas de controle, portas USB bloqueadas, câmeras e registros de visitantes. Um pen drive espetado num controlador pode causar o que um ataque remoto não conseguiria. Complementos: inventário de ativos com responsável, plano de resposta a incidentes que inclua a operação (quem pode parar a linha? como operar em modo manual?), treinamento de operadores sobre sinais de comportamento estranho e revisão dos contratos com fornecedores. Consulte normas e referências de segurança industrial para aprofundar.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que distingue principalmente OT de TI?', 'd', [
          'OT é o nome moderno dos computadores pessoais usados nos escritórios',
          'OT trata de redes sem fio, enquanto a TI trata de cabos',
          'OT dispensa qualquer controle de acesso, pois os equipamentos são isolados por natureza',
          'OT controla processos físicos, como máquinas e sistemas de energia, e não apenas dados'
        ], 'OT lida com processos físicos, e falhas podem gerar risco a pessoas e ao ambiente. As outras opções confundem conceitos ou fazem afirmações falsas.'),
        mcq('q2', 'Câmeras IoT foram instaladas com a senha de fábrica. Qual o principal risco?', 'b', [
          'As câmeras gravam em resolução menor, mas sem impacto de segurança',
          'Qualquer pessoa que descubra o padrão pode acessá-las e usá-las como entrada na rede',
          'As câmeras deixam de funcionar quando a senha é a original',
          'A senha de fábrica é secreta e exclusiva de cada aparelho, o que torna o acesso impossível'
        ], 'Senhas padrão são conhecidas e reaproveitadas entre aparelhos. Trocá-las é uma medida básica. A senha padrão não é secreta nem exclusiva.'),
        mcq('q3', 'Em geral, qual prioridade costuma ser maior em OT do que em TI?', 'c', [
          'Confidencialidade dos dados acima de tudo, mesmo que o processo pare',
          'Estética das interfaces de operação',
          'Segurança das pessoas e disponibilidade do processo',
          'Velocidade de instalação de novos aplicativos no controlador'
        ], 'Em ambientes industriais, parar o processo ou colocar pessoas em risco é o pior cenário, por isso disponibilidade e segurança física pesam mais.'),
        fill('q4', 'Complete com a sigla da tecnologia que controla processos físicos industriais.', '___ = Operational Technology', ['ot'], 'OT é a tecnologia operacional, que comanda máquinas e processos físicos.'),
        mcq('q5', 'Um controlador industrial antigo não recebe mais atualizações do fabricante. Qual controle compensatório é mais adequado?', 'b', [
          'Conectá-lo diretamente à internet para facilitar suporte remoto do fornecedor',
          'Isolá-lo em um segmento de rede próprio, com acesso restrito e monitoramento',
          'Ignorar o equipamento, pois só o fabricante pode proteger o que ele vendeu',
          'Reiniciar o controlador diariamente durante a produção para limpar eventuais problemas'
        ], 'Quando não dá para atualizar, reduz-se a exposição com segmentação, restrições e monitoramento. Expor à internet ou reiniciar em produção aumenta o risco.'),
        mcq('q6', 'Qual a melhor forma de dar acesso remoto a um fornecedor de manutenção de OT?', 'a', [
          'Por um canal controlado, autenticado e registrado, limitado ao equipamento necessário',
          'Compartilhando a senha de administrador por mensagem, para ser rápido',
          'Abrindo todas as portas da rede industrial durante o contrato',
          'Deixando um acesso permanente sem registro para evitar chamados futuros, algo que simplifica a rotina'
        ], 'Acesso de terceiros deve ser restrito, autenticado e auditável. As outras práticas ampliam demais a exposição.'),
        mcq('q7', 'Por que o acesso físico importa em ambientes de OT?', 'd', [
          'Porque redes industriais não possuem cabos e funcionam só por rádio, o que torna as portas físicas irrelevantes',
          'Porque o acesso físico não representa risco, e a preocupação é remota',
          'Porque os operadores não precisam de treinamento se a porta estiver fechada',
          'Um dispositivo conectado diretamente a um controlador pode afetá-lo sem passar por defesas de rede'
        ], 'Portas trancadas e controle de mídias removíveis são camadas de defesa, pois ataques físicos contornam defesas de rede.'),
        fill('q8', 'Complete com a sigla de dispositivos do dia a dia conectados à rede, como câmeras e sensores.', '___ = Internet of Things', ['iot'], 'IoT designa dispositivos comuns conectados à rede, que muitas vezes são inseguros por padrão.')
      ]
    },
    {
      id: 'csi-48-sistemas-legados-e-fim-de-vida',
      title: 'Sistemas legados e fim de vida',
      goal: 'Reconhecer os riscos de sistemas sem suporte e aplicar controles compensatórios, plano de migração, inventário de fim de vida e aceitação formal de risco.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é sistema legado e fim de vida',
            'SISTEMA LEGADO é um sistema antigo, ainda em uso, geralmente crítico para o negócio, difícil de substituir ou de atualizar. FIM DE VIDA (end of life, EOL) é o momento em que o fabricante deixa de dar suporte: não publica mais correções de segurança, mesmo que novas falhas sejam descobertas. Um sistema pode ser legado e ainda ter suporte; o problema de segurança aparece quando ele chega ao fim de vida. A partir daí, toda falha nova fica sem patch para sempre, e os atacantes sabem disso, porque as informações sobre falhas são públicas. Erro comum: achar que "sempre funcionou" significa "é seguro".'
          ),
          sl(
            'Por que ainda existem',
            'Sistemas sem suporte persistem por razões reais, não por descuido puro. Algum software crítico só roda no sistema antigo e o fornecedor desapareceu. Equipamentos industriais ou médicos têm vida útil de décadas e custam caro para trocar. Migrar exige orçamento, tempo e testes, e o negócio não quer parar. Há também sistemas esquecidos que ninguém sabe quem mantém. Entender o motivo é importante porque a resposta de segurança não é "desligue tudo amanhã", e sim gerenciar o risco de forma realista enquanto se planeja a saída. Os motivos orientam qual controle compensatório e qual prazo de migração fazem sentido.'
          ),
          sl(
            'Os riscos',
            'Os principais riscos são: 1) FALHAS SEM CORREÇÃO: vulnerabilidades novas nunca serão corrigidas. 2) FALTA DE COMPATIBILIDADE com ferramentas modernas, como EDR, MFA ou criptografia atual. 3) PROTOCOLOS FRACOS ainda habilitados por serem necessários ao sistema. 4) DEPENDÊNCIA DE POUCAS PESSOAS que conhecem o sistema. 5) NÃO CONFORMIDADE: normas e auditorias podem exigir software suportado. 6) Ponto de apoio para MOVIMENTAÇÃO LATERAL: um servidor antigo comprometido pode servir de trampolim para sistemas melhores. O risco de cada sistema depende de exposição, dados que guarda e do impacto de sua parada, então use a criticidade do inventário.'
          ),
          sl(
            'Controles compensatórios',
            'CONTROLES COMPENSATÓRIOS são medidas alternativas que reduzem o risco quando o controle ideal (o patch) não é possível. Para sistemas legados: ISOLAR em uma rede própria, sem acesso à internet; SEGMENTAR com firewall permitindo apenas as conexões estritamente necessárias; usar um PROXY ou gateway moderno na frente, que faça a autenticação e a criptografia que o sistema antigo não faz; MONITORAR com atenção redobrada, alertando sobre qualquer comportamento novo; reduzir contas e privilégios; manter backups testados e offline. Nenhum controle compensatório elimina a falha: ele reduz a probabilidade ou o impacto, e deve ter responsável e prazo.',
            'Internet X sistema legado   (sem acesso direto)\nUsuários -> proxy/gateway moderno -> firewall restrito -> sistema legado\n                |                          |\n        autenticação + criptografia   somente portas necessárias\n(monitoramento reforçado em todo o caminho)'
          ),
          sl(
            'Plano de migração e inventário de fim de vida',
            'Controle compensatório é remédio temporário; a solução é MIGRAR (substituir, atualizar ou reescrever). O PLANO DE MIGRAÇÃO tem escopo, dono, orçamento, cronograma, testes e plano de volta. Para saber quando agir, mantenha um INVENTÁRIO DE FIM DE VIDA: para cada produto, a data prevista de fim de suporte informada pelo fabricante, e alerta com bastante antecedência (meses, não dias). Assim a organização se antecipa e evita que o suporte acabe sem planejamento. Esse inventário é uma extensão do inventário de ativos (veja a lição própria), acrescentando versão e data de fim de suporte.'
          ),
          sl(
            'Aceitação de risco formal e documentada',
            'Se, por um período, não for possível migrar, a decisão correta é ACEITAR O RISCO de forma formal, não por omissão. O registro de aceitação de risco contém: descrição do sistema e da falha, risco avaliado, controles compensatórios em vigor, justificativa de negócio, DONO DO RISCO (quem tem autoridade para aceitar, geralmente a direção da área, não a equipe técnica), PRAZO de validade e data de revisão. A aceitação vence e precisa ser reavaliada ou renovada. Aceitar risco é diferente de ignorar: o primeiro é uma decisão consciente, registrada e revisável; o segundo é negligência e pode agravar a responsabilidade em caso de incidente.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que significa um software chegar ao fim de vida (EOL)?', 'b', [
          'Que ele deixou de funcionar e não pode mais ser aberto nem usado pelos funcionários, mesmo em modo restrito',
          'Que o fabricante deixou de dar suporte, inclusive correções de segurança para falhas novas',
          'Que o software foi substituído automaticamente pela versão mais nova, sem custo',
          'Que o software passou a ser gratuito para qualquer pessoa'
        ], 'Fim de vida é o fim do suporte do fabricante. O software pode continuar funcionando, mas sem novas correções de segurança.'),
        mcq('q2', 'Um servidor antigo executa um sistema essencial, o fornecedor faliu e não há patch. Qual conjunto de medidas é o mais adequado enquanto a migração não ocorre?', 'c', [
          'Manter o servidor conectado diretamente à internet para facilitar o suporte remoto de quem ainda conhece o sistema e dispensar o uso de firewall',
          'Desativar os registros de eventos, que ocupam muito espaço e deixam o sistema lento',
          'Isolar em segmento próprio, permitir só as conexões necessárias, monitorar, reduzir privilégios e planejar a migração',
          'Esconder o servidor do inventário para evitar cobranças dos auditores'
        ], 'Isolamento, segmentação restrita, monitoramento e plano de saída reduzem o risco de forma realista. Expor à internet, desligar logs ou esconder o ativo aumentam o perigo.'),
        mcq('q3', 'Qual é o papel de um proxy ou gateway moderno colocado na frente de um sistema legado?', 'd', [
          'Substituir o sistema legado, que deixa de ser necessário depois da instalação do proxy e pode ser desligado',
          'Corrigir as falhas de código do sistema legado, linha por linha',
          'Apagar os dados do sistema legado depois de cada acesso',
          'Fazer autenticação e criptografia modernas que o sistema antigo não consegue fazer sozinho'
        ], 'O proxy adiciona controles que o legado não suporta, sem alterar o sistema. Ele não o substitui, não altera o código e não apaga dados.'),
        fill('q4', 'Complete: as medidas alternativas que reduzem o risco quando o controle ideal (como o patch) não é possível chamam-se controles ___.', 'controles ___ (alternativos ao ideal)', ['compensatórios', 'compensatorios'], 'Controles compensatórios reduzem probabilidade ou impacto quando a correção definitiva não pode ser aplicada; não eliminam a falha.'),
        mcq('q5', 'Por que o inventário de fim de vida deve alertar com meses de antecedência?', 'a', [
          'Para dar tempo de orçar, planejar e testar a migração antes de o suporte acabar',
          'Porque o fabricante exige aviso prévio dos clientes para encerrar o suporte',
          'Porque as vulnerabilidades só começam a ser descobertas seis meses depois do fim do suporte',
          'Porque, depois da data, o sistema é bloqueado automaticamente pelo fabricante'
        ], 'Migrar envolve orçamento, cronograma e testes, então o alerta precisa ser antecipado. O fabricante não exige aviso do cliente, as falhas podem surgir a qualquer momento e o sistema não é bloqueado.'),
        mcq('q6', 'Qual afirmação descreve corretamente uma aceitação formal de risco para um sistema legado?', 'c', [
          'É a decisão da equipe técnica de não fazer nada, sem registro, por falta de tempo',
          'É o documento que torna o sistema legado seguro, eliminando as falhas existentes',
          'É um registro com risco, controles compensatórios, justificativa, dono do risco e prazo de revisão, aprovado por quem tem autoridade',
          'É a transferência definitiva do risco para o fornecedor, que deixa de existir como empresa e não responde mais por nada, encerrando a responsabilidade da organização sobre o sistema'
        ], 'A aceitação formal é decisão consciente, registrada e com validade. Não é omissão, não elimina falhas e o risco não passa para um fornecedor inexistente.'),
        mcq('q7', 'Quem deve ser o dono do risco ao aceitar a operação de um sistema legado sem suporte?', 'b', [
          'O estagiário que fez o último backup do sistema e conhece bem o funcionamento do equipamento no dia a dia, incluindo as senhas de administrador',
          'Quem tem autoridade sobre o negócio afetado, como a direção da área dona do sistema, com apoio técnico e da segurança',
          'Qualquer pessoa que consiga abrir o sistema com sua própria senha de acesso, desde que seja da equipe de TI e tenha muita experiência com ele',
          'O fabricante original do sistema, mesmo sem contrato vigente'
        ], 'O dono do risco precisa ter autoridade para decidir sobre o impacto no negócio. As demais opções não têm essa autoridade ou nem têm vínculo com a organização.'),
        fill('q8', 'Complete: a sigla em inglês para o momento em que o fabricante encerra o suporte e as correções de um produto é ___ (end of life).', 'sigla do fim de vida: ___', ['eol'], 'EOL (end of life) marca o fim do suporte do fabricante; a partir dele, falhas novas ficam sem correção oficial.')
      ]
    },
    {
      id: 'csi-36-ameacas-internas',
      title: 'Ameaças internas',
      goal: 'Entender os tipos de insider (malicioso, negligente, comprometido), indicadores, controles técnicos e de RH e o monitoramento proporcional à luz da LGPD.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é uma ameaça interna',
            'Ameaça interna (insider threat) é o risco vindo de alguém com acesso legítimo: funcionário, terceirizado, estagiário ou fornecedor. Como já possui acesso, pode contornar defesas externas, e suas ações podem parecer normais. Três perfis: o insider malicioso (age de propósito: rouba dados, sabota ou vende acesso), o insider negligente (comete erros sem querer: manda planilha ao destinatário errado, cai em phishing, ignora regras) e o insider comprometido (a conta ou o equipamento foi tomado por um atacante externo, que age usando a identidade legítima). Na prática, os negligentes e comprometidos são mais comuns que os maliciosos.'
          ),
          sl(
            'Motivações e erros comuns',
            'Motivações do malicioso: ganho financeiro, vingança após demissão ou conflito, pressão externa, ou insatisfação. A negligência vem de pressa, falta de treinamento, regras confusas e cansaço. Cuidado: tratar todos como suspeitos destrói a confiança e piora a cultura. O objetivo é reduzir oportunidade e detectar comportamentos de risco com justiça e respeito, sem perseguição. Erro comum de gestão: focar só no malicioso e não corrigir processos que levam a erros honestos.'
          ),
          sl(
            'Indicadores de risco',
            'Indicadores não provam culpa, apenas justificam atenção: acessos fora do horário habitual sem motivo, download ou envio de grandes volumes de dados, tentativa de acessar sistemas sem relação com a função, uso de dispositivos de armazenamento removíveis não autorizados, envio de documentos para e-mail pessoal, contas dormentes subitamente ativas e mudanças comportamentais ligadas a conflito (tratadas por RH, nunca por vigilância pessoal). Um indicador isolado raramente basta; combinações e contexto importam. Toda análise deve passar por pessoas autorizadas, e conclusões precipitadas devem ser evitadas.'
          ),
          sl(
            'Controles técnicos',
            'Controles técnicos reduzem o dano de qualquer tipo de insider: privilégio mínimo e acesso baseado em função; segregação de funções (ninguém controla um processo crítico sozinho); revisão periódica de acessos; MFA; logs e alertas para atividades anômalas (UEBA, análise do comportamento de usuários e entidades); DLP para saída de dados; criptografia; controle de dispositivos removíveis; e registro de ações de administradores. Na saída de um funcionário, revogar acessos no mesmo dia e recolher equipamentos é essencial.'
          ),
          sl(
            'Controles de RH e cultura',
            'Pessoas e processos importam tanto quanto tecnologia. Antes da contratação: verificação de antecedentes dentro do que a lei permite, com transparência. Durante o vínculo: treinamento recorrente, política de uso aceitável assinada, canal seguro para relatar problemas (inclusive de forma anônima) e gestão justa de conflitos. No desligamento: processo padronizado envolvendo RH e TI, lembrando o funcionário das obrigações de confidencialidade. Uma cultura em que errar e comunicar é seguro faz o negligente avisar rápido, e isso reduz o impacto.'
          ),
          sl(
            'Monitoramento proporcional e LGPD',
            'Monitorar funcionários tem limites legais e éticos. Princípios da LGPD que se aplicam: finalidade (monitorar para proteger a segurança, e não para fins pessoais ou discriminatórios), necessidade (coletar o mínimo), transparência (informar claramente o que é monitorado, por política e termo) e segurança (proteger os dados de monitoramento). Em geral, monitorar ativos e contas corporativas com aviso prévio é mais defensável que monitorar conteúdo pessoal. Regras trabalhistas e jurisprudência podem variar: alinhe com jurídico e RH antes de implantar. Este conteúdo é visão geral e não substitui orientação jurídica.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um funcionário envia por engano uma planilha de clientes para o destinatário errado. Que tipo de insider é esse?', 'b', [
          'Malicioso, pois todo vazamento revela intenção de prejudicar a empresa',
          'Negligente: errou sem intenção de causar dano',
          'Comprometido, pois toda mensagem enviada por engano vem de uma conta invadida',
          'Não é insider, pois funcionários não causam incidentes'
        ], 'Erro sem intenção caracteriza o insider negligente. Não há evidência de intenção nem de invasão externa.'),
        mcq('q2', 'Uma conta legítima de um funcionário passa a baixar dados de madrugada, após o funcionário ter sido vítima de phishing. Qual perfil melhor descreve?', 'd', [
          'Insider malicioso, que age de propósito por vingança contra a empresa',
          'Insider negligente, por ter acessado a conta durante a madrugada',
          'Atividade normal, pois acessos de madrugada não devem gerar alertas',
          'Insider comprometido, em que um atacante usa a identidade legítima'
        ], 'A conta foi tomada por terceiros após o phishing. É o comprometido. Alertas de comportamento ajudam a detectar esse caso.'),
        mcq('q3', 'Qual controle técnico reduz o dano de qualquer tipo de insider?', 'a', [
          'Privilégio mínimo e revisão periódica de acessos',
          'Dar acesso de administrador à equipe para evitar chamados',
          'Compartilhar senhas entre membros da equipe para continuidade',
          'Desativar os logs de acesso para economizar espaço'
        ], 'Quanto menos acesso uma conta tem, menor o estrago possível. As outras opções ampliam o risco ou eliminam rastreabilidade.'),
        fill('q4', 'Complete com o nome do princípio que diz que um acesso deve ser limitado ao necessário para a função.', 'Privilégio ___: só o acesso necessário para a função', ['mínimo', 'minimo'], 'O privilégio mínimo reduz o estrago que uma conta, mal-intencionada ou comprometida, pode causar.'),
        mcq('q5', 'Por que um indicador isolado, como um acesso fora do horário, não prova que alguém é malicioso?', 'c', [
          'Porque acesso fora do horário não é registrado por sistema algum, nem em servidores nem em aplicações, e por isso não gera suspeita',
          'Porque indicadores visuais, como a aparência do funcionário, são os únicos válidos',
          'Pode ter explicação legítima, e o contexto e as combinações de sinais precisam ser analisados',
          'Porque a equipe de segurança não tem permissão para analisar sinal algum'
        ], 'Indicadores justificam atenção, mas há explicações legítimas, como plantões. A análise deve ser cuidadosa e feita por pessoas autorizadas.'),
        mcq('q6', 'Qual prática de desligamento reduz o risco de insider?', 'd', [
          'Manter as contas ativas por 90 dias caso a pessoa precise tirar dúvidas',
          'Deixar a conta ativa e trocar o nome do usuário',
          'Pedir à pessoa que apague os próprios arquivos sozinha',
          'Revogar acessos no mesmo dia e recolher os equipamentos'
        ], 'Acessos remanescentes são risco. A revogação imediata e o recolhimento de equipamentos fecham a porta.'),
        mcq('q7', 'Qual abordagem de monitoramento de funcionários está mais alinhada à LGPD?', 'a', [
          'Monitorar contas e ativos corporativos, informando antes o que é monitorado e por quê',
          'Monitorar escondido as redes sociais pessoais dos funcionários',
          'Coletar o máximo de dados possível, caso seja útil no futuro, inclusive conteúdo pessoal dos funcionários',
          'Usar os dados de monitoramento para avaliar a vida pessoal dos funcionários'
        ], 'Finalidade, necessidade e transparência são pilares. Coleta escondida, excessiva ou com finalidade diferente fere esses princípios.'),
        fill('q8', 'Complete com o tipo de insider que erra sem intenção, por pressa ou falta de treinamento.', 'Insider ___: comete erros sem intenção de causar dano', ['negligente'], 'O insider negligente é o que causa incidentes por erro, não por má-fé.')
      ]
    },
    {
      id: 'csi-37-pentest-e-regras-de-engajamento',
      title: 'Pentest: escopo, autorização e relatório',
      goal: 'Entender o que é um teste de intrusão, suas fases em nível conceitual, escopo, autorização por escrito, regras de engajamento, tipos de teste e como ler um relatório.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é um pentest',
            'Pentest (penetration test, teste de intrusão) é uma avaliação de segurança autorizada em que profissionais tentam, de forma controlada, encontrar e demonstrar falhas em sistemas, redes ou aplicações, simulando a visão de um adversário, para que a organização corrija antes que alguém mal-intencionado as explore. Difere da varredura de vulnerabilidades (automática e ampla, que lista possíveis falhas) porque envolve julgamento humano e confirma o impacto real. Atenção: realizar testes sem autorização é crime, conforme legislação como a Lei 12.737/2012 (visão geral; consulte o jurídico). Esta lição não ensina técnicas de exploração.'
          ),
          sl(
            'Fases em nível conceitual',
            'Um pentest costuma seguir fases: planejamento e acordo (objetivos, escopo, regras); levantamento de informações (conhecer o alvo); identificação de pontos fracos; tentativa controlada de confirmar o impacto dentro dos limites acordados; documentação e relatório; e apoio à correção com reteste para verificar se foi sanada. O que importa para quem contrata é a clareza: o que será feito, quando, por quem e com que limites. Cada fase é registrada para permitir auditoria.'
          ),
          sl(
            'Escopo e autorização por escrito',
            'Escopo define o que pode ser testado: quais sistemas, endereços, aplicações, horários e quais técnicas são permitidas ou proibidas, além do que está fora do escopo (por exemplo, sistemas de terceiros, como um provedor de nuvem, que podem exigir autorização própria). A autorização por escrito, assinada por quem tem poder para concedê-la, é o que diferencia o teste legítimo de um ataque: ela protege o testador e o cliente. Erro comum: autorização verbal ou assinada por quem não é dono do sistema. Testar fora do escopo, mesmo sem querer, pode gerar responsabilidade legal e dano real.'
          ),
          sl(
            'Regras de engajamento',
            'As regras de engajamento (RoE, Rules of Engagement) detalham a conduta durante o teste: janelas de horário, contatos de emergência, o que fazer se algo sair do controle ou se uma falha crítica for encontrada (avisar imediatamente), limites sobre dados reais (acessar o mínimo para demonstrar e não copiar dados pessoais desnecessariamente), técnicas proibidas que possam derrubar produção, e como os resultados serão protegidos. Também definem o sigilo: o relatório contém o mapa das fraquezas da empresa e deve ser tratado como confidencial.'
          ),
          sl(
            'Tipos: black, grey e white box',
            'Os tipos variam conforme a informação dada ao testador. Black box: nenhuma informação prévia, simulando um atacante externo; é mais realista sobre a visão externa, mas cobre menos em profundidade no mesmo tempo. White box: acesso amplo a documentação, código e configurações; é mais profundo e eficiente. Grey box: informação parcial, como uma conta de usuário comum, equilibrando realismo e profundidade. Também há classificações por alvo (rede, aplicação web, wireless, engenharia social) e se a equipe de defesa é avisada ou não.',
            'Black box -> sem informação (visão externa)\nGrey box  -> informação parcial (ex.: usuário comum)\nWhite box -> informação ampla (código, documentação)'
          ),
          sl(
            'O relatório',
            'O relatório é o principal produto. Um bom relatório tem: sumário executivo (em linguagem de negócio, para a diretoria), escopo e metodologia, lista de achados com gravidade (crítica, alta, média, baixa), descrição do impacto, evidência (prova de que o achado existe), recomendação de correção clara e priorizada, e anexos técnicos. Cada achado deve permitir à equipe técnica reproduzir e corrigir. Após a correção, o reteste confirma a solução. Erro comum: tratar o relatório como fim; o valor está na correção, e o relatório deve ser guardado com controle de acesso por conter informações sensíveis.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que diferencia um pentest de uma varredura automatizada de vulnerabilidades?', 'c', [
          'O pentest é feito sem autorização, enquanto a varredura exige autorização',
          'O pentest só lista possíveis falhas, sem confirmar nada, ao contrário da varredura, e dispensa autorização',
          'O pentest envolve julgamento humano e confirma o impacto real das falhas, sob autorização',
          'Não há diferença: são nomes de uma mesma atividade totalmente automática'
        ], 'O pentest agrega análise humana e demonstração controlada de impacto, sempre com autorização. A varredura é automática e lista possíveis falhas.'),
        mcq('q2', 'Qual documento diferencia um pentest legítimo de um ataque?', 'b', [
          'Um e-mail informal enviado por qualquer funcionário da empresa',
          'A autorização por escrito, assinada por quem pode concedê-la',
          'O relatório final, escrito depois do teste',
          'Um acordo verbal feito no corredor'
        ], 'A autorização formal e prévia, com assinatura de quem tem poder sobre os sistemas, protege ambas as partes. Os outros itens não cumprem esse papel.'),
        mcq('q3', 'Durante um pentest, o testador percebe que um sistema de um provedor de nuvem terceiro, fora do escopo, parece vulnerável. O que fazer?', 'd', [
          'Testar assim mesmo, pois a descoberta valorizará o relatório',
          'Testar de madrugada para ninguém perceber e depois omitir as descobertas fora do escopo do relatório final',
          'Ignorar o alerta e não registrar nada a respeito',
          'Não testar o sistema fora do escopo e informar o cliente para tratar a autorização necessária'
        ], 'O que está fora do escopo ou não autorizado não deve ser testado. Comunicar o cliente é o procedimento correto.'),
        fill('q4', 'Complete com a sigla do documento que define janelas de horário, contatos e limites de conduta durante o teste.', '___ = Rules of Engagement', ['roe'], 'As regras de engajamento definem como o teste será conduzido e quais limites devem ser respeitados.'),
        mcq('q5', 'Em qual tipo de teste o profissional recebe uma conta de usuário comum como ponto de partida?', 'b', [
          'Black box',
          'Grey box',
          'White box',
          'Teste sem escopo'
        ], 'Grey box dá informação parcial, como um usuário comum. Black box não dá informação e white box dá acesso amplo.'),
        mcq('q6', 'Durante o teste, uma falha crítica que expõe dados pessoais é encontrada. O que as regras de engajamento recomendam?', 'c', [
          'Copiar os dados pessoais encontrados para anexar ao relatório',
          'Publicar a falha para pressionar a empresa a corrigir',
          'Avisar o contato definido, acessar o mínimo necessário e proteger as evidências',
          'Aguardar o fim do contrato para comentar o assunto, para não atrapalhar o cronograma do teste'
        ], 'Falhas críticas pedem aviso imediato, e o acesso a dados pessoais deve ser mínimo (LGPD). Copiar, publicar ou aguardar são condutas inadequadas.'),
        mcq('q7', 'Qual elemento do relatório é voltado à diretoria?', 'a', [
          'O sumário executivo, em linguagem de negócio',
          'Os anexos técnicos com registros detalhados',
          'A lista de endereços testados',
          'As configurações brutas dos servidores'
        ], 'O sumário executivo traduz o resultado para decisão de negócio. Os outros itens são detalhes técnicos para a equipe.'),
        fill('q8', 'Complete com o tipo de teste em que o testador não recebe nenhuma informação prévia do alvo.', '___ box: nenhuma informação prévia sobre o alvo', ['black'], 'Black box simula quem não conhece o ambiente, como um atacante externo.')
      ]
    },
    {
      id: 'csi-38-red-blue-purple',
      title: 'Red team, blue team e purple team',
      goal: 'Entender os papéis das equipes, os tipos de exercícios, o tabletop, as métricas e como as equipes aprendem juntas.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Os papéis das equipes',
            'Red team é a equipe que simula adversários, de forma autorizada, para testar as defesas da organização de ponta a ponta (pessoas, processos e tecnologia). Blue team é a equipe de defesa: monitora, detecta, responde e fortalece o ambiente (SOC, resposta a incidentes, engenharia de detecção). Purple team não é necessariamente uma terceira equipe: é uma forma de trabalho colaborativa em que red e blue compartilham o que aprendem em tempo real. Existe ainda a white cell, que coordena e arbitra o exercício, definindo regras. Tudo isso acontece com autorização e regras claras, como visto em pentest.'
          ),
          sl(
            'Red team x pentest',
            'O pentest procura o maior número de falhas num escopo definido, geralmente com o conhecimento da equipe de defesa. O exercício de red team tem um objetivo (por exemplo, acessar um sistema crítico simulando um adversário específico), costuma ser mais longo e discreto, e testa principalmente a capacidade de detecção e resposta do blue team. A pergunta do pentest é: quais falhas existem? A do red team é: nossa defesa percebe e reage a um adversário determinado? Ambos são autorizados e documentados.'
          ),
          sl(
            'Exercícios de purple team',
            'No purple team, os times escolhem uma técnica adversária (por exemplo, do MITRE ATT&CK, visto antes), a equipe vermelha executa uma simulação segura e controlada, e a azul verifica se os alertas dispararam, se os registros mostraram o evento e se a resposta funcionou. Se não, ajustam-se regras de detecção e testa-se de novo, no mesmo exercício. Ganho: ciclos curtos de melhoria, cobertura de detecção crescente e menos mal-entendidos entre as equipes. Os resultados alimentam a cobertura de técnicas mapeadas em ATT&CK.',
            '1. Escolher a técnica a testar\n2. Simular de forma segura\n3. A defesa detectou?\n4. Ajustar regras, repetir'
          ),
          sl(
            'Tabletop',
            'Exercício de mesa (tabletop) é uma simulação de crise discutida em reunião, sem tocar em sistemas. Um facilitador apresenta um cenário (por exemplo, ransomware numa sexta à noite), e participantes de TI, segurança, jurídico, comunicação e diretoria respondem: quem decide? quem avisa os clientes? quando acionar o encarregado de dados? Revela lacunas em papéis, contatos e planos, de forma barata e sem risco. Registre decisões, dúvidas e ações de melhoria, com donos e prazos. É um bom primeiro passo para organizações que ainda não fazem exercícios técnicos.'
          ),
          sl(
            'Métricas de exercícios',
            'Medir transforma o exercício em aprendizado. Exemplos: tempo até detectar (MTTD) e até responder (MTTR), percentual de técnicas simuladas que geraram alerta, percentual de alertas corretamente triados, número de lacunas encontradas e corrigidas, e tempo para fechar cada lacuna. Evite medir apenas vitória ou derrota: o objetivo não é a red vencer ou a blue vencer, e sim reduzir o risco. Tenha cuidado com métricas de vaidade, como número de ataques simulados sem relação com melhoria.'
          ),
          sl(
            'Como as equipes aprendem juntas',
            'Boas práticas: ambiente de aprendizado sem culpa, relatórios compartilhados com as duas equipes, reuniões de lições aprendidas, rotação de profissionais entre equipes para ampliar visão, simulações cada vez mais próximas de ameaças reais do seu setor (usando inteligência de ameaças) e documentação das detecções criadas. Cuidados: simulações em produção precisam de controle para evitar interrupção de serviços e proteger dados pessoais, e devem seguir regras de engajamento aprovadas.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual equipe simula adversários de forma autorizada para testar as defesas?', 'd', [
          'Blue team',
          'White cell, que arbitra o exercício',
          'Equipe de suporte ao usuário',
          'Red team'
        ], 'A red team simula o adversário. A blue defende e a white cell coordena. O suporte não faz esse papel.'),
        mcq('q2', 'O que melhor descreve o purple team?', 'a', [
          'Uma forma de trabalho colaborativa em que ataque e defesa compartilham aprendizados em tempo real',
          'Uma terceira equipe, rival das outras duas, que testa as duas sem avisar e responde à diretoria',
          'Uma equipe que faz auditoria financeira da área de TI',
          'Um fornecedor externo que substitui a blue team'
        ], 'O purple team é colaboração entre red e blue. Não é rival nem substituta e não faz auditoria financeira.'),
        mcq('q3', 'Qual pergunta resume o objetivo principal de um exercício de red team?', 'c', [
          'Quantas vulnerabilidades existem em cada servidor da empresa?',
          'Qual é o preço do melhor equipamento de rede do mercado?',
          'A nossa defesa percebe e reage a um adversário determinado?',
          'Como criar a senha ideal para os usuários?'
        ], 'Red team testa a detecção e a resposta contra um adversário com objetivo. Listar vulnerabilidades é papel de varreduras e de pentests.'),
        fill('q4', 'Complete com o nome do exercício de crise discutido em reunião, sem tocar nos sistemas.', '___ = exercício de mesa, discutido sem executar nos sistemas', ['tabletop'], 'O tabletop discute um cenário de crise, revelando lacunas de papéis e de planos.'),
        mcq('q5', 'Num tabletop de ransomware, ninguém sabe quem comunica os clientes. O que isso mostra?', 'b', [
          'Que o exercício falhou e deve ser cancelado, sem registrar nada, pois não houve resposta para a pergunta',
          'Uma lacuna de papéis no plano, encontrada de forma barata e sem risco aos sistemas',
          'Que o ransomware é inevitável e não adianta se preparar',
          'Que a diretoria deve ser excluída de exercícios futuros'
        ], 'Revelar lacunas é justamente o valor do tabletop. Elas devem virar ações com dono e prazo.'),
        mcq('q6', 'Qual métrica indica quanto tempo a equipe leva para perceber um ataque simulado?', 'b', [
          'MTTR, o tempo médio para resolver, que ignora a detecção',
          'MTTD, o tempo médio para detectar',
          'O número de pessoas na sala durante o exercício',
          'O tamanho do relatório final em páginas'
        ], 'MTTD mede a detecção. MTTR mede o tempo de resposta ou resolução. Número de pessoas e páginas não indicam capacidade de detecção.'),
        mcq('q7', 'Qual prática ajuda as equipes a aprenderem juntas?', 'd', [
          'Esconder dos defensores os resultados para não os desanimar, e divulgar só o placar final',
          'Punir os analistas que não detectaram uma técnica simulada',
          'Evitar documentar as novas detecções criadas',
          'Relatórios compartilhados e reuniões de lições aprendidas sem culpabilização'
        ], 'Ambiente sem culpa e compartilhamento aceleram o aprendizado. As demais práticas bloqueiam a melhoria.'),
        fill('q8', 'Complete com o nome da equipe de defesa que monitora, detecta e responde a ataques.', '___ team: equipe de defesa', ['blue'], 'A blue team é a equipe de defesa do exercício e da organização.')
      ]
    },
    {
      id: 'csi-39-ddos-e-mitigacao',
      title: 'DDoS e mitigação',
      goal: 'Entender os tipos de DDoS em conceito (volumétrico, de protocolo, de aplicação), mitigação, CDN, scrubbing, limitação de taxa e plano de resposta.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é DoS e DDoS',
            'Negação de serviço (DoS, Denial of Service) é um ataque que torna um serviço indisponível, geralmente sobrecarregando-o com mais requisições do que ele consegue atender. Se o ataque vem de muitas origens ao mesmo tempo, é DDoS (D de distribuído). Fere a disponibilidade da tríade CIA. Motivações: extorsão, protesto, concorrência desleal ou diversão. Importante: um pico legítimo de acessos, como uma promoção, pode ter o mesmo efeito, e distinguir os dois é parte do trabalho. Esta lição trata de defesa; não ensina como realizar ataques, o que é crime.'
          ),
          sl(
            'Tipos: volumétrico, de protocolo e de aplicação',
            'Em conceito, há três famílias. Volumétrico: tenta saturar a banda (a capacidade do link), como entupir uma estrada com tráfego. De protocolo: explora o funcionamento de protocolos de rede para esgotar recursos de equipamentos como firewalls e balanceadores (por exemplo, esgotando tabelas de conexões). De aplicação (camada 7): envia requisições aparentemente legítimas, como pedidos a uma página pesada de busca, esgotando o servidor com baixo volume, e por isso é mais difícil de distinguir de usuários reais. Cada família pede defesas diferentes.',
            'Volumétrico -> enche o link (banda)\nProtocolo   -> esgota tabelas/recursos de rede\nAplicação   -> sobrecarrega a aplicação (L7)'
          ),
          sl(
            'Mitigação: onde agir',
            'Defesa em camadas: absorver, filtrar e limitar. Absorver: ter capacidade de banda ampla e distribuir a carga. Filtrar: descartar tráfego malicioso antes de chegar ao servidor. Limitar: impor teto de requisições. Como o ataque volumétrico supera a banda da maioria das empresas, a mitigação costuma ser feita fora da sua rede, junto ao provedor ou a um serviço especializado. Tentar defender somente no próprio servidor é tarde demais: o link já está saturado quando o tráfego chega.'
          ),
          sl(
            'CDN e scrubbing',
            'CDN (Content Delivery Network) é uma rede global de servidores que guarda cópias de conteúdo perto dos usuários e fica na frente do seu site. Ela absorve grande volume e esconde o servidor de origem (que não deve ser acessível diretamente pela internet, apenas pela CDN). Scrubbing (limpeza) é um serviço em que o tráfego é desviado para centros especializados que removem o tráfego malicioso e devolvem apenas o legítimo. Muitos provedores oferecem proteção contra DDoS como serviço. Cuidado: se o endereço do servidor de origem for descoberto, o atacante pode ignorar a CDN; restrinja a origem a aceitar apenas a CDN.'
          ),
          sl(
            'Limitação de taxa e outras defesas',
            'Limitação de taxa (rate limiting) restringe quantas requisições um mesmo cliente pode fazer por período, retornando erro ao exceder. Ajuda contra ataques de aplicação, mas não contra DDoS distribuído em que cada origem manda pouco. Complementos: cache de páginas pesadas, desafios para distinguir pessoas de robôs em momentos de alta suspeita, WAF (firewall de aplicação web) com regras de comportamento, filas de espera em eventos de grande demanda, escalabilidade automática com teto de custo (para não pagar uma conta enorme durante o ataque) e redundância de links e provedores.'
          ),
          sl(
            'Plano de resposta',
            'Prepare-se antes: tenha o contato do provedor e do serviço de mitigação, um plano com papéis e critérios de acionamento, linha de base do tráfego normal para reconhecer anomalias, monitoramento com alertas e canal de comunicação com áreas de negócio e atendimento. Durante: confirmar que é ataque (e não pico legítimo), acionar a mitigação, comunicar de forma clara, registrar tudo para análise posterior. Depois: lições aprendidas, ajuste de capacidade e de regras, e, se houver extorsão, envolver o jurídico e as autoridades, sem tratar de forma isolada. Teste o plano em exercícios de mesa.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual propriedade da tríade CIA o DDoS ataca principalmente?', 'c', [
          'Confidencialidade',
          'Integridade',
          'Disponibilidade',
          'Autenticidade'
        ], 'O DDoS busca tornar o serviço indisponível. Não visa, em si, ler dados nem alterá-los.'),
        mcq('q2', 'Um ataque que enche a banda do link de internet de uma empresa é de qual família?', 'a', [
          'Volumétrico',
          'De aplicação, que só envia requisições legítimas de baixo volume',
          'De protocolo, que esgota tabelas de conexões',
          'De engenharia social, que depende de enganar pessoas'
        ], 'Saturar a banda é característica do ataque volumétrico. O de aplicação e o de protocolo miram outros recursos.'),
        mcq('q3', 'Por que o ataque de camada de aplicação costuma ser mais difícil de distinguir de usuários reais?', 'a', [
          'Usa requisições aparentemente legítimas, em volume menor, para esgotar o servidor',
          'Usa um volume gigantesco, que é facilmente reconhecível, por isso a defesa é trivial',
          'É feito por funcionários da própria empresa',
          'Acontece em redes sem fio'
        ], 'Requisições que parecem legítimas e em baixo volume confundem com tráfego normal. Por isso exigem análise de comportamento.'),
        fill('q4', 'Complete com a sigla da rede global de servidores que fica na frente do site e absorve grande volume de tráfego.', '___ = Content Delivery Network', ['cdn'], 'A CDN distribui conteúdo e absorve picos e ataques volumétricos, protegendo a origem.'),
        mcq('q5', 'Por que não deve ser possível acessar diretamente o servidor de origem quando se usa CDN?', 'd', [
          'Porque a CDN deixa de funcionar quando a origem está pública, e o site fica fora do ar',
          'Porque a origem passa a ficar sem energia elétrica',
          'Porque a LGPD proíbe qualquer servidor de ter endereço IP',
          'Se o atacante descobrir o endereço de origem, pode ignorar a CDN e atacar direto'
        ], 'Restringir a origem a aceitar somente a CDN mantém a proteção. A CDN continua funcionando, e a LGPD não proíbe endereços IP.'),
        mcq('q6', 'Limitação de taxa (rate limiting) é mais eficaz contra qual situação?', 'b', [
          'Um ataque distribuído em que cada origem manda poucas requisições',
          'Um único cliente enviando requisições em excesso à aplicação',
          'A saturação do link por tráfego volumétrico de milhares de origens',
          'Um incêndio no data center'
        ], 'Rate limiting freia clientes que excedem o limite, mas não resolve ataques distribuídos de baixo volume por origem nem a saturação de banda.'),
        mcq('q7', 'Durante um aumento súbito de acessos, qual é o primeiro passo do plano de resposta?', 'c', [
          'Desligar o site imediatamente, sem investigar, e só religá-lo no dia seguinte',
          'Culpar a equipe de marketing sem verificar os dados',
          'Confirmar se é ataque ou pico legítimo e acionar a mitigação, se necessário',
          'Pagar qualquer pedido de resgate recebido'
        ], 'É preciso distinguir ataque de pico legítimo antes de agir. Desligar sem análise ou pagar resgate são reações precipitadas.'),
        fill('q8', 'Complete com a sigla do ataque de negação de serviço distribuído.', '___ = Distributed Denial of Service', ['ddos'], 'DDoS é a negação de serviço feita a partir de muitas origens simultâneas.')
      ]
    },
    {
      id: 'csi-40-automacao-defensiva-com-python',
      title: 'Automação defensiva com Python',
      goal: 'Escrever e executar pequenos scripts defensivos: hash de arquivo, contagem de falhas de login por IP em um log fictício e checagem de portas na própria máquina.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que automatizar a defesa',
            'Tarefas repetitivas de segurança (conferir integridade de arquivos, ler logs, verificar serviços abertos) são rápidas de automatizar com Python e ficam mais consistentes e documentadas. Esta lição mostra três scripts curtos, todos defensivos e executados só na sua própria máquina, com dados fictícios. Regra de ouro: só execute verificações em sistemas que são seus ou que você tem autorização por escrito para testar; varredura de redes de terceiros pode ser crime (Lei 12.737/2012, visão geral; consulte o jurídico). As saídas abaixo foram obtidas executando de verdade os códigos mostrados.'
          ),
          sl(
            'Script 1: hash para checar integridade',
            'O módulo hashlib calcula hashes. Aqui geramos o hash SHA-256 de uma sequência de bytes e mostramos que mudar um único caractere gera um hash completamente diferente. Na prática, você aplicaria isso a arquivos (lendo-os em pedaços) para comparar com um valor de referência publicado pelo fornecedor ou guardado por você. O hexdigest devolve o hash em texto hexadecimal; cortamos com [:16] só para caber na tela.',
            'import hashlib\n\nfor dados in (b"relatorio ficticio v1", b"relatorio ficticio v2"):\n    print(hashlib.sha256(dados).hexdigest()[:16])\n\n# saída real:\n# 85a5cfeeb40023ff\n# 0dd24c4772ab488c'
          ),
          sl(
            'Script 2: falhas de login por IP',
            'Um log de autenticação fictício, com IPs de documentação (192.0.2.x, 198.51.100.x, 203.0.113.x). Cada linha tem data, hora, resultado (FALHA ou OK), usuário e IP. O script conta as falhas por IP com Counter e marca como suspeito quem tem 3 ou mais falhas. Isso é o princípio de uma regra de detecção de força bruta, já vista nas lições de SIEM e ataques a senhas. Limitação: IPs podem ser compartilhados (várias pessoas atrás de um mesmo endereço) e ataques distribuídos usam muitas origens; use o resultado como alerta para investigação, e não como prova.',
            'from collections import Counter\n\nlog = """2025-01-10 10:00:01 FALHA usuario=ana ip=192.0.2.10\n2025-01-10 10:00:03 FALHA usuario=admin ip=198.51.100.7\n2025-01-10 10:00:04 FALHA usuario=admin ip=198.51.100.7\n2025-01-10 10:00:05 OK usuario=ana ip=192.0.2.10\n2025-01-10 10:00:06 FALHA usuario=root ip=198.51.100.7\n2025-01-10 10:00:08 FALHA usuario=bia ip=203.0.113.5""".splitlines()\n\nfalhas = Counter()\nfor linha in log:\n    partes = linha.split()\n    if partes[2] == "FALHA":\n        ip = partes[4].split("=")[1]\n        falhas[ip] += 1\n\nfor ip, n in falhas.most_common():\n    print(ip, n, "SUSPEITO" if n >= 3 else "normal")\n\n# saída real:\n# 198.51.100.7 3 SUSPEITO\n# 192.0.2.10 1 normal\n# 203.0.113.5 1 normal'
          ),
          sl(
            'Como o script 2 funciona',
            'Passo a passo: splitlines separa o texto em linhas; split() divide cada linha por espaços, gerando uma lista (partes[2] é o resultado e partes[4] é o campo ip=...). Em ip=192.0.2.10, split("=")[1] pega o que vem depois do igual. O Counter é um dicionário que conta ocorrências: falhas[ip] += 1 soma uma falha ao IP. most_common() ordena do maior para o menor. Erro comum de iniciante: contar também as linhas OK; por isso o if filtra só FALHA. Ao adaptar para logs reais, valide o formato (linhas malformadas existem) e proteja o arquivo, pois logs podem conter dados pessoais.'
          ),
          sl(
            'Script 3: portas abertas na própria máquina',
            'Verificar quais portas estão abertas no próprio computador (localhost, 127.0.0.1) ajuda a achar serviços esquecidos. O script abaixo cria, de propósito, um servidor de teste em uma porta escolhida pelo sistema e depois tenta conectar nela e na porta 1. connect_ex devolve 0 quando a conexão funciona e outro número quando falha. Atenção: isso é só para a sua máquina; não aponte esse tipo de teste para equipamentos de terceiros sem autorização por escrito.',
            'import socket\n\nsrv = socket.socket()\nsrv.bind(("127.0.0.1", 0))   # porta livre escolhida pelo sistema\nsrv.listen(1)\naberta = srv.getsockname()[1]\n\nfor porta in (aberta, 1):\n    with socket.socket() as s:\n        s.settimeout(0.5)\n        r = s.connect_ex(("127.0.0.1", porta))\n        print("ABERTA" if r == 0 else "fechada")\nsrv.close()\n\n# saída real:\n# ABERTA\n# fechada'
          ),
          sl(
            'Boas práticas de scripts defensivos',
            'Não coloque segredos no código (use variáveis de ambiente ou cofre); trate erros e entradas inesperadas; registre o que o script faz (log); use dados fictícios em exemplos e em testes; limite o escopo de execução; revise o código antes de rodar em ambientes reais; e versione os scripts com revisão por pares. Um script que apaga ou bloqueia coisas automaticamente deve ter modo de simulação (apenas mostrar o que faria) antes de ir para produção, para evitar bloquear usuários legítimos.'
          )
        ]
      },
      questions: [
        mcq('q1', 'No script 1, por que os dois hashes impressos são completamente diferentes se os textos diferem em um único caractere?', 'a', [
          'Porque uma pequena mudança nos dados gera um hash totalmente diferente',
          'Porque o Python embaralha o resultado aleatoriamente a cada execução, sem relação com o texto',
          'Porque o segundo texto é bem maior que o primeiro',
          'Porque hashes só funcionam com textos de tamanhos iguais'
        ], 'Funções de hash são sensíveis a qualquer alteração, o que as torna úteis para checar integridade. O resultado não é aleatório nem depende do tamanho do texto.'),
        mcq('q2', 'No script 2, qual IP é marcado como SUSPEITO e por quê?', 'd', [
          '192.0.2.10, que teve 1 falha e 1 sucesso',
          '203.0.113.5, que teve 1 falha de login',
          'Qualquer IP do log, pois cada um aparece no arquivo',
          '198.51.100.7, que teve 3 falhas de login'
        ], 'O limite do script é de 3 falhas ou mais, e só 198.51.100.7 chegou a 3. Os demais tiveram apenas 1 falha.'),
        mcq('q3', 'Se, no script 2, a condição if partes[2] == "FALHA" fosse removida, qual seria o efeito?', 'b', [
          'O script passaria a ignorar todas as linhas do log',
          'As linhas OK também seriam contadas, distorcendo o resultado',
          'O Counter deixaria de funcionar e o Python exibiria um erro',
          'Nada mudaria, pois o log só possui linhas de falha'
        ], 'Sem o filtro, o login com sucesso (OK) entraria na contagem, e os totais seriam enganosos. O log tem linhas OK.'),
        fill('q4', 'Complete com a função de hashlib que calcula o hash SHA-256 de um conjunto de bytes.', 'import hashlib\nhashlib.___(b"dados").hexdigest()', ['sha256'], 'hashlib.sha256 calcula o hash SHA-256, e hexdigest devolve o resultado em texto hexadecimal.'),
        mcq('q5', 'No script 3, o que o valor 0 devolvido por connect_ex indica?', 'c', [
          'Que a porta está fechada e não aceitou a conexão',
          'Que o computador está desligado',
          'Que a conexão funcionou, ou seja, a porta está aberta',
          'Que o servidor excedeu o tempo limite sem responder ou fechou a conexão'
        ], 'connect_ex retorna 0 quando a conexão é bem-sucedida. Outros números indicam falha, como porta fechada.'),
        mcq('q6', 'Por que o script 3 verifica somente 127.0.0.1?', 'd', [
          'Porque 127.0.0.1 é o endereço da internet inteira',
          'Porque o Python não consegue conectar em outro endereço, pois bloqueia conexões externas por padrão',
          'Porque verificações de portas são ilegais, mesmo localmente',
          'Para testar apenas a própria máquina, sem varrer sistemas de terceiros sem autorização'
        ], '127.0.0.1 é o localhost, a própria máquina. Testar sistemas alheios sem autorização pode ser crime; testar o seu próprio computador é seguro e legítimo.'),
        mcq('q7', 'Qual cuidado vale ao adaptar o script 2 para um log real de produção?', 'b', [
          'Colocar a senha do banco diretamente no código para facilitar, e compartilhar o arquivo com a equipe inteira',
          'Tratar linhas malformadas e proteger o arquivo, pois logs podem conter dados pessoais',
          'Publicar o log completo em um fórum para pedir ajuda',
          'Remover a contagem, pois o Counter não funciona com dados reais'
        ], 'Logs reais têm formatos variados e dados pessoais, exigindo validação e controle de acesso. Segredos no código e publicação do log são más práticas.'),
        fill('q8', 'Complete com a classe do módulo collections que conta quantas vezes cada item aparece.', 'from collections import ___\n\nfalhas = Counter()', ['counter'], 'Counter é um dicionário especializado em contar ocorrências, como falhas por IP.')
      ]
    },
    {
      id: 'csi-41-metricas-e-relatorios',
      title: 'Métricas e relatórios de segurança',
      goal: 'Entender MTTD e MTTR, cobertura, backlog de vulnerabilidades, a diferença entre KPIs e KRIs, como reportar à diretoria e como evitar métricas de vaidade.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que medir',
            'O que não se mede não se gerencia, e não se defende no orçamento. Métricas de segurança respondem: estamos melhorando? onde está o maior risco? o investimento está dando retorno? Mas medir sem critério produz números bonitos e inúteis. Uma boa métrica é relevante (liga-se a um objetivo), mensurável de forma repetível, compreensível pelo público, acionável (indica o que fazer) e comparável no tempo. Pergunta-teste: se este número piorar, alguém sabe o que fazer?'
          ),
          sl(
            'MTTD e MTTR',
            'MTTD (Mean Time To Detect, tempo médio para detectar) mede quanto tempo passa entre o início de um incidente e sua detecção. MTTR (Mean Time To Respond ou Recover, tempo médio para responder ou recuperar) mede o tempo entre a detecção e a contenção ou recuperação. Exemplo FICTÍCIO: três incidentes foram detectados em 2, 4 e 6 horas, e o MTTD é (2+4+6)/3 = 4 horas. Se foram contidos 1, 2 e 3 horas depois, o MTTR é 2 horas. Reduzir ambos significa menor janela para o atacante. Cuidado: médias escondem casos extremos; acompanhe também a mediana e os piores casos. Defina bem o que conta como início e fim, e use a mesma regra sempre.',
            'MTTD = (2 + 4 + 6) / 3 = 4 h\nMTTR = (1 + 2 + 3) / 3 = 2 h'
          ),
          sl(
            'Cobertura e backlog de vulnerabilidades',
            'Cobertura mede o quanto do ambiente está protegido ou monitorado: percentual de servidores com agente EDR, de sistemas enviando logs ao SIEM, de contas com MFA, de ativos inventariados. Uma métrica de 95% de cobertura significa que 5% estão cegos, e é ali que atacantes se escondem. O backlog de vulnerabilidades é a fila de falhas conhecidas ainda não corrigidas; acompanhe por gravidade, idade e exposição (por exemplo, quantas críticas expostas à internet há mais de 30 dias, conforme o prazo definido na sua política). Um backlog que só cresce é sinal de que a capacidade de correção está abaixo da de descoberta.'
          ),
          sl(
            'KPIs e KRIs',
            'KPI (Key Performance Indicator, indicador-chave de desempenho) mede o quão bem um processo está funcionando: percentual de incidentes tratados dentro do prazo, tempo médio de correção, taxa de conclusão do treinamento. KRI (Key Risk Indicator, indicador-chave de risco) sinaliza que o risco está aumentando, funcionando como um alerta antecipado: número de contas privilegiadas sem MFA, quantidade de vulnerabilidades críticas expostas, aumento de tentativas de phishing que chegam às caixas. Resumindo: o KPI olha o desempenho; o KRI olha a exposição. Ambos têm limites de alerta (limiares) definidos com o apetite de risco.'
          ),
          sl(
            'Reportando para a diretoria',
            'A diretoria decide sobre dinheiro e risco, não sobre técnicas. Regras: comece pela conclusão (como estamos?), use linguagem de negócio, poucas métricas (cerca de cinco a dez), mostre tendência (melhorando ou piorando) e meta, relacione o risco ao impacto no negócio (receita, regulação, reputação), sinalize o que precisa de decisão ou orçamento e inclua riscos aceitos. Evite jargão e telas técnicas. Seja honesto: esconder más notícias destrói a credibilidade, e a diretoria precisa conhecer os riscos para decidir. Cuidado com dados pessoais nos relatórios: prefira números agregados.'
          ),
          sl(
            'Evitando métricas de vaidade',
            'Métricas de vaidade parecem impressionantes mas não orientam decisões: número de ataques bloqueados pelo firewall (a maioria é ruído automatizado e não diz se você está mais seguro), quantidade de alertas gerados (mais alertas podem significar regras ruins), número de ferramentas compradas ou de scans realizados. Prefira métricas de resultado: o tempo de exposição de vulnerabilidades críticas, o percentual de ativos cobertos, o tempo de detecção e resposta. Teste: a métrica muda uma decisão? Se não, provavelmente é vaidade. Também cuidado com a lei de Goodhart: quando uma medida vira meta, as pessoas passam a otimizar o número e não o objetivo.'
          ),
          sl(
            'Qualidade dos dados e rotina',
            'Métricas dependem de dados confiáveis: inventário completo, fontes padronizadas, definição documentada de cada indicador (fórmula, fonte, periodicidade e dono) e coleta automatizada sempre que possível. Estabeleça uma rotina: relatório operacional frequente para o time, e gerencial e executivo em periodicidades maiores. Documente mudanças de metodologia, para não comparar números incomparáveis. Revise as métricas periodicamente e descarte as que ninguém usa.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Três incidentes foram detectados em 3, 5 e 10 horas após o início. Qual o MTTD (valores fictícios)?', 'a', [
          '6 horas',
          '5 horas',
          '10 horas',
          '18 horas'
        ], '(3 + 5 + 10) / 3 = 6 horas. 18 é a soma, 5 é a mediana, e 10 é o pior caso.'),
        mcq('q2', 'O que o MTTR mede?', 'c', [
          'O tempo entre o início do ataque e a primeira detecção',
          'O número de ataques bloqueados pelo firewall por dia',
          'O tempo médio entre a detecção e a contenção ou recuperação',
          'O percentual de funcionários que concluíram o treinamento'
        ], 'MTTR trata da resposta ou recuperação após a detecção. O tempo até detectar é o MTTD.'),
        mcq('q3', 'Qual é um exemplo de KRI?', 'c', [
          'Percentual de relatórios entregues no prazo',
          'Quantidade de reuniões de segurança por mês',
          'Número de contas privilegiadas sem MFA',
          'Tamanho do orçamento anual do departamento de TI'
        ], 'KRI sinaliza aumento de exposição, como contas privilegiadas sem MFA. As outras opções medem desempenho de processos ou recursos.'),
        fill('q4', 'Complete com a sigla do indicador que mede o desempenho de um processo.', '___ = Key Performance Indicator', ['kpi'], 'KPI mede o desempenho; o KRI, a exposição ao risco.'),
        mcq('q5', 'Um relatório destaca \'ataques bloqueados pelo firewall: 2 milhões este mês\'. Por que isso é uma possível métrica de vaidade?', 'a', [
          'Não indica se a organização está mais segura nem orienta nenhuma decisão',
          'Porque firewalls bloqueiam ataques que o painel não registra',
          'Porque o número é pequeno demais para ser importante',
          'Porque só pode ser medido uma vez por ano, e portanto não reflete a realidade do mês'
        ], 'O volume bruto é dominado por ruído automatizado e não mostra melhora de risco. Firewalls bloqueiam tráfego, e a frequência de medição não é o problema.'),
        mcq('q6', 'Ao reportar à diretoria, qual abordagem é mais adequada?', 'd', [
          'Apresentar todas as telas da ferramenta de SIEM em ordem cronológica, para mostrar o trabalho feito',
          'Evitar falar de riscos aceitos para não preocupar ninguém',
          'Usar o máximo de siglas técnicas para demonstrar domínio',
          'Começar pela conclusão, usar poucas métricas com tendência e relacionar o risco ao negócio'
        ], 'A diretoria precisa de conclusão, tendência e impacto no negócio. Jargão, telas técnicas e omissão de riscos prejudicam a decisão.'),
        mcq('q7', 'Qual situação ilustra a lei de Goodhart?', 'b', [
          'Quando uma métrica é calculada de forma automática',
          'Quando o tempo de fechamento de chamados vira meta e pessoas fecham chamados sem resolver',
          'Quando o relatório é entregue com a data correta',
          'Quando um indicador é revisado por pessoas diferentes, e cada uma sugere pequenos ajustes de fórmula'
        ], 'Quando a medida vira meta, as pessoas otimizam o número e não o objetivo, distorcendo-o.'),
        fill('q8', 'Complete com a sigla da métrica de tempo médio para detectar um incidente.', '___ = Mean Time To Detect', ['mttd'], 'MTTD mede a velocidade de detecção, um dos principais indicadores do SOC.')
      ]
    },
    {
      id: 'csi-42-seguranca-de-aplicacoes-resumo',
      title: 'Segurança de aplicações: visão geral',
      goal: 'Ter a visão de cibersegurança sobre segurança de aplicações: OWASP Top 10 em conceito, revisão de código, WAF e segurança de APIs, apontando o curso de OWASP para a profundidade.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que aplicações importam',
            'Aplicações (sites, aplicativos, APIs) são a porta pela qual clientes e funcionários acessam dados e funções, e muitas ficam expostas à internet. Para a organização, a segurança de aplicações é parte do programa geral de cibersegurança, ligada a risco, governança e resposta a incidentes. Esta lição dá a visão geral; para a profundidade técnica de cada vulnerabilidade, com laboratório local seguro, veja o curso de OWASP, nesta mesma plataforma.'
          ),
          sl(
            'OWASP Top 10 em conceito',
            'A OWASP (Open Worldwide Application Security Project) é uma comunidade que publica materiais abertos de segurança. O Top 10 é uma lista de categorias de risco mais críticas em aplicações web, revisada periodicamente (confira a edição vigente no site oficial). Em conceito, as categorias tratam de: falhas de controle de acesso (usuário acessa o que não deveria), falhas criptográficas (dados sem proteção adequada), injeção (dados do usuário interpretados como comando), design inseguro, configuração incorreta, componentes vulneráveis e desatualizados, falhas de autenticação, falhas de integridade de software e dados, falhas de registro e monitoramento, e requisições forjadas do lado do servidor. O Top 10 não é uma lista completa de tudo o que pode dar errado, mas um bom ponto de partida de conscientização.'
          ),
          sl(
            'Revisão de código e testes',
            'Revisão de código é a leitura do código por outra pessoa antes de entrar em produção, procurando falhas de lógica e de segurança. Checklist de olhar: toda entrada do usuário é validada? permissões são conferidas no servidor? segredos estão fora do código? erros expõem detalhes internos? dados sensíveis aparecem em logs? Combine com verificações automáticas (SAST, SCA, DAST, vistos na lição de DevSecOps) e com testes de segurança antes de grandes lançamentos. Erro comum: confiar só em ferramentas automáticas, que não entendem a regra de negócio.'
          ),
          sl(
            'WAF',
            'WAF (Web Application Firewall) é um firewall que entende o tráfego web (HTTP): examina as requisições e bloqueia padrões maliciosos conhecidos antes de chegar à aplicação. É útil como camada extra, como proteção temporária enquanto uma correção é desenvolvida (chamada de patch virtual) e para limitar volume de requisições. Limites: não conhece a lógica do seu negócio, pode gerar falsos positivos (bloquear usuários legítimos), pode ser contornado se a aplicação tiver falhas sutis e não substitui o código seguro. Trate o WAF como complemento, e não como solução única.'
          ),
          sl(
            'Segurança de APIs',
            'API (Application Programming Interface) é a interface pela qual sistemas conversam entre si, com muita frequência usada por aplicativos de celular e integrações. Boas práticas essenciais: autenticar todas as chamadas e autorizar cada recurso (um usuário só acessa os seus dados, e isso deve ser verificado a cada requisição, não só no login); limitar a taxa de chamadas; validar entrada; devolver apenas os campos necessários (para não expor dados em excesso); manter inventário de APIs, inclusive as antigas e esquecidas; usar HTTPS e registrar acessos para detecção. Atenção: APIs não documentadas, que ninguém lembra, são um risco típico.'
          ),
          sl(
            'Juntando as peças',
            'Segurança de aplicações combina: requisitos e design seguros, código revisado, dependências controladas (SBOM), testes automatizados, WAF e rate limit na borda, monitoramento com logs úteis (sem dados pessoais indevidos) e resposta a incidentes. Do ponto de vista de gestão, entram o registro de riscos, a classificação dos dados que a aplicação trata, a LGPD, as métricas de correção e os exercícios de resposta. Uma vulnerabilidade encontrada deve ser tratada como qualquer outro risco: priorizada pelo impacto e pela exposição, corrigida e verificada.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que é o OWASP Top 10?', 'd', [
          'Uma lista oficial e fixa, que não muda, com os ataques que existem',
          'Um produto pago de firewall que bloqueia dez tipos de ataque, vendido por assinatura anual',
          'Uma lei brasileira que obriga a correção de dez falhas por ano',
          'Uma lista aberta e periodicamente revisada das categorias de risco mais críticas em aplicações web'
        ], 'O Top 10 é um material de conscientização e priorização, atualizado de tempos em tempos. Não é lei, produto nem lista completa.'),
        mcq('q2', 'Um usuário altera um número na URL e vê dados de outro cliente. Qual categoria conceitual do Top 10 se relaciona?', 'a', [
          'Falha de controle de acesso',
          'Falha de registro e monitoramento',
          'Excesso de capacidade de rede',
          'Problema de formatação do site'
        ], 'Acessar dados de outra pessoa por falta de verificação de permissão é falha de controle de acesso. Aprofunde no curso de OWASP.'),
        mcq('q3', 'Qual a função de uma revisão de código com foco em segurança?', 'b', [
          'Substituir qualquer teste automatizado e dispensar ferramentas',
          'Encontrar falhas de lógica e segurança antes de a alteração ir para produção',
          'Aumentar o número de linhas de código do projeto, sem relação com a qualidade das entregas',
          'Garantir que o código tenha menos comentários'
        ], 'A revisão por outra pessoa encontra falhas que o autor não vê. Complementa, e não substitui, as ferramentas automáticas.'),
        fill('q4', 'Complete com a sigla do firewall que entende o tráfego web e bloqueia padrões maliciosos conhecidos.', '___ = Web Application Firewall', ['waf'], 'O WAF atua na camada de aplicação web como defesa adicional.'),
        mcq('q5', 'Qual limitação do WAF deve ser lembrada?', 'c', [
          'Só funciona para sites que não recebem acessos',
          'Impede qualquer vulnerabilidade, mesmo na lógica de negócio',
          'Não substitui o código seguro e pode gerar falsos positivos',
          'Só existe para aplicativos de celular'
        ], 'O WAF é uma camada extra, sem conhecer a lógica do negócio, e pode bloquear usuários legítimos. Não resolve tudo.'),
        mcq('q6', 'Numa API, por que a autorização deve ser verificada em cada requisição?', 'a', [
          'Porque estar autenticado não significa ter permissão para todos os recursos',
          'Porque a API esquece quem é o usuário a cada segundo, sem exceção, o que obriga novo login contínuo',
          'Porque verificar uma vez no login já impede qualquer acesso indevido',
          'Porque a autorização é opcional em APIs internas'
        ], 'Autenticar identifica a pessoa; autorizar define o que ela pode acessar, e isso precisa ser verificado a cada recurso. Verificar só no login deixa brechas.'),
        mcq('q7', 'Qual risco típico se associa a APIs antigas e esquecidas pela equipe?', 'c', [
          'Passam a consumir menos recursos e dispensam proteção, pois ninguém as utiliza mais',
          'Deixam de existir automaticamente após um ano sem uso',
          'Ficam sem manutenção e monitoramento, tornando-se pontos de entrada vulneráveis',
          'Ficam mais seguras por serem desconhecidas'
        ], 'APIs sem inventário e sem manutenção são alvo fácil, e segurança por obscuridade não funciona.'),
        fill('q8', 'Complete com a sigla da interface pela qual sistemas conversam entre si, comum em aplicativos de celular.', '___ = Application Programming Interface', ['api'], 'A API expõe funções e dados a outros sistemas e precisa de autenticação, autorização e limites.')
      ]
    },
  ]
};
