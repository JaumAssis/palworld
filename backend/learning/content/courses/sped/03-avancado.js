// Módulo "Avançado" — 13 lições, 8 questões cada (3 múltipla escolha + 1 lacuna, duas vezes por
// lição). Ver ../index.js para o formato e a validação de boot. Fecha o curso conceitual de
// jargões/estrutura do universo SPED (mesmo padrão de ./01-fundamentos.js e ./02-intermediario.js):
// mais documentos de origem (NFC-e, Manifestação do Destinatário), a lógica por trás de créditos
// tributários, o que acontece quando um erro vira cobrança formal (malha → auto de infração →
// impugnação/PAF → parcelamento → PER/DCOMP), regularidade fiscal (CND), responsabilidade pessoal
// de sócios/administradores, planejamento tributário, prazos (decadência/prescrição), operações
// internacionais (SISCOSERV) e a prática profissional de conferir uma EFD antes de entregá-la
// (auditoria eletrônica). Nenhum exemplo usa dado real de empresa/CPF, e o conteúdo evita
// números/prazos/percentuais específicos, pelo mesmo motivo dos módulos anteriores.
// Ids não são numericamente sequenciais na ordem pedagógica: spa-11/spa-12/spa-13 foram inseridas
// depois, entre lições já numeradas (mesma convenção dos outros cursos) — Parcelamento logo após
// Impugnação (alternativa/complemento a contestar a dívida), CND logo após PER/DCOMP (fecha o
// bloco de "resolver o débito"), Responsabilidade de sócios logo depois (consequência extrema de
// não regularizar), antes de Planejamento tributário mudar de tema.
module.exports = {
  id: 'avancado-sped',
  levelKey: 'advanced',
  order: 3,
  title: 'Avançado',
  subtitle: 'NFC-e, créditos tributários, malha fiscal a fundo, PER/DCOMP, planejamento e auditoria eletrônica',
  accent: '#c084fc',
  lessons: [
    {
      id: 'spa-01-nfce',
      title: 'NFC-e: Nota Fiscal de Consumidor Eletrônica',
      goal: 'Entender o que é a NFC-e e como ela se diferencia da NF-e no varejo.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Venda para consumidor final, no balcão',
            body: 'Quando um consumidor final compra num caixa de loja ou supermercado, normalmente não se emite a mesma NF-e usada entre empresas — existe um documento mais simples e rápido, pensado para esse tipo de venda.'
          },
          {
            title: 'O que é a NFC-e',
            body: 'Nota Fiscal de Consumidor Eletrônica: versão simplificada da nota fiscal, pensada para vendas de varejo diretamente ao consumidor final, geralmente emitida no ponto de venda (PDV/caixa).'
          },
          {
            title: 'NFC-e x NF-e',
            body: 'A NF-e é mais usada em operações entre empresas, ou quando o comprador precisa do documento completo para seus próprios créditos fiscais; a NFC-e é voltada ao consumidor final, com layout mais simples e emissão mais rápida.'
          },
          {
            title: 'O cupom fiscal que ela substituiu',
            body: 'A NFC-e substituiu, na maioria dos estados, o antigo cupom fiscal emitido por equipamentos chamados de Emissor de Cupom Fiscal — cuidado: essa sigla, "ECF", é diferente da Escrituração Contábil Fiscal vista no nível iniciante, apesar de usarem as mesmas letras. O consumidor recebe, hoje, um documento eletrônico com QR code em vez do cupom impresso tradicional.'
          },
          {
            title: 'Relação com a EFD Fiscal',
            body: 'Assim como a NF-e, a NFC-e também alimenta a EFD Fiscal, mas geralmente de forma consolidada — por ser um volume muito maior de documentos, um por venda no caixa.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que é a NFC-e?',
          choices: [
            { id: 'a', text: 'A versão simplificada da nota fiscal, pensada para vendas de varejo diretamente ao consumidor final' },
            { id: 'b', text: 'O mesmo documento que a NF-e, apenas com outro nome' },
            { id: 'c', text: 'Um documento usado só para serviços de transporte' },
            { id: 'd', text: 'Uma declaração anual de vendas' }
          ],
          answer: 'a',
          explanation: 'NFC-e é a versão simplificada, voltada a vendas de varejo ao consumidor final.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual a principal diferença entre NFC-e e NF-e?',
          choices: [
            { id: 'a', text: 'A NF-e é mais usada entre empresas; a NFC-e é voltada ao consumidor final, com layout mais simples' },
            { id: 'b', text: 'Não há diferença nenhuma entre as duas' },
            { id: 'c', text: 'A NFC-e substitui totalmente a necessidade de NF-e em qualquer operação' },
            { id: 'd', text: 'A NF-e é exclusiva de operações internacionais' }
          ],
          answer: 'a',
          explanation: 'Cada documento é voltado a um perfil diferente de operação: B2B (NF-e) ou varejo (NFC-e).'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que a NFC-e substituiu, na maioria dos estados?',
          choices: [
            { id: 'a', text: 'O antigo cupom fiscal emitido por equipamentos de Emissor de Cupom Fiscal' },
            { id: 'b', text: 'A própria NF-e' },
            { id: 'c', text: 'A ECD' },
            { id: 'd', text: 'O CT-e' }
          ],
          answer: 'a',
          explanation: 'A NFC-e substituiu o cupom fiscal emitido pelas antigas impressoras fiscais dedicadas.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a sigla da versão simplificada da nota fiscal, pensada para vendas de varejo ao consumidor final:',
          code: 'A ___ é a versão simplificada da nota fiscal, pensada para vendas de varejo ao consumidor final',
          accept: ['NFC-e', 'nfc-e', 'nfce'],
          explanation: 'NFC-e é a Nota Fiscal de Consumidor Eletrônica.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Onde a NFC-e costuma ser emitida?',
          choices: [
            { id: 'a', text: 'No ponto de venda (PDV/caixa) da loja' },
            { id: 'b', text: 'Somente no setor fiscal da matriz da empresa' },
            { id: 'c', text: 'Só é emitida uma vez por mês' },
            { id: 'd', text: 'Apenas em operações internacionais' }
          ],
          answer: 'a',
          explanation: 'A NFC-e é emitida diretamente no ponto de venda, no momento da compra.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que o consumidor recebe hoje, em vez do cupom fiscal impresso tradicional?',
          choices: [
            { id: 'a', text: 'Um documento eletrônico com QR code' },
            { id: 'b', text: 'Um XML sem nenhuma representação visual' },
            { id: 'c', text: 'Um boleto bancário' },
            { id: 'd', text: 'Nenhum documento, a compra não é mais registrada' }
          ],
          answer: 'a',
          explanation: 'O QR code permite consultar digitalmente a NFC-e recebida.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'A NFC-e também alimenta a EFD Fiscal?',
          choices: [
            { id: 'a', text: 'Sim, mas geralmente de forma consolidada, dado o volume muito maior de documentos' },
            { id: 'b', text: 'Não, a NFC-e nunca aparece na EFD Fiscal' },
            { id: 'c', text: 'Sim, cada NFC-e individual precisa de um registro próprio detalhado, como uma NF-e' },
            { id: 'd', text: 'A NFC-e substitui completamente a EFD Fiscal' }
          ],
          answer: 'a',
          explanation: 'Dado o alto volume, a NFC-e costuma alimentar a EFD Fiscal de forma consolidada.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o elemento visual usado na NFC-e para consulta digital do documento, no lugar do cupom impresso:',
          code: 'A NFC-e traz um ___, que substitui o antigo cupom impresso',
          accept: ['QR code', 'qr code', 'QR Code', 'qrcode'],
          explanation: 'O QR code permite ao consumidor consultar a NFC-e digitalmente.'
        }
      ]
    },
    {
      id: 'spa-02-manifestacao-destinatario',
      title: 'Manifestação do Destinatário',
      goal: 'Entender o processo pelo qual uma empresa confirma ou rejeita o recebimento de uma NF-e emitida contra ela.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'A nota já foi autorizada, mas isso garante que a operação é legítima?',
            body: 'Vimos que a NF-e é autorizada pelo fisco antes da mercadoria circular, mas isso não impede que uma nota seja emitida contra uma empresa por engano, ou até fraudulentamente, sem ela nunca ter comprado nada.'
          },
          {
            title: 'O que é a Manifestação do Destinatário',
            body: 'Um evento eletrônico em que a empresa destinatária de uma NF-e confirma (ou rejeita) que aquela operação realmente aconteceu, dando uma resposta oficial sobre a nota emitida contra ela.'
          },
          {
            title: 'As respostas possíveis',
            body: 'De forma simplificada, a empresa pode confirmar a operação, dizer que desconhece a operação (nunca comprou aquilo), ou indicar que a operação não foi realizada (por exemplo, a mercadoria não chegou).'
          },
          {
            title: 'Por que isso importa',
            body: 'Sem manifestar-se, a empresa corre o risco de ter, na prática, uma compra "fantasma" refletida nos seus próprios registros e cruzamentos fiscais, mesmo sem ter comprado nada de fato.'
          },
          {
            title: 'Relação com a apuração de créditos',
            body: 'Em muitos casos, o aproveitamento de crédito de ICMS pelo destinatário está condicionado à manifestação — ignorar notas emitidas contra a empresa pode, na prática, custar dinheiro.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que é a Manifestação do Destinatário?',
          choices: [
            { id: 'a', text: 'Um evento eletrônico em que a empresa destinatária de uma NF-e confirma ou rejeita que a operação realmente aconteceu' },
            { id: 'b', text: 'Um pedido de restituição de imposto' },
            { id: 'c', text: 'A assinatura digital do emissor da nota' },
            { id: 'd', text: 'Um tipo de retificadora da EFD Fiscal' }
          ],
          answer: 'a',
          explanation: 'A manifestação é a resposta oficial do destinatário sobre uma nota emitida contra ele.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Por que a manifestação existe, mesmo a NF-e já sendo autorizada pelo fisco?',
          choices: [
            { id: 'a', text: 'Porque a autorização não impede que uma nota seja emitida por engano ou fraudulentamente contra uma empresa que nunca comprou nada' },
            { id: 'b', text: 'Porque toda NF-e autorizada já é automaticamente confirmada pelo destinatário' },
            { id: 'c', text: 'Porque o fisco exige a manifestação antes mesmo de autorizar a nota' },
            { id: 'd', text: 'Não existe motivo real, é só uma formalidade sem função' }
          ],
          answer: 'a',
          explanation: 'A autorização fiscal não garante, por si só, que a operação descrita realmente ocorreu.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Cite uma das respostas possíveis na Manifestação do Destinatário.',
          choices: [
            { id: 'a', text: 'Confirmar a operação' },
            { id: 'b', text: 'Cancelar automaticamente a EFD Fiscal' },
            { id: 'c', text: 'Emitir uma nova NF-e em nome do emissor' },
            { id: 'd', text: 'Gerar um DARF' }
          ],
          answer: 'a',
          explanation: 'Confirmar a operação é uma das respostas possíveis na manifestação.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o nome do evento em que a empresa destinatária confirma ou rejeita uma NF-e emitida contra ela:',
          code: 'A ___ do Destinatário é o evento eletrônico de confirmação ou rejeição de uma NF-e',
          accept: ['Manifestação', 'manifestação', 'manifestacao'],
          explanation: 'Manifestação do Destinatário é o nome desse evento eletrônico.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que acontece se a empresa não se manifesta sobre uma nota emitida contra ela?',
          choices: [
            { id: 'a', text: 'Corre o risco de ter uma compra "fantasma" refletida em seus próprios registros e cruzamentos fiscais' },
            { id: 'b', text: 'A nota é cancelada automaticamente pelo fisco' },
            { id: 'c', text: 'Nada acontece, a manifestação não tem nenhum efeito prático' },
            { id: 'd', text: 'A empresa emissora é automaticamente multada' }
          ],
          answer: 'a',
          explanation: 'Sem manifestação, a operação pode ficar refletida indevidamente nos registros da empresa.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que a manifestação pode indicar além de "confirmar" a operação?',
          choices: [
            { id: 'a', text: 'Que a empresa desconhece a operação, ou que a operação não foi realizada' },
            { id: 'b', text: 'Apenas que a nota está com erro de CFOP' },
            { id: 'c', text: 'Que a empresa deseja emitir uma retificadora' },
            { id: 'd', text: 'Que o ICMS deve ser recalculado automaticamente' }
          ],
          answer: 'a',
          explanation: 'Além de confirmar, a empresa pode declarar desconhecimento ou que a operação não ocorreu.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Em muitos casos, o aproveitamento de crédito de ICMS pelo destinatário está condicionado a quê?',
          choices: [
            { id: 'a', text: 'À manifestação sobre a nota recebida' },
            { id: 'b', text: 'Ao pagamento antecipado do DARF' },
            { id: 'c', text: 'À entrega da ECD do mesmo mês' },
            { id: 'd', text: 'Não há nenhuma condição associada ao crédito de ICMS' }
          ],
          answer: 'a',
          explanation: 'A manifestação pode ser condição para o aproveitamento do crédito de ICMS.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a consequência prática de ignorar notas emitidas contra a empresa: pode custar o aproveitamento do:',
          code: 'Ignorar notas emitidas contra a empresa pode custar o aproveitamento do ___ de ICMS',
          accept: ['crédito', 'credito'],
          explanation: 'O crédito de ICMS pode depender da manifestação sobre a nota recebida.'
        }
      ]
    },
    {
      id: 'spa-03-creditos',
      title: 'Créditos de ICMS e PIS/COFINS: o que gera e o que é vedado',
      goal: 'Entender a lógica geral de crédito tributário e por que nem toda compra gera crédito.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Relembrando o não-cumulativo',
            body: 'Vimos, na EFD Contribuições, que no regime não-cumulativo a empresa pode descontar créditos do valor apurado — mas de onde exatamente vêm esses créditos?'
          },
          {
            title: 'A lógica geral do crédito',
            body: 'Em impostos não-cumulativos (como ICMS e PIS/COFINS não-cumulativo), a ideia é tributar só o VALOR AGREGADO em cada etapa — por isso o imposto pago na compra de insumos pode, em geral, ser descontado (creditado) do imposto devido na venda.'
          },
          {
            title: 'Nem toda compra gera crédito',
            body: 'A legislação define o que efetivamente gera direito a crédito (insumos usados diretamente na produção/prestação, por exemplo) e o que é vedado (compras de uso e consumo, itens não relacionados à atividade principal, entre outras exceções) — usar um crédito indevido é um erro fiscal comum e caro.'
          },
          {
            title: 'Créditos "acumulados" e restituição',
            body: 'Em certas situações (por exemplo, exportação, que costuma ser desonerada), a empresa pode acumular mais créditos do que débitos num período — nesses casos, existem mecanismos para usar ou recuperar esse saldo (assunto da próxima lição, PER/DCOMP).'
          },
          {
            title: 'Por que entender essa lógica importa',
            body: 'Uma parte relevante do trabalho fiscal do dia a dia é justamente decidir se uma determinada compra gera crédito ou não — errar para mais (creditar o que é vedado) ou para menos (deixar de creditar o que teria direito) tem custo real para a empresa.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual a ideia geral por trás de um imposto não-cumulativo, como o ICMS ou o PIS/COFINS não-cumulativo?',
          choices: [
            { id: 'a', text: 'Tributar só o valor agregado em cada etapa, permitindo descontar o imposto já pago na compra de insumos' },
            { id: 'b', text: 'Tributar o valor total da venda, sem nenhum desconto possível' },
            { id: 'c', text: 'Isentar completamente a cadeia de produção' },
            { id: 'd', text: 'Cobrar o imposto só do consumidor final, uma única vez' }
          ],
          answer: 'a',
          explanation: 'O regime não-cumulativo evita tributar em cascata, permitindo o crédito sobre insumos.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Toda compra feita pela empresa gera direito a crédito?',
          choices: [
            { id: 'a', text: 'Não, a legislação define o que gera crédito e o que é vedado' },
            { id: 'b', text: 'Sim, qualquer compra sempre gera crédito integral' },
            { id: 'c', text: 'Sim, mas só para empresas do Simples Nacional' },
            { id: 'd', text: 'Não existe crédito tributário no Brasil' }
          ],
          answer: 'a',
          explanation: 'Nem toda compra gera crédito — há regras específicas do que é permitido ou vedado.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Dê um exemplo do que costuma ser vedado para fins de crédito.',
          choices: [
            { id: 'a', text: 'Compras de uso e consumo, ou itens não relacionados à atividade principal da empresa' },
            { id: 'b', text: 'Insumos usados diretamente na produção' },
            { id: 'c', text: 'Matéria-prima consumida na fabricação do produto' },
            { id: 'd', text: 'Toda e qualquer compra da empresa, sem exceção' }
          ],
          answer: 'a',
          explanation: 'Compras não relacionadas à atividade principal costumam ser vedadas para fins de crédito.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o tipo de imposto em que a ideia é tributar só o valor agregado em cada etapa da cadeia:',
          code: 'Em impostos ___, a ideia é tributar só o valor agregado em cada etapa da cadeia',
          accept: ['não-cumulativos', 'nao-cumulativos', 'não cumulativos', 'nao cumulativos'],
          explanation: 'Impostos não-cumulativos tributam apenas o valor agregado em cada etapa.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que pode acontecer numa situação como a exportação, que costuma ser desonerada de determinados impostos?',
          choices: [
            { id: 'a', text: 'A empresa pode acumular mais créditos do que débitos num período' },
            { id: 'b', text: 'A empresa perde automaticamente todos os créditos anteriores' },
            { id: 'c', text: 'A empresa é obrigada a pagar o dobro do imposto' },
            { id: 'd', text: 'Não há nenhum efeito sobre créditos e débitos' }
          ],
          answer: 'a',
          explanation: 'A desoneração de exportações pode gerar acúmulo de créditos não compensados.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Por que usar um crédito indevido é considerado um erro fiscal caro?',
          choices: [
            { id: 'a', text: 'Porque pode gerar cobrança do valor creditado indevidamente, além de multas e juros' },
            { id: 'b', text: 'Porque não há nenhuma consequência real' },
            { id: 'c', text: 'Porque isenta a empresa de futuras fiscalizações' },
            { id: 'd', text: 'Porque reduz automaticamente o IRPJ devido' }
          ],
          answer: 'a',
          explanation: 'Créditos indevidos podem gerar cobrança do valor, além de multas e juros.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que entender a lógica de créditos é uma parte relevante do trabalho fiscal do dia a dia?',
          choices: [
            { id: 'a', text: 'Porque decidir se uma compra gera crédito ou não tem custo real, seja creditando indevidamente ou deixando de creditar o que teria direito' },
            { id: 'b', text: 'Porque não tem nenhum impacto prático na apuração' },
            { id: 'c', text: 'Porque só afeta empresas do Lucro Real' },
            { id: 'd', text: 'Porque créditos nunca são questionados pelo fisco' }
          ],
          answer: 'a',
          explanation: 'Errar na apuração de créditos, para mais ou para menos, tem custo real para a empresa.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a ação de descontar o imposto pago na compra de insumos do imposto devido na venda:',
          code: 'O imposto pago na compra de insumos pode, em geral, ser descontado (___) do imposto devido na venda',
          accept: ['creditado'],
          explanation: 'Esse desconto é chamado de creditamento do imposto pago na compra.'
        }
      ]
    },
    {
      id: 'spa-04-malha-fiscal-profunda',
      title: 'Da malha fiscal ao Auto de Infração',
      goal: 'Entender o que acontece, na prática, quando uma inconsistência detectada na malha fiscal avança para uma cobrança formal.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Relembrando a malha fiscal',
            body: 'Vimos que "cair na malha" significa que uma inconsistência entre declarações foi detectada automaticamente — mas o que acontece depois disso?'
          },
          {
            title: 'Notificação e prazo para regularizar',
            body: 'Normalmente, a empresa é notificada da inconsistência e tem um prazo para explicar, corrigir (por exemplo, com uma retificadora) ou pagar a diferença voluntariamente, muitas vezes com condições mais favoráveis do que se fosse autuada.'
          },
          {
            title: 'Auto de Infração',
            body: 'Se a inconsistência não é resolvida voluntariamente, o fisco pode lavrar um Auto de Infração: um documento formal que constitui o crédito tributário (torna o débito oficialmente exigível), geralmente com multa e juros aplicados.'
          },
          {
            title: 'Por que a diferença entre "malha" e "auto de infração" importa',
            body: 'A malha é um alerta automático, muitas vezes resolvido sem custo adicional se a empresa agir rápido; o Auto de Infração já é uma cobrança formal, com penalidades mais altas e menos margem de negociação simples.'
          },
          {
            title: 'O papel da retificadora, de novo',
            body: 'Corrigir uma declaração via retificadora, assim que um erro é identificado (mesmo antes de qualquer notificação), é a forma mais barata de resolver a maioria dos problemas — muito mais barato do que esperar um Auto de Infração.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que costuma acontecer depois que uma inconsistência "cai na malha fiscal"?',
          choices: [
            { id: 'a', text: 'A empresa costuma ser notificada e tem um prazo para explicar, corrigir ou pagar a diferença voluntariamente' },
            { id: 'b', text: 'A empresa é fechada automaticamente' },
            { id: 'c', text: 'Nada acontece, a malha é só um registro estatístico' },
            { id: 'd', text: 'O certificado digital da empresa é revogado' }
          ],
          answer: 'a',
          explanation: 'A malha costuma gerar uma notificação, com prazo para regularização.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que é um Auto de Infração?',
          choices: [
            { id: 'a', text: 'Um documento formal que constitui o crédito tributário, tornando o débito oficialmente exigível, geralmente com multa e juros' },
            { id: 'b', text: 'Um pedido de restituição de imposto' },
            { id: 'c', text: 'Um tipo de retificadora' },
            { id: 'd', text: 'Um certificado digital emitido pela Receita Federal' }
          ],
          answer: 'a',
          explanation: 'O Auto de Infração formaliza a cobrança do débito, com multa e juros.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual a diferença entre "cair na malha" e receber um Auto de Infração?',
          choices: [
            { id: 'a', text: 'A malha é um alerta automático, muitas vezes resolvido sem custo adicional; o auto já é uma cobrança formal, com penalidades mais altas' },
            { id: 'b', text: 'São exatamente a mesma coisa, com nomes diferentes' },
            { id: 'c', text: 'O Auto de Infração é sempre anterior à malha fiscal' },
            { id: 'd', text: 'A malha só existe para pessoas físicas' }
          ],
          answer: 'a',
          explanation: 'A malha é o alerta inicial; o Auto de Infração é a formalização da cobrança.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o documento que o fisco pode lavrar se a inconsistência não é resolvida voluntariamente:',
          code: 'Se a inconsistência não é resolvida voluntariamente, o fisco pode lavrar um ___ de Infração',
          accept: ['Auto', 'auto'],
          explanation: 'O Auto de Infração é lavrado quando a irregularidade não é regularizada antes.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Por que corrigir um erro via retificadora, assim que identificado, costuma ser a opção mais barata?',
          choices: [
            { id: 'a', text: 'Porque evita chegar a um Auto de Infração, com multas e juros mais altos e menos margem de negociação' },
            { id: 'b', text: 'Porque a retificadora nunca tem custo nenhum, mesmo depois de anos' },
            { id: 'c', text: 'Porque elimina totalmente a necessidade de pagar o imposto' },
            { id: 'd', text: 'Não há vantagem real em corrigir antes' }
          ],
          answer: 'a',
          explanation: 'Corrigir voluntariamente evita as penalidades mais altas de um Auto de Infração.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que significa "constituir o crédito tributário", no contexto do Auto de Infração?',
          choices: [
            { id: 'a', text: 'Tornar o débito oficialmente exigível pelo fisco' },
            { id: 'b', text: 'Criar um novo tributo' },
            { id: 'c', text: 'Gerar um crédito de ICMS para a empresa' },
            { id: 'd', text: 'Cancelar a obrigação de pagar o tributo' }
          ],
          answer: 'a',
          explanation: 'Constituir o crédito tributário é formalizar o débito como exigível.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Regularizar voluntariamente, antes de qualquer notificação formal, costuma trazer que vantagem?',
          choices: [
            { id: 'a', text: 'Condições mais favoráveis do que se a empresa fosse autuada' },
            { id: 'b', text: 'Nenhuma vantagem, o resultado é sempre idêntico' },
            { id: 'c', text: 'Isenção automática de qualquer imposto futuro' },
            { id: 'd', text: 'Cancelamento retroativo de todas as declarações anteriores' }
          ],
          answer: 'a',
          explanation: 'Regularizar antes de ser autuado costuma trazer condições mais favoráveis.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a ação do Auto de Infração sobre o crédito tributário, tornando o débito oficialmente exigível:',
          code: 'O documento que ___ o crédito tributário, tornando o débito oficialmente exigível, é o Auto de Infração',
          accept: ['constitui'],
          explanation: 'O Auto de Infração constitui formalmente o crédito tributário.'
        }
      ]
    },
    {
      id: 'spa-05-impugnacao',
      title: 'Impugnação e defesa administrativa',
      goal: 'Entender o que a empresa pode fazer ao discordar de um Auto de Infração.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Receber um Auto de Infração não é o fim da linha',
            body: 'A empresa que discorda, total ou parcialmente, de um Auto de Infração tem o direito de se defender antes que a cobrança seja definitiva.'
          },
          {
            title: 'Impugnação',
            body: 'A peça de defesa apresentada pela empresa, dentro de um prazo, contestando o Auto de Infração — pode alegar erro de cálculo, base legal equivocada, ou até que a operação nunca ocorreu como descrito.'
          },
          {
            title: 'Processo Administrativo Fiscal (PAF)',
            body: 'A partir da impugnação, se instaura um processo administrativo, no qual o próprio órgão fiscal (numa instância diferente de quem autuou) analisa os argumentos da empresa antes de decidir.'
          },
          {
            title: 'Recurso',
            body: 'Se a decisão de primeira instância for desfavorável à empresa, normalmente ainda cabe recurso a uma instância superior, dentro do próprio processo administrativo, antes de qualquer discussão judicial.'
          },
          {
            title: 'Por que isso é relevante para quem mexe com SPED',
            body: 'Como as declarações do SPED são justamente a fonte de boa parte dos autos de infração (divergências entre EFDs, ECD, ECF...), entender esse processo ajuda a enxergar a consequência final de um erro de escrituração ou apuração.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que é a impugnação?',
          choices: [
            { id: 'a', text: 'A peça de defesa apresentada pela empresa, contestando um Auto de Infração' },
            { id: 'b', text: 'Um pedido de restituição de tributo' },
            { id: 'c', text: 'Uma retificadora da EFD Fiscal' },
            { id: 'd', text: 'A confissão de um débito federal' }
          ],
          answer: 'a',
          explanation: 'A impugnação é a defesa formal apresentada contra o Auto de Infração.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que se instaura a partir da impugnação?',
          choices: [
            { id: 'a', text: 'Um Processo Administrativo Fiscal (PAF)' },
            { id: 'b', text: 'Uma nova ECF' },
            { id: 'c', text: 'Um pedido de PER/DCOMP' },
            { id: 'd', text: 'Uma nova NF-e' }
          ],
          answer: 'a',
          explanation: 'A impugnação instaura o Processo Administrativo Fiscal.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que pode acontecer se a decisão de primeira instância do PAF for desfavorável à empresa?',
          choices: [
            { id: 'a', text: 'Normalmente ainda cabe recurso a uma instância superior, dentro do próprio processo administrativo' },
            { id: 'b', text: 'A empresa perde automaticamente o direito de recorrer' },
            { id: 'c', text: 'O débito é cancelado automaticamente' },
            { id: 'd', text: 'A empresa precisa entrar direto na Justiça, sem nenhuma instância administrativa a mais' }
          ],
          answer: 'a',
          explanation: 'Costuma haver instância recursal dentro do próprio processo administrativo.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a sigla do Processo Administrativo Fiscal, instaurado a partir da impugnação de um Auto de Infração:',
          code: 'O ___ é o Processo Administrativo Fiscal, instaurado a partir da impugnação de um Auto de Infração',
          accept: ['PAF', 'paf'],
          explanation: 'PAF é o Processo Administrativo Fiscal.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Que tipo de argumento uma impugnação pode alegar?',
          choices: [
            { id: 'a', text: 'Erro de cálculo, base legal equivocada, ou que a operação nunca ocorreu como descrito' },
            { id: 'b', text: 'Apenas questões de formatação do arquivo XML' },
            { id: 'c', text: 'Só é possível alegar falta de dinheiro para pagar' },
            { id: 'd', text: 'Nenhum argumento é aceito numa impugnação' }
          ],
          answer: 'a',
          explanation: 'A impugnação pode contestar tanto o mérito quanto a forma da autuação.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Quem analisa os argumentos da empresa dentro do PAF?',
          choices: [
            { id: 'a', text: 'O próprio órgão fiscal, numa instância diferente de quem autuou' },
            { id: 'b', text: 'Um juiz de primeira instância, obrigatoriamente' },
            { id: 'c', text: 'A própria empresa, de forma unilateral' },
            { id: 'd', text: 'Nenhuma análise é feita, a impugnação é só arquivada' }
          ],
          answer: 'a',
          explanation: 'O PAF é analisado administrativamente, numa instância separada da autuação original.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que entender esse processo é relevante para quem mexe com SPED?',
          choices: [
            { id: 'a', text: 'Porque divergências entre as declarações do SPED costumam ser a fonte de boa parte dos autos de infração' },
            { id: 'b', text: 'Porque o SPED não tem nenhuma relação com autuações fiscais' },
            { id: 'c', text: 'Porque só afeta empresas do Simples Nacional' },
            { id: 'd', text: 'Porque impugnações não têm relação com declarações fiscais' }
          ],
          answer: 'a',
          explanation: 'Erros nas declarações do SPED frequentemente originam autuações e, depois, impugnações.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a peça de defesa apresentada pela empresa contra um Auto de Infração:',
          code: 'A ___ é a peça de defesa apresentada pela empresa contra um Auto de Infração',
          accept: ['impugnação', 'impugnacao'],
          explanation: 'Impugnação é a defesa formal apresentada contra a autuação.'
        }
      ]
    },
    {
      id: 'spa-11-parcelamento',
      title: 'Parcelamento de débitos tributários',
      goal: 'Entender o que é um parcelamento tributário e quando ele costuma ser usado.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Nem sempre dá para pagar à vista',
            body: 'Depois de um Auto de Infração (ou de um débito confessado, como na DCTF), a empresa pode simplesmente não ter caixa para pagar tudo de uma vez — para isso existe o parcelamento.'
          },
          {
            title: 'O que é o parcelamento tributário',
            body: 'Um acordo formal com o fisco para pagar um débito em várias parcelas, ao longo do tempo, em vez de à vista — geralmente com juros e, às vezes, alguma redução de multa, dependendo do programa vigente.'
          },
          {
            title: 'Confissão de dívida',
            body: 'Ao pedir um parcelamento, a empresa geralmente confessa formalmente o débito (reconhece que ele existe) — isso é importante: normalmente não é possível parcelar e, ao mesmo tempo, continuar discutindo (impugnando) o mesmo débito.'
          },
          {
            title: 'Consequência de não pagar as parcelas',
            body: 'Deixar de pagar as parcelas (inadimplência no parcelamento) costuma cancelar o acordo, fazendo o saldo devedor inteiro voltar a ser cobrado, muitas vezes de forma mais gravosa do que antes.'
          },
          {
            title: 'Parcelamentos especiais',
            body: 'De tempos em tempos, o governo cria programas especiais de parcelamento (às vezes chamados de "Refis", entre outros nomes), com condições mais vantajosas (mais parcelas, descontos de multa/juros) para incentivar a regularização de débitos antigos.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Para que serve o parcelamento tributário?',
          choices: [
            { id: 'a', text: 'Permitir que a empresa pague um débito em várias parcelas ao longo do tempo, em vez de à vista' },
            { id: 'b', text: 'Cancelar totalmente o débito tributário' },
            { id: 'c', text: 'Substituir a necessidade de entregar a DCTF' },
            { id: 'd', text: 'Gerar automaticamente uma CND' }
          ],
          answer: 'a',
          explanation: 'O parcelamento permite pagar o débito de forma escalonada, em vez de à vista.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que geralmente acontece ao pedir um parcelamento?',
          choices: [
            { id: 'a', text: 'A empresa confessa formalmente o débito, reconhecendo que ele existe' },
            { id: 'b', text: 'O débito é automaticamente cancelado' },
            { id: 'c', text: 'A empresa passa a ser isenta do tributo' },
            { id: 'd', text: 'Nada muda em relação ao débito original' }
          ],
          answer: 'a',
          explanation: 'O pedido de parcelamento costuma envolver a confissão formal do débito.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'É possível parcelar um débito e, ao mesmo tempo, continuar impugnando (discutindo) esse mesmo débito?',
          choices: [
            { id: 'a', text: 'Normalmente não, o parcelamento pressupõe reconhecer o débito como devido' },
            { id: 'b', text: 'Sim, sempre é possível fazer as duas coisas ao mesmo tempo' },
            { id: 'c', text: 'Sim, mas só para empresas do Simples Nacional' },
            { id: 'd', text: 'Não há relação entre parcelamento e impugnação' }
          ],
          answer: 'a',
          explanation: 'Parcelar geralmente significa reconhecer o débito, o que é incompatível com contestá-lo.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o nome do acordo formal com o fisco para pagar um débito em várias parcelas ao longo do tempo:',
          code: 'O ___ é um acordo formal com o fisco para pagar um débito em várias parcelas ao longo do tempo',
          accept: ['parcelamento'],
          explanation: 'Parcelamento é o acordo que permite pagar o débito de forma escalonada.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que costuma acontecer se a empresa deixa de pagar as parcelas?',
          choices: [
            { id: 'a', text: 'O acordo é cancelado, e o saldo devedor inteiro volta a ser cobrado, muitas vezes de forma mais gravosa' },
            { id: 'b', text: 'Nada acontece, as parcelas em atraso são simplesmente perdoadas' },
            { id: 'c', text: 'O prazo do parcelamento é automaticamente estendido' },
            { id: 'd', text: 'A empresa ganha um novo parcelamento automaticamente' }
          ],
          answer: 'a',
          explanation: 'A inadimplência no parcelamento costuma cancelar o acordo e reativar a cobrança integral.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que são os programas especiais de parcelamento (às vezes chamados de "Refis")?',
          choices: [
            { id: 'a', text: 'Condições mais vantajosas, criadas periodicamente pelo governo, para incentivar a regularização de débitos antigos' },
            { id: 'b', text: 'Um tipo de imposto novo' },
            { id: 'c', text: 'Uma obrigação acessória mensal' },
            { id: 'd', text: 'O mesmo que um Auto de Infração' }
          ],
          answer: 'a',
          explanation: 'Programas especiais de parcelamento costumam trazer condições mais vantajosas temporárias.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que uma empresa recorreria ao parcelamento em vez de pagar à vista?',
          choices: [
            { id: 'a', text: 'Por não ter caixa suficiente para quitar o débito de uma só vez' },
            { id: 'b', text: 'Porque parcelar sempre é mais barato que pagar à vista' },
            { id: 'c', text: 'Porque parcelar elimina qualquer juro ou multa' },
            { id: 'd', text: 'Não há motivo real para isso' }
          ],
          answer: 'a',
          explanation: 'A limitação de caixa é a razão prática mais comum para buscar um parcelamento.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete como o saldo devedor volta a ser cobrado quando o parcelamento é cancelado por inadimplência:',
          code: 'Deixar de pagar as parcelas cancela o acordo, e o saldo devedor volta a ser cobrado de forma mais ___',
          accept: ['gravosa'],
          explanation: 'A cobrança após o cancelamento do parcelamento costuma ser mais gravosa.'
        }
      ]
    },
    {
      id: 'spa-06-per-dcomp',
      title: 'PER/DCOMP: restituição e compensação de créditos',
      goal: 'Entender como uma empresa usa créditos tributários para restituir valores ou compensar outros débitos.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O que fazer com um crédito acumulado',
            body: 'Vimos, na lição de créditos, que uma empresa pode acumular mais créditos do que débitos em determinadas situações — mas como ela efetivamente usa esse saldo a seu favor?'
          },
          {
            title: 'O que é o PER/DCOMP',
            body: 'Pedido Eletrônico de Restituição, Ressarcimento ou Reembolso e Declaração de Compensação: o sistema usado para pedir de volta um valor pago a mais (restituição), ou usar um crédito para abater um débito diferente (compensação).'
          },
          {
            title: 'Restituição x compensação',
            body: 'Na restituição, a empresa pede o dinheiro de volta; na compensação, em vez de receber o valor, ela usa o crédito para quitar (total ou parcialmente) um débito diferente que tenha com o fisco.'
          },
          {
            title: 'Por que isso não é automático',
            body: 'A Receita Federal analisa o pedido antes de homologar (aceitar) a compensação ou restituição — é possível que o crédito alegado seja questionado ou negado, então declarar uma compensação não garante, por si só, que o débito está quitado.'
          },
          {
            title: 'Relação com as outras declarações',
            body: 'O crédito usado no PER/DCOMP geralmente vem de valores já apurados e declarados em outras obrigações (como a EFD Contribuições ou a DCTF) — mais um exemplo de como as declarações se conectam.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Para que serve o PER/DCOMP?',
          choices: [
            { id: 'a', text: 'Pedir de volta um valor pago a mais (restituição) ou usar um crédito para abater um débito diferente (compensação)' },
            { id: 'b', text: 'Emitir notas fiscais eletrônicas' },
            { id: 'c', text: 'Confessar débitos federais, como a DCTF' },
            { id: 'd', text: 'Registrar operações internacionais de serviços' }
          ],
          answer: 'a',
          explanation: 'PER/DCOMP viabiliza restituição de valores pagos a mais ou compensação de créditos.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual a diferença entre restituição e compensação?',
          choices: [
            { id: 'a', text: 'Na restituição a empresa recebe o valor de volta; na compensação ela usa o crédito para quitar outro débito' },
            { id: 'b', text: 'São exatamente a mesma coisa' },
            { id: 'c', text: 'Restituição só existe para pessoas físicas' },
            { id: 'd', text: 'Compensação sempre gera dinheiro em espécie para a empresa' }
          ],
          answer: 'a',
          explanation: 'Restituição devolve o valor; compensação usa o crédito para abater outro débito.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'A compensação declarada no PER/DCOMP garante automaticamente que o débito está quitado?',
          choices: [
            { id: 'a', text: 'Não, a Receita Federal analisa e homologa (ou não) o pedido antes de considerá-lo válido' },
            { id: 'b', text: 'Sim, a simples declaração já quita o débito de forma definitiva' },
            { id: 'c', text: 'Sim, mas só para empresas do Lucro Real' },
            { id: 'd', text: 'Não existe análise nenhuma por parte do governo' }
          ],
          answer: 'a',
          explanation: 'A compensação depende de homologação da Receita Federal para ser considerada válida.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a sigla do sistema usado para pedir restituição ou compensar créditos tributários:',
          code: 'O ___/DCOMP é usado para pedir restituição ou compensar créditos tributários',
          accept: ['PER', 'per'],
          explanation: 'PER/DCOMP é o Pedido Eletrônico de Restituição/Ressarcimento e Declaração de Compensação.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que significa a Receita Federal "homologar" uma compensação?',
          choices: [
            { id: 'a', text: 'Aceitar formalmente que aquele crédito é válido e que o débito foi de fato quitado' },
            { id: 'b', text: 'Rejeitar automaticamente o pedido' },
            { id: 'c', text: 'Gerar uma nova ECF' },
            { id: 'd', text: 'Cancelar a NF-e correspondente' }
          ],
          answer: 'a',
          explanation: 'Homologar é o ato de validar formalmente a compensação declarada.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'De onde geralmente vem o crédito usado no PER/DCOMP?',
          choices: [
            { id: 'a', text: 'De valores já apurados e declarados em outras obrigações, como a EFD Contribuições ou a DCTF' },
            { id: 'b', text: 'De um valor arbitrário escolhido pela empresa' },
            { id: 'c', text: 'Sempre de uma nova apuração feita só para o PER/DCOMP' },
            { id: 'd', text: 'Do valor total de vendas do CT-e' }
          ],
          answer: 'a',
          explanation: 'O crédito usado costuma vir de apurações já feitas em outras declarações.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'O que pode acontecer se o crédito alegado no PER/DCOMP for questionado ou negado?',
          choices: [
            { id: 'a', text: 'A compensação pode não ser homologada, e o débito considerado ainda em aberto' },
            { id: 'b', text: 'Nada muda, a compensação já vale mesmo assim' },
            { id: 'c', text: 'A empresa é automaticamente excluída do Simples Nacional' },
            { id: 'd', text: 'O crédito é automaticamente aceito, mesmo questionado' }
          ],
          answer: 'a',
          explanation: 'Um crédito negado pode invalidar a compensação declarada, mantendo o débito em aberto.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o termo em que a empresa usa um crédito para quitar total ou parcialmente um débito diferente:',
          code: 'Na ___, a empresa usa um crédito para quitar total ou parcialmente um débito diferente que tem com o fisco',
          accept: ['compensação', 'compensacao'],
          explanation: 'Compensação é o uso de um crédito para abater outro débito.'
        }
      ]
    },
    {
      id: 'spa-12-cnd',
      title: 'Certidão Negativa de Débitos (CND) e regularidade fiscal',
      goal: 'Entender o que é a CND e por que a "regularidade fiscal" importa na prática de uma empresa.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'Como provar que a empresa está "em dia" com o fisco',
            body: 'Participar de uma licitação pública, conseguir um empréstimo bancário, ou até vender a própria empresa muitas vezes exige provar formalmente que não há débito tributário pendente.'
          },
          {
            title: 'O que é a CND',
            body: 'Certidão Negativa de Débitos: documento emitido pelo fisco atestando que, naquele momento, a empresa não tem débitos tributários pendentes.'
          },
          {
            title: 'CPEND — a certidão "positiva com efeito de negativa"',
            body: 'Quando a empresa tem um débito, mas ele está com a exigibilidade suspensa (por exemplo, porque está sendo discutido numa impugnação, ou está parcelado em dia), o fisco emite uma certidão "positiva com efeito de negativa" — na prática, funciona como uma CND, mesmo havendo débito formalmente registrado.'
          },
          {
            title: 'Por que impugnação e parcelamento "salvam" a certidão',
            body: 'É por isso que impugnar um Auto de Infração ou aderir a um parcelamento em dia costuma preservar a regularidade fiscal da empresa: o débito existe, mas sua cobrança está suspensa por um motivo legítimo.'
          },
          {
            title: 'Consequência prática de não ter certidão',
            body: 'Sem CND (ou CPEND), a empresa pode ficar impedida de participar de licitações, obter financiamentos, ou até de fazer alterações no seu próprio contrato social junto a certos órgãos — regularidade fiscal deixa de ser só um "papel" e vira uma condição de funcionamento.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que é a CND?',
          choices: [
            { id: 'a', text: 'Documento emitido pelo fisco atestando que a empresa não tem débitos tributários pendentes' },
            { id: 'b', text: 'Um tipo de parcelamento tributário' },
            { id: 'c', text: 'Uma declaração anual de débitos federais' },
            { id: 'd', text: 'O mesmo que um Auto de Infração' }
          ],
          answer: 'a',
          explanation: 'CND é a Certidão Negativa de Débitos, atestando regularidade fiscal.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Em que situações uma empresa costuma precisar de CND?',
          choices: [
            { id: 'a', text: 'Participar de licitações públicas, conseguir empréstimos, ou vender a empresa' },
            { id: 'b', text: 'Apenas para emitir uma NF-e' },
            { id: 'c', text: 'Apenas para contratar um novo funcionário' },
            { id: 'd', text: 'Nunca é exigida na prática' }
          ],
          answer: 'a',
          explanation: 'A CND é frequentemente exigida em licitações, financiamentos e operações societárias.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que é a certidão "positiva com efeito de negativa" (CPEND)?',
          choices: [
            { id: 'a', text: 'Uma certidão emitida quando há débito, mas com a exigibilidade suspensa, funcionando na prática como uma CND' },
            { id: 'b', text: 'Uma certidão que comprova que a empresa deve tributos e não pode operar' },
            { id: 'c', text: 'O mesmo documento que a CND, só com outro nome' },
            { id: 'd', text: 'Um tipo de Auto de Infração' }
          ],
          answer: 'a',
          explanation: 'A CPEND vale como CND quando o débito existe mas está com a exigibilidade suspensa.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a sigla do documento emitido pelo fisco atestando que a empresa não tem débitos tributários pendentes:',
          code: 'A ___ é o documento emitido pelo fisco atestando que a empresa não tem débitos tributários pendentes',
          accept: ['CND', 'cnd'],
          explanation: 'CND é a Certidão Negativa de Débitos.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Por que impugnar um Auto de Infração pode preservar a regularidade fiscal da empresa?',
          choices: [
            { id: 'a', text: 'Porque a exigibilidade do débito fica suspensa enquanto ele é discutido, permitindo a emissão de uma certidão positiva com efeito de negativa' },
            { id: 'b', text: 'Porque a impugnação cancela automaticamente o débito' },
            { id: 'c', text: 'Porque impugnar sempre gera uma CND comum, sem ressalvas' },
            { id: 'd', text: 'Não há relação entre impugnação e regularidade fiscal' }
          ],
          answer: 'a',
          explanation: 'A discussão do débito suspende sua exigibilidade, viabilizando a CPEND.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Um parcelamento em dia também preserva a regularidade fiscal?',
          choices: [
            { id: 'a', text: 'Sim, enquanto as parcelas estão sendo pagas, a exigibilidade do débito também fica suspensa' },
            { id: 'b', text: 'Não, parcelamento nunca preserva a regularidade fiscal' },
            { id: 'c', text: 'Só preserva se a empresa for do Simples Nacional' },
            { id: 'd', text: 'Não há relação entre parcelamento e certidões' }
          ],
          answer: 'a',
          explanation: 'Parcelamentos em dia também suspendem a exigibilidade, permitindo a CPEND.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'O que pode acontecer com uma empresa sem CND/CPEND?',
          choices: [
            { id: 'a', text: 'Pode ficar impedida de participar de licitações, obter financiamentos, ou fazer certas alterações societárias' },
            { id: 'b', text: 'Nada, a certidão é apenas decorativa' },
            { id: 'c', text: 'É automaticamente fechada pela Receita Federal' },
            { id: 'd', text: 'Perde o direito de emitir qualquer nota fiscal' }
          ],
          answer: 'a',
          explanation: 'A ausência de certidão pode travar operações importantes da empresa.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o tipo de certidão emitida quando a exigibilidade de um débito está suspensa:',
          code: 'Quando a exigibilidade de um débito está suspensa (por impugnação ou parcelamento em dia), o fisco pode emitir uma certidão positiva com efeito de ___',
          accept: ['negativa'],
          explanation: 'A certidão positiva com efeito de negativa funciona, na prática, como uma CND.'
        }
      ]
    },
    {
      id: 'spa-13-responsabilidade-socios',
      title: 'Responsabilidade tributária de sócios e administradores',
      goal: 'Entender quando o fisco pode buscar o patrimônio pessoal de sócios/administradores por dívidas da empresa.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'A regra geral: a empresa responde, não o sócio',
            body: 'Via de regra, quem deve o tributo é a pessoa jurídica (a empresa), com seu próprio patrimônio — o patrimônio pessoal dos sócios fica separado, protegido pela autonomia da pessoa jurídica.'
          },
          {
            title: 'Quando essa proteção pode ser afastada',
            body: 'Em situações específicas, previstas em lei, o fisco pode responsabilizar pessoalmente sócios ou administradores pelo débito da empresa — não é automático, exige uma dessas hipóteses específicas.'
          },
          {
            title: 'Excesso de poderes ou infração à lei',
            body: 'Administradores que agem além do que a lei ou o contrato social permite (por exemplo, numa fraude deliberada) podem responder pessoalmente pelo débito gerado por esse ato.'
          },
          {
            title: 'Dissolução irregular da empresa',
            body: 'Quando uma empresa simplesmente "some" (encerra as atividades de fato sem seguir o processo formal de encerramento, sem baixar regularmente na Receita/Junta Comercial), a jurisprudência costuma entender isso como indício suficiente para responsabilizar quem administrava a empresa nesse momento.'
          },
          {
            title: 'Por que isso é relevante para o planejamento e a regularização',
            body: 'Entender esses limites ajuda a explicar por que simplesmente "abandonar" uma empresa endividada não resolve o problema para os sócios — regularizar (mesmo que via parcelamento) ou encerrar formalmente a empresa são caminhos bem diferentes, com consequências pessoais distintas.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Pela regra geral, quem responde pelo débito tributário de uma empresa?',
          choices: [
            { id: 'a', text: 'A própria pessoa jurídica, com seu patrimônio, não o patrimônio pessoal dos sócios' },
            { id: 'b', text: 'Sempre o sócio majoritário, pessoalmente' },
            { id: 'c', text: 'Sempre todos os sócios, em partes iguais e automaticamente' },
            { id: 'd', text: 'Nenhum patrimônio responde, o débito é apenas simbólico' }
          ],
          answer: 'a',
          explanation: 'A regra geral é a autonomia patrimonial da pessoa jurídica.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'A responsabilização pessoal de sócios/administradores é automática, em qualquer débito?',
          choices: [
            { id: 'a', text: 'Não, exige situações específicas previstas em lei' },
            { id: 'b', text: 'Sim, qualquer débito da empresa já responsabiliza os sócios automaticamente' },
            { id: 'c', text: 'Sim, mas só para empresas do Lucro Real' },
            { id: 'd', text: 'Não existe responsabilização pessoal em nenhuma hipótese' }
          ],
          answer: 'a',
          explanation: 'A responsabilização pessoal exige hipóteses específicas, não é automática.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Dê um exemplo de situação em que um administrador pode responder pessoalmente por um débito.',
          choices: [
            { id: 'a', text: 'Excesso de poderes ou infração à lei, como uma fraude deliberada' },
            { id: 'b', text: 'Simplesmente ser sócio da empresa, sem mais nenhuma condição' },
            { id: 'c', text: 'Ter aprovado o Lucro Presumido como regime tributário' },
            { id: 'd', text: 'Ter entregado a ECD dentro do prazo' }
          ],
          answer: 'a',
          explanation: 'Excesso de poderes ou infração à lei são hipóteses clássicas de responsabilização pessoal.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o tipo de encerramento irregular que costuma ser indício suficiente para responsabilizar quem administrava a empresa:',
          code: 'A ___ irregular da empresa (encerrar as atividades sem seguir o processo formal) costuma ser indício suficiente para responsabilizar quem administrava a empresa',
          accept: ['dissolução', 'dissolucao'],
          explanation: 'A dissolução irregular é tratada como indício de responsabilidade pessoal do administrador.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que caracteriza a dissolução irregular de uma empresa?',
          choices: [
            { id: 'a', text: 'Encerrar as atividades de fato sem seguir o processo formal de encerramento, sem baixa regular' },
            { id: 'b', text: 'Trocar de regime tributário no meio do ano' },
            { id: 'c', text: 'Entregar uma retificadora da EFD Fiscal' },
            { id: 'd', text: 'Pedir um parcelamento de débitos' }
          ],
          answer: 'a',
          explanation: 'Dissolução irregular é encerrar as atividades sem seguir o rito formal de baixa.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Por que "abandonar" uma empresa endividada não resolve o problema para os sócios?',
          choices: [
            { id: 'a', text: 'Porque a dissolução irregular pode ser usada como indício para responsabilizar pessoalmente quem administrava a empresa' },
            { id: 'b', text: 'Porque a empresa some do sistema automaticamente, sem consequência' },
            { id: 'c', text: 'Porque o débito é sempre cancelado quando a empresa some' },
            { id: 'd', text: 'Não há nenhuma consequência para os sócios nesse caso' }
          ],
          answer: 'a',
          explanation: 'O abandono irregular pode se voltar contra o patrimônio pessoal dos administradores.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual a diferença entre encerrar formalmente uma empresa e simplesmente abandoná-la?',
          choices: [
            { id: 'a', text: 'O encerramento formal segue o processo regular perante Receita/Junta Comercial, evitando indício de dissolução irregular' },
            { id: 'b', text: 'Não há diferença nenhuma na prática' },
            { id: 'c', text: 'Abandonar é sempre mais seguro juridicamente' },
            { id: 'd', text: 'Encerrar formalmente é proibido por lei' }
          ],
          answer: 'a',
          explanation: 'O encerramento formal evita o indício de dissolução irregular usado para responsabilizar sócios.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o que caracteriza administradores que podem responder pessoalmente pelo débito gerado:',
          code: 'Administradores que agem com ___ de poderes ou infração à lei podem responder pessoalmente pelo débito gerado',
          accept: ['excesso'],
          explanation: 'Excesso de poderes é uma das hipóteses clássicas de responsabilidade pessoal.'
        }
      ]
    },
    {
      id: 'spa-07-planejamento-tributario',
      title: 'Planejamento tributário: elisão x evasão fiscal',
      goal: 'Entender a diferença entre organizar a tributação de forma legal e sonegar impostos.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Toda empresa busca pagar menos imposto?',
            body: 'Sim, mas existe uma linha bem definida entre fazer isso de forma legal e cometer um crime fiscal — essa linha é o que separa elisão de evasão.'
          },
          {
            title: 'Elisão fiscal',
            body: 'Organizar as operações da empresa (escolha de regime tributário, estrutura societária, forma de determinada operação) de maneira lícita, dentro da lei, para reduzir a carga tributária — é o que se chama de planejamento tributário.'
          },
          {
            title: 'Evasão fiscal',
            body: 'Usar meios ilícitos para reduzir ou não pagar o imposto devido: omitir receita, emitir nota fiscal com valor menor que o real ("nota calçada"), simular uma operação que não existiu — isso é sonegação, com consequências criminais, não só administrativas.'
          },
          {
            title: 'Por que a linha às vezes é discutida',
            body: 'Algumas estruturas de planejamento tributário são consideradas legítimas pela empresa, mas questionadas pelo fisco como abusivas ou artificiais (sem "propósito negocial" real, feitas só para reduzir imposto) — esses casos costumam gerar disputas longas, muitas vezes decididas em processo administrativo ou judicial.'
          },
          {
            title: 'Por que isso importa no dia a dia do SPED',
            body: 'Decisões de planejamento tributário (como o regime escolhido, ou como uma operação é estruturada) se refletem diretamente no que aparece nas declarações do SPED — entender esse pano de fundo ajuda a entender o "porquê" por trás de muitas escolhas fiscais de uma empresa.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que é elisão fiscal?',
          choices: [
            { id: 'a', text: 'Organizar as operações da empresa de maneira lícita, dentro da lei, para reduzir a carga tributária' },
            { id: 'b', text: 'Omitir receita para pagar menos imposto' },
            { id: 'c', text: 'Emitir uma nota fiscal com valor menor que o real' },
            { id: 'd', text: 'Deixar de entregar qualquer declaração fiscal' }
          ],
          answer: 'a',
          explanation: 'Elisão fiscal é o planejamento tributário lícito.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que é evasão fiscal?',
          choices: [
            { id: 'a', text: 'Usar meios ilícitos para reduzir ou não pagar o imposto devido, como omitir receita ou simular operações' },
            { id: 'b', text: 'Escolher o regime tributário mais vantajoso dentro da lei' },
            { id: 'c', text: 'Entregar uma retificadora corrigindo um erro' },
            { id: 'd', text: 'Pedir restituição de um valor pago a mais' }
          ],
          answer: 'a',
          explanation: 'Evasão fiscal envolve meios ilícitos, diferente da elisão.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Dê um exemplo de prática de evasão fiscal.',
          choices: [
            { id: 'a', text: 'Emitir nota fiscal com valor menor que o real ("nota calçada")' },
            { id: 'b', text: 'Escolher o Lucro Presumido em vez do Lucro Real' },
            { id: 'c', text: 'Entregar a ECD dentro do prazo' },
            { id: 'd', text: 'Reter o IRRF de um prestador de serviço' }
          ],
          answer: 'a',
          explanation: 'A "nota calçada" (valor divergente do real) é um exemplo clássico de evasão fiscal.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a prática lícita de organizar a tributação da empresa para reduzir a carga tributária:',
          code: 'A ___ fiscal é a prática lícita de organizar a tributação da empresa para reduzir a carga tributária',
          accept: ['elisão', 'elisao'],
          explanation: 'Elisão fiscal é o termo para o planejamento tributário dentro da lei.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Quais as consequências da evasão fiscal, diferente da elisão?',
          choices: [
            { id: 'a', text: 'Consequências criminais, não só administrativas' },
            { id: 'b', text: 'Nenhuma consequência, é tratada como um erro simples' },
            { id: 'c', text: 'Apenas uma pequena multa administrativa' },
            { id: 'd', text: 'A empresa só precisa entregar uma retificadora' }
          ],
          answer: 'a',
          explanation: 'A evasão fiscal (sonegação) tem natureza criminal, diferente da elisão.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Por que algumas estruturas de planejamento tributário são questionadas pelo fisco, mesmo sem serem ilegais na forma?',
          choices: [
            { id: 'a', text: 'Porque podem ser consideradas abusivas ou artificiais, sem "propósito negocial" real, feitas só para reduzir imposto' },
            { id: 'b', text: 'Porque toda elisão fiscal é automaticamente ilegal' },
            { id: 'c', text: 'Porque o fisco nunca questiona planejamento tributário' },
            { id: 'd', text: 'Porque isso nunca gera disputa alguma' }
          ],
          answer: 'a',
          explanation: 'Planejamentos sem propósito negocial real podem ser questionados como abusivos.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Como decisões de planejamento tributário se relacionam com o SPED?',
          choices: [
            { id: 'a', text: 'Se refletem diretamente no que aparece nas declarações, como o regime escolhido ou a estrutura de uma operação' },
            { id: 'b', text: 'Não têm nenhuma relação com as declarações do SPED' },
            { id: 'c', text: 'Só afetam a folha de pagamento da empresa' },
            { id: 'd', text: 'Só importam para empresas que exportam' }
          ],
          answer: 'a',
          explanation: 'As escolhas de planejamento tributário se refletem nas declarações entregues.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a prática que envolve meios ilícitos, como omitir receita ou simular operações, com consequência criminal:',
          code: 'A ___ fiscal envolve meios ilícitos, como omitir receita ou simular operações, e tem consequência criminal',
          accept: ['evasão', 'evasao'],
          explanation: 'Evasão fiscal é a prática ilícita, com consequências criminais.'
        }
      ]
    },
    {
      id: 'spa-08-prazos',
      title: 'Prazo decadencial e prescrição',
      goal: 'Entender, em linhas gerais, até quando o fisco pode cobrar ou questionar um tributo.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'Um erro fiscal fica "aberto" para sempre?',
            body: 'Não — assim como quase toda relação jurídica, existe um prazo para o fisco agir, tanto para cobrar quanto para questionar algo já apurado.'
          },
          {
            title: 'Decadência',
            body: 'O prazo que o fisco tem para CONSTITUIR o crédito tributário (ou seja, lançar/cobrar formalmente um débito que ainda não foi formalizado) — passado esse prazo, o fisco perde o direito de cobrar aquele valor.'
          },
          {
            title: 'Prescrição',
            body: 'Depois que o crédito já foi constituído (por exemplo, confessado numa DCTF, ou lançado num Auto de Infração), existe outro prazo para o fisco efetivamente COBRAR judicialmente esse valor — é a prescrição.'
          },
          {
            title: 'Por que a diferença entre os dois importa',
            body: 'Decadência afeta o direito de LANÇAR o débito; prescrição afeta o direito de COBRAR um débito já lançado — são fases diferentes da mesma linha do tempo.'
          },
          {
            title: 'Cuidado com generalizações',
            body: 'Os prazos exatos (quantos anos) variam conforme o tributo e a situação (por exemplo, se houve dolo/fraude, o prazo pode ser tratado de forma diferente) — o importante aqui é entender que existe um limite de tempo, não o número exato, que muda com a legislação e o caso concreto.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que é a decadência, no contexto tributário?',
          choices: [
            { id: 'a', text: 'O prazo que o fisco tem para constituir (lançar/cobrar formalmente) um crédito tributário ainda não formalizado' },
            { id: 'b', text: 'O prazo que a empresa tem para entregar uma retificadora' },
            { id: 'c', text: 'O prazo para emitir uma NF-e' },
            { id: 'd', text: 'O prazo para homologar uma compensação' }
          ],
          answer: 'a',
          explanation: 'Decadência é o prazo para constituir formalmente o crédito tributário.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que é a prescrição, no contexto tributário?',
          choices: [
            { id: 'a', text: 'O prazo que o fisco tem para efetivamente cobrar judicialmente um crédito já constituído' },
            { id: 'b', text: 'O prazo para a empresa contestar um Auto de Infração' },
            { id: 'c', text: 'O prazo para emitir uma GNRE' },
            { id: 'd', text: 'O mesmo que a decadência, com outro nome' }
          ],
          answer: 'a',
          explanation: 'Prescrição é o prazo para cobrança judicial de um crédito já constituído.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual a diferença entre decadência e prescrição?',
          choices: [
            { id: 'a', text: 'Decadência afeta o direito de lançar o débito; prescrição afeta o direito de cobrar um débito já lançado' },
            { id: 'b', text: 'Não há diferença nenhuma entre os dois termos' },
            { id: 'c', text: 'Prescrição vem sempre antes da decadência' },
            { id: 'd', text: 'Decadência só se aplica a pessoas físicas' }
          ],
          answer: 'a',
          explanation: 'São fases diferentes: decadência (lançar) e prescrição (cobrar já lançado).'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o prazo que o fisco tem para constituir um crédito tributário ainda não formalizado:',
          code: 'A ___ é o prazo que o fisco tem para constituir um crédito tributário ainda não formalizado',
          accept: ['decadência', 'decadencia'],
          explanation: 'Decadência é o prazo para constituir formalmente o crédito tributário.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que acontece se o fisco perde o prazo decadencial?',
          choices: [
            { id: 'a', text: 'Perde o direito de cobrar aquele valor, que nunca chega a ser formalmente lançado' },
            { id: 'b', text: 'O prazo é automaticamente renovado por mais um período' },
            { id: 'c', text: 'A empresa passa a dever o dobro do valor original' },
            { id: 'd', text: 'Nada muda, o fisco pode cobrar a qualquer momento, sem limite' }
          ],
          answer: 'a',
          explanation: 'Passado o prazo decadencial, o fisco perde o direito de constituir aquele crédito.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Um débito já confessado numa DCTF ainda está sujeito à decadência?',
          choices: [
            { id: 'a', text: 'Não da mesma forma, pois já foi constituído; o que se aplica depois é o prazo de prescrição para cobrança' },
            { id: 'b', text: 'Sim, exatamente da mesma forma que um débito nunca declarado' },
            { id: 'c', text: 'Não, débitos confessados nunca prescrevem' },
            { id: 'd', text: 'Sim, mas o prazo dobra automaticamente' }
          ],
          answer: 'a',
          explanation: 'Um débito já constituído (confessado) passa a se sujeitar à prescrição, não à decadência.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que os prazos exatos não são o foco principal desta lição?',
          choices: [
            { id: 'a', text: 'Porque variam conforme o tributo e a situação, e mudam com a legislação — o importante é entender que existe um limite de tempo' },
            { id: 'b', text: 'Porque não existe nenhum prazo na prática' },
            { id: 'c', text: 'Porque o prazo é sempre de exatamente um ano, sem exceção' },
            { id: 'd', text: 'Porque prazos tributários nunca mudam' }
          ],
          answer: 'a',
          explanation: 'Os prazos específicos variam e mudam, por isso o foco é o conceito, não o número exato.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o nome do prazo para o fisco cobrar judicialmente um crédito já constituído:',
          code: 'Depois que o crédito já foi constituído, existe um prazo para o fisco cobrá-lo judicialmente, chamado de ___',
          accept: ['prescrição', 'prescricao'],
          explanation: 'Prescrição é o prazo para cobrança judicial de um crédito já constituído.'
        }
      ]
    },
    {
      id: 'spa-09-siscoserv',
      title: 'SISCOSERV: operações internacionais de serviços',
      goal: 'Entender o que o SISCOSERV declara e por que ele existe separado das demais obrigações.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'O que ficou de fora de tudo que vimos até aqui',
            body: 'Todas as declarações vistas até agora tratam de operações dentro do Brasil — mas empresas que compram ou vendem serviços para o exterior também têm uma obrigação própria.'
          },
          {
            title: 'O que é o SISCOSERV',
            body: 'Sistema Integrado de Comércio Exterior de Serviços, Intangíveis e Outras Operações que Produzam Variações no Patrimônio: sistema usado para registrar operações de comércio exterior envolvendo serviços e intangíveis (não mercadorias físicas, que já têm seu próprio controle aduaneiro).'
          },
          {
            title: 'Por que serviços internacionais precisam de um sistema à parte',
            body: 'Mercadorias físicas que cruzam a fronteira já são controladas por documentos de importação/exportação e pela fiscalização aduaneira; serviços (como uma consultoria prestada a uma empresa estrangeira) não têm essa mesma barreira física de controle, daí a necessidade de uma declaração própria.'
          },
          {
            title: 'Quem precisa declarar',
            body: 'De forma geral, empresas residentes no Brasil que compram ou vendem serviços, ou intangíveis (como uso de marca) para o exterior, acima de determinados valores, precisam registrar essas operações no SISCOSERV.'
          },
          {
            title: 'Relação com o restante do universo de declarações',
            body: 'Apesar de específico para operações internacionais, o SISCOSERV segue a mesma lógica de fundo de todas as outras declarações vistas: dar visibilidade ao governo sobre operações que, de outra forma, seriam difíceis de acompanhar.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que o SISCOSERV declara?',
          choices: [
            { id: 'a', text: 'Operações de comércio exterior envolvendo serviços e intangíveis' },
            { id: 'b', text: 'Apenas a importação de mercadorias físicas' },
            { id: 'c', text: 'A folha de pagamento de funcionários' },
            { id: 'd', text: 'Débitos federais já apurados' }
          ],
          answer: 'a',
          explanation: 'O SISCOSERV registra operações internacionais de serviços e intangíveis.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Por que serviços internacionais precisam de um sistema separado das mercadorias físicas?',
          choices: [
            { id: 'a', text: 'Porque mercadorias físicas já são controladas por documentos de importação/exportação e fiscalização aduaneira; serviços não têm essa mesma barreira física' },
            { id: 'b', text: 'Porque serviços internacionais são isentos de qualquer controle' },
            { id: 'c', text: 'Porque mercadorias físicas nunca cruzam fronteiras' },
            { id: 'd', text: 'Não há motivo real, é uma duplicidade sem propósito' }
          ],
          answer: 'a',
          explanation: 'A ausência de barreira física para serviços exige um sistema de registro próprio.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Quem, de forma geral, precisa declarar no SISCOSERV?',
          choices: [
            { id: 'a', text: 'Empresas residentes no Brasil que compram ou vendem serviços/intangíveis para o exterior, acima de determinados valores' },
            { id: 'b', text: 'Somente órgãos públicos' },
            { id: 'c', text: 'Apenas empresas do Simples Nacional' },
            { id: 'd', text: 'Nenhuma empresa, é uma obrigação apenas teórica' }
          ],
          answer: 'a',
          explanation: 'Empresas com operações internacionais de serviços/intangíveis acima de certos valores declaram no SISCOSERV.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a sigla do sistema que registra operações de comércio exterior envolvendo serviços e intangíveis:',
          code: 'O ___ registra operações de comércio exterior envolvendo serviços e intangíveis',
          accept: ['SISCOSERV', 'siscoserv'],
          explanation: 'SISCOSERV é o sistema de registro de operações internacionais de serviços.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Dê um exemplo de intangível que poderia ser registrado no SISCOSERV.',
          choices: [
            { id: 'a', text: 'O uso de uma marca licenciada para o exterior' },
            { id: 'b', text: 'Uma máquina exportada fisicamente' },
            { id: 'c', text: 'Um lote de mercadorias importadas' },
            { id: 'd', text: 'Uma nota fiscal de venda interna' }
          ],
          answer: 'a',
          explanation: 'Licenciamento de marca é um exemplo típico de intangível registrável no SISCOSERV.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual a lógica de fundo que o SISCOSERV compartilha com as demais declarações vistas no curso?',
          choices: [
            { id: 'a', text: 'Dar visibilidade ao governo sobre operações que, de outra forma, seriam difíceis de acompanhar' },
            { id: 'b', text: 'Aumentar a carga tributária de todas as empresas' },
            { id: 'c', text: 'Substituir totalmente a necessidade de nota fiscal' },
            { id: 'd', text: 'Eliminar operações internacionais de serviços' }
          ],
          answer: 'a',
          explanation: 'Assim como as demais declarações, o SISCOSERV busca dar visibilidade a operações relevantes.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Mercadorias físicas que cruzam a fronteira são controladas por qual tipo de mecanismo, diferente dos serviços?',
          choices: [
            { id: 'a', text: 'Documentos de importação/exportação e fiscalização aduaneira' },
            { id: 'b', text: 'Apenas pela EFD Fiscal' },
            { id: 'c', text: 'Pelo eSocial' },
            { id: 'd', text: 'Não há nenhum controle sobre mercadorias físicas' }
          ],
          answer: 'a',
          explanation: 'O controle aduaneiro é o mecanismo próprio de mercadorias físicas na fronteira.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o tipo de operação exemplificada por uma consultoria prestada a uma empresa estrangeira:',
          code: 'Uma consultoria prestada a uma empresa estrangeira é um exemplo de ___ que pode precisar ser registrado no SISCOSERV',
          accept: ['serviço', 'servico'],
          explanation: 'Uma consultoria é um serviço, categoria central do que o SISCOSERV registra.'
        }
      ]
    },
    {
      id: 'spa-10-auditoria-eletronica',
      title: 'Auditoria eletrônica: conferindo a EFD contra a realidade da empresa',
      goal: 'Entender, na prática, como profissionais conferem se uma EFD está correta antes de entregá-la.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Gerar o arquivo não significa que ele está certo',
            body: 'O sistema da empresa (ERP) gera a EFD automaticamente a partir dos lançamentos e notas fiscais — mas isso não garante, por si só, que tudo foi classificado corretamente.'
          },
          {
            title: 'Conferência entre o XML das notas e a EFD',
            body: 'Uma prática comum é comparar, item a item, os XMLs das NF-e/CT-e/NFS-e emitidas e recebidas com o que efetivamente aparece nos registros da EFD Fiscal — divergências aqui indicam erro de configuração no ERP ou de classificação (CFOP/NCM errados, por exemplo).'
          },
          {
            title: 'Conferência de totais entre declarações',
            body: 'Outra prática comum é comparar totais entre declarações relacionadas (por exemplo, receita da EFD Contribuições x receita da ECD x total de notas emitidas) antes mesmo de entregar, simulando o mesmo cruzamento que o fisco faria depois.'
          },
          {
            title: 'Ferramentas de auditoria eletrônica',
            body: 'Existem softwares especializados (fora do escopo desta lição entrar em detalhe) que automatizam boa parte dessa conferência, lendo os arquivos do SPED e apontando inconsistências antes da entrega, de forma parecida com o que a malha fiscal faria depois.'
          },
          {
            title: 'Por que essa prática fecha o curso',
            body: 'Entender jargões e declarações isoladamente é só metade do caminho — a auditoria eletrônica é, na prática, aplicar tudo que foi visto no curso (estrutura de arquivo, blocos, cruzamento, malha fiscal) de forma preventiva, antes que o erro vire um problema real.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Por que gerar a EFD automaticamente pelo ERP não garante que ela está correta?',
          choices: [
            { id: 'a', text: 'Porque isso não garante, por si só, que tudo foi classificado corretamente' },
            { id: 'b', text: 'Porque o ERP nunca consegue gerar arquivos válidos' },
            { id: 'c', text: 'Porque toda EFD gerada automaticamente é rejeitada pelo PVA' },
            { id: 'd', text: 'Não há relação entre o ERP e a EFD gerada' }
          ],
          answer: 'a',
          explanation: 'A geração automática não elimina a possibilidade de erros de classificação ou configuração.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que é comparado numa conferência entre XML das notas e a EFD?',
          choices: [
            { id: 'a', text: 'Os XMLs das notas emitidas/recebidas com o que efetivamente aparece nos registros da EFD Fiscal, item a item' },
            { id: 'b', text: 'Apenas o total de funcionários da empresa' },
            { id: 'c', text: 'O certificado digital usado em cada nota' },
            { id: 'd', text: 'O prazo de entrega da declaração' }
          ],
          answer: 'a',
          explanation: 'A conferência item a item entre XML e EFD é uma prática comum de auditoria.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que divergências entre XML e EFD costumam indicar?',
          choices: [
            { id: 'a', text: 'Erro de configuração no ERP ou de classificação, como CFOP/NCM errados' },
            { id: 'b', text: 'Que a empresa está isenta de impostos' },
            { id: 'c', text: 'Que o PVA está com defeito' },
            { id: 'd', text: 'Que a chave de acesso da NF-e expirou' }
          ],
          answer: 'a',
          explanation: 'Divergências costumam apontar problemas de configuração ou classificação incorreta.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o processo que a comparação de totais entre declarações simula, antes mesmo de entregar:',
          code: 'Uma prática comum é comparar totais entre declarações relacionadas, simulando o mesmo ___ que o fisco faria depois',
          accept: ['cruzamento'],
          explanation: 'A comparação prévia simula o cruzamento que o fisco faria depois da entrega.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Para que servem ferramentas de auditoria eletrônica?',
          choices: [
            { id: 'a', text: 'Automatizar a conferência dos arquivos do SPED, apontando inconsistências antes da entrega' },
            { id: 'b', text: 'Substituir totalmente a necessidade de contador' },
            { id: 'c', text: 'Gerar automaticamente novas notas fiscais' },
            { id: 'd', text: 'Eliminar a necessidade de assinatura digital' }
          ],
          answer: 'a',
          explanation: 'Essas ferramentas automatizam a conferência preventiva dos arquivos do SPED.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual a vantagem de fazer essa conferência ANTES de entregar a declaração?',
          choices: [
            { id: 'a', text: 'Identificar e corrigir erros antes que eles gerem questionamento do fisco (como cair na malha fiscal)' },
            { id: 'b', text: 'Nenhuma vantagem real, o resultado é sempre o mesmo' },
            { id: 'c', text: 'Reduzir automaticamente o valor do imposto devido' },
            { id: 'd', text: 'Evitar a necessidade de qualquer retificadora futura, mesmo com erros' }
          ],
          answer: 'a',
          explanation: 'A conferência prévia evita que erros virem inconsistências detectadas depois pelo fisco.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que a auditoria eletrônica é descrita como "aplicar tudo que foi visto no curso"?',
          choices: [
            { id: 'a', text: 'Porque usa estrutura de arquivo, blocos, cruzamento e o conceito de malha fiscal de forma preventiva' },
            { id: 'b', text: 'Porque exige aprender uma linguagem de programação nova' },
            { id: 'c', text: 'Porque substitui integralmente os conceitos vistos anteriormente' },
            { id: 'd', text: 'Não há relação real com o conteúdo do curso' }
          ],
          answer: 'a',
          explanation: 'A auditoria eletrônica junta, na prática, os conceitos de estrutura, cruzamento e malha fiscal.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o momento em que a conferência item a item entre XML e EFD deve ocorrer:',
          code: 'Comparar, item a item, os XMLs das notas com os registros da EFD é uma forma de conferência antes da ___',
          accept: ['entrega'],
          explanation: 'A conferência é feita antes da entrega, de forma preventiva.'
        }
      ]
    }
  ]
};
