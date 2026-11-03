// Módulo "Fundamentos" do curso de Cibersegurança (geral) — nível iniciante, parte A.
// Cada lição tem 8 questões (3 múltipla escolha + 1 lacuna, duas vezes). Ver ../../index.js para
// o formato e a validação de boot. Curso DEFENSIVO e educacional: cada ameaça é explicada junto de
// como prevenir, detectar e responder. Nenhum malware, exploit ou instrução de golpe replicável.
// Nenhum dado pessoal real (nomes, e-mails e valores são fictícios), segredos sempre <placeholder>,
// nenhuma versão ou estatística é afirmada — só conceitos estáveis. Não é aconselhamento jurídico
// (LGPD, Marco Civil, Lei 12.737/2012 e Lei 14.155/2021 são citados só em visão geral).
// Helpers locais (mcq, fill, sl) produzem o formato exigido pela validação do boot: mcq recebe a
// letra correta e as 4 alternativas em ordem a, b, c, d; fill recebe prompt, código com a lacuna
// ___ e a lista de respostas aceitas (a 1ª é a canônica); sl() monta um slide (code opcional).
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
  id: 'fundamentos-ciber',
  levelKey: 'beginner',
  order: 1,
  title: 'Fundamentos',
  subtitle: 'Tríade CIA, vocabulário de risco, quem ataca, malware, phishing, senhas, MFA, criptografia, navegação, e-mail, atualizações, dispositivos, Wi-Fi, backup, privacidade, redes sociais, fraudes financeiras e celulares',
  accent: '#0ea5e9',
  lessons: [
    {
      id: 'csb-01-o-que-e-ciberseguranca',
      title: 'O que é cibersegurança e por que importa',
      goal: 'Entender o que é proteger informação digital, o que são ativos e como a tríade CIA (confidencialidade, integridade, disponibilidade) ajuda a pensar em qualquer problema de segurança.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é cibersegurança',
            'Cibersegurança é o conjunto de cuidados para proteger computadores, celulares, redes, contas e, principalmente, as INFORMAÇÕES que existem dentro deles. Pense na segurança da sua casa: tranca na porta, chave que só você tem, alguém de confiança com cópia, um jeito de saber se alguém entrou. Na vida digital é igual: você protege o que tem valor contra quem não deveria acessar, alterar ou derrubar. Não é coisa só de especialista: a maior parte da proteção vem de hábitos simples de quem usa o celular e o computador todo dia.'
          ),
          sl(
            'Ativos: o que tem valor para proteger',
            'Na segurança, chamamos de ATIVO qualquer coisa que tem valor para alguém e merece proteção. Exemplos para uma pessoa: fotos da família, conta do banco, chave Pix, conversas do WhatsApp, e-mail (que serve para recuperar todas as outras contas), documentos escaneados. Exemplos para uma empresa: cadastro de clientes, planilhas de preços, sistema de vendas, site, computadores dos funcionários. O primeiro passo de qualquer proteção é perguntar: o que eu tenho que seria ruim perder, vazar ou ver alterado? Esse é o seu mapa de ativos.'
          ),
          sl(
            'A tríade CIA, parte 1: confidencialidade',
            'Três palavras resumem o que queremos proteger. A primeira é CONFIDENCIALIDADE: só quem tem permissão enxerga a informação. Analogia: uma carta lacrada que só o destinatário abre. Se alguém lê suas mensagens privadas, vê seu extrato ou copia o cadastro de clientes de uma loja, a confidencialidade foi quebrada. Defesas típicas: senhas, criptografia, controle de quem pode ver o quê.',
            'Confidencialidade -> quem pode LER\nExemplo de quebra: vazamento de dados de clientes'
          ),
          sl(
            'A tríade CIA, parte 2: integridade',
            'A segunda é INTEGRIDADE: a informação continua correta e só muda quando e como deveria. Analogia: um cheque cujo valor ninguém consegue rasurar sem deixar marca. Se alguém troca a chave Pix de um boleto, altera o valor de uma transferência ou muda o preço no sistema de uma loja, a integridade foi quebrada, e muitas vezes ninguém percebe na hora. Defesas típicas: controle de quem pode editar, registros de quem mudou o quê, assinaturas e verificações (você verá hash e assinatura digital em uma lição própria).',
            'Integridade -> a informacao NAO foi alterada indevidamente\nExemplo de quebra: boleto com codigo de barras trocado'
          ),
          sl(
            'A tríade CIA, parte 3: disponibilidade',
            'A terceira é DISPONIBILIDADE: o sistema e a informação estão acessíveis quando você precisa. Analogia: uma loja que abre no horário e não está com a porta emperrada. Se o app do banco fica fora do ar, se o site da loja cai na Black Friday por excesso de acessos propositais, ou se um sequestro de dados (ransomware, que você verá adiante) tranca seus arquivos, a disponibilidade foi quebrada. Defesas típicas: cópias de segurança (backup), servidores reserva e planos para voltar a funcionar. As três juntas formam a tríade CIA (do inglês Confidentiality, Integrity, Availability).',
            'Disponibilidade -> o servico FUNCIONA quando preciso\nExemplo de quebra: arquivos trancados por ransomware'
          ),
          sl(
            'Usando a tríade na prática',
            'A tríade é uma lente: diante de qualquer incidente, pergunte qual das três foi atingida. Alguém leu o que não devia? Confidencialidade. Alguém mudou um dado sem autorização? Integridade. O serviço parou ou o arquivo sumiu? Disponibilidade. Um mesmo ataque pode atingir mais de uma: um ransomware que também copia seus arquivos antes de trancar fere disponibilidade E confidencialidade. A tríade também ajuda a priorizar: um hospital precisa muito de disponibilidade; um laboratório com dados de pacientes precisa muito de confidencialidade; um banco precisa muito de integridade.'
          ),
          sl(
            'Por que importa: impacto em pessoas e empresas',
            'Para uma pessoa, um incidente pode significar dinheiro perdido, conta bancária esvaziada, fotos íntimas expostas, identidade usada em golpes, dias de trabalho para recuperar contas e desgaste emocional. Para uma empresa: parada nas vendas, dados de clientes expostos, custo de investigar e corrigir, perda de confiança e obrigações legais, como as da LGPD (Lei 13.709/2018), que exige cuidado com dados pessoais (isto é uma visão geral e não substitui orientação jurídica). Um erro comum é pensar "eu não tenho nada importante". Quem pensa assim esquece que o e-mail, o WhatsApp e o número de celular já são ativos muito visados. Outro erro comum: achar que segurança é só tecnologia; muitos incidentes começam com uma pessoa enganada, e não com uma máquina invadida.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um funcionário de uma loja altera sem autorização o preço de um produto no sistema para R$ 1,00 e ninguém percebe. Qual propriedade da tríade CIA foi quebrada?', 'b', [
          'Confidencialidade, porque o preço original do produto foi visto por quem não devia',
          'Integridade, porque a informação foi alterada de forma indevida',
          'Disponibilidade, porque o preço correto deixou de estar acessível aos clientes da loja',
          'Autenticidade, que é a quarta letra da tríade e trata de quem alterou o dado'
        ], 'Mudar um dado sem autorização fere a integridade. Confidencialidade é sobre quem LÊ, disponibilidade é sobre o serviço estar de pé, e a tríade tem só três letras (CIA).'),
        mcq('q2', 'O app do seu banco fica fora do ar o dia inteiro por causa de um ataque que o sobrecarrega. Isso afeta principalmente qual propriedade?', 'd', [
          'Confidencialidade, pois ninguém consegue mais enxergar o saldo da própria conta',
          'Integridade, pois o saldo mostrado deixa de ser confiável enquanto o app está parado',
          'Integridade, porque o ataque deixou os dados dos clientes diferentes do original',
          'Disponibilidade, pois o serviço não funciona quando é necessário'
        ], 'Serviço fora do ar quebra a disponibilidade, mesmo sem roubo ou alteração de dados. Não ter dado roubado não significa que nada foi atingido.'),
        mcq('q3', 'Qual das opções é um exemplo de ATIVO para uma pessoa comum?', 'a', [
          'O e-mail principal, que serve para recuperar outras contas',
          'O barulho do alarme do celular quando chega uma mensagem nova',
          'A cor da capinha e a marca do aparelho que você usa no dia a dia',
          'O modelo do roteador impresso na caixa'
        ], 'Ativo é tudo que tem valor e merece proteção. O e-mail principal recupera outras contas e por isso é muito visado; as outras opções não guardam valor a proteger.'),
        fill('q4', 'Complete com a palavra que representa a propriedade que garante que só quem tem permissão enxerga a informação.', 'C = ___ (só quem tem permissão lê)', ['confidencialidade', 'confidentiality'], 'A letra C da tríade é confidencialidade: impedir que a informação chegue a quem não deve vê-la.'),
        mcq('q5', 'Um ransomware tranca todos os arquivos de uma clínica e, antes disso, copia os prontuários dos pacientes. Quais propriedades da tríade foram atingidas?', 'c', [
          'A disponibilidade, porque o foco do ransomware é trancar os arquivos do hospital',
          'A integridade, porque os arquivos foram modificados ao serem trancados',
          'Disponibilidade e confidencialidade, pois os arquivos pararam de abrir e dados foram copiados',
          'Nenhuma, já que a clínica pode simplesmente reiniciar os computadores e voltar ao normal'
        ], 'Trancar arquivos fere a disponibilidade; copiar prontuários fere a confidencialidade. Um mesmo ataque pode atingir mais de uma propriedade.'),
        mcq('q6', 'Por que a frase "eu não tenho nada importante no celular" costuma estar errada?', 'a', [
          'Porque WhatsApp, e-mail e número de telefone já são ativos muito visados por golpistas',
          'Porque celulares só guardam informação de valor quando são do modelo mais caro à venda',
          'Porque os golpistas só se interessam por quem tem muitos seguidores em rede social',
          'Porque a lei obriga todo celular a guardar documentos oficiais do dono em pasta protegida'
        ], 'Contas de mensagem e e-mail permitem aplicar golpes e recuperar outras contas, então têm valor mesmo para quem acha que não tem nada importante. O resto não corresponde à realidade.'),
        mcq('q7', 'Um hospital precisa, acima de tudo, que o sistema de atendimento nunca fique parado. Qual propriedade da tríade ele mais prioriza nesse caso?', 'd', [
          'Confidencialidade, pois o foco é impedir que qualquer pessoa veja os dados',
          'Integridade, pois o foco é só evitar que o valor dos atendimentos seja alterado',
          'Autenticação, pois o importante é saber quem está logado em cada máquina',
          'Disponibilidade'
        ], 'Se o sistema precisa estar sempre de pé para salvar vidas, a prioridade é a disponibilidade. As outras propriedades também importam, mas o requisito descrito é de funcionamento contínuo.'),
        fill('q8', 'Complete: a sigla CIA vem de Confidentiality, Integrity e ___ em inglês, que em português é a propriedade de o serviço estar acessível quando necessário.', 'C, I, A = Confidentiality, Integrity, ___', ['availability', 'disponibilidade'], 'A letra A é Availability, em português disponibilidade: o sistema funciona quando você precisa dele.')
      ]
    },
    {
      id: 'csb-02-vocabulario-risco-ameaca-vulnerabilidade',
      title: 'Vocabulário: ameaça, vulnerabilidade, risco e controle',
      goal: 'Distinguir ameaça, vulnerabilidade, risco, exploit, ataque, incidente, superfície de ataque e controle, usando exemplos do dia a dia.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que aprender o vocabulário',
            'Em segurança, palavras parecidas têm significados bem diferentes, e misturá-las leva a decisões ruins (gastar dinheiro no problema errado). Nesta lição você aprende oito termos. Para fixá-los vamos usar sempre a mesma cena: uma casa com uma janela dos fundos cujo trinco está quebrado.'
          ),
          sl(
            'Ameaça e vulnerabilidade',
            'AMEAÇA é qualquer coisa ou pessoa que pode causar dano a um ativo: um ladrão, uma enchente, um golpista no WhatsApp, um vírus. Ela existe de fora, independente de você. VULNERABILIDADE é uma fraqueza que a ameaça pode aproveitar: o trinco quebrado da janela, um programa desatualizado com falha conhecida, uma senha fácil como 123456, um funcionário sem treinamento. A vulnerabilidade existe de dentro, no seu ambiente. Uma ameaça sem vulnerabilidade tem dificuldade de causar dano; uma vulnerabilidade sem ameaça por perto é só um defeito esperando.',
            'Ameaca        = o ladrao (pode causar dano)\nVulnerabilidade = o trinco quebrado (fraqueza)'
          ),
          sl(
            'Risco',
            'RISCO é a chance de uma ameaça aproveitar uma vulnerabilidade e causar um dano, considerando o tamanho do impacto. Resumindo: risco = probabilidade x impacto. Janela quebrada em casa de rua movimentada com joias dentro: risco alto. Janela quebrada no sótão de uma casa sem nada de valor: risco baixo. Importante: nem todo risco precisa ser eliminado; ele pode ser reduzido, aceito, transferido (um seguro) ou evitado. Esse é o motivo de se começar sempre pelos riscos maiores, em vez de tentar proteger tudo igual.',
            'Risco = probabilidade x impacto\nAlta chance + dano grande = risco alto'
          ),
          sl(
            'Exploit e ataque',
            'EXPLOIT é a técnica ou ferramenta que se aproveita de uma vulnerabilidade específica: no exemplo, o jeito de abrir aquele trinco sem a chave. ATAQUE é a ação em si, a tentativa real de causar dano usando uma ameaça e, muitas vezes, um exploit: o ladrão efetivamente tentando entrar. Um ataque pode ter sucesso ou falhar. Aqui o curso fala só de mecanismo e defesa, nunca ensina a montar um exploit.'
          ),
          sl(
            'Incidente',
            'INCIDENTE é um evento que realmente compromete (ou ameaça seriamente) a confidencialidade, integridade ou disponibilidade de um ativo: o ladrão entrou e levou algo, ou a conta do Instagram foi sequestrada, ou os arquivos foram trancados. Todo incidente começa com um ataque que deu certo ou com um erro, mas nem todo ataque vira incidente: se a tentativa foi barrada, houve ataque, não houve incidente. Quando um incidente acontece, o importante é saber o que fazer: conter, entender, recuperar e aprender.'
          ),
          sl(
            'Superfície de ataque e controle',
            'SUPERFÍCIE DE ATAQUE é o conjunto de todos os pontos por onde um atacante poderia tentar entrar: portas, janelas e a garagem da casa; no mundo digital, cada conta, aplicativo instalado, aparelho conectado, e-mail e serviço aberto na internet. Quanto mais coisas você tem e usa, maior a superfície; apagar contas antigas e desinstalar apps sem uso a reduz. CONTROLE é qualquer medida que reduz risco: trocar o trinco, instalar alarme, ligar a verificação em duas etapas, fazer backup, treinar a equipe. Controles podem prevenir (a tranca), detectar (o alarme) ou responder/recuperar (o seguro e o backup).'
          ),
          sl(
            'Juntando tudo, e um erro comum',
            'Cena completa: a ameaça (ladrão) usa um exploit (o jeito de abrir o trinco) contra a vulnerabilidade (trinco quebrado) em um ataque; se ele entra e leva algo, houve um incidente; o risco media a chance e o impacto disso; o controle (trocar o trinco) reduz o risco. Erro comum: chamar tudo de "vírus" ou de "hacker". Um programa desatualizado é vulnerabilidade, não ameaça. O criminoso é a ameaça, não a vulnerabilidade. E ligar um antivírus é controle, não garantia de risco zero.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um programa instalado no seu computador está desatualizado e tem uma falha conhecida. Como se classifica essa falha?', 'c', [
          'Ameaça, porque é o que pode causar o dano diretamente no computador',
          'Incidente, porque a falha já é um evento que compromete o computador',
          'Vulnerabilidade',
          'Controle, porque o programa antigo ainda cumpre a função para a qual foi instalado'
        ], 'Uma fraqueza que pode ser aproveitada é vulnerabilidade. Ameaça é quem ou o que causa dano; incidente é quando o dano de fato ocorre; controle é uma medida que reduz o risco.'),
        mcq('q2', 'Em qual situação o risco é maior?', 'a', [
          'A conta do banco usa senha fraca e é muito visada por golpistas, e há dinheiro nela',
          'Um computador antigo e desligado, guardado no armário, com uma senha fraca nele',
          'Uma conta de jogo que o dono não usa mais e que tem só um apelido cadastrado',
          'Um celular sem uso, sem chip, desligado e guardado em uma gaveta fechada'
        ], 'Risco é probabilidade x impacto. Conta bancária com dinheiro e alvo frequente reúne alta chance e alto impacto. As outras envolvem pouco impacto ou pouca chance.'),
        mcq('q3', 'Qual é a melhor definição de superfície de ataque?', 'd', [
          'O tipo de vírus mais comum no momento e que mais circula na internet',
          'O local físico onde o computador fica guardado, como a sala de uma empresa',
          'A lista de senhas já descobertas por golpistas em vazamentos de dados antigos',
          'O conjunto de pontos por onde um atacante pode tentar entrar'
        ], 'Superfície de ataque é o conjunto de pontos de entrada possíveis. Quanto mais contas, apps e aparelhos, maior; por isso apagar o que não se usa ajuda.'),
        fill('q4', 'Complete: a fórmula básica do risco é probabilidade multiplicada pelo ___ do dano.', 'risco = probabilidade x ___', ['impacto'], 'Risco combina a chance de acontecer com o tamanho do dano, ou seja, probabilidade x impacto.'),
        mcq('q5', 'Alguém tentou invadir uma conta, mas o bloqueio por excesso de tentativas barrou o acesso e nada foi comprometido. O que aconteceu?', 'b', [
          'Um incidente completo, porque o criminoso tentou entrar na conta',
          'Um ataque que foi barrado por um controle, sem incidente',
          'Uma vulnerabilidade, já que a conta foi alvo de tentativa de invasão',
          'Um exploit, porque o bloqueio foi acionado por tentativas de login seguidas'
        ], 'Ataque é a tentativa; incidente exige comprometimento real. Aqui o bloqueio funcionou como controle. Exploit é a técnica que usa uma falha; vulnerabilidade é a fraqueza.'),
        mcq('q6', 'Qual destas ações é um CONTROLE do tipo detecção?', 'd', [
          'Trocar a senha fraca por uma senha longa e diferente das outras contas',
          'Manter uma cópia de segurança em outro lugar',
          'Desinstalar um aplicativo que o dono não abre mais no celular',
          'Receber um alerta quando alguém entra na conta de um aparelho novo'
        ], 'Detecção é perceber que algo está acontecendo. O alerta de novo acesso faz isso. Trocar senha previne, backup ajuda a recuperar, e desinstalar app reduz superfície.'),
        mcq('q7', 'Uma pessoa instala uma tranca nova depois de perceber o trinco quebrado. O que ela está fazendo, em termos de segurança?', 'a', [
          'Reduzindo o risco ao corrigir a vulnerabilidade com um controle',
          'Aumentando a ameaça, porque a tranca nova chama atenção dos ladrões',
          'Criando um novo incidente, já que mexeu na estrutura da casa',
          'Aumentando a superfície de ataque ao acrescentar mais uma peça à porta'
        ], 'Trocar o trinco corrige a fraqueza e reduz o risco, ou seja, aplica um controle. Isso não cria incidente nem aumenta ameaça.'),
        fill('q8', 'Complete com o nome da técnica ou ferramenta que se aproveita de uma vulnerabilidade específica (em inglês, mas muito usado em português).', 'A técnica que usa uma falha específica = ___', ['exploit'], 'Exploit é a técnica que explora uma vulnerabilidade específica; a vulnerabilidade é a fraqueza, e o ataque é a ação.')
      ]
    },
    {
      id: 'csb-03-atores-de-ameaca',
      title: 'Quem ataca e por quê: atores de ameaça',
      goal: 'Reconhecer os principais tipos de atores de ameaça, suas motivações, e a diferença entre hackers white hat, black hat e grey hat, sem glorificar ninguém.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que conhecer quem ataca',
            'Defender bem exige saber contra quem e por quê: o golpista que quer dinheiro rápido age diferente de um grupo que quer espionar um governo. Chamamos de ATOR DE AMEAÇA qualquer pessoa ou grupo que tenta causar dano digital. Para quase todo mundo, o ator mais provável é o criminoso comum e oportunista, não um gênio de filme. Entender isso evita dois erros: achar que ninguém tem interesse em você, e achar que só uma agência secreta poderia te atingir.'
          ),
          sl(
            'Cibercriminosos',
            'São pessoas ou organizações que atacam por DINHEIRO. Operam como empresas: dividem tarefas, vendem ferramentas e dados roubados uns aos outros e atacam em massa, sem escolher a vítima. Golpes de phishing, fraudes com Pix e cartão, roubo de contas e sequestro de dados (ransomware) vêm daqui. Como o objetivo é lucro, costumam preferir o alvo mais fácil: quem tem senha fraca e não atualiza o sistema vira alvo antes de quem se protege.'
          ),
          sl(
            'Hacktivistas, insiders e estados',
            'HACKTIVISTAS atacam por causa de uma causa política ou social: derrubar o site de uma organização, vazar documentos para expor algo ou pichar páginas. INSIDERS são pessoas de DENTRO da organização (funcionário, ex-funcionário, prestador) que têm acesso legítimo e o usam mal por raiva, dinheiro ou pressão, ou que causam dano por descuido, sem querer. O insider é perigoso porque já passou pelas portas. ATORES ESTATAIS são grupos ligados a governos que fazem espionagem ou sabotagem, com muito recurso e paciência; costumam mirar governos, infraestrutura e empresas estratégicas, não o cidadão comum.'
          ),
          sl(
            'Script kiddies e motivações',
            'SCRIPT KIDDIES são iniciantes que usam ferramentas prontas de terceiros sem entender como funcionam, por curiosidade, diversão ou para se exibir. Apesar do nome, podem causar dano real, justamente por não medirem consequências. Em resumo, as motivações mais comuns são: dinheiro (a maioria), ideologia, espionagem, vingança e curiosidade/ego. Saber a motivação ajuda a prever o alvo: se o objetivo é dinheiro, contas bancárias e dados de cartão serão procurados; se é ideologia, sites e imagem de uma organização.'
          ),
          sl(
            'Hackers: white hat, black hat e grey hat',
            'A palavra hacker, no sentido técnico, é quem entende a fundo como sistemas funcionam; só se torna problema o que se faz com esse conhecimento. Usamos chapéus como rótulo: WHITE HAT é quem testa sistemas COM AUTORIZAÇÃO, para achar falhas e ajudar a corrigi-las (profissionais de segurança e pesquisadores). BLACK HAT é quem ataca SEM autorização, para ganho próprio ou para causar dano, e comete crime. GREY HAT fica no meio: age sem permissão, mas sem intenção maliciosa, por exemplo avisando uma empresa de uma falha que achou. Mesmo assim, entrar em sistema alheio sem autorização pode ser crime no Brasil (Lei 12.737/2012, visão geral, não substitui orientação jurídica).'
          ),
          sl(
            'Sem glorificar',
            'O termo hacker é muito romantizado em filmes. Na vida real, ataque a terceiros causa prejuízo a pessoas reais: famílias que perdem economias, hospitais parados, pequenos comércios fechados. A diferença entre profissional e criminoso não é a habilidade, é a AUTORIZAÇÃO e a ética. Neste curso o foco é proteger e responder, e nenhuma técnica é ensinada para uso contra terceiros. Quem quer seguir na área pode praticar legalmente em laboratórios próprios e programas de recompensa por falhas (bug bounty), que dão permissão formal.'
          ),
          sl(
            'Como isso muda sua defesa',
            'Para o cidadão comum e para a pequena empresa, o ator mais provável é o cibercriminoso oportunista: a defesa é feita de hábitos básicos (senhas fortes, MFA, atualizações, backup, desconfiança de mensagens urgentes). Contra insiders, ajudam permissões mínimas (cada pessoa acessa só o necessário), registros de atividade e retirada de acesso quando alguém sai. Contra hacktivistas, ajudam disponibilidade (proteção contra derrubada) e cuidado com publicações. Contra estados, são necessárias defesas avançadas que você verá nos níveis seguintes. Erro comum: gastar muito contra o ator raro e esquecer o básico contra o ator comum.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a motivação mais comum entre os criminosos que aplicam golpes de phishing e fraudes com Pix?', 'b', [
          'Ideologia política, com o objetivo de divulgar uma causa para o público em geral',
          'Dinheiro, com ataques em massa a quem for mais fácil',
          'Espionagem, para obter segredos de governos estrangeiros e de grandes empresas',
          'Curiosidade, pois a maioria desses golpistas está testando ferramentas novas'
        ], 'Cibercriminosos atacam por dinheiro e preferem alvos fáceis, em escala. Ideologia é do hacktivista, espionagem de atores estatais, curiosidade dos script kiddies.'),
        mcq('q2', 'Uma funcionária que acabou de ser demitida ainda tem a senha do sistema ativa e apaga arquivos da empresa por raiva. Que tipo de ator é esse?', 'c', [
          'Hacktivista, porque está protestando contra uma decisão da empresa',
          'Ator estatal, porque causou dano a uma organização com acesso privilegiado',
          'Insider, pois usou um acesso legítimo de dentro da organização',
          'Script kiddie, porque agiu sem planejamento e sem conhecer o sistema a fundo'
        ], 'Insider é a pessoa de dentro com acesso legítimo que o usa mal. A lição para a defesa é retirar o acesso de quem sai e dar a cada pessoa só o necessário.'),
        mcq('q3', 'O que diferencia um hacker white hat de um black hat?', 'd', [
          'O white hat usa programas mais simples, enquanto o black hat domina técnicas avançadas',
          'O white hat trabalha só em empresas grandes, e o black hat só atua sozinho',
          'O white hat conhece mais a tecnologia do que o black hat e por isso corrige mais falhas',
          'O white hat age com autorização para ajudar a corrigir falhas, e o black hat ataca sem permissão'
        ], 'A diferença é autorização e ética, não habilidade nem tamanho do empregador. Testar com permissão é profissão; atacar sem permissão é crime.'),
        fill('q4', 'Complete com o nome do hacker que testa sistemas COM autorização para ajudar a corrigir falhas.', '___ hat = testa com autorização', ['white', 'white hat'], 'White hat é o profissional ou pesquisador que age com autorização para melhorar a segurança.'),
        mcq('q5', 'Um jovem baixa uma ferramenta pronta que viu em um vídeo e a usa para derrubar o site de um colega, sem entender como ela funciona. Que tipo de ator é mais adequado para descrevê-lo?', 'a', [
          'Script kiddie',
          'Cibercriminoso organizado, pois a ação foi planejada para dar prejuízo',
          'Ator estatal, já que ele usou uma ferramenta que normalmente só governos têm',
          'Hacktivista, porque o alvo foi escolhido por uma causa pessoal'
        ], 'Quem usa ferramentas prontas sem entendê-las, por diversão ou ego, é script kiddie. Isso não torna o ato inofensivo: pode ser crime e causar dano real.'),
        mcq('q6', 'Uma microempresa de contabilidade acha que só precisa se preocupar com espiões de governos. Qual a melhor correção?', 'b', [
          'Está certo, pois pequenas empresas guardam informações muito sigilosas, que atraem atores estatais',
          'O mais provável é o criminoso oportunista, então o básico (senhas, MFA, atualizações e backup) vem primeiro',
          'Está errado, pois só funcionários insatisfeitos representam algum risco real para empresas pequenas',
          'Está certo, pois criminosos comuns só se interessam por bancos e grandes varejistas'
        ], 'O ator mais provável contra empresas pequenas é o criminoso que ataca em massa. O básico bem feito bloqueia a maior parte dos ataques; insiders existem, mas não são o único risco.'),
        mcq('q7', 'Um pesquisador descobre uma falha em um site, sem permissão da empresa, e envia um aviso gentil explicando o problema sem causar dano. Como esse rótulo costuma ser chamado e o que ainda vale lembrar?', 'c', [
          'White hat, e por isso não há qualquer risco jurídico, pois a intenção foi boa',
          'Black hat, porque o simples fato de ter achado a falha já é considerado crime grave',
          'Grey hat: a intenção foi boa, mas agir sem autorização pode ser problema legal',
          'Hacktivista, já que a atitude foi motivada por um sentimento de justiça'
        ], 'Grey hat age sem permissão mas sem malícia. Boa intenção não substitui autorização, e por isso programas de bug bounty, com regras formais, são o caminho mais seguro.'),
        fill('q8', 'Complete com o termo para quem está DENTRO da organização e usa mal um acesso legítimo, ou o causa por descuido.', 'ator de dentro da organização = ___', ['insider'], 'Insider é a pessoa de dentro com acesso legítimo. Pode agir de má-fé ou por descuido, e ambos são riscos.')
      ]
    },
    {
      id: 'csb-04-malware-visao-geral',
      title: 'Malware: visão geral e como se prevenir',
      goal: 'Reconhecer os principais tipos de malware (vírus, worm, trojan, ransomware, spyware, adware, keylogger, botnet, fileless), como chegam ao seu aparelho e como se proteger.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é malware',
            'MALWARE (junção de malicious software, software malicioso) é qualquer programa feito para causar dano, roubar informação ou dar controle do seu aparelho a outra pessoa. Nada de mágica: é só um programa, que precisa chegar até a sua máquina e ser executado. Por isso quase toda defesa tem duas frentes: impedir que chegue e impedir que rode. Esta lição só explica como cada tipo age e como se defender; não há nenhum código de malware aqui.'
          ),
          sl(
            'Vírus, worm e trojan',
            'VÍRUS é um programa malicioso que se anexa a outro arquivo e precisa que alguém o abra para agir, como um resfriado que depende de contato. WORM (verme) se espalha SOZINHO pela rede, de um computador a outro, sem que ninguém precise abrir nada: por isso pode infectar muitas máquinas rapidamente. TROJAN (cavalo de troia) finge ser algo útil, como um jogo pirata, um "atualizador" ou um arquivo de uma pessoa conhecida, mas faz outra coisa quando você o executa. O trojan não se espalha sozinho: depende do seu engano. Erro comum: chamar qualquer problema de "vírus"; saber o tipo ajuda a escolher a resposta.'
          ),
          sl(
            'Ransomware',
            'RANSOMWARE tranca (criptografa) seus arquivos e exige um pagamento (resgate) para liberá-los. É um sequestro de dados: fere a disponibilidade, e muitas vezes também a confidencialidade, pois alguns grupos copiam os dados antes de trancar e ameaçam publicá-los. Aparece uma mensagem na tela avisando que os arquivos foram bloqueados. O que fazer: desligar o aparelho da rede (cabo ou Wi-Fi) para frear a propagação, não pagar por impulso (não há garantia de devolução, e financia o crime), buscar ajuda profissional e RESTAURAR o backup. A melhor defesa é o backup que o ataque não alcança, tema de outra lição.'
          ),
          sl(
            'Spyware, adware, keylogger',
            'SPYWARE espiona: coleta o que você faz, onde está, o que fala, sem você saber. KEYLOGGER é um tipo de spyware que registra o que você digita, inclusive senhas. ADWARE exibe propaganda insistente, abre abas e muda sua página inicial; costuma vir embutido em programas gratuitos baixados de sites duvidosos e, além de irritante, pode abrir caminho para algo pior. Sinais comuns: bateria acabando rápido, aparelho lento sem motivo, aplicativos que você não instalou, anúncios aparecendo fora do navegador. Stalkerware é spyware instalado por alguém próximo para vigiar uma pessoa, e isso também é violação de privacidade e pode ser crime.'
          ),
          sl(
            'Botnet e malware sem arquivo',
            'BOTNET é uma rede de aparelhos infectados (computadores, câmeras, roteadores) controlados à distância por um criminoso, sem o dono saber. O dono nota talvez uma lentidão; o criminoso usa a rede para derrubar sites, enviar spam ou esconder atividades. Por isso um aparelho esquecido e vulnerável não prejudica só você. MALWARE FILELESS (sem arquivo) age direto na memória e em ferramentas que já existem no próprio sistema, sem deixar um arquivo suspeito no disco; por isso o antivírus que só olha arquivos pode não notar, e tecnologias modernas de proteção olham também o COMPORTAMENTO dos programas.'
          ),
          sl(
            'Como o malware chega',
            'Os caminhos mais comuns: anexos e links de e-mail e mensagens (phishing, tema da próxima lição); programas piratas, crackeados e baixados de sites não oficiais; pen drives desconhecidos; sites comprometidos e anúncios maliciosos; aplicativos falsos fora da loja oficial; e falhas em software desatualizado que permitem infecção até sem clique. Note um padrão: a maior parte depende de um passo humano, como abrir, instalar ou permitir. Por isso o seu comportamento é a principal defesa.'
          ),
          sl(
            'Como se prevenir',
            'Hábitos que bloqueiam a maior parte: (1) instalar programas só de fontes oficiais; (2) manter sistema e apps atualizados; (3) usar o antivírus do sistema ligado; (4) não abrir anexos nem links inesperados, mesmo de conhecidos, sem confirmar; (5) usar conta de usuário comum no dia a dia; (6) fazer backup com cópia offline; (7) não plugar pen drive achado ou desconhecido. Se desconfiar de infecção: desconecte da rede, não digite senhas nele, rode a verificação do antivírus e, de outro aparelho, troque as senhas importantes. Em caso de dúvida séria, procure um profissional.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a diferença central entre um worm e um vírus?', 'd', [
          'O worm só afeta celulares e tablets, e o vírus só afeta computadores de mesa e notebooks',
          'O worm pede resgate em dinheiro, e o vírus exibe propaganda ao usuário',
          'O worm precisa de um arquivo anexado, e o vírus se espalha sozinho',
          'O worm se espalha sozinho pela rede, e o vírus depende de alguém abrir o arquivo'
        ], 'Worm se propaga sem intervenção humana, o que o faz crescer rápido. Vírus depende de execução do arquivo infectado. As outras opções trocam ou inventam as características.'),
        mcq('q2', 'Uma pessoa baixa um "atualizador de jogo" de um site desconhecido, e na verdade ele instala um programa que rouba senhas. Esse programa é um exemplo de qual tipo?', 'a', [
          'Trojan, pois finge ser útil e engana quem o executa',
          'Worm, pois entrou no aparelho e logo infectou outros dispositivos da casa',
          'Adware, pois seu único objetivo é mostrar anúncios para a pessoa',
          'Botnet, pois é um conjunto de aparelhos controlados por um criminoso'
        ], 'Trojan disfarça-se de algo legítimo; o roubo de senhas é a função oculta. Botnet é a rede de aparelhos infectados, não o programa disfarçado.'),
        mcq('q3', 'Aparece uma tela dizendo que todos os arquivos foram bloqueados e pede pagamento. Qual a primeira atitude mais adequada?', 'c', [
          'Pagar rapidamente, pois o prazo dado na tela pode acabar e os dados serem apagados',
          'Continuar usando o computador para ver quais arquivos ainda abrem e quais não',
          'Desconectar o aparelho da rede e buscar ajuda, pensando em restaurar o backup',
          'Instalar um segundo antivírus e esperar ele resolver tudo sozinho em alguns minutos'
        ], 'Isolar da rede freia a propagação; pagar não garante devolução e financia o crime; o backup é a saída segura. Instalar outro antivírus no meio do ataque raramente destranca arquivos.'),
        fill('q4', 'Complete com o nome do malware que tranca arquivos e exige resgate.', 'malware que sequestra arquivos = ___', ['ransomware'], 'Ransomware (ransom = resgate) tranca arquivos por criptografia e cobra pagamento.'),
        mcq('q5', 'Qual destes sinais pode indicar spyware ou adware no celular?', 'b', [
          'O celular recebe uma atualização do fabricante e reinicia sozinho em seguida',
          'Anúncios aparecendo fora do navegador e apps que você não lembra de ter instalado',
          'A bateria diminui um pouco depois de um dia inteiro de uso intenso com GPS e vídeos',
          'O celular pede a senha ao ligar depois de ficar desligado por algumas horas'
        ], 'Propaganda fora do navegador e apps desconhecidos são sinais típicos. As outras situações são comportamentos normais do aparelho.'),
        mcq('q6', 'Por que um aparelho infectado por botnet também prejudica outras pessoas?', 'a', [
          'Porque ele pode ser usado, sem o dono saber, em ataques contra sites e para enviar spam',
          'Porque a botnet apaga os arquivos dos aparelhos que usam o mesmo provedor de internet',
          'Porque ela troca a senha do Wi-Fi dos vizinhos mais próximos da casa do infectado',
          'Porque o criminoso consegue ver tudo o que o dono vê, mas só quando o dono estiver conectado a redes públicas'
        ], 'Botnet é uma rede de aparelhos controlados à distância; o dono é parte de um ataque sem saber. As outras descrições não correspondem ao funcionamento.'),
        mcq('q7', 'Qual hábito reduz mais a chance de infecção por trojan?', 'd', [
          'Desligar o computador todas as noites, para que programas maliciosos não fiquem rodando',
          'Instalar vários antivírus ao mesmo tempo, para cobrir mais tipos de ameaça',
          'Baixar programas crackeados em sites bem avaliados por outros usuários',
          'Instalar programas somente de fontes oficiais'
        ], 'Trojan depende de você instalar algo disfarçado; fontes oficiais reduzem muito o risco. Crackeados são caminho clássico de infecção, e desligar o PC não impede a instalação.'),
        fill('q8', 'Complete com o tipo de spyware que registra o que você digita, inclusive senhas.', 'registra teclas digitadas = ___', ['keylogger'], 'Keylogger registra as teclas digitadas. Por isso, em aparelho suspeito, não se deve digitar senhas importantes.')
      ]
    },
    {
      id: 'csb-05-engenharia-social-phishing',
      title: 'Engenharia social e phishing',
      goal: 'Entender como golpistas manipulam pessoas (phishing, spear phishing, vishing, smishing, pretexting), reconhecer sinais de alerta e saber o que fazer ao receber uma mensagem suspeita.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Engenharia social: hackear a pessoa',
            'ENGENHARIA SOCIAL é enganar uma pessoa para que ela mesma entregue uma informação ou faça uma ação que ajuda o golpista: passar uma senha, clicar em um link, instalar um programa, fazer um Pix. Em vez de quebrar a tecnologia, o golpista explora emoções e hábitos humanos. É a porta de entrada da maioria dos incidentes, porque é mais barato enganar alguém do que invadir um sistema bem protegido. Nenhum antivírus substitui a atenção de quem está do outro lado da tela.'
          ),
          sl(
            'Phishing e suas variações',
            'PHISHING (de fishing, pescaria) é a mensagem em massa que imita uma empresa ou pessoa confiável para fisgar quem cair: um e-mail do falso banco, um aviso de "pacote retido" dos Correios, uma "multa pendente". Em geral leva a uma página falsa que copia a verdadeira para você digitar login e senha, ou a um anexo malicioso. SPEAR PHISHING é o phishing PERSONALIZADO para uma vítima específica, com nome, cargo e assuntos reais, por isso é mais convincente. VISHING é o golpe por ligação de voz (o falso atendente do banco). SMISHING é o golpe por SMS ou mensagem de texto (o link curto no celular). Também existe o golpe por QR code falso. Mudam os canais, a manipulação é a mesma.'
          ),
          sl(
            'Pretexting e os gatilhos emocionais',
            'PRETEXTING é inventar uma história convincente (o pretexto) para ganhar confiança: o falso técnico de suporte, o suposto colega de TI pedindo uma senha, o falso funcionário do banco que "precisa confirmar seus dados". Para fazer você agir sem pensar, o golpista usa gatilhos. URGÊNCIA: "sua conta será bloqueada em 1 hora". AUTORIDADE: parece vir do banco, da polícia ou do chefe. MEDO: "há uma compra suspeita no seu cartão". OPORTUNIDADE: "você ganhou um prêmio". CURIOSIDADE: "veja quem visitou seu perfil". Quando uma mensagem manda você agir rápido e sem conferir, a pressa em si é o sinal de alerta.'
          ),
          sl(
            'Sinais de alerta',
            'Fique atento a: remetente que não bate com a empresa (o endereço de e-mail ou o número de telefone estranho); saudação genérica como "prezado cliente"; erros de português e layout estranho (mas golpes bons não têm erros, então não confie só nisso); pedido de senha, código recebido por SMS ou dados do cartão (nenhuma empresa séria pede isso por mensagem); links que, ao passar o mouse por cima (sem clicar), mostram um endereço diferente do esperado; anexos inesperados; ameaça de consequência imediata; e ofertas boas demais para ser verdade.',
            'Exemplo ficticio de sinais:\nDe: suporte@banco-seguro-atendimento.example\nAssunto: URGENTE - sua conta sera bloqueada hoje\nCorpo: clique aqui e confirme sua senha'
          ),
          sl(
            'O que fazer ao receber uma mensagem suspeita',
            'Regra de ouro: PARE, NÃO CLIQUE, CONFIRME POR OUTRO CANAL. Se a mensagem diz ser do banco, feche e ligue para o número oficial que está no seu cartão ou abra o app digitando você mesmo, sem usar o link recebido. Não responda, não abra anexos, não escaneie QR code desconhecido. Denuncie como spam ou phishing no seu serviço de e-mail e, se for o caso, avise o setor de segurança da empresa. Em ligação, desligue e retorne por você mesmo ao número oficial: bancos não pedem senha nem códigos por telefone e não mandam "mover seu dinheiro para uma conta segura".'
          ),
          sl(
            'Se você já clicou ou informou dados',
            'Acontece com todo mundo, inclusive com especialistas, e o importante é agir rápido e sem vergonha. (1) Se digitou uma senha em página suspeita: troque-a imediatamente, em todo lugar onde a usava, e ative a verificação em duas etapas. (2) Se informou dados de cartão ou de banco: ligue já para o banco e peça bloqueio. (3) Se baixou ou abriu um anexo: desconecte o aparelho da rede e rode o antivírus. (4) Avise quem pode ser afetado (família, equipe). (5) Guarde prints como evidência e, se houve prejuízo, registre boletim de ocorrência e avise o banco. Esconder o erro só dá tempo ao golpista.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Chega um SMS: "Seu pacote está retido, pague a taxa neste link". Que tipo de golpe é esse, se o canal é o SMS?', 'c', [
          'Vishing, porque o objetivo é conseguir falar por voz com a vítima',
          'Spear phishing, pois a mensagem foi escrita para uma pessoa específica',
          'Smishing, que é o phishing feito por SMS ou mensagem de texto',
          'Pretexting, pois a mensagem inventa uma história para obter dados da vítima'
        ], 'Phishing por SMS chama-se smishing; vishing é por voz. Spear phishing exige personalização, e a mensagem de pacote retido é em massa.'),
        mcq('q2', 'Um e-mail cita seu nome, seu cargo, o nome do seu chefe e um projeto real da empresa, pedindo que você abra um anexo. Esse nível de personalização indica qual golpe?', 'd', [
          'Phishing em massa, pois todo phishing usa o nome da vítima na saudação',
          'Smishing, porque tem elementos pessoais iguais aos de uma mensagem de texto',
          'Adware, porque o anexo vem de um programa que mostra propagandas',
          'Spear phishing, que é o phishing direcionado a uma pessoa específica'
        ], 'Quando a mensagem é feita sob medida para a vítima, com dados reais, é spear phishing. Isso o torna mais perigoso, e o cuidado com anexos continua o mesmo.'),
        mcq('q3', 'Alguém liga dizendo ser do banco e pede o código que acabou de chegar por SMS para "cancelar uma compra suspeita". O que fazer?', 'a', [
          'Desligar e ligar para o número oficial do banco, sem passar o código',
          'Passar o código, pois a pessoa já sabe o seu nome e parte dos seus dados',
          'Pedir o nome do atendente e passar o código só depois de anotá-lo',
          'Passar os primeiros dígitos do código para manter alguma cautela'
        ], 'Nenhum atendente real pede códigos de verificação. Saber seu nome não prova nada, pois dados vazam. Passar parte do código ainda ajuda o golpista, e anotar o nome não valida a ligação.'),
        fill('q4', 'Complete com o nome do golpe em que a vítima é enganada por ligação telefônica (voz).', 'golpe por ligação de voz = ___', ['vishing'], 'Vishing é o phishing por voz (voice phishing), como a falsa ligação de central do banco.'),
        mcq('q5', 'Qual dos gatilhos abaixo é mais usado para fazer a vítima agir sem pensar?', 'b', [
          'Um texto longo e bem explicado, com todas as informações da empresa',
          'Urgência, como "sua conta será bloqueada em uma hora"',
          'Um pedido educado para você conferir os dados com calma e depois responder',
          'Uma mensagem sem prazo, sem pedido de ação e com tom tranquilo'
        ], 'Urgência tira o tempo de verificar. Mensagens legítimas raramente exigem decisão em minutos nem pedem senha ou código.'),
        mcq('q6', 'Você recebe um e-mail do suposto banco com um link para "atualizar seu cadastro". Qual atitude é mais segura?', 'd', [
          'Clicar no link, mas só olhar a página sem digitar nada, já que olhar não faz mal',
          'Encaminhar o e-mail a amigos para perguntar se eles também receberam a mensagem',
          'Responder o e-mail perguntando se a mensagem é verdadeira, e aguardar a resposta',
          'Abrir o app do banco por conta própria ou ligar para o número oficial, sem usar o link'
        ], 'Confirmar por um canal que você mesmo abriu evita a página falsa. Clicar já pode ativar algo, encaminhar espalha o golpe e a resposta iria para o golpista.'),
        mcq('q7', 'Uma pessoa digitou a senha do e-mail em uma página que percebeu depois ser falsa. Qual é o primeiro passo mais importante?', 'c', [
          'Fechar a página e esperar alguns dias para ver se algo estranho acontece',
          'Reiniciar o computador, pois isso apaga a senha digitada da internet',
          'Trocar a senha na hora, onde ela foi usada, e ativar a verificação em duas etapas',
          'Apagar o e-mail suspeito e tratar o assunto como resolvido'
        ], 'A senha já está com o golpista; trocar rapidamente e ligar a verificação em duas etapas corta o acesso. Esperar ou reiniciar não revoga nada.'),
        fill('q8', 'Complete com a regra de ouro diante de uma mensagem suspeita: não clicar e confirmar por ___ canal.', 'Pare, nao clique, confirme por outro ___', ['canal', 'outro canal'], 'Confirmar por outro canal, como o número oficial do banco, evita cair na página ou ligação falsa.')
      ]
    },
    {
      id: 'csb-06-senhas-e-gerenciadores',
      title: 'Senhas fortes e gerenciadores de senhas',
      goal: 'Criar senhas e frases-senha fortes, entender os riscos do reuso e dos vazamentos, usar um gerenciador de senhas e saber, em termos simples, como os sites guardam senhas.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que torna uma senha forte',
            'Uma senha forte é difícil de ADIVINHAR e de ser TESTADA por programas. Programas de tentativa e erro conseguem testar milhões de combinações, então o que vale é o COMPRIMENTO e a imprevisibilidade. Senhas curtas e comuns (123456, nome+data de nascimento, time de futebol) caem muito rápido. Uma senha longa e aleatória, ou uma frase de várias palavras, leva um tempo enorme para ser descoberta. Regra prática: quanto mais longa, melhor; evite dados pessoais que outros possam descobrir (nome dos filhos, data de nascimento, placa do carro).'
          ),
          sl(
            'Frase-senha',
            'FRASE-SENHA (passphrase) é uma senha formada por várias palavras, fácil de lembrar e longa, como quatro ou cinco palavras sem relação entre si. Exemplo fictício: cavalo-lanterna-telha-nuvem. Ela é longa (difícil de adivinhar) e memorável (você consegue lembrar). Evite frases famosas ou ditados, porque são fáceis de testar. Para a senha mestra do gerenciador (mais à frente) e para o aparelho, uma frase-senha é uma ótima escolha. Para as demais contas, o gerenciador vai gerar senhas longas e aleatórias, e você nem precisa decorá-las.',
            'Fraca : 123456 / maria1990\nMelhor: cavalo-lanterna-telha-nuvem (exemplo ficticio)'
          ),
          sl(
            'Reuso de senha e vazamentos',
            'REUSO é usar a mesma senha em vários serviços. É o erro mais perigoso: quando UM site sofre um vazamento (dados de usuários copiados por criminosos), a senha cai em listas que circulam entre golpistas, e eles testam automaticamente aquele e-mail e aquela senha em bancos, redes sociais e lojas, técnica chamada credential stuffing. Se você reusou, uma invasão vira várias. Para checar se um e-mail apareceu em vazamentos conhecidos, existem serviços confiáveis de consulta; nunca digite sua senha neles, só o e-mail. Se aparecer, troque a senha daquele serviço e de qualquer outro que a usava.'
          ),
          sl(
            'Gerenciador de senhas',
            'GERENCIADOR DE SENHAS é um aplicativo que guarda todas as suas senhas em um cofre criptografado, protegido por UMA senha mestra (a única que você precisa lembrar). Ele gera senhas longas e aleatórias, diferentes para cada site, preenche o login para você e muitas vezes avisa de senhas repetidas ou vazadas. Como ele só preenche no endereço certo, ajuda também contra páginas falsas. Escolha um conhecido, com boa reputação, proteja a conta dele com verificação em duas etapas (próxima lição) e use uma senha mestra forte que você não use em lugar nenhum. É mais seguro que anotar em papel solto, planilha ou no bloco de notas do celular.'
          ),
          sl(
            'Como os sites guardam sua senha (em termos simples)',
            'Um serviço bem feito NÃO guarda sua senha em texto: guarda uma impressão digital dela, chamada HASH, calculada por uma função de mão única (não dá para voltar do hash para a senha). Quando você faz login, o site calcula o hash do que você digitou e compara com o guardado. Assim, se a base vazar, os criminosos recebem hashes, e não as senhas em si. Mesmo assim, senhas simples são descobertas, porque os criminosos calculam o hash de milhões de senhas comuns e comparam. Por isso senha fraca é fraca mesmo com hash. Você verá hash com mais detalhes em uma lição própria; por ora, guarde a ideia: bom serviço guarda hash, e senha fraca ou repetida ainda é um risco seu.'
          ),
          sl(
            'Erros comuns e o que fazer',
            'Erros comuns: trocar só um número no fim da mesma senha (senha1, senha2), usar o mesmo padrão em tudo, anotar em lugares inseguros, compartilhar senha por mensagem, salvar senha em computador público e responder perguntas de segurança com dados verdadeiros que outras pessoas conseguem descobrir. O que fazer: use um gerenciador; senhas longas e únicas por conta; frase-senha para a mestra; ative a verificação em duas etapas (MFA, na próxima lição); troque a senha se houver vazamento ou suspeita; nunca informe a senha a ninguém, nem ao suposto suporte. Trocar senhas toda semana sem motivo não ajuda: o que importa é ser forte, única e trocada quando há suspeita.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual característica mais torna uma senha difícil de descobrir por tentativa e erro?', 'd', [
          'Ter símbolos no começo, como ! ou @, mesmo que a senha seja curta',
          'Ser formada por uma palavra comum com número no final, como futebol10',
          'Conter o nome de alguém querido, o que ajuda a lembrar no dia a dia',
          'Ser longa e imprevisível, como uma frase-senha de várias palavras'
        ], 'O comprimento e a imprevisibilidade pesam mais. Palavra+número e nomes pessoais são padrões que os programas testam primeiro.'),
        mcq('q2', 'Por que reutilizar a mesma senha em vários sites é perigoso?', 'b', [
          'Porque os sites bloqueiam a conta automaticamente quando percebem a senha repetida',
          'Porque um vazamento em um site permite testar a mesma senha em outros serviços',
          'Porque o navegador deixa de lembrar as senhas quando há repetição entre sites',
          'Porque senhas repetidas ocupam mais espaço no cofre do gerenciador de senhas'
        ], 'Criminosos testam automaticamente credenciais vazadas em outros sites (credential stuffing). Os outros efeitos não existem.'),
        mcq('q3', 'Qual das opções é a melhor senha mestra para um gerenciador de senhas?', 'a', [
          'Uma frase-senha longa e única, usada somente nele',
          'A data de aniversário seguida do seu nome, que é fácil de lembrar',
          'A mesma senha do e-mail pessoal, para você precisar decorar menos',
          'Uma senha curta com símbolos, que é rápida de digitar toda hora'
        ], 'A mestra protege o cofre inteiro, então deve ser longa, única e memorável. Datas, nomes e reuso a tornam adivinhável ou ligada a outras contas.'),
        fill('q4', 'Complete com o nome do aplicativo que guarda suas senhas em um cofre protegido por uma senha mestra.', 'gerenciador de ___', ['senhas', 'senha'], 'O gerenciador de senhas guarda, gera e preenche senhas, e você só precisa decorar a mestra.'),
        mcq('q5', 'Em termos simples, o que o site guarda quando faz o hash da sua senha?', 'c', [
          'Uma cópia da senha escrita ao contrário, para que o site possa lembrá-la quando precisar',
          'A senha completa, só que escondida em uma pasta que os funcionários não conseguem abrir',
          'Uma impressão digital da senha, que não dá para transformar de volta na senha',
          'Os três primeiros caracteres da senha, que bastam para você entrar de novo'
        ], 'O hash é de mão única: serve para comparar sem guardar a senha. Se a base vaza, o atacante recebe impressões, não as senhas em si.'),
        mcq('q6', 'Uma pessoa descobre que seu e-mail apareceu em um vazamento de um site que usou há anos. Qual a melhor ação?', 'a', [
          'Trocar a senha daquele site e de todo serviço em que ela foi reutilizada',
          'Não fazer nada, pois vazamentos antigos perdem o valor para os golpistas',
          'Excluir a conta de e-mail e criar outra com o mesmo nome em outro provedor',
          'Trocar o nome de usuário e manter a senha, que não foi exposta'
        ], 'Credenciais vazadas continuam em circulação por muito tempo; trocar onde a senha foi usada corta o aproveitamento. Mudar só o usuário não resolve se a senha continua igual.'),
        mcq('q7', 'Qual prática NÃO ajuda a proteger suas senhas?', 'd', [
          'Usar senhas únicas e longas, geradas pelo gerenciador de senhas para cada conta',
          'Ligar a verificação em duas etapas nas contas importantes, como e-mail, banco e redes',
          'Evitar digitar senhas em computadores públicos ou emprestados por outras pessoas',
          'Trocar todas as senhas toda semana, mantendo o mesmo padrão com número no fim'
        ], 'Trocas frequentes com o mesmo padrão não aumentam a segurança; o que importa é a senha ser forte, única e trocada se houver suspeita ou vazamento.'),
        fill('q8', 'Complete com o nome da senha formada por várias palavras, longa e fácil de lembrar.', '___-senha (varias palavras)', ['frase', 'frase-senha', 'passphrase'], 'Frase-senha (passphrase) é a senha formada por várias palavras, longa e memorável.')
      ]
    },
    {
      id: 'csb-07-mfa-e-passkeys',
      title: 'Verificação em duas etapas (MFA) e passkeys',
      goal: 'Entender os três fatores de autenticação, comparar SMS, aplicativo autenticador e chave física, conhecer as passkeys, guardar os códigos de recuperação e reconhecer a fadiga de MFA.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que só a senha não basta',
            'Senhas vazam, são adivinhadas e são enganadas por phishing. Por isso se usa um SEGUNDO passo, de natureza diferente: mesmo que o golpista tenha sua senha, ele ainda precisa do segundo item. Isso se chama MFA (autenticação multifator) ou, quando são dois, verificação em duas etapas (2FA). É uma das medidas que mais reduz o risco de invasão de conta, e quase todos os serviços importantes (e-mail, banco, redes sociais, WhatsApp) oferecem. Analogia: o cartão do banco é só uma parte, você precisa também da senha do cartão.'
          ),
          sl(
            'Os três fatores',
            'Há três tipos de prova de que você é você. Algo que você SABE: senha, PIN, resposta secreta. Algo que você TEM: seu celular, uma chave física, um cartão. Algo que você É: digital, rosto (biometria). MFA de verdade combina fatores DE TIPOS DIFERENTES: senha (sabe) + código no celular (tem). Duas senhas diferentes não são MFA, porque são dois itens do mesmo tipo (sabe). A força vem de o golpista precisar de coisas de naturezas distintas, uma delas fora do alcance dele.',
            'Saber  -> senha, PIN\nTer    -> celular, chave fisica\nSer    -> digital, rosto\nMFA = pelo menos 2 tipos diferentes'
          ),
          sl(
            'SMS, aplicativo e chave física',
            'Códigos por SMS são melhores que nada, mas são o mais fraco: o SMS pode ser desviado por golpes com o chip (SIM swap, visto numa lição futura) e vai em texto simples. APLICATIVO AUTENTICADOR gera um código novo a cada poucos segundos dentro do próprio celular, sem depender da operadora; é bem mais seguro. CHAVE FÍSICA DE SEGURANÇA é um pequeno dispositivo que você conecta ou encosta no aparelho para confirmar o login; é a opção mais forte, pois também ajuda contra páginas falsas, já que só responde ao site verdadeiro. Ordem geral de força: SMS < aplicativo autenticador < chave física/passkey. Use sempre o melhor que o serviço oferecer.'
          ),
          sl(
            'Passkeys',
            'PASSKEY (chave de acesso) é uma forma moderna de entrar SEM senha: o aparelho guarda uma chave secreta e você a libera com sua biometria ou o PIN do aparelho. O site só recebe uma prova de que você tem a chave, nunca um segredo que possa ser roubado ou digitado em página falsa. Por isso ela resiste ao phishing, e não precisa ser decorada. Muitos serviços já oferecem; onde disponível, vale ativar. Cuidado: a passkey fica ligada ao aparelho ou ao serviço de sincronização que você usa, então mantenha o aparelho bloqueado com senha ou biometria e saiba como recuperar a conta se perdê-lo.'
          ),
          sl(
            'Códigos de recuperação',
            'Ao ativar MFA, o serviço costuma mostrar CÓDIGOS DE RECUPERAÇÃO: uma lista de códigos de uso único para você entrar caso perca o celular ou o autenticador. Guarde-os fora do aparelho que usa o MFA: no gerenciador de senhas, ou impressos em lugar seguro de casa. Não os envie por mensagem nem os deixe em uma foto qualquer no celular. Sem eles, perder o aparelho pode significar perder a conta. Também vale cadastrar um segundo método e saber se o serviço permite mais de um aparelho.'
          ),
          sl(
            'Fadiga de MFA',
            'FADIGA DE MFA (MFA fatigue) é um golpe em que o criminoso, já com sua senha, dispara pedidos de aprovação no seu celular (aquele "Foi você? Aprovar") repetidamente, torcendo para você aprovar só para parar o barulho, ou fingindo ser o suporte e pedindo para você aprovar. Defesa: se chegou pedido de aprovação que VOCÊ NÃO iniciou, NEGUE, nunca aprove, e troque sua senha, pois ela provavelmente vazou. Prefira métodos em que você precisa digitar um número mostrado na tela de login, que dificultam aprovações às cegas. E lembre-se: nenhum suporte real pede para você aprovar um pedido ou informar o código.'
          ),
          sl(
            'Resumo prático',
            'Ligue o MFA primeiro no e-mail (que recupera todas as outras contas), depois banco, redes sociais, WhatsApp (verificação em duas etapas com PIN) e gerenciador de senhas. Prefira autenticador, chave física ou passkey a SMS. Guarde os códigos de recuperação. Nunca informe códigos a ninguém: código de verificação é só seu. E negue qualquer aprovação que você não iniciou. Erro comum: achar que MFA torna a conta invulnerável; ela reduz muito o risco, mas golpes que enganam você a entregar o código ainda funcionam, por isso a atenção continua importante.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual combinação representa MFA de verdade, com fatores de tipos diferentes?', 'c', [
          'Senha e PIN, porque ambos são segredos que você precisa decorar',
          'Duas senhas diferentes, cada uma com mais de dez caracteres',
          'Senha e código gerado no aplicativo autenticador do celular',
          'Uma senha e a resposta para uma pergunta de segurança sobre a sua cidade natal'
        ], 'MFA combina tipos distintos: algo que se sabe (senha) e algo que se tem (celular). Senha+PIN e senha+pergunta são dois itens do tipo saber.'),
        mcq('q2', 'Uma biometria como a impressão digital corresponde a qual fator?', 'a', [
          'Algo que você é',
          'Algo que você sabe',
          'Algo que você tem',
          'Algo que você aprendeu'
        ], 'Características do corpo são o fator ser. Saber é segredo na memória; ter é um objeto que você possui.'),
        mcq('q3', 'Por que o código por SMS é considerado o método mais fraco entre os mais comuns?', 'd', [
          'Porque o código por SMS só funciona quando o celular está conectado ao Wi-Fi',
          'Porque o SMS é cobrado pela operadora e por isso muita gente desativa o recurso',
          'Porque o SMS precisa de internet e de aplicativo próprio instalado no aparelho',
          'Porque pode ser desviado por golpes com o chip e viaja sem proteção forte'
        ], 'SMS depende da operadora e pode ser interceptado ou desviado por golpe com chip (SIM swap). O aplicativo autenticador gera o código no próprio aparelho.'),
        fill('q4', 'Complete com a sigla da verificação com mais de um fator de autenticação (multifator).', '___ = autenticacao multifator', ['mfa'], 'MFA (multi-factor authentication) combina fatores diferentes; com dois, é chamada também de 2FA.'),
        mcq('q5', 'Você recebe no celular um pedido de aprovação de login que você não iniciou, e depois outro, e outro. O que fazer?', 'b', [
          'Aprovar um deles, para que os pedidos parem de chegar de uma vez',
          'Negar todos e trocar a senha, pois ela provavelmente vazou',
          'Ignorar as notificações e esperar até que o golpista desista sozinho',
          'Desligar o celular e só trocar a senha depois de alguns dias'
        ], 'Pedido que você não iniciou significa que alguém tem sua senha. Negar e trocar a senha corta o ataque; aprovar entrega a conta, e ignorar ou esperar mantém o risco aberto.'),
        mcq('q6', 'Onde é mais seguro guardar os códigos de recuperação do MFA?', 'c', [
          'Em uma foto na galeria do mesmo celular que usa o autenticador',
          'Em uma mensagem enviada para si mesmo no WhatsApp, para ter à mão',
          'No gerenciador de senhas ou impressos em lugar seguro, fora do aparelho do MFA',
          'No bloco de notas do computador de trabalho, junto de outras anotações soltas'
        ], 'Os códigos servem justamente para quando o celular se perde, então não devem estar só nele. Fotos e mensagens soltas são fáceis de vazar.'),
        mcq('q7', 'O que torna uma passkey mais resistente ao phishing do que uma senha?', 'a', [
          'Não existe segredo digitável para enganar você a entregar em página falsa, pois a chave fica no aparelho',
          'Ela é uma senha mais longa, o que impede os golpistas de adivinharem o conteúdo',
          'Ela é enviada por e-mail para o seu endereço cada vez que você precisa entrar',
          'Ela é uma senha longa guardada no aparelho, então você só precisa digitá-la uma vez em cada site'
        ], 'Na passkey, a chave secreta nunca é digitada nem enviada ao site; ela só responde ao site verdadeiro. Não é senha comprida, nem reaproveitada, nem enviada por e-mail.'),
        fill('q8', 'Complete com o fator de autenticação a que pertence o celular ou a chave física que você possui (algo que você ___).', 'senha = saber / celular = ___', ['ter', 'tem'], 'Celular e chave física são o fator ter: um objeto que você possui.')
      ]
    },
    {
      id: 'csb-39-recuperacao-e-sequestro-de-contas',
      title: 'Sequestro de contas: como acontece e como se recuperar',
      goal: 'Entender como contas são sequestradas, reconhecer os sinais de uma conta invadida e saber o passo a passo para recuperá-la e se proteger de novo.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é sequestro de conta',
            'Sequestro de conta (account takeover) acontece quando outra pessoa passa a controlar uma conta sua: e-mail, rede social, aplicativo de mensagens, banco ou loja. O invasor entra com a sua identidade e pode ler mensagens, pedir dinheiro aos seus contatos, comprar em seu nome e até trocar a senha para você não voltar. Uma conta de e-mail invadida é especialmente grave, porque costuma servir para redefinir a senha de todas as outras contas ligadas a ela.'
          ),
          sl(
            'Como as contas são sequestradas',
            'Quatro caminhos aparecem com frequência. Reuso de senha: se você usa a mesma senha em vários sites e um deles vaza, o invasor testa essa combinação nos outros. Phishing: uma mensagem falsa leva você a digitar senha e códigos em uma página que imita a verdadeira. Troca de SIM (SIM swap), em nível simples: o golpista convence a operadora a passar o seu número para um chip dele e passa a receber os SMS, inclusive os códigos de verificação. Engenharia social: alguém liga ou escreve se passando pelo suporte e pede um código que acabou de chegar ao seu telefone. Em todos os casos o defeito está em segredos reaproveitados ou entregues, e a defesa passa por senhas únicas e por verificação em duas etapas.'
          ),
          sl(
            'Sinais de que a conta foi invadida',
            'Fique atento a: avisos de login em lugar ou aparelho desconhecido, e-mails de redefinição de senha que você não pediu, senha que de repente não funciona, mensagens enviadas que você não escreveu, contatos dizendo que receberam pedidos estranhos de você, configurações alteradas (e-mail ou telefone de recuperação trocados) e celular que perde o sinal sem motivo, o que pode indicar troca de SIM. Um único sinal já merece investigação: é melhor se enganar com alarme falso do que demorar.'
          ),
          sl(
            'Opções de recuperação e como deixá-las fortes',
            'Quase todo serviço oferece formas de recuperar o acesso: um e-mail de recuperação, um telefone de recuperação e, em alguns casos, códigos de backup (uma lista de códigos de uso único que você guarda). Elas ajudam você e, se forem fracas, também ajudam o invasor. Por isso mantenha esses dados atualizados e protegidos: o e-mail de recuperação deve ter senha forte e verificação em duas etapas. Evite perguntas secretas com respostas fáceis de descobrir, como nome da mãe, cidade natal ou nome do pet, porque muita gente consegue achar isso em redes sociais; se o serviço permitir, responda com um texto aleatório guardado no gerenciador de senhas.'
          ),
          sl(
            'Seu e-mail apareceu em um vazamento? (conceito)',
            'Quando um serviço é invadido, listas de e-mails e senhas podem ser publicadas ou vendidas: isso é um vazamento de dados. Existem serviços legítimos de verificação, mantidos por pesquisadores de segurança e por empresas conhecidas, onde você informa seu e-mail e descobre se ele aparece em vazamentos públicos. Eles não mostram a sua senha, e é preciso ter cuidado: digite o endereço somente em sites que você chegou por conta própria (não por link recebido), porque golpistas também criam páginas falsas de verificação. Se aparecer, não entre em pânico: troque a senha do serviço afetado e de qualquer outro que usasse a mesma, e ative a verificação em duas etapas.'
          ),
          sl(
            'Passo a passo quando a conta foi invadida',
            'Calma e ordem: 1) Se ainda tem acesso, troque a senha agora, em um aparelho confiável, por uma senha nova e única. 2) Ative ou revise a verificação em duas etapas e encerre todas as sessões abertas nas configurações. 3) Confira e corrija e-mail e telefone de recuperação. 4) Se perdeu o acesso, use o fluxo oficial Esqueci minha senha ou o formulário de recuperação do próprio serviço. 5) Avise seus contatos por outro canal para não caírem em pedidos feitos em seu nome. 6) Se o número de celular foi tomado, fale com a operadora e com o banco. 7) Verifique movimentações financeiras e guarde prints como prova. Para o futuro, ative alertas de login para ser avisado de entradas novas. Quando houver prejuízo, um boletim de ocorrência pode ser necessário; esta lição não substitui orientação jurídica.'
          )
        ]
      },
      questions: [
        mcq(
          'q1',
          'Por que usar a mesma senha em vários sites facilita o sequestro de contas?',
          'c',
          [
            'Porque sites diferentes compartilham automaticamente todas as senhas entre si e informam o invasor.',
            'Porque a senha repetida fica mais curta com o tempo e se torna fácil de adivinhar.',
            'Se um dos sites vazar, o invasor testa a mesma combinação de e-mail e senha nos outros.',
            'Porque o navegador bloqueia a conta quando detecta a mesma senha em dois lugares.'
          ],
          'O invasor reaproveita o par vazado em outros serviços, e é isso que torna o reuso perigoso. Sites não trocam senhas entre si, a senha não encurta com o tempo e o navegador não bloqueia contas por repetição.'
        ),
        mcq(
          'q2',
          'Seu celular ficou sem sinal de repente e, em seguida, você recebe avisos de redefinição de senha que não pediu. Qual hipótese deve ser investigada?',
          'b',
          [
            'Só um problema na antena da operadora naquela região, sem nenhuma relação com as suas contas e que se resolve sozinho depois de algum tempo.',
            'Possível troca de SIM: o número pode ter sido passado para outro chip, e os SMS de verificação estão indo para o golpista.',
            'Atualização automática do aplicativo de mensagens, que apaga o sinal por alguns minutos.',
            'Defeito na bateria, que pede avisos de redefinição quando está fraca.'
          ],
          'A combinação de perda de sinal e pedidos de redefinição é um sinal clássico de troca de SIM, e o caminho é falar com a operadora e proteger as contas. Falha de antena pode acontecer, mas não explica os avisos, e atualização de app ou bateria não geram redefinições de senha.'
        ),
        mcq(
          'q3',
          'Alguém liga dizendo ser do suporte do seu banco e pede o código de seis dígitos que acabou de chegar por SMS. O que isso indica?',
          'd',
          [
            'Um procedimento normal para confirmar que você é o dono da conta.',
            'Uma verificação de segurança que só vale a pena ser feita se a ligação vier de um número com DDD da sua cidade e atendente educado.',
            'Um teste de segurança que melhora a proteção se você repetir o código em voz alta com clareza.',
            'Tentativa de golpe: códigos de verificação são só seus e nenhuma instituição legítima pede que você os informe.'
          ],
          'O código é pessoal e serve só para você confirmar uma ação; quem o pede por telefone quer concluir um login ou uma operação em seu nome. O DDD pode ser falsificado, e repetir o código não é nem verificação normal nem teste.'
        ),
        fill(
          'q4',
          'Complete: o nome do golpe em que o criminoso convence a operadora a transferir o seu número para outro chip.',
          'Troca de ___ (em inglês, SIM swap): o número passa para outro chip.',
          ['SIM', 'chip'],
          'Na troca de SIM o chip (cartão SIM) associado ao seu número é substituído por outro controlado pelo golpista, que passa a receber ligações e SMS.'
        ),
        mcq(
          'q5',
          'Qual pergunta secreta é a mais fraca para proteger uma conta?',
          'a',
          [
            'Qual o nome da sua mãe, informação que muita gente encontra em redes sociais e registros públicos?',
            'Uma frase aleatória longa que você guardou no gerenciador de senhas como resposta.',
            'Uma resposta inventada, sem relação com a pergunta e longa, guardada em local seguro e protegido por senha forte no gerenciador.',
            'Uma resposta de dez palavras sem sentido que só você registrou.'
          ],
          'Respostas descobríveis em fontes públicas, como o nome da mãe, enfraquecem a recuperação. Respostas aleatórias ou inventadas e guardadas com segurança não podem ser deduzidas por terceiros.'
        ),
        mcq(
          'q6',
          'Você descobre que sua conta de rede social foi invadida, mas ainda consegue entrar. Qual o melhor primeiro passo?',
          'c',
          [
            'Apagar a conta imediatamente, sem trocar nada antes.',
            'Postar um aviso público e esperar o invasor responder.',
            'Trocar a senha por uma nova e única, ativar a verificação em duas etapas e encerrar as outras sessões.',
            'Mudar o nome do perfil, para o invasor não reconhecer a conta.'
          ],
          'Retomar o controle com senha nova, verificação em duas etapas e encerramento de sessões bloqueia o invasor. Apagar a conta perde provas e contatos, postar um aviso não impede nada e mudar o nome não afeta o acesso.'
        ),
        mcq(
          'q7',
          'Como usar um serviço legítimo de verificação de vazamentos de forma segura?',
          'b',
          [
            'Informar e-mail e senha atual para que o serviço compare com as listas.',
            'Acessar o site digitando o endereço por conta própria, informar só o e-mail e trocar as senhas se aparecer em algum vazamento.',
            'Clicar no link de um e-mail que avisa que sua conta vazou e preencher o formulário de lá.',
            'Compartilhar o resultado com os contatos do celular para que eles também se protejam.'
          ],
          'O uso seguro envolve chegar ao site por conta própria e informar apenas o e-mail, nunca a senha. Links recebidos podem levar a páginas falsas, e divulgar o resultado expõe dados e pode ajudar golpistas.'
        ),
        fill(
          'q8',
          'Complete: a lista de códigos de uso único guardada para recuperar o acesso se perder o celular.',
          'Guarde os códigos de ___ em local seguro para recuperar a conta.',
          ['backup', 'recuperação', 'recuperacao'],
          'Os códigos de backup permitem entrar mesmo sem o celular, e por isso devem ser guardados em local seguro, nunca em foto ou mensagem.'
        )
      ]
    },
    {
      id: 'csb-08-hash-criptografia-assinatura',
      title: 'Criptografia, hash e assinatura digital',
      goal: 'Entender, em nível conceitual, criptografia simétrica e assimétrica, hash e assinatura digital, e ver um exemplo real de hash em Python.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Criptografia: embaralhar para proteger',
            'CRIPTOGRAFIA é a técnica de transformar uma informação legível em algo ininteligível, de modo que só quem tem a CHAVE correta consiga voltar ao original. Pense em um cadeado: qualquer um pode ver a caixa, mas só quem tem a chave abre. Você usa criptografia todo dia: no cadeado do navegador (HTTPS), no WhatsApp (mensagens protegidas de ponta a ponta), no Pix, no desbloqueio do celular. O algoritmo (a receita matemática) é público e conhecido; o segredo está só na chave. Por isso nunca se deve inventar criptografia caseira: use as padronizadas e bem estudadas.'
          ),
          sl(
            'Criptografia simétrica',
            'Na SIMÉTRICA, a MESMA chave serve para trancar e destrancar, como a chave da sua porta. É rápida e ótima para proteger muitos dados (o conteúdo de um arquivo, de um disco, de uma conversa). O desafio: como entregar a chave ao outro lado sem que ninguém a intercepte? Se você manda a chave pelo mesmo canal inseguro, um espião a copia. Esse problema de combinar a chave é resolvido pela criptografia assimétrica, que vem a seguir.'
          ),
          sl(
            'Criptografia assimétrica',
            'Na ASSIMÉTRICA existe um PAR de chaves ligadas matematicamente: a chave PÚBLICA, que você pode espalhar à vontade, e a chave PRIVADA, que só você guarda. O que uma tranca, só a outra destranca. Analogia: um cadeado aberto (público) que qualquer pessoa pode fechar, mas só você tem a chave (privada) para abrir. Assim, alguém pode te mandar um segredo usando sua chave pública, e só você lê. É mais lenta que a simétrica; na prática, os dois tipos trabalham juntos: a assimétrica combina uma chave simétrica de forma segura e a simétrica protege os dados. É assim que o HTTPS funciona, e a chave privada nunca deve ser compartilhada.',
            'Simetrica   : 1 chave (tranca e destranca)\nAssimetrica : chave PUBLICA (tranca) + chave PRIVADA (destranca)'
          ),
          sl(
            'Hash: a impressão digital do dado',
            'HASH é uma função que transforma qualquer dado (um texto, uma senha, um arquivo de 4 GB) em um resultado de tamanho fixo, a impressão digital. Propriedades: a mesma entrada dá sempre o mesmo hash; uma mudança mínima na entrada muda o hash por completo; e é de MÃO ÚNICA (não dá para reconstruir o dado a partir do hash). Hash NÃO é criptografia: não existe chave nem como destrancar. Serve para verificar integridade (o arquivo baixado é igual ao original?) e para guardar senhas sem guardar a senha. Algoritmos antigos como MD5 e SHA-1 não são mais recomendados para segurança; a família SHA-2 (como SHA-256) é amplamente usada.'
          ),
          sl(
            'Exemplo real em Python (própria máquina)',
            'A biblioteca padrão do Python tem a hashlib. O exemplo a seguir calcula o SHA-256 de três textos quase iguais; repare que mudar um caractere muda o hash inteiro, e o tamanho é sempre o mesmo (64 caracteres hexadecimais). É código seguro de rodar na sua máquina; a saída abaixo é a saída real, executada em Python 3.',
            `import hashlib
for t in ['senha123', 'senha124', 'Senha123']:
    print(t, hashlib.sha256(t.encode()).hexdigest())

# saida real:
# senha123 55a5e9e78207b4df8699d60886fa070079463547b095d1a05bc719bb4e6cd251
# senha124 5bbc0ec9815106b520475fd75f82c4b25e8d509348764255ad9563e8854fd5b0
# Senha123 c00357563669ed21c34e13687cad669038eb88a2831fc8109b40ddc62f63e934`
          ),
          sl(
            'Assinatura digital',
            'ASSINATURA DIGITAL prova DUAS coisas: QUEM enviou (autenticidade) e que o conteúdo NÃO foi alterado (integridade). Funciona assim, em linhas gerais: o remetente calcula o hash do documento e o trava com a SUA CHAVE PRIVADA; esse resultado é a assinatura. Qualquer pessoa, usando a chave PÚBLICA do remetente, confere: se o hash bate, o documento é o original e foi assinado por quem tem aquela chave privada. Se uma vírgula mudar, a conferência falha. Aqui a chave privada é usada para ASSINAR e a pública para VERIFICAR (o inverso de proteger sigilo). Está por trás de certificados de sites, atualizações de programas e documentos assinados com certificado digital.'
          ),
          sl(
            'Erros comuns e resumo',
            'Erros comuns: achar que hash é criptografia (não é: não tem volta nem chave); achar que criptografia protege contra tudo (não protege se a chave ou a senha vaza, nem se o aparelho já estiver infectado); guardar chave privada em lugar aberto; usar algoritmos antigos e quebrados; e confundir assinatura com criptografia. Resumo: simétrica = uma chave, rápida; assimétrica = par público/privado, resolve a troca de chaves; hash = impressão digital de mão única, verifica integridade; assinatura = hash + chave privada, prova autoria e integridade.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Na criptografia simétrica, quantas chaves são usadas para trancar e destrancar a informação?', 'd', [
          'Duas, uma pública para trancar e uma privada para destrancar',
          'Nenhuma, pois o algoritmo secreto é o que protege o dado',
          'Três, uma para trancar, uma para destrancar e uma para conferir',
          'Uma, a mesma para as duas operações'
        ], 'Simétrica significa a mesma chave nos dois sentidos. O par público/privado é da assimétrica; o algoritmo é público, e o segredo fica na chave.'),
        mcq('q2', 'Em uma criptografia assimétrica, alguém quer te enviar um segredo. Que chave essa pessoa usa para trancá-lo?', 'a', [
          'A sua chave pública, que você divulga, e só sua chave privada abre',
          'A sua chave privada, que você precisa mandar antes para a pessoa',
          'Uma chave pública própria, e depois você recebe o segredo por e-mail',
          'A senha do seu e-mail, que serve de chave para trancar qualquer mensagem'
        ], 'O que a pública tranca, só a privada destranca; por isso a privada nunca deve ser compartilhada. Mandar a privada anularia a proteção.'),
        mcq('q3', 'Qual afirmação sobre hash está correta?', 'b', [
          'O hash pode ser revertido com a chave certa, voltando ao texto original',
          'Uma pequena mudança na entrada muda o hash por completo',
          'O hash de um arquivo grande é muito maior que o do arquivo pequeno',
          'Dois textos diferentes de mesmo tamanho possuem o mesmo hash por padrão'
        ], 'O efeito avalanche (pequena mudança, hash totalmente diferente) é uma propriedade essencial. Hash é de mão única, não tem chave e tem tamanho fixo.'),
        fill('q4', 'Complete com o nome da função cuja saída é uma impressão digital do dado, de mão única e de tamanho fixo.', 'impressao digital do dado = ___', ['hash'], 'Hash gera uma impressão digital de tamanho fixo e sem volta; serve para integridade e para guardar senhas.'),
        mcq('q5', 'Você baixou um programa e o site oficial publica o hash esperado. Calculando o hash do arquivo baixado, ele sai diferente. O que isso sugere?', 'c', [
          'Que o seu computador usa um sistema operacional diferente do usado pelo site',
          'Que o hash muda sozinho depois de alguns minutos e não deve ser levado em conta',
          'Que o arquivo foi alterado ou corrompido, então não deve ser instalado',
          'Que o arquivo está criptografado e basta informar a senha para abri-lo'
        ], 'Hash diferente significa conteúdo diferente: arquivo corrompido ou adulterado. O sistema operacional não altera o hash de um mesmo arquivo, e hash não é criptografia.'),
        mcq('q6', 'Na assinatura digital, qual chave o remetente usa para ASSINAR e qual a outra pessoa usa para VERIFICAR?', 'd', [
          'Assina com a chave pública e verifica com a chave pública',
          'Assina com a chave pública e verifica com a chave privada',
          'Assina com a chave privada e verifica com a chave privada',
          'Assina com a chave privada e verifica com a chave pública'
        ], 'Só o dono tem a privada, então só ele assina; qualquer pessoa verifica com a pública. Isso prova autoria e integridade.'),
        mcq('q7', 'Qual destas é uma confusão comum que a lição mostra?', 'a', [
          'Achar que hash é criptografia, quando ele não tem chave nem volta',
          'Achar que criptografia usa algoritmos matemáticos conhecidos e testados',
          'Achar que a chave privada deve ficar guardada com o seu dono',
          'Achar que assinatura digital ajuda a verificar se um documento foi alterado'
        ], 'Hash é de mão única e não envolve chave. As outras opções descrevem fatos corretos, não confusões.'),
        fill('q8', 'Complete com o nome da chave que só o dono guarda e que nunca deve ser compartilhada.', 'chave publica / chave ___', ['privada', 'private'], 'A chave privada fica só com o dono; se vazar, quem a tiver pode ler segredos ou assinar em nome dele.')
      ]
    },
    {
      id: 'csb-09-navegacao-segura-https',
      title: 'Navegação segura: HTTPS, certificados e sites falsos',
      goal: 'Entender o que o cadeado do navegador garante (e o que não garante), reconhecer sites falsos, usar extensões, downloads e pop-ups com cuidado e manter o navegador atualizado.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O cadeado e o HTTPS',
            'Quando o endereço começa com https:// e o navegador mostra um cadeado, a conversa entre você e o site está CRIPTOGRAFADA: quem estiver no meio do caminho (por exemplo, alguém na mesma rede Wi-Fi) não consegue ler nem alterar o que trafega. A letra S de HTTPS vem de secure. Analogia: é como enviar uma carta em envelope lacrado em vez de um cartão-postal aberto. Sem HTTPS (http:// puro), senhas e dados podem ser vistos no caminho, por isso nunca digite senha ou cartão em site sem HTTPS.'
          ),
          sl(
            'Certificados em nível simples',
            'Como o navegador sabe que está falando com o site verdadeiro e não com um impostor? Pelo CERTIFICADO DIGITAL: um documento que o site apresenta, assinado por uma autoridade certificadora (uma entidade de confiança) confirmando que aquele endereço pertence a quem o controla. É como o registro de uma empresa em cartório. O navegador confere o certificado automaticamente. Se estiver vencido, errado ou não confiável, aparece um AVISO DE SEGURANÇA em tela cheia. Nunca clique em "continuar mesmo assim" em um site que pede senha ou dinheiro.'
          ),
          sl(
            'O que o cadeado NÃO garante',
            'Este é o erro mais comum: o cadeado diz que a conexão é protegida, NÃO que o site é honesto. Golpistas também conseguem certificados e criam sites falsos com cadeado perfeito. Então um site falso do "banco" ou da "loja" pode ter HTTPS e continuar sendo golpe. O que importa é conferir O ENDEREÇO: o nome do domínio (a parte logo antes da primeira barra) precisa ser exatamente o da empresa. Atenção a trocas sutis: letras trocadas, hífens extras, palavras adicionadas (banco-seguro-atendimento.example) ou domínios diferentes como .shop e .top onde se esperava o oficial.',
            'Oficial   : https://www.loja-exemplo.example/\nSuspeito  : https://loja-exemplo-promocao.example/\n(os dois tem cadeado: o cadeado nao prova que e verdadeiro)'
          ),
          sl(
            'Sites falsos: como reconhecer',
            'Sinais: endereço levemente diferente do oficial; promoção boa demais, com preço muito abaixo do mercado e prazo curto; ausência de dados reais da empresa (CNPJ, endereço, atendimento); pagamento só por Pix ou transferência para pessoa física; avaliações todas iguais; e site que chegou por anúncio, mensagem ou link patrocinado. Hábitos que ajudam: digitar o endereço você mesmo ou usar favoritos para sites sensíveis como banco; pesquisar a reputação da loja antes de comprar; preferir meios de pagamento com proteção; e desconfiar de qualquer página que peça dados que não faria sentido pedir.'
          ),
          sl(
            'Extensões, downloads e pop-ups',
            'EXTENSÕES são pequenos programas que se instalam no navegador. Podem ver e alterar o que você faz nas páginas, e extensões maliciosas roubam senhas ou injetam anúncios. Instale só as de que precisa, da loja oficial do navegador, de desenvolvedores conhecidos, e revise as permissões que pedem. DOWNLOADS: baixe do site oficial do programa, desconfie de "atualizadores" que aparecem do nada e de arquivos .exe ou .zip enviados por desconhecidos. POP-UPS e avisos que dizem "seu computador está infectado, ligue já" ou "você ganhou um prêmio" são golpes: feche a aba (ou o navegador) sem clicar dentro e não ligue para o número exibido.'
          ),
          sl(
            'Atualize o navegador',
            'O navegador é o programa que mais acessa a internet, então é um alvo constante. Fabricantes corrigem falhas de segurança com frequência e as correções só valem se você atualizar. Deixe a atualização automática ligada e reinicie o navegador quando ele pedir. Também ajuda manter ligados os recursos de navegação segura do navegador, que avisam sobre páginas e downloads perigosos, e evitar salvar senhas e cartões em computadores que outras pessoas usam. Em computador compartilhado ou público, use janela anônima, saia das contas ao terminar e nunca marque "manter conectado".'
          ),
          sl(
            'Resumo prático',
            'Antes de digitar senha ou dados de pagamento: (1) confira o endereço exato; (2) confirme o HTTPS, sabendo que ele sozinho não basta; (3) desconfie do que chegou por mensagem ou anúncio; (4) não ignore avisos de certificado; (5) use favoritos para banco e serviços importantes; (6) mantenha navegador e extensões atualizados e enxutos. Em caso de dúvida, saia da página e acesse o site pelo caminho que você conhece.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que o cadeado do navegador (HTTPS) garante?', 'a', [
          'Que a conversa entre você e o site é criptografada contra quem está no meio do caminho',
          'Que o site é seguro, confiável e que a loja entregará o produto comprado no prazo combinado',
          'Que o site foi aprovado por um órgão do governo e não pode ser golpe',
          'Que o seu computador está livre de vírus enquanto você navega pelo site'
        ], 'O HTTPS protege o trânsito dos dados. Golpistas também podem ter cadeado, então ele não prova honestidade do site nem protege o computador.'),
        mcq('q2', 'Um site de promoção tem cadeado, mas o endereço é banco-seguro-atendimento.example e pede sua senha. O que concluir?', 'd', [
          'Que é seguro, pois o cadeado garante que o site pertence ao banco verdadeiro',
          'Que é seguro se a página tiver o logotipo do banco e um layout idêntico ao oficial',
          'Que é seguro desde que o site peça a senha uma vez e não peça mais dados',
          'Que é suspeito: o endereço não é o oficial, e o cadeado não prova autenticidade'
        ], 'O que vale é o domínio exato. Logotipo e layout são fáceis de copiar, e cadeado só mostra que a conexão é criptografada.'),
        mcq('q3', 'Ao acessar um site, o navegador mostra um aviso em tela cheia de certificado inválido. Qual a melhor atitude?', 'b', [
          'Clicar em continuar mesmo assim, pois o aviso costuma ser um erro do navegador',
          'Não prosseguir, principalmente se o site pedir senha ou dados de pagamento',
          'Continuar se o site for de uma loja que oferece frete grátis',
          'Reiniciar o navegador várias vezes até que o aviso deixe de aparecer'
        ], 'Aviso de certificado indica que o navegador não consegue confirmar a identidade do site; seguir com dados sensíveis é arriscado. Reiniciar não corrige o problema real.'),
        fill('q4', 'Complete com a sigla do protocolo seguro que aparece no começo do endereço quando há conexão criptografada.', '___://www.loja-exemplo.example', ['https'], 'HTTPS é o HTTP com camada de segurança; o S significa secure.'),
        mcq('q5', 'Aparece um pop-up dizendo que o seu computador está infectado e pedindo para ligar para um número. O que fazer?', 'c', [
          'Ligar para o número, pois ele aparece na tela do próprio navegador',
          'Clicar no botão de verificação para saber qual é a infecção do computador',
          'Fechar a aba ou o navegador sem clicar na janela e não ligar para o número',
          'Informar o modelo do computador ao atendente para receber ajuda correta'
        ], 'Esse aviso é um golpe de falso suporte. Fechar sem interagir e não ligar é a defesa; ligar abre caminho para pedidos de acesso remoto e pagamentos.'),
        mcq('q6', 'Qual cuidado é mais adequado ao instalar extensões do navegador?', 'a', [
          'Instalar apenas as necessárias, da loja oficial, e olhar as permissões',
          'Instalar todas que parecem úteis, pois o navegador as isola por completo do resto',
          'Baixar a extensão de qualquer site que a ofereça de graça, sem olhar as permissões',
          'Escolher a extensão com o maior número de anúncios, pois isso mostra que ela é popular'
        ], 'Extensões podem ver e alterar o que você faz no navegador. Menos é mais, e as permissões revelam o que ela pode acessar.'),
        mcq('q7', 'Por que manter o navegador atualizado ajuda na segurança?', 'd', [
          'Porque as atualizações aumentam a velocidade da internet contratada pela casa',
          'Porque o navegador atualizado passa a bloquear qualquer golpe sem depender da atenção do usuário',
          'Porque as versões antigas deixam de abrir sites com cadeado depois de um tempo',
          'Porque as atualizações corrigem falhas de segurança que atacantes já conhecem'
        ], 'Atualizações trazem correções de falhas conhecidas. Elas não mudam a velocidade da conexão nem eliminam a necessidade de atenção do usuário.'),
        fill('q8', 'Complete com o documento digital que um site apresenta, assinado por uma autoridade, para provar que o endereço pertence a ele.', 'certificado ___', ['digital'], 'O certificado digital liga o endereço ao dono verdadeiro; o navegador o confere sozinho e avisa se algo estiver errado.')
      ]
    },
    {
      id: 'csb-10-email-seguro-golpes',
      title: 'E-mail seguro e golpes por e-mail',
      goal: 'Reconhecer spoofing, anexos e links perigosos, golpes de fatura e boleto e BEC (fraude de e-mail empresarial) e saber verificar remetentes com segurança.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que o e-mail é tão visado',
            'O e-mail é a chave da sua vida digital: é com ele que você recupera senhas de quase todas as contas. Quem controla seu e-mail pode controlar o resto. Além disso, é o canal favorito de golpistas, pois enviar milhões de mensagens custa quase nada. Esta lição mostra os principais truques e como verificar com segurança. Você já viu phishing de forma geral; aqui o foco é o e-mail em si.'
          ),
          sl(
            'Spoofing: o remetente que parece verdadeiro',
            'SPOOFING (falsificação) é forjar o remetente de uma mensagem para parecer outra pessoa ou empresa. O que aparece como NOME do remetente ("Banco Exemplo") é só texto que qualquer um escolhe; o que importa é o ENDEREÇO de e-mail real, que fica entre os sinais de menor e maior (<...>). Mesmo o endereço pode ser forjado em alguns casos, ou ser quase igual ao verdadeiro (um m trocado por rn, uma letra a mais). Existem proteções técnicas do lado do provedor para barrar parte dessas falsificações, mas elas não pegam tudo. Por isso, o conteúdo da mensagem também importa: pede senha? urgência? algo fora do comum?',
            'Nome exibido : Banco Exemplo\nEndereco real: atendimento@banco-exemplo-seguranca.example\n(o nome e so um rotulo; confira o endereco)'
          ),
          sl(
            'Anexos e links',
            'ANEXOS: arquivos inesperados são o caminho clássico de malware, principalmente executáveis, compactados (zip), documentos com pedido para "habilitar macros ou edição" e PDFs que levam a outros links. Se não esperava o arquivo, confirme com quem enviou por outro canal antes de abrir. LINKS: passe o mouse por cima, sem clicar, para ver o endereço de destino; no celular, mantenha o dedo pressionado. Encurtadores (links curtos) escondem o destino. Em dúvida, não use o link: abra o site digitando o endereço você mesmo. Evite abrir anexos e links de mensagens que chegaram como "pendência", "documento importante" ou "comprovante".'
          ),
          sl(
            'Golpes de fatura e boleto',
            'Golpistas mandam e-mails que imitam cobranças reais: fatura de cartão, conta de luz, nota fiscal, "boleto em atraso", "intimação". O anexo ou link leva a um malware ou a um boleto com código de barras de OUTRA conta, de modo que o pagamento vai para o golpista. Como se proteger: antes de pagar qualquer boleto recebido por e-mail ou mensagem, confira se o beneficiário (o nome de quem recebe) exibido no app do seu banco é a empresa esperada, e prefira ver a cobrança direto no site ou app oficial. Desconfie de cobranças que você não reconhece e de pedidos para pagar com urgência para evitar multa.'
          ),
          sl(
            'BEC: fraude de e-mail empresarial',
            'BEC (Business Email Compromise, fraude do e-mail empresarial) é o golpe em que o criminoso se passa por um chefe, fornecedor ou parceiro para fazer uma empresa transferir dinheiro ou mudar dados bancários. Exemplos: "aqui é o diretor, preciso de uma transferência urgente e sigilosa"; ou um fornecedor "avisando" que o IBAN/conta para pagamento mudou. Muitas vezes o criminoso já invadiu o e-mail real do fornecedor ou o imita muito bem, e conhece o contexto. Defesa: regra de confirmação por OUTRO canal (ligar para um número já conhecido) antes de qualquer mudança de conta bancária ou pagamento fora do padrão, e aprovação por duas pessoas para valores relevantes.'
          ),
          sl(
            'Como verificar um remetente e o que fazer',
            'Passos: (1) veja o endereço completo, não só o nome; (2) compare com e-mails anteriores legítimos da mesma empresa; (3) olhe o conteúdo: pede dados, urgência, tom estranho, linguagem fora do padrão da pessoa? (4) confirme por outro canal, como ligar para o número oficial ou perguntar pessoalmente; (5) na dúvida, não abra, não clique, não responda. Denuncie como phishing no próprio serviço de e-mail e apague. Se já abriu algo suspeito, desconecte o aparelho da rede, rode o antivírus e troque as senhas a partir de outro aparelho.'
          ),
          sl(
            'Hábitos que protegem sua caixa de entrada',
            'Use senha forte e única no e-mail e ligue o MFA, pois ele é a porta para todas as outras contas. Não use o e-mail do trabalho em cadastros pessoais, e vice-versa. Desconfie de pedidos fora do padrão, mesmo vindos de colegas, e desligue o carregamento automático de imagens remotas se o seu programa permitir. Revise de vez em quando os dispositivos conectados à conta e as regras de encaminhamento automático: golpistas que invadem uma conta costumam criar uma regra que copia seus e-mails para eles.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um e-mail mostra o nome "Banco Exemplo", mas o endereço real é atendimento@banco-exemplo-seguranca.example. O que isso indica?', 'c', [
          'Que o e-mail é legítimo, pois o nome exibido é exatamente o do banco',
          'Que o endereço é confiável porque contém a palavra segurança no domínio',
          'Que o nome exibido é só um rótulo e o endereço real merece desconfiança',
          'Que o e-mail é verdadeiro se o logotipo do banco aparecer no corpo da mensagem'
        ], 'O nome exibido pode ser qualquer texto. O endereço real é o que identifica; um domínio diferente do oficial é sinal de alerta, mesmo com palavras como segurança.'),
        mcq('q2', 'Você recebe um boleto em PDF por e-mail de uma empresa que costuma enviar cobranças. Qual cuidado é mais útil antes de pagar?', 'b', [
          'Pagar logo, pois o PDF está com o nome da empresa e o valor correto',
          'Conferir no app do banco se o beneficiário é a empresa esperada',
          'Encaminhar o boleto a um amigo para que ele também faça a conferência dos dados',
          'Pagar um valor menor primeiro, para testar se o boleto é verdadeiro'
        ], 'O beneficiário exibido no app do banco mostra para quem o dinheiro realmente vai. Nome e valor no PDF podem ser forjados, e pagar em partes só aumenta a perda possível.'),
        mcq('q3', 'No financeiro de uma empresa, chega um e-mail do suposto diretor pedindo uma transferência urgente e sigilosa. Qual é a melhor resposta?', 'a', [
          'Confirmar por telefone, usando um número já conhecido, antes de fazer qualquer transferência',
          'Fazer a transferência, pois o diretor disse que era urgente e sigiloso e não deve ser questionado',
          'Responder ao mesmo e-mail pedindo confirmação e agir assim que vier a resposta',
          'Fazer metade do valor agora e aguardar a confirmação para completar o restante'
        ], 'Confirmar por outro canal quebra o golpe, pois a resposta ao mesmo e-mail pode vir do próprio golpista. Urgência e sigilo são justamente gatilhos de fraude BEC.'),
        fill('q4', 'Complete com o termo que designa forjar o remetente de uma mensagem para parecer outra pessoa ou empresa.', 'forjar o remetente = ___', ['spoofing'], 'Spoofing é a falsificação do remetente; por isso se confere o endereço real e o conteúdo da mensagem.'),
        mcq('q5', 'Como ver para onde um link de e-mail realmente leva, sem clicar nele?', 'd', [
          'Clicar nele, pois só assim o navegador mostra o endereço de destino',
          'Ler o texto do link, que corresponde ao destino real por regra',
          'Verificar se o link começa com https, pois isso confirma que o destino é verdadeiro',
          'Passar o mouse por cima, ou manter o dedo pressionado no celular, para ver o endereço'
        ], 'O texto do link pode ser diferente do destino, e o https não prova nada sobre honestidade. Passar o mouse mostra o endereço real sem abrir a página.'),
        mcq('q6', 'Um fornecedor de confiança envia um e-mail avisando que a conta bancária para pagamento mudou. Qual a atitude mais segura?', 'c', [
          'Atualizar a conta no sistema e pagar, já que o e-mail veio de um contato conhecido',
          'Atualizar a conta nos próximos pagamentos pequenos e guardar o aviso por precaução',
          'Ligar para um número já conhecido do fornecedor antes de qualquer pagamento',
          'Responder pedindo o comprovante de que a conta nova pertence à empresa fornecedora'
        ], 'Mesmo vindo do contato habitual, o e-mail pode ter sido invadido ou imitado. Confirmar por outro canal já conhecido é a defesa; o comprovante enviado pelo mesmo e-mail pode ser falso.'),
        mcq('q7', 'Por que é importante revisar as regras de encaminhamento do seu e-mail de tempos em tempos?', 'a', [
          'Porque golpistas que invadem a conta podem criar regra que copia seus e-mails',
          'Porque o provedor apaga as regras antigas e passa a bloquear novos e-mails',
          'Porque as regras de encaminhamento fazem o e-mail gastar mais bateria no celular',
          'Porque a regra de encaminhamento impede a recuperação da senha no futuro'
        ], 'Uma regra oculta de encaminhamento mantém o invasor lendo seus e-mails mesmo depois de trocar a senha. As outras explicações são inventadas.'),
        fill('q8', 'Complete com a sigla do golpe em que o criminoso se passa por chefe ou fornecedor para pedir transferências (fraude do e-mail empresarial).', '___ = Business Email Compromise', ['bec'], 'BEC é a fraude do e-mail empresarial; a defesa é confirmar por outro canal e exigir dupla aprovação em pagamentos relevantes.')
      ]
    },
    {
      id: 'csb-11-atualizacoes-patches',
      title: 'Atualizações e patches',
      goal: 'Entender por que atualizar, o que são vulnerabilidades conhecidas e CVE em nível simples, usar a atualização automática e lidar com software fora de suporte.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que atualizar',
            'Programas são escritos por pessoas e, como qualquer texto grande, têm erros. Alguns erros são FALHAS DE SEGURANÇA (vulnerabilidades): permitem que alguém faça o que não deveria. Quando uma falha é descoberta, o fabricante cria uma correção, chamada PATCH ou atualização de segurança. Analogia: o fabricante do carro descobre que uma peça pode falhar e convoca os donos para o recall; quem não leva o carro continua com o risco. Atualizar é fechar a janela com o trinco quebrado antes que alguém a use.'
          ),
          sl(
            'Vulnerabilidades conhecidas e CVE',
            'Quando uma falha de segurança é publicada, ela recebe um identificador padronizado chamado CVE (Common Vulnerabilities and Exposures), no formato CVE-ano-número, para que todos falem da mesma falha. Exemplo apenas de formato: CVE-2099-12345 (fictício). A partir do momento em que a falha e a correção são públicas, criminosos também ficam sabendo e passam a procurar quem NÃO atualizou, muitas vezes de forma automática. Por isso o perigo maior não é a falha desconhecida, e sim a falha CONHECIDA que você deixou aberta. Quanto mais tempo sem atualizar, maior a janela de oportunidade.',
            'Formato de um CVE: CVE-AAAA-NNNN\nExemplo ficticio: CVE-2099-12345\nCVE = nome da falha  |  patch = correcao'
          ),
          sl(
            'O que atualizar',
            'Atualize tudo que roda no seu aparelho: o sistema operacional (Windows, macOS, Linux, Android, iOS), o navegador, os aplicativos (incluindo leitores de PDF e editores de documentos), o firmware do roteador, e também aparelhos da casa conectados à internet (câmeras, TV, smart speaker). Esquecer dispositivos que não parecem computadores é comum, e eles são alvos fáceis, podendo virar parte de uma botnet. Em empresas, existe um processo chamado gestão de patches, que lista o que existe e controla o que foi atualizado.'
          ),
          sl(
            'Atualização automática',
            'A forma mais simples e segura é ligar a ATUALIZAÇÃO AUTOMÁTICA no sistema e nos aplicativos importantes. Assim, as correções chegam sem depender de você lembrar. Alguns pontos práticos: reinicie quando o sistema pedir (muitas correções só valem após o reinício); deixe o aparelho conectado e carregando durante a instalação; faça a atualização a partir da fonte oficial (nunca por um link recebido por mensagem dizendo ser atualização); e desconfie de pop-ups de "atualização" em sites, que costumam ser malware disfarçado. Em empresas, testa-se antes em poucos computadores, mas não se adia por meses.'
          ),
          sl(
            'Software fora de suporte',
            'Todo software tem um prazo de vida: depois de certa data o fabricante para de lançar correções. Esse estado se chama FIM DE SUPORTE (end of life). Daí em diante, cada nova falha descoberta fica sem correção para sempre, e passa a ser um risco permanente. Isso vale para sistemas operacionais antigos, versões velhas de programas e celulares que não recebem mais atualizações. O que fazer: planejar a troca antes do fim do suporte; se não for possível trocar já, reduza a exposição (tire o aparelho da internet ou da rede principal, use apenas para o necessário) e nunca o use para banco ou dados sensíveis.'
          ),
          sl(
            'Erros comuns e resumo',
            'Erros comuns: "se está funcionando, não mexo" (o que funciona hoje pode estar vulnerável); adiar a atualização por meses, deixando a janela aberta; baixar atualização de fonte desconhecida; esquecer roteador e aparelhos da casa; e achar que antivírus substitui atualização (ele ajuda, mas não conserta a falha do programa). Resumo: atualizar fecha falhas conhecidas; CVE é o nome padrão de uma falha pública; atualização automática é o melhor hábito; software sem suporte é risco contínuo e deve ser substituído ou isolado.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que é um patch?', 'b', [
          'Um programa que apaga arquivos antigos do computador para liberar espaço e deixá-lo mais rápido',
          'Uma correção publicada pelo fabricante para consertar uma falha, inclusive de segurança',
          'Um tipo de vírus que se espalha por pen drives entre computadores',
          'Uma senha temporária que o sistema gera durante a instalação de programas'
        ], 'Patch é a correção que o fabricante publica; as de segurança fecham vulnerabilidades. As outras opções descrevem coisas diferentes.'),
        mcq('q2', 'Qual é o maior perigo relacionado a uma vulnerabilidade já publicada e com correção disponível?', 'd', [
          'O fabricante pode cobrar caro pela correção depois que ela for publicada',
          'A falha pode desaparecer sozinha com o tempo, mas o sistema ficará mais lento',
          'A correção pode ser pior que a falha, portanto esperar meses é a melhor escolha',
          'Criminosos procurarem quem ainda não atualizou, pois já sabem como a falha funciona'
        ], 'Depois que a falha é pública, atacantes a procuram em quem não atualizou. A correção existe para ser aplicada; esperar mantém a janela aberta.'),
        mcq('q3', 'O que significa o identificador CVE-2099-12345 (fictício)?', 'c', [
          'Um código que indica o número de série do computador afetado e o ano de fabricação',
          'Uma senha de administrador criada pelo fabricante do programa',
          'O nome padronizado de uma falha de segurança conhecida (CVE-ano-número)',
          'O endereço do site oficial onde o programa deve ser baixado'
        ], 'CVE é um identificador padronizado, que permite que todos falem da mesma falha. Não é senha, número de série nem endereço de site.'),
        fill('q4', 'Complete com o nome do estado de um software cujo fabricante deixou de lançar correções de segurança: fim de ___.', 'fim de ___ (end of life)', ['suporte'], 'Fim de suporte significa que novas falhas não receberão correção, o que torna o software um risco permanente.'),
        mcq('q5', 'Uma pessoa acha melhor não atualizar o celular porque o aparelho está funcionando bem. Qual a melhor resposta?', 'a', [
          'Funcionar bem não significa estar protegido, pois falhas conhecidas podem estar abertas',
          'Está correta, pois atualizar deixa o celular mais lento e mais inseguro',
          'Está correta, desde que ela baixe aplicativos de lojas oficiais e use um antivírus gratuito',
          'Está errada, pois a atualização serve só para trazer novos emojis e visuais'
        ], 'O funcionamento aparente não revela falhas conhecidas. Atualizações de segurança são o ponto principal; apps de loja oficial ajudam, mas não substituem os patches do sistema.'),
        mcq('q6', 'Aparece em um site um pop-up dizendo "Seu navegador está desatualizado, clique para atualizar". O que fazer?', 'c', [
          'Clicar, pois o site conhece melhor a versão que o seu navegador utiliza',
          'Clicar, caso o botão do pop-up tenha uma cor parecida com a do navegador',
          'Fechar a página e atualizar pelo menu do próprio navegador ou pela loja oficial',
          'Baixar o arquivo e abri-lo se o antivírus estiver ligado no momento'
        ], 'Falsos pop-ups de atualização são um caminho comum de malware. Atualizar pelo próprio programa ou pela loja oficial é seguro; abrir o arquivo mesmo com antivírus é arriscado.'),
        mcq('q7', 'Qual aparelho costuma ser esquecido nas atualizações, mas pode ser usado por atacantes?', 'd', [
          'O monitor desligado da tomada que está guardado no armário',
          'O pen drive vazio que fica guardado em uma gaveta fechada',
          'O mouse sem fio que se conecta ao computador por um receptor',
          'O roteador do Wi-Fi e câmeras e TVs conectadas à internet'
        ], 'Roteador e aparelhos inteligentes ficam ligados à internet e muitas vezes não são atualizados, virando alvo fácil e até parte de botnets.'),
        fill('q8', 'Complete com o tipo de atualização que, depois de ligada, instala as correções sem que você precise lembrar.', 'atualizacao ___', ['automática', 'automatica'], 'A atualização automática garante que as correções cheguem sem depender da memória do usuário; reiniciar quando pedido completa o processo.')
      ]
    },
    {
      id: 'csb-12-protegendo-o-dispositivo',
      title: 'Protegendo o seu dispositivo',
      goal: 'Configurar o básico de proteção em computador: conta comum x administrador, bloqueio de tela, criptografia de disco, antivírus, firewall pessoal, em Windows, macOS e Linux.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Camadas de proteção',
            'Nenhuma medida isolada resolve tudo, por isso se usam CAMADAS, como em uma casa: portão, porta, tranca, alarme. Para o seu computador, as camadas básicas são: usar conta de usuário comum no dia a dia, bloquear a tela, criptografar o disco, manter antivírus e firewall ligados, atualizar e fazer backup. Cada camada cobre uma falha das outras. O que vem a seguir vale para Windows, macOS e Linux, e todos já trazem as ferramentas principais sem custo.'
          ),
          sl(
            'Conta comum x administrador',
            'A conta de ADMINISTRADOR pode instalar programas e mudar qualquer configuração do sistema. A conta de USUÁRIO COMUM pode usar o computador, mas não mexe no que é crítico. Se você navega e abre arquivos usando administrador e um malware roda, ele herda o poder total. Se estiver como usuário comum, o estrago é menor, porque o sistema pede senha antes de mudanças importantes. Boa prática: crie uma conta de administrador para instalar e configurar, e use outra conta comum para o dia a dia. Princípio de fundo: privilégio mínimo, ou seja, dar só a permissão necessária para a tarefa.',
            'Dia a dia  -> conta COMUM\nInstalar/configurar -> conta ADMINISTRADOR (so quando precisa)'
          ),
          sl(
            'Bloqueio de tela e criptografia de disco',
            'BLOQUEIO DE TELA com senha forte (ou PIN longo, biometria) impede que alguém use seu computador quando você sai da mesa. Configure bloqueio automático após pouco tempo de inatividade e aprenda o atalho para bloquear na hora. CRIPTOGRAFIA DE DISCO embaralha tudo o que está guardado no disco: se o notebook for roubado ou perdido, quem o abrir não consegue ler os arquivos sem a chave. Cada sistema tem a sua: BitLocker (Windows, em edições que o oferecem), FileVault (macOS) e LUKS (Linux, escolhido na instalação). Guarde com cuidado a chave de recuperação, fora do computador, pois sem ela você também perde o acesso aos dados.'
          ),
          sl(
            'Antivírus e Defender',
            'ANTIVÍRUS é um programa que procura e bloqueia malware, comparando com assinaturas conhecidas e observando comportamentos suspeitos. No Windows já vem o Microsoft Defender, que é competente e atualizado automaticamente; mantê-lo ligado costuma ser suficiente para a maioria das pessoas, junto com bons hábitos. No macOS há proteções internas contra programas de fontes não confiáveis; no Linux o risco para usuários comuns é menor, mas os hábitos importam do mesmo jeito. Cuidado com antivírus "gratuitos" desconhecidos e com programas que aparecem dizendo que o computador está infectado: muitos são golpe. E lembre-se: antivírus não substitui atualização nem atenção.'
          ),
          sl(
            'Firewall pessoal',
            'FIREWALL é o porteiro do tráfego de rede: decide o que pode entrar e sair do computador. O firewall PESSOAL é o que já vem no sistema: por padrão ele bloqueia conexões que chegam sem terem sido pedidas por você. No Windows é o Firewall do Windows Defender, no macOS há o firewall do sistema (vale conferir se está ligado), e no Linux costuma-se usar ferramentas como ufw. Deixe-o ligado, especialmente em Wi-Fi público, e não o desative só porque "um programa não conectava": isso abre uma porta. Se um programa precisa de acesso, crie uma regra pontual.'
          ),
          sl(
            'Outros cuidados e erros comuns',
            'Complementam: manter o sistema atualizado (lição anterior), desinstalar programas sem uso (menos superfície de ataque), não plugar pen drives desconhecidos, desligar compartilhamentos e acesso remoto que você não usa e fazer backup. Erros comuns: usar sempre a conta de administrador, deixar o computador sem senha, desativar o firewall ou antivírus para "ganhar velocidade", anotar a chave de recuperação do disco no próprio computador e instalar vários antivírus ao mesmo tempo (eles brigam e atrapalham). Em computadores compartilhados, cada pessoa deve ter sua própria conta.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que é recomendado usar uma conta de usuário comum no dia a dia, em vez de administrador?', 'a', [
          'Porque, se um malware rodar, ele terá menos poder para alterar o sistema',
          'Porque a conta comum deixa o computador mais rápido e dispensa antivírus',
          'Porque o administrador não consegue acessar a internet com segurança',
          'Porque contas comuns fazem backup sozinhas e protegem os arquivos pessoais'
        ], 'Programas herdam as permissões de quem os abre; com conta comum o dano possível é menor. Isso é privilégio mínimo. Não substitui antivírus nem faz backup.'),
        mcq('q2', 'Um notebook com disco criptografado é roubado. O que a criptografia de disco garante?', 'd', [
          'Que o ladrão não conseguirá ligar o aparelho em nenhuma situação',
          'Que os arquivos do notebook serão restaurados automaticamente na nuvem',
          'Que o ladrão só consegue ler os arquivos se a bateria estiver carregada',
          'Que, sem a chave, quem abrir o disco não consegue ler os arquivos'
        ], 'A criptografia de disco protege o conteúdo guardado. Ela não impede de ligar o aparelho, nem faz cópia automática dos dados.'),
        mcq('q3', 'Qual dos itens abaixo é um bom hábito sobre a chave de recuperação do disco criptografado?', 'c', [
          'Salvá-la em um arquivo de texto na área de trabalho do próprio computador',
          'Enviá-la por e-mail para si mesmo com o assunto "chave do disco"',
          'Guardá-la fora do computador, em local seguro, como o gerenciador de senhas',
          'Memorizá-la parcialmente e descartar todas as cópias escritas do código'
        ], 'Se a chave está no próprio computador, ela some junto com ele; se for apenas decorada em parte, vira risco de perda. Fora do aparelho e em local seguro é o caminho.'),
        fill('q4', 'Complete com o nome da proteção que decide o que pode entrar e sair do computador pela rede (o porteiro do tráfego).', '___ pessoal = porteiro do trafego de rede', ['firewall'], 'O firewall pessoal bloqueia por padrão conexões que chegam sem terem sido pedidas, e deve ficar ligado.'),
        mcq('q5', 'Uma pessoa desliga o firewall porque um programa não conectava. Qual a melhor correção?', 'b', [
          'Deixar o firewall desligado de vez, já que o antivírus faz o mesmo papel',
          'Religar o firewall e criar uma regra pontual só para aquele programa',
          'Instalar um segundo firewall, pois dois protegem o dobro de um',
          'Manter o firewall desligado quando estiver em Wi-Fi público'
        ], 'Desativar o firewall abre portas para tudo; uma regra pontual resolve só o caso necessário. Antivírus e firewall têm funções diferentes, e Wi-Fi público é justamente onde ele é mais necessário.'),
        mcq('q6', 'Em relação ao antivírus, qual afirmação é mais correta?', 'd', [
          'Instalar três antivírus ao mesmo tempo dá mais proteção que um bem configurado',
          'Um programa que aparece na tela dizendo que o computador está infectado deve ser instalado imediatamente',
          'Com antivírus não é mais necessário atualizar o sistema nem ter cuidado com anexos',
          'Manter o antivírus do sistema ligado e atualizado ajuda, mas não substitui atenção nem atualizações'
        ], 'O antivírus é uma camada, não a única. Vários ao mesmo tempo atrapalham, e alertas de infecção em pop-ups costumam ser golpe.'),
        mcq('q7', 'Qual configuração ajuda mais quando você se afasta do computador no trabalho?', 'a', [
          'Bloqueio de tela com senha, manual e também automático após inatividade',
          'Deixar a tela ligada e o volume baixo para não chamar a atenção de ninguém',
          'Desconectar o computador do Wi-Fi e deixá-lo aberto na mesa por algumas horas',
          'Fechar o navegador e manter os outros programas abertos como estão'
        ], 'Bloquear a tela impede que outra pessoa use sua sessão. Fechar o navegador ou desconectar do Wi-Fi não impede acesso local aos arquivos.'),
        fill('q8', 'Complete com o princípio que manda dar a cada conta apenas a permissão necessária, nada além: privilégio ___.', 'privilegio ___', ['mínimo', 'minimo'], 'Privilégio mínimo reduz o estrago possível se uma conta ou programa for comprometido.')
      ]
    },
    {
      id: 'csb-13-wifi-publico-vpn',
      title: 'Wi-Fi público, rede doméstica e VPN',
      goal: 'Entender os riscos do Wi-Fi público, configurar a rede doméstica com segurança (roteador, WPA2/WPA3) e saber o que a VPN faz e o que NÃO faz.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Wi-Fi público: o que muda',
            'Wi-Fi público (shopping, aeroporto, cafeteria, hotel) é uma rede que você divide com desconhecidos, controlada por alguém que você não conhece. Riscos: outras pessoas na mesma rede podem tentar espiar o tráfego sem proteção; criminosos criam redes falsas com nomes parecidos (por exemplo, "Shopping_Gratis"), chamadas de rede falsa ou "gêmea do mal", para capturar seus dados; e páginas de "login" podem pedir dados pessoais desnecessários. Como o HTTPS protege o conteúdo das páginas hoje na maioria dos sites, o risco é menor do que já foi, mas ainda existe, principalmente com apps e sites sem proteção adequada.'
          ),
          sl(
            'Boas práticas em Wi-Fi público',
            'Confirme com o estabelecimento o nome exato da rede antes de conectar. Evite acessar banco e fazer compras em Wi-Fi público; use o 4G/5G do seu celular para o que é sensível. Só abra sites com HTTPS e mantenha o firewall ligado. Desative o compartilhamento de arquivos e a conexão automática a redes abertas. Ligue o MFA nas contas, pois mesmo se alguém capturar uma senha, ainda precisa do segundo fator. Ao terminar, esqueça a rede no aparelho. Em dúvida, use os próprios dados móveis ou compartilhe a internet do seu celular.'
          ),
          sl(
            'Rede doméstica: o roteador',
            'O ROTEADOR é a caixa que distribui a internet na sua casa; ele é a porta de entrada da sua rede. Cuidados: troque a SENHA DE ADMINISTRAÇÃO do roteador (a que abre a página de configuração) logo na instalação, pois a de fábrica costuma ser conhecida e igual em muitos aparelhos; troque também o nome e a senha do Wi-Fi para algo que não revele dados pessoais; mantenha o firmware (software do roteador) atualizado; desligue funções que você não usa, como acesso remoto à administração; e use uma rede separada, a rede de convidados, para visitas e aparelhos inteligentes.'
          ),
          sl(
            'WPA2 e WPA3',
            'Para proteger a rede sem fio, o roteador usa um padrão de criptografia. WPA2 e WPA3 são os padrões atuais recomendados, sendo o WPA3 o mais novo e mais forte; o WPA2 com senha forte ainda é aceitável. Evite WEP e WPA antigo, considerados quebrados, e jamais deixe a rede aberta, sem senha. A senha do Wi-Fi deve ser longa (uma frase-senha serve bem). Também é boa ideia desligar o WPS (aquele botão ou PIN de conexão fácil), que tem fragilidades conhecidas. Troque a senha do Wi-Fi se desconfiar que alguém não autorizado a conhece.',
            'Evitar : rede aberta, WEP, WPA antigo\nUsar   : WPA3 (ou WPA2 com senha longa)'
          ),
          sl(
            'O que a VPN faz',
            'VPN (rede privada virtual) cria um TÚNEL criptografado entre o seu aparelho e um servidor da empresa de VPN; todo o tráfego passa por ele. O que ela faz: protege seus dados de quem está na mesma rede local (útil em Wi-Fi público) e esconde da rede local e do site o seu endereço de IP de origem, mostrando o IP do servidor da VPN. Também é muito usada em empresas para acessar a rede interna com segurança, de casa. Analogia: ir de carro blindado e vidros escuros em uma estrada movimentada.'
          ),
          sl(
            'O que a VPN NÃO faz',
            'Não deixa você anônimo: a empresa da VPN passa a ver o seu tráfego, então você troca em quem confia; escolha provedores sérios e desconfie de VPN gratuita desconhecida, que pode vender dados ou conter malware. Não protege contra phishing (se você digitar a senha em página falsa, ela vai igual), nem contra malware já instalado, nem torna um site golpista honesto. Também não é permissão para violar leis ou termos de serviço. É uma camada útil em redes não confiáveis, mas não substitui senhas fortes, MFA, atualizações e atenção.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Em um shopping, aparecem duas redes: "Shopping_Centro" e "Shopping_Centro_Gratis". Qual atitude é mais segura?', 'c', [
          'Conectar-se à segunda, pois a palavra grátis indica que não há cobrança',
          'Conectar-se à que tiver o sinal mais forte, que é a que está mais perto',
          'Confirmar o nome exato da rede com o estabelecimento antes de se conectar',
          'Conectar-se às duas ao mesmo tempo, para ter uma conexão de reserva'
        ], 'Redes falsas com nomes parecidos existem para capturar dados. Confirmar o nome oficial com o local é a defesa; sinal forte não prova que a rede seja legítima.'),
        mcq('q2', 'O que você deve evitar fazer em Wi-Fi público, sempre que possível?', 'b', [
          'Ler notícias em sites com HTTPS enquanto espera o atendimento',
          'Acessar o app do banco ou fazer compras, preferindo os dados móveis',
          'Ligar o firewall e o bloqueio de tela do computador ou do celular',
          'Ativar o MFA nas contas mais importantes antes de viajar'
        ], 'Operações sensíveis são mais seguras pela rede móvel ou em casa. As outras ações são medidas de proteção ou uso de baixo risco.'),
        mcq('q3', 'Qual é a primeira mudança recomendada ao instalar um roteador novo?', 'a', [
          'Trocar a senha de administração de fábrica e definir uma senha forte para o Wi-Fi',
          'Manter a senha de fábrica, pois ela é única e secreta de cada aparelho vendido',
          'Desligar a criptografia do Wi-Fi para que a conexão fique mais rápida',
          'Deixar a rede aberta durante a primeira semana, para facilitar a conexão dos aparelhos'
        ], 'Senhas de fábrica costumam ser conhecidas e repetidas em muitos aparelhos. Desligar a criptografia ou abrir a rede deixa qualquer um entrar.'),
        fill('q4', 'Complete com o nome do padrão de proteção do Wi-Fi mais recente e mais forte recomendado (a letra e o número, por exemplo, WPA2 ou ___).', 'WPA2 ou ___', ['wpa3'], 'WPA3 é o padrão mais novo e forte; WPA2 com senha longa ainda é aceitável, mas WEP e redes abertas devem ser evitados.'),
        mcq('q5', 'Qual destas afirmações sobre a VPN é correta?', 'd', [
          'Ela torna você completamente anônimo para a empresa que fornece a VPN',
          'Ela impede que você caia em phishing, pois bloqueia todas as páginas falsas',
          'Ela deixa de ser necessária a partir do momento em que você usa antivírus',
          'Ela cria um túnel criptografado e esconde seu IP de origem da rede local e do site'
        ], 'A VPN protege o trânsito contra a rede local e muda o IP visível, mas o provedor vê o tráfego, e ela não impede phishing nem substitui outras defesas.'),
        mcq('q6', 'Uma pessoa usa uma VPN e depois digita a senha do banco em um site falso, cujo endereço difere do oficial. O que acontece?', 'a', [
          'A senha é capturada mesmo assim, pois a VPN não protege contra phishing',
          'A VPN bloqueia o site falso automaticamente e avisa a pessoa sobre o golpe',
          'A senha fica protegida porque está dentro do túnel criptografado da VPN',
          'A senha só é capturada se o site falso não tiver o cadeado do navegador'
        ], 'O túnel protege o caminho, mas quem recebe a senha é o site falso. VPN não detecta golpes, e o cadeado também não prova honestidade.'),
        mcq('q7', 'Por que desconfiar de uma VPN gratuita desconhecida?', 'c', [
          'Porque VPNs gratuitas costumam ser mais lentas que as VPNs pagas',
          'Porque a VPN gratuita impede o uso de aplicativos de banco no celular',
          'Porque o provedor vê seu tráfego e pode vender dados ou conter malware',
          'Porque a lei proíbe o uso de qualquer VPN em redes domésticas'
        ], 'Com VPN, o provedor passa a enxergar seu tráfego; por isso é preciso confiar nele. Velocidade e proibição legal não são o ponto.'),
        fill('q8', 'Complete com o nome do equipamento que distribui a internet em casa e é a porta de entrada da rede doméstica.', 'a caixa que distribui o Wi-Fi = ___', ['roteador', 'router'], 'O roteador é a porta de entrada da rede da casa; senha de administração forte, firmware atualizado e WPA2/WPA3 o protegem.')
      ]
    },
    {
      id: 'csb-14-backup-3-2-1',
      title: 'Backup e a regra 3-2-1',
      goal: 'Entender por que e como fazer backup, aplicar a regra 3-2-1, comparar nuvem e local, testar a restauração e proteger o backup contra ransomware.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que o backup é a rede de segurança',
            'BACKUP é uma cópia dos seus dados guardada em outro lugar, para que você possa recuperá-los se algo der errado. E algo dá errado com frequência: celular perdido ou roubado, disco que quebra, arquivo apagado sem querer, incêndio, ransomware que tranca tudo. Backup é a única defesa que funciona mesmo quando todas as outras falham: se você tem uma cópia boa, o pior dia vira um dia chato, e não uma catástrofe. Analogia: uma cópia da chave de casa com um parente de confiança.'
          ),
          sl(
            'A regra 3-2-1',
            'Um jeito simples de lembrar o que fazer: 3 cópias dos dados (o original e mais duas), em 2 tipos diferentes de mídia ou local (por exemplo, o computador e um HD externo, ou o computador e a nuvem) e 1 cópia FORA do local principal (offsite): na nuvem, na casa de um parente ou em outro prédio. Por que 3? Porque uma única cópia falha. Por que 2 mídias? Para uma falha do tipo de disco não levar tudo. Por que 1 fora? Porque incêndio, roubo ou enchente atingem tudo o que está no mesmo lugar.',
            '3 copias  | original + 2 backups\n2 midias   | ex.: PC + HD externo\n1 fora     | ex.: nuvem ou casa de parente'
          ),
          sl(
            'Nuvem x local',
            'Backup LOCAL (HD externo, pen drive grande, outro computador) é rápido e você controla, mas pode ser roubado, queimar ou ser trancado por ransomware se ficar conectado. Backup na NUVEM fica fora de casa e acessível de qualquer lugar, mas depende de internet, pode ter custo, e você confia a guarda a um provedor (proteja a conta com senha forte e MFA e, para dados sensíveis, cripte antes de enviar). O ideal costuma ser combinar os dois: um local e um na nuvem, o que já cumpre o 3-2-1. Atenção: sincronização não é backup. Serviços que espelham pastas (se você apaga ou se um ransomware trava o arquivo, a mudança se espalha) podem copiar o problema.'
          ),
          sl(
            'Teste a restauração',
            'Um backup que nunca foi restaurado é uma esperança, não uma garantia. Os problemas só aparecem na hora de precisar: arquivos corrompidos, backup que parou de rodar meses atrás, senha esquecida, cópia incompleta. Por isso, teste periodicamente: escolha alguns arquivos e restaure em outra pasta para conferir se abrem. Verifique também que o backup é AUTOMÁTICO (para não depender de lembrar) e que ele inclui o que realmente importa (fotos, documentos, contatos, bancos de dados da empresa). Anote onde estão as senhas e chaves de acesso ao backup.'
          ),
          sl(
            'Backup e ransomware',
            'O ransomware (sequestro de dados) tenta trancar também os backups que estiverem acessíveis: um HD externo sempre ligado ao computador, pastas de rede e até nuvens sincronizadas. Se o backup é alcançado, o resgate vira a única saída. Por isso: mantenha pelo menos uma cópia DESCONECTADA (offline) depois do backup, por exemplo um HD que só é ligado para copiar; use backup em nuvem com versões antigas dos arquivos (histórico de versões), que permite voltar ao estado de antes do ataque; e mantenha cópias imutáveis, que não podem ser alteradas por um período, quando o serviço oferecer.'
          ),
          sl(
            'Backups offline e cuidados finais',
            'BACKUP OFFLINE (air-gapped, "com folga de ar") é aquele que fica desligado da rede e do computador quando não está em uso: o que não está conectado, o malware não alcança. Guarde-o em lugar seguro (e fora de casa em parte do tempo, se possível) e proteja com criptografia, pois um HD perdido com seus documentos é um vazamento (LGPD, em empresas). Cuidados finais: faça backup antes de trocar de celular ou reinstalar o computador, mantenha o backup atualizado numa rotina (semanal, por exemplo) e lembre que descartar mídias exige apagar os dados com segurança.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que a regra 3-2-1 de backup recomenda?', 'd', [
          'Três senhas, dois aplicativos de segurança e um antivírus ligado',
          'Três computadores, dois roteadores e uma conexão de internet reserva',
          'Três backups no mesmo HD externo, para ter versões diferentes do mesmo arquivo',
          'Três cópias dos dados, em duas mídias diferentes, e uma delas fora do local principal'
        ], 'A regra trata de quantidade de cópias, variedade de mídia e uma cópia em outro local. As demais opções não têm relação com backup.'),
        mcq('q2', 'Por que é importante que uma das cópias fique fora do local principal?', 'a', [
          'Porque incêndio, roubo ou enchente podem atingir tudo o que está no mesmo lugar',
          'Porque a internet fica mais rápida quando as cópias ficam em locais diferentes',
          'Porque os HDs externos funcionam melhor quando longe do computador de origem',
          'Porque a regra legal obriga as pessoas a guardarem backups em outra cidade'
        ], 'Desastres físicos e roubo atingem o que está junto. A velocidade de internet não depende disso, e não há regra legal nesse sentido.'),
        mcq('q3', 'Uma pasta sincronizada na nuvem espelha tudo que é alterado no computador. Se um ransomware trancar os arquivos, o que pode acontecer?', 'c', [
          'A pasta na nuvem fica protegida, pois o provedor bloqueia as alterações maliciosas',
          'Os arquivos trancados não são enviados, pois a nuvem só recebe arquivos legíveis',
          'As versões trancadas podem ser sincronizadas, por isso sincronização não é o mesmo que backup',
          'A nuvem restaura as versões originais dos arquivos automaticamente, sem ação alguma'
        ], 'Sincronização espelha mudanças, inclusive as ruins. Só o histórico de versões ou um backup separado permite voltar ao estado anterior.'),
        fill('q4', 'Complete com o teste que confirma que o backup realmente funciona na hora de precisar.', 'teste de ___ do backup', ['restauração', 'restauracao'], 'Só restaurando alguns arquivos se descobre se o backup está completo e utilizável.'),
        mcq('q5', 'Por que manter uma cópia de backup desconectada (offline) ajuda contra ransomware?', 'b', [
          'Porque HDs desligados armazenam mais dados do que os que ficam conectados',
          'Porque o que não está conectado ao computador ou à rede não pode ser alcançado pelo malware',
          'Porque o ransomware só ataca arquivos que foram modificados na última semana e ignora o resto',
          'Porque o backup offline é feito de forma automática e dispensa a ação do usuário'
        ], 'Sem conexão, o malware não consegue acessar nem criptografar a cópia. A capacidade do HD e a automação não têm relação com isso.'),
        mcq('q6', 'Uma pessoa faz backup toda semana, mas nunca restaurou nada. Qual risco é mais real?', 'a', [
          'Descobrir só na hora de precisar que os arquivos estão incompletos ou corrompidos',
          'Que o backup acabe ocupando espaço excessivo e deixando o computador mais lento',
          'Que o provedor da nuvem apague o backup por falta de uso do serviço',
          'Que o backup revele ao ransomware onde estão os seus arquivos mais importantes'
        ], 'Backup não testado pode falhar silenciosamente. O risco é descobrir o problema na emergência.'),
        mcq('q7', 'Qual combinação cumpre melhor a regra 3-2-1 para uma família?', 'd', [
          'Fotos só no celular e uma cópia no mesmo celular, em outra pasta',
          'Fotos no computador e uma cópia no HD externo que fica ligado ao lado',
          'Fotos no celular, no tablet e no computador, sincronizados na mesma conta',
          'Fotos no computador, uma cópia no HD externo guardado e outra cópia na nuvem'
        ], 'Aqui há três cópias, duas mídias e uma delas fora de casa. Nos outros casos, as cópias ficam no mesmo local, sempre ligadas ou apenas sincronizadas.'),
        fill('q8', 'Complete com o nome do tipo de backup que fica desligado da rede e do computador quando não está em uso.', 'backup ___ (desconectado)', ['offline'], 'Backup offline não pode ser alcançado por ransomware enquanto está desconectado.')
      ]
    },
    {
      id: 'csb-15-privacidade-e-pegada-digital',
      title: 'Privacidade, pegada digital e LGPD',
      goal: 'Entender a pegada digital, controlar o que compartilha, ajustar configurações, cookies e permissões de apps, e conhecer a LGPD e os direitos do titular em visão geral.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Pegada digital',
            'PEGADA DIGITAL é o rastro de informações que você deixa ao usar a internet: o que publica, curte, comenta, compra, busca, onde está (localização), e o que outras pessoas publicam sobre você. Parte você cria de propósito (um post), parte é coletada sem você perceber (cookies, histórico de navegação, localização de apps). Pegadas têm memória longa: o que é publicado pode ser copiado e reaparecer anos depois. Pense como um caderno de visitas que nunca se apaga por completo. Cuidar da pegada é cuidar da privacidade e da segurança, pois golpistas usam informações públicas para parecer convincentes.'
          ),
          sl(
            'Por que a privacidade é segurança',
            'Dados que parecem inofensivos, somados, viram arma. Nome completo, cidade, escola dos filhos, data de aniversário, local de trabalho, rotina de viagens e fotos de documentos ou boletos permitem golpes de engenharia social personalizados, clonagem de contas, perguntas de recuperação de senha respondidas pelo golpista e até riscos físicos (anunciar que a casa ficará vazia). Regra prática: antes de publicar, pergunte-se quem pode ver, se você se sentiria confortável se fosse visto por qualquer pessoa e se a informação ajuda alguém a se passar por você.'
          ),
          sl(
            'Configurações de privacidade',
            'As redes sociais e serviços têm opções de PRIVACIDADE que quase sempre começam permissivas. Revise: quem vê suas publicações (amigos, público), quem pode te marcar em fotos, quem vê sua lista de contatos, se o perfil aparece em buscas e se seu número de telefone é visível. Nos aplicativos de mensagem, restrinja quem vê sua foto, recado e "visto por último", e quem pode te adicionar a grupos. Faça essa revisão de tempos em tempos, pois as plataformas mudam as opções. Apague contas que não usa mais: menos contas, menos superfície de ataque e menos dados soltos.'
          ),
          sl(
            'Cookies e permissões de apps',
            'COOKIES são pequenos arquivos que os sites guardam no seu navegador. Alguns são necessários (manter você logado); outros servem para rastrear seu comportamento e personalizar anúncios. Ao ver o aviso de cookies, prefira rejeitar os não essenciais. PERMISSÕES de apps controlam o que o aplicativo pode acessar: câmera, microfone, contatos, localização, fotos. Princípio: dê só o que o app precisa para funcionar. Uma lanterna que pede acesso aos contatos é suspeita. Revise as permissões nas configurações do celular e escolha "somente enquanto uso o app" para localização, quando possível.'
          ),
          sl(
            'LGPD em visão geral',
            'A LGPD (Lei Geral de Proteção de Dados, Lei 13.709/2018) é a lei brasileira que regula como empresas e órgãos coletam, usam e guardam DADOS PESSOAIS (informações que identificam uma pessoa, como nome, CPF, e-mail, localização). Em linhas gerais: o tratamento de dados precisa ter uma finalidade clara e uma base legal (por exemplo, o consentimento da pessoa, mas não só); só se deve coletar o necessário; e quem trata os dados precisa protegê-los. Este é um resumo geral e não substitui orientação jurídica. A autoridade responsável por fiscalizar é a ANPD (Autoridade Nacional de Proteção de Dados).'
          ),
          sl(
            'Direitos do titular',
            'O TITULAR é você, a pessoa a quem os dados se referem. Em visão geral, a LGPD dá direitos como: saber se uma empresa trata seus dados e acessar esses dados; corrigir dados incompletos ou errados; pedir a eliminação de dados tratados com base em consentimento; pedir informações sobre com quem eles são compartilhados; e revogar o consentimento dado. Para exercer, procure o canal de privacidade da empresa (muitas têm um encarregado de dados, o DPO) e, se não for atendido, a ANPD ou órgãos de defesa do consumidor podem ser opções. Em caso de dúvida legal, procure orientação jurídica.'
          ),
          sl(
            'Hábitos para o dia a dia',
            'Compartilhe o mínimo; use e-mails e senhas diferentes para serviços diferentes; desconfie de pedidos de CPF, RG ou foto de documento sem necessidade clara; evite postar fotos de documentos, cartões e boletos, mesmo com parte borrada; revise permissões e privacidade a cada tanto; busque seu próprio nome na internet para ver o que aparece; e ao cadastrar em promoções, pergunte-se se vale a pena entregar seus dados. Erro comum: achar que "não tenho nada a esconder" encerra o assunto. Privacidade não é esconder coisas erradas; é controlar quem sabe o quê sobre você.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que é a pegada digital?', 'b', [
          'Uma lista dos aplicativos instalados no celular que o fabricante mantém atualizada',
          'O rastro de informações que você deixa ao usar a internet, de propósito ou não',
          'O arquivo onde o navegador guarda todas as suas senhas em formato criptografado',
          'O histórico de vezes em que você trocou de aparelho celular ao longo do tempo'
        ], 'A pegada digital reúne tudo o que você publica, busca, compra e o que é coletado sobre você. As outras opções descrevem coisas diferentes.'),
        mcq('q2', 'Por que postar rotina, escola dos filhos e fotos de documentos pode ser um risco de segurança?', 'c', [
          'Porque as redes sociais cobram uma taxa para guardar fotos de documentos',
          'Porque essas publicações deixam o celular mais lento com o tempo',
          'Porque golpistas combinam esses dados para golpes convincentes e para se passar por você',
          'Porque a LGPD proíbe qualquer pessoa de publicar informações sobre a própria família'
        ], 'Dados soltos, somados, permitem engenharia social personalizada e usurpação de identidade. A LGPD não proíbe publicar sobre si mesmo.'),
        mcq('q3', 'Um aplicativo de lanterna pede acesso aos seus contatos e à sua localização. Qual é a melhor conduta?', 'a', [
          'Negar as permissões, pois não são necessárias para a função do aplicativo',
          'Permitir, pois todo app precisa de todas as permissões para funcionar corretamente',
          'Permitir a localização, porque contatos são menos sensíveis que ela',
          'Permitir e desinstalar o aplicativo depois de uma semana de uso'
        ], 'Permissão deve ser proporcional à função: lanterna não precisa de contatos nem de localização. Dar acesso e desinstalar depois não apaga o que já foi coletado.'),
        fill('q4', 'Complete com a sigla da lei brasileira que protege os dados pessoais (Lei 13.709/2018).', 'Lei Geral de Protecao de Dados = ___', ['lgpd'], 'A LGPD regula como dados pessoais são coletados, usados e guardados. Este é um resumo geral, e não substitui orientação jurídica.'),
        mcq('q5', 'Quem é o titular de dados na LGPD?', 'd', [
          'A empresa que guarda os dados em seus servidores',
          'O governo, que é dono dos dados pessoais dos cidadãos',
          'O programador que escreveu o sistema onde os dados foram guardados',
          'A pessoa a quem os dados se referem'
        ], 'Titular é a pessoa natural dona dos dados. A empresa é quem trata os dados; o programador apenas construiu o sistema.'),
        mcq('q6', 'Qual destes é um direito do titular, em visão geral?', 'b', [
          'Obrigar a empresa a pagar uma taxa pelos dados que tenha coletado',
          'Saber se a empresa trata seus dados, acessá-los e pedir correção de dados errados',
          'Ter acesso aos dados de qualquer outra pessoa que seja cliente da mesma empresa',
          'Impedir que o governo e a justiça tenham qualquer acesso a dados pessoais'
        ], 'Acesso, confirmação do tratamento e correção estão entre os direitos do titular. Os demais itens não são previstos dessa forma. Para casos reais, vale orientação jurídica.'),
        mcq('q7', 'Ao ver o aviso de cookies de um site, qual escolha protege mais a sua privacidade?', 'c', [
          'Aceitar o pacote completo, pois assim o site funciona melhor e os anúncios ficam menores',
          'Fechar o navegador e voltar depois, pois o aviso então some e o site para de coletar dados',
          'Aceitar apenas os necessários e recusar os de rastreamento e anúncios',
          'Desativar a conexão com a internet antes de clicar para impedir qualquer coleta'
        ], 'Cookies não essenciais costumam servir para rastreio e publicidade; rejeitá-los reduz a coleta. As outras ações não têm esse efeito.'),
        fill('q8', 'Complete com o nome do que o aplicativo pede para acessar a câmera, o microfone ou os contatos do seu celular: ___ de apps.', 'configuracoes de ___ de apps', ['permissões', 'permissoes', 'permissão', 'permissao'], 'As permissões definem o que o app pode acessar; dê só o necessário e revise de tempos em tempos.')
      ]
    },
    {
      id: 'csb-40-osint-e-informacoes-publicas',
      title: 'OSINT: o que as informações públicas revelam sobre você',
      goal: 'Entender o que é OSINT, como informações públicas isoladas podem ser combinadas por golpistas, como reduzir a exposição e quais limites éticos e legais se aplicam.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é OSINT',
            'OSINT vem do inglês Open Source Intelligence, ou inteligência de fontes abertas: é o uso de informações que qualquer pessoa pode acessar legalmente, como sites, redes sociais, notícias, registros públicos e fotos publicadas, para entender algo ou alguém. Aberto não quer dizer hackeado: não envolve invadir nada. Pense em juntar peças de um quebra-cabeça que já estavam sobre a mesa. A técnica em si é neutra e tem usos legítimos, mas nas mãos erradas ajuda a preparar golpes.'
          ),
          sl(
            'Peças soltas, retrato completo',
            'O perigo está na combinação. Um perfil mostra seu primeiro nome e a empresa onde trabalha; outro, uma foto na frente de casa; um terceiro, o aniversário do filho, o nome do pet e a escola. Cada dado sozinho parece inofensivo, mas juntos permitem a um golpista montar uma mensagem muito convincente ("Oi, aqui é do RH da empresa X, sobre o seu benefício...") ou adivinhar respostas de perguntas secretas. Esse é o combustível da engenharia social direcionada, quando o golpe é feito sob medida para uma pessoa (veja a lição de phishing). Aqui ficamos no conceito: esta lição não ensina a investigar pessoas.'
          ),
          sl(
            'Metadados de fotos',
            'Metadados são dados escondidos dentro de um arquivo que descrevem o próprio arquivo. Uma foto tirada com o celular pode guardar data e hora, modelo do aparelho e, se a localização estava ligada, as coordenadas de onde foi tirada (o padrão que guarda isso se chama EXIF). Se você publica a foto original, em alguns lugares esses dados vão junto, e alguém poderia descobrir onde você mora ou onde está. Muitas redes sociais removem boa parte dos metadados ao publicar, mas e-mails, nuvens e aplicativos de troca de arquivos nem sempre fazem isso. Defesa: desligue a localização da câmera quando não precisar e use a opção do celular que remove a localização ao compartilhar.'
          ),
          sl(
            'Como reduzir a sua exposição',
            'Revise a privacidade das redes sociais (perfil privado, quem vê suas publicações e lista de amigos), evite publicar documentos, crachás, boletos, cartões e passagens (o código de barras e os números são lidos), não revele rotina e localização em tempo real (publique a viagem depois de voltar), use e-mails diferentes para finalidades diferentes, procure seu nome em buscadores de tempos em tempos e peça a remoção de conteúdos indevidos aos próprios sites. Lembre que uma coisa publicada pode ser copiada, então a melhor proteção é pensar antes de postar. Veja também a lição de privacidade e pegada digital.'
          ),
          sl(
            'Privacidade de terceiros e LGPD',
            'Seus cuidados valem para os outros também. Fotos de amigos, filhos, colegas e fachadas expõem pessoas que não escolheram aparecer. A LGPD (Lei 13.709/2018) protege dados pessoais, ou seja, informações que identificam ou podem identificar uma pessoa, e estabelece regras para quem os coleta e usa. Mesmo quando o dado está público, juntar e usar informações de alguém para perseguir, assediar, constranger ou aplicar golpe pode ser ilegal e fere a ética. Em dúvida, pergunte à pessoa antes de publicar. Esta é uma visão geral e não substitui orientação jurídica.'
          ),
          sl(
            'Usos legítimos e limites',
            'OSINT tem usos legítimos e importantes: jornalismo investigativo e checagem de fatos (confirmar se uma imagem é real), equipes de segurança que avaliam o que uma empresa expõe publicamente antes de um criminoso fazê-lo, análise de reputação e verificação de parceiros em avaliações de negócios (due diligence) e busca por pessoas desaparecidas por instituições apropriadas. O que separa o uso legítimo do abusivo é finalidade, autorização e proporcionalidade: ter um motivo legítimo, usar só o necessário e respeitar a lei. Nunca use essas técnicas para vigiar, assediar ou perseguir alguém, nem para preparar fraude.'
          )
        ]
      },
      questions: [
        mcq(
          'q1',
          'O que significa OSINT?',
          'a',
          [
            'Uso de informações de fontes abertas, acessíveis legalmente por qualquer pessoa, para obter conhecimento.',
            'Técnica de invadir contas para obter informações privadas de forma silenciosa.',
            'Um software de segurança instalado no celular que impede o acesso de estranhos às suas redes sociais e bloqueia perfis suspeitos.',
            'Tipo de vírus que coleta dados pessoais armazenados em arquivos do computador.'
          ],
          'OSINT significa inteligência de fontes abertas, ou seja, informação que pode ser acessada legalmente. Não envolve invadir contas, não é programa de proteção e não é um vírus.'
        ),
        mcq(
          'q2',
          'Um golpista reúne o seu primeiro nome, a empresa onde você trabalha e o nome do seu pet, todos publicados em redes sociais. Qual o risco principal dessa combinação?',
          'c',
          [
            'Baixo, porque cada dado, isoladamente, já é público e por isso não tem valor.',
            'Seu perfil será apagado automaticamente pela rede social por excesso de informação.',
            'Ele consegue criar uma mensagem sob medida e convincente ou chutar respostas de perguntas de recuperação.',
            'O golpista passa a controlar a sua conta automaticamente só por ter esses dados reunidos, sem precisar de qualquer outra informação ou tentativa.'
          ],
          'Dados soltos combinados viram golpes personalizados e ajudam a adivinhar respostas secretas. O fato de serem públicos não os torna inofensivos, as redes não apagam perfis por isso e os dados sozinhos não dão controle da conta.'
        ),
        mcq(
          'q3',
          'O que são os metadados de uma foto tirada pelo celular?',
          'b',
          [
            'A parte visível da imagem, ou seja, o conjunto de pessoas, objetos e cenário que aparecem quando a foto é aberta na tela.',
            'Dados escondidos no arquivo, como data, aparelho e, às vezes, a localização onde foi tirada.',
            'O filtro de cor aplicado antes de publicar a foto.',
            'Uma cópia de segurança da foto guardada automaticamente na nuvem.'
          ],
          'Metadados descrevem o arquivo e podem incluir local e horário. Eles não são a imagem visível, não são filtros e não são cópias de segurança.'
        ),
        fill(
          'q4',
          'Complete: o nome dos dados escondidos em um arquivo que descrevem o próprio arquivo, como a localização de uma foto.',
          'Uma foto pode revelar onde foi tirada pelos ___ guardados dentro dela.',
          ['metadados', 'metadado'],
          'Os metadados guardam informações sobre o arquivo, como data e local, e podem expor onde você esteve se a foto for compartilhada sem limpeza.'
        ),
        mcq(
          'q5',
          'Qual atitude reduz mais a sua exposição ao compartilhar uma viagem?',
          'd',
          [
            'Publicar fotos do cartão de embarque para provar que você está viajando.',
            'Marcar em tempo real o hotel e o horário em que você sai de casa.',
            'Deixar o perfil público para que mais pessoas vejam as férias.',
            'Publicar as fotos só depois de voltar e com o perfil restrito a pessoas conhecidas.'
          ],
          'Postar depois e para um público restrito evita que estranhos saibam que sua casa está vazia. Cartões de embarque trazem códigos legíveis, e localização em tempo real e perfil aberto aumentam a exposição.'
        ),
        mcq(
          'q6',
          'Qual dos usos de OSINT abaixo é legítimo e ético?',
          'd',
          [
            'Montar um dossiê sobre um ex-parceiro para saber onde ele está o tempo todo.',
            'Reunir dados de uma pessoa para criar uma mensagem de golpe mais convincente.',
            'Descobrir o endereço de um desafeto para ir até lá e confrontá-lo.',
            'Um jornalista checar se uma foto que circula em redes sociais é de fato do evento citado.'
          ],
          'Verificar a veracidade de uma imagem é um uso legítimo, com finalidade clara e sem violar a privacidade de alguém. Perseguir ex-parceiro, preparar golpes e localizar desafetos são abusos e podem configurar crime.'
        ),
        mcq(
          'q7',
          'Seu amigo quer publicar uma foto de uma festa em que aparecem vários colegas e crianças, sem avisar ninguém. O que a lição recomenda?',
          'a',
          [
            'Perguntar às pessoas antes, porque elas têm direito à própria privacidade e à proteção dos seus dados.',
            'Publicar sem avisar ninguém, já que a foto foi tirada por ele e as outras pessoas não têm direito algum de opinar sobre ela depois de postada.',
            'Publicar e marcar as pessoas para que fiquem sabendo e possam reclamar depois.',
            'Publicar com uma legenda explicando que quem não gostou deve se manifestar.'
          ],
          'Pedir a permissão antes respeita as pessoas retratadas, em especial crianças, e está de acordo com a lógica de proteção de dados da LGPD. As outras opções transferem às pessoas o ônus de reclamar depois que o conteúdo já se espalhou.'
        ),
        fill(
          'q8',
          'Complete: a sigla da lei brasileira que protege dados pessoais e cria regras para quem os coleta e usa.',
          'No Brasil, a ___ (Lei 13.709/2018) protege os dados pessoais.',
          ['LGPD', 'Lei Geral de Proteção de Dados', 'Lei Geral de Protecao de Dados'],
          'A LGPD, Lei Geral de Proteção de Dados Pessoais, estabelece regras para o tratamento de dados pessoais. Esta é uma visão geral e não substitui orientação jurídica.'
        )
      ]
    },
    {
      id: 'csb-16-golpes-em-redes-sociais-e-deepfakes',
      title: 'Golpes em redes sociais, WhatsApp e deepfakes',
      goal: 'Reconhecer perfis falsos, clonagem de WhatsApp, o golpe do falso parente, sequestro de conta e deepfakes, e saber verificar e reagir.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Redes sociais: confiança como porta de entrada',
            'Nas redes sociais e no WhatsApp a gente baixa a guarda porque está falando com amigos e família. Golpistas sabem disso e se aproveitam: em vez de enganar um desconhecido, enganam você usando a confiança de alguém que você conhece. Os golpes abaixo têm um padrão em comum: pedem dinheiro, códigos ou ação rápida, usando uma história emocional. Aprender o padrão vale mais que decorar cada golpe, pois eles mudam o enredo e mantêm o método.'
          ),
          sl(
            'Perfis falsos',
            'PERFIL FALSO é uma conta criada para se passar por outra pessoa ou empresa (ou uma pessoa inexistente), usando fotos copiadas. Serve para pedir dinheiro, aplicar golpes românticos, divulgar falsos investimentos ou falsas vagas de emprego. Sinais: conta recém-criada, poucas publicações, fotos genéricas ou perfeitas demais, pedido de amizade seguido de conversa que logo vira dinheiro, promessas de ganhos fáceis e pedidos para continuar a conversa em outro aplicativo. Defesas: confirmar pessoalmente ou por ligação, olhar a idade do perfil, desconfiar de amizade repentina e denunciar o perfil na plataforma.'
          ),
          sl(
            'Clonagem de WhatsApp e falso parente',
            'No golpe da CLONAGEM de WhatsApp, o golpista tenta fazer você informar o código de 6 dígitos de verificação que o aplicativo envia por SMS (às vezes com a desculpa "mandei por engano"). Com o código, ele ativa o seu número no aparelho dele e passa a falar como você. No golpe do FALSO PARENTE (ou falso filho), alguém manda mensagem de um número novo dizendo "troquei de número" e, depois de uma conversa, pede um Pix urgente porque está sem acesso ao banco. A defesa dos dois é a mesma: NUNCA passe o código de verificação a ninguém; para o falso parente, ligue para o número antigo ou faça uma pergunta que só a pessoa saberia, antes de qualquer pagamento.',
            'Regra: codigo de verificacao e so SEU.\nNumero novo + pedido de dinheiro = confirme por ligacao no numero antigo.'
          ),
          sl(
            'Sequestro de conta e como se proteger',
            'SEQUESTRO DE CONTA é quando alguém assume o controle da sua conta (Instagram, WhatsApp, e-mail) trocando senha e e-mail de recuperação, e a usa para pedir dinheiro aos seus contatos. Chega por phishing, senha vazada ou reaproveitada ou engano do código. Prevenção: senha forte e única, verificação em duas etapas, nunca informar códigos, desconfiar de links como "veja quem te viu" e atenção a "suporte" que pede dados. No WhatsApp, ative a verificação em duas etapas, que cria um PIN próprio de proteção; sem o PIN, o golpista não consegue ativar seu número. Se perder a conta: use as opções de recuperação do próprio app, avise os contatos por outro meio e registre ocorrência se houve prejuízo.'
          ),
          sl(
            'Deepfakes',
            'DEEPFAKE é um vídeo, áudio ou imagem criados ou alterados por inteligência artificial para parecer que uma pessoa disse ou fez algo que nunca disse ou fez. Golpistas usam voz clonada de um parente pedindo ajuda, vídeos de famosos recomendando falsos investimentos e até vídeo chamada com rosto trocado. Não existe sinal infalível, mas ajudam: movimentos de boca ou piscar estranhos, áudio sem emoção natural, contexto absurdo (alguém famoso prometendo dinheiro fácil) e urgência. A verificação mais confiável não é técnica, é de processo: confirmar por outro canal e desconfiar de pedido de dinheiro, mesmo com voz ou rosto conhecido.'
          ),
          sl(
            'Como verificar',
            'Combine uma PALAVRA-CHAVE FAMILIAR (uma senha falada que só a família conhece) para situações de emergência. Ligue de volta para o número conhecido, pergunte algo que só a pessoa saberia, peça uma videochamada ao vivo com algum gesto específico, pesquise se a notícia ou a oferta aparece em fontes confiáveis e desconfie de qualquer investimento que garante lucro alto e rápido. Nenhum parente, banco ou empresa séria exige pagamento no mesmo instante, sem conversa por outro canal. Se algo é urgente e envolve dinheiro, a urgência é justamente o motivo para checar.'
          ),
          sl(
            'Se você caiu ou foi clonado',
            'Aja logo: avise seus contatos por outro meio que sua conta foi tomada para que não paguem nada; recupere a conta pelo app; troque senhas e ligue o MFA; se enviou dinheiro, ligue imediatamente para o banco e peça contestação; guarde prints e registre boletim de ocorrência (em muitos locais pode ser feito pela internet); e denuncie o perfil ou o número à plataforma. Não sinta vergonha: golpes são feitos por profissionais para enganar qualquer pessoa. Quanto mais cedo agir, maior a chance de reverter o dano.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Uma mensagem de um número desconhecido diz: "Oi, mãe, troquei de número, salva esse. Preciso de um Pix urgente". O que fazer?', 'd', [
          'Fazer o Pix, pois uma mãe não deixaria o filho sem ajuda em uma emergência',
          'Responder pedindo mais detalhes e fazer o Pix depois, se a história parecer boa',
          'Fazer metade do valor e pedir o restante do dinheiro de volta depois',
          'Ligar para o número antigo do filho antes de qualquer pagamento'
        ], 'Número novo mais pedido de dinheiro é o padrão do falso parente. Confirmar por ligação ao número conhecido quebra o golpe; pagar parte do valor ainda dá prejuízo.'),
        mcq('q2', 'Por que o código de 6 dígitos do WhatsApp nunca deve ser informado a ninguém?', 'a', [
          'Porque com ele o golpista ativa o seu número no aparelho dele e se passa por você',
          'Porque o código serve para confirmar a compra de pacotes de dados pela operadora',
          'Porque o WhatsApp bloqueia a conta definitivamente quando o código é digitado errado',
          'Porque o código é uma senha de banco criada automaticamente pelo aplicativo'
        ], 'O código ativa o número em outro aparelho e abre caminho para clonagem. Não tem relação com banco nem com a operadora.'),
        mcq('q3', 'Qual medida do próprio WhatsApp ajuda a impedir que o golpista ative seu número, mesmo que consiga o código por SMS?', 'c', [
          'Aumentar o brilho do aplicativo para ver quem está escrevendo no momento',
          'Mudar o nome do seu perfil e a foto a cada semana para confundir o golpista',
          'Ativar a verificação em duas etapas, que cria um PIN próprio de proteção',
          'Desativar o recebimento de SMS em todas as contas do aparelho'
        ], 'O PIN da verificação em duas etapas é pedido além do código; sem ele, a ativação não se completa. As outras ações não impedem a clonagem.'),
        fill('q4', 'Complete com o nome do conteúdo (vídeo, áudio ou imagem) criado ou alterado por inteligência artificial para imitar alguém.', '___ = midia falsa criada por IA', ['deepfake', 'deep fake'], 'Deepfake imita rosto ou voz com IA; a defesa mais confiável é confirmar por outro canal.'),
        mcq('q5', 'Você recebe um áudio com a voz de um parente pedindo dinheiro com urgência. Qual é a atitude mais adequada?', 'b', [
          'Fazer o Pix, pois a voz é inconfundível e o pedido parece verdadeiro',
          'Ligar de volta para o número conhecido e usar a palavra-chave combinada',
          'Pedir que a pessoa mande outro áudio e pagar se a voz parecer igual',
          'Ignorar a mensagem sem avisar ninguém, mesmo se o parente realmente estiver em apuros'
        ], 'Voz pode ser clonada com IA; confirmar por outro canal resolve com mais segurança. Outro áudio pode ser tão falso quanto o primeiro, e ignorar sem checar pode deixar alguém sem ajuda de verdade.'),
        mcq('q6', 'Qual sinal sugere um perfil falso em uma rede social?', 'c', [
          'Conta com muitas fotos de família e vários anos de interações com conhecidos',
          'Perfil com poucos seguidores, mas que publica fotos pessoais de forma regular',
          'Conta recém-criada que logo oferece ganho fácil e pede para conversar em outro app',
          'Perfil antigo que participa de grupos da cidade e comenta publicações dos vizinhos'
        ], 'Conta nova, pouca história e promessa de dinheiro fácil com mudança de canal são sinais clássicos. Histórico longo e interações normais apontam o contrário.'),
        mcq('q7', 'Uma pessoa percebe que sua conta de rede social foi tomada e está pedindo dinheiro aos contatos. Qual é a primeira atitude?', 'a', [
          'Avisar os contatos por outro meio para que ninguém pague, e tentar recuperar a conta',
          'Esperar alguns dias, porque normalmente o golpista cansa e devolve a conta',
          'Criar uma conta nova e abandonar a antiga sem avisar ninguém sobre o problema',
          'Trocar a foto de perfil e pedir aos amigos que parem de seguir a conta tomada'
        ], 'Avisar por outro meio evita novas vítimas e recuperar a conta limita o dano. Esperar ou abandonar a conta deixa o golpista agindo.'),
        fill('q8', 'Complete com o nome do segredo falado que só a família conhece, combinado antes, para confirmar uma emergência: palavra-___.', 'palavra-___ da familia', ['chave'], 'A palavra-chave familiar ajuda a verificar se quem pede ajuda é mesmo quem diz ser, mesmo diante de voz ou rosto clonados.')
      ]
    },
    {
      id: 'csb-41-ia-e-seguranca-pessoal',
      title: 'IA e segurança pessoal: usar com cuidado e reconhecer golpes',
      goal: 'Usar assistentes de IA sem expor dados sensíveis, reconhecer golpes que usam IA (voz clonada e mensagens convincentes), saber como verificar e entender os limites de confiança nas respostas.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é um assistente de IA e o que acontece com o que você digita',
            'Um assistente de inteligência artificial (IA) é um programa que conversa e produz textos, imagens ou respostas a partir do que você escreve. O que você digita viaja pela internet até a empresa que opera o serviço, e dependendo das regras e das configurações pode ser armazenado, revisado por pessoas ou usado para melhorar o sistema. Cada serviço tem a sua política, e ela muda com o tempo, então não presuma. A regra prática: trate a conversa como algo que pode não ficar só entre você e a máquina.'
          ),
          sl(
            'O que NÃO colar em um assistente de IA',
            'Não envie: senhas, códigos de verificação, chaves e tokens de acesso, números de cartão, CPF e dados de documentos, informações de saúde, contratos e conteúdos confidenciais do trabalho, e dados de outras pessoas (fotos de documentos de clientes, conversas privadas de terceiros). Segredo colado pode ser armazenado e reaparecer em lugares inesperados. Dados de terceiros pedem ainda mais cuidado: a LGPD (Lei 13.709/2018) protege dados pessoais, e compartilhá-los sem base adequada pode ser um problema para você e para a sua empresa. Alternativa segura: troque nomes e números por exemplos fictícios (por exemplo, Cliente A, 000.000.000-00) e use a ferramenta aprovada pela sua empresa. Visão geral, sem substituir orientação jurídica.',
            'Em vez de:  Maria da Silva, CPF 000.000.000-00, deve R$ valor\nUse:        Cliente A, CPF <ficticio>, deve <valor>'
          ),
          sl(
            'Golpes que usam IA',
            'A IA deixou os golpes mais convincentes, mas o mecanismo continua o mesmo: pressa, emoção e pedido de dinheiro ou de dados. Voz clonada: com poucos segundos de áudio publicado, um golpista gera uma voz parecida com a de um parente e liga dizendo estar em apuros. Mensagens convincentes: textos sem erros de português, adaptados ao seu perfil, em e-mails, WhatsApp e redes sociais. Vídeo e imagem falsos (deepfakes): um suposto conhecido ou famoso pedindo dinheiro ou promovendo um investimento. Perfis falsos de atendimento que parecem profissionais. Antes, erros de escrita denunciavam muitos golpes; agora essa pista é menos confiável.'
          ),
          sl(
            'Como verificar',
            'Combine uma senha familiar: uma palavra secreta que só a família sabe e que você pede em ligações de emergência. Desligue e ligue de volta para o número que você já tem, ou fale por outro canal. Faça uma pergunta que só a pessoa de verdade saberia. Desconfie de urgência, segredo ("não conte a ninguém") e pedido de transferência, Pix, cartão-presente ou código. Para imagens e vídeos, procure sinais estranhos (mãos, dentes, piscadas, fundo), pesquise a imagem e confira em fontes oficiais do suposto autor. Se não der para verificar, não pague e não envie dados. Veja a lição sobre golpes em redes sociais e deepfakes.'
          ),
          sl(
            'Os limites de confiança nas respostas de IA',
            'Assistentes de IA podem errar com muita segurança: inventam fatos, números, nomes de leis, endereços de sites e até fontes que não existem (isso se chama alucinação). Eles também podem estar desatualizados. Por isso, não use a resposta como única fonte em temas importantes como saúde, dinheiro, lei e segurança. Confira em fontes oficiais, desconfie de links e comandos que a IA sugere e não os execute sem entender o que fazem. Use a IA como um rascunho útil ou um colega que ajuda a pensar, não como autoridade final.'
          ),
          sl(
            'Hábitos práticos e resumo',
            'Resumo de bons hábitos: leia a política de privacidade e as configurações de dados do serviço que usa; desative o uso das suas conversas para treino quando existir essa opção; use contas separadas para trabalho e pessoal; nunca cole segredos ou dados de terceiros; combine uma palavra de segurança com a família; verifique pedidos urgentes por outro canal; e confirme informações importantes em fontes oficiais. Se você colou algo sensível por engano, troque a senha ou o segredo imediatamente, avise o responsável (por exemplo, a equipe de segurança da empresa) e apague a conversa se possível.'
          )
        ]
      },
      questions: [
        mcq(
          'q1',
          'Qual destes conteúdos é aceitável colar em um assistente de IA público?',
          'd',
          [
            'A senha do e-mail, para que o assistente avalie se ela é forte.',
            'A foto do documento de um cliente, para o assistente extrair os dados.',
            'O código de verificação que acabou de chegar no celular, para conferir se está certo.',
            'Um texto genérico seu, sem dados pessoais, para revisar a gramática.'
          ],
          'Textos sem dados pessoais ou segredos oferecem pouco risco. Senhas, documentos de clientes e códigos de verificação são sensíveis e não devem ser enviados a serviços cujo tratamento você não controla.'
        ),
        mcq(
          'q2',
          'Você precisa pedir ajuda à IA para escrever uma cobrança, mas o texto original traz nome, CPF e valor devido de um cliente real. Qual a melhor atitude?',
          'a',
          [
            'Trocar os dados reais por exemplos fictícios, como Cliente A, antes de colar.',
            'Colar tudo como está, pois a IA só consegue ajudar a escrever uma cobrança boa se tiver acesso ao contexto real do cliente e do valor.',
            'Remover só o nome e deixar o CPF, que é um número e não identifica ninguém.',
            'Colar e pedir à IA que esqueça os dados logo depois da resposta.'
          ],
          'Substituir por dados fictícios mantém a utilidade do texto sem expor a pessoa. O CPF identifica uma pessoa e é dado pessoal, e pedir que a IA esqueça não garante que o serviço deixou de armazenar o que foi enviado.'
        ),
        mcq(
          'q3',
          'Você recebe uma ligação com a voz do seu filho, chorando, pedindo dinheiro urgente por Pix. Qual a melhor reação?',
          'c',
          [
            'Fazer o Pix imediatamente e só depois tentar entender o que aconteceu.',
            'Perguntar se ele está bem, e, se a voz parecer igual, transferir.',
            'Desligar e ligar de volta para o número que você já tem, ou perguntar a palavra de segurança combinada.',
            'Pedir que a pessoa mande uma foto, que serve como prova suficiente de que é mesmo o seu filho e que a situação é real, e então transferir.'
          ],
          'Voz pode ser clonada, então a verificação deve usar outro canal ou um segredo combinado. A semelhança da voz não prova nada, e fotos também podem ser falsificadas.'
        ),
        fill(
          'q4',
          'Complete: o nome do problema em que a IA inventa fatos, fontes ou números com muita segurança.',
          'Quando a IA inventa informações com confiança, chamamos de ___.',
          ['alucinação', 'alucinacao', 'alucinações', 'alucinacoes'],
          'Alucinação é quando o modelo produz informação falsa de forma convincente. Por isso respostas importantes devem ser conferidas em fontes oficiais.'
        ),
        mcq(
          'q5',
          'Por que a ausência de erros de português em uma mensagem não prova que ela é confiável?',
          'b',
          [
            'Porque golpistas escrevem de propósito com erros, e mensagens corretas são legítimas por natureza.',
            'Porque a IA permite produzir textos corretos e personalizados, então a escrita deixou de ser uma pista segura.',
            'Porque mensagens bem escritas costumam ser spam automático, e por isso o celular as bloqueia antes de chegarem a você.',
            'Porque o português correto indica que o autor tem formação em segurança.'
          ],
          'Ferramentas de IA geram textos bem escritos, o que enfraquece a pista dos erros. Nem sempre os erros são de propósito, mensagens corretas não são necessariamente spam e a escrita não revela formação do autor.'
        ),
        mcq(
          'q6',
          'Qual prática ajuda a verificar uma suposta emergência de um parente por ligação?',
          'b',
          [
            'Aceitar a história se o interlocutor souber o seu nome e o do parente.',
            'Combinar com a família uma palavra de segurança e pedi-la em pedidos urgentes.',
            'Confiar na ligação quando o número aparece como conhecido na tela.',
            'Pedir ao interlocutor que jure que não é golpe antes de ajudar.'
          ],
          'Uma palavra combinada previamente é difícil de ser adivinhada ou clonada. Nome e parentesco podem ser descobertos em redes sociais, o número pode ser falsificado, e uma promessa verbal não prova nada.'
        ),
        mcq(
          'q7',
          'A IA sugere um comando de computador e um link para baixar uma ferramenta. Qual o cuidado mais adequado?',
          'c',
          [
            'Executar o comando e baixar a ferramenta logo, pois a IA praticamente não erra quando a resposta é longa, bem organizada e detalhada.',
            'Executar o comando, mas depois de fechar os outros programas.',
            'Entender o que o comando faz e conferir o link na fonte oficial antes de usar, porque a IA pode errar ou inventar.',
            'Ignorar as sugestões de IA, pois ela é inútil para estudar segurança.'
          ],
          'Respostas de IA podem estar erradas ou conter links inventados, então é preciso entender e confirmar em fonte oficial. Confiar às cegas é arriscado, fechar programas não resolve o risco e descartar tudo é exagero, já que a IA pode ajudar como apoio.'
        ),
        fill(
          'q8',
          'Complete: o tipo de vídeo ou áudio falso criado por IA que imita pessoas reais.',
          'Um vídeo falso que imita uma pessoa real usando IA é chamado de ___.',
          ['deepfake', 'deep fake'],
          'Deepfake é mídia sintética que imita o rosto ou a voz de alguém. Verificar por outro canal e em fontes oficiais é a melhor defesa.'
        )
      ]
    },
    {
      id: 'csb-17-fraudes-financeiras-pix-cartoes',
      title: 'Fraudes financeiras: Pix, cartões e boletos',
      goal: 'Reconhecer golpes com Pix, cartão e boleto, entender a engenharia social bancária, os limites do Pix e o MED em visão geral, e saber o que fazer ao cair.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que o dinheiro atrai golpistas',
            'Fraude financeira é qualquer golpe cujo objetivo final é tirar dinheiro de você: pelo Pix, cartão, boleto, empréstimo no seu nome ou investimentos falsos. Como as transferências são rápidas, o tempo é a arma do golpista, e por isso quase todo golpe vem com urgência. Os bancos investem muito em segurança, então o elo mais fraco costuma ser a pessoa, e o golpista prefere convencer você a fazer a transferência com as suas próprias mãos. Lembre: nenhuma instituição séria pede senha, código de verificação ou transferência para "conta segura".'
          ),
          sl(
            'Golpes com Pix',
            'O Pix é imediato: quando enviado, é difícil recuperar. Golpes comuns: o falso parente ou amigo que pede Pix urgente; o falso vendedor que pede pagamento antecipado e some; o falso comprador que manda um comprovante falso de pagamento (confira sempre no extrato do banco, não no print); o "Pix errado" em que a pessoa diz ter depositado por engano e pede devolução em outra conta; e o falso atendente do banco que pede para você "testar" ou transferir para proteger o dinheiro. Boas práticas: confira nome e CPF/CNPJ mostrados antes de confirmar, desconfie de pedidos de urgência e de chave Pix vinda por mensagem de desconhecido.'
          ),
          sl(
            'Golpes com cartão e boleto',
            'Cartão: sites falsos que coletam número, validade e código de segurança; maquininhas adulteradas ou "trocadas" por golpistas na entrega do cartão, quando alguém pede para você digitar a senha; clonagem e compras online com dados vazados. Defesa: use cartão virtual ou temporário para compras online, ative avisos de compra no app do banco, nunca entregue o cartão a terceiros nem digite a senha na frente de estranhos que "vieram buscar". Boleto: o golpista adultera o código de barras ou envia boleto falso, e o dinheiro vai para a conta dele. Confira sempre o beneficiário (quem recebe) no app do banco antes de confirmar e desconfie de desconto por pagamento imediato.'
          ),
          sl(
            'Engenharia social bancária',
            'É o golpe em que alguém liga ou manda mensagem dizendo ser do banco, com dados que o golpista já tem de vazamentos (seu nome, parte do CPF, últimas compras), para parecer real. As histórias: "movimentação suspeita no seu cartão", "seu app será bloqueado", "devolução de valor". O objetivo é fazer você instalar um programa de acesso remoto, informar códigos ou transferir dinheiro. Regras de ouro: o banco NÃO pede senha, códigos, instalação de aplicativos nem transferência para "conta de segurança". Se a ligação parece vinda do banco, desligue e ligue de volta pelo número do verso do seu cartão (ou abra o app por conta própria). E saiba que o golpista pode deixar a linha aberta: espere ou use outro telefone.'
          ),
          sl(
            'Limites do Pix e o MED',
            'Os bancos permitem definir LIMITES de valor para Pix, por período e, especialmente, à noite. Reduzir o limite é uma defesa simples: se alguém tomar o controle do app, só consegue tirar até aquele valor. Muitos bancos permitem ainda cadastrar um aparelho como o único autorizado e ativar uma trava para novos dispositivos. O MED (Mecanismo Especial de Devolução) é um procedimento do sistema de pagamentos que, em certos casos de fraude, permite pedir a devolução do valor, quando o dinheiro ainda está na conta do destinatário e os critérios são atendidos. Ele NÃO garante a devolução, por isso a velocidade em contestar é importante. Visão geral: para detalhes, consulte as regras do seu banco e do Banco Central.'
          ),
          sl(
            'O que fazer ao cair',
            'Aja em minutos: (1) ligue ou use o canal do seu banco e informe a fraude para tentar acionar o bloqueio e a contestação (MED), indicando valor, hora e dados do destinatário; (2) bloqueie cartões e troque senhas do banco pelo canal oficial; (3) se instalou algo no celular, desconecte-o da internet e peça orientação; (4) guarde prints, comprovantes e conversas como evidências; (5) registre boletim de ocorrência, que o banco costuma pedir e que pode ser feito pela internet em muitos estados; (6) avise quem pode ser afetado. Não aceite "serviço de recuperação" que cobra para reaver o dinheiro: é um novo golpe. Procure o banco, os órgãos de defesa do consumidor e orientação jurídica, se necessário.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Você vendeu um objeto e o comprador envia um print dizendo que fez o Pix. O que fazer antes de entregar o objeto?', 'c', [
          'Entregar, pois o print mostra o valor correto e o horário do pagamento',
          'Entregar e conferir o saldo depois, já que a transferência é imediata',
          'Conferir no extrato do app do próprio banco se o valor realmente entrou',
          'Pedir ao comprador outro print, desta vez com a data e a hora visíveis'
        ], 'Print pode ser falso e só o extrato do seu banco confirma o recebimento. Outro print pode ser tão falso quanto o primeiro.'),
        mcq('q2', 'Alguém liga dizendo ser do banco e pede para você transferir o dinheiro para uma "conta segura" enquanto resolvem uma fraude. O que isso é?', 'b', [
          'Um procedimento normal de proteção realizado pelos bancos em casos de fraude',
          'Engenharia social bancária: o banco não pede esse tipo de transferência',
          'Um teste de segurança obrigatório feito pelo Banco Central todo mês',
          'Uma atualização de cadastro que só pode ser feita por telefone'
        ], 'Nenhum banco pede transferência para conta segura; esse é um roteiro clássico de golpe. Desligue e ligue pelo número oficial do cartão.'),
        mcq('q3', 'Qual cuidado ajuda a reduzir o prejuízo se alguém tomar o controle do app do seu banco?', 'a', [
          'Definir limites baixos para o Pix, principalmente no período da noite',
          'Aumentar o limite do Pix para facilitar compras emergenciais da família',
          'Desativar as notificações do banco para evitar que o celular apite à noite',
          'Salvar a senha do app no bloco de notas para não esquecer em caso de pressa'
        ], 'Limites menores restringem quanto pode ser desviado. Desligar avisos ou anotar a senha só aumenta o risco.'),
        fill('q4', 'Complete com a sigla do mecanismo do sistema de pagamentos que, em certos casos de fraude, permite pedir a devolução de um Pix.', '___ = Mecanismo Especial de Devolucao', ['med'], 'O MED pode ajudar em casos de fraude, mas não garante devolução; agir rápido aumenta a chance.'),
        mcq('q5', 'Antes de pagar um boleto recebido por mensagem, qual conferência é mais importante?', 'd', [
          'Se o PDF tem o logotipo da empresa e o valor que você esperava pagar',
          'Se o boleto foi enviado em horário comercial e por um número conhecido',
          'Se o desconto oferecido é de pelo menos dez por cento do valor da cobrança',
          'Se o beneficiário mostrado no app do banco é a empresa esperada'
        ], 'O app do banco mostra para quem o dinheiro vai de fato. Logotipo, horário e desconto não provam nada, pois podem ser forjados.'),
        mcq('q6', 'O que o MED garante a quem sofreu um golpe de Pix?', 'c', [
          'A devolução total do valor em até uma hora, em qualquer situação e tipo de golpe',
          'A devolução automática do valor sem necessidade de registrar a fraude',
          'Um procedimento para pedir a devolução em certos casos, sem garantia de resultado',
          'A prisão imediata do golpista, depois que o banco for avisado do golpe'
        ], 'O MED é um mecanismo de contestação que depende de critérios e de o dinheiro ainda estar disponível. Não é garantia nem processo criminal.'),
        mcq('q7', 'Depois de cair em um golpe, alguém oferece um "serviço de recuperação do dinheiro" mediante pagamento antecipado. Como tratar?', 'b', [
          'Contratar, pois o serviço conhece caminhos mais rápidos que o banco',
          'Recusar, pois costuma ser um novo golpe, e procurar o banco e os canais oficiais',
          'Contratar se o valor cobrado for menor que o valor perdido no golpe',
          'Aceitar se a pessoa enviar um contrato com o nome de uma empresa conhecida'
        ], 'Cobrar adiantado para recuperar dinheiro é um golpe recorrente contra quem já foi vítima. O caminho é o banco, o boletim de ocorrência e a orientação oficial.'),
        fill('q8', 'Complete com o documento que o banco costuma pedir ao registrar uma fraude e que pode ser feito pela internet em muitos estados: boletim de ___.', 'boletim de ___', ['ocorrência', 'ocorrencia'], 'O boletim de ocorrência registra o golpe e costuma ser pedido pelo banco; guarde também prints e comprovantes.')
      ]
    },
    {
      id: 'csb-38-cripto-e-golpes-com-criptomoedas',
      title: 'Cripto: carteiras, chaves e golpes com criptomoedas',
      goal: 'Entender em termos simples o que são criptoativos e carteiras, por que a chave privada e a frase de recuperação nunca se compartilham e como reconhecer os golpes mais comuns.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que são criptoativos (sem jargão)',
            'Criptoativo, ou criptomoeda, é um valor digital que existe apenas como registros em um grande livro de contas compartilhado por muitos computadores na internet. Em vez de um banco guardar o seu saldo, esse livro público registra quem transferiu o quê para quem. Pense em uma planilha que milhares de pessoas mantêm iguais entre si e que ninguém consegue apagar sozinho. Este curso trata só de SEGURANÇA: não damos opinião sobre comprar, vender ou investir, e não falamos de preços. O foco é não perder o que é seu para golpistas.'
          ),
          sl(
            'Carteira, endereço e chave privada',
            'Uma carteira digital (wallet) é o programa ou aparelho que guarda o que você precisa para movimentar seus criptoativos. Ela tem duas peças. O endereço funciona como um número de conta: pode ser informado a quem vai lhe enviar valores. A chave privada funciona como a senha-mestra que autoriza qualquer saída: quem a possui consegue mover tudo, de qualquer lugar. Não existe atendimento que recupere uma chave perdida ou roubada. Erro comum: confundir o endereço (público, seguro de mostrar) com a chave privada (secreta, nunca mostrar).',
            'Endereço (pode divulgar):   <endereco-publico-ficticio>\nChave privada (NUNCA):       <segredo-nao-compartilhar>'
          ),
          sl(
            'Frase de recuperação: o segredo que vale tudo',
            'Muitas carteiras geram uma frase de recuperação: uma lista de palavras (geralmente 12 ou 24) que consegue recriar a chave privada em qualquer aparelho. Ela serve para você recuperar o acesso se perder o celular. Por isso quem conhecer a frase controla a carteira inteira, sem precisar de senha nenhuma. Regras simples: anote em papel e guarde em lugar seguro, não tire foto, não salve em nuvem, e NUNCA digite em site, formulário ou conversa. Nenhum suporte legítimo, de nenhuma carteira ou corretora, precisa saber a sua frase.'
          ),
          sl(
            'Transações irreversíveis',
            'Quando você envia um criptoativo, a operação é registrada no livro público e, depois de confirmada, em geral não existe uma central para desfazê-la. Com cartão de crédito você pode contestar uma compra no banco; aqui, normalmente não há essa rede de proteção. Se o golpista recebeu, o valor foi embora. Consequências práticas: confira com muito cuidado o endereço antes de enviar (um caractere errado muda o destino), desconfie de qualquer pressa e lembre que prometer devolução, estorno ou reembolso é a isca clássica de golpes.'
          ),
          sl(
            'Os golpes mais comuns',
            'Falsa corretora ou plataforma: um site ou app com cara profissional mostra lucros inventados para convencer a depositar cada vez mais, e na hora de sacar surgem taxas e desculpas. Promessa de ganho fácil: lucro garantido, "dobre seu dinheiro" ou um suposto especialista que "opera para você". Pirâmide: o ganho vem principalmente de recrutar novas pessoas, não de um produto real, e desmorona quando entram menos participantes. Rug pull ("puxar o tapete"): os criadores de uma moeda nova atraem compradores e somem levando o dinheiro. Phishing de carteira: mensagem, anúncio ou site falso que pede para você conectar a carteira ou digitar a frase de recuperação.'
          ),
          sl(
            'Sinais de alerta, prevenção e o que fazer',
            'Sinais de alerta: retorno garantido ou muito acima do normal, pressão para decidir logo, pedido da frase de recuperação, contato inesperado por rede social ou aplicativo de mensagens, famosos "recomendando" (podem ser deepfake, veja a lição de golpes em redes sociais), site com endereço levemente diferente do oficial. Prevenção: use só serviços cuja reputação você verificou por conta própria, ative a verificação em duas etapas, guarde a frase offline e desconfie de quem pede para "validar" a carteira. Se caiu: pare de enviar, guarde provas (conversas, endereços, comprovantes), registre boletim de ocorrência e avise a plataforma de origem. Isto não é aconselhamento financeiro nem jurídico.'
          )
        ]
      },
      questions: [
        mcq(
          'q1',
          'O que é a frase de recuperação de uma carteira?',
          'b',
          [
            'Uma senha de login que o suporte da carteira usa para confirmar a sua identidade quando você pede ajuda por chat.',
            'Uma lista de palavras que recria a chave privada, por isso quem a conhece controla a carteira.',
            'O endereço público da carteira escrito em palavras para facilitar a leitura.',
            'Um código temporário que expira depois de alguns minutos e serve só para confirmar um envio.'
          ],
          'A frase de recuperação recria a chave privada, então equivale ao controle total da carteira. Ela não é senha de suporte (nenhum suporte legítimo a pede), não é o endereço público (que é seguro de divulgar) e não é um código temporário de confirmação.'
        ),
        mcq(
          'q2',
          'Você recebe uma mensagem de um suposto suporte dizendo que sua carteira foi bloqueada e que, para liberar, precisa informar as 12 palavras de recuperação. O que fazer?',
          'd',
          [
            'Informar as palavras, mas só depois de conferir se o perfil que enviou a mensagem tem foto de empresa conhecida.',
            'Informar metade das palavras, pois assim o suposto suporte não teria o conjunto completo.',
            'Responder pedindo o número de protocolo do atendimento e, se ele for fornecido, passar as palavras.',
            'Não informar nada: nenhum suporte legítimo pede essa frase, então é tentativa de golpe.'
          ],
          'Ninguém legítimo precisa da frase de recuperação, então o pedido já indica golpe. A foto do perfil e um número de protocolo são fáceis de falsificar, e passar parte das palavras ainda reduz muito o trabalho do golpista.'
        ),
        mcq(
          'q3',
          'Por que uma transferência de criptoativo para o endereço errado ou para um golpista costuma ser tão difícil de reverter?',
          'a',
          [
            'Depois de confirmada, em geral não existe uma central como o banco do cartão que possa desfazer a operação.',
            'Porque os criptoativos são protegidos por seguro obrigatório, que só devolve valores a quem registrou o endereço antes.',
            'Porque a carteira bloqueia a conta do remetente por 30 dias, tempo em que qualquer devolução é impossível.',
            'Porque o endereço de destino pertence a uma pessoa de outro país, onde a lei brasileira não vale.'
          ],
          'O ponto central é a ausência de uma central que desfaça operações confirmadas. Não há seguro obrigatório com essa regra, nem bloqueio de 30 dias, e o destino pode ou não ser de outro país: isso não é o motivo da irreversibilidade.'
        ),
        fill(
          'q4',
          'Complete: o segredo que autoriza qualquer saída da carteira e que nunca deve ser compartilhado.',
          'A chave ___ da carteira é secreta; o endereço, não.',
          ['privada', 'privada da carteira'],
          'A chave privada é a senha-mestra da carteira: quem a tem move os valores. O endereço é público e pode ser divulgado para receber valores.'
        ),
        mcq(
          'q5',
          'Uma moeda nova sobe muito de valor por causa de propaganda intensa, e de repente os criadores somem levando o dinheiro dos compradores. Esse golpe é conhecido como',
          'c',
          [
            'phishing de carteira, em que o golpista copia a tela de login da carteira.',
            'pirâmide, em que o lucro vem sobretudo de recrutar novos participantes.',
            'rug pull, em que os criadores atraem compradores e depois fogem com o dinheiro.',
            'falsa corretora, em que um site mostra saldos inventados e bloqueia os saques.'
          ],
          'O desaparecimento dos criadores depois de atrair compradores é o rug pull. Phishing de carteira envolve páginas ou mensagens falsas pedindo segredos, pirâmide depende de recrutamento e a falsa corretora simula uma plataforma de operação.'
        ),
        mcq(
          'q6',
          'Qual destes é um sinal de alerta típico de golpe com criptomoedas?',
          'a',
          [
            'Promessa de retorno garantido, junto com pressão para depositar rápido.',
            'Um serviço que explica que os valores podem subir e descer e que não promete lucro.',
            'Um aplicativo que pede ativação de verificação em duas etapas no cadastro.',
            'Uma carteira que orienta o usuário a guardar a frase de recuperação em papel.'
          ],
          'Retorno garantido e pressa são marcas clássicas de fraude. As outras opções descrevem comportamentos de segurança saudáveis: avisar sobre risco, pedir verificação em duas etapas e orientar a guardar a frase offline.'
        ),
        mcq(
          'q7',
          'Um conhecido convida você a entrar em um esquema em que o ganho principal vem de trazer novas pessoas pagando uma taxa de entrada. Qual o risco central?',
          'd',
          [
            'Ele pode estar usando uma carteira com endereço longo demais.',
            'O esquema é seguro desde que o conhecido seja de confiança, já que a taxa é pequena.',
            'O ganho depende da cotação diária, que o grupo consegue controlar sozinho.',
            'É uma estrutura de pirâmide: quando faltarem novos participantes, quem entrou por último perde o que pagou.'
          ],
          'Esquemas em que o lucro depende de recrutar mais gente tendem a ruir, e os últimos a entrar perdem. Confiar no conhecido não muda a matemática, o tamanho do endereço é irrelevante e a cotação não é controlada por um grupo.'
        ),
        fill(
          'q8',
          'Complete: onde guardar a frase de recuperação de forma segura.',
          'Anote a frase em papel e guarde ___ de internet, nunca em foto ou nuvem.',
          ['fora', 'offline', 'longe'],
          'Guardar a frase fora da internet (em papel, em local seguro) evita que um invasor a copie do celular ou da conta de nuvem.'
        )
      ]
    },
    {
      id: 'csb-18-seguranca-de-celulares-e-apps',
      title: 'Segurança de celulares e aplicativos',
      goal: 'Proteger o celular: lojas oficiais, permissões, bloqueio de tela, localizar dispositivo, SIM swap em nível simples, apps maliciosos e atualizações.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O celular é o seu cofre portátil',
            'No celular você tem banco, Pix, e-mail, WhatsApp, fotos, documentos e o segundo fator (MFA) de quase todas as contas. Quem controla seu celular controla boa parte da sua vida digital. Por isso ele merece mais cuidado que o computador, e muita gente protege menos. As medidas desta lição são simples e valem para Android e iPhone: instalar apps de lojas oficiais, revisar permissões, bloquear a tela, ativar localizar dispositivo, entender o SIM swap e manter tudo atualizado.'
          ),
          sl(
            'Lojas oficiais e apps maliciosos',
            'Instale aplicativos somente da LOJA OFICIAL do sistema (Google Play, App Store), que faz verificações, embora não perfeitas. Fora delas (arquivos de instalação enviados por mensagem, sites de "app modificado", versões piratas), o risco de malware é muito maior. Sinais de app malicioso: pede permissões demais, vem de desenvolvedor desconhecido, tem poucas avaliações ou muitas avaliações todas iguais, imita o nome de um app famoso com pequenas mudanças, e usa promessas como "descubra quem viu seu perfil". Antes de instalar um app, confira o nome do desenvolvedor, o número de downloads e as avaliações recentes. Evite ativar a opção de instalar de fontes desconhecidas.'
          ),
          sl(
            'Permissões e acessibilidade',
            'Cada app pede permissões (câmera, contatos, localização, SMS, etc). Revise nas configurações: remova o que não é necessário. Um cuidado especial com o serviço de ACESSIBILIDADE e com a permissão de administrador do dispositivo: eles dão ao app poder de ler a tela e agir em seu nome, e malwares bancários costumam pedir isso com uma desculpa de "melhorar o desempenho". Se um app que você acabou de instalar pede acesso de acessibilidade sem ter relação com o uso, desconfie e remova. Aplicativos que você não usa mais devem ser desinstalados.'
          ),
          sl(
            'Bloqueio e localizar dispositivo',
            'Use bloqueio de tela com PIN de pelo menos 6 dígitos (melhor, uma senha mais longa) ou biometria, e configure o bloqueio automático curto. Não use sequências óbvias (123456, data de nascimento). Ative o recurso LOCALIZAR DISPOSITIVO (em Android e iPhone): ele mostra o aparelho no mapa, toca um som, bloqueia o aparelho e, se necessário, apaga os dados à distância se for roubado. Configure antes de precisar, ative o recurso de bloqueio de roubo, se existir, e anote o número de identificação do aparelho (IMEI) em lugar seguro para registrar a ocorrência. Em caso de perda ou roubo: bloqueie o aparelho, avise o banco e a operadora, e troque senhas pelo computador.'
          ),
          sl(
            'SIM swap em nível simples',
            'SIM swap (troca de chip) é o golpe em que o criminoso convence a operadora (ou funcionário) a transferir o seu número de telefone para um chip dele, geralmente se passando por você com dados vazados. Com o seu número, ele recebe SMS e códigos de verificação, e pode recuperar contas. Sinais: seu celular fica sem sinal de repente, sem motivo, e você recebe avisos de troca de chip. Defesas: use autenticador ou chave física em vez de SMS para MFA; ative PIN ou senha extra na operadora, se existir; evite divulgar CPF e dados pessoais; e, se ficar sem sinal de repente, ligue para a operadora por outro aparelho e avise o banco imediatamente.'
          ),
          sl(
            'Atualizações e Wi-Fi',
            'Mantenha o sistema do celular e os apps atualizados (ligue a atualização automática): correções de segurança chegam por aí, e aparelhos antigos sem suporte devem ser trocados ou usados com muito cuidado. Cuidado ao usar Wi-Fi público, ao conectar o celular a carregadores públicos desconhecidos (use um carregador seu) e ao pareamento Bluetooth em lugares públicos. Desative o que não usa (Bluetooth e NFC quando não precisa). Para trocar de aparelho ou vender: faça backup, saia das contas, restaure o aparelho às configurações de fábrica e apague os dados com segurança.'
          ),
          sl(
            'Resumo prático',
            'Checklist: bloqueio forte; atualizações automáticas; só apps da loja oficial, com permissões revisadas; localizar dispositivo ligado; autenticador em vez de SMS; PIN extra na operadora, se existir; verificação em duas etapas no WhatsApp; backup dos dados; e desinstalar o que não usa. Se achar que o celular foi infectado: coloque em modo avião, remova apps recentes ou suspeitos, troque senhas por outro aparelho e, em caso grave, restaure às configurações de fábrica depois de salvar o que for seguro. Aviso final: instalar apps fora da loja e usar versões modificadas de aplicativos são caminhos frequentes de infecção.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual prática mais reduz o risco de instalar um app malicioso no celular?', 'd', [
          'Instalar apps de links enviados por mensagem, desde que o remetente seja conhecido',
          'Baixar versões modificadas, pois não possuem os anúncios dos aplicativos oficiais',
          'Ativar a instalação de fontes desconhecidas para ter mais opções de aplicativos',
          'Instalar apps somente da loja oficial e conferir o desenvolvedor e as avaliações'
        ], 'Lojas oficiais fazem verificações e permitem conferir o desenvolvedor e as avaliações. Links, versões modificadas e fontes desconhecidas aumentam muito o risco.'),
        mcq('q2', 'Um app de edição de fotos recém-instalado pede o serviço de acessibilidade do celular. Por que desconfiar?', 'a', [
          'Porque ele lê a tela e age em seu nome, e é muito usado por malwares bancários',
          'Porque o serviço de acessibilidade consome toda a bateria do celular em poucos minutos',
          'Porque o serviço só pode ser ativado por pessoas com deficiência visual',
          'Porque o app de edição de fotos passa a cobrar por cada foto editada depois disso'
        ], 'Acessibilidade dá poder de ler e controlar a tela, e é um alvo clássico de malwares bancários. O consumo de bateria ou a cobrança não são o problema.'),
        mcq('q3', 'Seu celular fica sem sinal de repente, sem motivo, e logo chegam avisos de troca de chip. Qual a hipótese mais preocupante e a ação?', 'b', [
          'Um defeito comum do aparelho; basta esperar algumas horas até o sinal voltar',
          'SIM swap: ligar para a operadora por outro aparelho e avisar o banco imediatamente',
          'Um vírus de computador; basta formatar o computador para o sinal voltar ao normal',
          'Uma atualização do sistema; basta reiniciar o celular e ignorar os avisos'
        ], 'A perda repentina de sinal com avisos de troca de chip é sinal clássico de SIM swap; agir rápido com a operadora e o banco limita o prejuízo.'),
        fill('q4', 'Complete com o nome do recurso que mostra o celular no mapa, toca um som, bloqueia o aparelho e pode apagá-lo à distância.', 'localizar ___', ['dispositivo', 'aparelho'], 'Localizar dispositivo deve ser configurado antes de precisar; ajuda a achar, bloquear e apagar um aparelho perdido ou roubado.'),
        mcq('q5', 'Qual é um bom bloqueio de tela para o celular?', 'c', [
          'Um PIN com sequência fácil, como 123456, para ser rápido de digitar',
          'A data de nascimento do dono, pois é fácil de lembrar em qualquer situação',
          'Um PIN de pelo menos 6 dígitos sem padrão óbvio, ou senha mais longa e biometria',
          'Sem bloqueio de tela, e confiar na função de localizar dispositivo em caso de perda'
        ], 'PIN óbvio ou datas são fáceis de adivinhar, e sem bloqueio qualquer pessoa usa o aparelho. Um PIN mais longo sem padrão ou uma senha, com biometria, é o recomendado.'),
        mcq('q6', 'Por que usar um app autenticador em vez de SMS ajuda contra o SIM swap?', 'a', [
          'Porque o código é gerado no aparelho e não depende do número de telefone',
          'Porque o app autenticador impede a operadora de trocar o chip do cliente',
          'Porque o autenticador envia o código para um e-mail alternativo toda vez que é usado',
          'Porque o SMS passa a ser criptografado automaticamente com o autenticador instalado'
        ], 'Com autenticador, o código nasce no aparelho; desviar o número de telefone não entrega o código. Ele não controla a operadora nem muda o SMS.'),
        mcq('q7', 'O que fazer ao vender ou trocar o celular?', 'd', [
          'Entregar o aparelho do jeito que está, pois o comprador não terá acesso aos dados',
          'Apagar só as fotos e deixar os aplicativos e contas conectados no aparelho',
          'Remover o chip e deixar as contas, os aplicativos e os dados no celular',
          'Fazer backup, sair das contas e restaurar o aparelho às configurações de fábrica'
        ], 'Contas conectadas e dados deixados no aparelho podem ser usados por outras pessoas. Backup, saída das contas e restauração de fábrica protegem seus dados.'),
        fill('q8', 'Complete com o nome do golpe de troca de chip, em que o criminoso transfere o seu número de telefone para um chip dele: SIM ___.', 'SIM ___ (troca de chip)', ['swap'], 'No SIM swap o número vai para outro chip, e por isso SMS é um método fraco de MFA.')
      ]
    },
    {
      id: 'csb-19-nuvem-para-usuarios',
      title: 'Nuvem para usuários: armazenar e compartilhar com segurança',
      goal: 'Entender o que é a nuvem, como funcionam links, permissões e sincronização, e o que o provedor protege e o que continua sendo sua responsabilidade.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é a nuvem',
            'A nuvem é o nome popular para computadores de uma empresa (o provedor) que ficam em datacenters e que você usa pela internet: guardar fotos e documentos, editar textos, mandar e-mails. Seus arquivos não ficam só no seu aparelho: ficam numa cópia guardada nos computadores do provedor. A vantagem é acessar de qualquer lugar e não perder tudo se o celular quebrar. O ponto de atenção: o acesso agora depende da sua conta. Quem entra na sua conta enxerga tudo o que está lá, de qualquer lugar do mundo.'
          ),
          sl(
            'Sincronização: uma ação vale para todos os aparelhos',
            'Sincronizar é manter os mesmos arquivos iguais em vários aparelhos. Se você apaga um arquivo no notebook, a exclusão pode ser replicada no celular e na nuvem. Se um arquivo é alterado por um vírus (por exemplo, criptografado por um ransomware, que você viu na lição de malware), a versão estragada também pode se espalhar. Por isso sincronização NÃO é backup: backup é uma cópia separada, guardada para voltar no tempo. Muitos serviços oferecem lixeira e histórico de versões, que ajudam, mas confira se estão ativados.'
          ),
          sl(
            'Compartilhar: links e permissões',
            'Ao compartilhar um arquivo você escolhe QUEM acessa e O QUE pode fazer. Quem: pessoas específicas (pelo e-mail delas) ou qualquer pessoa que tenha o link. Fazer: só visualizar, comentar ou editar. Um link aberto a qualquer pessoa funciona como uma chave deixada na porta: quem receber o link, encaminhado ou descoberto por engano, entra. O erro mais comum é deixar o link aberto para sempre, esquecido. Boas práticas: compartilhar com pessoas específicas, dar a menor permissão necessária (só ver, se basta), colocar data de validade quando existir, e revisar de tempos em tempos o que está compartilhado.',
            'Pessoa especifica + so visualizar  -> mais seguro\nQualquer pessoa com o link + editar  -> mais arriscado'
          ),
          sl(
            'O que o provedor protege e o que é seu',
            'Existe uma divisão de responsabilidades. O provedor cuida da parte pesada: prédios, energia, computadores, atualizações dos sistemas deles, proteção contra falhas de hardware. Você cuida do que fica do seu lado: senha forte e única, verificação em duas etapas (MFA), quais arquivos você coloca lá, com quem compartilha, e os aparelhos onde sua conta está aberta. Um provedor excelente não ajuda se a sua senha é fraca ou se você publica um link aberto com documentos pessoais. Muitos vazamentos de arquivos na nuvem vêm de configuração e de compartilhamento errados, não de uma invasão sofisticada.'
          ),
          sl(
            'Cuidados práticos',
            'Ative MFA na conta da nuvem: ela é a porta de entrada de muita coisa. Revise a lista de aparelhos conectados e remova os que você não usa mais. Cuidado com apps de terceiros que pedem acesso à sua conta (a tela "permitir que este app veja seus arquivos"): conceda só se confiar e revogue depois. Documentos muito sensíveis (cópias de documentos de identidade, por exemplo) pedem ainda mais cuidado: se guardar, prefira uma pasta com acesso restrito e nunca com link aberto. E lembre da LGPD: se você guarda dados de outras pessoas (clientes, alunos), a responsabilidade de proteger passa a ser sua também.'
          ),
          sl(
            'Erros comuns de iniciantes',
            'Achar que "está na nuvem, então está seguro e tem backup": a nuvem pode perder acesso por conta bloqueada ou invadida. Compartilhar a pasta inteira quando só um arquivo era necessário. Usar a mesma senha da nuvem em outros sites (se um deles vazar, sua nuvem fica exposta). Não olhar o painel de compartilhamento nunca. Mandar o link por um canal público (um grupo grande) achando que só os amigos verão. Em todos os casos o remédio é o mesmo: menor acesso necessário, MFA e revisão periódica.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Marina apagou sem querer uma pasta do notebook, e ela sumiu também do celular e do site do serviço. O que isso ilustra?', 'c', [
          'Que o provedor sofreu uma falha técnica e perdeu os dados guardados nos servidores, o que obriga a restaurar tudo',
          'Que a conta foi invadida por alguém que apagou tudo',
          'A sincronização replica ações entre os aparelhos, então não substitui um backup separado',
          'Que a nuvem apaga arquivos sozinha depois de um tempo'
        ], 'Sincronizar mantém tudo igual em todo lugar, inclusive exclusões. Não houve falha do provedor nem invasão necessariamente, e a nuvem não apaga sozinha; por isso é preciso um backup separado.'),
        mcq('q2', 'Você precisa que um colega apenas leia uma planilha. Qual configuração segue o menor acesso necessário?', 'a', [
          'Compartilhar com o e-mail dele com permissão de visualização',
          'Compartilhar com qualquer pessoa que tenha o link, permissão de edição, para facilitar',
          'Compartilhar a pasta inteira com edição, assim ele pode ver outras coisas úteis também',
          'Enviar a senha da sua conta para ele acessar quando quiser'
        ], 'Pessoa específica e só leitura entrega o que foi pedido. Link aberto com edição, pasta inteira e entregar a senha dão muito mais acesso do que o necessário.'),
        mcq('q3', 'Qual item é responsabilidade do usuário, e não do provedor, no uso da nuvem?', 'd', [
          'Manter a energia elétrica do datacenter funcionando, com geradores e sistemas de refrigeração das máquinas',
          'Trocar peças de computadores do datacenter que quebraram',
          'Atualizar os sistemas internos que rodam nos servidores do provedor',
          'Escolher uma senha forte, ativar MFA e decidir com quem compartilhar'
        ], 'Infraestrutura e atualização dos servidores ficam com o provedor. Senha, MFA e compartilhamento são decisões da pessoa dona da conta.'),
        fill('q4', 'Complete: um link que funciona para qualquer pessoa que o receba é um link ___ (o oposto de compartilhar com pessoas específicas).', 'Compartilhamento com link ___ = acesso para quem tiver o link', ['aberto', 'público', 'publico'], 'Um link aberto (ou público) não verifica quem você é: quem o tiver, acessa. Por isso deve ser usado com cuidado e validade.'),
        mcq('q5', 'Um arquivo foi alterado por um vírus no notebook e o serviço de sincronização copiou a versão alterada para a nuvem. O que pode ajudar a recuperar a versão boa?', 'b', [
          'Desinstalar o aplicativo de sincronização do computador',
          'O histórico de versões do serviço ou um backup separado, guardado antes do problema',
          'Trocar a senha da conta de nuvem, que desfaz as alterações já feitas',
          'Nada pode ser feito, pois a nuvem mantém só a última versão'
        ], 'Histórico de versões e backups separados guardam estados anteriores. Desinstalar o app ou trocar a senha não desfaz o arquivo alterado, e muitos serviços mantêm versões antigas.'),
        mcq('q6', 'Um app de edição de fotos pede permissão para ver todos os arquivos da sua nuvem. Qual é a atitude mais prudente?', 'a', [
          'Avaliar se o app é confiável e se precisa mesmo disso; conceder o mínimo e revogar depois',
          'Aceitar o pedido, pois app disponível em loja oficial é seguro por definição e pede só o acesso de que precisa',
          'Aceitar e usar a mesma senha em ambos para facilitar o acesso depois',
          'Aceitar rápido para não perder tempo, a nuvem do provedor já protege tudo contra isso'
        ], 'Apps com acesso amplo podem ler muito mais do que o necessário. Estar numa loja não garante segurança total, e o provedor não impede você de autorizar um app.'),
        mcq('q7', 'Por que "a pessoa que só tem o link" é um risco quando o link é aberto?', 'c', [
          'Porque links costumam ser falsos e levam a sites de golpe criados para roubar os dados de quem clicar',
          'Porque o provedor cobra mais caro por links abertos',
          'Porque o link pode ser repassado ou descoberto, e quem o tiver acessa sem provar quem é',
          'Porque o arquivo é apagado automaticamente após o primeiro acesso ao link'
        ], 'Um link aberto não confere identidade: serve para quem o tiver, inclusive alguém para quem foi encaminhado. Links não são falsos por natureza, e não há cobrança nem exclusão automática por isso.'),
        fill('q8', 'Complete com o termo que descreve manter os mesmos arquivos iguais em vários aparelhos, o que NÃO é a mesma coisa que backup.', 'Manter arquivos iguais em todos os aparelhos = ___', ['sincronização', 'sincronizacao', 'sincronizar', 'sync'], 'Sincronização replica o estado atual entre aparelhos, inclusive erros e exclusões. Backup é uma cópia separada para voltar no tempo.')
      ]
    },
    {
      id: 'csb-20-redes-para-seguranca',
      title: 'Redes para segurança: o que trafega e o que pode ser observado',
      goal: 'Entender, sem ser técnico, o que são IP, portas, DNS, roteador, rede local e internet, e o que pode ser visto por quem está no caminho.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Uma rede é um conjunto de aparelhos conversando',
            'Uma rede de computadores é um grupo de aparelhos (celular, notebook, TV, roteador) que trocam informações. A rede da sua casa é uma LAN (rede local): só os aparelhos de dentro conversam diretamente. A internet é uma imensa rede formada pela ligação de milhões de redes, chamada de WAN (rede de longa distância) quando falamos do lado de fora. O aparelho que liga a sua casa à internet é o roteador: ele funciona como o porteiro do prédio, que recebe e entrega correspondências entre os moradores e o mundo exterior. Este módulo é só a visão de segurança; os detalhes técnicos estão no curso de Redes.'
          ),
          sl(
            'Endereço IP: o endereço do aparelho',
            'Cada aparelho em uma rede recebe um número que o identifica, chamado endereço IP, como o endereço de uma casa para a entrega de cartas. Há IP privado (usado dentro da sua casa, não visível diretamente na internet) e IP público (o que a sua casa mostra para o mundo, geralmente um só para todos os aparelhos). Para fins de documentação usamos endereços de exemplo como 192.0.2.10. Do ponto de vista de segurança: o IP público revela aproximadamente a região e o provedor de internet, mas não o seu nome. A empresa de internet, porém, sabe a quem aquele IP foi atribuído, e isso pode ser pedido por autoridades com ordem legal.',
            'IP privado (casa): 192.168.0.12\nIP publico (visto na internet, exemplo): 203.0.113.25'
          ),
          sl(
            'Portas: as janelas de cada serviço',
            'Um aparelho pode oferecer vários serviços ao mesmo tempo (um site, um compartilhamento de arquivos, uma câmera). Cada serviço escuta em uma porta, que é um número, como uma janela numerada de um prédio. Exemplos clássicos: porta 80 para sites sem criptografia, 443 para sites com HTTPS. Uma porta aberta significa que existe um serviço atendendo ali. Quanto mais portas abertas sem necessidade, maior a superfície de ataque (o conjunto de pontos por onde alguém pode tentar entrar). A regra de segurança é simples: deixe aberto só o que você realmente usa.'
          ),
          sl(
            'DNS: a lista telefônica da internet',
            'Pessoas lembram nomes (exemplo.com), computadores usam números (IPs). O DNS é o serviço que traduz o nome para o número, como uma lista telefônica. Quando você digita um endereço, seu aparelho pergunta ao DNS qual o IP e só depois se conecta. Por isso o DNS é um alvo e uma fonte de informação: se alguém consegue enganar essa tradução, pode levar você a um site falso mesmo com o endereço digitado certo; e quem enxerga as perguntas de DNS consegue saber quais sites você consultou, mesmo sem ver o conteúdo.'
          ),
          sl(
            'O que trafega e o que pode ser observado',
            'Os dados viajam em pacotes, pequenos envelopes que passam por vários aparelhos até chegar ao destino. Se o envelope está lacrado (criptografia, como o HTTPS), quem está no caminho vê o envelope, mas não o conteúdo: sabe de qual para qual endereço vai e quando, mas não lê a mensagem. Se não está lacrado (HTTP simples, Wi-Fi aberto sem proteção), o conteúdo pode ser lido por quem estiver no caminho, como numa cartinha sem envelope. Em redes públicas, como a de um café, qualquer pessoa na mesma rede pode tentar observar o tráfego não protegido. Por isso a regra é preferir sites com HTTPS e usar VPN em redes de que você não confia.'
          ),
          sl(
            'Boas práticas de rede doméstica',
            'Troque a senha de administração do roteador (a que vem de fábrica é conhecida). Use criptografia moderna no Wi-Fi com senha forte. Mantenha o roteador atualizado. Não abra portas do roteador para a internet se não for necessário. Crie uma rede separada para visitantes e aparelhos que você confia menos (o chamado IoT, que vem na lição de IoT). Em caso de varreduras ou testes de rede: faça apenas na SUA rede ou com autorização escrita; testar redes alheias é crime (lição de ética e lei).'
          )
        ]
      },
      questions: [
        mcq('q1', 'Ana quer explicar a um amigo o que é a LAN da casa dela. Qual explicação está correta?', 'b', [
          'É a internet inteira vista de dentro da casa, com os sites do mundo ligados diretamente',
          'É a rede local em que celular, notebook e TV conversam entre si',
          'É o serviço que traduz nomes de sites em números',
          'É o programa que protege o notebook contra vírus'
        ], 'LAN é a rede local, restrita aos aparelhos da casa. A internet inteira é outra coisa, a tradução de nomes é o DNS e o programa de proteção é antivírus.'),
        mcq('q2', 'Para que serve o DNS?', 'a', [
          'Traduzir nomes de sites (como exemplo.com) em endereços IP',
          'Criptografar tudo o que você envia na internet',
          'Bloquear sites perigosos automaticamente, antes de você abrir',
          'Guardar suas senhas para entrar nos sites'
        ], 'O DNS é a lista telefônica da internet: de nome para número. Criptografar é função do HTTPS, e bloquear sites ou guardar senhas são outras ferramentas.'),
        mcq('q3', 'Um aparelho tem uma porta aberta para um serviço que ninguém usa mais. Qual é o problema de segurança?', 'd', [
          'Não há risco, pois só quem conhece a senha do Wi-Fi consegue ver portas abertas',
          'A porta aberta torna o aparelho mais lento, mas isso não afeta a segurança, porque a lentidão é só um incômodo',
          'Só é um problema se o aparelho for um celular, e não um computador',
          'O serviço esquecido aumenta a superfície de ataque e pode ter falhas sem atualização'
        ], 'Cada serviço escutando é uma possível entrada, e serviços esquecidos tendem a ficar desatualizados. A superfície de ataque deve ser a menor possível.'),
        fill('q4', 'Complete: o conjunto de pontos por onde alguém poderia tentar entrar em um sistema se chama superfície de ___.', 'superfície de ___', ['ataque'], 'Superfície de ataque é o total de entradas possíveis. Reduzi-la (fechar portas, remover serviços) é uma medida básica de defesa.'),
        mcq('q5', 'Num Wi-Fi aberto de um café, você acessa um site que usa HTTPS. O que alguém na mesma rede consegue observar?', 'c', [
          'Sua senha e todas as mensagens, porque o Wi-Fi é aberto e qualquer pessoa na rede lê tudo o que passa por ela',
          'Nada, nem sequer que você está usando a rede',
          'Em geral só que há uma conexão com aquele destino, mas não o conteúdo, que está criptografado',
          'Os dados do seu cartão, caso você digite algum'
        ], 'O HTTPS lacra o conteúdo; quem está no caminho vê os endereços envolvidos, não o conteúdo. Wi-Fi aberto sozinho não expõe dados protegidos por HTTPS, mas também não esconde que há uso da rede.'),
        mcq('q6', 'Qual cuidado ajuda a proteger o roteador de casa?', 'a', [
          'Trocar a senha de administração que vem de fábrica e manter o aparelho atualizado',
          'Deixar a senha original, pois ela foi escolhida pelo fabricante com cuidado e só ele conhece o equipamento',
          'Abrir todas as portas, para que os aparelhos conversem mais rápido',
          'Desligar o Wi-Fi do roteador durante o dia, e ligá-lo à noite'
        ], 'Senhas de fábrica são conhecidas, e roteadores desatualizados têm falhas. Abrir portas amplia a superfície, e desligar em certas horas não protege.'),
        mcq('q7', 'Alguém digita o endereço certo do banco, mas cai num site falso porque a tradução de nome para IP foi adulterada. Que parte da rede foi abusada?', 'b', [
          'A porta 443 do roteador da casa',
          'O DNS, que traduz nomes em IPs',
          'A rede local, que é a origem desse tipo de problema',
          'O endereço MAC do computador, que muda o nome do site'
        ], 'Quando a tradução de nome para IP é enganada, o nome certo leva ao destino errado. Não se trata da porta, e a LAN não é sempre a origem.'),
        fill('q8', 'Complete: o aparelho que liga a rede da casa à internet e funciona como porteiro entre o lado de dentro e o de fora é o ___.', 'O aparelho que liga a casa à internet = ___', ['roteador', 'router'], 'O roteador encaminha o tráfego entre a rede local e a internet; por isso a sua senha de administração e suas atualizações importam.')
      ]
    },
    {
      id: 'csb-21-firewall-antivirus-edr',
      title: 'Firewall, antivírus e EDR: o que fazem e o que não fazem',
      goal: 'Diferenciar firewall, antivírus e EDR, entender detecção por assinatura e por comportamento, falsos positivos e os limites dessas proteções.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Três ferramentas, três trabalhos diferentes',
            'Firewall, antivírus e EDR costumam ser confundidos. Firewall é um filtro de tráfego de rede: decide, por regras, quais conexões podem entrar e sair, como um porteiro com uma lista de quem pode passar. Antivírus é um programa que procura e remove malware (software malicioso) nos arquivos e na memória do aparelho. EDR (Endpoint Detection and Response, detecção e resposta em estações) é uma versão mais avançada, usada sobretudo em empresas: observa continuamente o que acontece em cada computador, para detectar comportamentos suspeitos e permitir que a equipe de segurança investigue e isole o aparelho.'
          ),
          sl(
            'Firewall: regras de entrada e saída',
            'O firewall olha para o tráfego (de qual endereço, para qual porta, em que sentido) e aplica regras: permitir ou bloquear. Pode estar no roteador (protege a casa toda), no sistema do computador (protege aquele aparelho) ou ser um equipamento dedicado numa empresa. A regra básica é negar o que não foi explicitamente permitido. O que o firewall NÃO faz: ele não lê o significado de um arquivo que você baixou voluntariamente, e não impede que você abra um anexo malicioso, porque essa conexão é legítima do ponto de vista dele. Também não protege contra um golpe de phishing em que você mesmo digita a senha.'
          ),
          sl(
            'Antivírus: assinatura e comportamento',
            'O antivírus tem dois métodos principais. Por ASSINATURA: compara o arquivo com uma lista de impressões digitais de malwares já conhecidos (como reconhecer um criminoso pela foto cadastrada). É rápido e preciso para o que já é conhecido, mas não enxerga uma ameaça nova. Por COMPORTAMENTO: observa o que o programa faz (por exemplo, criptografar centenas de arquivos rapidamente, ou mexer em áreas do sistema que não deveria) e dispara o alerta mesmo sem conhecer aquele malware. Soluções modernas combinam os dois, e precisam estar sempre atualizadas para conhecer as ameaças novas.',
            'Assinatura:    arquivo = igual a malware conhecido?\nComportamento: programa esta agindo como malware?'
          ),
          sl(
            'Falsos positivos e falsos negativos',
            'Nenhuma ferramenta acerta sempre. Falso positivo: a ferramenta alerta ou bloqueia algo que na verdade é seguro, como um programa legítimo de uma empresa pequena. Falso negativo: a ferramenta deixa passar algo realmente malicioso, e esse é o mais perigoso. Quando surge um alerta, não desative a proteção para "resolver": verifique de onde veio o arquivo, confira em fontes confiáveis, e na dúvida pergunte a quem entende de segurança ou ao suporte. Por outro lado, também não ignore todos os alertas sem ler: um alerta repetido tem de ser entendido.'
          ),
          sl(
            'EDR e os limites da proteção',
            'O EDR registra eventos de cada computador (programas iniciados, arquivos modificados, conexões de rede) e procura padrões suspeitos, enviando alertas para uma equipe. Permite responder: isolar o computador da rede, matar um processo, investigar o que aconteceu. Mesmo assim nenhuma ferramenta é perfeita: o antivírus não impede um golpe em que você entrega a senha, o firewall não impede um anexo aberto por você, e o EDR depende de alguém acompanhar os alertas. Por isso o segredo é a defesa em camadas (próxima lição): vários controles imperfeitos que se complementam, mais as atualizações e o comportamento atento do usuário.'
          ),
          sl(
            'Hábitos que fazem diferença',
            'Mantenha o sistema operacional e os programas atualizados. Deixe ativos o firewall e o antivírus do sistema (muitas vezes já vêm instalados). Baixe programas só de fontes oficiais. Evite instalar vários antivírus ao mesmo tempo: eles podem atrapalhar um ao outro. Não ignore alertas, mas também não desative a proteção só porque um instalador pediu isso: um programa legítimo raramente exige que você desligue a segurança. Se um site disser "seu computador está infectado, ligue já para este número", é golpe.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a principal função de um firewall?', 'c', [
          'Remover vírus que já estão dentro dos arquivos do computador',
          'Guardar as senhas do usuário de forma segura',
          'Decidir, por regras, quais conexões de rede podem entrar e sair',
          'Fazer backup dos documentos do computador na nuvem a cada noite, de forma automática'
        ], 'O firewall filtra tráfego de rede por regras. Remover vírus é do antivírus, guardar senhas é de um gerenciador, e backup é outra prática.'),
        mcq('q2', 'Um antivírus que compara arquivos com uma lista de malwares já conhecidos está usando qual método?', 'a', [
          'Detecção por assinatura',
          'Detecção por comportamento',
          'Isolamento de rede',
          'Criptografia do arquivo'
        ], 'Comparar com impressões digitais de ameaças conhecidas é detecção por assinatura. Comportamento observa o que o programa faz, e as outras opções são conceitos diferentes.'),
        mcq('q3', 'Um malware totalmente novo, que ainda não está em nenhuma lista de assinaturas, tem mais chance de ser pego por qual método?', 'd', [
          'Assinatura, porque a lista é atualizada a cada minuto com as ameaças novas',
          'Detectar algo novo exige que a ameaça antes seja catalogada, por definição',
          'O firewall do roteador, que lê o conteúdo dos arquivos baixados',
          'Detecção por comportamento, que reconhece ações típicas de malware'
        ], 'Assinaturas só conhecem o que já foi catalogado; o comportamento suspeito (como criptografar muitos arquivos) pode denunciar a ameaça nova. O firewall não lê arquivos que você baixou.'),
        fill('q4', 'Complete: quando um antivírus alerta sobre um programa que na verdade é seguro, isso se chama falso ___.', 'alerta sobre algo seguro = falso ___', ['positivo'], 'Falso positivo é um alarme sobre algo inofensivo. Falso negativo é o contrário: deixar passar uma ameaça real.'),
        mcq('q5', 'O instalador de um programa baixado de um site desconhecido pede: "desative o antivírus para instalar". O que fazer?', 'b', [
          'Desativar, pois o próprio programa sabe o que é melhor para a instalação',
          'Desconfiar, não instalar e buscar o programa na fonte oficial',
          'Desativar só o firewall, que não é o antivírus e portanto não importa',
          'Desativar e reativar logo em seguida, o que elimina qualquer risco'
        ], 'Instaladores legítimos raramente exigem desligar a proteção; esse pedido é sinal de alerta. Uma janela curta desprotegida já basta para um malware agir.'),
        mcq('q6', 'Marcos abriu um anexo malicioso de e-mail por vontade própria. O firewall não bloqueou. Por quê?', 'a', [
          'Porque o download do anexo é uma conexão aparentemente legítima, que ele não avalia pelo significado',
          'Porque o firewall estava com defeito de fábrica, o que acontece com a maioria dos modelos de roteadores e computadores vendidos',
          'Porque firewalls só funcionam em empresas e não em redes de casas',
          'Porque o firewall só bloqueia imagens, mas não arquivos de texto'
        ], 'Firewall decide por regras de rede e não julga se um arquivo aceito é malicioso. O erro não é de fábrica nem restrito a empresas.'),
        mcq('q7', 'O que o EDR acrescenta em relação a um antivírus simples?', 'd', [
          'Substitui totalmente o firewall e o antivírus, sendo suficiente sozinho para proteger todo o ambiente',
          'Impede que o usuário clique em phishing, bloqueando o e-mail',
          'Troca as senhas dos usuários a cada hora, de forma automática',
          'Observa continuamente os computadores e permite investigar e isolar um aparelho suspeito'
        ], 'EDR registra eventos, detecta padrões suspeitos e permite resposta (isolar, investigar). Nenhuma ferramenta substitui todas as camadas nem elimina o erro humano.'),
        fill('q8', 'Complete: ferramenta que filtra o tráfego de rede por regras de permitir ou bloquear:', 'ferramenta de filtro de rede por regras = ___', ['firewall'], 'O firewall aplica regras de permitir ou bloquear às conexões de rede.')
      ]
    },
    {
      id: 'csb-22-principios-menor-privilegio-defesa-em-profundidade',
      title: 'Princípios de segurança: menor privilégio e defesa em profundidade',
      goal: 'Aprender os princípios que guiam boas decisões: menor privilégio, defesa em profundidade, separação de funções, falha segura e zero trust.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Princípios valem mais que listas de truques',
            'Ferramentas mudam, mas os princípios de segurança se mantêm. Eles são regras de bolso que ajudam a decidir bem em situações novas. Nesta lição você vê cinco: menor privilégio, defesa em profundidade, separação de funções, falha segura e zero trust. Todos usam analogias do dia a dia, e você vai reconhecê-los em coisas simples, como as chaves de um prédio.'
          ),
          sl(
            'Menor privilégio',
            'Privilégio é o que uma pessoa ou programa tem permissão de fazer. O princípio do menor privilégio diz: dê a cada pessoa, conta ou programa somente as permissões necessárias para cumprir sua tarefa, e nada além disso. Analogia: o faxineiro recebe a chave das salas que limpa, não a do cofre. Na prática: usar no dia a dia uma conta comum do computador, e deixar a conta de administrador para quando for preciso mudar o sistema. Se alguém (ou um malware) assumir uma conta com poucos privilégios, o estrago possível é pequeno.',
            'Faxineiro   -> chave das salas\nGerente     -> chave das salas + sala do caixa\nDono        -> cofre'
          ),
          sl(
            'Defesa em profundidade',
            'Em vez de confiar numa única proteção, usamos várias camadas, de modo que, se uma falhar, outra segura. Analogia: um castelo tem fosso, muralha, portão e guardas; não adianta a muralha ser altíssima se o portão fica aberto. Em casa: senha forte (camada 1), MFA (camada 2), atualizações (camada 3), backup (camada 4), atenção a golpes (camada 5). Nenhuma camada é perfeita, e é por isso que a soma delas funciona. O erro comum é achar que um único produto (um antivírus, por exemplo) resolve tudo.'
          ),
          sl(
            'Separação de funções e falha segura',
            'Separação de funções (ou segregação): tarefas críticas não devem depender de uma pessoa só. Quem pede um pagamento não deveria ser quem o aprova; assim uma fraude ou um erro exige que duas pessoas errem ou combinem. Falha segura: quando algo dá errado, o sistema deve cair em um estado seguro, não aberto. Exemplo: se o leitor de cartão de um prédio perde energia, a porta de um cofre deve ficar trancada. (Em portas de saída de emergência, a segurança de pessoas vem primeiro: é por isso que o desenho depende do que se quer proteger.) Em sistemas: se o serviço que verifica permissões estiver fora do ar, o acesso deve ser negado, não liberado.'
          ),
          sl(
            'Zero trust (confiança zero), em nível conceitual',
            'Antigamente se pensava como num castelo: quem está dentro da rede da empresa é confiável. O zero trust (confiança zero) muda isso: nunca confie automaticamente, nem em quem já está dentro da rede; verifique cada acesso, a cada vez, considerando quem é a pessoa, de qual aparelho e se aquele acesso faz sentido. Uma frase que resume: "nunca confie, sempre verifique". Não é um produto, é uma forma de pensar que combina com menor privilégio e MFA. Na vida pessoal: não confiar numa mensagem só porque veio de um contato conhecido (a conta dele pode ter sido invadida).'
          ),
          sl(
            'Juntando os princípios num caso',
            'Pense numa pequena loja. Menor privilégio: o caixa só acessa o sistema de vendas, não o cadastro financeiro. Defesa em profundidade: senha forte, MFA no e-mail, atualizações e backup. Separação de funções: quem compra mercadoria não é quem paga. Falha segura: se o sistema de login falha, ninguém entra. Zero trust: acessos remotos exigem MFA mesmo vindos do aparelho conhecido. Cada princípio reduz um tipo de risco, e o conjunto torna um incidente menos provável e menos grave.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um estagiário precisa apenas consultar relatórios, mas recebeu permissão de administrador "por garantia". Qual princípio foi desrespeitado?', 'b', [
          'Defesa em profundidade',
          'Menor privilégio',
          'Falha segura',
          'Zero trust'
        ], 'Dar mais permissão do que a tarefa exige viola o menor privilégio. Os outros princípios tratam de camadas, de estado em caso de erro e de verificar sempre.'),
        mcq('q2', 'Uma loja usa senha forte, MFA, atualizações e backup, mesmo sabendo que nenhum desses itens é perfeito sozinho. Que princípio isso ilustra?', 'd', [
          'Separação de funções, pois cada item é feito por um funcionário diferente',
          'Menor privilégio, porque cada item limita as permissões de um usuário',
          'Falha segura, porque o sistema falha menos com tantos itens',
          'Defesa em profundidade, com camadas que se complementam'
        ], 'Várias camadas imperfeitas somadas é defesa em profundidade. Os demais princípios tratam de quem faz o quê, de permissões e do estado em caso de falha.'),
        mcq('q3', 'Na empresa de Paula, quem solicita um pagamento a fornecedor também é quem o aprova. Qual risco isso cria e qual princípio ajudaria?', 'a', [
          'Fraude ou erro sem revisão; ajudaria a separação de funções',
          'Lentidão; ajudaria o menor privilégio, que agiliza o pagamento',
          'Vazamento de senhas; ajudaria o zero trust, que cifra o pagamento',
          'Falta de backup; ajudaria a falha segura que protege os dados'
        ], 'Quando a mesma pessoa pede e aprova, ninguém confere. Separar as funções exige duas pessoas. As outras associações misturam princípios e riscos.'),
        fill('q4', 'Complete com o nome do princípio que diz para dar a cada pessoa só as permissões necessárias para a tarefa.', 'Princípio do ___ privilégio', ['menor', 'mínimo', 'minimo'], 'O princípio do menor privilégio limita o dano possível se uma conta for abusada ou invadida.'),
        mcq('q5', 'O sistema que consulta quem pode abrir uma porta eletrônica de um cofre sai do ar. Qual comportamento representa uma falha segura?', 'c', [
          'A porta do cofre abre para a equipe, até o sistema voltar',
          'A porta aceita qualquer crachá, mesmo vencido',
          'A porta permanece trancada até o sistema voltar',
          'A porta abre para o gerente, sem verificar o crachá'
        ], 'Falha segura é cair no estado seguro (trancado). Abrir para todos, ou para quem não foi verificado, transforma uma falha em um buraco.'),
        mcq('q6', 'O que significa a ideia de zero trust (confiança zero)?', 'b', [
          'Que os usuários devem acessar com uma conta única do sistema, evitando riscos',
          'Não confiar automaticamente nem em quem está na rede interna e verificar cada acesso',
          'Que tudo dentro da rede da empresa é confiável e só o que vem de fora precisa ser verificado',
          'Que as senhas devem ser trocadas todo dia, pois nenhuma é confiável'
        ], 'Zero trust verifica cada acesso, sem presumir que quem está dentro é confiável. A visão de castelo é justamente a que ele substitui.'),
        mcq('q7', 'Um colega envia no grupo uma mensagem pedindo dinheiro urgente. Pensando em zero trust, qual é a boa atitude?', 'd', [
          'Confiar, pois a mensagem veio do número de um conhecido que já falou com você várias vezes antes',
          'Confiar se a mensagem tiver o nome correto do colega',
          'Ignorar, pois pedidos de colega por mensagem não devem ser levados em conta',
          'Confirmar por outro canal (ligação) antes de agir, pois a conta pode ter sido invadida'
        ], 'Origem conhecida não prova identidade: a conta pode estar sob controle de um golpista. Confirmar por outro canal é verificar. Ignorar todos os pedidos seria exagero.'),
        fill('q8', 'Complete: usar várias camadas de proteção, de modo que, se uma falhar, as outras seguram, é a defesa em ___.', 'defesa em ___', ['profundidade', 'camadas'], 'Defesa em profundidade combina camadas diferentes que se complementam.')
      ]
    },
    {
      id: 'csb-23-identificacao-autenticacao-autorizacao-auditoria',
      title: 'Identificação, autenticação, autorização e auditoria',
      goal: 'Diferenciar os quatro conceitos de acesso (AAA), reconhecer os riscos de contas compartilhadas e entender o papel das contas de serviço.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Quatro perguntas de cada acesso',
            'Toda vez que alguém usa um sistema, quatro perguntas aparecem, e cada uma é um conceito diferente. Quem diz que é? (identificação). Prova que é mesmo? (autenticação). O que pode fazer? (autorização). O que fez? (auditoria). Esses conceitos são frequentemente misturados, e entender a diferença evita muitos erros de segurança. Autenticação, autorização e auditoria formam o chamado AAA (do inglês authentication, authorization, accounting).'
          ),
          sl(
            'Identificação e autenticação',
            'Identificação é dizer quem você é: seu nome de usuário, seu e-mail. É uma afirmação, e qualquer pessoa pode afirmar qualquer coisa. Autenticação é provar a afirmação, com algo que você sabe (senha), algo que você tem (celular, token) ou algo que você é (impressão digital, rosto). Exemplo no dia a dia: ao chegar na portaria, dizer "sou o Carlos do apartamento 12" é identificação; mostrar o documento ou ser reconhecido pelo porteiro é autenticação. Usar dois tipos de prova juntos é a MFA que você já estudou.',
            'Identificacao:  usuario@example.com\nAutenticacao:   senha + codigo do celular'
          ),
          sl(
            'Autorização: o que você pode fazer',
            'Depois de provar quem você é, o sistema decide o que você pode acessar e fazer: ler, escrever, apagar, aprovar. Isso é autorização, e é aqui que se aplica o menor privilégio. Exemplo: no prédio, o morador do apartamento 12 abre a porta dele, mas não a do 13. Um erro comum é achar que estar autenticado dá direito a tudo: autenticar só diz QUEM você é, não O QUE pode. Falhas de autorização acontecem, por exemplo, quando um usuário comum consegue ver dados de outro só porque está logado.'
          ),
          sl(
            'Auditoria: o que foi feito',
            'Auditoria (ou registro de atividades) é guardar um histórico de quem fez o quê e quando: quem entrou, quem apagou um arquivo, quem mudou uma permissão. Serve para investigar incidentes, detectar abusos, provar responsabilidade e cumprir exigências legais. Analogia: as câmeras e o livro de visitas do prédio. Para ser útil, o registro precisa ligar cada ação a UMA pessoa específica, e precisa ser protegido contra alteração, senão um invasor apaga seus rastros. Os logs são tema de uma lição própria mais adiante.'
          ),
          sl(
            'Contas compartilhadas: um problema de responsabilidade',
            'Conta compartilhada é uma única conta (por exemplo, "caixa" com uma só senha) usada por várias pessoas. Parece prático, mas causa problemas: se algo errado acontece, não dá para saber quem foi, ou seja, a auditoria perde o sentido; quando alguém sai da equipe, é preciso trocar a senha para todos; e o MFA fica difícil. A recomendação é uma conta por pessoa, com permissões adequadas ao papel. Sem rastreabilidade, ninguém é responsável, e os erros ou fraudes ficam sem solução.'
          ),
          sl(
            'Contas de serviço',
            'Contas de serviço são contas usadas por programas, e não por pessoas: por exemplo, o sistema de backup que acessa um servidor todas as noites, ou o site que acessa o banco de dados. Elas existem para que as automações funcionem. Os riscos: costumam ter senhas que ninguém troca, permissões amplas demais e ninguém responsável por elas. Cuidados: dar a cada serviço uma conta própria com o mínimo de permissão, guardar a senha ou chave em local seguro (nunca escrita no código ou numa planilha), trocar periodicamente, e nunca usar a conta de serviço para entrar como pessoa. Devem ser inventariadas, isto é, listadas, com um responsável definido.'
          )
        ]
      },
      questions: [
        mcq('q1', 'No acesso a um e-mail, digitar o endereço usuario@example.com na tela de login é qual conceito?', 'a', [
          'Identificação, pois afirma quem você é',
          'Autenticação, pois já prova quem você é',
          'Autorização, pois define o que você pode fazer',
          'Auditoria, pois registra o que você fez'
        ], 'O endereço apenas declara quem você diz ser. A prova vem com a senha ou o código (autenticação).'),
        mcq('q2', 'Qual é um exemplo de autenticação?', 'c', [
          'Dizer o nome de usuário na tela inicial',
          'Ler o histórico de acessos do sistema para ver quem apagou um arquivo e em que horário aconteceu',
          'Digitar a senha e o código do aplicativo no celular para provar que é você',
          'Receber permissão para editar uma pasta específica'
        ], 'Provar a identidade com senha e código é autenticação. Dizer o nome é identificação, ler o histórico é auditoria e ganhar permissão é autorização.'),
        mcq('q3', 'Luís entrou no sistema da empresa (autenticado), mas ao tentar abrir a folha de pagamento recebeu a mensagem "acesso negado". Qual conceito explica isso?', 'd', [
          'Falha de identificação, porque o sistema não sabe quem ele é',
          'Falha de auditoria, pois o log não foi gravado',
          'Falha de autenticação, pois a senha dele estava errada e o sistema não conseguiu confirmar a identidade',
          'Autorização: ele provou quem é, mas não tem permissão para aquele recurso'
        ], 'Se ele entrou, a autenticação funcionou. A negativa vem da autorização, que define o que cada pessoa pode acessar.'),
        fill('q4', 'Complete: guardar um histórico de quem fez o quê e quando, para investigar depois, é chamado de ___.', 'histórico de quem fez o quê e quando = ___', ['auditoria', 'registro', 'log'], 'Auditoria (registro de atividades) permite investigar e responsabilizar. Depende de logs e de contas individuais.'),
        mcq('q5', 'Por que contas compartilhadas, como uma única conta "caixa" para cinco pessoas, são um problema?', 'b', [
          'Porque o sistema só aceita um usuário por vez, e isso causa lentidão geral, travamentos e perda de trabalho da equipe',
          'Porque não é possível saber quem realizou cada ação, e a troca de pessoas exige trocar a senha para todos',
          'Porque contas compartilhadas não aceitam senhas fortes, só curtas',
          'Porque a lei proíbe qualquer tipo de conta compartilhada em todas as situações'
        ], 'Sem contas individuais a auditoria perde a rastreabilidade. As outras afirmações são falsas ou exageradas.'),
        mcq('q6', 'Qual cuidado é adequado para uma conta de serviço usada pelo sistema de backup?', 'a', [
          'Dar apenas as permissões necessárias ao backup e guardar a senha em local seguro',
          'Dar permissão de administrador total, para evitar erros de acesso durante a noite',
          'Escrever a senha dentro do código, para que o sistema a encontre rápido',
          'Usar a conta de serviço também para o gestor entrar manualmente quando precisar'
        ], 'Menor privilégio e segredo bem guardado reduzem risco. Permissão total, senha no código e uso por pessoas misturam responsabilidades.'),
        mcq('q7', 'Ao pensar em um sistema que registra um login, uma exclusão e uma mudança de permissão, qual propriedade é essencial para a auditoria ser confiável?', 'c', [
          'Que os registros sejam editáveis por qualquer usuário, para que cada pessoa possa corrigir eventuais erros depois',
          'Que cada ação seja registrada com o nome de uma conta de grupo',
          'Que cada ação seja ligada a uma pessoa e o registro seja protegido contra alteração',
          'Que os registros sejam apagados a cada semana para economizar espaço'
        ], 'Um registro útil identifica o responsável e não pode ser adulterado. Contas de grupo e registros apagáveis anulam o valor da auditoria.'),
        fill('q8', 'Complete: provar que você é quem diz ser, com senha, código ou biometria, é a ___.', 'provar quem você é = ___', ['autenticação', 'autenticacao'], 'Autenticação é a prova da identidade; diferente de dizer quem é (identificação) e de definir permissões (autorização).')
      ]
    },
    {
      id: 'csb-24-gestao-de-riscos-basica',
      title: 'Gestão de riscos básica',
      goal: 'Aprender a identificar ativos, avaliar risco por probabilidade e impacto, montar uma matriz simples e escolher entre aceitar, mitigar, transferir ou evitar.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é risco',
            'Risco é a chance de algo ruim acontecer combinada com o tamanho do estrago que ele causaria. Não dá para eliminar todos os riscos nem proteger tudo igualmente: dinheiro, tempo e atenção são limitados. A gestão de riscos é o jeito organizado de decidir ONDE aplicar proteção primeiro. É como decidir o seguro de uma casa: a chance de enchente num morro é baixa, de roubo em rua movimentada pode ser maior, e o valor do que se perde também varia.'
          ),
          sl(
            'Passo 1: ativos',
            'Ativo é qualquer coisa que tem valor para você ou sua organização e precisa de proteção: dados de clientes, o computador do caixa, o site da loja, a reputação, o acesso ao e-mail da empresa, as pessoas que sabem operar os sistemas. O primeiro passo é listar os ativos e perguntar o quanto cada um vale e o que acontece se for perdido, roubado, alterado ou ficar indisponível (lembre-se da tríade confidencialidade, integridade e disponibilidade). Sem saber o que você tem, não dá para saber o que proteger.'
          ),
          sl(
            'Passo 2: ameaças, vulnerabilidades e risco',
            'Ameaça é algo que pode causar dano (um golpista, um vírus, uma queda de energia, um funcionário distraído). Vulnerabilidade é uma fraqueza que a ameaça pode explorar (senha fraca, sistema desatualizado, ausência de backup). Risco nasce do encontro das duas sobre um ativo: por exemplo, "golpista (ameaça) + senha fraca do e-mail (vulnerabilidade) = risco de perder o acesso à conta da loja (ativo)". Se não há ameaça ou não há vulnerabilidade, o risco é menor.'
          ),
          sl(
            'Passo 3: probabilidade x impacto e a matriz',
            'Para comparar riscos, estime duas coisas em notas simples (baixo, médio, alto): a probabilidade (quão provável é acontecer) e o impacto (quão grave seria). Multiplique ou combine as duas numa matriz. Alta probabilidade e alto impacto: prioridade máxima. Baixa probabilidade e baixo impacto: pode esperar. As estimativas são julgamentos, não ciência exata, mas o exercício obriga a priorizar. Atenção: baixa probabilidade com impacto altíssimo (por exemplo, perda total dos dados sem backup) também merece cuidado.',
            '            Impacto baixo | medio  | alto\nProb. alta     medio        | alto   | CRITICO\nProb. media    baixo        | medio  | alto\nProb. baixa    baixo        | baixo  | medio'
          ),
          sl(
            'Passo 4: como tratar o risco',
            'Existem quatro respostas clássicas. MITIGAR: reduzir probabilidade ou impacto com controles (ativar MFA, fazer backup). TRANSFERIR: passar parte do risco para outra parte, como contratar um seguro ou um serviço especializado. EVITAR: deixar de fazer a atividade que cria o risco (não guardar o número do cartão do cliente, se não for necessário). ACEITAR: reconhecer o risco e conviver com ele, de forma consciente e documentada, normalmente quando o custo de tratar é maior que o dano possível. Aceitar não é ignorar: é uma decisão registrada.'
          ),
          sl(
            'Exemplo: uma pequena loja',
            'A loja da Dona Célia tem o computador do caixa, uma planilha de clientes (nomes e telefones fictícios) e uma conta de e-mail. Risco A: o e-mail usa senha fraca (probabilidade média, impacto alto): MITIGAR com senha forte e MFA. Risco B: queda de energia (probabilidade média, impacto baixo): ACEITAR, com um nobreak simples. Risco C: roubo do computador com dados de clientes (probabilidade baixa, impacto alto): MITIGAR com backup e senha no equipamento, e talvez TRANSFERIR com seguro. Risco D: guardar cartão em papel: EVITAR, não guardando. Depois de tratar, revisa-se de tempos em tempos, pois os riscos mudam.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual das opções descreve melhor o que é risco?', 'd', [
          'Uma falha tecnológica que já aconteceu e causou prejuízo financeiro e de reputação à empresa',
          'Qualquer pessoa que tente invadir um sistema',
          'A lista de senhas que a empresa usa nos seus sistemas',
          'A combinação da chance de algo ruim acontecer com o tamanho do dano que causaria'
        ], 'Risco combina probabilidade e impacto. Algo que já aconteceu é um incidente; o invasor é a ameaça; e senhas não definem risco.'),
        mcq('q2', 'Em um e-mail de empresa com senha fraca e sem MFA, o que é a vulnerabilidade?', 'b', [
          'O golpista que tenta adivinhar a senha',
          'A senha fraca e a falta de MFA',
          'A perda do acesso ao e-mail e aos clientes',
          'O e-mail da empresa em si, como ativo'
        ], 'Vulnerabilidade é a fraqueza explorável: senha fraca e falta de MFA. O golpista é a ameaça, e a perda de acesso é o impacto; o e-mail é o ativo.'),
        mcq('q3', 'Um risco tem probabilidade alta e impacto alto. Como ele deve ser tratado na priorização?', 'a', [
          'Com prioridade máxima, entre os primeiros a receber controles',
          'Pode esperar, pois só riscos de impacto baixo precisam de atenção',
          'Deve ser aceito, pois quanto mais alto o risco, mais caro o tratamento',
          'Deve ser ignorado, pois a matriz só serve para riscos de probabilidade baixa'
        ], 'O canto da matriz com probabilidade e impacto altos é o mais crítico. Aceitar sem pensar ou ignorar não é gestão de riscos.'),
        fill('q4', 'Complete: reduzir a probabilidade ou o impacto de um risco com controles (como MFA e backup) é ___ o risco.', 'reduzir com controles = ___ o risco', ['mitigar', 'mitigação', 'mitigacao'], 'Mitigar é reduzir o risco com controles. Transferir, evitar e aceitar são as outras respostas.'),
        mcq('q5', 'Uma loja contrata um seguro contra roubo de equipamentos. Que tratamento de risco é esse?', 'c', [
          'Evitar, porque a loja deixou de ter equipamentos e portanto de correr qualquer risco de roubo',
          'Aceitar, porque a loja decidiu não fazer nada',
          'Transferir, porque parte do prejuízo passa para a seguradora',
          'Mitigar totalmente, porque o roubo deixa de ser possível'
        ], 'Seguro repassa parte da perda a outra parte: é transferência. Ele não impede o roubo (não é mitigação total) nem elimina a atividade (não é evitar).'),
        mcq('q6', 'A loja decide não guardar o número do cartão de crédito dos clientes, porque não precisa dele para vender. Que tratamento é esse?', 'b', [
          'Transferir o risco para uma seguradora, pagando um valor mensal para dividir o prejuízo',
          'Evitar o risco, eliminando a atividade que o cria',
          'Aceitar o risco de forma documentada',
          'Mitigar com criptografia dos números guardados'
        ], 'Parar de coletar o dado elimina a atividade de risco, o que é evitar. Criptografar seria mitigar, e aceitar significaria continuar com o risco.'),
        mcq('q7', 'Por que listar os ativos é o primeiro passo da gestão de riscos?', 'd', [
          'Porque ativos são computadores antigos e devem ser trocados',
          'Porque a lei exige a listagem de ativos para qualquer pessoa, seja em casa ou numa empresa de qualquer porte',
          'Porque sem listar ativos não se pode estimar a probabilidade de nada',
          'Porque sem saber o que tem valor, não dá para decidir o que proteger primeiro'
        ], 'Ativos podem ser dados, pessoas, reputação e mais. O objetivo da lista é saber o que proteger e priorizar, e não há obrigação legal universal citada.'),
        fill('q8', 'Complete: conviver conscientemente com um risco, com decisão registrada, porque tratar custa mais que o dano, é ___ o risco.', 'conviver de forma consciente com o risco = ___ o risco', ['aceitar', 'aceitação', 'aceitacao'], 'Aceitar é decisão consciente e documentada, diferente de ignorar.')
      ]
    }
,
    {
      id: 'csb-25-frameworks-nist-iso-cis',
      title: 'Frameworks de segurança: NIST, ISO 27001 e CIS Controls',
      goal: 'Entender o que é um framework de segurança e como NIST CSF, ISO/IEC 27001 e CIS Controls se diferenciam e se complementam.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que existem frameworks',
            'Um framework (estrutura de referência) é um guia organizado de boas práticas, criado por especialistas, para que você não precise inventar a segurança do zero nem esquecer coisas importantes. Pense numa receita de cozinha ou numa lista de verificação de um piloto antes da decolagem: ela não voa o avião por você, mas evita que itens essenciais sejam esquecidos. Frameworks também criam um vocabulário comum: quando duas empresas dizem que seguem o mesmo guia, entendem mais facilmente o que a outra faz. Você não precisa decorar nada para a vida pessoal, mas precisa saber que eles existem, pois aparecem em empregos, contratos e auditorias.'
          ),
          sl(
            'NIST CSF: um mapa em funções',
            'O NIST é um órgão de padrões dos Estados Unidos, e o seu Cybersecurity Framework (CSF) é um guia gratuito e muito usado em vários países. Organiza a segurança em grandes funções, que podem ser lidas como etapas de um ciclo: conhecer e governar o que se tem e o que se arrisca, identificar ativos e riscos, proteger, detectar problemas, responder a incidentes e recuperar-se. É flexível: serve para uma empresa pequena ou grande, e não obriga a nenhum produto específico. Ele descreve O QUE fazer em alto nível, não COMO em detalhe técnico.',
            'Governar -> Identificar -> Proteger -> Detectar -> Responder -> Recuperar'
          ),
          sl(
            'ISO/IEC 27001: gestão e certificação',
            'A ISO/IEC 27001 é uma norma internacional que descreve como montar e manter um Sistema de Gestão de Segurança da Informação (SGSI): um processo contínuo em que a organização define o escopo, avalia riscos, escolhe controles, executa, mede e melhora. Seu diferencial é que uma empresa pode ser certificada: uma entidade independente audita e emite um certificado se ela cumpre a norma. Isso é útil como prova para clientes e parceiros. Ela é uma norma paga e focada em gestão: exige processos, documentos, responsáveis e revisão periódica, e não só ferramentas.'
          ),
          sl(
            'CIS Controls: uma lista prática de ações',
            'Os CIS Controls são uma lista priorizada de ações de segurança concretas, publicada pelo Center for Internet Security. Em vez de grandes conceitos, trazem passos objetivos: saber quais aparelhos e programas existem (inventário), configurar com segurança, controlar contas e acessos, gerenciar atualizações, fazer backups, treinar pessoas, entre outros. Costumam ser organizados em grupos de implementação, para que uma organização pequena comece pelo básico e evolua. Por serem diretos, são um bom ponto de partida prático.'
          ),
          sl(
            'Como se diferenciam e se complementam',
            'Uma forma simples de lembrar: o NIST CSF é o mapa geral (o que cobrir, de forma flexível); a ISO 27001 é o sistema de gestão certificável (como gerir e provar que gere); o CIS Controls é a lista de tarefas práticas (por onde começar a agir). Uma pequena loja pode usar o CIS para começar o básico. Uma empresa que precisa de um selo para fechar contratos olha a ISO. Quem quer organizar o programa de segurança e conversar com a direção pode usar o NIST. Nenhum é obrigatório por si só para todos, e você pode combiná-los. Para tratar dados pessoais no Brasil, a LGPD é lei, e os frameworks ajudam a cumprir parte das medidas.'
          ),
          sl(
            'Erros comuns',
            'Achar que seguir um framework é o mesmo que estar seguro: ele é um guia; a segurança vem de aplicar e manter. Tentar fazer tudo de uma vez: comece pelo básico e priorizado. Confundir norma com lei: frameworks e normas são referências, enquanto leis são obrigatórias por força legal (a LGPD é lei). Pensar que certificação garante ausência de incidentes: ela atesta que há um sistema de gestão funcionando, não que nada vai dar errado. Neste curso não citamos versões, pois elas são revisadas ao longo do tempo: consulte sempre a versão mais atual.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Para que serve um framework de segurança?', 'c', [
          'Para substituir a necessidade de ter qualquer ferramenta de proteção, já que o guia resolve tudo sozinho',
          'Para substituir, por si só, o uso de ferramentas e de pessoas treinadas',
          'Para guiar a organização com boas práticas e um vocabulário comum, evitando esquecer itens',
          'Para obrigar todas as empresas do mundo a usarem o mesmo produto de segurança'
        ], 'Framework é um guia de referência. Não elimina a necessidade de ferramentas, não garante ausência de incidentes e não obriga a produto específico.'),
        mcq('q2', 'Qual dos três é conhecido por permitir certificação por uma entidade independente?', 'b', [
          'CIS Controls, a lista priorizada de ações práticas, organizada em grupos de implementação',
          'ISO/IEC 27001',
          'NIST CSF',
          'LGPD'
        ], 'A ISO/IEC 27001 pode ser certificada por auditoria independente. O CIS e o NIST CSF são guias, e a LGPD é uma lei, não um framework certificável.'),
        mcq('q3', 'A padaria do Seu Jorge quer um ponto de partida prático, com ações simples (inventário de aparelhos, backup, atualizações). Qual referência combina mais com isso?', 'a', [
          'CIS Controls, com ações concretas e priorizadas',
          'ISO 27001 completa e certificação já no primeiro mês',
          'A ISO 27001, pois ela traz uma lista curta de ações para quem começa',
          'A LGPD, que lista as ferramentas a comprar'
        ], 'O CIS traz ações objetivas e priorizadas, adequadas a quem começa. A ISO exige gestão formal, e a LGPD é lei, não lista de ferramentas.'),
        fill('q4', 'Complete: a ISO/IEC 27001 descreve como montar e manter um Sistema de ___ de Segurança da Informação (SGSI).', 'Sistema de ___ de Segurança da Informação', ['gestão', 'gestao'], 'A norma trata de gestão: um processo contínuo de definir escopo, avaliar riscos, tratar e melhorar.'),
        mcq('q5', 'Qual é a melhor leitura da diferença entre NIST CSF e CIS Controls?', 'd', [
          'O NIST CSF é um produto pago e o CIS Controls é um antivírus gratuito que cuida das mesmas tarefas',
          'O NIST CSF vale só para bancos e o CIS Controls só para escolas',
          'Os dois são idênticos e se diferem pelo país de origem',
          'O NIST CSF é um mapa de funções em alto nível; o CIS Controls é uma lista de ações práticas'
        ], 'O CSF organiza o programa em funções gerais; o CIS detalha ações concretas. Nenhum é produto, e ambos se aplicam a diversos tipos de organização.'),
        mcq('q6', 'Uma empresa tem certificação ISO 27001 e sofre um incidente. Isso contradiz o significado da certificação?', 'b', [
          'Sim, pois a certificação garante que incidentes são impossíveis',
          'Não, a certificação atesta que existe um sistema de gestão funcionando, não que nada acontecerá',
          'Sim, pois a certificação só vale se a empresa tiver mais de mil funcionários e nunca sofrer nenhum problema',
          'Não, mas só porque a lei proíbe que incidentes sejam registrados'
        ], 'Certificação mostra processos de gestão auditados; ela não impede todo incidente. As demais alternativas inventam regras.'),
        mcq('q7', 'Qual afirmação confunde norma e lei?', 'c', [
          'A LGPD é uma lei e vale para quem trata dados pessoais no Brasil',
          'Um framework é uma referência de boas práticas, adotada voluntariamente na maioria dos casos',
          'A ISO 27001 é lei federal e todo cidadão é obrigado a cumpri-la',
          'Contratos podem exigir que o fornecedor siga determinado framework'
        ], 'A ISO 27001 é uma norma voluntária, não uma lei. A LGPD, essa sim, é lei; e contratos podem exigir práticas específicas.'),
        fill('q8', 'Complete com a função do NIST CSF que trata de enxergar problemas em andamento: Governar, Identificar, Proteger, ___, Responder, Recuperar.', 'Governar, Identificar, Proteger, ___, Responder, Recuperar', ['detectar'], 'Detectar é a função que procura sinais de que algo ruim está acontecendo, para depois responder.')
      ]
    },
    {
      id: 'csb-26-etica-lei-hacking-responsavel',
      title: 'Ética, lei e hacking responsável',
      goal: 'Entender o papel da autorização, ter uma visão geral das leis brasileiras relacionadas, e conhecer a divulgação responsável e o hacker ético.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Autorização é a linha que separa ética de crime',
            'As técnicas que um profissional de segurança usa para testar um sistema podem ser as mesmas que um criminoso usa. O que muda é a AUTORIZAÇÃO: o profissional tem permissão clara, por escrito, do dono do sistema, definindo o que pode ser testado, quando e como. Sem permissão, testar sistemas de outras pessoas, mesmo por curiosidade ou "para ajudar", pode ser crime e causar dano real. Regra de ouro deste curso: só teste o que é SEU ou o que você tem autorização por escrito para testar. Aviso: esta lição é uma visão geral educativa e NÃO substitui orientação de um advogado.'
          ),
          sl(
            'Lei 12.737/2012 e Lei 14.155/2021 (visão geral)',
            'A Lei 12.737/2012, conhecida como Lei Carolina Dieckmann, incluiu no Código Penal o crime de invasão de dispositivo informático alheio, conectado ou não à internet, para obter, adulterar ou destruir dados sem autorização. A Lei 14.155/2021 endureceu penas de crimes cometidos por meio de dispositivos eletrônicos, como a invasão de dispositivos e as fraudes eletrônicas. Ideia central: acessar sistema ou dispositivo de outra pessoa sem autorização, driblando proteções, pode ser crime. Os detalhes (penas, condições) mudam com a interpretação e a atualização das leis: consulte fontes oficiais ou um advogado para qualquer caso concreto.'
          ),
          sl(
            'Marco Civil e LGPD (visão geral)',
            'O Marco Civil da Internet (Lei 12.965/2014) estabelece princípios, direitos e deveres para o uso da internet no Brasil, como a proteção da privacidade e a guarda de registros de acesso por provedores. A LGPD (Lei 13.709/2018) regula o tratamento de dados pessoais: quem coleta dados deve ter uma finalidade clara, coletar só o necessário e protegê-los com medidas de segurança. Para quem trabalha com segurança, a LGPD importa de duas formas: proteger dados pessoais é um dever, e, em testes autorizados, é preciso evitar copiar ou expor dados reais de pessoas. De novo: é um resumo, não um parecer jurídico.'
          ),
          sl(
            'Hacker ético e divulgação responsável',
            'Hacker ético (ou profissional de testes de intrusão) é quem testa sistemas COM autorização, relata o que encontrou e ajuda a corrigir. Seu trabalho segue regras: escopo definido, nada de ir além do combinado, sigilo sobre o que descobre, e cuidado para não causar danos. Divulgação responsável é o que se faz ao encontrar uma falha por acaso ou em programas públicos de recompensa: avisar a organização de forma privada e organizada, dar prazo razoável para corrigir, e só divulgar detalhes depois, sem expor dados de pessoas nem explorar a falha além do necessário para provar que existe. Muitas empresas têm um canal de contato para isso, e alguns programas de recompensa (bug bounty) têm regras públicas de participação.'
          ),
          sl(
            'O que NÃO fazer, mesmo com boa intenção',
            'Se você acha uma falha num site, NÃO tente "ver até onde dá", baixar dados, mexer em contas de outras pessoas nem postar publicamente: isso pode configurar crime e prejudicar quem você queria ajudar. O caminho certo: parar, não explorar além do mínimo, registrar de forma simples o que viu (sem coletar dados de terceiros) e avisar o responsável pelos canais oficiais (e-mail de segurança do site, página de contato, programa de recompensa). Na dúvida, peça orientação a alguém experiente ou a um advogado antes de agir.'
          ),
          sl(
            'Onde treinar legalmente',
            'Para aprender técnicas você precisa praticar, mas em lugares permitidos: seu laboratório local com máquinas virtuais suas (próxima lição), aplicações propositalmente vulneráveis feitas para treino, plataformas de treino que declaram abertamente que você pode atacar os ambientes delas, e competições de segurança do tipo CTF. O que todas têm em comum: o dono do ambiente DEIXOU claro que o ataque é permitido. Se você não consegue apontar essa permissão, não faça.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que diferencia um profissional de testes de segurança de um criminoso que usa as mesmas técnicas?', 'a', [
          'A autorização clara, por escrito, do dono do sistema, com escopo definido',
          'A marca do programa utilizado nos testes, que no caso do profissional é sempre paga',
          'O horário em que os testes são feitos, geralmente à noite para o criminoso',
          'O tipo de computador usado, que deve ser sempre um notebook profissional'
        ], 'A autorização é a linha divisória. Técnica, ferramenta ou horário por si só não tornam algo legal ou ilegal.'),
        mcq('q2', 'Sobre a Lei 12.737/2012, qual descrição geral está correta?', 'b', [
          'Trata exclusivamente da proteção de dados pessoais por empresas',
          'Incluiu no Código Penal o crime de invasão de dispositivo informático alheio',
          'Regula a guarda de registros de acesso feita pelos provedores de internet e o prazo de armazenamento',
          'Permite testar qualquer sistema desde que o objetivo seja educacional'
        ], 'A Lei 12.737/2012 trata de invasão de dispositivo alheio. Dados pessoais são tema da LGPD e registros de acesso, do Marco Civil; objetivo educacional não substitui autorização.'),
        mcq('q3', 'Qual lei trata principalmente do tratamento de dados pessoais, com finalidade, minimização e medidas de segurança?', 'd', [
          'Marco Civil da Internet',
          'Lei 12.737/2012',
          'Lei 14.155/2021',
          'LGPD, Lei 13.709/2018'
        ], 'A LGPD regula o tratamento de dados pessoais. As outras tratam de princípios da internet e de crimes eletrônicos.'),
        fill('q4', 'Complete: acessar o sistema de outra pessoa sem ___ pode ser crime, mesmo por curiosidade.', 'sem ___ pode ser crime', ['autorização', 'autorizacao', 'permissão', 'permissao'], 'Sem autorização do dono, o acesso a sistemas alheios pode configurar crime, qualquer que seja a intenção.'),
        mcq('q5', 'Júlia percebe que um site de uma loja mostra pedidos de outros clientes ao alterar um número na barra de endereço. Qual é a atitude responsável?', 'c', [
          'Continuar mudando os números para descobrir até onde vai e depois publicar uma prova nas redes',
          'Baixar todos os pedidos para mostrar à loja o tamanho do problema',
          'Parar, não coletar dados e avisar a loja pelos canais oficiais',
          'Ignorar e comprar em outro lugar, sem avisar ninguém'
        ], 'Divulgação responsável: não explorar além do mínimo, não coletar dados de terceiros e avisar o responsável. Ignorar deixa os clientes expostos, e publicar ou baixar dados é abuso.'),
        mcq('q6', 'O que é divulgação responsável?', 'b', [
          'Publicar a falha imediatamente em redes sociais para pressionar a empresa',
          'Avisar a organização de modo privado, dar prazo razoável para corrigir e só então falar publicamente, sem expor dados',
          'Vender a informação da falha ao maior interessado',
          'Guardar a falha em segredo para sempre, sem contar a ninguém'
        ], 'Aviso privado e prazo razoável protegem os usuários e permitem a correção. Publicar de imediato expõe pessoas, vender é abuso e silenciar mantém o risco.'),
        mcq('q7', 'Qual ambiente é legítimo para praticar técnicas de ataque?', 'a', [
          'Uma máquina virtual sua, com aplicação propositalmente vulnerável, isolada da rede',
          'O site da sua escola, para ver se o sistema é seguro, sem avisar a ninguém',
          'A rede Wi-Fi do vizinho, já que a senha é fraca e é fácil de adivinhar com um programa qualquer',
          'O sistema da empresa de um conhecido, que talvez não se importe'
        ], 'Laboratório próprio é permitido. As outras opções envolvem sistemas alheios sem autorização, mesmo que pareça inofensivo.'),
        fill('q8', 'Complete: o profissional que testa sistemas COM autorização, relata e ajuda a corrigir é chamado de hacker ___.', 'hacker ___ (testa com autorização)', ['ético', 'etico'], 'Hacker ético trabalha com permissão, escopo definido e relatório responsável.')
      ]
    },
    {
      id: 'csb-27-laboratorio-seguro',
      title: 'Laboratório seguro para aprender',
      goal: 'Entender o que são máquinas virtuais e snapshots, como isolar um laboratório e onde praticar de forma legal.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que ter um laboratório',
            'Segurança se aprende fazendo, mas fazer errado no seu computador do dia a dia pode estragá-lo, ou pior, fazer algo contra sistemas de outras pessoas. A solução é montar um laboratório: um ambiente separado, só seu, onde você pode instalar, quebrar e recomeçar sem riscos. Pense num campo de treinamento de bombeiros: o fogo é real o bastante para ensinar, mas está numa área controlada, longe da cidade. Também é o jeito mais seguro de analisar um programa suspeito ou testar uma configuração antes de aplicar na vida real.'
          ),
          sl(
            'Máquina virtual: um computador dentro do computador',
            'Uma máquina virtual (VM) é um computador simulado por software, que roda dentro do seu computador real, com seu próprio sistema operacional, discos e rede virtuais. O computador real é o hospedeiro (host) e a VM é a convidada (guest). Programas conhecidos como virtualizadores criam e executam VMs. Vantagens: o que acontece dentro da VM, por padrão, não mexe no hospedeiro; você pode ter vários sistemas (Windows, Linux) sem formatar o aparelho; e pode apagar tudo e recomeçar. Limite: uma VM mal configurada pode compartilhar pastas ou rede com o hospedeiro, e aí o isolamento diminui.'
          ),
          sl(
            'Snapshots: o botão de desfazer',
            'Um snapshot é uma foto do estado da VM em um momento: discos, configurações, e, em alguns casos, a memória. Depois de fazer algo (instalar um programa, testar uma configuração), você pode voltar exatamente ao estado do snapshot em segundos. Boa prática: instalar e configurar a VM limpa, tirar um snapshot chamado "limpo", e voltar a ele sempre que bagunçar. Snapshot não é backup de longo prazo: ele fica junto da VM, e se o disco do hospedeiro falhar, os dois se perdem.'
          ),
          sl(
            'Isolamento de rede',
            'O principal cuidado de um laboratório é controlar a rede da VM. Opções comuns: sem rede (totalmente isolada), rede interna só entre VMs do laboratório (as VMs conversam entre si, mas não com o mundo), ou rede com acesso à internet por meio do hospedeiro (para baixar atualizações). Para treinar com sistemas vulneráveis de propósito, a regra é usar rede interna ou só para o hospedeiro, para que eles NÃO fiquem acessíveis a outras pessoas da sua casa nem à internet. Um sistema vulnerável exposto na internet acaba sendo invadido por robôs em pouco tempo. Evite também pastas compartilhadas e a área de transferência compartilhada entre VM e hospedeiro quando analisar algo suspeito.',
            'VM atacada  <-->  VM de treino   (rede interna)\n      X (sem caminho)   X\n  Internet / sua rede domestica'
          ),
          sl(
            'Nunca teste sistemas alheios',
            'O laboratório existe para que você NÃO precise testar sistemas de terceiros. Varreduras e testes em redes, sites ou aparelhos que não são seus, sem autorização por escrito, podem ser crime e causar dano real, mesmo que a sua intenção fosse boa. Isso inclui o roteador do vizinho, o Wi-Fi do trabalho e sites de empresas. Se você quer um alvo para treinar, use a sua própria VM ou uma plataforma que permita expressamente o treino.'
          ),
          sl(
            'Onde treinar legalmente',
            'Além do seu laboratório, existem aplicações propositalmente vulneráveis, criadas para quem aprende (você as roda na sua VM), e plataformas online de treino que oferecem ambientes autorizados, com regras públicas, e competições do tipo CTF (Capture The Flag), em que se resolvem desafios para achar uma "bandeira". Antes de usar qualquer plataforma leia os termos: atacar somente o que ela permite. Cuide também da sua conta nelas, com senha forte e MFA, e use dados fictícios, nunca seus dados reais.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que é uma máquina virtual?', 'd', [
          'Um programa que acelera o computador real, trocando o processador por um modelo virtual mais potente',
          'Uma conta de usuário protegida por senha forte',
          'Um tipo de antivírus que roda na nuvem',
          'Um computador simulado por software que roda dentro do computador real'
        ], 'VM é um computador simulado dentro do hospedeiro. Ela não acelera o hardware nem é antivírus ou conta de usuário.'),
        mcq('q2', 'Para que serve um snapshot?', 'b', [
          'Para criptografar os arquivos da VM e impedir qualquer vazamento',
          'Para guardar o estado da VM e poder voltar a ele rapidamente',
          'Para transferir a VM pela internet até outro país',
          'Para apagar a VM definitivamente depois do uso'
        ], 'Snapshot guarda o estado e permite voltar a ele. Não criptografa, não transfere e não apaga.'),
        mcq('q3', 'Você vai treinar com um sistema propositalmente vulnerável dentro de uma VM. Qual configuração de rede é a mais segura?', 'c', [
          'Rede aberta à internet, para que amigos possam também treinar',
          'Rede em ponte com a rede da casa, para facilitar o acesso do celular',
          'Rede interna ou somente com o hospedeiro, sem caminho para a internet',
          'Qualquer uma serve, pois a VM é automaticamente isolada em todos os casos'
        ], 'Um sistema vulnerável exposto na internet ou na rede doméstica pode ser atacado por terceiros. A rede interna limita o acesso. O isolamento não é automático.'),
        fill('q4', 'Complete: o computador real que hospeda as máquinas virtuais é chamado de ___ (host).', 'computador real que hospeda as VMs = ___', ['hospedeiro', 'host', 'anfitrião', 'anfitriao'], 'O hospedeiro (host) é o computador físico; a VM é a convidada (guest).'),
        mcq('q5', 'Marcos quer ver se o roteador de um vizinho tem falhas, só por curiosidade. O que ele deve fazer?', 'a', [
          'Não fazer, pois testar aparelhos alheios sem autorização pode ser crime; treinar na própria VM',
          'Fazer rapidamente, pois a curiosidade é uma justificativa válida para testes',
          'Fazer, se o vizinho não estiver em casa e não perceber nenhuma mudança no funcionamento do aparelho dele',
          'Fazer, desde que use um computador emprestado para não deixar rastros'
        ], 'Sem autorização, testar equipamento de outra pessoa pode ser crime, independentemente da intenção. O laboratório próprio existe justamente para isso.'),
        mcq('q6', 'Qual cuidado ajuda a analisar um programa suspeito dentro de uma VM sem arriscar o computador real?', 'd', [
          'Ativar pastas compartilhadas com o hospedeiro, para copiar arquivos entre os dois sistemas com mais facilidade',
          'Deixar a área de transferência compartilhada, pois ela é segura por padrão',
          'Manter a VM conectada à rede doméstica para ver se o programa acessa algo',
          'Desligar ou limitar a rede, evitar pastas compartilhadas e ter um snapshot limpo para voltar'
        ], 'Pastas, área de transferência e rede compartilhadas diminuem o isolamento. Rede limitada e snapshot limpo ajudam a conter e desfazer.'),
        mcq('q7', 'Por que um snapshot não substitui um backup?', 'b', [
          'Porque snapshots só podem ser feitos uma vez por mês',
          'Porque ele fica junto da VM; se o disco do hospedeiro falhar, os dois se perdem',
          'Porque snapshots apagam as senhas da VM e por isso nunca podem ser usados como cópia de segurança',
          'Porque backups são feitos só em papel'
        ], 'O snapshot depende do mesmo armazenamento da VM, então não protege contra falha do disco. As outras opções inventam limitações.'),
        fill('q8', 'Complete: competições de segurança em que se resolvem desafios para achar uma bandeira são chamadas de ___ (Capture The Flag).', 'competição Capture The Flag = ___', ['ctf'], 'CTF significa Capture The Flag: desafios autorizados para treinar segurança.')
      ]
    },
    {
      id: 'csb-28-terminal-windows-linux-para-seguranca',
      title: 'Terminal para segurança: comandos básicos no seu computador',
      goal: 'Aprender a usar comandos simples do terminal para listar processos, ver conexões e calcular o hash de um arquivo, sempre no seu próprio computador.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é o terminal e por que usar',
            'O terminal (ou linha de comando) é uma tela onde você escreve comandos de texto em vez de clicar. No Windows existem o Prompt de Comando e o PowerShell; no Linux e no macOS, o terminal com o interpretador chamado shell (como o bash). Profissionais de segurança usam o terminal porque ele permite ver rapidamente o que o computador está fazendo e automatizar tarefas. Aviso importante: todos os comandos desta lição só LEEM informações do SEU computador. Nunca rode comandos que você não entende, copiados de uma página qualquer: um comando pode apagar arquivos ou baixar malware.'
          ),
          sl(
            'Listar processos',
            'Processo é um programa em execução. Ver a lista ajuda a perceber algo estranho (um programa que você não conhece usando muito processador). No Windows (PowerShell): Get-Process. No Linux: ps aux (mostra todos os processos). Olhe o nome e quanto recurso usam. Atenção: nome desconhecido não significa vírus; muitos processos do sistema têm nomes estranhos. Pesquise o nome antes de concluir qualquer coisa, e use o antivírus. A saída abaixo é ILUSTRATIVA (formato aproximado, dados fictícios) e muda de computador para computador.',
            '# Linux\nps aux\n# Windows PowerShell\nGet-Process\n\n# Saida ilustrativa (ps aux, fictícia):\nUSER   PID %CPU %MEM COMMAND\nana   1201  0.3  1.2 /usr/bin/firefox\nana   1544  0.0  0.1 /usr/bin/bash'
          ),
          sl(
            'Ver conexões de rede',
            'Para saber com quem o computador está conversando, use comandos que listam as conexões e as portas abertas. No Windows: netstat -ano (mostra conexões, estados e o número do processo dono). No Linux: ss -tuln mostra portas escutando (tcp, udp, listening, numérico). Como ler: Local é o seu lado, Remoto é o outro lado, e Estado indica se está escutando (LISTEN) ou conectado (ESTABLISHED). Serve para descobrir serviços abertos que você não precisa, e conexões estranhas. Lembre dos endereços de exemplo (como 192.0.2.10) usados em documentação: a saída abaixo é ILUSTRATIVA.',
            '# Linux\nss -tuln\n# Windows\nnetstat -ano\n\n# Saida ilustrativa (ss -tuln, ficticia):\nNetid State  Local Address:Port\ntcp   LISTEN 127.0.0.1:631\nudp   UNCONN 0.0.0.0:68'
          ),
          sl(
            'Hash de arquivo: conferir integridade',
            'Você viu que o hash é uma impressão digital de um arquivo: se o arquivo muda um único byte, o hash muda por completo. É assim que se confere se um arquivo baixado é o original (comparando com o hash publicado pelo site oficial). No Windows (PowerShell): Get-FileHash arquivo.zip -Algorithm SHA256. No Linux: sha256sum arquivo.zip. Se o resultado for igual ao publicado pela fonte oficial, o arquivo não foi alterado no caminho. Se for diferente, não use. Exemplo executado de verdade abaixo, com um texto minúsculo: o hash de "ola" em SHA-256.',
            '# Linux / Git Bash\nprintf ola | sha256sum\n\n# Saida real (executada; o valor e sempre o mesmo para o mesmo texto):\n55a9f4f8994b1bbf2058ea38c8efb6c459000814d5f39c087002571639e6230e *-'
          ),
          sl(
            'Boas práticas ao usar o terminal',
            'Rode comandos de leitura primeiro; entenda cada parte antes de executar. Use o nome do comando com a opção de ajuda (por exemplo, ss --help no Linux, ou Get-Help Get-Process no PowerShell) para aprender. Não use privilégios de administrador (sudo, "Executar como administrador") sem necessidade: é o princípio do menor privilégio. Nunca cole no terminal comandos de fontes que você não conhece. E lembre: esses comandos servem para entender o SEU computador. Usá-los para investigar ou testar máquinas alheias sem autorização é indevido, como visto na lição de ética e lei.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é o aviso mais importante antes de executar comandos copiados da internet no terminal?', 'c', [
          'Eles só funcionam se o computador estiver ligado à rede elétrica e conectado a um servidor da internet',
          'Todo comando de internet é seguro, desde que não peça senha',
          'Entender o que o comando faz antes de executar, pois ele pode apagar arquivos ou baixar malware',
          'Eles precisam ser rodados sempre como administrador'
        ], 'Comandos executam ações reais. Sem entendê-los, você pode danificar o sistema. Rodar como administrador sem necessidade aumenta o risco.'),
        mcq('q2', 'O que é um processo?', 'a', [
          'Um programa em execução no computador',
          'Um arquivo que ficou guardado no disco sem uso',
          'Uma senha armazenada pelo sistema',
          'Uma regra do firewall'
        ], 'Processo é um programa em execução. Arquivo parado, senha e regra de firewall são outros conceitos.'),
        mcq('q3', 'No Linux, qual comando mostra as portas em que o computador está escutando?', 'd', [
          'sha256sum',
          'ps aux',
          'Get-Process',
          'ss -tuln'
        ], 'O ss -tuln lista portas escutando. O sha256sum calcula hash, o ps aux lista processos, e Get-Process é do PowerShell.'),
        fill('q4', 'Complete: no Windows, o comando do PowerShell que calcula o hash de um arquivo é Get-___.', 'Get-___ arquivo.zip -Algorithm SHA256', ['filehash', 'FileHash'], 'Get-FileHash calcula o hash de um arquivo no PowerShell.'),
        mcq('q5', 'Você baixou um programa e o site oficial publica o hash SHA-256 dele. O hash calculado na sua máquina é diferente. O que isso indica?', 'b', [
          'Que o seu antivírus alterou o nome do arquivo sem querer',
          'Que o arquivo foi alterado ou corrompido e não deve ser usado',
          'Que a diferença é normal e pode ser ignorada, pois cada computador gera um hash diferente',
          'Que o site oficial está desatualizado há muitos anos'
        ], 'O mesmo arquivo gera o mesmo hash em qualquer computador. Diferença indica alteração ou corrupção. Não se ignora esse sinal.'),
        mcq('q6', 'Ao olhar a lista de processos você vê um nome que não conhece. Qual é a melhor atitude?', 'c', [
          'Concluir que é vírus e apagar a pasta do sistema onde ele está, para garantir que o problema seja eliminado',
          'Ignorar, pois processos desconhecidos nunca têm importância',
          'Pesquisar o nome em fontes confiáveis, ver o que o processo faz e, se continuar suspeito, usar o antivírus',
          'Reinstalar o computador imediatamente, sem investigar mais nada'
        ], 'Nomes estranhos são comuns em processos legítimos. Investigue com calma. Apagar pastas do sistema ou reinstalar sem investigar é exagero, e ignorar tudo é arriscado.'),
        mcq('q7', 'Em uma saída de conexões, o estado LISTEN em uma porta significa:', 'b', [
          'Que o computador está baixando um arquivo grande da internet',
          'Que um serviço está aguardando conexões naquela porta',
          'Que a conexão foi bloqueada pelo firewall',
          'Que a porta está fechada e segura'
        ], 'LISTEN indica que um serviço escuta e aguarda conexões. Não é download, bloqueio nem porta fechada.'),
        fill('q8', 'Complete: no Linux, o comando que calcula o hash SHA-256 de um arquivo é ___.', 'sha256sum arquivo.zip  # comando: ___', ['sha256sum'], 'O sha256sum calcula o hash SHA-256 de arquivos no Linux.')
      ]
    },
    {
      id: 'csb-29-logs-e-eventos',
      title: 'Logs e eventos: o diário do computador',
      goal: 'Entender o que são logs e eventos, onde existem, o que significa um login falho, por que guardá-los e por quanto tempo, com atenção à privacidade.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que são logs e eventos',
            'Evento é algo que aconteceu: alguém entrou, um programa falhou, um arquivo foi apagado. Log (registro) é o diário em que esses eventos ficam anotados, em geral com data e hora, o que aconteceu e quem ou o que causou. Pense no caderno do porteiro do prédio, que anota quem entrou e saiu. Para segurança, logs são a principal fonte para descobrir o que houve em um incidente, para perceber comportamentos estranhos e para provar responsabilidade (a auditoria que vimos antes).'
          ),
          sl(
            'Onde existem logs',
            'Quase tudo gera logs: o sistema operacional (Windows tem o Visualizador de Eventos; Linux guarda registros em arquivos e em um serviço de diário do sistema), os sites e aplicativos (quem acessou qual página), o roteador (quais aparelhos se conectaram), o firewall (o que foi bloqueado), o antivírus e os serviços de e-mail e nuvem (que costumam mostrar "atividade recente" ou "dispositivos conectados" na conta). Em casa, a tela de atividade recente de sua conta de e-mail é um log que você consegue consultar e que pode revelar um acesso que não foi seu.'
          ),
          sl(
            'Um evento de login falho: o que significa',
            'Um login falho é o registro de uma tentativa de entrar que não deu certo. Um ou dois, é normal: você errou a senha. Dezenas em poucos minutos, vindos de um lugar estranho, sugerem que alguém (ou um robô) está tentando adivinhar senhas. Um login bem-sucedido logo depois de muitas falhas é um sinal ainda mais sério: pode ser que adivinharam. Também chamam atenção logins em horários incomuns ou de países onde a pessoa nunca esteve. Interpretar logs é buscar padrões, não olhar linha por linha. Abaixo, um exemplo FICTÍCIO com dados inventados.',
            '2025-01-10 03:12:01 login FALHOU usuario=ana ip=198.51.100.7\n2025-01-10 03:12:03 login FALHOU usuario=ana ip=198.51.100.7\n2025-01-10 03:12:05 login FALHOU usuario=ana ip=198.51.100.7\n2025-01-10 03:12:08 login OK     usuario=ana ip=198.51.100.7'
          ),
          sl(
            'Por que guardar logs e por quanto tempo',
            'Sem logs, depois de um incidente ninguém sabe quando começou, o que foi atingido ou quem foi. Guardar logs permite investigar, aprender e responder. Mas logs podem conter dados pessoais (nomes de usuário, endereços IP, horários), então a LGPD pede atenção: guardar só o necessário, pelo tempo necessário à finalidade, protegendo o acesso e evitando registrar dados sensíveis, como senhas ou números de documentos, dentro do próprio log. Não existe um prazo único universal: depende da finalidade, de exigências legais e do risco. O Marco Civil da Internet prevê prazos de guarda de certos registros por provedores, mas para o seu caso consulte orientação jurídica.'
          ),
          sl(
            'Proteger os logs',
            'Um invasor tenta apagar ou alterar logs para esconder seus rastros. Por isso, em ambientes sérios, os logs são copiados para outro lugar, onde o invasor não alcança, e só poucas pessoas podem alterá-los. Também é importante que os relógios dos sistemas estejam corretos, para que os horários façam sentido ao juntar registros de lugares diferentes. Quando houver muito volume, empresas usam ferramentas que reúnem e analisam os registros automaticamente e geram alertas, assunto do curso intermediário.'
          ),
          sl(
            'O que fazer com o que você vê',
            'Em casa, o uso prático é olhar a atividade recente das suas contas (e-mail, nuvem, redes sociais) e a lista de aparelhos conectados. Viu algo que você não reconhece? Saia de todos os dispositivos, troque a senha, ative a MFA e siga o roteiro de resposta a incidentes (veremos adiante). Não apague nada antes de anotar o que viu, pois pode servir de evidência. Em uma empresa, avise o responsável de segurança em vez de tentar investigar por conta própria.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que é um log?', 'a', [
          'Um registro, com data e hora, dos eventos que aconteceram em um sistema',
          'Uma senha temporária gerada pelo sistema para cada acesso',
          'Um tipo de vírus que apaga arquivos do computador e se espalha por mensagens de e-mail',
          'Uma cópia de segurança de todos os arquivos do computador'
        ], 'Log é o diário de eventos. Não é senha, malware nem backup.'),
        mcq('q2', 'Qual situação em um log de login merece mais atenção?', 'd', [
          'Um único login falho, seguido do login correto logo depois',
          'Um login bem-sucedido no horário de trabalho normal do usuário, a partir do aparelho que ele sempre usa',
          'Um login em seu aparelho de costume e em seu bairro',
          'Dezenas de logins falhos em poucos segundos seguidos de um login bem-sucedido'
        ], 'Muitas falhas rápidas seguidas de sucesso sugerem adivinhação de senha. Um erro isolado e acessos habituais são normais.'),
        mcq('q3', 'Por que um invasor tenta apagar ou alterar os logs?', 'b', [
          'Porque logs ocupam muito espaço e deixam o computador lento',
          'Para esconder os rastros e dificultar a investigação',
          'Porque a lei obriga o apagamento imediato dos logs',
          'Porque logs são a única maneira de ele entrar no sistema'
        ], 'Os logs mostram o que aconteceu; apagá-los dificulta descobrir o invasor. A lei não obriga o apagamento imediato.'),
        fill('q4', 'Complete: o registro de uma tentativa de entrar que não deu certo é um login ___.', 'tentativa que não deu certo = login ___', ['falho', 'falhou', 'falha', 'fracassado'], 'Um login falho indica tentativa sem sucesso; muitos em sequência podem indicar tentativa de adivinhar senha.'),
        mcq('q5', 'Qual é uma preocupação de privacidade ao guardar logs?', 'c', [
          'Logs nunca contêm dados pessoais, então não há preocupação',
          'Todo log deve ser guardado para sempre, porque pode servir um dia, e apagar qualquer registro é considerado erro grave',
          'Eles podem conter dados pessoais, então guarde só o necessário, pelo tempo necessário, e proteja o acesso',
          'O ideal é gravar senhas completas nos logs para facilitar investigações'
        ], 'Logs podem ter nomes de usuário e endereços IP, que são dados pessoais. A LGPD pede finalidade, necessidade e segurança. Gravar senhas nos logs é um erro grave.'),
        mcq('q6', 'Você olha a atividade recente de seu e-mail e vê um acesso de uma cidade onde nunca esteve, em um aparelho desconhecido. O que fazer primeiro?', 'a', [
          'Sair dos dispositivos, trocar a senha, ativar MFA e anotar o que viu',
          'Ignorar, pois pode ser só uma pessoa da família',
          'Apagar a mensagem de alerta para não ficar preocupado e seguir usando a conta normalmente',
          'Esperar alguns dias para ver se acontece de novo'
        ], 'Acesso desconhecido pode ser invasão: agir rápido reduz o dano e anotar ajuda como evidência. Esperar ou ignorar dá tempo ao invasor.'),
        mcq('q7', 'Por que os relógios dos sistemas devem estar corretos ao analisar logs?', 'd', [
          'Porque relógios errados fazem os logs ficarem criptografados e impossíveis de ler por qualquer pessoa',
          'Porque o relógio define a senha de cada usuário',
          'Porque os logs só funcionam em horário comercial',
          'Para que os horários dos registros de lugares diferentes possam ser comparados e juntados'
        ], 'Em uma investigação os eventos de vários sistemas são alinhados pelo horário. Horários errados confundem a ordem dos fatos.'),
        fill('q8', 'Complete: dados de log como nome de usuário e endereço IP podem ser considerados dados ___, e por isso a LGPD é relevante.', 'nome e IP podem ser dados ___ (LGPD)', ['pessoais'], 'Informações que identificam ou podem identificar uma pessoa são dados pessoais; logs podem contê-las.')
      ]
    }
,
    {
      id: 'csb-30-trabalho-remoto-e-iot-domestico',
      title: 'Trabalho remoto e IoT doméstico',
      goal: 'Aplicar cuidados de segurança ao trabalhar de casa e ao usar dispositivos inteligentes (IoT), incluindo VPN corporativa, senhas padrão, câmeras e rede de visitas.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Quando a casa vira escritório',
            'No trabalho remoto, o computador da empresa e os dados dela passam a ficar na sua casa, numa rede que a equipe de TI não controla: seu Wi-Fi, seus aparelhos, sua família. Isso aumenta o risco, e a responsabilidade de proteger passa em parte para você. As boas práticas são conhecidas das lições anteriores, agora aplicadas ao contexto: aparelhos atualizados, senhas fortes e MFA, Wi-Fi com criptografia moderna e senha forte, bloqueio de tela, e atenção a golpes que se passam pela empresa (um e-mail do "chefe" pedindo urgência).'
          ),
          sl(
            'VPN corporativa',
            'Uma VPN (rede privada virtual) cria um túnel protegido entre o seu aparelho e a rede da empresa, como um corredor fechado dentro de uma rua movimentada. Com ela, dados que trafegam por redes não confiáveis ficam protegidos, e você acessa sistemas internos como se estivesse no escritório. Regras de bolso: use a VPN da empresa sempre que for orientado; não use o computador do trabalho para fins pessoais arriscados; não compartilhe o aparelho com familiares; e siga a política da empresa, que pode exigir aparelhos específicos. VPN comercial de consumo é outra coisa: ela esconde seu tráfego do Wi-Fi local, mas não o torna invisível nem anula riscos de phishing.'
          ),
          sl(
            'Separar o trabalho do pessoal',
            'Misturar vida pessoal e trabalho no mesmo aparelho e na mesma conta aumenta o risco: um jogo baixado de fonte duvidosa pode infectar o computador que acessa dados da empresa. Sempre que possível, use aparelhos separados ou perfis separados, não deixe filhos e visitas usarem o computador do trabalho, bloqueie a tela ao sair da mesa e não guarde documentos da empresa em serviços pessoais de nuvem. Se a empresa permitir o uso do seu aparelho pessoal (BYOD), siga as regras dela e mantenha tudo atualizado.'
          ),
          sl(
            'IoT: aparelhos inteligentes',
            'IoT (Internet das Coisas) são aparelhos comuns que se conectam à internet: câmeras, campainhas, TVs, lâmpadas, assistentes de voz, geladeiras, babás eletrônicas. Cada um é um minicomputador, e muitos têm segurança fraca: senhas de fábrica iguais para milhares de unidades, atualizações raras ou inexistentes, e fabricantes que abandonam o produto. Aparelhos IoT invadidos podem espionar (câmeras e microfones), servir de porta de entrada na rede e ser usados em ataques contra terceiros.'
          ),
          sl(
            'Cuidados com IoT',
            'Troque a senha padrão logo na instalação, por uma forte e única. Ative MFA na conta do aplicativo, quando existir. Atualize o firmware (o programa interno do aparelho) e ative atualizações automáticas. Desative funções que você não usa (acesso remoto, microfone, gravação em nuvem). Câmeras: aponte com consciência (evite quartos e banheiros), proteja a conta e saiba que gravações são dados pessoais de quem aparece. Antes de comprar, pesquise se o fabricante entrega atualizações. Se o aparelho for descartado ou vendido, faça a restauração de fábrica.'
          ),
          sl(
            'Segmentar a rede: visitas e IoT separados',
            'Segmentar é dividir a rede em partes separadas. Muitos roteadores têm a rede de visitantes (convidados): um Wi-Fi à parte, com outra senha, que dá acesso à internet mas NÃO aos aparelhos da rede principal. Use-a para visitas e também para aparelhos IoT e TVs. Assim, se um deles for invadido, o invasor não alcança seu computador de trabalho nem o celular. É a defesa em profundidade aplicada à casa: se uma parte cair, as outras ficam protegidas. Troque a senha da rede de visitas de tempos em tempos.',
            'Rede principal : notebook, celular\nRede visitantes: visitas, TV, camera, lampada inteligente'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que o trabalho remoto aumenta riscos de segurança?', 'b', [
          'Porque computadores em casa são sempre mais lentos e por isso mais fáceis de invadir por qualquer pessoa, mesmo sem técnica',
          'Porque os dados da empresa passam a ficar numa rede e em aparelhos que a equipe de TI não controla',
          'Porque a lei proíbe o uso de Wi-Fi em casa para trabalhar',
          'Porque aplicativos de reunião são vírus por natureza'
        ], 'O ambiente doméstico não é gerenciado pela empresa, então os cuidados dependem mais de você. Lentidão, proibição legal e vírus embutidos são afirmações falsas.'),
        mcq('q2', 'Para que serve uma VPN corporativa?', 'a', [
          'Criar um túnel protegido entre seu aparelho e a rede da empresa',
          'Substituir a necessidade de senha nos sistemas internos, já que o túnel já identifica o usuário',
          'Impedir que o aparelho seja infectado por qualquer vírus',
          'Aumentar a velocidade da internet de casa'
        ], 'A VPN protege o tráfego e dá acesso à rede interna. Não substitui senha, não impede infecção e não acelera a internet.'),
        mcq('q3', 'Qual é o primeiro cuidado ao instalar uma câmera de segurança IoT nova?', 'c', [
          'Deixar a senha de fábrica, que foi definida pelo fabricante para facilitar suporte',
          'Compartilhar a senha com os vizinhos para que eles ajudem a vigiar',
          'Trocar a senha padrão por uma forte e única, e ativar MFA se existir',
          'Desligar o roteador para evitar conflitos de rede'
        ], 'Senhas de fábrica são conhecidas e reaproveitadas em muitas unidades. Compartilhar a senha ou desligar o roteador não ajuda.'),
        fill('q4', 'Complete: o programa interno de um aparelho IoT, que precisa ser atualizado, é chamado de ___.', 'programa interno do aparelho = ___', ['firmware'], 'Firmware é o software embutido no aparelho. Atualizá-lo corrige falhas de segurança.'),
        mcq('q5', 'Qual a vantagem de colocar a TV inteligente e as lâmpadas na rede de visitantes?', 'd', [
          'Elas passam a funcionar sem internet nenhuma',
          'Elas ficam invisíveis para o fabricante',
          'Ficam mais rápidas porque a rede de visitantes é exclusiva para elas e não divide a banda com nenhum outro aparelho',
          'Se um desses aparelhos for invadido, o invasor não alcança o computador e o celular da rede principal'
        ], 'Segmentar limita o alcance de um aparelho comprometido. A rede de visitantes não torna aparelhos mais rápidos nem os esconde.'),
        mcq('q6', 'Carla trabalha de casa. O filho quer usar o notebook da empresa para jogar. O que fazer?', 'b', [
          'Deixar, desde que seja só nos fins de semana e ele prometa não instalar nada além do jogo combinado',
          'Não deixar, pois o aparelho tem dados da empresa e jogos podem trazer riscos; usar outro aparelho',
          'Deixar, desde que ele use a conta de administrador para instalar o jogo',
          'Deixar, pois a VPN protege o computador de qualquer jogo malicioso'
        ], 'Aparelho de trabalho deve ficar separado de uso pessoal e de terceiros. VPN protege o tráfego, não impede a instalação de programas arriscados.'),
        mcq('q7', 'O que significa BYOD?', 'a', [
          'Usar o próprio aparelho pessoal para trabalhar, seguindo as regras da empresa',
          'Um tipo de vírus que se instala em câmeras e transforma o aparelho em ponto de ataque',
          'Um método de criptografia para e-mails de empresas',
          'Uma lei de proteção de dados em vigor no Brasil'
        ], 'BYOD (bring your own device) é usar o aparelho pessoal no trabalho, sob as regras da empresa. As demais opções não correspondem ao termo.'),
        fill('q8', 'Complete: a rede à parte do roteador, com outra senha, que dá internet às visitas sem acesso aos aparelhos principais, é a rede de ___.', 'rede de ___ (Wi-Fi separado para convidados)', ['visitantes', 'visitas', 'convidados'], 'A rede de visitantes segmenta a casa e protege os aparelhos principais.')
      ]
    },
    {
      id: 'csb-31-familia-e-criancas-online',
      title: 'Família e crianças online',
      goal: 'Conhecer cuidados para crianças, adolescentes e idosos na internet: controle parental, cyberbullying, aliciamento, golpes contra idosos e a conversa em família.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Segurança em família é conversa, não só tecnologia',
            'Crianças, adolescentes e idosos usam a internet, mas nem sempre conhecem os riscos. A tecnologia ajuda (filtros, controles), mas o fator mais protetor é a confiança: a criança ou o idoso precisam sentir que podem contar o que viu ou o que aconteceu SEM serem punidos ou ridicularizados. Se o medo da bronca fizer a pessoa esconder um problema, o dano cresce. Esta lição trata de assuntos delicados com cuidado; se algo grave estiver acontecendo, procure ajuda de adultos de confiança, da escola e das autoridades.'
          ),
          sl(
            'Controle parental',
            'Controle parental são recursos para acompanhar e limitar o uso de aparelhos por crianças: filtrar conteúdo por idade, limitar tempo de tela, aprovar a instalação de aplicativos, controlar compras e conhecer o que o filho usa. Existem nos sistemas dos celulares, em lojas de aplicativos, em roteadores e em serviços de vídeo e jogos. Boas práticas: ajustar ao nível de maturidade (quanto menor a criança, mais supervisão), explicar os motivos em vez de apenas bloquear, e rever as regras conforme a criança cresce. O controle não substitui o diálogo: quem não sabe por que existe uma regra costuma contorná-la.'
          ),
          sl(
            'Cyberbullying',
            'Cyberbullying é a intimidação, humilhação ou perseguição repetida feita por meios digitais: mensagens ofensivas, exposição de fotos, criação de perfis falsos, exclusão de grupos. Pode ser mais difícil de escapar, porque acompanha a pessoa em casa, e se espalha rápido. Como ajudar: acolher sem julgar, guardar provas (capturas de tela com data), bloquear e denunciar nas plataformas, avisar a escola e, se houver ameaça ou crime, procurar as autoridades. Também ensine a não participar nem compartilhar: quem repassa humilhação também machuca.'
          ),
          sl(
            'Aliciamento online (prevenção)',
            'Aliciamento é quando um adulto se aproxima de uma criança ou adolescente na internet, muitas vezes fingindo ser alguém da mesma idade, para ganhar confiança e depois obter fotos íntimas, encontros ou outro tipo de exploração. Sinais de alerta: pedir segredo, pedir fotos, oferecer presentes, tentar levar a conversa para outro aplicativo mais privado, ou isolar a criança dos pais. Prevenção: conversar abertamente sobre o assunto em linguagem adequada à idade; combinar que nenhum adulto de verdade pede segredo a uma criança; ensinar que ela nunca será punida por contar; manter perfis privados; e saber que nem todo desconhecido online é quem diz ser. Se suspeitar de caso real, não apague nada: guarde as conversas, bloqueie o contato, e procure as autoridades e canais de denúncia oficiais.'
          ),
          sl(
            'Idosos e golpes',
            'Idosos são alvos frequentes de golpes por telefone e mensagens: falso parente em apuros pedindo dinheiro, falso funcionário do banco, falsos prêmios, ofertas milagrosas, falsos aplicativos de empréstimo. Os golpistas exploram pressa, medo e confiança. Orientações simples: desligar e ligar de volta para um número conhecido da instituição; combinar uma palavra-código na família para pedidos urgentes; nunca fornecer senha, código recebido por SMS ou instalar aplicativo a pedido de quem ligou; e ligar para um familiar antes de transferir dinheiro. Importante: ajude com respeito, sem tratar a pessoa como incapaz, e mostre que golpes enganam gente de todas as idades.'
          ),
          sl(
            'A conversa em família e o ECA Digital',
            'Boas conversas começam por curiosidade: pergunte o que a criança gosta de jogar e ver, em vez de interrogar. Combine regras juntos (horários, locais sem tela, o que pode e não pode compartilhar), dê o exemplo, e deixe claro que errar acontece e que contar sempre é melhor. Em dados pessoais de crianças, o Brasil tem proteção legal reforçada pela LGPD e por normas de proteção à infância e adolescência no ambiente digital; os detalhes e nomes oficiais das normas mudam, então consulte fontes oficiais ou orientação jurídica em caso concreto. Este texto é educativo e não substitui profissionais de psicologia, educação ou direito.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é o fator que mais protege uma criança que passa por um problema online?', 'a', [
          'Confiar que pode contar aos adultos sem ser punida',
          'Ter um aparelho caro com muitos recursos de proteção',
          'Evitar completamente qualquer uso de internet até os 18 anos',
          'Ser vigiada em segredo, sem saber que está sendo observada'
        ], 'A confiança para contar ajuda a agir cedo. Tecnologia ajuda, mas sem diálogo o problema fica escondido. Vigilância secreta e proibição total costumam gerar mais segredos.'),
        mcq('q2', 'Qual comportamento é um sinal de alerta de aliciamento?', 'c', [
          'Um colega de escola que combina um trabalho em grupo no mesmo aplicativo',
          'Um parente conhecido que manda feliz aniversário pelo celular',
          'Um adulto que se apresenta como jovem, pede segredo e pede fotos',
          'Um professor que envia material de estudo em plataforma da escola'
        ], 'Pedir segredo e fotos, se passando por alguém que não é, são sinais clássicos. As outras situações são normais e ocorrem em canais conhecidos.'),
        mcq('q3', 'Seu filho conta que está sofrendo ofensas em um grupo de mensagens. Qual é a melhor primeira reação?', 'd', [
          'Brigar com ele por estar em grupos que não deveria e proibir o uso de qualquer aplicativo de mensagens',
          'Tirar o celular dele para sempre e proibir novos aplicativos',
          'Dizer que é coisa de criança e que vai passar sozinho',
          'Acolher, guardar capturas de tela com data, bloquear e avisar a escola ou plataforma'
        ], 'Acolher e registrar provas permite agir. Punir ou minimizar faz a criança esconder do próximo problema.'),
        fill('q4', 'Complete: a intimidação ou humilhação repetida feita por meios digitais é chamada de ___.', '___ = intimidação repetida por meios digitais', ['cyberbullying', 'ciberbullying'], 'Cyberbullying é a perseguição ou humilhação por meios digitais, repetida ao longo do tempo.'),
        mcq('q5', 'Uma idosa recebe ligação de alguém que diz ser do banco e pede o código recebido por SMS "para cancelar uma compra". O que ela deve fazer?', 'b', [
          'Passar o código, pois quem ligou já sabe os dados dela',
          'Desligar e ligar de volta para o número oficial do banco, sem informar código',
          'Pedir o nome do atendente e passar o código só se ele parecer educado',
          'Instalar o aplicativo que ele indicar, que faz o cancelamento da compra de forma mais rápida e segura'
        ], 'Banco de verdade não pede código de SMS por telefone. Ligar de volta para número oficial desfaz a pressão. Educação do golpista não prova nada.'),
        mcq('q6', 'Por que apenas bloquear conteúdos, sem conversar, costuma ser insuficiente no controle parental?', 'a', [
          'Porque quem não entende o motivo da regra tende a contorná-la, e os riscos vão além do conteúdo',
          'Porque bloqueios nunca funcionam em nenhum aparelho',
          'Porque a lei proíbe bloquear conteúdo para menores de idade em qualquer aparelho ou plataforma de jogos',
          'Porque conversar com crianças sobre internet é perigoso'
        ], 'Controle e diálogo se complementam. Bloqueios funcionam em parte; a lei não proíbe filtros, e conversar é protetor.'),
        mcq('q7', 'Qual medida simples ajuda a família a se proteger de golpes do falso parente em apuros?', 'd', [
          'Responder rápido pela urgência, para não deixar o parente esperando e mostrar que a família se importa',
          'Fazer o Pix e pedir explicação depois, pois a situação é de emergência',
          'Dar o código de verificação para provar que também é da família',
          'Combinar uma palavra-código e confirmar por ligação em um número conhecido'
        ], 'Confirmar por outro canal e usar uma palavra combinada desmonta a farsa. Agir com pressa é o que o golpista quer.'),
        fill('q8', 'Complete: o conjunto de recursos para limitar tempo de tela, filtrar conteúdo e aprovar aplicativos de crianças é o controle ___.', 'controle ___ (recursos de supervisão para crianças)', ['parental'], 'Controle parental reúne ferramentas de supervisão ajustadas à idade da criança.')
      ]
    },
    {
      id: 'csb-32-seguranca-fisica',
      title: 'Segurança física',
      goal: 'Reconhecer riscos físicos à informação, como tailgating, shoulder surfing, USB desconhecido, descarte inadequado e perda de equipamentos, e saber como se proteger.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Segurança digital começa no mundo físico',
            'De nada adianta uma senha forte se alguém pode simplesmente levar o computador, olhar sua tela ou entrar no escritório sem ser notado. Segurança física protege pessoas, lugares e aparelhos contra acesso, roubo e dano. Muitos incidentes acontecem sem nenhuma técnica sofisticada: um notebook esquecido no táxi, um papel com senha jogado no lixo, uma porta aberta para quem chega com uma caixa na mão. Quem entra fisicamente num lugar frequentemente ultrapassa várias proteções digitais de uma vez.'
          ),
          sl(
            'Tailgating (carona)',
            'Tailgating, ou carona, é quando uma pessoa não autorizada entra num lugar restrito logo atrás de alguém autorizado, aproveitando a porta aberta. É educação em excesso que vira falha de segurança: segurar a porta para alguém desconhecido, ou para quem diz ter esquecido o crachá. O golpista pode estar com as mãos ocupadas, de uniforme, ou ao telefone, para parecer natural. Defesa: cada pessoa passa com o seu próprio crachá; seja gentil perguntando "posso te acompanhar até a recepção?"; aprenda que avisar a segurança não é grosseria. Combina com o princípio de verificar, em vez de confiar.'
          ),
          sl(
            'Shoulder surfing (olhar por cima do ombro)',
            'Shoulder surfing é quando alguém observa sua tela ou teclado para descobrir senhas, PINs ou informações, seja por perto ou com câmera. Acontece em cafés, transporte público e escritórios abertos. Defesas: cobrir o teclado do caixa eletrônico ao digitar o PIN, usar filtro de privacidade na tela, sentar de costas para a parede, evitar abrir informações sensíveis em público e ativar a biometria em vez de digitar a senha onde houver alguém olhando. Sempre bloqueie a tela ao se afastar do computador, mesmo por um minuto (no Windows, Windows+L; no celular, bloqueio automático curto).'
          ),
          sl(
            'Mesa limpa e descarte seguro',
            'Mesa limpa é o hábito de não deixar papéis com informações, senhas anotadas, crachás ou aparelhos à vista quando você sai. Uma foto de um quadro branco ou de um post-it com senha pode vazar muita coisa. Descarte: papéis com dados pessoais devem ser picotados, não jogados inteiros no lixo. Discos, pen drives e celulares usados guardam dados mesmo depois de "apagar"; antes de vender, doar ou jogar fora, use a restauração de fábrica com apagamento seguro ou a destruição física, especialmente de mídias com dados de terceiros. Lembre da LGPD: dados pessoais de clientes jogados no lixo comum são um vazamento.'
          ),
          sl(
            'USB desconhecido',
            'Um pen drive achado no estacionamento ou recebido de um desconhecido pode conter malware que executa assim que é conectado, ou aparelhos que se disfarçam de teclado para digitar comandos sozinhos. A curiosidade é justamente a isca. Regra: nunca conecte um USB desconhecido ao seu computador, especialmente do trabalho; entregue-o à equipe de segurança ou de TI. Também cuidado com carregadores públicos de celular em locais desconhecidos: prefira o seu próprio carregador na tomada, ou um bloqueador de dados USB.'
          ),
          sl(
            'Perda e roubo de equipamentos',
            'Celulares e notebooks são perdidos ou roubados com frequência. Para limitar o dano antes que aconteça: bloqueio de tela com senha ou biometria, criptografia do disco (que torna os dados ilegíveis sem a senha), backup recente, localizador ativado (como os recursos de localizar o aparelho oferecidos pelo sistema) e MFA nas contas importantes. Se perder: use o localizador, bloqueie ou apague remotamente, troque as senhas principais, avise a operadora para bloquear o chip, registre um boletim de ocorrência quando houver roubo e, se for equipamento de trabalho, avise a empresa imediatamente.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um homem com as mãos ocupadas pede para você segurar a porta de acesso restrito, dizendo que esqueceu o crachá. Qual risco isso representa?', 'c', [
          'Shoulder surfing, pois ele provavelmente vai ficar olhando para a sua tela enquanto você digita',
          'Criptografia, pois ele protege a porta',
          'Tailgating, porque ele pode entrar sem autorização aproveitando a sua passagem',
          'Phishing, pois ele envia um e-mail falso'
        ], 'Entrar logo atrás de quem é autorizado é tailgating. A conduta segura é acompanhá-lo até a recepção ou avisar a segurança.'),
        mcq('q2', 'O que é shoulder surfing?', 'a', [
          'Observar a tela ou o teclado de alguém para descobrir senhas ou informações',
          'Navegar em sites de esportes aquáticos no trabalho',
          'Instalar um programa para gravar tudo o que a pessoa digita no teclado do computador compartilhado',
          'Um golpe feito por e-mail em nome da empresa'
        ], 'Shoulder surfing é ver por cima do ombro. Os demais itens são outros conceitos.'),
        mcq('q3', 'Você encontrou um pen drive no estacionamento da empresa. O que fazer?', 'b', [
          'Conectar ao seu computador pessoal, que não tem dados de trabalho, para ver de quem é',
          'Não conectar e entregar à equipe de segurança ou de TI',
          'Conectar numa máquina velha da empresa, que não faz falta',
          'Formatar o pen drive sem abrir, para usar depois'
        ], 'Pen drives desconhecidos podem executar malware. A entrega à equipe responsável evita o risco. Qualquer conexão, inclusive em máquina velha, pode expor a rede.'),
        fill('q4', 'Complete: o hábito de não deixar papéis ou senhas à vista ao sair da mesa é chamado de mesa ___.', 'mesa ___ (sem papéis ou senhas à vista)', ['limpa'], 'Mesa limpa reduz a chance de alguém ver ou levar informações deixadas à mostra.'),
        mcq('q5', 'Antes de doar um celular antigo, qual cuidado é mais adequado?', 'd', [
          'Apenas apagar as fotos pela galeria',
          'Apenas remover o chip, pois os dados ficam no chip',
          'Entregar como está, pois quem recebe não consegue ler nada que tenha sido apagado pela galeria',
          'Fazer backup, sair das contas e restaurar de fábrica com apagamento seguro'
        ], 'Apagar fotos ou tirar o chip deixa dados no aparelho. Backup, sair das contas e restauração de fábrica reduzem o risco.'),
        mcq('q6', 'Por que a criptografia de disco ajuda quando um notebook é roubado?', 'a', [
          'Porque os dados ficam ilegíveis sem a senha, mesmo que o disco seja retirado',
          'Porque o notebook passa a avisar a polícia automaticamente',
          'Porque impede que o notebook seja revendido por qualquer pessoa',
          'Porque apaga os dados na hora do roubo, sem necessidade de internet ou de qualquer aviso ao dono'
        ], 'A criptografia protege a confidencialidade dos dados em repouso. Ela não avisa a polícia nem impede revenda do aparelho, e não apaga sozinha.'),
        mcq('q7', 'Qual cuidado ajuda a reduzir o risco ao digitar o PIN em um caixa eletrônico?', 'c', [
          'Falar o PIN em voz alta para conferir',
          'Pedir ajuda a quem está na fila para digitar',
          'Cobrir o teclado com a mão ao digitar',
          'Digitar o mais rápido possível e anotar o PIN depois, para lembrar'
        ], 'Cobrir o teclado impede a observação direta e por câmeras. As outras ações expõem o PIN.'),
        fill('q8', 'Complete: ao se afastar do computador, mesmo por um minuto, você deve ___ a tela.', 'ao se afastar, ___ a tela', ['bloquear'], 'Bloquear a tela impede que alguém use sua sessão enquanto você não está.')
      ]
    },
    {
      id: 'csb-33-resposta-pessoal-a-incidentes',
      title: 'Resposta pessoal a incidentes',
      goal: 'Saber o que fazer, passo a passo e com calma, quando suspeitar que uma conta ou aparelho foi invadido, e quando pedir ajuda.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Incidente: quando o pior pode ter acontecido',
            'Incidente de segurança é qualquer evento que compromete ou ameaça seus dados, contas ou aparelhos: uma conta invadida, um celular infectado, um golpe em que você passou dados, um aparelho roubado. Todos nós podemos passar por isso, e não há vergonha: a vergonha costuma atrasar a ação, e o tempo é o que mais piora o estrago. O objetivo desta lição é ter um roteiro calmo, que você pode seguir mesmo nervoso. Imagine um plano de evacuação de incêndio: ninguém o inventa na hora.'
          ),
          sl(
            'Sinais de que algo está errado',
            'Mensagens enviadas que você não escreveu, avisos de login de lugares ou aparelhos desconhecidos, senha que parou de funcionar, e-mail de redefinição de senha que você não pediu, cobranças que você não reconhece, celular muito lento ou esquentando sem uso, aplicativos novos que você não instalou, ou amigos dizendo que receberam links estranhos de você. Um sinal isolado pode ter explicação simples, mas vários juntos pedem ação imediata.'
          ),
          sl(
            'Passo 1: conter e isolar',
            'Primeiro, pare o estrago. Se for um aparelho com suspeita de infecção: desconecte da internet (modo avião ou desligue o Wi-Fi, ou tire o cabo de rede) para cortar a comunicação do invasor. Não é preciso desligar tudo em pânico, mas evite continuar usando para operações sensíveis. Se for uma conta: saia de todas as sessões e dispositivos nas configurações de segurança. Isolar é como fechar a torneira antes de secar o chão.'
          ),
          sl(
            'Passo 2: trocar senhas e reativar a proteção',
            'A partir de UM aparelho que você sabe estar limpo (outro celular ou computador, se o primeiro estiver suspeito), troque as senhas, começando pela conta de e-mail, porque ela serve para redefinir todas as outras, depois bancos, redes sociais e nuvem. Use senhas fortes e únicas, e ative ou reative a MFA. Verifique se o invasor mudou algo: e-mail de recuperação, telefone de recuperação, regras de encaminhamento de e-mail, aplicativos conectados. Remova o que não for seu. Se usava a mesma senha em outros lugares, troque em todos.'
          ),
          sl(
            'Passo 3: avisar, registrar e preservar evidências',
            'Se houver dinheiro envolvido, ligue imediatamente para o banco ou cartão, usando o número oficial do verso do cartão ou do aplicativo, e peça o bloqueio e a contestação. Avise contatos que possam receber mensagens falsas em seu nome. Registre um boletim de ocorrência quando houver crime, como fraude ou roubo; muitas polícias aceitam registro online. Preserve evidências: tire capturas de tela com data, guarde e-mails e mensagens, anote horários e valores, e não apague nada antes disso. Depois, comunique a plataforma pelos canais oficiais de denúncia e de recuperação de conta.'
          ),
          sl(
            'Quando pedir ajuda e como se recuperar',
            'Peça ajuda se: o aparelho continua estranho depois da limpeza, o invasor mantém acesso, há risco à segurança pessoal (perseguição, ameaça, imagens íntimas), houve vazamento de dados de terceiros (no trabalho, avise a equipe de segurança na hora), ou se envolver menores. Procure profissionais de TI de confiança, o suporte das plataformas, o banco e, quando for o caso, advogados e as autoridades. Para o aparelho muito comprometido, a restauração de fábrica a partir de uma fonte limpa e a recuperação de dados do backup costumam ser a solução mais segura. Depois do susto: aprenda com o que ocorreu e reforce a proteção que faltava, sem se culpar.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Você suspeita que seu celular foi infectado e está enviando mensagens sozinho. Qual é a primeira medida?', 'b', [
          'Continuar usando normalmente o celular, para ver o que acontece e coletar mais informações',
          'Cortar a conexão com a internet (modo avião, por exemplo) para isolar o aparelho',
          'Postar nas redes sociais pedindo ajuda aos amigos',
          'Trocar o papel de parede do celular para ver se o problema some'
        ], 'Isolar da rede corta a comunicação do invasor e reduz o estrago. Continuar usando ou postar não conserta nada.'),
        mcq('q2', 'Por que a conta de e-mail costuma ser a primeira a ter a senha trocada após um incidente?', 'a', [
          'Porque ela serve para redefinir senhas de várias outras contas',
          'Porque e-mails não têm senha e por isso são mais fáceis',
          'Porque a lei exige essa ordem em todos os casos',
          'Porque o e-mail é mais barato de recuperar do que um banco e não precisa de mais nenhuma verificação'
        ], 'Quem controla o e-mail pode pedir redefinições de outras contas. Não há ordem legal nem o e-mail é sem senha.'),
        mcq('q3', 'Você caiu num golpe e transferiu dinheiro por Pix. O que fazer imediatamente?', 'c', [
          'Esperar alguns dias, pois o banco só atende reclamações depois de um prazo e antes disso nada pode ser feito',
          'Apagar as conversas para não ter provas contra você',
          'Ligar já para o banco pelo canal oficial, informar o golpe e registrar boletim de ocorrência',
          'Pedir ao golpista que devolva o dinheiro por mensagem'
        ], 'Agir rápido junto ao banco aumenta a chance de bloqueio, e o boletim ajuda. Apagar provas e negociar com o golpista só piora.'),
        fill('q4', 'Complete: ao registrar o incidente, é importante ___ evidências (capturas de tela, mensagens, horários) antes de apagar qualquer coisa.', 'é importante ___ evidências', ['preservar', 'guardar'], 'Preservar evidências ajuda bancos, plataformas e autoridades a entenderem o que ocorreu.'),
        mcq('q5', 'Você acha que o notebook está comprometido. De onde trocar as senhas?', 'd', [
          'Do próprio notebook suspeito, que é o mais rápido',
          'De qualquer computador público de uma lan house',
          'Do notebook, mas só depois de instalar três antivírus ao mesmo tempo, para garantir que está limpo',
          'De outro aparelho que você sabe estar limpo, como outro celular de confiança'
        ], 'Um aparelho comprometido pode capturar as novas senhas. Computador público também não é confiável.'),
        mcq('q6', 'Depois de recuperar uma conta, o que mais deve ser verificado?', 'b', [
          'Nada, pois trocar a senha resolve tudo e o invasor perde qualquer acesso que tivesse conseguido antes',
          'E-mail e telefone de recuperação, regras de encaminhamento e aplicativos conectados',
          'Só o nome de exibição do perfil',
          'Apenas o papel de parede da conta'
        ], 'Invasores costumam deixar portas dos fundos: recuperação, encaminhamento e apps. Só trocar a senha pode não bastar.'),
        mcq('q7', 'Em qual situação é mais importante pedir ajuda especializada?', 'a', [
          'Quando há ameaça pessoal, imagens íntimas expostas ou vazamento de dados de outras pessoas',
          'Quando você esquece a senha do Wi-Fi uma única vez e precisa pedir a outra pessoa da casa para lembrar',
          'Quando o celular precisa de uma atualização de rotina',
          'Quando um e-mail promocional chega à caixa de entrada'
        ], 'Riscos à segurança pessoal e a terceiros exigem apoio de profissionais e autoridades. As outras situações são rotineiras.'),
        fill('q8', 'Complete: ao suspeitar de dinheiro envolvido, você deve ligar para o ___ pelo número oficial para pedir bloqueio e contestação.', 'ligar para o ___ pelo número oficial', ['banco'], 'O banco, contatado por canal oficial, pode bloquear e contestar movimentações suspeitas.')
      ]
    }
,
    {
      id: 'csb-34-cultura-de-seguranca',
      title: 'Cultura de segurança',
      goal: 'Entender por que pessoas são parte central da segurança, o valor da cultura sem culpa, como montar uma política simples para uma pequena empresa e como incentivar o relato de incidentes.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Pessoas: o elo mais citado e mais incompreendido',
            'Costuma-se dizer que o ser humano é o elo mais fraco da segurança. Uma visão mais útil: pessoas são o elo mais ATACADO, porque é mais barato enganar alguém (phishing, golpes) do que quebrar uma proteção técnica. Mas pessoas também são a melhor DEFESA: um funcionário atento que desconfia de um pedido estranho e avisa pode parar um ataque que nenhuma ferramenta detectaria. Cultura de segurança é o conjunto de hábitos, valores e atitudes de um grupo em relação à proteção da informação: o jeito como as coisas são feitas quando ninguém está olhando.'
          ),
          sl(
            'Conscientização: o que funciona',
            'Conscientização é ensinar as pessoas a reconhecer riscos e agir direito. O que funciona: conteúdo curto, em linguagem simples, ligado ao dia a dia da pessoa, com exemplos reais, repetido de tempos em tempos (não uma vez por ano) e com prática, como exercícios simulados de phishing que servem para ensinar, não para punir. O que não funciona: palestras longas e cheias de jargão, listas de proibições sem explicação, ou ameaças. Se a regra de segurança torna o trabalho impossível, as pessoas arrumam um jeito de contorná-la, e o atalho costuma ser pior.'
          ),
          sl(
            'Erro humano e cultura sem culpa',
            'Todo mundo erra: clica num link, manda um arquivo para a pessoa errada, esquece de bloquear a tela. Se a reação ao erro for punição, as pessoas escondem o problema, e a empresa descobre tarde, quando o dano é maior. Cultura sem culpa (blameless) não significa ausência de responsabilidade: significa que, ao ocorrer um erro, o foco é entender o que aconteceu e como evitar de novo, olhando para processos e condições, e não apenas procurando um culpado. Situações de má-fé deliberada seguem tratadas de forma diferente. A regra: recompensar quem avisa rápido, mesmo quando errou.'
          ),
          sl(
            'Política de segurança simples para uma pequena empresa',
            'Política é um documento curto que diz as regras do jogo. Para uma pequena empresa, uma página já ajuda, escrita em linguagem clara: senhas (gerenciador, únicas, MFA em e-mail e sistemas importantes); aparelhos (atualizados, bloqueio de tela, criptografia, antivírus); dados (quem acessa o quê, como guardar dados pessoais de clientes, o que não pode sair da empresa); backup (o que, com que frequência, quem testa a restauração); uso de e-mail e internet (cuidados com anexos e links); saída de funcionário (revogar acessos no mesmo dia); e o que fazer se algo der errado (quem avisar). Todos devem ler, assinar a ciência e rever a política periodicamente.',
            'Politica de 1 pagina:\n1. Senhas e MFA   2. Aparelhos   3. Dados\n4. Backup         5. E-mail      6. Saidas\n7. Quem avisar em caso de incidente'
          ),
          sl(
            'Reportar incidentes: facilite e agradeça',
            'Relatar cedo é uma das atitudes mais valiosas. Para isso, o canal precisa ser fácil (um e-mail ou telefone conhecido por todos, escrito na política), rápido, e sem medo de punição. O relato deve responder: o que aconteceu, quando, em que aparelho ou conta, e o que já foi feito. A empresa deve agradecer quem relata, até quando era alarme falso: é assim que as pessoas aprendem que avisar é bem-vindo. Cada relato também ensina o grupo a melhorar.'
          ),
          sl(
            'Liderança e exemplo',
            'A cultura nasce do exemplo de quem lidera. Se o dono da loja pede para usar a senha dele "só dessa vez", todos aprendem que a regra é opcional. Se o líder usa MFA, bloqueia a tela, fala abertamente de golpes e reconhece os próprios erros, a equipe copia. Em pequenas empresas, isso vale ainda mais: poucas pessoas, grande influência. Segurança deve ser vista como parte de bem atender os clientes, e não como obstáculo.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que se diz que pessoas são o elo mais ATACADO da segurança?', 'a', [
          'Porque enganar uma pessoa costuma ser mais fácil e barato do que quebrar uma proteção técnica',
          'Porque as pessoas não aprendem, não importa o treinamento',
          'Porque computadores são imunes a ataques e só pessoas são alvo',
          'Porque a lei responsabiliza sempre o funcionário por qualquer incidente'
        ], 'Phishing e golpes exploram o lado humano. Pessoas aprendem sim, computadores também são alvos, e a responsabilização não é automática.'),
        mcq('q2', 'Qual tipo de treinamento de conscientização tende a funcionar melhor?', 'd', [
          'Uma palestra longa, uma vez por ano, cheia de termos técnicos',
          'Uma lista de proibições distribuída sem explicação',
          'Ameaça de demissão a quem errar um teste',
          'Conteúdo curto, simples, repetido e com exemplos do dia a dia'
        ], 'Aprendizagem pede repetição e exemplos. Jargão, proibições sem motivo e ameaças geram esquecimento, contornos ou medo.'),
        mcq('q3', 'Um funcionário clicou em um link suspeito e avisou a TI em seguida. Qual resposta da empresa fortalece a cultura de segurança?', 'c', [
          'Aplicar uma punição pública para servir de exemplo',
          'Ignorar o aviso para não alarmar o grupo',
          'Agradecer o aviso, conter o problema e ajustar o que puder evitar o erro no futuro',
          'Pedir que ele não conte aos colegas, para a empresa manter a reputação'
        ], 'Recompensar o relato rápido incentiva outros a avisar. Punir esconde problemas futuros; ignorar perde a chance de conter o dano.'),
        fill('q4', 'Complete: a cultura em que, ao ocorrer um erro, o foco é entender e corrigir os processos, e não achar um culpado, é a cultura sem ___.', 'cultura sem ___', ['culpa'], 'Cultura sem culpa estimula o relato e a melhoria, sem deixar de lado a responsabilidade em casos de má-fé.'),
        mcq('q5', 'Qual item NÃO combina com uma política de segurança simples para uma pequena empresa?', 'b', [
          'Orientação de senhas únicas e MFA em e-mail e sistemas',
          'Um documento de cem páginas escrito em linguagem jurídica, que ninguém lê',
          'Regra de revogar acessos de quem sai da empresa no mesmo dia',
          'Indicação clara de quem avisar quando algo der errado'
        ], 'Política deve ser curta e clara para ser lida e usada. Documento enorme e hermético falha no objetivo. Os demais itens são essenciais.'),
        mcq('q6', 'O dono da loja pede a um funcionário para compartilhar a senha do sistema "só desta vez". Qual é o efeito sobre a cultura?', 'a', [
          'Ensina que as regras são opcionais, enfraquecendo todo o programa de segurança',
          'Fortalece a cultura, pois mostra confiança na equipe',
          'Não há efeito, pois é uma única vez',
          'Melhora a rastreabilidade, pois duas pessoas passam a usar a mesma conta'
        ], 'O exemplo do líder define o que vale na prática. Compartilhar senha ainda prejudica a auditoria.'),
        mcq('q7', 'Quais informações devem constar em um bom relato de incidente?', 'd', [
          'Só o nome do culpado, para que seja punido',
          'Apenas a data, sem detalhes, para não preocupar ninguém',
          'Uma opinião sobre a política da empresa, e nada sobre o fato',
          'O que aconteceu, quando, em que aparelho ou conta, e o que já foi feito'
        ], 'Esses dados permitem agir rápido. Focar em culpa ou omitir detalhes atrasa a resposta.'),
        fill('q8', 'Complete: o conjunto de hábitos, valores e atitudes de um grupo em relação à proteção da informação é a cultura de ___.', 'cultura de ___', ['segurança', 'seguranca'], 'Cultura de segurança é como o grupo realmente age em relação à proteção da informação.')
      ]
    },
    {
      id: 'csb-35-carreiras-e-certificacoes',
      title: 'Carreiras e certificações em cibersegurança',
      goal: 'Conhecer as grandes áreas da cibersegurança, seus papéis, como as certificações se encaixam e como começar sem precisar de diploma específico.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Uma área grande, com muitas portas de entrada',
            'Cibersegurança não é uma profissão só, e sim um conjunto de áreas. Quem gosta de programar, de redes, de investigar, de leis, de ensinar ou de gerenciar encontra um lugar. Nem todo mundo precisa ser "hacker": há funções técnicas, de processo e de gestão. E o mercado pede gente de formações variadas: tecnologia, direito, administração, comunicação e outras. Esta lição apresenta um mapa para você se orientar; as condições do mercado mudam, então confira informações atuais antes de decidir.'
          ),
          sl(
            'Time azul, time vermelho e GRC',
            'Blue team (time azul) é o lado defensivo: monitorar, detectar, responder a incidentes, endurecer sistemas, manter proteções. Um exemplo é o analista de SOC (centro de operações de segurança), que acompanha alertas. Red team (time vermelho) é o lado que simula atacantes, com autorização, para testar as defesas: testes de intrusão, exercícios de ataque. GRC (governança, riscos e conformidade) cuida de políticas, gestão de riscos, auditorias e leis como a LGPD: é o lado de processos e regras. Existe ainda o purple team, em que azul e vermelho trabalham juntos para melhorar mais rápido.',
            'Azul   = defende (detecta e responde)\nVermelho = simula ataques com autorizacao\nGRC    = governa (politicas, riscos, leis)'
          ),
          sl(
            'Outras áreas: nuvem, forense, aplicações e mais',
            'Segurança em nuvem: proteger ambientes e serviços hospedados em provedores. Forense digital: investigar o que aconteceu após um incidente, preservando evidências para análise e, se for o caso, uso legal. Segurança de aplicações: fazer com que o software seja seguro desde o desenvolvimento (veja o curso de OWASP). Resposta a incidentes: coordenar a ação durante uma crise. Análise de malware, inteligência de ameaças, segurança de identidade, privacidade e proteção de dados (com papéis como encarregado de dados, previsto na LGPD) e conscientização. Cada uma exige habilidades próprias.'
          ),
          sl(
            'Certificações: o que são e como encaixam',
            'Certificação é um exame que comprova conhecimentos, emitido por uma organização. Ajuda a mostrar conhecimento a quem contrata, a organizar o estudo e, em algumas vagas, é exigida. Exemplos citados só por nome, sem juízo de valor e sem garantia de atualidade: Security+, CISSP, CEH, OSCP, CISM, CISA, e também certificações de provedores de nuvem. Elas variam em nível, custo e foco: algumas são teóricas, outras práticas. Certificação NÃO substitui prática e experiência, e nenhuma garante emprego. Antes de pagar, pesquise o que as vagas que você quer pedem, e o que a prova realmente cobra.'
          ),
          sl(
            'Como começar sem um diploma específico',
            'Você não precisa de um curso de graduação em segurança para começar. Caminho comum: aprender bases de computação e redes e de sistemas Linux e Windows; praticar em laboratório próprio e plataformas de treino legais; fazer projetos (montar um laboratório, documentar o que aprendeu); participar de comunidades; e buscar uma porta de entrada: suporte de TI, administração de sistemas, ou funções de analista júnior. Montar um portfólio com relatos do que você estudou, sem dados de terceiros, e manter-se ético: reputação é tudo nessa área.'
          ),
          sl(
            'Habilidades que valem em qualquer papel',
            'Além de ferramentas, contam: curiosidade e hábito de estudar sempre (a área muda rápido), comunicação clara (explicar riscos para quem não é técnico), escrita de relatórios, pensamento crítico, ética e sigilo, e cuidado com a saúde mental em funções de plantão e de resposta a incidentes. Não existe um caminho único: defina seus interesses, experimente áreas diferentes e dê um passo por vez.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que faz o blue team?', 'b', [
          'Simula ataques com autorização para testar as defesas',
          'Defende: monitora, detecta e responde a incidentes',
          'Cuida só da parte jurídica e dos contratos',
          'Desenvolve jogos e aplicativos de entretenimento'
        ], 'Azul é o lado defensivo. Simular ataques é do red team, e a parte de leis e processos aparece no GRC.'),
        mcq('q2', 'Qual área trata de políticas, gestão de riscos, auditorias e conformidade com leis?', 'c', [
          'Red team',
          'Forense digital',
          'GRC (governança, riscos e conformidade)',
          'Análise de malware'
        ], 'GRC cuida do lado de processos e regras. Red team ataca, forense investiga e análise de malware estuda programas maliciosos.'),
        mcq('q3', 'Qual afirmação sobre certificações é mais adequada?', 'd', [
          'Uma certificação garante emprego imediato',
          'Sem certificação, ninguém consegue trabalhar com segurança',
          'Todas as certificações têm o mesmo nível e foco',
          'Ajudam a mostrar conhecimento e organizar estudos, mas não substituem prática'
        ], 'Certificação é uma ferramenta, não garantia. Elas diferem em nível e foco, e há muitos caminhos para entrar.'),
        fill('q4', 'Complete: o time que simula atacantes, com autorização, para testar as defesas é o red ___.', 'red ___ (simula ataques com autorização)', ['team', 'time'], 'Red team simula ataques de forma autorizada para revelar fraquezas antes de criminosos.'),
        mcq('q5', 'Rafaela é de Direito e se interessa por segurança. Qual área combina mais com sua formação?', 'a', [
          'GRC e privacidade, com leis como a LGPD',
          'Somente red team, pois exige formação jurídica',
          'Nenhuma, pois a área é exclusiva de quem é formado em computação',
          'Somente análise de malware'
        ], 'GRC e privacidade valorizam conhecimento jurídico. A área aceita formações variadas.'),
        mcq('q6', 'Qual é uma boa forma de começar na área sem diploma específico?', 'b', [
          'Esperar um convite espontâneo de alguma empresa',
          'Estudar base de redes e sistemas, praticar em laboratório legal e documentar projetos',
          'Testar sites de empresas reais para provar habilidade',
          'Comprar a certificação mais cara e pular o estudo prático'
        ], 'Base sólida, prática em ambiente autorizado e portfólio são caminhos comuns. Testar sistemas reais sem permissão é crime, e pular a prática enfraquece o aprendizado.'),
        mcq('q7', 'O que a forense digital faz?', 'c', [
          'Cria senhas novas para os usuários',
          'Vende antivírus a pequenas lojas',
          'Investiga o que aconteceu após um incidente, preservando evidências',
          'Monta a rede Wi-Fi dos escritórios'
        ], 'Forense investiga e preserva evidências. As outras funções não correspondem.'),
        fill('q8', 'Complete: a sigla SOC significa centro de ___ de segurança.', 'SOC = centro de ___ de segurança', ['operações', 'operacoes'], 'O SOC (Security Operations Center) é o centro de operações de segurança, que acompanha alertas.')
      ]
    },
    {
      id: 'csb-36-revisao-auditando-pequena-empresa',
      title: 'Revisão: auditando a segurança de uma pequena loja',
      goal: 'Aplicar tudo o que foi aprendido num checklist para avaliar a segurança de uma pequena loja fictícia e priorizar as melhorias.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O cenário: a Loja Girassol (fictícia)',
            'A Loja Girassol vende roupas e tem quatro pessoas: a dona, Dona Célia, e três atendentes. Usa um computador no caixa, um notebook da dona, os celulares pessoais de todos, um e-mail comum com um nome da loja, uma planilha de clientes (nomes e telefones fictícios), Wi-Fi do roteador da operadora para tudo (inclusive clientes e a TV), e vende também pelas redes sociais. Vamos auditar: olhar de forma organizada o que existe, comparar com boas práticas e listar o que corrigir. Uma auditoria simples não precisa de ferramentas: precisa de perguntas.'
          ),
          sl(
            'Passo a passo da auditoria',
            'Uma ordem útil, que reúne as lições do curso: 1) listar ativos (dados de clientes, caixa, e-mail, redes sociais, equipamentos); 2) identificar ameaças e vulnerabilidades prováveis; 3) verificar controles existentes por área; 4) estimar risco (probabilidade e impacto); 5) priorizar e propor ações; 6) definir responsáveis e prazos; 7) revisar de novo depois. Atenção ao registrar: sempre sem anotar senhas reais no relatório, e com cuidado com dados pessoais ao mostrá-lo a terceiros.'
          ),
          sl(
            'Checklist: contas e acessos',
            'Perguntas: o e-mail da loja tem senha forte e única, e MFA? Existe uma conta por pessoa nos sistemas (e não uma conta "caixa" compartilhada)? Os acessos são os mínimos necessários (o atendente acessa a planilha financeira)? Quando alguém sai, os acessos são retirados no mesmo dia? Existe gerenciador de senhas? As redes sociais da loja têm MFA, e quem é administrador? Quais contas são de serviço (por exemplo, a conta que o sistema de vendas usa) e quem cuida delas?'
          ),
          sl(
            'Checklist: aparelhos, rede e dados',
            'Aparelhos: sistemas e programas atualizados? Antivírus e firewall ativos? Bloqueio de tela e criptografia no notebook? Celulares com bloqueio e atualizações? Rede: senha do roteador alterada, Wi-Fi com criptografia moderna e senha forte, rede de visitantes separada para clientes e TV? Dados: onde ficam os dados dos clientes, só o necessário é coletado (LGPD), quem acessa, como são descartados? Backup: existe, é recente, fica separado e já se testou a restauração? Nuvem: links de compartilhamento revisados?'
          ),
          sl(
            'Checklist: pessoas, física e incidentes',
            'Pessoas: a equipe sabe reconhecer phishing e golpes de Pix e de falso cliente? Há uma política de uma página? Há um canal claro para relatar incidentes sem medo de bronca? Física: o caixa fica à vista de qualquer cliente (shoulder surfing)? Papéis com dados são picotados? Pen drives desconhecidos são evitados? O equipamento tem local seguro? Incidentes: todos sabem o que fazer em caso de invasão (isolar, trocar senhas, avisar banco, registrar boletim, preservar evidências) e para quem ligar?'
          ),
          sl(
            'Exemplo de resultado e priorização',
            'Achados fictícios: (1) o e-mail da loja usa senha antiga e curta, sem MFA: risco alto, correção rápida e barata, PRIORIDADE 1. (2) Sem backup da planilha de clientes: impacto alto, PRIORIDADE 1. (3) Clientes e TV na mesma rede dos computadores: risco médio, correção barata, PRIORIDADE 2. (4) Conta "caixa" compartilhada: PRIORIDADE 2. (5) Equipe sem orientação sobre golpes: PRIORIDADE 2, treinamento curto. (6) Papéis com dados jogados inteiros no lixo: PRIORIDADE 3. Priorizar por risco e custo-benefício evita tentar fazer tudo de uma vez. Combine prazos e revise em alguns meses.',
            'P1: MFA no e-mail + backup\nP2: rede de visitantes, contas individuais, treino\nP3: descarte de papeis, mesa limpa'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é o primeiro passo recomendado numa auditoria simples de segurança?', 'a', [
          'Listar os ativos (dados, equipamentos, contas) para saber o que proteger',
          'Comprar o antivírus mais caro do mercado',
          'Trocar todos os computadores por novos',
          'Contratar uma empresa externa para testar a loja sem avisar ninguém'
        ], 'Sem saber o que existe e quanto vale, não dá para priorizar. Comprar produtos ou testar às escondidas não é um bom começo.'),
        mcq('q2', 'Na Loja Girassol, o e-mail principal usa senha curta e sem MFA. Como priorizar?', 'd', [
          'Deixar para o último, pois e-mail não tem importância',
          'Resolver só depois de trocar o logotipo da loja',
          'Aceitar o risco sem avaliar nada',
          'Prioridade alta, pois o risco é alto e a correção é rápida e barata'
        ], 'O e-mail costuma servir para recuperar outras contas, e MFA e senha forte são correções simples. Aceitar sem avaliar ou adiar não faz sentido.'),
        mcq('q3', 'A loja oferece Wi-Fi aos clientes na mesma rede dos computadores. Qual melhoria é mais adequada?', 'b', [
          'Remover a senha do Wi-Fi para facilitar o acesso',
          'Criar uma rede de visitantes separada, sem acesso aos computadores',
          'Desligar o roteador durante o horário de funcionamento',
          'Passar a senha do Wi-Fi pelas redes sociais da loja'
        ], 'Segmentar limita o alcance de um aparelho comprometido. As outras opções reduzem a proteção ou impedem o uso.'),
        fill('q4', 'Complete: a conta "caixa", usada por três atendentes com a mesma senha, é uma conta ___, que prejudica a rastreabilidade.', 'conta "caixa" usada por todos = conta ___', ['compartilhada'], 'Contas compartilhadas impedem saber quem fez cada ação e dificultam a saída de pessoas.'),
        mcq('q5', 'Que pergunta de checklist avalia a qualidade do backup?', 'c', [
          'O backup tem um nome bonito?',
          'O backup é guardado dentro da mesma pasta do original?',
          'O backup é recente, fica separado e a restauração já foi testada?',
          'O backup foi enviado a todos os clientes?'
        ], 'Um backup útil é recente, separado e testado. Guardar na mesma pasta ou enviar a clientes viola a boa prática.'),
        mcq('q6', 'Por que o relatório de auditoria não deve conter senhas reais?', 'a', [
          'Porque o relatório pode circular e as senhas ficariam expostas',
          'Porque senhas reais nunca funcionam em relatórios',
          'Porque a auditoria só avalia o que não tem senha',
          'Porque o relatório é sempre apagado depois de uma semana'
        ], 'Relatórios são compartilhados e guardados; incluir segredos cria um novo ponto de vazamento. As outras razões são inventadas.'),
        mcq('q7', 'Qual critério ajuda a decidir a ordem das correções?', 'd', [
          'Começar pelo que for mais interessante tecnicamente',
          'Começar pelo item mais caro, pois deve ser o mais importante',
          'Começar pelo item que o mais antigo funcionário sugerir',
          'Considerar risco (probabilidade e impacto) junto com o custo e a facilidade de correção'
        ], 'Priorizar por risco e custo-benefício traz o máximo de proteção primeiro. Interesse técnico ou preço não são critérios de risco.'),
        fill('q8', 'Complete: depois de implantar as melhorias, é preciso ___ a auditoria depois de alguns meses, pois os riscos mudam.', 'é preciso ___ a auditoria depois de alguns meses', ['revisar', 'repetir', 'refazer'], 'Segurança é um processo contínuo: novos aparelhos, pessoas e ameaças exigem revisões periódicas.')
      ]
    },
    {
      id: 'csb-37-como-continuar-estudando',
      title: 'Como continuar estudando',
      goal: 'Conhecer formas legais de praticar, comunidades, tipos de leitura e as trilhas intermediária e avançada deste curso.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Parabéns: você tem a base',
            'Você chegou ao fim do nível iniciante: sabe o que se protege (CIA), reconhece golpes e malware, cuida de senhas, MFA, dispositivos, redes e dados, entende princípios, riscos, leis e como reagir a incidentes. Isso já torna você muito mais seguro e útil para sua família e seu trabalho. A segurança é uma área que muda sempre; o hábito de estudar de forma contínua vale mais do que qualquer conteúdo isolado. Esta lição mostra caminhos para seguir, sempre de forma legal e ética.'
          ),
          sl(
            'Praticar de forma legal: laboratórios e CTFs',
            'Aprender fazendo é o melhor caminho, mas só em ambientes permitidos. Opções: seu laboratório com máquinas virtuais (lição 27); aplicações propositalmente vulneráveis para rodar localmente; plataformas online de treino, em que os ambientes são autorizados para ataque e há trilhas guiadas para iniciantes; e CTFs (Capture The Flag), competições com desafios de vários níveis, individuais ou em equipe. Antes de usar qualquer plataforma, leia as regras: ataque somente o que ela libera. Use dados fictícios, senha forte e MFA nas contas, e não compartilhe respostas em competições em andamento.'
          ),
          sl(
            'Comunidades',
            'Estudar acompanhado ajuda a manter o ritmo: grupos locais de segurança, eventos e conferências (muitos têm entrada gratuita ou online), comunidades de estudo, fóruns, canais de vídeo e blogs de profissionais. Ao participar: seja respeitoso, não peça ajuda para invadir sistemas de terceiros (isso viola a ética e muitas regras de comunidades), compartilhe o que aprende e confira informações em mais de uma fonte, porque há desinformação e golpes que se fazem passar por cursos ou ferramentas milagrosas.'
          ),
          sl(
            'Leitura recomendada por tipo',
            'Em vez de uma lista de títulos que muda com o tempo, pense por tipo: documentação oficial (de sistemas, de leis como a LGPD, de órgãos de segurança nacionais e internacionais); guias de boas práticas dos frameworks que você viu (NIST, CIS, ISO); relatórios públicos de incidentes e de ameaças, para ver a realidade; livros introdutórios de redes, sistemas operacionais e programação; livros de história e de casos da segurança, que contam como ataques foram descobertos; e blogs e podcasts de profissionais. Desconfie de conteúdo com promessas de "ganhar dinheiro fácil hackeando".'
          ),
          sl(
            'Trilha intermediária deste curso',
            'O próximo nível aprofunda a visão de operação e defesa: modelos de ameaça, identidade e acesso, segurança em nuvem, criptografia aplicada, monitoramento e logs em escala, resposta a incidentes, noções de forense, gestão de vulnerabilidades, segurança em redes e em aplicações, e privacidade. Ele pressupõe que você domina o vocabulário e os hábitos deste nível. Os cursos de Redes, Linux e OWASP complementam: use-os para aprofundar protocolos, administração de sistemas e vulnerabilidades web.'
          ),
          sl(
            'Trilha avançada e próximo passo',
            'O nível avançado trata de temas como engenharia de detecção, arquitetura segura, governança e conformidade em maior profundidade, gestão de crises e tópicos atuais, como segurança de sistemas com inteligência artificial. Escolha um próximo passo pequeno e concreto: por exemplo, montar o seu laboratório, resolver os primeiros desafios de uma plataforma de treino ou rever com a família o roteiro de incidentes. Pequenos passos constantes vencem grandes planos que nunca começam. Mantenha sempre a ética, a autorização e o respeito aos dados das pessoas.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é o requisito para praticar técnicas de ataque de forma legítima?', 'c', [
          'Usar um computador antigo, que não tenha dados',
          'Praticar à noite, quando ninguém percebe',
          'Praticar apenas em ambientes que são seus ou que autorizam o teste expressamente',
          'Ter uma certificação de qualquer área'
        ], 'Autorização é o critério. Hora do dia, computador usado ou certificação não tornam um teste legal.'),
        mcq('q2', 'O que é um CTF?', 'a', [
          'Uma competição de desafios de segurança, em ambiente autorizado',
          'Um tipo de vírus de computador',
          'Um protocolo de e-mail seguro',
          'Uma lei sobre proteção de dados'
        ], 'CTF (Capture The Flag) é competição de desafios. Não é malware, protocolo nem lei.'),
        mcq('q3', 'Um desconhecido em uma comunidade pede ajuda para invadir o Wi-Fi do vizinho. O que fazer?', 'd', [
          'Ajudar, se for só por curiosidade',
          'Ajudar, se ele prometer não usar a internet do vizinho',
          'Ajudar, se for só em Wi-Fi com senha fraca',
          'Recusar, explicar que é ilegal sem autorização e sugerir treinar em um laboratório próprio'
        ], 'Invadir rede alheia sem autorização pode ser crime. Recusar e indicar o treino legal é a atitude ética.'),
        fill('q4', 'Complete: o nome da competição em que se captura uma "bandeira" resolvendo desafios é Capture The ___.', 'Capture The ___', ['flag'], 'Capture The Flag: o objetivo é encontrar a bandeira escondida em cada desafio.'),
        mcq('q5', 'Por que é melhor pensar em tipos de leitura do que decorar uma lista de livros?', 'b', [
          'Porque livros de segurança não existem',
          'Porque a área muda e as listas ficam desatualizadas, enquanto os tipos de fonte seguem úteis',
          'Porque só vale a pena ler vídeos',
          'Porque ler não ajuda a aprender segurança'
        ], 'Os tipos de fonte permanecem úteis mesmo que os títulos mudem. As demais afirmações são falsas.'),
        mcq('q6', 'Um vídeo promete "ganhar dinheiro fácil hackeando contas de outras pessoas". Como avaliar?', 'c', [
          'Como uma oportunidade confiável de renda',
          'Como um curso avançado para quem já sabe tudo',
          'Como sinal de golpe ou incentivo ao crime, a ser evitado',
          'Como uma prova de que a área é ilegal em todos os casos'
        ], 'Prometer ganho fácil por meio de invasão é incentivo a crime ou golpe. A área de segurança em si é legítima quando feita com autorização.'),
        mcq('q7', 'O que o nível intermediário deste curso pressupõe de você?', 'a', [
          'Que você domina o vocabulário e os hábitos vistos no nível iniciante',
          'Que você já seja um profissional experiente',
          'Que você tenha uma certificação específica',
          'Que você tenha acesso a sistemas de empresas para testes'
        ], 'O próximo nível se apoia no vocabulário e nas práticas do iniciante. Não exige experiência profissional nem acesso a sistemas alheios.'),
        fill('q8', 'Complete: antes de usar uma plataforma de treino, leia as ___ dela e ataque somente o que ela libera.', 'leia as ___ da plataforma', ['regras', 'termos', 'políticas', 'politicas'], 'Cada plataforma define o que pode ser testado; seguir as regras mantém a prática legal.')
      ]
    },
  ]
};
