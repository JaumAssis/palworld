// Módulo "Intermediário" do curso de Computação Distribuída — primeira metade (19 lições, 8
// questões cada: 3 múltipla escolha + 1 lacuna, duas vezes por lição). Ver ../../index.js para o
// formato e a validação de boot. Aprofunda o nível Iniciante com algoritmos e mecanismos: relógios
// lógicos e híbridos, detecção de falhas, gossip, eleição, locks e fencing, consenso (Paxos/Raft),
// replicação (com e sem líder), modelos de consistência, CAP/PACELC, CRDTs, particionamento,
// transações distribuídas, sagas/outbox, isolamento/MVCC, mensageria e logs distribuídos.
// Os exemplos em Python foram EXECUTADOS e as saídas dos comentários conferidas; nenhum número de
// benchmark, versão ou preço é afirmado, e classificações de produtos (CP/AP etc.) são feitas com
// cautela porque dependem da configuração. Mesmo padrão de ../containers/02-intermediario.js:
// mcq recebe a letra correta e as 4 alternativas (a posição da certa é escolhida à mão e variada);
// fill recebe prompt, código com a lacuna ___ e as respostas aceitas (a 1ª é a canônica); sl() monta
// um slide (code opcional).
// Segurança e privacidade (LGPD): locks e fencing como proteção contra escritas de nós obsoletos,
// eventos/logs/filas e réplicas tratados como possíveis detentores de dados pessoais (minimização,
// retenção, controle de acesso, direito de eliminação em logs imutáveis); nenhum dado pessoal real
// nos exemplos (nomes e valores são fictícios).
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
  id: 'intermediario-distribuida',
  levelKey: 'intermediate',
  order: 2,
  title: 'Intermediário',
  subtitle: 'Relógios, detecção de falhas, gossip, eleição, locks, consenso e Raft, replicação, consistência, CAP/PACELC, CRDTs, particionamento, transações, sagas, isolamento, mensageria e logs',
  accent: '#14b8a6',
  lessons: [
    {
      id: 'cdi-01-relogios-logicos',
      title: 'Relógios lógicos: Lamport e vetoriais',
      goal: 'Ordenar eventos por causalidade sem relógio global, usando relógios de Lamport e vetoriais.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Causalidade: o que realmente importa na ordem',
            'Sem relógio global confiável, não dá para dizer "qual evento aconteceu primeiro" pelo horário. O que importa é a CAUSALIDADE: um evento pode ter influenciado outro? A relação happened-before (escrita a → b, "a aconteceu antes de b") é definida por 3 regras: (1) no mesmo processo, se a ocorre antes de b, então a → b; (2) se a é o envio de uma mensagem e b é o recebimento DESSA mensagem, então a → b; (3) transitividade: a → b e b → c implicam a → c. Se nem a → b nem b → a, os eventos são CONCORRENTES (a || b). Concorrente não significa "no mesmo instante": significa que nenhum pôde influenciar o outro, porque não há cadeia de mensagens ligando os dois.',
            'Processo A:  a1 ──── a2 ─(msg m1)─┐\nProcesso B:  b1 ───────────── b2 ◄─┘ ── b3\n\na1 → a2 (mesmo processo)\na2 → b2 (envio → recebimento)\na2 → b3 (transitividade: a2 → b2 → b3)\nb1 || a1 (nenhuma cadeia de mensagens entre eles)'
          ),
          sl(
            'Relógio de Lamport: um contador por processo',
            'Cada processo guarda um contador inteiro L, começando em 0. Regras: (1) evento local: L = L + 1; (2) envio: L = L + 1 e a mensagem leva o valor de L como timestamp; (3) recebimento de mensagem com timestamp t: L = max(L, t) + 1. O efeito é que todo recebimento fica "depois" do envio correspondente. Propriedade garantida: se a → b, então L(a) < L(b).',
            `class P:
    def __init__(s): s.L = 0
    def local(s): s.L += 1; return s.L
    def send(s):  s.L += 1; return s.L          # timestamp que vai na mensagem
    def recv(s, t): s.L = max(s.L, t) + 1; return s.L

A, B, C = P(), P(), P()
A.local()          # a1 -> 1
m1 = A.send()      # a2 -> 2
B.local()          # b1 -> 1
B.recv(m1)         # b2 -> 3  (max(1,2)+1)
m2 = B.send()      # b3 -> 4
C.local()          # c1 -> 1
C.recv(m2)         # c2 -> 5  (max(1,4)+1)`
          ),
          sl(
            'O limite: Lamport não detecta concorrência',
            'A propriedade só vale num sentido: a → b implica L(a) < L(b). O INVERSO é falso: L(a) < L(b) NÃO implica a → b. No exemplo anterior, c1 tem L = 1 e a2 tem L = 2, então L(c1) < L(a2), mas c1 e a2 são concorrentes (não há mensagem ligando os dois). Portanto, olhando só dois timestamps de Lamport, você não sabe se há causalidade ou concorrência. Lamport serve para criar uma ordem total consistente com a causalidade: ordene por (L, id do processo), usando o id só para desempatar. Se você precisa DETECTAR concorrência, precisa de relógios vetoriais.',
            'evento  L\na1      1\na2      2\nb1      1\nb2      3\nb3      4\nc1      1\nc2      5\n\nL(c1)=1 < L(a2)=2, mas c1 || a2  (a ordem de Lamport "inventa" uma ordem)'
          ),
          sl(
            'Relógios vetoriais: um contador por processo, em cada processo',
            'Cada processo i mantém um VETOR v com N posições (uma por processo), todas começando em 0. Regras: (1) evento local ou envio: v[i] = v[i] + 1 (o envio leva uma cópia do vetor); (2) recebimento de um vetor w: primeiro v = máximo posição a posição de v e w, depois v[i] = v[i] + 1. Cada posição v[j] diz "quantos eventos do processo j este evento já conhece".',
            'Eventos (A=posição 0, B=posição 1, C=posição 2):\na1 local        [1,0,0]\na2 envia m1     [2,0,0]\nb1 local        [0,1,0]\nb2 recebe m1    max([0,1,0],[2,0,0]) = [2,1,0] -> +1 em B -> [2,2,0]\nb3 envia m2     [2,3,0]\nc1 local        [0,0,1]\nc2 recebe m2    max([0,0,1],[2,3,0]) = [2,3,1] -> +1 em C -> [2,3,2]'
          ),
          sl(
            'Comparando vetores: antes, depois ou concorrente',
            'Dados dois vetores a e b: se TODA posição de a é menor ou igual à de b (e são diferentes), então a aconteceu ANTES de b (a → b). Se toda posição de a é maior ou igual, a aconteceu DEPOIS. Se cada um é maior em alguma posição, os eventos são CONCORRENTES. Diferente de Lamport, aqui a comparação vale nos dois sentidos: vetor menor ⇔ causalidade.',
            `def cmp(a, b):
    le = all(x <= y for x, y in zip(a, b))
    ge = all(x >= y for x, y in zip(a, b))
    if a == b: return 'igual'
    if le: return 'antes'
    if ge: return 'depois'
    return 'concorrente'

print(cmp([1,0,0], [0,1,0]))  # concorrente (a1 e b1)
print(cmp([2,0,0], [2,3,0]))  # antes       (a2 -> b3)
print(cmp([0,0,1], [2,0,0]))  # concorrente (c1 e a2: Lamport não via isso)
print(cmp([1,0,0], [2,3,2]))  # antes       (a1 -> c2)`
          ),
          sl(
            'Para que servem na prática',
            'Detectar conflitos: se duas versões do mesmo dado têm vetores concorrentes, ninguém viu a escrita do outro, então há um conflito real e as duas versões devem ser mantidas e reconciliadas (é assim que sistemas estilo Dynamo funcionam); se um vetor é "antes" do outro, a versão antiga pode ser descartada com segurança. Ordenação causal: uma mensagem só é entregue quando todas as suas causas já foram entregues (a resposta nunca aparece antes da pergunta). Custo: o vetor cresce com o número de processos, e é preciso lidar com entrada e saída de processos. Cuidado de privacidade: os identificadores no vetor devem ser técnicos (id de nó), nunca dados pessoais, pois esses metadados viajam e ficam em logs.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Dois eventos ocorrem em processos diferentes e não existe nenhuma cadeia de mensagens ligando um ao outro. Qual é a relação entre eles?', 'b', [
          'a → b, pois um deles é necessariamente anterior no tempo real',
          'a || b, são concorrentes: nenhum deles pode ter influenciado o outro',
          'b → a, pois o evento do processo de maior id vem depois do outro',
          'Indefinida, pois só é possível comparar eventos com o relógio de parede'
        ], 'Sem cadeia de mensagens (nem no mesmo processo) não há happened-before em nenhum sentido: os eventos são concorrentes.'),
        mcq('q2', 'Um processo com L = 7 recebe uma mensagem com timestamp 4. Qual o novo valor de L pela regra de Lamport?', 'd', [
          '5, pois L passa a ser o timestamp da mensagem mais 1',
          '7, pois o contador nunca muda com mensagens mais antigas',
          '11, pois os dois valores são somados no recebimento',
          '8, pois L passa a ser max(7, 4) + 1'
        ], 'Recebimento: L = max(L, t) + 1 = max(7, 4) + 1 = 8. O contador nunca regride e sempre avança ao menos 1.'),
        mcq('q3', 'Em um relógio de Lamport, L(a) = 3 e L(b) = 5. O que se pode concluir?', 'a', [
          'Nada sobre causalidade: pode ser a → b ou podem ser concorrentes, mas b → a é impossível',
          'Com certeza a → b, pois a propriedade de Lamport vale nos dois sentidos',
          'Com certeza a || b, pois valores diferentes indicam eventos independentes',
          'Com certeza b → a, pois timestamps maiores sempre vêm antes'
        ], 'Só vale a → b ⇒ L(a) < L(b). O inverso é falso: L(a) < L(b) é compatível com a → b e com concorrência. Já b → a exigiria L(b) < L(a).'),
        fill('q4', 'Complete a regra de recebimento do relógio de Lamport.', 'L = ___(L_local, t_mensagem) + 1', ['max', 'maximo', 'máximo'], 'No recebimento usa-se o máximo entre o contador local e o timestamp da mensagem, e então soma 1.'),
        mcq('q5', 'Um vetor de A é [2,1,0] e outro, de B, é [1,2,0]. Qual é a relação entre os eventos?', 'c', [
          'O de A aconteceu antes, pois o primeiro componente é maior',
          'O de B aconteceu antes, pois o segundo componente é maior que o primeiro',
          'São concorrentes, pois cada um é maior que o outro em alguma posição',
          'São o mesmo evento, pois a soma dos componentes é igual'
        ], 'Para ser "antes", todas as posições precisam ser menores ou iguais. Aqui 2 > 1 na posição 0 e 1 < 2 na posição 1: concorrentes.'),
        mcq('q6', 'Qual vantagem dos relógios vetoriais sobre o de Lamport justifica seu custo extra de espaço?', 'b', [
          'Eles dispensam trocar mensagens entre os processos',
          'Eles distinguem causalidade de concorrência pela comparação dos vetores',
          'Eles medem o horário real de cada evento com mais precisão',
          'Eles ocupam espaço constante, independente do número de processos e do tamanho da rede'
        ], 'Vetor menor ⇔ causalidade, e vetores incomparáveis ⇔ concorrência. O custo é um vetor com uma posição por processo.'),
        mcq('q7', 'Duas réplicas guardam versões de um mesmo item com vetores [2,0] e [1,1]. Como o sistema deve tratar?', 'd', [
          'Descartar a versão de [1,1], pois a soma dos componentes é menor que a de [2,0]',
          'Manter só a de [2,0], pois o primeiro componente é maior',
          'Escolher uma ao acaso, pois não há como saber nada sobre elas',
          'Tratar como conflito: são concorrentes, manter as duas e reconciliar'
        ], '[2,0] e [1,1] são incomparáveis, logo concorrentes: ninguém viu a escrita do outro. Descartar uma perderia dados; mantém-se as duas para reconciliação.'),
        fill('q8', 'O processo de índice 1 está em [0,1,0] e recebe um vetor [2,0,0]. Qual o valor da posição do meio após max e incremento?', 'novo vetor = [2, ___, 0]', ['2'], 'max([0,1,0],[2,0,0]) = [2,1,0]; depois soma 1 na própria posição (índice 1), resultando em [2,2,0].')
      ]
    },
    {
      id: 'cdi-02-relogios-fisicos-hlc',
      title: 'Relógios físicos, incerteza e HLC',
      goal: 'Entender drift, skew, NTP, saltos de relógio e por que o tempo de parede é perigoso, além de TrueTime e HLC.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Drift e skew: relógios de verdade divergem',
            'Cada computador conta o tempo com um oscilador de cristal, que não é perfeito: ele adianta ou atrasa levemente. A taxa com que um relógio se afasta do tempo verdadeiro é o DRIFT. A diferença entre as leituras de dois relógios no mesmo instante real é o SKEW. Sem sincronização, o skew cresce com o tempo, porque cada relógio tem drift diferente. Por isso os nós de um sistema distribuído precisam sincronizar seus relógios periodicamente, e mesmo assim o skew nunca chega a zero.'
          ),
          sl(
            'NTP: offset e delay com 4 timestamps',
            'No NTP, o cliente pergunta e o servidor responde, e quatro instantes são registrados: t1 (cliente envia, relógio do cliente), t2 (servidor recebe, relógio do servidor), t3 (servidor responde, relógio do servidor), t4 (cliente recebe, relógio do cliente). Então: delay = (t4 − t1) − (t3 − t2) (tempo total de rede, descontando o processamento no servidor) e offset = ((t2 − t1) + (t3 − t4)) / 2 (quanto o servidor está à frente do cliente). A fórmula assume caminho de ida e volta SIMÉTRICO; se ida e volta têm atrasos diferentes, o offset calculado tem erro. PTP é um protocolo parecido, mas com timestamps em hardware e redes controladas, atingindo precisão muito melhor que o NTP pela internet.',
            `t1, t2, t3, t4 = 10000, 10150, 10160, 10050   # milissegundos
offset = ((t2 - t1) + (t3 - t4)) / 2
delay  = (t4 - t1) - (t3 - t2)
print(offset, delay)   # 130.0 40
# servidor 130 ms à frente; rede total de 40 ms (20 ms para cada lado)`
          ),
          sl(
            'Relógio de parede pode voltar; use o monotônico',
            'O relógio de parede (time.time(), "que horas são") pode ser ajustado: o NTP corrige o relógio, um administrador muda a hora, existem segundos intercalares. Ele pode PULAR PARA TRÁS, e então uma duração calculada como fim − início pode dar zero ou negativa. Para medir intervalos (timeouts, latência, lease) use o relógio MONOTÔNICO (time.monotonic()): ele nunca retrocede. Em compensação, seu valor absoluto não tem significado fora daquela máquina/processo, então NÃO pode ser comparado entre nós. Regra: parede para "quando" (registro, exibição), monotônico para "quanto tempo".',
            `import time
ini = time.monotonic()
trabalho()
duracao = time.monotonic() - ini   # nunca negativa
# time.time() - ini_parede pode ser negativa se o relógio recuar`
          ),
          sl(
            'Last Write Wins com relógio de parede perde dados',
            'Last Write Wins (LWW) resolve conflitos mantendo a escrita com o maior timestamp. Se os timestamps vêm de relógios de parede com skew, "maior timestamp" deixa de significar "mais recente de verdade". Um nó com relógio adiantado vence escritas mais novas de nós com relógio correto, e a escrita perdida some SEM erro nenhum (perda silenciosa). Pior: se o relógio de um nó está muito adiantado, suas escritas continuam "vencendo" por muito tempo.',
            `# tempo real 100: nó A (relógio +5s) escreve x=1 com stamp 105
# tempo real 101: nó B (relógio certo) escreve x=2 com stamp 101
escritas = [('A', 105, 1), ('B', 101, 2)]
print(max(escritas, key=lambda e: e[1]))   # ('A', 105, 1)
# LWW mantém x=1, apesar de x=2 ter sido escrito depois: x=2 foi perdido`
          ),
          sl(
            'Relógios com incerteza: a ideia do TrueTime',
            'Em vez de devolver um único instante (que finge ser exato), um relógio com incerteza devolve um INTERVALO [earliest, latest] que garante conter o tempo real. A ideia do TrueTime (do Google Spanner) é usar relógios de alta qualidade (GPS e atômicos) para manter esse intervalo pequeno e conhecido. Para ordenar transações, o sistema ESPERA a incerteza passar antes de tornar uma escrita visível (commit wait), garantindo que uma transação posterior receba um timestamp maior. Troca: uma pequena espera por uma ordenação em tempo real confiável. A precisão do sistema depende de o erro do relógio ser realmente limitado.'
          ),
          sl(
            'HLC: relógio lógico híbrido',
            'O Hybrid Logical Clock (HLC) combina os dois mundos. Cada nó mantém um par (l, c): l é o maior tempo físico que o nó já viu (o próprio ou de mensagens) e c é um contador lógico que desempata eventos com o mesmo l. Em evento local/envio: l novo = max(l, relógio físico); se l não mudou, c = c + 1, senão c = 0. No recebimento, l = max(l, l da mensagem, relógio físico) e c é ajustado para ficar maior que os contadores correspondentes. Vantagens: preserva causalidade (a → b implica HLC(a) < HLC(b), como Lamport), fica próximo do tempo físico (útil para "consultas por horário") e não volta atrás, mesmo se o relógio de parede recuar. Não é "tempo real garantido", e sim causalidade com proximidade do horário.',
            `# relógio físico (pt) lê 100, 100, 99 (recuou!), 105
# (l, c) a cada evento local:
# pt=100 -> (100, 0)
# pt=100 -> (100, 1)   mesmo l: contador sobe
# pt=99  -> (100, 2)   relógio recuou, mas o HLC não volta
# pt=105 -> (105, 0)   relógio avançou: l acompanha, c zera`
          )
        ]
      },
      questions: [
        mcq('q1', 'Dois servidores, no mesmo instante real, marcam 12:00:00.000 e 12:00:00.040. Como se chama essa diferença de 40 ms?', 'c', [
          'Drift, a taxa de desvio de um relógio em relação ao tempo verdadeiro',
          'Delay, o tempo total de rede da sincronização',
          'Skew, a diferença entre dois relógios num instante',
          'Offset lógico, o contador de Lamport do servidor'
        ], 'Skew é a diferença entre as leituras de dois relógios no mesmo instante; drift é a taxa com que um relógio se afasta do tempo verdadeiro.'),
        mcq('q2', 'Você precisa medir quanto tempo uma operação durou, de forma segura mesmo se alguém ajustar a hora da máquina. O que usar?', 'a', [
          'O relógio monotônico (time.monotonic), que nunca retrocede',
          'O relógio de parede (time.time), que é o mais preciso e se mantém sincronizado',
          'O relógio de outro nó, que não sofre o mesmo ajuste',
          'O relógio de Lamport, que mede o tempo em segundos'
        ], 'O monotônico não retrocede com ajustes. Seu valor absoluto só vale localmente, o que não importa para medir duração.'),
        mcq('q3', 'Nó A (relógio 5 s adiantado) escreve x=1 no tempo real 100 (stamp 105). Nó B (relógio correto) escreve x=2 no tempo real 101 (stamp 101). Com LWW, o que acontece?', 'd', [
          'Mantém x=2, pois foi escrito depois no tempo real',
          'Mantém os dois valores e avisa a aplicação do conflito para que ela decida',
          'Rejeita as duas escritas, pois os timestamps divergem',
          'Mantém x=1 (stamp maior) e perde silenciosamente a escrita mais nova'
        ], 'LWW compara apenas timestamps. O skew faz a escrita antiga parecer mais nova, e a mais recente é descartada sem erro.'),
        fill('q4', 'Com t1=100, t2=160, t3=170 e t4=120 (ms), qual o offset NTP em ms?', 'offset = ((160-100) + (170-120)) / 2 = ___', ['55', '55.0', '55 ms'], '(60 + 50) / 2 = 55 ms: o servidor está 55 ms à frente do cliente. O delay seria (120-100) − (170-160) = 10 ms.'),
        mcq('q5', 'No TrueTime, o que a leitura do relógio devolve em vez de um único instante?', 'b', [
          'Um par (l, c) com tempo físico e contador lógico mantidos em cada nó',
          'Um intervalo [earliest, latest] que contém o tempo real',
          'Um vetor com um contador por nó do cluster',
          'Um valor monotônico válido apenas em um nó'
        ], 'TrueTime expõe a incerteza explicitamente como intervalo; o sistema espera essa incerteza passar (commit wait) para ordenar transações. O par (l, c) é o HLC.'),
        mcq('q6', 'Qual o papel do contador c no HLC (l, c)?', 'a', [
          'Desempatar eventos com o mesmo l mantendo a ordem causal',
          'Contar quantos nós existem no cluster naquele momento e quantos estão ativos',
          'Armazenar a diferença entre o relógio e o servidor NTP',
          'Guardar o número de segundos intercalares já aplicados'
        ], 'Quando vários eventos caem no mesmo l (relógio físico igual ou recuado), c sobe para que cada um tenha um timestamp maior que o anterior.'),
        mcq('q7', 'Qual suposição do cálculo de offset do NTP, se violada, introduz erro?', 'c', [
          'Que o servidor tenha o relógio mais lento do que o do cliente',
          'Que o processamento no servidor leve exatamente zero tempo',
          'Que os atrasos de ida e de volta na rede sejam iguais',
          'Que cliente e servidor estejam no mesmo fuso horário'
        ], 'O offset assume caminho simétrico. Ida e volta com atrasos diferentes deslocam o resultado. O tempo no servidor é descontado por t3 − t2.'),
        fill('q8', 'Com t1=0, t2=30, t3=35 e t4=27 (ms), qual o delay de rede em ms?', 'delay = (27-0) - (35-30) = ___', ['22', '22.0', '22 ms'], 'delay = (t4 − t1) − (t3 − t2) = 27 − 5 = 22 ms.')
      ]
    },
    {
      id: 'cdi-03-deteccao-falhas',
      title: 'Detecção de falhas',
      goal: 'Compreender por que detectar falhas é só suspeitar, o compromisso do timeout e como agir com segurança.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Lento e morto são indistinguíveis',
            'Quando você manda uma requisição e não recebe resposta, as causas possíveis são: o nó morreu; o nó está vivo mas lento (pausa de GC, CPU saturada); a mensagem ou a resposta se perdeu; a rede está particionada. Visto de fora, TODAS parecem "silêncio". Em um sistema assíncrono (sem limite de tempo conhecido para mensagens) é impossível distinguir com certeza um nó morto de um nó muito lento. Um detector de falhas, portanto, não detecta falhas: ele SUSPEITA delas, baseado no tempo.'
          ),
          sl(
            'Heartbeats e timeouts',
            'O mecanismo básico: cada nó envia um heartbeat (sinal de vida) a cada intervalo fixo, e o monitor guarda o instante do último recebido. Se o silêncio ultrapassar um timeout, o nó passa a ser SUSPEITO. O heartbeat pode ser enviado pelo monitorado (push) ou o monitor pode perguntar (ping/pong). Exemplo de rastro: heartbeats chegaram nos instantes 1, 2, 3, 4, 8, 9, 10 (o nó ficou lento entre 4 e 8, mas não morreu).',
            `def estado(beats, t, timeout):
    ultimo = max(b for b in beats if b <= t)
    return 'SUSPEITO' if t - ultimo > timeout else 'ok'

beats = [1, 2, 3, 4, 8, 9, 10]
for t in (5, 6, 7, 8):
    print(t, estado(beats, t, 2))
# timeout=2:  5 ok | 6 ok | 7 SUSPEITO | 8 ok   (falso positivo!)
# timeout=5:  5 ok | 6 ok | 7 ok       | 8 ok`
          ),
          sl(
            'O compromisso: rapidez x falsos positivos',
            'Timeout CURTO: detecta falhas reais rapidamente, mas acusa nós apenas lentos (falso positivo), disparando failovers desnecessários, rebalanceamentos e até dois líderes ao mesmo tempo. Timeout LONGO: poucos falsos positivos, mas uma falha real demora a ser notada, e nesse período requisições vão para um nó morto (indisponibilidade). Não existe valor perfeito: ele depende da variabilidade da rede e do custo de cada tipo de erro. No rastro acima, timeout 2 acusou o nó em t=7 e ele voltou em t=8, enquanto timeout 5 nunca errou, mas demoraria mais para notar uma morte real.'
          ),
          sl(
            'Detectores com nível de suspeita: phi-accrual',
            'Em vez de responder "vivo/morto" com um timeout fixo, o detector phi-accrual calcula um valor contínuo φ (phi) que indica o QUANTO se suspeita do nó. Ele observa o histórico dos intervalos entre heartbeats (média e variação) e, conforme o silêncio atual fica mais improvável diante desse histórico, φ cresce. A aplicação escolhe o limiar de φ a partir do qual age. Vantagem: se adapta sozinho à rede (intervalos variáveis ou estáveis) e separa o monitoramento (calcular φ) da decisão (qual limiar). Sistemas como Cassandra e Akka adotam variações dessa ideia.'
          ),
          sl(
            'Completude e precisão; falha de nó vs de rede',
            'Dois critérios clássicos de qualidade: COMPLETUDE (todo nó realmente falho é eventualmente suspeito pelos nós corretos) e PRECISÃO (nós corretos não são suspeitos de forma errada). Em redes assíncronas não se tem os dois de forma perfeita; na prática trabalha-se com detectores que se tornam precisos "depois que a rede se comporta" (sincronia parcial). Outro cuidado: se A não ouve B, o problema pode ser o enlace A–B e não o nó B. Perguntar a outros nós ("você consegue falar com B?") reduz falsos positivos, ideia usada em protocolos como o SWIM.'
          ),
          sl(
            'Suspeito não é falho: agir com segurança (fencing)',
            'Declarar B morto e agir como se estivesse morto é perigoso: B pode estar apenas lento ou isolado, e voltar acreditando que ainda é o dono do recurso (lock, liderança, disco). Se um substituto já assumiu, os dois escrevem e corrompem dados. Por isso, antes de entregar os recursos de um suspeito a outro, é preciso CERCÁ-LO (fencing): impedir que ele aja, seja desligando-o (STONITH, "shoot the other node in the head") ou fazendo o próprio recurso rejeitar suas requisições, usando um fencing token: número crescente emitido a cada mudança de dono, e o recurso recusa tokens menores que o maior já visto. A decisão "suspeito" deve disparar uma ação reversível e segura, e a decisão "falho" só vale com fencing garantido.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um nó não respondeu ao heartbeat dentro do prazo. O que se pode concluir com certeza?', 'd', [
          'Que o processo do nó terminou e o servidor foi desligado por falta de energia ou falha de hardware',
          'Que a rede está particionada e o nó continua funcionando',
          'Que o nó está lento, mas ainda vivo e respondendo',
          'Apenas que a resposta não chegou: ele pode estar morto, lento ou isolado'
        ], 'O silêncio é compatível com várias causas. O detector só consegue suspeitar com base no tempo, nunca ter certeza.'),
        mcq('q2', 'O que acontece ao encurtar muito o timeout de um detector de falhas?', 'b', [
          'Falhas reais passam a demorar mais para serem notadas',
          'Falhas são notadas mais cedo, mas aumentam os falsos positivos',
          'O detector passa a distinguir lento de morto com certeza mesmo sem nenhuma troca de mensagens',
          'O tráfego de heartbeats deixa de ser necessário'
        ], 'Timeout curto reduz o tempo de detecção mas acusa nós apenas lentos, causando failovers desnecessários.'),
        mcq('q3', 'Heartbeats chegaram em t = 1, 2, 3, 4, 8, 9, 10 e o timeout é 2. Qual o estado em t = 7 e o que isso mostra?', 'c', [
          'ok, pois o nó enviou heartbeat há menos de 2 unidades no intervalo anterior',
          'SUSPEITO, e o nó realmente estava morto nesse período',
          'SUSPEITO, mas foi falso positivo, pois ele voltou em t = 8',
          'ok, pois o detector só avalia os instantes pares'
        ], 'Em t=7 o último foi t=4 (silêncio 3 > 2): suspeito. Como o nó enviou em t=8, era só lento, um falso positivo.'),
        fill('q4', 'Qual o nome do detector que produz um nível contínuo de suspeita a partir do histórico dos intervalos de heartbeat?', 'detector ___-accrual', ['phi', 'φ', 'fi'], 'O detector phi-accrual calcula φ, que cresce com o silêncio diante da distribuição histórica; a aplicação escolhe o limiar.'),
        mcq('q5', 'Como se chama a garantia de que todo nó realmente falho acaba sendo suspeito pelos nós corretos?', 'a', [
          'Completude',
          'Precisão',
          'Atomicidade',
          'Linearizabilidade'
        ], 'Completude: nenhuma falha real fica sem suspeita. Precisão: nós corretos não são acusados indevidamente.'),
        mcq('q6', 'O detector marca B como suspeito. Qual conduta é mais segura?', 'd', [
          'Declarar B morto e passar seus recursos adiante imediatamente',
          'Ignorar a suspeita até B responder por conta própria',
          'Reiniciar todos os outros nós para evitar inconsistência',
          'Tirar B do roteamento e cercá-lo (fencing) antes de reatribuir seus recursos'
        ], 'Suspeito não é falho. Antes de entregar lock/liderança a outro, impeça B de agir; senão ele pode voltar e escrever junto com o substituto.'),
        mcq('q7', 'O nó A não consegue falar com B, mas o nó C fala normalmente com B. Qual a leitura mais razoável?', 'b', [
          'B morreu, pois um nó só deixa de responder quando falha',
          'Provável problema no enlace A–B; perguntar a outros nós ajuda a decidir',
          'C está mentindo e deve ser removido do cluster por ter divergido da visão de A e de B',
          'A deve eleger a si mesmo como líder imediatamente'
        ], 'Falha de nó e falha de rede se confundem. Consultar terceiros (ping indireto) diferencia um problema no enlace de um problema no próprio nó.'),
        fill('q8', 'Complete: o recurso rejeita pedidos de um dono antigo comparando um número crescente, o ___ token.', '___ token', ['fencing', 'fence'], 'O fencing token cresce a cada mudança de dono; o recurso recusa tokens menores que o maior já visto.')
      ]
    },
    {
      id: 'cdi-04-gossip',
      title: 'Gossip e protocolos epidêmicos',
      goal: 'Entender como a disseminação por fofoca converge em poucas rodadas, e seus custos.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'A ideia: espalhar informação como um boato',
            'No gossip (ou protocolo epidêmico), não há coordenador. A cada rodada, cada nó escolhe um ou poucos vizinhos ALEATÓRIOS e troca informação com eles. Quem já conhece uma novidade é "infectado"; quem não conhece é "suscetível". A novidade se espalha como uma epidemia, e como cada nó fala com poucos, a carga por nó fica baixa mesmo em clusters grandes. Não existe ponto único de falha: se alguns nós caem, a informação segue por outros caminhos.'
          ),
          sl(
            'Push, pull e push-pull',
            'PUSH: quem tem a novidade a envia ao nó sorteado. PULL: o nó pergunta ao sorteado "o que você sabe?" e absorve o que lhe falta. PUSH-PULL: os dois lados enviam e recebem na mesma troca. Comportamento: no push, o início é rápido (muitos infectados escolhem alvos novos), mas o FIM é lento, pois restam poucos suscetíveis e raramente algum infectado sorteia um deles. No pull, o início é lento (poucos têm o que dar) e o fim é rápido (cada suscetível pergunta e logo encontra um infectado). O push-pull junta o melhor dos dois e converge mais rápido.'
          ),
          sl(
            'Convergência em O(log N) rodadas',
            'No início, a cada rodada o número de infectados aproximadamente DOBRA (cada um infecta mais um). Dobrar até chegar a N leva cerca de log2(N) rodadas, e um pouco mais para os retardatários. Portanto o número de rodadas cresce com o LOGARITMO de N, não com N: multiplicar o cluster por 10 adiciona poucas rodadas. A simulação abaixo (média de 20 execuções, 1 nó inicial, cada nó sorteia 1 parceiro por rodada) mostra isso; os valores variam com o sorteio, e o que importa é a tendência.',
            `import random
def gossip(N, modo, seed):
    r = random.Random(seed); inf = {0}; rodadas = 0
    while len(inf) < N:
        rodadas += 1; novo = set(inf)
        for i in range(N):
            j = r.randrange(N)
            if j == i: continue
            if modo == 'push' and i in inf: novo.add(j)
            if modo == 'pull' and j in inf: novo.add(i)
            if modo == 'pp' and (i in inf or j in inf):
                novo.add(i); novo.add(j)
        inf = novo
    return rodadas
# médias aproximadas (push | pull | push-pull):
# N=100   11.9 |  9.3 | 6.6   (log2 N = 6.6)
# N=1000  18.1 | 13.6 | 9.2   (log2 N = 10.0)
# N=10000 23.1 | 17.6 | 11.7  (log2 N = 13.3)`
          ),
          sl(
            'Anti-entropia: garantir a convergência',
            'Disseminação por rumor pode falhar: mensagens se perdem e o rumor "esfria" (os nós param de espalhá-lo), deixando alguns nós para trás. A ANTI-ENTROPIA é o complemento: periodicamente dois nós comparam seus dados (versões, resumos ou árvores de Merkle) e reparam as diferenças. Ela é mais lenta e mais cara, mas garante que, mesmo se o rumor falhar, os nós acabem convergindo. Muitos sistemas usam as duas: rumor para velocidade e anti-entropia para garantia.'
          ),
          sl(
            'Membership e detecção de falhas estilo SWIM',
            'O gossip é muito usado para saber QUEM está no cluster. No SWIM, a cada período cada nó escolhe um alvo aleatório e lhe envia um ping. Sem resposta, ele pede a k outros nós que façam um ping INDIRETO ao alvo; se ainda assim não houver resposta, o alvo vira SUSPEITO e, depois de um prazo sem se defender, é declarado falho. As mudanças de membership (entrou, suspeito, saiu) viajam "de carona" nas próprias mensagens de ping (piggyback), sem mensagens extras. O trabalho por nó por período é constante, independente de N.'
          ),
          sl(
            'Vantagens e custos',
            'Vantagens: robusto (tolera perdas de mensagem e nós), escalável (carga por nó baixa e convergência logarítmica), simples e descentralizado. Custos: a consistência é só EVENTUAL (em dado instante nós diferentes sabem coisas diferentes); há mensagens redundantes (o mesmo boato chega várias vezes ao mesmo nó); o tempo de convergência é probabilístico, não garantido. Segurança e privacidade: um nó malicioso ou defeituoso pode espalhar informação falsa, então as mensagens de gossip devem ser autenticadas e cifradas entre nós, e dados pessoais não devem circular em gossip de membership (apenas metadados técnicos).'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que caracteriza a troca em modo push-pull?', 'a', [
          'Os dois nós enviam e recebem informação na mesma troca',
          'Só o nó que conhece a novidade envia, e o outro apenas recebe',
          'Só o nó que não conhece a novidade pergunta, e o outro responde',
          'Um coordenador central decide quem fala com quem a cada rodada'
        ], 'Push-pull combina os dois: ambos os lados enviam e absorvem, o que converge mais rápido que push ou pull isolados.'),
        mcq('q2', 'Por que o modo push é lento no final da disseminação?', 'c', [
          'Porque as mensagens ficam maiores a cada rodada e a rede acaba saturando o enlace',
          'Porque o coordenador precisa confirmar cada entrega',
          'Porque poucos nós restam sem a novidade e raramente são sorteados',
          'Porque nós infectados deixam de conhecer a novidade'
        ], 'No fim, quase todos já sabem. Cada infectado sorteia ao acaso e quase nunca acerta um dos poucos suscetíveis restantes.'),
        mcq('q3', 'Um cluster passa de 1.000 para 1.000.000 de nós (1000 vezes maior). O que se espera do número de rodadas do gossip?', 'b', [
          'Cresce cerca de 1000 vezes, proporcional ao tamanho do cluster, no pior caso',
          'Cresce pouco (da ordem de log N), algumas rodadas a mais',
          'Permanece exatamente igual, independente do tamanho',
          'Cai pela metade, pois há mais nós para espalhar'
        ], 'Convergência é O(log N): 1000x mais nós adiciona cerca de log2(1000) ≈ 10 rodadas (na ordem de grandeza), não 1000x.'),
        fill('q4', 'Complete a ordem de grandeza do número de rodadas até a convergência do gossip.', 'rodadas = O(___ N)', ['log', 'log2', 'ln'], 'A cada rodada os infectados dobram no início, então são necessárias cerca de log2(N) rodadas.'),
        mcq('q5', 'Qual a função da anti-entropia em um sistema com gossip?', 'd', [
          'Reduzir o número de mensagens ao mínimo possível',
          'Substituir o gossip por um líder que decide tudo',
          'Impedir que nós maliciosos entrem no cluster',
          'Comparar o estado dos nós e reparar diferenças, garantindo convergência'
        ], 'Se o rumor falhar, a comparação periódica (versões, digests, Merkle) encontra e corrige as divergências restantes.'),
        mcq('q6', 'No SWIM, por que se faz um ping indireto antes de suspeitar de um nó?', 'c', [
          'Para economizar largura de banda em clusters pequenos',
          'Para que o alvo saiba quem o está monitorando e responda diretamente a todos',
          'Para evitar falso positivo por falha só no enlace direto entre os dois',
          'Para eleger um líder entre os nós que responderam'
        ], 'Pedir a k outros nós que tentem falar com o alvo diferencia um problema no caminho A–B de uma falha real de B.'),
        mcq('q7', 'Qual é um custo real do gossip?', 'a', [
          'Consistência apenas eventual e mensagens redundantes',
          'Ponto único de falha no nó que inicia a fofoca, que centraliza a disseminação',
          'Necessidade de relógios sincronizados com precisão',
          'Número de rodadas crescendo linearmente com os nós'
        ], 'Em qualquer instante nós diferem, e o mesmo boato chega repetido. Não há ponto único de falha, e as rodadas crescem com log N.'),
        fill('q8', 'No SWIM, as mudanças de membership viajam junto das mensagens de ping, sem mensagens extras. Essa técnica se chama ___.', 'técnica de ___ (carona nas mensagens)', ['piggyback', 'piggybacking'], 'Piggyback: anexar informação às mensagens que já seriam enviadas, evitando tráfego adicional.')
      ]
    }
,
    {
      id: 'cdi-05-eleicao-lider',
      title: 'Eleição de líder',
      goal: 'Entender algoritmos de eleição, mandatos, split brain e como proteger recursos contra líderes obsoletos.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que eleger um líder',
            'Ter um único líder simplifica muito: ele decide a ordem das escritas, evita conflitos e coordena réplicas. O custo é que, quando o líder cai, o grupo precisa escolher outro sem intervenção humana. Uma boa eleição tem duas propriedades: SEGURANÇA (no máximo um líder válido por vez) e VIVACIDADE (eventualmente, se a rede estabilizar, algum líder é eleito). Abaixo veremos algoritmos clássicos (bully e ring) e a abordagem moderna, que usa quórum e mandatos.'
          ),
          sl(
            'Algoritmo bully',
            'Cada nó tem um id único e ordenado, e todos conhecem os ids dos outros. Quando um nó percebe que o líder caiu, ele envia ELEIÇÃO apenas aos nós de id MAIOR que o seu. Se nenhum responde, ele vence: envia COORDENADOR a todos. Se algum de id maior responde OK, o nó desiste e esse maior assume a eleição (repetindo o processo). Resultado: o nó VIVO de maior id sempre vence ("o valentão ganha"). Fraquezas: assume ids conhecidos e detecção confiável de falhas (um nó de id alto lento ou instável derruba o líder repetidas vezes) e, no pior caso, gera muitas mensagens.',
            `# nós 1..5; o 5 (líder) caiu; o nó 2 percebe e inicia
# 2 -> 3,4,5 ELEICAO     3 -> 2 OK    4 -> 2 OK     (5 não responde)
# 3 -> 4,5 ELEICAO       4 -> 3 OK
# 4 -> 5   ELEICAO       (5 não responde; ninguém maior vivo)
# 4 vence: 4 -> 1,2,3 COORDENADOR`
          ),
          sl(
            'Algoritmo ring',
            'Os nós formam um anel lógico, cada um conhecendo o seguinte. Quem inicia envia ao vizinho uma mensagem ELEIÇÃO contendo o seu id. Cada nó que recebe acrescenta o próprio id à lista e repassa (pulando nós mortos). Quando a mensagem volta ao iniciador, ele escolhe o maior id da lista como líder e faz circular uma mensagem COORDENADOR avisando o resultado. O custo é da ordem de N mensagens por volta, e os dois algoritmos clássicos pressupõem uma rede sem partições, o que é uma suposição forte demais para a vida real.'
          ),
          sl(
            'Na prática: lease/lock num serviço de coordenação',
            'Sistemas reais costumam terceirizar a eleição para um serviço de coordenação baseado em consenso (como ZooKeeper ou etcd). Todos os candidatos tentam criar uma mesma chave (ou nó efêmero) associada a um LEASE com tempo de vida. Quem consegue é o líder, e precisa renovar o lease periodicamente; se ele morrer ou ficar isolado, o lease expira, a chave some e outro candidato assume. A parte difícil (concordar sobre quem criou a chave) fica com o consenso do serviço. Algoritmos como o Raft, que veremos adiante, embutem a eleição no próprio protocolo.'
          ),
          sl(
            'Mandatos (terms/epochs) e quórum',
            'Para distinguir líderes velhos de novos, cada eleição incrementa um número crescente: o MANDATO (term em Raft, epoch em outros sistemas). Toda mensagem do líder carrega seu mandato. Um nó que vê um mandato maior que o seu atualiza o dele e passa a obedecer ao novo líder; um líder que vê um mandato maior que o seu abdica. Para ser eleito é preciso receber votos da MAIORIA dos nós (por exemplo, 3 de 5), e cada nó vota no máximo uma vez por mandato. Como duas maiorias sempre se sobrepõem em pelo menos um nó, dois candidatos não conseguem ambos a maioria no mesmo mandato.'
          ),
          sl(
            'Split brain e o líder antigo que não sabe',
            'SPLIT BRAIN: uma partição de rede divide o cluster, e os dois lados elegem seu próprio líder; ambos aceitam escritas divergentes e os dados corrompem. A defesa é o QUÓRUM: só o lado com a maioria pode eleger líder e aceitar escritas; o lado minoritário para. Mas há um caso mais sutil: um líder pausado (GC, VM congelada) é destituído, um novo líder assume, e o antigo acorda ainda ACREDITANDO ser o líder, pois não viu o tempo passar. Para isso, usa-se o mandato como FENCING TOKEN: o recurso (disco, banco, fila) lembra o maior mandato já visto e rejeita escritas com mandato menor. Do ponto de vista de segurança, isso evita que um nó obsoleto altere (ou apague) dados, inclusive pessoais, depois de perder a autoridade.'
          )
        ]
      },
      questions: [
        mcq('q1', 'No bully com ids 1 a 5, o nó 5 (líder) caiu e o nó 2 inicia a eleição. Quem vence, supondo que 1, 2, 3 e 4 estão vivos?', 'c', [
          'O nó 5, pois é o maior id do cluster inteiro',
          'O nó 2, pois foi quem iniciou a eleição',
          'O nó 4, pois é o maior id ainda vivo',
          'O nó 1, pois é o menor id e tem mais prioridade'
        ], 'O bully sempre elege o nó vivo de maior id. O 5 está morto, então o 4 ganha.'),
        mcq('q2', 'Para quem um nó envia a mensagem ELEIÇÃO no algoritmo bully?', 'd', [
          'Para todos os nós do cluster, sem exceção',
          'Para o nó de menor id, que decide pelos outros',
          'Para o vizinho seguinte no anel lógico',
          'Apenas para os nós com id maior que o seu'
        ], 'Só nós de id maior podem vencer o iniciador. Se nenhum responder, o iniciador é o maior vivo.'),
        mcq('q3', 'Como funciona o algoritmo ring?', 'b', [
          'Cada nó vota em um candidato e vence quem tiver a maioria dos votos do anel',
          'Uma mensagem circula acumulando ids; ao voltar, escolhe-se o maior',
          'O nó com o relógio mais atrasado assume a liderança',
          'Um serviço central sorteia o líder entre os nós vivos'
        ], 'A mensagem ELEIÇÃO dá a volta no anel acumulando ids; o iniciador escolhe o maior e anuncia com COORDENADOR.'),
        fill('q4', 'Qual o nome do número crescente incrementado a cada eleição, que identifica o mandato do líder? (em Raft se chama term)', 'cada eleição aumenta o número de ___ (term/epoch)', ['mandato', 'term', 'epoch', 'época', 'epoca'], 'Mandato (term/epoch): permite distinguir líderes novos de antigos, pois mensagens com mandato menor são ignoradas.'),
        mcq('q5', 'Como surge um split brain?', 'a', [
          'Uma partição deixa dois lados que elegem líderes próprios e aceitam escritas',
          'Um líder fica sem memória e passa a gravar dados duplicados no disco',
          'Dois nós recebem o mesmo id e disputam a mesma eleição no anel',
          'O mandato chega ao valor máximo e volta a zero em todos os nós'
        ], 'Sem exigir quórum, cada lado da partição acha que é o legítimo e escreve; ao reunir, os dados divergem.'),
        mcq('q6', 'Qual mecanismo impede o split brain em eleições modernas?', 'b', [
          'Escolher sempre o nó com o relógio de parede mais adiantado em cada rodada',
          'Exigir votos da maioria para eleger e para confirmar escritas',
          'Aumentar o timeout até a rede nunca mais particionar',
          'Eleger vários líderes e deixar os clientes escolherem um'
        ], 'Com maioria, no máximo um lado da partição consegue eleger líder (duas maiorias se sobrepõem); o lado minoritário para.'),
        mcq('q7', 'O líder antigo pausou (GC), foi substituído e, ao acordar, tenta gravar no armazenamento. O que evita dano?', 'd', [
          'O líder antigo checar o próprio relógio antes de cada escrita',
          'O novo líder enviar um e-mail avisando o antigo da destituição e esperar a resposta',
          'O cliente repetir a escrita até alguém aceitar',
          'O armazenamento rejeitar escritas com mandato menor que o já visto'
        ], 'Checar o relógio não basta (a pausa pode ocorrer depois da checagem). O recurso com fencing por mandato recusa o obsoleto.'),
        fill('q8', 'Em um cluster de 5 nós, qual o número mínimo de votos para vencer uma eleição por maioria?', 'votos mínimos = ___ de 5', ['3', 'três', 'tres'], 'Maioria de 5 = floor(5/2) + 1 = 3.')
      ]
    },
    {
      id: 'cdi-06-exclusao-mutua-locks',
      title: 'Exclusão mútua e locks distribuídos',
      goal: 'Conhecer algoritmos clássicos de exclusão mútua e por que locks com TTL exigem fencing tokens.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O problema da exclusão mútua',
            'Vários processos em máquinas diferentes querem usar um recurso exclusivo: gravar um arquivo, executar um job que só pode rodar uma vez, atualizar um registro sem corrida. A região de código que exige uso exclusivo é a SEÇÃO CRÍTICA. Um bom algoritmo garante EXCLUSÃO MÚTUA (nunca dois dentro ao mesmo tempo, a propriedade de segurança) e progresso (sem deadlock nem starvation, a propriedade de vivacidade). Em um único computador isso é fácil (mutex). Em rede, há atrasos, perdas e nós que falham.'
          ),
          sl(
            'Algoritmos clássicos em visão geral',
            'CENTRALIZADO: um coordenador concede o lock. Mensagens por entrada: 3 (REQUEST, GRANT, RELEASE). Simples, mas o coordenador é ponto único de falha e gargalo. RICART-AGRAWALA: sem coordenador; quem quer entrar envia REQUEST com timestamp de Lamport a todos os outros. Cada outro responde OK, exceto se estiver na seção crítica ou tiver pedido mais antigo (nesses casos adia a resposta). Entra ao receber N−1 respostas: custo de 2(N−1) mensagens por entrada, e se um nó não responder (falhou), todos ficam bloqueados. TOKEN RING: um token circula no anel e só quem o tem entra na seção crítica; se o token se perde é preciso detectar e regenerar. Todos exigem tratamento de falhas que os algoritmos "de livro" ignoram.',
            `# mensagens por entrada na seção crítica
def centralizado():      return 3          # REQUEST, GRANT, RELEASE
def ricart_agrawala(N):  return 2 * (N - 1)
print(ricart_agrawala(3), ricart_agrawala(5), ricart_agrawala(10))  # 4 8 18`
          ),
          sl(
            'Lease: lock com prazo de validade',
            'Se um processo pega um lock e morre, o lock ficaria preso para sempre. A solução prática é o LEASE (ou lock com TTL): o lock vale por um tempo; o dono precisa renová-lo; se parar de renovar, o lock expira e outro processo pode pegá-lo. Isso dá vivacidade (o sistema destrava sozinho), mas introduz um perigo: o dono pode PERDER o lock sem saber.'
          ),
          sl(
            'O perigo: o dono que não sabe que perdeu',
            'Linha do tempo: o cliente 1 obtém o lock com TTL de 10 s; sofre uma pausa longa (GC, VM suspensa, rede lenta) de 15 s; o lock expira; o cliente 2 obtém o lock e escreve; o cliente 1 acorda, ainda "acha" que tem o lock e escreve também: os dois escreveram. Verificar o relógio ou o lease antes de escrever NÃO resolve, porque a pausa pode acontecer logo DEPOIS da verificação. E relógios com skew ou saltos podem expirar o lease antes ou depois do esperado. Logo, um lock baseado em TTL, sozinho, não garante exclusão mútua para dados que precisam de correção.',
            `t=0   C1 pega o lock (TTL 10s)
t=1   C1 pausa (GC de 15s)
t=10  lock expira
t=11  C2 pega o lock e escreve
t=16  C1 acorda, acha que ainda tem o lock e ESCREVE   <- dois donos`
          ),
          sl(
            'Fencing token: a solução',
            'O serviço de lock entrega, a cada concessão, um TOKEN que só aumenta (33, 34, 35...). O cliente envia o token em TODA operação sobre o recurso protegido, e o recurso guarda o maior token já visto e REJEITA qualquer um menor. Assim, o cliente 1 (token 33), mesmo acordando depois do cliente 2 (token 34), é recusado. A proteção passa a ser verificada no próprio recurso, que é quem de fato sofre o dano. Exige que o recurso colabore (verifique tokens) e que o serviço de lock gere tokens monotônicos.',
            `class Recurso:
    def __init__(s): s.maior = 0; s.valor = None
    def escrever(s, token, valor):
        if token < s.maior: return 'REJEITADO'
        s.maior = token; s.valor = valor; return 'ok'

r = Recurso()
print(r.escrever(33, 'a'))   # ok
print(r.escrever(34, 'b'))   # ok  (cliente 2)
print(r.escrever(33, 'c'))   # REJEITADO (cliente 1 acordou tarde)
print(r.valor)               # b`
          ),
          sl(
            'ZooKeeper/etcd vs Redis, e quando evitar locks',
            'Serviços baseados em consenso (ZooKeeper, etcd) oferecem locks sobre dados linearizáveis, com sessões/leases e números que crescem (como a revisão ou a ordem de criação), úteis como fencing tokens. O Redis com SET NX e expiração é simples e rápido, mas sua replicação costuma ser assíncrona, então um failover pode perder o lock; o Redlock (adquirir em vários Redis independentes) é debatido: críticos afirmam que, sem fencing token, ele não é seguro diante de pausas e saltos de relógio; defensores o consideram suficiente para certos usos. Regra honesta: lock "de eficiência" (evitar trabalho duplicado, se uma falha só custa recomputar) pode ser simples; lock "de correção" exige fencing. Melhor ainda, evitar locks: operações IDEMPOTENTES, escrita condicional com CAS (compare-and-set: só grava se a versão ainda é a esperada) e FILAS que serializam o processamento (um consumidor por chave).',
            `-- CAS no banco: evita lock distribuído
UPDATE conta SET saldo = 80, versao = 6
 WHERE id = 7 AND versao = 5;   -- 0 linhas afetadas: alguém mudou antes`
          )
        ]
      },
      questions: [
        mcq('q1', 'No Ricart-Agrawala com 5 processos, quantas mensagens por entrada na seção crítica (2 × (N − 1))?', 'b', [
          '5',
          '8',
          '10',
          '3'
        ], 'Cada entrada envia N−1 = 4 REQUESTs e recebe 4 OKs: 8 mensagens. O centralizado usa 3, independente de N.'),
        mcq('q2', 'Qual é o principal ponto fraco do algoritmo centralizado de exclusão mútua?', 'a', [
          'O coordenador é um ponto único de falha e gargalo',
          'Ele exige relógios físicos perfeitamente sincronizados',
          'Ele gera um número de mensagens proporcional a N²',
          'Ele só funciona se houver exatamente dois processos'
        ], 'Se o coordenador cai, ninguém obtém o lock; também todo pedido passa por ele. Mas só gasta 3 mensagens por entrada.'),
        mcq('q3', 'Por que um lock com TTL, sozinho, não garante exclusão mútua?', 'd', [
          'Porque o TTL impede qualquer cliente de renovar o lock',
          'Porque o serviço de lock aceita dois donos desde o início, sem nenhum controle de versão',
          'Porque o TTL só funciona em sistemas com um único nó',
          'Porque o dono pode sofrer uma pausa, perder o lock e escrever ao acordar'
        ], 'Pausa longa + expiração + novo dono = dois processos acreditando ter o lock. O TTL dá vivacidade, não segurança.'),
        fill('q4', 'Um recurso já viu o token 34. Chega uma escrita com token 33. O que ele faz com ela?', 'if token < maior_visto: ___   # aceita ou rejeita?', ['rejeita', 'rejeitar', 'rejeitado', 'recusa', 'recusar', 'descarta', 'reject'], 'O recurso rejeita tokens menores que o maior já visto: é o fencing token protegendo contra o dono antigo.'),
        mcq('q5', 'Um cliente verifica "meu lease ainda é válido?" imediatamente antes de escrever. Isso basta para garantir exclusão?', 'c', [
          'Sim, pois a verificação e a escrita acontecem no mesmo instante',
          'Sim, desde que o relógio do cliente seja mais preciso que o do servidor',
          'Não, pois uma pausa pode ocorrer entre a verificação e a escrita',
          'Não, pois leases não podem ser consultados depois de concedidos'
        ], 'A janela entre a checagem e a escrita pode conter uma pausa longa. A verificação precisa ser feita no recurso, com fencing token.'),
        mcq('q6', 'Sobre um lock simples com Redis (SET NX com expiração), qual afirmação é mais honesta?', 'a', [
          'Serve para evitar trabalho duplicado, mas sem fencing não garante exclusão sob pausas e failovers',
          'Garante exclusão mútua perfeita, pois o Redis nunca perde dados',
          'É inútil, pois nenhum lock pode funcionar fora de um único computador',
          'É equivalente a um lock em etcd, pois ambos usam a mesma garantia'
        ], 'A replicação assíncrona pode perder o lock num failover, e TTL sofre com pausas. Para correção, use fencing; para eficiência, pode bastar.'),
        mcq('q7', 'Qual alternativa a um lock distribuído evita corrida ao atualizar um saldo?', 'c', [
          'Aumentar o TTL do lock até ele nunca expirar',
          'Sincronizar os relógios das máquinas com NTP',
          'Escrita condicional com CAS: gravar só se a versão ainda for a esperada',
          'Reiniciar o serviço sempre que dois clientes colidirem e repetir a operação do zero'
        ], 'CAS (UPDATE ... WHERE versao = esperada) detecta que outro escreveu antes, sem precisar de lock; o cliente relê e tenta de novo.'),
        fill('q8', 'Com 6 processos no Ricart-Agrawala, quantas mensagens por entrada na seção crítica?', 'mensagens = 2 * (6 - 1) = ___', ['10'], '2 × (6 − 1) = 10 mensagens (5 requisições e 5 respostas).')
      ]
    },
    {
      id: 'cdi-07-consenso-paxos-raft-intro',
      title: 'Consenso: FLP, quóruns, Paxos e Raft',
      goal: 'Entender o problema do consenso, o resultado FLP, a interseção de quóruns e a ideia de Paxos e Raft.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O problema do consenso',
            'Vários nós propõem valores e todos precisam decidir UM só. Um algoritmo de consenso correto garante: ACORDO (dois nós corretos nunca decidem valores diferentes), VALIDADE (o valor decidido foi proposto por algum nó, nada inventado) e TERMINAÇÃO (todo nó correto acaba decidindo). Acordo e validade são propriedades de SEGURANÇA ("nada de ruim acontece"); terminação é de VIVACIDADE ("algo bom acontece um dia").'
          ),
          sl(
            'Por que o consenso é central',
            'Muitos problemas do dia a dia são consenso disfarçado: eleger um líder (todos concordam em quem é), replicar um log (todos concordam na ordem das entradas), conceder um lock ou lease, guardar configuração e membership do cluster, decidir commit/abort de uma transação. Se você tem consenso, constrói replicação de máquina de estados: todas as réplicas aplicam os mesmos comandos na mesma ordem e ficam iguais. É por isso que ZooKeeper, etcd e Consul existem: oferecer consenso como serviço.'
          ),
          sl(
            'FLP: o limite teórico',
            'O resultado de Fischer, Lynch e Paterson (FLP) diz: num sistema ASSÍNCRONO (sem limite conhecido para o atraso das mensagens) em que pelo menos um processo pode falhar por parada, nenhum algoritmo DETERMINÍSTICO consegue garantir terminação do consenso em todas as execuções. Motivo intuitivo: não dá para distinguir um processo lento de um morto, então sempre pode existir uma execução em que o algoritmo espera para sempre. O que FLP NÃO diz: que consenso é impossível na prática. Na prática, sistemas mantêm a SEGURANÇA sempre e deixam a VIVACIDADE depender de a rede se comportar (sincronia parcial), usando timeouts e ALEATORIEDADE (como os timeouts aleatórios de eleição do Raft) para sair de impasses.'
          ),
          sl(
            'Quóruns e interseção de maiorias',
            'Um QUÓRUM de maioria é mais da metade dos nós: floor(N/2) + 1. A propriedade-chave: QUAISQUER duas maiorias têm pelo menos um nó em comum. Assim, uma decisão tomada por uma maioria é "vista" por qualquer maioria posterior, que não a contradiz. Para tolerar f falhas é preciso N ≥ 2f + 1 (restam f + 1 nós, uma maioria). Número par de nós não ajuda: 4 nós exigem quórum 3 e toleram só 1 falha, como 3 nós. E nem todo quórum serve: com 6 nós, grupos de 3 podem NÃO se sobrepor.',
            `from itertools import combinations
def maioria(N): return N // 2 + 1
for N in range(3, 8):
    print(N, maioria(N), (N - 1) // 2)
# N maioria f(toleradas):  3 2 1 | 4 3 1 | 5 3 2 | 6 4 2 | 7 4 3
def sempre_intersecta(N, q):
    return all(set(a) & set(b) for a in combinations(range(N), q)
                               for b in combinations(range(N), q))
print(sempre_intersecta(5, 3))   # True  (maioria de 5)
print(sempre_intersecta(6, 3))   # False (3 de 6 não é maioria)`
          ),
          sl(
            'Paxos em visão geral',
            'Paxos é a família clássica de consenso. Papéis: PROPOSERS propõem valores; ACCEPTORS votam e guardam estado; LEARNERS descobrem o valor decidido (um nó pode ter vários papéis). Fase 1 (prepare/promise): o proposer escolhe um número de proposta n e pede a uma maioria de acceptors que PROMETAM não aceitar propostas com número menor que n; cada um responde com o valor de maior número que já aceitou, se houver. Fase 2 (accept/accepted): o proposer envia accept(n, v), onde v é o valor devolvido de maior número entre as promessas (ou o próprio valor, se ninguém aceitou nada); se uma maioria aceita, o valor foi ESCOLHIDO. Intuição: como maiorias se intersectam, quem tenta depois sempre descobre um valor já escolhido e o preserva em vez de trocá-lo.'
          ),
          sl(
            'Raft: consenso compreensível',
            'Paxos é notoriamente difícil de entender e de implementar completo. O Raft foi criado como alternativa projetada para ser COMPREENSÍVEL: divide o problema em partes claras (eleição de líder, replicação do log, segurança) e usa um líder forte que organiza tudo. Oferece garantias equivalentes às do Multi-Paxos (tolera f falhas com 2f + 1 nós). É o consenso por trás de sistemas como etcd e Consul, e é o assunto da próxima lição.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual propriedade do consenso garante que dois nós corretos nunca decidam valores diferentes?', 'd', [
          'Terminação',
          'Durabilidade',
          'Validade',
          'Acordo'
        ], 'Acordo é a garantia central de segurança. Validade exige que o valor tenha sido proposto; terminação, que todos decidam.'),
        mcq('q2', 'O que o resultado FLP afirma?', 'c', [
          'Que consenso é impossível em qualquer sistema distribuído real',
          'Que sistemas síncronos nunca conseguem chegar a um consenso',
          'Que em sistema assíncrono com uma falha possível, nenhum algoritmo determinístico garante terminação',
          'Que qualquer algoritmo de consenso precisa de relógios atômicos'
        ], 'FLP limita a garantia de terminação (vivacidade) sob assincronia total e uma possível falha; não proíbe consenso na prática.'),
        mcq('q3', 'Como sistemas práticos contornam o FLP?', 'a', [
          'Mantêm a segurança sempre e usam timeouts e aleatoriedade para obter vivacidade quando a rede estabiliza',
          'Abrem mão do acordo e aceitam valores diferentes em nós diferentes',
          'Assumem que nenhum nó jamais falha e dispensam detecção de falhas',
          'Usam relógios de parede iguais em todos os nós para decidir'
        ], 'Segurança é preservada em qualquer execução; terminação é obtida quando há sincronia suficiente, com ajuda de timeouts e aleatoriedade.'),
        fill('q4', 'Qual o tamanho do quórum de maioria em um cluster de 7 nós?', 'quórum = floor(7/2) + 1 = ___', ['4', 'quatro'], 'floor(7/2) + 1 = 4. Dois grupos de 4 em 7 nós sempre se sobrepõem em ao menos um nó.'),
        mcq('q5', 'Um cluster de 6 nós com quórum de maioria tolera quantas falhas?', 'b', [
          '3, pois metade dos nós pode falhar e ainda restaria uma maioria funcionando',
          '2, o mesmo que com 5 nós, pois a maioria de 6 é 4',
          '1, pois só números ímpares toleram falhas',
          '4, pois bastam 2 nós para formar quórum'
        ], 'Maioria de 6 é 4, então só 2 nós podem falhar: o sexto nó não acrescenta tolerância em relação a 5 nós.'),
        mcq('q6', 'Qual é o objetivo da fase 1 (prepare/promise) do Paxos?', 'd', [
          'Gravar o valor final no disco de todos os learners',
          'Eleger um líder fixo que decidirá todos os valores futuros e impedirá novas propostas de outros nós',
          'Sincronizar os relógios de parede dos acceptors',
          'Obter promessas de uma maioria e descobrir um valor já aceito, que deve ser preservado'
        ], 'Os acceptors prometem ignorar números menores e devolvem o que já aceitaram; o proposer reaproveita esse valor na fase 2.'),
        mcq('q7', 'Por que a interseção entre maiorias é tão importante para o consenso?', 'a', [
          'Qualquer maioria nova contém ao menos um nó que viu a decisão anterior',
          'Ela garante que todos os nós recebam todas as mensagens',
          'Ela elimina a necessidade de numerar as propostas ou mandatos e de trocar mensagens',
          'Ela permite decidir com apenas metade dos nós, sempre'
        ], 'O nó em comum "lembra" o que foi decidido e impede que uma nova maioria decida algo contraditório.'),
        fill('q8', 'Para tolerar f = 3 falhas por parada com maioria, qual o número mínimo de nós (N ≥ 2f + 1)?', 'N = 2 * 3 + 1 = ___', ['7', 'sete'], 'N ≥ 2f + 1 = 7: com 3 falhas sobram 4 nós, uma maioria de 7.')
      ]
    },
    {
      id: 'cdi-08-raft-pratica-quoruns',
      title: 'Raft na prática',
      goal: 'Entender papéis, eleição, replicação de log, commit por maioria e segurança no Raft.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Papéis e termos',
            'Todo nó Raft está em um de três papéis: FOLLOWER (passivo, só responde a líderes e candidatos), CANDIDATE (tenta virar líder) e LEADER (recebe os pedidos dos clientes e replica o log). O tempo é dividido em TERMOS numerados, que só crescem; cada termo começa com uma eleição e tem no máximo um líder. O líder envia periodicamente heartbeats (AppendEntries vazios) para manter sua autoridade e impedir novas eleições.'
          ),
          sl(
            'Eleição com timeouts aleatórios e votos',
            'Um follower que não ouve o líder durante seu TIMEOUT DE ELEIÇÃO (valor sorteado, diferente em cada nó) vira candidate: incrementa o termo, vota em si mesmo e envia RequestVote aos outros. Cada nó vota em no máximo um candidato por termo, e só em candidato cujo log esteja pelo menos tão atualizado quanto o seu. Quem recebe votos da MAIORIA vira líder. A aleatoriedade dos timeouts faz com que, normalmente, um nó estoure primeiro e vença antes de os outros candidatarem; se houver empate de votos, ninguém vence, os timeouts estouram de novo (sorteados de novo) e começa um novo termo.',
            `class No:
    def __init__(s, nome, timeout): s.nome=nome; s.timeout=timeout; s.term=1; s.votou=None
    def request_vote(s, term, cand):
        if term > s.term: s.term = term; s.votou = None
        if term == s.term and s.votou in (None, cand):
            s.votou = cand; return True
        return False

nos = [No('A', 150), No('B', 300), No('C', 220)]
cand = min(nos, key=lambda n: n.timeout)      # A estoura primeiro
cand.term += 1; cand.votou = cand.nome
votos = 1 + sum(n.request_vote(cand.term, cand.nome) for n in nos if n is not cand)
print(cand.nome, cand.term, votos, votos >= len(nos)//2 + 1)   # A 2 3 True`
          ),
          sl(
            'Replicação do log e commit por maioria',
            'O cliente envia o comando ao líder, que o anexa ao seu log (cada entrada tem termo e índice) e o envia aos followers com AppendEntries. Cada follower confere se seu log "casa" com o do líder no ponto anterior; se não casa, rejeita, e o líder retrocede e reenvia até achar o ponto de acordo e então sobrescreve o que divergia. Uma entrada é COMMITADA quando está armazenada na MAIORIA dos nós (incluindo o líder); só então o líder a aplica à máquina de estados e responde ao cliente, e os followers descobrem o commit pelas mensagens seguintes. (Por segurança, o líder só conta réplicas para commitar entradas do próprio termo.) Dá para calcular o índice commitado a partir do último índice replicado em cada nó:',
            `def commit_index(match):       # match[i] = último índice replicado no nó i (líder incluso)
    ordenado = sorted(match, reverse=True)
    return ordenado[len(match) // 2]   # maior índice presente na maioria

print(commit_index([7, 5, 3]))        # 5  (2 de 3 nós têm >= 5)
print(commit_index([7, 7, 2, 2, 2]))  # 2  (3 de 5 têm >= 2)
print(commit_index([8, 6, 6, 2, 1]))  # 6  (3 de 5 têm >= 6)`
          ),
          sl(
            'Safety: o líder tem tudo que foi commitado',
            'A garantia central do Raft: se uma entrada foi commitada, ela estará no log de TODO líder futuro; logo, entradas commitadas nunca são perdidas nem sobrescritas. A razão em uma frase: para commitar, uma maioria guardou a entrada; para ser eleito, o candidato precisa de votos de uma maioria; as duas maiorias se sobrepõem em pelo menos um nó, e esse nó só vota em candidato com log tão atualizado quanto o dele (compara o termo da última entrada e, em empate, o tamanho do log). Assim, nenhum candidato com log defasado consegue ser eleito.'
          ),
          sl(
            'Tamanho do cluster e tolerância',
            'Com N nós, a maioria é floor(N/2) + 1 e o cluster tolera f = floor((N − 1)/2) falhas. A tabela (verificada por script) mostra por que clusters costumam ter 3 ou 5 nós e por que tamanho par não compensa. Mais nós aumentam a tolerância, mas cada commit espera mais respostas e há mais tráfego. Se perder a maioria (por exemplo, 3 de 5 fora), o cluster PARA de aceitar escritas (prefere consistência a disponibilidade), mas não perde o que já foi commitado.',
            `N  maioria  f tolerado
3     2        1
4     3        1     <- par: não melhora em relação a 3
5     3        2
6     4        2     <- par: não melhora em relação a 5
7     4        3`
          ),
          sl(
            'Falhas, leituras lineares e uso real',
            'Follower cai: o líder segue com a maioria. Líder cai: os followers estouram o timeout e elegem outro (novo termo). Leituras: ler apenas do líder pode devolver dado velho se ele foi isolado e já foi substituído sem saber. Duas soluções, em visão geral: ReadIndex (o líder confirma com uma maioria, via heartbeat, que ainda é líder antes de responder) e leitura por lease de liderança (o líder confia em um prazo de validade baseado no tempo, o que exige relógios com drift limitado). etcd e Consul usam Raft para guardar configuração e coordenação do cluster. Como esses serviços guardam configuração e segredos, o acesso deve ser autenticado, cifrado em trânsito e com mínimo privilégio.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que um follower faz ao não ouvir o líder durante seu timeout de eleição?', 'a', [
          'Vira candidate, incrementa o termo, vota em si e pede votos',
          'Assume imediatamente a liderança sem pedir votos a ninguém e avisa o cluster depois',
          'Apaga o próprio log e se desliga do cluster',
          'Aguarda indefinidamente até um administrador intervir'
        ], 'Estouro do timeout leva a candidate: novo termo, voto em si mesmo e RequestVote aos demais.'),
        mcq('q2', 'Por que o Raft usa timeouts de eleição aleatórios?', 'b', [
          'Para que cada nó use um relógio de parede diferente',
          'Para reduzir a chance de vários candidatos empatarem repetidamente',
          'Para impedir que o líder envie heartbeats com frequência e reduzir o tráfego da rede',
          'Para permitir que dois líderes coexistam no mesmo termo'
        ], 'Com timeouts diferentes, normalmente um nó se candidata primeiro e ganha antes dos outros; a aleatoriedade quebra empates (contornando o FLP na prática).'),
        mcq('q3', 'Quando uma entrada do log é considerada commitada?', 'c', [
          'Assim que o líder a grava no próprio disco',
          'Quando o cliente confirma que recebeu a resposta do líder, em até um timeout',
          'Quando está armazenada na maioria dos nós, incluindo o líder',
          'Quando todos os nós, sem exceção, a armazenaram'
        ], 'Commit exige maioria, não unanimidade: isso permite progresso mesmo com alguns nós fora.'),
        fill('q4', 'Em um cluster Raft de 7 nós, quantas falhas de nós ele tolera, f = (N − 1)/2?', 'f = (7 - 1) / 2 = ___', ['3', 'três', 'tres'], 'Com 7 nós a maioria é 4; podem falhar 3 e ainda sobra uma maioria.'),
        mcq('q5', 'Em um cluster de 5 nós, três deles ficam inacessíveis. O que ocorre?', 'd', [
          'Os dois restantes elegem um líder e seguem aceitando escritas normalmente',
          'O cluster apaga os dados commitados para evitar divergência',
          'O líder atual passa a decidir sozinho, ignorando o quórum',
          'O cluster não consegue commitar novas entradas, mas não perde as já commitadas'
        ], 'Sem maioria (2 de 5) não há eleição nem commit. O Raft prefere consistência, e as entradas commitadas continuam seguras.'),
        mcq('q6', 'Por que um líder futuro sempre tem todas as entradas commitadas?', 'b', [
          'Porque o líder antigo copia seu log para todos antes de cair',
          'Porque commit e eleição exigem maiorias que se sobrepõem, e o voto exige log atualizado',
          'Porque o candidato com maior id vence todas as eleições',
          'Porque os followers nunca mantêm cópias do log do líder'
        ], 'O nó na interseção das maiorias só vota em candidato com log tão atualizado quanto o seu, barrando candidatos defasados.'),
        mcq('q7', 'Por que ler apenas do líder, sem nenhuma checagem, pode devolver dado velho?', 'c', [
          'Porque o líder guarda os dados sem aplicar o log à máquina de estados',
          'Porque leituras sempre passam por followers que estão defasados',
          'Porque o líder pode ter sido isolado e substituído sem saber',
          'Porque o Raft não permite nenhuma leitura em nenhum nó'
        ], 'Um líder isolado ainda acredita ser líder. ReadIndex (confirmar com maioria) ou lease de liderança evitam a leitura obsoleta.'),
        fill('q8', 'Dado match = [8, 6, 6, 2, 1] (último índice replicado em cada um dos 5 nós), qual o commit_index calculado pela função da lição?', 'commit_index([8, 6, 6, 2, 1]) = ___', ['6'], 'Ordenado desc: [8,6,6,2,1]; posição 5//2 = 2 vale 6, e três nós (8, 6, 6) têm índice ≥ 6, uma maioria.')
      ]
    }
,
    {
      id: 'cdi-09-replicacao-profundidade',
      title: 'Replicação em profundidade',
      goal: 'Comparar arquiteturas e modos de replicação, entender failover, lag e anomalias de leitura.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Três arquiteturas de replicação',
            'UM LÍDER (líder-seguidor): só o líder aceita escritas e as propaga aos seguidores, que atendem leituras; simples e sem conflitos de escrita, mas o líder é gargalo e a troca dele (failover) é delicada. MÚLTIPLOS LÍDERES: vários nós aceitam escritas (por exemplo, um por região) e replicam entre si; melhora latência e disponibilidade entre regiões, ao custo de CONFLITOS de escrita que precisam ser resolvidos. SEM LÍDER: qualquer réplica aceita escritas e a consistência vem de quóruns (próxima lição).'
          ),
          sl(
            'Síncrona, assíncrona e semissíncrona',
            'SÍNCRONA: o líder só confirma ao cliente depois que a réplica confirmou a gravação. Mais durabilidade (a escrita existe em pelo menos 2 nós), porém maior latência e, se uma réplica síncrona ficar lenta ou cair, as escritas travam. ASSÍNCRONA: o líder confirma logo e replica em seguida. Latência baixa, mas uma escrita CONFIRMADA ao cliente pode ser perdida se o líder cair antes de replicar. SEMISSÍNCRONA: uma réplica é síncrona e as demais assíncronas; garante cópia em pelo menos 2 nós sem esperar todos, e se a síncrona falhar, outra assume esse papel. É o equilíbrio durabilidade x latência.'
          ),
          sl(
            'O que viaja: o log de replicação',
            'A réplica recebe um LOG de mudanças. Formas: BASEADA EM COMANDOS (statement): envia o SQL; problemático com funções não determinísticas (NOW(), RANDOM()), que dariam valores diferentes em cada réplica. WAL SHIPPING: envia os bytes do write-ahead log do motor de armazenamento; fiel, mas acoplado ao formato interno e à versão do banco. BASEADA EM LINHAS / LÓGICA: descreve "a linha X passou do valor A para B"; desacoplada do armazenamento, tolera versões diferentes e serve também para CDC (captura de mudanças). Privacidade: o log de replicação contém os mesmos dados pessoais que as tabelas, então o canal e os arquivos do log precisam de cifragem e controle de acesso equivalentes.'
          ),
          sl(
            'Failover: trocar o líder',
            'Passos: (1) detectar a falha do líder (na verdade, SUSPEITAR por timeout); (2) eleger o novo líder, em geral a réplica mais atualizada; (3) reconfigurar clientes e réplicas para usar o novo líder. Riscos: com replicação assíncrona, escritas confirmadas mas ainda não replicadas se PERDEM; se o líder antigo reaparecer achando que continua líder, há SPLIT BRAIN, então é preciso rebaixá-lo ou cercá-lo (fencing); e um timeout curto demais dispara failovers desnecessários.',
            `lider    = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]   # 10 escritas confirmadas ao cliente
seguidor = lider[:8]                        # replicação assíncrona: só 8 chegaram
# o líder cai; o seguidor é promovido
print(len(lider) - len(seguidor))           # 2 escritas confirmadas foram perdidas`
          ),
          sl(
            'Lag de replicação e anomalias',
            'Em réplicas assíncronas, o LAG é o atraso entre a escrita no líder e sua chegada ao seguidor. Consequências visíveis ao usuário: (1) ler dado antigo: você grava, a leitura seguinte vai para um seguidor defasado e sua escrita "sumiu" (violação de read-your-writes); (2) "viajar no tempo": uma leitura vai a uma réplica atualizada e a próxima a uma réplica mais atrasada, mostrando um estado mais antigo que o já visto (violação de monotonic reads). Mitigações: ler do líder os dados que o próprio usuário acabou de alterar; fixar a sessão do usuário em uma réplica; exigir que a réplica já tenha alcançado a posição do log (LSN) da última escrita do usuário.'
          ),
          sl(
            'Entre regiões e conflitos de escrita',
            'Entre regiões a latência é grande e limitada por física e rede, então replicação síncrona entre continentes torna cada escrita lenta. Opções: um líder global com réplicas remotas assíncronas (escrever de longe é lento, e perdas são possíveis no failover) ou múltiplos líderes, um por região (escrita local rápida, mas se duas regiões alteram a mesma chave surge um CONFLITO, resolvido por LWW (pode perder dados), merge pela aplicação ou CRDTs). Cuidado legal: replicar dados pessoais para outra região pode configurar transferência internacional e exigir base legal e salvaguardas; decida a localização das réplicas conscientemente (LGPD).'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é o trade-off da replicação síncrona?', 'c', [
          'Menos durabilidade, mas escritas mais rápidas',
          'Mais conflitos de escrita entre réplicas',
          'Mais durabilidade, mas maior latência e risco de travar com réplica lenta',
          'Eliminação total da possibilidade de lag de replicação e de conflitos de escrita entre réplicas'
        ], 'Esperar a réplica garante a escrita em 2+ nós, mas cada escrita fica mais lenta e depende da réplica síncrona estar saudável.'),
        mcq('q2', 'Qual é o principal risco da replicação assíncrona no failover?', 'd', [
          'Todas as réplicas ficam com o mesmo atraso para sempre',
          'O líder antigo deixa de poder receber leituras',
          'O cluster passa a aceitar apenas leituras, nunca escritas até o administrador intervir',
          'Escritas confirmadas ao cliente mas não replicadas podem ser perdidas'
        ], 'O líder confirmou antes de replicar; se cair, a réplica promovida não tem essas escritas.'),
        mcq('q3', 'O que é replicação semissíncrona?', 'a', [
          'Uma réplica é síncrona e as demais assíncronas',
          'Todas as réplicas são síncronas, menos a do líder',
          'As escritas são confirmadas antes de chegar ao líder',
          'Metade das escritas é síncrona e a outra é descartada'
        ], 'Garante cópia em pelo menos 2 nós sem esperar todas as réplicas, equilibrando durabilidade e latência.'),
        fill('q4', 'O líder confirmou 10 escritas ao cliente (replicação assíncrona) e a réplica promovida no failover só tinha 8. Quantas escritas confirmadas foram perdidas?', 'perdidas = 10 - 8 = ___', ['2', 'duas', 'dois'], '10 − 8 = 2 escritas confirmadas ao cliente que nunca chegaram à réplica promovida.'),
        mcq('q5', 'Qual forma de log de replicação é desacoplada do formato interno de armazenamento e tolera versões diferentes do banco?', 'b', [
          'Baseada em comandos (statement), que envia o SQL original de cada transação',
          'Baseada em linhas (lógica), que descreve as linhas alteradas',
          'WAL shipping, que envia os bytes do log do motor',
          'Cópia periódica do disco inteiro para a réplica'
        ], 'O log lógico/por linhas descreve mudanças de dados, não de páginas internas, e serve também a CDC. O WAL shipping é acoplado à versão.'),
        mcq('q6', 'Um usuário vê um comentário ao atualizar a página e, ao atualizar de novo, ele some, pois a segunda leitura foi a uma réplica mais atrasada. Como se chama essa anomalia?', 'c', [
          'Leitura fantasma, causada por inserções concorrentes',
          'Split brain, causado por dois líderes simultâneos',
          '"Viagem no tempo" (violação de monotonic reads)',
          'Perda de atomicidade, causada por commit parcial'
        ], 'A leitura mostrou estado mais antigo que o já visto: violação de monotonic reads, típica de lag em réplicas assíncronas.'),
        mcq('q7', 'Após um failover, o líder antigo volta acreditando ainda ser o líder. Qual a medida correta?', 'd', [
          'Deixá-lo aceitar escritas para não perder disponibilidade',
          'Apagar o novo líder para restaurar a configuração anterior',
          'Duplicar todas as escritas nos dois líderes ao mesmo tempo',
          'Rebaixá-lo ou cercá-lo (fencing), evitando split brain'
        ], 'Dois líderes aceitando escritas divergem. O antigo precisa virar seguidor (ou ser bloqueado por fencing) antes de voltar.'),
        fill('q8', 'Em replicação síncrona com um líder e 2 réplicas, a confirmação ao cliente só sai após o ack de todas. Quantas cópias da escrita existem no momento da confirmação?', 'cópias = líder + 2 réplicas = ___', ['3', 'três', 'tres'], 'Líder mais as duas réplicas: 3 cópias existem quando o cliente recebe a confirmação.')
      ]
    },
    {
      id: 'cdi-10-replicacao-sem-lider',
      title: 'Replicação sem líder: quóruns W e R',
      goal: 'Calcular e interpretar quóruns W e R, hinted handoff, read repair e árvores de Merkle.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O modelo estilo Dynamo/Cassandra',
            'Cada chave é guardada em N réplicas e NÃO existe líder: qualquer réplica (ou um coordenador escolhido pelo cliente) aceita escritas. Uma escrita é enviada às N réplicas e considerada bem-sucedida quando W delas confirmam; uma leitura consulta R réplicas e devolve a resposta mais recente entre as recebidas (comparando versões). Escolher W e R é escolher o equilíbrio entre latência, disponibilidade e consistência.'
          ),
          sl(
            'A condição W + R > N',
            'Se W + R > N, qualquer conjunto de W réplicas (escrita) e qualquer conjunto de R réplicas (leitura) têm pelo menos UMA réplica em comum. Logo, toda leitura contacta ao menos uma réplica que tem a última escrita bem-sucedida e, comparando versões, a enxerga. A tabela abaixo foi verificada por força bruta (enumerando todos os subconjuntos): a sobreposição é garantida exatamente quando W + R > N.',
            `N  W  R   W+R>N   sempre há interseção?
3  2  2   sim     sim   (quórum clássico)
3  1  1   não     não   (leitura pode perder a escrita)
3  3  1   sim     sim   (escrita lenta e frágil, leitura barata)
3  1  3   sim     sim   (escrita barata, leitura cara)
5  3  3   sim     sim
5  2  2   não     não
5  4  2   sim     sim
5  3  2   não     não   (3+2 = 5, não é > 5)`
          ),
          sl(
            'O que W + R > N NÃO garante',
            'Mesmo com W + R > N, o sistema NÃO é automaticamente linearizável: escritas concorrentes na mesma chave geram versões conflitantes (a decisão depende de vetores ou de LWW com relógios); uma escrita que falhou (menos de W confirmações) pode ter sido gravada em algumas réplicas e aparecer em leituras seguintes; leitura concorrente com a escrita pode ver o valor antigo ou o novo; uma réplica restaurada de um backup antigo pode "desfazer" a contagem de quórum. E vale só enquanto o quórum é "estrito": com sloppy quorum (próximo slide), nem a interseção com as réplicas donas é garantida.'
          ),
          sl(
            'Sloppy quorum e hinted handoff',
            'Se algumas das N réplicas "donas" da chave estão inacessíveis, um quórum ESTRITO recusaria a escrita. No SLOPPY QUORUM, a escrita é aceita em outros nós alcançáveis (fora do conjunto das donas) para manter a disponibilidade. Esses nós guardam a escrita com uma DICA (hint) do destinatário correto e a entregam quando a dona voltar: o HINTED HANDOFF. Ganho: aceita escritas mesmo com falhas. Custo: W + R > N deixa de garantir que a leitura veja a última escrita, pois ela pode estar apenas em nós de fora até a entrega da dica.'
          ),
          sl(
            'Read repair e anti-entropia com árvores de Merkle',
            'READ REPAIR: ao ler de R réplicas e perceber versões diferentes, o coordenador devolve a mais recente e também a grava nas réplicas defasadas, consertando durante o uso. Mas chaves raramente lidas ficam defasadas, então há também a ANTI-ENTROPIA em segundo plano. Para comparar réplicas sem enviar todos os dados, usa-se uma ÁRVORE DE MERKLE: as folhas são hashes de faixas de chaves e cada nó pai é o hash dos filhos. Se as raízes são iguais, as réplicas são idênticas; se diferem, desce-se só pelos ramos diferentes até achar as faixas divergentes, e só elas são sincronizadas.',
            `import hashlib
h = lambda b: hashlib.sha256(b).hexdigest()[:6]
def raiz(dados):
    nivel = [h(x.encode()) for x in dados]
    while len(nivel) > 1:
        nivel = [h((nivel[i] + nivel[i+1]).encode()) for i in range(0, len(nivel), 2)]
    return nivel[0]
a = ['a=1', 'b=2', 'c=3', 'd=4']
print(raiz(a) == raiz(['a=1', 'b=2', 'c=3', 'd=4']))   # True  (idênticas)
print(raiz(a) == raiz(['a=1', 'b=9', 'c=3', 'd=4']))   # False (uma folha difere)`
          ),
          sl(
            'Versões, consistência ajustável e falhas',
            'Para detectar escritas concorrentes, cada valor leva um vetor de versões (como na lição de relógios vetoriais): vetores comparáveis permitem descartar o mais velho; incomparáveis geram SIBLINGS a reconciliar. A consistência é AJUSTÁVEL POR OPERAÇÃO: escritas críticas com W alto, leituras de painel com R = 1. Tolerância a falhas: a escrita precisa de W réplicas vivas e a leitura de R, então com N = 3 e W = R = 2 tolera-se uma réplica fora para ambas; com W = 3 qualquer réplica fora bloqueia as escritas. Em geral, N − W réplicas podem estar fora para escrever e N − R para ler.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Com N = 3, W = 2 e R = 2, o que a condição W + R > N garante?', 'b', [
          'Que não existem escritas concorrentes na mesma chave nem versões conflitantes em nenhuma réplica',
          'Que toda leitura contacta ao menos uma réplica com a última escrita bem-sucedida',
          'Que nenhuma réplica jamais ficará defasada',
          'Que o sistema é linearizável em qualquer situação'
        ], 'Os conjuntos de 2 e 2 em 3 réplicas sempre se sobrepõem. Isso não impede conflitos concorrentes nem garante linearizabilidade total.'),
        mcq('q2', 'Com N = 5, W = 2 e R = 2, o que pode ocorrer?', 'c', [
          'Leituras sempre veem a última escrita, pois 2 + 2 é par e o quórum é sempre atingido',
          'A escrita sempre falha, pois W precisa ser maior que R',
          'Uma leitura pode contactar só réplicas que não receberam a última escrita',
          'O sistema aceita no máximo uma escrita por minuto'
        ], 'W + R = 4 não é maior que 5: os dois grupos podem ser disjuntos, e a leitura pode devolver dado velho.'),
        mcq('q3', 'Com N = 5, W = 3 e R = 3, quantas réplicas podem estar fora do ar para que leituras e escritas ainda funcionem?', 'd', [
          'Nenhuma, pois qualquer falha bloqueia as operações',
          'Uma, pois metade menos uma precisa estar viva',
          'Três, pois bastam duas réplicas para operar',
          'Duas, pois N − W = N − R = 2'
        ], 'Escrever exige 3 réplicas vivas e ler também 3; com 5, até 2 podem falhar.'),
        fill('q4', 'Com N = 5 e W = 4, qual o menor R que satisfaz W + R > N?', 'R mínimo = ___', ['2', 'dois'], '4 + 2 = 6 > 5. Com R = 1, 4 + 1 = 5 não é maior que 5.'),
        mcq('q5', 'O que é hinted handoff?', 'a', [
          'Guardar em outro nó a escrita destinada a uma réplica fora do ar e entregá-la quando ela voltar',
          'Descartar escritas de réplicas lentas para reduzir a latência de leitura',
          'Trocar o líder da chave quando ele deixa de responder aos clientes',
          'Comparar hashes de réplicas para encontrar dados divergentes em segundo plano'
        ], 'O nó substituto guarda a escrita com uma dica do destinatário correto e a entrega depois. Isso mantém a disponibilidade, mas enfraquece o quórum estrito.'),
        mcq('q6', 'Qual é a vantagem de uma árvore de Merkle na anti-entropia?', 'c', [
          'Dispensa o uso de vetores de versão nas escritas e de qualquer comparação entre réplicas',
          'Elimina o lag de replicação por completo',
          'Compara raízes e desce só nos ramos diferentes, achando divergências sem comparar tudo',
          'Garante que todas as leituras sejam linearizáveis'
        ], 'Raízes iguais significam réplicas iguais; raízes diferentes levam a descer apenas pelos ramos que divergem.'),
        mcq('q7', 'Qual dos itens W + R > N NÃO resolve sozinho?', 'b', [
          'A chance de uma leitura não contactar nenhuma réplica atualizada',
          'Conflitos de escritas concorrentes na mesma chave',
          'A necessidade de ter pelo menos uma réplica viva para ler',
          'O fato de existirem N réplicas da mesma chave'
        ], 'Escritas concorrentes produzem versões conflitantes (siblings ou LWW); o quórum só garante a sobreposição entre escrita e leitura bem-sucedidas.'),
        fill('q8', 'Qual o nome da técnica em que o coordenador, ao ler versões diferentes, grava a mais recente nas réplicas defasadas?', 'read ___', ['repair', 'reparo'], 'Read repair conserta réplicas defasadas durante o próprio uso, complementando a anti-entropia.')
      ]
    },
    {
      id: 'cdi-11-modelos-consistencia',
      title: 'Modelos de consistência',
      goal: 'Distinguir linearizabilidade, sequencial, causal, garantias de sessão e eventual, e escolher a garantia por caso de uso.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Linearizabilidade',
            'Um sistema é LINEARIZÁVEL se parece haver uma ÚNICA cópia do dado e cada operação ocorre de forma atômica em algum instante (o ponto de linearização) entre o início e o fim da chamada, respeitando a ORDEM EM TEMPO REAL: se a operação A termina antes de B começar, então B enxerga o efeito de A. É o modelo mais forte e o mais intuitivo (comporta-se como uma variável compartilhada), mas exige coordenação (consenso/quórum) e custa latência.'
          ),
          sl(
            'Lendo histórias de operações',
            'Para testar um modelo, registra-se uma história: cada operação com o instante de início e fim e o resultado. Abaixo, W(1) escreve 1 (o valor inicial é 0) e R->v é uma leitura que devolveu v; [i,f] é o intervalo. Verificadas por força bruta: H1 não é linearizável, pois leu o novo valor (1) e depois voltou ao antigo (0); H2 é linearizável (a escrita "acontece" entre os instantes 3 e 4); H3 não é, porque a leitura começou DEPOIS do fim da escrita e leu o valor velho; H4 é.',
            `H1: W(1) [0,10]   R->1 [2,3]   R->0 [4,5]    NÃO linearizável
H2: W(1) [0,10]   R->0 [2,3]   R->1 [4,5]    linearizável
H3: W(1) [0,5]    R->0 [6,7]                 NÃO linearizável
H4: W(1) [0,10]   R->1 [2,3]   R->1 [4,5]    linearizável`
          ),
          sl(
            'Consistência sequencial e causal',
            'CONSISTÊNCIA SEQUENCIAL: todas as operações parecem ocorrer em uma ordem única, e a ordem de cada processo é respeitada, mas NÃO se exige ordem em tempo real entre processos diferentes (uma leitura pode ainda ver o passado, desde que a ordem global seja coerente). CONSISTÊNCIA CAUSAL: operações relacionadas causalmente (a → b) são vistas na mesma ordem por todos; operações concorrentes podem ser vistas em ordens diferentes por nós diferentes. A causal não exige coordenação global e pode continuar disponível durante partições, por isso é um bom ponto de equilíbrio (por exemplo: uma resposta nunca aparece antes da pergunta).'
          ),
          sl(
            'Garantias de sessão',
            'Garantias mais fracas e baratas, aplicadas a um cliente/sessão: READ-YOUR-WRITES (depois de escrever, você sempre lê sua escrita ou algo mais novo); MONOTONIC READS (suas leituras sucessivas nunca regridem no tempo); MONOTONIC WRITES (suas escritas são aplicadas na ordem em que as emitiu); WRITES-FOLLOW-READS (uma escrita feita depois de ler um valor é ordenada depois da escrita que produziu aquele valor). São muito usadas sobre sistemas eventuais para evitar as anomalias mais irritantes.'
          ),
          sl(
            'Eventual e a hierarquia de força',
            'CONSISTÊNCIA EVENTUAL: se ninguém mais escrever, todas as réplicas acabam convergindo ao mesmo valor; nada é dito sobre o que se lê no meio do caminho. A hierarquia de força: linearizável ⇒ sequencial ⇒ causal ⇒ eventual (cada modelo mais forte oferece as garantias do mais fraco). Quanto mais forte, mais coordenação, latência e perda de disponibilidade em partições; quanto mais fraco, mais rápido e disponível, porém mais anomalias para a aplicação tratar.'
          ),
          sl(
            'Escolher a garantia e testar',
            'Escolha pelo CASO DE USO: lock, eleição, saldo e estoque crítico exigem linearizabilidade (ou transações); feed e contadores de curtidas toleram eventual; "meu perfil atualizado depois de salvar" pede read-your-writes; threads de comentários pedem causal. Para testar de verdade, grava-se a história de operações concorrentes (com tempos de início e fim) enquanto se injetam falhas e verifica-se se existe uma ordem válida segundo o modelo. É a ideia do Jepsen: provocar partições, quedas e atrasos em um banco real e checar se as histórias violam o que o produto promete. Muitos sistemas descumprem na prática o que a documentação sugere, e só testes assim revelam isso.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que caracteriza a linearizabilidade?', 'd', [
          'Todas as réplicas convergem ao mesmo valor quando as escritas cessam',
          'Cada cliente vê suas próprias escritas, mas pode ver outras desatualizadas',
          'Operações relacionadas causalmente são vistas na mesma ordem por todos',
          'Parece haver uma única cópia, com respeito à ordem em tempo real'
        ], 'Linearizabilidade = ilusão de uma cópia única e atômica, respeitando a ordem em tempo real. As demais descrições são eventual, garantia de sessão e causal.'),
        mcq('q2', 'A escrita W(1) terminou no instante 5. Uma leitura iniciada no instante 6 devolveu o valor antigo 0. Essa história é linearizável?', 'a', [
          'Não, pois a leitura começou depois do fim da escrita e deveria ver o novo valor',
          'Sim, pois leituras podem devolver qualquer valor já escrito',
          'Sim, pois só importa a ordem de chegada das mensagens',
          'Não, pois toda leitura precisa ser concorrente com uma escrita'
        ], 'Pela ordem em tempo real, a leitura vem depois da escrita completa e precisa enxergá-la. Ler 0 viola a linearizabilidade.'),
        mcq('q3', 'Uma leitura concorrente com a escrita W(1) [0,10] devolve 0 em [2,3] e outra leitura devolve 1 em [4,5]. Essa história é linearizável?', 'b', [
          'Não, pois o valor nunca pode mudar durante a escrita',
          'Sim, pois a escrita pode "acontecer" entre os instantes 3 e 4',
          'Não, pois as duas leituras deveriam devolver o mesmo valor durante toda a escrita',
          'Sim, mas somente se houver um relógio global perfeito'
        ], 'Como a escrita se estende por [0,10], seu ponto de linearização pode cair entre 3 e 4: a leitura antes vê 0 e a seguinte vê 1.'),
        fill('q4', 'Qual garantia de sessão assegura que, após escrever, o cliente sempre lê sua própria escrita (ou algo mais novo)?', 'read-your-___', ['writes', 'write'], 'Read-your-writes evita que o usuário salve algo e, ao recarregar, veja o valor antigo.'),
        mcq('q5', 'Qual modelo exige uma ordem global única que respeite a ordem de cada processo, mas NÃO exige ordem em tempo real entre processos diferentes?', 'c', [
          'Consistência eventual',
          'Linearizabilidade',
          'Consistência sequencial',
          'Garantias de sessão (monotonic reads)'
        ], 'Na sequencial a ordem global é coerente com cada processo, mas leituras podem ainda ver o passado em tempo real. A linearizabilidade acrescenta o tempo real.'),
        mcq('q6', 'Qual é a ideia central do Jepsen?', 'a', [
          'Injetar falhas num banco real, registrar histórias de operações e verificar se violam o modelo prometido',
          'Medir apenas a latência média de um banco em condições ideais de rede',
          'Provar matematicamente a correção de um banco antes de ele ser escrito',
          'Substituir os relógios de parede do cluster por relógios vetoriais'
        ], 'Testa-se o sistema em condições adversas (partições, quedas, atrasos) e checa-se a história de operações contra o modelo de consistência.'),
        mcq('q7', 'Em um fórum, um usuário vê a resposta a uma pergunta antes de ver a própria pergunta. Qual garantia foi violada?', 'd', [
          'Linearizabilidade, pois a leitura devolveu um valor antigo',
          'Atomicidade do commit entre dois bancos de dados',
          'Durabilidade das escritas após uma queda de energia',
          'Consistência causal, pois a resposta depende da pergunta'
        ], 'A resposta é causalmente posterior à pergunta; sob consistência causal, todos veem a pergunta antes da resposta.'),
        fill('q8', 'Complete a hierarquia de força, da mais forte para a mais fraca.', 'linearizável > sequencial > causal > ___', ['eventual', 'consistência eventual', 'consistencia eventual'], 'A consistência eventual é a mais fraca: apenas promete convergência quando as escritas cessam.')
      ]
    },
    {
      id: 'cdi-12-cap-pacelc',
      title: 'CAP e PACELC em profundidade',
      goal: 'Usar CAP e PACELC corretamente, com definições formais, limites e cautela ao classificar sistemas.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Definições formais',
            'CAP (Gilbert e Lynch) usa definições precisas. C (consistência) é LINEARIZABILIDADE, e NÃO o "C" de ACID (que fala de invariantes de integridade). A (disponibilidade) é: toda requisição recebida por um nó que NÃO falhou deve receber uma resposta (que não seja erro ou espera infinita). P (tolerância a partições): o sistema continua operando mesmo que a rede perca ou atrase arbitrariamente mensagens entre nós.'
          ),
          sl(
            'O que o teorema diz',
            'Se ocorrer uma PARTIÇÃO, é impossível manter ao mesmo tempo C e A. Argumento intuitivo: dois lados isolados; um cliente escreve no lado 1 e outro lê no lado 2. O lado 2 só tem duas opções: responder com o dado que tem (possivelmente velho, perdendo C) ou recusar/esperar (perdendo A). Não há terceira saída enquanto a partição durar.',
            `# partição: lado 1 recebeu x=2; lado 2 ainda tem x=1
def ler_no_lado2(modo):
    if modo == 'AP': return 1                    # responde (dado velho): perde C
    if modo == 'CP': raise TimeoutError('sem quórum')   # recusa: perde A`
          ),
          sl(
            'O que o teorema NÃO diz',
            'Não diz "escolha 2 de 3" como se fossem opções livres: partições acontecem em redes reais, então P não é opcional; a escolha real, durante uma partição, é entre C e A. Sem partição, nada impede ter C e A ao mesmo tempo. CAP não fala de latência. Não classifica um sistema inteiro para sempre: um mesmo banco pode se comportar de modo diferente conforme operação e configuração. E "A" no CAP não é a alta disponibilidade operacional que se mede em uptime (como 99,9%).'
          ),
          sl(
            'CP vs AP durante partições',
            'Sistema CP: durante a partição, o lado sem maioria (quórum) recusa ou bloqueia requisições para preservar a linearizabilidade; é o comportamento de sistemas baseados em consenso. Sistema AP: todos os lados continuam respondendo, aceitando escritas que podem divergir, para reconciliar depois (vetores, LWW, CRDTs). Qual escolher depende do domínio: saldo bancário e lock pedem CP; carrinho de compras e feed social costumam preferir AP.'
          ),
          sl(
            'PACELC: o que acontece sem partição',
            'O PACELC amplia o CAP: se há Partição (P), escolhe-se entre Disponibilidade (A) e Consistência (C); senão (Else, E), escolhe-se entre Latência (L) e Consistência (C). Mesmo sem partição, replicar de forma síncrona para manter consistência custa tempo. Combinações possíveis: PA/EL (prioriza disponibilidade e latência), PC/EC (prioriza consistência sempre), PA/EC e PC/EL. Atenção ao classificar produtos reais: o enquadramento depende da CONFIGURAÇÃO (níveis de quórum, leitura do líder ou de réplicas, replicação síncrona ou assíncrona) e muda entre versões; dizer "o banco X é AP" sem contexto é um erro comum.'
          ),
          sl(
            'Equívocos comuns',
            '(1) Confundir C do CAP com C do ACID. (2) Achar que A do CAP significa "99,99% de uptime": é uma propriedade formal sob partição. (3) Achar que existe sistema "CA" escolhido de propósito: um sistema distribuído que sofre partições não pode escolher não ter P. (4) Achar que consistente implica correto: linearizável com bug continua errado. (5) Esquecer que timeouts transformam lentidão em "partição" efetiva: um enlace muito lento é tratado como partido. (6) Usar CAP como desculpa para ignorar latência, que o PACELC corrige.'
          )
        ]
      },
      questions: [
        mcq('q1', 'No teorema CAP, o que significa "C"?', 'b', [
          'Consistência de integridade, como as restrições de ACID, que validam chaves e tipos',
          'Linearizabilidade: a ilusão de uma única cópia atualizada atomicamente',
          'Convergência eventual das réplicas depois de um tempo',
          'Consenso por maioria entre todos os nós do cluster'
        ], 'C no CAP é linearizabilidade, e não o C de ACID (que trata de invariantes do banco).'),
        mcq('q2', 'Qual é a definição formal de "A" (disponibilidade) no CAP?', 'd', [
          'O sistema fica no ar mais de 99,9% do tempo medido por mês',
          'Todos os nós respondem com o dado mais recente, sempre',
          'O sistema aceita apenas leituras durante qualquer partição',
          'Toda requisição a um nó não falho recebe uma resposta'
        ], 'A formal é sobre toda requisição que chega a um nó não falho ser respondida; é diferente da métrica operacional de uptime.'),
        mcq('q3', 'Durante uma partição, o lado minoritário do cluster recusa escritas para evitar divergência. Esse comportamento é típico de qual escolha?', 'c', [
          'AP, que sacrifica a consistência para continuar respondendo mesmo sem quórum',
          'CA, que escolhe não ter partições na rede',
          'CP, que sacrifica a disponibilidade para preservar a consistência',
          'PC/EL, que prioriza latência durante a partição'
        ], 'Recusar para manter a linearizabilidade é CP: perde-se A no lado sem quórum.'),
        fill('q4', 'No PACELC, na ausência de partição ("Else") escolhe-se entre consistência e qual outra propriedade?', 'Else: consistência ou ___', ['latência', 'latencia', 'L'], 'Mesmo sem partição, replicar para ser consistente custa latência: é o "ELC" do PACELC.'),
        mcq('q5', 'Qual das afirmações é correta sobre o que o CAP NÃO diz?', 'a', [
          'Sem partição, nada impede ter linearizabilidade e disponibilidade ao mesmo tempo',
          'Partições nunca acontecem em redes reais, então P pode ser ignorado',
          'Um sistema pode escolher livremente quais duas letras terá, sempre',
          'O CAP define a latência máxima aceitável para cada operação'
        ], 'O teorema trata do cenário de partição. Fora dele, C e A podem coexistir (e o PACELC discute o custo em latência).'),
        mcq('q6', 'Alguém afirma "o banco X é AP". Qual a melhor resposta?', 'b', [
          'Correto, pois o tipo de um banco é fixo para sempre, definido no momento da instalação',
          'Depende da configuração (quóruns, replicação, tipo de leitura) e da versão',
          'Impossível, pois nenhum banco real pode ser AP',
          'Correto, mas só se ele não usar nenhuma replicação'
        ], 'O comportamento sob partição e fora dela muda com a configuração; classificações sem contexto induzem ao erro.'),
        mcq('q7', 'Um serviço tem 99,99% de uptime. Isso significa que ele satisfaz o "A" do CAP?', 'c', [
          'Sim, pois alta disponibilidade e A são a mesma coisa',
          'Sim, desde que o serviço use replicação síncrona',
          'Não: o A do CAP é uma propriedade formal sob partição, e não uma métrica de uptime',
          'Não, pois nenhum serviço com uptime alto pode ser consistente durante partições de rede'
        ], 'A do CAP exige resposta de todo nó não falho mesmo durante partições; uptime é métrica operacional diferente.'),
        fill('q8', 'Na prova intuitiva do CAP, durante a partição o sistema precisa escolher entre C e qual outra propriedade?', 'escolha: C ou ___', ['A', 'disponibilidade', 'availability'], 'Responder com dado velho perde C; recusar/esperar perde A (disponibilidade).')
      ]
    },
    {
      id: 'cdi-13-conflitos-crdts',
      title: 'Conflitos e CRDTs',
      goal: 'Resolver conflitos de escritas concorrentes e usar CRDTs para convergência sem coordenação.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que existem conflitos',
            'Conflitos surgem quando duas escritas concorrentes (nenhuma viu a outra) alteram o mesmo dado em réplicas diferentes: sistemas multi-líder (uma região por líder), edição OFFLINE (celular e notebook editando o mesmo carrinho ou documento) e quórum sloppy. Vetores de versão detectam que as escritas são concorrentes, mas não dizem como combiná-las. Quem decide é a estratégia de resolução de conflitos.'
          ),
          sl(
            'Last Write Wins (LWW)',
            'LWW mantém a escrita com maior timestamp e descarta as demais. Vantagens: simples e todas as réplicas convergem para o mesmo valor. Problemas: descarta escritas SEM AVISO (perda de dados) e depende de relógios (um nó com relógio adiantado vence mesmo escrevendo antes). Serve para dados em que perder uma atualização é aceitável (cache, "última localização visto"), e é ruim para contadores, carrinhos e documentos colaborativos.'
          ),
          sl(
            'Siblings e merge pela aplicação',
            'Alternativa: manter TODAS as versões concorrentes (os siblings) e entregar à aplicação, que as reconcilia, por exemplo unindo dois carrinhos. Evita perda silenciosa, mas empurra a complexidade para o código da aplicação e tem armadilhas: se um lado removeu um item e o outro manteve, uma união ingênua RESSUSCITA o item removido, e o merge deve ser correto mesmo se executado várias vezes e em qualquer ordem.'
          ),
          sl(
            'CRDTs: convergência por construção',
            'CRDT (Conflict-free Replicated Data Type) é um tipo de dado replicado projetado para que réplicas que receberam os mesmos updates, em qualquer ordem e mesmo com duplicatas, cheguem ao MESMO estado, sem coordenação. Nos CRDTs baseados em estado, a função de merge é uma junção que precisa ser COMUTATIVA (a⊔b = b⊔a), ASSOCIATIVA (a⊔(b⊔c) = (a⊔b)⊔c) e IDEMPOTENTE (a⊔a = a). Comutativa e associativa tornam a ordem irrelevante; idempotente torna mensagens duplicadas inofensivas, o que combina com redes que reentregam. Existem também CRDTs baseados em operações, que propagam as operações em vez do estado.'
          ),
          sl(
            'G-Counter e PN-Counter',
            'G-COUNTER (só cresce): cada réplica i tem um vetor com uma posição por réplica; só incrementa a PRÓPRIA posição; o valor é a SOMA; o merge é o MÁXIMO posição a posição (assim cumpre as três propriedades). PN-COUNTER (cresce e decresce): usa dois G-Counters, P (incrementos) e N (decrementos); valor = P − N; merge = merge de cada um.',
            `class G:
    def __init__(s, i, n): s.i = i; s.c = [0] * n
    def inc(s, k=1): s.c[s.i] += k
    def value(s): return sum(s.c)
    def merge(s, o): s.c = [max(a, b) for a, b in zip(s.c, o.c)]

a, b = G(0, 2), G(1, 2)
a.inc(3); b.inc(2)
print(a.value(), b.value())            # 3 2   (divergiram)
a.merge(b); b.merge(a); a.merge(b)     # trocas em qualquer ordem, até repetidas
print(a.c, b.c, a.value(), b.value())  # [3, 2] [3, 2] 5 5   (convergiram)

class PN:
    def __init__(s, i, n): s.p = G(i, n); s.n = G(i, n)
    def inc(s, k=1): s.p.inc(k)
    def dec(s, k=1): s.n.inc(k)
    def value(s): return s.p.value() - s.n.value()
    def merge(s, o): s.p.merge(o.p); s.n.merge(o.n)

x, y = PN(0, 2), PN(1, 2)
x.inc(5); x.dec(1); y.inc(2); y.dec(4)
x.merge(y); y.merge(x)
print(x.value(), y.value())            # 2 2   (7 - 5)`
          ),
          sl(
            'Outros CRDTs e limitações',
            'OR-SET (observed-remove): cada adição gera uma TAG única e a remoção apaga só as tags que o removedor OBSERVOU; uma adição concorrente a uma remoção sobrevive ("add wins"), resolvendo a ressurreição ingênua. LWW-REGISTER: um valor com timestamp, em que vence o maior (herda os problemas do LWW). Limitações: CRDTs NÃO garantem invariantes globais (saldo nunca negativo, estoque maior que zero, unicidade de nome), pois isso exige coordenação; guardam metadados que crescem (vetores, tags, lápides de remoção) e exigem compactação; e a semântica do merge pode surpreender o usuário. Privacidade: como o histórico e as lápides permanecem, apagar de verdade um dado pessoal (direito de eliminação, LGPD) exige planejamento específico.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Quando surge um conflito de escrita?', 'a', [
          'Quando duas escritas concorrentes alteram o mesmo dado em réplicas diferentes sem enxergar uma à outra',
          'Quando um cliente lê o mesmo dado duas vezes seguidas na mesma réplica',
          'Quando uma réplica é reiniciada e recarrega seus dados do próprio disco',
          'Quando o relógio de um nó está dois segundos atrasado em relação ao NTP'
        ], 'Multi-líder, edição offline e sloppy quorum produzem escritas concorrentes: nenhuma viu a outra, e é preciso resolver.'),
        mcq('q2', 'Qual o principal problema de resolver conflitos com Last Write Wins?', 'b', [
          'Ele impede que as réplicas convirjam para o mesmo valor',
          'Ele descarta escritas silenciosamente e depende de relógios',
          'Ele exige que o usuário escolha manualmente uma das versões a cada conflito',
          'Ele só funciona com no máximo duas réplicas ativas'
        ], 'LWW converge, mas a escrita "perdedora" some sem aviso, e skew de relógio pode fazer a escrita errada vencer.'),
        mcq('q3', 'O que são siblings?', 'd', [
          'Réplicas vizinhas de um mesmo nó no anel de hashing',
          'Cópias idênticas do mesmo dado em regiões diferentes',
          'Entradas do log de replicação já confirmadas por maioria em todas as réplicas',
          'Versões concorrentes mantidas para que a aplicação as reconcilie'
        ], 'Em vez de descartar, o sistema guarda todas as versões concorrentes e a aplicação decide como combiná-las.'),
        fill('q4', 'O merge de um CRDT deve ser comutativo, associativo e qual outra propriedade, que torna mensagens duplicadas inofensivas?', 'comutativo, associativo e ___', ['idempotente', 'idempotent', 'idempotência', 'idempotencia'], 'Idempotente: a ⊔ a = a, então receber o mesmo estado duas vezes não altera o resultado.'),
        mcq('q5', 'Réplica A tem G-Counter [3,0] e a réplica B tem [0,2]. Após o merge (máximo por posição), qual o valor do contador?', 'c', [
          '3, o valor da réplica A',
          '2',
          '5',
          '6, a soma dos dois vetores'
        ], 'Merge = [max(3,0), max(0,2)] = [3,2]; o valor é a soma: 5.'),
        mcq('q6', 'Por que um G-Counter não suporta decremento, e como o PN-Counter resolve?', 'd', [
          'Porque o valor é uma média; o PN-Counter usa a mediana',
          'Porque o merge usa soma; o PN-Counter usa subtração no merge',
          'Porque cada réplica só enxerga o contador de outra; o PN-Counter usa um líder',
          'Porque o max por posição nunca reduz; o PN-Counter usa dois G-Counters (P e N) e valor = P − N'
        ], 'Com merge por máximo, valores só crescem. Separando incrementos (P) e decrementos (N), ambos crescentes, o valor P − N pode descer.'),
        mcq('q7', 'Qual é uma limitação dos CRDTs?', 'a', [
          'Não garantem invariantes globais, como saldo nunca negativo, sem coordenação',
          'Exigem relógios de parede perfeitamente sincronizados entre as réplicas',
          'Só convergem se as mensagens chegarem sempre na mesma ordem',
          'Não podem ser usados em sistemas com mais de uma réplica'
        ], 'Cada réplica opera sem coordenar, então restrições como "saldo ≥ 0" ou "nome único" podem ser violadas por escritas concorrentes.'),
        fill('q8', 'Com P = [5,2] e N = [1,4] em um PN-Counter, qual o valor do contador?', 'valor = (5+2) - (1+4) = ___', ['2'], 'P soma 7, N soma 5, e o valor é P − N = 2.')
      ]
    }
,
    {
      id: 'cdi-14-particionamento-profundidade',
      title: 'Particionamento em profundidade',
      goal: 'Escolher estratégias de particionamento, usar consistent hashing com vnodes e lidar com chaves quentes e índices.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Faixa, hash e diretório',
            'Particionar (sharding) é dividir os dados em partições, cada uma sob responsabilidade de um nó (e replicada). Três estratégias: por FAIXA (intervalos ordenados de chaves, como A–F, G–M...): consultas por intervalo ficam eficientes, mas chaves sequenciais (como timestamps) concentram todas as escritas na última partição (hot spot). Por HASH (hash da chave decide a partição): distribui de forma quase uniforme, mas perde a eficiência de consultas por intervalo, pois chaves vizinhas ficam espalhadas. Por DIRETÓRIO (uma tabela de consulta mapeia cada chave ou faixa para sua partição): máxima flexibilidade, ao custo de o diretório virar peça crítica (deve ser replicado e rápido).'
          ),
          sl(
            'hash mod N e o problema de crescer',
            'A forma ingênua de usar hash é partição = hash(chave) mod N. O problema: ao mudar N (de 4 para 5 nós), a maioria das chaves muda de nó. Para as chaves 0 a 19, k mod 4 só coincide com k mod 5 para k = 0, 1, 2 e 3: as outras 16 (80%) mudam de partição, e isso significa mover quase todos os dados.',
            `print([k % 4 for k in range(10)])   # [0, 1, 2, 3, 0, 1, 2, 3, 0, 1]
print([k % 5 for k in range(10)])   # [0, 1, 2, 3, 4, 0, 1, 2, 3, 4]
print(sum(k % 4 != k % 5 for k in range(20)) / 20)   # 0.8  -> 80% mudam`
          ),
          sl(
            'Consistent hashing e nós virtuais',
            'No consistent hashing, nós e chaves são mapeados para o mesmo espaço de hash, visto como um ANEL. Cada chave pertence ao primeiro nó encontrado seguindo o anel no sentido horário. Ao adicionar um nó, ele só toma chaves dos vizinhos, e em média migra cerca de 1/N dos dados (de 4 para 5 nós, cerca de 1/5 = 20%), em vez de quase tudo. Com um único ponto por nó, a distribuição fica desigual; por isso cada nó físico recebe MUITOS pontos no anel, os NÓS VIRTUAIS (vnodes): a carga se equilibra, nós maiores podem receber mais vnodes e, ao entrar ou sair, um nó troca pequenos pedaços com vários outros. A simulação abaixo (10 mil chaves, 100 vnodes por nó) foi executada.',
            `import hashlib, bisect
H = lambda s: int(hashlib.md5(s.encode()).hexdigest(), 16)
class Anel:
    def __init__(s, nos, vnodes=100):
        s.v = vnodes; s.anel = []
        for n in nos: s.adicionar(n)
    def adicionar(s, n):
        for i in range(s.v): bisect.insort(s.anel, (H(f'{n}#{i}'), n))
    def dono(s, chave):
        i = bisect.bisect(s.anel, (H(chave), '')) % len(s.anel)
        return s.anel[i][1]

chaves = [f'chave{i}' for i in range(10000)]
a = Anel(['n1', 'n2', 'n3', 'n4']); antes = {k: a.dono(k) for k in chaves}
a.adicionar('n5');                  depois = {k: a.dono(k) for k in chaves}
print(sum(antes[k] != depois[k] for k in chaves) / len(chaves))  # ~0.23 (ideal 1/5 = 0.20)
print(sum(H(k) % 4 != H(k) % 5 for k in chaves) / len(chaves))   # ~0.80 com hash mod N`
          ),
          sl(
            'Chaves quentes e salting',
            'Mesmo com um bom hash, UMA chave muito acessada (um perfil famoso, um contador global) cai sempre na mesma partição e a sobrecarrega: é a HOT PARTITION / chave quente. Mitigações: cache na frente; dividir a partição; e SALTING: acrescentar um sufixo aleatório à chave (contador#0 ... contador#k−1) para espalhar as ESCRITAS por k sub-chaves em partições diferentes. O preço: a leitura precisa consultar as k sub-chaves e combinar o resultado (por exemplo, somar), e a aplicação deve conhecer k.'
          ),
          sl(
            'Índices secundários: local vs global',
            'Se os dados são particionados por uma chave, como buscar por outro atributo (por exemplo, a cidade)? Índice LOCAL: cada partição indexa apenas os seus próprios dados; a escrita é simples (só uma partição), mas uma consulta por esse atributo precisa ser enviada a TODAS as partições (scatter/gather). Índice GLOBAL: o próprio índice é particionado pelo valor indexado; a consulta lê só uma partição do índice, mas uma escrita pode tocar várias partições (a do dado e as do índice), e por isso costuma ser atualizado de forma assíncrona (consistência eventual do índice).'
          ),
          sl(
            'Roteamento, rebalanceamento e transações',
            'ROTEAMENTO: como o pedido chega ao nó certo? (a) o cliente conhece o mapa e fala direto; (b) um proxy/roteador consulta o mapa; (c) qualquer nó recebe e encaminha, e o mapa se espalha por gossip ou por um serviço de coordenação. REBALANCEAMENTO sem downtime: mover partições aos poucos enquanto se atende: copiar os dados, sincronizar as últimas mudanças e trocar o dono de forma atômica no mapa (que precisa ser consistente, em geral via consenso); é comum ter muito mais partições que nós, movendo partições inteiras. TRANSAÇÕES entre partições: uma operação que altera dados de várias partições precisa de commit distribuído (2PC, na lição seguinte) ou, melhor, a escolha da chave de partição deve manter dados que mudam juntos na mesma partição.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a diferença prática entre particionar por faixa e por hash?', 'c', [
          'Faixa distribui sempre de forma uniforme; hash concentra todas as chaves em um nó',
          'Faixa exige consenso a cada escrita; hash dispensa qualquer coordenação',
          'Faixa favorece consultas por intervalo, mas pode gerar hot spots; hash distribui melhor, mas perde os intervalos',
          'Faixa só funciona com chaves numéricas; hash só funciona com texto'
        ], 'Chaves ordenadas facilitam intervalos, mas sequências (timestamps) concentram escritas; o hash espalha, porém separa chaves vizinhas.'),
        mcq('q2', 'Uma operação precisa alterar dados em duas partições de forma atômica. O que isso exige?', 'a', [
          'Commit distribuído (como 2PC) ou escolher a chave de partição para manter esses dados juntos',
          'Nada de especial, pois cada partição garante a atomicidade do conjunto todo',
          'Mudar o hash para que as duas partições se tornem a mesma',
          'Esperar o lag de replicação de ambas antes de qualquer escrita'
        ], 'Atomicidade entre partições não vem de graça. Ou se coordena o commit entre elas, ou se modela os dados para a transação ficar numa só partição.'),
        mcq('q3', 'Um cluster com consistent hashing passa de 4 para 5 nós. Qual a fração aproximada dos dados migrada?', 'b', [
          'Cerca de 80%, como no hash mod N',
          'Cerca de 20%, isto é, 1/5',
          'Cerca de 50%, metade dos dados',
          'Cerca de 100%, todos os dados'
        ], 'O novo nó toma só parte dos vizinhos: em média 1/N dos dados, aqui 1/5. Com hash mod N, cerca de 80% se moveriam.'),
        fill('q4', 'Usando k mod 4 e k mod 5 para as chaves 0 a 19, quantas chaves mudam de partição ao passar de 4 para 5 nós?', 'chaves que mudam = ___ de 20', ['16', 'dezesseis'], 'Só k = 0, 1, 2 e 3 têm o mesmo resto nos dois casos; as outras 16 mudam (80%).'),
        mcq('q5', 'Para que servem os nós virtuais (vnodes) no consistent hashing?', 'd', [
          'Para guardar réplicas extras de cada chave em outro continente, com consistência forte',
          'Para eliminar a necessidade de qualquer função de hash',
          'Para que o mapa do anel nunca precise ser atualizado',
          'Para equilibrar a carga e permitir trocas de pequenos pedaços entre vários nós'
        ], 'Vários pontos por nó físico suavizam a distribuição, permitem pesos diferentes por capacidade e espalham a migração.'),
        mcq('q6', 'Em um índice secundário LOCAL, o que acontece numa consulta pelo atributo indexado?', 'a', [
          'Precisa ser enviada a todas as partições e os resultados são combinados',
          'Basta consultar uma única partição, escolhida pelo valor do atributo do índice',
          'A consulta é recusada, pois índices locais não suportam busca',
          'A consulta usa o relógio de parede para escolher a partição certa'
        ], 'No índice local cada partição só conhece seus dados, então a consulta faz scatter/gather. O global lê uma partição do índice, mas encarece a escrita.'),
        mcq('q7', 'Como rebalancear partições sem downtime?', 'b', [
          'Desligar o cluster, mover os dados e religar tudo ao final',
          'Copiar e sincronizar a partição aos poucos e trocar o dono de forma atômica no mapa',
          'Apagar o mapa de roteamento para os clientes descobrirem sozinhos',
          'Duplicar cada escrita em todos os nós para nunca precisar mover nada, mesmo que isso dobre o custo'
        ], 'Move-se em segundo plano, atualizando o mapa de forma consistente na troca, para o cliente nunca falar com um dono errado.'),
        fill('q8', 'Como se chama a técnica de acrescentar um sufixo aleatório à chave quente para espalhar as escritas em várias partições?', 'técnica de ___ (chave#0, chave#1, ...)', ['salting', 'salt', 'sal'], 'Salting divide uma chave quente em k sub-chaves; a leitura precisa consultar as k e combinar.')
      ]
    },
    {
      id: 'cdi-15-transacoes-distribuidas-2pc',
      title: 'Transações distribuídas e 2PC',
      goal: 'Entender o commit em duas fases, seu problema de bloqueio, 3PC, XA e as alternativas.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Atomicidade entre nós',
            'ACID: Atomicidade (tudo ou nada), Consistência (invariantes preservadas), Isolamento (transações concorrentes não se atrapalham) e Durabilidade (o commit sobrevive a falhas). Em um só banco, a atomicidade é local. Quando uma transação altera dados em DOIS ou mais nós (uma transferência entre contas em partições diferentes), todos precisam decidir a mesma coisa: ou todos commitam, ou todos abortam. O desafio é que os nós e a rede podem falhar em momentos diferentes, no meio da decisão.'
          ),
          sl(
            'Two-Phase Commit: as duas fases',
            'Há um COORDENADOR e vários PARTICIPANTES. FASE 1 (prepare/votação): o coordenador pergunta a todos "você consegue commitar?". Cada participante, se sim, grava em disco (log) que está PREPARADO, mantém seus locks e responde SIM; a partir daí ele PROMETE que poderá commitar se mandarem. Se não puder, responde NÃO. FASE 2 (decisão): se TODOS votaram SIM, o coordenador grava COMMIT no seu log e manda commit a todos; se algum votou NÃO (ou não respondeu a tempo), grava ABORT e manda abort. A decisão exige unanimidade, não maioria.',
            `def dois_pc(votos):   # votos: {participante: 'sim' | 'nao'}
    return 'COMMIT' if all(v == 'sim' for v in votos.values()) else 'ABORT'

print(dois_pc({'A': 'sim', 'B': 'sim', 'C': 'sim'}))   # COMMIT
print(dois_pc({'A': 'sim', 'B': 'nao', 'C': 'sim'}))   # ABORT`
          ),
          sl(
            'Logs e recuperação',
            'Cada passo é gravado em log DURÁVEL antes de ser anunciado: o participante grava "preparado" antes de votar SIM; o coordenador grava a decisão antes de enviá-la. Isso permite recuperação após reinício. Um participante que reinicia e encontra "preparado" sem decisão está EM DÚVIDA (in doubt): ele já prometeu, então NÃO pode decidir sozinho; precisa perguntar ao coordenador (ou a outros participantes). O coordenador reiniciado consulta seu log: se há decisão registrada, reenvia; se não há, pode abortar.'
          ),
          sl(
            'O problema: bloqueio',
            'Se o coordenador cai DEPOIS de os participantes votarem SIM e ANTES de transmitir a decisão, os participantes ficam presos: não podem commitar (talvez a decisão seja abortar) nem abortar (talvez outro participante já tenha recebido commit). Enquanto isso mantêm seus locks, bloqueando outras transações sobre esses dados, até o coordenador voltar. Por isso o 2PC é um protocolo BLOQUEANTE, e um coordenador instável reduz a disponibilidade do sistema inteiro.'
          ),
          sl(
            '3PC e o que realmente resolve',
            'O 3PC (three-phase commit) acrescenta uma fase intermediária (pre-commit) para que os participantes consigam decidir sem o coordenador em certas falhas. Mas ele assume limites de tempo na rede e NÃO é seguro sob partições: lados diferentes podem decidir de forma divergente. Por isso quase não é usado. A solução prática para o bloqueio é tornar o coordenador (e os participantes) tolerantes a falhas com CONSENSO: por exemplo, cada participante e o coordenador são grupos replicados (Paxos/Raft), como nos bancos distribuídos modernos que combinam 2PC com replicação por consenso.'
          ),
          sl(
            'XA, custos e alternativas',
            'XA é o padrão clássico em que um gerenciador de transações coordena vários recursos (bancos, filas) usando 2PC. Custos: mais viagens de rede e gravações em disco (latência); locks mantidos durante a espera; menor disponibilidade (todos precisam estar vivos); acoplamento forte entre serviços. Alternativas: EVITAR transações cruzadas, modelando dados que mudam juntos no mesmo serviço/partição; usar SAGAS (a próxima lição), aceitando consistência eventual com compensações; e tornar operações idempotentes com reconciliação posterior.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que acontece na fase 1 (prepare) do 2PC?', 'd', [
          'O coordenador envia o commit definitivo a todos os participantes logo após a primeira resposta',
          'Os participantes elegem um novo coordenador por maioria',
          'Os dados são copiados para uma réplica síncrona e descartados',
          'Cada participante grava "preparado" no log, mantém locks e vota SIM ou NÃO'
        ], 'Na fase 1 os participantes se comprometem (prometem poder commitar) e votam; a decisão só vem na fase 2.'),
        mcq('q2', 'Os participantes A, B e C votam SIM e o participante D vota NÃO. Qual a decisão do 2PC?', 'b', [
          'COMMIT, pois a maioria votou SIM e o voto contrário é ignorado nesse caso',
          'ABORT para todos, pois a decisão exige unanimidade de SIM',
          'COMMIT apenas em A, B e C, e ABORT em D',
          'Repetir a votação até D mudar de voto'
        ], 'O 2PC só commita com todos SIM. Um NÃO (ou falta de resposta) leva ao abort global, preservando a atomicidade.'),
        mcq('q3', 'O coordenador cai depois de todos votarem SIM, antes de enviar a decisão. Qual o efeito?', 'a', [
          'Os participantes ficam bloqueados, mantendo locks, até o coordenador voltar',
          'Cada participante pode commitar sozinho sem nenhum risco',
          'O sistema aborta tudo e libera os locks instantaneamente',
          'Os participantes elegem o de maior id e ele decide o resultado por conta própria'
        ], 'Prometeram commitar e não sabem a decisão: não podem avançar sozinhos, e seus locks seguem presos (protocolo bloqueante).'),
        fill('q4', 'Em um 2PC com 5 participantes, quantos votos SIM são necessários para haver COMMIT?', 'votos SIM necessários = ___', ['5', 'cinco', 'todos'], 'A decisão exige unanimidade: os 5 precisam votar SIM.'),
        mcq('q5', 'Por que um participante que votou SIM, sem saber a decisão, não pode simplesmente abortar sozinho?', 'c', [
          'Porque participantes não têm acesso ao próprio log em disco depois de votar',
          'Porque abortar é sempre proibido nesse protocolo',
          'Porque outro participante pode ter recebido COMMIT, e a decisão divergiria',
          'Porque o NÃO só pode ser enviado pelo coordenador'
        ], 'Se o coordenador decidiu COMMIT e avisou apenas alguns, um abort unilateral quebraria a atomicidade.'),
        mcq('q6', 'O que é o 3PC e por que não resolve tudo?', 'd', [
          'Um 2PC repetido três vezes, que elimina todo o custo de latência',
          'Um protocolo sem coordenador que funciona sem limites de tempo',
          'Um protocolo que troca a unanimidade por maioria simples',
          'Acrescenta uma fase pre-commit e reduz o bloqueio, mas depende de limites de tempo e é inseguro sob partições'
        ], 'O 3PC tenta evitar bloqueio, mas sob partições pode gerar decisões divergentes; por isso se usa consenso replicado.'),
        mcq('q7', 'Qual é o custo típico de usar transações distribuídas com XA?', 'c', [
          'Perda total de durabilidade dos dados',
          'Necessidade de eliminar os logs de transação',
          'Mais latência, locks por mais tempo e menor disponibilidade',
          'Impossibilidade de usar mais de um banco de dados na mesma aplicação ao mesmo tempo'
        ], 'Mais mensagens e gravações, locks durante a espera e dependência de todos os participantes estarem de pé.'),
        fill('q8', 'Antes de votar SIM, o participante grava no log durável que está ___.', 'estado gravado: ___', ['preparado', 'prepared', 'prepare'], 'O estado "preparado" fica no log para sobreviver a reinícios: ele prometeu poder commitar.')
      ]
    },
    {
      id: 'cdi-16-sagas-outbox',
      title: 'Sagas, outbox e consistência eventual',
      goal: 'Coordenar processos entre serviços com sagas e compensações, e publicar eventos de forma confiável com outbox.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Saga: transações locais com compensações',
            'Uma SAGA divide um processo de negócio em uma sequência de transações LOCAIS, cada uma com seu próprio commit em um serviço. Se um passo falha, executam-se COMPENSAÇÕES dos passos já concluídos, em ordem inversa. Não há locks distribuídos nem 2PC; em troca, o sistema fica temporariamente em estados intermediários (consistência eventual). Exemplo: pedido → pagamento → estoque.',
            `def saga(passos, falha_em):
    feitos, log = [], []
    for i, (nome, compensacao) in enumerate(passos):
        if i == falha_em: log.append('FALHA ' + nome); break
        log.append('ok ' + nome); feitos.append(compensacao)
    else:
        return log
    for c in reversed(feitos): log.append('compensa ' + c)
    return log

passos = [('criar_pedido', 'cancelar_pedido'), ('cobrar', 'estornar'),
          ('reservar_estoque', 'liberar_estoque')]
print(saga(passos, 2))   # falha no estoque
# ['ok criar_pedido', 'ok cobrar', 'FALHA reservar_estoque',
#  'compensa estornar', 'compensa cancelar_pedido']
print(saga(passos, 1))   # falha na cobrança
# ['ok criar_pedido', 'FALHA cobrar', 'compensa cancelar_pedido']`
          ),
          sl(
            'Compensação não é rollback',
            'O rollback de um banco desfaz uma transação NÃO commitada: ninguém chegou a ver o efeito. Já na saga, cada passo JÁ foi commitado e ficou visível (o cartão foi cobrado, o estoque foi reservado, até outros processos podem ter lido isso). A compensação é uma NOVA operação de negócio que desfaz semanticamente o efeito (estornar, cancelar, liberar), e pode falhar também, e precisa ser retentada. Algumas ações não têm compensação (um e-mail já enviado): coloque esses passos por último na saga. E como não há isolamento, outros veem estados intermediários, o que a aplicação deve tolerar (por exemplo, pedido "pendente").'
          ),
          sl(
            'Coreografia vs orquestração',
            'COREOGRAFIA: não há coordenador; cada serviço reage a eventos e publica os seus (pedido criado → pagamento reage → estoque reage...). Baixo acoplamento e sem ponto central, mas o fluxo fica espalhado, difícil de enxergar e de depurar, e ciclos de eventos são um risco. ORQUESTRAÇÃO: um orquestrador (máquina de estados) diz a cada serviço o que fazer, registra em que passo está e dispara as compensações. O fluxo fica explícito e fácil de monitorar, mas o orquestrador é uma peça central que precisa ser durável e tolerante a falhas.'
          ),
          sl(
            'Idempotência e entrega pelo menos uma vez',
            'Mensagens e comandos podem chegar mais de uma vez (o remetente reenvia por não receber confirmação). Com entrega "pelo menos uma vez", cada passo E cada compensação da saga precisa ser IDEMPOTENTE: executar duas vezes tem o mesmo efeito de uma. Técnica: usar uma chave de idempotência (id do pedido + passo) e registrar o que já foi processado; ao receber de novo, devolver o resultado anterior sem repetir. Estornar duas vezes não pode devolver o dinheiro em dobro.'
          ),
          sl(
            'O problema do dual write e o transactional outbox',
            'DUAL WRITE: gravar no banco E publicar um evento na fila são duas operações em sistemas diferentes, sem transação em comum. Se o processo cair entre as duas, o banco foi atualizado mas o evento nunca saiu (ou o contrário), e os serviços divergem. TRANSACTIONAL OUTBOX: na MESMA transação local, grava-se o dado de negócio e uma linha numa tabela outbox (o evento a publicar); depois, um processo separado (relay) lê o outbox e publica na fila, marcando como enviado. Como o relay pode publicar e falhar antes de marcar, a entrega é pelo menos uma vez, e o consumidor deve ser idempotente; o padrão INBOX é o espelho no consumidor: registrar os ids de mensagens já processadas, na mesma transação do efeito.',
            `-- uma única transação local
BEGIN;
  INSERT INTO pedido (id, status) VALUES (42, 'CRIADO');
  INSERT INTO outbox (id, tipo, payload) VALUES (gen_id(), 'PedidoCriado', '{"pedido":42}');
COMMIT;
-- depois, o relay publica o evento na fila e marca a linha da outbox como enviada`
          ),
          sl(
            'CDC e cuidados com dados pessoais',
            'O CDC (Change Data Capture) é uma alternativa ao relay por consulta periódica: lê o log de transações do banco e emite as mudanças (incluindo as linhas da outbox) como eventos, sem polling. Privacidade e LGPD: eventos e outbox são copiados para filas, logs e consumidores, o que multiplica os lugares onde um dado pessoal vive. Prefira eventos com identificadores (id do cliente) em vez de dados pessoais completos, aplique retenção limitada, cifragem e controle de acesso aos tópicos e às tabelas de outbox, e planeje como atender pedidos de eliminação.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que é uma saga?', 'a', [
          'Uma sequência de transações locais com compensações para os passos já feitos',
          'Uma única transação ACID que abrange todos os serviços ao mesmo tempo, com locks compartilhados',
          'Um protocolo de eleição de líder entre os serviços do processo',
          'Uma réplica síncrona que recebe todos os pedidos antes do banco'
        ], 'A saga troca atomicidade global por transações locais encadeadas, com compensações em caso de falha.'),
        mcq('q2', 'Em uma saga pedido → pagamento → estoque, o estoque falha. Quais compensações são executadas e em que ordem?', 'c', [
          'Cancelar o pedido e depois estornar o pagamento',
          'Apenas liberar o estoque, que foi o passo que falhou',
          'Estornar o pagamento e depois cancelar o pedido',
          'Nenhuma, pois o banco faz rollback automático de tudo'
        ], 'Compensa-se em ordem inversa dos passos concluídos: o pagamento (último concluído), depois o pedido. O estoque nem chegou a ser reservado.'),
        mcq('q3', 'Por que compensação NÃO é a mesma coisa que rollback?', 'd', [
          'Porque o rollback só existe em bancos distribuídos',
          'Porque a compensação desfaz também o que ainda não foi gravado',
          'Porque a compensação acontece antes da transação original',
          'Porque o passo original já foi commitado e visível; a compensação é uma nova operação de negócio'
        ], 'O rollback desfaz algo que ninguém viu. Na saga o efeito já existiu (cobrança feita, por exemplo), e só uma nova operação (estorno) o desfaz semanticamente.'),
        fill('q4', 'Na saga acima (criar_pedido, cobrar, reservar_estoque), se a falha ocorrer em "cobrar" (2º passo), quantas compensações são executadas?', 'compensações executadas = ___', ['1', 'uma', 'um'], 'Apenas criar_pedido havia sido concluído; só ele é compensado (cancelar_pedido). Quem falhou não precisa de compensação.'),
        mcq('q5', 'Qual a diferença entre orquestração e coreografia?', 'b', [
          'Na orquestração não há compensações; na coreografia há apenas compensações',
          'Na orquestração um coordenador dirige o fluxo; na coreografia os serviços reagem a eventos sem coordenador',
          'Na orquestração usa-se 2PC; na coreografia usa-se um único banco',
          'Orquestração só existe em sistemas com um único serviço'
        ], 'Orquestração: fluxo explícito num orquestrador. Coreografia: acoplamento baixo, mas fluxo distribuído nos eventos.'),
        mcq('q6', 'Qual é o problema do dual write?', 'b', [
          'Gravar duas vezes o mesmo dado no mesmo banco duplica o armazenamento',
          'O banco commita e a publicação na fila falha (ou vice-versa), deixando os sistemas inconsistentes',
          'A fila rejeita eventos cujo tamanho é maior que o do dado',
          'O banco recusa transações que contenham mais de uma tabela'
        ], 'Sem transação comum entre banco e fila, uma falha no meio das duas operações deixa um lado atualizado e o outro não.'),
        mcq('q7', 'Como o transactional outbox resolve o dual write?', 'a', [
          'Grava o dado e o evento na mesma transação local e um relay publica depois, com entrega pelo menos uma vez',
          'Publica o evento primeiro e só depois grava o dado, ignorando falhas',
          'Usa 2PC entre o banco e a fila de mensagens em todas as operações',
          'Elimina o evento e obriga os consumidores a consultarem o banco'
        ], 'A atomicidade local garante dado e evento juntos; o relay (ou CDC) publica depois, podendo duplicar, então o consumidor deve ser idempotente.'),
        fill('q8', 'Como as mensagens podem ser entregues mais de uma vez, cada passo da saga deve ser ___.', 'cada passo deve ser ___', ['idempotente', 'idempotent', 'idempotência', 'idempotencia'], 'Idempotente: executar duas vezes dá o mesmo resultado que uma, tornando a reentrega inofensiva.')
      ]
    },
    {
      id: 'cdi-17-isolamento-mvcc',
      title: 'Isolamento, MVCC e anomalias',
      goal: 'Reconhecer anomalias de isolamento, entender MVCC, snapshot isolation e write skew, e o custo do serializable.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'As anomalias de concorrência',
            'Quando transações rodam ao mesmo tempo, podem ocorrer anomalias. LEITURA SUJA: ler dado gravado por outra transação ainda NÃO commitada (que pode ser desfeita). LEITURA NÃO REPETÍVEL: ler a mesma linha duas vezes na mesma transação e obter valores diferentes, porque outra transação commitou no meio. LEITURA FANTASMA: repetir uma consulta com um critério (por exemplo, "pedidos de hoje") e obter linhas a mais ou a menos, porque outra transação inseriu ou removeu linhas. WRITE SKEW: duas transações leem o mesmo conjunto de dados, cada uma toma uma decisão com base nele e grava em linhas DIFERENTES, e juntas violam uma regra que cada uma, sozinha, respeitava.'
          ),
          sl(
            'Níveis de isolamento',
            'READ COMMITTED: só se lê o que já foi commitado (sem leitura suja), mas duas leituras podem divergir. REPEATABLE READ / SNAPSHOT: a transação enxerga um snapshot consistente de quando começou, evitando leituras não repetíveis (e, no isolamento por snapshot, também fantasmas em leituras simples). SERIALIZABLE: o resultado equivale a ALGUMA execução serial das transações, eliminando todas as anomalias, inclusive write skew. Cuidado: os nomes não são uniformes entre produtos (o "repeatable read" de um banco pode ser, na prática, snapshot isolation), então consulte a documentação do banco usado.'
          ),
          sl(
            'MVCC: várias versões de cada linha',
            'No MVCC (multi-version concurrency control), em vez de sobrescrever, uma atualização cria uma NOVA VERSÃO da linha, marcada com a transação ou timestamp que a criou. Cada transação lê as versões visíveis no seu snapshot. Consequência: LEITORES NÃO BLOQUEIAM ESCRITORES e vice-versa, o que dá muita concorrência. As versões antigas, quando nenhuma transação ativa precisa delas, são limpas depois (vacuum/garbage collection). Em bancos distribuídos, o snapshot costuma ser definido por um timestamp, o que traz de volta a importância dos relógios.'
          ),
          sl(
            'Snapshot isolation e o write skew dos plantonistas',
            'Regra do hospital: sempre deve haver pelo menos um médico de plantão. Ana e Beto estão de plantão. Cada um, em sua transação, lê quantos plantonistas existem (2), conclui que pode sair e grava só a PRÓPRIA linha. Como as linhas são diferentes, o snapshot isolation não vê conflito de escrita (conflito só é detectado quando duas transações gravam a MESMA linha), e as duas commitam: ficam 0 plantonistas. Nenhuma transação, sozinha, violou a regra; o problema nasceu da leitura compartilhada somada a escritas disjuntas.',
            `db = {'ana': True, 'beto': True}          # True = de plantão
s1, s2 = dict(db), dict(db)               # as duas transações leem o MESMO snapshot
if sum(s1.values()) >= 2: db['ana'] = False    # T1: "há 2, posso sair"
if sum(s2.values()) >= 2: db['beto'] = False   # T2: "há 2, posso sair"
print(db, sum(db.values()))   # {'ana': False, 'beto': False} 0   (regra violada)`
          ),
          sl(
            'Como evitar o write skew',
            'Três saídas: (1) usar o nível SERIALIZABLE, em que o banco detecta o padrão e aborta uma das transações (a aplicação deve estar pronta para REPETIR transações abortadas); (2) travar explicitamente o que foi lido (SELECT ... FOR UPDATE sobre as linhas dos plantonistas), de modo que uma transação espere a outra; (3) materializar o conflito: fazer ambas as transações gravarem uma mesma linha de controle (por exemplo, um contador de plantonistas), para que o conflito de escrita apareça. Ou ainda declarar a regra como restrição no banco, se ele a suportar.'
          ),
          sl(
            'Serializable em bancos distribuídos e seu custo',
            'Como obter serializabilidade em um banco distribuído? A ideia de sistemas como o Spanner e o CockroachDB: replicar cada partição com CONSENSO (Paxos no Spanner, Raft no CockroachDB), usar RELÓGIOS (TrueTime no Spanner, relógios híbridos HLC com incerteza no CockroachDB) para atribuir timestamps de commit que respeitem a ordem real, e coordenar transações entre partições com commit em duas fases sobre esses grupos replicados. Custo do serializable: mais coordenação e latência, mais abortos por conflito (a aplicação precisa repetir), e menos concorrência; por isso o nível deve ser escolhido conforme a regra de negócio a proteger.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Uma transação lê a mesma linha duas vezes e obtém valores diferentes, porque outra transação commitou entre as leituras. Qual anomalia é essa?', 'c', [
          'Leitura suja, de dado não commitado',
          'Leitura fantasma',
          'Leitura não repetível',
          'Write skew'
        ], 'Mesma linha, valores diferentes por um commit no meio: leitura não repetível. Na suja o dado ainda não estava commitado.'),
        mcq('q2', 'Uma consulta por pedidos de hoje retorna 10 linhas e, repetida na mesma transação, retorna 11 porque outra transação inseriu um pedido. Qual anomalia?', 'b', [
          'Leitura suja, pois o pedido novo não estava commitado',
          'Leitura fantasma, pois o conjunto de linhas do critério mudou',
          'Write skew, pois houve duas transações gravando',
          'Perda de atualização, pois a primeira consulta foi sobrescrita'
        ], 'Fantasma: o conjunto de linhas que satisfaz o critério mudou entre duas consultas iguais. A não repetível envolve o valor de uma linha já lida.'),
        mcq('q3', 'Qual nível evita leitura suja, mas ainda permite leituras não repetíveis?', 'a', [
          'Read committed',
          'Snapshot isolation',
          'Serializable',
          'Repeatable read em qualquer banco'
        ], 'Em read committed cada leitura vê o que está commitado no momento, então o valor pode mudar entre duas leituras.'),
        fill('q4', 'Qual o nome da anomalia em que duas transações leem o mesmo conjunto, gravam em linhas diferentes e juntas violam uma regra (como o dos plantonistas)?', 'write ___', ['skew'], 'Write skew: decisões baseadas na mesma leitura com escritas disjuntas, que o snapshot isolation não detecta.'),
        mcq('q5', 'O que é o MVCC?', 'd', [
          'Um protocolo que bloqueia leitores enquanto houver um escritor',
          'Um tipo de réplica síncrona que guarda o log em disco',
          'Uma técnica que apaga as versões antigas imediatamente a cada escrita, liberando espaço logo',
          'Manter várias versões de cada linha para que leitores e escritores não se bloqueiem'
        ], 'Cada atualização cria uma versão; cada transação lê do seu snapshot, e as versões obsoletas são limpas depois.'),
        mcq('q6', 'Por que o snapshot isolation deixa passar o write skew dos plantonistas?', 'c', [
          'Porque cada transação lê dados que já foram apagados pelo banco',
          'Porque o snapshot isolation não permite que duas transações rodem juntas sobre o mesmo conjunto de dados',
          'Porque as transações gravam linhas diferentes, então não há conflito de escrita detectado',
          'Porque o MVCC não guarda versão nenhuma dos plantonistas'
        ], 'O conflito só é detectado quando duas transações gravam a mesma linha. Aqui cada uma altera a própria, apesar de a decisão depender da leitura comum.'),
        mcq('q7', 'Qual é a ideia por trás de transações serializáveis em bancos como Spanner e CockroachDB?', 'd', [
          'Usar um único nó central que executa todas as transações em série, sem nenhuma replicação',
          'Desligar o MVCC e travar todo o banco em cada transação',
          'Abrir mão de qualquer garantia de ordem entre as transações',
          'Consenso por partição somado a relógios para timestamps, e 2PC entre partições'
        ], 'Replicação por consenso (Paxos/Raft), timestamps por relógios com incerteza (TrueTime/HLC) e commit em duas fases entre partições.'),
        fill('q8', 'Qual nível de isolamento garante que o resultado equivale a alguma execução serial das transações?', 'nível: ___', ['serializable', 'serializável', 'serializavel'], 'Serializable elimina todas as anomalias, inclusive write skew, ao custo de mais coordenação e abortos.')
      ]
    },
    {
      id: 'cdi-18-mensageria-profundidade',
      title: 'Mensageria em profundidade',
      goal: 'Entender semânticas de entrega, partições, offsets, DLQ, backpressure e evolução de esquemas.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Semânticas de entrega',
            'NO MÁXIMO UMA VEZ (at-most-once): envia sem reenviar; pode PERDER mensagens, nunca duplica. PELO MENOS UMA VEZ (at-least-once): reenvia até receber a confirmação (ack); nunca perde, mas pode DUPLICAR. "EXATAMENTE UMA VEZ": como entrega física, não existe em redes que falham (não dá para saber se um ack se perdeu). O que existe é exatamente-uma-vez como EFEITO: entrega pelo menos uma vez + consumidor idempotente/deduplicação (ou processar e registrar o consumo na mesma transação). Não é mágica: é at-least-once com cuidado.'
          ),
          sl(
            'Deduplicação na prática',
            'O consumidor guarda os ids das mensagens já processadas e ignora repetidos. No exemplo, m2 e m1 chegam duplicadas, mas o efeito (somar ao saldo) acontece uma vez só.',
            `vistos, saldo = set(), 0
for msg_id, valor in [('m1', 10), ('m2', 20), ('m2', 20), ('m3', 30), ('m1', 10)]:
    if msg_id in vistos: continue          # duplicata: ignora
    vistos.add(msg_id); saldo += valor
print(saldo)    # 60  (não 90 nem 120)`
          ),
          sl(
            'Partições, ordem e grupos de consumidores',
            'Um tópico é dividido em PARTIÇÕES. A ordem só é garantida DENTRO de uma partição, nunca entre partições. A CHAVE da mensagem define a partição (hash(chave) mod P), então todas as mensagens da mesma chave (por exemplo, o id de um pedido) ficam na mesma partição e em ordem. Um GRUPO DE CONSUMIDORES divide o trabalho: cada partição é atribuída a no máximo UM consumidor do grupo, então o paralelismo máximo é o número de partições (consumidores a mais ficam ociosos). Grupos diferentes recebem cada um sua cópia independente das mensagens.',
            `import zlib
P = 3
print([zlib.crc32(k.encode()) % P for k in ['u1', 'u2', 'u1']])   # [2, 0, 2]
# 'u1' sempre cai na partição 2: suas mensagens ficam em ordem`
          ),
          sl(
            'Offsets e quando commitar',
            'O OFFSET é a posição do consumidor em uma partição (até onde ele já leu). COMMITAR o offset registra "já processei até aqui", para retomar dali após uma falha. A ordem entre processar e commitar define a semântica: commitar ANTES de processar e cair no meio faz a mensagem ser perdida (no máximo uma vez); processar e só DEPOIS commitar e cair no meio faz a mensagem ser reprocessada (pelo menos uma vez), exigindo idempotência. Em geral prefere-se commitar depois, com consumidor idempotente.',
            `mensagens = ['m1', 'm2', 'm3']
# commit ANTES, queda ao chegar em m2:
#   offset já = 2, só m1 foi processada -> reinício começa em m3 (m2 PERDIDA)
# commit DEPOIS, queda ao chegar em m2 (antes de commitar m2):
#   offset = 1 -> reinício começa em m2 (nada perdido; reprocessa m2)`
          ),
          sl(
            'Reprocessamento, retenção, DLQ e backpressure',
            'RETENÇÃO: sistemas baseados em log mantêm as mensagens por um tempo ou tamanho definido, mesmo após lidas, então é possível voltar o offset e REPROCESSAR; em filas tradicionais a mensagem some depois do ack. DLQ (dead-letter queue): mensagens que falham repetidamente (mensagens "envenenadas") vão, após N tentativas, para uma fila à parte, em vez de travar o resto ou ser reentregues para sempre; costuma-se reentregar com espera crescente (backoff) antes disso. BACKPRESSURE: se o consumidor é mais lento que o produtor, a fila cresce; é preciso limitar buffers, desacelerar o produtor ou escalar consumidores, em vez de deixar crescer sem limite. TAMANHO: mensagens enormes pesam no broker; envie uma referência a um objeto no armazenamento (claim check). Privacidade: mensagens, retenção e DLQ guardam dados pessoais; minimize o conteúdo e limite a retenção.'
          ),
          sl(
            'Esquemas, evolução e visão dos produtos',
            'Produtores e consumidores evoluem em momentos diferentes, então a mensagem deve ter um ESQUEMA versionado (Avro, Protobuf, JSON Schema), em geral guardado num registro de esquemas. COMPATIBILIDADE BACKWARD: consumidores NOVOS leem mensagens ANTIGAS; FORWARD: consumidores ANTIGOS leem mensagens NOVAS. Adicionar campo opcional (com valor padrão) costuma ser seguro; remover ou renomear campo obrigatório quebra consumidores. Visão conceitual dos produtos: Kafka é um log particionado com retenção e offsets; RabbitMQ é um broker de filas com roteamento flexível, em que a mensagem sai da fila após o ack; o SQS é uma fila gerenciada, no modo padrão com entrega pelo menos uma vez e sem ordem garantida, com um modo FIFO para ordenação.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a característica da entrega "pelo menos uma vez"?', 'b', [
          'Nunca duplica, mas pode perder mensagens',
          'Não perde mensagens, mas pode entregá-las duplicadas',
          'Entrega cada mensagem exatamente uma vez, sempre',
          'Entrega as mensagens em ordem aleatória, sem confirmação'
        ], 'O remetente reenvia até receber o ack; por isso não perde, mas pode duplicar. Quem nunca duplica e pode perder é o no máximo uma vez.'),
        mcq('q2', 'Como se obtém "exatamente uma vez" como efeito na prática?', 'd', [
          'Desligando os acks para a rede nunca reenviar nada',
          'Usando relógios sincronizados para descartar mensagens atrasadas e ignorar as repetidas',
          'Enviando cada mensagem por dois caminhos de rede diferentes',
          'Com entrega pelo menos uma vez somada a consumidor idempotente ou deduplicação'
        ], 'A rede não permite exatamente-uma-vez como entrega física; o efeito vem de at-least-once mais idempotência.'),
        mcq('q3', 'Qual garantia de ordem a mensageria particionada oferece?', 'c', [
          'Ordem global entre todas as partições do tópico',
          'Nenhuma ordem, mesmo dentro de uma única partição',
          'Ordem apenas dentro de cada partição, então use uma chave por entidade',
          'Ordem apenas entre consumidores de grupos diferentes, nunca dentro de uma partição'
        ], 'Só há ordem dentro da partição; a chave leva todas as mensagens de uma entidade à mesma partição.'),
        fill('q4', 'Um tópico tem 4 partições e 5 consumidores no mesmo grupo (cada partição vai para no máximo um consumidor). Quantos consumidores ficam ociosos?', 'consumidores ociosos = 5 - 4 = ___', ['1', 'um', 'uma'], 'Com 4 partições só 4 consumidores recebem trabalho; o quinto fica ocioso.'),
        mcq('q5', 'O consumidor commita o offset ANTES de processar a mensagem e cai no meio do processamento. O que acontece?', 'a', [
          'A mensagem é perdida, pois o reinício começa depois dela (no máximo uma vez)',
          'A mensagem é processada duas vezes (pelo menos uma vez)',
          'A mensagem é movida automaticamente para outro tópico',
          'O offset é revertido e a mensagem é reprocessada sem duplicar graças ao commit antecipado'
        ], 'O offset já indicava a mensagem como processada; ao reiniciar, o consumidor a pula. Commitar depois evitaria a perda, ao custo de duplicatas.'),
        mcq('q6', 'Para que serve uma DLQ (dead-letter queue)?', 'd', [
          'Para guardar uma cópia de todas as mensagens para sempre, inclusive as já processadas',
          'Para acelerar o envio de mensagens grandes ao consumidor',
          'Para garantir a ordem global entre todas as partições',
          'Para isolar mensagens que falham repetidamente, sem travar as demais'
        ], 'Mensagens envenenadas, após N tentativas, vão para a DLQ para análise, em vez de bloquear a fila ou ser reentregues indefinidamente.'),
        mcq('q7', 'O consumidor é mais lento que o produtor e a fila cresce sem parar. Qual a abordagem de backpressure?', 'b', [
          'Aumentar a retenção até a fila nunca mais precisar ser lida',
          'Limitar buffers, desacelerar o produtor ou escalar consumidores',
          'Apagar mensagens aleatórias para reduzir o tamanho da fila',
          'Desligar os acks para os consumidores terminarem mais rápido'
        ], 'Backpressure sinaliza ao produtor ou aumenta a capacidade de consumo, em vez de acumular indefinidamente.'),
        fill('q8', 'Em que tipo de compatibilidade os consumidores NOVOS conseguem ler mensagens ANTIGAS?', 'compatibilidade ___ (consumidor novo lê dado antigo)', ['backward', 'retrocompatível', 'retrocompativel', 'retrocompatibilidade', 'compatível para trás', 'compativel para tras'], 'Backward: o consumidor atualizado ainda entende o formato antigo. Forward é o inverso: consumidores antigos leem dados novos.')
      ]
    },
    {
      id: 'cdi-19-log-distribuido-streaming',
      title: 'Logs distribuídos e streaming',
      goal: 'Usar o log append-only como abstração central: partições, ISR, event sourcing, CDC, compactação e dualidade tabela/stream.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O log append-only',
            'Um LOG é uma sequência ordenada de registros em que só se ANEXA no final, e cada registro tem um OFFSET sequencial. Registros nunca são alterados no lugar; cada leitor guarda sua posição e lê no próprio ritmo. A abstração é simples e aparece em todo lugar: o WAL dos bancos, a replicação (a réplica reproduz o log), o log replicado do Raft e a mensageria baseada em log. Como a ordem é total e imutável, o log é a "fonte da verdade" de que outros estados podem ser derivados.'
          ),
          sl(
            'Partições, réplicas e ISR',
            'Um único log não escala; por isso o tópico é dividido em PARTIÇÕES, cada uma um log independente (a ordem só vale dentro da partição). Cada partição é REPLICADA em vários brokers: um deles é o LÍDER da partição (recebe escritas e leituras) e os demais são seguidores que copiam o log. O ISR (in-sync replicas) é o conjunto de réplicas que estão acompanhando o líder dentro de um limite. Uma mensagem é considerada COMMITADA quando todas as réplicas do ISR a têm; se o líder cai, o novo líder sai do ISR, que contém todas as mensagens commitadas, e assim elas não se perdem. É uma visão geral: os detalhes variam entre sistemas e configurações.'
          ),
          sl(
            'Event sourcing: estado como dobra dos eventos',
            'No EVENT SOURCING, em vez de guardar o estado atual, guarda-se a sequência de EVENTOS imutáveis ("depósito de 100", "saque de 30"). O estado atual é a DOBRA (fold/reduce) dos eventos: parte-se do estado inicial e aplica-se cada evento em ordem. Vantagens: auditoria completa, reconstrução do estado em qualquer momento do passado, e novas visões derivadas sem perder histórico. Custos: eventos antigos precisam continuar interpretáveis (evolução de esquema), consultas exigem projeções prontas e, para não reler tudo, usam-se snapshots periódicos.',
            `eventos = [('dep', 100), ('saq', 30), ('dep', 50), ('saq', 20)]
saldo = 0
for tipo, valor in eventos:
    saldo += valor if tipo == 'dep' else -valor
print(saldo)    # 100   (100 - 30 + 50 - 20)`
          ),
          sl(
            'CDC e reprocessamento do histórico',
            'CDC (Change Data Capture) lê o log de transações de um banco e publica cada mudança como um evento num stream. Com isso, caches, índices de busca e data warehouses se mantêm sincronizados com o banco sem dual write. Como o log é RETIDO, um novo consumidor pode ler desde o início (ou de qualquer offset) para recomputar um estado, corrigir um bug de processamento ou criar uma nova visão dos dados: basta reprocessar o histórico em vez de pedir dados de novo à origem.'
          ),
          sl(
            'Compactação de log',
            'Reter tudo para sempre pode ser caro. Na COMPACTAÇÃO, o sistema mantém apenas o ÚLTIMO registro de cada chave e descarta os anteriores; um registro com valor nulo (uma lápide, tombstone) indica que a chave foi apagada. O log compactado funciona como um instantâneo do estado atual de uma tabela e continua sendo um log. Privacidade e LGPD: logs imutáveis retêm dados pessoais; a compactação com lápide ajuda a eliminar por chave, e outra técnica é cifrar os dados de cada titular com uma chave própria e descartar a chave para "apagar" (crypto-shredding); de todo modo, defina retenção e minimize o que vai nos eventos.',
            `log = [('a', 1), ('b', 2), ('a', 3), ('b', None), ('c', 5), ('a', 7)]
estado = {}
for chave, valor in log: estado[chave] = valor     # o último vence
print({k: v for k, v in estado.items() if v is not None}, len(log))
# {'a': 7, 'c': 5} 6     (6 registros viram 2 chaves vivas; b foi apagada)`
          ),
          sl(
            'Dualidade tabela/stream e processamento de streams',
            'Tabela e stream são dois lados da mesma moeda: uma TABELA é o estado num instante, ou seja, o resultado de aplicar um stream de mudanças; um STREAM é o histórico de mudanças de uma tabela (um changelog). Dá para ir de um ao outro: dobrar o stream gera a tabela, e registrar cada alteração da tabela gera o stream. O PROCESSAMENTO DE STREAMS consome eventos continuamente e os filtra, transforma, agrega e junta, mantendo estado local e usando janelas de tempo (por exemplo, "contagem por minuto"). Um cuidado inicial: o tempo em que o evento ocorreu pode diferir do tempo em que chega (eventos atrasados e fora de ordem), e a semântica de entrega (pelo menos uma vez, idempotência) continua valendo.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual característica define o log append-only?', 'd', [
          'Registros podem ser editados no lugar a qualquer momento por qualquer produtor',
          'Cada consumidor recebe uma cópia privada do log inteiro',
          'A ordem dos registros é decidida por cada leitor',
          'Só se anexa no final, e cada registro tem um offset sequencial imutável'
        ], 'Anexar no final e nunca alterar dá ordem total e imutável; cada leitor guarda apenas sua posição (offset).'),
        mcq('q2', 'O que é o ISR de uma partição?', 'a', [
          'O conjunto de réplicas que acompanham o líder dentro de um limite',
          'O conjunto de consumidores ativos de um grupo',
          'A lista de mensagens que falharam e foram para a DLQ após várias tentativas',
          'O hash que define em qual partição cada chave cai'
        ], 'Uma mensagem é commitada quando todas as réplicas do ISR a têm, e o novo líder sai do ISR, preservando as mensagens commitadas.'),
        mcq('q3', 'Em event sourcing, como se obtém o estado atual?', 'c', [
          'Lendo o último evento, que sempre contém o estado completo da entidade',
          'Consultando uma tabela que é a única fonte da verdade',
          'Dobrando (aplicando em ordem) os eventos sobre o estado inicial',
          'Pedindo ao serviço que gerou o primeiro evento'
        ], 'O estado é derivado: fold dos eventos imutáveis. Snapshots periódicos aceleram a reconstrução.'),
        fill('q4', 'Com os eventos dep 100, saq 30, dep 50 e saq 20, qual o saldo final?', 'saldo = 100 - 30 + 50 - 20 = ___', ['100'], '100 − 30 + 50 − 20 = 100.'),
        mcq('q5', 'Como um novo consumidor pode recalcular um estado ou corrigir um bug de processamento usando o log?', 'b', [
          'Pedindo à origem que reenvie todos os dados, pois o log não os guarda',
          'Lendo o log retido desde o início (ou de um offset) e reprocessando o histórico',
          'Copiando o estado de outro consumidor e ignorando o log',
          'Apagando o log e esperando que novos eventos reconstruam tudo'
        ], 'A retenção permite reler o histórico; basta reposicionar o offset e reprocessar, com idempotência para tolerar repetições.'),
        mcq('q6', 'O que faz a compactação de log?', 'a', [
          'Mantém só o último registro de cada chave, com lápide para chaves apagadas',
          'Comprime cada registro para ocupar menos bytes, mantendo todos sem alterar a ordem',
          'Apaga todos os registros mais antigos que a última leitura',
          'Reordena os registros por tamanho para acelerar a escrita'
        ], 'O log compactado vira um instantâneo do estado atual por chave e continua sendo um log; valor nulo (tombstone) marca a exclusão.'),
        mcq('q7', 'O que expressa a dualidade tabela/stream?', 'c', [
          'Que toda tabela precisa ter exatamente dois streams',
          'Que streams e tabelas nunca podem ser convertidos entre si',
          'Que a tabela é o estado resultante de um stream de mudanças e o stream é o changelog da tabela',
          'Que a tabela guarda eventos e o stream guarda apenas o saldo'
        ], 'Dobrar o stream de mudanças gera a tabela; registrar as alterações da tabela gera o stream.'),
        fill('q8', 'No log [(a,1), (b,2), (a,3), (b,nulo), (c,5), (a,7)], quantas chaves restam com valor após a compactação?', 'chaves vivas = ___', ['2', 'duas', 'dois'], 'a mantém 7 e c mantém 5; b foi apagada pela lápide (valor nulo): restam 2 chaves.')
      ]
    },
    {
      id: 'cdi-20-mapreduce-spark',
      title: 'MapReduce e Spark',
      goal: 'Entender o modelo map/shuffle/reduce, seus combiners e riscos (skew, stragglers) e como o Spark o generaliza com execução preguiçosa, DAG e cache.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O modelo: map, shuffle, reduce',
            'MapReduce processa dados enormes dividindo-os em partes que rodam em paralelo em muitos nós. Fase MAP: cada tarefa lê um pedaço da entrada e emite pares (chave, valor). SHUFFLE: o framework agrupa por chave e envia todos os pares com a mesma chave para o mesmo reducer (normalmente por hash(chave) mod R, com R reducers). Fase REDUCE: cada reducer recebe (chave, lista de valores) e produz o resultado. Você só escreve map e reduce; distribuição, ordenação e reenvio ficam com o framework.',
            `from collections import defaultdict
docs = ['gato rato gato', 'rato queijo gato', 'queijo queijo']
R = 2
def map_fn(doc):
    for w in doc.split():
        yield (w, 1)
def part(key): return sum(map(ord, key)) % R   # decide o reducer
shuffle = [defaultdict(list) for _ in range(R)]
for d in docs:                                  # cada doc = uma tarefa map
    for k, v in map_fn(d): shuffle[part(k)][k].append(v)
for r in range(R):                              # cada r = uma tarefa reduce
    print('reducer', r, sorted((k, sum(vs)) for k, vs in shuffle[r].items()))
# reducer 0 [('rato', 2)]
# reducer 1 [('gato', 3), ('queijo', 3)]`
          ),
          sl(
            'Combiner: reduzir antes de enviar pela rede',
            'O shuffle é a parte cara: move dados pela rede. O combiner é um "mini-reduce" que roda no próprio nó do mapper e agrega os pares localmente antes do envio. Na contagem de palavras, o doc "queijo queijo" enviaria (queijo,1),(queijo,1); com combiner envia só (queijo,2). Só vale para operações associativas e comutativas (soma, máximo, contagem). Média NÃO é assim: a média das médias parciais difere da média global; o combiner deve emitir (soma, contagem) e o reducer divide no fim.',
            `def combine(pares):
    acc = defaultdict(int)
    for k, v in pares: acc[k] += v
    return list(acc.items())
print(combine(map_fn('queijo queijo')))   # [('queijo', 2)]
# 3 docs: sem combiner 8 pares no shuffle; com combiner 6`
          ),
          sl(
            'Partições e skew (dados desbalanceados)',
            'O hash distribui CHAVES, não registros. Se 70% dos registros têm a mesma chave (um usuário "anônimo", um produto viral), um único reducer recebe a maior parte dos dados e o job inteiro espera por ele: é o skew. Mais reducers não ajudam, porque a mesma chave nunca se divide. Mitigações: combiner (reduz o volume por chave), "salgar" a chave (chave#0..chave#9, agregar em dois passos) ou tratar as chaves quentes à parte.'
          ),
          sl(
            'Falhas e stragglers',
            'Com centenas de nós, falhas são rotina. A saída dos maps fica em disco local e as tarefas são deterministas sobre entrada imutável; por isso, se uma tarefa falha, o framework simplesmente REEXECUTA essa tarefa em outro nó, sem refazer o job. Há também o straggler: uma tarefa que não falha, mas está anormalmente lenta (disco ruim, nó sobrecarregado) e atrasa o final. Solução: execução especulativa, que lança uma cópia da tarefa em outro nó e usa o resultado de quem terminar primeiro. Só funciona porque reexecutar é seguro (idempotente).'
          ),
          sl(
            'Spark: RDD, DataFrame, transformações e ações',
            'Spark generaliza o modelo: em vez de gravar em disco entre cada etapa, encadeia várias operações e mantém dados em memória quando possível. RDD é uma coleção distribuída imutável dividida em partições; DataFrame é uma tabela distribuída com colunas nomeadas, que permite ao otimizador planejar melhor. Há dois tipos de operação. TRANSFORMAÇÕES (map, filter, flatMap, reduceByKey...) são preguiçosas (lazy): apenas registram o plano. AÇÕES (count, collect, take, saveAsTextFile) disparam a execução de verdade.',
            `linhas = sc.textFile('logs/*.txt')                # nada lido ainda
palavras = linhas.flatMap(lambda l: l.split())    # transformação
pares = palavras.map(lambda w: (w, 1))            # transformação
contagem = pares.reduceByKey(lambda a, b: a + b)  # transformação (larga)
contagem.take(5)                                  # AÇÃO: executa o plano
# (esboço PySpark: exige um cluster/sessão Spark)`
          ),
          sl(
            'DAG, dependências estreitas vs largas e cache',
            'As transformações formam um grafo acíclico dirigido (DAG). Dependência ESTREITA: cada partição de saída depende de uma única partição de entrada (map, filter, flatMap); roda em pipeline, sem rede. Dependência LARGA: uma partição de saída depende de várias de entrada (reduceByKey, groupByKey, join); exige shuffle e define a fronteira entre estágios. Se uma partição se perde, Spark recalcula só ela refazendo suas transformações (linhagem). Sem cache, um RDD usado em duas ações é recalculado em cada uma; cache()/persist() guarda as partições (memória e/ou disco) para reaproveitar.',
            `contagem.cache()      # marca para guardar após a 1ª ação
contagem.count()      # calcula e guarda
contagem.take(5)      # reaproveita, sem recalcular`
          )
        ]
      },
      questions: [
        mcq('q1', 'Na contagem de palavras em MapReduce, o que o shuffle garante?', 'c', [
          'Que cada mapper receba todas as palavras de todos os arquivos',
          'Que os pares sejam gravados em banco antes do reduce começar',
          'Que todos os pares com a mesma chave cheguem ao mesmo reducer',
          'Que cada reducer receba exatamente o mesmo número de pares'
        ], 'O shuffle agrupa por chave (hash mod R). Isso não implica balanceamento: chaves quentes causam skew.'),
        mcq('q2', 'Um job calcula a média de notas por turma. Por que usar o próprio reducer como combiner estaria errado?', 'a', [
          'Média de médias parciais difere da média global; o certo é emitir (soma, contagem)',
          'Combiners só aceitam chaves numéricas e a turma é texto',
          'Combiners rodam apenas depois do reduce, então não afetam o volume de dados do shuffle',
          'Combiners não podem rodar no nó do mapper, só no reducer'
        ], 'Combiner exige operação associativa e comutativa. Para média, propague (soma, contagem) e divida no reducer final.'),
        mcq('q3', 'Em um job, 70% dos registros têm a mesma chave. O que você observa?', 'd', [
          'Todos os reducers terminam juntos, porque o shuffle equilibra a carga',
          'Os mappers ficam lentos, pois a chave quente é lida uma única vez',
          'O combiner deixa de funcionar justamente nessa chave quente',
          'Um reducer recebe a maior parte dos dados e atrasa o job inteiro'
        ], 'Esse é o skew: a mesma chave vai sempre ao mesmo reducer. Combiner e salting ajudam.'),
        fill('q4', 'Em Spark, map não executa nada sozinho. Qual ação dispara a execução e devolve o número de elementos?', 'pares = palavras.map(lambda w: (w, 1))   # só registra no plano\ntotal = pares.___()                       # ação: executa e conta', ['count'], 'count() é uma ação; transformações são preguiçosas e só rodam quando uma ação pede o resultado.'),
        mcq('q5', 'Como o framework trata uma tarefa que falhou e uma tarefa muito lenta (straggler), respectivamente?', 'b', [
          'Aborta o job inteiro; e mata a tarefa lenta sem substituí-la',
          'Reexecuta a tarefa em outro nó; e lança uma cópia especulativa, usando a que acabar primeiro',
          'Aproveita o resultado parcial da tarefa que falhou; e aguarda a tarefa lenta terminar sem copiá-la',
          'Reinicia o cluster todo; e reduz o número de partições'
        ], 'Entrada imutável e tarefas deterministas tornam a reexecução e a especulação seguras.'),
        mcq('q6', 'Qual destas operações Spark cria dependência larga (exige shuffle)?', 'd', [
          'map(f)',
          'filter(p)',
          'flatMap(f), mesmo que divida cada linha em palavras',
          'reduceByKey(f)'
        ], 'map, filter e flatMap são estreitas (pipeline na mesma partição). reduceByKey reagrupa por chave entre partições.'),
        mcq('q7', 'Um RDD caro de calcular é usado em duas ações diferentes, sem cache. O que ocorre?', 'a', [
          'Ele é recalculado desde a origem em cada ação',
          'Spark o guarda em disco sozinho após a primeira ação',
          'A segunda ação falha, pois os dados já foram consumidos',
          'A segunda ação devolve resultado vazio, sem erro'
        ], 'Sem cache/persist, a linhagem é reexecutada a cada ação. Cache evita o recálculo.'),
        fill('q8', 'No exemplo, o doc "queijo queijo" emite dois pares (queijo,1). Quantos pares ele envia ao shuffle com o combiner?', 'map emite: (queijo,1) (queijo,1)\ncombiner agrupa e envia ___ par(es): (queijo,2)', ['1', 'um', 'uma'], 'O combiner soma localmente: um único par (queijo,2) sai do nó.')
      ]
    },
    {
      id: 'cdi-21-stream-processing',
      title: 'Processamento de streams',
      goal: 'Processar eventos contínuos corretamente: tempo de evento, janelas, watermarks, estado/checkpoints e semânticas de entrega.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Stream vs lote',
            'Processamento em LOTE (batch) trabalha sobre um conjunto finito e conhecido ("todas as vendas de ontem") e termina. Processamento de STREAM trabalha sobre dados sem fim (cliques, sensores, transações) e produz resultados continuamente, com baixa latência. A dificuldade: como um fluxo nunca acaba, não existe "o fim dos dados" para disparar um cálculo. É preciso decidir quando um resultado parcial está completo o bastante: é para isso que servem janelas e watermarks.'
          ),
          sl(
            'Tempo de evento vs tempo de processamento',
            'Tempo de EVENTO é quando o fato aconteceu (o clique ocorreu às 10:00 no celular). Tempo de PROCESSAMENTO é quando o sistema o vê (chegou às 10:07 porque o celular estava sem sinal). Se agregarmos por tempo de processamento, o resultado depende de atrasos de rede e muda a cada reexecução. Agregando por tempo de evento, o resultado é o que realmente aconteceu, mas precisamos lidar com eventos que chegam fora de ordem e atrasados.'
          ),
          sl(
            'Janelas: tumbling, sliding e session',
            'Janela agrupa eventos em intervalos para agregar. TUMBLING: tamanho fixo, sem sobreposição, cada evento em exatamente uma janela ([0,10), [10,20)...). SLIDING (hopping): tamanho fixo que avança em passos menores que o tamanho, então janelas se sobrepõem; com tamanho 10 e passo 5, um evento em t=7 cai em [0,10) e [5,15). SESSION: não tem tamanho fixo; agrupa eventos de uma mesma atividade e fecha quando há uma pausa maior que um intervalo de inatividade (gap).',
            `def janela(t, tamanho=10):
    return t // tamanho * tamanho      # início da tumbling
print(janela(7), janela(12), janela(27))   # 0 10 20`
          ),
          sl(
            'Watermarks e dados atrasados',
            'Quando fechar a janela [0,10)? Pode chegar um evento de t=3 daqui a pouco. O watermark é a afirmação do sistema "não espero mais eventos com tempo de evento menor que W". Uma estratégia comum: W = maior tempo de evento visto - atraso tolerado. Quando W passa do fim da janela, ela é fechada e emitida. Eventos que chegam depois disso são "atrasados": podem ser descartados, desviados para uma saída lateral ou aplicados como correção (allowed lateness). O atraso tolerado é um equilíbrio entre latência e completude.',
            `events = [(1,'a'),(4,'b'),(12,'c'),(7,'d'),(15,'e'),(3,'late'),(26,'f')]
SIZE, LATE = 10, 5
windows = {}; wm = -1; closed = set()
for t, v in events:
    w = t // SIZE * SIZE
    if w in closed:
        print('descartado (atrasado):', t, v); continue
    windows.setdefault(w, []).append(v)
    wm = max(wm, t - LATE)
    for s in sorted(windows):
        if s + SIZE <= wm and s not in closed:
            closed.add(s); print(f'janela [{s},{s+SIZE}) fechou:', windows[s], 'wm=', wm)
# janela [0,10) fechou: ['a', 'b', 'd'] wm= 10
# descartado (atrasado): 3 late
# janela [10,20) fechou: ['c', 'e'] wm= 21`
          ),
          sl(
            'Estado e checkpoints',
            'Contar, somar por janela ou detectar padrões exige ESTADO (contadores, janelas abertas) guardado pelo operador. Se o nó cai, o estado em memória some. Por isso o motor faz checkpoints periódicos: salva o estado dos operadores e, junto, a posição lida na entrada (offsets). Ao recuperar, restaura o estado e relê a entrada a partir daquele ponto. Resultado: nada se perde, mas eventos entre o checkpoint e a falha são reprocessados, o que pode gerar saídas duplicadas se o destino (sink) não for tolerante a isso.'
          ),
          sl(
            'Semânticas de entrega e as ferramentas',
            'Ponta a ponta: at-most-once (pode perder), at-least-once (não perde, pode duplicar) e "exactly-once" como EFEITO: o processamento pode repetir, mas o resultado visível é como se tivesse ocorrido uma vez, usando sinks idempotentes (upsert por chave) ou transações que gravam saída e offsets juntos. Na prática: Apache Flink e Kafka Streams são motores de stream com estado e tempo de evento (Kafka Streams como biblioteca sobre o Kafka); Spark Structured Streaming trata o fluxo como uma tabela que cresce, processada em micro-lotes ou de forma contínua.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um clique ocorreu às 10:00 mas só chegou ao sistema às 10:07. Em qual janela de 10 minutos ele conta se agregarmos por tempo de evento?', 'b', [
          'Na janela que contém 10:07, a hora em que chegou',
          'Na janela que contém 10:00, a hora em que ocorreu',
          'Em nenhuma, pois eventos atrasados são sempre descartados',
          'Nas duas janelas, 10:00 e 10:07, em sobreposição'
        ], 'Tempo de evento usa o instante em que o fato ocorreu. O atraso só importa para decidir quando fechar a janela.'),
        mcq('q2', 'Janela deslizante de tamanho 10 com passo 5: em quantas janelas cai um evento em t=7?', 'd', [
          '0, pois só se contam eventos nas bordas',
          '1, igual a uma tumbling',
          '3, as janelas [-5,5), [0,10) e [5,15)',
          '2, as janelas [0,10) e [5,15)'
        ], 'Janelas sliding começam a cada 5: [0,10) e [5,15) contêm t=7. [-5,5) termina antes de 7.'),
        mcq('q3', 'Qual janela fecha por inatividade e não tem tamanho fixo?', 'a', [
          'Session',
          'Tumbling',
          'Sliding',
          'Global de lote'
        ], 'A janela de sessão agrupa eventos próximos e fecha quando passa o intervalo de inatividade (gap).'),
        fill('q4', 'Complete o cálculo do início da janela tumbling de tamanho 10 para t=27.', 'inicio = 27 // 10 * ___   # resultado: 20', ['10'], '27 // 10 = 2 e 2 * 10 = 20: início da janela [20,30).'),
        mcq('q5', 'No traço do slide, por que o evento (3, "late") foi descartado?', 'c', [
          'Porque o valor "late" não é aceito pela janela',
          'Porque o tempo 3 é menor que o tempo do evento anterior',
          'Porque a janela [0,10) já havia fechado com watermark em 10',
          'Porque a janela [10,20) já estava cheia e não aceitava mais nenhum evento'
        ], 'O watermark chegou a 10 ao ver o evento 15, fechando [0,10). O evento 3 pertence a essa janela, então é atrasado.'),
        mcq('q6', 'Um job com estado tem checkpoint a cada minuto e cai. O que acontece ao recuperar?', 'b', [
          'Recomeça do zero, ignorando o estado salvo',
          'Restaura estado e offsets do último checkpoint e reprocessa o intervalo posterior',
          'Continua exatamente do ponto da falha, sem reprocessar nada',
          'Pula os eventos ocorridos desde o checkpoint para não gerar duplicatas na saída do job'
        ], 'O motor volta ao último checkpoint e relê a entrada dali; sinks precisam tolerar o reprocessamento.'),
        mcq('q7', 'O que significa "exactly-once" de ponta a ponta na prática?', 'c', [
          'Cada evento é transmitido pela rede uma única vez e nunca reenviado, mesmo se o nó falhar',
          'Falhas nunca ocorrem durante o processamento do evento',
          'O processamento pode repetir, mas o efeito visível ocorre uma só vez (idempotência)',
          'O sistema descarta qualquer evento que possa ser duplicado'
        ], 'Exactly-once é um efeito obtido com at-least-once mais idempotência ou transações.'),
        fill('q8', 'Com atraso tolerado de 5 e maior tempo de evento visto igual a 26, qual o watermark?', 'wm = 26 - 5 = ___', ['21'], 'Watermark = maior tempo de evento - atraso tolerado = 21, o que fecha [10,20).')
      ]
    },
    {
      id: 'cdi-22-armazenamento-hdfs-objetos',
      title: 'Armazenamento distribuído em profundidade',
      goal: 'Compreender HDFS/GFS, armazenamento de objetos, replicação vs erasure coding, durabilidade e o gargalo dos metadados.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'GFS e HDFS: NameNode e DataNodes',
            'O GFS (Google) inspirou o HDFS (Hadoop). Arquitetura: um NameNode (no GFS, "master") guarda os METADADOS: árvore de diretórios, quais blocos formam cada arquivo e em quais DataNodes cada bloco está. Os DataNodes guardam os blocos e enviam heartbeats e relatórios. O cliente pergunta ao NameNode onde estão os blocos, mas lê e escreve os DADOS diretamente com os DataNodes, para que o NameNode não vire gargalo de tráfego. Arquivos são grandes, escritos uma vez e lidos em sequência: um sistema para processamento em lote, não para edição aleatória.'
          ),
          sl(
            'Blocos grandes, replicação e consciência de rack',
            'Arquivos são divididos em blocos grandes (dezenas a centenas de MB, em vez de KB). Motivos: menos entradas de metadados na memória do NameNode e custo de "procurar" (seek) amortizado sobre muitos dados lidos em sequência. Cada bloco é replicado (por padrão, 3 cópias) em DataNodes diferentes. Com consciência de rack, as réplicas são espalhadas por racks distintos: uma falha de rack inteiro (switch, energia) não elimina todas as cópias. O custo é mais tráfego entre racks ao escrever, que é mais lento que dentro do rack.'
          ),
          sl(
            'Escrita em pipeline',
            'Ao escrever, o cliente pede ao NameNode uma lista de DataNodes para o bloco. Ele envia os dados ao primeiro; o primeiro repassa ao segundo enquanto ainda recebe e o segundo ao terceiro: um pipeline. Isso evita que o cliente envie 3 cópias pela própria saída de rede. Os reconhecimentos (acks) voltam pelo mesmo caminho em sentido inverso. Se um DataNode falha no meio, o pipeline é remontado sem ele e o NameNode agenda a recriação da réplica que faltou.',
            `cliente --dados--> DN1 --dados--> DN2 --dados--> DN3
cliente <--ack---- DN1 <--ack---- DN2 <--ack---- DN3`
          ),
          sl(
            'Armazenamento de objetos',
            'Armazenamento de objetos (estilo S3) guarda objetos imutáveis em buckets, endereçados por CHAVE (um texto como "fotos/2024/a.jpg"; as "pastas" são só prefixo da chave) e acessados por HTTP. Para objetos grandes existe o upload multipart: iniciar o upload, enviar as partes (em paralelo e com retentativa individual) e completar, que junta as partes em um objeto. Há classes de armazenamento: dados quentes (acesso frequente, mais caro por GB, rápido) a frios/arquivo (barato por GB, acesso lento ou taxado). A consistência de listagem/leitura após escrita varia por produto: consulte a documentação do serviço.'
          ),
          sl(
            'URLs pré-assinadas',
            'Como dar a alguém acesso temporário a UM objeto sem entregar credenciais? A URL pré-assinada contém uma assinatura calculada com as credenciais do emissor, a operação permitida (GET ou PUT), a chave exata do objeto e um prazo de expiração. Quem tiver a URL faz só aquilo, até expirar. Boas práticas de segurança: validade curta, uma chave por URL, nunca registrar a URL completa em logs (ela funciona como senha) e não colocar dados pessoais no nome da chave, pois chaves aparecem em logs e URLs.'
          ),
          sl(
            'Replicação vs erasure coding; durabilidade e metadados',
            'Replicação 3x: simples, leitura rápida, tolera perder 2 cópias, mas gasta 3x o espaço. Erasure coding (Reed-Solomon, em visão geral) divide os dados em k fragmentos e calcula m de paridade; quaisquer k dos k+m reconstroem o dado. Com k=6, m=3: gasto (6+3)/6 = 1,5x e tolera perder 3 fragmentos. O custo: reconstruir um fragmento exige LER k outros e computar, gerando muito mais rede/CPU que copiar uma réplica. Por isso é usado em dados frios. Durabilidade em "noves": 99,999999999% (11 noves) significa probabilidade ínfima de perder um objeto no ano, não "zero". E os metadados são o gargalo clássico: milhões de arquivos pequenos enchem a memória do NameNode, e por isso se prefere poucos arquivos grandes.',
            `k, m = 6, 3
print('replicacao 3x:', 3.0, 'tolera 2 perdas')
print('erasure', (k + m) / k, 'tolera', m, 'perdas')
# replicacao 3x: 3.0 tolera 2 perdas
# erasure 1.5 tolera 3 perdas`
          )
        ]
      },
      questions: [
        mcq('q1', 'O que o NameNode armazena, e por onde flui o conteúdo dos arquivos?', 'd', [
          'Os blocos de dados; e o conteúdo passa sempre por ele',
          'Apenas os dados quentes de cada arquivo; e o resto vai por um balanceador de carga',
          'Os dados e os metadados; e o cliente só fala com ele',
          'Os metadados (arquivo, blocos, locais); e o conteúdo vai direto cliente-DataNode'
        ], 'O NameNode guarda só metadados. Os dados trafegam direto entre cliente e DataNodes.'),
        mcq('q2', 'Por que sistemas como o HDFS usam blocos grandes?', 'b', [
          'Para que cada leitura aleatória pequena seja mais rápida e use menos disco',
          'Para reduzir metadados e amortizar o custo de seek em leituras sequenciais',
          'Para que seja impossível replicar o bloco em racks distintos',
          'Para eliminar a necessidade de um NameNode'
        ], 'Blocos grandes significam menos entradas de metadados e leitura sequencial eficiente.'),
        mcq('q3', 'Na escrita em pipeline com 3 réplicas, como os dados chegam aos DataNodes?', 'c', [
          'O cliente envia as 3 cópias em paralelo pela própria rede',
          'O NameNode copia o bloco para os 3 DataNodes',
          'O cliente envia ao 1o, que repassa ao 2o, que repassa ao 3o, com acks voltando',
          'Cada DataNode busca o bloco diretamente no disco do cliente, em paralelo, sem passar pelo NameNode'
        ], 'O pipeline encadeia o repasse e poupa a saída do cliente; os acks voltam em sentido inverso.'),
        fill('q4', 'Qual é o fator de gasto de espaço de um esquema Reed-Solomon com 6 fragmentos de dados e 3 de paridade?', 'gasto = (6 + 3) / 6 = ___', ['1.5', '1,5'], '9/6 = 1,5x, contra 3x da replicação tripla, tolerando até 3 fragmentos perdidos.'),
        mcq('q5', 'Qual o principal custo do erasure coding em relação à replicação?', 'a', [
          'Reconstruir um fragmento exige ler vários outros, gerando mais rede e CPU',
          'Ele gasta bem mais espaço em disco que a replicação tripla, para o mesmo dado',
          'Ele não tolera nenhuma perda de fragmento',
          'Ele exige um segundo NameNode ativo'
        ], 'Reconstrução lê k fragmentos. Por isso se usa em dados frios; replicação serve melhor a dados quentes.'),
        mcq('q6', 'O que é uma URL pré-assinada de objeto?', 'c', [
          'Um link público permanente para todo o bucket',
          'Uma URL que contém a senha do administrador do bucket em texto claro, para uso livre',
          'Uma URL assinada, com operação, chave e expiração, de acesso temporário',
          'Uma URL que desativa a autenticação do bucket'
        ], 'A assinatura limita a operação e o objeto, e expira. Trate a URL como segredo e não a registre em logs.'),
        mcq('q7', 'Um cluster tem dezenas de milhões de arquivos de poucos KB e o NameNode fica sobrecarregado. Qual a causa e a saída?', 'd', [
          'Falta de DataNodes; adicionar nós de armazenamento resolve',
          'Rede lenta entre racks; trocar o switch resolve',
          'Pouca replicação; aumentar o fator de replicação para 10 resolve o problema',
          'Metadados demais na memória; agrupar em poucos arquivos grandes'
        ], 'Cada arquivo/bloco ocupa metadados no NameNode. O problema dos arquivos pequenos se resolve consolidando-os.'),
        fill('q8', 'Em um upload multipart, qual a última etapa, que junta as partes em um único objeto?', 'iniciar upload -> enviar partes (em paralelo) -> ___ upload', ['complete', 'completar', 'finalizar'], 'Depois de enviar todas as partes, "completar" o upload as junta no objeto final.')
      ]
    },
    {
      id: 'cdi-23-nosql-por-categoria',
      title: 'Famílias de NoSQL',
      goal: 'Escolher e modelar bancos NoSQL por família (chave-valor, documento, coluna larga, grafo, séries temporais) pensando em consultas.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Chave-valor',
            'O modelo mais simples: você guarda um valor sob uma chave e busca só pela chave (GET/PUT/DELETE). Exemplos: Redis (em memória, com estruturas ricas) e a linhagem do Dynamo (altamente disponível, particionado e replicado). Pontos fortes: latência baixíssima e escala horizontal fácil, pois a chave decide o nó. Limite: não há consulta por conteúdo. "Todos os usuários da cidade X" exige varredura ou um índice secundário que você mantém. Use para sessões, carrinhos, cache, contadores e perfis acessados por id.'
          ),
          sl(
            'Documento',
            'Guarda documentos autocontidos (JSON/BSON) em coleções, como o MongoDB. O documento pode aninhar objetos e listas, então dados que são lidos juntos ficam juntos: um pedido com seus itens em um único documento, lido em uma operação, sem JOIN. É possível consultar por campos internos e criar índices. Esquema flexível ajuda quando os registros variam, mas a estrutura ainda existe (na aplicação). Atenção a documentos que crescem sem limite e à duplicação de dados entre documentos.',
            `{"pedido": 7, "cliente_id": "c-91",
 "itens": [{"sku": "A1", "qtd": 2}, {"sku": "B9", "qtd": 1}]}`
          ),
          sl(
            'Coluna larga: chave de partição e de clustering',
            'Cassandra, HBase e Bigtable organizam linhas em famílias de colunas, otimizadas para escrita em larga escala. Em Cassandra a chave primária tem duas partes. A CHAVE DE PARTIÇÃO decide em qual nó (partição) a linha vive; todas as linhas com a mesma chave de partição ficam juntas. As colunas de CLUSTERING ordenam as linhas dentro da partição. Consultas eficientes fixam a partição inteira e fazem faixa no clustering. Cuidado com partições que crescem sem limite (por isso incluímos o dia na chave) e com partições quentes.',
            `CREATE TABLE leituras (
  sensor_id text, dia date, ts timestamp, valor double,
  PRIMARY KEY ((sensor_id, dia), ts)   -- partição = (sensor, dia); clustering = ts
);
SELECT * FROM leituras WHERE sensor_id='s1' AND dia='2024-05-01' AND ts > '2024-05-01 10:00';`
          ),
          sl(
            'Grafo e séries temporais',
            'Grafo (Neo4j): nós e arestas (relacionamentos) são cidadãos de primeira classe, com propriedades. Percorrer relacionamentos é barato e direto: "amigos de amigos de amigos" seria uma cadeia de JOINs custosos num banco relacional, e no grafo é uma travessia. Bom para redes sociais, recomendação, detecção de fraude, dependências. Séries temporais (TSDB): pontos (tempo, valor, rótulos) gravados em ordem de tempo, quase sempre em append. Oferecem retenção automática e DOWNSAMPLING: pontos antigos são agregados (média por hora em vez de um ponto por segundo) para economizar espaço.'
          ),
          sl(
            'Modelagem orientada a consultas e desnormalização',
            'No relacional, modelamos os dados (normalizados) e depois escrevemos qualquer consulta com JOIN. Em muitos NoSQL, sem JOINs eficientes, é o contrário: liste primeiro as consultas e desenhe a estrutura para atendê-las, até uma tabela/coleção por consulta, duplicando dados (desnormalização). Custo: atualizar um dado significa atualizá-lo em vários lugares, e a aplicação responde pela consistência. A consistência varia por família e produto (muitos são configuráveis, como quórum de leitura/escrita; alguns oferecem transações limitadas); leia o que o produto garante.'
          ),
          sl(
            'Quando NÃO usar NoSQL',
            'NoSQL não é "melhor", é um conjunto de trocas. Prefira o relacional quando você precisa de transações envolvendo várias entidades com garantias fortes, consultas ad hoc e relatórios imprevisíveis (JOINs, agregações livres), integridade referencial e um esquema estável com volume que cabe em um nó (ou em réplicas de leitura). Muitos projetos adotam NoSQL "porque escala" sem precisar de escala, e pagam com modelagem rígida por consulta e perda da flexibilidade do SQL.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Num armazenamento chave-valor, qual consulta é difícil sem um índice secundário?', 'a', [
          'Listar todos os usuários cuja cidade é "Recife"',
          'Buscar o perfil do usuário pela chave "user:42"',
          'Atualizar o valor da chave "carrinho:7"',
          'Apagar a chave "sessao:abc"'
        ], 'Chave-valor só busca bem pela chave. Consultar por conteúdo exige varredura ou um índice mantido à parte.'),
        mcq('q2', 'Em PRIMARY KEY ((sensor_id, dia), ts), o que define em qual partição/nó a linha fica?', 'c', [
          'A coluna ts sozinha, a chave de clustering',
          'A ordem de inserção das linhas',
          'O par (sensor_id, dia), a chave de partição',
          'O valor da leitura gravada, em ordem crescente'
        ], 'A chave de partição vai entre parênteses internos. ts apenas ordena as linhas dentro da partição (clustering).'),
        mcq('q3', 'Qual consulta é o caso de uso típico de um banco de grafos?', 'b', [
          'Somar vendas por mês de um ano inteiro',
          'Achar amigos de amigos de amigos, percorrendo relacionamentos',
          'Guardar sessões de usuário com expiração',
          'Armazenar leituras de sensor em ordem de tempo, com retenção automática'
        ], 'Travessias de vários saltos são baratas no grafo e viram cadeias de JOINs caros no relacional.'),
        fill('q4', 'Na chave primária de coluna larga, o que as colunas de partição formam?', 'PRIMARY KEY ((sensor_id, dia), ts)\n-- (sensor_id, dia) = chave de ___', ['partição', 'particao', 'partition', 'partiçao'], 'A chave de partição decide a localização da linha no cluster; clustering ordena dentro dela.'),
        mcq('q5', 'O que significa modelar orientado a consultas com desnormalização?', 'd', [
          'Normalizar tudo e deixar o banco resolver os JOINs depois, sem duplicar dados nunca',
          'Evitar qualquer duplicação de dados entre tabelas',
          'Criar o esquema antes de saber quais consultas existirão',
          'Desenhar uma estrutura por consulta, duplicando dados e cuidando da consistência'
        ], 'Dados duplicados tornam as leituras rápidas, mas as escritas precisam atualizar várias cópias.'),
        mcq('q6', 'Uma tabela de leituras tem PRIMARY KEY (sensor_id, ts) e cada sensor grava por anos. Qual o risco?', 'a', [
          'A partição de cada sensor cresce sem limite e fica gigante ou quente',
          'As leituras ficam fora de ordem dentro da partição e o banco as rejeita',
          'O banco rejeita chaves com duas colunas',
          'Os sensores nunca conseguem ser consultados'
        ], 'Partições ilimitadas degradam o desempenho. Agrupar por janela (sensor_id, dia) limita o tamanho.'),
        mcq('q7', 'Em qual situação é melhor NÃO adotar NoSQL?', 'b', [
          'Sessões de usuário acessadas só pela chave',
          'Transações entre várias entidades, relatórios ad hoc e volume que cabe em um nó',
          'Milhões de eventos de log gravados em append, consultados quase sempre por faixa de tempo',
          'Um catálogo de documentos com campos variáveis'
        ], 'Quando o relacional atende (transações fortes, SQL livre, volume moderado), ele é mais simples e flexível.'),
        fill('q8', 'Como se chama a técnica de agregar pontos antigos de uma série temporal (por exemplo, uma média por hora) para economizar espaço?', 'pontos de 1 s com mais de 90 dias -> média por hora\n-- técnica: ___', ['downsampling', 'down-sampling', 'down sampling'], 'Downsampling reduz a resolução dos dados antigos, mantendo a tendência com bem menos espaço.')
      ]
    },
    {
      id: 'cdi-24-newsql',
      title: 'SQL distribuído (NewSQL)',
      goal: 'Entender por que o SQL clássico não escala escrita, como bancos NewSQL combinam faixas replicadas por consenso com SQL e transações, e quais custos isso traz.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que o SQL clássico não escala escrita',
            'Um banco relacional clássico tem um primário que aceita todas as escritas. Réplicas de leitura multiplicam a capacidade de LEITURA, mas cada escrita ainda passa pelo primário: o limite de escrita é o de uma máquina (que se pode aumentar verticalmente só até certo ponto). A alternativa histórica é o sharding manual: dividir os dados em bancos independentes por chave, com a aplicação decidindo para onde ir.'
          ),
          sl(
            'Dores do sharding manual',
            'No sharding manual a complexidade vai para a aplicação: JOINs entre shards não existem (ou são feitos na aplicação), transações atômicas entre shards exigem coordenação própria (2PC ou sagas), rebalancear dados ao adicionar shards é um projeto à parte, esquemas e migrações precisam ser aplicados em N bancos e consultas globais viram scatter-gather manual. SQL distribuído nasce para entregar escala horizontal mantendo SQL, transações e consistência forte, escondendo o sharding da aplicação.'
          ),
          sl(
            'Arquitetura típica: faixas replicadas por consenso',
            'O desenho comum: camada SQL (parser, planejador, executor) sobre um armazenamento chave-valor ordenado e transacional. O espaço de chaves é dividido em faixas contíguas (ranges/tablets/regiões). Cada faixa é replicada em, por exemplo, 3 nós por um protocolo de consenso (Raft ou Paxos): um líder por faixa ordena as escritas e confirma quando a maioria as tem. Faixas se dividem quando crescem e migram entre nós para equilibrar. Assim cada faixa é um pequeno grupo de consenso, e o cluster tem muitos deles.',
            `tabela pedidos (ordenada pela chave primária)
[ faixa A: 1..1000 ] líder em nó1, réplicas nó2,nó3
[ faixa B: 1001..2000 ] líder em nó2, réplicas nó1,nó3
cada escrita em uma faixa: maioria = 3 // 2 + 1 = 2 réplicas`
          ),
          sl(
            'Transações distribuídas e relógios',
            'Se uma transação toca duas faixas (dois grupos de consenso diferentes), é preciso um commit atômico entre elas, tipicamente uma variação de commit em duas fases (2PC), com os participantes sendo grupos replicados (por isso o coordenador não fica bloqueado por uma única máquina). Para ordenar transações usam-se timestamps e controle de concorrência multiversão. O Spanner usa o TrueTime, relógios com incerteza limitada conhecida, e espera essa incerteza passar antes de confirmar (commit wait) para garantir a ordem; outros sistemas usam relógios híbridos (HLC). A ideia comum: custo extra em cada commit para garantir consistência forte.'
          ),
          sl(
            'Custos: latência e localidade',
            'Cada commit exige idas e voltas de rede. Se as réplicas estão em regiões distantes, o commit espera pelo menos a resposta da maioria: com líder em uma região e réplicas em outras duas, a latência mínima é a de ida e volta até a réplica mais próxima necessária para formar maioria. Transações que cruzam faixas e regiões custam mais. Por isso importa a LOCALIDADE de dados: fixar líderes perto de quem usa e particionar por geografia (por exemplo, dados de usuários europeus em faixas na Europa, o que também ajuda requisitos de residência de dados).'
          ),
          sl(
            'Hotspots, produtos e quando usar',
            'Uma chave primária sempre crescente (auto-incremento, timestamp) faz todos os INSERTs caírem na última faixa: um hotspot (ponto quente) que anula a escala. Prefira chaves distribuídas (UUID, hash prefixado). Exemplos de produtos, em visão conceitual: Spanner, CockroachDB, YugabyteDB e TiDB seguem variações dessa arquitetura. Use quando você precisa de SQL + transações fortes + escala horizontal de escrita + alta disponibilidade entre zonas/regiões. NÃO use se um único nó (com réplicas) já atende: será mais simples, barato e com latência menor.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que adicionar réplicas de leitura não escala a capacidade de escrita de um relacional clássico?', 'c', [
          'Porque réplicas de leitura não conseguem copiar os dados do primário',
          'Porque escrever em réplicas é proibido pelo protocolo SQL',
          'Porque toda escrita ainda passa pelo único primário',
          'Porque cada réplica adicionada divide o disco do primário'
        ], 'Réplicas de leitura multiplicam leituras; as escritas continuam serializadas no primário.'),
        mcq('q2', 'Em um SQL distribuído típico, o que é uma faixa (range)?', 'd', [
          'Um índice secundário criado automaticamente para cada coluna',
          'Uma cópia completa do banco em cada região',
          'Um lote de transações aguardando commit',
          'Um intervalo contíguo de chaves, replicado por consenso'
        ], 'O espaço de chaves é dividido em faixas, cada uma replicada por Raft/Paxos com seu próprio líder.'),
        mcq('q3', 'Líder em São Paulo, réplicas em Virgínia e Frankfurt (3 réplicas). A latência mínima de commit é determinada por quê?', 'b', [
          'Pela réplica mais distante: é preciso esperar as três confirmações antes do commit',
          'Pela ida e volta até a réplica mais próxima que completa a maioria',
          'Pelo tempo de CPU do planejador SQL apenas',
          'Não há custo de rede, pois o líder decide sozinho'
        ], 'Maioria de 3 = 2: o líder e a réplica mais rápida bastam. A distância entre regiões define o piso da latência.'),
        fill('q4', 'Com 3 réplicas por faixa, quantas confirmações (incluindo o líder) formam a maioria?', 'replicas = 3\nmaioria = replicas // 2 + ___   # = 2', ['1', 'um'], '3 // 2 = 1; mais 1 dá 2. Duas de três já formam maioria.'),
        mcq('q5', 'Por que uma chave primária auto-incremento pode ser um problema em SQL distribuído?', 'a', [
          'Todos os INSERTs caem na última faixa, criando um hotspot de escrita',
          'Faixas de armazenamento não aceitam chaves numéricas, apenas chaves de texto',
          'Auto-incremento impede a replicação por consenso',
          'Chaves crescentes desligam a consistência forte'
        ], 'Chaves monotônicas concentram escrita em um líder. UUIDs ou hash distribuem a carga.'),
        mcq('q6', 'Qual das tarefas passa a ser da aplicação no sharding manual, mas é escondida pelo SQL distribuído?', 'd', [
          'Escrever as consultas SELECT usadas por cada tela do sistema',
          'Definir o esquema das tabelas e os tipos de cada coluna',
          'Escolher o nome do banco de dados',
          'Coordenar transações entre shards e rebalancear dados'
        ], 'No sharding manual, transações multi-shard e rebalanceamento são com você. No SQL distribuído, o sistema cuida.'),
        mcq('q7', 'Em qual cenário o SQL distribuído provavelmente NÃO vale a pena?', 'c', [
          'Escrita que cresce além de um nó e precisa de transações fortes',
          'Disponibilidade entre múltiplas regiões, mantendo SQL e transações fortes',
          'Um sistema cujo volume e carga cabem em um único banco com réplicas',
          'Dados por geografia com requisitos de localidade'
        ], 'Se um nó atende, o relacional comum é mais simples, barato e rápido. NewSQL é para quando ele não basta.'),
        fill('q8', 'Como se chama o ponto quente de escrita criado por uma chave sempre crescente?', '-- id crescente: todo INSERT cai na última faixa\n-- isso cria um ___ de escrita', ['hotspot', 'hot spot', 'hot-spot', 'ponto quente'], 'Hotspot: uma faixa/líder recebe quase todo o tráfego de escrita, anulando a escala horizontal.')
      ]
    },
    {
      id: 'cdi-25-cache-avancado',
      title: 'Cache distribuído avançado',
      goal: 'Dominar políticas de escrita e invalidação, evitar cache stampede e inconsistências, entender slots do Redis Cluster e CDN e cachear dados pessoais com segurança.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Write-through, write-back e write-around',
            'Além do cache-aside (a aplicação lê o cache e, no miss, busca no banco e preenche), há políticas de escrita. WRITE-THROUGH: a escrita vai ao cache e ao banco de forma síncrona; leituras seguintes acertam o cache e há pouca divergência, mas a escrita é mais lenta. WRITE-BACK (write-behind): grava só no cache e persiste no banco depois, em lote; escrita rápida, porém se o cache falhar antes de persistir, as escritas pendentes se perdem. WRITE-AROUND: escreve direto no banco, sem passar pelo cache; o dado só entra num cache quando for lido. Bom para dados escritos e raramente lidos, que poluiriam o cache.'
          ),
          sl(
            'Invalidação: TTL, evento e versão',
            '"Só há duas coisas difíceis: invalidação de cache e nomear coisas." Estratégias: TTL (a entrada expira sozinha: simples, mas tolera obsolescência até o prazo); por EVENTO (quem altera o dado publica um evento ou apaga a chave; mais fresco, porém depende de nenhum evento se perder); por VERSÃO (a versão entra na chave, como user:42:v7; ao mudar, passa a ser v8 e a antiga fica órfã até expirar; evita ler dado velho misturado). Na prática combina-se: invalidação por evento + TTL como rede de segurança.'
          ),
          sl(
            'Dupla escrita cache/banco e corridas',
            'Atualizar banco e cache são duas operações sem transação conjunta. Mesmo a regra comum (gravar no banco e DEPOIS apagar a chave) tem uma corrida: T1 lê o cache (miss) e lê o banco (v1); T2 grava v2 no banco e apaga a chave; T1 então grava v1 no cache. O cache fica com v1 obsoleto até o TTL. Por isso: TTL sempre como limite de dano, chaves com versão (a escrita antiga não sobrescreve versão nova) e, em casos críticos, ler direto do banco. Cache é otimização, nunca fonte da verdade.'
          ),
          sl(
            'Cache stampede e mitigações',
            'Stampede (thundering herd): uma chave muito popular expira e centenas de requisições, ao verem o miss, vão todas ao banco ao mesmo tempo, que sobrecarrega e cai. Mitigações: SINGLE-FLIGHT (só uma requisição recarrega; as outras aguardam o mesmo resultado, como no código); JITTER de TTL (TTL = base + aleatório, para chaves carregadas juntas não expirarem juntas); EXPIRAÇÃO ANTECIPADA PROBABILÍSTICA (cada leitura, perto do fim do TTL, pode recarregar cedo com probabilidade crescente, evitando que todas esperem o vencimento).',
            `import threading, time
calls = 0
lock = threading.Lock(); inflight = {}
def load(key):                       # simula a ida lenta ao banco
    global calls
    calls += 1; time.sleep(0.1); return key.upper()
def single_flight(key):
    with lock:
        slot = inflight.get(key)
        leader = slot is None
        if leader:
            slot = inflight[key] = {'ev': threading.Event(), 'val': None}
    if leader:
        slot['val'] = load(key); slot['ev'].set()
        with lock: del inflight[key]
    else:
        slot['ev'].wait()            # espera o líder
    return slot['val']
# 10 threads chamando single_flight('perfil:7'):
# 10 respostas {'PERFIL:7'}, idas ao banco: 1
`
          ),
          sl(
            'Chaves quentes, Redis Cluster e CDN',
            'Uma chave quente concentra tráfego em um só nó. Mitigações: réplicas de leitura, cache local (em processo) na frente, ou dividir a chave em cópias (perfil:7#0..#3). No Redis Cluster o espaço de chaves é dividido em 16384 slots; slot = CRC16(chave) mod 16384, e cada nó é dono de uma faixa de slots (as chaves com "hash tag" {x} caem no mesmo slot, permitindo operações multi-chave). Uma CDN é cache de borda: servidores perto do usuário guardam respostas HTTP (arquivos estáticos e, com cuidado, respostas de API), controladas por cabeçalhos como Cache-Control.'
          ),
          sl(
            'Cache e dados pessoais',
            'Caches e CDNs são mais um lugar onde dados pessoais vivem (e vazam). Cuidados: a CHAVE não deve conter o dado pessoal (use id opaco, nunca o e-mail), pois chaves aparecem em logs e métricas; guarde só os campos necessários (minimização); TTL curto, alinhado à finalidade; controle de acesso e rede privada, com criptografia em trânsito (e em repouso quando houver persistência); e apagar a entrada quando o titular pedir eliminação. Em CDN, respostas específicas do usuário devem sair com Cache-Control: private (só o navegador do usuário pode guardar) ou no-store (ninguém guarda), senão um cache compartilhado pode servi-las a outra pessoa.',
            `# ruim:  chave = 'perfil:ana@example.com'
# bom:   chave = 'perfil:u-8f3a'            # id opaco
# HTTP:  Cache-Control: private             # não vai para caches compartilhados`
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é o risco típico do write-back?', 'b', [
          'Todas as leituras passam a ser lentas, pois o cache é ignorado',
          'Perder escritas só presentes no cache se ele falhar',
          'A escrita fica mais lenta que no write-through',
          'Impossibilidade de usar TTL'
        ], 'Write-back adia a gravação no banco. Em troca de escrita rápida, aceita risco de perda se o cache cair.'),
        mcq('q2', 'Quando o write-around é uma boa escolha?', 'a', [
          'Para dados escritos com frequência e raramente lidos, evitando poluir o cache',
          'Para dados lidos milhares de vezes logo depois de escritos, que precisam estar no cache',
          'Quando o banco de dados não existe',
          'Quando se quer que o cache seja a fonte da verdade'
        ], 'Write-around escreve no banco e só cacheia na leitura, poupando espaço no cache.'),
        mcq('q3', 'Uma chave popular expira e mil requisições vão ao banco ao mesmo tempo. Qual o problema e a mitigação?', 'd', [
          'Cache poisoning; assinar as respostas do cache',
          'Hot key; dividir o banco em vários shards para atender mais leituras',
          'Write-around; desligar o TTL definitivamente',
          'Cache stampede; single-flight, com só uma requisição recarregando'
        ], 'Single-flight faz um líder recarregar e os demais aguardarem o resultado, protegendo o banco.'),
        fill('q4', 'No Redis Cluster, a chave é mapeada a um slot por CRC16(chave) mod quantos slots?', 'slot = CRC16(chave) mod ___', ['16384'], 'O Redis Cluster tem 16384 slots, distribuídos entre os nós.'),
        mcq('q5', 'Por que somar um jitter aleatório ao TTL?', 'c', [
          'Para aumentar o tamanho máximo do cache',
          'Para dispensar totalmente o uso de qualquer invalidação por evento ou por TTL',
          'Para que chaves carregadas juntas não expirem todas ao mesmo tempo',
          'Para criptografar o valor guardado'
        ], 'Sem jitter, lotes de chaves com o mesmo TTL expiram juntos e causam picos no banco.'),
        mcq('q6', 'T1: lê cache (miss), lê banco = v1. T2: grava banco = v2 e apaga a chave. T1: grava cache = v1. Qual o resultado e a proteção?', 'a', [
          'Cache com v1 obsoleto até expirar; TTL e/ou chave versionada limitam o dano',
          'Cache fica com v2, o valor mais novo, e não há nada a corrigir depois',
          'O banco volta a v1 automaticamente, desfazendo por completo a escrita feita por T2',
          'Ocorre deadlock e as duas escritas são desfeitas'
        ], 'Essa corrida de cache-aside é real. TTL como rede de segurança e versão na chave reduzem o impacto.'),
        mcq('q7', 'Qual prática é mais adequada para cachear dados de perfil de usuário?', 'd', [
          'Chave com o e-mail do usuário e TTL de um ano',
          'Cachear em CDN compartilhada sem cabeçalhos de controle',
          'Guardar o documento (CPF) em texto claro, por conveniência da equipe de suporte',
          'Chave com id opaco, só campos necessários, TTL curto e acesso restrito'
        ], 'Minimização, chave sem dado pessoal, TTL curto e controle de acesso reduzem o risco.'),
        fill('q8', 'Qual valor de Cache-Control permite guardar a resposta só no navegador do usuário, e não em caches compartilhados?', 'Cache-Control: ___', ['private'], 'private impede que CDNs e proxies compartilhados armazenem uma resposta específica de um usuário.')
      ]
    },
    {
      id: 'cdi-26-balanceamento-service-discovery',
      title: 'Balanceamento e descoberta de serviços',
      goal: 'Entender como clientes encontram instâncias (DNS, registros), como o tráfego é distribuído (L4/L7, algoritmos) e como saúde e drenagem mantêm o sistema estável.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'DNS e registro de serviços',
            'O DNS traduz nomes em IPs e pode devolver vários (round-robin DNS), mas os clientes e resolvedores guardam a resposta pelo TTL: remover uma instância morta do DNS só surte efeito quando os caches expiram, e o DNS não sabe se a instância está saudável. Em ambientes dinâmicos (instâncias nascem e morrem a toda hora) usa-se um registro de serviços (Consul, etcd, Eureka): cada instância se registra ao subir, renova um heartbeat/lease e some do registro se parar; quem precisa de um serviço consulta o registro (diretamente ou via DNS interno).'
          ),
          sl(
            'Descoberta do lado do cliente vs do servidor',
            'LADO DO CLIENTE: o cliente consulta o registro, recebe a lista de instâncias e escolhe uma por conta própria (biblioteca embutida). Menos um salto de rede e sem balanceador central, porém a lógica fica em cada linguagem/cliente. LADO DO SERVIDOR: o cliente fala com um endereço estável (balanceador ou proxy), que consulta o registro e encaminha. O cliente fica simples; o balanceador vira componente a manter e escalar. Service mesh (Istio, Linkerd, em visão geral) move essa lógica para proxies sidecar ao lado de cada serviço, oferecendo descoberta, balanceamento, retries e mTLS sem mudar o código da aplicação.'
          ),
          sl(
            'Balanceamento L4 vs L7',
            'L4 (transporte) decide por IP e porta, sem ler o conteúdo: encaminha conexões TCP/UDP, é muito rápido e serve a qualquer protocolo, mas não enxerga HTTP. L7 (aplicação) entende o protocolo, como HTTP/gRPC: pode rotear por caminho (/api para um grupo, /static para outro), por cabeçalho ou cookie, terminar TLS, reescrever e balancear por requisição (importante com conexões longas multiplexadas, como HTTP/2, em que balancear por conexão deixaria uma instância com tudo). O custo é mais processamento por requisição.'
          ),
          sl(
            'Algoritmos de escolha',
            'ROUND-ROBIN: alterna entre as instâncias; simples, ignora carga. LEAST-REQUEST (menos requisições em andamento): envia à instância menos ocupada, bom com requisições de duração variável. POWER OF TWO CHOICES (p2c): sorteia 2 instâncias ao acaso e escolhe a menos carregada; evita olhar todas e equilibra bem melhor que o puro aleatório. CONSISTENT HASHING: a chave (usuário, URL) cai num anel; mudar o número de nós move só uma fração (~1/N) das chaves, ideal para caches e dados com afinidade. Com hash mod N, mudar N reembaralha quase tudo.',
            `import hashlib
def h(s): return int(hashlib.md5(s.encode()).hexdigest(), 16)
keys = [f'k{i}' for i in range(10000)]
moved = sum(h(k) % 4 != h(k) % 5 for k in keys)
print('modulo 4->5: movem', moved / len(keys))
# modulo 4->5: movem 0.7906
# (anel de hash consistente 4->5 nós, mesma simulação: ~0.21)`
          ),
          sl(
            'Health checks e drenagem',
            'O balanceador precisa saber quem está saudável. Health check ATIVO: sonda periodicamente cada instância (um GET /health) e a tira da rotação após falhas consecutivas. Health check PASSIVO (detecção de outliers): observa o tráfego real e ejeta temporariamente instâncias que devolvem erros ou estouram timeouts; reage a falhas que a sonda não vê. O ideal é combinar os dois. Na hora de remover uma instância (deploy, escala para baixo), faça a DRENAGEM de conexões: pare de enviar novas requisições e dê um prazo para as em andamento terminarem, antes de encerrar o processo.'
          ),
          sl(
            'Pequena simulação: p2c vs aleatório',
            'Para sentir a diferença, 10 000 requisições em 10 servidores (sem término das requisições, só contagem). O aleatório puro deixa o servidor mais carregado bem acima do ideal; p2c fica quase colado no ideal. Repare no custo: p2c só consulta 2 contadores, não todos.',
            `import random
rng = random.Random(1)
N, M = 10, 10000
rnd = [0]*N; p2 = [0]*N
for _ in range(M):
    rnd[rng.randrange(N)] += 1
    a, b = rng.sample(range(N), 2)          # dois candidatos
    p2[a if p2[a] <= p2[b] else b] += 1     # fica com o menos carregado
print('aleatorio max', max(rnd), 'p2c max', max(p2), 'ideal', M // N)
# aleatorio max 1043 p2c max 1001 ideal 1000`
          )
        ]
      },
      questions: [
        mcq('q1', 'Uma instância caiu e foi removida do DNS (TTL de 300 s). O que esperar?', 'd', [
          'Todos os clientes deixam de usá-la imediatamente, assim que o DNS é atualizado',
          'Nenhum cliente jamais volta a tentar o antigo IP',
          'Só clientes novos ainda usarão o IP antigo',
          'Clientes com a resposta em cache podem usar o IP morto até o TTL expirar'
        ], 'DNS é cacheado pelo TTL e não verifica saúde. Por isso se usa registro de serviços e health checks.'),
        mcq('q2', 'Qual descreve a descoberta do lado do cliente?', 'c', [
          'O cliente chama um IP fixo e um balanceador central escolhe a instância',
          'O DNS sempre decide a instância por sorteio',
          'O cliente consulta o registro e escolhe a instância por conta própria',
          'As instâncias enviam broadcast para todos os clientes'
        ], 'No lado do cliente, a lógica de escolha fica no cliente. No lado do servidor, fica em um balanceador/proxy.'),
        mcq('q3', 'Qual exigência força o uso de balanceamento L7 e não L4?', 'a', [
          'Rotear /api para um grupo de servidores e /static para outro',
          'Encaminhar conexões TCP de qualquer protocolo sem entender o conteúdo',
          'Alta vazão sem inspecionar conteúdo',
          'Distribuir por IP de origem e porta'
        ], 'Só L7 enxerga caminho, cabeçalhos e cookies do HTTP.'),
        fill('q4', 'No algoritmo power of two choices, quantas instâncias são sorteadas antes de escolher a menos carregada?', 'candidatos = random.sample(servidores, ___)', ['2', 'dois'], 'O nome diz: duas escolhas. Escolhe-se a de menor carga entre as duas.'),
        mcq('q5', 'No experimento, mod 4->5 moveu ~79% das chaves e o anel ~21%. O que isso indica?', 'b', [
          'Que o anel de hash consistente reembaralha mais chaves que o hash mod N',
          'Que o anel move uma fração pequena (~1/N), bom para caches',
          'Que os dois métodos movem a mesma quantidade',
          'Que hash mod N é mais estável ao mudar N'
        ], 'Ao adicionar um nó, o consistent hashing só realoca chaves que o novo nó assume, preservando o cache dos demais.'),
        mcq('q6', 'Qual é a vantagem do health check passivo?', 'c', [
          'Não observa o tráfego real, apenas sonda cada instância de longe, a cada intervalo',
          'Dispensa qualquer ação do balanceador',
          'Detecta erros e timeouts em requisições reais e ejeta a instância',
          'Garante que nenhuma instância ruim receba tráfego'
        ], 'O passivo vê falhas que a sonda ativa não vê (por exemplo, erros em um caminho específico). O ideal é combinar os dois.'),
        mcq('q7', 'Antes de desligar uma instância num deploy, qual prática evita requisições perdidas?', 'b', [
          'Matar o processo imediatamente e deixar que os clientes tentem de novo mais tarde',
          'Parar de enviar novas conexões e esperar as em andamento terminarem (drenagem)',
          'Aumentar o TTL do DNS para infinito',
          'Duplicar o tráfego para a instância que sai'
        ], 'Drenar significa tirar da rotação e conceder prazo às requisições em voo.'),
        fill('q8', 'Com hash mod N, uma chave de hash 13: com 4 servidores vai ao servidor 1 (13 mod 4). Para qual servidor vai com 5 servidores?', '13 % 4 = 1\n13 % 5 = ___   # a chave mudou de servidor', ['3', 'três', 'tres'], '13 mod 5 = 3: mudar N mudou o destino da chave, o que no cache vira um miss.')
      ]
    },
    {
      id: 'cdi-27-resiliencia-padroes',
      title: 'Padrões de resiliência',
      goal: 'Aplicar timeouts com deadline, retries seguros, circuit breaker, bulkhead, load shedding e rate limiting, evitando falhas em cascata e retry storms.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Timeouts e propagação de deadline',
            'Toda chamada remota precisa de timeout: sem ele, uma dependência lenta prende threads e conexões indefinidamente. O erro clássico são timeouts em cascata: o cliente espera 1 s, mas o serviço A espera 5 s por B, que espera 5 s por C; quando o cliente desiste, A, B e C continuam trabalhando para ninguém. A solução é um orçamento de tempo: o cliente define um deadline total e cada serviço passa adiante só o que sobrou, e para de trabalhar quando acaba.',
            `cliente (orçamento 1000 ms)
  A gasta 300 ms -> chama B com 700 ms restantes
    B gasta 400 ms -> chama C com 300 ms restantes
      C tem 300 ms; se faltar tempo, falha rápido`
          ),
          sl(
            'Retry com backoff, jitter e orçamento; idempotência',
            'Retentar ajuda em falhas transitórias, mas sem cuidado piora tudo. Backoff exponencial espaça as tentativas (0,1 s, 0,2 s, 0,4 s... com teto). Jitter adiciona aleatoriedade (por exemplo, esperar um valor sorteado entre 0 e o atraso), para clientes não retentarem sincronizados em ondas. Um orçamento de retries limita as retentativas a uma fração das requisições (ex.: no máximo 10% extra), de modo que uma falha geral não multiplique a carga. E só se retenta operação IDEMPOTENTE: um POST de pagamento retentado pode cobrar duas vezes; use uma chave de idempotência enviada pelo cliente, e o servidor devolve o resultado já registrado.',
            `delays = [min(30, 0.1 * 2**i) for i in range(10)]
print(delays)
# [0.1, 0.2, 0.4, 0.8, 1.6, 3.2, 6.4, 12.8, 25.6, 30]
# com jitter: espera = random.uniform(0, delays[i])`
          ),
          sl(
            'Circuit breaker',
            'O circuit breaker corta chamadas a uma dependência que está falhando, para poupá-la e falhar rápido. Estados: CLOSED (normal, chamadas passam; falhas são contadas); OPEN (após falhas demais, rejeita imediatamente sem chamar, por um tempo de espera); HALF-OPEN (passado o tempo, deixa passar uma chamada de teste: se der certo, volta a CLOSED; se falhar, volta a OPEN).',
            `# limite = 3 falhas, espera = 10 s
# 0 ValueError falhou closed
# 1 ValueError falhou closed
# 2 ValueError falhou open        <- 3a falha abre
# 3 RuntimeError circuito aberto open   <- rejeita sem chamar
# 12 ok closed                    <- apos 10 s: half-open, teste ok, fecha`
          ),
          sl(
            'Bulkhead, load shedding e rate limiting',
            'BULKHEAD (antepara de navio): isole recursos por dependência ou cliente (pools de threads/conexões separados), assim uma dependência lenta consome só o seu pool, e o resto segue funcionando. LOAD SHEDDING: sob sobrecarga, rejeite o excesso cedo e barato (HTTP 503), em vez de enfileirar tudo e responder tarde a todos; priorize o crítico. RATE LIMITING: limite quantas requisições por tempo cada cliente pode fazer. O token bucket tem balde com capacidade C que enche à taxa de R tokens/s; cada requisição gasta 1 token, e sem token é rejeitada. Permite rajadas de até C, mas média de R.',
            `class TokenBucket:
    def __init__(self, rate, cap): self.rate, self.cap, self.tokens, self.t = rate, cap, cap, 0.0
    def allow(self, now):
        self.tokens = min(self.cap, self.tokens + (now - self.t) * self.rate); self.t = now
        if self.tokens >= 1: self.tokens -= 1; return True
        return False
b = TokenBucket(rate=2, cap=3)
print([b.allow(0.0) for _ in range(5)])      # [True, True, True, False, False]
print(b.allow(0.5), b.allow(0.5))            # True False  (0,5 s * 2/s = 1 token)
print([b.allow(10.0) for _ in range(4)])     # [True, True, True, False]  (encheu até a capacidade)`
          ),
          sl(
            'Requisições hedged e degradação graciosa',
            'Hedged request: se a resposta não chegou no tempo da latência típica alta (por exemplo, o p95), envie uma segunda cópia a OUTRA réplica e use a primeira resposta que chegar, cancelando a outra. Reduz a latência de cauda ao custo de um pouco de carga extra; só para operações idempotentes. Degradação graciosa: quando uma dependência não essencial falha, o sistema continua com menos funcionalidade em vez de cair inteiro: sem o serviço de recomendações, mostra a lista padrão; sem o cache de preços, lê o banco mais devagar.'
          ),
          sl(
            'Falhas em cascata e retry storms',
            'Uma falha local vira geral por amplificação. Exemplo: 3 camadas em cadeia, cada uma com até 3 tentativas. Se a última camada está lenta, cada requisição do usuário gera 3 x 3 x 3 = 27 chamadas ao fundo da cadeia, justo quando ela já está sobrecarregada: uma retry storm que impede a recuperação. Defesas combinadas: retries só na camada mais externa (ou orçamento de retries), deadlines, circuit breakers, load shedding e backoff com jitter. Resiliência é um conjunto de padrões que se reforçam, nenhum resolve sozinho.',
            `camadas = 3
tentativas = 3
print(tentativas ** camadas)   # 27 chamadas no fundo por requisição`
          )
        ]
      },
      questions: [
        mcq('q1', 'O cliente tem orçamento de 1000 ms; A gasta 300 ms. Qual é a prática correta ao chamar B?', 'a', [
          'Passar adiante só os 700 ms restantes como deadline',
          'Dar a B um timeout fixo de 5000 ms por segurança extra',
          'Não passar prazo algum, pois B decide sozinho',
          'Reiniciar o orçamento em 1000 ms para B'
        ], 'Com deadline propagation, cada hop usa o que sobrou e para quando o cliente já desistiu.'),
        mcq('q2', 'Para que serve o jitter no backoff de retries?', 'b', [
          'Para aumentar o número total de tentativas',
          'Para evitar que muitos clientes retentem sincronizados, em ondas',
          'Para garantir que todas as tentativas usem exatamente o mesmo atraso fixo',
          'Para tornar a operação idempotente'
        ], 'Aleatoriedade espalha as retentativas no tempo e evita picos coordenados.'),
        mcq('q3', 'Por que retentar um POST de pagamento sem chave de idempotência é perigoso?', 'c', [
          'Porque o HTTP proíbe qualquer retentativa de POST',
          'Porque o servidor sempre recusa requisições repetidas, com erro de conflito 409 no cliente',
          'Se a resposta se perdeu depois de processar, a retentativa pode cobrar duas vezes',
          'Porque retentar diminui o tempo de resposta'
        ], 'Com chave de idempotência, o servidor reconhece a repetição e devolve o resultado original.'),
        fill('q4', 'Com rate=2 tokens/s, quantos tokens entram no balde em 0,5 s?', 'tokens_novos = 0.5 s * 2 tokens/s = ___', ['1', 'um', 'um token', '1 token'], '0,5 x 2 = 1 token. Por isso, depois de esvaziar o balde, uma requisição passa e a seguinte é rejeitada.'),
        mcq('q5', 'Um breaker está OPEN e o tempo de espera passou. O que acontece na próxima chamada?', 'd', [
          'Volta direto a CLOSED sem testar',
          'Continua OPEN para sempre, até que alguém reinicie manualmente o serviço',
          'Libera todas as chamadas de uma vez',
          'Vai a HALF-OPEN e testa com uma chamada; sucesso fecha, falha reabre'
        ], 'Half-open limita o risco: uma sonda decide se a dependência se recuperou.'),
        mcq('q6', 'Uma dependência lenta consome todas as threads compartilhadas e derruba endpoints que nem a usam. Qual padrão evita isso?', 'b', [
          'Circuit breaker em volta de todas as chamadas do sistema inteiro',
          'Bulkhead, com pools de recursos separados por dependência',
          'Retry sem limite até a dependência responder',
          'Aumentar o timeout para infinito'
        ], 'Bulkhead isola recursos. A falha de uma dependência fica contida no seu pool.'),
        mcq('q7', 'Qual afirmação descreve melhor uma requisição hedged?', 'a', [
          'Enviar uma segunda cópia a outra réplica após um tempo e usar a primeira resposta',
          'Enviar a mesma requisição a todas as réplicas ao mesmo tempo, sempre, desde o início',
          'Trocar o protocolo para UDP quando há lentidão',
          'Desistir da requisição no primeiro erro'
        ], 'Hedging reduz a latência de cauda, com custo extra de carga; vale só para operações idempotentes.'),
        fill('q8', '3 camadas, cada uma com até 3 tentativas: quantas chamadas chegam ao fundo da cadeia no pior caso?', 'tentativas ** camadas = 3 ** 3 = ___', ['27'], '3 x 3 x 3 = 27: a retry storm multiplica a carga justo quando o sistema está fraco.')
      ]
    },
    {
      id: 'cdi-28-microsservicos-comunicacao',
      title: 'Microsserviços e comunicação',
      goal: 'Definir limites de serviço, escolher comunicação síncrona ou assíncrona, evoluir contratos sem quebrar clientes e reconhecer o monolito distribuído.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Limites de serviço',
            'Um serviço deve corresponder a uma capacidade de negócio coesa (um contexto delimitado: pedidos, pagamentos, catálogo), e não a uma camada técnica ("serviço de banco", "serviço de validação"). Bons limites têm alta coesão (o que muda junto fica junto) e baixo acoplamento (poucas conversas entre serviços), e cada serviço é dono dos seus dados e do seu ciclo de deploy. Limites errados geram serviços "tagarelas", que se chamam o tempo todo e precisam ser alterados e implantados juntos.'
          ),
          sl(
            'Síncrono vs assíncrono e acoplamento temporal',
            'SÍNCRONO (REST, gRPC): o chamador espera a resposta; simples de raciocinar, mas os dois precisam estar no ar ao mesmo tempo (ACOPLAMENTO TEMPORAL) e a disponibilidade se multiplica: cadeia de serviços em série tem disponibilidade igual ao produto das disponibilidades. ASSÍNCRONO (eventos/filas): o produtor publica e segue; o consumidor processa quando puder. Reduz o acoplamento temporal e suaviza picos, ao custo de consistência eventual e depuração mais difícil. Regra prática: comandos que exigem resposta imediata (consultar) são síncronos; reações e propagação de fatos (pedido criado) são bons eventos.',
            `# 3 serviços em série, cada um com 99,9% de disponibilidade
print(0.999 ** 3)   # 0.997002999 -> cerca de 99,7%
print(0.9 ** 2)     # 0.81  (dois serviços de 90% -> 81%)`
          ),
          sl(
            'API gateway e BFF',
            'O API gateway é a porta de entrada única para clientes externos: roteia para os serviços, e centraliza autenticação, rate limiting, TLS e observabilidade. O BFF (Backend for Frontend) é uma variação: um backend sob medida para cada tipo de cliente (web, mobile), que agrega chamadas a vários serviços e entrega a resposta no formato que aquela interface precisa, evitando que o app móvel faça dezenas de chamadas ou receba campos que não usa. Cuidado para não colocar regra de negócio no gateway: ele vira um novo monolito.'
          ),
          sl(
            'Versionamento e compatibilidade de contratos',
            'Serviços e clientes evoluem em momentos diferentes, então o contrato (a API ou o esquema do evento) precisa evoluir de forma compatível. Mudanças compatíveis (para trás): adicionar campo opcional, adicionar endpoint novo. Mudanças que QUEBRAM: remover ou renomear campo, mudar tipo, tornar obrigatório um campo antes opcional. Princípios: leitor tolerante (ignore campos desconhecidos), campos novos opcionais com padrão, período de depreciação e, se necessário, versionar (/v2) e manter as duas por um tempo. Em eventos, use esquema versionado.',
            `v1: {"id": 7, "nome": "Caneta"}
v1.1 (compatível): {"id": 7, "nome": "Caneta", "cor": "azul"}   # campo novo, opcional
v2 (quebra):       {"id": 7, "titulo": "Caneta"}                # renomeou "nome"`
          ),
          sl(
            'Contract testing',
            'Como saber, antes do deploy, se uma mudança quebra um consumidor sem subir todos os serviços juntos num teste ponta a ponta lento e frágil? Contract testing: no modelo dirigido pelo consumidor (consumer-driven), cada cliente descreve o que espera (requisições e formato de resposta) e isso vira um contrato verificável; o provedor roda esses contratos no seu pipeline e falha o build se quebrar algum. Ferramentas como Pact seguem essa ideia. Complementa, não substitui, os testes de integração.'
          ),
          sl(
            'Dados por serviço, monolito distribuído e monolito modular',
            'Cada serviço tem seu próprio banco, acessado só por ele. Outros serviços pedem dados pela API ou mantêm cópias alimentadas por eventos, o que implica consistência eventual. Banco compartilhado entre serviços é o atalho que mais machuca: qualquer mudança de tabela afeta vários serviços. Monolito distribuído é o antipadrão em que há muitos serviços na rede, mas eles continuam acoplados (banco compartilhado, deploy conjunto, chamadas síncronas em cadeia): reúne a complexidade da rede sem os benefícios. Para equipes pequenas, domínio ainda incerto e baixa necessidade de escala independente, um monolito modular (módulos com fronteiras claras no mesmo deploy) costuma ser a melhor escolha, podendo ser dividido depois.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual critério é mais adequado para definir um limite de microsserviço?', 'c', [
          'Uma camada técnica, como "serviço de validação" para todo o sistema',
          'O tamanho do código: no máximo 100 linhas por serviço',
          'Uma capacidade de negócio coesa, dona dos seus dados',
          'O número de desenvolvedores disponíveis no momento'
        ], 'Limites por capacidade de negócio dão coesão e baixo acoplamento. Camadas técnicas geram serviços acoplados.'),
        mcq('q2', 'Qual destas mudanças de contrato QUEBRA clientes existentes?', 'd', [
          'Adicionar um campo opcional à resposta',
          'Adicionar um novo endpoint',
          'Adicionar um parâmetro de consulta opcional',
          'Renomear o campo "nome" para "titulo"'
        ], 'Remover ou renomear campos quebra consumidores. Adições opcionais são compatíveis.'),
        mcq('q3', 'Qual o papel de um BFF (Backend for Frontend)?', 'a', [
          'Um backend sob medida para um tipo de cliente, agregando chamadas',
          'Um banco de dados compartilhado entre todos os serviços de uma mesma empresa',
          'Um substituto para o contract testing',
          'Um protocolo de replicação entre regiões'
        ], 'O BFF adapta e agrega as chamadas para as necessidades de uma interface específica.'),
        fill('q4', 'Dois serviços síncronos em série, cada um com 90% de disponibilidade: qual a disponibilidade do conjunto (em fração)?', '0.9 * 0.9 = ___', ['0.81', '0,81', '81%', '81'], 'Em série, as disponibilidades se multiplicam: 0,9 x 0,9 = 0,81.'),
        mcq('q5', 'No contract testing dirigido pelo consumidor, o que acontece?', 'b', [
          'O provedor define sozinho o que os clientes podem usar',
          'Cada consumidor registra o que espera e o provedor verifica no pipeline',
          'Todos os serviços precisam subir juntos em um ambiente de teste completo e único',
          'Os contratos são verificados só em produção'
        ], 'Os contratos dos consumidores viram testes no provedor, que falha o build se quebrar alguém.'),
        mcq('q6', 'Vários "microsserviços" leem e escrevem nas mesmas tabelas e precisam ser implantados juntos. Como se chama esse antipadrão?', 'd', [
          'Strangler fig',
          'Saga orquestrada',
          'Cell-based architecture',
          'Monolito distribuído'
        ], 'Banco compartilhado e deploy conjunto mantêm o acoplamento, somando a complexidade da rede.'),
        mcq('q7', 'Em qual cenário um monolito modular é a melhor escolha?', 'c', [
          'Dezenas de equipes com necessidades de escala bem diferentes',
          'Componentes com linguagens e ciclos de release totalmente independentes entre si',
          'Equipe pequena, domínio ainda mudando e pouca necessidade de escala independente',
          'Quando se deseja o máximo de chamadas de rede entre componentes'
        ], 'O monolito modular entrega fronteiras claras sem o custo operacional de muitos serviços, e pode ser dividido depois.'),
        fill('q8', 'Publicar um evento "PedidoCriado" para quem quiser reagir reduz qual tipo de acoplamento, em que produtor e consumidor não precisam estar no ar juntos?', 'síncrono -> acoplamento temporal alto\nassíncrono (eventos) -> acoplamento ___ baixo', ['temporal'], 'Com mensageria, o consumidor pode processar depois, então não há dependência de disponibilidade simultânea.')
      ]
    },
    {
      id: 'cdi-29-kubernetes-sistema-distribuido',
      title: 'Kubernetes como sistema distribuído',
      goal: 'Ver o Kubernetes pelo lado de sistemas distribuídos: control plane, etcd e Raft, loop de reconciliação, scheduler, kubelet, falha de nós e eleição de líder.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Control plane e nós',
            'O Kubernetes tem um control plane (o cérebro) e nós de trabalho. No control plane: o API SERVER é a porta única, valida e grava objetos, e é o único componente que fala com o etcd; o ETCD é o banco chave-valor replicado por Raft que guarda todo o estado do cluster; o SCHEDULER escolhe em qual nó cada pod novo vai rodar; os CONTROLLERS (no controller-manager) mantêm o cluster como você declarou. Em cada nó roda o KUBELET, que recebe os pods designados ao seu nó e comanda o runtime de containers. Todos os componentes conversam via API server.'
          ),
          sl(
            'O loop de reconciliação',
            'O Kubernetes é declarativo: você registra o ESTADO DESEJADO ("3 réplicas desta aplicação") e os controllers rodam um loop eterno: observar o estado atual, comparar com o desejado e agir para reduzir a diferença. É por isso que o sistema é auto-recuperável: não importa o que causou o desvio (pod apagado, nó que caiu), o controller só enxerga "faltam 1" e cria. Cada controller é idempotente e nível-orientado (age sobre a diferença atual, não sobre o evento que a causou), o que o torna robusto a eventos perdidos.',
            `desejado = 3
atuais = ['p1', 'p2', 'p3']
# reconciliar():  diff = desejado - len(atuais); cria/remove conforme o sinal
# ok ['p1', 'p2', 'p3']
# (p2 some)  criou 1 -> ['p1', 'p3', 'p4']
# (desejado = 2)  removeu p4`
          ),
          sl(
            'Agendamento e kubelet',
            'O scheduler não inicia container algum: ele apenas decide e grava no pod "este vai para o nó X". Para decidir, FILTRA os nós inviáveis (sem CPU/memória livre, taints sem tolerância, regras de afinidade) e PONTUA os restantes para escolher o melhor. O kubelet do nó X observa a API, vê o pod designado a ele, pede ao runtime para criar os containers, roda as sondas de saúde e reporta o status. Se um container morre, o kubelet o reinicia conforme a política do pod.'
          ),
          sl(
            'Descoberta: Services e DNS',
            'Pods são efêmeros e mudam de IP. Um Service dá um nome DNS e um IP virtual estáveis a um conjunto de pods, escolhidos por rótulos. O cluster mantém a lista de endereços dos pods saudáveis (prontos) por trás do Service e o tráfego para o IP virtual é distribuído entre eles. É a descoberta de serviços do lado do servidor, nativa: o cliente só usa o nome do Service.'
          ),
          sl(
            'O que acontece quando um nó cai',
            'Cada kubelet envia sinais de vida periódicos. Quando um nó para de reportar, após um período de tolerância o controle de nós o marca como não pronto (NotReady) e, depois do prazo de tolerância dos pods, os pods dele são removidos/despejados. Aí os controllers dos Deployments veem "faltam réplicas" e criam novos pods em outros nós; Services retiram os endereços indisponíveis. Ou seja: a recuperação é automática, mas NÃO instantânea (há janelas de detecção e tolerância), e pods com estado exigem cuidado extra (volumes, StatefulSets).'
          ),
          sl(
            'Quórum do etcd e eleição de líder dos controllers',
            'O etcd usa Raft: uma escrita só é confirmada com a maioria dos membros. Quórum = n // 2 + 1. Com 3 membros, quórum 2: tolera 1 falha; com 5, quórum 3: tolera 2. Se o quórum se perde, o cluster não aceita mais escritas: o API server para de aceitar mudanças, mas os pods que já rodam continuam rodando nos nós (os kubelets seguem com o que já têm). Por isso o control plane é feito de réplicas (alta disponibilidade): várias instâncias do controller-manager e do scheduler, em que só uma ativa por vez, que ganha uma eleição de líder por um recurso de Lease (concessão renovada periodicamente); as outras ficam de standby, evitando que duas instâncias tomem ações conflitantes.',
            `membros = 5
quorum = membros // 2 + 1     # 3
tolera = membros - quorum     # 2`
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual componente do Kubernetes é o único a conversar diretamente com o etcd?', 'b', [
          'O kubelet de cada nó',
          'O API server',
          'O scheduler',
          'O kube-proxy'
        ], 'Todos os demais componentes passam pelo API server, que valida e grava no etcd.'),
        mcq('q2', 'Um Deployment pede 3 réplicas e alguém apaga um pod manualmente. O que ocorre?', 'c', [
          'Nada: o cluster fica com 2 réplicas para sempre',
          'O etcd restaura o pod apagado diretamente',
          'O controller vê que faltam réplicas em relação ao desejado e cria outro pod',
          'O kubelet pede permissão ao administrador do cluster antes de recriá-lo manualmente'
        ], 'O loop de reconciliação compara desejado (3) com observado (2) e corrige a diferença.'),
        mcq('q3', 'Qual é o papel do scheduler?', 'd', [
          'Iniciar os containers dentro do nó',
          'Guardar o estado do cluster em disco',
          'Distribuir o tráfego de rede entre pods, escolhendo o pod de destino',
          'Escolher o nó de cada pod novo, filtrando e pontuando nós'
        ], 'O scheduler só decide o nó. Quem sobe os containers é o kubelet.'),
        fill('q4', 'Um cluster etcd com 5 membros precisa de quórum de 3. Quantas falhas de membros ele tolera?', 'membros = 5\nquorum = membros // 2 + 1\ntolera = membros - quorum   # ___', ['2', 'duas', 'dois'], '5 - 3 = 2 falhas toleradas; com 3 membros seria 1.'),
        mcq('q5', 'Um nó para de reportar ao control plane. Qual é o comportamento esperado?', 'a', [
          'Após os prazos de tolerância, os pods são recriados em outros nós, sem ser instantâneo',
          'Os pods são recriados em outros nós no mesmo milissegundo',
          'Nada acontece, e as réplicas ficam perdidas até alguém intervir manualmente no cluster',
          'O etcd é reiniciado para reavaliar o nó'
        ], 'A detecção de falha precisa de tempo para evitar falsos positivos; depois os controllers recriam as réplicas.'),
        mcq('q6', 'Por que o controller-manager, ao rodar em várias réplicas, usa eleição de líder?', 'c', [
          'Para dividir o etcd em várias partes',
          'Para que todas as réplicas atuem ao mesmo tempo e ganhem mais velocidade',
          'Para que só uma instância aja por vez, evitando ações conflitantes',
          'Para dispensar o loop de reconciliação'
        ], 'Uma instância mantém o Lease; se falhar, outra assume.'),
        mcq('q7', 'Um etcd de 3 membros perde 2 deles. O que acontece com o cluster?', 'b', [
          'Continua aceitando escritas normalmente com 1 membro',
          'Perde o quórum: sem novas escritas, mas os pods em execução continuam',
          'Todos os pods são imediatamente encerrados pelos kubelets de cada um dos nós',
          'O Raft reduz o quórum para 1 automaticamente'
        ], 'Sem maioria, não há commits no Raft. O plano de dados já em execução não depende de novas escritas.'),
        fill('q8', 'O loop de cada controller observa o estado atual e o compara com qual estado, registrado pelo usuário?', 'diff = ___ - len(atuais)   # (estado desejado) menos o observado', ['desejado', 'estado desejado'], 'Declarativo: você registra o desejado; o controller trabalha para a diferença desaparecer.')
      ]
    },
    {
      id: 'cdi-30-escalabilidade-pratica',
      title: 'Escalabilidade na prática',
      goal: 'Dimensionar sistemas com a lei de Little, Amdahl e USL, escolher entre escalar vertical ou horizontalmente e testar carga sem cair na omissão coordenada.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Vertical vs horizontal e sistemas sem estado',
            'Escala VERTICAL: máquina maior (mais CPU/RAM); simples, sem mudar a aplicação, mas tem teto, custo crescente e um único ponto de falha. Escala HORIZONTAL: mais máquinas; sem teto prático e com redundância, mas exige que o trabalho seja distribuível. O que viabiliza isso é ser SEM ESTADO (stateless): nenhuma instância guarda dado do usuário que outra precise. Sessões, arquivos e filas ficam em armazenamentos externos (cache, banco, fila). Então qualquer instância atende qualquer requisição, e instâncias viram descartáveis: criar e destruir é trivial.'
          ),
          sl(
            'Autoescala e planejamento de capacidade',
            'Autoescala adiciona/remove instâncias conforme uma métrica. A métrica deve refletir o gargalo real: CPU para trabalho intensivo de CPU; requisições por instância ou latência para serviços web; tamanho ou atraso (lag) da fila para consumidores de fila, onde a CPU pode estar baixa e a fila cheia. Use janelas de estabilização (cooldown) para não oscilar e lembre que subir instância leva tempo: o planejamento de capacidade mantém folga (headroom) para picos e para a perda de uma zona, baseado em dados de uso real e crescimento esperado.'
          ),
          sl(
            'Lei de Little',
            'L = λ × W: o número médio de itens em andamento no sistema (L) é igual à taxa de chegada (λ) vezes o tempo médio que cada um passa no sistema (W). Vale para qualquer sistema estável, sem suposições sobre distribuição. Serve para dimensionar: se chegam 200 req/s e cada uma leva 0,05 s, há em média 10 requisições simultâneas; se uma instância suporta 5 simultâneas, são necessárias ao menos 2. Também mostra que latência maior com a mesma vazão significa mais requisições presas (mais conexões, threads e memória).',
            `lam = 200      # req/s
W = 0.05       # s
print(lam * W)                  # 10.0 requisições em andamento
print(300 * 0.2, 300 * 0.2 / 20)   # 60.0 em andamento; 3.0 instâncias de 20 simultâneas`
          ),
          sl(
            'Amdahl e Lei de Escalabilidade Universal',
            'Amdahl: se uma fração p do trabalho é paralelizável, o speedup com n processadores é 1 / ((1-p) + p/n). A parte serial (1-p) impõe um teto: com 10% serial, nunca passa de 10x, por mais máquinas que se somem. A Lei de Escalabilidade Universal (USL) acrescenta o custo de coerência/comunicação entre nós (sincronizar, manter dados consistentes), que cresce com n; por isso, depois de certo ponto, adicionar nós REDUZ a vazão. Mensagem prática: o desempenho não escala de graça; meça e ache o ponto de retorno decrescente.',
            `def amdahl(p, n): return 1 / ((1 - p) + p / n)
print(round(amdahl(0.9, 10), 2), round(amdahl(0.9, 100), 2), 1 / 0.1)
# 5.26 9.17 10.0   (teto = 1 / fração serial)`
          ),
          sl(
            'Gargalos típicos e custo',
            'Onde o sistema trava primeiro: o BANCO (escritas num primário, consultas sem índice), LOCKS e seções críticas (a parte serial de Amdahl: contenção por linha, por mutex), FILAS (produtores mais rápidos que consumidores e backlog crescente) e REDE (largura de banda, número de conexões, chamadas em cadeia). A regra: ache o gargalo atual com métricas (utilização, saturação, filas), resolva-o e meça de novo, pois o gargalo se move. Escalar tem custo: mais capacidade ociosa para absorver picos, mais complexidade operacional e mais gasto; o objetivo é atender o requisito (latência, vazão) pelo menor custo razoável.'
          ),
          sl(
            'Teste de carga e omissão coordenada',
            'Testes de carga medem latência e vazão sob demanda controlada, em ambiente representativo e com dados sintéticos. Armadilha: a OMISSÃO COORDENADA. Muitos geradores enviam a próxima requisição só quando a anterior responde; se o servidor trava por 10 s, o gerador também para de enviar e registra poucas medidas lentas, subestimando a latência que usuários reais, que continuam chegando, sentiriam. Correção: gerar carga em taxa fixa (modelo aberto), medir a latência a partir do instante em que a requisição deveria ter sido enviada e usar ferramentas que corrigem o efeito.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que guardar a sessão do usuário na memória local de cada instância dificulta escalar horizontalmente?', 'd', [
          'Porque memória local é sempre mais lenta que disco',
          'Porque o balanceador não funciona com mais de uma instância',
          'Porque cada instância precisaria de um banco de dados próprio e de um balanceador',
          'Porque o usuário precisa voltar à mesma instância; externalizar o estado resolve'
        ], 'Sem estado local, qualquer instância atende qualquer requisição e pode ser criada ou destruída livremente.'),
        mcq('q2', 'Chegam 300 req/s, cada uma leva em média 0,2 s e uma instância suporta 20 simultâneas. Quantas instâncias, no mínimo?', 'a', [
          '3',
          '6',
          '15',
          '60'
        ], 'L = 300 x 0,2 = 60 em andamento; 60 / 20 = 3 instâncias (mais folga na prática).'),
        mcq('q3', 'Se 20% do trabalho é inerentemente serial, qual o speedup máximo (Amdahl) com infinitos processadores?', 'b', [
          '2x',
          '5x',
          '20x',
          'Ilimitado'
        ], 'O teto é 1 / fração serial = 1 / 0,2 = 5.'),
        fill('q4', 'Pela lei de Little, quantas requisições estão em andamento com λ = 100 req/s e W = 0,08 s?', 'L = 100 * 0.08 = ___', ['8', '8.0', '8,0'], 'L = λ x W = 100 x 0,08 = 8.'),
        mcq('q5', 'O que a Lei de Escalabilidade Universal acrescenta a Amdahl?', 'c', [
          'Que escalar horizontalmente é sempre linear até o limite da rede',
          'Que só a contenção por locks importa',
          'O custo de coerência entre nós, que pode derrubar a vazão',
          'Que a latência é constante independente da carga'
        ], 'Com custo de comunicação/coerência crescente, adicionar nós acima de um ponto prejudica.'),
        mcq('q6', 'Um consumidor de fila está com CPU baixa, mas a fila só cresce. Qual métrica de autoescala é mais adequada?', 'a', [
          'Tamanho ou atraso (lag) da fila',
          'CPU média de todas as instâncias do grupo',
          'Memória livre do nó',
          'Quantidade atual de instâncias'
        ], 'A autoescala deve seguir o gargalo real. Aqui, o backlog da fila.'),
        mcq('q7', 'O gerador de carga só envia a próxima requisição após a resposta e o servidor trava por 10 s. O que o teste subestima?', 'd', [
          'A vazão máxima do banco de dados',
          'O número de instâncias necessárias na rede para sustentar a taxa de chegada do teste',
          'O uso de memória do gerador de carga',
          'A latência vista pelos usuários, pois as requisições do período não foram medidas'
        ], 'Isso é omissão coordenada. Use taxa fixa e meça a partir do instante em que a requisição deveria ter saído.'),
        fill('q8', 'Com 10% do trabalho serial, qual o speedup máximo (n tendendo ao infinito)?', 'teto = 1 / 0.1 = ___', ['10', '10.0', '10x'], 'O teto de Amdahl é 1 / fração serial = 10.')
      ]
    },
    {
      id: 'cdi-31-observabilidade-distribuida',
      title: 'Observabilidade distribuída',
      goal: 'Usar tracing distribuído, métricas, logs correlacionados e SLOs para entender sistemas distribuídos, sem vazar dados pessoais na telemetria.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Tracing distribuído: trace, span e propagação de contexto',
            'Uma requisição atravessa vários serviços; um TRACE é a história completa dela, formado por SPANS: cada span é uma operação com início, duração e um span pai (a chamada que a originou), formando uma árvore. Para ligar spans de serviços diferentes, o contexto é propagado nas chamadas, em cabeçalhos. O padrão W3C é o cabeçalho traceparent: versão-trace_id-parent_id-flags. O trace_id (mesmo em todos os serviços do trace) identifica a requisição; o parent_id muda a cada salto, apontando para o span que fez a chamada; os flags indicam, entre outros, se foi amostrado.',
            `traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
#            ver  trace_id (32 hex)                parent_id (16 hex) flags`
          ),
          sl(
            'Amostragem e OpenTelemetry',
            'Guardar 100% dos traces é caro. Amostragem escolhe quais manter. HEAD sampling decide no início (ex.: 1%, ao acaso): barato, mas pode jogar fora justamente os traces com erro. TAIL sampling decide só depois que o trace termina, e permite manter todos os com erro ou lentos; exige guardar os spans temporariamente. OpenTelemetry (OTel) é o padrão aberto e independente de fornecedor para gerar e exportar traces, métricas e logs: APIs e SDKs por linguagem e o Collector, que recebe, processa (filtra, remove dados sensíveis, amostra) e envia a qualquer backend.'
          ),
          sl(
            'Métricas RED e USE',
            'Métricas são números agregados ao longo do tempo, baratas e boas para alertas. RED, para serviços (visão do usuário): Rate (requisições por segundo), Errors (taxa de erros) e Duration (distribuição da latência). USE, para recursos (CPU, disco, fila, pool): Utilization (percentual ocupado), Saturation (trabalho esperando, fila) e Errors. Juntas respondem "o serviço está bem?" (RED) e "qual recurso está limitando?" (USE).'
          ),
          sl(
            'Histogramas e percentis: agregar percentis é errado',
            'Média esconde a cauda; por isso se usam percentis (p95: 95% das requisições foram mais rápidas que isso). Mas percentis NÃO se agregam: a média dos p95 de várias instâncias não é o p95 do conjunto. Instância A: 100 requisições, 10 delas lentas (p95 = 500 ms). Instância B: 900 requisições rápidas (p95 = 10 ms). Média dos p95: 255 ms. O p95 real do total (1000 requisições, só 1% lentas) é 10 ms. A solução: cada instância exporta um histograma (contagens por faixa de latência), que SE soma, e o percentil é calculado sobre o histograma agregado.',
            `def p95(xs):
    xs = sorted(xs); return xs[int(0.95 * len(xs)) - 1]
a = [10]*90 + [500]*10
b = [10]*900
print(p95(a), p95(b), (p95(a) + p95(b)) / 2, p95(a + b))
# 500 10 255.0 10`
          ),
          sl(
            'Logs estruturados e SLI/SLO/orçamento de erro',
            'Logs estruturados (JSON com campos) são pesquisáveis; inclua o trace_id e o span_id em cada linha para ir do trace ao log da mesma requisição. SLI é uma medida (ex.: % de requisições bem-sucedidas em menos de 300 ms); SLO é a meta (99,9% em 30 dias); o orçamento de erro é o que o SLO permite falhar: 0,1% de 30 dias = 43,2 minutos de indisponibilidade. Enquanto há orçamento, equipes podem lançar mudanças; quando acaba, prioriza-se a confiabilidade. Alertas úteis são baseados em sintomas que o usuário sente e na velocidade de consumo do orçamento (burn rate), não em cada pico de CPU.',
            `minutos = 30 * 24 * 60          # 43200
print(minutos * (1 - 0.999))    # 43.2`
          ),
          sl(
            'Privacidade em telemetria (LGPD)',
            'Traces, logs e métricas são um dos lugares onde dados pessoais mais vazam sem ninguém ver: um parâmetro de URL com e-mail, um corpo de requisição logado, um atributo de span com documento. Boas práticas: não registre dados pessoais nem segredos (tokens, senhas); use identificadores opacos ou pseudonimizados do usuário; filtre/mascare no Collector e nos clientes; limite a cardinalidade e o corpo de requisições coletado; defina retenção curta e controle de acesso à telemetria; e lembre que, se há dado pessoal, o pedido de eliminação alcança a telemetria também. Princípio: se não precisa para operar, não colete.'
          )
        ]
      },
      questions: [
        mcq('q1', 'No cabeçalho traceparent 00-4bf92f35...-00f067aa...-01, qual campo muda a cada salto, apontando para o span que fez a chamada?', 'a', [
          'O terceiro campo (parent_id)',
          'O segundo campo (trace_id), fixo no trace',
          'O primeiro campo (versão)',
          'O quarto campo (flags)'
        ], 'O trace_id é fixo no trace todo; o parent_id é o id do span chamador e muda a cada serviço.'),
        mcq('q2', 'Para manter sempre os traces com erro ou muito lentos, qual amostragem é adequada?', 'd', [
          'Head sampling de 1% ao acaso',
          'Nenhuma amostragem, descartando tudo',
          'Amostrar apenas o primeiro serviço da cadeia de chamadas',
          'Tail sampling, decidindo após o trace completo'
        ], 'Só depois de ver o trace inteiro dá para saber se houve erro ou lentidão.'),
        mcq('q3', 'O que significa RED nas métricas de um serviço?', 'c', [
          'Recursos, escalonamento e disponibilidade do serviço',
          'Utilização, saturação e erros',
          'Taxa de requisições, erros e duração (latência)',
          'Réplicas, entregas e dados'
        ], 'RED mede o serviço pela ótica do usuário. Utilização/saturação/erros é o USE, dos recursos.'),
        fill('q4', 'Um SLO de 99,9% em 30 dias (43 200 minutos) permite quantos minutos de falha (orçamento de erro)?', '43200 * (1 - 0.999) = ___ minutos', ['43.2', '43,2'], '0,1% de 43 200 minutos = 43,2 minutos.'),
        mcq('q5', 'p95 da instância A = 500 ms, da B = 10 ms, a média dos p95 = 255 ms, mas o p95 real do total = 10 ms. Qual a conclusão?', 'd', [
          'A média dos p95 é uma boa aproximação do p95 global',
          'A instância B está medindo errado',
          'O p95 real deve sempre coincidir com o maior p95',
          'Percentis não se agregam por média; some histogramas e calcule o percentil depois'
        ], 'Histogramas somam; percentis calculados não. Esse é o motivo de exportar histogramas.'),
        mcq('q6', 'Qual linha de log é mais adequada em um sistema distribuído com a LGPD em mente?', 'b', [
          'Falha no login de ana@example.com com a senha informada',
          '{"nivel":"erro","trace_id":"4bf92f35","usuario":"u-8f3a","evento":"pagamento_recusado"}',
          'Erro ao processar pedido (texto livre, sem identificadores)',
          'Token <valor> rejeitado para o cliente, repassado em texto claro'
        ], 'Estruturado, com trace_id para correlação e usuário pseudonimizado, sem e-mail, senha ou token.'),
        mcq('q7', 'Qual alerta é mais útil para uma equipe de plantão?', 'b', [
          'CPU acima de 70% em qualquer nó, a qualquer momento',
          'Taxa de erro que consome o orçamento de erro em ritmo acelerado, afetando usuários',
          'Qualquer log de nível aviso emitido por qualquer serviço',
          'Disco de um ambiente de teste chegando a 50%'
        ], 'Alertas baseados em sintomas para o usuário e na velocidade de queima do orçamento evitam fadiga de alertas.'),
        fill('q8', 'Para agregar latência entre instâncias, cada uma exporta qual estrutura, com contagens por faixa de valores?', 'cada instância exporta um ___ ; soma-se e calcula-se o percentil', ['histograma', 'histogram'], 'Histogramas são somáveis; percentis já calculados não são.')
      ]
    },
    {
      id: 'cdi-32-testes-chaos',
      title: 'Testes de sistemas distribuídos',
      goal: 'Testar sistemas distribuídos com integração, injeção de falhas, engenharia do caos, Jepsen e simulação determinística, sempre em ambientes seguros.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que testes unitários não bastam',
            'Testes unitários verificam a lógica de um componente isolado. Os defeitos de sistemas distribuídos aparecem na interação: mensagens atrasadas, duplicadas ou fora de ordem, falhas parciais (um nó cai no meio de uma operação), timeouts que escondem se a operação ocorreu e entrelaçamentos raros de eventos concorrentes. Por isso há testes de integração com dependências reais (banco, fila) que sobem em containers descartáveis (docker compose, ou bibliotecas como Testcontainers), e testes que provocam falhas de propósito.',
            `# integração: sobe dependências reais e descartáveis
docker compose -f compose.teste.yml up -d --wait
pytest tests/integracao
docker compose -f compose.teste.yml down -v`
          ),
          sl(
            'Injeção de falhas',
            'Injetar falha é provocar, de forma controlada, o que a produção causará um dia: LATÊNCIA (atrasar respostas), PERDA de pacotes ou de mensagens, PARTIÇÃO de rede (bloquear tráfego entre dois grupos de nós), erros HTTP 5xx, e MORTE de processos ou nós. Ferramentas: proxies de falha (como o Toxiproxy), controle de tráfego do Linux (tc/netem), e matar containers ou pods. O objetivo é verificar se timeouts, retries, circuit breakers e failover realmente se comportam como projetado.'
          ),
          sl(
            'Engenharia do caos',
            'Engenharia do caos é experimento científico com falhas. Passos: (1) defina a HIPÓTESE DE ESTADO ESTÁVEL, uma métrica de negócio que mostra o sistema saudável (pedidos por minuto, taxa de erro); (2) formule a hipótese ("matar uma réplica não altera o estado estável"); (3) limite o RAIO DE EXPLOSÃO (uma instância, uma pequena fração do tráfego); (4) tenha condições de ABORTAR e reverter; (5) execute, observe e aprenda; (6) corrija. Game days são exercícios planejados em que a equipe provoca e responde a falhas juntas, treinando também a resposta humana.'
          ),
          sl(
            'Jepsen',
            'Jepsen é uma abordagem (e um conjunto de ferramentas) de teste de bancos e sistemas distribuídos: executa operações concorrentes de vários clientes, injeta falhas (partições, relógios, quedas de nós), registra o histórico completo do que cada cliente fez e viu e verifica se esse histórico é compatível com o modelo de consistência prometido (por exemplo, linearizabilidade). Já encontrou violações de garantias em vários sistemas conhecidos. A lição: não basta confiar na documentação, é preciso testar as garantias sob falhas.'
          ),
          sl(
            'Testes de propriedades e simulação determinística',
            'Em vez de exemplos fixos, testes de propriedades geram muitas entradas aleatórias e conferem invariantes ("depois de qualquer sequência de operações, nenhuma conta fica negativa"); se falham, reduzem a entrada ao menor caso. A simulação determinística leva isso aos sistemas distribuídos: rede, relógio e falhas são simulados a partir de uma SEMENTE (seed) do gerador aleatório, então qualquer bug achado pode ser reproduzido exatamente com a mesma semente, resolvendo a maior dor do teste distribuído, que é o bug que só acontece às vezes.',
            `import random
def simular(semente):
    rng = random.Random(semente)
    return [i for i in range(10) if rng.random() > 0.3]   # quais mensagens chegaram
print(simular(42))
print(simular(42) == simular(42), simular(42) == simular(7))
# [0, 4, 5, 6, 8]
# True False`
          ),
          sl(
            'Ambientes seguros e dados de teste',
            'Nunca faça caos em produção sem preparo e autorização: comece em ambientes de teste; só vá à produção quando houver observabilidade madura, planos de reversão, raio de explosão pequeno, aprovação formal e aviso às equipes e à operação. Fora de horário crítico e com botão de abortar. E por privacidade (LGPD): ambientes de teste não devem conter dados reais de clientes. Use dados sintéticos ou fictícios; cópias de produção em teste ampliam a superfície de vazamento e fogem da finalidade original do tratamento.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que testes unitários não bastam para sistemas distribuídos?', 'c', [
          'Porque são lentos demais para rodar no pipeline',
          'Porque não existem para linguagens modernas',
          'Porque falhas parciais, atrasos e ordens de mensagens só surgem com várias partes interagindo',
          'Porque substituem totalmente os testes de integração'
        ], 'O comportamento distribuído emerge da interação. Testes isolados não o exercitam.'),
        mcq('q2', 'Qual experimento testa a tolerância a uma partição de rede?', 'b', [
          'Aumentar o uso de CPU de um nó',
          'Bloquear o tráfego entre dois grupos de nós',
          'Adicionar mais linhas de log em toda a aplicação',
          'Trocar a versão do compilador'
        ], 'Uma partição separa grupos de nós que não conseguem mais se comunicar.'),
        mcq('q3', 'Qual é o primeiro passo de um experimento de engenharia do caos?', 'a', [
          'Definir a hipótese de estado estável com métricas de negócio',
          'Derrubar o serviço em produção para ver o que acontece de verdade',
          'Escolher o maior raio de explosão possível',
          'Desativar os alertas para não atrapalhar'
        ], 'Sem uma linha de base de estado estável não há como saber se o experimento a violou.'),
        fill('q4', 'Qual valor inicial do gerador aleatório torna uma simulação reproduzível?', 'rng = random.Random(___)   # mesma sequência para o mesmo valor', ['seed', 'semente'], 'A semente (seed) permite reproduzir exatamente a mesma execução simulada.'),
        mcq('q5', 'O que o Jepsen faz?', 'd', [
          'Mede apenas a vazão de um banco',
          'Verifica a sintaxe SQL das consultas',
          'Faz backup periódico das réplicas',
          'Executa operações concorrentes com falhas e checa o histórico contra um modelo de consistência'
        ], 'Ele compara o que os clientes observaram com o que o modelo (por exemplo, linearizabilidade) permite.'),
        mcq('q6', 'Uma equipe quer testar a queda de nós em produção. Qual conduta é a correta?', 'b', [
          'Fazer em pico de tráfego para ser mais realista',
          'Só com preparo e autorização, raio pequeno, monitoramento e botão de abortar',
          'Fazer sem avisar, para testar a reação',
          'Desligar a observabilidade para não gerar ruído'
        ], 'Caos é controlado: começa em teste e, em produção, exige maturidade, aprovação e capacidade de reverter.'),
        mcq('q7', 'Qual é o conjunto de dados mais adequado para um ambiente de testes?', 'a', [
          'Dados sintéticos ou fictícios',
          'Uma cópia integral do banco de produção',
          'Um dump com e-mails reais de clientes',
          'Dados reais com apenas o nome mascarado'
        ], 'Dados reais em teste ampliam o risco de vazamento. Sintéticos cumprem o objetivo sem expor pessoas.'),
        fill('q8', 'Antes de injetar falhas, define-se a hipótese de estado ___ (o comportamento normal medido).', 'hipótese de estado ___', ['estável', 'estavel', 'steady'], 'Hipótese de estado estável: a métrica que mostra o sistema saudável e serve de referência.')
      ]
    },
    {
      id: 'cdi-40-laboratorio-injecao-falhas-rede',
      title: 'Laboratório: injeção de falhas de rede',
      goal: 'Simular atraso, perda, partições e processos travados em ambiente próprio e isolado, e observar falsos positivos da detecção de falhas.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que provocar falhas de propósito, e onde',
            'A rede de um sistema distribuído falha de formas que o ambiente de desenvolvimento nunca mostra: pacotes perdidos, atrasados, duplicados ou entregues fora de ordem; conexões cortadas; nós que ficam lentos sem morrer. Se você nunca viu o seu sistema sob esses defeitos, descobre como ele se comporta no pior momento. A INJEÇÃO DE FALHAS cria esses defeitos de propósito, de forma controlada. REGRA DE SEGURANÇA E ÉTICA: faça isso SOMENTE em ambiente seu e isolado (máquina própria, VM ou containers de laboratório), NUNCA em produção, NUNCA em rede de terceiros ou compartilhada com outras pessoas, e NUNCA com dados reais (use dados fictícios). Degradar a rede errada pode derrubar colegas, clientes ou serviços que não são seus, e pode ter consequências legais.',
            '# Checklist antes de injetar falha\n# [ ] ambiente é meu e isolado (VM ou containers de laboratório)\n# [ ] dados são fictícios\n# [ ] sei desfazer a falha (comando de remoção) antes de aplicá-la\n# [ ] escrevi a hipótese do que vou observar'
          ),
          sl(
            'Atraso, perda, duplicação e reordenação com tc/netem',
            'No Linux, o comando tc (traffic control) com a disciplina de fila netem emula uma rede ruim na interface escolhida. Ele atua nos pacotes que SAEM por aquela interface. Exemplos: `delay 100ms` adiciona atraso; `loss 5%` descarta parte dos pacotes; `duplicate 1%` duplica; `reorder 25% 50%` reordena (precisa de um atraso configurado, pois reordenar é entregar alguns pacotes antes de outros atrasados). Para desfazer, remova a disciplina. Alterar a fila exige privilégio (root ou capacidade NET_ADMIN). Em Windows, use WSL2 ou uma VM Linux/containers. Atenção: NÃO dê privilégios amplos a containers por conveniência (por exemplo, o modo privilegiado). Se precisar de tc dentro de um container, conceda apenas a capacidade NET_ADMIN necessária, apenas nele, e apenas em um laboratório isolado; melhor ainda é aplicar o tc do lado de fora, no namespace de rede do container, ou usar um proxy de falhas.',
            '# Em uma VM/container de laboratório Linux (privilégio necessário):\ntc qdisc add dev eth0 root netem delay 100ms loss 5%\ntc qdisc show dev eth0\n#   qdisc netem ... limit ... delay 100ms loss 5%     (saída pode variar)\n\n# outras variações:\n#   ... netem delay 50ms 20ms           (atraso com variação/jitter)\n#   ... netem duplicate 1%\n#   ... netem delay 10ms reorder 25% 50%\n\n# desfazer:\ntc qdisc del dev eth0 root'
          ),
          sl(
            'Proxies de falha, partições e processos travados',
            'Nem sempre você quer mexer na rede do host. Um PROXY DE FALHAS, como o Toxiproxy, fica entre o cliente e o serviço e injeta "toxics": latência, corte de conexão, timeout (a conexão fica aberta sem dados), banda limitada. Ele afeta só o tráfego que passa pelo proxy, o que é mais seguro e preciso. PARTIÇÕES com containers: `docker network disconnect <rede> <container>` desconecta o container da rede (os outros deixam de alcançá-lo) e `docker network connect <rede> <container>` reconecta. PROCESSOS TRAVADOS: `kill -STOP <pid>` suspende um processo (ele não morre: continua com conexões abertas, mas não responde) e `kill -CONT <pid>` o retoma; em containers, `docker pause <container>` e `docker unpause <container>` fazem algo equivalente. Isso reproduz o caso mais traiçoeiro: o nó lento ou congelado que parece morto mas volta. Também se pode simular um RELÓGIO com salto (adiantar ou atrasar a hora de um nó), mas aqui só como conceito: serve para testar expiração de lease, tokens e ordenação por timestamp.',
            '# partição de um nó (containers de laboratório):\ndocker network disconnect <rede-lab> <container-b>\n# ... observar o comportamento dos outros nós ...\ndocker network connect <rede-lab> <container-b>\n\n# nó congelado (não morto):\ndocker pause <container-b>\ndocker unpause <container-b>\n\n# processo comum no Linux:\nkill -STOP <pid>     # suspende\nkill -CONT <pid>     # retoma'
          ),
          sl(
            'Simulador: detecção de falhas com perda e atraso',
            'Para entender o efeito sem mexer em rede nenhuma, simule. Três nós, todos VIVOS, enviam heartbeats uns aos outros a cada tick. Cada heartbeat pode ser perdido (probabilidade de perda) ou chegar com atraso aleatório. Cada receptor suspeita de um remetente se passam mais de "timeout" ticks sem ouvir nada dele. Como todos os nós estão vivos, TODA suspeita é um falso positivo. O resultado mostra o dilema da detecção de falhas: timeout curto detecta rápido mas erra mais com rede ruim; timeout longo erra menos mas demora mais para detectar uma falha real.',
            `import random

def simula(perda, atraso_max, timeout, ticks=200, seed=1):
    rng = random.Random(seed)
    nos = ['A', 'B', 'C']
    chegadas = []   # (tick_de_chegada, origem, destino)
    visto = {(o, d): 0 for o in nos for d in nos if o != d}
    suspeitas = 0
    suspeito = {k: False for k in visto}
    for t in range(1, ticks + 1):
        for o in nos:
            for d in nos:
                if o != d and rng.random() >= perda:
                    chegadas.append((t + rng.randint(0, atraso_max), o, d))
        for c in [c for c in chegadas if c[0] == t]:
            visto[(c[1], c[2])] = t
            suspeito[(c[1], c[2])] = False
        for k in visto:
            if t - visto[k] > timeout and not suspeito[k]:
                suspeito[k] = True
                suspeitas += 1
    return suspeitas   # todos vivos: toda suspeita é falso positivo

print(simula(0.00, 0, 3))   # 0  rede perfeita
print(simula(0.10, 0, 3))   # 0  perda leve, timeout 3 tolera
print(simula(0.30, 0, 3))   # 9  perda alta com timeout curto
print(simula(0.30, 0, 8))   # 0  mesma perda, timeout maior
print(simula(0.00, 6, 3))   # 2  sem perda, mas atraso maior que o timeout`
          ),
          sl(
            'Lendo o resultado: o dilema do timeout',
            'Observe o que a simulação mostra. Com perda de 30% e timeout 3, houve falsos positivos: bastam algumas perdas seguidas para o receptor passar do prazo. Com o mesmo nível de perda e timeout 8, nenhum. E mesmo SEM perda, um atraso maior que o timeout causa suspeita: atraso é indistinguível de falha para quem está do outro lado. Não existe timeout "certo" universal: ele é uma troca entre velocidade de detecção e falsos positivos, e um falso positivo tem custo real (por exemplo, uma eleição desnecessária de líder, ou o nó removido e depois recolocado). Por isso detectores práticos usam timeouts adaptativos e vários sinais. Os valores exatos desta simulação dependem da semente aleatória; o que importa é o padrão. Repita variando a semente e os parâmetros.'
          ),
          sl(
            'Hipótese, registro e conclusão',
            'Injetar falha sem método vira bagunça. Use o ciclo: (1) HIPÓTESE escrita antes ("com 30% de perda, o cluster não troca de líder"); (2) INJEÇÃO controlada e reversível, aumentando a intensidade por etapas; (3) OBSERVAÇÃO com métricas e logs (anote horário de início e fim da falha); (4) REGISTRO do que de fato aconteceu, inclusive quando a hipótese estava certa; (5) CONCLUSÃO e correção (ajustar timeouts, adicionar retentativas com backoff, limites de tempo). Lembre-se de DESFAZER sempre: remover a fila do tc, reconectar a rede, retomar o processo, e destruir o laboratório ao final. Nos logs do laboratório, mesmo com dados fictícios, adote o hábito de produção: não registrar dados pessoais.',
            '# modelo de registro\n# hipótese:  com 5% de perda, requisições com retentativa continuam < 1% de erro\n# injeção:   netem loss 5% em <nó-b>, das 14:00 às 14:10\n# observado: taxa de erro X%, latência p99 Y\n# conclusão: hipótese confirmada/refutada; ação: ajustar timeout/retentativa'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual destes ambientes é adequado para executar um experimento com tc/netem que adiciona 30% de perda de pacotes?', 'b', [
          'O servidor de produção, em horário de baixo movimento',
          'Uma VM ou containers de laboratório próprios, isolados e com dados fictícios',
          'A rede do escritório, avisando os colegas por mensagem',
          'Qualquer servidor de um provedor, desde que o experimento dure poucos minutos'
        ], 'Falhas só devem ser injetadas em ambiente próprio e isolado, nunca em produção ou rede de terceiros, e nunca com dados reais.'),
        mcq('q2', 'O que o comando `tc qdisc add dev eth0 root netem delay 100ms loss 5%` faz?', 'd', [
          'Bloqueia por completo o tráfego da interface eth0 por 100 ms a cada pacote enviado, simulando um cabo desconectado e reconectado',
          'Cria uma partição entre eth0 e todas as demais interfaces da máquina',
          'Limita a banda da interface a 100 ms de duração por conexão',
          'Adiciona 100 ms de atraso e descarta cerca de 5% dos pacotes que saem pela interface eth0'
        ], 'netem emula atraso e perda nos pacotes enviados pela interface. Para desfazer, usa-se `tc qdisc del dev eth0 root`.'),
        mcq('q3', 'Qual a diferença entre `docker pause <container>` e derrubar o container (parar o processo)?', 'a', [
          'O container pausado continua existindo, com conexões abertas, mas não responde; é um nó "congelado" que pode voltar',
          'O pausado perde toda a memória e precisa ser recriado do zero, pois o pause equivale a remover o container e subir outro',
          'Os dois comandos são equivalentes e liberam a porta imediatamente',
          'O pausado responde normalmente, só que mais devagar'
        ], 'Pausar suspende os processos sem encerrá-los. Isso reproduz o nó travado que parece morto e depois retoma, o caso difícil para detectores de falha.'),
        fill('q4', 'Qual a disciplina de fila do tc usada para emular atraso e perda de pacotes?', 'tc qdisc add dev eth0 root ___ delay 100ms loss 5%', ['netem'], 'netem (network emulator) é a disciplina de fila do Linux para emular atraso, perda, duplicação e reordenação.'),
        mcq('q5', 'Em qual situação um proxy de falhas como o Toxiproxy é preferível a mexer na interface de rede do host?', 'c', [
          'Quando se quer afetar todos os programas da máquina, inclusive o sistema operacional',
          'Quando se quer reordenar pacotes TCP na camada de enlace',
          'Quando se quer injetar latência ou cortar conexões só no tráfego entre um cliente e um serviço específicos',
          'Quando se quer evitar ter que escrever qualquer hipótese de teste'
        ], 'O proxy afeta apenas o tráfego que passa por ele, o que é mais preciso e seguro do que degradar a rede do host inteiro.'),
        mcq('q6', 'Na simulação, todos os nós estão vivos e mesmo assim houve suspeitas. O que isso significa?', 'a', [
          'São falsos positivos: perda ou atraso fizeram os heartbeats ultrapassarem o timeout',
          'Os nós falharam sem que a simulação percebesse, pois o detector só registra suspeita quando há falha real',
          'O detector funcionou corretamente, pois toda suspeita indica uma falha real',
          'A semente aleatória está errada e deve ser trocada até as suspeitas sumirem'
        ], 'Nó vivo suspeito é falso positivo. Do lado de quem observa, atraso e perda são indistinguíveis de falha; timeout é troca entre velocidade e falsos positivos.'),
        mcq('q7', 'Você esperaria que, com o mesmo nível de perda de pacotes, aumentar o timeout do detector produzisse que efeito?', 'd', [
          'Mais falsos positivos e detecção mais rápida de falhas reais',
          'Mais falsos positivos e detecção mais lenta de falhas reais',
          'Nenhuma mudança, pois o timeout não influencia a detecção',
          'Menos falsos positivos, ao custo de demorar mais para detectar uma falha real'
        ], 'Um timeout maior tolera mais perdas seguidas e atrasos, reduzindo falsos positivos, mas atrasa a detecção de falhas reais.'),
        fill('q8', 'Qual comando suspende um processo sem encerrá-lo? O sinal enviado é STOP.', 'kill -___ <pid>', ['STOP', 'SIGSTOP'], 'kill -STOP suspende o processo (e kill -CONT o retoma): ele não morre, mas deixa de responder, simulando um nó congelado.')
      ]
    },
    {
      id: 'cdi-33-seguranca-distribuida',
      title: 'Segurança em sistemas distribuídos',
      goal: 'Proteger a comunicação e a identidade entre serviços com TLS/mTLS, tokens, zero trust, cofres de segredos e defesas conceituais contra replay, MITM, spoofing, DoS e movimento lateral.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Modelo de ameaças e TLS vs mTLS',
            'Comece pelo modelo de ameaças: o que proteger (dados, credenciais), contra quem (usuário malicioso, serviço comprometido, insider) e onde estão as fronteiras de confiança. Em sistemas distribuídos a rede é hostil por padrão. TLS cifra a comunicação e autentica o SERVIDOR por certificado (o cliente sabe com quem fala e ninguém no caminho lê ou altera). No mTLS (TLS mútuo), os DOIS lados apresentam certificado: o servidor também sabe quem é o cliente (qual serviço), o que dá autenticação forte serviço a serviço.'
          ),
          sl(
            'Identidade de serviços: SPIFFE',
            'IPs mudam o tempo todo (containers), então não servem como identidade. O SPIFFE padroniza identidade de workloads: um SPIFFE ID é uma URI como spiffe://dominio-de-confianca/ns/pagamentos/sa/api, provada por um documento verificável (SVID), em geral um certificado X.509 de curta duração emitido e renovado automaticamente. Assim, as políticas dizem "o serviço pedidos pode chamar pagamentos", independentemente de onde cada um roda. Service meshes e o SPIRE implementam essa ideia (visão geral).'
          ),
          sl(
            'Tokens entre serviços: JWT, escopos e identidade propagada',
            'JWT (JSON Web Token) carrega claims assinadas: emissor (iss), destinatário (aud), expiração (exp), sujeito (sub) e escopos (o que é permitido). A assinatura garante integridade e origem, mas o conteúdo (payload) é apenas codificado em base64url, NÃO cifrado: qualquer um com o token lê os claims, então não coloque dados pessoais ou segredos nele. O receptor deve validar a assinatura, a expiração, o emissor e, crucialmente, o aud (o token é para MIM?); sem isso, um token emitido para o serviço A poderia ser usado contra B. Mantenha validade curta. Ao propagar a identidade do usuário final pela cadeia, repasse também a identidade do serviço chamador e aplique autorização em cada serviço.'
          ),
          sl(
            'Zero trust, segmentação e segredos',
            'Zero trust: "nunca confie, sempre verifique". Estar dentro da rede interna não concede confiança; cada requisição é autenticada, autorizada com mínimo privilégio e registrada. Segmentação de rede (políticas que permitem só as conexões necessárias entre serviços) reduz o alcance de um comprometimento. Segredos (senhas de banco, chaves de API, chaves privadas) ficam em um cofre (Vault, gerenciadores de segredos de nuvem), nunca no código, imagem ou repositório; o acesso é por identidade, os registros são auditados e as credenciais são de curta duração e ROTACIONADAS regularmente (ou imediatamente após exposição).'
          ),
          sl(
            'Ataques (conceitos defensivos)',
            'REPLAY: capturar uma requisição legítima e reenviá-la; defesa: timestamp e nonce (valor único) na mensagem assinada, com janela de validade curta e descarte de repetidos. MITM (homem no meio): interceptar a conversa; defesa: TLS com verificação de certificado ligada. SPOOFING: fingir ser outro serviço; defesa: mTLS e identidades verificáveis. DoS: esgotar recursos; defesa: rate limiting, load shedding, quotas e autoscaling. MOVIMENTO LATERAL: depois de invadir um serviço, atacar os vizinhos; defesa: segmentação, mínimo privilégio, credenciais por serviço e detecção por auditoria.'
          ),
          sl(
            'Mensagens assinadas na prática',
            'HMAC assina uma mensagem com um segredo compartilhado; o receptor recalcula e compara com hmac.compare_digest, comparação em tempo constante que evita vazar a assinatura por diferenças de tempo. O exemplo gera a chave em tempo de execução (em produção ela viria de um cofre, nunca do código) e inclui timestamp e nonce contra replay. Para assinar sem compartilhar segredo, use assinaturas assimétricas (a chave privada assina e a pública verifica).',
            `import hmac, hashlib, secrets, json
CHAVE = secrets.token_bytes(32)          # em produção: vem de um cofre
vistos = set()
def assinar(corpo, agora):
    msg = json.dumps({'ts': agora, 'nonce': secrets.token_hex(8), 'corpo': corpo}, sort_keys=True)
    return msg, hmac.new(CHAVE, msg.encode(), hashlib.sha256).hexdigest()
def verificar(msg, sig, agora, janela=30):
    esperado = hmac.new(CHAVE, msg.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(esperado, sig): return 'assinatura invalida'
    d = json.loads(msg)
    if abs(agora - d['ts']) > janela: return 'expirada'
    if d['nonce'] in vistos: return 'replay'
    vistos.add(d['nonce']); return 'ok'
m, s = assinar({'acao': 'debitar', 'valor': 10}, 1000)
print(verificar(m, s, 1005))                  # ok
print(verificar(m, s, 1006))                  # replay
print(verificar(m.replace('10', '99'), s, 1007))   # assinatura invalida`
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual a diferença entre TLS comum e mTLS?', 'b', [
          'No mTLS não há criptografia, só autenticação',
          'No mTLS os dois lados apresentam certificado e se autenticam',
          'No TLS comum o cliente é autenticado por certificado e o servidor não',
          'O mTLS só funciona sobre UDP'
        ], 'TLS autentica o servidor; mTLS adiciona a autenticação do cliente (por exemplo, o serviço chamador).'),
        mcq('q2', 'Um JWT assinado protege o quê, e o que NÃO protege?', 'a', [
          'Protege contra alteração, mas o conteúdo pode ser lido por quem tem o token',
          'Protege a confidencialidade, e ninguém além do receptor consegue ler os claims',
          'Não protege nada, pois qualquer um pode forjar a assinatura',
          'Protege contra qualquer uso do token, mesmo por outro serviço'
        ], 'A assinatura dá integridade e origem; o payload é só base64url. Nada de dados pessoais ou segredos nele.'),
        mcq('q3', 'Um token emitido para o serviço A é aceito pelo serviço B, que não confere o aud. Qual o risco?', 'd', [
          'Nenhum, pois a assinatura vale em qualquer serviço',
          'O token expira mais rápido que o esperado',
          'O tamanho do token cresce a cada salto',
          'Quem obtiver o token de A poderá usá-lo contra B'
        ], 'O aud diz a quem o token se destina; ignorá-lo permite reutilização do token fora do alvo.'),
        fill('q4', 'Qual função do módulo hmac compara assinaturas em tempo constante?', 'ok = hmac.___(esperado, recebido)', ['compare_digest'], 'compare_digest evita vazar informação sobre a assinatura pelo tempo de comparação.'),
        mcq('q5', 'O que é um SPIFFE ID?', 'c', [
          'Um IP fixo atribuído a cada container',
          'Uma senha compartilhada entre os serviços',
          'Uma identidade de workload em URI, provada por documento (SVID) de curta duração',
          'O nome DNS público do serviço'
        ], 'Identidade independente de IP, verificável por certificado e renovada automaticamente.'),
        mcq('q6', 'Um serviço de baixo risco foi comprometido. Qual conjunto de medidas limita o movimento lateral?', 'a', [
          'Segmentação de rede, mínimo privilégio e mTLS com autorização por serviço',
          'Confiar em tudo que está dentro da rede interna',
          'Usar um único token de longa duração compartilhado entre todos os serviços',
          'Desativar logs para reduzir a superfície de ataque'
        ], 'Zero trust: cada chamada é autenticada e autorizada, e a rede é segmentada.'),
        mcq('q7', 'Um atacante captura uma requisição assinada válida e a reenvia depois. Qual defesa?', 'c', [
          'Usar um algoritmo de assinatura mais lento',
          'Trocar HTTPS por HTTP para depurar',
          'Incluir timestamp e nonce na mensagem assinada e rejeitar expiradas ou repetidas',
          'Aumentar o tamanho do corpo da mensagem'
        ], 'Timestamp com janela curta e nonce único tornam o reenvio detectável.'),
        fill('q8', 'Senhas de banco e chaves de API devem ficar em um ___ de segredos, e não no código ou no repositório.', 'segredos -> guardados em um ___ e rotacionados', ['cofre', 'vault'], 'Cofres centralizam, controlam o acesso e auditam o uso, facilitando a rotação.')
      ]
    },
    {
      id: 'cdi-34-lgpd-distribuido',
      title: 'Privacidade e LGPD em sistemas distribuídos',
      goal: 'Projetar sistemas distribuídos que respeitem a LGPD: minimização, eliminação com logs e backups, pseudonimização vs anonimização, residência de dados, retenção e auditoria.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Dados pessoais copiados em todo lugar; LGPD em visão geral',
            'Em sistemas distribuídos um dado pessoal raramente fica em um só lugar: banco primário, réplicas, outras regiões, cache, filas e streams, logs, traces, data lake, analytics e backups. A Lei Geral de Proteção de Dados (Lei nº 13.709/2018) regula o tratamento de dados pessoais, isto é, informações relacionadas a pessoa natural identificada ou identificável. Atores: o titular (a pessoa), o controlador (quem decide sobre o tratamento), o operador (quem trata em nome do controlador), o encarregado (canal com titulares e com a ANPD, a autoridade nacional). O tratamento exige uma base legal (consentimento, execução de contrato, obrigação legal, legítimo interesse, entre outras). Este material traz conceitos gerais e NÃO substitui orientação jurídica.'
          ),
          sl(
            'Minimização, finalidade e direitos do titular',
            'Princípios da lei: finalidade (propósito legítimo e informado), adequação, necessidade (coletar o mínimo para a finalidade), segurança e prevenção. Em arquitetura: só colete o necessário, não replique dados pessoais para sistemas que não precisam deles, defina retenção e apague quando a finalidade acaba. O titular tem direitos, como confirmação e acesso aos dados, correção, eliminação de dados desnecessários ou tratados com consentimento, portabilidade e informação sobre compartilhamento. Cada direito vira requisito técnico: é preciso saber ONDE estão os dados de uma pessoa para atendê-lo (por isso, mapeamento e inventário de dados).'
          ),
          sl(
            'Eliminação em logs imutáveis, streams e backups',
            'Eliminar é fácil no banco, mas e no log append-only, em um stream (Kafka) ou no backup? Estratégias: (1) NÃO colocar dados pessoais no log: guarde só uma referência (id) e mantenha o dado pessoal num armazenamento mutável, onde apagar funciona; (2) CRYPTO-SHREDDING: cifrar os dados de cada titular com uma chave própria; para eliminar, apague a chave, e os dados cifrados espalhados por logs e backups viram ilegíveis; (3) compactação por chave e tombstones em streams, quando adequado; (4) backups com retenção definida, que expiram, e um processo para reaplicar as eliminações ao restaurar. A lei admite conservação em hipóteses específicas (por exemplo, obrigação legal), então defina com o jurídico.',
            `import secrets
def xor(dados, chave): return bytes(b ^ chave[i % len(chave)] for i, b in enumerate(dados))
chaves = {}          # titular -> chave (num cofre/KMS de verdade)
log = []             # log imutável: só guarda texto cifrado
def registrar(titular, texto):
    chaves.setdefault(titular, secrets.token_bytes(16))
    log.append((titular, xor(texto.encode(), chaves[titular])))
registrar('titular-1', 'compra de teste')
registrar('titular-2', 'outra compra de teste')
del chaves['titular-1']                  # pedido de eliminação
print([xor(c, chaves[t]).decode() if t in chaves else '<ilegivel>' for t, c in log])
# ['<ilegivel>', 'outra compra de teste']
# (XOR é só um brinquedo didático; em produção use cifras autenticadas e um KMS)`
          ),
          sl(
            'Pseudonimização vs anonimização',
            'PSEUDONIMIZAR é trocar o identificador direto (nome, e-mail) por um código, guardando a tabela de correspondência separada e protegida: reduz o risco, mas o dado CONTINUA sendo pessoal, pois pode ser reidentificado com a informação adicional. ANONIMIZAR é tornar a reidentificação impossível por meios técnicos razoáveis e disponíveis: o dado anonimizado deixa de ser considerado pessoal pela lei (salvo se o processo puder ser revertido com esforços razoáveis). Cuidado: remover o nome não basta; combinações de CEP, data de nascimento e sexo, por exemplo, podem identificar alguém. Na dúvida, trate como dado pessoal.'
          ),
          sl(
            'Residência e transferência internacional de dados',
            'Onde os dados ficam fisicamente importa. A LGPD permite a transferência internacional de dados pessoais apenas em hipóteses previstas (por exemplo, para países com grau de proteção adequado, ou com cláusulas contratuais específicas ou consentimento específico, entre outras). Em arquitetura, replicação multirregião, backups em outro país, CDN, filas, ferramentas de monitoramento e serviços de terceiros podem configurar transferência. Por isso: escolha conscientemente as regiões, mapeie os fluxos, restrinja a replicação de dados pessoais às regiões permitidas e registre os operadores. Residência de dados pode ainda ser exigência contratual ou setorial.'
          ),
          sl(
            'Retenção, controle de acesso e auditoria',
            'Retenção: defina por quanto tempo cada tipo de dado é mantido (e em todas as cópias: réplicas, caches, backups, logs) e automatize a eliminação com TTLs, jobs e políticas de ciclo de vida. Controle de acesso: mínimo privilégio, acesso por papel, segregação entre ambientes e criptografia em trânsito e em repouso. Auditoria: registre quem acessou dados pessoais (sem registrar o dado em si) para investigar abusos. Incidentes: tenha um plano; a lei prevê comunicação à ANPD e aos titulares em caso de incidente que possa acarretar risco ou dano relevante. Segurança e privacidade por padrão, desde o projeto (privacy by design).'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um e-mail foi trocado por um id, e a tabela de correspondência está guardada à parte. Esse dado é...', 'd', [
          'Anonimizado e, portanto, fora da LGPD',
          'Público, sem nenhuma restrição de uso',
          'Inútil, pois não pode ser ligado a ninguém',
          'Pseudonimizado, e continua sendo dado pessoal por poder ser reidentificado'
        ], 'Com a informação adicional, a pessoa é reidentificável. Só a anonimização efetiva tira o dado do escopo.'),
        mcq('q2', 'Um cadastro de newsletter coleta data de nascimento e endereço sem necessidade. Qual princípio é violado?', 'c', [
          'Disponibilidade e redundância do serviço',
          'Qualidade da replicação',
          'Necessidade (minimização) e finalidade',
          'Compressão de dados'
        ], 'Coletar mais do que a finalidade exige viola os princípios de necessidade e finalidade.'),
        mcq('q3', 'Como atender um pedido de eliminação quando o dado está em um log imutável?', 'b', [
          'É impossível, então o pedido deve ser ignorado',
          'Evitar dado pessoal no log (usar referência) ou cifrar por titular e apagar a chave',
          'Reescrever manualmente o disco dos servidores de log',
          'Reiniciar o cluster do log para limpar o histórico'
        ], 'Crypto-shredding: sem a chave, o texto cifrado fica ilegível. Melhor ainda, não colocar o dado no log.'),
        fill('q4', 'Qual o número da lei brasileira de proteção de dados pessoais, de 2018?', 'Lei nº ___/2018 (LGPD)', ['13.709', '13709'], 'A LGPD é a Lei nº 13.709/2018.'),
        mcq('q5', 'Um titular pede eliminação e há dados em backups antigos. Qual abordagem típica?', 'a', [
          'Retenção definida para os backups, com processo de reaplicar as eliminações ao restaurar',
          'Manter todos os backups para sempre',
          'Restaurar todos os backups e editá-los um a um agora',
          'Ignorar, porque backups nunca contêm dados pessoais'
        ], 'Backups expiram por política e restaurações devem reaplicar eliminações. Detalhes legais devem ser validados com o jurídico.'),
        mcq('q6', 'Replicar o banco para uma região em outro país pode configurar o quê?', 'd', [
          'Apenas uma decisão de latência, sem relevância legal',
          'Somente um tema de backup, sem relação com a LGPD',
          'Uma exigência de aumentar o fator de replicação',
          'Transferência internacional de dados, que só é permitida nas hipóteses previstas em lei'
        ], 'Escolha regiões conscientemente e mapeie os fluxos para respeitar as regras de transferência.'),
        mcq('q7', 'Na LGPD, quem toma as decisões sobre o tratamento dos dados pessoais?', 'b', [
          'O operador',
          'O controlador',
          'O titular dos dados',
          'O encarregado'
        ], 'O controlador decide; o operador trata em nome dele; o encarregado é o canal de comunicação.'),
        fill('q8', 'No crypto-shredding, apagar qual item torna ilegíveis os dados cifrados espalhados em logs e backups?', 'del chaves[titular]   # apagar a ___ torna os dados ilegíveis', ['chave', 'key', 'chave de criptografia'], 'Sem a chave do titular, o texto cifrado não pode ser decifrado.')
      ]
    },
    {
      id: 'cdi-35-padroes-arquitetura',
      title: 'Padrões de arquitetura distribuída',
      goal: 'Conhecer CQRS, event sourcing, outbox, saga, sidecar/ambassador, strangler fig, células, leader/followers, scatter-gather e claim check: problema, custo e quando evitar.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'CQRS',
            'Problema: o modelo ideal para escrever (regras, consistência) costuma ser diferente do ideal para ler (telas, buscas, relatórios), e as cargas escalam de formas diferentes. CQRS (Command Query Responsibility Segregation) separa o modelo de ESCRITA (comandos) dos modelos de LEITURA (consultas), cada um otimizado, e pode usar bancos distintos. Custo: os modelos de leitura são atualizados por eventos, então há consistência eventual entre escrever e ler, mais peças para operar. Evite em CRUD simples: é complexidade sem retorno.'
          ),
          sl(
            'Event sourcing',
            'Problema: guardar só o estado atual perde o histórico (quem mudou o quê e quando). No event sourcing a fonte da verdade é a sequência imutável de EVENTOS ("depositou 100", "sacou 30"); o estado atual é DERIVADO aplicando os eventos em ordem (fold/reduce). Dá auditoria completa, reprodução do passado e novas projeções. Custos: evolução de esquema dos eventos, snapshots para não reler tudo, consultas exigem projeções (frequentemente com CQRS) e a eliminação de dados pessoais conflita com a imutabilidade (use crypto-shredding ou mantenha o dado pessoal fora dos eventos). Evite quando só se quer um histórico simples.',
            `eventos = [('depositou', 100), ('sacou', 30), ('depositou', 20)]
def aplicar(saldo, ev):
    tipo, v = ev
    return saldo + v if tipo == 'depositou' else saldo - v
from functools import reduce
print(reduce(aplicar, eventos, 0))        # 90
print(reduce(aplicar, eventos[:2], 0))    # 70  (estado no passado)`
          ),
          sl(
            'Outbox e saga (revisão)',
            'Outbox resolve a escrita dupla (gravar no banco E publicar evento): grave o evento numa tabela "outbox" na MESMA transação local do dado, e um processo separado o publica no broker (at-least-once, então consumidores devem ser idempotentes). Saga resolve transações que cruzam serviços: uma sequência de transações locais, cada uma com uma compensação que a desfaz se um passo seguinte falhar. Custos: duplicatas possíveis, compensações difíceis de escrever (nem tudo se desfaz) e estados intermediários visíveis. Evite quando uma única transação ACID de um banco basta.'
          ),
          sl(
            'Sidecar, ambassador e strangler fig',
            'SIDECAR: um processo auxiliar implantado junto de cada instância (mesmo pod/host, mesmo ciclo de vida) que adiciona capacidades sem mexer no código: logs, mTLS, métricas. AMBASSADOR: um sidecar que age como representante do app para o mundo externo, um proxy das chamadas de saída (retries, roteamento, TLS). Custo: mais processos por instância (CPU, memória) e mais um componente a atualizar. STRANGLER FIG (figueira estranguladora): migrar um legado aos poucos; uma fachada roteia funcionalidades, uma de cada vez, do sistema antigo para novos serviços até o antigo poder ser desligado. Evita a reescrita total ("big bang"), mas exige conviver com dois sistemas por um tempo.'
          ),
          sl(
            'Arquitetura em células',
            'Problema: em sistema único e compartilhado, um deploy ruim ou uma falha pode afetar todos os clientes. Na arquitetura em células, o sistema é replicado em várias células independentes (cada uma com sua pilha completa e seus dados), e cada cliente é atribuído a uma célula por um roteador. Uma falha, um deploy ruim ou um cliente abusivo afeta só aquela célula: raio de explosão limitado (bulkhead no nível do domínio de falha). Custos: infraestrutura duplicada, roteador que vira peça crítica, operações entre células (dados globais, migração de clientes) mais difíceis. Evite quando o sistema é pequeno.'
          ),
          sl(
            'Leader/followers e scatter-gather',
            'LEADER/FOLLOWERS: um líder ordena as escritas e os seguidores replicam e atendem leituras; simplifica a consistência. Custos: o líder é gargalo de escrita e é preciso failover (eleição) quando ele cai. SCATTER-GATHER: envia uma requisição a vários nós em paralelo (scatter) e combina as respostas (gather), usado, por exemplo, em busca sobre dados particionados. A latência total é aproximadamente a do nó MAIS LENTO, então uma cauda lenta domina; mitigue com timeouts, respostas parciais e requisições hedged. Evite fan-out gigante em caminhos sensíveis à latência.'
          ),
          sl(
            'Claim check',
            'Problema: mensagens muito grandes (arquivos, imagens) entopem o broker, estouram limites de tamanho e encarecem a rede. Claim check: guarde o conteúdo grande em um armazenamento de objetos e envie na mensagem só a referência (o "tíquete" para retirar a bagagem); o consumidor busca o conteúdo pela referência. Custos: um componente a mais, ciclo de vida e limpeza dos objetos órfãos, controle de acesso (URLs de curta duração) e cuidado com dados pessoais guardados. Evite quando as mensagens são pequenas: a indireção só complica.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é um custo central do CQRS com modelos de leitura separados?', 'a', [
          'Consistência eventual entre o modelo de escrita e os de leitura',
          'Impossibilidade de usar mais de um banco de dados na mesma aplicação',
          'Perda da capacidade de gravar dados novos',
          'Obrigação de usar um monolito'
        ], 'Modelos de leitura são atualizados por eventos, então ficam um pouco defasados em relação à escrita.'),
        mcq('q2', 'No event sourcing, qual é a fonte da verdade?', 'b', [
          'A última linha da tabela de estado atual de cada agregado do sistema',
          'A sequência imutável de eventos, da qual o estado é derivado',
          'O cache distribuído na frente do banco',
          'Os logs de acesso do servidor web'
        ], 'O estado é calculado aplicando os eventos em ordem; eles são o registro permanente.'),
        mcq('q3', 'Qual descreve melhor um ambassador?', 'c', [
          'Um banco de dados replicado entre regiões',
          'Uma fila de eventos com ordenação garantida',
          'Um sidecar que representa o app nas chamadas externas, cuidando de retries, roteamento e TLS',
          'Um balanceador de carga de DNS'
        ], 'O ambassador é um sidecar proxy das chamadas de saída do aplicativo.'),
        fill('q4', 'Aplicando os eventos [depositou 100, sacou 30, depositou 20] a partir de saldo 0, qual o saldo final?', 'saldo = 0 + 100 - 30 + 20 = ___', ['90'], 'O estado é o fold dos eventos: 100 - 30 + 20 = 90.'),
        mcq('q5', 'Qual é a ideia do padrão strangler fig para migrar um sistema legado?', 'c', [
          'Reescrever tudo e trocar de uma vez em um fim de semana',
          'Desligar o legado antes de ter qualquer substituto',
          'Uma fachada roteia funcionalidades, aos poucos, do legado para novos serviços até desligá-lo',
          'Duplicar o legado em cada região'
        ], 'A migração gradual reduz o risco em comparação ao big bang.'),
        mcq('q6', 'Qual o benefício principal da arquitetura em células?', 'd', [
          'Elimina a necessidade de qualquer roteamento',
          'Reduz o custo de infraestrutura',
          'Garante consistência forte global entre todos os clientes',
          'Uma falha ou deploy ruim afeta só uma fração dos clientes'
        ], 'Células limitam o raio de explosão, ao custo de infraestrutura duplicada e roteamento.'),
        mcq('q7', 'Mensagens com anexos de dezenas de MB estão entupindo o broker. Qual padrão ajuda?', 'a', [
          'Claim check: guardar o anexo em armazenamento de objetos e enviar só a referência',
          'CQRS com dois bancos separados',
          'Sidecar com proxy de saída',
          'Strangler fig sobre o broker'
        ], 'O broker carrega só a referência; o conteúdo grande vai pelo armazenamento de objetos.'),
        fill('q8', 'No scatter-gather, a latência total é aproximadamente a do nó mais ___.', 'latência ≈ nó mais ___ (é preciso esperar todas as respostas)', ['lento', 'devagar'], 'É preciso aguardar todas as respostas, então o nó mais lento domina a latência (cauda).')
      ]
    },
    {
      id: 'cdi-36-serverless-multiregiao-dr',
      title: 'Serverless, multirregião e recuperação de desastres',
      goal: 'Entender FaaS/BaaS e suas restrições, desenhos multirregião, RTO/RPO, backups vs réplicas e testes de DR.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'FaaS e BaaS',
            'Serverless não significa "sem servidores", e sim que você não os gerencia. FaaS (Function as a Service): você envia funções que a plataforma executa sob demanda, escala automaticamente (inclusive a zero) e cobra por uso. BaaS (Backend as a Service): serviços gerenciados prontos (autenticação, banco, armazenamento de arquivos) consumidos por API. Ótimo para cargas irregulares, picos e prototipagem; em troca, você aceita limites e acoplamento ao fornecedor.'
          ),
          sl(
            'Cold start, limites e eventos',
            'Cold start: na primeira invocação (ou depois de ociosidade), a plataforma precisa criar e inicializar o ambiente da função, o que acrescenta latência; invocações seguintes reaproveitam o ambiente ("quente"). Funções têm limites (tempo máximo de execução, memória, tamanho do pacote, concorrência), e são sem estado: nada local sobrevive entre invocações. O modelo é orientado a eventos: fila, upload de objeto, requisição HTTP, agenda disparam funções. Cuidado com a latência de cauda por cold start em caminhos sensíveis.'
          ),
          sl(
            'Idempotência obrigatória',
            'Gatilhos como filas e eventos entregam pelo menos uma vez, e a plataforma pode reexecutar uma função que deu timeout ou erro. Logo a mesma mensagem pode chegar duas vezes, e a função precisa ser idempotente: o segundo processamento não pode repetir o efeito (cobrar duas vezes, enviar dois e-mails). Técnica comum: registrar o id do evento/mensagem processado (numa tabela com chave única) e ignorar repetições, ou usar operações naturalmente idempotentes (upsert, "definir x=5" em vez de "somar 1").',
            `processados = set()
def tratar(msg):
    if msg['id'] in processados:
        return 'ignorada (duplicata)'
    processados.add(msg['id'])
    return 'processada'
print(tratar({'id': 'm1'}), tratar({'id': 'm1'}))
# processada ignorada (duplicata)`
          ),
          sl(
            'Multirregião: ativo-passivo vs ativo-ativo',
            'Uma região inteira pode falhar (o domínio de falha é maior que uma zona). ATIVO-PASSIVO: uma região atende todo o tráfego; a outra fica de espera, com dados replicados, e assume em caso de desastre (failover): mais simples e mais barato, mas o failover leva tempo e a região passiva pode estar subutilizada ou pouco testada. ATIVO-ATIVO: várias regiões atendem tráfego ao mesmo tempo; menor latência para usuários distantes e sem failover "frio", porém exige replicação bidirecional e tratamento de CONFLITOS de escrita (a mesma chave escrita em duas regiões ao mesmo tempo): resolver por última escrita vence, CRDTs, regras de negócio ou evitar o conflito dando a cada dado uma região "dona".'
          ),
          sl(
            'Replicação entre regiões, roteamento e consistência',
            'A latência entre regiões é alta (dezenas a centenas de ms), então a replicação entre elas costuma ser assíncrona: há uma janela em que a outra região está atrasada, e um failover pode perder essas últimas escritas (é o RPO). Replicação síncrona entre regiões dá consistência forte mas cada escrita paga a latência de ida e volta. Roteamento do tráfego: DNS (com TTLs baixos, política por latência, saúde) ou anycast (o mesmo IP anunciado de vários locais; a rede entrega ao mais próximo), em visão geral. Lembre também da LGPD: replicar dados pessoais para outra região pode ser transferência internacional.'
          ),
          sl(
            'RTO, RPO, backup vs réplica e testes de DR',
            'RPO (Recovery Point Objective): quanto DADO (em tempo) você aceita perder; RTO (Recovery Time Objective): quanto TEMPO aceita ficar fora do ar. Com backups a cada 6 h, no pior caso você perde 6 h de dados (RPO de 6 h); se restaurar leva 2 h e o resto da subida 1 h, o RTO é cerca de 3 h. Réplica NÃO é backup: um DROP/DELETE acidental, uma corrupção ou um ransomware são replicados quase na hora; só um backup com versões anteriores (e idealmente isolado e imutável) permite voltar no tempo. Plano de DR nunca testado costuma falhar: faça exercícios regulares de restauração e failover, e meça o RTO e o RPO reais.',
            `intervalo_backup_h = 6
rpo_pior_caso_h = intervalo_backup_h          # perde até 6 h de dados
rto_h = 2 + 1                                 # restaurar + subir serviços
print(rpo_pior_caso_h, rto_h)                 # 6 3`
          )
        ]
      },
      questions: [
        mcq('q1', 'O que é um cold start em FaaS?', 'c', [
          'O reinício completo do banco de dados da plataforma',
          'Uma falha de DNS ao chamar a função',
          'A latência extra da primeira invocação (ou após ociosidade) para criar e inicializar o ambiente da função',
          'Um erro por estouro do tempo máximo de execução'
        ], 'Invocações seguintes reaproveitam o ambiente quente e são mais rápidas.'),
        mcq('q2', 'Uma função disparada por fila recebe a mesma mensagem duas vezes (entrega at-least-once). Como proteger o sistema?', 'a', [
          'Tornar o processamento idempotente, por exemplo guardando o id das mensagens já tratadas',
          'Desligar completamente as retentativas da plataforma',
          'Aumentar a memória da função',
          'Rodar a função em uma única região'
        ], 'Deduplicação ou operações idempotentes fazem a repetição não repetir o efeito.'),
        mcq('q3', 'Qual descreve o desenho ativo-ativo multirregião?', 'b', [
          'Uma região atende e a outra fica parada até uma falha',
          'Várias regiões atendem ao mesmo tempo, exigindo tratar replicação e conflitos de escrita',
          'Duas regiões que guardam apenas backups frios',
          'Uma região só de leitura e outra só de escrita'
        ], 'Ativo-ativo reduz latência e failover frio, em troca de lidar com conflitos entre regiões.'),
        fill('q4', 'Backup completo a cada 6 horas: no pior caso, quantas horas de dados se perdem (RPO)?', 'RPO no pior caso = ___ horas', ['6', 'seis'], 'No pior caso a falha ocorre logo antes do próximo backup, perdendo todo o intervalo.'),
        mcq('q5', 'Qual afirmação sobre RTO e RPO está correta?', 'd', [
          'RTO mede quanto dado se perde e RPO quanto tempo leva para voltar',
          'RTO e RPO são sinônimos',
          'RPO é o custo mensal da região de DR',
          'RPO é quanto dado (em tempo) se aceita perder; RTO é quanto tempo se aceita ficar fora do ar'
        ], 'RPO está ligado à frequência de backup/replicação; RTO, ao tempo de recuperação.'),
        mcq('q6', 'Alguém executa um DELETE sem WHERE por engano. Por que a réplica não ajuda, mas um backup sim?', 'a', [
          'A réplica copia o delete quase imediatamente; o backup guarda versões anteriores',
          'Réplicas nunca copiam comandos de exclusão',
          'Backups são sempre mais rápidos que réplicas',
          'Réplicas são cifradas e backups não'
        ], 'Replicação propaga também os erros. Backup com histórico permite restaurar o ponto anterior.'),
        mcq('q7', 'Por que testar o plano de DR regularmente?', 'd', [
          'Para reduzir a latência das requisições diárias',
          'Para diminuir o custo das regiões ativas',
          'Para dispensar a necessidade de backups',
          'Porque um plano nunca testado costuma falhar e o RTO real fica desconhecido'
        ], 'Backups corrompidos, passos desatualizados e permissões faltando só aparecem ao testar.'),
        fill('q8', 'Duas regiões gravam a mesma chave ao mesmo tempo com valores diferentes em um desenho ativo-ativo. O que ocorre?', 'região A: x = 1  |  região B: x = 2   (simultâneas)\n-- isso é um ___ de escrita entre regiões', ['conflito', 'conflict'], 'Conflitos de escrita precisam de regra de resolução (LWW, CRDT, região dona do dado, regra de negócio).')
      ]
    },
    {
      id: 'cdi-39-implantacao-evolucao-sistemas',
      title: 'Implantação e evolução de sistemas distribuídos',
      goal: 'Atualizar um sistema distribuído sem derrubá-lo: rolling, blue/green, canário, feature flags, compatibilidade de mensagens e migração de esquema.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que não dá para trocar tudo de uma vez',
            'Num sistema distribuído você não atualiza todos os nós no mesmo instante. Mesmo que quisesse, desligar tudo para subir a versão nova significa indisponibilidade. Na prática, durante uma atualização VERSÕES DIFERENTES CONVIVEM: nós na versão antiga (v1) e nós na versão nova (v2) conversam entre si, compartilham o mesmo banco e consomem as mesmas filas. Esse é o fato central do tema: toda mudança precisa ser segura com v1 e v2 rodando juntas. Se v2 grava um dado que v1 não entende, ou v2 espera uma resposta que v1 não envia, o problema só aparece NO MEIO da atualização, e é o tipo de falha que testes com uma só versão não pegam.',
            'tempo ──────────────────────────────────►\nnó 1:  v1 v1 v1 v2 v2 v2 v2\nnó 2:  v1 v1 v1 v1 v2 v2 v2\nnó 3:  v1 v1 v1 v1 v1 v2 v2\n             ▲ janela em que v1 e v2 convivem'
          ),
          sl(
            'Estratégias: rolling, blue/green e canário',
            'ROLLING UPDATE: os nós são trocados aos poucos (um ou alguns por vez); a capacidade se mantém, mas v1 e v2 convivem por um bom tempo e o rollback é outra atualização gradual. BLUE/GREEN: mantém-se dois ambientes completos; o "blue" atende hoje e o "green" recebe a v2 já pronto e testado; a troca é feita mudando o roteamento de uma vez, e o rollback é voltar o roteamento para o blue. Custo: ambiente duplicado durante a troca; e o banco costuma ser compartilhado, então o esquema precisa servir às duas versões. CANÁRIO: a v2 recebe uma FRAÇÃO pequena do tráfego real (por exemplo uma pequena porcentagem), enquanto se comparam métricas (taxa de erro, latência) com a v1; se estão saudáveis, a fração sobe por etapas; se pioram, o rollback é automático. O nome vem do canário da mina, que avisa do perigo antes dos demais.',
            'rolling:     troca nós em sequência, sem ambiente duplicado\nblue/green:  dois ambientes, troca de roteamento de uma vez\ncanário:     1% -> 5% -> 25% -> 100%, com métricas decidindo cada passo'
          ),
          sl(
            'Roteador canário em Python',
            'O ponto-chave de um canário é que o usuário seja encaminhado de forma ESTÁVEL: se cada requisição sorteasse a versão, a mesma pessoa veria v1 e v2 alternando. A solução é calcular um "bucket" de 0 a 99 a partir de um hash do identificador (técnico, pseudonimizado; evite usar dado pessoal como chave de roteamento) e enviar à v2 quem tem bucket menor que o percentual. Subir o percentual só ACRESCENTA usuários à v2: quem já estava continua. E percentual 0 funciona como rollback imediato.',
            `import hashlib

def bucket(user_id):
    h = hashlib.sha256(user_id.encode()).hexdigest()
    return int(h, 16) % 100          # 0..99, sempre o mesmo para o mesmo usuario

def rota(user_id, percentual):
    return 'v2' if bucket(user_id) < percentual else 'v1'

usuarios = [f'user-{i}' for i in range(1000)]
for pct in (0, 5, 50, 100):
    n = sum(rota(u, pct) == 'v2' for u in usuarios)
    print(pct, n)
# 0 0
# 5 40      (aproximadamente 5% de 1000; o número exato depende do hash)
# 50 509
# 100 1000
print(rota('user-7', 5) == rota('user-7', 5))   # True: decisão estável
a = {u for u in usuarios if rota(u, 5) == 'v2'}
b = {u for u in usuarios if rota(u, 20) == 'v2'}
print(a <= b)                                   # True: subir só acrescenta`
          ),
          sl(
            'Feature flags: implantar não é liberar',
            'Uma FEATURE FLAG é um interruptor lido em tempo de execução que liga ou desliga um comportamento. Ela DESACOPLA implantação de liberação: o código novo vai para produção desligado ("dark launch") e é ligado depois, aos poucos, sem nova implantação; e desligar é instantâneo, sem reverter binário. Isso combina com o canário: o roteador acima poderia ser a própria flag com um percentual. O custo é a DÍVIDA DE FLAGS: cada flag dobra os caminhos de código possíveis, e flags esquecidas viram código morto e risco (um interruptor antigo ligado por engano pode reativar um caminho abandonado). Boas práticas: dar dono e data de remoção a cada flag, removê-la depois da liberação total, e restringir quem pode alterá-las (uma flag em produção é uma mudança de produção e deve ser auditada).'
          ),
          sl(
            'Compatibilidade de mensagens, APIs e esquemas',
            'Como v1 e v2 convivem, mensagens e APIs precisam ser compatíveis nos dois sentidos. COMPATIBILIDADE PARA TRÁS (backward): a versão nova lê dados produzidos pela antiga. COMPATIBILIDADE PARA FRENTE (forward): a versão antiga lê dados produzidos pela nova. Regras práticas: (1) novos campos devem ser OPCIONAIS, com valor padrão; (2) leitores devem TOLERAR campos desconhecidos (ignorar, e ao reenviar preservar quando possível), em vez de rejeitar a mensagem; (3) em formatos com identificador numérico de campo (como Protocol Buffers), NUNCA reaproveite o id de um campo removido, pois mensagens antigas guardadas em fila ou disco seriam lidas com o significado errado; marque o id como reservado; (4) não mude o tipo ou o significado de um campo existente: crie outro; (5) adicionar campo obrigatório é quebra de compatibilidade.',
            '# v1 envia:   {"pedido": 10, "valor": 50}\n# v2 envia:   {"pedido": 10, "valor": 50, "cupom": "X"}   (cupom é opcional)\n#\n# leitor v1 ao receber v2: ignora "cupom" e funciona   (forward)\n# leitor v2 ao receber v1: cupom ausente -> padrão     (backward)\n#\n# ERRADO: reaproveitar o id 3 (antes "peso") para outro campo "cor":\n#   mensagem antiga com peso seria lida como cor.'
          ),
          sl(
            'Migração de esquema sem downtime: expandir, migrar, contrair',
            'Alterar o esquema do banco enquanto v1 e v2 rodam exige passos pequenos e compatíveis. O padrão é EXPANDIR → MIGRAR → CONTRAIR. (1) EXPANDIR: adicione a nova coluna/tabela sem remover nada (a v1 continua funcionando; a coluna nova deve aceitar nulo). (2) MIGRAR: implante a v2, que passa a escrever nos dois lugares (ou só no novo), e preencha em lotes os dados antigos (backfill). (3) CONTRAIR: quando nenhuma versão antiga usa mais o campo velho, e só então, remova-o. Exemplo: renomear a coluna "nome" para "nome_completo" NÃO é um único RENAME; é adicionar "nome_completo", gravar nas duas, copiar os dados antigos, mudar as leituras e por fim apagar "nome". O mesmo vale para trocar o formato de uma mensagem em uma fila.',
            '-- 1. expandir\nALTER TABLE cliente ADD COLUMN nome_completo TEXT NULL;\n-- 2. migrar: v2 grava nas duas colunas; backfill em lotes pequenos\nUPDATE cliente SET nome_completo = nome WHERE nome_completo IS NULL AND id BETWEEN 1 AND 1000;\n-- 3. contrair (só depois que ninguém mais lê "nome")\nALTER TABLE cliente DROP COLUMN nome;'
          ),
          sl(
            'Estado, rollback e segurança do processo de implantação',
            'ESTADO: um nó que está sendo trocado pode ter conexões abertas e jobs em andamento. O correto é DRENAR: tirar o nó do balanceador, deixar as requisições em curso terminarem (com um prazo máximo), concluir ou devolver à fila os jobs e só então encerrar; derrubar de repente causa erros e trabalho duplicado ou perdido. ROLLBACK: reverter o código é fácil se o esquema foi expandido de forma compatível; já migrações de DADOS nem sempre são reversíveis: depois de um DROP COLUMN, de uma conversão com perda ou de dados que a v2 já gravou num formato novo, voltar para v1 não restaura nada. Por isso a contração é a última etapa e acontece quando já há confiança. OBSERVAR: durante o rollout acompanhe erros, latência e saturação, comparando as versões, com critérios de parada definidos antes. SEGURANÇA: a pipeline de implantação usa credenciais de MENOR PRIVILÉGIO (só o que o ambiente exige, de curta duração, sem chaves fixas em código), e os artefatos devem ser ASSINADOS e verificados antes de rodar, para que ninguém insira uma imagem adulterada no caminho.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um rolling update de 10 nós está no meio: 4 já em v2 e 6 ainda em v1. Qual é o risco principal que isso cria?', 'c', [
          'A capacidade total cai a zero até que o último nó seja atualizado, pois os nós em v1 são desligados',
          'Os nós em v1 deixam de aceitar tráfego novo até a conclusão do processo',
          'v1 e v2 convivem e trocam dados, então qualquer incompatibilidade aparece nessa janela',
          'O balanceador precisa ser reiniciado para reconhecer a segunda versão'
        ], 'Durante a atualização as duas versões coexistem, compartilhando banco, filas e chamadas entre si. É por isso que mudanças precisam ser compatíveis nos dois sentidos.'),
        mcq('q2', 'Qual característica distingue o blue/green do canário?', 'a', [
          'Blue/green mantém dois ambientes e troca o roteamento de uma vez; o canário expõe só uma fração do tráfego',
          'No blue/green a versão nova recebe só uma pequena fração dos usuários, e métricas de erro decidem a cada etapa se o percentual pode subir',
          'O canário exige dois ambientes idênticos e o blue/green dispensa qualquer ambiente extra',
          'No canário a troca é instantânea para todos e não há como voltar'
        ], 'Blue/green troca o roteamento inteiro (e volta rápido para o ambiente antigo). O canário expõe aos poucos, usando métricas para decidir cada etapa.'),
        mcq('q3', 'Um canário está em 5% e a taxa de erro da v2 fica claramente acima da v1. O que a prática recomenda?', 'd', [
          'Subir para 50% para ter mais amostras e confirmar se o erro persiste',
          'Ignorar a diferença se o aumento da latência for pequeno',
          'Esperar o fim do expediente antes de qualquer decisão, para acumular um volume maior de dados',
          'Interromper a rampa e reverter, de preferência automaticamente, antes de investigar'
        ], 'O sentido do canário é limitar o dano. Se as métricas pioram, para-se a rampa e volta-se ao percentual 0, de preferência com critérios automáticos.'),
        fill('q4', 'Complete as três fases de uma migração de esquema sem downtime.', 'expandir -> migrar -> ___', ['contrair', 'contração', 'contracao'], 'Primeiro expande-se (adiciona sem remover), depois migra-se (escreve e preenche os dados) e só no fim contrai-se, removendo o que ficou obsoleto.'),
        mcq('q5', 'No roteador canário em Python, por que o bucket vem de um hash do identificador do usuário e não de um sorteio a cada requisição?', 'b', [
          'Porque o hash garante que os usuários escolhidos tenham sempre maior valor de compra',
          'Para que a mesma pessoa receba sempre a mesma versão e subir o percentual só acrescente usuários',
          'Porque sorteios aleatórios não funcionam em Python',
          'Para dispensar a observação de métricas durante a liberação, já que o hash prevê qualquer problema da nova versão'
        ], 'O hash dá decisão estável e monotônica: quem está no 5% continua no 20%. Com sorteio por requisição, a experiência alternaria entre v1 e v2.'),
        mcq('q6', 'Qual é a vantagem de uma feature flag em relação a reverter a implantação?', 'd', [
          'Eliminar a necessidade de testar o código novo antes de enviá-lo, já que a flag pode ser desligada em produção',
          'Dispensar controle de acesso, pois a flag é só uma configuração',
          'Garantir que a flag possa permanecer ligada indefinidamente sem custo de manutenção no código',
          'Desligar o comportamento novo na hora, sem trocar binários, desacoplando implantação de liberação'
        ], 'A flag permite implantar o código desligado e ligá-lo depois, e desligá-lo rápido se algo der errado. Em contrapartida há dívida de flags e é preciso auditar quem as muda.'),
        mcq('q7', 'A v2 passa a enviar um campo novo opcional. Leitores v1 ainda ativos recebem as mensagens. Qual comportamento mantém a compatibilidade para frente?', 'a', [
          'Os leitores v1 ignoram o campo desconhecido e processam o restante normalmente',
          'Os leitores v1 rejeitam toda mensagem que contenha campos que não conhecem',
          'Os leitores v1 são desligados até que a v2 esteja em todos os nós',
          'O campo novo é declarado obrigatório para forçar a atualização dos leitores'
        ], 'Compatibilidade para frente significa que a versão antiga lê o que a nova produz. Tolerar campos desconhecidos é a regra. Campo obrigatório quebraria a compatibilidade.'),
        fill('q8', 'Para reverter um canário imediatamente, o percentual de tráfego da v2 volta para ___, de modo que ninguém mais a receba.', 'percentual = ___   # nenhum usuário recebe v2', ['0', 'zero'], 'Com percentual 0, o bucket de ninguém é menor que o limite, então todo o tráfego volta à v1 sem nova implantação.')
      ]
    },
    {
      id: 'cdi-37-zookeeper-etcd-consul',
      title: 'Serviços de coordenação',
      goal: 'Entender o que ZooKeeper, etcd e Consul oferecem (configuração, descoberta, locks, eleição, barreiras), seu modelo de dados, garantias e limites.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que são e para que servem',
            'Serviços de coordenação são pequenos clusters, replicados por consenso, que guardam poucos dados críticos para que muitos nós concordem sobre eles. Usos: configuração compartilhada; descoberta de serviços; locks distribuídos; eleição de líder; barreiras (aguardar todos chegarem a um ponto); associação ao grupo (quem está vivo). ZooKeeper usa o protocolo ZAB (atomic broadcast), etcd usa Raft, e o Consul usa Raft para os dados e também traz descoberta e health checks prontos. Em vez de cada sistema reinventar o consenso, ele é reutilizado como serviço.'
          ),
          sl(
            'Modelo de dados e versões',
            'ZooKeeper organiza os dados como uma árvore de znodes (como diretórios, cada nó guarda um pequeno dado e pode ter filhos), cada um com número de versão. O etcd usa um espaço plano de chaves-valor, com uma revisão global crescente a cada mudança, e cada chave guarda a revisão de criação/modificação e versão. Versões permitem concorrência otimista: compare-and-set ("grave só se a versão ainda for 1"). Dados são pequenos por desenho.',
            `store = {}       # chave -> (valor, versao)
def put(k, v, esperado=None):
    atual = store.get(k, (None, 0))
    if esperado is not None and atual[1] != esperado: return False
    store[k] = (v, atual[1] + 1); return True
print(put('lider', 'no-A', esperado=0))   # True   (criou, versão 1)
print(put('lider', 'no-B', esperado=0))   # False  (já existe: só um vence)`
          ),
          sl(
            'Sessões, leases e nós efêmeros',
            'Como detectar que um cliente morreu? Ele mantém uma SESSÃO (ZooKeeper) ou um LEASE (etcd/Consul): uma concessão com prazo que é renovada por heartbeats. Se parar de renovar, ela expira. No ZooKeeper, um nó EFÊMERO é apagado automaticamente quando a sessão do criador termina; no etcd, chaves podem ser associadas a um lease e somem quando ele expira. É a base de "presença" e de locks que se liberam sozinhos quando o dono morre, sem ficar preso para sempre.'
          ),
          sl(
            'Watches e receitas: lock, eleição, fencing',
            'WATCH: o cliente pede para ser notificado quando uma chave/znode muda (em vez de ficar consultando de tempos em tempos). Receitas: LOCK = criar um nó/chave efêmero com sequência ou "criar se não existir"; quem consegue, tem o lock; os outros observam o anterior. ELEIÇÃO = o primeiro a criar é o líder; se ele morrer, o nó efêmero some e os demais disputam. Cuidado: um cliente pode ficar pausado (GC, rede), ter o lease expirado, outro assumir e, depois, o primeiro acordar achando que ainda é o dono. Defesa: token de fencing, um número crescente (a revisão) enviado a cada escrita; o recurso protegido rejeita tokens menores que o último visto.',
            `ultimo = 0
def gravar(token, dado):
    global ultimo
    if token < ultimo: return 'rejeitado'
    ultimo = token; return 'gravado'
print(gravar(34, 'x'), gravar(33, 'y'), gravar(35, 'z'))
# gravado rejeitado gravado   (33 é de um dono antigo)`
          ),
          sl(
            'Garantias de consistência',
            'Escritas passam pelo líder e são confirmadas por quórum, então são linearizáveis (e ordenadas). Leituras variam: no etcd, por padrão, uma leitura é linearizável (confirmada por quórum), com a opção serializable, mais rápida e possivelmente desatualizada. No ZooKeeper, leituras são atendidas localmente por qualquer servidor, então podem ficar ligeiramente atrasadas em relação às escritas mais recentes; um cliente que precisa do dado mais novo pode chamar sync antes de ler. Em todos, a ordem de eventos observada por um cliente é consistente. A confirmação por quórum custa latência: cada escrita faz uma ida e volta de consenso.'
          ),
          sl(
            'Quando NÃO usar e tamanho do cluster',
            'Não use como banco de dados geral: foram feitos para poucos dados críticos e pequenos (configuração, metadados, liderança), cada escrita exige consenso (vazão limitada e crescente com o número de membros) e o conjunto precisa caber na memória/limites do serviço. Para grandes volumes use um banco de verdade. Tamanho do cluster: sempre ímpar (3, 5 ou 7). Quórum = n // 2 + 1: 3 membros toleram 1 falha; 4 membros também só toleram 1 (quórum 3), então o quarto custa e não ajuda; 5 toleram 2; 7 toleram 3. Mais membros = mais tolerância, mas escritas mais lentas (mais confirmações). Em geral 3 ou 5 bastam, em zonas de falha diferentes.',
            `for n in (3, 4, 5, 7):
    q = n // 2 + 1
    print(n, 'quorum', q, 'tolera', n - q)
# 3 quorum 2 tolera 1
# 4 quorum 3 tolera 1
# 5 quorum 3 tolera 2
# 7 quorum 4 tolera 3`
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual recurso permite um lock que se libera sozinho se o dono morrer?', 'b', [
          'Um znode persistente comum',
          'Um nó efêmero ligado à sessão (ou chave com lease)',
          'Um arquivo em disco local da máquina do dono do lock',
          'Uma variável global em memória'
        ], 'Quando a sessão/lease expira, o nó ou a chave some e o lock é liberado.'),
        mcq('q2', 'Para que serve um watch?', 'd', [
          'Para fazer backup periódico dos dados',
          'Para verificar as permissões do cliente',
          'Para cifrar os valores armazenados',
          'Para notificar o cliente quando uma chave ou nó muda, evitando polling'
        ], 'Watches permitem reagir a mudanças em vez de consultar continuamente.'),
        mcq('q3', 'Qual tamanho de cluster tem a mesma tolerância a falhas de um de 3 membros, porém custa mais?', 'c', [
          '1 membro',
          '5 membros',
          '4 membros',
          '7 membros'
        ], '4 membros: quórum 3, tolera 1, igual a 3 membros. Prefira números ímpares.'),
        fill('q4', 'Qual é o quórum de um cluster de 7 membros?', 'quorum = 7 // 2 + 1 = ___', ['4', 'quatro'], '7 // 2 = 3; mais 1 = 4, e tolera 3 falhas.'),
        mcq('q5', 'Por que não usar etcd ou ZooKeeper como banco de dados geral?', 'a', [
          'Foram feitos para poucos dados pequenos e críticos, e cada escrita passa por consenso',
          'Eles não persistem dados em disco',
          'Não aceitam nenhum tipo de chave com versão',
          'São incompatíveis com clusters de mais de um nó'
        ], 'Vazão e tamanho são limitados por desenho. Para grandes volumes, use um banco apropriado.'),
        mcq('q6', 'O cliente A tinha o lock, pausou, o lease expirou e B assumiu. A acorda e tenta escrever. Qual defesa protege o recurso?', 'b', [
          'Confiar que A percebe sozinho que perdeu o lock',
          'Token de fencing crescente, com o recurso rejeitando tokens menores que o último visto',
          'Reiniciar o cluster de coordenação',
          'Aumentar o TTL do lease para sempre'
        ], 'Cada dono recebe um token maior; o recurso recusa o de um dono antigo.'),
        mcq('q7', 'No ZooKeeper, uma leitura atendida por um servidor seguidor pode ser...', 'c', [
          'Sempre mais nova que a última escrita',
          'Impossível, pois leituras só ocorrem no líder',
          'Ligeiramente desatualizada, mas pode-se usar sync para forçar a atualização',
          'Rejeitada sempre que houver um watch ativo'
        ], 'Escritas são linearizáveis; leituras locais podem atrasar. sync alinha o servidor ao líder.'),
        fill('q8', 'Como se chama o znode removido automaticamente quando a sessão do cliente que o criou termina?', 'znode do tipo ___ (some quando a sessão acaba)', ['efêmero', 'efemero', 'ephemeral'], 'Nós efêmeros são a base de presença e locks que se liberam sozinhos.')
      ]
    },
    {
      id: 'cdi-38-laboratorio-kv-quorum',
      title: 'Laboratório: chave-valor com quórum',
      goal: 'Construir e executar um armazenamento chave-valor com N=3 réplicas, W/R configuráveis, relógios vetoriais, read repair e simulação de falhas, observando W+R>N.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que vamos construir',
            'Um mini-Dynamo em Python: N=3 réplicas (objetos que simulam nós, acessados por threads). Uma escrita só tem sucesso se pelo menos W réplicas confirmarem; uma leitura consulta R réplicas. Se W + R > N, o conjunto das W réplicas da escrita e o das R da leitura sempre têm interseção, então a leitura vê ao menos uma réplica com a escrita mais recente. Para saber QUAL versão é mais nova (e detectar escritas concorrentes), cada valor carrega um relógio vetorial: um dicionário nó -> contador. O relógio A "descende" de B se A >= B em todas as entradas (A viu tudo o que B viu). Se nenhum descende do outro, são concorrentes: um conflito (siblings), que o cliente deve reconciliar.'
          ),
          sl(
            'Parte 1: relógios vetoriais e réplica',
            'descends(a, b) compara dois relógios. A réplica guarda, por chave, a lista de versões NÃO dominadas: ao receber uma versão, ignora se já tem igual ou mais nova, remove as que ela supera e acrescenta a nova. Se duas são concorrentes, as duas permanecem (siblings). Um Lock protege o dicionário porque várias threads acessam a réplica.',
            `import threading
from concurrent.futures import ThreadPoolExecutor

def descends(a, b):
    """True se o relógio a é igual ou mais novo que b."""
    return all(a.get(k, 0) >= n for k, n in b.items())

class Replica:
    def __init__(self, name):
        self.name, self.up, self.data = name, True, {}
        self.lock = threading.Lock()
    def put(self, key, value, clock):
        with self.lock:
            vs = self.data.get(key, [])
            if any(descends(c, clock) for _, c in vs):
                return                       # já temos essa versão ou uma mais nova
            vs = [(v, c) for v, c in vs if not descends(clock, c)]
            vs.append((value, clock))
            self.data[key] = vs
    def get(self, key):
        with self.lock:
            return list(self.data.get(key, []))

class QuorumError(Exception):
    pass`
          ),
          sl(
            'Parte 2: o coordenador (cluster)',
            'put: o coordenador escolhido (via) incrementa a sua entrada no relógio vindo do contexto do cliente, envia a todas as réplicas alcançáveis e VIVAS em paralelo (thread pool) e exige pelo menos W confirmações, senão lança QuorumError. get: consulta R réplicas (com preferência opcional de ordem, para os experimentos), funde as respostas mantendo só as versões não dominadas e faz READ REPAIR: as réplicas consultadas que estavam atrasadas recebem as versões mais novas. Devolve os valores e o contexto (junção dos relógios) para o cliente usar na próxima escrita.',
            `class Cluster:
    def __init__(self, n=3, w=2, r=2):
        self.reps = [Replica(f'r{i}') for i in range(n)]
        self.n, self.w, self.r = n, w, r
        self.pool = ThreadPoolExecutor(max_workers=n)
    def _alive(self, reach):
        ids = range(self.n) if reach is None else reach
        return [self.reps[i] for i in ids if self.reps[i].up]
    def put(self, key, value, ctx=None, via=0, reach=None):
        coord = self.reps[via].name
        clock = dict(ctx or {})
        clock[coord] = clock.get(coord, 0) + 1          # coordenador incrementa sua entrada
        alive = self._alive(reach)
        list(self.pool.map(lambda rp: rp.put(key, value, clock), alive))
        if len(alive) < self.w:
            raise QuorumError(f'só {len(alive)} ack(s), W={self.w}')
        return clock
    def get(self, key, prefer=None, reach=None):
        alive = self._alive(reach)
        if prefer:
            alive.sort(key=lambda rp: prefer.index(int(rp.name[1:])) if int(rp.name[1:]) in prefer else 99)
        if len(alive) < self.r:
            raise QuorumError(f'só {len(alive)} resposta(s), R={self.r}')
        asked = alive[:self.r]
        answers = list(self.pool.map(lambda rp: rp.get(key), asked))
        merged = []                                      # versões não dominadas
        for vs in answers:
            for v, c in vs:
                if any(descends(c2, c) and c2 != c for _, c2 in merged):
                    continue
                merged = [(v2, c2) for v2, c2 in merged if not (descends(c, c2) and c != c2)]
                if all(c2 != c for _, c2 in merged):
                    merged.append((v, c))
        for rp, vs in zip(asked, answers):               # read repair
            for v, c in merged:
                if all(c != c2 for _, c2 in vs):
                    rp.put(key, v, c)
        ctx = {}
        for _, c in merged:
            for k, n in c.items():
                ctx[k] = max(ctx.get(k, 0), n)
        return [v for v, _ in merged], ctx`
          ),
          sl(
            'Parte 3: experimentos (código executado)',
            'Cada passo mostra uma ideia: (2-3) uma réplica atrasada e leitura com R=1, onde W+R=3 não supera N=3; (4-5) com R=2, W+R=4 > 3: a leitura vê a versão nova e o read repair conserta a réplica; (6-7) duas escritas concorrentes de lados diferentes de uma partição geram irmãos, resolvidos pelo cliente; (8) com duas réplicas fora e W=2, a escrita é recusada.',
            `k = Cluster(n=3, w=2, r=2)
k.put('x', 'A')
print('1', k.get('x')[0])
k.reps[2].up = False
k.put('x', 'B', ctx=k.get('x')[1])                  # W=2 ok com 2 vivas
k.reps[2].up = True                                  # r2 volta velha
print('2 r2 tem:', [v for v, _ in k.reps[2].get('x')])
k.r = 1
print('3 R=1 (W+R=3, nao >3) lendo r2 primeiro:', k.get('x', prefer=[2])[0])
k.r = 2
print('4 R=2 (W+R=4>3):', k.get('x', prefer=[2])[0])
print('5 apos read repair r2 tem:', [v for v, _ in k.reps[2].get('x')])
# conflito: duas escritas concorrentes com o mesmo contexto, lados da partição
ctx = k.get('x')[1]
k.w = 1
k.put('x', 'C-lado1', ctx=ctx, via=0, reach=[0])
k.put('x', 'C-lado2', ctx=ctx, via=1, reach=[1, 2])
vals, ctx2 = k.get('x')
print('6 irmãos:', sorted(vals))
k.put('x', 'C-resolvido', ctx=ctx2, via=0)           # cliente reconcilia
print('7', k.get('x', prefer=[1])[0])
k.w = 2
k.reps[1].up = k.reps[2].up = False
try: k.put('x', 'Z')
except QuorumError as e: print('8 falha:', e)
# saída:
# 1 ['A']
# 2 r2 tem: ['A']
# 3 R=1 (W+R=3, nao >3) lendo r2 primeiro: ['A']
# 4 R=2 (W+R=4>3): ['B']
# 5 apos read repair r2 tem: ['B']
# 6 irmãos: ['C-lado1', 'C-lado2']
# 7 ['C-resolvido']
# 8 falha: só 1 ack(s), W=2`
          ),
          sl(
            'Lendo o resultado',
            'Passo 3: R=1 leu a réplica r2, que perdeu a escrita B enquanto estava fora; devolveu A (dado velho), pois W+R = 3 não é maior que N = 3, então não há garantia de interseção. Passo 4: com R=2, a leitura consulta r2 e r0; r0 tem B, cujo relógio domina o de A, então só B sobrevive, e o read repair (passo 5) atualiza r2. Passo 6: as escritas C-lado1 e C-lado2 partiram do mesmo contexto, mas de coordenadores diferentes: os relógios {r0:...} e {r1:...} são concorrentes, nenhum domina, e a leitura devolve os dois irmãos; o cliente escolhe/mescla e grava de volta com o contexto da leitura (passo 7), cujo relógio domina ambos. Passo 8: sem W confirmações, QuorumError: o sistema sacrifica disponibilidade de escrita para manter a garantia (trade-off do CAP).'
          ),
          sl(
            'Limitações e próximos passos; síntese',
            'O que este laboratório NÃO tem: persistência em disco, rede real com timeouts e falhas parciais, particionamento por consistent hashing (aqui todas as réplicas guardam tudo), hinted handoff e sloppy quorum (aceitar escrita em nó substituto durante a falha), anti-entropy com árvores de Merkle (reparo em segundo plano de chaves nunca lidas), membership e detecção de falhas (gossip), poda de relógios vetoriais que crescem e coerência de uma escrita que falhou por falta de quórum (aqui ela fica nas réplicas alcançadas). Síntese do curso: replicação, quórum, relógios lógicos, detecção de conflitos e reparo foram combinados num sistema pequeno; sistemas reais acrescentam o resto. Sempre há trade-offs: consistência vs disponibilidade vs latência, e você escolhe conscientemente (W, R, N) conforme o caso de uso.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que W + R > N garante que a leitura enxerga a escrita mais recente?', 'a', [
          'Porque os conjuntos de W e R réplicas sempre têm ao menos uma réplica em comum',
          'Porque a leitura espera todas as réplicas responderem',
          'Porque a escrita é sempre confirmada por todas as réplicas antes de responder ao cliente',
          'Porque o relógio vetorial elimina qualquer atraso'
        ], 'Dois conjuntos cuja soma de tamanhos excede N se intersectam. A réplica em comum tem a versão mais nova.'),
        mcq('q2', 'Com N=3, W=1 e R=1, o que pode acontecer?', 'c', [
          'A escrita nunca consegue ser feita',
          'A leitura sempre devolve o dado mais novo',
          'A leitura consultar uma réplica que não recebeu a escrita e devolver dado velho',
          'Conflitos de versão deixam de existir'
        ], 'W+R = 2 não supera 3, então não há interseção garantida.'),
        mcq('q3', 'Os relógios vetoriais {r0:1} e {r1:1} estão em qual relação?', 'd', [
          'O primeiro é mais novo que o segundo',
          'O segundo é mais novo que o primeiro',
          'São iguais, pois ambos têm exatamente uma entrada',
          'São concorrentes: nenhum domina o outro'
        ], 'Cada um tem uma entrada que o outro não viu. Resultam em irmãos (conflito) a reconciliar.'),
        fill('q4', 'Com N=5 e W=3, qual o menor R que garante W + R > N?', 'W + R > N  ->  3 + R > 5  ->  R = ___', ['3', 'três', 'tres'], '3 + 3 = 6 > 5. Com R=2 a soma seria 5, que não é maior que 5.'),
        mcq('q5', 'O que faz o read repair no laboratório?', 'b', [
          'Apaga as réplicas que respondem devagar',
          'Ao ler, detecta réplicas consultadas com versões antigas e as atualiza com as mais novas',
          'Recria o banco inteiro a partir de um backup',
          'Rejeita leituras quando há conflito'
        ], 'É um reparo oportunista: aproveita a leitura para convergir as réplicas.'),
        mcq('q6', 'N=3, W=2 e duas réplicas fora do ar. O que acontece com um put?', 'c', [
          'Sucesso com apenas 1 confirmação',
          'Ele é descartado sem aviso e sem erro',
          'QuorumError: o sistema recusa a escrita, sacrificando disponibilidade para manter a garantia',
          'O sistema converte o put em leitura'
        ], 'Sem W confirmações não há sucesso. É a escolha de consistência em vez de disponibilidade.'),
        mcq('q7', 'Qual item NÃO existe no laboratório e seria necessário em um sistema real?', 'd', [
          'Relógios vetoriais para detectar conflitos',
          'Read repair durante as leituras',
          'Quórum de escrita e leitura configuráveis',
          'Persistência em disco, rede real com timeouts, hinted handoff, anti-entropy e membership'
        ], 'O laboratório mostra o núcleo; sistemas reais acrescentam durabilidade, rede, reparo em segundo plano e gerência de membros.'),
        fill('q8', 'Os relógios {r0:2, r1:1} e {r0:1, r1:2} são ___ (um não domina o outro).', 'versões com relógios assim são ___ -> geram irmãos', ['concorrentes', 'concorrente', 'concurrent'], 'Nenhum é maior ou igual ao outro em todas as entradas, então são concorrentes e exigem reconciliação.')
      ]
    },
    {
      id: 'cdi-41-praticando-sistemas-reais-containers',
      title: 'Praticando com sistemas reais em containers',
      goal: 'Montar pequenos clusters com docker compose (etcd, Redis com réplica, broker de log) e ligar o que se observa aos conceitos do curso.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Do conceito ao experimento',
            'Quórum, líder, replicação assíncrona e partições ficam muito mais claros quando você os VÊ acontecendo. Com docker compose dá para subir pequenos clusters na sua máquina e fazer experimentos: derrubar nós, observar eleições e comparar leituras. Cada experimento abaixo segue o mesmo formato: o que subir, o que fazer e o que esperar, ligando a observação ao conceito. Todos são para laboratório local, com dados e senhas fictícios. Os arquivos e comandos são esboços: nomes de imagens e tags (`<tag>`) devem ser escolhidos por você, e a saída exata pode variar conforme a versão do programa.',
            '# ciclo de todo experimento\ndocker compose up -d          # sobe o laboratório\n# ... fazer o experimento ...\ndocker compose down -v        # destrói containers E volumes ao final'
          ),
          sl(
            'Experimento 1: etcd com três nós',
            'O etcd é um armazenamento chave-valor consistente que usa Raft. Com 3 nós, o QUÓRUM (maioria) é 2. Suba os três (cada nó recebe nome, endereços de cliente e de par, e a lista inicial do cluster, `--initial-cluster`). Depois: (1) `etcdctl endpoint status --cluster -w table` mostra quem é o líder; (2) grave uma chave com `etcdctl put chave valor` e leia com `etcdctl get chave`; (3) PARE UM nó (`docker compose stop etcd3`): o cluster continua funcionando, pois restam 2 de 3, um quórum; se o parado era o líder, uma nova eleição acontece e surge outro líder; (4) PARE UM SEGUNDO nó: sobra 1 de 3, sem quórum, e as ESCRITAS passam a falhar ou expirar, pois o sistema prefere consistência a aceitar escrita sem maioria; (5) religue um nó e o quórum volta. Isso demonstra, na prática, "tolera f falhas com 2f+1 nós": 3 nós toleram 1.',
            `# esboço de um nó no compose (os outros dois são análogos, com outro nome)
services:
  etcd1:
    image: <imagem-oficial-do-etcd>:<tag>
    command:
      - etcd
      - --name=etcd1
      - --listen-client-urls=http://0.0.0.0:2379
      - --advertise-client-urls=http://etcd1:2379
      - --listen-peer-urls=http://0.0.0.0:2380
      - --initial-advertise-peer-urls=http://etcd1:2380
      - --initial-cluster=etcd1=http://etcd1:2380,etcd2=http://etcd2:2380,etcd3=http://etcd3:2380
      - --initial-cluster-state=new
    ports:
      - "127.0.0.1:2379:2379"   # só no loopback`
          ),
          sl(
            'Experimento 2: Redis com réplica',
            'Suba um Redis primário e um segundo Redis configurado como réplica dele (`redis-server --replicaof <host-do-primario> 6379`, ou o comando `REPLICAOF` em tempo de execução). A replicação do Redis é, por padrão, ASSÍNCRONA: o primário responde ao cliente antes de a réplica confirmar. Observe: (1) `redis-cli INFO replication` mostra o papel (master/slave) e dados da replicação, inclusive offsets, que permitem ver o LAG (atraso) entre primário e réplica; (2) escreva no primário e leia na réplica: na maioria das vezes o dado já está lá, mas a leitura pode ser OBSOLETA (stale) se a réplica ainda não recebeu a escrita; (3) tente escrever na réplica: ela normalmente recusa, por ser somente leitura; (4) FAILOVER MANUAL: pare o primário e promova a réplica com `REPLICAOF NO ONE`; agora ela aceita escritas. Conceitos ligados: replicação com líder, atraso de réplica, leitura obsoleta, e a possibilidade de perder escritas ainda não replicadas quando o primário cai logo após confirmar.',
            '# comandos úteis (saída pode variar)\nredis-cli -p 6379 SET exemplo 1        # no primário\nredis-cli -p 6380 GET exemplo          # na réplica; pode retornar vazio se houver lag\nredis-cli -p 6380 INFO replication     # role:slave ... (offsets, estado do link)\n\n# failover manual (após parar o primário):\nredis-cli -p 6380 REPLICAOF NO ONE     # a réplica vira primária'
          ),
          sl(
            'Experimento 3: broker de log em um nó',
            'Um broker de log de mensagens (como o Kafka ou similares) pode ser subido em um único nó de laboratório, com a imagem oficial. O objetivo é ver, com as ferramentas de linha de comando do próprio broker, os conceitos de log distribuído: criar um tópico com várias PARTIÇÕES, publicar mensagens com chaves, e observar que a ordem só é garantida DENTRO de cada partição, que cada mensagem tem um OFFSET (posição) na partição e que um consumidor guarda até onde leu. Reiniciar o consumidor e ver que ele continua do offset salvo mostra o papel do log como histórico reprocessável. Os nomes exatos dos scripts e das opções variam entre distribuições e versões, então consulte a documentação da imagem escolhida. Também é possível conceituar Cassandra ou MongoDB do mesmo jeito: subir um pequeno conjunto e observar níveis de consistência de leitura e escrita e eleição de primário, mas esse laboratório fica como descrição do que observar, não como receita.',
            '# o que observar (descrição conceitual)\n# - tópico com 3 partições; mensagens com a mesma chave caem na mesma partição\n# - cada partição tem offsets 0, 1, 2, ... independentes\n# - ordem global entre partições: NÃO garantida\n# - consumidor reiniciado retoma do último offset confirmado'
          ),
          sl(
            'Ligando observação e conceito',
            'Use uma tabela mental para não ficar só "mexendo". Parar 1 de 3 nós no etcd e ele seguir funcionando = quórum 2/3 mantido. Parar o líder e ver novo líder = eleição do Raft após detectar a falha. Parar 2 de 3 e ver escritas travarem = sem maioria, o sistema escolhe consistência a disponibilidade. Ler na réplica do Redis e receber valor antigo = replicação assíncrona e leitura obsoleta. Promover a réplica e descobrir que uma escrita recente sumiu = perda de dados não replicados no failover assíncrono. Mensagens em ordem dentro da partição, mas não entre partições = garantia de ordem por partição. Antes de cada experimento escreva o que espera ver; depois compare.',
            '# experimento                      -> conceito\n# parar 1 de 3 (etcd), segue ok    -> quórum 2/3\n# parar o líder, surge outro       -> eleição de líder\n# parar 2 de 3, escrita falha      -> sem quórum (consistência > disponibilidade)\n# ler da réplica, valor antigo     -> replicação assíncrona / stale read\n# promover réplica, perdeu escrita -> perda no failover assíncrono'
          ),
          sl(
            'Limites do laboratório',
            'Um host NÃO é um cluster de verdade. Todos os containers compartilham a mesma máquina, o mesmo disco, o mesmo relógio, a mesma energia e a mesma rede local, que é rápida e confiável. Portanto: as FALHAS são CORRELACIONADAS (se a máquina cai, caem todos os nós de uma vez, algo que o cluster real evita espalhando nós em hosts e zonas diferentes); a latência é baixa demais, então problemas de rede real quase não aparecem (combine com a injeção de falhas da lição anterior); e o desempenho medido não representa produção. O laboratório ensina COMPORTAMENTO e conceitos, não capacidade nem durabilidade. Também consome memória e CPU: três ou quatro serviços ao mesmo tempo já pesam num notebook, então suba só o que for usar.'
          ),
          sl(
            'Boas práticas e segurança do laboratório',
            'Use IMAGENS OFICIAIS e FIXE uma tag estável em vez de `latest`, para que o experimento seja reproduzível e você saiba o que está rodando. Publique portas SOMENTE em 127.0.0.1 (`"127.0.0.1:2379:2379"`), pois `"2379:2379"` abre o serviço para toda a rede em que sua máquina está; muitos bancos e brokers, por padrão, não têm autenticação, e um serviço exposto assim pode ser acessado ou invadido por qualquer pessoa na rede. Entre containers, use a rede interna do compose, sem publicar porta alguma. Se um serviço pedir senha, use senhas de EXEMPLO claramente fictícias e nunca as reutilize em outro lugar; não coloque segredos reais no arquivo compose. Use apenas dados fictícios. Ao terminar, rode `docker compose down -v`: o `-v` apaga também os volumes, e sem ele os dados do experimento ficam no disco e voltam na próxima subida.',
            '# bom:\nports:\n  - "127.0.0.1:6379:6379"\nimage: <imagem-oficial>:<tag-estável>\n\n# ruim (expõe na rede inteira, tag móvel):\nports:\n  - "6379:6379"\nimage: <imagem>:latest\n\n# limpeza ao final:\ndocker compose down -v'
          )
        ]
      },
      questions: [
        mcq('q1', 'Num cluster etcd de 3 nós, você para um nó que NÃO era o líder. O que você espera observar?', 'd', [
          'O cluster para de aceitar escritas até o nó voltar',
          'O cluster perde todos os dados gravados desde o início',
          'Os dois nós restantes elegem de novo e todos os clientes precisam ser reconfigurados',
          'O cluster segue funcionando, pois 2 de 3 nós ainda formam quórum'
        ], 'Com 3 nós o quórum é 2. Perdendo um nó seguidor, o líder e o outro seguidor continuam formando maioria, e leituras e escritas prosseguem.'),
        mcq('q2', 'Ainda no etcd de 3 nós, você para um segundo nó. O que esperar das escritas?', 'c', [
          'Continuam normalmente, pois o último nó vivo assume sozinho',
          'São gravadas só no nó vivo e sincronizadas depois, sem qualquer espera',
          'Falham ou expiram, pois restou 1 de 3 e não há quórum para confirmá-las',
          'Passam a ser aceitas em modo eventual, ignorando a maioria, e são reconciliadas quando os outros nós voltarem'
        ], 'Sem maioria o Raft não confirma escritas: o sistema prefere consistência a aceitar gravações que poderiam divergir. Religando um nó, o quórum volta.'),
        mcq('q3', 'Você escreve no primário do Redis e imediatamente lê na réplica, recebendo o valor antigo. Qual conceito explica?', 'b', [
          'Falha do relógio físico do container da réplica',
          'Replicação assíncrona com atraso (lag): a leitura da réplica pode ser obsoleta',
          'Perda definitiva da escrita pelo primário',
          'Quórum de leitura não atingido pelo etcd'
        ], 'O primário responde antes da réplica confirmar. Até a réplica receber a escrita, ler dela devolve dado obsoleto; é o preço da replicação assíncrona.'),
        fill('q4', 'Qual opção do compose apaga também os volumes ao destruir o laboratório?', 'docker compose down ___', ['-v', '--volumes'], 'down -v remove containers, redes e volumes; sem o -v, os dados persistem e reaparecem na próxima subida.'),
        mcq('q5', 'Por que publicar a porta como "127.0.0.1:6379:6379" é preferível a "6379:6379" em um laboratório?', 'a', [
          'O serviço fica acessível só na própria máquina, e não a toda a rede local, onde talvez nem exija autenticação',
          'A conexão passa a ser criptografada automaticamente pelo docker',
          'O Redis fica mais rápido por usar o loopback em vez da rede',
          'Evita a necessidade de fixar uma tag de imagem'
        ], 'Sem o prefixo 127.0.0.1, a porta é publicada em todas as interfaces. Serviços de laboratório muitas vezes não têm autenticação, então ficariam abertos a qualquer um na rede.'),
        mcq('q6', 'Qual é uma limitação importante de simular um cluster com containers em um único host?', 'c', [
          'Containers não conseguem se comunicar entre si pela rede padrão do compose sem configurar o modo host em cada um',
          'Não é possível parar nenhum container individualmente',
          'As falhas são correlacionadas: queda da máquina derruba todos os nós, e a rede local é rápida e confiável demais',
          'O quórum é calculado de forma diferente em containers'
        ], 'Um host compartilha máquina, disco, energia e relógio. O laboratório ensina comportamento, não durabilidade nem desempenho de produção.'),
        mcq('q7', 'Depois de parar o primário do Redis, promover a réplica com REPLICAOF NO ONE e perceber que a última escrita confirmada sumiu, o que ocorreu?', 'b', [
          'O comando REPLICAOF NO ONE apaga a última chave escrita no primário antes de promover a réplica e reiniciar a replicação',
          'A escrita ainda não tinha sido replicada: o failover com replicação assíncrona pode perder dados recentes',
          'O etcd rejeitou a escrita por falta de quórum',
          'A réplica passou a ler de um disco diferente do primário'
        ], 'Como o primário confirma antes da réplica receber, o que estava em trânsito se perde se o primário cair e a réplica for promovida.'),
        fill('q8', 'Com 3 nós, o quórum (maioria) é 3 // 2 + ___, ou seja, 2 nós.', 'quorum = 3 // 2 + ___', ['1'], 'A maioria de n nós é n // 2 + 1. Para 3 nós, 3 // 2 + 1 = 2, por isso o cluster tolera a perda de um nó.')
      ]
    },
  ]
};
