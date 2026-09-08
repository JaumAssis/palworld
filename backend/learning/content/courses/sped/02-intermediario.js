// Módulo "Intermediário" — 13 lições, 8 questões cada (3 múltipla escolha + 1 lacuna, duas vezes
// por lição). Ver ../index.js para o formato e a validação de boot. Continua o curso conceitual
// de jargões/estrutura do universo SPED (mesmo padrão de ./01-fundamentos.js): novos documentos de
// origem (CT-e, NFS-e), mecanismos específicos de ICMS (Substituição Tributária, GNRE, DIFAL),
// um bloco mais avançado da EFD Fiscal (Bloco K), o universo "trabalhista" adjacente ao SPED
// (EFD-Reinf, eSocial, retenções), guias de pagamento (DARF), a lógica do Simples Nacional
// (PGDAS-D/DAS) e a declaração que confessa débitos federais (DCTF/DCTFWeb). Nenhum exemplo usa
// dado real de empresa/CPF, e o conteúdo evita números/prazos/percentuais específicos, pelo mesmo
// motivo do módulo iniciante.
// Ids não são numericamente sequenciais na ordem pedagógica: smi-11/smi-12/smi-13 foram inseridas
// depois, entre lições já numeradas (mesma convenção dos outros cursos) — DARF logo após GNRE
// (par de guias de pagamento estadual/federal), PGDAS-D logo após DIFAL (fecha o loop do regime
// Simples Nacional, mencionado no iniciante), DCTF/DCTFWeb logo após Retenções e antes do
// Ecossistema (a peça final antes do resumo geral).
module.exports = {
  id: 'intermediario-sped',
  levelKey: 'intermediate',
  order: 2,
  title: 'Intermediário',
  subtitle: 'CT-e, NFS-e, Substituição Tributária, GNRE, DIFAL, Bloco K, Reinf e eSocial',
  accent: '#38bdf8',
  lessons: [
    {
      id: 'smi-01-cte',
      title: 'CT-e: Conhecimento de Transporte Eletrônico',
      goal: 'Entender o que é o CT-e e como ele se diferencia da NF-e.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'Nem toda operação é venda de mercadoria',
            body: 'Além de comprar e vender produtos, empresas contratam transporte de cargas — esse serviço também precisa de um documento fiscal eletrônico próprio.'
          },
          {
            title: 'O que é o CT-e',
            body: 'Conhecimento de Transporte Eletrônico: documento eletrônico (XML), autorizado pelo fisco, que formaliza uma prestação de serviço de transporte de cargas.'
          },
          {
            title: 'CT-e x NF-e',
            body: 'A NF-e documenta a venda/movimentação de uma mercadoria; o CT-e documenta o SERVIÇO de transportar essa mercadoria de um lugar a outro — são documentos complementares, não concorrentes.'
          },
          {
            title: 'Quem emite o CT-e',
            body: 'Normalmente a transportadora (a empresa que presta o serviço de transporte), não quem vende a mercadoria transportada.'
          },
          {
            title: 'Onde o CT-e aparece nas declarações',
            body: 'Assim como a NF-e, o CT-e também alimenta a EFD Fiscal, com registros próprios para documentos de transporte, além de ter relação com a apuração do ICMS sobre o transporte, quando aplicável.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que a sigla CT-e significa?',
          choices: [
            { id: 'a', text: 'Conhecimento de Transporte Eletrônico' },
            { id: 'b', text: 'Certificado de Transferência Empresarial' },
            { id: 'c', text: 'Controle Tributário Estadual' },
            { id: 'd', text: 'Cadastro Tributário Eletrônico' }
          ],
          answer: 'a',
          explanation: 'CT-e é o Conhecimento de Transporte Eletrônico.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que o CT-e documenta?',
          choices: [
            { id: 'a', text: 'Uma prestação de serviço de transporte de cargas' },
            { id: 'b', text: 'A venda de uma mercadoria' },
            { id: 'c', text: 'O pagamento de salários' },
            { id: 'd', text: 'A apuração do IRPJ' }
          ],
          answer: 'a',
          explanation: 'O CT-e formaliza o serviço de transporte, não a venda da mercadoria em si.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual a diferença entre CT-e e NF-e?',
          choices: [
            { id: 'a', text: 'A NF-e documenta a venda/movimentação da mercadoria; o CT-e documenta o serviço de transportá-la' },
            { id: 'b', text: 'São exatamente o mesmo documento, com nomes diferentes' },
            { id: 'c', text: 'O CT-e substitui totalmente a NF-e' },
            { id: 'd', text: 'A NF-e só existe para serviços, nunca para mercadorias' }
          ],
          answer: 'a',
          explanation: 'Cada documento cobre uma parte diferente e complementar da operação.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a sigla do documento eletrônico que formaliza uma prestação de serviço de transporte de cargas:',
          code: 'O ___ é o documento eletrônico que formaliza uma prestação de serviço de transporte de cargas',
          accept: ['CT-e', 'cte', 'ct-e'],
          explanation: 'CT-e é a sigla do Conhecimento de Transporte Eletrônico.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Quem normalmente emite o CT-e?',
          choices: [
            { id: 'a', text: 'A transportadora, empresa que presta o serviço de transporte' },
            { id: 'b', text: 'Sempre quem vende a mercadoria' },
            { id: 'c', text: 'O consumidor final' },
            { id: 'd', text: 'A Receita Federal' }
          ],
          answer: 'a',
          explanation: 'Quem presta o serviço de transporte é quem emite o CT-e correspondente.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'CT-e e NF-e são documentos concorrentes ou complementares?',
          choices: [
            { id: 'a', text: 'Complementares, cada um documenta uma parte diferente da operação' },
            { id: 'b', text: 'Concorrentes, só um dos dois pode ser emitido' },
            { id: 'c', text: 'Não têm relação nenhuma entre si' },
            { id: 'd', text: 'O CT-e sempre cancela a NF-e correspondente' }
          ],
          answer: 'a',
          explanation: 'Os dois documentos se complementam, cobrindo mercadoria e transporte separadamente.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'O CT-e também alimenta qual declaração do SPED, com registros próprios?',
          choices: [
            { id: 'a', text: 'A EFD Fiscal' },
            { id: 'b', text: 'A ECD' },
            { id: 'c', text: 'A ECF' },
            { id: 'd', text: 'Nenhuma declaração' }
          ],
          answer: 'a',
          explanation: 'A EFD Fiscal possui registros próprios para documentos de transporte, como o CT-e.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete quem emite o CT-e, diferente de quem vende a mercadoria transportada:',
          code: 'O CT-e é emitido pela ___, não por quem vende a mercadoria',
          accept: ['transportadora'],
          explanation: 'A transportadora é quem presta o serviço documentado pelo CT-e.'
        }
      ]
    },
    {
      id: 'smi-02-nfse',
      title: 'NFS-e: Nota Fiscal de Serviço eletrônica',
      goal: 'Entender o que é a NFS-e e por que ela segue uma lógica municipal, diferente da NF-e.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'Serviço também gera nota fiscal',
            body: 'Quando uma empresa presta um serviço (em vez de vender mercadoria), o documento fiscal correspondente é a NFS-e, não a NF-e.'
          },
          {
            title: 'O que é a NFS-e',
            body: 'Nota Fiscal de Serviço eletrônica: documento eletrônico que formaliza a prestação de um serviço, sujeito ao ISS (Imposto Sobre Serviços).'
          },
          {
            title: 'Por que é municipal',
            body: 'Diferente do ICMS (estadual) ou do IRPJ (federal), o ISS é um imposto MUNICIPAL — por isso não existe um leiaute único e nacional de NFS-e: cada prefeitura pode ter seu próprio sistema e regras.'
          },
          {
            title: 'A consequência prática dessa fragmentação',
            body: 'Uma empresa que presta serviço em vários municípios pode precisar lidar com sistemas de NFS-e diferentes, um para cada prefeitura — bem diferente da NF-e, que segue um padrão nacional único.'
          },
          {
            title: 'Relação com as declarações do SPED',
            body: 'Receitas de serviços informadas na NFS-e também costumam aparecer na EFD Contribuições (apuração de PIS/COFINS) e nos lançamentos contábeis da ECD, seguindo a mesma lógica de cruzamento já vista no nível iniciante.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que é a NFS-e?',
          choices: [
            { id: 'a', text: 'O documento eletrônico que formaliza a prestação de um serviço, sujeito ao ISS' },
            { id: 'b', text: 'O mesmo que a NF-e, apenas com outro nome' },
            { id: 'c', text: 'Um tipo de guia de recolhimento estadual' },
            { id: 'd', text: 'Uma declaração anual de serviços' }
          ],
          answer: 'a',
          explanation: 'NFS-e formaliza a prestação de serviços, associada ao ISS.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'A que imposto a NFS-e está associada?',
          choices: [
            { id: 'a', text: 'ISS (Imposto Sobre Serviços)' },
            { id: 'b', text: 'ICMS' },
            { id: 'c', text: 'IPI' },
            { id: 'd', text: 'IRPJ' }
          ],
          answer: 'a',
          explanation: 'A NFS-e está associada ao ISS, tributo sobre a prestação de serviços.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Por que o ISS é diferente do ICMS em termos de abrangência?',
          choices: [
            { id: 'a', text: 'Porque o ISS é um imposto municipal, enquanto o ICMS é estadual' },
            { id: 'b', text: 'Porque o ISS é federal e o ICMS é municipal' },
            { id: 'c', text: 'Não há diferença de abrangência entre os dois' },
            { id: 'd', text: 'Porque o ISS só existe para pessoas físicas' }
          ],
          answer: 'a',
          explanation: 'O ISS é de competência municipal; o ICMS, estadual.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a sigla do documento eletrônico que formaliza a prestação de um serviço, sujeito ao ISS:',
          code: 'A ___ é o documento eletrônico que formaliza a prestação de um serviço, sujeito ao ISS',
          accept: ['NFS-e', 'nfs-e', 'nfse'],
          explanation: 'NFS-e é a Nota Fiscal de Serviço eletrônica.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Por que não existe um leiaute único e nacional de NFS-e, como existe para a NF-e?',
          choices: [
            { id: 'a', text: 'Porque o ISS é municipal, e cada prefeitura pode ter seu próprio sistema e regras' },
            { id: 'b', text: 'Porque a NFS-e ainda não foi digitalizada em nenhum lugar' },
            { id: 'c', text: 'Porque a NFS-e é opcional em todo o Brasil' },
            { id: 'd', text: 'Porque o governo federal proíbe um padrão único' }
          ],
          answer: 'a',
          explanation: 'A competência municipal do ISS explica a fragmentação de sistemas de NFS-e.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual a consequência prática de uma empresa prestar serviço em vários municípios?',
          choices: [
            { id: 'a', text: 'Pode precisar lidar com sistemas de NFS-e diferentes, um para cada prefeitura' },
            { id: 'b', text: 'Fica automaticamente isenta de ISS' },
            { id: 'c', text: 'Passa a emitir NF-e no lugar da NFS-e' },
            { id: 'd', text: 'Não há nenhuma consequência prática' }
          ],
          answer: 'a',
          explanation: 'A fragmentação municipal obriga a empresa a lidar com múltiplos sistemas, conforme o município.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Onde receitas de serviços da NFS-e também costumam aparecer?',
          choices: [
            { id: 'a', text: 'Na EFD Contribuições e nos lançamentos contábeis da ECD' },
            { id: 'b', text: 'Apenas na GNRE' },
            { id: 'c', text: 'Somente no CT-e' },
            { id: 'd', text: 'Em nenhuma outra declaração' }
          ],
          answer: 'a',
          explanation: 'As receitas de serviços seguem o mesmo princípio de cruzamento entre declarações.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o tipo de imposto ao qual o ISS pertence, diferente do ICMS (estadual):',
          code: 'Diferente do ICMS (estadual), o ISS é um imposto ___',
          accept: ['municipal'],
          explanation: 'O ISS é de competência municipal.'
        }
      ]
    },
    {
      id: 'smi-03-substituicao-tributaria',
      title: 'Substituição Tributária (ICMS-ST)',
      goal: 'Entender a lógica da Substituição Tributária: quem recolhe o imposto e por quê.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O problema que a ST tenta resolver',
            body: 'Para certos produtos, fiscalizar o ICMS em cada elo da cadeia (fabricante, distribuidor, varejo) seria muito trabalhoso — a Substituição Tributária concentra a cobrança num único ponto.'
          },
          {
            title: 'O que é a Substituição Tributária',
            body: 'Um mecanismo em que um elo da cadeia (geralmente o fabricante ou importador) recolhe ANTECIPADAMENTE o ICMS devido nas etapas seguintes, até chegar ao consumidor final.'
          },
          {
            title: 'Contribuinte substituto x substituído',
            body: 'Quem recolhe antecipadamente é o "substituto tributário"; quem seria o responsável original pelo recolhimento naquela etapa (mas já foi "substituído") é chamado de "substituído".'
          },
          {
            title: 'MVA (Margem de Valor Agregado)',
            body: 'Como o produto ainda vai passar por outras etapas antes do consumidor final, usa-se uma margem estimada (MVA) para calcular o ICMS-ST devido, simulando o preço final provável do produto.'
          },
          {
            title: 'Onde a ST aparece nas declarações',
            body: 'Operações com ICMS-ST têm CFOPs e registros próprios dentro da EFD Fiscal, diferentes das operações "normais" (sem substituição) — reconhecer essa diferença é essencial para não errar a apuração.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual problema a Substituição Tributária tenta resolver?',
          choices: [
            { id: 'a', text: 'A dificuldade de fiscalizar o ICMS separadamente em cada elo da cadeia produtiva' },
            { id: 'b', text: 'A falta de sistemas eletrônicos de nota fiscal' },
            { id: 'c', text: 'A demora na entrega da ECD' },
            { id: 'd', text: 'A ausência de certificado digital nas empresas' }
          ],
          answer: 'a',
          explanation: 'A ST concentra a fiscalização/cobrança num único ponto da cadeia.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que é a Substituição Tributária?',
          choices: [
            { id: 'a', text: 'Um mecanismo em que um elo da cadeia recolhe antecipadamente o ICMS devido nas etapas seguintes' },
            { id: 'b', text: 'A troca de um sócio por outro na empresa' },
            { id: 'c', text: 'Uma isenção total de ICMS para certos produtos' },
            { id: 'd', text: 'A substituição da EFD Fiscal por outra declaração' }
          ],
          answer: 'a',
          explanation: 'A ST antecipa o recolhimento do ICMS de toda a cadeia num único elo.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Quem é o "contribuinte substituto"?',
          choices: [
            { id: 'a', text: 'Quem recolhe antecipadamente o ICMS-ST, geralmente o fabricante ou importador' },
            { id: 'b', text: 'O consumidor final do produto' },
            { id: 'c', text: 'A Secretaria de Fazenda do estado' },
            { id: 'd', text: 'Quem nunca paga ICMS' }
          ],
          answer: 'a',
          explanation: 'O substituto é quem antecipa o recolhimento do imposto de toda a cadeia.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a sigla usada para estimar o preço final do produto no cálculo do ICMS-ST:',
          code: 'A sigla ___ representa a Margem de Valor Agregado, usada para estimar o preço final do produto',
          accept: ['MVA', 'mva'],
          explanation: 'MVA é a Margem de Valor Agregado, usada na estimativa do ICMS-ST.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Para que serve a MVA?',
          choices: [
            { id: 'a', text: 'Simular o preço final provável do produto, para calcular o ICMS-ST devido' },
            { id: 'b', text: 'Definir o CNAE da empresa' },
            { id: 'c', text: 'Calcular o IRPJ devido' },
            { id: 'd', text: 'Substituir o CFOP da operação' }
          ],
          answer: 'a',
          explanation: 'A MVA estima o valor final do produto para o cálculo antecipado do ICMS-ST.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Quem é o "contribuinte substituído"?',
          choices: [
            { id: 'a', text: 'Quem seria o responsável original pelo recolhimento numa etapa, mas já foi substituído por quem recolheu antecipadamente' },
            { id: 'b', text: 'Quem inventou o mecanismo de Substituição Tributária' },
            { id: 'c', text: 'O órgão fiscalizador da operação' },
            { id: 'd', text: 'Sempre o consumidor final' }
          ],
          answer: 'a',
          explanation: 'O substituído é quem seria originalmente responsável, mas teve o recolhimento antecipado por outro elo.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que reconhecer operações com ICMS-ST é importante na EFD Fiscal?',
          choices: [
            { id: 'a', text: 'Porque elas têm CFOPs e registros próprios, diferentes das operações normais, e errar isso gera erro na apuração' },
            { id: 'b', text: 'Porque operações com ST não precisam ser declaradas' },
            { id: 'c', text: 'Porque toda operação com ST é isenta de ICMS' },
            { id: 'd', text: 'Não há diferença de tratamento na EFD Fiscal' }
          ],
          answer: 'a',
          explanation: 'Operações com ST usam CFOPs e registros específicos, diferentes das operações normais.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o termo que identifica quem recolhe o ICMS-ST antecipadamente:',
          code: 'Quem recolhe o ICMS-ST antecipadamente é chamado de contribuinte ___',
          accept: ['substituto'],
          explanation: 'O contribuinte substituto é quem antecipa o recolhimento do imposto.'
        }
      ]
    },
    {
      id: 'smi-04-gnre',
      title: 'GNRE: Guia Nacional de Recolhimento de Tributos Estaduais',
      goal: 'Entender para que serve a GNRE e quando ela costuma ser usada.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'O problema de recolher imposto para OUTRO estado',
            body: 'Quando uma empresa precisa pagar ICMS para um estado diferente do seu (por exemplo, numa operação de Substituição Tributária interestadual), ela precisa de uma guia própria para isso.'
          },
          {
            title: 'O que é a GNRE',
            body: 'Guia Nacional de Recolhimento de Tributos Estaduais: um documento padronizado nacionalmente, usado para recolher tributos estaduais devidos a um estado diferente daquele onde a empresa está localizada.'
          },
          {
            title: 'Quando ela costuma ser usada',
            body: 'Situações comuns incluem ICMS-ST interestadual (quando o substituto está em um estado, e o destino é outro) e o recolhimento do DIFAL (Diferencial de Alíquota, visto na próxima lição).'
          },
          {
            title: 'Por que precisa ser "nacional"',
            body: 'Antes de existir um padrão único, cada estado poderia ter sua própria guia — a GNRE padroniza esse recolhimento entre estados diferentes, facilitando o processo para quem vende para todo o país.'
          },
          {
            title: 'GNRE não é uma declaração do SPED',
            body: 'É importante notar que a GNRE é uma guia de PAGAMENTO (recolhimento), não uma declaração de informações como a EFD Fiscal — mas ela costuma ser gerada a partir de informações que também aparecem na EFD Fiscal.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que a sigla GNRE significa?',
          choices: [
            { id: 'a', text: 'Guia Nacional de Recolhimento de Tributos Estaduais' },
            { id: 'b', text: 'Gestão Nacional de Registros Empresariais' },
            { id: 'c', text: 'Guia de Notas e Recibos Eletrônicos' },
            { id: 'd', text: 'Gerenciamento Nacional de Retenções Estaduais' }
          ],
          answer: 'a',
          explanation: 'GNRE é a Guia Nacional de Recolhimento de Tributos Estaduais.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Para que serve a GNRE?',
          choices: [
            { id: 'a', text: 'Recolher tributos estaduais devidos a um estado diferente daquele onde a empresa está localizada' },
            { id: 'b', text: 'Declarar o IRPJ anual da empresa' },
            { id: 'c', text: 'Substituir a EFD Fiscal por completo' },
            { id: 'd', text: 'Cadastrar uma nova filial da empresa' }
          ],
          answer: 'a',
          explanation: 'A GNRE viabiliza o recolhimento de tributos devidos a outro estado.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Em que situação comum a GNRE costuma ser usada?',
          choices: [
            { id: 'a', text: 'ICMS-ST interestadual ou recolhimento de DIFAL' },
            { id: 'b', text: 'Pagamento de salários de funcionários' },
            { id: 'c', text: 'Emissão de NFS-e' },
            { id: 'd', text: 'Entrega da ECD' }
          ],
          answer: 'a',
          explanation: 'ICMS-ST interestadual e DIFAL são exemplos clássicos de uso da GNRE.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a sigla usada para recolher tributos estaduais devidos a um estado diferente do da empresa:',
          code: 'A ___ é usada para recolher tributos estaduais devidos a um estado diferente daquele onde a empresa está localizada',
          accept: ['GNRE', 'gnre'],
          explanation: 'GNRE é a Guia Nacional de Recolhimento de Tributos Estaduais.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Por que a GNRE precisou ser padronizada nacionalmente?',
          choices: [
            { id: 'a', text: 'Porque antes cada estado poderia ter sua própria guia, dificultando o recolhimento para empresas que vendem para todo o país' },
            { id: 'b', text: 'Porque era exigida pela ONU' },
            { id: 'c', text: 'Porque substituiu a necessidade de emitir nota fiscal' },
            { id: 'd', text: 'Não houve necessidade real de padronização' }
          ],
          answer: 'a',
          explanation: 'A padronização nacional facilita o recolhimento entre diferentes estados.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'A GNRE é uma declaração de informações, como a EFD Fiscal?',
          choices: [
            { id: 'a', text: 'Não, é uma guia de pagamento (recolhimento), não uma declaração de informações' },
            { id: 'b', text: 'Sim, é idêntica à EFD Fiscal' },
            { id: 'c', text: 'Sim, mas só para empresas do Simples Nacional' },
            { id: 'd', text: 'Não, é um tipo de nota fiscal eletrônica' }
          ],
          answer: 'a',
          explanation: 'A GNRE é o documento de recolhimento, não uma declaração de informações.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual a relação entre GNRE e EFD Fiscal?',
          choices: [
            { id: 'a', text: 'A GNRE costuma ser gerada a partir de informações que também aparecem na EFD Fiscal' },
            { id: 'b', text: 'Não têm nenhuma relação entre si' },
            { id: 'c', text: 'A EFD Fiscal é gerada a partir da GNRE, na ordem inversa' },
            { id: 'd', text: 'A GNRE substitui totalmente a EFD Fiscal' }
          ],
          answer: 'a',
          explanation: 'As informações que geram a GNRE costumam vir dos mesmos dados presentes na EFD Fiscal.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete quando a GNRE é usada: quando a empresa precisa recolher tributo estadual para um estado diferente do seu:',
          code: 'A GNRE é usada quando a empresa precisa recolher tributo estadual para um estado ___ do seu',
          accept: ['diferente'],
          explanation: 'A GNRE existe justamente para recolhimentos direcionados a outro estado.'
        }
      ]
    },
    {
      id: 'smi-11-darf',
      title: 'DARF: Documento de Arrecadação de Receitas Federais',
      goal: 'Entender o que é o DARF e para que tributos ele costuma ser usado.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'Recolher para o governo federal',
            body: 'Assim como a GNRE serve para recolher tributos ESTADUAIS, existe um documento equivalente para recolher tributos FEDERAIS.'
          },
          {
            title: 'O que é o DARF',
            body: 'Documento de Arrecadação de Receitas Federais: a guia usada para pagar tributos federais, como IRPJ, CSLL, PIS/COFINS (quando não recolhidos por outra via) e diversas outras receitas administradas pela Receita Federal.'
          },
          {
            title: 'O código de receita',
            body: 'Cada DARF traz um "código de receita", um número que identifica exatamente qual tributo (e às vezes qual finalidade específica) está sendo pago — é comum ouvir "qual o código do DARF" numa conversa fiscal.'
          },
          {
            title: 'DARF x GNRE',
            body: 'Os dois são guias de pagamento (recolhimento), não declarações de informações; a diferença central é o destinatário: DARF vai para a Receita Federal (tributos federais), GNRE vai para um estado (tributos estaduais).'
          },
          {
            title: 'Relação com as declarações já vistas',
            body: 'O valor a pagar no DARF geralmente vem da apuração feita em outra declaração (por exemplo, o IRPJ apurado na ECF, ou o PIS/COFINS apurado na EFD Contribuições) — o DARF é o passo final de PAGAR o que já foi apurado e declarado.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que a sigla DARF significa?',
          choices: [
            { id: 'a', text: 'Documento de Arrecadação de Receitas Federais' },
            { id: 'b', text: 'Declaração Anual de Rendimentos Fiscais' },
            { id: 'c', text: 'Documento de Ajuste e Regularização Fiscal' },
            { id: 'd', text: 'Demonstrativo de Apuração e Recolhimento Federal' }
          ],
          answer: 'a',
          explanation: 'DARF é o Documento de Arrecadação de Receitas Federais.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Para que serve o DARF?',
          choices: [
            { id: 'a', text: 'Pagar tributos federais, como IRPJ, CSLL e PIS/COFINS' },
            { id: 'b', text: 'Declarar débitos federais, sem envolver pagamento' },
            { id: 'c', text: 'Recolher tributos estaduais' },
            { id: 'd', text: 'Cadastrar uma empresa na Receita Federal' }
          ],
          answer: 'a',
          explanation: 'O DARF é a guia de pagamento de tributos federais.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que o "código de receita" de um DARF identifica?',
          choices: [
            { id: 'a', text: 'Exatamente qual tributo (e às vezes qual finalidade específica) está sendo pago' },
            { id: 'b', text: 'O CNPJ da empresa' },
            { id: 'c', text: 'O estado de destino do pagamento' },
            { id: 'd', text: 'O regime tributário da empresa' }
          ],
          answer: 'a',
          explanation: 'O código de receita indica precisamente qual tributo/finalidade está sendo recolhido.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a sigla do documento usado para pagar tributos federais, como IRPJ e CSLL:',
          code: 'O ___ é o documento usado para pagar tributos federais, como IRPJ e CSLL',
          accept: ['DARF', 'darf'],
          explanation: 'DARF é a guia de pagamento de tributos federais.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Qual a diferença central entre DARF e GNRE?',
          choices: [
            { id: 'a', text: 'O DARF vai para a Receita Federal (tributos federais); a GNRE vai para um estado (tributos estaduais)' },
            { id: 'b', text: 'Não há diferença, são o mesmo documento' },
            { id: 'c', text: 'O DARF é estadual e a GNRE é federal' },
            { id: 'd', text: 'A GNRE substitui totalmente o DARF' }
          ],
          answer: 'a',
          explanation: 'A diferença central é o destinatário do recolhimento: federal (DARF) ou estadual (GNRE).'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O DARF é uma declaração de informações?',
          choices: [
            { id: 'a', text: 'Não, é uma guia de pagamento (recolhimento), assim como a GNRE' },
            { id: 'b', text: 'Sim, é equivalente à EFD Fiscal' },
            { id: 'c', text: 'Sim, mas só para empresas do Simples Nacional' },
            { id: 'd', text: 'Não, é um tipo de nota fiscal eletrônica' }
          ],
          answer: 'a',
          explanation: 'O DARF é a guia de pagamento, não uma declaração de informações.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'De onde geralmente vem o valor a pagar no DARF?',
          choices: [
            { id: 'a', text: 'Da apuração feita em outra declaração, como a ECF ou a EFD Contribuições' },
            { id: 'b', text: 'De um valor fixo, igual para todas as empresas' },
            { id: 'c', text: 'Do valor total do CT-e emitido no período' },
            { id: 'd', text: 'Não tem relação com nenhuma outra declaração' }
          ],
          answer: 'a',
          explanation: 'O valor do DARF costuma vir da apuração já feita em outra declaração.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o termo que identifica exatamente qual tributo está sendo pago num DARF:',
          code: 'O ___ de receita identifica exatamente qual tributo está sendo pago num DARF',
          accept: ['código'],
          explanation: 'O código de receita especifica o tributo/finalidade do pagamento no DARF.'
        }
      ]
    },
    {
      id: 'smi-05-difal',
      title: 'DIFAL: Diferencial de Alíquota do ICMS',
      goal: 'Entender o que é o DIFAL e por que ele existe nas vendas interestaduais para consumidor final.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'O problema das vendas interestaduais',
            body: 'Quando uma empresa vende para um consumidor final em outro estado, surge a dúvida: o ICMS fica todo com o estado de origem, ou parte vai para o estado de destino?'
          },
          {
            title: 'O que é o DIFAL',
            body: 'Diferencial de Alíquota: a diferença entre a alíquota interna do estado de destino e a alíquota interestadual usada na operação — a parte do ICMS que cabe ao estado de destino.'
          },
          {
            title: 'Por que ele existe',
            body: 'Sem o DIFAL, estados que são principalmente "destino" de vendas (via e-commerce, por exemplo) ficariam sem receita de ICMS nessas operações, já que a venda "nasceu" em outro estado.'
          },
          {
            title: 'Quem recolhe o DIFAL',
            body: 'Depende da operação: em vendas para consumidor final que também é contribuinte do ICMS, geralmente é o destinatário quem recolhe; em vendas para consumidor final não contribuinte, costuma ser o remetente.'
          },
          {
            title: 'Onde o DIFAL aparece nas declarações',
            body: 'O cálculo e o recolhimento do DIFAL aparecem tanto na EFD Fiscal (registros específicos) quanto, quando aplicável, através da GNRE, vista na lição anterior.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que a sigla DIFAL significa?',
          choices: [
            { id: 'a', text: 'Diferencial de Alíquota (do ICMS)' },
            { id: 'b', text: 'Documento de Identificação Fiscal e Aduaneiro' },
            { id: 'c', text: 'Declaração Interestadual de Faturamento Anual' },
            { id: 'd', text: 'Débito Fiscal de Alíquota Legal' }
          ],
          answer: 'a',
          explanation: 'DIFAL é o Diferencial de Alíquota do ICMS.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O DIFAL representa o quê?',
          choices: [
            { id: 'a', text: 'A diferença entre a alíquota interna do estado de destino e a alíquota interestadual da operação' },
            { id: 'b', text: 'O valor total do ICMS de uma operação' },
            { id: 'c', text: 'Uma multa por atraso na entrega da EFD Fiscal' },
            { id: 'd', text: 'O percentual de MVA aplicado na Substituição Tributária' }
          ],
          answer: 'a',
          explanation: 'DIFAL é a diferença entre a alíquota interna de destino e a interestadual aplicada.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Por que o DIFAL existe?',
          choices: [
            { id: 'a', text: 'Para garantir que o estado de destino de uma venda interestadual também receba parte do ICMS' },
            { id: 'b', text: 'Para eliminar completamente o ICMS de vendas interestaduais' },
            { id: 'c', text: 'Para simplificar a emissão de NF-e' },
            { id: 'd', text: 'Para substituir a necessidade de GNRE' }
          ],
          answer: 'a',
          explanation: 'O DIFAL garante uma divisão de receita de ICMS entre origem e destino.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a sigla da diferença entre a alíquota interna do destino e a interestadual da operação:',
          code: 'O ___ é a diferença entre a alíquota interna do estado de destino e a alíquota interestadual',
          accept: ['DIFAL', 'difal'],
          explanation: 'DIFAL é o Diferencial de Alíquota do ICMS.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Numa venda interestadual, o ICMS fica só com o estado de origem?',
          choices: [
            { id: 'a', text: 'Não, o DIFAL garante que parte do ICMS caiba ao estado de destino' },
            { id: 'b', text: 'Sim, sempre fica integralmente com a origem' },
            { id: 'c', text: 'Sim, o destino nunca recebe nenhuma parte do ICMS' },
            { id: 'd', text: 'Depende só do CFOP usado, sem relação com o DIFAL' }
          ],
          answer: 'a',
          explanation: 'O DIFAL existe exatamente para dividir a receita de ICMS entre origem e destino.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Em vendas para consumidor final não contribuinte de ICMS, quem costuma recolher o DIFAL?',
          choices: [
            { id: 'a', text: 'O remetente (vendedor)' },
            { id: 'b', text: 'Sempre o destinatário' },
            { id: 'c', text: 'A transportadora' },
            { id: 'd', text: 'Ninguém, é dispensado nesses casos' }
          ],
          answer: 'a',
          explanation: 'Nesse cenário, o remetente costuma ser o responsável pelo recolhimento do DIFAL.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Onde o cálculo/recolhimento do DIFAL costuma aparecer?',
          choices: [
            { id: 'a', text: 'Na EFD Fiscal e, quando aplicável, através da GNRE' },
            { id: 'b', text: 'Somente na ECD' },
            { id: 'c', text: 'Apenas no CT-e' },
            { id: 'd', text: 'Em nenhuma declaração ou guia' }
          ],
          answer: 'a',
          explanation: 'O DIFAL aparece na EFD Fiscal e pode ser recolhido via GNRE.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o tipo de estado que ficaria sem parte do ICMS de vendas interestaduais, sem o DIFAL:',
          code: 'Sem o DIFAL, estados que são principalmente ___ de vendas ficariam sem parte do ICMS dessas operações',
          accept: ['destino'],
          explanation: 'Estados de destino são os que o DIFAL protege, garantindo parte da receita de ICMS.'
        }
      ]
    },
    {
      id: 'smi-12-pgdasd',
      title: 'PGDAS-D: como o Simples Nacional declara e paga',
      goal: 'Entender como empresas do Simples Nacional calculam e declaram seus tributos, diferente da lógica das EFDs.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'Relembrando o Simples Nacional',
            body: 'Vimos no nível iniciante que o Simples Nacional unifica vários tributos numa única guia — mas como, na prática, esse cálculo mensal é feito?'
          },
          {
            title: 'O que é o PGDAS-D',
            body: 'Programa Gerador do Documento de Arrecadação do Simples Nacional (Declaratório): sistema onde a empresa do Simples Nacional informa sua receita mensal e o próprio programa calcula o valor unificado devido.'
          },
          {
            title: 'Por que é diferente das EFDs',
            body: 'Empresas do Simples Nacional, de forma geral, não entregam EFD Fiscal ou EFD Contribuições da mesma forma que empresas de outros regimes — o PGDAS-D já concentra o cálculo e a declaração num único lugar, mais simples.'
          },
          {
            title: 'DAS — o documento de pagamento gerado',
            body: 'Depois de preenchido o PGDAS-D, o sistema gera o DAS (Documento de Arrecadação do Simples Nacional), a guia única de pagamento que reúne todos os tributos do regime.'
          },
          {
            title: 'Simplicidade tem seus limites',
            body: 'A simplicidade do Simples Nacional (e do PGDAS-D) não significa ausência total de obrigações acessórias — dependendo do porte e da atividade, ainda pode haver outras declarações exigidas, mas o volume costuma ser bem menor que nos demais regimes.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que é o PGDAS-D?',
          choices: [
            { id: 'a', text: 'O sistema onde a empresa do Simples Nacional informa sua receita mensal e o programa calcula o valor unificado devido' },
            { id: 'b', text: 'Uma guia de pagamento de tributos estaduais' },
            { id: 'c', text: 'O mesmo que a EFD Fiscal, apenas com outro nome' },
            { id: 'd', text: 'Um bloco dentro da ECF' }
          ],
          answer: 'a',
          explanation: 'PGDAS-D calcula e declara o valor unificado devido pela empresa do Simples Nacional.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Por que o PGDAS-D é diferente da lógica das EFDs?',
          choices: [
            { id: 'a', text: 'Porque concentra cálculo e declaração num único lugar, mais simples, sem a mesma estrutura de blocos/registros' },
            { id: 'b', text: 'Porque exige ainda mais blocos e registros que a EFD Fiscal' },
            { id: 'c', text: 'Não há diferença nenhuma entre os dois' },
            { id: 'd', text: 'Porque o PGDAS-D é exclusivo para grandes empresas' }
          ],
          answer: 'a',
          explanation: 'O PGDAS-D é mais simples e concentrado, refletindo a simplificação do próprio regime.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que é o DAS?',
          choices: [
            { id: 'a', text: 'O Documento de Arrecadação do Simples Nacional, a guia única de pagamento gerada após o PGDAS-D' },
            { id: 'b', text: 'O mesmo que o DARF, apenas com outro nome' },
            { id: 'c', text: 'Uma declaração de débitos federais' },
            { id: 'd', text: 'Um bloco de registros da EFD Fiscal' }
          ],
          answer: 'a',
          explanation: 'DAS é a guia única de pagamento gerada a partir do cálculo feito no PGDAS-D.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a sigla do sistema onde a empresa do Simples Nacional informa sua receita mensal e calcula o valor devido:',
          code: 'O ___ é o sistema onde a empresa do Simples Nacional informa sua receita mensal e calcula o valor devido',
          accept: ['PGDAS-D', 'pgdas-d', 'PGDASD', 'pgdasd'],
          explanation: 'PGDAS-D é o Programa Gerador do Documento de Arrecadação do Simples Nacional (Declaratório).'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Empresas do Simples Nacional costumam entregar EFD Fiscal/Contribuições da mesma forma que outros regimes?',
          choices: [
            { id: 'a', text: 'Não, de forma geral não entregam da mesma forma, o PGDAS-D já concentra o cálculo' },
            { id: 'b', text: 'Sim, exatamente da mesma forma que o Lucro Real' },
            { id: 'c', text: 'Sim, mas só em anos ímpares' },
            { id: 'd', text: 'Não existe nenhuma declaração para o Simples Nacional' }
          ],
          answer: 'a',
          explanation: 'O PGDAS-D substitui, para o Simples Nacional, a lógica das EFDs de outros regimes.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que o DAS reúne?',
          choices: [
            { id: 'a', text: 'Todos os tributos unificados do Simples Nacional, numa única guia de pagamento' },
            { id: 'b', text: 'Apenas o ICMS devido pela empresa' },
            { id: 'c', text: 'Apenas o INSS dos funcionários' },
            { id: 'd', text: 'Somente o IRPJ da empresa' }
          ],
          answer: 'a',
          explanation: 'O DAS unifica todos os tributos do Simples Nacional numa única guia.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'A simplicidade do Simples Nacional elimina totalmente as obrigações acessórias?',
          choices: [
            { id: 'a', text: 'Não, ainda pode haver outras declarações exigidas, mas o volume costuma ser bem menor' },
            { id: 'b', text: 'Sim, empresas do Simples não têm nenhuma obrigação acessória' },
            { id: 'c', text: 'Sim, o PGDAS-D substitui absolutamente tudo' },
            { id: 'd', text: 'Não é possível saber, depende só do estado' }
          ],
          answer: 'a',
          explanation: 'A simplificação reduz o volume de obrigações, mas não as elimina por completo.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a sigla da guia única de pagamento gerada após o PGDAS-D:',
          code: 'Depois de preenchido o PGDAS-D, o sistema gera o ___, a guia única de pagamento do Simples Nacional',
          accept: ['DAS', 'das'],
          explanation: 'DAS é o Documento de Arrecadação do Simples Nacional.'
        }
      ]
    },
    {
      id: 'smi-06-bloco-k',
      title: 'Bloco K: Controle da Produção e do Estoque',
      goal: 'Entender o que o Bloco K acrescenta à EFD Fiscal, para empresas industriais.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Além de notas e apuração',
            body: 'A EFD Fiscal, vista no nível iniciante, não se resume só a notas fiscais e apuração de ICMS/IPI — para determinadas empresas (principalmente indústrias), existe um bloco adicional de controle bem mais detalhado.'
          },
          {
            title: 'O que é o Bloco K',
            body: 'Um conjunto de registros dentro da própria EFD Fiscal, dedicado ao Controle da Produção e do Estoque — mostra insumos consumidos, produtos fabricados e a movimentação de estoque, produto a produto.'
          },
          {
            title: 'Por que ele é temido',
            body: 'Diferente da apuração geral (mais resumida), o Bloco K exige um nível de detalhe bem maior — a empresa precisa efetivamente controlar sua produção internamente para conseguir gerar essas informações corretamente.'
          },
          {
            title: 'Quem costuma ser obrigado',
            body: 'De forma geral, indústrias (e alguns equiparados) acima de determinado porte precisam entregar o Bloco K — nem toda empresa que entrega EFD Fiscal também entrega o Bloco K.'
          },
          {
            title: 'A relação com o restante da EFD Fiscal',
            body: 'O Bloco K é só mais um conjunto de registros dentro do MESMO arquivo da EFD Fiscal (não é uma declaração separada) — reforça a ideia de que "EFD Fiscal" é, na prática, um leiaute bem mais amplo do que só notas fiscais e apuração.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O Bloco K faz parte de qual declaração?',
          choices: [
            { id: 'a', text: 'Da própria EFD Fiscal, como um conjunto de registros adicional' },
            { id: 'b', text: 'É uma declaração totalmente separada da EFD Fiscal' },
            { id: 'c', text: 'Da ECD' },
            { id: 'd', text: 'Da GNRE' }
          ],
          answer: 'a',
          explanation: 'O Bloco K é parte do mesmo arquivo da EFD Fiscal, não uma declaração à parte.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Para que serve o Bloco K?',
          choices: [
            { id: 'a', text: 'Controle detalhado da produção e do estoque da empresa' },
            { id: 'b', text: 'Cálculo do IRPJ e da CSLL' },
            { id: 'c', text: 'Controle de retenções sobre serviços' },
            { id: 'd', text: 'Cadastro de funcionários' }
          ],
          answer: 'a',
          explanation: 'O Bloco K detalha produção e estoque, produto a produto.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Por que o Bloco K é considerado mais trabalhoso que a apuração geral da EFD Fiscal?',
          choices: [
            { id: 'a', text: 'Porque exige um nível de detalhe bem maior, produto a produto' },
            { id: 'b', text: 'Porque não pode ser gerado por nenhum sistema' },
            { id: 'c', text: 'Porque substitui completamente a apuração de ICMS' },
            { id: 'd', text: 'Não é considerado mais trabalhoso, é o contrário' }
          ],
          answer: 'a',
          explanation: 'O detalhamento produto a produto exige controle interno de produção muito mais preciso.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a letra do bloco dedicado ao Controle da Produção e do Estoque, dentro da EFD Fiscal:',
          code: 'O Bloco ___ é dedicado ao Controle da Produção e do Estoque, dentro da EFD Fiscal',
          accept: ['K', 'k'],
          explanation: 'Bloco K é o conjunto de registros de produção e estoque da EFD Fiscal.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Quem costuma ser obrigado a entregar o Bloco K?',
          choices: [
            { id: 'a', text: 'Indústrias (e alguns equiparados) acima de determinado porte' },
            { id: 'b', text: 'Todas as empresas, sem exceção' },
            { id: 'c', text: 'Somente empresas do Simples Nacional' },
            { id: 'd', text: 'Apenas prestadoras de serviço' }
          ],
          answer: 'a',
          explanation: 'O Bloco K costuma ser exigido de indústrias acima de determinado porte.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Toda empresa que entrega EFD Fiscal também entrega o Bloco K?',
          choices: [
            { id: 'a', text: 'Não, nem toda empresa que entrega EFD Fiscal também entrega o Bloco K' },
            { id: 'b', text: 'Sim, é sempre obrigatório junto com a EFD Fiscal' },
            { id: 'c', text: 'Sim, mas só para empresas do Lucro Presumido' },
            { id: 'd', text: 'Não existe relação entre EFD Fiscal e Bloco K' }
          ],
          answer: 'a',
          explanation: 'O Bloco K é exigido apenas de determinado perfil de empresas, não de todas.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'O que o Bloco K mostra, especificamente?',
          choices: [
            { id: 'a', text: 'Insumos consumidos, produtos fabricados e a movimentação de estoque, produto a produto' },
            { id: 'b', text: 'Apenas o valor total de vendas do mês' },
            { id: 'c', text: 'Somente o quadro de funcionários' },
            { id: 'd', text: 'Apenas o certificado digital utilizado' }
          ],
          answer: 'a',
          explanation: 'O Bloco K detalha o fluxo de produção e estoque, produto a produto.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o nome da declaração da qual o Bloco K é um conjunto de registros:',
          code: 'O Bloco K é um conjunto de registros dentro do mesmo arquivo da EFD ___',
          accept: ['Fiscal', 'fiscal'],
          explanation: 'O Bloco K está dentro do mesmo leiaute da EFD Fiscal.'
        }
      ]
    },
    {
      id: 'smi-07-reinf',
      title: 'EFD-Reinf',
      goal: 'Entender o que a EFD-Reinf declara e como ela se relaciona com retenções e o eSocial.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'O que ficou de fora das EFDs vistas até aqui',
            body: 'Nem toda informação fiscal é sobre mercadorias (ICMS/IPI) ou receita bruta (PIS/COFINS) — retenções sobre serviços prestados/tomados, por exemplo, precisam de um lugar próprio.'
          },
          {
            title: 'O que é a EFD-Reinf',
            body: 'Declaração que reúne informações sobre retenções (como INSS sobre serviços tomados/prestados) e outras receitas não relacionadas diretamente ao trabalho, complementando o universo do eSocial.'
          },
          {
            title: 'Retenção na fonte — o conceito central',
            body: 'Quando uma empresa CONTRATA um serviço e é obrigada, por lei, a reter uma parte do pagamento e recolher diretamente ao governo (em vez de pagar o valor cheio ao prestador), isso é chamado de retenção na fonte.'
          },
          {
            title: 'Por que a Reinf existe separada do eSocial',
            body: 'O eSocial (próxima lição) foca principalmente em informações trabalhistas/previdenciárias ligadas a empregados; a Reinf cobre eventos que não são estritamente "folha de pagamento", como retenções sobre serviços de terceiros.'
          },
          {
            title: 'Periodicidade',
            body: 'Assim como as EFDs fiscais, a EFD-Reinf costuma ser entregue mensalmente, refletindo os eventos (retenções, pagamentos) ocorridos naquele período.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que a EFD-Reinf declara, de forma geral?',
          choices: [
            { id: 'a', text: 'Retenções (como INSS sobre serviços) e outras receitas não diretamente relacionadas ao trabalho' },
            { id: 'b', text: 'Apenas a apuração de ICMS/IPI' },
            { id: 'c', text: 'Somente o plano de contas contábil' },
            { id: 'd', text: 'Apenas o quadro societário da empresa' }
          ],
          answer: 'a',
          explanation: 'A Reinf foca em retenções e outras receitas fora do escopo das EFDs fiscais clássicas.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que é "retenção na fonte"?',
          choices: [
            { id: 'a', text: 'Quando quem contrata um serviço retém uma parte do pagamento e recolhe diretamente ao governo, em vez de pagar o valor cheio ao prestador' },
            { id: 'b', text: 'Quando o prestador de serviço se recusa a receber o pagamento' },
            { id: 'c', text: 'Quando o governo devolve um valor pago em excesso' },
            { id: 'd', text: 'Quando uma nota fiscal é cancelada' }
          ],
          answer: 'a',
          explanation: 'Retenção na fonte é o desconto e recolhimento direto ao governo, feito por quem paga.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual a diferença de foco entre a Reinf e o eSocial?',
          choices: [
            { id: 'a', text: 'A Reinf cobre eventos que não são estritamente folha de pagamento, como retenções sobre serviços de terceiros; o eSocial foca em informações trabalhistas/previdenciárias de empregados' },
            { id: 'b', text: 'Não há diferença, são a mesma declaração' },
            { id: 'c', text: 'A Reinf só existe para empresas do Simples Nacional' },
            { id: 'd', text: 'O eSocial cobre retenções, e a Reinf cobre folha de pagamento' }
          ],
          answer: 'a',
          explanation: 'Cada uma cobre um recorte diferente do universo trabalhista/de retenções.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o nome da EFD que reúne informações sobre retenções e outras receitas não relacionadas diretamente ao trabalho:',
          code: 'A EFD-___ reúne informações sobre retenções e outras receitas não relacionadas diretamente ao trabalho',
          accept: ['Reinf', 'reinf'],
          explanation: 'EFD-Reinf é a declaração de retenções e outras informações fiscais relacionadas.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Com que periodicidade a EFD-Reinf costuma ser entregue?',
          choices: [
            { id: 'a', text: 'Mensalmente' },
            { id: 'b', text: 'Anualmente' },
            { id: 'c', text: 'A cada 5 anos' },
            { id: 'd', text: 'Só na abertura da empresa' }
          ],
          answer: 'a',
          explanation: 'A EFD-Reinf, como as demais EFDs, costuma ter periodicidade mensal.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Dê um exemplo do tipo de retenção que a Reinf costuma declarar.',
          choices: [
            { id: 'a', text: 'INSS sobre serviços tomados/prestados' },
            { id: 'b', text: 'ICMS sobre venda de mercadorias' },
            { id: 'c', text: 'IPI sobre produtos industrializados' },
            { id: 'd', text: 'ISS de outro município' }
          ],
          answer: 'a',
          explanation: 'A retenção de INSS sobre serviços é um exemplo típico coberto pela Reinf.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que "retenções sobre serviços" precisam de um lugar próprio nas declarações?',
          choices: [
            { id: 'a', text: 'Porque não são sobre mercadorias (ICMS/IPI) nem sobre receita bruta (PIS/COFINS), são um tipo diferente de informação fiscal' },
            { id: 'b', text: 'Porque são idênticas à apuração de ICMS' },
            { id: 'c', text: 'Porque não têm nenhuma relevância fiscal' },
            { id: 'd', text: 'Porque só existem em teoria, nunca na prática' }
          ],
          answer: 'a',
          explanation: 'Retenções sobre serviços são um tipo de informação distinto do que EFD Fiscal/Contribuições cobrem.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o termo que descreve quando quem contrata reté parte do pagamento e recolhe ao governo:',
          code: 'Quando quem contrata um serviço retém parte do pagamento e recolhe ao governo, isso se chama retenção na ___',
          accept: ['fonte'],
          explanation: 'Retenção na fonte é o termo usado para esse desconto e recolhimento direto.'
        }
      ]
    },
    {
      id: 'smi-08-esocial',
      title: 'eSocial',
      goal: 'Entender o que é o eSocial e por que ele é tratado como parte do "SPED trabalhista".',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'Informação trabalhista também é digital',
            body: 'Assim como a contabilidade e o fiscal, as informações trabalhistas e previdenciárias de uma empresa (admissões, demissões, folha de pagamento) também passaram a ser entregues digitalmente, de forma padronizada.'
          },
          {
            title: 'O que é o eSocial',
            body: 'Sistema de escrituração digital das obrigações fiscais, previdenciárias e trabalhistas — reúne, num único ambiente, eventos como admissão, afastamento, férias, folha de pagamento e desligamento de empregados.'
          },
          {
            title: 'Por que costuma ser chamado de "SPED trabalhista"',
            body: 'Embora tecnicamente seja um sistema separado (não faz parte do SPED "oficial"), o eSocial segue a mesma lógica de escrituração digital padronizada e é tratado, no dia a dia, como parte da mesma "família" de obrigações digitais.'
          },
          {
            title: 'Relação com a EFD-Reinf',
            body: 'eSocial e EFD-Reinf, juntos, substituíram diversas obrigações trabalhistas/previdenciárias que antes eram entregues separadamente (como a antiga GFIP) — os dois sistemas se complementam, cobrindo o universo de informações sobre trabalho e retenções.'
          },
          {
            title: 'Por que isso importa para quem mexe com SPED fiscal/contábil',
            body: 'Mesmo quem trabalha só com as declarações fiscais/contábeis "clássicas" (ECD, ECF, EFDs) costuma esbarrar em conversas sobre eSocial/Reinf, já que compartilham prazos, jargões e, muitas vezes, os mesmos sistemas internos da empresa.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que é o eSocial?',
          choices: [
            { id: 'a', text: 'Sistema de escrituração digital das obrigações fiscais, previdenciárias e trabalhistas' },
            { id: 'b', text: 'Um tipo de imposto sobre a folha de pagamento' },
            { id: 'c', text: 'A versão digital da ECD' },
            { id: 'd', text: 'Um bloco dentro da EFD Fiscal' }
          ],
          answer: 'a',
          explanation: 'eSocial escritura digitalmente eventos trabalhistas, previdenciários e fiscais relacionados.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Que tipo de evento o eSocial reúne?',
          choices: [
            { id: 'a', text: 'Admissão, afastamento, férias, folha de pagamento e desligamento de empregados' },
            { id: 'b', text: 'Apenas notas fiscais de venda' },
            { id: 'c', text: 'Apenas a apuração de ICMS' },
            { id: 'd', text: 'Somente o balancete contábil' }
          ],
          answer: 'a',
          explanation: 'O eSocial cobre o ciclo de vida do vínculo empregatício e eventos relacionados.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Por que o eSocial costuma ser chamado de "SPED trabalhista", mesmo não fazendo parte oficialmente do SPED?',
          choices: [
            { id: 'a', text: 'Porque segue a mesma lógica de escrituração digital padronizada, tratado como parte da mesma família de obrigações' },
            { id: 'b', text: 'Porque foi criado antes do próprio SPED' },
            { id: 'c', text: 'Porque substitui totalmente a ECD' },
            { id: 'd', text: 'Não há motivo, é um erro comum sem fundamento' }
          ],
          answer: 'a',
          explanation: 'A semelhança de lógica e propósito faz o eSocial ser tratado no dia a dia como parte da família SPED.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o nome do sistema que reúne eventos trabalhistas e previdenciários como admissão, férias e folha de pagamento:',
          code: 'O ___ reúne eventos trabalhistas e previdenciários como admissão, férias e folha de pagamento',
          accept: ['eSocial', 'esocial'],
          explanation: 'eSocial é o sistema de escrituração digital de eventos trabalhistas/previdenciários.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Qual a relação entre eSocial e EFD-Reinf?',
          choices: [
            { id: 'a', text: 'Juntos substituíram diversas obrigações trabalhistas/previdenciárias antes entregues separadamente, complementando-se' },
            { id: 'b', text: 'Não têm nenhuma relação entre si' },
            { id: 'c', text: 'A Reinf substituiu totalmente o eSocial' },
            { id: 'd', text: 'São a mesma declaração, com nomes diferentes' }
          ],
          answer: 'a',
          explanation: 'Os dois sistemas se complementam, cobrindo o universo trabalhista/de retenções.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Por que quem trabalha só com declarações fiscais/contábeis clássicas ainda esbarra em conversas sobre eSocial?',
          choices: [
            { id: 'a', text: 'Porque compartilham prazos, jargões e muitas vezes os mesmos sistemas internos da empresa' },
            { id: 'b', text: 'Porque o eSocial substituiu completamente a ECD e a ECF' },
            { id: 'c', text: 'Não há razão real, são assuntos totalmente isolados' },
            { id: 'd', text: 'Porque o eSocial é obrigatório só para quem entrega EFD Fiscal' }
          ],
          answer: 'a',
          explanation: 'O compartilhamento de prazos, jargões e sistemas aproxima as duas áreas no dia a dia.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Que tipo de obrigação antiga eSocial/Reinf ajudaram a substituir?',
          choices: [
            { id: 'a', text: 'Obrigações trabalhistas/previdenciárias entregues separadamente, como a antiga GFIP' },
            { id: 'b', text: 'A antiga DIPJ' },
            { id: 'c', text: 'A antiga EFD Fiscal em papel' },
            { id: 'd', text: 'Nenhuma obrigação anterior, são totalmente novas' }
          ],
          answer: 'a',
          explanation: 'eSocial/Reinf unificaram obrigações antes fragmentadas, como a antiga GFIP.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o termo pelo qual o eSocial é tratado no dia a dia, mesmo sendo tecnicamente separado do SPED:',
          code: 'O eSocial é tratado, no dia a dia, como parte do "SPED ___", mesmo sendo tecnicamente separado',
          accept: ['trabalhista'],
          explanation: '"SPED trabalhista" é o apelido comum para o eSocial, dada a semelhança de lógica.'
        }
      ]
    },
    {
      id: 'smi-09-retencoes',
      title: 'Retenções na fonte: IRRF, INSS e CSRF',
      goal: 'Entender a lógica geral das retenções sobre pagamentos de serviços, e por que aparecem em várias declarações.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'Relembrando: o que é retenção',
            body: 'Vimos na Reinf que "reter" é descontar uma parte do pagamento e recolher direto ao governo, em vez de repassar o valor cheio ao prestador do serviço.'
          },
          {
            title: 'Os tributos mais comuns retidos sobre serviços',
            body: 'IRRF (Imposto de Renda Retido na Fonte), INSS (contribuição previdenciária) e, em determinados casos, PIS/COFINS/CSLL retidos na fonte (às vezes chamados em conjunto de "CSRF").'
          },
          {
            title: 'Por que o governo prefere reter na fonte',
            body: 'Reter na fonte antecipa a arrecadação e reduz o risco de inadimplência: em vez de depender que o prestador declare e pague depois, uma parte já é recolhida no momento do pagamento.'
          },
          {
            title: 'Quem é responsável pela retenção',
            body: 'Normalmente é o CONTRATANTE do serviço (quem paga) o responsável por calcular, reter e recolher esse valor — o prestador recebe o valor líquido, já descontado.'
          },
          {
            title: 'Onde essas retenções aparecem nas declarações',
            body: 'As retenções feitas pela empresa aparecem na EFD-Reinf (para quem retém sobre serviços de terceiros) e, quando a própria empresa sofre retenção, isso também é refletido na sua própria apuração de PIS/COFINS/IRPJ.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que significa "reter" um pagamento?',
          choices: [
            { id: 'a', text: 'Descontar uma parte do pagamento e recolher direto ao governo, em vez de repassar o valor cheio ao prestador' },
            { id: 'b', text: 'Atrasar o pagamento ao prestador por tempo indeterminado' },
            { id: 'c', text: 'Cancelar totalmente o pagamento' },
            { id: 'd', text: 'Pagar o valor em dobro ao prestador' }
          ],
          answer: 'a',
          explanation: 'Reter significa descontar e recolher diretamente ao governo parte do valor pago.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Cite um tributo comumente retido sobre pagamentos de serviços.',
          choices: [
            { id: 'a', text: 'IRRF (Imposto de Renda Retido na Fonte)' },
            { id: 'b', text: 'ICMS' },
            { id: 'c', text: 'IPI' },
            { id: 'd', text: 'ISS sempre em qualquer caso, sem exceção' }
          ],
          answer: 'a',
          explanation: 'IRRF é um dos tributos mais comuns retidos sobre pagamentos de serviços.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Por que o governo prefere reter tributos na fonte?',
          choices: [
            { id: 'a', text: 'Porque antecipa a arrecadação e reduz o risco de inadimplência' },
            { id: 'b', text: 'Porque isso elimina totalmente a necessidade de fiscalização' },
            { id: 'c', text: 'Porque é uma exigência apenas simbólica, sem efeito prático' },
            { id: 'd', text: 'Porque reduz o valor total do tributo devido' }
          ],
          answer: 'a',
          explanation: 'A retenção na fonte garante arrecadação antecipada e mais segura.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a sigla do Imposto de Renda Retido na Fonte:',
          code: 'O ___ é o Imposto de Renda Retido na Fonte, um dos tributos comumente retidos sobre serviços',
          accept: ['IRRF', 'irrf'],
          explanation: 'IRRF é o Imposto de Renda Retido na Fonte.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Quem normalmente é responsável por calcular, reter e recolher o valor retido?',
          choices: [
            { id: 'a', text: 'O contratante do serviço (quem paga)' },
            { id: 'b', text: 'O prestador do serviço, sempre' },
            { id: 'c', text: 'A Receita Federal, diretamente' },
            { id: 'd', text: 'Um banco terceirizado' }
          ],
          answer: 'a',
          explanation: 'O contratante (fonte pagadora) é o responsável pela retenção e recolhimento.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O prestador de serviço recebe o valor cheio ou já descontado quando há retenção?',
          choices: [
            { id: 'a', text: 'Recebe o valor líquido, já descontado da retenção' },
            { id: 'b', text: 'Recebe sempre o valor cheio, sem desconto' },
            { id: 'c', text: 'Recebe o dobro do valor combinado' },
            { id: 'd', text: 'Não recebe nada quando há retenção' }
          ],
          answer: 'a',
          explanation: 'O valor retido é descontado antes do pagamento chegar ao prestador.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Onde as retenções sobre serviços de terceiros costumam ser declaradas?',
          choices: [
            { id: 'a', text: 'Na EFD-Reinf' },
            { id: 'b', text: 'Somente na ECD' },
            { id: 'c', text: 'Apenas no CT-e' },
            { id: 'd', text: 'Em nenhuma declaração' }
          ],
          answer: 'a',
          explanation: 'A EFD-Reinf é o local próprio para declarar retenções sobre serviços de terceiros.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o termo usado para PIS/COFINS/CSLL retidos na fonte em conjunto:',
          code: 'O termo às vezes usado para PIS/COFINS/CSLL retidos na fonte em conjunto é ___',
          accept: ['CSRF', 'csrf'],
          explanation: 'CSRF é o termo usado para o conjunto dessas contribuições retidas na fonte.'
        }
      ]
    },
    {
      id: 'smi-13-dctf',
      title: 'DCTF e DCTFWeb',
      goal: 'Entender o que é a DCTF/DCTFWeb e por que ela "confessa" ao fisco os débitos já apurados.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Apurar não é o mesmo que confessar o débito',
            body: 'Já vimos que declarações como a ECF e a EFD Contribuições apuram o valor de um tributo — mas existe uma declaração específica cuja função é formalmente CONFESSAR ao fisco que aquele débito existe, para fins de cobrança.'
          },
          {
            title: 'O que é a DCTF',
            body: 'Declaração de Débitos e Créditos Tributários Federais: reúne, período a período, os débitos federais apurados pela empresa (IRPJ, CSLL, PIS/COFINS...) e os créditos usados para compensá-los.'
          },
          {
            title: 'Por que "confessar" o débito importa',
            body: 'Uma vez que o débito é confessado na DCTF, ele pode ser cobrado diretamente pela Receita Federal (inscrito em dívida ativa, se não pago) — é um passo formal com consequências práticas.'
          },
          {
            title: 'DCTFWeb — a evolução mais recente',
            body: 'A DCTFWeb ampliou o alcance da DCTF, passando também a reunir débitos previdenciários que vêm diretamente do eSocial e da EFD-Reinf, unificando essa confissão de débito num único lugar.'
          },
          {
            title: 'Relação com o restante do ecossistema',
            body: 'A DCTF/DCTFWeb funciona como um "resumo de cobrança", alimentado pelas apurações já feitas na ECF, EFD Contribuições, eSocial e Reinf — é, de certa forma, o último passo antes do pagamento (via DARF).'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual a função específica da DCTF, diferente de apenas "apurar" um tributo?',
          choices: [
            { id: 'a', text: 'Confessar formalmente ao fisco que aquele débito existe, para fins de cobrança' },
            { id: 'b', text: 'Calcular o valor exato do IRPJ pela primeira vez' },
            { id: 'c', text: 'Substituir totalmente a ECF' },
            { id: 'd', text: 'Emitir a nota fiscal eletrônica da empresa' }
          ],
          answer: 'a',
          explanation: 'A DCTF confessa formalmente o débito já apurado em outras declarações.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que a DCTF reúne?',
          choices: [
            { id: 'a', text: 'Os débitos federais apurados pela empresa e os créditos usados para compensá-los' },
            { id: 'b', text: 'Apenas o ICMS apurado no período' },
            { id: 'c', text: 'Somente os dados cadastrais de funcionários' },
            { id: 'd', text: 'Apenas notas fiscais emitidas' }
          ],
          answer: 'a',
          explanation: 'A DCTF reúne débitos federais e os créditos usados para compensação.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Por que "confessar" o débito na DCTF tem consequência prática?',
          choices: [
            { id: 'a', text: 'Porque, uma vez confessado, o débito pode ser cobrado diretamente pela Receita Federal, se não pago' },
            { id: 'b', text: 'Porque isso isenta a empresa do pagamento' },
            { id: 'c', text: 'Não tem nenhuma consequência prática real' },
            { id: 'd', text: 'Porque anula automaticamente qualquer apuração anterior' }
          ],
          answer: 'a',
          explanation: 'A confissão formal habilita a cobrança direta do débito pela Receita Federal.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a sigla da declaração que reúne, período a período, os débitos federais apurados pela empresa:',
          code: 'A ___ reúne, período a período, os débitos federais apurados pela empresa',
          accept: ['DCTF', 'dctf'],
          explanation: 'DCTF é a Declaração de Débitos e Créditos Tributários Federais.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que a DCTFWeb ampliou em relação à DCTF original?',
          choices: [
            { id: 'a', text: 'Passou a reunir também débitos previdenciários que vêm do eSocial e da EFD-Reinf' },
            { id: 'b', text: 'Passou a substituir totalmente a ECD' },
            { id: 'c', text: 'Eliminou a necessidade de qualquer pagamento de tributo' },
            { id: 'd', text: 'Passou a ser exclusiva para empresas do Simples Nacional' }
          ],
          answer: 'a',
          explanation: 'A DCTFWeb unificou também os débitos previdenciários vindos de eSocial/Reinf.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'De onde vêm as informações que alimentam a DCTF/DCTFWeb?',
          choices: [
            { id: 'a', text: 'Das apurações já feitas na ECF, EFD Contribuições, eSocial e Reinf' },
            { id: 'b', text: 'Diretamente da NF-e, sem passar por outras declarações' },
            { id: 'c', text: 'Apenas do PGDAS-D' },
            { id: 'd', text: 'De nenhuma outra declaração, é totalmente independente' }
          ],
          answer: 'a',
          explanation: 'A DCTF/DCTFWeb consolida débitos já apurados em outras declarações.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual a relação entre DCTF e o DARF, visto antes?',
          choices: [
            { id: 'a', text: 'A DCTF confessa o débito, e o DARF é o documento usado para efetivamente pagá-lo depois' },
            { id: 'b', text: 'São a mesma coisa, com nomes diferentes' },
            { id: 'c', text: 'O DARF confessa o débito, e a DCTF paga o tributo' },
            { id: 'd', text: 'Não têm nenhuma relação entre si' }
          ],
          answer: 'a',
          explanation: 'A DCTF confessa o débito; o pagamento em si costuma ser feito via DARF.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o nome da versão que ampliou a DCTF, unificando também débitos previdenciários vindos do eSocial e da Reinf:',
          code: 'A ___Web ampliou a DCTF, unificando também débitos previdenciários vindos do eSocial e da Reinf',
          accept: ['DCTF', 'dctf'],
          explanation: 'DCTFWeb é a evolução da DCTF que incorporou débitos previdenciários.'
        }
      ]
    },
    {
      id: 'smi-10-ecossistema',
      title: 'O ecossistema completo das obrigações digitais',
      goal: 'Enxergar como todas as declarações vistas (ECD, ECF, EFDs, Reinf, eSocial) se encaixam numa visão geral.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Recapitulando o "SPED clássico"',
            body: 'ECD e ECF (anuais, contábil/fiscal) e EFD Fiscal e EFD Contribuições (mensais, fiscal) formam o núcleo mais tradicional do SPED, vistas no nível iniciante.'
          },
          {
            title: 'O universo "trabalhista" ao lado',
            body: 'eSocial e EFD-Reinf cobrem informações sobre empregados, serviços de terceiros e retenções — tecnicamente fora do SPED "oficial", mas tratadas no dia a dia como parte da mesma lógica.'
          },
          {
            title: 'Documentos de origem',
            body: 'NF-e, CT-e e NFS-e são os documentos eletrônicos que geram, na origem, boa parte dos dados que depois aparecem nessas declarações — sem eles, não haveria o que declarar.'
          },
          {
            title: 'Mecanismos específicos por cima',
            body: 'Substituição Tributária, DIFAL e GNRE são mecanismos e guias que lidam com situações específicas de ICMS entre estados, aparecendo dentro da EFD Fiscal quando aplicáveis.'
          },
          {
            title: 'A visão de conjunto',
            body: 'No fim, esse "ecossistema" inteiro serve a um único objetivo: dar ao governo uma visão digital, cruzável e consistente de tudo que uma empresa compra, vende, produz, paga e recebe — cada declaração é só uma "fatia" diferente dessa mesma realidade.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Quais declarações formam o núcleo mais tradicional do "SPED clássico"?',
          choices: [
            { id: 'a', text: 'ECD, ECF, EFD Fiscal e EFD Contribuições' },
            { id: 'b', text: 'eSocial e EFD-Reinf' },
            { id: 'c', text: 'NF-e e CT-e' },
            { id: 'd', text: 'GNRE e DIFAL' }
          ],
          answer: 'a',
          explanation: 'ECD, ECF, EFD Fiscal e EFD Contribuições são o núcleo tradicional do SPED.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Quais sistemas cobrem o universo "trabalhista", ao lado do SPED clássico?',
          choices: [
            { id: 'a', text: 'eSocial e EFD-Reinf' },
            { id: 'b', text: 'ECD e ECF' },
            { id: 'c', text: 'NF-e e NFS-e' },
            { id: 'd', text: 'GNRE e DIFAL' }
          ],
          answer: 'a',
          explanation: 'eSocial e EFD-Reinf formam o universo trabalhista/de retenções adjacente ao SPED.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Que documentos eletrônicos geram, na origem, boa parte dos dados dessas declarações?',
          choices: [
            { id: 'a', text: 'NF-e, CT-e e NFS-e' },
            { id: 'b', text: 'ECD e ECF' },
            { id: 'c', text: 'GNRE e DIFAL' },
            { id: 'd', text: 'Somente a EFD Fiscal' }
          ],
          answer: 'a',
          explanation: 'NF-e, CT-e e NFS-e são os documentos de origem que alimentam as declarações.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o termo usado para NF-e, CT-e e NFS-e, em relação aos dados declarados depois:',
          code: 'NF-e, CT-e e NFS-e são chamados de documentos de ___ dos dados declarados depois',
          accept: ['origem'],
          explanation: 'São os documentos de origem, que geram os dados usados nas declarações posteriores.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Onde mecanismos como Substituição Tributária, DIFAL e GNRE costumam aparecer?',
          choices: [
            { id: 'a', text: 'Dentro da EFD Fiscal, quando aplicáveis a operações específicas entre estados' },
            { id: 'b', text: 'Somente no eSocial' },
            { id: 'c', text: 'Apenas na ECD' },
            { id: 'd', text: 'Em nenhuma declaração, são só guias avulsas' }
          ],
          answer: 'a',
          explanation: 'Esses mecanismos se refletem em registros específicos dentro da EFD Fiscal.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual o objetivo de fundo de todo esse ecossistema de declarações?',
          choices: [
            { id: 'a', text: 'Dar ao governo uma visão digital, cruzável e consistente de tudo que a empresa compra, vende, produz, paga e recebe' },
            { id: 'b', text: 'Aumentar a burocracia sem nenhum propósito real' },
            { id: 'c', text: 'Eliminar a necessidade de qualquer contabilidade' },
            { id: 'd', text: 'Servir apenas de controle interno da própria empresa' }
          ],
          answer: 'a',
          explanation: 'O objetivo final é uma visão digital consistente e cruzável de toda a atividade da empresa.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que se diz que cada declaração é uma "fatia" da mesma realidade?',
          choices: [
            { id: 'a', text: 'Porque todas partem, em algum grau, das mesmas operações reais da empresa, só que sob perspectivas diferentes' },
            { id: 'b', text: 'Porque cada declaração é completamente independente e sem relação com as demais' },
            { id: 'c', text: 'Porque só a EFD Fiscal reflete a realidade da empresa' },
            { id: 'd', text: 'Porque as declarações são sorteadas aleatoriamente entre empresas' }
          ],
          answer: 'a',
          explanation: 'Cada declaração enxerga a mesma realidade da empresa sob um recorte específico.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete os sistemas que cobrem o universo trabalhista e de retenções sobre serviços:',
          code: 'eSocial e EFD-___ cobrem o universo trabalhista e de retenções sobre serviços',
          accept: ['Reinf', 'reinf'],
          explanation: 'EFD-Reinf, junto ao eSocial, cobre retenções e eventos trabalhistas relacionados.'
        }
      ]
    }
  ]
};
