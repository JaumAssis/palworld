// Módulo "Intermediário" — 18 lições, 8 questões cada (3 múltipla escolha + 1 lacuna, duas vezes
// por lição). Ver ../../index.js para o formato e a validação de boot. Sketches C++ de Arduino
// reais (Uno: ATmega328P, 5 V, 16 MHz) nos exemplos, mesmo padrão de ./01-fundamentos.js.
// Para não repetir 144 vezes o mesmo objeto literal, as questões usam dois helpers locais (mcq e
// fill) que produzem exatamente o formato esperado pela validação do boot: mcq recebe a letra da
// resposta correta e as 4 alternativas na ordem a, b, c, d (assim a posição da resposta certa é
// escolhida à mão e variada); fill recebe prompt, código com a lacuna ___ e a lista de respostas.
// Segurança: as lições de motores, relé e alimentação enfatizam proteção (diodo de roda livre,
// fonte externa, isolação) e a de relé nunca ensina ligação em tomada. Nenhum exemplo usa dados
// pessoais — o datalogger registra somente medições de sensores.
const mcq = (id, prompt, answer, texts, explanation) => ({
  id,
  kind: 'mcq',
  prompt,
  choices: texts.map((text, i) => ({ id: 'abcd'[i], text })),
  answer,
  explanation
});

const fill = (id, prompt, code, accept, explanation) => ({ id, kind: 'fill', prompt, code, accept, explanation });

module.exports = {
  id: 'intermediario-arduino',
  levelKey: 'intermediate',
  order: 2,
  title: 'Intermediário',
  subtitle: 'millis, interrupções, bibliotecas, motores, displays, I2C/SPI, SD, EEPROM e cargas com segurança',
  accent: '#00979d',
  lessons: [
    {
      id: 'ari-01-millis',
      title: 'millis(): fazer várias coisas sem delay',
      goal: 'Controlar o tempo sem travar o programa, para piscar e ler sensores ao mesmo tempo.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'O problema do delay()',
            body: 'delay(1000) faz o Arduino ficar parado por 1 segundo: nesse tempo ele não lê botões, não atualiza display, não faz mais nada. Com um LED piscando por delay, um botão só é lido nos instantes em que o loop passa por ele — se você apertar durante o delay, pode perder o aperto. Para fazer várias tarefas "ao mesmo tempo" precisamos de outra técnica: consultar um relógio em vez de esperar.',
            code: 'void loop() {\n  digitalWrite(13, HIGH);\n  delay(1000);   // 1 s parado: botão ignorado\n  digitalWrite(13, LOW);\n  delay(1000);   // mais 1 s parado\n}'
          },
          {
            title: 'millis(): o relógio do Arduino',
            body: 'millis() devolve quantos milissegundos se passaram desde que a placa ligou (ou foi resetada). A função não espera nada: apenas responde um número, na hora. O valor é do tipo unsigned long (32 bits, só positivo) — por isso guardamos os tempos em variáveis unsigned long, nunca em int (que tem 16 bits no Uno e estouraria em ~32 segundos).',
            code: 'unsigned long agora = millis();\nSerial.println(agora);  // ex.: 15342'
          },
          {
            title: 'O padrão "intervalo com millis"',
            body: 'Guardamos o instante da última vez que a ação aconteceu. A cada volta do loop, calculamos agora - ultimo: se já passou o intervalo desejado, executamos a ação e anotamos o novo instante. Entre uma checagem e outra o loop continua girando livre, então outras tarefas rodam normalmente.',
            code: 'unsigned long ultimo = 0;\nconst unsigned long INTERVALO = 500;\nbool ligado = false;\n\nvoid loop() {\n  unsigned long agora = millis();\n  if (agora - ultimo >= INTERVALO) {\n    ultimo = agora;          // anota o novo instante\n    ligado = !ligado;        // inverte o estado\n    digitalWrite(13, ligado);\n  }\n  // aqui cabe ler botão, sensor, etc.\n}'
          },
          {
            title: 'Vários LEDs independentes',
            body: 'Cada tarefa ganha o seu próprio par de variáveis (ultimo e intervalo). Como nenhuma delas bloqueia, um LED pode piscar a cada 300 ms e outro a cada 1000 ms ao mesmo tempo, cada um no seu ritmo, e o loop ainda sobra tempo para ler o resto.',
            code: 'unsigned long ultimoA = 0, ultimoB = 0;\nbool a = false, b = false;\n\nvoid loop() {\n  unsigned long agora = millis();\n  if (agora - ultimoA >= 300) {\n    ultimoA = agora; a = !a; digitalWrite(8, a);\n  }\n  if (agora - ultimoB >= 1000) {\n    ultimoB = agora; b = !b; digitalWrite(9, b);\n  }\n}'
          },
          {
            title: 'Overflow de millis() e a subtração segura',
            body: 'Como o contador tem 32 bits, ele chega a 4 294 967 295 ms (cerca de 49,7 dias) e volta a zero — isso é o overflow. A forma correta de comparar é SEMPRE por subtração: agora - ultimo >= intervalo. Com variáveis unsigned long, a conta "dá a volta" e continua correta mesmo atravessando o overflow. Já comparar agora >= ultimo + intervalo pode falhar exatamente nessa virada, travando a tarefa.',
            code: '// BOM: funciona mesmo no overflow\nif (agora - ultimo >= INTERVALO) { ... }\n\n// RUIM: pode quebrar na virada do contador\nif (agora >= ultimo + INTERVALO) { ... }'
          },
          {
            title: 'micros(): precisão de microssegundos',
            body: 'micros() funciona como millis(), mas conta microssegundos (1 ms = 1000 µs). Serve para medir eventos curtos, como a duração de um pulso. Como o contador também é unsigned long, ele estoura bem mais cedo: em cerca de 71 minutos. O padrão da subtração segura vale do mesmo jeito.',
            code: 'unsigned long t0 = micros();\n// ... trecho a medir ...\nunsigned long duracao = micros() - t0;  // em µs'
          }
        ]
      },
      questions: [
        mcq('q1', 'Qual é o principal problema de usar delay() em um programa com várias tarefas?', 'b', [
          'Ele consome muita corrente do Arduino',
          'Ele trava o programa: nada mais é lido ou executado enquanto espera',
          'Ele só funciona com LEDs',
          'Ele altera a frequência do clock da placa'
        ], 'delay() bloqueia o loop: durante a espera botões e sensores não são lidos.'),
        mcq('q2', 'O que a função millis() retorna?', 'c', [
          'Quantos segundos faltam para o próximo loop',
          'O tempo que o último delay durou',
          'Os milissegundos desde que a placa ligou ou foi resetada',
          'A hora real do dia'
        ], 'millis() é um cronômetro que começa em zero ao ligar/resetar a placa e nunca para.'),
        mcq('q3', 'No padrão com millis, o que acontece logo depois de a condição agora - ultimo >= INTERVALO ser verdadeira?', 'a', [
          'Executamos a ação e atualizamos ultimo = agora para recomeçar a contagem',
          'Chamamos delay(INTERVALO) para esperar',
          'Zeramos a função millis()',
          'O loop termina'
        ], 'Sem anotar o novo instante, a condição continuaria verdadeira em toda volta do loop.'),
        fill('q4', 'Complete a função que devolve o tempo em milissegundos desde que a placa ligou:', 'unsigned long agora = ___();', ['millis', 'millis()'], 'millis() devolve o tempo em ms como unsigned long.'),
        mcq('q5', 'Qual tipo de variável deve guardar valores de millis()?', 'd', [
          'int',
          'byte',
          'float',
          'unsigned long'
        ], 'int (16 bits no Uno) estouraria em ~32 s; unsigned long tem 32 bits e comporta ~49,7 dias.'),
        mcq('q6', 'Por que a forma agora - ultimo >= INTERVALO é preferida em vez de agora >= ultimo + INTERVALO?', 'c', [
          'Porque é mais rápida de digitar',
          'Porque usa menos memória Flash',
          'Porque a subtração com unsigned long continua correta mesmo quando millis() estoura e volta a zero',
          'Porque a soma não é permitida em C++'
        ], 'Em aritmética unsigned a subtração "dá a volta" corretamente na virada do contador; a soma pode quebrar.'),
        mcq('q7', 'Dois LEDs devem piscar em ritmos diferentes ao mesmo tempo (300 ms e 1000 ms). Qual a abordagem correta?', 'b', [
          'Usar dois delay() seguidos, um de cada valor',
          'Ter variáveis ultimo e intervalo separadas para cada LED e checar ambas a cada volta do loop',
          'Usar um único ultimo compartilhado pelos dois LEDs',
          'Ligar os dois LEDs no mesmo pino'
        ], 'Cada tarefa precisa do seu próprio instante de referência, e nenhuma bloqueia a outra.'),
        fill('q8', 'Complete a função que conta microssegundos (estoura em ~71 minutos):', 'unsigned long t0 = ___();', ['micros', 'micros()'], 'micros() conta µs desde que a placa ligou; 1 ms = 1000 µs.')
      ]
    },
    {
      id: 'ari-02-debounce',
      title: 'Botões: debounce e detecção de borda',
      goal: 'Ler botões sem leituras falsas, contar pressionamentos e distinguir toque curto de longo.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Ruído mecânico: o bounce',
            body: 'Um botão é uma peça metálica que encosta em outra. Ao apertar, os contatos "quicam" por alguns milissegundos (tipicamente de 1 a 20 ms, às vezes mais), abrindo e fechando várias vezes antes de estabilizar. O Arduino é rápido o bastante para ler cada quique como um aperto diferente: um único toque pode ser contado como 3, 5 ou 10 cliques. Esse efeito se chama bounce, e a solução, debounce.',
            code: '// Sem tratamento, um aperto pode virar vários:\nif (digitalRead(2) == LOW) {\n  contador++;   // pode somar vários por um único toque\n}'
          },
          {
            title: 'Estado anterior e detecção de borda',
            body: 'Outro problema: enquanto o botão está pressionado, digitalRead continua LOW em todas as voltas do loop, e a contagem dispararia sem parar. Queremos reagir ao MOMENTO da mudança, a "borda". Guardamos a leitura anterior e comparamos: com INPUT_PULLUP, o botão solto lê HIGH e pressionado lê LOW, então a borda de descida (aperto) é "anterior era HIGH e agora é LOW".',
            code: 'bool anterior = HIGH;\n\nvoid loop() {\n  bool atual = digitalRead(2);\n  if (anterior == HIGH && atual == LOW) {\n    // acabou de ser apertado (borda de descida)\n  }\n  anterior = atual;\n}'
          },
          {
            title: 'Debounce com millis',
            body: 'A técnica: só aceitamos uma nova leitura depois que ela ficou estável por um tempo (por exemplo 30 ms). Toda vez que a leitura bruta muda, anotamos o instante com millis(). Se a leitura se mantém igual por mais que o tempo de debounce, ela passa a ser o estado "oficial". Não usamos delay, então o loop continua livre.',
            code: 'const unsigned long DEBOUNCE = 30;\nbool leituraAnt = HIGH, estado = HIGH;\nunsigned long tMudanca = 0;\n\nvoid loop() {\n  bool leitura = digitalRead(2);\n  if (leitura != leituraAnt) {\n    tMudanca = millis();   // mudou: reinicia a espera\n    leituraAnt = leitura;\n  }\n  if (millis() - tMudanca >= DEBOUNCE && leitura != estado) {\n    estado = leitura;      // estável: aceita\n    if (estado == LOW) { /* aperto confirmado */ }\n  }\n}'
          },
          {
            title: 'Contando pressionamentos',
            body: 'Juntando as duas ideias: somamos 1 ao contador apenas quando o estado debounced muda de HIGH para LOW. Assim um aperto longo conta uma única vez, e o ruído mecânico não conta nada a mais.',
            code: 'int contador = 0;\n// ... dentro da confirmação de aperto:\nif (estado == LOW) {\n  contador++;\n  Serial.println(contador);\n}'
          },
          {
            title: 'Toque curto versus toque longo',
            body: 'Para diferenciar, medimos quanto tempo o botão ficou pressionado: na borda de descida anotamos millis() (instante do aperto); na borda de subida (soltou), calculamos millis() - instanteAperto. Se for menor que o limite (por exemplo 800 ms) é toque curto; se for maior ou igual, toque longo. Uma mesma tecla pode então ter duas funções.',
            code: 'unsigned long tAperto = 0;\n\n// ao confirmar APERTO (estado virou LOW):\ntAperto = millis();\n\n// ao confirmar SOLTAR (estado virou HIGH):\nunsigned long duracao = millis() - tAperto;\nif (duracao >= 800) {\n  // toque longo\n} else {\n  // toque curto\n}'
          }
        ]
      },
      questions: [
        mcq('q1', 'O que é o "bounce" de um botão?', 'a', [
          'Os contatos mecânicos quicam por alguns milissegundos, gerando várias transições falsas num único aperto',
          'A queda de tensão do botão quando a bateria acaba',
          'O botão ficar preso pressionado',
          'A tensão do pino ficar sempre em 2,5 V'
        ], 'O quique dos contatos produz leituras HIGH/LOW alternadas antes de estabilizar.'),
        mcq('q2', 'Qual é a ideia central do debounce por software com millis?', 'c', [
          'Chamar delay(1000) após cada leitura',
          'Trocar o botão por um sensor analógico',
          'Aceitar uma nova leitura apenas depois que ela permanece estável por um tempo mínimo',
          'Ler o botão somente dentro de setup()'
        ], 'Se a leitura mudou, reinicia-se a contagem; só depois de estável ela vira o estado oficial.'),
        mcq('q3', 'Com INPUT_PULLUP, como detectamos o instante em que o botão foi apertado (borda de descida)?', 'd', [
          'anterior == LOW e atual == LOW',
          'anterior == LOW e atual == HIGH',
          'atual == HIGH',
          'anterior == HIGH e atual == LOW'
        ], 'Solto lê HIGH, pressionado lê LOW: o aperto é a transição HIGH para LOW.'),
        fill('q4', 'Complete a variável que guarda a leitura da volta anterior, necessária para detectar a borda:', 'bool ___ = HIGH;\n\nvoid loop() {\n  bool atual = digitalRead(2);\n  if (anterior == HIGH && atual == LOW) { contador++; }\n  anterior = atual;\n}', ['anterior'], 'Sem guardar o estado anterior não há como saber se houve uma mudança.'),
        mcq('q5', 'Um aperto longo, sem tratamento de borda, num código que faz if (digitalRead(2) == LOW) contador++; faria o quê?', 'b', [
          'Contaria apenas uma vez',
          'Contaria muitas vezes, uma por volta do loop enquanto estiver pressionado',
          'Não contaria nenhuma',
          'Reiniciaria a placa'
        ], 'A condição fica verdadeira em toda volta do loop; por isso reagimos à borda e não ao nível.'),
        mcq('q6', 'Para distinguir toque curto de longo, o que medimos?', 'c', [
          'A tensão do pino durante o aperto',
          'Quantas vezes o botão quicou',
          'O tempo entre o instante do aperto e o instante em que foi solto',
          'A temperatura do botão'
        ], 'duração = millis() ao soltar menos millis() ao apertar; comparamos com um limite.'),
        mcq('q7', 'Um botão com debounce de 30 ms: o contador aumenta quando...', 'a', [
          'o estado estável muda de HIGH para LOW (uma vez por aperto)',
          'a leitura bruta oscila para LOW, mesmo por 1 ms',
          'o botão está LOW, em toda volta do loop',
          'passam 30 segundos'
        ], 'Só a mudança de estado confirmada (estável) conta, uma vez por aperto.'),
        fill('q8', 'Complete a função usada para medir a duração do aperto (diferença entre dois instantes):', 'unsigned long duracao = ___() - tAperto;', ['millis', 'millis()'], 'Subtraímos o instante anotado no aperto do instante atual de millis().')
      ]
    },
    {
      id: 'ari-03-interrupcoes',
      title: 'Interrupções externas',
      goal: 'Reagir imediatamente a eventos nos pinos 2 e 3 sem precisar consultá-los no loop.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'O que é uma interrupção',
            body: 'Até aqui o Arduino descobre eventos "perguntando" (polling): o loop lê o pino de vez em quando. Se o sinal for um pulso curto durante outra tarefa, pode ser perdido. Uma interrupção inverte a lógica: o hardware avisa. Quando o evento ocorre, o processador pausa o que estava fazendo, executa uma função especial (a ISR, Interrupt Service Routine) e depois volta exatamente de onde parou.'
          },
          {
            title: 'attachInterrupt e os pinos do Uno',
            body: 'No Arduino Uno só os pinos digitais 2 (INT0) e 3 (INT1) aceitam interrupção externa. Usamos attachInterrupt(digitalPinToInterrupt(pino), funcao, modo): digitalPinToInterrupt converte o número do pino para o número da interrupção (de forma portável entre placas), funcao é a ISR e modo diz quando disparar.',
            code: 'const int PINO_BOTAO = 2;\n\nvoid setup() {\n  pinMode(PINO_BOTAO, INPUT_PULLUP);\n  attachInterrupt(digitalPinToInterrupt(PINO_BOTAO), tratar, FALLING);\n}'
          },
          {
            title: 'Os modos: RISING, FALLING, CHANGE',
            body: 'RISING dispara na subida do sinal (LOW para HIGH); FALLING na descida (HIGH para LOW); CHANGE em qualquer mudança. Existe também LOW, que dispara continuamente enquanto o pino estiver em LOW. Com botão em INPUT_PULLUP, o aperto é uma descida: use FALLING. Um sensor que gera um pulso a cada volta de uma roda costuma usar RISING.'
          },
          {
            title: 'A ISR: curta e simples',
            body: 'A ISR é uma função sem parâmetros e sem retorno (void). Enquanto ela roda, as demais interrupções ficam bloqueadas, então precisa ser MUITO rápida: apenas anotar o que aconteceu (incrementar um contador, ligar uma flag) e sair. O trabalho pesado fica no loop(), que lê a flag depois.',
            code: 'volatile bool apertou = false;\n\nvoid tratar() {\n  apertou = true;   // só sinaliza\n}\n\nvoid loop() {\n  if (apertou) {\n    apertou = false;\n    Serial.println("Botao!");  // trabalho fora da ISR\n  }\n}'
          },
          {
            title: 'volatile: variáveis compartilhadas',
            body: 'Uma variável alterada dentro da ISR e lida no loop precisa ser declarada volatile. Essa palavra avisa o compilador: "o valor pode mudar a qualquer momento por fora do fluxo normal; não otimize guardando-o em registrador". Sem ela, o loop pode enxergar sempre o valor antigo e nunca perceber a mudança.',
            code: 'volatile unsigned int pulsos = 0;\n\nvoid contar() { pulsos++; }'
          },
          {
            title: 'O que NÃO fazer numa ISR',
            body: 'Evite delay() (ele depende de interrupções e não funciona dentro da ISR), Serial.print (lento e também depende de interrupções), laços longos e cálculos pesados. Além disso, millis() não avança durante a ISR (ela pode ser lida, mas seu valor fica congelado). Outro cuidado: variáveis de mais de 1 byte (como int de 16 bits) são lidas pelo ATmega de 8 bits em duas etapas; se a interrupção acontecer no meio, a leitura sai corrompida. Por isso, ao ler no loop, desligue as interrupções por um instante com noInterrupts() e religue com interrupts().',
            code: 'noInterrupts();\nunsigned int copia = pulsos;  // leitura segura\ninterrupts();\nSerial.println(copia);'
          }
        ]
      },
      questions: [
        mcq('q1', 'Quais pinos do Arduino Uno aceitam interrupção externa com attachInterrupt?', 'c', [
          '0 e 1',
          '12 e 13',
          '2 e 3',
          'Qualquer pino digital'
        ], 'No Uno, INT0 está no pino 2 e INT1 no pino 3.'),
        mcq('q2', 'Qual é a vantagem de uma interrupção sobre ler o pino no loop (polling)?', 'a', [
          'Reage imediatamente ao evento, mesmo com o loop ocupado em outra tarefa',
          'Gasta menos memória em qualquer caso',
          'Funciona sem nenhum fio ligado ao pino',
          'Permite usar delay dentro da ISR'
        ], 'O hardware interrompe o programa na hora, sem depender de o loop chegar a ler o pino.'),
        mcq('q3', 'Qual modo dispara a interrupção quando o sinal vai de HIGH para LOW?', 'd', [
          'RISING',
          'CHANGE',
          'HIGH',
          'FALLING'
        ], 'FALLING é a borda de descida (HIGH para LOW); RISING é a de subida; CHANGE qualquer uma.'),
        fill('q4', 'Complete a função que converte o número do pino no número da interrupção:', 'attachInterrupt(___(2), tratar, FALLING);', ['digitalPinToInterrupt'], 'digitalPinToInterrupt(pino) traduz o pino para a interrupção correspondente, de forma portável.'),
        mcq('q5', 'Por que uma variável compartilhada entre ISR e loop deve ser volatile?', 'b', [
          'Para ocupar menos memória',
          'Para o compilador não assumir que o valor é constante e sempre reler da memória',
          'Para poder usar delay na ISR',
          'Para que a variável seja salva na EEPROM'
        ], 'volatile impede otimizações que escondem as mudanças feitas "por fora" do fluxo normal.'),
        mcq('q6', 'Qual destes é um uso ADEQUADO dentro de uma ISR?', 'c', [
          'delay(500)',
          'Serial.println com um texto longo',
          'Incrementar um contador volatile ou ligar uma flag',
          'Um laço for com milhares de iterações'
        ], 'A ISR deve só registrar o evento; o processamento pesado vai para o loop.'),
        mcq('q7', 'Por que, ao ler no loop um unsigned int atualizado na ISR, usamos noInterrupts() e interrupts() em volta da leitura?', 'a', [
          'Porque o ATmega de 8 bits lê 16 bits em duas etapas e uma interrupção no meio corromperia o valor',
          'Porque unsigned int não pode ser lido sem isso',
          'Porque as interrupções gastam energia',
          'Porque é obrigatório para usar Serial'
        ], 'A leitura não é atômica para variáveis maiores que 1 byte; desligar interrupções garante um valor consistente.'),
        fill('q8', 'Complete a palavra-chave que marca a variável como compartilhada com a ISR:', '___ unsigned int pulsos = 0;\n\nvoid contar() { pulsos++; }', ['volatile'], 'volatile avisa o compilador que o valor pode mudar fora do fluxo normal do programa.')
      ]
    },
    {
      id: 'ari-04-strings',
      title: 'Strings, char arrays e comandos pela Serial',
      goal: 'Manipular texto com segurança de memória e interpretar comandos recebidos.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'char array e o terminador \'\\0\'',
            body: 'Em C, texto é uma sequência de caracteres (char) em um vetor, terminada por um caractere especial de valor zero, escrito \'\\0\' (terminador nulo). É ele que marca onde o texto acaba. Por isso um texto de N letras ocupa N + 1 bytes. Se o terminador faltar, as funções de texto continuam lendo a memória além do vetor.',
            code: 'char msg[] = "OI";   // guarda: \'O\', \'I\', \'\\0\'  => 3 bytes\nchar nome[10] = "SENSOR"; // 6 letras + \'\\0\', sobra espaço\nSerial.println(msg);'
          },
          {
            title: 'String (objeto) versus char[]',
            body: 'String (com S maiúsculo) é um objeto da biblioteca do Arduino que facilita a vida: concatena com +, compara com ==, tem métodos como length(), substring(), indexOf() e toInt(). O preço é a memória: ela aloca e realoca espaço dinamicamente. Já o char[] tem tamanho fixo, decidido por você, e é mais leve e previsível.',
            code: 'String a = "Temp: ";\nString b = a + 25;       // "Temp: 25"\nif (b.length() > 5) { Serial.println(b); }\nint n = String("42").toInt(); // 42'
          },
          {
            title: 'Fragmentação da memória com String',
            body: 'O Uno tem só 2 KB de SRAM. Cada String cresce e encolhe na região chamada heap; depois de muitas concatenações, sobram "buracos" pequenos que não servem para nada (fragmentação). Com o tempo, a memória acaba mesmo havendo bytes livres, e o programa trava ou se comporta de forma estranha, geralmente depois de horas. Regra prática: em programas que rodam por muito tempo, prefira char[] e funções de C; use String só em coisas simples e curtas.'
          },
          {
            title: 'Macro F(): textos na Flash',
            body: 'Todo texto literal entre aspas, como em Serial.println("Ola"), é copiado para a SRAM ao iniciar. Envolvendo o texto com F("..."), ele fica só na memória Flash (32 KB no Uno), poupando SRAM. Funciona com print e println da Serial.',
            code: 'Serial.println(F("Sistema iniciado com sucesso"));'
          },
          {
            title: 'Funções úteis de texto (C)',
            body: 'strlen(t) conta as letras (sem o terminador). strcpy(destino, origem) copia. strcat(destino, origem) concatena. strcmp(a, b) compara e devolve 0 quando os textos são iguais (negativo ou positivo quando diferem). ATENÇÃO: comparar char[] com == compara os endereços de memória, não o conteúdo — sempre use strcmp. Para converter texto em número: atoi("123") devolve int, atof("3.14") devolve float; em String o equivalente é toInt().',
            code: 'char a[] = "LIGA";\nif (strcmp(a, "LIGA") == 0) {\n  // iguais\n}\nint v = atoi("250");   // 250'
          },
          {
            title: 'Parsing de comandos recebidos pela Serial',
            body: 'Para receber um comando como "LIGA" ou "VEL 120", vamos lendo caractere por caractere com Serial.read() e guardando num buffer (char[]) até chegar o fim de linha \'\\n\'. Então fechamos o texto com \'\\0\', interpretamos e zeramos o índice. Sempre confira o limite do buffer para não escrever fora dele (estouro de buffer).',
            code: 'char buf[16];\nbyte n = 0;\n\nvoid loop() {\n  while (Serial.available()) {\n    char c = Serial.read();\n    if (c == \'\\n\') {\n      buf[n] = \'\\0\';\n      if (strcmp(buf, "LIGA") == 0) digitalWrite(13, HIGH);\n      else if (strncmp(buf, "VEL ", 4) == 0) {\n        int v = atoi(buf + 4);   // número depois do espaço\n        analogWrite(9, v);\n      }\n      n = 0;\n    } else if (c != \'\\r\' && n < sizeof(buf) - 1) {\n      buf[n++] = c;\n    }\n  }\n}'
          }
        ]
      },
      questions: [
        mcq('q1', 'Quantos bytes ocupa char t[] = "OI"; ?', 'c', [
          '2 bytes',
          '4 bytes',
          '3 bytes, incluindo o terminador \'\\0\'',
          '1 byte'
        ], 'Duas letras mais o terminador nulo dão 3 bytes.'),
        mcq('q2', 'Qual é a função do caractere \'\\0\' no fim de um char array?', 'a', [
          'Marcar onde o texto termina para as funções de texto',
          'Separar duas palavras',
          'Converter o texto em número',
          'Apagar o texto da memória'
        ], 'Funções como strlen e Serial.print percorrem o vetor até encontrar o terminador.'),
        mcq('q3', 'Qual é o principal risco de usar muitas Strings em um programa que roda por muito tempo no Uno?', 'd', [
          'O texto fica em maiúsculas',
          'A Serial para de funcionar',
          'O compilador recusa o código',
          'Fragmentação do heap, que pode esgotar a SRAM e travar o programa'
        ], 'Alocações e liberações repetidas deixam buracos inúteis na memória de 2 KB.'),
        fill('q4', 'Complete o valor que strcmp devolve quando os dois textos são iguais:', 'if (strcmp(cmd, "LIGA") == ___) {\n  digitalWrite(13, HIGH);\n}', ['0'], 'strcmp retorna 0 quando os textos são idênticos.'),
        mcq('q5', 'Por que usar Serial.println(F("texto longo")) em vez de Serial.println("texto longo")?', 'b', [
          'Para o texto aparecer em outra cor',
          'Para manter o texto só na Flash e poupar SRAM',
          'Para o texto ser enviado mais rápido',
          'Para converter o texto em número'
        ], 'F() evita copiar o literal para a SRAM, que no Uno tem só 2 KB.'),
        mcq('q6', 'Dado char a[] = "ON"; qual é a forma correta de comparar seu conteúdo com "ON"?', 'c', [
          'a == "ON"',
          'a.equals("ON")',
          'strcmp(a, "ON") == 0',
          'a = "ON"'
        ], '== com vetores compara endereços; strcmp compara o conteúdo. equals existe só no objeto String.'),
        mcq('q7', 'Ao receber "VEL 120" no buffer buf, qual expressão extrai o número 120?', 'b', [
          'strlen(buf)',
          'atoi(buf + 4)',
          'strcmp(buf, "120")',
          'F(buf)'
        ], 'buf + 4 aponta para o texto após "VEL " e atoi converte para int.'),
        fill('q8', 'Complete a função que converte o texto "250" em número inteiro:', 'int v = ___("250");', ['atoi'], 'atoi converte texto em int; em um objeto String usa-se toInt().')
      ]
    },
    {
      id: 'ari-19-struct-enum-typedef',
      title: 'Tipos compostos: struct, enum e typedef',
      goal: 'Agrupar dados relacionados em struct e dar nomes legíveis a estados com enum.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Por que criar seus próprios tipos',
            body: 'Até aqui cada informação foi uma variável solta: pinoLed, estadoLed, pinoSensor, ultimaLeitura... Com 3 LEDs ou 4 sensores a lista de variáveis paralelas vira bagunça. C++ permite criar um tipo novo que agrupa várias variáveis relacionadas (struct) e outro que dá nomes a um conjunto de valores (enum). O código fica mais curto e mais legível.'
          },
          {
            title: 'struct: agrupando campos',
            body: 'Uma struct é um "molde" com vários campos, cada um com seu tipo. Declarar a struct não cria variável nenhuma; apenas define o tipo. Depois criamos variáveis desse tipo e usamos o ponto para acessar cada campo: variavel.campo. Podemos inicializar todos os campos de uma vez com chaves, na ordem em que foram declarados. Defina a struct antes de usá-la (no topo do sketch).',
            code: 'struct Led {\n  byte pino;\n  bool ligado;\n};\n\nLed led1 = {8, false};   // pino = 8, ligado = false\n\nvoid setup() {\n  pinMode(led1.pino, OUTPUT);\n  led1.ligado = true;\n  digitalWrite(led1.pino, led1.ligado);\n}'
          },
          {
            title: 'Array de structs',
            body: 'O ganho aparece quando combinamos struct com array: uma lista de LEDs, cada um com seu pino e seu estado, percorrida por um for. Para saber quantos elementos o array tem, use sizeof(array) / sizeof(array[0]): o tamanho total em bytes dividido pelo tamanho de um elemento. Adicionar um LED novo é só acrescentar uma linha na lista; o resto do código não muda.',
            code: 'struct Led {\n  byte pino;\n  bool ligado;\n};\n\nLed leds[3] = { {8, false}, {9, false}, {10, false} };\nconst int N = sizeof(leds) / sizeof(leds[0]);  // 3\n\nvoid setup() {\n  for (int i = 0; i < N; i++) {\n    pinMode(leds[i].pino, OUTPUT);\n  }\n}\n\nvoid loop() {\n  for (int i = 0; i < N; i++) {\n    leds[i].ligado = !leds[i].ligado;\n    digitalWrite(leds[i].pino, leds[i].ligado);\n  }\n  delay(500);\n}'
          },
          {
            title: 'enum: constantes com nome',
            body: 'Um enum cria um tipo cujos valores são constantes nomeadas. Por padrão o compilador numera automaticamente a partir de 0: o primeiro nome vale 0, o seguinte 1, o outro 2, e assim por diante. Você pode fixar um valor com = e os nomes seguintes continuam contando a partir dele (BAIXO = 5, depois MEDIO vale 6 e ALTO vale 7). Em vez de números mágicos como "estado 2", o código lê PISCANDO.',
            code: 'enum Estado { PARADO, ANDANDO, PISCANDO };\n// PARADO = 0, ANDANDO = 1, PISCANDO = 2\n\nenum Nivel { BAIXO = 5, MEDIO, ALTO };\n// BAIXO = 5, MEDIO = 6, ALTO = 7\n\nEstado atual = PARADO;   // variável do tipo Estado'
          },
          {
            title: 'enum com switch: ponte para máquinas de estado',
            body: 'Um enum combina muito bem com switch: cada case é um estado com nome. Esse padrão (uma variável guarda o estado atual e o switch decide o que fazer) é a base das máquinas de estado, usadas para organizar programas com várias fases, como um semáforo ou uma máquina de venda. Não esqueça o break em cada case.',
            code: 'enum Fase { VERDE, AMARELO, VERMELHO };\nFase fase = VERDE;\n\nvoid loop() {\n  switch (fase) {\n    case VERDE:\n      digitalWrite(10, HIGH);\n      fase = AMARELO;\n      break;\n    case AMARELO:\n      digitalWrite(9, HIGH);\n      fase = VERMELHO;\n      break;\n    case VERMELHO:\n      digitalWrite(8, HIGH);\n      fase = VERDE;\n      break;\n  }\n  delay(1000);\n}'
          },
          {
            title: 'typedef e o nome do tipo',
            body: 'typedef cria um apelido para um tipo. Em C puro, uma struct precisava ser usada com a palavra struct na frente (struct Led x;), e o typedef servia para escapar disso: typedef struct { byte pino; bool ligado; } Led; Em C++ (que é a linguagem do Arduino) isso não é necessário: struct Led { ... }; já define o tipo Led, e o mesmo vale para enum. Mesmo assim você verá typedef em muito código e bibliotecas, e ele também serve para apelidos curtos, como typedef unsigned long tempo_t;',
            code: 'typedef struct {\n  byte pino;\n  bool ligado;\n} Led;            // forma estilo C: apelido Led\n\ntypedef unsigned long tempo_t;\ntempo_t agora = millis();'
          },
          {
            title: 'Passando struct a funções, sizeof e alinhamento',
            body: 'Quando passamos uma struct a uma função da forma comum, ela é COPIADA: a função mexe numa cópia e o original não muda. Isso também gasta memória e tempo se a struct for grande. Para modificar o original existe a passagem por referência, que veremos na lição de ponteiros e referências (ari-21). sizeof(Led) devolve o tamanho em bytes: no Uno, byte e bool ocupam 1 byte e int ocupa 2, então struct { byte pino; bool ligado; } ocupa 2 bytes. O compilador pode inserir bytes de preenchimento (padding) para alinhar campos à palavra da CPU; no ATmega328P de 8 bits normalmente não há padding, mas em placas de 32 bits há, e o tamanho pode ser maior que a soma dos campos.',
            code: 'struct Led { byte pino; bool ligado; };\n\nvoid acender(Led l) {      // recebe uma COPIA\n  l.ligado = true;         // o original não muda\n  digitalWrite(l.pino, HIGH);\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  Serial.println(sizeof(Led));   // 2 no Uno\n}'
          }
        ]
      },
      questions: [
        mcq('q1', 'O que é uma struct em C++?', 'b', [
          'Um tipo de laço de repetição',
          'Um tipo que agrupa várias variáveis relacionadas, os campos, sob um único nome',
          'Uma função que roda dentro da ISR',
          'Um array que só aceita números inteiros'
        ], 'struct agrupa campos de tipos possivelmente diferentes em um único tipo novo.'),
        mcq('q2', 'Dado Led led1 = {8, false}; com campos byte pino e bool ligado, qual expressão lê o pino?', 'd', [
          'led1->8',
          'led1[pino]',
          'pino.led1',
          'led1.pino'
        ], 'Os campos de uma struct são acessados com o ponto: variavel.campo.'),
        mcq('q3', 'Em enum Cor { VERMELHO, VERDE, AZUL }; qual é o valor numérico de AZUL?', 'a', [
          '2',
          '3',
          '1',
          '0'
        ], 'A numeração automática começa em 0: VERMELHO = 0, VERDE = 1, AZUL = 2.'),
        fill('q4', 'Complete o acesso ao campo pino da variável led1:', 'Led led1;\nled1.___ = 8;', ['pino'], 'Com o ponto acessamos o campo pino da struct.'),
        mcq('q5', 'Em enum Nivel { BAIXO = 5, MEDIO, ALTO }; qual é o valor de ALTO?', 'c', [
          '2',
          '5',
          '7',
          '0'
        ], 'Depois de BAIXO = 5 a contagem continua: MEDIO = 6 e ALTO = 7.'),
        mcq('q6', 'Uma função recebe uma struct pela forma comum (por valor) e altera um campo. O que acontece com a variável original?', 'b', [
          'Ela é alterada também',
          'Ela não muda, porque a função trabalhou em uma cópia',
          'O programa não compila',
          'A struct é apagada da memória'
        ], 'Na passagem por valor a função recebe uma cópia; para alterar o original usa-se referência (ari-21).'),
        mcq('q7', 'No Uno, qual é o valor de sizeof(Led) para struct Led { byte pino; bool ligado; }; ?', 'a', [
          '2 bytes',
          '1 byte',
          '4 bytes',
          '16 bytes'
        ], 'byte e bool ocupam 1 byte cada; no ATmega328P normalmente não há padding, então a soma é 2.'),
        fill('q8', 'Complete a expressão que calcula quantos elementos tem o array leds:', 'Led leds[3] = { {8, false}, {9, false}, {10, false} };\nint n = sizeof(leds) / sizeof(___);', ['leds[0]', 'leds [0]', 'Led'], 'O tamanho total dividido pelo tamanho de um elemento dá a quantidade de elementos.')
      ]
    },
    {
      id: 'ari-20-preprocessador-static',
      title: 'Pré-processador, const e static',
      goal: 'Usar #define, #ifdef, const e static para escrever código configurável e sem repetição.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'O pré-processador roda antes do compilador',
            body: 'Antes de o compilador traduzir o sketch, um programa mais simples, o pré-processador, percorre o texto e executa as linhas que começam com # (diretivas): #include copia o conteúdo de um arquivo, #define faz substituição de texto, e #ifdef decide quais trechos permanecem. Ele não entende C++: só troca e corta texto. O compilador recebe o resultado já processado.',
            code: '#include <Servo.h>   // copia o cabeçalho da biblioteca\n#define LED 13       // troca LED por 13 no texto\n\nvoid setup() {\n  pinMode(LED, OUTPUT);   // o compilador vê: pinMode(13, OUTPUT);\n}'
          },
          {
            title: '#define: substituição de texto',
            body: '#define NOME valor troca toda ocorrência de NOME pelo texto que vem depois. Não existe tipo, não existe variável, e nada é guardado na memória. Por isso NÃO se coloca ponto e vírgula no fim: ele faria parte do texto substituído. Com #define LED 13; a linha pinMode(LED, OUTPUT); viraria pinMode(13;, OUTPUT); e o compilador acusaria erro. Por convenção, nomes de #define ficam em MAIÚSCULAS.',
            code: '#define LED 13        // certo\n#define BAUD 9600\n// #define LED 13;    // ERRADO: o ; vai junto na substituição'
          },
          {
            title: 'Macros com parâmetros e a armadilha dos parênteses',
            body: 'Um #define pode receber parâmetros, formando uma macro, que também é só troca de texto. Cuidado: se os parâmetros e o resultado não estiverem entre parênteses, a precedência dos operadores estraga a conta. Com #define DOBRO(x) x*2, a chamada DOBRO(3+1) vira 3+1*2, que vale 5 (e não 8). A forma segura coloca parênteses em cada parâmetro e em volta do resultado.',
            code: '#define DOBRO_RUIM(x) x*2\n#define DOBRO(x) ((x)*2)\n\nint a = DOBRO_RUIM(3+1);  // vira 3+1*2 = 5\nint b = DOBRO(3+1);       // vira ((3+1)*2) = 8'
          },
          {
            title: 'const e constexpr: preferir ao #define',
            body: 'const int LED = 13; cria uma constante de verdade: tem tipo (o compilador confere o uso), obedece ao escopo (pode ser local a uma função) e aparece nas mensagens de erro com o nome certo. Com #define nada disso existe. Em C++ moderno também há constexpr, para valores conhecidos já na compilação. Regra prática: use const (ou constexpr) para constantes e deixe #define para o que só o pré-processador faz, como flags de compilação condicional e include guards. Em const, o ponto e vírgula é obrigatório, pois é uma declaração normal.',
            code: 'const int LED = 13;          // preferido\nconstexpr float LIMITE = 25.5;\n\n#define LED_ANTIGO 13    // funciona, mas sem tipo'
          },
          {
            title: '#ifdef, #ifndef, #endif e a flag DEBUG',
            body: '#ifdef NOME mantém o trecho seguinte só se NOME estiver definido; #ifndef mantém se NÃO estiver; #endif fecha o bloco. É a técnica ideal para mensagens de depuração: com #define DEBUG o Serial.println aparece no programa; comentando essa linha, o pré-processador REMOVE o trecho antes da compilação, e o produto final não gasta Flash, SRAM nem tempo com depuração. Basta apagar ou comentar uma linha no topo para liberar o código de produção.',
            code: '#define DEBUG   // comente esta linha para desligar a depuração\n\nvoid setup() {\n  #ifdef DEBUG\n    Serial.begin(9600);\n  #endif\n}\n\nvoid loop() {\n  int v = analogRead(A0);\n  #ifdef DEBUG\n    Serial.println(v);\n  #endif\n}'
          },
          {
            title: 'Include guards e #pragma once',
            body: 'Quando você divide o projeto em arquivos de cabeçalho (.h), o mesmo cabeçalho pode ser incluído duas vezes por caminhos diferentes, e as declarações ficam duplicadas (erro de compilação). O include guard resolve: envolva o conteúdo em #ifndef NOME_H / #define NOME_H / ... / #endif, e na segunda inclusão o trecho é ignorado. A forma curta, aceita pelo compilador do Arduino (GCC), é escrever #pragma once na primeira linha do .h.',
            code: '// pinos.h\n#ifndef PINOS_H\n#define PINOS_H\nconst int LED = 13;\nconst int BOTAO = 2;\n#endif\n\n// forma curta:\n// #pragma once'
          },
          {
            title: 'static e volatile; constantes prontas',
            body: 'static em variável LOCAL faz ela guardar o valor entre chamadas da função: é inicializada uma única vez, e não é recriada a cada chamada como uma variável local comum. Isso é muito útil em loop() e em funções, para contadores e estado, sem precisar de uma global solta. static em variável GLOBAL limita o nome ao arquivo atual (escopo de arquivo), evitando conflito com nomes iguais em outros arquivos. Relembrando: volatile avisa que o valor pode mudar fora do fluxo normal (por uma ISR). A biblioteca do Arduino também traz constantes prontas: HIGH, LOW, INPUT, OUTPUT, LED_BUILTIN (o pino do LED da placa, o 13 no Uno), PI (3,14159...) e outras.',
            code: 'void contarAperto() {\n  static int total = 0;   // criada uma vez, mantém o valor\n  total++;\n  Serial.println(total);  // 1, 2, 3, ...\n}\n\nstatic int soEsteArquivo = 5;   // escopo de arquivo\nfloat area = PI * 2 * 2;        // constante PI pronta'
          }
        ]
      },
      questions: [
        mcq('q1', 'Quando o pré-processador atua?', 'c', [
          'Durante a execução, a cada volta do loop',
          'Depois que o sketch já está gravado no Arduino',
          'Antes da compilação, trocando e cortando texto a partir das linhas que começam com #',
          'Somente quando o Serial Monitor está aberto'
        ], 'Ele prepara o texto do código antes de o compilador traduzi-lo.'),
        mcq('q2', 'Qual é o problema de escrever #define LED 13; com ponto e vírgula no fim?', 'a', [
          'O ponto e vírgula faz parte do texto substituído e gera erro de sintaxe onde LED é usado',
          'Nenhum: o ponto e vírgula é obrigatório',
          'O valor 13 passa a ser tratado como texto',
          'O pino 13 deixa de existir'
        ], '#define é substituição de texto: o ; seria copiado junto, como em pinMode(13;, OUTPUT);.'),
        mcq('q3', 'Dado #define DOBRO(x) x*2, quanto vale DOBRO(3+1)?', 'd', [
          '8',
          '4',
          '2',
          '5'
        ], 'A macro vira 3+1*2; a multiplicação vem primeiro: 3 + 2 = 5. Com parênteses ((x)*2) daria 8.'),
        fill('q4', 'Complete a diretiva que define uma constante de substituição de texto:', '#___ LED 13', ['define'], '#define NOME valor troca o nome pelo valor antes da compilação.'),
        mcq('q5', 'Por que const int LED = 13; costuma ser preferido a #define LED 13?', 'b', [
          'Porque ocupa menos memória Flash em todos os casos',
          'Porque tem tipo e escopo, então o compilador consegue conferir o uso e apontar erros',
          'Porque é o único jeito de usar números no Arduino',
          'Porque dispensa o ponto e vírgula'
        ], 'const é uma constante de verdade do C++, com tipo e escopo; #define é só troca de texto.'),
        mcq('q6', 'O que acontece com um bloco #ifdef DEBUG ... #endif quando DEBUG NÃO está definido?', 'c', [
          'O bloco roda, mas mais devagar',
          'O compilador acusa erro',
          'O pré-processador remove o bloco, que não entra no programa final',
          'O bloco é executado uma única vez no setup()'
        ], 'O trecho é cortado antes da compilação, então não custa Flash, SRAM nem tempo.'),
        mcq('q7', 'Uma função tem static int n = 0; seguida de n++; e é chamada 3 vezes. Qual é o valor de n ao fim da terceira chamada?', 'b', [
          '1',
          '3',
          '0',
          '2'
        ], 'A variável static é inicializada uma só vez e mantém o valor entre chamadas: 1, 2, 3.'),
        fill('q8', 'Complete a diretiva curta que evita a inclusão duplicada de um cabeçalho .h:', '#pragma ___', ['once'], '#pragma once, na primeira linha do .h, equivale ao include guard com #ifndef.')
      ]
    },
    {
      id: 'ari-21-ponteiros-referencias',
      title: 'Ponteiros e referências',
      goal: 'Entender endereços de memória, ponteiros e referências para alterar dados dentro de funções.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Variáveis têm endereço',
            body: 'Toda variável mora em algum lugar da memória, e cada posição de memória tem um número, o endereço. Até agora usamos apenas o VALOR da variável. Um ponteiro é uma variável especial cujo valor é um endereço: ele "aponta" para outra variável. No Uno os endereços têm 16 bits, então um ponteiro ocupa 2 bytes, qualquer que seja o tipo para o qual aponta.'
          },
          {
            title: 'Os operadores & e *',
            body: 'O operador & (e comercial) aplicado a uma variável devolve o ENDEREÇO dela. Na declaração, o * indica "ponteiro para este tipo": int *p é um ponteiro para int. Fora da declaração, o * aplicado a um ponteiro DESREFERENCIA: acessa (lê ou escreve) o valor que está no endereço apontado. Assim, alterar *p altera a variável original.',
            code: 'int x = 5;\nint *p = &x;     // p guarda o endereço de x\n\n*p = 7;          // escreve 7 em x\nSerial.println(x);   // 7\nSerial.println(*p);  // 7 (lê o valor apontado)'
          },
          {
            title: 'Ponteiro nulo',
            body: 'Um ponteiro que ainda não aponta para nada válido deve valer nullptr (em C++ moderno; NULL é a forma antiga, que também funciona no Arduino). Assim você pode testar if (p != nullptr) antes de usar. Nunca desreferencie um ponteiro nulo ou não inicializado: ele guarda lixo ou zero, e escrever nesse endereço pode corromper a memória do programa ou travar a placa.',
            code: 'int *p = nullptr;      // não aponta para nada\n\nif (p != nullptr) {\n  *p = 10;             // só usa se for válido\n}'
          },
          {
            title: 'Arrays são ponteiros disfarçados',
            body: 'O nome de um array, usado numa expressão, "decai" para um ponteiro para o primeiro elemento: v é o mesmo que &v[0]. Por isso um char[] pode ser passado a uma função que recebe char*. A aritmética de ponteiros anda em elementos, não em bytes: p + 1 aponta para o próximo elemento (num int*, avança 2 bytes no Uno), e *(v + 2) é o mesmo que v[2]. O preço dessa liberdade: o C++ NÃO confere limites, então ler ou escrever fora do array não dá erro de compilação e corrompe outras variáveis.',
            code: 'int v[3] = {10, 20, 30};\nint *p = v;               // o mesmo que &v[0]\n\nSerial.println(*p);       // 10\nSerial.println(*(p + 1)); // 20, igual a v[1]\nSerial.println(*(v + 2)); // 30, igual a v[2]'
          },
          {
            title: 'const char* para texto',
            body: 'Textos literais entre aspas são arrays de char na memória, e o tipo natural para recebê-los é const char*: um ponteiro para char que não pode ser usado para alterar o texto. É o tipo que funções de texto recebem (strlen, strcmp) e o que você deve usar em parâmetros de função que só leem texto. A função percorre os caracteres até encontrar o terminador \'\\0\'.',
            code: 'void mostrar(const char *texto) {\n  Serial.println(texto);\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  mostrar("Ola, Arduino");\n}'
          },
          {
            title: 'Passando por ponteiro e por referência',
            body: 'Em C++, os argumentos são copiados, então uma função comum não consegue alterar a variável de quem chamou. Há duas saídas. Por ponteiro: o parâmetro é int *n, a chamada passa o endereço (&x) e a função usa *n. Por referência (exclusivo do C++): o parâmetro é int &n, a chamada passa x normalmente, e n funciona como outro nome para a própria variável original, sem precisar de * nem de &. A referência é mais limpa e, ao contrário do ponteiro, não pode ser nula.',
            code: 'void incPonteiro(int *n) { (*n)++; }\nvoid incReferencia(int &n) { n++; }\n\nvoid setup() {\n  int x = 5;\n  incPonteiro(&x);    // x = 6\n  incReferencia(x);   // x = 7\n}'
          },
          {
            title: 'Ponteiro para função e erros comuns',
            body: 'Uma função também tem endereço, e podemos guardá-lo em um ponteiro para função: void (*cb)() = tratar; Isso permite passar uma função como argumento, o chamado callback. É exatamente o que attachInterrupt faz: o segundo argumento é um ponteiro para a ISR. Três erros clássicos: (1) usar ponteiro não inicializado; (2) devolver o endereço de uma variável local, que deixa de existir quando a função termina e fica apontando para lixo; (3) estourar o array, escrevendo além do último elemento, como v[3] em int v[3] (os índices válidos vão de 0 a 2).',
            code: 'void tratar() { /* ISR */ }\n\nvoid (*cb)() = tratar;   // ponteiro para função\n// attachInterrupt(digitalPinToInterrupt(2), cb, FALLING);\n\nint *errado() {\n  int local = 5;\n  return &local;   // ERRO: local some ao sair da função\n}'
          }
        ]
      },
      questions: [
        mcq('q1', 'O que um ponteiro armazena?', 'd', [
          'Uma cópia do valor de outra variável',
          'Somente números negativos',
          'O nome de uma função',
          'O endereço de memória de outra variável'
        ], 'Um ponteiro é uma variável cujo valor é um endereço.'),
        mcq('q2', 'Dado int x = 5; int *p = &x; *p = 9; qual é o valor de x?', 'a', [
          '9',
          '5',
          'O endereço de x',
          'Erro de compilação'
        ], 'Escrever em *p altera a variável apontada, que é x.'),
        mcq('q3', 'O que o operador & faz quando aplicado a uma variável, como em &x?', 'c', [
          'Faz um E lógico com x',
          'Devolve o valor de x multiplicado por 2',
          'Devolve o endereço de memória de x',
          'Apaga x da memória'
        ], '&x é o endereço da variável x.'),
        fill('q4', 'Complete o valor que indica um ponteiro que não aponta para nada:', 'int *p = ___;', ['nullptr', 'NULL'], 'nullptr (ou NULL) marca ponteiro sem alvo, que pode ser testado antes do uso.'),
        mcq('q5', 'Dado int v[5]; o que o nome v representa quando usado numa expressão?', 'b', [
          'O valor do último elemento',
          'O endereço do primeiro elemento, igual a &v[0]',
          'A soma de todos os elementos',
          'O número 5'
        ], 'O array decai para um ponteiro para o primeiro elemento.'),
        mcq('q6', 'Dada void dobra(int &n) { n = n * 2; } e int a = 4; dobra(a); qual é o valor de a depois?', 'c', [
          '4',
          '2',
          '8',
          'Erro de compilação'
        ], 'Com referência, n é outro nome para a: a alteração vale no original.'),
        mcq('q7', 'Qual destes é um erro clássico com ponteiros?', 'b', [
          'Passar uma variável por referência',
          'Devolver o endereço de uma variável local, que deixa de existir ao sair da função',
          'Usar const char* para texto literal',
          'Comparar um ponteiro com nullptr'
        ], 'A variável local some quando a função termina e o ponteiro devolvido aponta para lixo.'),
        fill('q8', 'Complete o símbolo que declara o parâmetro como referência, para a função alterar a variável original:', 'void incrementa(int ___ n) {\n  n++;\n}', ['&'], 'int &n declara uma referência: n é outro nome para a variável passada.')
      ]
    },
    {
      id: 'ari-05-bibliotecas',
      title: 'Bibliotecas: reaproveitando código dos outros',
      goal: 'Instalar, incluir e usar bibliotecas, entendendo objetos e como evitar conflitos.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'O que é uma biblioteca',
            body: 'Uma biblioteca é um pacote de código pronto (classes e funções) que alguém já escreveu e testou para controlar um componente ou uma tarefa: servo, display, sensor de temperatura, cartão SD. Em vez de escrever os detalhes de comunicação, você chama funções simples. A própria IDE já traz várias (Servo, Wire, SPI, SD, EEPROM, LiquidCrystal, Stepper).'
          },
          {
            title: 'Instalando pelo Library Manager',
            body: 'No Arduino IDE abra Sketch > Include Library > Manage Libraries (ou Ctrl+Shift+I). Pesquise o nome, escolha a versão e clique em Install. A IDE baixa a biblioteca e a guarda na pasta libraries, dentro da sua pasta de sketches (por exemplo Documentos/Arduino/libraries). Depois é só incluir no sketch.'
          },
          {
            title: '#include e instalação por .zip',
            body: 'Para usar uma biblioteca, o sketch começa com #include <Nome.h>. Os sinais < > procuram nas pastas de bibliotecas; aspas, como #include "meuarquivo.h", procuram primeiro na pasta do próprio sketch. Quando a biblioteca não está no Library Manager (por exemplo baixada do GitHub em um arquivo .zip), use Sketch > Include Library > Add .ZIP Library e selecione o arquivo.',
            code: '#include <Servo.h>      // biblioteca da IDE\n#include "config.h"     // arquivo na pasta do sketch'
          },
          {
            title: 'Objetos: criando uma instância',
            body: 'Quase toda biblioteca define uma classe, um "molde". Você cria uma instância (um objeto) a partir dela e passa a chamar os métodos com a notação objeto.metodo(). Pode haver várias instâncias independentes da mesma classe, uma por componente.',
            code: '#include <Servo.h>\n\nServo garra;   // cria o objeto\nServo base;    // outro, independente\n\nvoid setup() {\n  garra.attach(9);   // objeto.metodo()\n  base.attach(10);\n}'
          },
          {
            title: 'Exemplos e documentação',
            body: 'Depois de instalar, abra File > Examples e procure o nome da biblioteca: quase todas trazem sketches prontos que mostram as ligações e o uso básico. É o melhor ponto de partida. Os nomes exatos de métodos e parâmetros estão no arquivo README ou na página da biblioteca — confira sempre, pois variam entre bibliotecas.'
          },
          {
            title: 'Conflitos e versões',
            body: 'Problemas comuns: duas bibliotecas com o mesmo nome do arquivo .h instaladas (a IDE pode escolher a errada); uma versão nova que mudou nomes de funções e quebrou o seu sketch antigo; e bibliotecas que disputam o mesmo recurso de hardware — por exemplo, no Uno a Servo usa o Timer1 e por isso desativa o analogWrite (PWM) nos pinos 9 e 10. Anote a versão que funcionou e leia a mensagem de erro: ela costuma apontar a biblioteca envolvida.'
          }
        ]
      },
      questions: [
        mcq('q1', 'O que é uma biblioteca no Arduino?', 'b', [
          'Uma placa de expansão que se encaixa no Uno',
          'Um pacote de código pronto que simplifica o uso de um componente ou tarefa',
          'Um tipo de variável',
          'Um driver do sistema operacional'
        ], 'Bibliotecas empacotam funções e classes prontas, como Servo, Wire e SD.'),
        mcq('q2', 'Como instalar uma biblioteca disponível no repositório oficial pela IDE?', 'a', [
          'Sketch > Include Library > Manage Libraries (Library Manager) e clicar em Install',
          'Copiar o código no setup()',
          'Conectar a placa e apertar reset',
          'Usar o Serial Monitor'
        ], 'O Library Manager pesquisa, baixa e instala a biblioteca na pasta libraries.'),
        mcq('q3', 'Qual a diferença entre #include <Servo.h> e #include "config.h"?', 'd', [
          'Não há diferença nenhuma',
          '< > só funciona com Servo',
          'Aspas só funcionam em arquivos .zip',
          'Os sinais < > procuram nas pastas de bibliotecas; as aspas procuram primeiro na pasta do sketch'
        ], 'Aspas indicam arquivo local do projeto; colchetes angulares indicam bibliotecas instaladas.'),
        fill('q4', 'Complete a diretiva que inclui uma biblioteca no sketch:', '#___ <Servo.h>', ['include'], '#include faz o compilador carregar o cabeçalho da biblioteca.'),
        mcq('q5', 'Em Servo garra; garra.attach(9); o que é "garra"?', 'c', [
          'Uma função da biblioteca',
          'O nome do pino 9',
          'Um objeto (instância) da classe Servo',
          'Uma constante da IDE'
        ], 'Servo é a classe; garra é uma instância, e attach é um método chamado com a notação objeto.metodo().'),
        mcq('q6', 'Uma biblioteca não está no Library Manager e você baixou um arquivo .zip dela. O que fazer?', 'b', [
          'Descompactar dentro da pasta do Windows',
          'Sketch > Include Library > Add .ZIP Library e selecionar o arquivo',
          'Colar o conteúdo do .zip no Serial Monitor',
          'Renomear o .zip para .ino'
        ], 'A IDE instala o .zip na pasta libraries, e depois basta incluir com #include.'),
        mcq('q7', 'Qual cuidado ajuda a evitar conflitos entre bibliotecas e versões?', 'a', [
          'Anotar a versão que funcionou e checar quais recursos de hardware (como timers/pinos) cada biblioteca usa',
          'Instalar sempre todas as versões ao mesmo tempo',
          'Nunca usar mais de uma biblioteca',
          'Apagar a pasta libraries antes de cada upload'
        ], 'Versões novas podem mudar a API, e bibliotecas podem disputar o mesmo timer (ex.: Servo desativa PWM nos pinos 9 e 10 no Uno).'),
        fill('q8', 'Complete o nome da pasta onde a IDE guarda as bibliotecas instaladas por você (Documentos/Arduino/___):', 'Documentos/Arduino/___/', ['libraries'], 'As bibliotecas instaladas ficam na pasta libraries dentro da pasta de sketches.')
      ]
    },
    {
      id: 'ari-06-servo',
      title: 'Servo motor',
      goal: 'Posicionar um servo com precisão usando a biblioteca Servo e alimentá-lo corretamente.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Como um servo funciona',
            body: 'Um servo hobby (como o SG90) é uma caixa com um motor DC, engrenagens de redução, um potenciômetro que mede o ângulo do eixo e um circuito de controle. Você não diz "gire", diz "vá para esta posição": o circuito compara a posição desejada com a lida pelo potenciômetro e move o motor até igualar. A maioria gira cerca de 0° a 180°.'
          },
          {
            title: 'O sinal de controle: pulso a 50 Hz',
            body: 'O servo recebe um pulso repetido a cada 20 ms (50 Hz). A LARGURA do pulso define o ângulo: aproximadamente 1 ms = 0°, 1,5 ms = 90° (centro) e 2 ms = 180°. Os valores exatos variam entre modelos (muitos servos pequenos usam de cerca de 0,5 ms a 2,4 ms). Esse sinal não é PWM de analogWrite, e a biblioteca Servo cuida de gerá-lo para você.'
          },
          {
            title: 'Ligações e a biblioteca Servo.h',
            body: 'Três fios: marrom ou preto = GND; vermelho = +5 V; laranja ou amarelo = sinal (ligado a um pino digital). Com a Servo.h: attach(pino) liga o objeto ao pino; write(angulo) move para o ângulo (0 a 180); read() devolve o último ângulo escrito; writeMicroseconds(us) define a largura do pulso diretamente (1500 é o centro); detach() libera o pino.',
            code: '#include <Servo.h>\n\nServo meuServo;\n\nvoid setup() {\n  meuServo.attach(9);          // sinal no pino 9\n  meuServo.write(90);          // vai ao centro\n  // meuServo.writeMicroseconds(1500); // também centro\n}\n\nvoid loop() {}'
          },
          {
            title: 'Alimentação separada e GND comum',
            body: 'O servo é um motor: ao partir ou ao encontrar carga pode puxar centenas de miliampères em picos. Ligá-lo ao 5 V do Arduino pode causar quedas de tensão, reinicializações e travamentos; com vários servos é quase certo. A solução: fonte externa de 5 V (tipicamente 4,8 a 6 V) para os servos, e conectar o GND dessa fonte ao GND do Arduino (GND comum). Sem GND comum o sinal de controle não tem referência e o servo se comporta de forma errática. Nunca ligue o + da fonte externa ao 5 V do Arduino ao mesmo tempo que o USB sem saber o que faz. Um capacitor eletrolítico (ex.: 470 µF) perto do servo ajuda a suavizar os picos.'
          },
          {
            title: 'Varredura (sweep)',
            body: 'Para varrer o ângulo, use um for que aumenta e depois diminui a posição, com uma pequena pausa para dar tempo ao servo de chegar (o servo não é instantâneo). Pausas de 10 a 20 ms por grau são comuns; se quiser multitarefa, troque o delay pelo padrão com millis.',
            code: 'void loop() {\n  for (int pos = 0; pos <= 180; pos++) {\n    meuServo.write(pos);\n    delay(15);\n  }\n  for (int pos = 180; pos >= 0; pos--) {\n    meuServo.write(pos);\n    delay(15);\n  }\n}'
          }
        ]
      },
      questions: [
        mcq('q1', 'O que determina o ângulo de um servo hobby?', 'c', [
          'A tensão da alimentação',
          'A frequência do sinal, que varia de 1 a 180 Hz',
          'A largura do pulso, repetido a cada 20 ms (50 Hz)',
          'A cor do fio de sinal'
        ], 'O período fixo é de 20 ms e a largura do pulso (em torno de 1 a 2 ms) escolhe a posição.'),
        mcq('q2', 'Qual comando coloca o servo na posição central (90°)?', 'b', [
          'meuServo.attach(90);',
          'meuServo.write(90);',
          'meuServo.read(0);',
          'meuServo.detach(90);'
        ], 'write(angulo) move o eixo; attach só associa o objeto ao pino.'),
        mcq('q3', 'Por que usar uma fonte externa para servos e ligar os GNDs juntos?', 'a', [
          'Porque o servo puxa picos de corrente que o 5 V do Arduino não sustenta, e o GND comum dá referência ao sinal',
          'Porque o servo funciona com 220 V',
          'Para o servo girar mais de 180°',
          'Porque o GND comum aumenta a velocidade do clock'
        ], 'Picos de corrente derrubam a tensão do Arduino; sem GND comum o sinal de controle perde a referência.'),
        fill('q4', 'Complete o método que associa o objeto servo ao pino de sinal:', 'Servo meuServo;\n\nvoid setup() {\n  meuServo.___(9);\n}', ['attach'], 'attach(pino) liga o objeto Servo ao pino que envia o pulso de controle.'),
        mcq('q5', 'Qual é o intervalo de ângulos aceito por write()?', 'd', [
          '0 a 100',
          '0 a 255',
          '0 a 1023',
          '0 a 180'
        ], 'write recebe graus de 0 a 180 (valores maiores são interpretados como microssegundos).'),
        mcq('q6', 'No sweep com for (pos = 0; pos <= 180; pos++) { write(pos); delay(15); }, para que serve o delay(15)?', 'b', [
          'Para aumentar a tensão do servo',
          'Para dar tempo ao eixo de chegar a cada posição, tornando o movimento suave e controlado',
          'Para reiniciar a biblioteca',
          'Para trocar o pino de sinal'
        ], 'O servo leva tempo para se mover; sem pausa o loop pediria os ângulos rápido demais.'),
        mcq('q7', 'Com o servo recebendo pulsos a cada 20 ms, qual é a frequência?', 'c', [
          '20 Hz',
          '5 Hz',
          '50 Hz',
          '200 Hz'
        ], '1 / 0,020 s = 50 Hz.'),
        fill('q8', 'Complete o método que define a largura do pulso em microssegundos (1500 = centro):', 'meuServo.___(1500);', ['writeMicroseconds'], 'writeMicroseconds(us) escolhe diretamente a largura do pulso, sendo 1500 µs o centro típico.')
      ]
    },
    {
      id: 'ari-07-motor-dc',
      title: 'Motor DC, transistor e ponte H',
      goal: 'Acionar motores DC com segurança, controlando velocidade e sentido.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Por que não ligar o motor direto no pino',
            body: 'Um pino digital do Uno fornece poucos miliampères (o limite absoluto é 40 mA, e o recomendado é ficar perto de 20 mA). Um motor pequeno já puxa de dezenas a centenas de mA, e na partida muito mais. Ligá-lo direto no pino pode queimar a porta ou o microcontrolador inteiro. Além disso, motor é carga indutiva: ao desligar, gera picos de tensão que também danificam a eletrônica. O Arduino deve só COMANDAR; a potência vem de uma fonte externa, passando por um componente de chaveamento.'
          },
          {
            title: 'Transistor como chave',
            body: 'Um transistor NPN (por exemplo 2N2222, BC337 ou, para mais corrente, TIP120) funciona como interruptor controlado por uma corrente pequena. Ligação: emissor ao GND; coletor ao motor (o outro terminal do motor vai ao + da fonte); base ao pino do Arduino através de um resistor (cerca de 1 kΩ) que limita a corrente de base. Pino em HIGH: o transistor conduz e o motor liga. Pino em LOW: desliga. O GND da fonte do motor deve ser comum ao GND do Arduino.',
            code: 'const int PINO_MOTOR = 9;   // pino -> 1 kohm -> base\n\nvoid setup() {\n  pinMode(PINO_MOTOR, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(PINO_MOTOR, HIGH);  // liga\n  delay(2000);\n  digitalWrite(PINO_MOTOR, LOW);   // desliga\n  delay(2000);\n}'
          },
          {
            title: 'Diodo de roda livre (flyback)',
            body: 'A bobina do motor armazena energia magnética. Ao cortar a corrente de repente, ela gera uma tensão reversa muito alta (pico de centenas de volts em casos extremos) que pode destruir o transistor e o Arduino. A proteção é um diodo (por exemplo 1N4007 ou 1N4148) ligado em paralelo com o motor, em sentido oposto à corrente normal: o cátodo (lado da faixa) vai para o + da fonte e o ânodo para o lado do coletor. Assim o pico encontra um caminho seguro. É obrigatório em qualquer carga indutiva: motores, relés e solenoides.'
          },
          {
            title: 'Controlando a velocidade com PWM',
            body: 'Com o transistor num pino PWM (3, 5, 6, 9, 10 ou 11 no Uno), analogWrite(pino, 0 a 255) liga e desliga o motor muito rápido; a proporção de tempo ligado altera a potência média e, portanto, a velocidade. 0 = parado, 255 = velocidade máxima. Motores costumam não partir com valores muito baixos de PWM por falta de torque.',
            code: 'analogWrite(PINO_MOTOR, 128);  // aproximadamente metade da potência'
          },
          {
            title: 'Ponte H: invertendo o sentido',
            body: 'Com um transistor só, o motor gira para um lado. Para inverter, precisamos inverter a polaridade da alimentação: isso é o que a ponte H faz, com quatro chaves em formato de H em volta do motor. Circuitos integrados prontos trazem tudo: o L293D (cerca de 600 mA por canal, com diodos internos) e o módulo L298N (até 2 A por canal, em geral com diodos no módulo). Cada canal tem duas entradas de direção (IN1, IN2) e uma de habilitação (EN/ENA) que recebe o PWM da velocidade.'
          },
          {
            title: 'Direção e velocidade no código',
            body: 'IN1 em HIGH e IN2 em LOW: gira num sentido. IN1 em LOW e IN2 em HIGH: gira no sentido contrário. As duas iguais: o motor para (freia). O pino EN com analogWrite controla a velocidade. Alimentação: a fonte do motor (de acordo com a tensão do motor) entra no pino de potência da ponte H (VS/VMOT no L293D, entrada de 12 V no L298N), separada da lógica de 5 V, e todos os GNDs são comuns. Para segurança, não manuseie a fiação com a fonte ligada.',
            code: 'const int IN1 = 7, IN2 = 8, EN = 9;\n\nvoid frente(int vel) {\n  digitalWrite(IN1, HIGH);\n  digitalWrite(IN2, LOW);\n  analogWrite(EN, vel);\n}\n\nvoid tras(int vel) {\n  digitalWrite(IN1, LOW);\n  digitalWrite(IN2, HIGH);\n  analogWrite(EN, vel);\n}\n\nvoid parar() {\n  digitalWrite(IN1, LOW);\n  digitalWrite(IN2, LOW);\n  analogWrite(EN, 0);\n}'
          }
        ]
      },
      questions: [
        mcq('q1', 'Por que não se deve ligar um motor DC diretamente a um pino do Arduino?', 'b', [
          'Porque o pino só funciona com sinais analógicos',
          'Porque o motor puxa mais corrente do que o pino suporta e gera picos que podem danificar a placa',
          'Porque o motor só funciona em 220 V',
          'Porque o pino não pode ficar em LOW'
        ], 'O pino aguenta poucos mA (limite absoluto 40 mA); o motor exige mais, e é carga indutiva.'),
        mcq('q2', 'Qual é o papel do transistor NPN no acionamento de um motor?', 'd', [
          'Aumentar a tensão do Arduino',
          'Armazenar energia para o motor',
          'Converter sinal digital em analógico',
          'Funcionar como chave: uma pequena corrente de base controla a corrente maior do motor'
        ], 'O Arduino comanda a base; a corrente do motor passa por coletor e emissor, vinda da fonte externa.'),
        mcq('q3', 'Para que serve o diodo de roda livre (flyback) em paralelo com o motor?', 'a', [
          'Dar caminho seguro ao pico de tensão gerado pela bobina quando a corrente é cortada',
          'Aumentar a velocidade do motor',
          'Inverter o sentido de giro',
          'Reduzir o consumo de energia do Arduino'
        ], 'A energia da bobina gera um pico reverso ao desligar; o diodo o conduz sem passar pelo transistor.'),
        fill('q4', 'Complete a função que gera PWM para variar a velocidade do motor no pino 9:', 'void loop() {\n  ___(9, 128);\n}', ['analogWrite'], 'analogWrite(pino, 0 a 255) altera a potência média por PWM.'),
        mcq('q5', 'Qual circuito permite inverter o sentido de giro de um motor DC?', 'c', [
          'Um resistor em série',
          'Um capacitor em paralelo',
          'Uma ponte H, como o L293D ou o módulo L298N',
          'Um LED de alto brilho'
        ], 'A ponte H inverte a polaridade aplicada ao motor com quatro chaves em formato de H.'),
        mcq('q6', 'Em uma ponte H com IN1 e IN2, o que ocorre com IN1 = LOW e IN2 = HIGH, comparado a IN1 = HIGH e IN2 = LOW?', 'b', [
          'O motor gira na mesma direção, mais rápido',
          'O motor gira no sentido contrário',
          'O motor é desligado e o Arduino reinicia',
          'Nada muda'
        ], 'Trocar o par de níveis inverte a polaridade no motor e, portanto, o sentido.'),
        mcq('q7', 'Quando a fonte do motor é externa, qual ligação é essencial entre ela e o Arduino?', 'a', [
          'GND comum entre a fonte do motor e o Arduino',
          'Ligar o + da fonte ao pino 5V do Arduino',
          'Ligar o + da fonte ao pino de sinal',
          'Nenhuma ligação é necessária'
        ], 'Sem GND comum o sinal de controle não tem referência. O + da fonte do motor não vai ao 5V do Arduino.'),
        fill('q8', 'Complete o nível lógico: com IN1 = HIGH e ___ em IN2, o motor gira num sentido definido (o sentido oposto usa IN1 = LOW e IN2 = HIGH):', 'digitalWrite(IN1, HIGH);\ndigitalWrite(IN2, ___);', ['LOW', '0'], 'Um pino em HIGH e o outro em LOW define o sentido; iguais param o motor.')
      ]
    },
    {
      id: 'ari-08-motor-passo',
      title: 'Motor de passo',
      goal: 'Girar um motor de passo com precisão usando Stepper.h ou um driver STEP/DIR.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Princípio de funcionamento',
            body: 'O motor de passo gira em passos discretos: suas bobinas são energizadas em sequência e o rotor avança um pequeno ângulo a cada mudança. Um motor de 1,8° por passo dá 200 passos por volta (360 ÷ 1,8 = 200). Contando os passos, sabemos a posição sem sensor, o que é ótimo para impressoras 3D, câmeras e posicionamento. O preço: velocidade e torque menores e consumo contínuo de corrente mesmo parado (retém posição).'
          },
          {
            title: '28BYJ-48 com ULN2003',
            body: 'O 28BYJ-48 é um motor de passo pequeno e barato, de 5 V, com caixa de redução interna (cerca de 1:64). Na prática usa-se cerca de 2048 passos para uma volta completa do eixo de saída. Ele não deve ser ligado direto aos pinos: vem acompanhado de uma placa com o chip ULN2003 (conjunto de transistores Darlington), que tem 4 entradas (IN1 a IN4) ligadas a pinos do Arduino e uma entrada de alimentação 5 V externa, com GND comum. Os diodos de proteção estão dentro do ULN2003.'
          },
          {
            title: 'A biblioteca Stepper.h',
            body: 'A biblioteca Stepper acompanha a IDE. Cria-se o objeto com o número de passos por volta e os pinos; setSpeed(rpm) define a velocidade em rotações por minuto; step(n) move n passos (positivo num sentido, negativo no outro). Atenção: step() é bloqueante, só retorna ao terminar o movimento. Curiosidade do 28BYJ-48: com o ULN2003 a ordem correta dos pinos na biblioteca costuma ser IN1, IN3, IN2, IN4, ou seja, 8, 10, 9, 11.',
            code: '#include <Stepper.h>\n\nconst int PASSOS_VOLTA = 2048;\nStepper motor(PASSOS_VOLTA, 8, 10, 9, 11);\n\nvoid setup() {\n  motor.setSpeed(10);        // 10 rpm\n}\n\nvoid loop() {\n  motor.step(PASSOS_VOLTA);  // uma volta num sentido\n  delay(500);\n  motor.step(-PASSOS_VOLTA); // uma volta no outro\n  delay(500);\n}'
          },
          {
            title: 'Driver A4988: STEP e DIR',
            body: 'Para motores maiores (como o NEMA 17, 200 passos por volta) usa-se um driver como o A4988. Ele recebe apenas dois sinais de controle: STEP, em que cada pulso gera UM passo (ou um micropasso, conforme MS1 a MS3); e DIR, que define o sentido (HIGH ou LOW). A velocidade é a frequência dos pulsos em STEP. O driver tem um trimpot para limitar a corrente do motor e uma alimentação própria (VMOT, de 8 a 35 V) com capacitor eletrolítico de pelo menos 47 µF perto dela. Jamais desconecte ou conecte o motor com a alimentação ligada: pode queimar o driver.',
            code: 'const int STEP = 3, DIR = 4;\n\nvoid setup() {\n  pinMode(STEP, OUTPUT);\n  pinMode(DIR, OUTPUT);\n  digitalWrite(DIR, HIGH);        // sentido\n}\n\nvoid loop() {\n  digitalWrite(STEP, HIGH);\n  delayMicroseconds(800);\n  digitalWrite(STEP, LOW);\n  delayMicroseconds(800);         // 1 passo a cada 1,6 ms\n}'
          },
          {
            title: 'Calculando passos e velocidade',
            body: 'Passos por volta = 360 ÷ ângulo por passo. Para girar uma fração da volta use regra de três: meia volta de um motor de 200 passos são 100 passos; um quarto de volta, 50. Com a Stepper.h a velocidade é dada em rpm; com o A4988 depende do intervalo entre pulsos (menor intervalo, mais rápido). Se acelerar demais o motor perde passos e "trava": comece devagar.'
          }
        ]
      },
      questions: [
        mcq('q1', 'Quantos passos por volta tem um motor de passo de 1,8° por passo?', 'c', [
          '100',
          '180',
          '200',
          '360'
        ], '360 / 1,8 = 200 passos por volta.'),
        mcq('q2', 'Qual é a principal vantagem do motor de passo em relação a um motor DC comum?', 'a', [
          'Posicionamento controlado contando passos, sem sensor de posição',
          'Muito maior velocidade e torque',
          'Dispensa fonte de alimentação',
          'Funciona direto no pino do Arduino sem driver'
        ], 'Cada passo é um ângulo conhecido; contar passos dá a posição.'),
        mcq('q3', 'Qual é o papel do ULN2003 que acompanha o 28BYJ-48?', 'd', [
          'Gerar o sinal de PWM',
          'Medir a velocidade do motor',
          'Armazenar o código do sketch',
          'Amplificar a corrente dos pinos do Arduino com transistores Darlington'
        ], 'O ULN2003 aciona as bobinas com corrente maior do que os pinos suportam.'),
        fill('q4', 'Complete o método da biblioteca Stepper que define a velocidade em rpm:', 'motor.___(10);', ['setSpeed'], 'setSpeed(rpm) define a velocidade; step(n) executa o movimento.'),
        mcq('q5', 'Com Stepper motor(2048, 8, 10, 9, 11); o que faz motor.step(-512)?', 'b', [
          'Gira um quarto de volta no mesmo sentido que step(512)',
          'Gira um quarto de volta (512 de 2048) no sentido oposto ao de step(512)',
          'Gira 512 voltas',
          'Gera erro de compilação'
        ], '512 é 1/4 de 2048; sinal negativo inverte o sentido.'),
        mcq('q6', 'No driver A4988, qual a função dos pinos STEP e DIR?', 'c', [
          'STEP liga a alimentação; DIR desliga',
          'STEP lê a temperatura; DIR mede a corrente',
          'Cada pulso em STEP dá um passo (ou micropasso); DIR escolhe o sentido',
          'Ambos definem a velocidade em rpm'
        ], 'O driver traduz pulsos de STEP em passos e usa o nível de DIR para o sentido.'),
        mcq('q7', 'Por que step() da biblioteca Stepper é um problema para multitarefa?', 'b', [
          'Porque só funciona com um motor',
          'Porque é bloqueante: só retorna quando o movimento terminou',
          'Porque precisa de interrupções externas',
          'Porque usa o pino do Serial'
        ], 'Enquanto o motor se move, o loop não faz mais nada; para multitarefa usa-se um passo de cada vez com millis.'),
        fill('q8', 'Complete o número de passos para uma volta completa de um motor de 1,8° por passo:', 'const int PASSOS_VOLTA = ___;', ['200'], '360 dividido por 1,8 dá 200 passos.')
      ]
    },
    {
      id: 'ari-09-lcd',
      title: 'Display LCD 16x2',
      goal: 'Mostrar textos e valores em um LCD de caracteres, em modo paralelo e I2C.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'O LCD 16x2 e seus pinos',
            body: 'O LCD 16x2 (controlador HD44780) mostra 2 linhas de 16 caracteres. Tem 16 pinos: VSS (GND), VDD (+5 V), V0 (contraste), RS, RW, E, D0 a D7, A e K (luz de fundo). V0 vai ao ponto do meio de um potenciômetro de 10 kΩ entre 5 V e GND; é ele que regula o contraste. RW vai ao GND (só escrevemos). A (anodo da luz de fundo) vai ao 5 V por um resistor (cerca de 220 Ω), e K ao GND.'
          },
          {
            title: 'Modo paralelo de 4 bits',
            body: 'O LCD aceita 8 bits de dados (D0 a D7) ou só 4 (D4 a D7), enviando cada byte em duas metades. O modo de 4 bits economiza pinos: usa apenas RS, E, D4, D5, D6 e D7 (6 pinos do Arduino). Com a biblioteca LiquidCrystal, criamos o objeto com os pinos na ordem (rs, enable, d4, d5, d6, d7).',
            code: '#include <LiquidCrystal.h>\n\n//                RS  E  D4 D5 D6 D7\nLiquidCrystal lcd(12, 11, 5, 4, 3, 2);'
          },
          {
            title: 'begin, print, setCursor e clear',
            body: 'lcd.begin(16, 2) inicializa dizendo colunas e linhas. lcd.print() escreve texto ou números a partir do cursor. lcd.setCursor(coluna, linha) move o cursor: as colunas vão de 0 a 15 e as linhas de 0 a 1 (primeiro a coluna, depois a linha). lcd.clear() apaga tudo e leva o cursor ao início.',
            code: 'void setup() {\n  lcd.begin(16, 2);\n  lcd.print("Ola, Arduino!");\n  lcd.setCursor(0, 1);        // coluna 0, linha 1 (segunda)\n  lcd.print("t(s): ");\n}\n\nvoid loop() {\n  lcd.setCursor(6, 1);\n  lcd.print(millis() / 1000);\n}'
          },
          {
            title: 'Problemas comuns: contraste e sobras',
            body: 'Se o LCD acende mas não aparece texto (ou aparecem blocos na primeira linha), quase sempre é o contraste: gire o potenciômetro. Outro detalhe: setCursor + print só escreve por cima das letras antigas. Se um número muda de "100" para "9", sobra "900"; apague a área escrevendo espaços (por exemplo print("9  ")) ou use lcd.clear() quando o texto todo muda — mas clear em toda volta do loop faz a tela piscar.'
          },
          {
            title: 'Versão I2C: só 2 fios de dados',
            body: 'Existe uma placa adaptadora (com o chip PCF8574) soldada atrás do LCD que converte tudo para I2C: 4 pinos (GND, VCC, SDA e SCL), ligados ao Arduino em A4 (SDA) e A5 (SCL). O potenciômetro de contraste fica na própria placa. Usa-se a biblioteca LiquidCrystal_I2C, instalada pelo Library Manager, com o endereço I2C do módulo (comumente 0x27 ou 0x3F), colunas e linhas. print, setCursor e clear funcionam do mesmo jeito. Para ligar a luz de fundo: lcd.backlight(). No setup chama-se lcd.init().',
            code: '#include <Wire.h>\n#include <LiquidCrystal_I2C.h>\n\nLiquidCrystal_I2C lcd(0x27, 16, 2);\n\nvoid setup() {\n  lcd.init();\n  lcd.backlight();\n  lcd.setCursor(0, 0);\n  lcd.print("LCD via I2C");\n}'
          }
        ]
      },
      questions: [
        mcq('q1', 'Quantos pinos do Arduino usa o LCD 16x2 no modo paralelo de 4 bits com a biblioteca LiquidCrystal (sem contar alimentação)?', 'd', [
          '2',
          '4',
          '11',
          '6'
        ], 'RS, E, D4, D5, D6 e D7: 6 pinos, com RW no GND.'),
        mcq('q2', 'O LCD está aceso mas não mostra texto legível. Qual é a causa mais comum?', 'b', [
          'Falta de biblioteca no Arduino',
          'Contraste (V0) mal ajustado: girar o potenciômetro',
          'Pino TX em curto',
          'O LCD só funciona com Serial aberto'
        ], 'V0 controla o contraste; blocos escuros ou tela em branco costumam indicar ajuste errado.'),
        mcq('q3', 'O que faz lcd.setCursor(3, 1)?', 'a', [
          'Coloca o cursor na coluna 3 da segunda linha',
          'Coloca o cursor na linha 3, coluna 1',
          'Escreve o número 31 no LCD',
          'Apaga a coluna 3'
        ], 'A ordem é (coluna, linha), ambas contadas a partir de 0; linha 1 é a segunda.'),
        fill('q4', 'Complete o método que inicializa o LCD informando 16 colunas e 2 linhas:', 'void setup() {\n  lcd.___(16, 2);\n}', ['begin'], 'lcd.begin(colunas, linhas) prepara o display no LiquidCrystal.'),
        mcq('q5', 'Um contador mostra 100 e depois passa a mostrar 9 no mesmo lugar, aparecendo "900". Qual a solução simples?', 'c', [
          'Aumentar o contraste',
          'Trocar o Arduino',
          'Escrever espaços para limpar as posições restantes (ex.: print("9  ")) ou limpar a linha',
          'Usar delay(1000)'
        ], 'print só sobrescreve as posições escritas; os caracteres antigos continuam no display.'),
        mcq('q6', 'Qual a vantagem do módulo adaptador I2C no LCD?', 'b', [
          'Torna o display colorido',
          'Reduz a ligação de dados a dois fios (SDA e SCL), liberando pinos do Arduino',
          'Elimina a necessidade de alimentação',
          'Aumenta o tamanho para 20 colunas'
        ], 'O adaptador com PCF8574 converte o paralelo em I2C: SDA, SCL, VCC e GND.'),
        mcq('q7', 'No Arduino Uno, em quais pinos o LCD I2C se liga para dados?', 'a', [
          'A4 (SDA) e A5 (SCL)',
          '2 e 3',
          '0 e 1',
          '11 e 12'
        ], 'No Uno o barramento I2C usa A4 e A5 (os mesmos pinos marcados SDA e SCL).'),
        fill('q8', 'Complete o método que apaga todo o conteúdo do display:', 'lcd.___();', ['clear'], 'lcd.clear() limpa a tela e volta o cursor ao canto superior esquerdo.')
      ]
    },
    {
      id: 'ari-22-oled',
      title: 'Display OLED SSD1306 (I2C)',
      goal: 'Mostrar texto, formas e leituras de sensores em um OLED monocromático, entendendo o custo de memória do buffer.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'OLED versus LCD',
            body: 'Em um LCD 16x2 a luz vem de um backlight (lâmpada de fundo) e os caracteres são "sombras" na frente dele. Em um OLED cada pixel é um minúsculo diodo que emite luz própria: não existe backlight, o preto é realmente apagado (contraste altíssimo) e o display é fino e legível em ângulos amplos. O módulo mais comum tem 128x64 pixels, monocromático (um pixel está aceso ou apagado), com o controlador SSD1306 e quatro pinos: VCC, GND, SCL e SDA. A comunicação é I2C (como na lição de I2C), no Uno SDA = A4 e SCL = A5. O endereço típico é 0x3C (alguns módulos usam 0x3D); se estiver em dúvida, rode o scanner de endereços.'
          },
          {
            title: 'Bibliotecas e inicialização',
            body: 'Usamos duas bibliotecas da Adafruit, instaladas pelo Library Manager: Adafruit_SSD1306 (o driver do chip, que sabe falar com o display) e Adafruit_GFX (as funções gráficas: texto, linhas, círculos). Criamos um objeto Adafruit_SSD1306 com largura, altura, a interface (&Wire) e o pino de reset (-1 significa "sem pino de reset"). display.begin(...) inicia o display e devolve false se ele não responder; por isso é comum testar o resultado e travar com uma mensagem de erro.',
            code: '#include <Wire.h>\n#include <Adafruit_GFX.h>\n#include <Adafruit_SSD1306.h>\n\nAdafruit_SSD1306 display(128, 64, &Wire, -1);\n\nvoid setup() {\n  Serial.begin(9600);\n  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {\n    Serial.println(F("OLED nao encontrado"));\n    for (;;);   // trava aqui\n  }\n}'
          },
          {
            title: 'Escrevendo texto',
            body: 'A rotina padrão é: clearDisplay() apaga o desenho, setTextSize(n) escolhe o tamanho (1 = caracteres de 6x8 pixels, 2 = o dobro...), setTextColor(SSD1306_WHITE) escolhe a cor (num display monocromático "branco" significa pixel aceso), setCursor(x, y) posiciona o canto superior esquerdo do próximo texto e print/println escrevem como na Serial. Com tamanho 1 cabem 21 caracteres por linha e 8 linhas na tela de 128x64. ATENÇÃO: nada disso aparece ainda; falta o passo final, display().',
            code: 'void loop() {\n  display.clearDisplay();\n  display.setTextSize(1);\n  display.setTextColor(SSD1306_WHITE);\n  display.setCursor(0, 0);\n  display.println(F("Ola, OLED!"));\n  display.print(F("Contagem: "));\n  display.println(millis() / 1000);\n  display.display();   // envia para a tela\n  delay(500);\n}'
          },
          {
            title: 'Desenhando formas',
            body: 'O sistema de coordenadas tem a origem (0, 0) no canto superior esquerdo: x cresce para a direita (0 a 127) e y cresce para BAIXO (0 a 63). Funções principais: drawPixel(x, y, cor) acende um ponto; drawLine(x0, y0, x1, y1, cor) traça uma linha; drawRect(x, y, largura, altura, cor) desenha só o contorno do retângulo; fillRect(x, y, largura, altura, cor) preenche; drawCircle(x, y, raio, cor) desenha o contorno de um círculo centrado em (x, y). Usar SSD1306_BLACK como cor apaga os pixels, o que serve para "limpar" uma região.',
            code: 'display.clearDisplay();\ndisplay.drawLine(0, 0, 127, 63, SSD1306_WHITE);\ndisplay.drawRect(10, 10, 40, 20, SSD1306_WHITE);\ndisplay.fillRect(60, 10, 30, 20, SSD1306_WHITE);\ndisplay.drawCircle(100, 45, 12, SSD1306_WHITE);\ndisplay.display();'
          },
          {
            title: 'O buffer em RAM: 1024 bytes',
            body: 'Todas as funções de desenho NÃO falam com o display: elas só alteram uma cópia da imagem guardada na SRAM do Arduino, chamada buffer (ou framebuffer). Só quando você chama display() o buffer inteiro é enviado pelo I2C. Como cada pixel é 1 bit, o buffer ocupa 128 x 64 = 8192 bits = 1024 bytes. O Uno tem apenas 2048 bytes de SRAM: o OLED consome METADE dela. Consequências práticas: sobra pouca memória para variáveis, vetores e Strings; use F() nos textos (como na lição de strings), evite String e vetores grandes. Se faltar memória, o begin() pode falhar ou o programa se comportar de forma estranha.'
          },
          {
            title: 'Atualização e flicker',
            body: 'O display() sempre envia o buffer inteiro (1024 bytes) e, em I2C padrão de 100 kHz, isso leva da ordem de 100 ms (com Wire.setClock(400000) cai bastante). Por isso: monte o quadro completo (clearDisplay, texto e desenhos) e chame display() UMA vez no fim. Se você chamar display() logo após clearDisplay() e antes de desenhar, a tela mostra um instante vazio e pisca (flicker). Outra boa prática é redesenhar somente quando o valor mudou: guarde o último valor mostrado e só atualize a tela se ele for diferente.',
            code: 'int ultimo = -1;\n\nvoid loop() {\n  int leitura = analogRead(A0);\n  if (leitura != ultimo) {   // so quando mudou\n    ultimo = leitura;\n    display.clearDisplay();\n    display.setCursor(0, 0);\n    display.print(leitura);\n    display.display();\n  }\n}'
          },
          {
            title: 'Mostrando leituras de sensores',
            body: 'Para exibir um sensor sem travar o programa, combine tudo: leia o sensor a cada intervalo usando millis() (não delay), monte o quadro e envie com display(). Textos grandes (setTextSize(2) ou 3) ajudam a ler o número de longe, e uma barra feita com fillRect cuja largura é proporcional à leitura (map) dá um indicador visual rápido.',
            code: 'unsigned long ultimoT = 0;\n\nvoid loop() {\n  if (millis() - ultimoT >= 500) {\n    ultimoT = millis();\n    int v = analogRead(A0);\n    int barra = map(v, 0, 1023, 0, 128);\n    display.clearDisplay();\n    display.setTextSize(2);\n    display.setCursor(0, 0);\n    display.print(v);\n    display.fillRect(0, 40, barra, 10, SSD1306_WHITE);\n    display.display();\n  }\n}'
          }
        ]
      },
      questions: [
        mcq('q1', 'Qual é a principal diferença entre um display OLED e um LCD com backlight?', 'b', [
          'O OLED só mostra números',
          'No OLED cada pixel emite luz própria: não há backlight e o preto é realmente apagado',
          'O OLED não precisa de alimentação',
          'O OLED é sempre colorido'
        ], 'Pixels emissivos dispensam o backlight e dão contraste muito alto.'),
        mcq('q2', 'Qual é o endereço I2C típico de um módulo OLED SSD1306 128x64?', 'c', [
          '0x68',
          '0x27',
          '0x3C',
          '0x10'
        ], '0x3C é o mais comum (alguns módulos usam 0x3D); 0x68 é do RTC e 0x27 do LCD com adaptador.'),
        mcq('q3', 'Para que servem as duas bibliotecas Adafruit_SSD1306 e Adafruit_GFX?', 'a', [
          'A SSD1306 é o driver do chip do display e a GFX fornece as funções de texto e desenho',
          'As duas servem só para acender o backlight',
          'A GFX lê sensores e a SSD1306 lê botões',
          'Ambas substituem a biblioteca Wire'
        ], 'O driver conversa com o chip; a GFX oferece print, linhas, retângulos e círculos.'),
        fill('q4', 'Complete o método que envia o buffer da RAM para a tela:', 'display.println(F("Ola"));\ndisplay.___();   // sem isto nada aparece', ['display', 'display()'], 'As funções de desenho só alteram o buffer; display() o envia ao OLED pelo I2C.'),
        mcq('q5', 'Quanta SRAM o buffer de um OLED 128x64 monocromático ocupa?', 'd', [
          '64 bytes',
          '128 bytes',
          '8192 bytes',
          '1024 bytes, a metade da SRAM do Uno'
        ], '128 x 64 pixels x 1 bit = 8192 bits = 1024 bytes; o Uno tem 2048 bytes de SRAM.'),
        mcq('q6', 'Você chamou drawCircle e drawLine, mas a tela continua vazia. Qual a causa mais provável?', 'b', [
          'O círculo precisa de um transistor',
          'Faltou chamar display() para enviar o buffer ao OLED',
          'O OLED só desenha na cor vermelha',
          'A origem (0, 0) fica no centro da tela'
        ], 'O desenho acontece na RAM; só display() o transfere para o display.'),
        mcq('q7', 'Qual prática reduz o flicker (tela piscando) e o tráfego I2C?', 'c', [
          'Chamar display() entre cada função de desenho',
          'Chamar clearDisplay() e display() sem desenhar nada, em alta velocidade',
          'Montar o quadro completo e chamar display() uma única vez, somente quando algo mudou',
          'Trocar o OLED por um LCD'
        ], 'display() envia o buffer inteiro e demora; enviar quadros incompletos mostra telas vazias.'),
        fill('q8', 'Complete o método que apaga o buffer antes de desenhar um novo quadro:', 'display.___();\ndisplay.setCursor(0, 0);\ndisplay.print(leitura);\ndisplay.display();', ['clearDisplay', 'clearDisplay()'], 'clearDisplay() zera o buffer; a tela só muda quando display() for chamado.')
      ]
    },
    {
      id: 'ari-10-ultrassonico',
      title: 'Sensor ultrassônico HC-SR04',
      goal: 'Medir distâncias com o tempo de ida e volta do som e filtrar ruído.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Como o HC-SR04 mede distância',
            body: 'O sensor emite uma rajada de ultrassom (8 pulsos de 40 kHz) e "escuta" o eco que volta ao bater em um obstáculo. Quanto mais longe o objeto, mais tempo o eco demora. Medindo esse tempo, calculamos a distância. Ele tem 4 pinos: VCC (5 V), Trig (disparo), Echo (resposta) e GND.'
          },
          {
            title: 'Trig e Echo: o protocolo',
            body: 'Para medir: mantenha Trig em LOW por alguns microssegundos, depois envie um pulso HIGH de 10 µs no Trig e volte a LOW. O sensor dispara a rajada e, em seguida, coloca o pino Echo em HIGH durante um tempo igual ao da viagem de ida e volta do som. Basta medir por quanto tempo Echo ficou em HIGH.',
            code: 'const int TRIG = 9, ECHO = 10;\n\nvoid setup() {\n  pinMode(TRIG, OUTPUT);\n  pinMode(ECHO, INPUT);\n  Serial.begin(9600);\n}'
          },
          {
            title: 'pulseIn(): medir a duração de um pulso',
            body: 'pulseIn(pino, nivel, timeout) espera o pino ir para o nível pedido, cronometra enquanto ele fica nesse nível e devolve a duração em microssegundos. O terceiro parâmetro, opcional, é o tempo máximo de espera (em µs): se nada acontecer dentro dele, devolve 0. Isso evita que o programa fique preso quando não há eco.',
            code: 'long medirTempo() {\n  digitalWrite(TRIG, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG, HIGH);\n  delayMicroseconds(10);        // pulso de disparo de 10 us\n  digitalWrite(TRIG, LOW);\n  return pulseIn(ECHO, HIGH, 30000); // até 30 ms de espera\n}'
          },
          {
            title: 'O cálculo da distância',
            body: 'A velocidade do som no ar, a cerca de 20 °C, é aproximadamente 343 m/s, ou 0,0343 cm por microssegundo. Como o tempo medido é de IDA e VOLTA, a distância real é a metade: distância (cm) = tempo (µs) × 0,0343 ÷ 2. Uma forma prática equivalente é dividir o tempo por 58. Exemplo: 1166 µs resultam em cerca de 20 cm.',
            code: 'long t = medirTempo();\nfloat cm = t * 0.0343 / 2.0;   // divide por 2: ida e volta\nSerial.print(cm);\nSerial.println(" cm");'
          },
          {
            title: 'Limites e ruído',
            body: 'O HC-SR04 mede de cerca de 2 cm a 400 cm, num cone estreito (em torno de 15°). Superfícies macias (tecido, espuma) absorvem o som, e superfícies inclinadas desviam o eco, gerando leituras erradas ou 0 (sem eco). Espere cerca de 60 ms entre medições, para o eco anterior sumir. O valor oscila de leitura para leitura: um filtro simples é a média de várias medidas.',
            code: 'float mediaCm(int n) {\n  float soma = 0;\n  int validas = 0;\n  for (int i = 0; i < n; i++) {\n    long t = medirTempo();\n    if (t > 0) {          // ignora leituras sem eco\n      soma += t * 0.0343 / 2.0;\n      validas++;\n    }\n    delay(60);\n  }\n  return validas > 0 ? soma / validas : -1;\n}'
          }
        ]
      },
      questions: [
        mcq('q1', 'O que o pino Echo do HC-SR04 faz durante uma medição?', 'c', [
          'Recebe a alimentação do sensor',
          'Dispara o ultrassom',
          'Fica em HIGH por um tempo igual ao da ida e volta do som',
          'Mede a temperatura do ar'
        ], 'A largura do pulso em Echo é o tempo do trajeto de ida e volta.'),
        mcq('q2', 'Qual pulso deve ser enviado ao pino Trig para iniciar a medição?', 'a', [
          'Um pulso HIGH de 10 µs',
          'Um pulso HIGH de 10 segundos',
          'Um sinal PWM contínuo',
          'Um nível LOW permanente'
        ], 'Um pulso de 10 µs em Trig dispara a rajada de ultrassom.'),
        mcq('q3', 'Por que a distância em cm é tempo × 0,0343 ÷ 2?', 'b', [
          'Porque o sensor usa 2 pilhas',
          'Porque o tempo medido inclui ida e volta, e a distância ao objeto é metade do caminho percorrido',
          'Porque 0,0343 é a velocidade da luz',
          'Porque o Uno tem 2 KB de SRAM'
        ], 'O som vai até o objeto e volta; a distância ao objeto é metade do percurso total.'),
        fill('q4', 'Complete o tempo, em microssegundos, do pulso de disparo no Trig:', 'digitalWrite(TRIG, HIGH);\ndelayMicroseconds(___);\ndigitalWrite(TRIG, LOW);', ['10'], 'O datasheet pede um pulso de pelo menos 10 µs.'),
        mcq('q5', 'O que pulseIn(ECHO, HIGH, 30000) devolve se nenhum eco chegar em 30 ms?', 'd', [
          '30000',
          '-1',
          'HIGH',
          '0'
        ], 'Ao estourar o timeout, pulseIn devolve 0; por isso tratamos 0 como "sem leitura".'),
        mcq('q6', 'Uma leitura retornou t = 1166 µs. Qual é a distância aproximada?', 'c', [
          '40 cm',
          '2 cm',
          '20 cm',
          '200 cm'
        ], '1166 × 0,0343 ÷ 2 ≈ 20 cm.'),
        mcq('q7', 'Qual técnica simples reduz o ruído das leituras do ultrassônico?', 'b', [
          'Aumentar o brilho do LED',
          'Tirar a média de várias medições (ignorando as nulas)',
          'Trocar delayMicroseconds por delay',
          'Ligar o Echo no pino 13'
        ], 'A média suaviza oscilações aleatórias; leituras 0 (sem eco) devem ser descartadas.'),
        fill('q8', 'Complete o nível lógico cuja duração o pulseIn deve medir no pino Echo:', 'long t = pulseIn(ECHO, ___, 30000);', ['HIGH'], 'O eco aparece como um pulso em nível HIGH; pulseIn mede essa duração.')
      ]
    },
    {
      id: 'ari-11-temperatura-sensores',
      title: 'Temperatura, umidade e outros sensores',
      goal: 'Ler LM35, NTC, DHT11/DHT22 e conhecer PIR, umidade do solo, chama e gás.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'LM35: convertendo para graus Celsius',
            body: 'O LM35 entrega 10 mV por grau Celsius. O analogRead dá um número de 0 a 1023 para 0 a 5 V. Primeiro convertemos a leitura em volts (leitura × 5,0 ÷ 1023) e depois em graus (volts × 100, porque 1 V equivale a 100 °C). Exemplo: leitura 51 corresponde a cerca de 0,25 V, ou 25 °C.',
            code: 'int leitura = analogRead(A0);\nfloat volts = leitura * 5.0 / 1023.0;\nfloat celsius = volts * 100.0;\nSerial.println(celsius);'
          },
          {
            title: 'Termistor NTC: conceito',
            body: 'Um NTC é um resistor cuja resistência CAIA quando a temperatura sobe (NTC = coeficiente de temperatura negativo). Como o Arduino lê tensão, montamos um divisor de tensão com um resistor fixo (por exemplo 10 kΩ para um NTC de 10 kΩ a 25 °C) e lemos o ponto do meio com analogRead. Calculamos a resistência do NTC a partir da tensão e a convertemos em temperatura com uma equação (Beta ou Steinhart-Hart). A relação não é linear, por isso exige conta, diferente do LM35. É barato e muito usado em fontes, impressoras 3D e aquecedores.'
          },
          {
            title: 'DHT11 e DHT22 (temperatura e umidade)',
            body: 'Os DHT11 e DHT22 medem temperatura e umidade do ar e enviam o resultado de forma digital por um único fio de dados. Diferenças: o DHT11 é mais barato e menos preciso (cerca de ±2 °C e ±5% de umidade, faixa de 0 a 50 °C); o DHT22 é mais preciso (cerca de ±0,5 °C e 2 a 5% de umidade) e cobre de -40 a 80 °C. O DHT11 só deve ser lido no máximo 1 vez por segundo; o DHT22, no máximo 1 vez a cada 2 segundos. Ler mais rápido devolve valores velhos ou erro.'
          },
          {
            title: 'Usando a biblioteca DHT',
            body: 'Instale pelo Library Manager a "DHT sensor library" da Adafruit (que pede também a Adafruit Unified Sensor). Crie o objeto com o pino e o tipo (DHT11 ou DHT22), chame begin() e leia com readTemperature() e readHumidity(). Se a leitura falhar, o valor é NaN (not a number), que se verifica com isnan().',
            code: '#include <DHT.h>\n\nDHT dht(2, DHT11);   // pino 2, tipo DHT11\n\nvoid setup() {\n  Serial.begin(9600);\n  dht.begin();\n}\n\nvoid loop() {\n  float umid = dht.readHumidity();\n  float temp = dht.readTemperature();\n  if (isnan(umid) || isnan(temp)) {\n    Serial.println(F("Falha na leitura"));\n  } else {\n    Serial.print(temp); Serial.print(" C  ");\n    Serial.print(umid); Serial.println(" %");\n  }\n  delay(2000);   // respeita o intervalo minimo\n}'
          },
          {
            title: 'Sensor PIR: movimento',
            body: 'O PIR (infravermelho passivo) detecta mudanças no calor emitido por corpos em movimento, como pessoas e animais. Tem 3 pinos: VCC, GND e OUT; o OUT vai a HIGH quando detecta movimento e fica assim por um tempo ajustável por trimpot (o outro trimpot ajusta a sensibilidade). Precisa de cerca de 30 a 60 segundos para estabilizar depois de ligado — durante isso pode disparar sozinho. Leitura: digitalRead(pinoPIR).'
          },
          {
            title: 'Umidade do solo, chama e gás (visão geral)',
            body: 'Sensor de umidade do solo: duas hastes (resistivo) ou placa (capacitivo) que geram uma tensão conforme a umidade; lê-se com analogRead e é preciso calibrar com o solo seco e molhado (os extremos variam de sensor para sensor). Os resistivos corroem com o tempo; os capacitivos duram mais. Sensor de chama: detecta luz infravermelha de fogo, com saída digital (limiar ajustável) e/ou analógica. Sensores de gás da série MQ: um aquecedor interno exige tempo de aquecimento, a saída é analógica e dá uma estimativa, não uma medida certificada. Segurança: esses módulos de hobby NÃO substituem detectores de fumaça, gás ou incêndio certificados.'
          }
        ]
      },
      questions: [
        mcq('q1', 'Quanto o LM35 entrega de tensão por grau Celsius?', 'b', [
          '1 mV',
          '10 mV',
          '100 mV',
          '1 V'
        ], '10 mV/°C: 250 mV equivalem a 25 °C.'),
        mcq('q2', 'analogRead(A0) devolveu 51 em um LM35 com referência de 5 V. Qual a temperatura aproximada?', 'c', [
          '51 °C',
          '5 °C',
          '25 °C',
          '250 °C'
        ], '51 × 5 ÷ 1023 ≈ 0,25 V; × 100 = 25 °C.'),
        mcq('q3', 'O que caracteriza um termistor NTC?', 'a', [
          'Sua resistência diminui quando a temperatura aumenta',
          'Sua resistência aumenta com a temperatura',
          'Ele gera diretamente 10 mV por °C',
          'Ele só mede umidade'
        ], 'NTC significa coeficiente de temperatura negativo: mais calor, menos resistência.'),
        fill('q4', 'Complete a função que verifica se a leitura do DHT falhou (resultado NaN):', 'float t = dht.readTemperature();\nif (___(t)) {\n  Serial.println(F("Falha"));\n}', ['isnan'], 'Leituras inválidas voltam como NaN, testadas com isnan().'),
        mcq('q5', 'Qual a diferença de precisão entre DHT11 e DHT22?', 'd', [
          'O DHT11 é mais preciso, mas mais caro',
          'São idênticos',
          'O DHT22 só mede umidade',
          'O DHT22 é mais preciso (cerca de ±0,5 °C contra ±2 °C do DHT11) e cobre faixa maior'
        ], 'O DHT22 oferece melhor precisão e maior faixa, a um custo um pouco maior.'),
        mcq('q6', 'Qual é o intervalo mínimo recomendado entre duas leituras do DHT11?', 'b', [
          '1 milissegundo',
          '1 segundo',
          '1 minuto',
          'Não existe intervalo mínimo'
        ], 'O DHT11 amostra no máximo 1 vez por segundo (o DHT22, a cada 2 s).'),
        mcq('q7', 'Qual afirmação sobre o sensor PIR está correta?', 'c', [
          'Mede a distância com ultrassom',
          'Mede a umidade do ar',
          'Detecta movimento de corpos que emitem calor, com saída digital HIGH, e precisa de um tempo de estabilização após ligar',
          'Funciona somente no escuro total'
        ], 'O PIR sente variação de infravermelho; após ligar leva cerca de 30 a 60 s para estabilizar.'),
        fill('q8', 'Complete a instrução do LM35 para converter volts em °C (1 V equivale a 100 °C):', 'float celsius = volts * ___;', ['100', '100.0'], '10 mV por grau significa 100 graus por volt.')
      ]
    },
    {
      id: 'ari-29-ds18b20-1wire',
      title: 'Sensor de temperatura DS18B20 (1-Wire)',
      goal: 'Ler um ou vários DS18B20 por um único fio, com OneWire e DallasTemperature, sem travar o loop.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'O que é o DS18B20',
            body: 'O DS18B20 é um sensor de temperatura DIGITAL: ele mede, converte internamente e envia o número pronto, sem precisar de analogRead nem de contas de tensão como no LM35 ou no NTC. Mede de -55 °C a +125 °C, com precisão de cerca de ±0,5 °C na faixa de -10 °C a +85 °C. Vem em encapsulamento TO-92 (parece um transistor, 3 pernas) e também em versão selada em cabo de aço inox, à prova d\'água, ideal para líquidos, aquários e solo.'
          },
          {
            title: 'Protocolo 1-Wire e as ligações',
            body: '1-Wire é um protocolo que usa UM fio de dados (mais o GND) para a conversa entre o Arduino e o sensor. O DS18B20 tem 3 terminais: GND, DQ (dados) e VDD (alimentação, de 3,0 a 5,5 V). Liga-se GND ao GND, VDD ao 5 V e DQ a um pino digital. Entre DQ e VDD vai um resistor de pull-up de 4,7 kΩ: o barramento 1-Wire fica em repouso em nível alto por causa dele, e o sensor só o "puxa" para baixo para transmitir. Sem esse resistor a leitura falha. Existe também o modo parasita, em que o sensor tira energia da própria linha de dados (VDD no GND), economizando um fio, mas ele exige cuidados extras e é menos confiável; o modo normal com 3 fios é o recomendado.',
            code: '// Ligacao (modo normal, 3 fios):\n// DS18B20 GND -> GND do Arduino\n// DS18B20 VDD -> 5 V\n// DS18B20 DQ  -> pino 2\n// resistor 4,7 kohm entre DQ (pino 2) e 5 V'
          },
          {
            title: 'Vários sensores no mesmo fio: endereço ROM',
            body: 'Cada DS18B20 sai de fábrica com um endereço ROM único de 64 bits, gravado no chip. Como o protocolo usa esse endereço para chamar cada sensor, vários DS18B20 podem compartilhar exatamente o mesmo fio de dados e o mesmo resistor de pull-up: o Arduino pode falar com todos ao mesmo tempo ou escolher um deles pelo endereço. Isso economiza muitos pinos: um único pino digital pode ler dezenas de sensores espalhados por uma casa de máquinas, por exemplo.'
          },
          {
            title: 'Bibliotecas OneWire e DallasTemperature',
            body: 'Duas bibliotecas fazem o trabalho pesado, instaláveis pelo Library Manager: OneWire (a camada do protocolo 1-Wire) e DallasTemperature (comandos específicos dos sensores Dallas/Maxim, como o DS18B20). Cria-se um objeto OneWire com o pino de dados, entrega-se o endereço dele ao objeto DallasTemperature e chama-se begin(). Para ler: requestTemperatures() manda todos os sensores medirem, e getTempCByIndex(i) devolve a temperatura em °C do sensor de índice i (0 é o primeiro encontrado no barramento).',
            code: '#include <OneWire.h>\n#include <DallasTemperature.h>\n\nOneWire oneWire(2);                  // dados no pino 2\nDallasTemperature sensors(&oneWire);\n\nvoid setup() {\n  Serial.begin(9600);\n  sensors.begin();\n}\n\nvoid loop() {\n  sensors.requestTemperatures();      // pede a medicao\n  float t = sensors.getTempCByIndex(0);\n  Serial.println(t);\n  delay(1000);\n}'
          },
          {
            title: 'Vários sensores e valor de erro',
            body: 'getDeviceCount() informa quantos sensores a biblioteca encontrou no barramento, e permite percorrer todos com um for de 0 até contagem - 1, lendo getTempCByIndex(i). Se um sensor não responde (fio solto, falta do pull-up, índice inexistente), a biblioteca devolve o valor -127, também disponível pela constante DEVICE_DISCONNECTED_C. Como -127 °C não é uma temperatura real nesse contexto, sempre teste esse valor antes de usar a leitura (por exemplo, antes de ligar ou desligar um aquecedor).',
            code: 'int n = sensors.getDeviceCount();\nsensors.requestTemperatures();\nfor (int i = 0; i < n; i++) {\n  float t = sensors.getTempCByIndex(i);\n  if (t == DEVICE_DISCONNECTED_C) {   // -127\n    Serial.println(F("Sensor desconectado"));\n  } else {\n    Serial.println(t);\n  }\n}'
          },
          {
            title: 'Resolução e tempo de conversão',
            body: 'A resolução do DS18B20 é configurável de 9 a 12 bits (com setResolution(bits)), e quanto mais bits, mais fino o passo e mais lenta a conversão: 9 bits dão passo de 0,5 °C e levam cerca de 94 ms; 10 bits, 0,25 °C e cerca de 188 ms; 11 bits, 0,125 °C e cerca de 375 ms; 12 bits (o padrão), 0,0625 °C e até cerca de 750 ms. Por padrão a biblioteca ESPERA a conversão terminar dentro de requestTemperatures(), ou seja, trava o programa por até 750 ms a cada leitura. Perceba que passo fino não é o mesmo que precisão: a precisão do sensor continua em torno de ±0,5 °C.'
          },
          {
            title: 'Leitura não bloqueante com millis',
            body: 'Para não travar o loop (botões, display, motores), chame setWaitForConversion(false) no setup: então requestTemperatures() só dispara a medição e retorna na hora. Depois, com o padrão do millis, espere o tempo de conversão sem delay e só então leia o valor. O DS18B20 se compara bem aos vizinhos da trilha: ao contrário do LM35, entrega o valor digital pronto (sem depender da referência do ADC nem de ruído analógico em fios longos); e ao DHT, que mede umidade também, o DS18B20 mede só temperatura, mas com boa precisão, em faixa mais ampla, em versão à prova d\'água e com vários sensores num só fio.',
            code: 'unsigned long tPedido = 0;\nbool aguardando = false;\n\nvoid setup() {\n  sensors.begin();\n  sensors.setWaitForConversion(false);  // nao bloqueia\n}\n\nvoid loop() {\n  unsigned long agora = millis();\n  if (!aguardando) {\n    sensors.requestTemperatures();   // retorna na hora\n    tPedido = agora;\n    aguardando = true;\n  } else if (agora - tPedido >= 750) {   // 12 bits\n    Serial.println(sensors.getTempCByIndex(0));\n    aguardando = false;\n  }\n  // outras tarefas continuam rodando aqui\n}'
          }
        ]
      },
      questions: [
        mcq('q1', 'Qual resistor é necessário entre o fio de dados (DQ) e o VCC no barramento 1-Wire do DS18B20 (modo normal)?', 'd', [
          'Um resistor de 220 Ω em série com o LED do sensor',
          'Um resistor de 100 kΩ entre dados e GND',
          'Nenhum, o pino do Arduino já resolve',
          'Um pull-up de cerca de 4,7 kΩ entre dados e VCC'
        ], 'O pull-up de 4,7 kΩ mantém o barramento em nível alto no repouso; sem ele a comunicação falha.'),
        mcq('q2', 'Como vários DS18B20 podem compartilhar o mesmo fio de dados?', 'a', [
          'Cada sensor tem um endereço ROM único de 64 bits, que o Arduino usa para distingui-los',
          'Cada sensor precisa de um resistor de valor diferente',
          'Só é possível se cada um usar uma resolução diferente',
          'Não é possível: cada sensor exige um pino próprio'
        ], 'O endereço ROM de 64 bits gravado de fábrica identifica cada sensor no barramento 1-Wire.'),
        mcq('q3', 'Com a resolução padrão de 12 bits, quanto tempo a conversão do DS18B20 pode levar?', 'c', [
          'Cerca de 1 microssegundo',
          'Cerca de 5 ms',
          'Até cerca de 750 ms',
          'Cerca de 10 segundos'
        ], 'A 12 bits a conversão leva até ~750 ms; resoluções menores (9 a 11 bits) são mais rápidas.'),
        fill('q4', 'Complete o método que manda os sensores medirem a temperatura antes da leitura:', 'DallasTemperature sensors(&oneWire);\n\nvoid loop() {\n  sensors.___();\n  float t = sensors.getTempCByIndex(0);\n}', ['requestTemperatures', 'requestTemperatures()'], 'requestTemperatures() dispara a conversão em todos os sensores; depois se lê com getTempCByIndex.'),
        mcq('q5', 'Se getTempCByIndex(0) devolve -127, o que isso indica?', 'b', [
          'A temperatura real é de 127 graus negativos, congelando',
          'O sensor não foi encontrado ou está desconectado (DEVICE_DISCONNECTED_C)',
          'A resolução está em 9 bits',
          'O valor está em Fahrenheit'
        ], '-127 é o código de erro da biblioteca para sensor ausente; deve ser testado antes de usar a leitura.'),
        mcq('q6', 'Para que serve setWaitForConversion(false) combinado com millis?', 'd', [
          'Para aumentar a resolução do sensor para 12 bits',
          'Para ligar o modo parasita',
          'Para ler a temperatura em Fahrenheit',
          'Para requestTemperatures() não bloquear por até 750 ms, deixando o loop livre para outras tarefas'
        ], 'Sem a espera automática, o programa dispara a medição, segue seu trabalho e só lê depois do tempo de conversão.'),
        mcq('q7', 'Qual é uma vantagem do DS18B20 em relação ao LM35 em um projeto com fios longos ou vários pontos de medição?', 'b', [
          'Ele mede umidade além da temperatura',
          'Ele envia o valor digital pronto, evitando ruído analógico, e vários sensores dividem um único pino',
          'Ele não precisa de alimentação',
          'Ele é sempre mais rápido que o LM35'
        ], 'Sendo digital e endereçável, o DS18B20 evita erros de leitura analógica e economiza pinos; não mede umidade (isso é o DHT).'),
        fill('q8', 'Complete o valor de erro (ou use DEVICE_DISCONNECTED_C) que a biblioteca devolve quando o sensor está desconectado:', 'float t = sensors.getTempCByIndex(0);\nif (t == ___) {\n  Serial.println(F("Sem sensor"));\n}', ['-127', '-127.0', 'DEVICE_DISCONNECTED_C'], 'DEVICE_DISCONNECTED_C vale -127.')
      ]
    },
    {
      id: 'ari-12-i2c',
      title: 'Comunicação I2C e RTC',
      goal: 'Conectar vários dispositivos em dois fios, achar endereços e ler a hora de um RTC.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'O barramento I2C',
            body: 'I2C (também escrito I²C ou TWI) liga vários dispositivos usando só dois fios compartilhados: SDA (dados) e SCL (clock), além do GND. No Arduino Uno, SDA é o pino A4 e SCL é o A5. Há um mestre (normalmente o Arduino), que comanda a comunicação e gera o clock, e um ou mais escravos (sensores, displays, RTC), que respondem quando chamados. A velocidade padrão é de 100 kHz (modo rápido: 400 kHz).'
          },
          {
            title: 'Endereços de 7 bits',
            body: 'Cada escravo tem um endereço de 7 bits, geralmente escrito em hexadecimal (por exemplo 0x27 para o LCD, 0x68 para um RTC). O mestre começa cada conversa dizendo o endereço, e só o dispositivo com aquele endereço responde. Por isso dois dispositivos com o mesmo endereço no mesmo barramento conflitam (alguns módulos têm jumpers para mudar o endereço).'
          },
          {
            title: 'Resistores de pull-up',
            body: 'As linhas SDA e SCL são "coletor aberto": os dispositivos só sabem puxar a linha para LOW; é um resistor de pull-up (tipicamente 4,7 kΩ ou 10 kΩ para 5 V) que a leva a HIGH. A maioria dos módulos prontos já traz esses resistores na placa. Sem pull-up o barramento não funciona.'
          },
          {
            title: 'Wire.h: conversando com escravos',
            body: 'A biblioteca Wire acompanha a IDE. Wire.begin() inicia o Arduino como mestre. Para escrever: Wire.beginTransmission(endereco), Wire.write(byte) e Wire.endTransmission(). Para ler: Wire.requestFrom(endereco, quantidade), depois Wire.available() e Wire.read(). endTransmission() devolve 0 quando o dispositivo respondeu (ACK), e outro número em caso de erro.',
            code: '#include <Wire.h>\n\nvoid setup() {\n  Wire.begin();\n}'
          },
          {
            title: 'Scanner de endereços',
            body: 'Quando você não sabe o endereço de um módulo, rode um scanner: ele tenta todos os endereços possíveis (1 a 126) e imprime aqueles em que endTransmission() devolve 0.',
            code: '#include <Wire.h>\n\nvoid setup() {\n  Serial.begin(9600);\n  Wire.begin();\n  for (byte addr = 1; addr < 127; addr++) {\n    Wire.beginTransmission(addr);\n    if (Wire.endTransmission() == 0) {\n      Serial.print("Achei: 0x");\n      Serial.println(addr, HEX);\n    }\n  }\n}\n\nvoid loop() {}'
          },
          {
            title: 'RTC DS3231 e DS1307: relógio de tempo real',
            body: 'O Arduino não tem relógio de calendário: millis() zera ao religar. Um módulo RTC (Real Time Clock) tem bateria própria (geralmente CR2032), mantém data e hora com o Arduino desligado e se comunica por I2C, no endereço 0x68. O DS3231 tem oscilador compensado por temperatura e é bem mais exato; o DS1307 é mais simples, usa um cristal comum e deriva mais. Com a biblioteca RTClib (Adafruit) lê-se a hora com rtc.now().',
            code: '#include <RTClib.h>\n\nRTC_DS3231 rtc;\n\nvoid setup() {\n  Serial.begin(9600);\n  rtc.begin();\n  // acerta com a hora da compilacao (so uma vez)\n  // rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));\n}\n\nvoid loop() {\n  DateTime agora = rtc.now();\n  Serial.print(agora.hour());\n  Serial.print(":");\n  Serial.print(agora.minute());\n  Serial.print(":");\n  Serial.println(agora.second());\n  delay(1000);\n}'
          }
        ]
      },
      questions: [
        mcq('q1', 'Quais são os dois fios de sinal do I2C?', 'd', [
          'TX e RX',
          'MOSI e MISO',
          'VCC e GND',
          'SDA (dados) e SCL (clock)'
        ], 'I2C usa SDA e SCL; TX/RX é UART e MOSI/MISO é SPI.'),
        mcq('q2', 'Em quais pinos do Arduino Uno ficam SDA e SCL?', 'b', [
          '0 e 1',
          'A4 (SDA) e A5 (SCL)',
          '2 e 3',
          '10 e 11'
        ], 'No Uno o I2C usa A4 e A5.'),
        mcq('q3', 'Como o mestre escolhe com qual escravo conversar no barramento?', 'c', [
          'Pela cor do fio',
          'Pela ordem de ligação',
          'Pelo endereço de 7 bits enviado no início da comunicação',
          'Por um pino de seleção individual para cada escravo'
        ], 'Cada escravo tem um endereço; só o endereçado responde.'),
        fill('q4', 'Complete o método que inicia o Arduino como mestre I2C:', 'void setup() {\n  Wire.___();\n}', ['begin'], 'Wire.begin() sem argumentos inicia o dispositivo como mestre.'),
        mcq('q5', 'Para que servem os resistores de pull-up no I2C?', 'a', [
          'Levar as linhas SDA e SCL ao nível HIGH, já que os dispositivos só puxam para LOW',
          'Aumentar a velocidade do clock',
          'Proteger contra inversão de polaridade',
          'Gerar o endereço do dispositivo'
        ], 'As linhas são de coletor aberto; sem pull-up elas não voltam a HIGH.'),
        mcq('q6', 'No scanner de endereços, o que indica que existe um dispositivo no endereço testado?', 'b', [
          'Wire.available() devolver 255',
          'Wire.endTransmission() devolver 0',
          'Serial.begin() devolver true',
          'digitalRead devolver HIGH'
        ], 'endTransmission() devolve 0 quando o escravo respondeu com ACK.'),
        mcq('q7', 'Qual a vantagem de um RTC como o DS3231 em relação ao millis()?', 'c', [
          'É mais rápido que o Arduino',
          'Não precisa de alimentação',
          'Mantém data e hora com bateria própria mesmo com o Arduino desligado',
          'Substitui o cristal do Uno'
        ], 'millis() zera ao religar; o RTC guarda a hora real graças à bateria.'),
        fill('q8', 'Complete o valor de retorno de endTransmission() quando o dispositivo responde:', 'Wire.beginTransmission(0x68);\nif (Wire.endTransmission() == ___) {\n  Serial.println(F("RTC encontrado"));\n}', ['0'], 'Zero significa transmissão concluída com sucesso (ACK recebido).')
      ]
    },
    {
      id: 'ari-26-mpu6050',
      title: 'Acelerômetro e giroscópio: MPU6050',
      goal: 'Ler aceleração e rotação do MPU6050 diretamente pela Wire, converter as unidades e estimar a inclinação.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'O que cada sensor mede',
            body: 'O MPU6050 reúne, no mesmo chip, um acelerômetro de 3 eixos e um giroscópio de 3 eixos (por isso "6 eixos"), mais um sensor de temperatura interno. O acelerômetro mede aceleração em g (1 g é a gravidade, cerca de 9,8 m/s²) nos eixos X, Y e Z. Importante: ele também sente a gravidade. Parado e na horizontal, o eixo Z lê cerca de +1 g (a depender da posição do chip) e X e Y lêem cerca de 0. O giroscópio mede velocidade angular, a rapidez com que o chip gira em torno de cada eixo, em graus por segundo (°/s). Atenção: o giroscópio não mede o ângulo, mede a taxa de variação do ângulo.'
          },
          {
            title: 'O módulo GY-521 e o barramento I2C',
            body: 'O módulo mais comum é o GY-521: fala I2C (SDA no A4 e SCL no A5 do Uno), com endereço 0x68; ligando o pino AD0 em HIGH o endereço muda para 0x69 (útil para usar dois no mesmo barramento). O chip MPU6050 trabalha em 3,3 V, mas o GY-521 traz um regulador de tensão na placa, então o VCC aceita 5 V. Confirme no seu módulo. Os resistores de pull-up costumam vir na placa. Use o scanner de endereços da lição de I2C para conferir.'
          },
          {
            title: 'Acordando o chip',
            body: 'Ao ligar, o MPU6050 está em modo de repouso (sleep) e devolve zeros. Para acordar, escrevemos o valor 0 no registrador de gerenciamento de energia PWR_MGMT_1, que fica no endereço 0x6B. Escrever em um registrador por I2C é: beginTransmission(endereço do chip), write(endereço do registrador), write(valor), endTransmission(). Um registrador é uma posição de memória interna do sensor.',
            code: '#include <Wire.h>\n\nconst byte MPU = 0x68;\n\nvoid setup() {\n  Serial.begin(9600);\n  Wire.begin();\n  Wire.beginTransmission(MPU);\n  Wire.write(0x6B);   // PWR_MGMT_1\n  Wire.write(0);      // 0 = acorda\n  Wire.endTransmission(true);\n}'
          },
          {
            title: 'Leitura sequencial de 14 bytes',
            body: 'Os dados ficam em registradores consecutivos a partir de 0x3B: aceleração X, Y e Z, temperatura, giroscópio X, Y e Z. São 7 valores de 2 bytes cada, ou seja, 14 bytes. Cada valor é um número de 16 bits COM SINAL (de -32768 a 32767, em complemento de dois) dividido em byte alto (high, mais significativo) e byte baixo (low), nessa ordem. Para combinar: (alto << 8) | baixo, guardado em int16_t. Primeiro dizemos de qual registrador queremos começar (endTransmission(false) mantém o barramento aberto), depois pedimos 14 bytes com requestFrom. A temperatura em °C é dada pela fórmula do fabricante: bruto / 340 + 36,53.',
            code: 'int16_t lerInt16() {\n  byte alto = Wire.read();\n  byte baixo = Wire.read();\n  return (int16_t)((alto << 8) | baixo);\n}\n\nvoid loop() {\n  Wire.beginTransmission(MPU);\n  Wire.write(0x3B);              // 1o registrador de dados\n  Wire.endTransmission(false);\n  Wire.requestFrom(MPU, (byte)14, (byte)true);\n\n  int16_t ax = lerInt16();\n  int16_t ay = lerInt16();\n  int16_t az = lerInt16();\n  int16_t temp = lerInt16();\n  int16_t gx = lerInt16();\n  int16_t gy = lerInt16();\n  int16_t gz = lerInt16();\n\n  Serial.print(ax / 16384.0);\n  Serial.print(" g  ");\n  Serial.println(gx / 131.0);\n  delay(200);\n}'
          },
          {
            title: 'Sensibilidade e conversão',
            body: 'O valor bruto de 16 bits só vira unidade física depois de dividir pela sensibilidade, que depende da escala configurada. Na escala padrão do acelerômetro (±2 g) são 16384 LSB por g; na escala padrão do giroscópio (±250 °/s) são 131 LSB por °/s. Exemplos: bruto 8192 no acelerômetro = 8192 / 16384 = 0,5 g; bruto 262 no giroscópio = 262 / 131 = 2 °/s. Para medir movimentos mais fortes dá para mudar a escala (±4, 8, 16 g; ±500, 1000, 2000 °/s) escrevendo nos registradores 0x1C (acelerômetro) e 0x1B (giroscópio), mas então cada unidade física equivale a menos LSB (menos resolução). Divida usando números decimais (16384.0) para obter float.'
          },
          {
            title: 'Inclinação com atan2',
            body: 'Como o acelerômetro sente a gravidade, quando o chip está parado ela aponta sempre "para baixo" e as componentes ax, ay e az dizem a inclinação. O ângulo de rotação em torno do eixo X (roll) vale atan2(ay, az), que devolve radianos entre -π e π; multiplique por 180 / PI para obter graus. Usamos atan2 (e não a tangente simples) porque ele considera o sinal dos dois valores, reconhece o quadrante certo e não divide por zero. Limitação: qualquer aceleração além da gravidade (vibração, empurrão, movimento) corrompe a leitura, então esse ângulo é ruidoso em movimento.',
            code: 'float roll = atan2(ay, az) * 180.0 / PI;   // graus\nSerial.println(roll);'
          },
          {
            title: 'Deriva do giroscópio e filtro complementar',
            body: 'Para obter o ângulo com o giroscópio, integramos: angulo = angulo + gx_dps * dt, onde dt é o tempo (em segundos) desde a última leitura. Só que o giroscópio sempre tem um pequeno erro (offset): mesmo parado ele lê, por exemplo, 0,4 °/s, e a integração soma esse erro sem parar; o ângulo vai se afastando da realidade (deriva). Para reduzir, faça a calibração em repouso: ao ligar, deixe o módulo imóvel, tire a média de algumas centenas de leituras e subtraia esse offset depois. Ainda assim sobra deriva, e por isso se usa o filtro complementar: o giroscópio é bom no curto prazo (reage rápido, sem ruído de vibração) e o acelerômetro é bom no longo prazo (não deriva). A fórmula mistura os dois: angulo = 0,98 x (angulo + gx_dps x dt) + 0,02 x anguloAcel. A biblioteca Adafruit_MPU6050 existe e simplifica a leitura, mas aqui usamos a Wire para entender o que acontece.'
          }
        ]
      },
      questions: [
        mcq('q1', 'O que o giroscópio do MPU6050 mede?', 'd', [
          'A aceleração em g',
          'A temperatura do ambiente',
          'O ângulo absoluto em relação ao norte',
          'A velocidade angular, em graus por segundo, em torno de cada eixo'
        ], 'O giroscópio mede a taxa de rotação; o ângulo só se obtém integrando essa taxa.'),
        mcq('q2', 'Com o módulo parado, na horizontal, o que o acelerômetro lê no eixo vertical (Z)?', 'b', [
          'Zero em todos os eixos',
          'Cerca de 1 g, porque o acelerômetro também sente a gravidade',
          'Cerca de 9800 g',
          'Um valor aleatório, que muda a cada leitura'
        ], 'A gravidade é uma aceleração de 1 g que o sensor mede no eixo apontado para baixo ou para cima.'),
        mcq('q3', 'Qual é o endereço I2C do MPU6050 quando o pino AD0 está em HIGH?', 'a', [
          '0x69',
          '0x68',
          '0x6B',
          '0x3C'
        ], '0x68 com AD0 em LOW (padrão) e 0x69 com AD0 em HIGH.'),
        fill('q4', 'Complete o endereço do registrador PWR_MGMT_1, onde se escreve 0 para acordar o chip:', 'Wire.write(0x___);   // PWR_MGMT_1\nWire.write(0);', ['6B', '6b', '0x6B', '0x6b'], 'O registrador de gerenciamento de energia fica em 0x6B; escrever 0 tira o chip do modo sleep.'),
        mcq('q5', 'Por que se lêem 14 bytes a partir do registrador 0x3B?', 'c', [
          'Porque o endereço I2C tem 14 bits',
          'Porque o chip só responde a 14 pedidos por segundo',
          'São 7 valores de 16 bits (aceleração X, Y, Z, temperatura e giroscópio X, Y, Z), 2 bytes cada',
          'Porque cada eixo ocupa 14 bytes'
        ], '7 valores x 2 bytes (alto e baixo) = 14 bytes em registradores consecutivos.'),
        mcq('q6', 'O que calcula atan2(ay, az) * 180.0 / PI com o módulo parado?', 'b', [
          'A velocidade de rotação em °/s',
          'O ângulo de inclinação em graus, estimado a partir da direção da gravidade',
          'A temperatura em graus Celsius',
          'O offset do giroscópio'
        ], 'atan2 devolve radianos; multiplicados por 180 / PI viram graus de inclinação.'),
        mcq('q7', 'Qual é o problema de calcular o ângulo apenas integrando o giroscópio, e qual a ideia do filtro complementar?', 'd', [
          'O giroscópio não mede nada em movimento; o filtro usa só o magnetômetro',
          'A integração é lenta; o filtro serve para acelerar o loop',
          'O erro de offset desaparece sozinho; o filtro é opcional',
          'O pequeno offset se acumula (deriva); o filtro combina o giroscópio (bom no curto prazo) com o acelerômetro (estável no longo prazo)'
        ], 'Integrar soma o erro do giroscópio ao longo do tempo; o acelerômetro corrige lentamente a deriva.'),
        fill('q8', 'Complete a sensibilidade do acelerômetro na escala ±2 g (LSB por g) para converter o valor bruto em g:', 'float ax_g = ax / ___;', ['16384', '16384.0'], 'Na escala ±2 g, 16384 LSB correspondem a 1 g.')
      ]
    },
    {
      id: 'ari-13-spi',
      title: 'Comunicação SPI',
      goal: 'Entender o barramento SPI, seus pinos e modos, e compará-lo com I2C e UART.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'O barramento SPI e seus quatro fios',
            body: 'SPI (Serial Peripheral Interface) é um barramento síncrono e rápido, usado em cartões SD, displays gráficos, módulos de rádio e conversores. Usa 4 sinais: MOSI (Master Out, Slave In: dados do mestre para o escravo), MISO (Master In, Slave Out: dados do escravo para o mestre), SCK (clock, gerado pelo mestre) e SS ou CS (Slave Select/Chip Select, que escolhe o escravo). No Uno: MOSI no pino 11, MISO no 12, SCK no 13 e SS no 10.'
          },
          {
            title: 'Mestre, escravo e seleção por pino',
            body: 'O Arduino costuma ser o mestre e gera o clock. Diferente do I2C, SPI NÃO usa endereços: cada escravo tem seu próprio pino CS. O mestre coloca o CS do escravo desejado em LOW para falar com ele e volta a HIGH ao terminar; os demais escravos, com CS em HIGH, ignoram o barramento. MOSI, MISO e SCK são compartilhados por todos. Resultado: mais fios (um CS por escravo), porém comunicação muito mais rápida (vários MHz). A comunicação é full duplex: enquanto o mestre envia um byte, recebe outro ao mesmo tempo.'
          },
          {
            title: 'Os modos SPI (0 a 3)',
            body: 'Existem 4 modos, definidos por duas opções do clock: a polaridade (CPOL: nível do clock em repouso) e a fase (CPHA: em qual borda o dado é lido). O modo 0 (clock em repouso LOW, leitura na subida) é o mais comum, e é o padrão na maioria dos módulos. Mestre e escravo precisam usar o MESMO modo; consulte o datasheet do dispositivo.'
          },
          {
            title: 'SPI.h: transferindo bytes',
            body: 'SPI.begin() inicia o barramento. SPI.beginTransaction(SPISettings(velocidade, ordemDeBits, modo)) configura a transação; SPI.transfer(byte) envia um byte e DEVOLVE o byte recebido no mesmo instante; SPI.endTransaction() encerra. O CS é controlado por você com digitalWrite. No Uno, o pino 10 deve ficar configurado como saída para o Arduino permanecer mestre.',
            code: '#include <SPI.h>\n\nconst int CS = 10;\n\nvoid setup() {\n  pinMode(CS, OUTPUT);\n  digitalWrite(CS, HIGH);   // escravo desmarcado\n  SPI.begin();\n}\n\nvoid loop() {\n  SPI.beginTransaction(SPISettings(1000000, MSBFIRST, SPI_MODE0));\n  digitalWrite(CS, LOW);            // seleciona o escravo\n  byte resposta = SPI.transfer(0x42); // envia 0x42, recebe resposta\n  digitalWrite(CS, HIGH);\n  SPI.endTransaction();\n  delay(1000);\n}'
          },
          {
            title: 'SPI x I2C x UART',
            body: 'UART (a Serial): 2 fios (TX e RX), ponto a ponto, assíncrona (sem clock; os dois lados precisam usar o mesmo baud rate). I2C: 2 fios (SDA e SCL) para muitos dispositivos por endereço; mais lento e limitado pelos pull-ups. SPI: 3 fios compartilhados mais um CS por escravo, sem endereços; o mais rápido dos três, ideal para muito dado (SD, displays). Escolha conforme o dispositivo oferece, a velocidade que precisa e os pinos que sobram.'
          }
        ]
      },
      questions: [
        mcq('q1', 'Quais são os quatro sinais do SPI?', 'a', [
          'MOSI, MISO, SCK e SS/CS',
          'SDA, SCL, VCC e GND',
          'TX, RX, CTS e RTS',
          'D+, D-, VCC e GND'
        ], 'MOSI e MISO levam dados, SCK é o clock e SS/CS seleciona o escravo.'),
        mcq('q2', 'Em quais pinos do Uno ficam MOSI, MISO e SCK?', 'c', [
          '2, 3 e 4',
          'A4, A5 e A3',
          '11, 12 e 13',
          '0, 1 e 2'
        ], 'MOSI = 11, MISO = 12, SCK = 13 (e SS = 10).'),
        mcq('q3', 'Como o mestre SPI escolhe com qual escravo falar?', 'd', [
          'Enviando um endereço de 7 bits',
          'Alterando o baud rate',
          'Trocando o modo SPI',
          'Colocando em LOW o pino CS daquele escravo'
        ], 'SPI não tem endereços: cada escravo tem seu próprio chip select.'),
        fill('q4', 'Complete a função que envia um byte e devolve o byte recebido simultaneamente:', 'byte resposta = SPI.___(0x42);', ['transfer'], 'SPI.transfer(valor) é full duplex: envia e recebe ao mesmo tempo.'),
        mcq('q5', 'Qual afirmação sobre modos SPI está correta?', 'b', [
          'O modo é escolhido pelo escravo, sem intervenção do mestre',
          'Mestre e escravo precisam usar o mesmo modo (combinação de polaridade e fase do clock)',
          'Só existe o modo 0',
          'O modo define o número de pinos usados'
        ], 'Os modos 0 a 3 combinam CPOL e CPHA, e ambos os lados devem concordar.'),
        mcq('q6', 'Qual a principal vantagem do SPI sobre o I2C?', 'a', [
          'Maior velocidade de transferência',
          'Usar menos fios',
          'Não precisar de GND',
          'Permitir endereços de 10 bits'
        ], 'SPI atinge vários MHz; em compensação precisa de mais fios (um CS por escravo).'),
        mcq('q7', 'Qual destes protocolos é assíncrono, sem sinal de clock, e exige que os dois lados usem o mesmo baud rate?', 'c', [
          'SPI',
          'I2C',
          'UART (Serial)',
          'PWM'
        ], 'A UART não tem clock compartilhado; baud rate igual nos dois lados garante a leitura correta.'),
        fill('q8', 'Complete o nível em que o CS deve ficar para o escravo ser selecionado:', 'digitalWrite(CS, ___);   // seleciona o escravo', ['LOW', '0'], 'O chip select é ativo em LOW: LOW seleciona, HIGH libera.')
      ]
    },
    {
      id: 'ari-14-sd-datalogger',
      title: 'Cartão SD e datalogger',
      goal: 'Gravar medições de sensores em arquivo CSV no cartão SD.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'O módulo SD e a biblioteca SD.h',
            body: 'O módulo de cartão SD (ou microSD) conversa com o Arduino por SPI: liga-se MOSI ao 11, MISO ao 12, SCK ao 13 e o CS a um pino escolhido (comumente o 10). O cartão deve estar formatado em FAT16 ou FAT32 (para cartões de até 32 GB, FAT32). A biblioteca SD.h vem na IDE. SD.begin(pinoCS) inicia e devolve true se tudo deu certo. Atenção: a biblioteca usa bastante SRAM (cerca de meio KB) no Uno.',
            code: '#include <SPI.h>\n#include <SD.h>\n\nconst int CS_SD = 10;\n\nvoid setup() {\n  Serial.begin(9600);\n  if (!SD.begin(CS_SD)) {\n    Serial.println(F("Falha ao iniciar o SD"));\n    while (true) {}   // para aqui\n  }\n}'
          },
          {
            title: 'Abrir, escrever e fechar',
            body: 'SD.open(nome, FILE_WRITE) abre o arquivo para escrita no fim (cria se não existir) e devolve um objeto File. Use print e println como na Serial. Os dados ficam em um buffer: só são efetivamente gravados no cartão em f.flush() ou f.close(). Sempre feche o arquivo quando terminar; se faltar energia antes disso, as últimas linhas podem se perder (e o arquivo pode corromper). Nomes de arquivo na biblioteca padrão seguem o formato 8.3 (até 8 letras, ponto, 3 de extensão).',
            code: 'File f = SD.open("DADOS.CSV", FILE_WRITE);\nif (f) {\n  f.println("tempo_ms,temp_c");\n  f.close();   // grava de verdade no cartao\n} else {\n  Serial.println(F("Erro ao abrir"));\n}'
          },
          {
            title: 'Lendo um arquivo',
            body: 'Abra com SD.open(nome) (sem FILE_WRITE) e leia enquanto houver bytes: f.available() diz se ainda há dados e f.read() devolve o próximo byte. SD.exists(nome) confere se o arquivo existe.',
            code: 'File f = SD.open("DADOS.CSV");\nif (f) {\n  while (f.available()) {\n    Serial.write(f.read());\n  }\n  f.close();\n}'
          },
          {
            title: 'Formato CSV',
            body: 'CSV (valores separados por vírgula) é o formato mais simples para tabelas: uma linha por registro, campos separados por vírgula, e a primeira linha costuma ser o cabeçalho com os nomes das colunas. Pode ser aberto em planilhas. Use ponto como separador decimal e não coloque vírgulas dentro dos valores. Cada linha: tempo, medição 1, medição 2.'
          },
          {
            title: 'Datalogger: registrando um sensor',
            body: 'Um datalogger lê um sensor em intervalos e grava com um carimbo de tempo (timestamp). Sem RTC, usa-se millis() (tempo desde ligar); com um RTC, a data e hora reais. Grave APENAS medições do ambiente (temperatura, umidade...), nunca dados pessoais. Para durar, leia em intervalo com millis, abra, escreva, feche (ou faça flush periódico).',
            code: 'unsigned long ultimo = 0;\n\nvoid loop() {\n  if (millis() - ultimo >= 5000) {\n    ultimo = millis();\n    float temp = analogRead(A0) * 5.0 / 1023.0 * 100.0; // LM35\n    File f = SD.open("DADOS.CSV", FILE_WRITE);\n    if (f) {\n      f.print(ultimo);\n      f.print(",");\n      f.println(temp);\n      f.close();\n    }\n  }\n}'
          }
        ]
      },
      questions: [
        mcq('q1', 'Por qual protocolo o módulo de cartão SD se comunica com o Arduino?', 'c', [
          'I2C',
          'UART',
          'SPI',
          'PWM'
        ], 'O módulo SD usa SPI: MOSI, MISO, SCK e um pino CS.'),
        mcq('q2', 'O que SD.begin(10) retorna?', 'a', [
          'true se o cartão foi inicializado com sucesso, false se falhou',
          'O tamanho do cartão em bytes',
          'O nome do primeiro arquivo',
          'Nada (void)'
        ], 'Conferimos o retorno para tratar cartão ausente ou mal conectado.'),
        mcq('q3', 'Por que é importante chamar close() (ou flush()) depois de escrever?', 'd', [
          'Para liberar o pino 10 permanentemente',
          'Para o arquivo ficar em maiúsculas',
          'Para trocar o formato para FAT32',
          'Porque os dados ficam em um buffer e só são gravados no cartão com flush/close'
        ], 'Sem flush/close, falta de energia pode perder as últimas linhas ou corromper o arquivo.'),
        fill('q4', 'Complete o modo que abre o arquivo para escrita no final (e cria se não existir):', 'File f = SD.open("DADOS.CSV", ___);', ['FILE_WRITE'], 'FILE_WRITE abre para escrita com o cursor ao final do arquivo.'),
        mcq('q5', 'O que é um arquivo CSV?', 'b', [
          'Um programa compilado do Arduino',
          'Um texto com valores separados por vírgula, uma linha por registro',
          'Uma imagem comprimida',
          'Uma biblioteca do SD'
        ], 'CSV é texto simples e tabular que abre direto em planilhas.'),
        mcq('q6', 'Em um datalogger que grava "tempo_ms,temp_c", qual é o uso correto do timestamp?', 'c', [
          'Gravar o nome do usuário em cada linha',
          'Gravar a senha do Wi-Fi',
          'Gravar millis() (ou a hora do RTC) junto com a medição, sem dados pessoais',
          'Não gravar tempo algum'
        ], 'Registramos apenas medições do ambiente com o instante em que foram feitas.'),
        mcq('q7', 'Qual loop lê todo o conteúdo de um arquivo aberto f?', 'a', [
          'while (f.available()) { Serial.write(f.read()); }',
          'while (!f.available()) { f.read(); }',
          'for (;;) { f.close(); }',
          'if (f.exists()) { f.begin(); }'
        ], 'available() indica se restam bytes e read() devolve o próximo.'),
        fill('q8', 'Complete o método que escreve o texto seguido de quebra de linha no arquivo:', 'f.___("tempo_ms,temp_c");', ['println'], 'println grava o texto e a quebra de linha, formando uma linha de CSV.')
      ]
    },
    {
      id: 'ari-25-rfid-rc522',
      title: 'RFID com o módulo RC522',
      goal: 'Ler o UID de cartões e tags RFID e montar um controle de acesso simples, ciente dos limites de segurança e da LGPD.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'RFID, tags e UID',
            body: 'RFID (identificação por radiofrequência) usa um leitor e etiquetas ("tags", cartões ou chaveiros). A família mais comum em projetos de Arduino opera em 13,56 MHz (padrão MIFARE). A tag é passiva: não tem bateria; ela se alimenta do campo magnético do leitor por indução, por isso o alcance é de poucos centímetros. Toda tag traz de fábrica um UID, um número de identificação único gravado nela, normalmente com 4 bytes (também existem de 7 e 10 bytes), que costumamos escrever em hexadecimal, por exemplo DE AD BE EF (valor fictício).'
          },
          {
            title: 'O módulo RC522 e a ligação por SPI',
            body: 'O módulo RC522 (chip MFRC522, da NXP) fala SPI, como visto na lição de SPI. ATENÇÃO À TENSÃO: ele é alimentado com 3,3 V. Ligar o VCC aos 5 V do Arduino pode danificar o módulo. As entradas de dados também são oficialmente de 3,3 V; muitos montadores usam o Uno direto, mas o correto é divisores de tensão (resistores) nas linhas que saem do Arduino. Pinos do módulo e ligação típica no Uno: SDA (que é o SS/CS, seleção do escravo) no 10, SCK no 13, MOSI no 11, MISO no 12, RST no 9, GND no GND e 3.3V no 3V3. O pino IRQ não é usado.'
          },
          {
            title: 'Biblioteca MFRC522: lendo o UID',
            body: 'Use a biblioteca MFRC522 (Miguel Balboa), pelo Library Manager. Na biblioteca, PCD é o leitor e PICC é o cartão. PCD_Init() inicia o módulo; PICC_IsNewCardPresent() diz se há um cartão novo no campo; PICC_ReadCardSerial() lê o UID, que fica em rfid.uid: uid.size é o número de bytes e uid.uidByte[i] é cada byte. Serial.print(valor, HEX) imprime em hexadecimal, mas SEM zero à esquerda (0x0A sai como A); por isso se coloca um "0" antes quando o byte é menor que 0x10. PICC_HaltA() coloca o cartão em espera para não ser lido de novo sem parar.',
            code: '#include <SPI.h>\n#include <MFRC522.h>\n\nMFRC522 rfid(10, 9);   // SS, RST\n\nvoid setup() {\n  Serial.begin(9600);\n  SPI.begin();\n  rfid.PCD_Init();\n}\n\nvoid loop() {\n  if (!rfid.PICC_IsNewCardPresent()) return;\n  if (!rfid.PICC_ReadCardSerial()) return;\n\n  for (byte i = 0; i < rfid.uid.size; i++) {\n    if (rfid.uid.uidByte[i] < 0x10) Serial.print("0");\n    Serial.print(rfid.uid.uidByte[i], HEX);\n    Serial.print(" ");\n  }\n  Serial.println();\n  rfid.PICC_HaltA();\n}'
          },
          {
            title: 'Lista de UIDs autorizados',
            body: 'Para decidir se um cartão pode entrar, guardamos uma tabela de UIDs autorizados e comparamos byte a byte. Em C, comparar vetores com == não serve (compara endereços); usamos memcmp(a, b, tamanho), que devolve 0 quando os bytes são iguais (como o strcmp faz para textos). Confira também o tamanho do UID. Os valores abaixo são FICTÍCIOS, só para o exemplo.',
            code: 'const byte AUTORIZADOS[][4] = {\n  {0xDE, 0xAD, 0xBE, 0xEF},   // ficticio\n  {0x12, 0x34, 0x56, 0x78}    // ficticio\n};\nconst byte QTD = 2;\n\nbool autorizado() {\n  if (rfid.uid.size != 4) return false;\n  for (byte i = 0; i < QTD; i++) {\n    if (memcmp(rfid.uid.uidByte, AUTORIZADOS[i], 4) == 0) return true;\n  }\n  return false;\n}'
          },
          {
            title: 'Controle de acesso: abrir e fechar sem travar',
            body: 'Se o UID está na lista, acionamos uma trava (um relé ou um servo, como nas lições anteriores) por alguns segundos e depois fechamos, com millis() para não bloquear o loop. Lembre das regras de carga: trava ou solenoide é carga indutiva (diodo de roda livre), alimentada por fonte externa, com GND comum, e relé sem ligar nada na tomada. O LED ou buzzer de feedback ajuda o usuário a saber se foi aceito ou negado.',
            code: 'const int PINO_TRAVA = 7;\nunsigned long tAbriu = 0;\nbool aberta = false;\n\n// no loop, apos ler o cartao:\nif (autorizado()) {\n  digitalWrite(PINO_TRAVA, HIGH);\n  aberta = true;\n  tAbriu = millis();\n}\n\n// em toda volta do loop:\nif (aberta && millis() - tAbriu >= 3000) {\n  digitalWrite(PINO_TRAVA, LOW);\n  aberta = false;\n}'
          },
          {
            title: 'Segurança: o UID não é autenticação forte',
            body: 'O UID de uma tag comum é transmitido em aberto, sem criptografia, e qualquer leitor barato o lê em segundos. Existem cartões "mágicos" com UID regravável que clonam outro cartão. Logo, abrir uma porta só porque o UID está na lista equivale a uma senha que qualquer um pode copiar e repetir. Serve para brinquedos, projetos didáticos e portas de baixo risco. Para algo que importa, são necessários mecanismos de autenticação criptográfica de verdade (tags que respondem a desafios com chaves secretas, não só o UID) ou um segundo fator (por exemplo, cartão + senha digitada no teclado). Mesmo o MIFARE Classic tem criptografia antiga e quebrada.'
          },
          {
            title: 'Privacidade e LGPD',
            body: 'Quando um UID passa a estar associado a uma pessoa (o cartão do João, o crachá de uma aluna), ele deixa de ser só um número e vira dado pessoal: uma informação relacionada a pessoa identificada ou identificável (LGPD, Lei 13.709/2018). Um registro de "quem entrou e quando" é tratamento de dados pessoais. Boas práticas: minimização (guarde só o necessário: muitas vezes basta saber se o UID é autorizado, sem registrar nome e hora); finalidade clara e base legal, incluindo informar e obter o consentimento quando for o caso; prazo de retenção curto; proteção do armazenamento (acesso restrito, nada de listas em texto aberto onde qualquer um alcança); e nunca versionar no Git uma lista de UIDs reais, nem postar fotos ou logs com eles. Em tutoriais e testes, use sempre UIDs fictícios, como os desta lição.'
          }
        ]
      },
      questions: [
        mcq('q1', 'Qual é a frequência típica das tags RFID MIFARE usadas com o RC522, e como elas funcionam sem bateria?', 'b', [
          '2,4 GHz, com uma pilha pequena dentro da tag',
          '13,56 MHz, alimentadas por indução pelo campo magnético do leitor',
          '38 kHz, alimentadas pela luz do ambiente',
          '5 V, alimentadas pelo pino do Arduino'
        ], 'As tags passivas colhem energia do campo do leitor; o alcance é de poucos centímetros.'),
        mcq('q2', 'Qual deve ser a tensão de alimentação (VCC) do módulo RC522?', 'c', [
          '12 V',
          '5 V sempre',
          '3,3 V',
          '220 V'
        ], 'O RC522 é um módulo de 3,3 V; ligar o VCC aos 5 V pode danificá-lo.'),
        mcq('q3', 'O que é o UID de uma tag RFID?', 'a', [
          'Um número de identificação gravado na tag, em geral de 4 bytes (também 7 ou 10)',
          'A senha criptográfica secreta do usuário',
          'A tensão que a tag recebe do leitor',
          'O endereço I2C do módulo'
        ], 'O UID identifica a tag; por ser transmitido em aberto, não é um segredo.'),
        fill('q4', 'Complete o método que inicia o módulo leitor (PCD = leitor):', 'void setup() {\n  SPI.begin();\n  rfid.___();\n}', ['PCD_Init', 'PCD_Init()'], 'PCD_Init() configura o chip MFRC522; PCD é o leitor e PICC é o cartão.'),
        mcq('q5', 'Na biblioteca MFRC522, o que informa rfid.uid.size?', 'd', [
          'O tamanho da memória da tag, em KB',
          'A distância do cartão ao leitor',
          'O tamanho do arquivo de log',
          'O número de bytes do UID lido'
        ], 'uid.size é a quantidade de bytes do UID, e uid.uidByte[i] acessa cada um deles.'),
        mcq('q6', 'Por que um sistema que só confere o UID NÃO deve ser tratado como autenticação forte?', 'c', [
          'Porque o UID muda a cada leitura',
          'Porque o RC522 só lê UIDs de 1 byte',
          'Porque o UID é transmitido em aberto e pode ser lido e clonado facilmente',
          'Porque o Arduino não consegue comparar vetores'
        ], 'Qualquer leitor lê o UID e cartões com UID regravável permitem cloná-lo.'),
        mcq('q7', 'Qual prática está alinhada à LGPD em um sistema que registra os UIDs de pessoas identificadas?', 'a', [
          'Registrar só o necessário, com finalidade e consentimento claros, retenção curta e armazenamento protegido',
          'Guardar tudo para sempre, por precaução',
          'Publicar a lista de UIDs reais no GitHub para backup',
          'Usar o nome das pessoas em texto aberto dentro do código-fonte'
        ], 'UID associado a uma pessoa é dado pessoal: minimização, finalidade, consentimento e proteção.'),
        fill('q8', 'Complete o formato para imprimir cada byte do UID em hexadecimal:', 'Serial.print(rfid.uid.uidByte[i], ___);', ['HEX'], 'Serial.print(valor, HEX) imprime em hexadecimal (sem zero à esquerda).')
      ]
    },
    {
      id: 'ari-15-eeprom',
      title: 'EEPROM: memória que sobrevive ao desligar',
      goal: 'Guardar configurações e contadores de forma permanente, respeitando a vida útil da memória.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'O que é a EEPROM',
            body: 'As variáveis comuns ficam na SRAM e somem quando a energia cai. A EEPROM do ATmega328P é uma memória interna que MANTÉM os dados sem alimentação. No Uno ela tem 1024 bytes (endereços de 0 a 1023). Serve para guardar configurações (limites, calibrações), contadores e o último estado. Cada posição guarda 1 byte (valor de 0 a 255); uma EEPROM nova vem com todos os bytes em 255.'
          },
          {
            title: 'read e write',
            body: 'Com #include <EEPROM.h>: EEPROM.read(endereco) devolve o byte guardado; EEPROM.write(endereco, valor) grava um byte. Ler é rápido e ilimitado; escrever demora cerca de 3,3 ms por byte e desgasta a memória.',
            code: '#include <EEPROM.h>\n\nvoid setup() {\n  Serial.begin(9600);\n  EEPROM.write(0, 42);          // grava 42 no endereco 0\n  byte v = EEPROM.read(0);      // le de volta\n  Serial.println(v);\n}'
          },
          {
            title: 'Vida útil: cerca de 100 000 escritas',
            body: 'Cada célula da EEPROM suporta aproximadamente 100 000 ciclos de escrita. Depois disso pode falhar. Um erro clássico é escrever dentro do loop() sem controle: em poucos minutos, a conta estoura. Evite escrever em toda volta; escreva só quando algo realmente mudou. Se precisa guardar com frequência, espalhe os endereços ou use outra memória (como o cartão SD). A leitura não desgasta.'
          },
          {
            title: 'update: escrever só se mudou',
            body: 'EEPROM.update(endereco, valor) lê o byte e só grava se o valor for DIFERENTE do que já está lá, poupando ciclos de escrita. Prefira update a write na maior parte dos casos.',
            code: 'EEPROM.update(0, brilho);   // so grava se brilho mudou'
          },
          {
            title: 'put e get: tipos maiores',
            body: 'int ocupa 2 bytes, float 4 bytes. EEPROM.put(endereco, variavel) grava qualquer tipo (int, float, struct inteira) ocupando sizeof bytes a partir do endereço — e internamente só escreve o que mudou (como update). EEPROM.get(endereco, variavel) lê de volta, preenchendo a variável. Planeje os endereços: depois de um float em 0 a 3, o próximo dado começa em 4 (ou em sizeof(float)). EEPROM.length() devolve o tamanho total (1024 no Uno).',
            code: 'struct Config {\n  int limite;\n  float calibracao;\n};\n\nConfig cfg;\n\nvoid setup() {\n  EEPROM.get(0, cfg);        // le a config guardada\n  if (cfg.limite < 0 || cfg.limite > 1000) {\n    cfg.limite = 500;        // valor padrao se dado invalido\n    cfg.calibracao = 1.0;\n    EEPROM.put(0, cfg);      // salva\n  }\n}'
          },
          {
            title: 'Persistindo configurações com segurança',
            body: 'Na primeira execução a EEPROM contém lixo (255 em tudo): por isso checamos se o dado lido é plausível, ou guardamos um valor "marcador" (por exemplo, o byte 0xA5 no endereço 0) que indica que a configuração já foi gravada. Salve só quando o usuário muda a configuração (por exemplo, ao apertar um botão de salvar), nunca a cada volta do loop.'
          }
        ]
      },
      questions: [
        mcq('q1', 'Quantos bytes tem a EEPROM do Arduino Uno?', 'b', [
          '256',
          '1024',
          '2048',
          '32768'
        ], 'O ATmega328P do Uno tem 1 KB (1024 bytes) de EEPROM, endereços 0 a 1023.'),
        mcq('q2', 'Qual é a característica da EEPROM em relação à SRAM?', 'c', [
          'É mais rápida que a SRAM',
          'Perde os dados quando a energia cai',
          'Mantém os dados sem alimentação',
          'Só pode ser lida uma vez'
        ], 'A EEPROM é memória não volátil: sobrevive ao desligamento.'),
        mcq('q3', 'Aproximadamente quantos ciclos de escrita cada célula da EEPROM suporta?', 'a', [
          '100 000',
          '100',
          '10 bilhões',
          'Ilimitados'
        ], 'Cerca de 100 000 escritas por célula; a leitura não desgasta.'),
        fill('q4', 'Complete o método que só grava se o valor novo for diferente do atual, poupando escritas:', 'EEPROM.___(0, brilho);', ['update'], 'update compara com o valor armazenado e só escreve se mudou.'),
        mcq('q5', 'Por que escrever na EEPROM em toda volta do loop() é uma péssima ideia?', 'd', [
          'Porque a EEPROM só aceita escrita no setup',
          'Porque apaga o programa',
          'Porque impede o uso do Serial',
          'Porque em pouco tempo esgota a vida útil das células'
        ], 'Um loop rápido pode fazer milhares de escritas por minuto, esgotando 100 000 ciclos rapidamente.'),
        mcq('q6', 'Um float ocupa 4 bytes. Se EEPROM.put(0, temperaturaFloat); foi usado, em qual endereço pode começar o próximo dado sem sobrepor?', 'b', [
          '1',
          '4',
          '2',
          '0'
        ], 'O float ocupa os endereços 0, 1, 2 e 3; o próximo livre é o 4.'),
        mcq('q7', 'Para que serve EEPROM.get(0, cfg) quando cfg é uma struct?', 'c', [
          'Apaga a struct',
          'Grava a struct',
          'Lê os bytes guardados a partir do endereço 0 e preenche cfg',
          'Converte cfg em texto'
        ], 'get é o inverso de put: lê sizeof(cfg) bytes e os coloca na variável.'),
        fill('q8', 'Complete o método que grava uma struct ou float inteiro, ocupando vários bytes (e só escrevendo o que mudou):', 'EEPROM.___(0, cfg);', ['put'], 'put grava variáveis de qualquer tipo, byte a byte, a partir do endereço indicado.')
      ]
    },
    {
      id: 'ari-16-74hc595-7seg',
      title: '74HC595 e display de 7 segmentos',
      goal: 'Ganhar saídas com o registrador de deslocamento e mostrar dígitos em 7 segmentos.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Por que expandir as saídas',
            body: 'O Uno tem poucos pinos. Um display de 7 segmentos já gasta 7 ou 8 deles; 8 LEDs, outros 8. O registrador de deslocamento 74HC595 transforma 3 pinos do Arduino em 8 saídas digitais (Q0 a Q7), e vários podem ser ligados em cadeia (cascata) para ganhar 16, 24 ou mais saídas com os mesmos 3 pinos.'
          },
          {
            title: 'Data, clock e latch',
            body: 'O 74HC595 recebe os bits um a um: DS (pino 14) é o dado serial; SH_CP (pino 11) é o clock de deslocamento — a cada pulso o chip lê um bit e o empurra para dentro; ST_CP (pino 12) é o latch, que copia os 8 bits recebidos para as saídas de uma vez. O latch evita que as saídas "pisquem" enquanto os bits ainda estão entrando. Outros pinos: OE (13) em GND habilita as saídas; MR (10) em 5 V evita o reset; VCC (16) em 5 V; GND (8) em GND; Q7\' (9) serve para ligar o próximo chip em cascata.'
          },
          {
            title: 'shiftOut: enviando um byte',
            body: 'shiftOut(pinoDado, pinoClock, ordem, valor) envia 8 bits, um por pulso de clock. A ordem pode ser MSBFIRST (bit mais significativo primeiro) ou LSBFIRST. Sequência típica: baixar o latch, enviar com shiftOut, subir o latch para atualizar as saídas. Lembre de usar resistores de limitação em cada LED ligado a uma saída.',
            code: 'const int DADO = 2, CLOCK = 3, LATCH = 4;\n\nvoid setup() {\n  pinMode(DADO, OUTPUT);\n  pinMode(CLOCK, OUTPUT);\n  pinMode(LATCH, OUTPUT);\n}\n\nvoid enviar(byte valor) {\n  digitalWrite(LATCH, LOW);\n  shiftOut(DADO, CLOCK, MSBFIRST, valor);\n  digitalWrite(LATCH, HIGH);   // atualiza as saidas\n}\n\nvoid loop() {\n  enviar(0b10101010);   // liga as saidas alternadas\n  delay(500);\n  enviar(0b01010101);\n  delay(500);\n}'
          },
          {
            title: 'Display de 7 segmentos: cátodo ou ânodo comum',
            body: 'Um display de 7 segmentos tem 7 LEDs (a, b, c, d, e, f, g) mais o ponto decimal (dp). Em um display de CÁTODO comum, todos os cátodos vão ao GND (por um resistor) e um segmento acende com nível HIGH. Em um display de ÂNODO comum, o pino comum vai a 5 V e o segmento acende com nível LOW — a lógica é invertida. Cada segmento precisa de seu resistor (por exemplo 220 Ω).'
          },
          {
            title: 'Tabela de dígitos',
            body: 'Associando cada segmento a um bit (bit 0 = a, bit 1 = b, ... bit 6 = g), cada dígito vira um byte. Para cátodo comum: 0 = 0x3F, 1 = 0x06, 2 = 0x5B, 3 = 0x4F, 4 = 0x66, 5 = 0x6D, 6 = 0x7D, 7 = 0x07, 8 = 0x7F, 9 = 0x6F. Para ânodo comum, inverta os bits com ~ (e mantenha 8 bits): ~0x3F & 0xFF = 0xC0 para o 0.',
            code: 'const byte DIGITOS[10] = {\n  0x3F, 0x06, 0x5B, 0x4F, 0x66,\n  0x6D, 0x7D, 0x07, 0x7F, 0x6F   // catodo comum\n};\n\nvoid mostrar(int n) {\n  enviar(DIGITOS[n]);\n}'
          },
          {
            title: 'Multiplexação (conceito)',
            body: 'Para vários dígitos (por exemplo um relógio de 4 dígitos), ligar tudo separado gastaria muitos pinos. Na multiplexação todos os dígitos compartilham as mesmas linhas de segmentos, e o pino comum de cada dígito é ativado um de cada vez, muito rápido (centenas de vezes por segundo). Pela persistência da visão, parece que todos estão acesos ao mesmo tempo. Economiza pinos, mas exige atualização constante no loop (sem delay longo).'
          }
        ]
      },
      questions: [
        mcq('q1', 'Qual é a principal utilidade do 74HC595?', 'd', [
          'Medir temperatura',
          'Amplificar o som',
          'Gerar PWM de alta frequência',
          'Transformar 3 pinos do Arduino em 8 saídas digitais'
        ], 'Dado, clock e latch controlam 8 saídas, e a cascata permite ainda mais.'),
        mcq('q2', 'Qual é a função do pino de latch (ST_CP)?', 'b', [
          'Enviar o clock',
          'Copiar os bits recebidos para as saídas de uma vez',
          'Alimentar o chip',
          'Resetar o Arduino'
        ], 'O latch atualiza as saídas só quando os 8 bits já estão no registrador, evitando piscadas.'),
        mcq('q3', 'Qual é a sequência correta para atualizar um 74HC595?', 'c', [
          'Latch HIGH, shiftOut, delay',
          'shiftOut, depois reset do Arduino',
          'Latch LOW, shiftOut, latch HIGH',
          'Somente digitalWrite em cada saída Q'
        ], 'Baixa o latch, desloca os bits e sobe o latch para exibir.'),
        fill('q4', 'Complete a ordem de envio que manda o bit mais significativo primeiro:', 'shiftOut(DADO, CLOCK, ___, valor);', ['MSBFIRST'], 'MSBFIRST envia primeiro o bit 7; LSBFIRST envia primeiro o bit 0.'),
        mcq('q5', 'Em um display de 7 segmentos de CÁTODO comum, como acender um segmento?', 'a', [
          'Aplicando nível HIGH ao pino daquele segmento',
          'Aplicando nível LOW ao pino daquele segmento',
          'Ligando o segmento direto em 220 V',
          'Retirando o resistor'
        ], 'Com o cátodo comum no GND, HIGH acende. No ânodo comum a lógica é invertida.'),
        mcq('q6', 'Qual é o byte (cátodo comum) que mostra o dígito 1, acendendo apenas os segmentos b e c?', 'b', [
          '0x3F',
          '0x06',
          '0x5B',
          '0x7F'
        ], 'b é o bit 1 e c é o bit 2: 0b00000110 = 0x06.'),
        mcq('q7', 'Qual é a ideia da multiplexação em displays de vários dígitos?', 'c', [
          'Cada dígito tem seu próprio Arduino',
          'Aumentar a tensão para brilhar mais',
          'Compartilhar as linhas de segmentos e acender um dígito por vez muito rapidamente',
          'Usar apenas um dígito por vez e apagar os outros'
        ], 'A varredura rápida engana a visão, economizando pinos.'),
        fill('q8', 'Complete o nível do latch que atualiza as saídas depois de enviar os bits:', 'digitalWrite(LATCH, LOW);\nshiftOut(DADO, CLOCK, MSBFIRST, valor);\ndigitalWrite(LATCH, ___);', ['HIGH', '1'], 'A subida do latch copia os bits do registrador para as saídas.')
      ]
    },
    {
      id: 'ari-30-max7219-matriz',
      title: 'MAX7219: matriz de LEDs e displays de 7 segmentos',
      goal: 'Controlar 64 LEDs com 3 fios usando o driver MAX7219 e a biblioteca LedControl.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'O que é o MAX7219',
            body: 'O MAX7219 é um chip driver que controla até 64 LEDs individuais: uma matriz de LEDs 8x8 ou até 8 dígitos de 7 segmentos (8 segmentos, contando o ponto, por dígito). A grande vantagem sobre o 74HC595 é que a multiplexação (acender uma linha ou dígito de cada vez, em velocidade alta) é feita DENTRO do chip: depois que você envia um valor, o MAX7219 se encarrega de manter o display aceso sozinho, sem o Arduino precisar atualizar nada em loop. Também controla o brilho e já traz o controle de corrente dos LEDs.'
          },
          {
            title: 'Interface de 3 fios e o resistor RSET',
            body: 'A comunicação usa 3 fios, num estilo parecido com SPI: DIN (dados seriais de entrada), CLK (clock) e CS, também chamado LOAD (seleciona o chip e "trava" o dado recebido). Além de VCC (5 V) e GND, é só isso. A corrente que passa pelos segmentos é definida por um resistor externo chamado RSET, entre o pino ISET e o VCC: um valor menor deixa os LEDs mais fortes, um maior, mais fracos. Os módulos prontos já trazem o RSET soldado (cerca de 10 kΩ), então você normalmente não mexe nisso, mas é por isso que a corrente dos LEDs não depende de resistores individuais por segmento.'
          },
          {
            title: 'Registradores principais (visão geral)',
            body: 'Cada comando enviado ao MAX7219 tem 16 bits: 8 de endereço de registrador e 8 de dado. Os principais registradores: decode mode (liga a conversão automática de dígitos BCD para 7 segmentos, útil em displays de 7 segmentos, desligada em matrizes); intensity (brilho, 16 níveis de 0 a 15); scan limit (quantas linhas/dígitos de 1 a 8 o chip varre); shutdown (modo de economia: o display apaga, mas os dados são mantidos); e display test (acende todos os LEDs para teste). Ao ligar, o chip começa em shutdown, por isso é preciso acordá-lo no setup. A biblioteca LedControl esconde esses detalhes.'
          },
          {
            title: 'Biblioteca LedControl: começando',
            body: 'A biblioteca LedControl (instalável pelo Library Manager) cria um objeto com os pinos e o número de módulos: LedControl lc(DIN, CLK, CS, nModulos). Cada módulo tem um endereço (addr), começando em 0. No setup, acorde o chip com shutdown(addr, false) (falso significa "não está em economia", ou seja, ligado), ajuste o brilho com setIntensity(addr, 0 a 15) e apague tudo com clearDisplay(addr). Cuidado: o nome confunde, shutdown(addr, true) é que desliga o display.',
            code: '#include <LedControl.h>\n\nLedControl lc(12, 11, 10, 1);  // DIN=12, CLK=11, CS=10, 1 modulo\n\nvoid setup() {\n  lc.shutdown(0, false);   // acorda o chip\n  lc.setIntensity(0, 8);   // brilho medio (0 a 15)\n  lc.clearDisplay(0);      // apaga tudo\n}'
          },
          {
            title: 'Acendendo LEDs, linhas e dígitos',
            body: 'Para a matriz 8x8: setLed(addr, linha, coluna, estado) liga ou desliga um LED individual (linha e coluna de 0 a 7; estado true ou false) e setRow(addr, linha, valor) escreve uma linha inteira com um byte, em que cada bit é um LED (bit 1 acende). Isso permite desenhar um sprite (figura) como oito bytes, um por linha. A orientação (qual lado é a linha 0) depende do módulo, e às vezes é preciso girar a figura. Para displays de 7 segmentos há setDigit(addr, posicao, valor, ponto), que mostra um número de 0 a 15 em uma posição (o decode já é feito pela biblioteca).',
            code: 'byte coracao[8] = {\n  0b00000000, 0b01100110, 0b11111111, 0b11111111,\n  0b11111111, 0b01111110, 0b00111100, 0b00011000\n};\n\nvoid desenhar() {\n  for (int linha = 0; linha < 8; linha++) {\n    lc.setRow(0, linha, coracao[linha]);\n  }\n}\n\n// um LED individual:\nlc.setLed(0, 3, 4, true);  // linha 3, coluna 4'
          },
          {
            title: 'Encadeamento e rolagem de texto',
            body: 'Vários módulos se ligam em cadeia: a saída DOUT de um módulo vai à entrada DIN do próximo, e CLK e CS são compartilhados por todos. Na biblioteca basta informar o número de módulos no construtor e indicar o endereço (0, 1, 2...) em cada chamada, ficando só 3 pinos do Arduino ocupados mesmo com 4 ou 8 módulos. Para rolar um texto, guarde os caracteres como bitmaps (bytes por coluna ou linha) e, a cada intervalo medido com millis, redesenhe tudo deslocado em uma coluna para o lado, passando a coluna que sai de um módulo para o seguinte.'
          },
          {
            title: 'Alimentação e comparações',
            body: 'O MAX7219 trabalha com 5 V (cerca de 4,0 a 5,5 V). Cada módulo pode puxar centenas de miliampères com todos os LEDs acesos no brilho máximo, e módulos em cadeia somam isso: um USB de computador aguenta alguns, mas muitos módulos pedem fonte externa de 5 V com GND comum, e é boa prática manter o brilho baixo (setIntensity) para esquentar menos e consumir menos. Comparando: o 74HC595 é um registrador simples, exige que o Arduino faça a multiplexação e tem resistores por LED; o MAX7219 faz tudo isso no chip, mas custa mais. Já o TM1637 é um módulo pronto de 4 dígitos de 7 segmentos, com apenas 2 fios (CLK e DIO), mais barato e simples para relógios e contadores, mas sem matriz.'
          }
        ]
      },
      questions: [
        mcq('q1', 'Qual é a principal vantagem do MAX7219 em relação ao 74HC595 para controlar uma matriz ou vários dígitos?', 'c', [
          'Ele funciona sem alimentação',
          'Ele só controla um LED por vez',
          'A multiplexação é feita dentro do chip, que mantém o display aceso sozinho',
          'Ele não precisa de nenhum fio de dados'
        ], 'O MAX7219 varre linhas e dígitos internamente; no 74HC595 o Arduino precisa atualizar constantemente.'),
        mcq('q2', 'Quais são os três fios de controle do MAX7219 ligados ao Arduino?', 'b', [
          'SDA, SCL e INT',
          'DIN, CLK e CS (LOAD)',
          'TX, RX e RST',
          'DS, SH_CP e OE'
        ], 'DIN (dados), CLK (clock) e CS/LOAD (seleciona e trava) formam a interface do tipo SPI.'),
        mcq('q3', 'Para que serve o resistor RSET do MAX7219?', 'a', [
          'Definir a corrente que passa pelos segmentos dos LEDs',
          'Definir o endereço do módulo',
          'Ajustar a velocidade do clock',
          'Proteger o pino de reset do Arduino'
        ], 'O RSET entre ISET e VCC fixa a corrente dos segmentos; os módulos prontos já vêm com ele.'),
        fill('q4', 'Complete o argumento que acorda o chip (tira do modo de economia) para o display acender:', 'lc.shutdown(0, ___);', ['false', 'FALSE', '0'], 'O chip liga em shutdown; shutdown(addr, false) o acorda, e true o desliga.'),
        mcq('q5', 'Como vários módulos MAX7219 são encadeados?', 'd', [
          'Ligando todos os DIN no mesmo pino de dados do Arduino e usando um CS para cada um',
          'Ligando o 5 V de um ao GND do outro',
          'Não é possível encadear, apenas usar um módulo',
          'O DOUT de um módulo vai ao DIN do seguinte, e CLK e CS são compartilhados'
        ], 'Em cadeia, só 3 pinos do Arduino são usados, e cada módulo ganha um endereço (0, 1, 2...) na biblioteca.'),
        mcq('q6', 'Como se faz um texto rolar numa matriz de LEDs com MAX7219?', 'a', [
          'Redesenhando os bitmaps deslocados uma coluna a cada intervalo (por exemplo com millis)',
          'Girando o módulo fisicamente',
          'Aumentando o valor de setIntensity',
          'Ligando o display test'
        ], 'Rolagem é redesenho periódico dos bytes de bitmap, deslocados em uma coluna.'),
        mcq('q7', 'Qual cuidado de alimentação vale para muitos módulos MAX7219 acesos?', 'c', [
          'Alimentar com 220 V para brilhar mais',
          'Ligar sem GND comum',
          'Usar fonte externa de 5 V com GND comum e manter o brilho baixo para reduzir consumo e aquecimento',
          'Nenhum cuidado: o consumo é sempre desprezível'
        ], 'Cada módulo pode puxar centenas de mA no brilho máximo; a corrente soma ao encadear.'),
        fill('q8', 'Complete o método da LedControl que ajusta o brilho (valores de 0 a 15):', 'lc.___(0, 8);', ['setIntensity'], 'setIntensity(addr, nivel) ajusta o brilho, de 0 a 15.')
      ]
    },
    {
      id: 'ari-27-multiplexadores-entradas',
      title: 'Expandindo entradas: 74HC165 e multiplexador CD4051',
      goal: 'Ler 8 botões ou 8 sensores analógicos usando poucos pinos do Arduino.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Faltam pinos de ENTRADA também',
            body: 'O 74HC595 da lição anterior ganha saídas. Para ganhar ENTRADAS existem outros dois componentes clássicos: o 74HC165, que lê até 8 sinais digitais (como botões) usando 3 pinos, e o multiplexador analógico CD4051, que permite ler até 8 sensores analógicos usando um único pino analógico mais 3 pinos de seleção. São baratos e funcionam a 5 V.'
          },
          {
            title: '74HC165: paralelo para serial',
            body: 'O 74HC165 é um registrador de deslocamento "ao contrário" do 74HC595: ele captura 8 entradas em paralelo (D0 a D7) e as entrega uma a uma, em série, no pino de saída Q7. Os pinos que importam: PL (pino 1, "parallel load", ativo em nível BAIXO), CP (pino 2, clock), Q7 (pino 9, saída serial de dados) e CE (pino 15, clock enable, ligado ao GND para habilitar o clock). VCC (16) em 5 V e GND (8) em GND. Entradas não usadas ou botões precisam de resistor de pull-down (ou pull-up) para não ficarem flutuando.'
          },
          {
            title: 'O pulso de load e o shiftIn',
            body: 'Para ler: (1) um pulso em PL, indo a LOW e voltando a HIGH, congela o estado das 8 entradas dentro do chip; (2) em seguida os bits são puxados com shiftIn(pinoDados, pinoClock, ordemBits), que pulsa o clock 8 vezes e devolve um byte. Sem o pulso de load o chip entregaria bits desatualizados. Com botões ligados com pull-down (botão fecha para 5 V), bit 1 significa botão apertado. A correspondência exata entre bit e botão depende da ligação; teste apertando um botão de cada vez e anote qual bit muda.',
            code: 'const int LOAD = 8, CLOCK = 9, DADOS = 10;\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(LOAD, OUTPUT);\n  pinMode(CLOCK, OUTPUT);\n  pinMode(DADOS, INPUT);\n  digitalWrite(LOAD, HIGH);\n}\n\nbyte lerBotoes() {\n  digitalWrite(LOAD, LOW);     // captura as 8 entradas\n  delayMicroseconds(5);\n  digitalWrite(LOAD, HIGH);\n  return shiftIn(DADOS, CLOCK, MSBFIRST);\n}\n\nvoid loop() {\n  Serial.println(lerBotoes(), BIN);\n  delay(100);\n}'
          },
          {
            title: 'Encadeando vários 74HC165',
            body: 'Para 16, 24 ou mais entradas, ligue a saída Q7 do primeiro chip à entrada serial DS (pino 10) do segundo, e assim por diante, compartilhando PL e CP entre todos os chips. Quem fica ligado ao Arduino é o Q7 do ÚLTIMO chip da cadeia. Cada shiftIn lê 8 bits; para 2 chips chamamos shiftIn duas vezes depois de um único pulso de load. O primeiro byte lido pertence ao chip mais próximo do Arduino na cadeia. Total de pinos do Arduino: continua 3.',
            code: 'byte b1, b2;\n\ndigitalWrite(LOAD, LOW);\ndelayMicroseconds(5);\ndigitalWrite(LOAD, HIGH);\nb1 = shiftIn(DADOS, CLOCK, MSBFIRST);  // 8 primeiras entradas\nb2 = shiftIn(DADOS, CLOCK, MSBFIRST);  // 8 seguintes'
          },
          {
            title: 'CD4051: um multiplexador analógico de 8 canais',
            body: 'O CD4051 funciona como uma chave seletora de 8 posições: 8 canais (CH0 a CH7) e um terminal comum Z (pino 3). O canal ligado ao comum é escolhido por 3 pinos de seleção, S0, S1 e S2 (os pinos A, B e C do chip), e 3 bits formam 8 combinações (2 elevado a 3). O pino INH (inibição, pino 6) em GND deixa o chip ativo. Para uso a 5 V ligue VDD (16) em 5 V, VSS (8) em GND e VEE (7) também em GND. Ligue Z a uma entrada analógica (por exemplo A0): o Arduino enxerga, ao mesmo tempo, apenas o canal selecionado. Um único ADC lê 8 sensores, um de cada vez.'
          },
          {
            title: 'Selecionando o canal e lendo',
            body: 'Para escolher o canal, escrevemos os bits do número do canal nos pinos de seleção: S0 recebe o bit 0 (canal & 1), S1 recebe o bit 1 ((canal >> 1) & 1) e S2 recebe o bit 2 ((canal >> 2) & 1). Por exemplo, o canal 5 é 101 em binário: S0 = 1, S1 = 0, S2 = 1. Depois de trocar de canal a tensão em Z precisa de um tempinho para se acomodar (o capacitor de amostragem do ADC se carrega pela resistência da chave): espere algumas dezenas de microssegundos antes de analogRead e, se precisar de leitura mais precisa, descarte a primeira leitura. Respeite também o limite de tensão: os sinais dos canais devem ficar entre GND e 5 V (a faixa entre VEE e VDD), pois valores fora disso podem danificar o chip.',
            code: 'const int S0 = 2, S1 = 3, S2 = 4;\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(S0, OUTPUT);\n  pinMode(S1, OUTPUT);\n  pinMode(S2, OUTPUT);\n}\n\nint lerCanal(int canal) {\n  digitalWrite(S0, canal & 1);\n  digitalWrite(S1, (canal >> 1) & 1);\n  digitalWrite(S2, (canal >> 2) & 1);\n  delayMicroseconds(50);        // tempo de acomodação\n  return analogRead(A0);       // Z ligado em A0\n}\n\nvoid loop() {\n  for (int c = 0; c < 8; c++) {\n    Serial.print(lerCanal(c));\n    Serial.print(c < 7 ? " " : "\\n");\n  }\n  delay(200);\n}'
          },
          {
            title: 'Digital versus analógico: qual usar',
            body: 'O 74HC165 é para sinais DIGITAIS (botões, chaves, sensores de fim de curso): captura as 8 entradas no mesmo instante e as entrega depois. O CD4051 é para sinais ANALÓGICOS (potenciômetros, LDR, termistores): lê um canal por vez, sem leitura simultânea, e cada leitura ganha o custo da acomodação. Pinos usados: o 165 gasta 3 pinos digitais para 8 entradas; o 4051 gasta 3 pinos digitais de seleção mais 1 entrada analógica para 8 sensores. O 4051 também aceita sinais digitais, mas o 165 é a escolha mais simples e rápida para botões. Prefira sensores de baixa impedância no 4051, porque a chave tem resistência própria que afeta fontes muito fracas.'
          }
        ]
      },
      questions: [
        mcq('q1', 'Qual componente permite ler 8 potenciômetros usando um único pino analógico do Arduino?', 'c', [
          'O 74HC595',
          'O 74HC165',
          'O multiplexador analógico CD4051',
          'Um resistor de pull-up'
        ], 'O CD4051 seleciona um dos 8 canais analógicos e o liga ao comum Z, lido em uma entrada analógica.'),
        mcq('q2', 'Qual é a função do pulso em LOW no pino PL (load) do 74HC165?', 'a', [
          'Capturar o estado das 8 entradas paralelas dentro do chip, para depois serem lidas em série',
          'Ligar a alimentação do chip',
          'Escolher o canal analógico',
          'Zerar o contador de millis()'
        ], 'O load congela as entradas D0 a D7; os clocks seguintes as entregam em Q7.'),
        mcq('q3', 'Quantos pinos do Arduino são necessários para ler 8 botões com um 74HC165?', 'd', [
          '8',
          '1',
          '2',
          '3 (dados, clock e load)'
        ], 'Dados (Q7), clock (CP) e load (PL) bastam, independentemente do número de botões em cascata.'),
        fill('q4', 'Complete a função do Arduino que lê 8 bits em série do pino de dados:', 'byte botoes = ___(DADOS, CLOCK, MSBFIRST);', ['shiftIn'], 'shiftIn(dados, clock, ordem) pulsa o clock 8 vezes e devolve um byte.'),
        mcq('q5', 'Como ler 16 entradas com dois 74HC165 encadeados (Q7 do primeiro ligado em DS do segundo)?', 'b', [
          'Usando 16 pinos de dados',
          'Compartilhando load e clock, com um pulso de load e duas chamadas de shiftIn',
          'Trocando o Arduino por outro modelo',
          'Ligando todos os Q7 juntos no mesmo pino'
        ], 'A cadeia é uma única fila serial de 16 bits: um load, dois shiftIn de 8 bits.'),
        mcq('q6', 'No CD4051, para selecionar o canal 5 (binário 101), quais níveis vão para S0, S1 e S2?', 'a', [
          'S0 = 1, S1 = 0, S2 = 1',
          'S0 = 0, S1 = 1, S2 = 1',
          'S0 = 1, S1 = 1, S2 = 0',
          'S0 = 0, S1 = 0, S2 = 1'
        ], 'S0 é o bit menos significativo: 5 = 101 dá S2 = 1, S1 = 0, S0 = 1.'),
        mcq('q7', 'Por que esperar um pequeno tempo entre trocar o canal do CD4051 e chamar analogRead?', 'c', [
          'Para o Arduino não confundir o canal com um botão',
          'Porque o analogRead só funciona uma vez por segundo',
          'Para a tensão em Z se acomodar depois da troca de canal, evitando leitura contaminada pelo canal anterior',
          'Para economizar energia da fonte'
        ], 'Depois da troca, o capacitor de amostragem do ADC precisa se ajustar ao novo sinal.'),
        fill('q8', 'Complete o deslocamento que extrai o bit 2 do número do canal para o pino S2:', 'digitalWrite(S2, (canal >> ___) & 1);', ['2'], 'Deslocar o canal 2 posições para a direita e mascarar com 1 isola o bit 2.')
      ]
    },
    {
      id: 'ari-23-neopixel',
      title: 'LEDs endereçáveis: WS2812 / NeoPixel',
      goal: 'Controlar fitas e anéis de LEDs RGB com um único pino, dimensionando fonte e memória.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'O LED com cérebro',
            body: 'O WS2812 (vendido pela Adafruit como NeoPixel) é um LED RGB com um minúsculo circuito controlador dentro do mesmo encapsulamento. Cada LED tem quatro conexões: 5 V, GND, DIN (entrada de dados) e DOUT (saída de dados). Recebe 24 bits de cor (8 para vermelho, 8 para verde, 8 para azul: 256 níveis cada, cerca de 16 milhões de cores) e os memoriza até chegar a próxima atualização. Existem em fitas, anéis, matrizes e módulos individuais.'
          },
          {
            title: 'Um fio só, em cadeia',
            body: 'O Arduino liga um único pino de dados ao DIN do primeiro LED; o DOUT do primeiro vai ao DIN do segundo, e assim por diante. Funciona assim: o Arduino envia uma sequência com 24 bits para cada LED; o primeiro LED pega os 24 primeiros bits para si e repassa o restante pelo DOUT, o segundo faz o mesmo... Com um pino se controlam dezenas ou centenas de LEDs, cada um com cor independente. O sinal é muito rápido (cerca de 800 kHz) e exige tempo exato: por isso a biblioteca desliga as interrupções durante o envio.'
          },
          {
            title: 'Biblioteca Adafruit_NeoPixel',
            body: 'Instale Adafruit NeoPixel pelo Library Manager. O objeto é criado com o número de LEDs, o pino de dados e dois sinalizadores: NEO_GRB (ordem das cores) + NEO_KHZ800 (velocidade do protocolo). begin() inicia; setPixelColor(indice, cor) define a cor de um LED (índices começam em 0) mas só altera a memória; show() envia as cores para a fita; strip.Color(r, g, b) monta a cor (cada valor 0 a 255); clear() apaga tudo na memória (e precisa de show() para valer); setBrightness(0 a 255) reduz o brilho global.',
            code: '#include <Adafruit_NeoPixel.h>\n\n#define PINO 6\n#define N 8\n\nAdafruit_NeoPixel strip(N, PINO, NEO_GRB + NEO_KHZ800);\n\nvoid setup() {\n  strip.begin();\n  strip.setBrightness(50);   // ~20 %: mais seguro e confortavel\n  strip.clear();\n  strip.show();\n}\n\nvoid loop() {\n  strip.setPixelColor(0, strip.Color(255, 0, 0));  // 1o LED vermelho\n  strip.setPixelColor(1, strip.Color(0, 255, 0));  // 2o LED verde\n  strip.show();\n}'
          },
          {
            title: 'Ordem de cores: GRB',
            body: 'Os chips WS2812 recebem os bytes na ordem Verde, Vermelho, Azul (GRB), e não RGB. A flag NEO_GRB diz à biblioteca para reordenar, assim Color(255, 0, 0) realmente sai vermelho. Algumas fitas e LEDs de outros fabricantes usam outra ordem (por exemplo NEO_RGB). Se você pedir vermelho e a fita mostrar verde, o problema é a flag de ordem: troque-a. Chame setBrightness() uma vez no setup(), pois ele reduz as cores de forma irreversível a cada uso.'
          },
          {
            title: 'Consumo e fonte externa',
            body: 'Cada LED RGB pode puxar cerca de 20 mA por cor, ou ~60 mA com as três cores no máximo (branco total). Conta: N LEDs x 60 mA. Para 30 LEDs: 30 x 60 mA = 1800 mA = 1,8 A; para 60 LEDs, 3,6 A. O pino 5V do Arduino alimentado por USB (limite em torno de 500 mA) NÃO aguenta isso: seria queda de tensão, reinícios ou dano. Use uma fonte externa de 5 V com corrente suficiente (e com margem), alimente a fita direto nela e ligue o GND da fonte ao GND do Arduino (GND comum). Reduzir o brilho com setBrightness reduz o consumo, e raramente todos os LEDs ficam em branco total, mas dimensione pelo pior caso.'
          },
          {
            title: 'Boas práticas de ligação',
            body: 'Três cuidados clássicos: (1) um capacitor eletrolítico de cerca de 1000 µF (tensão de 6,3 V ou mais) entre 5 V e GND na entrada da fita, para absorver o pico de corrente quando a fonte é ligada (respeite a polaridade!); (2) um resistor de 300 a 500 Ω em série na linha de dados, perto do primeiro LED, para proteger a entrada contra picos e ruído; (3) GND comum entre fonte e Arduino, e de preferência conectar o GND antes do +5 V. Também alimente a fita ANTES ou JUNTO com o sinal; enviar dados a uma fita sem alimentação pode danificar o primeiro LED.'
          },
          {
            title: 'Memória e efeitos sem travar',
            body: 'A biblioteca guarda a cor de cada LED na SRAM: 3 bytes por LED (um por cor). 60 LEDs usam 180 bytes; 300 LEDs usam 900 bytes (quase metade dos 2 KB do Uno). Para efeitos, não use delay longo: a fita e o resto do programa ficariam travados. Use o padrão da lição de millis: a cada intervalo, atualize a posição e chame show(). O exemplo move um ponto azul (chase); o segundo trecho espalha o arco-íris por uma "roda de cores", função que converte um número de 0 a 255 em uma cor que passa por vermelho, verde e azul.',
            code: 'unsigned long ultimo = 0;\nint pos = 0;\n\nvoid chase() {\n  if (millis() - ultimo >= 80) {\n    ultimo = millis();\n    strip.clear();\n    strip.setPixelColor(pos, strip.Color(0, 0, 150));\n    strip.show();\n    pos = (pos + 1) % N;\n  }\n}\n\nuint32_t roda(byte p) {\n  p = 255 - p;\n  if (p < 85) return strip.Color(255 - p * 3, 0, p * 3);\n  if (p < 170) { p -= 85; return strip.Color(0, p * 3, 255 - p * 3); }\n  p -= 170;\n  return strip.Color(p * 3, 255 - p * 3, 0);\n}\n\n// arco-iris: strip.setPixelColor(i, roda((i * 256 / N + deslocamento) & 255));'
          }
        ]
      },
      questions: [
        mcq('q1', 'Como se liga uma cadeia de LEDs WS2812 ao Arduino?', 'b', [
          'Cada LED em um pino diferente do Arduino',
          'Um pino de dados no DIN do primeiro LED, e o DOUT de cada LED no DIN do seguinte',
          'Todos os DIN em paralelo no mesmo fio',
          'O DOUT do Arduino diretamente no 5 V da fita'
        ], 'Cada LED pega os 24 primeiros bits e repassa o resto pelo DOUT ao próximo.'),
        mcq('q2', 'Qual conjunto de boas práticas é recomendado para uma fita de muitos LEDs?', 'c', [
          'Alimentar pelo pino 3,3 V do Arduino e sem GND comum',
          'Ligar o pino de dados direto, sem resistor, e ignorar o consumo',
          'Fonte externa de 5 V, GND comum, capacitor de ~1000 µF na alimentação e resistor de 300 a 500 Ω na linha de dados',
          'Usar o USB do computador como fonte, para qualquer número de LEDs'
        ], 'Fonte dimensionada, GND comum, capacitor contra o pico de partida e resistor de proteção no sinal.'),
        mcq('q3', 'Qual é o consumo máximo aproximado de 30 LEDs WS2812 todos em branco total (60 mA cada)?', 'd', [
          '30 mA',
          '180 mA',
          '0,6 A',
          '1,8 A'
        ], '30 x 60 mA = 1800 mA = 1,8 A, bem acima do que o USB ou o pino 5V do Uno aguentam.'),
        fill('q4', 'Complete o método que envia as cores guardadas na memória para a fita:', 'strip.setPixelColor(0, strip.Color(255, 0, 0));\nstrip.___();', ['show', 'show()'], 'setPixelColor só altera a memória; show() transmite as cores aos LEDs.'),
        mcq('q5', 'Quanta SRAM a biblioteca precisa para 100 LEDs (3 bytes por LED)?', 'a', [
          '300 bytes',
          '100 bytes',
          '3 bytes',
          '1024 bytes'
        ], '100 LEDs x 3 bytes = 300 bytes, mais de 14 % dos 2 KB do Uno.'),
        mcq('q6', 'Você pediu strip.Color(255, 0, 0) (vermelho), mas a fita acendeu verde. O que deve ser revisado?', 'b', [
          'O tamanho do capacitor',
          'A flag de ordem das cores (NEO_GRB, NEO_RGB...) no construtor',
          'O número de LEDs da cadeia',
          'A taxa de baud da Serial'
        ], 'Fitas diferentes esperam as cores em ordens diferentes; a flag de ordem corrige a troca.'),
        mcq('q7', 'Para animar um efeito (chase) sem travar o resto do programa, o que é mais indicado?', 'c', [
          'delay(2000) entre cada passo',
          'Um while(true) interno que nunca sai',
          'Controlar o intervalo com millis() e chamar show() só quando for hora de atualizar',
          'Chamar setBrightness() em toda volta do loop'
        ], 'delay longo bloqueia tudo; millis() permite animar e ainda ler botões e sensores.'),
        fill('q8', 'Complete o método que define a cor do LED de índice 0:', 'strip.___(0, strip.Color(0, 0, 255));\nstrip.show();', ['setPixelColor'], 'setPixelColor(indice, cor) define a cor de um LED; os índices começam em 0.')
      ]
    },
    {
      id: 'ari-17-entradas-avancadas',
      title: 'Teclado matricial, joystick e encoder',
      goal: 'Ler teclados, joysticks, encoders e potenciômetros como interface com o usuário.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Teclado matricial 4x4',
            body: 'Um teclado de 16 teclas não usa 16 pinos: as teclas são ligadas em uma matriz de 4 linhas e 4 colunas, gastando só 8 pinos. O Arduino varre a matriz: coloca uma linha em LOW por vez e vê qual coluna foi para LOW — o cruzamento revela a tecla. A biblioteca Keypad (de Mark Stanley e Alexander Brevig, via Library Manager) cuida de tudo isso.'
          },
          {
            title: 'Keypad.h na prática',
            body: 'Define-se um vetor 2D com os caracteres de cada tecla, os pinos das linhas e das colunas, e cria-se o objeto Keypad com makeKeymap. keypad.getKey() devolve o caractere da tecla pressionada, ou NO_KEY (valor 0) se nada foi pressionado — chame a cada volta do loop e teste antes de usar.',
            code: '#include <Keypad.h>\n\nconst byte LINHAS = 4, COLUNAS = 4;\nchar teclas[LINHAS][COLUNAS] = {\n  {\'1\',\'2\',\'3\',\'A\'},\n  {\'4\',\'5\',\'6\',\'B\'},\n  {\'7\',\'8\',\'9\',\'C\'},\n  {\'*\',\'0\',\'#\',\'D\'}\n};\nbyte pinosLinhas[LINHAS]   = {9, 8, 7, 6};\nbyte pinosColunas[COLUNAS] = {5, 4, 3, 2};\n\nKeypad teclado = Keypad(makeKeymap(teclas), pinosLinhas, pinosColunas, LINHAS, COLUNAS);\n\nvoid loop() {\n  char t = teclado.getKey();\n  if (t != NO_KEY) {\n    Serial.println(t);\n  }\n}'
          },
          {
            title: 'Joystick analógico',
            body: 'O módulo de joystick é formado por dois potenciômetros (um para o eixo X, outro para o Y) e um botão no eixo. As saídas VRx e VRy vão a entradas analógicas e variam de 0 a 1023, com o centro em aproximadamente 512 quando solto. O botão (SW) é digital, e com INPUT_PULLUP lê LOW quando pressionado. Como o centro nunca é exato, use uma zona morta (por exemplo, ignorar valores entre 462 e 562) para evitar movimentos fantasmas.',
            code: 'int x = analogRead(A0);\nint y = analogRead(A1);\nbool botao = (digitalRead(2) == LOW);\nif (x < 462) { /* esquerda */ }\nelse if (x > 562) { /* direita */ }'
          },
          {
            title: 'Encoder rotativo: contando giros',
            body: 'O encoder rotativo (como o KY-040) gira infinitamente e gera dois sinais em quadratura: CLK e DT, que mudam em instantes ligeiramente deslocados. O SENTIDO é descoberto comparando os dois: quando CLK muda, o valor de DT em relação a CLK diz se foi horário ou anti-horário. Ele tem também um botão (SW) ao apertar o eixo. Se o sentido sair invertido, basta trocar o sinal da conta (ou trocar CLK com DT).',
            code: 'const int CLK = 2, DT = 3;\nint posicao = 0;\nint clkAnterior;\n\nvoid setup() {\n  pinMode(CLK, INPUT);\n  pinMode(DT, INPUT);\n  clkAnterior = digitalRead(CLK);\n}\n\nvoid loop() {\n  int clk = digitalRead(CLK);\n  if (clk != clkAnterior && clk == LOW) {   // borda de descida\n    if (digitalRead(DT) != clk) posicao++;  // um sentido\n    else posicao--;                         // o outro\n  }\n  clkAnterior = clk;\n}'
          },
          {
            title: 'Potenciômetro como seletor de menu',
            body: 'Um potenciômetro (ou slide) pode escolher entre N opções: converte-se a leitura de 0 a 1023 em um índice de 0 a N-1. Usar map(leitura, 0, 1024, 0, N) (com 1024 no limite superior) garante que o valor máximo 1023 resulte em N-1 e nunca em N. É uma interface simples para escolher modos, velocidades ou ajustes.',
            code: 'int opcao = map(analogRead(A0), 0, 1024, 0, 4);  // 0, 1, 2 ou 3\nswitch (opcao) {\n  case 0: /* modo A */ break;\n  case 1: /* modo B */ break;\n  case 2: /* modo C */ break;\n  case 3: /* modo D */ break;\n}'
          }
        ]
      },
      questions: [
        mcq('q1', 'Quantos pinos do Arduino um teclado matricial 4x4 (16 teclas) consome?', 'b', [
          '16',
          '8',
          '4',
          '2'
        ], '4 linhas + 4 colunas = 8 pinos, com varredura da matriz.'),
        mcq('q2', 'O que keypad.getKey() devolve quando nenhuma tecla está pressionada?', 'c', [
          'O caractere \'0\'',
          'Uma string vazia',
          'NO_KEY',
          'O último caractere pressionado'
        ], 'NO_KEY (valor 0) indica que não há tecla; sempre teste antes de usar o valor.'),
        mcq('q3', 'Em repouso, qual é aproximadamente a leitura de analogRead em cada eixo de um joystick analógico?', 'a', [
          'Cerca de 512 (centro)',
          '0',
          '1023',
          '255'
        ], 'Os potenciômetros ficam no meio do curso: perto de 512 em escala de 0 a 1023.'),
        fill('q4', 'Complete a constante que indica "nenhuma tecla" na biblioteca Keypad:', 'char t = teclado.getKey();\nif (t != ___) {\n  Serial.println(t);\n}', ['NO_KEY'], 'NO_KEY é o valor retornado quando não há tecla pressionada.'),
        mcq('q5', 'Por que usar uma zona morta (dead zone) no joystick?', 'd', [
          'Para economizar energia',
          'Para aumentar a velocidade',
          'Para trocar os eixos X e Y',
          'Porque o centro nunca é exato e pequenas variações causariam movimentos indesejados'
        ], 'Ignorar uma faixa em torno de 512 evita ruído e deriva do potenciômetro.'),
        mcq('q6', 'Como um encoder rotativo permite descobrir o sentido do giro?', 'b', [
          'Pela tensão de alimentação',
          'Comparando os sinais CLK e DT, que mudam defasados um do outro',
          'Contando o tempo desde o início do sketch',
          'Pelo botão SW'
        ], 'O estado de DT no momento em que CLK muda indica se foi horário ou anti-horário.'),
        mcq('q7', 'Para escolher entre 4 opções (0 a 3) com um potenciômetro, qual expressão evita que 1023 resulte em 4?', 'c', [
          'map(leitura, 0, 1023, 0, 4)',
          'leitura / 4',
          'map(leitura, 0, 1024, 0, 4)',
          'constrain(leitura, 0, 4)'
        ], 'Com limite superior 1024, o valor máximo 1023 cai na opção 3 e nunca em 4.'),
        fill('q8', 'Complete o modo de pino que mantém o botão do joystick em HIGH quando solto, lendo LOW ao pressionar:', 'pinMode(2, ___);', ['INPUT_PULLUP'], 'INPUT_PULLUP usa o resistor interno de pull-up.')
      ]
    },
    {
      id: 'ari-24-ir-remoto',
      title: 'Controle remoto infravermelho',
      goal: 'Receber e interpretar botões de um controle remoto IR com um receptor VS1838 e a biblioteca IRremote.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Luz que não se vê',
            body: 'Um controle remoto de TV tem na ponta um LED infravermelho (IR, comprimento de onda em torno de 940 nm): emite luz invisível ao olho humano. O controle "fala" piscando esse LED em um padrão de pulsos curtos e longos que formam um código. O problema: o sol, lâmpadas e até o seu corpo também emitem IR, então o receptor precisa distinguir o sinal do controle de todo esse ruído de fundo.'
          },
          {
            title: 'Portadora de 38 kHz e o receptor',
            body: 'A solução é a modulação: durante os pulsos de "marca" o LED não fica simplesmente aceso; ele pisca muito rápido, cerca de 38 000 vezes por segundo (38 kHz, a portadora). Receptores como o VS1838 (ou o TSOP) têm um filtro sintonizado nessa frequência e um demodulador: eles ignoram luz constante e entregam na saída um sinal digital limpo. A saída fica em HIGH em repouso e vai a LOW enquanto detecta a marca. O receptor tem 3 pinos: sinal (OUT), GND e VCC (alimentação de 5 V ou 3,3 V). A ordem dos pinos varia entre módulos, então confira a serigrafia ou o datasheet antes de ligar.'
          },
          {
            title: 'O protocolo NEC em visão geral',
            body: 'Existem muitos protocolos de controle remoto; o NEC é um dos mais usados. O quadro NEC começa com um pulso de início longo (cerca de 9 ms de marca e 4,5 ms de espaço), seguido de 32 bits: 8 bits de endereço (identifica o aparelho ou família do controle), o mesmo endereço invertido (para conferir erros), 8 bits de comando (identifica a TECLA apertada) e o comando invertido. Cada bit é uma marca curta seguida de um espaço de duração diferente para 0 e 1. Existe também o NEC estendido, com endereço de 16 bits. Na prática você só precisa do endereço e do comando que a biblioteca decodifica.'
          },
          {
            title: 'IRremote: recebendo códigos',
            body: 'Instale IRremote (Armin Joachimsmeyer et al., versão 4.x) pelo Library Manager. Passos: IrReceiver.begin(pino) inicia o receptor no pino do sinal; IrReceiver.decode() devolve true quando chegou e foi decodificado um quadro; os dados ficam em IrReceiver.decodedIRData (por exemplo .command, o código da tecla); IrReceiver.resume() libera o receptor para escutar o próximo quadro. Sem o resume() ele não recebe mais nada. O valor de cada tecla depende do seu controle: o jeito é imprimir e anotar.',
            code: '#include <IRremote.hpp>\n\nconst int PINO_IR = 2;\n\nvoid setup() {\n  Serial.begin(9600);\n  IrReceiver.begin(PINO_IR);\n}\n\nvoid loop() {\n  if (IrReceiver.decode()) {\n    Serial.print(F("Comando: 0x"));\n    Serial.println(IrReceiver.decodedIRData.command, HEX);\n    IrReceiver.resume();   // pronto para o proximo\n  }\n}'
          },
          {
            title: 'Mapeando botões para ações',
            body: 'Depois de anotar o comando de cada tecla, use um switch para ligar tecla e ação. Os valores abaixo são só ilustrativos: o seu controle terá outros. Atenção à repetição: ao SEGURAR uma tecla, o controle NEC não reenvia o quadro completo; ele manda um quadro curto de repetição a cada ~110 ms, e a biblioteca avisa isso por uma flag em decodedIRData.flags (IRDATA_FLAGS_IS_REPEAT). Para ações do tipo "alternar" (ligar/desligar), ignore as repetições; para volume ou brilho, aceite-as para o valor ir variando enquanto a tecla é segurada.',
            code: 'if (IrReceiver.decode()) {\n  switch (IrReceiver.decodedIRData.command) {\n    case 0x45:  // tecla "liga" (exemplo)\n      digitalWrite(8, !digitalRead(8));\n      break;\n    case 0x46:  // outra tecla (exemplo)\n      digitalWrite(9, !digitalRead(9));\n      break;\n  }\n  IrReceiver.resume();\n}'
          },
          {
            title: 'Conflitos de timer',
            body: 'Para medir a duração dos pulsos com precisão, a IRremote usa um timer de hardware do ATmega328P (no Uno, por padrão o Timer2). Isso tem preço: o mesmo timer não pode servir a outras funções ao mesmo tempo. No Uno, o Timer2 também gera o tone() e o PWM (analogWrite) dos pinos 3 e 11, então usar a IRremote junto com tone() ou com PWM nesses pinos causa conflito, e o som ou o PWM deixam de funcionar bem. Lembre da lição de bibliotecas: sempre descubra quais timers e pinos cada biblioteca usa antes de combiná-las (a Servo, por exemplo, usa o Timer1).'
          },
          {
            title: 'Enviar IR e testar com a câmera',
            body: 'Também é possível ENVIAR códigos: um LED IR (com resistor de cerca de 220 Ω em série, porque o pino aguenta poucos mA) pisca na portadora de 38 kHz e a biblioteca gera tudo com IrSender.begin(pino) e IrSender.sendNEC(endereco, comando, repeticoes). Para um alcance maior se usa um transistor, como na lição de motor DC. Dica de teste: a luz IR é invisível a olho nu, mas a câmera de muitos celulares a enxerga como uma luz roxa ou esbranquiçada. Aponte o controle (ou seu LED IR) para a câmera e aperte um botão: se piscar na tela, o LED emissor está funcionando.'
          }
        ]
      },
      questions: [
        mcq('q1', 'Por que o sinal IR do controle é modulado em uma portadora de cerca de 38 kHz?', 'c', [
          'Para o LED consumir mais corrente',
          'Para o sinal ser visível ao olho humano',
          'Para o receptor distinguir o sinal do controle do IR constante do ambiente (sol, lâmpadas)',
          'Porque o Arduino só lê sinais de 38 kHz'
        ], 'O receptor tem filtro nessa frequência e ignora luz constante.'),
        mcq('q2', 'Quais são os 3 pinos de um receptor IR como o VS1838?', 'a', [
          'Sinal (OUT), GND e VCC',
          'SDA, SCL e GND',
          'MOSI, MISO e SCK',
          'TX, RX e VCC'
        ], 'O receptor entrega um sinal digital em OUT e precisa de alimentação e GND.'),
        mcq('q3', 'No protocolo NEC, o que representam o endereço e o comando?', 'd', [
          'O endereço é a tensão e o comando é a corrente',
          'O endereço é o pino do Arduino e o comando é o baud rate',
          'Ambos identificam a tecla, e um deles é descartado',
          'O endereço identifica o aparelho ou família do controle e o comando identifica a tecla apertada'
        ], 'O comando é o código da tecla; o endereço evita que um controle acione o aparelho errado.'),
        fill('q4', 'Complete o método que inicia o receptor IR no pino do sinal:', 'IrReceiver.___(PINO_IR);', ['begin', 'begin()'], 'IrReceiver.begin(pino) inicia a recepção no pino indicado.'),
        mcq('q5', 'Para que serve IrReceiver.resume() depois de tratar um código?', 'b', [
          'Para reiniciar o Arduino',
          'Para liberar o receptor e deixá-lo pronto para decodificar o próximo quadro',
          'Para enviar o código de volta ao controle',
          'Para trocar o protocolo NEC por outro'
        ], 'Sem resume() o receptor fica parado e não recebe novos códigos.'),
        mcq('q6', 'O que acontece quando o usuário segura uma tecla de um controle NEC?', 'a', [
          'O controle envia quadros curtos de repetição, que a biblioteca sinaliza com uma flag; o programa decide se os usa',
          'O controle envia o quadro completo uma única vez e fica em silêncio',
          'O receptor desliga sozinho',
          'O Arduino reinicia'
        ], 'Segurar a tecla gera repetições; ignore-as em ações de alternar e aceite-as em volume ou brilho.'),
        mcq('q7', 'Por que usar a IRremote junto com tone() pode dar problema no Uno?', 'b', [
          'Porque o tone() só funciona com 3,3 V',
          'Porque ambos usam o mesmo timer de hardware (Timer2)',
          'Porque o receptor IR gera o som sozinho',
          'Porque o tone() desliga a portadora de 38 kHz do controle'
        ], 'A recepção ocupa o Timer2, o mesmo usado por tone() e PWM nos pinos 3 e 11.'),
        fill('q8', 'Complete o método que devolve true quando um quadro IR foi recebido e decodificado:', 'if (IrReceiver.___()) {\n  // tratar o codigo\n  IrReceiver.resume();\n}', ['decode', 'decode()'], 'IrReceiver.decode() informa quando há um novo código disponível em decodedIRData.')
      ]
    },
    {
      id: 'ari-28-softwareserial-gps',
      title: 'SoftwareSerial e módulo GPS',
      goal: 'Criar uma porta serial extra por software e ler a posição de um GPS NEO-6M com TinyGPS++, respeitando a privacidade.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'O Uno só tem uma UART',
            body: 'A UART é o circuito de hardware que faz a comunicação serial. O Uno tem apenas uma, ligada aos pinos 0 (RX) e 1 (TX), e esses mesmos pinos vão ao chip USB: é por ela que a placa conversa com o computador (upload e Serial Monitor). Ligar um módulo nos pinos 0 e 1 atrapalha o upload e disputa a porta com o Serial Monitor. Para um segundo dispositivo serial (como um GPS) precisamos de outra porta. Lembre da regra de cruzamento: o TX de um lado vai no RX do outro, e o RX no TX, com GND comum.'
          },
          {
            title: 'SoftwareSerial: UART feita por software',
            body: 'A biblioteca SoftwareSerial, que já vem na IDE, emula uma porta serial em quaisquer pinos digitais, mexendo nos pinos "na mão". O objeto é criado com SoftwareSerial nome(rx, tx), ou seja, primeiro o pino de recepção e depois o de transmissão; begin(velocidade) inicia; available() e read() leem; print() e println() enviam, como na Serial. O código abaixo repassa o que chega da porta de software para o Serial Monitor.',
            code: '#include <SoftwareSerial.h>\n\nSoftwareSerial gpsSerial(4, 3);   // rx = 4, tx = 3\n\nvoid setup() {\n  Serial.begin(9600);\n  gpsSerial.begin(9600);\n}\n\nvoid loop() {\n  while (gpsSerial.available()) {\n    Serial.write(gpsSerial.read());\n  }\n}'
          },
          {
            title: 'Limitações da SoftwareSerial',
            body: 'Por ser feita por software, ela tem limites: (1) velocidades altas ficam instáveis (acima de uns 57600 baud, e principalmente 115200, perdem-se bytes); (2) só UMA porta de software pode estar escutando por vez (com várias, use listen() para escolher qual); (3) o recebimento depende de interrupções de mudança de pino (PCINT) no pino RX, e enquanto ela trata cada byte as outras interrupções ficam atrasadas, o que pode conflitar com outras bibliotecas e afetar o millis(); (4) o buffer de recepção tem só 64 bytes: se o loop demorar (por exemplo, por delay longo) e não ler a tempo, os bytes se perdem. Por isso: leia sem parar e evite delays longos.'
          },
          {
            title: 'O módulo GPS NEO-6M',
            body: 'O NEO-6M é um receptor GPS que se comunica por UART, a 9600 baud por padrão, enviando texto sem parar, em geral uma vez por segundo. Pinos: VCC (a maioria dos módulos aceita de 3,3 a 5 V, confira o seu), GND, TX e RX. Ligue o TX do módulo ao pino RX do Arduino (o pino 4 no nosso exemplo). Como o Arduino só precisa ouvir, o RX do módulo pode ficar desligado. O GPS precisa de céu aberto: a antena cerâmica deve ficar voltada para cima e longe de obstáculos. Na primeira ligação (partida a frio) a obtenção da primeira posição (o "fix") leva de dezenas de segundos a vários minutos; em ambientes fechados pode nem ocorrer. Muitos módulos têm um LED que pisca quando há fix.'
          },
          {
            title: 'Sentenças NMEA',
            body: 'O GPS transmite sentenças NMEA, linhas de texto ASCII que começam com $, trazem os campos separados por vírgula e terminam com * seguido de um checksum de 2 dígitos hexadecimais (o XOR de todos os caracteres entre o $ e o *), para o receptor detectar erros. O início indica o tipo: $GPGGA traz hora, posição, qualidade do fix, número de satélites e altitude; $GPRMC traz hora, data, posição, velocidade (em nós) e rumo. A latitude vem no formato ddmm.mmmm e a longitude em dddmm.mmmm, com N/S e E/W. Exemplo ilustrativo (coordenadas fictícias, checksum omitido): $GPGGA,123519,0000.000,N,00000.000,E,1,08,0.9,10.0,M,0.0,M,,*hh. Você raramente interpreta isso à mão: usa uma biblioteca.'
          },
          {
            title: 'TinyGPS++',
            body: 'A TinyGPS++ (Mikal Hart) decodifica as sentenças. Você alimenta o objeto, caractere por caractere, com gps.encode(c) (devolve true quando uma sentença completa foi processada) e depois consulta: gps.location.isValid() diz se a localização tem fix válido; gps.location.lat() e gps.location.lng() devolvem graus decimais; gps.satellites.value() o número de satélites; gps.speed.kmph() a velocidade em km/h. Alimente continuamente a cada volta do loop e imprima só de tempos em tempos (com millis), sem delay.',
            code: '#include <SoftwareSerial.h>\n#include <TinyGPS++.h>\n\nSoftwareSerial gpsSerial(4, 3);\nTinyGPSPlus gps;\nunsigned long ultimo = 0;\n\nvoid setup() {\n  Serial.begin(9600);\n  gpsSerial.begin(9600);\n}\n\nvoid loop() {\n  while (gpsSerial.available()) {\n    gps.encode(gpsSerial.read());\n  }\n  if (millis() - ultimo >= 2000) {\n    ultimo = millis();\n    if (gps.location.isValid()) {\n      Serial.print(F("Sats: "));\n      Serial.println(gps.satellites.value());\n      Serial.println(gps.speed.kmph());\n    } else {\n      Serial.println(F("Sem fix ainda..."));\n    }\n  }\n}'
          },
          {
            title: 'Privacidade: localização é dado pessoal',
            body: 'Posição atrelada a uma pessoa (o GPS que ela carrega, o veículo que ela dirige) é dado pessoal e de alto risco: revela casa, trabalho, rotina e hábitos. A LGPD não a lista como dado "sensível" no sentido formal, mas o dano de um vazamento pode ser grave, então trate-a com cuidado redobrado. Boas práticas: coletar só o necessário e com finalidade clara; rastrear alguém exige ciência e consentimento da pessoa, e rastrear sem ela saber é abusivo; reduzir a precisão quando possível (cada grau de latitude vale cerca de 111 km: arredondar a 2 casas decimais dá uns 1 km de imprecisão e 3 casas, uns 110 m) e reduzir a frequência dos registros; não guardar nem transmitir sem proteção (cartão SD aberto, envio sem criptografia, repositório público); e definir quando apagar. Nos exemplos e testes use sempre coordenadas genéricas ou fictícias, nunca posições reais de pessoas.'
          }
        ]
      },
      questions: [
        mcq('q1', 'Por que usamos SoftwareSerial para ligar um GPS ao Uno?', 'b', [
          'Porque o GPS só funciona em 3,3 V',
          'Porque o Uno tem só uma UART de hardware (pinos 0 e 1), compartilhada com o USB',
          'Porque a SoftwareSerial é mais rápida que a Serial',
          'Porque o GPS não usa comunicação serial'
        ], 'A única UART do Uno serve ao USB; a SoftwareSerial cria portas extras em outros pinos.'),
        mcq('q2', 'Como ligar os pinos de comunicação entre o módulo GPS e o Arduino?', 'c', [
          'TX do módulo no TX do Arduino',
          'RX do módulo no RX do Arduino',
          'TX do módulo no pino de RX usado pela SoftwareSerial (cruzando TX e RX), com GND comum',
          'Os dois no 5 V'
        ], 'O TX de quem fala vai ao RX de quem escuta; o GPS fala e o Arduino escuta.'),
        mcq('q3', 'Qual destas é uma limitação da SoftwareSerial?', 'a', [
          'Velocidades altas ficam instáveis e só uma porta de software escuta por vez',
          'Só funciona nos pinos 0 e 1',
          'Não consegue receber dados, só enviar',
          'Precisa de um cristal externo'
        ], 'Taxas altas perdem bytes, e com várias portas só uma escuta por vez (listen).'),
        fill('q4', 'Complete o método que inicia a porta de software a 9600 baud:', 'SoftwareSerial gpsSerial(4, 3);\n\nvoid setup() {\n  gpsSerial.___(9600);\n}', ['begin', 'begin()'], 'begin(velocidade) inicia a porta, igual à Serial.'),
        mcq('q5', 'Como é uma sentença NMEA enviada pelo módulo GPS?', 'd', [
          'Um pulso de 1 a 2 ms',
          'Um número binário de 16 bits',
          'Um comando AT em maiúsculas',
          'Uma linha de texto ASCII iniciada por $, com campos separados por vírgula e um checksum depois do *'
        ], 'NMEA é texto: $GPGGA,...,*hh, com campos por vírgula e checksum para detectar erros.'),
        mcq('q6', 'Você ligou o GPS dentro de casa e o programa só mostra "Sem fix ainda...". Qual é a causa mais provável?', 'c', [
          'A biblioteca TinyGPS++ está com defeito',
          'O módulo precisa de 12 V',
          'O módulo ainda não obteve fix: falta céu aberto e/ou a partida a frio leva tempo',
          'O baud da Serial precisa ser 115200'
        ], 'O GPS precisa de visada para os satélites; ao ar livre, o primeiro fix leva de dezenas de segundos a minutos.'),
        mcq('q7', 'Qual prática protege a privacidade de uma pessoa cujo GPS é rastreado?', 'b', [
          'Gravar a posição com 6 casas decimais a cada segundo, por precaução',
          'Ter ciência e consentimento da pessoa, coletar só o necessário, reduzir a precisão quando possível e proteger o armazenamento',
          'Publicar o trajeto em um repositório aberto para backup',
          'Rastrear sem avisar, pois é só um número'
        ], 'Localização ligada a uma pessoa é dado pessoal de alto risco: finalidade, consentimento, minimização e segurança.'),
        fill('q8', 'Complete o método que lê um caractere da porta de software para alimentar o decodificador:', 'while (gpsSerial.available()) {\n  gps.encode(gpsSerial.___());\n}', ['read', 'read()'], 'read() devolve o próximo caractere recebido, que o gps.encode() processa.')
      ]
    },
    {
      id: 'ari-18-rele-alimentacao',
      title: 'Relé, cargas maiores e alimentação',
      goal: 'Acionar cargas maiores com segurança e alimentar o projeto corretamente.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Aviso de segurança sobre a rede elétrica',
            body: 'A tomada (110/220 V) pode causar choque fatal, queimaduras e incêndio. Este curso NÃO ensina a ligar projetos à tomada e você não deve fazer isso sem formação e supervisão de um profissional qualificado. Para estudar e testar, use apenas baixa tensão (pilhas, fontes de 5 V a 12 V). Nunca mexa na fiação com algo energizado, e use sempre produtos certificados (fontes e tomadas inteligentes homologadas) em vez de montagens improvisadas na rede. Todo o resto desta lição trata de conceitos.'
          },
          {
            title: 'O relé: chave comandada',
            body: 'Um relé é um interruptor acionado por uma bobina. Pela bobina passa uma corrente de comando; quando energizada, ela move um contato mecânico. Tem três terminais de contato: COM (comum), NA ou NO (normalmente aberto: aberto sem energia na bobina, fecha quando acionado) e NC (normalmente fechado: fechado sem energia, abre quando acionado). O circuito da carga fica separado do circuito de comando, o que permite chavear tensões e correntes diferentes das do Arduino.'
          },
          {
            title: 'Módulo de relé e isolação',
            body: 'O módulo pronto traz o relé, um transistor (a bobina exige mais corrente que o pino fornece), um diodo de roda livre e frequentemente um optoacoplador, que isola eletricamente o lado do Arduino do lado da bobina por meio de luz. Isso ajuda a proteger a placa. Muitos módulos são de lógica invertida: acionam com nível LOW no pino IN. Confira o seu módulo antes de usar.',
            code: 'const int PINO_RELE = 7;\n\nvoid setup() {\n  pinMode(PINO_RELE, OUTPUT);\n  digitalWrite(PINO_RELE, HIGH); // modulo ativo em LOW: comeca desligado\n}\n\nvoid loop() {\n  digitalWrite(PINO_RELE, LOW);  // aciona\n  delay(2000);\n  digitalWrite(PINO_RELE, HIGH); // solta\n  delay(2000);\n}'
          },
          {
            title: 'Cargas indutivas e limites dos contatos',
            body: 'Cargas indutivas (motores, solenoides, transformadores, bobinas) geram faíscas ao serem desligadas, e isso desgasta os contatos do relé muito mais do que uma carga resistiva (lâmpada incandescente, resistência). O relé tem limites de tensão e corrente impressos na carcaça: nunca ultrapasse; e para cargas indutivas, reduza bastante a margem de uso. Cargas com proteção (diodo de roda livre em DC) duram mais.'
          },
          {
            title: 'MOSFET ou transistor para cargas DC',
            body: 'Para cargas de corrente contínua, como fitas de LED de 12 V, bombas e motores, é melhor um MOSFET de nível lógico (que liga plenamente com 5 V no gate, por exemplo IRLZ44N) ou um transistor de potência: sem partes mecânicas, rápido e compatível com PWM (analogWrite). Use um resistor de 100 a 220 Ω entre o pino e o gate e um resistor de 10 kΩ do gate ao GND para manter o MOSFET desligado enquanto o pino estiver flutuando (por exemplo, no boot). Com carga indutiva, use diodo de roda livre. GND da fonte da carga comum com o GND do Arduino.'
          },
          {
            title: 'Alimentação do Arduino e limites de corrente',
            body: 'Pela USB o Uno recebe 5 V e pode contar com cerca de 500 mA no total (porta USB 2.0 padrão). Pelo conector P4/jack ou pino VIN, entra tensão maior (recomendado de 7 a 12 V) que passa pelo regulador linear da placa: ele converte o excesso em calor, e a potência dissipada é (Vin - 5) × corrente. Com 12 V e 300 mA, são (12 - 5) × 0,3 = 2,1 W — quente demais. Por isso, motores, servos, fitas de LED e outras cargas pesadas devem ter fonte externa própria, com GND comum com o Arduino. Cada pino de saída suporta no máximo 40 mA (absoluto; use 20 mA), e o total de todos os pinos é de cerca de 200 mA. Nunca aplique tensão acima de 5 V no pino 5V nem em um pino de I/O.'
          }
        ]
      },
      questions: [
        mcq('q1', 'Qual a postura correta deste curso em relação a ligar projetos de Arduino à tomada (110/220 V)?', 'c', [
          'Fazer a ligação com fita isolante, pois é simples',
          'Ligar sempre com a rede energizada para testar',
          'Não fazer sem formação e supervisão profissional; estudar com baixa tensão',
          'Usar fios finos de protoboard'
        ], 'A rede pode causar choque fatal e incêndio; estudo e testes devem ser em baixa tensão.'),
        mcq('q2', 'O que significa o terminal NA (ou NO) de um relé?', 'a', [
          'Normalmente aberto: fica aberto sem energia na bobina e fecha ao acionar',
          'Normalmente aterrado',
          'Negativo da alimentação',
          'Normalmente ativo'
        ], 'NO/NA = normally open. NC = normalmente fechado. COM é o comum.'),
        mcq('q3', 'Qual a função do optoacoplador em muitos módulos de relé?', 'd', [
          'Aumentar a corrente do pino do Arduino',
          'Medir a temperatura',
          'Gerar o PWM',
          'Isolar eletricamente o lado do Arduino do lado da bobina, usando luz'
        ], 'A isolação óptica protege a placa contra retornos e ruídos do lado de potência.'),
        fill('q4', 'Complete o nível lógico que aciona um módulo de relé de lógica invertida (ativo em LOW):', 'digitalWrite(PINO_RELE, ___);   // aciona o rele', ['LOW', '0'], 'Em módulos ativos em LOW, o relé liga quando o pino IN vai a nível baixo.'),
        mcq('q5', 'Por que cargas indutivas desgastam mais os contatos do relé?', 'b', [
          'Porque sempre consomem mais de 10 A',
          'Porque geram faíscas e picos de tensão ao serem desligadas',
          'Porque só funcionam em corrente alternada',
          'Porque o relé aquece pelo GND'
        ], 'A energia magnética armazenada gera arco nos contatos ao interromper a corrente.'),
        mcq('q6', 'Qual componente é uma boa escolha para chavear uma fita de LED de 12 V com PWM?', 'c', [
          'Um relé eletromecânico, para dimerizar',
          'Um resistor de 10 kΩ',
          'Um MOSFET de nível lógico (com resistores e GND comum)',
          'Um diodo 1N4007 sozinho'
        ], 'O MOSFET é rápido, sem desgaste mecânico e aceita PWM, ao contrário do relé.'),
        mcq('q7', 'Um Uno é alimentado por 12 V no jack e consome 300 mA. Qual é a potência aproximada dissipada no regulador linear da placa?', 'b', [
          '0,3 W',
          '2,1 W',
          '12 W',
          '3,6 W'
        ], '(12 V − 5 V) × 0,3 A = 2,1 W, dissipados como calor.'),
        fill('q8', 'Complete o valor, em mA, do limite absoluto de corrente por pino de I/O do ATmega328P (use 20 mA como valor recomendado):', 'Limite absoluto por pino: ___ mA', ['40'], 'O máximo absoluto é 40 mA por pino; o uso recomendado é cerca de 20 mA.')
      ]
    }
  ]
};
