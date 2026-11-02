// Módulo "Fundamentos" do curso de Computação Distribuída — lições de nível iniciante, 8 questões
// cada (3 múltipla escolha + 1 lacuna, duas vezes por lição). Ver ../../index.js para o formato e a
// validação de boot. Parte A do módulo: o que é um sistema distribuído, falácias, conceitos,
// arquiteturas, comunicação, modelos de falha, desempenho, disponibilidade, replicação,
// particionamento, balanceamento, cache, tempo, consistência e CAP. Mesmo padrão dos outros módulos.
// Helpers locais: mcq recebe a letra da resposta correta e as 4 alternativas na ordem a, b, c, d
// (posição da certa escolhida à mão e variada); fill recebe prompt, código com a lacuna ___ e as
// respostas aceitas (a 1ª é a canônica); sl() monta um slide (code opcional).
// Precisão: só conceitos estáveis — nenhum número de benchmark, versão ou preço; "exactly-once" nunca
// é tratado como garantia absoluta; a "consistência" do CAP não é a do ACID.
// Segurança e privacidade (LGPD): rede nunca é segura por padrão (TLS, autenticação), cache e réplicas
// multiplicam cópias de dados pessoais (minimização, retenção, criptografia) e nenhum exemplo usa
// dado pessoal real (nomes e valores fictícios).
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
  id: 'fundamentos-distribuida',
  levelKey: 'beginner',
  order: 1,
  title: 'Fundamentos',
  subtitle: 'Falácias, falhas parciais, arquiteturas, comunicação, replicação, sharding, cache, tempo, consistência e CAP',
  accent: '#14b8a6',
  lessons: [
    {
      id: 'cdb-01-o-que-e-sistema-distribuido',
      title: 'O que é um sistema distribuído',
      goal: 'Definir sistema distribuído, saber por que distribuir, diferenciar de paralelo e concorrente e entender o custo e a transparência.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'A definição',
            'Um sistema distribuído é um conjunto de computadores independentes (cada um com sua memória, seu relógio e suas falhas) que cooperam trocando mensagens pela rede e, para quem usa, parecem um sistema único. Repare nas duas metades: por dentro são várias máquinas separadas; por fora, o usuário digita uma busca e recebe a resposta sem saber quantos computadores trabalharam. Uma só máquina com vários núcleos NÃO é isso: ali a memória é compartilhada e tudo falha junto.',
            'usuário --> [ app ] --> [ banco ]\n               |--> [ cache ]\n               |--> [ serviço de e-mail ]\n(4 máquinas por trás, 1 "sistema" na visão do usuário)'
          ),
          sl(
            'Por que distribuir: escala e disponibilidade',
            'Escala: um computador tem limite de CPU, memória e disco; com várias máquinas, o trabalho e os dados são divididos e o sistema cresce acrescentando nós. Disponibilidade: se existe mais de uma máquina capaz de atender, a queda de uma não precisa derrubar o serviço. Os dois motivos aparecem juntos em quase todo sistema grande, mas são objetivos diferentes: escalar é suportar mais carga; disponibilidade é continuar de pé quando algo quebra.'
          ),
          sl(
            'Por que distribuir: latência, custo e isolamento',
            'Latência/geografia: a luz leva tempo para cruzar oceanos, então colocar cópias do serviço perto dos usuários reduz o atraso. Custo: muitas máquinas comuns costumam sair mais baratas do que uma única máquina gigante e especial, e o limite da máquina gigante existe. Isolamento de falhas: se cada parte roda separada, um defeito (ou um ataque) numa parte tende a ficar contido, sem derrubar o restante. Cada motivo vem com um preço, como veremos.'
          ),
          sl(
            'Exemplos do cotidiano',
            'Busca na web: sua consulta é dividida entre muitas máquinas que guardam partes do índice. Streaming de vídeo: o conteúdo fica copiado em servidores espalhados, e você recebe de um perto de você. Pagamentos: banco, adquirente e loja são sistemas separados que precisam concordar sobre o mesmo valor. Mensageria: o aplicativo de conversa entrega sua mensagem pela rede a outro aparelho, mesmo que ele esteja offline agora. Em todos, a "mágica" é esconder a complexidade da cooperação.'
          ),
          sl(
            'Distribuído, paralelo e concorrente',
            'Concorrente: várias tarefas progredindo em intervalos sobrepostos, mesmo que seja num único núcleo alternando entre elas (é sobre estrutura e coordenação). Paralelo: várias tarefas rodando literalmente ao mesmo tempo em vários núcleos, para terminar mais rápido (é sobre velocidade). Distribuído: várias máquinas independentes, sem memória compartilhada, que se comunicam por mensagens e podem falhar separadamente (é sobre cooperar apesar de separação e falhas). Os três se misturam: um sistema distribuído tem partes concorrentes e paralelas, mas a marca dele é a falha parcial e a rede entre os nós.',
            'concorrente : 1 cozinheiro alternando 3 panelas\nparalelo    : 3 cozinheiros, 1 panela cada, ao mesmo tempo\ndistribuído : 3 cozinhas em cidades diferentes, combinando por telefone'
          ),
          sl(
            'O custo: complexidade',
            'Distribuir não é de graça. Aparecem a rede (que atrasa, perde e duplica mensagens), as falhas parciais (uma máquina cai e as outras continuam), a dificuldade de manter dados em acordo, de depurar (o erro está em qual máquina?) e de operar mais coisas. Por isso a regra de ouro é: não distribua sem motivo. Se uma máquina resolve com folga, ela é mais simples, mais fácil de entender e menos sujeita a surpresas.'
          ),
          sl(
            'Transparência como objetivo',
            'Transparência é esconder do usuário (e do programador) a distribuição. Transparência de acesso: usar um recurso local ou remoto do mesmo jeito. De localização: o usuário não precisa saber em qual máquina ou país o dado está. De falha: o sistema esconde que uma peça quebrou, por exemplo trocando para outra cópia sem o usuário notar. É um objetivo, nunca perfeito: a rede e as falhas vazam em forma de lentidão e erros, e tentar esconder tudo pode até ser enganoso.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual definição descreve melhor um sistema distribuído?', 'b', [
          'Um programa com várias threads rodando na mesma memória de um só computador',
          'Computadores independentes que cooperam por mensagens e parecem um sistema único ao usuário',
          'Qualquer sistema que usa a internet para baixar arquivos de servidores que ficam em outros lugares',
          'Um servidor muito potente atendendo todos os clientes sozinho, sem ajuda'
        ], 'Os nós são independentes, comunicam-se por mensagens e a cooperação fica escondida atrás de uma interface única.'),
        mcq('q2', 'Um serviço usa três servidores iguais atrás de um balanceador; um deles cai e os usuários continuam atendidos. Qual motivo para distribuir isso exemplifica?', 'd', [
          'Reduzir a latência geográfica para usuários de outros países',
          'Diminuir a complexidade de operar e depurar o sistema todo',
          'Diminuir o número de máquinas para economizar com energia',
          'Disponibilidade: sobram outras máquinas para atender'
        ], 'Redundância permite que a queda de um nó não derrube o serviço: é o ganho de disponibilidade.'),
        mcq('q3', 'Qual afirmação diferencia corretamente computação paralela de distribuída?', 'a', [
          'Paralela busca velocidade com vários núcleos; distribuída tem máquinas independentes com falhas separadas',
          'Paralela exige internet para funcionar e várias máquinas; distribuída roda sempre em um único computador, sem rede',
          'Paralela e distribuída são sinônimos perfeitos, só mudam de nome entre autores diferentes',
          'Paralela implica várias máquinas separadas e sem memória comum; distribuída implica uma thread só'
        ], 'Paralelo é sobre velocidade com recursos juntos; distribuído é sobre cooperação com separação, rede e falhas parciais.'),
        fill('q4', 'Qual é o nome da computação em que várias tarefas rodam literalmente ao mesmo tempo, em vários núcleos, para terminar mais rápido?', 'computação ___ (várias tarefas simultâneas em vários núcleos)', ['paralela', 'paralelo', 'computação paralela', 'processamento paralelo'], 'Paralelismo é executar de fato ao mesmo tempo; concorrência é só ter tarefas com execução sobreposta.'),
        mcq('q5', 'Qual é o principal custo de transformar um sistema simples em distribuído?', 'c', [
          'O código deixa de poder usar variáveis comuns',
          'Os dados passam a ser sempre perdidos pela rede, sem exceção alguma',
          'Surge complexidade: rede imperfeita, falhas parciais e depuração difícil',
          'O sistema nunca mais consegue escalar depois de ser distribuído'
        ], 'A rede e as falhas parciais trazem problemas novos; por isso não se distribui sem motivo.'),
        mcq('q6', 'Um usuário acessa um arquivo e nem precisa saber em qual país ou servidor ele está guardado. Que tipo de transparência é essa?', 'a', [
          'Transparência de localização',
          'Transparência de falha',
          'Transparência de acesso',
          'Transparência de custo'
        ], 'Localização: o recurso é usado pelo nome, sem expor onde ele fisicamente está.'),
        mcq('q7', 'Uma empresa coloca cópias do serviço em vários continentes para que cada usuário fale com o mais próximo. Qual é o ganho principal?', 'd', [
          'Eliminar qualquer chance de falha de rede entre os usuários e o serviço mais próximo',
          'Garantir que todos vejam sempre os mesmos dados exatos no mesmo instante',
          'Evitar a necessidade de qualquer comunicação entre as cópias do serviço',
          'Menor latência, pois a distância até o usuário diminui'
        ], 'A distância gera atraso inevitável; aproximar o serviço do usuário reduz a latência. Manter as cópias em acordo é outro problema.'),
        fill('q8', 'Esconder do usuário o fato de que existem várias máquinas, tratando recursos locais e remotos da mesma forma, é o objetivo chamado de ___ (de acesso, de localização e de falha).', 'objetivo: ___', ['transparência', 'transparencia'], 'Transparência é o objetivo de ocultar a distribuição; nunca é perfeita, pois falhas e latência vazam.')
      ]
    },
    {
      id: 'cdb-02-falacias-computacao-distribuida',
      title: 'As falácias da computação distribuída',
      goal: 'Reconhecer as oito suposições falsas que quebram sistemas distribuídos e saber como se defender de cada uma.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que são as falácias',
            'No início dos anos 1990, engenheiros listaram suposições que programadores iniciantes em redes costumam fazer e que são FALSAS. Elas ficaram conhecidas como as oito falácias da computação distribuída. Quem as assume escreve código que funciona no notebook e quebra em produção. Vamos ver cada uma: o que ela diz, por que é falsa e o que fazer.',
            '1. A rede é confiável\n2. A latência é zero\n3. A banda é infinita\n4. A rede é segura\n5. A topologia não muda\n6. Existe um único administrador\n7. O custo de transporte é zero\n8. A rede é homogênea'
          ),
          sl(
            'Falácias 1 e 2: confiável e latência zero',
            'Rede confiável: pacotes se perdem, conexões caem, o outro lado pode ter morrido. Defesa: timeouts, novas tentativas (com cuidado, veja idempotência), tratar erro de rede como caso normal. Bug típico: chamar um serviço sem timeout e a thread ficar pendurada para sempre. Latência zero: toda chamada remota leva tempo, milhares de vezes mais que uma chamada local. Defesa: reduzir o número de idas e voltas, agrupar chamadas em lote. Bug típico: um laço que faz uma requisição remota por item de uma lista de mil itens.',
            '# ruim: 1000 idas e voltas\nfor id in ids:\n    usuario = servico.buscar(id)\n# melhor: 1 ida e volta\nusuarios = servico.buscar_varios(ids)'
          ),
          sl(
            'Falácias 3 e 7: banda infinita e custo de transporte zero',
            'Banda infinita: a rede tem capacidade limitada, e mandar objetos enormes entope o canal. Defesa: enviar só o necessário, paginar, comprimir. Bug típico: devolver a tabela inteira quando o cliente precisava de 10 linhas. Custo de transporte zero: transportar dados custa tempo de CPU (serializar e desserializar), dinheiro (tráfego entre regiões costuma ser cobrado) e energia. Defesa: levar o processamento até onde os dados estão, medir o que trafega. Bug típico: uma consulta que traz milhões de linhas só para somar uma coluna no cliente.'
          ),
          sl(
            'Falácia 4: a rede é segura',
            'Tudo que passa pela rede pode ser lido, alterado ou falsificado por quem estiver no caminho, e até a rede interna da empresa pode ter intrusos. Defesa: criptografar o tráfego (TLS), autenticar quem chama e quem responde, autorizar com o mínimo de privilégio, não confiar em um serviço só porque ele está na mesma rede. Isso é também exigência de privacidade: dado pessoal trafegando em texto puro entre serviços é um vazamento esperando acontecer (a LGPD pede medidas de segurança proporcionais). Bug típico: serviços internos conversando em HTTP sem criptografia e sem autenticação "porque é rede interna".'
          ),
          sl(
            'Falácias 5 e 6: topologia e administrador',
            'Topologia não muda: máquinas entram, saem, trocam de endereço; contêineres são recriados com outro IP; rotas mudam. Defesa: nunca fixar IPs no código, usar nomes e descoberta de serviço, aceitar que o endereço de hoje pode não valer amanhã. Único administrador: o sistema atravessa redes, nuvens e equipes diferentes, cada uma com suas regras de firewall, janelas de manutenção e versões. Defesa: contratos claros entre as partes, versionamento, monitoramento e comunicação, e projetar para que a atualização de uma parte não exija atualizar todas ao mesmo tempo.'
          ),
          sl(
            'Falácia 8: a rede é homogênea',
            'Os nós diferem em sistema operacional, hardware, versão de software, formato de dados e protocolos. Uma máquina é rápida, outra lenta; uma é 64 bits e a outra não. Defesa: usar formatos e protocolos abertos e padronizados entre os nós (JSON, Protobuf, HTTP) em vez de depender de detalhes de uma plataforma, e testar com diversidade real. Bug típico: enviar um objeto no formato interno de uma linguagem e descobrir que o outro serviço, escrito em outra, não consegue ler.'
          ),
          sl(
            'Como usar as falácias no dia a dia',
            'Toda vez que você escrever uma chamada remota, pergunte: e se ela falhar? e se demorar? e se vier duplicada? e se alguém interceptar? e se o endereço mudar? Programe assumindo o oposto de cada falácia: timeouts, novas tentativas seguras, lotes, dados mínimos, TLS e autenticação, descoberta de serviço e formatos padronizados. Não é pessimismo: é a diferença entre um sistema que parece funcionar e um que realmente funciona.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um serviço chama outro por HTTP sem timeout. O serviço remoto trava e o chamador fica esperando para sempre. Qual falácia foi assumida?', 'c', [
          'A rede é segura',
          'Existe um único administrador',
          'A rede é confiável',
          'A rede é homogênea'
        ], 'Assumir que a resposta sempre chega ignora a falha da rede ou do outro nó. Defesa: timeouts e tratamento de erro.'),
        mcq('q2', 'Um laço faz uma requisição remota para cada um dos mil itens de uma lista, e a tela fica lenta. Qual falácia explica o problema e qual a correção?', 'a', [
          'Latência zero: buscar os itens em lote',
          'Banda infinita: aumentar o tamanho de cada requisição para enviar mais por vez',
          'Topologia estável: fixar o IP do servidor no código para evitar buscas',
          'Rede segura: criptografar cada item separadamente antes de enviá-lo'
        ], 'Cada chamada paga a latência da rede; mil chamadas somam. Agrupar em uma chamada reduz o custo.'),
        mcq('q3', 'Serviços internos trocam dados de clientes em HTTP puro, sem autenticação, porque estão na rede interna. O que está errado?', 'b', [
          'Nada de errado: redes internas nunca são alvo de intrusos nem de espionagem, então não precisam de TLS',
          'Rede segura é falácia: é preciso criptografar (TLS) e autenticar; dado pessoal exposto é risco',
          'O problema é só a latência, que sobe muito quando se usa criptografia em tudo',
          'O problema é a banda, que fica infinita quando não se usa nenhuma criptografia'
        ], 'Quem está no caminho pode ler e alterar o tráfego. Segurança entre serviços é requisito, inclusive pela proteção de dados pessoais.'),
        fill('q4', 'Quantas são as falácias clássicas da computação distribuída que estudamos nesta lição?', 'quantidade de falácias: ___', ['8', 'oito'], 'São oito: confiável, latência zero, banda infinita, segura, topologia fixa, único administrador, custo de transporte zero e homogênea.'),
        mcq('q5', 'Uma equipe escreve o IP de um servidor direto no código. Semanas depois o contêiner é recriado com outro IP e tudo para. Qual falácia e qual defesa?', 'd', [
          'A rede é homogênea; usar o mesmo sistema operacional em todos os nós sem exceção',
          'A banda é infinita; comprimir os dados enviados ao servidor',
          'A latência é zero; colocar um timeout bem curto nas chamadas',
          'Topologia muda; usar nomes e descoberta de serviço, não IPs fixos'
        ], 'Nós entram, saem e trocam de endereço. Nomes e descoberta de serviço absorvem essa mudança.'),
        mcq('q6', 'Uma consulta traz milhões de linhas ao cliente só para somar uma coluna. Que falácias isso viola e qual a melhoria?', 'b', [
          'Rede confiável; repetir a mesma consulta várias vezes até que ela funcione',
          'Banda infinita e custo de transporte zero; calcular onde estão os dados',
          'Rede segura; esconder as linhas com criptografia forte durante o transporte',
          'Administrador único; pedir permissão a quem administra o servidor'
        ], 'Transportar dados custa tempo, banda e dinheiro. Levar o processamento ao dado evita o tráfego inútil.'),
        mcq('q7', 'Dois serviços, de equipes diferentes, precisam ser atualizados exatamente no mesmo instante ou quebram. Qual falácia essa dependência ignora e qual a defesa?', 'c', [
          'Rede confiável; adicionar novas tentativas automáticas a cada chamada falha',
          'Latência zero; mover os dois serviços para o mesmo datacenter de uma vez',
          'Único administrador; versionar contratos para evolução independente',
          'Rede segura; trocar as senhas dos dois serviços logo depois de cada versão'
        ], 'Há vários donos, janelas e versões. Contratos versionados permitem atualizar uma parte sem sincronizar todas.'),
        fill('q8', 'Dois serviços escritos em linguagens diferentes adotam um formato padrão e aberto, como o JSON, em vez do formato interno de uma linguagem. Isso é defesa contra a falácia de que a rede é ___.', 'a rede é ___ (todos os nós iguais)', ['homogênea', 'homogenea'], 'Nós diferem em plataforma, linguagem e versão; formatos abertos evitam depender de uma plataforma.')
      ]
    },
    {
      id: 'cdb-03-conceitos-fundamentais',
      title: 'Conceitos fundamentais',
      goal: 'Entender nós, mensagens, falhas parciais, não-determinismo e a impossibilidade de saber se o outro lado falhou ou está lento.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Nós, processos e mensagens',
            'Um nó é uma unidade que executa código e guarda estado: em geral um processo rodando em uma máquina (às vezes em um contêiner). Os nós não enxergam a memória uns dos outros: tudo que sabem do mundo externo chega por mensagens enviadas pela rede. Uma mensagem pode ser um pedido, uma resposta, um aviso de evento. Pensar em "nós trocando mensagens" é o modelo mental básico da área.',
            'nó A ----- mensagem ----> nó B\nnó A <---- mensagem ----- nó B\n(cada nó tem memória, disco e relógio próprios)'
          ),
          sl(
            'Estado local vs compartilhado',
            'Estado local é o dado guardado em um nó e acessível só por ele. Estado compartilhado é um dado que vários nós precisam ver. Em um computador único, "compartilhar" é ler a mesma variável. Em um sistema distribuído, compartilhar significa copiar o dado, enviar mensagens e manter cópias em acordo, o que é difícil. Por isso a regra de projeto é: quanto menos estado compartilhado, mais simples e escalável o sistema.'
          ),
          sl(
            'Mensagens vs memória compartilhada',
            'Há dois modelos de comunicação. Memória compartilhada: vários fluxos leem e escrevem as mesmas posições de memória (threads de um processo), rápido, mas só funciona na mesma máquina e exige travas. Troca de mensagens: cada fluxo tem seu estado privado e a comunicação é explícita por envio e recebimento; funciona entre máquinas, mas as mensagens podem atrasar, sumir ou chegar fora de ordem. Em sistemas distribuídos o modelo disponível é a troca de mensagens.'
          ),
          sl(
            'Falhas parciais: a grande diferença',
            'Em um único computador, em geral ou tudo funciona ou tudo para (se o processo morre, morre por inteiro). Em um sistema distribuído, uma parte pode falhar enquanto o resto segue vivo: um nó cai, um link some, uma resposta se perde. Isso se chama falha parcial. Como as partes continuam rodando, o sistema precisa decidir o que fazer com uma operação que ficou pela metade, e nem sempre sabe em que ponto ela parou. É a principal fonte de complexidade da área.',
            'cliente --> A --> B --> C (cai aqui)\nA e B continuam vivos e o pedido ficou pela metade'
          ),
          sl(
            'Não-determinismo e a ausência de relógio e estado globais',
            'Não-determinismo: a mesma execução pode produzir resultados diferentes porque o tempo e a ordem de chegada das mensagens variam. Duas mensagens enviadas em sequência podem chegar em ordem trocada. Além disso, não há relógio global confiável (cada máquina tem o seu, levemente diferente) nem uma forma de tirar uma "foto" instantânea do estado de todos os nós ao mesmo tempo: quando você observa um nó, os outros já mudaram. Cada nó tem apenas uma visão parcial e possivelmente desatualizada.'
          ),
          sl(
            'Falhou ou está só lento?',
            'Você envia um pedido e não recebe resposta. Pode ser: o pedido se perdeu, o outro nó caiu, o nó está lento ou sobrecarregado, ou ele respondeu e a resposta se perdeu. Do seu lado todas essas situações parecem iguais: silêncio. Você nunca consegue ter certeza de que o outro lado falhou; só pode decidir esperar mais ou assumir que falhou, por meio de um timeout. Essa incerteza é o coração dos problemas de sistemas distribuídos e motiva idempotência, detectores de falha e protocolos de acordo.',
            'enviar(pedido)\naguardar(timeout=2s)\n# sem resposta: perdeu? caiu? lento? executou e a resposta sumiu?'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a principal diferença entre os modos de falha de um computador único e de um sistema distribuído?', 'd', [
          'No computador único as falhas nunca acontecem',
          'No sistema distribuído todos os nós sempre falham juntos, no mesmo instante',
          'No computador único as falhas são sempre silenciosas e nunca geram erro algum',
          'No sistema distribuído partes falham e o resto segue funcionando'
        ], 'É a falha parcial: algo quebra e o resto segue vivo, deixando operações pela metade.'),
        mcq('q2', 'O nó A enviou um pedido ao nó B e não recebeu resposta dentro do timeout. O que A pode concluir com certeza?', 'a', [
          'Nada definitivo: B pode ter caído, estar lento ou ter respondido e a resposta se perdeu',
          'Que B caiu e precisa ser reiniciado pela equipe de operação agora',
          'Que o pedido foi executado com sucesso por B, mesmo sem nenhuma resposta ter chegado de volta',
          'Que a rede inteira está fora do ar neste momento'
        ], 'O silêncio é ambíguo. Só se pode decidir assumir a falha após o timeout, sem certeza.'),
        mcq('q3', 'Como dois processos em máquinas diferentes compartilham informação?', 'c', [
          'Lendo a mesma variável na memória de cada um dos processos, como em threads',
          'Usando o relógio global do sistema inteiro para sincronizar os valores',
          'Trocando mensagens pela rede, copiando o dado entre nós',
          'Consultando uma foto instantânea do estado de todos os nós'
        ], 'Não há memória compartilhada entre máquinas; tudo é por mensagens e cópias.'),
        fill('q4', 'Quando uma parte do sistema falha e o resto continua funcionando, dizemos que ocorreu uma falha ___.', 'falha ___', ['parcial', 'falha parcial'], 'Falha parcial é a característica que mais diferencia um sistema distribuído de um único computador.'),
        mcq('q5', 'Dois nós enviam mensagens a um terceiro, e ele as recebe numa ordem inesperada. Qual conceito explica isso?', 'b', [
          'Determinismo da rede, que fixa a ordem das mensagens e o atraso de todas elas',
          'Não-determinismo: atraso e ordem de chegada variam',
          'Transparência de acesso aos recursos remotos, escondendo o uso da rede',
          'Estado compartilhado forte entre os nós, mantido sempre idêntico'
        ], 'A rede não garante ordem nem tempo fixos; o resultado pode mudar de uma execução para outra.'),
        mcq('q6', 'Por que não existe um "estado global" que se possa observar de uma vez?', 'd', [
          'Porque os nós não guardam nenhum estado local, apenas repassam as mensagens',
          'Porque as mensagens nunca chegam ao destino, então ninguém sabe de nada',
          'Porque a rede é sempre infinitamente rápida e confiável em qualquer situação, então isso é só uma limitação do hardware',
          'Porque não há como capturar todos os nós ao mesmo tempo: os outros mudam enquanto lemos um'
        ], 'Cada nó só tem visão parcial e possivelmente atrasada; não existe foto instantânea do sistema todo.'),
        mcq('q7', 'Qual estratégia de projeto torna um sistema distribuído mais simples e escalável, segundo a lição?', 'a', [
          'Reduzir a quantidade de estado compartilhado entre os nós',
          'Copiar todo o estado em todos os nós e mantê-lo sempre idêntico',
          'Fazer todos os nós dependerem do mesmo relógio global',
          'Evitar completamente o uso de mensagens entre os nós'
        ], 'Estado compartilhado exige coordenação e cópias em acordo; quanto menos houver, menos coordenação.'),
        fill('q8', 'Em sistemas distribuídos, a comunicação entre nós é feita por troca de ___, porque não há memória compartilhada entre máquinas.', 'troca de ___', ['mensagens', 'mensagem', 'troca de mensagens'], 'Troca de mensagens é o modelo básico; ela pode atrasar, perder e reordenar.')
      ]
    },
    {
      id: 'cdb-04-arquiteturas',
      title: 'Arquiteturas de sistemas distribuídos',
      goal: 'Conhecer as arquiteturas mais comuns, seus trade-offs e quando cada uma faz sentido.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Cliente-servidor e multicamadas',
            'Cliente-servidor: o cliente pede, o servidor responde e guarda os recursos (um navegador e um site). É simples de entender e de proteger, mas o servidor é um ponto central: se cai ou satura, todos sofrem. Multicamadas separa o servidor em camadas com papéis distintos, tipicamente apresentação (interface), lógica de negócio e dados (banco). Cada camada pode ser escalada e trocada separadamente, ao custo de mais saltos de rede entre elas.',
            'navegador --> [ camada web ] --> [ lógica ] --> [ banco ]\n   cliente        apresentação     negócio       dados'
          ),
          sl(
            'Peer-to-peer (P2P)',
            'No P2P não existe um servidor central: cada nó (par) é ao mesmo tempo cliente e servidor, oferecendo e consumindo recursos. Compartilhamento de arquivos por torrent é o exemplo clássico. Vantagens: não há ponto único de falha e a capacidade cresce com a chegada de novos pares. Desvantagens: achar recursos e coordenar é mais difícil, a confiança entre pares é frágil (qualquer um pode ser mal-intencionado) e é mais difícil garantir consistência e controle.'
          ),
          sl(
            'Líder-seguidor (mestre-escravo)',
            'Um nó, o líder (também chamado primário ou mestre), recebe as decisões ou escritas e os demais, os seguidores (réplicas, antes chamados de escravos), copiam o que o líder faz. Simplifica a ordem das operações: só uma fonte decide. Em contrapartida o líder é um gargalo e um ponto sensível: se cai, é preciso eleger ou promover outro. Aparece em bancos de dados replicados, em filas e em sistemas de coordenação. Os termos "mestre" e "escravo" são antigos; hoje se prefere líder, primário, seguidor e réplica.'
          ),
          sl(
            'Broker de mensagens e arquitetura orientada a eventos',
            'Um broker (intermediário) recebe mensagens de produtores e as entrega a consumidores, mantendo-as numa fila ou num tópico. Produtor e consumidor não precisam estar ligados ao mesmo tempo nem se conhecer: isso é desacoplamento, que absorve picos e falhas temporárias. Na arquitetura orientada a eventos, partes do sistema publicam eventos ("pedido criado") e outras reagem a eles. Ganho: flexibilidade e independência. Custo: fluxo mais difícil de seguir e depurar, e a resposta deixa de ser imediata.',
            'produtor --> [ broker: fila ] --> consumidor 1\n                         \\--> consumidor 2'
          ),
          sl(
            'Microsserviços e o monolito distribuído',
            'Microsserviços dividem a aplicação em serviços pequenos, cada um com uma responsabilidade e, idealmente, seu próprio dado, que evoluem e escalam de forma independente e conversam pela rede. Ganha-se autonomia de equipes e escala seletiva; paga-se com todos os custos da distribuição. O antipadrão é o monolito distribuído: serviços separados na rede, mas tão acoplados (compartilham o mesmo banco, precisam ser implantados juntos, chamam-se em cadeia) que juntam os problemas dos dois mundos sem nenhuma vantagem de nenhum.'
          ),
          sl(
            'Escolhendo: trade-offs',
            'Não há arquitetura melhor em abstrato; cada uma troca simplicidade por escala, autonomia ou resiliência. Comece pelo mais simples que atende (muitas vezes cliente-servidor com um monolito bem organizado) e distribua quando a necessidade aparecer: carga que não cabe, requisito de disponibilidade, equipes grandes que se atrapalham. Pergunte sempre: que problema real esta arquitetura resolve para mim, e que complexidade nova ela traz?'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual arquitetura NÃO tem servidor central, com cada nó atuando como cliente e servidor ao mesmo tempo?', 'a', [
          'Peer-to-peer',
          'Cliente-servidor',
          'Multicamadas',
          'Líder-seguidor'
        ], 'No P2P os pares oferecem e consomem recursos; não há ponto central obrigatório.'),
        mcq('q2', 'Em uma arquitetura líder-seguidor, o líder cai. Qual é a consequência imediata?', 'c', [
          'Os seguidores passam a aceitar escritas de todos os clientes automaticamente, sem nenhuma votação entre eles',
          'O sistema continua igual, pois os seguidores não dependem do líder',
          'É preciso promover ou eleger um novo líder para voltar a aceitar escritas',
          'Todos os dados são apagados dos seguidores'
        ], 'O líder é a fonte única de decisões; sem ele, outro precisa assumir o papel.'),
        mcq('q3', 'Qual benefício principal um broker de mensagens traz entre produtor e consumidor?', 'd', [
          'Garante que as mensagens nunca atrasem',
          'Obriga produtor e consumidor a rodarem ao mesmo tempo e a manterem uma conexão direta aberta',
          'Elimina a necessidade de formatar as mensagens',
          'Desacoplamento: ambos não precisam se conhecer nem estar ativos juntos'
        ], 'A fila intermediária absorve picos e falhas temporárias e separa os dois lados.'),
        fill('q4', 'Qual é o nome do antipadrão em que serviços separados na rede continuam tão acoplados que juntam os problemas do monolito e da distribuição?', 'monolito ___', ['distribuído', 'distribuido', 'monolito distribuído', 'monolito distribuido'], 'Monolito distribuído: separação só na rede, sem independência real, pior dos dois mundos.'),
        mcq('q5', 'Qual dessas características descreve a arquitetura multicamadas?', 'b', [
          'Todos os nós têm papel idêntico e nenhuma camada separada',
          'Divide a aplicação em camadas (apresentação, lógica e dados) que escalam e mudam em separado',
          'Um único processo guarda interface, regras de negócio e banco de dados juntos',
          'Cada mensagem é enviada a todos os nós da rede'
        ], 'As camadas separam responsabilidades; o preço são mais saltos de rede.'),
        mcq('q6', 'Uma equipe pequena, com tráfego modesto, quer dividir um app simples em dez microsserviços "por modernidade". Qual é a avaliação mais correta?', 'a', [
          'Provavelmente traz complexidade sem benefício real; um monolito bem organizado tende a servir melhor',
          'É sempre a melhor decisão, pois microsserviços eliminam as falhas e dispensam qualquer monitoramento ou teste',
          'É inevitável: todo sistema precisa de dez serviços',
          'Só é possível se cada serviço usar um banco central único'
        ], 'Distribuir tem custo; só vale quando resolve um problema real, como escala ou autonomia de muitas equipes.'),
        mcq('q7', 'Qual é a principal fraqueza do modelo cliente-servidor simples?', 'd', [
          'O cliente não consegue enviar pedidos ao servidor sem usar um balanceador',
          'Não é possível usar criptografia nele',
          'Ele não funciona com mais de um cliente',
          'O servidor é um ponto central: se cai ou satura, todos sofrem'
        ], 'Sem redundância, o servidor único é um ponto único de falha e um gargalo.'),
        fill('q8', 'Em uma arquitetura orientada a eventos, partes do sistema publicam "eventos" e outras reagem a eles. Por qual nome genérico se chama o intermediário que guarda e entrega essas mensagens (como uma fila)?', 'intermediário de mensagens: ___', ['broker', 'message broker', 'broker de mensagens'], 'O broker recebe de produtores e entrega a consumidores, desacoplando os dois lados.')
      ]
    },
    {
      id: 'cdb-05-comunicacao-rpc-serializacao',
      title: 'Comunicação entre processos, RPC e serialização',
      goal: 'Entender sockets, RPC, REST, gRPC, serialização, timeouts, sincronia e idempotência ao reenviar.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Sockets: a base de tudo',
            'Um socket é o ponto de comunicação pelo qual um programa envia e recebe bytes pela rede. Em TCP, um lado escuta (servidor) e o outro conecta (cliente); depois disso trocam um fluxo de bytes confiável e ordenado, enquanto a conexão durar. O socket só entrega bytes: formato, significado e delimitação das mensagens são com você. HTTP, gRPC e quase tudo mais é construído em cima disso.',
            'import socket, threading\nsrv = socket.socket(); srv.bind((\'127.0.0.1\', 0)); srv.listen()\ndef serve():\n    conn, _ = srv.accept()\n    conn.sendall(conn.recv(1024).upper())\n    conn.close()\nthreading.Thread(target=serve, daemon=True).start()\nc = socket.create_connection(srv.getsockname(), timeout=2)\nc.sendall(b\'ola\')\nprint(c.recv(1024))  # b\'OLA\''
          ),
          sl(
            'RPC: parece chamada local, mas não é',
            'RPC (Remote Procedure Call, chamada de procedimento remoto) é a ideia de chamar uma função em outra máquina com a sintaxe de uma chamada local: resultado = somar(2, 3). Um stub no cliente empacota os argumentos, envia pela rede, e outro no servidor executa e devolve. É prático, mas ENGANOSO: uma chamada local não demora, não perde a resposta e não falha pela metade; uma remota pode demorar, dar timeout, executar sem que você saiba, ou falhar de formas que a local nunca falha. Trate toda chamada remota como algo que pode dar errado.',
            'resultado = servico.somar(2, 3)  # parece local\n# mas pode: demorar, dar timeout, executar mas a resposta se perder'
          ),
          sl(
            'REST/HTTP e gRPC em visão geral',
            'REST sobre HTTP: recursos identificados por URLs e manipulados com verbos (GET lê, POST cria, PUT substitui, DELETE remove), geralmente com JSON. É simples, legível e funciona em qualquer lugar, e por isso é o padrão de APIs públicas. gRPC é um framework de RPC moderno que roda sobre HTTP/2 e usa contratos definidos em arquivos próprios (com Protobuf), gerando código para vários idiomas; costuma ser mais compacto e eficiente, ótimo entre serviços internos, e menos direto de testar à mão. Nenhum é melhor sempre: depende de público, desempenho e ferramentas.'
          ),
          sl(
            'Serialização e versionamento',
            'Serializar é transformar um objeto da memória em bytes para enviar ou guardar; desserializar é o caminho inverso. JSON é texto, legível, universal e um pouco maior; Protobuf é binário, compacto, exige um esquema compartilhado (arquivo .proto) e é mais rápido. O ponto delicado é a evolução: serviços de versões diferentes convivem. A regra é compatibilidade: adicionar campo opcional é seguro, remover ou renomear campo ou mudar o tipo costuma quebrar quem ainda usa a versão antiga. Evolua o contrato sem exigir que todos mudem ao mesmo tempo.',
            'import json\nmsg = json.dumps({\'id\': 7, \'op\': \'soma\', \'args\': [2, 3]})\nprint(msg)  # {"id": 7, "op": "soma", "args": [2, 3]}\nprint(json.loads(msg)[\'args\'])  # [2, 3]'
          ),
          sl(
            'Timeouts e sincronia vs assincronia',
            'Timeout é o tempo máximo que você espera uma resposta antes de desistir: sem ele, um serviço lento prende os chamadores para sempre. Chamada síncrona: quem chama espera a resposta antes de continuar (simples, mas acopla o tempo dos dois lados e encadeia lentidão). Chamada assíncrona: quem chama envia e segue em frente, recebendo o resultado depois, por callback, polling ou mensagem em fila (mais resiliente e desacoplada, porém mais complexa de raciocinar). Escolha conforme o usuário precise ou não da resposta na hora.',
            'import socket\ns = socket.socket(); s.bind((\'127.0.0.1\', 0)); s.listen()\nc = socket.create_connection(s.getsockname(), timeout=0.2)\ntry:\n    c.recv(10)  # ninguém envia nada\nexcept socket.timeout:\n    print(\'timeout\')  # timeout'
          ),
          sl(
            'Reenviar e idempotência',
            'Se você não recebeu resposta, o natural é reenviar. Mas e se o pedido original já tinha sido executado e só a resposta se perdeu? Reenviar "debite 30" pode cobrar duas vezes. A solução é a idempotência: uma operação idempotente produz o mesmo efeito se for executada uma ou várias vezes. Para operações que não são, o cliente manda uma chave única de requisição (id), e o servidor lembra das que já processou e devolve o resultado guardado em vez de repetir. Garantir que algo acontece "exatamente uma vez" é muito difícil na prática; o padrão confiável é "ao menos uma vez" com consumidor idempotente.',
            'feitos = {}; saldo = 100\ndef pagar(req_id, v):\n    global saldo\n    if req_id in feitos:\n        return feitos[req_id]\n    saldo -= v\n    feitos[req_id] = saldo\n    return saldo\nprint(pagar(\'r1\', 30), pagar(\'r1\', 30), saldo)  # 70 70 70'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que um socket TCP entrega à aplicação?', 'c', [
          'Mensagens já interpretadas',
          'Uma cópia da memória do outro processo',
          'Um fluxo de bytes ordenado, cuja interpretação e delimitação ficam a cargo da aplicação',
          'Um relógio sincronizado entre os dois lados'
        ], 'O socket só transporta bytes; formato e significado das mensagens são responsabilidade do programa.'),
        mcq('q2', 'Por que dizem que o RPC "parece chamada local, mas não é"?', 'd', [
          'Porque usa uma sintaxe totalmente diferente das funções comuns e exige uma biblioteca especial para cada chamada feita',
          'Porque só funciona com funções sem argumentos',
          'Porque o resultado é sempre devolvido em formato binário',
          'Porque a chamada remota pode demorar, dar timeout ou executar sem a resposta chegar, o que a local nunca faz'
        ], 'A rede introduz latência e falhas parciais que a sintaxe de chamada local esconde.'),
        mcq('q3', 'Qual afirmação sobre serialização e compatibilidade é correta?', 'a', [
          'Adicionar campo opcional costuma ser compatível; renomear ou remover campo usado costuma quebrar versões antigas',
          'Renomear campos livremente é sempre seguro, porque os clientes antigos procuram os nomes novos automaticamente e sem erro',
          'Mudar o tipo de um campo existente nunca causa problema, pois o outro lado converte tudo sozinho sem erros',
          'Serialização só serve para guardar arquivos, nunca para a rede'
        ], 'Evolução compatível é aditiva; mudanças destrutivas exigem coordenar todos os envolvidos.'),
        fill('q4', 'Qual é o nome do tempo máximo de espera por uma resposta, passado o qual a chamada é abandonada?', 'definir um ___ evita esperar para sempre', ['timeout', 'time-out', 'tempo limite', 'tempo de espera máximo'], 'Sem timeout, um serviço lento ou parado prende o chamador indefinidamente.'),
        mcq('q5', 'Um cliente envia "debitar 30", não recebe resposta e reenvia. O servidor tinha executado o primeiro pedido. Qual mecanismo evita a cobrança dupla?', 'c', [
          'Aumentar bastante o timeout do cliente até que a resposta do primeiro pedido finalmente chegue ao seu destino',
          'Trocar JSON por Protobuf',
          'Uma chave única de requisição, para o servidor reconhecer o reenvio e devolver o resultado guardado',
          'Desligar a rede entre os serviços'
        ], 'Idempotência com chave de requisição torna o reenvio seguro.'),
        mcq('q6', 'Em qual situação a chamada assíncrona costuma ser preferível à síncrona?', 'a', [
          'Quando o usuário não precisa da resposta na hora e se quer absorver picos e lentidão do destino',
          'Quando a resposta é necessária antes de qualquer próximo passo e o usuário aguarda diante da tela',
          'Quando se quer que a lentidão do destino se propague ao chamador',
          'Quando o destino nunca falha'
        ], 'Assíncrono desacopla o tempo dos dois lados, ao custo de mais complexidade.'),
        mcq('q7', 'Qual descrição combina com gRPC?', 'd', [
          'Um protocolo sempre textual, pensado apenas para páginas web e sem nenhum contrato entre os lados',
          'Um banco de dados distribuído',
          'Um formato de data e hora',
          'Um framework de RPC sobre HTTP/2 com contratos Protobuf que geram código em várias linguagens'
        ], 'gRPC usa esquema compartilhado e serialização binária; é comum entre serviços internos.'),
        fill('q8', 'Uma operação que gera o mesmo efeito se for executada uma vez ou várias vezes é chamada de ___.', 'operação ___', ['idempotente', 'idempotent'], 'Operações idempotentes podem ser reenviadas com segurança; as demais precisam de chave de requisição.')
      ]
    },
    {
      id: 'cdb-34-middleware-modelos-programacao',
      title: 'Middleware e modelos de programação distribuída',
      goal: 'Entender o papel do middleware e comparar mensagens, RPC, objetos distribuídos, memória compartilhada, atores e MPI.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é middleware',
            'Entre o seu programa e a rede existe muita coisa a resolver: máquinas com sistemas operacionais e linguagens diferentes, formatos de dados diferentes, protocolos, endereços. Middleware é a camada de software no meio, entre a aplicação e o sistema/rede, que esconde essa heterogeneidade e entrega abstrações mais simples: "chamar uma função remota", "enviar uma mensagem a uma fila". Exemplos de famílias: sistemas de RPC, filas de mensagens, plataformas de serviços. Ele facilita, mas não faz milagre: a rede continua lá.',
            'aplicação A      aplicação B\n     |                |\n  [ middleware ]--rede--[ middleware ]\n  (esconde SO, formato, protocolo, endereço)'
          ),
          sl(
            'Quatro modelos de programação',
            'Troca de mensagens: processos enviam e recebem mensagens explícitas (send/receive) ou usam filas; o programador vê a comunicação. RPC (chamada remota de procedimento): você chama uma função que roda em outra máquina como se fosse local; o middleware serializa os argumentos, envia e traz o resultado. Objetos distribuídos: a ideia do RPC aplicada a objetos; você invoca métodos de um objeto que vive em outra máquina. Memória compartilhada distribuída (DSM): cria a ilusão de uma memória única entre máquinas; você lê e escreve variáveis e o sistema move os dados por baixo. Quanto mais a abstração esconde a rede, mais fácil de escrever e mais fácil de esquecer das falhas e da latência.'
          ),
          sl(
            'Modelo de atores',
            'No modelo de atores, a unidade do programa é o ator: uma entidade com estado privado (ninguém mexe nele de fora), uma caixa de correio (fila de mensagens recebidas) e um comportamento. Atores se comunicam SOMENTE por mensagens assíncronas, e cada ator processa uma mensagem por vez, então não há corrida no seu estado e não são necessários travas. Se o ator estiver em outra máquina, a mensagem vai pela rede do mesmo jeito: o modelo serve tanto para concorrência quanto para distribuição. Erlang/Elixir e a biblioteca Akka são nomes conhecidos que o usam. Abaixo, um ator minimalista em Python com queue e threading. Quem usa o ator não mexe em total: só chama enviar, que coloca a mensagem na caixa e retorna na hora. O laço do ator, em sua própria thread, tira uma mensagem por vez e a processa. As mensagens 1, 2 e 3 somam 6; a mensagem "parar" encerra o ator, e o join espera esse fim antes de ler o total. O estado só é alterado pelo próprio ator, por isso nunca há duas threads mexendo nele.',
            'import queue, threading\n\nclass Ator:\n    def __init__(self):\n        self.caixa = queue.Queue()\n        self.total = 0  # estado privado\n        self.fio = threading.Thread(target=self._laco)\n        self.fio.start()\n    def enviar(self, msg):\n        self.caixa.put(msg)\n    def _laco(self):\n        while True:\n            msg = self.caixa.get()\n            if msg == \'parar\':\n                break\n            self.total += msg\n\na = Ator()\nfor n in (1, 2, 3):\n    a.enviar(n)\na.enviar(\'parar\')\na.fio.join()\nprint(a.total)  # 6'
          ),
          sl(
            'MPI: processos com rank',
            'MPI (Message Passing Interface) é um padrão de troca de mensagens muito usado em computação de alto desempenho: simulações científicas em clusters com muitos processos. Todos os processos rodam o mesmo programa; cada um recebe um número de identificação, o rank (0, 1, 2, ...), e usa o rank para saber qual parte do trabalho é sua. As operações básicas são send e recv entre pares de processos. Há também operações coletivas, em que todos participam: broadcast (um envia o mesmo dado a todos), scatter (reparte um conjunto entre os processos), gather (reúne resultados parciais) e reduce (combina valores, como somar). É um modelo de mensagens explícitas e eficientes, ideal para cálculos intensos e bem estruturados, mas trabalhoso de programar.',
            'rank 0: divide o vetor e envia (scatter)\nrank 1,2,3: cada um soma o seu pedaço\nrank 0: reúne e combina os parciais (reduce)'
          ),
          sl(
            'Síncrono, assíncrono, futuros e promessas',
            'Síncrono: quem chama espera a resposta antes de continuar (a thread fica parada). Assíncrono: quem chama dispara o pedido e segue fazendo outras coisas, tratando a resposta depois. Para isso as linguagens oferecem futuros ou promessas (future, promise): um objeto que representa um resultado que ainda não chegou. Você consegue o "recibo" na hora e depois pergunta pelo valor (ou registra o que fazer quando ele chegar). Em chamadas remotas isso é valioso: enquanto a rede e o outro serviço trabalham, você pode disparar outras chamadas em paralelo e reduzir o tempo total.',
            'f1 = servico_a.buscar()   # retorna futuro na hora\nf2 = servico_b.buscar()   # dispara em paralelo\nresultado = f1.valor() + f2.valor()  # espera só aqui'
          ),
          sl(
            'Escolher o modelo conforme o problema',
            'Não existe modelo melhor em tudo. Cálculo científico com muitos processos cooperando em um cluster: MPI. Serviços que expõem operações a outros serviços e precisam de contrato claro: RPC (ou API). Desacoplar produtores e consumidores, absorver picos, tolerar consumidor fora do ar: filas e troca de mensagens. Muitas entidades independentes, cada uma com seu estado e conversando entre si (sessões, jogadores, dispositivos): atores. Memória compartilhada distribuída é mais rara e esconde muito custo de rede. Pergunte sempre: quem comunica com quem, com que frequência, o que acontece se a outra parte demorar ou cair?'
          ),
          sl(
            'O preço da abstração',
            'RPC e DSM prometem esconder a rede, e isso ajuda, mas a rede continua lá: uma chamada remota pode demorar, falhar sem você saber se foi executada (a resposta é que se perdeu, ou o pedido?) e ser repetida. Por isso, mesmo atrás de uma interface de "função local", uma chamada remota precisa de timeout (limite de espera), tratamento de erro, novas tentativas com cuidado (operações idempotentes) e atenção à latência. Esse é o erro clássico: tratar uma chamada remota como local, e chamá-la mil vezes dentro de um laço. Boas abstrações simplificam a escrita, não eliminam a necessidade de pensar em falhas parciais.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é o papel do middleware em um sistema distribuído?', 'a', [
          'Uma camada entre aplicação e rede que esconde a heterogeneidade',
          'Um servidor físico que guarda todos os dados do sistema todo',
          'Uma ferramenta que substitui a rede e elimina a latência e as falhas',
          'Um banco de dados que só funciona com o mesmo sistema operacional'
        ], 'Middleware fica entre a aplicação e o SO/rede e esconde diferenças de plataforma, formato e protocolo. Ele não elimina latência nem falhas.'),
        mcq('q2', 'Um programador chama uma função cujo código roda em outra máquina, e o sistema serializa os argumentos e traz o resultado, como se a chamada fosse local. Qual modelo é esse?', 'c', [
          'Memória compartilhada distribuída (DSM)',
          'Ator, que se comunica apenas por caixa de correio',
          'RPC (chamada remota de procedimento)',
          'Coletiva do MPI, como broadcast'
        ], 'RPC dá a ilusão de chamada local, com o middleware cuidando de serializar, enviar e receber. DSM cria a ilusão de variáveis compartilhadas.'),
        mcq('q3', 'No ator da lição, o programa principal faz enviar(1), enviar(2), enviar(3) e enviar(\'parar\'), e depois imprime a.total após o join. Qual é a saída?', 'd', [
          '3, pois só a última mensagem de número é considerada',
          '1, porque o ator para depois da primeira mensagem',
          '0, pois o total só muda quando o programa principal altera o atributo',
          '6, pois o ator processa as mensagens em ordem e soma 1, 2 e 3'
        ], 'A caixa é uma fila: o ator soma 1, 2 e 3 em ordem e encerra ao ler "parar". O join garante que o total está pronto.'),
        fill('q4', 'No modelo de atores, cada ator tem estado privado e se comunica com os outros somente por ___ (enviadas à caixa de correio).', 'atores se comunicam só por ___', ['mensagens', 'mensagem', 'troca de mensagens'], 'Sem memória compartilhada: só mensagens. Cada ator processa uma por vez, evitando corridas no seu estado.'),
        mcq('q5', 'Em um programa MPI com 4 processos rodando o mesmo código, para que serve o rank?', 'b', [
          'Para indicar a prioridade de cada processo no sistema operacional da máquina',
          'Para que cada processo saiba quem é (0 a 3) e, assim, qual parte do trabalho ou com quem se comunicar',
          'Para medir a velocidade da rede entre dois processos',
          'Para escolher qual processo terá permissão de ler a memória dos outros'
        ], 'O rank é a identidade do processo: o mesmo programa se comporta de forma diferente conforme o rank. Não há memória compartilhada entre processos.'),
        mcq('q6', 'Um código precisa chamar três serviços independentes e depois juntar os resultados. Como futuros ajudam?', 'c', [
          'Eles garantem que a chamada nunca falhe, mesmo com o serviço fora do ar',
          'Eles transformam as três chamadas remotas em locais, sem rede envolvida',
          'Permitem disparar todas e esperar só na hora de usar o valor',
          'Eles obrigam a executar as chamadas uma por vez, na ordem escrita'
        ], 'O futuro é um recibo de resultado pendente: você dispara tudo em paralelo e só espera na hora de usar o valor, reduzindo o tempo total.'),
        mcq('q7', 'Simulação científica com centenas de processos que dividem um grande vetor e trocam resultados parciais com frequência, em um cluster. Qual modelo é o mais natural?', 'a', [
          'MPI, com rank, scatter, gather e reduce',
          'Memória compartilhada distribuída escondendo toda a comunicação, sem controle do programador',
          'Uma fila de mensagens ligando cada processo a um navegador web',
          'Um único serviço central que recebe cada número e soma um por vez'
        ], 'MPI é o padrão em computação de alto desempenho para cálculo cooperativo, com coletivas eficientes para dividir e combinar dados.'),
        fill('q8', 'Mesmo que o RPC pareça uma chamada local, ela pode ficar presa para sempre; por isso toda chamada remota precisa de um ___ (limite de espera).', 'chamada remota com ___', ['timeout', 'time-out', 'tempo limite', 'limite de tempo'], 'A rede continua lá: sem timeout, uma chamada pode travar indefinidamente. A abstração não elimina a falha parcial.')
      ]
    },
    {
      id: 'cdb-06-modelos-sistema-falhas',
      title: 'Modelos de sistema e de falhas',
      goal: 'Distinguir os modelos de tempo (síncrono, assíncrono, parcialmente síncrono) e os tipos de falha, e entender por que o modelo importa.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que precisamos de modelos',
            'Para projetar ou provar que um algoritmo distribuído funciona, é preciso dizer exatamente o que pode dar errado e o que se pode assumir sobre o tempo. Isso é um modelo de sistema: um conjunto de suposições sobre nós, rede e tempo. Um algoritmo é correto DENTRO de um modelo; se o mundo real viola as suposições (por exemplo, a rede atrasa mais do que se supunha), a garantia some. Escolher o modelo errado é fonte clássica de bugs.'
          ),
          sl(
            'Modelos de tempo: síncrono, assíncrono, parcialmente síncrono',
            'Modelo síncrono: há limites conhecidos para o atraso das mensagens e para a velocidade dos nós; então um timeout detecta falhas com certeza. É conveniente, mas raramente é verdade em redes reais. Modelo assíncrono: não há limite algum para atrasos; mensagens chegam em tempo finito mas arbitrário, então é impossível distinguir um nó lento de um nó parado. Modelo parcialmente síncrono: o sistema se comporta de forma assíncrona por períodos, mas eventualmente passa a respeitar limites de tempo. É o modelo mais realista e o usado por muitos algoritmos práticos.'
          ),
          sl(
            'Tipos de falha dos nós',
            'Falha por parada (crash): o nó funciona direito até que para e não volta a agir (a mais simples de tratar). Falha por omissão: o nó deixa de enviar ou de receber algumas mensagens, mas continua vivo. Falha de temporização: o nó responde, mas fora do prazo esperado (modelos com limites de tempo). Falha bizantina: o nó pode se comportar de forma arbitrária, inclusive mentindo, enviando dados contraditórios a nós diferentes, por bug ou por ação maliciosa. É a mais difícil e a mais cara de tolerar, e só se projeta para ela quando há desconfiança real entre as partes.',
            'crash       : para e fica mudo\nomissão     : perde algumas mensagens\ntemporização: responde, mas tarde demais\nbizantina   : comportamento arbitrário ou malicioso'
          ),
          sl(
            'Falhas da rede',
            'A rede também falha. Perda: a mensagem some. Duplicação: a mesma mensagem chega duas vezes (por exemplo, por reenvio). Atraso: chega, mas muito depois. Reordenação: mensagens chegam em ordem diferente da de envio. Partição: a rede se divide em grupos de nós que funcionam internamente, mas não conseguem se comunicar entre si. Cada nó dentro da partição acha que os outros falharam. Protocolos precisam tolerar todos esses comportamentos, por isso mensagens devem ser idempotentes e ter identificadores.'
          ),
          sl(
            'Falha e lentidão são indistinguíveis',
            'Em um modelo assíncrono, ou em uma rede real durante um congestionamento, um nó que não responde pode estar morto ou apenas lento, e não há como saber só observando de fora. Detectores de falha usam timeouts: eles podem acertar na maioria dos casos, mas também erram, suspeitando de um nó vivo e lento (falso positivo) ou demorando a notar um morto. Daí a importância de projetar para que um erro de suspeita não cause estragos, como dois nós se achando líderes ao mesmo tempo.'
          ),
          sl(
            'O modelo guia a escolha do algoritmo',
            'Quanto mais fracas as suposições (assíncrono, falhas bizantinas, partições), mais difícil e custoso o algoritmo; quanto mais fortes, mais simples, porém mais frágil se o mundo não obedecer. Um banco que só precisa tolerar paradas de nós usa algoritmos bem mais baratos do que um sistema que precisa tolerar nós que mentem. Antes de escolher uma técnica, responda: que falhas esperamos, e o que podemos assumir sobre o tempo?'
          )
        ]
      },
      questions: [
        mcq('q1', 'Em qual modelo existe um limite conhecido para o atraso das mensagens, de modo que um timeout detecta falhas com certeza?', 'c', [
          'Assíncrono',
          'Bizantino',
          'Síncrono',
          'Parcialmente assíncrono sem limites'
        ], 'No modelo síncrono os limites são conhecidos; é conveniente, mas raro em redes reais.'),
        mcq('q2', 'Qual tipo de falha descreve um nó que passa a mentir, mandando informações contraditórias a nós diferentes?', 'a', [
          'Falha bizantina',
          'Falha por parada (crash)',
          'Falha por omissão simples',
          'Falha de rede por reordenação'
        ], 'Na falha bizantina o comportamento é arbitrário, inclusive malicioso.'),
        mcq('q3', 'Uma rede se divide em dois grupos de nós que funcionam internamente, mas não se comunicam entre si. Como se chama esse evento?', 'd', [
          'Duplicação de mensagens',
          'Falha de temporização',
          'Reordenação de pacotes',
          'Partição de rede'
        ], 'Cada lado da partição enxerga o outro como se tivesse falhado.'),
        fill('q4', 'Qual é o tipo de falha em que o nó funciona corretamente até parar e depois não age mais, sendo o caso mais simples de tratar?', 'falha por ___ (crash)', ['parada', 'crash', 'falha por parada', 'crash-stop'], 'Parada (crash) é o tipo mais simples; omissão, temporização e bizantina são mais complexos.'),
        mcq('q5', 'Por que, em um modelo assíncrono, não se consegue distinguir um nó parado de um nó apenas lento?', 'b', [
          'Porque nós parados sempre respondem às mensagens, avisando que estão parados',
          'Porque não há limite de tempo para a resposta: o silêncio pode ser só um atraso muito longo',
          'Porque a rede nunca perde mensagens',
          'Porque o relógio de todos os nós é perfeito'
        ], 'Sem limite de atraso, nenhum timeout pode provar que o outro falhou.'),
        mcq('q6', 'Um sistema só precisa tolerar paradas de nós, mas é desenhado como se os nós pudessem mentir. Qual é o resultado provável?', 'a', [
          'Um algoritmo mais caro e complexo do que o necessário para o modelo real',
          'Um algoritmo mais simples e barato do que o necessário, mas que continua tolerando nós que mentem',
          'Um sistema que não pode ser implantado em rede',
          'Um sistema que elimina todas as falhas de rede'
        ], 'Suposições mais fracas custam mais; escolha o modelo que corresponde ao risco real.'),
        mcq('q7', 'Um detector de falhas baseado em timeout marca como morto um nó que estava vivo, só lento. O que isso é e o que se deve evitar?', 'd', [
          'Um acerto; nada a evitar',
          'Uma falha bizantina; reiniciar a rede',
          'Uma duplicação de mensagem; remover o identificador e reenviar tudo mais uma vez para todos os nós',
          'Falso positivo; a suspeita errada não pode causar dano, como dois líderes ao mesmo tempo'
        ], 'Detectores erram; o sistema deve ser seguro mesmo quando uma suspeita está errada.'),
        fill('q8', 'Qual modelo de tempo é considerado o mais realista, pois o sistema se comporta de forma assíncrona por períodos e eventualmente passa a respeitar limites de tempo? Responda com "parcialmente ___".', 'modelo parcialmente ___', ['síncrono', 'sincrono', 'parcialmente síncrono', 'parcialmente sincrono'], 'O parcialmente síncrono combina períodos de atraso arbitrário com uma estabilização eventual.')
      ]
    },
    {
      id: 'cdb-07-latencia-throughput-escalabilidade',
      title: 'Latência, vazão e escalabilidade',
      goal: 'Medir desempenho com latência, vazão e percentis, e entender como escalar, a lei de Amdahl, a lei de Little e os gargalos.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Latência e vazão (throughput)',
            'Latência é o tempo que UMA requisição leva do envio até a resposta (medida em milissegundos, por exemplo). Vazão ou throughput é QUANTAS requisições o sistema completa por unidade de tempo (requisições por segundo). São coisas diferentes: uma estrada larga com carros lentos tem vazão alta e latência alta; dá para melhorar uma sem a outra. Em geral, quando o sistema se aproxima do limite de vazão, a latência começa a subir porque as requisições formam fila.'
          ),
          sl(
            'Percentis e latência de cauda',
            'A média esconde problemas. Se 99 requisições levam 10 ms e uma leva 5 s, a média parece boa, mas alguém esperou muito. Por isso se usam percentis: p50 (mediana) é o valor abaixo do qual ficam 50% das requisições; p95 e p99 indicam que 95% e 99% foram mais rápidas que aquele valor. A latência de cauda são esses percentis altos (p99 e acima): as requisições mais lentas. Ela importa porque, num sistema distribuído, uma requisição do usuário costuma envolver MUITAS chamadas internas, e basta uma lenta para atrasar o conjunto.',
            'tempos (ms): 10 10 10 ... 10 (99 vezes) e 5000 (1 vez)\nmédia ~ 60 ms   p50 = 10 ms   p99 ~ 10 ms   máximo = 5000 ms'
          ),
          sl(
            'Escalar vertical vs horizontalmente',
            'Escala vertical (scale up): dar mais recursos a uma máquina (mais CPU, memória, disco). É simples, pois o software não muda, mas tem limite físico e de custo, e a máquina continua sendo um ponto único de falha. Escala horizontal (scale out): acrescentar mais máquinas e dividir o trabalho entre elas. Em tese cresce muito mais e ajuda a disponibilidade, mas exige que o software seja projetado para isso (dividir carga e dados, lidar com a rede) e traz a complexidade distribuída.'
          ),
          sl(
            'Lei de Amdahl',
            'Nem todo trabalho pode ser dividido. Se uma fração p do programa é paralelizável e o resto (1 - p) é serial, o ganho de velocidade máximo com N processadores é 1 / ((1 - p) + p / N). Com p = 0,9 e N = 10, o ganho é cerca de 5,26, e não 10. Mesmo com infinitos processadores, o ganho nunca passa de 1 / (1 - p) = 10. Conclusão: a parte serial manda; acrescentar máquinas tem retorno decrescente, e é preciso atacar o que não paraleliza.',
            'def amdahl(p, n):\n    return 1 / ((1 - p) + p / n)\nprint(round(amdahl(0.9, 10), 2))   # 5.26\nprint(round(amdahl(0.9, 1e9), 2))  # 10.0  (limite 1/(1-p))\nprint(round(amdahl(0.95, 20), 2))  # 10.26'
          ),
          sl(
            'Lei de Little em visão geral',
            'A lei de Little relaciona três grandezas de um sistema estável: L = λ × W, em que L é o número médio de requisições dentro do sistema ao mesmo tempo, λ (lambda) é a taxa de chegada (requisições por segundo) e W é o tempo médio que cada uma passa no sistema. Exemplo: 100 requisições por segundo com 0,2 s cada resultam em 100 × 0,2 = 20 requisições em andamento simultaneamente. Serve para dimensionar: quantas conexões, threads ou nós são necessários para dar conta do tráfego esperado.',
            'lambda_ = 100   # requisições por segundo\nW = 0.2         # segundos por requisição\nprint(lambda_ * W)  # 20.0 requisições simultâneas em média'
          ),
          sl(
            'Gargalos e o estado como inimigo da escala',
            'Gargalo é o componente mais limitado do caminho (CPU de um nó, o banco, um lock, um link de rede): o sistema todo só vai tão rápido quanto ele. Adicionar nós a quem não é o gargalo não adianta; meça antes de otimizar. O estado é o grande inimigo da escala horizontal: servidores SEM estado (stateless) são intercambiáveis e podem ser multiplicados à vontade; os que guardam estado local precisam de replicação, particionamento ou afinidade. Por isso se empurra o estado para poucos lugares (banco, cache) e se mantém o restante sem estado. Números absolutos de desempenho dependem de hardware e de contexto e envelhecem rápido; aqui importam as ordens de grandeza conceituais: memória é muito mais rápida que disco, que é muito mais rápido que a rede entre continentes.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a diferença entre latência e vazão?', 'b', [
          'São o mesmo conceito com nomes diferentes',
          'Latência é o tempo de uma requisição; vazão é quantas requisições se concluem por unidade de tempo',
          'Latência é o número de requisições por segundo; vazão é o tempo de uma requisição completa',
          'Latência mede só o disco; vazão mede só a CPU'
        ], 'Latência: quanto demora uma. Vazão: quantas por segundo. Uma pode melhorar sem a outra.'),
        mcq('q2', 'Por que se usam percentis como p99 em vez de apenas a média?', 'c', [
          'Porque a média é sempre mais alta que o p99 e por isso esconde o desempenho dos melhores casos que ficaram abaixo dela',
          'Porque percentis dispensam a medição dos tempos',
          'Porque a média esconde as requisições mais lentas, e poucas muito lentas já prejudicam usuários',
          'Porque o p99 é igual à mediana'
        ], 'A cauda da distribuição revela a experiência dos piores casos, que a média dilui.'),
        mcq('q3', 'Qual afirmação descreve corretamente escala horizontal?', 'a', [
          'Acrescentar mais máquinas e dividir o trabalho entre elas, exigindo software preparado para isso',
          'Trocar a máquina por outra mais potente, sem alterar o software e sem dividir o trabalho com ninguém',
          'Reduzir o número de máquinas para economizar',
          'Aumentar apenas o tempo de timeout das chamadas'
        ], 'Horizontal = mais nós; vertical = nó maior. A horizontal cresce mais, mas traz complexidade distribuída.'),
        fill('q4', 'O percentil que indica o tempo abaixo do qual ficam 99% das requisições é chamado p___.', 'percentil p___', ['99', 'p99'], 'p99 representa quase a pior latência do dia a dia; é o ponto clássico da latência de cauda.'),
        mcq('q5', 'Segundo Amdahl, um programa tem 90% paralelizável (p = 0,9) e roda em 10 processadores. Qual é o ganho de velocidade aproximado?', 'd', [
          '10 vezes',
          '9 vezes',
          '0,9 vez',
          'Cerca de 5,3 vezes'
        ], '1 / (0,1 + 0,9/10) = 1 / 0,19 = 5,26. A parte serial limita o ganho.'),
        mcq('q6', 'Um serviço recebe 50 requisições por segundo e cada uma leva em média 0,4 s. Pela lei de Little, quantas requisições estão em andamento ao mesmo tempo, em média?', 'b', [
          '2',
          '20',
          '50',
          '125'
        ], 'L = λ × W = 50 × 0,4 = 20 requisições simultâneas.'),
        mcq('q7', 'Um sistema está lento porque o banco de dados satura, e a equipe dobra o número de servidores de aplicação, sem ganho. Qual conceito explica?', 'a', [
          'O gargalo é o banco; aumentar os componentes que não são o gargalo não melhora o conjunto',
          'A latência de cauda foi eliminada',
          'Servidores sem estado não podem ser multiplicados porque cada um depende de uma máquina específica da rede',
          'A lei de Little deixa de valer'
        ], 'O sistema só vai tão rápido quanto seu componente mais limitado; é preciso medir e atacar o gargalo.'),
        fill('q8', 'Mesmo com infinitos processadores, um programa com 10% de trabalho serial (p = 0,9) nunca ultrapassa um ganho de ___ vezes (1 / (1 - p)).', 'ganho máximo: ___ vezes', ['10', '10x', '10 vezes', 'dez'], '1 / (1 - 0,9) = 10: a parte serial fixa o teto do ganho.')
      ]
    },
    {
      id: 'cdb-08-disponibilidade-confiabilidade',
      title: 'Disponibilidade e confiabilidade',
      goal: 'Calcular disponibilidade em noves, entender MTBF/MTTR, SPOF, redundância, failover, degradação graciosa, SLA e SLO.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Disponibilidade em "noves"',
            'Disponibilidade é a fração do tempo em que o serviço está funcionando e atendendo. Costuma ser dita em "noves": 99% (dois noves), 99,9% (três noves), 99,99% (quatro noves). Cada nove a mais reduz muito a indisponibilidade permitida. Em um ano (525.600 minutos), 99% permite cerca de 87,6 horas fora do ar (3,65 dias), 99,9% cerca de 8,76 horas, 99,99% cerca de 52,6 minutos e 99,999% cerca de 5,26 minutos. Conta: minutos do ano × (1 - disponibilidade).',
            'minutos_ano = 365 * 24 * 60   # 525600\nfor d in (0.99, 0.999, 0.9999, 0.99999):\n    print(d, round(minutos_ano * (1 - d), 2), \'min/ano\')\n# 0.99    5256.0 min/ano  (87,6 h)\n# 0.999   525.6  min/ano  (8,76 h)\n# 0.9999  52.56  min/ano\n# 0.99999 5.26   min/ano'
          ),
          sl(
            'MTBF, MTTR e confiabilidade',
            'Confiabilidade é a capacidade de funcionar corretamente por um período, sem falhar. MTBF (Mean Time Between Failures) é o tempo médio entre falhas; MTTR (Mean Time To Repair) é o tempo médio para consertar e voltar. A disponibilidade resulta de ambos: disponibilidade = MTBF / (MTBF + MTTR). Com MTBF de 99 h e MTTR de 1 h, dá 99 / 100 = 99%. Ou seja, dá para ganhar disponibilidade tanto falhando menos quanto (e muitas vezes mais barato) consertando muito mais rápido.',
            'mtbf, mttr = 99, 1\nprint(mtbf / (mtbf + mttr))  # 0.99'
          ),
          sl(
            'SPOF e redundância',
            'SPOF (Single Point of Failure, ponto único de falha) é qualquer componente cuja falha derruba o sistema inteiro: um servidor só, um banco só, um balanceador só, um link só, até uma pessoa que detém um conhecimento. A defesa é a redundância: ter mais de uma cópia do componente de modo que outra assuma quando uma falha. Redundância custa (mais máquinas, mais coordenação) e só funciona se as cópias NÃO falharem juntas; duas réplicas na mesma máquina ou no mesmo rack ainda compartilham o risco.'
          ),
          sl(
            'Failover e health checks',
            'Failover é a troca automática (ou manual) para o componente de reserva quando o principal falha. Para isso o sistema precisa DETECTAR a falha: health checks são verificações periódicas ("você está bem?") feitas por um balanceador ou monitor, que retiram do rodízio os nós que não respondem. Há detalhes: o check deve testar o que importa (um servidor pode estar ligado e ainda assim sem conseguir falar com o banco), e falsos alarmes causam trocas desnecessárias. Quanto mais rápido o detector e o failover, menor o MTTR.'
          ),
          sl(
            'Degradação graciosa',
            'Em vez de "tudo ou nada", o sistema pode perder uma função e continuar entregando o essencial. Exemplo: a loja continua vendendo quando o serviço de recomendações cai, mostrando apenas uma lista padrão; o vídeo baixa a qualidade em vez de parar. É decidir de antemão quais funções são críticas e quais são dispensáveis, e fazer o código tratar a ausência das dispensáveis sem quebrar.'
          ),
          sl(
            'Disponibilidade composta, SLA e SLO',
            'Em série (todos precisam funcionar), as disponibilidades se multiplicam e o conjunto fica PIOR que o pior componente: três serviços de 99,9% dão 0,999 × 0,999 × 0,999 ≈ 99,7%. Em paralelo redundante (basta um funcionar, e falhas independentes), a indisponibilidade se multiplica: duas réplicas de 99% dão 1 - 0,01 × 0,01 = 99,99%. SLA (Service Level Agreement) é o acordo, em geral contratual, com o cliente, incluindo consequências (como créditos) se não for cumprido. SLO (Service Level Objective) é a meta interna que a equipe se compromete a atingir, normalmente mais rígida que o SLA para ter margem.',
            'print(0.999 ** 3)       # 0.997002999 (série: ~99,7%)\nprint(1 - 0.01 * 0.01)  # 0.9999 (2 réplicas de 99% em paralelo)'
          )
        ]
      },
      questions: [
        mcq('q1', 'Aproximadamente quanto tempo fora do ar por ano corresponde a 99,9% de disponibilidade?', 'c', [
          'Cerca de 52 minutos',
          'Cerca de 3,65 dias',
          'Cerca de 8,76 horas',
          'Cerca de 5 minutos'
        ], '525.600 min × 0,001 = 525,6 min, ou cerca de 8,76 horas por ano.'),
        mcq('q2', 'Um pedido passa por três serviços em série, cada um com 99,9% de disponibilidade, e todos precisam funcionar. A disponibilidade do conjunto é aproximadamente:', 'a', [
          '99,7%',
          '99,9%',
          '100%',
          '99,99%'
        ], '0,999 × 0,999 × 0,999 ≈ 0,997; em série, o conjunto é pior que cada parte.'),
        mcq('q3', 'O serviço de recomendações de uma loja cai, e a loja segue vendendo, mostrando apenas uma lista padrão. Como se chama essa estratégia?', 'd', [
          'Failover completo',
          'Partição de rede',
          'Escala vertical',
          'Degradação graciosa'
        ], 'Perde-se uma função dispensável sem derrubar as essenciais.'),
        fill('q4', 'Um serviço tem MTBF de 99 horas e MTTR de 1 hora. Qual é a disponibilidade, em porcentagem, pela fórmula MTBF / (MTBF + MTTR)?', 'disponibilidade = 99 / (99 + 1) = ___ %', ['99', '99%', '99,0', '99.0'], '99 / 100 = 0,99, ou seja, 99%.'),
        mcq('q5', 'Duas réplicas independentes, cada uma com 99% de disponibilidade, e basta uma funcionar. Qual é a disponibilidade do conjunto?', 'b', [
          'Cerca de 98%',
          '99,99%',
          '99%',
          'Cerca de 99,5%'
        ], 'A indisponibilidade conjunta é 0,01 × 0,01 = 0,0001; logo 99,99%, desde que as falhas sejam independentes.'),
        mcq('q6', 'Um balanceador faz health checks e, ao ver um nó sem resposta, o retira do rodízio e envia o tráfego aos demais. Qual conceito isso ilustra?', 'a', [
          'Detecção de falha seguida de failover, reduzindo o tempo de recuperação',
          'Aumento do MTBF por troca preventiva do hardware de todos os servidores da rede',
          'Escala vertical automática',
          'Uma falha bizantina'
        ], 'Health check detecta; failover redireciona. Quanto mais rápido, menor o MTTR.'),
        mcq('q7', 'Qual é a relação entre SLA e SLO?', 'c', [
          'São sinônimos exatos e sempre iguais',
          'SLO é o contrato assinado com o cliente, com multas previstas; SLA é uma métrica de uso de CPU do servidor',
          'SLA é o acordo com o cliente, em geral com consequências; SLO é a meta interna, em geral mais rígida',
          'SLA mede só latência; SLO mede só disponibilidade'
        ], 'O SLO interno costuma ser mais exigente que o SLA para sobrar margem antes de violar o contrato.'),
        fill('q8', 'Como se chama, em inglês, a sigla do componente cuja falha derruba o sistema inteiro (ponto único de falha)?', 'sigla: ___ (Single Point Of Failure)', ['SPOF', 'spof'], 'SPOF: elimina-se com redundância, desde que as cópias não falhem juntas.')
      ]
    },
    {
      id: 'cdb-09-replicacao-basica',
      title: 'Replicação básica',
      goal: 'Entender por que e como replicar dados, os modelos líder-seguidor, sincronia vs assincronia, lag e failover, e por que réplica não é backup.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que replicar',
            'Replicar é manter cópias dos mesmos dados em mais de um nó. Três motivos: disponibilidade (se um nó cai, outro tem os dados e continua atendendo), capacidade de leitura (várias cópias dividem as consultas) e latência (uma cópia perto do usuário responde mais rápido). O preço é manter as cópias em acordo quando os dados mudam. Também há implicação de privacidade: cada réplica é mais uma cópia de dados potencialmente pessoais, que precisa de proteção, controle de acesso e regras de retenção.'
          ),
          sl(
            'Líder-seguidor (primário-réplica)',
            'No modelo mais comum, um nó é o líder (primário). Toda escrita vai para o líder, que a aplica e envia a mudança aos seguidores (réplicas). As leituras podem ser atendidas pelo líder ou pelos seguidores. Como só o líder aceita escritas, a ordem das mudanças é única e simples; o custo é que o líder limita a capacidade de escrita e é crítico para a disponibilidade de escrita.',
            'cliente --escrita--> [ LÍDER ] --replica--> [ seguidor 1 ]\ncliente <--leitura-- [ seguidor 1 ]   [ seguidor 2 ]'
          ),
          sl(
            'Replicação síncrona vs assíncrona',
            'Síncrona: o líder só confirma a escrita ao cliente depois que o seguidor (ou seguidores) confirmou ter recebido. Vantagem: se o líder cair logo após confirmar, a escrita já está em outro nó. Desvantagem: mais lenta, e se o seguidor não responder, a escrita pode ficar travada. Assíncrona: o líder confirma de imediato e envia aos seguidores em segundo plano. Vantagem: rápida e tolerante a seguidores lentos. Desvantagem: se o líder cair antes de a mudança chegar, a escrita confirmada pode ser perdida.'
          ),
          sl(
            'Lag de replicação e leituras desatualizadas',
            'Na replicação assíncrona há um intervalo entre a escrita no líder e sua chegada ao seguidor: o lag de replicação. Quem lê de um seguidor nesse intervalo recebe dado antigo. Exemplo clássico: o usuário altera o nome do perfil, a escrita vai ao líder, a página recarrega lendo de uma réplica atrasada e mostra o nome velho, parecendo que a alteração se perdeu. Mitigações: ler do líder logo depois de escrever, ou aceitar e comunicar que há atraso. Na lição de consistência veremos isso com mais precisão.'
          ),
          sl(
            'Failover e promoção',
            'Quando o líder falha, é preciso promover um seguidor a novo líder. Isso envolve detectar a falha (por timeout, com risco de falso alarme), escolher o seguidor mais atualizado, redirecionar os clientes e reconfigurar os demais seguidores. Riscos: com replicação assíncrona, escritas que só existiam no líder antigo podem ser perdidas; e se o líder antigo na verdade estava só lento e volta, pode haver dois líderes ao mesmo tempo (o chamado split-brain), o que corrompe dados se não for contido.'
          ),
          sl(
            'Réplica não é backup',
            'A réplica copia TUDO que o líder faz, inclusive os erros: se alguém executa um DELETE errado, ou se um bug corrompe registros, a mudança é replicada fielmente para todos os seguidores em instantes. Réplica protege contra falha de máquina; backup protege contra erro humano, corrupção e ataque, pois é um retrato em um ponto no tempo que permite voltar atrás. Ter réplicas não dispensa backups. E, sob a ótica da LGPD, apagar o dado de uma pessoa exige apagá-lo também das réplicas (e dos backups, conforme a política de retenção).'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual NÃO é um motivo típico para replicar dados?', 'd', [
          'Manter o serviço disponível mesmo se um dos nós cair de repente por falha de hardware',
          'Distribuir consultas de leitura entre várias cópias',
          'Aproximar uma cópia do usuário para reduzir a latência',
          'Eliminar a necessidade de qualquer proteção sobre os dados pessoais copiados'
        ], 'Cada réplica é mais uma cópia que precisa das mesmas proteções de segurança e privacidade.'),
        mcq('q2', 'No modelo líder-seguidor, para onde vão as escritas?', 'b', [
          'Para qualquer seguidor, escolhido ao acaso',
          'Para o líder, que replica as mudanças aos seguidores',
          'Para todos os nós ao mesmo tempo',
          'Para o cliente, que as guarda localmente'
        ], 'Só o líder aceita escritas, o que dá uma ordem única às mudanças.'),
        mcq('q3', 'Em replicação assíncrona, o líder confirma a escrita e cai antes de enviá-la aos seguidores. O que pode acontecer?', 'c', [
          'Nada, pois a escrita já estava em todos os seguidores',
          'Os seguidores recuperam a escrita automaticamente, pois o líder a replica mesmo depois de ter caído',
          'A escrita confirmada ao cliente pode ser perdida, pois nenhum seguidor chegou a recebê-la',
          'O cliente recebe um erro retroativo'
        ], 'É o risco da assincronia: confirmação rápida, mas sem garantia de que a mudança chegou a outra máquina.'),
        fill('q4', 'Uma réplica não substitui um ___: ela copia fielmente até os erros, como um DELETE equivocado.', 'réplica não é ___', ['backup', 'cópia de segurança', 'copia de seguranca', 'backups'], 'Backup é um retrato no tempo que permite voltar atrás; a réplica propaga o erro em instantes.'),
        mcq('q5', 'Uma pessoa altera o nome do perfil e, ao recarregar, vê o nome antigo, pois a leitura foi atendida por um seguidor atrasado. Qual é a causa?', 'a', [
          'Lag de replicação com leitura em uma réplica ainda desatualizada',
          'Falha bizantina do líder',
          'Escala vertical insuficiente no servidor líder, que ficou sem memória para responder',
          'Duplicação da mensagem no cliente'
        ], 'A mudança ainda não chegou ao seguidor; ele devolve o dado velho.'),
        mcq('q6', 'Qual é o principal risco de um failover automático que promove um novo líder quando o antigo estava só lento?', 'd', [
          'Os dados passam a ocupar menos espaço em disco',
          'A latência cai para zero',
          'Todos os seguidores deixam de existir',
          'Dois líderes ativos ao mesmo tempo (split-brain), com escritas divergentes'
        ], 'Se o antigo volta e continua aceitando escritas, os dados divergem, a menos que haja contenção.'),
        mcq('q7', 'Qual vantagem tem a replicação síncrona em relação à assíncrona?', 'a', [
          'Uma escrita confirmada já está em outro nó, ficando protegida se o líder cair logo depois',
          'A escrita é sempre mais rápida, pois o líder não precisa esperar confirmação de ninguém antes de responder',
          'Um seguidor lento nunca afeta o líder',
          'Dispensa o uso de um líder'
        ], 'Em troca, ela é mais lenta e pode travar se o seguidor não responder.'),
        fill('q8', 'Quando o líder falha, um seguidor precisa ser ___ a novo líder.', 'um seguidor é ___ a novo líder', ['promovido', 'promovida', 'eleito'], 'A promoção envolve detectar a falha, escolher o seguidor mais atualizado e redirecionar os clientes.')
      ]
    },
    {
      id: 'cdb-10-particionamento-sharding',
      title: 'Particionamento (sharding) básico',
      goal: 'Entender por que e como dividir dados entre nós, por hash ou faixa, os problemas de hot spots e de hash % N, e consistent hashing.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que particionar',
            'Replicar copia os MESMOS dados em vários nós; particionar (ou sharding) divide os dados em pedaços DIFERENTES, cada um em um nó. Serve quando os dados não cabem em uma máquina, ou quando a carga de escrita/leitura é maior do que uma máquina aguenta. Cada pedaço se chama partição ou shard. Cada chave (um id de usuário, por exemplo) pertence a exatamente uma partição, e o sistema precisa saber qual para ir direto ao nó certo.',
            'dados: usuários 1..1000\nshard 0: usuários que "caem" no grupo 0\nshard 1: usuários que "caem" no grupo 1\nshard 2: ...'
          ),
          sl(
            'Por hash vs por faixa',
            'Por faixa (range): cada partição guarda um intervalo de chaves (A-H no nó 1, I-P no nó 2...). Consultas por intervalo ("todos entre as datas X e Y") são eficientes, pois ficam em poucas partições vizinhas; porém a carga pode se concentrar. Por hash: aplica-se uma função de hash à chave e o resultado decide o nó. Distribui de forma mais uniforme, mas chaves vizinhas se espalham, então consultas por intervalo precisam consultar todas as partições.'
          ),
          sl(
            'A chave de partição e os hot spots',
            'A escolha da chave de partição decide tudo. Uma boa chave tem muitos valores distintos e espalha acessos de forma uniforme. Uma chave ruim cria hot spots: partições que recebem muito mais carga que as outras. Exemplo: particionar por faixa de data de criação faz com que TODAS as escritas novas caiam na última partição; ou particionar por país quando um país concentra a maior parte dos usuários. Um hot spot anula o ganho de ter vários nós, pois o sistema só vai tão rápido quanto a partição mais carregada.'
          ),
          sl(
            'O problema do hash % N',
            'A forma ingênua de por hash é nó = hash(chave) % N, com N nós. Funciona até N mudar: ao passar de 4 para 5 nós, o resultado do módulo muda para quase todas as chaves, e quase todos os dados precisam migrar. No exemplo com chaves de 0 a 99, passar de 4 para 5 nós move 80 das 100 chaves. Adicionar um nó (algo que deveria ser tranquilo) vira uma migração quase total.',
            'def shard(k, n):\n    return k % n\nprint([shard(k, 4) for k in range(8)])  # [0, 1, 2, 3, 0, 1, 2, 3]\nprint([shard(k, 5) for k in range(8)])  # [0, 1, 2, 3, 4, 0, 1, 2]\nprint(sum(1 for k in range(100) if k % 4 != k % 5))  # 80 chaves mudam de nó'
          ),
          sl(
            'Consistent hashing em visão geral',
            'O consistent hashing resolve o problema acima: nós e chaves são colocados em um mesmo "anel" de valores de hash, e cada chave pertence ao primeiro nó encontrado seguindo o anel em um sentido. Ao entrar ou sair um nó, só as chaves próximas a ele no anel mudam de dono, em média uma fração pequena do total em vez de quase tudo. Muitas implementações usam vários pontos virtuais por nó para equilibrar a carga. É a ideia por trás de várias bases e caches distribuídos.',
            'anel: ... nóA ---- chave1 ---- nóB ---- chave2 ---- nóC ...\nchave pertence ao próximo nó no sentido do anel\nentrada de nóD entre B e C: só as chaves entre B e D mudam'
          ),
          sl(
            'Consultas entre partições e replicação junto',
            'Consultas que envolvem várias partições (um JOIN entre dados de shards diferentes, uma soma global, uma busca sem a chave de partição) custam caro: o sistema precisa perguntar a todos e combinar os resultados, e a lentidão do pior nó domina. Por isso se desenha o esquema para que as consultas mais comuns usem a chave e caiam em uma só partição. Na prática, replicação e particionamento andam juntos: os dados são divididos em partições e CADA partição é replicada em alguns nós, para sobreviver a falhas.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a diferença entre replicar e particionar?', 'c', [
          'Replicar divide os dados em pedaços diferentes; particionar copia tudo para todos os nós, um para cada máquina da rede inteira',
          'São a mesma técnica com nomes diferentes',
          'Replicar mantém cópias dos mesmos dados em vários nós; particionar divide os dados em pedaços diferentes',
          'Replicar só vale para backups; particionar só vale para cache'
        ], 'Replicação: mesma informação em mais de um lugar. Particionamento: informação diferente em cada lugar.'),
        mcq('q2', 'Qual vantagem típica tem o particionamento por faixa de chaves em relação ao por hash?', 'a', [
          'Consultas por intervalo ficam concentradas em poucas partições vizinhas',
          'A distribuição da carga é sempre perfeitamente uniforme',
          'Dispensa a escolha de uma chave de partição',
          'Impede qualquer hot spot'
        ], 'Chaves vizinhas ficam juntas, o que ajuda consultas por intervalo, mas pode criar hot spots.'),
        mcq('q3', 'Um sistema particiona por faixa de data de criação e quase todas as escritas novas caem na última partição. O que é isso?', 'd', [
          'Uma partição de rede entre os datacenters que dividiu o cluster em dois grupos',
          'Um bom balanceamento',
          'Uma falha bizantina',
          'Um hot spot causado por uma chave de partição ruim'
        ], 'Escritas concentradas em um shard anulam o ganho de ter vários nós.'),
        fill('q4', 'Com a regra nó = chave % N e chaves de 0 a 99, quantas chaves mudam de nó ao passar de 4 para 5 nós?', 'chaves que mudam de nó: ___', ['80', '80 chaves'], 'Só 20 das 100 chaves mantêm o mesmo nó (k % 4 == k % 5); as outras 80 migram.'),
        mcq('q5', 'Qual problema o consistent hashing resolve?', 'b', [
          'A necessidade de criptografar os dados em repouso e em trânsito dentro do cluster',
          'A migração quase total das chaves ao entrar ou sair um nó, como no hash % N',
          'A latência da luz entre continentes',
          'A falta de uma chave de partição'
        ], 'No anel, só as chaves próximas ao nó que entrou ou saiu mudam de dono.'),
        mcq('q6', 'Qual escolha de chave de partição tende a ser melhor para espalhar bem a carga?', 'c', [
          'Um campo com poucos valores distintos, como o país',
          'A data do dia em que o registro foi criado',
          'Um id com muitos valores distintos e acessos uniformes, como o id do usuário',
          'Uma constante igual para todos os registros'
        ], 'Muitos valores e acesso uniforme distribuem a carga; poucos valores ou valores crescentes concentram.'),
        mcq('q7', 'Por que consultas que envolvem várias partições custam caro?', 'd', [
          'Porque as partições não conseguem responder a consultas',
          'Porque cada partição guarda uma cópia de todos os dados e precisa sincronizá-la a cada consulta',
          'Porque só o líder da primeira partição pode responder',
          'Porque precisa perguntar a vários nós e combinar os resultados, esperando o mais lento'
        ], 'Quanto mais partições envolvidas, maior a latência de cauda e o trabalho de combinação.'),
        fill('q8', 'Em uma partição por hash simples, a chave 13 cai em qual nó entre 4 nós numerados de 0 a 3, usando chave % N?', 'nó = 13 % 4 = ___', ['1', 'nó 1'], '13 dividido por 4 dá 3 com resto 1, logo o nó 1.')
      ]
    },
    {
      id: 'cdb-11-balanceamento-carga',
      title: 'Balanceamento de carga',
      goal: 'Entender o papel do balanceador, L4 vs L7, algoritmos, health checks, sessões e como evitar que o balanceador seja um SPOF.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Para que serve',
            'Um balanceador de carga (load balancer) fica na frente de vários servidores iguais e distribui as requisições entre eles. Objetivos: aproveitar bem a capacidade (evitar um nó sobrecarregado enquanto outro está ocioso), permitir escalar horizontalmente (basta acrescentar servidores atrás dele) e aumentar a disponibilidade (tira do rodízio os que falham). Para o cliente, existe um único endereço, o do balanceador: é transparência de localização na prática.',
            'clientes --> [ BALANCEADOR ] --> servidor 1\n                          |--> servidor 2\n                          \\--> servidor 3'
          ),
          sl(
            'Balanceador L4 vs L7',
            'As camadas se referem ao modelo de rede. L4 (camada de transporte) decide só com base em endereços IP e portas, sem olhar o conteúdo: é muito rápido e simples e funciona com qualquer protocolo sobre TCP/UDP. L7 (camada de aplicação) entende o protocolo, por exemplo HTTP, e pode decidir com base em URL, cabeçalhos ou cookies (mandar /api para um grupo e /imagens para outro), terminar TLS, reescrever pedidos; é mais flexível e custa mais processamento.'
          ),
          sl(
            'Algoritmos de distribuição',
            'Round-robin: envia cada nova requisição ao próximo servidor da lista, em rodízio. Simples e bom quando os servidores e as requisições são parecidos. Menos conexões (least connections): envia ao servidor que tem menos conexões ativas no momento; melhor quando as requisições duram tempos muito diferentes. Hash ou afinidade: calcula um hash de algo estável (IP do cliente, id de usuário) para sempre mandar o mesmo cliente ao mesmo servidor, útil para caches e sessões locais. Cada um troca simplicidade por adequação ao tipo de carga.',
            'import itertools\nrr = itertools.cycle([\'A\', \'B\', \'C\'])\nprint([next(rr) for _ in range(5)])  # [\'A\', \'B\', \'C\', \'A\', \'B\']'
          ),
          sl(
            'Health checks',
            'O balanceador precisa saber quais servidores estão aptos. Em health checks ativos, ele mesmo envia periodicamente uma requisição de teste (por exemplo GET /saude) e retira o servidor do rodízio se não houver resposta saudável; passivos observam os erros do tráfego real. O teste deve refletir a saúde verdadeira (conseguir falar com o banco, por exemplo), mas leve. Quando o servidor volta a responder, é reintegrado. Sem health checks, o balanceador continuaria mandando usuários para um servidor morto.'
          ),
          sl(
            'Sessões e estado: sticky vs stateless',
            'Se o servidor guarda a sessão do usuário em sua memória, as próximas requisições precisam voltar ao MESMO servidor: é a sticky session (afinidade de sessão). Funciona, mas desequilibra a carga e, se aquele servidor cai, a sessão se perde. A alternativa é deixar os servidores sem estado (stateless): a sessão fica em um armazenamento compartilhado (banco, cache) ou vai no próprio token do cliente, e qualquer servidor atende qualquer requisição, o que facilita escalar e substituir nós. Dados de sessão contêm informação sensível: proteja-os e dê validade curta.'
          ),
          sl(
            'O balanceador como SPOF e o DNS round-robin',
            'O balanceador, se for um só, é um SPOF: se cai, ninguém acessa nada mesmo com 20 servidores saudáveis. A solução é ter mais de um, em pares ativo-passivo (o reserva assume) ou ativo-ativo, com failover entre eles (por exemplo, compartilhando um IP flutuante). Outra técnica é o DNS round-robin: o nome resolve para vários IPs e os clientes se distribuem entre eles. É simples, mas o DNS é cacheado por clientes e intermediários, então retirar um servidor com falha leva tempo, e o DNS não sabe da saúde real nem da carga dos servidores.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a diferença entre um balanceador L4 e um L7?', 'b', [
          'O L4 entende URLs e cookies e termina TLS; o L7 só vê IPs e portas e não olha o conteúdo',
          'O L4 decide por IP e porta, sem olhar o conteúdo; o L7 entende o HTTP e pode decidir por URL ou cabeçalhos',
          'O L4 só funciona com HTTPS e em um servidor; o L7 só funciona com UDP e em dois servidores de aplicação ou mais',
          'Não há diferença prática entre os dois'
        ], 'L4 é rápido e genérico; L7 é mais flexível por entender a aplicação, ao custo de mais processamento.'),
        mcq('q2', 'Em round-robin com os servidores A, B e C, qual é a ordem das cinco primeiras requisições?', 'a', [
          'A, B, C, A, B',
          'A, A, A, B, B',
          'C, B, A, C, B',
          'A, B, A, B, A'
        ], 'O rodízio percorre a lista em ordem e volta ao início.'),
        mcq('q3', 'As requisições têm duração muito variável: algumas levam milissegundos, outras vários segundos. Qual algoritmo costuma equilibrar melhor?', 'd', [
          'Round-robin puro, ignorando a carga atual',
          'Mandar tudo para o primeiro servidor da lista até que ele fique sem recursos',
          'Escolher um servidor ao acaso uma vez e nunca mais mudar',
          'Menos conexões, mandando ao servidor com menos conexões ativas'
        ], 'O rodízio ignora o estado atual dos servidores; menos conexões reage à carga real.'),
        fill('q4', 'Um servidor que não guarda a sessão do usuário em sua memória, de modo que qualquer servidor atende qualquer requisição, é chamado de ___ (sem estado).', 'servidor ___ (sem estado)', ['stateless', 'sem estado'], 'Servidores stateless são intercambiáveis e fáceis de escalar.'),
        mcq('q5', 'Qual é um problema típico da sticky session?', 'c', [
          'A sessão é compartilhada automaticamente por todos os servidores, então nada nunca se perde',
          'O balanceador deixa de funcionar',
          'Se o servidor da sessão cai, ela se perde e a carga pode ficar desequilibrada',
          'Os usuários nunca conseguem fazer login'
        ], 'Afinidade prende o usuário a um nó, concentrando carga e perdendo o estado na falha.'),
        mcq('q6', 'Há vinte servidores saudáveis atrás de um único balanceador, e o balanceador cai. O que acontece?', 'a', [
          'O serviço fica fora do ar, pois o balanceador único é um ponto único de falha',
          'Os clientes passam a falar diretamente com um servidor sem nenhum problema, pois o balanceador é opcional',
          'O serviço continua normalmente, pois os servidores são redundantes',
          'Os servidores se transformam em balanceadores'
        ], 'Redundância nos servidores não protege se a porta de entrada é única; é preciso replicar o balanceador também.'),
        mcq('q7', 'Qual é uma limitação do DNS round-robin como forma de balancear?', 'd', [
          'Só funciona com um único servidor',
          'Exige que os servidores tenham o mesmo IP',
          'Impede o uso de HTTPS',
          'Respostas de DNS são cacheadas: retirar um servidor com falha demora, e o DNS não vê saúde nem carga'
        ], 'O cache de DNS atrasa a propagação, e o DNS não faz health check do que está atrás de cada IP.'),
        fill('q8', 'O algoritmo que envia cada nova requisição ao próximo servidor da lista, em rodízio, chama-se round-___.', 'round-___', ['robin', 'round-robin', 'round robin'], 'Round-robin é o algoritmo mais simples e funciona bem com servidores e requisições parecidos.')
      ]
    },
    {
      id: 'cdb-12-cache-distribuido',
      title: 'Cache distribuído',
      goal: 'Entender padrões de cache, TTL, invalidação, stampede, chaves quentes, consistência com o banco e o que não cachear.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é e para que serve',
            'Cache é um armazenamento rápido, em geral em memória, que guarda cópias de dados caros de obter (resultado de consulta, página montada) para responder depois sem refazer o trabalho. Reduz a latência e alivia o banco. Um cache distribuído é compartilhado por vários servidores de aplicação, em vez de cada um ter o seu. Redis e Memcached são dois sistemas muito usados para isso: armazenam pares chave-valor em memória, acessados pela rede. Acerto (hit) é achar o dado no cache; falha (miss) é não achar e precisar ir à fonte.'
          ),
          sl(
            'Cache-aside',
            'No cache-aside (carregamento preguiçoso), a aplicação cuida de tudo: primeiro consulta o cache; se houver hit, usa; se houver miss, lê do banco, grava no cache e devolve. Na escrita, atualiza o banco e invalida ou atualiza a entrada do cache. É o padrão mais comum e simples; o cache só guarda o que foi pedido. O custo é que a primeira leitura é lenta e a aplicação é responsável por manter o cache coerente.',
            'db = {\'p1\': \'Caneta\'}; cache = {}; idas_ao_banco = []\ndef get(k):\n    if k in cache:\n        return cache[k]\n    idas_ao_banco.append(k)\n    cache[k] = db[k]\n    return cache[k]\nprint(get(\'p1\'), get(\'p1\'), len(idas_ao_banco))  # Caneta Caneta 1'
          ),
          sl(
            'Read-through, write-through e write-back',
            'Read-through: a própria camada de cache busca no banco quando há miss (a aplicação só fala com o cache). Write-through: cada escrita grava no cache e no banco juntos, antes de confirmar; mantém ambos alinhados, mas a escrita é mais lenta. Write-back (ou write-behind): a escrita vai ao cache e é confirmada na hora, e o banco é atualizado depois, em segundo plano; é rápido, mas se o cache cair antes de gravar no banco, as escritas pendentes se perdem. Há um equilíbrio entre velocidade e segurança dos dados.'
          ),
          sl(
            'TTL e invalidação',
            'TTL (Time To Live) é o tempo de validade de uma entrada: passado esse tempo, ela expira e é refeita no próximo acesso. É a rede de segurança contra dado velho para sempre. Invalidação é remover ou atualizar a entrada quando o dado original muda. É famosamente difícil: é preciso saber TODAS as entradas afetadas por uma mudança, em todos os nós do cache, e a ordem das operações pode deixar um valor antigo gravado depois do novo. Costuma-se combinar invalidação explícita com um TTL razoável.'
          ),
          sl(
            'Cache stampede e chaves quentes',
            'Cache stampede (ou thundering herd): uma entrada muito acessada expira e, no mesmo instante, centenas de requisições dão miss e vão todas ao banco para recalcular o mesmo dado, podendo derrubá-lo. Defesas: deixar só uma requisição recalcular enquanto as outras esperam, renovar o valor antes de expirar, e variar um pouco os TTLs para não expirar tudo junto. Chave quente (hot key): uma única chave recebendo muito mais tráfego que as outras sobrecarrega o nó do cache que a guarda, mesmo que o conjunto esteja folgado; pode-se replicar a chave em vários nós ou guardar uma cópia local por pouco tempo.'
          ),
          sl(
            'Consistência com o banco e o que não cachear',
            'Cache e banco são duas cópias do dado, então podem divergir: o cache pode ficar atrasado. Isso é aceitável para um contador de visualizações, mas não para o saldo de uma conta. Decida cache por cache o quanto de defasagem é tolerável. Cuidado também com o que se guarda: dados sensíveis ou pessoais (documentos, senhas, tokens de autenticação, dados de saúde) só em cache com real necessidade, minimização, TTL curto, controle de acesso e criptografia; um cache sem proteção é uma cópia a mais para vazar, e pode atrapalhar pedidos de exclusão de dados (LGPD). Nunca misture dados de usuários diferentes sob a mesma chave.'
          )
        ]
      },
      questions: [
        mcq('q1', 'No padrão cache-aside, o que a aplicação faz ao ter um miss no cache?', 'a', [
          'Lê do banco, grava o resultado no cache e devolve o dado',
          'Devolve um erro ao usuário e não tenta mais nenhuma outra fonte de dados',
          'Apaga o banco e recria tudo a partir do cache',
          'Espera o cache preencher sozinho'
        ], 'Na cache-aside a aplicação orquestra: consulta o cache, no miss busca na fonte e preenche o cache.'),
        mcq('q2', 'Qual é o risco típico do write-back (write-behind)?', 'd', [
          'A escrita fica sempre mais lenta que no write-through, pois espera o banco e o cache juntos',
          'O banco guarda dados em duplicidade',
          'O cache nunca expira',
          'Se o cache falhar antes de gravar no banco, escritas confirmadas podem ser perdidas'
        ], 'A velocidade vem de adiar a gravação no banco, o que cria uma janela de perda.'),
        mcq('q3', 'Qual é a função do TTL em uma entrada de cache?', 'c', [
          'Aumentar o tamanho do cache',
          'Criptografar a entrada',
          'Definir o tempo de validade, após o qual a entrada expira e é refeita',
          'Ligar o cache ao banco automaticamente'
        ], 'O TTL é uma rede de segurança contra dado desatualizado para sempre.'),
        fill('q4', 'No padrão em que a aplicação consulta o cache, e em caso de miss lê do banco e preenche o cache, o nome é cache-___.', 'cache-___', ['aside', 'cache-aside', 'cache aside'], 'Cache-aside é o padrão mais comum, também chamado de carregamento preguiçoso.'),
        mcq('q5', 'Uma entrada muito acessada expira e centenas de requisições vão ao banco ao mesmo tempo para recalcular o mesmo dado. Como se chama esse fenômeno?', 'c', [
          'Partição de rede entre os nós do cache',
          'Sticky session no balanceador',
          'Cache stampede (thundering herd)',
          'Replicação síncrona'
        ], 'A expiração simultânea gera uma avalanche de misses sobre a fonte.'),
        mcq('q6', 'Uma única chave concentra grande parte do tráfego e sobrecarrega o nó do cache que a guarda. O que é isso e uma possível defesa?', 'a', [
          'Chave quente; replicar a chave em vários nós ou manter cópia local por pouco tempo',
          'Cache stampede; aumentar o TTL para o infinito e nunca mais invalidar nenhuma entrada',
          'Falha bizantina; reiniciar o banco',
          'Escala vertical; desligar o cache'
        ], 'Mesmo com o conjunto folgado, um nó com a chave quente vira gargalo.'),
        mcq('q7', 'Qual é a prática mais adequada para dados pessoais sensíveis em um cache distribuído?', 'd', [
          'Guardá-los por tempo indefinido para maximizar os acertos',
          'Usar a mesma chave para todos os usuários, por simplicidade',
          'Deixar o cache aberto na rede para facilitar o acesso',
          'Evitar cachear; se necessário, minimizar, usar TTL curto, controle de acesso e criptografia'
        ], 'O cache é mais uma cópia dos dados: exige as mesmas proteções e pode interferir em pedidos de exclusão.'),
        fill('q8', 'Qual é a sigla, em inglês, do tempo de validade de uma entrada de cache (Time To Live)?', 'sigla: ___', ['TTL', 'ttl'], 'TTL define quando a entrada expira, limitando o tempo de um valor desatualizado.')
      ]
    },
    {
      id: 'cdb-31-sistemas-reais-dns-cdn-web',
      title: 'Sistemas distribuídos que você já usa: DNS, CDN e a Web',
      goal: 'Ver falhas parciais, cache e consistência eventual em três sistemas do dia a dia: o DNS, as CDNs e a própria Web.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'DNS: a agenda de nomes da internet',
            'Computadores se acham por números (endereços IP), mas pessoas lembram nomes como loja.exemplo.com.br. O DNS (Domain Name System) traduz nome em endereço. Ele não é um servidor gigante: é um dos maiores sistemas distribuídos do mundo, com milhões de servidores operados por organizações diferentes, sem um dono único. Cada servidor sabe só a sua parte e sabe apontar para quem sabe o resto.',
            'nome  : loja.exemplo.com.br\nresposta: 192.0.2.10   (endereço de documentação)'
          ),
          sl(
            'A hierarquia e a delegação',
            'O DNS é uma árvore. No topo ficam os servidores raiz, que sabem apenas quem cuida de cada final (TLD), como .com ou .br. Os servidores do TLD sabem quem cuida de cada domínio abaixo dele (exemplo.com.br). Os servidores autoritativos do domínio guardam a resposta final (o IP de loja.exemplo.com.br). Esse repasse de responsabilidade, "quem manda no que está abaixo de mim", chama-se delegação. Quem faz a pergunta passo a passo é o resolvedor recursivo, normalmente o do seu provedor de internet ou um serviço público escolhido por você.',
            'resolvedor --> raiz        : "quem cuida de .br?"\nresolvedor --> servidor .br : "quem cuida de exemplo.com.br?"\nresolvedor --> autoritativo : "qual o IP de loja.exemplo.com.br?"'
          ),
          sl(
            'Cache com TTL e consistência eventual',
            'Se cada acesso a um site exigisse percorrer a árvore, o DNS não aguentaria. Por isso o resolvedor guarda a resposta em cache por um tempo definido pelo dono do domínio: o TTL (time to live). Enquanto o TTL não vence, o resolvedor responde do cache sem perguntar a ninguém. O efeito colateral: se o dono muda o IP, quem tem a resposta antiga em cache continua recebendo o endereço velho até o TTL acabar. A mudança "se propaga" aos poucos: é consistência eventual, a mesma ideia de réplicas que convergem com o tempo.',
            'TTL = 300 s\nt=0   : resolvedor pergunta e recebe 192.0.2.10 (guarda)\n(dono troca o IP para 192.0.2.20)\nt=100 : resolvedor responde 192.0.2.10 (cache, desatualizado)\nt=301 : cache vencido, pergunta de novo e recebe 192.0.2.20'
          ),
          sl(
            'Replicação, anycast e falha parcial no DNS',
            'Um domínio costuma ter mais de um servidor autoritativo, em lugares diferentes, com os mesmos dados (replicação). Se um cai, os resolvedores tentam outro: é a falha parcial sendo absorvida, e o usuário nem percebe. Para ficar perto de quem pergunta, muitos serviços usam anycast: o MESMO endereço IP é anunciado por várias máquinas em lugares distintos e a rede entrega cada pergunta ao ponto mais próximo. Você pode ver o resultado com ferramentas simples: nslookup loja.exemplo.com.br ou dig loja.exemplo.com.br mostram o IP devolvido (e o dig também mostra o TTL restante).'
          ),
          sl(
            'CDN: cópias perto do usuário',
            'Uma CDN (Content Delivery Network) é uma rede de servidores de borda espalhados pelo mundo. O site original, chamado origem, fica em um lugar; a borda guarda cópias (cache) de arquivos e responde ao usuário a partir do ponto mais próximo, com menos latência e menos carga na origem. Na primeira vez que alguém pede um arquivo, a borda busca na origem e guarda; os próximos pedidos saem da cópia. O que cacheia bem: conteúdo igual para todo mundo (imagens, vídeos, scripts, estilos, páginas públicas). O que NÃO deve ser cacheado de forma compartilhada: respostas personalizadas, como a página da conta de um usuário, pois outra pessoa poderia receber a cópia errada.'
          ),
          sl(
            'Invalidação (purge) e TTL na CDN',
            'Cada cópia na borda também tem TTL: ela vale por um tempo e depois é buscada de novo na origem. Se você publica uma versão nova do arquivo, mas a borda ainda tem a antiga dentro do TTL, os usuários veem a velha (outra vez consistência eventual). Para forçar a troca, existe a invalidação, também chamada purge: você manda a CDN descartar a cópia, e o próximo pedido busca a versão nova. Outra técnica comum é mudar o nome do arquivo a cada versão (por exemplo, estilo-v2.css), que vira um objeto novo e dispensa o purge.'
          ),
          sl(
            'A Web: URLs, HTTP sem estado, cookies e privacidade',
            'A Web também é distribuída: uma URL aponta para um servidor que você não controla, e a página reúne pedaços vindos de vários lugares. O HTTP é um protocolo sem estado: cada requisição chega ao servidor sozinha, sem memória das anteriores. Para lembrar quem é você (login, carrinho), o servidor manda um cookie, um pequeno texto com um identificador de sessão que o navegador devolve em todo pedido. O cache HTTP, controlado por cabeçalhos como Cache-Control, diz por quanto tempo navegador e intermediários podem reutilizar uma resposta. Privacidade: o resolvedor DNS vê todos os nomes que você consulta, o que revela quais sites você visita; por isso é dado sensível do ponto de vista de privacidade (a LGPD trata o que identifica pessoa, inclusive hábitos de navegação associados a ela). Escolha resolvedores confiáveis, prefira DNS criptografado quando disponível e trate logs de consultas como dados pessoais, guardando o mínimo pelo menor tempo possível.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um resolvedor recursivo precisa descobrir o IP de loja.exemplo.com.br sem nada em cache. Qual é a ordem típica das consultas?', 'c', [
          'Servidor autoritativo do domínio, depois o raiz e por fim o servidor do TLD',
          'Servidor do TLD, depois o autoritativo e por fim o raiz, que confirma o resultado',
          'Raiz, depois o servidor do TLD (.br) e por fim o autoritativo do domínio',
          'Só o servidor raiz, que guarda o IP de todos os nomes do mundo'
        ], 'A delegação desce a árvore: a raiz aponta para o TLD, o TLD aponta para o autoritativo, que tem a resposta final.'),
        mcq('q2', 'O TTL de um registro é 300 s. O dono troca o IP no segundo 10, e um resolvedor que consultou no segundo 0 recebe um pedido no segundo 100. O que ele responde?', 'a', [
          'O IP antigo, pois ainda está no cache e o TTL não venceu',
          'O IP novo, pois o DNS avisa todos os caches no instante da troca',
          'Um erro, porque o registro mudou no meio do período do TTL',
          'O IP novo, porque o resolvedor sempre confere o autoritativo a cada pedido'
        ], 'Enquanto o TTL não vence, o cache responde sem perguntar de novo. É a consistência eventual: a mudança só chega a todos depois que os caches expiram.'),
        mcq('q3', 'Um domínio tem dois servidores autoritativos com os mesmos dados, em regiões diferentes, e um deles fica fora do ar. O que acontece com a resolução?', 'd', [
          'Todas as consultas falham, pois o DNS exige que todos os servidores estejam no ar',
          'O domínio fica indisponível até que o servidor caído volte a funcionar',
          'Os dados dos dois servidores são perdidos e precisam ser recriados',
          'Os resolvedores usam o outro servidor, e a falha parcial passa quase despercebida'
        ], 'Replicar o autoritativo permite absorver a falha parcial: se um não responde, o resolvedor tenta o outro.'),
        fill('q4', 'O tempo durante o qual um resolvedor ou uma borda pode reutilizar uma resposta guardada em cache chama-se ___ (sigla de time to live).', 'tempo de vida em cache: ___', ['TTL', 'ttl'], 'O TTL define a validade da cópia em cache; depois dele a resposta é buscada de novo na fonte.'),
        mcq('q5', 'Uma CDN guarda cópias em servidores de borda. Qual conteúdo é um bom candidato a ser cacheado de forma compartilhada?', 'b', [
          'A página "minha conta", que mostra o saldo e os dados de quem está logado',
          'Uma imagem de produto que é igual para todos os visitantes do site',
          'A resposta de uma consulta que retorna dados de pedidos de um usuário específico',
          'Qualquer resposta que contenha um cookie de sessão, pois ele identifica o visitante'
        ], 'Conteúdo igual para todos é seguro de compartilhar. Conteúdo personalizado em cache compartilhado pode entregar dados de uma pessoa a outra.'),
        mcq('q6', 'Você publicou uma nova versão de um script, mas muitos usuários continuam recebendo a antiga porque a borda da CDN ainda a tem no cache. Qual é uma forma de resolver?', 'd', [
          'Reiniciar os computadores dos usuários, para que a conexão com a borda seja refeita',
          'Aumentar o TTL, para que a borda busque a versão nova mais cedo',
          'Trocar o endereço IP da origem, já que a borda guarda cópias por IP',
          'Invalidar (purge) a cópia na CDN ou publicar o arquivo com um nome novo'
        ], 'O purge descarta a cópia antiga; um nome novo cria um objeto diferente que não está em cache. Aumentar o TTL pioraria o problema.'),
        mcq('q7', 'Por que o resolvedor DNS é relevante para a privacidade?', 'a', [
          'Ele enxerga os nomes de domínio consultados, o que pode revelar hábitos de navegação',
          'Ele lê o conteúdo completo das páginas, inclusive formulários e senhas digitadas',
          'Ele não é relevante, já que consultas DNS nunca podem ser associadas a uma pessoa',
          'Ele só vê o endereço IP dos servidores raiz, sem nada sobre os sites acessados'
        ], 'O resolvedor vê quais nomes você pede (não o conteúdo das páginas). Isso expõe hábitos, então logs de consulta devem ser tratados como dados pessoais.'),
        fill('q8', 'O HTTP não guarda memória entre requisições; por isso se diz que ele é um protocolo sem ___, e o servidor usa cookies para lembrar da sessão.', 'HTTP: protocolo sem ___', ['estado', 'estados', 'sem estado'], 'Sem estado: cada requisição é independente. O cookie com identificador de sessão devolve o contexto ao servidor.')
      ]
    },
    {
      id: 'cdb-13-tempo-relogios',
      title: 'Tempo e relógios',
      goal: 'Entender drift, skew, NTP, por que timestamps de máquinas diferentes enganam, happened-before, relógios lógicos e a diferença entre time.monotonic e time.time.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Relógios físicos, drift e skew',
            'Cada computador tem um relógio de hardware que conta o tempo com um oscilador, e osciladores não são perfeitos: alguns correm um pouco mais rápido e outros mais devagar. Drift (deriva) é essa taxa de erro: o relógio se afasta do tempo real ao longo do tempo. Skew (desvio) é a diferença, em um dado instante, entre os relógios de duas máquinas. Mesmo que dois relógios comecem iguais, o drift cria skew com o passar das horas.'
          ),
          sl(
            'NTP em visão geral',
            'O NTP (Network Time Protocol) é o protocolo que sincroniza relógios pela rede, consultando servidores de tempo mais precisos e ajustando o relógio local. Ele reduz o skew, mas não o elimina: depende da latência da rede (que varia), tem erro residual e pode corrigir o relógio em saltos ou aos poucos. Logo, relógios sincronizados com NTP estão "quase" de acordo, nunca exatamente. O erro típico é pequeno para o dia a dia, mas grande demais para decidir a ordem de eventos muito próximos.'
          ),
          sl(
            'Por que não ordenar eventos por timestamp de máquinas diferentes',
            'Imagine dois nós registrando eventos com a hora de seus relógios. Se o relógio do nó B está alguns milissegundos adiantado em relação ao A, um evento que ocorreu DEPOIS em A pode receber um timestamp MENOR do que o evento anterior de B. Ordenar por esses timestamps coloca a história de cabeça para baixo: um "efeito" aparece antes da "causa". Em sistemas que escolhem o "vencedor" de duas escritas pela hora mais recente, isso pode descartar a escrita certa. Timestamps de relógios diferentes servem para registro humano, não para decidir causalidade.',
            'A (relógio certo): evento 1 às 10:00:00.100\nB (relógio +50 ms): evento 2 às 10:00:00.130 (real: 10:00:00.080)\nordenando por timestamp: 1 antes de 2   (mas na realidade 2 veio antes de 1)'
          ),
          sl(
            'Aconteceu antes (happened-before)',
            'Como o tempo físico engana, usa-se a noção de causalidade. O evento a "aconteceu antes" de b (a → b) se: (1) a e b estão no mesmo processo e a veio primeiro; ou (2) a é o envio de uma mensagem e b é o recebimento dessa mesma mensagem; ou (3) por transitividade, a → c e c → b. Dois eventos sem nenhuma dessas ligações são concorrentes: nenhum pode ter influenciado o outro, e não há ordem "verdadeira" entre eles. Isso só depende de mensagens, não de relógios.'
          ),
          sl(
            'Relógios lógicos (apresentação)',
            'Um relógio lógico não mede horas, e sim ordem causal. O mais simples é o relógio de Lamport: cada processo tem um contador; a cada evento local, incrementa; ao enviar, anexa o contador à mensagem; ao receber, o contador passa a ser max(contador local, contador da mensagem) + 1. Garantia: se a → b, então o contador de a é menor que o de b. A volta não vale: contador menor não prova que veio antes (podem ser concorrentes). No nível intermediário veremos isso e os relógios vetoriais em detalhe.',
            'a = 0; a += 1          # evento em A: contador 1, envia msg(1)\nb = 0; b = max(b, 1) + 1  # B recebe: max(0, 1) + 1\nprint(a, b)  # 1 2'
          ),
          sl(
            'time.monotonic vs time.time e o UTC',
            'No Python, time.time() devolve a hora da parede (segundos desde 1970 em UTC), que pode ser ajustada pelo NTP ou por alguém, até voltar no tempo: não é seguro para medir quanto algo durou. time.monotonic() devolve um contador que só avança, nunca retrocede e não é afetado por ajustes do relógio, ótimo para medir durações e timeouts, mas seus valores só fazem sentido como diferença dentro do mesmo processo. Para registrar QUANDO algo ocorreu em logs e dados, guarde sempre em UTC (que não tem fuso nem horário de verão) e converta para o fuso local só ao exibir.',
            'import time\nt0 = time.monotonic()\ntime.sleep(0.1)\nduracao = time.monotonic() - t0   # use monotonic para durações\n# time.time() serve para "que horas são" (em UTC), não para cronometrar'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a diferença entre drift e skew?', 'd', [
          'Drift é a diferença entre os relógios de duas máquinas; skew é a taxa de erro de um relógio ao longo do tempo, medida em partes por milhão',
          'Drift só ocorre em redes; skew só ocorre em um único computador',
          'Os dois termos significam a mesma coisa',
          'Drift é o afastamento gradual de um relógio em relação ao tempo real; skew é a diferença entre dois relógios num instante'
        ], 'Drift é a taxa de erro de um relógio; skew é a diferença medida entre dois deles.'),
        mcq('q2', 'Por que ordenar eventos de duas máquinas pelos seus timestamps locais é perigoso?', 'c', [
          'Porque timestamps não podem ser comparados em Python',
          'Porque o NTP sempre deixa os relógios exatamente iguais, o que confunde a ordem, e a ordem passa a depender só da rede',
          'Porque o skew pode fazer um evento posterior receber timestamp menor e inverter a causalidade',
          'Porque todos os relógios andam para trás'
        ], 'Relógios diferentes não concordam exatamente; a ordem por timestamp pode contrariar a ordem real.'),
        mcq('q3', 'Pela relação "aconteceu antes", qual é um caso em que a → b?', 'b', [
          'a e b ocorreram em máquinas diferentes sem trocar nenhuma mensagem',
          'a é o envio de uma mensagem e b é o recebimento dessa mesma mensagem',
          'a tem timestamp menor que b, em relógios de máquinas distintas',
          'a e b são eventos concorrentes'
        ], 'Envio antecede o recebimento da mesma mensagem. Sem ligação causal, os eventos são concorrentes.'),
        fill('q4', 'Em Python, para medir quanto tempo uma operação levou, sem ser afetado por ajustes do relógio, usa-se time.___().', 'time.___()', ['monotonic', 'time.monotonic', 'monotonic()', 'time.monotonic()'], 'monotonic só avança; time.time() pode ser ajustado e até voltar.'),
        mcq('q5', 'O que o NTP faz e qual é a sua limitação?', 'c', [
          'Elimina totalmente o skew, deixando os relógios idênticos em qualquer condição de rede ou de carga',
          'Criptografa as mensagens entre os nós',
          'Sincroniza relógios pela rede e reduz o skew, mas com erro residual que depende da latência',
          'Substitui os relógios de hardware por relógios lógicos'
        ], 'Sincroniza, mas nunca de forma exata; por isso não serve para ordenar eventos muito próximos.'),
        mcq('q6', 'Em um relógio de Lamport, o nó B tem contador 5 e recebe uma mensagem com contador 9. Qual passa a ser o contador de B?', 'a', [
          '10',
          '9',
          '6',
          '14'
        ], 'Regra: max(5, 9) + 1 = 10.'),
        mcq('q7', 'Qual é a melhor prática para registrar quando um evento aconteceu em dados e logs de um sistema distribuído?', 'd', [
          'Guardar sempre no fuso horário local de cada servidor, com o horário de verão aplicado',
          'Usar time.monotonic() como data do evento',
          'Guardar o horário de verão de cada região no dado',
          'Guardar em UTC e converter para o fuso local apenas ao exibir'
        ], 'UTC é uma referência única, sem fuso nem horário de verão; a conversão fica para a apresentação.'),
        fill('q8', 'Como se chama o afastamento gradual de um relógio físico em relação ao tempo real, causado pela imperfeição do oscilador (em inglês, drift)?', 'drift = ___', ['deriva', 'drift'], 'O drift faz relógios que começam iguais se distanciarem com o tempo.')
      ]
    },
    {
      id: 'cdb-32-identificadores-unicos',
      title: 'Identificadores únicos em sistemas distribuídos',
      goal: 'Entender por que contadores simples falham entre nós e como UUIDs, IDs ordenáveis por tempo e faixas de IDs resolvem isso, com seus riscos.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O problema: um contador por nó',
            'Todo registro precisa de um identificador (ID) único: pedido, usuário, mensagem. Em um só banco, o AUTO_INCREMENT resolve: um contador central entrega 1, 2, 3... Com vários nós gravando ao mesmo tempo, cada nó teria seu próprio contador, e os dois criariam o pedido de número 8. Duas coisas diferentes com o mesmo ID viram conflito e dado misturado. Centralizar o contador resolve, mas cria um ponto único de falha e um gargalo (todo nó precisa perguntar a ele a cada ID). O desafio é gerar IDs únicos SEM coordenação a cada geração.',
            'nó A: contador 7 -> cria pedido 8\nnó B: contador 7 -> cria pedido 8   <-- conflito!'
          ),
          sl(
            'UUID: 128 bits gerados sem coordenação',
            'Um UUID é um número de 128 bits, escrito normalmente em 32 dígitos hexadecimais com hífens (exemplo fictício: 123e4567-e89b-12d3-a456-426614174000). Existem versões. A versão aleatória (v4) preenche quase todos os bits com números aleatórios. As versões baseadas em tempo (como a v7) colocam um carimbo de tempo nos primeiros bits e aleatoriedade no resto. Cada nó gera seus UUIDs sozinho, sem falar com ninguém. A colisão (dois iguais) não é impossível em teoria, mas o espaço é tão imenso que a chance é desprezível na prática, muito menor que a chance de uma falha de hardware. Em troca, UUIDs são longos e, no caso aleatório, não têm ordem.'
          ),
          sl(
            'IDs ordenáveis por tempo: estilo Snowflake e ULID',
            'Muitas vezes queremos IDs que também sigam a ordem de criação (para listar "os mais recentes" ou para índices). A ideia do estilo Snowflake: um número formado por três campos colocados lado a lado: tempo (milissegundos), identificador do nó e sequência (um contador que reinicia a cada milissegundo, para quando o mesmo nó gera vários IDs no mesmo instante). Como o tempo vem nos bits mais altos, IDs mais novos são numericamente maiores. Como cada nó tem seu próprio número, dois nós nunca produzem o mesmo ID. O ULID segue a mesma filosofia (tempo primeiro, depois aleatoriedade) em formato de texto. Veja um gerador simples.',
            'class Gerador:\n    def __init__(self, no):\n        self.no = no\n        self.ultimo_ms = -1\n        self.seq = 0\n    def novo_id(self, agora_ms):\n        if agora_ms < self.ultimo_ms:\n            raise RuntimeError(\'relogio voltou\')\n        if agora_ms == self.ultimo_ms:\n            self.seq += 1\n        else:\n            self.ultimo_ms = agora_ms\n            self.seq = 0\n        return (agora_ms << 22) | (self.no << 12) | self.seq\n\ng = Gerador(3)\na = g.novo_id(1000)\nb = g.novo_id(1000)\nc = g.novo_id(1001)\nprint(a, b, c)  # 4194316288 4194316289 4198510592\nprint(a < b < c)  # True'
          ),
          sl(
            'Lendo o gerador',
            'O "<< 22" empurra o tempo para a esquerda, deixando 22 bits livres embaixo. Os 10 bits do meio guardam o nó (aqui, 3) e os 12 bits de baixo guardam a sequência. Os IDs a e b nasceram no mesmo milissegundo (1000) e no mesmo nó: só a sequência difere (0 e 1). O ID c é de um milissegundo posterior e fica maior ainda. Se outro nó (digamos, 4) gerasse um ID no milissegundo 1000, o campo do nó diferenciaria. Note a ordem: IDs de nós diferentes só são ordenados "por aproximadamente o tempo", porque os relógios dos nós não são perfeitamente sincronizados.'
          ),
          sl(
            'Faixas por nó e serviço de alocação; relógio para trás',
            'Outra alternativa, ainda sequencial: um serviço de alocação entrega a cada nó uma faixa de números (o nó A recebe de 1000 a 1999, o B de 2000 a 2999). Cada nó gasta a sua faixa localmente, sem falar com ninguém, e só volta ao serviço quando acaba. Não há duplicatas; se um nó cai com sobra, aquele pedaço fica sem uso (IDs puláveis, sem problema). Uma variante é dividir por regra, como nó A usando só pares e B só ímpares. Já os IDs baseados em tempo têm um perigo: se o relógio do nó salta para trás (ajuste do relógio, correção de sincronização), o gerador pode repetir um tempo já usado e emitir IDs duplicados. Por isso o gerador acima recusa (ou espera) quando o tempo recua.'
          ),
          sl(
            'IDs são dados: previsibilidade e enumeração',
            'Um ID não é só um rótulo; ele vaza informação. Se as URLs são /pedido/1001, /pedido/1002, qualquer pessoa adivinha o vizinho e testa números em sequência (enumeração), além de descobrir o volume do negócio (quantos pedidos por dia). Defesas: use IDs opacos (aleatórios, sem significado) em URLs expostas e, principalmente, SEMPRE verifique a autorização no servidor: ID imprevisível ajuda, mas não substitui checar se o usuário pode ver aquele recurso. E nunca use dado pessoal (CPF, e-mail, telefone) como identificador: ele ficaria copiado em logs, URLs, caches e índices em todo lugar, e é impossível de trocar se vazar (LGPD: minimização).'
          ),
          sl(
            'Unicidade, ordenação e desempenho de índices',
            'Unicidade e ordenação são propriedades diferentes. UUID aleatório é único, mas não ordenado; um contador é ordenado e único apenas dentro de um nó. IDs estilo Snowflake, ULID e UUID baseado em tempo entregam as duas (a ordenação é aproximada entre nós). Isso pesa no desempenho: bancos mantêm índices ordenados; inserir chaves sempre crescentes grava no fim do índice, de forma compacta. Chaves aleatórias caem em posições espalhadas, fazendo o banco mexer em muitas páginas e fragmentar o índice, o que costuma custar mais. Em contrapartida, IDs aleatórios distribuem bem a carga entre partições. Escolher é balancear: unicidade sem coordenação, ordem, tamanho, previsibilidade e carga.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Dois nós de um sistema têm, cada um, um contador sequencial próprio e criam pedidos ao mesmo tempo. Qual solução mantém números sequenciais sem duplicar?', 'b', [
          'Fazer os dois nós começarem do mesmo valor para ficarem sincronizados',
          'Dar a cada nó uma faixa própria de números, sem cruzamento',
          'Gerar o ID só depois que os dois nós terminarem a gravação',
          'Usar o horário local de cada nó, que nunca se repete entre máquinas'
        ], 'Faixas disjuntas (ou pares/ímpares) garantem que os conjuntos de números dos nós nunca se cruzem, sem coordenação a cada ID.'),
        mcq('q2', 'Qual afirmação sobre UUIDs é correta?', 'c', [
          'Cada UUID gerado precisa ser registrado em um serviço central para garantir que ninguém o repita',
          'A colisão é matematicamente impossível, e por isso nunca precisa ser considerada',
          'São números de 128 bits gerados sem coordenação, com chance de colisão desprezível na prática',
          'São sempre ordenados pela hora de criação, mesmo na versão aleatória'
        ], 'O espaço de 128 bits é tão grande que a colisão é improvável a ponto de ser ignorada na prática, mas não é "impossível". Não precisa de serviço central.'),
        mcq('q3', 'No gerador da lição, a = novo_id(1000) e b = novo_id(1000), ambos no nó 3. O que diferencia a de b?', 'a', [
          'Apenas o campo de sequência (0 e 1)',
          'O campo do nó, que muda a cada ID gerado',
          'O campo de tempo, pois cada chamada avança um milissegundo',
          'Nada: os dois IDs são iguais'
        ], 'Mesmo milissegundo e mesmo nó: só a sequência, que reinicia a cada novo milissegundo, evita o conflito. Por isso a < b.'),
        fill('q4', 'Em um ID estilo Snowflake, o número combina o tempo, o identificador do nó e um(a) ___ (contador que distingue IDs gerados no mesmo milissegundo).', 'ID = tempo | nó | ___', ['sequência', 'sequencia', 'contador'], 'A sequência diferencia vários IDs do mesmo nó no mesmo milissegundo.'),
        mcq('q5', 'O relógio de um nó que usa IDs baseados em tempo é ajustado e salta para trás. Qual é o risco, e a atitude adequada?', 'd', [
          'Nenhum risco: o tempo não influencia a unicidade dos IDs',
          'Os IDs ficam maiores, o que é inofensivo e dispensa qualquer cuidado',
          'O nó perde seu identificador e precisa ser recadastrado antes de voltar a operar',
          'Pode haver IDs duplicados; o gerador deve recusar ou esperar até o tempo alcançar o último valor usado'
        ], 'Voltar no tempo pode repetir uma combinação tempo + sequência já usada. Recusar ou esperar evita duplicatas.'),
        mcq('q6', 'Um site expõe /fatura/5001, /fatura/5002 e assim por diante, e um visitante testa números vizinhos. Qual medida resolve o problema de fundo?', 'c', [
          'Esconder o endereço do servidor, de modo que ninguém consiga abrir a URL diretamente',
          'Trocar o contador por um contador maior, com mais dígitos, para dificultar a tentativa',
          'Verificar a autorização no servidor e usar IDs opacos e imprevisíveis nas URLs',
          'Usar o CPF do cliente como número da fatura, que ele já conhece'
        ], 'Enumeração é impedida de fato pela checagem de autorização; IDs opacos reduzem a adivinhação. CPF como ID seria um erro de privacidade.'),
        mcq('q7', 'Por que inserir UUIDs aleatórios como chave de um índice ordenado costuma ser mais custoso que inserir IDs crescentes?', 'b', [
          'Porque UUIDs ocupam menos espaço e o banco os comprime antes de gravar',
          'Porque as chaves caem espalhadas pelo índice e o fragmentam',
          'Porque o banco não consegue comparar valores hexadecimais sem convertê-los em texto toda vez',
          'Porque UUIDs aleatórios exigem um servidor central de alocação para cada inserção'
        ], 'Chaves crescentes são gravadas no fim do índice; as aleatórias espalham escritas e fragmentam. A vantagem do aleatório é distribuir carga.'),
        fill('q8', 'Para não vazar informação em URLs, prefira identificadores sem significado algum, chamados de IDs ___ (e nunca use CPF ou e-mail).', 'IDs ___ nas URLs', ['opacos', 'opaco', 'IDs opacos'], 'ID opaco não revela ordem, volume nem dado pessoal. Isso respeita a minimização da LGPD.')
      ]
    },
    {
      id: 'cdb-14-consistencia',
      title: 'Consistência',
      goal: 'Entender consistência forte e eventual, as anomalias que aparecem, as garantias de sessão e o custo da consistência forte.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que significa consistência aqui',
            'Em sistemas distribuídos, consistência trata de quando e como as várias cópias de um dado concordam, e do que um cliente pode observar ao ler depois de uma escrita. Atenção: não é a "consistência" do ACID em bancos de dados (que significa respeitar as regras de integridade, como chaves e restrições). Aqui a pergunta é: se eu escrevi um valor, o que eu, e os outros, vamos enxergar ao ler, em qualquer cópia?'
          ),
          sl(
            'Consistência forte',
            'Na consistência forte, o sistema se comporta como se existisse UMA única cópia do dado e as operações ocorressem uma de cada vez, em ordem: após uma escrita ser confirmada, toda leitura posterior, em qualquer lugar, vê esse valor (ou um mais novo). É o modelo mais fácil de programar e de raciocinar, e é o que se espera de um saldo bancário. O custo é coordenação: as cópias precisam combinar entre si antes de responder, o que adiciona latência e pode impedir respostas se nós não conseguem se falar.',
            'escreve saldo = 100 (confirmado)\nqualquer leitura depois: 100 (nunca o valor antigo)'
          ),
          sl(
            'Consistência eventual',
            'Na consistência eventual, as cópias podem divergir por um tempo, mas se ninguém escrever mais, todas convergem para o mesmo valor com o passar do tempo. Entre a escrita e a convergência, leituras podem devolver valores antigos e diferentes entre cópias. É mais rápida e disponível, pois cada cópia responde sem consultar as outras, e é uma escolha comum quando um atraso curto é tolerável. Exemplos: o contador de curtidas de uma foto, a contagem de visualizações, a lista de amigos "online".'
          ),
          sl(
            'Exemplos do dia a dia',
            'Placar de um jogo ao vivo: ver o gol com poucos segundos de atraso costuma ser aceitável (eventual). Carrinho de compras: um item adicionado deve aparecer para quem o adicionou; pequenas divergências entre dispositivos podem ser reconciliadas. Saldo bancário e estoque do último item: duas pessoas não podem gastar o mesmo dinheiro nem comprar a mesma unidade, então se exige forte. Curtidas: eventual é ótimo. A pergunta de projeto é: qual é o custo de mostrar um dado levemente velho?'
          ),
          sl(
            'Anomalias típicas',
            'Quando a consistência é fraca aparecem comportamentos estranhos. Ler dado antigo: você lê de uma cópia que ainda não recebeu a atualização. Não ver a própria escrita: você posta um comentário, recarrega e ele sumiu (a leitura foi a uma cópia atrasada). Ver o efeito antes da causa: alguém lê a RESPOSTA a uma pergunta antes de a PERGUNTA aparecer, porque as duas chegaram às cópias em ordens diferentes. Todas decorrem de cópias atualizadas em momentos diferentes e de falta de ordem causal.'
          ),
          sl(
            'Garantias de sessão e o custo da forte',
            'Entre os dois extremos há garantias de sessão, que dão ao usuário uma experiência sensata sem pagar o preço total da consistência forte. Read-your-writes: depois de escrever, você sempre lê pelo menos o que escreveu. Monotonic reads: depois de ver um valor, você nunca vê um mais antigo em leituras seguintes (sem "voltar no tempo"). Elas costumam ser obtidas direcionando a sessão a uma mesma cópia ou rastreando a versão que o cliente já viu. Quanto mais forte a garantia, mais coordenação, mais latência e menos disponibilidade em falhas de rede; por isso se escolhe a mais fraca que ainda atenda ao negócio.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a ideia central da consistência forte?', 'c', [
          'As cópias podem divergir indefinidamente, pois cada nó decide sozinho e nunca consulta nenhum outro nó',
          'O sistema nunca precisa de coordenação',
          'O sistema age como se houvesse uma única cópia, e após uma escrita confirmada toda leitura vê esse valor ou mais novo',
          'Cada nó guarda dados diferentes dos outros'
        ], 'É o modelo mais fácil de raciocinar, ao custo de coordenação entre cópias.'),
        mcq('q2', 'O que garante a consistência eventual?', 'a', [
          'Que, se ninguém escrever mais, todas as cópias acabam convergindo ao mesmo valor',
          'Que toda leitura devolve sempre o valor mais recente, em qualquer cópia, a qualquer momento',
          'Que as escritas nunca são perdidas por nenhum motivo',
          'Que as cópias nunca divergem em nenhum momento'
        ], 'Entre a escrita e a convergência há uma janela em que as cópias podem diferir.'),
        mcq('q3', 'Um usuário publica um comentário, recarrega a página e ele não aparece, pois a leitura foi atendida por uma cópia atrasada. Qual garantia de sessão foi violada?', 'd', [
          'Monotonic reads',
          'Consistência do ACID',
          'Transparência de localização',
          'Read-your-writes'
        ], 'Read-your-writes garante que o autor veja pelo menos a própria escrita.'),
        fill('q4', 'A garantia de sessão em que, após escrever, você sempre lê pelo menos o que escreveu, chama-se read-your-___.', 'read-your-___', ['writes', 'read-your-writes', 'write'], 'Read-your-writes é um dos pilares das garantias de sessão.'),
        mcq('q5', 'Um usuário vê o valor novo de um dado e, ao atualizar a página, vê o valor antigo, pois a leitura caiu em outra cópia. Qual garantia foi violada?', 'b', [
          'Read-your-writes',
          'Monotonic reads',
          'Consistência forte do saldo',
          'Idempotência'
        ], 'Monotonic reads impede o "voltar no tempo" entre leituras sucessivas.'),
        mcq('q6', 'Alguém lê a resposta a uma pergunta antes de a pergunta aparecer. Que anomalia é essa?', 'c', [
          'Dado antigo por TTL expirado em uma cópia do cache',
          'Falha de rede por duplicação de mensagem entre os nós',
          'Efeito antes da causa, por falta de ordem causal entre as cópias',
          'Perda total dos dados por falha simultânea de todas as cópias do sistema'
        ], 'As duas escritas chegaram em ordens diferentes a cópias diferentes.'),
        mcq('q7', 'Qual dado é o candidato mais adequado a exigir consistência forte?', 'a', [
          'O saldo de uma conta bancária',
          'O contador de curtidas de uma foto',
          'O número de visualizações de um vídeo',
          'A lista de usuários online'
        ], 'Duas pessoas não podem gastar o mesmo dinheiro; já contadores toleram um pequeno atraso.'),
        fill('q8', 'Em sistemas distribuídos, o modelo em que as cópias podem divergir por um tempo mas, sem novas escritas, convergem, é a consistência ___.', 'consistência ___', ['eventual'], 'Eventual troca garantia imediata por velocidade e disponibilidade.')
      ]
    },
    {
      id: 'cdb-15-teorema-cap',
      title: 'Teorema CAP',
      goal: 'Entender as definições corretas de C, A e P, a escolha real durante uma partição, sistemas CP e AP, mal-entendidos e PACELC.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'As três propriedades, com precisão',
            'O teorema CAP trata de um sistema distribuído que guarda dados replicados. C (consistência) aqui significa linearizabilidade: toda leitura devolve a escrita mais recente (ou um erro), como se houvesse uma única cópia. Não é a consistência do ACID. A (disponibilidade) significa que toda requisição feita a um nó que não falhou recebe uma resposta que não seja erro (sem garantir que seja a mais recente). P (tolerância a partição) significa que o sistema continua funcionando mesmo quando a rede perde ou atrasa mensagens entre grupos de nós.'
          ),
          sl(
            'O que o teorema diz de fato',
            'Se acontece uma partição de rede, o sistema não pode ao mesmo tempo ser consistente e disponível: precisa escolher. Imagine duas cópias que perderam contato e um cliente escreve em uma delas. Se a outra responder a leituras, entregará um valor desatualizado (perde C); se ela recusar ou esperar até a rede voltar, deixa de responder (perde A). Não existe truque para ter as duas coisas durante a partição.',
            'cópia 1 <-- X partição X --> cópia 2\nescrita na cópia 1; leitura na cópia 2:\n  responde (dado velho)  => escolheu A, perdeu C\n  recusa / aguarda       => escolheu C, perdeu A'
          ),
          sl(
            'Partições acontecem: a escolha é C ou A',
            'Redes reais perdem, atrasam e se dividem, então em um sistema distribuído a partição não é opcional: você não "escolhe não ter P". Logo a pergunta prática é: quando a partição ocorrer, o sistema prioriza C ou A? Sem partição, nada impede ter as duas ao mesmo tempo. Daí o resumo "escolha 2 de 3" ser enganoso: não se trata de abrir mão permanentemente de uma letra, e sim de decidir o comportamento NO MOMENTO de uma partição.'
          ),
          sl(
            'Sistemas CP e AP (conceitualmente)',
            'Um sistema CP prioriza consistência durante a partição: o lado que não consegue confirmar que tem os dados mais recentes (em geral o lado minoritário) recusa ou espera, ficando indisponível para aquelas operações. Combina com saldo bancário e estoque: melhor um erro temporário do que um valor errado. Um sistema AP prioriza disponibilidade: todos os nós continuam respondendo, possivelmente com dados desatualizados, e as divergências são reconciliadas depois. Combina com carrinho de compras e curtidas: melhor responder algo do que ficar fora do ar. É uma decisão por operação e por negócio.'
          ),
          sl(
            'Mal-entendidos comuns',
            'Primeiro: "escolha 2 de 3" como se fossem três botões equivalentes; na prática P não é opcional. Segundo: achar que o sistema é "CP" ou "AP" o tempo todo, quando o CAP só descreve o que acontece durante uma partição, e muitos sistemas permitem configurar por operação. Terceiro: confundir o C do CAP (linearizabilidade) com o C do ACID (integridade). Quarto: tratar disponibilidade no CAP como a "disponibilidade em noves" de SLA; são definições diferentes. Quinto: achar que o CAP fala de latência, o que ele não faz.'
          ),
          sl(
            'PACELC em visão geral',
            'O CAP só fala do caso de falha. O PACELC estende a ideia: se há Partição (P), escolha entre Disponibilidade e Consistência (A ou C); senão (Else, E), mesmo sem falhas, escolha entre Latência e Consistência (L ou C). Porque manter cópias fortemente consistentes exige coordenação entre elas, que leva tempo, então consistência mais forte quase sempre significa mais latência, mesmo em dias sem problemas. É um lembrete de que o dilema acompanha o sistema o tempo todo, não apenas nas falhas.',
            'PACELC: se Partição  -> A ou C\n        senão (Else) -> Latência ou Consistência'
          )
        ]
      },
      questions: [
        mcq('q1', 'No teorema CAP, o que significa "A" (disponibilidade)?', 'a', [
          'Todo pedido a um nó que não falhou recebe uma resposta que não seja erro',
          'Toda resposta é garantidamente a mais recente',
          'Nenhum nó pode falhar jamais',
          'O sistema está no ar 99,9% do ano'
        ], 'No CAP, disponibilidade é sobre responder, não sobre a resposta ser a mais recente, e não é a métrica de noves do SLA.'),
        mcq('q2', 'Durante uma partição de rede, o que o teorema CAP obriga a escolher?', 'd', [
          'Entre síncrono e assíncrono',
          'Entre latência e vazão',
          'Entre replicação e particionamento dos dados',
          'Entre consistência e disponibilidade'
        ], 'Com a partição ocorrendo, não se tem as duas ao mesmo tempo.'),
        mcq('q3', 'Um sistema CP sofre uma partição, e o lado minoritário não consegue confirmar que tem os dados mais recentes. O que ele faz tipicamente?', 'c', [
          'Responde livremente com os dados que tem, mesmo atrasados, e depois descarta as divergências',
          'Descarta todos os dados que possui',
          'Recusa ou espera nas operações afetadas, abrindo mão da disponibilidade',
          'Cria um novo líder sozinho e aceita todas as escritas'
        ], 'CP prefere erro a dado errado durante a partição.'),
        fill('q4', 'O "P" do CAP significa tolerância a ___ (de rede).', 'tolerância a ___ de rede', ['partição', 'particao', 'partições', 'particoes'], 'Partição é a divisão da rede em grupos de nós que não se comunicam.'),
        mcq('q5', 'Um carrinho de compras continua aceitando itens em ambos os lados de uma partição, e reconcilia as diferenças depois. Qual escolha isso representa?', 'b', [
          'CP, com consistência sobre disponibilidade',
          'AP, com disponibilidade sobre consistência durante a partição',
          'Nenhuma: o CAP não se aplica',
          'Consistência forte em todas as cópias'
        ], 'Continuar respondendo e reconciliar depois é o comportamento AP.'),
        mcq('q6', 'Por que "escolha 2 de 3" é uma simplificação enganosa do CAP?', 'd', [
          'Porque o CAP afirma que se pode ter os três juntos sempre, bastando usar mais servidores e replicação',
          'Porque P é opcional em qualquer rede',
          'Porque o CAP trata de latência, não de falhas',
          'Porque partições ocorrem em redes reais; a escolha efetiva é entre C e A, só durante a partição'
        ], 'Sem partição, C e A podem coexistir; durante uma, é preciso optar.'),
        mcq('q7', 'O que o PACELC acrescenta ao CAP?', 'a', [
          'Mesmo sem partição, há um compromisso entre latência e consistência',
          'Prova que consistência forte não custa nada',
          'Elimina a necessidade de escolher durante partições',
          'Substitui o conceito de disponibilidade por throughput e remove o conceito de partição'
        ], 'Coordenar cópias leva tempo: mais consistência significa mais latência, mesmo em dias normais.'),
        fill('q8', 'No PACELC, quando NÃO há partição (Else), o compromisso é entre latência e ___.', 'latência vs ___', ['consistência', 'consistencia'], 'Sem falhas, ainda se paga latência para obter consistência mais forte.')
      ]
    },
    {
      id: 'cdb-16-bancos-distribuidos-visao-geral',
      title: 'Bancos de dados distribuídos: visão geral',
      goal: 'Conhecer as famílias de bancos distribuídos, para que serve cada uma e como escolher pelo padrão de acesso e pelas garantias.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que existem bancos distribuídos',
            'Um banco em uma única máquina tem limites: o volume de dados pode não caber, as requisições podem passar do que ela aguenta, e se ela cair tudo para. Distribuir o banco ataca esses problemas com duas ferramentas que você já conheceu: replicação (cópias dos mesmos dados em vários nós, para disponibilidade e leitura) e particionamento (cada nó guarda uma fatia dos dados, para escalar volume e escrita). Cada família de banco combina essas ferramentas de um jeito e oferece garantias diferentes.',
            'um nó só:      [ tudo ]\nreplicado:     [ tudo ] [ tudo ] [ tudo ]   (cópias)\nparticionado:  [ A-H ]  [ I-P ]  [ Q-Z ]    (fatias)'
          ),
          sl(
            'Relacional replicado e particionado',
            'Bancos relacionais (tabelas, SQL, joins, transações) são a base de muita coisa. Eles podem ser replicados: um nó principal recebe as escritas e réplicas atendem leituras. Também podem ser particionados (sharding), por exemplo por cliente. O preço do particionamento aparece quando uma consulta ou transação precisa de dados de partições diferentes: joins e transações entre partições ficam mais caros e complicados. Nomes conhecidos de bancos relacionais: PostgreSQL e MySQL. Existem ainda bancos relacionais já projetados para serem distribuídos desde o início, que tentam esconder o particionamento de você.',
            'Particionado por cliente:\n  nó 1: clientes 1..1000\n  nó 2: clientes 1001..2000\n\nSELECT pedidos do cliente 7      -> 1 nó (barato)\nJOIN de clientes 7 e 1500        -> 2 nós (caro)'
          ),
          sl(
            'Chave-valor e documento',
            'Chave-valor é o modelo mais simples: você guarda um valor sob uma chave e busca pela chave exata, de forma muito rápida e fácil de particionar (a chave decide o nó). É ótimo para sessões, cache e contadores, e ruim para perguntas como "todos os valores em que tal campo é maior que X". Exemplos de nomes: Redis e DynamoDB. Banco de documentos guarda objetos JSON (documentos) completos, com estrutura flexível, e permite consultar por campos dentro do documento. Combina com dados que são lidos e gravados como um bloco só, como um pedido com seus itens. Exemplos: MongoDB e Couchbase.',
            'chave-valor:   sessao:abc123  ->  {usuario: 42, expira: ...}\ndocumento:     pedido 9001 -> {cliente: 42, itens: [{sku: "caneca", qtd: 2}], total: 59.8}'
          ),
          sl(
            'Coluna larga, grafo e séries temporais',
            'Coluna larga (wide-column): linhas identificadas por uma chave de partição e organizadas em muitas colunas flexíveis, pensadas para volumes enormes de escrita espalhados por muitos nós e consultas bem conhecidas de antemão. Exemplos: Cassandra e HBase. Grafo: guarda entidades (nós) e relações (arestas) e é excelente para perguntas de navegação, como amigos de amigos ou caminhos de recomendação, que seriam joins em cascata no relacional. Exemplo: Neo4j. Séries temporais: pontos (momento, valor) em grande quantidade, como medições de sensores ou métricas, otimizados para gravar em ordem de tempo e consultar por intervalo. Exemplos: InfluxDB e TimescaleDB.',
            'grafo:    (Ana)-[amiga]->(Bia)-[amiga]->(Caio)\nséries:   sensor-7 | 10:00:01 | 21.4\n          sensor-7 | 10:00:02 | 21.5'
          ),
          sl(
            'Modelagem orientada ao acesso',
            'No modelo relacional clássico você modela as entidades e depois pensa nas consultas. Em muitos bancos distribuídos é o contrário: você lista primeiro as consultas que a aplicação fará e desenha as estruturas para responder a cada uma delas de forma barata, normalmente lendo de uma única partição. Isso costuma levar a desnormalizar: copiar os mesmos dados em mais de uma estrutura para evitar joins entre nós. O custo é manter as cópias coerentes em cada escrita. A chave de partição é a decisão central: ela define em qual nó o dado fica e, portanto, quais consultas são baratas.',
            'Consulta: "pedidos de um cliente, mais novos primeiro"\n  chave de partição: cliente\n  ordenação:        data (decrescente)\n\nConsulta: "pedidos por status"\n  outra estrutura, com chave de partição: status'
          ),
          sl(
            'Como escolher: padrão de acesso e garantias',
            'Escolha pelo padrão de acesso (que perguntas serão feitas, com que frequência, leitura ou escrita pesada) e pelas garantias necessárias (precisa de transações? de leitura sempre atualizada? tolera dados levemente defasados? qual latência?), e não pela moda ou pelo que está em alta. É comum usar mais de um banco no mesmo sistema (persistência poliglota), cada um onde faz sentido: por exemplo relacional para pedidos e pagamentos, chave-valor para cache e sessões. Mas cada banco a mais é mais um sistema para operar e proteger; comece simples e só adicione quando uma necessidade real justificar.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Uma rede social precisa responder, com muitos saltos, "quem são os amigos dos amigos de Ana?". Que família de banco é a mais natural para esse padrão de acesso?', 'b', [
          'Chave-valor, buscando cada amigo pela chave exata em cascata',
          'Grafo, que guarda relações e navega por elas diretamente',
          'Séries temporais, organizando relações por instante de gravação',
          'Coluna larga, sem nenhuma estrutura para as relações'
        ], 'Navegar relações em vários saltos é o ponto forte do banco de grafo. No relacional isso viraria joins em cascata.'),
        mcq('q2', 'Um banco relacional foi particionado por cliente. Qual operação tende a ficar mais difícil e cara?', 'c', [
          'Buscar todos os pedidos de um único cliente, usando a chave de partição',
          'Gravar um novo pedido para um único cliente',
          'Fazer uma transação que altera clientes de partições diferentes',
          'Ler um cliente pela chave primária dele'
        ], 'Dentro de uma partição tudo é barato. Quando a operação cruza partições, é preciso coordenar vários nós, e joins e transações ficam mais caros.'),
        mcq('q3', 'O que significa modelar "orientado ao acesso"?', 'a', [
          'Listar antes as consultas e desenhar as estruturas para respondê-las',
          'Criar primeiro todas as tabelas normalizadas e só depois descobrir quais consultas elas permitem',
          'Escolher o banco que mais aparece em notícias e adaptar as consultas a ele',
          'Dar acesso de leitura a todos os usuários antes de definir os dados'
        ], 'Em muitos bancos distribuídos as consultas vêm primeiro; a estrutura (e a chave de partição) é escolhida para responder a elas, mesmo que isso duplique dados.'),
        fill('q4', 'Complete: medições de sensores gravadas a cada segundo e consultadas por intervalo de tempo combinam com a família de banco de...', 'Medições (momento, valor) em grande volume -> banco de ___', ['séries temporais', 'series temporais', 'série temporal', 'serie temporal', 'séries temporais (time series)'], 'Bancos de séries temporais são otimizados para gravar pontos em ordem de tempo e consultar por intervalo.'),
        mcq('q5', 'Qual é o melhor critério para escolher o banco de dados de um novo sistema?', 'd', [
          'Escolher o produto mais popular entre as empresas do momento',
          'Escolher sempre o banco que promete a maior escala possível',
          'Usar o mesmo banco do último projeto, sem rever as necessidades',
          'Entender o padrão de acesso e as garantias de consistência que o negócio exige'
        ], 'Padrão de acesso (que perguntas, que volume) e garantias (transações, consistência, latência) guiam a escolha. Moda e escala máxima desnecessária só trazem custo.'),
        mcq('q6', 'Você precisa guardar sessões de login e recuperar cada uma sempre pelo token exato, com latência baixa. Qual modelo é adequado?', 'a', [
          'Chave-valor, usando o token como chave',
          'Grafo, ligando tokens a usuários por arestas',
          'Documento, consultando por qualquer campo interno',
          'Séries temporais, indexando por hora do login'
        ], 'Busca por chave exata é o que o modelo chave-valor faz melhor, e a chave também facilita distribuir os dados entre nós.'),
        mcq('q7', 'Por que, em bancos de coluna larga como Cassandra, é preciso conhecer as consultas antes de modelar?', 'c', [
          'Porque eles não aceitam dados novos depois da criação das tabelas',
          'Porque as consultas são sempre feitas em linguagem SQL padrão',
          'Porque a chave de partição define em qual nó o dado fica e quais consultas ficam baratas',
          'Porque eles guardam apenas relações entre entidades, como um grafo, sem nenhuma chave de distribuição nos nós'
        ], 'A chave de partição decide a localização dos dados. Consultas que não a usam ficam caras ou inviáveis, então cada consulta importante ganha sua própria estrutura.'),
        fill('q8', 'Complete: para evitar joins entre nós, é comum copiar os mesmos dados em mais de uma estrutura, ou seja, ___.', 'Evitar joins entre partições -> ___ os dados (copiar campos)', ['desnormalizar', 'desnormalizá-los', 'desnormalizar os dados', 'desnormalização'], 'Desnormalizar troca espaço e esforço de manter cópias coerentes por consultas baratas em uma única partição.')
      ]
    },
    {
      id: 'cdb-17-filas-mensageria',
      title: 'Filas e mensageria',
      goal: 'Entender produtor/consumidor, fila e tópico, confirmação, entrega pelo menos uma vez, idempotência, DLQ e backpressure.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Produtor, consumidor e fila',
            'Uma fila de mensagens é um intermediário: o produtor coloca mensagens nela e o consumidor as retira para processar. Quem produz não chama o consumidor diretamente; só entrega a mensagem à fila e segue em frente. A fila guarda as mensagens até que alguém as processe. Exemplos de nomes: RabbitMQ, Amazon SQS, Kafka (que é mais um log de eventos, mas serve ao mesmo propósito geral).',
            'Produtor --> [ m3 | m2 | m1 ] --> Consumidor\n              (fila guarda)'
          ),
          sl(
            'Fila vs tópico (publicar/assinar)',
            'Em uma fila, cada mensagem é entregue a um único consumidor do grupo: se há três consumidores iguais, eles dividem o trabalho (bom para distribuir tarefas). Em um tópico (publicar/assinar), cada mensagem é entregue a todos os assinantes: uma cópia para cada um (bom para avisar vários interessados de que algo aconteceu). Um mesmo evento "pedido criado" pode ir para um tópico, e cada serviço interessado (estoque, e-mail, análise) recebe a sua cópia.',
            'FILA:   m1 -> consumidor A\n        m2 -> consumidor B   (cada uma para UM)\n\nTÓPICO: m1 -> assinante A\n        m1 -> assinante B    (cópia para TODOS)'
          ),
          sl(
            'Confirmação (ack) e reentrega',
            'Como a fila sabe que a mensagem foi processada? O consumidor envia uma confirmação (ack) depois de terminar. Se o ack não chega (o consumidor caiu, demorou demais), a fila presume que a mensagem não foi tratada e a reentrega, a você ou a outro consumidor. Isso protege contra perda: a mensagem só sai da fila depois do ack. Mas cria um efeito colateral importante, mostrado no próximo slide.'
          ),
          sl(
            'Pelo menos uma vez, duplicadas e consumidor idempotente',
            'Imagine que o consumidor processa a mensagem (cobra o cliente) e cai antes de enviar o ack. A fila reentrega, e a cobrança acontece de novo. Esse é o comportamento "entrega pelo menos uma vez" (at-least-once): nenhuma mensagem se perde, mas pode chegar repetida. A solução é o consumidor idempotente: processar a mesma mensagem duas vezes tem o mesmo efeito que processá-la uma vez, por exemplo guardando os ids das mensagens já tratadas e ignorando repetições. "Exatamente uma vez" não é uma garantia absoluta de entrega; na prática se obtém o EFEITO de uma vez somando entrega pelo menos uma vez com idempotência.',
            `fila = deque([('m1', 'cobrar pedido 10'), ('m2', 'cobrar pedido 11')])
ja_feitas = set()
while fila:
    id_msg, corpo = fila.popleft()
    if id_msg in ja_feitas:
        print('duplicada ignorada, mas confirmada (ack):', id_msg)
        continue
    print('processando:', id_msg, corpo)
    ja_feitas.add(id_msg)
    # (m1 simula queda aqui: reentra na fila sem ack)

# saída:
# processando: m1 cobrar pedido 10
# consumidor caiu antes do ack -> reentrega de m1
# processando: m2 cobrar pedido 11
# ack: m2
# duplicada ignorada, mas confirmada (ack): m1`
          ),
          sl(
            'Fila de mensagens mortas (DLQ)',
            'Algumas mensagens nunca darão certo: dados malformados, um bug, uma dependência que sumiu. Se a fila as reentregar para sempre, elas travam o trabalho e gastam recursos. A solução é limitar as tentativas: depois de N falhas, a mensagem é movida para a fila de mensagens mortas (DLQ, dead-letter queue). Lá ela fica guardada para análise humana, sem atrapalhar o resto. Monitore a DLQ: mensagem acumulando lá é sinal de problema. Cuidado: mensagens guardadas podem conter dados pessoais, então a DLQ também precisa de controle de acesso e prazo de retenção.',
            'fila principal --(falhou 5 vezes)--> fila de mensagens mortas (DLQ)\n                                     (análise manual depois)'
          ),
          sl(
            'Desacoplamento e backpressure',
            'A fila desacopla produtor e consumidor no tempo (o consumidor pode estar fora do ar por alguns minutos; as mensagens esperam) e na carga (um pico de pedidos vira uma fila longa que é consumida no ritmo possível, em vez de derrubar o consumidor). Mas se o produtor é sempre mais rápido que o consumidor, a fila cresce sem parar. Backpressure é o mecanismo de empurrar essa pressão de volta ao produtor: filas com tamanho limitado, rejeição ou espera ao publicar, ou limitar o ritmo de quem produz. A alternativa é aumentar o número de consumidores.'
          ),
          sl(
            'Ordenação em visão geral',
            'Garantir ordem global entre todas as mensagens é caro e limita o paralelismo. Com vários consumidores em paralelo, e com reentregas, a mensagem B pode ser processada antes da A mesmo tendo sido enviada depois. O que muitos sistemas oferecem é ordem por chave (ou por partição): todas as mensagens do mesmo pedido vão para a mesma partição e são tratadas em ordem por um único consumidor, enquanto pedidos diferentes correm em paralelo. Por isso, desenhe os consumidores para tolerar mensagens fora de ordem sempre que possível.',
            'chave = pedido 9001  -> partição 2 (sempre o mesmo consumidor)\nchave = pedido 9002  -> partição 5'
          )
        ]
      },
      questions: [
        mcq('q1', 'O consumidor processa uma mensagem, mas cai antes de enviar o ack. O que uma fila com entrega pelo menos uma vez faz?', 'd', [
          'Descarta a mensagem, pois ela já foi processada uma vez',
          'Apaga a mensagem e avisa o produtor para reenviar',
          'Move a mensagem direto para a fila de mensagens mortas',
          'Reentrega a mensagem, que pode ser processada de novo'
        ], 'Sem ack, a fila presume falha e reentrega. Isso evita perdas, mas pode gerar processamento duplicado.'),
        mcq('q2', 'Qual é a diferença básica entre fila e tópico (publicar/assinar)?', 'a', [
          'Na fila cada mensagem vai a um consumidor do grupo; no tópico, cada assinante recebe uma cópia',
          'Na fila as mensagens são cópias para todos; no tópico, cada mensagem vai a um único consumidor',
          'A fila só aceita mensagens de texto; o tópico aceita qualquer formato de dados',
          'A fila exige ack do consumidor; o tópico nunca permite nenhuma confirmação'
        ], 'Fila divide trabalho (uma mensagem, um consumidor). Tópico notifica vários interessados (uma cópia para cada assinante).'),
        mcq('q3', 'No código de exemplo, o que acontece quando m1 reaparece depois de já estar em ja_feitas?', 'c', [
          'Ela é processada de novo, cobrando o cliente duas vezes',
          'Ela é perdida, porque o id já existia no conjunto',
          'Ela é ignorada, sem novo efeito, e confirmada com ack para sair da fila',
          'Ela é movida para a DLQ por ser considerada inválida'
        ], 'O consumidor idempotente reconhece o id já tratado, não repete o efeito e confirma a mensagem para que saia da fila.'),
        fill('q4', 'Complete o nome da fila para onde vão as mensagens que falham repetidamente.', 'fila principal -> (falhou N vezes) -> fila de mensagens ___ (DLQ)', ['mortas', 'morta', 'mortas (dlq)'], 'DLQ significa dead-letter queue, a fila de mensagens mortas, guardada para análise sem travar o resto.'),
        mcq('q5', 'Qual é uma vantagem do desacoplamento no tempo proporcionado pela fila?', 'b', [
          'O consumidor passa a processar mensagens sempre na ordem global exata, mesmo com vários consumidores e reentregas',
          'O produtor pode publicar mesmo que o consumidor esteja fora do ar por um tempo',
          'As mensagens nunca podem chegar duplicadas ao consumidor final',
          'O produtor recebe o resultado do processamento imediatamente'
        ], 'As mensagens aguardam na fila até o consumidor voltar. Ordem global e ausência de duplicatas não são garantidas por isso.'),
        mcq('q6', 'Duas mensagens do mesmo pedido, A e depois B, são tratadas por dois consumidores em paralelo. O que pode ocorrer?', 'c', [
          'B nunca será processada antes de A, pois a fila garante ordem global',
          'A e B serão fundidas em uma só mensagem pelo broker antes de chegarem aos consumidores',
          'B pode ser processada antes de A, salvo se particionar por chave',
          'A será descartada por ser mais antiga que B'
        ], 'Paralelismo e reentregas podem inverter a ordem. Enviar o mesmo pedido sempre à mesma partição mantém a ordem para aquele pedido.'),
        mcq('q7', 'Qual afirmação sobre "exatamente uma vez" é a mais correta?', 'a', [
          'Entrega pelo menos uma vez somada à idempotência dá o efeito único',
          'É uma garantia absoluta que qualquer rede confiável entrega sem nenhum custo',
          'Significa que o consumidor nunca precisa enviar confirmação de recebimento',
          'Significa que mensagens duplicadas são impossíveis em qualquer cenário de falha, desde que o broker esteja configurado corretamente'
        ], 'Falhas podem forçar reentregas, então a garantia prática vem de tolerar duplicatas com idempotência.'),
        fill('q8', 'Complete: com entrega pelo menos uma vez, o consumidor precisa ser...', 'entrega pelo menos uma vez  =>  consumidor ___', ['idempotente', 'idempotentes', 'idempotente (idempotency)'], 'Consumidor idempotente produz o mesmo efeito mesmo recebendo a mensagem repetida.')
      ]
    },
    {
      id: 'cdb-18-padroes-comunicacao',
      title: 'Padrões de comunicação',
      goal: 'Distinguir os principais padrões de comunicação entre componentes e entender o acoplamento temporal.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Requisição/resposta',
            'O padrão mais comum: o cliente envia uma requisição e espera a resposta (HTTP, RPC). É simples de entender e depurar, e a resposta já traz o resultado. O custo: o chamador fica bloqueado esperando e depende de o outro lado estar disponível naquele momento; se ele estiver lento ou fora do ar, o problema se propaga para o chamador.',
            'cliente --GET /pedido/9001--> servidor\ncliente <---- 200 {...} ------- servidor'
          ),
          sl(
            'Publicar/assinar e notificação de evento',
            'No publicar/assinar, quem publica envia a mensagem a um tópico e não conhece os assinantes; novos assinantes podem entrar sem mudar o publicador. Na notificação de evento, a mensagem descreve algo que JÁ aconteceu ("PedidoCriado"), em vez de mandar alguém fazer algo (um comando, como "CobrarPedido"). O publicador apenas avisa; cada interessado decide o que fazer. Isso reduz o acoplamento entre serviços, ao custo de ser mais difícil enxergar o fluxo completo.',
            'evento:   PedidoCriado {id: 9001}   (aconteceu)\ncomando:  CobrarPedido  {id: 9001}   (faça isto)'
          ),
          sl(
            'Streaming',
            'No streaming, em vez de uma mensagem isolada, há um fluxo contínuo de dados entre os lados: eventos que chegam sem parar (leituras de sensores, cliques) ou respostas enviadas em partes conforme ficam prontas. O consumidor processa os itens à medida que chegam, sem esperar o conjunto completo. É diferente de requisição/resposta, em que há uma pergunta e uma única resposta.'
          ),
          sl(
            'Polling, long polling, WebSocket e SSE',
            'Como o cliente descobre novidades do servidor? Polling: o cliente pergunta de tempos em tempos "tem novidade?"; simples, mas gera muitas requisições vazias e atraso de até um intervalo. Long polling: o cliente pergunta e o servidor segura a requisição aberta até haver novidade (ou um tempo limite), respondendo na hora do evento. WebSocket: uma conexão persistente bidirecional (os dois lados enviam quando quiserem), ótima para chat e jogos. SSE (Server-Sent Events): conexão persistente em que só o servidor envia ao cliente, sobre HTTP comum; boa para notificações e painéis ao vivo.',
            'polling:       pergunta... nada. pergunta... nada. pergunta... sim!\nlong polling:  pergunta ......... (espera) ......... sim!\nWebSocket:     <------ conexão aberta, os dois falam ------>\nSSE:           <------ servidor fala, cliente escuta ------'
          ),
          sl(
            'Push vs pull',
            'Em pull, o consumidor busca os dados quando quer (polling, ou um consumidor que retira mensagens da fila no seu ritmo). Ele controla a velocidade e não é sufocado. Em push, o produtor envia assim que há dado (WebSocket, SSE, webhooks): a latência é baixa, mas se o produtor é mais rápido que o receptor, ele pode sobrecarregá-lo, a menos que haja controle de fluxo. Escolha pull quando o controle do ritmo importa e push quando a latência de notificação importa.'
          ),
          sl(
            'Síncrono vs assíncrono entre serviços e acoplamento temporal',
            'Comunicação síncrona: o chamador espera a resposta (acoplamento temporal: os dois precisam estar no ar ao mesmo tempo). Assíncrona: o chamador deixa uma mensagem e segue (via fila ou evento); o outro lado responde ou age quando puder. Em uma cadeia síncrona A chama B que chama C, a disponibilidade do conjunto é aproximadamente o produto das disponibilidades de cada parte (se as falhas forem independentes): com duas partes de 90% cada, a cadeia fica em 0,9 x 0,9 = 81%. Usar mensagens assíncronas entre etapas quebra essa dependência direta.',
            'síncrono:   A -> B -> C     (todos precisam estar no ar agora)\nassíncrono: A -> [fila] ... B -> [fila] ... C   (cada um no seu tempo)'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que é long polling?', 'c', [
          'O cliente pergunta a cada poucos segundos, sempre recebendo resposta imediata, mesmo quando não há novidade',
          'O servidor abre uma conexão para o cliente e envia dados nos dois sentidos',
          'O servidor mantém a requisição aberta até ter novidade ou estourar o tempo limite',
          'O cliente guarda todas as novidades localmente e nunca consulta o servidor'
        ], 'No long polling a resposta só vem quando há algo novo (ou no timeout), reduzindo requisições vazias em comparação ao polling simples.'),
        mcq('q2', 'Qual é a diferença principal entre WebSocket e SSE?', 'b', [
          'SSE é bidirecional e WebSocket só envia do servidor ao cliente',
          'WebSocket é bidirecional; no SSE só o servidor envia ao cliente',
          'Ambos exigem que o cliente faça polling a cada requisição enviada',
          'Nenhum dos dois usa conexão persistente entre cliente e servidor'
        ], 'WebSocket permite mensagens nos dois sentidos. SSE é um canal só do servidor para o cliente, sobre HTTP.'),
        mcq('q3', 'Uma chamada síncrona encadeia dois serviços independentes, cada um disponível 90% do tempo. Qual a disponibilidade aproximada da cadeia?', 'd', [
          '90%, pois a cadeia é tão disponível quanto a parte mais forte',
          '99%, pois a redundância soma as disponibilidades',
          '95%, pela média simples das duas disponibilidades',
          '81%, pois as disponibilidades se multiplicam: 0,9 x 0,9 = 0,81'
        ], 'Na cadeia síncrona todos precisam estar no ar ao mesmo tempo, então as probabilidades se multiplicam e a disponibilidade cai.'),
        fill('q4', 'Qual é o nome da técnica em que o cliente pergunta periodicamente ao servidor se há novidades?', 'cliente pergunta a cada 5 s: "tem novidade?"  =>  técnica chamada ___', ['polling', 'polling simples', 'short polling'], 'Polling é simples, mas gera requisições vazias e a novidade pode demorar até o próximo intervalo.'),
        mcq('q5', 'Qual benefício a notificação de evento ("PedidoCriado") traz em relação a um comando direto ("CobrarPedido")?', 'a', [
          'O publicador não precisa conhecer quem reage, o que reduz o acoplamento',
          'O publicador consegue garantir que todos os assinantes processem juntos',
          'O publicador recebe sempre o resultado do processamento dos assinantes',
          'O publicador deixa de depender de qualquer infraestrutura de mensagens'
        ], 'O evento apenas informa o que aconteceu. Novos assinantes entram sem alterar o publicador.'),
        mcq('q6', 'O que é acoplamento temporal?', 'd', [
          'Duas partes usarem a mesma linguagem de programação',
          'Duas partes compartilharem o mesmo banco de dados',
          'Duas partes terem o mesmo fuso horário configurado',
          'Duas partes dependerem de estar no ar juntas'
        ], 'Na comunicação síncrona, se o outro lado está fora do ar agora, o chamador falha. Filas e eventos reduzem esse acoplamento.'),
        mcq('q7', 'Um consumidor lento corre risco de ser sobrecarregado pelo produtor. Qual abordagem dá mais controle de ritmo a ele?', 'b', [
          'Push sem nenhum controle de fluxo, enviando tudo imediatamente',
          'Pull, no qual ele busca os dados quando está pronto para tratar mais',
          'Aumentar a frequência com que o produtor envia mensagens',
          'Remover qualquer confirmação do consumidor ao produtor, para acelerar a entrega de mensagens'
        ], 'No pull o consumidor decide quando buscar mais, então não é sufocado. Push sem controle pode sobrecarregá-lo.'),
        fill('q8', 'Complete: qual tecnologia mantém uma conexão persistente em que cliente e servidor enviam mensagens nos dois sentidos, ideal para chat?', 'Chat em tempo real, mensagens nos dois sentidos pela mesma conexão: ___', ['websocket', 'websockets', 'web socket'], 'WebSocket é a conexão persistente bidirecional, usada em chats, jogos e painéis interativos.')
      ]
    },
    {
      id: 'cdb-19-concorrencia-vs-distribuicao',
      title: 'Concorrência vs distribuição',
      goal: 'Entender condições de corrida, por que um lock local não protege vários processos e como operações atômicas e idempotentes ajudam.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Concorrência em um processo: threads e condição de corrida',
            'Threads de um mesmo processo compartilham a memória e podem executar de forma intercalada. Quando duas threads leem e alteram o mesmo dado sem coordenação, o resultado passa a depender da ordem exata em que elas se intercalam: isso é uma condição de corrida (race condition). O bug é traiçoeiro porque nem sempre aparece: pode funcionar mil vezes e falhar na milésima primeira.'
          ),
          sl(
            'Ler-modificar-escrever e a atualização perdida',
            'O padrão clássico do problema é ler-modificar-escrever: ler o valor, calcular o novo e gravar. Se duas threads leem o mesmo valor antes de qualquer uma gravar, ambas escrevem o mesmo resultado e uma atualização se perde. No exemplo, o sleep curto amplia a janela entre ler e escrever para o problema aparecer sempre. Quatro threads somando 1 cinquenta vezes deveriam chegar a 200.',
            `saldo = 0
def somar_sem_lock():
    global saldo
    for _ in range(50):
        lido = saldo          # ler
        time.sleep(0.0001)    # outra thread pode entrar aqui
        saldo = lido + 1      # modificar e escrever

# saída típica: somar_sem_lock 50 esperado 200 (o valor varia, mas fica abaixo de 200)`
          ),
          sl(
            'O lock local resolve dentro de um processo',
            'Um lock (trava) garante exclusão mútua: só uma thread por vez executa a região crítica, isto é, o trecho que lê e altera o dado compartilhado. As demais esperam. Com o lock em volta do ler-modificar-escrever, nenhuma atualização se perde. Mantenha a região crítica a menor possível, porque enquanto uma thread segura o lock as outras ficam paradas.',
            `trava = threading.Lock()

def somar_com_lock():
    global saldo
    for _ in range(50):
        with trava:
            lido = saldo
            time.sleep(0.0001)
            saldo = lido + 1

# saída: somar_com_lock 200 esperado 200`
          ),
          sl(
            'Por que o lock local NÃO protege vários processos ou nós',
            'Um threading.Lock vive na memória de UM processo. Se a sua API roda em duas instâncias (dois processos, talvez em máquinas diferentes), cada uma tem o seu próprio lock, e um não sabe nada do outro: as duas podem ler e gravar o mesmo registro ao mesmo tempo. A memória não é compartilhada entre nós, só mensagens trafegam. Por isso, a coordenação entre nós precisa de algo que todos enxerguem, como o próprio banco de dados ou um serviço de coordenação.',
            'instância A: lock A -> lê estoque 1 -> grava 0\ninstância B: lock B -> lê estoque 1 -> grava 0   (ao mesmo tempo!)\n=> dois pedidos para a última unidade'
          ),
          sl(
            'Exclusão mútua distribuída em visão geral',
            'Para dar exclusão mútua entre nós, usa-se um recurso compartilhado: uma linha travada no banco, ou um serviço de coordenação que concede o lock. O problema é que nós podem cair ou ficar lentos segurando o lock. A solução comum é o lease: um lock com prazo de validade, que expira sozinho se o dono sumir, para não bloquear todo mundo para sempre. Mas surgem sutilezas (um nó pode demorar demais, o lease expirar e ele ainda achar que tem o lock). Isso é um assunto avançado, que será aprofundado no nível intermediário; por ora, guarde a ideia: lock local não basta e lock distribuído é difícil.'
          ),
          sl(
            'Operações atômicas e idempotentes',
            'Muitas vezes é melhor evitar o lock e usar operações atômicas, que o sistema executa como um passo indivisível. Em vez de ler o estoque e depois gravar, mande ao banco uma única instrução que confere e altera junto. Outra técnica é a concorrência otimista: cada registro tem um número de versão, e a escrita só vale se a versão ainda é a que você leu; se mudou, a escrita é rejeitada e você relê e tenta de novo. Por fim, operações idempotentes (repetir não muda o efeito, como "definir status = PAGO") toleram repetições e reentregas, ao contrário de "somar 10 ao saldo".',
            `-- atômico: confere e altera em um passo\nUPDATE estoque SET qtd = qtd - 1 WHERE id = 7 AND qtd > 0;\n\n-- otimista: só grava se a versão não mudou\nUPDATE conta SET saldo = 90, versao = 4 WHERE id = 3 AND versao = 3;`
          )
        ]
      },
      questions: [
        mcq('q1', 'O que é uma condição de corrida?', 'a', [
          'Um erro em que o resultado depende da ordem em que operações concorrentes se intercalam',
          'Um erro em que o programa sempre falha, independentemente da ordem de execução, mesmo em um único processo',
          'Uma otimização que faz duas threads terminarem o trabalho mais rápido',
          'Uma falha de rede que impede dois nós de se comunicarem entre si'
        ], 'Quando threads compartilham dados sem coordenação, o resultado varia conforme a intercalação, e o bug pode ser intermitente.'),
        mcq('q2', 'No exemplo, por que sem lock o saldo termina bem abaixo de 200?', 'd', [
          'Porque o sleep faz as threads descartarem somas já feitas',
          'Porque cada thread executa menos de 50 iterações por causa do time.sleep, que encerra o laço mais cedo',
          'Porque o Python limita o valor máximo de uma variável global',
          'Porque várias threads leem o mesmo valor antigo e gravam o mesmo resultado, perdendo atualizações'
        ], 'A janela entre ler e gravar permite que várias threads partam do mesmo valor, e então somas se sobrepõem.'),
        mcq('q3', 'Uma API roda em duas instâncias, ambas usando threading.Lock para proteger a última unidade de estoque. O que acontece?', 'b', [
          'O lock é compartilhado pelas duas e a última unidade fica protegida, já que ambas usam o mesmo código',
          'Cada instância tem seu próprio lock, então ambas podem vender a mesma unidade',
          'As instâncias passam a rodar sempre uma de cada vez automaticamente',
          'O Python avisa as duas instâncias de que há outro lock concorrente'
        ], 'Um lock local só existe na memória do processo. Entre instâncias é preciso coordenar via banco ou serviço compartilhado.'),
        fill('q4', 'Complete o termo para o problema do padrão ler-modificar-escrever sem proteção.', 'ler saldo -> somar 1 -> escrever; duas threads juntas causam atualização ___', ['perdida', 'perdidas', 'perdida (lost update)'], 'Atualização perdida (lost update): uma escrita sobrescreve a outra por ter partido do mesmo valor lido.'),
        mcq('q5', 'Por que UPDATE estoque SET qtd = qtd - 1 WHERE id = 7 AND qtd > 0 é melhor que ler a quantidade e depois gravar o novo valor?', 'c', [
          'Porque evita completamente a necessidade de ter um banco de dados',
          'Porque transforma o estoque em um valor que nunca fica negativo por qualquer motivo',
          'Porque o banco confere e altera em um passo, sem janela entre ler e escrever',
          'Porque o UPDATE roda sempre em uma réplica de leitura mais rápida'
        ], 'A operação atômica elimina o intervalo no qual outro cliente poderia ler o mesmo valor.'),
        mcq('q6', 'Qual operação é idempotente?', 'b', [
          'Somar 10 ao saldo da conta',
          'Definir o status do pedido como PAGO',
          'Enviar uma mensagem de bem-vindo ao usuário',
          'Adicionar um item ao final de uma lista'
        ], 'Definir um valor fixo repetidas vezes dá o mesmo resultado. Somar, anexar ou enviar de novo mudam o efeito a cada repetição.'),
        mcq('q7', 'Na concorrência otimista, o que acontece quando você tenta gravar e a versão do registro já mudou?', 'd', [
          'A escrita sobrescreve a versão nova, pois a sua é mais recente',
          'O banco aguarda para sempre até a versão voltar ao valor antigo',
          'O banco cria automaticamente uma réplica nova do registro',
          'A escrita é rejeitada e você relê o registro e tenta de novo'
        ], 'A versão serve para detectar que outro cliente alterou o dado depois da sua leitura, evitando perder a atualização dele.'),
        fill('q8', 'Complete o nome do lock com prazo de validade que expira sozinho se o dono desaparecer.', 'lock com prazo, que expira se o dono sumir: ___', ['lease', 'leases', 'concessão', 'arrendamento'], 'O lease evita bloqueio eterno quando o nó que detinha o lock cai, mas traz sutilezas de tempo que o nível intermediário aprofunda.')
      ]
    },
    {
      id: 'cdb-20-processamento-paralelo-lote',
      title: 'Processamento paralelo e em lote',
      goal: 'Entender dividir para conquistar, MapReduce, stragglers, lote vs tempo real e quando distribuir não compensa.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Dividir para conquistar e scatter-gather',
            'Quando o trabalho é grande demais para uma máquina (ou demorado demais), divida-o em pedaços independentes, processe os pedaços em paralelo em vários nós e junte os resultados. O padrão scatter-gather (espalhar e juntar) é exatamente isso: um coordenador espalha partes do trabalho aos workers e depois reúne as respostas parciais em um resultado final.',
            '             +--> worker 1 --+\ncoordenador -+--> worker 2 --+--> junta resultados\n             +--> worker 3 --+'
          ),
          sl(
            'Paralelismo de dados vs de tarefas',
            'No paralelismo de dados, a MESMA operação é aplicada a pedaços diferentes dos dados (contar palavras em cada bloco de um texto grande). No paralelismo de tarefas, operações DIFERENTES rodam ao mesmo tempo (um nó gera o relatório, outro envia e-mails, outro atualiza o índice). Em sistemas distribuídos de grande escala, o paralelismo de dados é o mais comum, porque o volume de dados é o que cresce.'
          ),
          sl(
            'MapReduce em visão geral: contar palavras',
            'MapReduce é um modelo com três fases. Map: cada worker transforma o seu bloco de dados em pares (chave, valor), como (palavra, 1). Shuffle (embaralhamento): os pares com a mesma chave são agrupados e enviados ao mesmo worker. Reduce: cada worker combina os valores de cada chave, somando as contagens. O programador escreve apenas o map e o reduce; o framework cuida da distribuição, do shuffle e das falhas. No exemplo abaixo tudo roda em um processo só, para você enxergar as fases.',
            `from collections import Counter
from functools import reduce

blocos = ['gato rato gato', 'rato queijo', 'gato queijo queijo']

def map_fase(texto):
    return [(palavra, 1) for palavra in texto.split()]

def reduce_fase(contagens, par):
    palavra, n = par
    contagens[palavra] += n
    return contagens

pares = [par for bloco in blocos for par in map_fase(bloco)]
print(pares[:3])
print(dict(reduce(reduce_fase, pares, Counter())))

# saída:
# [('gato', 1), ('rato', 1), ('gato', 1)]
# {'gato': 3, 'rato': 2, 'queijo': 3}`
          ),
          sl(
            'Stragglers (retardatários)',
            'O trabalho paralelo só termina quando a ÚLTIMA tarefa termina. Se dez tarefas levam 1 minuto e uma leva 10 minutos (porque caiu num nó lento, ou num pedaço de dados maior), o job inteiro leva 10 minutos. Essa tarefa lenta é um straggler. Mitigações comuns: dividir em pedaços menores e mais uniformes e a execução especulativa, que lança uma cópia da tarefa lenta em outro nó e usa o resultado de quem terminar primeiro.',
            '10 tarefas de 1 min + 1 tarefa de 10 min\n=> tempo total do job = 10 min (a mais lenta manda)'
          ),
          sl(
            'Lote vs tempo real',
            'Processamento em lote (batch) acumula dados e os processa de uma vez, em intervalos: fechamento diário, relatório mensal, treino de modelos. Foca em volume e eficiência, aceitando atraso (minutos, horas). Processamento em tempo real (streaming) trata cada evento logo que chega: detecção de fraude, alertas, painéis ao vivo. Foca em baixa latência. Muitos sistemas têm os dois: tempo real para o que é urgente e lote para o que é pesado e pode esperar.'
          ),
          sl(
            'Quando distribuir não compensa',
            'Distribuir tem custo: dividir o trabalho, enviar dados pela rede, coordenar, juntar resultados e lidar com falhas parciais. Se os dados cabem com folga em uma máquina e o trabalho termina em tempo aceitável, um programa simples em um nó costuma ser mais rápido, barato e fácil de depurar. Além disso, a parte do trabalho que é inevitavelmente sequencial limita o ganho, não importa quantos nós você adicione. Regra prática: meça primeiro, distribua só quando o gargalo for real.',
            'tempo com N workers = trabalho / N + custo de coordenação\n(se a coordenação cresce, adicionar workers deixa de ajudar)'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que faz o padrão scatter-gather?', 'b', [
          'Copia o mesmo dado para todos os nós e mantém cópias idênticas',
          'Espalha partes do trabalho entre workers e depois reúne os resultados parciais',
          'Envia todo o trabalho a um único worker e espera ele concluir, sem dividir nada entre os nós',
          'Descarta os resultados parciais e recalcula tudo em um nó central'
        ], 'O coordenador divide (scatter), os workers trabalham em paralelo e os resultados são reunidos (gather).'),
        mcq('q2', 'No exemplo de contar palavras, o que a fase map produz para o bloco "gato rato gato"?', 'a', [
          'Pares (palavra, 1), como ("gato", 1), ("rato", 1), ("gato", 1)',
          'O total final já somado, sem etapa posterior: {"gato": 2, "rato": 1}',
          'Uma lista ordenada com cada palavra aparecendo uma única vez',
          'Apenas o número total de palavras do bloco, que é 3'
        ], 'O map emite um par (palavra, 1) por ocorrência. A soma acontece depois, no reduce.'),
        mcq('q3', 'O que caracteriza o paralelismo de dados?', 'd', [
          'Rodar tarefas totalmente diferentes ao mesmo tempo em nós distintos',
          'Rodar uma única thread que processa todos os dados em sequência',
          'Guardar várias cópias dos dados para aumentar a durabilidade deles',
          'Aplicar a mesma operação a pedaços diferentes dos dados em paralelo'
        ], 'No paralelismo de dados a operação é a mesma e os dados é que são divididos. No de tarefas, as operações é que diferem.'),
        fill('q4', 'Complete: uma tarefa muito mais lenta que as demais, que atrasa o término do job inteiro, é chamada de...', '10 tarefas levam 1 min e uma leva 10 min; a tarefa lenta é um ___ (retardatário)', ['straggler', 'retardatário', 'retardatario', 'stragglers'], 'O job só termina quando a última tarefa termina; por isso retardatários dominam o tempo total.'),
        mcq('q5', 'Um trabalho leva 60 minutos em uma máquina e é dividido igualmente entre 4 workers, com 5 minutos de custo total de coordenação. Qual o tempo aproximado?', 'c', [
          '15 minutos, pois a coordenação não costuma contar no tempo total',
          '65 minutos, pois a coordenação soma ao tempo sequencial inteiro',
          '20 minutos: 60 / 4 = 15, mais 5 de coordenação',
          '12 minutos, pois cada worker ganha um quinto do trabalho'
        ], 'O tempo paralelo é o trabalho dividido pelo número de workers mais o custo de coordenação: 15 + 5 = 20.'),
        mcq('q6', 'Qual caso combina melhor com processamento em tempo real e não com lote?', 'a', [
          'Detectar uma possível fraude no instante em que a compra acontece',
          'Gerar o relatório mensal de vendas e enviá-lo à diretoria na primeira semana do mês',
          'Treinar um modelo de recomendação com o histórico do ano',
          'Fazer o fechamento contábil noturno das contas'
        ], 'Fraude exige reação com baixa latência. Os demais casos aceitam atraso e se beneficiam da eficiência do lote.'),
        mcq('q7', 'Quando distribuir um processamento provavelmente NÃO compensa?', 'c', [
          'Quando os dados não cabem na memória de nenhuma máquina disponível',
          'Quando o prazo exige terminar o trabalho muito mais rápido que o limite de uma máquina',
          'Quando os dados cabem com folga em uma máquina e o tempo atual já é aceitável, pois a coordenação custaria mais que o ganho',
          'Quando a carga cresce todos os meses e já saturou o servidor único'
        ], 'Se uma máquina resolve em tempo aceitável, o custo de coordenação, rede e falhas parciais supera o benefício.'),
        fill('q8', 'Complete o nome da fase do MapReduce que agrupa os pares com a mesma chave antes do reduce.', 'map -> ___ (agrupa por chave) -> reduce', ['shuffle', 'embaralhamento', 'shuffle (embaralhamento)'], 'No shuffle os pares com a mesma chave são reunidos no mesmo worker, para que o reduce possa combiná-los.')
      ]
    },
    {
      id: 'cdb-33-big-data-visao-geral',
      title: 'Big data e o ecossistema de dados: visão geral',
      goal: 'Conhecer o vocabulário do big data (Vs, lake, warehouse, ETL, lote e fluxo, colunar, ferramentas) com senso crítico e cuidados de privacidade.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Os Vs e o senso crítico',
            'Big data costuma ser descrito por três Vs: volume (muitos dados), velocidade (eles chegam rápido e precisam ser tratados rápido) e variedade (formatos diferentes: tabelas, textos, imagens, logs). Cuidado com o modismo: "grande" é relativo. Um conjunto que cabe confortavelmente em uma máquina e é processado em minutos NÃO precisa de um ecossistema distribuído, que traz custo e complexidade. Big data de verdade começa quando pelo menos um dos Vs deixa de caber em uma máquina: o dado não cabe no disco, o processamento demora demais ou os eventos chegam mais rápido do que uma máquina dá conta.'
          ),
          sl(
            'Quando os dados não cabem em uma máquina',
            'Quando os dados passam do que uma máquina guarda ou processa, eles são divididos (particionados) em pedaços, espalhados por várias máquinas, e cada pedaço também é replicado para suportar falhas. Mover os dados pela rede é caro (lembre da falácia do custo de transporte zero). Por isso a regra central do big data é mover o processamento para onde os dados estão: em vez de trazer um bilhão de linhas para um programa, envia-se o pequeno programa para cada máquina, ela processa o seu pedaço localmente e só os resultados parciais, pequenos, trafegam.',
            'ruim : [máquina 1 .. N] --bilhões de linhas--> [programa]\nmelhor: [programa] --código pequeno--> [máquina 1 .. N]\n        cada uma soma o seu pedaço e devolve só um número'
          ),
          sl(
            'Armazenamento: data lake e data warehouse',
            'Um data lake é um grande depósito de dados brutos, em seus formatos originais (arquivos de log, CSV, JSON, imagens), guardados barato para uso futuro; a estrutura é aplicada na hora de ler. Um data warehouse (armazém) guarda dados já limpos, organizados em tabelas e preparados para consultas e relatórios rápidos; a estrutura é definida antes de gravar. Resumo: lake = flexível e bruto; warehouse = organizado e confiável para análise. Um lake sem catálogo, sem descrição e sem validação vira um "pântano de dados": ninguém sabe o que existe nem se pode confiar.'
          ),
          sl(
            'Formatos de arquivo: texto e colunar',
            'CSV e JSON são formatos de texto: simples, legíveis por pessoas, mas ocupam espaço e obrigam a ler cada linha inteira. Formatos colunares, como o Parquet, guardam os dados coluna por coluna e costumam comprimir bem. Por que isso importa: se uma tabela tem 100 colunas e a consulta só soma uma, o formato colunar lê apenas a coluna necessária; o formato por linhas teria de percorrer tudo. Colunar é ótimo para análise (ler poucas colunas de muitas linhas); o formato por linhas é melhor para gravar registros inteiros, um a um.',
            'por linha : [id,nome,valor][id,nome,valor][id,nome,valor]\ncolunar   : [id,id,id][nome,nome,nome][valor,valor,valor]\nsoma(valor) lê só o último bloco no formato colunar'
          ),
          sl(
            'ETL, ELT e orquestração',
            'Os dados nascem em lugares diferentes e precisam ser levados ao armazém. ETL (Extract, Transform, Load): extrai da origem, transforma (limpa, junta, converte) em um lugar intermediário e só então carrega no destino. ELT inverte: carrega primeiro os dados brutos no destino (por exemplo, no lake ou em um armazém potente) e transforma lá dentro. Um pipeline de dados é essa cadeia de etapas, e ele roda várias vezes, com dependências ("a etapa B só depois da A"). Orquestrar é agendar, ordenar, repetir em caso de erro e monitorar essas etapas; é o papel de uma ferramenta orquestradora.'
          ),
          sl(
            'Lote ou fluxo, e as ferramentas (só os nomes)',
            'Processamento em lote (batch) trabalha sobre um conjunto grande já acumulado, em horários definidos: relatório do dia anterior. Processamento em fluxo (stream) trata cada evento ou pequenos grupos assim que chegam: alerta de fraude em segundos. Lote é mais simples e eficiente para volume; fluxo dá respostas rápidas. Nomes que você vai ouvir: Hadoop (armazenamento distribuído e o modelo MapReduce, histórico do lote), Spark (processamento distribuído de dados em lote e fluxo), Kafka (transporte de fluxos de eventos, como uma "linha de montagem" de mensagens), Flink (processamento de fluxo), Airflow (orquestração de pipelines). Nomes passam; os conceitos permanecem.'
          ),
          sl(
            'Qualidade, governança e privacidade',
            'Dado ruim gera decisão ruim: valide formatos, duplicatas, valores faltando e registre de onde cada dado veio. Governança é saber o que existe, quem acessa e por quanto tempo. Dados pessoais em lakes exigem cuidado redobrado (LGPD, em visão geral): minimização, ou seja, coletar e guardar só o necessário para a finalidade; retenção, com prazo definido e descarte depois dele (um lake que guarda tudo para sempre multiplica o risco); controle de acesso por perfil; e redução de identificação: pseudonimizar (trocar o identificador por um código, mas ainda reidentificável) ou anonimizar de fato (sem possibilidade razoável de reidentificar). Cópias e réplicas multiplicam o dado: apagar de um lugar não basta. Esta lição não substitui orientação jurídica.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Uma equipe tem um arquivo de poucos megabytes que uma única máquina processa em segundos e quer montar um cluster "porque é big data". Qual é a avaliação mais adequada?', 'd', [
          'Está certa: qualquer dado deve ser processado em cluster para ser considerado profissional',
          'Está certa, pois a variedade de formatos já obriga o uso de várias máquinas',
          'Está errada apenas se o arquivo tiver dados pessoais, caso em que exige cluster',
          'Está errada: sem Vs fora do alcance de uma máquina, só há custo'
        ], 'Big data é justificado quando os Vs excedem o que uma máquina dá conta. Fora disso, distribuir é complexidade sem ganho.'),
        mcq('q2', 'Para somar uma coluna de bilhões de linhas guardadas em 50 máquinas, qual é a abordagem coerente com "mover o processamento para onde estão os dados"?', 'b', [
          'Copiar tudo para uma só máquina potente e somar lá',
          'Cada máquina soma o seu pedaço e só os totais parciais são juntados',
          'Enviar cada linha para um serviço central que soma uma a uma',
          'Replicar todos os dados em todas as máquinas e somar em cada uma delas'
        ], 'O código é pequeno e viaja; os dados ficam. Só os resultados parciais, minúsculos, atravessam a rede.'),
        mcq('q3', 'Qual descrição diferencia corretamente data lake de data warehouse?', 'c', [
          'O lake guarda dados já limpos e modelados em tabelas; o warehouse guarda arquivos brutos',
          'Lake e warehouse são o mesmo conceito, apenas com nomes de fornecedores diferentes',
          'O lake guarda dados brutos em formatos originais; o warehouse guarda dados organizados para consulta e relatório',
          'O lake só aceita dados de texto e o warehouse só aceita imagens e vídeos'
        ], 'Lake: bruto e flexível, estrutura na leitura. Warehouse: estruturado antes de gravar, pronto para análise. Sem catálogo, o lake vira pântano.'),
        fill('q4', 'A sigla ETL significa Extract, Transform e ___ (carregar os dados no destino).', 'ETL: Extract, Transform, ___', ['Load', 'load', 'carga', 'carregar'], 'Extrai da origem, transforma e carrega no destino. No ELT, a carga vem antes da transformação.'),
        mcq('q5', 'Uma tabela tem 100 colunas e uma consulta de análise usa só a coluna "valor" em milhões de linhas. Por que o formato colunar tende a ajudar?', 'a', [
          'Ele lê só a coluna necessária, em vez de percorrer todas as colunas de cada linha',
          'Ele grava os dados em texto legível, o que acelera qualquer consulta',
          'Ele impede que os dados sejam replicados, evitando consistência eventual',
          'Ele junta todas as colunas de uma linha, de modo que cada linha inteira é lida de uma vez'
        ], 'Em formatos colunares cada coluna fica em blocos próprios; análise que toca poucas colunas lê muito menos dados.'),
        mcq('q6', 'Uma operadora quer detectar uma possível fraude em cartão em poucos segundos após cada compra. Qual modelo de processamento é mais adequado?', 'd', [
          'Lote, processando o conjunto das compras uma vez por semana',
          'Lote, com um relatório noturno que reúne as compras de cada dia',
          'Nenhum: a detecção de fraude só é possível com dados já armazenados em um warehouse',
          'Fluxo, tratando cada evento assim que chega'
        ], 'Resposta em segundos pede processamento de fluxo. Lote serve a relatórios acumulados, como o do dia anterior.'),
        mcq('q7', 'Qual associação entre ferramenta e papel está correta?', 'b', [
          'Airflow transporta fluxos de eventos; Kafka orquestra as etapas',
          'Kafka transporta fluxos de eventos; Airflow orquestra pipelines',
          'Parquet é um orquestrador de pipelines; Spark é um formato de arquivo colunar',
          'Hadoop e Flink servem só para desenhar diagramas de pipelines'
        ], 'Kafka: transporte de eventos. Airflow: orquestração. Spark e Flink: processamento. Parquet: formato colunar de arquivo.'),
        fill('q8', 'O princípio de coletar e guardar apenas os dados pessoais necessários para a finalidade, e nada além, chama-se ___ de dados.', 'princípio da ___ de dados', ['minimização', 'minimizacao', 'minimização de dados'], 'Menos dado coletado, menos risco: é a base da LGPD e se reforça com retenção limitada e controle de acesso.')
      ]
    },
    {
      id: 'cdb-21-armazenamento-distribuido',
      title: 'Armazenamento distribuído',
      goal: 'Diferenciar arquivo, bloco e objeto, entender replicação vs código de apagamento, durabilidade vs disponibilidade e a regra 3-2-1.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Arquivo, bloco e objeto',
            'Há três modelos de armazenamento. Arquivo: dados organizados em pastas e arquivos com nomes, o modelo do seu computador. Bloco: o dado é dividido em pedaços de tamanho fixo, sem significado próprio (como o disco de uma máquina virtual), e o sistema acima, por exemplo um sistema de arquivos ou um banco, decide o que cada bloco significa. Objeto: cada item é um objeto (os dados mais metadados) identificado por uma chave em um espaço plano, acessado por uma API (normalmente HTTP). Cada modelo atende a usos diferentes.',
            'arquivo: /docs/relatorio.pdf         (caminho em pastas)\nbloco:   bloco 0, bloco 1, bloco 2... (pedaços fixos, sem nome)\nobjeto:  bucket "fotos", chave "2026/gato.jpg"'
          ),
          sl(
            'Sistemas de arquivos distribuídos (ex.: HDFS)',
            'Um sistema de arquivos distribuído, como o HDFS, apresenta arquivos enormes que não cabem em uma máquina. Ele divide cada arquivo em blocos grandes, espalha os blocos por muitos nós e guarda várias réplicas de cada bloco em nós diferentes. Um nó de metadados sabe onde está cada bloco. Se um nó cai, as outras réplicas mantêm os dados disponíveis e o sistema cria novas cópias para voltar ao número desejado. Como os blocos estão em vários nós, leituras também podem ser paralelas.',
            'arquivo grande -> blocos B1 B2 B3\nB1: nó 1, nó 3, nó 4\nB2: nó 2, nó 3, nó 5\nB3: nó 1, nó 2, nó 5   (3 réplicas de cada)'
          ),
          sl(
            'Armazenamento de objetos: bucket, objeto e chave',
            'No armazenamento de objetos (como Amazon S3 e serviços equivalentes), um bucket é um contêiner de objetos, e cada objeto é encontrado dentro dele pela sua chave (um texto como "relatorios/2026/mes-01.pdf"; as barras são só parte do nome, não pastas reais). Você grava com PUT, lê com GET e apaga com DELETE. Objetos são tratados como imutáveis: para mudar um objeto, você grava uma versão nova inteira no lugar, e não edita bytes no meio. Isso simplifica replicação e escala, e muitos serviços oferecem versionamento para guardar as versões antigas.'
          ),
          sl(
            'URLs pré-assinadas',
            'Como deixar um usuário baixar ou enviar um objeto privado sem dar a ele suas credenciais e sem passar o arquivo pelo seu servidor? Com uma URL pré-assinada: o seu servidor, que tem as credenciais, gera uma URL com uma assinatura embutida que autoriza UMA operação sobre UM objeto por pouco tempo. Quem tiver a URL consegue usá-la até expirar, então ela deve ter validade curta e ser tratada como segredo enquanto vale. O exemplo é fictício.',
            'https://armazenamento.exemplo.invalid/fotos/2026/gato.jpg\n  ?operacao=ler&expira=<instante>&assinatura=<assinatura>\n(valida só para ler este objeto, só até expirar)'
          ),
          sl(
            'Durabilidade vs disponibilidade, replicação vs código de apagamento',
            'Durabilidade é a chance de o dado continuar existindo ao longo do tempo (não ser perdido). Disponibilidade é a chance de conseguir acessá-lo agora. São diferentes: o dado pode estar seguro em várias zonas e ainda assim inacessível por uma falha de rede temporária. Para ser durável há duas estratégias. Replicação: guardar cópias completas (3 cópias consomem 3 vezes o espaço). Código de apagamento (erasure coding): dividir o dado em pedaços de dados mais pedaços de paridade calculados, de modo que se possa reconstruir o original mesmo perdendo alguns pedaços. Usa menos espaço que réplicas completas para tolerância parecida, ao custo de mais processamento e tráfego de rede ao reconstruir.',
            'replicação:  [dado] [dado] [dado]            (3x o espaço)\napagamento:  [d1] [d2] [d3] [d4] [p1] [p2]     (perde até 2 pedaços e ainda reconstrói)'
          ),
          sl(
            'Backups e a regra 3-2-1',
            'Replicação NÃO é backup. Se alguém apaga um arquivo por engano, se um bug corrompe os dados ou se um ransomware cifra tudo, a replicação copia o estrago para todas as réplicas. Backup é uma cópia separada, em um ponto do passado, que você pode restaurar. A regra 3-2-1 resume o mínimo: 3 cópias dos dados (a original mais duas), em 2 tipos de mídia ou serviço diferentes, com 1 cópia fora do local (outro prédio ou região). E teste a restauração, porque backup nunca restaurado é apenas esperança. Atenção à privacidade: backups também contêm dados pessoais, então precisam de criptografia, controle de acesso e prazo de retenção.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O disco de uma máquina virtual é visto pelo sistema como pedaços de tamanho fixo, sem nomes. Qual modelo é esse?', 'c', [
          'Armazenamento de objetos, com chave e metadados por item',
          'Armazenamento de arquivos, com pastas e nomes hierárquicos de caminho completo',
          'Armazenamento em bloco, com pedaços de tamanho fixo sem significado próprio para quem armazena',
          'Armazenamento em bucket, editável byte a byte via HTTP'
        ], 'Bloco é o modelo de pedaços fixos; quem interpreta o conteúdo é o sistema de arquivos ou o banco acima dele.'),
        mcq('q2', 'Por que um sistema como o HDFS guarda várias réplicas de cada bloco em nós diferentes?', 'd', [
          'Para impedir que mais de um cliente leia o mesmo arquivo ao mesmo tempo no cluster',
          'Para reduzir o espaço total usado pelos dados armazenados',
          'Para que o nó de metadados deixe de ser necessário',
          'Para tolerar a queda de nós e ler em paralelo'
        ], 'As réplicas aumentam a durabilidade e a disponibilidade. O custo é espaço extra, não economia.'),
        mcq('q3', 'Os dados estão gravados com segurança em várias zonas, mas uma falha de rede deixa o serviço inacessível por alguns minutos. Como descrever isso?', 'a', [
          'Os dados continuam duráveis, mas o serviço está momentaneamente indisponível',
          'Os dados foram perdidos, e portanto a durabilidade falhou',
          'Os dados estão disponíveis, mas deixaram de ser duráveis por estarem em várias zonas',
          'Durabilidade e disponibilidade são o mesmo conceito, então nada mudou'
        ], 'Durabilidade é não perder o dado; disponibilidade é conseguir acessá-lo agora. Podem divergir.'),
        fill('q4', 'Complete o nome da regra de backup: 3 cópias, 2 tipos de mídia, 1 fora do local.', 'Regra ___ : 3 cópias, 2 mídias diferentes, 1 cópia fora do local', ['3-2-1', '3 2 1', '321', '3-2-1.'], 'A regra 3-2-1 é o mínimo recomendado para reduzir o risco de perder todas as cópias de uma vez.'),
        mcq('q5', 'Um arquivo é apagado por engano em um armazenamento replicado em três zonas. A replicação resolve?', 'b', [
          'Sim, pois as outras duas zonas mantêm cópias do arquivo apagado',
          'Não, pois a exclusão é replicada também; é preciso backup ou versionamento dos dados',
          'Sim, pois toda replicação mantém sempre o histórico das versões',
          'Não, mas só porque o sistema precisa ser reiniciado para restaurar as réplicas'
        ], 'Replicar copia também os erros e as exclusões. Backup (cópia separada no tempo) ou versionamento permitem voltar atrás.'),
        mcq('q6', 'Para que serve uma URL pré-assinada?', 'd', [
          'Para tornar um objeto público para qualquer pessoa, para sempre, sem exigir nenhuma assinatura ou credencial do cliente',
          'Para entregar as credenciais do servidor ao usuário final',
          'Para comprimir o objeto antes de enviá-lo ao cliente',
          'Para autorizar uma operação específica sobre um objeto, por tempo limitado, sem expor credenciais'
        ], 'A assinatura embutida autoriza só aquela operação e só até a expiração, e por isso a URL deve ser tratada como segredo enquanto vale.'),
        mcq('q7', 'Qual é a principal vantagem do código de apagamento sobre guardar réplicas completas?', 'a', [
          'Usa menos espaço para tolerar falhas, com mais cálculo para reconstruir',
          'Elimina a necessidade de qualquer cálculo ou tráfego ao reconstruir dados perdidos em qualquer nó',
          'Garante que o dado nunca fique indisponível, mesmo com todos os nós fora',
          'Dispensa a regra 3-2-1, pois já funciona como um backup completo'
        ], 'Pedaços de paridade permitem reconstruir o dado com menos espaço que 3 cópias, mas reconstruir custa CPU e rede.'),
        fill('q8', 'Complete: em armazenamento de objetos, cada objeto é localizado dentro de um bucket pela sua...', 'bucket "fotos" + ___ "2026/gato.jpg" -> objeto', ['chave', 'key', 'a chave'], 'O objeto é identificado pelo bucket e pela chave dentro dele.')
      ]
    },
    {
      id: 'cdb-22-nuvem-computacao-distribuida',
      title: 'Nuvem e computação distribuída',
      goal: 'Entender regiões, zonas, domínios de falha, IaaS/PaaS/SaaS, autoescala, serverless, custos, responsabilidade compartilhada e conceitos básicos de localização de dados.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Regiões e zonas de disponibilidade',
            'Provedores de nuvem organizam a infraestrutura em regiões: áreas geográficas, como uma cidade ou país, cada uma com vários datacenters. Dentro de uma região existem zonas de disponibilidade (AZ): locais isolados entre si (energia, refrigeração, rede próprias), mas ligados por rede rápida. Falhas de uma zona normalmente não derrubam as outras. Por isso, para sobreviver à falha de uma zona, você distribui instâncias e réplicas por mais de uma zona; para sobreviver à falha de uma região inteira, por mais de uma região, o que é mais caro e complexo.',
            'região A\n  zona 1 [nó] [nó]\n  zona 2 [nó] [nó]\n  zona 3 [nó] [nó]\nregião B (outro lugar do mundo)'
          ),
          sl(
            'Domínios de falha',
            'Um domínio de falha é o conjunto de coisas que podem falhar juntas por uma causa comum: uma máquina, um rack, uma zona, uma região, uma atualização mal feita, um certificado que expira. Se todas as suas réplicas estão no mesmo domínio de falha, replicar não protege contra aquela causa. A regra é espalhar as cópias por domínios de falha diferentes, e perceber os domínios escondidos (mesmo provedor, mesma conta, mesma configuração).'
          ),
          sl(
            'IaaS, PaaS e SaaS',
            'Os modelos de serviço diferem em quanto você gerencia. IaaS (infraestrutura como serviço): você aluga máquinas virtuais, rede e discos, e cuida do sistema operacional e de tudo acima. PaaS (plataforma como serviço): você entrega o código e a plataforma cuida de servidores, escala e atualizações (bancos gerenciados também entram aqui, conceitualmente). SaaS (software como serviço): você usa o software pronto, como e-mail ou planilha online, e só configura e usa. Quanto mais alto, menos trabalho operacional, mas também menos controle.',
            'IaaS: você gerencia SO + runtime + app\nPaaS: você gerencia app (e seus dados)\nSaaS: você só usa e configura'
          ),
          sl(
            'Elasticidade e autoescala',
            'Elasticidade é a capacidade de aumentar e diminuir recursos conforme a demanda, pagando pelo que usa. A autoescala (autoscaling) faz isso automaticamente: uma regra observa uma métrica (por exemplo uso de CPU ou tamanho da fila), adiciona instâncias quando a carga sobe e remove quando desce, respeitando um mínimo e um máximo. Funciona melhor com serviços sem estado (qualquer instância atende qualquer requisição). Lembre que subir instâncias leva tempo, então picos muito súbitos podem exigir folga prévia.'
          ),
          sl(
            'Serverless em visão geral',
            'No modelo serverless (como funções sob demanda), você escreve funções e a plataforma executa quando há um evento ou requisição, escala automaticamente e cobra pelo uso, inclusive podendo escalar a zero quando ninguém usa. Ainda existem servidores, mas você não os gerencia. Limitações típicas: tempo máximo de execução, partida a frio (a primeira chamada após um tempo parado pode demorar mais) e o fato de a função não guardar estado entre execuções: o estado deve ficar em banco, cache ou armazenamento externos.'
          ),
          sl(
            'Custos de tráfego e de dados',
            'Na nuvem, o custo não é só de máquinas. Em geral, dados que saem da nuvem para a internet (egress) e, dependendo do caso, o tráfego entre zonas ou regiões são cobrados, e armazenamento e número de operações também. Consequência de arquitetura: replicar dados entre regiões, ou fazer um serviço conversar muito com outro em uma zona diferente, pode gerar custo e latência. Consulte sempre a tabela de preços do provedor e estime o tráfego antes de decidir; este curso não cita valores porque mudam.'
          ),
          sl(
            'Responsabilidade compartilhada e localização dos dados (LGPD)',
            'No modelo de responsabilidade compartilhada, o provedor protege a infraestrutura (datacenters, hardware, a base da plataforma), e você é responsável pelo que coloca nela: configurar permissões, proteger credenciais, ativar criptografia, decidir quem acessa os dados. Um bucket aberto por engano é erro de quem configurou, não do provedor. Sobre localização: ao escolher região, você decide onde os dados ficam fisicamente. Para dados pessoais, a LGPD tem regras sobre transferência internacional de dados, então saber em que país os dados e suas réplicas e backups ficam é parte do projeto. Este é só um conceito básico; decisões concretas exigem orientação jurídica ou do encarregado de dados.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Para sobreviver à falha de uma zona de disponibilidade inteira, o que fazer?', 'd', [
          'Colocar todas as instâncias na zona mais barata da região, onde o preço é menor',
          'Aumentar o tamanho de cada instância dentro da mesma zona',
          'Fazer backup diário dos dados na mesma zona de origem',
          'Distribuir instâncias e réplicas por mais de uma zona da mesma região, de forma balanceada'
        ], 'Zonas são isoladas entre si. Espalhar as cópias por zonas evita que a falha de uma derrube todo o serviço.'),
        mcq('q2', 'Todas as réplicas do banco estão na mesma zona. Em termos de domínio de falha, qual é o problema?', 'b', [
          'As réplicas sempre ficam desatualizadas em relação à principal',
          'A zona é um domínio de falha comum às réplicas',
          'O banco deixa de aceitar escritas por estar com réplicas demais em uma única zona',
          'O custo de tráfego entre zonas fica proibitivo para o negócio'
        ], 'Réplicas só protegem contra falhas que não atinjam todas ao mesmo tempo. Compartilhar a zona é compartilhar o risco.'),
        mcq('q3', 'Uma equipe aluga máquinas virtuais e instala por conta própria o sistema operacional e a aplicação. Qual modelo de serviço é esse?', 'c', [
          'SaaS, pois o software chega pronto para usar',
          'PaaS, pois a plataforma gerencia o sistema operacional',
          'IaaS, pois a equipe gerencia da máquina virtual para cima',
          'Serverless, pois não existe nenhum servidor envolvido na execução do código'
        ], 'Em IaaS o provedor entrega a infraestrutura virtual; sistema operacional e tudo acima são responsabilidade do cliente.'),
        fill('q4', 'Complete o nome do recurso que ajusta automaticamente o número de instâncias conforme a carga.', 'carga sobe -> mais instâncias; carga desce -> menos. Nome: ___', ['autoescala', 'autoscaling', 'auto scaling', 'escalonamento automático', 'escala automática'], 'A autoescala observa métricas e adiciona ou remove instâncias dentro de limites mínimo e máximo.'),
        mcq('q5', 'No modelo de responsabilidade compartilhada, quem deve garantir que as permissões de um bucket estejam configuradas corretamente?', 'a', [
          'O cliente, que configura o que coloca na plataforma',
          'O provedor, pois ele cuida de tudo que roda na nuvem, inclusive da sua configuração',
          'Ninguém, pois o padrão é sempre seguro',
          'O navegador de quem acessa o bucket'
        ], 'O provedor protege a infraestrutura; configuração, acessos e dados são do cliente.'),
        mcq('q6', 'Qual afirmação sobre serverless é correta?', 'b', [
          'Não existe nenhuma limitação de tempo ou de estado nas funções, pois a plataforma cuida de tudo isso',
          'Você não gerencia servidores, mas o estado fica fora da função',
          'A plataforma garante que a primeira chamada nunca será mais lenta',
          'Funções serverless guardam estado confiável na memória entre chamadas'
        ], 'A função é efêmera e sem estado entre execuções. Persistência vai para banco, cache ou armazenamento de objetos.'),
        mcq('q7', 'Uma aplicação envia grande volume de dados para fora da nuvem e entre regiões. Que ponto de projeto isso levanta?', 'd', [
          'Só a quantidade de máquinas importa para a conta final',
          'Tráfego entre zonas e regiões nunca influencia latência',
          'O custo de saída de dados é igual em qualquer cenário de uso',
          'Tráfego de dados gera custo e latência e deve ser estimado ao desenhar a arquitetura'
        ], 'Egress e tráfego entre regiões costumam ser cobrados e adicionam latência; considere isso ao desenhar.'),
        fill('q8', 'Complete: ao escolher a região para dados de pessoas, a LGPD tem regras sobre a ___ internacional de dados.', 'Dados pessoais em região no exterior: regras de ___ internacional de dados (LGPD)', ['transferência', 'transferencia'], 'Saber em que país ficam dados, réplicas e backups é parte do projeto; decisões concretas exigem orientação jurídica.')
      ]
    },
    {
      id: 'cdb-23-containers-orquestracao-visao',
      title: 'Containers e orquestração: visão geral',
      goal: 'Entender por que containers facilitam distribuir, o que um orquestrador faz e os conceitos básicos do Kubernetes.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que containers facilitam distribuir',
            'Um container empacota a aplicação com suas dependências em uma imagem. A mesma imagem roda igual em qualquer nó que tenha um runtime de containers, o que acaba com o "na minha máquina funciona". Containers são isolados entre si, iniciam rapidamente e podem ser criados e descartados com facilidade, o que casa com sistemas distribuídos em que instâncias vão e vêm. Como construir imagens e usar Docker é assunto do curso de Containers desta trilha; aqui só importa o que isso muda para distribuir.'
          ),
          sl(
            'O problema: muitos containers em muitos nós',
            'Com dezenas de containers em vários nós surgem perguntas: em qual nó cada um deve rodar? O que fazer quando um morre? Como um serviço encontra o outro se os endereços mudam? Como atualizar sem derrubar tudo? Um orquestrador de containers responde a isso automaticamente. Suas funções centrais: agendamento (decidir em qual nó cada container roda, conforme recursos livres), descoberta de serviços (dar nomes estáveis aos serviços), auto-recuperação (reiniciar o que falhou, reagendar se o nó cai) e escala (aumentar ou diminuir réplicas).'
          ),
          sl(
            'Estado desejado vs estado real',
            'Orquestradores são declarativos: você descreve o estado desejado ("quero 3 réplicas deste serviço") e o orquestrador executa um laço contínuo que compara com o estado real (quantas existem agora) e age para corrigir a diferença. Se uma réplica morre, o real passa a 2, difere do desejado 3, e ele cria outra. Você não escreve "inicie o container X no nó 2", e sim "esta é a situação que eu quero".',
            'desejado: 3 réplicas   real: 2 réplicas   -> cria 1\ndesejado: 3 réplicas   real: 3 réplicas   -> nada a fazer'
          ),
          sl(
            'Kubernetes em visão geral',
            'Kubernetes é o orquestrador mais usado. Um cluster tem nós (máquinas) que rodam cargas de trabalho. Três conceitos básicos: Pod, a menor unidade que se implanta, com um ou mais containers que vivem juntos no mesmo nó; Deployment, que declara quantas réplicas de um pod você quer e cuida de mantê-las e de atualizações gradativas; Service, que dá um endereço estável (e balanceamento) para um conjunto de pods, que são efêmeros e mudam de endereço. O curso de Containers trata disso em profundidade; aqui basta a ideia geral. A imagem abaixo é um exemplo fictício.',
            `# Deployment: estado desejado
replicas: 3
image: <imagem-do-registro>   # placeholder

# Service: endereço estável
# aponta para os pods do Deployment`
          ),
          sl(
            'Auto-recuperação e escala',
            'Se um container falha (ou fica sem responder às sondas de saúde), o orquestrador o reinicia. Se o nó inteiro cai, os pods são reagendados em outros nós. A escala pode ser manual (você muda o número de réplicas) ou automática (regras baseadas em métricas, como a autoescala da nuvem). Tudo isso funciona bem quando as instâncias são intercambiáveis e sem estado local importante, porque o orquestrador pode destruí-las e recriá-las à vontade.'
          ),
          sl(
            'Pets vs cattle',
            'A metáfora: um pet (animal de estimação) é um servidor único, com nome próprio, configurado à mão, que ninguém ousa desligar; se adoece, você o trata com carinho. Cattle (gado) são servidores idênticos, numerados, descartáveis: se um falha, você o substitui por outro igual, sem drama. Sistemas distribuídos modernos preferem tratar instâncias como gado. O que não pode ser descartável (dados) fica em armazenamento próprio, como bancos e volumes, separados das instâncias.',
            'pet:    "servidor-do-joao", único, insubstituível\ncattle: app-1, app-2, app-3, idênticos, descartáveis'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que é o agendamento (scheduling) feito por um orquestrador?', 'a', [
          'Decidir o nó em que cada container vai rodar',
          'Marcar horários em que a aplicação pode ser acessada pelos usuários, evitando picos de acesso',
          'Escrever o Dockerfile de cada aplicação automaticamente',
          'Cobrar o uso de cada container ao final do mês'
        ], 'O agendador escolhe o nó para cada carga considerando CPU, memória e outras restrições.'),
        mcq('q2', 'Você declarou 3 réplicas e um pod morre. O que o orquestrador faz?', 'c', [
          'Mantém duas réplicas até que alguém peça manualmente uma nova ao orquestrador',
          'Para o serviço inteiro até um humano investigar a causa',
          'Compara desejado e real e cria outro pod para voltar a 3',
          'Apaga a declaração, pois o estado desejado ficou inválido'
        ], 'O laço de reconciliação compara o estado real (2) com o desejado (3) e corrige.'),
        mcq('q3', 'Qual é o papel de um Service no Kubernetes?', 'b', [
          'Construir a imagem de cada container a partir do código',
          'Dar um endereço estável e balanceamento para um conjunto de pods que mudam de endereço com o tempo',
          'Armazenar para sempre todos os dados dos pods já descartados no próprio cluster',
          'Executar o código da aplicação em lugar dos containers'
        ], 'Pods são efêmeros e seus endereços mudam; o Service oferece um ponto estável de acesso.'),
        fill('q4', 'Complete o nome do objeto que dá endereço estável e balanceia entre os pods.', 'Pods vêm e vão (endereços mudam). Objeto que dá um endereço estável: ___', ['service', 'services'], 'O Service é o ponto de acesso fixo para pods efêmeros.'),
        mcq('q5', 'Qual é a menor unidade que se implanta no Kubernetes?', 'd', [
          'O cluster inteiro, com todos os nós e serviços',
          'O nó, ou seja, a máquina física',
          'O Deployment com todas as réplicas',
          'O Pod, com um ou mais containers rodando juntos no mesmo nó'
        ], 'O Pod agrupa containers que compartilham o mesmo nó e rede; o Deployment gerencia pods.'),
        mcq('q6', 'O que significa tratar servidores como "gado" (cattle) e não como "animais de estimação" (pets)?', 'c', [
          'Dar a cada servidor um nome próprio e configurá-lo à mão',
          'Manter um único servidor grande que nunca pode ser desligado',
          'Trocá-lo por uma instância idêntica ao falhar',
          'Guardar os dados importantes dentro de cada instância descartável, para não perdê-los'
        ], 'Instâncias idênticas e descartáveis permitem auto-recuperação. Os dados duráveis ficam em armazenamento separado.'),
        mcq('q7', 'Qual é a função de um Deployment?', 'b', [
          'Resolver nomes de domínio para endereços da internet para os usuários do cluster',
          'Manter o número desejado de réplicas e atualizar de forma gradual',
          'Criptografar o tráfego entre os nós do cluster',
          'Gerar relatórios de custo do cluster'
        ], 'O Deployment declara quantas réplicas queremos e o controlador as mantém, inclusive em atualizações.'),
        fill('q8', 'Complete: o orquestrador compara o estado ___ (o que você declarou) com o estado real e corrige a diferença.', 'estado ___ : 3 réplicas  |  estado real: 2 réplicas  ->  cria 1', ['desejado', 'o desejado'], 'Orquestradores são declarativos: você descreve o estado desejado, e o laço de reconciliação o mantém.')
      ]
    },
    {
      id: 'cdb-24-resiliencia-basica',
      title: 'Resiliência básica',
      goal: 'Aplicar timeouts, retentativas com backoff e jitter, idempotência, circuit breaker, bulkhead, limitação de taxa e degradação graciosa.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Timeouts: nunca esperar para sempre',
            'Toda chamada pela rede precisa de um tempo limite (timeout). Sem ele, se o outro lado travar, o seu código espera indefinidamente e vai acumulando threads e conexões presas até esgotar os recursos e cair também: a falha de um serviço se espalha. Com timeout, você desiste, pode tentar de novo ou responder com um erro claro. Escolha o valor com base no que é normal para a operação, com alguma folga.',
            `import urllib.request
urllib.request.urlopen('http://127.0.0.1:9001/kv/x', timeout=2)
# se nada responder em 2 s, levanta uma exceção em vez de travar`
          ),
          sl(
            'Retentativas com backoff exponencial',
            'Muitas falhas são transitórias (um instante de sobrecarga, uma rede que oscilou), e tentar de novo resolve. Mas regras valem: limite o número de tentativas, tente de novo só em erros que podem ser transitórios, e só em operações idempotentes (ou protegidas por chave de idempotência). Entre as tentativas, espere cada vez mais: o backoff exponencial dobra a espera a cada falha (por exemplo 0,1 s, 0,2 s, 0,4 s, 0,8 s), dando tempo ao serviço para se recuperar em vez de bombardeá-lo.'
          ),
          sl(
            'Jitter: por que sem ele vira tempestade',
            'Imagine mil clientes que falharam ao mesmo tempo. Com backoff exponencial puro, todos esperam exatamente 0,1 s e tentam juntos, depois 0,2 s e tentam juntos de novo: chegam em ondas sincronizadas que podem derrubar de novo um serviço que tentava se recuperar (tempestade de retentativas, ou thundering herd). O jitter é um sorteio aleatório na espera, o que espalha as tentativas no tempo. O código abaixo usa a variante em que a espera é sorteada entre 0 e o teto exponencial. A saída tem valores aleatórios; os seus serão parecidos, não idênticos.',
            `def com_retry(operacao, tentativas=5, base=0.1, teto=2.0):
    for n in range(tentativas):
        try:
            return operacao()
        except ConnectionError as erro:
            if n == tentativas - 1:
                raise
            espera = random.uniform(0, min(teto, base * 2 ** n))
            print(f'tentativa {n + 1} falhou ({erro}); esperando {espera:.2f}s')
            time.sleep(espera)

# saída (com random.seed(1) e duas falhas simuladas):
# tentativa 1 falhou (servico indisponivel); esperando 0.01s
# tentativa 2 falhou (servico indisponivel); esperando 0.17s
# ok`
          ),
          sl(
            'Idempotência e chave de idempotência',
            'Retentar só é seguro se repetir não causar efeito duplicado. Se você manda "cobrar R$ 50" e a resposta se perde por timeout, não sabe se a cobrança ocorreu; retentar poderia cobrar duas vezes. A solução é a chave de idempotência: o cliente gera um identificador único para a operação e o envia em todas as tentativas; o servidor guarda as chaves já processadas e, se vê a mesma chave de novo, devolve o resultado anterior em vez de repetir o efeito.',
            'POST /cobrancas\nIdempotency-Key: <chave-unica>\n{valor: 50}\n\n1ª vez: cobra. Repetição com a mesma chave: devolve o resultado anterior.'
          ),
          sl(
            'Circuit breaker (disjuntor)',
            'Se um serviço está claramente fora do ar, continuar chamando só desperdiça tempo e piora a situação. O circuit breaker funciona como o disjuntor da sua casa, com três estados. Fechado: tudo normal, as chamadas passam. Aberto: depois de falhas demais, as chamadas falham imediatamente, sem nem tentar, por um tempo. Semiaberto: passado esse tempo, deixa passar poucas chamadas de teste; se derem certo, volta a fechado; se falharem, abre de novo.',
            'FECHADO --falhas demais--> ABERTO --passou o tempo--> SEMIABERTO\n   ^                                                   |\n   +---------------- testes deram certo ---------------+'
          ),
          sl(
            'Bulkhead e limitação de taxa',
            'Bulkhead (anteparo, como as divisórias de um navio) isola recursos por função: pools de conexões ou de threads separados para cada dependência, de modo que uma dependência lenta consuma apenas o seu pool e não derrube o resto. A limitação de taxa (rate limiting) restringe quantas requisições um cliente pode fazer por período; passando do limite, o servidor recusa (normalmente com o código HTTP 429, Too Many Requests). Isso protege o serviço contra sobrecarga e abusos.',
            'pool de pagamentos:      10 conexões\npool de recomendações:    5 conexões   (se travar, o pagamento segue)'
          ),
          sl(
            'Degradação graciosa',
            'Quando uma parte falha, é melhor entregar menos do que falhar tudo. Degradação graciosa é oferecer uma versão reduzida do serviço: se o serviço de recomendações cai, a loja mostra produtos populares (ou esconde o bloco) e a compra continua; se o cache cai, vai ao banco mais devagar; se a imagem não carrega, mostra um espaço reservado. Para isso, é preciso decidir de antemão o que é essencial e o que é opcional.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que pode acontecer se uma chamada de rede não tiver timeout?', 'c', [
          'Ela será automaticamente repetida pelo sistema operacional até dar certo',
          'Ela falhará imediatamente, pois a rede não aceita espera longa',
          'Pode ficar presa para sempre, acumulando threads e conexões',
          'Ela receberá uma resposta de erro padrão do outro lado'
        ], 'Sem tempo limite, uma dependência travada prende os recursos do chamador, que pode cair também.'),
        mcq('q2', 'Com base 0,1 s e backoff exponencial (espera = 0,1 x 2^n, começando em n = 0), qual é a espera antes da 4ª retentativa (n = 3), sem jitter?', 'a', [
          '0,8 s',
          '0,4 s',
          '0,3 s',
          '1,6 s'
        ], 'As esperas dobram: 0,1; 0,2; 0,4; 0,8.'),
        mcq('q3', 'Por que adicionar jitter ao backoff?', 'd', [
          'Para que a espera total seja sempre exatamente a mesma',
          'Para eliminar a necessidade de limitar o número de tentativas feitas pelo cliente',
          'Para fazer o servidor processar mais de uma tentativa por vez',
          'Para espalhar as tentativas no tempo e evitar ondas sincronizadas de clientes retentando juntos'
        ], 'Sem jitter, clientes sincronizados retentam juntos e podem derrubar de novo o serviço que se recuperava.'),
        fill('q4', 'Complete o estado do circuit breaker em que poucas chamadas de teste são liberadas.', 'fechado (normal) -> aberto (falha rápido) -> ___ (poucas chamadas de teste)', ['semiaberto', 'semi-aberto', 'meio-aberto', 'half-open', 'meio aberto'], 'No semiaberto o disjuntor testa se a dependência voltou; se sim, fecha, se não, abre de novo.'),
        mcq('q5', 'Uma cobrança deu timeout e você quer retentar. Como fazer isso com segurança?', 'b', [
          'Retentar sem nenhum cuidado, pois o servidor sempre detecta duplicatas por conta própria',
          'Enviar a mesma chave de idempotência em todas as tentativas',
          'Gerar uma chave nova em cada tentativa para diferenciar os pedidos',
          'Nunca retentar nenhuma operação de rede em nenhuma situação'
        ], 'A mesma chave permite ao servidor reconhecer a repetição e devolver o resultado anterior, sem cobrar duas vezes.'),
        mcq('q6', 'Qual o objetivo do padrão bulkhead?', 'a', [
          'Isolar recursos por função, contendo o estrago',
          'Repetir automaticamente chamadas até que alguma funcione',
          'Distribuir requisições igualmente entre todas as réplicas disponíveis no momento',
          'Guardar em cache todas as respostas para sempre'
        ], 'Com pools separados, o problema de uma dependência fica contido nela.'),
        mcq('q7', 'O serviço de recomendações saiu do ar. Qual comportamento ilustra degradação graciosa?', 'd', [
          'A página inteira de produtos retorna erro 500 para todos enquanto o serviço estiver fora',
          'O sistema desliga também o pagamento até tudo voltar',
          'O carrinho passa a ficar vazio para todos os clientes',
          'A loja mostra produtos populares e a compra continua'
        ], 'Entregar uma versão reduzida mantém o essencial (comprar) funcionando enquanto o opcional está fora.'),
        fill('q8', 'Complete: restringir quantas requisições um cliente pode fazer por período (respondendo 429 ao passar do limite) é a limitação de ___.', 'Limitação de ___ (rate limiting): responde 429 quando o cliente passa do limite', ['taxa', 'taxa (rate limiting)'], 'A limitação de taxa protege o serviço de sobrecarga e abuso.')
      ]
    },
    {
      id: 'cdb-25-observabilidade-basica',
      title: 'Observabilidade básica',
      goal: 'Usar logs, métricas, traces, identificador de correlação, health checks e alertas, sem vazar dados pessoais.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que depurar sistemas distribuídos é difícil',
            'Em um programa só você usa um depurador e vê tudo. Em um sistema distribuído, uma ação do usuário atravessa vários serviços em máquinas diferentes, cada um com seus logs e relógios; as falhas são parciais e muitas vezes intermitentes, e o problema pode estar em qualquer salto. Observabilidade é a capacidade de entender o que acontece por dentro olhando as saídas do sistema: logs, métricas e traces, os três pilares.'
          ),
          sl(
            'Logs',
            'Logs são registros de eventos, linha a linha, com data e hora: o que aconteceu, onde e com que resultado. Prefira logs estruturados (campos como JSON: nível, serviço, mensagem, id da requisição) em vez de texto livre, pois ficam fáceis de buscar e filtrar entre muitos serviços. Use níveis (info, warning, error) com critério. Logs mostram detalhes de eventos individuais, mas são volumosos e não resumem tendências.',
            '{"nivel":"error","servico":"pagamentos","msg":"timeout ao cobrar","id_requisicao":"<id>","pedido":9001}'
          ),
          sl(
            'Métricas',
            'Métricas são números agregados ao longo do tempo: requisições por segundo, taxa de erros, uso de CPU, tamanho de filas e, muito importante, latência em percentis (p95, p99: o tempo abaixo do qual ficam 95% ou 99% das requisições; a média esconde os casos lentos). São baratas de guardar, boas para painéis e alertas e para ver tendências ("a latência subiu nos últimos 10 minutos"), mas não dizem o detalhe de uma requisição específica.'
          ),
          sl(
            'Traces e identificador de correlação',
            'Um trace acompanha UMA requisição ao longo de todos os serviços que ela atravessa, dividido em spans (um por etapa), mostrando quanto tempo cada serviço gastou e onde ocorreu a falha. Para isso funcionar, existe o identificador de correlação (ou id de trace): um id gerado na entrada do sistema e repassado em todas as chamadas seguintes (em um cabeçalho HTTP, por exemplo) e gravado em todo log. Assim, buscando esse id, você reúne tudo o que aconteceu com aquela requisição em todos os serviços.',
            'cliente -> API [id=abc] -> estoque [id=abc] -> pagamento [id=abc]\nlogs de todos têm id_requisicao=abc  => dá para juntar a história'
          ),
          sl(
            'Health checks: liveness e readiness',
            'Health checks são endpoints simples que orquestradores e balanceadores consultam. Liveness ("estou vivo?") detecta processos travados: se falha, o processo deve ser reiniciado. Readiness ("estou pronto para receber tráfego?") indica se a instância consegue atender agora (já conectou ao banco, terminou de iniciar): se falha, a instância é retirada do balanceamento, sem necessariamente ser reiniciada, e volta quando ficar pronta. Misturar os dois é um erro comum: se o banco cai e a liveness falha por causa disso, todas as instâncias seriam reiniciadas à toa.',
            'GET /healthz  -> estou vivo?     (falhou: reinicie)\nGET /readyz   -> estou pronto?    (falhou: tire do balanceador)'
          ),
          sl(
            'Painéis e alertas',
            'Painéis (dashboards) mostram métricas em gráficos para acompanhar a saúde do sistema. Alertas avisam pessoas quando algo exige ação. Alerte sobre sintomas que afetam usuários (taxa de erros alta, latência alta, fila crescendo sem parar) e não sobre cada oscilação de CPU; alertas demais geram fadiga e passam a ser ignorados. Todo alerta deve responder: o que está errado, qual o impacto e o que fazer primeiro.'
          ),
          sl(
            'Logs sem dados pessoais nem segredos (LGPD)',
            'Logs costumam ser copiados para vários lugares, ficam guardados por muito tempo e muita gente os acessa, então o que entra neles vira risco. Nunca grave senhas, tokens, chaves de API, números de cartão, nem dados pessoais desnecessários (documentos, e-mails, telefones). Registre identificadores internos (id do usuário) em vez do dado em si, mascare o que for inevitável, defina prazo de retenção e controle de acesso. Isso é minimização, princípio da LGPD, aplicado à observabilidade.',
            'RUIM:  login ok usuario=maria@exemplo.invalid senha=<senha> token=<token>\nBOM:   {"evento":"login_ok","id_usuario":42,"id_requisicao":"<id>"}'
          )
        ]
      },
      questions: [
        mcq('q1', 'Para que serve o identificador de correlação (id de trace)?', 'b', [
          'Para criptografar as mensagens entre os serviços',
          'Para seguir uma requisição entre os serviços',
          'Para escolher qual réplica do banco atenderá a leitura de cada usuário',
          'Para contar quantos usuários estão online no sistema'
        ], 'O id gerado na entrada e repassado a cada chamada permite reunir todos os registros de uma requisição.'),
        mcq('q2', 'A sonda de readiness de uma instância começa a falhar porque ela perdeu a conexão com o banco. O que o balanceador faz?', 'd', [
          'Reinicia a instância imediatamente, apagando seus dados locais',
          'Continua enviando tráfego, pois a instância ainda está viva',
          'Duplica a instância para dividir o problema entre as cópias',
          'Para de enviar tráfego a ela até que volte a ficar pronta'
        ], 'Readiness falhando significa "não consigo atender agora": a instância sai do balanceamento temporariamente.'),
        mcq('q3', 'Qual tipo de dado é o mais adequado para mostrar que a latência p95 subiu nos últimos 10 minutos?', 'c', [
          'Um trace único de uma requisição qualquer',
          'Uma linha de log de erro isolada',
          'Métricas agregadas ao longo do tempo',
          'O código-fonte da aplicação'
        ], 'Métricas resumem comportamento ao longo do tempo e são ideais para tendências e alertas.'),
        fill('q4', 'Complete: a pergunta "estou pronto para receber tráfego?" é respondida pela sonda de...', 'GET /ready  -> a instância está ___ para receber tráfego?', ['pronta', 'pronto', 'readiness', 'pronta (readiness)'], 'A sonda de readiness avisa se a instância pode atender agora. Liveness, por sua vez, indica se o processo deve ser reiniciado.'),
        mcq('q5', 'Por que preferir logs estruturados (por exemplo em JSON) a texto livre?', 'a', [
          'Porque ficam fáceis de buscar e filtrar por campos',
          'Porque ocupam sempre menos espaço que qualquer texto livre e são mais rápidos de gravar',
          'Porque dispensam o uso de métricas e de traces no sistema',
          'Porque impedem que informações pessoais sejam gravadas'
        ], 'Campos como serviço e id da requisição permitem consultas precisas. O conteúdo gravado ainda precisa ser cuidadoso.'),
        mcq('q6', 'Qual alerta é mais útil para a equipe?', 'd', [
          'Avisar toda vez que a CPU de qualquer servidor passar de um instante de pico por alguns segundos',
          'Avisar a cada requisição bem-sucedida que o sistema processar',
          'Avisar apenas uma vez por ano, no balanço geral',
          'Avisar quando a taxa de erros dos usuários passa do limite'
        ], 'Alertas devem sinalizar sintomas que exigem ação. Alertas ruidosos geram fadiga e são ignorados.'),
        mcq('q7', 'Qual registro de log é o mais adequado do ponto de vista de privacidade e segurança?', 'c', [
          'login ok usuario=maria@exemplo.invalid senha=<senha>',
          'requisicao com token=<token> e documento completo do cliente',
          '{"evento":"login_ok","id_usuario":42,"id_requisicao":"<id>"}',
          'dump completo do cartão de crédito usado na compra'
        ], 'Registre identificadores internos e o mínimo necessário; nunca senhas, tokens ou dados pessoais sensíveis desnecessários.'),
        fill('q8', 'Complete: o tipo de sonda que indica se o processo está travado e precisa ser reiniciado é a de ___.', 'GET /healthz -> estou vivo?  (sonda de ___; falhou: reinicie)', ['liveness', 'vivacidade', 'liveness probe'], 'Liveness detecta processos travados; readiness indica se a instância pode receber tráfego agora.')
      ]
    },
    {
      id: 'cdb-26-seguranca-privacidade-basica',
      title: 'Segurança e privacidade básicas',
      goal: 'Aplicar TLS, autenticação entre serviços, menor privilégio, segredos fora do código e noções básicas de LGPD em sistemas distribuídos.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'A rede não é confiável nem segura: TLS em trânsito',
            'Em um sistema distribuído, tudo conversa pela rede, e qualquer salto entre dois nós pode ser espionado ou adulterado. Por isso os dados em trânsito devem ser protegidos com TLS (o mesmo que dá o cadeado do HTTPS), que garante confidencialidade (ninguém no caminho lê), integridade (ninguém altera sem ser notado) e autenticação do servidor (por meio de um certificado, você sabe com quem fala). Uma "rede interna" não dispensa isso: um invasor que entra em um nó pode observar o tráfego dos demais.'
          ),
          sl(
            'Autenticação entre serviços: tokens e mTLS',
            'Serviços também precisam se identificar uns aos outros; senão, qualquer coisa que alcance a porta pode chamá-lo. Duas abordagens comuns: tokens (o chamador apresenta um token assinado, com escopo limitado e validade curta) e mTLS (TLS mútuo): além de o cliente verificar o certificado do servidor, o servidor verifica o certificado do cliente, e os dois se autenticam. Autenticar é descobrir QUEM é; autorizar é decidir o que essa identidade PODE fazer. As duas coisas são necessárias.'
          ),
          sl(
            'Menor privilégio',
            'O princípio do menor privilégio diz que cada serviço, usuário ou processo deve ter apenas as permissões necessárias para fazer seu trabalho, e nenhuma a mais. Um serviço de relatórios que só lê dados recebe credencial somente leitura; um serviço que grava em um bucket não precisa poder apagar todos. Assim, se uma credencial vazar ou um serviço for invadido, o estrago fica limitado.',
            'serviço de relatórios -> banco: SOMENTE LEITURA\nserviço de pedidos      -> banco: leitura + escrita nas suas tabelas'
          ),
          sl(
            'Segredos fora do código',
            'Segredos (senhas, chaves de API, tokens, chaves privadas) nunca ficam no código-fonte nem no repositório: o histórico do Git guarda tudo para sempre e muita gente tem acesso. Eles são entregues em tempo de execução, por variáveis de ambiente ou, melhor, por um gerenciador de segredos, com acesso controlado e possibilidade de rotação (trocar periodicamente). Se um segredo vazou, considere-o comprometido: revogue e gere outro, apagar do repositório não basta.',
            `# errado: segredo dentro do código
API_KEY = '<chave>'

# melhor: lido do ambiente, injetado na execução
import os
api_key = os.environ['API_KEY']`
          ),
          sl(
            'Superfície de ataque e risco replicado',
            'Superfície de ataque é o conjunto de pontos por onde alguém pode tentar entrar: cada nó, porta aberta, serviço e API a mais é um alvo a proteger e a manter atualizado. Dividir um sistema em muitos serviços aumenta essa superfície, então exponha o mínimo (por exemplo, só um gateway público) e feche o resto. Outro ponto: replicar dados também replica o risco. Dados em três réplicas, em backups, em caches, em filas e em logs são vários lugares a proteger com criptografia e controle de acesso.'
          ),
          sl(
            'LGPD básica: minimização, finalidade e eliminação',
            'Conceitos básicos da LGPD (Lei Geral de Proteção de Dados) que afetam o projeto: finalidade (usar os dados só para o propósito informado ao titular), minimização ou necessidade (coletar apenas o mínimo necessário para essa finalidade), e transparência. Também importa saber onde os dados ficam (inclusive em réplicas, caches, filas, logs e backups) para conseguir atender direitos do titular, como a eliminação de dados quando cabível: se o dado foi copiado para vários lugares, é preciso apagá-lo ou anonimizá-lo em todos eles, respeitando os prazos de retenção de backups definidos pela política da organização.'
          ),
          sl(
            'Ressalva importante',
            'O conteúdo desta lição são conceitos técnicos e jurídicos básicos, para você projetar com consciência. Ele não substitui orientação jurídica nem o trabalho do encarregado de proteção de dados (DPO) da organização, que decidem os casos concretos: base legal, prazos, transferências, incidentes. Em dúvida sobre dados pessoais, pergunte antes de construir. E nos seus estudos, use sempre dados fictícios.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Do que o TLS protege os dados em trânsito?', 'd', [
          'De falhas de hardware dos servidores e de queda de energia',
          'De erros de lógica no código da aplicação',
          'De dados duplicados na fila de mensagens',
          'De espionagem e alteração no caminho pela rede'
        ], 'TLS dá confidencialidade, integridade e autenticação do servidor. Não resolve bugs nem duplicatas.'),
        mcq('q2', 'O que caracteriza o mTLS?', 'c', [
          'Apenas o cliente verifica o certificado do servidor',
          'Nenhum dos lados usa certificados, apenas senhas',
          'Os dois lados apresentam certificados e se autenticam mutuamente',
          'O tráfego fica sem criptografia dentro da rede interna'
        ], 'Em TLS mútuo o servidor também autentica o cliente por certificado.'),
        mcq('q3', 'Uma chave de API foi enviada por engano ao repositório. Qual a melhor ação?', 'a', [
          'Revogar a chave e gerar uma nova',
          'Apagar o arquivo no próximo commit e considerar o assunto resolvido, já que a chave sumiu do código atual',
          'Manter a chave, já que o repositório é interno à empresa',
          'Trocar apenas o nome da variável que guarda a chave'
        ], 'O histórico do repositório mantém a chave. Ela deve ser considerada comprometida e substituída.'),
        fill('q4', 'Complete o princípio: cada serviço deve ter apenas as permissões de que precisa.', 'Cada serviço recebe só o acesso de que precisa: princípio do menor ___', ['privilégio', 'privilegio'], 'Menor privilégio limita o estrago caso uma credencial vaze ou um serviço seja invadido.'),
        mcq('q5', 'Dados sensíveis estão replicados em três nós, em backups e em caches. O que isso significa para a segurança?', 'b', [
          'O risco diminui, pois uma cópia compensa a outra',
          'Há mais lugares a proteger: a replicação também replica o risco de vazamento',
          'Só a cópia principal precisa ter controle de acesso e criptografia',
          'As cópias deixam de ser dados pessoais por estarem replicadas'
        ], 'Cada cópia é um alvo possível. Réplicas, backups e caches precisam das mesmas proteções.'),
        mcq('q6', 'Um sistema coletou e-mails para enviar o recibo de uma compra e depois quer usá-los para uma campanha sem relação. Que princípio da LGPD é afetado?', 'c', [
          'Disponibilidade, que trata de manter o serviço no ar mesmo durante falhas de nós',
          'Replicação, que trata de copiar dados entre nós',
          'Finalidade, que exige usar os dados só para o propósito informado',
          'Latência, que trata de reduzir o tempo de resposta'
        ], 'Finalidade: o uso dos dados deve ser compatível com o propósito informado ao titular.'),
        mcq('q7', 'Esta lição substitui a orientação de um advogado ou do encarregado de dados (DPO)?', 'a', [
          'Não, traz só conceitos básicos; casos concretos pedem orientação',
          'Sim, pois cobre completamente a LGPD e suas exceções em qualquer tipo de organização',
          'Sim, desde que todos os dados estejam em uma única região',
          'Não, mas só porque ainda não há lei de proteção de dados no Brasil'
        ], 'Conceitos básicos ajudam a projetar, mas decisões sobre base legal, prazos e incidentes são da assessoria jurídica e do DPO.'),
        fill('q8', 'Complete: coletar apenas o mínimo necessário para a finalidade é o princípio da ___ (necessidade).', 'Coletar só o mínimo necessário -> princípio da ___', ['necessidade', 'minimização', 'minimizacao', 'minimização de dados'], 'Minimização ou necessidade: quanto menos dados coletados, menor o risco e menos lugares a proteger e a eliminar depois.')
      ]
    },
    {
      id: 'cdb-27-laboratorio-local',
      title: 'Laboratório local',
      goal: 'Montar um ambiente local e seguro para praticar sistemas distribuídos e simular falhas sem nuvem.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Vários processos, portas diferentes',
            'Você não precisa de nuvem para praticar. Cada "nó" pode ser um processo na sua máquina escutando em uma porta diferente do endereço local 127.0.0.1 (localhost). Portas diferentes são necessárias porque dois processos não podem escutar a mesma combinação de endereço e porta ao mesmo tempo. Um servidor HTTP mínimo já serve para experimentar.',
            '# terminal 1\npython -m http.server 8001 --bind 127.0.0.1\n# terminal 2\npython -m http.server 8002 --bind 127.0.0.1'
          ),
          sl(
            'Python: threading, multiprocessing e socket',
            'Em Python você tem três ferramentas principais. threading cria threads no mesmo processo (memória compartilhada, como vimos na lição de concorrência). multiprocessing cria processos separados, com memória separada, que se comunicam por mensagens: isso se parece mais com nós de verdade. socket é a base de rede: abrir portas, conectar e trocar bytes. O exemplo roda um servidor de eco e um cliente na mesma máquina.',
            `def servidor(pronto):
    with socket.socket() as s:
        s.bind(('127.0.0.1', 9100))
        s.listen()
        pronto.set()
        conn, _ = s.accept()
        with conn:
            dados = conn.recv(1024)
            conn.sendall(b'eco: ' + dados)

# cliente: connect em 127.0.0.1:9100, envia b'ola'
# saída: eco: ola`
          ),
          sl(
            'docker compose com vários serviços',
            'Para subir vários serviços de uma vez, com redes e dependências, use o docker compose: um arquivo descreve cada serviço (imagem, portas, variáveis) e um comando sobe tudo. É a forma mais próxima de um mini cluster na sua máquina. Como escrever Dockerfiles e arquivos Compose está no curso de Containers; aqui basta saber que ele serve de laboratório. Os valores do exemplo são fictícios, e segredos viriam de variáveis, nunca escritos no arquivo.',
            `services:
  api:
    image: <imagem-da-api>
    ports: ["127.0.0.1:8001:8000"]
  cache:
    image: <imagem-do-cache>

# docker compose up -d`
          ),
          sl(
            'Simular falhas',
            'O valor do laboratório é provocar falhas de propósito. A mais simples: matar um processo (Ctrl+C, o comando kill, ou docker stop) e observar o que o resto do sistema faz. Para simular lentidão e perda de pacotes, existem ferramentas: no Linux, o recurso netem do comando tc injeta atraso e perda na interface de rede; proxies de falha, como o Toxiproxy, ficam entre dois serviços e introduzem latência ou cortes; e no seu próprio código você pode sortear atrasos e exceções. Aqui é só a visão geral: o importante é a ideia de injetar a falha em um ambiente controlado.',
            `import random, time
def chamada_instavel():
    time.sleep(random.uniform(0, 0.5))      # atraso aleatório
    if random.random() < 0.3:                # 30% de falha
        raise ConnectionError('falha simulada')`
          ),
          sl(
            'Ferramentas de linha de comando: curl e nc',
            'O curl faz requisições HTTP pelo terminal: com -i mostra também os cabeçalhos da resposta, e -X escolhe o método (PUT, POST). O nc (netcat) abre conexões TCP cruas, e com -z testa se uma porta está aceitando conexão. Com elas você inspeciona seus nós sem escrever código. No Windows o curl costuma existir no terminal; o nc pode precisar ser instalado ou substituído por um teste equivalente.',
            'curl -i http://127.0.0.1:8001/\ncurl -X PUT -d \'{"valor": 7}\' http://127.0.0.1:9001/kv/estoque\nnc -zv 127.0.0.1 8001'
          ),
          sl(
            'Ambiente isolado e seguro',
            'Regras do laboratório: (1) faça tudo em 127.0.0.1, sem expor portas à rede com 0.0.0.0, pois qualquer um na mesma rede poderia acessar seus experimentos; (2) NUNCA teste falhas, carga ou ataques em redes e serviços de terceiros ou em produção sem autorização, e injetar falhas é para o seu ambiente; (3) use apenas dados fictícios (nomes e números inventados), jamais dados reais de pessoas, em experimentos; (4) nada de senhas ou chaves reais em arquivos de exemplo, use placeholders. Assim você aprende sem causar danos nem violar a LGPD.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que cada nó do laboratório local usa uma porta diferente?', 'a', [
          'Porque dois processos não escutam o mesmo endereço e porta juntos',
          'Porque o Python só permite uma porta por script em execução de cada vez na máquina',
          'Porque a porta define quantas réplicas o banco terá',
          'Porque as portas diferentes aceleram a rede da máquina'
        ], 'Cada combinação de endereço e porta só pode ser ocupada por um processo escutando.'),
        mcq('q2', 'O que muda ao escutar em 127.0.0.1 em vez de 0.0.0.0?', 'b', [
          'O servidor fica mais rápido, pois ignora a camada de rede',
          'Só aceita conexões da própria máquina',
          'O servidor passa a usar TLS automaticamente nas conexões',
          'O servidor passa a aceitar conexões apenas de outros países ou de outras redes'
        ], '127.0.0.1 é o endereço local (loopback). Com 0.0.0.0 o serviço escuta em todas as interfaces e pode ficar acessível à rede.'),
        mcq('q3', 'Você quer testar o que acontece quando um seguidor do seu armazenamento de teste cai. Qual ação é adequada?', 'd', [
          'Derrubar o servidor de um serviço de terceiros para observar o efeito',
          'Sobrecarregar um site público para ver como ele se recupera',
          'Fazer o teste direto no ambiente de produção da empresa',
          'Encerrar, na sua máquina, o processo que representa o seguidor'
        ], 'Falhas se injetam em ambiente controlado e seu. Nunca em sistemas de terceiros ou em produção sem autorização.'),
        fill('q4', 'Complete o comando que faz uma requisição HTTP pelo terminal.', '___ -i http://127.0.0.1:8001/', ['curl', 'curl.exe'], 'O curl com -i mostra também os cabeçalhos da resposta.'),
        mcq('q5', 'Por que multiprocessing se parece mais com nós distribuídos do que threading?', 'c', [
          'Porque threads nunca conseguem executar código ao mesmo tempo',
          'Porque o multiprocessing exige conexão com a nuvem para funcionar',
          'Porque processos têm memória separada e se comunicam por mensagens, como nós',
          'Porque o multiprocessing dispensa qualquer coordenação entre as partes'
        ], 'Threads compartilham memória. Processos isolados trocam mensagens, como nós em máquinas diferentes.'),
        mcq('q6', 'Qual abordagem é a mais apropriada para simular atraso e perda de pacotes no laboratório?', 'b', [
          'Usar um proxy de falhas ou injeção de atraso na sua própria máquina ou containers de teste',
          'Aplicar a ferramenta na rede Wi-Fi compartilhada do escritório',
          'Aplicar o atraso nas máquinas de um provedor sem avisar ninguém',
          'Desligar o roteador da empresa durante o expediente'
        ], 'Ferramentas de injeção de falhas são usadas em ambiente controlado e de sua propriedade.'),
        mcq('q7', 'Que tipo de dados usar nos experimentos do laboratório?', 'd', [
          'Uma cópia dos dados reais de clientes, para ficar realista',
          'Os dados de um colega, com a autorização verbal dele',
          'Dados reais anonimizados de forma simples, sem revisão',
          'Dados fictícios, inventados só para o experimento'
        ], 'Dados fictícios eliminam o risco de vazamento e respeitam a LGPD durante o aprendizado.'),
        fill('q8', 'Complete o comando que sobe vários serviços descritos em um arquivo, usando o Docker.', 'docker ___ up -d', ['compose'], 'O docker compose sobe e conecta vários serviços descritos em um arquivo.')
      ]
    },
    {
      id: 'cdb-28-mini-kv-replicado',
      title: 'Prática: mini armazenamento chave-valor replicado',
      goal: 'Construir em Python um armazenamento chave-valor com líder e seguidores e observar replicação, defasagem e queda de um nó.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O plano',
            'Vamos juntar vários conceitos do nível em um programa que você roda: três nós HTTP na sua máquina (portas 9001, 9002 e 9003). O nó 9001 é o líder e aceita escritas; 9002 e 9003 são seguidores que recebem cópias. Leituras podem ir a qualquer nó. A replicação é assíncrona: o líder responde ao cliente primeiro e envia aos seguidores depois. Tudo em um arquivo, só com a biblioteca padrão do Python, em 127.0.0.1 e com dados fictícios.',
            'cliente --PUT--> LÍDER 9001 --replica--> seguidor 9002\n                       |                  --> seguidor 9003\ncliente --GET--> qualquer nó'
          ),
          sl(
            'Parte 1: a classe No',
            'Cada nó guarda um dicionário em memória, um papel (líder ou seguidor), uma trava (lock, para as threads do servidor HTTP não corromperem o dicionário, lembra da lição de concorrência) e, no líder, uma fila por seguidor com as escritas a replicar. O atributo atraso serve para simular lag.',
            `import json
import queue
import threading
import time
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


class No:
    def __init__(self, porta, papel, seguidores=()):
        self.porta = porta
        self.papel = papel                  # 'lider' ou 'seguidor'
        self.dados = {}
        self.trava = threading.Lock()
        self.atraso = 0.0                   # só seguidores: simula lag
        self.filas = {p: queue.Queue() for p in seguidores}
        self.servidor = None`
          ),
          sl(
            'Parte 2: o servidor HTTP do nó',
            'O GET lê do dicionário local. O PUT só é aceito no líder (o seguidor responde 405, "método não permitido"); o líder grava, enfileira a escrita para cada seguidor e responde sem esperar. O POST em /replica é a rota interna que os seguidores usam para aplicar as escritas recebidas, com o atraso simulado. Estes métodos ficam dentro de iniciar(), dentro da classe No.',
            `    def iniciar(self):
        no = self

        class Handler(BaseHTTPRequestHandler):
            def log_message(self, *args):   # silencia o log padrão
                pass

            def responder(self, codigo, corpo):
                dados = json.dumps(corpo).encode()
                self.send_response(codigo)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(dados)))
                self.end_headers()
                self.wfile.write(dados)

            def ler_corpo(self):
                tamanho = int(self.headers.get('Content-Length', 0))
                return json.loads(self.rfile.read(tamanho) or b'{}')

            def do_GET(self):
                chave = self.path.removeprefix('/kv/')
                with no.trava:
                    if chave in no.dados:
                        return self.responder(200, {'chave': chave, 'valor': no.dados[chave]})
                self.responder(404, {'erro': 'nao encontrada'})

            def do_PUT(self):
                if no.papel != 'lider':
                    return self.responder(405, {'erro': 'escreva no lider'})
                chave = self.path.removeprefix('/kv/')
                valor = self.ler_corpo()['valor']
                with no.trava:
                    no.dados[chave] = valor
                for fila in no.filas.values():      # replica sem esperar (assíncrono)
                    fila.put((chave, valor))
                self.responder(200, {'ok': True})

            def do_POST(self):                      # rota interna de replicação
                time.sleep(no.atraso)
                corpo = self.ler_corpo()
                with no.trava:
                    no.dados[corpo['chave']] = corpo['valor']
                self.responder(200, {'ok': True})

        self.servidor = ThreadingHTTPServer(('127.0.0.1', self.porta), Handler)
        threading.Thread(target=self.servidor.serve_forever, daemon=True).start()

    def parar(self):
        self.servidor.shutdown()
        self.servidor.server_close()`
          ),
          sl(
            'Parte 3: replicação com reenvio e funções do cliente',
            'Para cada seguidor há uma thread que retira escritas da fila na ordem e as envia por HTTP. Se o seguidor não responde (caiu), a thread tenta de novo a cada 0,2 s até conseguir, e só então passa à próxima escrita, preservando a ordem. É assim que um seguidor que volta alcança o líder (catch-up). Note o timeout de 2 s na chamada. Em seguida, duas funções simples para o cliente. Estes métodos também ficam dentro da classe No (os dois primeiros) e fora dela (put e get).',
            `    def iniciar_replicacao(self):
        for porta, fila in self.filas.items():
            threading.Thread(target=self.enviar_para, args=(porta, fila), daemon=True).start()

    def enviar_para(self, porta, fila):
        while True:
            chave, valor = fila.get()
            while True:                              # tenta até o seguidor voltar
                try:
                    req = urllib.request.Request(
                        f'http://127.0.0.1:{porta}/replica',
                        data=json.dumps({'chave': chave, 'valor': valor}).encode(),
                        method='POST')
                    urllib.request.urlopen(req, timeout=2).read()
                    break
                except OSError:
                    time.sleep(0.2)


def put(porta, chave, valor):
    req = urllib.request.Request(f'http://127.0.0.1:{porta}/kv/{chave}',
                                 data=json.dumps({'valor': valor}).encode(), method='PUT')
    return urllib.request.urlopen(req, timeout=2).status


def get(porta, chave):
    try:
        with urllib.request.urlopen(f'http://127.0.0.1:{porta}/kv/{chave}', timeout=2) as r:
            return json.load(r)['valor']
    except urllib.error.HTTPError:
        return None`
          ),
          sl(
            'Parte 4: o experimento (rode e observe)',
            'Sobe os três nós, deixa o seguidor 1 lento (lag de 0,5 s), grava no líder e lê em cada nó. Depois derruba o seguidor 2, grava de novo, faz o seguidor voltar e observa o catch-up. Por fim, tenta escrever em um seguidor. Nos prints, "None" significa que o valor ainda não chegou ao nó. Os tempos dos sleeps dão folga suficiente na maioria das máquinas, mas é timing real: em máquinas muito lentas o resultado pode variar.',
            `if __name__ == '__main__':
    s1, s2 = No(9002, 'seguidor'), No(9003, 'seguidor')
    lider = No(9001, 'lider', seguidores=[9002, 9003])
    for n in (s1, s2, lider):
        n.iniciar()
    lider.iniciar_replicacao()

    s1.atraso = 0.5                                   # seguidor 1 fica lento
    put(9001, 'estoque:caneca', 7)
    time.sleep(0.1)
    print('lider     :', get(9001, 'estoque:caneca'))
    print('seguidor 2:', get(9003, 'estoque:caneca'))
    print('seguidor 1 (lag):', get(9002, 'estoque:caneca'))
    time.sleep(1)
    print('seguidor 1 depois:', get(9002, 'estoque:caneca'))

    s2.parar()                                        # seguidor 2 cai
    put(9001, 'estoque:caneca', 6)
    time.sleep(0.5)
    print('lider (s2 fora):', get(9001, 'estoque:caneca'))
    s2.iniciar()                                      # volta com dados antigos
    print('seguidor 2 ao voltar:', get(9003, 'estoque:caneca'))
    time.sleep(0.8)
    print('seguidor 2 apos catch-up:', get(9003, 'estoque:caneca'))
    try:
        put(9002, 'x', 1)
    except urllib.error.HTTPError as e:
        print('escrita no seguidor ->', e.code)

# saída:
# lider     : 7
# seguidor 2: 7
# seguidor 1 (lag): None
# seguidor 1 depois: 7
# lider (s2 fora): 6
# seguidor 2 ao voltar: 7
# seguidor 2 apos catch-up: 6
# escrita no seguidor -> 405`
          ),
          sl(
            'O que o experimento mostrou',
            'Lag: logo após a escrita, o seguidor lento devolveu None; lê-lo dá um valor defasado (consistência eventual: com o tempo ele converge, mas não há garantia de leitura imediata). Queda: o seguidor 2 voltou com o valor antigo (7) e depois alcançou o líder (6), porque o líder reenviou a escrita pendente. Papéis: só o líder aceita escritas (405 nos seguidores), o que dá uma ordem única às escritas. E a replicação assíncrona tem um custo: o líder confirmou ao cliente antes de os seguidores terem a cópia.'
          ),
          sl(
            'O que falta (e onde você aprende)',
            'Este é um brinquedo. Faltam muitas coisas de verdade: eleição de líder (se o líder cai, quem assume, sem dois líderes ao mesmo tempo?); garantias de consistência (leituras sempre atualizadas, quorum); persistência em disco (tudo está em memória, e as filas também: se o líder cair, escritas ainda não replicadas se perdem, apesar de já confirmadas ao cliente); ressincronização completa de um seguidor que ficou fora por muito tempo; autenticação e TLS entre os nós; limites e tratamento de erros. Esses temas são os dos níveis intermediário e avançado deste curso, como consenso, replicação em profundidade e tolerância a falhas.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que, no código, escrever em um seguidor devolve 405?', 'c', [
          'Porque o seguidor está sempre fora do ar quando recebe escritas vindas do cliente',
          'Porque o Python proíbe métodos PUT em servidores secundários',
          'Porque só o líder aceita escritas, o que ordena todas',
          'Porque a chave informada tinha caracteres inválidos'
        ], 'Aceitar escritas em um único nó simplifica a ordem. Os seguidores só recebem as cópias.'),
        mcq('q2', 'Logo depois de gravar no líder, uma leitura no seguidor lento retorna None. O que isso ilustra?', 'd', [
          'Que a escrita foi perdida definitivamente pelo líder',
          'Que o seguidor rejeitou a escrita por falta de permissão',
          'Que o líder precisa ser reiniciado para sincronizar',
          'Defasagem (lag): o seguidor ainda não recebeu o dado replicado'
        ], 'O líder responde antes de replicar. Leituras em seguidores podem estar defasadas por um tempo.'),
        mcq('q3', 'Como o seguidor 2 alcança o líder depois de voltar?', 'b', [
          'Ele apaga todos os dados e pede ao cliente que os reenvie do início',
          'O líder continua tentando enviar a escrita pendente, em ordem, até conseguir',
          'O cliente replica manualmente o dado para o seguidor',
          'O seguidor elege a si mesmo como líder e impõe seu valor'
        ], 'O líder mantém a escrita na fila e reenvia, em ordem, até o seguidor responder.'),
        fill('q4', 'Complete: replicação em que o líder responde ao cliente sem esperar pelos seguidores é...', 'líder grava -> responde ao cliente -> replica depois;  replicação ___', ['assíncrona', 'assincrona', 'assíncrono', 'assincrono'], 'Na replicação assíncrona, o líder confirma antes de os seguidores terem a cópia; ganha velocidade, mas aceita defasagem e risco de perda se o líder cair.'),
        mcq('q5', 'Se o líder cair com escritas ainda na fila em memória, o que pode acontecer?', 'a', [
          'Escritas confirmadas ao cliente, mas não replicadas, podem se perder',
          'Os seguidores recuperam as escritas do disco do líder automaticamente assim que ele reiniciar',
          'O cliente é avisado que nenhuma escrita foi confirmada antes da queda',
          'Os seguidores passam a gravar duas vezes para compensar'
        ], 'Fila e dados estão só em memória, e a replicação é assíncrona; por isso persistência e replicação síncrona ou por consenso importam.'),
        mcq('q6', 'Qual peça essencial falta no mini armazenamento para lidar com a queda do líder?', 'd', [
          'Um segundo cliente que grave em todos os nós ao mesmo tempo sem qualquer coordenação',
          'Um dicionário maior para guardar mais chaves em memória',
          'Mais threads dentro de cada servidor HTTP',
          'Um mecanismo de eleição de líder'
        ], 'Sem eleição, a queda do líder deixa o sistema sem quem aceite escritas. Consenso resolve isso e é tema dos próximos níveis.'),
        mcq('q7', 'Por que o código usa threading.Lock em torno do dicionário?', 'b', [
          'Para impedir que clientes de outras máquinas se conectem e leiam os valores guardados',
          'Porque o servidor usa várias threads',
          'Para criptografar os valores guardados',
          'Para garantir que o líder nunca caia'
        ], 'ThreadingHTTPServer usa várias threads. O lock evita condições de corrida no acesso ao estado compartilhado do nó.'),
        fill('q8', 'Complete o nome do processo de escolher um novo líder quando o atual cai.', 'quando o líder cai: ___ de líder', ['eleição', 'eleicao'], 'A eleição de líder é um dos temas centrais dos próximos níveis, ligada ao consenso.')
      ]
    },
    {
      id: 'cdb-29-fluxo-compra-integrado',
      title: 'Revisão integrada: o fluxo de uma compra',
      goal: 'Integrar os conceitos do nível seguindo uma compra do clique ao aviso ao cliente, vendo onde cada falha pode ocorrer e que técnica protege.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O caminho do clique em "comprar"',
            'Vamos seguir uma compra fictícia ("1 caneca para a cliente Ana Exemplo") por todo o sistema. Quase todos os conceitos do nível aparecem. O desenho mostra os principais saltos; vamos percorrê-los.',
            'navegador -> DNS -> balanceador -> API (stateless)\n                                     |-> cache\n                                     |-> banco (replicado/particionado)\n                                     |-> fila -> pagamento -> notificação'
          ),
          sl(
            'DNS, balanceador e API stateless',
            'O DNS traduz o nome do site (loja.exemplo.invalid) em um endereço IP. O balanceador de carga recebe a requisição e a encaminha a uma das várias instâncias da API, retirando as que falham nos health checks (readiness). Como a API é stateless (não guarda estado de sessão local; o estado está em token, cache ou banco), qualquer instância pode atender, o que permite escalar e se recuperar de falhas. Falhas possíveis aqui: DNS desatualizado ou fora do ar, instância caindo; proteção: múltiplas instâncias, health checks, TTLs razoáveis.'
          ),
          sl(
            'Cache e banco replicado/particionado',
            'Para mostrar preço e estoque rápido, a API consulta primeiro o cache. Se o dado não está lá, busca no banco e o guarda no cache com um TTL (tempo de vida), o que limita por quanto tempo um dado defasado pode ser servido. O banco tem um nó principal que recebe as escritas e réplicas para leituras (que podem estar com lag), e os dados podem estar particionados (por exemplo por cliente). Consequência: um dado lido de cache ou réplica pode estar um pouco antigo; para decisões críticas, como reservar a última unidade, use a operação atômica no banco principal.'
          ),
          sl(
            'Consistência entre estoque e pedido: a saga',
            'Reservar o estoque e criar o pedido podem estar em serviços e bancos diferentes, então não há uma transação única que cubra os dois. Uma solução é a saga: uma sequência de passos locais em que cada passo tem uma ação de compensação para desfazê-lo se um passo posterior falhar. Por exemplo: reservar estoque, criar pedido, cobrar. Se a cobrança falhar, a compensação libera o estoque. Em visão geral, é a forma de manter estoque e pedido coerentes sem uma transação distribuída.',
            'reservar estoque -> criar pedido -> cobrar pagamento\nse a cobrança falhar: liberar estoque (compensação), cancelar pedido'
          ),
          sl(
            'Fila, pagamento e notificação',
            'Depois de aceitar o pedido, a API publica o evento "PedidoCriado" em uma fila ou tópico e responde "pedido recebido" ao cliente. Consumidores cuidam do resto de forma assíncrona. O serviço de pagamento é chamado com timeout e retentativas com backoff e jitter, usando chave de idempotência, para nunca cobrar duas vezes mesmo se a resposta se perder. O serviço de notificação envia o aviso ao cliente: se ele estiver fora do ar, a mensagem espera na fila, e a compra não falha por isso. Mensagens que não dão certo após várias tentativas vão à DLQ para análise.'
          ),
          sl(
            'Mapa: onde falha e o que protege',
            'Reúna tudo em um mapa. Em cada salto, pergunte: o que acontece se isso cair, atrasar, duplicar ou chegar fora de ordem? A tabela resume as principais proteções do fluxo. Repare que quase nenhuma proteção é "mágica": são combinações das técnicas que você viu, aplicadas conscientemente.',
            'API cai              -> várias instâncias + balanceador\nPagamento lento      -> timeout + retry com backoff e jitter\nCobrança repetida    -> chave de idempotência\nNotificação fora     -> fila guarda; entrega depois\nMensagem veneno      -> DLQ após N tentativas\nCache/réplica velhos -> TTL; ler no principal se for crítico\nEstoque x pedido     -> saga com compensação\nQueda de um nó       -> replicação'
          ),
          sl(
            'Privacidade no fluxo',
            'O fluxo toca dados pessoais em muitos lugares: banco, cache, fila, logs, backups. Boas práticas: guardar só o necessário (nunca o número completo do cartão, que fica com o serviço de pagamento), usar identificadores internos em logs e mensagens, proteger tudo em trânsito com TLS e controlar o acesso por menor privilégio. Neste curso, o cliente é fictício, e os dados também devem ser nos seus exercícios.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O serviço de pagamento deu timeout e a API vai retentar a cobrança. Como evitar cobrança dupla?', 'b', [
          'Gerar uma chave de pagamento nova a cada tentativa',
          'Enviar a mesma chave de idempotência em todas as tentativas',
          'Esperar o cliente clicar de novo em comprar até funcionar e cobrar a cada clique',
          'Desistir de qualquer retentativa e perder o pedido'
        ], 'A chave de idempotência permite ao serviço reconhecer a repetição e devolver o resultado da primeira vez.'),
        mcq('q2', 'Qual é o papel do DNS no começo do fluxo?', 'a', [
          'Traduzir o nome do site em um endereço IP',
          'Guardar o estoque de cada produto',
          'Cobrar o pagamento do cliente',
          'Escolher qual consumidor processa a fila de mensagens do pedido'
        ], 'O DNS resolve nomes em endereços; a distribuição entre instâncias é papel do balanceador.'),
        mcq('q3', 'A página mostra estoque lido de uma réplica com lag. Qual é a prática segura para reservar a última unidade?', 'c', [
          'Confiar no valor da réplica, pois ela é igual ao principal',
          'Reservar com base apenas no valor guardado no cache',
          'Usar operação atômica no banco principal, sem confiar no valor lido da réplica',
          'Pedir ao cliente que atualize a página até o valor se corrigir sozinho'
        ], 'Leituras em réplicas e caches podem estar defasadas. Decisões críticas ficam com operações atômicas no nó principal.'),
        fill('q4', 'Complete o nome do padrão que mantém estoque e pedido coerentes por passos com compensação.', 'reservar estoque -> criar pedido -> cobrar; se falhar, compensa. Padrão: ___', ['saga'], 'A saga encadeia passos locais e usa ações de compensação para desfazer os já feitos quando algo falha.'),
        mcq('q5', 'O serviço de notificação está fora do ar durante uma compra. O que é o comportamento desejado?', 'd', [
          'A compra falha e o cliente deve tentar de novo mais tarde',
          'O pagamento é cancelado automaticamente',
          'O pedido é apagado para evitar inconsistência',
          'A compra segue e a mensagem espera na fila'
        ], 'A fila desacopla no tempo: a notificação é entregue depois, sem derrubar a compra.'),
        mcq('q6', 'O que limita por quanto tempo um preço antigo pode ser servido pelo cache?', 'a', [
          'O TTL (tempo de vida) da entrada',
          'O número de instâncias da API em execução no balanceador',
          'O tamanho do banco de dados principal',
          'O número de zonas de disponibilidade usadas'
        ], 'Passado o TTL, a entrada expira e o dado é buscado de novo na fonte.'),
        mcq('q7', 'Uma mensagem "PedidoCriado" malformada falha em todas as tentativas. O que o sistema deve fazer?', 'c', [
          'Reentregá-la para sempre, até o consumidor conseguir processar',
          'Apagá-la silenciosamente sem registrar nada',
          'Movê-la para a DLQ após o limite de tentativas',
          'Duplicá-la para que outro consumidor tente mais rápido'
        ], 'A DLQ evita que uma mensagem sem solução trave o fluxo, preservando-a para análise.'),
        fill('q8', 'Complete: a API não guarda estado de sessão localmente, então qualquer instância pode atender a requisição, ou seja, ela é ___.', 'API ___ : sem sessão na memória local; qualquer instância atende', ['stateless', 'sem estado'], 'APIs stateless escalam e se recuperam melhor, pois o balanceador pode enviar a requisição a qualquer instância.')
      ]
    },
    {
      id: 'cdb-30-mentalidade-falhas',
      title: 'A mentalidade de sistemas distribuídos',
      goal: 'Projetar para falhar: perguntas-chave, testes de falha, pós-morte sem culpados, simplicidade e próximos passos de estudo.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Projetar para falhar',
            'Em sistemas distribuídos vale a frase "tudo que pode falhar, vai falhar". Com muitos nós, discos, redes e processos, falhas deixam de ser exceção e viram rotina: um nó cai, um pacote some, uma resposta demora. Projetar para falhar significa assumir isso desde o começo: partes devem falhar sem derrubar o todo, e o sistema deve se recuperar sozinho sempre que possível. O objetivo não é nunca falhar, e sim falhar de modo controlado e contido.'
          ),
          sl(
            'As perguntas de todo projeto',
            'Uma ferramenta prática: para cada ponto do sistema (cada chamada, mensagem, gravação), faça as perguntas "o que acontece se isso cair? atrasar? duplicar? chegar fora de ordem?". Cair: precisa de réplica, retentativa, degradação. Atrasar: precisa de timeout. Duplicar: precisa de idempotência. Fora de ordem: precisa de tolerância ou ordenação por chave. Quem faz essas perguntas cedo evita a maioria dos incidentes.',
            'Se isto CAIR?          -> réplica, retry, degradação\nSe isto ATRASAR?       -> timeout, backoff\nSe isto DUPLICAR?      -> idempotência\nSe chegar FORA DE ORDEM? -> tolerar ou ordenar por chave'
          ),
          sl(
            'Testar falhas e engenharia do caos',
            'Proteções que nunca foram testadas provavelmente não funcionam. Teste falhas de propósito: mate processos, injete atrasos, simule a queda de uma zona. A engenharia do caos formaliza isso: você define o comportamento normal esperado, formula uma hipótese ("se o nó X cair, os usuários não percebem"), injeta a falha de modo controlado, com raio de ação pequeno e plano para abortar, e compara. Se a hipótese falhar, você aprendeu uma fraqueza antes de ela virar incidente. Comece em ambientes de teste e só avance para ambientes reais com maturidade e preparo.'
          ),
          sl(
            'Pós-morte sem culpados',
            'Quando um incidente ocorre, a revisão depois (pós-morte, postmortem) deve ser sem culpados (blameless): o foco é entender como o SISTEMA permitiu a falha, e não achar uma pessoa para punir. Pessoas erram, então bons sistemas têm salvaguardas. Um pós-morte útil tem a linha do tempo dos eventos, o impacto, as causas (geralmente várias) e ações concretas de melhoria com responsáveis. Culpar pessoas leva a esconder erros; analisar o sistema leva a aprender.'
          ),
          sl(
            'Simplicidade e quando NÃO distribuir',
            'Cada componente distribuído adicionado traz novos modos de falha, mais para monitorar, mais para proteger e mais custo. Por isso a simplicidade é uma virtude: um bom sistema em um só nó, ou um monolito bem organizado, muitas vezes é a melhor escolha. NÃO distribua quando os dados e a carga cabem com folga em uma máquina e a disponibilidade exigida é compatível, quando a equipe é pequena demais para operar a complexidade, ou quando você está distribuindo por moda. Distribua quando houver uma necessidade concreta: escala, disponibilidade ou localização.'
          ),
          sl(
            'Próximos passos de estudo',
            'Você concluiu o nível iniciante. Os próximos níveis aprofundam o que aqui foi só visão geral: consenso e eleição de líder, replicação e quorum, relógios lógicos e ordem de eventos, transações distribuídas e sagas, locks distribuídos e suas sutilezas, particionamento avançado e tolerância a falhas na prática. Continue praticando no laboratório local, sempre com dados fictícios. E leve a pergunta central para todo projeto: o que acontece se isso falhar?'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que a frase "tudo que pode falhar, vai falhar" sugere ao projetar?', 'd', [
          'Que é melhor evitar qualquer sistema com mais de um nó',
          'Que as falhas só acontecem por erro humano evitável',
          'Que testes de falha são desnecessários se o código estiver correto',
          'Assumir falhas como rotina e projetar para contê-las'
        ], 'Em escala, falhas são rotina. O projeto deve prever que partes falharão, sem derrubar o todo.'),
        mcq('q2', 'Uma mensagem pode ser entregue duas vezes ao mesmo consumidor. Qual proteção responde melhor à pergunta "e se isso duplicar?"', 'c', [
          'Um timeout mais curto na chamada',
          'Mais uma réplica do banco de dados',
          'Um consumidor idempotente',
          'Um balanceador adicional na frente da API'
        ], 'Idempotência faz com que repetir a mensagem não repita o efeito.'),
        mcq('q3', 'O que é, em visão geral, a engenharia do caos?', 'b', [
          'Desligar servidores aleatoriamente em produção sem aviso nem plano',
          'Injetar falhas de modo controlado e com raio limitado',
          'Escrever código sem organização para ganhar velocidade',
          'Remover todas as proteções para ver o sistema cair'
        ], 'É um experimento disciplinado: hipótese, falha controlada, escopo pequeno, plano de abortar.'),
        fill('q4', 'Complete: a revisão após um incidente que foca no sistema e não em punir pessoas é o pós-morte sem...', 'Pós-morte sem ___ : foca em processos e sistemas, não em pessoas', ['culpados', 'culpa', 'culpados (blameless)'], 'O pós-morte sem culpados incentiva relatar erros e aprender com eles.'),
        mcq('q5', 'Em qual situação distribuir provavelmente NÃO é uma boa ideia?', 'a', [
          'A carga cabe com folga em uma máquina e a equipe é pequena',
          'A aplicação precisa estar disponível mesmo com a queda de um datacenter inteiro',
          'Os dados crescem além do que qualquer servidor único comporta',
          'Os usuários estão em vários continentes e a latência é crítica'
        ], 'Sem necessidade concreta, a complexidade da distribuição só traz novos modos de falha e custo.'),
        mcq('q6', 'Por que a simplicidade é considerada uma virtude em sistemas distribuídos?', 'b', [
          'Porque sistemas simples nunca falham em nenhuma circunstância',
          'Porque cada peça nova traz novos modos de falha',
          'Porque distribuir sempre piora o desempenho do sistema',
          'Porque a nuvem cobra mais pelos sistemas complexos'
        ], 'Cada peça adicional precisa justificar seu custo em complexidade e risco.'),
        mcq('q7', 'Como começar a praticar engenharia do caos com segurança?', 'a', [
          'Em ambiente de teste, com escopo pequeno e plano para abortar',
          'Direto em produção, para ter resultados mais realistas',
          'Em sistemas de terceiros, para não afetar o seu próprio, que já têm monitoramento',
          'Sem monitoramento, para não influenciar o resultado'
        ], 'Experimentos de falha precisam de controle, observabilidade e possibilidade de interromper.'),
        fill('q8', 'Complete a pergunta-chave: "o que acontece se isso cair, atrasar, duplicar ou chegar fora de ___?"', 'O que acontece se isso: cair? atrasar? duplicar? chegar fora de ___?', ['ordem'], 'Essas quatro perguntas, aplicadas a cada ponto do projeto, antecipam a maioria dos problemas.')
      ]
    },
  ]
};
