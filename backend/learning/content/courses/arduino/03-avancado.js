// Módulo "Avançado" do curso de Arduino — 22 lições, 8 questões cada (3 múltipla escolha + 1 lacuna,
// duas vezes por lição). Ver ../../index.js para o formato e a validação de boot. Código C/C++ real
// de AVR (ATmega328P / Arduino Uno) nos exemplos, mesmo padrão de ./01-iniciante.js e
// ./02-intermediario.js (assumidos como já conhecidos: eletricidade, setup/loop, Serial, PWM,
// millis, interrupções básicas, I2C/SPI, EEPROM, etc.).
// Ordem pedagógica: arquitetura, bits, portas, memória, timers, PWM, interrupções, ADC, UART,
// FSM, classes, C++ embarcado, escalonamento/RTOS, baixo consumo, watchdog, plataformas,
// conectividade, segurança/LGPD em IoT, alimentação/proteção, protótipo→produto, depuração e
// projeto integrador. Duas lições do currículo-base foram divididas em duas para caber no padrão
// de 5–7 slides: programação orientada a objetos (ara-11 e ara-12) e conectividade sem fio
// (ara-17 conectividade, ara-18 segurança e privacidade — LGPD, segredos fora do Git, TLS, OTA).
// Todo exemplo evita dados pessoais; credenciais ficam sempre em secrets.h fora do versionamento.
module.exports = {
  id: 'avancado-arduino',
  levelKey: 'advanced',
  order: 3,
  title: 'Avançado',
  subtitle: 'Registradores, timers, interrupções, memória, baixo consumo, RTOS, IoT seguro e do protótipo ao produto',
  accent: '#00979d',
  lessons: [
    {
      id: 'ara-01-arquitetura',
      title: 'Arquitetura do ATmega328P e do sketch ao binário',
      goal: 'Entender como o microcontrolador do Uno é organizado por dentro e o caminho que seu sketch percorre até virar um .hex gravado na Flash.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O chip por trás do Uno',
            body: 'O cérebro do Arduino Uno é o ATmega328P: um microcontrolador AVR de 8 bits, arquitetura RISC, rodando a 16 MHz. Num único chip ficam a CPU, as memórias e os periféricos (timers, ADC, UART, SPI, I2C). Dominar o nível profissional de firmware é entender esse chip, não só as funções do Arduino.'
          },
          {
            title: 'Arquitetura Harvard e as três memórias',
            body: 'O AVR segue a arquitetura Harvard: o programa e os dados ficam em memórias separadas, com barramentos próprios (a CPU busca a próxima instrução ao mesmo tempo em que acessa um dado). São três memórias: Flash de 32 KB (guarda o programa, não volátil), SRAM de 2 KB (variáveis em execução, volátil — perde tudo sem energia) e EEPROM de 1 KB (dados que sobrevivem ao desligamento, como configurações).',
            code: '// Resumo do ATmega328P\n// Flash  : 32 KB  -> programa (não volátil)\n// SRAM   :  2 KB  -> variáveis, pilha, heap (volátil)\n// EEPROM :  1 KB  -> dados persistentes'
          },
          {
            title: 'Bootloader: parte da Flash já é ocupada',
            body: 'No Uno, os últimos 0,5 KB da Flash guardam o bootloader (Optiboot), um pequeno programa que recebe seu sketch pela porta serial. Por isso sobram cerca de 31,5 KB para o seu código. A EEPROM e a SRAM não são tocadas por ele.'
          },
          {
            title: 'Clock, ciclos e registradores',
            body: 'A 16 MHz, cada ciclo de clock dura 1/16 000 000 s = 62,5 ns, e a maioria das instruções AVR leva 1 ciclo (cerca de 16 milhões de instruções por segundo). Dentro da CPU há 32 registradores de uso geral (R0 a R31) onde as contas acontecem. Separados deles, os registradores de I/O são endereços especiais que controlam os periféricos: escrever em DDRB, PORTB ou TCCR1B liga, desliga e configura o hardware bit a bit.',
            code: '// Escrever num registrador de I/O configura o hardware:\nDDRB = 0b00100000;   // bit 5 = 1 -> PB5 (pino 13) vira saída\nPORTB = 0b00100000;  // PB5 em nível alto (LED aceso)'
          },
          {
            title: 'Do sketch ao .hex',
            body: 'O que a IDE faz ao compilar: (1) o .ino é pré-processado e vira um arquivo C++ (adiciona #include <Arduino.h> e protótipos de função); (2) o compilador avr-gcc / avr-g++ gera código objeto para o AVR; (3) o linker junta seu código ao core do Arduino, produzindo um .elf; (4) a ferramenta avr-objcopy converte o .elf em um arquivo .hex (formato texto com os bytes que irão para a Flash).'
          },
          {
            title: 'Upload: bootloader e avrdude',
            body: 'Ao resetar o Uno, o bootloader roda primeiro e espera por uns instantes um novo programa. A IDE usa a ferramenta avrdude para enviar o .hex pela serial USB (o reset automático vem do sinal DTR do conversor USB). Se nada chega, o bootloader salta para o seu sketch. Gravar sem bootloader também é possível via ICSP, assunto de uma lição futura.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que caracteriza a arquitetura Harvard do AVR?',
          choices: [
            { id: 'a', text: 'Todo o código roda diretamente na EEPROM' },
            { id: 'b', text: 'A CPU tem 32 bits e executa uma instrução por segundo' },
            { id: 'c', text: 'Programa e dados ficam em memórias separadas, com barramentos próprios' },
            { id: 'd', text: 'Programa e dados compartilham a mesma memória e o mesmo barramento' }
          ],
          answer: 'c',
          explanation: 'Na Harvard, a busca de instruções (Flash) e o acesso a dados (SRAM) usam caminhos distintos.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual memória do ATmega328P tem 2 KB, é volátil e guarda variáveis, pilha e heap?',
          choices: [
            { id: 'a', text: 'SRAM' },
            { id: 'b', text: 'Flash' },
            { id: 'c', text: 'EEPROM' },
            { id: 'd', text: 'Registradores de I/O' }
          ],
          answer: 'a',
          explanation: 'A SRAM (2 KB) guarda os dados em execução e perde o conteúdo sem energia.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual é a duração de um ciclo de clock a 16 MHz?',
          choices: [
            { id: 'a', text: '6,25 ns' },
            { id: 'b', text: '625 ns' },
            { id: 'c', text: '16 µs' },
            { id: 'd', text: '62,5 ns' }
          ],
          answer: 'd',
          explanation: '1 / 16 000 000 s = 62,5 ns. Com a maioria das instruções em 1 ciclo, são ~16 milhões por segundo.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete: a memória volátil do ATmega328P, de 2 KB, onde ficam as variáveis em execução, é a ___.',
          code: '// Flash  -> programa\n// ___    -> variáveis, pilha e heap (2 KB, volátil)\n// EEPROM -> dados persistentes',
          accept: ['SRAM', 'sram', 'RAM'],
          explanation: 'A SRAM guarda as variáveis em execução.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Aproximadamente quanta Flash sobra para o seu sketch no Uno com bootloader Optiboot?',
          choices: [
            { id: 'a', text: 'Cerca de 2 KB, o resto é da EEPROM' },
            { id: 'b', text: 'Cerca de 31,5 KB (os 0,5 KB finais são do bootloader)' },
            { id: 'c', text: 'Os 32 KB inteiros, o bootloader fica na SRAM' },
            { id: 'd', text: 'Cerca de 16 KB, o bootloader usa metade' }
          ],
          answer: 'b',
          explanation: 'O Optiboot ocupa 0,5 KB no fim da Flash; o restante (~31,5 KB) é do seu programa.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que são os registradores de I/O, como DDRB e TCCR1B?',
          choices: [
            { id: 'a', text: 'Variáveis da biblioteca Arduino criadas apenas na IDE' },
            { id: 'b', text: 'Endereços especiais cujos bits configuram e controlam os periféricos do chip' },
            { id: 'c', text: 'Os 32 registradores de uso geral onde a CPU faz as contas' },
            { id: 'd', text: 'Posições da Flash onde o bootloader guarda o sketch' }
          ],
          answer: 'b',
          explanation: 'Escrever em registradores de I/O controla o hardware diretamente; os de uso geral (R0 a R31) são outra coisa.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual ferramenta converte o arquivo .elf no .hex que será gravado na Flash?',
          choices: [
            { id: 'a', text: 'avrdude' },
            { id: 'b', text: 'O próprio bootloader, durante o upload' },
            { id: 'c', text: 'O pré-processador, ao ler o .ino' },
            { id: 'd', text: 'avr-objcopy' }
          ],
          answer: 'd',
          explanation: 'avr-objcopy gera o .hex a partir do .elf; o avrdude só transmite o .hex ao chip.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete: a ferramenta que a IDE usa para enviar o .hex ao microcontrolador chama-se ___.',
          code: '// compilar: avr-gcc / avr-g++  ->  .elf  ->  .hex\n// enviar o .hex ao chip:  ___',
          accept: ['avrdude', 'AVRDUDE'],
          explanation: 'O avrdude conversa com o bootloader (ou com um programador) e grava o .hex na Flash.'
        }
      ]
    },
    {
      id: 'ara-02-bits',
      title: 'Operações bit a bit e máscaras',
      goal: 'Manipular bits individuais com &, |, ^, ~, << e >>, e usar máscaras para setar, limpar, alternar e testar bits.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Por que bits importam',
            body: 'Cada registrador do AVR tem 8 bits, e cada bit liga ou desliga uma função. Para mudar um bit sem estragar os outros, usamos operadores bit a bit, que trabalham em cada posição de bit separadamente. Não confunda com os lógicos: & é bit a bit, && é lógico (verdadeiro/falso).'
          },
          {
            title: 'AND, OR, XOR e NOT',
            body: '& (AND): o bit resultante é 1 só se os dois forem 1. | (OR): é 1 se pelo menos um for 1. ^ (XOR): é 1 se os bits forem diferentes. ~ (NOT): inverte todos os bits. Em 8 bits, ~0b00001111 vira 0b11110000.',
            code: '// 0b1100 e 0b1010, bit a bit:\n// 0b1100 & 0b1010 = 0b1000\n// 0b1100 | 0b1010 = 0b1110\n// 0b1100 ^ 0b1010 = 0b0110\nuint8_t x = 0b00001111;\nuint8_t y = ~x;   // 0b11110000'
          },
          {
            title: 'Deslocamentos << e >>',
            body: 'x << n desloca os bits n posições para a esquerda (entrando zeros à direita), o que equivale a multiplicar por 2 elevado a n. x >> n desloca para a direita (divisão inteira por 2 elevado a n). A expressão (1 << n) cria um número com apenas o bit n em 1 — a base das máscaras. Atenção: em AVR um int tem 16 bits, então 1 << 15 já estoura o sinal e 1 << 16 não funciona; para 32 bits use 1UL << n.',
            code: '1 << 0   // 0b00000001\n1 << 3   // 0b00001000 (= 8)\n1 << 7   // 0b10000000\n0b00010000 >> 4   // 0b00000001'
          },
          {
            title: 'As quatro operações com máscara',
            body: 'Setar bit n (virar 1): reg |= (1 << n). Limpar bit n (virar 0): reg &= ~(1 << n). Alternar bit n: reg ^= (1 << n). Testar bit n: if (reg & (1 << n)) — o resultado é diferente de zero se o bit estiver em 1. Cada máscara mexe só no bit escolhido e preserva o resto.',
            code: 'uint8_t r = 0b10110010;\nr |= (1 << 2);    // seta bit 2   -> 0b10110110\nr &= ~(1 << 4);   // limpa bit 4  -> 0b10100110\nr ^= (1 << 7);    // alterna bit 7\nif (r & (1 << 1)) { /* bit 1 está em 1 */ }'
          },
          {
            title: 'Atalhos do Arduino: bitSet, bitRead e _BV',
            body: 'O Arduino traz macros prontas: bitSet(x, n) seta, bitClear(x, n) limpa, bitRead(x, n) devolve 0 ou 1 e bitWrite(x, n, valor) escreve 0 ou 1 no bit. A macro _BV(n) (de avr/io.h) é exatamente (1 << n), e é muito usada com os nomes de bits dos registradores, como _BV(PB5). Máscaras de vários bits combinam com |: _BV(CS12) | _BV(CS10).',
            code: 'bitSet(PORTB, 5);          // = PORTB |= (1 << 5)\nbitClear(PORTB, 5);        // = PORTB &= ~(1 << 5)\nint b = bitRead(PORTB, 5); // 0 ou 1\nbitWrite(PORTB, 5, 1);\nPORTB ^= _BV(PB5);         // alterna o bit 5'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Quanto vale 0b1100 & 0b1010?',
          choices: [
            { id: 'a', text: '0b1000' },
            { id: 'b', text: '0b1110' },
            { id: 'c', text: '0b0110' },
            { id: 'd', text: '0b0010' }
          ],
          answer: 'a',
          explanation: 'AND só dá 1 onde os dois bits são 1: apenas o bit 3 (1000).'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Quanto vale 0b1100 ^ 0b1010?',
          choices: [
            { id: 'a', text: '0b1000' },
            { id: 'b', text: '0b0100' },
            { id: 'c', text: '0b0110' },
            { id: 'd', text: '0b1110' }
          ],
          answer: 'c',
          explanation: 'XOR dá 1 onde os bits diferem: bits 2 e 1, resultando em 0110.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual expressão LIMPA o bit 4 de r sem alterar os demais?',
          choices: [
            { id: 'a', text: 'r ^= (1 << 4);' },
            { id: 'b', text: 'r &= (1 << 4);' },
            { id: 'c', text: 'r &= ~(1 << 4);' },
            { id: 'd', text: 'r |= (1 << 4);' }
          ],
          answer: 'c',
          explanation: '~(1 << 4) tem todos os bits em 1, menos o 4; o AND zera só esse bit.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o operador composto que ALTERNA o bit 5 de PORTB:',
          code: 'PORTB ___ (1 << 5);',
          accept: ['^='],
          explanation: 'XOR com a máscara inverte apenas o bit escolhido a cada execução.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Se uint8_t r = 0b10110010, qual é o valor de r depois de r &= ~(1 << 4);?',
          choices: [
            { id: 'a', text: '0b10100010' },
            { id: 'b', text: '0b10110010' },
            { id: 'c', text: '0b10010010' },
            { id: 'd', text: '0b00000010' }
          ],
          answer: 'a',
          explanation: 'O bit 4 de 10110010 era 1 e foi zerado, restando 10100010.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que x << 3 faz com um número inteiro positivo pequeno x?',
          choices: [
            { id: 'a', text: 'Divide por 8' },
            { id: 'b', text: 'Soma 3 ao valor' },
            { id: 'c', text: 'Multiplica por 3' },
            { id: 'd', text: 'Multiplica por 8 (2 elevado a 3)' }
          ],
          answer: 'd',
          explanation: 'Cada deslocamento à esquerda dobra o valor: três deslocamentos multiplicam por 8.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'O que a macro _BV(n) representa?',
          choices: [
            { id: 'a', text: 'A inversão de todos os bits de n' },
            { id: 'b', text: '(1 << n), um valor com apenas o bit n em 1' },
            { id: 'c', text: 'O valor do bit n lido de um registrador' },
            { id: 'd', text: 'Um atraso de n microssegundos' }
          ],
          answer: 'b',
          explanation: '_BV(n) é só um atalho para (1 << n); bitRead é que lê o valor de um bit.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o operador composto que LIMPA o bit 2 de x:',
          code: 'x ___ ~(1 << 2);',
          accept: ['&='],
          explanation: 'AND com uma máscara que tem 0 só no bit 2 zera esse bit e preserva o resto.'
        }
      ]
    },
    {
      id: 'ara-03-portas',
      title: 'Manipulação direta de portas: DDRx, PORTx e PINx',
      goal: 'Controlar pinos escrevendo direto nos registradores de porta, entendendo o mapeamento para os pinos do Uno, a velocidade ganha e os riscos.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Os três registradores de cada porta',
            body: 'Cada porta (B, C, D) é controlada por três registradores de 8 bits: DDRx define a direção de cada pino (bit 1 = saída, bit 0 = entrada); PORTx define o nível de saída (ou, num pino de entrada, liga o pull-up interno quando em 1); PINx lê o nível atual dos pinos. Cada bit do registrador corresponde a um pino físico da porta.',
            code: 'DDRB  |= _BV(DDB5);   // PB5 como saída\nPORTB |= _BV(PORTB5); // PB5 em HIGH\nPORTB &= ~_BV(PORTB5);// PB5 em LOW\nif (PINB & _BV(PINB0)) { /* PB0 está em HIGH */ }'
          },
          {
            title: 'Mapeamento dos pinos do Uno',
            body: 'Pinos digitais 0 a 7 = PORTD (PD0 a PD7). Pinos digitais 8 a 13 = PORTB (PB0 a PB5). Pinos analógicos A0 a A5 = PORTC (PC0 a PC5). Assim, o pino 13 (LED da placa) é PB5, o pino 10 é PB2, o 5 é PD5 e o A3 é PC3. PB6 e PB7 estão ligados ao cristal, e por isso não aparecem no Uno.',
            code: '// pino 13 -> PB5   pino 8  -> PB0\n// pino 5  -> PD5   pino 0  -> PD0 (RX)\n// A0      -> PC0   A5       -> PC5'
          },
          {
            title: 'Pull-up e entrada por registrador',
            body: 'Para uma entrada com pull-up interno (como INPUT_PULLUP), deixe o bit em DDRx como 0 e escreva 1 no bit de PORTx. A leitura é feita em PINx. Com pull-up, o botão ligado ao GND lê 0 quando pressionado.',
            code: 'DDRD  &= ~_BV(DDD2);  // pino 2 como entrada\nPORTD |=  _BV(PORTD2);// liga o pull-up\nbool apertado = !(PIND & _BV(PIND2));'
          },
          {
            title: 'Por que usar: velocidade',
            body: 'digitalWrite() faz verificações (qual porta, qual timer de PWM desligar) e leva dezenas de ciclos. Escrever direto no registrador com bit constante vira uma única instrução sbi/cbi, de cerca de 2 ciclos (125 ns a 16 MHz) — muitas vezes mais rápido. Isso importa para protocolos temporizados e ISRs curtas.'
          },
          {
            title: 'Toggle via PINx',
            body: 'No ATmega328P, escrever 1 em um bit de PINx inverte o bit correspondente de PORTx, em uma única instrução. É a forma mais rápida de alternar um pino.',
            code: 'PINB = _BV(PINB5);  // alterna o pino 13 (LED)\n// equivale a PORTB ^= _BV(PORTB5), porém mais rápido'
          },
          {
            title: 'Riscos',
            body: 'Perde-se portabilidade (o código só vale para AVR) e legibilidade. Erros típicos: DDRD = 0xFF transforma TODA a porta D em saída, inclusive os pinos 0 e 1 (RX/TX do Serial) — prefira |= e &= para mexer só nos bits desejados. Outra: uma operação de ler-modificar-escrever em PORTx pode ser interrompida por uma ISR que mexe na mesma porta, corrompendo o valor.',
            code: 'DDRD = 0xFF;       // PERIGO: mata o Serial (pinos 0/1)\nDDRD |= _BV(DDD7); // ok: só o pino 7 vira saída'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual é o papel do registrador DDRx?',
          choices: [
            { id: 'a', text: 'Escolhe o prescaler do timer' },
            { id: 'b', text: 'Define a direção de cada pino (1 = saída, 0 = entrada)' },
            { id: 'c', text: 'Escreve o nível de saída dos pinos' },
            { id: 'd', text: 'Lê o nível atual dos pinos' }
          ],
          answer: 'b',
          explanation: 'DDR = Data Direction Register: 1 vira saída, 0 vira entrada.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'A qual porta e bit corresponde o pino digital 10 do Uno?',
          choices: [
            { id: 'a', text: 'PD2' },
            { id: 'b', text: 'PB5' },
            { id: 'c', text: 'PC0' },
            { id: 'd', text: 'PB2' }
          ],
          answer: 'd',
          explanation: 'Os pinos 8 a 13 são PB0 a PB5; assim o pino 10 é PB2.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Num pino configurado como ENTRADA (bit 0 em DDRx), o que escrever 1 no bit de PORTx faz?',
          choices: [
            { id: 'a', text: 'Liga o resistor de pull-up interno' },
            { id: 'b', text: 'Força o pino a nível alto como saída' },
            { id: 'c', text: 'Desativa o pino' },
            { id: 'd', text: 'Gera uma interrupção' }
          ],
          answer: 'a',
          explanation: 'Entrada + PORTx em 1 = pull-up interno ligado (equivale a INPUT_PULLUP).'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete com o registrador usado para LER o nível dos pinos da porta B:',
          code: 'if (___ & _BV(0)) {\n  // pino 8 (PB0) está em HIGH\n}',
          accept: ['PINB'],
          explanation: 'PINx lê os pinos; PINB é o registrador de leitura da porta B.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Qual linha alterna (toggle) o LED do pino 13 da forma mais rápida possível no ATmega328P?',
          choices: [
            { id: 'a', text: 'PORTB = ~PORTB;' },
            { id: 'b', text: 'digitalWrite(13, !digitalRead(13));' },
            { id: 'c', text: 'PINB = _BV(PINB5);' },
            { id: 'd', text: 'DDRB = _BV(DDB5);' }
          ],
          answer: 'c',
          explanation: 'Escrever 1 em PINx inverte o bit de PORTx numa só instrução. A opção c inverteria a porta toda.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual é o problema de executar DDRD = 0xFF; num sketch que usa Serial?',
          choices: [
            { id: 'a', text: 'Liga o pull-up de todos os pinos de entrada analógica' },
            { id: 'b', text: 'Nada, é a forma recomendada de configurar saídas' },
            { id: 'c', text: 'Transforma os pinos 0 e 1 (RX/TX) em saída, atrapalhando a comunicação serial' },
            { id: 'd', text: 'Apaga o programa da Flash' }
          ],
          answer: 'c',
          explanation: 'A atribuição direta sobrescreve todos os bits da porta D, incluindo PD0/PD1. Use |= para mexer só no que precisa.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que PORTB |= _BV(PB5) costuma ser bem mais rápido que digitalWrite(13, HIGH)?',
          choices: [
            { id: 'a', text: 'Vira uma única instrução (sbi) de poucos ciclos, sem as verificações do digitalWrite' },
            { id: 'b', text: 'Porque aumenta o clock do chip' },
            { id: 'c', text: 'Porque usa a EEPROM como cache' },
            { id: 'd', text: 'Porque desliga o Timer0 durante a escrita' }
          ],
          answer: 'a',
          explanation: 'digitalWrite precisa mapear o pino e checar o PWM; a escrita direta com bit constante é uma instrução de ~2 ciclos.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o bit do registrador DDRB que configura o pino 13 do Uno como saída (use o nome PB-número, ex.: PB0):',
          code: 'DDRB |= _BV(___);',
          accept: ['PB5', 'DDB5', '5'],
          explanation: 'O pino digital 13 é PB5; DDB5 e PB5 valem 5 nos headers do AVR.'
        }
      ]
    },
    {
      id: 'ara-28-binario-assembly',
      title: 'Do código ao binário: avr-gcc, assembly e mapa de memória',
      goal: 'Acompanhar o código C++ pelas etapas de compilação, ler o uso de Flash e SRAM com avr-size, espiar o assembly gerado e entender volatile e otimização.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'A cadeia de compilação em detalhe',
            body: 'Quatro etapas em ordem: (1) o pré-processador resolve #include e #define e remove comentários; (2) o compilador (avr-gcc/avr-g++) traduz C/C++ para assembly; (3) o montador (avr-as) converte o assembly em código objeto (.o); (4) o linker (avr-ld) junta os .o do seu sketch e do core do Arduino, resolve os endereços e gera o executável .elf, que ainda contém símbolos e informação de depuração. Por fim, o avr-objcopy extrai do .elf só os bytes do programa e produz o .hex (texto) ou o .bin, que é o que o avrdude grava na Flash.',
            code: 'avr-g++ -mmcu=atmega328p -DF_CPU=16000000UL -Os -c sketch.cpp -o sketch.o\navr-g++ -mmcu=atmega328p sketch.o -o sketch.elf\navr-objcopy -O ihex -R .eeprom sketch.elf sketch.hex'
          },
          {
            title: 'Seções do binário',
            body: 'O .elf organiza o programa em seções. .text: o código (instruções) e constantes guardadas na Flash. .data: variáveis globais/estáticas COM valor inicial diferente de zero (ex.: int x = 5;); o valor inicial fica na Flash e é copiado para a SRAM na inicialização. .bss: variáveis globais/estáticas sem valor inicial ou iguais a zero (ex.: int y;); ocupam só SRAM e são zeradas no início. .rodata: dados somente leitura; no AVR, porém, constantes comuns acabam copiadas para a SRAM, e por isso se usa PROGMEM para mantê-las apenas na Flash. Lembrete: a Flash guarda o programa; a SRAM guarda as variáveis em execução.'
          },
          {
            title: 'avr-size: quanto cabe',
            body: 'O comando avr-size mostra o tamanho de cada grupo de seções. Regras para lembrar: Flash usada = text + data (o valor inicial de .data também mora na Flash); SRAM usada = data + bss (sem contar pilha e heap, que crescem em execução). Exemplo: text = 3000, data = 200, bss = 500 → Flash = 3200 bytes (de ~31,5 KB no Uno) e SRAM estática = 700 bytes (de 2048). Para descobrir QUEM ocupa mais, ferramentas como avr-nm --size-sort -S sketch.elf listam os símbolos pelo tamanho.',
            code: '$ avr-size -C --mcu=atmega328p sketch.elf\n   text    data     bss     dec     hex filename\n   3000     200     500    3700     e74 sketch.elf\n// Flash = text + data = 3200 B\n// SRAM  = data + bss  =  700 B'
          },
          {
            title: 'avr-objdump: lendo o assembly gerado',
            body: 'O comando avr-objdump -d sketch.elf desmonta o binário e mostra, para cada endereço, os bytes e a instrução assembly correspondente (com -S e compilação com -g, intercala o código-fonte C). É assim que se verifica o que o compilador realmente fez. Assembly AVR: os 32 registradores r0–r31 guardam os valores com que a CPU opera. Instruções comuns: LDI (carrega um valor imediato em registrador r16–r31), MOV (copia entre registradores), ADD (soma), OUT (escreve num registrador de I/O) e SBI/CBI (liga/desliga um único bit de um registrador de I/O baixo). LDI, MOV, ADD e OUT levam 1 ciclo; no ATmega328P, SBI e CBI levam 2 ciclos.',
            code: '; PORTB = 0x20;  vira, por exemplo:\nldi r24, 0x20   ; r24 = 0x20        (1 ciclo)\nout 0x05, r24   ; PORTB = r24      (1 ciclo)'
          },
          {
            title: 'Por que PORTB |= (1<<5) é uma instrução só',
            body: 'Os registradores de I/O de endereço baixo (de 0 a 31 no espaço de I/O, como PORTB e PIND) permitem instruções que alteram um único bit sem ler-modificar-escrever em registrador de trabalho. Quando o endereço é constante e o bit é constante, o compilador transforma PORTB |= (1<<5) em uma única instrução SBI (e PORTB &= ~(1<<5) em CBI). Já digitalWrite() precisa descobrir porta e máscara em tempo de execução, consultando tabelas na Flash, e custa dezenas de ciclos. Essa diferença é a razão de acesso direto a registradores ser tão mais rápido.',
            code: 'PORTB |= (1<<5);    // sbi 0x05, 5   (2 ciclos no ATmega328P)\nPORTB &= ~(1<<5);   // cbi 0x05, 5   (2 ciclos)\n// digitalWrite(13, HIGH) -> dezenas de ciclos'
          },
          {
            title: 'Inline assembly e atrasos de 1 ciclo',
            body: 'Com asm volatile("nop"); o compilador insere exatamente uma instrução NOP, que não faz nada e dura 1 ciclo. A 16 MHz, 1 ciclo = 1 / 16 000 000 s = 62,5 ns; 16 NOPs = 1 µs. Serve para atrasos mínimos e muito precisos (por exemplo, temporização de protocolos por bit-banging). O volatile aqui impede o compilador de remover ou mover a instrução. Cuidado: assembly inline é difícil de manter, não é portável entre arquiteturas, e interrupções ou o próprio compilador podem alterar o tempo total; use só quando necessário e prefira timers.',
            code: '#define NOP __asm__ __volatile__("nop")\nNOP;   // 62,5 ns a 16 MHz\nNOP; NOP; NOP;   // +187,5 ns'
          },
          {
            title: 'volatile e níveis de otimização',
            body: 'Com otimização, o compilador pode guardar uma variável em registrador e NÃO relê-la da memória a cada uso, ou até remover laços que "não mudam nada". Se a variável é alterada por uma ISR ou por hardware, o laço while (!flag); pode virar um laço infinito, porque o compilador acha que flag nunca muda. A palavra volatile obriga a ler/escrever a memória em todo acesso. Níveis de otimização: -O0 (nenhuma, bom para depurar), -O2 (prioriza velocidade), -Os (prioriza tamanho; é o padrão do Arduino para AVR). Ao compilar com outro nível, tamanho e velocidade do binário mudam, e bugs de falta de volatile costumam aparecer só com otimização ligada.',
            code: 'volatile bool pronto = false;   // alterada na ISR\n\nISR(INT0_vect) { pronto = true; }\n\nvoid loop() {\n  while (!pronto) { }   // relê pronto a cada volta, por causa do volatile\n}'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual é a ordem correta das etapas até o .hex?',
          choices: [
            { id: 'a', text: 'Compilador → pré-processador → linker → montador → .hex' },
            { id: 'b', text: 'Linker → compilador → montador → pré-processador → .hex' },
            { id: 'c', text: 'Montador → pré-processador → compilador → linker → .hex' },
            { id: 'd', text: 'Pré-processador → compilador → montador → linker → .elf → avr-objcopy → .hex' }
          ],
          answer: 'd',
          explanation: 'O pré-processador resolve #include/#define, o compilador gera assembly, o montador gera .o, o linker gera o .elf e o avr-objcopy produz o .hex.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O avr-size informa text = 6000, data = 150 e bss = 350. Quanto o programa usa de Flash e de SRAM estática?',
          choices: [
            { id: 'a', text: 'Flash 6000 B e SRAM 500 B' },
            { id: 'b', text: 'Flash 6350 B e SRAM 150 B' },
            { id: 'c', text: 'Flash 6150 B e SRAM 500 B' },
            { id: 'd', text: 'Flash 6500 B e SRAM 350 B' }
          ],
          answer: 'c',
          explanation: 'Flash = text + data = 6000 + 150 = 6150; SRAM estática = data + bss = 150 + 350 = 500.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Em qual seção fica a variável global uint8_t contador; (sem valor inicial)?',
          choices: [
            { id: 'a', text: '.text, junto com o código' },
            { id: 'b', text: '.bss: ocupa SRAM e é zerada na inicialização' },
            { id: 'c', text: '.data, com o valor guardado na Flash' },
            { id: 'd', text: 'Na EEPROM, que guarda variáveis globais' }
          ],
          answer: 'b',
          explanation: 'Globais sem valor inicial (ou iguais a zero) vão para .bss. Já int x = 5; iria para .data.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o comando que desmonta o binário e mostra o assembly gerado:',
          code: 'avr-___ -d sketch.elf',
          accept: ['objdump'],
          explanation: 'avr-objdump -d desmonta o .elf, listando endereço, bytes e a instrução assembly.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Com endereço e bit constantes, em que o compilador transforma PORTB |= (1<<5) no ATmega328P?',
          choices: [
            { id: 'a', text: 'Em uma única instrução SBI, de 2 ciclos' },
            { id: 'b', text: 'Em uma chamada à função digitalWrite' },
            { id: 'c', text: 'Em um laço de 5 repetições com ADD' },
            { id: 'd', text: 'Em LDI + MOV + ADD, sempre 3 instruções' }
          ],
          answer: 'a',
          explanation: 'PORTB está no espaço de I/O baixo, então o compilador usa SBI para ligar o bit 5 numa só instrução (2 ciclos no ATmega328P). LDI/OUT/MOV/ADD levam 1 ciclo.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'A 16 MHz, quanto tempo duram 32 instruções NOP seguidas (1 ciclo cada)?',
          choices: [
            { id: 'a', text: '1 µs' },
            { id: 'b', text: '62,5 ns' },
            { id: 'c', text: '32 µs' },
            { id: 'd', text: '2 µs' }
          ],
          answer: 'd',
          explanation: '1 ciclo = 62,5 ns; 32 × 62,5 ns = 2000 ns = 2 µs.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Uma ISR altera a variável pronto e o loop faz while (!pronto); mas o laço nunca termina com -Os. Qual a causa provável e a correção?',
          choices: [
            { id: 'a', text: 'O -Os é incompatível com ISR; deve-se usar sempre -O0' },
            { id: 'b', text: 'A variável deve ser guardada na EEPROM' },
            { id: 'c', text: 'Falta volatile: o compilador manteve pronto num registrador e não relê a memória; declare volatile bool pronto' },
            { id: 'd', text: 'O linker colocou pronto em .text; basta mudar para .bss' }
          ],
          answer: 'c',
          explanation: 'Sem volatile, o compilador assume que pronto não muda dentro do laço. O volatile força uma leitura da memória em todo acesso.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a flag que pede ao avr-gcc para otimizar por TAMANHO (padrão do Arduino em AVR):',
          code: 'avr-g++ -mmcu=atmega328p -___ -c main.cpp',
          accept: ['Os', '-Os'],
          explanation: '-Os otimiza por tamanho; -O2 prioriza velocidade e -O0 desliga otimização.'
        }
      ]
    },
    {
      id: 'ara-04-memoria',
      title: 'Memória: Flash, SRAM, PROGMEM, pilha e heap',
      goal: 'Saber onde cada dado vive, economizar SRAM com PROGMEM e F(), e evitar estouro de pilha e fragmentação de heap.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'A SRAM de 2 KB é o recurso mais escasso',
            body: 'A Flash (32 KB) é grande, mas a SRAM (2 KB) é minúscula e guarda tudo o que está vivo em execução. Estourar a SRAM não gera erro de compilação claro: o programa começa a se comportar de forma estranha ou reinicia. Por isso o profissional controla cada byte de SRAM.'
          },
          {
            title: 'Como a SRAM é organizada',
            body: 'Do endereço mais baixo para o mais alto: variáveis globais/estáticas (.data e .bss), depois o heap (memória dinâmica, cresce para cima), uma área livre e, no topo, a pilha (stack), que cresce para baixo a partir do fim da SRAM (RAMEND, 0x08FF no ATmega328P). Variáveis locais, parâmetros e endereços de retorno de função vão para a pilha. Se heap e pilha se encontram, os dados são corrompidos.',
            code: '// SRAM (endereços baixos -> altos)\n// [ globais | heap ->  ...livre...  <- pilha ]\n//                                  RAMEND (0x08FF)'
          },
          {
            title: 'Estouro de pilha e fragmentação',
            body: 'Estouro de pilha (stack overflow) acontece com recursão profunda ou arrays locais grandes. Fragmentação do heap acontece quando malloc/free (ou o objeto String do Arduino, que usa o heap) alocam e liberam blocos de tamanhos variados: sobram buracos pequenos, e uma alocação pode falhar mesmo havendo RAM livre somada. Em AVR, evite alocação dinâmica em laços longos.'
          },
          {
            title: 'PROGMEM: dados constantes na Flash',
            body: 'Por padrão, mesmo um array const é copiado para a SRAM na inicialização (por causa da arquitetura Harvard, a CPU lê a Flash por instruções especiais). Para deixar o dado só na Flash, use PROGMEM e leia com as funções pgm_read_byte(), pgm_read_word(), pgm_read_float() ou strcpy_P(), passando o ENDEREÇO do elemento.',
            code: '#include <avr/pgmspace.h>\nconst uint8_t seno[] PROGMEM = {0, 25, 49, 71, 90};\n\nuint8_t v = pgm_read_byte(&seno[2]);   // 49'
          },
          {
            title: 'F(): textos na Flash',
            body: 'Todo texto entre aspas, como em Serial.println("Ola"), é guardado na SRAM. Envolver com a macro F() mantém o literal na Flash e Serial.print sabe lê-lo de lá. É o jeito mais barato de poupar centenas de bytes de SRAM em sketches com muitos textos de depuração.',
            code: 'Serial.println("Ola");        // texto ocupa SRAM\nSerial.println(F("Ola"));     // texto fica só na Flash'
          },
          {
            title: 'Medir a RAM livre e boas práticas',
            body: 'A função abaixo mede o espaço livre entre o heap e a pilha. Boas práticas: usar F() e PROGMEM, preferir char[] de tamanho fixo a String, usar tipos pequenos (uint8_t em vez de int quando cabe), não usar arrays locais grandes, evitar recursão e deixar a compilação alertar: a IDE informa quanto da SRAM é usada por globais, mas NÃO conta o que a pilha usará em execução, então deixe folga.',
            code: 'extern int __heap_start, *__brkval;\nint ramLivre() {\n  int v;\n  return (int)&v - (__brkval == 0 ? (int)&__heap_start : (int)__brkval);\n}'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Onde ficam as variáveis locais e os endereços de retorno das funções?',
          choices: [
            { id: 'a', text: 'No heap, alocadas por malloc' },
            { id: 'b', text: 'Na Flash' },
            { id: 'c', text: 'Na EEPROM' },
            { id: 'd', text: 'Na pilha (stack), no topo da SRAM' }
          ],
          answer: 'd',
          explanation: 'Variáveis locais vivem na pilha, que cresce do fim da SRAM para baixo.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual risco o objeto String do Arduino traz em um AVR de 2 KB de SRAM?',
          choices: [
            { id: 'a', text: 'Move a pilha para a Flash' },
            { id: 'b', text: 'Fragmenta o heap, podendo falhar alocações mesmo com RAM livre somada' },
            { id: 'c', text: 'Grava os textos na EEPROM e a desgasta' },
            { id: 'd', text: 'Reduz o clock da CPU' }
          ],
          answer: 'b',
          explanation: 'String aloca e libera blocos de tamanhos variados no heap, gerando fragmentação.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que ocorre com um array const SEM PROGMEM num AVR?',
          choices: [
            { id: 'a', text: 'Gera erro de compilação' },
            { id: 'b', text: 'Ele é copiado para a SRAM na inicialização, ocupando RAM além da Flash' },
            { id: 'c', text: 'Fica apenas na Flash, sem ocupar SRAM' },
            { id: 'd', text: 'É movido para a EEPROM' }
          ],
          answer: 'b',
          explanation: 'Sem PROGMEM, const não impede a cópia para a SRAM; é preciso PROGMEM para manter só na Flash.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a macro que mantém um texto literal apenas na Flash:',
          code: 'Serial.println(___("Sistema iniciado"));',
          accept: ['F'],
          explanation: 'F("...") guarda o literal na Flash, poupando SRAM.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Qual das opções descreve como a SRAM é organizada, do endereço baixo para o alto?',
          choices: [
            { id: 'a', text: 'Pilha, área livre, heap, globais' },
            { id: 'b', text: 'Heap, globais, pilha, Flash' },
            { id: 'c', text: 'Globais, pilha, heap, área livre' },
            { id: 'd', text: 'Globais, heap (cresce para cima), área livre, pilha (cresce para baixo)' }
          ],
          answer: 'd',
          explanation: 'O heap cresce para cima e a pilha para baixo: se se encontram, há corrupção de dados.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual é a forma correta de ler o 3º elemento (índice 2) de um array tabela[] PROGMEM de bytes?',
          choices: [
            { id: 'a', text: 'pgm_read_byte(&tabela[2])' },
            { id: 'b', text: 'tabela[2]' },
            { id: 'c', text: 'pgm_read_byte(tabela[2])' },
            { id: 'd', text: 'F(tabela[2])' }
          ],
          answer: 'a',
          explanation: 'As funções pgm_read_* recebem o endereço do elemento na Flash.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que o aviso da IDE sobre uso de SRAM após compilar não garante que o sketch cabe na memória?',
          choices: [
            { id: 'a', text: 'Ele inclui a EEPROM e superestima o uso' },
            { id: 'b', text: 'Porque o compilador não conhece o tamanho de variáveis globais' },
            { id: 'c', text: 'Ele conta só as globais; a pilha e o heap usados em execução ficam de fora' },
            { id: 'd', text: 'Ele conta a Flash em vez da SRAM' }
          ],
          answer: 'c',
          explanation: 'Pilha e heap só existem em execução, por isso é preciso deixar folga (e medir com ramLivre()).'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a função que lê um byte armazenado na Flash:',
          code: 'uint8_t v = ___(&seno[2]);',
          accept: ['pgm_read_byte'],
          explanation: 'pgm_read_byte lê um byte da Flash a partir do endereço dado.'
        }
      ]
    },
    {
      id: 'ara-25-ponto-fixo-otimizacao',
      title: 'Aritmética inteira, ponto fixo e otimização de código',
      goal: 'Fazer contas rápidas e corretas em um AVR sem FPU: evitar estouros de inteiro, usar ponto fixo e tabelas, e medir antes de otimizar.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'AVR não tem FPU: float custa caro',
            body: 'O ATmega328P só sabe fazer contas com inteiros. Todo float é emulado por rotinas de software da biblioteca do compilador: cada soma ou multiplicação vira dezenas a centenas de ciclos e a biblioteca de float ainda ocupa centenas de bytes de Flash (e o float só tem cerca de 7 dígitos úteis). Custos relativos, em ordem de grandeza: soma, subtração e deslocamento de 8 bits levam 1 ciclo; multiplicação 8×8 tem instrução própria (2 ciclos); 16 e 32 bits crescem proporcionalmente ao número de bytes; divisão inteira é cara (dezenas de ciclos, mais ainda em 32 bits); float é o pior de todos. Regra prática: se dá para resolver com inteiros, use inteiros.'
          },
          {
            title: 'Tipos, promoção de inteiros e estouro',
            body: 'No AVR um int tem 16 bits (−32768 a 32767) e um long tem 32 bits. Em C/C++, quando se faz conta com tipos menores que int, como uint8_t, eles são promovidos para int antes da operação. Dois efeitos: (1) ao guardar o resultado de volta num tipo pequeno, ele é truncado: uint8_t r = a * b com a = 200 e b = 2 calcula 400 e guarda 400 mod 256 = 144. (2) Se o resultado não cabe em int, estoura: 60 * 1000 = 60000 passa de 32767 e dá valor errado, mesmo que a variável de destino seja unsigned long, pois a conta já foi feita em 16 bits. A solução é forçar o tipo largo ANTES da conta: sufixos nas constantes (60000UL, 60L * 1000) ou conversão explícita ((uint32_t)a * b).',
            code: 'uint8_t a = 200, b = 2;\nuint8_t r1 = a * b;                // 400 truncado: 144\nuint16_t r2 = a * b;               // 400: cabe\n\nunsigned long ms1 = 60 * 1000;     // ERRADO: estoura int de 16 bits\nunsigned long ms2 = 60UL * 1000;   // certo: 60000\nlong p = (long)a * b;              // conta feita em 32 bits'
          },
          {
            title: 'Ponto fixo: decimais sem float',
            body: 'Ponto fixo guarda um número fracionário como inteiro multiplicado por uma escala. Com escala 100, 12,34 vira 1234. Soma e subtração funcionam direto (1234 + 250 = 1484, ou 14,84). Na multiplicação a escala aparece duas vezes, então se divide por ela de volta: (a · b) / 100, usando 32 bits no intermediário para não estourar. 12,34 · 2,50 = 1234 · 250 / 100 = 3085, ou seja 30,85. Na divisão a escala se cancela, então se multiplica antes: (a · 100) / b. 15,00 / 4,00 = 1500 · 100 / 400 = 375, ou 3,75. Para arredondar em vez de truncar, soma-se metade do divisor antes de dividir. Para imprimir, separa-se parte inteira (v / 100) e fracionária (v % 100).',
            code: 'int32_t mulFx(int32_t a, int32_t b) { return a * b / 100; }\nint32_t divFx(int32_t a, int32_t b) { return a * 100 / b; }\n\nint32_t v = mulFx(1234, 250);   // 3085 = 30,85\nSerial.print(v / 100);          // 30\nSerial.print(\',\');\nSerial.println(v % 100);        // 85'
          },
          {
            title: 'Q8.8: a escala vira deslocamento',
            body: 'Se a escala for uma potência de 2, a multiplicação e a divisão pela escala viram deslocamentos de bits, bem mais baratos. O formato Q8.8 usa 16 bits: 8 para a parte inteira e 8 para a fracionária, e o valor real é raw / 256. Assim 1,5 vale 384 e 2,5 vale 640. Soma e subtração são diretas; a multiplicação é feita em 32 bits e depois se desloca 8 bits à direita: ((int32_t)a · b) >> 8. Exemplo: 2,5 · 2,0 = (640 · 512) >> 8 = 327680 >> 8 = 1280, que em Q8.8 é 5,0. Em geral, dividir por 2^k um valor sem sinal equivale a deslocar k bits à direita (x / 8 é x >> 3), e multiplicar por 2^k equivale a deslocar à esquerda; o compilador já faz isso sozinho quando a constante é potência de 2 conhecida. Para valores negativos, o deslocamento arredonda para baixo e a divisão trunca em direção a zero, então os resultados podem diferir.',
            code: 'typedef int16_t q88;\n#define Q88(x) ((q88)((x) * 256))   // so para constantes\n\nq88 mulQ(q88 a, q88 b) {\n  return ((int32_t)a * b) >> 8;\n}\n// 640 (2,5) * 512 (2,0) -> 1280 (5,0)'
          },
          {
            title: 'Tabelas de consulta em PROGMEM',
            body: 'Quando uma função é cara (seno, logaritmo, linearização de um sensor), pré-calcula-se o resultado para as entradas possíveis e guarda-se numa tabela; em execução, basta ler da tabela, que leva poucos ciclos. Como a SRAM é escassa, a tabela vai para a Flash com PROGMEM (visto na lição de memória) e é lida com pgm_read_byte() ou pgm_read_word(), passando o endereço do elemento. Troca-se espaço de Flash por tempo. Uma tabela de seno com 256 entradas de 1 byte (valores 0–255 centrados em 128) gera uma onda senoidal sem usar sin() nem float.',
            code: 'const uint8_t seno[8] PROGMEM = {128, 218, 255, 218, 128, 38, 1, 38};\n\nuint8_t amostra(uint8_t i) {\n  return pgm_read_byte(&seno[i & 7]);   // i & 7 = i % 8\n}'
          },
          {
            title: 'Compilador, -Os e inline',
            body: 'A IDE do Arduino compila com -Os, que otimiza para tamanho (menor Flash), o que costuma ser a escolha certa num chip de 32 KB. Chamar uma função tem custo (empilhar endereço de retorno, preservar registradores, call e ret). Marcar uma função pequena como static inline sugere ao compilador copiar o corpo no ponto da chamada e eliminar essa sobrecarga, ao preço de mais código se for chamada em muitos lugares (é só uma sugestão: o compilador decide). Funções pequenas e quentes, como as chamadas dentro de ISRs, são boas candidatas.',
            code: 'static inline uint8_t dobro(uint8_t x) {\n  return x << 1;\n}'
          },
          {
            title: 'Meça antes de otimizar',
            body: 'Otimização prematura gasta tempo e deixa o código obscuro. Primeiro faça funcionar com clareza, depois meça e só então otimize o que importa. Tamanho: ao compilar, a IDE mostra o uso de Flash ("Sketch uses ... bytes of program storage") e de SRAM por globais; fora da IDE, avr-size no arquivo .elf mostra text, data e bss. Tempo: chame a função muitas vezes entre dois micros() e divida (micros() no Uno tem resolução de 4 µs, por isso medir uma única chamada é impreciso). Guarde o resultado em uma variável volatile para o compilador não eliminar a conta. Compare o antes e o depois com a mesma medição.',
            code: 'volatile int32_t sink;\n\nunsigned long t0 = micros();\nfor (uint16_t i = 0; i < 1000; i++) {\n  sink = mulFx(1234, 250);\n}\nunsigned long us = micros() - t0;   // us / 1000 = µs por chamada\nSerial.println(us);'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Por que cálculos com float são lentos e grandes no ATmega328P?',
          choices: [
            { id: 'a', text: 'Porque o float só existe na SRAM' },
            { id: 'b', text: 'Porque o chip tem uma FPU, mas a IDE a desativa' },
            { id: 'c', text: 'Porque não há FPU: o float é emulado por rotinas de software, que gastam muitos ciclos e Flash' },
            { id: 'd', text: 'Porque o float usa 8 bits e exige várias conversões' }
          ],
          answer: 'c',
          explanation: 'O AVR só faz aritmética inteira em hardware. Todo float vira chamada de rotinas de software, bem mais lentas que somas e multiplicações inteiras.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual é o valor de r depois de: uint8_t a = 200, b = 2; uint8_t r = a * b;',
          choices: [
            { id: 'a', text: '144' },
            { id: 'b', text: '400' },
            { id: 'c', text: '255' },
            { id: 'd', text: '0' }
          ],
          answer: 'a',
          explanation: 'A conta é feita em int e dá 400, mas ao guardar em uint8_t sobra 400 mod 256 = 144.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Em um Uno, unsigned long ms = 60 * 1000; dá um valor errado. Qual é a causa e a correção?',
          choices: [
            { id: 'a', text: 'O compilador recusa; basta trocar por float' },
            { id: 'b', text: 'O unsigned long só guarda até 255; use uint32_t' },
            { id: 'c', text: 'A variável deveria ser int, que guarda 60000' },
            { id: 'd', text: 'A conta é feita em int de 16 bits e estoura; use 60000UL ou 60UL * 1000' }
          ],
          answer: 'd',
          explanation: '60 e 1000 são int, então o produto (60000) é calculado em 16 bits e estoura antes de ir para o unsigned long. O sufixo UL força a conta em 32 bits.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Com ponto fixo de escala 100, complete a multiplicação (os valores a e b já estão multiplicados por 100).',
          code: 'int32_t r = (int32_t)a * b / ___;',
          accept: ['100'],
          explanation: 'Na multiplicação a escala aparece duas vezes (100 · 100), então se divide por 100 para voltar a ter escala 100. O (int32_t) evita estouro.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Em ponto fixo com escala 100, qual é o resultado de 15,00 / 4,00 calculado como (a · 100) / b, com a = 1500 e b = 400?',
          choices: [
            { id: 'a', text: '3,00 (valor 300)' },
            { id: 'b', text: '3,75 (valor 375)' },
            { id: 'c', text: '0,03 (valor 3)' },
            { id: 'd', text: '37,5 (valor 3750)' }
          ],
          answer: 'b',
          explanation: '1500 · 100 / 400 = 375, ou seja 3,75. Multiplicar antes de dividir preserva as casas decimais (1500 / 400 = 3 perderia a fração).'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Em Q8.8 (valor real = raw / 256), qual é o resultado bruto de 2,5 · 2,0, com raw 640 e 512, usando ((int32_t)a * b) >> 8?',
          choices: [
            { id: 'a', text: '5' },
            { id: 'b', text: '640' },
            { id: 'c', text: '1280' },
            { id: 'd', text: '327680' }
          ],
          answer: 'c',
          explanation: '640 · 512 = 327680 e 327680 >> 8 = 1280, que em Q8.8 vale 1280 / 256 = 5,0. O 327680 é o produto ainda sem remover a escala extra.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual afirmação sobre otimização está correta?',
          choices: [
            { id: 'a', text: 'Deve-se otimizar tudo desde o início, pois o desempenho é sempre o mais importante' },
            { id: 'b', text: 'Medir o tempo de uma única chamada com micros() é sempre preciso' },
            { id: 'c', text: 'Funções static inline nunca aumentam o tamanho do código' },
            { id: 'd', text: 'Meça primeiro (avr-size/IDE para tamanho, micros() em muitas repetições para tempo) e só otimize o que for realmente um gargalo' }
          ],
          answer: 'd',
          explanation: 'Otimização prematura complica o código sem garantir ganho. micros() tem resolução de 4 µs (use muitas repetições), e inline pode aumentar a Flash se for copiado em muitos pontos.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a leitura de um elemento de uma tabela guardada em PROGMEM.',
          code: 'uint8_t v = ___(&tabela[i]);',
          accept: ['pgm_read_byte'],
          explanation: 'Dados em PROGMEM não se leem com acesso direto: usa-se pgm_read_byte() (ou pgm_read_word()) passando o endereço do elemento.'
        }
      ]
    },
    {
      id: 'ara-05-timers',
      title: 'Timers/Counters do AVR: modo normal, CTC e interrupção de comparação',
      goal: 'Configurar o Timer1 por registradores, calcular prescaler e OCR1A para uma frequência desejada e tratar a interrupção de comparação.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O que é um timer/counter',
            body: 'Um timer é um contador de hardware que incrementa sozinho a cada tick de clock, sem gastar tempo da CPU. O ATmega328P tem três: Timer0 (8 bits, conta de 0 a 255), Timer1 (16 bits, conta de 0 a 65535) e Timer2 (8 bits). O valor atual do contador fica no registrador TCNTx (TCNT1 para o Timer1).'
          },
          {
            title: 'Quem usa qual timer no Arduino',
            body: 'O core do Arduino já ocupa os timers: o Timer0 alimenta millis(), micros() e delay() e o PWM dos pinos 5 e 6; o Timer1 é usado pela biblioteca Servo e pelo PWM dos pinos 9 e 10; o Timer2 é usado por tone() e pelo PWM dos pinos 3 e 11. Mudar a configuração de um timer quebra esses recursos: alterar o Timer0 desregula millis e delay; usar o Timer1 inutiliza Servo e o PWM em 9/10; usar o Timer2 inutiliza tone().'
          },
          {
            title: 'Prescaler e o tick do timer',
            body: 'O prescaler divide o clock antes de chegar ao contador: o tick ocorre a F_CPU / prescaler. No Timer1 os valores são 1, 8, 64, 256 e 1024, escolhidos pelos bits CS12, CS11 e CS10 de TCCR1B (001 = /1, 010 = /8, 011 = /64, 100 = /256, 101 = /1024; 000 = timer parado). Com prescaler 64: 16 MHz / 64 = 250 kHz, ou seja, um tick a cada 4 µs.',
            code: '// TCCR1B: bits CS12 CS11 CS10\n// 001 -> /1    010 -> /8     011 -> /64\n// 100 -> /256  101 -> /1024  000 -> parado\nTCCR1B |= (1 << CS11) | (1 << CS10);   // prescaler 64'
          },
          {
            title: 'Modo normal e overflow',
            body: 'No modo normal, TCNT1 conta até 65535 e volta a 0 (overflow), podendo disparar a interrupção TIMER1_OVF_vect (se TOIE1 estiver em 1 em TIMSK1). O tempo entre overflows é prescaler × 65536 / F_CPU. Com prescaler 8: 8 × 65536 / 16 000 000 = 32,768 ms.'
          },
          {
            title: 'Modo CTC e a fórmula da frequência',
            body: 'CTC (Clear Timer on Compare Match) faz o contador zerar ao chegar no valor de OCR1A, em vez de ir até 65535: assim você escolhe o período. Liga-se com o bit WGM12 de TCCR1B. Como o contador passa por OCR1A + 1 valores (de 0 a OCR1A), a frequência dos eventos é f = F_CPU / (prescaler × (OCR1A + 1)), e portanto OCR1A = F_CPU / (prescaler × f) − 1. Exemplo: 1 Hz com prescaler 1024 → OCR1A = 16 000 000 / (1024 × 1) − 1 = 15624. O valor precisa caber em 16 bits (até 65535).'
          },
          {
            title: 'Configuração completa e ISR',
            body: 'Zere TCCR1A, TCCR1B e TCNT1, grave OCR1A, ligue o modo CTC e o prescaler e habilite a interrupção com o bit OCIE1A de TIMSK1. A rotina de tratamento é ISR(TIMER1_COMPA_vect). Faça a configuração com interrupções desligadas (cli) e religue com sei().',
            code: 'cli();\nTCCR1A = 0; TCCR1B = 0; TCNT1 = 0;\nOCR1A  = 15624;                        // 1 Hz (prescaler 1024)\nTCCR1B |= (1 << WGM12);                // modo CTC\nTCCR1B |= (1 << CS12) | (1 << CS10);   // prescaler 1024\nTIMSK1 |= (1 << OCIE1A);               // interrupção de comparação\nsei();\n\nISR(TIMER1_COMPA_vect) {\n  PINB = _BV(PINB5);   // alterna o LED a cada 1 s\n}'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual timer do ATmega328P é de 16 bits?',
          choices: [
            { id: 'a', text: 'Timer2' },
            { id: 'b', text: 'Todos os três' },
            { id: 'c', text: 'Timer1' },
            { id: 'd', text: 'Timer0' }
          ],
          answer: 'c',
          explanation: 'Timer0 e Timer2 são de 8 bits; só o Timer1 conta até 65535.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual é a consequência de mudar o prescaler do Timer0 num sketch comum?',
          choices: [
            { id: 'a', text: 'millis(), micros() e delay() passam a medir o tempo errado' },
            { id: 'b', text: 'A biblioteca Servo para de funcionar' },
            { id: 'c', text: 'tone() troca de pino' },
            { id: 'd', text: 'Nada, o Timer0 não é usado pelo core' }
          ],
          answer: 'a',
          explanation: 'O Timer0 é a base de tempo de millis, micros e delay. Servo usa o Timer1 e tone() usa o Timer2.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Com F_CPU = 16 MHz e prescaler 64, quanto dura um tick do timer?',
          choices: [
            { id: 'a', text: '64 µs' },
            { id: 'b', text: '0,5 µs' },
            { id: 'c', text: '1 µs' },
            { id: 'd', text: '4 µs' }
          ],
          answer: 'd',
          explanation: '16 MHz / 64 = 250 kHz, e 1 / 250 000 s = 4 µs.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o bit de TIMSK1 que habilita a interrupção de comparação com OCR1A:',
          code: 'TIMSK1 |= (1 << ___);',
          accept: ['OCIE1A'],
          explanation: 'OCIE1A (Output Compare Interrupt Enable 1 A) habilita a interrupção TIMER1_COMPA_vect.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Que valor de OCR1A gera uma interrupção a 500 Hz em modo CTC com prescaler 64 e 16 MHz?',
          choices: [
            { id: 'a', text: '999' },
            { id: 'b', text: '499' },
            { id: 'c', text: '500' },
            { id: 'd', text: '249' }
          ],
          answer: 'b',
          explanation: 'OCR1A = 16 000 000 / (64 × 500) − 1 = 500 − 1 = 499.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Timer1 em modo normal, prescaler 8, 16 MHz. De quanto em quanto tempo ocorre o overflow?',
          choices: [
            { id: 'a', text: '4,194 s' },
            { id: 'b', text: '32,768 ms' },
            { id: 'c', text: '4,096 ms' },
            { id: 'd', text: '65,536 ms' }
          ],
          answer: 'b',
          explanation: 'Tick de 0,5 µs × 65536 contagens = 32 768 µs = 32,768 ms.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual a frequência da interrupção neste trecho?\nTCCR1B = (1 << WGM12) | (1 << CS11);\nOCR1A = 1999;',
          choices: [
            { id: 'a', text: '2 kHz' },
            { id: 'b', text: '8 kHz' },
            { id: 'c', text: '4 kHz' },
            { id: 'd', text: '1 kHz' }
          ],
          answer: 'd',
          explanation: 'CS11 = prescaler 8. f = 16 000 000 / (8 × 2000) = 1000 Hz.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o nome do vetor da interrupção de comparação A do Timer1:',
          code: 'ISR(___) {\n  PINB = _BV(PINB5);\n}',
          accept: ['TIMER1_COMPA_vect'],
          explanation: 'O vetor é TIMER1_COMPA_vect (Timer1 Compare Match A).'
        }
      ]
    },
    {
      id: 'ara-06-pwm-avancado',
      title: 'PWM avançado: Fast PWM, Phase Correct e PWM de 16 bits',
      goal: 'Escolher o modo de PWM, calcular a frequência, mudar o prescaler com segurança e usar o Timer1 com resolução de 16 bits.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'PWM é um timer fazendo o trabalho',
            body: 'No PWM por hardware, o contador do timer é comparado com OCRnA/OCRnB; o pino de saída (OCnA/OCnB) muda sozinho quando há coincidência, sem a CPU. O ciclo de trabalho (duty) é OCR dividido pelo TOP (o valor máximo da contagem). analogWrite(pino, valor) apenas escreve no OCR certo.'
          },
          {
            title: 'Fast PWM x Phase Correct',
            body: 'Fast PWM: o contador sobe de 0 até TOP e zera (rampa única); a frequência é F_CPU / (prescaler × (TOP + 1)), ou seja, F_CPU / (prescaler × 256) em 8 bits. Phase Correct: o contador sobe até TOP e depois desce (rampa dupla), por isso a frequência é F_CPU / (prescaler × 2 × TOP), ou F_CPU / (prescaler × 510) em 8 bits — metade da velocidade do Fast PWM, mas com pulsos simétricos, melhores para motores e servos de precisão.'
          },
          {
            title: 'Frequências padrão do Arduino',
            body: 'O core configura os três timers com prescaler 64. O Timer0 usa Fast PWM: 16 MHz / (64 × 256) ≈ 976 Hz (pinos 5 e 6, o "980 Hz" da documentação). Os Timers 1 e 2 usam Phase Correct de 8 bits: 16 MHz / (64 × 510) ≈ 490 Hz (pinos 9, 10, 3 e 11).'
          },
          {
            title: 'Pinos por timer',
            body: 'Cada timer tem duas saídas, A e B, com OCR independentes (duty diferente) mas a MESMA frequência: pinos 6 (OC0A) e 5 (OC0B) no Timer0; 9 (OC1A) e 10 (OC1B) no Timer1; 11 (OC2A) e 3 (OC2B) no Timer2. Mudar a frequência de um pino muda também a do outro pino do mesmo timer.'
          },
          {
            title: 'Mudando a frequência pelo prescaler',
            body: 'Troque só os 3 bits de prescaler (CS22:CS20 no Timer2) preservando o resto do registrador. Exemplo: prescaler 1 no Timer2 (pinos 3 e 11) dá 16 MHz / (1 × 510) ≈ 31,4 kHz, acima da faixa audível (some o chiado de motores). Frequências baixas fazem LED piscar visivelmente; altas aumentam as perdas de chaveamento de MOSFETs. NÃO altere o prescaler do Timer0 se o sketch usa millis/delay.',
            code: '// Timer2: pinos 3 e 11 a ~31,4 kHz (Phase Correct)\nTCCR2B = (TCCR2B & 0b11111000) | 0x01;   // prescaler 1\nanalogWrite(3, 128);'
          },
          {
            title: 'PWM de 16 bits no Timer1',
            body: 'No Timer1 o modo 14 (Fast PWM com TOP = ICR1) deixa você escolher o TOP livremente, até 65535: mais resolução e frequência exata. Configure WGM11 em TCCR1A e WGM13/WGM12 em TCCR1B, o bit COM1A1 para saída não invertida no pino 9 e o prescaler. A frequência é F_CPU / (prescaler × (TOP + 1)). Exemplo para servo (50 Hz): prescaler 8 (tick de 0,5 µs) e ICR1 = 39999 → 16 MHz / (8 × 40000) = 50 Hz; um pulso de 1,5 ms são 1500 µs / 0,5 µs = 3000 ticks, logo OCR1A = 3000.',
            code: 'DDRB |= _BV(DDB1);                      // pino 9 como saída\nTCCR1A = (1 << COM1A1) | (1 << WGM11); // não invertido, modo 14\nTCCR1B = (1 << WGM13) | (1 << WGM12) | (1 << CS11); // prescaler 8\nICR1   = 39999;   // TOP -> 50 Hz\nOCR1A  = 3000;    // pulso de 1,5 ms'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual a diferença de contagem entre Fast PWM e Phase Correct?',
          choices: [
            { id: 'a', text: 'Fast conta só para cima (rampa única); Phase Correct sobe e desce (rampa dupla)' },
            { id: 'b', text: 'Fast conta para cima e para baixo; Phase Correct só para cima' },
            { id: 'c', text: 'Os dois contam igual, só muda o pino' },
            { id: 'd', text: 'Fast usa 16 bits, Phase Correct usa 8 bits' }
          ],
          answer: 'a',
          explanation: 'A rampa dupla do Phase Correct dá pulsos simétricos e frequência aproximadamente metade.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual a frequência padrão do analogWrite nos pinos 9 e 10 do Uno?',
          choices: [
            { id: 'a', text: 'Cerca de 31 kHz' },
            { id: 'b', text: 'Cerca de 62,5 kHz' },
            { id: 'c', text: 'Cerca de 490 Hz' },
            { id: 'd', text: 'Cerca de 980 Hz' }
          ],
          answer: 'c',
          explanation: 'Timer1 em Phase Correct 8 bits com prescaler 64: 16 MHz / (64 × 510) ≈ 490 Hz.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Se você mudar o prescaler do Timer2 para alterar a frequência do PWM do pino 3, qual outro pino é afetado?',
          choices: [
            { id: 'a', text: 'Pino 5' },
            { id: 'b', text: 'Nenhum' },
            { id: 'c', text: 'Pino 11' },
            { id: 'd', text: 'Pino 10' }
          ],
          answer: 'c',
          explanation: 'O Timer2 gera os pinos 3 (OC2B) e 11 (OC2A), que compartilham a mesma frequência.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o bit que habilita a saída PWM NÃO invertida no pino 9 (OC1A):',
          code: 'TCCR1A = (1 << ___) | (1 << WGM11);',
          accept: ['COM1A1'],
          explanation: 'COM1A1 = 1 (com COM1A0 = 0) liga o PWM não invertido no pino OC1A.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Qual a frequência do Fast PWM de 8 bits com prescaler 8 a 16 MHz?',
          choices: [
            { id: 'a', text: '7812,5 Hz' },
            { id: 'b', text: '3906,25 Hz' },
            { id: 'c', text: '31 250 Hz' },
            { id: 'd', text: '62 500 Hz' }
          ],
          answer: 'a',
          explanation: '16 000 000 / (8 × 256) = 7812,5 Hz.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Por que não se deve alterar o prescaler do Timer0 para ganhar frequência de PWM nos pinos 5 e 6?',
          choices: [
            { id: 'a', text: 'Porque o Timer0 não tem prescaler' },
            { id: 'b', text: 'Porque apagaria o bootloader' },
            { id: 'c', text: 'Porque o PWM dos pinos 5 e 6 é por software' },
            { id: 'd', text: 'Porque o Timer0 também é a base de millis(), micros() e delay(), que passariam a contar errado' }
          ],
          answer: 'd',
          explanation: 'O tempo do sketch depende do Timer0; para PWM rápido prefira Timer1 ou Timer2.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Com Timer1 em prescaler 8 (tick de 0,5 µs), que valor de OCR1A gera um pulso de 2 ms?',
          choices: [
            { id: 'a', text: '3000' },
            { id: 'b', text: '4000' },
            { id: 'c', text: '2000' },
            { id: 'd', text: '1000' }
          ],
          answer: 'b',
          explanation: '2 ms = 2000 µs; 2000 µs / 0,5 µs = 4000 ticks.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'No modo 14 com prescaler 8, qual valor de ICR1 (TOP) gera 50 Hz?',
          code: 'ICR1 = ___;   // 16 MHz / (8 × (TOP + 1)) = 50 Hz',
          accept: ['39999'],
          explanation: 'TOP + 1 = 16 000 000 / (8 × 50) = 40000, então TOP = 39999.'
        }
      ]
    },
    {
      id: 'ara-07-interrupcoes-avancadas',
      title: 'Interrupções avançadas: pin change, atomicidade e dados compartilhados',
      goal: 'Usar pin change em qualquer pino, entender latência e prioridade e compartilhar variáveis entre ISR e loop com segurança.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Além do attachInterrupt',
            body: 'As interrupções externas INT0 e INT1 existem só nos pinos 2 e 3. Para detectar mudança em QUALQUER outro pino usa-se o pin change (PCINT). Em contrapartida, o pin change dispara em qualquer mudança (subida e descida) e é compartilhado por grupo de pinos.'
          },
          {
            title: 'Os três grupos de pin change',
            body: 'Há um vetor por porta: pinos 8 a 13 (PORTB) usam PCINT0_vect, com habilitação PCIE0 em PCICR e máscara PCMSK0; pinos A0 a A5 (PORTC) usam PCINT1_vect, PCIE1 e PCMSK1; pinos 0 a 7 (PORTD) usam PCINT2_vect, PCIE2 e PCMSK2. Dentro da máscara, o bit PCINTn do pino é o número do bit na porta somado a 0 (PORTB), 8 (PORTC) ou 16 (PORTD): o pino 10 é PB2 = PCINT2; o pino 9 é PCINT1.',
            code: '// Pin change no pino 10 (PB2):\nPCICR  |= (1 << PCIE0);     // habilita o grupo PORTB\nPCMSK0 |= (1 << PCINT2);    // pino 10 (PB2)\nsei();\n\nISR(PCINT0_vect) {\n  // disparou em QUALQUER pino habilitado de PORTB\n}'
          },
          {
            title: 'Descobrindo qual pino mudou',
            body: 'Como o vetor é um só por porta e vale para subida e descida, a ISR precisa guardar o estado anterior da porta e comparar com a leitura atual de PINx usando XOR: os bits em 1 do resultado são os pinos que mudaram. Depois, testa-se o bit no estado novo para saber se foi subida ou descida.',
            code: 'volatile uint8_t anterior = 0;\nISR(PCINT0_vect) {\n  uint8_t atual = PINB;\n  uint8_t mudou = atual ^ anterior;   // bits que mudaram\n  anterior = atual;\n  if (mudou & _BV(PB2)) { /* pino 10 mudou */ }\n}'
          },
          {
            title: 'Latência, prioridade e aninhamento',
            body: 'Entre o evento e a primeira instrução útil da ISR passam alguns ciclos (a CPU termina a instrução, salva o endereço de retorno e o compilador salva registradores): a latência nunca é zero. A prioridade é fixa e definida pelo endereço do vetor: quanto menor o endereço, maior a prioridade (RESET é o mais alto, depois INT0, INT1, e assim por diante). Ao entrar numa ISR, o hardware limpa o bit I do SREG: as demais interrupções ficam pendentes e só rodam depois do reti. Por isso a ISR deve ser curta, sem delay() e sem Serial.print (que depende de interrupções).'
          },
          {
            title: 'Atomicidade: leitura de variáveis multi-byte',
            body: 'O AVR é de 8 bits: ler ou escrever uma variável de 16 ou 32 bits leva várias instruções, e uma ISR pode alterar a variável no meio da leitura, entregando um valor "rasgado" (metade antigo, metade novo). Ler 1 byte é atômico. A solução é proteger a leitura com interrupções desligadas: cli()/sei(), ou melhor, ATOMIC_BLOCK(ATOMIC_RESTORESTATE) de util/atomic.h, que restaura o estado anterior do SREG ao sair do bloco.',
            code: '#include <util/atomic.h>\nvolatile uint16_t contagem;   // alterada na ISR\n\nuint16_t copia;\nATOMIC_BLOCK(ATOMIC_RESTORESTATE) {\n  copia = contagem;   // leitura sem risco de ser interrompida\n}'
          },
          {
            title: 'Padrão para compartilhar dados ISR e loop',
            body: 'Toda variável compartilhada entre ISR e loop deve ser volatile (o compilador não pode guardá-la em registrador). O padrão mais seguro: a ISR só atualiza um dado ou levanta uma flag volatile bool; o loop() percebe a flag, copia o dado dentro de um bloco atômico, limpa a flag e faz o trabalho pesado fora da ISR.',
            code: 'volatile bool pronto = false;\nvolatile uint16_t valor;\n\nISR(INT0_vect) { valor = TCNT1; pronto = true; }\n\nvoid loop() {\n  if (pronto) {\n    uint16_t v;\n    ATOMIC_BLOCK(ATOMIC_RESTORESTATE) { v = valor; pronto = false; }\n    Serial.println(v);   // processamento longo fora da ISR\n  }\n}'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Quantos grupos/vetores de pin change existem no ATmega328P e como se dividem?',
          choices: [
            { id: 'a', text: 'Um só vetor para todos os pinos' },
            { id: 'b', text: 'Três, um por porta (B, C e D)' },
            { id: 'c', text: 'Um por pino do Uno (20 vetores)' },
            { id: 'd', text: 'Dois, um para pinos digitais e outro para analógicos' }
          ],
          answer: 'b',
          explanation: 'PCINT0 (PORTB), PCINT1 (PORTC) e PCINT2 (PORTD): cada vetor atende a todos os pinos habilitados da porta.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual comando habilita o pin change no pino digital 10 (PB2)?',
          choices: [
            { id: 'a', text: 'PCMSK2 |= (1 << PCINT10);' },
            { id: 'b', text: 'EIMSK |= (1 << INT10);' },
            { id: 'c', text: 'PCMSK1 |= (1 << PCINT2); junto com PCICR |= (1 << PCIE2);' },
            { id: 'd', text: 'PCMSK0 |= (1 << PCINT2); junto com PCICR |= (1 << PCIE0);' }
          ],
          answer: 'd',
          explanation: 'Os pinos 8 a 13 pertencem à PORTB (PCMSK0/PCIE0) e o pino 10 é o bit PCINT2.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Como a ISR de pin change descobre qual pino mudou?',
          choices: [
            { id: 'a', text: 'Faz XOR entre a leitura atual de PINx e o estado anterior guardado' },
            { id: 'b', text: 'Lê um registrador que informa o número do pino' },
            { id: 'c', text: 'Usa millis() para medir a diferença' },
            { id: 'd', text: 'Cada pino tem seu próprio vetor, então já sabe' }
          ],
          answer: 'a',
          explanation: 'O vetor é compartilhado; os bits em 1 do XOR entre atual e anterior apontam os pinos que mudaram.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o vetor da interrupção de pin change dos pinos 8 a 13:',
          code: 'ISR(___) {\n  // trata mudança em PORTB\n}',
          accept: ['PCINT0_vect'],
          explanation: 'PORTB (pinos 8 a 13) usa PCINT0_vect.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Duas interrupções ficam pendentes ao mesmo tempo. Quem é atendida primeiro?',
          choices: [
            { id: 'a', text: 'A que o programador configurar com setPriority()' },
            { id: 'b', text: 'A de maior endereço de vetor' },
            { id: 'c', text: 'A de vetor com menor endereço (prioridade fixa)' },
            { id: 'd', text: 'A que chegou primeiro, sempre' }
          ],
          answer: 'c',
          explanation: 'No AVR a prioridade é fixa e definida pela posição do vetor: menor endereço, maior prioridade.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Por que ler uma variável volatile uint16_t alterada em ISR deve ser feito em bloco atômico?',
          choices: [
            { id: 'a', text: 'Porque a SRAM só aceita acesso com interrupções ligadas' },
            { id: 'b', text: 'Porque uint16_t não pode ser lido pelo loop' },
            { id: 'c', text: 'Porque a leitura de 2 bytes leva mais de uma instrução e a ISR pode alterar a variável no meio, gerando um valor rasgado' },
            { id: 'd', text: 'Porque volatile é lento demais sem proteção' }
          ],
          answer: 'c',
          explanation: 'Em CPU de 8 bits só acessos de 1 byte são atômicos; os maiores precisam de proteção.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que uma ISR deve ser curta e não deve chamar delay() nem Serial.print()?',
          choices: [
            { id: 'a', text: 'Durante a ISR as outras interrupções ficam pendentes, e delay/Serial dependem de interrupções para funcionar' },
            { id: 'b', text: 'Porque o compilador recusa essas chamadas' },
            { id: 'c', text: 'Porque a ISR roda em outro núcleo da CPU' },
            { id: 'd', text: 'Porque delay() só funciona fora do loop' }
          ],
          answer: 'a',
          explanation: 'Dentro da ISR o bit I está limpo; delay e Serial dependem de timers/UART com interrupção e podem travar.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o nome do cabeçalho que fornece ATOMIC_BLOCK:',
          code: '#include <util/___.h>',
          accept: ['atomic'],
          explanation: 'O cabeçalho é util/atomic.h, que define ATOMIC_BLOCK e ATOMIC_RESTORESTATE.'
        }
      ]
    },
    {
      id: 'ara-08-adc-avancado',
      title: 'ADC avançado: referência, prescaler, ruído e a leitura da própria alimentação',
      goal: 'Configurar o conversor analógico-digital por registradores, calcular tempos e resolução, reduzir ruído e medir a tensão de alimentação.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Como o ADC funciona',
            body: 'O ADC do ATmega328P tem 10 bits (valores de 0 a 1023) e UM único conversor, ligado por um multiplexador aos canais A0 a A5 e a canais internos (sensor de temperatura, referência de 1,1 V e GND). A conversão obedece a ADC = Vin × 1024 / Vref aproximadamente: a tensão de referência define o fundo de escala. analogRead() só configura o ADMUX, inicia a conversão, espera e lê o resultado.'
          },
          {
            title: 'Referência de tensão (REFS1:0 de ADMUX)',
            body: 'Os bits REFS1:0 escolhem a referência: 00 = AREF externo, 01 = AVcc (a alimentação, padrão do Arduino, 5 V no Uno) e 11 = interna de 1,1 V. No Arduino: analogReference(DEFAULT / INTERNAL / EXTERNAL). Cada passo vale Vref / 1024: com 5 V são ≈ 4,88 mV; com 1,1 V são ≈ 1,07 mV, ótimo para sensores de sinal pequeno (como LM35). Cuidado: se ligar uma tensão ao pino AREF, chame analogReference(EXTERNAL) antes de qualquer analogRead, senão a referência interna entra em curto com a fonte externa.'
          },
          {
            title: 'Prescaler, clock do ADC e tempo de conversão',
            body: 'O ADC tem seu próprio clock, obtido dividindo F_CPU pelo prescaler (bits ADPS2:ADPS0 de ADCSRA). O padrão do Arduino é 128: 16 MHz / 128 = 125 kHz (a faixa recomendada para a resolução total de 10 bits é de 50 a 200 kHz). Uma conversão normal leva 13 ciclos do clock do ADC: 13 / 125 kHz = 104 µs, cerca de 9600 leituras por segundo. Prescaler menor acelera, mas perde precisão.',
            code: '// ADPS2:0 -> 001=/2 010=/4 011=/8 100=/16 101=/32 110=/64 111=/128\nADCSRA = (ADCSRA & 0b11111000) | 0b100;  // prescaler 16\n// ADC a 1 MHz -> 13 us por conversão (menos preciso)'
          },
          {
            title: 'Lendo o ADC direto pelos registradores',
            body: 'ADMUX escolhe a referência (REFS), o alinhamento (ADLAR: com 1, o resultado fica justificado à esquerda e ADCH sozinho dá 8 bits) e o canal (MUX3:0). Em ADCSRA, ADEN liga o conversor e ADSC inicia a conversão; o hardware zera ADSC ao terminar. O resultado é lido em ADC (ADCL e ADCH combinados).',
            code: 'ADMUX  = (1 << REFS0) | 3;      // ref AVcc, canal 3 (A3)\nADCSRA |= (1 << ADEN);          // liga o ADC\nADCSRA |= (1 << ADSC);          // inicia a conversão\nwhile (ADCSRA & (1 << ADSC)) ;  // espera terminar\nuint16_t leitura = ADC;'
          },
          {
            title: 'Ruído, média e oversampling',
            body: 'Leituras reais flutuam por ruído. Práticas: fios curtos, capacitor de 100 nF entre AREF e GND, descartar a primeira leitura após trocar de canal, fonte do sinal de baixa impedância (até cerca de 10 kΩ). Fazer a média de N leituras reduz o ruído por √N. Oversampling com decimação ganha resolução: para n bits extras, some 4^n amostras e desloque o resultado n posições à direita (4 amostras somadas e >> 1 dão 11 bits; 16 amostras e >> 2 dão 12 bits). Só funciona se houver um pouco de ruído natural no sinal.'
          },
          {
            title: 'Medindo o próprio Vcc com a referência de 1,1 V',
            body: 'Com a bateria caindo, o Vcc muda, e analogRead com referência AVcc perde o sentido. Truque: meça o canal interno de 1,1 V (MUX3:1 = 1, canal 14) usando AVcc como referência. A leitura vale 1,1 × 1024 / Vcc; logo, Vcc cresce quando a leitura diminui. A constante 1125300 vem de 1,1 V × 1023 × 1000, e o resultado sai em milivolts. Exemplo: leitura 300 → 1 125 300 / 300 = 3751 mV.',
            code: 'long lerVcc() {\n  ADMUX = _BV(REFS0) | _BV(MUX3) | _BV(MUX2) | _BV(MUX1); // 1,1 V\n  delay(2);                       // referência estabiliza\n  ADCSRA |= _BV(ADSC);\n  while (bit_is_set(ADCSRA, ADSC)) ;\n  uint16_t r = ADC;\n  return 1125300L / r;            // em mV\n}'
          },
          {
            title: 'Sensor de temperatura interno',
            body: 'O ADC também lê um sensor de temperatura no próprio chip (canal 8, MUX3:0 = 1000), medido com a referência interna de 1,1 V; a saída varia cerca de 1 mV por °C. Cada chip tem um desvio de fábrica, então a leitura precisa de calibração (comparar com um termômetro). Serve bem para tendência e proteção, mas não para medição absoluta precisa do ambiente, pois mede o chip, que aquece.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que se pode dizer do sensor de temperatura interno do ATmega328P?',
          choices: [
            { id: 'a', text: 'É um sensor digital I2C no endereço 0x48' },
            { id: 'b', text: 'É preciso de fábrica, sem necessidade de calibração' },
            { id: 'c', text: 'Mede a temperatura do ar ambiente com exatidão de 0,1 °C' },
            { id: 'd', text: 'Mede a temperatura do chip pelo ADC com referência de 1,1 V e precisa de calibração' }
          ],
          answer: 'd',
          explanation: 'É lido no canal 8 do ADC, com cerca de 1 mV/°C, e tem desvio de fábrica; mede o chip, não o ambiente.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual é a referência de tensão padrão do ADC no Uno?',
          choices: [
            { id: 'a', text: 'GND' },
            { id: 'b', text: 'AVcc (a alimentação, 5 V)' },
            { id: 'c', text: 'Interna de 1,1 V' },
            { id: 'd', text: 'AREF externo' }
          ],
          answer: 'b',
          explanation: 'REFS = 01 seleciona AVcc, o padrão (DEFAULT) do Arduino.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual é a resolução aproximada de cada passo do ADC usando a referência interna de 1,1 V?',
          choices: [
            { id: 'a', text: '0,1 mV' },
            { id: 'b', text: '1,07 mV' },
            { id: 'c', text: '4,88 mV' },
            { id: 'd', text: '10 mV' }
          ],
          answer: 'b',
          explanation: '1,1 V / 1024 ≈ 1,07 mV. Com 5 V seriam 4,88 mV.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o bit de ADMUX que, sozinho, seleciona AVcc como referência:',
          code: 'ADMUX = (1 << ___);',
          accept: ['REFS0'],
          explanation: 'REFS1:0 = 01 seleciona AVcc; basta o bit REFS0.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Com o prescaler padrão (128) a 16 MHz, quanto leva uma conversão do ADC (13 ciclos do clock do ADC)?',
          choices: [
            { id: 'a', text: 'Cerca de 13 µs' },
            { id: 'b', text: 'Cerca de 1 ms' },
            { id: 'c', text: 'Cerca de 8 µs' },
            { id: 'd', text: 'Cerca de 104 µs' }
          ],
          answer: 'd',
          explanation: '16 MHz / 128 = 125 kHz; 13 / 125 000 s = 104 µs.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Quantas amostras devem ser somadas, e quantos bits deslocados à direita, para obter 2 bits extras de resolução por oversampling?',
          choices: [
            { id: 'a', text: '16 amostras, deslocamento de 2 bits' },
            { id: 'b', text: '4 amostras, deslocamento de 2 bits' },
            { id: 'c', text: '8 amostras, deslocamento de 2 bits' },
            { id: 'd', text: '16 amostras, deslocamento de 4 bits' }
          ],
          answer: 'a',
          explanation: 'Para n bits extras: 4^n amostras (4^2 = 16) e desloca n bits (>> 2).'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Medindo o canal de 1,1 V com referência AVcc, a leitura foi 300. Qual o Vcc aproximado?',
          choices: [
            { id: 'a', text: '3300 mV' },
            { id: 'b', text: '1100 mV' },
            { id: 'c', text: '3751 mV' },
            { id: 'd', text: '5000 mV' }
          ],
          answer: 'c',
          explanation: 'Vcc = 1 125 300 / 300 ≈ 3751 mV: a leitura é inversamente proporcional ao Vcc.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o bit de ADCSRA que inicia uma conversão do ADC:',
          code: 'ADCSRA |= (1 << ___);',
          accept: ['ADSC'],
          explanation: 'ADSC (ADC Start Conversion) inicia a conversão e é zerado pelo hardware ao terminar.'
        }
      ]
    },
    {
      id: 'ara-23-filtros-digitais',
      title: 'Filtros digitais, calibração e histerese',
      goal: 'Tratar leituras ruidosas com média móvel, mediana e média exponencial, evitar chaveamento com histerese e converter leituras brutas em unidades reais por calibração e interpolação.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Sinais reais são ruidosos',
            body: 'Uma leitura de ADC nunca é perfeitamente estável: ruído elétrico, a fonte, fios longos, o próprio sensor e o arredondamento do conversor fazem o valor oscilar de uma amostra para outra, mesmo com a grandeza física parada. Há dois tipos de problema: o ruído contínuo (pequenas variações para cima e para baixo) e os picos isolados (spikes: uma amostra absurda no meio de várias normais, por exemplo causada por uma partida de motor). Filtrar é processar as amostras em software para obter uma estimativa mais estável da grandeza real.',
            code: '// Mesma temperatura, leituras brutas do ADC:\n// 512 514 511 513 512 905 513 511 ...\n//                      ^ spike isolado'
          },
          {
            title: 'Média móvel com buffer circular',
            body: 'A média móvel guarda as últimas N amostras e devolve a média delas. Para não somar N valores a cada leitura, mantém-se uma soma acumulada: ao chegar uma amostra nova, subtrai-se a mais antiga (que sai da janela), grava-se a nova no lugar dela e soma-se a nova. O buffer é circular: o índice volta a 0 depois da última posição, então sempre se sobrescreve a mais antiga. A soma usa long para não estourar. No início o buffer está zerado, então as primeiras saídas são menores que o real.',
            code: 'const uint8_t N = 8;\nint buf[N];\nuint8_t idx = 0;\nlong soma = 0;\n\nint mediaMovel(int x) {\n  soma -= buf[idx];      // tira a mais antiga\n  buf[idx] = x;          // grava a nova no lugar\n  soma += x;             // soma a nova\n  idx = (idx + 1) % N;   // avança de forma circular\n  return soma / N;\n}'
          },
          {
            title: 'Filtro de mediana: mata os picos',
            body: 'Na mediana de 3 amostras, ordena-se o trio e usa-se o valor do meio. Um pico isolado é sempre o maior (ou o menor) do trio e, portanto, é descartado por completo. Já a média apenas "dilui" o pico: ele continua puxando o resultado. Com janela de 5 amostras a mediana tolera até 2 picos seguidos. Exemplo: amostras 12, 90, 14 ordenadas dão 12, 14, 90 e a mediana é 14. A mediana é ótima contra spikes, mas não suaviza muito o ruído pequeno; por isso é comum aplicar mediana primeiro e média depois.',
            code: 'int mediana3(int a, int b, int c) {\n  if (a > b) { int t = a; a = b; b = t; }\n  if (b > c) { int t = b; b = c; c = t; }\n  if (a > b) { int t = a; a = b; b = t; }\n  return b;   // valor do meio\n}'
          },
          {
            title: 'Média exponencial (EMA)',
            body: 'A média exponencial, ou filtro IIR de 1ª ordem, não precisa de buffer: guarda só o valor filtrado anterior y e o corrige uma fração α (entre 0 e 1) do erro a cada amostra x: y += α·(x − y). Com α pequeno o filtro é lento e suave; com α perto de 1 ele quase copia a entrada. Em inteiros, usa-se α = 1/2^k e o deslocamento de bits no lugar da divisão: α = 1/4 vira y += (x − y) >> 2. Exemplo com y = 0 e x = 100: 100 >> 2 = 25, y = 25; depois (100 − 25) >> 2 = 18, y = 43. O deslocamento de inteiro negativo arredonda para baixo, então o filtro para a poucas unidades do valor final; se precisar de mais resolução, trabalhe com y multiplicado por uma escala.',
            code: 'int y = 0;   // estado do filtro (int com sinal!)\n\nint ema(int x) {\n  y += (x - y) >> 2;   // alfa = 1/4\n  return y;            // alfa = 1/8 -> >> 3\n}'
          },
          {
            title: 'O trade-off: atraso versus suavização',
            body: 'Todo filtro troca resposta rápida por estabilidade. Aumentar a janela N da média móvel ou diminuir o α da EMA deixa a saída mais lisa, mas também mais atrasada: quando a grandeza muda de verdade, o filtro leva mais amostras para acompanhar. Um filtro forte demais faz o sistema reagir tarde (importante em controle, próxima lição); fraco demais deixa passar o ruído. Escolha a menor suavização que resolva o problema, observando o sinal no Serial Plotter.'
          },
          {
            title: 'Histerese e zona morta',
            body: 'Histerese usa DOIS limiares para decidir: um para ligar e outro, diferente, para desligar. Num termostato: liga o aquecedor abaixo de 23 °C e só desliga acima de 25 °C. Entre 23 e 25 o estado anterior é mantido. Com um único limiar de 24 °C o relé ficaria batendo liga/desliga sempre que o ruído cruzasse o valor. Já a zona morta ignora variações pequenas em torno de um valor de referência: um joystick em repouso lê cerca de 512 ± alguns pontos, e tratar qualquer |x − 512| menor que 8 como 512 evita que o item "ande sozinho".',
            code: 'bool ligado = false;\n\nvoid termostato(float t) {\n  if (t < 23.0)      ligado = true;    // liga abaixo de 23\n  else if (t > 25.0) ligado = false;   // desliga acima de 25\n  // entre 23 e 25: mantém o estado\n  digitalWrite(RELE, ligado);\n}\n\n// zona morta\nint leitura = analogRead(A0);\nif (abs(leitura - 512) < 8) leitura = 512;'
          },
          {
            title: 'Calibração e interpolação',
            body: 'A leitura bruta do ADC precisa virar unidade real. Calibração com 2 pontos: meça a leitura em dois valores conhecidos (por exemplo gelo e água fervendo) e trace a reta que passa por eles, y = ganho·x + offset. O map() do Arduino faz exatamente isso em inteiros: map(x, in_min, in_max, out_min, out_max) = (x − in_min) · (out_max − out_min) / (in_max − in_min) + out_min. Exemplo: map(300, 100, 500, 0, 200) = 200·200/400 = 100. Quando o sensor não é linear, usa-se interpolação por segmentos: uma tabela de pontos (leitura, valor) e uma reta diferente entre cada par de pontos vizinhos. Exemplo com os pontos (0, 0), (500, 20) e (1000, 100): para x = 750, o segmento é de 500 a 1000 e y = 20 + 250·80/500 = 60.',
            code: 'int interp(int x, int x0, int y0, int x1, int y1) {\n  return y0 + (long)(x - x0) * (y1 - y0) / (x1 - x0);\n}\n\nint graus(int raw) {\n  if (raw < 500) return interp(raw, 0, 0, 500, 20);\n  return interp(raw, 500, 20, 1000, 100);\n}'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'As leituras de um sensor são 512, 514, 511, 905, 513. Qual filtro remove melhor o pico isolado de 905?',
          choices: [
            { id: 'a', text: 'A média de 5 amostras, que elimina totalmente o pico' },
            { id: 'b', text: 'A mediana, pois o pico fica sempre numa ponta do trio ordenado e é descartado' },
            { id: 'c', text: 'Nenhum: picos só somem trocando o sensor' },
            { id: 'd', text: 'A histerese, que ignora valores acima de 900' }
          ],
          answer: 'b',
          explanation: 'A mediana descarta o pico por inteiro; a média apenas o dilui (ele ainda puxaria o resultado para cima). Histerese serve para decisões liga/desliga, não para remover spikes.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Uma média móvel de N = 4 guarda 10, 20, 30, 40 (soma = 100) e a mais antiga é o 10. Chega a amostra 50. Seguindo o algoritmo da soma acumulada, qual é a nova média?',
          choices: [
            { id: 'a', text: '25' },
            { id: 'b', text: '30' },
            { id: 'c', text: '35' },
            { id: 'd', text: '40' }
          ],
          answer: 'c',
          explanation: 'soma = 100 − 10 + 50 = 140 e 140 / 4 = 35. A janela passa a ser 20, 30, 40, 50.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Comparando uma EMA com α = 1/16 e outra com α = 1/4 para o mesmo sinal, o que acontece?',
          choices: [
            { id: 'a', text: 'α = 1/16 responde mais rápido e é mais ruidosa' },
            { id: 'b', text: 'As duas têm o mesmo atraso, só muda o arredondamento' },
            { id: 'c', text: 'α = 1/4 é mais suave e mais atrasada' },
            { id: 'd', text: 'α = 1/16 é mais suave, porém mais atrasada para acompanhar mudanças reais' }
          ],
          answer: 'd',
          explanation: 'Quanto menor o α, menor a fração do erro corrigida a cada amostra: sai mais liso, mas demora mais para acompanhar. É o trade-off atraso versus suavização.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o deslocamento para uma EMA em inteiros com α = 1/8.',
          code: 'y += (x - y) >> ___;',
          accept: ['3'],
          explanation: '1/8 = 1/2^3, então o deslocamento é de 3 bits (>> 3). Com α = 1/4 seria >> 2.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Um joystick em repouso lê valores entre 509 e 515 e o cursor "anda sozinho". Qual técnica resolve de forma direta?',
          choices: [
            { id: 'a', text: 'Zona morta: tratar leituras próximas de 512 (por exemplo |x − 512| < 8) como 512' },
            { id: 'b', text: 'Aumentar o clock do ADC' },
            { id: 'c', text: 'Calibração com 2 pontos nos extremos' },
            { id: 'd', text: 'Trocar a média móvel por mediana de 5' }
          ],
          answer: 'a',
          explanation: 'A zona morta ignora variações pequenas em torno do valor de referência. Calibração ajusta a escala, não esconde o tremor do repouso.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'No termostato com histerese (liga se t < 23, desliga se t > 25), o aquecedor está LIGADO e a temperatura sobe e chega a 24,0 °C. O que acontece?',
          choices: [
            { id: 'a', text: 'Desliga, pois passou da média de 24' },
            { id: 'b', text: 'Liga de novo, reiniciando o ciclo' },
            { id: 'c', text: 'Desliga e religa a cada amostra' },
            { id: 'd', text: 'Continua ligado: entre 23 e 25 o estado anterior é mantido' }
          ],
          answer: 'd',
          explanation: 'Dentro da faixa de histerese nenhuma das duas condições é verdadeira, então o estado não muda. Só desliga ao ultrapassar 25 °C.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual é o valor de map(300, 100, 500, 0, 200) com inteiros?',
          choices: [
            { id: 'a', text: '100' },
            { id: 'b', text: '150' },
            { id: 'c', text: '60' },
            { id: 'd', text: '200' }
          ],
          answer: 'a',
          explanation: '(300 − 100) · (200 − 0) / (500 − 100) + 0 = 200 · 200 / 400 = 100. A leitura 300 está no meio de 100–500, então cai no meio de 0–200.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a interpolação linear entre os pontos (x0, y0) e (x1, y1).',
          code: 'return y0 + (long)(x - x0) * (y1 - y0) / (___ - x0);',
          accept: ['x1', 'X1'],
          explanation: 'A fração do caminho percorrido é (x − x0) / (x1 − x0), multiplicada pela variação total (y1 − y0) e somada a y0.'
        }
      ]
    },
    {
      id: 'ara-24-controle-pid',
      title: 'Controle em malha fechada: PID',
      goal: 'Entender controle em malha fechada e implementar um controlador PID discreto, com anti-windup, saída limitada e sintonia manual.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Malha aberta versus malha fechada',
            body: 'Em malha aberta você manda uma saída fixa sem olhar o resultado: ligar o aquecedor com 40% de PWM e torcer para dar a temperatura certa. Em malha fechada um sensor mede o resultado e o controlador corrige. Três nomes: setpoint (a meta desejada), medida (o valor real lido pelo sensor) e erro = setpoint − medida. Erro positivo significa que falta; negativo, que passou. O controlador transforma o erro em uma saída (por exemplo, PWM de 0 a 255) que age sobre o processo e fecha o ciclo: medir, calcular o erro, agir, medir de novo.',
            code: 'float erro = setpoint - medida;\n// erro > 0 : falta temperatura/velocidade\n// erro < 0 : passou do setpoint'
          },
          {
            title: 'Liga-desliga e seus limites',
            body: 'O controle mais simples é o liga-desliga: se medida < setpoint, liga a saída; senão, desliga. É malha fechada, mas a saída só tem dois valores. A medida então oscila em torno do setpoint e, sem histerese, o atuador chaveia rapidamente sempre que o ruído cruza o limiar, desgastando relés. Com histerese (dois limiares, vista na lição anterior) o chaveamento diminui, porém a oscilação continua: o liga-desliga nunca assenta suavemente. Para ajuste fino, precisamos de uma saída gradual, proporcional ao erro.'
          },
          {
            title: 'P: proporcional',
            body: 'O termo P produz uma saída proporcional ao erro atual: saída = Kp · erro. Erro grande, ação grande; erro pequeno, ação pequena. Kp é o ganho. Exemplo: Kp = 3 e erro = 20 gera saída 60. Só com P, porém, sobra um erro em regime: quando o sistema se aproxima do setpoint, o erro encolhe e a saída também, até chegar a um ponto de equilíbrio ainda abaixo da meta (um forno precisa de alguma potência constante só para compensar a perda de calor, e P só dá potência se houver erro). Kp muito alto torna a resposta oscilante.'
          },
          {
            title: 'I: integral e o windup',
            body: 'O termo I acumula o erro ao longo do tempo: integral += erro · Δt, saída I = Ki · integral. Enquanto houver erro, a integral continua crescendo e empurrando a saída, o que elimina o erro em regime. Exemplo: erro constante de 4, Δt = 0,5 s, 3 amostras: integral = 4·0,5·3 = 6; com Ki = 2, a parcela I vale 12. O perigo é o windup: se a saída já está saturada (por exemplo PWM no máximo 255 e o forno ainda frio), a integral continua crescendo sem efeito e, quando a medida enfim passa do setpoint, esse acúmulo enorme demora a descarregar e causa um grande estouro. O anti-windup por limitação trava a integral dentro de uma faixa com constrain().',
            code: 'integral += erro * dt;\nintegral = constrain(integral, -100, 100);  // anti-windup'
          },
          {
            title: 'D: derivativo',
            body: 'O termo D reage à velocidade de variação: se a medida sobe rápido, ele reduz a saída antes de passar do setpoint, amortecendo as oscilações. Mas derivar amplifica ruído: uma pequena flutuação aleatória tem grande inclinação, então D costuma pedir uma medida filtrada. Usa-se a derivada sobre a MEDIDA, não sobre o erro: quando o setpoint muda de repente, a derivada do erro daria um "chute" enorme e momentâneo na saída, enquanto a da medida não sofre esse salto. Como erro = setpoint − medida, o termo fica −Kd · (medida − medidaAnterior) / Δt.',
            code: 'float derivada = -(medida - medidaAnt) / dt;\nmedidaAnt = medida;\n// termo D = Kd * derivada'
          },
          {
            title: 'A equação discreta e o período fixo',
            body: 'No microcontrolador o PID roda em amostras discretas: saída = Kp·erro + Ki·integral + Kd·derivada. Integral e derivada dependem de Δt, por isso o cálculo deve ocorrer num período fixo (por exemplo, a cada 100 ms com millis(), sem delay, ou numa interrupção de timer). Se o intervalo variar, o cálculo fica incorreto. A saída precisa caber no atuador: com analogWrite, de 0 a 255, então se usa constrain(saida, 0, 255) antes de aplicá-la.',
            code: 'const unsigned long DT = 100;   // ms\nunsigned long ultimo = 0;\n\nif (millis() - ultimo >= DT) {\n  ultimo += DT;\n  float dt = DT / 1000.0;\n  float medida = lerSensor();\n  float erro = setpoint - medida;\n  integral += erro * dt;\n  integral = constrain(integral, -100, 100);\n  float deriv = -(medida - medidaAnt) / dt;\n  medidaAnt = medida;\n  float saida = Kp * erro + Ki * integral + Kd * deriv;\n  analogWrite(PINO_PWM, (int)constrain(saida, 0, 255));\n}'
          },
          {
            title: 'Sintonia manual e bibliotecas',
            body: 'Sintonizar é escolher Kp, Ki e Kd. Receita heurística: comece com Ki = Kd = 0. Aumente Kp até a resposta ficar rápida, tolerando só uma leve oscilação. Depois aumente Ki aos poucos para eliminar o erro em regime (se aparecer estouro grande ou oscilação lenta, reduza). Por fim, aumente Kd para amortecer as oscilações, cuidando do ruído. Há métodos formais, como o de Ziegler–Nichols, que estima os ganhos a partir do ganho em que o sistema oscila continuamente; aqui fica apenas a menção. Na prática também existe a biblioteca PID_v1 (do Arduino Playground), que implementa tudo isso pronto, mas entender o cálculo é o que permite sintonizar e depurar.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Um controle liga-desliga de temperatura SEM histerese, com um sensor ruidoso perto do setpoint, tende a:',
          choices: [
            { id: 'a', text: 'Estabilizar perfeitamente, pois é malha aberta' },
            { id: 'b', text: 'Chavear o atuador muito rápido e a medida oscilar em torno do setpoint' },
            { id: 'c', text: 'Ficar sempre desligado' },
            { id: 'd', text: 'Eliminar o erro em regime como o termo I' }
          ],
          answer: 'b',
          explanation: 'É malha fechada, mas com saída de só dois valores: o ruído cruza o limiar o tempo todo. Histerese reduz o chaveamento, porém a oscilação permanece.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Com setpoint 100, medida 70, Kp = 10 e só o termo P, qual valor é enviado ao analogWrite depois de constrain(saida, 0, 255)?',
          choices: [
            { id: 'a', text: '30' },
            { id: 'b', text: '70' },
            { id: 'c', text: '300' },
            { id: 'd', text: '255' }
          ],
          answer: 'd',
          explanation: 'erro = 30 e saida = 10 · 30 = 300, que passa de 255. O constrain limita a 255 (o valor 300 não cabe no PWM de 8 bits).'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Um sistema só com P estabiliza sempre 5 unidades abaixo do setpoint. Qual termo é o indicado para eliminar esse erro em regime?',
          choices: [
            { id: 'a', text: 'O integral (I), que acumula o erro enquanto ele existir' },
            { id: 'b', text: 'O derivativo (D), que acelera a resposta' },
            { id: 'c', text: 'Reduzir o Kp a zero' },
            { id: 'd', text: 'Trocar millis() por delay()' }
          ],
          answer: 'a',
          explanation: 'Enquanto sobra erro, a integral continua crescendo e aumenta a saída até o erro zerar. D só reage à velocidade de variação.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o cálculo do erro de um PID.',
          code: 'float erro = setpoint - ___;',
          accept: ['medida', 'leitura', 'valorMedido', 'input'],
          explanation: 'O erro é a diferença entre a meta (setpoint) e o valor realmente medido pelo sensor.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O erro fica constante em 4 por 3 amostras, com Δt = 0,5 s. Qual é a parcela I (Ki · integral) se Ki = 2?',
          choices: [
            { id: 'a', text: '6' },
            { id: 'b', text: '8' },
            { id: 'c', text: '12' },
            { id: 'd', text: '24' }
          ],
          answer: 'c',
          explanation: 'integral = 4 · 0,5 · 3 = 6, e Ki · integral = 2 · 6 = 12. Sem o Δt a conta daria 4 · 3 = 12 de integral, um erro comum.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que é windup do termo integral e como o anti-windup por limitação o evita?',
          choices: [
            { id: 'a', text: 'É o ruído do sensor; evita-se com um capacitor' },
            { id: 'b', text: 'É a derivada exagerada; evita-se aumentando o Kd' },
            { id: 'c', text: 'É o PWM lento; evita-se trocando o pino' },
            { id: 'd', text: 'É a integral crescendo sem controle com a saída saturada; evita-se travando a integral numa faixa com constrain()' }
          ],
          answer: 'd',
          explanation: 'Com a saída saturada, o erro continua acumulando sem efeito e depois provoca estouro. Limitar a integral impede o acúmulo exagerado.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que a derivada costuma ser calculada sobre a MEDIDA e não sobre o erro?',
          choices: [
            { id: 'a', text: 'Porque o sensor é mais rápido que o setpoint' },
            { id: 'b', text: 'Porque assim o D deixa de amortecer a resposta' },
            { id: 'c', text: 'Para que uma mudança brusca de setpoint não gere um pico instantâneo na saída' },
            { id: 'd', text: 'Porque a medida nunca tem ruído' }
          ],
          answer: 'c',
          explanation: 'Quando o setpoint salta, o erro salta e sua derivada seria enorme por um instante. A medida varia de forma contínua, então a derivada dela não tem esse chute.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o primeiro passo da sintonia manual.',
          code: '// Ki = 0, Kd = 0\n// 1) aumente ___ até a resposta ficar rápida, com leve oscilação',
          accept: ['Kp', 'kp'],
          explanation: 'Começa-se só com o ganho proporcional (Kp); depois entram Ki (erro em regime) e Kd (amortecimento).'
        }
      ]
    },
    {
      id: 'ara-09-uart-protocolos',
      title: 'UART, taxa de baud e projeto de protocolos seriais',
      goal: 'Entender o hardware da UART, o cálculo do baud e dos buffers, as limitações do SoftwareSerial e como projetar um protocolo com delimitadores, comprimento e checksum.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'A UART por dentro',
            body: 'A UART é assíncrona: não há fio de clock, só TX e RX, e os dois lados combinam a velocidade (baud, em bits por segundo). O formato padrão 8N1 manda 1 bit de start, 8 bits de dados, sem paridade e 1 bit de stop: 10 bits por byte. Os registradores principais são UDR0 (dado), UCSR0A/B/C (controle e flags) e UBRR0 (divisor que define o baud). Serial.begin() configura tudo isso para você.'
          },
          {
            title: 'UBRR, baud real e erro',
            body: 'O divisor é UBRR = F_CPU / (16 × baud) − 1 (modo normal). A UART só aceita valores inteiros, então o baud real difere do pedido. Para 9600: 16 000 000 / (16 × 9600) − 1 = 103,17, arredondado para 103; o baud real é 16 000 000 / (16 × 104) = 9615, erro de apenas 0,16%. Com o bit U2X0 em 1 a fórmula vira F_CPU / (8 × baud) − 1. Para 115200, o modo normal dá UBRR = 8 (baud real 111 111, erro de −3,5%), mas com U2X0 dá UBRR = 16 (117 647, erro de +2,1%) — por isso o Arduino liga U2X0 nessas velocidades. Erros acima de poucos por cento corrompem os dados. A velocidade 250000 tem erro de 0%.'
          },
          {
            title: 'Buffers de 64 bytes',
            body: 'Uma ISR coloca cada byte recebido num buffer circular de 64 bytes (RX); Serial.available() diz quantos bytes estão lá e Serial.read() retira um. Se o loop demorar e chegarem mais de 64 bytes, os novos são perdidos. Na transmissão há outro buffer de 64 bytes (TX): Serial.print() só copia para ele e retorna, a menos que esteja cheio — aí o programa BLOQUEIA até haver espaço. Lembre-se: a 9600 baud cada byte leva 10 / 9600 ≈ 1,04 ms para sair.'
          },
          {
            title: 'SoftwareSerial e suas limitações',
            body: 'A biblioteca SoftwareSerial emula uma UART por software (bit-banging) em quaisquer pinos. Limitações: consome CPU e desliga interrupções durante a recepção de cada byte (afeta millis e outras ISRs); só uma instância recebe por vez (listen() escolhe); é confiável só até cerca de 57600 baud e piora com a CPU ocupada; conflita com bibliotecas que usam os mesmos recursos (como Servo). Sempre que possível, prefira UARTs de hardware (o Mega tem 4).'
          },
          {
            title: 'Projetando um protocolo: quadros',
            body: 'A serial é um fluxo de bytes sem fronteiras: o receptor precisa saber onde uma mensagem começa e termina. Em protocolos de texto, usa-se um delimitador (como o fim de linha \\n). Em binário, o byte do delimitador pode aparecer nos dados, então é mais robusto usar um byte de início, um campo de comprimento e o payload. Quadro típico: [0xAA][LEN][DADOS...][CHK].',
            code: '// Quadro binário:\n// [0xAA] [LEN] [dado0 ... dadoN-1] [CHK]\n//  início  nº de bytes   payload      verificação'
          },
          {
            title: 'Checksum e CRC',
            body: 'O checksum detecta dados corrompidos. O mais simples é somar (ou fazer XOR de) todos os bytes: é barato, mas fraco (o XOR não percebe bytes trocados de ordem). O CRC (CRC-8, CRC-16) usa divisão polinomial e detecta muito mais erros, inclusive rajadas; custa um pouco mais de CPU. O receptor recalcula e compara; se diferir, descarta o quadro.',
            code: 'uint8_t chk = 0;\nfor (uint8_t i = 0; i < n; i++) {\n  chk ^= dados[i];   // checksum por XOR\n}\n// 0x12 ^ 0x34 ^ 0x56 = 0x70'
          },
          {
            title: 'Parsing não bloqueante',
            body: 'Evite Serial.readString(), parseInt() e laços while(!Serial.available()): esperam com timeout (1 s por padrão) e travam o resto do programa. Faça o contrário: a cada volta do loop leia apenas o que já chegou (while (Serial.available() > 0)), alimentando uma máquina de estados (ESPERA_INICIO, LE_TAMANHO, LE_DADOS, LE_CHK) sobre um buffer fixo de tamanho máximo conhecido, descartando quadros maiores que o buffer.',
            code: 'while (Serial.available() > 0) {\n  uint8_t b = Serial.read();\n  processaByte(b);   // avança a máquina de estados\n}'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual valor de UBRR (modo normal, U2X0 = 0) a 16 MHz resulta em 9600 baud?',
          choices: [
            { id: 'a', text: '51' },
            { id: 'b', text: '8' },
            { id: 'c', text: '103' },
            { id: 'd', text: '207' }
          ],
          answer: 'c',
          explanation: 'UBRR = 16 000 000 / (16 × 9600) − 1 = 103,17, arredondado para 103.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Por que 115200 baud a 16 MHz é problemático no modo normal da UART?',
          choices: [
            { id: 'a', text: 'O divisor inteiro (UBRR = 8) gera um baud real com erro de cerca de −3,5%, alto demais' },
            { id: 'b', text: 'O ATmega328P não suporta mais que 57600 baud' },
            { id: 'c', text: 'UBRR precisa ser múltiplo de 16' },
            { id: 'd', text: 'Porque o buffer passa a ter 128 bytes' }
          ],
          answer: 'a',
          explanation: 'Com U2X0 ligado o erro cai para cerca de +2,1% (UBRR = 16), o que é tolerável.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O buffer de recepção de 64 bytes enche porque o loop demorou. O que acontece com os bytes seguintes?',
          choices: [
            { id: 'a', text: 'Sobrescrevem a SRAM inteira' },
            { id: 'b', text: 'Ficam na UART até o buffer ter espaço, sem perda' },
            { id: 'c', text: 'O Arduino reinicia automaticamente' },
            { id: 'd', text: 'São perdidos (descartados)' }
          ],
          answer: 'd',
          explanation: 'Sem espaço no buffer circular, os novos bytes são descartados.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o método que informa quantos bytes já chegaram, para ler sem bloquear:',
          code: 'if (Serial.___() > 0) {\n  uint8_t b = Serial.read();\n}',
          accept: ['available'],
          explanation: 'Serial.available() devolve quantos bytes estão no buffer de recepção.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Qual das afirmações sobre SoftwareSerial é verdadeira?',
          choices: [
            { id: 'a', text: 'Só funciona nos pinos 0 e 1' },
            { id: 'b', text: 'Só uma instância recebe por vez e as interrupções ficam desligadas durante a recepção de cada byte' },
            { id: 'c', text: 'Usa o hardware UART dedicado, sem custo de CPU' },
            { id: 'd', text: 'É confiável em qualquer baud, até 1 Mbaud' }
          ],
          answer: 'b',
          explanation: 'É bit-banging: consome CPU, limita o baud e atrapalha outras interrupções.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual a vantagem do CRC sobre um checksum de XOR simples?',
          choices: [
            { id: 'a', text: 'Dispensa o campo de comprimento do quadro' },
            { id: 'b', text: 'Detecta muito mais tipos de erro, como rajadas e bytes trocados de ordem' },
            { id: 'c', text: 'Corrige automaticamente qualquer erro de bit' },
            { id: 'd', text: 'Não gasta nenhum ciclo de CPU' }
          ],
          answer: 'b',
          explanation: 'O CRC detecta mais erros, ao custo de um pouco mais de processamento; não corrige, só detecta.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que um campo de comprimento é mais robusto que um delimitador em protocolos binários?',
          choices: [
            { id: 'a', text: 'Delimitadores só existem em texto ASCII, mas não funcionam na UART' },
            { id: 'b', text: 'O campo de comprimento aumenta o baud real' },
            { id: 'c', text: 'Dispensa totalmente o checksum' },
            { id: 'd', text: 'O valor do delimitador pode aparecer dentro dos dados binários' }
          ],
          answer: 'd',
          explanation: 'Num payload binário qualquer byte é possível; com comprimento, o receptor sabe exatamente quantos bytes ler.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o operador composto que acumula o checksum por XOR:',
          code: 'uint8_t chk = 0;\nfor (uint8_t i = 0; i < n; i++) {\n  chk ___ dados[i];\n}',
          accept: ['^='],
          explanation: 'chk ^= dados[i] faz o XOR cumulativo de todos os bytes.'
        }
      ]
    },
    {
      id: 'ara-26-spi-twi-registradores',
      title: 'SPI e I2C (TWI) por dentro: registradores',
      goal: 'Configurar SPI e TWI diretamente pelos registradores do ATmega328P, calcular clocks e entender o que acontece no barramento por trás de SPI.transfer() e Wire.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'SPI: quatro fios e troca simultânea',
            body: 'No SPI, o mestre gera o clock (SCK) e escolhe o escravo puxando o pino SS (Slave Select) para nível baixo. Os dados andam em duas linhas ao mesmo tempo: MOSI (mestre para escravo) e MISO (escravo para mestre). Isso é full-duplex: a cada byte enviado pelo mestre, o escravo devolve outro byte no mesmo intervalo de clock, como dois registradores de deslocamento ligados em anel. Ou seja, não existe "só ler": para ler, o mestre precisa enviar algo (um byte qualquer) para gerar os pulsos. No Uno: SS = pino 10 (PB2), MOSI = 11 (PB3), MISO = 12 (PB4), SCK = 13 (PB5).'
          },
          {
            title: 'Registradores SPCR, SPSR e SPDR',
            body: 'SPCR (SPI Control Register) tem os bits: SPIE (interrupção), SPE (habilita o SPI), DORD (ordem dos bits: 0 = MSB primeiro, 1 = LSB primeiro), MSTR (1 = mestre), CPOL, CPHA e SPR1/SPR0 (divisor de clock). SPSR (SPI Status Register) tem SPIF (bit 7: "transferência concluída") e SPI2X (bit 0: dobra a velocidade). SPDR (SPI Data Register) é o byte de dados: escrever nele inicia a transmissão e, depois de concluída, ler dele devolve o byte recebido. O mestre escreve em SPDR e espera SPIF ir a 1.',
            code: 'DDRB |= (1<<PB3) | (1<<PB5) | (1<<PB2); // MOSI, SCK e SS como saída\nSPCR = (1<<SPE) | (1<<MSTR);          // SPI ligado, modo mestre\n\nuint8_t spiTroca(uint8_t b) {\n  SPDR = b;                          // começa a enviar\n  while (!(SPSR & (1<<SPIF)));       // espera terminar\n  return SPDR;                       // byte recebido no mesmo intervalo\n}'
          },
          {
            title: 'Divisor de clock e modos 0 a 3',
            body: 'O clock do SPI é derivado de F_CPU: SPR1:SPR0 = 00 divide por 4, 01 por 16, 10 por 64, 11 por 128. Com SPI2X = 1 a velocidade dobra, ou seja, os divisores viram 2, 8, 32 e 64. A 16 MHz: /4 = 4 MHz e, com SPI2X, /2 = 8 MHz. Os bits CPOL e CPHA definem o modo: CPOL é o nível do clock em repouso (0 = baixo, 1 = alto); CPHA diz em que borda o dado é amostrado (0 = na primeira borda, 1 = na segunda). Modo 0 = CPOL 0/CPHA 0; modo 1 = 0/1; modo 2 = 1/0; modo 3 = 1/1. Mestre e escravo precisam usar o mesmo modo, definido no datasheet do escravo.',
            code: '// Biblioteca: configura SPCR/SPSR por você\nSPI.beginTransaction(SPISettings(4000000, MSBFIRST, SPI_MODE0));\ndigitalWrite(10, LOW);   // seleciona o escravo\nuint8_t r = SPI.transfer(0x9F);\ndigitalWrite(10, HIGH);  // libera\nSPI.endTransaction();\n// MSBFIRST -> DORD = 0 ; LSBFIRST -> DORD = 1'
          },
          {
            title: 'O pino SS e o modo mestre',
            body: 'No ATmega328P, se o SPI está em modo mestre e o pino SS (PB2) é configurado como ENTRADA e algum circuito o puxa para nível baixo, o hardware entende que outro mestre quer assumir o barramento: ele limpa o bit MSTR e o chip passa a ser escravo. Por isso, ao usar o Uno como mestre, deixe SS (pino 10) como SAÍDA, mesmo que você use outros pinos como chip select dos escravos.'
          },
          {
            title: 'TWI (I2C): registradores e velocidade do SCL',
            body: 'O I2C do AVR se chama TWI (Two-Wire Interface): duas linhas, SDA (dados) e SCL (clock), ambas com pull-up. Registradores: TWBR (divisor de bit rate), TWSR (status nos bits altos e prescaler TWPS1:TWPS0 nos baixos; prescaler 1, 4, 16 ou 64), TWCR (controle: TWINT, TWEA, TWSTA, TWSTO, TWEN) e TWDR (byte de dados ou endereço). A frequência do SCL é: SCL = F_CPU / (16 + 2 × TWBR × prescaler). Exemplo: F_CPU = 16 MHz, prescaler 1, TWBR = 72 → 16 000 000 / (16 + 144) = 100 kHz. Para 400 kHz: TWBR = 12 → 16 000 000 / (16 + 24) = 400 kHz. A função Wire.setClock(400000) faz essa conta e grava em TWBR.',
            code: '// 100 kHz a 16 MHz, prescaler 1\nTWSR = 0;\nTWBR = 72;   // SCL = 16e6 / (16 + 2*72*1) = 100 kHz\n\n// Biblioteca equivalente:\nWire.begin();\nWire.setClock(400000);  // TWBR = 12'
          },
          {
            title: 'A sequência de uma transação I2C',
            body: 'Toda conversa segue: START (SDA cai enquanto SCL está alto) → byte de endereço (7 bits do escravo + 1 bit R/W: 0 = escrita, 1 = leitura) → ACK do escravo (ele puxa SDA para baixo no 9º pulso) → bytes de dados, cada um seguido de ACK → STOP (SDA sobe enquanto SCL está alto). Se ninguém responde ao endereço, o 9º bit fica alto: é um NACK. Um NACK também é usado pelo mestre, ao ler, para dizer "este foi o último byte que quero". Um repeated start é um novo START sem STOP antes, usado para trocar de escrita para leitura (ex.: escrever o endereço de um registrador e em seguida ler) sem soltar o barramento. Endereços de 7 bits: 0x00–0x07 e 0x78–0x7F são reservados; os usáveis vão de 0x08 a 0x77. No TWCR, o mestre dispara um START com TWINT, TWSTA e TWEN em 1; o hardware sinaliza o fim de cada etapa com TWINT.',
            code: 'TWCR = (1<<TWINT) | (1<<TWSTA) | (1<<TWEN); // START\nwhile (!(TWCR & (1<<TWINT)));               // espera concluir\nTWDR = (0x68 << 1) | 0;                     // endereço 0x68 + bit W\nTWCR = (1<<TWINT) | (1<<TWEN);              // envia\nwhile (!(TWCR & (1<<TWINT)));\n// ... dados ... depois STOP:\nTWCR = (1<<TWINT) | (1<<TWSTO) | (1<<TWEN);'
          },
          {
            title: 'Clock stretching, multi-mestre e pull-ups',
            body: 'Clock stretching: um escravo lento pode segurar SCL em baixo para pedir mais tempo; o mestre só continua quando SCL realmente sobe. Multi-mestre e arbitragem: se dois mestres começam a falar ao mesmo tempo, ambos monitoram SDA; quem escreve 1 mas lê 0 perdeu a arbitragem e se retira, sem corromper o dado do vencedor. As linhas são open-drain: dispositivos só puxam para baixo; o nível alto vem do resistor de pull-up. A subida do sinal tem forma de RC: tempo de subida ≈ R × C, onde C é a capacitância do barramento (fios, pinos, dispositivos). Quanto maior C ou R, mais lenta a subida. Em 400 kHz o tempo disponível por bit é menor, então se usa pull-up menor (por exemplo 2,2 kΩ em vez de 4,7 kΩ ou 10 kΩ) para subir mais rápido, ao custo de mais corrente quando a linha está em nível baixo.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'No SPI do AVR, o mestre escreve um byte em SPDR. O que acontece em seguida?',
          choices: [
            { id: 'a', text: 'Nada, a transmissão só começa quando SPIF é escrito com 1' },
            { id: 'b', text: 'A transmissão começa; ao terminar, SPIF vai a 1 e SPDR passa a conter o byte que o escravo enviou no mesmo intervalo' },
            { id: 'c', text: 'O byte é enviado e SPDR fica vazio até o escravo responder numa segunda transferência' },
            { id: 'd', text: 'O mestre fica sem poder receber enquanto envia, porque o SPI é meio-duplex' }
          ],
          answer: 'b',
          explanation: 'Escrever em SPDR inicia a troca. Como o SPI é full-duplex, o escravo devolve um byte ao mesmo tempo, e SPIF indica que ele já pode ser lido em SPDR.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'A 16 MHz, com SPR1:SPR0 = 01 e SPI2X = 1, qual é o clock do SPI?',
          choices: [
            { id: 'a', text: '1 MHz' },
            { id: 'b', text: '250 kHz' },
            { id: 'c', text: '4 MHz' },
            { id: 'd', text: '2 MHz' }
          ],
          answer: 'd',
          explanation: 'SPR = 01 divide por 16; SPI2X dobra a velocidade, o que equivale a dividir por 8. 16 MHz / 8 = 2 MHz.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O Uno é mestre SPI e o pino SS (10) foi deixado como entrada. Um circuito o puxa para nível baixo. Qual a consequência?',
          choices: [
            { id: 'a', text: 'O hardware limpa o bit MSTR e o ATmega328P sai do modo mestre' },
            { id: 'b', text: 'O clock SCK passa a dobrar de velocidade' },
            { id: 'c', text: 'O bit SPIF é forçado a 1 e o chip reinicia' },
            { id: 'd', text: 'Nada, SS só é usado por escravos' }
          ],
          answer: 'a',
          explanation: 'SS em nível baixo, como entrada, indica que outro mestre quer o barramento; por isso SS deve ser configurado como saída no mestre.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o comando que inicia uma transação I2C (START) pelo TWCR:',
          code: 'TWCR = (1<<TWINT) | (1<<___) | (1<<TWEN);',
          accept: ['TWSTA'],
          explanation: 'TWSTA (TWI Start Condition) pede ao hardware que gere a condição de START; TWINT limpa o flag e TWEN mantém o TWI habilitado.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que a chamada SPI.beginTransaction(SPISettings(4000000, LSBFIRST, SPI_MODE3)) configura?',
          choices: [
            { id: 'a', text: '4 MHz, DORD = 0, CPOL = 0 e CPHA = 0' },
            { id: 'b', text: '4 MHz, DORD = 1, CPOL = 1 e CPHA = 0' },
            { id: 'c', text: '4 MHz, DORD = 1, CPOL = 1 e CPHA = 1' },
            { id: 'd', text: '4 MHz, DORD = 0, CPOL = 1 e CPHA = 1' }
          ],
          answer: 'c',
          explanation: 'LSBFIRST liga DORD (LSB primeiro). O modo 3 corresponde a CPOL = 1 (clock em repouso alto) e CPHA = 1 (amostra na segunda borda). 16 MHz / 4 = 4 MHz.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Com F_CPU = 16 MHz, prescaler 1 e TWBR = 32, qual a frequência do SCL?',
          choices: [
            { id: 'a', text: 'Cerca de 400 kHz' },
            { id: 'b', text: 'Cerca de 100 kHz' },
            { id: 'c', text: 'Cerca de 200 kHz' },
            { id: 'd', text: 'Cerca de 50 kHz' }
          ],
          answer: 'c',
          explanation: 'SCL = 16 000 000 / (16 + 2 × 32 × 1) = 16 000 000 / 80 = 200 kHz.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual das afirmações sobre o barramento I2C é correta?',
          choices: [
            { id: 'a', text: 'Um NACK no 9º bit após o endereço indica que nenhum escravo reconheceu aquele endereço' },
            { id: 'b', text: 'Pull-ups maiores deixam o barramento mais rápido, porque limitam a corrente' },
            { id: 'c', text: 'Os endereços de 0x78 a 0x7F são os mais indicados para sensores, por serem livres' },
            { id: 'd', text: 'No clock stretching, o mestre segura SCL em baixo para frear o escravo' }
          ],
          answer: 'a',
          explanation: 'NACK após o endereço = ninguém respondeu. Pull-up menor acelera a subida (RC menor), os endereços 0x00–0x07 e 0x78–0x7F são reservados, e quem faz o stretching é o escravo.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a chamada que ajusta o I2C da biblioteca para 400 kHz (modo rápido):',
          code: 'Wire.setClock(___);',
          accept: ['400000', '400000L', '400000UL'],
          explanation: 'Wire.setClock(400000) grava em TWBR o valor 12 (a 16 MHz, prescaler 1), resultando em SCL = 400 kHz.'
        }
      ]
    },
    {
      id: 'ara-27-barramentos-industriais',
      title: 'Barramentos robustos: RS-485, Modbus RTU, CAN e 1-Wire',
      goal: 'Escolher e entender barramentos para longas distâncias, ruído e muitos dispositivos: RS-485 com MAX485, Modbus RTU, CAN e 1-Wire.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Por que UART/TTL não basta',
            body: 'A UART em nível TTL (0 V / 5 V) funciona bem entre dois dispositivos a poucos metros. Em cabos longos, perto de motores, inversores e relés, o ruído elétrico se soma ao sinal e a diferença de potencial entre os GNDs distorce os níveis, gerando bytes corrompidos. Barramentos industriais resolvem isso com sinalização diferencial, cabos trançados e protocolos com verificação de erro. Panorama que vamos montar: UART (2 dispositivos, curta distância), SPI (placa, vários escravos com 1 CS cada, rápido), I2C (placa, muitos dispositivos, 2 fios), RS-485 (centenas de metros, até 32 nós clássicos), CAN (multimestre, robusto) e 1-Wire (1 fio de dados, lento).'
          },
          {
            title: 'RS-485: sinalização diferencial',
            body: 'O RS-485 usa um par de fios, A e B. Quem transmite coloca uma tensão diferencial entre A e B (por exemplo A − B positivo = nível 1, negativo = nível 0); o receptor olha apenas a DIFERENÇA entre as linhas. O ruído externo tende a atingir os dois fios do par trançado por igual, então a diferença quase não muda: é isso que dá imunidade a ruído. Distância típica: até cerca de 1200 m em baixas taxas (como 9600 baud); em taxas altas cai bastante. É um barramento (topologia linear com vários nós ligados ao mesmo par), meio-duplex: só um nó transmite por vez. Nas duas pontas do cabo entra um resistor de terminação de 120 Ω entre A e B (casa a impedância do cabo e evita reflexões); resistores de polarização (bias) mantêm um nível definido quando ninguém transmite.'
          },
          {
            title: 'MAX485: controlando a direção pelo firmware',
            body: 'O módulo MAX485 liga a UART do Arduino ao par A/B. Pinos: DI (entrada de dados: vem do TX), RO (saída de dados: vai para o RX), DE (Driver Enable, ativo em nível alto) e RE (Receiver Enable, ativo em nível baixo). É comum ligar DE e RE juntos em um único pino: nível ALTO = transmitindo, nível BAIXO = recebendo. Como é meio-duplex, o firmware precisa alternar a direção. O ponto crítico: Serial.write() só coloca os bytes no buffer; é preciso esperar a saída terminar com Serial.flush() antes de voltar para recepção, senão o último byte é cortado.',
            code: 'const uint8_t DE_RE = 2;\n\nvoid enviar(const uint8_t* q, size_t n) {\n  digitalWrite(DE_RE, HIGH);  // transmitir\n  Serial.write(q, n);\n  Serial.flush();             // espera o último bit sair\n  digitalWrite(DE_RE, LOW);   // volta a escutar\n}'
          },
          {
            title: 'Modbus RTU: o quadro',
            body: 'Modbus RTU é um protocolo mestre/escravo muito usado sobre RS-485 (CLPs, inversores, medidores). Só o mestre inicia a conversa; cada escravo tem um endereço de 1 a 247. O quadro tem: [endereço do escravo, 1 byte][código de função, 1 byte][dados][CRC-16, 2 bytes, byte baixo primeiro]. Exemplo, o mestre pede ao escravo 1 que leia 2 registradores a partir do endereço 0: 01 03 00 00 00 02 C4 0B. Aqui 01 = escravo, 03 = função "ler holding registers", 00 00 = endereço inicial, 00 02 = quantidade, C4 0B = CRC-16. Outra função comum: 0x06 = escrever um único registrador. O CRC-16 permite ao receptor descartar quadros corrompidos.'
          },
          {
            title: 'Modbus: registradores, bobinas e silêncio',
            body: 'O Modbus modela os dados do escravo como: registradores de 16 bits (holding registers, que podem ser lidos e escritos, como "setpoint de temperatura") e bobinas (coils, bits individuais ligar/desligar, como um relé). No RTU não há caractere de início ou fim de quadro: um quadro termina quando a linha fica em silêncio por pelo menos 3,5 tempos de caractere. Um caractere RTU usa 11 bits (start + 8 dados + paridade + stop; ou 2 stops sem paridade). A 9600 baud, 1 caractere = 11 / 9600 ≈ 1,146 ms, então 3,5 caracteres ≈ 4 ms. Em baud altos (acima de 19200) a norma fixa 1,75 ms. Bibliotecas Modbus cuidam dessas temporizações, mas é por isso que um delay() no meio do quadro quebra a comunicação.'
          },
          {
            title: 'CAN: multimestre com prioridade',
            body: 'O CAN (Controller Area Network), nascido na indústria automotiva, também usa par diferencial (CAN_H e CAN_L) com terminação de 120 Ω nas pontas, mas funciona de outro jeito: não há endereço de destino; cada mensagem tem um IDENTIFICADOR (11 bits no formato padrão) que diz o QUE ela é, e todos os nós a recebem. Qualquer nó pode transmitir (multimestre). Se dois começam juntos, ocorre arbitragem bit a bit: o bit 0 é dominante e vence o 1, então o menor identificador ganha, sem perda de tempo nem corrupção. Por isso o ID também é a prioridade. O CAN clássico carrega até 8 bytes de dados por mensagem, com CRC e confirmação. Taxa típica: 500 kbit/s (máximo 1 Mbit/s). No Arduino Uno usa-se o controlador MCP2515 (fala SPI com o Arduino) mais um transceptor (como o TJA1050) que gera o sinal diferencial.'
          },
          {
            title: '1-Wire e a comparação final',
            body: '1-Wire (Dallas/Maxim): um único fio de dados mais GND, com um resistor de pull-up de 4,7 kΩ ligado a VCC (o dispositivo só puxa para baixo). Cada dispositivo vem de fábrica com um endereço ROM único de 64 bits, e o mestre usa esse endereço para falar com um específico entre vários no mesmo fio. O sensor de temperatura DS18B20 é o exemplo clássico; a biblioteca OneWire implementa o protocolo por temporização em software. É lento (da ordem de 16 kbit/s), mas muito econômico em fios. Comparação: SPI = muito rápido, poucos cm, 4 fios + 1 CS por escravo. I2C = 100–400 kHz, poucos metros, 2 fios, muitos dispositivos por endereço. UART = 2 nós, 2 fios. RS-485 = até ~1200 m, dezenas de nós, par trançado, meio-duplex. CAN = até 1 Mbit/s em curto, dezenas de nós, multimestre. 1-Wire = lento, dezenas de metros, 1 fio de dados + GND.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Por que a sinalização diferencial do RS-485 resiste melhor a ruído que o TTL?',
          choices: [
            { id: 'a', text: 'Porque usa tensões muito maiores, que o ruído nunca alcança' },
            { id: 'b', text: 'Porque o ruído atinge os dois fios do par por igual e o receptor olha só a diferença A − B' },
            { id: 'c', text: 'Porque cada nó tem seu próprio GND isolado, eliminando o ruído' },
            { id: 'd', text: 'Porque transmite os bits em paralelo, e uma falha em um fio não importa' }
          ],
          answer: 'b',
          explanation: 'O ruído de modo comum soma-se igualmente em A e B, então a diferença entre eles quase não muda.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Num MAX485 com DE e RE ligados juntos ao pino 2, qual nível deve ser colocado nesse pino para o Arduino transmitir?',
          choices: [
            { id: 'a', text: 'LOW, porque RE é ativo em nível baixo e isso habilita o driver' },
            { id: 'b', text: 'Qualquer um, a direção é automática' },
            { id: 'c', text: 'HIGH, porque DE é ativo em nível alto (e isso desabilita o receptor)' },
            { id: 'd', text: 'Alternando HIGH/LOW a cada byte' }
          ],
          answer: 'c',
          explanation: 'DE alto habilita o driver (transmissão); RE alto desabilita o receptor. LOW coloca o MAX485 em recepção.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Onde ficam os resistores de terminação de 120 Ω num barramento RS-485 com 6 nós em linha?',
          choices: [
            { id: 'a', text: 'Um em cada extremidade do cabo, entre A e B' },
            { id: 'b', text: 'Um em cada nó, entre A e GND' },
            { id: 'c', text: 'Só no mestre, entre B e VCC' },
            { id: 'd', text: 'Seis em paralelo, um por nó, entre A e B' }
          ],
          answer: 'a',
          explanation: 'A terminação casa a impedância do cabo apenas nas duas pontas do barramento, evitando reflexões. Nós intermediários não levam terminação.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete para só inverter a direção depois que o último byte saiu do hardware:',
          code: 'digitalWrite(DE_RE, HIGH);\nSerial.write(quadro, n);\nSerial.___();\ndigitalWrite(DE_RE, LOW);',
          accept: ['flush'],
          explanation: 'Serial.flush() espera o buffer de saída esvaziar e o último bit ser transmitido; sem isso, DE_RE cairia antes do fim do quadro.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que significa o quadro Modbus RTU 01 03 00 00 00 02 C4 0B enviado pelo mestre?',
          choices: [
            { id: 'a', text: 'Escreva o valor 2 no registrador 0 do escravo 3' },
            { id: 'b', text: 'Escravo 3, ler 1 registrador a partir do endereço 2' },
            { id: 'c', text: 'Resposta do escravo 1 com 2 registradores, sem CRC' },
            { id: 'd', text: 'Escravo 1, função 0x03 (ler holding registers), a partir do endereço 0, quantidade 2, com CRC-16 nos dois últimos bytes' }
          ],
          answer: 'd',
          explanation: 'Os campos são: endereço do escravo (01), função (03), endereço inicial (00 00), quantidade (00 02) e CRC-16 (C4 0B).'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Dois nós CAN começam a transmitir ao mesmo tempo, um com ID 0x100 e outro com ID 0x200. O que acontece?',
          choices: [
            { id: 'a', text: 'As duas mensagens colidem e ambas são perdidas' },
            { id: 'b', text: 'Vence o maior ID, porque tem mais bits 1' },
            { id: 'c', text: 'O ID 0x100 vence na arbitragem (bit 0 é dominante) e o outro tenta de novo depois, sem corromper a mensagem vencedora' },
            { id: 'd', text: 'O mestre do barramento decide quem fala primeiro' }
          ],
          answer: 'c',
          explanation: 'No CAN, o bit 0 é dominante, então o menor identificador (maior prioridade) vence. Não há mestre central: o CAN é multimestre.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual barramento tem UM fio de dados (mais GND), pull-up de 4,7 kΩ e endereço ROM único de 64 bits por dispositivo?',
          choices: [
            { id: 'a', text: '1-Wire (como o do sensor DS18B20)' },
            { id: 'b', text: 'I2C' },
            { id: 'c', text: 'SPI' },
            { id: 'd', text: 'CAN' }
          ],
          answer: 'a',
          explanation: 'O 1-Wire usa um único fio de dados e identifica cada dispositivo pelo ROM de 64 bits. I2C tem dois fios e endereço de 7 bits; SPI usa 4 fios; CAN usa par diferencial.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'A 9600 baud, com 11 bits por caractere, o silêncio de 3,5 caracteres do Modbus RTU dura aproximadamente quantos milissegundos (número inteiro)?',
          code: '// 3,5 × 11 / 9600 s ≈ ___ ms',
          accept: ['4', '4 ms', '4,0', '4.0', '4,01', '4.01'],
          explanation: '3,5 × 11 = 38,5 bits; 38,5 / 9600 ≈ 0,00401 s, ou seja, cerca de 4 ms.'
        }
      ]
    },
    {
      id: 'ara-10-maquinas-estado',
      title: 'Máquinas de estado finitas',
      goal: 'Organizar o firmware como máquina de estados não bloqueante, com enum, switch, transições por eventos e tabela de estados.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O que é uma máquina de estados',
            body: 'Uma FSM (máquina de estados finita) tem um conjunto finito de estados, eventos e transições: em cada instante só UM estado está ativo, e um evento (botão apertado, tempo esgotado, leitura de sensor) pode levar a outro estado. Em vez de flags soltas e if/else aninhados, o comportamento fica explícito. Num menu com botões, cada estado é uma tela/opção e cada evento é um botão; num alarme, os estados são DESARMADO, ARMADO e DISPARADO.'
          },
          {
            title: 'enum + switch',
            body: 'O padrão em C/C++: um enum nomeia os estados, uma variável guarda o estado atual e um switch no loop() executa o código do estado ativo. Cada case DEVE terminar em break; sem ele a execução "cai" no case seguinte (fall-through) e roda código do estado errado.',
            code: 'enum Estado { PARADO, LIGADO, ERRO };\nEstado estado = PARADO;\n\nvoid loop() {\n  switch (estado) {\n    case PARADO:\n      if (botaoApertado()) estado = LIGADO;\n      break;\n    case LIGADO:\n      if (falhaDetectada()) estado = ERRO;\n      break;\n    case ERRO:\n      break;\n  }\n}'
          },
          {
            title: 'Ação de entrada e transições por tempo',
            body: 'Muitas vezes é preciso executar algo UMA vez ao entrar no estado (acender um LED, zerar um contador) e medir quanto tempo já se passou nele. Centralize isso numa função de transição que troca o estado e anota millis() em tEntrada. A transição por tempo vira: millis() − tEntrada ≥ duração. Nunca use delay() dentro de um estado: ele congelaria a leitura de todos os outros eventos.'
          },
          {
            title: 'FSM não bloqueante: o semáforo',
            body: 'Exemplo clássico: vermelho 5 s, verde 4 s, amarelo 1 s, sem delay. O loop gira milhares de vezes por segundo, só testando o tempo, e continua livre para ler botões e sensores. O ciclo completo dura 5 + 4 + 1 = 10 s.',
            code: 'enum Estado { VERMELHO, VERDE, AMARELO };\nEstado estado = VERMELHO;\nunsigned long tEntrada = 0;\n\nvoid mudarPara(Estado novo) {\n  estado = novo;\n  tEntrada = millis();   // ação de entrada: marca a hora\n  // ... acende o LED do novo estado\n}\n\nvoid loop() {\n  unsigned long agora = millis();\n  switch (estado) {\n    case VERMELHO:\n      if (agora - tEntrada >= 5000) mudarPara(VERDE);\n      break;\n    case VERDE:\n      if (agora - tEntrada >= 4000) mudarPara(AMARELO);\n      break;\n    case AMARELO:\n      if (agora - tEntrada >= 1000) mudarPara(VERMELHO);\n      break;\n  }\n}'
          },
          {
            title: 'Tabela de estados',
            body: 'Quando os estados só diferem por dados (duração, saída, próximo estado), uma tabela substitui o switch: cada linha descreve um estado. Adicionar um estado vira adicionar uma linha, sem mexer na lógica. Uma struct agrupa os campos de cada linha. Para economizar SRAM, a tabela pode ser const (e até PROGMEM).',
            code: 'struct Etapa {\n  uint8_t  leds;      // máscara de LEDs acesos\n  uint16_t ms;        // duração\n  uint8_t  proximo;   // índice do próximo estado\n};\nconst Etapa tabela[] = {\n  { 0b001, 5000, 1 },   // 0: vermelho\n  { 0b100, 4000, 2 },   // 1: verde\n  { 0b010, 1000, 0 }    // 2: amarelo\n};\nuint8_t atual = 0;\n\nif (millis() - tEntrada >= tabela[atual].ms) {\n  atual = tabela[atual].proximo;\n  tEntrada = millis();\n}'
          },
          {
            title: 'Boas práticas',
            body: 'Desenhe o diagrama de estados antes de codar (círculos = estados, setas = eventos). Dê nomes claros no enum. Trate sempre os estados impossíveis (default no switch levando a um estado seguro). Mantenha cada case curto e sem bloqueio, e teste cada transição, inclusive as erradas (botão apertado no estado errado).'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Num menu controlado por uma FSM, o que normalmente representam estado e evento?',
          choices: [
            { id: 'a', text: 'Estado = tela/opção atual; evento = botão apertado' },
            { id: 'b', text: 'Estado = botão apertado; evento = tela atual' },
            { id: 'c', text: 'Estado = valor lido do ADC; evento = baud rate' },
            { id: 'd', text: 'Estado e evento são a mesma coisa' }
          ],
          answer: 'a',
          explanation: 'Em cada instante só um estado (tela) está ativo; eventos como botões causam as transições.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Por que não usar delay() dentro de um estado de uma FSM?',
          choices: [
            { id: 'a', text: 'Faz o enum perder seus valores' },
            { id: 'b', text: 'Aumenta o consumo de Flash em 32 KB' },
            { id: 'c', text: 'Bloqueia o loop e impede de reagir aos outros eventos durante a espera' },
            { id: 'd', text: 'delay() não funciona dentro de switch' }
          ],
          answer: 'c',
          explanation: 'Use millis() para medir o tempo no estado e mantenha o loop livre.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que acontece se um case do switch não terminar com break?',
          choices: [
            { id: 'a', text: 'O programa reinicia' },
            { id: 'b', text: 'O estado volta a ser o primeiro do enum' },
            { id: 'c', text: 'A execução continua no case seguinte (fall-through)' },
            { id: 'd', text: 'O compilador insere o break automaticamente' }
          ],
          answer: 'c',
          explanation: 'Sem break o código do case seguinte também roda, um erro clássico em FSMs.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a instrução que escolhe o código do estado atual:',
          code: '___ (estado) {\n  case PARADO:  /* ... */ break;\n  case LIGADO:  /* ... */ break;\n}',
          accept: ['switch'],
          explanation: 'switch (estado) seleciona o case correspondente ao estado ativo.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'No semáforo do exemplo (vermelho 5000 ms, verde 4000 ms, amarelo 1000 ms), quanto dura um ciclo completo?',
          choices: [
            { id: 'a', text: '10 s' },
            { id: 'b', text: '5 s' },
            { id: 'c', text: '9 s' },
            { id: 'd', text: '4 s' }
          ],
          answer: 'a',
          explanation: '5 + 4 + 1 = 10 segundos.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Para que serve gravar millis() em tEntrada ao mudar de estado?',
          choices: [
            { id: 'a', text: 'Para zerar o Timer0' },
            { id: 'b', text: 'Para pausar o programa até o próximo estado' },
            { id: 'c', text: 'Para guardar o estado anterior na EEPROM' },
            { id: 'd', text: 'Para medir há quanto tempo o estado atual está ativo (millis() − tEntrada)' }
          ],
          answer: 'd',
          explanation: 'A transição por tempo compara millis() − tEntrada com a duração do estado.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual a vantagem de uma tabela de estados em relação a um switch grande?',
          choices: [
            { id: 'a', text: 'Permite usar delay() com segurança' },
            { id: 'b', text: 'O comportamento fica nos dados: novo estado = nova linha, sem mexer na lógica' },
            { id: 'c', text: 'A tabela roda mais rápido que qualquer switch' },
            { id: 'd', text: 'Elimina a necessidade de variáveis de estado' }
          ],
          answer: 'b',
          explanation: 'A lógica fica genérica; a tabela descreve duração, saída e próximo estado.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a palavra-chave que agrupa os campos de cada linha da tabela de estados:',
          code: '___ Etapa {\n  uint16_t ms;\n  uint8_t proximo;\n};',
          accept: ['struct'],
          explanation: 'struct agrupa os campos de cada etapa da tabela.'
        }
      ]
    },
    {
      id: 'ara-11-classes',
      title: 'Classes em C++ no Arduino e sua própria biblioteca',
      goal: 'Criar classes com construtor e encapsulamento, separar em .h/.cpp e organizar uma biblioteca do Arduino.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Por que classes',
            body: 'O Arduino é programado em C++, e objetos como Serial, Servo e LiquidCrystal são instâncias de classes. Uma classe é o molde (tipo) que agrupa dados e as funções que operam sobre eles; um objeto é uma instância concreta desse molde, com seus próprios valores. Com classes, "um LED no pino 7" e "outro no pino 8" viram dois objetos do mesmo tipo, sem variáveis soltas repetidas.'
          },
          {
            title: 'Anatomia e encapsulamento',
            body: 'Dentro da classe, public: lista o que o resto do programa pode usar (a interface) e private: guarda os detalhes internos, inacessíveis de fora. Isso é encapsulamento: quem usa a classe não depende de como ela funciona por dentro, e não pode quebrar o estado interno sem querer. Funções declaradas dentro da classe chamam-se métodos.',
            code: 'class Led {\n public:\n  Led(uint8_t pino);\n  void begin();\n  void ligar();\n  void desligar();\n  void alternar();\n private:\n  uint8_t _pino;\n  bool _ligado;\n};'
          },
          {
            title: 'Construtor e lista de inicialização',
            body: 'O construtor é um método com o MESMO nome da classe e sem tipo de retorno; roda automaticamente quando o objeto é criado. A lista de inicialização (depois dos dois pontos) atribui os membros de forma eficiente, antes do corpo. Cada objeto criado chama o construtor com seus próprios argumentos.',
            code: 'Led::Led(uint8_t pino) : _pino(pino), _ligado(false) {}\n\nLed vermelho(7);   // objeto no pino 7\nLed verde(8);      // outro objeto, pino 8'
          },
          {
            title: 'Separando em .h e .cpp',
            body: 'O arquivo .h (cabeçalho) traz a declaração da classe; o .cpp traz a implementação dos métodos, escritos com o operador de escopo ::, que diz a qual classe o método pertence (Led::ligar). O cabeçalho precisa de proteção contra inclusão múltipla — #pragma once ou o trio #ifndef / #define / #endif — senão a classe seria definida duas vezes quando vários arquivos o incluem. Arquivos locais usam aspas: #include "Led.h".',
            code: '// Led.h\n#pragma once\n#include <Arduino.h>\nclass Led { /* declaração */ };\n\n// Led.cpp\n#include "Led.h"\nvoid Led::ligar() {\n  _ligado = true;\n  digitalWrite(_pino, HIGH);\n}'
          },
          {
            title: 'O padrão begin(): cuidado com o construtor',
            body: 'Objetos globais são construídos ANTES de main(), portanto antes de o core do Arduino inicializar timers e periféricos. Por isso o construtor só deve guardar parâmetros; chamadas de hardware (pinMode, Serial.begin, Wire.begin) vão num método begin() chamado dentro de setup(). Todas as bibliotecas do Arduino seguem esse padrão.',
            code: 'void Led::begin() {\n  pinMode(_pino, OUTPUT);   // hardware só aqui\n}\n\nLed vermelho(7);\nvoid setup() { vermelho.begin(); }'
          },
          {
            title: 'Estrutura de uma biblioteca',
            body: 'Para virar biblioteca, coloque na pasta libraries/ do sketchbook uma pasta com o nome dela contendo: src/ (os .h e .cpp), library.properties (nome, versão, autor, descrição), examples/ (sketches de demonstração) e, opcionalmente, keywords.txt (destaque de palavras na IDE). Depois basta #include <Led.h>. Reaproveitar uma biblioteca testada em vários projetos poupa bugs.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que é encapsulamento?',
          choices: [
            { id: 'a', text: 'Proibir qualquer acesso aos dados da classe' },
            { id: 'b', text: 'Esconder os detalhes internos (private) e expor só uma interface pública' },
            { id: 'c', text: 'Compilar o código em um único arquivo' },
            { id: 'd', text: 'Guardar objetos na EEPROM' }
          ],
          answer: 'b',
          explanation: 'Com private e public, quem usa a classe só depende da interface, não do funcionamento interno.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual é uma característica do construtor de uma classe?',
          choices: [
            { id: 'a', text: 'Precisa ser chamado manualmente dentro do setup()' },
            { id: 'b', text: 'Retorna sempre um bool' },
            { id: 'c', text: 'Só pode existir um objeto por classe' },
            { id: 'd', text: 'Tem o mesmo nome da classe, não tem tipo de retorno e roda ao criar o objeto' }
          ],
          answer: 'd',
          explanation: 'O construtor é chamado automaticamente na criação do objeto, com o nome da classe e sem retorno.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Para que serve #pragma once (ou #ifndef/#define/#endif) num .h?',
          choices: [
            { id: 'a', text: 'Impedir que o cabeçalho seja incluído mais de uma vez e defina a classe duas vezes' },
            { id: 'b', text: 'Fazer o código rodar uma só vez no setup()' },
            { id: 'c', text: 'Gravar o cabeçalho na Flash' },
            { id: 'd', text: 'Tornar a classe privada' }
          ],
          answer: 'a',
          explanation: 'É a proteção contra inclusão múltipla (include guard).'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a palavra-chave que esconde os membros internos da classe:',
          code: 'class Led {\n public:\n  void ligar();\n ___:\n  uint8_t _pino;\n};',
          accept: ['private'],
          explanation: 'Membros após private: só são acessíveis dentro da própria classe.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Por que o pinMode() deve ficar num método begin() e não no construtor de um objeto global?',
          choices: [
            { id: 'a', text: 'Porque o construtor roda uma vez por segundo' },
            { id: 'b', text: 'Porque o begin() economiza SRAM' },
            { id: 'c', text: 'Objetos globais são construídos antes de o core inicializar o hardware; o begin() roda no setup()' },
            { id: 'd', text: 'Porque pinMode só funciona dentro de classes' }
          ],
          answer: 'c',
          explanation: 'O construtor global roda antes de main(); o hardware só está pronto a partir do setup().'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual a diferença entre classe e objeto?',
          choices: [
            { id: 'a', text: 'São sinônimos' },
            { id: 'b', text: 'Objeto é o molde; classe é a instância' },
            { id: 'c', text: 'Classe é o molde (tipo); objeto é uma instância dele, com valores próprios' },
            { id: 'd', text: 'Classe é uma variável; objeto é uma função' }
          ],
          answer: 'c',
          explanation: 'Led é a classe; vermelho e verde são objetos distintos do tipo Led.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Em uma biblioteca no formato do Arduino, onde ficam os arquivos .h e .cpp?',
          choices: [
            { id: 'a', text: 'Na pasta src/ da biblioteca' },
            { id: 'b', text: 'Na pasta examples/' },
            { id: 'c', text: 'Dentro do library.properties' },
            { id: 'd', text: 'Na pasta do bootloader' }
          ],
          answer: 'a',
          explanation: 'src/ guarda o código; examples/ guarda sketches; library.properties descreve a biblioteca.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o operador de escopo usado para definir um método de Led no .cpp:',
          code: 'void Led___ligar() {\n  digitalWrite(_pino, HIGH);\n}',
          accept: ['::'],
          explanation: 'O operador :: indica a qual classe o método pertence (Led::ligar).'
        }
      ]
    },
    {
      id: 'ara-12-cpp-embarcado',
      title: 'C++ para embarcados: const, static, sem new/malloc e templates',
      goal: 'Usar const e static corretamente, evitar alocação dinâmica em AVR e entender templates em visão geral.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'const em vez de #define',
            body: 'const (ou constexpr) cria uma constante com tipo e escopo, verificada pelo compilador; #define é apenas substituição de texto, sem tipo, e pode causar surpresas. Use const para pinos, limites e tempos. Constantes simples não ocupam SRAM: o compilador as embute no código.',
            code: 'const uint8_t PINO_LED = 13;       // preferível\nconstexpr uint16_t TIMEOUT_MS = 500;\n#define PINO_LED 13                // sem tipo, evite'
          },
          {
            title: 'const em métodos e parâmetros',
            body: 'Um método marcado const depois da lista de parâmetros promete não alterar o objeto; o compilador recusa qualquer escrita nos membros. Um parâmetro const T& passa o objeto por referência (sem copiar) e sem permitir alterá-lo — importante em AVR, onde copiar structs grandes custa tempo e pilha.',
            code: 'class Sensor {\n public:\n  uint16_t ultimo() const { return _valor; }   // não altera nada\n private:\n  uint16_t _valor = 0;\n};\n\nvoid imprimir(const Sensor &s) {   // sem cópia, sem alterar\n  Serial.println(s.ultimo());\n}'
          },
          {
            title: 'Os usos de static',
            body: 'Em C++ static tem três usos comuns: (1) variável local static mantém o valor entre chamadas da função e é inicializada uma única vez; (2) membro static de classe é UM só para todos os objetos (ex.: contar quantos foram criados); (3) variável ou função global static é visível apenas no arquivo onde foi declarada.',
            code: 'void contar() {\n  static uint8_t n = 0;   // inicia uma vez, mantém o valor\n  n++;\n}\n\nclass Sensor {\n public:\n  Sensor() { total++; }\n  static uint8_t total;   // um só, compartilhado\n};\nuint8_t Sensor::total = 0;'
          },
          {
            title: 'Evite new, delete e malloc em AVR',
            body: 'Com 2 KB de SRAM, alocação dinâmica traz fragmentação do heap, falhas de alocação (devolve nullptr/NULL) que aparecem só depois de horas e comportamento difícil de reproduzir; o AVR também não tem exceções para sinalizar o erro. Alternativa profissional: objetos globais ou estáticos de tamanho conhecido na compilação, arrays de tamanho fixo e passagem por referência. Assim o compilador reporta o uso real de SRAM.',
            code: 'Led* l = new Led(7);   // evite: heap, fragmenta\nLed led(7);             // global: tamanho fixo, previsível'
          },
          {
            title: 'Composição e referências',
            body: 'Em vez de herança complicada, prefira composição: uma classe contém objetos de outras como membros (um Termostato tem um Sensor e um Rele). Para a classe usar um objeto que é de outro lugar, guarde uma referência ou um ponteiro (sem alocar nada) recebida no construtor. Isso mantém tudo estático e testável.'
          },
          {
            title: 'Templates: visão geral',
            body: 'Um template escreve o código uma única vez para qualquer tipo (ou tamanho) e o compilador gera uma versão específica para cada uso, em tempo de compilação — sem custo de execução e sem alocação dinâmica, mas gerando mais Flash se muitos tipos diferentes forem usados. É assim que se faz uma fila genérica de capacidade fixa.',
            code: 'template <typename T, uint8_t N>\nclass Fila {\n public:\n  bool push(T v) {\n    if (_n == N) return false;\n    _buf[(_ini + _n) % N] = v;\n    _n++;\n    return true;\n  }\n private:\n  T _buf[N];\n  uint8_t _ini = 0, _n = 0;\n};\nFila<int, 8> leituras;   // 8 ints, alocados estaticamente'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual a vantagem de const uint8_t PINO = 13; sobre #define PINO 13?',
          choices: [
            { id: 'a', text: 'Ocupa menos Flash sempre' },
            { id: 'b', text: 'Pode ser alterada em tempo de execução' },
            { id: 'c', text: 'Funciona só em AVR' },
            { id: 'd', text: 'Tem tipo e escopo, verificados pelo compilador' }
          ],
          answer: 'd',
          explanation: '#define é texto sem tipo; const tem tipo e respeita escopo.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que significa declarar um método como uint16_t ultimo() const?',
          choices: [
            { id: 'a', text: 'É guardado na Flash automaticamente' },
            { id: 'b', text: 'Ele promete não alterar os membros do objeto' },
            { id: 'c', text: 'Ele retorna sempre a mesma constante' },
            { id: 'd', text: 'Só pode ser chamado uma vez' }
          ],
          answer: 'b',
          explanation: 'O compilador recusa qualquer tentativa de escrever nos membros dentro de um método const.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que faz uma variável local declarada como static uint8_t n = 0; dentro de uma função?',
          choices: [
            { id: 'a', text: 'Vira variável global visível em todos os arquivos' },
            { id: 'b', text: 'Mantém o valor entre chamadas e é inicializada uma única vez' },
            { id: 'c', text: 'É recriada com zero a cada chamada' },
            { id: 'd', text: 'Fica na pilha e é apagada ao sair' }
          ],
          answer: 'b',
          explanation: 'static local persiste entre chamadas (fica na área de globais, não na pilha).'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a palavra-chave para que a variável mantenha o valor entre chamadas:',
          code: 'void contar() {\n  ___ uint8_t n = 0;\n  n++;\n}',
          accept: ['static'],
          explanation: 'static dentro da função preserva o valor entre as chamadas.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'A classe Sensor tem static uint8_t total; incrementado no construtor. Após criar 3 objetos Sensor, quanto vale Sensor::total?',
          choices: [
            { id: 'a', text: '1' },
            { id: 'b', text: '0' },
            { id: 'c', text: '9' },
            { id: 'd', text: '3' }
          ],
          answer: 'd',
          explanation: 'O membro static é único e compartilhado: cada construção soma 1, totalizando 3.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Por que evitar new/malloc em AVR com 2 KB de SRAM?',
          choices: [
            { id: 'a', text: 'Fragmenta o heap e pode falhar só depois de horas, difícil de reproduzir' },
            { id: 'b', text: 'Eles não existem no compilador do Arduino' },
            { id: 'c', text: 'Gravam os dados na Flash e a desgastam' },
            { id: 'd', text: 'Desligam o Timer0' }
          ],
          answer: 'a',
          explanation: 'Prefira objetos estáticos e arrays fixos: o uso de SRAM fica conhecido na compilação.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'O que um template como Fila<int, 8> faz?',
          choices: [
            { id: 'a', text: 'Interpreta o tipo só quando o programa roda' },
            { id: 'b', text: 'Move a fila para a EEPROM' },
            { id: 'c', text: 'O compilador gera, em tempo de compilação, uma versão da classe para aquele tipo e tamanho' },
            { id: 'd', text: 'Aloca a fila no heap em tempo de execução' }
          ],
          answer: 'c',
          explanation: 'Templates são resolvidos na compilação; cada combinação de parâmetros gera código próprio.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a palavra que torna o parâmetro uma referência somente leitura, sem cópia:',
          code: 'void imprimir(___ Sensor &s) {\n  Serial.println(s.ultimo());\n}',
          accept: ['const'],
          explanation: 'const T& evita a cópia e impede alterar o objeto.'
        }
      ]
    },
    {
      id: 'ara-13-escalonamento-rtos',
      title: 'Escalonamento cooperativo e conceitos de RTOS',
      goal: 'Organizar várias tarefas periódicas num escalonador cooperativo e entender tarefas, filas, semáforos, mutex e inversão de prioridade em um RTOS como o FreeRTOS.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O superlaço e seu limite',
            body: 'O sketch típico é um superlaço (super loop): tudo roda dentro de loop(), um passo após o outro. É simples, mas qualquer função lenta (ou um delay) atrasa TODAS as outras: ler um sensor a cada 100 ms e piscar um LED a cada 500 ms deixa de ser garantido se alguma tarefa demorar. Escalonar significa decidir quem roda e quando.'
          },
          {
            title: 'Escalonador cooperativo por tabela',
            body: 'Uma solução leve: uma tabela de tarefas, cada uma com função, período e instante da última execução. A cada volta do loop, para cada tarefa, se millis() − ultima ≥ periodo, ela roda e atualiza ultima. Não há delay, e cada tarefa é apenas uma função curta.',
            code: 'struct Tarefa {\n  void (*funcao)();\n  unsigned long periodo;\n  unsigned long ultima;\n};\nTarefa tarefas[] = {\n  { lerSensor, 100, 0 },\n  { piscarLed, 500, 0 }\n};\nconst uint8_t N = sizeof(tarefas) / sizeof(tarefas[0]);\n\nvoid loop() {\n  unsigned long agora = millis();\n  for (uint8_t i = 0; i < N; i++) {\n    if (agora - tarefas[i].ultima >= tarefas[i].periodo) {\n      tarefas[i].ultima = agora;\n      tarefas[i].funcao();\n    }\n  }\n}'
          },
          {
            title: 'Cooperativo: vantagens e limites',
            body: 'É cooperativo porque cada tarefa roda até o fim e devolve o controle por vontade própria: ninguém a interrompe (exceto ISRs). Vantagens: simples, previsível, sem troca de contexto, sem RAM extra de pilhas. Limites: a latência de qualquer tarefa é, no pior caso, a duração da tarefa mais longa; a prioridade é só a ordem na tabela; uma tarefa que trava (ou usa delay) trava todo o sistema. Eventos de prazo curto devem ser tratados por ISR.'
          },
          {
            title: 'Preempção e o que é um RTOS',
            body: 'Um RTOS (sistema operacional de tempo real) usa um escalonador preemptivo: um timer periódico (o tick) interrompe a tarefa em execução e, se uma tarefa de prioridade maior estiver pronta, ocorre a troca de contexto (salvar registradores da atual, restaurar os da outra). Cada tarefa tem sua própria PILHA (custo em RAM) e uma prioridade. "Tempo real" significa cumprir prazos de forma previsível, não ser rápido.'
          },
          {
            title: 'FreeRTOS: tarefas',
            body: 'O FreeRTOS roda no AVR por biblioteca (Arduino_FreeRTOS), mas com 2 KB de SRAM as pilhas ficam apertadas; no ESP32 o próprio core do Arduino já roda sobre FreeRTOS (o loop() é uma tarefa). Uma tarefa é uma função com laço infinito, criada por xTaskCreate(função, nome, tamanho da pilha, parâmetro, prioridade, handle). vTaskDelay(pdMS_TO_TICKS(ms)) bloqueia só aquela tarefa, liberando a CPU para as outras.',
            code: '#include <Arduino_FreeRTOS.h>\n\nvoid tarefaLed(void *pv) {\n  pinMode(LED_BUILTIN, OUTPUT);\n  for (;;) {\n    digitalWrite(LED_BUILTIN, !digitalRead(LED_BUILTIN));\n    vTaskDelay(pdMS_TO_TICKS(500));   // só esta tarefa espera\n  }\n}\n\nvoid setup() {\n  xTaskCreate(tarefaLed, "led", 128, NULL, 1, NULL);\n}\nvoid loop() {}'
          },
          {
            title: 'Filas, semáforos e mutex',
            body: 'Tarefas se comunicam por mecanismos seguros, não por variáveis globais soltas (que geram condições de corrida). Fila (xQueueCreate, xQueueSend, xQueueReceive) passa dados de uma tarefa a outra. Semáforo binário sinaliza um evento (por exemplo, uma ISR avisa a tarefa que há dado). Mutex (xSemaphoreCreateMutex, com xSemaphoreTake/xSemaphoreGive) garante acesso exclusivo a um recurso compartilhado, como Serial ou o barramento I2C.',
            code: 'QueueHandle_t fila = xQueueCreate(8, sizeof(int));\nSemaphoreHandle_t mutexSerial = xSemaphoreCreateMutex();\n\n// produtor:   xQueueSend(fila, &valor, portMAX_DELAY);\n// consumidor: xQueueReceive(fila, &lido, portMAX_DELAY);\n\nif (xSemaphoreTake(mutexSerial, portMAX_DELAY) == pdTRUE) {\n  Serial.println("exclusivo");\n  xSemaphoreGive(mutexSerial);\n}'
          },
          {
            title: 'Inversão de prioridade',
            body: 'Cenário: a tarefa B (baixa) pega um mutex; a tarefa A (alta) precisa dele e fica esperando; uma tarefa M (média) entra em execução e preempta B, que nem consegue terminar para liberar o mutex. Resultado: A, de maior prioridade, fica atrasada por M — a prioridade foi "invertida". A solução é a herança de prioridade: enquanto A espera, B herda temporariamente a prioridade de A. Os mutex do FreeRTOS têm herança de prioridade; semáforos binários, não — por isso use mutex para exclusão mútua.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual é o problema típico do superlaço com uma função que usa delay(500)?',
          choices: [
            { id: 'a', text: 'O delay roda em paralelo às outras funções' },
            { id: 'b', text: 'Apenas o Timer1 para' },
            { id: 'c', text: 'Todas as outras tarefas ficam atrasadas até o delay terminar' },
            { id: 'd', text: 'O compilador recusa o código' }
          ],
          answer: 'c',
          explanation: 'No superlaço tudo é sequencial: um bloqueio atrasa todo o resto.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual é a condição para uma tarefa periódica rodar no escalonador cooperativo por tabela?',
          choices: [
            { id: 'a', text: 'millis() − ultima >= periodo' },
            { id: 'b', text: 'millis() == periodo' },
            { id: 'c', text: 'ultima − millis() >= periodo' },
            { id: 'd', text: 'digitalRead(periodo) == HIGH' }
          ],
          answer: 'a',
          explanation: 'A diferença entre agora e a última execução deve alcançar o período (e funciona com o overflow de millis).'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual a diferença essencial entre escalonador cooperativo e preemptivo?',
          choices: [
            { id: 'a', text: 'No cooperativo as tarefas rodam em núcleos diferentes' },
            { id: 'b', text: 'No preemptivo as tarefas não têm pilha' },
            { id: 'c', text: 'Não há diferença prática' },
            { id: 'd', text: 'No cooperativo cada tarefa roda até devolver o controle; no preemptivo o escalonador a interrompe para dar a vez a outra de maior prioridade' }
          ],
          answer: 'd',
          explanation: 'Preempção exige troca de contexto e uma pilha por tarefa; o cooperativo é mais simples, mas depende da boa conduta das tarefas.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o nome da função do FreeRTOS que cria uma tarefa:',
          code: '___(tarefaLed, "led", 128, NULL, 1, NULL);',
          accept: ['xTaskCreate'],
          explanation: 'xTaskCreate registra a função como tarefa com nome, pilha e prioridade.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Qual recurso cada tarefa do FreeRTOS possui e que pesa muito num AVR de 2 KB de SRAM?',
          choices: [
            { id: 'a', text: 'Seu próprio bootloader' },
            { id: 'b', text: 'Sua própria pilha (stack)' },
            { id: 'c', text: 'Seu próprio clock' },
            { id: 'd', text: 'Sua própria Flash' }
          ],
          answer: 'b',
          explanation: 'Cada tarefa precisa de pilha própria para guardar seu contexto; várias tarefas consomem a SRAM rapidamente.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual mecanismo é indicado para duas tarefas não usarem o Serial ao mesmo tempo?',
          choices: [
            { id: 'a', text: 'Usar delay() em todas as tarefas' },
            { id: 'b', text: 'Um mutex em torno das chamadas ao Serial' },
            { id: 'c', text: 'Uma variável global bool sem proteção' },
            { id: 'd', text: 'Aumentar o baud' }
          ],
          answer: 'b',
          explanation: 'O mutex garante acesso exclusivo ao recurso compartilhado.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'A tarefa B (baixa) segura um mutex, a A (alta) espera por ele e a M (média) preempta B. Que problema é esse e como o FreeRTOS o atenua?',
          choices: [
            { id: 'a', text: 'Estouro de pilha; o mutex aumenta a SRAM' },
            { id: 'b', text: 'Condição de corrida; o mutex reinicia o chip' },
            { id: 'c', text: 'Fragmentação; o mutex desfragmenta o heap' },
            { id: 'd', text: 'Inversão de prioridade; o mutex faz herança de prioridade, elevando B temporariamente' }
          ],
          answer: 'd',
          explanation: 'A (alta) fica atrasada por M (média); com herança de prioridade, B roda logo para liberar o mutex.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o final do nome da função que cria um semáforo de exclusão mútua (com herança de prioridade):',
          code: 'SemaphoreHandle_t m = xSemaphoreCreate___();',
          accept: ['Mutex'],
          explanation: 'xSemaphoreCreateMutex cria o mutex do FreeRTOS, que faz herança de prioridade.'
        }
      ]
    },
    {
      id: 'ara-14-baixo-consumo',
      title: 'Baixo consumo: modos de sleep e economia de energia',
      goal: 'Usar os modos de sleep do AVR, acordar por interrupção, desligar periféricos e estimar a duração de uma bateria.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Chip x placa e o orçamento de energia',
            body: 'Um projeto a bateria precisa de consumo médio baixo. Atenção: o ATmega328P dormindo gasta microamperes, mas a placa Uno continua gastando dezenas de mA por causa do regulador, do LED de energia e do chip conversor USB — para baixo consumo use o chip nu ou uma placa enxuta. A conta: corrente média = (I_ativo × t_ativo + I_sleep × t_sleep) / t_total. Exemplo: 10 mA durante 10% do tempo e consumo de sono ≈ 0 dão média de 1 mA; uma bateria de 1000 mAh dura cerca de 1000 h (~41 dias).'
          },
          {
            title: 'Os modos de sleep',
            body: 'A biblioteca avr/sleep.h oferece: SLEEP_MODE_IDLE (só a CPU para; os periféricos continuam), SLEEP_MODE_ADC (reduz ruído para conversões), SLEEP_MODE_PWR_SAVE, SLEEP_MODE_STANDBY e SLEEP_MODE_PWR_DOWN, o mais econômico: o oscilador principal para e nada roda. Do power-down só se acorda por fontes que não dependem do clock: interrupção externa INT0/INT1 por nível baixo, pin change, watchdog em modo interrupção ou endereço TWI (I2C). Timers como o Timer0 (millis) NÃO acordam o chip, pois estão parados.'
          },
          {
            title: 'A API: set_sleep_mode, sleep_enable, sleep_cpu',
            body: 'Sequência: set_sleep_mode(modo); sleep_enable(); sleep_cpu(); ao acordar, a ISR roda e a execução continua na linha seguinte a sleep_cpu(); então sleep_disable(). A macro sleep_mode() faz enable, cpu e disable de uma vez. Cuidado com a corrida: se a interrupção ocorrer ENTRE testar a flag e entrar em sleep, o despertar se perde e o chip dorme para sempre. Por isso se testa a flag com interrupções desligadas (cli) e se usa sei() imediatamente antes de sleep_cpu(): o sei só tem efeito depois da instrução seguinte, que é o próprio sleep.',
            code: '#include <avr/sleep.h>\nvolatile bool acordou = false;\n\nvoid dormir() {\n  set_sleep_mode(SLEEP_MODE_PWR_DOWN);\n  cli();\n  if (!acordou) {\n    sleep_enable();\n    sei();          // vale só após a próxima instrução...\n    sleep_cpu();    // ...que é o sleep: nenhum despertar se perde\n    sleep_disable();\n  } else {\n    sei();\n  }\n}'
          },
          {
            title: 'Acordando por interrupção',
            body: 'Fontes comuns: um botão no pino 2 (INT0) em nível LOW, o alarme de um RTC (que puxa uma linha de interrupção), pin change ou o watchdog em modo interrupção (acorda a cada 8 s no máximo, e a contagem de ciclos estende o intervalo). Na ISR de nível baixo, faça detachInterrupt para ela não disparar de novo enquanto o pino continuar em LOW.',
            code: 'void acordar() {\n  detachInterrupt(digitalPinToInterrupt(2));\n  acordou = true;\n}\n\nattachInterrupt(digitalPinToInterrupt(2), acordar, LOW);'
          },
          {
            title: 'Desligar o que não está em uso',
            body: 'Antes de dormir, desligue o ADC (ADCSRA &= ~(1 << ADEN)), que continuaria gastando energia. A biblioteca avr/power.h desliga periféricos pelo registrador PRR: power_adc_disable(), power_spi_disable(), power_twi_disable(), power_timer1_disable(), power_usart0_disable(). Desabilitar o ADC antes de power_adc_disable() é obrigatório. Evite pinos de entrada flutuando (configure pull-up ou saída definida) e, no power-down, o detector de brown-out pode ser desligado por software (sleep_bod_disable) para economizar mais.',
            code: '#include <avr/power.h>\nADCSRA &= ~(1 << ADEN);   // ADC desligado\npower_adc_disable();\npower_spi_disable();\npower_twi_disable();\npower_timer1_disable();'
          },
          {
            title: 'Brown-out: queda de tensão',
            body: 'O detector de brown-out (BOD) é um comparador que mantém o chip em reset enquanto a tensão estiver abaixo de um limite, escolhido por fuses (1,8 V, 2,7 V ou 4,3 V; o Uno vem com 2,7 V). Evita executar o código e gravar a EEPROM com tensão insuficiente, quando o comportamento seria imprevisível. Em baterias, quando a carga acaba, o BOD pode causar reinícios repetidos: planeje desligar o dispositivo com segurança.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Por que uma placa Uno comum não é boa para baixo consumo, mesmo com o ATmega328P em sleep?',
          choices: [
            { id: 'a', text: 'O regulador, o LED de energia e o conversor USB continuam consumindo dezenas de mA' },
            { id: 'b', text: 'O ATmega328P não tem modos de sleep' },
            { id: 'c', text: 'O sleep só funciona no Mega' },
            { id: 'd', text: 'A placa desliga o sleep ao ligar o USB' }
          ],
          answer: 'a',
          explanation: 'O consumo da placa domina; para microamperes é preciso o chip nu ou uma placa enxuta.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual modo de sleep do AVR é o mais econômico?',
          choices: [
            { id: 'a', text: 'SLEEP_MODE_ADC' },
            { id: 'b', text: 'SLEEP_MODE_STANDBY' },
            { id: 'c', text: 'SLEEP_MODE_PWR_DOWN' },
            { id: 'd', text: 'SLEEP_MODE_IDLE' }
          ],
          answer: 'c',
          explanation: 'No power-down o oscilador principal para; só fontes assíncronas acordam o chip.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual destas fontes pode acordar o ATmega328P do power-down?',
          choices: [
            { id: 'a', text: 'Fim de uma conversão do ADC' },
            { id: 'b', text: 'Chegada de byte pela UART com o clock parado' },
            { id: 'c', text: 'Interrupção INT0 por nível baixo (ou pin change)' },
            { id: 'd', text: 'Estouro do Timer0 (o millis)' }
          ],
          answer: 'c',
          explanation: 'Com o oscilador parado, só fontes que não dependem do clock (nível, pin change, WDT, TWI) acordam o chip.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a função que escolhe o modo de sleep:',
          code: '___(SLEEP_MODE_PWR_DOWN);\nsleep_enable();\nsleep_cpu();',
          accept: ['set_sleep_mode'],
          explanation: 'set_sleep_mode escolhe o modo antes de habilitar e entrar em sleep.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Um dispositivo consome 10 mA durante 10% do tempo e ≈ 0 no resto. Quanto dura uma bateria de 1000 mAh?',
          choices: [
            { id: 'a', text: 'Cerca de 1000 h' },
            { id: 'b', text: 'Cerca de 100 h' },
            { id: 'c', text: 'Cerca de 10 000 h' },
            { id: 'd', text: 'Cerca de 10 h' }
          ],
          answer: 'a',
          explanation: 'Média = 10 mA × 0,1 = 1 mA; 1000 mAh / 1 mA = 1000 h.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Por que se testa a flag com interrupções desligadas e se chama sei() logo antes de sleep_cpu()?',
          choices: [
            { id: 'a', text: 'Para reduzir a corrente do sleep' },
            { id: 'b', text: 'Para zerar o Timer0' },
            { id: 'c', text: 'Porque sei() desliga o oscilador' },
            { id: 'd', text: 'Para que uma interrupção ocorrendo entre o teste e o sleep não perca o despertar e deixe o chip dormindo para sempre' }
          ],
          answer: 'd',
          explanation: 'O sei() só vale após a instrução seguinte (sleep): a interrupção pendente acorda o chip imediatamente.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual é a função do detector de brown-out (BOD)?',
          choices: [
            { id: 'a', text: 'Acordar o chip do power-down periodicamente' },
            { id: 'b', text: 'Manter o chip em reset enquanto a tensão estiver abaixo do limite configurado por fuses' },
            { id: 'c', text: 'Aumentar a tensão de alimentação' },
            { id: 'd', text: 'Medir a temperatura do chip' }
          ],
          answer: 'b',
          explanation: 'Evita execução e gravações com tensão insuficiente; o limite é de 1,8, 2,7 ou 4,3 V.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o bit de ADCSRA que desliga o ADC antes de dormir:',
          code: 'ADCSRA &= ~(1 << ___);',
          accept: ['ADEN'],
          explanation: 'ADEN (ADC Enable) em 0 desliga o conversor e evita consumo desnecessário.'
        }
      ]
    },
    {
      id: 'ara-15-watchdog',
      title: 'Watchdog e robustez do firmware',
      goal: 'Usar o watchdog para recuperar travamentos, identificar a causa de cada reset e garantir um estado seguro das saídas.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O que é o watchdog (WDT)',
            body: 'O watchdog é um temporizador independente (com seu próprio oscilador interno de 128 kHz) que, se não for "alimentado" (zerado) a tempo, age. Ele pode resetar o chip (bit WDE), gerar uma interrupção (WDIE) ou gerar interrupção primeiro e resetar depois. Os tempos configuráveis vão de 15 ms a 8 s (15, 30, 60, 120, 250, 500 ms, 1, 2, 4 e 8 s). Seu papel é tirar o sistema de travamentos: laço infinito, barramento I2C pendurado, ISR que nunca volta.'
          },
          {
            title: 'avr/wdt.h na prática',
            body: 'wdt_enable(WDTO_2S) liga o watchdog com 2 s; wdt_reset() o alimenta, reiniciando a contagem; wdt_disable() o desliga. As constantes vão de WDTO_15MS a WDTO_8S. O modo de interrupção permite até acordar do power-down e executar código antes do reset (útil para gravar um log).',
            code: '#include <avr/wdt.h>\n\nvoid setup() {\n  wdt_enable(WDTO_2S);   // reseta se ficar 2 s sem wdt_reset()\n}\n\nvoid loop() {\n  trabalhar();\n  wdt_reset();           // "estou vivo"\n}'
          },
          {
            title: 'Onde alimentar o watchdog',
            body: 'Chame wdt_reset() no loop principal, depois de a rotina completar normalmente, e escolha o timeout MAIOR que o pior caso legítimo do ciclo (um acesso lento ao SD, por exemplo). NUNCA alimente o watchdog dentro de uma interrupção periódica: a ISR continuaria rodando mesmo com o loop() travado, escondendo o defeito e anulando a proteção.'
          },
          {
            title: 'Causa do reset: MCUSR',
            body: 'O registrador MCUSR tem flags que dizem por que o chip reiniciou: PORF (power-on), EXTRF (pino RESET externo), BORF (brown-out) e WDRF (watchdog). Leia e registre a causa no início (ex.: numa EEPROM) e depois zere MCUSR. Detalhe importante: após um reset por watchdog, o WDE continua ligado com o timeout mínimo; se o programa não o desabilitar logo no começo, o chip fica reiniciando em loop (bootloaders antigos podem entrar nesse ciclo; o Optiboot trata o caso).',
            code: 'uint8_t mcusr_copia __attribute__((section(".noinit")));\nvoid cedo(void) __attribute__((naked)) __attribute__((section(".init3")));\nvoid cedo(void) {\n  mcusr_copia = MCUSR;   // guarda a causa\n  MCUSR = 0;             // limpa os flags\n  wdt_disable();         // evita loop de reset\n}\n// depois: if (mcusr_copia & _BV(WDRF)) { /* foi o watchdog */ }'
          },
          {
            title: 'Brown-out e recuperação',
            body: 'O brown-out (BORF) indica queda de tensão: com bateria fraca, o chip reinicia repetidamente; trate esse caso (por exemplo, desligar ou entrar em modo econômico) em vez de insistir. Em sistemas críticos acrescenta-se um watchdog EXTERNO (circuito dedicado) para o caso de o próprio chip falhar. Registrar a causa do último reset ajuda a achar bugs de campo.'
          },
          {
            title: 'Inicialização segura das saídas',
            body: 'Após qualquer reset, todos os pinos viram entradas em alta impedância (flutuando): um relé ou motor ligado a eles pode oscilar. Defina o estado seguro (fail-safe) com um resistor pull-down/pull-up externo e, no código, escreva o NÍVEL ANTES de configurar o pino como saída, para não gerar um pulso indesejado. Ao reiniciar, o sistema deve começar com aquecedores, motores e relés desligados.',
            code: 'void setup() {\n  digitalWrite(PINO_RELE, LOW);   // nível seguro primeiro\n  pinMode(PINO_RELE, OUTPUT);     // só então vira saída\n}'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual é a faixa de tempos configuráveis do watchdog do ATmega328P?',
          choices: [
            { id: 'a', text: 'De 100 ms a 60 s' },
            { id: 'b', text: 'De 15 ms a 8 s' },
            { id: 'c', text: 'De 1 µs a 1 ms' },
            { id: 'd', text: 'De 1 s a 1 hora' }
          ],
          answer: 'b',
          explanation: 'O WDT vai de 15 ms (WDTO_15MS) até 8 s (WDTO_8S).'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual a vantagem do modo de interrupção do watchdog sobre o modo de reset?',
          choices: [
            { id: 'a', text: 'Não precisa de oscilador' },
            { id: 'b', text: 'Dispensa wdt_reset() para sempre' },
            { id: 'c', text: 'Aumenta o timeout para 1 minuto' },
            { id: 'd', text: 'Permite acordar do power-down e rodar código (como gravar um log) antes de qualquer reset' }
          ],
          answer: 'd',
          explanation: 'No modo interrupção o WDT chama uma ISR; combinado com reset, permite tratar antes de reiniciar.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Por que é um erro chamar wdt_reset() dentro de uma ISR de timer?',
          choices: [
            { id: 'a', text: 'A ISR continua rodando com o loop() travado e esconde o defeito, anulando o watchdog' },
            { id: 'b', text: 'wdt_reset só funciona no setup()' },
            { id: 'c', text: 'Causa estouro da EEPROM' },
            { id: 'd', text: 'Desliga o Timer1' }
          ],
          answer: 'a',
          explanation: 'O watchdog deve ser alimentado pelo fluxo principal, depois de checar que tudo está bem.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a constante que habilita o watchdog com timeout de 2 segundos:',
          code: 'wdt_enable(___);',
          accept: ['WDTO_2S'],
          explanation: 'WDTO_2S configura o timeout de 2 s.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Qual flag do MCUSR indica que o último reset foi causado por queda de tensão (brown-out)?',
          choices: [
            { id: 'a', text: 'PORF' },
            { id: 'b', text: 'EXTRF' },
            { id: 'c', text: 'BORF' },
            { id: 'd', text: 'WDRF' }
          ],
          answer: 'c',
          explanation: 'BORF = brown-out; WDRF = watchdog; PORF = power-on; EXTRF = reset externo.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Por que, após um reset por watchdog, o programa deve desabilitar o WDT logo no início?',
          choices: [
            { id: 'a', text: 'O WDT consome a SRAM' },
            { id: 'b', text: 'O WDT impede o uso do Serial para sempre' },
            { id: 'c', text: 'O WDE continua ligado com o timeout mínimo e o chip ficaria reiniciando em loop' },
            { id: 'd', text: 'O WDT apaga a Flash em seguida' }
          ],
          answer: 'c',
          explanation: 'Se não for tratado, o timeout curto estoura de novo antes de o setup terminar.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual é a maneira correta de iniciar uma saída que controla um relé, evitando pulso indesejado?',
          choices: [
            { id: 'a', text: 'digitalWrite(pino, LOW) primeiro e depois pinMode(pino, OUTPUT)' },
            { id: 'b', text: 'pinMode(pino, OUTPUT) e esperar o loop() definir o nível' },
            { id: 'c', text: 'Deixar o pino flutuando e confiar no estado do reset' },
            { id: 'd', text: 'Ligar o relé direto no pino RESET' }
          ],
          answer: 'a',
          explanation: 'Escrever o nível seguro antes de virar saída evita um pulso, e um pull-down externo mantém o relé desligado durante o reset.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a função que "alimenta" o watchdog, reiniciando sua contagem:',
          code: 'void loop() {\n  trabalhar();\n  ___();\n}',
          accept: ['wdt_reset'],
          explanation: 'wdt_reset() zera a contagem do watchdog; deve ser chamada pelo fluxo principal.'
        }
      ]
    },
    {
      id: 'ara-16-plataformas',
      title: 'Outras placas e plataformas: Mega, Leonardo, Due, ESP32 e Pico',
      goal: 'Reconhecer as diferenças entre placas (tensão lógica, tamanho de int, ADC, cores) e escrever código mais portátil.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'A família AVR',
            body: 'O Nano usa o mesmo ATmega328P do Uno (muda o formato, o conversor USB e há duas entradas A6/A7 que só funcionam como analógicas). O Mega 2560 usa o ATmega2560: 256 KB de Flash, 8 KB de SRAM, 4 KB de EEPROM, 54 pinos digitais, 16 entradas analógicas e 4 UARTs de hardware (Serial a Serial3). O Leonardo usa o ATmega32U4, com USB nativo: o próprio microcontrolador pode se apresentar ao computador como teclado ou mouse (HID). Todos trabalham em 5 V.'
          },
          {
            title: 'Placas de 32 bits e Wi-Fi',
            body: 'O Arduino Due (ARM Cortex-M3, 84 MHz) é de 32 bits, trabalha em 3,3 V e tem DACs. O ESP8266 (um núcleo, 80 MHz) e o ESP32 (geralmente dois núcleos, até 240 MHz, com Wi-Fi e Bluetooth) trabalham em 3,3 V e são a base de muitos projetos IoT. O Raspberry Pi Pico (RP2040) tem dois núcleos ARM Cortex-M0+ a 133 MHz, 264 KB de SRAM, blocos programáveis PIO e também usa 3,3 V.'
          },
          {
            title: 'Tensão lógica: 5 V x 3,3 V',
            body: 'Pinos de Due, ESP e Pico NÃO toleram 5 V: ligar a saída de um Uno diretamente neles pode queimar a entrada. Soluções: divisor resistivo (ex.: 1 kΩ e 2 kΩ) para sinais lentos de 5 V para 3,3 V, ou um level shifter dedicado (bidirecional para I2C). No sentido inverso (3,3 V para uma entrada de 5 V), o nível costuma ser lido como HIGH, mas com margem pequena; o level shifter é o caminho seguro.'
          },
          {
            title: 'Tamanho dos tipos',
            body: 'No AVR, int tem 16 bits (e long, 32). Em ARM e ESP, int tem 32 bits. O double do AVR é só um float de 4 bytes; no ESP32 tem 8. Código que depende do tamanho ou do overflow de int quebra ao mudar de placa. Use os tipos de tamanho fixo de <stdint.h>: uint8_t, int16_t, uint16_t, uint32_t.',
            code: 'uint16_t contador;   // 16 bits em QUALQUER placa\nint x;               // 16 bits no AVR, 32 no ESP32/Due'
          },
          {
            title: 'ADC, PWM e registradores por placa',
            body: 'O ADC do Uno tem 10 bits; ESP32, Due e Pico têm 12 bits (e o core permite configurar com analogReadResolution). O ADC do ESP32 não é linear nas extremidades e parte dele (ADC2) não pode ser usado com o Wi-Fi ligado. O PWM usa 8 bits por padrão, mas varia. Principalmente: os registradores do AVR (DDRB, TCCR1A, ADMUX) NÃO existem em outras arquiteturas — código com acesso direto a registradores não é portável, e deve ficar isolado.'
          },
          {
            title: 'Cores e o Gerenciador de Placas',
            body: 'Cada arquitetura precisa de um core: o pacote com o compilador, as bibliotecas e as definições de pinos (Arduino AVR Boards, ESP32 da Espressif, etc.). Eles se instalam pelo Gerenciador de Placas da IDE, a partir de um índice (URL) JSON, e cada placa tem um identificador (FQBN, ex.: arduino:avr:uno). Para código que roda em mais de uma plataforma, use as macros de arquitetura: ARDUINO_ARCH_AVR, ARDUINO_ARCH_ESP32, ARDUINO_ARCH_ESP8266, ARDUINO_ARCH_SAM. Segurança: instale cores só de fontes confiáveis, pois eles executam código na sua máquina durante a compilação.',
            code: '#if defined(ARDUINO_ARCH_AVR)\n  // código específico de AVR (registradores)\n#elif defined(ARDUINO_ARCH_ESP32)\n  // código específico de ESP32\n#endif'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual característica do Leonardo (ATmega32U4) o diferencia do Uno?',
          choices: [
            { id: 'a', text: 'Trabalha em 3,3 V' },
            { id: 'b', text: 'Tem 4 UARTs de hardware' },
            { id: 'c', text: 'Tem Wi-Fi integrado' },
            { id: 'd', text: 'USB nativo: o próprio chip pode se apresentar como teclado ou mouse' }
          ],
          answer: 'd',
          explanation: 'Sem chip conversor USB-serial, o Leonardo implementa USB no próprio microcontrolador (HID).'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Por que um código com DDRB e TCCR1A não roda num ESP32 ou Pico?',
          choices: [
            { id: 'a', text: 'Porque o ESP32 só aceita código em Python' },
            { id: 'b', text: 'Esses registradores são específicos do AVR e não existem nessas arquiteturas' },
            { id: 'c', text: 'Porque ESP32 e Pico não têm timers' },
            { id: 'd', text: 'Porque o compilador exige 5 V' }
          ],
          answer: 'b',
          explanation: 'Acesso direto a registradores é específico do chip; mantenha-o isolado do restante do código.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que acontece ao ligar diretamente uma saída de 5 V de um Uno a um pino de um Arduino Due?',
          choices: [
            { id: 'a', text: 'Nada, todos os Arduinos toleram 5 V' },
            { id: 'b', text: 'O pino do Due, que não tolera 5 V, pode ser danificado' },
            { id: 'c', text: 'O Due converte o nível automaticamente' },
            { id: 'd', text: 'O sinal fica mais rápido' }
          ],
          answer: 'b',
          explanation: 'O Due trabalha em 3,3 V; use divisor resistivo ou level shifter.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a macro de arquitetura que identifica placas AVR:',
          code: '#if defined(ARDUINO_ARCH____)\n  // código específico de AVR\n#endif',
          accept: ['AVR'],
          explanation: 'ARDUINO_ARCH_AVR é definida pelo core das placas AVR.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Qual o tamanho de um int no AVR e num ESP32?',
          choices: [
            { id: 'a', text: '32 bits no AVR e 16 bits no ESP32' },
            { id: 'b', text: '8 bits nos dois' },
            { id: 'c', text: '16 bits nos dois' },
            { id: 'd', text: '16 bits no AVR e 32 bits no ESP32' }
          ],
          answer: 'd',
          explanation: 'Por isso o código portátil usa tipos de tamanho fixo, como uint16_t.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Como ligar com segurança o TX de 5 V de um Uno ao RX de um ESP32 (3,3 V)?',
          choices: [
            { id: 'a', text: 'Com um divisor resistivo ou um level shifter' },
            { id: 'b', text: 'Direto, pois o ESP32 tolera 5 V' },
            { id: 'c', text: 'Aumentando o baud rate' },
            { id: 'd', text: 'Trocando o TX pelo pino RESET' }
          ],
          answer: 'a',
          explanation: 'O nível de 5 V precisa ser reduzido a 3,3 V antes de chegar à entrada do ESP32.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'O que é um "core" instalado pelo Gerenciador de Placas?',
          choices: [
            { id: 'a', text: 'Um driver USB apenas' },
            { id: 'b', text: 'Um bootloader gravado na EEPROM' },
            { id: 'c', text: 'O pacote com compilador, bibliotecas e definições de pinos de uma arquitetura' },
            { id: 'd', text: 'Um núcleo físico adicional do processador' }
          ],
          answer: 'c',
          explanation: 'Cada arquitetura (AVR, ESP32, etc.) tem seu core, e só se deve instalar cores de fontes confiáveis.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o tipo sem sinal de 16 bits e tamanho garantido em qualquer placa:',
          code: '___ contador;   // 0 a 65535 em qualquer placa',
          accept: ['uint16_t'],
          explanation: 'uint16_t, de <stdint.h>, tem sempre 16 bits.'
        }
      ]
    },
    {
      id: 'ara-17-conectividade',
      title: 'Conectividade sem fio: Bluetooth, Wi-Fi, nRF24, LoRa e MQTT',
      goal: 'Comparar as principais tecnologias sem fio para Arduino e entender a diferença entre HTTP e MQTT.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Escolhendo o rádio',
            body: 'Não existe rádio "melhor": a escolha é um equilíbrio entre alcance, taxa de dados, consumo de energia, custo e infraestrutura necessária. Bluetooth fala com celulares; Wi-Fi conecta à internet; nRF24L01 liga módulos próximos entre si a baixo custo; LoRa leva dados pequenos a quilômetros. Esta lição compara os principais; a próxima trata da segurança, que vale para todos.'
          },
          {
            title: 'Bluetooth: HC-05 e BLE',
            body: 'O HC-05 é um módulo Bluetooth clássico com o perfil SPP: funciona como uma "porta serial sem fio" ligada à UART do Arduino (o pino RX do módulo é de 3,3 V, então o TX de 5 V do Uno precisa de um divisor). O BLE (Bluetooth Low Energy, em módulos como o HM-10 e no ESP32) é outra tecnologia, de consumo muito menor, que organiza os dados em serviços e características (GATT) e é o que apps de celular modernos esperam. Os dois têm PIN/senha padrão de fábrica (ex.: 1234 no HC-05) que deve ser trocado.'
          },
          {
            title: 'Wi-Fi com ESP8266/ESP32',
            body: 'O Uno não tem Wi-Fi; usa-se um ESP8266 ou ESP32 (que também roda o seu sketch). Conecta-se com WiFi.begin(ssid, senha) e espera-se WiFi.status() chegar a WL_CONNECTED (na prática, com um tempo limite). O Wi-Fi gera picos de corrente de centenas de mA: alimentação fraca causa reinícios misteriosos. As credenciais NUNCA vão direto no sketch versionado (veja a próxima lição).',
            code: '#include <WiFi.h>\n#include "secrets.h"   // define WIFI_SSID e WIFI_SENHA (fora do versionamento)\n\nWiFi.begin(WIFI_SSID, WIFI_SENHA);\nwhile (WiFi.status() != WL_CONNECTED) {\n  delay(500);   // na prática, limite o tempo de espera\n}'
          },
          {
            title: 'nRF24L01',
            body: 'O nRF24L01 é um rádio de 2,4 GHz, barato, controlado por SPI e alimentado em 3,3 V (a alimentação instável é a falha mais comum; coloque um capacitor perto do VCC). Os pacotes têm no máximo 32 bytes e cada nó se comunica por endereços (pipes). É ideal para uma rede local de sensores sem Wi-Fi, usando a biblioteca RF24. Não chega à internet sozinho: precisa de um gateway.'
          },
          {
            title: 'LoRa',
            body: 'LoRa é uma modulação de rádio em faixa sub-GHz (por exemplo, 915 MHz no Brasil) que troca velocidade por alcance: chega a quilômetros com consumo baixo, mas com taxa de dados muito baixa e pacotes pequenos. É adequada para sensores remotos que mandam poucos bytes de tempos em tempos (nível de um reservatório, umidade do solo), não para áudio ou imagens. LoRaWAN é a camada de rede que organiza gateways e dispositivos.'
          },
          {
            title: 'HTTP x MQTT',
            body: 'HTTP é requisição/resposta: o dispositivo (cliente) pergunta e o servidor responde, a cada vez com cabeçalhos pesados; para saber de novidades é preciso perguntar de novo (polling). MQTT é publicar/assinar: os dispositivos mantêm uma conexão leve com um broker; quem tem um dado o PUBLICA num tópico (como casa/sala/temperatura) e quem ASSINA esse tópico o recebe na hora, sem conhecer o remetente. É leve e ideal para IoT.',
            code: '// publicar / assinar (PubSubClient)\nclient.publish("casa/sala/temperatura", "23.5");\nclient.subscribe("casa/sala/comando");'
          },
          {
            title: 'MQTT: QoS e portas',
            body: 'O QoS (qualidade de serviço) define a garantia de entrega: QoS 0 = no máximo uma vez (pode perder); QoS 1 = pelo menos uma vez (pode duplicar); QoS 2 = exatamente uma vez (mais lento). A porta padrão sem criptografia é a 1883; com TLS, a 8883 — use sempre a segura, assunto da próxima lição.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que é o módulo HC-05 na prática?',
          choices: [
            { id: 'a', text: 'Um rádio LoRa sub-GHz' },
            { id: 'b', text: 'Um módulo BLE que usa GATT' },
            { id: 'c', text: 'Uma porta serial sem fio, em Bluetooth clássico (perfil SPP), ligada à UART' },
            { id: 'd', text: 'Um módulo Wi-Fi de longo alcance' }
          ],
          answer: 'c',
          explanation: 'O HC-05 expõe uma UART por Bluetooth clássico; BLE é outra tecnologia, com serviços e características.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Como o BLE organiza os dados que expõe?',
          choices: [
            { id: 'a', text: 'Em serviços e características (GATT)' },
            { id: 'b', text: 'Em tópicos MQTT' },
            { id: 'c', text: 'Em pacotes SPI de 32 bytes' },
            { id: 'd', text: 'Em páginas HTML' }
          ],
          answer: 'a',
          explanation: 'GATT define serviços compostos por características, que o celular lê ou escreve.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual o tamanho máximo de um pacote do nRF24L01?',
          choices: [
            { id: 'a', text: '256 bytes' },
            { id: 'b', text: '1 KB' },
            { id: 'c', text: '8 bytes' },
            { id: 'd', text: '32 bytes' }
          ],
          answer: 'd',
          explanation: 'Pacotes pequenos (até 32 bytes); por isso é ideal para leituras de sensores.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a constante comparada com WiFi.status() quando a conexão está estabelecida:',
          code: 'while (WiFi.status() != ___) {\n  delay(500);\n}',
          accept: ['WL_CONNECTED'],
          explanation: 'WL_CONNECTED indica que o ESP conseguiu conectar ao ponto de acesso.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Qual o compromisso (trade-off) principal do LoRa?',
          choices: [
            { id: 'a', text: 'Consome muita energia, mas é barato' },
            { id: 'b', text: 'Grande alcance e baixo consumo, mas taxa de dados muito baixa' },
            { id: 'c', text: 'Altíssima velocidade, mas alcance de poucos metros' },
            { id: 'd', text: 'Funciona só com internet por cabo' }
          ],
          answer: 'b',
          explanation: 'LoRa troca velocidade por alcance: serve para poucos bytes de vez em quando.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual a diferença central entre HTTP e MQTT?',
          choices: [
            { id: 'a', text: 'Não há diferença, só o nome' },
            { id: 'b', text: 'HTTP é requisição/resposta; MQTT é publicar/assinar por meio de um broker' },
            { id: 'c', text: 'HTTP é só para Bluetooth; MQTT é só para Wi-Fi' },
            { id: 'd', text: 'MQTT precisa de um cabo; HTTP não' }
          ],
          answer: 'b',
          explanation: 'No MQTT, quem publica num tópico não conhece quem assina: o broker distribui.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'O que garante o QoS 1 do MQTT?',
          choices: [
            { id: 'a', text: 'A mensagem chega no máximo uma vez (pode se perder)' },
            { id: 'b', text: 'A mensagem chega exatamente uma vez' },
            { id: 'c', text: 'A mensagem é criptografada automaticamente' },
            { id: 'd', text: 'A mensagem chega pelo menos uma vez (pode haver duplicatas)' }
          ],
          answer: 'd',
          explanation: 'QoS 0 = no máximo uma vez; QoS 1 = pelo menos uma vez; QoS 2 = exatamente uma vez. QoS não é criptografia.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a porta padrão do MQTT com criptografia TLS:',
          code: 'client.setServer(BROKER, ___);',
          accept: ['8883'],
          explanation: '1883 é sem criptografia; 8883 é a porta padrão do MQTT sobre TLS.'
        }
      ]
    },
    {
      id: 'ara-18-seguranca-iot',
      title: 'Segurança e privacidade em IoT: segredos, TLS, OTA e LGPD',
      goal: 'Proteger credenciais e comunicações de um dispositivo conectado e coletar o mínimo de dados, respeitando a LGPD.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Por que IoT é alvo fácil',
            body: 'Dispositivos conectados costumam sair de fábrica com senha padrão, nunca receber atualizações e ficar expostos na internet. Em 2016 o malware Mirai montou uma enorme botnet apenas tentando as senhas padrão de câmeras e roteadores. A lição: trocar toda senha padrão (de módulos como o HC-05 e do painel de qualquer dispositivo), desligar serviços que não usa e não expor o dispositivo à internet.'
          },
          {
            title: 'Segredos nunca vão para o código versionado',
            body: 'Senha de Wi-Fi, usuário e senha do broker, tokens de API e chaves NUNCA devem estar no sketch que vai para o Git, mesmo em repositório "privado": o histórico guarda tudo para sempre. O padrão: um arquivo secrets.h incluído pelo sketch, listado no .gitignore, e um secrets.h.example versionado só com valores falsos para documentar o formato. Dê uma credencial única a cada dispositivo. Se um segredo vazar, revogue e troque na hora — apagar o commit não adianta, pois ele pode já ter sido copiado.',
            code: '// secrets.h  (NO .gitignore; nunca vai ao repositório)\n#define WIFI_SSID   "rede-exemplo"\n#define WIFI_SENHA  "troque-isto"\n#define MQTT_USUARIO "sensor-01"\n#define MQTT_SENHA   "troque-isto-tambem"\n\n// .gitignore\n// secrets.h'
          },
          {
            title: 'Criptografia em trânsito: HTTPS e TLS',
            body: 'HTTP e MQTT puros trafegam em texto claro: qualquer pessoa na rede lê, copia as senhas e altera os dados. Use HTTPS (porta 443) e MQTT com TLS (porta 8883). O TLS só protege se o dispositivo VALIDAR o certificado do servidor, por exemplo com setCACert(); chamar setInsecure() desliga essa verificação e permite o ataque do homem no meio (man-in-the-middle): serve só para testes. TLS é pesado para um AVR de 2 KB; use ESP32/ESP8266 ou um gateway seguro.',
            code: 'WiFiClientSecure rede;\nrede.setCACert(CA_RAIZ);   // valida o servidor\n// rede.setInsecure();      // NUNCA em produção'
          },
          {
            title: 'Autenticação e menor privilégio',
            body: 'Cada dispositivo deve se autenticar no broker com usuário/senha (ou certificado/token) próprios, e o broker deve ter ACLs (listas de controle de acesso) para que cada dispositivo só publique e assine os próprios tópicos: se um sensor for comprometido, o estrago fica restrito a ele. Não abra portas do roteador (port forwarding) para o dispositivo: ele deve abrir uma conexão de SAÍDA para o broker. Desative Telnet, depuração serial em produção e qualquer serviço não usado.'
          },
          {
            title: 'Atualização OTA segura',
            body: 'A atualização remota (OTA, over-the-air) é indispensável para corrigir falhas, mas também é uma porta de entrada: quem controlar o OTA controla o dispositivo. Proteja com senha forte (ArduinoOTA), baixe o firmware por HTTPS, verifique a assinatura/hash do arquivo ANTES de gravar e mantenha a versão anterior para voltar atrás (rollback) se a nova falhar. Nunca deixe o OTA aberto sem autenticação.'
          },
          {
            title: 'Privacidade e LGPD',
            body: 'Pela LGPD (Lei nº 13.709/2018), dado pessoal é toda informação relacionada a uma pessoa identificada ou identificável. Sensores domésticos (presença, consumo de energia, localização, câmera, microfone) revelam hábitos e podem ser dados pessoais. Princípios: finalidade (coletar para um propósito claro), necessidade/minimização (só o mínimo indispensável), transparência e segurança. Quando houver dado pessoal, é preciso base legal, como consentimento informado e revogável, e prazo de retenção definido.'
          },
          {
            title: 'Minimizar, anonimizar, agregar',
            body: 'Boas práticas: processar no próprio dispositivo e enviar só o resultado; reduzir a precisão e agregar (média por hora em vez de leitura a cada segundo); usar um identificador aleatório do dispositivo em vez de nome ou endereço; apagar dados após o prazo; criptografar o que for sensível. Atenção: pseudonimizar (trocar o nome por um código reversível) ainda é dado pessoal; só a anonimização irreversível sai do alcance da lei. O melhor dado a proteger é aquele que você nunca coletou.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual foi a principal falha explorada pela botnet Mirai em câmeras e roteadores?',
          choices: [
            { id: 'a', text: 'Credenciais padrão de fábrica que nunca foram trocadas' },
            { id: 'b', text: 'Estouro da EEPROM' },
            { id: 'c', text: 'Uso excessivo de PWM' },
            { id: 'd', text: 'Falta de capacitores de desacoplamento' }
          ],
          answer: 'a',
          explanation: 'Senhas padrão e dispositivos expostos são o alvo mais fácil; troque-as sempre.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'A senha do Wi-Fi foi enviada por engano ao repositório Git. O que fazer?',
          choices: [
            { id: 'a', text: 'Nada, se o repositório for privado' },
            { id: 'b', text: 'Escrever a senha em base64 no sketch' },
            { id: 'c', text: 'Trocar a senha imediatamente, pois o histórico do Git já pode ter sido copiado' },
            { id: 'd', text: 'Apagar o último commit e seguir com a mesma senha' }
          ],
          answer: 'c',
          explanation: 'Um segredo vazado deve ser revogado e trocado; apagar o commit não desfaz as cópias.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual das práticas torna a atualização OTA mais segura?',
          choices: [
            { id: 'a', text: 'Aceitar qualquer arquivo recebido' },
            { id: 'b', text: 'Desativar o rollback para economizar Flash' },
            { id: 'c', text: 'Baixar por HTTPS e verificar a assinatura/hash do firmware antes de gravar' },
            { id: 'd', text: 'Deixar o OTA aberto na rede, sem senha, para facilitar' }
          ],
          answer: 'c',
          explanation: 'Sem autenticação e verificação, o OTA vira o jeito mais fácil de tomar o dispositivo.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o nome do arquivo de credenciais que deve constar no .gitignore:',
          code: '# .gitignore\n___',
          accept: ['secrets.h'],
          explanation: 'secrets.h guarda as credenciais fora do repositório; só o secrets.h.example, com valores falsos, é versionado.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que acontece ao usar setInsecure() em um cliente TLS?',
          choices: [
            { id: 'a', text: 'O certificado do servidor deixa de ser validado, permitindo ataques man-in-the-middle' },
            { id: 'b', text: 'A conexão fica mais criptografada' },
            { id: 'c', text: 'O dispositivo passa a usar a porta 1883' },
            { id: 'd', text: 'O TLS passa a ser feito pelo hardware AVR' }
          ],
          answer: 'a',
          explanation: 'Sem validar o certificado, qualquer impostor pode se passar pelo servidor. Use só em testes.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual é a melhor forma de conectar um sensor da sua casa a um broker na nuvem?',
          choices: [
            { id: 'a', text: 'Abrir portas no roteador e divulgar o IP do sensor' },
            { id: 'b', text: 'Usar a mesma senha em todos os sensores' },
            { id: 'c', text: 'Usar MQTT sem criptografia, pois é mais rápido' },
            { id: 'd', text: 'O dispositivo abre uma conexão de saída com TLS e credencial própria; nenhuma porta é aberta no roteador' }
          ],
          answer: 'd',
          explanation: 'Conexão de saída, TLS, credencial única por dispositivo e ACLs minimizam a exposição.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Um sensor de ocupação enviava a presença de cada pessoa a cada segundo com nome. Qual mudança melhor respeita a LGPD?',
          choices: [
            { id: 'a', text: 'Enviar também o endereço MAC e a localização exata' },
            { id: 'b', text: 'Enviar apenas uma contagem agregada por hora, com ID anônimo do dispositivo, e apagar após o prazo' },
            { id: 'c', text: 'Manter tudo, mas guardar em texto claro' },
            { id: 'd', text: 'Trocar o nome por um código reversível e considerar anonimizado' }
          ],
          answer: 'b',
          explanation: 'Minimização (só o necessário), agregação, anonimização e retenção limitada. Pseudonimizar ainda é dado pessoal.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o número da lei brasileira de proteção de dados pessoais (LGPD): Lei nº ___/2018.',
          code: '// Lei Geral de Proteção de Dados Pessoais\n// Lei nº ___/2018',
          accept: ['13.709', '13709'],
          explanation: 'A LGPD é a Lei nº 13.709/2018.'
        }
      ]
    },
    {
      id: 'ara-19-alimentacao-protecao',
      title: 'Alimentação, proteção e ruído',
      goal: 'Projetar a alimentação e a proteção do circuito: desacoplamento, terra, diodos de proteção, fusíveis, reguladores e isolação.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Capacitores de desacoplamento',
            body: 'Um chip digital puxa pulsos rápidos de corrente a cada comutação; os fios têm indutância e a tensão no pino do chip "afunda" por instantes, causando ruído, leituras de ADC erradas e até resets. O remédio: um capacitor cerâmico de 100 nF entre VCC e GND de cada CI, o mais perto possível dos pinos, e um capacitor maior (10 a 100 µF) na entrada de alimentação, perto de motores ou de rádios Wi-Fi.'
          },
          {
            title: 'Terra: loops e aterramento comum',
            body: 'Duas placas ou fontes só entendem os sinais uma da outra se tiverem o GND em comum. Mas fios de terra compartilhados entre o motor (corrente alta) e o sensor (sinal pequeno) criam queda de tensão no fio e injetam ruído no sensor; caminhos múltiplos de terra formam laços (ground loops) por onde correntes de ruído circulam. Boas práticas: alimentar motores e lógica por caminhos separados que se encontram em UM ponto de terra, afastar fios analógicos dos de motores/PWM e usar par trançado ou blindagem em cabos longos.'
          },
          {
            title: 'Cargas indutivas e o diodo flyback',
            body: 'Relés, motores e solenoides são indutores: ao serem desligados, geram um pico de tensão de polaridade invertida, que pode ultrapassar centenas de volts e destruir o transistor ou o pino do Arduino. O diodo flyback (de roda livre) ligado em antiparalelo com a bobina (catodo no lado positivo) dá um caminho para essa corrente e prende o pico. Módulos de relé já trazem o diodo; um circuito montado por você, não.'
          },
          {
            title: 'ESD, TVS e proteção contra polaridade',
            body: 'Descargas eletrostáticas (ESD) e surtos em fios longos podem destruir uma entrada. Em linhas expostas ao mundo externo use um resistor em série (100 Ω a 1 kΩ) e um diodo TVS, que conduz e limita a tensão quando ela excede o limite. Para erro de polaridade na fonte, um diodo em série (com queda de tensão) ou um MOSFET canal P no positivo evita a inversão da alimentação.'
          },
          {
            title: 'Fusível e PTC',
            body: 'Um fusível queima de uma vez em caso de sobrecorrente e precisa ser trocado. O PTC (polyfuse, fusível rearmável) aumenta a resistência ao aquecer e se recompõe depois de esfriar; o Uno tem um na USB. Escolha uma corrente maior que a de operação normal e menor que a capacidade da fiação e da fonte: o fusível protege o fio e a fonte, não o chip.'
          },
          {
            title: 'Regulador linear x chaveado',
            body: 'O regulador linear (como o 7805) é simples e de baixo ruído, mas descarta a diferença de tensão como CALOR: P = (Vin − Vout) × I. De 12 V para 5 V a 200 mA: (12 − 5) × 0,2 = 1,4 W — muito calor, pode exigir dissipador ou desarmar por proteção térmica. O regulador chaveado (buck) tem eficiência típica de 85 a 95%, quase não esquenta, mas gera ruído e ripple de chaveamento que podem interferir em ADC e rádio, exigindo bom filtro.'
          },
          {
            title: 'Isolação com optoacoplador',
            body: 'O optoacoplador transmite o sinal por luz (um LED e um fototransistor no mesmo encapsulamento), isolando galvanicamente dois circuitos: ruído e tensões altas de um lado não passam ao Arduino. Usa-se em módulos de relé e em entradas de 24 V industriais. Atenção: tensão da rede elétrica é perigosa; só mexa com módulos adequados, isolamento correto e caixa fechada, e, sem experiência, não faça.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Onde e com qual valor típico se coloca o capacitor de desacoplamento de um CI?',
          choices: [
            { id: 'a', text: 'Entre o pino de saída e o RESET' },
            { id: 'b', text: 'Cerâmico de 100 nF entre VCC e GND, o mais perto possível dos pinos do CI' },
            { id: 'c', text: 'Eletrolítico de 1 F em série com o VCC' },
            { id: 'd', text: 'Qualquer valor, longe do chip' }
          ],
          answer: 'b',
          explanation: 'O capacitor próximo ao pino fornece os picos de corrente que os fios não conseguem.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual é o papel do diodo em antiparalelo com a bobina de um relé?',
          choices: [
            { id: 'a', text: 'Aumentar a corrente da bobina' },
            { id: 'b', text: 'Trocar a polaridade da alimentação' },
            { id: 'c', text: 'Gerar PWM' },
            { id: 'd', text: 'Absorver o pico de tensão gerado quando a bobina é desligada' }
          ],
          answer: 'd',
          explanation: 'O diodo flyback dá um caminho à corrente da bobina e protege o transistor/pino.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Um 7805 reduz 12 V para 5 V alimentando 200 mA. Quanto calor ele dissipa?',
          choices: [
            { id: 'a', text: '1,4 W' },
            { id: 'b', text: '2,4 W' },
            { id: 'c', text: '1,0 W' },
            { id: 'd', text: '0,2 W' }
          ],
          answer: 'a',
          explanation: 'P = (12 − 5) V × 0,2 A = 1,4 W; a diferença de tensão vira calor.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o nome do componente que isola circuitos usando luz (LED + fototransistor):',
          code: '// módulos de relé usam um ___ para isolar o Arduino da carga',
          accept: ['optoacoplador', 'optoisolador', 'opto-acoplador', 'opto acoplador'],
          explanation: 'O optoacoplador faz isolação galvânica transmitindo o sinal por luz.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que é um ground loop e por que atrapalha?',
          choices: [
            { id: 'a', text: 'Um tipo de capacitor de desacoplamento' },
            { id: 'b', text: 'A ligação do GND ao pino RESET' },
            { id: 'c', text: 'Caminhos múltiplos ou compartilhados de terra por onde correm correntes de ruído, que se somam ao sinal do sensor' },
            { id: 'd', text: 'Um laço de código infinito no loop()' }
          ],
          answer: 'c',
          explanation: 'Separe o terra de motores do dos sensores, unindo-os em um ponto só.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual a diferença entre um fusível comum e um PTC (polyfuse)?',
          choices: [
            { id: 'a', text: 'Os dois são idênticos' },
            { id: 'b', text: 'O PTC protege o chip contra ESD' },
            { id: 'c', text: 'O PTC se rearma ao esfriar; o fusível comum queima e precisa ser trocado' },
            { id: 'd', text: 'O PTC queima permanentemente; o fusível se rearma' }
          ],
          answer: 'c',
          explanation: 'O PTC aumenta a resistência ao aquecer e se recompõe depois de esfriar.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual a principal desvantagem do regulador chaveado (buck) em relação ao linear?',
          choices: [
            { id: 'a', text: 'Gera ruído e ripple de chaveamento que podem interferir em ADC e rádio' },
            { id: 'b', text: 'Esquenta muito mais' },
            { id: 'c', text: 'Só funciona com 5 V de entrada' },
            { id: 'd', text: 'Tem eficiência de apenas 10%' }
          ],
          answer: 'a',
          explanation: 'O buck tem eficiência alta (85 a 95%), mas exige bom filtro por causa do ruído de chaveamento.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a sigla do diodo que limita transientes e surtos em linhas expostas:',
          code: '// proteção de entrada: resistor em série + diodo ___',
          accept: ['TVS'],
          explanation: 'O diodo TVS (Transient Voltage Suppressor) conduz e prende a tensão quando ela excede o limite.'
        }
      ]
    },
    {
      id: 'ara-20-prototipo-produto',
      title: 'Do protótipo ao produto: ATmega328P standalone, ICSP e fuses',
      goal: 'Montar o ATmega328P fora da placa Uno, gravá-lo por ICSP ou com o Arduino como ISP, usar o avrdude e configurar fuses sem brickar o chip.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'ATmega328P standalone',
            body: 'Para um produto, a placa Uno é substituída pelo próprio chip (DIP-28 ou SMD) com o mínimo de componentes: alimentação de 5 V em VCC (pino 7) e AVCC (pino 20), GND nos pinos 8 e 22, um resistor de pull-up de 10 kΩ entre RESET (pino 1) e VCC, um cristal de 16 MHz entre XTAL1 (9) e XTAL2 (10) com dois capacitores de cerca de 22 pF para o GND, e capacitores de 100 nF de desacoplamento perto de VCC/AVCC. A 16 MHz o chip pede alimentação próxima de 5 V; com 3,3 V use 8 MHz (inclusive o oscilador interno de 8 MHz, que dispensa o cristal).'
          },
          {
            title: 'ICSP: gravação direta pela SPI',
            body: 'O ICSP (In-Circuit Serial Programming) é um conector de 6 pinos: MISO, VCC, SCK, MOSI, RESET e GND. Ele grava a Flash do chip pela SPI, sem depender do bootloader, com programadores como USBasp, AVRISP mkII ou Atmel-ICE. Um chip novo vem "virgem" (sem bootloader, rodando a 1 MHz pelo oscilador interno de 8 MHz dividido por 8); gravar o bootloader (opção "Gravar bootloader") ajusta os fuses e instala o Optiboot.'
          },
          {
            title: 'Arduino como ISP',
            body: 'Um Uno comum pode virar programador: carregue nele o sketch ArduinoISP e ligue ao chip alvo: pino 13 → SCK, 12 → MISO, 11 → MOSI, 10 → RESET do alvo, mais 5 V e GND. Na IDE escolha o programador "Arduino as ISP" e use "Gravar bootloader" ou "Enviar usando programador". Gravar sem bootloader economiza 0,5 KB de Flash e elimina o atraso de inicialização do bootloader.',
            code: '// Uno (programador)      ATmega328P (alvo)\n// pino 13 (SCK)  ------> SCK\n// pino 12 (MISO) <------ MISO\n// pino 11 (MOSI) ------> MOSI\n// pino 10        ------> RESET\n// 5 V e GND      ------> VCC e GND'
          },
          {
            title: 'avrdude: o gravador por trás da IDE',
            body: 'O avrdude é a ferramenta de linha de comando que grava e lê as memórias do AVR. As opções principais: -c programador (arduino, usbasp, stk500v1...), -p chip (m328p para o ATmega328P), -P porta, -b baud e -U memória:operação:arquivo:formato. Por exemplo, -U flash:w:blink.hex:i escreve (w) o blink.hex, no formato Intel Hex (i), na Flash. Também lê (r) a EEPROM para backup.',
            code: 'avrdude -c arduino -p m328p -P COM3 -b 115200 -U flash:w:blink.hex:i\n\n# backup da EEPROM:\navrdude -c arduino -p m328p -P COM3 -b 115200 -U eeprom:r:eeprom.bin:r'
          },
          {
            title: 'Fuses e lock bits',
            body: 'Os fuses (low, high e extended) configuram o chip antes do programa rodar: fonte do clock (CKSEL), divisão por 8 (CKDIV8), nível do brown-out (BODLEVEL), tamanho da área de boot e vetor de reset (BOOTSZ/BOOTRST), preservar a EEPROM ao apagar o chip (EESAVE), e os bits SPIEN (gravação por SPI) e RSTDISBL (pino RESET como I/O). ATENÇÃO À LÓGICA INVERTIDA: um fuse "programado" vale 0. Os lock bits restringem a leitura/gravação da Flash (para proteger o firmware contra cópia) e só são liberados por um apagamento completo do chip (chip erase), que também apaga o programa.'
          },
          {
            title: 'Risco de brickar o chip',
            body: 'Fuses errados podem deixar o chip inacessível ("brickado"): (1) configurar o clock para cristal externo sem cristal presente — sem clock o chip não responde ao ICSP (é possível recuperar injetando um sinal de clock em XTAL1); (2) programar RSTDISBL — o pino RESET vira I/O e o ICSP deixa de funcionar, só recuperável com programação de alta tensão; (3) desligar SPIEN, com o mesmo efeito. Regra de ouro: leia e anote os fuses antes de mudar, confira o valor num calculador de fuses confiável e nunca altere o que não entende.'
          },
          {
            title: 'Esquemático, PCB, EMC e testes',
            body: 'No esquemático inclua desacoplamento em cada CI, proteção de entrada de alimentação (diodo de polaridade, fusível/PTC), pontos de teste e o conector ICSP. No layout da PCB: capacitores de desacoplamento encostados nos pinos, cristal com trilhas curtas perto do chip, plano de terra contínuo, retornos de corrente curtos e trilhas analógicas longe das rápidas. EMC (compatibilidade eletromagnética) é emitir pouca interferência e resistir à dos outros; laços grandes e bordas rápidas irradiam. Produtos com rádio exigem homologação (no Brasil, a Anatel). Teste: tensões mínima e máxima, temperatura, brown-out, ESD, longa duração e um gabarito de teste na produção.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Quais componentes mínimos acompanham o ATmega328P standalone a 16 MHz?',
          choices: [
            { id: 'a', text: 'Apenas o chip, sem nenhum componente externo' },
            { id: 'b', text: 'Um regulador de 12 V e um relé' },
            { id: 'c', text: 'Um cristal de 32 kHz e um display' },
            { id: 'd', text: 'Cristal de 16 MHz com dois capacitores de ~22 pF, pull-up de 10 kΩ no RESET e capacitores de 100 nF' }
          ],
          answer: 'd',
          explanation: 'Cristal + 2 capacitores, pull-up no RESET e desacoplamento são o mínimo para 16 MHz.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Quais sinais compõem o conector ICSP de 6 pinos?',
          choices: [
            { id: 'a', text: 'XTAL1, XTAL2, AREF, AVCC, VCC e GND' },
            { id: 'b', text: 'MISO, VCC, SCK, MOSI, RESET e GND' },
            { id: 'c', text: 'TX, RX, SDA, SCL, VCC e GND' },
            { id: 'd', text: 'D2, D3, A0, A1, VCC e GND' }
          ],
          answer: 'b',
          explanation: 'O ICSP usa a SPI (MISO, MOSI, SCK) mais RESET e alimentação.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'No Arduino como ISP, qual pino do Uno programador liga ao RESET do chip alvo?',
          choices: [
            { id: 'a', text: 'O pino 11' },
            { id: 'b', text: 'O pino 10' },
            { id: 'c', text: 'O pino 13' },
            { id: 'd', text: 'O pino 12' }
          ],
          answer: 'b',
          explanation: '13 = SCK, 12 = MISO, 11 = MOSI e 10 = RESET do alvo.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o código do chip ATmega328P nas opções do avrdude:',
          code: 'avrdude -c arduino -p ___ -P COM3 -b 115200 -U flash:w:blink.hex:i',
          accept: ['m328p', 'atmega328p'],
          explanation: 'm328p é o identificador do ATmega328P no avrdude (-p).'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Qual prática de layout de PCB reduz ruído e problemas de EMC?',
          choices: [
            { id: 'a', text: 'Colocar o cristal longe do chip, com trilhas longas' },
            { id: 'b', text: 'Fazer laços grandes de alimentação' },
            { id: 'c', text: 'Misturar trilhas analógicas com as de chaveamento rápido' },
            { id: 'd', text: 'Capacitores de desacoplamento junto aos pinos de alimentação, plano de terra contínuo e retornos curtos' }
          ],
          answer: 'd',
          explanation: 'Laços pequenos e capacitores junto ao CI diminuem a irradiação e o ruído.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual destas ações pode deixar o chip inacessível por ICSP (exigindo programação de alta tensão)?',
          choices: [
            { id: 'a', text: 'Programar o fuse RSTDISBL (pino RESET vira I/O)' },
            { id: 'b', text: 'Gravar um sketch novo pelo bootloader' },
            { id: 'c', text: 'Usar o avrdude para ler a EEPROM' },
            { id: 'd', text: 'Trocar a alimentação de 5 V para 4,8 V' }
          ],
          answer: 'a',
          explanation: 'Sem o pino RESET, o ICSP não consegue entrar em modo de programação.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Para que servem os lock bits e como se removem?',
          choices: [
            { id: 'a', text: 'Travam o pino RESET; removem-se reiniciando' },
            { id: 'b', text: 'Escolhem o baud da serial; removem-se pelo Serial Monitor' },
            { id: 'c', text: 'Restringem leitura/gravação da Flash (proteção do firmware); só um chip erase os libera, apagando o programa' },
            { id: 'd', text: 'Aumentam o clock; removem-se com reset' }
          ],
          answer: 'c',
          explanation: 'É a proteção contra cópia do firmware: liberar exige apagar o chip.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a lógica dos fuses do AVR: um fuse "programado" vale ___ (0 ou 1).',
          code: '// nos fuses do AVR, um bit "programado" vale ___',
          accept: ['0'],
          explanation: 'A lógica dos fuses é invertida: programado = 0, não programado = 1.'
        }
      ]
    },
    {
      id: 'ara-21-depuracao-testes',
      title: 'Depuração e testes avançados: instrumentos, simulação e datasheet',
      goal: 'Escolher o instrumento certo para cada defeito, depurar pela Serial com custo controlado, testar a lógica fora do hardware e ler datasheets.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'Multímetro: o primeiro instrumento',
            body: 'O multímetro mede tensão (em PARALELO com o ponto medido), continuidade e resistência (sempre com o circuito desligado) e corrente (em SÉRIE, interrompendo o fio e usando o borne/escala de corrente). Erro clássico: deixar o multímetro no modo corrente e medir uma tensão, provocando um curto que queima o fusível do aparelho. Em qualquer defeito, comece medindo a alimentação (está em 5 V?) e se o GND é comum.'
          },
          {
            title: 'Osciloscópio',
            body: 'O osciloscópio mostra a tensão ao longo do tempo: serve para medir frequência, duty cycle de PWM, tempo de subida, ruído e ripple da fonte — coisas que o multímetro não enxerga. Use a ponta de prova em ×10, com o clipe de terra curto (um fio de terra longo capta ruído) e uma banda passante bem maior que a frequência do sinal (cerca de 5 vezes ou mais). O gatilho (trigger) estabiliza a imagem.'
          },
          {
            title: 'Analisador lógico',
            body: 'O analisador lógico captura vários canais digitais ao mesmo tempo e os decodifica como protocolos: mostra os bytes de uma UART, os endereços e dados de um I2C, os de um SPI, com a temporização relativa entre os sinais. Regra prática: osciloscópio para a qualidade analógica do sinal; analisador lógico para o conteúdo e a temporização dos protocolos digitais. Existem modelos baratos e software livre (como o PulseView).'
          },
          {
            title: 'Depuração por Serial e seu custo',
            body: 'Imprimir pela Serial é o método mais usado, mas tem custo: textos ocupam Flash e SRAM (use F()), cada byte a 9600 baud leva cerca de 1,04 ms para sair, a chamada bloqueia quando o buffer de transmissão enche, e imprimir muda o tempo do programa (um bug que desaparece ao depurar é um "heisenbug"). Não imprima dentro de ISR. Controle isso com macros que compilam o debug para fora na versão final.',
            code: '#define DEBUG 1\n#if DEBUG\n  #define DBG(x)  Serial.println(x)\n  #define DBGF(x) Serial.println(F(x))\n#else\n  #define DBG(x)\n  #define DBGF(x)\n#endif\n\nDBGF("sensor lido");\nDBG(valor);'
          },
          {
            title: 'Simulação',
            body: 'Simuladores como Tinkercad Circuits (para iniciantes), Wokwi (Arduino, ESP32 e Pico, com analisador lógico virtual e compartilhamento do projeto) e Proteus deixam validar a lógica sem hardware e sem risco de queimar peças. Limites: não reproduzem ruído, EMC, tolerância de componentes, queda de tensão em fios nem a temporização exata. Simulação valida ideias; o teste final é sempre no hardware real.'
          },
          {
            title: 'Testes unitários',
            body: 'Para testar sem hardware, separe a lógica dos pinos: funções que recebem valores e devolvem resultados (converter ADC em temperatura, calcular checksum, tratar um byte do protocolo, avançar a FSM) podem ser compiladas e testadas no PC, com frameworks como AUnit, ArduinoUnit ou o Unity do PlatformIO, ou até com um g++ comum. Um teste usa valores conhecidos (por exemplo, 0x12, 0x34, 0x56 deve dar checksum 0x70) e cobre também os casos de erro.',
            code: '// lógica pura: testável no PC\nuint8_t checksum(const uint8_t *d, uint8_t n) {\n  uint8_t c = 0;\n  for (uint8_t i = 0; i < n; i++) c ^= d[i];\n  return c;\n}\n// teste: {0x12,0x34,0x56} -> 0x70'
          },
          {
            title: 'Lendo o datasheet',
            body: 'O datasheet do ATmega328P traz: Pinout (função de cada pino), resumo e descrição dos registradores (nome de cada bit, leitura/escrita e valor inicial), tabelas de configuração (como CS12:0 para o prescaler) e Electrical Characteristics. Nesta seção, distinga Absolute Maximum Ratings (limites que, se excedidos, danificam o chip — NÃO são condições de operação) das condições recomendadas. Na prática, mantenha cada pino abaixo de 20 mA, mesmo que o máximo absoluto seja 40 mA, e respeite o limite de corrente total do chip.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Como se mede corrente com um multímetro?',
          choices: [
            { id: 'a', text: 'Com o circuito desligado e as pontas em curto' },
            { id: 'b', text: 'Sempre no modo continuidade' },
            { id: 'c', text: 'Em série com o circuito, usando o borne/escala de corrente' },
            { id: 'd', text: 'Em paralelo com a carga, na escala de tensão' }
          ],
          answer: 'c',
          explanation: 'A corrente precisa passar pelo medidor. Medir tensão com o multímetro em modo corrente é um curto.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual instrumento decodifica os bytes de uma UART, I2C ou SPI e mostra a temporização entre os sinais?',
          choices: [
            { id: 'a', text: 'Analisador lógico' },
            { id: 'b', text: 'Multímetro' },
            { id: 'c', text: 'Fonte de bancada' },
            { id: 'd', text: 'Ferro de solda' }
          ],
          answer: 'a',
          explanation: 'O analisador lógico captura canais digitais e decodifica os protocolos.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual é um limite importante dos simuladores como Tinkercad e Wokwi?',
          choices: [
            { id: 'a', text: 'Não executam código C++' },
            { id: 'b', text: 'Só funcionam com o Mega' },
            { id: 'c', text: 'Substituem completamente o teste em hardware' },
            { id: 'd', text: 'Não reproduzem ruído, EMC, tolerâncias nem a temporização exata do hardware real' }
          ],
          answer: 'd',
          explanation: 'Simulação valida a lógica; o teste final deve ser no hardware real.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o nome do instrumento que mostra a forma de onda do sinal ao longo do tempo:',
          code: '// para ver o PWM, o ripple e o tempo de subida: ___',
          accept: ['osciloscópio', 'osciloscopio'],
          explanation: 'O osciloscópio mostra tensão x tempo: frequência, duty, ruído e ripple.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Aproximadamente quanto tempo leva para uma mensagem de 20 bytes ser transmitida a 9600 baud (10 bits por byte)?',
          choices: [
            { id: 'a', text: 'Cerca de 21 µs' },
            { id: 'b', text: 'Cerca de 21 ms' },
            { id: 'c', text: 'Cerca de 2 ms' },
            { id: 'd', text: 'Cerca de 210 ms' }
          ],
          answer: 'b',
          explanation: '20 × 10 bits = 200 bits; 200 / 9600 ≈ 20,8 ms. Por isso depurar pela Serial altera a temporização.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que são os "Absolute Maximum Ratings" de um datasheet?',
          choices: [
            { id: 'a', text: 'O tempo de vida mínimo garantido' },
            { id: 'b', text: 'Limites que, se excedidos, podem danificar o chip; não são condições de operação' },
            { id: 'c', text: 'Os valores ideais de operação' },
            { id: 'd', text: 'A corrente típica de consumo' }
          ],
          answer: 'b',
          explanation: 'Opere dentro das condições recomendadas (por exemplo, até 20 mA por pino), bem abaixo do máximo absoluto.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual projeto de código facilita muito os testes unitários de um firmware?',
          choices: [
            { id: 'a', text: 'Ler os pinos diretamente dentro de cada função de cálculo' },
            { id: 'b', text: 'Usar apenas variáveis globais' },
            { id: 'c', text: 'Juntar tudo em uma única função loop()' },
            { id: 'd', text: 'Separar a lógica (funções que recebem e devolvem valores) do acesso aos pinos' }
          ],
          answer: 'd',
          explanation: 'Lógica pura pode ser compilada e testada no PC, sem hardware.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a diretiva do pré-processador que define uma macro:',
          code: '#___ DBG(x) Serial.println(x)',
          accept: ['define'],
          explanation: '#define cria a macro; com #if DEBUG ela pode ser compilada fora na versão final.'
        }
      ]
    },
    {
      id: 'ara-22-projeto-integrador',
      title: 'Projeto integrador: datalogger de baixo consumo',
      goal: 'Reunir a arquitetura de firmware de um datalogger a bateria (RTC, SD, sensor, FSM, sleep, watchdog) e aplicar um checklist de revisão de memória, ISR, energia, robustez e segurança.',
      xp: 30,
      intro: {
        slides: [
          {
            title: 'O projeto e seus requisitos',
            body: 'Vamos desenhar um datalogger de temperatura e umidade AMBIENTE: registra uma linha a cada 15 minutos em um cartão SD (CSV com data/hora, temperatura, umidade e tensão da bateria) e deve durar meses a bateria. Os dados são ambientais, sem identificar ninguém, o que evita dados pessoais desde o projeto. Pense em camadas: drivers (RTC, SD, sensor, ADC), lógica (a máquina de estados) e a aplicação.'
          },
          {
            title: 'Hardware e quem acorda quem',
            body: 'O RTC (por exemplo, o DS3231, por I2C) mantém a hora e gera um ALARME a cada 15 minutos, puxando uma linha de interrupção para LOW; essa linha vai ao pino 2 (INT0), que acorda o ATmega328P do power-down. Um sensor I2C de temperatura e umidade e um cartão SD (SPI) completam o conjunto. O cartão SD consome dezenas de mA ao gravar: alimente-o só quando necessário. Para consumo baixo, use o chip standalone ou uma placa sem o LED e o regulador.'
          },
          {
            title: 'A máquina de estados',
            body: 'Os estados: DORMINDO (power-down até o alarme do RTC), MEDINDO (confere a bateria e lê o sensor), GRAVANDO (grava a linha CSV e reprograma o alarme) e ERRO (cartão ausente ou bateria fraca: registra o erro e volta a dormir). A ISR só levanta uma flag volatile; o trabalho fica na FSM. O watchdog é ligado ao acordar e DESLIGADO antes de dormir, porque ele só chega a 8 s e o sono dura 15 minutos: sem isso, ele resetaria o chip durante o sono.',
            code: 'enum Estado { DORMINDO, MEDINDO, GRAVANDO, ERRO };\nEstado estado = MEDINDO;\nvolatile bool alarmeRtc = false;\n\nvoid isrAlarme() { alarmeRtc = true; }   // ISR mínima\n\nvoid loop() {\n  switch (estado) {\n    case DORMINDO:\n      dormirAteAlarme();               // power-down\n      if (alarmeRtc) {\n        alarmeRtc = false;\n        wdt_enable(WDTO_4S);           // vigia só enquanto acordado\n        estado = MEDINDO;\n      }\n      break;\n    case MEDINDO:\n      if (lerVcc() < 3000) { estado = ERRO; break; }\n      lerSensor();\n      estado = GRAVANDO;\n      break;\n    case GRAVANDO:\n      if (gravarLinhaCsv()) { reagendarAlarme(); wdt_disable(); estado = DORMINDO; }\n      else estado = ERRO;\n      break;\n    case ERRO:\n      registrarErro();\n      reagendarAlarme(); wdt_disable(); estado = DORMINDO;\n      break;\n  }\n  wdt_reset();\n}'
          },
          {
            title: 'Orçamento de energia',
            body: 'Estime a corrente média: se o dispositivo fica ativo (sensor + SD) a 20 mA por 5 s em cada ciclo de 1000 s e o sono é desprezível, a média é 20 mA × 5 / 1000 = 0,1 mA; uma bateria de 1000 mAh duraria cerca de 10 000 h (mais de um ano, sem contar a autodescarga). Antes de dormir: desligar o ADC (ADCSRA &= ~(1 << ADEN)), os periféricos pelo PRR e deixar pinos definidos. Antes de gravar no SD, meça o Vcc pela referência de 1,1 V: com bateria fraca, a gravação pode corromper o arquivo — melhor pular a gravação e registrar o erro.'
          },
          {
            title: 'Robustez de dados e de firmware',
            body: 'Dados: monte a linha CSV num char[] fixo (sem String), grave e use arquivo.flush() ou close() a cada registro, para que um reset não perca dados em buffer. Textos fixos em F() e tabelas em PROGMEM. Reset: registre a causa (MCUSR) numa pequena área da EEPROM, lembrando que a EEPROM aguenta da ordem de 100 mil gravações por célula, então grave só o necessário. Brown-out ligado (2,7 V) e saídas em estado seguro na partida completam a proteção.'
          },
          {
            title: 'Segurança e privacidade no projeto',
            body: 'Mesmo sem rádio, aplique os princípios: identifique o aparelho com um código anônimo (não com nome nem endereço), colete somente temperatura, umidade, hora e tensão da bateria, defina por quanto tempo os arquivos serão guardados e apague depois. Lembre-se de que a temperatura de uma casa pode revelar rotinas de moradores: trate com cuidado se o dispositivo estiver em ambiente residencial. Se mais tarde acrescentar Wi-Fi: credenciais em secrets.h fora do Git, TLS com validação do certificado, OTA autenticado e credencial única por dispositivo.'
          },
          {
            title: 'Checklist de revisão',
            body: 'Memória: F() e PROGMEM, RAM livre medida, sem String nem new, pilha com folga. ISR: curtas, variáveis volatile, leitura atômica de multi-byte, sem Serial nem delay. Energia: sleep profundo, ADC e periféricos desligados, desacoplamento no layout, média calculada. Robustez: watchdog, brown-out, causa do reset registrada, flush do SD, estado seguro. Segurança: sem segredos no repositório, sem dados pessoais, criptografia e OTA seguros se houver rádio. Testes: lógica testada no PC, ensaio de longa duração e com tensão mínima.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Como o datalogger acorda do power-down a cada 15 minutos?',
          choices: [
            { id: 'a', text: 'O alarme do RTC puxa a linha ligada ao pino 2 (INT0) para LOW, gerando a interrupção' },
            { id: 'b', text: 'O Timer0 conta 15 minutos durante o sono' },
            { id: 'c', text: 'O watchdog de 8 s é suficiente para contar 15 minutos' },
            { id: 'd', text: 'O cartão SD envia um comando de despertar' }
          ],
          answer: 'a',
          explanation: 'No power-down o clock principal está parado: só interrupções externas (como o alarme do RTC) acordam o chip.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'No código da FSM, o que acontece quando gravarLinhaCsv() devolve verdadeiro no estado GRAVANDO?',
          choices: [
            { id: 'a', text: 'Vai para ERRO' },
            { id: 'b', text: 'Reinicia o chip pelo watchdog' },
            { id: 'c', text: 'Reagenda o alarme, desliga o watchdog e vai para DORMINDO' },
            { id: 'd', text: 'Volta para MEDINDO imediatamente' }
          ],
          answer: 'c',
          explanation: 'Gravou com sucesso: reprograma o alarme do RTC, desarma o WDT e dorme.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Por que o watchdog é desligado antes de dormir neste projeto?',
          choices: [
            { id: 'a', text: 'Para liberar a SRAM' },
            { id: 'b', text: 'Porque o RTC já faz o papel do watchdog' },
            { id: 'c', text: 'O timeout máximo é 8 s, menor que os 15 minutos de sono, e resetaria o chip durante o sono' },
            { id: 'd', text: 'O WDT não funciona fora do power-down' }
          ],
          answer: 'c',
          explanation: 'Ele é ligado ao acordar, vigiando a parte ativa do ciclo, e desligado antes do sono longo.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o método do arquivo do SD que força a gravação dos dados em buffer no cartão sem fechá-lo:',
          code: 'arquivo.println(linha);\narquivo.___();',
          accept: ['flush'],
          explanation: 'flush() descarrega o buffer no cartão; assim um reset não perde o último registro.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O dispositivo consome 20 mA por 5 s a cada 1000 s e o sono é desprezível. Quanto dura uma bateria de 1000 mAh?',
          choices: [
            { id: 'a', text: 'Cerca de 10 000 h' },
            { id: 'b', text: 'Cerca de 1000 h' },
            { id: 'c', text: 'Cerca de 100 000 h' },
            { id: 'd', text: 'Cerca de 50 h' }
          ],
          answer: 'a',
          explanation: 'Média = 20 mA × 5 / 1000 = 0,1 mA; 1000 mAh / 0,1 mA = 10 000 h.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Por que medir o Vcc antes de gravar no cartão SD?',
          choices: [
            { id: 'a', text: 'Para escolher o prescaler do Timer1' },
            { id: 'b', text: 'Porque o SD só grava com exatos 5 V' },
            { id: 'c', text: 'Para aumentar o consumo' },
            { id: 'd', text: 'Com a bateria fraca, a gravação pode ser corrompida; é melhor pular e registrar o erro' }
          ],
          answer: 'd',
          explanation: 'Gravar com tensão insuficiente pode corromper o arquivo ou o sistema de arquivos.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual decisão de projeto melhor respeita a privacidade neste datalogger?',
          choices: [
            { id: 'a', text: 'Enviar os dados a um servidor sem criptografia' },
            { id: 'b', text: 'Código anônimo do aparelho, só temperatura/umidade/hora/bateria e prazo definido para apagar os dados' },
            { id: 'c', text: 'Registrar também o nome do morador e a localização exata' },
            { id: 'd', text: 'Guardar tudo para sempre, pois pode ser útil' }
          ],
          answer: 'b',
          explanation: 'Minimização (só o necessário), anonimato e retenção limitada.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a palavra-chave que a flag compartilhada entre a ISR e o loop() precisa ter:',
          code: '___ bool alarmeRtc = false;',
          accept: ['volatile'],
          explanation: 'volatile impede o compilador de guardar a flag em registrador e perder a atualização feita na ISR.'
        }
      ]
    }
  ]
};
