// Módulo "Fundamentos" (iniciante) — 18 lições, 8 questões cada (3 múltipla escolha + 1 lacuna,
// duas vezes por lição). Ver ../../index.js para o formato e a validação de boot. Foco no Arduino
// Uno (ATmega328P, 5 V, 16 MHz): hardware e eletricidade primeiro (lições 1–3), depois a linguagem
// (C++ de sketch) sempre acompanhada de um circuito simples, até chegar em sensores analógicos e
// depuração. Eletricidade e segurança vêm antes do código de propósito: um erro de fiação pode
// queimar um pino ou a placa, e um erro de lógica não.
// Convenção de ids: `ard-NN-slug`, NN na ordem pedagógica (01..18), únicos globalmente entre cursos.
module.exports = {
  id: 'fundamentos-arduino',
  levelKey: 'beginner',
  order: 1,
  title: 'Fundamentos',
  subtitle: 'Eletricidade, protoboard, sketches, entradas e saídas, sensores — a base para seus primeiros projetos',
  accent: '#00979d',
  lessons: [
    {
      id: 'ard-01-intro',
      title: 'O que é Arduino',
      goal: 'Entender o que é o Arduino, o que há dentro de uma placa Uno e como um programa (sketch) chega até ela.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'O que é Arduino',
            body: 'Arduino é uma plataforma de prototipagem eletrônica: uma placa (hardware) mais um ambiente para programá-la (software). Com ela você liga sensores, LEDs, botões e motores e diz, por código, o que deve acontecer. Prototipar significa montar e testar ideias rapidamente, antes de construir um produto final.'
          },
          {
            title: 'O cérebro: o microcontrolador',
            body: 'No centro da placa Arduino Uno há um microcontrolador chamado ATmega328P. Um microcontrolador é um computador completo e pequeno dentro de um único chip: tem processador, memória para o programa (flash, 32 KB), memória de trabalho (SRAM, 2 KB) e pinos para conversar com o mundo. O do Uno trabalha a 16 MHz (16 milhões de ciclos por segundo). Ele não tem sistema operacional como um PC: executa um único programa, do momento em que recebe energia até ser desligado.'
          },
          {
            title: 'A placa Arduino Uno',
            body: 'O Uno é a placa mais popular para aprender. Ela tem 14 pinos digitais (numerados de 0 a 13), 6 pinos analógicos (A0 a A5), pinos de alimentação (5V, 3,3V, GND), uma porta USB (para programar e também alimentar a placa) e um conector para fonte externa. Os pinos funcionam a 5 volts. Há também um LED embutido ligado ao pino 13, útil para os primeiros testes sem montar nada.'
          },
          {
            title: 'Open source e clones',
            body: 'Arduino é open source (código aberto): os esquemas elétricos da placa e o software são publicados livremente. Isso permite que qualquer pessoa estude, modifique e fabrique placas compatíveis (clones). Por isso existem muitos tutoriais, bibliotecas e uma comunidade enorme — e também placas compatíveis mais baratas, mas de qualidade variável.'
          },
          {
            title: 'IDE, sketch e upload',
            body: 'Você programa o Arduino na IDE (Ambiente de Desenvolvimento Integrado), um programa gratuito onde escreve, verifica e envia o código. Um programa de Arduino se chama sketch (esboço) e é escrito em uma linguagem baseada em C/C++. O fluxo é: escrever o sketch, compilar (traduzir para a linguagem do chip), e fazer o upload pelo cabo USB. O programa fica gravado na memória flash e continua lá mesmo sem energia.',
            code: '// Um sketch mínimo\nvoid setup() {\n}\n\nvoid loop() {\n}'
          },
          {
            title: 'Shields e outras placas',
            body: 'Shields são placas de expansão que se encaixam por cima do Arduino e adicionam funções prontas (como controle de motores, Ethernet ou display). Além do Uno existem outras placas da família: o Nano (pequeno, bom para protoboard), o Mega 2560 (muito mais pinos e memória) e o Leonardo (que pode se comportar como teclado ou mouse USB). A programação básica que você aprender aqui vale para quase todas.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que é um microcontrolador, como o ATmega328P do Arduino Uno?',
          choices: [
            { id: 'a', text: 'Uma fonte de energia que alimenta a placa' },
            { id: 'b', text: 'Um computador pequeno em um único chip, com processador, memória e pinos de entrada e saída' },
            { id: 'c', text: 'Um cabo usado para enviar o programa à placa' },
            { id: 'd', text: 'Um programa que traduz o código para a máquina' }
          ],
          answer: 'b',
          explanation: 'O microcontrolador reúne processador, memória e pinos em um só chip e executa o seu programa.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual é o microcontrolador presente no Arduino Uno?',
          choices: [
            { id: 'a', text: 'ESP32' },
            { id: 'b', text: 'Raspberry Pi' },
            { id: 'c', text: 'ATmega328P' },
            { id: 'd', text: 'Core i5' }
          ],
          answer: 'c',
          explanation: 'O Arduino Uno usa o ATmega328P, de 8 bits, a 16 MHz e 5 V.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Como é chamado um programa escrito para o Arduino?',
          choices: [
            { id: 'a', text: 'Sketch' },
            { id: 'b', text: 'Shield' },
            { id: 'c', text: 'Bootloader' },
            { id: 'd', text: 'Protoboard' }
          ],
          answer: 'a',
          explanation: 'Sketch (esboço) é o nome do programa do Arduino; shield é uma placa de expansão e protoboard serve para montar circuitos.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete: o ATmega328P é um ___, um computador completo dentro de um único chip.',
          code: 'O ATmega328P é um ___ (um computador completo dentro de um único chip)',
          accept: ['microcontrolador', 'Microcontrolador', 'microcontroller'],
          explanation: 'Microcontrolador é o chip que reúne processador, memória e pinos de entrada e saída.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que significa dizer que o Arduino é open source?',
          choices: [
            { id: 'a', text: 'Que ele só funciona com programas gratuitos' },
            { id: 'b', text: 'Que ele não precisa de energia para funcionar' },
            { id: 'c', text: 'Que ele só pode ser comprado em lojas oficiais' },
            { id: 'd', text: 'Que os esquemas da placa e o software são abertos, permitindo estudar, modificar e fabricar placas compatíveis' }
          ],
          answer: 'd',
          explanation: 'Open source significa projeto aberto: qualquer pessoa pode estudar e criar versões compatíveis.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual é a sequência correta para colocar um programa no Arduino?',
          choices: [
            { id: 'a', text: 'Fazer o upload, escrever o sketch e só depois compilar' },
            { id: 'b', text: 'Escrever o sketch na IDE, compilar e fazer o upload pelo cabo USB' },
            { id: 'c', text: 'Conectar um shield, depois escrever o sketch no próprio Arduino' },
            { id: 'd', text: 'Gravar o sketch num pendrive e ligá-lo na placa' }
          ],
          answer: 'b',
          explanation: 'Você escreve na IDE, o compilador traduz o código e o upload grava o resultado na flash do chip.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'O que é um shield?',
          choices: [
            { id: 'a', text: 'Uma capa plástica para proteger a placa' },
            { id: 'b', text: 'Um tipo de LED embutido' },
            { id: 'c', text: 'Uma placa de expansão que se encaixa sobre o Arduino e adiciona funções' },
            { id: 'd', text: 'Um programa antivírus para o Arduino' }
          ],
          answer: 'c',
          explanation: 'Shields se encaixam sobre a placa e adicionam recursos como controle de motores, rede ou display.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete: o programa em que você escreve e envia seu código ao Arduino é chamado de ___ (sigla de Ambiente de Desenvolvimento Integrado).',
          code: 'O programa para escrever e enviar o código ao Arduino se chama ___ (Ambiente de Desenvolvimento Integrado)',
          accept: ['IDE', 'ide', 'Arduino IDE'],
          explanation: 'IDE é o ambiente onde você escreve, compila e envia seus sketches.'
        }
      ]
    },
    {
      id: 'ard-02-eletricidade',
      title: 'Eletricidade básica',
      goal: 'Entender tensão, corrente, resistência e a Lei de Ohm, e conhecer os limites e cuidados de segurança ao trabalhar com o Arduino.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Tensão (volts)',
            body: 'Tensão é a "força" que empurra os elétrons por um circuito. Mede-se em volts (V). Uma analogia: é como a pressão da água numa tubulação. O Arduino Uno trabalha com 5 V nos seus pinos; uma pilha comum tem 1,5 V e a tomada de casa tem 127 V ou 220 V (perigosa!).'
          },
          {
            title: 'Corrente (ampères)',
            body: 'Corrente é a quantidade de elétrons que passa por um ponto a cada segundo — na analogia da água, a vazão. Mede-se em ampères (A). Em eletrônica pequena usamos o miliampère (mA): 1 A = 1000 mA. Um LED típico funciona com uns 10 a 20 mA. A corrente é o que realmente esquenta e danifica componentes.'
          },
          {
            title: 'Resistência (ohms)',
            body: 'Resistência é a oposição à passagem da corrente. Mede-se em ohms (símbolo Ω). Quanto maior a resistência, menor a corrente para a mesma tensão. Usamos resistores para limitar a corrente em componentes sensíveis, como LEDs. Múltiplos comuns: 1 kΩ = 1000 Ω e 1 MΩ = 1.000.000 Ω.'
          },
          {
            title: 'Lei de Ohm',
            body: 'A relação entre as três grandezas é a Lei de Ohm: V = R × I (tensão = resistência × corrente). Isolando: I = V / R e R = V / I. Exemplo: 5 V sobre um resistor de 1000 Ω gera I = 5 / 1000 = 0,005 A = 5 mA. Se a resistência cair para 250 Ω, a corrente sobe para 5 / 250 = 0,02 A = 20 mA. Use sempre volts, ohms e ampères nas contas (converta mA para A dividindo por 1000).',
            code: 'V = R x I\nI = V / R   ->  5 V / 1000 ohms = 0,005 A (5 mA)\nR = V / I   ->  5 V / 0,010 A = 500 ohms'
          },
          {
            title: '5V, 3,3V e GND',
            body: 'A placa Uno oferece alguns pinos de alimentação: 5V (fornece 5 volts), 3,3V (fornece 3,3 volts, para módulos que não aceitam 5 V) e GND (ground, o "terra" ou referência de 0 V). A corrente precisa de um caminho completo: sai do positivo (5V ou um pino em nível alto), passa pelos componentes e volta ao GND. Sem esse retorno, nada funciona.'
          },
          {
            title: 'Curto-circuito e polaridade',
            body: 'Curto-circuito acontece quando o positivo encontra o GND sem nenhuma resistência no caminho: a corrente dispara, esquenta fios e pode danificar a placa ou o computador. Cuidado ao encostar fios soltos! Polaridade é o sentido correto de ligação de componentes que têm lado positivo e negativo (como LED e buzzer ativo). Ligar ao contrário pode impedir o funcionamento ou queimá-los.'
          },
          {
            title: 'Limites e segurança',
            body: 'Cada pino de entrada/saída do ATmega328P suporta, de forma segura, até cerca de 20 mA; o limite absoluto é 40 mA e passar de 20 mA já é arriscado para a vida útil do chip. Por isso se coloca um resistor em série com o LED e não se liga um motor direto no pino. Boas práticas: monte e altere a fiação com o Arduino desligado (desconectado do USB), confira as ligações antes de energizar e nunca ligue cargas de rede elétrica (127/220 V) sem conhecimento, módulos próprios com isolação (como relé) e acompanhamento qualificado — esses níveis podem causar choque grave e incêndio. Os 5 V do USB são seguros ao toque.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual é a unidade de medida da tensão elétrica?',
          choices: [
            { id: 'a', text: 'Ohm (Ω)' },
            { id: 'b', text: 'Ampère (A)' },
            { id: 'c', text: 'Hertz (Hz)' },
            { id: 'd', text: 'Volt (V)' }
          ],
          answer: 'd',
          explanation: 'Tensão se mede em volts (V); corrente em ampères e resistência em ohms.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Um resistor de 1000 Ω é submetido a 5 V. Qual é a corrente que passa por ele (Lei de Ohm)?',
          choices: [
            { id: 'a', text: '5 mA' },
            { id: 'b', text: '50 mA' },
            { id: 'c', text: '500 mA' },
            { id: 'd', text: '5 A' }
          ],
          answer: 'a',
          explanation: 'I = V / R = 5 / 1000 = 0,005 A, ou seja, 5 mA.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Se a tensão continua a mesma e você AUMENTA a resistência do circuito, o que acontece com a corrente?',
          choices: [
            { id: 'a', text: 'Ela aumenta' },
            { id: 'b', text: 'Ela diminui' },
            { id: 'c', text: 'Ela fica igual' },
            { id: 'd', text: 'Ela muda de sentido' }
          ],
          answer: 'b',
          explanation: 'Como I = V / R, mais resistência com a mesma tensão resulta em menos corrente.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o nome do pino de referência de 0 V, o "terra" da placa:',
          code: 'O pino ___ é a referência de 0 V (terra) do circuito',
          accept: ['GND', 'gnd', 'Gnd', 'ground'],
          explanation: 'GND (ground) é o retorno comum da corrente, a referência de 0 volt.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Qual resistência é necessária para limitar a corrente a 10 mA com uma queda de 5 V sobre o resistor?',
          choices: [
            { id: 'a', text: '50 Ω' },
            { id: 'b', text: '5 kΩ' },
            { id: 'c', text: '0,5 Ω' },
            { id: 'd', text: '500 Ω' }
          ],
          answer: 'd',
          explanation: 'R = V / I = 5 / 0,010 = 500 Ω. Lembre de converter 10 mA para 0,010 A.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que é um curto-circuito?',
          choices: [
            { id: 'a', text: 'Um circuito muito pequeno, com poucos componentes' },
            { id: 'b', text: 'Quando o positivo se liga diretamente ao GND sem resistência, e a corrente dispara' },
            { id: 'c', text: 'Um circuito com resistores demais' },
            { id: 'd', text: 'Uma ligação que usa apenas fios curtos' }
          ],
          answer: 'b',
          explanation: 'No curto, nada limita a corrente, o que pode esquentar fios e danificar a placa ou a porta USB.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual é a corrente máxima recomendada (segura) por pino de E/S do ATmega328P e qual é o limite absoluto, acima do qual ele pode se danificar?',
          choices: [
            { id: 'a', text: 'Cerca de 2 mA recomendado e 4 mA absoluto' },
            { id: 'b', text: 'Cerca de 200 mA recomendado e 400 mA absoluto' },
            { id: 'c', text: 'Cerca de 20 mA recomendado e 40 mA absoluto' },
            { id: 'd', text: 'Não há limite, o pino aguenta qualquer corrente' }
          ],
          answer: 'c',
          explanation: 'Mantenha cada pino em até ~20 mA; 40 mA é o limite absoluto máximo, a partir do qual há risco de dano.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a Lei de Ohm (V = R × ___), em que a letra representa a corrente:',
          code: 'V = R x ___',
          accept: ['I', 'i', 'corrente', 'Corrente'],
          explanation: 'Na Lei de Ohm, V = R × I, em que I é a corrente em ampères.'
        }
      ]
    },
    {
      id: 'ard-03-protoboard',
      title: 'Protoboard e componentes',
      goal: 'Montar circuitos na protoboard e reconhecer LED, resistor, botão, buzzer e potenciômetro, calculando o resistor de um LED.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'A protoboard',
            body: 'A protoboard (placa de ensaio) permite montar circuitos sem solda: você apenas encaixa componentes e fios nos furos. Por dentro, os furos são ligados por tiras metálicas. Na área central, cada coluna de 5 furos (a-b-c-d-e de um lado, f-g-h-i-j do outro) está ligada eletricamente entre si; os dois lados são separados por um canal no meio (onde se encaixam chips). Nas laterais ficam as trilhas de alimentação, ligadas ao longo de todo o comprimento (uma para o positivo, + e outra para o negativo, −). Em algumas protoboards grandes essas trilhas são interrompidas no meio — confira com um fio.'
          },
          {
            title: 'Jumpers',
            body: 'Jumpers são os fios de ligação, com pontas rígidas para encaixar nos furos e nos pinos do Arduino. A cor não influencia o funcionamento, mas ajuda a organizar: por convenção, vermelho para 5V, preto (ou azul) para GND e outras cores para sinais. Fios bem organizados evitam erros e curtos.'
          },
          {
            title: 'LED e polaridade',
            body: 'LED (diodo emissor de luz) acende quando passa corrente por ele, mas só em um sentido. A perna mais longa é o ânodo (positivo) e a mais curta é o cátodo (negativo, lado com a borda do bulbo achatada). Um LED nunca deve ser ligado sem resistor em série: sem ele a corrente cresce demais e o LED queima. Ao acender, um LED vermelho comum "consome" cerca de 2 V da tensão (outros têm queda maior, por volta de 3 V para azul e branco).'
          },
          {
            title: 'Resistor e código de cores',
            body: 'O valor de um resistor é indicado por faixas coloridas. Cores e dígitos: preto 0, marrom 1, vermelho 2, laranja 3, amarelo 4, verde 5, azul 6, violeta 7, cinza 8, branco 9. Nos resistores de 4 faixas: a 1ª faixa é o primeiro dígito, a 2ª é o segundo dígito, a 3ª é o multiplicador (quantos zeros acrescentar) e a 4ª é a tolerância (dourado = ±5%). Resistores não têm polaridade, podem ser ligados em qualquer sentido.',
            code: 'vermelho vermelho marrom   = 2 2 x10   = 220 ohms\nmarrom   preto    vermelho = 1 0 x100  = 1 kohm\nmarrom   preto    laranja  = 1 0 x1000 = 10 kohms'
          },
          {
            title: 'Como calcular o resistor do LED',
            body: 'Use a Lei de Ohm com a tensão que sobra para o resistor: R = (Vfonte − Vled) / I. Exemplo: fonte de 5 V, LED vermelho de 2 V e corrente desejada de 10 mA: R = (5 − 2) / 0,010 = 300 Ω. Escolha um valor comercial igual ou um pouco maior (mais resistência = menos corrente e LED um pouco mais fraco, porém mais seguro). Valores como 220 Ω e 330 Ω são os mais usados com o Arduino.',
            code: 'R = (5 V - 2 V) / 0,010 A = 300 ohms\n// na prática: 330 ohms'
          },
          {
            title: 'Botão e potenciômetro',
            body: 'O botão (push button) tem 4 pernas; as duas pernas de cada lado estão sempre ligadas entre si, e ao apertar o botão os dois lados se conectam, fechando o circuito (ao soltar, o circuito abre). O potenciômetro é um resistor variável com 3 terminais: os dois extremos ficam ligados a 5V e GND, e o terminal do meio (cursor) entrega uma tensão que varia de 0 a 5 V conforme você gira o botão.'
          },
          {
            title: 'Buzzer',
            body: 'O buzzer é um componente que emite som. O buzzer ativo tem polaridade (perna longa, +) e um circuito interno que gera o tom sozinho: basta alimentá-lo. O buzzer passivo precisa receber um sinal oscilante do Arduino para soar e permite tocar notas diferentes. Veremos como usá-los mais adiante no curso.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Na área central de uma protoboard, como os furos estão ligados internamente?',
          choices: [
            { id: 'a', text: 'Todos os furos da placa estão ligados entre si' },
            { id: 'b', text: 'Os furos de cada linha horizontal estão ligados em toda a placa' },
            { id: 'c', text: 'Cada coluna de 5 furos de um lado do canal central está ligada entre si' },
            { id: 'd', text: 'Nenhum furo está ligado a outro' }
          ],
          answer: 'c',
          explanation: 'Na área central, as colunas de 5 furos são ligadas verticalmente; os dois lados do canal central são isolados entre si.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual perna de um LED é o ânodo (positivo)?',
          choices: [
            { id: 'a', text: 'A perna mais curta' },
            { id: 'b', text: 'A perna mais longa' },
            { id: 'c', text: 'A que fica do lado achatado do bulbo' },
            { id: 'd', text: 'Qualquer uma, o LED não tem polaridade' }
          ],
          answer: 'b',
          explanation: 'A perna longa é o ânodo (+); a curta, junto à borda achatada, é o cátodo (−).'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Um resistor tem as faixas marrom, preto e laranja (nessa ordem, as 3 primeiras). Qual é o valor?',
          choices: [
            { id: 'a', text: '103 Ω' },
            { id: 'b', text: '1,03 kΩ' },
            { id: 'c', text: '100 Ω' },
            { id: 'd', text: '10 kΩ' }
          ],
          answer: 'd',
          explanation: 'Marrom = 1, preto = 0, laranja = multiplicador ×1000, logo 10 × 1000 = 10 000 Ω = 10 kΩ.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a 3ª cor do resistor de 220 Ω (vermelho, vermelho, ...):',
          code: 'Resistor de 220 ohms: vermelho, vermelho, ___',
          accept: ['marrom', 'Marrom', 'marron'],
          explanation: '22 × 10 = 220 Ω: a faixa multiplicadora marrom vale ×10.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Qual resistor é adequado para um LED vermelho (queda de 2 V) com fonte de 5 V e corrente de cerca de 10 mA?',
          choices: [
            { id: 'a', text: 'Cerca de 300 Ω (na prática, 330 Ω)' },
            { id: 'b', text: 'Cerca de 3 Ω' },
            { id: 'c', text: 'Cerca de 30 kΩ' },
            { id: 'd', text: 'Nenhum resistor é necessário' }
          ],
          answer: 'a',
          explanation: 'R = (5 − 2) / 0,010 = 300 Ω. Sem resistor, o LED queimaria por excesso de corrente.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'No potenciômetro de 3 terminais, qual terminal entrega a tensão variável?',
          choices: [
            { id: 'a', text: 'Os dois terminais das pontas, em conjunto' },
            { id: 'b', text: 'Apenas o terminal ligado ao GND' },
            { id: 'c', text: 'Apenas o terminal ligado ao 5V' },
            { id: 'd', text: 'O terminal do meio (cursor)' }
          ],
          answer: 'd',
          explanation: 'Os extremos vão a 5V e GND; o terminal do meio entrega 0 a 5 V conforme o giro.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual é a diferença entre o buzzer ativo e o passivo?',
          choices: [
            { id: 'a', text: 'O ativo gera o tom sozinho ao ser alimentado; o passivo precisa de um sinal oscilante do Arduino' },
            { id: 'b', text: 'O ativo é maior e o passivo é menor, só isso' },
            { id: 'c', text: 'O passivo gera o tom sozinho; o ativo precisa de um sinal oscilante' },
            { id: 'd', text: 'Não há diferença; são nomes diferentes para o mesmo componente' }
          ],
          answer: 'a',
          explanation: 'O buzzer ativo tem o oscilador embutido; o passivo é controlado pelo sinal, o que permite notas diferentes.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete: a perna mais longa do LED é o ___ (positivo).',
          code: 'A perna mais longa do LED é o ___ (o lado positivo)',
          accept: ['ânodo', 'anodo', 'Ânodo', 'Anodo', 'anodo (+)', 'positivo'],
          explanation: 'O ânodo é o lado positivo do LED; a corrente entra por ele e sai pelo cátodo.'
        }
      ]
    },
    {
      id: 'ard-04-estrutura',
      title: 'Estrutura de um sketch',
      goal: 'Conhecer setup() e loop(), a diferença entre compilar e enviar, comentários, regras de sintaxe e como escolher placa e porta na IDE.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'As duas funções obrigatórias',
            body: 'Todo sketch tem duas funções principais. setup() roda UMA vez, quando a placa liga ou é reiniciada: serve para configurar pinos e preparar tudo. loop() roda em seguida e se repete para sempre, enquanto houver energia: é onde fica a lógica principal do projeto. A palavra void significa que a função não devolve nenhum valor.',
            code: 'void setup() {\n  // roda uma vez\n}\n\nvoid loop() {\n  // roda repetidamente\n}'
          },
          {
            title: 'Verificar (compilar) e enviar (upload)',
            body: 'Compilar é traduzir seu código C/C++ para o código de máquina do chip e checar erros de escrita; na IDE é o botão Verificar (✓). Enviar (upload) é compilar e, se estiver tudo certo, gravar o programa na placa pelo USB; na IDE é o botão Upload (→). Verificar não mexe na placa: use-o para testar se o código está correto, mesmo sem placa conectada. Ao enviar, o novo programa substitui o anterior.'
          },
          {
            title: 'Comentários',
            body: 'Comentários são textos que o compilador ignora, escritos para humanos. Use // para comentar até o fim da linha e /* ... */ para comentar vários blocos de linhas. Comente o porquê das coisas, não o óbvio — e também pode comentar código para desativá-lo temporariamente.',
            code: '// comentário de uma linha\n\n/* comentário\n   de várias linhas */\n\nint led = 13; // pino do LED'
          },
          {
            title: 'Ponto e vírgula e chaves',
            body: 'Cada instrução (comando) termina com ponto e vírgula (;). Esquecer o ; é o erro mais comum de iniciantes. Já as chaves { } delimitam blocos de código, como o corpo de uma função: toda { aberta precisa ter a } correspondente. Funções como setup() e loop() não levam ; depois dos parênteses ou da chave de fechamento.',
            code: 'void setup() {\n  pinMode(13, OUTPUT); // instrução termina com ;\n}'
          },
          {
            title: 'Maiúsculas e minúsculas importam',
            body: 'A linguagem do Arduino é case-sensitive: diferencia maiúsculas de minúsculas. Por isso digitalWrite funciona, mas digitalwrite, DigitalWrite ou Digitalwrite dão erro. O mesmo vale para suas variáveis: led e Led são nomes diferentes. Copie os nomes exatamente como aparecem na referência.'
          },
          {
            title: 'Escolher placa e porta na IDE',
            body: 'Antes do primeiro upload, informe à IDE qual placa você tem (menu Ferramentas > Placa > Arduino Uno) e em qual porta ela está (Ferramentas > Porta; no Windows aparece como COM3, COM4 etc., no Linux como /dev/ttyACM0 ou /dev/ttyUSB0). Se a porta não aparece, teste outro cabo USB (alguns só carregam, não transmitem dados) e verifique o driver. Placa ou porta erradas são a causa mais comum do erro no upload.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Quantas vezes a função setup() é executada?',
          choices: [
            { id: 'a', text: 'Repetidamente, para sempre' },
            { id: 'b', text: 'Uma única vez, quando a placa liga ou reinicia' },
            { id: 'c', text: 'Duas vezes: uma no início e outra no fim' },
            { id: 'd', text: 'Só quando você aperta um botão' }
          ],
          answer: 'b',
          explanation: 'setup() roda uma vez no início; depois quem fica se repetindo é o loop().'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que o botão Verificar (compilar) da IDE faz?',
          choices: [
            { id: 'a', text: 'Grava o programa na placa' },
            { id: 'b', text: 'Apaga o programa que está na placa' },
            { id: 'c', text: 'Traduz e checa o código em busca de erros, sem enviar nada à placa' },
            { id: 'd', text: 'Reinicia o computador' }
          ],
          answer: 'c',
          explanation: 'Verificar apenas compila; o Upload compila e também envia o programa pela porta USB.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual das linhas é um comentário válido de uma única linha?',
          choices: [
            { id: 'a', text: '# ligar o LED' },
            { id: 'b', text: '-- ligar o LED' },
            { id: 'c', text: '<!-- ligar o LED -->' },
            { id: 'd', text: '// ligar o LED' }
          ],
          answer: 'd',
          explanation: 'Em Arduino (C/C++), // inicia um comentário de linha e /* */ delimita comentários de várias linhas.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o nome da função que roda apenas uma vez no início do programa:',
          code: 'void ___() {\n  // configurações iniciais\n}',
          accept: ['setup', 'setup()'],
          explanation: 'setup() é executada uma única vez, antes do loop().'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Qual destas instruções causa erro de compilação?',
          choices: [
            { id: 'a', text: 'digitalWrite(13, HIGH);' },
            { id: 'b', text: 'digitalwrite(13, HIGH);' },
            { id: 'c', text: 'pinMode(13, OUTPUT);' },
            { id: 'd', text: 'delay(500);' }
          ],
          answer: 'b',
          explanation: 'A linguagem é case-sensitive: digitalwrite (com w minúsculo) não existe; o nome correto é digitalWrite.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que acontece se você esquecer o ; no fim de uma instrução, como em `delay(500)` seguido de outra linha?',
          choices: [
            { id: 'a', text: 'O compilador mostra um erro (por exemplo, expected \';\')' },
            { id: 'b', text: 'O Arduino coloca o ; automaticamente' },
            { id: 'c', text: 'Nada, o ; é opcional em Arduino' },
            { id: 'd', text: 'O programa roda, mas mais devagar' }
          ],
          answer: 'a',
          explanation: 'O ponto e vírgula é obrigatório ao fim de cada instrução; sem ele, a compilação falha.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'O upload falha com um erro de porta. Qual é uma causa comum?',
          choices: [
            { id: 'a', text: 'O sketch tem muitos comentários' },
            { id: 'b', text: 'O nome do sketch é muito longo' },
            { id: 'c', text: 'A placa ou a porta (COM) selecionada na IDE está errada, ou o cabo só carrega e não transmite dados' },
            { id: 'd', text: 'O loop() ainda está vazio' }
          ],
          answer: 'c',
          explanation: 'Selecione a placa certa (Arduino Uno) e a porta onde ela aparece, e use um cabo USB que transmita dados.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o caractere que termina cada instrução em um sketch:',
          code: 'int led = 13___',
          accept: [';', 'ponto e vírgula', 'ponto e virgula', 'ponto-e-vírgula'],
          explanation: 'O ponto e vírgula (;) encerra a instrução.'
        }
      ]
    },
    {
      id: 'ard-05-saidas-digitais',
      title: 'Saídas digitais e o Blink',
      goal: 'Controlar um LED com pinMode, digitalWrite e delay, entendendo HIGH, LOW e o clássico Blink.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Pinos digitais: dois estados',
            body: 'Um pino digital só tem dois estados possíveis: HIGH (alto, 5 V no Uno, também escrito como 1) e LOW (baixo, 0 V, também escrito como 0). Como saída, o pino coloca 5 V ou 0 V para acender um LED, ligar um módulo ou enviar um sinal. HIGH e LOW são constantes da linguagem, escritas em maiúsculas.'
          },
          {
            title: 'pinMode: definir a direção',
            body: 'Todo pino pode funcionar como saída (OUTPUT, o Arduino manda um sinal) ou como entrada (INPUT, o Arduino lê um sinal). Em setup(), diga o papel de cada pino com pinMode(pino, modo). Por padrão, os pinos começam como entrada, então é preciso configurar OUTPUT para os que vão acionar LEDs.',
            code: 'void setup() {\n  pinMode(8, OUTPUT); // pino 8 será saída\n}'
          },
          {
            title: 'digitalWrite: ligar e desligar',
            body: 'digitalWrite(pino, valor) coloca o pino em HIGH (5 V, LED aceso se estiver ligado corretamente) ou LOW (0 V, LED apagado). O pino mantém esse estado até que você mude de novo.',
            code: 'digitalWrite(8, HIGH); // liga\ndigitalWrite(8, LOW);  // desliga'
          },
          {
            title: 'delay: esperar',
            body: 'delay(tempo) pausa o programa pelo número de milissegundos informado (1000 ms = 1 segundo). Durante o delay, o Arduino fica parado nessa linha e não faz mais nada (ele "bloqueia"). Sem delay, o LED ligaria e desligaria milhares de vezes por segundo, rápido demais para o olho perceber.',
            code: 'delay(1000); // espera 1 segundo\ndelay(250);  // espera 0,25 segundo'
          },
          {
            title: 'O programa Blink',
            body: 'O Blink (piscar) é o "Olá, Mundo" do Arduino: liga o LED, espera, desliga, espera, e repete (graças ao loop()). Aqui o LED acende por 1 s e apaga por 1 s, então pisca uma vez a cada 2 segundos.',
            code: 'void setup() {\n  pinMode(8, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(8, HIGH);\n  delay(1000);\n  digitalWrite(8, LOW);\n  delay(1000);\n}'
          },
          {
            title: 'LED embutido e circuito externo',
            body: 'A placa Uno tem um LED embutido ligado ao pino 13; a constante LED_BUILTIN representa esse pino (valor 13 no Uno), e você já pode testar o Blink sem montar nada. Para um LED externo, monte: pino digital → resistor (por exemplo 220 Ω ou 330 Ω) → perna longa (ânodo) do LED → perna curta (cátodo) → GND. O resistor limita a corrente e protege LED e pino.',
            code: 'pinMode(LED_BUILTIN, OUTPUT);\ndigitalWrite(LED_BUILTIN, HIGH);'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Quais são os dois estados de um pino digital e as tensões correspondentes no Arduino Uno?',
          choices: [
            { id: 'a', text: 'HIGH = 5 V e LOW = 0 V' },
            { id: 'b', text: 'HIGH = 0 V e LOW = 5 V' },
            { id: 'c', text: 'HIGH = 12 V e LOW = 5 V' },
            { id: 'd', text: 'HIGH = 3,3 V e LOW = 1,5 V' }
          ],
          answer: 'a',
          explanation: 'No Uno, HIGH equivale a 5 V e LOW a 0 V.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Para que serve pinMode(7, OUTPUT)?',
          choices: [
            { id: 'a', text: 'Para ligar o pino 7 em 5 V' },
            { id: 'b', text: 'Para que o Arduino leia o valor do pino 7' },
            { id: 'c', text: 'Para configurar o pino 7 como saída, de modo que o Arduino possa enviar sinais por ele' },
            { id: 'd', text: 'Para apagar o pino 7 da placa' }
          ],
          answer: 'c',
          explanation: 'pinMode define o papel do pino; OUTPUT significa que o Arduino vai escrever nele.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Quanto tempo dura delay(1500)?',
          choices: [
            { id: 'a', text: '1,5 milissegundo' },
            { id: 'b', text: '15 segundos' },
            { id: 'c', text: '150 segundos' },
            { id: 'd', text: '1,5 segundo' }
          ],
          answer: 'd',
          explanation: 'delay recebe milissegundos: 1500 ms = 1,5 s.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o modo para configurar o pino 8 como saída:',
          code: 'pinMode(8, ___);',
          accept: ['OUTPUT'],
          explanation: 'OUTPUT configura o pino como saída; INPUT o configura como entrada.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que este trecho faz?\n\nvoid loop() {\n  digitalWrite(8, HIGH);\n  delay(500);\n  digitalWrite(8, LOW);\n  delay(500);\n}',
          choices: [
            { id: 'a', text: 'Mantém o LED sempre aceso' },
            { id: 'b', text: 'Pisca o LED 1 vez a cada 5 segundos' },
            { id: 'c', text: 'Acende e apaga o LED uma única vez' },
            { id: 'd', text: 'Pisca o LED: 0,5 s aceso e 0,5 s apagado, repetidamente' }
          ],
          answer: 'd',
          explanation: 'O loop() repete para sempre: liga, espera 500 ms, desliga, espera 500 ms. Um ciclo completo dura 1 segundo.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'A que pino está ligado o LED embutido do Arduino Uno, representado pela constante LED_BUILTIN?',
          choices: [
            { id: 'a', text: 'Pino 1' },
            { id: 'b', text: 'Pino 13' },
            { id: 'c', text: 'Pino 5' },
            { id: 'd', text: 'Pino A0' }
          ],
          answer: 'b',
          explanation: 'No Uno, LED_BUILTIN vale 13, permitindo testar o Blink sem circuito externo.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual é o circuito correto para acender um LED externo com segurança por um pino digital?',
          choices: [
            { id: 'a', text: 'Pino ligado direto no LED, sem resistor, e o LED ao GND' },
            { id: 'b', text: 'Pino → resistor → ânodo (perna longa) do LED → cátodo → GND' },
            { id: 'c', text: 'Pino → LED → 5V' },
            { id: 'd', text: 'Pino → resistor → cátodo do LED → ânodo → GND' }
          ],
          answer: 'b',
          explanation: 'O resistor limita a corrente; o LED precisa estar com ânodo para o lado do pino e cátodo para o GND.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete para esperar 2 segundos (lembre: o tempo é em milissegundos):',
          code: 'delay(___);',
          accept: ['2000'],
          explanation: '2 segundos = 2000 milissegundos.'
        }
      ]
    },
    {
      id: 'ard-06-variaveis',
      title: 'Variáveis e tipos de dados',
      goal: 'Declarar variáveis, escolher o tipo certo no Uno, usar const e #define, entender escopo e overflow.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'O que é uma variável',
            body: 'Uma variável é um espaço nomeado na memória para guardar um valor que pode mudar. Para criar uma, informe o tipo, o nome e (opcionalmente) o valor inicial: tipo nome = valor;. Usar variáveis evita "números mágicos" repetidos no código: se o LED mudar de pino, você corrige em um só lugar.',
            code: 'int pinoLed = 8;\nint tempo = 500;\n\npinMode(pinoLed, OUTPUT);\ndelay(tempo);'
          },
          {
            title: 'Tipos inteiros',
            body: 'int guarda números inteiros e no Uno ocupa 16 bits (2 bytes): vai de −32768 a 32767. long ocupa 32 bits (4 bytes) e vai de cerca de −2,1 bilhões a +2,1 bilhões. A palavra unsigned (sem sinal) elimina números negativos e dobra o limite positivo: unsigned int vai de 0 a 65535 e unsigned long vai de 0 a 4.294.967.295 (usado para guardar tempos em milissegundos).',
            code: 'int temperatura = -5;\nlong populacao = 100000;\nunsigned int contagem = 60000;\nunsigned long tempoMs = 0;'
          },
          {
            title: 'float, bool, char e byte',
            body: 'float guarda números com vírgula (escritos com ponto, como 3.14), com cerca de 6 a 7 dígitos de precisão. Se você atribuir um float a um int, a parte decimal é descartada (3.9 vira 3). bool (ou boolean) guarda true (verdadeiro) ou false (falso). char guarda um único caractere entre aspas simples (\'A\') e na prática é um número de 8 bits. byte guarda de 0 a 255 (8 bits, sem sinal).',
            code: 'float pi = 3.14;\nbool ligado = true;\nchar letra = \'A\';\nbyte brilho = 200;'
          },
          {
            title: 'const e #define',
            body: 'Para valores que nunca devem mudar (como o número de um pino), use const: const int LED = 8; — se o código tentar alterar a variável, o compilador acusa erro. A alternativa mais antiga é #define, que faz o compilador trocar o nome pelo valor antes de compilar; nele não se usa = nem ; no final. Por convenção, constantes têm nomes em MAIÚSCULAS.',
            code: 'const int LED = 8;\n#define BOTAO 2   // sem = e sem ;'
          },
          {
            title: 'Escopo: local e global',
            body: 'O escopo define onde uma variável pode ser usada. Uma variável global é declarada fora de qualquer função e vale em todo o sketch. Uma variável local é declarada dentro de uma função (ou bloco com chaves) e só existe ali; a cada execução da função ela é criada de novo (se não for static). Use globais para valores que precisam ser lembrados entre execuções do loop().',
            code: 'int contador = 0;       // global: lembra o valor\n\nvoid loop() {\n  int temp = 5;         // local: recriada a cada volta\n  contador = contador + 1;\n}'
          },
          {
            title: 'Overflow (estouro)',
            body: 'Cada tipo tem um limite. Passar do máximo causa overflow: o valor "dá a volta". Um int em 32767 mais 1 vira −32768; um byte em 255 mais 1 vira 0; um unsigned int em 65535 mais 1 vira 0. Isso causa bugs difíceis de achar; escolha um tipo que caiba nos seus dados, usando long ou unsigned long para valores grandes.',
            code: 'int x = 32767;\nx = x + 1;      // x vira -32768\n\nbyte b = 255;\nb = b + 1;      // b vira 0'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual é o maior valor que um int pode guardar no Arduino Uno?',
          choices: [
            { id: 'a', text: '255' },
            { id: 'b', text: '65535' },
            { id: 'c', text: '32767' },
            { id: 'd', text: '2.147.483.647' }
          ],
          answer: 'c',
          explanation: 'No Uno, int tem 16 bits com sinal: de −32768 a 32767. (Em placas de 32 bits é diferente.)'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual tipo é o mais adequado para guardar a temperatura 23.7?',
          choices: [
            { id: 'a', text: 'float' },
            { id: 'b', text: 'int' },
            { id: 'c', text: 'bool' },
            { id: 'd', text: 'char' }
          ],
          answer: 'a',
          explanation: 'Valores com parte decimal pedem float; um int descartaria o .7.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual é o valor de x no final?\n\nint x = 3.9;',
          choices: [
            { id: 'a', text: '4' },
            { id: 'b', text: '3' },
            { id: 'c', text: '3.9' },
            { id: 'd', text: 'Erro: não compila' }
          ],
          answer: 'b',
          explanation: 'Ao atribuir um decimal a um int, a parte decimal é descartada (truncamento), não arredondada: x = 3.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o tipo ideal para guardar números com vírgula, como 3.14:',
          code: '___ pi = 3.14;',
          accept: ['float', 'double'],
          explanation: 'float guarda números decimais. (No Uno, double tem o mesmo tamanho do float.)'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que acontece neste trecho?\n\nbyte b = 255;\nb = b + 1;',
          choices: [
            { id: 'a', text: 'b vira 256' },
            { id: 'b', text: 'O programa trava' },
            { id: 'c', text: 'O compilador acusa erro' },
            { id: 'd', text: 'Ocorre overflow e b vira 0' }
          ],
          answer: 'd',
          explanation: 'byte vai de 0 a 255; passar do limite faz o valor dar a volta e voltar a 0.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual é a diferença entre variável global e local?',
          choices: [
            { id: 'a', text: 'A global é declarada dentro de uma função; a local, fora' },
            { id: 'b', text: 'A global é declarada fora das funções e vale em todo o sketch; a local só existe dentro da função onde foi declarada' },
            { id: 'c', text: 'Não há diferença prática' },
            { id: 'd', text: 'A local guarda o valor para sempre; a global some quando a função termina' }
          ],
          answer: 'b',
          explanation: 'Globais ficam fora das funções e persistem; locais só existem no bloco em que foram declaradas.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual forma está correta para definir uma constante com #define?',
          choices: [
            { id: 'a', text: '#define LED = 8;' },
            { id: 'b', text: '#define int LED = 8;' },
            { id: 'c', text: '#define LED 8' },
            { id: 'd', text: '#define(LED, 8);' }
          ],
          answer: 'c',
          explanation: '#define NOME valor — sem sinal de igual e sem ponto e vírgula, pois não é uma instrução e sim uma diretiva para o pré-processador.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a palavra-chave que impede que o valor do pino seja alterado depois:',
          code: '___ int LED = 8;',
          accept: ['const'],
          explanation: 'const marca a variável como constante; o compilador impede qualquer alteração posterior.'
        }
      ]
    },
    {
      id: 'ard-07-operadores',
      title: 'Operadores',
      goal: 'Usar operadores aritméticos, de comparação e lógicos, incluindo divisão inteira, módulo, incremento e atribuição composta.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Operadores aritméticos',
            body: 'Os operadores básicos de cálculo são + (soma), - (subtração), * (multiplicação), / (divisão) e % (módulo, o resto da divisão). A atribuição é feita com um único =, que guarda o resultado à direita na variável à esquerda. A ordem é a da matemática: multiplicação, divisão e módulo antes de soma e subtração; use parênteses para deixar a intenção clara.',
            code: 'int a = 2 + 3 * 4;   // 14\nint b = (2 + 3) * 4; // 20\nint c = 10 - 4;      // 6'
          },
          {
            title: 'Divisão inteira e módulo',
            body: 'Quando os dois números da divisão são inteiros, o resultado também é inteiro: a parte decimal é descartada. 7 / 2 resulta em 3, não 3,5. Para obter decimal, use ao menos um número decimal (7 / 2.0 resulta em 3.5). O operador % devolve o resto: 7 % 2 é 1. O módulo é ótimo para saber se um número é par (n % 2 == 0) ou para fazer um contador "dar a volta" (i % 10 vai sempre de 0 a 9).',
            code: 'int q = 7 / 2;      // 3\nfloat f = 7 / 2.0;  // 3.5\nint r = 7 % 2;      // 1\nint s = 10 % 5;     // 0'
          },
          {
            title: 'Operadores de comparação',
            body: 'Comparam dois valores e dão como resultado true ou false: == (igual a), != (diferente de), < (menor), > (maior), <= (menor ou igual) e >= (maior ou igual). Cuidado clássico: = atribui um valor, == compara. Escrever if (x = 5) em vez de if (x == 5) compila, mas altera x e quase sempre é um bug.',
            code: 'x == 5   // x é igual a 5?\nx != 5   // x é diferente de 5?\nx >= 10  // x é maior ou igual a 10?'
          },
          {
            title: 'Operadores lógicos',
            body: 'Combinam condições: && (E) só é verdadeiro se as DUAS condições forem verdadeiras; || (OU) é verdadeiro se PELO MENOS UMA for; ! (NÃO) inverte o valor (!true vale false). Eles são úteis para testar faixas, como "temperatura maior que 20 E menor que 30".',
            code: '(t > 20) && (t < 30)  // dentro da faixa\n(a == 1) || (b == 1)  // um dos dois\n!ligado               // inverso de ligado'
          },
          {
            title: 'Incremento e decremento',
            body: 'Somar ou subtrair 1 é tão comum que existem atalhos: x++ equivale a x = x + 1 e x-- equivale a x = x - 1. Eles são muito usados para contar eventos e em laços.',
            code: 'int n = 5;\nn++;  // n vale 6\nn--;  // n volta a 5'
          },
          {
            title: 'Atribuição composta',
            body: 'Para modificar uma variável usando o valor dela mesma há atalhos: += (soma e atribui), -=, *=, /= e %=. Por exemplo, x += 3 é o mesmo que x = x + 3. Deixam o código mais curto e legível.',
            code: 'int x = 2;\nx += 3;  // x = 5\nx *= 4;  // x = 20\nx -= 5;  // x = 15\nx /= 3;  // x = 5'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual é o valor de int r = 10 % 3; ?',
          choices: [
            { id: 'a', text: '3' },
            { id: 'b', text: '0' },
            { id: 'c', text: '1' },
            { id: 'd', text: '3,33' }
          ],
          answer: 'c',
          explanation: 'O operador % devolve o resto da divisão: 10 dividido por 3 dá 3 e sobra 1.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual é o valor de x em int x = 7 / 2; ?',
          choices: [
            { id: 'a', text: '3' },
            { id: 'b', text: '3,5' },
            { id: 'c', text: '4' },
            { id: 'd', text: '3,0' }
          ],
          answer: 'a',
          explanation: 'Divisão entre inteiros descarta a parte decimal: 7 / 2 = 3.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual é a diferença entre = e == ?',
          choices: [
            { id: 'a', text: 'São iguais, só mudam de estilo' },
            { id: 'b', text: '= compara e == atribui' },
            { id: 'c', text: '= é usado só em laços' },
            { id: 'd', text: '= atribui um valor a uma variável e == compara dois valores' }
          ],
          answer: 'd',
          explanation: 'Usar = dentro de um if por engano atribui o valor em vez de comparar, causando bugs sutis.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o operador que soma 1 à variável (incremento):',
          code: 'contador___;',
          accept: ['++'],
          explanation: 'contador++ equivale a contador = contador + 1.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Qual é o resultado de (5 > 3) && (2 > 4) ?',
          choices: [
            { id: 'a', text: 'true' },
            { id: 'b', text: 'false' },
            { id: 'c', text: '1 e 0 ao mesmo tempo' },
            { id: 'd', text: 'Erro de compilação' }
          ],
          answer: 'b',
          explanation: '&& exige que as duas condições sejam verdadeiras. 5 > 3 é true, mas 2 > 4 é false, logo o resultado é false.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual é o valor de x no final?\n\nint x = 2;\nx += 3;\nx *= 2;',
          choices: [
            { id: 'a', text: '7' },
            { id: 'b', text: '8' },
            { id: 'c', text: '12' },
            { id: 'd', text: '10' }
          ],
          answer: 'd',
          explanation: 'x começa em 2, x += 3 vira 5 e x *= 2 vira 10.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual é o resultado de 2 + 3 * 4 ?',
          choices: [
            { id: 'a', text: '14' },
            { id: 'b', text: '20' },
            { id: 'c', text: '24' },
            { id: 'd', text: '9' }
          ],
          answer: 'a',
          explanation: 'A multiplicação vem antes da soma: 3 * 4 = 12 e 2 + 12 = 14. Com parênteses, (2 + 3) * 4 daria 20.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o operador que dá o resto da divisão (resultado 1 neste caso):',
          code: 'int r = 10 ___ 3;',
          accept: ['%'],
          explanation: 'O operador % (módulo) devolve o resto da divisão inteira: 10 % 3 = 1.'
        }
      ]
    },
    {
      id: 'ard-08-condicionais',
      title: 'Condicionais: if, else e switch',
      goal: 'Tomar decisões no programa com if, else if, else e switch/case.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'if: executar só se for verdadeiro',
            body: 'A estrutura if (condição) { ... } executa o bloco entre chaves somente se a condição for verdadeira. A condição é uma expressão com resultado true ou false, como x > 10 ou temperatura <= 5. Se for falsa, o bloco é pulado e o programa segue adiante.',
            code: 'if (temperatura > 30) {\n  digitalWrite(8, HIGH); // liga o alerta\n}'
          },
          {
            title: 'else: o caminho alternativo',
            body: 'else define o que fazer quando a condição do if é falsa. Assim você garante que sempre uma das duas ações será executada: ou a do if ou a do else, nunca as duas.',
            code: 'if (temperatura > 30) {\n  digitalWrite(8, HIGH);\n} else {\n  digitalWrite(8, LOW);\n}'
          },
          {
            title: 'else if: várias faixas',
            body: 'Para mais de duas opções, encadeie com else if. As condições são testadas de cima para baixo e só o PRIMEIRO bloco cuja condição for verdadeira roda; o else final, opcional, cobre o que sobrou.',
            code: 'if (nivel < 30) {\n  // baixo\n} else if (nivel < 70) {\n  // médio\n} else {\n  // alto\n}'
          },
          {
            title: 'Combinando condições',
            body: 'Dentro do if, use os operadores lógicos && (E), || (OU) e ! (NÃO) para combinar testes. Um bool pode ser usado diretamente como condição, sem precisar comparar com true.',
            code: 'if (temperatura > 20 && temperatura < 30) {\n  // faixa confortável\n}\n\nbool ligado = true;\nif (ligado) {\n  // roda quando ligado for true\n}'
          },
          {
            title: 'switch/case: escolher entre valores exatos',
            body: 'Quando uma mesma variável é comparada com vários valores exatos, o switch fica mais limpo que muitos else if. Cada case é um valor possível; o default roda se nenhum case combinar. O switch funciona com inteiros e caracteres, não com faixas nem float.',
            code: 'switch (opcao) {\n  case 1:\n    digitalWrite(8, HIGH);\n    break;\n  case 2:\n    digitalWrite(9, HIGH);\n    break;\n  default:\n    digitalWrite(8, LOW);\n}'
          },
          {
            title: 'O break no switch',
            body: 'O break encerra o switch. Se você esquecê-lo, a execução "cai" para o case seguinte e executa o código dele também (fall-through) mesmo sem o valor combinar — um bug comum. Quase sempre termine cada case com break; o default, por ser o último, não precisa.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Quando o bloco de um if (condição) { ... } é executado?',
          choices: [
            { id: 'a', text: 'Sempre, independentemente da condição' },
            { id: 'b', text: 'Nunca, o if só serve de comentário' },
            { id: 'c', text: 'Somente quando a condição é verdadeira' },
            { id: 'd', text: 'Somente quando a condição é falsa' }
          ],
          answer: 'c',
          explanation: 'O bloco do if só roda se a condição resultar em true.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual valor de saída o trecho produz se x = 15?\n\nif (x < 10) {\n  r = 1;\n} else if (x < 20) {\n  r = 2;\n} else {\n  r = 3;\n}',
          choices: [
            { id: 'a', text: 'r = 1' },
            { id: 'b', text: 'r = 2' },
            { id: 'c', text: 'r = 3' },
            { id: 'd', text: 'r = 2 e r = 3, os dois' }
          ],
          answer: 'b',
          explanation: 'x < 10 é falso; x < 20 é verdadeiro, então roda esse bloco e o resto é ignorado: r = 2.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual condição testa se t está entre 20 e 30 (exclusive)?',
          choices: [
            { id: 'a', text: 't > 20 || t < 30' },
            { id: 'b', text: '20 < t < 30' },
            { id: 'c', text: 't > 20 && t < 30' },
            { id: 'd', text: 't == 20 && t == 30' }
          ],
          answer: 'c',
          explanation: 'É preciso que as duas condições sejam verdadeiras ao mesmo tempo, logo &&. Com || qualquer número passaria; e 20 < t < 30 não funciona em C/C++.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a palavra que define o caminho alternativo, quando o if for falso:',
          code: 'if (x > 10) {\n  digitalWrite(8, HIGH);\n} ___ {\n  digitalWrite(8, LOW);\n}',
          accept: ['else'],
          explanation: 'else executa quando a condição do if é falsa.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Qual é o problema deste if?\n\nif (x = 5) {\n  // ...\n}',
          choices: [
            { id: 'a', text: 'Não há problema algum' },
            { id: 'b', text: 'Falta o ponto e vírgula depois do parêntese' },
            { id: 'c', text: 'if não aceita números' },
            { id: 'd', text: 'Usa = (atribuição) em vez de == (comparação): altera x e a condição é sempre verdadeira' }
          ],
          answer: 'd',
          explanation: 'x = 5 atribui 5 a x e o resultado (5, diferente de zero) conta como verdadeiro. O correto é x == 5.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Para que serve o default em um switch?',
          choices: [
            { id: 'a', text: 'Executa quando nenhum dos case combina com o valor' },
            { id: 'b', text: 'Define o primeiro case do switch' },
            { id: 'c', text: 'Encerra o switch' },
            { id: 'd', text: 'É obrigatório e roda sempre primeiro' }
          ],
          answer: 'a',
          explanation: 'default é o caminho de reserva do switch, parecido com o else final de uma cadeia de if.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'O que acontece se esquecer o break no fim de um case do switch?',
          choices: [
            { id: 'a', text: 'O compilador acusa erro' },
            { id: 'b', text: 'O switch é ignorado' },
            { id: 'c', text: 'A execução continua para o case seguinte, executando o código dele também (fall-through)' },
            { id: 'd', text: 'O programa reinicia' }
          ],
          answer: 'c',
          explanation: 'Sem o break, o código de cases seguintes roda mesmo sem o valor combinar — por isso o break quase sempre é necessário.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a instrução que encerra um case do switch:',
          code: 'case 1:\n  digitalWrite(8, HIGH);\n  ___;',
          accept: ['break'],
          explanation: 'break sai do switch e evita o fall-through.'
        }
      ]
    },
    {
      id: 'ard-09-entradas-digitais',
      title: 'Entradas digitais e botões',
      goal: 'Ler um botão com digitalRead, evitar pinos flutuantes com pull-down, pull-up e INPUT_PULLUP e entender a lógica invertida.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'digitalRead: ler um pino',
            body: 'Para ler um sinal digital, configure o pino como entrada (pinMode(pino, INPUT)) e use digitalRead(pino), que devolve HIGH (tensão alta, perto de 5 V) ou LOW (perto de 0 V). Assim o Arduino percebe botões, chaves e sensores digitais.',
            code: 'pinMode(2, INPUT);\nint estado = digitalRead(2); // HIGH ou LOW'
          },
          {
            title: 'O pino flutuante',
            body: 'Se um pino de entrada não está ligado firmemente a 5 V nem a GND (por exemplo, um botão aberto ligado só a um lado), ele fica "flutuante": capta ruído elétrico do ambiente e a leitura oscila de forma imprevisível entre HIGH e LOW. A solução é garantir que o pino sempre tenha um nível definido, com um resistor de pull-down ou de pull-up.'
          },
          {
            title: 'Resistor de pull-down',
            body: 'No pull-down, um resistor (tipicamente 10 kΩ) liga o pino ao GND, mantendo o pino em LOW quando o botão está solto. O botão liga o pino ao 5V: ao apertá-lo, o pino vai a HIGH. Lógica direta: apertado = HIGH, solto = LOW. O resistor é grande para que, ao apertar, passe pouca corrente do 5V para o GND.'
          },
          {
            title: 'Resistor de pull-up',
            body: 'No pull-up, o resistor (por exemplo, 10 kΩ) liga o pino ao 5V, mantendo-o em HIGH com o botão solto. O botão liga o pino ao GND: ao apertar, o pino vai a LOW. A lógica é invertida: apertado = LOW, solto = HIGH.'
          },
          {
            title: 'INPUT_PULLUP: o pull-up interno',
            body: 'O ATmega328P já tem resistores de pull-up internos (entre cerca de 20 kΩ e 50 kΩ) que você ativa por código com pinMode(pino, INPUT_PULLUP). Assim não é preciso resistor externo: ligue o botão entre o pino e o GND. Como é um pull-up, a lógica é invertida: solto = HIGH e pressionado = LOW. É a forma mais comum e econômica de ler botões no Arduino.',
            code: 'pinMode(2, INPUT_PULLUP);\n\nif (digitalRead(2) == LOW) {\n  // botão pressionado\n}'
          },
          {
            title: 'Exemplo: botão acende LED',
            body: 'Ao juntar entrada e saída, o botão controla o LED. Observe a lógica invertida com INPUT_PULLUP: o LED acende enquanto o botão está LOW (pressionado). Dica: contatos mecânicos "quicam" e geram leituras múltiplas em milissegundos (bounce); para contar apertos, um pequeno delay (cerca de 20 a 50 ms) após detectar a mudança ajuda a evitar contagens falsas.',
            code: 'const int BOTAO = 2;\nconst int LED = 8;\n\nvoid setup() {\n  pinMode(BOTAO, INPUT_PULLUP);\n  pinMode(LED, OUTPUT);\n}\n\nvoid loop() {\n  if (digitalRead(BOTAO) == LOW) {\n    digitalWrite(LED, HIGH);\n  } else {\n    digitalWrite(LED, LOW);\n  }\n}'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que digitalRead(2) devolve?',
          choices: [
            { id: 'a', text: 'Um número de 0 a 1023' },
            { id: 'b', text: 'HIGH ou LOW, conforme a tensão no pino 2' },
            { id: 'c', text: 'A temperatura do pino 2' },
            { id: 'd', text: 'O nome do componente ligado ao pino 2' }
          ],
          answer: 'b',
          explanation: 'digitalRead retorna HIGH (alto) ou LOW (baixo); leituras de 0 a 1023 são do analogRead.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que é um pino flutuante?',
          choices: [
            { id: 'a', text: 'Um pino ligado a um LED que pisca' },
            { id: 'b', text: 'Um pino que só funciona com pilha' },
            { id: 'c', text: 'Um pino de entrada sem nível definido (nem 5 V nem GND), que capta ruído e lê valores imprevisíveis' },
            { id: 'd', text: 'Um pino da placa que não existe' }
          ],
          answer: 'c',
          explanation: 'Sem pull-up ou pull-down, o pino aberto oscila entre HIGH e LOW com o ruído elétrico.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Com um resistor de pull-down externo, qual é a leitura com o botão (ligado ao 5V) solto e com ele pressionado?',
          choices: [
            { id: 'a', text: 'Solto = HIGH, pressionado = LOW' },
            { id: 'b', text: 'Solto = LOW, pressionado = HIGH' },
            { id: 'c', text: 'Sempre HIGH' },
            { id: 'd', text: 'Imprevisível nas duas situações' }
          ],
          answer: 'b',
          explanation: 'O pull-down mantém o pino em LOW (via GND) quando solto; ao pressionar, o botão leva o pino ao 5V (HIGH).'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a função que lê o estado do pino 2:',
          code: 'int estado = ___(2);',
          accept: ['digitalRead'],
          explanation: 'digitalRead(pino) lê HIGH ou LOW de um pino digital.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Um botão está ligado entre o pino 2 e o GND, com pinMode(2, INPUT_PULLUP). Qual condição detecta o botão pressionado?',
          choices: [
            { id: 'a', text: 'digitalRead(2) == HIGH' },
            { id: 'b', text: 'digitalRead(2) == 5' },
            { id: 'c', text: 'digitalRead(2) == 1023' },
            { id: 'd', text: 'digitalRead(2) == LOW' }
          ],
          answer: 'd',
          explanation: 'Com INPUT_PULLUP o pino fica em HIGH quando solto; ao pressionar, o botão liga o pino ao GND e a leitura é LOW (lógica invertida).'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual é a grande vantagem do INPUT_PULLUP?',
          choices: [
            { id: 'a', text: 'Usa o resistor de pull-up interno do chip, dispensando o resistor externo' },
            { id: 'b', text: 'Faz o pino aguentar mais corrente' },
            { id: 'c', text: 'Converte o sinal em analógico' },
            { id: 'd', text: 'Elimina a lógica invertida' }
          ],
          answer: 'a',
          explanation: 'O ATmega328P tem pull-ups internos (cerca de 20 a 50 kΩ) ativados por INPUT_PULLUP; a lógica continua invertida.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'No circuito com resistor de pull-up externo (resistor ao 5V, botão ao GND), qual é a leitura com o botão solto?',
          choices: [
            { id: 'a', text: 'LOW' },
            { id: 'b', text: 'Oscila aleatoriamente' },
            { id: 'c', text: 'HIGH' },
            { id: 'd', text: '0 V' }
          ],
          answer: 'c',
          explanation: 'O pull-up puxa o pino para 5 V enquanto o botão está solto, então a leitura é HIGH; ao apertar, vira LOW.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o modo que ativa o resistor de pull-up interno no pino 2:',
          code: 'pinMode(2, ___);',
          accept: ['INPUT_PULLUP'],
          explanation: 'INPUT_PULLUP configura o pino como entrada com o resistor interno de pull-up ligado.'
        }
      ]
    },
    {
      id: 'ard-10-lacos',
      title: 'Laços: for, while e do-while',
      goal: 'Repetir trechos de código com for, while e do-while, controlar laços com break e continue e entender o laço infinito do loop().',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Por que usar laços',
            body: 'Um laço (loop, repetição) executa um bloco de código várias vezes sem você ter que copiar e colar. Em Arduino há três formas principais: for, while e do-while. Cada uma é melhor em uma situação.'
          },
          {
            title: 'O laço for',
            body: 'O for é ideal quando você sabe quantas vezes repetir. Ele tem três partes entre parênteses, separadas por ;: a inicialização (roda uma vez, no começo), a condição (testada antes de cada volta; se for falsa o laço termina) e o passo (roda ao fim de cada volta, normalmente i++). O contador costuma começar em 0. O laço abaixo roda 5 vezes, com i valendo 0, 1, 2, 3 e 4.',
            code: 'for (int i = 0; i < 5; i++) {\n  digitalWrite(8, HIGH);\n  delay(200);\n  digitalWrite(8, LOW);\n  delay(200);\n}'
          },
          {
            title: 'O laço while',
            body: 'O while repete enquanto a condição for verdadeira, e a testa ANTES de cada volta; se já começar falsa, o bloco nunca roda. É ideal quando não se sabe quantas repetições serão necessárias, como "enquanto o botão estiver pressionado". Atenção: algo dentro do laço precisa mudar a condição, senão ele nunca termina.',
            code: 'while (digitalRead(2) == LOW) {\n  digitalWrite(8, HIGH); // acende enquanto apertado\n}\ndigitalWrite(8, LOW);'
          },
          {
            title: 'O laço do-while',
            body: 'O do-while é parecido com o while, mas testa a condição DEPOIS de executar o bloco, então o bloco sempre roda pelo menos uma vez. Repare no ; depois do while(...) no final.',
            code: 'int n = 0;\ndo {\n  n++;\n} while (n < 3);\n// n vale 3'
          },
          {
            title: 'break e continue',
            body: 'break encerra o laço imediatamente e o programa segue para depois dele. continue pula o resto da volta atual e vai direto para a próxima. Exemplo: o laço abaixo conta de 0 a 9, mas ignora o 3 (continue) e para quando chega ao 6 (break); portanto passa por 0, 1, 2, 4 e 5.',
            code: 'for (int i = 0; i < 10; i++) {\n  if (i == 3) continue; // pula o 3\n  if (i == 6) break;    // sai do laço\n  Serial.println(i);\n}'
          },
          {
            title: 'O loop() é um laço infinito',
            body: 'Você já usa um laço sem perceber: o loop() do Arduino é chamado repetidamente, para sempre. Por isso a lógica principal vai nele e você normalmente não precisa de while(true) no sketch. Cuidado: um while cuja condição nunca fica falsa trava o programa naquele ponto e nada mais executa (nem o resto do loop). Evite também delays muito longos dentro de laços, pois o Arduino fica surdo a botões durante a espera.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Quantas vezes o bloco é executado?\n\nfor (int i = 0; i < 5; i++) {\n  // ...\n}',
          choices: [
            { id: 'a', text: '5 vezes' },
            { id: 'b', text: '4 vezes' },
            { id: 'c', text: '6 vezes' },
            { id: 'd', text: 'Infinitas vezes' }
          ],
          answer: 'a',
          explanation: 'i vale 0, 1, 2, 3 e 4; quando chega a 5, a condição i < 5 é falsa e o laço termina.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual é a diferença entre while e do-while?',
          choices: [
            { id: 'a', text: 'Nenhuma, são idênticos' },
            { id: 'b', text: 'O do-while executa o bloco ao menos uma vez, pois testa a condição só no final' },
            { id: 'c', text: 'O while executa o bloco ao menos uma vez' },
            { id: 'd', text: 'O do-while só funciona com números negativos' }
          ],
          answer: 'b',
          explanation: 'while testa antes (pode não rodar nunca); do-while testa depois (roda no mínimo uma vez).'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que o comando break faz dentro de um laço?',
          choices: [
            { id: 'a', text: 'Pula apenas a volta atual e continua o laço' },
            { id: 'b', text: 'Reinicia o Arduino' },
            { id: 'c', text: 'Encerra o laço imediatamente' },
            { id: 'd', text: 'Pausa o laço por 1 segundo' }
          ],
          answer: 'c',
          explanation: 'break interrompe o laço; continue é que pula só a volta atual.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o passo que soma 1 ao contador a cada volta:',
          code: 'for (int i = 0; i < 3; ___) {\n  // ...\n}',
          accept: ['i++', '++i', 'i += 1', 'i = i + 1', 'i+=1'],
          explanation: 'i++ aumenta o contador em 1 ao fim de cada volta.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Quantas vezes o corpo roda?\n\nfor (int i = 1; i <= 10; i += 3) {\n  // ...\n}',
          choices: [
            { id: 'a', text: '10 vezes' },
            { id: 'b', text: '3 vezes' },
            { id: 'c', text: '3,3 vezes' },
            { id: 'd', text: '4 vezes' }
          ],
          answer: 'd',
          explanation: 'i vale 1, 4, 7 e 10 (o próximo seria 13, que falha a condição): 4 voltas.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que continue faz dentro de um laço?',
          choices: [
            { id: 'a', text: 'Sai do laço' },
            { id: 'b', text: 'Pula o resto da volta atual e vai para a próxima volta' },
            { id: 'c', text: 'Repete a mesma volta de novo' },
            { id: 'd', text: 'Termina o programa' }
          ],
          answer: 'b',
          explanation: 'continue ignora o que falta da volta atual e passa à próxima iteração.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Por que o loop() do Arduino NÃO precisa de um while(true) em volta do código?',
          choices: [
            { id: 'a', text: 'Porque a placa chama o loop() de novo, repetidamente, para sempre' },
            { id: 'b', text: 'Porque o loop() roda só uma vez' },
            { id: 'c', text: 'Porque while(true) não existe em C++' },
            { id: 'd', text: 'Porque o setup() repete tudo' }
          ],
          answer: 'a',
          explanation: 'O loop() já é repetido continuamente pela estrutura do programa Arduino.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a palavra do laço que repete enquanto o botão estiver pressionado (lógica de pull-up):',
          code: '___ (digitalRead(2) == LOW) {\n  digitalWrite(8, HIGH);\n}',
          accept: ['while'],
          explanation: 'while repete enquanto a condição for verdadeira, ideal quando não se sabe o número de voltas.'
        }
      ]
    },
    {
      id: 'ard-11-funcoes',
      title: 'Funções',
      goal: 'Criar e chamar funções com parâmetros e retorno, e usar void, para organizar e reaproveitar código.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Por que criar funções',
            body: 'Uma função é um bloco de código com nome, que você escreve uma vez e chama quantas vezes quiser. Funções evitam repetição, deixam o loop() limpo e facilitam achar e corrigir erros. Você já usa funções prontas: pinMode, digitalWrite, delay. Agora vai criar as suas.'
          },
          {
            title: 'Declarar uma função simples',
            body: 'A forma geral é: tipoDeRetorno nome(parâmetros) { corpo }. Quando a função apenas executa ações e não devolve nada, o tipo de retorno é void. Você a executa chamando o nome seguido de parênteses.',
            code: 'void piscar() {\n  digitalWrite(8, HIGH);\n  delay(200);\n  digitalWrite(8, LOW);\n  delay(200);\n}\n\nvoid loop() {\n  piscar(); // chamada\n}'
          },
          {
            title: 'Parâmetros',
            body: 'Parâmetros são "entradas" da função, declarados entre parênteses com tipo e nome. Quem chama passa valores (os argumentos), na mesma ordem e quantidade. Assim uma função fica flexível: piscar(8, 3) pisca o pino 8 três vezes, piscar(9, 5) pisca o pino 9 cinco vezes.',
            code: 'void piscar(int pino, int vezes) {\n  for (int i = 0; i < vezes; i++) {\n    digitalWrite(pino, HIGH);\n    delay(200);\n    digitalWrite(pino, LOW);\n    delay(200);\n  }\n}\n\npiscar(8, 3);'
          },
          {
            title: 'Retorno de valores',
            body: 'Uma função pode devolver um resultado: coloque o tipo no lugar de void e use return valor; dentro dela. O return encerra a função na hora e entrega o valor para quem chamou, que pode guardá-lo numa variável ou usá-lo em uma expressão.',
            code: 'int dobro(int n) {\n  return n * 2;\n}\n\nint r = dobro(4); // r vale 8'
          },
          {
            title: 'Funções que retornam bool',
            body: 'Funções que respondem a uma pergunta costumam retornar bool (true ou false), e podem ser usadas direto em um if. Isso deixa o código legível: if (botaoApertado()) lê-se quase como português.',
            code: 'bool botaoApertado() {\n  return digitalRead(2) == LOW;\n}\n\nif (botaoApertado()) {\n  digitalWrite(8, HIGH);\n}'
          },
          {
            title: 'Variáveis dentro da função',
            body: 'Parâmetros e variáveis criadas dentro de uma função são locais: só existem ali e desaparecem quando ela termina. Já variáveis globais podem ser usadas por todas as funções. Dê nomes que expliquem o que a função faz, como lerTemperatura() ou acenderLeds(), e mantenha cada função com uma tarefa só.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que significa void antes do nome de uma função?',
          choices: [
            { id: 'a', text: 'A função devolve o número zero' },
            { id: 'b', text: 'A função está vazia e não faz nada' },
            { id: 'c', text: 'A função não devolve nenhum valor' },
            { id: 'd', text: 'A função só roda uma vez' }
          ],
          answer: 'c',
          explanation: 'void indica que a função apenas executa ações e não retorna um valor.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual é o valor de r?\n\nint soma(int a, int b) {\n  return a + b;\n}\n\nint r = soma(2, 3);',
          choices: [
            { id: 'a', text: '23' },
            { id: 'b', text: '5' },
            { id: 'c', text: '6' },
            { id: 'd', text: '0' }
          ],
          answer: 'b',
          explanation: 'Os argumentos 2 e 3 entram em a e b; a função devolve a + b = 5.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual é a principal vantagem de criar funções?',
          choices: [
            { id: 'a', text: 'Deixam o Arduino mais rápido, sempre' },
            { id: 'b', text: 'Aumentam a memória da placa' },
            { id: 'c', text: 'São obrigatórias para compilar' },
            { id: 'd', text: 'Reaproveitam código, evitam repetição e deixam o programa mais organizado' }
          ],
          answer: 'd',
          explanation: 'Escrever uma vez e chamar várias vezes reduz erros e facilita a leitura e a manutenção.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o tipo de retorno de uma função que não devolve valor:',
          code: '___ piscar(int vezes) {\n  // ...\n}',
          accept: ['void'],
          explanation: 'void é usado quando a função não retorna nada.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Dada a função abaixo, o que a chamada piscar(9, 4) faz?\n\nvoid piscar(int pino, int vezes) { ... }',
          choices: [
            { id: 'a', text: 'Pisca o pino 4 nove vezes' },
            { id: 'b', text: 'Dá erro, pois faltam argumentos' },
            { id: 'c', text: 'Pisca 13 vezes' },
            { id: 'd', text: 'Pisca o pino 9 quatro vezes' }
          ],
          answer: 'd',
          explanation: 'Os argumentos são associados aos parâmetros na ordem: pino = 9 e vezes = 4.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que o return faz dentro de uma função?',
          choices: [
            { id: 'a', text: 'Reinicia o loop()' },
            { id: 'b', text: 'Entrega um valor a quem chamou e encerra a função' },
            { id: 'c', text: 'Repete a função' },
            { id: 'd', text: 'Imprime o valor no Serial Monitor' }
          ],
          answer: 'b',
          explanation: 'return devolve o resultado e termina a função naquele ponto.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual é o tipo de retorno mais adequado para a função botaoApertado(), que responde sim ou não?',
          choices: [
            { id: 'a', text: 'bool' },
            { id: 'b', text: 'float' },
            { id: 'c', text: 'void' },
            { id: 'd', text: 'char' }
          ],
          answer: 'a',
          explanation: 'Uma resposta sim/não é um valor verdadeiro ou falso, ou seja, bool.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a palavra que devolve o resultado da função:',
          code: 'int dobro(int n) {\n  ___ n * 2;\n}',
          accept: ['return'],
          explanation: 'return entrega o valor calculado a quem chamou a função.'
        }
      ]
    },
    {
      id: 'ard-19-aleatorio-matematica',
      title: 'Matemática, números aleatórios e operador ternário',
      goal: 'Usar min, max, abs, pow e sqrt, sortear valores com random e randomSeed e escrever escolhas curtas com o operador ternário.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'min(), max() e abs()',
            body: 'O Arduino já traz funções matemáticas prontas. min(a, b) devolve o MENOR dos dois valores e max(a, b) devolve o MAIOR. abs(x) devolve o valor absoluto (sem sinal): abs(-7) é 7 e abs(7) continua 7. Um uso clássico é limitar um valor por baixo ou por cima: max(0, x) nunca deixa x ficar negativo, e min(100, x) nunca deixa passar de 100. Cuidado: não coloque expressões com efeito colateral dentro de abs(), como abs(n++), porque ela é implementada de um jeito que pode repetir a conta. Faça o incremento numa linha separada. (As funções parentes constrain() e map() aparecem na lição de entradas analógicas.)',
            code: 'int a = min(3, 8);     // 3\nint b = max(3, 8);     // 8\nint c = abs(3 - 8);    // 5\nint d = max(0, -4);    // 0 (corta o negativo)\nint e = min(100, 250); // 100 (corta o excesso)'
          },
          {
            title: 'pow() e sqrt()',
            body: 'pow(base, expoente) calcula a potência: pow(2, 3) é 2 elevado a 3, ou seja, 8. sqrt(x) calcula a raiz quadrada: sqrt(81) é 9. As duas trabalham com números decimais (float no Uno), então o resultado pode ter pequenas imprecisões e, ao guardar em um int, a parte decimal é descartada: se der 15.9999, o int vira 15. Para elevar ao quadrado, prefira multiplicar (x * x), que é exato e mais leve; use pow() quando o expoente for variável ou decimal. Guarde o resultado em float quando precisar de decimais.',
            code: 'float p = pow(2, 3);   // 8.0\nfloat r = sqrt(81);    // 9.0\nint quad = 5 * 5;      // 25, exato\nfloat dist = sqrt(3 * 3 + 4 * 4); // 5.0'
          },
          {
            title: 'random(): números aleatórios',
            body: 'random() sorteia um número inteiro. Há duas formas. random(max) sorteia de 0 até max - 1: o limite superior é EXCLUSIVO, ou seja, não entra no sorteio. random(5) devolve 0, 1, 2, 3 ou 4, nunca 5. random(min, max) sorteia de min até max - 1, também com o máximo excluído. Para um dado comum, de 1 a 6, escreva random(1, 7): o 7 não sai. O erro mais comum é escrever random(1, 6) e nunca conseguir um 6.',
            code: 'int a = random(10);     // 0 a 9\nint b = random(1, 7);   // 1 a 6 (dado)\nint c = random(20, 31); // 20 a 30'
          },
          {
            title: 'Pseudoaleatório e randomSeed()',
            body: 'O Arduino não sorteia de verdade: ele aplica uma fórmula que gera uma sequência de números que PARECEM aleatórios, por isso se diz pseudoaleatória. A fórmula sempre começa do mesmo ponto, a semente. Se você não definir a semente, toda vez que a placa for ligada ou reiniciada a sequência é exatamente a mesma (por exemplo, o dado sempre mostra 3, 5, 1...). Para variar, use randomSeed(valor) uma vez no setup() com um valor imprevisível. O truque comum é ler um pino analógico sem nada ligado: analogRead(A0) mede a tensão do pino, de 0 a 1023, e um pino solto "flutua" e capta ruído elétrico do ambiente, dando um número diferente a cada partida. Você verá analogRead em detalhe mais à frente; aqui basta saber que ele devolve um número entre 0 e 1023.',
            code: 'void setup() {\n  randomSeed(analogRead(A0)); // A0 sem nada ligado\n}\n\nvoid loop() {\n  int n = random(1, 7);\n}'
          },
          {
            title: 'Operador ternário',
            body: 'O operador ternário é um if/else curto que devolve um valor. A forma é condição ? valorSeVerdadeiro : valorSeFalso. Se a condição for verdadeira, o resultado é o valor depois do ?; senão, o valor depois do :. Exemplo: int maior = (a > b) ? a : b; guarda em maior o maior dos dois. É ótimo para escolhas curtas de um valor, como HIGH ou LOW. Quando a decisão precisa executar vários comandos ou ficar com muitas condições aninhadas, use if/else normal: legibilidade vem primeiro.',
            code: 'int a = 4, b = 9;\nint maior = (a > b) ? a : b;   // 9\n\nint estado = (a % 2 == 0) ? HIGH : LOW; // a é par? HIGH'
          },
          {
            title: 'Aplicações: dado eletrônico e LED aleatório',
            body: 'Dado eletrônico: sorteie de 1 a 6 e acenda essa quantidade de LEDs ligados aos pinos 2 a 7. O ternário escolhe HIGH ou LOW para cada LED: o LED número i acende se i for menor ou igual ao dado. LED aleatório: random(2, 6) sorteia um pino entre 2 e 5 (o 6 fica de fora) e o LED daquele pino pisca. Lembre-se da semente no setup(), senão o "aleatório" será sempre igual a cada reinício.',
            code: 'void setup() {\n  for (int p = 2; p <= 7; p++) {\n    pinMode(p, OUTPUT);\n  }\n  randomSeed(analogRead(A0));\n}\n\nvoid loop() {\n  int dado = random(1, 7);\n  for (int i = 1; i <= 6; i++) {\n    digitalWrite(i + 1, (i <= dado) ? HIGH : LOW);\n  }\n  delay(1000);\n}'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Quais valores random(5) pode devolver?',
          choices: [
            { id: 'a', text: '1, 2, 3, 4 e 5' },
            { id: 'b', text: 'Apenas 5' },
            { id: 'c', text: '0, 1, 2, 3 e 4' },
            { id: 'd', text: '0, 1, 2, 3, 4 e 5' }
          ],
          answer: 'c',
          explanation: 'Em random(max) o limite superior é exclusivo: o sorteio vai de 0 até max - 1, ou seja, de 0 a 4.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual chamada simula corretamente um dado de seis faces (resultados de 1 a 6)?',
          choices: [
            { id: 'a', text: 'random(1, 6)' },
            { id: 'b', text: 'random(1, 7)' },
            { id: 'c', text: 'random(0, 6)' },
            { id: 'd', text: 'random(6)' }
          ],
          answer: 'b',
          explanation: 'Como o máximo é excluído, random(1, 7) sorteia de 1 a 6. random(1, 6) nunca daria 6, e random(0, 6) ou random(6) incluem o 0.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Sem chamar randomSeed(), por que o dado eletrônico mostra a mesma sequência de números toda vez que a placa é reiniciada?',
          choices: [
            { id: 'a', text: 'Porque o Arduino só sabe sortear um número fixo' },
            { id: 'b', text: 'Porque o random() só funciona depois de usar o analogRead' },
            { id: 'c', text: 'Porque o ATmega328P perde a memória ao reiniciar' },
            { id: 'd', text: 'Porque a sequência é calculada por uma fórmula que sempre parte da mesma semente' }
          ],
          answer: 'd',
          explanation: 'O random() é pseudoaleatório: uma fórmula gera a sequência a partir de uma semente. Sem randomSeed(), a semente é sempre a mesma e a sequência se repete.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o limite superior para sortear um valor de 1 a 6:',
          code: 'int dado = random(1, ___);',
          accept: ['7'],
          explanation: 'O limite superior é exclusivo, então para incluir o 6 usa-se 7: random(1, 7).'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Qual é o valor de x?\n\nint x = abs(min(3, 8) - 8);',
          choices: [
            { id: 'a', text: '5' },
            { id: 'b', text: '-5' },
            { id: 'c', text: '3' },
            { id: 'd', text: '11' }
          ],
          answer: 'a',
          explanation: 'min(3, 8) é 3; 3 - 8 é -5; abs(-5) tira o sinal e devolve 5.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que a função sqrt(81) devolve?',
          choices: [
            { id: 'a', text: '40,5' },
            { id: 'b', text: '8100' },
            { id: 'c', text: '9' },
            { id: 'd', text: '81' }
          ],
          answer: 'c',
          explanation: 'sqrt calcula a raiz quadrada: 9 vezes 9 é 81, então sqrt(81) é 9 (como float).'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual é o valor de x?\n\nint n = 7;\nint x = (n % 2 == 0) ? 10 : 20;',
          choices: [
            { id: 'a', text: '10' },
            { id: 'b', text: '7' },
            { id: 'c', text: '0' },
            { id: 'd', text: '20' }
          ],
          answer: 'd',
          explanation: '7 % 2 vale 1, então a condição n % 2 == 0 é falsa e o ternário devolve o valor depois do dois-pontos: 20.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o símbolo que separa a condição do primeiro valor no operador ternário:',
          code: 'int maior = (a > b) ___ a : b;',
          accept: ['?'],
          explanation: 'A forma é condição ? valorSeVerdadeiro : valorSeFalso. O ? vem logo depois da condição.'
        }
      ]
    },
    {
      id: 'ard-12-serial',
      title: 'Comunicação serial básica',
      goal: 'Enviar mensagens ao computador com Serial.print e println e receber comandos com Serial.available e Serial.read.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'O que é a comunicação serial',
            body: 'A comunicação serial é a forma de o Arduino "conversar" com o computador pelo cabo USB, enviando e recebendo dados um bit após o outro. Ela é a ferramenta mais importante para descobrir o que o programa está fazendo, porque o Arduino não tem tela. Internamente, ela usa os pinos 0 (RX, recebe) e 1 (TX, envia), então evite usá-los para outras coisas enquanto usar o Serial.'
          },
          {
            title: 'Serial.begin e baud rate',
            body: 'Para iniciar, chame Serial.begin(velocidade) no setup(). A velocidade é a baud rate, em bits por segundo; o valor mais comum é 9600. O ponto crucial: a baud rate do sketch e a escolhida no Serial Monitor (menu Ferramentas > Monitor Serial, ou ctrl+shift+M) precisam ser IGUAIS; caso contrário, aparecem caracteres estranhos.',
            code: 'void setup() {\n  Serial.begin(9600);\n}'
          },
          {
            title: 'Serial.print e Serial.println',
            body: 'Serial.print() envia o valor sem pular de linha; Serial.println() envia e depois pula para a próxima linha (ln = line). Textos entre aspas duplas são enviados como estão; variáveis têm o valor enviado. Use os dois para montar mensagens em partes: textos, valores, unidades.',
            code: 'Serial.print("Temperatura: ");\nSerial.print(25);\nSerial.println(" C");\n// Saída: Temperatura: 25 C'
          },
          {
            title: 'Montar mensagens e formatar números',
            body: 'Para "concatenar" textos e valores, chame vários print em sequência (como acima). Não tente "texto" + número: isso não funciona como em outras linguagens. Para float, o segundo argumento define as casas decimais: Serial.print(3.14159, 2) mostra 3.14. Aspas duplas servem para textos ("oi"); aspas simples, para um único caractere (\'A\').',
            code: 'float v = 3.14159;\nSerial.println(v, 2); // 3.14\nSerial.println(v);    // 3.14 (padrão: 2 casas)'
          },
          {
            title: 'Receber dados: Serial.available e Serial.read',
            body: 'Para o Arduino receber o que você digita no Serial Monitor, use Serial.available(), que devolve quantos bytes chegaram e ainda não foram lidos (0 se nada chegou), e Serial.read(), que lê e retorna o primeiro byte (o código do caractere). Teste sempre available() antes de read().',
            code: 'if (Serial.available() > 0) {\n  char c = Serial.read();\n}'
          },
          {
            title: 'Exemplo: comandos pelo teclado',
            body: 'Juntando tudo: digitando L no Serial Monitor, o LED liga; digitando D, desliga. Cuidado ao enviar: o Monitor pode anexar caracteres de fim de linha (\\n ou \\r), conforme a opção escolhida no menu inferior; por isso o exemplo ignora outros caracteres. Note também o uso do Serial para confirmar a ação.',
            code: 'void setup() {\n  pinMode(8, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  if (Serial.available() > 0) {\n    char c = Serial.read();\n    if (c == \'L\') {\n      digitalWrite(8, HIGH);\n      Serial.println("LED ligado");\n    } else if (c == \'D\') {\n      digitalWrite(8, LOW);\n      Serial.println("LED desligado");\n    }\n  }\n}'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual é a função de Serial.begin(9600)?',
          choices: [
            { id: 'a', text: 'Iniciar a comunicação serial a 9600 bits por segundo' },
            { id: 'b', text: 'Imprimir o número 9600' },
            { id: 'c', text: 'Esperar 9600 milissegundos' },
            { id: 'd', text: 'Ligar o pino 9600' }
          ],
          answer: 'a',
          explanation: 'Serial.begin inicializa a comunicação serial; 9600 é a baud rate (bits por segundo).'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O Serial Monitor mostra caracteres estranhos (lixo). Qual é a causa mais provável?',
          choices: [
            { id: 'a', text: 'O LED está queimado' },
            { id: 'b', text: 'A baud rate do Serial Monitor é diferente da usada no Serial.begin' },
            { id: 'c', text: 'O código tem muitos comentários' },
            { id: 'd', text: 'O Arduino está com pouca memória' }
          ],
          answer: 'b',
          explanation: 'Os dois lados precisam usar a mesma baud rate; se divergirem, os dados são interpretados errado.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual é a saída?\n\nSerial.print("A");\nSerial.println("B");\nSerial.println("C");',
          choices: [
            { id: 'a', text: 'A, B e C, cada um em uma linha' },
            { id: 'b', text: 'ABC na mesma linha' },
            { id: 'c', text: 'AB em uma linha e C na linha seguinte' },
            { id: 'd', text: 'A em uma linha e BC em outra' }
          ],
          answer: 'c',
          explanation: 'print não pula de linha, então A e B ficam juntos; println pula depois de B, e C vem na linha seguinte.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a função que inicia a comunicação serial:',
          code: 'void setup() {\n  Serial.___(9600);\n}',
          accept: ['begin'],
          explanation: 'Serial.begin(baud) inicia a comunicação.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que Serial.println(3.14159, 2) mostra?',
          choices: [
            { id: 'a', text: '3.14159' },
            { id: 'b', text: '3' },
            { id: 'c', text: '2' },
            { id: 'd', text: '3.14' }
          ],
          answer: 'd',
          explanation: 'O segundo argumento é o número de casas decimais: 3.14.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que Serial.available() devolve?',
          choices: [
            { id: 'a', text: 'O último caractere recebido' },
            { id: 'b', text: 'true se a placa está ligada' },
            { id: 'c', text: 'A baud rate atual' },
            { id: 'd', text: 'A quantidade de bytes recebidos que ainda não foram lidos' }
          ],
          answer: 'd',
          explanation: 'Se for maior que 0, há dados para ler com Serial.read().'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Quais pinos o Uno usa internamente para a comunicação serial (e que convém evitar para outros usos ao usar o Serial)?',
          choices: [
            { id: 'a', text: 'Pinos 0 (RX) e 1 (TX)' },
            { id: 'b', text: 'Pinos 2 e 3' },
            { id: 'c', text: 'Pinos 12 e 13' },
            { id: 'd', text: 'Pinos A0 e A1' }
          ],
          answer: 'a',
          explanation: 'RX (recepção) está no pino 0 e TX (transmissão) no pino 1; também são compartilhados com o USB.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a função que informa quantos bytes estão esperando para serem lidos:',
          code: 'if (Serial.___() > 0) {\n  char c = Serial.read();\n}',
          accept: ['available', 'available()'],
          explanation: 'Serial.available() verifica se há dados chegando antes de ler com Serial.read().'
        }
      ]
    },
    {
      id: 'ard-20-serial-formatos',
      title: 'Serial: formatos de saída e leitura de números',
      goal: 'Mostrar números em outras bases e com casas decimais, diferenciar print e write e ler números digitados no Monitor Serial com parseInt e parseFloat.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Serial.print com outras bases',
            body: 'Um mesmo número pode ser escrito em bases diferentes. Serial.print(valor, formato) aceita um segundo argumento: DEC (decimal, base 10, o padrão), HEX (hexadecimal, base 16, com dígitos 0-9 e letras A-F), BIN (binário, base 2, só 0 e 1) e OCT (octal, base 8). O número 78 sai como 78 em DEC, 4E em HEX, 1001110 em BIN e 116 em OCT. Atenção: o Arduino não escreve prefixos como 0x, e o binário não completa com zeros à esquerda: 10 sai como 1010, não 00001010. O formato BIN é ótimo para ver quais bits de um valor estão ligados.',
            code: 'Serial.println(255, DEC); // 255\nSerial.println(255, HEX); // FF\nSerial.println(10, BIN);  // 1010\nSerial.println(8, OCT);   // 10'
          },
          {
            title: 'Casas decimais em float',
            body: 'Para números decimais (float), o segundo argumento do print é a quantidade de casas decimais: Serial.print(3.14159, 3) mostra 3.142, já arredondado. Sem o argumento, o padrão é 2 casas. Isso serve só para a exibição: o valor guardado na variável continua o mesmo. Escolha poucas casas: sensores comuns não têm precisão para dez dígitos, e muitas casas só enchem o monitor de números sem sentido.',
            code: 'float v = 3.14159;\nSerial.println(v);       // 3.14\nSerial.println(v, 3);    // 3.142\nSerial.println(v, 0);    // 3'
          },
          {
            title: 'Serial.write x Serial.print',
            body: 'Serial.print() envia TEXTO: o número 65 vira os dois caracteres \'6\' e \'5\', ou seja, dois bytes (os códigos ASCII desses caracteres). Serial.write() envia o BYTE bruto, sem converter: Serial.write(65) envia um único byte de valor 65, e como o Monitor Serial interpreta cada byte como um caractere pela tabela ASCII, ele mostra a letra A. ASCII é a tabela que associa um número a cada caractere: \'A\' é 65, \'a\' é 97 e o dígito \'0\' é 48. Use print para o que humanos leem; use write para enviar dados binários a outro dispositivo ou programa.',
            code: 'Serial.print(65);   // mostra 65 (envia \'6\' e \'5\')\nSerial.write(65);   // mostra A (envia 1 byte: 65)\nSerial.write(\'B\');  // mostra B'
          },
          {
            title: 'Serial.read() e Serial.peek()',
            body: 'Serial.read() lê o primeiro byte recebido e o REMOVE da fila. O tipo que ele retorna é int, não char, porque precisa de um valor extra para dizer "nada para ler": se não houver dados, devolve -1. Por isso se testa Serial.available() antes. Se você digitar o caractere \'5\', o byte recebido é 53 (o código ASCII do \'5\'), não o número 5; para converter um dígito em número, use c - \'0\'. Serial.peek() devolve o próximo byte SEM removê-lo da fila (também -1 se não houver nada): serve para "espiar" o que vem antes de decidir o que fazer.',
            code: 'if (Serial.available() > 0) {\n  int b = Serial.read();   // -1 se nada chegou\n  int d = b - \'0\';          // \'5\' (53) vira 5\n}\nint prox = Serial.peek();  // espia, não remove'
          },
          {
            title: 'Serial.parseInt() e parseFloat()',
            body: 'Ler byte a byte é trabalhoso para números com vários dígitos. Serial.parseInt() faz o serviço: ignora o que não for dígito, junta os dígitos (aceita um sinal - na frente) e devolve o número inteiro, parando no primeiro caractere que não for dígito. Serial.parseFloat() faz o mesmo com decimais, usando o ponto (3.5). Ambas BLOQUEIAM: ficam esperando chegar dados até estourar o timeout, que por padrão é 1000 ms (1 segundo). Você muda isso com Serial.setTimeout(ms). Se nenhum número válido chegar dentro do tempo, o retorno é 0, e por isso um 0 legítimo digitado não se distingue de "nada chegou". Como a função só termina quando acha um não-dígito ou estoura o tempo, digitar 123 sem fim de linha faz o sketch esperar o timeout depois do 3.',
            code: 'void setup() {\n  Serial.begin(9600);\n  Serial.setTimeout(200); // espera no máximo 200 ms\n}\n\nint n = Serial.parseInt();       // 123 -> 123\nfloat f = Serial.parseFloat();   // 3.5 -> 3.5'
          },
          {
            title: 'O fim de linha e a armadilha do zero',
            body: 'Na parte de baixo do Monitor Serial há uma opção de fim de linha. Com "Nova linha", cada mensagem enviada termina com o caractere \\n (byte 10). Isso é útil: o \\n é o não-dígito que avisa o parseInt de que o número acabou, sem esperar o timeout. Mas o parseInt NÃO consome esse \\n: ele fica na fila. Na volta do loop(), available() é maior que 0, parseInt tenta de novo, não acha dígito, espera o timeout e devolve 0: surge um "0 fantasma" depois de cada número. Há duas saídas: escolher "Sem final de linha" no monitor (e aceitar a espera) ou descartar os caracteres de fim de linha que sobraram, usando peek() para espiar e read() para jogar fora. Ainda existe String com readStringUntil() para ler linhas inteiras de texto, mas isso fica para o nível intermediário.',
            code: 'int n = Serial.parseInt();\n// descarta \\n e \\r que sobraram\nwhile (Serial.available() > 0 &&\n       (Serial.peek() == \'\\n\' || Serial.peek() == \'\\r\')) {\n  Serial.read();\n}'
          },
          {
            title: 'Padrão completo: ler um número digitado',
            body: 'Juntando tudo: o sketch abaixo pisca o LED do pino 8 tantas vezes quanto o número digitado (de 1 a 10). Ele só lê quando available() é maior que 0, usa um timeout curto, descarta o fim de linha e valida a faixa, ignorando o 0 (que pode ser fantasma ou entrada inválida). Validar a entrada é sempre uma boa prática: nunca confie cegamente no que chega pela serial.',
            code: 'void setup() {\n  pinMode(8, OUTPUT);\n  Serial.begin(9600);\n  Serial.setTimeout(200);\n}\n\nvoid loop() {\n  if (Serial.available() > 0) {\n    int n = Serial.parseInt();\n    while (Serial.available() > 0 &&\n           (Serial.peek() == \'\\n\' || Serial.peek() == \'\\r\')) {\n      Serial.read();\n    }\n    if (n >= 1 && n <= 10) {\n      Serial.print("Piscando ");\n      Serial.print(n);\n      Serial.println(" vezes");\n      for (int i = 0; i < n; i++) {\n        digitalWrite(8, HIGH);\n        delay(200);\n        digitalWrite(8, LOW);\n        delay(200);\n      }\n    }\n  }\n}'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que Serial.print(255, HEX) mostra no Monitor Serial?',
          choices: [
            { id: 'a', text: '255' },
            { id: 'b', text: 'FF' },
            { id: 'c', text: '0xFF' },
            { id: 'd', text: '11111111' }
          ],
          answer: 'b',
          explanation: '255 em hexadecimal é FF. O Arduino não acrescenta o prefixo 0x; a saída em binário seria 11111111.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que Serial.print(10, BIN) mostra?',
          choices: [
            { id: 'a', text: '00001010' },
            { id: 'b', text: '10' },
            { id: 'c', text: 'A' },
            { id: 'd', text: '1010' }
          ],
          answer: 'd',
          explanation: '10 em binário é 1010 (8 + 2). O Arduino não completa com zeros à esquerda.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'O que o Monitor Serial mostra ao executar Serial.write(65)?',
          choices: [
            { id: 'a', text: 'A letra A, pois é enviado um byte de valor 65 (código ASCII do A)' },
            { id: 'b', text: 'O número 65, como texto' },
            { id: 'c', text: 'Nada, pois write só funciona com texto entre aspas' },
            { id: 'd', text: 'O número 6 e depois o número 5, em linhas separadas' }
          ],
          answer: 'a',
          explanation: 'write envia o byte bruto 65, que o monitor interpreta como caractere ASCII: A. Já print(65) enviaria os caracteres \'6\' e \'5\'.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o número de casas decimais para mostrar 3.142 (três casas):',
          code: 'Serial.println(3.14159, ___);',
          accept: ['3'],
          explanation: 'O segundo argumento do print com float é o número de casas decimais: 3 casas dão 3.142 (arredondado).'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que Serial.read() devolve quando não há nenhum byte para ler?',
          choices: [
            { id: 'a', text: '0' },
            { id: 'b', text: 'A letra N' },
            { id: 'c', text: '-1' },
            { id: 'd', text: 'Ele trava até chegar um byte, sem devolver nada' }
          ],
          answer: 'c',
          explanation: 'Serial.read() retorna int justamente para poder devolver -1 quando a fila está vazia; ele não bloqueia. Por isso se testa Serial.available() antes.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Com "Nova linha" ativado, o sketch lê 123 com parseInt() e, logo depois, aparece um 0 extra, mesmo sem você digitar nada. Qual é a causa?',
          choices: [
            { id: 'a', text: 'O parseInt sempre devolve 0 depois de um número' },
            { id: 'b', text: 'O baud rate está errado' },
            { id: 'c', text: 'O Arduino sorteou o zero' },
            { id: 'd', text: 'O \\n do fim de linha ficou na fila; no loop seguinte o parseInt não acha dígito, espera o timeout e devolve 0' }
          ],
          answer: 'd',
          explanation: 'parseInt para no \\n sem consumi-lo. Na próxima volta, available() > 0, a função não encontra dígitos, estoura o timeout e devolve 0. Descartar o fim de linha resolve.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual é a diferença entre Serial.peek() e Serial.read()?',
          choices: [
            { id: 'a', text: 'peek() mostra o próximo byte sem removê-lo da fila; read() o devolve e o remove' },
            { id: 'b', text: 'peek() envia um byte; read() recebe um byte' },
            { id: 'c', text: 'peek() só funciona com números e read() só com letras' },
            { id: 'd', text: 'Não há diferença, são nomes diferentes da mesma função' }
          ],
          answer: 'a',
          explanation: 'peek() apenas espia o próximo byte; read() o lê e o retira da fila. Os dois devolvem -1 se não houver nada.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a função que muda o tempo máximo de espera do parseInt() para 2000 ms:',
          code: 'Serial.___(2000);',
          accept: ['setTimeout'],
          explanation: 'Serial.setTimeout(ms) define quanto tempo parseInt, parseFloat e outras leituras esperam por dados; o padrão é 1000 ms.'
        }
      ]
    },
    {
      id: 'ard-13-analogicas',
      title: 'Entradas analógicas',
      goal: 'Ler tensões variáveis com analogRead, converter a leitura para volts e usar map() e constrain().',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Digital vs analógico',
            body: 'Um sinal digital tem só dois níveis (HIGH ou LOW). Um sinal analógico varia continuamente, como a tensão de um potenciômetro, de um sensor de luz ou de temperatura. Para ler esse tipo de sinal, o Arduino usa o ADC (Conversor Analógico-Digital), que transforma uma tensão em um número.'
          },
          {
            title: 'O ADC de 10 bits e os pinos A0–A5',
            body: 'O Uno tem 6 entradas analógicas, A0 a A5. O ADC tem 10 bits de resolução: 2 elevado a 10 = 1024 níveis, numerados de 0 a 1023. Com a referência padrão de 5 V, 0 V vira 0 e 5 V vira 1023; ou seja, cada passo vale cerca de 4,9 mV (5 / 1024). Os pinos analógicos não precisam de pinMode para leitura.',
            code: 'int leitura = analogRead(A0); // 0 a 1023'
          },
          {
            title: 'Convertendo a leitura em volts',
            body: 'Para saber a tensão real, aplique a proporção: tensão = leitura × 5 / 1023. Use números decimais (5.0), senão a divisão de inteiros zera o resultado: 5 / 1023 em inteiros vale 0! Exemplo: leitura 512 resulta em cerca de 2,5 V.',
            code: 'int leitura = analogRead(A0);\nfloat tensao = leitura * 5.0 / 1023;\nSerial.println(tensao);'
          },
          {
            title: 'Ligando um potenciômetro',
            body: 'Ligue um extremo do potenciômetro ao 5V, o outro ao GND e o terminal do meio a A0. Girando o botão, a tensão em A0 varia de 0 a 5 V, e analogRead devolve de 0 a 1023. É a forma mais simples de criar um controle ajustável (volume, brilho, velocidade).',
            code: 'void setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int v = analogRead(A0);\n  Serial.println(v);\n  delay(200);\n}'
          },
          {
            title: 'map(): mudar de escala',
            body: 'map(valor, deMin, deMax, paraMin, paraMax) converte proporcionalmente um valor de uma faixa para outra. Exemplo: map(analogRead(A0), 0, 1023, 0, 100) transforma 0 a 1023 em 0 a 100. A função usa matemática de inteiros: o resultado é truncado (não há decimais). Ela não limita o valor: se o valor de entrada ficar fora da faixa de origem, o resultado também sai da faixa de destino.',
            code: 'int percentual = map(analogRead(A0), 0, 1023, 0, 100);\n// 512 -> 50'
          },
          {
            title: 'constrain(): limitar valores',
            body: 'constrain(x, minimo, maximo) mantém x dentro da faixa: devolve minimo se x for menor, maximo se x for maior e o próprio x caso contrário. É útil junto com map() para garantir que o resultado nunca saia do intervalo permitido.',
            code: 'int v = constrain(150, 0, 100); // 100\nint w = constrain(-5, 0, 100);  // 0\nint z = constrain(40, 0, 100);  // 40'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual é a faixa de valores devolvida por analogRead no Arduino Uno?',
          choices: [
            { id: 'a', text: '0 a 255' },
            { id: 'b', text: '0 a 1023' },
            { id: 'c', text: '0 a 5' },
            { id: 'd', text: '0 a 65535' }
          ],
          answer: 'b',
          explanation: 'O ADC do Uno tem 10 bits: 1024 valores, de 0 a 1023.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual é a tensão aproximada correspondente a uma leitura de 512 (referência de 5 V)?',
          choices: [
            { id: 'a', text: '5 V' },
            { id: 'b', text: '0 V' },
            { id: 'c', text: 'Cerca de 2,5 V' },
            { id: 'd', text: '512 V' }
          ],
          answer: 'c',
          explanation: '512 é aproximadamente a metade de 1023, então a tensão é cerca de metade de 5 V.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Quais pinos do Uno são entradas analógicas?',
          choices: [
            { id: 'a', text: 'Os pinos 0 a 13' },
            { id: 'b', text: 'Os pinos com ~' },
            { id: 'c', text: 'Os pinos 5V e 3,3V' },
            { id: 'd', text: 'Os pinos A0 a A5' }
          ],
          answer: 'd',
          explanation: 'O Uno tem 6 entradas analógicas, de A0 a A5.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a função que lê o valor analógico do pino A0:',
          code: 'int leitura = ___(A0);',
          accept: ['analogRead'],
          explanation: 'analogRead(pino) devolve a leitura do ADC de 0 a 1023.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Em int, a conta 5 / 1023 vale 0. Por que, e como evitar isso ao converter a leitura em volts?',
          choices: [
            { id: 'a', text: 'Porque o analogRead falha com float' },
            { id: 'b', text: 'Porque 5 volts é um valor proibido' },
            { id: 'c', text: 'Porque divisão entre inteiros descarta a parte decimal; use 5.0 para forçar cálculo decimal' },
            { id: 'd', text: 'Porque a variável tensao não pode ter esse nome' }
          ],
          answer: 'c',
          explanation: 'Entre inteiros, 5 / 1023 vale 0. Escrever leitura * 5.0 / 1023 faz o cálculo em decimal e dá a tensão certa.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual é o resultado de map(512, 0, 1023, 0, 100)?',
          choices: [
            { id: 'a', text: '512' },
            { id: 'b', text: '100' },
            { id: 'c', text: '0' },
            { id: 'd', text: '50' }
          ],
          answer: 'd',
          explanation: 'map converte proporcionalmente: 512 está na metade da faixa de entrada, então fica perto da metade da saída: 50 (truncado).'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Qual é o valor de constrain(150, 0, 100)?',
          choices: [
            { id: 'a', text: '100' },
            { id: 'b', text: '150' },
            { id: 'c', text: '0' },
            { id: 'd', text: '50' }
          ],
          answer: 'a',
          explanation: 'constrain limita o valor ao intervalo: como 150 passa de 100, o resultado é 100.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a função que converte um valor de uma faixa para outra proporcionalmente:',
          code: 'int p = ___(analogRead(A0), 0, 1023, 0, 100);',
          accept: ['map'],
          explanation: 'map(valor, deMin, deMax, paraMin, paraMax) muda o valor de escala.'
        }
      ]
    },
    {
      id: 'ard-14-pwm',
      title: 'Saída PWM e analogWrite',
      goal: 'Controlar o brilho de um LED com PWM, usando analogWrite, duty cycle e os pinos corretos do Uno.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'O problema: saída intermediária',
            body: 'Um pino digital só sabe dar 0 V ou 5 V. Mas e se quisermos um LED com meio brilho ou um motor em metade da velocidade? A solução do Arduino é o PWM (Modulação por Largura de Pulso): o pino liga e desliga muito rapidamente, e a proporção de tempo ligado define a "intensidade média".'
          },
          {
            title: 'analogWrite e a faixa 0–255',
            body: 'A função analogWrite(pino, valor) gera o PWM. O valor vai de 0 (sempre desligado, 0 V) a 255 (sempre ligado, 5 V). Valores intermediários dão intensidades intermediárias: 127 é cerca de metade do brilho, 64 cerca de um quarto. Repare que a faixa é 0–255 (8 bits), diferente da entrada analógica, que é 0–1023.',
            code: 'analogWrite(9, 0);    // apagado\nanalogWrite(9, 127);  // ~50%\nanalogWrite(9, 255);  // máximo'
          },
          {
            title: 'Duty cycle',
            body: 'O duty cycle (ciclo de trabalho) é a fração do tempo em que o pino fica em HIGH em cada ciclo, em porcentagem. analogWrite(pino, 255) equivale a 100% do tempo ligado; 127 equivale a ~50%; 0 a 0%. A tensão média no pino é aproximadamente duty × 5 V (por exemplo, 50% resulta em uns 2,5 V de média). A frequência é de cerca de 490 Hz nos pinos 3, 9, 10 e 11 e cerca de 980 Hz nos pinos 5 e 6; o olho humano não percebe a cintilação.'
          },
          {
            title: 'Quais pinos têm PWM',
            body: 'Só alguns pinos do Uno geram PWM, marcados com um til (~) na placa: 3, 5, 6, 9, 10 e 11. Em um pino sem PWM (como o 8 ou o 13), analogWrite não funciona como degradê: o pino só vai a LOW (valores abaixo de 128) ou HIGH (128 ou mais).'
          },
          {
            title: 'Efeito fade (esmaecer)',
            body: 'Com um laço for, o brilho sobe e desce suavemente. Use uma pequena pausa em cada passo para o efeito ser visível. Monte o LED com resistor no pino 9, por exemplo.',
            code: 'void loop() {\n  for (int b = 0; b <= 255; b++) {\n    analogWrite(9, b);\n    delay(5);\n  }\n  for (int b = 255; b >= 0; b--) {\n    analogWrite(9, b);\n    delay(5);\n  }\n}'
          },
          {
            title: 'PWM não é analógico de verdade',
            body: 'Apesar do nome analogWrite, o pino NÃO gera uma tensão intermediária estável: ele alterna rapidamente entre 0 e 5 V. Para LEDs e motores isso funciona bem, porque eles "suavizam" o efeito; para equipamentos que precisam de tensão contínua exata, seria preciso um filtro. Para ligar um potenciômetro ao brilho, converta a faixa com map: analogWrite(9, map(analogRead(A0), 0, 1023, 0, 255)).',
            code: 'int brilho = map(analogRead(A0), 0, 1023, 0, 255);\nanalogWrite(9, brilho);'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual é a faixa de valores aceita por analogWrite?',
          choices: [
            { id: 'a', text: '0 a 1023' },
            { id: 'b', text: '0 a 100' },
            { id: 'c', text: '0 a 255' },
            { id: 'd', text: '0 a 5' }
          ],
          answer: 'c',
          explanation: 'analogWrite usa 8 bits: de 0 (desligado) a 255 (sempre ligado).'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Qual destes pinos do Uno NÃO suporta PWM?',
          choices: [
            { id: 'a', text: 'Pino 9' },
            { id: 'b', text: 'Pino 6' },
            { id: 'c', text: 'Pino 3' },
            { id: 'd', text: 'Pino 8' }
          ],
          answer: 'd',
          explanation: 'Os pinos PWM do Uno são 3, 5, 6, 9, 10 e 11 (marcados com ~); o pino 8 não é.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual é o duty cycle aproximado de analogWrite(9, 127)?',
          choices: [
            { id: 'a', text: 'Cerca de 50%' },
            { id: 'b', text: 'Cerca de 10%' },
            { id: 'c', text: '127%' },
            { id: 'd', text: '0%' }
          ],
          answer: 'a',
          explanation: '127 é cerca de metade de 255, então o pino fica ligado por metade do tempo.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a função que gera uma saída PWM no pino 9:',
          code: '___(9, 128);',
          accept: ['analogWrite'],
          explanation: 'analogWrite(pino, valor) gera PWM; o valor vai de 0 a 255.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Por que se diz que analogWrite não é saída analógica "de verdade"?',
          choices: [
            { id: 'a', text: 'Porque funciona só com 3,3 V' },
            { id: 'b', text: 'Porque na verdade o pino alterna rapidamente entre 0 V e 5 V, e a média é que varia' },
            { id: 'c', text: 'Porque só funciona com LEDs azuis' },
            { id: 'd', text: 'Porque é um recurso que não existe no Uno' }
          ],
          answer: 'b',
          explanation: 'O PWM é um liga-desliga rápido; o brilho percebido (média) é que muda, não a tensão instantânea.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O que acontece neste laço?\n\nfor (int b = 0; b <= 255; b++) {\n  analogWrite(9, b);\n  delay(5);\n}',
          choices: [
            { id: 'a', text: 'O LED fica apagado' },
            { id: 'b', text: 'O LED pisca duas vezes' },
            { id: 'c', text: 'Dá erro, pois b não pode chegar a 255' },
            { id: 'd', text: 'O brilho do LED aumenta gradualmente do apagado ao máximo' }
          ],
          answer: 'd',
          explanation: 'b vai de 0 a 255 em passos de 1, com 5 ms entre eles: o brilho cresce suavemente (fade in).'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Como converter a leitura de um potenciômetro (0–1023) para controlar o brilho com analogWrite?',
          choices: [
            { id: 'a', text: 'analogWrite(9, analogRead(A0)) direto, pois 1023 cabe no analogWrite' },
            { id: 'b', text: 'Não é possível' },
            { id: 'c', text: 'Usar map(analogRead(A0), 0, 1023, 0, 255) e passar o resultado ao analogWrite' },
            { id: 'd', text: 'Usar digitalWrite(9, analogRead(A0))' }
          ],
          answer: 'c',
          explanation: 'As faixas são diferentes (0–1023 e 0–255); map ajusta uma escala na outra.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o valor que dá o brilho máximo (100% de duty cycle):',
          code: 'analogWrite(9, ___);',
          accept: ['255'],
          explanation: '255 é o valor máximo do analogWrite: pino sempre em HIGH.'
        }
      ]
    },
    {
      id: 'ard-21-led-rgb',
      title: 'LED RGB',
      goal: 'Montar e controlar um LED RGB com três saídas PWM, entendendo cátodo e ânodo comum, mistura de cores e a função setCor.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'O que é um LED RGB',
            body: 'Um LED RGB é, na prática, três LEDs (vermelho, verde e azul, de Red, Green e Blue) dentro do mesmo encapsulamento. Ele tem 4 pernas: uma para cada cor e uma perna COMUM, que costuma ser a mais longa. Controlando a intensidade de cada cor separadamente, é possível criar quase qualquer cor. A ordem das pernas varia entre modelos; é comum ver, da esquerda para a direita com o lado achatado à esquerda: vermelho, comum, verde, azul. Confira a folha de dados (datasheet) ou teste o seu, sempre com resistores.'
          },
          {
            title: 'Cátodo comum e ânodo comum',
            body: 'Como são três LEDs, uma das pontas deles é compartilhada. No LED de CÁTODO comum, os cátodos (lados negativos) estão juntos: a perna comum vai ao GND e cada cor acende quando o pino recebe nível ALTO (HIGH, 5 V). No LED de ÂNODO comum, os ânodos (lados positivos) estão juntos: a perna comum vai ao 5V e cada cor acende quando o pino recebe nível BAIXO (LOW, 0 V), porque a corrente passa do 5V comum para o pino em 0 V. Descobrir qual é o seu modelo é o primeiro passo; se as cores aparecerem invertidas, o seu é o outro tipo.'
          },
          {
            title: 'Um resistor para cada cor',
            body: 'Cada cor é um LED separado e precisa do seu próprio resistor em série, ligado entre o pino do Arduino e a perna da cor. Um resistor único na perna comum não é recomendado: a corrente de cada cor ficaria dependendo de quais cores estão acesas ao mesmo tempo, e o brilho mudaria de forma confusa. Resistores de 220 Ω funcionam bem com 5 V: o vermelho (queda de cerca de 2 V) recebe uns 14 mA e o verde e o azul (queda de cerca de 3 V) uns 9 mA, tudo abaixo do limite seguro de 20 mA por pino. Valores diferentes em cada cor são aceitáveis, e até úteis para equilibrar o brilho.'
          },
          {
            title: 'Três pinos PWM e a mistura de cores',
            body: 'Para variar a intensidade de cada cor, os três pinos precisam suportar PWM: no Uno, 3, 5, 6, 9, 10 e 11. Aqui usaremos o 9 (vermelho), o 10 (verde) e o 11 (azul), com valores de 0 a 255 em analogWrite. A mistura é ADITIVA (luz se soma): vermelho + verde = amarelo, vermelho + azul = magenta, verde + azul = ciano e os três juntos = branco aproximado. Com todos em 0, o LED fica apagado. Em um pino sem PWM só dá para ligar ou desligar cada cor, o que limita você a 8 combinações.',
            code: '// cátodo comum: 255 = máximo brilho da cor\nanalogWrite(9, 255); analogWrite(10, 0);   analogWrite(11, 0);   // vermelho\nanalogWrite(9, 255); analogWrite(10, 255); analogWrite(11, 0);   // amarelo\nanalogWrite(9, 0);   analogWrite(10, 255); analogWrite(11, 255); // ciano'
          },
          {
            title: 'A função auxiliar setCor(r, g, b)',
            body: 'Repetir três analogWrite o tempo todo é cansativo. Crie uma função setCor(r, g, b) que recebe a intensidade de cada cor. Com ela, setCor(255, 0, 0) lê-se como "vermelho". No ÂNODO comum a lógica é invertida: 0 acende no máximo e 255 apaga. Basta aplicar 255 - valor dentro da função, e o resto do programa continua pensando "255 é mais brilho". Assim, trocar o tipo de LED mexe em um só lugar.',
            code: 'const int PINO_R = 9;\nconst int PINO_G = 10;\nconst int PINO_B = 11;\n\n// Cátodo comum\nvoid setCor(int r, int g, int b) {\n  analogWrite(PINO_R, r);\n  analogWrite(PINO_G, g);\n  analogWrite(PINO_B, b);\n}\n\n// Ânodo comum (lógica invertida):\n// analogWrite(PINO_R, 255 - r); ... e igual para g e b'
          },
          {
            title: 'Transição de cores com laço',
            body: 'Com setCor, uma transição suave vira um laço for: enquanto uma cor vai de 255 a 0, a próxima vai de 0 a 255. O exemplo passa por vermelho, verde, azul e volta ao vermelho, um arco-íris simples, com uma pequena pausa em cada passo para o olho ver a mudança. Como o brilho é percebido de forma diferente por cor (o verde costuma parecer o mais forte e o azul o mais fraco para o mesmo valor), as cores intermediárias podem parecer irregulares; ajustar os resistores ou escalar os valores ajuda.',
            code: 'void loop() {\n  for (int i = 0; i <= 255; i++) {\n    setCor(255 - i, i, 0);   // vermelho -> verde\n    delay(10);\n  }\n  for (int i = 0; i <= 255; i++) {\n    setCor(0, 255 - i, i);   // verde -> azul\n    delay(10);\n  }\n  for (int i = 0; i <= 255; i++) {\n    setCor(i, 0, 255 - i);   // azul -> vermelho\n    delay(10);\n  }\n}'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'O que é um LED RGB?',
          choices: [
            { id: 'a', text: 'Um LED que só acende na cor branca' },
            { id: 'b', text: 'Três LEDs (vermelho, verde e azul) no mesmo encapsulamento' },
            { id: 'c', text: 'Um LED que muda de cor sozinho, sem ser controlado' },
            { id: 'd', text: 'Um LED de 3 V que dispensa resistor' }
          ],
          answer: 'b',
          explanation: 'RGB significa Red, Green, Blue: são três LEDs em um só encapsulamento, controlados separadamente (4 pernas, com uma comum).'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Em um LED RGB de cátodo comum, para onde vai a perna comum?',
          choices: [
            { id: 'a', text: 'Ao 5V' },
            { id: 'b', text: 'A um pino PWM' },
            { id: 'c', text: 'Ao GND' },
            { id: 'd', text: 'Ao pino A0' }
          ],
          answer: 'c',
          explanation: 'No cátodo comum, os lados negativos estão juntos e vão ao GND; cada cor acende com HIGH no seu pino.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual cor aparece ao acender o vermelho e o verde ao mesmo tempo?',
          choices: [
            { id: 'a', text: 'Amarelo' },
            { id: 'b', text: 'Roxo' },
            { id: 'c', text: 'Ciano' },
            { id: 'd', text: 'Marrom escuro' }
          ],
          answer: 'a',
          explanation: 'A mistura de luz é aditiva: vermelho + verde = amarelo, vermelho + azul = magenta, verde + azul = ciano.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Em um LED de ânodo comum, a lógica é invertida. Complete a conta que converte o valor r (0 a 255) no valor enviado ao pino:',
          code: 'analogWrite(PINO_R, ___ - r);',
          accept: ['255'],
          explanation: 'No ânodo comum a cor acende com nível baixo: 255 - r inverte o valor, de modo que r = 255 vira 0 (brilho máximo).'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Por que cada cor de um LED RGB deve ter o seu próprio resistor, em vez de um único resistor na perna comum?',
          choices: [
            { id: 'a', text: 'Porque o LED RGB só funciona com três resistores iguais' },
            { id: 'b', text: 'Porque resistores só funcionam em número ímpar' },
            { id: 'c', text: 'Porque o Arduino exige um resistor por pino digital' },
            { id: 'd', text: 'Para controlar a corrente de cada LED interno sem que o brilho de uma cor dependa de quais outras estão acesas' }
          ],
          answer: 'd',
          explanation: 'Cada cor é um LED com sua própria queda de tensão. Com um resistor só, a corrente se dividiria de modo diferente conforme as cores acesas e o brilho ficaria inconsistente.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Em um LED de ânodo comum, qual valor deve ser enviado por analogWrite ao pino do verde para ele acender com o MÁXIMO de brilho?',
          choices: [
            { id: 'a', text: '255' },
            { id: 'b', text: '0' },
            { id: 'c', text: '127' },
            { id: 'd', text: '1023' }
          ],
          answer: 'b',
          explanation: 'No ânodo comum o 5V está na perna comum e o pino fecha o circuito ao ir para 0 V: o pino em 0 (sempre LOW) dá o brilho máximo, e 255 apaga.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Para variar o brilho de cada cor de um LED RGB no Uno, que tipo de pino devem ser usados os três pinos de cor?',
          choices: [
            { id: 'a', text: 'Os pinos 0 e 1, pois são os de comunicação' },
            { id: 'b', text: 'Os pinos 2, 4 e 7, que são digitais comuns' },
            { id: 'c', text: 'Pinos com PWM, como 9, 10 e 11 (marcados com ~)' },
            { id: 'd', text: 'Os pinos 5V e GND' }
          ],
          answer: 'c',
          explanation: 'Só os pinos PWM (3, 5, 6, 9, 10 e 11 no Uno) geram intensidades intermediárias com analogWrite; nos outros só dá para ligar ou desligar a cor.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o tipo de retorno da função auxiliar que apenas define a cor e não devolve valor:',
          code: '___ setCor(int r, int g, int b) {\n  analogWrite(PINO_R, r);\n  analogWrite(PINO_G, g);\n  analogWrite(PINO_B, b);\n}',
          accept: ['void'],
          explanation: 'A função só executa ações (os analogWrite) e não devolve nada, então o tipo de retorno é void.'
        }
      ]
    },
    {
      id: 'ard-15-arrays',
      title: 'Arrays e vários LEDs',
      goal: 'Declarar e percorrer arrays, calcular o tamanho com sizeof e criar efeitos com vários LEDs.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'O que é um array',
            body: 'Um array (vetor) é uma coleção de valores do mesmo tipo guardados sob um único nome, lado a lado na memória. Em vez de criar led1, led2, led3, led4, você cria um array e acessa cada posição por um índice. Isso facilita muito projetos com vários LEDs ou botões.',
            code: 'int leds[] = {2, 3, 4, 5}; // 4 elementos\nint notas[5];              // 5 espaços sem valor definido'
          },
          {
            title: 'Índices começam em 0',
            body: 'A primeira posição é a 0, e não a 1. Em um array de 4 elementos os índices válidos são 0, 1, 2 e 3 (o último é tamanho − 1). Para ler ou escrever, use colchetes. Acessar um índice fora do tamanho (como leds[4] aqui) não gera erro de compilação, mas lê ou grava na memória de outras variáveis, causando comportamento estranho — um bug perigoso.',
            code: 'int leds[] = {2, 3, 4, 5};\nint a = leds[0]; // 2\nint b = leds[3]; // 5\nleds[1] = 9;     // muda o segundo elemento'
          },
          {
            title: 'Descobrindo o tamanho com sizeof',
            body: 'sizeof devolve o tamanho, em bytes, de uma variável. Dividindo o tamanho do array pelo tamanho de um elemento, você obtém a quantidade de elementos, mesmo que depois adicione ou remova posições. No Uno, cada int ocupa 2 bytes: um array de 4 int tem 8 bytes, e 8 / 2 = 4 elementos.',
            code: 'int leds[] = {2, 3, 4, 5};\nconst int N = sizeof(leds) / sizeof(leds[0]); // 4'
          },
          {
            title: 'Percorrendo com for',
            body: 'O laço for combina muito bem com arrays: o contador i serve de índice. Assim você configura ou acende todos os LEDs com poucas linhas, sem repetir código.',
            code: 'const int N = sizeof(leds) / sizeof(leds[0]);\n\nvoid setup() {\n  for (int i = 0; i < N; i++) {\n    pinMode(leds[i], OUTPUT);\n  }\n}'
          },
          {
            title: 'Efeito chaser (corrida de LEDs)',
            body: 'No chaser, um LED por vez acende, em sequência, dando a sensação de movimento. Acenda o LED i, espere, apague-o, e passe ao próximo. Cada LED precisa do seu próprio resistor, ligado ao respectivo pino digital e ao GND.',
            code: 'void loop() {\n  for (int i = 0; i < N; i++) {\n    digitalWrite(leds[i], HIGH);\n    delay(150);\n    digitalWrite(leds[i], LOW);\n  }\n}'
          },
          {
            title: 'Variações do efeito',
            body: 'Para ir e voltar, depois do primeiro for faça outro com i decrescente (for (int i = N - 2; i > 0; i--)), evitando repetir as pontas. Para acender todos ao mesmo tempo, use um for só com HIGH e depois um for com LOW. Os arrays também servem para guardar sequências de valores, como as notas de uma melodia, que veremos em breve.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Dado int leds[] = {2, 3, 4, 5}; qual é o valor de leds[0]?',
          choices: [
            { id: 'a', text: '3' },
            { id: 'b', text: '4' },
            { id: 'c', text: '2' },
            { id: 'd', text: '5' }
          ],
          answer: 'c',
          explanation: 'Índices começam em 0, então leds[0] é o primeiro elemento: 2.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Em um array com 5 elementos, qual é o índice do último elemento?',
          choices: [
            { id: 'a', text: '5' },
            { id: 'b', text: '4' },
            { id: 'c', text: '6' },
            { id: 'd', text: '0' }
          ],
          answer: 'b',
          explanation: 'Os índices vão de 0 a tamanho − 1, ou seja, de 0 a 4.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual expressão calcula o número de elementos de um array de int chamado leds?',
          choices: [
            { id: 'a', text: 'sizeof(leds)' },
            { id: 'b', text: 'sizeof(leds) * sizeof(leds[0])' },
            { id: 'c', text: 'sizeof(leds[0])' },
            { id: 'd', text: 'sizeof(leds) / sizeof(leds[0])' }
          ],
          answer: 'd',
          explanation: 'Tamanho total em bytes dividido pelo tamanho de um elemento dá a contagem de elementos.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o índice do primeiro elemento do array:',
          code: 'int primeiro = leds[___];',
          accept: ['0'],
          explanation: 'Em arrays, a contagem de índices começa em 0.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que acontece ao acessar leds[10] em um array de 4 elementos?',
          choices: [
            { id: 'a', text: 'O compilador sempre acusa erro' },
            { id: 'b', text: 'O Arduino devolve 0 com segurança' },
            { id: 'c', text: 'O array aumenta de tamanho automaticamente' },
            { id: 'd', text: 'Lê memória fora do array, causando comportamento imprevisível' }
          ],
          answer: 'd',
          explanation: 'C/C++ não checa limites: o acesso fora do array lê (ou corrompe) memória de outras variáveis.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Qual é a utilidade de um for com contador i junto a um array de pinos?',
          choices: [
            { id: 'a', text: 'Usar i como índice, configurando ou acionando todos os LEDs sem repetir código' },
            { id: 'b', text: 'Aumentar a tensão dos pinos' },
            { id: 'c', text: 'Evitar o uso de resistores' },
            { id: 'd', text: 'Converter o array em float' }
          ],
          answer: 'a',
          explanation: 'O contador do for percorre os índices do array, reaproveitando as mesmas linhas para cada LED.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'No Uno (int de 2 bytes), qual é o resultado de sizeof(leds) / sizeof(leds[0]) se leds tem 6 elementos int?',
          choices: [
            { id: 'a', text: '12' },
            { id: 'b', text: '2' },
            { id: 'c', text: '6' },
            { id: 'd', text: '0' }
          ],
          answer: 'c',
          explanation: 'sizeof(leds) = 12 bytes e sizeof(leds[0]) = 2 bytes: 12 / 2 = 6 elementos.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete o operador que devolve o tamanho em bytes de uma variável ou array:',
          code: 'const int N = ___(leds) / sizeof(leds[0]);',
          accept: ['sizeof'],
          explanation: 'sizeof devolve o tamanho em bytes; dividir pelo tamanho de um elemento dá a quantidade.'
        }
      ]
    },
    {
      id: 'ard-16-buzzer',
      title: 'Buzzer e som',
      goal: 'Diferenciar buzzer ativo e passivo e tocar notas e melodias com tone, noTone e arrays.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Som é vibração: a frequência',
            body: 'Som é o ar vibrando. A frequência é quantas vibrações acontecem por segundo e se mede em hertz (Hz). Quanto MAIOR a frequência, mais AGUDO é o som; quanto menor, mais grave. O ouvido humano percebe aproximadamente de 20 Hz a 20 000 Hz. Para o Arduino fazer som, o pino precisa alternar HIGH e LOW na frequência desejada.'
          },
          {
            title: 'Buzzer ativo e passivo',
            body: 'O buzzer ativo tem um oscilador interno: ao ser alimentado, apita num tom fixo, e basta digitalWrite(pino, HIGH) para soar e LOW para silenciar. O buzzer passivo não tem oscilador: ele só vibra se o Arduino enviar o sinal oscilante, e por isso consegue tocar notas diferentes. Se você usar tone() em um buzzer ativo, ele continuará com o tom fixo dele, só ligando e desligando. Ligue o terminal + (perna longa) ao pino e o outro ao GND.',
            code: '// buzzer ativo\ndigitalWrite(8, HIGH); // apita\ndelay(300);\ndigitalWrite(8, LOW);  // silêncio'
          },
          {
            title: 'tone e noTone',
            body: 'tone(pino, frequencia) gera uma onda quadrada na frequência (em Hz) naquele pino, e o som continua até você chamar noTone(pino). Há também tone(pino, frequencia, duracao), que toca por um tempo em milissegundos e para sozinho. Importante: tone() não bloqueia, retorna na hora e o som toca "em segundo plano", então use delay para esperar a nota terminar antes da próxima. Ele usa um dos temporizadores do chip e atrapalha o PWM (analogWrite) nos pinos 3 e 11 do Uno.',
            code: 'tone(8, 440);      // toca 440 Hz sem parar\ndelay(1000);\nnoTone(8);         // para\n\ntone(8, 880, 500); // 880 Hz por 500 ms'
          },
          {
            title: 'Frequências das notas',
            body: 'Cada nota musical tem uma frequência. Na oitava central: Dó (C4) 262 Hz, Ré (D4) 294 Hz, Mi (E4) 330 Hz, Fá (F4) 349 Hz, Sol (G4) 392 Hz, Lá (A4) 440 Hz, Si (B4) 494 Hz e o Dó seguinte (C5) 523 Hz. A nota Lá de 440 Hz é a usada para afinar instrumentos. Dobrar a frequência sobe uma oitava (440 Hz → 880 Hz).'
          },
          {
            title: 'Melodia com arrays',
            body: 'Para tocar uma sequência, guarde as notas em um array e as durações em outro, na mesma ordem (a posição i de um corresponde à posição i do outro). Um for percorre os dois ao mesmo tempo. Uma pausa curta entre notas evita que fiquem emendadas.',
            code: 'int notas[]    = {262, 294, 330, 349, 392};\nint duracoes[] = {300, 300, 300, 300, 600};\nconst int N = sizeof(notas) / sizeof(notas[0]);\n\nvoid loop() {\n  for (int i = 0; i < N; i++) {\n    tone(8, notas[i], duracoes[i]);\n    delay(duracoes[i] * 1.3); // dá uma pausa entre notas\n  }\n  noTone(8);\n  delay(2000);\n}'
          },
          {
            title: 'Cuidados',
            body: 'Buzzers pequenos funcionam direto no pino, mas confira a corrente do seu modelo (alto-falantes e buzzers potentes precisam de transistor). Coloque um resistor de algumas centenas de ohms em série se quiser reduzir o volume e proteger o pino. Som muito alto por muito tempo cansa e incomoda: use volumes baixos e pausas.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual é a diferença entre o buzzer ativo e o passivo?',
          choices: [
            { id: 'a', text: 'O passivo apita sozinho e o ativo precisa de sinal oscilante' },
            { id: 'b', text: 'O ativo tem oscilador interno e apita em tom fixo ao ser alimentado; o passivo precisa receber o sinal oscilante do Arduino' },
            { id: 'c', text: 'O ativo só funciona com 3,3 V' },
            { id: 'd', text: 'Não há diferença' }
          ],
          answer: 'b',
          explanation: 'Só o passivo, controlado por tone(), consegue tocar notas diferentes; o ativo emite sempre o mesmo tom.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O que acontece quando a frequência do som aumenta?',
          choices: [
            { id: 'a', text: 'O som fica mais grave' },
            { id: 'b', text: 'O som fica mais fraco' },
            { id: 'c', text: 'O som fica mais agudo' },
            { id: 'd', text: 'O som some' }
          ],
          answer: 'c',
          explanation: 'Mais vibrações por segundo significam som mais agudo.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'Qual nota tem a frequência de 440 Hz?',
          choices: [
            { id: 'a', text: 'Dó' },
            { id: 'b', text: 'Mi' },
            { id: 'c', text: 'Sol' },
            { id: 'd', text: 'Lá' }
          ],
          answer: 'd',
          explanation: 'O Lá central (A4) tem 440 Hz e é a referência de afinação.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a função que toca uma frequência de 440 Hz no pino 8 (buzzer passivo):',
          code: '___(8, 440);',
          accept: ['tone'],
          explanation: 'tone(pino, frequencia) gera o sinal na frequência desejada.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O que acontece com este trecho?\n\ntone(8, 440, 1000);\ndigitalWrite(13, HIGH);',
          choices: [
            { id: 'a', text: 'O LED só acende depois de 1 segundo, quando o som termina' },
            { id: 'b', text: 'O LED acende imediatamente, enquanto o som toca em segundo plano' },
            { id: 'c', text: 'O som nunca toca' },
            { id: 'd', text: 'Dá erro de compilação' }
          ],
          answer: 'b',
          explanation: 'tone() não bloqueia o programa: retorna na hora e o som continua; para esperar a nota terminar é preciso usar delay.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Em uma melodia com dois arrays (notas[] e duracoes[]), como eles se relacionam?',
          choices: [
            { id: 'a', text: 'duracoes[i] é a duração da nota notas[i]; ambos usam o mesmo índice' },
            { id: 'b', text: 'Cada array toca em uma faixa de volume diferente' },
            { id: 'c', text: 'duracoes[i] é a frequência da nota notas[i + 1]' },
            { id: 'd', text: 'Não precisam ter o mesmo tamanho' }
          ],
          answer: 'a',
          explanation: 'A posição i dos dois arrays descreve a mesma nota: frequência em um, duração no outro.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'O que acontece ao usar tone(8, 880) com um buzzer ATIVO?',
          choices: [
            { id: 'a', text: 'Ele toca exatamente 880 Hz' },
            { id: 'b', text: 'Ele queima na hora' },
            { id: 'c', text: 'Ele só apita no seu tom fixo, sem seguir a frequência pedida' },
            { id: 'd', text: 'Ele toca mais grave' }
          ],
          answer: 'c',
          explanation: 'O oscilador do buzzer ativo gera o tom; o Arduino só o liga e desliga, então a frequência não é controlada.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a função que para o som no pino 8:',
          code: '___(8);',
          accept: ['noTone'],
          explanation: 'noTone(pino) interrompe o som gerado por tone().'
        }
      ]
    },
    {
      id: 'ard-17-sensores-analogicos',
      title: 'Divisor de tensão e sensores',
      goal: 'Entender o divisor de tensão e usar LDR e LM35 (e noções de termistor) para ler luz e temperatura.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'O problema: ler resistência',
            body: 'Muitos sensores simples (como o LDR e o termistor) mudam a sua resistência, mas o Arduino só lê tensão. A solução é converter resistência em tensão com um divisor de tensão: dois resistores em série entre 5V e GND, com a leitura feita no ponto entre eles.'
          },
          {
            title: 'A fórmula do divisor',
            body: 'Com R1 ligado ao 5V e R2 ligado ao GND, a tensão no ponto central é Vout = Vin × R2 / (R1 + R2). Se os dois resistores forem iguais, Vout é a metade de Vin. Exemplo: R1 = R2 = 10 kΩ e Vin = 5 V dão Vout = 2,5 V. Aumentar R2 (em relação a R1) aumenta Vout; aumentar R1 diminui Vout.',
            code: 'Vout = Vin * R2 / (R1 + R2)\n5 * 10k / (10k + 10k) = 2,5 V'
          },
          {
            title: 'LDR: sensor de luz',
            body: 'O LDR (Resistor Dependente de Luz) tem resistência alta no escuro (da ordem de megaohms) e baixa com luz forte (de centenas de ohms a poucos kiloohms; varia por modelo). Monte: 5V → LDR → ponto central (ligado a A0) → resistor fixo de 10 kΩ → GND. Com mais luz, a resistência do LDR cai e a tensão em A0 SOBE (leitura maior). Se trocar as posições do LDR e do resistor, o comportamento se inverte.',
            code: 'int luz = analogRead(A0);\nif (luz < 300) {\n  digitalWrite(8, HIGH); // escuro: acende o LED\n} else {\n  digitalWrite(8, LOW);\n}'
          },
          {
            title: 'Calibrar o limite',
            body: 'Os valores variam conforme o LDR, o resistor e o ambiente; por isso, imprima as leituras no Serial Monitor em situações de claro e escuro e escolha o limite entre elas. Para evitar que a luz fique piscando perto do limite, use uma margem (histerese): ligue abaixo de 300 e só desligue acima de 350, por exemplo.'
          },
          {
            title: 'Termistor NTC',
            body: 'O termistor NTC é um resistor cuja resistência DIMINUI quando a temperatura sobe (NTC = coeficiente negativo). Ele também é lido por um divisor de tensão. Transformar a leitura em graus exige uma equação (como a de Steinhart-Hart ou o modelo Beta) com dados do fabricante; por isso, em projetos iniciais, costuma-se preferir um sensor pronto como o LM35.'
          },
          {
            title: 'LM35: sensor de temperatura pronto',
            body: 'O LM35 tem 3 pinos (+Vs ao 5V, Vout à entrada analógica e GND) e entrega 10 mV por grau Celsius: 250 mV significam 25 °C. Converta a leitura em tensão e multiplique por 100 (pois 1 V equivale a 100 °C). Cada passo do ADC (cerca de 4,9 mV) corresponde a quase 0,5 °C, então a leitura oscila um pouco; faça a média de várias leituras para suavizar. Confira a ordem dos pinos no datasheet do seu modelo antes de ligar: uma inversão pode esquentar e danificar o sensor.',
            code: 'int leitura = analogRead(A0);\nfloat tensao = leitura * 5.0 / 1023;\nfloat tempC = tensao * 100; // 10 mV por grau\nSerial.println(tempC);'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual é a tensão no ponto central de um divisor com R1 = 10 kΩ (ao 5V) e R2 = 10 kΩ (ao GND)?',
          choices: [
            { id: 'a', text: '5 V' },
            { id: 'b', text: '0 V' },
            { id: 'c', text: '10 V' },
            { id: 'd', text: '2,5 V' }
          ],
          answer: 'd',
          explanation: 'Vout = 5 × 10k / (10k + 10k) = 2,5 V, a metade da tensão de entrada.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'Por que sensores como o LDR são ligados em um divisor de tensão?',
          choices: [
            { id: 'a', text: 'Porque o Arduino mede tensão, não resistência diretamente' },
            { id: 'b', text: 'Porque o LDR só funciona em 12 V' },
            { id: 'c', text: 'Porque o divisor aumenta a luz' },
            { id: 'd', text: 'Porque o LDR não pode ser ligado ao GND' }
          ],
          answer: 'a',
          explanation: 'O divisor converte a variação de resistência em variação de tensão, que o ADC consegue ler.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'No circuito 5V → LDR → A0 → 10 kΩ → GND, o que acontece com a leitura do analogRead quando a luz AUMENTA?',
          choices: [
            { id: 'a', text: 'Diminui' },
            { id: 'b', text: 'Fica sempre em 0' },
            { id: 'c', text: 'Aumenta, pois a resistência do LDR cai e a tensão em A0 sobe' },
            { id: 'd', text: 'Não muda' }
          ],
          answer: 'c',
          explanation: 'Com mais luz, o LDR conduz melhor; o resistor de 10 kΩ ao GND passa a ter maior fração da tensão, e A0 sobe.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete o fator de conversão do LM35 (10 mV por °C): tensão em volts × ___ = temperatura em °C.',
          code: 'float tempC = tensao * ___;',
          accept: ['100', '100.0'],
          explanation: '10 mV = 0,01 V por grau, então 1 V corresponde a 100 °C: multiplica-se por 100.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'O LM35 entrega 300 mV na saída. Qual é a temperatura?',
          choices: [
            { id: 'a', text: '3 °C' },
            { id: 'b', text: '30 °C' },
            { id: 'c', text: '300 °C' },
            { id: 'd', text: '0,3 °C' }
          ],
          answer: 'b',
          explanation: 'Com 10 mV por grau: 300 mV / 10 mV = 30 °C.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'Como a resistência de um termistor NTC se comporta quando a temperatura sobe?',
          choices: [
            { id: 'a', text: 'Aumenta' },
            { id: 'b', text: 'Diminui' },
            { id: 'c', text: 'Fica constante' },
            { id: 'd', text: 'Vira zero imediatamente' }
          ],
          answer: 'b',
          explanation: 'NTC significa coeficiente de temperatura negativo: mais temperatura, menos resistência.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'Como definir bem o limite (por exemplo, 300) para acender uma luz no escuro com LDR?',
          choices: [
            { id: 'a', text: 'Sempre usar 512, o meio da faixa' },
            { id: 'b', text: 'Sorteando um valor' },
            { id: 'c', text: 'Usar sempre 0' },
            { id: 'd', text: 'Imprimindo no Serial Monitor as leituras no claro e no escuro, e escolhendo um valor entre elas' }
          ],
          answer: 'd',
          explanation: 'Cada LDR e ambiente têm valores diferentes; medir e calibrar é o caminho confiável.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete: o LDR é um resistor dependente de ___ (a resistência muda conforme a claridade).',
          code: 'LDR = resistor dependente de ___',
          accept: ['luz', 'Luz', 'light'],
          explanation: 'LDR vem de Light Dependent Resistor: resistor dependente de luz.'
        }
      ]
    },
    {
      id: 'ard-18-depuracao',
      title: 'Depuração e boas práticas',
      goal: 'Encontrar e corrigir erros de compilação, upload e fiação, usar o Serial para depurar e seguir boas práticas e regras de segurança.',
      xp: 20,
      intro: {
        slides: [
          {
            title: 'Depurar com o Serial',
            body: 'Depurar (debug) é descobrir por que o programa não faz o que você esperava. A técnica mais simples e eficaz é imprimir no Serial Monitor: valores de variáveis, leituras de sensores, e mensagens como "entrei no if" para saber por onde o programa passa. Imprima o rótulo junto do valor para não se confundir. Quando tudo estiver funcionando, remova ou comente os prints desnecessários, pois diminuem a velocidade. Logs também não devem registrar dados pessoais de ninguém: em projetos reais, registre só o necessário (princípio da LGPD).',
            code: 'Serial.print("leitura = ");\nSerial.println(leitura);\n\nif (leitura > 500) {\n  Serial.println("entrou no if");\n}'
          },
          {
            title: 'Erros de compilação comuns',
            body: 'Quando o compilador reclama, leia a PRIMEIRA mensagem de erro e o número da linha (às vezes o erro real está na linha anterior). Os mais comuns: "expected \';\' before ..." (faltou ponto e vírgula); "expected \'}\' at end of input" (faltou fechar uma chave); "\'x\' was not declared in this scope" (a variável ou função não foi declarada, está escrita com letra diferente, ou está fora do escopo); "does not name a type" (tipo escrito errado, como Int em vez de int).'
          },
          {
            title: 'Entendendo "was not declared in this scope"',
            body: 'Esse erro significa "não sei o que é esse nome aqui". Causas típicas: erro de digitação (ledPin vs ledpin, lembrando que a linguagem é case-sensitive), esquecer de declarar a variável, ou declará-la dentro de outra função (local) e usá-la em outra. A correção é declarar a variável no escopo certo e conferir a grafia.',
            code: 'void setup() {\n  int led = 8;     // local do setup\n}\nvoid loop() {\n  digitalWrite(led, HIGH); // erro: led was not declared\n}\n// solução: declarar led fora das funções'
          },
          {
            title: 'Erros de upload',
            body: 'Se a compilação passa mas o envio falha (mensagens como "avrdude: stk500_getsync(): not in sync" ou "programmer is not responding"), verifique nesta ordem: o cabo USB (precisa transmitir dados), a porta selecionada, a placa selecionada (Arduino Uno), e se há algo ligado nos pinos 0 e 1 (RX/TX), que atrapalha o upload; tire a fiação desses pinos e tente de novo. Fechar o Serial Monitor aberto em outro programa também ajuda.'
          },
          {
            title: 'Checar a fiação',
            body: 'O programa pode estar certo e o circuito errado. Cheque: polaridade do LED (perna longa no lado do pino), resistor presente, o pino do código é o mesmo da fiação, o GND do circuito está ligado ao GND do Arduino, fios bem encaixados nos furos corretos da protoboard (lembre as colunas de 5 furos). Monte e mude o circuito com o Arduino desligado; teste uma parte por vez em vez de montar tudo e só depois ligar.'
          },
          {
            title: 'Boas práticas de código',
            body: 'Use nomes significativos (ledVermelho, botaoStart) em vez de a, b, x. Dê nomes aos números de pinos com const. Comente o porquê das decisões, não o óbvio. Divida o programa em funções pequenas, cada uma com uma tarefa. Mantenha o código indentado. Teste um recurso por vez e salve versões que funcionam.',
            code: 'const int PINO_LED_VERMELHO = 8;\nconst int PINO_BOTAO = 2;\n\nbool botaoApertado() {\n  return digitalRead(PINO_BOTAO) == LOW;\n}'
          },
          {
            title: 'Segurança: cargas fora do limite do pino',
            body: 'Nunca ligue um motor, relé, solenoide ou lâmpada direto em um pino do Arduino: um pino aguenta cerca de 20 mA (40 mA no máximo) e esses componentes pedem muito mais, o que queima o pino e pode danificar o chip. Use um transistor ou módulo driver (e, em motores e relés, um diodo de proteção) alimentado por fonte externa adequada, ligando os GNDs em comum. Cargas de rede elétrica (127/220 V) só com módulo relé próprio, isolação adequada, conhecimento técnico e supervisão de pessoa qualificada: o risco de choque e incêndio é real. Nunca aplique mais de 5 V em um pino de entrada.'
          }
        ]
      },
      questions: [
        {
          id: 'q1', kind: 'mcq',
          prompt: 'Qual técnica simples ajuda a descobrir o valor de uma variável durante a execução do programa?',
          choices: [
            { id: 'a', text: 'Imprimir o valor com Serial.print/println e abrir o Serial Monitor' },
            { id: 'b', text: 'Trocar de placa' },
            { id: 'c', text: 'Apagar o loop()' },
            { id: 'd', text: 'Aumentar o delay para 10 minutos' }
          ],
          answer: 'a',
          explanation: 'Imprimir valores e mensagens no Serial é a forma mais prática de depurar um sketch.'
        },
        {
          id: 'q2', kind: 'mcq',
          prompt: 'O erro "\'ledd\' was not declared in this scope" normalmente indica...',
          choices: [
            { id: 'a', text: 'Que o Arduino está sem energia' },
            { id: 'b', text: 'Que a porta COM está errada' },
            { id: 'c', text: 'Que o LED está queimado' },
            { id: 'd', text: 'Um nome usado sem ter sido declarado (por exemplo, erro de digitação ou escopo errado)' }
          ],
          answer: 'd',
          explanation: 'O compilador não conhece o nome ledd: pode ser um erro de digitação, variável não declarada ou fora de escopo.'
        },
        {
          id: 'q3', kind: 'mcq',
          prompt: 'A mensagem "expected \';\' before \'}\' token" aponta, geralmente, para qual problema?',
          choices: [
            { id: 'a', text: 'A placa errada' },
            { id: 'b', text: 'Faltou o ponto e vírgula no fim de uma instrução (na linha indicada ou na anterior)' },
            { id: 'c', text: 'Memória cheia' },
            { id: 'd', text: 'O cabo USB está solto' }
          ],
          answer: 'b',
          explanation: 'O ; é obrigatório ao fim de cada instrução; o compilador percebe a falta ao encontrar o próximo elemento.'
        },
        {
          id: 'q4', kind: 'fill',
          prompt: 'Complete a palavra da mensagem de erro: "\'x\' was not ___ in this scope".',
          code: 'error: \'x\' was not ___ in this scope',
          accept: ['declared'],
          explanation: 'A mensagem é "was not declared in this scope": o nome não foi declarado naquele ponto.'
        },
        {
          id: 'q5', kind: 'mcq',
          prompt: 'Por que não se deve ligar um motor DC direto em um pino digital do Arduino?',
          choices: [
            { id: 'a', text: 'Porque o motor só funciona com corrente alternada' },
            { id: 'b', text: 'Porque o Arduino não tem pinos digitais' },
            { id: 'c', text: 'Porque o motor exige muito mais corrente do que o pino suporta (cerca de 20 mA, 40 mA no máximo), podendo queimá-lo' },
            { id: 'd', text: 'Porque o motor fica mais lento' }
          ],
          answer: 'c',
          explanation: 'Use transistor ou driver com alimentação externa e GND comum; o pino só envia o sinal de controle.'
        },
        {
          id: 'q6', kind: 'mcq',
          prompt: 'O sketch compila e envia sem erro, mas o LED não acende. Qual verificação faz mais sentido?',
          choices: [
            { id: 'a', text: 'Reescrever o setup() do zero' },
            { id: 'b', text: 'Trocar de computador' },
            { id: 'c', text: 'Conferir polaridade do LED, resistor, o pino usado na fiação versus o do código e o GND' },
            { id: 'd', text: 'Colocar um delay de 1 hora' }
          ],
          answer: 'c',
          explanation: 'Quando o código roda, a causa costuma ser a fiação: polaridade, pino errado, falta de GND ou componente com defeito.'
        },
        {
          id: 'q7', kind: 'mcq',
          prompt: 'O upload falha com "stk500_getsync(): not in sync". Qual destas é uma causa provável?',
          choices: [
            { id: 'a', text: 'Placa ou porta selecionada errada, cabo sem dados ou algo ligado nos pinos 0 e 1' },
            { id: 'b', text: 'O sketch tem comentários demais' },
            { id: 'c', text: 'A variável está com nome muito curto' },
            { id: 'd', text: 'O LED está ligado ao contrário' }
          ],
          answer: 'a',
          explanation: 'Esse erro é de comunicação com a placa: confira cabo, porta, placa selecionada e desconecte os fios dos pinos 0 e 1.'
        },
        {
          id: 'q8', kind: 'fill',
          prompt: 'Complete a função que imprime um valor e pula de linha no Serial Monitor:',
          code: 'Serial.___(valor);',
          accept: ['println', 'Serial.println'],
          explanation: 'Serial.println imprime o valor e pula para a próxima linha.'
        }
      ]
    }
  ]
};
