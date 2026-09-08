// Módulo "Fundamentos" (iniciante) — 13 lições, 8 questões cada (3 múltipla escolha + 1 lacuna,
// duas vezes por lição). Ver ../../index.js para o formato e a validação de boot. Curso
// conceitual: jargões, siglas e a lógica geral das obrigações do SPED (ECD, ECF, EFD Fiscal, EFD
// Contribuições) — nenhum exemplo usa dado real de empresa/CPF, só nomenclatura e estrutura
// genérica. Conteúdo deliberadamente evita números/prazos/percentuais específicos (mudam com a
// legislação e ficariam desatualizados) — o foco é o vocabulário e os conceitos, não a legislação
// vigente em si.
// Ids não são numericamente sequenciais na ordem pedagógica: sped-11/sped-12/sped-13 foram
// inseridas depois, entre lições já numeradas (mesma convenção dos outros cursos) — Regimes
// tributários logo antes da ECD (explica quem entrega o quê), NF-e e CFOP/NCM logo antes da EFD
// Fiscal (a origem e os códigos dos dados que ela organiza).
module.exports = {
  id: 'fundamentos-sped',
  levelKey: 'beginner',
  order: 1,
  title: 'Fundamentos',
  subtitle: 'Jargões, estrutura de arquivo e as principais declarações do SPED',
  accent: '#0ea5e9',
  lessons: [
    {
      id: 'sped-01-visao-geral',
      title: 'O que é o SPED',
      goal: 'Entender o que é o SPED, por que ele existe, e por que aparece tanto no dia a dia.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'O problema que o SPED resolve',
            body: 'Antes do SPED, empresas entregavam informações fiscais e contábeis em papel ou em formatos isolados, um para cada órgão (Receita Federal, Secretarias estaduais de Fazenda...) — informação espalhada, difícil de cruzar e fácil de burlar.'
          },
          {
            title: 'O que é o SPED',
            body: 'SPED significa Sistema Público de Escrituração Digital: um projeto do governo brasileiro que unifica a forma como empresas entregam informações contábeis e fiscais, substituindo papel por arquivos digitais padronizados.'
          },
          {
            title: 'Não é "uma declaração", é uma família de declarações',
            body: 'Na prática, "SPED" não é um único arquivo — é um guarda-chuva que reúne várias obrigações diferentes (ECD, ECF, EFD Fiscal, EFD Contribuições, entre outras), cada uma com seu próprio conteúdo e periodicidade.'
          },
          {
            title: 'Por que isso importa no dia a dia',
            body: 'Cada uma dessas declarações tem sua própria lógica, prazo e público (quem é obrigado a entregar) — mas todas compartilham conceitos e estrutura parecidos. Entender esses conceitos comuns facilita entender qualquer uma delas depois.'
          },
          {
            title: 'O objetivo de fundo',
            body: 'Ao receber tudo digitalmente e em formato padronizado, o governo consegue cruzar informações entre empresas e entre declarações diferentes, identificando inconsistências muito mais rápido do que era possível em papel.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que a sigla SPED significa?',
          choices: [
            { id: 'a', text: 'Sistema Público de Escrituração Digital' },
            { id: 'b', text: 'Serviço de Processamento de Empresas e Dados' },
            { id: 'c', text: 'Sistema de Pagamento Eletrônico de Dívidas' },
            { id: 'd', text: 'Secretaria de Planejamento Econômico e Digital' }
          ],
          answer: 'a',
          explanation: 'SPED é o Sistema Público de Escrituração Digital, do governo federal.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual problema o SPED resolveu, em relação ao modelo anterior?',
          choices: [
            { id: 'a', text: 'Centralizou e padronizou informações que antes eram entregues em papel ou em formatos isolados' },
            { id: 'b', text: 'Eliminou a necessidade de pagar qualquer imposto' },
            { id: 'c', text: 'Acabou com a existência de fiscalização' },
            { id: 'd', text: 'Substituiu a contabilidade por completo' }
          ],
          answer: 'a',
          explanation: 'O SPED unificou e digitalizou a entrega de informações antes espalhadas e em papel.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: '"SPED" é o nome de uma única declaração?',
          choices: [
            { id: 'a', text: 'Não, é um guarda-chuva que reúne várias obrigações diferentes (ECD, ECF, EFD Fiscal, EFD Contribuições...)' },
            { id: 'b', text: 'Sim, é uma única declaração anual' },
            { id: 'c', text: 'Sim, é o nome de um imposto específico' },
            { id: 'd', text: 'Não, é o nome do órgão que fiscaliza as empresas' }
          ],
          answer: 'a',
          explanation: 'SPED é a família de obrigações digitais, não uma declaração isolada.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a sigla que representa o Sistema Público de Escrituração Digital:',
          code: '___ = Sistema Público de Escrituração Digital',
          accept: ['SPED', 'sped'],
          explanation: 'SPED é a sigla usada no dia a dia para se referir a esse conjunto de obrigações.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Por que entender os conceitos comuns entre as declarações do SPED é útil?',
          choices: [
            { id: 'a', text: 'Porque facilita entender qualquer declaração específica depois, mesmo com prazos e conteúdos diferentes' },
            { id: 'b', text: 'Porque todas as declarações do SPED são idênticas' },
            { id: 'c', text: 'Não é útil, cada declaração precisa ser aprendida do zero' },
            { id: 'd', text: 'Porque isso substitui a necessidade de um contador' }
          ],
          answer: 'a',
          explanation: 'Os conceitos e a estrutura se repetem entre as declarações, mesmo com conteúdos diferentes.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual o objetivo de fundo de receber as informações digitalmente e em formato padronizado?',
          choices: [
            { id: 'a', text: 'Permitir ao governo cruzar informações entre empresas e declarações, identificando inconsistências mais rápido' },
            { id: 'b', text: 'Reduzir o valor dos impostos devidos' },
            { id: 'c', text: 'Eliminar a necessidade de guardar qualquer registro contábil' },
            { id: 'd', text: 'Simplificar apenas a vida da empresa, sem relação com fiscalização' }
          ],
          answer: 'a',
          explanation: 'A padronização digital é o que viabiliza o cruzamento automático de dados pelo fisco.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Antes do SPED, como as informações fiscais/contábeis costumavam ser entregues?',
          choices: [
            { id: 'a', text: 'Em papel ou em formatos isolados, um para cada órgão' },
            { id: 'b', text: 'Já eram digitais e padronizadas' },
            { id: 'c', text: 'Não existia nenhuma obrigação de entregar informações' },
            { id: 'd', text: 'Só por telefone, sem registro formal' }
          ],
          answer: 'a',
          explanation: 'O modelo anterior era mais fragmentado, em papel ou sistemas isolados por órgão.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o nome de uma das obrigações que fazem parte da família SPED:',
          code: 'O SPED reúne várias obrigações diferentes, como ECD, ECF, EFD Fiscal e EFD ___',
          accept: ['Contribuições', 'contribuições'],
          explanation: 'EFD Contribuições é outra das principais obrigações que compõem o SPED.'
        }
      ]
    },
    {
      id: 'sped-02-jargoes-escrituracao-apuracao',
      title: 'Jargões: escrituração, apuração e obrigação acessória',
      goal: 'Entender três termos que aparecem em praticamente toda conversa sobre SPED.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Escrituração',
            body: '"Escriturar" é registrar formalmente uma operação (uma venda, uma compra, um lançamento contábil) segundo regras específicas — "escrituração" é esse processo de registro, seja contábil ou fiscal.'
          },
          {
            title: 'Apuração',
            body: '"Apurar" um imposto é CALCULAR quanto é devido, num determinado período, a partir das operações escrituradas — por isso se fala em "apuração do ICMS", "apuração do PIS/COFINS", e assim por diante.'
          },
          {
            title: 'Obrigação principal x acessória',
            body: 'A obrigação PRINCIPAL é pagar o imposto; a obrigação ACESSÓRIA é o dever de INFORMAR ao fisco como esse valor foi calculado. As declarações do SPED são, tecnicamente, obrigações acessórias.'
          },
          {
            title: 'Por que a distinção importa',
            body: 'É possível estar em dia com o pagamento do imposto (obrigação principal) e ainda assim ter problemas por não entregar, ou entregar errado, uma declaração (obrigação acessória) — e vice-versa.'
          },
          {
            title: 'Juntando os três termos',
            body: 'De forma simples: primeiro se ESCRITURA (registra) cada operação; depois se APURA (calcula) o imposto com base nesses registros; e por fim se cumpre a OBRIGAÇÃO ACESSÓRIA, entregando essa informação ao fisco através de uma das declarações do SPED.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que significa "escriturar" uma operação?',
          choices: [
            { id: 'a', text: 'Registrar formalmente essa operação segundo regras específicas' },
            { id: 'b', text: 'Pagar o imposto devido sobre ela' },
            { id: 'c', text: 'Cancelar a operação' },
            { id: 'd', text: 'Enviar a operação para o fisco por e-mail' }
          ],
          answer: 'a',
          explanation: 'Escrituração é o registro formal de uma operação, seguindo regras contábeis/fiscais.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que significa "apurar" um imposto?',
          choices: [
            { id: 'a', text: 'Calcular quanto é devido, num período, a partir das operações escrituradas' },
            { id: 'b', text: 'Pagar o imposto imediatamente' },
            { id: 'c', text: 'Registrar uma nova empresa' },
            { id: 'd', text: 'Cancelar uma declaração anterior' }
          ],
          answer: 'a',
          explanation: 'Apuração é o cálculo do valor devido, com base no que já foi escriturado.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual a diferença entre obrigação principal e obrigação acessória?',
          choices: [
            { id: 'a', text: 'A principal é pagar o imposto; a acessória é informar ao fisco como esse valor foi calculado' },
            { id: 'b', text: 'Não há diferença, são sinônimos' },
            { id: 'c', text: 'A acessória é sempre mais importante que a principal' },
            { id: 'd', text: 'A principal só existe para pessoas físicas' }
          ],
          answer: 'a',
          explanation: 'Principal = pagar; acessória = informar/declarar como o valor foi apurado.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o tipo de obrigação que corresponde ao dever de PAGAR o imposto:',
          code: 'A obrigação ___ é o dever de pagar o imposto; a obrigação acessória é o dever de informar ao fisco',
          accept: ['principal'],
          explanation: 'A obrigação principal é justamente o pagamento do tributo devido.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'As declarações do SPED são, tecnicamente, que tipo de obrigação?',
          choices: [
            { id: 'a', text: 'Obrigações acessórias' },
            { id: 'b', text: 'Obrigações principais' },
            { id: 'c', text: 'Não são consideradas obrigações' },
            { id: 'd', text: 'Apenas recomendações, sem caráter obrigatório' }
          ],
          answer: 'a',
          explanation: 'As declarações do SPED cumprem o dever de informar — são obrigações acessórias.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'É possível estar em dia com o pagamento do imposto e ainda assim ter um problema fiscal?',
          choices: [
            { id: 'a', text: 'Sim, se a obrigação acessória (a declaração) não for entregue ou for entregue errada' },
            { id: 'b', text: 'Não, pagar o imposto resolve tudo automaticamente' },
            { id: 'c', text: 'Só se a empresa não existir mais' },
            { id: 'd', text: 'Não, obrigação acessória não existe de fato' }
          ],
          answer: 'a',
          explanation: 'Pagar o imposto não dispensa a entrega correta da obrigação acessória correspondente.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual a ordem lógica entre escriturar, apurar e cumprir a obrigação acessória?',
          choices: [
            { id: 'a', text: 'Primeiro escriturar as operações, depois apurar o imposto com base nelas, por fim entregar a declaração' },
            { id: 'b', text: 'Primeiro entregar a declaração, depois escriturar as operações' },
            { id: 'c', text: 'Apurar antes de qualquer operação acontecer' },
            { id: 'd', text: 'A ordem não importa, pode ser feita em qualquer sequência' }
          ],
          answer: 'a',
          explanation: 'A sequência lógica é escriturar, apurar e só então declarar ao fisco.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o termo que representa o cálculo de quanto de imposto é devido num período:',
          code: 'A ___ é o processo de calcular quanto de imposto é devido num período',
          accept: ['Apuração', 'apuração'],
          explanation: 'Apuração é exatamente esse processo de cálculo do valor devido.'
        }
      ]
    },
    {
      id: 'sped-03-jargoes-leiaute-registro-bloco',
      title: 'Jargões: leiaute, registro, bloco, retificadora e recibo',
      goal: 'Entender os termos usados para descrever a estrutura e o ciclo de vida de um arquivo do SPED.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Leiaute',
            body: '"Leiaute" é o formato oficial definido por lei/norma para um arquivo do SPED: quais informações ele deve ter, em que ordem, e como cada uma deve ser escrita. Cada declaração (ECD, ECF, EFD Fiscal...) tem seu próprio leiaute.'
          },
          {
            title: 'Registro',
            body: 'Dentro de um arquivo, cada linha de informação é chamada de "registro" — um registro representa um tipo específico de informação (por exemplo, os dados de uma nota fiscal, ou de um lançamento contábil).'
          },
          {
            title: 'Bloco',
            body: 'Registros relacionados ao mesmo assunto são agrupados em "blocos", geralmente identificados por uma letra (por exemplo, o bloco de identificação da empresa, o bloco de documentos fiscais) — o leiaute organiza todos os blocos possíveis daquela declaração.'
          },
          {
            title: 'Retificadora',
            body: 'Quando um arquivo já entregue tem um erro, não se "edita" o arquivo antigo: entrega-se uma nova versão, chamada de declaração RETIFICADORA, que substitui a anterior.'
          },
          {
            title: 'Recibo de entrega',
            body: 'Depois que um arquivo é enviado e aceito, o sistema gera um "recibo de entrega" — o comprovante de que aquela declaração (ou sua retificadora) foi recebida oficialmente pelo governo.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que é o "leiaute" de uma declaração do SPED?',
          choices: [
            { id: 'a', text: 'O formato oficial definido por lei/norma, dizendo quais informações o arquivo deve ter e como' },
            { id: 'b', text: 'O nome do sistema contábil da empresa' },
            { id: 'c', text: 'O valor total do imposto apurado' },
            { id: 'd', text: 'O prazo final de entrega da declaração' }
          ],
          answer: 'a',
          explanation: 'Leiaute é a especificação oficial da estrutura do arquivo.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que é um "registro" dentro de um arquivo do SPED?',
          choices: [
            { id: 'a', text: 'Uma linha de informação, representando um tipo específico de dado' },
            { id: 'b', text: 'O arquivo inteiro' },
            { id: 'c', text: 'O certificado digital da empresa' },
            { id: 'd', text: 'O nome do imposto apurado' }
          ],
          answer: 'a',
          explanation: 'Cada registro é uma linha do arquivo, representando um tipo específico de dado.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que é um "bloco", dentro do leiaute de uma declaração?',
          choices: [
            { id: 'a', text: 'Um agrupamento de registros relacionados ao mesmo assunto, geralmente identificado por uma letra' },
            { id: 'b', text: 'Um tipo de imposto' },
            { id: 'c', text: 'O nome do órgão que recebe a declaração' },
            { id: 'd', text: 'Uma retificadora' }
          ],
          answer: 'a',
          explanation: 'Blocos agrupam registros de um mesmo assunto dentro do leiaute.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o nome da nova versão entregue quando um arquivo já enviado precisa ser corrigido:',
          code: 'Quando um arquivo já entregue precisa ser corrigido, entrega-se uma nova versão chamada de declaração ___',
          accept: ['retificadora'],
          explanation: 'A retificadora é a nova versão que substitui a declaração anterior com erro.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Por que não se "edita" um arquivo já entregue quando há um erro nele?',
          choices: [
            { id: 'a', text: 'Porque o processo exige entregar uma nova versão (retificadora) que substitui a anterior' },
            { id: 'b', text: 'Porque uma vez entregue, o erro não pode mais ser corrigido de forma alguma' },
            { id: 'c', text: 'Porque o governo edita o arquivo automaticamente' },
            { id: 'd', text: 'Porque arquivos do SPED não podem conter erros' }
          ],
          answer: 'a',
          explanation: 'A correção é feita através de uma nova entrega (retificadora), não editando o arquivo original.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que é o "recibo de entrega"?',
          choices: [
            { id: 'a', text: 'O comprovante de que a declaração foi recebida oficialmente pelo governo' },
            { id: 'b', text: 'O valor do imposto a pagar' },
            { id: 'c', text: 'O certificado digital usado para assinar o arquivo' },
            { id: 'd', text: 'O leiaute da declaração' }
          ],
          answer: 'a',
          explanation: 'O recibo é o comprovante oficial de que a entrega foi recebida com sucesso.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Cada declaração do SPED (ECD, ECF, EFD Fiscal...) tem o quê de próprio?',
          choices: [
            { id: 'a', text: 'Seu próprio leiaute, com sua própria estrutura de blocos e registros' },
            { id: 'b', text: 'O mesmo leiaute idêntico de todas as outras' },
            { id: 'c', text: 'Nenhuma estrutura definida, é feita livremente' },
            { id: 'd', text: 'Apenas um único registro por arquivo' }
          ],
          answer: 'a',
          explanation: 'Cada declaração tem seu próprio leiaute oficial, com blocos e registros específicos.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o termo usado para o agrupamento de registros relacionados ao mesmo assunto:',
          code: 'Registros relacionados ao mesmo assunto são agrupados em ___, geralmente identificados por uma letra',
          accept: ['blocos', 'bloco'],
          explanation: 'Blocos organizam os registros por assunto dentro do leiaute.'
        }
      ]
    },
    {
      id: 'sped-04-estrutura-arquivo',
      title: 'A estrutura de um arquivo do SPED',
      goal: 'Reconhecer visualmente como um arquivo de SPED é organizado por dentro.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'Um arquivo de texto simples',
            body: 'Por baixo dos jargões, um arquivo do SPED é, na maioria dos casos, um arquivo de texto (.txt) — sem formatação especial, só linhas de texto puro.'
          },
          {
            title: 'Campos separados por pipe',
            body: 'Dentro de cada linha (registro), os campos de informação são separados pelo caractere pipe ( | ) — um formato simples de processar tanto por máquina quanto, com prática, por uma pessoa.',
            code: '|C100|0|1|EMPRESA XYZ|55|00|123|1|01012024|...|'
          },
          {
            title: 'O código do registro',
            body: 'O primeiro campo de cada linha identifica o TIPO daquele registro (por exemplo, um código como C100 costuma representar dados de uma nota fiscal) — é esse código que diz "o que" aquela linha representa dentro do leiaute.'
          },
          {
            title: 'Abertura e fechamento',
            body: 'Todo arquivo do SPED começa com um registro de abertura (identificando quem está entregando o arquivo e qual período) e termina com um registro de fechamento, que costuma contar quantos registros de cada tipo existem — uma forma de conferir se nada foi perdido no envio.'
          },
          {
            title: 'Por que entender essa estrutura ajuda',
            body: 'Mesmo sem saber de cor o código exato de cada registro, entender que um arquivo do SPED é "texto, dividido em blocos, cada linha com um código de registro, com abertura e fechamento" já ajuda a acompanhar relatórios de erro e conversas técnicas sobre o assunto.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Na maioria dos casos, o que é um arquivo do SPED, por baixo dos jargões?',
          choices: [
            { id: 'a', text: 'Um arquivo de texto simples (.txt)' },
            { id: 'b', text: 'Uma planilha do Excel' },
            { id: 'c', text: 'Um banco de dados na nuvem' },
            { id: 'd', text: 'Uma imagem escaneada' }
          ],
          answer: 'a',
          explanation: 'Arquivos do SPED costumam ser arquivos de texto puro, sem formatação especial.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Como os campos de um registro costumam ser separados dentro da linha?',
          choices: [
            { id: 'a', text: 'Pelo caractere pipe ( | )' },
            { id: 'b', text: 'Por vírgulas apenas' },
            { id: 'c', text: 'Por espaços em branco' },
            { id: 'd', text: 'Não há separação, é texto corrido' }
          ],
          answer: 'a',
          explanation: 'O pipe ( | ) é o separador padrão dos campos dentro de um registro do SPED.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que o primeiro campo de cada linha (registro) identifica?',
          choices: [
            { id: 'a', text: 'O tipo daquele registro dentro do leiaute' },
            { id: 'b', text: 'O valor total do imposto' },
            { id: 'c', text: 'O nome da empresa' },
            { id: 'd', text: 'A data de entrega do arquivo' }
          ],
          answer: 'a',
          explanation: 'O código inicial do registro diz que tipo de informação aquela linha representa.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o caractere usado para separar os campos de um registro do SPED:',
          code: 'Os campos de um registro do SPED costumam ser separados pelo caractere ___',
          accept: ['|', 'pipe'],
          explanation: 'O pipe ( | ) separa os campos dentro de cada linha do arquivo.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que geralmente existe no início e no fim de um arquivo do SPED?',
          choices: [
            { id: 'a', text: 'Um registro de abertura e um registro de fechamento' },
            { id: 'b', text: 'Apenas um resumo do imposto devido' },
            { id: 'c', text: 'Nada, o arquivo começa direto com os dados' },
            { id: 'd', text: 'Uma imagem do certificado digital' }
          ],
          answer: 'a',
          explanation: 'Registros de abertura e fechamento demarcam o início e o fim do arquivo.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Para que serve o registro de fechamento, que costuma contar os registros de cada tipo?',
          choices: [
            { id: 'a', text: 'Conferir se nada foi perdido durante o envio do arquivo' },
            { id: 'b', text: 'Calcular o valor do imposto devido' },
            { id: 'c', text: 'Assinar digitalmente o arquivo' },
            { id: 'd', text: 'Identificar a empresa que entregou o arquivo' }
          ],
          answer: 'a',
          explanation: 'A contagem no fechamento serve como conferência de integridade do arquivo.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que entender essa estrutura geral ajuda, mesmo sem saber todos os códigos de registro de cor?',
          choices: [
            { id: 'a', text: 'Porque facilita entender relatórios de erro e conversas técnicas sobre qualquer declaração do SPED' },
            { id: 'b', text: 'Porque substitui a necessidade de qualquer sistema contábil' },
            { id: 'c', text: 'Não ajuda em nada na prática' },
            { id: 'd', text: 'Porque elimina a necessidade de validar o arquivo' }
          ],
          answer: 'a',
          explanation: 'Entender a estrutura geral facilita interpretar mensagens de erro e discussões técnicas.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o tipo de registro que abre todo arquivo do SPED, identificando quem entrega e qual período:',
          code: 'Todo arquivo do SPED começa com um registro de ___ e termina com um registro de fechamento',
          accept: ['abertura'],
          explanation: 'O registro de abertura identifica o declarante e o período coberto pelo arquivo.'
        }
      ]
    },
    {
      id: 'sped-05-pva-entrega',
      title: 'O PVA e o processo de entrega',
      goal: 'Entender como um arquivo do SPED é validado, assinado e enviado ao governo.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'Gerar o arquivo não é o suficiente',
            body: 'Depois que o arquivo é gerado (pelo sistema contábil/fiscal da empresa), ele ainda precisa ser validado e assinado digitalmente antes de ser considerado entregue de verdade.'
          },
          {
            title: 'PVA: Programa Validador e Assinador',
            body: 'O PVA é o programa oficial (disponibilizado pelo governo) usado para abrir o arquivo gerado, checar se ele segue o leiaute correto, e assiná-lo digitalmente antes do envio.'
          },
          {
            title: 'Validação',
            body: 'Durante a validação, o PVA aponta erros de estrutura (campos fora do leiaute, registros incompletos, totais que não batem) — corrigir esses erros ANTES de assinar evita ter que entregar uma retificadora depois.'
          },
          {
            title: 'Assinatura digital',
            body: 'A assinatura digital (geralmente com um certificado digital da empresa) garante que aquele arquivo realmente veio de quem diz ter enviado, e que não foi alterado depois de assinado.'
          },
          {
            title: 'Transmissão e recibo',
            body: 'Depois de validado e assinado, o arquivo é transmitido; se aceito, o sistema gera o recibo de entrega — só a partir daí a declaração é considerada oficialmente entregue.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Gerar o arquivo do SPED já é suficiente para considerá-lo entregue?',
          choices: [
            { id: 'a', text: 'Não, ele ainda precisa ser validado e assinado digitalmente antes do envio' },
            { id: 'b', text: 'Sim, gerar já é o mesmo que entregar' },
            { id: 'c', text: 'Sim, desde que o arquivo tenha extensão .txt' },
            { id: 'd', text: 'Não, é preciso reescrevê-lo à mão' }
          ],
          answer: 'a',
          explanation: 'Validação e assinatura são passos obrigatórios antes da entrega ser considerada válida.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que a sigla PVA significa?',
          choices: [
            { id: 'a', text: 'Programa Validador e Assinador' },
            { id: 'b', text: 'Plataforma de Verificação de Arrecadação' },
            { id: 'c', text: 'Processo de Validação Anual' },
            { id: 'd', text: 'Padrão de Verificação de Alíquotas' }
          ],
          answer: 'a',
          explanation: 'PVA é o Programa Validador e Assinador, usado para conferir e assinar o arquivo.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que o PVA faz durante a validação do arquivo?',
          choices: [
            { id: 'a', text: 'Aponta erros de estrutura, como campos fora do leiaute ou totais que não batem' },
            { id: 'b', text: 'Paga o imposto automaticamente' },
            { id: 'c', text: 'Cria a empresa no sistema do governo' },
            { id: 'd', text: 'Gera o certificado digital da empresa' }
          ],
          answer: 'a',
          explanation: 'A validação identifica inconsistências estruturais antes do envio.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a sigla do programa oficial usado para validar e assinar o arquivo do SPED:',
          code: 'O ___ é o programa oficial usado para validar e assinar o arquivo do SPED',
          accept: ['PVA', 'pva'],
          explanation: 'PVA (Programa Validador e Assinador) é a ferramenta oficial para esse processo.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Por que corrigir erros apontados na validação, antes de assinar, é importante?',
          choices: [
            { id: 'a', text: 'Evita ter que entregar uma retificadora depois' },
            { id: 'b', text: 'Não traz nenhum benefício real' },
            { id: 'c', text: 'É proibido corrigir erros depois de gerado o arquivo' },
            { id: 'd', text: 'Só é importante para empresas grandes' }
          ],
          answer: 'a',
          explanation: 'Corrigir antes de assinar evita retrabalho com uma declaração retificadora futura.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Para que serve a assinatura digital do arquivo?',
          choices: [
            { id: 'a', text: 'Garantir que o arquivo veio de quem diz ter enviado, e que não foi alterado depois' },
            { id: 'b', text: 'Calcular o valor do imposto devido' },
            { id: 'c', text: 'Converter o arquivo para outro formato' },
            { id: 'd', text: 'Enviar automaticamente o arquivo para todos os fiscos' }
          ],
          answer: 'a',
          explanation: 'A assinatura digital garante autenticidade e integridade do arquivo entregue.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'O que acontece depois que o arquivo validado e assinado é transmitido e aceito?',
          choices: [
            { id: 'a', text: 'O sistema gera o recibo de entrega' },
            { id: 'b', text: 'A empresa precisa reenviar o mesmo arquivo mais uma vez' },
            { id: 'c', text: 'O arquivo é apagado automaticamente' },
            { id: 'd', text: 'Nada, o processo termina sem nenhum comprovante' }
          ],
          answer: 'a',
          explanation: 'O recibo de entrega é gerado após a aceitação da transmissão.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o documento gerado após a transmissão aceita do arquivo, que comprova a entrega:',
          code: 'Só depois de gerado o ___ de entrega a declaração é considerada oficialmente entregue',
          accept: ['recibo'],
          explanation: 'O recibo de entrega é o comprovante oficial da declaração transmitida.'
        }
      ]
    },
    {
      id: 'sped-11-regimes-tributarios',
      title: 'Regimes tributários: Simples, Presumido e Real',
      goal: 'Entender os três principais regimes tributários e por que eles mudam o que uma empresa precisa declarar.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Por que o regime tributário importa tanto',
            body: 'Até agora falamos de declarações (ECD, ECF...) sem explicar por que nem toda empresa entrega todas elas — a resposta está no REGIME TRIBUTÁRIO escolhido pela empresa, que muda como ela é tributada e o que precisa informar.'
          },
          {
            title: 'Simples Nacional',
            body: 'Regime simplificado, pensado para micro e pequenas empresas, que unifica vários tributos (federais, estaduais e municipais) numa única guia de recolhimento — empresas do Simples costumam ter menos obrigações do SPED, ou obrigações simplificadas.'
          },
          {
            title: 'Lucro Presumido',
            body: 'O IRPJ/CSLL são calculados sobre um percentual PRESUMIDO de lucro sobre a receita (definido por lei conforme a atividade), independente do lucro real da empresa naquele período — mais simples de calcular que o Lucro Real, mas nem sempre mais vantajoso.'
          },
          {
            title: 'Lucro Real',
            body: 'O IRPJ/CSLL são calculados sobre o lucro REAL (contábil, com os ajustes fiscais) apurado pela empresa no período — exige contabilidade completa e é o regime que mais frequentemente exige entregar ECD e ECF.'
          },
          {
            title: 'Regime x obrigações do SPED',
            body: 'De forma geral, quanto mais completo o regime (Lucro Real), mais completas tendem a ser as obrigações do SPED exigidas; empresas do Simples Nacional costumam ter dispensa ou simplificação de várias delas — por isso "qual o regime da empresa?" é sempre uma das primeiras perguntas na hora de entender o que precisa ser entregue.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que o regime tributário de uma empresa determina, no contexto do SPED?',
          choices: [
            { id: 'a', text: 'Como a empresa é tributada e o que ela precisa informar/declarar' },
            { id: 'b', text: 'O nome fantasia da empresa' },
            { id: 'c', text: 'O endereço registrado da empresa' },
            { id: 'd', text: 'Apenas o número de funcionários' }
          ],
          answer: 'a',
          explanation: 'O regime tributário é o que define a forma de tributação e as obrigações decorrentes.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que caracteriza o Simples Nacional?',
          choices: [
            { id: 'a', text: 'Um regime simplificado, para micro e pequenas empresas, que unifica vários tributos numa única guia' },
            { id: 'b', text: 'Um regime exclusivo para bancos e seguradoras' },
            { id: 'c', text: 'Um regime que exige entrega obrigatória de ECD e ECF' },
            { id: 'd', text: 'Um regime que elimina qualquer tributação' }
          ],
          answer: 'a',
          explanation: 'O Simples Nacional simplifica e unifica a tributação de micro e pequenas empresas.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'No Lucro Presumido, como o IRPJ/CSLL são calculados?',
          choices: [
            { id: 'a', text: 'Sobre um percentual presumido de lucro sobre a receita, definido por lei conforme a atividade' },
            { id: 'b', text: 'Sobre o lucro contábil real apurado no período' },
            { id: 'c', text: 'Sobre o valor total do estoque da empresa' },
            { id: 'd', text: 'Não há cálculo, o valor é sempre fixo' }
          ],
          answer: 'a',
          explanation: 'No Lucro Presumido, um percentual da receita (fixado em lei) é usado como base de cálculo.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o regime em que o IRPJ/CSLL são calculados sobre o lucro contábil de fato apurado pela empresa:',
          code: 'No Lucro ___, o IRPJ/CSLL são calculados sobre o lucro contábil de fato apurado pela empresa',
          accept: ['Real', 'real'],
          explanation: 'No Lucro Real, a tributação parte do resultado contábil efetivo, com ajustes fiscais.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Qual regime exige contabilidade completa e, mais frequentemente, a entrega de ECD e ECF?',
          choices: [
            { id: 'a', text: 'Lucro Real' },
            { id: 'b', text: 'Simples Nacional' },
            { id: 'c', text: 'Nenhum regime exige isso' },
            { id: 'd', text: 'Lucro Presumido, exclusivamente' }
          ],
          answer: 'a',
          explanation: 'O Lucro Real costuma ser o regime mais associado à obrigatoriedade de ECD/ECF.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Por que empresas do Simples Nacional costumam ter menos obrigações do SPED?',
          choices: [
            { id: 'a', text: 'Porque o regime simplificado dispensa ou simplifica várias declarações, em comparação com regimes mais completos' },
            { id: 'b', text: 'Porque o Simples Nacional não existe de fato' },
            { id: 'c', text: 'Porque toda empresa do Simples é isenta de qualquer imposto' },
            { id: 'd', text: 'Não há relação entre regime e obrigações do SPED' }
          ],
          answer: 'a',
          explanation: 'A simplificação do regime costuma se refletir em menos obrigações acessórias.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que "qual o regime da empresa?" é uma das primeiras perguntas para entender o que ela precisa entregar?',
          choices: [
            { id: 'a', text: 'Porque o regime tributário determina diretamente quais obrigações do SPED se aplicam' },
            { id: 'b', text: 'Porque todas as empresas entregam exatamente as mesmas declarações, sem exceção' },
            { id: 'c', text: 'Porque o regime só afeta o valor pago, nunca o que é declarado' },
            { id: 'd', text: 'Não é uma pergunta relevante nesse contexto' }
          ],
          answer: 'a',
          explanation: 'O regime é o ponto de partida para saber quais declarações se aplicam a uma empresa.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o nome do regime simplificado, pensado para micro e pequenas empresas:',
          code: 'O ___ Nacional unifica vários tributos numa única guia, pensado para micro e pequenas empresas',
          accept: ['Simples', 'simples'],
          explanation: 'O Simples Nacional é o regime simplificado voltado a micro e pequenas empresas.'
        }
      ]
    },
    {
      id: 'sped-06-ecd',
      title: 'ECD: Escrituração Contábil Digital',
      goal: 'Entender o que a ECD é, o que ela contém e quem costuma entregá-la.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'O que é a ECD',
            body: 'ECD significa Escrituração Contábil Digital: é a versão digital dos livros contábeis tradicionais (Diário e Razão), entregue dentro do SPED.'
          },
          {
            title: 'O que ela substitui',
            body: 'Antes da ECD, empresas mantinham livros contábeis em papel ou em sistemas isolados — a ECD unifica isso num arquivo padronizado, entregue ao governo.'
          },
          {
            title: 'O que costuma estar dentro da ECD',
            body: 'O plano de contas da empresa, os lançamentos contábeis do período, e demonstrações como o balancete — a "espinha dorsal" contábil da empresa, num único arquivo.'
          },
          {
            title: 'Periodicidade',
            body: 'Diferente de declarações mensais (como as EFDs), a ECD costuma ser entregue anualmente, cobrindo todo o exercício contábil (o "ano fiscal") da empresa.'
          },
          {
            title: 'Quem entrega a ECD',
            body: 'De forma geral, empresas obrigadas a manter escrituração contábil regular (a maioria das empresas tributadas pelo Lucro Real, entre outras) precisam entregar a ECD — empresas mais simples podem ter dispensa, conforme a legislação vigente.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que a sigla ECD significa?',
          choices: [
            { id: 'a', text: 'Escrituração Contábil Digital' },
            { id: 'b', text: 'Empresa de Capital Distribuído' },
            { id: 'c', text: 'Escrituração de Créditos e Débitos' },
            { id: 'd', text: 'Espelho Contábil de Distribuição' }
          ],
          answer: 'a',
          explanation: 'ECD é a Escrituração Contábil Digital, parte do SPED.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'A ECD é a versão digital de quê?',
          choices: [
            { id: 'a', text: 'Dos livros contábeis tradicionais, como o Diário e o Razão' },
            { id: 'b', text: 'Das notas fiscais de venda' },
            { id: 'c', text: 'Da folha de pagamento dos funcionários' },
            { id: 'd', text: 'Do contrato social da empresa' }
          ],
          answer: 'a',
          explanation: 'A ECD digitaliza os livros contábeis Diário e Razão.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que costuma estar dentro de uma ECD?',
          choices: [
            { id: 'a', text: 'O plano de contas, os lançamentos contábeis do período e demonstrações como o balancete' },
            { id: 'b', text: 'Apenas as notas fiscais emitidas' },
            { id: 'c', text: 'Só os dados cadastrais dos funcionários' },
            { id: 'd', text: 'Apenas o valor final do IRPJ' }
          ],
          answer: 'a',
          explanation: 'A ECD reúne o plano de contas, lançamentos e demonstrações contábeis.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a sigla da versão digital dos livros contábeis Diário e Razão:',
          code: 'A ___ é a versão digital dos livros contábeis Diário e Razão',
          accept: ['ECD', 'ecd'],
          explanation: 'ECD é a Escrituração Contábil Digital.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Com que periodicidade a ECD costuma ser entregue?',
          choices: [
            { id: 'a', text: 'Anualmente, cobrindo todo o exercício contábil' },
            { id: 'b', text: 'Mensalmente' },
            { id: 'c', text: 'A cada nota fiscal emitida' },
            { id: 'd', text: 'Apenas uma vez, na abertura da empresa' }
          ],
          answer: 'a',
          explanation: 'A ECD costuma ter periodicidade anual, cobrindo o exercício contábil inteiro.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'De forma geral, que tipo de empresa costuma ser obrigada a entregar a ECD?',
          choices: [
            { id: 'a', text: 'Empresas obrigadas a manter escrituração contábil regular, como a maioria tributada pelo Lucro Real' },
            { id: 'b', text: 'Somente empresas públicas' },
            { id: 'c', text: 'Nenhuma empresa é obrigada, é sempre facultativo' },
            { id: 'd', text: 'Somente pessoas físicas' }
          ],
          answer: 'a',
          explanation: 'Empresas com escrituração contábil regular obrigatória costumam entregar a ECD.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que se diz que a ECD é a "espinha dorsal contábil" da empresa?',
          choices: [
            { id: 'a', text: 'Porque reúne, num único arquivo, o plano de contas e todos os lançamentos contábeis do período' },
            { id: 'b', text: 'Porque é o único documento fiscal existente' },
            { id: 'c', text: 'Porque substitui a necessidade de contabilidade' },
            { id: 'd', text: 'Porque é entregue todo dia' }
          ],
          answer: 'a',
          explanation: 'A ECD concentra toda a informação contábil formal da empresa num único arquivo.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a periodicidade com que a ECD costuma ser entregue:',
          code: 'A ECD costuma ser entregue ___, cobrindo todo o exercício contábil da empresa',
          accept: ['anualmente', 'anual'],
          explanation: 'A ECD tem periodicidade anual, diferente das EFDs mensais.'
        }
      ]
    },
    {
      id: 'sped-07-ecf',
      title: 'ECF: Escrituração Contábil Fiscal',
      goal: 'Entender o que a ECF é, sua relação com a ECD, e o que ela apura.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'O que é a ECF',
            body: 'ECF significa Escrituração Contábil Fiscal: é a declaração usada para apurar o IRPJ (Imposto de Renda da Pessoa Jurídica) e a CSLL (Contribuição Social sobre o Lucro Líquido) da empresa.'
          },
          {
            title: 'A relação entre ECD e ECF',
            body: 'A ECF normalmente parte das informações já entregues na ECD (os lançamentos contábeis) e faz os ajustes fiscais necessários para chegar ao valor de IRPJ/CSLL devido — por isso a ECD costuma ser entregue antes da ECF, no calendário anual.'
          },
          {
            title: 'e-LALUR e e-LACS',
            body: 'Dentro da ECF, existem os chamados e-LALUR (Livro de Apuração do Lucro Real) e e-LACS (Livro de Apuração da Base de Cálculo da CSLL) — registros dos ajustes entre o lucro contábil e a base de cálculo desses dois tributos.'
          },
          {
            title: 'O que a ECF substituiu',
            body: 'A ECF substituiu a antiga DIPJ (Declaração de Informações Econômico-Fiscais da Pessoa Jurídica), um formulário anterior ao modelo SPED usado para essa mesma finalidade.'
          },
          {
            title: 'Periodicidade',
            body: 'Assim como a ECD, a ECF é entregue anualmente, cobrindo o exercício fiscal da empresa.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que a sigla ECF significa?',
          choices: [
            { id: 'a', text: 'Escrituração Contábil Fiscal' },
            { id: 'b', text: 'Escrituração de Créditos Financeiros' },
            { id: 'c', text: 'Espelho de Contas Fiscais' },
            { id: 'd', text: 'Escrituração de Compras e Fornecedores' }
          ],
          answer: 'a',
          explanation: 'ECF é a Escrituração Contábil Fiscal.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que a ECF apura?',
          choices: [
            { id: 'a', text: 'O IRPJ e a CSLL devidos pela empresa' },
            { id: 'b', text: 'O ICMS devido pela empresa' },
            { id: 'c', text: 'O salário dos funcionários' },
            { id: 'd', text: 'O valor das notas fiscais emitidas' }
          ],
          answer: 'a',
          explanation: 'A ECF apura o Imposto de Renda e a CSLL da pessoa jurídica.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual a relação entre ECD e ECF?',
          choices: [
            { id: 'a', text: 'A ECF parte das informações já entregues na ECD e faz os ajustes fiscais necessários' },
            { id: 'b', text: 'Não têm nenhuma relação entre si' },
            { id: 'c', text: 'A ECD é entregue depois da ECF, sempre' },
            { id: 'd', text: 'São a mesma declaração, com nomes diferentes' }
          ],
          answer: 'a',
          explanation: 'A ECF usa as informações contábeis da ECD como ponto de partida para os ajustes fiscais.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a sigla da declaração que apura o IRPJ e a CSLL, partindo das informações da ECD:',
          code: 'A ___ apura o IRPJ e a CSLL, partindo das informações já entregues na ECD',
          accept: ['ECF', 'ecf'],
          explanation: 'ECF é a Escrituração Contábil Fiscal.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que são e-LALUR e e-LACS?',
          choices: [
            { id: 'a', text: 'Registros dos ajustes entre o lucro contábil e a base de cálculo do IRPJ e da CSLL' },
            { id: 'b', text: 'Tipos de certificado digital' },
            { id: 'c', text: 'Nomes de blocos da EFD Fiscal' },
            { id: 'd', text: 'Formulários usados só por pessoas físicas' }
          ],
          answer: 'a',
          explanation: 'e-LALUR e e-LACS registram os ajustes fiscais dentro da ECF.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Que declaração anterior a ECF substituiu?',
          choices: [
            { id: 'a', text: 'A DIPJ (Declaração de Informações Econômico-Fiscais da Pessoa Jurídica)' },
            { id: 'b', text: 'A EFD Fiscal' },
            { id: 'c', text: 'A ECD' },
            { id: 'd', text: 'Nenhuma, a ECF é totalmente nova, sem substituir nada' }
          ],
          answer: 'a',
          explanation: 'A ECF substituiu a antiga DIPJ, anterior ao modelo SPED.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que a ECD costuma ser entregue antes da ECF, no calendário anual?',
          choices: [
            { id: 'a', text: 'Porque a ECF parte das informações contábeis já entregues na ECD' },
            { id: 'b', text: 'Por pura coincidência de calendário, sem relação entre elas' },
            { id: 'c', text: 'Porque a ECF é sempre entregue antes da ECD, não depois' },
            { id: 'd', text: 'Porque a ECD depende do resultado da ECF' }
          ],
          answer: 'a',
          explanation: 'A ordem existe porque a ECF utiliza dados já consolidados na ECD.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o nome do livro de apuração do Lucro Real, dentro da ECF:',
          code: 'Dentro da ECF, o e-___ é o Livro de Apuração do Lucro Real',
          accept: ['LALUR', 'lalur'],
          explanation: 'e-LALUR é o Livro de Apuração do Lucro Real, dentro da ECF.'
        }
      ]
    },
    {
      id: 'sped-12-nfe',
      title: 'NF-e: a Nota Fiscal Eletrônica',
      goal: 'Entender o que é uma NF-e e por que ela é a origem dos dados que alimentam a EFD Fiscal.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'De onde vêm os dados da EFD Fiscal',
            body: 'Antes de existir a EFD Fiscal, é preciso que a operação (uma venda, uma compra) já tenha sido documentada oficialmente — é aí que entra a Nota Fiscal Eletrônica.'
          },
          {
            title: 'O que é a NF-e',
            body: 'É a versão eletrônica da nota fiscal: um arquivo digital (XML) emitido e autorizado pelo fisco ANTES da mercadoria circular — substituiu, na maioria dos casos, o antigo talão de papel.'
          },
          {
            title: 'Chave de acesso',
            body: 'Cada NF-e tem uma "chave de acesso", um número único de 44 dígitos que identifica aquela nota especificamente — é o número usado para consultar ou confirmar a autenticidade da nota em qualquer sistema.'
          },
          {
            title: 'DANFE',
            body: 'É o documento impresso (ou em PDF) que acompanha a mercadoria fisicamente — importante entender que o DANFE NÃO é a nota fiscal em si, é só uma representação visual dela; o que vale legalmente é o XML autorizado pelo fisco.'
          },
          {
            title: 'A relação entre NF-e e EFD Fiscal',
            body: 'A EFD Fiscal, no bloco de documentos fiscais, basicamente resume e organiza as informações que já vieram das NF-e emitidas e recebidas pela empresa naquele período — por isso inconsistência entre notas e a EFD é um dos erros mais comuns de se investigar.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que é a NF-e?',
          choices: [
            { id: 'a', text: 'A versão eletrônica da nota fiscal, um arquivo digital (XML) emitido e autorizado pelo fisco' },
            { id: 'b', text: 'Um tipo de imposto federal' },
            { id: 'c', text: 'O mesmo que a ECD' },
            { id: 'd', text: 'Um relatório interno da empresa, sem valor fiscal' }
          ],
          answer: 'a',
          explanation: 'NF-e é o documento fiscal eletrônico (XML) que substituiu a nota em papel.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Quando a NF-e precisa ser autorizada pelo fisco, em relação à circulação da mercadoria?',
          choices: [
            { id: 'a', text: 'Antes da mercadoria circular' },
            { id: 'b', text: 'Só depois que a mercadoria já foi entregue' },
            { id: 'c', text: 'Não precisa de autorização do fisco' },
            { id: 'd', text: 'Um mês depois da venda' }
          ],
          answer: 'a',
          explanation: 'A autorização do fisco precisa ocorrer antes da circulação da mercadoria.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que é a chave de acesso de uma NF-e?',
          choices: [
            { id: 'a', text: 'Um número único de 44 dígitos que identifica aquela nota especificamente' },
            { id: 'b', text: 'A senha do certificado digital da empresa' },
            { id: 'c', text: 'O valor total da nota' },
            { id: 'd', text: 'O nome do produto vendido' }
          ],
          answer: 'a',
          explanation: 'A chave de acesso identifica de forma única cada NF-e emitida.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a sigla da versão eletrônica da nota fiscal, autorizada pelo fisco antes da mercadoria circular:',
          code: 'A ___ é a versão eletrônica da nota fiscal, autorizada pelo fisco antes da mercadoria circular',
          accept: ['NF-e', 'nf-e', 'NFe', 'nfe'],
          explanation: 'NF-e é a sigla da Nota Fiscal Eletrônica.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que é o DANFE?',
          choices: [
            { id: 'a', text: 'O documento impresso (ou PDF) que acompanha a mercadoria, uma representação visual da NF-e' },
            { id: 'b', text: 'O mesmo arquivo XML da NF-e, apenas renomeado' },
            { id: 'c', text: 'Um tipo de imposto sobre transporte' },
            { id: 'd', text: 'O recibo de entrega da EFD Fiscal' }
          ],
          answer: 'a',
          explanation: 'DANFE é a representação impressa/visual da NF-e, para acompanhar a mercadoria.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O DANFE é a nota fiscal em si, do ponto de vista legal?',
          choices: [
            { id: 'a', text: 'Não, o que vale legalmente é o XML autorizado pelo fisco; o DANFE é só a representação visual' },
            { id: 'b', text: 'Sim, o DANFE é o único documento que tem valor legal' },
            { id: 'c', text: 'Sim, e o XML é apenas um backup opcional' },
            { id: 'd', text: 'Nenhum dos dois tem valor legal' }
          ],
          answer: 'a',
          explanation: 'O documento juridicamente válido é o XML autorizado; o DANFE é sua representação visual.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual a relação entre NF-e e EFD Fiscal?',
          choices: [
            { id: 'a', text: 'A EFD Fiscal organiza e resume as informações que já vieram das NF-e emitidas/recebidas no período' },
            { id: 'b', text: 'Não há nenhuma relação entre as duas' },
            { id: 'c', text: 'A NF-e é gerada a partir da EFD Fiscal, na ordem inversa' },
            { id: 'd', text: 'A EFD Fiscal substitui a necessidade de emitir NF-e' }
          ],
          answer: 'a',
          explanation: 'A EFD Fiscal consolida as informações que já nasceram nas notas fiscais eletrônicas.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o termo que identifica uma NF-e especificamente, com 44 dígitos:',
          code: 'Cada NF-e tem uma ___ de acesso, um número único de 44 dígitos',
          accept: ['chave'],
          explanation: 'A chave de acesso é o identificador único de cada NF-e.'
        }
      ]
    },
    {
      id: 'sped-13-cfop-ncm',
      title: 'CFOP e NCM: classificando operações e produtos',
      goal: 'Entender os dois códigos mais comuns usados para classificar notas fiscais e produtos.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'Por que classificar cada operação',
            body: 'O fisco precisa saber, além do valor de uma nota fiscal, qual é a NATUREZA daquela operação (é uma venda? uma compra? uma transferência entre filiais? uma devolução?) — é isso que o CFOP indica.'
          },
          {
            title: 'CFOP — Código Fiscal de Operações e Prestações',
            body: 'Um código numérico que classifica a natureza da operação registrada numa nota fiscal, aparecendo tanto na nota quanto nos registros da EFD Fiscal — a apuração de ICMS, por exemplo, depende diretamente do CFOP de cada operação.'
          },
          {
            title: 'NCM — Nomenclatura Comum do Mercosul',
            body: 'Um código que classifica o TIPO de produto (não a operação, o próprio item), usado para definir alíquotas de impostos e até questões de comércio exterior — o mesmo produto sempre usa o mesmo NCM, não importa quem vende.'
          },
          {
            title: 'Onde esses códigos aparecem',
            body: 'Tanto CFOP quanto NCM aparecem dentro do XML da NF-e e são repetidos nos registros de documentos fiscais da EFD Fiscal — por isso um erro de classificação na nota já nasce errado na declaração também.'
          },
          {
            title: 'Por que isso é jargão do dia a dia',
            body: 'Frases como "esse CFOP está errado para uma venda interestadual" ou "o NCM desse produto não bate com a alíquota aplicada" são extremamente comuns em conversas fiscais — entender que um classifica a OPERAÇÃO e o outro o PRODUTO já evita boa parte da confusão.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que o CFOP classifica?',
          choices: [
            { id: 'a', text: 'A natureza da operação registrada numa nota fiscal (venda, compra, transferência, devolução...)' },
            { id: 'b', text: 'O tipo do produto em si' },
            { id: 'c', text: 'O regime tributário da empresa' },
            { id: 'd', text: 'O valor do frete da nota' }
          ],
          answer: 'a',
          explanation: 'CFOP classifica a natureza da operação, não o produto em si.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que o NCM classifica?',
          choices: [
            { id: 'a', text: 'O tipo do produto em si, não a operação' },
            { id: 'b', text: 'A natureza da operação (venda, compra...)' },
            { id: 'c', text: 'O regime tributário da empresa' },
            { id: 'd', text: 'A forma de pagamento da nota' }
          ],
          answer: 'a',
          explanation: 'NCM classifica o produto, complementando o que o CFOP indica sobre a operação.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Por que a apuração de ICMS depende diretamente do CFOP de cada operação?',
          choices: [
            { id: 'a', text: 'Porque o CFOP indica a natureza da operação, o que influencia como o imposto deve ser calculado' },
            { id: 'b', text: 'Porque o CFOP determina o preço de venda do produto' },
            { id: 'c', text: 'Não há relação entre CFOP e apuração de ICMS' },
            { id: 'd', text: 'Porque o CFOP substitui a necessidade de nota fiscal' }
          ],
          answer: 'a',
          explanation: 'A natureza da operação (indicada pelo CFOP) afeta diretamente as regras de apuração do ICMS.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a sigla do código que classifica a natureza da operação de uma nota fiscal:',
          code: 'O ___ classifica a natureza da operação de uma nota fiscal: venda, compra, transferência...',
          accept: ['CFOP', 'cfop'],
          explanation: 'CFOP é o Código Fiscal de Operações e Prestações.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O NCM de um produto muda dependendo de quem vende?',
          choices: [
            { id: 'a', text: 'Não, o mesmo produto sempre usa o mesmo NCM, não importa quem vende' },
            { id: 'b', text: 'Sim, cada vendedor define seu próprio NCM livremente' },
            { id: 'c', text: 'Sim, o NCM muda a cada nota fiscal emitida' },
            { id: 'd', text: 'O NCM só existe para produtos importados' }
          ],
          answer: 'a',
          explanation: 'O NCM é uma classificação do produto em si, independente de quem o vende.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Onde CFOP e NCM aparecem, além da própria nota fiscal?',
          choices: [
            { id: 'a', text: 'Nos registros de documentos fiscais da EFD Fiscal' },
            { id: 'b', text: 'Apenas no contrato social da empresa' },
            { id: 'c', text: 'Somente na ECD' },
            { id: 'd', text: 'Não aparecem em nenhuma declaração do SPED' }
          ],
          answer: 'a',
          explanation: 'CFOP e NCM são repetidos nos registros da EFD Fiscal, vindos da nota fiscal.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que um erro de classificação (CFOP ou NCM) na nota fiscal já nasce problemático na declaração?',
          choices: [
            { id: 'a', text: 'Porque os mesmos códigos são repetidos nos registros da EFD Fiscal, então o erro se propaga' },
            { id: 'b', text: 'Porque a EFD Fiscal corrige automaticamente qualquer erro da nota' },
            { id: 'c', text: 'Não há propagação, cada documento é analisado isoladamente' },
            { id: 'd', text: 'Porque isso invalida automaticamente o CNPJ da empresa' }
          ],
          answer: 'a',
          explanation: 'Como os códigos vêm da nota e se repetem na EFD, um erro se propaga para a declaração.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a sigla do código que classifica o tipo de produto, usado até para definir alíquotas:',
          code: 'A ___ (Nomenclatura Comum do Mercosul) classifica o tipo de produto, usada até para definir alíquotas',
          accept: ['NCM', 'ncm'],
          explanation: 'NCM é a Nomenclatura Comum do Mercosul, código de classificação de produtos.'
        }
      ]
    },
    {
      id: 'sped-08-efd-fiscal',
      title: 'EFD Fiscal (ICMS/IPI)',
      goal: 'Entender o que a EFD Fiscal contém e para quem ela costuma ser obrigatória.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'O que é a EFD Fiscal',
            body: 'Também chamada de "EFD ICMS/IPI", é a declaração que reúne as informações de notas fiscais e a apuração do ICMS e do IPI de uma empresa, período a período.'
          },
          {
            title: 'Quem costuma entregar',
            body: 'De forma geral, contribuintes de ICMS e/ou IPI (empresas que compram e vendem mercadorias, indústrias, entre outras) precisam entregar essa EFD — as regras exatas variam conforme o regime tributário e a legislação de cada estado.'
          },
          {
            title: 'Periodicidade',
            body: 'Diferente da ECD/ECF (anuais), a EFD Fiscal costuma ser entregue mensalmente, refletindo as operações daquele mês específico.'
          },
          {
            title: 'O que costuma estar dentro dela',
            body: 'Os documentos fiscais (notas de entrada e saída), a apuração do ICMS e do IPI do período, e informações de inventário (estoque) da empresa.'
          },
          {
            title: 'Fiscos que recebem essa informação',
            body: 'Como o ICMS é um imposto estadual, essa EFD é compartilhada com a Secretaria de Fazenda do estado da empresa, além da Receita Federal — por isso "EFD Fiscal" às vezes é chamada, no dia a dia, de "SPED Fiscal".'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que a EFD Fiscal reúne?',
          choices: [
            { id: 'a', text: 'Informações de notas fiscais e a apuração do ICMS e do IPI' },
            { id: 'b', text: 'Só a folha de pagamento dos funcionários' },
            { id: 'c', text: 'Apenas os lançamentos contábeis do Diário' },
            { id: 'd', text: 'Somente o IRPJ e a CSLL' }
          ],
          answer: 'a',
          explanation: 'A EFD Fiscal foca em notas fiscais e na apuração de ICMS/IPI.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'De forma geral, quem costuma ser obrigado a entregar a EFD Fiscal?',
          choices: [
            { id: 'a', text: 'Contribuintes de ICMS e/ou IPI, como empresas comerciais e industriais' },
            { id: 'b', text: 'Apenas pessoas físicas' },
            { id: 'c', text: 'Apenas empresas de outro país' },
            { id: 'd', text: 'Nenhuma empresa, é sempre facultativa' }
          ],
          answer: 'a',
          explanation: 'Contribuintes de ICMS/IPI costumam ter essa obrigação, conforme a legislação.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Com que periodicidade a EFD Fiscal costuma ser entregue?',
          choices: [
            { id: 'a', text: 'Mensalmente' },
            { id: 'b', text: 'Anualmente' },
            { id: 'c', text: 'Só uma vez, na abertura da empresa' },
            { id: 'd', text: 'A cada 5 anos' }
          ],
          answer: 'a',
          explanation: 'A EFD Fiscal costuma ter periodicidade mensal.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o apelido pelo qual a EFD Fiscal também é conhecida no dia a dia:',
          code: 'A EFD Fiscal também é conhecida, no dia a dia, como "SPED ___"',
          accept: ['Fiscal', 'fiscal'],
          explanation: '"SPED Fiscal" é o apelido comum para a EFD ICMS/IPI.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Que tipo de informação de estoque costuma aparecer na EFD Fiscal?',
          choices: [
            { id: 'a', text: 'Informações de inventário da empresa' },
            { id: 'b', text: 'O salário dos funcionários' },
            { id: 'c', text: 'O plano de contas contábil' },
            { id: 'd', text: 'O certificado digital' }
          ],
          answer: 'a',
          explanation: 'Informações de inventário (estoque) costumam constar na EFD Fiscal.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Por que a EFD Fiscal é compartilhada com a Secretaria de Fazenda do estado, além da Receita Federal?',
          choices: [
            { id: 'a', text: 'Porque o ICMS é um imposto estadual' },
            { id: 'b', text: 'Porque toda declaração do SPED é estadual' },
            { id: 'c', text: 'Porque a Receita Federal não participa dessa declaração' },
            { id: 'd', text: 'Por uma exigência sem relação com o tipo de imposto' }
          ],
          answer: 'a',
          explanation: 'Como o ICMS é estadual, o estado também recebe essa informação.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'O que costuma estar dentro da EFD Fiscal, além da apuração de impostos?',
          choices: [
            { id: 'a', text: 'Os documentos fiscais (notas de entrada e saída) do período' },
            { id: 'b', text: 'Apenas o contrato social da empresa' },
            { id: 'c', text: 'Somente dados de funcionários' },
            { id: 'd', text: 'Apenas o balancete contábil' }
          ],
          answer: 'a',
          explanation: 'Documentos fiscais de entrada e saída são parte central da EFD Fiscal.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o outro imposto, além do ICMS, apurado na EFD Fiscal:',
          code: 'A EFD Fiscal reúne a apuração do ICMS e do ___',
          accept: ['IPI', 'ipi'],
          explanation: 'A EFD Fiscal apura tanto o ICMS quanto o IPI.'
        }
      ]
    },
    {
      id: 'sped-09-efd-contribuicoes',
      title: 'EFD Contribuições (PIS/COFINS)',
      goal: 'Entender o que a EFD Contribuições apura e a diferença entre os regimes cumulativo e não-cumulativo.',
      xp: 25,
      intro: {
        slides: [
          {
            title: 'O que é a EFD Contribuições',
            body: 'É a declaração que apura o PIS/Pasep e a COFINS de uma empresa, período a período — duas contribuições federais que incidem sobre a receita.'
          },
          {
            title: 'Regime cumulativo x não-cumulativo',
            body: 'No regime CUMULATIVO, o imposto incide sobre a receita sem direito a créditos; no regime NÃO-CUMULATIVO, a empresa pode descontar créditos (por exemplo, de insumos comprados) do valor apurado — o regime da empresa muda bastante o que precisa ser informado.'
          },
          {
            title: 'Créditos',
            body: 'No regime não-cumulativo, "crédito" é o valor que a empresa pode abater do que seria devido, com base em determinadas compras/despesas previstas em lei — parte importante da apuração dessa EFD.'
          },
          {
            title: 'Periodicidade',
            body: 'Assim como a EFD Fiscal, a EFD Contribuições costuma ser entregue mensalmente.'
          },
          {
            title: 'Relação com as outras declarações',
            body: 'As receitas informadas na EFD Contribuições costumam ter relação direta com as notas fiscais também presentes na EFD Fiscal e com os lançamentos contábeis da ECD — por isso inconsistências entre elas chamam atenção do fisco.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que a EFD Contribuições apura?',
          choices: [
            { id: 'a', text: 'O PIS/Pasep e a COFINS da empresa' },
            { id: 'b', text: 'O ICMS e o IPI' },
            { id: 'c', text: 'O IRPJ e a CSLL' },
            { id: 'd', text: 'O salário dos funcionários' }
          ],
          answer: 'a',
          explanation: 'A EFD Contribuições apura PIS/Pasep e COFINS.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'No regime cumulativo, como o imposto incide?',
          choices: [
            { id: 'a', text: 'Sobre a receita, sem direito a créditos' },
            { id: 'b', text: 'Sobre o lucro líquido, com direito a créditos' },
            { id: 'c', text: 'Sobre o estoque da empresa' },
            { id: 'd', text: 'Sobre o salário dos funcionários' }
          ],
          answer: 'a',
          explanation: 'No regime cumulativo, não há desconto de créditos sobre a receita tributada.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'No regime não-cumulativo, o que a empresa pode fazer?',
          choices: [
            { id: 'a', text: 'Descontar créditos (de insumos, por exemplo) do valor apurado' },
            { id: 'b', text: 'Deixar de entregar a declaração' },
            { id: 'c', text: 'Pagar o dobro do imposto devido' },
            { id: 'd', text: 'Ignorar a apuração de PIS/COFINS' }
          ],
          answer: 'a',
          explanation: 'O regime não-cumulativo permite descontar créditos previstos em lei.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a sigla da contribuição federal apurada junto com o PIS/Pasep:',
          code: 'A EFD Contribuições apura o PIS/Pasep e a ___',
          accept: ['COFINS', 'cofins'],
          explanation: 'COFINS é a outra contribuição apurada nessa EFD, junto ao PIS/Pasep.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que é um "crédito", no contexto do regime não-cumulativo?',
          choices: [
            { id: 'a', text: 'O valor que a empresa pode abater do que seria devido, com base em compras/despesas previstas em lei' },
            { id: 'b', text: 'Um empréstimo bancário da empresa' },
            { id: 'c', text: 'O valor total das vendas do mês' },
            { id: 'd', text: 'Uma multa por atraso na entrega' }
          ],
          answer: 'a',
          explanation: 'Créditos reduzem o valor devido, conforme regras específicas de cada contribuição.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Com que periodicidade a EFD Contribuições costuma ser entregue?',
          choices: [
            { id: 'a', text: 'Mensalmente' },
            { id: 'b', text: 'Anualmente' },
            { id: 'c', text: 'A cada 2 anos' },
            { id: 'd', text: 'Só uma vez na vida da empresa' }
          ],
          answer: 'a',
          explanation: 'Assim como a EFD Fiscal, a EFD Contribuições costuma ser mensal.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que inconsistências entre a EFD Contribuições e a EFD Fiscal/ECD chamam atenção do fisco?',
          choices: [
            { id: 'a', text: 'Porque as receitas informadas costumam ter relação direta com as notas fiscais e os lançamentos contábeis dessas outras declarações' },
            { id: 'b', text: 'Porque essas declarações nunca têm relação entre si' },
            { id: 'c', text: 'Porque o fisco só analisa uma declaração de cada vez, sem cruzamento' },
            { id: 'd', text: 'Não chamam atenção, são declarações totalmente independentes' }
          ],
          answer: 'a',
          explanation: 'As informações se relacionam, e diferenças entre elas são um sinal de possível erro.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o regime em que a empresa pode descontar créditos do valor apurado:',
          code: 'No regime ___, a empresa pode descontar créditos do valor apurado',
          accept: ['não-cumulativo', 'nao-cumulativo', 'não cumulativo', 'nao cumulativo'],
          explanation: 'O regime não-cumulativo permite o desconto de créditos previstos em lei.'
        }
      ]
    },
    {
      id: 'sped-10-cruzamento',
      title: 'Como as declarações se conversam',
      goal: 'Entender por que o fisco consegue cruzar informações entre ECD, ECF, EFD Fiscal e EFD Contribuições.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Nenhuma declaração vive isolada',
            body: 'Embora cada declaração tenha seu próprio leiaute e finalidade, os números que aparecem nelas deveriam "bater" entre si — a mesma nota fiscal, por exemplo, reflete tanto na EFD Fiscal quanto, eventualmente, na receita da EFD Contribuições e nos lançamentos da ECD.'
          },
          {
            title: 'Um exemplo de cruzamento',
            body: 'Se o total de receitas informado na EFD Contribuições for muito diferente do total de vendas que aparece na EFD Fiscal (ou dos lançamentos contábeis da ECD), isso é um sinal de alerta para o fisco investigar.'
          },
          {
            title: 'Malha fiscal',
            body: 'O termo "malha fiscal" se refere justamente a esse processo de cruzamento automático de informações entre declarações — cair na malha significa que alguma inconsistência foi detectada e precisa ser explicada ou corrigida.'
          },
          {
            title: 'ECD/ECF como o "resumo contábil-fiscal" do ano',
            body: 'Enquanto as EFDs (Fiscal e Contribuições) detalham operações mês a mês, a ECD e a ECF fecham o ano, consolidando tudo numa visão contábil e fiscal anual — outra camada de cruzamento possível.'
          },
          {
            title: 'Por que entender isso ajuda no dia a dia',
            body: 'Saber que as declarações "conversam" entre si ajuda a entender por que um erro aparentemente pequeno numa delas (uma nota classificada errado, por exemplo) pode gerar questionamento em outra, meses depois.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Por que os números de diferentes declarações do SPED deveriam "bater" entre si?',
          choices: [
            { id: 'a', text: 'Porque a mesma operação (como uma nota fiscal) pode refletir em mais de uma declaração' },
            { id: 'b', text: 'Porque todas as declarações contêm exatamente os mesmos campos' },
            { id: 'c', text: 'Não deveriam bater, cada declaração é totalmente independente' },
            { id: 'd', text: 'Porque são preenchidas pela mesma pessoa sempre' }
          ],
          answer: 'a',
          explanation: 'Uma mesma operação real pode aparecer refletida em várias declarações diferentes.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que significa "cair na malha fiscal"?',
          choices: [
            { id: 'a', text: 'Uma inconsistência entre declarações foi detectada pelo cruzamento automático de informações' },
            { id: 'b', text: 'A empresa deixou de existir oficialmente' },
            { id: 'c', text: 'A declaração foi entregue antes do prazo' },
            { id: 'd', text: 'O certificado digital da empresa expirou' }
          ],
          answer: 'a',
          explanation: 'Malha fiscal é o processo de cruzamento que detecta inconsistências entre declarações.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que a ECD/ECF representam, em relação às EFDs mensais?',
          choices: [
            { id: 'a', text: 'Um fechamento anual, consolidando numa visão contábil e fiscal o que as EFDs detalharam mês a mês' },
            { id: 'b', text: 'Não têm nenhuma relação com as EFDs' },
            { id: 'c', text: 'São entregues antes de qualquer EFD mensal' },
            { id: 'd', text: 'Substituem completamente as EFDs mensais' }
          ],
          answer: 'a',
          explanation: 'ECD e ECF consolidam anualmente o que as EFDs já detalharam mensalmente.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a expressão usada quando uma inconsistência entre declarações é detectada pelo fisco:',
          code: 'Quando uma inconsistência entre declarações é detectada pelo fisco, dizemos que a empresa "caiu na ___ fiscal"',
          accept: ['malha'],
          explanation: '"Cair na malha fiscal" é a expressão usada para esse tipo de inconsistência detectada.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Qual seria um exemplo de sinal de alerta para o fisco, num cruzamento entre declarações?',
          choices: [
            { id: 'a', text: 'O total de receitas da EFD Contribuições muito diferente do total de vendas da EFD Fiscal' },
            { id: 'b', text: 'Duas declarações entregues no mesmo dia' },
            { id: 'c', text: 'Um arquivo gerado no formato .txt' },
            { id: 'd', text: 'Um recibo de entrega emitido corretamente' }
          ],
          answer: 'a',
          explanation: 'Divergências de valores entre declarações relacionadas costumam disparar alertas.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Por que um erro pequeno numa declaração pode gerar questionamento meses depois, em outra?',
          choices: [
            { id: 'a', text: 'Porque as declarações se relacionam, e uma inconsistência pode só ser percebida no cruzamento entre elas' },
            { id: 'b', text: 'Porque o fisco sempre demora anos para analisar qualquer declaração' },
            { id: 'c', text: 'Porque erros pequenos nunca têm consequência real' },
            { id: 'd', text: 'Porque cada declaração é analisada de forma totalmente isolada, sem cruzamento' }
          ],
          answer: 'a',
          explanation: 'O cruzamento entre declarações relacionadas pode revelar um erro só depois de um tempo.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual a vantagem, para o fisco, de todas as declarações seguirem leiautes padronizados?',
          choices: [
            { id: 'a', text: 'Facilita o cruzamento automático de informações entre diferentes empresas e declarações' },
            { id: 'b', text: 'Nenhuma vantagem real, é só uma formalidade' },
            { id: 'c', text: 'Serve apenas para facilitar a vida das empresas, sem benefício para o fisco' },
            { id: 'd', text: 'Reduz o valor do imposto devido pelas empresas' }
          ],
          answer: 'a',
          explanation: 'Leiautes padronizados são o que viabiliza o cruzamento automatizado em larga escala.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a declaração cuja receita costuma refletir a mesma nota fiscal presente na EFD Fiscal:',
          code: 'A mesma nota fiscal pode refletir tanto na EFD Fiscal quanto na receita da EFD ___',
          accept: ['Contribuições', 'contribuições'],
          explanation: 'A receita informada na EFD Contribuições costuma se relacionar com as notas da EFD Fiscal.'
        }
      ]
    }
  ]
};
