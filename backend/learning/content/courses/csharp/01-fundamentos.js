// Módulo "Fundamentos" do curso de C# e .NET — lições 1 a 16 da primeira metade (a segunda metade
// é encaixada depois pelo orquestrador). 8 questões por lição (3 múltipla escolha + 1 lacuna, duas
// vezes). Ver ../../index.js para o formato e a validação de boot. Código C# moderno (top-level
// statements, nullable reference types e implicit usings ligados nos templates atuais) sem citar
// números de versão que envelheçam. Para não repetir o mesmo objeto literal centenas de vezes, as
// questões usam helpers locais: mcq recebe a letra da resposta correta e as 4 alternativas na ordem
// a, b, c, d (a posição da certa é escolhida à mão e variada); fill recebe prompt, código com a
// lacuna ___ e a lista de respostas aceitas (a 1ª é a canônica; a comparação ignora maiúsculas, por
// isso nenhuma lacuna depende só de capitalização); sl() monta um slide (code opcional).
// Segurança e privacidade (LGPD): validar sempre a entrada do usuário (TryParse, IsNullOrWhiteSpace),
// nunca confiar em dados externos, decimal para dinheiro, não registrar dados pessoais em logs e
// nenhum dado pessoal real nos exemplos (nomes e e-mails obviamente fictícios).
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
  id: 'fundamentos-csharp',
  levelKey: 'beginner',
  order: 1,
  title: 'Fundamentos',
  subtitle: 'Da instalação ao primeiro programa: tipos, strings, operadores, controle de fluxo, métodos, coleções e orientação a objetos',
  accent: '#512bd4',
  lessons: [
    {
      id: 'csb-01-o-que-e-csharp-dotnet',
      title: 'O que são C# e .NET',
      goal: 'Entender a diferença entre a linguagem C# e a plataforma .NET, e como seu código vira um programa em execução.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'C# é a linguagem; .NET é a plataforma',
            'C# (lê-se "C sharp") é uma LINGUAGEM de programação: as regras de escrita do código que você digita. .NET é a PLATAFORMA onde esse código é compilado, executado e apoiado por uma enorme biblioteca de funcionalidades. Uma analogia: C# é o idioma em que você escreve o roteiro; .NET é o estúdio completo — câmeras, equipe e ferramentas — que transforma o roteiro em filme. Você escreve em C#, e o .NET cuida de rodar. (O .NET também aceita outras linguagens, como F# e Visual Basic, mas C# é de longe a mais usada.)',
            '// Isto é C# (a linguagem)...\nConsole.WriteLine("Olá, mundo!");\n// ...e quem sabe imprimir na tela é a biblioteca do .NET (a plataforma).\n// Saída: Olá, mundo!'
          ),
          sl(
            'Os três pedaços do .NET: SDK, runtime (CLR) e BCL',
            'Runtime é o motor que EXECUTA o programa; o do .NET se chama CLR (Common Language Runtime): ele roda o código, gerencia a memória sozinho (o coletor de lixo, garbage collector, libera o que você não usa mais) e aplica regras de segurança de tipos. BCL (Base Class Library) é a biblioteca de classes pronta: texto, datas, arquivos, coleções, rede, matemática (Console, String, List, File, DateTime...). SDK (Software Development Kit) é o kit de DESENVOLVIMENTO: traz o compilador, a ferramenta de linha de comando "dotnet" e o runtime. Regra simples: quem programa instala o SDK; quem só precisa rodar um programa já pronto instala apenas o runtime.',
            'SDK      = compilador + ferramenta "dotnet" + runtime + BCL  (para quem DESENVOLVE)\nRuntime  = CLR + BCL                                          (para quem só EXECUTA)\nCLR      = o "motor" que roda o código e gerencia a memória\nBCL      = a biblioteca de classes pronta (Console, List, DateTime...)'
          ),
          sl(
            'Compilação: C# vira IL e o JIT vira código de máquina',
            'O computador não entende C#. Quando você compila, o compilador converte seu código para IL (Intermediate Language, linguagem intermediária), um formato neutro guardado em arquivos .dll ou .exe. Na hora de EXECUTAR, o compilador JIT (Just-In-Time) do CLR traduz o IL para o código de máquina do processador onde o programa está rodando, no momento em que cada trecho é necessário. Vantagem: o mesmo IL funciona em máquinas diferentes, e cada máquina recebe código nativo adequado a ela.',
            'MeuCodigo.cs  --(compilador)-->  IL (.dll)  --(JIT, ao executar)-->  código de máquina'
          ),
          sl(
            'Multiplataforma e o .NET "moderno"',
            'O .NET atual roda em Windows, Linux e macOS: o mesmo código C# pode virar um serviço num servidor Linux ou um programa no seu notebook Windows. Existe também o .NET Framework, a versão ANTIGA e legada, que só funciona no Windows e hoje apenas recebe manutenção; muitos sistemas empresariais antigos ainda a usam. Para projetos novos, usa-se o .NET moderno (aquele que o SDK atual instala). Neste curso, tudo é .NET moderno. Ao ler tutoriais antigos, desconfie se mencionarem "Framework" e arquivos como packages.config: é outro mundo, mais velho.',
            '.NET moderno   -> Windows, Linux, macOS (código aberto, projetos novos)\n.NET Framework -> só Windows (legado, apenas manutenção)'
          ),
          sl(
            'O que dá para construir com C#',
            'Com a mesma linguagem você cria: aplicativos de console (terminal), sites e APIs web (ASP.NET Core), aplicativos desktop (Windows Forms, WPF), aplicativos mobile (.NET MAUI), jogos (a engine Unity usa C# como linguagem de scripts), serviços em segundo plano e funções na nuvem (por exemplo, no Azure). Estudar C# abre todas essas portas. Neste módulo usaremos o console: é o jeito mais simples de aprender os fundamentos sem distrações de interface.',
            '// Mesma linguagem, vários tipos de projeto:\n//  console   -> dotnet new console\n//  web API   -> dotnet new webapi\n//  testes    -> dotnet new xunit'
          ),
          sl(
            'Como é o C#: fortemente tipado, orientado a objetos, multiparadigma',
            'Fortemente tipado: toda variável tem um tipo (número inteiro, texto...) conhecido na compilação, e o compilador impede misturas erradas ANTES de o programa rodar, evitando muitos bugs. Orientado a objetos: o código se organiza em classes e objetos que juntam dados e comportamento (veremos nas últimas lições). Multiparadigma: além de objetos, a linguagem permite estilos procedural (instruções passo a passo) e funcional (funções como valores, LINQ). Você escolhe a ferramenta certa para cada problema.',
            'int idade = 30;\n// idade = "trinta";   // ERRO de compilação: texto não cabe em int\nConsole.WriteLine(idade);\n// Saída: 30'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual afirmação descreve corretamente a relação entre C# e .NET?', 'b', [
          'C# e .NET são dois nomes para a mesma coisa',
          'C# é a linguagem de programação; .NET é a plataforma que compila, executa e fornece a biblioteca',
          'C# é a plataforma e .NET é a linguagem',
          '.NET é um editor de texto para escrever C#'
        ], 'C# é a linguagem (as regras do código). .NET é a plataforma: SDK, runtime e biblioteca de classes.'),
        mcq('q2', 'Qual é o papel do CLR (Common Language Runtime)?', 'd', [
          'Escrever o código C# automaticamente',
          'Ser o editor onde o código é digitado',
          'Guardar a biblioteca de classes como Console e List',
          'Executar o programa, gerenciando memória e traduzindo IL para código de máquina'
        ], 'O CLR é o motor de execução: roda o IL (com o JIT), libera memória com o garbage collector e aplica segurança de tipos. A biblioteca pronta é a BCL.'),
        mcq('q3', 'Qual é a diferença entre instalar o SDK e instalar apenas o runtime?', 'a', [
          'O SDK inclui compilador e a ferramenta dotnet para desenvolver; o runtime só executa programas prontos',
          'O runtime compila e o SDK apenas executa',
          'São idênticos, mudam só o nome',
          'O SDK só funciona no Windows e o runtime só no Linux'
        ], 'Desenvolvedor instala o SDK (que já inclui o runtime). Para apenas rodar um programa pronto, o runtime basta.'),
        fill('q4', 'Complete: ao compilar, o C# vira uma linguagem intermediária chamada...', 'C#  -->  ___  -->  código de máquina (via JIT)', ['IL', 'CIL', 'MSIL'], 'O compilador gera IL (Intermediate Language, também chamada CIL ou MSIL), que o JIT converte em código nativo na execução.'),
        mcq('q5', 'O que é a BCL (Base Class Library)?', 'c', [
          'O compilador que gera IL',
          'O sistema que libera memória automaticamente',
          'A biblioteca de classes pronta do .NET, com recursos como Console, strings, datas e coleções',
          'Um tipo de projeto para sites'
        ], 'A BCL é o conjunto de tipos prontos que você usa sem escrever do zero: Console, List, DateTime, File etc.'),
        mcq('q6', 'Sobre .NET moderno e .NET Framework, o que é verdadeiro?', 'b', [
          'O .NET Framework é o recomendado para projetos novos e roda em Linux',
          'O .NET Framework é a versão legada, apenas para Windows; o .NET moderno é multiplataforma',
          'O .NET moderno roda apenas no Windows',
          'Os dois são exatamente iguais, só mudam de nome'
        ], 'O .NET Framework é legado e exclusivo do Windows. O .NET moderno roda em Windows, Linux e macOS.'),
        mcq('q7', 'O que significa dizer que C# é uma linguagem fortemente tipada?', 'd', [
          'Que ela só aceita números',
          'Que o código roda mais rápido que qualquer outro',
          'Que não existem variáveis',
          'Que toda variável tem um tipo conhecido na compilação e o compilador impede usos incompatíveis'
        ], 'Com tipagem forte, tentar guardar texto numa variável int é erro de compilação, detectado antes de rodar.'),
        fill('q8', 'Complete: o compilador que traduz IL para código de máquina durante a execução se chama...', 'IL --(___)--> código nativo, em tempo de execução', ['JIT', 'compilador JIT', 'Just-In-Time'], 'JIT (Just-In-Time) traduz o IL para código nativo do processador no momento em que cada trecho vai ser executado.')
      ]
    },
    {
      id: 'csb-02-instalacao-primeiro-programa',
      title: 'Instalação e primeiro programa',
      goal: 'Instalar o SDK, criar um projeto de console, rodá-lo e entender os arquivos que o template gera.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Instalando o SDK e conferindo a versão',
            'Baixe o SDK do .NET no site oficial da Microsoft (dotnet.microsoft.com) ou instale por um gerenciador de pacotes do seu sistema. Depois abra um terminal e confirme: "dotnet --version" mostra a versão do SDK e "dotnet --list-sdks" lista todas as instaladas. Se o comando "dotnet" não for reconhecido, o SDK não está instalado ou o terminal precisa ser reaberto para enxergar o PATH. Baixe sempre do site oficial: instaladores de terceiros podem trazer software malicioso.',
            'dotnet --version\n# mostra algo como: a versão do seu SDK\ndotnet --list-sdks\n# lista as versões de SDK instaladas'
          ),
          sl(
            'Criando um projeto de console',
            'Toda a interação é feita pela ferramenta "dotnet". O comando "dotnet new console -n Ola" cria uma pasta chamada Ola com um projeto de console pronto. "dotnet new" usa modelos (templates): "console" é o modelo de aplicativo de terminal; -n define o nome (e da pasta). Em seguida você entra na pasta com "cd Ola". Esses comandos são idênticos no PowerShell, no Prompt de Comando, no bash do Linux e no terminal do macOS.',
            'dotnet new console -n Ola\ncd Ola'
          ),
          sl(
            'Rodar e compilar: dotnet run e dotnet build',
            '"dotnet run" compila (se preciso) E executa o programa: é o que você mais usará ao estudar. "dotnet build" apenas compila, sem executar, e mostra erros de compilação se existirem. Dentro da pasta do projeto, execute "dotnet run" e verá a saída do programa no terminal. Se houver erro de compilação, nada é executado e o terminal lista o arquivo, a linha e a descrição do problema — leia a mensagem, ela costuma dizer exatamente o que corrigir.',
            'dotnet build   # só compila\ndotnet run     # compila e executa\n# Saída do template: Hello, World!'
          ),
          sl(
            'Estrutura do projeto: .csproj, Program.cs, bin/ e obj/',
            'O projeto tem poucos arquivos. Ola.csproj é o arquivo de configuração do projeto (XML): tipo de saída (Exe), a versão do .NET alvo, se os implicit usings e os nullable reference types estão ligados. Program.cs contém o seu código. As pastas bin/ e obj/ aparecem depois do primeiro build: bin/ guarda o resultado final (o .dll e o executável) e obj/ guarda arquivos intermediários. Elas são geradas e podem ser apagadas à vontade (o próximo build recria), e NÃO devem ir para o controle de versão (git): o comando "dotnet new gitignore" cria um .gitignore adequado.',
            'Ola/\n  Ola.csproj    <- configuração do projeto\n  Program.cs    <- seu código\n  bin/          <- gerada: resultado do build\n  obj/          <- gerada: arquivos intermediários\n\n<!-- trecho do Ola.csproj -->\n<OutputType>Exe</OutputType>\n<TargetFramework>netX.0</TargetFramework>   <!-- X = versão alvo -->\n<ImplicitUsings>enable</ImplicitUsings>\n<Nullable>enable</Nullable>'
          ),
          sl(
            'Program.cs: top-level statements e Console.WriteLine',
            'O Program.cs do template é minúsculo graças aos top-level statements (instruções de nível superior): você escreve as instruções direto no arquivo, sem precisar de classe nem método Main, e o compilador monta o resto. Console é uma classe da BCL; WriteLine é um método dela que escreve o texto entre aspas duplas e depois pula uma linha. Toda instrução termina com ponto e vírgula. Troque o texto, salve e rode "dotnet run" de novo para ver a mudança.',
            'Console.WriteLine("Olá, mundo!");\nConsole.WriteLine("Meu primeiro programa em C#");\n// Saída:\n// Olá, mundo!\n// Meu primeiro programa em C#'
          ),
          sl(
            'Editores e IDEs',
            'Você pode escrever C# em qualquer editor de texto, mas uma IDE ajuda muito com destaque, autocompletar e depurador. As opções principais: Visual Studio (IDE completa, mais usada no Windows), Visual Studio Code com a extensão C# Dev Kit (leve e multiplataforma) e JetBrains Rider (IDE multiplataforma, paga para uso comercial). Todas usam o mesmo SDK por baixo: o que você faz com "dotnet" no terminal funciona igual em qualquer uma delas. Escolha a que preferir; para aprender, o terminal com "dotnet run" já basta.',
            '// Qualquer IDE por baixo chama o mesmo SDK:\n//   Visual Studio | VS Code + C# Dev Kit | Rider\n// e você sempre pode usar o terminal:\ndotnet run'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual comando cria um novo projeto de console chamado Ola?', 'c', [
          'dotnet create console Ola',
          'dotnet start Ola.cs',
          'dotnet new console -n Ola',
          'dotnet init -n Ola'
        ], '"dotnet new" gera um projeto a partir de um template; "console" é o template e -n define o nome.'),
        mcq('q2', 'Qual é a diferença entre "dotnet build" e "dotnet run"?', 'a', [
          'build só compila; run compila (se preciso) e também executa o programa',
          'build executa; run só compila',
          'São o mesmo comando',
          'run apaga as pastas bin e obj'
        ], 'build produz o resultado da compilação sem executar. run compila e executa em seguida.'),
        mcq('q3', 'Qual é a função do arquivo .csproj?', 'd', [
          'Guardar a saída do programa',
          'Conter o código-fonte principal',
          'Armazenar os dados dos usuários',
          'Configurar o projeto: tipo de saída, versão do .NET alvo, opções como nullable e implicit usings'
        ], 'O .csproj é o arquivo XML de configuração do projeto. O código fica em arquivos .cs, como Program.cs.'),
        fill('q4', 'Complete o comando para compilar e executar o projeto:', 'dotnet ___', ['run'], '"dotnet run" compila se necessário e executa o programa.'),
        mcq('q5', 'O que são as pastas bin/ e obj/?', 'b', [
          'Pastas onde você deve escrever o código',
          'Pastas geradas pelo build, com a saída e arquivos intermediários; não vão para o controle de versão',
          'Pastas que guardam as senhas do projeto',
          'Pastas que a IDE usa apenas para o tema visual'
        ], 'São geradas pelo build e podem ser recriadas a qualquer momento; por isso entram no .gitignore.'),
        mcq('q6', 'O que o código abaixo imprime?\nConsole.WriteLine("Olá");\nConsole.WriteLine("Mundo");', 'c', [
          'OláMundo na mesma linha',
          'Apenas Mundo',
          'Olá em uma linha e Mundo na linha seguinte',
          'Nada, falta o método Main'
        ], 'WriteLine escreve o texto e pula de linha. Com top-level statements não é preciso declarar Main.'),
        mcq('q7', 'O que são top-level statements?', 'a', [
          'Instruções escritas direto no arquivo, sem precisar declarar classe nem método Main; o compilador gera o restante',
          'Instruções que só rodam no topo da tela do terminal',
          'Comandos que só funcionam no Visual Studio',
          'Um tipo de comentário de documentação'
        ], 'Os top-level statements simplificam o ponto de entrada: o código solto do Program.cs vira o método principal automaticamente.'),
        fill('q8', 'Complete para criar um projeto de console:', 'dotnet new ___ -n Ola', ['console'], '"console" é o nome do template de aplicativo de terminal.')
      ]
    },
    {
      id: 'csb-03-estrutura-programa',
      title: 'Estrutura de um programa C#',
      goal: 'Reconhecer as partes de um arquivo C#: using, namespaces, classes, ponto de entrada, comentários e convenções de nomes.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'using e namespaces',
            'Um namespace (espaço de nomes) agrupa tipos relacionados, como pastas agrupam arquivos, e evita conflitos de nome. A classe Console vive no namespace System. A diretiva "using System;" no topo do arquivo diz ao compilador "pode procurar tipos em System", permitindo escrever Console em vez de System.Console. Sem o using você ainda poderia usar o nome completo. Os usings vêm sempre no início do arquivo.',
            'using System;\n\nConsole.WriteLine("Com using");\nSystem.Console.WriteLine("Com nome completo");\n// Saída:\n// Com using\n// Com nome completo'
          ),
          sl(
            'global using e implicit usings',
            'Nos projetos modernos você quase não escreve "using System;": o template liga os implicit usings (no .csproj: <ImplicitUsings>enable</ImplicitUsings>), que adicionam automaticamente, em todos os arquivos, usings comuns como System, System.Collections.Generic, System.IO, System.Linq e outros. Por baixo, isso é um "global using", diretiva que vale para o projeto inteiro. Você também pode escrever o seu próprio "global using Nome.Do.Namespace;" num arquivo, para valer em todos os arquivos do projeto.',
            '// Com ImplicitUsings habilitado, já funciona sem "using":\nvar lista = new List<int> { 1, 2, 3 };\nConsole.WriteLine(lista.Count);\n// Saída: 3\n\n// Um global using seu (vale para o projeto todo):\n// global using System.Text;'
          ),
          sl(
            'Classe e ponto de entrada: Main clássico vs top-level',
            'Em C#, código vive dentro de tipos (classes). O ponto de entrada é o primeiro código executado: o método estático Main. Na forma clássica, você escreve uma classe (por convenção Program) com "static void Main(string[] args)". Na forma moderna (top-level statements) o compilador gera essa classe e esse Main para você. As duas fazem exatamente a mesma coisa; um projeto só pode ter UM ponto de entrada. A forma clássica ainda aparece em muito código e tutoriais, então reconheça ambas.',
            '// Forma clássica\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Console.WriteLine("Clássico");\n    }\n}\n\n// Forma moderna (equivalente), no arquivo todo:\n// Console.WriteLine("Moderno");'
          ),
          sl(
            'Namespace declarado e file-scoped namespace',
            'Seu código também pode (e em projetos maiores deve) ficar num namespace próprio. A forma tradicional usa chaves e gera um nível de indentação a mais. A forma file-scoped termina a declaração com ponto e vírgula e vale para o arquivo inteiro, sem chaves: menos aninhamento. Só pode haver uma por arquivo e vem antes das declarações de tipos.',
            '// Tradicional\nnamespace Loja\n{\n    class Produto { }\n}\n\n// File-scoped (arquivo inteiro pertence a Loja)\nnamespace Loja;\n\nclass Produto { }'
          ),
          sl(
            'Comentários: //, /* */ e ///',
            'Comentários são ignorados pelo compilador e servem para explicar o PORQUÊ do código. "//" comenta até o fim da linha. "/* ... */" comenta um bloco, inclusive de várias linhas. "///" abre um comentário de documentação XML (com tags como <summary>), colocado acima de métodos e classes: as IDEs mostram esse texto como dica quando você usa o método. Evite comentários óbvios e nunca deixe senhas, tokens ou dados pessoais em comentários.',
            '// comentário de uma linha\n/* comentário\n   de várias linhas */\n\n/// <summary>Soma dois números inteiros.</summary>\nstatic int Somar(int a, int b) => a + b;'
          ),
          sl(
            'Ponto e vírgula, chaves, case-sensitive e convenções',
            'Toda instrução termina com ";". Chaves { } delimitam blocos (corpo de classe, método, if...). C# diferencia maiúsculas de minúsculas (case-sensitive): "Console" existe, "console" não, e "nome" e "Nome" são nomes diferentes. Convenções de nomes: PascalCase (cada palavra com inicial maiúscula) para classes, métodos, propriedades e namespaces (ex.: ContaBancaria, CalcularTotal); camelCase (primeira palavra minúscula) para variáveis locais e parâmetros (ex.: precoFinal, nomeCliente). Convenção não é regra do compilador, mas todo o mundo C# a segue — siga também.',
            'int precoFinal = 10;        // camelCase: variável local\nConsole.WriteLine(precoFinal);\n// console.WriteLine(precoFinal); // ERRO: "console" não existe (case-sensitive)\n// Console.WriteLine(precoFinal)  // ERRO: falta o ;\n// Saída: 10'
          )
        ]
      },
      questions: [
        mcq('q1', 'Para que serve a diretiva "using System;" no topo do arquivo?', 'd', [
          'Para executar o programa como administrador',
          'Para importar um arquivo de texto',
          'Para declarar a variável System',
          'Para permitir usar tipos do namespace System, como Console, sem escrever o nome completo'
        ], 'O using traz os tipos do namespace para o escopo: em vez de System.Console, basta Console.'),
        mcq('q2', 'Qual destes trechos provoca erro de compilação?', 'b', [
          'Console.WriteLine("ok");',
          'console.WriteLine("ok");',
          'System.Console.WriteLine("ok");',
          'Console.WriteLine("ok" );'
        ], 'C# é case-sensitive: "console" (minúsculo) não existe; o tipo é "Console".'),
        mcq('q3', 'O que são os implicit usings (global usings implícitos) dos templates modernos?', 'a', [
          'Usings comuns (System, System.Linq, System.Collections.Generic...) adicionados automaticamente a todos os arquivos do projeto',
          'Comentários que o compilador apaga',
          'Um modo que desliga a checagem de tipos',
          'Namespaces que só existem no Linux'
        ], 'Com <ImplicitUsings>enable</ImplicitUsings> o projeto já importa usings comuns, por isso você raramente escreve "using System;".'),
        fill('q4', 'Complete a diretiva para usar o namespace System:', '___ System;', ['using'], 'A diretiva "using" importa um namespace para o arquivo.'),
        mcq('q5', 'Qual é a assinatura clássica do ponto de entrada de um programa C#?', 'c', [
          'void Start()',
          'public Main()',
          'static void Main(string[] args)',
          'int Begin(string text)'
        ], 'O ponto de entrada clássico é o método estático Main, que recebe opcionalmente os argumentos da linha de comando em string[] args.'),
        mcq('q6', 'Qual comentário é de documentação XML, mostrado pelas IDEs como dica do método?', 'b', [
          '// Soma dois números',
          '/// <summary>Soma dois números</summary>',
          '/* Soma dois números */',
          '# Soma dois números'
        ], '"///" abre comentário de documentação com tags XML como <summary>. "#" não é comentário em C#.'),
        mcq('q7', 'Qual forma segue a convenção de nomes do C#?', 'd', [
          'Classe ContaBancaria e variável local Preco_Final',
          'Classe contabancaria e variável local PrecoFinal',
          'Classe conta_bancaria e variável local precofinal',
          'Classe ContaBancaria e variável local precoFinal'
        ], 'PascalCase para classes, métodos e propriedades; camelCase para variáveis locais e parâmetros.'),
        fill('q8', 'Complete o nome do método que é o ponto de entrada clássico:', 'static void ___(string[] args)', ['Main'], 'O ponto de entrada clássico se chama Main (escrito com M maiúsculo, pois C# é case-sensitive).')
      ]
    },
    {
      id: 'csb-04-variaveis-tipos',
      title: 'Variáveis e tipos básicos',
      goal: 'Declarar variáveis com os tipos numéricos, bool, char e string, usar var, const e entender limites e overflow.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Variáveis e tipos inteiros',
            'Uma variável é um nome para um espaço de memória que guarda um valor de um tipo. Declara-se "tipo nome = valor;". Os tipos inteiros diferem no tamanho: byte (0 a 255), short (cerca de -32 mil a 32 mil), int (cerca de -2,1 bilhões a 2,1 bilhões) e long (números enormes, até a casa dos quintilhões). O padrão do dia a dia é int; use long quando o valor pode passar de 2 bilhões (por exemplo, contagens grandes ou IDs enormes).',
            'byte  b = 200;\nshort s = 30000;\nint   i = 2000000000;\nlong  l = 9000000000L;   // o L indica literal long\nConsole.WriteLine(i + 1);\n// Saída: 2000000001'
          ),
          sl(
            'Números com casas decimais: double, float e decimal',
            'double (o padrão para números reais) e float (menor e menos preciso) guardam valores em binário, e por isso têm pequenos erros de arredondamento: 0.1 + 0.2 não dá exatamente 0.3. decimal guarda números em base 10 com mais precisão e é o tipo certo para DINHEIRO e cálculos financeiros. Nunca use double ou float para valores monetários. Nos exemplos, as casas decimais aparecem com ponto; num computador configurado para o Brasil (pt-BR) o programa exibe vírgula (3,14). Literais no CÓDIGO sempre usam ponto: 3.14 é double; 3.14f é float; 3.14m é decimal (sem o sufixo m o compilador recusa guardar em decimal).',
            'double  d = 0.1 + 0.2;\ndecimal m = 0.1m + 0.2m;\nConsole.WriteLine(d == 0.3);   // Saída: False\nConsole.WriteLine(m == 0.3m);  // Saída: True\n\nfloat   f = 3.14f;\ndecimal preco = 19.90m;'
          ),
          sl(
            'bool, char, string e var',
            'bool guarda true ou false (verdadeiro/falso, sempre minúsculos). char guarda UM caractere entre aspas simples (\'A\'). string guarda texto entre aspas duplas ("Olá"). Com var, o compilador DEDUZ o tipo a partir do valor inicial (inferência de tipo): continua sendo fortemente tipado, só não precisa repetir o tipo. var exige um valor inicial, e o tipo não muda depois. Use var quando o tipo é óbvio pelo lado direito.',
            'bool   ativo = true;\nchar   letra = \'A\';\nstring nome = "Ana Exemplo";\nvar    idade = 25;        // o compilador infere int\n// idade = "vinte";        // ERRO: idade é int\nConsole.WriteLine($"{nome}, {idade}, {ativo}, {letra}");\n// Saída: Ana Exemplo, 25, True, A'
          ),
          sl(
            'Literais com sufixo, const e readonly',
            'Sufixos dizem ao compilador o tipo do literal: L para long, f para float, m para decimal (e d para double). const declara uma constante: valor fixado na compilação, que nunca muda e deve ser inicializada na hora; serve para valores como PI ou limites. readonly (somente leitura) só vale para CAMPOS de uma classe (não para variáveis locais): o valor pode ser definido na declaração ou no construtor e depois não muda. Em resumo: const é conhecida na compilação; readonly pode ser definida na construção do objeto.',
            'const double Pi = 3.14159;\n// Pi = 3;                 // ERRO: não se altera constante\nconst int MaxTentativas = 3;\nConsole.WriteLine(Pi * 2);\n// Saída: 6.28318 (6,28318 em pt-BR)\n\nclass Conta\n{\n    public readonly decimal LimiteInicial;   // readonly: só em campo\n    public Conta(decimal limite) { LimiteInicial = limite; }\n}'
          ),
          sl(
            'Tipos de valor vs tipos de referência e default',
            'Tipos de valor (int, double, decimal, bool, char, structs) guardam o valor diretamente na variável: atribuir copia o valor. Tipos de referência (string, classes, arrays) guardam uma REFERÊNCIA (endereço) para um objeto: atribuir copia a referência, e duas variáveis podem apontar para o mesmo objeto. Aprofundaremos adiante. A expressão default(T) (ou só "default") devolve o valor padrão do tipo: 0 para numéricos, false para bool, e null (ausência de objeto) para tipos de referência.',
            'int a = 5;\nint b = a;     // cópia do valor\nb = 9;\nConsole.WriteLine(a);              // Saída: 5\nConsole.WriteLine(default(int));   // Saída: 0\nConsole.WriteLine(default(bool));  // Saída: False\nstring? s = default;               // null (tipo de referência)'
          ),
          sl(
            'Limites, overflow e checked',
            'Cada tipo tem limites, acessíveis por constantes como int.MaxValue (2147483647) e int.MinValue. Passar do limite é overflow (estouro). Por padrão, em tempo de execução o C# NÃO avisa: o valor "dá a volta" (wraparound) para o outro extremo. Dentro de um bloco checked, o estouro lança OverflowException em vez de passar em silêncio, o que é essencial em cálculos onde um número errado seria perigoso (contas, quantidades). Atenção: o estouro de expressões constantes puras (como int.MaxValue + 1 escrito direto) já é erro de compilação.',
            'int x = int.MaxValue;\nConsole.WriteLine(x);        // Saída: 2147483647\nx++;                          // estouro silencioso\nConsole.WriteLine(x);        // Saída: -2147483648\n\nint y = int.MaxValue;\n// checked { y++; }          // lançaria OverflowException'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual tipo é o mais adequado para guardar valores em dinheiro?', 'a', [
          'decimal',
          'double',
          'float',
          'char'
        ], 'decimal trabalha em base 10 com alta precisão, evitando erros de arredondamento binário de double e float.'),
        mcq('q2', 'O que o código imprime?\nint a = 5;\nint b = a;\nb = 9;\nConsole.WriteLine(a);', 'c', [
          '9',
          '14',
          '5',
          'Erro de compilação'
        ], 'int é tipo de valor: "int b = a" copia o valor. Mudar b não afeta a.'),
        mcq('q3', 'Qual declaração tem erro de compilação?', 'b', [
          'var idade = 25;',
          'var total;',
          'long grande = 9000000000L;',
          'char letra = \'A\';'
        ], 'var exige um valor inicial para o compilador inferir o tipo; "var total;" sozinho não compila.'),
        fill('q4', 'Complete com a palavra-chave para declarar uma constante:', '___ double Pi = 3.14159;', ['const'], 'const declara uma constante: valor fixo, definido na compilação.'),
        mcq('q5', 'O que o código imprime?\nint x = int.MaxValue;\nx++;\nConsole.WriteLine(x < 0);', 'd', [
          'Erro de compilação',
          'False',
          'Lança OverflowException',
          'True'
        ], 'Fora de um bloco checked, o estouro dá a volta: x vira int.MinValue (negativo), então x < 0 é True.'),
        mcq('q6', 'Qual literal tem o tipo decimal?', 'b', [
          '19.90',
          '19.90m',
          '19.90f',
          '19.90L'
        ], 'O sufixo m marca decimal. Sem sufixo, 19.90 é double; f é float; L é long (só para inteiros).'),
        mcq('q7', 'Em C#, onde se pode usar o modificador readonly?', 'a', [
          'Em campos de uma classe (valor definido na declaração ou no construtor)',
          'Em qualquer variável local, como const',
          'Apenas em parâmetros de métodos',
          'Apenas em strings'
        ], 'readonly é para campos. Para valores fixos locais ou conhecidos na compilação, use const.'),
        fill('q8', 'Complete com o valor padrão (default) de um int:', 'Console.WriteLine(default(int)); // Saída: ___', ['0'], 'O valor padrão de tipos numéricos é 0.')
      ]
    },
    {
      id: 'csb-05-strings',
      title: 'Strings',
      goal: 'Manipular texto com segurança: interpolação, formatação, métodos comuns, comparação, StringBuilder e literais especiais.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Strings são imutáveis e concatenação',
            'string guarda texto. Uma string é IMUTÁVEL: depois de criada, não muda. Métodos como ToUpper() não alteram a original; devolvem uma NOVA string que você precisa guardar. Concatenar (juntar) com o operador + também cria uma string nova. Esquecer de usar o retorno é um erro clássico de iniciante.',
            'string s = "casa";\ns.ToUpper();                 // resultado descartado: s não muda\nstring t = s.ToUpper();      // guardamos a nova string\nConsole.WriteLine(s);        // Saída: casa\nConsole.WriteLine(t);        // Saída: CASA\nConsole.WriteLine("Olá, " + s + "!");   // Saída: Olá, casa!'
          ),
          sl(
            'Interpolação e formatação',
            'Uma string interpolada começa com $ antes das aspas e aceita expressões entre chaves {}: mais legível que concatenar. Depois do valor, ":" define um formato: D3 completa um inteiro com zeros à esquerda até 3 dígitos; N2 usa separador de milhar e 2 casas decimais; F2 só 2 casas; C formata como moeda. Atenção: N2, F2 e C dependem da cultura (idioma e região) do computador: em pt-BR usam vírgula decimal e R$; em outras culturas, ponto e outros símbolos. Para ter um resultado fixo em testes, prefira formatos como D3.',
            'int n = 7;\ndecimal preco = 1234.5m;\nConsole.WriteLine($"Pedido {n:D3}");     // Saída: Pedido 007\nConsole.WriteLine($"Total: {preco:N2}");  // pt-BR: Total: 1.234,50\nConsole.WriteLine($"Total: {preco:C}");   // pt-BR: Total: R$ 1.234,50\nConsole.WriteLine($"2 + 3 = {2 + 3}");   // Saída: 2 + 3 = 5'
          ),
          sl(
            'Métodos comuns de string',
            'Length (propriedade, sem parênteses) é o número de caracteres. Os índices começam em 0. Substring(início, tamanho) extrai um pedaço. IndexOf devolve a posição da primeira ocorrência ou -1 se não achar. Contains e StartsWith respondem true/false. Replace troca trechos. ToUpper e ToLower mudam a caixa. Trim remove espaços das pontas. Split quebra o texto em um array de strings pelo separador.',
            'string s = "banana";\nConsole.WriteLine(s.Length);            // 6\nConsole.WriteLine(s.Substring(1, 3));   // ana\nConsole.WriteLine(s.IndexOf("n"));      // 2\nConsole.WriteLine(s.IndexOf("z"));      // -1\nConsole.WriteLine(s.Contains("nan"));   // True\nConsole.WriteLine(s.StartsWith("ba"));  // True\nConsole.WriteLine(s.Replace("a", "o")); // bonono\nConsole.WriteLine("  oi  ".Trim());     // oi\nstring[] partes = "a,b,c".Split(",");\nConsole.WriteLine(partes.Length);       // 3'
          ),
          sl(
            'Comparação, IsNullOrWhiteSpace e Join',
            'Em C#, == entre strings compara o CONTEÚDO (não a identidade), e diferencia maiúsculas de minúsculas. Para ignorar a caixa, use Equals com StringComparison.OrdinalIgnoreCase (comparação por valor de caracteres, sem regras de idioma — a opção correta para comparar identificadores e dados técnicos). string.IsNullOrWhiteSpace(texto) devolve true se o texto é null, vazio ou só espaços: use para validar entrada do usuário. string.Join(separador, itens) junta uma coleção de textos com um separador entre eles.',
            'string a = "Ana";\nConsole.WriteLine(a == "Ana");   // True\nConsole.WriteLine(a == "ana");   // False\nConsole.WriteLine("ABC".Equals("abc", StringComparison.OrdinalIgnoreCase)); // True\nConsole.WriteLine(string.IsNullOrWhiteSpace("   ")); // True\nConsole.WriteLine(string.IsNullOrWhiteSpace("x"));   // False\nConsole.WriteLine(string.Join(", ", new[] { "a", "b", "c" })); // a, b, c'
          ),
          sl(
            'StringBuilder para muitas concatenações',
            'Como strings são imutáveis, concatenar dentro de um laço grande cria uma string nova a cada volta, desperdiçando memória e tempo. StringBuilder (do namespace System.Text, que NÃO faz parte dos implicit usings) é um buffer de texto mutável: você acrescenta com Append e, no final, chama ToString() para obter a string. Use quando monta texto em muitas etapas; para juntar duas ou três partes, + ou interpolação bastam.',
            'using System.Text;\n\nvar sb = new StringBuilder();\nfor (int i = 1; i <= 3; i++)\n{\n    sb.Append(i).Append(" ");\n}\nConsole.WriteLine(sb.ToString().Trim());\n// Saída: 1 2 3'
          ),
          sl(
            'Escapes, strings verbatim e raw',
            'Dentro de aspas, a barra invertida inicia um escape: \\n (nova linha), \\t (tabulação), \\" (aspas) e \\\\ (uma barra). \\u00E9 insere o caractere Unicode "é" pelo código. Strings verbatim, com @ antes das aspas, ignoram escapes (úteis para caminhos de arquivo); dentro delas, uma aspa dupla é escrita como "". Strings raw ("""), de aspas triplas, aceitam várias linhas e aspas internas sem escape; o recuo é definido pela posição das aspas de fechamento.',
            'Console.WriteLine("Linha1\\nLinha2");      // duas linhas\nConsole.WriteLine("Ele disse \\"oi\\"");   // Ele disse "oi"\nConsole.WriteLine(@"C:\\Pasta\\arq.txt");  // C:\\Pasta\\arq.txt\nstring json = """\n    {"nome": "Ana Exemplo"}\n    """;\nConsole.WriteLine(json);                 // {"nome": "Ana Exemplo"}'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que o código imprime?\nstring s = "casa";\ns.ToUpper();\nConsole.WriteLine(s);', 'b', [
          'CASA',
          'casa',
          'Casa',
          'Erro de compilação'
        ], 'Strings são imutáveis: ToUpper() devolve uma nova string, e o resultado foi descartado. s continua "casa".'),
        mcq('q2', 'O que o código imprime?\nint n = 7;\nConsole.WriteLine($"Pedido {n:D3}");', 'd', [
          'Pedido 7',
          'Pedido 7.000',
          'Pedido {n:D3}',
          'Pedido 007'
        ], 'O formato D3 completa o inteiro com zeros à esquerda até ter 3 dígitos. O $ ativa a interpolação.'),
        mcq('q3', 'Qual expressão compara "ABC" e "abc" ignorando maiúsculas e minúsculas?', 'c', [
          '"ABC" == "abc"',
          '"ABC".Contains("abc")',
          '"ABC".Equals("abc", StringComparison.OrdinalIgnoreCase)',
          '"ABC".Replace("abc")'
        ], '== diferencia a caixa. Equals com StringComparison.OrdinalIgnoreCase ignora a diferença entre maiúsculas e minúsculas.'),
        fill('q4', 'Complete com o método que junta itens com um separador:', 'string.___(", ", new[] { "a", "b" })  // a, b', ['Join'], 'string.Join(separador, itens) concatena os itens colocando o separador entre eles.'),
        mcq('q5', 'O que string.IsNullOrWhiteSpace("   ") retorna?', 'a', [
          'true, porque só tem espaços',
          'false, porque a string não é null',
          'false, porque tem 3 caracteres',
          'Lança uma exceção'
        ], 'IsNullOrWhiteSpace é true para null, vazio ou apenas espaços; é a validação ideal para entrada do usuário.'),
        mcq('q6', 'Por que usar StringBuilder em vez de + dentro de um laço com milhares de voltas?', 'd', [
          'Porque + não funciona com strings',
          'Porque StringBuilder deixa a string mutável sem precisar de Append',
          'Porque + só aceita números',
          'Porque cada + cria uma string nova (strings são imutáveis); StringBuilder acumula num buffer mutável'
        ], 'Cada concatenação gera uma nova string. O StringBuilder acrescenta num buffer e só no fim vira string.'),
        mcq('q7', 'O que o código imprime?\nConsole.WriteLine(@"a\\nb");', 'b', [
          'a e b em duas linhas',
          'a\\nb, literalmente',
          'Erro: escape inválido',
          'ab'
        ], 'Em string verbatim (@"...") os escapes são ignorados: a barra e o n aparecem como estão.'),
        fill('q8', 'Complete com o método que extrai um trecho (início 1, tamanho 3):', 'Console.WriteLine("banana".___(1, 3)); // Saída: ana', ['Substring'], 'Substring(início, tamanho) devolve o pedaço da string; índices começam em 0.')
      ]
    },
    {
      id: 'csb-33-char-texto-processamento',
      title: 'char e processamento de texto',
      goal: 'Trabalhar com char, percorrer e transformar strings (contar, inverter, dividir, comparar) e entender os limites do Unicode.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'char: um caractere de 16 bits',
            'O tipo char guarda UM único caractere. Por dentro, é uma unidade de 16 bits do padrão UTF-16 (o formato em que o .NET guarda texto). O literal usa aspas SIMPLES: \'a\'. Aspas duplas criam uma string, que é outro tipo, então char c = "a"; não compila; e \'ab\' também não, pois são dois caracteres. Escapes funcionam como em strings: \'\\n\' (nova linha), \'\\t\' (tabulação), \'\\\'\' (aspa simples), \'\\\\\' (uma barra) e \'\\u00E9\' (o caractere Unicode pelo código hexadecimal, aqui "é").',
            'char a = \'a\';\nchar aspas = \'\\\'\';\nchar barra = \'\\\\\';\nchar e = \'\\u00E9\';\nConsole.WriteLine(a);       // a\nConsole.WriteLine(aspas);   // \'\nConsole.WriteLine(e);       // é (se o terminal usar UTF-8)\n// char c = "a";           // ERRO: "a" é string\n// char d = \'ab\';          // ERRO: dois caracteres'
          ),
          sl(
            'Métodos de char: classificar e converter',
            'A struct char traz métodos estáticos para perguntar "que tipo de caractere é este?": char.IsDigit (dígito), char.IsLetter (letra, inclusive acentuada), char.IsLetterOrDigit (letra ou dígito; o sublinhado _ NÃO conta), char.IsWhiteSpace (espaço, tabulação, quebra de linha), char.IsUpper e char.IsLower (maiúscula e minúscula). Para converter a caixa existem char.ToUpper e char.ToLower. Como tudo em C# que parece "alterar" um valor básico, eles DEVOLVEM o novo caractere; o original não muda. Servem muito para validar entrada (por exemplo, uma senha precisa ter dígito e maiúscula).',
            'Console.WriteLine(char.IsDigit(\'5\'));         // True\nConsole.WriteLine(char.IsLetter(\'x\'));        // True\nConsole.WriteLine(char.IsLetterOrDigit(\'_\'));  // False\nConsole.WriteLine(char.IsWhiteSpace(\' \'));     // True\nConsole.WriteLine(char.IsUpper(\'a\'));          // False\nConsole.WriteLine(char.ToUpper(\'b\'));          // B\nConsole.WriteLine(char.ToLower(\'C\'));          // c'
          ),
          sl(
            'char também é número',
            'Cada char tem um código numérico (seu valor Unicode; para letras sem acento coincide com a tabela ASCII): \'A\' vale 65 e \'a\' vale 97. O cast (int) revela o código e o cast (char) faz o caminho inverso. Cuidado: ao fazer aritmética com char, o resultado é int, então \'a\' + 1 vale 98 (um número) e para voltar a ser caractere é preciso (char)(\'a\' + 1), que dá \'b\'. Um truque comum: \'7\' - \'0\' dá o número 7, pois os dígitos \'0\' a \'9\' têm códigos consecutivos. Já (int)\'7\' dá 55, o CÓDIGO do caractere, não o número 7.',
            'Console.WriteLine((int)\'A\');          // 65\nConsole.WriteLine((char)66);          // B\nConsole.WriteLine(\'a\' + 1);           // 98   (int!)\nConsole.WriteLine((char)(\'a\' + 1));   // b\nConsole.WriteLine(\'7\' - \'0\');         // 7\nConsole.WriteLine((int)\'7\');          // 55'
          ),
          sl(
            'Percorrer uma string: foreach e índice',
            'Uma string é uma sequência de chars. Você a percorre com foreach (que entrega cada char em ordem) ou com um for sobre o índice, lendo texto[i] (o primeiro é texto[0]). A leitura é permitida, mas a escrita não: texto[0] = \'x\'; não compila, pois strings são imutáveis. Padrão clássico: contar os caracteres que atendem a uma condição, como as vogais. Normalizar com char.ToLower antes de comparar evita tratar "A" e "a" de forma diferente. Note que "ã" e "ç" são letras, mas "ã" não está na lista "aeiou", então esta contagem simples não a considera vogal.',
            'string texto = "Programação";\nint vogais = 0;\nforeach (char c in texto)\n{\n    if ("aeiou".Contains(char.ToLower(c))) vogais++;\n}\nConsole.WriteLine(vogais);   // 4  (o, a, a, o)\n\nint letras = 0;\nfor (int i = 0; i < texto.Length; i++)\n{\n    if (char.IsLetter(texto[i])) letras++;\n}\nConsole.WriteLine(letras);   // 11'
          ),
          sl(
            'Inverter texto e palíndromos',
            'Como a string não muda, para inverter você a copia para um array de chars com ToCharArray(), inverte o array com Array.Reverse (que altera o array no lugar) e monta uma nova string com new string(array). Um palíndromo é um texto que se lê igual nos dois sentidos ("Ana", "radar"): inverta e compare com o original. Para ignorar a caixa, converta antes com ToLowerInvariant(). Em textos reais, normalmente se descartam também espaços e pontuação (usando char.IsLetterOrDigit), mas a ideia é sempre a mesma.',
            'char[] letras = "abc".ToCharArray();\nArray.Reverse(letras);\nConsole.WriteLine(new string(letras));   // cba\n\nstatic bool EhPalindromo(string s)\n{\n    char[] c = s.ToLowerInvariant().ToCharArray();\n    Array.Reverse(c);\n    return new string(c) == s.ToLowerInvariant();\n}\nConsole.WriteLine(EhPalindromo("Ana"));    // True\nConsole.WriteLine(EhPalindromo("casa"));   // False'
          ),
          sl(
            'Comparar sem cultura e dividir com Split',
            'Comparar ou normalizar texto técnico (comandos, extensões, identificadores) com regras de IDIOMA pode dar resultados diferentes conforme o computador (por exemplo, no turco o "i" maiúsculo tem regras próprias). Para resultado igual em qualquer máquina, use comparação ORDINAL (por código dos caracteres): string.Equals(a, b, StringComparison.OrdinalIgnoreCase) para ignorar a caixa, StringComparison.Ordinal para exigir igualdade exata, e ToUpperInvariant()/ToLowerInvariant() para converter sem cultura. Já Split aceita VÁRIOS separadores ao receber um array de chars; sem opções, separadores seguidos geram elementos vazios, e StringSplitOptions.RemoveEmptyEntries os descarta.',
            'Console.WriteLine("ABC".Equals("abc", StringComparison.OrdinalIgnoreCase)); // True\nConsole.WriteLine("Ana".Equals("ANA", StringComparison.Ordinal));          // False\nConsole.WriteLine("Ana".ToUpperInvariant());                               // ANA\n\nchar[] seps = { \',\', \';\' };\nstring[] a = "a,b;;c".Split(seps);\nstring[] b = "a,b;;c".Split(seps, StringSplitOptions.RemoveEmptyEntries);\nConsole.WriteLine(a.Length);   // 4  (um elemento vazio no meio)\nConsole.WriteLine(b.Length);   // 3'
          ),
          sl(
            'Unicode: Length não conta "letras"',
            'string.Length e os índices contam unidades UTF-16 (chars), NÃO o que uma pessoa enxerga como "um caractere". Símbolos fora do conjunto básico, como a maioria dos emojis, ocupam DUAS unidades, chamadas par substituto (surrogate pair): o emoji de rosto sorridente tem Length 2. Por isso, inverter ou fatiar um texto com emoji por chars pode separar o par e gerar lixo. Para contar o que se vê (elementos de texto), use new StringInfo(texto).LengthInTextElements, do namespace System.Globalization. Regra prática: para texto técnico (códigos, comandos) chars bastam; para texto livre de pessoas, desconfie de contagens por Length.',
            'using System.Globalization;\n\nstring rosto = "\\U0001F600";   // um emoji\nConsole.WriteLine(rosto.Length);                              // 2\nConsole.WriteLine(char.IsSurrogate(rosto[0]));                // True\nConsole.WriteLine(new StringInfo(rosto).LengthInTextElements); // 1\nConsole.WriteLine("Olá".Length);                              // 3'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que o código imprime?\nConsole.WriteLine(\'a\' + 1);', 'b', [
          'b',
          '98',
          'a1',
          'Erro de compilação'
        ], 'A aritmética com char resulta em int: \'a\' vale 97, então 97 + 1 = 98. Para obter \'b\' seria preciso o cast (char)(\'a\' + 1).'),
        mcq('q2', 'Qual destas declarações NÃO compila?', 'd', [
          'char a = \'x\';',
          'char b = \'\\n\';',
          'char c = \'\\u00E9\';',
          'char d = "x";'
        ], 'Aspas duplas criam uma string, e uma string não cabe em um char. Os literais com aspas simples (inclusive escapes como \\n e \\u00E9) são válidos.'),
        mcq('q3', 'O que o código imprime?\nstring texto = "Programação";\nint vogais = 0;\nforeach (char c in texto)\n{\n    if ("aeiou".Contains(char.ToLower(c))) vogais++;\n}\nConsole.WriteLine(vogais);', 'a', [
          '4',
          '3',
          '5',
          '11'
        ], 'As vogais de "aeiou" presentes são o, a, a e o (4). O "ã" não está em "aeiou", e 11 é o total de letras do texto.'),
        fill('q4', 'Complete com o método de char que testa se o caractere é um dígito:', 'Console.WriteLine(char.___(\'7\'));   // True', ['IsDigit'], 'char.IsDigit devolve true para dígitos. Há ainda IsLetter, IsLetterOrDigit, IsWhiteSpace, IsUpper e IsLower.'),
        mcq('q5', 'O que o código imprime?\nchar[] letras = "abc".ToCharArray();\nArray.Reverse(letras);\nConsole.WriteLine(new string(letras));', 'c', [
          'abc',
          'System.Char[]',
          'cba',
          'Erro de compilação'
        ], 'Array.Reverse inverte o array no lugar e new string(array) monta uma nova string a partir dos chars: "cba".'),
        mcq('q6', 'Quantos elementos tem o resultado?\nvar partes = "a,b;;c".Split(new[] { \',\', \';\' }, StringSplitOptions.RemoveEmptyEntries);\nConsole.WriteLine(partes.Length);', 'b', [
          '4',
          '3',
          '5',
          '2'
        ], 'Os separadores são , e ;. Os pedaços são "a", "b", "" e "c"; RemoveEmptyEntries descarta o vazio, restando 3. Sem a opção seriam 4.'),
        mcq('q7', 'O que o código imprime?\nstring emoji = "\\U0001F600";   // um emoji de rosto\nConsole.WriteLine(emoji.Length);', 'd', [
          '1',
          '4',
          '3',
          '2'
        ], 'Length conta unidades UTF-16. O emoji ocupa um par substituto, ou seja, duas unidades. LengthInTextElements de StringInfo contaria 1.'),
        fill('q8', 'Complete com a opção que compara ignorando a caixa SEM regras de cultura (comparação ordinal):', 'Console.WriteLine("ABC".Equals("abc", StringComparison.___));   // True', ['OrdinalIgnoreCase'], 'StringComparison.OrdinalIgnoreCase compara por código de caractere, ignorando maiúsculas e minúsculas, e dá o mesmo resultado em qualquer máquina.')
      ]
    },
    {
      id: 'csb-06-console-entrada-saida',
      title: 'Entrada e saída no console',
      goal: 'Ler dados do usuário com segurança, convertê-los com TryParse e usar argumentos e códigos de saída.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Console.Write vs Console.WriteLine',
            'Console.Write escreve o texto e mantém o cursor na mesma linha; Console.WriteLine escreve e pula para a linha seguinte. Use Write para mostrar uma pergunta e deixar a resposta ao lado, e WriteLine para mensagens completas. Com WriteLine sem argumentos, você imprime uma linha em branco.',
            'Console.Write("Olá, ");\nConsole.Write("mundo");\nConsole.WriteLine("!");\nConsole.WriteLine("Fim");\n// Saída:\n// Olá, mundo!\n// Fim'
          ),
          sl(
            'Console.ReadLine devolve string que pode ser null',
            'Console.ReadLine() lê uma linha digitada pelo usuário (até Enter) e devolve uma string — SEMPRE texto, mesmo que a pessoa digite 42. Seu tipo de retorno é string? (aceita null): ele devolve null quando a entrada acaba (por exemplo, Ctrl+Z no Windows, Ctrl+D no Linux ou quando a entrada vem de um arquivo). Por isso, valide antes de usar. Nunca confie em dados vindos do usuário: ele pode digitar vazio, espaços ou algo inesperado.',
            'Console.Write("Seu nome: ");\nstring? nome = Console.ReadLine();\nif (string.IsNullOrWhiteSpace(nome))\n{\n    Console.WriteLine("Nome inválido.");\n    return;\n}\nConsole.WriteLine($"Olá, {nome.Trim()}!");\n// Digitando Ana Exemplo -> Saída: Olá, Ana Exemplo!'
          ),
          sl(
            'Console.ReadKey',
            'Console.ReadKey() lê UMA tecla, sem esperar Enter, e devolve um ConsoleKeyInfo (com KeyChar, o caractere, e Key, a tecla). Com ReadKey(true) a tecla NÃO é exibida na tela ("intercept"): útil em menus e em pausas ("pressione qualquer tecla"). Funciona apenas com um terminal interativo; se a entrada estiver redirecionada de um arquivo, pode falhar. Para senhas, nunca exiba o que a pessoa digita e nunca registre a senha em logs.',
            'Console.Write("Continuar? (s/n) ");\nConsoleKeyInfo tecla = Console.ReadKey(true);\nConsole.WriteLine();\nif (tecla.KeyChar == \'s\')\n{\n    Console.WriteLine("Seguindo...");\n}'
          ),
          sl(
            'Parse e TryParse: de texto para número',
            'Como ReadLine devolve texto, para fazer contas é preciso converter. int.Parse(texto) converte, mas LANÇA exceção (FormatException) se o texto não for um número válido. int.TryParse(texto, out int valor) NÃO lança: devolve true/false indicando se deu certo e, se deu, entrega o número na variável do out. Para entrada de usuário, prefira SEMPRE TryParse e peça de novo quando falhar. Em caso de falha, o valor do out fica 0.',
            'int n = int.Parse("42");\nConsole.WriteLine(n + 1);                  // 43\nbool ok = int.TryParse("abc", out int r);\nConsole.WriteLine($"{ok} {r}");            // False 0\n\nint idade;\nwhile (true)\n{\n    Console.Write("Idade: ");\n    if (int.TryParse(Console.ReadLine(), out idade) && idade >= 0) break;\n    Console.WriteLine("Valor inválido, tente de novo.");\n}'
          ),
          sl(
            'Cultura e separador decimal',
            'Números com casa decimal dependem da CULTURA (idioma e região): no Brasil (pt-BR) escreve-se 3,5; na cultura invariante e em muitos países, 3.5. double.Parse("3,5") usa a cultura do computador onde o programa roda, então o mesmo programa pode se comportar diferente em máquinas diferentes. Regra: para dados de arquivos, APIs e protocolos use CultureInfo.InvariantCulture (comportamento fixo); para entrada digitada por pessoas, use a cultura delas. CultureInfo fica no namespace System.Globalization.',
            'using System.Globalization;\n\ndouble x = double.Parse("3.5", CultureInfo.InvariantCulture);\nConsole.WriteLine(x + 1);   // Saída: 4.5\n\ndouble y = 3.5;\nConsole.WriteLine(y.ToString(CultureInfo.GetCultureInfo("pt-BR")));  // Saída: 3,5\nConsole.WriteLine(y.ToString(CultureInfo.InvariantCulture));        // Saída: 3.5'
          ),
          sl(
            'Argumentos de linha de comando e códigos de saída',
            'Em top-level statements existe a variável implícita "args", um array de strings com os argumentos passados ao programa. Com dotnet run, tudo após "--" vai para o programa: "dotnet run -- Ana 3" faz args ser { "Ana", "3" } e args.Length valer 2. Sempre confira args.Length antes de acessar args[0] e valide o conteúdo. Não passe senhas por argumentos (ficam visíveis na lista de processos). Ao terminar, o programa devolve um código de saída: 0 significa sucesso e qualquer outro valor significa erro; scripts e pipelines usam esse número. Em top-level statements, "return 1;" define o código (todos os return precisam devolver int se um deles devolve).',
            'if (args.Length < 1)\n{\n    Console.WriteLine("Uso: dotnet run -- <nome>");\n    return 1;          // código de saída 1 = erro\n}\nConsole.WriteLine($"Olá, {args[0]}!");\nreturn 0;              // 0 = sucesso\n// dotnet run -- Ana   -> Saída: Olá, Ana!'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que o código imprime?\nConsole.Write("A");\nConsole.Write("B");\nConsole.WriteLine("C");\nConsole.WriteLine("D");', 'c', [
          'A, B, C e D, cada um em uma linha',
          'ABCD em uma única linha',
          'ABC em uma linha e D na linha seguinte',
          'Apenas ABC'
        ], 'Write não pula linha; só o WriteLine pula. A, B e C ficam juntos e D vai para a linha seguinte.'),
        mcq('q2', 'Qual é o tipo de retorno de Console.ReadLine() e o que isso implica?', 'a', [
          'string? — sempre texto, e pode ser null quando a entrada acaba; convém validar',
          'int — o número digitado',
          'string — nunca pode ser null',
          'char — apenas a primeira letra'
        ], 'ReadLine devolve string? (texto ou null no fim da entrada). Para números é preciso converter.'),
        mcq('q3', 'O que o código imprime?\nbool ok = int.TryParse("12x", out int n);\nConsole.WriteLine($"{ok} {n}");', 'd', [
          'True 12',
          'True 0',
          'Lança FormatException',
          'False 0'
        ], 'TryParse não lança exceção: devolve false e coloca 0 na variável do out.'),
        fill('q4', 'Complete com o método que converte sem lançar exceção e devolve bool:', 'if (int.___(texto, out int n)) { Console.WriteLine(n); }', ['TryParse'], 'int.TryParse devolve true/false e entrega o valor pelo parâmetro out; é o ideal para entrada de usuário.'),
        mcq('q5', 'O que muda ao usar Console.ReadKey(true) em vez de Console.ReadKey()?', 'b', [
          'A tecla é lida duas vezes',
          'A tecla pressionada não é exibida na tela',
          'O programa espera o usuário digitar Enter',
          'O programa lê uma linha inteira'
        ], 'O argumento true (intercept) lê a tecla sem ecoá-la no console; ReadKey não precisa de Enter.'),
        mcq('q6', 'Com "dotnet run -- Ana 3", quais são args.Length e args[0]?', 'c', [
          '1 e "Ana 3"',
          '3 e "dotnet"',
          '2 e "Ana"',
          '0 e null'
        ], 'Os argumentos depois de -- viram o array args: { "Ana", "3" }, tamanho 2, primeiro elemento "Ana" (ambos string).'),
        mcq('q7', 'Por convenção, o que significa um programa terminar com código de saída 0?', 'd', [
          'Que ocorreu um erro grave',
          'Que o programa não executou',
          'Que o usuário cancelou',
          'Que terminou com sucesso; valores diferentes de 0 indicam erro'
        ], 'Scripts e pipelines tratam 0 como sucesso e qualquer outro valor como falha.'),
        fill('q8', 'Complete para ler um número com ponto decimal de forma independente da cultura:', 'double.Parse("3.5", CultureInfo.___)', ['InvariantCulture'], 'CultureInfo.InvariantCulture fixa o formato (ponto decimal), útil para dados de arquivos e APIs.')
      ]
    },
    {
      id: 'csb-37-console-ferramentas-linha-comando',
      title: 'Programas de console como ferramentas de linha de comando',
      goal: 'Escrever programas de console que validam argumentos, separam saída e erro, devolvem códigos de saída e lidam com entrada padrão e segredos.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Argumentos: valide número e formato',
            'Uma ferramenta de linha de comando recebe parâmetros em args (um array de strings). Aspas no terminal agrupam: com dotnet run -- "Ana Souza" 3, args tem 2 elementos ("Ana Souza" e "3"). Todo argumento é TEXTO não confiável: confira args.Length, converta com TryParse, limite o intervalo (por exemplo, de 1 a 100) e rejeite o que não faz sentido. Nunca monte caminhos de arquivo ou comandos direto a partir de args sem validar. Uma boa mensagem de erro diz o que deu errado e como usar o programa.',
            'if (args.Length != 2 || !int.TryParse(args[1], out int vezes) || vezes < 1 || vezes > 100)\n{\n    Console.Error.WriteLine("Uso: dotnet run -- <nome> <vezes 1..100>");\n    return 2;\n}\nstring nome = args[0];\nfor (int i = 0; i < vezes; i++) Console.WriteLine($"Oi, {nome}!");\nreturn 0;'
          ),
          sl(
            'stdout e stderr: Console.Out vs Console.Error',
            'O programa tem DUAS saídas de texto: a saída padrão (stdout, Console.Out, usada por Console.WriteLine), para os RESULTADOS, e a saída de erro (stderr, Console.Error), para mensagens de erro e diagnóstico. Separar importa porque, ao redirecionar ou encadear programas, só o stdout vira dado: se um aviso entrasse junto no mesmo fluxo, ele contaminaria o arquivo ou o próximo programa. No terminal as duas aparecem na tela, então a diferença só se nota ao redirecionar. Atenção à privacidade: nunca escreva senhas, tokens ou dados pessoais em stdout ou stderr; essa saída costuma ser capturada em logs.',
            'Console.WriteLine("resultado: 42");            // stdout: o dado\nConsole.Error.WriteLine("Arquivo não encontrado: dados.csv"); // stderr: o erro\n\n// Mensagem útil: diz O QUÊ falhou e COMO resolver\nConsole.Error.WriteLine("Informe um número entre 1 e 100.");'
          ),
          sl(
            'Código de saída e Ctrl+C',
            'Ao terminar, o programa devolve um código de saída (um inteiro) a quem o chamou. Por convenção, 0 é sucesso e qualquer outro valor é erro (muitas ferramentas usam 1 para erro geral e 2 para uso incorreto). Em top-level statements ou em Main com retorno int, "return n;" define o código. Environment.Exit(n) encerra o processo imediatamente com o código n, sem executar o restante do programa. Já Ctrl+C interrompe o programa por padrão; com o evento Console.CancelKeyPress você pode interceptá-lo (e.Cancel = true evita o término imediato), por exemplo, para fechar arquivos e sair com educação.',
            'Console.CancelKeyPress += (sender, e) =>\n{\n    e.Cancel = true;   // não encerra na hora\n    Console.Error.WriteLine("Cancelado pelo usuário.");\n};\n\nConsole.WriteLine("A");\nEnvironment.Exit(3);   // encerra aqui, com código 3\nConsole.WriteLine("B"); // nunca executa\n// Saída: A   (código de saída 3)'
          ),
          sl(
            'Redirecionamento: >, 2> e |',
            'No terminal, você controla para onde vão as saídas. O operador > envia o stdout para um arquivo; 2> envia o stderr (o número 2 identifica o fluxo de erro); e | (pipe) liga o stdout de um programa à ENTRADA do próximo. Esses três funcionam igual no PowerShell e no bash (Linux/macOS), o que torna os programas de console fáceis de combinar. Lembre que o arquivo de saída pode conter dados sensíveis: não o deixe em pasta pública nem o versione no git.',
            '# só o stdout vai para o arquivo; os erros continuam na tela\ndotnet run -- Ana 2 > saida.txt\n\n# só o stderr vai para o arquivo\ndotnet run -- Ana x 2> erros.txt\n\n# o stdout de um programa vira a entrada do outro\ndotnet run -- Ana 3 | sort'
          ),
          sl(
            'Ler a entrada padrão (stdin)',
            'Console.ReadLine() lê do teclado, mas também de um pipe ou de um arquivo redirecionado, e devolve null quando a entrada ACABA. Assim, um filtro lê linha por linha com um laço até null. Console.IsInputRedirected diz se a entrada vem de pipe/arquivo (true) ou do teclado (false), útil para não ficar esperando digitação sem querer. Console.In é o leitor do stdin (por exemplo, Console.In.ReadToEnd() lê tudo de uma vez). Trate a entrada como não confiável: valide cada linha e não presuma tamanho ou formato.',
            'int linhas = 0;\nwhile (Console.ReadLine() != null)\n{\n    linhas++;\n}\nConsole.WriteLine(linhas);\n\n# bash:        printf \'x\\ny\\nz\\n\' | dotnet run     -> 3\n# PowerShell:  "x","y","z" | dotnet run           -> 3'
          ),
          sl(
            'dotnet run, dotnet watch e launchSettings.json',
            'Lembre: os argumentos do SEU programa vêm depois de "--" em dotnet run -- ...; sem o --, o dotnet pode tentar interpretá-los como opções dele próprio. Durante o desenvolvimento, dotnet watch run executa o programa e o recompila e reinicia sozinho quando você salva um arquivo. Em Properties/launchSettings.json ficam os PERFIS de execução usados pelo dotnet run e pelas IDEs: cada perfil pode definir, por exemplo, commandLineArgs (os argumentos a passar) e variáveis de ambiente. Como esse arquivo costuma ir para o controle de versão, nunca coloque nele senhas, tokens ou chaves.',
            'dotnet run -- Ana 2     # argumentos do programa depois de --\ndotnet watch run         # recarrega ao salvar o código\n\n// Properties/launchSettings.json (visão geral)\n{\n  "profiles": {\n    "Ola": {\n      "commandName": "Project",\n      "commandLineArgs": "Ana 2"\n    }\n  }\n}'
          ),
          sl(
            'Senhas e segredos no console',
            'Para ler uma senha, não use ReadLine, que mostra cada letra na tela. Use Console.ReadKey(true): o true impede o eco; você acumula as teclas até Enter (e trata Backspace). Boas práticas: não imprima a senha, não a registre em log, não a receba por argumento (aparece na lista de processos e no histórico do terminal) nem a deixe no código-fonte; para segredos de execução, use variáveis de ambiente ou um cofre de segredos. Além disso, evite escrever dados pessoais (CPF, e-mail, nome completo) em mensagens de erro e logs: registre só o necessário.',
            'using System.Text;\n\nConsole.Write("Senha: ");\nvar senha = new StringBuilder();\nConsoleKeyInfo tecla;\nwhile ((tecla = Console.ReadKey(true)).Key != ConsoleKey.Enter)\n{\n    if (tecla.Key == ConsoleKey.Backspace && senha.Length > 0) senha.Length--;\n    else if (!char.IsControl(tecla.KeyChar)) senha.Append(tecla.KeyChar);\n}\nConsole.WriteLine();\n// use a senha; NUNCA a imprima nem a registre'
          )
        ]
      },
      questions: [
        mcq('q1', 'Com o comando dotnet run -- "Ana Souza" (aspas duplas), quais são args.Length e args[0]?', 'd', [
          '2 e "Ana"',
          '1 e "Ana"',
          '0 e null',
          '1 e "Ana Souza"'
        ], 'As aspas agrupam as palavras em um único argumento: args tem 1 elemento, "Ana Souza".'),
        mcq('q2', 'Um programa escreve "ok" com Console.WriteLine e "falha" com Console.Error.WriteLine. O que acontece ao executar com 2> erros.txt?', 'b', [
          'erros.txt recebe "ok" e "falha", pois os dois vão ao mesmo destino',
          'erros.txt recebe só "falha", e "ok" continua aparecendo no terminal',
          'erros.txt recebe só "ok", e "falha" continua aparecendo no terminal',
          'Nada é gravado, pois o redirecionamento só funciona com ReadLine'
        ], '2> redireciona o stderr (Console.Error). O stdout continua indo para a tela.'),
        mcq('q3', 'O que acontece ao executar este código?\nConsole.WriteLine("A");\nEnvironment.Exit(3);\nConsole.WriteLine("B");', 'c', [
          'Imprime A e B e termina com código de saída 0',
          'Imprime A e B e termina com código de saída 3',
          'Imprime só A e termina na hora, com código de saída 3',
          'Erro de compilação, pois Exit exige um return em seguida'
        ], 'Environment.Exit encerra o processo imediatamente com o código dado; a linha do B nunca roda.'),
        fill('q4', 'Complete com o comando que executa e recarrega o programa automaticamente ao salvar o código:', 'dotnet ___ run', ['watch'], 'dotnet watch run recompila e reinicia o programa sempre que um arquivo é salvo.'),
        mcq('q5', 'A entrada vem de um pipe que envia as linhas x, y e z. O que o código imprime?\nint linhas = 0;\nwhile (Console.ReadLine() != null)\n{\n    linhas++;\n}\nConsole.WriteLine(linhas);', 'a', [
          '3',
          '4',
          '0',
          'Fica esperando para sempre'
        ], 'ReadLine devolve null quando o pipe termina; o laço conta as 3 linhas lidas e então para.'),
        mcq('q6', 'Em Properties/launchSettings.json, o que define o campo commandLineArgs de um perfil?', 'b', [
          'O código-fonte C# que o perfil compila antes de executar',
          'Os argumentos de linha de comando passados ao programa com esse perfil',
          'O limite máximo de memória que o programa pode usar na execução',
          'O nome do arquivo .csproj que o perfil precisa abrir e compilar'
        ], 'commandLineArgs informa os argumentos que o dotnet run (ou a IDE) envia ao programa quando esse perfil é usado.'),
        mcq('q7', 'Qual é a prática correta ao pedir uma senha no console?', 'd', [
          'Ler com ReadLine, pois é mais simples, e depois imprimir a senha para conferência',
          'Receber a senha como argumento, pois assim ela não precisa ser digitada',
          'Guardar a senha como constante no código para que o programa a reutilize sempre',
          'Ler com ReadKey(true), sem eco, e nunca imprimir nem registrar a senha em logs'
        ], 'ReadKey(true) lê sem ecoar. Senha não deve ir em argumentos, código-fonte, logs nem na tela.'),
        fill('q8', 'Complete com o evento que permite interceptar o Ctrl+C:', 'Console.___ += (s, e) => { e.Cancel = true; };', ['CancelKeyPress'], 'Console.CancelKeyPress é disparado no Ctrl+C; com e.Cancel = true o programa não encerra na hora.')
      ]
    },
    {
      id: 'csb-07-operadores',
      title: 'Operadores',
      goal: 'Usar operadores aritméticos, de atribuição, comparação, lógicos, ternário, ?? e ?. entendendo precedência e curto-circuito.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Operadores aritméticos e divisão inteira',
            'Os operadores são + (soma), - (subtração), * (multiplicação), / (divisão) e % (resto da divisão, "módulo"). ATENÇÃO: se os dois operandos são inteiros, a divisão é inteira: descarta a parte decimal (não arredonda, trunca). Basta um operando ser double ou decimal para a divisão ser decimal. O resto (%) é útil para saber se um número é par (n % 2 == 0). Dividir um int por zero lança DivideByZeroException; com double o resultado é infinito.',
            'Console.WriteLine(7 / 2);     // 3  (divisão inteira)\nConsole.WriteLine(7 % 2);     // 1  (resto)\nConsole.WriteLine(7 / 2.0);   // 3.5\nConsole.WriteLine(-7 / 2);    // -3 (trunca em direção a zero)'
          ),
          sl(
            'Incremento, decremento e atribuição composta',
            'x++ soma 1 a x e x-- subtrai 1. A posição importa quando o resultado é usado: no pós-fixo (x++) a expressão vale o valor ANTIGO e depois incrementa; no pré-fixo (++x) incrementa primeiro e a expressão vale o valor NOVO. Atribuição composta resume "x = x op valor": +=, -=, *=, /=, %=. Em uma linha isolada, x++ e ++x equivalem.',
            'int i = 5;\nint a = i++;   // a recebe 5, depois i vira 6\nint b = ++i;   // i vira 7, depois b recebe 7\nConsole.WriteLine($"{a} {b} {i}");   // Saída: 5 7 7\n\nint x = 10;\nx += 3;   // x = x + 3\nx *= 2;   // x = x * 2\nConsole.WriteLine(x);   // Saída: 26'
          ),
          sl(
            'Comparação e operadores lógicos com curto-circuito',
            'Comparação: == (igual), != (diferente), <, >, <=, >=; o resultado é bool. Cuidado: = atribui, == compara. Lógicos: && (E: ambos verdadeiros), || (OU: pelo menos um) e ! (NÃO, inverte). && e || fazem CURTO-CIRCUITO: se o resultado já está decidido pelo lado esquerdo, o direito nem é avaliado. Isso permite escrever "x != 0 && 10 / x > 1" sem risco de dividir por zero.',
            'int x = 0;\nbool r = x != 0 && 10 / x > 1;   // lado direito não é avaliado\nConsole.WriteLine(r);              // Saída: False\nConsole.WriteLine(!(3 > 5));       // Saída: True\nConsole.WriteLine(3 > 1 || 1 / x > 0);  // True: || já decidiu'
          ),
          sl(
            '& e | lógicos vs bit a bit (visão geral)',
            'Os operadores & e | também existem. Com valores bool, são o E e o OU SEM curto-circuito: os dois lados são sempre avaliados. Com inteiros, atuam bit a bit: & (E), | (OU), ^ (OU exclusivo) e os deslocamentos << e >> operam sobre os bits dos números. Bit a bit é usado em flags, permissões e baixo nível; no dia a dia de condições, use && e ||.',
            'int x = 0;\n// bool r = (x != 0) & (10 / x > 1);   // lança DivideByZeroException!\nConsole.WriteLine(5 & 3);    // 1  (101 & 011 = 001)\nConsole.WriteLine(5 | 3);    // 7  (101 | 011 = 111)\nConsole.WriteLine(1 << 3);   // 8  (desloca 3 bits)'
          ),
          sl(
            'Ternário ?:, ?? e ?.',
            'O operador ternário "condição ? valorSeVerdadeiro : valorSeFalso" escolhe entre dois valores numa expressão só. O operador ?? (coalescência nula) usa o valor da esquerda, a menos que seja null — aí usa o da direita; ??= atribui só se a variável for null. O operador ?. (acesso condicional a membro) só acessa o membro se o objeto não for null; se for, o resultado é null em vez de lançar NullReferenceException. Combine: nome?.Length ?? 0.',
            'int idade = 20;\nstring r = idade >= 18 ? "adulto" : "menor";\nConsole.WriteLine(r);                   // Saída: adulto\n\nstring? nome = null;\nConsole.WriteLine(nome ?? "sem nome");  // Saída: sem nome\nConsole.WriteLine(nome?.Length ?? 0);   // Saída: 0\nnome ??= "Visitante";\nConsole.WriteLine(nome);                // Saída: Visitante'
          ),
          sl(
            'Precedência e parênteses',
            'Quando há vários operadores, a precedência define quem é calculado primeiro: multiplicação, divisão e resto antes de soma e subtração; comparações antes de &&; && antes de ||; o ! e o ++ antes de todos esses. Operadores de mesma precedência vão da esquerda para a direita. Em caso de dúvida, use parênteses: eles têm prioridade máxima e deixam a intenção clara para quem lê.',
            'Console.WriteLine(2 + 3 * 4);     // 14\nConsole.WriteLine((2 + 3) * 4);   // 20\nbool a = true, b = false, c = true;\nConsole.WriteLine(a || b && !c);  // True  (&& antes de ||)'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que o código imprime?\nConsole.WriteLine(10 / 4 + 10 % 4);', 'a', [
          '4',
          '4.5',
          '2',
          '5'
        ], '10 / 4 é divisão inteira = 2 e 10 % 4 é o resto = 2; 2 + 2 = 4.'),
        mcq('q2', 'O que o código imprime?\nint i = 5;\nint a = i++;\nint b = ++i;\nConsole.WriteLine($"{a} {b} {i}");', 'c', [
          '6 7 7',
          '5 6 7',
          '5 7 7',
          '5 5 7'
        ], 'i++ devolve 5 e i vira 6; ++i incrementa para 7 e devolve 7. Então a=5, b=7, i=7.'),
        mcq('q3', 'O que acontece?\nint x = 0;\nbool r = (x != 0) & (10 / x > 1);', 'd', [
          'r recebe false sem erro, porque o primeiro lado já é falso',
          'Erro de compilação',
          'r recebe true',
          'Lança DivideByZeroException, porque & avalia os dois lados (sem curto-circuito)'
        ], 'O & lógico não faz curto-circuito: 10 / x é avaliado com x = 0. Com && o lado direito seria pulado.'),
        fill('q4', 'Complete com o operador de atribuição composta que soma 3 a x:', 'int x = 10;\nx ___ 3;   // x agora vale 13', ['+='], '+= é o mesmo que x = x + 3.'),
        mcq('q5', 'O que o código imprime?\nstring? s = null;\nConsole.WriteLine(s ?? "vazio");', 'b', [
          'Nada (linha em branco)',
          'vazio',
          'null',
          'Lança NullReferenceException'
        ], 'O operador ?? devolve o lado direito quando o esquerdo é null.'),
        mcq('q6', 'Qual é o valor de 2 + 3 * 4 - (1 + 1)?', 'a', [
          '12',
          '8',
          '18',
          '20'
        ], 'Parênteses primeiro: (1+1)=2. Depois 3*4=12. Então 2 + 12 - 2 = 12.'),
        mcq('q7', 'O que o código imprime?\nstring? t = null;\nConsole.WriteLine(t?.Length ?? -1);', 'd', [
          '0',
          'null',
          'Lança NullReferenceException',
          '-1'
        ], 't?.Length dá null (não lança exceção) e ?? troca o null por -1.'),
        fill('q8', 'Complete o operador ternário (símbolo que separa a condição do valor se verdadeiro):', 'string r = idade >= 18 ___ "adulto" : "menor";', ['?'], 'No ternário, "?" vem logo após a condição e ":" separa as duas opções.')
      ]
    },
    {
      id: 'csb-08-conversoes-tipos',
      title: 'Conversões de tipos',
      goal: 'Converter entre tipos com segurança: conversões implícitas e explícitas, Parse, TryParse, Convert, arredondamento e exceções.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Conversão implícita: sem perda de informação',
            'Uma conversão implícita acontece sozinha quando o tipo de destino comporta TODOS os valores do tipo de origem, então nada se perde: byte -> short -> int -> long, e int -> long -> float -> double ou decimal. O compilador não exige nenhuma sintaxe especial. Não há implícita de double para decimal nem de tipos maiores para menores.',
            'int i = 100;\nlong l = i;        // implícita: int cabe em long\ndouble d = i;      // implícita\ndecimal m = i;     // implícita\nConsole.WriteLine(d);   // Saída: 100'
          ),
          sl(
            'Conversão explícita (cast) e possível perda',
            'Quando pode haver perda (de double para int, de long para int), o compilador exige um cast explícito: o tipo entre parênteses antes do valor. Do double para int o cast TRUNCA: descarta as casas decimais, sem arredondar (e em direção a zero, então -3.99 vira -3). De long para int, se o valor não cabe, ocorre overflow: por padrão o valor "dá a volta"; dentro de checked(...) lança OverflowException.',
            'double d = 9.99;\nint n = (int)d;\nConsole.WriteLine(n);               // Saída: 9\nConsole.WriteLine((int)-3.99);      // Saída: -3\nlong grande = 3000000000L;\nConsole.WriteLine((int)grande);     // Saída: -1294967296 (deu a volta)\n// checked((int)grande) lançaria OverflowException'
          ),
          sl(
            'Math.Round e Convert: arredondar não é truncar',
            'Para ARREDONDAR, use Math.Round ou Convert. Por padrão o .NET usa o arredondamento do banqueiro: um valor exatamente no meio (x,5) vai para o número PAR mais próximo: 2.5 -> 2 e 3.5 -> 4. Para o arredondamento "escolar" (meio sobe), passe MidpointRounding.AwayFromZero. Math.Round(valor, casas) arredonda para N casas. Convert.ToInt32 de um double também arredonda (banqueiro). Convert.ToInt32("42") converte texto. Math.Floor e Math.Ceiling arredondam para baixo e para cima.',
            'Console.WriteLine(Math.Round(2.5));    // 2\nConsole.WriteLine(Math.Round(3.5));    // 4\nConsole.WriteLine(Math.Round(2.5, MidpointRounding.AwayFromZero));  // 3\nConsole.WriteLine(Math.Round(3.14159, 2));  // 3.14\nConsole.WriteLine(Convert.ToInt32(3.7));    // 4  (cast daria 3)\nConsole.WriteLine(Math.Ceiling(3.1));       // 4'
          ),
          sl(
            'Parse, TryParse e as exceções de conversão',
            'int.Parse e Convert.ToInt32 convertem texto, mas lançam exceção se não der: FormatException (o texto não é um número, como "abc"), OverflowException (o número não cabe no tipo, como "3000000000" em int) e, para casts de referência, InvalidCastException (o objeto não é do tipo pedido). TryParse evita exceção devolvendo bool e entregando o valor num parâmetro out: use quando o dado vem de fora (usuário, arquivo, rede). Exceções são para situações excepcionais, não para validar entrada comum.',
            'Console.WriteLine(int.TryParse("3000000000", out int a));  // False (não cabe)\nConsole.WriteLine(int.TryParse("123", out int b));         // True\n// int.Parse("abc");          // lança FormatException\n// int.Parse("3000000000");   // lança OverflowException'
          ),
          sl(
            'Boxing, unboxing, is e as (visão geral)',
            'object é o tipo base de tudo. Guardar um tipo de valor (como int) numa variável object é boxing: o valor é "embrulhado" num objeto no heap; extrair de volta com cast é unboxing, e exige o tipo EXATO original, senão lança InvalidCastException. Boxing tem custo de memória: evite em laços intensos. O operador is testa o tipo (e pode declarar uma variável: o is int k); o operador as tenta converter e devolve null se não der, sem lançar exceção (só para tipos de referência e anuláveis).',
            'object o = 42;               // boxing\nint n = (int)o;               // unboxing: 42\nstring? s = o as string;      // null: não é string, sem exceção\nif (o is int k) Console.WriteLine(k + 1);   // Saída: 43\n// string t = (string)o;      // lançaria InvalidCastException'
          ),
          sl(
            'Armadilha: divisão inteira antes da conversão',
            'Converter o RESULTADO não conserta uma conta já truncada: em "double r = 7 / 2;" a divisão é feita entre inteiros (resulta 3) e só depois o 3 vira 3.0. Converta um dos OPERANDOS antes: (double)7 / 2 (o cast vale só para o 7, e a divisão passa a ser decimal) ou use um literal decimal: 7 / 2.0. Para dinheiro, converta para decimal (m) em vez de double.',
            'double errado = 7 / 2;           // 3\ndouble certo1 = (double)7 / 2;   // 3.5\ndouble certo2 = 7 / 2.0;         // 3.5\nConsole.WriteLine($"{errado} {certo1} {certo2}");  // Saída: 3 3.5 3.5'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que acontece com este código?\nlong l = 10;\nint i = l;', 'd', [
          'Roda normalmente e i vale 10',
          'Lança OverflowException',
          'i vale 0',
          'Erro de compilação: long para int exige conversão explícita (cast)'
        ], 'Converter long em int pode perder informação, então o compilador exige o cast: int i = (int)l.'),
        mcq('q2', 'O que o código imprime?\nConsole.WriteLine((int)-3.99);', 'a', [
          '-3',
          '-4',
          '3',
          '-3.99'
        ], 'O cast para int trunca as casas decimais, em direção a zero: -3.99 vira -3.'),
        mcq('q3', 'O que o código imprime?\nConsole.WriteLine(Convert.ToInt32(3.5) + " " + Convert.ToInt32(2.5));', 'b', [
          '4 3',
          '4 2',
          '3 2',
          '3 3'
        ], 'Convert arredonda com o método do banqueiro: o meio vai para o par mais próximo (3.5 -> 4 e 2.5 -> 2).'),
        fill('q4', 'Complete o cast explícito para guardar um double em int:', 'double d = 9.99;\nint n = (___)d;   // n vale 9', ['int'], 'O cast (int) trunca a parte decimal: 9.99 vira 9.'),
        mcq('q5', 'O que o código imprime?\ndouble r = 7 / 2;\nConsole.WriteLine(r);', 'c', [
          '3.5',
          '4',
          '3',
          'Erro de compilação'
        ], '7 / 2 é divisão entre inteiros (= 3) feita ANTES de virar double. Use 7 / 2.0 ou (double)7 / 2 para obter 3.5.'),
        mcq('q6', 'Qual exceção int.Parse("abc") lança?', 'b', [
          'OverflowException',
          'FormatException',
          'InvalidCastException',
          'NullReferenceException'
        ], 'O texto não está no formato de número: FormatException. OverflowException seria para um número grande demais para caber.'),
        mcq('q7', 'O que acontece?\nobject o = "texto";\nint n = (int)o;', 'a', [
          'Lança InvalidCastException na execução (o objeto guardado é string, não int)',
          'n recebe 0',
          'Erro de compilação',
          'n recebe o tamanho do texto'
        ], 'O unboxing exige o tipo exato original. Como o objeto é uma string, ocorre InvalidCastException.'),
        fill('q8', 'Complete para arredondar 2.5 para 3 (meio sobe):', 'Math.___(2.5, MidpointRounding.AwayFromZero)', ['Round'], 'Math.Round com MidpointRounding.AwayFromZero faz o arredondamento "escolar"; sem ele, 2.5 viraria 2.')
      ]
    },
    {
      id: 'csb-09-condicionais',
      title: 'Condicionais',
      goal: 'Tomar decisões no código com if, switch, switch expression e pattern matching básico.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'if, else if e else',
            'if executa um bloco quando a condição é true. else if testa outra condição se as anteriores falharam, e else cobre o resto. As condições são avaliadas de cima para baixo e só o PRIMEIRO bloco verdadeiro roda. Em C#, a condição precisa ser um bool de verdade: não existe "verdadeiro" para números ou textos (if (x) com x int é erro de compilação; escreva if (x != 0)). Com um único comando, as chaves são opcionais, mas usá-las sempre evita bugs.',
            'int nota = 75;\nif (nota >= 90)\n{\n    Console.WriteLine("A");\n}\nelse if (nota >= 70)\n{\n    Console.WriteLine("B");\n}\nelse\n{\n    Console.WriteLine("C");\n}\n// Saída: B'
          ),
          sl(
            'switch clássico',
            'O switch compara uma expressão com vários valores fixos (case). Cada case termina com break (ou return): o C# NÃO permite "cair" para o case seguinte por esquecimento — isso é erro de compilação. Dois rótulos seguidos sem código entre eles compartilham o mesmo bloco. default cobre os demais valores. Serve bem quando há muitos valores discretos para um mesmo teste.',
            'int dia = 6;\nswitch (dia)\n{\n    case 6:\n    case 7:\n        Console.WriteLine("Fim de semana");\n        break;\n    case 1:\n        Console.WriteLine("Domingo");\n        break;\n    default:\n        Console.WriteLine("Dia útil");\n        break;\n}\n// Saída: Fim de semana'
          ),
          sl(
            'switch expression',
            'A switch expression é um switch que DEVOLVE um valor, em formato compacto: valor switch { padrão => resultado, ... }. As arms (braços) são testadas de cima para baixo e vale a primeira que casa. O descarte _ casa com qualquer coisa e faz o papel do default. Se nenhum braço casar, ocorre uma exceção em tempo de execução; o compilador avisa quando a expressão não é exaustiva, então inclua sempre o _.',
            'int dia = 3;\nstring nome = dia switch\n{\n    1 => "Domingo",\n    2 => "Segunda",\n    3 => "Terça",\n    _ => "Outro"\n};\nConsole.WriteLine(nome);   // Saída: Terça'
          ),
          sl(
            'Pattern matching básico: is, is not',
            'O operador is verifica tipo ou padrão. "o is string s" testa se o é string e, se for, declara a variável s já convertida. "is null" e "is not null" testam ausência de valor (preferíveis a == null). "is not" nega o padrão. Isso reduz casts manuais e é o jeito moderno de checar null.',
            'object o = "oi";\nif (o is string s && s.Length > 1)\n{\n    Console.WriteLine(s.ToUpper());   // Saída: OI\n}\nstring? t = null;\nConsole.WriteLine(t is not null);   // Saída: False\nConsole.WriteLine(t is null);       // Saída: True'
          ),
          sl(
            'Padrões relacionais e and, or, not',
            'Dentro de padrões você pode usar operadores relacionais (<, <=, >, >=) direto, e combinar com as palavras and, or e not (não são && e ||: valem só em padrões). "idade is >= 18 and < 65" testa uma faixa sem repetir a variável. "n is 1 or 2 or 3" testa vários valores. Em switch expressions, como as arms são testadas na ordem, os intervalos ficam curtos: depois de "< 13", o próximo "< 18" já implica 13 ou mais.',
            'int idade = 20;\nstring faixa = idade switch\n{\n    < 13 => "criança",\n    < 18 => "adolescente",\n    _ => "adulto"\n};\nConsole.WriteLine(faixa);                  // Saída: adulto\nConsole.WriteLine(idade is >= 18 and < 65); // Saída: True\nConsole.WriteLine(3 is 1 or 2 or 3);        // Saída: True'
          ),
          sl(
            'when e escolhendo a estrutura certa',
            'A cláusula when acrescenta uma condição extra a um padrão: "int n when n > 10". Se o when falhar, a próxima arm é tentada. Como escolher: if/else if para condições variadas, faixas e lógica composta; switch clássico para vários valores fixos executando blocos de comandos; switch expression quando a decisão PRODUZ um valor; padrões (is, and/or/not, when) para tipos, null e faixas. Escolha pela clareza.',
            'object valor = 5;\nstring r = valor switch\n{\n    int n when n > 10 => "grande",\n    int => "pequeno",\n    string => "texto",\n    _ => "outro"\n};\nConsole.WriteLine(r);   // Saída: pequeno'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que acontece com este código?\nint x = 1;\nif (x)\n{\n    Console.WriteLine("sim");\n}', 'b', [
          'Imprime sim, pois 1 é verdadeiro',
          'Erro de compilação: a condição precisa ser bool',
          'Imprime nada',
          'Lança exceção na execução'
        ], 'C# não trata números como verdadeiro/falso. Escreva if (x != 0) ou use um bool.'),
        mcq('q2', 'O que acontece neste switch clássico?\nswitch (n)\n{\n    case 1:\n        Console.WriteLine("um");\n    case 2:\n        Console.WriteLine("dois");\n        break;\n}', 'd', [
          'Imprime um e depois dois quando n é 1',
          'Imprime só um',
          'Imprime dois e depois um',
          'Erro de compilação: o case 1 não pode "cair" no case 2 sem break'
        ], 'Em C# é obrigatório terminar cada case com break, return ou similar; cair no próximo é erro.'),
        mcq('q3', 'O que o código imprime?\nint idade = 15;\nstring f = idade switch\n{\n    < 13 => "criança",\n    < 18 => "adolescente",\n    _ => "adulto"\n};\nConsole.WriteLine(f);', 'c', [
          'criança',
          'adulto',
          'adolescente',
          'Erro de compilação'
        ], 'As arms são testadas de cima para baixo: 15 não é < 13, mas é < 18, então "adolescente".'),
        fill('q4', 'Complete o padrão para testar a faixa de 18 a 64 anos:', 'bool ok = idade is >= 18 ___ < 65;', ['and'], 'Em padrões, "and" combina dois padrões que precisam ser verdadeiros ao mesmo tempo.'),
        mcq('q5', 'Qual estrutura é a mais indicada para MAPEAR um valor discreto em um resultado e guardar numa variável?', 'a', [
          'switch expression',
          'laço while',
          'comentário ///',
          'try/catch'
        ], 'A switch expression devolve um valor e é compacta para mapeamentos como número do dia -> nome do dia.'),
        mcq('q6', 'O que o código imprime?\nstring? s = null;\nConsole.WriteLine(s is not null);', 'b', [
          'True',
          'False',
          'null',
          'Lança NullReferenceException'
        ], 's é null, então "s is not null" é False. Nenhuma exceção ocorre.'),
        mcq('q7', 'O que o código imprime?\nobject v = 5;\nstring r = v switch\n{\n    int n when n > 10 => "grande",\n    int => "pequeno",\n    _ => "outro"\n};\nConsole.WriteLine(r);', 'd', [
          'grande',
          'outro',
          'Erro de compilação',
          'pequeno'
        ], '5 é int, mas o when n > 10 falha; a próxima arm (int) casa, resultando em "pequeno".'),
        fill('q8', 'Complete com o rótulo que cobre os demais valores no switch clássico:', 'switch (dia)\n{\n    case 1:\n        Console.WriteLine("Domingo");\n        break;\n    ___:\n        Console.WriteLine("Outro");\n        break;\n}', ['default'], 'default é executado quando nenhum case casa.')
      ]
    },
    {
      id: 'csb-10-lacos',
      title: 'Laços',
      goal: 'Repetir instruções com for, foreach, while e do-while, controlando o fluxo com break e continue.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'for: repetição com contador',
            'O for tem três partes entre parênteses: inicialização (roda uma vez), condição (testada antes de cada volta) e iterador (roda depois de cada volta). Use quando você sabe quantas vezes repetir. A variável declarada na inicialização só existe dentro do laço. Cuidado com o limite: i < 3 repete com 0, 1, 2 (três voltas), enquanto i <= 3 repete quatro vezes.',
            'for (int i = 1; i <= 3; i++)\n{\n    Console.WriteLine($"Volta {i}");\n}\n// Saída:\n// Volta 1\n// Volta 2\n// Volta 3'
          ),
          sl(
            'foreach: percorrer coleções',
            'foreach percorre cada elemento de uma coleção (array, lista, string...) sem se preocupar com índices: mais simples e seguro. A variável do laço é somente leitura: você não pode atribuir um novo valor a ela. Se precisar do índice ou de alterar elementos de um array, use for. Uma string pode ser percorrida caractere a caractere (char).',
            'string[] frutas = { "maçã", "uva" };\nforeach (string fruta in frutas)\n{\n    Console.WriteLine(fruta);\n}\nforeach (char c in "abc")\n{\n    Console.Write(c + "-");\n}\n// Saída:\n// maçã\n// uva\n// a-b-c-'
          ),
          sl(
            'while e do-while',
            'while testa a condição ANTES de cada volta: se já começa falsa, o corpo nunca executa. do-while testa DEPOIS: o corpo executa pelo menos uma vez, mesmo que a condição seja falsa desde o início (útil para menus e leitura de entrada). Em ambos, algo dentro do corpo precisa eventualmente tornar a condição falsa, senão o laço nunca termina. Note o ponto e vírgula ao final do do-while.',
            'int n = 3;\nwhile (n > 0)\n{\n    Console.Write(n + " ");\n    n--;\n}\n// Saída: 3 2 1\n\nint k = 10;\ndo\n{\n    Console.WriteLine("roda uma vez");\n} while (k < 5);\n// Saída: roda uma vez'
          ),
          sl(
            'break e continue',
            'break encerra o laço imediatamente, saindo dele. continue interrompe só a volta atual e pula para a próxima. Ambos valem para for, foreach, while e do-while. Num laço aninhado, afetam apenas o laço mais interno onde estão. Use com moderação: muitos break/continue podem deixar o fluxo confuso.',
            'for (int i = 1; i <= 5; i++)\n{\n    if (i == 2) continue;   // pula o 2\n    if (i == 4) break;      // para no 4\n    Console.Write(i + " ");\n}\n// Saída: 1 3'
          ),
          sl(
            'Laços aninhados e laço infinito',
            'Um laço dentro de outro executa o interno completo a cada volta do externo: 2 voltas externas x 3 internas = 6 execuções. O while (true) cria um laço infinito de propósito, que só termina com break (ou return): padrão comum em menus que repetem até o usuário escolher sair e em programas que ficam esperando eventos. Sem um break alcançável, o programa trava: pare com Ctrl+C no terminal.',
            'for (int i = 1; i <= 2; i++)\n{\n    for (int j = 1; j <= 3; j++)\n    {\n        Console.Write($"{i}{j} ");\n    }\n}\n// Saída: 11 12 13 21 22 23\n\nwhile (true)\n{\n    Console.Write("Sair? (s) ");\n    if (Console.ReadLine() == "s") break;\n}'
          ),
          sl(
            'Enumerable.Range e coleção modificada no foreach',
            'Enumerable.Range(início, quantidade) gera uma sequência de números inteiros; o SEGUNDO argumento é a QUANTIDADE, não o final: Range(5, 3) gera 5, 6, 7. Fica em System.Linq, já incluído nos implicit usings. Outra armadilha: dentro de um foreach, adicionar ou remover itens da coleção percorrida lança InvalidOperationException ("Collection was modified"). Para remover durante a varredura, use um for de trás para frente ou uma coleção auxiliar.',
            'foreach (int n in Enumerable.Range(5, 3))\n{\n    Console.Write(n + " ");\n}\n// Saída: 5 6 7\n\nvar lista = new List<int> { 1, 2, 3 };\n// foreach (var x in lista) { lista.Remove(x); }  // lança InvalidOperationException\nfor (int i = lista.Count - 1; i >= 0; i--)\n{\n    if (lista[i] % 2 == 1) lista.RemoveAt(i);\n}\nConsole.WriteLine(lista.Count);   // Saída: 1'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que o código imprime?\nfor (int i = 0; i < 3; i++)\n{\n    Console.Write(i + " ");\n}', 'a', [
          '0 1 2',
          '1 2 3',
          '0 1 2 3',
          '1 2'
        ], 'Começa em 0 e roda enquanto i < 3: três voltas com 0, 1 e 2.'),
        mcq('q2', 'O que o código imprime?\nint k = 10;\ndo\n{\n    Console.Write("x");\n} while (k < 5);', 'c', [
          'Nada',
          'xxxxx',
          'x',
          'Erro de compilação'
        ], 'O do-while testa a condição depois: o corpo roda ao menos uma vez.'),
        mcq('q3', 'O que o código imprime?\nfor (int i = 1; i <= 5; i++)\n{\n    if (i == 2) continue;\n    if (i == 4) break;\n    Console.Write(i + " ");\n}', 'd', [
          '1 2 3',
          '1 3 4',
          '1 2 3 4 5',
          '1 3'
        ], 'continue pula o 2; break encerra ao chegar no 4 (antes de imprimir). Imprime só 1 e 3.'),
        fill('q4', 'Complete com a palavra-chave do laço com contador:', '___ (int i = 0; i < 5; i++)\n{\n    Console.WriteLine(i);\n}', ['for'], 'O for reúne inicialização, condição e iterador num único cabeçalho.'),
        mcq('q5', 'O que acontece?\nvar lista = new List<int> { 1, 2, 3 };\nforeach (var x in lista)\n{\n    lista.Remove(x);\n}', 'b', [
          'Remove todos os itens normalmente',
          'Lança InvalidOperationException, pois a coleção foi modificada durante o foreach',
          'Erro de compilação',
          'Remove só o primeiro e continua sem erro'
        ], 'Alterar a coleção enquanto o foreach a percorre invalida o enumerador e lança InvalidOperationException.'),
        mcq('q6', 'O que o código imprime?\nforeach (int n in Enumerable.Range(5, 3))\n{\n    Console.Write(n + " ");\n}', 'a', [
          '5 6 7',
          '5 6 7 8',
          '3 4 5',
          '5 6'
        ], 'Range(início, quantidade): começa em 5 e gera 3 números: 5, 6 e 7.'),
        mcq('q7', 'O que o código imprime?\nfor (int i = 1; i <= 2; i++)\n{\n    for (int j = 1; j <= 3; j++)\n    {\n        if (j == 2) break;\n        Console.Write($"{i}{j} ");\n    }\n}', 'c', [
          '11 ',
          '11 12 13 21 22 23',
          '11 21 ',
          '11 12 '
        ], 'O break encerra só o laço interno: em cada volta externa imprime só j = 1. Resultado: 11 e 21.'),
        fill('q8', 'Complete a condição para um laço infinito intencional:', 'while (___)\n{\n    if (pronto) break;\n}', ['true'], 'while (true) repete para sempre até um break ou return.')
      ]
    },
    {
      id: 'csb-11-metodos',
      title: 'Métodos',
      goal: 'Escrever e chamar métodos: parâmetros, retorno, sobrecarga, params, ref/out/in, funções locais e membros estáticos.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Assinatura, parâmetros e retorno',
            'Um método é um bloco de código com nome, reutilizável. A assinatura tem: tipo de retorno, nome, e parâmetros (tipo e nome, entre parênteses). O tipo de retorno diz o que o método devolve com return; void significa "não devolve nada". Os valores passados na chamada são os argumentos. Em arquivos com top-level statements, métodos escritos junto das instruções viram funções locais (podem até vir depois do uso, mas não aceitam sobrecarga); em programas clássicos, e quando você precisa de sobrecarga, os métodos ficam dentro de uma classe.',
            'static int Somar(int a, int b)\n{\n    return a + b;\n}\n\nstatic void Saudar(string nome)\n{\n    Console.WriteLine($"Olá, {nome}!");\n}\n\nConsole.WriteLine(Somar(2, 3));   // Saída: 5\nSaudar("Ana Exemplo");            // Saída: Olá, Ana Exemplo!'
          ),
          sl(
            'Sobrecarga, parâmetros opcionais e nomeados',
            'Sobrecarga (overload): vários métodos com o MESMO nome e parâmetros diferentes (quantidade ou tipos); o compilador escolhe o que melhor casa com os argumentos. Só mudar o tipo de retorno não basta. Um parâmetro opcional tem valor padrão (= valor) e pode ser omitido; os opcionais vêm depois dos obrigatórios. Argumentos nomeados (nome: valor) permitem passar em qualquer ordem e deixam a chamada legível.',
            'Console.WriteLine(Mat.Somar(1, 2));       // 3    (versão int)\nConsole.WriteLine(Mat.Somar(1.5, 2));     // 3.5  (versão double)\nConsole.WriteLine(Mat.Formatar("oi"));    // oi\nConsole.WriteLine(Mat.Formatar("oi", maiusculo: true));   // OI\n\nstatic class Mat\n{\n    public static int Somar(int a, int b) => a + b;\n    public static double Somar(double a, double b) => a + b;\n    public static string Formatar(string txt, bool maiusculo = false)\n        => maiusculo ? txt.ToUpper() : txt;\n}'
          ),
          sl(
            'params: quantidade variável de argumentos',
            'A palavra params antes de um parâmetro de array permite chamar o método com quantos argumentos quiser, separados por vírgula (inclusive zero), sem criar o array na mão. Só pode haver um params por método, e ele deve ser o último parâmetro. Dentro do método, é um array normal.',
            'static int Soma(params int[] numeros)\n{\n    int total = 0;\n    foreach (int n in numeros) total += n;\n    return total;\n}\n\nConsole.WriteLine(Soma(1, 2, 3));   // Saída: 6\nConsole.WriteLine(Soma());          // Saída: 0'
          ),
          sl(
            'Expression-bodied e funções locais',
            'Quando o método é uma única expressão, pode-se usar o corpo de expressão: "=>" no lugar de chaves e return. Uma função local é um método declarado DENTRO de outro método e visível só ali: ótima para dividir uma tarefa em passos sem poluir a classe. Ela pode usar as variáveis do método que a contém.',
            'static int Dobro(int x) => x * 2;   // equivale a { return x * 2; }\n\nstatic string Descrever(int n)\n{\n    return $"{n} é {Paridade()}";\n\n    string Paridade() => n % 2 == 0 ? "par" : "ímpar";   // função local\n}\n\nConsole.WriteLine(Dobro(4));       // Saída: 8\nConsole.WriteLine(Descrever(7));   // Saída: 7 é ímpar'
          ),
          sl(
            'Passagem por valor, ref, out e in',
            'Por padrão, o argumento é passado POR VALOR: o método recebe uma cópia, e alterá-la não afeta a variável original. Com ref, o método recebe uma referência à variável de quem chamou e pode alterá-la (a variável precisa estar inicializada, e a palavra ref aparece na chamada). out é parecido, mas serve para DEVOLVER valores extras: o método é OBRIGADO a atribuir o parâmetro antes de retornar, e quem chama não precisa inicializá-lo (como em int.TryParse). in passa por referência somente leitura: evita copiar structs grandes e o método não pode modificá-lo.',
            'static void Dobrar(int x) { x *= 2; }\nstatic void DobrarRef(ref int x) { x *= 2; }\nstatic bool Dividir(int a, int b, out int resultado)\n{\n    if (b == 0) { resultado = 0; return false; }\n    resultado = a / b;\n    return true;\n}\n\nint n = 5;\nDobrar(n);\nConsole.WriteLine(n);          // Saída: 5  (cópia)\nDobrarRef(ref n);\nConsole.WriteLine(n);          // Saída: 10\nif (Dividir(10, 2, out int r)) Console.WriteLine(r);   // Saída: 5'
          ),
          sl(
            'Escopo e métodos estáticos',
            'Escopo é onde um nome vale: variáveis e parâmetros declarados num método (ou bloco) existem só ali e não podem ser usados antes de declarados nem depois do bloco. Um método static pertence à CLASSE e é chamado pelo nome dela (Calc.Dobro(4)); um método de instância (sem static) pertence a cada OBJETO e só é chamado por um objeto criado com new. Um método static não acessa membros de instância diretamente. Em arquivos com top-level statements, declarações de classes vêm depois das instruções.',
            'Console.WriteLine(Calc.Dobro(4));   // Saída: 8  (static: pela classe)\nvar c = new Calc();\nConsole.WriteLine(c.Triplo(4));     // Saída: 12 (instância: pelo objeto)\n\nclass Calc\n{\n    public static int Dobro(int x) => x * 2;\n    public int Triplo(int x) => x * 3;\n}'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que o código imprime?\nConsole.WriteLine(Mat.Somar(1.5, 2));\n\nstatic class Mat\n{\n    public static int Somar(int a, int b) => a + b;\n    public static double Somar(double a, double b) => a + b;\n}', 'c', [
          '3',
          'Erro: nomes de métodos duplicados',
          '3.5',
          '4'
        ], 'Com sobrecarga o compilador escolhe a versão aplicável: só a de double aceita 1.5. O 2 vira double e a soma é 3.5.'),
        mcq('q2', 'O que o código imprime?\nstatic string Saudar(string nome, string saudacao = "Olá") => $"{saudacao}, {nome}!";\nConsole.WriteLine(Saudar("Ana Exemplo"));', 'b', [
          'Ana Exemplo!',
          'Olá, Ana Exemplo!',
          'Erro: faltou o segundo argumento',
          ', Ana Exemplo!'
        ], 'O segundo parâmetro é opcional; ao omiti-lo, vale o padrão "Olá".'),
        mcq('q3', 'O que o código imprime?\nstatic void Dobrar(int x) { x *= 2; }\nstatic void DobrarRef(ref int x) { x *= 2; }\nint n = 5;\nDobrar(n);\nConsole.WriteLine(n);\nDobrarRef(ref n);\nConsole.WriteLine(n);', 'a', [
          '5 e depois 10',
          '10 e depois 20',
          '5 e depois 5',
          '10 e depois 10'
        ], 'Dobrar recebe uma cópia (n continua 5). DobrarRef altera a própria variável (n vira 10).'),
        fill('q4', 'Complete com a palavra-chave que permite um número variável de argumentos:', 'static int Soma(___ int[] numeros)', ['params'], 'params antes de um array permite chamar Soma(1, 2, 3) sem criar o array manualmente.'),
        mcq('q5', 'O que um método com parâmetro out é OBRIGADO a fazer?', 'd', [
          'Receber o valor já inicializado por quem chama',
          'Devolver void',
          'Ser declarado como static',
          'Atribuir um valor ao parâmetro out antes de retornar'
        ], 'out serve para devolver valores: o método precisa atribuí-lo em todos os caminhos antes de terminar.'),
        mcq('q6', 'O que acontece?\nConsole.WriteLine(Calc.Triplo(4));\n\nclass Calc\n{\n    public int Triplo(int x) => x * 3;\n}', 'b', [
          'Imprime 12',
          'Erro de compilação: Triplo é de instância e exige um objeto (new Calc())',
          'Imprime 0',
          'Lança NullReferenceException'
        ], 'Sem static, o método pertence ao objeto. Chamá-lo pelo nome da classe é erro de compilação.'),
        mcq('q7', 'O que é uma função local?', 'c', [
          'Um método que só roda no computador local, nunca na rede',
          'Um método com parâmetros opcionais',
          'Um método declarado dentro de outro método, visível apenas ali',
          'Um método que sempre devolve void'
        ], 'Função local é declarada no corpo de outro método e só pode ser chamada dentro dele.'),
        fill('q8', 'Complete com o tipo de retorno de um método que não devolve valor:', 'static ___ Saudar(string nome)\n{\n    Console.WriteLine($"Olá, {nome}!");\n}', ['void'], 'void indica que o método não devolve valor.')
      ]
    },
    {
      id: 'csb-12-arrays',
      title: 'Arrays',
      goal: 'Criar e percorrer arrays, evitar IndexOutOfRangeException e usar multidimensionais, jagged, Array.* e intervalos.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Declaração, inicialização e tamanho',
            'Um array guarda uma sequência de elementos do MESMO tipo e de tamanho FIXO, definido na criação. Declara-se com colchetes: int[]. Com "new int[3]" o array nasce com 3 elementos no valor padrão do tipo (0 para números, false para bool, null para referências). Com chaves, você já informa os valores. O índice começa em 0 e Length dá a quantidade de elementos. Arrays são tipos de referência.',
            'int[] notas = new int[3];          // { 0, 0, 0 }\nint[] primos = { 2, 3, 5, 7 };\nstring[] nomes = new string[] { "Ana Exemplo", "Bruno Exemplo" };\nprimos[0] = 11;\nConsole.WriteLine(primos[0]);       // Saída: 11\nConsole.WriteLine(primos.Length);   // Saída: 4\nConsole.WriteLine(notas[2]);        // Saída: 0'
          ),
          sl(
            'IndexOutOfRangeException',
            'Os índices válidos vão de 0 até Length - 1. Acessar fora disso NÃO é erro de compilação: é uma falha em tempo de execução que lança IndexOutOfRangeException. O erro típico é usar o Length como índice ou escrever <= Length no laço. Com dados externos (índice digitado pelo usuário), valide antes de acessar. Outra pegadinha: imprimir um array direto com Console.WriteLine mostra o nome do tipo, não os elementos.',
            'int[] p = { 1, 2, 3 };\nConsole.WriteLine(p[2]);   // Saída: 3\n// Console.WriteLine(p[3]); // lança IndexOutOfRangeException\nConsole.WriteLine(p);      // Saída: System.Int32[]  (nome do tipo!)\n\nint i = 3;\nif (i >= 0 && i < p.Length) Console.WriteLine(p[i]);   // validação'
          ),
          sl(
            'Percorrendo arrays e exibindo elementos',
            'Use foreach para ler todos os elementos (sem índice) e for quando precisar do índice ou for alterar posições. Para exibir o conteúdo numa linha, string.Join transforma o array em texto com um separador.',
            'int[] primos = { 2, 3, 5, 7 };\nforeach (int p in primos)\n{\n    Console.Write(p + " ");\n}\n// Saída: 2 3 5 7\nfor (int i = 0; i < primos.Length; i++) primos[i] *= 2;\nConsole.WriteLine(string.Join(", ", primos));   // Saída: 4, 6, 10, 14'
          ),
          sl(
            'Array.Sort, Reverse, IndexOf e Copy',
            'A classe estática Array traz utilitários. Array.Sort ordena no próprio array (em ordem crescente); Array.Reverse inverte no próprio array. Array.IndexOf devolve a posição do valor ou -1 se não existir. Array.Copy(origem, destino, quantidade) copia elementos para outro array. Atenção: "int[] c = a;" NÃO copia: as duas variáveis apontam para o MESMO array, e mudar por uma aparece na outra.',
            'int[] a = { 5, 2, 9, 1 };\nArray.Sort(a);\nConsole.WriteLine(string.Join(" ", a));   // 1 2 5 9\nArray.Reverse(a);\nConsole.WriteLine(string.Join(" ", a));   // 9 5 2 1\nConsole.WriteLine(Array.IndexOf(a, 5));   // 1\nConsole.WriteLine(Array.IndexOf(a, 7));   // -1\n\nint[] b = new int[4];\nArray.Copy(a, b, a.Length);               // cópia de verdade\nint[] c = a;                              // apelido: mesmo array\nc[0] = 0;\nConsole.WriteLine(a[0] + " " + b[0]);    // 0 9'
          ),
          sl(
            'Arrays multidimensionais [,] e jagged [][]',
            'Um array retangular int[,] tem linhas e colunas de tamanho fixo: new int[2, 3] é 2 linhas por 3 colunas, acessado por m[linha, coluna]. GetLength(0) dá as linhas, GetLength(1) as colunas, e Length o total de elementos. Um array jagged ("dentado") int[][] é um array de arrays, em que cada linha pode ter tamanho diferente; cada linha precisa ser criada separadamente.',
            'int[,] m = new int[2, 3];\nm[1, 2] = 7;\nConsole.WriteLine(m.GetLength(0));   // 2\nConsole.WriteLine(m.GetLength(1));   // 3\nConsole.WriteLine(m.Length);         // 6\n\nint[][] j = new int[2][];\nj[0] = new int[] { 1 };\nj[1] = new int[] { 2, 3, 4 };\nConsole.WriteLine(j[1].Length);      // 3\nConsole.WriteLine(j[1][2]);          // 4'
          ),
          sl(
            'Índice do fim (^) e intervalos (..)',
            'O operador ^ conta a partir do fim: ^1 é o último elemento, ^2 o penúltimo (então a[^1] equivale a a[a.Length - 1]). O operador .. cria um intervalo: início INCLUÍDO e fim EXCLUÍDO. a[1..4] pega as posições 1, 2 e 3 e cria um NOVO array; a[..2] vai do começo até a posição 1; a[3..] vai da posição 3 até o final.',
            'int[] n = { 10, 20, 30, 40, 50 };\nConsole.WriteLine(n[^1]);                       // 50\nConsole.WriteLine(n[^2]);                       // 40\nConsole.WriteLine(string.Join(",", n[1..4]));   // 20,30,40\nConsole.WriteLine(string.Join(",", n[..2]));    // 10,20\nConsole.WriteLine(string.Join(",", n[3..]));    // 40,50'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que o código imprime?\nint[] a = new int[3];\nConsole.WriteLine(a[0] + a.Length);', 'd', [
          '0',
          '4',
          'Erro de compilação',
          '3'
        ], 'O array novo começa com zeros: a[0] vale 0, e Length vale 3. Soma: 3.'),
        mcq('q2', 'O que acontece?\nint[] p = { 1, 2, 3 };\nConsole.WriteLine(p[3]);', 'b', [
          'Imprime 0',
          'Lança IndexOutOfRangeException na execução',
          'Erro de compilação',
          'Imprime 3'
        ], 'Os índices válidos são 0, 1 e 2. Acessar o 3 falha em tempo de execução.'),
        mcq('q3', 'O que o código imprime?\nint[] n = { 10, 20, 30 };\nConsole.WriteLine(n[^1]);', 'c', [
          '10',
          '20',
          '30',
          'Erro de compilação'
        ], '^1 é o primeiro elemento a partir do fim, ou seja, o último: 30.'),
        fill('q4', 'Complete com o método que ordena o array no lugar:', 'int[] numeros = { 3, 1, 2 };\nArray.___(numeros);   // 1 2 3', ['Sort'], 'Array.Sort ordena em ordem crescente, modificando o próprio array.'),
        mcq('q5', 'O que o código imprime?\nint[] n = { 10, 20, 30, 40 };\nConsole.WriteLine(string.Join(",", n[1..3]));', 'a', [
          '20,30',
          '20,30,40',
          '10,20,30',
          '10,20'
        ], 'O intervalo 1..3 inclui o início (posição 1) e exclui o fim (posição 3): 20 e 30.'),
        mcq('q6', 'Quantos elementos tem new int[4, 5]?', 'd', [
          '9',
          '4',
          '5',
          '20'
        ], 'Um array retangular de 4 linhas por 5 colunas tem 4 x 5 = 20 elementos (Length).'),
        mcq('q7', 'O que o código imprime?\nint[] a = { 1, 2, 3 };\nint[] b = a;\nb[0] = 99;\nConsole.WriteLine(a[0]);', 'a', [
          '99',
          '1',
          '0',
          'Erro de compilação'
        ], 'Atribuir um array copia a REFERÊNCIA: a e b apontam para o mesmo array, então a mudança aparece nos dois.'),
        fill('q8', 'Complete com o método que devolve a posição de um valor (ou -1 se não existir):', 'int[] a = { 5, 2, 9 };\nConsole.WriteLine(Array.___(a, 7));   // Saída: -1', ['IndexOf'], 'Array.IndexOf devolve o índice da primeira ocorrência ou -1 quando o valor não está no array.')
      ]
    },
    {
      id: 'csb-13-colecoes-genericas',
      title: 'Coleções genéricas',
      goal: 'Escolher e usar List<T>, Dictionary<TKey,TValue>, HashSet<T>, Queue<T> e Stack<T> conforme a necessidade.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'List<T>: a lista que cresce',
            'Arrays têm tamanho fixo; List<T> cresce e encolhe sozinha. O T entre <> é o tipo dos elementos (List<int> guarda inteiros, List<string> textos): é uma coleção genérica, e o compilador impede colocar um tipo errado. Usa-se Count (e não Length) para a quantidade. Métodos principais: Add (no fim), Insert (numa posição), Remove (o primeiro valor igual, devolve bool), RemoveAt, Contains, IndexOf (posição ou -1) e Sort (ordena no lugar). Acessar um índice inexistente lança ArgumentOutOfRangeException. Ficam em System.Collections.Generic, já nos implicit usings.',
            'var numeros = new List<int> { 5, 2, 9 };\nnumeros.Add(1);\nnumeros.Insert(0, 7);\nnumeros.Sort();\nConsole.WriteLine(string.Join(" ", numeros));   // Saída: 1 2 5 7 9\nConsole.WriteLine(numeros.Count);               // Saída: 5\nConsole.WriteLine(numeros.IndexOf(9));          // Saída: 4\nConsole.WriteLine(numeros.Remove(2));           // Saída: True\nConsole.WriteLine(numeros.Contains(2));         // Saída: False'
          ),
          sl(
            'Dictionary<TKey,TValue>: busca por chave',
            'Um dicionário guarda pares chave-valor e acha o valor pela chave de forma muito rápida. As chaves são únicas. O indexador d[chave] lê o valor e, ao atribuir, adiciona ou SUBSTITUI. Ler uma chave que não existe lança KeyNotFoundException; para evitar, use ContainsKey (true/false) ou TryGetValue(chave, out valor), que devolve bool e entrega o valor se achar. Add com chave repetida lança ArgumentException. Percorra com foreach: cada item tem Key e Value (não conte com uma ordem garantida).',
            'var idades = new Dictionary<string, int>();\nidades["Ana Exemplo"] = 30;       // adiciona\nidades.Add("Bruno Exemplo", 25);\nidades["Ana Exemplo"] = 31;       // substitui\nConsole.WriteLine(idades["Ana Exemplo"]);   // Saída: 31\nConsole.WriteLine(idades.ContainsKey("Carla Exemplo"));   // Saída: False\nif (idades.TryGetValue("Bruno Exemplo", out int idade))\n{\n    Console.WriteLine(idade);     // Saída: 25\n}\n// Console.WriteLine(idades["Carla Exemplo"]);   // KeyNotFoundException'
          ),
          sl(
            'HashSet<T>: conjunto sem repetidos',
            'HashSet<T> guarda elementos ÚNICOS, sem índice e sem posição definida. Add devolve true se o item foi adicionado e false se já existia (nada muda). Contains responde rapidamente se um item está no conjunto, mesmo com milhares de itens (numa List a busca percorre item por item). Ideal para remover duplicatas e verificar pertencimento ("esse código já foi usado?").',
            'var codigos = new HashSet<string>();\nConsole.WriteLine(codigos.Add("A1"));   // Saída: True\nConsole.WriteLine(codigos.Add("A1"));   // Saída: False (repetido)\nConsole.WriteLine(codigos.Count);       // Saída: 1\nConsole.WriteLine(codigos.Contains("A1"));   // Saída: True'
          ),
          sl(
            'Queue<T> e Stack<T>',
            'Queue<T> é uma FILA (FIFO, first in, first out: o primeiro a entrar é o primeiro a sair): Enqueue coloca no fim, Dequeue remove e devolve o primeiro, Peek apenas espia o primeiro. Stack<T> é uma PILHA (LIFO, last in, first out): Push empilha, Pop remove e devolve o do topo, Peek espia o topo. Dequeue ou Pop numa coleção vazia lança InvalidOperationException; confira Count antes.',
            'var fila = new Queue<string>();\nfila.Enqueue("A");\nfila.Enqueue("B");\nConsole.WriteLine(fila.Dequeue());   // Saída: A\nConsole.WriteLine(fila.Peek());      // Saída: B\n\nvar pilha = new Stack<string>();\npilha.Push("A");\npilha.Push("B");\nConsole.WriteLine(pilha.Pop());      // Saída: B'
          ),
          sl(
            'Qual coleção escolher',
            'Pergunte-se o que você precisa fazer com os dados. Ordem e acesso por posição: List<T>. Achar valor por uma chave (código, nome, id): Dictionary. Garantir que não há repetidos e testar "está aqui?" rápido: HashSet. Atender na ordem de chegada (fila de tarefas, impressão): Queue. Voltar atrás, desfazer a última ação, histórico: Stack. Para tamanho fixo e conhecido, um array serve. Escolher a coleção certa muitas vezes dispensa laços e deixa o código mais simples e rápido.',
            '// precisa de...                 -> use\n// ordem + índice                  -> List<T>\n// valor por chave                 -> Dictionary<TKey,TValue>\n// únicos + "contém?" rápido       -> HashSet<T>\n// primeiro que chegou, primeiro   -> Queue<T>\n// desfazer a última ação          -> Stack<T>'
          ),
          sl(
            'Inicializadores e collection expressions',
            'Dá para criar a coleção já com valores: com inicializador de coleção entre chaves (new List<int> { 1, 2, 3 }), e, para dicionários, com [chave] = valor. Nas versões recentes do C# existem também as collection expressions: colchetes direto, com o tipo declarado à esquerda (List<int> l = [1, 2, 3];). O mesmo vale para arrays e outras coleções, e [] cria uma coleção vazia. É só uma sintaxe mais curta para o mesmo resultado.',
            'var a = new List<int> { 1, 2, 3 };\nList<int> b = [1, 2, 3];          // collection expression\nint[] c = [4, 5];\nvar d = new Dictionary<string, int> { ["x"] = 1, ["y"] = 2 };\nConsole.WriteLine(a.Count + b.Count + c.Length + d.Count);   // Saída: 10'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que o código imprime?\nvar l = new List<int> { 5, 2, 9 };\nl.Add(1);\nl.Sort();\nConsole.WriteLine(l[0] + " " + l.Count);', 'b', [
          '5 4',
          '1 4',
          '1 3',
          '9 4'
        ], 'Depois do Add a lista tem 4 itens; Sort deixa {1, 2, 5, 9}, então l[0] é 1 e Count é 4.'),
        mcq('q2', 'O que acontece?\nvar d = new Dictionary<string, int> { ["a"] = 1 };\nConsole.WriteLine(d["b"]);', 'c', [
          'Imprime 0',
          'Imprime nada',
          'Lança KeyNotFoundException',
          'Erro de compilação'
        ], 'Ler uma chave inexistente pelo indexador lança KeyNotFoundException. Use TryGetValue ou ContainsKey.'),
        mcq('q3', 'O que o código imprime?\nvar h = new HashSet<string>();\nConsole.WriteLine(h.Add("a") + " " + h.Add("a"));', 'd', [
          'True True',
          'False False',
          'False True',
          'True False'
        ], 'O primeiro Add insere (true); o segundo encontra o item repetido e devolve false.'),
        fill('q4', 'Complete com o método que lê um valor do dicionário sem lançar exceção:', 'if (idades.___("Carla Exemplo", out int v))\n{\n    Console.WriteLine(v);\n}', ['TryGetValue'], 'TryGetValue devolve true/false e entrega o valor pelo parâmetro out, sem lançar KeyNotFoundException.'),
        mcq('q5', 'O que o código imprime?\nvar fila = new Queue<int>();\nvar pilha = new Stack<int>();\nfor (int i = 1; i <= 3; i++) { fila.Enqueue(i); pilha.Push(i); }\nConsole.WriteLine(fila.Dequeue() + " " + pilha.Pop());', 'a', [
          '1 3',
          '3 1',
          '1 1',
          '3 3'
        ], 'Fila é FIFO: sai o 1. Pilha é LIFO: sai o 3.'),
        mcq('q6', 'Você precisa verificar rapidamente se um código de produto já foi cadastrado, sem aceitar repetidos. Qual coleção é mais adequada?', 'd', [
          'Stack<string>',
          'Queue<string>',
          'List<string>, percorrendo item por item',
          'HashSet<string>'
        ], 'HashSet garante unicidade e Contains é muito rápido; a List teria que percorrer item a item.'),
        mcq('q7', 'O que faz a linha abaixo?\nList<int> l = [1, 2, 3];', 'b', [
          'É erro de compilação: lista não aceita colchetes',
          'Usa uma collection expression para criar uma List<int> com 3 elementos',
          'Cria um array de tamanho 3 e o converte em string',
          'Cria uma lista vazia de capacidade 3'
        ], 'Collection expressions (colchetes) criam coleções já preenchidas; aqui, uma List<int> com 1, 2 e 3.'),
        fill('q8', 'Complete com o método que remove e devolve o primeiro item da fila:', 'string proximo = fila.___();', ['Dequeue'], 'Dequeue remove e devolve o item mais antigo da fila (FIFO).')
      ]
    },
    {
      id: 'csb-35-recursao-algoritmos-classicos',
      title: 'Recursão e algoritmos clássicos',
      goal: 'Escrever métodos recursivos com caso base, entender a pilha de chamadas e conhecer buscas, ordenações e problemas clássicos com noção de custo.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Recursão: um método que chama a si mesmo',
            'Um método é recursivo quando chama a si mesmo para resolver uma versão MENOR do mesmo problema. Toda recursão correta tem duas partes: o CASO BASE (a situação mais simples, resolvida direto, que PARA a recursão) e o CASO RECURSIVO (reduz o problema e chama o método de novo, caminhando em direção ao caso base). O exemplo clássico é o fatorial: n! = n * (n-1)!, com 1! = 1. Pense assim: "se for trivial, responda; senão, delegue uma parte menor".',
            'static long Fat(int n) => n <= 1 ? 1 : n * Fat(n - 1);\n\nConsole.WriteLine(Fat(5));   // 120  (5 * 4 * 3 * 2 * 1)\nConsole.WriteLine(Fat(1));   // 1    (caso base)'
          ),
          sl(
            'Pilha de chamadas e StackOverflowException',
            'Cada chamada de método ocupa um bloco de memória na pilha de chamadas (call stack) com seus parâmetros e variáveis locais, e só é liberado quando a chamada termina. Na recursão, as chamadas se EMPILHAM até chegar ao caso base e depois "desempilham" em ordem inversa. A pilha tem tamanho LIMITADO: se a recursão nunca chega ao caso base (ou é profunda demais), a pilha estoura e ocorre StackOverflowException. Esta exceção NÃO pode ser capturada com try/catch: o processo inteiro termina. Por isso, confira sempre que o argumento se aproxima do caso base, e prefira um laço quando a profundidade pode ser enorme.',
            'static void F(int n)\n{\n    if (n == 0) return;   // caso base\n    F(n - 1);             // empilha até chegar em 0...\n    Console.Write(n);     // ...e escreve ao desempilhar\n}\nF(3);   // 123\n\nstatic void G(int n)\n{\n    if (n == 0) return;\n    Console.Write(n);     // escreve antes de empilhar\n    G(n - 1);\n}\nG(3);   // 321'
          ),
          sl(
            'Fibonacci: ingênuo, iterativo e com memoização',
            'A sequência de Fibonacci começa com 0 e 1, e cada termo é a soma dos dois anteriores (0, 1, 1, 2, 3, 5, 8...). A versão recursiva direta é muito curta, mas LENTA: ela recalcula os mesmos termos várias vezes, e o número de chamadas cresce exageradamente (exponencial) com n. Duas correções: a versão iterativa, com um laço guardando os dois últimos valores, e a memoização, que guarda em um Dictionary o resultado de cada n já calculado para nunca recalcular. Use long: os valores crescem rápido e estouram um int.',
            'static long FibIng(int n) => n < 2 ? n : FibIng(n - 1) + FibIng(n - 2);\nConsole.WriteLine(FibIng(10));   // 55 (ok para n pequeno)\n\nstatic long FibIter(int n)\n{\n    long a = 0, b = 1;\n    for (int i = 0; i < n; i++) (a, b) = (b, a + b);\n    return a;\n}\nConsole.WriteLine(FibIter(50));  // 12586269025\n\nvar memo = new Dictionary<int, long>();\nlong FibMemo(int n)\n{\n    if (n < 2) return n;\n    if (memo.TryGetValue(n, out long v)) return v;\n    long r = FibMemo(n - 1) + FibMemo(n - 2);\n    memo[n] = r;\n    return r;\n}\nConsole.WriteLine(FibMemo(50));  // 12586269025'
          ),
          sl(
            'Busca linear e busca binária',
            'A busca LINEAR percorre os itens um a um até achar: funciona em qualquer lista, mas, no pior caso, olha todos. A busca BINÁRIA só funciona se os dados estiverem ORDENADOS: compara com o item do MEIO e descarta metade a cada passo, indo para a esquerda ou para a direita. Com dados desordenados, o resultado é errado. A BCL já traz Array.BinarySearch(array, valor) (e List<T>.BinarySearch): devolve o índice se achar; se não achar, devolve um número NEGATIVO (o complemento bit a bit da posição onde o valor entraria), então teste "< 0" em vez de comparar com -1.',
            'static int Binaria(int[] v, int alvo)\n{\n    int ini = 0, fim = v.Length - 1;\n    while (ini <= fim)\n    {\n        int meio = (ini + fim) / 2;\n        if (v[meio] == alvo) return meio;\n        if (v[meio] < alvo) ini = meio + 1; else fim = meio - 1;\n    }\n    return -1;\n}\nint[] v = { 1, 3, 5, 7, 9 };   // ordenado!\nConsole.WriteLine(Binaria(v, 7));            // 3\nConsole.WriteLine(Binaria(v, 4));            // -1\nConsole.WriteLine(Array.BinarySearch(v, 7)); // 3\nConsole.WriteLine(Array.BinarySearch(v, 4) < 0);   // True (não achou)'
          ),
          sl(
            'Ordenação simples: bubble e selection sort',
            'Ordenar é um problema clássico. No bubble sort, você percorre a lista comparando vizinhos e trocando os que estão fora de ordem, repetindo até nenhuma troca ser necessária. No selection sort, a cada passo você procura o MENOR item do restante e o coloca na posição atual. Os dois usam laços dentro de laços e fazem da ordem de n * n comparações (O(n²)): ótimos para APRENDER, mas lentos para listas grandes. Em programas reais, não reinvente: use Array.Sort(array) ou lista.Sort(), que são rápidos, bem testados e aceitam IComparable ou uma Comparison.',
            'static void Bubble(int[] v)\n{\n    for (int i = 0; i < v.Length - 1; i++)\n        for (int j = 0; j < v.Length - 1 - i; j++)\n            if (v[j] > v[j + 1]) (v[j], v[j + 1]) = (v[j + 1], v[j]);\n}\nint[] x = { 5, 2, 9, 1 };\nBubble(x);\nConsole.WriteLine(string.Join(" ", x));   // 1 2 5 9\n\nint[] y = { 5, 2, 9, 1 };\nArray.Sort(y);   // o que se usa na prática\nConsole.WriteLine(string.Join(" ", y));   // 1 2 5 9'
          ),
          sl(
            'Complexidade: custo que cresce com o tamanho',
            'Complexidade descreve, de forma aproximada, COMO o trabalho cresce quando a entrada (n itens) aumenta, ignorando constantes. Notação "O grande": O(1) é constante (acessar array[i]: não importa o tamanho); O(n) é linear (busca linear: dobrar n dobra o trabalho); O(log n) é logarítmico (busca binária: dobrar n acrescenta só um passo); O(n²) é quadrático (bubble sort: dobrar n quadruplica o trabalho). A ordem de crescimento é: O(1) < O(log n) < O(n) < O(n²). Não decore números: o objetivo é perceber se um algoritmo "aguenta" entradas grandes.',
            '// n = 1.000.000 itens (ordem de grandeza):\n// O(1)      -> 1 operação          (array[i])\n// O(log n)  -> cerca de 20 passos  (busca binária)\n// O(n)      -> 1.000.000 passos    (busca linear)\n// O(n²)     -> 1.000.000.000.000   (bubble sort)  <- inviável'
          ),
          sl(
            'Problemas clássicos: FizzBuzz, primos, MDC e soma de dígitos',
            'FizzBuzz: de 1 a 15, imprima "Fizz" para múltiplos de 3, "Buzz" para múltiplos de 5, "FizzBuzz" para ambos (teste 15 PRIMEIRO) e o próprio número nos demais. Número primo: maior que 1 e sem divisores além de 1 e dele mesmo; basta testar divisores d com d * d <= n. MDC (máximo divisor comum) pelo algoritmo de Euclides: mdc(a, b) = a se b for 0; senão mdc(b, a % b). Soma de dígitos recursiva: último dígito (n % 10) mais a soma do resto (n / 10). Recursão ou iteração? Recursão fica elegante quando o problema se divide em subproblemas iguais; o laço é mais seguro e eficiente quando a profundidade é grande.',
            'static bool EhPrimo(int n)\n{\n    if (n < 2) return false;\n    for (int d = 2; d * d <= n; d++)\n        if (n % d == 0) return false;\n    return true;\n}\nstatic int Mdc(int a, int b) => b == 0 ? a : Mdc(b, a % b);\nstatic int SomaDigitos(int n) => n == 0 ? 0 : n % 10 + SomaDigitos(n / 10);\n\nConsole.WriteLine(EhPrimo(7));        // True\nConsole.WriteLine(EhPrimo(9));        // False\nConsole.WriteLine(Mdc(48, 18));       // 6\nConsole.WriteLine(SomaDigitos(1234)); // 10\n// FizzBuzz 1..15: 1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que o código imprime?\nstatic long Fat(int n) => n <= 1 ? 1 : n * Fat(n - 1);\nConsole.WriteLine(Fat(5));', 'd', [
          '24',
          '15',
          '5',
          '120'
        ], 'Fat(5) = 5 * 4 * 3 * 2 * 1 = 120. O caso base (n <= 1) devolve 1 e as chamadas desempilham multiplicando.'),
        mcq('q2', 'O que acontece ao chamar um método recursivo que nunca atinge o caso base?', 'b', [
          'Ele devolve 0 depois de muitas chamadas e o programa continua normalmente',
          'A pilha estoura (StackOverflowException) e o processo termina, sem que try/catch consiga capturar',
          'Lança uma exceção comum, que um try/catch captura para o programa continuar a rodar',
          'O compilador detecta o problema e recusa-se a compilar o código do método'
        ], 'Sem caso base, as chamadas se empilham até esgotar a pilha. StackOverflowException não é capturável: o processo é encerrado.'),
        mcq('q3', 'O que o código imprime?\nstatic void F(int n)\n{\n    if (n == 0) return;\n    F(n - 1);\n    Console.Write(n);\n}\nF(3);', 'a', [
          '123',
          '321',
          '3',
          '012'
        ], 'F(3) chama F(2), que chama F(1), que chama F(0) (caso base). Só ao desempilhar cada chamada escreve seu n: 1, depois 2, depois 3.'),
        fill('q4', 'Complete com o método da BCL que faz busca binária em um array ORDENADO:', 'int pos = Array.___(ordenado, 7);', ['BinarySearch'], 'Array.BinarySearch exige dados ordenados e devolve o índice, ou um número negativo se o valor não existir.'),
        mcq('q5', 'Por que a versão recursiva ingênua de Fibonacci é muito lenta, e como a memoização resolve?', 'c', [
          'Porque usa long em vez de int, e long soma mais devagar; usar int resolve',
          'Porque toda recursão é mais lenta que um laço, não importa o problema',
          'Porque recalcula os mesmos termos várias vezes; guardar em um Dictionary evita',
          'Porque o compilador não otimiza métodos que contêm duas chamadas recursivas'
        ], 'A recursão ingênua refaz os mesmos subproblemas. Com memoização, cada valor é calculado uma vez e consultado depois.'),
        mcq('q6', 'O que o código imprime?\nint[] v = { 1, 3, 5, 7, 9 };\nConsole.WriteLine(Array.BinarySearch(v, 7) + " " + (Array.BinarySearch(v, 4) < 0));', 'd', [
          '4 False',
          '3 False',
          '-1 True',
          '3 True'
        ], 'O 7 está no índice 3. O 4 não existe, e BinarySearch devolve um número negativo nesse caso, então a comparação < 0 é True.'),
        mcq('q7', 'Um algoritmo de ordenação O(n²), como o bubble sort, passa a receber o DOBRO de elementos. O que acontece com o trabalho?', 'b', [
          'Aproximadamente dobra, pois o custo cresce em proporção a n',
          'Aproximadamente quadruplica, pois o custo cresce com n ao quadrado',
          'Aumenta só um passo, pois o custo cresce com o logaritmo de n',
          'Continua igual, pois o custo não depende do tamanho da entrada'
        ], 'Em O(n²), dobrar n multiplica o trabalho por 4. Na prática use Array.Sort ou List.Sort, muito mais eficientes.'),
        fill('q8', 'Algoritmo de Euclides: complete com o resto da divisão de a por b.', 'static int Mdc(int a, int b) => b == 0 ? a : Mdc(b, ___);', ['a % b', 'a%b'], 'mdc(a, b) = mdc(b, a % b) até b chegar a 0. Mdc(48, 18) dá 6.')
      ]
    },
    {
      id: 'csb-14-classes-objetos',
      title: 'Classes e objetos',
      goal: 'Criar classes com campos, construtores e membros estáticos, entendendo referência, null e modificadores de acesso.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Classe é o molde, objeto é a coisa criada',
            'Uma classe descreve um tipo: quais dados (campos) e quais comportamentos (métodos) ele tem. Um objeto (instância) é uma coisa concreta criada a partir da classe com a palavra new. Da classe Pessoa você cria quantos objetos quiser, cada um com seus PRÓPRIOS valores nos campos. Campos são variáveis que pertencem ao objeto; acessa-se por objeto.campo, e métodos por objeto.Metodo().',
            'class Pessoa\n{\n    public string Nome = "";\n    public int Idade;\n\n    public void Apresentar() => Console.WriteLine($"Sou {Nome}, {Idade} anos");\n}\n\nvar p = new Pessoa();\np.Nome = "Ana Exemplo";\np.Idade = 30;\np.Apresentar();   // Saída: Sou Ana Exemplo, 30 anos'
          ),
          sl(
            'Construtores e this',
            'Um construtor é um método especial, com o nome da classe e sem tipo de retorno, executado quando o objeto é criado, para deixá-lo em estado válido. Se você não escreve nenhum, o C# oferece um construtor padrão sem parâmetros; ao escrever um construtor com parâmetros, o padrão DEIXA de existir (a menos que você o escreva também). this é o próprio objeto atual: usado para distinguir campo de parâmetro de mesmo nome. Um construtor pode chamar outro da mesma classe com ": this(...)", evitando repetir código.',
            'class Produto\n{\n    private string nome;\n    private decimal preco;\n\n    public Produto(string nome, decimal preco)\n    {\n        this.nome = nome;     // this.nome é o campo; nome é o parâmetro\n        this.preco = preco;\n    }\n\n    public Produto(string nome) : this(nome, 0m) { }   // encadeia\n\n    public void Mostrar() => Console.WriteLine($"{nome}: {preco}");\n}\n\nnew Produto("Caneta", 3m).Mostrar();     // Saída: Caneta: 3\nnew Produto("Brinde").Mostrar();         // Saída: Brinde: 0'
          ),
          sl(
            'Modificadores de acesso',
            'Eles controlam quem pode usar um membro. public: qualquer código. private: só o código dentro da própria classe (é o padrão dos membros quando você não escreve nada). protected: a própria classe e suas classes derivadas (herança). internal: qualquer código do mesmo projeto (assembly), mas não de fora; é o padrão para classes de nível superior. Regra de ouro: comece com o acesso mais restrito possível e abra só o necessário; dados sensíveis não devem ficar públicos.',
            'class Conta\n{\n    private decimal saldo = 100m;       // só a classe acessa\n    public decimal ObterSaldo() => saldo;\n}\n\nvar c = new Conta();\nConsole.WriteLine(c.ObterSaldo());   // Saída: 100\n// Console.WriteLine(c.saldo);        // ERRO: "saldo" é inacessível (private)'
          ),
          sl(
            'Membros estáticos',
            'Um membro static pertence à CLASSE, não a cada objeto: existe uma única cópia compartilhada, acessada pelo nome da classe. É útil para contadores compartilhados, constantes e funções utilitárias (como Math.Sqrt, Console.WriteLine). Um método estático não consegue usar diretamente campos de instância, pois não sabe de qual objeto se trata. Uma classe static não pode ser instanciada: só agrupa membros estáticos.',
            'class Contador\n{\n    public static int Total;\n    public Contador() { Total++; }\n}\n\nvar a = new Contador();\nvar b = new Contador();\nvar c = new Contador();\nConsole.WriteLine(Contador.Total);   // Saída: 3'
          ),
          sl(
            'Referência vs cópia e null',
            'Classes são tipos de REFERÊNCIA: a variável guarda o endereço do objeto. "var b = a;" copia só o endereço; a e b apontam para o MESMO objeto, e mudar por um aparece no outro. (Para tipos de valor, como int e structs, a atribuição copia o conteúdo.) == entre objetos compara a referência, não o conteúdo, a menos que a classe defina outro comportamento. null significa "nenhum objeto"; usar um membro de uma referência null lança NullReferenceException. Declare tipos que aceitam null com ? (Pessoa?) e teste com is null ou ?. para se proteger.',
            'var a = new Pessoa();\na.Nome = "Ana Exemplo";\nvar b = a;                    // mesma referência\nb.Nome = "Bruno Exemplo";\nConsole.WriteLine(a.Nome);    // Saída: Bruno Exemplo\n\nPessoa? c = null;\nConsole.WriteLine(c?.Nome ?? "sem pessoa");   // Saída: sem pessoa\n// Console.WriteLine(c.Nome);   // NullReferenceException\n\nclass Pessoa { public string Nome = ""; }'
          ),
          sl(
            'Primary constructors (visão geral)',
            'Nas versões recentes do C#, uma classe pode declarar os parâmetros do construtor direto no cabeçalho: "class Saudacao(string nome)". Esses parâmetros ficam disponíveis em todo o corpo da classe, o que reduz o código de campos e construtor. Os construtores tradicionais continuam válidos e muito usados; reconheça os dois estilos. Em qualquer caso, valide os parâmetros que vêm de fora.',
            'class Saudacao(string nome)\n{\n    public string Dizer() => $"Olá, {nome}!";\n}\n\nvar s = new Saudacao("Ana Exemplo");\nConsole.WriteLine(s.Dizer());   // Saída: Olá, Ana Exemplo!'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a relação entre classe e objeto?', 'a', [
          'A classe é o molde (campos e métodos); o objeto é uma instância concreta criada com new',
          'O objeto é o molde e a classe é a instância',
          'Classe e objeto são sinônimos',
          'Objetos só existem em classes static'
        ], 'A classe define o tipo; cada new cria um objeto independente, com seus próprios valores.'),
        mcq('q2', 'O que o código imprime?\nvar a = new Pessoa();\na.Nome = "Ana Exemplo";\nvar b = a;\nb.Nome = "Bruno Exemplo";\nConsole.WriteLine(a.Nome);\n\nclass Pessoa { public string Nome = ""; }', 'd', [
          'Ana Exemplo',
          'Nada',
          'Erro de compilação',
          'Bruno Exemplo'
        ], 'Classes são tipos de referência: b aponta para o mesmo objeto de a, então a mudança aparece em a.Nome.'),
        mcq('q3', 'O que acontece?\nvar a = new A();\n\nclass A\n{\n    public A(int x) { }\n}', 'b', [
          'Compila e cria o objeto normalmente',
          'Erro de compilação: ao declarar um construtor com parâmetro, o construtor padrão sem parâmetros deixa de existir',
          'Lança NullReferenceException',
          'x recebe 0 automaticamente'
        ], 'Escrever qualquer construtor remove o padrão implícito. Chame new A(5) ou declare também um construtor sem parâmetros.'),
        fill('q4', 'Complete para um construtor chamar outro da mesma classe:', 'public Produto(string nome) : ___(nome, 0m) { }', ['this'], '": this(...)" encadeia para outro construtor da mesma classe, evitando repetir código.'),
        mcq('q5', 'O que o código imprime?\nvar a = new Contador();\nvar b = new Contador();\nvar c = new Contador();\nConsole.WriteLine(Contador.Total);\n\nclass Contador\n{\n    public static int Total;\n    public Contador() { Total++; }\n}', 'c', [
          '0',
          '1',
          '3',
          'Erro de compilação'
        ], 'Total é static: existe uma única cópia compartilhada, incrementada em cada um dos três construtores.'),
        mcq('q6', 'O que acontece?\nvar c = new Conta();\nConsole.WriteLine(c.saldo);\n\nclass Conta\n{\n    private decimal saldo = 100m;\n}', 'a', [
          'Erro de compilação: saldo é private e inacessível fora da classe',
          'Imprime 100',
          'Imprime 0',
          'Lança NullReferenceException'
        ], 'private restringe o acesso ao código da própria classe; de fora, o compilador recusa.'),
        mcq('q7', 'O que acontece em tempo de execução?\nPessoa? p = null;\nConsole.WriteLine(p.Nome);\n\nclass Pessoa { public string Nome = ""; }', 'd', [
          'Imprime uma linha em branco',
          'Imprime null',
          'Lança KeyNotFoundException',
          'Lança NullReferenceException'
        ], 'Acessar membro de uma referência null lança NullReferenceException (o compilador só avisa). Proteja-se com is null ou ?.'),
        fill('q8', 'Complete com a palavra-chave que cria um objeto:', 'var p = ___ Pessoa();', ['new'], 'new cria uma instância da classe e executa o construtor.')
      ]
    },
    {
      id: 'csb-15-propriedades-encapsulamento',
      title: 'Propriedades e encapsulamento',
      goal: 'Proteger o estado de objetos com propriedades, validação, init, required e private set.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Propriedades: get e set',
            'Uma propriedade parece um campo para quem usa, mas por dentro é um par de métodos: get (ler) e set (gravar). Costuma ter um campo privado de apoio (backing field), por convenção com sublinhado (_nome). No set existe o parâmetro implícito value, que é o valor atribuído. Por que não deixar campos públicos? Porque uma propriedade permite validar, calcular, limitar quem altera e mudar a implementação interna sem quebrar o código que a usa: isso é o ENCAPSULAMENTO.',
            'class Pessoa\n{\n    private string _nome = "";\n\n    public string Nome\n    {\n        get { return _nome; }\n        set { _nome = value; }   // value = o que foi atribuído\n    }\n}\n\nvar p = new Pessoa();\np.Nome = "Ana Exemplo";\nConsole.WriteLine(p.Nome);   // Saída: Ana Exemplo'
          ),
          sl(
            'Auto-properties',
            'Quando get e set não fazem nada além de ler e gravar, use a auto-property: o compilador cria o campo de apoio escondido. Você pode dar um valor inicial com "= valor" (para strings não anuláveis, use = "" ou um valor inicial para evitar avisos de nulo). É a forma mais comum de declarar dados de uma classe.',
            'class Cliente\n{\n    public string Nome { get; set; } = "";\n    public bool Ativo { get; set; } = true;\n}\n\nvar c = new Cliente();\nc.Nome = "Bruno Exemplo";\nConsole.WriteLine($"{c.Nome} {c.Ativo}");   // Saída: Bruno Exemplo True'
          ),
          sl(
            'Validação no setter e private set',
            'No set você pode recusar valores inválidos, lançando uma exceção (throw): ela interrompe a execução e sinaliza o erro. Isso garante que o objeto nunca fique num estado inválido, mesmo vindo de dados de fora. "private set" faz a propriedade ser legível por todos, mas alterável apenas pelo código da própria classe: o estado só muda por métodos que você controla (como Depositar).',
            'class Pessoa\n{\n    private int _idade;\n    public int Idade\n    {\n        get => _idade;\n        set\n        {\n            if (value < 0 || value > 150)\n                throw new ArgumentOutOfRangeException(nameof(value), "Idade inválida.");\n            _idade = value;\n        }\n    }\n}\n\nclass Conta\n{\n    public decimal Saldo { get; private set; }\n    public void Depositar(decimal valor)\n    {\n        if (valor <= 0) throw new ArgumentOutOfRangeException(nameof(valor));\n        Saldo += valor;\n    }\n}'
          ),
          sl(
            'init e required',
            'init é como set, mas só permite atribuir durante a criação do objeto (num inicializador ou construtor): depois disso, a propriedade fica imutável. required (obrigatório) exige que quem cria o objeto preencha a propriedade no inicializador: esquecer é erro de compilação. Juntos, garantem objetos completos e que não mudam por acidente.',
            'class Produto\n{\n    public required string Nome { get; init; }\n    public decimal Preco { get; init; }\n}\n\nvar p = new Produto { Nome = "Caneta", Preco = 2.50m };\n// p.Nome = "Lápis";                 // ERRO: init só vale na criação\n// var q = new Produto { Preco = 1m }; // ERRO: Nome é required'
          ),
          sl(
            'Propriedades calculadas e somente leitura',
            'Uma propriedade calculada não guarda valor: seu get produz o resultado a partir de outros dados, em geral com "=>". Ela está sempre atualizada, sem risco de ficar incoerente com os dados de que depende. Uma propriedade só com get ({ get; }) pode ser definida apenas na declaração ou no construtor. Já "readonly" é para CAMPOS: depois do construtor, o valor não muda. Ambos servem para dados que não devem ser alterados depois de construídos.',
            'class Retangulo\n{\n    public double Largura { get; set; }\n    public double Altura { get; set; }\n    public double Area => Largura * Altura;   // calculada\n}\n\nclass Pedido\n{\n    public int Numero { get; }                // só leitura\n    private readonly DateTime _criado;        // campo readonly\n    public Pedido(int numero) { Numero = numero; _criado = DateTime.UtcNow; }\n}'
          ),
          sl(
            'Inicializadores de objeto e privacidade',
            'O inicializador de objeto cria e preenche propriedades de uma vez: new Tipo { Prop = valor, ... }, sem precisar de um construtor para cada combinação. Encapsulamento também é privacidade: dados sensíveis (documentos, senhas, dados pessoais) ficam privados ou read-only, não ganham propriedades públicas sem necessidade e não devem sair em ToString nem em logs. Exponha o mínimo e valide o que entra.',
            'var r = new Retangulo { Largura = 3, Altura = 4 };\nConsole.WriteLine(r.Area);   // Saída: 12\n\nclass Retangulo\n{\n    public double Largura { get; set; }\n    public double Altura { get; set; }\n    public double Area => Largura * Altura;\n}'
          )
        ]
      },
      questions: [
        mcq('q1', 'Dentro do bloco set de uma propriedade, o que representa o identificador value?', 'c', [
          'O valor atual da propriedade',
          'O tipo da propriedade',
          'O valor que está sendo atribuído à propriedade',
          'O nome do campo de apoio'
        ], 'value é o parâmetro implícito do set: o que quem usa a propriedade atribuiu.'),
        mcq('q2', 'O que o código imprime?\nvar r = new Retangulo { Largura = 3, Altura = 4 };\nConsole.WriteLine(r.Area);\n\nclass Retangulo\n{\n    public double Largura { get; set; }\n    public double Altura { get; set; }\n    public double Area => Largura * Altura;\n}', 'b', [
          '7',
          '12',
          '0',
          'Erro de compilação'
        ], 'Area é uma propriedade calculada: 3 * 4 = 12, sempre atualizada com Largura e Altura.'),
        mcq('q3', 'O que acontece?\nvar c = new Conta();\nc.Saldo = 10m;\n\nclass Conta\n{\n    public decimal Saldo { get; private set; }\n}', 'a', [
          'Erro de compilação: o set é private e não pode ser usado fora da classe',
          'Funciona e Saldo passa a valer 10',
          'Lança InvalidOperationException',
          'Saldo continua 0 sem aviso'
        ], 'private set permite a leitura pública, mas só a própria classe pode gravar.'),
        fill('q4', 'Complete com o acessador que só permite atribuir durante a criação do objeto:', 'public string Nome { get; ___; }', ['init'], 'init permite atribuir no inicializador/construtor; depois a propriedade fica imutável.'),
        mcq('q5', 'O que acontece?\nvar p = new Produto { Preco = 1m };\n\nclass Produto\n{\n    public required string Nome { get; init; }\n    public decimal Preco { get; init; }\n}', 'd', [
          'Nome fica null e o programa roda',
          'Lança exceção na execução',
          'Nome vira uma string vazia',
          'Erro de compilação: Nome é required e não foi preenchido'
        ], 'required obriga o inicializador a definir a propriedade, e o compilador confere isso.'),
        mcq('q6', 'O que acontece?\nvar p = new Pessoa();\np.Idade = -5;\n\nclass Pessoa\n{\n    private int _idade;\n    public int Idade\n    {\n        get => _idade;\n        set\n        {\n            if (value < 0) throw new ArgumentOutOfRangeException(nameof(value));\n            _idade = value;\n        }\n    }\n}', 'c', [
          'Idade passa a valer -5',
          'Idade passa a valer 0',
          'Lança ArgumentOutOfRangeException e o objeto não é alterado',
          'Erro de compilação'
        ], 'A validação do setter recusa o valor inválido com uma exceção antes de gravar _idade.'),
        mcq('q7', 'Qual é a principal vantagem de usar uma propriedade em vez de um campo público?', 'b', [
          'A propriedade ocupa menos memória que o campo',
          'Permite validar, restringir quem altera e mudar a implementação interna sem quebrar quem a usa',
          'Propriedades não precisam de tipo',
          'Campos públicos não funcionam em C#'
        ], 'Esse é o encapsulamento: controle sobre acesso e consistência do estado do objeto.'),
        fill('q8', 'Complete o símbolo de uma propriedade calculada com corpo de expressão:', 'public double Area ___ Largura * Altura;', ['=>'], '"=>" define o get como uma expressão: Area é recalculada a cada leitura.')
      ]
    },
    {
      id: 'csb-16-heranca-polimorfismo',
      title: 'Herança e polimorfismo',
      goal: 'Reaproveitar e especializar classes com herança, virtual/override, abstract, sealed e casts seguros.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Herança simples e object',
            'Herança permite que uma classe (derivada) reaproveite tudo o que a outra (base) tem e acrescente o seu. Escreve-se "class Derivada : Base". Cachorro É UM Animal: use herança só quando essa relação "é um" faz sentido. Em C# uma classe herda de UMA única classe base (herança simples). Toda classe herda, no fim da cadeia, de object, que fornece ToString(), Equals(), GetHashCode() e GetType().',
            'class Animal\n{\n    public string Nome = "";\n    public void Comer() => Console.WriteLine($"{Nome} está comendo");\n}\n\nclass Cachorro : Animal\n{\n    public void Latir() => Console.WriteLine("Au!");\n}\n\nvar c = new Cachorro();\nc.Nome = "Rex";\nc.Comer();   // Saída: Rex está comendo\nc.Latir();   // Saída: Au!'
          ),
          sl(
            'Construtor da base com : base(...)',
            'Construtores NÃO são herdados. Ao criar um objeto derivado, o construtor da classe base executa primeiro; se a base exige parâmetros, a derivada precisa escolher qual construtor chamar com ": base(argumentos)" depois da lista de parâmetros. Dentro de um método, base.Metodo() chama a versão da classe base.',
            'class Animal\n{\n    public string Nome { get; }\n    public Animal(string nome) { Nome = nome; }\n}\n\nclass Cachorro : Animal\n{\n    public Cachorro(string nome) : base(nome) { }   // repassa para a base\n}\n\nvar c = new Cachorro("Rex");\nConsole.WriteLine(c.Nome);   // Saída: Rex'
          ),
          sl(
            'virtual e override: polimorfismo',
            'Polimorfismo: tratar objetos diferentes pela mesma interface, cada um agindo do seu jeito. Na base, marque o método como virtual (pode ser substituído); na derivada, use override para fornecer a nova versão. Ao chamar o método por uma variável do tipo base, o que roda é a versão do objeto REAL. Assim, uma coleção de Animal pode conter cães e gatos, e cada um responde à sua maneira.',
            'class Animal\n{\n    public virtual string Som() => "...";\n}\nclass Cachorro : Animal\n{\n    public override string Som() => "Au";\n}\nclass Gato : Animal\n{\n    public override string Som() => "Miau";\n}\n\nAnimal[] zoo = { new Cachorro(), new Gato(), new Animal() };\nforeach (Animal a in zoo)\n{\n    Console.WriteLine(a.Som());\n}\n// Saída: Au, Miau, ... (uma por linha)'
          ),
          sl(
            'abstract e sealed',
            'Uma classe abstract é incompleta de propósito: não pode ser instanciada com new, serve de base. Ela pode ter métodos abstract (sem corpo), que cada classe derivada concreta é OBRIGADA a implementar com override. Já sealed impede herança: uma classe sealed não pode ser base de outra (e "sealed override" impede novas substituições). Use abstract para definir um contrato com comportamento comum; use sealed quando a classe não foi projetada para ser estendida.',
            'abstract class Forma\n{\n    public abstract double Area();           // sem corpo\n    public void Mostrar() => Console.WriteLine($"Área: {Area()}");\n}\n\nclass Quadrado : Forma\n{\n    public double Lado;\n    public override double Area() => Lado * Lado;\n}\n\nsealed class Retangulo : Forma\n{\n    public double L, A;\n    public override double Area() => L * A;\n}\n\nvar q = new Quadrado { Lado = 3 };\nq.Mostrar();     // Saída: Área: 9\n// var f = new Forma();   // ERRO: classe abstrata'
          ),
          sl(
            'new (ocultação) e por que evitar',
            'Se a derivada declara um método de mesmo nome SEM override, ela apenas OCULTA o da base; o modificador new só silencia o aviso do compilador. O problema: qual versão roda depende do TIPO DA VARIÁVEL, não do objeto real, o que quebra o polimorfismo e confunde. Com override, o objeto real decide. Regra prática: para especializar comportamento, use virtual/override; evite new.',
            'class A { public string Quem() => "A"; }\nclass B : A { public new string Quem() => "B"; }   // oculta\n\nA x = new B();\nConsole.WriteLine(x.Quem());   // Saída: A  (tipo da variável!)\nB y = new B();\nConsole.WriteLine(y.Quem());   // Saída: B'
          ),
          sl(
            'Upcasting, downcasting, is e as',
            'Upcast: tratar um objeto derivado como a base (Animal a = cachorro) é sempre seguro e automático. Downcast: voltar ao tipo derivado exige cast explícito e pode falhar com InvalidCastException se o objeto não for daquele tipo. Mais seguros: "a is Cachorro rex" (testa e converte) e "a as Cachorro" (devolve null se não der, sem exceção). Para guardar o tipo derivado e acessar membros específicos, use essas verificações.',
            'Animal a = new Cachorro("Rex");     // upcast implícito\nif (a is Cachorro rex)\n{\n    Console.WriteLine(rex.Nome);      // Saída: Rex\n}\nGato? g = a as Gato;                  // null: não é Gato\nConsole.WriteLine(g is null);         // Saída: True\n// Gato g2 = (Gato)a;                 // InvalidCastException\n\nclass Animal { public string Nome { get; } public Animal(string n) { Nome = n; } }\nclass Cachorro : Animal { public Cachorro(string n) : base(n) { } }\nclass Gato : Animal { public Gato(string n) : base(n) { } }'
          ),
          sl(
            'Sobrescrevendo ToString()',
            'ToString() vem de object e devolve, por padrão, o NOME DO TIPO. Console.WriteLine e a interpolação chamam ToString() automaticamente, então vale sobrescrevê-lo (override) para uma descrição útil. Cuidado com privacidade: não coloque dados sensíveis ou pessoais no ToString, pois ele costuma ir parar em logs e telas de erro.',
            'class Ponto\n{\n    public int X, Y;\n    public override string ToString() => $"({X}, {Y})";\n}\n\nvar p = new Ponto { X = 1, Y = 2 };\nConsole.WriteLine(p);          // Saída: (1, 2)\nConsole.WriteLine($"P = {p}"); // Saída: P = (1, 2)'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que o código imprime?\nAnimal a = new Cachorro();\nConsole.WriteLine(a.Som());\n\nclass Animal { public virtual string Som() => "..."; }\nclass Cachorro : Animal { public override string Som() => "Au"; }', 'd', [
          '...',
          'Erro de compilação',
          'Nada',
          'Au'
        ], 'Com virtual/override, roda a versão do objeto real (Cachorro), mesmo pela variável do tipo base.'),
        mcq('q2', 'O que o código imprime?\nA x = new B();\nConsole.WriteLine(x.Quem());\n\nclass A { public string Quem() => "A"; }\nclass B : A { public new string Quem() => "B"; }', 'a', [
          'A',
          'B',
          'AB',
          'Erro de compilação'
        ], 'Com new (ocultação) vale o tipo da VARIÁVEL (A). Por isso convém usar virtual/override.'),
        mcq('q3', 'O que acontece?\nvar f = new Forma();\n\nabstract class Forma\n{\n    public abstract double Area();\n}', 'c', [
          'Cria a forma com área 0',
          'Lança NotImplementedException',
          'Erro de compilação: não se instancia uma classe abstrata',
          'Cria um objeto null'
        ], 'Classes abstract são incompletas de propósito; só podem ser usadas como base.'),
        fill('q4', 'Complete com o modificador que substitui um método virtual da base:', 'class Cachorro : Animal\n{\n    public ___ string Som() => "Au";\n}', ['override'], 'override fornece a nova implementação de um método virtual (ou abstract) da base.'),
        mcq('q5', 'O que acontece?\nAnimal a = new Gato("Mimi");\nCachorro c = (Cachorro)a;\n\nclass Animal { public string Nome { get; } public Animal(string n) { Nome = n; } }\nclass Cachorro : Animal { public Cachorro(string n) : base(n) { } }\nclass Gato : Animal { public Gato(string n) : base(n) { } }', 'b', [
          'c recebe null',
          'Lança InvalidCastException: o objeto real é um Gato',
          'c recebe o Gato convertido',
          'Erro de compilação'
        ], 'O downcast explícito falha em tempo de execução se o objeto não for do tipo. "a as Cachorro" devolveria null sem exceção.'),
        mcq('q6', 'Como a classe derivada Cachorro escolhe o construtor da base que recebe um nome?', 'a', [
          'public Cachorro(string nome) : base(nome) { }',
          'public Cachorro(string nome) : this(nome) { }',
          'public Cachorro(string nome) => Animal(nome);',
          'Construtores são herdados, então não precisa'
        ], 'Usa-se ": base(argumentos)". Construtores não são herdados; this chamaria outro construtor da própria Cachorro.'),
        mcq('q7', 'O que o código imprime?\nConsole.WriteLine(new Ponto());\n\nclass Ponto { public int X; }', 'd', [
          '0',
          '(0, 0)',
          'Nada',
          'Ponto (o nome do tipo)'
        ], 'O ToString padrão de object devolve o nome do tipo. Para outra saída, sobrescreva ToString com override.'),
        fill('q8', 'Complete com o modificador que impede que a classe seja herdada:', '___ class Circulo : Forma\n{\n}', ['sealed'], 'sealed proíbe herdar da classe.')
      ]
    },
    {
      id: 'csb-17-interfaces-abstratas',
      title: 'Interfaces e classes abstratas',
      goal: 'Definir contratos com interface, compartilhar código com classes abstratas e escolher a ferramenta certa.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Interface: um contrato sem implementação',
            'Uma interface descreve O QUE um tipo sabe fazer, sem dizer COMO. Ela lista assinaturas (métodos, propriedades) e quem a implementa é obrigado a fornecer todas elas. Por convenção, o nome começa com I maiúsculo: IAnimal, IComparable, IDisposable. Membros de uma interface são públicos por padrão, então não se escreve public neles.',
            'public interface IAnimal\n{\n    string Nome { get; }\n    string EmitirSom();\n}'
          ),
          sl(
            'Implementando uma interface',
            'Uma classe declara que cumpre o contrato após os dois-pontos, igual à herança. Se faltar qualquer membro da interface, o código não compila. Os membros implementados precisam ser public. A partir daí, a classe "é um" IAnimal.',
            'public class Cachorro : IAnimal\n{\n    public string Nome => "Rex";\n    public string EmitirSom() => "Au!";\n}'
          ),
          sl(
            'Várias interfaces ao mesmo tempo',
            'Em C# uma classe herda de UMA só classe base, mas pode implementar quantas interfaces quiser, separadas por vírgula. É assim que um tipo combina papéis diferentes: um Pato é IAnimal e também IVoador. Se houver classe base, ela vem primeiro na lista.',
            'public interface IVoador { void Voar(); }\n\npublic class Pato : IAnimal, IVoador\n{\n    public string Nome => "Donald";\n    public string EmitirSom() => "Quack!";\n    public void Voar() => Console.WriteLine("Batendo asas");\n}'
          ),
          sl(
            'Classe abstrata: base parcial',
            'Uma classe abstract não pode ser instanciada com new: ela existe para ser herdada. Pode misturar membros abstract (só a assinatura, sem corpo, e as filhas são OBRIGADAS a implementar com override) e membros concretos (código pronto, reaproveitado por todas as filhas). Também pode ter campos, construtor e estado.',
            'public abstract class Forma\n{\n    public abstract double Area();          // sem corpo\n    public string Descrever() => "Area: " + Area(); // concreto\n}\n\npublic class Retangulo : Forma\n{\n    public double L { get; init; }\n    public double A { get; init; }\n    public override double Area() => L * A;\n}\n\n// new Forma();  // ERRO: não é possível instanciar classe abstrata\nConsole.WriteLine(new Retangulo { L = 3, A = 4 }.Descrever()); // Area: 12'
          ),
          sl(
            'Interface ou classe abstrata?',
            'Use INTERFACE para definir um papel/capacidade que tipos totalmente diferentes podem ter (IComparable, IDisposable) e quando precisar de múltiplas heranças de contrato. Interfaces não guardam campos de instância (estado). Use classe ABSTRATA quando as filhas são variações de uma mesma ideia e você quer compartilhar código, campos e construtor. Dá para combinar: uma classe abstrata pode implementar interfaces.',
            'interface = "sabe fazer X"  (várias por classe, sem estado)\nabstract  = "é um tipo de X" (uma só base, com estado e código)'
          ),
          sl(
            'Polimorfismo por interface',
            'Uma variável do tipo da interface aceita qualquer objeto que a implemente, e a chamada vai para a versão do objeto real. Assim o código que usa IAnimal não precisa conhecer as classes concretas, e você troca ou adiciona implementações sem mexer nele.',
            'List<IAnimal> bichos = new() { new Cachorro(), new Pato() };\nforeach (IAnimal a in bichos)\n    Console.WriteLine(a.Nome + ": " + a.EmitirSom());\n// Rex: Au!\n// Donald: Quack!'
          ),
          sl(
            'Implementação explícita e default methods',
            'Na implementação explícita o nome da interface vem antes do método, sem public: ele só é acessível por uma variável do tipo da interface. Serve para resolver conflitos de nomes entre duas interfaces. Interfaces também podem trazer um corpo padrão para um método (default interface method), recurso mais raro que fica para estudos futuros.',
            'public class Robo : IAnimal\n{\n    public string Nome => "R2";\n    string IAnimal.EmitirSom() => "Bip";   // explícita\n}\n\nvar r = new Robo();\n// r.EmitirSom();            // ERRO: não existe em Robo\nConsole.WriteLine(((IAnimal)r).EmitirSom()); // Bip'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que é uma interface em C#?', 'b', [
          'Uma classe pronta que não pode ter métodos',
          'Um contrato que lista membros que as classes implementadoras são obrigadas a fornecer',
          'Uma janela gráfica do programa',
          'Uma classe que só pode ser usada uma única vez'
        ], 'Interface define o que o tipo faz (assinaturas); cada classe que a implementa decide como.'),
        mcq('q2', 'O que acontece neste código?\n\npublic abstract class Forma { public abstract double Area(); }\nvar f = new Forma();', 'c', [
          'Cria uma Forma com Area() devolvendo 0',
          'Compila, mas lança exceção ao chamar Area()',
          'Erro de compilação: não é possível instanciar uma classe abstrata',
          'Cria uma Forma vazia que pode receber Area() depois'
        ], 'Classes abstratas existem para serem herdadas; new só funciona em classes concretas.'),
        mcq('q3', 'Qual regra de C# está correta?', 'd', [
          'Uma classe pode herdar de várias classes e implementar uma interface',
          'Uma classe só pode implementar uma interface',
          'Interfaces podem ser instanciadas com new',
          'Uma classe herda de uma única classe base, mas pode implementar várias interfaces'
        ], 'Herança de classe é única; interfaces podem ser várias, separadas por vírgula.'),
        fill('q4', 'Complete com a palavra-chave que impede a classe de ser instanciada diretamente.', 'public ___ class Forma\n{\n    public abstract double Area();\n}', ['abstract'], 'abstract marca a classe como base incompleta, que só existe para ser herdada.'),
        mcq('q5', 'O que este código imprime?\n\ninterface IAnimal { string Som(); }\nclass Gato : IAnimal { public string Som() => "Miau"; }\nclass Vaca : IAnimal { public string Som() => "Muu"; }\n\nIAnimal[] a = { new Gato(), new Vaca() };\nforeach (var x in a) Console.Write(x.Som() + " ");', 'a', [
          'Miau Muu ',
          'Miau Miau ',
          'IAnimal IAnimal ',
          'Não compila, pois IAnimal não pode ser tipo de array'
        ], 'Polimorfismo: a chamada x.Som() vai para a implementação do objeto real, e IAnimal pode ser usado como tipo de variável e de array.'),
        mcq('q6', 'O que uma classe abstrata pode ter e uma interface (no uso tradicional) não pode?', 'b', [
          'Métodos públicos',
          'Campos de instância (estado) e construtor',
          'Propriedades',
          'Ser herdada ou implementada por outras classes'
        ], 'Interfaces descrevem contrato sem estado; classes abstratas guardam campos e podem ter construtor e código compartilhado.'),
        mcq('q7', 'Dado "string IAnimal.EmitirSom() => "Bip";" dentro de Robo, como chamar o método?', 'c', [
          'new Robo().EmitirSom()',
          'Robo.EmitirSom()',
          'Por uma variável do tipo IAnimal, como ((IAnimal)r).EmitirSom()',
          'Não há como chamar'
        ], 'Implementação explícita só fica visível por meio do tipo da interface.'),
        fill('q8', 'Complete com a palavra-chave que a classe filha usa para implementar um método abstract.', 'public class Quadrado : Forma\n{\n    public ___ double Area() => 4;\n}', ['override'], 'Membros abstratos são implementados com override na classe filha.')
      ]
    },
    {
      id: 'csb-18-enums-structs',
      title: 'Enums e structs',
      goal: 'Representar conjuntos fixos de valores com enum e entender quando um struct (tipo de valor) é melhor que uma class.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Enum: nomes no lugar de números mágicos',
            'Um enum define um conjunto fixo de constantes com nome. Internamente cada nome é um inteiro (int por padrão), começando em 0 e subindo de 1 em 1, a não ser que você atribua valores. Ele deixa o código legível (Status.Ativo em vez de 1) e o compilador ajuda a evitar erros de digitação.',
            'enum Status { Pendente, Ativo, Encerrado }       // 0, 1, 2\nenum Nivel { Baixo = 1, Medio = 5, Alto }        // 1, 5, 6 (continua após o último)\n\nStatus s = Status.Ativo;\nConsole.WriteLine(s);        // Ativo'
          ),
          sl(
            'Conversão entre int e enum',
            'A conversão é feita com cast explícito nos dois sentidos. Cuidado: o cast aceita QUALQUER número, mesmo que não corresponda a um nome do enum. Use Enum.IsDefined para checar se um valor existe antes de confiar nele, principalmente se ele veio de fora (arquivo, rede, usuário).',
            'int n = (int)Status.Encerrado;      // 2\nStatus s = (Status)1;                // Ativo\nStatus estranho = (Status)99;        // compila! mas é um valor sem nome\nConsole.WriteLine(Enum.IsDefined(estranho)); // False'
          ),
          sl(
            'Enum.Parse e Enum.TryParse',
            'Para transformar texto em enum, prefira TryParse: devolve bool e entrega o resultado em um parâmetro out, sem lançar exceção quando o texto é inválido. Há uma sobrecarga com ignoreCase para aceitar "ativo" e "ATIVO". Atenção de segurança: TryParse também aceita textos numéricos como "99" e devolve true, mesmo sem nome correspondente. Para entrada não confiável, combine com Enum.IsDefined.',
            'if (Enum.TryParse<Status>("Ativo", out var s))\n    Console.WriteLine(s);                         // Ativo\n\nEnum.TryParse("encerrado", true, out Status t);   // ignoreCase: true\nConsole.WriteLine(t);                              // Encerrado\n\nbool ok = Enum.TryParse<Status>("99", out var x);\nConsole.WriteLine(ok + " " + Enum.IsDefined(x));   // True False'
          ),
          sl(
            '[Flags]: combinar opções com operações bit a bit',
            'Quando as opções podem ser combinadas (permissões, por exemplo), use [Flags] e valores que são potências de 2 (1, 2, 4, 8...): cada valor ocupa um bit diferente. O operador | combina, & testa/filtra e HasFlag pergunta se um bit está ligado. O ToString de um enum [Flags] lista os nomes combinados. O valor 0 costuma ser "Nenhuma".',
            '[Flags]\nenum Permissao { Nenhuma = 0, Leitura = 1, Escrita = 2, Execucao = 4 }\n\nvar p = Permissao.Leitura | Permissao.Escrita;\nConsole.WriteLine(p);                           // Leitura, Escrita\nConsole.WriteLine(p.HasFlag(Permissao.Escrita)); // True\nConsole.WriteLine((p & Permissao.Execucao) != 0); // False'
          ),
          sl(
            'struct: tipo de valor',
            'Um struct é declarado quase como uma class, mas é tipo de VALOR: a variável guarda os dados em si, e atribuir (b = a) COPIA tudo. Alterar a cópia não afeta o original. Com class (tipo de referência), b = a copia só a referência e as duas variáveis apontam para o MESMO objeto.',
            'struct PontoS { public int X; }\nclass PontoC { public int X; }\n\nvar a = new PontoS { X = 1 }; var b = a; b.X = 99;\nConsole.WriteLine(a.X);   // 1  (cópia independente)\n\nvar c = new PontoC { X = 1 }; var d = c; d.X = 99;\nConsole.WriteLine(c.X);   // 99 (mesmo objeto)'
          ),
          sl(
            'Imutabilidade e quando usar struct',
            'Structs mutáveis causam surpresas porque é fácil alterar uma cópia sem querer. A recomendação é torná-los imutáveis: readonly struct com propriedades somente de leitura. Use struct para valores pequenos e leves que representam UM dado (coordenada, cor, intervalo, dinheiro) e que se comportam como números. Para objetos maiores, com identidade ou que mudam ao longo da vida, use class.',
            'public readonly struct Ponto\n{\n    public int X { get; }\n    public int Y { get; }\n    public Ponto(int x, int y) { X = x; Y = y; }\n}\n// Ponto p = new(1, 2);\n// p.X = 5;   // ERRO: propriedade somente leitura'
          )
        ]
      },
      questions: [
        mcq('q1', 'Dado enum Cor { Vermelho, Verde, Azul }, qual o valor de (int)Cor.Azul?', 'c', [
          '3',
          '1',
          '2',
          '0'
        ], 'Sem valores explícitos, a contagem começa em 0: Vermelho=0, Verde=1, Azul=2.'),
        mcq('q2', 'Dado enum Nivel { Baixo = 1, Medio = 5, Alto }, o que imprime Console.WriteLine((int)Nivel.Alto)?', 'a', [
          '6',
          '2',
          '10',
          '5'
        ], 'Um membro sem valor recebe o anterior mais 1: Alto = 6.'),
        mcq('q3', 'Com enum Nivel { Baixo = 1, Medio = 5, Alto }, qual é verdade sobre Enum.TryParse<Nivel>("99", out var n)?', 'd', [
          'Lança FormatException',
          'Devolve false, pois 99 não é um nome',
          'Devolve false e n vira Baixo',
          'Devolve true e n guarda 99, que não é um membro definido; use Enum.IsDefined para validar'
        ], 'TryParse aceita números em texto. Para entrada não confiável, valide depois com Enum.IsDefined.'),
        fill('q4', 'Complete com o atributo que permite combinar valores do enum com |.', '[___]\nenum Permissao { Nenhuma = 0, Leitura = 1, Escrita = 2, Execucao = 4 }', ['Flags', 'FlagsAttribute'], '[Flags] indica que o enum é um conjunto de bits combináveis, e o ToString lista os nomes ligados.'),
        mcq('q5', 'O que imprime?\n\nstruct P { public int X; }\nvar a = new P { X = 1 };\nvar b = a;\nb.X = 99;\nConsole.WriteLine(a.X);', 'b', [
          '99',
          '1',
          '0',
          'Erro de compilação'
        ], 'struct é tipo de valor: b é uma cópia independente, então a.X continua 1.'),
        mcq('q6', 'O que imprime?\n\n[Flags] enum Perm { Nenhuma = 0, Leitura = 1, Escrita = 2, Execucao = 4 }\nvar p = Perm.Leitura | Perm.Execucao;\nConsole.WriteLine(p);', 'd', [
          '5',
          'Leitura | Execucao',
          'Execucao',
          'Leitura, Execucao'
        ], 'Com [Flags], ToString mostra os nomes dos bits ligados separados por vírgula (Leitura, Execucao).'),
        mcq('q7', 'Qual caso é o MELHOR candidato a struct?', 'a', [
          'Uma coordenada pequena (X, Y) imutável',
          'Um cliente com histórico de pedidos que muda sempre',
          'Uma conexão com banco de dados',
          'Uma grande lista de produtos'
        ], 'Structs servem para valores pequenos, imutáveis e leves; objetos grandes ou com identidade e mudança pedem class.'),
        fill('q8', 'Complete com o método que converte texto em enum sem lançar exceção.', 'if (Enum.___<Status>("Ativo", out var s))\n    Console.WriteLine(s);', ['TryParse'], 'TryParse devolve bool e entrega o valor por out, sem exceção para texto inválido.')
      ]
    },
    {
      id: 'csb-36-organizacao-codigo-namespaces',
      title: 'Organização de código: namespaces, classes estáticas e partial',
      goal: 'Organizar um projeto com namespaces, usings, classes estáticas, tipos aninhados, partial, modificadores de acesso e diretivas.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Namespaces, arquivos e pastas',
            'Em projetos reais o código não cabe em um arquivo só. A convenção: UM tipo principal por arquivo, com o mesmo nome do tipo (Produto.cs contém a classe Produto), e as pastas refletem os namespaces (a pasta Modelos corresponde ao namespace Loja.Modelos). O namespace file-scoped, com ponto e vírgula, vale para o arquivo inteiro e economiza um nível de recuo. Para usar um tipo de outro namespace, o arquivo precisa de um using para ele (ou do nome completo).',
            '// Loja/Modelos/Produto.cs\nnamespace Loja.Modelos;\n\npublic class Produto\n{\n    public string Nome { get; set; } = "";\n}\n\n// Outro arquivo, em outro namespace:\n// using Loja.Modelos;\n// var p = new Produto();'
          ),
          sl(
            'using, alias e using static',
            'O using importa um namespace. Três variações úteis: o ALIAS dá um apelido a um tipo ou namespace (using Lista = System.Collections.Generic.List<int>;), bom para nomes longos ou para resolver conflito entre dois tipos com o mesmo nome; o using static importa os MEMBROS ESTÁTICOS de uma classe, permitindo chamá-los sem o nome da classe (using static System.Math; e depois Max(3, 7)); e o global using vale para o projeto inteiro. Use com moderação: using static em excesso deixa o leitor sem saber de onde vem cada nome.',
            'using static System.Math;\nusing Lista = System.Collections.Generic.List<int>;\n\nvar l = new Lista { 1, 2 };\nConsole.WriteLine(Max(3, 7));   // 7  (Math.Max, sem escrever Math.)\nConsole.WriteLine(l.Count);     // 2'
          ),
          sl(
            'Classes static: utilitários sem estado',
            'Uma classe static não pode ser instanciada (não existe new Util()), nem herdada, e só contém membros static. É o lugar certo para funções utilitárias sem estado, como Math e Console da BCL. Membro static pertence ao TIPO: acessa-se por Tipo.Membro e há uma única cópia. Membro de instância pertence a cada OBJETO e exige um objeto criado. const é implicitamente static: uma constante de classe é acessada pelo nome do tipo. Cuidado: campos static mutáveis são estado global compartilhado, e viram fonte de bugs difíceis (principalmente com vários threads); para utilitários, prefira métodos puros.',
            'static class Util\n{\n    public const int Limite = 10;\n    public static int Dobro(int x) => x * 2;\n}\n\nConsole.WriteLine(Util.Dobro(4));   // 8\nConsole.WriteLine(Util.Limite);     // 10\n// var u = new Util();   // ERRO: não se instancia classe estática'
          ),
          sl(
            'Tipos aninhados e partial class',
            'Um tipo aninhado é declarado DENTRO de outro, útil quando só faz sentido junto do tipo externo (Pedido.Item); fora da classe, usa-se o nome qualificado. Já partial class permite dividir a MESMA classe em vários trechos, no mesmo namespace, cada um com a palavra partial; o compilador junta tudo em uma classe só. É a base dos geradores de código: o gerador cria uma parte automática e você escreve a outra à mão, sem que um sobrescreva o outro. Em código comum, use partial apenas quando houver esse motivo; uma classe grande demais deve ser separada em classes, não em partes.',
            'class Pedido\n{\n    public const string Prefixo = "Item: ";\n    public class Item\n    {\n        public string Nome { get; }\n        public Item(string nome) { Nome = nome; }\n    }\n}\nvar item = new Pedido.Item("Caneta");\nConsole.WriteLine(Pedido.Prefixo + item.Nome);   // Item: Caneta\n\n// Pessoa.cs\npartial class Pessoa\n{\n    public string Nome { get; set; } = "Ana";\n}\n\n// Pessoa.Extras.cs (mesma classe, outro arquivo)\npartial class Pessoa\n{\n    public string Saudar() => "Oi, " + Nome;\n}'
          ),
          sl(
            'Acesso por assembly: public, internal e sealed',
            'Um assembly é o resultado compilado de um projeto (um .dll ou .exe). public deixa o tipo visível para QUALQUER projeto que o referencie; internal, só dentro do próprio assembly. Um tipo de nível superior declarado sem modificador é internal, e os membros sem modificador são private. A regra de ouro do encapsulamento: exponha o mínimo necessário (comece por internal/private e só abra o que outros projetos realmente precisam). Já sealed é outra coisa: impede que a classe seja HERDADA. Serve para classes não projetadas para extensão e deixa a intenção explícita.',
            'public class Publica { }       // visível em outros projetos\ninternal class Interna { }      // só neste projeto (o padrão)\nclass Padrao { }                // também internal\n\nsealed class Final { }\n// class Filha : Final { }      // ERRO: Final é sealed, não pode ser herdada'
          ),
          sl(
            'Diretivas de pré-processador',
            'Diretivas começam com # e orientam o compilador. #region Nome e #endregion criam trechos dobráveis na IDE (só organização visual; abusar de regiões costuma esconder uma classe grande demais). #if DEBUG ... #endif inclui o trecho apenas se o símbolo DEBUG estiver definido: por padrão, em builds Debug sim, em Release não. O atributo [Conditional("DEBUG")] (namespace System.Diagnostics) faz o mesmo para métodos: as CHAMADAS são removidas na compilação em Release, ótimo para logs de depuração. #nullable enable/disable liga ou desliga a análise de nulos a partir daquele ponto do arquivo.',
            'using System.Diagnostics;\n\n#region Cálculos\nstatic int Dobro(int x) => x * 2;\n#endregion\n\n[Conditional("DEBUG")]\nstatic void Log(string msg) => Console.WriteLine("LOG " + msg);\n\nLog("oi");   // aparece em Debug; some em Release\n#if DEBUG\nConsole.WriteLine("modo debug");\n#endif\n#nullable enable'
          ),
          sl(
            'Evite a "classe deus" e organize o projeto',
            'A classe deus (god class) é aquela que faz de tudo: valida, calcula, acessa arquivos e imprime, com centenas ou milhares de linhas. Ela é difícil de ler, testar e alterar: qualquer mudança arrisca quebrar outra coisa. O remédio é o princípio da responsabilidade única: cada classe com UM motivo para mudar. Uma organização simples de pastas: Modelos (dados), Servicos (regras de negócio), Utilitarios (classes static) e Program.cs enxuto no topo. Nomes claros e arquivos pequenos valem mais que comentários. Revise de tempos em tempos e divida o que crescer demais.',
            'Loja/\n  Program.cs\n  Modelos/\n    Produto.cs        // dados\n  Servicos/\n    CalculadoraDePreco.cs   // regras\n  Utilitarios/\n    TextoUtil.cs      // static, sem estado\n\n// Em vez de GerenciadorDeTudo (valida + calcula + grava + imprime):\n// Validador, Calculadora, Repositorio, Relatorio'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual afirmação sobre modificadores está correta?', 'a', [
          'Sem modificador, uma classe de nível superior é internal (visível só no projeto); sealed impede que alguém herde dela',
          'Sem modificador, uma classe de nível superior é public (visível a todos os projetos); sealed impede criar instâncias dela',
          'Sem modificador, uma classe de nível superior é private (visível só no arquivo); sealed impede que alguém herde dela',
          'Sem modificador, uma classe de nível superior é internal (visível só no projeto); sealed impede criar instâncias dela'
        ], 'O padrão de tipos de nível superior é internal. sealed bloqueia a herança, não a criação de objetos.'),
        mcq('q2', 'Dada static class Util { public static int Dobro(int x) => x * 2; }, qual linha NÃO compila?', 'c', [
          'int r = Util.Dobro(4);',
          'Console.WriteLine(Util.Dobro(1) + 1);',
          'Util u = new Util();',
          'int s = Util.Dobro(Util.Dobro(2));'
        ], 'Classes estáticas não podem ser instanciadas. Os membros static são acessados direto pelo nome do tipo.'),
        mcq('q3', 'O que o código imprime?\nusing static System.Math;\nusing Lista = System.Collections.Generic.List<int>;\n\nvar l = new Lista { 1, 2 };\nConsole.WriteLine(Max(3, 7) + l.Count);', 'b', [
          '7',
          '9',
          '5',
          'Erro de compilação'
        ], 'using static permite chamar Max sem Math. (7); o alias Lista é a List<int> com 2 itens. 7 + 2 = 9.'),
        fill('q4', 'Complete com a palavra-chave que permite dividir uma MESMA classe em mais de um trecho/arquivo:', 'public ___ class Pedido\n{\n    // ...parte 1\n}', ['partial'], 'partial class junta, na compilação, todos os trechos declarados com partial em uma só classe; é a base dos geradores de código.'),
        mcq('q5', 'O que o código imprime?\nclass Pedido\n{\n    public const string Prefixo = "Item: ";\n    public class Item\n    {\n        public string Nome { get; }\n        public Item(string nome) { Nome = nome; }\n    }\n}\nvar item = new Pedido.Item("Caneta");\nConsole.WriteLine(Pedido.Prefixo + item.Nome);', 'd', [
          'Erro: Item não pode ser criado fora de Pedido',
          'Item: ',
          'Caneta',
          'Item: Caneta'
        ], 'Um tipo aninhado público é acessado pelo nome qualificado (Pedido.Item), e a const é acessada pelo nome do tipo. A saída é "Item: Caneta".'),
        mcq('q6', 'Qual é o sinal mais claro de uma "classe deus"?', 'a', [
          'Uma única classe que valida, calcula, grava em arquivo e imprime tudo, com centenas de linhas',
          'Uma classe sealed pequena, que só guarda as constantes usadas por todo o projeto',
          'Uma classe partial, dividida em dois arquivos por causa de um gerador de código',
          'Uma classe static com alguns métodos utilitários independentes e sem nenhum estado'
        ], 'Classe deus concentra responsabilidades demais. O remédio é dividir por responsabilidade única.'),
        mcq('q7', 'Ao compilar em Release, o que acontece com a chamada a um método marcado com [Conditional("DEBUG")]?', 'c', [
          'A chamada lança exceção na primeira execução do programa',
          'A chamada continua e o método roda normalmente em qualquer configuração',
          'A chamada é removida na compilação, como se não existisse',
          'O compilador recusa compilar até que o atributo seja retirado'
        ], '[Conditional] remove as chamadas quando o símbolo não está definido; em builds Release o DEBUG não está.'),
        fill('q8', 'Complete a declaração de namespace file-scoped (sem chaves; vale para o arquivo inteiro):', 'namespace Loja___\n\nclass Produto { }', [';'], 'O namespace file-scoped termina com ponto e vírgula e vale para todo o arquivo.')
      ]
    },
    {
      id: 'csb-19-records-imutabilidade',
      title: 'Records e imutabilidade',
      goal: 'Usar records para modelar dados imutáveis com igualdade por valor, cópia com with e ToString automático.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'record posicional: uma linha, muito código pronto',
            'Um record é um tipo feito para carregar DADOS. A forma posicional declara os dados entre parênteses, e o compilador gera sozinho: as propriedades (somente init), o construtor, Equals/GetHashCode por valor, ToString legível, Deconstruct e o suporte a with. Por padrão, um record é uma classe (tipo de referência).',
            'public record Pessoa(string Nome, int Idade);\n\nvar a = new Pessoa("Ana", 30);\nConsole.WriteLine(a.Nome);   // Ana'
          ),
          sl(
            'ToString automático',
            'Imprimir um record mostra o nome do tipo e o valor de cada propriedade, ótimo para depurar e para logs (cuidado para não registrar dados pessoais reais em logs). Em uma class comum, ToString devolveria só o nome do tipo.',
            'var a = new Pessoa("Ana", 30);\nConsole.WriteLine(a);\n// Pessoa { Nome = Ana, Idade = 30 }'
          ),
          sl(
            'Igualdade por valor',
            'Com class, == compara REFERÊNCIAS: dois objetos distintos com os mesmos dados são diferentes. Com record, == e Equals comparam os VALORES de todas as propriedades: mesmos dados, igualdade verdadeira. Isso é ideal para valores como endereço, coordenada, dinheiro.',
            'class PessoaC { public string Nome = ""; }\nvar c1 = new PessoaC { Nome = "Ana" };\nvar c2 = new PessoaC { Nome = "Ana" };\nConsole.WriteLine(c1 == c2);   // False (referências)\n\nvar r1 = new Pessoa("Ana", 30);\nvar r2 = new Pessoa("Ana", 30);\nConsole.WriteLine(r1 == r2);   // True (valores)'
          ),
          sl(
            'with: cópia não destrutiva',
            'Como as propriedades são somente init, você não altera um record depois de criado. Para obter uma versão modificada, use with: ele cria uma NOVA instância copiando tudo e trocando só o que você indicou. O original permanece intacto, o que evita bugs de alteração inesperada.',
            'var a = new Pessoa("Ana", 30);\nvar b = a with { Idade = 31 };\nConsole.WriteLine(a.Idade);  // 30\nConsole.WriteLine(b.Idade);  // 31'
          ),
          sl(
            'init: atribuir só na criação',
            'init é um tipo de set que só funciona durante a criação do objeto (construtor ou inicializador de objeto). Depois disso, tentar atribuir é erro de compilação. Você pode usar init em records não posicionais e em classes comuns para ter imutabilidade.',
            'public record Produto\n{\n    public string Nome { get; init; } = "";\n    public int Qtd { get; init; }\n}\n\nvar p = new Produto { Nome = "Caneta", Qtd = 2 };   // OK\n// p.Qtd = 5;   // ERRO: propriedade init-only'
          ),
          sl(
            'Deconstruct e record struct',
            'Records posicionais podem ser "desmontados" em variáveis: var (nome, idade) = pessoa. Se você quer semântica de VALOR (cópia, sem alocação de objeto), use record struct, que também gera ToString e igualdade por valor. Para ser imutável, declare readonly record struct. A forma "record class" é igual ao record simples.',
            'var (nome, idade) = new Pessoa("Ana", 30);\nConsole.WriteLine(nome + " " + idade);   // Ana 30\n\npublic readonly record struct Ponto(int X, int Y);\nConsole.WriteLine(new Ponto(1, 2));     // Ponto { X = 1, Y = 2 }'
          ),
          sl(
            'Record ou class?',
            'Use record para dados com igualdade por valor e pouco comportamento: DTOs, resultados, mensagens, valores de domínio. Use class quando o objeto tem IDENTIDADE e estado que muda (uma conta bancária, uma conexão) ou muito comportamento. Atenção: a imutabilidade é "rasa": se o record guarda uma List, a lista em si continua mutável e a igualdade compara a referência dela.',
            'record Pedido(int Id, List<string> Itens);\n// Itens.Add("x") ainda funciona: só a referência é imutável'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que imprime?\n\nclass C { public int N; }\nrecord R(int N);\nvar c1 = new C { N = 1 }; var c2 = new C { N = 1 };\nConsole.WriteLine((c1 == c2) + " " + (new R(1) == new R(1)));', 'a', [
          'False True',
          'True True',
          'True False',
          'False False'
        ], 'class compara referências (False); record compara valores (True).'),
        mcq('q2', 'O que imprime?\n\nrecord Pessoa(string Nome, int Idade);\nConsole.WriteLine(new Pessoa("Ana", 30));', 'c', [
          'Pessoa',
          'Ana 30',
          'Pessoa { Nome = Ana, Idade = 30 }',
          'new Pessoa("Ana", 30)'
        ], 'O ToString gerado mostra o nome do tipo e cada propriedade com seu valor.'),
        mcq('q3', 'O que imprime?\n\nvar a = new Pessoa("Ana", 30);\nvar b = a with { Idade = 31 };\nConsole.WriteLine(a.Idade + " " + b.Idade);', 'd', [
          '31 31',
          '30 30',
          '31 30',
          '30 31'
        ], 'with cria uma cópia modificada; o original continua com 30.'),
        fill('q4', 'Complete com a palavra-chave que cria uma cópia modificada de um record.', 'var b = a ___ { Idade = 31 };', ['with'], 'a with { ... } copia o record e substitui apenas as propriedades indicadas.'),
        mcq('q5', 'Qual afirmação sobre tipos é verdadeira?', 'b', [
          'record e record struct são ambos tipos de referência',
          'record (posicional) é uma classe, e record struct é um tipo de valor',
          'record sempre é um tipo de valor',
          'record struct é tipo de referência e record é de valor'
        ], 'record é uma classe por padrão; record struct tem semântica de valor.'),
        mcq('q6', 'O que acontece?\n\nrecord Pessoa(string Nome, int Idade);\nvar p = new Pessoa("Ana", 30);\np.Idade = 31;', 'a', [
          'Erro de compilação: propriedade init-only só pode ser atribuída na criação',
          'Altera a idade normalmente',
          'Lança exceção em tempo de execução',
          'Cria uma cópia automaticamente'
        ], 'As propriedades de um record posicional são init; para mudar use with.'),
        mcq('q7', 'O que imprime?\n\nvar (n, i) = new Pessoa("Bia", 22);\nConsole.WriteLine(i + " " + n);', 'd', [
          'Bia 22',
          'Erro: records não suportam desconstrução',
          '22',
          '22 Bia'
        ], 'Deconstruct entrega os valores na ordem dos parâmetros: n = Bia, i = 22. A impressão é "22 Bia".'),
        fill('q8', 'Complete com a palavra-chave que declara um tipo de dados com igualdade por valor.', 'public ___ Pessoa(string Nome, int Idade);', ['record'], 'record gera propriedades, igualdade por valor, ToString, with e Deconstruct.')
      ]
    },
    {
      id: 'csb-34-object-igualdade-comparacao',
      title: 'object: ToString, Equals, GetHashCode e comparação',
      goal: 'Entender os métodos herdados de object, sobrescrever igualdade e hash de forma coerente e ordenar objetos com IComparable.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Todo tipo herda de object',
            'Em C#, todo tipo (classes, structs, enums, até int) deriva de object, e por isso herda alguns métodos: ToString(), Equals(object?), GetHashCode() e GetType(). O ToString padrão de uma classe devolve apenas o NOME do tipo, o que é pouco útil ao depurar. Sobrescrevendo-o com override, você decide como o objeto vira texto; Console.WriteLine, a interpolação ($"{obj}") e a concatenação com + chamam ToString automaticamente. Cuidado ao escrever ToString: não inclua dados pessoais ou segredos, pois ele costuma ir parar em logs.',
            'class Produto { }\n\nclass ProdutoOk\n{\n    public string Nome { get; }\n    public int Qtd { get; }\n    public ProdutoOk(string nome, int qtd) { Nome = nome; Qtd = qtd; }\n    public override string ToString() => $"{Nome} x{Qtd}";\n}\n\nConsole.WriteLine(new Produto());              // Produto\nConsole.WriteLine(new ProdutoOk("Caneta", 3)); // Caneta x3'
          ),
          sl(
            'Igualdade por referência (padrão nas classes)',
            'Para classes, o == e o Equals padrão comparam REFERÊNCIAS: só são iguais se as duas variáveis apontam para o MESMO objeto na memória. Dois objetos criados separadamente com os mesmos dados são considerados diferentes. ReferenceEquals(a, b) pergunta explicitamente isso: "é o mesmo objeto?", e não pode ser alterado por ninguém. Algumas exceções já trazem igualdade por valor: string (o == compara o conteúdo), structs e records. Para suas classes, comparar por valor exige trabalho extra, que veremos a seguir.',
            'class Caixa { public int N; public Caixa(int n) { N = n; } }\n\nvar a = new Caixa(1);\nvar b = new Caixa(1);\nvar c = a;\nConsole.WriteLine(a == b);              // False (objetos diferentes)\nConsole.WriteLine(a == c);              // True  (mesmo objeto)\nConsole.WriteLine(a.Equals(b));         // False\nConsole.WriteLine(ReferenceEquals(a, c)); // True'
          ),
          sl(
            'Sobrescrever Equals e GetHashCode JUNTOS',
            'Para comparar por valor, sobrescreva Equals(object?) definindo quais campos importam. Mas sempre sobrescreva GetHashCode junto, pois existe um contrato: se dois objetos são IGUAIS, eles DEVEM devolver o mesmo código hash (o inverso não vale: hashes iguais não garantem objetos iguais). O hash é um número inteiro que resume o objeto; HashCode.Combine(campos...) calcula um bom valor a partir dos campos usados no Equals. Use apenas campos que não mudam depois que o objeto entra em uma coleção. O compilador avisa se você sobrescreve só um dos dois. Atenção: sobrescrever Equals não muda o operador ==, que continua comparando referências a menos que você também o sobrecarregue.',
            'class Ponto\n{\n    public int X { get; }\n    public int Y { get; }\n    public Ponto(int x, int y) { X = x; Y = y; }\n\n    public override bool Equals(object? obj) =>\n        obj is Ponto o && X == o.X && Y == o.Y;\n\n    public override int GetHashCode() => HashCode.Combine(X, Y);\n\n    public override string ToString() => $"({X}, {Y})";\n}\n\nConsole.WriteLine(new Ponto(1, 2).Equals(new Ponto(1, 2)));  // True'
          ),
          sl(
            'Por que Dictionary e HashSet dependem do hash',
            'Dictionary e HashSet guardam os itens em "gavetas" escolhidas pelo código hash e só então usam Equals para conferir o item dentro da gaveta. Se o GetHashCode não for coerente com o Equals, dois objetos "iguais" caem em gavetas diferentes: o HashSet aceita duplicados, Contains devolve false para um item que está lá e o dicionário não acha uma chave que parece existir. Sem override, as classes usam hash e igualdade por referência, e cada new vira um item diferente.',
            '// Caixa (sem override): cada new é um item distinto\nvar s1 = new HashSet<Caixa> { new Caixa(1), new Caixa(1) };\nConsole.WriteLine(s1.Count);   // 2\n\n// Ponto (com Equals + GetHashCode)\nvar s2 = new HashSet<Ponto> { new Ponto(1, 2), new Ponto(1, 2) };\nConsole.WriteLine(s2.Count);   // 1\n\nvar d = new Dictionary<Ponto, string>();\nd[new Ponto(1, 2)] = "A";\nConsole.WriteLine(d[new Ponto(1, 2)]);   // A'
          ),
          sl(
            'IEquatable<T>: Equals tipado',
            'IEquatable<T> é uma interface com um único método, Equals(T? other), que compara com o tipo exato, sem precisar de cast. É a forma recomendada de definir igualdade por valor: coleções genéricas a usam quando disponível, e em structs evita a conversão para object (boxing). O padrão fica: implementar IEquatable<T>, fazer o Equals(object?) delegar ao tipado e manter o GetHashCode coerente. Se você sobrecarregar o operador ==, sobrecarregue também != (o compilador exige o par) para que ==, Equals e hash contem a mesma história.',
            'class Ponto : IEquatable<Ponto>\n{\n    public int X { get; }\n    public int Y { get; }\n    public Ponto(int x, int y) { X = x; Y = y; }\n\n    public bool Equals(Ponto? other) =>\n        other is not null && X == other.X && Y == other.Y;\n    public override bool Equals(object? obj) => Equals(obj as Ponto);\n    public override int GetHashCode() => HashCode.Combine(X, Y);\n\n    public static bool operator ==(Ponto? a, Ponto? b) => a is null ? b is null : a.Equals(b);\n    public static bool operator !=(Ponto? a, Ponto? b) => !(a == b);\n}\n\nConsole.WriteLine(new Ponto(1, 2) == new Ponto(1, 2));   // True'
          ),
          sl(
            'Ordenar: IComparable<T>, IComparer<T> e Comparison<T>',
            'Para ordenar com Sort(), o tipo precisa saber se um objeto vem antes de outro. Implementando IComparable<T> você escreve CompareTo(T? other), que devolve um número NEGATIVO (este vem antes), ZERO (equivalentes) ou POSITIVO (este vem depois). Muitos tipos da BCL (int, string, DateTime) já fazem isso. Sort() em uma lista de tipo sem IComparable lança InvalidOperationException. Para uma ordem diferente, sem mexer na classe, use uma lambda (Comparison<T>) como (a, b) => b.Idade.CompareTo(a.Idade), ou uma classe que implementa IComparer<T> para reaproveitar o critério.',
            'class Pessoa : IComparable<Pessoa>\n{\n    public string Nome { get; }\n    public int Idade { get; }\n    public Pessoa(string nome, int idade) { Nome = nome; Idade = idade; }\n    public int CompareTo(Pessoa? other) =>\n        other is null ? 1 : Idade.CompareTo(other.Idade);\n}\n\nvar lista = new List<Pessoa> { new("Ana", 30), new("Bia", 20), new("Caio", 25) };\nlista.Sort();   // por Idade (CompareTo)\nConsole.WriteLine(string.Join(", ", lista.Select(p => p.Nome)));  // Bia, Caio, Ana\nlista.Sort((p, q) => q.Idade.CompareTo(p.Idade));   // mais velho primeiro\nConsole.WriteLine(string.Join(", ", lista.Select(p => p.Nome)));  // Ana, Caio, Bia'
          ),
          sl(
            'record já faz isso por você',
            'Na lição de records vimos que o compilador gera, sozinho, igualdade por valor, ToString legível e hash coerente. É exatamente o trabalho desta lição, automatizado: Equals, GetHashCode, == e != comparam todas as propriedades. O que o record NÃO gera é a ordenação: se quiser Sort(), implemente IComparable<T> ou passe uma Comparison. Mesmo com == verdadeiro, ReferenceEquals continua dizendo que são dois objetos distintos. Quando a igualdade por valor basta e não há comportamento complexo, prefira record a escrever tudo à mão.',
            'record R(int N);\n\nvar r1 = new R(1);\nvar r2 = new R(1);\nConsole.WriteLine(r1 == r2);                 // True  (valor)\nConsole.WriteLine(ReferenceEquals(r1, r2));  // False (dois objetos)\nConsole.WriteLine(r1);                       // R { N = 1 }'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que o código imprime?\nclass Produto { }\nclass ProdutoOk\n{\n    public string Nome { get; }\n    public int Qtd { get; }\n    public ProdutoOk(string nome, int qtd) { Nome = nome; Qtd = qtd; }\n    public override string ToString() => $"{Nome} x{Qtd}";\n}\nConsole.WriteLine(new Produto() + " | " + new ProdutoOk("Caneta", 3));', 'c', [
          'Produto | ProdutoOk',
          'Caneta x3 | Caneta x3',
          'Produto | Caneta x3',
          'Erro de compilação'
        ], 'Sem override, ToString devolve o nome do tipo (Produto). Com override, a concatenação usa o texto definido: Caneta x3.'),
        mcq('q2', 'O que o código imprime?\nclass Caixa { public int N; public Caixa(int n) { N = n; } }\nvar a = new Caixa(1);\nvar b = new Caixa(1);\nvar c = a;\nConsole.WriteLine((a == b) + " " + (a == c) + " " + a.Equals(b));', 'a', [
          'False True False',
          'True True True',
          'False True True',
          'True True False'
        ], 'Em classes sem sobrescrita, == e Equals comparam referências: a e b são objetos diferentes (False), a e c são o mesmo (True).'),
        mcq('q3', 'Qual é a regra do contrato entre Equals e GetHashCode?', 'd', [
          'Se dois objetos têm o mesmo hash, então Equals deve sempre devolver true',
          'GetHashCode deve devolver um valor diferente para cada instância criada',
          'GetHashCode pode ser omitido, pois só o Equals é consultado pelas coleções',
          'Se Equals diz que dois objetos são iguais, ambos devem ter o mesmo hash'
        ], 'Objetos iguais precisam de hashes iguais. O contrário não vale: hashes iguais podem ocorrer (colisão) com objetos diferentes.'),
        fill('q4', 'Complete com a interface genérica que define o Equals tipado:', 'class Ponto : ___<Ponto>\n{\n    public int X { get; }\n    public int Y { get; }\n    public bool Equals(Ponto? other) => other is not null && X == other.X && Y == other.Y;\n}', ['IEquatable'], 'IEquatable<T> declara Equals(T? other), a forma tipada de comparar por valor, sem cast.'),
        mcq('q5', 'Ponto sobrescreve Equals e GetHashCode usando X e Y. Quanto vale s.Count?\nvar s = new HashSet<Ponto>();\ns.Add(new Ponto(1, 2));\ns.Add(new Ponto(1, 2));\ns.Add(new Ponto(2, 1));\nConsole.WriteLine(s.Count);', 'b', [
          '3',
          '2',
          '1',
          'Lança exceção'
        ], 'O segundo (1, 2) é igual ao primeiro e não entra de novo. (2, 1) é diferente, então ficam 2 itens.'),
        mcq('q6', 'Pessoa implementa IComparable<Pessoa> com CompareTo por Idade. O que imprime?\nvar l = new List<Pessoa> { new("Ana", 30), new("Bia", 20), new("Caio", 25) };\nl.Sort();\nConsole.WriteLine(string.Join(", ", l.Select(p => p.Nome)));', 'c', [
          'Ana, Bia, Caio',
          'Ana, Caio, Bia',
          'Bia, Caio, Ana',
          'Caio, Bia, Ana'
        ], 'Sort() usa CompareTo: ordem crescente de idade (20, 25, 30), ou seja, Bia, Caio, Ana.'),
        mcq('q7', 'O que o código imprime?\nrecord R(int N);\nvar r1 = new R(1);\nvar r2 = new R(1);\nConsole.WriteLine((r1 == r2) + " " + ReferenceEquals(r1, r2));', 'a', [
          'True False',
          'False False',
          'True True',
          'False True'
        ], 'O record compara por valor (== True), mas são dois objetos na memória, então ReferenceEquals é False.'),
        fill('q8', 'Complete para ordenar do MAIS VELHO para o mais novo, usando uma lambda:', 'lista.Sort((p, q) => q.Idade.___(p.Idade));', ['CompareTo'], 'CompareTo devolve negativo, zero ou positivo. Invertendo a ordem dos operandos (q antes de p), a ordenação fica decrescente.')
      ]
    },
    {
      id: 'csb-20-excecoes',
      title: 'Tratamento de exceções',
      goal: 'Capturar, lançar e criar exceções corretamente, sem usá-las como fluxo normal do programa.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'try, catch e finally',
            'Quando algo dá errado em tempo de execução, o programa lança uma exceção. Se ninguém a captura, o programa encerra. O bloco try contém o código que pode falhar; catch trata o erro; finally roda SEMPRE no final, com ou sem exceção, e é o lugar para limpeza.',
            'try\n{\n    int r = 10 / int.Parse("0");\n}\ncatch (DivideByZeroException)\n{\n    Console.WriteLine("div0");\n}\nfinally\n{\n    Console.WriteLine("fim");\n}\n// div0\n// fim'
          ),
          sl(
            'Hierarquia e exceções comuns',
            'Todas as exceções herdam de System.Exception, que tem Message, StackTrace e InnerException. Comuns: ArgumentNullException (argumento nulo), ArgumentException (argumento inválido), InvalidOperationException (operação inválida no estado atual do objeto), DivideByZeroException (divisão inteira por zero), FormatException (texto em formato errado, como int.Parse("abc")), IndexOutOfRangeException, KeyNotFoundException e NullReferenceException.',
            'int.Parse("abc");               // FormatException\nint[] v = new int[2]; v[5] = 1;  // IndexOutOfRangeException\nnew List<int>().First();         // InvalidOperationException'
          ),
          sl(
            'Vários catch: do específico ao geral',
            'Você pode ter vários catch em sequência; vale o PRIMEIRO que combina. Por isso coloque os tipos mais específicos antes e os mais gerais (Exception) por último. Se um catch geral vier antes de um específico, o compilador acusa erro, porque o específico nunca seria alcançado. A cláusula when adiciona uma condição: o catch só captura se ela for verdadeira.',
            'try { /* ... */ }\ncatch (FormatException ex)\n{\n    Console.WriteLine("Formato inválido");\n}\ncatch (ArgumentException ex) when (ex.ParamName == "id")\n{\n    Console.WriteLine("id inválido");\n}\ncatch (Exception ex)\n{\n    Console.WriteLine("Erro inesperado: " + ex.Message);\n}'
          ),
          sl(
            'throw, throw; e throw ex',
            'throw new X(...) lança uma exceção nova. Dentro de um catch, throw; (sem nada) relança a MESMA exceção preservando o stack trace original, que mostra onde o erro nasceu. throw ex; também relança, mas reinicia o stack trace, escondendo a origem do problema. Regra: para relançar, use sempre throw;.',
            'try { Processar(); }\ncatch (Exception ex)\n{\n    Console.WriteLine("Registrando erro...");\n    throw;        // bom: preserva o stack trace\n    // throw ex;  // ruim: perde a origem do erro\n}'
          ),
          sl(
            'Validar com ArgumentNullException.ThrowIfNull',
            'Métodos públicos devem validar seus argumentos logo no início e falhar rápido com a exceção certa. ArgumentNullException.ThrowIfNull(x) lança se x for nulo e já informa o nome do parâmetro. Existe ainda ArgumentException.ThrowIfNullOrWhiteSpace para textos. Assim o erro aparece perto da causa, e não depois, longe do problema.',
            'void Cadastrar(string nome)\n{\n    ArgumentNullException.ThrowIfNull(nome);\n    // ... usa nome com segurança\n}\n\nCadastrar(null!);   // ArgumentNullException (parâmetro: nome)'
          ),
          sl(
            'Exceções personalizadas',
            'Para erros de negócio com significado próprio, crie uma classe que herda de Exception (o nome termina em Exception). Ofereça ao menos um construtor que receba a mensagem e a repasse com base(...). Assim quem usa o seu código captura exatamente esse tipo.',
            'public class SaldoInsuficienteException : Exception\n{\n    public SaldoInsuficienteException(string mensagem) : base(mensagem) { }\n}\n\n// throw new SaldoInsuficienteException("Saldo menor que o valor.");'
          ),
          sl(
            'using e quando NÃO usar exceções',
            'Recursos como arquivos e conexões precisam ser liberados mesmo se houver exceção: o using chama Dispose ao sair do bloco (visão geral aqui; veremos mais em memória). Outro ponto: exceções são lentas e servem para situações EXCEPCIONAIS. Para fluxo esperado, como entrada digitada pelo usuário, prefira os métodos TryParse, que devolvem bool, em vez de capturar FormatException.',
            'using var arq = new StreamReader("dados.txt");   // fechado ao fim do escopo\n\nif (int.TryParse(texto, out int n))\n    Console.WriteLine(n * 2);\nelse\n    Console.WriteLine("Digite um número.");'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que imprime?\n\ntry { Console.Write("A"); throw new InvalidOperationException(); }\ncatch (InvalidOperationException) { Console.Write("B"); }\nfinally { Console.Write("C"); }', 'd', [
          'AC',
          'ABC apenas se não houver exceção',
          'AB',
          'ABC'
        ], 'Imprime A, depois o catch imprime B e o finally sempre roda, imprimindo C.'),
        mcq('q2', 'O que acontece com este código?\n\ntry { int.Parse("x"); }\ncatch (Exception) { }\ncatch (FormatException) { }', 'b', [
          'Compila e captura FormatException no segundo catch',
          'Erro de compilação: o catch geral já captura o tipo mais específico',
          'Compila, mas o segundo catch é ignorado em silêncio',
          'Lança exceção em tempo de execução'
        ], 'Catches devem ir do mais específico ao mais geral; o compilador recusa o catch inalcançável.'),
        mcq('q3', 'Dentro de um catch, qual a forma correta de relançar a exceção preservando o stack trace?', 'a', [
          'throw;',
          'throw ex;',
          'throw new Exception();',
          'return ex;'
        ], 'throw; mantém o stack trace original; throw ex; o reinicia e esconde a origem.'),
        fill('q4', 'Complete com o bloco que roda sempre, haja ou não exceção.', 'try\n{\n    Abrir();\n}\ncatch (IOException)\n{\n    Console.WriteLine("falhou");\n}\n___\n{\n    Console.WriteLine("sempre");\n}', ['finally'], 'finally executa em qualquer caso e serve para limpeza.'),
        mcq('q5', 'O que imprime?\n\ntry { throw new ArgumentException("x"); }\ncatch (ArgumentException ex) when (ex.Message == "y") { Console.Write("1"); }\ncatch (Exception) { Console.Write("2"); }', 'c', [
          '1',
          '12',
          '2',
          'Nada, a exceção escapa'
        ], 'A condição when é falsa, então o primeiro catch não captura e o segundo (Exception) trata: imprime 2.'),
        mcq('q6', 'Como se cria uma exceção personalizada?', 'a', [
          'Criando uma classe que herda de Exception',
          'Criando uma interface IException',
          'Usando a palavra-chave customthrow',
          'Declarando um enum de erros'
        ], 'Exceções são classes; as próprias herdam de Exception (ou de uma derivada) e costumam terminar em Exception.'),
        mcq('q7', 'Para ler um número digitado pelo usuário, qual é a abordagem recomendada?', 'd', [
          'Usar int.Parse e capturar FormatException em todo caso de entrada inválida',
          'Ignorar erros: o usuário sempre digita certo',
          'Usar catch (Exception) vazio',
          'Usar int.TryParse e checar o bool devolvido'
        ], 'Entrada inválida é fluxo esperado, não exceção. TryParse evita o custo e a complexidade de capturar.'),
        fill('q8', 'Complete com o método que lança ArgumentNullException se o argumento for nulo.', 'void Cadastrar(string nome)\n{\n    ArgumentNullException.___(nome);\n}', ['ThrowIfNull'], 'ThrowIfNull valida o argumento e informa o nome do parâmetro na exceção.')
      ]
    },
    {
      id: 'csb-21-null-safety',
      title: 'Null e segurança contra nulos',
      goal: 'Evitar NullReferenceException usando tipos anuláveis, operadores ?. ?? ??= e verificações com is null.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'null e NullReferenceException',
            'null significa "nenhum objeto": a variável de referência não aponta para nada. Acessar membro de algo nulo (nome.Length com nome nulo) lança NullReferenceException, um dos erros mais comuns em C#. O resto desta lição trata de duas coisas: representar "ausência" de forma explícita e se proteger dela.',
            'string nome = null;              // aviso do compilador (veremos)\nConsole.WriteLine(nome.Length);  // NullReferenceException em execução'
          ),
          sl(
            'Tipos de valor anuláveis: int?',
            'Tipos de valor (int, bool, DateTime) não aceitam null. Para representar "sem valor", acrescente ? ao tipo: int? é Nullable<int>. Ele tem HasValue (bool), Value (o número; lança InvalidOperationException se estiver vazio) e GetValueOrDefault() (devolve o valor ou o padrão do tipo, 0 para int; aceita também um padrão personalizado).',
            'int? idade = null;\nConsole.WriteLine(idade.HasValue);            // False\nConsole.WriteLine(idade.GetValueOrDefault()); // 0\nConsole.WriteLine(idade.GetValueOrDefault(18)); // 18\n// Console.WriteLine(idade.Value);  // InvalidOperationException\n\nidade = 30;\nConsole.WriteLine(idade.Value);               // 30'
          ),
          sl(
            'Nullable reference types: string e string?',
            'Em projetos novos, o compilador analisa nulos (propriedade <Nullable>enable</Nullable> no .csproj). Com isso, string significa "nunca nulo" e string? significa "pode ser nulo". Se você atribuir null a string ou usar um string? sem checar, o compilador emite AVISOS (como CS8600 e CS8602), não erros. Eles são o seu mapa de bugs de nulo: leve-os a sério e trate cada um.',
            'string a = "oi";\nstring? b = null;        // permitido: o tipo diz que pode ser nulo\n// string c = null;      // aviso CS8600\n// Console.WriteLine(b.Length);  // aviso CS8602: b pode ser nulo'
          ),
          sl(
            '?. e ??: navegar e dar valor padrão',
            'O operador ?. (condicional nulo) só acessa o membro se o objeto não for nulo; senão a expressão inteira vira null, sem exceção. O operador ?? (coalescência nula) devolve o lado esquerdo se não for nulo, ou o direito caso contrário. Combinados, resolvem muitos casos em uma linha.',
            'string? nome = null;\nint? tam = nome?.Length;          // null, sem exceção\nint t = nome?.Length ?? -1;       // -1\nstring exibicao = nome ?? "anônimo";\nConsole.WriteLine(exibicao);      // anônimo'
          ),
          sl(
            '??= : atribuir só se for nulo',
            'a ??= b significa "se a for nulo, a recebe b; senão não faz nada". É ótimo para valores padrão e para inicialização preguiçosa (criar a lista só na primeira vez que ela é necessária).',
            'int? n = null;\nn ??= 7;                  // n era nulo: vira 7\nn ??= 9;                  // n já tem valor: continua 7\nConsole.WriteLine(n);     // 7\n\nList<string>? itens = null;\nitens ??= new List<string>();'
          ),
          sl(
            'is null, is not null e o operador !',
            'Para testar nulidade, prefira is null e is not null: eles não podem ser sobrescritos por um == personalizado e leem como português. O operador ! ("null-forgiving") apenas CALA o aviso do compilador, dizendo "confie em mim, não é nulo": ele não verifica nada. Se você estiver errado, a NullReferenceException acontece mesmo assim. Use com muito critério.',
            'string? texto = LerAlgo();\nif (texto is not null)\n    Console.WriteLine(texto.Length);   // seguro: o compilador sabe\n\nint t = texto!.Length;   // silencia o aviso; se for nulo, explode'
          ),
          sl(
            'Boas práticas',
            'Prefira não devolver null: retorne coleção vazia em vez de null, use valores padrão ou o padrão TryXxx. Valide argumentos públicos com ArgumentNullException.ThrowIfNull. Marque como string? só o que realmente pode faltar e trate todos os avisos do compilador em vez de espalhar !. Para dados de formulário ou JSON de fontes externas, sempre assuma que campos podem vir ausentes.',
            'List<string> Buscar() => new List<string>();   // vazia, nunca null\n\nif (dicionario.TryGetValue("chave", out var valor))\n    Console.WriteLine(valor);'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que acontece em tempo de execução?\n\nstring s = null;\nConsole.WriteLine(s.Length);', 'b', [
          'Imprime 0',
          'Lança NullReferenceException',
          'Imprime vazio',
          'Lança FormatException'
        ], 'Acessar um membro de referência nula lança NullReferenceException (o compilador só avisa).'),
        mcq('q2', 'O que imprime?\n\nint? n = null;\nConsole.WriteLine(n.HasValue + " " + n.GetValueOrDefault());', 'a', [
          'False 0',
          'True 0',
          'False',
          'Lança InvalidOperationException'
        ], 'Sem valor, HasValue é False e GetValueOrDefault() devolve o padrão de int: 0.'),
        mcq('q3', 'O que imprime?\n\nstring? nome = null;\nConsole.WriteLine(nome?.Length ?? -1);', 'd', [
          'null',
          '0',
          'Lança NullReferenceException',
          '-1'
        ], 'nome?.Length vira null, e o ?? troca o null por -1.'),
        fill('q4', 'Complete com o operador de coalescência nula, que usa o valor da direita se o da esquerda for nulo.', 'string exibicao = nome ___ "anônimo";', ['??'], 'a ?? b devolve a se não for nulo, senão b.'),
        mcq('q5', 'O que imprime?\n\nint? n = null;\nn ??= 7;\nn ??= 9;\nConsole.WriteLine(n);', 'c', [
          '9',
          'Nada (null)',
          '7',
          '16'
        ], '??= só atribui se a variável for nula: o primeiro define 7, o segundo é ignorado.'),
        mcq('q6', 'O que acontece?\n\nint? n = null;\nint x = n.Value;', 'b', [
          'x recebe 0',
          'Lança InvalidOperationException',
          'Erro de compilação',
          'x recebe -1'
        ], 'Value em um Nullable vazio lança InvalidOperationException; use GetValueOrDefault ou teste HasValue antes.'),
        mcq('q7', 'O que o operador ! (null-forgiving), como em texto!.Length, faz?', 'a', [
          'Silencia o aviso do compilador sem verificar nada; se o valor for nulo, ainda lança exceção',
          'Converte o valor nulo em string vazia',
          'Verifica em tempo de execução se é nulo e evita a exceção',
          'Declara que a variável nunca será nula em todo o programa'
        ], 'O ! só diz ao compilador para confiar em você. Nenhuma checagem é feita.'),
        fill('q8', 'Complete para executar o bloco quando cliente NÃO for nulo.', 'if (cliente is ___ null)\n{\n    Console.WriteLine(cliente.Nome);\n}', ['not'], 'is not null é a forma recomendada de testar que há um objeto.')
      ]
    },
    {
      id: 'csb-22-lambdas-delegates-intro',
      title: 'Lambdas e delegates (introdução)',
      goal: 'Tratar métodos como valores usando Func, Action, Predicate e expressões lambda.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Delegate: uma referência a método',
            'Um delegate é um tipo que representa "qualquer método com esta assinatura". Você guarda o método numa variável, passa a outros métodos e o chama depois. Dá para declarar o seu, mas na prática se usam os delegates prontos Func, Action e Predicate.',
            'delegate int Operacao(int a, int b);\n\nint Somar(int a, int b) => a + b;\n\nOperacao op = Somar;       // guarda o método\nConsole.WriteLine(op(2, 3)); // 5'
          ),
          sl(
            'Func, Action e Predicate',
            'Func<...> devolve valor: os primeiros parâmetros de tipo são as entradas e o ÚLTIMO é o tipo de retorno (Func<int, int, string> recebe dois int e devolve string). Action<...> não devolve nada (void). Predicate<T> recebe um T e devolve bool.',
            'Func<int, int, int> soma = (a, b) => a + b;\nAction<string> falar = msg => Console.WriteLine(msg);\nPredicate<int> ehPar = n => n % 2 == 0;\n\nConsole.WriteLine(soma(2, 3));  // 5\nfalar("oi");                    // oi\nConsole.WriteLine(ehPar(4));    // True'
          ),
          sl(
            'Expressão lambda: =>',
            'Uma lambda é um método anônimo escrito em uma linha: parâmetros à esquerda de =>, corpo à direita. Um só parâmetro dispensa parênteses; zero ou vários exigem. O compilador infere os tipos dos parâmetros pelo delegate de destino. O "=>" lê-se "vai para".',
            'Func<int, int> dobro = x => x * 2;\nFunc<int> cinco = () => 5;\nFunc<int, int, int> max = (a, b) => a > b ? a : b;\n\nConsole.WriteLine(dobro(5));  // 10\nConsole.WriteLine(cinco());   // 5\nConsole.WriteLine(max(3, 8)); // 8'
          ),
          sl(
            'Lambdas com várias linhas',
            'Quando o corpo precisa de mais de uma instrução, use chaves e return (se a lambda devolver algo). Cada instrução termina com ponto e vírgula, como em um método normal. A lambda também enxerga as variáveis locais ao redor dela (isso se chama captura); use com cuidado, pois mudar a variável depois muda o comportamento da lambda.',
            'Func<int, int> f = x =>\n{\n    int r = x + 1;\n    return r * 2;\n};\nConsole.WriteLine(f(3));   // 8\n\nint fator = 10;\nFunc<int, int> vezes = x => x * fator;   // captura "fator"\nConsole.WriteLine(vezes(4));  // 40'
          ),
          sl(
            'Passando comportamento como parâmetro',
            'O grande ganho: um método pode receber "o que fazer" como argumento. Em vez de escrever vários métodos quase iguais, você escreve um e recebe a regra variável por Func ou Action. É a base de LINQ e de muitas APIs.',
            'static int Aplicar(int valor, Func<int, int> regra) => regra(valor);\n\nConsole.WriteLine(Aplicar(5, x => x + 1));   // 6\nConsole.WriteLine(Aplicar(5, x => x * x));   // 25'
          ),
          sl(
            'List<T>: Find, Sort, RemoveAll, ForEach',
            'A classe List<T> tem métodos que recebem delegates: Find(Predicate) devolve o primeiro elemento que satisfaz a condição (ou o padrão do tipo); FindAll devolve todos; RemoveAll remove os que satisfazem; Sort(Comparison) ordena com um critério: a lambda recebe dois elementos e devolve negativo, zero ou positivo (CompareTo faz isso). ForEach executa uma Action em cada item.',
            'var nums = new List<int> { 5, 2, 8 };\nConsole.WriteLine(nums.Find(n => n > 5));    // 8\nnums.Sort((a, b) => b.CompareTo(a));         // decrescente\nConsole.WriteLine(string.Join(",", nums));   // 8,5,2\nnums.ForEach(n => Console.Write(n + " "));  // 8 5 2'
          ),
          sl(
            'Eventos: só uma apresentação',
            'Um evento é um delegate protegido: a classe publica "aconteceu algo" e outros se inscrevem com += passando um método ou lambda; só a classe dona dispara o evento. É o padrão de botões em interfaces gráficas e notificações. Nesta fase basta reconhecer a sintaxe; os detalhes ficam para o nível intermediário.',
            'public class Termostato\n{\n    public event Action<int>? TemperaturaMudou;\n    public void Definir(int t) => TemperaturaMudou?.Invoke(t);\n}\n\nvar t = new Termostato();\nt.TemperaturaMudou += temp => Console.WriteLine("Agora: " + temp);\nt.Definir(22);   // Agora: 22'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que imprime?\n\nFunc<int, int, int> soma = (a, b) => a + b;\nConsole.WriteLine(soma(2, 3));', 'c', [
          '23',
          'soma',
          '5',
          'Erro de compilação'
        ], 'A lambda soma os dois argumentos: 5.'),
        mcq('q2', 'Em Func<string, int> f, o que f representa?', 'a', [
          'Um método que recebe string e devolve int',
          'Um método que recebe int e devolve string',
          'Um método que recebe string e int e não devolve nada',
          'Um método sem parâmetros'
        ], 'Em Func, o último tipo é o retorno; os anteriores são os parâmetros.'),
        mcq('q3', 'Qual a diferença entre Action<T> e Func<T, TResult>?', 'd', [
          'Action devolve bool; Func devolve string',
          'Não existe diferença',
          'Action só aceita lambdas de uma linha',
          'Action não devolve valor (void); Func devolve um valor'
        ], 'Action representa métodos void; Func representa métodos com retorno.'),
        fill('q4', 'Complete com o operador de lambda.', 'Func<int, int> triplo = x ___ x * 3;', ['=>'], 'O operador => separa os parâmetros do corpo da lambda.'),
        mcq('q5', 'O que imprime?\n\nPredicate<int> p = n => n > 3;\nConsole.WriteLine(p(2));', 'b', [
          'True',
          'False',
          '2',
          'Erro de compilação'
        ], 'Predicate devolve bool; 2 > 3 é False.'),
        mcq('q6', 'O que imprime?\n\nvar l = new List<int> { 5, 2, 8 };\nConsole.WriteLine(l.Find(n => n > 5));', 'd', [
          '5',
          '2',
          'True',
          '8'
        ], 'Find devolve o primeiro elemento que satisfaz a condição; só o 8 é maior que 5.'),
        mcq('q7', 'O que imprime?\n\nFunc<int, int> f = x =>\n{\n    int r = x + 1;\n    return r * 2;\n};\nConsole.WriteLine(f(3));', 'c', [
          '4',
          '7',
          '8',
          '6'
        ], 'Com x = 3: r = 4 e a lambda devolve 4 * 2 = 8.'),
        fill('q8', 'Complete com o método de int usado para comparar e ordenar de forma decrescente.', 'numeros.Sort((a, b) => b.___(a));', ['CompareTo'], 'CompareTo devolve negativo, zero ou positivo, que é o que Sort espera da lambda de comparação.')
      ]
    },
    {
      id: 'csb-23-linq-basico',
      title: 'LINQ básico',
      goal: 'Consultar e transformar coleções com Where, Select, OrderBy e operações de agregação.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é LINQ',
            'LINQ (Language Integrated Query) é um conjunto de métodos de extensão que permite consultar coleções com poucas linhas, em estilo declarativo ("o que quero", não "como fazer o laço"). Para usá-lo, coloque using System.Linq (em projetos novos geralmente já vem implícito). Ele funciona sobre qualquer IEnumerable<T>: arrays, List<T>, Dictionary, etc.',
            'using System.Linq;\n\nint[] numeros = { 5, 2, 8, 1, 9, 4 };'
          ),
          sl(
            'Where e Select',
            'Where FILTRA: mantém só os elementos para os quais a lambda devolve true. Select TRANSFORMA: aplica a lambda em cada elemento e devolve os resultados (pode mudar o tipo). Eles se encadeiam, cada um recebendo o resultado do anterior.',
            'var r = numeros.Where(x => x > 3)\n                .Select(x => x * 10);\nConsole.WriteLine(string.Join(",", r));   // 50,80,90,40'
          ),
          sl(
            'Ordenação',
            'OrderBy ordena de forma crescente por uma chave; OrderByDescending, de forma decrescente. Para desempate use ThenBy (ou ThenByDescending), nunca outro OrderBy, que descartaria a ordem anterior. A ordenação é estável e não altera a coleção original: devolve uma nova sequência.',
            'string[] frutas = { "uva", "fig", "abacaxi", "kiwi" };\nvar o = frutas.OrderBy(f => f.Length).ThenBy(f => f);\nConsole.WriteLine(string.Join(",", o));   // fig,uva,kiwi,abacaxi'
          ),
          sl(
            'First, FirstOrDefault, Single',
            'First devolve o primeiro elemento (ou o primeiro que satisfaz uma condição) e lança InvalidOperationException se não houver. FirstOrDefault devolve o padrão do tipo (0, null, false) em vez de lançar. Single exige EXATAMENTE um elemento: lança se houver zero ou mais de um; SingleOrDefault aceita zero. Prefira os OrDefault quando a ausência é normal e trate o resultado.',
            'var vazia = new List<int>();\nConsole.WriteLine(vazia.FirstOrDefault());   // 0\n// vazia.First();     // InvalidOperationException\n\nvar p = numeros.FirstOrDefault(x => x > 100);   // 0 (ninguém atende)'
          ),
          sl(
            'Any, All, Count, Sum, Min, Max, Average',
            'Any() diz se existe algum elemento (ou algum que satisfaz a lambda); All diz se TODOS satisfazem. Count conta, Sum soma, Min e Max acham extremos e Average calcula a média (devolve double). Essas operações produzem um valor final em vez de uma sequência.',
            'var v = new[] { 3, 7, 1 };\nConsole.WriteLine(v.Sum() + " " + v.Min() + " " + v.Max());  // 11 1 7\nConsole.WriteLine(v.Any(x => x > 5));   // True\nConsole.WriteLine(v.All(x => x > 5));   // False\nConsole.WriteLine(v.Count(x => x > 2)); // 2\nConsole.WriteLine(new[] { 2, 4, 6 }.Average());   // 4'
          ),
          sl(
            'ToList, ToArray e execução adiada',
            'Where, Select e OrderBy NÃO executam na hora: constroem uma consulta que só roda quando você a percorre (foreach, Count, ToList...). Isso é a execução adiada (deferred). Consequência: se a coleção de origem mudar antes da execução, o resultado reflete a mudança. ToList() e ToArray() forçam a execução e guardam o resultado fixo.',
            'var lista = new List<int> { 1, 2, 3 };\nvar q = lista.Where(x => x > 1);   // ainda não rodou\nlista.Add(10);\nConsole.WriteLine(q.Count());      // 3  (2, 3 e 10)\n\nvar fixa = lista.Where(x => x > 1).ToList();   // roda agora\nlista.Add(20);\nConsole.WriteLine(fixa.Count);     // 3'
          ),
          sl(
            'Sintaxe de consulta (query syntax)',
            'LINQ tem uma segunda sintaxe, parecida com SQL: from ... where ... orderby ... select. O compilador a converte em chamadas de método, então são equivalentes. Para operações como Sum, Count e First, usa-se método mesmo, normalmente envolvendo a consulta entre parênteses. Escolha a que ler melhor; a de métodos é a mais comum.',
            'var pares = from n in numeros\n            where n % 2 == 0\n            orderby n descending\n            select n;\nConsole.WriteLine(string.Join(",", pares));   // 8,4,2\n\n// equivalente:\nvar pares2 = numeros.Where(n => n % 2 == 0).OrderByDescending(n => n);'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que imprime?\n\nint[] n = { 5, 2, 8, 1, 9, 4 };\nConsole.WriteLine(string.Join(",", n.Where(x => x > 3).Select(x => x * 10)));', 'b', [
          '5,8,9,4',
          '50,80,90,40',
          '50,20,80,10,90,40',
          '10,10,10'
        ], 'Where mantém 5, 8, 9 e 4 e Select multiplica cada um por 10.'),
        mcq('q2', 'O que imprime?\n\nvar v = new[] { 3, 7, 1 };\nConsole.WriteLine(v.Sum() + " " + v.Min() + " " + v.Max());', 'd', [
          '11 7 1',
          '3 1 7',
          '7 1 11',
          '11 1 7'
        ], 'Sum = 11, Min = 1, Max = 7.'),
        mcq('q3', 'O que acontece?\n\nvar vazia = new List<int>();\nvar x = vazia.First();', 'a', [
          'Lança InvalidOperationException',
          'x vira 0',
          'x vira null',
          'Erro de compilação'
        ], 'First lança se a sequência estiver vazia; FirstOrDefault devolveria 0.'),
        fill('q4', 'Complete com o método que diz se EXISTE algum elemento que satisfaz a condição.', 'bool tem = numeros.___(x => x > 8);', ['Any'], 'Any(predicado) devolve true se pelo menos um elemento satisfaz.'),
        mcq('q5', 'O que imprime? (lembre-se da execução adiada)\n\nvar l = new List<int> { 1, 2, 3 };\nvar q = l.Where(x => x > 1);\nl.Add(10);\nConsole.WriteLine(q.Count());', 'c', [
          '2',
          '4',
          '3',
          '1'
        ], 'A consulta só executa em Count(), quando a lista já tem 1, 2, 3, 10; passam 2, 3 e 10.'),
        mcq('q6', 'O que imprime?\n\nstring[] f = { "uva", "fig", "abacaxi", "kiwi" };\nConsole.WriteLine(string.Join(",", f.OrderBy(s => s.Length).ThenBy(s => s)));', 'a', [
          'fig,uva,kiwi,abacaxi',
          'abacaxi,kiwi,fig,uva',
          'uva,fig,kiwi,abacaxi',
          'fig,kiwi,uva,abacaxi'
        ], 'Ordena por tamanho (3, 3, 4, 7) e desempata alfabeticamente: fig antes de uva.'),
        mcq('q7', 'A consulta "from n in nums where n % 2 == 0 select n" equivale a qual chamada de método?', 'b', [
          'nums.Select(n => n % 2 == 0)',
          'nums.Where(n => n % 2 == 0)',
          'nums.OrderBy(n => n % 2 == 0)',
          'nums.Any(n => n % 2 == 0)'
        ], 'where corresponde ao método Where, que filtra elementos pela condição.'),
        fill('q8', 'Complete com o método que executa a consulta e guarda o resultado em uma List<int>.', 'List<int> r = numeros.Where(x => x > 3).___();', ['ToList'], 'ToList força a execução imediata e materializa o resultado.')
      ]
    },
    {
      id: 'csb-24-arquivos-io',
      title: 'Arquivos e I/O',
      goal: 'Ler e gravar arquivos de texto com System.IO, tratando erros e cuidando dos dados gravados.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'A classe File: atalhos de leitura e escrita',
            'O namespace System.IO tem a classe estática File com métodos prontos. WriteAllText cria o arquivo (ou SOBRESCREVE se já existir); AppendAllText acrescenta ao final; ReadAllText devolve o conteúdo inteiro como string; ReadAllLines devolve string[] com uma linha por elemento; File.Exists informa se o arquivo existe. Ótimos para arquivos pequenos, pois carregam tudo na memória.',
            'File.WriteAllText("notas.txt", "linha 1\\n");\nFile.AppendAllText("notas.txt", "linha 2\\n");\n\nforeach (string l in File.ReadAllLines("notas.txt"))\n    Console.WriteLine(l);\n// linha 1\n// linha 2\n\nConsole.WriteLine(File.Exists("notas.txt"));   // True'
          ),
          sl(
            'Caminhos: Path.Combine, relativo e absoluto',
            'Um caminho ABSOLUTO começa na raiz (C:\\dados\\a.txt ou /home/x/a.txt). Um caminho RELATIVO ("dados/a.txt") é resolvido a partir do diretório de trabalho atual do processo, que pode não ser a pasta do seu projeto. Para montar caminhos, use Path.Combine: ele coloca o separador certo do sistema operacional. AppContext.BaseDirectory dá a pasta do executável.',
            'string pasta = Path.Combine("dados", "logs");\nstring arq = Path.Combine(pasta, "notas.txt");\nConsole.WriteLine(Path.GetFileName(arq));        // notas.txt\nConsole.WriteLine(Path.GetExtension(arq));       // .txt\nstring configExe = Path.Combine(AppContext.BaseDirectory, "config.json");'
          ),
          sl(
            'Directory',
            'A classe Directory cuida de pastas: Exists, CreateDirectory (cria a pasta e as intermediárias; não faz nada se já existir), GetFiles (lista arquivos, com padrão como "*.txt"), Delete. Atenção: File.WriteAllText NÃO cria pastas; se a pasta não existir, lança DirectoryNotFoundException. Crie a pasta antes.',
            'Directory.CreateDirectory("dados");\nFile.WriteAllText(Path.Combine("dados", "a.txt"), "oi");\nforeach (string f in Directory.GetFiles("dados", "*.txt"))\n    Console.WriteLine(f);'
          ),
          sl(
            'StreamWriter e StreamReader com using',
            'Para arquivos grandes ou quando quer ler/gravar linha a linha, use StreamReader/StreamWriter. Eles seguram um recurso do sistema (o arquivo aberto), então devem ser fechados: o using garante que Dispose seja chamado ao fim do bloco, mesmo se ocorrer exceção. Sem isso o arquivo pode ficar travado.',
            'using (var w = new StreamWriter("log.txt", append: true))\n{\n    w.WriteLine("evento 1");\n    w.WriteLine("evento 2");\n}\n\nusing var r = new StreamReader("log.txt");\nstring? linha;\nwhile ((linha = r.ReadLine()) is not null)\n    Console.WriteLine(linha);'
          ),
          sl(
            'Codificação UTF-8',
            'Um arquivo de texto guarda bytes; a codificação define como letras viram bytes. O padrão atual do .NET para File.WriteAllText e StreamWriter é UTF-8, que suporta acentos e emojis. Ao ler arquivos de outras origens com acentuação quebrada, o problema costuma ser codificação diferente; você pode indicá-la explicitamente com Encoding.UTF8.',
            'File.WriteAllText("a.txt", "ação", System.Text.Encoding.UTF8);\nstring t = File.ReadAllText("a.txt", System.Text.Encoding.UTF8);\nConsole.WriteLine(t);   // ação'
          ),
          sl(
            'Tratando erros de I/O',
            'Arquivos falham por motivos fora do seu controle: FileNotFoundException (arquivo não existe), DirectoryNotFoundException (pasta não existe), UnauthorizedAccessException (sem permissão) e IOException (arquivo em uso, disco cheio...). FileNotFoundException e DirectoryNotFoundException herdam de IOException. Capture o específico, informe algo útil e não esconda o erro.',
            'try\n{\n    string t = File.ReadAllText("config.txt");\n}\ncatch (FileNotFoundException)\n{\n    Console.WriteLine("Arquivo de configuração não encontrado.");\n}\ncatch (IOException ex)\n{\n    Console.WriteLine("Falha de leitura: " + ex.Message);\n}'
          ),
          sl(
            'Segurança e privacidade com arquivos',
            'Texto puro pode ser lido por qualquer um que tenha acesso ao disco: não grave senhas, documentos ou dados pessoais em arquivos de texto sem necessidade; se precisar, minimize o que guarda e proteja o arquivo. Nos exemplos usamos só dados fictícios. Se o nome do arquivo vem do usuário, nunca o junte direto ao caminho: um valor como "../../segredo" escaparia da pasta (path traversal). Use Path.GetFileName para ficar só com o nome. Atenção: Path.Combine descarta os trechos anteriores se um argumento posterior for um caminho absoluto.',
            'string nomeSeguro = Path.GetFileName(entradaDoUsuario);   // remove pastas do texto\nstring destino = Path.Combine("uploads", nomeSeguro);'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual o conteúdo final de x.txt?\n\nFile.WriteAllText("x.txt", "a");\nFile.WriteAllText("x.txt", "b");\nFile.AppendAllText("x.txt", "c");', 'c', [
          'abc',
          'ab',
          'bc',
          'c'
        ], 'WriteAllText sobrescreve (fica "b"); AppendAllText acrescenta "c": "bc".'),
        mcq('q2', 'Um caminho relativo como "dados/a.txt" é resolvido em relação a quê?', 'a', [
          'Ao diretório de trabalho atual do processo',
          'À raiz do disco C:',
          'À pasta do arquivo .sln, sempre',
          'À pasta do usuário do Windows'
        ], 'Caminhos relativos dependem do diretório de trabalho atual, que pode variar conforme a forma de executar o programa.'),
        mcq('q3', 'Dado "x\\ny\\nz\\n" gravado em um arquivo, qual o Length de File.ReadAllLines(caminho)?', 'd', [
          '1',
          '4',
          '6',
          '3'
        ], 'ReadAllLines devolve uma linha por elemento: "x", "y" e "z"; a quebra final não gera elemento extra.'),
        fill('q4', 'Complete com o método que verifica se o arquivo existe.', 'if (File.___(caminho))\n{\n    Console.WriteLine("achei");\n}', ['Exists'], 'File.Exists devolve true se o arquivo existir.'),
        mcq('q5', 'Por que usar using ao criar um StreamWriter?', 'b', [
          'Para o código rodar mais rápido',
          'Para garantir que o arquivo seja fechado (Dispose) ao fim do bloco, mesmo com exceção',
          'Para criptografar o conteúdo',
          'Para que a pasta seja criada automaticamente'
        ], 'using chama Dispose, liberando o arquivo aberto, inclusive em caso de erro.'),
        mcq('q6', 'O que acontece?\n\nFile.WriteAllText(Path.Combine("pasta_nova", "a.txt"), "oi");\n// "pasta_nova" ainda não existe', 'c', [
          'A pasta é criada automaticamente',
          'Lança FileNotFoundException',
          'Lança DirectoryNotFoundException',
          'Grava em outro lugar sem avisar'
        ], 'WriteAllText não cria pastas. Use Directory.CreateDirectory antes.'),
        mcq('q7', 'O nome do arquivo vem digitado pelo usuário. Qual a prática mais segura?', 'a', [
          'Usar Path.GetFileName(entrada) e combinar com uma pasta fixa',
          'Concatenar direto: "uploads/" + entrada',
          'Aceitar qualquer caminho absoluto informado',
          'Confiar no usuário, pois o programa é interno'
        ], 'Entrada externa pode conter ../ (path traversal); GetFileName descarta as pastas do texto.'),
        fill('q8', 'Complete com o método que monta caminhos usando o separador correto do sistema.', 'string caminho = Path.___("dados", "notas.txt");', ['Combine'], 'Path.Combine evita erros de barras e funciona em Windows e Linux.')
      ]
    },
    {
      id: 'csb-25-json-basico',
      title: 'JSON e serialização básica',
      goal: 'Converter objetos C# em JSON e de volta com System.Text.Json, validando sempre o que vem de fora.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que é JSON',
            'JSON é um formato de texto para trocar dados entre programas (APIs, arquivos de configuração). Tem objetos entre chaves com pares "nome": valor, arrays entre colchetes e valores string, número, true/false e null. Regras: os nomes e as strings usam SEMPRE aspas duplas (aspas simples são inválidas), e não há comentários nem vírgula sobrando no final.',
            '{\n  "nome": "Caneta",\n  "qtd": 2,\n  "ativo": true,\n  "tags": ["escritório", "azul"],\n  "desconto": null\n}'
          ),
          sl(
            'Serialize: objeto para JSON',
            'Serialização é transformar um objeto em texto. Em System.Text.Json (já incluso no .NET) basta JsonSerializer.Serialize(objeto). O padrão grava as propriedades públicas com o mesmo nome do C# (PascalCase), em uma linha só. Campos públicos e membros privados são ignorados por padrão.',
            'using System.Text.Json;\n\npublic record Item(string Nome, int Qtd);\n\nstring json = JsonSerializer.Serialize(new Item("Caneta", 2));\nConsole.WriteLine(json);   // {"Nome":"Caneta","Qtd":2}'
          ),
          sl(
            'Deserialize<T>: JSON para objeto',
            'Desserializar é o caminho inverso: você informa o tipo de destino T e o texto. A biblioteca só cria o tipo que você indicou (não instancia tipos arbitrários vindos do texto), o que a torna mais segura que outros mecanismos. Ela mapeia cada nome do JSON a uma propriedade e ignora nomes sobrando. Se o texto for nulo ou "null", o resultado é null: sempre verifique.',
            'string json = "{\\"Nome\\":\\"Lapis\\",\\"Qtd\\":5}";\nItem? item = JsonSerializer.Deserialize<Item>(json);\nConsole.WriteLine(item?.Nome);   // Lapis'
          ),
          sl(
            'JsonSerializerOptions',
            'JsonSerializerOptions ajusta o comportamento. WriteIndented = true gera JSON bonito, com quebras e indentação. PropertyNameCaseInsensitive = true faz a leitura ignorar diferença de maiúsculas/minúsculas (sem isso, "nome" no JSON NÃO casa com a propriedade Nome, que fica com o valor padrão). PropertyNamingPolicy = JsonNamingPolicy.CamelCase grava nomes em camelCase. Crie as opções UMA vez e reuse.',
            'var opcoes = new JsonSerializerOptions\n{\n    WriteIndented = true,\n    PropertyNameCaseInsensitive = true\n};\nConsole.WriteLine(JsonSerializer.Serialize(new Item("A", 1), opcoes));\n// {\n//   "Nome": "A",\n//   "Qtd": 1\n// }'
          ),
          sl(
            'Nomes diferentes com [JsonPropertyName]',
            'Quando o nome do JSON deve ser diferente do da propriedade (por exemplo, o formato exigido por uma API), use o atributo [JsonPropertyName("nome_no_json")] da namespace System.Text.Json.Serialization. Vale para escrever e para ler.',
            'using System.Text.Json.Serialization;\n\npublic class Produto\n{\n    [JsonPropertyName("nome_item")]\n    public string Nome { get; set; } = "";\n    public int Qtd { get; set; }\n}\n// {"nome_item":"Lapis","Qtd":1}'
          ),
          sl(
            'JsonException: JSON inválido',
            'Se o texto não for JSON válido, ou os tipos não baterem (texto onde se esperava número), Deserialize lança JsonException. Qualquer JSON que vem de arquivo ou rede pode estar corrompido ou ter sido adulterado: envolva em try/catch.',
            'try\n{\n    var item = JsonSerializer.Deserialize<Item>("{invalido");\n}\ncatch (JsonException ex)\n{\n    Console.WriteLine("JSON inválido: " + ex.Message);\n}'
          ),
          sl(
            'Nunca confie na entrada: valide depois de desserializar',
            'Desserializar só garante a FORMA do dado, não que ele faça sentido. Depois dela, valide: resultado nulo, campos obrigatórios ausentes, números fora de faixa (quantidade negativa), textos enormes. Também limite o tamanho do que você aceita ler. Nunca grave o JSON bruto de terceiros em logs se houver dados pessoais.',
            'var item = JsonSerializer.Deserialize<Item>(json);\nif (item is null || string.IsNullOrWhiteSpace(item.Nome) || item.Qtd < 0)\n    throw new InvalidOperationException("Dados inválidos.");'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que imprime?\n\nrecord Item(string Nome, int Qtd);\nConsole.WriteLine(JsonSerializer.Serialize(new Item("Caneta", 2)));', 'd', [
          '{Nome: Caneta, Qtd: 2}',
          '{\'Nome\':\'Caneta\',\'Qtd\':2}',
          '{"nome":"Caneta","qtd":2}',
          '{"Nome":"Caneta","Qtd":2}'
        ], 'Por padrão os nomes seguem as propriedades em PascalCase, com aspas duplas e sem espaços.'),
        mcq('q2', 'O que imprime? (sem opções personalizadas)\n\nclass P { public string? Nome { get; set; } public int Qtd { get; set; } }\nstring json = "{\\"nome\\":\\"Lapis\\",\\"qtd\\":5}";\nConsole.WriteLine(JsonSerializer.Deserialize<P>(json)!.Qtd);', 'b', [
          '5',
          '0',
          'Lança JsonException',
          'null'
        ], 'Por padrão a comparação de nomes diferencia maiúsculas: "qtd" não casa com Qtd, que fica com o padrão 0.'),
        mcq('q3', 'Qual opção faz "nome" e "Nome" serem tratados como o mesmo campo ao ler?', 'a', [
          'PropertyNameCaseInsensitive = true',
          'WriteIndented = true',
          'IncludeFields = true',
          'AllowTrailingCommas = true'
        ], 'PropertyNameCaseInsensitive ignora diferenças de caixa entre o JSON e as propriedades.'),
        fill('q4', 'Complete com o método que converte um objeto em texto JSON.', 'string json = JsonSerializer.___(item);', ['Serialize'], 'Serialize transforma o objeto em JSON; Deserialize<T> faz o caminho inverso.'),
        mcq('q5', 'O que acontece?\n\nvar item = JsonSerializer.Deserialize<Item>("{invalido");', 'c', [
          'Devolve null',
          'Devolve um Item com valores padrão',
          'Lança JsonException',
          'Lança NullReferenceException'
        ], 'JSON mal formado gera JsonException; capture-a ao ler dados externos.'),
        mcq('q6', 'O que Deserialize<Item>("null") devolve e qual a lição?', 'd', [
          'Lança JsonException; não precisa checar nada',
          'Um Item vazio; basta usar',
          'Um Item com Nome nulo, só isso',
          'null: o resultado pode ser nulo e todo dado externo deve ser validado'
        ], 'O texto null é JSON válido e resulta em null. Sempre trate nulo e valide faixas e campos obrigatórios.'),
        mcq('q7', 'Qual destes é JSON válido?', 'a', [
          '{"id": 1, "ativo": true}',
          '{\'id\': 1, \'ativo\': true}',
          '{id: 1, ativo: true}',
          '{"id": 1, "ativo": true,}'
        ], 'JSON exige aspas duplas nos nomes e proíbe vírgula final.'),
        fill('q8', 'Complete com a propriedade que gera JSON formatado com quebras de linha.', 'var op = new JsonSerializerOptions { ___ = true };', ['WriteIndented'], 'WriteIndented = true produz saída legível; PropertyNameCaseInsensitive afeta a leitura.')
      ]
    },
    {
      id: 'csb-26-datas-horas',
      title: 'Datas e horas',
      goal: 'Trabalhar com datas, horas e intervalos de tempo evitando erros clássicos de fuso e formato.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'DateTime, DateOnly e TimeOnly',
            'DateTime guarda data e hora juntas. Quando só importa a DATA (aniversário, prazo) use DateOnly; quando só importa a HORA (horário de abertura) use TimeOnly. Escolher o tipo certo evita bugs de horário embutido. Os três são tipos de valor imutáveis: métodos como AddDays devolvem um NOVO valor.',
            'var d = new DateTime(2025, 3, 15, 14, 30, 0);\nvar soData = new DateOnly(2025, 3, 15);\nvar soHora = new TimeOnly(14, 30);\nConsole.WriteLine(d.Year + " " + d.Month + " " + d.Day);   // 2025 3 15'
          ),
          sl(
            'TimeSpan: um intervalo de tempo',
            'TimeSpan representa uma duração (dias, horas, minutos...). Subtrair duas datas resulta em TimeSpan, e somar um TimeSpan a uma data move a data. Propriedades como Days, Hours e TotalMinutes dão as partes ou o total. Cuidado: Days é a parte inteira em dias; TotalDays é o total com fração.',
            'var a = new DateTime(2025, 3, 15);\nvar b = new DateTime(2025, 3, 20);\nTimeSpan dif = b - a;\nConsole.WriteLine(dif.Days);                 // 5\nConsole.WriteLine(new TimeSpan(1, 30, 0));   // 01:30:00\nConsole.WriteLine(a + TimeSpan.FromDays(2)); // 17/03/2025 00:00:00 (formato depende da cultura)'
          ),
          sl(
            'Aritmética de datas e DayOfWeek',
            'Use AddDays, AddMonths, AddYears, AddHours, AddMinutes (valores negativos voltam no tempo). AddMonths ajusta dias que não existem (31 de janeiro mais 1 mês dá fim de fevereiro). DayOfWeek é um enum (Sunday a Saturday, nomes em inglês) acessível por data.DayOfWeek.',
            'var d = new DateTime(2025, 3, 15);\nvar depois = d.AddDays(20);\nConsole.WriteLine(depois.ToString("yyyy-MM-dd"));      // 2025-04-04\nConsole.WriteLine(new DateOnly(2025, 3, 15).DayOfWeek); // Saturday'
          ),
          sl(
            'Formatação e leitura',
            'ToString aceita um formato: yyyy ano, MM mês, dd dia, HH hora (24h), mm minuto, ss segundo. Note: o "/" e o ":" nesses formatos são separadores que dependem da cultura; passe CultureInfo.InvariantCulture quando precisar de um resultado estável. Para LER texto, use ParseExact (formato exato) ou, melhor para entrada de usuário, TryParseExact, que devolve bool e não lança exceção. Datas inexistentes (31/02) são rejeitadas.',
            'using System.Globalization;\n\nvar inv = CultureInfo.InvariantCulture;\nDateTime d = DateTime.ParseExact("15/03/2025", "dd/MM/yyyy", inv);\nConsole.WriteLine(d.ToString("yyyy-MM-dd"));   // 2025-03-15\n\nbool ok = DateTime.TryParseExact("31/02/2025", "dd/MM/yyyy", inv, DateTimeStyles.None, out _);\nConsole.WriteLine(ok);   // False'
          ),
          sl(
            'Now vs UtcNow',
            'DateTime.Now é a hora local da máquina; DateTime.UtcNow é a hora UTC (tempo universal, sem fuso nem horário de verão). Hora local muda com o fuso do servidor e tem horas que não existem ou se repetem na troca de horário de verão. Por isso, para guardar e comparar momentos (logs, prazos, banco de dados), use UTC e converta para local só ao EXIBIR.',
            'DateTime agora = DateTime.UtcNow;\nDateTime local = DateTime.Now;\n// guardar: UtcNow  | mostrar: converter para o fuso do usuário'
          ),
          sl(
            'DateTimeOffset e fusos horários',
            'DateTimeOffset guarda a data/hora junto com o deslocamento em relação ao UTC (como -03:00), identificando um momento exato sem ambiguidade; é a melhor escolha para registrar instantes. TimeZoneInfo converte entre fusos. Regra de ouro: armazene em UTC, converta ao exibir.',
            'DateTimeOffset t = DateTimeOffset.UtcNow;\nConsole.WriteLine(t.Offset);   // 00:00:00\n\nTimeZoneInfo fuso = TimeZoneInfo.Utc;\nDateTime convertido = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, fuso);'
          ),
          sl(
            'Testes e boas práticas',
            'Código que chama DateTime.Now direto é difícil de testar, pois o resultado muda a cada execução; veremos adiante como isolar o relógio. Nunca monte datas por concatenação de texto nem faça cálculos manuais de dias (anos bissextos!): use os métodos da biblioteca. Ao ler datas digitadas, defina o formato esperado e use TryParseExact.',
            'DateTime? ler(string s) =>\n    DateTime.TryParseExact(s, "yyyy-MM-dd", CultureInfo.InvariantCulture,\n        DateTimeStyles.None, out var r) ? r : null;'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que imprime?\n\nvar a = new DateTime(2025, 3, 15);\nvar b = new DateTime(2025, 3, 20);\nConsole.WriteLine((b - a).Days);', 'b', [
          '4',
          '5',
          '6',
          '20'
        ], 'Subtrair datas gera um TimeSpan; de 15 a 20 de março são 5 dias.'),
        mcq('q2', 'O que imprime?\n\nvar d = new DateTime(2025, 3, 15);\nConsole.WriteLine(d.AddDays(20).ToString("yyyy-MM-dd"));', 'c', [
          '2025-03-35',
          '2025-04-05',
          '2025-04-04',
          '2025-03-15'
        ], 'Março tem 31 dias: 15 + 20 dias é 4 de abril. O original não muda.'),
        mcq('q3', 'O que imprime?\n\nConsole.WriteLine(new DateOnly(2025, 3, 15).DayOfWeek);', 'a', [
          'Saturday',
          'Sunday',
          'Friday',
          '6'
        ], '15 de março de 2025 foi um sábado; DayOfWeek é um enum e o nome é impresso (em inglês).'),
        fill('q4', 'Complete com a propriedade que dá a data e hora atuais em UTC.', 'DateTime agora = DateTime.___;', ['UtcNow'], 'UtcNow dá o instante em UTC, ideal para armazenar e comparar.'),
        mcq('q5', 'Por que se recomenda armazenar datas e horas em UTC?', 'd', [
          'Porque UTC ocupa menos espaço em disco',
          'Porque DateTime.Now não funciona em servidores',
          'Porque UTC é sempre igual à hora do Brasil',
          'Porque UTC não depende de fuso nem de horário de verão; converte-se para o fuso do usuário só na exibição'
        ], 'Hora local é ambígua; UTC identifica o instante sem depender de onde o código roda.'),
        mcq('q6', 'O que imprime?\n\nConsole.WriteLine(new TimeSpan(1, 30, 0));', 'b', [
          '1.30',
          '01:30:00',
          '90',
          '1h30'
        ], 'TimeSpan(horas, minutos, segundos) é mostrado como hh:mm:ss.'),
        mcq('q7', 'O que imprime?\n\nvar inv = CultureInfo.InvariantCulture;\nConsole.WriteLine(DateTime.TryParseExact("31/02/2025", "dd/MM/yyyy", inv, DateTimeStyles.None, out _));', 'c', [
          'True',
          'Lança FormatException',
          'False',
          '2025-03-03'
        ], 'TryParseExact não lança exceção: devolve False porque 31 de fevereiro não existe.'),
        fill('q8', 'Complete com o método que lê uma data exigindo um formato específico.', 'DateTime d = DateTime.___("15/03/2025", "dd/MM/yyyy", CultureInfo.InvariantCulture);', ['ParseExact'], 'ParseExact aceita só o formato indicado; prefira TryParseExact para entradas de usuário.')
      ]
    },
    {
      id: 'csb-27-biblioteca-padrao-util',
      title: 'Biblioteca padrão útil',
      goal: 'Conhecer Math, Random, Guid, Environment, Console avançado e Stopwatch, sabendo o limite de cada um.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Math: funções matemáticas',
            'A classe estática Math reúne as operações comuns: Abs (valor absoluto), Pow (potência), Sqrt (raiz quadrada), Floor (arredonda para baixo), Ceiling (para cima), Round (arredonda), Min e Max. Quase todas trabalham com double. Atenção: Math.Round usa por padrão o arredondamento "para o par mais próximo" (2,5 vira 2 e 3,5 vira 4); passe MidpointRounding.AwayFromZero para o arredondamento escolar.',
            'Console.WriteLine(Math.Abs(-5));          // 5\nConsole.WriteLine(Math.Pow(2, 10));       // 1024\nConsole.WriteLine(Math.Sqrt(16));         // 4\nConsole.WriteLine(Math.Floor(2.9));       // 2\nConsole.WriteLine(Math.Ceiling(2.1));     // 3\nConsole.WriteLine(Math.Round(2.5));       // 2\nConsole.WriteLine(Math.Round(2.5, MidpointRounding.AwayFromZero)); // 3'
          ),
          sl(
            'Random e Random.Shared',
            'Random gera números pseudoaleatórios. O jeito simples e seguro para threads é Random.Shared. Next(a, b) devolve um inteiro de a até b-1 (o limite superior é EXCLUSIVO); Next(n) vai de 0 a n-1; NextDouble() vai de 0,0 a menos de 1,0. Com uma semente fixa (new Random(42)) a sequência se repete, útil em testes e jogos. Random NÃO é seguro para criptografia: para senhas, tokens e chaves, use System.Security.Cryptography.RandomNumberGenerator.',
            'int dado = Random.Shared.Next(1, 7);      // 1, 2, 3, 4, 5 ou 6\ndouble d = Random.Shared.NextDouble();    // [0, 1)\n// token seguro: RandomNumberGenerator.GetBytes(32)  (nunca Random)'
          ),
          sl(
            'Guid: identificadores únicos',
            'Guid.NewGuid() gera um identificador de 128 bits praticamente único, escrito em 36 caracteres (32 hexadecimais e 4 hifens). Serve como identificador de registros sem coordenar com um banco. Não o use como segredo ou token de segurança: ele identifica, não autentica.',
            'Guid id = Guid.NewGuid();\nstring texto = id.ToString();\nConsole.WriteLine(texto.Length);   // 36\n// exemplo: 3f2504e0-4f89-41d3-9a0c-0305e82c3301'
          ),
          sl(
            'Environment: ambiente do programa',
            'Environment.NewLine é a quebra de linha da plataforma; MachineName, o nome do computador; GetEnvironmentVariable(nome) lê uma variável de ambiente e devolve null se ela não existir. Variáveis de ambiente são o lugar certo para configurações e segredos (senhas, chaves) em vez de deixá-los escritos no código-fonte.',
            'string? ambiente = Environment.GetEnvironmentVariable("MEU_APP_MODO");\nConsole.WriteLine(ambiente ?? "padrão");   // padrão (se não definida)\nConsole.WriteLine("a" + Environment.NewLine + "b");'
          ),
          sl(
            'Console: cores e limpeza',
            'Console.ForegroundColor e BackgroundColor mudam as cores com valores de ConsoleColor. Depois de usar, chame Console.ResetColor() para voltar ao padrão. Console.Clear() limpa a tela. Úteis em menus e jogos de console; evite depender delas quando a saída for redirecionada para arquivo.',
            'Console.ForegroundColor = ConsoleColor.Green;\nConsole.WriteLine("Sucesso!");\nConsole.ResetColor();\nConsole.Clear();'
          ),
          sl(
            'Stopwatch: medir tempo',
            'Stopwatch (namespace System.Diagnostics) é o cronômetro de alta precisão para medir duração de trechos de código. StartNew() cria e inicia; Stop() para; ElapsedMilliseconds dá o tempo em milissegundos e Elapsed devolve um TimeSpan. Não use DateTime.Now para medir desempenho.',
            'using System.Diagnostics;\n\nvar sw = Stopwatch.StartNew();\nint soma = 0;\nfor (int i = 0; i < 1_000_000; i++) soma += i;\nsw.Stop();\nConsole.WriteLine("Levou " + sw.ElapsedMilliseconds + " ms");'
          ),
          sl(
            'Thread.Sleep em visão geral',
            'Thread.Sleep(ms) pausa a thread atual pelo tempo informado. Em um programa de console simples serve para animações ou esperas curtas. Em aplicativos que atendem várias requisições ou têm interface gráfica, bloquear a thread é ruim: o recurso adequado é programação assíncrona com await Task.Delay, assunto do nível intermediário.',
            'Console.WriteLine("Aguarde...");\nThread.Sleep(1000);   // pausa 1 segundo\nConsole.WriteLine("Pronto!");'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que imprime?\n\nConsole.WriteLine(Math.Round(2.5) + " " + Math.Ceiling(2.1) + " " + Math.Floor(2.9));', 'a', [
          '2 3 2',
          '3 3 2',
          '2 2 3',
          '3 2 3'
        ], 'Round(2.5) arredonda para o par mais próximo: 2. Ceiling(2.1) = 3 e Floor(2.9) = 2.'),
        mcq('q2', 'Quais valores Random.Shared.Next(1, 7) pode devolver?', 'c', [
          '1 a 7, inclusive',
          '0 a 6',
          '1 a 6, inclusive',
          '2 a 7'
        ], 'O limite superior de Next é exclusivo: de 1 até 6.'),
        mcq('q3', 'Quantos caracteres tem Guid.NewGuid().ToString()?', 'd', [
          '16',
          '32',
          '128',
          '36'
        ], 'São 32 dígitos hexadecimais mais 4 hifens: 36 caracteres.'),
        fill('q4', 'Complete com o método que calcula potência.', 'double r = Math.___(2, 10);   // 1024', ['Pow'], 'Math.Pow(base, expoente) devolve a potência como double.'),
        mcq('q5', 'Qual a melhor escolha para gerar um token de redefinição de senha?', 'b', [
          'Random.Shared.Next()',
          'RandomNumberGenerator (System.Security.Cryptography)',
          'Guid.NewGuid() usado como segredo',
          'DateTime.Now.Ticks'
        ], 'Random e Guid não são projetados para segredos. Para segurança, use um gerador criptograficamente seguro.'),
        mcq('q6', 'O que faz Thread.Sleep(2000)?', 'b', [
          'Encerra o programa depois de 2 segundos',
          'Pausa a thread atual por 2 segundos',
          'Pausa por 2000 segundos',
          'Executa o código seguinte em outra thread'
        ], 'O argumento é em milissegundos e a thread atual fica bloqueada durante o tempo.'),
        mcq('q7', 'Se a variável de ambiente NAO_EXISTE não estiver definida, o que devolve Environment.GetEnvironmentVariable("NAO_EXISTE")?', 'c', [
          'Uma string vazia',
          'Lança KeyNotFoundException',
          'null',
          'O texto "NAO_EXISTE"'
        ], 'Variável ausente resulta em null; trate com ?? ou verifique antes de usar.'),
        fill('q8', 'Complete com o método que cria e já inicia um cronômetro.', 'Stopwatch sw = Stopwatch.___();', ['StartNew'], 'StartNew cria o Stopwatch e o inicia; depois leia ElapsedMilliseconds.')
      ]
    },
    {
      id: 'csb-28-memoria-stack-heap-gc',
      title: 'Memória, stack, heap e coleta de lixo',
      goal: 'Entender onde os dados vivem, como a cópia funciona e como o GC e o using cuidam dos recursos.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Stack e heap em visão geral',
            'A STACK guarda variáveis locais e as chamadas de método em ordem: cada chamada empilha seu quadro e o desempilha ao terminar; é muito rápida e se limpa sozinha. A HEAP guarda objetos criados com new, de vida mais longa e tamanho variável, e é gerenciada pelo coletor de lixo. Detalhes de implementação variam, mas a regra mental é: variáveis locais na stack, objetos de classe na heap.',
            'void Principal()\n{\n    int x = 10;                    // variável local (stack)\n    var lista = new List<int>();   // objeto na heap; "lista" (a referência) na stack\n}'
          ),
          sl(
            'Tipos de valor vs tipos de referência',
            'Tipos de VALOR (int, double, bool, char, struct, enum) guardam o dado diretamente na variável. Tipos de REFERÊNCIA (class, string, arrays, List<T>, record) guardam na variável apenas um endereço para o objeto na heap. null significa "referência para nada".',
            'int a = 5;                         // o 5 está dentro de a\nvar p = new Pessoa("Ana");         // p guarda a referência para o objeto'
          ),
          sl(
            'O que acontece ao copiar',
            'Atribuir um tipo de valor COPIA o dado: as duas variáveis são independentes. Atribuir um tipo de referência copia só o endereço: as duas variáveis passam a apontar para o MESMO objeto, e mudar por uma é visto pela outra. Isso vale também ao passar argumentos para métodos. (string é de referência, mas imutável: "alterá-la" cria outra string.)',
            'int a = 1; int b = a; b = 2;\nConsole.WriteLine(a);    // 1\n\nvar l1 = new List<int> { 1 };\nvar l2 = l1;             // mesma lista\nl2.Add(2);\nConsole.WriteLine(l1.Count);   // 2'
          ),
          sl(
            'Coletor de lixo (GC)',
            'Em C# você nunca libera memória de objetos manualmente (não existe free/delete). O coletor de lixo (garbage collector, GC) descobre objetos que não são mais alcançáveis por nenhuma referência viva e recupera a memória deles, em momentos que ele escolhe. Você só precisa parar de referenciar o que não quer mais. GC.Collect() força uma coleta, mas NÃO deve ser chamado no dia a dia: o GC decide melhor que você e forçar costuma piorar o desempenho.',
            'var dados = new byte[1_000_000];\nConsole.WriteLine(dados.Length);\ndados = null!;      // sem referências: elegível para coleta\n// GC.Collect();    // evite chamar'
          ),
          sl(
            'IDisposable e using',
            'O GC só cuida de memória. Recursos NÃO gerenciados (arquivos abertos, conexões, sockets) precisam ser liberados explicitamente: tipos que os seguram implementam IDisposable, com o método Dispose. A instrução using chama Dispose automaticamente ao sair do bloco/escopo, mesmo com exceção. Na forma "using var" o descarte ocorre no fim do escopo atual.',
            'using (var w = new StreamWriter("a.txt"))\n{\n    w.WriteLine("oi");\n}   // Dispose aqui: arquivo fechado\n\nusing var r = new StreamReader("a.txt");   // fechado ao fim do método'
          ),
          sl(
            'Vazamentos comuns',
            'Mesmo com GC pode haver vazamento: objetos que continuam alcançáveis nunca são coletados. Causas típicas: coleções estáticas que só crescem (caches sem limite), eventos assinados com += e nunca removidos com -= (o publicador mantém o assinante vivo) e esquecer de chamar Dispose em recursos não gerenciados. Também evite guardar dados pessoais em memória por mais tempo que o necessário.',
            'static List<byte[]> cache = new();    // só cresce: vazamento lógico\n// publicador.Evento += Tratar;  // lembre de: publicador.Evento -= Tratar;'
          ),
          sl(
            'Boxing e unboxing',
            'Boxing é converter um tipo de valor em object (ou interface): o valor é copiado para um novo objeto na heap, o que custa tempo e memória. Unboxing é o caminho inverso, com cast explícito para EXATAMENTE o tipo original; outro tipo lança InvalidCastException. Em laços intensos, boxing gera lixo; coleções genéricas como List<int> evitam isso (o antigo ArrayList não evitava).',
            'object o = 42;          // boxing\nint i = (int)o;          // unboxing: 42\n// long l = (long)o;    // InvalidCastException: o guarda um int'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que imprime?\n\nint a = 1;\nint b = a;\nb = 2;\nConsole.WriteLine(a);', 'b', [
          '2',
          '1',
          '0',
          '3'
        ], 'int é tipo de valor: b é uma cópia, e alterar b não afeta a.'),
        mcq('q2', 'O que imprime?\n\nvar l1 = new List<int> { 1 };\nvar l2 = l1;\nl2.Add(2);\nConsole.WriteLine(l1.Count);', 'd', [
          '1',
          '0',
          '3',
          '2'
        ], 'List<T> é tipo de referência: l1 e l2 apontam para o mesmo objeto.'),
        mcq('q3', 'O que ocorre em "object o = 42;"?', 'a', [
          'Boxing: o valor é copiado para um objeto na heap',
          'Unboxing: o objeto vira int',
          'Nada de especial; fica na stack sem custo',
          'Erro de compilação'
        ], 'Converter um tipo de valor em object cria uma caixa na heap (boxing).'),
        fill('q4', 'Complete com a palavra-chave que garante Dispose ao fim do escopo.', '___ var leitor = new StreamReader(caminho);', ['using'], 'using chama Dispose automaticamente, liberando o recurso mesmo se houver exceção.'),
        mcq('q5', 'Sobre o coletor de lixo (GC), qual afirmação é correta?', 'c', [
          'Você deve chamar GC.Collect() após cada uso de objeto',
          'Ele fecha arquivos abertos automaticamente a cada coleta',
          'Ele libera automaticamente a memória de objetos que não são mais alcançáveis',
          'Ele exige que você chame free em cada objeto'
        ], 'O GC recupera memória de objetos sem referências vivas. Não gerencia arquivos nem conexões: isso é papel do Dispose.'),
        mcq('q6', 'O que acontece?\n\nobject o = 42;\nlong x = (long)o;', 'd', [
          'x vira 42',
          'x vira 0',
          'Erro de compilação',
          'Lança InvalidCastException'
        ], 'O unboxing exige o tipo exato guardado (int). Para obter long: (long)(int)o.'),
        mcq('q7', 'Qual situação pode causar vazamento de memória mesmo com GC?', 'a', [
          'Uma lista estática à qual se adicionam objetos e nunca se removem',
          'Usar variáveis locais int',
          'Declarar uma classe sem campos',
          'Usar using em um StreamReader'
        ], 'Objetos alcançáveis a partir de uma referência estática nunca são coletados.'),
        fill('q8', 'Complete com a interface que uma classe implementa para poder ser usada em using.', 'public class Conexao : ___\n{\n    public void Dispose() { }\n}', ['IDisposable'], 'IDisposable define o método Dispose, chamado pelo using.')
      ]
    },
    {
      id: 'csb-29-nuget-solucoes',
      title: 'NuGet, projetos e soluções',
      goal: 'Organizar vários projetos em uma solução, usar pacotes NuGet com segurança e dominar os comandos dotnet do dia a dia.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Projeto (.csproj) e solução (.sln)',
            'Um PROJETO (.csproj) é a unidade que compila para um executável ou biblioteca (.dll). Uma SOLUÇÃO (.sln) é um arquivo que agrupa vários projetos para serem abertos e construídos juntos (por exemplo: o app de console, uma biblioteca de regras e um projeto de testes). Separar em projetos organiza o código e permite reutilizá-lo.',
            'dotnet new sln -n Agenda\ndotnet new console -o src/Agenda.App\ndotnet new classlib -o src/Agenda.Core\ndotnet sln add src/Agenda.App src/Agenda.Core'
          ),
          sl(
            'Referência entre projetos',
            'Para um projeto usar o código de outro da mesma solução, adicione uma referência de projeto. O comando grava no .csproj uma linha ProjectReference, e passa a ser possível usar as classes públicas da biblioteca. As dependências não podem formar ciclo (A referencia B e B referencia A).',
            'dotnet add src/Agenda.App reference src/Agenda.Core\n\n<!-- no Agenda.App.csproj -->\n<ItemGroup>\n  <ProjectReference Include="..\\Agenda.Core\\Agenda.Core.csproj" />\n</ItemGroup>'
          ),
          sl(
            'NuGet e PackageReference',
            'NuGet é o gerenciador de pacotes do .NET: bibliotecas prontas publicadas em nuget.org. O comando dotnet add package baixa o pacote e registra uma linha PackageReference no .csproj, com o nome e a versão. dotnet restore baixa novamente tudo o que o projeto declara (build, run e test já fazem restore automaticamente). Cada pacote tem versões; fixar a versão torna o build reproduzível.',
            'dotnet add src/Agenda.App package Newtonsoft.Json --version 13.0.3\n\n<!-- no .csproj -->\n<ItemGroup>\n  <PackageReference Include="Newtonsoft.Json" Version="13.0.3" />\n</ItemGroup>\n\ndotnet restore'
          ),
          sl(
            'Confie, mas verifique: segurança de pacotes',
            'Um pacote roda com as mesmas permissões do seu programa: um pacote malicioso é um risco real (cadeia de suprimentos). Antes de adicionar: confira o nome exato (existem imitações com nomes parecidos, o "typosquatting"), o autor ou organização verificada, o número de downloads e a atividade recente, a licença e o repositório de código. Prefira pacotes mantidos e conhecidos, e adicione só o que precisa; a biblioteca padrão já cobre muito (inclusive JSON).',
            'Checklist: nome exato? autor verificado? downloads e manutenção?\n            licença compatível? repositório aberto? realmente preciso dele?'
          ),
          sl(
            'Atualizar e checar vulnerabilidades',
            'Pacotes recebem correções de segurança; mantê-los atualizados é parte do trabalho. dotnet list package --outdated mostra os que têm versão mais nova e dotnet list package --vulnerable lista os que têm vulnerabilidades conhecidas (inclui dependências transitivas com --include-transitive). Faça isso com regularidade e leia notas de versão antes de saltos grandes.',
            'dotnet list package --outdated\ndotnet list package --vulnerable --include-transitive'
          ),
          sl(
            'build, test, clean e run',
            'dotnet build compila (a solução inteira se rodar na pasta do .sln); dotnet test compila e executa os projetos de teste; dotnet clean apaga os arquivos gerados; dotnet run compila e executa um projeto (com --project para escolher qual). Os resultados ficam nas pastas bin/ (binários) e obj/ (arquivos intermediários).',
            'dotnet build\ndotnet test\ndotnet clean\ndotnet run --project src/Agenda.App'
          ),
          sl(
            '.gitignore: bin/ e obj/ não vão para o Git',
            'bin/ e obj/ são gerados a cada compilação: não devem ser versionados (pesam, geram conflitos e podem conter caminhos do seu computador). Coloque-os no .gitignore, e também arquivos com dados locais ou sensíveis (como tarefas.json de teste, ou qualquer arquivo com segredos). O comando dotnet new gitignore cria um .gitignore padrão para .NET.',
            'dotnet new gitignore\n\n# trecho do .gitignore\nbin/\nobj/\n*.user\nappsettings.Development.json'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que é um arquivo .sln?', 'c', [
          'O código-fonte principal do programa',
          'Um pacote NuGet compactado',
          'Uma solução: arquivo que agrupa vários projetos para serem tratados em conjunto',
          'O arquivo com as configurações do compilador'
        ], 'A solução agrupa projetos (.csproj); cada projeto compila para um executável ou biblioteca.'),
        mcq('q2', 'Qual comando faz o projeto Agenda.App usar o código do projeto Agenda.Core?', 'a', [
          'dotnet add src/Agenda.App reference src/Agenda.Core',
          'dotnet add src/Agenda.App package src/Agenda.Core',
          'dotnet restore src/Agenda.Core',
          'dotnet new reference Agenda.Core'
        ], '"dotnet add <projeto> reference <outro>" cria um ProjectReference no .csproj.'),
        mcq('q3', 'Onde fica registrada a dependência de um pacote NuGet e o que faz o dotnet restore?', 'd', [
          'No .gitignore; o restore apaga o pacote',
          'No arquivo Program.cs; o restore compila o programa',
          'No .sln; o restore atualiza todos os pacotes para a última versão',
          'No .csproj, em PackageReference; o restore baixa os pacotes declarados'
        ], 'PackageReference declara o pacote e a versão; restore baixa o que está declarado.'),
        fill('q4', 'Complete o comando para adicionar um pacote NuGet ao projeto.', 'dotnet add ___ Newtonsoft.Json', ['package'], '"dotnet add package <nome>" baixa o pacote e o declara no .csproj.'),
        mcq('q5', 'Qual comando compila e executa os projetos de teste?', 'b', [
          'dotnet run --test',
          'dotnet test',
          'dotnet verify',
          'dotnet check'
        ], 'dotnet test compila e roda os testes unitários da solução ou projeto.'),
        mcq('q6', 'Antes de adicionar um pacote desconhecido ao projeto, o que é mais prudente?', 'c', [
          'Instalar o primeiro resultado da busca, pois todos são auditados',
          'Escolher o que tiver o nome mais curto',
          'Conferir nome exato, autor, downloads, licença e manutenção, e perguntar se realmente é necessário',
          'Desativar as verificações de segurança para o pacote carregar'
        ], 'Pacotes executam código com seus privilégios. Verifique a procedência para evitar imitações maliciosas e dependências desnecessárias.'),
        mcq('q7', 'Por que as pastas bin/ e obj/ vão no .gitignore?', 'd', [
          'Porque contêm o código-fonte principal',
          'Porque o Git não consegue ler essas pastas',
          'Porque são necessárias apenas em produção',
          'Porque são geradas pela compilação e não devem ser versionadas'
        ], 'São artefatos regeneráveis com dotnet build; versioná-los só gera peso e conflitos.'),
        fill('q8', 'Complete para listar pacotes com falhas de segurança conhecidas.', 'dotnet list package --___', ['vulnerable'], 'O parâmetro --vulnerable consulta vulnerabilidades conhecidas nos pacotes (e, com --include-transitive, nas dependências indiretas).')
      ]
    },
    {
      id: 'csb-30-depuracao-boas-praticas',
      title: 'Depuração e boas práticas',
      goal: 'Usar o depurador, ler erros e stack traces e escrever código limpo e documentado.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O depurador: breakpoints e execução passo a passo',
            'Em vez de espalhar Console.WriteLine, use o depurador (Visual Studio, VS Code com a extensão C#, Rider). Um BREAKPOINT marca uma linha onde a execução pausa. Parado ali, você inspeciona o estado e avança passo a passo: Step Over executa a linha atual sem entrar nos métodos chamados; Step Into entra no método chamado; Step Out roda até o fim do método atual e volta ao chamador; Continue segue até o próximo breakpoint.',
            'int Dobrar(int x) => x * 2;      // Step Into entra aqui\n\nint a = 5;                       // breakpoint nesta linha\nint b = Dobrar(a);               // Step Over executa a linha inteira\nConsole.WriteLine(b);'
          ),
          sl(
            'Janelas: Locals, Watch e Call Stack',
            'Locals mostra as variáveis do escopo atual com seus valores; Watch permite escrever expressões (como lista.Count ou a * 2) e acompanhar o valor a cada passo; Call Stack mostra a cadeia de métodos que levou até o ponto atual (quem chamou quem). Breakpoints condicionais (pausam só quando uma condição é verdadeira) ajudam em laços longos.',
            'Locals:     a = 5, b = 10\nWatch:      a * 2   ->  10\nCall Stack: Dobrar  <-  Main'
          ),
          sl(
            'Lendo erros de compilação',
            'Todo erro tem um código (CSxxxx) e uma mensagem: pesquisar o código ajuda. Exemplos frequentes: CS0103, "o nome não existe no contexto atual" (variável com erro de digitação ou fora de escopo); CS0246, "tipo ou namespace não encontrado" (falta um using ou uma referência de projeto/pacote); CS8600, "convertendo literal nulo ou possível valor nulo em tipo não anulável", que é um AVISO de nullable, não impede de compilar. Comece pelo PRIMEIRO erro: os demais costumam ser consequência.',
            'int total = soma + 1;        // CS0103: "soma" não existe\nListt<int> n = new();         // CS0246: tipo "Listt" não encontrado\nstring s = null;              // CS8600 (aviso de nullable)'
          ),
          sl(
            'Lendo um stack trace',
            'Quando uma exceção não é tratada, o programa imprime o stack trace: o tipo da exceção, a mensagem e uma lista de linhas "at ...". A PRIMEIRA linha "at" é onde a exceção foi lançada; as seguintes mostram quem a chamou, subindo até o início. Procure a primeira linha que aponta para o SEU código (arquivo e número da linha).',
            'Unhandled exception. System.DivideByZeroException: Attempted to divide by zero.\n   at Calculadora.Dividir(Int32 a, Int32 b) in Calculadora.cs:line 7\n   at Program.<Main>$(String[] args) in Program.cs:line 3'
          ),
          sl(
            'Nomes, métodos pequenos e comentários',
            'Escolha nomes que revelam a intenção (calcularDesconto, não calc2; prazoFinal, não p). Cada método deve fazer UMA coisa e caber na tela. Comentários não devem repetir o código ("soma 1 a i") e sim explicar o PORQUÊ: uma regra de negócio, uma decisão não óbvia, uma armadilha. Se o comentário explica "o que" porque o código é confuso, melhore o código. Consistência vale muito: use a convenção do .NET (PascalCase para tipos e métodos, camelCase para variáveis locais, _camelCase para campos privados).',
            '// ruim\ni++; // soma 1 a i\n\n// bom\n// A API limita a 100 itens por página; pedimos páginas até acabar.\nconst int TamanhoPagina = 100;'
          ),
          sl(
            'Documentação XML com ///',
            'Três barras antes de um membro iniciam a documentação XML: <summary> resume o que ele faz, <param> descreve cada parâmetro, <returns> o retorno e <exception> as exceções que pode lançar. O editor mostra esse texto ao passar o mouse e ao chamar o método (IntelliSense).',
            '/// <summary>\n/// Divide dois números inteiros.\n/// </summary>\n/// <param name="a">Dividendo.</param>\n/// <param name="b">Divisor; não pode ser zero.</param>\n/// <returns>O quociente inteiro.</returns>\n/// <exception cref="DivideByZeroException">Se b for zero.</exception>\npublic static int Dividir(int a, int b) => a / b;'
          ),
          sl(
            'Formatação e analisadores',
            'O comando dotnet format aplica automaticamente as regras de estilo (indentação, espaços, using ordenados) definidas no projeto, em geral configuradas em um arquivo .editorconfig. Analisadores (analyzers) são verificações extras do compilador que apontam possíveis bugs, problemas de estilo e de segurança durante a compilação; trate os avisos como parte do trabalho e, em projetos sérios, configure a build para não aceitar avisos novos.',
            'dotnet format\n# .editorconfig define o estilo da equipe, e o format o aplica'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que significa o erro CS0103?', 'b', [
          'Falta um ponto e vírgula',
          'O nome (variável, método) não existe no contexto atual',
          'O tipo ou namespace não foi encontrado',
          'Divisão por zero em tempo de execução'
        ], 'CS0103 costuma ser erro de digitação ou uso de variável fora do escopo.'),
        mcq('q2', 'Você escreveu "Listt<int> n = new();" e recebeu CS0246. Qual a causa?', 'd', [
          'A variável n foi declarada duas vezes',
          'Falta um return no método',
          'A lista está vazia',
          'O tipo Listt não existe (erro de digitação) ou falta um using/referência'
        ], 'CS0246 diz que o tipo ou namespace não foi encontrado. Aqui, o nome está errado.'),
        mcq('q3', 'Sobre CS8600 ("string s = null;" com nullable habilitado), o que é correto?', 'a', [
          'É um aviso: compila, mas aponta risco de NullReferenceException',
          'É um erro e impede de compilar',
          'Só aparece em tempo de execução',
          'Indica que falta o using System'
        ], 'É um aviso do nullable reference types; trate-o em vez de ignorá-lo.'),
        fill('q4', 'Complete com a tag XML que resume o que o método faz.', '/// <___>\n/// Soma dois números.\n/// </summary>', ['summary'], '<summary> descreve o membro e aparece no IntelliSense.'),
        mcq('q5', 'Parado em uma linha que chama um método, qual comando executa a linha inteira sem entrar no método?', 'c', [
          'Step Into',
          'Step Out',
          'Step Over',
          'Continue'
        ], 'Step Over executa a linha sem entrar; Step Into entra; Step Out sai do método atual.'),
        mcq('q6', 'Em um stack trace, o que mostra a PRIMEIRA linha "at ..."?', 'a', [
          'O ponto onde a exceção foi lançada, com as linhas seguintes mostrando quem o chamou',
          'O método Main, sempre',
          'O último método a terminar com sucesso',
          'O arquivo onde o programa foi salvo'
        ], 'O topo do stack trace é o local do erro; abaixo vêm os chamadores até o ponto de entrada.'),
        mcq('q7', 'Qual comentário é mais útil?', 'd', [
          '// soma 1 a i',
          '// loop',
          '// método da classe',
          '// A API limita a 100 itens por página; por isso paginamos.'
        ], 'Bons comentários explicam o porquê (regra, limitação, decisão), não repetem o que o código já diz.'),
        fill('q8', 'Complete o comando que aplica automaticamente o estilo de código do projeto.', 'dotnet ___', ['format'], 'dotnet format reformata o código conforme o .editorconfig e as regras do projeto.')
      ]
    },
    {
      id: 'csb-31-testes-unitarios-intro',
      title: 'Testes unitários (introdução)',
      goal: 'Escrever e rodar testes xUnit seguindo Arrange-Act-Assert, com testes independentes e determinísticos.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'Por que testar',
            'Um teste unitário é um pequeno programa que chama um trecho do seu código e verifica automaticamente se o resultado é o esperado. Benefícios: pega erros cedo, documenta o comportamento, e dá segurança para mudar o código (se algo quebrar, um teste falha). Testes são parte do código do projeto, não um extra.',
            '// Sem teste: rodar, olhar a saída, torcer.\n// Com teste: dotnet test  ->  Aprovado: 12, Com falha: 0'
          ),
          sl(
            'Projeto de testes xUnit',
            'xUnit é um dos frameworks de teste mais usados no .NET. Crie um projeto de testes separado, adicione-o à solução e referencie o projeto que será testado. Os testes usam as classes públicas do projeto referenciado.',
            'dotnet new xunit -o tests/Agenda.Tests\ndotnet sln add tests/Agenda.Tests\ndotnet add tests/Agenda.Tests reference src/Agenda.Core'
          ),
          sl(
            '[Fact] e Assert',
            'Um teste é um método público marcado com [Fact]. Ele passa se terminar sem exceção e falha se algum Assert falhar. Principais asserts: Assert.Equal(esperado, atual) (o ESPERADO vem primeiro, para a mensagem de falha ficar correta), Assert.True / Assert.False, Assert.Null / Assert.NotNull e Assert.Throws<T>(() => ...) que verifica se o código lança exatamente a exceção T.',
            'public class Calculadora\n{\n    public int Somar(int a, int b) => a + b;\n    public int Dividir(int a, int b) => a / b;\n}\n\npublic class CalculadoraTests\n{\n    [Fact]\n    public void Somar_DoisNumeros_RetornaSoma()\n    {\n        var calc = new Calculadora();\n        Assert.Equal(5, calc.Somar(2, 3));\n    }\n}'
          ),
          sl(
            'Padrão Arrange-Act-Assert',
            'Organize cada teste em três partes: ARRANGE (preparar objetos e dados), ACT (executar UMA ação sobre o código testado) e ASSERT (verificar o resultado). Separe-as com linhas em branco. Isso deixa o teste fácil de ler e mostra exatamente o que se testa.',
            '[Fact]\npublic void Somar_NumerosNegativos_RetornaSoma()\n{\n    // Arrange\n    var calc = new Calculadora();\n\n    // Act\n    int resultado = calc.Somar(-2, -3);\n\n    // Assert\n    Assert.Equal(-5, resultado);\n}'
          ),
          sl(
            'Testando exceções',
            'Assert.Throws<T> executa o código recebido em uma lambda e passa se a exceção lançada for exatamente do tipo T (subtipos NÃO servem; para aceitar derivadas existe ThrowsAny<T>). Ele devolve a exceção capturada, caso queira checar a mensagem.',
            '[Fact]\npublic void Dividir_PorZero_LancaDivideByZeroException()\n{\n    var calc = new Calculadora();\n    Assert.Throws<DivideByZeroException>(() => calc.Dividir(1, 0));\n}'
          ),
          sl(
            '[Theory] e [InlineData]',
            'Quando o mesmo teste deve rodar com vários dados, use [Theory]: o método recebe parâmetros e cada [InlineData(...)] fornece um conjunto de valores, gerando um caso de teste independente. Evita copiar e colar testes quase idênticos. Cada InlineData deve ter a mesma quantidade e tipos dos parâmetros.',
            '[Theory]\n[InlineData(2, 3, 5)]\n[InlineData(0, 0, 0)]\n[InlineData(-1, 1, 0)]\npublic void Somar_VariosCasos_RetornaSoma(int a, int b, int esperado)\n{\n    var calc = new Calculadora();\n    Assert.Equal(esperado, calc.Somar(a, b));\n}'
          ),
          sl(
            'Nomes, execução e testes confiáveis',
            'Nomeie testes de forma que o nome conte a história: Metodo_Cenario_ResultadoEsperado (Dividir_PorZero_LancaDivideByZeroException). Para executar tudo: dotnet test. Um bom teste é INDEPENDENTE (não depende de outro nem da ordem de execução) e DETERMINÍSTICO (mesmo resultado sempre): não use DateTime.Now, Random sem semente, arquivos compartilhados nem internet. Passe o que varia como parâmetro para poder controlá-lo.',
            'dotnet test\n\n// ruim: depende do relógio\nAssert.True(DateTime.Now.Year >= 2025);\n// bom: o método recebe a data como parâmetro\nAssert.True(servico.EstaVencida(prazo, hoje: new DateOnly(2025, 3, 15)));'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual comando executa os testes unitários de uma solução .NET?', 'c', [
          'dotnet run --tests',
          'dotnet verify',
          'dotnet test',
          'dotnet xunit'
        ], 'dotnet test compila e roda os projetos de teste, informando aprovados e falhas.'),
        mcq('q2', 'Qual atributo xUnit usa um teste que roda uma vez com vários conjuntos de dados vindos de [InlineData]?', 'b', [
          '[Fact]',
          '[Theory]',
          '[Test]',
          '[Data]'
        ], '[Theory] com [InlineData] gera um caso de teste por linha de dados; [Fact] é para testes sem parâmetros.'),
        mcq('q3', 'Na chamada Assert.Equal(5, calc.Somar(2, 3)), qual a ordem correta dos argumentos?', 'a', [
          'Primeiro o valor esperado, depois o valor atual',
          'Primeiro o valor atual, depois o esperado',
          'Tanto faz, não influencia nada',
          'Só aceita números inteiros'
        ], 'Por convenção, esperado primeiro: assim a mensagem de falha rotula certo cada valor.'),
        fill('q4', 'Complete com o atributo que marca um teste simples, sem parâmetros.', '[___]\npublic void Somar_DoisNumeros_RetornaSoma()\n{\n    Assert.Equal(5, new Calculadora().Somar(2, 3));\n}', ['Fact'], '[Fact] marca um método como teste; ele passa se nenhum Assert falhar nem houver exceção.'),
        mcq('q5', 'Qual descreve melhor o padrão Arrange-Act-Assert?', 'd', [
          'Apagar, Executar, Salvar',
          'Assert, Act, Arrange, na ordem inversa',
          'Cada teste faz 10 ações e vários asserts distintos',
          'Preparar o cenário, executar a ação testada e verificar o resultado'
        ], 'Arrange prepara, Act executa uma ação, Assert verifica. A estrutura deixa claro o que o teste faz.'),
        mcq('q6', 'Qual afirmação é verdadeira sobre Assert.Throws<DivideByZeroException>(() => calc.Dividir(1, 0))?', 'c', [
          'Passa mesmo se nenhuma exceção for lançada',
          'Passa para qualquer exceção',
          'Passa se o código lançar exatamente DivideByZeroException',
          'Só funciona com [Theory]'
        ], 'Throws<T> verifica a exceção do tipo exato; se não houver exceção ou for outro tipo, o teste falha.'),
        mcq('q7', 'Qual teste é independente e determinístico?', 'b', [
          'Um que verifica se DateTime.Now.Hour é menor que 12',
          'Um que cria seu próprio objeto, passa os dados fixos e compara com o resultado esperado',
          'Um que só passa se outro teste rodar antes',
          'Um que lê um arquivo compartilhado alterado por outros testes'
        ], 'Testes confiáveis controlam todas as entradas e não dependem de relógio, ordem ou estado compartilhado.'),
        fill('q8', 'Complete com o atributo que fornece um conjunto de valores a um [Theory].', '[Theory]\n[___(2, 3, 5)]\npublic void Somar_VariosCasos(int a, int b, int esperado) { }', ['InlineData'], '[InlineData(...)] define os argumentos de cada execução do Theory.')
      ]
    },
    {
      id: 'csb-32-mini-projeto',
      title: 'Mini-projeto: agenda de tarefas no console',
      goal: 'Juntar o que aprendeu em um app de console com records, LINQ, JSON, exceções, validação de entrada e testes.',
      xp: 20,
      intro: {
        slides: [
          sl(
            'O que vamos construir e a estrutura',
            'Uma agenda de tarefas no console: listar pendentes, adicionar com prazo opcional, concluir e salvar em arquivo JSON. Separamos responsabilidades: o modelo (Tarefa), a regra de negócio (GerenciadorTarefas, sem Console dentro, o que o torna testável), a persistência (RepositorioJson) e a interface (Program.cs, menu). Todos os dados dos exemplos são fictícios.',
            'Agenda/\n  Agenda.sln\n  src/Agenda.App/\n    Program.cs              <- menu (interface)\n    Tarefa.cs               <- modelo\n    GerenciadorTarefas.cs   <- regras de negócio\n    RepositorioJson.cs      <- salvar/carregar\n  tests/Agenda.Tests/\n    GerenciadorTarefasTests.cs'
          ),
          sl(
            'O modelo: Tarefa como record',
            'Tarefa é um dado puro: id, título, prazo opcional e situação. Um record posicional dá igualdade por valor, ToString e o with para criar uma versão concluída sem alterar a original. O prazo usa DateOnly? porque só importa a data, e pode faltar.',
            'namespace Agenda.App;\n\npublic record Tarefa(int Id, string Titulo, DateOnly? Prazo = null, bool Concluida = false);'
          ),
          sl(
            'Regras de negócio com validação e LINQ',
            'GerenciadorTarefas guarda uma List<Tarefa>. Adicionar valida o título com ThrowIfNullOrWhiteSpace; Concluir procura a tarefa e lança InvalidOperationException se ela não existir, e troca o item por uma cópia com with. Pendentes usa LINQ: filtra, ordena pelo prazo (quem não tem prazo vai para o fim, com ?? DateOnly.MaxValue) e desempata pelo título.',
            'public class GerenciadorTarefas\n{\n    private readonly List<Tarefa> _tarefas;\n    private int _proximoId;\n\n    public GerenciadorTarefas(IEnumerable<Tarefa>? iniciais = null)\n    {\n        _tarefas = iniciais?.ToList() ?? new List<Tarefa>();\n        _proximoId = _tarefas.Count == 0 ? 1 : _tarefas.Max(t => t.Id) + 1;\n    }\n\n    public IReadOnlyList<Tarefa> Todas => _tarefas;\n\n    public Tarefa Adicionar(string titulo, DateOnly? prazo = null)\n    {\n        ArgumentException.ThrowIfNullOrWhiteSpace(titulo);\n        var tarefa = new Tarefa(_proximoId++, titulo.Trim(), prazo);\n        _tarefas.Add(tarefa);\n        return tarefa;\n    }\n\n    public void Concluir(int id)\n    {\n        int i = _tarefas.FindIndex(t => t.Id == id);\n        if (i < 0)\n            throw new InvalidOperationException($"Tarefa {id} não encontrada.");\n        _tarefas[i] = _tarefas[i] with { Concluida = true };\n    }\n\n    public IEnumerable<Tarefa> Pendentes() =>\n        _tarefas.Where(t => !t.Concluida)\n                .OrderBy(t => t.Prazo ?? DateOnly.MaxValue)\n                .ThenBy(t => t.Titulo);\n}'
          ),
          sl(
            'Persistência em JSON, com cuidado',
            'Carregar: se o arquivo não existe, começa vazio; se existe, desserializa dentro de try/catch (JsonException) e VALIDA o resultado (nulo, títulos em branco), pois o arquivo pode ter sido editado ou corrompido. Salvar serializa com WriteIndented para ficar legível. As opções são criadas uma vez e reusadas. Lembre: o arquivo guarda o que o usuário escreveu; trate-o como dado dele (não versione, não logue).',
            'using System.Text.Json;\n\nnamespace Agenda.App;\n\npublic static class RepositorioJson\n{\n    private static readonly JsonSerializerOptions Opcoes = new() { WriteIndented = true };\n\n    public static List<Tarefa> Carregar(string caminho)\n    {\n        if (!File.Exists(caminho))\n            return new List<Tarefa>();\n\n        try\n        {\n            var lista = JsonSerializer.Deserialize<List<Tarefa>>(File.ReadAllText(caminho));\n            return lista?.Where(t => !string.IsNullOrWhiteSpace(t.Titulo)).ToList()\n                   ?? new List<Tarefa>();\n        }\n        catch (JsonException)\n        {\n            Console.WriteLine("Arquivo corrompido; começando com a agenda vazia.");\n            return new List<Tarefa>();\n        }\n    }\n\n    public static void Salvar(string caminho, IEnumerable<Tarefa> tarefas) =>\n        File.WriteAllText(caminho, JsonSerializer.Serialize(tarefas, Opcoes));\n}'
          ),
          sl(
            'O menu em loop com switch',
            'Program.cs lê o caminho do arquivo, carrega os dados e entra em um while(true). Cada volta mostra o menu e um switch trata a opção. TODA entrada do usuário é validada: int.TryParse para o id, DateOnly.TryParseExact para a data e try/catch ao chamar as regras de negócio. A opção "0" salva e usa return para encerrar. Todo caso do switch termina com break (ou return).',
            'string caminho = Path.Combine(AppContext.BaseDirectory, "tarefas.json");\nvar gerenciador = new GerenciadorTarefas(RepositorioJson.Carregar(caminho));\n\nwhile (true)\n{\n    Console.WriteLine("\\n1) Listar pendentes  2) Adicionar  3) Concluir  0) Sair");\n    Console.Write("Opção: ");\n\n    switch (Console.ReadLine())\n    {\n        case "1":\n            foreach (var t in gerenciador.Pendentes())\n                Console.WriteLine($"[{t.Id}] {t.Titulo} - prazo: {t.Prazo?.ToString("yyyy-MM-dd") ?? "sem prazo"}");\n            break;\n\n        case "3":\n            Console.Write("Id: ");\n            if (!int.TryParse(Console.ReadLine(), out int id))\n            {\n                Console.WriteLine("Digite um número.");\n                break;\n            }\n            try\n            {\n                gerenciador.Concluir(id);\n                Console.WriteLine("Concluída!");\n            }\n            catch (InvalidOperationException ex)\n            {\n                Console.WriteLine(ex.Message);\n            }\n            break;\n\n        case "0":\n            RepositorioJson.Salvar(caminho, gerenciador.Todas);\n            return;\n\n        default:\n            Console.WriteLine("Opção inválida.");\n            break;\n    }\n}\n// (a opção "2" segue o mesmo molde: ler título, TryParseExact do prazo, Adicionar)'
          ),
          sl(
            'Um teste xUnit para a regra de negócio',
            'Testamos o GerenciadorTarefas direto, sem Console nem arquivo: rápido, independente e determinístico. Um [Fact] confere o caminho feliz e outro confirma o erro com Assert.Throws; um [Theory] cobre títulos inválidos. Rode com dotnet test na pasta da solução.',
            'public class GerenciadorTarefasTests\n{\n    [Fact]\n    public void Concluir_IdExistente_MarcaComoConcluida()\n    {\n        var g = new GerenciadorTarefas();\n        var t = g.Adicionar("Estudar LINQ");\n\n        g.Concluir(t.Id);\n\n        Assert.True(g.Todas.Single().Concluida);\n        Assert.Empty(g.Pendentes());\n    }\n\n    [Fact]\n    public void Concluir_IdInexistente_LancaInvalidOperationException()\n    {\n        var g = new GerenciadorTarefas();\n        Assert.Throws<InvalidOperationException>(() => g.Concluir(99));\n    }\n\n    [Theory]\n    [InlineData("")]\n    [InlineData("   ")]\n    public void Adicionar_TituloVazio_LancaArgumentException(string titulo)\n    {\n        var g = new GerenciadorTarefas();\n        Assert.Throws<ArgumentException>(() => g.Adicionar(titulo));\n    }\n}'
          ),
          sl(
            'Boas práticas e próximos passos',
            'Revise: nomes claros, métodos curtos, regras separadas da interface, entrada validada, exceções específicas, nada de dados pessoais reais em exemplos, bin/ obj/ e tarefas.json de teste no .gitignore. Próximos passos para evoluir: editar e remover tarefas, filtrar por data com LINQ, trocar o JSON por um banco de dados, usar injeção de dependência e interfaces (IRepositorio) para testar a persistência, e programação assíncrona. Esses temas aparecem no nível intermediário.',
            '// Ideia de evolução\npublic interface IRepositorioTarefas\n{\n    List<Tarefa> Carregar();\n    void Salvar(IEnumerable<Tarefa> tarefas);\n}'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que imprime?\n\nvar t = new Tarefa(1, "A");\nvar u = t with { Concluida = true };\nConsole.WriteLine(t.Concluida + " " + u.Concluida);', 'c', [
          'True True',
          'True False',
          'False True',
          'False False'
        ], 'with cria uma cópia modificada; a tarefa original continua não concluída.'),
        mcq('q2', 'Dadas as tarefas pendentes abaixo (record Tarefa(int Id, string Titulo, DateOnly? Prazo)), o que imprime?\n\nvar l = new List<Tarefa> {\n  new(1, "B", new DateOnly(2025, 5, 2)),\n  new(2, "A", null),\n  new(3, "C", new DateOnly(2025, 4, 1)) };\nvar r = l.OrderBy(t => t.Prazo ?? DateOnly.MaxValue).ThenBy(t => t.Titulo);\nConsole.WriteLine(string.Join(",", r.Select(t => t.Titulo)));', 'a', [
          'C,B,A',
          'A,C,B',
          'B,C,A',
          'A,B,C'
        ], 'Ordena pelo prazo mais cedo (C em 1/4, depois B em 2/5); quem não tem prazo vira MaxValue e vai por último (A).'),
        mcq('q3', 'No menu em loop, o que faz o case "0" com "RepositorioJson.Salvar(...); return;"?', 'd', [
          'Salva e volta ao início do menu',
          'Apenas ignora a opção',
          'Reinicia o programa',
          'Salva os dados e encerra o programa ao sair do while'
        ], 'return em Program.cs termina a execução depois de salvar; sem ele o loop continuaria.'),
        fill('q4', 'Complete com o método que lança exceção se o título for nulo, vazio ou só espaços.', 'ArgumentException.___(titulo);', ['ThrowIfNullOrWhiteSpace'], 'Valida o argumento logo no início do método e falha rápido.'),
        mcq('q5', 'Qual teste verifica que concluir um id inexistente falha corretamente?', 'b', [
          'Assert.True(g.Concluir(99));',
          'Assert.Throws<InvalidOperationException>(() => g.Concluir(99));',
          'Assert.Equal(99, g.Concluir(99));',
          'Assert.Null(g.Concluir(99));'
        ], 'Concluir é void e lança InvalidOperationException; Assert.Throws confirma o tipo exato de exceção.'),
        mcq('q6', 'Ao carregar tarefas.json, por que capturar JsonException e validar os títulos depois?', 'c', [
          'Porque JsonSerializer sempre falha na primeira leitura',
          'Porque JSON só funciona com validação do sistema operacional',
          'Porque o arquivo pode estar corrompido ou ter sido editado: dado externo nunca é confiável',
          'Para deixar o programa mais lento e seguro'
        ], 'Arquivos podem ser alterados ou corrompidos; capturar o erro e validar o conteúdo evita falhas e dados inválidos.'),
        mcq('q7', 'Sobre privacidade neste projeto, qual prática está correta?', 'b', [
          'Gravar o tarefas.json com dados reais no repositório público',
          'Usar dados fictícios nos exemplos e não versionar o tarefas.json com dados reais',
          'Registrar em log o conteúdo completo de cada tarefa',
          'Guardar senhas dos usuários no arquivo para facilitar'
        ], 'Dados do usuário não devem ir para o Git nem para logs; guarde só o necessário e use exemplos fictícios.'),
        fill('q8', 'Complete com o método que lê um inteiro sem lançar exceção quando o texto é inválido.', 'if (!int.___(Console.ReadLine(), out int id))\n{\n    Console.WriteLine("Digite um número.");\n}', ['TryParse'], 'TryParse devolve false em vez de lançar FormatException: ideal para entrada do usuário.')
      ]
    },
  ]
};
