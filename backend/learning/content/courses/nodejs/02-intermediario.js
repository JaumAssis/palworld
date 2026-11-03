// Módulo "Intermediário" do curso de Node.js — parte A (lições 01 a 22): TypeScript, streams, buffers, processos,
// threads, event loop, clientes HTTP, frameworks, bancos de dados, cache, transações, autenticação e autorização,
// upload e paginação. Cada lição tem 8 questões (3 múltipla escolha + 1 lacuna, duas vezes). Ver ../../index.js
// para o formato e a validação de boot. Exemplos executáveis usam só módulos nativos (saídas coladas de execução
// real); pacotes de terceiros (Express, Fastify, Prisma etc.) são ilustrativos e marcados como tal. Nenhum dado
// pessoal real (usuários e valores fictícios), segredos sempre <placeholder>, nenhuma versão ou estatística é
// afirmada: recursos recentes aparecem como "em versões recentes" com remissão à documentação oficial. LGPD só em
// visão geral e sem substituir orientação jurídica.
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
  id: 'intermediario-node',
  levelKey: 'intermediate',
  order: 2,
  title: 'Intermediário',
  subtitle: 'TypeScript, streams, processos e threads, frameworks, SQL, NoSQL, cache, transações, autenticação, autorização, upload e paginação',
  accent: '#16a34a',
  lessons: [
    {
      id: 'nji-01-typescript-com-node',
      title: 'TypeScript com Node.js',
      goal: 'Entender o que o TypeScript acrescenta ao JavaScript, como rodá-lo no Node e por que os tipos não substituem a validação de entrada.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que TypeScript',
            'TypeScript (TS) é o JavaScript com uma camada de TIPOS por cima. Um tipo descreve a forma de um valor: "isto é um número", "isto é um objeto com id numérico e nome texto". Um programa chamado compilador (o tsc) e o seu editor conferem essas descrições ANTES de o programa rodar e avisam, por exemplo, quando você passa um texto onde a função espera um número. Em projetos grandes isso evita uma classe inteira de erros bobos e deixa o autocompletar do editor muito mais preciso. Importante: TS não é outra plataforma. O que executa no final continua sendo JavaScript, no Node.'
          ),
          sl(
            'Tipos básicos e interfaces',
            'Os tipos básicos são number, string, boolean, arrays (number[]) e o tipo union, que aceita uma de várias formas (string | null). Uma interface descreve o formato de um objeto e serve como contrato. Você escreve o tipo depois de dois-pontos, em parâmetros, retornos e variáveis. O compilador também INFERE tipos sozinho: em const n = 5 ele já sabe que n é number, então você só anota onde a inferência não basta (parâmetros de funções, por exemplo).',
            'interface Usuario {\n  id: number;\n  nome: string;\n  email?: string; // o ? torna opcional\n}\n\nfunction saudar(u: Usuario): string {\n  return `Olá, ${u.nome} (#${u.id})`;\n}\n\nsaudar({ id: 1, nome: "Ana" });   // ok\n// saudar({ id: "1" });           // erro de compilação: id deve ser number'
          ),
          sl(
            'tsconfig essencial',
            'O arquivo tsconfig.json diz ao compilador como se comportar. As opções que importam no começo: "strict": true liga o conjunto de verificações rigorosas (recomendado sempre, inclusive proíbe null e undefined escondidos); "target" escolhe a versão do JavaScript gerada; "module" escolhe o sistema de módulos (CommonJS ou ESM, que você viu no nível iniciante); "outDir" é a pasta dos arquivos .js gerados; "rootDir" é a pasta dos fontes. O comando tsc --noEmit só confere os tipos e não gera arquivos: ótimo para o CI (a verificação automática a cada alteração).',
            '{\n  "compilerOptions": {\n    "strict": true,\n    "target": "ES2022",\n    "module": "NodeNext",\n    "outDir": "dist",\n    "rootDir": "src"\n  }\n}\n\n// ilustrativo, não executado aqui (depende do pacote typescript)'
          ),
          sl(
            'Três jeitos de rodar TypeScript',
            '1) Compilar com tsc e rodar o JavaScript gerado com node dist/app.js: é o jeito padrão para produção. 2) Executores de desenvolvimento como o tsx (pacote de terceiros) rodam o .ts direto, sem etapa manual. 3) Em versões recentes o próprio Node consegue executar arquivos .ts apenas REMOVENDO os tipos (type stripping), sem conferi-los: confira na documentação oficial da sua versão quais sintaxes são suportadas e se precisa de alguma opção. Atenção: nesse modo ninguém verifica os tipos; para isso continue usando tsc --noEmit. A execução abaixo foi feita de verdade no Node 24 com o arquivo a.ts.',
            '// a.ts\ninterface Usuario { id: number; nome: string }\nfunction saudar(u: Usuario): string {\n  return `Olá, ${u.nome} (#${u.id})`;\n}\nconsole.log(saudar({ id: 1, nome: "Ana" }));\nconsole.log(typeof saudar);\n\n// $ node a.ts\n// Olá, Ana (#1)\n// function'
          ),
          sl(
            'Tipos não existem em tempo de execução',
            'Quando o TS vira JavaScript, todas as anotações de tipo e interfaces são APAGADAS. Em tempo de execução não existe Usuario, só objetos comuns. Consequência séria: escrever const u = req.body as Usuario NÃO valida nada; é só uma promessa sua ao compilador. Se o cliente enviar { "nome": 123 } o programa continua achando que é string e o erro aparece lá na frente, ou vira uma brecha. Dados que vêm de FORA (corpo de requisição, arquivo, banco, variável de ambiente) precisam de validação real, feita no código, como você aprendeu no nível iniciante, ou com bibliotecas de esquema como Zod ou Joi (por nome). Os tipos cuidam do código que VOCÊ escreve; a validação cuida do mundo externo.',
            'app.post("/usuarios", (req, res) => {\n  const u = req.body as Usuario;   // NÃO valida: só silencia o compilador\n  // correto: validar antes de confiar\n  if (typeof req.body?.nome !== "string" || req.body.nome.length > 100) {\n    return res.status(400).json({ erro: "dados inválidos" });\n  }\n  // ...\n});\n// ilustrativo, não executado aqui'
          ),
          sl(
            'Erros comuns',
            'Usar any em todo lugar: any desliga a checagem e anula o benefício; prefira unknown (que obriga a verificar o tipo antes de usar). Espalhar "as" para calar erros do compilador. Deixar strict desligado "para facilitar". Achar que o tipo protege a API contra entrada maliciosa. Esquecer que pacotes JavaScript puros precisam de tipos (pacotes @types/...) para o compilador conhecê-los. Regra prática: tipos para o seu código, validação para a fronteira com o mundo externo.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Em que momento o TypeScript verifica se você passou um texto onde uma função espera um número?', 'b', [
          'Durante a execução, quando a função recebe o valor e o Node lança uma exceção de tipo',
          'Antes de rodar, pelo compilador (tsc) e pelo editor',
          'No servidor de produção, depois do deploy, pelo runtime do Node',
          'Quando o código é minificado, porque a minificação confere todas as anotações'
        ], 'Os tipos são conferidos em tempo de desenvolvimento/compilação. Em tempo de execução eles já foram apagados; por isso o Node não lança erro de tipo por conta própria.'),
        mcq('q2', 'Um endpoint faz const u = req.body as Usuario e o cliente envia { "nome": 123 }. O que acontece em tempo de execução?', 'd', [
          'O Node lança um TypeError porque 123 não é string e o tipo Usuario exige texto',
          'O compilador converte 123 para "123" automaticamente antes de executar a rota',
          'O servidor responde 400 sozinho, pois o TypeScript valida o corpo das requisições',
          'Nada é verificado: o valor 123 passa adiante, porque o as só afeta o compilador'
        ], 'O "as" é uma afirmação para o compilador e some no JavaScript gerado. Nenhuma checagem ocorre, então a validação precisa ser escrita no código.'),
        mcq('q3', 'O que faz o comando tsc --noEmit?', 'a', [
          'Confere os tipos sem gerar arquivos JavaScript',
          'Compila o projeto e remove a pasta de saída dist ao final',
          'Executa o programa e mostra os erros de tipo no console durante o teste',
          'Gera os arquivos .js, mas sem mensagens de erro de tipo'
        ], '--noEmit significa "não emita arquivos": só valida os tipos, útil em verificações automáticas. As outras opções descrevem comportamentos que o comando não tem.'),
        fill('q4', 'Complete a opção do tsconfig.json que liga o conjunto de verificações rigorosas.', '{ "compilerOptions": { "___": true } }', ['strict'], 'A opção "strict": true ativa as verificações rigorosas e é a configuração recomendada.'),
        mcq('q5', 'Em versões recentes o Node roda arquivos .ts removendo os tipos. O que esse modo NÃO faz?', 'c', [
          'Executar o código JavaScript que sobra depois de apagar as anotações',
          'Ignorar as interfaces, que somem do código executado',
          'Verificar se os tipos estão corretos antes de executar',
          'Funcionar em um arquivo que contenha só sintaxe JavaScript comum'
        ], 'O type stripping apenas apaga os tipos; quem confere é o tsc (ou o editor). Rodar sem erros não prova que os tipos estão certos.'),
        mcq('q6', 'Por que é preferível unknown a any para dados de origem incerta?', 'b', [
          'Porque unknown é mais rápido de executar do que any no motor do Node',
          'Porque unknown obriga a verificar o tipo antes de usar o valor',
          'Porque any foi removido do TypeScript e unknown é o substituto oficial',
          'Porque unknown valida o valor automaticamente quando ele chega da rede'
        ], 'any desliga a checagem; unknown mantém a checagem e força um teste (typeof, esquema) antes do uso. Nenhum dos dois tem efeito em velocidade nem valida dados sozinho.'),
        mcq('q7', 'O que acontece com uma interface no JavaScript gerado pelo compilador?', 'a', [
          'Desaparece por completo: não há código equivalente',
          'Vira uma classe com o mesmo nome, usada para validar objetos na execução',
          'É convertida em um objeto congelado (Object.freeze) com os mesmos campos',
          'Permanece como comentário e o Node a usa para checar tipos ao carregar o arquivo'
        ], 'Interfaces e anotações existem só para o compilador. Por isso não servem para validar dados em tempo de execução.'),
        fill('q8', 'Complete o tipo do parâmetro para que a função só aceite números.', 'function dobro(n: ___) { return n * 2; }', ['number'], 'O tipo básico para números em TypeScript é number (minúsculo).')
      ]
    },
    {
      id: 'nji-02-streams-conceito',
      title: 'Streams: o conceito',
      goal: 'Entender o que são streams, os quatro tipos e por que processar dados em pedaços economiza memória.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O problema dos arquivos grandes',
            'Com fs.readFile (nível iniciante) o arquivo INTEIRO é lido para a memória antes de você receber o conteúdo. Para um arquivo pequeno é ótimo. Para um log de 2 GB, o processo pode estourar a memória ou ficar lento, e se dez usuários pedirem o mesmo download ao mesmo tempo, são dez cópias enormes na RAM. Precisamos de um jeito de processar o dado ENQUANTO ele chega, sem guardar tudo.'
          ),
          sl(
            'O que é uma stream',
            'Stream (fluxo) é uma sequência de dados entregue em pedaços pequenos ao longo do tempo. Cada pedaço se chama chunk (normalmente um Buffer, um bloco de bytes). Em vez de "me dê o arquivo", você diz "vá me entregando, pedaço por pedaço, e eu trato cada um". A memória usada fica limitada ao tamanho de um pedaço, não ao tamanho do arquivo. Pense numa torneira: você enche um copo de cada vez, não precisa de um reservatório do tamanho do rio.'
          ),
          sl(
            'Os quatro tipos',
            'Readable: de onde o dado SAI (leitura de arquivo, o corpo de uma requisição HTTP, process.stdin). Writable: para onde o dado VAI (escrita em arquivo, a resposta HTTP, process.stdout). Duplex: lê e escreve de forma independente (um socket de rede). Transform: um Duplex que modifica o dado ao passar (comprimir, criptografar, converter para maiúsculas). Na API do Node todas herdam de EventEmitter, que você já conhece, e por isso emitem eventos.'
          ),
          sl(
            'Exemplo executável: lendo em pedaços',
            'O código cria um arquivo fictício de 50 mil linhas (cerca de 770 KB), lê com createReadStream usando pedaços de 64 KB (highWaterMark, o tamanho do buffer interno) e conta os eventos data. O resultado real foi: 13 pedaços, somando exatamente o tamanho do arquivo (788889 bytes). 788889 dividido por 65536 dá pouco mais de 12, então o último pedaço é parcial: 13 eventos.',
            'const fs = require("node:fs");\nconst os = require("node:os");\nconst path = require("node:path");\nconst arq = path.join(os.tmpdir(), "demo-log.txt");\nfs.writeFileSync(arq, Array.from({ length: 50000 }, (_, i) => `evento ${i} ok`).join("\\n"));\nconst tam = fs.statSync(arq).size;\nconst stream = fs.createReadStream(arq, { highWaterMark: 64 * 1024 });\nlet pedacos = 0, bytes = 0;\nstream.on("data", (c) => { pedacos++; bytes += c.length; });\nstream.on("end", () => { console.log({ tamanho: tam, pedacos, bytes }); fs.unlinkSync(arq); });\n\n// saída real:\n// { tamanho: 788889, pedacos: 13, bytes: 788889 }'
          ),
          sl(
            'Eventos principais',
            'data: chegou um chunk. end: acabaram os dados (não vem mais nada). error: algo falhou (arquivo inexistente, conexão caída). close: o recurso foi fechado. Regra de ouro: toda stream precisa de um tratamento do evento error. Como streams são EventEmitters, um error sem ouvinte vira exceção não tratada e DERRUBA o processo. No dia a dia você vai preferir pipeline (próxima lição), que cuida disso por você.'
          ),
          sl(
            'Quando usar e erros comuns',
            'Use streams para arquivos grandes, upload e download, cópia de dados, compressão, leitura de linhas de log e qualquer volume que você não queira carregar de uma vez. Em um servidor http, req é Readable (o corpo chega em pedaços) e res é Writable. Para arquivos pequenos, readFile é mais simples e perfeitamente adequado. Erro clássico: ouvir data e empilhar todos os chunks em um array, o que traz o consumo de memória de volta ao tamanho do arquivo e anula o benefício.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um relatório de 2 GB é lido com fs.readFile em um servidor e vários usuários pedem ao mesmo tempo. Qual é o risco principal?', 'c', [
          'O disco recusa leituras simultâneas do mesmo arquivo e devolve erros de permissão',
          'O arquivo chega fora de ordem, porque readFile não garante a sequência dos bytes',
          'Cada leitura carrega o arquivo inteiro na memória, podendo esgotá-la',
          'O Node limita as leituras a 64 KB e corta o restante do conteúdo do arquivo'
        ], 'readFile guarda o conteúdo completo na RAM. Com arquivos grandes e várias leituras simultâneas a memória acaba. A ordem dos bytes é garantida e não há corte em 64 KB.'),
        mcq('q2', 'O que é um chunk em uma stream?', 'a', [
          'Um pedaço de dados (em geral um Buffer) entregue por vez',
          'Um arquivo temporário criado em disco para guardar o conteúdo completo',
          'Um evento especial que sinaliza o fim da leitura e fecha o recurso',
          'Uma cópia criptografada do dado enviada em paralelo para o servidor'
        ], 'Chunk é cada fragmento entregue pela stream. Ele não é um arquivo nem um evento: é o próprio dado em pedaço.'),
        mcq('q3', 'Qual tipo de stream recebe dados, os modifica (por exemplo, comprimindo) e os repassa adiante?', 'd', [
          'Readable, porque ela produz os dados que seguirão para o destino final',
          'Writable, porque ela recebe o dado e decide o que será gravado',
          'Duplex, porque lê e escreve, embora sem relação entre o que entra e o que sai',
          'Transform'
        ], 'Transform é um Duplex em que a saída é calculada a partir da entrada. Duplex comum lê e escreve de forma independente (como um socket).'),
        fill('q4', 'Complete o nome do evento disparado a cada chunk recebido.', 'fs.createReadStream(arq).on("___", (pedaco) => { /* trata o pedaço */ });', ['data'], 'O evento data entrega cada chunk. end indica o fim, error indica falha.'),
        mcq('q5', 'No servidor http do Node, o que são req e res em termos de streams?', 'b', [
          'req é Writable e res é Readable, porque o servidor escreve a requisição e lê a resposta',
          'req é Readable (corpo chega em pedaços) e res é Writable',
          'Ambos são Transform, pois o servidor modifica a requisição para gerar a resposta',
          'Ambos são objetos comuns, com os dados já carregados na memória, e não streams'
        ], 'O servidor LÊ o corpo da requisição (Readable) e ESCREVE a resposta (Writable). Por isso é possível enviar arquivos grandes como stream em res.'),
        mcq('q6', 'Um arquivo de 200 KB (204800 bytes) é lido com pedaços de 64 KB (65536 bytes). Quantos eventos data são esperados?', 'a', [
          '4, sendo o último pedaço parcial',
          '3, porque o resto menor que 64 KB é descartado',
          '1, porque 200 KB cabe em um único pedaço quando o arquivo é pequeno',
          '200, um para cada kilobyte do arquivo, independentemente do tamanho do pedaço'
        ], '204800 / 65536 = 3,125: três pedaços cheios mais um parcial, totalizando 4. Nada é descartado e o tamanho do pedaço é que define a contagem.'),
        mcq('q7', 'O que acontece se uma stream emitir error e ninguém tiver registrado um ouvinte para esse evento?', 'd', [
          'O erro é ignorado silenciosamente e a stream segue entregando os dados',
          'O Node tenta reabrir o recurso automaticamente até conseguir ler de novo',
          'A stream pausa e aguarda até que um ouvinte seja registrado em algum momento',
          'A exceção fica sem tratamento e o processo é encerrado'
        ], 'Streams são EventEmitters: um evento error sem ouvinte vira exceção não tratada e derruba o processo. Por isso sempre trate o erro ou use pipeline.'),
        fill('q8', 'Complete a função que lê um arquivo grande como stream, sem carregá-lo inteiro na memória.', 'const leitura = fs.___(caminho);', ['createReadStream'], 'fs.createReadStream devolve uma stream Readable que entrega o arquivo em pedaços.')
      ]
    },
    {
      id: 'nji-03-streams-na-pratica',
      title: 'Streams na prática: pipe, pipeline e backpressure',
      goal: 'Encadear streams com segurança, entender backpressure, criar uma Transform própria e tratar erros e destruição.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'pipe e o problema do tratamento de erros',
            'O método readable.pipe(writable) liga a saída de uma stream à entrada de outra, e o Node move os dados sozinho. Funciona, mas tem uma armadilha: se uma das streams da cadeia falhar, as outras NÃO são fechadas automaticamente, o que vaza descritores de arquivo e deixa conexões abertas. Além disso o erro de cada stream precisa ser tratado separadamente. Em código novo evite pipe solto e use pipeline.'
          ),
          sl(
            'pipeline: o jeito recomendado',
            'stream.pipeline (na versão com promises, em node:stream/promises) encadeia várias streams, propaga o erro de qualquer uma delas, DESTRÓI todas ao final (com sucesso ou falha) e devolve uma promise que você aguarda com await. Dentro de um try/catch você trata tudo num lugar só. Uma Transform própria é só um objeto com a função transform(chunk, encoding, callback), em que o callback recebe (erro, dadoDeSaída). O exemplo foi executado de verdade e a saída real aparece abaixo do código.',
            'const { Readable, Transform, Writable } = require("node:stream");\nconst { pipeline } = require("node:stream/promises");\nconst maiusculas = new Transform({\n  transform(chunk, enc, cb) { cb(null, chunk.toString().toUpperCase()); }\n});\nconst saida = [];\nconst coletor = new Writable({\n  write(chunk, enc, cb) { saida.push(chunk.toString()); cb(); }\n});\nawait pipeline(Readable.from(["ola ", "mundo ", "node"]), maiusculas, coletor);\nconsole.log(saida);\n\n// saída real:\n// [ \'OLA \', \'MUNDO \', \'NODE\' ]'
          ),
          sl(
            'Backpressure: não deixe o rápido afogar o lento',
            'Backpressure (contrapressão) é o mecanismo pelo qual um destino lento avisa a origem rápida para esperar. Exemplo: ler do disco é rápido, mas enviar por uma conexão lenta de celular não é; sem controle, os chunks se acumulam na memória. Cada Writable tem um buffer interno: quando ele enche, write() devolve false, e a origem deve pausar até o evento drain (o buffer esvaziou). pipe e pipeline já fazem isso por você; quem escreve write() manualmente em laço sem olhar o retorno perde a proteção e pode estourar a memória.'
          ),
          sl(
            'Streams com async iterators',
            'Toda Readable pode ser percorrida com for await...of, que entrega um chunk por iteração e já respeita o backpressure (o laço só pede o próximo quando você termina o corpo). Código mais simples que ouvir eventos. Se o laço lançar um erro ou for interrompido por break, a stream é destruída. Exemplo executado de verdade:',
            'for await (const parte of Readable.from(["a", "b", "c"])) {\n  console.log("parte", parte);\n}\n// saída real:\n// parte a\n// parte b\n// parte c'
          ),
          sl(
            'Erros e destruição',
            'Quando algo dá errado, a stream deve ser destruída (stream.destroy(erro)) para liberar o recurso: fechar o arquivo, encerrar o socket. pipeline faz isso em todas as streams da cadeia. No teste real, uma Transform que chama cb(new Error("falhou na transformação")) fez o await pipeline lançar o erro, e o catch imprimiu: erro capturado: falhou na transformação. Erros comuns: usar pipe sem tratar erro, esquecer de chamar o callback da Transform (a cadeia trava para sempre) e juntar chunks em um array gigante.',
            'try {\n  await pipeline(origem, transformacao, destino);\n} catch (e) {\n  console.log("erro capturado:", e.message); // todas as streams já foram destruídas\n}'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a principal vantagem de pipeline sobre encadear com pipe?', 'd', [
          'pipeline é a única forma de ligar duas streams, pois pipe foi removido do Node',
          'pipeline comprime os dados automaticamente, reduzindo o uso de rede e disco',
          'pipeline dispensa o uso de streams Writable no final da cadeia de dados',
          'Propaga erros de qualquer etapa e destrói todas as streams da cadeia'
        ], 'pipe não fecha as outras streams quando uma falha, deixando recursos abertos. pipeline propaga o erro e limpa tudo. pipe ainda existe e pipeline não comprime nada.'),
        mcq('q2', 'O que significa backpressure?', 'b', [
          'Uma falha em que o servidor recusa novas conexões porque a CPU está saturada',
          'O destino lento sinalizar à origem rápida que espere, evitando acúmulo de dados na memória',
          'Um modo de compressão que reduz o tamanho dos chunks antes de enviá-los pela rede, sem necessidade de nenhuma configuração adicional',
          'A prioridade que o Node dá a streams de escrita sobre as de leitura no event loop'
        ], 'Backpressure é o controle de fluxo: o consumidor lento segura o produtor rápido. Não é compressão, nem recusa de conexões, nem prioridade do event loop.'),
        mcq('q3', 'Quando write() de uma Writable devolve false, o que a origem deve fazer?', 'c', [
          'Descartar o chunk atual e seguir escrevendo os próximos para manter a velocidade',
          'Fechar a stream imediatamente, pois false indica falha irrecuperável na escrita',
          'Pausar e esperar o evento drain antes de escrever mais',
          'Chamar write() novamente em laço até que passe a devolver true de novo'
        ], 'false significa que o buffer interno encheu. A origem espera o evento drain. Insistir em laço ou descartar dados ignora o mecanismo de proteção.'),
        fill('q4', 'Complete a palavra-chave que percorre uma stream Readable chunk a chunk com async iterator.', 'for ___ (const parte of leitura) { processa(parte); }', ['await'], 'for await...of consome a stream respeitando o backpressure.'),
        mcq('q5', 'Uma Transform própria nunca chama o callback dentro de transform(). O que se espera que aconteça?', 'a', [
          'A cadeia trava: o chunk não é concluído e a stream não segue adiante',
          'O Node chama o callback automaticamente após alguns segundos de espera',
          'A stream passa a funcionar como Readable e ignora o restante da cadeia',
          'O chunk é repassado sem modificação e o processamento continua normalmente'
        ], 'O callback sinaliza que o chunk foi tratado. Sem ele a Transform não avança e a cadeia fica parada indefinidamente.'),
        mcq('q6', 'Em um código com await pipeline(a, b, c) dentro de try/catch, a transformação b falha. O que é correto afirmar?', 'd', [
          'O catch dispara depois de a stream c terminar de gravar os dados pendentes',
          'O catch não dispara, porque erros de streams vão para eventos error e a promise fica pendente',
          'Só a stream b é destruída; a e c continuam ativas até o fim do processo',
          'A promise rejeita, o catch recebe o erro e as streams da cadeia são destruídas'
        ], 'pipeline propaga o erro como rejeição da promise e destrói todas as streams, liberando recursos.'),
        mcq('q7', 'Um serviço lê do disco muito rápido e envia a clientes em conexões lentas, escrevendo com write() em laço sem olhar o retorno. Qual a consequência provável?', 'b', [
          'Os clientes lentos recebem os dados fora de ordem por causa do excesso de pacotes',
          'A memória cresce, pois os chunks se acumulam no buffer das streams de escrita',
          'O Node reduz a velocidade do disco sozinho, tornando o problema inexistente',
          'As conexões são encerradas pelo sistema operacional assim que o primeiro chunk é enviado'
        ], 'Sem respeitar o false de write(), o buffer interno cresce sem limite. Usar pipeline ou pipe resolveria, porque eles aplicam o backpressure.'),
        fill('q8', 'Complete com o método que destrói uma stream, liberando o recurso (arquivo, socket) associado.', 'stream.___(new Error("cancelado"));', ['destroy'], 'stream.destroy(erro) encerra a stream e libera os recursos; pipeline chama isso por você em caso de falha.')
      ]
    },
    {
      id: 'nji-04-buffers-e-encoding',
      title: 'Buffers e encoding',
      goal: 'Entender bytes x strings, usar Buffer com utf8, hex e base64 e lembrar que base64 não é criptografia.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Bytes e strings não são a mesma coisa',
            'Computadores guardam e transmitem BYTES (números de 0 a 255). Uma string é texto; para virar bytes ela precisa de um encoding, uma regra de conversão. O mais usado é o UTF-8, que representa letras com 1 a 4 bytes: "a" ocupa 1 byte, mas "á" ocupa 2. Por isso o tamanho em caracteres e o tamanho em bytes podem diferir. Arquivos, redes e streams trabalham com bytes; o seu código costuma trabalhar com texto. O Buffer é a ponte.'
          ),
          sl(
            'Buffer',
            'Buffer é a classe do Node que representa um bloco de bytes de tamanho fixo. Criar: Buffer.from("texto", "utf8") converte texto em bytes; Buffer.alloc(n) cria n bytes zerados (use sempre alloc ou from, nunca as formas antigas sem zerar memória). Converter de volta: buf.toString("utf8"). buf.length conta BYTES. Os chunks de uma stream são Buffers. Exemplo executado de verdade:',
            'const b = Buffer.from("Olá, Node!", "utf8");\nconsole.log(b, b.length, "Olá, Node!".length);\n// <Buffer 4f 6c c3 a1 2c 20 4e 6f 64 65 21> 11 10\n// 11 bytes, mas 10 caracteres: o "á" usa 2 bytes (c3 a1)'
          ),
          sl(
            'hex e base64',
            'Os mesmos bytes podem ser mostrados como texto de várias formas. hex escreve cada byte com dois dígitos hexadecimais (útil para depurar e para hashes). base64 usa 64 caracteres seguros para texto e serve para embutir bytes em JSON, e-mail ou URLs (existe a variante base64url, sem + e /). Saídas reais:',
            'console.log(b.toString("hex"));\n// 4f6cc3a12c204e6f646521\nconsole.log(b.toString("base64"));\n// T2zDoSwgTm9kZSE=\nconsole.log(Buffer.from("T2zDoSwgTm9kZSE=", "base64").toString("utf8"));\n// Olá, Node!'
          ),
          sl(
            'base64 NÃO é criptografia',
            'Base64 é só uma troca de representação: qualquer pessoa decodifica em um comando, sem chave nenhuma. Erro grave e frequente: "guardar a senha em base64" ou "esconder o token em base64". Isso não protege nada. Para esconder dados use criptografia de verdade (com chave), e para senhas use hash lento com salt (scrypt, argon2, bcrypt), como você viu no nível iniciante. Regra: encoding muda a forma, criptografia protege o conteúdo, hash verifica sem permitir recuperar o original.'
          ),
          sl(
            'Uint8Array e manipulação binária',
            'Buffer é uma subclasse de Uint8Array, o array tipado padrão do JavaScript para bytes; por isso b[0] devolve o número do primeiro byte (79 para "O") e funciona com APIs web que esperam Uint8Array. Há métodos para ler e escrever números em formato binário, por exemplo writeUInt16BE (inteiro de 16 bits, "big-endian": byte mais significativo primeiro), usados em protocolos e formatos de arquivo. Buffer.concat junta vários buffers. Saídas reais:',
            'console.log(b instanceof Uint8Array, b[0]);   // true 79\nconst h = Buffer.alloc(4);\nh.writeUInt16BE(513, 0);\nh.writeUInt16BE(7, 2);\nconsole.log(h, h.readUInt16BE(0), h.readUInt16BE(2));\n// <Buffer 02 01 00 07> 513 7\nconsole.log(Buffer.concat([Buffer.from("ab"), Buffer.from("cd")]).toString()); // abcd'
          ),
          sl(
            'Erros comuns',
            'Contar caracteres com length de Buffer (conta bytes). Concatenar chunks com + em vez de Buffer.concat: um caractere de vários bytes pode ser cortado entre dois chunks e vira lixo. Assumir que o texto é UTF-8 sem verificar. E o mais perigoso: tratar base64 como proteção. Se precisar manter dados sensíveis em trânsito ou em repouso, use TLS e criptografia, e minimize o que guarda (LGPD: colete e guarde só o necessário).'
          )
        ]
      },
      questions: [
        mcq('q1', 'A string "Olá" tem 3 caracteres. Quantos bytes tem Buffer.from("Olá", "utf8")?', 'a', [
          '4, pois a letra á ocupa 2 bytes em UTF-8',
          '3, porque cada caractere ocupa exatamente 1 byte em qualquer texto',
          '6, porque o UTF-8 reserva 2 bytes para cada letra',
          '2, pois o acento é descartado na conversão para bytes'
        ], 'Em UTF-8, "O" e "l" usam 1 byte cada e "á" usa 2: total 4. Por isso length de Buffer (bytes) pode diferir do length da string.'),
        mcq('q2', 'Um colega propõe guardar senhas de usuários em base64 "para ficarem protegidas". Qual a melhor resposta?', 'c', [
          'Aceitável se a coluna do banco for restrita a administradores de sistema',
          'Seguro, porque base64 usa uma chave interna do Node que impede a leitura direta',
          'Inadequado: base64 é reversível por qualquer pessoa; o correto é hash lento com salt',
          'Seguro, desde que a string seja convertida para hex logo em seguida, dobrando a proteção'
        ], 'Base64 e hex são apenas representações reversíveis e sem chave. Senhas exigem hash lento com salt (scrypt, argon2, bcrypt).'),
        mcq('q3', 'Qual afirmação sobre Buffer é verdadeira?', 'b', [
          'É um tipo exclusivo do Node que não tem relação com os arrays tipados do JavaScript',
          'É um Uint8Array: buf[0] devolve o número do primeiro byte',
          'Cresce automaticamente conforme você escreve novos dados nele ao longo do tempo',
          'Guarda texto em UTF-8 e rejeita outros tipos de conteúdo binário'
        ], 'Buffer estende Uint8Array, então indexar devolve bytes (números de 0 a 255). O tamanho é fixo e ele guarda qualquer binário.'),
        fill('q4', 'Complete o encoding que representa cada byte com dois dígitos hexadecimais.', 'const texto = buf.toString("___");', ['hex'], 'O encoding hex escreve cada byte com dois dígitos hexadecimais.'),
        mcq('q5', 'Para que serve o base64 em uma API que precisa enviar uma imagem pequena dentro de um JSON?', 'd', [
          'Para comprimir a imagem e reduzir seu tamanho em relação aos bytes originais',
          'Para impedir que terceiros vejam o conteúdo da imagem durante a transmissão',
          'Para validar que a imagem não contém código malicioso embutido nos bytes',
          'Para representar bytes binários como texto seguro, que cabe em um campo JSON'
        ], 'Base64 transforma bytes em caracteres de texto, permitindo embuti-los em JSON, mas aumenta o tamanho em cerca de um terço e não protege nem valida nada.'),
        mcq('q6', 'Por que concatenar chunks de texto com + pode corromper caracteres, e o que fazer?', 'a', [
          'Um caractere multibyte pode ser dividido entre dois chunks; use Buffer.concat e converta no final',
          'O operador + converte cada chunk para base64 e embaralha os bytes originais',
          'O operador + só funciona com números e lança erro ao receber qualquer chunk',
          'Chunks terminam no limite de um caractere; o problema é restrito ao Windows'
        ], 'Um caractere de 2 a 4 bytes pode ficar partido na fronteira entre chunks. Junte os Buffers e só então converta para texto.'),
        mcq('q7', 'Qual afirmação sobre writeUInt16BE(513, 0) em um Buffer de 4 bytes está correta?', 'd', [
          'Grava o texto "513" em UTF-8 usando 3 bytes a partir da posição zero',
          'Grava 513 em 4 bytes, ocupando o buffer inteiro com zeros à direita',
          'Grava o byte menos significativo primeiro, resultando em 01 02 no início, o que costuma ser suficiente para a maioria das aplicações',
          'Grava o inteiro 513 em 2 bytes (02 01), com o byte mais significativo primeiro'
        ], '513 = 0x0201. Em big-endian o byte mais significativo (02) vem primeiro, como mostrou a saída real: 02 01. São 2 bytes, não texto.'),
        fill('q8', 'Complete o método que junta uma lista de Buffers em um só.', 'const inteiro = Buffer.___([parte1, parte2]);', ['concat'], 'Buffer.concat une vários buffers em um novo buffer, sem os problemas de concatenar texto parcial.')
      ]
    },
    {
      id: 'nji-05-child-process-e-spawn',
      title: 'Processos filhos: spawn, exec, execFile e fork',
      goal: 'Executar programas externos com segurança, evitar injeção de comando e comunicar processos por IPC.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Para que rodar outro processo',
            'Às vezes o Node precisa chamar um programa externo (um conversor de vídeo, o git, um script) ou executar outro programa Node em paralelo. O módulo node:child_process cria PROCESSOS FILHOS: programas independentes, com memória própria, iniciados pelo seu. Vale lembrar a diferença: processo é um programa em execução com memória isolada; thread é uma linha de execução que divide a memória do seu processo (veremos na próxima lição).'
          ),
          sl(
            'As quatro funções',
            'spawn(comando, [argumentos]): inicia o programa e entrega stdout e stderr como STREAMS, ideal para saídas grandes ou longas. exec(comandoTexto): roda o texto em um SHELL (o interpretador de linha de comando) e devolve a saída inteira em um callback; perigoso com entrada do usuário. execFile(arquivo, [argumentos]): como spawn, mas com callback e saída completa em buffer, sem passar por shell. fork(arquivoJs): inicia outro programa Node já com um canal de mensagens (IPC) entre pai e filho. Saída real do execFile e do spawn:',
            'execFile(process.execPath, ["-e", "console.log(1+1)"], (err, out) => { console.log(out.trim()); });\n// 2\n\nconst f = spawn(process.execPath, ["-e", "console.log(\\"linha1\\"); console.log(\\"linha2\\")"]);\nlet dados = "";\nf.stdout.on("data", (d) => (dados += d));\nf.on("close", (codigo) => console.log(JSON.stringify(dados), "codigo", codigo));\n// "linha1\\nlinha2\\n" codigo 0'
          ),
          sl(
            'Injeção de comando com exec',
            'Se você monta o comando juntando texto do usuário, o shell interpreta caracteres especiais como ; & | e executa comandos extras. Isso é injeção de comando (veja o curso de Segurança Web/OWASP). Contraexemplo vulnerável: exec(`convert ${nomeDoArquivo} saida.png`) — se nomeDoArquivo vier com um ; e outro comando, o shell roda os dois. Correção: NÃO use shell. Passe o programa e os argumentos separados em execFile ou spawn; cada argumento vira UM item e nunca é interpretado como comando.',
            '// VULNERÁVEL: o texto vira comando de shell\nexec(`convert ${entrada} saida.png`);\n\n// CORRIGIDO: sem shell, entrada é só um argumento\nexecFile("convert", [entrada, "saida.png"], (err, out) => { /* ... */ });\n\n// Teste real: entrada = "a.txt; echo INJETADO" chegou intacta como UM argumento:\n// recebi: a.txt; echo INJETADO'
          ),
          sl(
            'Mais cuidados',
            'Valide a entrada ANTES (lista de valores permitidos, padrão restrito para nomes de arquivo) mesmo usando execFile: o programa chamado pode interpretar certos argumentos (um argumento começando com - pode virar uma opção; use -- para encerrar as opções quando o programa suportar). Nunca passe shell: true em spawn com entrada externa. Trate o evento error (programa inexistente: código ENOENT) e o código de saída (0 = sucesso). Defina timeout e limite de saída (maxBuffer) em exec/execFile. Rode com o menor privilégio possível. Teste real do erro: spawn("comando-que-nao-existe") emitiu error com código ENOENT.'
          ),
          sl(
            'fork e IPC',
            'IPC (comunicação entre processos) permite que pai e filho troquem mensagens. Com fork, o pai usa filho.send(objeto) e escuta filho.on("message"); o filho usa process.send(objeto) e process.on("message"). As mensagens são objetos serializados. Exemplo real: o pai pediu somar 2 e 3, o filho respondeu { resultado: 5 }, o pai mandou sair e o filho encerrou com código 0.',
            '// pai.js\nconst filho = fork(__dirname + "/filho.js");\nfilho.on("message", (m) => { console.log("pai recebeu:", m); filho.send({ cmd: "sair" }); });\nfilho.send({ cmd: "somar", a: 2, b: 3 });\n\n// filho.js\nprocess.on("message", (m) => {\n  if (m.cmd === "somar") process.send({ resultado: m.a + m.b });\n  if (m.cmd === "sair") process.exit(0);\n});\n\n// saída real:\n// pai recebeu: { resultado: 5 }'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual função devolve a saída do programa como streams (stdout e stderr), adequada para saídas grandes?', 'b', [
          'exec, porque entrega a saída completa em uma única string no callback',
          'spawn',
          'execFile, porque transmite a saída em stream e não limita o tamanho dela',
          'fork, porque só inicia programas escritos em JavaScript e usa IPC em vez de saída'
        ], 'spawn expõe stdout/stderr como streams. exec e execFile acumulam a saída em memória (com limite maxBuffer) e fork é voltado a outro programa Node com IPC.'),
        mcq('q2', 'Por que exec(`convert ${entrada} saida.png`) é perigoso quando entrada vem do usuário?', 'a', [
          'O shell interpreta ; & | e outros caracteres, podendo executar comandos extras',
          'O exec limita o nome do arquivo a 8 caracteres e trunca o restante da entrada',
          'O exec abre uma conexão de rede para registrar o comando em um servidor externo',
          'O exec só funciona com programas do Node, então o convert falharia de imediato'
        ], 'exec passa o texto inteiro a um shell, que interpreta metacaracteres. É a injeção de comando. Nenhum dos outros comportamentos existe.'),
        mcq('q3', 'Qual é a correção principal para a injeção de comando nesse cenário?', 'd', [
          'Trocar aspas simples por duplas no texto do comando antes de enviá-lo ao exec',
          'Converter a entrada para base64 antes de montar a linha de comando',
          'Aumentar o timeout do exec para que comandos suspeitos sejam interrompidos',
          'Usar execFile ou spawn com os argumentos em lista, sem shell, e validar a entrada'
        ], 'Sem shell, o argumento não é interpretado como comando. Trocar aspas ou usar base64 não elimina a interpretação do shell; o timeout só limita a duração.'),
        fill('q4', 'Complete o nome da função que inicia outro programa Node já com canal de mensagens (IPC) entre pai e filho.', 'const filho = ___(__dirname + "/filho.js");', ['fork'], 'fork cria um processo Node filho com canal IPC (send e evento message).'),
        mcq('q5', 'O filho executou, mas o evento close trouxe código de saída 1. Como interpretar?', 'c', [
          'Sucesso: 1 significa que um processo foi concluído sem erros',
          'O processo ainda está em execução e o código indica quantas tarefas restam',
          'O programa terminou com falha; o código 0 é o que indica sucesso',
          'O Node reiniciou o filho uma vez e esse é o número de tentativas feitas'
        ], 'Por convenção 0 é sucesso e qualquer outro valor indica falha. O código só aparece quando o processo termina.'),
        mcq('q6', 'Ao usar execFile com um nome de arquivo vindo do usuário, qual cuidado adicional continua importante?', 'b', [
          'Não há o que validar: execFile elimina qualquer risco, inclusive o de argumentos tratados como opções',
          'Validar a entrada, pois o programa pode tratar um argumento iniciado por - como opção',
          'Ativar shell: true para que o sistema escape automaticamente os caracteres especiais',
          'Converter o argumento para maiúsculas, pois programas externos ignoram minúsculas'
        ], 'Sem shell não há injeção de comando, mas o próprio programa pode interpretar opções. Valide a entrada (lista permitida) e use -- quando suportado. shell: true reintroduz o risco.'),
        mcq('q7', 'Qual a principal diferença entre um processo filho e uma thread?', 'a', [
          'O processo filho tem memória isolada; threads dividem a memória do processo',
          'O processo filho roda na mesma CPU do pai; threads usam várias CPUs',
          'Threads exigem um shell para iniciar; o processo filho é criado diretamente',
          'Não há diferença prática: ambos compartilham as mesmas variáveis em memória'
        ], 'Processos têm memória própria e se comunicam por IPC; threads de um mesmo processo compartilham memória.'),
        fill('q8', 'Complete o método que o filho usa para enviar uma mensagem ao pai por IPC.', 'process.___({ resultado: 5 });', ['send'], 'process.send(objeto) no filho dispara o evento message no pai.')
      ]
    },
    {
      id: 'nji-06-worker-threads-e-cluster',
      title: 'worker_threads e cluster',
      goal: 'Distinguir tarefas CPU-bound e I/O-bound e escolher entre worker_threads, cluster e processos.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'CPU-bound x I/O-bound',
            'No Node o seu código JavaScript roda em UMA thread principal (você viu o event loop no nível iniciante). Isso é ótimo para tarefas I/O-bound: que passam a maior parte do tempo ESPERANDO (banco, rede, disco), porque enquanto uma espera o loop atende outras. Mas é um problema para tarefas CPU-bound: que consomem processador de forma intensa (calcular hash em massa, comprimir, processar imagem, laços gigantes). Enquanto uma delas roda, o loop fica travado e NENHUMA outra requisição é atendida. A solução é tirar a conta pesada da thread principal.'
          ),
          sl(
            'worker_threads',
            'O módulo node:worker_threads cria threads adicionais dentro do mesmo processo, cada uma com seu próprio event loop e memória de JavaScript. A thread principal e o worker conversam por mensagens: postMessage envia e o evento message recebe; os dados são copiados (ou transferidos), não compartilhados por padrão. workerData entrega o dado inicial. Use para cálculo pesado sem travar o servidor. Exemplo executado de verdade (fibonacci recursivo de 30 no worker):',
            'const { Worker, isMainThread, parentPort, workerData } = require("node:worker_threads");\nif (isMainThread) {\n  const w = new Worker(__filename, { workerData: { n: 30 } });\n  w.on("message", (m) => console.log("resultado do worker:", m));\n  w.on("exit", (c) => console.log("worker saiu", c));\n  console.log("thread principal livre");\n} else {\n  const fib = (n) => (n < 2 ? n : fib(n - 1) + fib(n - 2));\n  parentPort.postMessage(fib(workerData.n));\n}\n// saída real:\n// thread principal livre\n// resultado do worker: 832040\n// worker saiu 0'
          ),
          sl(
            'cluster: vários processos',
            'Um processo Node usa, no JavaScript, um núcleo de CPU. Para aproveitar todos os núcleos servindo requisições, o módulo node:cluster inicia VÁRIOS processos Node (workers de cluster) que compartilham a MESMA porta de rede; o sistema distribui as conexões entre eles. O processo primário só gerencia e reinicia os que caírem. Cada processo tem memória separada: dados na memória de um não aparecem no outro (sessões e cache precisam ficar em um serviço externo como o Redis, assunto de lição futura). Exemplo ilustrativo, não executado aqui: if (cluster.isPrimary) { for (let i = 0; i < nCpus; i++) cluster.fork(); } else { servidor.listen(3000); }.'
          ),
          sl(
            'Quando usar cada um',
            'I/O-bound (a maioria das APIs): thread principal basta; escale com mais instâncias/processos. CPU-bound pontual dentro de uma requisição: worker_threads (ou um pool de workers reaproveitados, pois criar worker custa). Aproveitar vários núcleos para servir HTTP: cluster, ou, em produção moderna, vários containers/instâncias atrás de um balanceador (veja o curso de Containers/Docker). Programa externo não escrito em Node: child_process. Dica: antes de otimizar, MEÇA; muitas vezes o gargalo é uma consulta lenta ao banco, e threads não ajudam nisso.'
          ),
          sl(
            'Erros comuns',
            'Usar worker_threads para tarefas de I/O (não ajuda: o Node já faz I/O sem bloquear). Criar um worker novo a cada requisição (caro). Esperar que variáveis sejam compartilhadas: por padrão não são, a comunicação é por mensagem. Esquecer de tratar os eventos error e exit do worker. Guardar estado na memória de um processo de cluster e esperar vê-lo em outro. Processar dado pesado de usuário sem limites: valide o tamanho da entrada antes de calcular.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual das tarefas a seguir é CPU-bound?', 'c', [
          'Consultar uma lista de pedidos em um banco de dados remoto',
          'Baixar um arquivo de outro servidor por HTTP e gravá-lo em disco',
          'Calcular o hash de milhares de arquivos grandes em um laço contínuo',
          'Aguardar uma resposta de uma API externa que demora alguns segundos'
        ], 'CPU-bound consome processador. As demais passam o tempo esperando rede ou disco (I/O-bound), situação em que o event loop atende outras requisições.'),
        mcq('q2', 'Uma rota executa um cálculo pesado de 5 segundos na thread principal. O que acontece com as outras requisições nesse período?', 'a', [
          'Ficam sem atendimento, pois o event loop está ocupado com o cálculo',
          'São atendidas normalmente, porque o Node cria uma thread nova para cada requisição',
          'São redirecionadas para um segundo processo criado automaticamente pelo Node',
          'Recebem erro 500 imediatamente, pois o Node recusa conexões enquanto há cálculo em andamento'
        ], 'JavaScript roda em uma thread; código síncrono pesado bloqueia o loop e as demais requisições esperam.'),
        mcq('q3', 'Como a thread principal e um worker trocam informações em worker_threads?', 'd', [
          'Lendo e escrevendo as mesmas variáveis globais, já que dividem a memória do JavaScript',
          'Por arquivos temporários, que o Node cria e apaga automaticamente a cada execução',
          'Por variáveis de ambiente, atualizadas dinamicamente em ambos os lados',
          'Por mensagens: postMessage envia e o evento message recebe'
        ], 'Cada worker tem memória de JavaScript própria; a comunicação padrão é por mensagens copiadas (ou transferidas).'),
        fill('q4', 'Complete o método do worker que envia o resultado de volta à thread principal.', 'parentPort.___(resultado);', ['postMessage'], 'parentPort.postMessage(valor) envia a mensagem que a thread principal recebe no evento message.'),
        mcq('q5', 'Qual o objetivo do módulo cluster?', 'b', [
          'Executar cálculos pesados em threads, compartilhando variáveis com a thread principal',
          'Iniciar vários processos Node que compartilham a mesma porta para usar vários núcleos',
          'Replicar automaticamente o banco de dados entre servidores diferentes da empresa',
          'Dividir um arquivo grande em pedaços e processá-los em streams paralelas'
        ], 'cluster cria processos separados que atendem à mesma porta. Threads são do worker_threads e as streams cuidam de pedaços de dados.'),
        mcq('q6', 'Uma API com cluster guarda a sessão do usuário em uma variável na memória. Qual problema aparece?', 'c', [
          'O cluster não permite guardar variáveis; o programa falha ao iniciar os processos',
          'A memória é compartilhada, então os usuários passam a ver a sessão uns dos outros, e isso dispensa qualquer verificação posterior no código',
          'Cada processo tem memória própria; a requisição seguinte pode cair em outro processo e perder a sessão',
          'O Node apaga a variável de sessão dos demais processos quando o primeiro reinicia'
        ], 'Processos de cluster não compartilham memória. Estado de sessão deve ficar em armazenamento externo (Redis, banco).'),
        mcq('q7', 'Uma API só consulta um banco e responde JSON, e está lenta. Qual a abordagem mais sensata?', 'a', [
          'Medir onde está o tempo (provavelmente consulta ou rede) antes de pensar em threads',
          'Mover todas as rotas para worker_threads, pois threads aceleram qualquer operação',
          'Substituir o Node por um programa escrito em outra linguagem sem investigar a causa',
          'Criar um novo worker a cada requisição para isolar cada consulta ao banco'
        ], 'Tarefa de I/O não ganha com threads; é preciso medir e provavelmente otimizar a consulta. Criar um worker por requisição ainda seria caro.'),
        fill('q8', 'Complete com a propriedade de worker_threads que é true na thread principal e false no worker.', 'if (___) { /* código da thread principal */ }', ['isMainThread'], 'isMainThread permite que o mesmo arquivo contenha o código da thread principal e o do worker.')
      ]
    },
    {
      id: 'nji-07-event-loop-aprofundado',
      title: 'Event loop aprofundado',
      goal: 'Conhecer as fases do loop, a ordem entre nextTick, promises, timers e setImmediate e o papel do threadpool do libuv.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Revisão e por que aprofundar',
            'No nível iniciante você viu que o JavaScript do Node roda em uma thread e que o event loop (laço de eventos) decide qual callback executa a seguir. Entender a ordem exata evita bugs sutis ("por que meu log saiu antes?") e explica por que um código lento trava o servidor inteiro. O event loop é implementado pela biblioteca libuv, que também cuida de arquivos, rede e timers por baixo do Node.'
          ),
          sl(
            'As fases do loop',
            'Em cada volta o loop passa por fases, cada uma com a sua fila de callbacks. timers: executa os callbacks de setTimeout e setInterval cujo tempo venceu. pending callbacks: alguns callbacks de sistema adiados. poll: recebe eventos de I/O (um arquivo terminou de ler, chegou uma requisição) e executa seus callbacks; se não há nada a fazer pode ESPERAR aqui. check: executa os callbacks de setImmediate, logo depois do poll. close callbacks: eventos de fechamento (socket fechado). ENTRE cada callback, o Node esvazia primeiro a fila de process.nextTick e depois a fila de microtarefas (callbacks de promises e queueMicrotask).'
          ),
          sl(
            'A ordem na prática (execução real)',
            'O código mistura os cinco mecanismos. Primeiro roda todo o código síncrono da pilha; ao terminar, o Node esvazia nextTick, depois as microtarefas (promises); só então o loop segue para as fases, começando por timers e passando por check. Saída real no Node 24:',
            'console.log("1 sincrono");\nsetTimeout(() => console.log("6 setTimeout 0"), 0);\nsetImmediate(() => console.log("7 setImmediate"));\nPromise.resolve().then(() => console.log("4 promise"));\nprocess.nextTick(() => console.log("3 nextTick"));\nqueueMicrotask(() => console.log("5 microtask"));\nconsole.log("2 sincrono fim");\n\n// saída real:\n// 1 sincrono\n// 2 sincrono fim\n// 3 nextTick\n// 4 promise\n// 5 microtask\n// 6 setTimeout 0\n// 7 setImmediate'
          ),
          sl(
            'setTimeout(0) x setImmediate',
            'No programa principal, a ordem entre setTimeout(fn, 0) e setImmediate(fn) pode variar de execução para execução, porque depende do tempo que o processo levou para iniciar; não construa lógica em cima disso. DENTRO de um callback de I/O (fase poll), setImmediate SEMPRE roda antes, porque a fase check vem logo depois do poll e os timers só na próxima volta. Teste real, dentro de fs.readFile: A immediate dentro de I/O apareceu antes de B timeout dentro de I/O. O "0" do setTimeout também nunca é exato: significa "o quanto antes possível, no mínimo 1 ms".'
          ),
          sl(
            'Bloqueio e starvation',
            'Qualquer código síncrono longo bloqueia o loop: laços enormes, JSON.parse de um corpo gigante, fs.readFileSync em rota de servidor, criptografia síncrona, expressões regulares mal escritas (ReDoS, veja o curso de Segurança Web). Há também a starvation (inanição): como a fila de nextTick é esvaziada por inteiro antes de o loop seguir, um nextTick que agenda outro nextTick sem parar impede o loop de chegar a I/O e timers. Para dividir trabalho longo em partes, prefira setImmediate entre os blocos, ou mande o cálculo para um worker.'
          ),
          sl(
            'O threadpool do libuv',
            'Algumas operações não têm versão assíncrona nativa no sistema operacional e rodam em um conjunto pequeno de threads do próprio libuv (o threadpool, de tamanho padrão pequeno, ajustável pela variável UV_THREADPOOL_SIZE: consulte a documentação). Usam o pool: muitas funções de fs, crypto.pbkdf2 e crypto.scrypt assíncronos, zlib e dns.lookup. Conexões de rede (sockets, http) NÃO usam o pool: o sistema operacional avisa o libuv quando há dados. Consequência: muitas operações pesadas de crypto/fs ao mesmo tempo disputam poucas threads e uma pode esperar a outra, mesmo sem bloquear o seu JavaScript.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um programa executa, nesta ordem: console.log("A"), setTimeout(() => console.log("B"), 0), Promise.resolve().then(() => console.log("C")), process.nextTick(() => console.log("D")). Qual a ordem de saída?', 'd', [
          'A, B, C, D, pois o Node segue a ordem do código escrito',
          'A, C, D, B, porque promises têm prioridade sobre qualquer outra fila',
          'A, B, D, C, porque timers de zero milissegundo rodam imediatamente',
          'A, D, C, B'
        ], 'Código síncrono primeiro (A); depois a fila de nextTick (D), as microtarefas de promises (C) e só então os timers (B).'),
        mcq('q2', 'O que o Node faz entre a execução de um callback e o próximo, antes de seguir adiante no loop?', 'c', [
          'Aguarda um milissegundo fixo para que o sistema operacional atualize o relógio',
          'Reinicia o threadpool do libuv para liberar a memória usada pelo callback anterior',
          'Esvazia a fila de nextTick e depois a de microtarefas (promises)',
          'Executa os callbacks de setImmediate pendentes, mesmo de fases futuras'
        ], 'nextTick e microtarefas são drenadas entre callbacks, com nextTick primeiro. setImmediate pertence à fase check.'),
        mcq('q3', 'Em qual fase do loop rodam os callbacks de setImmediate?', 'b', [
          'timers, junto dos callbacks de setTimeout e setInterval',
          'check, logo depois da fase poll',
          'close callbacks, ao final de cada volta completa do loop',
          'poll, durante o recebimento dos eventos de I/O pendentes'
        ], 'setImmediate é executado na fase check, que vem imediatamente depois do poll.'),
        fill('q4', 'Complete o nome da função que agenda um callback na fila que é esvaziada antes das promises.', 'process.___(() => console.log("antes das promises"));', ['nextTick'], 'process.nextTick usa uma fila própria, drenada antes das microtarefas de promises.'),
        mcq('q5', 'Dentro de um callback de fs.readFile, qual executa primeiro: setTimeout(fn, 0) ou setImmediate(fn)?', 'a', [
          'setImmediate, porque a fase check vem logo após a fase poll onde o callback roda',
          'setTimeout, porque o tempo zero vence antes de qualquer outro mecanismo do Node',
          'A ordem é aleatória também dentro de callbacks de I/O, como no programa principal',
          'Ambos são ignorados, pois timers e immediates não rodam dentro de callbacks de I/O'
        ], 'Dentro de I/O a ordem é determinística: o immediate vem na fase check da mesma volta e o timer só na volta seguinte (teste real: A antes de B).'),
        mcq('q6', 'Por que uma função que agenda a si mesma repetidamente com process.nextTick pode travar o servidor?', 'b', [
          'Porque o nextTick cria uma thread nova a cada chamada e esgota a memória do sistema',
          'Porque a fila de nextTick é esvaziada por inteiro antes de o loop avançar, e I/O não ganha a vez',
          'Porque o nextTick é síncrono e executa no mesmo instante em que é chamado pela função',
          'Porque o Node desliga o threadpool enquanto existir qualquer nextTick pendente'
        ], 'A fila só termina quando esvazia; se sempre entra mais um item, o loop nunca chega às fases de timers e poll (starvation).'),
        mcq('q7', 'Qual destas operações usa o threadpool do libuv?', 'a', [
          'crypto.scrypt assíncrono',
          'Aceitar uma nova conexão em um servidor http',
          'Executar um callback de setTimeout vencido',
          'Resolver uma promise que já foi cumprida'
        ], 'crypto.scrypt/pbkdf2, zlib, várias funções de fs e dns.lookup usam o pool. Sockets de rede e timers são tratados de outra forma e promises são microtarefas do próprio JavaScript.'),
        fill('q8', 'Complete com o sufixo da função de fs que BLOQUEIA o event loop enquanto lê o arquivo.', 'const dados = fs.readFile___(caminho); // bloqueia o loop', ['Sync'], 'As versões terminadas em Sync (readFileSync) bloqueiam a thread principal e devem ser evitadas em rotas de servidor.')
      ]
    },
    {
      id: 'nji-08-clientes-http-e-fetch',
      title: 'Clientes HTTP: fetch, timeouts e retries',
      goal: 'Chamar outras APIs com fetch, tratar erros HTTP, usar timeouts e retries com cuidado e conhecer o risco de SSRF.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'fetch embutido',
            'Seu back-end também é cliente: chama APIs de pagamento, e-mail, outros serviços. Em versões recentes o Node traz a função global fetch, a mesma da web, sem instalar nada (confira a documentação da sua versão). fetch(url, opções) devolve uma promise de Response, com status (número, como 200), ok (true para 200 a 299), headers e métodos para ler o corpo: res.json(), res.text(). PEGADINHA REAL: fetch só rejeita a promise em falha de REDE (sem conexão, DNS, timeout). Uma resposta 404 ou 503 é uma resposta válida: a promise resolve e você precisa olhar res.ok. O teste foi executado contra um servidor local próprio:',
            'const r = await fetch(base + "/ok");\nconsole.log(r.status, r.ok, await r.json());\n// 200 true { ok: true }\n\nconst e = await fetch(base + "/erro");   // o servidor local responde 503\nconsole.log("status", e.status, "ok?", e.ok);\n// status 503 ok? false   <- não lançou exceção!'
          ),
          sl(
            'Timeouts e AbortController',
            'Sem limite de tempo, uma API lenta deixa a sua requisição pendurada, ocupando memória e conexões. AbortController permite CANCELAR uma operação: você passa controller.signal em fetch e chama controller.abort() quando quiser. Atalho: AbortSignal.timeout(ms) cria um sinal que aborta sozinho após o prazo, rejeitando a promise com um erro de nome TimeoutError. Defina SEMPRE um timeout em chamadas externas. Execução real contra um endpoint local que demora 2 s, com limite de 300 ms:',
            'try {\n  await fetch(base + "/lento", { signal: AbortSignal.timeout(300) });\n} catch (err) {\n  console.log("falha:", err.name);\n}\n// falha: TimeoutError'
          ),
          sl(
            'Tratando erros HTTP',
            'Um cliente robusto separa três situações: falha de rede/timeout (exceção), resposta de erro do servidor (res.ok falso) e resposta ok. Para respostas de erro, leia status e, se útil, o corpo, mas NÃO repasse ao seu usuário detalhes internos do outro serviço e NUNCA registre em log cabeçalhos de autorização, tokens ou dados pessoais do corpo. Crie uma função utilitária que lance um erro seu (com status e mensagem controlada) quando !res.ok, para o resto do código não repetir a verificação.',
            'async function getJson(url) {\n  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });\n  if (!res.ok) throw new Error(`falha ao consultar serviço (HTTP ${res.status})`);\n  return res.json();\n}'
          ),
          sl(
            'Retries com critério',
            'Retry é tentar de novo. Só faz sentido para falhas TRANSITÓRIAS: erro de rede, timeout, 502, 503, 504 e 429 (limite de requisições; respeite o cabeçalho Retry-After se existir). 400, 401, 403 e 404 não melhoram sozinhos. Só repita operações IDEMPOTENTES (repetir não muda o resultado: GET, PUT, DELETE); um POST que cria cobrança, repetido, pode duplicar, a menos que o serviço aceite uma chave de idempotência. Use backoff exponencial (esperas crescentes: 200 ms, 400 ms, 800 ms) com jitter (variação aleatória, para clientes não tentarem todos no mesmo instante) e um número máximo de tentativas. Ilustrativo, não executado aqui.',
            'for (let tentativa = 0; tentativa < 3; tentativa++) {\n  try {\n    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });\n    if (res.status < 500 && res.status !== 429) return res;\n  } catch { /* falha de rede: tenta de novo */ }\n  const espera = 200 * 2 ** tentativa + Math.random() * 100;\n  await new Promise((r) => setTimeout(r, espera));\n}\nthrow new Error("serviço indisponível");'
          ),
          sl(
            'undici, axios e outros',
            'O fetch do Node é implementado sobre o undici, um cliente HTTP do próprio projeto Node que também pode ser usado diretamente (pacote undici) quando você precisa de pool de conexões configurável ou mais desempenho. axios, got e ky (por nome) são bibliotecas populares com recursos extras (interceptadores, retry embutido, tratamento de erro diferente). Para a maioria dos casos, o fetch nativo basta; adote uma biblioteca só se um recurso dela fizer falta. Atenção: axios, por exemplo, rejeita a promise em respostas 4xx/5xx por padrão, ao contrário do fetch; conheça o comportamento da ferramenta escolhida.'
          ),
          sl(
            'SSRF em visão geral',
            'SSRF (Server-Side Request Forgery, requisição forjada pelo servidor) acontece quando a URL do fetch vem do usuário (por exemplo, uma rota que gera "prévia de link"). O atacante informa um endereço interno e o SEU servidor, que enxerga a rede privada e serviços internos, faz a requisição por ele. Defesas: aceitar só hosts de uma lista permitida; permitir só https; resolver o DNS e bloquear endereços privados e de loopback; não seguir redirecionamentos às cegas (redirect: "manual"); impor timeout e limite de tamanho de resposta. Detalhes completos no curso de Segurança Web (OWASP).'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um fetch recebe resposta 503 do servidor. O que acontece com a promise?', 'a', [
          'Resolve normalmente, com res.ok igual a false; o código precisa verificar',
          'É rejeitada automaticamente e o catch recebe o erro com o status 503',
          'Fica pendente até o servidor devolver uma resposta com status de sucesso',
          'É rejeitada se o corpo da resposta estiver vazio e sem formato JSON'
        ], 'fetch só rejeita em falha de rede/aborto. Respostas HTTP de erro resolvem a promise, por isso é obrigatório checar res.ok.'),
        mcq('q2', 'O que ocorre com fetch(url, { signal: AbortSignal.timeout(300) }) quando o servidor demora 2 segundos?', 'b', [
          'A resposta chega normalmente depois de 2 segundos, pois o sinal só afeta a leitura do corpo',
          'A promise é rejeitada com um erro de nome TimeoutError após cerca de 300 ms',
          'O Node reenvia a requisição automaticamente até receber a resposta do servidor',
          'O fetch devolve um Response com status 408 gerado localmente pelo próprio cliente'
        ], 'O sinal de timeout aborta a operação e rejeita a promise com TimeoutError (comprovado na execução real). Não há reenvio automático.'),
        mcq('q3', 'Qual falha justifica uma nova tentativa (retry) automática de um GET?', 'c', [
          '404, porque o recurso pode ter sido criado enquanto o cliente esperava a resposta',
          '401, porque a credencial se renova sozinha quando se tenta a mesma chamada de novo',
          '503, porque indica indisponibilidade temporária do serviço',
          '400, porque o servidor pode interpretar a requisição de outra maneira na segunda vez'
        ], '5xx de indisponibilidade (502, 503, 504) e falhas de rede são transitórios. 400, 401 e 404 não mudam sozinhos.'),
        fill('q4', 'Complete a propriedade da Response que é true para status de 200 a 299.', 'if (!res.___) throw new Error("falha HTTP");', ['ok'], 'res.ok indica sucesso (200 a 299); por isso é a verificação padrão após o fetch.'),
        mcq('q5', 'Para que servem o backoff exponencial com jitter nos retries?', 'd', [
          'Para garantir que a mesma resposta seja devolvida em todas as tentativas, dispensando o cache, conforme o comportamento padrão das versões mais antigas',
          'Para evitar que o servidor externo bloqueie o seu IP, pois jitter disfarça o cliente',
          'Para reduzir o tamanho do corpo da requisição a cada tentativa, economizando banda',
          'Para espaçar as tentativas e impedir que vários clientes sobrecarreguem o serviço ao mesmo tempo'
        ], 'Esperas crescentes aliviam o serviço em dificuldade e o jitter evita que todos os clientes tentem no mesmo instante.'),
        mcq('q6', 'Uma rota /previa?url=... faz fetch na URL informada pelo usuário. Qual a melhor defesa contra SSRF?', 'c', [
          'Converter a URL para minúsculas e remover espaços antes de usá-la no fetch',
          'Exigir que o usuário esteja logado, pois só atacantes anônimos exploram esse tipo de falha',
          'Aceitar só hosts de uma lista permitida, bloquear IPs privados e não seguir redirecionamentos às cegas',
          'Usar axios em vez de fetch, pois o axios bloqueia por padrão endereços da rede interna'
        ], 'O risco é o servidor ser usado para alcançar a rede interna. Lista permitida, bloqueio de endereços privados e controle de redirecionamentos reduzem isso. Login e troca de biblioteca não resolvem.'),
        mcq('q7', 'Um POST /cobrancas falha por timeout. Repetir automaticamente é seguro?', 'd', [
          'Sim, pois o servidor ignora requisições repetidas com o mesmo corpo de dados, já que o próprio Node cuida desse detalhe por baixo',
          'Sim, desde que o retry espere pelo menos um segundo entre as tentativas',
          'Não: POST não pode ser repetido, nem mesmo com mecanismos de proteção do servidor',
          'Só se o serviço aceitar uma chave de idempotência; do contrário a cobrança pode duplicar'
        ], 'O timeout não diz se o servidor processou a operação. Sem idempotência a repetição pode cobrar duas vezes; com chave de idempotência o serviço reconhece a repetição.'),
        fill('q8', 'Complete o atalho que cria um sinal que aborta sozinho depois de um prazo em milissegundos.', 'fetch(url, { signal: AbortSignal.___(3000) });', ['timeout'], 'AbortSignal.timeout(ms) aborta a operação depois do prazo, rejeitando a promise com TimeoutError.')
      ]
    },
    {
      id: 'nji-09-express-organizacao-avancada',
      title: 'Express: organização avançada',
      goal: 'Estruturar uma API Express em routers e camadas, usar injeção de dependências manual, async handlers, validação por middleware e versionamento.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Quando o app.js cresce demais',
            'No nível iniciante todas as rotas ficaram em um arquivo. Com 30 rotas isso vira um emaranhado: misturar HTTP, regras de negócio e banco no mesmo lugar dificulta testar e mudar. A solução é dividir em CAMADAS, cada uma com uma responsabilidade: rotas/controladores (traduzem HTTP: leem req, chamam o serviço e escrevem res), serviços (regras de negócio: "um pedido precisa ter itens"), repositórios (acesso a dados: SQL, banco). A seta de dependência vai de cima para baixo; o serviço não conhece req nem res.'
          ),
          sl(
            'Routers modulares',
            'express.Router() cria um mini-aplicativo só de rotas, que você monta em um prefixo com app.use. Cada recurso ganha seu arquivo (pedidos.routes.js) e o app.js só junta as peças. Middlewares podem ser aplicados no router inteiro (por exemplo, exigir login em tudo de /pedidos). Ilustrativo, não executado aqui (depende do pacote Express).',
            '// pedidos.routes.js\nconst router = require("express").Router();\nrouter.get("/", listar);\nrouter.post("/", validar(esquemaPedido), criar);\nmodule.exports = router;\n\n// app.js\napp.use("/v1/pedidos", exigirLogin, require("./pedidos.routes"));'
          ),
          sl(
            'Injeção de dependências manual',
            'Injeção de dependências (DI) significa que um módulo RECEBE de fora aquilo de que precisa, em vez de criá-lo ou importá-lo diretamente. Em Node simples isso é uma função fábrica que recebe as dependências e devolve o objeto. Vantagem: nos testes você entrega um repositório FALSO (sem banco), e em produção entrega o real. Exemplo executado de verdade, só com Node:',
            'function criarPedidosService({ repo }) {\n  return {\n    async criar(dados) {\n      if (!Array.isArray(dados.itens) || dados.itens.length === 0) throw new Error("pedido sem itens");\n      return repo.salvar({ itens: dados.itens });\n    }\n  };\n}\nconst repoFalso = { async salvar(p) { return { id: 1, ...p }; } };\nconst service = criarPedidosService({ repo: repoFalso });\nconsole.log(await service.criar({ itens: ["caneta"] }));\n// { id: 1, itens: [ \'caneta\' ] }\ntry { await service.criar({ itens: [] }); } catch (e) { console.log("erro:", e.message); }\n// erro: pedido sem itens'
          ),
          sl(
            'Async handlers',
            'Em versões antigas do Express, se um handler async lança erro (a promise rejeita), o Express NÃO captura: a requisição fica pendurada e o erro vira "rejeição não tratada". Versões recentes do Express tratam promises rejeitadas em handlers; confira a documentação da versão que usa. Para ser independente disso, um wrapper encaminha o erro ao middleware de erros: asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next). O middleware de erros (função com 4 parâmetros: err, req, res, next) responde com mensagem genérica e registra o detalhe só no log interno, sem dados pessoais.',
            'const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);\n\nrouter.get("/:id", asyncHandler(async (req, res) => {\n  const pedido = await service.buscar(req.params.id);\n  res.json(pedido);\n}));\n\napp.use((err, req, res, next) => {\n  console.error(err);                       // detalhe só no log interno\n  res.status(500).json({ erro: "erro interno" }); // resposta genérica\n});'
          ),
          sl(
            'Validação por middleware e mass assignment',
            'Um middleware de validação roda ANTES do handler: confere o corpo contra um esquema (com Zod, Joi, ou à mão); se inválido, responde 400 e NÃO chama next(); se válido, entrega ao handler apenas os campos conhecidos. Isso evita o mass assignment: copiar req.body inteiro para o banco permite que o cliente envie campos que não deveria (como papel: "admin" ou preco). Sempre escolha os campos explicitamente.',
            'const validar = (esquema) => (req, res, next) => {\n  const r = esquema(req.body);          // devolve { ok, dados } ou { ok: false }\n  if (!r.ok) return res.status(400).json({ erro: "dados inválidos" });\n  req.dados = r.dados;                  // só os campos permitidos\n  next();\n};'
          ),
          sl(
            'Versionamento de rotas',
            'Clientes antigos (apps de celular, integrações) dependem do formato da sua API. Quando uma mudança QUEBRA a compatibilidade (remover ou renomear campo, mudar o significado), publique uma nova versão, por exemplo /v2/pedidos, mantendo /v1 por um período anunciado de descontinuação. Adicionar um campo opcional não quebra e não exige versão nova. Na prática: um router por versão, com serviços compartilhados quando possível. Outras formas (cabeçalho de versão) existem; o prefixo na URL é a mais simples de entender e depurar.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual responsabilidade pertence à camada de serviço?', 'b', [
          'Ler req.params e montar o código de status e o corpo da resposta HTTP',
          'Aplicar a regra de negócio, como recusar um pedido sem itens',
          'Executar o SQL e converter as linhas do banco em objetos de retorno',
          'Registrar os middlewares globais e iniciar o servidor na porta configurada'
        ], 'O serviço concentra regras de negócio e não conhece HTTP. Ler req/res é do controlador e SQL é do repositório.'),
        mcq('q2', 'Qual é o principal benefício da injeção de dependências manual para os testes?', 'd', [
          'Faz o código executar mais rápido, pois dispensa o carregamento dos módulos do projeto',
          'Gera automaticamente os dados de teste a partir do esquema do banco de dados real',
          'Elimina a necessidade de validar a entrada, pois as dependências já chegam validadas',
          'Permite entregar um repositório falso no lugar do real e testar a regra sem banco'
        ], 'Como o serviço recebe o repositório de fora, o teste injeta um falso. DI não acelera o código nem gera dados ou validações.'),
        mcq('q3', 'Qual problema um async handler sem tratamento causava em versões antigas do Express, e qual a solução clássica?', 'a', [
          'A requisição ficava pendurada; envolver o handler em um wrapper que chama next(err) no catch',
          'O servidor reiniciava a cada erro; a solução era usar o cluster do Node',
          'A resposta saía duplicada; a solução era chamar res.end duas vezes',
          'O erro aparecia só no navegador; a solução era retornar status 200 em toda falha'
        ], 'Promise rejeitada em handler async não chegava ao middleware de erros. O wrapper com .catch(next) encaminha o erro.'),
        fill('q4', 'Complete a função do Express que cria um conjunto modular de rotas.', 'const router = express.___();', ['Router'], 'express.Router() cria um mini-aplicativo de rotas que é montado com app.use.'),
        mcq('q5', 'Onde deve ficar o middleware de validação e o que ele faz com dados inválidos?', 'c', [
          'Depois do handler, corrigindo silenciosamente a resposta que já foi preparada',
          'Dentro do repositório, antes de executar o comando SQL no banco',
          'Antes do handler; responde 400 e não chama next()',
          'No cliente; o servidor deve confiar nos dados que chegam do front-end'
        ], 'A validação precisa vir antes da lógica e interromper a cadeia com 400. Confiar só no cliente é inseguro: qualquer um envia requisições direto.'),
        mcq('q6', 'O que é mass assignment e como evitá-lo?', 'a', [
          'Copiar req.body inteiro para o banco; evite escolhendo explicitamente os campos aceitos',
          'Fazer várias requisições ao mesmo tempo; evite usando um limite de conexões, sem necessidade de nenhuma configuração adicional',
          'Gravar muitos registros em uma única transação; evite gravando um por vez',
          'Registrar muitas rotas em um router; evite criando um arquivo por rota'
        ], 'Mass assignment permite que o cliente defina campos que não deveria (papel, preço). A defesa é lista explícita de campos permitidos.'),
        mcq('q7', 'Em qual situação é necessário publicar /v2 em vez de alterar /v1?', 'b', [
          'Ao adicionar um campo opcional novo na resposta de um recurso',
          'Ao renomear um campo que clientes antigos já usam na resposta',
          'Ao corrigir um erro de digitação em uma mensagem de log interna',
          'Ao otimizar a consulta do banco, mantendo o mesmo formato de resposta'
        ], 'Renomear ou remover campo quebra clientes existentes. Adicionar campo opcional, ajustes de log e otimizações internas não alteram o contrato.'),
        fill('q8', 'Complete o argumento que encaminha o erro ao middleware de erros do Express.', 'fn(req, res, next).catch(___);', ['next'], 'Passar next ao catch faz o Express tratar o erro no middleware de 4 parâmetros.')
      ]
    },
    {
      id: 'nji-10-fastify-e-alternativas',
      title: 'Fastify e alternativas ao Express',
      goal: 'Conhecer o Fastify (schemas e plugins), citar Koa e Hapi e escolher framework por critérios, não por moda.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que existem alternativas',
            'O Express é o mais conhecido, simples e flexível, mas deixa muita coisa por conta de você (validação, estrutura, desempenho). Outros frameworks fazem escolhas diferentes. Todos os exemplos desta lição são ilustrativos, não executados aqui, pois dependem de pacotes de terceiros. A pergunta certa não é "qual é o melhor?", e sim "qual combina com o meu time, o meu problema e a minha manutenção?".'
          ),
          sl(
            'Fastify: schemas e velocidade',
            'O Fastify (por nome) é um framework focado em baixo overhead e em JSON Schema: um formato padronizado para DESCREVER a forma de um JSON (tipos, campos obrigatórios, tamanhos). Você declara o schema da entrada (body, query, params) e o Fastify valida automaticamente, respondendo 400 se não bater. Também pode declarar o schema da RESPOSTA: só os campos listados são serializados (e de forma rápida), o que evita vazar por engano um campo interno como senhaHash.',
            'fastify.post("/usuarios", {\n  schema: {\n    body: { type: "object", required: ["nome"], properties: { nome: { type: "string", maxLength: 100 } }, additionalProperties: false },\n    response: { 201: { type: "object", properties: { id: { type: "integer" }, nome: { type: "string" } } } }\n  }\n}, async (request, reply) => {\n  const u = await criarUsuario(request.body);\n  return reply.code(201).send(u);   // senhaHash não passa: não está no schema de resposta\n});'
          ),
          sl(
            'Plugins e encapsulamento',
            'No Fastify tudo é plugin: rotas, banco, autenticação. fastify.register(plugin) carrega um plugin em um CONTEXTO encapsulado: o que ele registra (decorators, hooks) fica visível só nele e nos plugins filhos, evitando que um módulo interfira em outro. Hooks são ganchos no ciclo da requisição (onRequest, preHandler, onSend...), equivalentes a middlewares mais organizados. Há plugins oficiais e da comunidade para CORS, cabeçalhos de segurança, limite de requisições e outros, mas avalie a manutenção de cada um antes de adotar.'
          ),
          sl(
            'Koa e Hapi',
            'Koa (por nome) foi criado pela equipe original do Express: núcleo minimalista, sem roteador nem corpo de requisição embutidos, com middlewares assíncronos que recebem um objeto ctx (contexto da requisição). Dá controle total, mas você monta o resto com pacotes. Hapi (por nome) segue outra filosofia: configuração declarativa, muita coisa embutida (validação, autenticação, cache) e foco em previsibilidade para equipes grandes. Todos continuam sendo JavaScript sobre o mesmo módulo http do Node, que você já conhece.'
          ),
          sl(
            'Critérios de escolha',
            'Considere: conhecimento da equipe e facilidade de contratar; maturidade e manutenção do projeto (atualizações de segurança frequentes); ecossistema de plugins; suporte a TypeScript; necessidade de estrutura imposta (NestJS, próxima lição); e desempenho. Sobre desempenho: benchmarks medem rotas mínimas; em aplicações reais o gargalo costuma ser banco, rede e serviços externos, então a diferença entre frameworks raramente decide. Migrar um sistema funcionando só por benchmark é risco com pouco retorno. Meça o seu gargalo real antes.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Para que serve declarar um schema JSON na rota do Fastify para a entrada (body)?', 'c', [
          'Para gerar automaticamente as tabelas do banco de dados a partir dos campos declarados',
          'Para criptografar o corpo da requisição antes de ele chegar ao handler',
          'Para validar automaticamente o formato da entrada e responder 400 se estiver fora dele',
          'Para impedir que a rota seja chamada por qualquer método diferente de GET'
        ], 'O schema descreve a forma esperada do JSON e o Fastify valida antes do handler. Não cria tabelas, não criptografa e não restringe métodos.'),
        mcq('q2', 'O que significa o encapsulamento dos plugins no Fastify?', 'a', [
          'O que um plugin registra fica visível só nele e em seus filhos, sem afetar os demais',
          'Todo plugin é obrigado a rodar em uma thread separada para isolar seus dados',
          'O código dos plugins é criptografado e só o Fastify consegue lê-lo na execução',
          'Cada plugin precisa ser publicado como um pacote npm antes de ser registrado'
        ], 'Registrar dentro de um plugin cria um contexto próprio, evitando interferência entre módulos. Não há threads nem criptografia envolvidas.'),
        mcq('q3', 'Qual descrição combina com o Koa?', 'b', [
          'Framework completo com ORM, validação e autenticação embutidos e configuração declarativa, o que costuma ser suficiente para a maioria das aplicações',
          'Núcleo minimalista com middlewares assíncronos que usam o objeto ctx e sem roteador embutido',
          'Biblioteca exclusiva para tempo real que substitui o módulo http do Node',
          'Compilador que converte TypeScript em JavaScript para rodar no navegador'
        ], 'Koa é minimalista: o resto vem de pacotes. A opção de configuração declarativa e itens embutidos descreve melhor o Hapi.'),
        fill('q4', 'Complete o método do Fastify que carrega um plugin em um contexto encapsulado.', 'fastify.___(meuPlugin);', ['register'], 'fastify.register(plugin) é o mecanismo de carregamento de plugins.'),
        mcq('q5', 'Uma equipe conhece bem o Express e tem uma API cujo tempo é gasto em consultas ao banco. Qual decisão é mais sensata?', 'd', [
          'Reescrever tudo em outro framework imediatamente, pois o framework é o gargalo mais provável',
          'Trocar o banco de dados por um arquivo JSON, que é mais rápido que qualquer consulta',
          'Migrar para o Koa porque ele tem menos código e portanto menos erros de segurança',
          'Manter o Express e medir/otimizar as consultas, avaliando outro framework só se houver motivo claro'
        ], 'Se o tempo está no banco, trocar o framework pouco muda. Medir e otimizar onde está o gargalo traz mais retorno que reescrever.'),
        mcq('q6', 'Qual a vantagem de declarar também um schema de RESPOSTA no Fastify?', 'd', [
          'Faz o cliente validar automaticamente a resposta com o mesmo schema, dispensando testes',
          'Compacta o JSON com gzip para reduzir o tráfego sem configuração adicional',
          'Permite que o servidor responda sem executar o handler quando o resultado já está em cache',
          'Só os campos declarados são enviados, evitando vazar campos internos por engano'
        ], 'O schema de resposta limita a serialização aos campos listados: um senhaHash que escape do handler não chega ao cliente.'),
        mcq('q7', 'Um benchmark mostra um framework 20% mais rápido em uma rota mínima. O que a equipe deve fazer antes de migrar?', 'c', [
          'Migrar de imediato, pois desempenho de benchmark se reproduz em qualquer aplicação',
          'Descartar o framework atual, porque diferenças percentuais indicam falha de projeto, e isso dispensa qualquer verificação posterior no código',
          'Medir onde o tempo é gasto na própria aplicação e avaliar custo, risco e ecossistema da migração',
          'Esperar o próximo benchmark, pois resultados só valem após três medições seguidas'
        ], 'Benchmarks de rota mínima não refletem o gargalo real. A decisão deve ponderar medição própria, risco e custo de migração.'),
        fill('q8', 'Complete o nome do formato padronizado que descreve a forma de um JSON e é usado pelo Fastify para validação.', 'schema: { body: { type: "object" } } // formato ___ Schema', ['JSON'], 'JSON Schema é o padrão usado para descrever e validar a estrutura de documentos JSON.')
      ]
    },
    {
      id: 'nji-11-nestjs-visao-geral',
      title: 'NestJS: visão geral',
      goal: 'Entender módulos, controladores, provedores, injeção de dependências, decorators e os conceitos de pipes, guards e interceptors.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é o NestJS',
            'NestJS (por nome) é um framework opinativo para back-ends em TypeScript: ele define uma ESTRUTURA padrão para o projeto, inspirada em frameworks como o Angular, rodando por baixo sobre Express ou Fastify. Em vez de você decidir onde fica cada coisa, o Nest já tem lugar para rotas, regras de negócio, validação e autorização. O ganho é consistência em equipes grandes; o custo é uma curva de aprendizado e mais código de "cerimônia". Todos os exemplos são ilustrativos, não executados aqui.'
          ),
          sl(
            'Módulos, controladores e provedores',
            'Módulo: agrupa um conjunto coeso (por exemplo, "pedidos") e declara o que contém. Controlador (controller): recebe as requisições HTTP de certas rotas e delega; é a camada de HTTP. Provedor (provider): qualquer classe injetável, tipicamente um serviço com a regra de negócio ou um repositório. A divisão é a mesma da lição de organização do Express (rotas, serviços, repositórios), agora imposta pelo framework.',
            '@Module({\n  controllers: [PedidosController],\n  providers: [PedidosService]\n})\nexport class PedidosModule {}'
          ),
          sl(
            'Decorators e injeção de dependências',
            'Decorator é uma anotação escrita com @ acima de uma classe, método ou parâmetro, que adiciona informação (metadados) a ela; o Nest lê esses metadados para saber que classe é controlador, qual método responde a GET etc. A injeção de dependências já vista funciona assim: você declara no construtor o que precisa e o Nest cria e entrega a instância (contêiner de DI). Ao marcar uma classe com @Injectable(), você a registra como algo que o Nest pode instanciar e injetar. Os testes podem substituir um provedor por um falso.',
            '@Injectable()\nexport class PedidosService {\n  constructor(private readonly repo: PedidosRepository) {}\n  criar(dados: CriarPedidoDto) { /* regra de negócio */ }\n}\n\n@Controller("pedidos")\nexport class PedidosController {\n  constructor(private readonly service: PedidosService) {}\n  @Post()\n  criar(@Body() dados: CriarPedidoDto) { return this.service.criar(dados); }\n}'
          ),
          sl(
            'Pipes, guards, interceptors e filters',
            'São quatro pontos de extensão, vistos aqui só em conceito. Pipe: valida ou transforma a ENTRADA antes do handler (por exemplo, converter um id de texto em número e recusar formato inválido; com DTOs, objetos que descrevem o formato esperado dos dados, e um pipe de validação ativado). Guard: decide se a requisição pode continuar (autenticação e autorização, como "só administradores"). Interceptor: envolve o handler, podendo executar algo antes e depois (medir tempo, registrar logs sem dados pessoais, transformar a resposta, cache). Exception filter: captura erros e define a resposta HTTP, com mensagem sem detalhes internos.'
          ),
          sl(
            'Quando vale a pena',
            'Vale para APIs grandes ou de longa vida, com várias pessoas, em que padronização e testabilidade compensam; quando a equipe já usa TypeScript e entende DI. Pode ser exagero para um serviço de duas rotas ou um protótipo. Erros comuns: colocar regra de negócio no controlador; criar dependências circulares entre módulos; achar que o decorator de validação no DTO funciona sozinho (precisa de um pipe de validação ativo, e os tipos TypeScript não validam nada em execução, lembre da primeira lição do nível). Confirme detalhes e recursos na documentação oficial da versão usada.'
          )
        ]
      },
      questions: [
        mcq('q1', 'No NestJS, qual é o papel do controlador (controller)?', 'd', [
          'Guardar a regra de negócio e executar as consultas ao banco de dados diretamente',
          'Criptografar o corpo das requisições antes de passá-las ao restante da aplicação',
          'Agrupar os módulos do projeto e configurar a porta do servidor',
          'Receber as requisições HTTP de suas rotas e delegar o trabalho a provedores'
        ], 'O controlador é a camada de HTTP: lê a entrada, chama o serviço e devolve a resposta. A regra de negócio fica nos provedores.'),
        mcq('q2', 'O que a anotação @Injectable() indica em uma classe?', 'b', [
          'Que a classe só pode ser usada em testes automatizados e fica desativada em produção',
          'Que o Nest pode instanciá-la e injetá-la onde for declarada como dependência',
          'Que a classe é exposta como rota pública e responde diretamente a requisições HTTP',
          'Que a classe foi compilada para JavaScript e não pode mais ser alterada'
        ], '@Injectable() registra a classe no contêiner de DI do Nest. Rotas públicas são definidas por @Controller e decorators de método.'),
        mcq('q3', 'Qual componente decide se uma requisição pode prosseguir, por exemplo exigindo o papel de administrador?', 'a', [
          'Guard',
          'Pipe',
          'Interceptor',
          'Exception filter'
        ], 'Guards fazem autorização/autenticação e liberam ou barram a requisição. Pipes tratam a entrada, interceptors envolvem o handler e filters formatam erros.'),
        fill('q4', 'Complete o decorator que marca uma classe como provedor que o Nest pode injetar.', '@___()\nexport class PedidosService {}', ['Injectable'], '@Injectable() é o decorator padrão para serviços e outros provedores.'),
        mcq('q5', 'Em qual cenário o NestJS tende a compensar o custo de aprendizado?', 'c', [
          'Um script de uma única execução que renomeia arquivos em uma pasta local',
          'Um serviço com duas rotas mantido por uma pessoa e sem previsão de crescimento',
          'Uma API grande, com várias equipes, longa vida e necessidade de padrão e testabilidade',
          'Um protótipo descartável que será apagado depois de uma demonstração de uma hora'
        ], 'A estrutura imposta paga seu custo quando há muitas pessoas, muito código e vida longa. Para scripts e protótipos pequenos é exagero.'),
        mcq('q6', 'Um DTO tem decorators de validação, mas nenhum pipe de validação foi ativado na aplicação. O que esperar?', 'b', [
          'A validação ocorre normalmente, porque os decorators do DTO funcionam sozinhos, conforme o comportamento padrão das versões mais antigas',
          'A entrada não é validada; os decorators só têm efeito quando o pipe de validação está ativo',
          'O compilador TypeScript recusa-se a gerar o JavaScript do projeto',
          'O Nest rejeita todas as requisições com status 403 até o pipe ser ativado'
        ], 'Os decorators descrevem regras, mas quem as aplica é o pipe de validação. Sem ele a entrada passa sem checagem.'),
        mcq('q7', 'Qual uso é típico de um interceptor?', 'a', [
          'Medir o tempo de cada handler e registrar um log sem dados pessoais',
          'Definir qual banco de dados cada módulo deve usar na produção',
          'Substituir o TypeScript por JavaScript puro na hora da execução',
          'Gerar o hash das senhas dos usuários no momento do cadastro'
        ], 'Interceptors envolvem o handler, executando lógica antes e depois (medição, logs, cache). Hash de senha é regra de serviço.'),
        fill('q8', 'Complete o decorator que declara um módulo agrupando controladores e provedores.', '@___({ controllers: [PedidosController], providers: [PedidosService] })\nexport class PedidosModule {}', ['Module'], '@Module() declara o conjunto de controladores e provedores de uma parte da aplicação.')
      ]
    },
    {
      id: 'nji-48-ssr-bff-e-node-com-front-end',
      title: 'SSR, BFF e Node com front-end',
      goal: 'Entender SSR e frameworks full-stack, o padrão BFF, contratos como OpenAPI e tRPC, cookies e CORS entre front e API, segredos fora do navegador e XSS em HTML gerado no servidor.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Onde o HTML é montado: CSR, SSR e SSG',
            'Em CSR (client-side rendering), o servidor entrega uma página quase vazia e um bundle JavaScript que monta a tela no navegador chamando a API. Em SSR (server-side rendering), o servidor Node monta o HTML já com os dados e o envia pronto; o navegador mostra rápido e buscadores leem o conteúdo, e depois o JavaScript assume a interação (hidratação). Em SSG (static site generation), o HTML é gerado antes, no build, e servido como arquivo. Frameworks full-stack como Next.js (sobre React) e Nuxt (sobre Vue) oferecem as três opções e rodam em Node (ilustrativo; confira a documentação do framework em uso). Vantagens do SSR: primeira tela rápida e bom para conteúdo público; custo: mais carga e mais código rodando no servidor, onde um erro de segurança vale mais.'
          ),
          sl(
            'BFF: backend for frontend',
            'BFF (Backend For Frontend) é uma camada de servidor feita sob medida para UM front-end (o app web, o app móvel). Em vez de o navegador chamar cinco serviços internos e juntar as respostas, ele chama o BFF, que chama os serviços, agrega, remove campos desnecessários e devolve só o que a tela precisa. Benefícios: menos requisições, formato de resposta ajustado à tela, e um lugar para guardar segredos e chamar serviços internos sem expô-los ao navegador. Cuidado: o BFF não substitui a autorização dos serviços de trás (cada serviço continua conferindo quem pode o quê) e não deve virar um segundo monólito com regra de negócio duplicada. Em um framework full-stack, as rotas de API e os componentes de servidor muitas vezes cumprem o papel de BFF.'
          ),
          sl(
            'Contrato entre front-end e API',
            'Front e API precisam concordar sobre os formatos. Um contrato explícito evita quebra silenciosa. OpenAPI descreve a API REST em um documento (veja a lição de documentação OpenAPI) e dele se geram clientes e validações. tRPC segue outra ideia: em projetos TypeScript que compartilham código entre front e back, as funções do servidor são chamadas pelo cliente com tipos inferidos, sem escrever um esquema separado; serve bem quando os dois lados vivem no mesmo repositório e são controlados pela mesma equipe, e não quando a API é pública para terceiros. Em ambos os casos, o servidor valida a entrada em tempo de execução (veja a lição de schemas com Zod): tipos do TypeScript somem no JavaScript final e não protegem contra requisições feitas à mão.'
          ),
          sl(
            'Cookies e CORS entre front e API',
            'Se o front e a API estão em origens diferentes (esquema, domínio e porta diferentes), o navegador aplica a política de mesma origem e exige CORS: a API responde com cabeçalhos dizendo QUAIS origens podem ler a resposta. Boa prática: lista explícita de origens permitidas, nunca refletir qualquer origem recebida; com cookies, é preciso permitir credenciais e nesse caso o curinga * não vale. Para sessão, o cookie deve ter HttpOnly (JavaScript da página não o lê, o que limita o estrago de um XSS), Secure (só vai por HTTPS) e SameSite (limita envio em requisições de outros sites, mitigando CSRF). Quando o BFF fica na MESMA origem do front, o CORS some do caminho, e o navegador conversa só com ele. Veja o curso de Segurança Web para CSRF e CORS em profundidade.',
            'Set-Cookie: sessao=<ID-OPACO>; HttpOnly; Secure; SameSite=Lax; Path=/'
          ),
          sl(
            'Segredos não vão ao navegador',
            'Regra de ouro: TUDO o que chega ao navegador é público. O usuário abre as ferramentas de desenvolvedor e lê o JavaScript, as variáveis embutidas e as requisições. Por isso chaves de API privadas, senhas de banco e segredos de assinatura só existem no servidor (variáveis de ambiente, veja a lição de configuração e segredos). Muitos frameworks usam um prefixo especial para marcar as variáveis que PODEM ser embutidas no bundle do navegador: confira na documentação qual é, e jamais use o prefixo público em uma chave privada. Padrão seguro: o navegador chama o seu servidor (BFF), e este chama o serviço de terceiros com a chave guardada. Erro comum: colocar a chave "só para testar" no código do front e esquecer de tirar. Código ilustrativo, não executado aqui.',
            '// servidor (BFF): a chave nunca vai ao bundle\nconst chave = process.env.SERVICO_CHAVE; // <SEGREDO> definido no ambiente\napp.get("/api/cotacao", async (req, res) => {\n  const r = await fetch(URL_DO_SERVICO, { headers: { authorization: `Bearer ${chave}` } });\n  res.json(await r.json());\n});'
          ),
          sl(
            'XSS em HTML gerado no servidor',
            'Quando o servidor monta HTML, qualquer dado de usuário colocado na página sem tratamento pode virar código executado no navegador de outra pessoa: é o XSS (Cross-Site Scripting; veja o curso de Segurança Web). A defesa é ESCAPAR o texto conforme o contexto: trocar & < > " e aspas simples por entidades HTML. Frameworks de componentes escapam por padrão; o perigo está nos atalhos que inserem HTML cru (como dangerouslySetInnerHTML no React ou v-html no Vue) e em montar HTML por concatenação. Outro ponto de SSR: ao embutir o estado inicial em uma tag script, não imprima o JSON bruto, porque um texto contendo a sequência que fecha a tag script quebraria a página; escape o sinal de menor no JSON. Escape executado de verdade, com o texto de entrada <b onmouseover="x()">oi</b>:',
            'const esc = (s) => String(s).replace(/[&<>"\']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\\"": "&quot;", "\'": "&#39;" }[c]));\nconsole.log(`<p>${esc(comentario)}</p>`);\n// <p>&lt;b onmouseover=&quot;x()&quot;&gt;oi&lt;/b&gt;</p>'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um site de notícias precisa que buscadores leiam o conteúdo e que a primeira tela apareça rápido. Qual abordagem de renderização atende melhor?', 'd', ['CSR, entregando página vazia e montando tudo no navegador depois de baixar o bundle', 'Uma API REST que devolve JSON, sem páginas HTML', 'Servir um aplicativo móvel nativo no lugar do site', 'SSR ou SSG, com o HTML já pronto ao chegar'], 'Com SSR (HTML montado a cada pedido) ou SSG (HTML gerado no build), o conteúdo já está no HTML recebido, o que ajuda a primeira tela e a leitura por buscadores. No CSR o conteúdo só existe depois de executar JavaScript. Uma API sozinha não produz páginas, e um app nativo não é uma resposta para um site na web.'),
        mcq('q2', 'O app web de uma loja chama cinco serviços internos e junta as respostas na tela, expondo os endereços internos ao navegador. Qual padrão resolve melhor esse desenho?', 'b', ['Liberar o CORS nos cinco serviços internos para que o navegador acesse cada um deles diretamente e junte as respostas', 'BFF: uma camada de servidor própria do front-end que agrega os serviços e devolve só o necessário', 'Mover os serviços para dentro do bundle JavaScript do navegador', 'Trocar o protocolo HTTP por WebSocket nas cinco chamadas'], 'O BFF concentra as chamadas, esconde os serviços internos e molda a resposta à tela. Liberar CORS deixaria os serviços ainda mais expostos; colocar serviços no bundle os entregaria a qualquer pessoa; e trocar o protocolo não muda a exposição nem a agregação, que é o problema real.'),
        mcq('q3', 'Qual afirmação sobre tRPC e OpenAPI está correta?', 'c', ['tRPC dispensa a validação de entrada no servidor, porque os tipos do TypeScript já garantem os dados recebidos de qualquer cliente', 'OpenAPI só funciona com GraphQL, e tRPC só com REST', 'tRPC compartilha tipos entre front e back em um projeto TypeScript; OpenAPI descreve uma API REST em um documento', 'Os dois fazem o servidor aceitar qualquer origem, sem precisar de CORS'], 'tRPC infere tipos de ponta a ponta quando os dois lados compartilham código TypeScript; OpenAPI é um documento de contrato independente de linguagem, bom para APIs com vários consumidores. Tipos desaparecem na execução, então a validação em tempo de execução continua necessária. As duas associações com GraphQL e REST estão trocadas e nenhum dos dois configura CORS por si.'),
        fill('q4', 'Complete o atributo do cookie de sessão que impede o JavaScript da página de lê-lo.', 'Set-Cookie: sessao=<ID-OPACO>; ___; Secure; SameSite=Lax', ['HttpOnly'], 'HttpOnly esconde o cookie de document.cookie, limitando o roubo de sessão em caso de XSS. Secure restringe ao HTTPS e SameSite limita o envio entre sites.'),
        mcq('q5', 'Uma equipe colocou a chave privada de um serviço de mapas em uma variável embutida no bundle do front-end "para facilitar". Qual o risco e a correção?', 'a', ['Qualquer visitante lê a chave no navegador; chamar o serviço pelo servidor (BFF) e revogar a chave exposta', 'Sem risco, porque o bundle é minificado e ninguém consegue ler', 'O risco é de desempenho, porque a chave aumenta o tamanho do bundle e atrasa o carregamento da primeira tela', 'A chave só pode ser lida se o usuário estiver logado; basta exigir login'], 'Tudo o que vai ao navegador é público; minificar não é proteção, e login não impede quem tem acesso ao bundle de ler a chave. A correção é fazer o servidor chamar o serviço e, como a chave já vazou, revogá-la e emitir outra. O problema é de segurança e custo de abuso, não de tamanho do arquivo.'),
        mcq('q6', 'Uma página SSR monta HTML com a concatenação "<p>" + comentario + "</p>", onde comentario vem de outro usuário. Qual é a falha e a correção?', 'c', ['SQL injection; trocar a montagem por uma consulta parametrizada no acesso ao banco', 'CSRF; adicionar SameSite ao cookie', 'XSS; escapar o texto com entidades HTML antes de inseri-lo', 'Falha de CORS; restringir a lista de origens permitidas'], 'Dado de usuário inserido em HTML sem escape pode virar script no navegador de quem visita a página: é XSS, evitado escapando conforme o contexto. Parametrização trata consultas ao banco, SameSite ajuda contra CSRF e CORS controla leitura de respostas entre origens; nenhum desses age sobre o HTML montado.'),
        mcq('q7', 'O front está em app.example.com e a API em api.example.com. O navegador bloqueia a leitura das respostas. Qual é a configuração mais segura?', 'b', ['Responder Access-Control-Allow-Origin com a origem que vier na requisição, qualquer que seja', 'Permitir explicitamente a origem https://app.example.com (e credenciais, se usar cookies) ou colocar um BFF na mesma origem do front', 'Desativar a política de mesma origem nas configurações do navegador de cada usuário', 'Enviar a requisição por um servidor público de terceiros que remove os cabeçalhos'], 'São origens diferentes (subdomínios distintos), então a API precisa autorizar uma lista explícita de origens; ou o BFF na mesma origem elimina o CORS. Refletir qualquer origem anula a proteção, não é possível nem sensato mexer no navegador dos usuários e passar tráfego por um intermediário público expõe dados e credenciais.'),
        fill('q8', 'Complete a entidade HTML que o escape usa para o caractere maior que (>).', 'texto.replace(/>/g, "&___;")', ['gt'], 'A entidade &gt; representa o sinal de maior; &lt; representa o de menor. Trocar esses caracteres impede que o navegador interprete o texto como marcação.')
      ]
    },
    {
      id: 'nji-12-sql-com-node',
      title: 'SQL com Node: drivers, pool e queries parametrizadas',
      goal: 'Acessar bancos relacionais com drivers, usar pool de conexões, escrever queries parametrizadas e mapear resultados com segurança.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Drivers',
            'Driver é a biblioteca que conversa com um banco específico, usando o protocolo dele. pg (também chamado node-postgres) fala com PostgreSQL; mysql2 com MySQL e MariaDB; para SQLite existem drivers como better-sqlite3 e, em versões recentes do Node, um módulo nativo (confira a documentação). Todos são pacotes de terceiros, exceto o módulo nativo; por isso os exemplos desta lição são ilustrativos, não executados aqui. SQL em si você aprende no curso de banco de dados do catálogo; aqui o foco é a ponte Node.'
          ),
          sl(
            'Pool de conexões',
            'Abrir uma conexão com o banco é lento e caro. Um pool mantém um número limitado de conexões abertas e as EMPRESTA às requisições. Sem pool, cada requisição abriria uma conexão nova (lento) e muitos usuários simultâneos esgotariam o banco. Configure um máximo (max) compatível com o limite do banco. Duas formas de usar: pool.query(...) pega e devolve a conexão sozinho; pool.connect() entrega um cliente que VOCÊ deve devolver com release(), de preferência em um bloco finally. Esquecer o release vaza conexões: depois de algumas requisições o pool fica vazio e a aplicação trava esperando.',
            'const { Pool } = require("pg");\nconst pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 10 });\n\nconst client = await pool.connect();\ntry {\n  const { rows } = await client.query("SELECT id, nome FROM usuarios WHERE id = $1", [id]);\n  return rows[0];\n} finally {\n  client.release();   // sempre devolve a conexão ao pool\n}'
          ),
          sl(
            'Queries parametrizadas: errado e certo',
            'Injeção de SQL ocorre quando texto do usuário é colado dentro do comando e o banco o interpreta como parte do SQL. ERRADO (vulnerável): pool.query(`SELECT * FROM usuarios WHERE email = \'${email}\'`). CERTO: o comando fica FIXO, com marcadores de posição ($1 no pg, ? no mysql2), e os valores seguem em uma lista separada. O banco recebe a estrutura e os valores por caminhos distintos, então o valor NUNCA é interpretado como SQL. Os mesmos conceitos aparecem no curso de Segurança Web (OWASP).',
            '// VULNERÁVEL: concatenação\nawait pool.query(`SELECT id FROM usuarios WHERE email = \'${email}\'`);\n\n// CORRIGIDO: parametrizada\nawait pool.query("SELECT id FROM usuarios WHERE email = $1", [email]);\n\n// mysql2 usa ?\n// await conn.execute("SELECT id FROM usuarios WHERE email = ?", [email]);'
          ),
          sl(
            'O que parâmetros NÃO resolvem',
            'Marcadores de posição substituem VALORES (texto, números, datas), não identificadores: nomes de tabela, de coluna e palavras como ASC/DESC não podem ser parâmetros. Se o usuário escolhe a coluna de ordenação, compare com uma LISTA PERMITIDA e monte o SQL só com o item aprovado (veja a última lição desta parte sobre ordenação segura). Também não monte listas IN concatenando: gere uma lista de marcadores ($1, $2, $3) conforme o tamanho, ou use funções do driver/query builder.'
          ),
          sl(
            'Query builders e mapeamento',
            'Query builder (Knex, por nome) monta SQL por código encadeável (db("usuarios").where({ id }).first()), gera consultas parametrizadas e ajuda a compor filtros dinâmicos, sem esconder o SQL como um ORM (próximas lições). Você ainda precisa entender o SQL gerado. Sobre o resultado: o driver devolve linhas como objetos; atenção a diferenças de nomes (snake_case no banco, camelCase no JavaScript), a tipos que o driver devolve como texto (inteiros muito grandes, decimais) e a datas. Selecione apenas as colunas necessárias: SELECT * pode expor por engano um campo como senha_hash na resposta e viola a minimização de dados da LGPD (coletar e expor só o necessário).'
          ),
          sl(
            'Erros comuns',
            'Concatenar valores no SQL; não devolver conexões ao pool; abrir um Pool novo a cada requisição (crie UM pool por aplicação e reutilize); fazer consultas dentro de um laço (um problema de desempenho chamado N+1, tratado na lição de ORMs); devolver ao cliente a mensagem de erro do banco (revela tabelas e colunas: responda com mensagem genérica e registre o detalhe internamente); guardar a string de conexão com a senha no código em vez de variável de ambiente.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a função de um pool de conexões?', 'a', [
          'Reaproveitar um número limitado de conexões abertas, evitando abrir uma nova a cada requisição',
          'Criptografar as consultas SQL antes de enviá-las ao servidor do banco de dados',
          'Guardar em memória o resultado de todas as consultas já feitas para entregá-lo mais rápido, já que o próprio Node cuida desse detalhe por baixo',
          'Dividir uma consulta grande em várias partes executadas em threads separadas'
        ], 'O pool empresta conexões já abertas e limita o total. Não criptografa, não faz cache de resultados nem divide consultas.'),
        mcq('q2', 'Qual das opções transforma uma consulta vulnerável em segura?', 'c', [
          'Colocar o email entre aspas duplas dentro do texto do comando SQL',
          'Aplicar toLowerCase() no email antes de concatená-lo ao comando',
          'Manter o SQL fixo com $1 e enviar o email em uma lista de parâmetros separada',
          'Executar a consulta duas vezes e comparar os resultados antes de usá-los'
        ], 'Com marcador e valor separados, o banco nunca interpreta o valor como SQL. Aspas, caixa baixa ou repetir a consulta não impedem a injeção.'),
        mcq('q3', 'Por que uma query parametrizada protege contra injeção de SQL?', 'd', [
          'Porque o driver remove da entrada todas as palavras reservadas do SQL antes de enviá-la, sem necessidade de nenhuma configuração adicional',
          'Porque o banco só aceita consultas que já foram executadas antes pelo mesmo usuário',
          'Porque os parâmetros são criptografados e o banco os trata como dados inalteráveis',
          'Porque a estrutura do SQL e os valores seguem separados e o valor não é interpretado como código'
        ], 'A separação entre comando e dados é o mecanismo de proteção. O driver não "filtra palavras" e não há criptografia nem histórico envolvido.'),
        fill('q4', 'Complete o marcador de posição do primeiro parâmetro no driver pg.', 'pool.query("SELECT nome FROM usuarios WHERE id = ___", [id]);', ['$1'], 'O pg usa marcadores numerados ($1, $2...); o mysql2 usa ?.'),
        mcq('q5', 'Uma rota usa pool.connect() mas esquece de chamar client.release() em alguns caminhos. O que acontece com o tempo?', 'b', [
          'O banco fecha as conexões abandonadas imediatamente e o erro passa despercebido',
          'O pool esgota suas conexões e novas requisições ficam esperando indefinidamente',
          'As consultas passam a ser executadas duas vezes por causa das conexões duplicadas',
          'O Node reinicia o processo automaticamente ao detectar o vazamento'
        ], 'Conexões não devolvidas ficam ocupadas; ao acabarem, as requisições seguintes travam. Use try/finally com release.'),
        mcq('q6', 'O usuário escolhe por qual coluna a lista será ordenada. Parâmetros ($1) resolvem a ordenação?', 'c', [
          'Sim, qualquer parte do SQL pode ser substituída por um parâmetro com o mesmo efeito',
          'Sim, desde que o nome da coluna seja convertido para maiúsculas antes do envio',
          'Não: parâmetros são só para valores; use uma lista permitida de colunas e monte o SQL com o item aprovado',
          'Não: o banco não permite ordenar por parâmetros, então a ordenação deve ser feita no cliente'
        ], 'Identificadores (colunas, tabelas) não aceitam parâmetros. A alternativa segura é comparar com uma lista de colunas permitidas.'),
        mcq('q7', 'Qual prática reduz o risco de expor dados sensíveis por engano na resposta de uma API?', 'd', [
          'Usar SELECT * para ter os dados disponíveis e filtrar depois no front-end',
          'Devolver a linha completa do banco e ocultar os campos na interface',
          'Converter os campos sensíveis para base64 antes de enviá-los ao navegador',
          'Selecionar as colunas necessárias para aquela resposta'
        ], 'Selecionar só o necessário evita vazar campos como senha_hash e atende à minimização. Ocultar na interface não impede a exposição, e base64 não protege.'),
        fill('q8', 'Complete o método que devolve a conexão ao pool.', 'client.___();', ['release'], 'client.release() devolve a conexão emprestada; faça-o em finally.')
      ]
    },
    {
      id: 'nji-13-migrations-e-seeds',
      title: 'Migrations e seeds',
      goal: 'Versionar mudanças de schema com migrações, usar seeds só com dados fictícios e alterar o banco sem derrubar o serviço.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O problema: o schema muda',
            'O schema é a estrutura do banco (tabelas, colunas, índices, restrições). Ele muda ao longo do projeto: nova coluna, nova tabela, novo índice. Se cada pessoa altera o banco "na mão", o banco de uma colega, o de testes e o de produção ficam diferentes e o código quebra em algum deles. Precisamos tratar a estrutura do banco como CÓDIGO: escrita em arquivos, revisada, versionada no Git e aplicada igual em todos os ambientes.'
          ),
          sl(
            'Migrações versionadas',
            'Migração é um arquivo que descreve UMA mudança de schema, com nome ordenável (número ou data, como 001-cria-usuarios). Uma ferramenta (Knex migrate, Prisma Migrate, node-pg-migrate, Flyway, por nome; ilustrativo, não executado aqui) mantém uma tabela de controle com as migrações já aplicadas e roda só as pendentes, na ordem. Assim, um banco novo chega ao estado atual aplicando tudo em sequência, e um banco antigo aplica só o que falta. A ideia, simulada abaixo com um mini executor que roda de verdade só com Node:',
            'aplicando 001-cria-usuarios\n  criando tabela usuarios\naplicando 002-cria-pedidos\n  criando tabela pedidos\nnada a aplicar        // segunda execução: nenhuma pendente\n\n// (saída real do mini executor; as migrações foram declaradas fora de ordem\n//  e o executor as ordenou pelo nome)\n\n-- exemplo de migração SQL (ilustrativo)\nCREATE TABLE usuarios (\n  id BIGSERIAL PRIMARY KEY,\n  email TEXT NOT NULL UNIQUE,\n  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()\n);'
          ),
          sl(
            'Ordem, rollback e regra de ouro',
            'A ordem importa: a migração que cria a tabela de pedidos precisa vir depois da que cria usuários, se houver chave estrangeira entre elas. Rollback (reversão) desfaz uma migração: muitas ferramentas pedem uma parte "up" (aplicar) e uma "down" (desfazer). Cuidado: nem tudo é reversível. Reverter um DROP COLUMN não traz os dados de volta; por isso há backup antes de mudanças destrutivas e, em produção, é comum "corrigir para frente" com uma nova migração. REGRA DE OURO: nunca edite uma migração que já foi aplicada em outro ambiente; crie outra. Editar o passado faz os ambientes divergirem sem a ferramenta perceber.'
          ),
          sl(
            'Seeds com dados fictícios',
            'Seed é um script que insere dados iniciais. Há dois tipos: dados de referência necessários ao sistema (lista de países, papéis de acesso) e dados de DESENVOLVIMENTO para testar a interface. Seeds de desenvolvimento usam APENAS dados fictícios (usuario1@example.com, nomes inventados). Nunca copie o banco de produção para o computador de desenvolvimento: são dados pessoais reais de pessoas, sujeitos à LGPD (esta lição não substitui orientação jurídica). Se precisar de volume realista, gere dados sintéticos ou anonimize. Escreva seeds idempotentes (rodar duas vezes não duplica registros) e nunca inclua senhas reais ou segredos no código.'
          ),
          sl(
            'Ambientes e credenciais',
            'Cada ambiente (desenvolvimento, testes, homologação/staging, produção) tem o seu banco e a sua conexão, lida de variáveis de ambiente. As MESMAS migrações rodam em todos, na mesma ordem. Em produção a migração costuma rodar durante o deploy, com um usuário de banco cuja permissão de alterar schema é separada da usuária que a aplicação usa no dia a dia (a aplicação não precisa poder apagar tabelas). Teste a migração antes em uma cópia sem dados pessoais.'
          ),
          sl(
            'Mudar sem derrubar o serviço',
            'Comandos que travam uma tabela grande enquanto rodam derrubam a aplicação na prática. A técnica é expandir e contrair. 1) Expandir: adicione a nova coluna como opcional (aceitando nulo). 2) Publique código que escreve nos dois formatos. 3) Preencha os dados antigos em LOTES pequenos. 4) Troque a leitura para a coluna nova. 5) Só depois imponha NOT NULL e remova a antiga. Para índices em tabelas grandes, o PostgreSQL permite CREATE INDEX CONCURRENTLY, que evita bloquear as escritas (confira a documentação do seu banco). Evite renomear coluna em uso de uma vez: o código antigo ainda a procura.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a principal vantagem de usar migrações versionadas em vez de alterar o banco manualmente?', 'b', [
          'Elas deixam o banco mais rápido, pois o motor otimiza os comandos que vêm de arquivos',
          'Os ambientes chegam ao mesmo schema pela mesma sequência, revisável no Git',
          'Elas dispensam backups, pois toda mudança pode ser revertida sem perda de dados',
          'Elas permitem que a aplicação altere tabelas livremente em produção sem permissões especiais'
        ], 'Migrações tornam a mudança reproduzível, ordenada e revisável. Não aceleram o banco, não substituem backup e não dispensam permissões.'),
        mcq('q2', 'Uma migração já foi aplicada em produção e você percebe que esqueceu um índice. Qual a atitude correta?', 'a', [
          'Criar uma nova migração que adiciona o índice',
          'Editar a migração original e reaplicá-la nos ambientes',
          'Criar o índice manualmente em produção e não registrar nada no repositório',
          'Apagar a tabela de controle para a ferramenta aplicar tudo de novo'
        ], 'Migrações aplicadas são histórico: o ajuste vem em uma migração nova. Editar o passado ou mexer na tabela de controle faz os ambientes divergirem ou refazem trabalho perigosamente.'),
        mcq('q3', 'Para que serve a tabela de controle mantida pela ferramenta de migração?', 'c', [
          'Guardar uma cópia dos dados dos usuários para o caso de uma reversão',
          'Registrar quais usuários da aplicação têm permissão para executar migrações, o que costuma ser suficiente para a maioria das aplicações',
          'Registrar quais migrações já foram aplicadas, para rodar as pendentes',
          'Armazenar as senhas de conexão de cada ambiente de forma criptografada'
        ], 'A tabela de controle é o histórico do que foi aplicado naquele banco. Não guarda dados de usuários, permissões nem credenciais.'),
        fill('q4', 'Complete o comando que desfaz a última migração aplicada (reversão).', '// desfazer a última migração\nknex migrate:___', ['rollback'], 'Rollback é a reversão de migrações; lembre que nem toda mudança destrutiva é reversível sem backup.'),
        mcq('q5', 'A equipe precisa de dados realistas para testar a tela de relatórios. Qual é a melhor prática?', 'd', [
          'Copiar o banco de produção para o computador de cada pessoa da equipe',
          'Pedir que cada pessoa insira contatos reais de amigos para dar realismo',
          'Usar a produção diretamente para testar, desde que as consultas sejam de leitura',
          'Gerar dados fictícios ou sintéticos com um seed, sem pessoas reais'
        ], 'Dados de produção contêm dados pessoais reais, o que amplia o risco e as obrigações da LGPD. Seeds fictícios dão volume sem expor ninguém.'),
        mcq('q6', 'Você precisa adicionar uma coluna obrigatória (NOT NULL) a uma tabela enorme em produção, sem parar o serviço. Qual abordagem é mais segura?', 'a', [
          'Adicionar a coluna opcional, preencher os dados em lotes e só depois impor o NOT NULL',
          'Adicionar a coluna já como NOT NULL, aceitando que o serviço fique indisponível por um tempo',
          'Apagar a tabela, recriá-la com a coluna nova e importar os dados novamente',
          'Alterar o banco primeiro e só depois descobrir se o código antigo continua funcionando'
        ], 'Expandir e contrair evita bloqueios longos e mantém o código antigo funcionando durante a transição.'),
        mcq('q7', 'Por que uma migração que remove uma coluna exige cuidado especial no rollback?', 'b', [
          'Porque o rollback de remoções é bloqueado pelo banco de dados',
          'Porque reverter recria a estrutura, mas os dados que estavam na coluna já foram perdidos',
          'Porque a ferramenta de migração não consegue executar comandos DROP',
          'Porque o rollback altera a ordem das demais migrações já aplicadas'
        ], 'Desfazer um DROP COLUMN recria a coluna vazia: o conteúdo só volta com backup. Por isso mudanças destrutivas pedem planejamento.'),
        fill('q8', 'Complete a palavra do PostgreSQL que cria um índice sem bloquear as escritas na tabela.', 'CREATE INDEX ___ idx_pedidos_cliente ON pedidos (cliente_id);', ['CONCURRENTLY'], 'CREATE INDEX CONCURRENTLY evita bloquear escritas durante a criação, ao custo de levar mais tempo.')
      ]
    },
    {
      id: 'nji-14-orms-prisma-drizzle-typeorm',
      title: 'ORMs: Prisma, Drizzle e TypeORM',
      goal: 'Entender o que um ORM faz, seus prós e contras, o problema N+1, quando preferir SQL puro e os riscos de segurança das raw queries.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é um ORM',
            'ORM (Object-Relational Mapping, mapeamento objeto-relacional) é uma biblioteca que representa as TABELAS do banco como modelos no seu código e gera o SQL por você: em vez de escrever INSERT, você chama algo como usuario.create({...}). Exemplos por nome: Prisma, Drizzle, TypeORM e Sequelize; todos de terceiros, então os trechos desta lição são ilustrativos, não executados aqui. Vários também gerenciam migrações e geram tipos TypeScript a partir do schema, ligando esta lição à primeira do nível.'
          ),
          sl(
            'Prós e contras',
            'Prós: produtividade em operações comuns (CRUD: criar, ler, atualizar, apagar); consultas parametrizadas por padrão, reduzindo injeção de SQL; tipos e autocompletar; menos código repetido; migrações integradas. Contras: a abstração "vaza" quando a consulta fica complexa; o SQL gerado pode ser ineficiente e você precisa saber olhá-lo; curva de aprendizado de cada ferramenta; risco de esconder custos (veja N+1). Estilos diferem: o Prisma usa um arquivo de schema próprio e um cliente gerado; o Drizzle fica mais próximo do SQL, definindo tabelas em TypeScript; o TypeORM usa classes e decorators. Escolha pela equipe e pelo caso, conferindo a documentação atual.'
          ),
          sl(
            'O problema N+1 (execução real simulada)',
            'N+1 é o problema de desempenho em que você faz 1 consulta para buscar uma lista e depois 1 consulta EXTRA para cada item (por exemplo, o cliente de cada pedido). Com 50 pedidos são 51 consultas. É comum com ORMs porque acessar uma relação em um laço parece inocente. Correção: carregar a relação junto (join ou o recurso de include/relations do ORM) ou buscar os clientes em LOTE com uma consulta WHERE id IN (...). A simulação abaixo usa só Node e conta consultas de verdade:',
            'for (const p of lista) p.cliente = await buscarCliente(p.clienteId);\nconsole.log("N+1:", consultas, "consultas");\n// N+1: 51 consultas\n\nconst cs = await buscarClientes([...new Set(lista.map((p) => p.clienteId))]);\nconsole.log("em lote:", consultas, "consultas");\n// em lote: 2 consultas'
          ),
          sl(
            'Modelagem e restrições',
            'Modelar é decidir tabelas e relações: um para muitos (um cliente tem muitos pedidos, com chave estrangeira em pedidos), muitos para muitos (pedidos e produtos, com tabela intermediária). Garanta as regras NO BANCO (unique, not null, chave estrangeira, check), não só no código: o código pode ter bugs ou outro programa pode escrever no banco. Crie índices para as colunas usadas em filtros e junções. O ORM facilita descrever isso, mas a responsabilidade pela modelagem correta continua sua.'
          ),
          sl(
            'Quando usar SQL puro',
            'Relatórios com agregações complexas, funções de janela, consultas muito sensíveis a desempenho, ou operações específicas do banco costumam ficar melhores em SQL escrito à mão. Isso não exclui o ORM: todos oferecem uma forma de executar consulta crua (raw) e você mistura os dois. Bom critério: ORM para o dia a dia, SQL para o que o ORM expressa mal, sempre olhando o SQL real gerado (logs de consulta em desenvolvimento) para detectar surpresas.'
          ),
          sl(
            'Segurança: raw queries e mass assignment',
            'Raw queries reabrem a porta da injeção de SQL se você concatenar texto do usuário. Contraexemplo vulnerável: montar a string da consulta com `${nome}` e entregá-la à função "insegura" de execução crua. Correção: use a forma PARAMETRIZADA da raw query do ORM (valores passados como parâmetros ou template tag própria, nunca concatenados). O segundo risco é o mass assignment: passar req.body inteiro a create ou update permite que o cliente defina campos como papel ou preço. Escolha os campos explicitamente e use select para devolver só o que é necessário.',
            '// VULNERÁVEL (ilustrativo): concatenação em raw query\nawait orm.rawUnsafe(`SELECT * FROM usuarios WHERE nome = \'${nome}\'`);\n\n// CORRIGIDO: raw parametrizada\nawait orm.raw("SELECT id, nome FROM usuarios WHERE nome = $1", [nome]);\n\n// mass assignment: escolha os campos\nawait orm.usuario.create({ data: { nome: req.dados.nome, email: req.dados.email } });'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que faz, em essência, um ORM?', 'c', [
          'Substitui o banco de dados por arquivos JSON guardados em memória pelo Node',
          'Criptografa as colunas do banco de dados de forma transparente para a aplicação',
          'Representa tabelas como modelos no código e gera o SQL correspondente',
          'Distribui as consultas entre vários servidores de banco para aumentar a velocidade'
        ], 'O ORM mapeia tabelas em objetos e gera SQL. Ele não troca o banco, não criptografa colunas por padrão e não distribui consultas.'),
        mcq('q2', 'Uma tela lista 50 pedidos e, em um laço, busca o cliente de cada pedido com uma consulta separada. Quantas consultas ocorrem no total?', 'd', [
          '1, pois o ORM junta tudo automaticamente em uma única consulta',
          '2, uma para pedidos e outra para os clientes de uma vez',
          '50, uma para cada cliente, sem contar a lista de pedidos',
          '51, a da lista mais uma por pedido'
        ], 'É o N+1: 1 consulta da lista + 50 de clientes = 51. A execução simulada da lição mostrou exatamente esse número.'),
        mcq('q3', 'Qual é uma correção adequada para o N+1?', 'b', [
          'Aumentar o tamanho do pool de conexões para que as consultas rodem mais depressa, e isso dispensa qualquer verificação posterior no código',
          'Carregar a relação junto (join/include) ou buscar os clientes em lote com WHERE id IN',
          'Mover o laço para o front-end para que o navegador faça as consultas',
          'Guardar o resultado em base64 para reduzir o tamanho da resposta'
        ], 'O problema é a quantidade de consultas, resolvida por join ou carga em lote. Um pool maior só deixa o problema mais caro e o front-end não resolve.'),
        fill('q4', 'Complete o nome do problema em que 1 consulta de lista gera uma consulta extra por item: o problema N + ___.', 'problema: N+___', ['1'], 'N+1 resume a situação: uma consulta mais N consultas adicionais.'),
        mcq('q5', 'Em qual situação costuma ser melhor escrever SQL cru em vez de usar só o ORM?', 'a', [
          'Em um relatório com agregações complexas e requisito de desempenho',
          'Em um cadastro simples de usuários com três campos de texto',
          'Em uma busca por id em uma tabela pequena e já indexada',
          'Em qualquer consulta, pois o SQL cru é mais seguro que o ORM'
        ], 'Consultas complexas e sensíveis a desempenho se beneficiam de SQL escrito à mão. CRUD simples é o forte do ORM, e SQL cru concatenado é justamente o risco.'),
        mcq('q6', 'Uma rota monta a raw query concatenando o nome informado pelo usuário. Qual é a correção?', 'd', [
          'Converter o nome para minúsculas antes de concatená-lo na string da consulta',
          'Trocar o ORM por outro com nome diferente, mantendo a concatenação',
          'Remover as aspas do nome informado e deixar o restante como está',
          'Usar a forma parametrizada da raw query, passando o nome como parâmetro'
        ], 'Só a separação entre comando e valor impede a injeção. Mudar a caixa, o ORM ou remover aspas não elimina o problema.'),
        mcq('q7', 'O que há de errado em orm.usuario.create({ data: req.body })?', 'c', [
          'Nada: o ORM filtra automaticamente os campos que o cliente não deveria enviar',
          'O create só aceita arrays e vai falhar com qualquer objeto vindo do corpo',
          'Permite mass assignment: o cliente pode enviar campos como papel; escolha os campos explicitamente',
          'O corpo da requisição é texto puro e precisa ser convertido para base64 antes'
        ], 'Passar o corpo inteiro deixa o cliente controlar colunas sensíveis. A defesa é uma lista explícita de campos permitidos.'),
        fill('q8', 'Complete a sigla ORM: Object-___ Mapping.', 'ORM = Object-___ Mapping', ['Relational', 'Relacional'], 'ORM significa mapeamento objeto-relacional (Object-Relational Mapping).')
      ]
    },
    {
      id: 'nji-15-mongodb-e-mongoose',
      title: 'MongoDB e Mongoose',
      goal: 'Entender o modelo de documentos, quando ele faz sentido, schemas e índices no Mongoose e como evitar injeção NoSQL por operadores vindos do corpo.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Modelo de documentos',
            'O MongoDB é um banco NoSQL orientado a DOCUMENTOS: em vez de linhas em tabelas, guarda documentos parecidos com JSON dentro de coleções. Cada documento pode ter campos aninhados e listas, e documentos da mesma coleção podem ter formatos um pouco diferentes (esquema flexível). Um pedido pode guardar seus itens DENTRO dele, em vez de em outra tabela ligada por chave estrangeira. Também é possível referenciar outro documento pelo id, quando o dado é compartilhado ou cresce sem limite. Os exemplos são ilustrativos, não executados aqui (dependem do MongoDB e do pacote Mongoose).'
          ),
          sl(
            'Quando faz sentido',
            'Combina com dados hierárquicos lidos juntos (um pedido e seus itens, um artigo com comentários limitados), formatos que variam de um registro para outro e leitura de um agregado inteiro em uma só operação. Combina mal com muitas relações entre entidades, junções frequentes e regras de integridade fortes, em que um banco relacional (lições anteriores) costuma servir melhor. "NoSQL" não significa "mais rápido" nem "sem modelagem": você ainda precisa modelar pensando em como os dados serão consultados.'
          ),
          sl(
            'Mongoose: schemas e modelos',
            'Mongoose (por nome) é um ODM (Object-Document Mapping), o equivalente a um ORM para documentos. Você define um Schema com os campos, tipos e validações e cria um modelo a partir dele. Por padrão ele opera em modo estrito: campos que NÃO estão no schema são descartados ao salvar. Isso devolve parte da disciplina que o MongoDB sozinho não impõe.',
            'const usuarioSchema = new mongoose.Schema({\n  nome:  { type: String, required: true, maxlength: 100 },\n  email: { type: String, required: true, unique: true },\n  papel: { type: String, enum: ["usuario", "admin"], default: "usuario" },\n  criadoEm: { type: Date, default: Date.now }\n});\nconst Usuario = mongoose.model("Usuario", usuarioSchema);'
          ),
          sl(
            'Índices',
            'Sem índice, consultar por um campo obriga o banco a varrer a coleção inteira (collection scan), o que fica lento quando ela cresce. Um índice é uma estrutura auxiliar que acelera buscas por aquele campo. Um índice unique também garante que não haja dois documentos com o mesmo valor (como o e-mail) mesmo se duas requisições chegarem juntas, algo que a verificação "existe? então não crie" feita no código não garante. Índices ocupam espaço e deixam as escritas um pouco mais lentas: crie para as consultas reais. Há também índices TTL, que apagam documentos expirados sozinhos (úteis para retenção mínima de dados, boa prática de LGPD).'
          ),
          sl(
            'Injeção NoSQL por operadores',
            'No MongoDB, filtros são objetos e alguns campos especiais são OPERADORES (como $ne, "diferente de", e $gt, "maior que"). Se o código repassa ao filtro valores vindos do corpo da requisição sem verificar o tipo, o cliente pode mandar um OBJETO com operador no lugar de um texto, mudando o significado da consulta (por exemplo, fazer o login casar com qualquer usuário). Isso é injeção NoSQL (veja o curso de Segurança Web). Contraexemplo vulnerável e correção:',
            '// VULNERÁVEL: repassa o corpo direto ao filtro\nconst u = await Usuario.findOne({ email: req.body.email, senha: req.body.senha });\n\n// CORRIGIDO: valida o tipo, busca só por e-mail e compara o hash da senha\nconst { email, senha } = req.body;\nif (typeof email !== "string" || typeof senha !== "string") {\n  return res.status(400).json({ erro: "dados inválidos" });\n}\nconst u = await Usuario.findOne({ email });\nconst ok = u && (await verificarHash(senha, u.senhaHash)); // scrypt/argon2/bcrypt'
          ),
          sl(
            'Como sanitizar e outros erros',
            'Defesas combinadas: validar com esquema que cada campo é do tipo esperado (string, número); nunca passar req.body, req.query ou req.params direto a filtros; usar as opções de sanitização do Mongoose ou pacotes de sanitização (por nome) que removem chaves iniciadas por $ do corpo; e nunca comparar senha dentro da consulta (guarde só o hash e compare no código). Outros erros: deixar documentos crescerem sem limite (há teto de tamanho por documento); esquecer índices; guardar senha em texto; expor o banco na internet sem autenticação; devolver o documento inteiro, incluindo campos internos, em vez de selecionar os campos necessários.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual dado combina melhor com o modelo de documentos?', 'd', [
          'Contas bancárias com transferências entre muitas contas e regras fortes de integridade',
          'Dados totalmente tabulares, com junções frequentes entre muitas tabelas pequenas',
          'Registros que precisam de chave estrangeira obrigatória entre todas as coleções',
          'Um pedido com seus itens, lidos em conjunto e com formato que pode variar'
        ], 'Agregados lidos juntos (pedido com itens) são o caso clássico. Integridade forte e muitas junções favorecem o modelo relacional.'),
        mcq('q2', 'Como ocorre uma injeção NoSQL por operadores no MongoDB?', 'a', [
          'O cliente envia um objeto com operador (como $ne) no lugar de texto e o código o repassa ao filtro',
          'O cliente envia um arquivo muito grande e a coleção ultrapassa o limite de documentos, conforme o comportamento padrão das versões mais antigas',
          'O cliente cria um índice nas coleções do servidor por meio de um parâmetro de URL',
          'O cliente altera o schema do Mongoose pelo cabeçalho da requisição'
        ], 'O filtro é um objeto; se um valor vindo do corpo for repassado sem checar o tipo, um objeto com operador altera a consulta.'),
        mcq('q3', 'Qual é uma defesa adequada contra esse tipo de injeção?', 'c', [
          'Aumentar o tempo de resposta do servidor para dificultar tentativas repetidas',
          'Converter todo o corpo da requisição para minúsculas antes da consulta',
          'Validar que cada campo é do tipo esperado (string, por exemplo) antes de montar o filtro',
          'Ativar HTTPS, pois a criptografia da conexão impede que operadores sejam enviados'
        ], 'A validação de tipo impede que um objeto chegue ao filtro. HTTPS protege o trânsito, mas o ataque vem pelo canal normal.'),
        fill('q4', 'Complete a opção do Mongoose que impede dois documentos com o mesmo e-mail.', 'email: { type: String, ___: true }', ['unique'], 'unique cria um índice único; o banco rejeita a duplicidade mesmo com requisições simultâneas.'),
        mcq('q5', 'Uma coleção cresce muito e a busca por email fica lenta. Qual é a causa mais provável?', 'b', [
          'O Mongoose limita a velocidade das consultas ao usar schemas com validação',
          'Não há índice no campo email, então o banco varre a coleção inteira',
          'O MongoDB é mais lento que bancos relacionais com grandes volumes',
          'O campo email foi declarado como String em vez de Buffer'
        ], 'Sem índice a consulta vira varredura completa. O índice (unique, no caso do e-mail) resolve a velocidade e a unicidade.'),
        mcq('q6', 'No modo estrito do Mongoose, o que acontece com um campo enviado que não existe no schema?', 'a', [
          'É descartado e não é salvo no documento',
          'É salvo normalmente, pois o MongoDB não tem esquema',
          'Faz o Mongoose derrubar a conexão com o banco por segurança',
          'É convertido automaticamente para o tipo String e salvo'
        ], 'O strict descarta campos fora do schema, reduzindo o risco de gravar dados inesperados, embora não substitua a validação.'),
        mcq('q7', 'Qual abordagem de login é a correta ao usar Mongoose?', 'd', [
          'findOne({ email, senha }) comparando a senha em texto na própria consulta',
          'findOne com o corpo inteiro como filtro, para aceitar vários campos de login',
          'Guardar a senha em base64 e comparar a string na consulta',
          'Validar os tipos, buscar só pelo e-mail e comparar o hash da senha no código'
        ], 'Senha nunca deve ser comparada em texto nem entrar no filtro: busque pelo e-mail e verifique o hash lento (scrypt, argon2, bcrypt).'),
        fill('q8', 'Complete o nome do objeto do Mongoose que descreve campos, tipos e validações.', 'const usuarioSchema = new mongoose.___({ nome: String });', ['Schema'], 'mongoose.Schema define a estrutura e as validações; o modelo é criado a partir dele.')
      ]
    },
    {
      id: 'nji-16-redis-e-cache',
      title: 'Redis e cache',
      goal: 'Usar Redis como armazenamento chave-valor com TTL, aplicar o padrão cache-aside, pensar em invalidação e proteger dados pessoais no cache.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é o Redis',
            'Redis (por nome) é um banco de dados em MEMÓRIA do tipo chave-valor: você guarda um valor sob uma chave (SET sessao:abc "dados") e o lê pela chave (GET sessao:abc). Por ficar na memória é extremamente rápido, e oferece estruturas além de texto: hashes, listas, conjuntos e conjuntos ordenados. Pode gravar em disco de forma opcional, mas seu uso típico é de apoio (cache, sessões, contadores), não de fonte única de verdade. Clientes para Node, como ioredis ou node-redis (por nome), são ilustrativos aqui, não executados.'
          ),
          sl(
            'TTL: tempo de vida',
            'TTL (time to live, tempo de vida) é o prazo depois do qual uma chave é APAGADA sozinha. Em Redis: SET chave valor EX 60 guarda por 60 segundos (EX = segundos). TTL é a ferramenta básica contra dado velho e contra memória que cresce sem parar: todo item de cache deve ter um. Para dados pessoais ele também ajuda a cumprir a ideia de retenção mínima: o dado não fica guardado além do necessário.'
          ),
          sl(
            'Cache-aside (execução real da ideia)',
            'Cache é uma cópia rápida de um dado caro de obter. No padrão cache-aside, a aplicação decide: 1) procura no cache; 2) se achou (cache hit), devolve; 3) se não achou (cache miss), busca no banco, grava no cache com TTL e devolve. O exemplo usa um Map com validade no lugar do Redis (para rodar só com Node) e conta as consultas ao banco: três leituras seguidas fizeram 1 consulta; depois do TTL expirar, foram 2.',
            'async function obter(id, ttlMs = 1000) {\n  const hit = cache.get(id);\n  if (hit && hit.expira > Date.now()) return hit.valor;   // hit\n  const valor = await buscarNoBanco(id);                  // miss\n  cache.set(id, { valor, expira: Date.now() + ttlMs });\n  return valor;\n}\n// saída real:\n// consultas ao banco: 1\n// após expirar: 2'
          ),
          sl(
            'Invalidação',
            'Invalidar é remover ou atualizar o cache quando o dado original muda; sem isso os usuários veem informação velha. Estratégias: ao atualizar no banco, APAGAR a chave do cache (a próxima leitura repopula); TTL curto como rede de segurança; nomes de chave organizados (usuario:42:perfil) para achar o que apagar. Cuidado com o cache stampede: quando uma chave popular expira, muitas requisições batem no banco ao mesmo tempo; mitigue com TTL com variação aleatória ou com uma trava para que só uma requisição repovoe. Invalidação é a parte difícil do cache: cacheie só o que compensa.'
          ),
          sl(
            'Sessões, contadores e filas leves',
            'Sessões: guardar a sessão no Redis (em vez da memória do processo) permite que várias instâncias da aplicação a compartilhem, resolvendo o problema visto na lição de cluster; o identificador da sessão deve ser aleatório e longo, com TTL. Contadores com TTL implementam limite de requisições por minuto. Filas leves: listas do Redis (e bibliotecas como BullMQ, por nome) enfileiram tarefas em segundo plano, como enviar e-mails. Para filas críticas, avalie sistemas próprios de mensageria (veja o curso de Computação Distribuída).'
          ),
          sl(
            'Dados pessoais e segurança do cache',
            'O cache é uma segunda cópia dos dados, com os mesmos deveres de proteção. Boas práticas (visão geral; não substitui orientação jurídica): não cacheie dados sensíveis sem necessidade; TTL curto; não use e-mail, CPF ou outros dados pessoais NA CHAVE (chaves aparecem em logs e comandos): prefira ids opacos; apague do cache quando o titular pedir exclusão. ERRO GRAVE: cachear a resposta de uma rota autenticada com uma chave que não identifica o usuário (por exemplo, só o caminho /perfil): o segundo usuário recebe os dados do primeiro. Inclua o usuário na chave ou não cacheie. Proteja o próprio Redis: exija senha/autenticação, use TLS quando sair da máquina e NUNCA o exponha à internet.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a ordem correta do padrão cache-aside em uma leitura?', 'a', [
          'Consultar o cache; se não houver, buscar no banco, gravar no cache com TTL e devolver',
          'Consultar o banco primeiro e usar o cache só quando o banco falhar, já que o próprio Node cuida desse detalhe por baixo',
          'Gravar no cache antes de consultar o banco e devolver o valor do cache',
          'Apagar o cache a cada leitura e repopulá-lo com o resultado do banco'
        ], 'Cache-aside: tenta o cache; no miss, busca na fonte, popula com TTL e devolve. As demais ordens perdem o ganho do cache ou entregam dado incorreto.'),
        mcq('q2', 'O que é o TTL de uma chave no Redis?', 'b', [
          'O tamanho máximo, em bytes, que o valor pode ocupar na memória',
          'O prazo após o qual a chave é apagada automaticamente',
          'O número de vezes que a chave pode ser lida antes de ser removida',
          'A prioridade da chave em relação às outras na hora da gravação em disco'
        ], 'TTL é o tempo de vida: ao vencer, a chave some sozinha. Não limita tamanho, leituras nem prioridade.'),
        mcq('q3', 'Uma rota /perfil devolve dados do usuário logado e a resposta é cacheada com a chave "/perfil". Qual é o problema?', 'd', [
          'Risco algum: o cache separa os dados por usuário sem configuração adicional',
          'O Redis recusa chaves que começam com barra e a rota passa a retornar erro',
          'A resposta ficaria grande demais para a memória do Redis em poucos acessos',
          'Um usuário pode receber os dados de outro; a chave precisa identificar o usuário, ou a rota não deve ser cacheada'
        ], 'Chave sem o usuário faz todos compartilharem a mesma entrada: vazamento de dados pessoais. Inclua um identificador do usuário ou não cacheie.'),
        fill('q4', 'Complete a opção do comando SET do Redis que define o tempo de vida em segundos.', 'await redis.set("chave", "valor", "___", 60);', ['EX'], 'EX define a expiração em segundos; PX seria em milissegundos.'),
        mcq('q5', 'Depois de atualizar o nome de um usuário no banco, o que fazer com a entrada de cache dele?', 'c', [
          'Nada: o TTL resolverá o problema e é aceitável servir o nome antigo até lá em qualquer caso',
          'Duplicar a entrada em uma chave nova e manter a antiga sem expiração',
          'Apagar (ou atualizar) a chave do cache e manter um TTL como rede de segurança',
          'Reiniciar o servidor Redis para que ele recarregue os dados do banco'
        ], 'Invalidar na escrita evita dado velho; o TTL cobre falhas. Reiniciar o Redis é desproporcional e perde todo o cache.'),
        mcq('q6', 'Por que guardar sessões no Redis ajuda quando a aplicação roda em várias instâncias?', 'b', [
          'Porque o Redis impede que o usuário abra sessões em mais de um navegador',
          'Porque as instâncias compartilham o mesmo armazenamento, e qualquer uma encontra a sessão',
          'Porque a memória de cada processo Node é replicada pelo Redis automaticamente, sem necessidade de nenhuma configuração adicional',
          'Porque o Redis criptografa os cookies de sessão no navegador do usuário'
        ], 'Com sessão na memória do processo, cada instância tem a sua. O Redis é um ponto comum que todas consultam.'),
        mcq('q7', 'Um Redis de cache foi colocado em um servidor acessível pela internet, sem senha. Qual a avaliação correta?', 'c', [
          'Aceitável, pois dados em cache são temporários e não têm valor para ninguém',
          'Aceitável, desde que as chaves tenham nomes difíceis de adivinhar pelos visitantes',
          'Grave: qualquer pessoa poderia ler ou apagar dados; restrinja a rede e exija autenticação (e TLS)',
          'Grave, desde que o Redis esteja gravando em disco, pois só então os dados persistem'
        ], 'O Redis nunca deve ficar exposto sem proteção. Nomes de chave difíceis não substituem autenticação e o cache pode conter dados pessoais.'),
        fill('q8', 'Complete o termo para quando a chave NÃO é encontrada no cache e é preciso ir ao banco.', '// chave ausente no cache = cache ___', ['miss'], 'Cache miss é a ausência no cache; cache hit é a presença.')
      ]
    },
    {
      id: 'nji-17-transacoes-e-consistencia',
      title: 'Transações e consistência',
      goal: 'Entender ACID, usar transações, reconhecer condições de corrida, aplicar idempotência e conhecer locks otimistas.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'ACID',
            'Transação é um grupo de operações tratado como uma unidade. Os bancos relacionais oferecem as garantias ACID. Atomicidade: ou TODAS as operações valem ou NENHUMA (tudo ou nada). Consistência: depois da transação, as regras do banco (chaves, restrições) continuam válidas. Isolamento: transações simultâneas não enxergam o trabalho incompleto umas das outras. Durabilidade: depois do commit, o dado resiste a falhas e quedas de energia. O exemplo clássico é a transferência: debitar uma conta e creditar outra precisam acontecer juntas.'
          ),
          sl(
            'Transações no código',
            'O fluxo é BEGIN (começa), as operações, COMMIT (confirma) ou ROLLBACK (desfaz tudo) se algo falhar. Ponto crítico no Node com pool: todos os comandos da transação precisam usar a MESMA conexão, então use um client obtido com pool.connect() e nunca pool.query para cada comando, pois cada chamada pode usar uma conexão diferente e a transação se perde. Sempre devolva a conexão no finally. Ilustrativo, não executado aqui (depende do banco).',
            'const client = await pool.connect();\ntry {\n  await client.query("BEGIN");\n  await client.query("UPDATE contas SET saldo = saldo - $1 WHERE id = $2", [valor, origem]);\n  await client.query("UPDATE contas SET saldo = saldo + $1 WHERE id = $2", [valor, destino]);\n  await client.query("COMMIT");\n} catch (e) {\n  await client.query("ROLLBACK");\n  throw e;\n} finally {\n  client.release();\n}'
          ),
          sl(
            'Isolamento em visão geral',
            'Quando duas transações rodam ao mesmo tempo podem ocorrer anomalias: leitura suja (ler dado que outra transação ainda não confirmou), leitura não repetível (ler o mesmo registro duas vezes e obter valores diferentes) e leitura fantasma (uma consulta repetida traz linhas novas). Os bancos oferecem níveis de isolamento (por exemplo, read committed, repeatable read, serializable), do mais permissivo ao mais rígido. Mais isolamento significa menos anomalias, porém mais bloqueios ou conflitos que exigem repetir a transação. O nível padrão varia por banco: consulte a documentação do seu.'
          ),
          sl(
            'Condições de corrida (execução real)',
            'Condição de corrida é quando o resultado depende da ordem em que operações simultâneas acontecem. O padrão perigoso é ler, decidir e gravar em passos separados: duas requisições leem saldo 100, ambas concluem que podem sacar 80, ambas gravam. No teste real abaixo, dois saques de 80 sobre saldo 100 deixaram saldo -60 no código errado. Serializar em memória (fila de promises) deu saldo 20 (correto), mas só funciona em UM processo: com cluster ou várias instâncias, a defesa precisa estar no banco.',
            '// ERRADO: verifica e grava em passos separados (com uma pausa de I/O no meio)\nasync function sacarErrado(v) { if (saldo >= v) { await pausa(); saldo -= v; } }\n// dois saques de 80 em saldo 100 ->  saldo errado: -60\n// versão serializada em memória (um processo só) -> saldo serializado: 20\n\n-- CERTO no banco: verificação e alteração em UM comando atômico\nUPDATE contas SET saldo = saldo - $1 WHERE id = $2 AND saldo >= $1;\n-- se rowCount for 0, o saldo era insuficiente: recuse a operação'
          ),
          sl(
            'Idempotência',
            'Operação idempotente é aquela que, repetida, não muda o resultado além da primeira vez. Clientes reenviam requisições (timeouts, duplo clique, retry), então operações como "criar cobrança" precisam ser seguras contra repetição. A técnica: o cliente envia uma chave de idempotência (um identificador único da tentativa); o servidor grava essa chave com uma restrição UNIQUE no banco; se chegar de novo, devolve o resultado já gerado em vez de executar outra vez. A garantia fica no banco, que impede duplicidade mesmo com requisições simultâneas.'
          ),
          sl(
            'Locks otimistas e pessimistas',
            'Lock pessimista: bloqueia a linha ao lê-la (SELECT ... FOR UPDATE), e quem chegar depois espera; seguro, mas pode gerar filas e deadlocks (duas transações esperando uma pela outra). Lock otimista: assume que conflitos são raros, guarda uma coluna de VERSÃO e atualiza só se ela não mudou (UPDATE ... WHERE id = $1 AND versao = $2, incrementando a versão). Se nenhuma linha foi afetada, alguém alterou antes: a aplicação relê e tenta de novo ou avisa o usuário. Muito usado em edição de formulários por várias pessoas.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que a atomicidade garante em uma transação?', 'c', [
          'Que as operações rodam mais rápido, pois o banco as processa em memória',
          'Que nenhuma outra conexão consegue ler as tabelas envolvidas durante o processamento',
          'Que todas as operações valem ou nenhuma vale, sem estado intermediário',
          'Que os dados continuam disponíveis mesmo se o servidor do banco ficar fora do ar'
        ], 'Atomicidade é "tudo ou nada". Velocidade, leitura bloqueada e disponibilidade não fazem parte dessa propriedade.'),
        mcq('q2', 'Uma transferência faz dois UPDATE sem transação e o processo cai entre eles. Qual é o resultado provável e a correção?', 'd', [
          'Nada de errado: o banco desfaz sozinho o primeiro UPDATE ao detectar a queda do processo',
          'Os dois comandos serão repetidos na reinicialização, pois o banco guarda a fila de pendentes, o que costuma ser suficiente para a maioria das aplicações',
          'O valor sai da conta de origem e entra na de destino em dobro; evite aumentando o pool',
          'O dinheiro some da origem sem entrar no destino; envolva os dois comandos em uma transação com rollback'
        ], 'Sem transação não há atomicidade e o estado fica inconsistente. BEGIN/COMMIT/ROLLBACK resolvem; o tamanho do pool não tem relação.'),
        mcq('q3', 'Qual comando evita a condição de corrida em um saque?', 'a', [
          'UPDATE contas SET saldo = saldo - $1 WHERE id = $2 AND saldo >= $1, conferindo as linhas afetadas',
          'SELECT saldo, decidir no código e depois UPDATE com o novo valor calculado',
          'Dois SELECT seguidos para ter certeza de que o saldo não mudou antes de gravar',
          'UPDATE sem condição, tratando o saldo negativo depois em um relatório'
        ], 'O comando condicional é atômico: a verificação e a alteração acontecem juntas no banco. Ler, decidir e gravar separados reproduz a corrida.'),
        fill('q4', 'Complete o comando que desfaz todas as operações da transação em caso de erro.', '} catch (e) {\n  await client.query("___");\n  throw e;\n}', ['ROLLBACK'], 'ROLLBACK desfaz a transação inteira; COMMIT a confirma.'),
        mcq('q5', 'Por que usar pool.query para cada comando de uma transação é um erro?', 'b', [
          'Porque o pool.query não aceita comandos de atualização, só de leitura',
          'Porque cada chamada pode usar uma conexão diferente e os comandos não ficam na mesma transação',
          'Porque o pool.query confirma automaticamente o primeiro comando e ignora os seguintes, e isso dispensa qualquer verificação posterior no código',
          'Porque o pool.query exige que o BEGIN seja enviado em um comando separado do COMMIT'
        ], 'A transação pertence a uma conexão. Use pool.connect() e envie BEGIN, os comandos e COMMIT pelo mesmo client.'),
        mcq('q6', 'Como funciona o lock otimista?', 'c', [
          'Bloqueia a linha ao lê-la, de modo que ninguém mais consiga acessá-la até o fim da transação',
          'Duplica o registro para cada usuário que o lê, juntando as cópias no final do dia',
          'Atualiza se a versão guardada continua a mesma; se não, há conflito para tratar',
          'Ignora conflitos e mantém a última gravação, descartando as anteriores sem aviso'
        ], 'A coluna de versão detecta alterações concorrentes: zero linhas afetadas indica conflito. O bloqueio ao ler descreve o lock pessimista.'),
        mcq('q7', 'Um cliente reenvia o mesmo POST de pagamento com a mesma chave de idempotência. O que o servidor deve fazer?', 'a', [
          'Reconhecer a chave (garantida por UNIQUE no banco) e devolver o resultado anterior sem cobrar de novo',
          'Processar de novo, pois cada requisição HTTP é independente e precisa de resultado novo',
          'Recusar com erro 500, pois repetições indicam falha do cliente',
          'Cobrar novamente e estornar a cobrança antiga depois, para manter o saldo correto'
        ], 'Idempotência é impedir efeito duplicado; a restrição UNIQUE no banco garante isso mesmo com requisições simultâneas.'),
        fill('q8', 'Complete o significado da letra I na sigla ACID.', 'ACID: Atomicidade, Consistência, ___, Durabilidade', ['Isolamento', 'Isolation'], 'A letra I é isolamento: transações simultâneas não enxergam o trabalho incompleto umas das outras.')
      ]
    },
    {
      id: 'nji-18-jwt-e-refresh-tokens',
      title: 'JWT e refresh tokens',
      goal: 'Entender a estrutura do JWT, a diferença entre assinar e criptografar, o par access token curto + refresh token com rotação, revogação e armadilhas.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Estrutura do JWT',
            'JWT (JSON Web Token) é um formato de token em TEXTO com três partes separadas por ponto: header.payload.signature. O header (cabeçalho) diz o tipo e o algoritmo de assinatura (por exemplo HS256). O payload (carga) guarda claims, afirmações em JSON: sub (o dono do token, geralmente o id do usuário), exp (expiração, em segundos desde 1970), iat (emissão), iss (quem emitiu) e aud (para quem se destina). A signature (assinatura) é calculada sobre as duas primeiras partes com uma chave. Cada parte é codificada em base64url (você viu base64 na lição de buffers). Exemplo executado de verdade, só com o módulo crypto:',
            'const b64u = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");\nconst header = b64u({ alg: "HS256", typ: "JWT" });\nconst payload = b64u({ sub: "42", exp: Math.floor(Date.now() / 1000) + 900 });\nconst assin = crypto.createHmac("sha256", segredo).update(`${header}.${payload}`).digest("base64url");\nconst token = `${header}.${payload}.${assin}`;\nconsole.log(token.split(".").length, "partes");\n// 3 partes\nconsole.log(JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString()));\n// { sub: \'42\', exp: <muda a cada execução> }  <- qualquer um decodifica o payload'
          ),
          sl(
            'Assinar não é criptografar',
            'Um JWT comum é ASSINADO, não cifrado: o payload é legível por qualquer pessoa que tenha o token (acabamos de decodificá-lo sem chave nenhuma). A assinatura garante INTEGRIDADE e AUTENTICIDADE: o conteúdo não foi alterado e foi emitido por quem tem a chave. Por isso nunca coloque no payload senha, CPF, dados de saúde ou qualquer dado pessoal desnecessário; guarde só o mínimo (o id do usuário e poucos claims). Algoritmos simétricos como HS256 usam o mesmo segredo para assinar e verificar (HMAC); assimétricos como RS256 ou ES256 assinam com a chave privada e verificam com a pública, bom quando outros serviços só precisam verificar.'
          ),
          sl(
            'Verificação correta e algoritmo fixo',
            'Verificar significa: recalcular a assinatura e comparar (em tempo constante, com crypto.timingSafeEqual), conferir exp, e conferir iss e aud. Regra de segurança central: o servidor define QUAL algoritmo aceita; ele nunca confia no campo alg do cabeçalho do token, pois quem controla o token é o cliente. Ataques clássicos exploram servidores que obedecem ao alg informado (aceitando "none", sem assinatura, ou trocando o tipo de algoritmo). Em produção use bibliotecas maduras (jsonwebtoken ou jose, por nome) em vez de código próprio e configure a lista de algoritmos permitidos. O trecho abaixo, com saída real, mostra um token válido e outro com payload adulterado:',
            'function verificar(t) {\n  const [h, p, s] = t.split(".");\n  if (JSON.parse(Buffer.from(h, "base64url")).alg !== "HS256") return "alg rejeitado";\n  const esp = crypto.createHmac("sha256", segredo).update(`${h}.${p}`).digest();\n  const rec = Buffer.from(s, "base64url");\n  if (rec.length !== esp.length || !crypto.timingSafeEqual(rec, esp)) return "assinatura inválida";\n  const dados = JSON.parse(Buffer.from(p, "base64url"));\n  return dados.exp * 1000 < Date.now() ? "expirado" : "válido, sub=" + dados.sub;\n}\n// token original            -> válido, sub=42\n// payload trocado (sub=1)   -> assinatura inválida'
          ),
          sl(
            'Access token curto e refresh token',
            'Um JWT é válido até expirar e o servidor não consulta nada para aceitá-lo. Se vazar, vale até o exp. Solução: access token de vida CURTA (alguns minutos) usado nas requisições, mais um refresh token de vida longa, usado só para pedir um novo access token. O refresh token é um valor aleatório OPACO (sem significado), guardado no servidor só como HASH, com data de expiração e dono. Com a rotação, cada vez que o refresh é usado o servidor emite um novo e invalida o anterior; se um refresh antigo for apresentado de novo, é sinal de roubo e toda a cadeia daquele login é revogada. Assim o usuário não digita a senha a toda hora, e a janela de abuso é pequena.'
          ),
          sl(
            'Revogação',
            'Como o JWT é "stateless" (o servidor não guarda estado), não dá para cancelá-lo antes do exp apenas apagando algo. Opções: expiração bem curta (o principal), uma lista de tokens/ids revogados consultada na verificação (traz de volta um estado, o que é aceitável quando necessário), ou trocar por sessões no servidor, com id aleatório guardado em Redis ou banco, quando revogação imediata é requisito central. Em logout, mudança de senha ou suspeita, revogue os refresh tokens do usuário. Não é pecado preferir sessão simples: JWT resolve bem APIs entre serviços, mas para um site comum a sessão com cookie costuma ser mais simples e mais fácil de revogar.'
          ),
          sl(
            'Onde guardar e armadilhas',
            'No navegador, o access token em localStorage pode ser lido por qualquer JavaScript injetado (XSS); o refresh token costuma ir em cookie HttpOnly (JavaScript não lê), Secure (só HTTPS) e SameSite (limita envio entre sites), pensando também em CSRF. Aplicativos móveis devem usar o armazenamento seguro do sistema. Nunca coloque tokens em URLs (aparecem em logs e histórico). Armadilhas: segredo fraco ou escrito no código (use variável de ambiente e segredo longo e aleatório); aceitar alg do cliente; token sem exp; dados pessoais no payload; não conferir iss e aud; usar o mesmo segredo em ambientes diferentes; registrar tokens completos em logs.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que é verdadeiro sobre o payload de um JWT comum (assinado)?', 'b', [
          'Está criptografado, e só quem tem o segredo do servidor consegue lê-lo',
          'Qualquer pessoa com o token consegue decodificá-lo, por isso não deve conter dados sensíveis',
          'É ilegível fora do navegador que recebeu o token, graças ao cabeçalho, conforme o comportamento padrão das versões mais antigas',
          'É legível, mas depois que o token expira o conteúdo é apagado'
        ], 'A assinatura protege contra alteração, não contra leitura: o payload é só base64url. Dados sensíveis não pertencem a ele.'),
        mcq('q2', 'O que a assinatura de um JWT garante?', 'c', [
          'Que o conteúdo do token é secreto e não pode ser visto durante o tráfego pela rede',
          'Que o token não expira enquanto o segredo do servidor não for trocado',
          'Que o conteúdo não foi alterado e foi emitido por quem possui a chave',
          'Que o usuário continua autorizado a acessar os recursos da aplicação'
        ], 'Assinatura dá integridade e autenticidade. Sigilo exige criptografia, e a autorização atual do usuário precisa de checagem no servidor.'),
        mcq('q3', 'Por que o servidor deve fixar os algoritmos aceitos em vez de usar o campo alg do cabeçalho do token?', 'd', [
          'Porque o campo alg só aceita um valor e outros valores derrubam o servidor',
          'Porque o campo alg é criptografado e o servidor não consegue lê-lo corretamente',
          'Porque algoritmos diferentes produzem tokens de tamanhos incompatíveis entre si',
          'Porque o cabeçalho é controlado por quem envia o token, que poderia escolher um algoritmo fraco ou a ausência dele'
        ], 'O token vem do cliente; obedecer ao alg dele permite ataques como "none" ou troca de algoritmo. O servidor decide.'),
        fill('q4', 'Complete o nome da terceira parte do JWT, calculada sobre header e payload.', 'header.payload.___', ['signature', 'assinatura'], 'A terceira parte é a assinatura (signature), que protege a integridade das duas primeiras.'),
        mcq('q5', 'Qual é o benefício do access token de vida curta combinado com refresh token?', 'a', [
          'Reduz a janela de abuso se o access token vazar, sem exigir nova senha a cada poucos minutos',
          'Elimina a necessidade de HTTPS, pois tokens curtos não podem ser interceptados',
          'Permite revogar qualquer access token instantaneamente, mesmo sem consultar nada no servidor',
          'Faz o servidor guardar menos dados, pois o refresh token substitui o banco de usuários'
        ], 'Quanto menor o prazo do access token, menor o estrago de um vazamento; o refresh mantém a experiência. HTTPS continua obrigatório.'),
        mcq('q6', 'O que caracteriza a rotação de refresh tokens?', 'd', [
          'Trocar a senha do usuário a cada uso do refresh token para renovar a credencial',
          'Reutilizar o mesmo refresh token até ele expirar, sem registrar seus usos, já que o próprio Node cuida desse detalhe por baixo',
          'Gerar um novo access token e manter o refresh antigo válido indefinidamente',
          'Emitir um novo refresh a cada uso e invalidar o anterior; a reapresentação de um antigo indica roubo'
        ], 'Com rotação, cada refresh vale uma vez. Se um já usado reaparece, alguém o copiou: a cadeia é revogada.'),
        mcq('q7', 'Para o navegador, qual guarda é mais segura para o refresh token?', 'b', [
          'Em localStorage, que é protegido pela política de mesma origem e não é lido por scripts injetados',
          'Em cookie HttpOnly, Secure e SameSite, que JavaScript não consegue ler',
          'Na URL, como parâmetro, para que o servidor o receba em toda requisição de página',
          'Em uma variável global de JavaScript, que some quando a página é recarregada'
        ], 'Cookie HttpOnly não é acessível por JavaScript, reduzindo o roubo por XSS; Secure e SameSite complementam. localStorage é legível por qualquer script na página.'),
        fill('q8', 'Complete o nome do claim que indica quando o JWT expira.', '{ sub: "42", ___: 1700000000 }', ['exp'], 'O claim exp guarda o instante de expiração, em segundos desde 1970.')
      ]
    },
    {
      id: 'nji-19-oauth-oidc-login-social',
      title: 'OAuth 2.0, OpenID Connect e login social',
      goal: 'Entender OAuth x OIDC, o fluxo de código com PKCE, state, nonce, redirect_uri exato e cuidados de LGPD com dados vindos do provedor.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Para que serve o login social',
            '"Entrar com uma conta de outro serviço" evita que sua aplicação receba e guarde uma senha a mais (menos risco e menos dados sob sua responsabilidade). Quatro papéis: o usuário (dono dos dados), o provedor (o serviço onde ele já tem conta), o cliente (a SUA aplicação) e os escopos (scopes: as permissões pedidas, como "ler o e-mail"). OAuth 2.0 é um protocolo de AUTORIZAÇÃO DELEGADA: com o consentimento do usuário, o provedor entrega à sua aplicação um access token com permissões limitadas, sem revelar a senha. Os exemplos de pacote (Passport, openid-client, por nome) são ilustrativos; o trecho de PKCE foi executado de verdade com crypto.'
          ),
          sl(
            'OAuth x OpenID Connect',
            'OAuth 2.0 sozinho responde "este app pode acessar estes recursos?", NÃO "quem é este usuário?". Usá-lo como login puro leva a falhas. OpenID Connect (OIDC) é uma camada por cima do OAuth que acrescenta IDENTIDADE: além do access token, o provedor devolve um ID token (um JWT, visto na lição anterior) com claims como sub (identificador único e estável do usuário naquele provedor), iss, aud, exp e, conforme os escopos, e-mail e nome. Para login social moderno, o que você usa é OIDC. Identifique o usuário pelo par (provedor, sub), e não pelo e-mail, que pode mudar.'
          ),
          sl(
            'Fluxo de código de autorização com PKCE',
            'Passos: 1) sua aplicação redireciona o usuário ao provedor com client_id, redirect_uri, scope, state e code_challenge; 2) o usuário se autentica e consente NO provedor; 3) o provedor redireciona de volta ao seu redirect_uri com um code (curto e de uso único) e o state; 4) seu SERVIDOR troca o code por tokens chamando o provedor diretamente, enviando o code_verifier; 5) valida o ID token e cria a sessão. PKCE (Proof Key for Code Exchange) liga o início e o fim do fluxo: você gera um code_verifier aleatório, envia ao provedor só o code_challenge (o hash SHA-256 dele, método S256) e, na troca, apresenta o verifier original. Quem roubar o code no caminho não tem o verifier e não consegue trocá-lo. Saída real da geração:',
            'const verifier = crypto.randomBytes(32).toString("base64url");\nconst challenge = crypto.createHash("sha256").update(verifier).digest("base64url");\nconst state = crypto.randomBytes(16).toString("base64url");\n// verifier: 43 caracteres | challenge: 43 caracteres | state: 22 caracteres\n// o servidor do provedor refaz o hash do verifier recebido:\n// servidor confere: true\n// verifier errado: false'
          ),
          sl(
            'state e nonce',
            'state é um valor aleatório que você gera ao iniciar o login, guarda na sessão do usuário e CONFERE quando o provedor devolve o usuário ao seu callback. Sem essa checagem, um atacante poderia fazer o navegador da vítima concluir um login com um code do próprio atacante (um tipo de CSRF no login, veja o curso de Segurança Web). nonce é outro valor aleatório enviado ao iniciar o fluxo OIDC que reaparece DENTRO do ID token; conferir que é o mesmo impede que um ID token antigo capturado seja reaproveitado (replay). Ambos devem ser imprevisíveis, de uso único e com expiração curta.'
          ),
          sl(
            'redirect_uri exato',
            'redirect_uri é o endereço para onde o provedor devolve o usuário com o code. Você o REGISTRA no provedor, e o provedor deve compará-lo de forma EXATA (nada de curingas ou "começa com"). Se aceitasse padrões abertos, um atacante conseguiria fazer o code ser entregue a um endereço dele. Registre apenas URLs https de produção (e localhost só para desenvolvimento), e confira no seu código que a URL usada na troca é a mesma do início. Também valide iss e aud do ID token e use bibliotecas mantidas (openid-client, Passport com estratégias OIDC, por nome) em vez de implementar o protocolo à mão.'
          ),
          sl(
            'LGPD ao receber dados do provedor',
            'Visão geral, sem substituir orientação jurídica: peça só os ESCOPOS necessários (minimização); guarde apenas o que precisa (por exemplo sub e, se indispensável, o e-mail), não copie o perfil inteiro; informe ao usuário, de forma clara, quais dados recebe e para quê (transparência e finalidade); permita que ele exclua a conta e os dados; não guarde os tokens do provedor se não for chamar a API dele depois, e se guardar, proteja-os como segredos. Trate o e-mail do provedor com cuidado: só o considere verificado se o claim email_verified indicar isso, ou o login poderia ser usado para assumir uma conta alheia.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a diferença entre OAuth 2.0 e OpenID Connect?', 'd', [
          'OAuth 2.0 é para aplicativos móveis e OpenID Connect é exclusivo para sites',
          'OpenID Connect substitui o HTTPS por um canal de comunicação próprio e mais seguro',
          'Os dois fazem o mesmo; só mudam os nomes dos endpoints do provedor',
          'OAuth 2.0 trata de autorização delegada; OpenID Connect acrescenta a identidade do usuário (ID token)'
        ], 'OAuth responde se o app pode acessar recursos. OIDC acrescenta quem é o usuário, com o ID token.'),
        mcq('q2', 'Qual é o papel do parâmetro state no login social?', 'a', [
          'Um valor aleatório guardado na sessão e comparado na volta, evitando requisições forjadas no callback',
          'Uma lista de permissões que o usuário concedeu ao aplicativo durante o consentimento, sem necessidade de nenhuma configuração adicional',
          'O estado da conta do usuário no provedor (ativa, suspensa ou bloqueada)',
          'O hash do segredo do cliente, enviado para que o provedor identifique o aplicativo'
        ], 'O state liga a volta ao início do fluxo no mesmo navegador; sem conferi-lo, o callback pode ser forjado (CSRF de login).'),
        mcq('q3', 'O que o PKCE impede?', 'b', [
          'Que o usuário digite a senha em uma página falsa do provedor',
          'Que um code interceptado seja trocado por tokens por quem não tem o code_verifier',
          'Que o provedor guarde registros das permissões concedidas pelo usuário',
          'Que o ID token seja lido por terceiros durante a transmissão pela rede'
        ], 'O provedor só troca o code se o verifier combinar com o challenge enviado no início. PKCE não impede phishing nem cifra tokens.'),
        fill('q4', 'Complete o método do code_challenge recomendado no PKCE (hash SHA-256).', 'code_challenge_method=___', ['S256'], 'S256 indica que o challenge é o hash SHA-256 do verifier.'),
        mcq('q5', 'Por que o provedor deve comparar o redirect_uri de forma exata com o registrado?', 'c', [
          'Porque endereços diferentes geram códigos de tamanhos incompatíveis com o fluxo',
          'Porque o navegador bloqueia qualquer redirecionamento que contenha parâmetros extras',
          'Para impedir que um atacante faça o code ser entregue a um endereço que ele controla',
          'Porque o ID token só é válido para endereços que terminem com a mesma extensão'
        ], 'Padrões abertos permitiriam desviar o code para um site do atacante. A comparação exata fecha essa brecha.'),
        mcq('q6', 'Qual prática de minimização de dados é adequada ao implementar o login social?', 'a', [
          'Pedir os escopos necessários e guardar o identificador (sub) e o dado indispensável',
          'Pedir a lista completa de escopos disponíveis para evitar pedir novas permissões no futuro',
          'Copiar o perfil completo do provedor para o seu banco, por precaução',
          'Guardar também o access token do provedor em texto simples, para reutilizar quando precisar, o que costuma ser suficiente para a maioria das aplicações'
        ], 'Minimização: coletar e guardar o mínimo, com finalidade clara. Pedir tudo, copiar tudo ou guardar tokens sem proteção contraria essa prática.'),
        mcq('q7', 'Onde deve ocorrer a troca do code por tokens e por quê?', 'd', [
          'No JavaScript do navegador, para que o usuário veja os tokens e confirme o login',
          'Em qualquer lugar, pois o code não tem proteção nem validade limitada',
          'No provedor, sem que a sua aplicação participe da troca de dados',
          'No seu servidor, em chamada direta ao provedor, para não expor segredos nem tokens no navegador'
        ], 'A troca no back-end permite usar o client_secret (quando existir) e o verifier sem expô-los ao navegador.'),
        fill('q8', 'Complete a sigla OIDC: OpenID ___.', 'OIDC = OpenID ___', ['Connect'], 'OIDC é OpenID Connect, camada de identidade sobre o OAuth 2.0.')
      ]
    },
    {
      id: 'nji-20-autorizacao-rbac-abac',
      title: 'Autorização: RBAC, ABAC e IDOR',
      goal: 'Distinguir RBAC e ABAC, checar autorização em cada rota no servidor, reconhecer IDOR/BOLA, centralizar políticas e auditar.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Autenticação x autorização',
            'Autenticação responde "quem é você?" (login). Autorização responde "o que você PODE fazer?". Um usuário autenticado não pode tudo: ver o pedido de outra pessoa, apagar um recurso de outro, acessar o painel administrativo. Falhas de autorização (Broken Access Control) estão entre os problemas mais graves em aplicações web (veja o curso de Segurança Web/OWASP). Aqui o ângulo é como organizar isso em uma API Node.'
          ),
          sl(
            'RBAC: controle por papéis',
            'RBAC (Role-Based Access Control) associa PERMISSÕES a PAPÉIS (admin, editor, leitor) e papéis a usuários. É simples de entender e auditar: "editores podem publicar; leitores só leem". Limite: não expressa regras sobre o recurso específico ("editar apenas os SEUS artigos") e, com muitas exceções, leva à explosão de papéis (um papel novo para cada caso). Quando a pergunta é só "este tipo de usuário pode usar esta função?", RBAC basta.'
          ),
          sl(
            'ABAC: controle por atributos',
            'ABAC (Attribute-Based Access Control) decide com base em ATRIBUTOS do usuário (departamento, nível), do recurso (dono, status, sensibilidade), da ação e do contexto (horário, local). A política é uma regra: "pode editar se for o dono do artigo OU gerente do departamento dele". É mais expressivo, porém mais difícil de enxergar por inteiro. Na prática combinam-se os dois: papéis para o grosso e atributos (como propriedade do recurso) para os casos finos.'
          ),
          sl(
            'Checar em cada rota, no servidor',
            'Esconder o botão "Excluir" na interface NÃO é segurança: qualquer pessoa pode enviar a requisição direto, sem a interface. A checagem precisa estar NO SERVIDOR, em CADA rota (middleware de papel na rota e, para regras do recurso, no serviço). Adote "negar por padrão": se nenhuma regra permitir, a resposta é 403 (proibido), ou 401 se não autenticado. Esquecer uma rota é a falha mais comum: rotas "internas", de exportação, de versões antigas e de depuração também precisam de verificação. Testes automatizados de autorização (um usuário comum tentando acessar o que não deve) pegam essas omissões.'
          ),
          sl(
            'IDOR e BOLA (execução real)',
            'IDOR (Insecure Direct Object Reference) ou BOLA (Broken Object Level Authorization): a API aceita um identificador (/pedidos/2) e devolve o recurso sem conferir se pertence a quem pediu. Basta o usuário trocar o número. Estar logado não basta: é preciso conferir a PROPRIEDADE. A correção mais robusta é incluir o dono na própria consulta (WHERE id = $1 AND dono_id = $2), de modo que o recurso alheio simplesmente não seja encontrado. Ids aleatórios (UUID) dificultam adivinhar, mas NÃO substituem a checagem. Para não revelar que o recurso existe, muitas APIs respondem 404 em vez de 403. Teste real, apenas com Node:',
            'const pedidos = [{ id: 1, dono: "ana" }, { id: 2, dono: "bia" }];\nconst papeis = { ana: "usuario", bia: "usuario", root: "admin" };\nfunction podeVer(usuario, pedido) { return papeis[usuario] === "admin" || pedido.dono === usuario; }\nconst buscar = (usuario, id) => {\n  const p = pedidos.find((x) => x.id === id);\n  return p && podeVer(usuario, p) ? p : null;\n};\nconsole.log(buscar("ana", 1), buscar("ana", 2), buscar("root", 2));\n// { id: 1, dono: \'ana\' } null { id: 2, dono: \'bia\' }'
          ),
          sl(
            'Políticas centralizadas e auditoria',
            'Concentre as regras em um lugar (uma função podeVer, podeEditar, ou uma biblioteca de políticas), em vez de espalhar ifs pelo código: fica mais fácil revisar, testar e mudar. Auditoria é o registro de quem fez o quê, quando e com que resultado, para investigar incidentes e prestar contas (LGPD, visão geral, sem substituir orientação jurídica). Registre ids (usuário, recurso), ação, resultado e horário, e NÃO registre senhas, tokens nem dados pessoais desnecessários. Proteja os logs contra alteração, defina por quanto tempo serão retidos e limite quem pode lê-los.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que caracteriza o RBAC?', 'a', [
          'Permissões associadas a papéis, e os papéis atribuídos aos usuários',
          'Decisões tomadas só com base no horário e no endereço IP de quem acessa',
          'Permissões definidas individualmente por usuário, sem qualquer agrupamento',
          'Autenticação por biometria, sem uso de senhas ou tokens'
        ], 'RBAC organiza as permissões em papéis. A decisão por contexto descreve o ABAC e biometria é autenticação.'),
        mcq('q2', 'A interface esconde o botão "Excluir" de quem não é administrador. Isso basta para proteger a rota DELETE?', 'd', [
          'Sim, pois sem o botão ninguém consegue disparar a exclusão',
          'Sim, desde que o nome da rota seja difícil de adivinhar',
          'Não, a menos que o botão seja removido também do código-fonte do navegador, e isso dispensa qualquer verificação posterior no código',
          'Não: a requisição pode ser enviada sem a interface, então o servidor deve verificar a permissão'
        ], 'A interface é só conveniência. A segurança vem da checagem no servidor em cada rota; rota "secreta" não protege.'),
        mcq('q3', 'Uma usuária autenticada troca /pedidos/10 por /pedidos/11 e vê o pedido de outra pessoa. Qual é a falha?', 'c', [
          'Injeção de SQL, porque o número foi alterado na URL',
          'Falha de autenticação, porque a sessão da usuária expirou antes da requisição',
          'IDOR/BOLA: falta conferir no servidor se o pedido pertence a quem pediu',
          'Falha de disponibilidade, pois a API aceita um número muito grande de ids'
        ], 'O recurso foi entregue sem checar a propriedade. A usuária estava autenticada; faltou autorização por objeto.'),
        fill('q4', 'Complete o código de status HTTP usado quando o usuário está autenticado, mas não tem permissão.', 'return res.status(___).json({ erro: "acesso negado" });', ['403'], '403 (Forbidden) indica falta de permissão; 401 indica não autenticado.'),
        mcq('q5', 'Qual é a diferença central entre ABAC e RBAC?', 'b', [
          'O ABAC não usa o servidor e roda só no navegador do usuário',
          'O ABAC decide com atributos (usuário, recurso, contexto), permitindo regras como "só o dono pode editar"',
          'O ABAC funciona com tokens JWT, enquanto o RBAC usa cookies de sessão',
          'O ABAC dispensa auditoria, porque as regras são executadas automaticamente'
        ], 'ABAC considera atributos do recurso e do contexto; RBAC considera o papel. A forma de autenticação é independente.'),
        mcq('q6', 'Qual é a forma mais robusta de corrigir um IDOR em uma consulta ao banco?', 'b', [
          'Gerar ids sequenciais menores, para que as consultas sejam mais rápidas',
          'Incluir o dono no filtro da consulta (WHERE id = $1 AND dono_id = $2)',
          'Converter o id para texto antes de montar a consulta SQL',
          'Registrar um log quando um usuário consultar um id que não é o seu'
        ], 'Com o dono no filtro, o recurso alheio não é encontrado. Log não impede o acesso e converter tipos não muda a autorização.'),
        mcq('q7', 'O que deve constar em um registro de auditoria de acesso?', 'c', [
          'A senha usada, o token completo e o cadastro pessoal do usuário, para investigação, conforme o comportamento padrão das versões mais antigas',
          'A data, sem identificar quem fez a ação ou qual foi o recurso',
          'Ids do usuário e do recurso, a ação, o resultado e o horário, sem senhas, tokens ou dados desnecessários',
          'Os erros do servidor; acessos bem-sucedidos não precisam ser registrados'
        ], 'Auditoria precisa responder quem, o quê, quando e resultado, com o mínimo de dados pessoais e nunca segredos.'),
        fill('q8', 'Complete a sigla BOLA: Broken Object Level ___.', 'BOLA = Broken Object Level ___', ['Authorization', 'Autorização'], 'BOLA é a quebra de autorização no nível do objeto, o equivalente moderno do IDOR.')
      ]
    },
    {
      id: 'nji-46-multi-tenancy-em-apis',
      title: 'Multi-tenancy em APIs',
      goal: 'Entender o que é multi-tenant, escolher o isolamento (coluna, esquema ou banco), propagar o tenant com segurança e evitar o vazamento entre clientes.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é multi-tenant',
            'Tenant (inquilino) é um cliente do seu produto: uma empresa, uma escola, uma equipe. Em uma aplicação multi-tenant, UMA instalação do sistema atende vários tenants ao mesmo tempo, e cada um enxerga apenas os próprios dados, como se tivesse um sistema só seu. É o modelo típico de SaaS (software como serviço). O oposto é o single-tenant: uma instalação separada por cliente, mais isolada porém mais cara de operar e de atualizar. A palavra tenant não é o mesmo que usuário: uma empresa (tenant) tem muitos usuários, e todos eles pertencem ao mesmo tenant. Erro comum: tratar o usuário como unidade de isolamento e esquecer que dois usuários da mesma empresa devem compartilhar dados, enquanto usuários de empresas diferentes jamais podem.'
          ),
          sl(
            'Três modelos de isolamento',
            'Há três formas clássicas de separar os dados. (1) Coluna: todas as tabelas são compartilhadas e cada linha tem uma coluna tenant_id; é o mais barato e simples de operar, mas o isolamento depende de TODA consulta filtrar por tenant_id. (2) Esquema: um schema do banco por tenant, com as mesmas tabelas repetidas; isolamento melhor, mas migrations rodam uma vez por tenant. (3) Banco: um banco inteiro por tenant; o isolamento é o mais forte e permite backup e exclusão por cliente, porém o custo e a complexidade crescem com o número de clientes. A escolha depende de quantos tenants existem, do tamanho de cada um e de exigências contratuais. Muitos produtos começam com coluna e oferecem banco dedicado só para clientes grandes.',
            'tenant_id  | id | total\nloja-a     | 1  | 100\nloja-b     | 2  | 250\n-- coluna: tudo na mesma tabela, filtrado por tenant_id'
          ),
          sl(
            'De onde vem o tenant: token e contexto',
            'O tenant da requisição deve vir de uma fonte em que o cliente não consegue mentir: uma claim (campo) do token assinado ou da sessão, validados no servidor (veja a lição de JWT). Se você aceitar o tenant vindo do corpo, da query string ou de um cabeçalho livre, qualquer pessoa troca o valor e entra em outro cliente. Depois de validar, guarde o tenant no CONTEXTO da requisição. Em Node isso se faz com AsyncLocalStorage (módulo node:async_hooks): você chama als.run(contexto, funcao) e, em qualquer ponto chamado dentro da função, mesmo depois de await, als.getStore() devolve o contexto DAQUELA requisição, sem passar o tenant por parâmetro e sem misturar requisições concorrentes. Conceito importante: o middleware de autenticação inicia o contexto; a camada de dados lê o tenant dele.',
            'const { AsyncLocalStorage } = require("node:async_hooks");\nconst als = new AsyncLocalStorage();\n// no middleware, depois de validar o token:\nals.run({ tenantId: claims.tenantId }, () => next());\n// na camada de dados:\nconst { tenantId } = als.getStore();'
          ),
          sl(
            'Vazamento entre tenants: o IDOR por tenant',
            'O pior defeito em multi-tenant é um tenant ler ou alterar dados de outro. É um IDOR/BOLA (veja a lição de autorização e o curso de Segurança Web): o identificador do recurso vem da URL e o servidor não confere o dono. Exemplo executado aqui com dados fictícios: a busca só por id devolve o pedido da loja B para quem é da loja A; a busca corrigida inclui o tenant do contexto. Medidas de defesa: toda leitura e escrita passa por UMA camada de dados que injeta o tenant (nada de consulta solta espalhada pelo código); em bancos como o PostgreSQL existe row-level security, que faz o próprio banco aplicar o filtro; resposta 404 (não 403) para recurso de outro tenant, para não confirmar que ele existe.',
            'const buscarSemTenant = (id) => pedidos.find((p) => p.id === id);\nconst buscar = (id) => {\n  const { tenantId } = als.getStore();\n  return pedidos.find((p) => p.id === id && p.tenantId === tenantId) ?? null;\n};\n// executado com tenant loja-a:\n// sem filtro : { id: 2, tenantId: \'loja-b\', total: 250 }\n// com filtro : null\n// proprio    : { id: 1, tenantId: \'loja-a\', total: 100 }'
          ),
          sl(
            'Testes e limites por tenant',
            'Vazamento não costuma aparecer em teste comum, porque o teste feliz usa um tenant só. O teste que importa cria dados em DOIS tenants, autentica como o tenant A e tenta ler, listar, alterar e apagar recursos do B, esperando 404 ou lista sem itens de B. Rode esse teste para cada rota nova. Outro problema do modelo compartilhado é o vizinho barulhento (noisy neighbor): um tenant com uso enorme degrada todos os outros. A resposta é aplicar limites POR TENANT, além dos limites por IP ou por usuário: rate limit por tenant, cotas de armazenamento e de requisições conforme o plano, filas separadas ou prioridade para jobs pesados (veja as lições de filas) e métricas com o rótulo do tenant para enxergar quem consome mais.'
          ),
          sl(
            'LGPD e dados por cliente',
            'Em visão geral e sem substituir orientação jurídica: quando sua plataforma guarda dados pessoais dos usuários de uma empresa cliente, a LGPD (Lei 13.709/2018) distingue papéis, e muitas vezes a empresa cliente decide o tratamento (controladora) enquanto você o executa (operadora); confirme isso com o jurídico e com o contrato. Tecnicamente, isso pede: poder EXPORTAR e EXCLUIR os dados de um tenant inteiro (o modelo por banco ou esquema facilita; no modelo por coluna precisa de rotina testada), definir retenção, evitar que backups e logs misturem ou guardem dados pessoais sem necessidade, registrar o tenant nos logs mas nunca o conteúdo pessoal, e restringir o acesso da sua própria equipe aos dados dos clientes, com auditoria de quem acessou o quê.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Uma plataforma de gestão atende 300 empresas com uma única instalação do sistema. Como cada empresa cliente é chamada nesse modelo?', 'b', ['Instância, porque cada empresa recebe um processo próprio da aplicação rodando no servidor', 'Tenant (inquilino), a unidade de cliente cujos dados precisam ficar isolados dos demais', 'Papel (role), pois cada empresa tem um conjunto de permissões', 'Shard, porque cada empresa fica em uma partição física do banco'], 'Tenant é o cliente (empresa, escola, equipe) que compartilha a mesma instalação com outros. Instância descreve um processo em execução, não um cliente. Papel agrupa permissões de usuários, e um tenant tem muitos usuários, cada um com seu papel. Shard é uma técnica de partição de dados que pode ou não coincidir com tenants; não é o nome do cliente.'),
        mcq('q2', 'Um produto tem milhares de clientes pequenos e uma equipe enxuta de operação. Qual modelo de isolamento costuma ser o mais barato de manter?', 'd', ['Um banco de dados por tenant, para ter o isolamento máximo', 'Um esquema por tenant, repetindo as tabelas e rodando as migrations em cada um deles', 'Um servidor dedicado por cliente, com a aplicação instalada separadamente', 'Tabelas compartilhadas com uma coluna tenant_id filtrada em toda consulta'], 'Com milhares de tenants pequenos, a coluna tenant_id mantém uma só estrutura, uma só migration e um só backup, ao custo de exigir disciplina no filtro. Banco ou esquema por tenant multiplicam migrations, conexões e monitoramento com o número de clientes, e servidor dedicado é o mais caro de todos: servem melhor a poucos clientes grandes com exigências contratuais.'),
        mcq('q3', 'De onde o servidor deve obter o tenant de uma requisição autenticada?', 'a', ['Da claim assinada do token ou da sessão validada, guardada no contexto da requisição', 'Do campo tenantId enviado no corpo JSON, porque o cliente sabe a qual empresa pertence', 'De um cabeçalho X-Tenant, desde que o front-end o preencha corretamente', 'Do parâmetro de query ?tenant=, já que fica visível na URL e facilita testar'], 'Só o token assinado (ou a sessão no servidor) não pode ser alterado pelo cliente. Corpo, cabeçalho livre e query string são controlados por quem envia a requisição: se o tenant vier deles, basta trocar o valor para acessar outro cliente. O fato de o front-end preencher certo não protege contra quem chama a API diretamente.'),
        fill('q4', 'Complete a consulta para que ela só devolva o pedido se ele pertencer ao tenant da requisição (nome da coluna de isolamento).', 'const sql = "SELECT * FROM pedidos WHERE id = $1 AND ___ = $2";', ['tenant_id', 'tenantid'], 'A coluna tenant_id, preenchida com o tenant vindo do contexto (nunca da URL), faz o banco devolver zero linhas quando o pedido é de outro cliente.'),
        mcq('q5', 'O endpoint GET /pedidos/:id executa SELECT ... WHERE id = $1 (consulta parametrizada). A empresa A consegue ler o pedido 2, que é da empresa B, apenas trocando o número na URL. O que é o problema e qual a correção?', 'c', ['XSS; escapar a saída HTML antes de enviá-la ao navegador', 'CSRF; exigir um token anti-CSRF nas requisições de leitura', 'IDOR entre tenants; incluir o tenant do contexto no filtro e responder 404 para recurso alheio', 'SQL injection; trocar por consulta parametrizada, que previne o vazamento de dados de outras empresas'], 'O identificador vem do cliente e o servidor não verifica o dono: é um IDOR (BOLA) por tenant, corrigido com o filtro tenant_id vindo do contexto. XSS e CSRF são outras classes de falha, sem relação com ler dados alheios por id. E a consulta já é parametrizada: isso impede injeção, mas não decide QUEM pode ver a linha.'),
        mcq('q6', 'Qual a vantagem de guardar o tenant em AsyncLocalStorage em vez de passá-lo manualmente como parâmetro por todas as funções?', 'b', ['O valor é compartilhado entre todas as requisições simultâneas, economizando memória', 'Cada requisição enxerga o próprio valor nas chamadas assíncronas, sem parâmetros extras e sem mistura entre requisições', 'Dispensa validar o token, porque o contexto já vem confiável do navegador', 'Faz o banco aplicar o filtro automaticamente em cada consulta, sem precisar consultar o tenant na camada de dados da aplicação'], 'O AsyncLocalStorage mantém um armazenamento por cadeia assíncrona: mesmo com milhares de requisições concorrentes e awaits, cada uma lê o seu contexto. Um valor global compartilhado seria justamente o bug que mistura tenants. O contexto não valida nada: o token ainda precisa ser verificado antes de alimentá-lo. E o banco só filtra se a consulta (ou uma política de row-level security) mandar.'),
        mcq('q7', 'Qual teste automatizado é o mais adequado para detectar vazamento entre tenants em uma rota nova?', 'd', ['Criar um tenant, popular dados e confirmar que ele lê os próprios registros', 'Medir o tempo de resposta da rota com milhões de registros em um único tenant e comparar com o limite de latência combinado', 'Autenticar como administrador e confirmar que todas as listagens funcionam', 'Criar dados em dois tenants e, autenticado como A, tentar acessar recursos do B, esperando 404 ou lista sem itens de B'], 'O vazamento só aparece quando existe um segundo tenant com dados e um chamador tentando alcançá-los. O teste com um tenant só passa mesmo com o filtro ausente; medir tempo avalia desempenho, não isolamento; e o administrador costuma ter acesso amplo, o que esconde a falha de isolamento.'),
        fill('q8', 'Complete o nome da classe do módulo node:async_hooks usada para guardar o contexto da requisição.', 'const { AsyncLocalStorage } = require("node:async_hooks");\nconst als = new ___();', ['AsyncLocalStorage'], 'AsyncLocalStorage cria o armazenamento cujo run() inicia um contexto e cujo getStore() o lê em qualquer chamada, síncrona ou assíncrona, dentro dele.')
      ]
    },
    {
      id: 'nji-21-upload-de-arquivos',
      title: 'Upload de arquivos',
      goal: 'Receber arquivos com segurança: multipart, limites, validação de conteúdo, nomes seguros, armazenamento fora da raiz pública e streams.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'multipart/form-data',
            'Para enviar arquivos em um formulário, o navegador usa o formato multipart/form-data: o corpo é dividido em PARTES (campos de texto e arquivos), separadas por uma marca chamada boundary, declarada no cabeçalho Content-Type. O express.json não entende esse formato, então é preciso uma biblioteca: Multer (para Express) ou busboy (de mais baixo nível, orientada a streams, usada por várias outras), por nome. Existem equivalentes para Fastify e Koa. Os exemplos são ilustrativos, não executados aqui; os trechos de nome seguro e de conferência de conteúdo foram executados de verdade com módulos nativos.'
          ),
          sl(
            'Limites de tamanho e quantidade',
            'Sem limites, qualquer pessoa pode enviar arquivos enormes e esgotar disco, memória e banda (negação de serviço). Defina limite de tamanho por arquivo (limits.fileSize no Multer), número máximo de arquivos e de campos, e também limite no servidor de borda (como o Nginx, veja o curso de Linux/Redes) para recusar antes de chegar ao Node. Exija autenticação em rotas de upload e considere cotas por usuário. Responda com 413 (conteúdo grande demais) quando passar do limite.',
            'const upload = multer({\n  dest: "/var/app-uploads/tmp",           // fora da pasta pública\n  limits: { fileSize: 2 * 1024 * 1024, files: 1 }\n});\napp.post("/avatar", exigirLogin, upload.single("arquivo"), tratar);\n// ilustrativo, não executado aqui'
          ),
          sl(
            'Validar o conteúdo, não só a extensão',
            'O nome do arquivo, a extensão e o Content-Type da parte são informados pelo CLIENTE e podem ser falsificados: um arquivo executável pode se chamar foto.png. Valide o conteúdo: cada formato começa com uma assinatura de bytes (magic bytes); um PNG começa por 89 50 4E 47 0D 0A 1A 0A. Compare os primeiros bytes com os tipos da sua LISTA PERMITIDA e rejeite o resto. Para imagens, o mais robusto é reprocessá-las (decodificar e gravar de novo com uma biblioteca de imagens), o que descarta conteúdo escondido. Saída real da conferência:',
            'const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);\nconst ehPng = (b) => b.subarray(0, 8).equals(PNG);\nconsole.log(ehPng(Buffer.concat([PNG, Buffer.from("resto")])), ehPng(Buffer.from("<?php echo 1;")));\n// true false'
          ),
          sl(
            'Nomes seguros',
            'Nunca use o nome original do arquivo para gravar no disco: ele pode conter ../ (path traversal, escapar da pasta e sobrescrever arquivos do sistema), caracteres estranhos, ou colidir com outro arquivo. Gere você mesmo o nome (crypto.randomUUID() mais uma extensão vinda da lista permitida) e guarde o nome original, se precisar exibi-lo, apenas como texto no banco. Saída real:',
            'const PERMITIDAS = new Map([[".png", "image/png"], [".jpg", "image/jpeg"]]);\nfunction nomeSeguro(original) {\n  const ext = path.extname(path.basename(original)).toLowerCase();\n  if (!PERMITIDAS.has(ext)) return null;\n  return crypto.randomUUID() + ext;\n}\nconsole.log(nomeSeguro("../../etc/passwd"));   // null\nconsole.log(nomeSeguro("foto.PNG")?.endsWith(".png")); // true'
          ),
          sl(
            'Onde guardar e como servir',
            'Grave os arquivos FORA da raiz pública do servidor web, em uma pasta que não seja servida diretamente, e sirva-os por uma rota controlada que confira a autorização (IDOR, lição anterior), defina o Content-Type conhecido, use Content-Disposition: attachment quando for download e o cabeçalho X-Content-Type-Options: nosniff. Servir uploads direto de uma pasta pública permitiria que um arquivo HTML ou script enviado por um usuário fosse executado no seu domínio (XSS). Uma alternativa comum é um armazenamento de objetos (compatível com S3) com permissões mínimas e URLs assinadas e temporárias. Documentos pessoais enviados por usuários (RG, comprovantes) são dados pessoais: restrinja o acesso, defina retenção e apague quando a finalidade acabar (LGPD, visão geral).'
          ),
          sl(
            'Streams e antivírus',
            'Não carregue o arquivo inteiro na memória (o armazenamento em memória do Multer é arriscado para arquivos grandes): grave por stream até o destino, usando pipeline (lições de streams), com um Transform que conta bytes e aborta ao passar do limite, apagando o arquivo parcial em caso de erro. Antivírus em conceito: arquivos enviados por terceiros podem ser escaneados (ClamAV, por nome, é um exemplo), de preferência de forma assíncrona: o arquivo fica em quarentena, inacessível, até o resultado do escaneamento. Isso reduz o risco, mas não substitui as demais camadas (limites, validação, armazenamento isolado).'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual destes dados do upload NÃO é confiável para decidir o tipo do arquivo?', 'c', [
          'Os primeiros bytes do conteúdo, comparados com a assinatura do formato',
          'O resultado da decodificação do arquivo por uma biblioteca de imagens',
          'A extensão e o Content-Type declarados pelo cliente, que podem ser falsificados',
          'O tamanho real, em bytes, medido pelo servidor durante a gravação'
        ], 'Extensão e Content-Type vêm do cliente e podem mentir. O conteúdo e a medição feita no servidor são verificáveis.'),
        mcq('q2', 'O que pode acontecer se o servidor gravar o arquivo usando path.join(pasta, nomeOriginal)?', 'b', [
          'O arquivo será recusado pelo sistema operacional por conter caracteres acentuados, já que o próprio Node cuida desse detalhe por baixo',
          'Um nome com ../ pode fazer o arquivo ser gravado fora da pasta (path traversal) ou sobrescrever outro',
          'O Node converterá automaticamente o nome para minúsculas e removerá a extensão',
          'O arquivo ficará protegido, pois o nome original comprova a origem do envio'
        ], 'O nome vem do cliente e pode conter ../. Gere o nome no servidor, com identificador aleatório e extensão da lista permitida.'),
        mcq('q3', 'Qual é a forma mais confiável de verificar que um arquivo é mesmo uma imagem PNG?', 'a', [
          'Conferir a assinatura de bytes do conteúdo, e, idealmente, reprocessar a imagem',
          'Conferir se o nome termina em .png e se o Content-Type diz image/png',
          'Pedir ao usuário que marque uma caixa confirmando o tipo do arquivo',
          'Verificar se o arquivo tem mais de 1 KB, pois arquivos pequenos são suspeitos'
        ], 'A assinatura de bytes e o reprocessamento avaliam o conteúdo real. Nome, Content-Type e declaração do usuário podem ser forjados.'),
        fill('q4', 'Complete a opção do Multer que limita o tamanho de cada arquivo.', 'limits: { ___: 2 * 1024 * 1024 }', ['fileSize'], 'limits.fileSize define o tamanho máximo, em bytes, de cada arquivo recebido.'),
        mcq('q5', 'Qual é a prática adequada para arquivos enviados por usuários desconhecidos antes de disponibilizá-los a outras pessoas?', 'd', [
          'Disponibilizá-los imediatamente, pois a extensão já foi conferida',
          'Guardá-los na mesma pasta do código-fonte, para facilitar o backup',
          'Confiar no navegador do usuário, que já os verificou antes do envio, sem necessidade de nenhuma configuração adicional',
          'Mantê-los em quarentena e liberar só após validação e escaneamento por antivírus'
        ], 'Arquivos de terceiros são entrada não confiável: validação, escaneamento e acesso apenas depois da aprovação reduzem o risco.'),
        mcq('q6', 'Onde devem ficar os arquivos enviados e como devem ser servidos?', 'c', [
          'Em uma pasta pública do servidor web, acessada diretamente pela URL do arquivo',
          'Dentro da pasta de código, com permissão de execução, para facilitar a atualização',
          'Fora da raiz pública, servidos por uma rota que confere a autorização e define o Content-Type',
          'Em localStorage do navegador, codificados em base64'
        ], 'Fora da raiz pública e servidos por rota controlada evita execução de conteúdo enviado e permite checar permissões. base64 em localStorage não é armazenamento de servidor.'),
        mcq('q7', 'Por que gravar o upload com stream e pipeline em vez de carregar o arquivo inteiro na memória?', 'a', [
          'Para não manter o arquivo todo na memória e poder abortar e limpar o parcial ao passar do limite',
          'Porque o pipeline valida automaticamente o tipo do arquivo pelo seu conteúdo',
          'Porque streams comprimem o arquivo, reduzindo o espaço ocupado em disco',
          'Porque o Node não consegue gravar arquivos sem usar streams de qualquer maneira, o que costuma ser suficiente para a maioria das aplicações'
        ], 'Streams limitam o consumo de memória e permitem interromper o processo e apagar o que sobrou. Não validam tipo nem comprimem sozinhas.'),
        fill('q8', 'Complete o nome da marca que separa as partes de um corpo multipart e vem declarada no Content-Type.', 'Content-Type: multipart/form-data; ___=abc123', ['boundary'], 'O boundary é a marca de separação entre as partes do corpo multipart.')
      ]
    },
    {
      id: 'nji-49-gerando-csv-pdf-e-relatorios',
      title: 'Gerando CSV, PDF e relatórios',
      goal: 'Gerar CSV com streams e escape correto, neutralizar injeção de fórmula, conhecer opções de PDF, processar relatórios grandes em fila e entregá-los por link temporário assinado, com cuidado com dados pessoais.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'CSV com streams',
            'CSV (comma-separated values) é texto em que cada linha é um registro e as colunas são separadas por vírgula. É o formato mais comum para exportar tabelas. Para relatórios grandes não monte tudo em um array e depois em uma string gigante: isso consome memória proporcional ao relatório inteiro. Use streams (veja as lições de streams): leia os registros aos poucos, transforme cada um em uma linha e escreva na saída, com backpressure cuidando do ritmo. Exemplo executado, com dados fictícios: Readable.from gera os objetos, um Transform os converte em linhas e pipeline os liga à saída (na API real, a resposta HTTP no lugar de process.stdout).',
            'const { Readable, Transform } = require("node:stream");\nconst { pipeline } = require("node:stream/promises");\nconst paraCsv = new Transform({\n  writableObjectMode: true,\n  transform(o, _e, cb) { cb(null, [o.id, o.nome, o.obs].map(celula).join(",") + "\\n"); },\n});\nparaCsv.push("id,nome,obs\\n");\nawait pipeline(Readable.from(linhas), paraCsv, process.stdout);'
          ),
          sl(
            'Escape de campos',
            'Um campo que contém vírgula, aspas ou quebra de linha quebraria as colunas se fosse escrito cru. A regra do CSV: coloque o campo entre aspas duplas e DOBRE as aspas internas. O nome Ana, a "Dev" vira "Ana, a ""Dev""". Sem isso, a linha ganha colunas a mais e o arquivo fica corrompido. Detalhes práticos: o separador pode ser ponto e vírgula, porque o Excel em português do Brasil costuma usar essa convenção (documente a escolha); use UTF-8 e, se a planilha precisar abrir direto com acentos, avalie incluir o BOM; defina o formato de data (ISO) e use ponto decimal fixo ou deixe claro o formato. Não use split(",") para LER CSV de terceiros: aspas e vírgulas internas exigem um parser de verdade (ilustrativo, por nome: csv-parse).'
          ),
          sl(
            'Injeção de fórmula em CSV',
            'Planilhas (Excel, Google Planilhas, LibreOffice) interpretam como FÓRMULA uma célula que começa com =, +, - ou @. Se um usuário cadastra o nome =1+1 (ou uma fórmula mais maliciosa que acessa dados ou links) e você exporta o CSV sem cuidado, quem abrir o relatório vê a fórmula ser executada: é a injeção de fórmula (CSV injection). A defesa recomendada por guias de segurança: se o texto começa com um desses caracteres (ou tabulação ou retorno de carro), prefixe uma aspa simples para a planilha tratar como texto. Executado: o escape ingênuo mantém =1+1; a função corrigida devolve \'=1+1. Efeito colateral: um número negativo em texto (-5) também ganha o prefixo, então aplique a regra só em campos de TEXTO vindos de usuários, e escreva números reais sem prefixo. Nada de exemplos de payload perigoso aqui: o ponto é neutralizar.',
            'const celula = (v) => {\n  let s = String(v ?? "");\n  if (/^[=+\\-@\\t\\r]/.test(s)) s = "\'" + s; // neutraliza fórmula\n  if (/[",\\n\\r]/.test(s)) s = \'"\' + s.replace(/"/g, \'""\') + \'"\';\n  return s;\n};\n// saída executada do stream:\n// id,nome,obs\n// 1,"Ana, a ""Dev""",ok\n// 2,\'=1+1,"linha1\n// linha2"\n// 3,\'@SOMA(A1),\'-5'
          ),
          sl(
            'PDF: opções por nome',
            'PDF é um formato de página fixa, ótimo para documentos para imprimir ou assinar. Há duas famílias de solução em Node (ilustrativo, não executado aqui; confira a documentação e a licença de cada pacote). (1) Desenhar o PDF por código, com bibliotecas como PDFKit ou pdf-lib: controle total, bom para documentos simples e tabulares. (2) Escrever o relatório em HTML e CSS e converter com um navegador sem interface, como Puppeteer ou Playwright: reaproveita o seu design, porém consome bastante memória e CPU e deve rodar isolado, em fila. Ao converter HTML, escape os dados do usuário (XSS vira vazamento de arquivos locais ou de rede interna quando o navegador do servidor renderiza a página) e bloqueie o acesso a recursos externos que a página não precisa.'
          ),
          sl(
            'Relatórios grandes: fila e link temporário assinado',
            'Um relatório com milhões de linhas não cabe em uma requisição HTTP que o usuário espera: ele estoura timeouts e ocupa o servidor. Padrão: o endpoint apenas ENFILEIRA o pedido (veja a lição de filas e jobs), responde 202 com um identificador, um worker gera o arquivo em segundo plano, grava em armazenamento e avisa a pessoa (e-mail, notificação); a tela consulta o status. Para entregar o arquivo, não deixe a pasta pública: gere um link temporário assinado. Ele leva o nome do arquivo e um instante de expiração, protegidos por uma assinatura HMAC; o servidor confere a assinatura e a expiração antes de servir. Serviços de armazenamento em nuvem oferecem URLs pré-assinadas com a mesma ideia. Executado, com tempo simulado:',
            'const assina = (arquivo, expira) =>\n  crypto.createHmac("sha256", SEGREDO).update(`${arquivo}.${expira}`).digest("hex");\n// /download/relatorio-42.csv?expira=1700000300000&sig=05d6ab70...\n// agora    : true\n// expirado : false\n// outro arq: false'
          ),
          sl(
            'Dados pessoais em relatórios',
            'Relatórios concentram dados e circulam por e-mail, pendrives e planilhas, longe dos controles da sua aplicação. Em visão geral (LGPD, Lei 13.709/2018; não substitui orientação jurídica): exporte só as colunas necessárias para a finalidade (minimização), mascare o que não precisa aparecer inteiro (por exemplo, parte de um documento), restrinja quem pode gerar cada relatório (autorização por papel e por tenant), registre em log QUEM gerou e QUANDO (sem gravar o conteúdo pessoal), dê validade curta ao link e apague os arquivos gerados depois de um prazo definido. Evite enviar o arquivo anexado por e-mail: envie o link protegido e exija autenticação para baixá-lo.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um relatório de exportação tem milhões de linhas e a aplicação monta um array completo e depois uma string para enviar. O que é melhor fazer?', 'a', ['Ler os registros aos poucos e escrever cada linha por stream com pipeline', 'Aumentar o limite de memória do processo até caber o relatório inteiro, monitorando o consumo', 'Dividir o arquivo em partes de tamanho fixo no navegador do usuário', 'Converter o relatório para JSON, que ocupa menos memória que o CSV'], 'Com streams cada linha é gerada e enviada aos poucos, com backpressure, e a memória não cresce com o tamanho do relatório. Aumentar o limite só adia o estouro, o navegador não participa da geração e JSON costuma ocupar mais, não menos, que CSV.'),
        mcq('q2', 'O campo nome vale Ana, a "Dev". Qual é a forma correta de escrevê-lo em uma célula CSV?', 'c', ['Ana, a "Dev" sem alteração, porque o leitor entende pelo contexto', 'Ana\\, a \\"Dev\\", escapando com barras invertidas', '"Ana, a ""Dev""", com o campo entre aspas e as aspas internas dobradas', '"Ana, a "Dev"", com o campo entre aspas e as aspas internas mantidas como no texto original'], 'A convenção CSV é envolver o campo em aspas duplas e dobrar as aspas internas. Sem aspas, a vírgula cria uma coluna a mais; barras invertidas não são escape de CSV; e manter as aspas internas sem dobrar fecha o campo antes da hora e corrompe a linha.'),
        mcq('q3', 'Um usuário cadastra o nome =1+1 e o relatório exportado é aberto em uma planilha. Qual o risco e a defesa?', 'b', ['SQL injection; trocar por consulta parametrizada na hora de exportar', 'Injeção de fórmula; prefixar aspa simples nos campos de texto que começam com =, +, - ou @', 'Estouro de memória; limitar o tamanho do nome a 10 caracteres e rejeitar cadastros maiores que isso', 'Falha de codificação; salvar o arquivo em UTF-16 com marca de ordem de bytes'], 'Planilhas executam o conteúdo que começa com esses caracteres como fórmula, e o prefixo com aspa simples faz a célula ser tratada como texto. SQL injection ocorre no banco, não na planilha; limitar o tamanho não impede a fórmula e a codificação do arquivo não decide se algo é fórmula.'),
        fill('q4', 'Complete o método que cria um stream legível a partir de um array de objetos.', 'await pipeline(Readable.___(linhas), paraCsv, saida);', ['from'], 'Readable.from(iterável) cria um stream que emite cada elemento, pronto para entrar em um pipeline.'),
        mcq('q5', 'Gerar um PDF complexo a partir de HTML com um navegador sem interface está deixando a API lenta e consumindo muita memória. Qual é a melhor solução?', 'd', ['Gerar o PDF dentro do próprio manipulador da rota, para o usuário esperar a resposta pronta na mesma conexão', 'Desabilitar o escape do HTML para a conversão ser mais rápida', 'Trocar o PDF por CSV, sem consultar quem usa o relatório', 'Enfileirar a geração em workers isolados e entregar o arquivo por link temporário'], 'Conversão de HTML em PDF é pesada e deve sair do caminho da requisição: fila, worker isolado e entrega assíncrona protegem a API. Fazê-la na rota agrava a lentidão; desabilitar o escape cria risco de XSS no navegador do servidor; e trocar o formato ignora a necessidade de quem precisa imprimir ou assinar.'),
        mcq('q6', 'Qual é a vantagem de um link temporário assinado sobre uma pasta pública de relatórios?', 'a', ['O acesso expira e a assinatura impede alterar o arquivo ou o prazo na URL', 'O arquivo fica criptografado no disco do servidor sem outra configuração, e só o link o decifra', 'O link pode ser compartilhado e continuar válido sem prazo de validade', 'A assinatura dispensa autenticação e autorização na geração do relatório'], 'A assinatura HMAC cobre o arquivo e a expiração: mudar qualquer um invalida o link, e passado o prazo ele para de funcionar. Assinar a URL não criptografa o arquivo, o link não é eterno por definição e quem pode GERAR o relatório ainda precisa passar por autorização.'),
        mcq('q7', 'Para uma exportação de clientes, o time propõe incluir todas as colunas do cadastro "por garantia". Qual é a melhor orientação sob a ótica de privacidade?', 'c', ['Incluir tudo, pois depois a planilha pode ser filtrada pelo usuário', 'Incluir tudo e proteger o arquivo com uma senha enviada no mesmo e-mail', 'Exportar só as colunas necessárias, mascarar o que puder, restringir quem gera e dar validade curta ao link', 'Desativar o registro de quem gerou o relatório, para não guardar mais dados pessoais nos logs do sistema'], 'Minimização é exportar o necessário para a finalidade, com mascaramento, autorização e prazo curto. Enviar tudo espalha dados pessoais sem necessidade, senha no mesmo e-mail protege pouco e registrar QUEM gerou (sem o conteúdo pessoal) é justamente o que permite auditar.'),
        fill('q8', 'Complete o formato de saída do resumo HMAC usado na assinatura do link.', 'crypto.createHmac("sha256", SEGREDO).update(dados).digest("___");', ['hex'], 'digest("hex") devolve o resumo como texto hexadecimal, adequado para colocar em uma URL.')
      ]
    },
    {
      id: 'nji-22-paginacao-filtros-e-ordenacao',
      title: 'Paginação, filtros e ordenação',
      goal: 'Paginar com offset e cursor, impor limites máximos, ordenar com lista permitida, filtrar com parâmetros e desenhar a resposta.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que paginar',
            'Uma rota que devolve TODAS as linhas de uma tabela funciona com 50 registros e derruba o sistema com 5 milhões: memória do Node, tempo do banco, banda e navegador. Paginar é entregar os dados em páginas pequenas. É também uma defesa contra abuso: uma requisição não deve conseguir pedir "tudo". Toda rota de listagem precisa de paginação, mesmo que hoje a tabela seja pequena. Esta lição fecha a primeira parte do nível ligando banco, segurança e desenho de API.'
          ),
          sl(
            'Offset e limit',
            'A forma mais simples: ?pagina=3&limite=20, que vira LIMIT 20 OFFSET 40. Vantagens: fácil e permite "pular para a página N". Problemas: com offsets grandes o banco precisa percorrer e DESCARTAR todas as linhas anteriores, ficando lento; e se linhas são inseridas ou apagadas entre uma página e outra, itens aparecem repetidos ou são pulados. Serve bem para listas pequenas e telas administrativas.'
          ),
          sl(
            'Cursor (keyset): execução real',
            'Na paginação por cursor, a resposta devolve um marcador do último item visto, e o próximo pedido pede "o que vem depois dele": WHERE id > $1 ORDER BY id LIMIT $2. Com índice na coluna, o banco vai direto ao ponto, qualquer que seja a profundidade, e o resultado é estável diante de inserções. Custo: não dá para pular para a página N, só avançar. O truque de buscar limite+1 linhas diz se há próxima página sem fazer uma contagem. Saída real da simulação com 25 itens:',
            'function paginaCursor(depoisDe = 0, limite = 5) {\n  const lim = Math.min(Math.max(Number(limite) || 5, 1), 10);   // clamp: máximo 10\n  const fatia = itens.filter((i) => i.id > depoisDe).slice(0, lim + 1);\n  const temMais = fatia.length > lim;\n  const dados = fatia.slice(0, lim);\n  return { dados: dados.map((d) => d.id), proximoCursor: temMais ? dados.at(-1).id : null };\n}\npaginaCursor(0, 5);     // { dados: [ 1, 2, 3, 4, 5 ], proximoCursor: 5 }\npaginaCursor(20, 100);  // { dados: [ 21, 22, 23, 24, 25 ], proximoCursor: null }\npaginaCursor(0, "abc"); // { dados: [ 1, 2, 3, 4, 5 ], proximoCursor: 5 }'
          ),
          sl(
            'Limites máximos',
            'O cliente controla ?limite=, e sem teto ele pode pedir 1000000. Sempre: converta para inteiro (valor não numérico cai no padrão), imponha um MÍNIMO e um MÁXIMO (clamp, como no código acima) e tenha um padrão razoável. O mesmo vale para o tamanho de strings de busca e a quantidade de filtros. O limite máximo é uma decisão de projeto (algo como 50 ou 100) revisada conforme o custo de cada rota.'
          ),
          sl(
            'Ordenação segura',
            'O cliente quer ?ordem=nome&direcao=desc. Nomes de colunas não podem ser parâmetros do SQL ($1 só substitui valores), e concatenar o texto do cliente seria injeção de SQL. Solução: LISTA PERMITIDA (allowlist) de campos ordenáveis; se o valor não estiver nela, use um padrão; a direção só pode ser asc ou desc. Para paginar bem, a ordenação precisa ser determinística: se o campo não é único (criado_em), acrescente um desempate (id), senão linhas podem se repetir ou sumir entre páginas. Crie índices coerentes com as ordenações permitidas. Saída real:',
            'const CAMPOS = new Set(["id", "nome"]);\nconst ordem = (campo, dir) => (CAMPOS.has(campo) ? `${campo} ${dir === "desc" ? "DESC" : "ASC"}` : "id ASC");\nconsole.log(ordem("nome", "desc"), "|", ordem("senha; DROP", "x"));\n// nome DESC | id ASC'
          ),
          sl(
            'Filtros e formato da resposta',
            'Filtros: aceite apenas campos conhecidos e operadores previstos; valores SEMPRE como parâmetros (lição de SQL); no MongoDB, confira que o valor é do tipo esperado (lição de injeção NoSQL); em buscas por texto com LIKE, escape os curingas % e _ vindos do usuário; evite aceitar expressões regulares do cliente (custo e ReDoS). Resposta: um objeto com os dados e metadados, por exemplo { dados: [...], paginacao: { limite, proximoCursor } }. O total geral (COUNT) é caro em tabelas grandes: ofereça só se necessário. Trate o cursor como um valor opaco para o cliente (mas ele NÃO é segredo, então valide-o ao recebê-lo) e devolva apenas os campos necessários de cada item (minimização de dados).'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que toda rota de listagem deve ter paginação, mesmo com a tabela pequena hoje?', 'd', [
          'Porque o navegador recusa respostas JSON com mais de 20 itens',
          'Porque o banco de dados proíbe consultas sem LIMIT em tabelas de produção',
          'Porque paginar substitui a necessidade de índices e de autenticação',
          'Porque a tabela cresce, e uma requisição sem limite pode esgotar memória, banco e banda'
        ], 'Sem paginação, um volume futuro maior (ou um abuso) pode derrubar o serviço. Os demais motivos não existem.'),
        mcq('q2', 'Qual é o principal problema de OFFSET muito grande?', 'c', [
          'O OFFSET não funciona com ORDER BY e devolve linhas em ordem aleatória',
          'O banco devolve erro quando o OFFSET passa de mil, protegendo a memória',
          'O banco precisa percorrer e descartar as linhas anteriores, e a página fica cada vez mais lenta',
          'O OFFSET criptografa as linhas ignoradas e só as descriptografa na próxima consulta, e isso dispensa qualquer verificação posterior no código'
        ], 'OFFSET N obriga a leitura das N linhas anteriores antes de descartá-las. A paginação por cursor evita esse custo.'),
        mcq('q3', 'Como funciona a paginação por cursor (keyset)?', 'b', [
          'Guarda no servidor a lista completa dos resultados e entrega um pedaço a cada chamada',
          'Pede os itens que vêm depois do último visto (WHERE id > último), aproveitando o índice',
          'Divide a tabela em N partes iguais e entrega a parte de número pedido pelo cliente',
          'Ordena os resultados aleatoriamente a cada chamada para distribuir a carga'
        ], 'O cursor marca o último item visto e a consulta continua dali, de forma estável e rápida com índice.'),
        fill('q4', 'Complete a função que impõe o limite máximo de itens por página.', 'const lim = Math.___(Math.max(Number(limite) || 5, 1), 100);', ['min'], 'Math.min limita o valor ao máximo permitido (aqui 100); Math.max garante o mínimo.'),
        mcq('q5', 'O cliente envia ?ordem=senha_hash. Qual tratamento é correto?', 'a', [
          'Comparar com uma lista permitida de campos ordenáveis e usar a ordenação padrão se não constar',
          'Concatenar o valor ao ORDER BY, pois a coluna existe no banco de dados',
          'Passar o valor como parâmetro ($1), pois parâmetros funcionam para nomes de colunas, conforme o comportamento padrão das versões mais antigas',
          'Recusar valores com espaços, aspas ou ponto e vírgula e aceitar o restante'
        ], 'Identificadores não aceitam parâmetros e filtrar caracteres é frágil: só uma lista permitida é segura (e senha_hash nunca deve estar nela).'),
        mcq('q6', 'Alguém chama /itens?limite=1000000. Qual é a resposta adequada do servidor?', 'd', [
          'Devolver a quantidade pedida, pois o cliente tem o direito de escolher o tamanho da página',
          'Fechar a conexão sem responder, para desencorajar chamadas semelhantes',
          'Converter o valor para texto e executar a consulta sem limite algum',
          'Limitar ao máximo configurado (ou recusar com 400), respondendo o que é permitido'
        ], 'O servidor define o teto. Aceitar o valor permitiria esgotar memória e banco com uma única requisição.'),
        mcq('q7', 'Uma lista é ordenada por criado_em, que pode se repetir, sem outro critério. O que pode acontecer ao paginar?', 'b', [
          'Nada: o banco garante uma ordem estável também entre linhas com valores iguais',
          'Linhas com o mesmo valor podem aparecer repetidas ou ser puladas; acrescente o id como desempate',
          'As páginas ficam vazias, pois campos de data não podem ser usados em ORDER BY',
          'O banco ordena aleatoriamente os dados e ignora o critério informado'
        ], 'Sem desempate, a ordem entre empatados não é determinística e pode mudar entre consultas. Acrescentar uma coluna única resolve.'),
        fill('q8', 'Complete a palavra do SQL que limita a quantidade de linhas devolvidas na paginação por cursor.', 'SELECT id, nome FROM itens WHERE id > $1 ORDER BY id ___ $2', ['LIMIT'], 'LIMIT restringe a quantidade de linhas; com o cursor no WHERE e o índice, a página é rápida.')
      ]
    },
    {
      id: 'nji-47-internacionalizacao-datas-e-moedas',
      title: 'Internacionalização, datas e moedas',
      goal: 'Tratar fusos e UTC no servidor, formatar datas e valores com Intl, guardar dinheiro sem ponto flutuante e lidar com textos, Unicode e ordenação por idioma.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Fusos horários: UTC no servidor',
            'Um instante no tempo (por exemplo, 10 de março, 02:30 em Londres) tem horas diferentes em cada fuso, e alguns lugares mudam o relógio no horário de verão. A regra para back-end: guarde e trafegue instantes em UTC, no formato ISO 8601 com o sufixo Z (2025-03-10T02:30:00.000Z, o que Date.toISOString devolve), e converta para o fuso da pessoa somente na hora de EXIBIR. Assim o banco, os logs e os cálculos de intervalo não dependem do fuso da máquina onde o servidor roda. Erros comuns: guardar a hora local sem informar o fuso (ninguém sabe depois a que instante se referia), calcular "um dia depois" somando 24 horas (um dia local pode ter 23 ou 25 horas) e comparar datas como texto em formatos diferentes. Para datas de calendário sem hora (aniversário), guarde a data como AAAA-MM-DD, sem fuso.'
          ),
          sl(
            'Intl: datas formatadas por idioma e fuso',
            'Node traz o objeto global Intl, que formata datas, números e textos conforme o idioma e a região (o locale, como pt-BR, en-US, ja-JP). Intl.DateTimeFormat recebe o locale e opções (dateStyle, timeStyle e timeZone) e formata um Date. Veja o MESMO instante em fusos e idiomas diferentes, executado de verdade. Não monte datas concatenando pedaços: a ordem dia/mês/ano e o tipo de hora variam de lugar para lugar.',
            'const d = new Date("2025-03-10T02:30:00Z");\nconsole.log(d.toISOString());\nnew Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(d);\nnew Intl.DateTimeFormat("en-US", { dateStyle: "short", timeStyle: "short", timeZone: "America/New_York" }).format(d);\nnew Intl.DateTimeFormat("ja-JP", { dateStyle: "long", timeZone: "Asia/Tokyo" }).format(d);\n// 2025-03-10T02:30:00.000Z\n// 09/03/2025, 23:30\n// 3/9/25, 10:30 PM\n// 2025年3月10日'
          ),
          sl(
            'Intl: números e moeda',
            'Intl.NumberFormat formata números e valores monetários: separador decimal, separador de milhar, posição e símbolo da moeda mudam por locale. Em pt-BR usa-se vírgula decimal e ponto de milhar; em en-US é o contrário. Para moeda passe style "currency" e o código ISO da moeda (BRL, USD, EUR): o locale define COMO mostrar, e currency define QUAL moeda; são escolhas independentes (um usuário brasileiro pode ver dólares). Resultados executados:',
            'const centavos = 1999;\nnew Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(centavos / 100);\nnew Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(1234567.89);\nnew Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(1234567.89);\n// R$ 19,99\n// $1,234,567.89\n// 1.234.567,89 €'
          ),
          sl(
            'Dinheiro nunca em ponto flutuante',
            'Números do JavaScript são ponto flutuante binário: muitos decimais simples (0,1 e 0,2) não têm representação exata, e as contas acumulam erro. Executado: 0.1 + 0.2 resulta em 0.30000000000000004 e a comparação com 0.3 dá false. Com dinheiro isso vira centavo perdido ou cobrança errada. Soluções: (1) guardar o valor como INTEIRO na menor unidade da moeda (1999 centavos em vez de 19,99), somar e subtrair inteiros e dividir para exibir somente no fim, com regra explícita de arredondamento; (2) usar um tipo decimal exato, como o NUMERIC do banco ou uma biblioteca de decimais (ilustrativo, por nome). Atenção: nem toda moeda tem dois decimais (o iene não tem; alguns dinares têm três), então guarde também o código da moeda junto do valor.',
            'console.log(0.1 + 0.2);        // 0.30000000000000004\nconsole.log(0.1 + 0.2 === 0.3); // false\nconsole.log(1999 + 1);          // 2000 (centavos: exato)'
          ),
          sl(
            'Mensagens traduzidas',
            'Internacionalizar (i18n) é preparar o sistema para vários idiomas; localizar é entregar cada idioma. Não escreva frases soltas no código: use CHAVES de mensagem (erro.saldo_insuficiente) e um dicionário por idioma. O idioma vem do pedido (cabeçalho Accept-Language, preferência salva no perfil) e há um idioma de reserva (fallback) quando falta tradução. Em APIs, um desenho robusto devolve um CÓDIGO de erro estável e deixa o cliente traduzir; quando o servidor traduz, mantém o código junto. Plural também varia por idioma: Intl.PluralRules("pt-BR").select(1) devolve "one" e select(2) devolve "other"; em outros idiomas há mais categorias, então evite montar plural com if (n === 1). Mensagens de erro continuam sem expor detalhes internos em qualquer idioma.'
          ),
          sl(
            'Unicode e ordenação por idioma',
            'Um mesmo texto pode ter representações diferentes: "café" pode ser escrito com o caractere único é ou com o e seguido de um acento combinante. Visualmente iguais, mas === dá false e o length muda (4 contra 5). Para comparar, buscar ou usar como chave, normalize os dois lados com texto.normalize("NFC"). Outra armadilha: sort() sem função ordena pelos códigos dos caracteres, e letras acentuadas vão para o fim. Para ordenar nomes use localeCompare com o locale. Executado com Zélia, Ana, Émerson, Eduardo e Álvaro: sort() puro dá Ana, Eduardo, Zélia, Álvaro, Émerson; com localeCompare("pt-BR") dá Álvaro, Ana, Eduardo, Émerson, Zélia. Em bancos de dados a ordenação também depende do collation configurado.',
            'const a = "caf\\u00e9", b = "cafe\\u0301";\nconsole.log(a === b, a.length, b.length);\nconsole.log(a.normalize("NFC") === b.normalize("NFC"));\n// false 4 5\n// true\nnomes.sort((x, y) => x.localeCompare(y, "pt-BR"));'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um servidor registra em cada pedido a hora local "10/03/2025 23:30" sem informar o fuso. Qual é o problema e a melhor correção?', 'c', ['Não há problema: o banco converte o texto para o fuso do usuário ao ler', 'O formato está errado só por usar barras; trocar por hífens resolve o problema', 'Não se sabe a que instante se refere; guardar em UTC (ISO 8601 com Z) e converter para o fuso da pessoa na exibição', 'O horário de verão causa o erro; basta desligá-lo no servidor e regravar os registros antigos com a hora corrigida'], 'Hora local sem fuso é ambígua: o mesmo texto representa instantes diferentes em cada lugar. O instante em UTC, em ISO 8601, é inequívoco e a conversão fica para a borda de exibição. O banco não tem como adivinhar o fuso, o separador de data não é o ponto central e desligar o horário de verão do servidor não corrige dados já ambíguos nem o fuso dos usuários.'),
        mcq('q2', 'Em um sistema de cobrança, o valor 19,99 precisa ser somado a centenas de itens e armazenado. Qual abordagem evita erros de arredondamento?', 'a', ['Guardar inteiros em centavos (1999), com a moeda ao lado', 'Guardar o número como Number com duas casas decimais, chamando toFixed(2) depois de cada soma realizada', 'Guardar como texto "19,99" e converter com parseFloat antes de cada soma', 'Multiplicar por 1,0 antes de somar, para forçar a precisão decimal'], 'Inteiros na menor unidade são exatos em somas e subtrações, e o código da moeda diz quantas casas existem. Com Number e toFixed ou parseFloat o valor continua sendo ponto flutuante binário e o erro pode reaparecer a cada operação; multiplicar por 1,0 não muda a representação de forma alguma.'),
        mcq('q3', 'O que o console mostra ao executar console.log(0.1 + 0.2 === 0.3) e por quê?', 'd', ['true, porque o JavaScript arredonda o resultado para 15 casas decimais antes de fazer a comparação', 'true, porque 0.1 + 0.2 é exatamente 0.3 em qualquer linguagem', 'Gera um erro de tipo, porque números decimais exigem uma classe própria', 'false, pois 0.1 e 0.2 não são exatos em binário e a soma dá 0.30000000000000004'], 'A soma dá 0.30000000000000004, diferente de 0.3, e a igualdade é false. O JavaScript não arredonda antes de comparar, a aritmética exata de 0.1 e 0.2 não existe em ponto flutuante binário, e comparar números decimais não gera erro de tipo: simplesmente devolve false.'),
        fill('q4', 'Complete o código ISO da moeda para formatar um valor em reais brasileiros.', 'new Intl.NumberFormat("pt-BR", { style: "currency", currency: "___" }).format(19.99);', ['BRL'], 'BRL é o código ISO 4217 do real. O locale pt-BR define a forma de exibir, e currency escolhe a moeda.'),
        mcq('q5', 'Uma API devolve o erro "Saldo insuficiente" escrito direto no código, e agora o produto terá versões em inglês e espanhol. Qual mudança é mais adequada?', 'b', ['Duplicar as rotas para cada idioma, com uma cópia do código em cada uma', 'Usar um código de erro estável e dicionários por idioma, escolhendo o idioma pelo Accept-Language', 'Pedir que o cliente envie o texto já traduzido no corpo do pedido que causou o erro, para o servidor só repetir', 'Traduzir com concatenação, montando a frase por pedaços conforme o idioma'], 'Chaves ou códigos estáveis mais dicionários separam a lógica do texto, e o idioma de reserva cobre traduções faltantes. Duplicar rotas multiplica manutenção; o cliente não tem como traduzir uma mensagem que ainda não recebeu; e montar frases por pedaços quebra com ordens de palavras e plurais diferentes entre idiomas.'),
        mcq('q6', 'Dois cadastros mostram o nome "José", mas a comparação nome1 === nome2 dá false e o length difere. Qual a causa mais provável e a correção?', 'd', ['Diferença de fuso horário entre os registros; converter para UTC', 'Um dos nomes tem espaço no final; aplicar trim() resolve o problema', 'O locale do servidor é diferente entre as máquinas; configurar pt-BR no processo e reiniciar a aplicação em cada uma', 'Formas Unicode diferentes do mesmo texto; normalizar os dois com normalize("NFC") antes de comparar'], 'O é pode ser um caractere único ou e mais um acento combinante: parecem idênticos, mas são sequências diferentes, e o length acusa isso (4 contra 5, como no exemplo da lição). normalize("NFC") unifica as formas. Fuso não interfere em strings de nome, trim() só remove espaços e o locale do processo não altera a forma como os caracteres estão armazenados.'),
        mcq('q7', 'Uma lista de nomes com acentos aparece com Álvaro e Émerson depois de Zélia. O que causou isso e como corrigir?', 'a', ['sort() puro compara por códigos dos caracteres; usar localeCompare(y, "pt-BR")', 'O banco de dados perdeu os acentos; é preciso regravar os nomes em letras maiúsculas', 'O Node não suporta português; é necessário instalar um pacote de idiomas', 'A lista está em UTF-16 e deve ser convertida para Buffer antes de ordenar'], 'O sort() padrão compara as unidades de texto pelos códigos, e as letras acentuadas têm códigos maiores que as do alfabeto simples, indo para o fim. localeCompare usa as regras do idioma. Os acentos estão preservados, o Node tem Intl embutido com suporte a pt-BR e a codificação interna das strings não é o motivo da ordem.'),
        fill('q8', 'Complete o método que unifica as representações Unicode de um texto antes de compará-lo.', 'const igual = a.___("NFC") === b.normalize("NFC");', ['normalize'], 'normalize("NFC") converte as duas strings para a mesma forma canônica composta, permitindo a comparação correta.')
      ]
    },
    {
      id: 'nji-23-websockets-e-socket-io',
      title: 'WebSockets e Socket.IO',
      goal: 'Entender como uma conexão WebSocket nasce (handshake), quando usá-la, o que Socket.IO acrescenta e como autenticar, limitar e escalar com segurança.',
      xp: 20,
      intro: {
        slides: [
          sl('O problema: HTTP só responde quando perguntam', 'No HTTP comum o cliente faz um pedido e o servidor responde; o servidor nunca puxa conversa por conta própria. Para um chat, um painel de cotações ou um jogo, isso obriga o cliente a perguntar o tempo todo (polling), gastando requisições e chegando atrasado. WebSocket é um protocolo que mantém UMA conexão aberta e permite que cliente e servidor enviem mensagens a qualquer momento, nos dois sentidos (comunicação full-duplex). Cada pedaço enviado se chama mensagem (por baixo, frames).'),
          sl('O handshake: começa como HTTP', 'Toda conexão WebSocket nasce como um GET HTTP comum com cabeçalhos pedindo para trocar de protocolo: Upgrade: websocket, Connection: Upgrade e Sec-WebSocket-Key (um valor aleatório em base64). Se o servidor aceita, responde 101 Switching Protocols e inclui Sec-WebSocket-Accept, calculado como base64(sha1(chave + um GUID fixo do padrão)). Isso prova que o servidor entendeu o protocolo. Depois da resposta 101 a mesma conexão TCP passa a carregar mensagens WebSocket. Endereços usam ws:// (sem TLS) ou wss:// (com TLS, o que se usa em produção).', 'const crypto = require(\'node:crypto\');\nconst GUID = \'258EAFA5-E914-47DA-95CA-C5AB0DC85B11\';\nconst chave = \'dGhlIHNhbXBsZSBub25jZQ==\'; // exemplo da especificação\nconst aceite = crypto.createHash(\'sha1\').update(chave + GUID).digest(\'base64\');\nconsole.log(\'Sec-WebSocket-Accept:\', aceite);\n// saída real (executado aqui):\n// Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo='),
          sl('ws e Socket.IO: duas camadas diferentes', 'ws é um pacote de terceiros que implementa só o protocolo WebSocket: simples, leve, você controla tudo. Socket.IO é outro pacote, uma camada acima, com protocolo PRÓPRIO: eventos com nome (socket.emit("mensagem", dados)), salas, confirmações, reconexão automática e fallback para long polling. Consequência importante: um cliente Socket.IO só conversa com servidor Socket.IO; um cliente WebSocket puro não conversa com ele. Em versões recentes o Node traz também um cliente WebSocket nativo; confira a documentação oficial da versão em uso.', '// Ilustrativo, não executado aqui (pacote ws)\nconst { WebSocketServer } = require(\'ws\');\nconst wss = new WebSocketServer({ port: 8080, maxPayload: 64 * 1024 });\nwss.on(\'connection\', (socket) => {\n  socket.on(\'message\', (bruto) => {\n    let msg;\n    try { msg = JSON.parse(bruto.toString()); } catch { return socket.close(1003); }\n    socket.send(JSON.stringify({ eco: msg.texto }));\n  });\n});'),
          sl('Salas, eventos e reconexão', 'Uma sala (room) é um grupo nomeado de conexões: em vez de enviar para todos, o servidor envia só para quem entrou na sala "pedido-1001". Eventos nomeados deixam o protocolo organizado ("mensagem", "digitando"). Conexões caem o tempo todo (celular trocando de rede), então o cliente precisa reconectar. A estratégia padrão é o backoff exponencial: esperar 1 s, depois 2 s, 4 s... até um teto, com um pouco de aleatoriedade (jitter) para milhares de clientes não voltarem juntos. Ao reconectar, mensagens enviadas durante a queda foram perdidas: o cliente deve pedir de novo o estado ou as mensagens a partir do último id que recebeu.', '// Ilustrativo, não executado aqui (Socket.IO)\nio.on(\'connection\', (socket) => {\n  socket.join(\'pedido-1001\');\n  io.to(\'pedido-1001\').emit(\'status\', { etapa: \'enviado\' });\n});\n// cliente: atraso = Math.min(30000, 1000 * 2 ** tentativa)'),
          sl('Autenticação e segurança na conexão', 'O WebSocket do navegador não permite cabeçalhos personalizados, então a autenticação costuma usar o cookie de sessão ou um ticket de uso único e curta duração obtido antes por uma requisição HTTP autenticada. Evite token longo na URL, pois URLs vão para logs. Valide o cabeçalho Origin no handshake: sem isso, uma página maliciosa aberta no navegador da vítima pode abrir uma conexão usando o cookie dela (ataque chamado Cross-Site WebSocket Hijacking; veja o curso de OWASP). Autorize cada evento e cada entrada em sala, não só a conexão. Imponha limites: tamanho máximo de mensagem (maxPayload), taxa de mensagens por conexão e número de conexões por usuário. Valide o JSON recebido como qualquer entrada.'),
          sl('Escalar com vários processos', 'Cada conexão WebSocket vive dentro de UM processo. Com duas instâncias da aplicação, a pessoa A conectada na instância 1 e a pessoa B na instância 2 não se enxergam: uma mensagem emitida numa instância não chega à outra. A solução é um barramento publish/subscribe entre as instâncias (por exemplo Redis pub/sub, e o Socket.IO tem adaptadores para isso): cada instância publica o que emite e escuta o que as outras publicam. Também não guarde estado da conversa só na memória do processo e, se o Socket.IO usar long polling, o balanceador precisa de sessão fixa (sticky sessions). Veja o curso de Computação Distribuída para o panorama.')
        ]
      },
      questions: [
        mcq('q1', 'O que o servidor envia para aceitar a troca de HTTP para WebSocket no handshake?', 'a', ['Resposta 101 Switching Protocols com Sec-WebSocket-Accept derivado da chave enviada pelo cliente', 'Resposta 200 OK com um corpo JSON contendo o endereço ws:// que o cliente deve abrir em seguida, antes das mensagens', 'Resposta 301 redirecionando o cliente para outra URL que passa a falar WebSocket nativamente', 'Resposta 204 sem corpo, porque a troca de protocolo é combinada depois por mensagens de texto'], 'A troca de protocolo é sinalizada pelo status 101, e o Sec-WebSocket-Accept prova que o servidor entendeu a chave do cliente. 200 com JSON, 301 e 204 são respostas HTTP comuns: nenhuma muda o protocolo da conexão.'),
        mcq('q2', 'Um painel mostra preços que o servidor atualiza a qualquer instante, e o usuário também envia comandos de compra pelo mesmo canal. Qual abordagem encaixa melhor?', 'd', ['Polling a cada 100 ms, porque equivale a uma conexão persistente sem custo adicional no servidor', 'Uma requisição HTTP nova por preço, porque o servidor consegue responder sem que o cliente peça', 'Server-Sent Events, porque permitem ao navegador enviar comandos pela mesma resposta aberta', 'WebSocket, porque a conexão é aberta e permite mensagens nos dois sentidos a qualquer momento'], 'Há tráfego bidirecional e frequente: é o caso de WebSocket. Polling gera muitas requisições e atraso; HTTP comum só responde a pedidos; SSE (próxima lição) é só do servidor para o cliente.'),
        mcq('q3', 'Uma equipe escreveu o servidor com o pacote ws e o cliente usando o cliente Socket.IO. O que acontece?', 'c', ['Funciona normalmente, porque Socket.IO é outro nome para o protocolo WebSocket', 'Funciona, mas sem salas, porque o servidor ws ignora eventos nomeados enviados pelo cliente', 'A conexão falha, porque Socket.IO usa protocolo próprio e só conversa com servidor Socket.IO', 'Funciona após ativar o fallback de long polling, que traduz o protocolo automaticamente'], 'Socket.IO acrescenta um protocolo próprio sobre WebSocket (e long polling); sem servidor Socket.IO a negociação não é entendida. Não é só um nome alternativo, e não existe tradução automática de protocolo.'),
        fill('q4', 'Complete o esquema da URL para uma conexão WebSocket protegida por TLS, como em produção.', 'const url = \'___://api.example.com/tempo-real\';', ['wss'], 'wss:// é o WebSocket sobre TLS (assim como https:// é o HTTP sobre TLS); ws:// trafega sem criptografia.'),
        mcq('q5', 'Seu servidor autentica o WebSocket pelo cookie de sessão. O que impede uma página maliciosa de abrir a conexão em nome da vítima?', 'b', ['Usar wss, porque a criptografia do canal impede que outro site use o cookie da vítima', 'Conferir o cabeçalho Origin no handshake e recusar origens que não sejam do seu site', 'Limitar o tamanho das mensagens, porque a página maliciosa precisa enviar mensagens grandes', 'Reconectar com backoff exponencial, já que o atacante não sabe esperar entre as tentativas'], 'O navegador envia o cookie mesmo a partir de outro site; só validar Origin recusa essa origem. TLS protege o trânsito, não decide quem pode abrir a conexão; limite de tamanho e backoff tratam outros problemas.'),
        mcq('q6', 'Com duas instâncias da aplicação, usuários em instâncias diferentes não recebem as mensagens uns dos outros. Qual é a causa e a correção?', 'b', ['O WebSocket só aceita um processo por porta; é preciso trocar para uma única instância maior', 'Cada conexão vive em um processo; é preciso um barramento pub/sub entre as instâncias', 'O handshake falha com várias instâncias; é preciso repeti-lo a cada mensagem enviada', 'As mensagens são grandes demais; é preciso diminuir o maxPayload nas instâncias'], 'A conexão pertence ao processo que a aceitou, então uma emissão local não alcança as outras instâncias; um canal pub/sub (como Redis) propaga as mensagens. Reduzir maxPayload ou refazer handshakes não resolve; uma instância única só evita o problema sem escalar.'),
        mcq('q7', 'Um cliente começa a enviar mensagens de dezenas de megabytes e milhares por segundo. Qual conjunto de medidas protege o servidor?', 'a', ['maxPayload baixo, limite de taxa por conexão e validação do formato de cada mensagem', 'Aumentar a memória do servidor e confiar que o sistema operacional descarte o excesso', 'Fechar a conexão após cada mensagem e exigir novo handshake em todas as respostas', 'Aceitar tudo, mas gravar as mensagens em logs completos para análise posterior'], 'Limites de tamanho e de taxa mais validação impedem o abuso antes de consumir recursos. Mais memória só adia o problema; reabrir conexões custa mais; logar mensagens inteiras ainda as processa e pode gravar dados pessoais.'),
        fill('q8', 'Complete o nome da estratégia usada pelo cliente para reconectar com esperas crescentes.', '// espera 1 s, 2 s, 4 s, 8 s... até um teto\n// estratégia: ___ exponencial', ['backoff'], 'Backoff exponencial dobra a espera a cada falha, evitando sobrecarregar o servidor com reconexões simultâneas.')
      ]
    },
    {
      id: 'nji-24-server-sent-events',
      title: 'Server-Sent Events (SSE)',
      goal: 'Comparar polling, SSE e WebSocket, entender o formato text/event-stream e saber quando o SSE é a melhor escolha.',
      xp: 20,
      intro: {
        slides: [
          sl('Três formas de o servidor avisar o cliente', 'Polling: o cliente pergunta de tempos em tempos "tem novidade?". Simples, mas gasta requisições à toa e a notícia chega atrasada. WebSocket: conexão permanente nos dois sentidos (lição anterior). Server-Sent Events (SSE): o cliente faz UMA requisição HTTP e o servidor mantém a resposta aberta, escrevendo eventos nela quando houver novidade. O fluxo vai só do servidor para o cliente e é texto. Como é HTTP comum, passa bem por proxies, usa cookies e autenticação como qualquer endpoint.'),
          sl('O formato text/event-stream', 'A resposta usa Content-Type: text/event-stream. O corpo é texto em linhas "campo: valor". Uma mensagem termina com uma linha em branco. Campos: data (o conteúdo; várias linhas data viram uma só mensagem), event (nome do evento; sem ele o evento se chama "message"), id (identificador da mensagem) e retry (milissegundos de espera antes de reconectar). Linhas que começam com ":" são comentários, úteis como sinal de vida (keep-alive) para manter proxies sem fechar a conexão.', 'id: 1\nevent: progresso\ndata: {"percentual":50}\n\n: comentario de keep-alive'),
          sl('Exemplo executável em localhost', 'O servidor abaixo (só módulos nativos) envia dois eventos e encerra; o cliente é um fetch que lê o corpo. O listen(0) pede uma porta livre ao sistema. Note req.on("close"): quando o cliente desconecta, limpamos o timer para não vazar recursos.', 'const http = require(\'node:http\');\nconst servidor = http.createServer((req, res) => {\n  res.writeHead(200, {\n    \'Content-Type\': \'text/event-stream\',\n    \'Cache-Control\': \'no-cache\',\n    Connection: \'keep-alive\'\n  });\n  res.write(\'retry: 3000\\n\\n\');\n  let n = 0;\n  const t = setInterval(() => {\n    n += 1;\n    res.write(\'id: \' + n + \'\\nevent: progresso\\ndata: \' + JSON.stringify({ percentual: n * 50 }) + \'\\n\\n\');\n    if (n === 2) { clearInterval(t); res.end(); }\n  }, 100);\n  req.on(\'close\', () => clearInterval(t));\n});\n// saída real (executado aqui):\n// status: 200 | tipo: text/event-stream\n// retry: 3000\n//\n// id: 1\n// event: progresso\n// data: {"percentual":50}\n//\n// id: 2\n// event: progresso\n// data: {"percentual":100}'),
          sl('Reconexão automática e EventSource', 'No navegador, a classe EventSource consome SSE e reconecta sozinha quando a conexão cai, esperando o tempo de "retry". Na reconexão ela envia o cabeçalho Last-Event-ID com o id da última mensagem recebida; o servidor pode usá-lo para reenviar o que foi perdido (você precisa guardar os eventos recentes para isso). Limitações do EventSource: só faz GET e não permite cabeçalhos personalizados (autenticação por cookie funciona; por cabeçalho Authorization, não). Para o cliente ENVIAR dados, use uma requisição POST comum em paralelo.', '// Ilustrativo, não executado aqui (navegador)\nconst fonte = new EventSource(\'/eventos\');\nfonte.addEventListener(\'progresso\', (e) => {\n  console.log(JSON.parse(e.data).percentual);\n});'),
          sl('Cuidados em produção', 'Proxies e servidores como o Nginx podem acumular (bufferizar) a resposta e entregar os eventos em bloco; é preciso desativar o buffering para esse endpoint. Envie um comentário (": keep-alive") periodicamente para a conexão não ser derrubada por inatividade. No HTTP/1.1 navegadores limitam poucas conexões simultâneas por domínio, e cada aba com SSE ocupa uma; HTTP/2 multiplexa e alivia isso. Limpe timers e inscrições no evento close. Autorize como qualquer outro endpoint e nunca envie dados de outros usuários no mesmo fluxo. Cada conexão aberta consome memória: limite o número por usuário.'),
          sl('Quando preferir cada um', 'SSE brilha quando o fluxo é do servidor para o cliente: respostas de IA chegando token a token (streaming), notificações, progresso de uma importação, cotações, logs ao vivo. WebSocket vale quando o cliente também envia com frequência e baixa latência (chat, jogo, edição colaborativa). Polling continua razoável quando as atualizações são raras ou a infraestrutura é restrita; um polling a cada 30 s é bem mais simples de operar que uma conexão permanente. Regra prática: escolha a tecnologia mais simples que atenda ao sentido e à frequência da comunicação.')
        ]
      },
      questions: [
        mcq('q1', 'Em qual direção o SSE transporta dados pela conexão aberta?', 'd', ['Nos dois sentidos, como o WebSocket, mas só com mensagens em formato de texto', 'Do cliente para o servidor, que responde com um único evento ao final da conexão, que a encerra logo depois', 'Entre clientes diretamente, com o servidor limitado a anunciar quem está conectado', 'Do servidor para o cliente, em mão única; o cliente envia por requisições HTTP separadas'], 'SSE é unidirecional (servidor para cliente). Se o cliente precisa enviar, faz POST à parte. Ser texto não o torna bidirecional, e não há comunicação direta entre clientes.'),
        mcq('q2', 'Como o cliente sabe onde termina cada mensagem num fluxo text/event-stream?', 'c', ['Pelo fechamento da conexão, que acontece a cada mensagem enviada', 'Por um campo length que informa o tamanho em bytes da mensagem seguinte', 'Por uma linha em branco depois dos campos da mensagem', 'Pelo campo retry, que marca o fim do bloco e o início do próximo'], 'A linha em branco delimita a mensagem. A conexão permanece aberta entre mensagens, não existe campo length no formato e retry só informa o tempo de reconexão.'),
        mcq('q3', 'A conexão do cliente caiu depois do evento de id 41. Como o servidor consegue retomar do ponto certo?', 'c', ['O servidor guarda o endereço IP do cliente e adivinha o último evento entregue', 'O cliente refaz o handshake do WebSocket com o número do evento na URL', 'O EventSource reconecta enviando Last-Event-ID: 41 e o servidor reenvia o que veio depois', 'Nada precisa ser feito, porque o TCP reentrega automaticamente as mensagens perdidas mesmo depois de a conexão antiga ser fechada'], 'O cabeçalho Last-Event-ID leva o último id recebido; cabe ao servidor ter guardado os eventos recentes. IP não identifica o ponto da leitura, SSE não usa handshake WebSocket e uma conexão nova do TCP não recupera dados da antiga.'),
        fill('q4', 'Complete o tipo de conteúdo que identifica uma resposta SSE.', 'res.writeHead(200, { \'Content-Type\': \'___\' });', ['text/event-stream'], 'text/event-stream é o tipo definido para SSE e é o que faz o navegador tratar a resposta como fluxo de eventos.'),
        mcq('q5', 'Uma tela só mostra o progresso de uma importação de planilha, atualizado pelo servidor a cada segundo. O usuário não envia nada durante o processo. Qual escolha é mais adequada?', 'b', ['WebSocket, porque ele é o que consegue manter uma conexão aberta por vários minutos', 'SSE, porque o fluxo é só do servidor para o cliente e já traz reconexão no navegador', 'Polling a cada 10 ms, porque evita perder percentuais na tela', 'Uma requisição POST por percentual, enviada pelo servidor ao navegador do usuário'], 'Fluxo unidirecional contínuo é o caso típico de SSE. Conexões longas também funcionam com SSE; polling a 10 ms é desperdício; o servidor não pode iniciar um POST ao navegador.'),
        mcq('q6', 'Em produção, os eventos SSE só chegam ao navegador em blocos grandes, vários segundos depois. Qual a causa mais provável?', 'a', ['Um proxy reverso está acumulando (buffering) a resposta antes de repassá-la', 'O navegador limita EventSource a um evento por minuto por motivos de segurança', 'O campo retry está definido e faz o servidor esperar entre os eventos', 'O formato text/event-stream exige que o servidor envie no máximo dez eventos por vez'], 'Proxies como o Nginx podem bufferizar respostas; é preciso desativar o buffering no endpoint de SSE. Não há tais limites no navegador nem no formato, e retry afeta só a reconexão.'),
        mcq('q7', 'Para que serve registrar req.on("close") num endpoint SSE?', 'd', ['Para avisar o cliente de que o servidor vai enviar o próximo evento', 'Para reenviar automaticamente os eventos perdidos na desconexão', 'Para converter a resposta em JSON antes de fechá-la definitivamente', 'Para parar timers e liberar recursos quando o cliente se desconecta'], 'Sem limpar, o timer continuaria escrevendo em uma resposta já fechada e vazaria memória a cada desconexão. close não reenvia eventos nem avisa o cliente.'),
        fill('q8', 'Complete o campo que informa ao navegador quantos milissegundos esperar antes de reconectar.', '___: 3000', ['retry'], 'retry define a espera da reconexão em milissegundos; id, event e data têm outras funções.')
      ]
    },
    {
      id: 'nji-25-filas-e-jobs-em-background',
      title: 'Filas e jobs em background',
      goal: 'Entender por que tirar tarefas lentas da requisição, como funcionam produtor, consumidor, retentativas, idempotência e dead letter.',
      xp: 20,
      intro: {
        slides: [
          sl('Por que usar filas', 'Uma requisição HTTP deve responder rápido. Enviar e-mail, gerar PDF, redimensionar imagem ou chamar uma API lenta dentro da requisição deixa o usuário esperando e, se a tarefa falha, a requisição falha junto. A solução é registrar a tarefa numa fila e responder logo, normalmente com 202 Accepted (aceito para processamento posterior) e o id da tarefa. Outro processo cuida do trabalho. A fila também absorve picos: se chegam mil pedidos de uma vez, eles esperam na fila em vez de derrubar o servidor.'),
          sl('Produtor, broker e consumidor', 'Produtor é quem coloca uma mensagem (um job) na fila, geralmente a API. Broker é o sistema que guarda as mensagens de forma durável: Redis (usado pelo BullMQ), RabbitMQ, Amazon SQS e Kafka (um log de eventos, modelo um pouco diferente) são exemplos citados só pelo nome. Consumidor (worker) é o processo que retira e executa. Vários workers podem consumir a mesma fila em paralelo. Você escala o trabalho pesado separadamente da API. Os pacotes são de terceiros: o código de exemplo é ilustrativo.', '// Ilustrativo, não executado aqui (BullMQ)\nawait fila.add(\'enviar-email\', { pedidoId: 1001 }, { attempts: 3, backoff: { type: \'exponential\', delay: 1000 } });\n// em outro processo:\nnew Worker(\'emails\', async (job) => enviar(job.data.pedidoId));'),
          sl('Confirmação (ack) e duplicatas', 'O consumidor só confirma (ack) a mensagem depois de concluir o trabalho. Se o processo morre no meio, o broker devolve a mensagem à fila e outro worker a refaz: isso é entrega "ao menos uma vez" (at-least-once). A consequência é que a MESMA mensagem pode ser processada duas vezes. A defesa é a idempotência: executar duas vezes tem o mesmo efeito de executar uma. Exemplos: antes de enviar o e-mail do pedido 1001, verificar se já foi enviado; ao cobrar, usar uma chave de idempotência única por pedido para o provedor ignorar a repetição.'),
          sl('Retentativas e dead letter', 'Falhas temporárias (rede caiu, serviço lento) merecem nova tentativa, com intervalo crescente (backoff exponencial) e um máximo de tentativas. Falhas permanentes (dado inválido, CPF malformado) não melhoram ao repetir: devem falhar direto. Quando as tentativas se esgotam, o job vai para a dead letter queue (DLQ, fila de mensagens "mortas"): um lugar separado para inspeção manual, correção e alerta, em vez de perder o job ou repeti-lo para sempre.'),
          sl('Simulação executável: tentativas e fila morta', 'Uma fila em memória só serve para ilustrar o fluxo: se o processo cair, os jobs pendentes somem. Filas reais guardam em Redis ou outro armazenamento durável. Repare como o job email-2 falha uma vez e passa; email-3 falha sempre e vai para as mortas depois de 3 tentativas.', 'const fila = [];\nconst mortas = [];\nconst MAX = 3;\nfunction enfileirar(id, dados) { fila.push({ id, dados, tentativas: 0 }); }\nasync function processar(job) {\n  if (job.dados.falhaSempre) throw new Error(\'falha permanente\');\n  if (job.dados.falhaUmaVez && job.tentativas === 1) throw new Error(\'falha temporaria\');\n}\nasync function trabalhador() {\n  while (fila.length) {\n    const job = fila.shift();\n    job.tentativas += 1;\n    try { await processar(job); console.log(\'ok       \', job.id, \'tentativa\', job.tentativas); }\n    catch (e) {\n      if (job.tentativas >= MAX) { mortas.push(job); console.log(\'morta    \', job.id, e.message); }\n      else { console.log(\'repetir  \', job.id, e.message); fila.push(job); }\n    }\n  }\n}\n// saída real (executado aqui, com email-1 ok, email-2 falhando 1x, email-3 sempre):\n// ok        email-1 tentativa 1\n// repetir   email-2 falha temporaria\n// repetir   email-3 falha permanente\n// ok        email-2 tentativa 2\n// repetir   email-3 falha permanente\n// morta     email-3 falha permanente\n// fila de mortas: [ \'email-3\' ]'),
          sl('Boas práticas', 'Coloque na mensagem só o necessário, como o id do pedido, e busque os dados atuais no banco ao processar: assim a fila e os logs guardam menos dados pessoais (minimização, princípio da LGPD) e o worker usa informação atualizada. Defina timeout por job, limite a concorrência para não sobrecarregar o banco, monitore o tamanho da fila e a idade da mensagem mais antiga, e faça encerramento gracioso: ao receber o sinal de parada, terminar o job atual antes de sair. Registre falhas sem incluir dados pessoais nos logs.')
        ]
      },
      questions: [
        mcq('q1', 'Por que mover o envio de e-mail de confirmação para uma fila, em vez de enviá-lo dentro da requisição?', 'd', ['O e-mail passa a ser entregue uma única vez, com garantia de ausência de duplicata', 'O servidor deixa de precisar de credenciais de e-mail, que ficam no navegador, já que o envio passa a ser feito pelo próprio cliente', 'A fila criptografa a mensagem e dispensa SPF e DKIM no domínio de envio', 'A requisição responde rápido e um SMTP lento ou fora do ar não derruba o pedido do usuário'], 'O ganho é desacoplar: a API responde logo e falhas ou lentidão do envio são tratadas pelo worker com retentativas. Filas em geral entregam "ao menos uma vez" (podem duplicar), as credenciais continuam no servidor e a fila não substitui a autenticação do domínio.'),
        mcq('q2', 'O worker processa um job, mas o processo morre antes de confirmar (ack). O que acontece em seguida num broker com entrega "ao menos uma vez"?', 'c', ['A mensagem é descartada definitivamente, porque o worker já havia começado o trabalho', 'O broker confirma sozinho a mensagem e registra o job como concluído com sucesso', 'A mensagem volta à fila e outro worker a processa, podendo haver execução duplicada', 'O produtor é obrigado a reenviar a mensagem original a partir do início da aplicação'], 'Sem ack, o broker presume que ninguém terminou e reentrega; por isso o processamento precisa ser idempotente. Descartar perderia trabalho, e nem o broker confirma por conta própria nem o produtor reenvia.'),
        mcq('q3', 'Um job de cobrança pode ser executado duas vezes por causa de reentrega. Qual medida evita cobrar o cliente em dobro?', 'b', ['Desligar as retentativas, aceitando que cobranças temporariamente falhas sejam perdidas e conferindo manualmente o extrato no fim do mês', 'Usar uma chave de idempotência por pedido, para a segunda tentativa ser reconhecida e ignorada', 'Aumentar o número de workers, para que o job termine antes de ser reentregue', 'Gravar o número do cartão no payload do job para conferir se já foi cobrado'], 'A idempotência torna a repetição inofensiva. Desligar retentativas perde trabalho legítimo, mais workers não eliminam reentregas e colocar dados de cartão na fila viola minimização e segurança.'),
        fill('q4', 'Complete o código HTTP que indica "aceito para processamento posterior", usado ao enfileirar um job.', 'res.writeHead(___, { \'Content-Type\': \'application/json\' });\nres.end(JSON.stringify({ jobId: \'abc123\' }));', ['202'], '202 Accepted informa que o pedido foi aceito mas ainda não concluído; 200 sugeriria trabalho terminado e 201 a criação de um recurso.'),
        mcq('q5', 'Um job falha porque o CPF do cliente está malformado. Qual a melhor política?', 'a', ['Tratar como falha permanente: não repetir e enviar à dead letter queue para correção', 'Repetir indefinidamente até que o CPF se corrija sozinho com o passar do tempo', 'Repetir cem vezes com intervalo curto, para garantir que não era uma falha de rede', 'Apagar o job em silêncio, já que o dado inválido pertence ao usuário'], 'O dado continuará inválido a cada tentativa, então repetir só gasta recursos; a DLQ preserva o job para análise. Descartar em silêncio perde a informação de que algo precisa de correção.'),
        mcq('q6', 'Qual a vantagem de colocar só o id do pedido na mensagem da fila, em vez do objeto completo do cliente?', 'a', ['Guarda menos dados pessoais na fila e nos logs, e o worker consulta dados atualizados', 'O broker consegue ordenar as mensagens por id e garante a ordem de execução', 'O job passa a ser idempotente automaticamente, sem código adicional, mesmo com vários workers em paralelo', 'O worker deixa de precisar de acesso ao banco, pois recebe tudo pronto'], 'Menos dados na fila é minimização e evita informação desatualizada. O id não garante ordem nem idempotência por si só, e o worker passa a precisar de acesso ao banco, não o contrário.'),
        mcq('q7', 'Uma equipe usa um array em memória como fila. O que acontece com os jobs pendentes se o processo reiniciar?', 'd', ['Continuam intactos, porque o Node grava o array em disco ao encerrar o processo, de forma automática e transparente', 'Voltam à fila graças ao ack automático do runtime do Node', 'São movidos para a dead letter queue pelo sistema operacional', 'São perdidos, pois a memória não é durável; filas reais usam armazenamento persistente'], 'Memória do processo some ao reiniciar. Brokers como Redis ou RabbitMQ existem justamente para persistir mensagens; o Node não grava o array em disco, nem há ack ou DLQ automáticos em arrays.'),
        fill('q8', 'Complete a sigla da fila para onde vão os jobs que esgotaram as tentativas (dead letter queue).', '// após MAX tentativas: mover para a ___ (dead letter queue)', ['DLQ'], 'DLQ é a sigla de dead letter queue, fila de mensagens que não puderam ser processadas.')
      ]
    },
    {
      id: 'nji-26-agendamento-e-cron-jobs',
      title: 'Agendamento e cron jobs',
      goal: 'Escolher entre setInterval e cron, ler expressões cron, tratar fusos e evitar execução duplicada com várias instâncias.',
      xp: 20,
      intro: {
        slides: [
          sl('Para que agendar tarefas', 'Muitas aplicações precisam executar algo em horários definidos, sem um usuário pedindo: relatório noturno, limpeza de tokens expirados, remoção de dados vencidos (retenção, prática recomendada pela LGPD), lembretes, sincronização com outro sistema. Isso é um job agendado. Há duas famílias de ferramentas: temporizadores dentro do processo Node (setInterval, bibliotecas como node-cron e agenda) e agendadores de fora (cron do sistema, CronJob do Kubernetes, serviços de nuvem).'),
          sl('setInterval e suas armadilhas', 'setInterval(fn, ms) chama fn a cada ms enquanto o processo estiver vivo. Limitações: não entende "todo dia às 3h", só intervalos; se o processo reinicia, perde a contagem; e, se a execução demora mais que o intervalo, as execuções se sobrepõem. O padrão mais seguro é um setTimeout recursivo: só agenda a próxima rodada depois que a atual termina. Timers também têm precisão limitada: o laço de eventos pode atrasá-los se estiver ocupado.', 'async function rodar() {\n  try { await tarefa(); }\n  catch (e) { console.error(\'job falhou:\', e.message); }\n  finally { setTimeout(rodar, 60_000); } // próxima só após terminar\n}\nrodar();'),
          sl('Expressões cron', 'Cron é um formato de agenda com 5 campos separados por espaço: minuto (0-59), hora (0-23), dia do mês (1-31), mês (1-12) e dia da semana (0-6, com 0 = domingo). O asterisco significa "todos". Exemplos: "0 3 * * *" = todo dia às 03:00; "*/15 * * * *" = a cada 15 minutos; "0 9 * * 1" = toda segunda-feira às 09:00; "30 2 1 * *" = dia 1 de cada mês às 02:30. Pacotes como node-cron e agenda, ou o BullMQ com jobs repetíveis, aceitam essas expressões (terceiros, ilustrativo).', '// Ilustrativo, não executado aqui (node-cron)\ncron.schedule(\'0 3 * * *\', limparTokensExpirados, { timezone: \'America/Sao_Paulo\' });'),
          sl('Fusos horários', 'Servidores normalmente rodam em UTC. "Todo dia às 9h" precisa dizer 9h de QUEM: informe o fuso explicitamente (por exemplo America/Sao_Paulo) na biblioteca de agendamento em vez de depender do relógio da máquina. Regras de fuso mudam por lei e alguns países usam horário de verão: certas horas locais não existem ou se repetem em um dia. Armazene datas em UTC e converta só na exibição. Evite agendar tarefas críticas exatamente nesses horários ambíguos.'),
          sl('Várias instâncias: o job que roda em dobro', 'Se a aplicação roda em 3 instâncias e cada uma agenda o mesmo job, ele executa 3 vezes (e-mails duplicados, cobranças repetidas). Soluções: (1) lock distribuído, em que só a instância que adquire a trava executa; (2) deixar o agendamento a cargo de um único componente, como um CronJob do orquestrador; (3) usar uma fila com job repetível único. O lock precisa de um armazenamento compartilhado (Redis com SET NX e expiração, ou o banco) e de um TTL (tempo de vida): se quem pegou a trava morrer, ela expira e outra instância assume. O exemplo abaixo usa um Map em memória apenas para mostrar a lógica; em produção seria um armazenamento externo.', 'const travas = new Map();\nfunction adquirir(nome, dono, ttlMs) {\n  const agora = Date.now();\n  const atual = travas.get(nome);\n  if (atual && atual.expira > agora) return false;\n  travas.set(nome, { dono, expira: agora + ttlMs });\n  return true;\n}\nfor (const instancia of [\'A\', \'B\', \'C\']) {\n  const ganhou = adquirir(\'relatorio-diario\', instancia, 60000);\n  console.log(\'instancia\', instancia, ganhou ? \'executa o job\' : \'pula (outra ja executa)\');\n}\n// saída real (executado aqui):\n// instancia A executa o job\n// instancia B pula (outra ja executa)\n// instancia C pula (outra ja executa)'),
          sl('Jobs idempotentes e observáveis', 'Um job pode ser repetido por falha, deploy no meio da execução ou lock expirado, então ele deve ser idempotente: processar por janela (o dia 2030-01-01) e marcar o que já foi feito, de modo que repetir não duplique efeitos. Registre início, fim e duração, capture exceções (um erro não tratado num timer pode derrubar o processo) e defina um timeout. Monitore também a AUSÊNCIA: um alerta de "o job não rodou nas últimas 25 horas" (heartbeat) pega falhas silenciosas que logs de erro não pegam.')
        ]
      },
      questions: [
        mcq('q1', 'O que significa a expressão cron "0 3 * * *"?', 'c', ['A cada 3 minutos, em qualquer hora do dia', 'Dia 3 de cada mês, à meia-noite', 'Todo dia às 03:00', 'Três vezes por dia, a partir da meia-noite'], 'Os campos são minuto 0, hora 3 e asteriscos para dia, mês e dia da semana: todo dia, 03:00. Para "a cada N minutos" se usaria */N no primeiro campo; o dia do mês é o terceiro campo, que aqui é *.'),
        mcq('q2', 'Um setInterval de 1 minuto executa um job que às vezes leva 3 minutos. Qual o problema e uma correção?', 'b', ['O Node cancela a execução anterior automaticamente, perdendo o trabalho parcial do job', 'As execuções se sobrepõem; usar setTimeout recursivo ou um lock evita iniciar a próxima antes do fim', 'O intervalo passa a valer 3 minutos, o que só atrasa o job sem causar outros efeitos', 'O setInterval trava o laço de eventos enquanto o job estiver rodando, impedindo novas requisições de qualquer cliente'], 'setInterval dispara no relógio, sem esperar o término: duas execuções podem correr juntas. O Node não cancela a anterior, o intervalo não se ajusta e um job assíncrono não trava o laço por esperar I/O.'),
        mcq('q3', 'A aplicação foi escalada para 3 instâncias e os clientes passaram a receber o relatório diário 3 vezes. Qual a causa e a correção?', 'b', ['O cron interpreta o asterisco como três execuções; trocar por um número fixo resolve', 'Cada instância agenda o mesmo job; usar um lock distribuído ou um único agendador resolve', 'O fuso horário foi configurado errado; mudar o servidor para UTC resolve', 'O relatório foi enviado por uma fila; remover a fila resolve'], 'Cada instância tem seu próprio agendador, logo a tarefa dispara em todas. O asterisco não multiplica execuções, fuso errado mudaria o horário e não a quantidade, e a fila não é a origem da duplicação.'),
        fill('q4', 'Complete o número de minutos entre as execuções desta agenda.', '// */15 * * * *  -> executa a cada ___ minutos', ['15'], 'A barra com 15 no campo dos minutos significa "a cada 15 minutos".'),
        mcq('q5', 'Por que um lock distribuído deve ter um TTL (expiração)?', 'a', ['Se a instância que pegou a trava morrer, ela expira e outra instância pode retomar o job', 'Para o job rodar mais rápido, pois o TTL limita o tempo de CPU permitido', 'Para o lock ser compartilhado entre processos, o que sem TTL seria impossível, já que sem prazo a trava ficaria só na memória local', 'Para impedir que o mesmo job volte a ser agendado no dia seguinte'], 'Sem expiração, uma trava presa por um processo morto bloquearia o job para sempre. O TTL não acelera nada, o compartilhamento vem do armazenamento externo, e o job do dia seguinte usa outra janela.'),
        mcq('q6', 'O servidor roda em UTC, mas o relatório precisa sair às 9h no horário de São Paulo. O que fazer?', 'd', ['Escrever a hora 9 no cron e torcer para o servidor estar no mesmo fuso dos usuários', 'Guardar as datas já no fuso de São Paulo para o cron entender automaticamente', 'Trocar o cron por setInterval, que não sofre com fusos horários', 'Informar o fuso America/Sao_Paulo na configuração do próprio agendamento'], 'Declarar o fuso na agenda deixa o resultado independente da máquina. Depender do relógio do servidor é frágil; datas ficam em UTC no armazenamento; setInterval também depende de cálculo correto de horário e nem expressa "9h".'),
        mcq('q7', 'Um job de limpeza falhou na metade e foi reexecutado. O que garante que a reexecução não cause danos?', 'c', ['Executar o job só uma vez por semana, para reduzir a chance de falhas', 'Apagar os logs do job, assim ninguém percebe que houve repetição', 'Processar por janela e registrar o que foi feito (idempotência)', 'Aumentar o intervalo do cron, porque falhas parciais só ocorrem em agendas curtas'], 'Idempotência por janela e marcação do progresso torna a repetição segura. Reduzir a frequência ou apagar logs não impede efeitos duplicados nem corrige a causa.'),
        fill('q8', 'Complete o último campo para agendar toda segunda-feira às 09:00 (dia da semana: domingo é 0).', '// 0 9 * * ___', ['1'], 'No campo de dia da semana, 0 é domingo, então segunda-feira é 1.')
      ]
    },
    {
      id: 'nji-27-e-mail-e-notificacoes',
      title: 'E-mail e notificações',
      goal: 'Enviar e-mails transacionais com segurança: SMTP, provedores, autenticação do domínio, templates, links de recuperação seguros e cuidados com consentimento e LGPD.',
      xp: 20,
      intro: {
        slides: [
          sl('E-mail transacional x marketing', 'E-mail transacional é disparado por uma ação do usuário ou do sistema: confirmação de cadastro, recibo, recuperação de senha, alerta de segurança. E-mail de marketing é promocional (newsletter, oferta). A diferença importa para a lei e para a entregabilidade: o transacional é esperado pelo destinatário; o de marketing exige consentimento prévio (opt-in) e um jeito fácil de se descadastrar. Misturar os dois no mesmo remetente prejudica a reputação dos e-mails importantes.'),
          sl('SMTP, Nodemailer e provedores', 'SMTP (Simple Mail Transfer Protocol) é o protocolo de envio de e-mail entre servidores. Nodemailer é um pacote de terceiros que cria um transport SMTP em Node. Na prática, a maioria dos times usa um provedor de envio transacional (Amazon SES, SendGrid, Mailgun, Postmark são exemplos pelo nome), por SMTP ou API: o provedor cuida de reputação de IP, filas e relatórios de entrega. Credenciais vão em variáveis de ambiente, nunca no código.', '// Ilustrativo, não executado aqui (Nodemailer)\nconst transporte = nodemailer.createTransport({\n  host: process.env.SMTP_HOST,\n  port: Number(process.env.SMTP_PORT),\n  secure: true,\n  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }\n});\nawait transporte.sendMail({ from: \'nao-responda@example.com\', to: \'usuario@example.com\', subject: \'Confirmação\', text: \'Olá!\' });'),
          sl('SPF, DKIM e DMARC (conceito)', 'Qualquer servidor pode afirmar que envia "em nome de" seu domínio; por isso existem três mecanismos configurados no DNS do domínio, não no código. SPF: lista os servidores autorizados a enviar e-mails do domínio. DKIM: o servidor assina a mensagem com uma chave privada e o destinatário confere com a chave pública publicada no DNS, provando que a mensagem não foi alterada e veio de quem tem a chave. DMARC: define o que o destinatário deve fazer quando SPF/DKIM falham (ignorar, quarentena, rejeitar) e envia relatórios. Sem eles, seus e-mails caem no spam e seu domínio pode ser falsificado.'),
          sl('Templates sem injeção', 'Um template é um texto com marcadores ({{nome}}) preenchidos com dados. Se o dado vem do usuário e o e-mail é HTML, é preciso escapar caracteres especiais, senão alguém cadastra o nome como marcação HTML e ela aparece no e-mail de outra pessoa. Ofereça também a versão em texto simples. Não inclua senhas nem dados sensíveis no corpo: e-mail trafega e fica guardado em muitos lugares. Inclua só o mínimo necessário.', 'const esc = s => String(s).replace(/[&<>"\']/g, c => ({ \'&\': \'&amp;\', \'<\': \'&lt;\', \'>\': \'&gt;\', \'"\': \'&quot;\', "\'": \'&#39;\' }[c]));\nconst modelo = \'Ola, {{nome}}! Seu pedido {{pedido}} foi enviado.\';\nconst html = modelo.replace(/\\{\\{(\\w+)\\}\\}/g, (_, k) => esc({ nome: \'<b>Ana</b>\', pedido: \'#1001\' }[k]));\n// saída real (executado aqui):\n// Ola, &lt;b&gt;Ana&lt;/b&gt;! Seu pedido #1001 foi enviado.'),
          sl('Links de recuperação de senha seguros', 'O link de recuperação é uma chave temporária para a conta, então: gere um token aleatório criptográfico (crypto.randomBytes), não algo previsível como data ou id; guarde no banco só o HASH do token (como se faz com senhas), de modo que um vazamento do banco não entregue links válidos; defina validade curta e uso único; compare com timingSafeEqual; responda IGUAL exista ou não a conta, para ninguém descobrir quais e-mails são cadastrados (enumeração); limite a taxa de pedidos; use HTTPS; invalide os links anteriores ao trocar a senha; e não grave o token em logs.', 'const crypto = require(\'node:crypto\');\nconst token = crypto.randomBytes(32).toString(\'base64url\'); // vai no link\nconst hash = crypto.createHash(\'sha256\').update(token).digest(\'hex\'); // vai no banco\n// saída real (executado aqui):\n// token enviado ao usuario tem 43 caracteres\n// hash guardado no banco tem 64 caracteres\n// confere: true  (via crypto.timingSafeEqual dos hashes)'),
          sl('Filas, consentimento e LGPD', 'Envie e-mails por uma fila (lição anterior): a API responde rápido e falhas do provedor viram retentativas. Para marketing, registre o consentimento (quando, para quê, por qual canal), ofereça descadastro em um clique e respeite-o. Nunca exponha a lista de destinatários (use envios individuais ou cópia oculta). Guarde o mínimo de dados e não coloque dados pessoais desnecessários no assunto nem nos logs. A LGPD (Lei 13.709/2018) trata do consentimento e de outras bases legais para o tratamento de dados; este curso dá só uma visão geral e não substitui orientação jurídica.')
        ]
      },
      questions: [
        mcq('q1', 'Qual destes e-mails normalmente dispensa consentimento prévio por ser transacional?', 'c', ['Uma newsletter mensal com ofertas enviada a toda a base de clientes', 'Uma campanha de promoção enviada a pessoas que não interagiram com a loja', 'O recibo de uma compra que a própria pessoa acabou de fazer', 'Um convite para uma pesquisa de satisfação enviado a clientes antigos de anos atrás'], 'O recibo decorre de uma ação do próprio usuário e é esperado por ele (transacional). Newsletters, campanhas e convites promocionais são marketing e exigem base adequada, como o consentimento.'),
        mcq('q2', 'Qual a função do SPF no envio de e-mails do seu domínio?', 'b', ['Assinar digitalmente cada mensagem com uma chave privada guardada no servidor de envio', 'Listar no DNS quais servidores estão autorizados a enviar e-mail em nome do domínio', 'Criptografar o conteúdo do e-mail entre o remetente e o destinatário final', 'Definir o formato HTML dos templates aceitos pelos provedores de e-mail'], 'SPF é uma lista de remetentes autorizados publicada no DNS. A assinatura da mensagem é função do DKIM; SPF não criptografa conteúdo nem tem relação com templates.'),
        mcq('q3', 'O que o DKIM permite ao destinatário verificar?', 'a', ['Que a mensagem foi assinada por quem controla a chave do domínio e não foi alterada no caminho', 'Que o endereço IP do remetente aparece em uma lista de servidores aprovados mantida pelo provedor de e-mail do destinatário', 'Que o texto do e-mail não contém palavras típicas de spam em idioma algum', 'Que o usuário consentiu em receber mensagens de marketing do domínio'], 'DKIM usa assinatura criptográfica verificada com a chave pública no DNS. A lista de IPs é do SPF; filtros de conteúdo e consentimento são assuntos diferentes.'),
        fill('q4', 'Complete a função do módulo crypto que gera bytes aleatórios seguros para o token de recuperação.', 'const token = crypto.___(32).toString(\'base64url\');', ['randomBytes'], 'crypto.randomBytes usa um gerador criptograficamente seguro; Math.random é previsível e não serve para tokens.'),
        mcq('q5', 'Por que guardar no banco só o hash do token de recuperação, e não o token?', 'd', ['Porque o hash é reversível e permite reenviar o mesmo link ao usuário depois', 'Porque o banco não consegue armazenar strings aleatórias com muitos caracteres', 'Porque o hash expira sozinho, dispensando a validade curta do link', 'Se o banco vazar, os hashes não permitem montar links válidos de recuperação'], 'Um hash comum de sha256 não é reversível: quem lê o banco não obtém o token que está no e-mail. Não é reversível, o banco armazena strings longas sem problema e o hash não expira por si.'),
        mcq('q6', 'No formulário "esqueci minha senha", por que responder a mesma mensagem exista ou não a conta?', 'd', ['Para reduzir o tamanho das respostas e economizar banda do servidor', 'Para evitar que o servidor precise consultar o banco de dados em cada pedido de recuperação de senha', 'Para garantir que o e-mail seja entregue mais rápido ao destinatário', 'Para impedir que alguém descubra quais e-mails estão cadastrados (enumeração de usuários)'], 'Respostas diferentes revelam quem tem conta, informação útil a atacantes e um problema de privacidade. Não há ganho de banda relevante, a consulta ao banco continua necessária e a velocidade de entrega não muda.'),
        mcq('q7', 'Um usuário cadastra o nome como marcação HTML e o e-mail HTML do sistema exibe o texto sem escapar. Qual o risco e a correção?', 'c', ['Risco algum, porque clientes de e-mail não interpretam HTML recebido', 'O banco de dados é corrompido; basta aumentar o limite de tamanho do campo', 'Conteúdo injetado aparece nos e-mails; escapar os dados antes de inserir no template', 'O domínio perde o SPF; basta renovar o registro no DNS do domínio'], 'Dados do usuário inseridos sem escape podem alterar a aparência ou o conteúdo do e-mail (por exemplo, links falsos). Escapar caracteres especiais corrige. Clientes de e-mail interpretam HTML, e SPF e banco não têm relação com isso.'),
        fill('q8', 'Complete a sigla que, junto com SPF e DKIM, define o que fazer quando a autenticação do e-mail falha.', '// SPF, DKIM e ___ formam a autenticação de e-mail do domínio', ['DMARC'], 'DMARC define a política (nenhuma, quarentena ou rejeição) para mensagens que falham SPF/DKIM e gera relatórios.')
      ]
    },
    {
      id: 'nji-50-pagamentos-e-webhooks-com-seguranca',
      title: 'Pagamentos e webhooks com segurança',
      goal: 'Integrar um gateway de pagamento sem tocar em dados de cartão, tratar valores em centavos, usar chaves de idempotência e verificar webhooks por HMAC sobre o corpo cru, com deduplicação e conciliação.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Como funciona a integração com um gateway',
            'Um gateway de pagamento é um serviço de terceiros (como Stripe, Mercado Pago ou Pagar.me; citados só por nome, ilustrativo) que fala com bancos e bandeiras. Seu back-end NÃO processa cartões: ele cria um pedido de cobrança no gateway, o cliente informa os dados do cartão em uma página ou componente do PRÓPRIO gateway, e o gateway devolve um token ou o resultado. O fluxo típico: (1) seu servidor calcula o valor e cria a cobrança no gateway; (2) o cliente paga na tela do gateway; (3) o gateway avisa seu servidor por webhook (uma chamada HTTP que ele faz para uma URL sua) quando o pagamento muda de estado; (4) seu servidor atualiza o pedido. Nunca marque um pedido como pago só porque o navegador voltou para a página de sucesso: essa volta pode ser forjada, e a confirmação confiável é a do gateway.'
          ),
          sl(
            'Nunca toque em dados de cartão',
            'Número do cartão, validade e especialmente o CVV (código de segurança) estão sob o PCI DSS, o padrão do setor de cartões que impõe controles pesados a quem armazena, processa ou transmite esses dados. Em visão geral (não é orientação de conformidade; consulte o gateway e especialistas): o objetivo de um sistema comum é ficar FORA desse escopo. Para isso, use tokenização: o gateway recebe os dados do cartão direto do navegador (checkout hospedado ou campos embutidos) e entrega um token, um identificador sem valor fora dele, que seu sistema pode guardar e usar para cobrar. Regras práticas: não receba o número do cartão no seu servidor, não registre em log nem em banco, não envie por e-mail ou chat, e guarde apenas o token, os quatro últimos dígitos e a bandeira quando precisar mostrar "cartão final 1234". O CVV não pode ser armazenado depois da autorização.'
          ),
          sl(
            'Valores em centavos e o servidor decide o preço',
            'Valores monetários trafegam como inteiros na menor unidade da moeda: R$ 19,99 é 1999 (veja a lição de internacionalização: ponto flutuante erra contas), junto do código da moeda. Gateways em geral aceitam e devolvem valores assim; confirme a convenção da documentação do seu gateway. Regra de segurança: o PREÇO é calculado no servidor a partir do catálogo e do carrinho guardados por você. Se o front-end enviar "valor": 1 e o servidor acreditar, alguém compra por um centavo. Valide também a quantidade (inteiro positivo), os descontos e os impostos no servidor, e grave no pedido o valor exato que foi cobrado, para poder conciliar depois.'
          ),
          sl(
            'Idempotency key: cobrar uma vez só',
            'Se o cliente clica duas vezes em Pagar, ou sua chamada ao gateway dá timeout e o código tenta de novo, o cliente pode ser cobrado duas vezes. Idempotência é a propriedade de repetir uma operação sem repetir o efeito. A técnica: o cliente (ou seu servidor) gera uma chave única por TENTATIVA LÓGICA (um UUID por pedido) e a envia em um cabeçalho, comumente Idempotency-Key; o servidor que recebe guarda o resultado associado à chave e, se a mesma chave chegar de novo, devolve o resultado guardado sem cobrar outra vez. Muitos gateways aceitam esse cabeçalho; confira a documentação. Cuidado: reutilizar a mesma chave para pedidos diferentes devolveria o resultado do primeiro, e gerar uma chave nova a cada retry anula a proteção. Código ilustrativo, não executado aqui.',
            'const resultados = new Map(); // em produção: banco, com expiração\nasync function cobrar(chave, dados) {\n  if (resultados.has(chave)) return resultados.get(chave);\n  const r = await gateway.criarCobranca(dados, { idempotencyKey: chave });\n  resultados.set(chave, r);\n  return r;\n}'
          ),
          sl(
            'Webhook: assinatura HMAC sobre o corpo cru',
            'A URL do webhook é pública: qualquer pessoa pode enviar um POST falso dizendo "pagamento aprovado". Por isso o gateway assina cada chamada: calcula um HMAC-SHA256 do corpo com um segredo que só você e ele conhecem e envia em um cabeçalho. Você recalcula e compara. Dois detalhes decisivos. (1) A assinatura vale para os BYTES exatos do corpo: calcule sobre o corpo CRU (em Express, express.raw ou captura do buffer antes do parse JSON), não sobre o objeto reserializado, pois mudar até um espaço altera o resultado. (2) Compare com crypto.timingSafeEqual (tempo constante, evita descobrir a assinatura por diferença de tempo) depois de checar que os tamanhos são iguais. Muitos gateways incluem também um carimbo de tempo na assinatura: recuse eventos muito antigos para dificultar replay. O segredo vem do ambiente (<SEGREDO>), nunca do código. Executado:',
            'const assina = (corpo) => crypto.createHmac("sha256", SEGREDO).update(corpo).digest("hex");\nconst confere = (corpo, assinatura) => {\n  const esperado = Buffer.from(assina(corpo), "hex");\n  const recebido = Buffer.from(String(assinatura), "hex");\n  return esperado.length === recebido.length && crypto.timingSafeEqual(esperado, recebido);\n};\n// corpo original : true\n// corpo alterado : false\n// mesmo JSON reformatado: false\n// assinatura lixo: false'
          ),
          sl(
            'Reentrega, deduplicação e conciliação',
            'Gateways reenviam o webhook se sua resposta não for um 2xx (ou demorar), então o mesmo evento pode chegar várias vezes, e fora de ordem. Projete o tratamento para ser idempotente: cada evento tem um id; guarde os ids já processados (tabela com restrição de unicidade) e, se o id repetir, responda 200 sem refazer nada (executado: processado, depois duplicado, ignora). Responda rápido: valide a assinatura, grave o evento e deixe o trabalho pesado para uma fila (veja a lição de filas). Não confie na ordem: consulte o estado atual na API do gateway quando a ordem importar. Por fim, a conciliação: periodicamente compare seus pedidos com o extrato ou a listagem do gateway para achar divergências (pago lá e pendente aqui, valor diferente, estorno não registrado) e corrija; é a rede de segurança contra webhooks perdidos.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O navegador do cliente volta para a página /sucesso depois do pagamento. O que o servidor deve fazer para marcar o pedido como pago?', 'b', ['Marcar como pago de imediato, pois o cliente só chega a essa página depois de pagar', 'Esperar a confirmação do gateway (webhook assinado ou consulta à API) antes de marcar como pago', 'Pedir ao navegador um campo "pago=true" na URL e confiar nele se o valor do pedido coincidir com o esperado', 'Marcar como pago após 10 minutos sem cancelamento'], 'A página de retorno é uma navegação do cliente e pode ser acessada ou forjada sem pagamento; a confirmação confiável vem do gateway. Aceitar um campo na URL é a mesma falha, e marcar por tempo decorrido libera produtos sem que haja cobrança.'),
        mcq('q2', 'Qual prática mantém o seu sistema fora do escopo mais pesado do PCI DSS para dados de cartão?', 'd', ['Receber o número do cartão no servidor, criptografá-lo e guardar no banco', 'Guardar o número completo e o CVV em um arquivo separado com permissão restrita', 'Registrar o corpo das requisições de pagamento nos logs para facilitar o trabalho do suporte técnico', 'Deixar o navegador enviar o cartão direto ao gateway e guardar só o token e os últimos dígitos'], 'Com checkout hospedado ou campos do gateway, o número do cartão nem passa pelo seu servidor: você só recebe um token. Criptografar e guardar o número, ou o CVV, mantém o sistema dentro do escopo e do risco; e logar o corpo de pagamentos grava dados sensíveis em um lugar pouco protegido.'),
        mcq('q3', 'O front-end envia {"item": 7, "valor": 1} para criar a cobrança do item 7, que custa R$ 199,90. O que o servidor deve fazer?', 'c', ['Cobrar o valor recebido, porque o cliente conhece o carrinho', 'Cobrar o valor recebido se for um número inteiro positivo, aplicando o arredondamento no servidor', 'Ignorar o valor enviado e calcular 19990 centavos pelo catálogo e pelo carrinho no servidor', 'Cobrar o menor valor entre o enviado e o do catálogo'], 'O preço é decisão do servidor: o cliente controla tudo o que envia, e um inteiro positivo pode ser 1. Calcular a partir do catálogo, em centavos, evita fraude. Cobrar o menor valor ainda permitiria que alguém pagasse um centavo.'),
        fill('q4', 'Complete o método que compara duas assinaturas em tempo constante.', 'return esperado.length === recebido.length && crypto.___(esperado, recebido);', ['timingSafeEqual'], 'crypto.timingSafeEqual exige buffers do mesmo tamanho, por isso a checagem de length vem antes, e não vaza informação pelo tempo de comparação.'),
        mcq('q5', 'Por que a assinatura do webhook deve ser verificada sobre o corpo cru e não sobre o JSON já convertido em objeto e reserializado?', 'a', ['A assinatura vale para os bytes exatos; reserializar pode mudar espaços e a verificação falharia', 'O corpo cru é criptografado e o objeto não pode ser lido sem a chave compartilhada com o gateway', 'O JSON reserializado fica maior e estoura o limite do cabeçalho', 'O parser JSON remove a assinatura do corpo antes de entregá-lo'], 'O HMAC foi calculado sobre uma sequência exata de bytes: qualquer diferença de formatação muda o resultado, como mostrou o teste com o mesmo JSON reformatado. O corpo cru não é criptografado, o tamanho não tem relação com cabeçalhos e a assinatura viaja em um cabeçalho, não dentro do corpo.'),
        mcq('q6', 'O gateway reenviou o mesmo webhook (mesmo id de evento) três vezes porque seu servidor demorou a responder. Qual desenho evita processar o pagamento três vezes?', 'd', ['Responder 500 nas duas últimas, para o gateway entender que o evento já foi tratado e parar de enviar', 'Processar cada reenvio como novo, porque ele pode trazer informações novas', 'Ignorar os webhooks e consultar o gateway uma vez por semana', 'Registrar os ids já tratados com restrição de unicidade e responder 200 nos repetidos sem refazer o efeito'], 'Idempotência por id de evento garante efeito único mesmo com reentrega, e responder 200 rápido encerra as tentativas. Responder 500 provoca MAIS reenvios; processar sempre repete a baixa; e consultar só uma vez por semana deixa pedidos pagos sem liberação por dias.'),
        mcq('q7', 'Seu servidor chamou o gateway para criar uma cobrança, deu timeout e o código vai tentar de novo. Como evitar cobrar duas vezes?', 'a', ['Enviar a mesma chave de idempotência (um UUID gravado no pedido) nas duas tentativas', 'Gerar uma chave nova a cada tentativa para o gateway não confundir os pedidos', 'Aumentar bastante o tempo do timeout e não tentar de novo, mesmo sem saber o resultado da primeira chamada', 'Reduzir o valor da segunda tentativa, para compensar uma possível cobrança dupla'], 'Com a mesma chave, o gateway reconhece a tentativa repetida e devolve o resultado da primeira, sem nova cobrança. Chave nova a cada tentativa anula a proteção, esperar sem tentar de novo pode deixar o cliente sem resposta e alterar o valor cria divergência em vez de resolver.'),
        fill('q8', 'Um item custa R$ 19,99. Complete com o valor inteiro, em centavos, que deve ser enviado ao gateway.', 'const valor = ___; // R$ 19,99 em centavos', ['1999'], 'Em centavos, 19,99 reais correspondem a 1999 (19 vezes 100, mais 99), sem usar ponto flutuante.')
      ]
    },
    {
      id: 'nji-28-testes-unitarios-jest-vitest-node-test',
      title: 'Testes unitários: Jest, Vitest e node:test',
      goal: 'Escrever testes unitários rápidos e determinísticos, comparar os principais test runners e interpretar cobertura sem se enganar com ela.',
      xp: 20,
      intro: {
        slides: [
          sl('Pirâmide de testes e o lugar do teste unitário', 'Teste unitário verifica uma peça pequena de código (uma função, uma classe) isolada do resto: sem banco, sem rede. Teste de integração junta várias peças (próxima lição) e teste de ponta a ponta (e2e) percorre o sistema como um usuário. A pirâmide de testes sugere muitos testes unitários na base (rápidos e baratos), menos de integração no meio e poucos e2e no topo (lentos e frágeis). Um teste unitário bom roda em milissegundos, então dá para executá-lo a cada alteração.'),
          sl('Test runners: Jest, Vitest e node:test', 'Um test runner descobre arquivos de teste, executa, mostra resultados e códigos de saída (0 = passou, diferente de 0 = falhou, o que faz o CI falhar). Jest: runner completo (asserções, mocks, snapshots, cobertura) muito difundido. Vitest: API parecida com a do Jest, pensado para projetos modernos com ESM e TypeScript. node:test: runner embutido no Node em versões recentes, sem dependência extra, usado com o módulo node:assert; confira a documentação da versão em uso. Escolha pela necessidade do projeto, não por moda: os conceitos (arrange, act, assert) são os mesmos.'),
          sl('Exemplo executável com node:test', 'Cada test() é um caso. Usamos node:assert/strict: equal compara com igualdade estrita, deepEqual compara o conteúdo de objetos, throws confere que uma função lança erro de determinado tipo. Rode com node --test arquivo.js.', 'const test = require(\'node:test\');\nconst assert = require(\'node:assert/strict\');\nfunction desconto(preco, pct) {\n  if (preco < 0 || pct < 0 || pct > 100) throw new RangeError(\'valor invalido\');\n  return Math.round(preco * (100 - pct)) / 100;\n}\ntest(\'aplica desconto\', () => { assert.equal(desconto(200, 10), 180); });\ntest(\'rejeita percentual maior que 100\', () => {\n  assert.throws(() => desconto(100, 150), RangeError);\n});\ntest(\'resultado esperado de objeto\', () => {\n  assert.deepEqual({ a: 1, b: [2] }, { a: 1, b: [2] });\n});\n// saída real (executado aqui, tempos omitidos):\n// ✔ aplica desconto\n// ✔ rejeita percentual maior que 100\n// ✔ resultado esperado de objeto\n// ℹ tests 3 | pass 3 | fail 0'),
          sl('Mocks, spies e snapshots (visão rápida)', 'Spy é uma função que observa: registra quantas vezes foi chamada e com quais argumentos, sem mudar o comportamento. Mock é uma função falsa programada para devolver o que o teste precisa (detalhes na lição de test doubles). Snapshot guarda a saída de uma função em arquivo na primeira execução e, nas seguintes, compara com ela; é prático para estruturas grandes e estáveis. O risco: aceitar a atualização do snapshot sem ler o que mudou transforma o teste em carimbo que sempre passa.'),
          sl('Cobertura: o que mede e o que não mede', 'Cobertura de código é a porcentagem do código executada durante os testes: de linhas, de funções e de ramos (branches, os dois lados de um if). Ela mostra o que NÃO é testado, e isso é útil. Mas 100% não prova correção: um teste pode executar a linha sem verificar nada (sem asserção). Use a cobertura para achar buracos, não como meta de gestão que incentive testes vazios. Ramos de erro e casos de borda (zero, vazio, valor máximo) costumam ficar de fora.'),
          sl('O que testar e como manter os testes saudáveis', 'Siga o padrão Arrange-Act-Assert: preparar os dados, executar a ação, verificar o resultado. Os bons testes são rápidos, independentes (nenhum depende da ordem ou do estado de outro), repetíveis (mesmo resultado sempre: sem depender do relógio, da rede ou de números aleatórios sem controle) e auto-verificáveis. Teste o COMPORTAMENTO observável (entradas e saídas) e os casos de borda, não os detalhes internos: se um refactoring que mantém o comportamento quebra o teste, o teste estava acoplado demais. Teste que falha às vezes sem motivo (flaky) destrói a confiança e deve ser consertado ou removido.')
        ]
      },
      questions: [
        mcq('q1', 'Segundo a pirâmide de testes, por que a maior parte dos testes deve ser unitária?', 'b', ['Cobrem o sistema inteiro e substituem os outros tipos de teste que a equipe possa escrever', 'São rápidos e baratos, o que permite rodá-los o tempo todo', 'Dependem de banco e rede reais, o que os torna mais fiéis ao ambiente de produção', 'Não precisam de asserções, pois o runner detecta sozinho os comportamentos incorretos'], 'Rapidez e baixo custo permitem muitos testes e retorno imediato. Eles não substituem integração e e2e, não usam banco e rede reais (isso os tornaria lentos) e continuam precisando de asserções.'),
        mcq('q2', 'Uma equipe quer escrever testes sem instalar nenhum pacote de terceiros, usando só o que vem com o Node. O que ela pode usar em versões recentes?', 'a', ['O módulo node:test com node:assert', 'O pacote jest, que já vem embutido no Node desde a instalação', 'O pacote vitest, que o npm instala automaticamente junto com o runtime', 'O comando node --coverage, que escreve os arquivos de teste a partir do código'], 'node:test e node:assert são embutidos (confira a versão). Jest e Vitest são pacotes de terceiros que precisam ser instalados, e a flag de cobertura mede, mas não cria testes.'),
        mcq('q3', 'O relatório mostra 100% de cobertura de linhas. O que isso garante?', 'a', ['Que todas as linhas foram executadas, mas não que os resultados foram verificados corretamente', 'Que o programa está livre de bugs, porque cada linha já foi usada por algum teste', 'Que os ramos de if e else foram testados, inclusive os casos de borda possíveis', 'Que os testes são determinísticos e passarão quando forem executados novamente'], 'Cobertura de linhas só informa execução; um teste sem asserção a infla. Não garante ausência de bugs, nem cobertura de ramos (outra métrica) ou determinismo.'),
        fill('q4', 'Complete a asserção que confere se desconto(200, 10) é igual a 180.', 'assert.___(desconto(200, 10), 180);', ['equal', 'strictEqual'], 'No modo estrito, equal (ou strictEqual) compara com ===. deepEqual serve para objetos e arrays.'),
        mcq('q5', 'Um teste usa new Date() e às vezes falha perto da meia-noite. Qual a correção mais sólida?', 'd', ['Executar o teste três vezes seguidas e considerar aprovado se passar em pelo menos duas', 'Aumentar o timeout do teste para que a meia-noite passe antes de a verificação acontecer', 'Remover a asserção sobre a data, deixando a verificação de que a função não lançou erro', 'Receber o relógio como dependência e usar uma data fixa no teste, tornando-o repetível'], 'Controlar a fonte do tempo elimina a causa da instabilidade. Repetir e aceitar maioria, esperar mais ou apagar a verificação escondem o problema em vez de resolvê-lo.'),
        mcq('q6', 'Qual o maior risco dos testes de snapshot?', 'c', ['Eles só funcionam com funções que retornam números, e falham com objetos ou textos', 'Eles impedem a execução de outros testes enquanto o arquivo de snapshot existir', 'Atualizar o snapshot sem revisar a diferença, aprovando regressões sem perceber', 'Eles apagam o código de produção quando detectam alguma diferença de saída'], 'O snapshot compara com o que foi aprovado antes; aprovar mudanças sem ler anula a proteção. Funcionam com estruturas variadas, não bloqueiam outros testes e nunca mexem no código de produção.'),
        mcq('q7', 'Após um refactoring que manteve o comportamento da função, três testes quebraram porque conferiam chamadas a funções internas privadas. O que isso indica?', 'b', ['O refactoring foi incorreto, porque testes não devem quebrar após uma mudança de código', 'Os testes estavam acoplados à implementação em vez de ao comportamento observável', 'A cobertura estava baixa, porque teste algum deveria enxergar funções internas', 'O runner está com defeito e deve ser trocado por outro, como Vitest ou Jest'], 'Testar o que entra e sai torna os testes resistentes a refactoring; verificar detalhes internos os torna frágeis. Se o comportamento não mudou, o problema está nos testes, não no refactoring nem no runner.'),
        fill('q8', 'Complete o último passo do padrão Arrange-Act-___.', '// Arrange: preparar dados\n// Act: executar a ação\n// ___: verificar o resultado', ['assert'], 'Arrange, Act, Assert: preparar, executar e verificar.')
      ]
    },
    {
      id: 'nji-29-testes-de-integracao',
      title: 'Testes de integração',
      goal: 'Testar uma API com várias partes funcionando juntas: servidor local, banco de teste, isolamento entre testes, fixtures com dados fictícios.',
      xp: 20,
      intro: {
        slides: [
          sl('O que é teste de integração', 'Teste de integração verifica várias peças trabalhando juntas: rota, validação, regras de negócio e, muitas vezes, o banco. Ele pega o que os unitários não pegam: erros de configuração, de SQL, de contrato entre módulos. Em APIs, o formato clássico é subir a aplicação, fazer uma requisição HTTP e conferir status e corpo da resposta. É mais lento que o unitário, então se escrevem menos testes desse tipo, focados em fluxos importantes.'),
          sl('Supertest e a alternativa nativa', 'Supertest é um pacote de terceiros muito usado com Express: ele recebe a aplicação e faz requisições sem você abrir porta manualmente. Sem pacotes, dá para fazer o mesmo com http.createServer e o fetch global do Node (em versões recentes), ouvindo na porta 0, que significa "sistema, escolha uma porta livre", o que evita conflito entre execuções em paralelo.'),
          sl('Exemplo executável: API de pedidos com node:test', 'Antes de cada teste (beforeEach) criamos um servidor novo e limpamos o estado; depois (afterEach) fechamos o servidor, para o processo não ficar pendurado. A aplicação aqui é um servidor mínimo guardado em memória, só para ter o que testar; mostramos o trecho dos testes.', 'test.beforeEach(async () => {\n  pedidos.clear();\n  servidor = criarApp();\n  await new Promise(r => servidor.listen(0, \'127.0.0.1\', r));\n  base = \'http://127.0.0.1:\' + servidor.address().port;\n});\ntest.afterEach(() => new Promise(r => servidor.close(r)));\ntest(\'cria e le um pedido\', async () => {\n  const r = await fetch(base + \'/pedidos\', { method: \'POST\', body: JSON.stringify({ item: \'caneta\', qtd: 2 }) });\n  assert.equal(r.status, 201);\n});\ntest(\'rejeita quantidade invalida\', async () => {\n  const r = await fetch(base + \'/pedidos\', { method: \'POST\', body: JSON.stringify({ item: \'caneta\', qtd: 0 }) });\n  assert.equal(r.status, 400);\n});\n// saída real (executado aqui, com os 3 testes do arquivo completo):\n// ✔ cria e le um pedido\n// ✔ rejeita quantidade invalida\n// ✔ estado nao vaza entre testes\n// ℹ tests 3 | pass 3 | fail 0'),
          sl('Banco de teste e isolamento', 'Use sempre um banco SEPARADO do de produção (e do de desenvolvimento): um teste que apaga tabelas no banco errado é um desastre. Opções: banco em memória, um contêiner descartável criado para os testes (Testcontainers, por nome), ou um schema próprio. Cada teste deve começar em estado conhecido: truncar tabelas entre testes, ou executar cada teste dentro de uma transação desfeita (rollback) no final. Se um teste só passa depois de outro, há vazamento de estado: o último teste do exemplo confere justamente que não sobrou nada.'),
          sl('Fixtures e dados fictícios', 'Fixture é o conjunto de dados preparado para um teste. Prefira funções fábrica (criarUsuario({ papel: "admin" })) que geram dados mínimos e válidos, em vez de arquivos enormes que ninguém entende. Os dados devem ser FICTÍCIOS: usuario@example.com, CPF claramente falso. Nunca copie dados reais de produção para testes: além do risco de vazamento, é tratamento de dados pessoais sem necessidade (LGPD). Se for inevitável, só com anonimização forte e orientação jurídica.'),
          sl('O que cobrir numa API', 'Para cada endpoint relevante: o caminho feliz (200/201), a validação de entrada (400 para dados inválidos), a autenticação (401 sem credencial ou com credencial inválida), a autorização (403 quando está autenticado mas sem permissão), o recurso inexistente (404) e os erros internos tratados (sem vazar detalhes na mensagem). Teste também que uma pessoa não acessa os dados de outra (autorização por objeto). Mantenha poucos testes de integração, mas nos pontos de maior risco.')
        ]
      },
      questions: [
        mcq('q1', 'Qual característica distingue um teste de integração de um unitário?', 'b', ['Substituir toda dependência por uma versão falsa para que rode mais rápido', 'Juntar várias partes reais, como rota, validação e banco, em um mesmo teste', 'Executar funções puras, sem efeito colateral ou estado compartilhado', 'Dispensar asserções, pois a verificação é feita visualmente por quem rodou o teste'], 'A integração exercita peças reais juntas. Substituir tudo por falsos é característica de unitários; funções puras e ausência de asserções não definem o tipo de teste.'),
        mcq('q2', 'Por que os testes usam servidor.listen(0)?', 'a', ['A porta 0 pede ao sistema uma porta livre, evitando conflito entre execuções paralelas', 'A porta 0 desativa o servidor depois da primeira requisição recebida durante o teste', 'A porta 0 é a porta padrão do HTTP, usada por qualquer servidor web em produção', 'A porta 0 impede que o servidor receba conexões externas e acelera as respostas'], 'Com 0, o sistema operacional escolhe uma porta disponível e você a lê em servidor.address().port. Não é porta padrão do HTTP (80/443) nem desativa o servidor.'),
        mcq('q3', 'Um teste só passa se o teste anterior tiver rodado antes. O que isso revela?', 'd', ['O runner embaralha a ordem de propósito, e isso é um recurso indispensável de um runner', 'O banco de teste está lento demais, e o problema some ao aumentar o tempo limite', 'Os testes estão corretos, porque dependências entre testes documentam o fluxo do usuário', 'Há estado vazando entre os testes; cada um deve preparar e limpar o que usa'], 'Dependência de ordem é sintoma de estado compartilhado e produz falhas intermitentes. Timeout não resolve a causa, e um teste isolado deve poder rodar sozinho.'),
        fill('q4', 'Complete a porta que faz o sistema escolher uma porta livre automaticamente.', 'servidor.listen(___, \'127.0.0.1\', callback);', ['0'], 'A porta 0 delega a escolha ao sistema operacional.'),
        mcq('q5', 'Para facilitar os testes, uma pessoa sugere copiar o banco de produção, com clientes reais, para o ambiente de teste. Qual a melhor resposta?', 'c', ['Aceitar, desde que o banco de teste fique protegido por uma senha mais forte que a de produção', 'Aceitar, porque testes locais não são considerados tratamento de dados pessoais pela LGPD', 'Evitar: usar dados fictícios gerados por fábricas, pois dados reais em testes ampliam o risco de vazamento', 'Aceitar, desde que a equipe de desenvolvimento tenha o arquivo de backup em seus computadores, com acesso protegido por VPN'], 'Dados reais em ambientes de teste ampliam a exposição sem necessidade; dados fictícios cumprem o mesmo papel. A senha não muda o risco de cópias locais, e o uso em testes continua sendo tratamento de dados pessoais.'),
        mcq('q6', 'Qual status HTTP é o esperado quando uma pessoa autenticada tenta acessar um recurso para o qual não tem permissão?', 'c', ['401 Unauthorized', '404 Not Found, porque revelar a existência do recurso é perigoso', '403 Forbidden', '500 Internal Server Error, porque a regra de negócio não foi atendida'], '403 indica identidade conhecida, mas sem permissão. 401 é para credencial ausente ou inválida. Alguns sistemas usam 404 para esconder recursos por decisão de design, mas não é a regra geral; 500 é falha do servidor, não de autorização.'),
        mcq('q7', 'Qual o motivo de fechar o servidor no afterEach?', 'b', ['Reduzir a quantidade de asserções necessárias para validar cada resposta', 'Evitar portas ocupadas e processos pendurados depois que os testes terminam', 'Obrigar o runner a executar os testes em ordem alfabética a cada execução', 'Impedir que o banco de teste receba as tabelas criadas pelos testes seguintes'], 'Um servidor aberto mantém o processo vivo e pode ocupar recursos; fechar garante término limpo. Isso não altera asserções, ordem ou criação de tabelas.'),
        fill('q8', 'Complete o status esperado quando a API recebe uma quantidade inválida (qtd igual a 0).', 'assert.equal(resposta.status, ___);', ['400'], '400 Bad Request indica entrada inválida do cliente.')
      ]
    },
    {
      id: 'nji-30-mocks-e-test-doubles',
      title: 'Mocks e test doubles',
      goal: 'Distinguir dummy, stub, spy, mock e fake, usar injeção de dependências para testar e saber quando não mockar.',
      xp: 20,
      intro: {
        slides: [
          sl('O que é um test double', 'Test double (dublê de teste) é um substituto de uma dependência real, usado só no teste, para isolar o código sob teste, tornar o resultado previsível e evitar efeitos reais (enviar e-mail de verdade, cobrar cartão, esperar a rede). O nome vem dos dublês de cinema. Há tipos diferentes, e usar o termo certo ajuda a comunicar o que o teste faz.'),
          sl('Os cinco tipos', 'Dummy: objeto passado só para preencher um parâmetro; nunca é usado de fato. Stub: devolve respostas prontas (um buscarCliente que sempre retorna o mesmo cliente). Spy: um stub que também REGISTRA como foi usado (quantas chamadas, com quais argumentos). Mock: dublê com expectativas de interação programadas, que faz o teste falhar se não forem cumpridas (em muitas bibliotecas "mock" também é usado de forma geral para qualquer dublê). Fake: implementação simplificada que realmente funciona, mas não serve para produção, como um repositório de usuários guardado em memória em vez de banco.'),
          sl('Injeção de dependências para testar', 'Para trocar uma dependência no teste, o código precisa recebê-la de fora (injeção de dependências) em vez de importá-la fixa lá dentro. No exemplo, criarServico recebe enviarEmail e agora como parâmetros: em produção entram as versões reais, no teste entram um mock e um relógio fixo. test.mock.fn do node:test cria uma função espiã/mock: mock.callCount() e mock.calls guardam as chamadas.', 'function criarServico({ enviarEmail, agora }) {\n  return {\n    async cadastrar(email) {\n      if (!email.includes(\'@\')) throw new Error(\'email invalido\');\n      await enviarEmail(email, \'Bem-vindo\');\n      return { email, criadoEm: agora().toISOString() };\n    }\n  };\n}\ntest(\'chama o envio uma vez\', async () => {\n  const enviar = test.mock.fn(async () => {});\n  const svc = criarServico({ enviarEmail: enviar, agora: () => new Date(\'2030-01-01T00:00:00Z\') });\n  await svc.cadastrar(\'usuario@example.com\');\n  assert.equal(enviar.mock.callCount(), 1);\n});\n// saída real (executado aqui, com os 3 testes do arquivo completo):\n// ✔ chama o envio uma vez (spy/mock)\n// ✔ nao envia e-mail se o endereco e invalido\n// ✔ tempo falso avanca sem esperar\n// ℹ tests 3 | pass 3 | fail 0'),
          sl('Mockar tempo e rede', 'Tempo: o código que depende de Date.now ou setTimeout é difícil de testar sem esperar. Duas saídas: injetar o relógio (como acima) ou usar timers falsos, em que o teste "avança o relógio" sem esperar de verdade (no node:test, t.mock.timers.enable e tick; em versões recentes). Rede: um teste unitário nunca deve chamar a API real de um terceiro: seria lento, instável e poderia disparar efeitos reais ou usar dados pessoais. Substitua o cliente HTTP por um stub, ou suba um servidor local falso (como nas lições de integração).', 'test(\'tempo falso avanca sem esperar\', (t) => {\n  t.mock.timers.enable({ apis: [\'setTimeout\'] });\n  let rodou = false;\n  setTimeout(() => { rodou = true; }, 60000);\n  assert.equal(rodou, false);\n  t.mock.timers.tick(60000);\n  assert.equal(rodou, true); // sem esperar 60 s de verdade\n});'),
          sl('Quando NÃO mockar', 'Não mocke o código que você está testando: isso testa o mock. Não mocke tipos simples e funções puras (somar, formatar): use-os de verdade. Muitos mocks encadeados reproduzem a implementação linha a linha, e o teste quebra a cada refactoring sem proteger nada. Para o banco, prefira em testes de integração um banco de teste real: um mock de SQL não descobre uma consulta errada. Regra: mocke nas fronteiras do sistema (rede, e-mail, relógio, serviços externos) e use o código real no miolo.'),
          sl('Armadilhas dos dublês', 'Drift: o mock responde algo que o serviço real não responde mais, e os testes passam enquanto a produção falha. Mitigação: testes de contrato ou alguns testes de integração contra um ambiente de teste do serviço. Excesso de verificação de interações (conferir cada chamada interna) acopla o teste à implementação. Restaure ou recrie os mocks a cada teste para não vazar estado entre eles (no node:test, os mocks criados por t.mock são restaurados ao fim do teste). Nunca use dados reais de pessoas nas respostas dos stubs.')
        ]
      },
      questions: [
        mcq('q1', 'Qual a diferença essencial entre um stub e um spy?', 'a', ['O stub devolve respostas prontas; o spy também registra como foi chamado', 'O stub registra as chamadas; o spy devolve respostas prontas para o teste', 'O stub funciona só em produção; o spy funciona só em ambientes de teste', 'Não há diferença, os dois nomes se referem ao mesmo tipo de dublê'], 'O stub fornece respostas fixas; o spy acrescenta o registro de uso. A inversão das duas funções não procede, ambos são usados em testes e os conceitos são distintos.'),
        mcq('q2', 'Um repositório de usuários guardado num objeto em memória, com salvar e buscar funcionando de verdade, usado nos testes no lugar do banco. Que tipo de dublê é esse?', 'd', ['Dummy', 'Spy', 'Mock', 'Fake'], 'Fake é uma implementação simplificada que funciona. Dummy apenas preenche parâmetros, spy registra chamadas e mock traz expectativas de interação; nenhum deles implementa a lógica completa de um repositório.'),
        mcq('q3', 'Qual o benefício de passar enviarEmail e agora como parâmetros do serviço?', 'd', ['O serviço fica obrigado a enviar o e-mail duas vezes, o que garante a entrega', 'O Node otimiza automaticamente funções recebidas como parâmetros, acelerando a execução', 'O código passa a não precisar de validação de entrada, pois o teste confere tudo', 'No teste dá para trocar o e-mail real e o relógio por versões controladas'], 'Receber dependências de fora permite substituí-las no teste. Não há envio duplicado, ganho de otimização nem dispensa da validação.'),
        fill('q4', 'Complete o método do node:test que cria uma função espiã/mock.', 'const enviar = test.mock.___(async () => {});', ['fn'], 'test.mock.fn cria uma função cujo uso é registrado (callCount, calls).'),
        mcq('q5', 'Para que servem os timers falsos num teste?', 'c', ['Aumentar o tempo real de espera para que o teste seja mais confiável', 'Substituir o laço de eventos por um que não bloqueia a execução', 'Avançar o relógio de forma simulada, sem esperar o tempo real passar', 'Garantir que o código rode em produção com a mesma velocidade do teste'], 'Com timers falsos, o teste executa de imediato código que esperaria 60 segundos. Eles não aumentam a espera, não trocam o laço de eventos e não afetam produção.'),
        mcq('q6', 'Em qual situação mockar é uma má ideia?', 'b', ['Mockar o envio real de e-mail, porque o teste não deve mandar mensagens de verdade', 'Mockar a própria função que está sendo testada, pois o teste passaria a verificar o mock', 'Mockar a chamada a uma API de pagamento de terceiros dentro de um teste unitário', 'Mockar o relógio para fixar a data usada na regra de negócio'], 'Se você substitui o código sob teste, não testa nada do código real. As demais opções são exemplos de fronteiras (e-mail, API externa, tempo) em que dublês são apropriados.'),
        mcq('q7', 'Os testes passam com o mock de uma API externa, mas a produção falha porque a API mudou o formato da resposta. Como se chama o problema e qual mitigação ajuda?', 'a', ['Drift do mock; testes de contrato ou alguns testes de integração contra o serviço de teste', 'Cobertura baixa; basta aumentar o percentual de linhas executadas nos testes unitários', 'Flakiness; basta repetir os testes até que a produção volte a se comportar como o mock', 'Snapshot expirado; basta apagar o arquivo de snapshot e executar os testes outra vez'], 'O mock ficou diferente da realidade (drift), e só a verificação do contrato real revela isso. Aumentar cobertura, repetir testes ou apagar snapshots não compara o mock com o serviço verdadeiro.'),
        fill('q8', 'Complete o tipo de dublê usado apenas para preencher um parâmetro que nunca é utilizado.', '// objeto passado só para cumprir a assinatura da função: um ___', ['dummy'], 'Dummy é o dublê que só ocupa lugar; nunca é chamado.')
      ]
    },
    {
      id: 'nji-31-logs-estruturados',
      title: 'Logs estruturados',
      goal: 'Produzir logs em JSON com níveis e correlação por ID de requisição, mascarar campos sensíveis e evitar registrar dados pessoais.',
      xp: 20,
      intro: {
        slides: [
          sl('Por que logar, e por que estruturar', 'Logs são o diário do sistema: contam o que aconteceu, para investigar falhas e auditar eventos. Log em texto livre ("usuario 42 falhou no login") é legível para humanos, mas difícil para máquinas filtrarem. Log estruturado grava cada evento como um objeto, normalmente JSON, com campos fixos (nivel, msg, reqId, duracaoMs). Ferramentas de busca então respondem "todas as linhas com nivel=error para o reqId X". Uma linha por evento, sempre.'),
          sl('Níveis de log', 'Níveis classificam a gravidade: fatal (o processo vai cair), error (uma operação falhou), warn (algo estranho, mas seguiu), info (eventos normais de negócio), debug e trace (detalhes para desenvolvimento). Em produção costuma-se ligar info ou acima, e abrir debug por tempo limitado ao investigar. Um nível configurável por ambiente (variável de ambiente) evita redeploy. Logar demais custa dinheiro e esconde o que importa; logar de menos deixa você às cegas.'),
          sl('pino e winston', 'Duas bibliotecas de terceiros (por nome): pino, focada em velocidade e em JSON puro, com suporte a redaction e loggers "filhos"; e winston, mais flexível, com vários transports (destinos: arquivo, console, serviços) e formatos. O padrão é escrever no stdout (saída padrão) e deixar a plataforma (contêiner, orquestrador, agente de logs) coletar e encaminhar. Isso evita que a aplicação gerencie arquivos de log.', '// Ilustrativo, não executado aqui (pino)\nconst log = require(\'pino\')({ level: process.env.LOG_LEVEL || \'info\', redact: [\'req.headers.authorization\', \'senha\'] });\nlog.info({ pedidoId: 1001 }, \'pedido criado\');'),
          sl('Correlação: ID de requisição', 'Num sistema com muitas requisições simultâneas as linhas se misturam. Solução: gerar (ou aceitar de um cabeçalho como X-Request-Id, validando-o) um identificador por requisição e incluí-lo em TODA linha daquela requisição (reqId). Assim se reconstrói a história de uma requisição. Em Node, o AsyncLocalStorage (módulo nativo async_hooks) guarda o reqId no contexto assíncrono, sem passá-lo como parâmetro em cada função; outra forma é criar um logger filho (child) com o reqId já embutido.'),
          sl('Redaction: mascarar campos sensíveis', 'Redaction é trocar, antes de gravar, o valor de campos sensíveis por um marcador. O exemplo percorre o objeto, mascara chaves de uma lista (senha, token, cpf, authorization) inclusive em objetos aninhados e grava JSON em uma linha. Melhor ainda é a abordagem de lista de permissão (allowlist): só entram no log os campos explicitamente autorizados, porque uma lista de bloqueio (denylist) esquece o campo novo que alguém adicionar amanhã.', 'function redigir(obj) {\n  const saida = {};\n  for (const [k, v] of Object.entries(obj)) {\n    if (SENSIVEIS.has(k.toLowerCase())) saida[k] = \'[REDACTED]\';\n    else if (v && typeof v === \'object\' && !Array.isArray(v)) saida[k] = redigir(v);\n    else saida[k] = v;\n  }\n  return saida;\n}\n// saída real (executado aqui, com SENSIVEIS = senha, token, cpf, authorization):\n// {"nivel":"info","msg":"pedido criado","reqId":"req-7f3a","pedidoId":1001,"usuarioId":42}\n// {"nivel":"warn","msg":"tentativa de login falhou","reqId":"req-7f3a","usuario":{"id":42,"senha":"[REDACTED]"}}\n// {"nivel":"error","msg":"falha no pagamento","reqId":"req-7f3a","cpf":"[REDACTED]","motivo":"timeout"}'),
          sl('O que NÃO logar (LGPD e segurança)', 'Nunca registre senhas, tokens, chaves de API, cookies de sessão, números de cartão, CPF e outros dados pessoais ou sensíveis, nem corpos completos de requisição. Registre identificadores internos (usuarioId) em vez de e-mail ou nome. Logs são cópias que vivem em muitos lugares: defina retenção limitada (apague depois de um prazo), restrinja o acesso e não os envie a serviços sem avaliar o impacto. Não devolva stack traces ao cliente: grave no log e responda com mensagem genérica mais o reqId. A LGPD trata de minimização e segurança no tratamento de dados; isto é visão geral e não substitui orientação jurídica.')
        ]
      },
      questions: [
        mcq('q1', 'Qual a principal vantagem de logs em JSON em relação a texto livre?', 'a', ['Ferramentas conseguem filtrar e agregar por campos, como nivel ou reqId', 'O arquivo de log fica menor, porque JSON dispensa nomes de campos', 'Os logs deixam de poder conter dados pessoais, pois o formato é validado', 'O Node escreve JSON mais rápido do que qualquer outro tipo de saída'], 'Campos nomeados permitem consultas precisas. JSON repete nomes de campos (não fica menor), não impede dados pessoais e a velocidade de escrita não é o argumento principal.'),
        mcq('q2', 'Em produção, que nível mínimo costuma ser mantido por padrão, abrindo debug só durante investigações?', 'd', ['trace, para que detalhes não sejam perdidos em caso de falha', 'fatal, porque os demais níveis geram custo sem benefício algum', 'debug, porque é o nível que mostra as mensagens de negócio ao usuário', 'info'], 'Info registra eventos normais sem o volume de debug/trace. Trace em produção gera ruído e custo, fatal perderia erros e avisos, e logs não são mensagens para o usuário final.'),
        mcq('q3', 'Para que serve incluir um reqId em todas as linhas de log de uma requisição?', 'c', ['Criptografar as linhas para que só quem tem o reqId consiga lê-las e proteger o conteúdo de cada linha', 'Fazer o nível de log mudar automaticamente conforme a gravidade da requisição', 'Reunir as linhas de uma mesma requisição entre muitas simultâneas, facilitando investigar', 'Impedir que duas requisições diferentes sejam processadas ao mesmo tempo'], 'O identificador correlaciona eventos. Não criptografa, não altera níveis e não controla concorrência.'),
        fill('q4', 'Complete o marcador usado no lugar do valor de campos sensíveis após a redaction.', 'saida[k] = \'[___]\';', ['REDACTED'], 'O marcador [REDACTED] indica que havia um valor sensível que foi omitido.'),
        mcq('q5', 'O que o AsyncLocalStorage resolve no contexto de logs?', 'b', ['Gravar os logs em disco de forma síncrona para que não se percam', 'Manter o reqId acessível em todo o fluxo assíncrono da requisição sem passá-lo por parâmetro', 'Converter automaticamente objetos em JSON antes de enviá-los ao console', 'Impedir que logs de uma requisição apareçam depois dos logs de requisições mais novas'], 'Ele guarda um contexto que acompanha as chamadas assíncronas da mesma requisição. Não faz gravação síncrona, serialização nem ordenação entre requisições.'),
        mcq('q6', 'Por que registrar usuarioId: 42 é preferível a registrar o e-mail do usuário no log?', 'b', ['Porque o e-mail muda com frequência e o número é imutável em qualquer sistema', 'Reduz o dado pessoal armazenado nos logs, seguindo a minimização, e ainda permite rastrear o caso', 'Porque números ocupam menos espaço e a LGPD proíbe texto nos logs', 'Porque o e-mail não pode ser armazenado em JSON por conter o caractere arroba, segundo a especificação do formato'], 'O identificador interno permite investigar sem expor dados pessoais nos logs. A LGPD não proíbe texto em logs; a justificativa é minimização, e o JSON aceita arroba normalmente.'),
        mcq('q7', 'Por que uma lista de permissão (allowlist) de campos do log é mais segura que uma lista de bloqueio?', 'a', ['Um campo novo e sensível não vaza, pois só entram os campos autorizados', 'Porque a lista de permissão torna as linhas de log mais curtas que as de bloqueio', 'Porque a lista de bloqueio só funciona com objetos que não tenham aninhamento', 'Porque a lista de permissão dispensa a definição de níveis de log em produção'], 'Na allowlist o padrão é omitir; na denylist, o campo esquecido é gravado. O tamanho das linhas, o aninhamento e os níveis não são o ponto.'),
        fill('q8', 'Complete o nível de log entre info e error, usado para algo estranho que não impediu a operação.', 'log.___({ reqId }, \'tentativa de login falhou\');', ['warn'], 'warn sinaliza situação suspeita ou inesperada sem falha total da operação.')
      ]
    },
    {
      id: 'nji-32-observabilidade-metricas-e-tracing',
      title: 'Observabilidade: métricas e tracing',
      goal: 'Distinguir logs, métricas e traces, expor métricas e health checks e definir SLIs e SLOs simples.',
      xp: 20,
      intro: {
        slides: [
          sl('Os três pilares', 'Observabilidade é a capacidade de entender o que acontece dentro do sistema olhando para o que ele emite. Três tipos de sinal se completam. Logs: eventos individuais com detalhes (lição anterior). Métricas: números agregados no tempo (requisições por segundo, taxa de erro, uso de memória), baratos e ótimos para alertas e gráficos. Traces: o caminho de UMA requisição através de vários serviços, mostrando onde o tempo foi gasto. Métricas dizem que há um problema; traces e logs ajudam a achar a causa.'),
          sl('Métricas e Prometheus', 'Três tipos básicos: contador (só cresce: total de requisições), gauge (sobe e desce: conexões abertas) e histograma (distribui valores em faixas, como latências). Prometheus (por nome) é um sistema que "raspa" (scrape) periodicamente um endpoint HTTP da aplicação, geralmente /metrics, em formato texto. O exemplo expõe um contador manualmente. Cuidado com a cardinalidade: cada combinação de valores de rótulos cria uma série; usar userId como rótulo cria milhões de séries e derruba o sistema. Rótulos devem ter poucos valores possíveis (rota, status).', 'const linhas = [\'# TYPE http_requisicoes_total counter\',\n  ...[...contadores].map(([k, v]) => k + \' \' + v)];\n// saída real (executado aqui, depois de 2 chamadas a /saude e 1 a /x):\n// # TYPE http_requisicoes_total counter\n// http_requisicoes_total{rota="/saude",status="200"} 2\n// http_requisicoes_total{rota="outra",status="404"} 1'),
          sl('Tracing e OpenTelemetry (conceito)', 'Um trace representa uma requisição inteira e é formado por spans: cada span é uma etapa com início e duração (a rota, a consulta ao banco, a chamada a outro serviço). Para ligar os serviços, o identificador do trace viaja num cabeçalho (traceparent, padrão W3C) de um serviço para o outro. OpenTelemetry é um padrão aberto e um conjunto de bibliotecas para instrumentar a aplicação e exportar métricas, traces e logs para vários backends sem prender você a um fornecedor. Aqui é só conceito: a configuração depende do backend escolhido. Nunca ponha dados pessoais em atributos de spans.'),
          sl('Health checks: liveness e readiness', 'Orquestradores e balanceadores perguntam à aplicação se ela está bem. Liveness: "o processo está vivo?"; se falha, a plataforma reinicia. Deve ser leve e NÃO depender do banco (senão uma queda do banco reinicia todas as instâncias à toa). Readiness: "está pronto para receber tráfego?"; se falha, a instância sai do balanceamento sem reiniciar, e pode verificar dependências essenciais (banco, cache). Responda 200 ou 503 com corpo mínimo: não exponha versões, nomes de servidores nem detalhes internos.'),
          sl('SLIs e SLOs', 'SLI (indicador de nível de serviço) é uma medida: "proporção de requisições com status menor que 500" ou "latência no percentil 95". SLO (objetivo de nível de serviço) é a meta para o SLI: "99% de sucesso em 30 dias". A diferença entre 100% e o SLO é o orçamento de erro: quanto de falha é aceitável, usado para decidir entre entregar novidades e estabilizar. Prefira percentis (p95, p99) à média: a média esconde os usuários que sofrem com respostas muito lentas.'),
          sl('Alertas que valem a pena', 'Alerte sobre sintomas que afetam usuários (taxa de erro acima do SLO, latência alta, fila crescendo sem parar) em vez de causas isoladas (CPU a 80% por um minuto). Alertas demais cansam a equipe, que passa a ignorá-los; cada alerta deve pedir uma ação. Inclua nele um link para o painel e o procedimento (runbook). Métricas e traces também são dados: evite identificadores pessoais em rótulos e atributos, e defina quanto tempo guardá-los.')
        ]
      },
      questions: [
        mcq('q1', 'Qual a diferença principal entre métricas e logs?', 'd', ['Métricas guardam o corpo completo das requisições; logs guardam contagens', 'Métricas só existem em ambientes de teste; logs só existem em produção', 'Métricas substituem logs por completo e tornam desnecessário investigar eventos', 'Métricas são números agregados no tempo; logs são registros de eventos individuais'], 'Métricas agregam (baratas, boas para alertas); logs detalham eventos. Elas não guardam corpos de requisição, existem em ambos os ambientes e se complementam em vez de se substituírem.'),
        mcq('q2', 'Uma requisição passa por quatro serviços e demora muito. Que sinal mostra melhor em qual serviço o tempo foi gasto?', 'c', ['Um gauge com a memória usada por cada um dos serviços envolvidos', 'Um contador com o total de requisições recebidas por minuto no gateway', 'Um trace, com os spans e as durações de cada etapa', 'Um health check de liveness chamado em cada serviço individualmente'], 'O trace decompõe uma requisição em etapas com tempos. Memória, contagem total e liveness não relacionam o tempo à cadeia de chamadas daquela requisição.'),
        mcq('q3', 'O banco de dados ficou indisponível. Qual comportamento é o mais adequado para os health checks?', 'c', ['Liveness e readiness falham, para a plataforma reiniciar as instâncias imediatamente', 'Nem um nem outro falha, pois o processo continua rodando normalmente', 'Readiness falha e tira a instância do balanceamento; liveness continua ok, sem reiniciar', 'Só o liveness falha, porque a readiness não deve consultar dependências'], 'Reiniciar o processo não conserta o banco; basta parar de enviar tráfego (readiness). Liveness atrelado ao banco causaria reinícios em cascata, e readiness é justamente onde se checam dependências essenciais.'),
        fill('q4', 'Complete o caminho em que o Prometheus costuma raspar as métricas da aplicação.', 'app.get(\'/___\', mostrarMetricas);', ['metrics', 'metricas'], 'A convenção é expor as métricas em /metrics (neste curso, o exemplo usou /metricas); o importante é configurar o scraper com o caminho escolhido.'),
        mcq('q5', 'Por que não usar o id do usuário como rótulo de uma métrica?', 'b', ['Porque rótulos só aceitam números pares, e muitos ids seriam rejeitados', 'Cada valor novo cria uma série nova e explode a cardinalidade', 'Porque o Prometheus não consegue raspar endpoints que contenham números', 'Porque contadores só funcionam quando não possuem rótulo associado'], 'Rótulos de alta cardinalidade multiplicam séries e costumam identificar pessoas. As demais restrições citadas não existem.'),
        mcq('q6', 'Qual a relação entre SLI e SLO?', 'a', ['O SLI é a medida (ex.: taxa de sucesso); o SLO é a meta definida para ela (ex.: 99%)', 'O SLO é a medida de latência; o SLI é o contrato jurídico com multas', 'SLI e SLO são sinônimos e diferem pela sigla em português e inglês, sem diferença de significado', 'O SLI é a meta de disponibilidade; o SLO é o gráfico em que ela é exibida'], 'Indicador é o que se mede; objetivo é o alvo. Não são sinônimos, e o SLO não é contrato com multas (isso seria um SLA, outro conceito).'),
        mcq('q7', 'Por que acompanhar a latência no percentil 95 em vez de apenas a média?', 'd', ['O percentil 95 é menor que a média, o que deixa o painel mais bonito', 'A média não pode ser calculada com histogramas, e sim com contadores simples, porque histogramas só guardam valores máximos', 'Porque o percentil 95 elimina a necessidade de definir SLOs para a latência', 'A média pode parecer boa mesmo quando uma parte dos usuários recebe respostas muito lentas'], 'Médias escondem a cauda lenta; percentis a revelam. O p95 em geral é maior (não menor) que a média, histogramas permitem calcular médias e percentis, e o percentil é justamente o tipo de SLI usado em SLOs.'),
        fill('q8', 'Complete a sigla da meta definida para um indicador de serviço (ex.: 99% de sucesso em 30 dias).', '// SLI mede; o ___ é a meta', ['SLO'], 'SLO (service level objective) é a meta que se compara com o SLI.')
      ]
    },
    {
      id: 'nji-33-documentacao-openapi',
      title: 'Documentação com OpenAPI',
      goal: 'Descrever uma API com OpenAPI, escolher entre contrato-primeiro e código-primeiro, aproveitar o esquema para validar e gerar clientes e manter tudo versionado.',
      xp: 20,
      intro: {
        slides: [
          sl('O que é OpenAPI', 'OpenAPI é uma especificação padrão para descrever APIs HTTP em um arquivo YAML ou JSON: quais caminhos existem, quais métodos aceitam, quais parâmetros e corpos esperam, quais respostas devolvem (com códigos de status) e como se autenticar. Swagger é o nome histórico da especificação e hoje designa principalmente ferramentas, como o Swagger UI, que gera uma página interativa a partir do arquivo. Um arquivo OpenAPI é um CONTRATO entre quem constrói e quem consome a API, legível por pessoas e por máquinas.'),
          sl('Anatomia de um documento', 'O documento tem informações gerais (título e versão da API), paths (cada caminho com seus métodos), components (esquemas reutilizáveis de dados e esquemas de segurança) e responses por código de status. Os corpos são descritos com JSON Schema, o mesmo vocabulário de tipos, campos obrigatórios e limites usado em validação. Ilustrativo, não executado aqui (descrição, não programa):', 'openapi: 3.1.0\ninfo: { title: API de Pedidos (exemplo), version: 1.0.0 }\npaths:\n  /v1/pedidos:\n    post:\n      summary: Cria um pedido\n      security: [{ bearerAuth: [] }]\n      requestBody:\n        content:\n          application/json:\n            schema: { $ref: \'#/components/schemas/NovoPedido\' }\n      responses:\n        \'201\': { description: Criado }\n        \'400\': { description: Dados inválidos }\n        \'401\': { description: Não autenticado }\ncomponents:\n  schemas:\n    NovoPedido:\n      type: object\n      required: [item, qtd]\n      additionalProperties: false\n      properties:\n        item: { type: string, minLength: 2 }\n        qtd: { type: integer, minimum: 1 }'),
          sl('Contrato-primeiro x código-primeiro', 'Contrato-primeiro (design-first): você escreve o OpenAPI antes do código, revisa com quem vai consumir a API e dele gera esqueletos de servidor, validação, clientes e mocks. Vantagem: acordo cedo, times trabalham em paralelo. Código-primeiro (code-first): o contrato é gerado a partir do código, por exemplo pelos decorators do NestJS ou pelos esquemas das rotas do Fastify. Vantagem: menos duplicação e menos risco de a doc divergir do código. Risco do contrato-primeiro: o código se afastar do contrato; do código-primeiro: expor sem querer detalhes internos. Em ambos, o arquivo gerado ou escrito deve ser revisado.'),
          sl('Geração de clientes e documentação', 'A partir do arquivo OpenAPI, geradores criam clientes tipados (SDKs) para outras linguagens, servidores de mock para o front-end trabalhar antes de o back-end existir e páginas de documentação (Swagger UI, Redoc). Testes de contrato conferem que as respostas reais respeitam o esquema declarado. Revise o código gerado como qualquer outro, e nos exemplos da documentação use SEMPRE dados fictícios (usuario@example.com), nunca dados reais nem segredos reais.'),
          sl('Validação por esquema', 'O mesmo esquema que documenta pode validar a entrada em tempo de execução: o Fastify, por exemplo, valida corpo, query e parâmetros com o esquema declarado na rota (usando o validador Ajv) e responde 400 se não casar. Duas vantagens: documentação e validação nunca divergem, e a validação acontece antes do seu código de negócio. Declare additionalProperties: false para rejeitar campos desconhecidos: isso barra o mass assignment, quando o cliente envia um campo extra, como admin, que o código grava sem querer.'),
          sl('Versionar e manter atualizado', 'Versione a API (por exemplo /v1/ no caminho ou um cabeçalho) para poder evoluir sem quebrar clientes. Mudança compatível: adicionar um campo opcional na resposta, um novo endpoint. Mudança que quebra: remover ou renomear um campo, tornar obrigatório um campo antes opcional, mudar um tipo. Mudanças que quebram vão para uma nova versão, com a antiga marcada como depreciada e com prazo avisado. Mantenha o arquivo no repositório, revise-o nos pull requests e valide-o no CI (um linter e uma comparação automática que detecta quebras). Não publique endpoints internos na documentação pública.')
        ]
      },
      questions: [
        mcq('q1', 'O que é um documento OpenAPI?', 'd', ['Um programa em Node que sobe o servidor e responde às requisições da API automaticamente', 'Um banco de dados onde ficam armazenados os registros que a API entrega aos clientes', 'Um certificado digital que prova a identidade do servidor e protege o tráfego da API', 'Uma descrição, em YAML ou JSON, dos caminhos, parâmetros, corpos e respostas de uma API HTTP'], 'OpenAPI é um contrato descritivo, legível por pessoas e máquinas. Não é programa, banco de dados nem certificado TLS.'),
        mcq('q2', 'Qual a vantagem principal da abordagem contrato-primeiro?', 'c', ['O código dispensa testes, pois o contrato garante que o comportamento esteja correto', 'A documentação é perfeita, porque o arquivo é escrito por ferramenta sem intervenção humana', 'Os times concordam e trabalham em paralelo desde cedo, usando o contrato para gerar mocks e clientes', 'A API passa a aceitar formatos variados de dados enviado pelos clientes sem rejeitá-los'], 'O contrato antecipado serve de acordo e destrava trabalho em paralelo. Ele não substitui testes, não é gerado sem pessoas nesse modelo e não torna a API permissiva.'),
        mcq('q3', 'Por que declarar additionalProperties: false no esquema de um corpo de requisição?', 'b', ['Para permitir que o cliente adicione quantos campos quiser sem que o servidor os valide, mesmo os desconhecidos', 'Para rejeitar campos desconhecidos, como um admin enviado de propósito, e evitar mass assignment', 'Para que a documentação deixe de listar os campos opcionais do objeto', 'Para que o servidor gere automaticamente os campos que faltarem na requisição'], 'Com o valor false, qualquer campo não declarado falha a validação. O oposto de permitir campos livres, e nada a ver com ocultar opcionais ou gerar campos.'),
        fill('q4', 'Complete o nome do vocabulário usado pelo OpenAPI para descrever e validar os corpos.', '// os corpos do OpenAPI são descritos com JSON ___', ['Schema'], 'JSON Schema define tipos, campos obrigatórios e limites, e é a base da validação por esquema.'),
        mcq('q5', 'Qual destas mudanças numa resposta da API v1 é uma quebra de compatibilidade?', 'a', ['Remover o campo total, que clientes já utilizam', 'Acrescentar o campo opcional observacoes à resposta existente', 'Adicionar um novo endpoint GET /v1/produtos que ainda não existia', 'Incluir um novo exemplo de uso na documentação do endpoint'], 'Quem lê total deixa de funcionar quando ele some. Adicionar campo opcional, novo endpoint ou exemplo não afeta os clientes existentes.'),
        mcq('q6', 'Como evitar que o arquivo OpenAPI fique desatualizado em relação ao código?', 'a', ['Mantê-lo no repositório, revisá-lo nos pull requests e validá-lo no CI', 'Atualizá-lo uma vez por ano, durante o planejamento da próxima versão', 'Guardá-lo no computador de quem escreveu a primeira versão da API', 'Excluir o arquivo quando a API entrar em produção, porque deixa de ser necessário'], 'Versionamento, revisão e verificação automática mantêm contrato e código juntos. Atualização anual, arquivo isolado ou exclusão deixam a divergência crescer.'),
        mcq('q7', 'Que tipo de dados usar nos exemplos da documentação pública da API?', 'd', ['Dados reais de clientes antigos, com nomes trocados parcialmente', 'Uma cópia de poucos registros de produção, escolhidos aleatoriamente', 'Os dados do ambiente do desenvolvedor, incluindo tokens de teste ainda válidos', 'Dados fictícios, como usuario@example.com'], 'Exemplos públicos não devem expor dados pessoais nem credenciais; dados fictícios cumprem o papel. Dados reais mascarados, registros de produção e tokens válidos continuam sendo risco.'),
        fill('q8', 'Complete o trecho de versão no caminho de uma API versionada.', 'POST /___/pedidos', ['v1'], 'Colocar a versão no caminho (/v1/) permite manter versões antigas enquanto uma nova evolui.')
      ]
    },
    {
      id: 'nji-34-graphql-visao',
      title: 'GraphQL: visão geral',
      goal: 'Entender esquema, queries, mutations e resolvers do GraphQL, o problema N+1, os riscos de segurança e quando vale usar em vez de REST.',
      xp: 20,
      intro: {
        slides: [
          sl('O que é GraphQL', 'GraphQL é uma linguagem de consulta para APIs: em vez de vários endpoints fixos, existe normalmente um só (por exemplo POST /graphql) e o CLIENTE descreve exatamente quais campos quer. Isso evita o over-fetching (receber campos que não usa) e o under-fetching (precisar de várias requisições para montar uma tela). O servidor devolve um JSON com a mesma forma da consulta. Implementações em Node (por nome): Apollo Server, GraphQL Yoga, Mercurius (Fastify) e o módulo GraphQL do NestJS. Aqui é uma visão geral; os trechos são ilustrativos.'),
          sl('Esquema, queries e mutations', 'O esquema (em SDL, a linguagem de definição) descreve os tipos e as operações. Query lê dados; Mutation altera dados (criar, atualizar, apagar); há ainda Subscription para eventos em tempo real. Um ponto de exclamação (!) significa "não nulo". O cliente pede só o que precisa:', '# Ilustrativo, não executado aqui\ntype Pedido { id: ID!  item: String!  cliente: Cliente! }\ntype Cliente { id: ID!  nome: String! }\ntype Query { pedido(id: ID!): Pedido }\ntype Mutation { cancelarPedido(id: ID!): Pedido }\n\n# consulta do cliente\nquery { pedido(id: "1001") { item cliente { nome } } }'),
          sl('Resolvers', 'Resolver é a função que sabe obter o valor de UM campo do esquema. Cada campo pode ter o seu: pedido busca no banco, cliente busca o dono do pedido. Os resolvers recebem um contexto, criado por requisição, que carrega por exemplo o usuário autenticado e as conexões. Como cada campo é resolvido separadamente, é fácil sem querer disparar muitas consultas ao banco, e é aí que nasce o problema N+1.'),
          sl('O problema N+1 e o DataLoader', 'Ao listar 100 pedidos e pedir o cliente de cada um, o servidor faz 1 consulta para os pedidos e mais 100 para os clientes: são N+1 consultas. A solução é agrupar (batching): o DataLoader (pacote de terceiros) junta todos os ids pedidos no mesmo ciclo e faz UMA consulta com a lista de ids, além de guardar cache por requisição. A simulação abaixo (só JavaScript nativo) mostra a diferença de contagem.', 'async function buscarAutor(id) { consultas++; return autores[id]; }\nasync function buscarAutores(ids) { consultas++; return ids.map(id => autores[id]); }\n// 3 posts, 2 autores distintos\n// saída real (executado aqui):\n// sem lote (N+1): 3 consultas\n// com lote: 1 consulta'),
          sl('Riscos de segurança', 'Como o cliente controla a forma da consulta, é preciso se defender: consultas muito profundas ou caras (limite de profundidade e de custo, e timeout); abuso com muitos aliases ou lotes numa única requisição; introspecção (o cliente pergunta o esquema inteiro), que em produção deve ser desativada ou restrita quando a API não é pública; paginação obrigatória com limite máximo nas listas; e AUTORIZAÇÃO por campo e por objeto dentro dos resolvers, não só no endpoint: se um campo cliente.cpf existe, cada resolver precisa conferir se quem pergunta pode vê-lo. Mensagens de erro não devem vazar detalhes internos. Veja o curso de OWASP.'),
          sl('Quando vale, quando REST basta', 'GraphQL compensa quando há muitos clientes com necessidades diferentes (web, celular, parceiros), dados com muitas relações em formato de grafo e telas que juntam várias fontes. REST costuma bastar para CRUD simples, tem cache HTTP direto (URLs previsíveis), upload e download de arquivos mais simples e menos superfície de abuso. O custo do GraphQL é maior complexidade: cache mais difícil, limites de custo, N+1, mais cuidado com autorização. Escolha pela necessidade real, não pela novidade.')
        ]
      },
      questions: [
        mcq('q1', 'Qual problema o GraphQL ajuda a reduzir, comparado a endpoints REST fixos?', 'c', ['Precisar de autenticação, que o GraphQL dispensa por usar um único endpoint', 'Depender do protocolo HTTP, já que o GraphQL funciona só sobre WebSocket', 'Receber campos demais ou precisar de várias requisições para montar uma tela', 'Armazenar dados em bancos relacionais, pois o GraphQL exige bancos de documentos'], 'O cliente escolhe os campos e pode buscar dados relacionados numa só requisição. Autenticação continua necessária, o GraphQL normalmente roda sobre HTTP e funciona com qualquer banco.'),
        mcq('q2', 'Qual operação do GraphQL deve ser usada para cancelar um pedido?', 'b', ['Uma query', 'Uma mutation', 'Uma introspecção', 'Um resolver executado sem operação'], 'Mutations alteram dados; queries só leem. A introspecção consulta o esquema, e um resolver só roda como parte de uma operação.'),
        mcq('q3', 'Uma listagem de 100 pedidos dispara 101 consultas ao banco (uma para a lista e uma para o cliente de cada pedido). Como o DataLoader ajuda?', 'b', ['Esconde as 100 consultas do log, mas o banco continua executando as 100', 'Agrupa os ids e busca os clientes em uma única consulta, com cache por requisição', 'Troca o banco de dados por um arquivo local que dispensa consultas repetidas', 'Limita a listagem a um pedido por vez, evitando que haja uma lista inteira'], 'O batching transforma N consultas em uma. Esconder logs, trocar o banco ou limitar a um pedido não resolvem o N+1.'),
        fill('q4', 'Complete o nome do tipo raiz do esquema que contém as operações de leitura.', 'type ___ { pedido(id: ID!): Pedido }', ['Query'], 'O tipo Query agrupa as operações de leitura; Mutation agrupa as de escrita.'),
        mcq('q5', 'Um cliente envia uma consulta com aninhamento profundíssimo, que força milhões de operações no servidor. Qual defesa se aplica?', 'a', ['Limitar a profundidade e o custo das consultas e definir timeout', 'Ativar a introspecção para que o cliente veja o custo antes de consultar', 'Remover a autenticação do endpoint, para as consultas serem processadas mais rápido', 'Converter a consulta em REST automaticamente, o que elimina o aninhamento'], 'Limites de profundidade, custo e tempo impedem consultas abusivas. Introspecção não protege, retirar a autenticação piora e não existe conversão automática para REST.'),
        mcq('q6', 'O endpoint /graphql exige login, mas um usuário autenticado consegue ler o cpf de outro usuário pedindo o campo. O que faltou?', 'd', ['Mais um nível de profundidade permitido nas consultas do cliente', 'Habilitar a introspecção para que os clientes conheçam o campo cpf', 'Trocar as mutations por queries para que o campo fique em modo leitura', 'Autorização por campo e por objeto nos resolvers'], 'Estar autenticado não basta: cada resolver precisa verificar se quem pergunta pode ver aquele dado. Mudar profundidade, introspecção ou tipo de operação não implementa permissão.'),
        mcq('q7', 'Em qual situação o REST costuma ser a escolha mais simples?', 'c', ['Um sistema com dezenas de clientes diferentes, cada um pedindo campos distintos', 'Uma API cujas telas juntam dados de muitas fontes relacionadas em formato de grafo', 'Um CRUD pequeno, com poucos clientes e URLs que se beneficiam do cache HTTP', 'Um produto em que o front-end precisa escolher livremente a forma de cada resposta'], 'CRUD simples com cache por URL combina com REST. As demais descrevem os cenários em que o GraphQL compensa.'),
        fill('q8', 'Complete o termo para o agrupamento de buscas por id numa única consulta feito pelo DataLoader.', '// o DataLoader faz ___ (agrupamento) das buscas por id', ['batching', 'batch'], 'Batching reúne as buscas do mesmo ciclo e faz uma única consulta com a lista de ids.')
      ]
    },
    {
      id: 'nji-35-grpc-e-comunicacao-entre-servicos',
      title: 'gRPC e comunicação entre serviços',
      goal: 'Comparar REST e gRPC, entender protobuf, tipos de chamada, timeouts, mTLS e como serviços se encontram.',
      xp: 20,
      intro: {
        slides: [
          sl('REST/JSON x gRPC', 'Quando serviços internos conversam entre si, há duas escolhas comuns. REST com JSON: texto legível, universal, depurável com um navegador ou curl, ótimo para APIs públicas. gRPC: um sistema de chamada de procedimento remoto (RPC, "chamar uma função de outro serviço como se fosse local") sobre HTTP/2, com mensagens em formato binário compacto (Protocol Buffers) e contrato tipado. Em Node, o pacote de terceiros @grpc/grpc-js é o mais citado. Exemplos abaixo são ilustrativos.'),
          sl('Protocol Buffers (protobuf)', 'Protobuf é uma linguagem de definição de contrato: num arquivo .proto você descreve as mensagens e os serviços, e ferramentas geram código nas linguagens dos serviços. Cada campo tem um NÚMERO, e é o número, não o nome, que identifica o campo na mensagem binária. Por isso, para manter a compatibilidade: nunca reutilize nem mude o número de um campo existente; pode-se adicionar campos novos com números novos e os serviços antigos os ignoram.', '// Ilustrativo, não executado aqui (arquivo .proto)\nsyntax = "proto3";\nservice Pedidos { rpc Buscar (BuscarRequest) returns (Pedido); }\nmessage BuscarRequest { string id = 1; }\nmessage Pedido { string id = 1; string item = 2; int32 qtd = 3; }'),
          sl('Tipos de chamada', 'gRPC suporta quatro modelos. Unária: um pedido, uma resposta (o equivalente ao REST comum). Streaming de servidor: um pedido, várias respostas ao longo do tempo (acompanhar um progresso). Streaming de cliente: várias mensagens enviadas, uma resposta no fim (upload em pedaços). Streaming bidirecional: os dois lados enviam fluxos ao mesmo tempo. O HTTP/2 permite multiplexar muitas chamadas numa única conexão. Navegadores não falam gRPC nativamente; para eles se usa gRPC-Web com um proxy, ou simplesmente REST.'),
          sl('Timeouts e resiliência', 'Toda chamada entre serviços precisa de um prazo (no gRPC, o deadline): sem ele, um serviço lento prende threads, conexões e memória de quem o chama, e a lentidão se propaga em cascata. Defina o prazo e o propague nas chamadas seguintes. Repita só chamadas idempotentes e com backoff; evite tempestades de retentativa. Um circuit breaker (disjuntor) deixa de chamar um serviço que está falhando por um tempo, em vez de insistir. No HTTP, o equivalente nativo do Node é AbortSignal.timeout.', 'const t0 = Date.now();\ntry { await fetch(url, { signal: AbortSignal.timeout(300) }); } // servidor local lento (2 s)\ncatch (e) { console.log(\'erro:\', e.name); }\n// saída real (executado aqui, contra servidor local que demora 2 s):\n// erro: TimeoutError | passou de 250ms? true | menos de 1s? true'),
          sl('mTLS e confiança entre serviços', 'TLS comum autentica só o servidor: o cliente confere o certificado dele. No mTLS (mutual TLS) os DOIS lados apresentam certificados e se autenticam, e o tráfego é criptografado. Isso dá uma identidade a cada serviço e impede que um processo qualquer na rede interna se passe por outro. Não confie na rede interna só por ser interna: assuma que ela pode ser acessada por um invasor (ideia de zero trust). Além de identificar, autorize: o serviço de pedidos pode chamar o de estoque, mas talvez não o de pagamentos. Malhas de serviço (service mesh, como Istio ou Linkerd, por nome) automatizam mTLS e políticas fora do código da aplicação.'),
          sl('Descoberta de serviço (visão geral)', 'Como o serviço A descobre o endereço do serviço B, se as instâncias mudam o tempo todo? Opções: nomes DNS estáveis fornecidos pelo orquestrador (o Kubernetes dá um nome a cada serviço e balanceia entre as instâncias), um registro de serviços (como o Consul, por nome) onde as instâncias se registram, ou a malha de serviço. O balanceamento pode ser feito por um proxy ou pelo próprio cliente. Quanto à escolha de protocolo: gRPC entre serviços internos de alto volume e contrato rígido; REST para APIs públicas e para quem consome pelo navegador. Para o panorama de sistemas distribuídos, veja o curso de Computação Distribuída.')
        ]
      },
      questions: [
        mcq('q1', 'Qual conjunto descreve o gRPC?', 'c', ['Troca de documentos de texto XML por e-mail entre serviços, sem contrato formal nem formato definido', 'Um banco de dados distribuído que replica tabelas entre os serviços da empresa', 'Chamada de procedimento remoto sobre HTTP/2, com mensagens binárias definidas em protobuf', 'Um protocolo que funciona dentro do navegador, entre abas do mesmo site'], 'gRPC combina RPC, HTTP/2 e protobuf. Não envolve XML por e-mail, não é banco de dados e não se restringe ao navegador.'),
        mcq('q2', 'Para manter a compatibilidade de um .proto, o que se deve evitar?', 'b', ['Adicionar um novo campo com um número ainda não usado', 'Reutilizar ou mudar o número de um campo existente', 'Documentar as mensagens com comentários no arquivo', 'Gerar o código dos clientes novamente depois de uma alteração'], 'O número identifica o campo no formato binário; reaproveitá-lo faz serviços antigos interpretarem dados de forma errada. Campos novos com números novos, comentários e regeração de código são seguros.'),
        mcq('q3', 'Qual o risco de chamar outro serviço sem nenhum timeout?', 'a', ['Um serviço lento prende conexões e memória de quem chama, propagando a lentidão em cascata', 'A chamada deixa de ser criptografada, pois o timeout é parte do protocolo TLS', 'O serviço chamado passa a recusar as outras chamadas por tempo indefinido', 'O contrato protobuf é alterado automaticamente quando a resposta demora demais'], 'Sem prazo, as requisições ficam penduradas e esgotam recursos. Timeout não faz parte da criptografia, não bloqueia o serviço chamado e não altera contratos.'),
        fill('q4', 'Complete a versão do HTTP sobre a qual o gRPC trabalha.', '// o gRPC usa HTTP/___', ['2'], 'O gRPC é construído sobre HTTP/2, o que permite multiplexação e streaming.'),
        mcq('q5', 'O que diferencia o mTLS do TLS comum?', 'd', ['Só o cliente apresenta certificado, e o servidor fica anônimo na conexão', 'A criptografia é desligada para acelerar a comunicação entre serviços internos', 'O certificado é substituído por uma senha compartilhada guardada no código', 'Os dois lados apresentam certificados e se autenticam mutuamente'], 'Em mTLS há autenticação mútua por certificados, dando identidade aos serviços. As demais descrições invertem o mecanismo, desligam a criptografia ou trocam certificados por senha fixa.'),
        mcq('q6', 'Uma API pública será consumida por navegadores e por parceiros externos com ferramentas variadas. Qual escolha costuma ser mais simples?', 'd', ['gRPC puro, pois os navegadores o suportam nativamente nas versões atuais', 'Streaming bidirecional gRPC, que dispensa a definição de contrato', 'Protobuf sem esquema, escolhido para que o contrato fique mais flexível', 'REST com JSON, que é universal e funciona direto no navegador'], 'REST/JSON é o formato mais universal para APIs públicas. Navegadores não falam gRPC nativamente (exigem gRPC-Web e proxy), e protobuf depende de contrato.'),
        mcq('q7', 'Quando é seguro repetir automaticamente uma chamada que deu timeout?', 'c', ['A cada erro, imediatamente e sem limite de tentativas', 'Quando a operação for um pagamento, para garantir a cobrança', 'Quando a operação é idempotente, usando backoff entre as tentativas', 'Em momento algum, porque retentativas são proibidas pelo protocolo HTTP/2'], 'Repetir uma operação idempotente não duplica efeitos; backoff evita sobrecarga. Retentativas sem limite criam tempestades, repetir um pagamento sem chave de idempotência pode cobrar duas vezes, e o HTTP/2 não proíbe retentativas.'),
        fill('q8', 'Complete o método do Node que cria um sinal que aborta a requisição após um prazo.', 'await fetch(url, { signal: AbortSignal.___(300) });', ['timeout'], 'AbortSignal.timeout(ms) gera um sinal que aborta a operação com TimeoutError após o prazo.')
      ]
    },
    {
      id: 'nji-36-validacao-com-schemas-zod',
      title: 'Validação com schemas e Zod',
      goal: 'Tratar schemas como fonte da verdade, validar entradas e configuração em tempo de execução e devolver erros úteis sem vazar dados.',
      xp: 20,
      intro: {
        slides: [
          sl('Por que validar em tempo de execução', 'TypeScript confere tipos na compilação, mas some depois: em tempo de execução, o JSON de uma requisição, uma variável de ambiente ou a resposta de outra API chegam como dados desconhecidos, não importa o que a interface prometa. Validar na fronteira do sistema (onde o dado entra) garante que o resto do código receba só dados no formato esperado. Validação é também defesa de segurança: barra campos inesperados, tamanhos absurdos e tipos trocados.'),
          sl('Schema como fonte da verdade', 'Schema é a descrição das regras de um dado: campos, tipos, obrigatoriedade, limites. Zod (pacote de terceiros) permite escrever o schema em código TypeScript e INFERIR o tipo a partir dele (z.infer), então você não mantém interface e regra de validação separadas. Há alternativas (Valibot, Joi, Ajv com JSON Schema). Trechos de Zod abaixo são ilustrativos.', '// Ilustrativo, não executado aqui (Zod)\nimport { z } from \'zod\';\nconst NovoPedido = z.object({\n  item: z.string().trim().min(2).max(100),\n  qtd: z.coerce.number().int().min(1).max(100)\n}).strict();\ntype NovoPedido = z.infer<typeof NovoPedido>;'),
          sl('parse x safeParse', 'parse devolve o dado validado ou LANÇA uma exceção. safeParse nunca lança: devolve { success: true, data } ou { success: false, error }. Em handlers HTTP, safeParse costuma ser mais claro: se falhou, responda 400. Para mostrar o mecanismo com módulos nativos, o mini-validador abaixo imita a ideia (não é o Zod): cada campo tem uma regra, e o resultado traz os dados limpos ou os erros por campo.', 'const Pedido = esquema({ item: campo.texto(2), qtd: campo.inteiro(1) });\nconsole.log(Pedido.safeParse({ item: \' caneta \', qtd: \'3\', admin: true }));\nconsole.log(Pedido.safeParse({ item: \'x\', qtd: 0 }));\n// saída real (executado aqui, mini-validador sem pacotes):\n// { success: true, data: { item: \'caneta\', qtd: 3 } }\n// { success: false, erros: { item: \'texto com no minimo 2 caracteres\', qtd: \'inteiro >= 1\' } }\n// repare: o campo extra "admin" foi descartado e o texto, limpo'),
          sl('Coerção e transformação', 'Dados de query string e de formulário chegam sempre como texto: "3" em vez de 3. Coerção é converter para o tipo certo antes de validar (z.coerce.number()). Faça-a de forma explícita e limite o resultado: em JavaScript, Number("") dá 0, e um campo vazio viraria zero sem aviso, então valide depois de coagir (inteiro, mínimo, máximo). Transformações úteis: trim para tirar espaços, lowercase para e-mails. Defina também tamanhos máximos de textos e listas, para impedir entradas gigantes.'),
          sl('Erros formatados sem vazar dados', 'Quando a validação falha, devolva ao cliente uma lista clara: qual campo e qual regra ("qtd: inteiro de 1 a 100"), em formato consistente (existe um padrão chamado Problem Details, RFC 9457, que define o formato). Não devolva mensagens internas, caminhos de arquivos nem o valor recebido em campos sensíveis (senha, documento): o erro pode acabar em logs e telas. Responda 400 (ou 422 se o seu padrão distinguir erros de significado) e registre no log só o necessário.'),
          sl('Validar entrada E configuração', 'As variáveis de ambiente também são entrada externa: PORT="abc", segredo ausente ou URL de banco errada. Valide a configuração UMA vez, na inicialização (falhar cedo, o fail-fast): se algo está errado, o processo avisa e não sobe, em vez de falhar só quando a primeira requisição precisar do valor. Decida a política para campos extras: strict (rejeitar), strip (descartar em silêncio) ou passthrough (manter, em geral uma má ideia por causa do mass assignment, quando um campo como admin chega e é gravado sem querer). Valide também respostas de APIs de terceiros antes de confiar nelas.')
        ]
      },
      questions: [
        mcq('q1', 'Por que o TypeScript sozinho não basta para validar o corpo de uma requisição?', 'b', ['O TypeScript proíbe objetos JSON, que não são suportados pela linguagem', 'Os tipos só existem na compilação; em execução, o JSON recebido pode ter qualquer formato', 'O TypeScript valida o corpo, mas só quando a aplicação roda em modo de depuração', 'Os tipos do TypeScript são apagados quando o código usa Express ou Fastify'], 'Tipos desaparecem ao compilar, e o dado externo não é garantido por eles. O TypeScript aceita JSON, não depende do modo de depuração nem do framework usado.'),
        mcq('q2', 'O que o safeParse devolve quando a validação falha?', 'a', ['Um objeto com success: false e os detalhes do erro, sem lançar exceção', 'Uma exceção que interrompe a função e derruba o processo inteiro', 'O dado original, sem alteração, como se a validação tivesse passado', 'Um valor undefined, sem informação sobre quais campos falharam'], 'safeParse devolve um resultado com success e o erro; o que lança exceção é o parse. Ele não devolve o dado original nem esconde os campos inválidos.'),
        mcq('q3', 'Qual a vantagem de inferir o tipo TypeScript a partir do schema?', 'a', ['Regra de validação e tipo ficam numa só definição, sem divergir', 'O schema deixa de ser verificado em tempo de execução, o que acelera a validação', 'O TypeScript passa a aceitar qualquer valor, o que dispensa conversões de tipo', 'O tipo inferido substitui a necessidade de testar os casos de borda'], 'A fonte única evita duplicação e divergência entre tipo e validação. A validação continua em execução, os tipos continuam restritivos e os testes continuam necessários.'),
        fill('q4', 'Complete o método que valida sem lançar exceção.', 'const resultado = NovoPedido.___(req.body);', ['safeParse'], 'safeParse devolve { success, data/error } em vez de lançar, o que facilita responder 400.'),
        mcq('q5', 'Por que cuidar da coerção de campos que vêm da query string?', 'd', ['Porque a query string aceita números, não textos', 'Porque coerção é proibida pela especificação do HTTP em requisições GET, conforme as boas práticas de REST', 'Porque o navegador converte os campos automaticamente antes do envio', 'Eles chegam como texto, e uma conversão frouxa pode transformar vazio em zero sem aviso'], 'Texto precisa ser convertido, e Number("") dá 0, daí a necessidade de validar o resultado. A query string aceita texto, HTTP não proíbe coerção no servidor e o navegador não tipa os campos.'),
        mcq('q6', 'A API recebe { "item": "caneta", "qtd": 2, "admin": true } e grava o objeto todo no banco. Que falha de validação ocorreu e como corrigir?', 'c', ['Aceitou texto no item; trocar o tipo do campo para número nas rotas do projeto', 'Gravou a quantidade; remover o campo qtd do schema para evitar isso', 'Aceitou campo extra (mass assignment); usar schema estrito ou descartar campos não declarados', 'Retornou 400; trocar o status por 200 para que o cliente não repita o envio com o mesmo corpo inalterado'], 'O problema é o campo admin, não declarado, ter sido aceito; schema estrito ou strip resolve. Item é texto por natureza, qtd é legítima e o status 400 seria a reação correta a dados inválidos.'),
        mcq('q7', 'Por que validar a configuração (variáveis de ambiente) logo ao iniciar o processo?', 'b', ['Para descobrir a senha do banco e exibi-la no log de inicialização', 'Para falhar cedo, antes de atender requisições, se algo estiver ausente ou inválido', 'Para que o processo não precise mais de variáveis de ambiente depois disso', 'Para que as variáveis passem a poder ser alteradas livremente por qualquer requisição'], 'O fail-fast evita descobrir a falha de configuração só em plena operação. Exibir senhas em logs é erro, e a validação não elimina nem libera alteração das variáveis.'),
        fill('q8', 'Complete o utilitário do Zod que extrai o tipo TypeScript de um schema.', 'type NovoPedido = z.___<typeof NovoPedidoSchema>;', ['infer'], 'z.infer calcula o tipo estático a partir do schema.')
      ]
    },
    {
      id: 'nji-37-configuracao-por-ambiente-e-segredos',
      title: 'Configuração por ambiente e segredos',
      goal: 'Separar configuração de código, organizar a hierarquia dev/test/prod, guardar segredos fora do repositório e evitar vazamentos por logs e imagens.',
      xp: 20,
      intro: {
        slides: [
          sl('Config no ambiente, não no código', 'A mesma versão do código roda em ambientes diferentes: desenvolvimento (seu computador), teste (CI) e produção. O que muda entre eles (endereço do banco, chaves, nível de log, URLs) é configuração e deve ficar FORA do código, geralmente em variáveis de ambiente (process.env). É um dos princípios do "12-factor app". Assim o mesmo artefato (o mesmo build) é promovido de um ambiente para o outro, sem recompilar e sem editar código.'),
          sl('Hierarquia de configuração', 'Costuma-se compor a configuração em camadas, da mais fraca à mais forte: valores padrão no código (seguros e sem segredos), arquivo de configuração do ambiente, variáveis de ambiente e, por fim, argumentos de linha de comando. A camada mais forte vence. Para desenvolvimento local, um arquivo .env guarda variáveis; ele NUNCA vai para o Git (entra no .gitignore). Em seu lugar versione um .env.example com placeholders (<SEGREDO>). Em versões recentes o Node consegue carregar um arquivo de ambiente com a opção --env-file; confira a documentação da versão em uso.'),
          sl('Config tipada, validada e imutável', 'Carregue a configuração uma vez, converta os tipos (PORT vira número), valide e congele o objeto (Object.freeze) para não ser alterado por engano. Se algo faltar, falhe ao iniciar, listando todos os erros de uma vez. Ao imprimir a config para diagnóstico, mascare os segredos.', 'function carregarConfig(env) {\n  const erros = [];\n  const exigir = (nome) => { if (!env[nome]) erros.push(nome + \' ausente\'); return env[nome]; };\n  const config = {\n    ambiente: env.NODE_ENV || \'development\',\n    porta: Number(env.PORT || 3000),\n    urlBanco: exigir(\'DATABASE_URL\'),\n    segredoJwt: exigir(\'JWT_SECRET\')\n  };\n  if (!Number.isInteger(config.porta) || config.porta < 1 || config.porta > 65535) erros.push(\'PORT invalida\');\n  if (erros.length) throw new Error(\'Configuracao invalida: \' + erros.join(\'; \'));\n  return Object.freeze(config);\n}\n// saída real (executado aqui, com PORT=99999 e sem os segredos):\n// Configuracao invalida: DATABASE_URL ausente; JWT_SECRET ausente; PORT invalida\n// e, com valores válidos de teste (placeholders), config mascarada:\n// { ambiente: \'test\', porta: 3000, urlBanco: \'[oculto]\', segredoJwt: \'[oculto]\' }'),
          sl('Onde guardar segredos', 'Segredo é qualquer valor que dá acesso: senha de banco, chave de API, chave de assinatura de JWT. O repositório não é lugar para eles, nem em arquivos "privados", pois o histórico do Git guarda tudo para sempre e muitas pessoas o clonam. Opções: cofres de segredos (HashiCorp Vault, AWS Secrets Manager, Azure Key Vault, Google Secret Manager, por nome), ou o mecanismo de segredos do orquestrador. Atenção: um Secret do Kubernetes, por padrão, é só codificado em base64, o que NÃO é criptografia; proteja com controle de acesso e criptografia em repouso. Use um segredo diferente por ambiente e dê a cada serviço só os segredos de que precisa (menor privilégio).'),
          sl('Rotação e vazamento', 'Rotação é trocar o segredo periodicamente e sempre que houver suspeita de vazamento. Para trocar sem derrubar o sistema, aceite DUAS chaves válidas durante a transição (a nova e a antiga) e retire a antiga depois. Se um segredo foi parar no Git, apagar o commit NÃO basta: ele pode ter sido clonado ou copiado. O procedimento correto é revogar e gerar um novo imediatamente, depois limpar o histórico se necessário. Ferramentas de varredura de segredos (como o gitleaks, por nome) no pre-commit e no CI ajudam a pegar o erro antes de ir para o repositório.'),
          sl('Vazamento por logs e imagens', 'Segredos escapam por caminhos que passam despercebidos: logar a configuração completa ou o objeto process.env na inicialização; endpoints de depuração que listam variáveis; mensagens de erro com a string de conexão. E por imagens de contêiner: uma instrução ENV ou ARG com um segredo no Dockerfile fica gravada nas camadas da imagem e aparece em docker history, mesmo se depois apagada; use segredos em tempo de execução ou os mecanismos de segredo de build do BuildKit. Veja o curso de Containers para os detalhes. Mantenha os segredos fora de logs, de imagens e de mensagens de erro.')
        ]
      },
      questions: [
        mcq('q1', 'Por que a configuração que muda entre ambientes deve ficar fora do código?', 'b', ['Para que cada ambiente execute uma versão diferente do código-fonte', 'Para o mesmo build ser promovido de dev para produção sem editar o código', 'Para que a configuração possa ser publicada no repositório com segurança', 'Para que a aplicação deixe de precisar de variáveis de ambiente em produção'], 'Separar config de código permite usar o mesmo artefato em todos os ambientes. Não se trata de versões diferentes do código, e segredos continuam fora do repositório.'),
        mcq('q2', 'O que fazer com o arquivo .env usado no desenvolvimento local?', 'a', ['Colocá-lo no .gitignore e versionar só um .env.example com placeholders', 'Commitar o arquivo, desde que o repositório seja privado e o time pequeno', 'Copiá-lo para dentro da imagem de produção, para o ambiente ficar idêntico', 'Enviá-lo por e-mail para os novos colegas, assim a equipe usa as mesmas chaves'], 'Segredos não vão para o repositório; o .env.example documenta quais variáveis existem. Repositório privado não elimina o risco, e imagens e e-mails também espalham o segredo.'),
        mcq('q3', 'Uma chave de API foi commitada por engano e a pessoa apagou o commit em seguida. O que ainda precisa ser feito?', 'd', ['Nada, porque apagar o commit faz o valor desaparecer de todo lugar', 'Avisar o time, mantendo a chave atual em uso até o próximo mês', 'Renomear o arquivo que continha a chave, deixando o histórico como está e confiando que ninguém o leia', 'Revogar a chave e gerar outra, porque o valor pode já ter sido copiado ou clonado'], 'Quem clonou ou viu o histórico pode ter o segredo; só a revogação o invalida. Apagar o commit, esperar ou renomear não resolvem a exposição.'),
        fill('q4', 'Complete o objeto do Node que expõe as variáveis de ambiente do processo.', 'const segredo = process.___.JWT_SECRET;', ['env'], 'process.env é o objeto com as variáveis de ambiente do processo.'),
        mcq('q5', 'Por que um Secret do Kubernetes, em base64, não deve ser considerado criptografado?', 'c', ['Base64 usa uma chave de 256 bits compartilhada entre os nós do cluster', 'Base64 só funciona dentro dos contêineres e some quando o pod reinicia', 'Base64 é só uma codificação reversível por qualquer pessoa, sem chave', 'Base64 é um hash, então não pode ser revertido nem mesmo pelo administrador'], 'Qualquer um decodifica base64 sem segredo algum; é formato, não proteção. As outras descrições atribuem a ele propriedades de criptografia ou de hash que não tem.'),
        mcq('q6', 'Um Dockerfile contém ENV DB_PASSWORD=<SENHA> e depois um comando que apaga o arquivo de configuração. O segredo está seguro?', 'c', ['Sim, porque o Docker criptografa as variáveis definidas com ENV automaticamente', 'Sim, porque apagar o arquivo de configuração remove também a variável de ambiente', 'Não, o valor fica nas camadas da imagem e pode ser lido por quem a obtiver', 'Sim, desde que a imagem tenha uma tag diferente de latest ao ser publicada'], 'ENV é gravado nos metadados e camadas da imagem e aparece em docker history. O Docker não criptografa, apagar arquivo não remove a variável e a tag não muda o conteúdo.'),
        mcq('q7', 'Como trocar uma chave de assinatura sem invalidar de uma só vez todas as sessões ativas?', 'b', ['Trocar a chave sem aviso e pedir aos usuários que façam login novamente', 'Aceitar a chave nova e a antiga por um período e depois retirar a antiga', 'Manter a chave antiga por prazo indeterminado e adicionar uma segunda por cima', 'Gravar a nova chave no código-fonte, para os servidores a receberem juntos'], 'Dois segredos válidos durante a transição evitam interrupção. Trocar de uma vez desloga todos, manter a antiga para sempre anula a rotação e gravar no código viola a regra de segredos fora do repositório.'),
        fill('q8', 'Complete o princípio de falhar logo ao detectar configuração inválida: fail-___.', '// configuração inválida: o processo não sobe (fail-___)', ['fast'], 'Fail-fast significa falhar cedo e de forma visível, em vez de descobrir o erro só durante a operação.')
      ]
    },
    {
      id: 'nji-38-docker-para-node',
      title: 'Docker para Node',
      goal: 'Montar um Dockerfile de produção para uma aplicação Node: multi-stage, usuário não-root, cache de dependências, healthcheck e tratamento correto de sinais.',
      xp: 20,
      intro: {
        slides: [
          sl('Por que contêiner para uma aplicação Node', 'Um contêiner empacota a aplicação com suas dependências e o runtime do Node, de modo que ela rode igual no seu computador, no CI e em produção. Imagem é o pacote (somente leitura, feita em camadas); contêiner é uma imagem em execução. Este slide é só o contexto: o curso de Containers (Docker) cobre os fundamentos. Aqui o foco é o que é específico de uma aplicação Node em produção. Os trechos de Dockerfile são ilustrativos, não executados aqui.'),
          sl('Dockerfile de produção, multi-stage', 'Multi-stage usa mais de um FROM: o primeiro estágio instala tudo e compila (inclusive devDependencies e TypeScript); o segundo parte de uma imagem limpa e copia só o resultado e as dependências de produção. A imagem final fica menor e sem ferramentas de build que ampliam a superfície de ataque. Use uma imagem oficial do Node enxuta, com tag de versão fixa (a que a sua equipe validou), nunca "latest".', '# Ilustrativo, não executado aqui\nFROM node:<LTS>-slim AS build\nWORKDIR /app\nCOPY package.json package-lock.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM node:<LTS>-slim\nENV NODE_ENV=production\nWORKDIR /app\nCOPY package.json package-lock.json ./\nRUN npm ci --omit=dev\nCOPY --from=build /app/dist ./dist\nUSER node\nEXPOSE 3000\nCMD ["node", "dist/server.js"]'),
          sl('Cache de camadas e .dockerignore', 'Cada instrução do Dockerfile gera uma camada que o Docker reaproveita (cache) enquanto o que entra nela não mudar. Por isso copiamos package.json e package-lock.json ANTES do código-fonte: o npm ci só roda de novo quando as dependências mudam, não a cada alteração de código. O arquivo .dockerignore lista o que não deve ir para o contexto de build: node_modules (será instalado dentro), .git, arquivos .env, logs e testes. Isso acelera o build e evita que segredos entrem na imagem.'),
          sl('Segurança da imagem', 'Rode como usuário sem privilégios (USER node): se alguém explorar uma falha na aplicação, não será root dentro do contêiner. Não coloque segredos em ENV, ARG ou arquivos copiados: eles ficam nas camadas. Prefira imagens enxutas, fixe versões, atualize a base com frequência e varra a imagem em busca de vulnerabilidades conhecidas (ferramentas como Trivy, por nome). Quando possível, monte o sistema de arquivos como somente leitura e remova capacidades desnecessárias. Veja o curso de Containers.'),
          sl('Healthcheck', 'O HEALTHCHECK do Dockerfile (ou as sondas do orquestrador) chama periodicamente um endpoint leve da aplicação, como /saude, para saber se o contêiner está funcionando. Se a verificação falha repetidas vezes, o contêiner é marcado como não saudável e o orquestrador pode reiniciá-lo. Na lição de observabilidade vimos a diferença entre liveness (está vivo?) e readiness (pode receber tráfego?). Mantenha o endpoint simples e sem expor detalhes internos.'),
          sl('Sinais e PID 1', 'Quando você manda parar um contêiner, o Docker envia o sinal SIGTERM ao processo principal e, se ele não sair em alguns segundos, envia SIGKILL (morte imediata, sem limpeza). O processo principal de um contêiner é o PID 1, e no Linux o PID 1 não recebe o tratamento padrão de sinais: sem um handler, o Node pode ignorar o SIGTERM. Por isso: (1) use a forma exec do CMD (lista JSON, como acima), para o node ser o PID 1 em vez de um shell que não repassa sinais; (2) registre um handler de SIGTERM que feche o servidor e as conexões e saia; (3) opcionalmente use um init mínimo (a opção --init do Docker ou o tini, por nome). Ilustrativo, não executado como sinal real aqui:', 'process.on(\'SIGTERM\', () => {\n  console.log(\'SIGTERM recebido: parando de aceitar conexoes\');\n  servidor.close(() => {\n    console.log(\'conexoes encerradas, saindo com codigo 0\');\n    process.exit(0);\n  });\n});')
        ]
      },
      questions: [
        mcq('q1', 'Qual o benefício do build multi-stage para uma aplicação Node?', 'a', ['A imagem final contém só o necessário para executar, sem ferramentas de build', 'O build passa a rodar em paralelo em vários servidores sem configuração', 'As devDependencies são instaladas na imagem de produção para facilitar a depuração', 'O código-fonte é criptografado dentro da imagem para impedir que seja lido'], 'O estágio final parte de uma imagem limpa e copia só o resultado, reduzindo tamanho e superfície de ataque. Multi-stage não paraleliza servidores, não deve levar devDependencies à produção e não criptografa o código.'),
        mcq('q2', 'Por que o Dockerfile copia package.json e package-lock.json antes do restante do código?', 'd', ['Para impedir que o código-fonte seja copiado para dentro da imagem final', 'Para que o Node leia as dependências antes de ler a variável NODE_ENV', 'Para que o package.json seja executado como se fosse um script de inicialização', 'Para reaproveitar o cache da camada do npm ci enquanto as dependências não mudarem'], 'Se só o código mudou, a camada de dependências continua em cache e o build é mais rápido. O código é copiado depois, a ordem não afeta NODE_ENV e package.json não é executado.'),
        mcq('q3', 'Qual o ganho de colocar USER node no Dockerfile?', 'd', ['A aplicação passa a poder escutar na porta 80 sem configuração extra', 'A imagem fica menor, porque os arquivos do root são removidos dela', 'As variáveis de ambiente passam a ser criptografadas dentro do contêiner', 'Uma falha explorada na aplicação não dá privilégios de root no contêiner'], 'Executar sem privilégios reduz o impacto de uma invasão. Não libera portas baixas, não reduz a imagem nem criptografa variáveis.'),
        fill('q4', 'Complete o comando que instala exatamente o que o lockfile descreve, sem devDependencies, na imagem final.', 'RUN npm ___ --omit=dev', ['ci'], 'npm ci instala de forma reprodutível a partir do package-lock.json; --omit=dev dispensa as dependências de desenvolvimento.'),
        mcq('q5', 'Por que incluir .env e .git no .dockerignore?', 'c', ['Para que o Docker consiga localizar esses arquivos mais rápido durante o build', 'Para que o Node deixe de carregar as variáveis de ambiente do sistema operacional', 'Para segredos e histórico não entrarem no contexto de build nem nas camadas da imagem', 'Para que o healthcheck passe a funcionar dentro do contêiner em produção'], 'O que entra no contexto pode ser copiado para uma camada e vazar. Não é questão de velocidade de busca, não afeta as variáveis do sistema e não tem relação com o healthcheck.'),
        mcq('q6', 'O docker stop demora dez segundos e termina matando a aplicação à força. Qual a causa e a correção prováveis?', 'b', ['O contêiner usa imagem slim; trocar por uma imagem sem a palavra slim resolve', 'A aplicação ignora o SIGTERM; usar CMD em forma exec e registrar um handler de SIGTERM', 'A porta 3000 está exposta; remover a instrução EXPOSE faz o contêiner parar logo', 'O lockfile está desatualizado; rodar npm install antes do stop resolve o problema'], 'Sem handler, o PID 1 pode ignorar o SIGTERM e o Docker recorre ao SIGKILL após o prazo. Imagem slim, EXPOSE e lockfile não têm relação com o encerramento.'),
        mcq('q7', 'Para que serve um HEALTHCHECK no contêiner?', 'a', ['Verificar periodicamente se a aplicação responde, para o orquestrador reagir às falhas', 'Reduzir o tamanho da imagem removendo arquivos que não são usados', 'Criptografar o tráfego entre o contêiner e o banco de dados', 'Gerar automaticamente testes para as rotas da aplicação durante o build e publicá-los no repositório'], 'O healthcheck sonda a aplicação e informa seu estado ao orquestrador. Não reduz imagens, não criptografa tráfego e não gera testes.'),
        fill('q8', 'Complete o sinal que o Docker envia primeiro ao pedir que o contêiner pare.', 'process.on(\'___\', encerrarComGraca);', ['SIGTERM'], 'SIGTERM pede o encerramento ordenado; só depois do prazo o Docker envia SIGKILL.')
      ]
    },
    {
      id: 'nji-39-ci-cd-para-node',
      title: 'CI/CD para Node',
      goal: 'Montar um pipeline de integração e entrega contínuas com lint, testes, build, audit, npm ci e segredos de CI bem tratados.',
      xp: 20,
      intro: {
        slides: [
          sl('CI, entrega e implantação contínuas', 'CI (integração contínua) é rodar automaticamente, a cada alteração enviada ao repositório, a instalação, a verificação de código e os testes, para descobrir problemas cedo. CD pode significar entrega contínua (o artefato fica sempre pronto para ir a produção, com aprovação manual) ou implantação contínua (vai a produção sozinho quando tudo passa). Plataformas (GitHub Actions, GitLab CI, Jenkins, por nome) executam o pipeline descrito em um arquivo versionado no repositório.'),
          sl('Etapas de um pipeline Node', 'Uma sequência típica: obter o código; instalar dependências com npm ci; lint (análise estática de estilo e erros); verificação de tipos, se usar TypeScript; testes unitários e de integração; build; auditoria de dependências; construção e publicação da imagem. Ordene do mais barato e rápido para o mais caro, e falhe rápido: se o lint falha, nem rode os testes lentos. Cada etapa deve devolver código de saída diferente de zero ao falhar. Ilustrativo (GitHub Actions), não executado aqui:', 'name: ci\non: [pull_request]\njobs:\n  verificar:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@<versao-fixada>\n      - uses: actions/setup-node@<versao-fixada>\n        with: { node-version: <LTS>, cache: npm }\n      - run: npm ci\n      - run: npm run lint\n      - run: npm test\n      - run: npm run build\n      - run: npm audit --audit-level=high'),
          sl('npm ci x npm install, e cache', 'npm install resolve versões e pode alterar o package-lock.json. npm ci é o comando para CI: instala exatamente o que o lockfile descreve, FALHA se package.json e lockfile divergirem, e começa do zero (apaga node_modules). O resultado é reprodutível: mesma entrada, mesmas versões. Para acelerar, faça cache do diretório de cache de downloads do npm (a setup-node faz isso), e não da pasta node_modules, que pode ficar inconsistente entre versões do Node.'),
          sl('Ambientes e promoção', 'Pipelines costumam ter ambientes: desenvolvimento, homologação (staging, o mais parecido possível com produção) e produção. A boa prática é construir o artefato UMA vez (uma imagem com um identificador) e promover a mesma imagem de ambiente em ambiente, mudando só a configuração. Produção pode exigir aprovação manual. Tenha um caminho de rollback (voltar para a versão anterior) testado, e cuidado com migrations de banco: elas precisam ser compatíveis com a versão atual e a anterior do código, para o rollback ser possível.'),
          sl('Segredos no CI', 'O pipeline precisa de credenciais (publicar a imagem, implantar). Guarde-as no cofre de segredos da própria plataforma, por ambiente, e jamais no repositório. Plataformas mascaram os valores nos logs, mas mascaramento falha com valores transformados (base64 etc.): nunca imprima segredos. Dê a cada pipeline o mínimo de permissão. Quando houver suporte, prefira credenciais de curta duração obtidas por federação de identidade (OIDC) em vez de chaves de longa duração. Pull requests de forks de terceiros não devem receber segredos, e as ações de terceiros devem ser fixadas por versão ou hash.'),
          sl('Segurança e qualidade no pipeline', 'Inclua: npm audit (dependências vulneráveis conhecidas), varredura de segredos no código, análise estática de segurança (SAST) e varredura da imagem. Proteja a branch principal: exija pull request, revisão e pipeline verde antes do merge, e proíba push direto. Falhas de segurança de severidade alta devem bloquear; as demais, gerar tarefas. Mantenha o pipeline rápido (minutos, não horas), pois pipeline lento incentiva a contorná-lo.')
        ]
      },
      questions: [
        mcq('q1', 'O que é integração contínua (CI)?', 'a', ['Executar automaticamente instalação, verificações e testes a cada alteração enviada ao repositório', 'Enviar para produção, de madrugada, as alterações acumuladas durante a semana após aprovação do gerente', 'Manter um servidor ligado 24 horas que responde às requisições dos usuários finais', 'Copiar manualmente o código entre os ambientes de desenvolvimento e homologação'], 'CI automatiza a verificação a cada mudança, descobrindo problemas cedo. Deploy semanal, servidor ligado e cópia manual não descrevem CI.'),
        mcq('q2', 'Qual a diferença entre npm ci e npm install no pipeline?', 'd', ['O npm ci é mais lento, porque atualiza as dependências para a última versão', 'O npm ci mantém os pacotes antigos em node_modules, preservando os arquivos', 'O npm ci só instala as devDependencies e ignora as dependências de produção', 'O npm ci instala exatamente o lockfile e falha se ele divergir do package.json'], 'O npm ci é reprodutível e estrito. Ele não atualiza versões, apaga node_modules antes de instalar e instala todas as dependências, salvo se instruído com --omit=dev.'),
        mcq('q3', 'Por que colocar lint e testes unitários antes da construção da imagem e dos testes lentos?', 'c', ['Porque a ordem das etapas muda o resultado dos testes unitários', 'Porque o lint precisa gerar o lockfile para os testes poderem usar', 'Para falhar rápido: etapas baratas barram o erro antes de gastar tempo com as caras', 'Porque a imagem só pode ser construída depois de o pipeline ser aprovado por e-mail'], 'Feedback rápido economiza tempo e recursos. A ordem não altera resultados de testes, o lint não gera lockfile e a aprovação por e-mail não faz parte do pipeline.'),
        fill('q4', 'Complete o comando que consulta vulnerabilidades conhecidas nas dependências do projeto.', '- run: npm ___ --audit-level=high', ['audit'], 'npm audit consulta advisories para as versões do lockfile; o nível define a partir de qual severidade falhar.'),
        mcq('q5', 'Um pull request vindo de um fork de terceiros dispara o pipeline. O que fazer com os segredos?', 'b', ['Entregá-los, já que o PR só roda testes e nada além disso', 'Não entregá-los a esse pipeline, pois o código do PR pode vazá-los nos logs', 'Entregá-los e depois apagar o histórico do pipeline no dia seguinte', 'Entregá-los criptografados em base64 para ninguém conseguir lê-los'], 'Código de terceiros executa no pipeline e poderia exfiltrar segredos. Apagar histórico depois não desfaz o vazamento e base64 é só codificação.'),
        mcq('q6', 'Qual a vantagem de construir a imagem uma só vez e promover a mesma imagem entre ambientes?', 'b', ['Cada ambiente passa a ter código diferente, ajustado às suas necessidades', 'O que foi testado em homologação é exatamente o que vai para produção, mudando só a configuração', 'A imagem deixa de precisar de versão, porque a etiqueta latest basta', 'O banco de dados é migrado automaticamente nos ambientes ao mesmo tempo sem verificação'], 'Promover o mesmo artefato elimina diferenças entre o testado e o implantado. Código distinto por ambiente, ausência de versão e migração automática simultânea não são vantagens.'),
        mcq('q7', 'O pipeline imprimiu por engano o valor de um token no log. O que fazer?', 'a', ['Tratar como vazado: revogar o token, gerar outro e corrigir o pipeline', 'Nada, porque a plataforma mascara automaticamente qualquer valor secreto', 'Reiniciar o pipeline, o que apaga os logs anteriores', 'Trocar a cor do texto no log, para que ninguém perceba o valor'], 'Logs são lidos por muita gente e podem ser copiados; a única resposta segura é revogar e substituir. O mascaramento falha em valores transformados e reiniciar não garante apagar logs.'),
        fill('q8', 'Complete a sigla de "integração contínua".', '# ___: roda instalação, lint e testes a cada alteração', ['CI'], 'CI é a sigla de continuous integration.')
      ]
    },
    {
      id: 'nji-40-deploy-pm2-nginx-e-nuvem',
      title: 'Deploy: PM2, Nginx e nuvem',
      goal: 'Entender as formas de executar uma aplicação Node em produção: PM2 e systemd, proxy reverso com Nginx, TLS e uma comparação geral entre PaaS, VM, contêiner e serverless.',
      xp: 20,
      intro: {
        slides: [
          sl('Formas de colocar no ar', 'Há quatro grandes caminhos para executar uma aplicação Node em produção. (1) Um processo numa máquina virtual (VM) gerenciado por PM2 ou systemd. (2) Um contêiner, executado por Docker ou por um orquestrador. (3) PaaS (Platform as a Service): uma plataforma gerenciada que recebe o código ou a imagem e cuida da infraestrutura. (4) Serverless: funções executadas sob demanda, sem servidor para administrar. Cada um troca controle por conveniência de maneira diferente.'),
          sl('PM2 e systemd', 'Um processo Node precisa ser reiniciado se cair, iniciar junto com a máquina e ter logs. PM2 é um gerenciador de processos de terceiros para Node: reinicia automaticamente, pode rodar várias cópias (modo cluster) e junta logs. systemd é o gerenciador de serviços do próprio Linux e faz o mesmo sem pacote extra, descrito por um arquivo de unidade. Em ambos: rode como usuário comum, nunca como root, e passe os segredos por arquivo de ambiente protegido, não pelo repositório. Ilustrativo, não executado aqui:', '# /etc/systemd/system/api.service (ilustrativo)\n[Service]\nUser=api\nWorkingDirectory=/opt/api\nEnvironmentFile=/etc/api/ambiente\nExecStart=/usr/bin/node dist/server.js\nRestart=always\nNoNewPrivileges=true'),
          sl('Proxy reverso com Nginx', 'Proxy reverso é um servidor que fica na frente da aplicação: recebe as requisições da internet e as encaminha para o Node. O Nginx (por nome) é o escolhido por muitas equipes. Vantagens: termina o TLS (cuida do HTTPS), serve arquivos estáticos, aplica limites de tamanho de corpo e de taxa, comprime respostas e permite balancear entre várias instâncias. O Node escuta numa porta alta (como 3000) só em 127.0.0.1, e apenas o Nginx fica exposto nas portas 80 e 443. Como o IP visto pelo Node passa a ser o do Nginx, configure o cabeçalho X-Forwarded-For e a opção "trust proxy" do framework com o endereço do proxy. Veja os cursos de Linux e de Redes.', '# ilustrativo, não executado aqui\nlocation / {\n  proxy_pass http://127.0.0.1:3000;\n  proxy_set_header Host $host;\n  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n  client_max_body_size 1m;\n}'),
          sl('TLS e certificados', 'TLS é o que dá o "S" do HTTPS: criptografa o tráfego e prova a identidade do servidor por meio de um certificado emitido por uma autoridade. Autoridades gratuitas e automatizadas (Let\'s Encrypt, por nome) com clientes como o Certbot emitem e RENOVAM certificados automaticamente; certificado expirado derruba o site. Redirecione todo o HTTP para HTTPS, ative o HSTS (cabeçalho que manda o navegador usar sempre HTTPS) e use apenas versões modernas de TLS. Não deixe a chave privada do certificado em repositório ou em imagem.'),
          sl('PaaS, VM, contêiner ou serverless', 'PaaS: o mais simples de começar; você entrega o código ou a imagem e a plataforma cuida de escala e atualizações; em troca, menos controle. VM: controle total e custo previsível, mas você cuida de sistema operacional, atualizações de segurança, firewall e backups. Contêiner/orquestrador: portabilidade e escala, com mais conceitos para aprender. Serverless: paga-se pelo uso e escala sozinho, bom para cargas irregulares; atenção ao cold start (a primeira chamada demora), aos limites de tempo e de memória por execução e à dificuldade de manter conexões persistentes. Não há resposta única: avalie equipe, tráfego e orçamento. Os preços e limites mudam, então confira a documentação do provedor.'),
          sl('Produção: variáveis, logs e deploy sem parada', 'Defina NODE_ENV=production: várias bibliotecas ativam otimizações e escondem detalhes de depuração nesse modo. Entregue segredos pela plataforma, escreva logs em stdout, exponha health checks e feche tudo que não precisa estar aberto no firewall (só 80 e 443 públicas; a porta do Node e a do banco não). Para atualizar sem derrubar o serviço, use rolling update (trocar instâncias aos poucos) ou blue-green (duas versões, alternando o tráfego), com graceful shutdown (terminar as requisições em andamento antes de sair). Mantenha backups e teste a restauração.')
        ]
      },
      questions: [
        mcq('q1', 'Qual a função do PM2 (ou do systemd) em relação ao processo Node?', 'd', ['Traduzir o código Node para outra linguagem mais rápida antes da execução', 'Garantir que a aplicação não possua falhas de segurança em produção', 'Substituir o banco de dados e guardar os dados dos usuários localmente', 'Reiniciá-lo se cair, iniciá-lo com a máquina e organizar seus logs'], 'Eles supervisionam o processo. Não traduzem código, não garantem segurança e não são banco de dados.'),
        mcq('q2', 'Por que colocar o Nginx na frente do Node, em vez de expor o Node diretamente na porta 80?', 'c', ['O Node não consegue responder a requisições HTTP sem a ajuda de um proxy', 'O Nginx executa o código JavaScript da aplicação com mais velocidade que o Node sob carga alta', 'O Nginx cuida de TLS, limites e estáticos, e o Node roda sem privilégios em porta alta', 'O proxy elimina a necessidade de autenticar e validar as entradas da API'], 'O proxy concentra TLS e proteções e permite que o Node não rode como root nem fique exposto. O Node responde HTTP sozinho, o Nginx não executa JavaScript e validação continua sendo responsabilidade da aplicação.'),
        mcq('q3', 'Atrás do Nginx, todas as requisições parecem vir do IP do próprio proxy no log da aplicação. Qual a correção?', 'c', ['Desativar o proxy reverso e voltar a expor o Node diretamente na porta 80', 'Registrar no log o IP do servidor, pois o cliente real não pode ser conhecido', 'Repassar o X-Forwarded-For e configurar o trust proxy com o endereço do Nginx', 'Mudar o NODE_ENV para development, que mostra o endereço original do cliente'], 'O cabeçalho carrega o IP original, e o framework só deve confiar nele quando vem do proxy conhecido. Desativar o proxy perde suas vantagens, e NODE_ENV não muda esse comportamento.'),
        fill('q4', 'Complete a política de reinício do serviço systemd que o reinicia sempre que o processo terminar.', 'Restart=___', ['always'], 'Restart=always manda o systemd reiniciar o serviço quando ele termina, por falha ou não.'),
        mcq('q5', 'Qual a característica típica do serverless a se considerar ao escolhê-lo?', 'b', ['Obrigação de gerenciar e atualizar o sistema operacional de cada servidor', 'Cold start, limites de tempo por execução e dificuldade com conexões persistentes', 'Custo fixo, independente de quanto a aplicação for utilizada', 'Impossibilidade de escalar quando o tráfego aumenta de forma repentina'], 'Cold start e limites por execução são os trade-offs conhecidos. Serverless dispensa gestão de SO, em geral cobra por uso e escala automaticamente.'),
        mcq('q6', 'Qual o efeito de definir NODE_ENV=production?', 'a', ['Várias bibliotecas ativam otimizações e escondem detalhes de depuração', 'O Node passa a criptografar automaticamente todas as respostas da aplicação', 'O Node deixa de ler variáveis de ambiente, usando o código-fonte', 'A aplicação passa a aceitar requisições de endereços locais'], 'Muitas bibliotecas (Express, por exemplo) se comportam de forma diferente nesse modo. O Node não criptografa respostas, continua lendo variáveis e não restringe origens.'),
        mcq('q7', 'Que estratégia permite atualizar a aplicação sem derrubar o serviço?', 'd', ['Desligar todas as instâncias de uma vez e ligar as novas depois de alguns minutos', 'Editar os arquivos direto na máquina de produção, com a aplicação em execução', 'Apagar o certificado TLS e emitir outro enquanto a atualização ocorre', 'Rolling update ou blue-green, com graceful shutdown das instâncias antigas'], 'Troca gradual de instâncias e encerramento gracioso mantêm o serviço no ar. As demais causam indisponibilidade ou riscos.'),
        fill('q8', 'Complete a porta em que o Node escuta atrás do Nginx neste exemplo.', 'proxy_pass http://127.0.0.1:___;', ['3000'], 'O Nginx encaminha para a porta alta em que o Node escuta; neste exemplo, a 3000.')
      ]
    },
    {
      id: 'nji-41-seguranca-owasp-no-node',
      title: 'Segurança (OWASP) no Node',
      goal: 'Aplicar no Node as defesas contra injeção, XSS, CSRF, SSRF, ReDoS e prototype pollution, e mapear essas práticas para o OWASP Top 10 sem repetir o curso de OWASP.',
      xp: 20,
      intro: {
        slides: [
          sl('Mapa: do OWASP Top 10 para o Node', 'O OWASP Top 10 é uma lista de referência das categorias mais críticas de riscos em aplicações web (injeção, quebra de controle de acesso, falhas criptográficas, configuração insegura, componentes vulneráveis, falhas de autenticação, SSRF, falta de registro e monitoramento, entre outras; a ordem muda entre edições, então consulte a atual). O curso de OWASP do catálogo explica cada categoria a fundo. Aqui o ângulo é o Node: onde cada risco aparece num back-end JavaScript e a defesa concreta. Controle de acesso e autenticação foram vistos nas lições de RBAC e JWT; dependências, na lição própria.'),
          sl('Injeção: SQL, NoSQL e comando', 'Injeção acontece quando entrada do usuário vira parte de um comando interpretado. SQL: nunca monte a consulta concatenando texto; use consultas parametrizadas. NoSQL: se o campo deve ser texto, valide o tipo, porque um JSON pode trazer um objeto onde você esperava uma string e ele será interpretado como filtro. Comando: child_process.exec com string passa por um shell; entrada concatenada ali pode executar comandos extras. Use execFile com lista de argumentos, sem shell, e nunca passe entrada do usuário para eval ou new Function. Vulnerável e corrigido, em forma ilustrativa:', '// VULNERÁVEL (não use): concatenação de entrada\ndb.query("SELECT * FROM usuarios WHERE email = \'" + email + "\'");\nexec(\'convert \' + nomeArquivo + \' saida.png\');\n\n// CORRIGIDO: parâmetros e argumentos separados\ndb.query(\'SELECT * FROM usuarios WHERE email = $1\', [email]);\nexecFile(\'convert\', [nomeArquivoValidado, \'saida.png\']);'),
          sl('XSS e CSRF', 'XSS (cross-site scripting): a aplicação devolve texto do usuário sem escapar e o navegador o executa como código. Defesa: escapar a saída conforme o contexto (HTML, atributo, URL), usar um motor de template que escape por padrão, e uma Content-Security-Policy (CSP) como segunda camada. O exemplo escapa os caracteres especiais. CSRF (cross-site request forgery): outro site faz o navegador do usuário enviar uma requisição que carrega o cookie de sessão. Defesa: cookies com SameSite e HttpOnly, token anti-CSRF em formulários e conferência de Origin. APIs que usam token no cabeçalho Authorization não sofrem de CSRF do mesmo jeito, pois o navegador não o anexa sozinho.', 'const esc = (s) => String(s).replace(/[&<>"\']/g, (c) => ({ \'&\': \'&amp;\', \'<\': \'&lt;\', \'>\': \'&gt;\', \'"\': \'&quot;\', "\'": \'&#39;\' }[c]));\nconsole.log(esc(\'<img src=x onerror=alert(1)>\'));\n// saída real (executado aqui):\n// &lt;img src=x onerror=alert(1)&gt;'),
          sl('SSRF', 'SSRF (server-side request forgery): a aplicação recebe uma URL do usuário (uma prévia de link, um webhook) e o SERVIDOR faz a requisição, que pode atingir serviços internos, como bancos, painéis administrativos ou o serviço de metadados da nuvem. Defesas: preferir uma lista de permissão (allowlist) de hosts; resolver o DNS e recusar endereços privados, de loopback e de link-local; aceitar só http e https; não seguir redirecionamentos às cegas; definir timeout e limite de tamanho da resposta; e isolar na rede o componente que faz as requisições. Validar só o texto da URL não basta, porque o nome pode resolver para um IP interno.'),
          sl('ReDoS e prototype pollution', 'ReDoS: certas expressões regulares (com repetições aninhadas ambíguas) levam tempo explosivo com entradas específicas. Como o Node executa o JavaScript num único laço de eventos, UMA regex lenta trava o servidor para todos. Defesas: limitar o tamanho da entrada antes de aplicar a regex, evitar quantificadores aninhados e preferir validar com parser ou funções simples. Prototype pollution: ao mesclar objetos de forma recursiva com chaves vindas do usuário, uma chave como __proto__ pode alterar o protótipo de TODOS os objetos (por exemplo, fazer todo objeto parecer ter admin). Defesas: ignorar essas chaves, usar Map ou Object.create(null), e schema estrito. O exemplo ignora as chaves perigosas e usa comparação de segredos em tempo constante.', 'function mesclarSeguro(destino, origem) {\n  for (const chave of Object.keys(origem)) {\n    if (chave === \'__proto__\' || chave === \'constructor\' || chave === \'prototype\') continue;\n    const v = origem[chave];\n    if (v && typeof v === \'object\' && !Array.isArray(v)) {\n      destino[chave] = mesclarSeguro(Object.hasOwn(destino, chave) ? destino[chave] : {}, v);\n    } else destino[chave] = v;\n  }\n  return destino;\n}\n// entrada JSON com chave __proto__ → saída real (executado aqui):\n// { tema: \'escuro\' } | objeto novo herdou admin? false\n// igual(\'<SEGREDO>\', \'<SEGREDO>\') e igual(\'<SEGREDO>\', \'outro\') → true false'),
          sl('Cabeçalhos, CORS e checklist', 'O pacote helmet (terceiros, por nome) configura cabeçalhos de segurança: Content-Security-Policy, Strict-Transport-Security (HSTS), X-Content-Type-Options: nosniff, entre outros. Remova o X-Powered-By, que anuncia o framework. Configure o CORS com origens explícitas, nunca um asterisco combinado com credenciais. Aplique limite de taxa (rate limit) em login e rotas sensíveis, devolva erros genéricos (nada de stack trace), compare segredos em tempo constante (crypto.timingSafeEqual) e mantenha dependências atualizadas. Para mapear: injeção, XSS e SSRF têm categorias próprias no OWASP Top 10; CSRF e ReDoS caem em falhas de projeto e de validação; cabeçalhos e CORS, em configuração insegura.')
        ]
      },
      questions: [
        mcq('q1', 'Qual é a defesa correta contra injeção de SQL?', 'd', ['Concatenar a entrada e remover manualmente as aspas que o usuário digitar', 'Converter a entrada para minúsculas antes de montar a consulta', 'Usar um comprimento máximo e depois concatenar o texto à consulta', 'Consultas parametrizadas, com os valores enviados separados do texto SQL'], 'Parâmetros separam código de dados, de modo que a entrada nunca é interpretada como SQL. Filtrar aspas, mudar caixa ou limitar tamanho continuam permitindo construir consultas manipuladas.'),
        mcq('q2', 'Um endpoint converte arquivos chamando exec("convert " + nomeArquivo). Qual a correção?', 'c', ['Manter exec, mas colocar a entrada entre aspas simples na concatenação', 'Trocar exec por eval, que é mais rápido e interpreta a entrada com segurança', 'Usar execFile com uma lista de argumentos e validar o nome do arquivo', 'Aceitar o nome do arquivo se tiver menos de 50 caracteres'], 'execFile não usa shell e trata cada argumento como dado. Aspas na concatenação são facilmente quebradas, eval é ainda mais perigoso e o tamanho não impede comandos curtos.'),
        mcq('q3', 'Uma API faz uma requisição à URL enviada pelo usuário (prévia de link). Qual medida reduz o risco de SSRF?', 'b', ['Aceitar qualquer URL, desde que comece com http', 'Allowlist de hosts, recusa de IPs privados após resolver o DNS e timeout', 'Seguir os redirecionamentos para garantir que a prévia funcione em qualquer link', 'Executar a requisição com a conta de administrador da nuvem para evitar bloqueios'], 'Restringir destinos e checar o IP resolvido impede alcançar a rede interna. O prefixo http não filtra nada, redirecionamentos podem levar a hosts internos e privilégios altos agravam o impacto.'),
        fill('q4', 'Complete o valor do cabeçalho que impede o navegador de adivinhar o tipo do conteúdo.', 'res.setHeader(\'X-Content-Type-Options\', \'___\');', ['nosniff'], 'nosniff manda o navegador respeitar o Content-Type declarado, reduzindo certos ataques.'),
        mcq('q5', 'Por que uma expressão regular lenta (ReDoS) é especialmente grave no Node?', 'a', ['O JavaScript roda num único laço de eventos, então ela trava o servidor para os demais usuários', 'O Node cria uma cópia do servidor para cada regex e esgota a memória', 'As expressões regulares do Node são executadas pelo navegador do usuário, sem passar pelo servidor', 'O Node proíbe regex em qualquer rota que receba dados de usuários'], 'Uma operação síncrona longa bloqueia o laço de eventos e todas as requisições esperam. Não há cópias do servidor, a regex roda no servidor e o Node não proíbe seu uso.'),
        mcq('q6', 'Qual prática reduz o risco de prototype pollution ao mesclar objetos vindos do usuário?', 'a', ['Ignorar as chaves __proto__, constructor e prototype ou usar estruturas sem protótipo', 'Converter o objeto em texto e mesclar os textos em seguida', 'Confiar na validação do navegador, que remove essas chaves antes do envio', 'Aumentar o tamanho máximo do corpo da requisição para aceitar objetos completos'], 'Bloquear as chaves que mexem no protótipo, ou usar Map ou Object.create(null), evita a poluição. Texto não muda o problema, o navegador não é confiável e tamanho de corpo não tem relação.'),
        mcq('q7', 'Qual medida combate o XSS refletido numa página que mostra o parâmetro de busca?', 'd', ['Guardar a busca em um cookie sem a flag HttpOnly', 'Converter o texto para maiúsculas antes de mostrá-lo', 'Pedir ao usuário que desative o JavaScript do navegador', 'Escapar a saída conforme o contexto e adotar uma CSP'], 'O escape impede o navegador de interpretar o texto como código e a CSP é uma camada extra. Cookie sem HttpOnly piora, maiúsculas não neutralizam marcação e não se pode exigir isso do usuário.'),
        fill('q8', 'Complete o nome da configuração que remove o cabeçalho que anuncia o framework.', 'app.disable(\'x-___-by\');', ['powered'], 'x-powered-by revela o framework; desabilitá-lo reduz informação útil a atacantes.')
      ]
    },
    {
      id: 'nji-42-dependencias-e-cadeia-de-suprimentos-npm',
      title: 'Dependências e cadeia de suprimentos npm',
      goal: 'Reduzir o risco das dependências: npm audit, lockfile, typosquatting, scripts de instalação, pacotes abandonados, provenance e atualização contínua.',
      xp: 20,
      intro: {
        slides: [
          sl('Sua aplicação é feita de confiança', 'Um projeto Node típico tem poucas dependências diretas e centenas de transitivas (as dependências das dependências). Cada pacote é código de outras pessoas executando com as permissões da sua aplicação, e às vezes na sua máquina e no CI durante a instalação. A cadeia de suprimentos (supply chain) é esse conjunto: autores, contas de publicação, registro npm, seu pipeline. Um ataque pode vir de qualquer elo. A defesa é uma soma de hábitos pequenos, não de uma ferramenta só.'),
          sl('npm audit', 'npm audit compara as versões do seu lockfile com uma base de avisos (advisories) de vulnerabilidades conhecidas e lista os pacotes afetados com a gravidade. npm audit fix tenta atualizar para versões corrigidas sem quebrar as faixas de versão. Limitações: só enxerga vulnerabilidades JÁ CONHECIDAS; pode apontar problemas em código que sua aplicação nunca chama (falso positivo prático); e uma correção pode exigir mudança maior. Avalie cada alerta: a função vulnerável é usada? a entrada é controlável por atacantes? Rode no CI e bloqueie severidades altas. Veja a lição de CI/CD.'),
          sl('Lockfile e faixas de versão', 'O package.json declara faixas (^1.2.3 aceita atualizações compatíveis); o package-lock.json registra a versão EXATA de cada pacote instalado (inclusive transitivos) e um hash de integridade do conteúdo. Commite o lockfile e instale com npm ci: todo ambiente recebe os mesmos bytes, e uma alteração adulterada no pacote faz a verificação de integridade falhar. Revise as mudanças do lockfile nos pull requests: uma dependência nova e inesperada ali merece atenção. Sem lockfile, cada instalação pode trazer uma versão diferente, inclusive uma recém-comprometida.'),
          sl('Ataques comuns', 'Typosquatting: pacote malicioso com nome parecido com o de um popular (um nome com letra trocada), esperando uma digitação errada. Dependency confusion: sua empresa tem um pacote interno com certo nome e alguém publica no registro público um pacote de mesmo nome com versão maior, que o instalador pode preferir; mitigue com pacotes privados em escopo (@empresa/...) e registro configurado. Conta de mantenedor comprometida ou pacote abandonado e depois assumido por outra pessoa: uma versão nova pode trazer código malicioso. Scripts de instalação: preinstall, install e postinstall rodam código arbitrário no momento do npm install; avalie a opção --ignore-scripts e só libere para quem precisa.', '# ilustrativo, não executado aqui\nnpm install --ignore-scripts   # não executa scripts de instalação dos pacotes'),
          sl('Provenance, assinaturas e SBOM (conceito)', 'Provenance (procedência): o autor publica o pacote a partir de um pipeline que gera uma atestação ligando a versão publicada ao repositório e ao build de origem; quem instala pode verificar que o pacote veio mesmo de lá. O registro também oferece assinaturas dos pacotes, verificáveis por comando do npm (confira o nome exato na documentação da versão em uso). SBOM (Software Bill of Materials) é a lista de todos os componentes e versões de um build, útil para saber rapidamente se você usa um pacote afetado por um problema recém-descoberto. Essas são camadas de verificação: reduzem risco, não o eliminam.'),
          sl('Higiene: mínimo, avaliação e atualização contínua', 'Mínimo de dependências: cada pacote é custo e risco. Em versões recentes o Node traz de fábrica fetch, um test runner, crypto, leitura de arquivo de ambiente e muito mais: use o nativo quando bastar. Antes de adicionar um pacote: tem manutenção recente? quantas dependências traz? qual a licença? o que ele faz de verdade? (popularidade é um indício fraco, não garantia). Mantenha as atualizações contínuas com ferramentas como Dependabot e Renovate (por nome), que abrem pull requests pequenos validados pelo CI: atualizar pouco e sempre é mais seguro que um salto grande a cada ano. Remova o que não usa e ative autenticação em dois fatores nas contas de publicação.')
        ]
      },
      questions: [
        mcq('q1', 'Qual a função do package-lock.json?', 'c', ['Criptografar o código-fonte da aplicação antes de enviá-lo para o repositório', 'Listar os pacotes que o desenvolvedor instalou diretamente no projeto', 'Registrar a versão exata de cada pacote e um hash de integridade, para instalações reprodutíveis', 'Bloquear a publicação do pacote no registro enquanto houver vulnerabilidades conhecidas, até que o autor corrija'], 'O lockfile fixa versões (inclusive transitivas) e integridade. Não criptografa código, inclui as transitivas e não controla publicações.'),
        mcq('q2', 'O npm audit não acusa nenhum problema. O que isso garante?', 'b', ['Que as dependências não conterão código malicioso em versões futuras publicadas depois da auditoria', 'Que não há vulnerabilidades conhecidas nas versões do lockfile segundo a base de avisos, e nada além disso', 'Que o código da própria aplicação está livre de falhas de segurança', 'Que os scripts de instalação dos pacotes são seguros e não executam nada'], 'O audit só cruza versões com avisos já publicados. Não prevê versões futuras, não analisa o seu código nem os scripts de instalação.'),
        mcq('q3', 'Um desenvolvedor digita um nome de pacote com uma letra trocada e instala um pacote malicioso com nome quase idêntico ao popular. Como se chama o ataque?', 'b', ['Dependency confusion', 'Typosquatting', 'ReDoS', 'Prototype pollution'], 'Typosquatting explora erros de digitação. Dependency confusion usa nomes internos publicados no registro público; ReDoS e prototype pollution são falhas de execução, não de cadeia de suprimentos.'),
        fill('q4', 'Complete a opção que impede a execução dos scripts de instalação dos pacotes.', 'npm install --ignore-___', ['scripts'], '--ignore-scripts evita a execução automática de preinstall, install e postinstall.'),
        mcq('q5', 'Por que os scripts postinstall merecem cuidado?', 'a', ['Eles executam código arbitrário do pacote durante a instalação, na sua máquina ou no CI', 'Eles só rodam em produção, depois que a aplicação já está servindo os usuários', 'Eles apagam o lockfile quando o pacote é atualizado para uma versão nova', 'Eles são obrigatórios em todo pacote, e ignorá-los impede o uso da biblioteca'], 'O script roda na hora da instalação com as permissões de quem instala. Não é só em produção, não apaga o lockfile e muitos pacotes funcionam sem scripts.'),
        mcq('q6', 'Como reduzir o risco de dependency confusion com pacotes internos da empresa?', 'd', ['Dar aos pacotes internos nomes curtos e genéricos para ficarem fáceis de lembrar', 'Instalar a versão mais recente disponível em qualquer registro acessível', 'Desativar o lockfile para que o instalador escolha o pacote mais adequado', 'Publicar os pacotes internos em escopo próprio (@empresa/...) e configurar o registro privado'], 'O escopo e o registro configurado fazem o instalador buscar o pacote interno no lugar certo. Nomes genéricos aumentam a chance de colisão, aceitar a mais nova em qualquer registro é o que o ataque explora e sem lockfile piora.'),
        mcq('q7', 'Por que manter o mínimo de dependências?', 'c', ['Porque o npm cobra por cada pacote instalado em um projeto', 'Porque pacotes demais impedem o Node de iniciar o processo', 'Cada pacote é código de terceiros que amplia a superfície de ataque e o trabalho de manutenção', 'Porque o lockfile só consegue registrar até dez pacotes por projeto e o npm recusaria os demais na instalação'], 'Menos código externo significa menos risco e menos atualizações a acompanhar. O npm não cobra por pacote instalado, o Node inicia com muitos pacotes e o lockfile não tem esse limite.'),
        fill('q8', 'Complete a sigla da lista de todos os componentes e versões que compõem um build.', '// ___: Software Bill of Materials', ['SBOM'], 'SBOM é a lista de materiais de software, usada para saber rapidamente se um componente afetado está presente.')
      ]
    },
    {
      id: 'nji-43-privacidade-lgpd-em-apis-node',
      title: 'Privacidade e LGPD em APIs Node',
      goal: 'Traduzir princípios da LGPD em decisões técnicas de uma API: direitos do titular, retenção, pseudonimização, criptografia de campos e registro de consentimento.',
      xp: 20,
      intro: {
        slides: [
          sl('Visão geral e ressalva', 'A LGPD (Lei Geral de Proteção de Dados, Lei 13.709/2018) regula o tratamento de dados pessoais no Brasil. Vocabulário: dado pessoal é a informação relacionada a uma pessoa identificada ou identificável; titular é a pessoa a quem os dados se referem; controlador é quem decide como e por que tratar os dados; operador trata os dados em nome do controlador. Princípios que viram decisões técnicas: finalidade (usar só para o fim informado), necessidade (coletar o mínimo), segurança e transparência. ATENÇÃO: esta lição é uma visão técnica geral, não é aconselhamento jurídico; prazos, bases legais e obrigações devem ser definidos com orientação jurídica.'),
          sl('Direitos do titular em endpoints', 'A lei prevê direitos como confirmar que há tratamento e acessar os dados, corrigir dados incorretos, pedir anonimização, bloqueio ou eliminação de dados desnecessários, portabilidade, ser informado sobre compartilhamento e revogar o consentimento. Numa API, isso vira funcionalidades, por exemplo: GET /v1/eu/dados (acesso), PATCH /v1/eu (correção), DELETE /v1/eu (eliminação), GET /v1/eu/exportacao (portabilidade em formato estruturado). Cuidados: exigir autenticação forte (e reautenticação em ações sensíveis) para o pedido não vir de outra pessoa; registrar cada solicitação e sua resposta; e consultar o jurídico sobre prazos e exceções. Ilustrativo, não executado aqui.'),
          sl('Retenção e exclusão de verdade', 'Retenção é por quanto tempo cada dado é guardado: só pelo necessário para a finalidade ou para obrigações legais. Defina um prazo por categoria de dado e implemente um job de expurgo (lição de agendamento) que apaga o vencido. Eliminar de verdade significa alcançar todas as cópias: banco, caches, filas, arquivos, backups (com política de expiração), logs e terceiros que receberam os dados. Soft delete (marcar como apagado) NÃO elimina; serve no máximo como etapa antes da remoção. Algumas leis podem exigir guardar certos dados por um período; essas exceções vêm da orientação jurídica, não de uma suposição.'),
          sl('Pseudonimização x anonimização', 'Pseudonimização troca um identificador direto (CPF, e-mail) por um pseudônimo, mantendo a possibilidade de religar à pessoa com uma informação adicional guardada separadamente e protegida. Continua sendo dado pessoal. Anonimização torna a identificação impossível por meios razoáveis e, quando efetiva, o dado deixa de ser pessoal; é difícil de garantir, porque combinações de dados podem reidentificar. Com o módulo crypto, um HMAC com chave separada gera pseudônimos estáveis: o mesmo valor produz o mesmo pseudônimo (útil para análises) e sem a chave não dá para reproduzir a relação. A chave vem de um cofre, não do código.', 'const pseudonimo = (valor) => crypto.createHmac(\'sha256\', chavePseudo).update(valor).digest(\'hex\').slice(0, 16);\n// saída real (executado aqui, com CPFs claramente fictícios e chave aleatória):\n// mesmo valor, mesmo pseudonimo: true\n// valor diferente, pseudonimo diferente: true'),
          sl('Criptografia de campos sensíveis', 'Além de TLS em trânsito e criptografia do disco ou do banco em repouso, campos muito sensíveis podem ser cifrados pela própria aplicação. O exemplo usa AES-256-GCM, um modo autenticado: além de esconder o conteúdo, detecta adulteração. Regras: um IV (vetor de inicialização) NOVO e aleatório a cada cifragem, guardado junto ao dado; a chave vem de um cofre e é rotacionada; nunca invente um algoritmo próprio. Limitação: campo cifrado não pode ser pesquisado nem ordenado pelo banco; para busca por igualdade usa-se um índice derivado (HMAC do valor) guardado ao lado.', 'function cifrar(texto) {\n  const iv = crypto.randomBytes(12);\n  const c = crypto.createCipheriv(\'aes-256-gcm\', chaveCampo, iv);\n  const dados = Buffer.concat([c.update(texto, \'utf8\'), c.final()]);\n  return [iv, c.getAuthTag(), dados].map((b) => b.toString(\'base64\')).join(\'.\');\n}\n// saída real (executado aqui, com chave aleatória e texto fictício):\n// ida e volta confere: true\n// duas cifragens do mesmo texto sao iguais? false\n// adulteracao detectada: decifrar falhou'),
          sl('Registro de consentimento e incidentes', 'Quando a base legal for o consentimento, registre: quem (usuarioId), para qual finalidade, qual versão do texto foi aceita, quando (data em UTC), por qual canal e o estado (concedido ou revogado), em um histórico que não se reescreve (cada mudança é uma nova linha). Revogar deve ser tão fácil quanto conceder, e caixas não devem vir pré-marcadas. Lembre que o consentimento não é a única base legal prevista na lei; a escolha da base é jurídica. Tenha também um plano de resposta a incidentes (quem avalia, quem comunica) e saiba quem é o encarregado (DPO) da organização. Tudo isso exige orientação jurídica.', '-- ilustrativo, não executado aqui (esquema mínimo)\nCREATE TABLE consentimentos (\n  id BIGSERIAL PRIMARY KEY,\n  usuario_id BIGINT NOT NULL,\n  finalidade TEXT NOT NULL,       -- ex.: \'newsletter\'\n  versao_texto TEXT NOT NULL,\n  estado TEXT NOT NULL CHECK (estado IN (\'concedido\',\'revogado\')),\n  registrado_em TIMESTAMPTZ NOT NULL DEFAULT now()\n);')
        ]
      },
      questions: [
        mcq('q1', 'Qual princípio orienta não coletar o CPF de um cliente quando o serviço funciona sem ele?', 'c', ['Disponibilidade, que pede manter os dados acessíveis', 'Portabilidade, que pede exportar os dados em formato estruturado', 'Necessidade, que pede coletar só o mínimo para a finalidade', 'Reutilização, que pede guardar dados para usos futuros ainda não definidos'], 'A necessidade (minimização) limita a coleta ao indispensável. Os demais nomes não se aplicam: guardar para usos futuros indefinidos contraria a finalidade.'),
        mcq('q2', 'Um usuário pede a eliminação da conta e o sistema só marca o registro como apagado, mantendo todos os dados. O que está errado?', 'b', ['Nada, porque marcar como apagado equivale a eliminar para os efeitos legais', 'Soft delete só marca o registro; a eliminação real alcança todas as cópias', 'O erro é apagar muito rápido; deveria esperar a decisão do usuário por um ano', 'O correto seria enviar os dados para um terceiro antes de marcar como apagado'], 'O dado continua armazenado e tratado. A eliminação real alcança banco, caches, filas, backups e logs, ressalvadas obrigações legais. Marcar não equivale a eliminar, não há espera obrigatória de um ano e enviar a terceiros agrava.'),
        mcq('q3', 'Qual a diferença entre pseudonimização e anonimização?', 'a', ['A pseudonimização permite religar à pessoa com dado separado; a anonimização, não', 'A pseudonimização remove o dado do sistema; a anonimização só o criptografa antes de guardar', 'As duas são sinônimos e as siglas mudam entre as normas', 'A pseudonimização vale para e-mails; a anonimização, para CPFs'], 'No pseudônimo ainda há um caminho de volta (continua dado pessoal); na anonimização efetiva não há. Não são sinônimos nem se limitam a um tipo de dado.'),
        fill('q4', 'Complete o modo de cifra autenticada usado no exemplo: AES-256-___.', 'crypto.createCipheriv(\'aes-256-___\', chave, iv);', ['gcm'], 'GCM é um modo autenticado: protege a confidencialidade e detecta alterações no dado cifrado.'),
        mcq('q5', 'Por que cada cifragem deve usar um IV novo e aleatório?', 'd', ['Para que a chave possa ser publicada sem risco', 'Para que o banco consiga ordenar os campos cifrados', 'Para dispensar a autenticação do conteúdo cifrado', 'Para que o mesmo texto não gere o mesmo resultado cifrado a cada vez'], 'Um IV novo faz textos iguais resultarem em saídas diferentes, o que esconde padrões. A chave continua secreta, campos cifrados não são ordenáveis e a autenticação vem do modo GCM.'),
        mcq('q6', 'Qual conjunto de informações é útil registrar ao guardar um consentimento?', 'd', ['O e-mail do usuário e uma caixa marcada por padrão', 'A data de criação da conta, já que o consentimento é implícito em qualquer finalidade', 'O corpo completo das requisições feitas pelo usuário no site', 'Usuário, finalidade, versão do texto aceito, data em UTC e estado (concedido ou revogado)'], 'Esses campos permitem demonstrar o que foi aceito, por quem e quando, e se foi revogado. Caixas pré-marcadas, consentimento implícito e corpos de requisição não cumprem esse papel e ainda ampliam dados coletados.'),
        mcq('q7', 'Para eliminar de fato os dados de um titular, onde é preciso olhar além da tabela principal?', 'c', ['A tabela principal, porque as demais cópias não contam como tratamento', 'O navegador do usuário, que guarda as cópias relevantes', 'Caches, filas, backups, arquivos, logs e terceiros que receberam os dados', 'Em lugar algum, pois após o pedido o dado deixa de existir sozinho'], 'Dados se espalham por vários componentes, e todos precisam de política de eliminação ou expiração. Considerar só a tabela principal, o navegador ou esperar que desapareçam sozinhos deixa cópias para trás.'),
        fill('q8', 'Complete o termo que a lei usa para a pessoa a quem os dados pessoais se referem.', '// o ___ é a pessoa a quem os dados pessoais se referem', ['titular'], 'Titular é a pessoa natural a quem se referem os dados; controlador e operador são os agentes de tratamento.')
      ]
    },
    {
      id: 'nji-44-performance-basica-e-profiling',
      title: 'Performance básica e profiling',
      goal: 'Medir antes de otimizar, reconhecer gargalos típicos de aplicações Node, usar profiling, cache, compressão e conexões e fazer benchmarks com cuidado.',
      xp: 20,
      intro: {
        slides: [
          sl('Meça antes de otimizar', 'Otimizar sem medir é adivinhar, e quase sempre se otimiza o lugar errado. O ciclo é: definir a métrica (latência no percentil 95, requisições por segundo, uso de memória), medir o estado atual, achar o gargalo (o ponto que mais limita o desempenho), mudar UMA coisa e medir de novo. Primeiro vem a clareza e a correção; otimização só onde a medição mostra necessidade, porque código mais rápido costuma ser mais complexo.'),
          sl('Gargalos típicos em Node', 'Na maioria das APIs, o tempo vai para esperar I/O: consultas lentas ao banco, falta de índice, chamadas de rede em série. O problema N+1 (uma consulta por item de uma lista) multiplica essas esperas. Há também as respostas gigantes (JSON.stringify e JSON.parse são síncronos e bloqueiam), loops de CPU e regex pesadas que bloqueiam o laço de eventos único, vazamentos de memória (coleções que só crescem) e excesso de logs. Sintoma clássico de bloqueio do laço: todas as requisições ficam lentas ao mesmo tempo.'),
          sl('Medindo com módulos nativos', 'performance.now() (módulo perf_hooks) mede tempo com alta precisão. O programa abaixo mede um laço pesado, o JSON de 200 mil objetos, o efeito de um cache e, o mais importante, mostra que um timer de 10 ms atrasa muito quando o laço está ocupado. Os tempos variam de máquina para máquina, por isso a saída mostra faixas e não números exatos.', 'medir(\'loop sincrono de 300 milhoes de somas\', () => { /* laço */ });\nmedir(\'JSON.stringify de 200 mil objetos\', () => { texto = JSON.stringify(grande); });\nmedir(\'primeira chamada (sem cache)\', () => comCache(7));\nmedir(\'segunda chamada (cache)\', () => comCache(7));\n// saída real (executado aqui; varia conforme a máquina):\n// loop sincrono de 300 milhoes de somas: mais de 50 ms\n// JSON.stringify de 200 mil objetos: entre 5 e 50 ms\n// JSON.parse do mesmo texto: entre 5 e 50 ms\n// primeira chamada (sem cache): entre 5 e 50 ms\n// segunda chamada (cache): menos de 5 ms\n// timer de 10 ms atrasou mais de 100 ms? true'),
          sl('Profiling', 'Profiling é observar onde o programa gasta tempo e memória. Node traz o profiler do V8: node --cpu-prof gera um arquivo de perfil de CPU, e node --prof gera um registro que se processa depois (confira as opções na documentação da versão em uso). Com node --inspect você conecta o DevTools do Chrome e grava perfis e heap snapshots. O resultado costuma ser visto como flamegraph: cada barra é uma função, a LARGURA mostra o tempo gasto nela e as barras de cima foram chamadas pelas de baixo; procure barras largas. Ferramentas como o clinic.js (por nome) ajudam. Perfile num ambiente parecido com produção e com carga realista. Para monitorar o bloqueio do laço, use perf_hooks.monitorEventLoopDelay.'),
          sl('Cache, compressão e conexões', 'Cache guarda o resultado de algo caro para reaproveitar. Em memória (um Map) é rápido, mas cresce sem limite se você não impuser TTL (tempo de vida) e tamanho máximo, e cada instância tem o seu; Redis compartilha entre instâncias. Invalidar o cache quando o dado muda é a parte difícil. Cabeçalhos HTTP (Cache-Control, ETag) permitem cache no navegador e em CDNs. Compressão (gzip, brotli), geralmente no proxy, reduz o tamanho das respostas de texto; não adianta comprimir o que já é comprimido, como imagens. Pool de conexões ao banco reaproveita conexões em vez de abrir uma por requisição; dimensione-o pelo que o banco aguenta. Pagine as listas.'),
          sl('Benchmarks cuidadosos', 'Um benchmark ruim engana. Cuidados: aqueça o código (o compilador JIT otimiza depois de algumas execuções); repita várias vezes e olhe a distribuição (mediana, p95), não uma medida só; rode em máquina quieta e com a mesma configuração entre as versões comparadas; compare só o que muda; desconfie de microbenchmarks, que medem coisas diferentes do uso real. Para teste de carga em HTTP, use ferramentas como autocannon (por nome) apenas contra a SUA aplicação em ambiente de teste, nunca contra sistemas de terceiros. Os resultados mudam com hardware e versão do Node: tratar números como relativos, não absolutos.')
        ]
      },
      questions: [
        mcq('q1', 'Qual o primeiro passo ao investigar uma API lenta?', 'b', ['Reescrever as funções principais usando as otimizações mais recentes', 'Medir e achar o gargalo antes de alterar o código', 'Adicionar cache nas rotas ao mesmo tempo', 'Aumentar o número de instâncias antes de entender a causa'], 'Sem medir, é fácil otimizar o ponto errado. Reescrever, cachear tudo e escalar às cegas gastam esforço e podem não resolver a causa real.'),
        mcq('q2', 'Todas as rotas da API ficam lentas ao mesmo tempo durante uma exportação que processa um JSON enorme com JSON.stringify. Qual a explicação mais provável?', 'a', ['A operação síncrona bloqueia o laço de eventos e as outras requisições esperam', 'O banco de dados parou de aceitar conexões para todas as consultas', 'O Node reiniciou o processo automaticamente a cada requisição à rota por causa da exportação', 'O navegador limitou a velocidade das respostas do domínio'], 'JSON.stringify é síncrono: enquanto roda, o laço único não atende ninguém. O sintoma generalizado aponta para o bloqueio, não para o banco, reinício ou navegador.'),
        mcq('q3', 'Um cache em Map guarda resultados por chave de usuário e a memória do processo só cresce. Qual a correção?', 'a', ['Definir TTL e tamanho máximo, descartando entradas antigas', 'Aumentar a memória do servidor até o problema parar de aparecer', 'Guardar os resultados também em variáveis globais, para redundância', 'Remover o cache, pois um cache vaza memória no Node'], 'Sem limites, o cache é um vazamento. TTL e tamanho máximo o mantêm útil. Mais memória só adia, globais pioram e um cache bem limitado não vaza.'),
        fill('q4', 'Complete o método do perf_hooks que devolve o tempo com alta precisão.', 'const t0 = performance.___();', ['now'], 'performance.now() retorna o tempo em milissegundos com fração, ideal para medir trechos.'),
        mcq('q5', 'Num flamegraph, o que indica uma função candidata a otimização?', 'd', ['Uma barra alta, porque a altura representa o número de linhas do código', 'Uma barra de cor vermelha, pois o vermelho significa erro de sintaxe', 'Uma barra na base do gráfico, independentemente da largura', 'Uma barra larga, porque a largura representa o tempo gasto nela'], 'A largura é proporcional ao tempo; a altura mostra a profundidade da pilha de chamadas. As cores não indicam erros e a base só mostra os pontos de entrada.'),
        mcq('q6', 'Qual o benefício de um pool de conexões ao banco?', 'c', ['Elimina a necessidade de índices nas tabelas consultadas', 'Garante que as consultas executem na mesma ordem', 'Reaproveita conexões abertas em vez de criar uma nova a cada requisição', 'Criptografa o conteúdo das consultas entre a aplicação e o banco'], 'Abrir conexões é caro; o pool reaproveita e limita o total. Não substitui índices, não garante ordem e a criptografia depende de TLS.'),
        mcq('q7', 'Qual prática torna um benchmark mais confiável?', 'b', ['Executar uma única vez e usar o número obtido como valor definitivo', 'Aquecer o código, repetir várias vezes e olhar a distribuição dos resultados', 'Comparar resultados medidos em máquinas diferentes sem controlar a carga', 'Rodar o teste de carga contra um serviço público de terceiros para ter realismo'], 'Aquecimento (JIT) e repetições dão uma visão estável. Medida única, ambientes diferentes e carga contra terceiros geram dados enganosos, e o último ainda é indevido.'),
        fill('q8', 'Complete o nome da função do perf_hooks que monitora o atraso do laço de eventos.', 'perf_hooks.monitorEventLoop___()', ['Delay'], 'monitorEventLoopDelay cria um histograma do atraso do laço, útil para detectar bloqueios.')
      ]
    },
    {
      id: 'nji-45-projeto-api-completa',
      title: 'Projeto: API completa de pedidos',
      goal: 'Integrar o que foi visto no intermediário numa arquitetura de API de pedidos fictícia e tomar decisões justificadas sobre autenticação, dados, fila, testes, operação e LGPD.',
      xp: 20,
      intro: {
        slides: [
          sl('O cenário e os requisitos', 'Vamos projetar, no papel, a API de uma loja fictícia, a "Papelaria Exemplo". Funcionais: cadastro e login de clientes; catálogo de produtos; criar, consultar e cancelar pedidos; envio de e-mail de confirmação e de nota; painel para atendentes. Não funcionais: segurança, privacidade (LGPD), desempenho razoável, testabilidade e operação simples. Nada aqui usa dados reais, e os nomes de pacotes são só exemplos. O objetivo é praticar decisões: para cada tema, qual escolha e por quê.'),
          sl('Arquitetura e fluxo', 'Organize em camadas: rota (HTTP) → validação do schema → serviço (regras de negócio) → repositório (banco). A rota não conhece SQL e o serviço não conhece HTTP, o que facilita testar o serviço com dublês. Escolha de framework (Express, Fastify, NestJS) é decisão da equipe: Fastify traz validação por schema na rota, NestJS traz estrutura de módulos e injeção de dependências, Express é minimalista. Registre um ID por requisição, valide TODA entrada (corpo, query, parâmetros, cabeçalhos relevantes) e configure o servidor a partir de variáveis de ambiente validadas na inicialização.'),
          sl('Autenticação e autorização', 'Senhas: guarde apenas hash lento com salt (scrypt, argon2 ou bcrypt), nunca a senha. Login devolve um token de acesso JWT de vida curta e um refresh token revogável, guardado como hash no banco; limite a taxa de tentativas de login. Autorização em duas camadas: RBAC (papéis: cliente, atendente, admin) para o que cada papel pode fazer e autorização por objeto para o que cada pessoa pode ver: um cliente só lê os próprios pedidos (um GET /pedidos/10 de outro cliente responde 403 ou 404). Aplique a regra no serviço, não só na rota, para valer por qualquer caminho.'),
          sl('Dados, cache e filas', 'PostgreSQL (relacional) com migrations versionadas e consultas parametrizadas (ou um ORM). Criar um pedido é uma TRANSAÇÃO: inserir o pedido, os itens e baixar o estoque, tudo ou nada. Índices nas colunas de busca e paginação nas listagens. Redis (por nome) para cache do catálogo, que muda pouco e é muito lido, com TTL e invalidação ao atualizar, e também para limite de taxa. Tarefas lentas saem da requisição: a API responde 202 e enfileira o envio da confirmação e da nota; o worker é idempotente, tem retentativas com backoff e dead letter queue. No payload da fila, só o id do pedido.'),
          sl('Qualidade e operação', 'Testes: unitários do serviço com dublês (relógio e e-mail injetados) e de integração com banco de teste isolado e dados fictícios. OpenAPI versionado e validado no CI. Logs em JSON com reqId e redaction, sem dados pessoais; métricas e health checks de liveness e readiness. Docker multi-stage, usuário não-root, sem segredos na imagem, graceful shutdown. CI: npm ci, lint, testes, audit e varredura de segredos. Deploy atrás de proxy reverso com TLS, segredos no cofre da plataforma, rotação planejada, dependências com lockfile e atualização contínua.'),
          sl('LGPD e decisões finais', 'Minimização: não colete CPF se o pedido não exige; se for necessário (nota fiscal), proteja o campo com criptografia e limite o acesso. Retenção: defina por quanto tempo guardar pedidos e dados de contato e implemente o expurgo agendado. Direitos do titular: endpoints de acesso, correção e eliminação, com autenticação forte. Marketing separado, com consentimento registrado e descadastro simples. Logs e métricas sem identificadores pessoais. Tudo isso exige validação jurídica: esta lição é técnica e não substitui orientação especializada. Nas questões, escolha a decisão que atende melhor segurança, privacidade e simplicidade.')
        ]
      },
      questions: [
        mcq('q1', 'Criar um pedido insere o pedido, os itens e baixa o estoque. Como garantir que, se a baixa de estoque falhar, nada fique gravado pela metade?', 'b', ['Executar as três operações em requisições HTTP separadas e confiar que todas terminem', 'Executar as três operações numa transação do banco, com rollback em caso de falha', 'Gravar primeiro o pedido, enviar um e-mail e só depois pensar no estoque', 'Guardar os itens num cache e gravar no banco ao final do dia'], 'Uma transação torna o conjunto atômico: tudo ou nada. Requisições separadas, gravar fora de ordem ou adiar para o fim do dia deixam estados inconsistentes.'),
        mcq('q2', 'A cliente Ana está autenticada e chama GET /pedidos/10, um pedido que pertence ao cliente Bruno. Qual o comportamento correto?', 'a', ['Negar o acesso (403, ou 404 por decisão de projeto), pois a autorização é por objeto', 'Devolver o pedido, porque Ana já fez login e tem o papel de cliente e o sistema confia nos clientes', 'Devolver o pedido sem o nome, deixando os demais dados visíveis', 'Responder 500, porque o pedido não pertence ao usuário autenticado'], 'O papel de cliente não autoriza ler pedidos alheios; é preciso conferir o dono do objeto. Devolver parte dos dados continua sendo vazamento e 500 indica erro do servidor, não falta de permissão.'),
        mcq('q3', 'O envio da nota por e-mail demora e às vezes falha por indisponibilidade do provedor. Qual a decisão de arquitetura mais adequada?', 'd', ['Enviar dentro da requisição e, se falhar, devolver erro e pedir ao cliente que repita o pedido', 'Enviar dentro da requisição com timeout de uma hora, para dar tempo ao provedor', 'Gravar a nota no log da aplicação para que alguém envie manualmente depois', 'Enfileirar um job idempotente, responder 202 e deixar o worker tentar de novo com backoff e DLQ'], 'A fila desacopla, e a idempotência protege contra duplicata na retentativa. Enviar na requisição prejudica o usuário, e logar o conteúdo da nota espalha dados pessoais.'),
        fill('q4', 'Complete a função do módulo crypto que calcula um hash lento adequado para senhas, usando um salt.', 'crypto.___(senha, salt, 64, callback);', ['scrypt'], 'scrypt é uma função de derivação de chave lenta, apropriada para guardar senhas; hashes rápidos como sha256 simples não são adequados.'),
        mcq('q5', 'O catálogo de produtos é muito lido e muda poucas vezes por dia. Qual estratégia de desempenho encaixa?', 'c', ['Consultar o banco a cada leitura, sem qualquer tipo de cache', 'Cache permanente sem expiração, que só termina ao reiniciar o servidor', 'Cache com TTL, invalidado quando o catálogo for atualizado', 'Copiar o catálogo para cada cliente no momento do login'], 'Dado muito lido e pouco alterado é o caso clássico de cache, com TTL e invalidação. Sem cache há carga desnecessária, e cache eterno serve dado velho.'),
        mcq('q6', 'O formulário de cadastro coleta CPF, data de nascimento e endereço, mas o serviço só precisa de e-mail e senha. O que fazer?', 'c', ['Coletar tudo e decidir o uso depois, porque dados podem ser úteis no futuro', 'Coletar tudo e guardar sem restrição de acesso, para a equipe consultar quando quiser', 'Coletar e-mail e senha, aplicando o princípio da necessidade', 'Coletar tudo, mas apagar os campos extras do log para não aparecerem nele'], 'Coletar o mínimo reduz risco e obrigações. Guardar para uso futuro viola a finalidade, acesso irrestrito amplia o risco e limpar só o log não resolve a coleta excessiva.'),
        mcq('q7', 'Qual configuração de pipeline CI é a mais adequada para uma API deste tipo?', 'b', ['npm install, sem lockfile, testes só localmente e segredos no repositório privado', 'npm ci, lint, testes e audit, com segredos no cofre do CI e merge bloqueado em caso de falha', 'Só o build, deixando os testes para quem fizer o deploy manual em produção', 'Passa pelas etapas, mas com os segredos escritos no arquivo do pipeline e versionados no repositório'], 'Instalação reprodutível, verificações automáticas e segredos no cofre com merge bloqueado dão feedback e proteção. As demais omitem etapas ou expõem segredos.'),
        fill('q8', 'Complete o usuário sem privilégios que o Dockerfile da API deve usar.', 'USER ___', ['node'], 'A imagem oficial do Node já traz o usuário node, sem privilégios de administrador.')
      ]
    },
  ]
};
