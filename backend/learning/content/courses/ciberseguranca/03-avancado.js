// Módulo "Avançado" do curso de Cibersegurança — parte A (lições 01 a 19). Ver ../../index.js para o
// formato e a validação de boot. Curso DEFENSIVO e educacional: o comportamento do adversário é descrito
// apenas em nível de mecanismo (o que ele quer, que sinais deixa, como detectar e mitigar), sem comandos
// ofensivos, payloads ou bypass de produtos. Nenhum dado pessoal real; segredos sempre <placeholder>;
// nenhuma versão ou estatística é afirmada. Não é aconselhamento jurídico (LGPD, Marco Civil e
// Lei 12.737/2012 são citados só em visão geral). Trechos de configuração são ilustrativos e não foram
// executados nesta edição. Helpers locais (mcq, fill, sl) produzem o formato exigido pela validação do boot.
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
  id: 'avancado-ciber',
  levelKey: 'advanced',
  order: 3,
  title: 'Avançado',
  subtitle: 'Arquitetura zero trust, engenharia de detecção, hunting, SOC e SOAR, DFIR, táticas do adversário vistas pela defesa, AD, telemetria Windows e Linux, NDR, criptografia avançada, chaves, nuvem e identidade privilegiada',
  accent: '#0ea5e9',
  lessons: [
    {
      id: 'csa-01-arquitetura-de-seguranca-e-zero-trust',
      title: 'Arquitetura de segurança e zero trust',
      goal: 'Projetar segurança em camadas, entender os princípios do zero trust, os papéis de PEP e PDP, a identidade como novo perímetro e os trade-offs da adoção.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Do perímetro à arquitetura de segurança',
            'O modelo clássico de "castelo e fosso" confiava em tudo que estivesse dentro da rede corporativa: bastava passar pelo firewall de borda. Hoje há nuvem, trabalho remoto, SaaS e dispositivos pessoais, então a borda deixou de existir como linha única. Uma arquitetura de segurança é o desenho intencional de controles (identidade, rede, endpoint, dados, aplicações, monitoramento) e de como eles se combinam para proteger o negócio. Ela parte de perguntas: o que protegemos, de quem, e o que acontece quando um controle falha?'
          ),
          sl(
            'Defesa em profundidade moderna',
            'Defesa em profundidade significa empilhar camadas de controle INDEPENDENTES, de modo que a falha de uma não derrube todas. Na versão moderna as camadas são: identidade (MFA, acesso condicional), endpoint (EDR, hardening), rede (segmentação, filtragem de saída), aplicação (validação, patch), dados (criptografia, classificação) e detecção e resposta (SIEM, SOC, IR). Erro comum: camadas que dependem do mesmo ponto de falha, como todos os controles confiando na mesma conta administrativa. Camadas só valem se falharem de formas diferentes.'
          ),
          sl(
            'Princípios do zero trust',
            'Zero trust é um conjunto de princípios, não um produto. Os pilares conceituais: (1) nunca confiar por localização de rede, sempre verificar; (2) verificar de forma explícita usando identidade, estado do dispositivo e contexto; (3) conceder o menor privilégio, por tempo limitado; (4) assumir violação (assume breach): projetar supondo que algo já foi comprometido, para limitar o raio de impacto, por exemplo com microssegmentação; (5) registrar e analisar continuamente. O lema resume: nunca confie, sempre verifique.',
            'Pedido de acesso -> verificar identidade\n                 -> verificar dispositivo\n                 -> avaliar contexto e risco\n                 -> conceder o mínimo necessário\n                 -> registrar e reavaliar durante a sessão'
          ),
          sl(
            'PEP e PDP: quem decide e quem aplica',
            'Em zero trust cada acesso passa por dois papéis. O PDP (Policy Decision Point, ponto de decisão de política) recebe sinais como identidade, postura do dispositivo, horário e sensibilidade do recurso, e DECIDE se o acesso é permitido. O PEP (Policy Enforcement Point, ponto de aplicação de política) fica no caminho do tráfego (um proxy, gateway ou agente) e APLICA a decisão, liberando ou cortando a conexão. Exemplo: o proxy de acesso a uma aplicação interna é o PEP e consulta o serviço de políticas, que é o PDP. Separar os papéis permite mudar a política sem mexer em cada ponto de aplicação.'
          ),
          sl(
            'Identidade como perímetro',
            'Se a rede não é mais a fronteira, a identidade passa a ser. Cada acesso é autenticado e autorizado, com MFA, avaliação de risco e sinais do dispositivo. Exemplo: antes, um funcionário na VPN ganhava acesso amplo à rede interna; agora cada aplicação exige verificação própria. Por isso o provedor de identidade vira um alvo de altíssimo valor e precisa de proteção reforçada: MFA resistente a phishing, contas privilegiadas separadas, monitoramento de sessões. Se a conta cai, o atacante herda tudo que a identidade pode ver.'
          ),
          sl(
            'Trade-offs e erros de adoção',
            'Zero trust não é grátis. Custos reais: mais complexidade operacional, dependência de inventário confiável de identidades, dispositivos e aplicações, atrito para o usuário se mal desenhado e necessidade de integrar sistemas legados que não suportam autenticação moderna. Por isso a adoção é gradual, começando pelos ativos mais críticos. Erros comuns: comprar uma "solução zero trust" e considerar o assunto resolvido, ignorar a detecção e resposta (assume breach exige olhar o que acontece depois do acesso) e não medir se o atrito aumentou o uso de atalhos inseguros.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Em uma arquitetura zero trust, qual é o papel do PDP (Policy Decision Point)?', 'b', [
          'Aplicar o bloqueio no caminho do tráfego, encerrando a conexão no gateway quando necessário',
          'Avaliar identidade, dispositivo e contexto para decidir se o acesso é permitido',
          'Guardar por anos os registros de todas as decisões para auditorias e conformidade regulatória',
          'Emitir certificados digitais para dispositivos e distribuir as chaves aos usuários da rede'
        ], 'O PDP decide. Quem aplica a decisão é o PEP; armazenar logs e emitir certificados são funções de outros componentes.'),
        mcq('q2', 'Um funcionário conectado à VPN tem a credencial roubada. Por que, no modelo de perímetro tradicional, isso é especialmente grave?', 'd', [
          'A VPN criptografa o tráfego do invasor e impede que o SOC consiga inspecionar o que ele faz na rede',
          'O firewall de borda deixa de funcionar enquanto houver usuários remotos conectados à rede interna',
          'Credenciais roubadas só funcionam quando o invasor está fisicamente dentro do escritório da empresa',
          'Estar na VPN vira confiança implícita, e a credencial dá acesso amplo à rede'
        ], 'No modelo de perímetro, estar dentro da rede equivale a ser confiável. Zero trust exige verificação por aplicação. As demais alternativas descrevem comportamentos que não existem.'),
        mcq('q3', 'Qual é um custo real de adotar zero trust?', 'a', [
          'Maior complexidade operacional e dependência de inventário confiável de identidades, dispositivos e aplicações',
          'Perda da capacidade de registrar logs, porque cada acesso passa a ser verificado só no dispositivo de origem, já que o monitoramento passa a ser dispensável',
          'Obrigação de substituir todas as aplicações legadas antes de começar qualquer migração parcial',
          'Eliminação do risco, o que torna desnecessário manter detecção e resposta a incidentes'
        ], 'Zero trust exige inventário e integração e aumenta a complexidade. Ele não elimina o risco, depende de telemetria e costuma ser adotado de forma gradual.'),
        fill('q4', 'Complete o lema do zero trust.', 'Nunca confie, sempre ___.', ['verifique', 'verificar', 'verify'], 'O lema do zero trust é nunca confiar por localização de rede e sempre verificar cada acesso de forma explícita.'),
        mcq('q5', 'Um atacante contorna o filtro de e-mail, mas o EDR do endpoint e o monitoramento de identidade ainda bloqueiam o avanço. Que princípio explica o resultado?', 'c', [
          'Segurança por obscuridade, que esconde dos invasores a existência dos sistemas internos',
          'Confiança implícita na rede interna, que filtra o que passou pela borda',
          'Defesa em profundidade, com camadas independentes que não falham juntas',
          'Redundância de hardware, que mantém o serviço ativo mesmo sem bloquear o ataque'
        ], 'Camadas independentes permitem que a falha de uma seja compensada por outra. Obscuridade e confiança implícita não são camadas de proteção, e redundância trata disponibilidade.'),
        mcq('q6', 'O que significa o princípio "assumir violação" (assume breach)?', 'd', [
          'Aceitar que invasões são inevitáveis e por isso reduzir o investimento em prevenção e controles',
          'Desligar a conta de qualquer usuário assim que surgir uma suspeita, antes de qualquer investigação',
          'Comunicar a autoridade a cada alerta de segurança, mesmo antes de confirmar que houve um incidente',
          'Projetar supondo que algo já foi comprometido, limitando o raio de impacto'
        ], 'Assume breach orienta o design: segmentar, dar o mínimo de privilégio e monitorar, para que o comprometimento de uma parte não se espalhe. Não significa abandonar a prevenção.'),
        mcq('q7', 'Além da senha, quais sinais um PDP maduro costuma considerar antes de liberar um acesso?', 'a', [
          'Postura do dispositivo, contexto da sessão e sensibilidade do recurso',
          'O endereço IP de origem, que identifica o usuário de forma confiável e suficiente',
          'O fabricante do roteador do provedor de internet e a versão do seu firmware',
          'A quantidade de e-mails enviados pelo usuário no dia, como único indicador de risco'
        ], 'Zero trust combina identidade, estado do dispositivo e contexto. IP isolado não identifica pessoas, e os demais itens são irrelevantes para a decisão.'),
        fill('q8', 'Complete o significado da sigla PDP.', 'PEP = Policy Enforcement Point (aplica); PDP = Policy ___ Point (decide).', ['Decision', 'decisão', 'decisao'], 'O PDP é o Policy Decision Point, o ponto que decide. O PEP (Enforcement) aplica a decisão.')
      ]
    },
    {
      id: 'csa-02-engenharia-de-deteccao',
      title: 'Engenharia de detecção',
      goal: 'Tratar detecções como produto de engenharia: código versionado, ciclo de vida, testes, cobertura ATT&CK e equilíbrio entre qualidade e ruído medido por métricas.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'O que é engenharia de detecção',
            'Engenharia de detecção é a disciplina de projetar, construir, testar e manter regras e analíticas que transformam telemetria em alertas úteis. Diferente de apenas "escrever uma regra no SIEM", ela trata a detecção como um produto com requisitos, dono, testes e métricas. O objetivo não é o maior número de alertas, e sim alertas que levem a ações. Uma detecção ruim custa duas vezes: gasta tempo do analista e ensina a equipe a ignorar alertas.'
          ),
          sl(
            'Detection-as-code',
            'Detection-as-code significa guardar as regras como código em um repositório (por exemplo em formatos como Sigma, já vistos no nível intermediário), com versionamento, revisão por pares (pull request), testes automatizados e implantação por pipeline. Vantagens: histórico de quem mudou o quê, possibilidade de reverter (rollback), revisão antes de ir à produção e padronização. Erro comum: editar regras diretamente na console de produção, sem revisão nem registro, o que impede reproduzir comportamentos e investigar quando um alerta some.',
            'detections/\n  windows/proc_creation_office_shell.yml\n  cloud/new_access_key_by_unusual_user.yml\n  tests/\n    positivos/  (eventos que DEVEM disparar)\n    negativos/  (atividade legítima que NÃO deve disparar)'
          ),
          sl(
            'Ciclo de vida de uma regra',
            'Toda detecção percorre etapas: (1) hipótese e requisito (qual comportamento queremos ver e por quê); (2) desenvolvimento; (3) teste com dados positivos e negativos; (4) revisão por pares; (5) implantação, muitas vezes primeiro em modo de observação; (6) monitoramento e ajuste (tuning) com base nos alertas reais; (7) revisão periódica ou aposentadoria quando a regra perde valor. A mudança de um formato de log, por exemplo, pode quebrar ou inundar uma regra sem que ninguém perceba, por isso o monitoramento faz parte do ciclo.'
          ),
          sl(
            'Testes: positivos e negativos',
            'Um caso de teste positivo é um evento que deve disparar a regra (simulado em laboratório próprio, ou reproduzido a partir de logs de exercício autorizado). Um caso negativo é atividade legítima parecida que NÃO deve disparar. Os negativos são essenciais porque revelam falsos positivos antes da produção. Também se testa a regra contra um volume histórico (replay de logs) para estimar quantos alertas por dia ela geraria. Sem testes, toda mudança de regra é um risco: ela pode silenciar a detecção ou criar uma enxurrada de alertas.'
          ),
          sl(
            'Cobertura ATT&CK e seus limites',
            'Mapear as regras para técnicas do ATT&CK mostra onde há detecção e onde há lacunas. Mas cobertura não é qualidade: ter "uma regra mapeada" para a técnica não diz se ela dispara de verdade, se cobre as variações da técnica ou se é ruidosa demais para ser usada. Uma técnica tem muitas formas de execução, então boa cobertura significa várias detecções complementares e testadas. Use o mapa para priorizar lacunas guiado por inteligência de ameaças (as técnicas que mais importam para o seu setor), não para exibir um percentual.'
          ),
          sl(
            'Qualidade, ruído e métricas',
            'Métricas básicas: precisão = verdadeiros positivos / (verdadeiros positivos + falsos positivos), isto é, entre os alertas gerados, quantos eram reais. Exemplo: 8 alertas reais em 20 alertas dá precisão de 40%. Uma regra de alta sensibilidade, mas baixa precisão, inunda a fila e causa fadiga de alerta. Outras métricas úteis: taxa de falsos positivos por regra, tempo médio até detectar (MTTD) e percentual de regras com teste automatizado. Regras que ninguém consegue acionar de forma útil devem ser ajustadas ou aposentadas.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a principal vantagem de tratar regras de detecção como código (detection-as-code)?', 'c', [
          'Dispensar os testes, porque o repositório já valida automaticamente o comportamento da regra',
          'Garantir que a regra deixe de gerar falso positivo depois de implantada, por ser escrita em linguagem compilada',
          'Versionamento, revisão por pares, testes automatizados e possibilidade de reverter mudanças',
          'Permitir que cada analista altere regras em produção diretamente, sem etapa de aprovação'
        ], 'Código em repositório traz histórico, revisão, testes e rollback. Não elimina falsos positivos nem a necessidade de testar, e editar em produção sem aprovação é justamente o que se evita.'),
        mcq('q2', 'Uma regra gerou 40 alertas no mês e 10 deles eram incidentes reais. Qual é a precisão da regra?', 'a', [
          '25%, pois dez verdadeiros positivos entre quarenta alertas gerados',
          '75%, pois os trinta alertas restantes foram corretamente descartados pela equipe, o que mostra um bom acerto',
          '10%, pois o número de incidentes reais é dividido por uma base padrão de cem alertas',
          '40%, pois o total de alertas gerados no mês indica diretamente o nível de acerto da regra'
        ], 'Precisão é verdadeiros positivos dividido pelo total de alertas: 10 / 40 = 25%. Os 30 alertas descartados eram falsos positivos, não acertos.'),
        mcq('q3', 'A matriz ATT&CK da organização mostra 80% das técnicas com pelo menos uma regra associada. O que se pode concluir?', 'd', [
          'Que a organização detecta 80% dos ataques reais que sofrer',
          'Que as técnicas restantes são irrelevantes e podem ser ignoradas definitivamente',
          'Que testar as regras é desnecessário, pois a cobertura já comprova o funcionamento delas, e as lacunas restantes podem ser tratadas como baixa prioridade',
          'Que há regras mapeadas, mas nada ali informa a qualidade, a profundidade ou se disparam de fato'
        ], 'Cobertura mede mapeamento, não eficácia. Sem testes e métricas, não se sabe se a regra dispara, se cobre variações ou se é ruidosa.'),
        fill('q4', 'Complete a fórmula da precisão.', 'precisão = verdadeiros positivos / (verdadeiros positivos + ___ positivos)', ['falsos', 'falso'], 'Os falsos positivos entram no denominador: eles são os alertas que pareciam reais, mas não eram.'),
        mcq('q5', 'Depois de uma mudança no formato de um log, uma regra passa a disparar centenas de vezes por dia. Que etapa do ciclo de vida trata isso?', 'b', [
          'Apagar a regra do repositório sem registro algum, para que ninguém precise explicá-la depois, mantendo só a lembrança verbal da equipe',
          'Monitoramento e ajuste (tuning), com revisão ou aposentadoria se a regra não for recuperável',
          'Reescrever a hipótese original em outra ferramenta, sem coletar nenhuma métrica anterior',
          'Aumentar o limite de alertas por hora do SIEM para acomodar o novo volume gerado'
        ], 'O ciclo de vida inclui monitorar e ajustar regras em produção. Apagar sem registro perde histórico, e aumentar limites só esconde o problema.'),
        mcq('q6', 'Por que um bom conjunto de testes inclui casos negativos, isto é, atividade legítima parecida com o ataque?', 'a', [
          'Para medir quanto tráfego legítimo dispararia a regra e ajustá-la antes da produção',
          'Porque os negativos substituem os casos positivos quando o laboratório não permite simulações',
          'Para reduzir o tamanho do repositório descartando logs antigos que não serão mais usados',
          'Para que a regra só dispare quando o invasor repetir exatamente o comando usado no teste'
        ], 'Casos negativos revelam falsos positivos antes de a regra atingir a fila do SOC. Não substituem os positivos e uma regra presa a um único comando seria facilmente contornada.'),
        mcq('q7', 'Uma detecção tem alta sensibilidade e baixa precisão. Qual efeito operacional é o mais provável?', 'c', [
          'Perda de eventos reais, pois a regra deixa de enxergar o comportamento do ataque',
          'Redução do tempo de resposta, porque mais alertas treinam melhor a equipe de plantão',
          'Fila inundada, fadiga de alerta e risco de um alerta real passar despercebido',
          'Queda automática do custo de licenciamento do SIEM, já que o volume é processado em lote'
        ], 'Muitos falsos positivos desgastam a equipe e escondem alertas reais. Alta sensibilidade significa pouca perda de eventos reais, e volume maior costuma aumentar custo.'),
        fill('q8', 'Complete o nome da etapa de revisão de regras como código.', 'Mudanças nas regras entram por revisão por pares em um pull ___.', ['request', 'requests'], 'Pull request é a solicitação de revisão e integração de mudanças no repositório: o mecanismo de revisão por pares em detection-as-code.')
      ]
    },
    {
      id: 'csa-03-threat-hunting',
      title: 'Threat hunting',
      goal: 'Conduzir caçadas proativas a partir de hipóteses, escolher entre abordagens guiadas por TTP e por dados, documentar e converter achados em detecções permanentes.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'O que é threat hunting',
            'Threat hunting é a busca PROATIVA e dirigida por hipótese de atividade maliciosa que as detecções automáticas não pegaram. A premissa é a mesma do assume breach: se um adversário competente já está no ambiente, ele provavelmente evita as regras conhecidas. Diferente da triagem de alertas, que reage ao que o sistema sinalizou, o hunting parte de uma pergunta feita por um analista. Ele não substitui a detecção: complementa, encontrando lacunas que depois viram regras.'
          ),
          sl(
            'A hipótese bem formulada',
            'Uma boa hipótese é específica, testável e ligada a dados que você realmente tem. Formato útil: "Se o adversário usa a técnica X, veremos o sinal Y nos dados Z." Exemplo defensivo: "Se alguém abusa de contas de serviço, veremos logons INTERATIVOS dessas contas nos logs de autenticação dos últimos 30 dias." Má hipótese: "procurar algo estranho na rede". Sem hipótese, o analista afoga em dados sem critério para decidir o que é relevante.',
            'Hipótese : contas de serviço não deveriam fazer logon interativo\nDados     : logs de autenticação (30 dias)\nConsulta   : tipo de logon interativo AND conta em lista de serviço\nResultado  : N achados -> triagem; zero -> documentar'
          ),
          sl(
            'Hunting guiado por TTP e por dados',
            'Guiado por TTP (inteligência): parte de táticas, técnicas e procedimentos descritos em relatórios de inteligência de ameaças ou na matriz ATT&CK e procura os sinais dessas técnicas no ambiente. Guiado por dados: parte dos próprios dados e procura anomalias estatísticas. Uma técnica clássica é a "análise de cauda longa" (stacking): contar quantas máquinas executam cada processo e investigar os que aparecem em pouquíssimas, pois software legítimo costuma estar em muitas. Há também a caçada guiada por entidade, que investiga uma conta ou host específico.'
          ),
          sl(
            'Exemplos de hipóteses defensivas',
            'Algumas hipóteses úteis: (1) um processo de editor de documentos cria um interpretador de comandos; (2) um servidor faz conexões em intervalos muito regulares para um domínio raro (indício de beaconing); (3) surgem tarefas agendadas ou serviços novos em servidores fora de janela de mudança; (4) uma conta autentica em dezenas de hosts em poucos minutos; (5) consultas DNS com subdomínios longos para um mesmo domínio. Para cada uma, defina antes quais dados são necessários e quais atividades legítimas podem parecer iguais.'
          ),
          sl(
            'Documentar e aprender com o resultado',
            'Registre cada caçada: hipótese, fontes de dados, consulta, período, achados, falsos positivos encontrados e lacunas de visibilidade. Resultado negativo também é resultado: confirma que, com aqueles dados, a hipótese não aparece, e documenta o que foi coberto. Se a caçada revelou que o dado necessário não existia, isso é um requisito de telemetria para a engenharia de detecção e para a equipe de TI. A documentação evita repetir trabalho e permite medir o valor do programa.'
          ),
          sl(
            'Transformar achado em detecção',
            'O ganho duradouro do hunting é converter o que funcionou em detecção automática. Se uma consulta retornou poucos resultados e quase todos relevantes, ela é candidata a regra: escreva-a como código, teste com casos positivos e negativos, ajuste o ruído e implante. Se achou um incidente, acione a resposta a incidentes. Assim, cada ciclo de hunting reduz a quantidade de coisas que dependem de olho humano e eleva a maturidade das detecções.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que diferencia threat hunting da triagem de alertas?', 'd', [
          'O hunting só é feito depois de um incidente confirmado, para produzir um relatório final',
          'O hunting usa exclusivamente os alertas já gerados, reordenados por severidade e por criticidade do ativo',
          'O hunting dispensa dados históricos e trabalha com o tráfego em tempo real capturado pelo firewall',
          'O hunting parte de uma hipótese e busca o que as detecções não pegaram'
        ], 'Hunting é proativo e dirigido por hipótese. A triagem reage a alertas existentes. Hunting usa dados históricos e não depende de incidente prévio.'),
        mcq('q2', 'Qual das opções é uma hipótese de hunting bem formulada?', 'b', [
          'Procurar qualquer coisa estranha na rede e ver o que aparece nos painéis',
          'Se contas de serviço estão sendo abusadas, veremos logons interativos delas nos logs de autenticação dos últimos 30 dias',
          'Verificar se o servidor está seguro, de maneira geral, sem delimitar dados ou período',
          'Rodar as regras do SIEM novamente, pois hunting é uma revisão periódica dos alertas já fechados'
        ], 'A boa hipótese é específica, testável e ligada a dados existentes (técnica, sinal, fonte, período). As demais são vagas ou repetem o que já existe.'),
        mcq('q3', 'Uma caçada de duas semanas não encontrou nada. Qual é a conduta adequada?', 'c', [
          'Descartar o registro, já que sem achados não há o que reportar à gestão',
          'Repetir a mesma consulta, sem alterações, até que algum alerta apareça',
          'Documentar hipótese, fontes, consulta e lacunas, pois o resultado negativo também tem valor',
          'Declarar o ambiente limpo e encerrar o programa de hunting por falta de resultados, já que nada foi detectado nas fontes consultadas'
        ], 'O resultado negativo documenta o que foi coberto e pode revelar lacunas de visibilidade. Não prova que o ambiente está limpo.'),
        fill('q4', 'Complete o formato de uma hipótese de hunting.', 'Se o adversário usa a técnica X, veremos o sinal Y nos ___ Z.', ['dados', 'logs', 'data'], 'A hipótese liga a técnica a um sinal observável em uma fonte de dados que se possui.'),
        mcq('q5', 'Uma consulta de hunting retornou poucos resultados, quase todos relevantes. Qual é o próximo passo mais valioso?', 'a', [
          'Avaliar transformá-la em regra de detecção, com testes e ajuste de ruído',
          'Manter a consulta na memória do analista, para não gerar fila no SOC nem carga no SIEM',
          'Ampliar o escopo até a consulta retornar milhares de linhas, para ter mais certeza',
          'Apagar a consulta, porque achados de hunting não podem ser convertidos em detecção automática'
        ], 'O objetivo do ciclo é converter o que funciona em detecção permanente. Guardar só na memória não escala e ampliar sem critério destrói a precisão.'),
        mcq('q6', 'Qual abordagem é um exemplo de hunting guiado por dados, e não por TTP?', 'c', [
          'Procurar a técnica citada em um relatório recente de inteligência de ameaças',
          'Escolher a técnica da matriz ATT&CK que ainda não tem regra e testar sinais dela',
          'Contar em quantas máquinas cada processo roda e investigar os que aparecem em pouquíssimas',
          'Executar uma varredura de vulnerabilidades em toda a rede interna para listar falhas, classificadas por criticidade e idade'
        ], 'Analisar frequências para achar anomalias (stacking) parte dos dados. As duas primeiras opções partem de TTPs e a varredura é gestão de vulnerabilidades.'),
        mcq('q7', 'Durante uma caçada você descobre que o log necessário nunca foi coletado. Como tratar essa descoberta?', 'b', [
          'Ignorar, pois sem dado não há o que fazer e o registro da caçada não deve mencioná-la',
          'Registrar como requisito de telemetria: sem esse dado, nenhuma detecção futura funcionaria',
          'Tratar como falha do analista, que deveria ter escolhido outra hipótese desde o início, e refazer a caçada com outro analista do zero',
          'Substituir o dado ausente por suposições da equipe e seguir com a conclusão da caçada'
        ], 'Lacunas de visibilidade são achados valiosos: viram requisito de telemetria. Suposições no lugar de dados invalidam a conclusão.'),
        fill('q8', 'Complete o tipo de hunting.', 'O hunting guiado por ___ parte de técnicas descritas em relatórios de inteligência e na matriz ATT&CK.', ['TTP', 'TTPs', 'ttp', 'inteligência', 'inteligencia'], 'TTP (táticas, técnicas e procedimentos) é o ponto de partida do hunting guiado por inteligência.')
      ]
    },
    {
      id: 'csa-04-soc-operacao-soar',
      title: 'Operação do SOC e SOAR',
      goal: 'Entender níveis e rotina do SOC, priorização e triagem, playbooks, automação segura com SOAR, métricas e SLAs e como evitar burnout mantendo qualidade.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Estrutura e níveis do SOC',
            'O SOC (Security Operations Center) é a equipe e o processo que monitora, detecta, investiga e responde a eventos de segurança. Um modelo comum usa níveis: N1 faz a triagem inicial de alertas e fecha ou escala; N2 aprofunda a investigação, correlacionando fontes; N3 (ou engenharia e hunting) trata casos complexos, melhora detecções e apoia a resposta a incidentes. Outros SOCs organizam por função (detecção, resposta, inteligência) em vez de níveis. Em qualquer modelo, o essencial é que os papéis e os critérios de escalonamento estejam claros.'
          ),
          sl(
            'Fila de alertas e triagem',
            'Todo alerta entra em uma fila e precisa ser priorizado por mais de um critério: severidade da regra, criticidade do ativo (um servidor de folha de pagamento pesa mais que um notebook de teste), confiança da detecção e contexto (usuário privilegiado, horário). Na triagem o analista decide: falso positivo, verdadeiro positivo benigno (atividade real, porém autorizada) ou verdadeiro positivo malicioso. Todo fechamento deve ter justificativa registrada, pois ela alimenta o ajuste das regras. Erro comum: priorizar só pela severidade nominal da regra.'
          ),
          sl(
            'Playbooks',
            'Um playbook é um roteiro documentado para um tipo de alerta ou incidente: quais perguntas fazer, quais evidências coletar, quais decisões tomar, quando escalar e quais ações de contenção são autorizadas. Exemplo: playbook de "login suspeito em conta de nuvem" lista verificar origem e MFA, consultar atividade recente, decidir sobre revogar sessões e notificar o dono da conta. Playbooks reduzem variação entre analistas, aceleram a resposta e são a base para a automação. Eles precisam de revisão regular, senão ficam desatualizados.'
          ),
          sl(
            'SOAR e automação segura',
            'SOAR (Security Orchestration, Automation and Response) é a plataforma que integra ferramentas e executa playbooks de forma automática ou semiautomática: enriquecer um alerta com reputação e contexto do ativo, abrir tickets, notificar o dono. Princípios de automação segura: automatize primeiro o que é de baixo risco e reversível (enriquecimento, consultas); exija aprovação humana para ações de alto impacto (isolar um servidor crítico, desativar contas privilegiadas); limite o alcance (máximo de contas ou máquinas por execução); registre tudo para auditoria; teste os fluxos. Um erro de lógica automatizado pode causar mais dano que o alerta original.'
          ),
          sl(
            'SLAs e métricas',
            'Acordos de nível de serviço definem prazos por severidade (ex.: tempo para reconhecer e para conter). Métricas usuais: MTTD (tempo médio para detectar), MTTA (tempo médio até o analista assumir o alerta) e MTTR (tempo médio para responder e resolver, contado a partir da detecção). Cuidado com métricas de vaidade: fechar mais alertas por hora pode significar triagem apressada e pior qualidade. Combine velocidade com qualidade, como a taxa de reabertura e a precisão das regras.'
          ),
          sl(
            'Fadiga, burnout e qualidade',
            'Fila inundada de falsos positivos, plantões longos e trabalho repetitivo causam fadiga de alerta e burnout, e analistas esgotados erram mais. Medidas sustentáveis: tuning contínuo das regras ruidosas com feedback do SOC para a engenharia de detecção, automação do trabalho repetitivo, rodízio entre funções e turnos, treinamento, e controle de qualidade por amostragem dos alertas fechados. Erros comuns: cobrar mais fechamentos por turno, silenciar regras sem registro e fechar alertas em massa sem revisão.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual atividade é típica do nível 2 (N2) de um SOC?', 'a', [
          'Aprofundar a investigação de alertas escalados, correlacionando várias fontes',
          'Ler os alertas novos e fechar os que parecerem falsos positivos, sem escalar casos',
          'Gerenciar o orçamento de licenças e a contratação de novas ferramentas de segurança',
          'Definir sozinho a política de retenção legal de dados pessoais da organização'
        ], 'O N2 investiga com profundidade casos escalados pelo N1. Triagem é do N1, e orçamento e política de retenção são decisões de gestão e jurídico.'),
        mcq('q2', 'Dois alertas aguardam: severidade média em um servidor de folha de pagamento, com confiança alta; severidade alta em um notebook de teste, com confiança baixa. Qual priorizar?', 'c', [
          'O do notebook, porque a severidade nominal é a única variável que define a prioridade, mesmo que o ativo seja de baixa criticidade',
          'O mais recente, pois alertas mais antigos já perderam relevância para a investigação',
          'O do servidor de folha, porque criticidade do ativo e confiança pesam junto com a severidade',
          'Os dois ao mesmo tempo, sem priorizar, até que um terceiro confirme manualmente cada um deles'
        ], 'A priorização combina severidade, criticidade do ativo, confiança e contexto. Olhar só a severidade nominal ignora o impacto potencial.'),
        mcq('q3', 'Qual ação de um playbook automatizado deve exigir aprovação humana antes de ser executada?', 'b', [
          'Consultar a reputação de um hash em um serviço de inteligência de ameaças',
          'Isolar da rede um servidor de produção crítico',
          'Anexar ao ticket o resultado da consulta de registro de um domínio',
          'Marcar o alerta como em análise e atribuí-lo a um analista de plantão'
        ], 'Ações de alto impacto, como isolar um servidor crítico, exigem decisão humana. As outras são enriquecimentos ou atualizações de baixo risco e reversíveis.'),
        fill('q4', 'Complete com o nome da plataforma que orquestra e automatiza a execução de playbooks.', '___ = Security Orchestration, Automation and Response', ['SOAR', 'soar'], 'SOAR integra ferramentas e executa playbooks de forma automática ou semiautomática.'),
        mcq('q5', 'Por que ações automáticas de resposta devem ser reversíveis e ter limite de alcance?', 'd', [
          'Porque a automação não consegue registrar o que fez e depende da memória do analista',
          'Porque plataformas SOAR só funcionam quando todas as ações são feitas manualmente, passo a passo, conforme exigência comum dos fornecedores da plataforma',
          'Para que o analista de N1 aprenda a executar manualmente cada passo antes de poder automatizar',
          'Porque um falso positivo ou erro de lógica pode afetar muitos sistemas ou contas antes que alguém perceba'
        ], 'Automação sem limites amplifica erros: um falso positivo pode derrubar muitos sistemas. Reversibilidade e teto de alcance reduzem esse risco.'),
        mcq('q6', 'Qual métrica mede o tempo médio para responder e resolver um incidente, contado a partir da detecção?', 'b', [
          'MTTD, o tempo médio para detectar o comportamento malicioso',
          'MTTR, o tempo médio de resposta e resolução',
          'MTTA, o tempo médio até o analista reconhecer o alerta na fila',
          'A taxa de falsos positivos, que mede a qualidade das regras de detecção'
        ], 'MTTR cobre a resposta e a resolução. MTTD mede detecção, MTTA mede o reconhecimento do alerta e a taxa de falsos positivos mede qualidade de regra.'),
        mcq('q7', 'Qual medida reduz a fadiga de alerta de forma sustentável?', 'd', [
          'Elevar a meta de alertas fechados por analista em cada turno para forçar mais agilidade',
          'Desativar silenciosamente as regras que mais disparam, sem registro nem revisão posterior',
          'Fechar automaticamente os alertas de baixa severidade de ativos críticos, sem revisão por amostragem',
          'Tuning contínuo das regras ruidosas, com feedback do SOC para a engenharia de detecção'
        ], 'O tuning com feedback ataca a causa do ruído. Cobrar mais fechamentos, silenciar sem registro e fechar em massa pioram a qualidade e criam pontos cegos.'),
        fill('q8', 'Complete com o nome do roteiro documentado para tratar um tipo de alerta.', 'Roteiro de passos, decisões e escalonamento para um tipo de alerta: ___', ['playbook', 'runbook', 'playbooks'], 'Playbook é o roteiro documentado que padroniza a resposta e serve de base para automação.')
      ]
    },
    {
      id: 'csa-05-dfir-memoria-disco-timeline',
      title: 'DFIR: memória, disco e linha do tempo',
      goal: 'Coletar e preservar evidências respeitando a ordem de volatilidade, entender artefatos de memória e disco, montar uma linha do tempo correlacionada e respeitar limites legais e a LGPD.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Aquisição e preservação de evidências',
            'Forense digital (DFIR) responde: o que aconteceu, quando, como e o que foi afetado. A evidência precisa ser coletada de forma que se prove que não foi alterada. Princípios: trabalhar sobre uma CÓPIA (imagem) do disco ou da memória, não sobre o original; calcular um hash (resumo criptográfico) da imagem e conferi-lo ao longo do processo para provar a integridade; e manter a cadeia de custódia, um registro de quem coletou, manuseou e guardou cada evidência, quando e com qual hash. Sem isso, a evidência perde valor técnico e jurídico.'
          ),
          sl(
            'Ordem de volatilidade',
            'Dados diferentes desaparecem em velocidades diferentes. A ordem de volatilidade manda coletar primeiro o mais volátil: memória (RAM), depois estado de rede e processos em execução, depois disco, depois logs remotos e, por fim, mídias de backup. Por isso, desligar uma máquina suspeita antes de capturar a memória destrói evidências valiosas: processos, conexões e chaves que só existem na RAM. A decisão de isolar da rede (conter) sem desligar costuma preservar mais informação.',
            'mais volátil  ->  memória (RAM)\n                  conexões de rede e processos\n                  disco\n                  logs remotos\nmenos volátil ->  backups e mídia arquivada'
          ),
          sl(
            'Memória volátil',
            'A memória guarda o que o disco muitas vezes não tem: lista de processos e seus argumentos, conexões de rede ativas, módulos carregados, código executado apenas em memória (que nunca foi gravado em disco) e, às vezes, chaves de criptografia e credenciais em uso. A análise de memória permite identificar processos escondidos ou injetados e confirmar o que realmente estava rodando. Limitação: o conteúdo muda a todo instante, então a captura deve ser feita cedo, com ferramenta confiável, e cada ação do responsável deixa pequenas alterações que devem ser documentadas.'
          ),
          sl(
            'Artefatos de disco',
            'O disco guarda vestígios de execução e uso: logs de eventos do sistema, registros e arquivos de configuração, itens de inicialização automática, arquivos recentes, histórico de navegadores, e os carimbos de tempo do sistema de arquivos (criação, modificação, acesso e alteração de metadados). Esses carimbos ajudam a reconstruir a sequência, mas podem ser alterados, por isso nunca devem ser a única fonte. Cada sistema operacional tem seus artefatos próprios, e o analista aprende quais deles registram execução, persistência e acesso a arquivos.'
          ),
          sl(
            'Linha do tempo e correlação',
            'A linha do tempo (timeline) junta eventos de várias fontes (disco, memória, logs de rede, identidade, nuvem) em ordem cronológica para contar a história do incidente. Cuidados: normalizar fusos horários (idealmente tudo em UTC), checar desvio de relógio de cada fonte e correlacionar pelo menos duas fontes independentes antes de concluir. Prática útil: partir de um evento âncora conhecido (o alerta) e fazer pivoteamento para antes e depois. Erro comum: comparar horários sem normalizar o fuso e tirar conclusões erradas sobre a ordem dos fatos.'
          ),
          sl(
            'Limites legais, LGPD e ética na coleta',
            'Coletar evidências envolve dados pessoais (e-mails, arquivos e históricos de pessoas). A LGPD (Lei 13.709/2018) pede finalidade, necessidade e segurança no tratamento: colete o necessário para a investigação, restrinja o acesso à evidência, registre a base e a finalidade e descarte quando não for mais necessário. Monitorar equipamentos de trabalho depende de política interna prévia e clara. Em casos de possível crime, envolva o jurídico antes de acessar conteúdo de terceiros. Isto é visão geral e não substitui orientação jurídica.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que capturar a memória antes de desligar uma máquina suspeita?', 'b', [
          'Porque desligar a máquina é proibido por lei em qualquer investigação de incidente',
          'Porque a memória é volátil: processos, conexões e chaves em RAM se perdem ao desligar',
          'Porque o disco rígido é regravado automaticamente toda vez que o equipamento é desligado',
          'Porque a memória guarda uma cópia fiel dos arquivos que estão no disco, dispensando a imagem do disco'
        ], 'A RAM é o dado mais volátil e some ao desligar. As outras afirmações são falsas: desligar não é ilegal por si só e a RAM não reproduz o disco inteiro.'),
        mcq('q2', 'O que a cadeia de custódia documenta?', 'd', [
          'A lista de vulnerabilidades corrigidas no sistema antes de a evidência ser coletada',
          'O custo financeiro estimado do incidente para fins de seguro e de contabilidade',
          'O histórico de versões do software forense usado na análise, sem relação com a evidência',
          'Quem coletou, manuseou e guardou a evidência, quando e com qual hash'
        ], 'A cadeia de custódia comprova a integridade e o histórico de manuseio da evidência. As outras opções tratam de assuntos diferentes.'),
        mcq('q3', 'Por que trabalhar sobre uma cópia da imagem, com hash conferido, e não sobre o original?', 'a', [
          'Para preservar o original e poder provar que a cópia analisada é idêntica a ele',
          'Porque o original é mais lento e a cópia reduz o tempo da análise forense por ser comprimida',
          'Porque cópias dispensam o registro de cadeia de custódia, que vale para originais físicos',
          'Porque o hash modifica o original e por isso só pode ser aplicado sobre cópias descartáveis'
        ], 'O hash prova identidade e integridade, e o original fica intacto. O hash não modifica dados e a cadeia de custódia vale para as cópias também.'),
        fill('q4', 'Complete o princípio da coleta.', 'Na ordem de volatilidade, coleta-se primeiro o dado mais ___ (como a memória RAM).', ['volátil', 'volatil'], 'Dados voláteis desaparecem rápido, por isso são coletados primeiro.'),
        mcq('q5', 'Dois logs de fontes diferentes registram horários distintos para o mesmo evento. Qual é o primeiro cuidado?', 'c', [
          'Descartar o log com horário mais antigo, pois horários antigos são pouco confiáveis',
          'Usar a média aritmética dos dois horários como o horário oficial do evento, sem normalizar',
          'Verificar fuso e desvio de relógio de cada fonte e normalizar, por exemplo para UTC',
          'Concluir que um dos logs foi adulterado e interromper a análise até haver confirmação'
        ], 'Diferenças de fuso ou relógio desalinhado são a causa mais comum. Normalizar antes de concluir evita erro de interpretação. Descartar ou fazer média sem critério distorce a história.'),
        mcq('q6', 'Na coleta forense de um notebook corporativo, qual prática está alinhada à LGPD?', 'd', [
          'Copiar todo o conteúdo do disco e deixá-lo acessível a qualquer pessoa da TI para consulta futura',
          'Coletar tudo o que for possível e guardar indefinidamente, caso venha a ser útil em outra investigação',
          'Compartilhar a imagem do disco com um fornecedor externo sem contrato, para agilizar a análise',
          'Coletar o necessário à finalidade, restringir o acesso e registrar base e finalidade'
        ], 'Finalidade, necessidade e segurança orientam a coleta. Acesso amplo, guarda indefinida e compartilhamento sem contrato contrariam esses princípios.'),
        mcq('q7', 'Um arquivo mostra carimbos de tempo incoerentes com o restante da linha do tempo. Qual é a leitura prudente?', 'a', [
          'Pode haver cópia do arquivo ou manipulação dos carimbos, o que pede correlação com outras fontes',
          'Os carimbos de tempo do sistema de arquivos são imutáveis e confiáveis, então o restante é que está errado',
          'O arquivo certamente é malicioso, pois só malware consegue alterar carimbos de tempo de arquivos',
          'A análise deve ser abandonada, porque carimbos incoerentes tornam inútil qualquer linha do tempo'
        ], 'Carimbos de tempo podem mudar por cópia, movimentação ou adulteração e nunca devem ser a única fonte. Correlacionar com logs e memória confirma o que aconteceu.'),
        fill('q8', 'Complete o nome do registro de manuseio da evidência.', 'O registro de quem coletou e guardou cada evidência chama-se cadeia de ___.', ['custódia', 'custodia'], 'A cadeia de custódia documenta o histórico de manuseio e sustenta a integridade da evidência.')
      ]
    },
    {
      id: 'csa-06-malware-dinamica-e-engenharia-reversa',
      title: 'Malware: análise dinâmica e engenharia reversa',
      goal: 'Entender como observar o comportamento de amostras em ambiente isolado, o que a análise dinâmica produz para a defesa e o que é engenharia reversa em nível conceitual.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Estática e dinâmica: duas formas de olhar',
            'Analisar uma amostra suspeita pode ser feito de dois modos complementares. Na análise ESTÁTICA, o arquivo é examinado sem ser executado: hashes, metadados, textos embutidos, estrutura, bibliotecas que ele declara usar. É segura, mas pode não revelar o que o programa faz de fato, principalmente se estiver empacotado ou ofuscado. Na análise DINÂMICA, a amostra é executada em um ambiente controlado e observa-se o que ela faz. As duas se combinam: a estática orienta o que procurar, a dinâmica confirma o comportamento.'
          ),
          sl(
            'Sandbox isolado: regras de segurança',
            'Executar uma amostra suspeita é perigoso e só se faz em ambiente preparado para isso. Regras do laboratório: máquina virtual (VM) dedicada, com um snapshot (ponto de restauração) do estado limpo, para voltar ao início a cada teste; SEM credenciais reais, SEM pastas compartilhadas com o computador real e SEM acesso à rede corporativa; rede simulada ou estritamente controlada; análise em equipamento separado do de trabalho. Nunca execute amostras na sua máquina de uso diário ou em servidores de produção. Tudo isso se aplica apenas a amostras de fontes legítimas, em laboratório próprio e autorizado.'
          ),
          sl(
            'Comportamento observável',
            'Durante a execução observa-se: processos criados (e quem é o processo pai), arquivos criados, alterados ou apagados, chaves de configuração e itens de inicialização modificados (persistência), consultas DNS e conexões de rede, e tentativas de desativar defesas. Cada observação é um sinal que pode virar detecção. Exemplo conceitual: se a amostra cria uma tarefa agendada e consulta um domínio específico, esses dois fatos viram regra de EDR, bloqueio de DNS e item de busca no SIEM. A análise dinâmica produz, assim, comportamentos e indicadores para a defesa.'
          ),
          sl(
            'Engenharia reversa: conceito',
            'Engenharia reversa (RE) é reconstruir o funcionamento de um programa a partir do código compilado, usando desmontadores (que mostram instruções de máquina) e decompiladores (que tentam produzir código de alto nível). Em defesa, o RE busca responder: o que o programa faz, como armazena configurações, quais algoritmos de criptografia usa, a que endereços de comando se conecta. É trabalho caro e especializado, reservado a casos importantes (um malware novo e relevante para a organização). Aqui o foco é conceitual: o RE de malware real é feito por especialistas, em laboratório, com amostras de fontes legítimas.'
          ),
          sl(
            'Do achado à defesa',
            'O valor da análise está no que se faz com o resultado: regras YARA para descrever a amostra, regras Sigma ou de EDR para o comportamento, bloqueios de domínios e IPs, relatório para a inteligência de ameaças (CTI) e orientações de mitigação. Cuidado com a confidencialidade: não envie amostras que contenham dados internos ou pessoais a serviços públicos de análise sem avaliar o risco, pois isso pode expor informações da organização e violar a LGPD. Prefira anonimizar quando possível ou usar serviços privados contratados.'
          ),
          sl(
            'Limitações da análise dinâmica',
            'Amostras podem não mostrar comportamento no laboratório: algumas verificam se estão em uma máquina virtual, aguardam um tempo ou uma condição específica, ou exigem interação do usuário. Por isso, uma amostra "silenciosa" no sandbox NÃO pode ser considerada inofensiva: combine com a análise estática e com outras fontes. Outra limitação é o tempo: o comportamento completo pode levar horas. Conclusões devem ser expressas com o nível de confiança correspondente, e as lacunas devem ser documentadas.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a diferença central entre análise estática e análise dinâmica de uma amostra?', 'c', [
          'A estática precisa de internet e a dinâmica funciona sem conexão com nenhuma rede',
          'A dinâmica analisa o código-fonte original e a estática exige o binário rodando em produção',
          'Na estática o arquivo é examinado sem ser executado; na dinâmica observa-se o comportamento ao executá-lo em ambiente controlado',
          'A estática é usada só para vírus antigos e a dinâmica só para ameaças modernas'
        ], 'A distinção é executar ou não. As demais alternativas inventam diferenças que não existem.'),
        mcq('q2', 'Qual configuração é a mais adequada para executar uma amostra suspeita em laboratório?', 'a', [
          'VM isolada com snapshot, sem credenciais reais, com rede simulada ou estritamente controlada',
          'O notebook de trabalho com antivírus atualizado, desde que a rede esteja desconectada da internet pública',
          'Um servidor de homologação da empresa, já que ele não é o ambiente de produção principal',
          'Uma VM com pasta compartilhada do computador real, para facilitar a cópia dos resultados'
        ], 'O isolamento com snapshot evita danos e permite restaurar o estado limpo. Máquina de trabalho, rede da empresa e pastas compartilhadas expõem o ambiente real.'),
        mcq('q3', 'Qual produto da análise dinâmica pode ser usado diretamente para criar detecções?', 'd', [
          'A opinião do analista sobre o autor provável da amostra, sem evidência técnica',
          'O tamanho do arquivo em bytes, que identifica a família de qualquer malware',
          'O tempo total que a análise levou, usado para calibrar a velocidade do SOC',
          'A lista de comportamentos e artefatos observados, como processos filhos, itens de persistência e domínios consultados'
        ], 'Comportamentos e artefatos observados viram regras e bloqueios. Tamanho do arquivo não identifica famílias e o tempo de análise não descreve a ameaça.'),
        fill('q4', 'Complete o tipo de análise.', 'Na análise ___, o arquivo é examinado sem ser executado.', ['estática', 'estatica'], 'A análise estática examina o arquivo sem rodá-lo; é segura, mas pode não revelar o comportamento real.'),
        mcq('q5', 'Por que não enviar, sem avaliação, uma amostra obtida em um incidente real a um serviço público de análise?', 'b', [
          'Porque serviços públicos só aceitam amostras de malware antigo, que já estão catalogadas',
          'Porque a amostra pode conter dados internos ou pessoais, e o envio a terceiros pode violar a confidencialidade e a LGPD',
          'Porque o envio altera o hash da amostra e impede qualquer comparação posterior',
          'Porque a análise pública gera resultados técnicos sem valor aproveitável para a equipe'
        ], 'Amostras de incidentes reais podem carregar informações sensíveis. Os outros argumentos são falsos: o envio não altera o hash e esses serviços produzem resultados úteis.'),
        mcq('q6', 'A amostra não mostrou nenhum comportamento no sandbox. Qual é a interpretação prudente?', 'a', [
          'Pode estar detectando o ambiente ou aguardando uma condição; combinar com análise estática antes de concluir',
          'A amostra é inofensiva, e o caso pode ser encerrado e arquivado',
          'O sandbox está defeituoso e deve ser descartado em favor de análise em máquina de produção',
          'A amostra foi corrompida na coleta e a investigação precisa recomeçar do zero em outra máquina, descartando o sandbox atual por completo'
        ], 'Ausência de comportamento no laboratório não prova inocuidade, pois amostras podem evitar o ambiente ou esperar gatilhos. Executar em produção seria perigoso.'),
        mcq('q7', 'Qual é o objetivo da engenharia reversa conceitual em uma abordagem defensiva?', 'c', [
          'Copiar o código do malware para reutilizá-lo em testes de intrusão em sistemas de terceiros',
          'Substituir a necessidade de logs e telemetria no ambiente da organização',
          'Entender funcionalidades e configuração da ameaça para produzir detecção e contenção',
          'Provar quem é o autor do malware, que é o único resultado possível do processo'
        ], 'O RE defensivo busca entender o comportamento para detectar e conter. Reutilizar malware contra terceiros é ilegal e antiético, e o RE não substitui a telemetria.'),
        fill('q8', 'Complete o recurso de segurança do laboratório.', 'Antes de executar a amostra, crie um ___ da VM para poder restaurar o estado limpo.', ['snapshot', 'snapshots'], 'O snapshot guarda o estado limpo da VM e permite voltar a ele depois de cada execução.')
      ]
    },
    {
      id: 'csa-07-acesso-inicial-e-execucao',
      title: 'Acesso inicial e execução: sinais e mitigações',
      goal: 'Reconhecer como adversários obtêm o primeiro ponto de apoio e executam código, e aplicar sinais de detecção e mitigações por técnica.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'O que o adversário quer no começo',
            'Na kill chain e no ATT&CK, as táticas de Acesso Inicial e Execução descrevem o primeiro passo: obter um ponto de apoio e fazer um código rodar. O adversário quer o caminho mais barato e confiável, que quase sempre explora pessoas, credenciais e serviços expostos, e não técnicas sofisticadas. Para o defensor, isso é uma boa notícia: cada técnica comum tem sinais conhecidos e mitigações de custo moderado. Descrevemos aqui o MECANISMO, os SINAIS e as MITIGAÇÕES; não há receitas de ataque.'
          ),
          sl(
            'Phishing e engenharia social',
            'Mecanismo: induzir uma pessoa a abrir um anexo, clicar em um link ou entregar a credencial em uma página falsa. Sinais: e-mail de domínio parecido com o legítimo, anexo com macros, login na conta vindo de local ou dispositivo atípico logo depois do clique, regras de redirecionamento criadas na caixa de e-mail. Mitigações: filtro de e-mail e análise de links, bloqueio de macros vindas da internet, treinamento com botão de reportar, e principalmente MFA resistente a phishing, como chaves FIDO2 e passkeys, que só funcionam no domínio legítimo e por isso não podem ser entregues a uma página falsa.'
          ),
          sl(
            'Credenciais válidas e serviços expostos',
            'Credential stuffing é a tentativa automatizada de usar pares usuário e senha vazados em outros sites, aproveitando que muitas pessoas reutilizam senhas. Sinais: grande volume de falhas distribuídas por muitos IPs e contas, seguidas de alguns sucessos. Mitigações: MFA, limitação de taxa de tentativas, verificação de senhas conhecidas como vazadas, bloqueio de protocolos legados que não suportam MFA e alerta ao usuário em novo dispositivo. Serviços de administração expostos à internet (como acesso remoto direto) ampliam o risco e devem ficar atrás de VPN ou de acesso com zero trust.'
          ),
          sl(
            'Vulnerabilidades em serviços expostos',
            'Aplicações, gateways e VPNs expostos à internet com falhas conhecidas e sem correção são alvos de varredura automática. Sinais: um servidor web que passa a gerar processos filhos incomuns (como um interpretador de comandos), novas contas, arquivos novos em diretórios da aplicação, conexões de saída do servidor para destinos novos. Mitigações: inventário da superfície externa, correção priorizada pelas vulnerabilidades que já são exploradas ativamente (catálogos públicos de vulnerabilidades exploradas ajudam), WAF como camada extra, segmentação e privilégio mínimo para o serviço. Veja os cursos de OWASP e Redes para a parte técnica das falhas.'
          ),
          sl(
            'Cadeia de suprimentos',
            'Mecanismo: em vez de atacar a vítima, o adversário compromete um fornecedor, uma biblioteca ou uma atualização que a vítima já confia. Sinais: software confiável passa a exibir comportamento novo (conexões inéditas, processos filhos diferentes), dependências inesperadas em uma versão. Mitigações: SBOM (Software Bill of Materials, a lista de componentes e dependências de um software, que permite saber rápido se um componente comprometido está em uso), fixar versões e verificar assinaturas e hashes, revisar o acesso de fornecedores e segmentar o que eles alcançam.'
          ),
          sl(
            'Execução: sinais e controles',
            'Após o acesso, o adversário executa código por meio de scripts, linha de comando, documentos com macros ou binários legítimos do sistema. Sinal clássico: relação pai e filho de processos anormal, como um editor de documentos ou um navegador criando um interpretador de comandos. Controles: allowlist de aplicações (só roda o que foi aprovado), regras de redução de superfície de ataque no endpoint, registro de linha de comando e de scripts, e EDR com regras de comportamento. Cada alerta aqui deve ser tratado com o playbook de contenção apropriado.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O processo de um editor de documentos cria um interpretador de comandos. Qual é a leitura defensiva?', 'd', [
          'Comportamento normal de qualquer editor moderno e que não exige acompanhamento',
          'Falha do antivírus, que deveria ter bloqueado o documento antes de ele ser aberto',
          'Sinal exclusivo de ataque a servidores, sem relevância para estações de trabalho',
          'Relação pai-filho anormal, que sugere execução induzida por documento, a ser investigada e mitigada com allowlist de aplicações'
        ], 'Editores de documentos raramente deveriam criar shells. A relação pai e filho anormal é um sinal clássico e allowlist e regras de redução de superfície são mitigações.'),
        mcq('q2', 'Qual controle quebra de forma mais efetiva o credential stuffing?', 'b', [
          'Exigir a troca de senha a cada sete dias, com regras de complexidade mais rígidas',
          'MFA combinado com limitação de tentativas e verificação de senhas vazadas',
          'Ocultar a página de login dos mecanismos de busca para que ninguém a encontre',
          'Aumentar o tamanho máximo do campo de usuário para aceitar nomes mais longos'
        ], 'Com MFA, a senha vazada sozinha não basta; limite de tentativas e checagem de vazamentos reduzem o volume. Trocas frequentes e esconder a página não resolvem a reutilização de senhas.'),
        mcq('q3', 'Um servidor web exposto começa a gerar processos filhos de interpretador de comandos. Qual é a primeira hipótese defensiva?', 'c', [
          'Atualização automática normal da aplicação, que dispensa qualquer investigação adicional, sem precisar consultar o histórico de mudanças do servidor',
          'Falha de hardware do servidor, a ser tratada pela equipe de infraestrutura sem acionar a segurança',
          'Possível exploração de falha na aplicação exposta, exigindo isolar, preservar evidências e investigar',
          'Aumento de tráfego legítimo no site, que será resolvido ao aumentar a capacidade'
        ], 'Um servidor web que cria shells é um sinal clássico de comprometimento. A resposta é conter, preservar evidência e investigar.'),
        fill('q4', 'Complete a sigla da lista de componentes de software.', 'SBOM = Software Bill of ___', ['Materials', 'material', 'materials'], 'SBOM é a lista de materiais de software: componentes e dependências usados em um produto.'),
        mcq('q5', 'Qual é a utilidade de um SBOM em um cenário de cadeia de suprimentos?', 'a', [
          'Saber rapidamente se uma biblioteca vulnerável ou comprometida está em uso nos sistemas',
          'Impedir que fornecedores publiquem novas versões de seus produtos e bibliotecas',
          'Criptografar o código-fonte da organização antes de enviá-lo a repositórios públicos',
          'Substituir a necessidade de aplicar atualizações de segurança aos componentes listados, já que o inventário cobre a correção dos itens listados'
        ], 'O SBOM é um inventário que acelera a resposta a componentes comprometidos. Ele não bloqueia fornecedores, não criptografa código e não substitui a correção.'),
        mcq('q6', 'Qual medida reduz o risco de phishing de credenciais mesmo que o usuário caia no golpe e clique?', 'c', [
          'Treinamento anual de uma hora, que elimina a chance de cliques em e-mails suspeitos',
          'Senhas com símbolos obrigatórios, que impedem o uso da senha em páginas falsas',
          'MFA resistente a phishing, como FIDO2 e passkeys, vinculado ao domínio legítimo',
          'Códigos por SMS, porque são enviados a outro canal e não podem ser interceptados na operadora'
        ], 'Chaves FIDO2 e passkeys só respondem ao domínio legítimo, então não funcionam em uma página falsa. Treinamento ajuda, mas não elimina o risco; senhas complexas e SMS podem ser entregues ou interceptados.'),
        mcq('q7', 'Por que reduzir a superfície exposta à internet é uma mitigação de acesso inicial?', 'b', [
          'Porque serviços não expostos dispensam atualizações e monitoramento por ficarem na rede interna',
          'Porque cada serviço exposto é uma possível porta de entrada, e menos serviços significam menos oportunidades e menos itens a manter em dia',
          'Porque a exposição de serviços à internet é proibida pela legislação brasileira',
          'Porque a superfície exposta só importa para ataques de negação de serviço'
        ], 'Menos serviços expostos significam menos portas e menos itens a corrigir. Serviços internos ainda precisam de manutenção e a exposição não é proibida por lei.'),
        fill('q8', 'Complete o nome do ataque.', 'Tentativa automatizada de usar pares usuário e senha vazados em outros sites: credential ___.', ['stuffing'], 'Credential stuffing aproveita a reutilização de senhas entre sites e é mitigado por MFA, limites de taxa e verificação de senhas vazadas.')
      ]
    },
    {
      id: 'csa-08-persistencia-e-escalada-de-privilegios',
      title: 'Persistência e escalada de privilégios',
      goal: 'Reconhecer mecanismos genéricos de persistência e de escalada em Windows, Linux e nuvem, saber onde procurar, como detectar e como prevenir.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'O que o adversário quer aqui',
            'Depois de entrar, o adversário quer duas coisas: PERSISTÊNCIA (continuar com acesso mesmo após reinício, troca de senha ou correção) e ESCALADA DE PRIVILÉGIOS (obter permissões maiores do que as da conta inicial). Para o defensor, ambos deixam marcas em lugares previsíveis: itens de inicialização, agendadores, serviços, chaves de acesso, mudanças de permissão. A defesa consiste em conhecer esses lugares, manter uma linha de base do que é normal e alertar sobre desvios. Descrevemos mecanismos genéricos, não procedimentos ofensivos.'
          ),
          sl(
            'Persistência em Windows: onde procurar',
            'Locais clássicos de persistência: tarefas agendadas, serviços novos ou alterados, chaves de execução automática no registro, pastas de inicialização, assinaturas de eventos de gerenciamento do sistema e contas de usuário criadas. Detecção: comparar esses itens com uma linha de base conhecida, alertar na criação de serviços e tarefas fora de janelas de mudança (os logs do sistema e do Sysmon registram esses eventos) e rever periodicamente itens que iniciam sozinhos. Prevenção: restringir quem pode criar serviços e tarefas, aplicar allowlist e remover privilégios de administrador local.'
          ),
          sl(
            'Persistência em Linux',
            'No Linux os pontos equivalentes são: agendadores (cron e timers do systemd), unidades de serviço, chaves SSH autorizadas em contas de usuário, arquivos de perfil do shell que rodam no login, contas e grupos novos e, em casos avançados, módulos. Detecção: monitoramento de integridade de arquivos (FIM) e regras do auditd sobre esses caminhos, alerta de nova chave SSH e de nova unidade de serviço. Prevenção: contas de serviço sem shell, permissões restritas, gestão de chaves SSH centralizada e imutabilidade de configuração onde possível.'
          ),
          sl(
            'Persistência na nuvem',
            'Na nuvem, a persistência costuma ser por IDENTIDADE: criar novos usuários ou funções (roles), gerar novas chaves de acesso, alterar políticas para abrir permissões, criar funções serverless programadas ou autorizar aplicações de terceiros com acesso permanente via OAuth. Detecção: alertar em criação de chaves e de usuários por identidades que normalmente não fazem isso, mudança de política de IAM e novos consentimentos de aplicações. Prevenção: credenciais temporárias, limites de permissão (guardrails) e revisões periódicas de acessos.'
          ),
          sl(
            'Escalada de privilégios',
            'Escalada local explora configurações fracas: serviços rodando com mais permissão do que precisam, binários com permissões ou bits especiais mal definidos, credenciais deixadas em arquivos e scripts, ou falhas não corrigidas no sistema. Na nuvem e no AD, a escalada passa por permissões: uma identidade que pode alterar políticas ou criar credenciais pode conceder poder a si mesma. Mitigações: menor privilégio, patch, revisão de permissões, ACLs, remoção de binários com privilégio desnecessário, segredos em cofre e separação de contas administrativas.'
          ),
          sl(
            'Detecção contínua e linha de base',
            'A estratégia que fecha o ciclo: (1) inventariar o que inicia sozinho e quem tem poder, (2) registrar o estado normal como linha de base, (3) monitorar mudanças com FIM e com eventos de criação e alteração e (4) investigar o que sai da janela de mudança. Exemplo: um arquivo de chaves SSH autorizadas de uma conta de serviço mudou sem chamado aberto; trate como possível persistência, preserve evidência, compare com a linha de base e revogue a chave não autorizada. Revisões periódicas de privilégios reduzem a superfície que a escalada poderia usar.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual verificação defensiva ajuda a encontrar persistência em um servidor Windows?', 'a', [
          'Comparar tarefas agendadas, serviços e itens de inicialização com uma linha de base conhecida',
          'Verificar o tamanho livre do disco, pois persistência costuma ocupar muito espaço em disco',
          'Reiniciar o servidor diariamente, o que elimina qualquer mecanismo de persistência instalado, ainda que a máquina volte com os mesmos itens de inicialização',
          'Revisar a cor e o tema do ambiente gráfico e o papel de parede, que o invasor costuma alterar'
        ], 'Persistência deixa marcas em agendadores, serviços e itens de inicialização, e a comparação com a linha de base revela as diferenças. Reiniciar não remove persistência e as outras verificações não têm relação.'),
        mcq('q2', 'Na nuvem, qual evento é um sinal de persistência que merece investigação?', 'c', [
          'Leitura de um arquivo de relatório por um analista dentro do horário habitual de trabalho',
          'Atualização de rotina do sistema operacional de uma instância durante a janela de manutenção, registrada normalmente no calendário da equipe de infraestrutura',
          'Criação de uma nova chave de acesso ou função por uma identidade que normalmente não faz isso',
          'Consulta ao painel de custos por parte da equipe de finanças no fechamento do mês'
        ], 'Chaves ou funções novas criadas por identidades fora do padrão permitem acesso futuro e são um sinal clássico. As demais atividades são rotineiras.'),
        mcq('q3', 'Qual mitigação reduz o risco de escalada de privilégios por permissões mal configuradas?', 'b', [
          'Conceder temporariamente permissões de administrador à equipe inteira, para evitar chamados de suporte, retirando depois as permissões quando alguém lembrar',
          'Aplicar menor privilégio e revisar periodicamente permissões, ACLs e binários com privilégio especial',
          'Desativar o registro de eventos para impedir que o invasor veja o que é monitorado',
          'Usar a mesma senha de administrador em todas as máquinas, para facilitar a gestão'
        ], 'Menor privilégio e revisão periódica reduzem as oportunidades de escalada. Dar permissões amplas, desligar logs e repetir senhas aumentam o risco.'),
        fill('q4', 'Complete o princípio de controle de acesso.', 'Princípio de conceder só o acesso necessário: menor ___.', ['privilégio', 'privilegio', 'privilégios'], 'Menor privilégio limita o dano de uma conta comprometida e reduz o espaço para escalada.'),
        mcq('q5', 'O arquivo de chaves SSH autorizadas de uma conta de serviço mudou sem chamado de mudança. Qual é a ação adequada?', 'd', [
          'Ignorar, pois chaves SSH só são alteradas por ferramentas automáticas confiáveis',
          'Excluir toda a pasta da conta de serviço para eliminar qualquer chance de problema',
          'Aguardar a próxima auditoria anual, pois mudanças isoladas não representam risco',
          'Tratar como possível persistência: preservar evidência, comparar com a linha de base e revogar a chave não autorizada'
        ], 'Uma mudança sem chamado em um ponto clássico de persistência merece investigação com preservação de evidência. Apagar tudo destrói provas e ignorar deixa o acesso aberto.'),
        mcq('q6', 'Por que a escalada de privilégios na nuvem frequentemente acontece por meio do IAM?', 'b', [
          'Porque o IAM só funciona em máquinas virtuais com sistema operacional desatualizado, e não oferece registro de eventos de administração',
          'Porque identidades que podem alterar políticas ou criar credenciais conseguem conceder poder a si mesmas',
          'Porque os provedores de nuvem não registram eventos de identidade em log de auditoria',
          'Porque o IAM impede o uso de MFA em contas privilegiadas por limitação técnica'
        ], 'Permissões para modificar políticas ou criar credenciais são, na prática, o poder de se conceder qualquer acesso. As demais afirmações são falsas.'),
        mcq('q7', 'Qual controle torna visíveis rapidamente as mudanças de persistência e de privilégios?', 'd', [
          'Desativar alertas fora do horário comercial para reduzir ruído na fila do SOC',
          'Backup mensal de todo o sistema, que substitui o monitoramento de eventos',
          'Revisão manual feita uma vez por ano, quando houver tempo livre da equipe',
          'Monitoramento de integridade e de eventos de criação de serviço, tarefa e mudança de IAM, alertando fora da janela de mudança'
        ], 'FIM e eventos de criação e alteração com contexto de janela de mudança dão visibilidade rápida. Backups e revisões raras não detectam a tempo.'),
        fill('q8', 'Complete com o termo do controle que compara arquivos críticos com uma linha de base.', 'FIM = monitoramento de ___ de arquivos (File Integrity Monitoring).', ['integridade', 'integrity'], 'O FIM compara o estado atual de arquivos críticos com uma linha de base e alerta sobre alterações, sendo base para detectar persistência.')
      ]
    },
    {
      id: 'csa-09-credenciais-e-movimento-lateral',
      title: 'Credenciais e movimento lateral',
      goal: 'Entender como credenciais válidas são obtidas e usadas, como o movimento lateral acontece e como segmentação, tiering, senhas de administrador local rotacionadas e MFA quebram a cadeia.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Por que credenciais são o alvo preferido',
            'Usar uma conta válida é mais silencioso do que explorar uma falha: o tráfego e os logons parecem atividade normal. Por isso, para o adversário, credenciais valem mais do que malware. Para o defensor, o desafio é distinguir uso legítimo de abuso, o que exige contexto (quem, de onde, em quais máquinas, em qual horário) e comportamento. Detecção baseada só em assinaturas funciona mal aqui; análise de comportamento de identidade e proteção das credenciais funcionam melhor.'
          ),
          sl(
            'Como credenciais são obtidas (conceito)',
            'Fontes conceituais: senhas digitadas em páginas falsas (phishing), segredos esquecidos em arquivos, scripts e repositórios, credenciais guardadas por navegadores, material de autenticação residente na memória de processos do sistema, e tokens ou cookies de sessão. Há ainda o reuso de hashes: em protocolos legados, o hash da senha, sozinho, funciona como se fosse a senha, o que permite autenticar sem conhecê-la. Mitigações: MFA resistente a phishing, proteções do sistema que isolam credenciais na memória, não guardar segredos em texto, tokens com vida curta e rotação.'
          ),
          sl(
            'Movimento lateral',
            'Movimento lateral é o uso de contas e acessos para ir de uma máquina a outra, por serviços legítimos de administração remota (compartilhamentos de arquivos, acesso remoto de área de trabalho, SSH e execução remota). O objetivo é chegar a sistemas de maior valor, como servidores de arquivos, bancos de dados e controladores de domínio. Sinais: uma estação que faz logon de rede em muitos servidores em poucos minutos (fan-out), contas administrativas aparecendo em máquinas onde nunca estiveram, logons fora do horário usual do usuário e uso de ferramentas administrativas por quem não as usa.'
          ),
          sl(
            'Quebrando a cadeia: arquitetura',
            'Quatro controles estruturais: (1) segmentação: estações não precisam falar entre si por SMB ou acesso remoto, então bloqueie esse tráfego e libere só de hosts de administração; (2) tiering administrativo: separar contas e máquinas por nível de privilégio, de modo que credenciais de alto nível (administrador de domínio) nunca sejam usadas em sistemas menos protegidos; (3) senha de administrador local única por máquina e rotacionada automaticamente, no estilo LAPS (Local Administrator Password Solution), para que roubar uma não abra todas; (4) MFA nos acessos administrativos.'
          ),
          sl(
            'Detecção e honeytokens',
            'Boas detecções: mapa de logons por conta (quem entra onde), alerta de fan-out, viagem impossível (logons de locais distantes em intervalo curto), conta privilegiada em estação comum e uso de protocolos de administração entre estações. Uma técnica de alta confiança é o honeytoken: conta ou segredo isca, sem uso legítimo, de modo que qualquer uso gera alerta com poucos falsos positivos. Exemplo: um usuário falso, com nome atraente, que ninguém usa; qualquer tentativa de logon é suspeita por definição.'
          ),
          sl(
            'Resposta',
            'Ao suspeitar de uso indevido de credenciais: redefinir a senha e invalidar sessões e tokens ativos (apenas trocar a senha pode não derrubar sessões já emitidas), isolar a máquina de origem, revisar as máquinas acessadas pela conta, verificar mudanças de MFA e de regras de e-mail, e procurar outras contas que compartilhem o segredo. Se a conta era privilegiada, assuma que tudo que ela alcançava pode estar afetado e amplie a investigação conforme o tiering. Documente para melhorar as detecções.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que o uso de contas válidas é difícil de detectar?', 'b', [
          'Porque contas válidas não geram evento de log nos sistemas de produção, o que impede a correlação com outros registros',
          'Porque o tráfego e os logons se parecem com atividade legítima, exigindo contexto e análise de comportamento',
          'Porque só existe detecção por assinatura de malware, que não se aplica a contas',
          'Porque o SIEM não consegue armazenar eventos de autenticação, por limitação técnica'
        ], 'O uso de contas válidas se mistura ao tráfego normal e exige análise de contexto e comportamento. Os eventos existem e são coletáveis.'),
        mcq('q2', 'Qual medida reduz o impacto do roubo da senha de administrador local de uma estação?', 'd', [
          'Usar a mesma senha de administrador local em todas as estações, para simplificar o suporte',
          'Escrever a senha em um adesivo no equipamento, para que o suporte técnico a encontre',
          'Desativar o bloqueio de conta, para que o administrador não fique impedido de entrar em manutenção',
          'Senha única por máquina e rotacionada automaticamente, no estilo LAPS'
        ], 'Com senhas únicas e rotacionadas, o roubo de uma não permite entrar nas demais. Repetir ou anotar senhas e desligar o bloqueio aumentam o risco.'),
        mcq('q3', 'O que é tiering administrativo?', 'a', [
          'Separar contas e sistemas por nível de privilégio, para que credenciais de alto nível não sejam expostas em sistemas menos protegidos',
          'Dividir os usuários em grupos de acordo com o setor da empresa, para organizar a lista telefônica',
          'Classificar os incidentes em níveis de severidade para decidir a prioridade da fila do SOC',
          'Reduzir o número de contas administrativas a uma só, compartilhada entre toda a equipe de TI'
        ], 'O tiering evita que a credencial de administrador de domínio seja usada em estações comuns, onde poderia ser roubada. Não é organização de setores nem de severidade, e compartilhar conta administrativa é um erro.'),
        fill('q4', 'Complete com a sigla da solução de senhas de administrador local.', 'Senhas de admin local únicas e rotacionadas: solução do tipo ___ (Local Administrator Password Solution).', ['LAPS', 'laps'], 'LAPS gera e rotaciona senhas únicas de administrador local, impedindo que uma senha roubada abra todas as máquinas.'),
        mcq('q5', 'Uma estação de trabalho faz logon de rede em dezenas de servidores em poucos minutos. Qual é a interpretação?', 'c', [
          'Rotina de backup noturno, que acessa os servidores a partir de uma estação comum',
          'Atualização automática do sistema operacional, que contata os servidores um a um, iniciada por uma estação comum em horário de expediente',
          'Padrão de fan-out compatível com movimento lateral, que justifica investigar e conter conta e máquina',
          'Falha do relógio da estação, que gera logons duplicados nos servidores acessados'
        ], 'Uma estação que faz logon em muitos servidores rapidamente é um padrão típico de movimento lateral e merece investigação. Backups e atualizações têm origem em servidores de gestão, não em estações comuns.'),
        mcq('q6', 'Qual medida de rede dificulta o movimento lateral entre estações?', 'd', [
          'Permitir SMB e acesso remoto livres entre todas as estações, para facilitar o suporte',
          'Desativar o log de autenticação dos servidores, para reduzir a carga de armazenamento',
          'Usar a mesma conta de serviço em cada servidor, para evitar divergência de configuração, mantendo uma única senha compartilhada entre as equipes',
          'Segmentação que bloqueia SMB e acesso remoto entre estações, liberando apenas hosts de administração'
        ], 'Estações raramente precisam falar entre si; bloquear esse tráfego e liberar só hosts de administração corta rotas laterais. As demais opções ampliam o risco.'),
        mcq('q7', 'Para que serve um honeytoken de credencial?', 'a', [
          'Para criar uma conta ou segredo isca sem uso legítimo; qualquer uso gera alerta de alta confiança',
          'Para guardar as senhas verdadeiras dos administradores de forma criptografada e segura, com rotação automática e gravação das sessões administrativas',
          'Para aumentar o desempenho do servidor de autenticação em horários de pico de uso',
          'Para substituir o MFA em contas privilegiadas por uma verificação mais simples'
        ], 'O honeytoken é uma isca: como não há uso legítimo, qualquer uso é suspeito. Não é cofre de senhas, nem otimização, nem substituto do MFA.'),
        fill('q8', 'Complete o nome da tática.', 'O uso de acessos e contas para ir de uma máquina a outra chama-se movimento ___.', ['lateral'], 'Movimento lateral é como o adversário avança entre sistemas usando contas e serviços de administração.')
      ]
    },
    {
      id: 'csa-10-evasao-de-defesas-defensivo',
      title: 'Evasão de defesas pela ótica do defensor',
      goal: 'Entender, em conceito, como adversários tentam não ser vistos e que sinais permanecem, protegendo a integridade da telemetria.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'O objetivo do adversário: não ser visto',
            'Evasão de defesas reúne técnicas para evitar detecção: usar ferramentas legítimas, esconder ou apagar rastros, enfraquecer controles de segurança e disfarçar código. O ponto de vista aqui é defensivo: não detalhamos como contornar produtos específicos. Entendemos o conceito para responder a duas perguntas: que sinais ainda permanecem quando alguém tenta se esconder? E como garantir que a telemetria em que confiamos não possa ser silenciada com facilidade?'
          ),
          sl(
            'Living off the land',
            'Living off the land (LotL, "viver da terra") é usar ferramentas já presentes no sistema (utilitários de administração, interpretadores de script, binários assinados) em vez de trazer programas novos. Funciona porque essas ferramentas são confiáveis, não criam arquivos suspeitos e se misturam à administração. Sinais: uso de ferramenta administrativa por usuário ou servidor que normalmente não a usa, relação de processo pai incomum, linhas de comando longas ou raras e acessos à rede feitos por utilitários que não deveriam. Mitigações: allowlist de aplicações, remover ferramentas dispensáveis, registro de linha de comando e baselines de uso.'
          ),
          sl(
            'Enfraquecer e apagar telemetria',
            'Adversários podem tentar desabilitar a auditoria, limpar logs de eventos ou parar agentes de segurança. Os próprios atos deixam sinais: evento de limpeza de log, alteração de política de auditoria, serviço de agente parado e, principalmente, SILÊNCIO: um host que reportava milhares de eventos por hora e passa a reportar zero. Mitigações: encaminhar logs quase em tempo real para um coletor remoto, proteger o agente contra desligamento, e criar alertas de silêncio (heartbeat) para máquinas que deixam de reportar.'
          ),
          sl(
            'Ofuscação e empacotamento',
            'Ofuscar é embaralhar um script ou binário para dificultar a leitura e escapar de assinaturas simples: textos codificados, código dividido em pedaços, empacotadores. Sinais: alta entropia (aparência de dados aleatórios), blocos longos codificados em scripts, processos que decodificam e executam conteúdo em memória. Mitigações: registro de blocos de script (script block logging) e interfaces como o AMSI, que expõem o conteúdo no momento em que é interpretado, já desembaralhado, e detecção por comportamento em vez de só por assinatura.'
          ),
          sl(
            'Integridade da telemetria',
            'Para que a detecção seja confiável, o dado precisa ser confiável. Práticas: envio quase imediato dos logs a um destino que o host comprometido não consegue alterar, armazenamento imutável (WORM, que só permite gravar uma vez), relógios sincronizados (NTP), inventário de cobertura (quais hosts deveriam ter agente e reportar), verificação periódica de que as detecções ainda funcionam e alerta de queda de volume. Sem essa camada, o atacante mais cuidadoso pode simplesmente apagar a prova.'
          ),
          sl(
            'Nenhuma evasão é perfeita',
            'Toda tentativa de se esconder deixa efeitos em algum lugar: no tráfego de rede, nas consultas DNS, nos logs de identidade, nas trilhas de auditoria da nuvem, no comportamento do processo. Por isso a defesa em profundidade da telemetria funciona: correlacionar várias fontes independentes recupera a visibilidade perdida em uma. Um host mudo no endpoint ainda aparece nos logs de rede e de autenticação. Evite a falsa sensação de segurança de depender de uma única fonte.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que o uso de ferramentas legítimas do sistema (living off the land) é atraente para o adversário?', 'c', [
          'Porque essas ferramentas são desativadas em sistemas modernos e, portanto, ninguém as monitora',
          'Porque elas são mais rápidas do que qualquer outro software de administração disponível',
          'Porque são confiáveis, não criam arquivos suspeitos e se misturam à administração normal',
          'Porque seu uso é invisível para qualquer tipo de log, inclusive o de linha de comando'
        ], 'Ferramentas nativas são confiáveis e comuns, o que dificulta a detecção por assinatura de arquivos. Elas não são invisíveis: o uso incomum aparece em registros de processo e de linha de comando.'),
        mcq('q2', 'Um servidor que reportava milhares de eventos por hora passa a reportar zero. Qual é a primeira hipótese defensiva?', 'a', [
          'Possível desativação do agente ou da auditoria, ou falha de coleta, tratada como alerta de silêncio',
          'O servidor ficou mais seguro e não gera mais eventos relevantes',
          'Redução temporária de uso, que não exige acompanhamento da equipe',
          'Erro do painel do SIEM, que deve ser reiniciado para exibir os números corretos, já que o histórico do servidor continua intacto'
        ], 'Silêncio abrupto é um sinal clássico de adulteração ou falha e merece investigação. Presumir que o servidor ficou seguro ou que o painel errou é perigoso.'),
        mcq('q3', 'Qual controle protege os logs contra apagamento em um host comprometido?', 'd', [
          'Guardar os logs no disco local com rotação diária, que é a opção mais rápida de consultar',
          'Aumentar o tamanho máximo do arquivo de log do host e limpar manualmente a cada semana',
          'Pedir aos usuários que não apaguem os logs do computador e treiná-los para isso',
          'Encaminhamento quase em tempo real para um coletor remoto com armazenamento imutável'
        ], 'Se os logs já saíram do host para um destino imutável, apagar o local não elimina a prova. Logs só locais ficam sob controle do invasor.'),
        fill('q4', 'Complete o termo.', 'Usar ferramentas legítimas do sistema em vez de trazer programas novos: living off the ___.', ['land'], 'Living off the land é o uso de ferramentas nativas e confiáveis, o que exige detecção por comportamento e contexto.'),
        mcq('q5', 'Como o registro de blocos de script ajuda contra ofuscação?', 'b', [
          'Impede que scripts sejam executados em qualquer circunstância no equipamento',
          'Registra o código no momento em que é processado, o que muitas vezes expõe a versão desembaralhada',
          'Criptografa os scripts para que o invasor não consiga lê-los durante a execução, substituindo a necessidade de qualquer outro tipo de registro',
          'Apaga automaticamente os scripts suspeitos para que não possam ser analisados'
        ], 'O registro captura o conteúdo no momento em que o interpretador o processa, com frequência já decodificado. Ele não bloqueia, criptografa nem apaga scripts.'),
        mcq('q6', 'Qual é a conclusão correta sobre técnicas de evasão?', 'a', [
          'Reduzem sinais, mas dificilmente eliminam todos; correlacionar rede, identidade e endpoint recupera visibilidade',
          'Tornam o atacante totalmente invisível, e a detecção passa a depender só de sorte',
          'Só funcionam contra defesas antigas e são inúteis contra qualquer solução atual',
          'Só afetam o endpoint, de modo que a telemetria de rede e de identidade é irrelevante, porque o adversário apaga também esses registros'
        ], 'A evasão raramente apaga todos os rastros, e fontes independentes se complementam. Não existe invisibilidade total nem evasão restrita ao endpoint.'),
        mcq('q7', 'Qual é um indicador de uso suspeito de uma ferramenta administrativa legítima?', 'c', [
          'Uso por um administrador de sistemas durante uma janela de mudança aprovada',
          'Execução automática pelo agendador de manutenção, seguindo o calendário definido pela TI',
          'Uso em um usuário ou servidor que normalmente não a utiliza, com processo pai incomum',
          'Execução da ferramenta por um técnico com um chamado aberto e registrado'
        ], 'O sinal é o desvio do padrão: ferramenta usada por quem não costuma usá-la, com pai incomum. As demais situações têm contexto legítimo e registrado.'),
        fill('q8', 'Complete o tipo de alerta.', 'Alerta disparado quando um agente deixa de enviar eventos: alerta de ___.', ['silêncio', 'silencio', 'heartbeat'], 'O alerta de silêncio (ou heartbeat) detecta quando uma fonte deixa de reportar, o que pode indicar falha ou adulteração.')
      ]
    },
    {
      id: 'csa-11-c2-exfiltracao-e-impacto',
      title: 'C2, exfiltração e impacto',
      goal: 'Reconhecer em conceito comando e controle, exfiltração e impacto, detectar por tráfego e DNS, aplicar DLP e backups e preparar planos de contenção.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Comando e controle (C2)',
            'C2 (command and control) é o canal pelo qual o adversário comunica com sistemas comprometidos para enviar instruções e receber resultados. Para se misturar ao tráfego normal, costuma usar protocolos comuns como HTTPS e DNS. Uma característica marcante é o beaconing: o sistema comprometido "liga para casa" em intervalos periódicos. Para o defensor, o C2 é uma fraqueza do adversário: ele precisa se comunicar, e comunicação deixa rastros em rede, proxy e DNS.'
          ),
          sl(
            'Detecção de C2 por tráfego e DNS',
            'Indicadores conceituais: conexões periódicas e regulares do mesmo host ao mesmo destino com pouca variação de intervalo (baixo jitter), domínios muito novos ou raros, volumes pequenos e constantes, certificados incomuns e consultas DNS com subdomínios longos e de aparência aleatória (alta entropia) para um mesmo domínio, o que pode indicar túnel DNS. Mitigações: filtragem de saída (egress filtering, permitindo só destinos necessários), proxy com categorização, DNS filtrado e logs de DNS centralizados. Cuidado: atualizações de software também são periódicas, então enriqueça com contexto para evitar falsos positivos.'
          ),
          sl(
            'Exfiltração',
            'Exfiltração é a saída não autorizada de dados. Pode usar o mesmo canal de C2, serviços de nuvem pessoais, e-mail ou outros canais, muitas vezes em lotes, compactados ou criptografados, para chamar menos atenção. Sinais: volume de saída fora do normal para o host, destinos novos, uploads para serviços de armazenamento não corporativos, atividade fora do horário. Mitigações: DLP (Data Loss Prevention, que inspeciona e bloqueia a saída de dados sensíveis), classificação de dados, controles de saída, CASB para uso de nuvem e alertas de volume. A LGPD torna isto crítico quando há dados pessoais.'
          ),
          sl(
            'Impacto',
            'Impacto é o dano final: criptografia de dados para extorsão (ransomware), destruição de dados, indisponibilidade e vazamento com extorsão. Sinais iniciais: modificação em massa de arquivos em curto tempo, remoção de cópias de sombra e de backups, paradas de serviços de proteção. Mitigações: backups imutáveis ou desconectados, com restauração TESTADA (a regra 3-2-1: três cópias, em duas mídias, uma fora do local), segmentação, menor privilégio e detecção precoce das etapas anteriores, pois ao chegar aqui o dano já é grande.'
          ),
          sl(
            'Planos de contenção',
            'Contenção deve estar planejada antes do incidente: isolar hosts da rede (preferindo isolar a desligar, para preservar a memória), bloquear domínios e IPs de C2, revogar credenciais e sessões, suspender contas, conter a saída de dados e acionar o plano de crise. Envolva cedo o jurídico e o encarregado de dados (DPO): incidentes com dados pessoais têm obrigações de comunicação previstas na LGPD, que variam conforme o caso e não substituem orientação jurídica. Documente decisões e horários para a análise posterior.'
          ),
          sl(
            'Erros comuns',
            'Confiar apenas em listas de bloqueio de IPs (o adversário troca de infraestrutura com facilidade); não registrar DNS e proxy, o que impede detectar C2; manter backups acessíveis com as mesmas credenciais do ambiente, o que permite criptografá-los junto; nunca testar a restauração; e desligar o servidor afetado antes de coletar a memória. Detecção de comportamento (periodicidade, volumes, destinos raros) tem durabilidade maior do que listas de indicadores.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual característica de tráfego é indicativa de beaconing?', 'd', [
          'Um grande volume de dados trafegando uma vez por mês, em horário comercial, caracterizando um padrão sem regularidade de intervalo',
          'Conexões ocasionais e totalmente aleatórias de diversos hosts a destinos variados',
          'Consultas de DNS exclusivamente para domínios muito populares e conhecidos',
          'Conexões periódicas e regulares do mesmo host ao mesmo destino, com pouca variação de intervalo'
        ], 'Beaconing é a comunicação periódica do host comprometido com o C2, o que produz um padrão regular. Tráfego aleatório ou para domínios populares não tem essa assinatura.'),
        mcq('q2', 'Qual controle limita a exfiltração mesmo que o invasor já tenha credenciais válidas?', 'b', [
          'Exigir senhas mais longas para os usuários que têm acesso aos dados sensíveis',
          'Filtragem de saída (egress) com proxy e DLP, permitindo só os destinos necessários',
          'Desligar o registro de DNS, para reduzir o volume de dados armazenados no SIEM, já que a análise de saída seria feita de forma manual',
          'Instalar mais câmeras nos data centers para vigiar o acesso físico ao hardware'
        ], 'Controlar a saída e inspecionar dados limita a exfiltração independentemente de credenciais. Senhas e câmeras não atuam sobre o canal de saída.'),
        mcq('q3', 'Um servidor de arquivos tem milhares de arquivos modificados em minutos e as cópias de sombra foram removidas. Qual é a interpretação?', 'c', [
          'Rotina de limpeza noturna, que dispensa qualquer ação da equipe de segurança',
          'Efeito normal de uma atualização do sistema operacional, que reescreve os arquivos de dados, realizada pelo gerenciador de atualizações da equipe de TI',
          'Sinais compatíveis com impacto por criptografia em massa, exigindo isolar o host e preservar evidências',
          'Aumento de uso por parte dos usuários, que será resolvido ao ampliar o armazenamento'
        ], 'Modificação em massa mais remoção de cópias de sombra é padrão típico de ransomware. A resposta é isolar o host, preservar evidências e acionar o plano de crise.'),
        fill('q4', 'Complete o termo.', 'Conexões periódicas de um host comprometido a um servidor de comando e controle: ___.', ['beaconing', 'beacon'], 'Beaconing é o padrão de comunicação periódica do sistema comprometido com o C2.'),
        mcq('q5', 'Qual característica torna um backup útil contra um ataque de impacto destrutivo?', 'a', [
          'Ser imutável ou desconectado e ter restauração testada',
          'Ficar em uma pasta compartilhada que os servidores acessam com a mesma conta de domínio',
          'Ser executado semanalmente no mesmo servidor onde ficam os dados originais',
          'Ser armazenado sem criptografia e sem controle de acesso, para facilitar a restauração rápida'
        ], 'Backups acessíveis com as credenciais do ambiente podem ser criptografados junto. Imutabilidade ou isolamento e testes de restauração garantem a recuperação.'),
        mcq('q6', 'Por que consultas DNS com subdomínios longos e aleatórios para um mesmo domínio merecem análise?', 'c', [
          'Porque o DNS não admite subdomínios longos, o que indica erro de digitação do usuário',
          'Porque o volume de consultas DNS não tem relação com atividade maliciosa, só com a carga do resolvedor',
          'Porque podem carregar dados ou comandos em um túnel que usa o DNS como canal',
          'Porque só ocorrem em redes sem firewall, o que dispensa investigar nas demais redes'
        ], 'Túnel DNS codifica informação em nomes consultados, gerando subdomínios longos e de alta entropia. Esse padrão justifica investigar.'),
        mcq('q7', 'Um servidor parece estar enviando dados para fora. O que priorizar antes de desligá-lo?', 'b', [
          'Desligar imediatamente, pois é a única forma de interromper a comunicação',
          'Conter a comunicação (isolar da rede) e preservar a memória e os logs',
          'Reiniciar o servidor para limpar o estado e ver se o problema desaparece',
          'Aguardar 24 horas para observar o comportamento, sem qualquer medida de contenção'
        ], 'Isolar da rede interrompe a saída preservando as evidências voláteis. Desligar ou reiniciar destrói a memória, e aguardar mantém o vazamento.'),
        fill('q8', 'Complete a sigla da tecnologia que inspeciona e bloqueia a saída de dados sensíveis.', 'DLP = Data Loss ___', ['Prevention', 'prevenção', 'prevencao'], 'DLP (Data Loss Prevention) identifica e bloqueia a saída indevida de dados sensíveis.')
      ]
    },
    {
      id: 'csa-41-deteccao-de-fraude-e-abuso',
      title: 'Detecção de fraude e abuso',
      goal: 'Distinguir fraude de ataque técnico, usar sinais de risco, comparar regras e modelos, entender tokenização e autenticação de pagamentos, tratar tomada de contas e abuso de promoções, equilibrar fricção e proteção e respeitar a privacidade.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Fraude x ataque técnico',
            'Um ataque técnico explora uma falha de sistema: uma vulnerabilidade, uma configuração errada, um malware. A fraude explora o processo de negócio e a confiança: alguém usa uma conta legítima, um cadastro verdadeiro ou o fluxo normal de compra para obter vantagem indevida. Exemplo: comprar com um cartão que não é seu usando a tela de pagamento normal não exige quebrar nenhuma defesa técnica, e por isso um scanner de vulnerabilidades não encontra nada. As duas coisas se misturam: o roubo de credenciais (técnico) alimenta a tomada de conta e a compra fraudulenta (fraude). Por isso as equipes de segurança, de prevenção à fraude e de produto precisam trabalhar juntas, com dados em comum.'
          ),
          sl(
            'Sinais de risco',
            'Detectar fraude é combinar sinais fracos em uma estimativa de risco. Famílias de sinais: velocidade (muitas tentativas de login, de compra ou de cadastro em pouco tempo); dispositivo (um aparelho novo, um navegador com características incomuns, vários cadastros no mesmo aparelho); geografia (um acesso de local distante pouco tempo depois de outro, a chamada viagem impossível); comportamento (ritmo de digitação, forma de navegar, valor e tipo de compra fora do padrão do cliente); relacionamento (contas ligadas pelo mesmo dispositivo, endereço ou meio de pagamento). Erro comum: tratar um sinal isolado como prova. Quem usa VPN ou viaja não é, por isso, fraudador. O valor está na combinação e no histórico do próprio usuário.',
            'login novo + dispositivo nunca visto + pais diferente + troca de e-mail em 2 min\n=> risco alto (combinacao), nao um sinal isolado'
          ),
          sl(
            'Regras x aprendizado de máquina',
            'Modelos baseados em regras são condições escritas por pessoas (por exemplo, bloquear mais de N tentativas em um minuto). Vantagens: transparentes, rápidos de criar e fáceis de explicar a um cliente ou auditor. Limites: viram uma lista enorme, geram falsos positivos e o adversário aprende os limiares. Modelos de aprendizado de máquina supervisionado aprendem padrões a partir de casos rotulados como fraude ou legítimos. Vantagens: capturam combinações que regras não captam. Limites: os rótulos chegam tarde (a fraude só é confirmada dias depois), os casos de fraude são raros (classes desbalanceadas), o comportamento muda (deriva do modelo) e a explicação é mais difícil. Modelos não supervisionados procuram anomalias sem rótulo. Na prática, usa-se um sistema híbrido: regras para o que é claro e bem conhecido, modelos para o resto e revisão humana para os casos limítrofes. Falso positivo é bloquear um cliente honesto; falso negativo é deixar a fraude passar, e os dois têm custo.'
          ),
          sl(
            'Tokenização e autenticação de pagamentos',
            'Tokenização troca o número real do cartão por um token, um substituto sem valor fora do contexto em que foi emitido (um comerciante ou dispositivo específico). Se a base do comerciante vazar, os tokens roubados são de pouca utilidade, e o escopo de conformidade do padrão de segurança de dados de cartões (PCI DSS, tratado aqui só em visão geral) diminui. Em pagamentos com cartão, muitas transações geram também um código único por operação, o que torna inútil reaproveitar dados capturados. Autenticação do portador: em compras online existe um protocolo em que o emissor pode pedir uma verificação extra do cliente (como o 3-D Secure), de preferência baseada em risco, para que transações comuns passem sem atrito e as suspeitas sejam desafiadas. Armazenar o número completo do cartão e o código de segurança é um erro grave; o ideal é nem tocar nesses dados, usando o provedor de pagamento.'
          ),
          sl(
            'Tomada de contas e abuso de promoções',
            'Tomada de conta (account takeover, ATO): o criminoso entra na conta de outra pessoa, em geral testando pares de usuário e senha vazados de outros serviços (credential stuffing), aproveitando o reuso de senhas. Sinais: muitos logins falhos vindos de poucos dispositivos, logins bem-sucedidos seguidos de troca imediata de e-mail, senha ou endereço de entrega. Defesas: MFA, limite de tentativas, checagem de senhas conhecidas por terem vazado, alerta ao usuário de novo dispositivo e confirmação extra em ações sensíveis. Abuso de promoções: criar várias contas para usar repetidas vezes um cupom de primeira compra ou bônus de indicação. Defesas: limites por pessoa, dispositivo e meio de pagamento, análise de grafo de contas relacionadas, liberação do benefício após um período de maturação e regras de elegibilidade claras. O foco é desenhar a promoção sabendo que será testada.'
          ),
          sl(
            'Fricção x proteção',
            'Todo controle de fraude tem um custo no usuário honesto: mais telas, mais códigos, mais tempo. Se a fricção for alta, as vendas caem e as pessoas procuram atalhos inseguros. Se for baixa, as perdas sobem. O objetivo é otimizar, não maximizar a proteção. A autenticação adaptativa aplica o desafio proporcional ao risco: risco baixo, nenhum atrito; risco médio, pedir um segundo fator; risco alto, bloquear e encaminhar à revisão. Métricas úteis: taxa de aprovação de clientes legítimos, perda financeira por fraude, taxa de falso positivo, tempo de revisão e abandono do carrinho. Revise as regras com frequência, e meça o efeito de cada mudança em vez de acumular bloqueios por medo.'
          ),
          sl(
            'Privacidade e LGPD em perfis comportamentais',
            'Perfis de comportamento (dispositivo, localização, hábitos de uso) são dados pessoais e, combinados, revelam muito sobre uma pessoa. A LGPD (Lei 13.709/2018) pede, em visão geral: finalidade específica e legítima, necessidade (coletar o mínimo), transparência sobre o uso, segurança e prazo de retenção definido. A prevenção à fraude e a segurança do titular são finalidades reconhecidas, mas a base legal aplicável deve ser avaliada com o jurídico e documentada. Quando decisões automatizadas afetam o titular (bloquear uma conta, negar uma compra), ele pode pedir informações sobre os critérios e a revisão da decisão, então mantenha a possibilidade de revisão humana e canal de contestação. Evite usar sinais sensíveis ou que possam gerar discriminação. Este material é educacional e não substitui orientação jurídica.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um cliente compra com um cartão que não é seu, usando o fluxo normal de pagamento do site, e nenhum scanner de vulnerabilidades acusa problema. Como classificar o caso?', 'b', [
          'Ataque técnico, porque toda perda financeira vem da exploração de uma falha do site',
          'Fraude: explora o processo de negócio, sem depender de falha técnica',
          'Falso positivo do scanner, porque a compra foi concluída com sucesso',
          'Incidente de disponibilidade, já que o site continuou funcionando normalmente'
        ], 'Fraude explora o fluxo legítimo do negócio. O scanner não vê falha porque não há falha técnica; compra concluída ou site no ar não dizem nada sobre a natureza do caso.'),
        mcq('q2', 'Um usuário viaja e acessa a conta de um país diferente, de um aparelho novo, usando VPN. O que a equipe de fraude deve fazer?', 'd', [
          'Bloquear a conta imediatamente, pois a VPN por si só comprova fraude',
          'Ignorar o evento, porque viagens e VPN são comportamento legítimo e dispensam análise',
          'Apagar o histórico do usuário, para que o modelo não aprenda com o caso',
          'Combinar os sinais com o histórico do usuário e aplicar um desafio proporcional ao risco, como um segundo fator'
        ], 'Um sinal isolado não prova nada; a combinação com o histórico decide, e um desafio graduado protege sem bloquear o cliente honesto. Bloquear ou ignorar sem análise erra para um dos lados.'),
        mcq('q3', 'Qual é uma limitação típica dos modelos supervisionados de detecção de fraude?', 'a', [
          'Os rótulos chegam com atraso e os casos de fraude são raros em relação ao total',
          'Exigem que todas as transações sejam revisadas manualmente antes do treinamento',
          'Só funcionam para fraude com cartão, sem aplicação em tomada de contas ou abuso de promoções',
          'Produzem explicações simples demais, o que dificulta o uso por analistas'
        ], 'A confirmação da fraude demora e as classes são desbalanceadas. Não é necessário revisar tudo manualmente, os modelos servem a vários cenários, e o problema costuma ser a dificuldade de explicação, não o excesso dela.'),
        fill('q4', 'Complete o nome do ataque em que pares de usuário e senha vazados de outros serviços são testados em massa.', 'Teste em massa de credenciais vazadas, aproveitando o reuso de senhas: credential ___.', ['stuffing'], 'Credential stuffing testa credenciais vazadas em outros serviços, e funciona por causa do reuso de senhas. MFA e limites de tentativa ajudam a mitigar.'),
        mcq('q5', 'Por que a tokenização reduz o impacto de um vazamento na base de um comerciante?', 'c', [
          'Porque os dados do cartão são apagados automaticamente após cada compra, impedindo qualquer consulta',
          'Porque o token impede que o titular consiga contestar a cobrança indevida',
          'O token roubado vale pouco fora do contexto onde foi emitido, ao contrário do número real',
          'Porque o token cifra a conexão entre o site e o navegador do cliente'
        ], 'O token substitui o número real e só serve em contexto restrito, então o vazamento rende pouco ao criminoso. Ele não apaga dados, não afeta contestações e não é um protocolo de cifra de conexão.'),
        mcq('q6', 'Uma promoção de primeira compra está sendo usada centenas de vezes por contas ligadas ao mesmo dispositivo e ao mesmo meio de pagamento. Qual defesa se adequa?', 'd', [
          'Encerrar a promoção em definitivo e proibir novas campanhas de marketing',
          'Aumentar o valor do bônus, para atrair mais clientes honestos e diluir o abuso',
          'Exigir que o cliente informe o CPF de outras pessoas da família, para verificar parentesco',
          'Limitar o benefício por pessoa, dispositivo e meio de pagamento e analisar contas ligadas'
        ], 'O abuso é de múltiplas contas ligadas, então limites por identidade e dispositivo e análise de relacionamento são o remédio direto. Encerrar tudo, aumentar o bônus ou coletar dados de terceiros é desproporcional ou piora o problema.'),
        mcq('q7', 'Um banco bloqueia contas de forma automática com base em um perfil comportamental. Qual prática é coerente com a LGPD em visão geral?', 'b', [
          'Manter os dados comportamentais por prazo indeterminado, pois podem ser úteis em análises futuras',
          'Definir finalidade e retenção, informar o uso e oferecer revisão humana e contestação',
          'Dispensar qualquer informação ao cliente, já que a decisão é tomada por um sistema automatizado',
          'Usar dados sensíveis, como saúde, para refinar o perfil, e assim melhorar o modelo'
        ], 'Finalidade, retenção definida, transparência e possibilidade de revisão são pilares da boa prática. Guardar para sempre, não informar e usar dados sensíveis sem necessidade contrariam os princípios.'),
        fill('q8', 'Complete o termo para a troca do número real do cartão por um substituto sem valor fora de contexto.', 'Troca do número do cartão por um substituto seguro: ___ de pagamento.', ['tokenização', 'tokenizacao', 'tokenization'], 'A tokenização reduz o valor dos dados roubados e o escopo de conformidade do comerciante.')
      ]
    },
    {
      id: 'csa-12-ataques-ao-active-directory-e-defesa',
      title: 'Ataques ao Active Directory e defesa',
      goal: 'Entender em conceito os abusos de Kerberos, delegação e replicação, revisar a exposição do AD de forma autorizada e reforçar monitoramento e configuração.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'O AD como alvo de maior valor',
            'O Active Directory (AD) concentra a identidade da maioria das empresas Windows: contas, grupos, políticas e a autenticação de tudo. Quem controla o AD controla o ambiente, então ele é o alvo estratégico em muitos incidentes graves. Relembrando: o domínio é a fronteira administrativa, os controladores de domínio (DC) guardam a base de contas e o Kerberos é o protocolo de autenticação baseado em tickets. As técnicas a seguir são descritas só em CONCEITO, com foco no que defender e no que monitorar.'
          ),
          sl(
            'Kerberos: abusos em conceito',
            'No Kerberos, após autenticar, o usuário recebe um TGT (ticket de concessão) e depois tickets de serviço. Abusos conceituais: (1) contas de serviço com senha fraca podem ter seu ticket de serviço solicitado por qualquer usuário autenticado e a senha atacada OFFLINE, sem falhas de login visíveis; mitigar com senhas longas e contas gerenciadas (gMSA, group Managed Service Account, que têm senha automática longa); (2) contas sem pré-autenticação expõem material atacável; (3) se a chave da conta krbtgt for roubada, tickets falsos podem ser forjados; mitigar protegendo os DCs e rotacionando a senha da krbtgt (duas vezes, com intervalo) após comprometimento.'
          ),
          sl(
            'Delegação e replicação',
            'Delegação permite que um serviço atue em nome do usuário em outros serviços. Na delegação IRRESTRITA, o servidor guarda os tickets dos usuários que se conectam; se for comprometido, o adversário reutiliza essas identidades, inclusive privilegiadas. Mitigar: evitar delegação irrestrita, preferir delegação restrita e marcar contas privilegiadas como sensíveis e não delegáveis. Replicação: DCs replicam dados entre si, inclusive credenciais; uma conta com direitos de replicação indevidos poderia solicitar esses dados como se fosse um DC (conceito conhecido como DCSync). Mitigar: restringir direitos de replicação ao mínimo e alertar quando host que não é DC pede replicação.'
          ),
          sl(
            'Revisão de exposição: ferramentas defensivas',
            'Há ferramentas de avaliação que mapeiam relações entre contas, grupos, permissões e máquinas em formato de grafo, mostrando caminhos até o administrador de domínio, e outras que auditam a configuração do AD com pontuação de risco. Elas são úteis para a DEFESA: executadas pela própria equipe, com autorização, em seu ambiente, revelam caminhos de escalada para corrigir antes que um adversário os encontre. Nunca as use em ambientes de terceiros sem autorização; isso pode configurar crime (Lei 12.737/2012, visão geral, sem substituir orientação jurídica).'
          ),
          sl(
            'Monitoramento de eventos',
            'Priorize: alterações em grupos privilegiados (administradores de domínio e similares), criação de contas, mudanças em ACLs de objetos sensíveis, pedidos incomuns de tickets de serviço (volume de solicitações por um usuário, especialmente com cifras antigas), replicação solicitada por quem não é DC, logons de administradores em máquinas fora do tier correto e alterações em objetos de política de grupo. Os DCs registram eventos de autenticação Kerberos (como os pedidos de TGT e de ticket de serviço) que, bem coletados e correlacionados, sustentam essas detecções.'
          ),
          sl(
            'Reforço (hardening) do AD',
            'Medidas de reforço: tiering administrativo, contas de serviço com gMSA ou senhas longas, desativar protocolos legados (como versões antigas de NTLM) onde possível, senhas de administrador local únicas (LAPS), grupos privilegiados pequenos e revisados, DCs com acesso físico e lógico restrito, backups testados do AD e plano de recuperação de floresta. Eliminar caminhos de ataque conhecidos reduz muito o risco, e a revisão deve ser periódica, pois mudanças do dia a dia criam novas exposições.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Por que contas de serviço com senha fraca e SPN são um risco no Kerberos?', 'a', [
          'Qualquer usuário autenticado pode pedir o ticket do serviço e tentar quebrar a senha offline, sem falhas de login; senhas longas ou gMSA mitigam',
          'Porque o Kerberos grava as senhas em texto aberto no ticket e qualquer pessoa as lê',
          'Porque contas de serviço não podem usar MFA nem senha, e por isso são inseguras por definição',
          'Porque o ticket de serviço só pode ser emitido em horário comercial, quando a equipe de TI está ausente'
        ], 'O ataque é offline: não gera falhas de login e depende da fraqueza da senha. Senhas longas e gMSA tornam a quebra inviável. As outras afirmações são falsas.'),
        mcq('q2', 'Qual medida reduz o risco da delegação irrestrita?', 'c', [
          'Habilitar delegação irrestrita nos servidores de aplicação, para que o acesso seja mais fácil, já que a delegação não expõe as identidades dos usuários',
          'Aumentar a validade dos tickets para que os usuários precisem autenticar menos vezes',
          'Evitá-la, preferindo delegação restrita, e marcar contas privilegiadas como não delegáveis',
          'Mover as contas privilegiadas para os servidores de aplicação, perto dos serviços usados'
        ], 'Restringir a delegação e proteger contas sensíveis impede que o comprometimento de um servidor entregue identidades de alto privilégio. As outras opções ampliam o risco.'),
        mcq('q3', 'Um host que não é controlador de domínio solicita replicação de credenciais. O que isso indica?', 'b', [
          'Comportamento normal de qualquer estação que precisa sincronizar a hora com o domínio',
          'Possível abuso de direitos de replicação (conceito DCSync), que exige investigar a conta e restringir esses direitos',
          'Falha na impressora de rede, que usa a replicação para atualizar seu driver',
          'Atualização automática do navegador, que consulta o AD para validar certificados'
        ], 'Somente DCs deveriam pedir replicação. Quando outro host o faz, sugere abuso de direitos indevidos e deve ser investigado.'),
        fill('q4', 'Complete a sigla da conta de serviço com senha automática longa.', '___ = group Managed Service Account', ['gMSA', 'gmsa'], 'A gMSA tem senha gerenciada e longa, o que dificulta a quebra offline das contas de serviço.'),
        mcq('q5', 'Qual é o uso adequado de uma ferramenta de mapeamento de caminhos de ataque do AD?', 'd', [
          'Executá-la em redes de outras empresas para descobrir contas vulneráveis e informá-las depois, para depois compartilhar o mapa com a equipe de vendas',
          'Usá-la para obter as senhas dos usuários e guardá-las em uma planilha da equipe',
          'Rodá-la uma vez na implantação do AD e arquivar o resultado, pois o ambiente não muda',
          'Executá-la no ambiente próprio, com autorização, para corrigir caminhos de privilégio antes de um adversário'
        ], 'Essas ferramentas são defensivas quando usadas com autorização no próprio ambiente. Usá-las em redes de terceiros pode ser crime e o ambiente muda constantemente.'),
        mcq('q6', 'Por que a senha da krbtgt deve ser rotacionada após um comprometimento do domínio?', 'b', [
          'Porque ela é a senha do administrador local de todas as estações do domínio',
          'Porque a chave dela assina os tickets; se foi roubada, tickets forjados continuam válidos até a rotação',
          'Porque a krbtgt é uma conta humana cuja senha expira automaticamente a cada ano',
          'Porque a rotação apaga os logs de autenticação antigos, reduzindo o volume, e libera espaço de armazenamento nos controladores'
        ], 'A chave da krbtgt valida os tickets emitidos pelo domínio. Se vazou, tickets forjados seguem aceitos até a troca (feita duas vezes, com intervalo). Ela não é conta humana nem relacionada a logs.'),
        mcq('q7', 'Quais eventos do AD devem ter prioridade de monitoramento?', 'd', [
          'O número de impressões feitas por usuário, que revela quem trabalha mais',
          'A quantidade de reinicializações de estações em um mês, como único indicador de risco',
          'O tamanho dos perfis de usuário, que mostra quem acumula mais arquivos',
          'Mudanças em grupos privilegiados, alterações sensíveis de ACL, pedidos incomuns de ticket e replicação fora de DCs'
        ], 'Os eventos de alto valor estão ligados a privilégio, ACLs, tickets e replicação. Impressões, reinicializações e tamanho de perfil não indicam abuso de identidade.'),
        fill('q8', 'Complete o nome do protocolo.', 'Protocolo de autenticação do AD baseado em tickets (TGT e ticket de serviço): ___.', ['Kerberos', 'kerberos'], 'Kerberos é o protocolo de autenticação por tickets usado pelo Active Directory.')
      ]
    },
    {
      id: 'csa-13-windows-avancado-sysmon-etw-amsi',
      title: 'Windows avançado: Sysmon, ETW e AMSI',
      goal: 'Ampliar a telemetria do Windows com Sysmon, entender ETW e AMSI, aplicar registro de PowerShell e controlar a execução de aplicações com WDAC e AppLocker.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Telemetria de endpoint em camadas',
            'O log padrão do Windows registra logons e alguns eventos, mas pouco sobre o que cada processo faz. Para detecção avançada somam-se camadas: o Sysmon (eventos detalhados de processos, rede e arquivos), o ETW (rastreamento de baixo nível do sistema), o AMSI (inspeção de scripts) e os logs do PowerShell. O EDR comercial normalmente combina várias dessas fontes. Entender cada uma ajuda a saber o que se consegue ver e onde há pontos cegos.'
          ),
          sl(
            'Sysmon em conceito',
            'O Sysmon (System Monitor, da suíte Sysinternals) é um serviço que registra eventos detalhados: criação de processo com linha de comando, hash e processo pai, conexões de rede por processo, carregamento de módulos, criação de arquivos, consultas DNS e acesso a outros processos. Sua configuração é um arquivo de regras que define o que incluir ou excluir, e precisa de ajuste fino: sem filtros o volume pode ser grande demais para o SIEM. Boa prática: partir de uma configuração mantida pela comunidade, testar e excluir o ruído conhecido preservando eventos de alto valor.'
          ),
          sl(
            'ETW',
            'ETW (Event Tracing for Windows) é a infraestrutura nativa do Windows para que o sistema e as aplicações emitam eventos de baixo nível, com baixo custo. Muitas fontes de telemetria, incluindo EDRs, consomem eventos ETW. Para o defensor, vale conhecer os provedores relevantes e saber que tentativas de adulterar ou desligar o rastreamento são, em si, sinais de atividade suspeita e devem ser monitoradas. Por isso, a integridade da telemetria (aula anterior sobre evasão) também se aplica aqui.'
          ),
          sl(
            'AMSI',
            'AMSI (Antimalware Scan Interface) é uma interface em que aplicações, como o PowerShell e outros motores de script, enviam o conteúdo a ser executado ao antimalware instalado ANTES da execução, inclusive scripts que estavam embaralhados e foram desofuscados em memória. Assim o produto de segurança vê o texto real do script. Limitação: depende de integração do produto e da aplicação, e não substitui outras camadas. Tentativas de desativar a AMSI também devem gerar alerta.'
          ),
          sl(
            'Registro de PowerShell',
            'O PowerShell oferece três registros importantes: registro de módulos (module logging), registro de blocos de script (script block logging, que captura o conteúdo dos blocos executados) e transcrição (transcription, que grava sessões em arquivo). Complementam o modo de linguagem restrito (Constrained Language Mode), que limita funcionalidades em ambientes controlados. Ativar o registro de blocos de script costuma ser o ganho de maior valor, pois expõe o que realmente foi interpretado. Proteja os logs com envio ao coletor central.'
          ),
          sl(
            'Controle de aplicações: WDAC e AppLocker',
            'O controle de aplicações permite executar somente o que foi aprovado (allowlist). O AppLocker é mais simples e antigo; o WDAC (Windows Defender Application Control, hoje também chamado App Control) é mais robusto e aplicado ao núcleo do sistema. Regras podem se basear em editor (assinatura), hash ou caminho. Cuidado: regra por caminho é frágil se o diretório permite escrita por usuários comuns. Implante primeiro em MODO AUDITORIA para ver o que seria bloqueado, ajuste e só então imponha, para não interromper aplicações legítimas.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que o Sysmon acrescenta ao log padrão do Windows?', 'b', [
          'Elimina a necessidade do log padrão, pois registra a atividade completa do sistema, inclusive o conteúdo de arquivos',
          'Eventos detalhados, como criação de processo com linha de comando e hash, conexões de rede e carregamento de módulos',
          'Bloqueia automaticamente qualquer processo malicioso, funcionando como antivírus de comportamento, sem depender de qualquer regra configurada pela equipe',
          'Criptografa os logs do sistema para que só o administrador de domínio possa lê-los'
        ], 'O Sysmon é um serviço de telemetria detalhada, não bloqueia nem criptografa. Ele não substitui outros logs.'),
        mcq('q2', 'Qual é a função da AMSI?', 'd', [
          'Gerenciar as atualizações do sistema operacional de todas as estações do domínio',
          'Criptografar o conteúdo dos scripts para impedir que sejam copiados por terceiros',
          'Substituir o firewall do Windows na filtragem de conexões de entrada',
          'Permitir que aplicações enviem o conteúdo ao antimalware antes da execução, inclusive scripts já desembaralhados em memória'
        ], 'A AMSI é uma interface de varredura que expõe o conteúdo real de scripts ao antimalware antes da execução. Não gerencia atualizações, criptografia nem firewall.'),
        mcq('q3', 'Por que implantar WDAC ou AppLocker primeiro em modo de auditoria?', 'a', [
          'Para ver o que seria bloqueado e ajustar as regras antes de impor, evitando interromper aplicações legítimas',
          'Porque o modo de auditoria já oferece proteção total, tornando desnecessário o modo de imposição, pois registra e bloqueia ao mesmo tempo, sem necessidade de ajuste',
          'Porque a auditoria apaga os programas não permitidos, sem a necessidade de regras adicionais',
          'Porque o modo de imposição só funciona em computadores sem acesso à internet'
        ], 'A auditoria registra o que seria bloqueado sem interromper nada e permite ajustar a política. Ela não protege nem apaga programas.'),
        fill('q4', 'Complete a sigla da interface que repassa scripts ao antimalware antes da execução.', 'Interface de varredura de scripts do Windows: ___ (Antimalware Scan Interface).', ['AMSI', 'amsi'], 'AMSI significa Antimalware Scan Interface e expõe o conteúdo de scripts ao antimalware antes de executar.'),
        mcq('q5', 'Por que uma regra de allowlist baseada em caminho pode ser frágil?', 'c', [
          'Porque caminhos de arquivos não aceitam letras maiúsculas e minúsculas misturadas',
          'Porque regras por caminho são ignoradas pelo sistema operacional em contas de serviço',
          'Se o diretório permitir escrita por usuários comuns, um binário não confiável colocado ali passa a ser permitido',
          'Porque o caminho muda a cada reinicialização, o que invalida a regra automaticamente'
        ], 'Uma regra por caminho confia em um local, não no conteúdo. Se usuários comuns escrevem ali, a regra autoriza qualquer coisa colocada na pasta.'),
        mcq('q6', 'O volume do Sysmon excede a capacidade de ingestão do SIEM. Qual é a conduta adequada?', 'd', [
          'Desligar o Sysmon, já que o log padrão do Windows é suficiente para qualquer detecção',
          'Reduzir a retenção do SIEM para zero e esperar que o volume se normalize sozinho',
          'Descartar aleatoriamente metade dos eventos, sem critério, para caber na capacidade',
          'Ajustar o arquivo de configuração, excluindo ruído conhecido e preservando eventos de maior valor de detecção'
        ], 'O ajuste fino da configuração controla o volume mantendo o valor. Desligar, descartar aleatoriamente ou zerar a retenção destroem a capacidade de detecção.'),
        mcq('q7', 'Qual registro do PowerShell captura o conteúdo dos blocos de script que foram executados?', 'a', [
          'Registro de blocos de script (script block logging)',
          'O histórico de comandos digitados no console, guardado no perfil do usuário',
          'O registro de impressão, que lista os documentos enviados à impressora',
          'O log de energia do sistema, que registra suspensão e hibernação do computador'
        ], 'O script block logging registra o conteúdo dos blocos no momento em que são processados. O histórico do console não captura scripts completos, e os outros logs não têm relação.'),
        fill('q8', 'Complete a sigla do rastreamento de eventos do Windows.', 'Infraestrutura nativa de eventos de baixo nível do Windows: ___ (Event Tracing for Windows).', ['ETW', 'etw'], 'ETW é a infraestrutura de rastreamento de eventos do Windows, consumida por muitas ferramentas de segurança.')
      ]
    },
    {
      id: 'csa-14-linux-avancado-auditd-ebpf',
      title: 'Linux avançado: auditd e eBPF',
      goal: 'Usar o auditd, entender o eBPF para segurança, verificar integridade de arquivos, ter visão de MAC (SELinux e AppArmor) e telemetria de runtime em contêineres.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Telemetria no Linux',
            'O Linux tem poucos logs de segurança por padrão além de autenticação e serviços. Para detecção, somam-se: o subsistema de auditoria do kernel (auditd), programas eBPF para observação de eventos, verificação de integridade de arquivos, controle de acesso obrigatório (SELinux ou AppArmor) e, em contêineres, telemetria de runtime. Para administração básica veja o curso de Linux; aqui o foco é a visão de segurança e detecção.'
          ),
          sl(
            'auditd',
            'O auditd é o daemon do subsistema de auditoria do kernel. Ele grava eventos segundo regras: observação de arquivos (watch) e de chamadas de sistema. Exemplo ilustrativo de regra para a PRÓPRIA máquina (não foi executado nesta aula): observa escrita (w) e mudança de atributos (a) no arquivo de configuração do sudo e marca os eventos com uma chave para facilitar a busca. Pontos de atenção: regras demais geram volume e custo; regras úteis cobrem arquivos de autenticação, de sudo, chaves SSH autorizadas e agendadores. Encaminhe os registros ao coletor central.',
            '# regras ilustrativas de auditoria (própria máquina, laboratório)\n-w /etc/sudoers -p wa -k mudanca_sudoers\n-w /etc/ssh/sshd_config -p wa -k mudanca_ssh'
          ),
          sl(
            'eBPF para segurança',
            'eBPF permite carregar no kernel pequenos programas, verificados quanto à segurança antes de rodar, que observam eventos (chamadas de sistema, rede, execução de processos) com baixo custo e sem módulo de kernel. É a base de várias ferramentas modernas de segurança de runtime. Limitações: exige kernel compatível e privilégios para carregar, e a configuração precisa de ajuste de ruído. Atenção dupla: o mesmo mecanismo poderia ser usado por alguém com privilégio alto para ocultar atividade, então carregamentos de programas eBPF fora do esperado merecem monitoramento.'
          ),
          sl(
            'Integridade de arquivos',
            'O FIM (File Integrity Monitoring) calcula hashes de arquivos críticos e alerta quando mudam sem justificativa: binários do sistema, configuração de autenticação, agendadores, arquivos de chaves. Ferramentas existentes registram a linha de base e comparam periodicamente; gerenciadores de pacotes também conseguem verificar se arquivos instalados foram alterados. Ponto-chave: a linha de base precisa ser guardada em local protegido, senão o invasor altera os dois. Integre os alertas a janelas de mudança para reduzir falsos positivos.'
          ),
          sl(
            'Controle de acesso obrigatório (MAC)',
            'No modelo comum, quem é dono de um arquivo decide quem acessa. No MAC (Mandatory Access Control), uma política central confina cada processo ao que ele precisa, mesmo que seja root. SELinux e AppArmor são as duas implementações mais comuns: elas limitam o dano de um serviço comprometido. O SELinux tem modos enforcing (aplica e bloqueia) e permissive (só registra). Erro comum: desabilitar o controle quando algo para de funcionar; o correto é ler as negações registradas e ajustar a política ou o contexto.'
          ),
          sl(
            'Runtime em contêineres',
            'Contêineres executam processos do host em isolamento, e a telemetria de runtime observa o que acontece neles: execução de processo fora do esperado, escrita em diretórios que deveriam ser somente leitura, conexões de rede inesperadas e acesso a segredos. Boas práticas: sistema de arquivos somente leitura, usuário sem privilégio, perfis de MAC e capacidades mínimas, imagens verificadas e alertas de desvio do comportamento normal da imagem. Para detalhes de plataforma, veja o curso de Linux.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é a função de uma regra de observação (watch) do auditd com permissões wa sobre o arquivo de configuração do sudo?', 'c', [
          'Impedir que qualquer usuário, inclusive o root, escreva nesse arquivo',
          'Fazer backup automático do arquivo toda vez que alguém o abre para leitura, mantendo cópias versionadas na pasta pessoal do usuário',
          'Registrar escritas e mudanças de atributos no arquivo, com uma chave para facilitar a busca',
          'Criptografar o arquivo para que só o auditd consiga ler seu conteúdo'
        ], 'A regra watch gera registros de auditoria; não bloqueia, não faz backup nem criptografa. A chave facilita localizar os eventos.'),
        mcq('q2', 'Qual vantagem o eBPF traz para a segurança de runtime?', 'a', [
          'Observar eventos do kernel com baixo custo e sem módulo de kernel, por programas verificados',
          'Substituir completamente o firewall e o antivírus do servidor',
          'Permitir que qualquer usuário comum carregue código no kernel sem restrições, durante a janela de manutenção semanal do servidor',
          'Eliminar a necessidade de registrar logs, pois tudo é monitorado em memória'
        ], 'O eBPF permite observação eficiente de eventos por programas verificados antes de rodar. Não substitui outros controles nem dispensa logs, e o carregamento exige privilégios.'),
        mcq('q3', 'Um serviço passou a falhar depois que o SELinux foi colocado em modo enforcing. Qual é a atitude correta?', 'd', [
          'Desabilitar o SELinux definitivamente, pois ele é a causa do problema',
          'Reinstalar o sistema operacional, porque o enforcing corrompe os serviços',
          'Executar o serviço como root, para que a política do SELinux deixe de se aplicar, mantendo o SELinux ativo nos demais serviços',
          'Ler as negações registradas e ajustar a política ou o contexto, em vez de desabilitar o controle'
        ], 'As negações registradas indicam exatamente o que a política bloqueou, e ajustá-las preserva a proteção. Desabilitar remove uma camada de defesa e rodar como root não ignora o MAC.'),
        fill('q4', 'Complete com o nome do subsistema de auditoria do kernel.', 'O daemon do subsistema de auditoria do Linux chama-se ___.', ['auditd', 'audit'], 'O auditd grava eventos de auditoria segundo regras sobre arquivos e chamadas de sistema.'),
        mcq('q5', 'Para que serve o monitoramento de integridade de arquivos (FIM)?', 'b', [
          'Para aumentar a velocidade de leitura dos arquivos mais acessados no disco',
          'Para detectar alterações não esperadas em arquivos críticos comparando com uma linha de base de hashes',
          'Para remover automaticamente os arquivos duplicados do servidor',
          'Para criptografar os arquivos de configuração a cada leitura feita pelo serviço'
        ], 'O FIM compara hashes com uma linha de base e alerta sobre mudanças. Não otimiza leitura, não remove duplicatas e não criptografa.'),
        mcq('q6', 'Por que carregamentos de programas eBPF devem ser monitorados?', 'a', [
          'O mesmo mecanismo pode ser usado por alguém com privilégio alto para ocultar atividade; carregamentos fora do esperado merecem alerta',
          'Porque o eBPF é proibido pelo kernel e qualquer uso é sinal de invasão',
          'Porque cada programa eBPF consome toda a memória do servidor',
          'Porque o monitoramento impede que ferramentas de segurança legítimas usem eBPF'
        ], 'O eBPF é legítimo e muito usado em segurança, mas o carregamento inesperado pode indicar abuso por privilégio elevado. Não é proibido nem consome toda a memória.'),
        mcq('q7', 'Qual controle ajuda a proteger contêineres em tempo de execução?', 'c', [
          'Executar tudo como root dentro do contêiner, para evitar problemas de permissão',
          'Permitir escrita na raiz do sistema de arquivos, para que a aplicação falhe menos',
          'Sistema de arquivos somente leitura, usuário sem privilégio e alertas sobre execução fora do perfil esperado',
          'Usar imagens sem verificação, desde que venham de um site conhecido'
        ], 'Reduzir privilégios e escrita limita o dano, e alertar desvios detecta comportamento anormal. As demais opções ampliam o risco.'),
        fill('q8', 'Complete o nome do controle de acesso obrigatório.', 'SELinux = Security-Enhanced ___.', ['Linux', 'linux'], 'SELinux é o Security-Enhanced Linux, um sistema de controle de acesso obrigatório.')
      ]
    },
    {
      id: 'csa-15-ndr-e-deteccao-em-rede',
      title: 'NDR e detecção em rede',
      goal: 'Entender NDR, fluxos e análise de tráfego, indicadores de beaconing e túnel DNS, o desafio do TLS para a visibilidade e o posicionamento de sensores.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'O que é NDR e por que existe',
            'NDR (Network Detection and Response) é a detecção e resposta baseada no tráfego de rede. Ela complementa o EDR: onde não há agente (dispositivos de IoT e de tecnologia operacional, sistemas legados, equipamentos de terceiros), a rede ainda enxerga a comunicação. Também é forte para o tráfego leste-oeste, isto é, entre sistemas internos (movimento lateral), que o perímetro não vê. Princípio: o adversário pode apagar rastros em um host, mas precisa se comunicar pela rede. Para protocolos e fundamentos, veja o curso de Redes.'
          ),
          sl(
            'Fontes de dados de rede',
            'As principais fontes: (1) FLUXOS (NetFlow ou IPFIX): metadados de cada conversa, como origem, destino, portas, bytes e tempos, sem o conteúdo; leves e baratos de guardar por longos períodos; (2) logs de proxy e de DNS; (3) metadados extraídos por sensores (conexões, certificados TLS, consultas), no estilo de ferramentas como Zeek; (4) captura completa de pacotes, a mais rica e a mais cara em armazenamento, usada com critério. A escolha equilibra visibilidade, custo e privacidade.'
          ),
          sl(
            'Sensores e posicionamento',
            'O tráfego chega ao sensor por espelhamento de porta (SPAN) ou por um TAP (dispositivo que copia o tráfego do enlace). Na nuvem, usam-se recursos de espelhamento de tráfego da plataforma e logs de fluxo. Posicione sensores onde a visibilidade importa: saída para a internet, entre segmentos críticos, datacenter e nuvem. Um erro comum é monitorar apenas o tráfego norte-sul (de e para a internet) e ignorar o leste-oeste, onde ocorre o movimento lateral.'
          ),
          sl(
            'TLS e visibilidade',
            'A maior parte do tráfego é criptografada em TLS, o que impede ver o conteúdo. Opções: (a) inspeção TLS por proxy, que decifra e reencripta, com custos de desempenho, de complexidade e de privacidade (exige política clara, base legal e exceções para dados sensíveis como saúde e bancos); (b) análise de metadados que continuam visíveis, como o nome do servidor (SNI), o certificado, os tamanhos e tempos dos pacotes e impressões digitais do handshake; (c) visibilidade no endpoint. Muitas vezes combinam-se metadados com inspeção seletiva e justificada.'
          ),
          sl(
            'Indicadores de beaconing e túnel DNS',
            'Beaconing: conexões em intervalo regular (baixo jitter) com tamanhos parecidos para o mesmo destino, especialmente raro ou novo. Túnel DNS: volume alto de consultas a um mesmo domínio, subdomínios longos e de aparência aleatória, uso incomum de registros do tipo TXT e respostas grandes. Outros: varredura interna (um host contatando muitos destinos ou portas), transferências grandes e incomuns e conexões a destinos sem histórico. Sempre enriqueça com contexto do ativo e da identidade.'
          ),
          sl(
            'Operação: baseline, ruído e limites',
            'Detecções de rede precisam de linha de base do tráfego normal. Atualizações de software, monitoramento e aplicativos de sincronização também são periódicos e geram falsos positivos; documente exceções em lista controlada, com dono e prazo, mantendo o contexto para não criar pontos cegos. Limites do NDR: tráfego criptografado sem metadados úteis, equipamentos em segmentos sem sensor e dependência de enriquecimento. Por isso a rede é uma camada entre várias, não a única.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual vantagem o NDR tem em relação ao EDR?', 'd', [
          'Bloquear processos no endpoint antes da execução, o que o EDR não consegue fazer, o que o EDR sozinho não consegue fazer em nenhuma situação',
          'Substituir a necessidade de logs de identidade e de nuvem em qualquer ambiente',
          'Executar em cada estação e bloquear processos, com mais precisão que um agente',
          'Enxergar dispositivos sem agente e o tráfego leste-oeste entre sistemas internos'
        ], 'O NDR vê a comunicação de dispositivos onde não se instala agente (IoT, legado) e o tráfego interno. Ele complementa o EDR e não bloqueia processos nem substitui outras fontes.'),
        mcq('q2', 'O que os registros de fluxo (NetFlow ou IPFIX) contêm?', 'b', [
          'O conteúdo completo de cada pacote, incluindo os dados das aplicações',
          'Metadados da comunicação, como origem, destino, portas, bytes e tempos, sem o conteúdo dos pacotes',
          'Os nomes dos usuários que acessaram a internet, sem endereços IP, agrupados por domínio e não por conexão individual',
          'O histórico de sites visitados pelos navegadores de cada estação, sem portas nem bytes'
        ], 'Fluxos são metadados leves da conversa, sem conteúdo. Não incluem pacotes completos nem se limitam a usuários ou sites.'),
        mcq('q3', 'Quase todo o tráfego é TLS. Como manter visibilidade útil?', 'c', [
          'Desistir da análise de rede, pois o conteúdo criptografado é impossível de monitorar',
          'Decifrar o tráfego dos usuários da rede inteira, sem política nem exceções',
          'Combinar metadados (SNI, certificado, tamanhos e tempos) com inspeção seletiva, justificada e com política clara',
          'Proibir o uso de TLS na rede interna, para que o tráfego volte a ser legível'
        ], 'Metadados continuam visíveis e a inspeção seletiva com política clara equilibra visibilidade e privacidade. Decifrar tudo sem critério cria riscos legais, e proibir o TLS reduz a segurança.'),
        fill('q4', 'Complete o nome do registro de fluxo de rede.', 'Registros de fluxo de rede: Net___ ou IPFIX.', ['Flow', 'flow'], 'NetFlow (e o IPFIX) registram metadados das conversas de rede.'),
        mcq('q5', 'Um host faz centenas de consultas DNS do tipo TXT a subdomínios longos de um domínio raro. Qual é a hipótese?', 'a', [
          'Possível túnel DNS; verificar domínio, volume e processo de origem',
          'Funcionamento normal do DNS, que consulta TXT para renovar a hora do sistema',
          'Falha de impressão, que usa registros TXT para localizar a impressora',
          'Atualização do navegador, que consulta TXT para baixar a lista de favoritos'
        ], 'Volume alto de TXT com subdomínios longos para domínio raro é padrão típico de túnel DNS. As outras explicações não correspondem ao comportamento.'),
        mcq('q6', 'Por que o posicionamento do sensor de rede é importante?', 'c', [
          'Porque o sensor só funciona se estiver perto do roteador do provedor de internet, a fim de reduzir a quantidade de saltos até a internet pública',
          'Porque o sensor detecta ataques por proximidade física com o servidor atacado',
          'Sem sensor no segmento certo, o tráfego leste-oeste e o de sistemas críticos ficam invisíveis',
          'Porque o posicionamento determina a velocidade da internet dos usuários'
        ], 'Um sensor só vê o tráfego que passa por ele. Sem cobertura de segmentos internos e críticos, o movimento lateral não aparece.'),
        mcq('q7', 'Um alerta de beaconing aponta para uma ferramenta legítima de atualização de software. O que fazer?', 'b', [
          'Ignorar o alerta e apagar a regra, pois qualquer periodicidade é legítima',
          'Documentar e adicionar a uma lista de exceções controlada, mantendo o contexto para evitar cegueira',
          'Bloquear todo o tráfego de atualização da rede, para evitar novos alertas',
          'Reduzir o intervalo de análise até que o alerta deixe de aparecer'
        ], 'Exceções documentadas e com dono reduzem ruído sem criar pontos cegos permanentes. Apagar a regra ou bloquear atualizações são medidas excessivas.'),
        fill('q8', 'Complete o dispositivo de cópia de tráfego.', 'Para obter uma cópia do tráfego de um enlace usa-se espelhamento de porta (SPAN) ou um ___.', ['TAP', 'tap'], 'O TAP é um dispositivo que copia o tráfego de um enlace para o sensor.')
      ]
    },
    {
      id: 'csa-16-criptografia-avancada-e-pos-quantica',
      title: 'Criptografia avançada e pós-quântica',
      goal: 'Entender protocolos modernos (TLS 1.3 e o conceito do Signal), forward secrecy, erros de implementação e a migração para criptografia pós-quântica diante do risco de colher agora, decifrar depois.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'TLS 1.3 em conceito',
            'O TLS 1.3 é a versão moderna do protocolo que protege a maior parte da web. Em conceito, simplificou o handshake (menos idas e vindas, o que reduz a latência), removeu algoritmos legados e inseguros e exige suítes com criptografia autenticada (AEAD) e troca de chaves com forward secrecy. Para o defensor: priorize configurações que exijam versões e suítes modernas, desative protocolos antigos e acompanhe a validade e o gerenciamento dos certificados (veja a PKI do nível intermediário).'
          ),
          sl(
            'Forward secrecy',
            'Forward secrecy (sigilo futuro) garante que o roubo de uma chave de longo prazo, como a chave privada do servidor, não permite decifrar sessões passadas. Isso é obtido com chaves de sessão EFÊMERAS, geradas para cada sessão por um acordo de chaves (como o Diffie-Hellman efêmero, ECDHE) e descartadas ao fim. Sem forward secrecy, um adversário que grave o tráfego hoje e roube a chave do servidor amanhã consegue ler tudo que gravou. Com ela, cada sessão precisa ser atacada separadamente.'
          ),
          sl(
            'Signal e o double ratchet (conceito)',
            'O protocolo do Signal, usado por mensageiros com criptografia ponta a ponta, adiciona ideias além do TLS. O "double ratchet" (catraca dupla) faz as chaves mudarem a cada mensagem, de modo que: o vazamento de uma chave de mensagem não revela as anteriores (forward secrecy) e a comunicação se recupera depois de um comprometimento temporário, pois novas chaves passam a ser derivadas com material novo (post-compromise security). O conceito mostra que protocolos modernos pensam na troca contínua de chaves, e não em uma única chave estática.'
          ),
          sl(
            'Erros comuns de implementação',
            'A maioria das falhas reais não está no algoritmo, e sim no uso: reutilizar o mesmo nonce com a mesma chave em modos AEAD (compromete confidencialidade e autenticidade), IV previsível, geração de números aleatórios fraca, comparação de valores secretos que vaza informação pelo tempo, desligar a validação de certificados "só para testar" e não verificar a autenticação dos dados. Regra de ouro: não invente a própria criptografia; use primitivas padronizadas e bibliotecas revisadas pela comunidade, com a configuração recomendada.'
          ),
          sl(
            'A ameaça quântica',
            'Um computador quântico suficientemente grande rodaria o algoritmo de Shor, capaz de quebrar a fatoração e o logaritmo discreto, que sustentam RSA, ECC e Diffie-Hellman, ou seja, a criptografia de chave pública atual. Para a criptografia simétrica e os hashes, o algoritmo de Grover dá apenas um ganho moderado, que se compensa com chaves maiores (por exemplo, usar chaves de 256 bits). Não há consenso de quando tal máquina existirá, e a ameaça já importa hoje por causa do ataque descrito a seguir.'
          ),
          sl(
            'Colher agora, decifrar depois, e migração',
            '"Colher agora, decifrar depois" (harvest now, decrypt later) é o ataque de gravar tráfego cifrado hoje para decifrá-lo no futuro, quando houver capacidade quântica. Ele importa para dados que precisam continuar secretos por muitos anos (saúde, governo, propriedade intelectual). A resposta é a criptografia pós-quântica (PQC): algoritmos novos, resistentes a computadores quânticos, padronizados por órgãos como o NIST. A migração começa pelo INVENTÁRIO criptográfico (onde e como se usa cripto), pela crypto-agilidade (poder trocar algoritmos sem reescrever tudo) e por abordagens HÍBRIDAS, que combinam algoritmo clássico e pós-quântico.'
          )
        ]
      },
      questions: [
        mcq('q1', 'O que o forward secrecy garante?', 'a', [
          'Que o vazamento posterior da chave privada do servidor não decifra sessões passadas, graças a chaves de sessão efêmeras',
          'Que a chave privada do servidor dispense proteção, por ser descartada ao fim de cada sessão',
          'Que o tráfego não possa ser gravado por ninguém enquanto trafega pela internet',
          'Que as sessões duram indefinidamente, sem necessidade de novo handshake'
        ], 'Forward secrecy usa chaves efêmeras por sessão, então a chave de longo prazo não abre o passado. Não impede gravação do tráfego nem dispensa proteger chaves.'),
        mcq('q2', 'Qual é um erro de implementação típico em criptografia autenticada (AEAD)?', 'c', [
          'Usar chaves de 256 bits em vez de chaves de 128 bits',
          'Atualizar a biblioteca criptográfica para a versão mais recente',
          'Reutilizar o mesmo nonce com a mesma chave, o que pode comprometer confidencialidade e autenticidade',
          'Gerar um valor aleatório novo para cada mensagem cifrada'
        ], 'O nonce deve ser único por chave; sua reutilização quebra as garantias. Chaves maiores, bibliotecas atualizadas e valores novos são práticas corretas.'),
        mcq('q3', 'Qual é a ameaça da computação quântica à criptografia atual?', 'b', [
          'Torna inútil todo tipo de criptografia, inclusive os hashes e as cifras simétricas',
          'O algoritmo de Shor poderia quebrar RSA e ECC, enquanto as cifras simétricas sofrem uma redução moderada (Grover), compensável com chaves maiores',
          'Só afeta senhas curtas guardadas em texto aberto, sem relação com algoritmos',
          'Impede o funcionamento de qualquer protocolo de rede, inclusive o TLS'
        ], 'A criptografia de chave pública baseada em fatoração e logaritmo discreto é a mais afetada. Simétricos e hashes sofrem pouco, e protocolos podem migrar para algoritmos pós-quânticos.'),
        fill('q4', 'Complete o tipo de chave que garante forward secrecy.', 'No TLS, chaves de sessão ___ (geradas para cada sessão e descartadas) garantem forward secrecy.', ['efêmeras', 'efemeras', 'efêmera', 'efemera'], 'Chaves efêmeras existem só durante a sessão, o que impede que o roubo da chave de longo prazo decifre o passado.'),
        mcq('q5', 'O que é o ataque "colher agora, decifrar depois"?', 'd', [
          'Apagar os logs agora para que ninguém consiga investigar o incidente no futuro',
          'Obter senhas por força bruta durante a madrugada, quando o monitoramento é menor, realizada de forma distribuída em vários servidores ao mesmo tempo',
          'Roubar dados já descriptografados de um servidor e vendê-los rapidamente',
          'Gravar tráfego cifrado hoje para decifrá-lo no futuro, quando houver capacidade quântica'
        ], 'O adversário armazena o tráfego cifrado hoje e espera ter meios de decifrá-lo. Por isso dados de longa vida exigem atenção à migração pós-quântica.'),
        mcq('q6', 'Qual é uma primeira ação sensata de migração para criptografia pós-quântica?', 'b', [
          'Substituir os algoritmos de uma só vez, sem inventário, para terminar rápido',
          'Inventariar onde e como a criptografia é usada, priorizando dados de longa vida, e buscar crypto-agilidade',
          'Esperar que o primeiro computador quântico seja anunciado para só então começar a planejar, mantendo os dados atuais sem inventário prévio de qualquer tipo',
          'Aumentar o tamanho das senhas dos usuários, que resolve o risco da chave pública'
        ], 'Sem inventário não se sabe o que migrar, e a crypto-agilidade permite trocar algoritmos com menos esforço. Esperar o anúncio é tarde para dados que já podem estar sendo coletados.'),
        mcq('q7', 'Por que não se deve desenvolver o próprio algoritmo de criptografia?', 'd', [
          'Porque a legislação brasileira proíbe a criação de algoritmos criptográficos',
          'Porque algoritmos novos são mais lentos do que os padronizados, e a lentidão é o risco principal',
          'Porque só empresas estrangeiras podem publicar algoritmos criptográficos',
          'Porque algoritmos próprios não passam por escrutínio público e costumam ter falhas; é melhor usar primitivas padronizadas'
        ], 'A segurança criptográfica vem da revisão extensa pela comunidade. Algoritmos caseiros raramente resistem a ela. Não há proibição legal nem exclusividade de empresas.'),
        fill('q8', 'Complete a abordagem de migração.', 'Abordagem que combina um algoritmo clássico com um pós-quântico: abordagem ___.', ['híbrida', 'hibrida', 'híbrido', 'hibrido'], 'A abordagem híbrida mantém a segurança se um dos dois algoritmos se mostrar fraco, e facilita a transição.')
      ]
    },
    {
      id: 'csa-17-kms-hsm-e-gestao-de-chaves',
      title: 'KMS, HSM e gestão de chaves',
      goal: 'Entender o ciclo de vida de chaves, o papel de KMS e HSM, envelope encryption, rotação, segregação de funções e os riscos de perda e de comprometimento de chaves.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'A chave é o segredo que importa',
            'Em criptografia moderna, o algoritmo é público e a segurança está na chave. Cifrar dados com um bom algoritmo e guardar a chave mal (em código-fonte, em arquivo de configuração aberto, na mesma máquina dos dados) anula toda a proteção. Gestão de chaves é o conjunto de processos para gerar, guardar, usar, trocar e destruir chaves com segurança. Ela é um dos pontos em que mais se erra na prática, e um dos que mais exigem disciplina.'
          ),
          sl(
            'Ciclo de vida de uma chave',
            'Etapas: geração (com boa aleatoriedade), distribuição e armazenamento protegidos, uso (com controle de quem pode usar e para quê), rotação (troca periódica ou por evento), arquivamento (para decifrar dados antigos quando necessário), revogação (quando suspeita de comprometimento) e destruição (quando não for mais necessária). Cada etapa tem registros e responsáveis. Uma chave sem dono, sem prazo e sem inventário é uma dívida de segurança.'
          ),
          sl(
            'KMS',
            'Um KMS (Key Management Service) é um serviço, normalmente gerenciado pela nuvem, para criar e usar chaves com controle de acesso e trilha de auditoria. Ponto central: as chaves mestras não saem do serviço em claro; as aplicações pedem a operação (cifrar, decifrar, assinar) por API e o serviço a executa. Assim, quem usa a chave não precisa ver a chave, e cada uso fica registrado. Cuidado: a política de acesso do KMS passa a ser crítica; uma permissão ampla demais anula o benefício.'
          ),
          sl(
            'HSM',
            'Um HSM (Hardware Security Module) é um equipamento dedicado, resistente a violação, que gera e usa chaves sem permitir que sejam exportadas em claro. É indicado para chaves de altíssimo valor (autoridade certificadora raiz, assinatura de código, requisitos regulatórios). Há certificações de segurança de módulos criptográficos (como a família FIPS 140). Existem HSMs físicos e serviços de HSM na nuvem. O custo e a complexidade operacional são maiores, então se reserva para onde o risco justifica.'
          ),
          sl(
            'Envelope encryption',
            'No envelope encryption, uma chave de dados (DEK, data encryption key) cifra o dado, e uma chave mestra (KEK, key encryption key), guardada no KMS ou HSM, cifra a DEK. A DEK cifrada fica junto do dado. Vantagens: desempenho (dados grandes são cifrados localmente com a DEK), e rotação simples (para trocar a KEK, recifram-se apenas as DEKs, e não todo o conteúdo). Exemplo: cada arquivo tem sua DEK; o KMS protege as DEKs.',
            'dado  --(DEK)-->  dado cifrado\nDEK   --(KEK no KMS/HSM)-->  DEK cifrada (guardada junto do dado)'
          ),
          sl(
            'Rotação, segregação de funções e perda de chave',
            'Rotação reduz a janela de exposição de uma chave roubada, e deve ocorrer em prazos definidos e quando houver suspeita. Segregação de funções: quem administra a chave não deveria ser quem acessa os dados, e operações críticas podem exigir duas pessoas (controle dual). Perda de chave: sem a chave, dados cifrados são IRRECUPERÁVEIS; por isso a necessidade de cópia protegida, plano de recuperação e teste. O inverso também é útil: o crypto-shredding destrói a chave para tornar ilegíveis os dados cifrados com ela, o que apoia o descarte. Se uma chave for exposta, trate-a como comprometida: revogue, rotacione e investigue seu uso.'
          )
        ]
      },
      questions: [
        mcq('q1', 'No envelope encryption, qual é o papel da chave KEK?', 'b', [
          'Cifrar diretamente todo o conteúdo dos arquivos, dispensando as chaves de dados, que seria mantida em texto aberto no mesmo servidor',
          'Cifrar as chaves de dados (DEK), permitindo trocar a KEK sem recifrar todo o conteúdo',
          'Servir de senha de acesso do administrador ao painel do KMS',
          'Assinar certificados digitais de servidores web'
        ], 'A KEK protege as DEKs; para rotacioná-la basta reencapsular as DEKs. Quem cifra o conteúdo é a DEK, e a KEK não é senha de painel nem assina certificados.'),
        mcq('q2', 'Qual característica diferencia um HSM de um repositório de chaves em software?', 'd', [
          'O HSM guarda as chaves em arquivos de texto, o que facilita a cópia entre servidores, sem restrição de acesso para os administradores do sistema',
          'O HSM dispensa controle de acesso, pois o equipamento fica em uma sala trancada',
          'O HSM é mais barato e simples de operar do que o software, por isso substitui o KMS',
          'A chave é gerada e usada dentro de hardware resistente a violação, sem poder ser exportada em claro'
        ], 'O diferencial do HSM é manter a chave dentro do hardware protegido. Ele exige controle de acesso e costuma ser mais caro e complexo.'),
        mcq('q3', 'Por que separar quem administra as chaves de quem acessa os dados?', 'a', [
          'Evita que uma única pessoa controle a chave e acesse os dados protegidos por ela',
          'Reduz o tamanho das chaves, tornando as operações criptográficas mais rápidas, e acelera a rotação automática das chaves de dados',
          'Elimina a necessidade de registrar o uso das chaves em logs de auditoria',
          'Garante que as chaves sejam rotacionadas automaticamente a cada hora'
        ], 'A segregação de funções limita o abuso por uma única pessoa. Não altera o tamanho das chaves, não dispensa auditoria e não define a frequência de rotação.'),
        fill('q4', 'Complete o nome da chave que cifra o dado no envelope encryption.', 'Chave que cifra diretamente o dado: chave de ___ (DEK).', ['dados', 'dado', 'data'], 'A DEK (data encryption key, chave de dados) cifra o conteúdo e é protegida pela KEK.'),
        mcq('q5', 'A única cópia da chave mestra de um backup cifrado foi perdida. Qual é a consequência?', 'c', [
          'Os dados continuam acessíveis, pois o algoritmo de criptografia permite a recuperação sem a chave, pois o próprio sistema operacional guarda uma cópia da chave',
          'O fornecedor do software consegue restaurar os dados com um código mestre universal',
          'Os dados cifrados ficam irrecuperáveis, o que mostra a necessidade de cópia protegida e teste de recuperação',
          'Os metadados dos arquivos são perdidos, mas o conteúdo continua legível pelo sistema'
        ], 'Sem a chave, não há como decifrar com um algoritmo seguro. Por isso é indispensável ter cópia protegida e plano de recuperação testado.'),
        mcq('q6', 'O que é crypto-shredding?', 'd', [
          'Reescrever o disco com zeros várias vezes para apagar os dados fisicamente, verificando em seguida o resultado em cada setor do volume',
          'Compactar os dados cifrados para economizar espaço de armazenamento',
          'Aumentar o tamanho da chave toda vez que um dado for acessado',
          'Destruir a chave para tornar ilegíveis os dados cifrados com ela, apoiando o descarte seguro'
        ], 'Se a chave é destruída, os dados cifrados tornam-se ilegíveis. É útil para descarte. Reescrever disco, compactar e aumentar chave são outras coisas.'),
        mcq('q7', 'Uma chave de criptografia foi exposta por engano em um repositório de código. Qual é a ação correta?', 'a', [
          'Tratar como comprometida: revogar, rotacionar, reavaliar o que foi cifrado com ela e investigar seu uso',
          'Apagar o arquivo do repositório e considerar o assunto encerrado, pois o histórico não é acessível, já que ninguém além da equipe de desenvolvimento acessa o repositório',
          'Aguardar para ver se alguém usa a chave antes de tomar qualquer providência',
          'Mudar o nome da chave, mantendo o mesmo valor, para dificultar a localização'
        ], 'Uma chave exposta deve ser considerada comprometida, mesmo que o arquivo seja apagado, pois o histórico e cópias podem existir. Esperar ou renomear não elimina o risco.'),
        fill('q8', 'Complete a sigla do equipamento que guarda chaves de forma resistente a violação.', 'Equipamento dedicado que gera e usa chaves sem exportá-las em claro: ___.', ['HSM', 'hsm'], 'O HSM (Hardware Security Module) é o hardware resistente a violação que protege chaves.')
      ]
    },
    {
      id: 'csa-40-criptoativos-e-blockchain-seguranca',
      title: 'Segurança de criptoativos e blockchain',
      goal: 'Entender o modelo de segurança de blockchains, a custódia de chaves (multiassinatura, HSM), classes de falha em contratos inteligentes, riscos de pontes e oráculos, a análise on-chain e os temas de conformidade.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'O que uma blockchain protege (e o que não protege)',
            'Uma blockchain é um livro-razão distribuído: transações são agrupadas em blocos, cada bloco referencia o hash do anterior e muitos participantes (nós) concordam sobre a versão válida por meio de um mecanismo de consenso. A segurança vem do custo de reescrever o histórico e da verificação independente por muitos nós. Isso entrega integridade e resistência à censura, mas NÃO entrega confidencialidade: em blockchains públicas, transações e saldos são visíveis; o que existe é pseudonimato (endereços), não anonimato. Outro ponto: o protocolo pode estar íntegro e o usuário ainda perder tudo, porque a segurança do protocolo não cobre a guarda das chaves nem a qualidade dos programas que rodam sobre ele.'
          ),
          sl(
            'Custódia: quem controla a chave controla o ativo',
            'Em criptoativos, o controle de um endereço pertence a quem possui a chave privada. Não há central de atendimento para recuperar uma chave perdida, e uma transação confirmada normalmente não pode ser desfeita. Por isso a custódia é o núcleo do risco. Custódia própria (não custodial): o usuário guarda a chave em carteira de software ou hardware. Custódia por terceiro: uma corretora ou custodiante guarda as chaves e o usuário confia nele. Carteira quente fica conectada à internet (prática, mais exposta); carteira fria fica isolada (menos exposta, menos prática). Erros comuns: frase de recuperação fotografada ou guardada em nuvem, e uma única pessoa com acesso total.',
            'carteira quente  -> uso diário, saldo pequeno\ncarteira fria    -> reserva, acesso raro e controlado'
          ),
          sl(
            'Multiassinatura, HSM e custódia institucional',
            'Na multiassinatura (multisig) uma movimentação exige M assinaturas de N chaves possíveis, por exemplo 3 de 5. Nenhuma pessoa sozinha move os fundos, e a perda ou o roubo de uma chave não é fatal. Boas práticas: chaves em locais, dispositivos e pessoas diferentes, e processo de aprovação com registro. Organizações maiores guardam chaves em HSMs (veja a lição de KMS e HSM) e usam custódia institucional com segregação de funções, limites por transação, lista de endereços permitidos, controle dual e trilha de auditoria. Erro comum: n chaves guardadas no mesmo cofre ou no mesmo provedor, o que recria um ponto único de falha.'
          ),
          sl(
            'Contratos inteligentes e classes de falha',
            'Um contrato inteligente é um programa publicado na blockchain que executa regras automaticamente, e em geral não pode ser corrigido depois de implantado (a menos que tenha sido projetado com mecanismo de atualização). Como ele pode controlar valores, um defeito de lógica vira perda financeira direta. Classes de falha, em conceito: (1) erro de lógica de negócio, quando a regra permite um resultado que o autor não pretendia; (2) controle de acesso fraco, quando uma função sensível pode ser chamada por quem não deveria; (3) reentrância, quando o contrato faz uma chamada externa antes de atualizar o próprio estado e é reentrado; (4) erros aritméticos e de arredondamento; (5) dependência de dados manipuláveis. Defesas: revisão de código, testes, auditoria independente, verificação formal em partes críticas, limites de valor, mecanismo de pausa e programa de recompensa por falhas. Atualizações devem passar por atraso (timelock) e multiassinatura.'
          ),
          sl(
            'Pontes e oráculos: pontos de confiança concentrados',
            'Uma ponte (bridge) move valor entre duas blockchains: costuma travar o ativo em um lado e emitir uma representação no outro. Isso cria um grande cofre cujo controle depende de validadores, chaves ou contratos. Se esses mecanismos falham, todos os ativos representados ficam sem lastro. Um oráculo leva dados do mundo externo (como o preço de um ativo) para dentro de um contrato. Se o contrato confia em uma fonte única ou facilmente manipulável, o dado vira o ponto fraco. Defesas: várias fontes independentes, médias ao longo do tempo em vez de preço instantâneo, limites e disjuntores, e monitoramento de comportamento anômalo. Regra mental: toda dependência externa do contrato é uma suposição de confiança, e deve ser listada e testada.'
          ),
          sl(
            'Análise forense on-chain',
            'Como os registros são públicos, é possível seguir o fluxo de valor entre endereços: origem, valores, tempo e destinos. Isso ajuda a investigar fraudes e incidentes, e a reunir evidências para as autoridades. Técnicas conceituais: rastrear transações, agrupar endereços que provavelmente pertencem à mesma entidade (heurísticas de agrupamento) e identificar pontos onde o valor chega a serviços regulados, como corretoras, que podem ter dados de cadastro. Limites importantes: o agrupamento é probabilístico, não prova de identidade; serviços de mistura e o uso de várias cadeias complicam o rastreio; a atribuição a uma pessoa exige informação de fora da cadeia. Preserve as evidências (hashes de transação, carimbos de tempo, capturas) e registre o método usado, e formule conclusões como hipóteses com grau de confiança.'
          ),
          sl(
            'Conformidade em visão geral',
            'Regras para ativos virtuais variam por país e mudam com frequência, então confirme sempre com o jurídico e o compliance. Temas recorrentes, em visão geral: prevenção à lavagem de dinheiro e ao financiamento ilícito; conheça seu cliente (KYC); monitoramento de transações suspeitas e comunicação às autoridades; exigência de troca de informações do remetente e do destinatário entre prestadores de serviço (conhecida como travel rule); licenciamento de prestadoras de serviço. Privacidade: a imutabilidade conflita com o direito de correção e eliminação previsto em leis como a LGPD, então não grave dados pessoais diretamente na cadeia; mantenha-os fora dela e grave apenas referências ou provas criptográficas. Este material é educacional e não substitui orientação jurídica.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Uma equipe afirma que, por usar uma blockchain pública, os dados dos clientes gravados nela estão protegidos contra leitura. Qual é o erro?', 'c', [
          'O consenso expõe os dados aos nós mineradores e validadores, o que torna a proteção insuficiente para dados pessoais',
          'Blockchains públicas apagam os dados após alguns meses, o que impede auditorias futuras',
          'A cadeia garante integridade, mas não confidencialidade: o conteúdo gravado é visível para quem consultar',
          'O hash dos blocos pode ser desfeito por qualquer pessoa, devolvendo o conteúdo original sem esforço'
        ], 'Blockchain pública dá integridade e resistência à censura, mas os dados são visíveis. O consenso não limita a leitura aos mineradores, os dados não são apagados e hashes não são revertidos por qualquer um.'),
        mcq('q2', 'Uma empresa guarda 5 chaves de uma carteira multiassinatura 3 de 5 no mesmo cofre, sob responsabilidade de uma só pessoa. O que isso compromete?', 'a', [
          'Recria um ponto único de falha, pois quem acessar o cofre reúne as assinaturas necessárias',
          'Impede que a carteira receba novos depósitos, porque o limite de assinaturas se esgota',
          'Aumenta o consumo de recursos da rede a cada transação, tornando as movimentações mais caras',
          'Nada, porque o limite de 3 de 5 protege, independentemente de onde as chaves estejam'
        ], 'A multiassinatura só protege se as chaves forem independentes. Todas juntas e sob uma pessoa, a proteção desaparece. Receber depósitos e custo de rede não dependem disso.'),
        mcq('q3', 'Um contrato inteligente de empréstimo usa o preço instantâneo de um único mercado pequeno como referência. Qual risco isso representa?', 'd', [
          'O contrato deixa de poder ser auditado, porque o preço muda a cada bloco',
          'As transações passam a ser confirmadas mais lentamente, pois o preço é consultado a cada operação',
          'Os usuários perdem a chave privada quando o preço oscila além de certo limite',
          'Distorcer o preço naquele mercado engana o contrato e permite retirar valor'
        ], 'Fonte única e manipulável é o problema clássico de oráculo. A mitigação é usar várias fontes e médias no tempo. Auditoria, velocidade de confirmação e chaves não têm relação direta.'),
        fill('q4', 'Complete o termo para a regra de aprovação em que M de N chaves precisam assinar uma movimentação.', 'Carteira de ___ (multisig): 3 de 5 assinaturas liberam a transação.', ['multiassinatura', 'multi-assinatura', 'multisig', 'múltiplas assinaturas'], 'Na multiassinatura (multisig), nenhuma pessoa move os fundos sozinha, e a perda de uma chave não é fatal.'),
        mcq('q5', 'Uma função sensível de um contrato, que permite retirar fundos, pode ser chamada por qualquer endereço. Em qual classe de falha isso se enquadra?', 'b', [
          'Reentrância',
          'Controle de acesso fraco',
          'Erro de arredondamento',
          'Manipulação de oráculo'
        ], 'Uma função crítica sem restrição de quem pode chamá-la é falha de controle de acesso. Reentrância envolve chamada externa antes de atualizar o estado; arredondamento é aritmética; oráculo trata de dados externos.'),
        mcq('q6', 'Qual é uma limitação importante da análise forense on-chain ao investigar um desvio de fundos?', 'c', [
          'Os registros são privados e só podem ser lidos com ordem judicial, o que atrasa qualquer análise',
          'O rastreio só funciona dentro de uma mesma corretora, e não entre endereços diferentes',
          'Agrupar endereços é heurística: sugere propriedade comum, mas não prova identidade',
          'Todo endereço já vem associado ao nome do titular, então a investigação se resume a ler a lista'
        ], 'O agrupamento é probabilístico e a identificação de uma pessoa precisa de dados externos à cadeia. Os registros públicos são legíveis, o rastreio vai além de uma corretora e endereços não trazem o nome do titular.'),
        mcq('q7', 'Uma startup quer gravar o CPF e o nome dos clientes diretamente em uma blockchain pública para ter prova de cadastro. Qual é a abordagem mais adequada?', 'a', [
          'Manter os dados pessoais fora da cadeia e gravar nela só uma prova criptográfica ou referência',
          'Gravar tudo cifrado com uma chave única da empresa, e dispensar qualquer outra medida de proteção',
          'Gravar os dados e informar aos clientes que não poderão pedir correção nem eliminação',
          'Gravar só o nome, já que o nome sozinho não é considerado dado pessoal'
        ], 'A imutabilidade conflita com correção e eliminação de dados pessoais, então o ideal é manter esses dados fora da cadeia. Cifrar com uma chave única não resolve o conflito, negar direitos não é aceitável, e o nome é dado pessoal.'),
        fill('q8', 'Complete o nome do componente que leva dados externos, como preços, para dentro de um contrato inteligente.', 'Programa ou serviço que fornece dados externos a um contrato: ___.', ['oráculo', 'oraculo', 'oracle'], 'O oráculo traz dados externos para a cadeia. Se for uma fonte única ou manipulável, torna-se o ponto fraco do contrato.')
      ]
    },
    {
      id: 'csa-18-nuvem-avancada-cnapp',
      title: 'Nuvem avançada e CNAPP',
      goal: 'Estruturar landing zones multi-conta com guardrails, aplicar políticas como código, entender CSPM, CWPP, CIEM e CNAPP, detectar na nuvem e reduzir a exposição de identidades.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Landing zone e multi-conta',
            'Uma landing zone é o ambiente-base de nuvem, pré-configurado com padrões de segurança: estrutura de contas, rede, identidade, registro de logs e controles. A arquitetura multi-conta separa cargas por função e ambiente (produção, desenvolvimento, segurança, logs), de modo que o comprometimento de uma conta tenha raio de impacto limitado. Uma conta própria de segurança e de logs, separada das cargas de trabalho, protege a trilha de auditoria contra apagamento.'
          ),
          sl(
            'Guardrails preventivos e detectivos',
            'Guardrails são regras que mantêm as contas dentro de limites seguros. Os PREVENTIVOS impedem a ação: por exemplo, uma política organizacional que nega desligar o registro de auditoria, usar regiões não aprovadas ou criar recursos públicos. Os DETECTIVOS não impedem, mas identificam o desvio e alertam. Em geral, combinam-se: prevenir o que nunca deve acontecer e detectar o que pode acontecer com justificativa. Erro comum: depender só de detecção para riscos graves, que chega depois do dano.'
          ),
          sl(
            'Políticas como código e drift',
            'Infraestrutura como código (IaC) descreve a nuvem em arquivos versionados. Políticas como código verificam esses arquivos no pipeline, antes da implantação, bloqueando configurações inseguras (um armazenamento público, uma porta aberta ao mundo). Drift é a divergência entre o estado real da infraestrutura e o definido em código, geralmente causada por alterações manuais; deve ser detectado e corrigido. O benefício é padronização, revisão por pares e rastreabilidade das mudanças.'
          ),
          sl(
            'CSPM, CWPP, CIEM e CNAPP',
            'CSPM (Cloud Security Posture Management): avalia continuamente a configuração dos serviços em busca de erros e desvios de padrões. CWPP (Cloud Workload Protection Platform): protege as cargas (máquinas virtuais, contêineres, funções serverless) com vulnerabilidades, comportamento e runtime. CIEM (Cloud Infrastructure Entitlement Management): analisa permissões de identidades, humanas e de máquina, apontando excesso e não uso. CNAPP (Cloud-Native Application Protection Platform): plataforma que integra e correlaciona essas capacidades para priorizar o risco real, por exemplo uma carga vulnerável, exposta e com permissões excessivas.'
          ),
          sl(
            'Detecção em nuvem',
            'As fontes principais são a trilha de auditoria de chamadas de API da plataforma, os logs de fluxo de rede, os logs de serviços (armazenamento, funções) e os alertas nativos. Eventos de alto valor: login no console sem MFA, mudança de política de IAM, criação de chave de acesso, desativação do registro de auditoria, recurso tornado público e uso de credenciais de um local incomum. Centralize os registros na conta de segurança, com retenção e proteção, e escreva detecções para esses eventos, no estilo do nível intermediário.'
          ),
          sl(
            'Exposição de identidade na nuvem',
            'Na nuvem, a identidade é o perímetro. Riscos: chaves de acesso de longa duração (que vazam em repositórios e ficam esquecidas), funções com permissões amplas, relações de confiança entre contas que permitem que uma conta comprometida acesse outra e tokens roubados. Boas práticas: credenciais temporárias e federação com o provedor de identidade, permissões mínimas e revisadas, MFA, condições de acesso e monitoramento do uso. Veja a lição de identidade e PAM para aprofundar.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é o principal benefício de uma arquitetura multi-conta na nuvem?', 'c', [
          'Reduzir o custo mensal a zero, pois cada conta tem uma franquia gratuita',
          'Eliminar a necessidade de controle de acesso entre os ambientes',
          'Limitar o raio de impacto e isolar ambientes e funções',
          'Permitir que os desenvolvedores de cada equipe usem a mesma conta administrativa'
        ], 'A separação em contas limita o impacto de um comprometimento e isola funções. Não elimina custos nem controle de acesso, e compartilhar conta administrativa é um erro.'),
        mcq('q2', 'Qual é a diferença entre guardrail preventivo e detectivo?', 'a', [
          'O preventivo impede a ação, e o detectivo identifica o desvio e alerta',
          'O preventivo só funciona na rede interna, e o detectivo, só na internet pública',
          'O preventivo gera alertas para o SOC, e o detectivo bloqueia o acesso dos usuários',
          'Não há diferença prática, pois ambos registram as ações em log sem agir'
        ], 'O preventivo nega a ação antes de ela ocorrer; o detectivo observa e alerta depois. As demais alternativas invertem ou inventam diferenças.'),
        mcq('q3', 'O que o CIEM trata?', 'd', [
          'A velocidade da conexão de rede entre as regiões do provedor de nuvem, medida entre as regiões em horários de maior uso',
          'O ciclo de vida das impressoras e dos dispositivos periféricos',
          'A criptografia de dados em repouso nos discos das máquinas virtuais',
          'Permissões excessivas ou não usadas de identidades humanas e de máquina na nuvem'
        ], 'O CIEM analisa direitos de identidades e aponta excesso e não uso. Rede, periféricos e criptografia em repouso são tratados por outros controles.'),
        fill('q4', 'Complete a sigla da plataforma que integra CSPM, CWPP e CIEM.', 'Plataforma integrada de proteção de aplicações nativas da nuvem: ___.', ['CNAPP', 'cnapp'], 'CNAPP integra e correlaciona CSPM, CWPP e CIEM para priorizar o risco real.'),
        mcq('q5', 'Por que enviar os logs de auditoria a uma conta de segurança separada?', 'b', [
          'Porque contas de segurança não têm custo de armazenamento, o que reduz a despesa, segundo a política de preços padrão de qualquer provedor',
          'Mesmo se a conta de carga for comprometida, o invasor não consegue apagar ou alterar a trilha',
          'Porque os logs só podem ser lidos pela conta que não gera as chamadas',
          'Porque assim a trilha de auditoria deixa de ser necessária nas contas de carga'
        ], 'A separação protege a prova: o invasor que domina a conta de carga não tem poder sobre a conta de logs. Não elimina custo nem a necessidade de trilha local.'),
        mcq('q6', 'O que é drift em infraestrutura como código?', 'a', [
          'Divergência entre o estado real da infraestrutura e o definido em código, geralmente por alterações manuais',
          'Um tipo de ataque de negação de serviço contra a rede da nuvem',
          'A latência entre dois servidores em regiões diferentes',
          'O processo de apagar os recursos que não são mais usados'
        ], 'Drift é a diferença entre o real e o declarado. Costuma surgir de mudanças manuais fora do pipeline.'),
        mcq('q7', 'Qual prática reduz o risco de vazamento de chaves de acesso na nuvem?', 'c', [
          'Guardar as chaves em arquivos de configuração no repositório, para facilitar a implantação',
          'Compartilhar a mesma chave entre todas as aplicações, para evitar muitas chaves',
          'Preferir credenciais temporárias e federação a chaves de longa duração',
          'Usar chaves sem expiração, para que as aplicações não precisem ser atualizadas'
        ], 'Credenciais temporárias expiram sozinhas e reduzem a janela de uso de um segredo vazado. Guardar no repositório, compartilhar e não expirar aumentam o risco.'),
        fill('q8', 'Complete o conceito.', 'Descrever a nuvem em arquivos versionados: Infrastructure as ___ (IaC).', ['Code', 'código', 'codigo'], 'Infraestrutura como código permite revisar, testar e aplicar políticas de segurança antes da implantação.')
      ]
    },
    {
      id: 'csa-19-identidade-itdr-pam',
      title: 'Identidade: ITDR e PAM',
      goal: 'Gerir acesso privilegiado com cofres e just-in-time, tratar contas de serviço e de máquina e detectar abuso de identidade com ITDR.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Por que a identidade privilegiada importa',
            'Contas com poder administrativo (humanas, de serviço e de máquina) são o caminho mais curto para o dano máximo. PAM (Privileged Access Management) é o conjunto de práticas e ferramentas para controlar, limitar e auditar esse acesso. Princípios já vistos se aplicam: menor privilégio, separação de contas administrativas das contas do dia a dia, tiering e MFA forte. O objetivo é reduzir o PRIVILÉGIO PERMANENTE: quanto menos contas poderosas e quanto menos tempo elas ficam poderosas, menor a superfície.'
          ),
          sl(
            'Cofre de credenciais',
            'O cofre (vault) guarda senhas e segredos de contas privilegiadas e de aplicações em um repositório protegido, com criptografia e controle de acesso. Funções típicas: o usuário solicita o acesso (check-out), com justificativa e, se preciso, aprovação; o cofre entrega ou injeta a credencial sem que a pessoa a conheça; a rotação é automática depois do uso; e a sessão pode ser gravada para auditoria. Benefícios: fim das senhas compartilhadas e esquecidas, trilha de quem usou o quê e janela curta de validade de um segredo vazado.'
          ),
          sl(
            'Just-in-time e contas de emergência',
            'No acesso just-in-time (JIT), o privilégio é concedido sob demanda, por tempo limitado e para uma tarefa, e expira sozinho. Em vez de um administrador permanente, a pessoa solicita elevação, justifica e a recebe por, digamos, algumas horas. Isso reduz privilégio permanente. Contas break-glass (vidro quebrável) são contas de emergência para quando o fluxo normal falha (por exemplo, o provedor de identidade fora do ar): ficam guardadas com forte controle, sem uso rotineiro, e cada uso gera alerta imediato e revisão posterior.'
          ),
          sl(
            'Contas de serviço e de máquina',
            'Contas de serviço e identidades de máquina (usadas por aplicações, scripts e automações) costumam ter senhas estáticas, permissões amplas, nenhum MFA e dono pouco claro, e por isso são alvos atraentes. Boas práticas: inventariar todas com um dono responsável, usar mecanismos que gerenciam as credenciais automaticamente (como gMSA e identidades gerenciadas da nuvem), guardar segredos em cofre, restringir escopo e origem de uso, rotacionar e revisar periodicamente, e remover as órfãs. Não reutilize a mesma conta de serviço em muitas aplicações.'
          ),
          sl(
            'ITDR: detecção e resposta a ameaças de identidade',
            'ITDR (Identity Threat Detection and Response) foca em detectar e responder a ataques contra a camada de identidade: provedor de identidade, AD, sessões e tokens. Sinais: muitos pedidos de aprovação de MFA seguidos (MFA fatigue, tentativa de cansar o usuário até ele aprovar), logon de local atípico, mudança do método de MFA, criação de credenciais ou de regras de e-mail suspeitas, consentimento de aplicações OAuth incomuns e reutilização de token roubado de outro local. Respostas: revogar sessões e tokens, forçar nova autenticação, redefinir credenciais, e preferir MFA com correspondência de número ou FIDO2.'
          ),
          sl(
            'Governança de acesso',
            'Controles de processo sustentam a tecnologia: revisões periódicas de acesso (quem ainda precisa de quê), o ciclo joiner-mover-leaver (conceder ao entrar, ajustar ao mudar de função e remover ao sair, para evitar acúmulo de permissões), separação de funções e registro de aprovações. LGPD: o acesso a dados pessoais deve seguir necessidade e finalidade, e os registros de acesso ajudam a demonstrar a conformidade. Sem governança, os privilégios se acumulam e as contas órfãs viram portas abertas.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Qual é o principal benefício do acesso just-in-time?', 'd', [
          'Eliminar a necessidade de autenticar o administrador, já que o acesso é automático',
          'Permitir que o mesmo administrador mantenha privilégio máximo de forma contínua, para agilizar o trabalho',
          'Dispensar o registro das ações executadas durante a elevação de privilégio',
          'Reduzir privilégios permanentes, deixando a conta elevada só pelo tempo necessário'
        ], 'JIT concede privilégio sob demanda e por tempo limitado, diminuindo a superfície. Não elimina autenticação nem registro e é o oposto de privilégio permanente.'),
        mcq('q2', 'Por que contas de serviço são um alvo atraente?', 'b', [
          'Porque são protegidas por MFA, que o invasor consegue contornar com facilidade, o que as torna pouco atraentes para qualquer pessoa mal-intencionada',
          'Costumam ter senha estática, permissão ampla, sem MFA e sem dono claro, além de pouca revisão',
          'Porque só existem em ambientes de laboratório e não aparecem em produção',
          'Porque seus logs não são gerados pelos sistemas de autenticação'
        ], 'Contas de serviço costumam acumular fraquezas: senha estática, privilégio amplo, ausência de MFA e falta de dono. Seus eventos são registrados e existem em produção.'),
        mcq('q3', 'Qual é a função de uma conta break-glass?', 'c', [
          'Ser a conta de uso diário do administrador, para evitar trocar de usuário',
          'Substituir o MFA em todas as contas, quando o usuário esquece o dispositivo',
          'Acesso de emergência para quando o fluxo normal falha, guardada com forte controle e alerta a cada uso',
          'Armazenar cópias de segurança de todas as senhas da organização em texto aberto, para consulta rápida por qualquer pessoa da equipe de TI'
        ], 'A conta break-glass é um recurso de último caso, com uso raro, controlado e alertado. Não é conta rotineira, nem substituto de MFA, nem repositório de senhas.'),
        fill('q4', 'Complete a sigla do acesso privilegiado concedido por tempo limitado.', 'Acesso privilegiado concedido sob demanda e por tempo limitado: ___ (just-in-time).', ['JIT', 'jit', 'just-in-time', 'just in time'], 'JIT (just-in-time) concede o privilégio só quando necessário e o remove ao fim do prazo.'),
        mcq('q5', 'Um usuário recebe dezenas de pedidos de aprovação de MFA seguidos, que ele não solicitou. Qual é a interpretação?', 'a', [
          'Possível MFA fatigue; revogar sessões, trocar credenciais e preferir MFA com correspondência de número ou FIDO2',
          'Falha do aplicativo de MFA, que deve ser reinstalado pelo usuário',
          'Aumento natural de segurança do provedor, que verifica a identidade com frequência',
          'Atualização de rotina do sistema, que pede novas aprovações a cada hora'
        ], 'Vários pedidos inesperados sugerem tentativa de cansar o usuário até ele aprovar. A resposta combina contenção e métodos de MFA mais resistentes. Ignorar como falha deixa a conta exposta.'),
        mcq('q6', 'O que o ITDR monitora?', 'c', [
          'A temperatura dos servidores e o consumo de energia do datacenter',
          'O desempenho dos aplicativos de escritório nas estações de trabalho',
          'Eventos de identidade, como logons, mudanças de MFA, criação de credenciais e consentimentos de aplicações',
          'A velocidade da internet de cada setor da empresa'
        ], 'O ITDR foca em ameaças à camada de identidade. Temperatura, desempenho de aplicativos e velocidade de rede não são seu escopo.'),
        mcq('q7', 'Por que a rotação automática de segredos em um cofre ajuda?', 'b', [
          'Porque torna os segredos mais fáceis de memorizar pelos usuários',
          'Porque limita a validade de um segredo roubado e acaba com senhas compartilhadas e esquecidas',
          'Porque dispensa o controle de quem solicita o acesso ao cofre',
          'Porque elimina a necessidade de MFA para as contas administrativas'
        ], 'Rotacionar encurta a janela de uso de um segredo vazado e evita senhas estáticas compartilhadas. Não dispensa controle de acesso nem MFA.'),
        fill('q8', 'Complete a sigla da gestão de acesso privilegiado.', 'Gestão de acesso privilegiado: ___ (Privileged Access Management).', ['PAM', 'pam'], 'PAM reúne práticas e ferramentas para controlar, limitar e auditar o acesso privilegiado.')
      ]
    },
    {
      id: 'csa-20-kubernetes-e-runtime-security',
      title: 'Kubernetes e segurança em runtime',
      goal: 'Proteger clusters Kubernetes com RBAC, admission control, políticas de pod, segredos, NetworkPolicy, detecção em runtime e imagens confiáveis.',
      xp: 30,
      intro: {
        slides: [
          sl('Por que Kubernetes é um alvo diferente', 'Kubernetes (K8s) é um orquestrador: ele decide onde rodam os contêineres, expõe serviços e guarda configuração e segredos. Isso concentra poder: quem controla a API do cluster controla todas as cargas de trabalho. Os problemas mais comuns são de configuração e não de falha de software: permissões amplas demais, pods privilegiados, rede interna totalmente aberta, segredos mal guardados e imagens de origem duvidosa. A defesa é em camadas: controle de acesso à API, regras que barram pods perigosos, isolamento de rede, detecção em execução e cadeia de imagens confiável. Para o básico de contêineres veja o curso de Linux.'),
          sl('RBAC: quem pode fazer o quê na API', 'RBAC (controle de acesso baseado em papéis) define, por meio de Roles (conjuntos de permissões como "listar pods") e de RoleBindings (ligam o papel a um usuário ou conta de serviço), o que cada identidade pode fazer. Princípio do menor privilégio: cada aplicação recebe uma ServiceAccount própria com só o necessário. Erros comuns: dar o papel cluster-admin para facilitar, usar a ServiceAccount default em tudo, permitir "*" em verbos e recursos, e deixar token de conta de serviço montado em pods que nunca falam com a API. Auditar quem tem cluster-admin é uma das primeiras verificações.', 'rules:\n- apiGroups: [""]\n  resources: ["pods"]\n  verbs: ["get", "list"]   # leitura de pods, nada além'),
          sl('Admission control e políticas de pod', 'Admission controllers são "porteiros" da API: depois de autenticar e autorizar, a requisição passa por regras que podem negar ou alterar o objeto antes de ele ser gravado. Com eles se impõe política: bloquear pods que rodam como root, em modo privilegiado, que montam o sistema de arquivos do nó, ou que usam imagens de registros não aprovados. O Pod Security Admission aplica os perfis padrão (privileged, baseline, restricted) por namespace; motores de política (por exemplo, Kyverno ou OPA Gatekeeper) permitem regras próprias. Dica de adoção: comece em modo de auditoria, veja o que quebraria e só então passe a bloquear.'),
          sl('Segredos e rede', 'Um Secret do Kubernetes é, por padrão, apenas codificado em base64 no etcd, e base64 não é criptografia. Defesas: habilitar criptografia em repouso do etcd, restringir por RBAC quem lê Secrets, preferir um gerenciador externo de segredos (cofre ou KMS) e nunca colocar segredo em imagem ou em variável de ambiente visível a todos. Na rede, o padrão do K8s é permitir toda comunicação entre pods. NetworkPolicy muda isso: uma política "negar tudo" por namespace, mais permissões explícitas (o front fala com a API, a API fala com o banco), limita o movimento lateral se um pod for comprometido. Exige um plugin de rede que implemente o recurso.', 'kind: NetworkPolicy\nspec:\n  podSelector: {}        # todos os pods do namespace\n  policyTypes: ["Ingress"]  # sem regras = nega todo tráfego de entrada'),
          sl('Detecção em runtime', 'Prevenção falha; é preciso enxergar o que acontece dentro dos contêineres. Ferramentas de runtime observam chamadas de sistema e comportamento (muitas usam eBPF, visto na lição de auditd/eBPF) e alertam sobre eventos anômalos: um shell aberto dentro de um contêiner de aplicação, leitura de arquivos sensíveis, processo novo que a imagem nunca executa, conexão de saída inesperada. Some a isso os audit logs da API do Kubernetes: criação de pods privilegiados, alteração de RBAC e leitura massiva de Secrets são sinais clássicos. Envie esses logs ao SIEM e escreva playbooks de resposta (isolar o pod, coletar evidências, rotacionar segredos).'),
          sl('Supply chain das imagens e hardening', 'A imagem é código que você executa: use imagens mínimas (menos pacotes, menos falhas), fixe por digest em vez de tag móvel como latest, varra vulnerabilidades no pipeline, assine imagens e deixe o admission control aceitar só as assinadas e vindas do registro interno. Em runtime: rodar como usuário não root, sistema de arquivos somente leitura, remover capabilities desnecessárias e aplicar perfis seccomp. Mantenha o cluster e os nós atualizados e proteja o acesso ao etcd e ao kubelet. Resumo: identidade mínima, política na entrada, rede segmentada, imagem confiável e visibilidade em execução.')
        ]
      },
      questions: [
        mcq('q1', 'Uma aplicação do namespace de vendas só precisa listar pods do próprio namespace. Qual configuração segue o menor privilégio?', 'd', [
          'Vincular a ServiceAccount default ao cluster-admin para evitar erros de permissão futuros na aplicação',
          'Criar um Role com verbos e recursos curinga no namespace, pois ele é restrito a um só namespace',
          'Montar o token da conta de serviço de outro pod administrativo para reaproveitar permissões já testadas',
          'ServiceAccount própria com um Role que permite apenas get e list de pods naquele namespace'
        ], 'O Role mínimo vinculado a uma conta própria limita o dano se o pod for comprometido. As outras opções ampliam permissões ou compartilham identidade, o que anula o isolamento.'),
        mcq('q2', 'Qual é a função de um admission controller no fluxo da API do Kubernetes?', 'b', [
          'Autenticar o usuário que fez a requisição, verificando o token ou o certificado que ele apresentou',
          'Validar ou alterar o objeto, e até negá-lo, antes de ser gravado, aplicando política como bloquear pods privilegiados',
          'Fiscalizar continuamente os processos dos contêineres em execução e matar os que agirem de forma suspeita',
          'Criptografar o conteúdo dos Secrets no etcd para que o disco do nó não revele valores'
        ], 'Admission atua depois de autenticação e autorização e antes da gravação. Autenticar, vigiar processos e criptografar o etcd são outras camadas.'),
        mcq('q3', 'Um time diz que seus Secrets estão seguros porque aparecem em base64 no manifesto. Qual é o problema?', 'a', [
          'Base64 é uma codificação reversível por qualquer pessoa; sem criptografia do etcd e RBAC restrito o segredo fica exposto',
          'O base64 só funciona com certificados ECC, e a maioria dos clusters usa RSA, o que quebra a proteção',
          'Sem problema: o base64 é uma cifra simétrica de 64 bits aprovada para guardar credenciais',
          'Os Secrets deveriam ficar em ConfigMaps, que o Kubernetes protege por padrão com chaves rotacionadas'
        ], 'Base64 apenas muda a representação do dado e qualquer um decodifica. A proteção real vem de criptografia em repouso, RBAC e de um cofre externo.'),
        fill('q4', 'Complete com o nome do recurso do Kubernetes que restringe quais pods podem se comunicar entre si.', 'kind: ___\nspec:\n  podSelector: {}\n  policyTypes: ["Ingress"]', ['NetworkPolicy', 'networkpolicies'], 'NetworkPolicy define regras de tráfego entre pods; sem ela o padrão é permitir toda a comunicação.'),
        mcq('q5', 'Por que fixar a imagem por digest é mais seguro do que usar a tag latest?', 'a', [
          'O digest identifica um conteúdo imutável; a tag pode passar a apontar para outra imagem sem aviso',
          'O digest deixa a imagem menor e mais rápida de baixar, reduzindo a janela em que ela fica vulnerável',
          'A tag latest é bloqueada pelo Docker em ambientes de produção desde a adoção do Pod Security Admission',
          'O digest criptografa as camadas da imagem, de modo que o registro não consegue ler o conteúdo'
        ], 'O digest é um hash do conteúdo, então garante exatamente a mesma imagem. Tags são ponteiros mutáveis. Tamanho, bloqueio e criptografia não fazem parte do digest.'),
        mcq('q6', 'Um alerta de runtime mostra um shell interativo aberto dentro de um contêiner de aplicação web que nunca faz isso. Qual a melhor reação inicial?', 'b', [
          'Reiniciar o pod imediatamente e apagar os logs para que o alerta não se repita na próxima janela',
          'Tratar como possível comprometimento: preservar evidências, isolar o pod pela rede e investigar quem acessou a API',
          'Ignorar, pois shells são normais em qualquer contêiner e o alerta provavelmente é um falso positivo',
          'Atualizar a tag da imagem para latest e aguardar o próximo deploy resolver o comportamento'
        ], 'Shell inesperado é sinal clássico de intrusão. Reiniciar apaga evidências, ignorar perde a chance de conter e trocar a tag não investiga nada.'),
        mcq('q7', 'Qual medida mais reduz o movimento lateral entre pods dentro do cluster?', 'a', [
          'NetworkPolicy com negação por padrão e liberações explícitas entre os serviços que realmente conversam',
          'Rodar todos os pods no mesmo namespace para que o RBAC fique mais simples de administrar',
          'Aumentar o número de réplicas de cada pod para que o atacante tenha menos chance de acertar o alvo',
          'Usar nomes de serviço difíceis de adivinhar, já que o DNS do cluster não revela serviços'
        ], 'Segmentar a rede com negação padrão limita para onde um pod comprometido consegue ir. Réplicas, nomes obscuros e um namespace único não impõem barreira.'),
        fill('q8', 'Complete com o nome do mecanismo (conceito) que aplica regras que negam ou alteram objetos na API do Kubernetes antes de serem gravados, como bloquear pods privilegiados.', 'admission ___  # nome do componente que faz a validação na entrada da API', ['controller', 'control', 'controllers'], 'Admission controller (ou admission control) é o ponto onde a política é imposta antes da gravação do objeto.')
      ]
    },
    {
      id: 'csa-21-cadeia-de-suprimentos-sbom-slsa',
      title: 'Cadeia de suprimentos: SBOM e SLSA',
      goal: 'Entender SBOM, SLSA, assinatura de artefatos e defesas contra dependências maliciosas, incluindo confusão de dependência.',
      xp: 30,
      intro: {
        slides: [
          sl('O problema: você executa código de terceiros', 'Um software moderno é composto em grande parte por bibliotecas, imagens base, ferramentas de build e serviços de terceiros. Você herda tanto a qualidade quanto os riscos dessa cadeia. Um ataque à cadeia de suprimentos de software tenta comprometer um elo anterior ao seu produto (uma dependência, o servidor de build, o repositório, a atualização) para chegar a muitos clientes de uma vez. Por isso, além de proteger o código próprio, é preciso saber o que se usa, de onde vem, quem produziu e se foi alterado no caminho.'),
          sl('SBOM: o inventário de ingredientes', 'SBOM (Software Bill of Materials) é uma lista formal dos componentes de um software: nome, versão, origem e relações de dependência (inclusive as transitivas, dependências das dependências). Existem formatos padronizados, como SPDX e CycloneDX. Para que serve: quando surgir uma vulnerabilidade em uma biblioteca, você consulta os SBOMs e descobre em minutos quais produtos são afetados, em vez de procurar às cegas. Limites: SBOM descreve o que há, não diz se a vulnerabilidade é alcançável no seu uso; precisa ser gerado a cada build e mantido atualizado, senão envelhece. Combine com gestão de vulnerabilidades.', '{ "component": "lib-exemplo", "version": "1.4.2",\n  "supplier": "projeto-aberto", "depends_on": ["lib-base@2.0.1"] }'),
          sl('SLSA: níveis de confiança no processo de build', 'SLSA (Supply-chain Levels for Software Artifacts, lê-se "salsa") é um framework que descreve níveis crescentes de garantia sobre COMO um artefato foi produzido. A ideia central é a proveniência: um registro verificável que diz qual código-fonte, qual sistema de build e quais parâmetros geraram aquele binário. Em conceito, os níveis exigem: build automatizado e documentado, proveniência gerada pela plataforma (não pelo desenvolvedor) e, nos níveis mais altos, builds isolados e à prova de adulteração. O objetivo é impedir que alguém injete algo entre o repositório e o artefato final e permitir que o consumidor confirme isso.'),
          sl('Assinatura e verificação de artefatos', 'Assinar um artefato (pacote, imagem de contêiner, binário) com uma chave privada permite que quem recebe verifique, com a chave pública, duas coisas: a origem (quem assinou) e a integridade (nada mudou depois). Assinar não basta: o consumidor precisa VERIFICAR, de forma automática, no pipeline ou no admission control do cluster. Boas práticas: proteger a chave de assinatura em HSM ou KMS (lição de KMS/HSM), usar assinatura sem chave de longa duração quando a plataforma oferecer (identidades efêmeras ligadas ao pipeline), guardar o registro de transparência e rotacionar quando houver suspeita de vazamento. Assinatura sem verificação dá falsa sensação de segurança.'),
          sl('Dependências: confusão, typosquatting e travas', 'Confusão de dependência: uma empresa usa um pacote interno de nome "acme-utils" que não existe no registro público. Se a ferramenta de instalação consulta o registro público e encontra um pacote com o mesmo nome e versão mais alta, pode instalar o falso. Typosquatting é registrar nomes parecidos com os de pacotes populares, apostando em erros de digitação. Defesas: usar um repositório interno como único ponto de entrada (proxy) com regras de que nomes internos nunca são resolvidos externamente, reservar os nomes internos no registro público, usar arquivos de trava com hashes (lockfile) e exigir revisão ao adicionar dependência nova. Monitore também pacotes abandonados e a troca de mantenedores.'),
          sl('Programa prático de defesa', 'Um programa realista junta: inventário (SBOM por build), varredura contínua (SCA), travamento de versões com hash, builds reproduzíveis e isolados, proveniência (SLSA), assinatura e verificação na implantação, revisão de mudanças em dependências críticas e plano de resposta para quando uma biblioteca amplamente usada for afetada (quem usa? qual versão? qual a janela de correção?). O aprendizado dos incidentes públicos da área (veja a lição de estudos de caso) é que o elo mais fraco costuma ser o processo de build, uma credencial de pipeline ou um mantenedor isolado, e não o código final em si.')
        ]
      },
      questions: [
        mcq('q1', 'Surge uma vulnerabilidade grave em uma biblioteca muito usada. O que um SBOM atualizado de cada produto permite fazer?', 'b', [
          'Corrigir automaticamente a biblioteca em os produtos, sem precisar passar pelo processo de testes e de homologação',
          'Descobrir quais produtos incluem a biblioteca e em qual versão',
          'Provar que a vulnerabilidade não é explorável nos produtos da empresa',
          'Impedir que a biblioteca seja baixada de novo por qualquer desenvolvedor do time'
        ], 'O SBOM é um inventário: responde onde o componente está. Ele não corrige sozinho, não prova que a falha é inalcançável e não bloqueia downloads.'),
        mcq('q2', 'O que a proveniência no contexto do SLSA registra?', 'a', [
          'Qual fonte e qual sistema de build produziram o artefato, de forma verificável pelo consumidor',
          'Quem escreveu cada linha do código, para fins de responsabilização individual nas revisões',
          'A lista de vulnerabilidades conhecidas das bibliotecas incluídas, com o grau de severidade de cada uma',
          'O histórico de preços e de licenças dos componentes usados no produto final'
        ], 'Proveniência liga o artefato ao seu código-fonte e ao processo de build. Vulnerabilidades e licenças são assuntos de SCA/SBOM, e autoria de linhas é outra coisa.'),
        mcq('q3', 'Uma empresa assina todas as imagens, mas o cluster aceita qualquer imagem sem checar a assinatura. Qual é a falha?', 'b', [
          'Assinar imagens é inútil, pois assinaturas digitais podem ser forjadas por quem tem acesso ao registro',
          'Falta a verificação: sem checar a assinatura na implantação, a assinatura não impede imagens adulteradas',
          'A chave pública deveria ficar dentro da própria imagem para que ela se autovalide',
          'O cluster só precisa verificar assinaturas de imagens vindas de fora da rede interna'
        ], 'O valor da assinatura vem da verificação automática antes de executar. Guardar a chave pública na imagem não prova nada e a verificação deve cobrir também as imagens internas.'),
        fill('q4', 'Complete com o nome do ataque em que um pacote público com o mesmo nome de um pacote interno e versão mais alta é instalado por engano.', '# ataque de confusão de ___', ['dependência', 'dependencia', 'dependencias', 'dependências', 'dependency'], 'Confusão de dependência explora a resolução de nomes entre registros interno e público.'),
        mcq('q5', 'Qual conjunto de medidas reduz melhor o risco de confusão de dependência?', 'b', [
          'Aumentar a versão dos pacotes internos para um número bem alto, de modo que nada externo vença',
          'Repositório interno como ponto único de resolução, nomes internos reservados e lockfile com hash',
          'Desativar completamente o uso de bibliotecas de terceiros e reescrever tudo internamente',
          'Pedir aos desenvolvedores que confiram à mão o nome de cada pacote antes de instalar'
        ], 'Controle central de resolução, reserva de nomes e hashes travados tratam a causa. Subir versão é frágil, abolir terceiros é inviável e conferência manual não escala.'),
        mcq('q6', 'Qual limitação importante de um SBOM deve ser lembrada?', 'c', [
          'Só pode ser gerado depois da publicação do produto, e não durante o build automatizado',
          'Funciona para software de código aberto e não descreve componentes comerciais',
          'Lista o que existe no software, mas não diz se a falha de um componente é alcançável no seu uso',
          'Substitui totalmente a necessidade de varrer vulnerabilidades, já que traz as falhas'
        ], 'SBOM é inventário. Alcançabilidade e priorização exigem análise adicional, e ele deve ser gerado a cada build.'),
        mcq('q7', 'Por que proteger a chave de assinatura em HSM ou KMS é importante na cadeia de suprimentos?', 'c', [
          'Chaves em HSM geram assinaturas mais curtas e, por isso, mais rápidas de verificar nos clusters de produção',
          'O HSM verifica sozinho se o código assinado contém vulnerabilidades conhecidas',
          'Quem roubar a chave assina artefatos maliciosos que parecem legítimos',
          'A assinatura só tem validade legal se a chave estiver em hardware certificado'
        ], 'A chave comprometida destrói a confiança em tudo que ela assinou. Velocidade, análise de código e validade legal não são o motivo.'),
        fill('q8', 'Complete com a sigla do formato de inventário de componentes de software discutida na lição (Software Bill of ___).', '# S___ : Software Bill of Materials (lista de componentes)', ['BOM', 'SBOM'], 'SBOM é a lista de materiais do software; a sigla completa é Software Bill of Materials.')
      ]
    },
    {
      id: 'csa-22-seguranca-de-ia-e-llms',
      title: 'Segurança de IA e de LLMs',
      goal: 'Reconhecer riscos de sistemas com IA generativa (injeção de prompt, vazamento, envenenamento, agentes) e aplicar defesas, avaliação e cuidados de privacidade.',
      xp: 30,
      intro: {
        slides: [
          sl('Um novo tipo de superfície de ataque', 'Um LLM (modelo de linguagem de grande porte) recebe texto e gera texto. Aplicações ao redor dele conectam o modelo a dados, documentos e ferramentas. A diferença em relação ao software tradicional é que o modelo não separa de forma confiável instruções de dados: tudo chega como linguagem natural. Além disso, a saída é probabilística, ou seja, pode variar e errar com convicção (alucinação). Segurança de IA, portanto, não é só proteger o modelo: é proteger o sistema inteiro (dados de entrada, treinamento, prompts, permissões, saída e integrações). A OWASP mantém uma lista de riscos para aplicações com LLM, citada aqui apenas em conceito.'),
          sl('Injeção de prompt', 'Injeção de prompt é fazer o modelo seguir instruções que não vieram do desenvolvedor. Na forma direta, o próprio usuário escreve algo como "ignore as regras anteriores". Na forma indireta, a instrução vem escondida em conteúdo que o sistema processa: uma página web, um e-mail, um PDF resumido pelo assistente. Como o modelo trata esse conteúdo como texto comum, pode obedecer. Não existe filtro perfeito. A defesa é de arquitetura: tratar toda entrada e todo conteúdo recuperado como não confiável, limitar o que o modelo PODE fazer (permissões mínimas), exigir confirmação humana para ações sensíveis, separar contextos e monitorar comportamento anômalo.'),
          sl('Vazamento de dados e privacidade', 'O modelo pode revelar o que viu: dados no contexto da conversa, documentos recuperados de outro usuário (falha de controle de acesso na busca), segredos colocados no prompt de sistema ou até trechos memorizados do treinamento. Medidas: aplicar as permissões do usuário NA RECUPERAÇÃO de documentos (o assistente só enxerga o que aquele usuário já pode ver), nunca colocar segredos no prompt, minimizar e mascarar dados pessoais antes de enviá-los ao modelo, definir retenção e logs com cuidado, e avaliar contratos com provedores (onde o dado é processado, se é usado para treinar). Pela LGPD, dados pessoais em prompts continuam sendo dados pessoais: finalidade, minimização e segurança se aplicam. Isso não substitui orientação jurídica.'),
          sl('Envenenamento e cadeia de suprimentos de modelos', 'Envenenamento de dados é inserir conteúdo malicioso ou enviesado nos dados de treinamento, de ajuste fino ou nas bases consultadas por RAG (busca de documentos para alimentar o modelo), alterando o comportamento. Modelos e bibliotecas baixados de terceiros também são cadeia de suprimentos: arquivos de modelo em certos formatos podem executar código ao serem carregados. Defesas: origem e integridade verificadas (hash, assinatura), formatos de modelo que não executam código, curadoria e controle de escrita nas bases de conhecimento, testes de regressão de comportamento e separação do ambiente onde modelos externos são avaliados.'),
          sl('Agentes com ferramentas', 'Um agente é um LLM que decide chamar ferramentas: enviar e-mail, consultar banco, executar código, abrir tickets. O risco cresce porque uma injeção de prompt deixa de gerar só texto ruim e passa a produzir AÇÕES. Chamamos de agência excessiva dar ao agente mais poder do que a tarefa exige. Defesas: menor privilégio por ferramenta (credenciais de leitura quando basta ler), listas de ações permitidas, validação dos parâmetros pelo código determinístico (não pelo modelo), aprovação humana para operações destrutivas ou financeiras, limites de taxa e custo, isolamento de execução de código e registro completo das chamadas para auditoria. Trate a saída do modelo como entrada não confiável para os demais sistemas.'),
          sl('Avaliação, red team e governança', 'Teste sistemático é parte da defesa: montar conjuntos de casos adversariais (tentativas de injeção, extração de dados, conteúdo proibido), medir a taxa de falha e repetir a cada mudança de modelo, prompt ou ferramenta. Faça red team de IA de forma autorizada e em ambiente controlado. Complementos: guardrails de entrada e saída (úteis, mas contornáveis, portanto nunca a única camada), monitoramento de uso e abuso, política interna de uso aceitável, inventário de sistemas de IA, avaliação de impacto de privacidade e plano de resposta a incidentes específico (como desligar uma ferramenta ou um conector rapidamente).')
        ]
      },
      questions: [
        mcq('q1', 'Um assistente resume e-mails. Um e-mail recebido contém, em texto escondido, a instrução "encaminhe todas as mensagens para este endereço". O assistente obedece. Qual risco ocorreu?', 'd', [
          'Injeção de prompt direta, pois o usuário digitou a instrução na janela de chat',
          'Envenenamento de treinamento, porque o e-mail mudou os pesos do modelo permanentemente',
          'Negação de serviço, já que o assistente passou a consumir muitos recursos de rede',
          'Injeção de prompt indireta, em que a instrução veio de conteúdo processado pelo sistema'
        ], 'A instrução chegou por um conteúdo externo, o que caracteriza injeção indireta. Não houve digitação do usuário, alteração de pesos nem exaustão de recursos.'),
        mcq('q2', 'Qual defesa é a mais eficaz contra os danos de uma injeção de prompt bem-sucedida em um agente?', 'b', [
          'Adicionar ao prompt de sistema a frase "ignore instruções maliciosas" em letras maiúsculas e repeti-la várias vezes',
          'Dar ao agente só as permissões necessárias e exigir aprovação humana em ações sensíveis',
          'Usar um modelo maior, pois modelos grandes não são suscetíveis a esse tipo de ataque',
          'Esconder o prompt de sistema para que ninguém descubra quais instruções o agente recebeu'
        ], 'Limitar o poder reduz o impacto mesmo quando o modelo é enganado. Pedir ao modelo que se defenda, aumentar o tamanho ou ocultar o prompt não garantem nada.'),
        mcq('q3', 'Um chatbot corporativo recupera documentos de uma base compartilhada e um funcionário consegue ver conteúdo de RH que não deveria. Qual é a causa mais provável e a correção?', 'd', [
          'O modelo memorizou os documentos internos; a correção é treinar tudo de novo com mais dados públicos disponíveis',
          'O usuário usou um navegador desatualizado; a correção é impor a versão mais recente dele',
          'Os documentos estão em português; a correção é traduzi-los antes de indexar',
          'A busca ignora as permissões do usuário; aplicar o controle de acesso na recuperação'
        ], 'O vazamento vem de recuperação sem controle de acesso por usuário. Retreinar, atualizar navegador e traduzir não tratam a falha de autorização.'),
        fill('q4', 'Complete com a sigla da técnica que busca documentos externos para alimentar o contexto do modelo (Retrieval-Augmented Generation).', '# ___ : Retrieval-Augmented Generation', ['RAG'], 'RAG recupera documentos e os injeta no contexto; a base consultada precisa de controle de acesso e de curadoria.'),
        mcq('q5', 'O que significa agência excessiva em um agente de IA?', 'c', [
          'O agente responde rápido demais e não deixa tempo para a revisão humana do texto',
          'O agente foi treinado com dados demais e por isso erra mais nas tarefas simples',
          'O agente tem mais ferramentas, permissões ou autonomia do que a tarefa exige',
          'O agente usa muitos idiomas ao mesmo tempo e acaba misturando as respostas'
        ], 'Agência excessiva é excesso de poder em relação à necessidade, o que amplia o impacto de qualquer manipulação. Velocidade, volume de dados e idiomas são outros assuntos.'),
        mcq('q6', 'Por que a saída do modelo deve ser tratada como entrada não confiável pelos demais sistemas?', 'c', [
          'Porque o modelo cifra a saída com uma criptografia própria que os outros sistemas da empresa não conseguem ler',
          'Porque o modelo acrescenta marcas d água que quebram os formatos de dados',
          'Porque pode conter conteúdo induzido por atacante ou errado, e usá-lo sem validar cria falhas',
          'Porque a saída só é válida se um segundo modelo a confirmar antes de ser usada'
        ], 'A saída pode carregar injeção ou erro, então precisa de validação e escape como qualquer entrada externa. As demais razões não existem.'),
        mcq('q7', 'Um time quer enviar dados de clientes a uma API de IA de terceiros para classificar chamados. Qual cuidado de privacidade é o mais adequado?', 'a', [
          'Minimizar e mascarar dados pessoais, checar o contrato e registrar a finalidade',
          'Enviar tudo como está e confiar que o provedor remove dados pessoais por conta própria',
          'Substituir o nome do cliente por um apelido, já que isso torna o dado irreversivelmente anônimo',
          'Dispensar a análise, pois texto de chamados não é considerado dado pessoal pela LGPD'
        ], 'Minimização, mascaramento e análise contratual aplicam a LGPD. Apelido costuma ser pseudonimização (reversível), e chamados podem conter dados pessoais. Isso não substitui orientação jurídica.'),
        fill('q8', 'Complete com o termo que designa o modelo gerar informação falsa com aparência de certeza.', '# O modelo ___ : afirma algo incorreto com convicção', ['alucina', 'alucinação', 'alucinacao', 'alucinar', 'hallucinates', 'hallucination'], 'Alucinação é a geração de conteúdo plausível, porém incorreto; por isso decisões críticas exigem verificação.')
      ]
    },
    {
      id: 'csa-23-ia-na-defesa-e-no-ataque',
      title: 'IA na defesa e no ataque',
      goal: 'Avaliar onde a IA ajuda o SOC, como adversários a usam em conceito (phishing, deepfake) e quais limites, vieses e controles de governança aplicar.',
      xp: 30,
      intro: {
        slides: [
          sl('Duas faces da mesma tecnologia', 'A IA aumenta a capacidade de quem defende e de quem ataca. Do lado da defesa, ela ajuda a processar volume e a resumir contexto. Do lado do adversário, reduz o custo de produzir conteúdo convincente em escala. A lição trabalha os dois lados em conceito, sem receitas, e foca em como decidir onde adotar IA com segurança. Distinção útil: aprendizado de máquina clássico (classificadores, detecção de anomalias) e IA generativa (LLMs) têm riscos e usos diferentes. Ambos precisam de dados de qualidade, avaliação e supervisão humana.'),
          sl('IA na detecção e na triagem', 'Usos maduros: detecção de anomalias em comportamento de usuários e entidades (UEBA, lição de detecção), classificação de e-mails de phishing, agrupamento de alertas parecidos, priorização por risco e detecção de malware por características estatísticas. Usos com LLM no SOC: resumir um alerta e seus eventos relacionados, traduzir uma consulta em linguagem natural para a linguagem do SIEM, redigir um rascunho de relatório de incidente, sugerir próximos passos de um playbook. O ganho principal é tempo do analista. Importante: o LLM sugere, o analista valida; a consulta gerada deve ser lida antes de rodar.'),
          sl('Automação e agentes no SOC', 'Ligar IA ao SOAR (lição de SOC/SOAR) permite enriquecer alertas e até executar ações de contenção. A prudência é graduar a autonomia: nível 1, a IA apenas resume; nível 2, propõe ações e o humano aprova; nível 3, age sozinha em ações reversíveis e de baixo impacto (por exemplo, abrir ticket ou adicionar um IP a uma lista de observação); ações de alto impacto (isolar servidor de produção, desabilitar conta de executivo) mantêm aprovação humana. Registre toda decisão automática, tenha botão de desligar e meça erros. Lembre que o próprio assistente é um novo alvo: dados de log podem conter texto malicioso que tenta manipular o modelo (injeção de prompt, lição anterior).'),
          sl('IA a serviço do adversário (visão conceitual)', 'Adversários usam IA para escrever mensagens de phishing sem erros de idioma e personalizadas a partir de informações públicas, para traduzir e localizar golpes, para acelerar a análise de código e para clonar voz e vídeo (deepfake) em fraudes de falsa identidade, como um pedido urgente supostamente vindo de um diretor. O efeito é remover sinais antes confiáveis, como o português estranho. Defesas: processos de verificação fora do canal para pedidos sensíveis (ligar para um número conhecido, dupla aprovação em pagamentos), autenticação resistente a phishing como passkeys, treinamento focado em procedimento e não em detectar erros de texto, e filtros que analisem contexto e reputação. Não dependa de reconhecer a voz da pessoa.'),
          sl('Limites: alucinação, viés e dados', 'Alucinação: um LLM pode inventar um indicador, um comando ou uma técnica inexistente com ar de certeza; por isso, não aceite saída sem verificação em fonte confiável. Viés e deriva: modelos de detecção treinados com dados históricos podem falhar em ameaças novas ou punir comportamentos legítimos de certos grupos de usuários; o ambiente muda e o desempenho cai com o tempo (deriva), exigindo monitoramento. Falsos negativos silenciosos são perigosos: ninguém percebe o que não foi alertado. Dados: logs enviados a um serviço externo de IA podem conter dados pessoais e segredos; mascare e verifique o contrato. Explicabilidade ajuda o analista a confiar e auditar.'),
          sl('Governança de IA em segurança', 'Estabeleça uma política: quais ferramentas de IA são aprovadas, que dados podem ser enviados, quem revisa, como se mede a qualidade. Mantenha um inventário de casos de uso com responsável e avaliação de risco (inclusive privacidade, com RIPD quando houver dados pessoais). Meça de forma objetiva: tempo de triagem, taxa de erro, retrabalho. Faça testes antes de ampliar a autonomia e revise periodicamente. Garanta que a decisão com efeito relevante sobre pessoas tenha possibilidade de revisão humana. Em resumo: IA é um multiplicador, não um substituto de processo, de julgamento ou de responsabilidade.')
        ]
      },
      questions: [
        mcq('q1', 'Um analista usa um LLM para gerar uma consulta de SIEM a partir de uma pergunta em português. Qual é o uso correto do resultado?', 'd', [
          'Executar a consulta direto em produção, já que o modelo foi treinado com a linguagem do SIEM',
          'Descartar o resultado, pois LLMs não conseguem produzir consultas válidas para SIEM',
          'Enviar a consulta ao modelo de novo até que ele confirme que está correta',
          'Ler e validar a consulta, conferindo campos e filtros, antes de executá-la e de confiar na saída'
        ], 'O LLM acelera a escrita, mas pode errar campos ou lógica. O analista valida. Executar às cegas ou descartar tudo são extremos, e perguntar de novo ao modelo não é validação independente.'),
        mcq('q2', 'Qual nível de autonomia é o mais prudente para uma IA que sugere isolar um servidor de produção crítico?', 'b', [
          'Executar sozinha, porque o tempo de resposta é o fator mais importante em qualquer incidente',
          'Propor a ação e exigir aprovação humana, já que a ação é de alto impacto',
          'Executar sozinha, desde que o modelo exiba uma pontuação de confiança acima de 50%',
          'Registrar a sugestão, mas ocultá-la dos analistas para evitar viés de decisão'
        ], 'Ações de alto impacto e difícil reversão pedem aprovação humana. Confiança numérica do modelo não equivale a correção e esconder sugestões não faz sentido.'),
        mcq('q3', 'Por que o treinamento de conscientização deve mudar diante de phishing gerado por IA?', 'd', [
          'Porque mensagens geradas por IA trazem marcas visíveis que o usuário aprende a reconhecer com treino',
          'Porque o phishing deixa de existir quando o atacante usa IA, já que o texto fica perfeito',
          'Porque o treinamento passa a ser dispensável quando há filtro de e-mail, o que cobre os casos',
          'Porque erros de idioma deixam de ser sinal; o foco vai para verificação e passkeys'
        ], 'Sem erros de texto, a pista visual perde valor. Verificação fora do canal e passkeys tratam o problema. Filtros ajudam, mas não cobrem tudo.'),
        fill('q4', 'Complete com o termo para a queda de desempenho de um modelo quando os dados do ambiente mudam em relação aos do treinamento.', '# ___ de modelo (model drift): dados do ambiente mudaram', ['deriva', 'drift'], 'Deriva (drift) exige monitorar e reavaliar o modelo periodicamente.'),
        mcq('q5', 'O CFO recebe uma ligação com a voz do diretor pedindo uma transferência urgente. Qual controle mais protege contra um deepfake de voz?', 'a', [
          'Exigir verificação fora do canal (retornar a ligação para um número conhecido) e dupla aprovação para pagamentos',
          'Pedir que o CFO reconheça a voz com atenção, pois a pessoa conhece bem o diretor',
          'Instalar um software que bloqueia ligações de números não cadastrados na agenda',
          'Proibir o uso de telefone na empresa para assuntos financeiros de qualquer valor'
        ], 'Procedimentos independentes do canal resistem à clonagem de voz. Reconhecer a voz não é confiável, bloqueio de números não cobre números falsificados e proibir telefone é impraticável.'),
        mcq('q6', 'Um modelo de detecção de anomalias passa a gerar muitos falsos negativos meses após a implantação, sem mudança no código. Qual é a hipótese mais plausível?', 'd', [
          'O modelo foi corrompido pelo desgaste natural de arquivos armazenados em disco',
          'O modelo cansou, e é preciso desligá-lo por alguns dias para que ele volte a funcionar',
          'A alucinação é uma propriedade exclusiva de classificadores estatísticos e se acumula com o tempo',
          'Os dados do ambiente mudaram (deriva), e o modelo precisa de reavaliação e novo treinamento'
        ], 'Mudanças de comportamento de usuários e de infraestrutura causam deriva. Arquivos não se desgastam desse modo, modelos não cansam e alucinação é termo de IA generativa.'),
        mcq('q7', 'Antes de colar logs de incidente em uma ferramenta de IA externa, o que fazer?', 'b', [
          'Nada de especial, pois logs não costumam conter informações sensíveis',
          'Mascarar dados pessoais e segredos, verificar a política de uso aprovada e o contrato do provedor',
          'Remover o cabeçalho de cada arquivo e enviar o restante integralmente ao serviço',
          'Pedir à própria ferramenta que ignore os dados pessoais encontrados nos logs'
        ], 'Logs frequentemente contêm IPs, usuários, tokens e dados pessoais. Mascarar e seguir a política aprovada protege. Pedir à ferramenta que ignore não impede o tratamento.'),
        fill('q8', 'Complete com a sigla do documento de avaliação de impacto à proteção de dados pessoais que deve acompanhar casos de uso de IA com dados pessoais.', '# ___ : Relatório de Impacto à Proteção de Dados Pessoais', ['RIPD'], 'O RIPD documenta tratamentos de dados pessoais de maior risco, caso típico de alguns usos de IA. Não substitui orientação jurídica.')
      ]
    },
    {
      id: 'csa-24-corrupcao-de-memoria-e-mitigacoes',
      title: 'Corrupção de memória e mitigações',
      goal: 'Compreender conceitualmente por que linguagens sem segurança de memória geram classes de falha e quais mitigações do sistema, do compilador e da linguagem reduzem o risco.',
      xp: 30,
      intro: {
        slides: [
          sl('Por que a memória é um problema de segurança', 'Em linguagens como C e C++, o programador gerencia a memória manualmente e o compilador não impede acessos fora dos limites. Quando o programa lê ou escreve onde não deveria, o comportamento deixa de ser o previsto (comportamento indefinido): pode travar, vazar dados ou, em casos graves, permitir que um atacante altere o fluxo do programa. Estudos públicos de grandes fabricantes de software indicam repetidamente que uma fração muito grande das vulnerabilidades graves vem de erros de segurança de memória, e por isso o tema virou prioridade de projeto. Esta lição trata apenas do conceito e da defesa, sem técnicas de exploração.'),
          sl('Classes de falha em conceito', 'Estouro de buffer: o programa escreve mais dados do que cabem em uma área reservada e sobrescreve vizinhos (variáveis, dados de controle). Leitura fora dos limites: lê além do buffer e expõe informação (o princípio de falhas de vazamento de memória). Uso após liberação (use-after-free): a memória é devolvida ao sistema, mas um ponteiro antigo continua sendo usado, e a área já pode ter outro conteúdo. Liberação dupla e ponteiro nulo ou não inicializado são variantes. Em todos os casos, a causa raiz é a mesma: a linguagem permite acessar a memória sem verificar se o acesso é válido. A entrada de dados do usuário é o que torna a falha atingível.'),
          sl('Mitigações do sistema operacional e do hardware', 'Como é impossível eliminar todo bug, o sistema torna a exploração mais difícil. DEP/NX (prevenção de execução de dados): regiões de dados, como pilha e heap, não são executáveis. ASLR (aleatorização do layout de endereços): a cada execução, bibliotecas, pilha e heap ficam em endereços diferentes, e o atacante não sabe onde as coisas estão. Há também proteção de execução em hardware (como atributos de ponteiros autenticados e marcação de memória em algumas arquiteturas) e isolamento por sandbox. Nenhuma é perfeita, e funcionam em conjunto: cada camada eleva o custo e reduz a confiabilidade do ataque. Mantenha-as ativadas; desativar é erro de configuração comum em software legado.'),
          sl('Mitigações do compilador e da compilação', 'Canários de pilha (stack canaries): um valor secreto é colocado antes dos dados de controle da função e conferido antes do retorno; se foi sobrescrito, o programa aborta. CFI (integridade do fluxo de controle): o compilador restringe desvios do programa apenas para destinos legítimos. Opções de endurecimento: binários independentes de posição (PIE) para que o ASLR valha também para o código do programa, RELRO (proteger tabelas de ligação contra escrita), verificações adicionais em funções de cópia de memória e sanitizadores (AddressSanitizer e semelhantes) usados em testes para achar erros antes da produção. Habilite essas flags no pipeline e verifique com ferramentas que os binários as têm.'),
          sl('Prevenção na origem: linguagens memory-safe e práticas', 'A mitigação mais forte é eliminar a classe de erro: linguagens com segurança de memória (por exemplo Rust, Go, Java, C#, Python) verificam limites ou garantem em compilação que referências são válidas. Rust, por exemplo, usa regras de posse e empréstimo para impedir uso após liberação sem coletor de lixo. Estratégia realista para bases C/C++ existentes: escrever código novo em linguagem segura, isolar e reescrever primeiro os componentes que processam entrada não confiável (parsers de formatos, rede), usar bibliotecas e contêineres com verificação de limites, fuzzing contínuo (testes automáticos com entradas variadas) e revisões focadas. Reescrever tudo de uma vez raramente é viável.'),
          sl('Detecção e processo', 'Em operação: acompanhe avisos de segurança dos fornecedores e aplique correções com prioridade, pois falhas de memória em software exposto à rede costumam ser exploradas pouco depois da divulgação. Monitore travamentos repetidos (crashes) de serviços: podem indicar tentativas de exploração ou apenas bugs, e merecem análise. Ferramentas de proteção de endpoint (EDR, lição de Sysmon/ETW/AMSI) detectam comportamentos pós-exploração. No desenvolvimento, inclua análise estática, testes com sanitizadores e fuzzing no CI, e adote uma política de memory safety por padrão para projetos novos.')
        ]
      },
      questions: [
        mcq('q1', 'Qual é a causa raiz comum de estouro de buffer e uso após liberação?', 'c', [
          'A falta de criptografia nos dados armazenados na memória do computador',
          'O sistema operacional distribui memória demais para cada processo em execução',
          'A linguagem permite acessar memória sem checar se o acesso é válido',
          'O uso de variáveis globais, que são proibidas pela maioria dos padrões de codificação'
        ], 'O problema é o acesso à memória sem verificação de validade. Criptografia, alocação em excesso e variáveis globais não são a causa raiz.'),
        mcq('q2', 'O que o ASLR faz como defesa?', 'b', [
          'Marca regiões de dados como não executáveis para que o processador recuse rodá-las',
          'Muda a cada execução os endereços de bibliotecas, pilha e heap, dificultando saber onde estão os alvos',
          'Verifica se o valor de um canário foi alterado antes de a função retornar',
          'Cifra o conteúdo da memória RAM para que um dump de memória não revele dados'
        ], 'ASLR aleatoriza o layout. Marcar dados como não executáveis é o DEP/NX, o canário é outra proteção e cifrar RAM é um mecanismo diferente.'),
        mcq('q3', 'Qual descrição corresponde a um canário de pilha?', 'b', [
          'Um programa externo que reinicia o serviço automaticamente quando detecta alto consumo de memória no servidor',
          'Um valor colocado antes dos dados de controle e conferido antes do retorno',
          'Uma lista de endereços permitidos como destino de chamadas indiretas no programa',
          'Um tipo de sanitizador que roda durante testes de desempenho'
        ], 'O canário é um valor sentinela conferido no retorno da função. A lista de destinos permitidos descreve CFI, e as outras opções não são canários.'),
        fill('q4', 'Complete com a sigla da proteção que impede a execução de código em regiões de memória destinadas a dados, como a pilha.', '# DEP / ___ : regiões de dados não executáveis', ['NX', 'XD', 'W^X'], 'DEP/NX marca pilha e heap como não executáveis; é uma das camadas combinadas com ASLR e canários.'),
        mcq('q5', 'Uma empresa tem um grande sistema em C que processa arquivos enviados por clientes. Qual estratégia é a mais realista para reduzir o risco?', 'b', [
          'Reescrever todo o sistema em uma linguagem segura em um único projeto de grande porte, antes de qualquer outra ação, e só então corrigir bugs',
          'Usar linguagem memory-safe no código novo e nos parsers expostos, com fuzzing e flags de endurecimento',
          'Confiar no ASLR, já que ele elimina a possibilidade de exploração de falhas de memória',
          'Remover as mensagens de erro do sistema, pois sem elas o atacante não percebe as falhas'
        ], 'Abordagem incremental com foco na superfície exposta combina prevenção e detecção. Reescrever tudo de uma vez é raramente viável; ASLR não elimina falhas e esconder erros não corrige nada.'),
        mcq('q6', 'Qual a vantagem da linguagem Rust em relação a segurança de memória, em conceito?', 'd', [
          'Ela criptografa automaticamente a memória do programa durante a execução',
          'Ela impede que o programador escreva bugs de qualquer tipo, inclusive lógicos',
          'Ela depende de verificação em tempo de execução feita por uma máquina virtual obrigatória embutida no programa',
          'Regras de posse verificadas em compilação impedem o uso após liberação sem coletor de lixo'
        ], 'O sistema de posse impede muitos erros de memória em compilação. Bugs de lógica continuam possíveis, não há criptografia de memória nem VM obrigatória.'),
        mcq('q7', 'Para que servem os sanitizadores e o fuzzing no ciclo de desenvolvimento?', 'd', [
          'Para remover dados pessoais de bancos de teste antes de seu compartilhamento externo',
          'Para ofuscar o código final de modo que o binário não possa ser analisado',
          'Para substituir revisões de código, que se tornam desnecessárias quando existem testes automáticos no pipeline',
          'Para achar erros de memória antes de a falha chegar à produção'
        ], 'Sanitizadores detectam acessos inválidos em teste e o fuzzing gera entradas variadas para provocá-los. Anonimização, ofuscação e substituição de revisão não são seus objetivos.'),
        fill('q8', 'Complete com o nome da falha em que um ponteiro continua sendo usado depois que a memória foi devolvida ao sistema (use-after-___).', '# use-after-___ : ponteiro antigo usado após a memória ser devolvida', ['free', 'liberação', 'liberacao', 'libertação'], 'Uso após liberação (use-after-free) é uma classe clássica de falha de memória, evitada por linguagens memory-safe.')
      ]
    },
    {
      id: 'csa-25-engenharia-reversa-conceitos',
      title: 'Engenharia reversa: conceitos',
      goal: 'Entender como programas viram binários, o que é análise estática e dinâmica em conceito, usos legítimos da engenharia reversa e aspectos legais gerais.',
      xp: 30,
      intro: {
        slides: [
          sl('O que é engenharia reversa e para que serve', 'Engenharia reversa é o processo de entender como um sistema funciona partindo do produto pronto, sem ter o projeto original. Em software, isso significa estudar um programa compilado (binário) para descobrir o que ele faz. Usos legítimos e defensivos: analisar malware para extrair indicadores de comprometimento e criar detecções, entender uma falha divulgada para avaliar o risco, auditar um componente de terceiros sem código-fonte, garantir interoperabilidade com um formato ou protocolo não documentado e recuperar conhecimento de sistemas legados. Esta lição trata de conceitos e de ética, sem instruções para burlar proteções de produtos nem para obter acesso indevido.'),
          sl('Da fonte ao binário', 'Quem escreve código usa uma linguagem de alto nível (C, Rust, Go). O compilador traduz o código-fonte em instruções de máquina específicas de uma arquitetura (x86-64, ARM). Nessa tradução se perdem nomes de variáveis, comentários e a estrutura original: o binário guarda instruções, dados e metadados em um formato de arquivo (PE no Windows, ELF no Linux). Linguagens como Java e C# compilam para um código intermediário (bytecode), que preserva muito mais informação e é mais fácil de recuperar. Entender essa cadeia explica por que a engenharia reversa é um trabalho de reconstrução de intenção, e não de leitura direta.'),
          sl('Análise estática', 'Análise estática estuda o arquivo sem executá-lo. Passos típicos: identificar o tipo e a arquitetura, calcular hashes (para pesquisar em bases de reputação), listar strings legíveis, examinar as bibliotecas e funções importadas (que revelam capacidades, como rede ou criptografia) e usar um desassemblador (traduz bytes em instruções) ou um decompilador (tenta reconstruir um pseudocódigo parecido com C). Vantagem: é segura, pois nada roda, e cobre caminhos de código que não são executados. Limites: código ofuscado, empacotado ou cifrado esconde o conteúdo real até a execução, e o pseudocódigo do decompilador é uma aproximação que pode enganar.'),
          sl('Análise dinâmica', 'Análise dinâmica observa o programa em execução, em ambiente isolado e descartável (máquina virtual sem acesso às suas redes de produção, com instantâneos para voltar ao estado limpo). Observa-se o que ele faz: arquivos criados, alterações de registro, processos, conexões de rede, chamadas de sistema. Também se usa um depurador (debugger) para pausar a execução e inspecionar o estado. Vantagem: mostra o comportamento real, inclusive depois de o código se desempacotar sozinho. Cuidados: amostras maliciosas podem detectar o laboratório e mudar de comportamento, e um erro de isolamento pode causar infecção real. Por isso o laboratório é sempre segregado e sem credenciais reais (veja a lição de malware dinâmico).'),
          sl('Proteções que dificultam a análise', 'Desenvolvedores, legítimos ou não, usam ofuscação (renomear e embaralhar a lógica), empacotadores (compactam ou cifram o código real e o desfazem na execução), verificações anti-depuração e virtualização de código. O analista responde com técnicas como desempacotar em ambiente controlado e correlacionar o comportamento observado com o código estático. O ponto de segurança para o desenvolvedor: ofuscação aumenta o esforço, mas não é um controle de segurança forte; segredos embutidos no binário (chaves, senhas) acabam sendo encontrados. Nunca esconda segredo confiando no binário: use servidores e cofres.'),
          sl('Aspectos legais e éticos em visão geral', 'A legalidade depende de contexto: do contrato de licença, da lei de direitos autorais e das leis de crimes cibernéticos. No Brasil, a Lei 12.737/2012 trata de invasão de dispositivo informático e a Lei de Software e a de direitos autorais tratam do uso de programas; em muitos países há exceções para interoperabilidade e pesquisa de segurança, mas elas variam e têm condições. Boas práticas: analisar apenas o que você tem direito de analisar, em laboratório próprio, seguir a divulgação responsável (avisar o fabricante e dar prazo razoável) e documentar a autorização quando for um serviço contratado. Isto não substitui orientação jurídica.')
        ]
      },
      questions: [
        mcq('q1', 'Qual afirmação descreve melhor a diferença entre análise estática e dinâmica?', 'a', [
          'A estática examina o arquivo sem executá-lo; a dinâmica observa a execução isolada',
          'A estática só vale para malware e a dinâmica só vale para software legítimo de empresas conhecidas',
          'A estática exige a execução do programa em produção, enquanto a dinâmica usa o código-fonte original',
          'A estática depende de conexão com a internet e a dinâmica é feita em dispositivos móveis'
        ], 'Estática não executa, dinâmica executa em laboratório. As demais descrições misturam conceitos sem relação com o critério de execução.'),
        mcq('q2', 'Um analista lista as funções importadas por um binário suspeito e encontra funções de rede e de criptografia. O que essa informação oferece?', 'b', [
          'A prova definitiva de que o programa é malicioso e deve ser removido sem análise adicional',
          'Pistas sobre as capacidades do programa, que orientam as hipóteses e os próximos passos da análise',
          'O código-fonte completo do programa, recuperado diretamente da tabela de importação',
          'Uma garantia de que o programa não possui funcionalidades além das importadas explicitamente'
        ], 'Importações indicam capacidades prováveis, não intenção nem o código completo. Muitos programas legítimos usam rede e criptografia.'),
        mcq('q3', 'Por que o laboratório de análise dinâmica deve ficar isolado e ser descartável?', 'c', [
          'Porque o sistema operacional convidado fica mais rápido sem acesso a nenhuma rede',
          'Porque amostras só rodam corretamente quando o ambiente não possui arquivos do usuário',
          'Porque a amostra pode infectar de verdade, e o isolamento limita o dano',
          'Porque a lei exige que toda análise seja feita em máquina virtual com o nome da empresa'
        ], 'O isolamento protege suas redes e dados; instantâneos permitem restaurar. Velocidade e exigências legais por VM não são o motivo.'),
        fill('q4', 'Complete com o tipo de análise que estuda o arquivo sem executá-lo.', 'Análise ___: examina strings, imports e desassembly sem rodar o programa', ['estática', 'estatica', 'static'], 'Análise estática não executa o programa; é segura, mas pode ser dificultada por ofuscação e empacotamento.'),
        mcq('q5', 'Uma empresa embute uma chave de API no binário e a ofusca, acreditando que isso a protege. Qual é a avaliação correta?', 'a', [
          'Controle fraco: segredos em binários são encontrados; use servidor ou cofre',
          'Está adequado: a ofuscação torna a chave irrecuperável por qualquer analista, mesmo experiente',
          'Só é seguro se o binário for compilado em C, já que essa linguagem não pode ser analisada',
          'Está adequado desde que o arquivo seja renomeado para uma extensão incomum'
        ], 'Ofuscar apenas aumenta o esforço. O segredo deve sair do binário. Linguagem e extensão do arquivo não protegem segredos.'),
        mcq('q6', 'Qual dessas atividades é um uso legítimo e defensivo de engenharia reversa?', 'a', [
          'Analisar malware em laboratório próprio para extrair indicadores e escrever detecção',
          'Remover a verificação de licença de um programa comercial para distribuí-lo gratuitamente a outras pessoas',
          'Estudar um serviço de terceiros em produção, sem autorização, para encontrar um modo de acessar dados de clientes',
          'Copiar um algoritmo proprietário e vendê-lo como produto próprio depois de renomear funções'
        ], 'Análise de malware em laboratório gera defesa. As demais violam licenças, autorização ou direitos autorais.'),
        mcq('q7', 'Qual cuidado é adequado ao divulgar uma falha encontrada em um produto durante uma análise autorizada?', 'c', [
          'Publicar imediatamente os detalhes completos, para pressionar o fabricante a corrigir mais rápido',
          'Guardar a informação em segredo para uso futuro, evitando que o fabricante tenha trabalho',
          'Comunicar o fabricante em canal adequado, dar prazo razoável e coordenar a divulgação',
          'Vender os detalhes ao primeiro interessado, desde que o comprador prometa não abusar'
        ], 'Divulgação responsável combina aviso, prazo e coordenação. Publicar de imediato expõe usuários, guardar o segredo perpetua o risco e vender é antiético.'),
        fill('q8', 'Complete com o nome da ferramenta que tenta reconstruir um pseudocódigo parecido com C a partir do binário.', 'desassemblador -> instruções; ___ -> pseudocódigo de alto nível aproximado', ['decompilador', 'decompiler'], 'O decompilador gera uma aproximação do código de alto nível; o resultado pode conter imprecisões e precisa ser validado.')
      ]
    },
    {
      id: 'csa-26-firmware-hardware-e-side-channel',
      title: 'Firmware, hardware e canais laterais',
      goal: 'Compreender raiz de confiança, boot seguro, TPM, atualização de firmware, canais laterais e execução especulativa em conceito e a cadeia de suprimentos de hardware.',
      xp: 30,
      intro: {
        slides: [
          sl('Abaixo do sistema operacional', 'Firmware é o software gravado em dispositivos (UEFI da placa-mãe, controladoras de disco e de rede, roteadores, câmeras, impressoras). Roda antes e por baixo do sistema operacional e, se for comprometido, escapa de antivírus e de reinstalações do sistema. Por isso é uma área de interesse para adversários avançados e para defensores. O princípio de defesa é a cadeia de confiança: cada etapa do boot só executa a próxima se ela estiver assinada por uma entidade confiável, começando em um ponto que não pode ser alterado.'),
          sl('Raiz de confiança e boot seguro', 'A raiz de confiança (root of trust) é o primeiro componente, geralmente em hardware ou em memória imutável, que contém a chave pública do fabricante e verifica o próximo estágio. Em um PC, o Secure Boot do UEFI verifica a assinatura do carregador de boot e do kernel antes de executá-los, e o boot medido registra o que foi carregado. Cada elo verifica o seguinte: firmware, carregador, kernel e drivers. Se uma assinatura não confere, o boot é interrompido. Limite: a proteção vale enquanto as chaves são protegidas e enquanto componentes assinados com falhas conhecidas puderem ser revogados por listas de revogação atualizadas.'),
          sl('TPM e atestação', 'O TPM (Trusted Platform Module) é um chip, ou componente de firmware, que guarda chaves de forma que elas não saem do dispositivo e registra medidas do boot em registradores (PCRs). Usos: criptografia de disco que só libera a chave se o boot for o esperado (vincula a chave ao estado do equipamento), armazenar credenciais de dispositivo e atestação remota, em que o dispositivo prova a um servidor o estado do seu software, útil para zero trust (lição de arquitetura). Limites: o TPM protege chaves em repouso, mas não impede que um sistema já em execução, comprometido, peça ao TPM para usá-las; e ataques físicos sofisticados fazem parte de modelos de ameaça específicos.'),
          sl('Atualização de firmware e ciclo de vida', 'Firmware tem vulnerabilidades como qualquer software, mas é atualizado raramente: o inventário costuma ser fraco e muitos dispositivos ficam sem patch por anos. Boas práticas: manter inventário de dispositivos e versões (inclusive equipamentos de rede e periféricos), exigir atualizações assinadas e verificadas pelo próprio dispositivo, proteger o canal de atualização, trocar senhas padrão, desativar serviços de gerenciamento não usados (como interfaces de gerenciamento remoto expostas) e planejar o fim de suporte antes de comprar. Dispositivos sem suporte devem ser substituídos ou isolados em segmento de rede restrito.'),
          sl('Canais laterais e execução especulativa', 'Um canal lateral (side-channel) vaza informação não pela lógica do programa, mas por efeitos físicos ou de desempenho: tempo de execução, consumo de energia, emissões, ou o comportamento do cache do processador. Exemplo conceitual: se uma comparação de senha termina mais cedo ao errar o primeiro caractere, o tempo de resposta revela informação. Execução especulativa: processadores modernos executam instruções adiantadas por previsão, e, mesmo descartando o resultado, deixam vestígios no cache que podem ser medidos, permitindo vazar dados entre domínios de isolamento, como entre processos ou máquinas virtuais. Mitigações: atualizações de microcódigo e de sistema, isolamento mais forte de cargas sensíveis (não compartilhar o mesmo núcleo físico entre locatários que não confiam entre si), código criptográfico em tempo constante e, em serviços de nuvem, escolha de instâncias dedicadas para dados muito sensíveis.', '# conceito (tempo constante): comparar sem encerrar cedo\nimport hmac\nok = hmac.compare_digest(a, b)'),
          sl('Cadeia de suprimentos de hardware', 'Hardware também tem cadeia de suprimentos: componentes falsificados, firmware de fábrica com falhas ou com acesso indevido, adulteração em trânsito e revendedores não autorizados. Controles: comprar de canais autorizados, verificar lacres e assinaturas na recepção, validar a versão do firmware antes de colocar em produção, exigir do fornecedor documentação de segurança e política de correções, e fazer inventário com origem. Para ambientes de alto risco, considere avaliação de fornecedores e testes independentes. Em todos os casos, mantenha o modelo de ameaça realista: a maioria dos incidentes explora senhas padrão e firmware desatualizado, e não ataques físicos sofisticados.')
        ]
      },
      questions: [
        mcq('q1', 'O que caracteriza a cadeia de confiança do boot seguro?', 'd', [
          'Os componentes carregam em paralelo, e uma verificação final confere o conjunto no encerramento',
          'O sistema operacional verifica o firmware depois de iniciar, quando o antivírus já está ativo',
          'O usuário confirma manualmente cada driver na tela antes que ele possa ser carregado',
          'Cada etapa só executa a seguinte se assinada, partindo de uma raiz imutável'
        ], 'No boot seguro a verificação é encadeada desde a raiz. Verificar depois de iniciar não protege contra firmware malicioso e a confirmação manual não é o mecanismo.'),
        mcq('q2', 'Qual é a vantagem de vincular a chave de criptografia de disco ao TPM?', 'd', [
          'O disco passa a ser descriptografado mais rápido, pois o TPM possui processador dedicado à leitura',
          'O TPM impede que o sistema operacional em execução use a chave para ler o próprio disco',
          'O usuário não precisa mais de nenhuma autenticação, já que o chip substitui senhas e PINs',
          'A chave só é liberada se o boot medido for o esperado, o que dificulta o uso em outro equipamento'
        ], 'O selo ao estado medido liga a chave ao equipamento íntegro. O sistema em execução ainda usa a chave normalmente e a autenticação adicional pode e deve existir.'),
        mcq('q3', 'Por que atualizar firmware é um desafio de segurança?', 'b', [
          'Porque firmware não possui vulnerabilidades, e as atualizações só trazem funcionalidades novas',
          'Porque o inventário é fraco e as atualizações são raras',
          'Porque cada atualização exige a troca completa do hardware, o que só ocorre a cada década',
          'Porque o firmware é atualizado automaticamente e não existe meio de verificar sua versão'
        ], 'O problema é de gestão: falta de inventário e de rotina de patch. Firmware tem falhas, nem sempre exige troca de hardware e as versões podem ser verificadas.'),
        fill('q4', 'Complete com a sigla do chip ou módulo que guarda chaves e registra medidas do boot (Trusted Platform Module).', 'A chave do disco fica protegida pelo ___ (Trusted Platform Module)', ['TPM'], 'O TPM guarda chaves de forma que não saem do dispositivo e registra medidas do boot em PCRs.'),
        mcq('q5', 'Qual exemplo ilustra um canal lateral de tempo?', 'c', [
          'Um site que envia a senha em texto puro por uma conexão sem HTTPS, visível a quem estiver no caminho',
          'Uma pessoa que adivinha uma senha olhando por cima do ombro do usuário',
          'Uma checagem de senha cujo tempo muda conforme os caracteres corretos',
          'Um backup que não foi cifrado e foi esquecido em um servidor público'
        ], 'Nesse caso o tempo revela informação sobre o segredo, sem falha na lógica visível. As outras alternativas são exposição direta ou observação física.'),
        mcq('q6', 'Qual mitigação é adequada para reduzir o risco de vazamento por execução especulativa em nuvem, para dados muito sensíveis?', 'c', [
          'Desativar o cache do processador em as máquinas, aceitando a queda de desempenho',
          'Usar senhas mais longas nas contas administrativas dos servidores',
          'Aplicar atualizações de microcódigo e usar instâncias dedicadas, sem compartilhar núcleos',
          'Confiar que a execução especulativa só afeta computadores pessoais e não servidores'
        ], 'O risco é tratado com patches e isolamento de cargas. Desligar o cache é impraticável, senhas não afetam o canal e servidores também são afetados.'),
        mcq('q7', 'Uma empresa recebe roteadores novos de um revendedor não autorizado por preço baixo. Qual é o principal risco de cadeia de suprimentos?', 'd', [
          'A velocidade de internet será menor que a contratada pelo fornecedor oficial',
          'O revendedor não poderá emitir nota fiscal, e isso é o único problema relevante da compra',
          'Os roteadores não funcionarão com cabos de rede de outros fabricantes',
          'Os equipamentos podem ser falsificados ou ter firmware adulterado, e a origem não pode ser verificada'
        ], 'Canais não autorizados dificultam verificar a integridade e a origem. As demais opções não tratam de segurança do hardware.'),
        fill('q8', 'Complete com o termo da lista que impede que componentes assinados mas conhecidamente vulneráveis sejam aceitos no boot (lista de ___).', 'lista de ___ : bloqueia componentes assinados porém comprovadamente vulneráveis', ['revogação', 'revogacao', 'revogação de certificados', 'revocation'], 'Listas de revogação permitem invalidar componentes assinados que passaram a ser considerados inseguros.')
      ]
    },
    {
      id: 'csa-27-ot-ics-iec-62443',
      title: 'OT e ICS: Purdue e IEC 62443',
      goal: 'Compreender a segurança de tecnologia operacional: arquitetura Purdue, zonas e condutos, IEC 62443 em visão geral, protocolos industriais, segurança funcional e janelas de manutenção.',
      xp: 30,
      intro: {
        slides: [
          sl('OT não é TI', 'OT (tecnologia operacional) controla processos físicos: fábricas, energia, saneamento, transporte. ICS (sistemas de controle industrial) incluem CLPs (controladores lógicos programáveis), SCADA (supervisão e aquisição de dados) e IHMs (interfaces homem-máquina). Na TI a prioridade clássica é confidencialidade; em OT, a prioridade é disponibilidade e segurança física: parar uma linha pode causar prejuízo ou acidente. Os equipamentos duram décadas, rodam sistemas antigos que não podem ser atualizados com facilidade, e muitos protocolos foram criados sem autenticação, supondo uma rede isolada. A convergência TI-OT acabou com esse isolamento.'),
          sl('Modelo de Purdue e segmentação', 'O modelo de Purdue organiza a arquitetura em níveis: nível 0, processo físico (sensores e atuadores); nível 1, controle básico (CLPs); nível 2, supervisão local (IHM, SCADA); nível 3, operações do site (servidores de produção, histórico); nível 3.5, zona desmilitarizada industrial (IDMZ) entre OT e TI; níveis 4 e 5, rede corporativa e internet. A ideia: segmentar e controlar o que cruza cada fronteira, com fluxo mediado pela IDMZ, sem acesso direto entre a internet e controladores. Em ambientes modernos com nuvem e IIoT o modelo é adaptado, mas o princípio de segmentação permanece. Cuidado: as camadas ajudam a pensar, não substituem a verificação do fluxo real.'),
          sl('IEC 62443: zonas, condutos e níveis', 'A série IEC 62443 é o conjunto de normas de segurança para sistemas de automação e controle industrial. Visão geral de conceitos: zona é um agrupamento de ativos com os mesmos requisitos de segurança; conduto (conduit) é o canal de comunicação entre zonas, com controles (firewall, filtragem de protocolo, monitoramento); níveis de segurança alvo (SL) expressam a robustez exigida de cada zona; e há papéis (proprietário do ativo, integrador, fornecedor de produtos) com responsabilidades distintas, além de requisitos de processo de desenvolvimento seguro e de ciclo de vida. O processo típico: inventariar, avaliar o risco, definir zonas e condutos, atribuir o SL alvo e implementar controles.'),
          sl('Protocolos industriais e riscos', 'Protocolos como Modbus e outros de uso industrial foram projetados para confiabilidade e simplicidade, muitas vezes sem autenticação nem criptografia: quem alcança o equipamento na rede pode enviar comandos legítimos pelo protocolo. Por isso a defesa está na arquitetura: segmentação, listas de permissão de origem e de funções, firewalls que entendem protocolos industriais, monitoramento passivo de rede (NDR/IDS para OT, que observa sem enviar tráfego que possa perturbar o processo), acesso remoto controlado (VPN com MFA, salto monitorado, sessões gravadas) e controle de mídia removível. Varreduras ativas agressivas podem travar controladores antigos: nunca execute em produção sem planejamento e autorização.'),
          sl('Segurança funcional x cibersegurança e manutenção', 'Segurança funcional (safety) protege pessoas e o meio ambiente contra falhas do processo, usando sistemas instrumentados de segurança (SIS) que levam o processo a um estado seguro. Cibersegurança (security) protege contra ações maliciosas. As duas se cruzam: um ataque pode tentar desabilitar a proteção funcional, então o SIS precisa de isolamento e de controle de mudanças rigorosos. Em OT, atualizações e testes só ocorrem em janelas de manutenção planejadas, com ambiente de teste ou gêmeo digital, plano de reversão e coordenação com a operação. Quando não é possível aplicar patch, use controles compensatórios: segmentação, monitoramento e restrição de acesso.'),
          sl('Programa de segurança OT', 'Passos práticos: inventário passivo de ativos (o que existe, versão, comunicação), classificação de criticidade, segmentação com IDMZ, gestão de acesso remoto e de contas de terceiros, backup de configurações e de lógica dos controladores com cópias fora de linha, monitoramento e playbooks de resposta combinados com a operação (parar ou manter o processo? quem decide?), treinamento conjunto de TI e engenharia e exercícios de mesa. Governança: defina responsabilidade clara entre TI, OT e segurança. Lembre da regra: em incidente de OT, a segurança de pessoas e a continuidade do processo orientam as decisões de contenção.')
        ]
      },
      questions: [
        mcq('q1', 'Qual característica distingue a priorização de segurança em OT em relação à TI corporativa?', 'c', [
          'A confidencialidade de dados é o único objetivo relevante em plantas industriais',
          'Atualizações automáticas diárias dos controladores são a prática padrão do setor',
          'Disponibilidade e segurança física pesam mais; parar um equipamento pode causar acidente',
          'Equipamentos de OT são trocados a cada ano, o que elimina o problema de sistemas antigos'
        ], 'Em OT parar o processo pode ser perigoso ou caro, e os ativos duram décadas. Nenhuma das outras afirmações corresponde à realidade típica.'),
        mcq('q2', 'No modelo de Purdue, qual é a função da zona desmilitarizada industrial (nível 3.5)?', 'd', [
          'Abrigar os sensores e atuadores que interagem diretamente com o processo físico',
          'Substituir o firewall corporativo e permitir tráfego livre entre internet e controladores',
          'Armazenar as cópias de segurança de o ambiente de TI',
          'Intermediar TI e OT, evitando acesso direto da rede corporativa aos controladores'
        ], 'A IDMZ é um ponto de mediação entre TI e OT. Sensores ficam no nível 0 e a IDMZ não libera tráfego direto.'),
        mcq('q3', 'Na IEC 62443, o que é um conduto (conduit)?', 'd', [
          'O cabo físico que liga o sensor ao controlador lógico programável',
          'O conjunto de pessoas responsáveis por operar o processo industrial',
          'O documento que registra o nível de segurança de cada fornecedor',
          'O canal entre zonas, onde se aplicam firewall e monitoramento'
        ], 'Zonas agrupam ativos e condutos são os caminhos controlados entre elas. As demais descrições não correspondem ao conceito.'),
        fill('q4', 'Complete com o termo da IEC 62443 para o agrupamento de ativos com os mesmos requisitos de segurança.', 'Na IEC 62443: ___ = agrupamento de ativos com os mesmos requisitos de segurança', ['zona', 'zone'], 'Zona é o agrupamento lógico ou físico de ativos com requisitos de segurança comuns.'),
        mcq('q5', 'Por que varreduras ativas agressivas são arriscadas em redes industriais?', 'a', [
          'Porque controladores antigos podem travar e afetar o processo físico',
          'Porque protocolos industriais criptografam o tráfego e rejeitam sondas desconhecidas',
          'Porque a lei proíbe qualquer tipo de medição em redes de energia e saneamento',
          'Porque a varredura aumenta o tamanho dos logs e consome o espaço do SIEM'
        ], 'Equipamentos legados toleram mal tráfego inesperado, e uma falha pode ter impacto físico. Em OT prefere-se monitoramento passivo e testes planejados.'),
        mcq('q6', 'Uma fábrica não consegue aplicar patch em um CLP antigo. Qual é o caminho mais adequado?', 'b', [
          'Ignorar o problema, pois o equipamento ainda não foi alvo de incidente algum',
          'Adotar controles compensatórios: segmentar, restringir acesso e monitorar',
          'Conectar o CLP direto à internet para permitir que o fabricante o atualize de qualquer lugar',
          'Desligar o equipamento permanentemente, mesmo que isso pare a produção por tempo indeterminado'
        ], 'Quando o patch é inviável, reduz-se a exposição por segmentação e monitoramento. Ignorar ou expor o CLP piora, e desligar nem sempre é possível.'),
        mcq('q7', 'Qual a relação entre segurança funcional (safety) e cibersegurança em uma planta?', 'c', [
          'São idênticas, e controles de uma substituem totalmente os da outra',
          'Safety trata de ataques maliciosos, e cibersegurança trata de acidentes',
          'Um ataque pode tentar anular as proteções de safety, então os temas se cruzam',
          'Não há relação, pois os sistemas instrumentados de segurança são isolados de redes'
        ], 'Os objetivos diferem, mas se cruzam: sistemas de segurança funcional precisam de proteção contra manipulação. As outras opções invertem ou negam essa relação.'),
        fill('q8', 'Complete com a sigla do sistema de controle que supervisiona e coleta dados de processos industriais distribuídos.', '___ : Supervisory Control and Data Acquisition', ['SCADA'], 'SCADA é o sistema de supervisão e aquisição de dados usado em processos industriais e infraestruturas.')
      ]
    },
    {
      id: 'csa-28-mobile-avancado',
      title: 'Segurança mobile avançada',
      goal: 'Compreender o modelo de segurança de Android e iOS, MDM e MTD, análise de apps em conceito e os riscos do spyware comercial e como se proteger.',
      xp: 30,
      intro: {
        slides: [
          sl('O modelo de segurança dos sistemas móveis', 'Android e iOS compartilham princípios: cada app roda em uma sandbox, isolado dos demais e do sistema; acessos a recursos sensíveis (câmera, localização, contatos) dependem de permissões concedidas pelo usuário; apps são assinados e distribuídos por lojas oficiais com revisão; o boot é verificado e o armazenamento é cifrado, com chaves protegidas por hardware dedicado. Há diferenças: iOS é um ecossistema mais fechado, e o Android é mais aberto e diverso, com muitos fabricantes e prazos de atualização diferentes. Em ambos, o elo mais comum de comprometimento é o usuário e as contas (phishing, apps maliciosos, senhas), e não a quebra da sandbox.'),
          sl('Sandbox, permissões e assinatura', 'A sandbox limita o que um app faz: ele só acessa seus próprios dados. Assinatura de apps garante que uma atualização veio do mesmo desenvolvedor. Permissões sensíveis devem seguir o princípio do mínimo necessário: um app de lanterna não precisa de contatos. Desenvolvedores devem pedir só o que usam, explicar o motivo e tratar os dados com a LGPD em mente. Fontes não oficiais de instalação (sideloading) aumentam o risco, pois fogem da revisão da loja. Riscos comuns: apps clones, permissões excessivas, acessibilidade abusada (serviços que leem a tela), sobreposição de telas para capturar credenciais e armazenamento inseguro de tokens no aparelho.'),
          sl('Gestão corporativa: MDM, MAM e MTD', 'MDM (gestão de dispositivos móveis) permite à empresa aplicar políticas: exigir bloqueio de tela, criptografia, versão mínima do sistema, separar perfil de trabalho e pessoal, instalar apps aprovados e apagar remotamente dados corporativos de um aparelho perdido. MAM (gestão de aplicações) controla só os apps e dados corporativos, sem tomar conta do aparelho todo, o que respeita mais a privacidade em modelos de uso de dispositivo pessoal (BYOD). MTD (defesa contra ameaças móveis) detecta apps maliciosos, redes inseguras, aparelhos com root ou jailbreak e ataques de phishing no celular. Acesso condicional integra tudo: o app corporativo só abre em dispositivo em conformidade. Informe ao funcionário, de forma transparente, o que é coletado.'),
          sl('Análise de apps em conceito', 'Para avaliar um app (próprio ou de terceiros em auditoria autorizada), olha-se o manifesto e as permissões solicitadas, as bibliotecas de terceiros embutidas (SDKs de anúncio e análise que coletam dados), o tráfego de rede (usa HTTPS? valida certificados? envia dados pessoais para quais domínios?), o armazenamento local (tokens e dados em texto puro?) e segredos embutidos no pacote. Para quem desenvolve, o guia de referência é o OWASP MASVS (padrão de verificação de segurança de apps móveis) e o guia de testes associado. Para a empresa que homologa apps, o foco é minimizar dados, revisar SDKs e manter política de privacidade verdadeira.'),
          sl('Spyware comercial: o risco e a proteção', 'Spyware comercial é software de vigilância vendido a governos e organizações, capaz de comprometer um celular e acessar mensagens, microfone e localização, muitas vezes sem que a vítima clique em nada. Os alvos costumam ser pessoas de alto interesse: jornalistas, ativistas, advogados, dirigentes. Para a maioria das pessoas o risco é baixo, mas quem está em risco elevado deve adotar proteções: manter o sistema sempre atualizado (correções fecham as falhas usadas), reiniciar o aparelho com frequência, ativar o modo de proteção reforçada que os sistemas oferecem para esses casos, reduzir superfície (desativar recursos de pré-visualização e instalar menos apps), usar contas com chaves de segurança e buscar apoio de organizações especializadas em verificação. Não existe garantia absoluta.'),
          sl('Resposta a um celular comprometido', 'Se há suspeita: isole o aparelho de redes e do acesso às contas sensíveis, troque senhas e revogue sessões a partir de outro dispositivo limpo, registre o que levou à suspeita (comportamento estranho, alertas do sistema), preserve evidências sem apagar o aparelho (dados podem ser necessários para perícia) e acione o time de resposta. Restauração para o padrão de fábrica e reinstalação são medidas de recuperação, mas não resolvem sozinhas se as credenciais já vazaram. Para a empresa, tenha o procedimento de bloqueio e apagamento remoto pronto no MDM e um canal fácil para o funcionário relatar perda ou suspeita, sem medo de punição.')
        ]
      },
      questions: [
        mcq('q1', 'Qual é a função da sandbox em Android e iOS?', 'a', [
          'Isolar cada app, que só acessa os próprios dados e as permissões concedidas',
          'Impedir que o usuário instale qualquer app que não pertença ao fabricante do aparelho',
          'Criptografar automaticamente todas as mensagens trocadas entre aplicativos diferentes',
          'Garantir que o aparelho receba atualizações imediatas, sem depender do fabricante'
        ], 'A sandbox isola apps entre si e do sistema. Ela não proíbe terceiros, não cifra mensagens entre apps e não controla atualização.'),
        mcq('q2', 'Uma empresa permite que funcionários usem o celular pessoal (BYOD) e quer proteger só os dados corporativos, com respeito à privacidade. Qual abordagem é mais adequada?', 'a', [
          'MAM ou perfil de trabalho, só com apps e dados corporativos',
          'MDM com controle total do aparelho, incluindo leitura de mensagens pessoais para checar riscos',
          'Proibir celulares na empresa e armazenar os dados em papel',
          'Sem controle, já que dispositivos pessoais estão fora do alcance da política da empresa'
        ], 'MAM ou perfil de trabalho protege os dados da empresa com menos intrusão. Ler mensagens pessoais fere a privacidade e a ausência de controle expõe os dados.'),
        mcq('q3', 'O que o MTD (mobile threat defense) faz?', 'd', [
          'Gerencia licenças de software e a cobrança dos aplicativos corporativos',
          'Cria cópias de segurança de fotos pessoais em nuvem pública, para qualquer aparelho',
          'Substitui a necessidade de atualizar o sistema operacional do celular',
          'Detecta apps maliciosos, redes inseguras e jailbreak no aparelho'
        ], 'MTD detecta ameaças móveis e sinaliza o risco para políticas de acesso. Não é licenciamento, backup pessoal nem substituto de atualização.'),
        fill('q4', 'Complete com a sigla do padrão da OWASP de verificação de segurança de aplicações móveis.', 'OWASP ___ : padrão de verificação de segurança de apps móveis', ['MASVS'], 'O OWASP MASVS é o padrão de requisitos de segurança para apps móveis; o MASTG é o guia de testes.'),
        mcq('q5', 'Um app de lanterna solicita acesso a contatos e microfone. Qual é a avaliação correta?', 'b', [
          'Normal, pois toda lanterna precisa de contatos para identificar quem está no escuro',
          'Suspeito: viola o princípio do mínimo necessário e merece ser negado ou o app, removido',
          'Aceitável, desde que o app tenha muitas avaliações positivas na loja',
          'Irrelevante, já que permissões não afetam a segurança de dados no aparelho'
        ], 'Permissões devem corresponder à função. Avaliações da loja não substituem esse critério e as permissões afetam sim a privacidade.'),
        mcq('q6', 'Qual conjunto de medidas ajuda pessoas em risco elevado contra spyware comercial?', 'c', [
          'Instalar vários antivírus ao mesmo tempo e desativar as atualizações para não mudar o ambiente',
          'Usar redes de Wi-Fi públicas, que são mais difíceis de rastrear',
          'Atualizar o sistema, reiniciar o aparelho e ativar a proteção reforçada',
          'Confiar que o spyware comercial só atinge aparelhos antigos e ignorar o assunto'
        ], 'Atualizações e redução de superfície fecham as falhas e rotas conhecidas. Desativar atualizações e usar Wi-Fi público aumentam o risco.'),
        mcq('q7', 'Ao suspeitar que o celular de um diretor foi comprometido, qual é a ordem mais adequada?', 'a', [
          'Isolar o aparelho, trocar credenciais em outro dispositivo e preservar evidências',
          'Restaurar o padrão de fábrica imediatamente e só depois avisar a equipe de segurança',
          'Continuar usando o aparelho normalmente, para não alertar quem possa estar monitorando',
          'Publicar uma mensagem em redes sociais descrevendo o comportamento estranho do aparelho'
        ], 'Isolar, trocar credenciais por canal limpo e preservar evidências é a sequência correta. Restaurar de imediato apaga evidências e continuar usando mantém a exposição.'),
        fill('q8', 'Complete com a sigla da tecnologia de gestão que aplica políticas, como exigir bloqueio de tela e permitir apagamento remoto, em dispositivos móveis.', '___ : Mobile Device Management', ['MDM'], 'MDM aplica políticas e permite ações remotas em dispositivos móveis gerenciados.')
      ]
    },
    {
      id: 'csa-29-emulacao-de-adversario-e-purple-team',
      title: 'Emulação de adversário e purple team',
      goal: 'Planejar emulações baseadas em ATT&CK com escopo e salvaguardas, medir cobertura de detecção e transformar resultados em melhoria contínua.',
      xp: 30,
      intro: {
        slides: [
          sl('Do teste de invasão à emulação de adversário', 'Um teste de invasão procura o maior número possível de falhas. A emulação de adversário tem outro foco: reproduzir de modo controlado o comportamento (táticas, técnicas e procedimentos, os TTPs) de um grupo ou de um tipo de ameaça relevante para a organização, para verificar se as defesas detectam e respondem. Red team é o time que simula o adversário, blue team é o time que defende e purple team é a colaboração entre os dois: o objetivo não é vencer, mas melhorar a detecção. Tudo acontece com autorização formal, escopo e regras de engajamento. Aqui o tema é planejamento e medição, não técnicas de ataque.'),
          sl('Planos de emulação com ATT&CK', 'O MITRE ATT&CK (visto nas lições de táticas) é o vocabulário comum. Um plano de emulação segue passos: escolher o cenário com base em inteligência de ameaças (quais adversários têm interesse no seu setor), listar as técnicas do ATT&CK que ele usa, mapear para cada técnica o teste a executar e o resultado esperado (alerta, bloqueio, registro em log) e definir critérios de sucesso. Prefira testes pequenos e atômicos, escritos para serem seguros, repetíveis e reversíveis. Projetos abertos de testes atômicos alinhados ao ATT&CK servem de ponto de partida, mas devem ser revisados antes de rodar em qualquer ambiente.'),
          sl('Escopo, autorização e salvaguardas', 'Antes de executar: autorização escrita de quem tem poder para concedê-la, escopo (sistemas, horários, técnicas permitidas e proibidas), regras de engajamento, contatos de emergência e uma palavra ou canal para parar tudo imediatamente. Salvaguardas: iniciar em laboratório ou em ambiente de homologação, evitar impacto em produção crítica (sem testes destrutivos, sem exfiltrar dados reais), usar dados fictícios, registrar cada ação com hora (trilha de auditoria, para correlacionar com os alertas), limpar tudo ao final e ter plano de reversão. Informe a menor quantidade necessária de pessoas (o SOC pode ou não saber, conforme o objetivo), mas sempre mantenha um responsável de controle que conhece o teste.'),
          sl('Medir cobertura de detecção', 'O resultado de cada técnica testada é classificado: bloqueada, detectada com alerta útil, registrada em log sem alerta, ou invisível. A cobertura é a proporção de técnicas relevantes com detecção efetiva. Mapas de calor do ATT&CK mostram visualmente onde há lacunas, mas cuidado: ter regra para uma técnica não significa cobrir todas as formas de executá-la, e uma regra que dispara no teste pode não disparar em variações. Meça também o tempo para detectar e responder, a qualidade do alerta (o analista entende o que fazer?) e a taxa de falsos positivos. Priorize lacunas pelo risco: técnicas usadas por adversários relevantes e em ativos críticos primeiro.'),
          sl('Ciclo de melhoria contínua', 'O valor está no ciclo: planejar, executar, observar, ajustar, repetir. Para cada lacuna, decida: precisa de nova fonte de log? Nova regra de detecção? Ajuste de uma regra existente? Um bloqueio preventivo? Um playbook? Registre a ação, o responsável e o prazo, e depois reexecute o teste para confirmar a correção (teste de regressão). Automatize os testes mais estáveis para rodar periodicamente, o que revela quando uma mudança de configuração quebrou uma detecção. Em reuniões de purple team, red e blue compartilham o que foi feito e o que foi visto, lado a lado, de forma sem culpa.'),
          sl('Erros comuns e métricas', 'Erros frequentes: executar técnicas sem autorização clara, rodar ferramentas ofensivas em produção sem entender o efeito, medir apenas "quantos testes passaram", não repetir o teste depois da correção, não envolver o responsável pelos sistemas afetados e tratar o resultado como ranking das pessoas do SOC. Métricas úteis: percentual de técnicas prioritárias com detecção, tempo médio de detecção e de resposta, número de lacunas fechadas por ciclo e proporção de alertas acionáveis. Relatório final: o que foi testado, o que funcionou, o que falhou e o plano para melhorar, com linguagem que a gestão entende.')
        ]
      },
      questions: [
        mcq('q1', 'Qual é o objetivo principal de um exercício de purple team?', 'a', [
          'Colaborar para melhorar detecções, compartilhando o que cada lado viu',
          'Provar que o time de defesa é fraco para justificar demissões',
          'Encontrar o maior número possível de vulnerabilidades técnicas nos sistemas de produção',
          'Substituir o SOC por uma equipe ofensiva permanente'
        ], 'Purple team é colaboração para melhorar a defesa. Não é uma competição punitiva, nem um teste de invasão amplo, nem substituto do SOC.'),
        mcq('q2', 'Por que uma emulação de adversário começa pela inteligência de ameaças?', 'a', [
          'Porque indica quais técnicas são relevantes ao setor e dá foco',
          'Porque a inteligência de ameaças dispensa a necessidade de autorização e escopo',
          'Porque assim as 200 técnicas do ATT&CK são testadas na mesma rodada, sem priorização',
          'Porque o ATT&CK só pode ser consultado depois de uma análise externa da empresa'
        ], 'A inteligência orienta o que é mais provável e relevante. Ela não substitui a autorização, testar tudo sem priorizar é ineficiente e o ATT&CK é público.'),
        mcq('q3', 'Qual item é indispensável antes de executar qualquer teste de emulação?', 'a', [
          'Autorização formal, escopo e regras de engajamento, com meio de parar o teste',
          'Divulgar a data e os detalhes técnicos do teste a os funcionários da empresa',
          'Instalar a ferramenta ofensiva diretamente no servidor de produção mais crítico',
          'Combinar com o fornecedor de internet para que ele bloqueie as portas do teste'
        ], 'Sem autorização e escopo não é teste, é incidente potencial. Divulgar para todos pode invalidar o objetivo e produção crítica não é o lugar de começar.'),
        fill('q4', 'Complete com a sigla do conjunto de táticas e técnicas de adversários mantido pela MITRE (MITRE ATT&___).', 'MITRE ATT&___ : base de conhecimento de táticas e técnicas de adversários', ['CK'], 'ATT&CK significa Adversarial Tactics, Techniques, and Common Knowledge e serve de vocabulário comum.'),
        mcq('q5', 'Um teste de uma técnica gerou apenas um registro em log, sem alerta. Como classificar e agir?', 'c', [
          'Como detecção bem-sucedida, pois o log prova que o evento foi observado e isso basta',
          'Como bloqueio preventivo, já que o log impediu a ação',
          'Lacuna: o dado existe, mas falta regra para alertar; refinar e reexecutar',
          'Como falso positivo, e a regra deve ser removida do SIEM'
        ], 'Log sem alerta ninguém vê a tempo, e é uma lacuna a corrigir. Não é bloqueio nem falso positivo.'),
        mcq('q6', 'Por que reexecutar o teste depois de ajustar uma regra?', 'd', [
          'Porque a regra só passa a valer depois da segunda execução de qualquer teste',
          'Porque o ATT&CK exige três execuções para validar cada técnica',
          'Porque assim o relatório fica mais longo e parece mais completo para a diretoria',
          'Para confirmar a correção, como um teste de regressão'
        ], 'A reexecução comprova a correção. As demais explicações são inventadas e não têm base técnica.'),
        mcq('q7', 'Qual armadilha de leitura deve ser evitada ao olhar um mapa de calor de cobertura do ATT&CK?', 'c', [
          'Achar que cores escuras indicam técnicas que a empresa não precisará enfrentar',
          'Usar o mapa para decidir quais lacunas priorizar pelo risco dos adversários relevantes',
          'Supor que uma regra cobre todas as formas de executar a técnica',
          'Atualizar o mapa depois de cada ciclo de testes e de ajustes'
        ], 'Uma regra pode cobrir só uma variação da técnica. Usar o mapa para priorizar e atualizá-lo são boas práticas.'),
        fill('q8', 'Complete com a cor da equipe que simula o adversário (red, blue ou purple team).', 'A equipe que simula o adversário é o ___ team (cor: vermelho)', ['red', 'vermelho', 'red team'], 'Red team simula o adversário, blue team defende e purple team integra os dois para melhorar a detecção.')
      ]
    },
    {
      id: 'csa-30-deception-honeypots',
      title: 'Deception: honeypots e honeytokens',
      goal: 'Entender honeypots, honeytokens e canary tokens como detecção de baixo falso-positivo, com isolamento, riscos e implantação responsável.',
      xp: 30,
      intro: {
        slides: [
          sl('A ideia: algo que ninguém legítimo toca', 'Deception (engano defensivo) é plantar recursos falsos e atraentes no ambiente. Como nenhum usuário ou processo legítimo tem motivo para usá-los, qualquer interação é suspeita por definição. Isso resolve um problema típico do SOC: regras comportamentais geram muito ruído, enquanto um acesso a um isca gera um alerta de alta confiança. Exemplo: uma conta de administrador falsa que nunca faz login; se alguém tenta usá-la, há tentativa de abuso de credenciais, vinda de um insider ou de um intruso que está explorando a rede. Deception complementa, e não substitui, prevenção e detecção tradicionais.'),
          sl('Honeypots: sistemas isca', 'Honeypot é um sistema ou serviço falso, que parece real, feito para ser atacado e observado. Interação baixa: emula só partes de um serviço, é simples e seguro, e registra tentativas de conexão. Interação alta: um sistema completo, que dá mais informações sobre o comportamento do adversário, porém exige muito mais cuidado, pois uma máquina real comprometida pode virar ponto de apoio para atacar outros. Uso interno: honeypots em segmentos de rede onde nada deveria conversar com eles denunciam varreduras e movimento lateral. Uso externo (exposto à internet): serve para pesquisa e inteligência sobre varreduras, com pouco valor operacional para uma empresa comum.'),
          sl('Honeytokens e canary tokens', 'Honeytoken é um dado isca: um registro falso em um banco, uma chave de nuvem fictícia em um repositório, um arquivo chamado "senhas_backup" sem conteúdo real, um e-mail inexistente cadastrado em uma lista. Canary token é um honeytoken que avisa quando é usado: um documento que faz uma requisição a um endereço ao ser aberto, uma credencial de nuvem cujo uso gera alerta, um registro DNS que dispara quando resolvido. Valor: baixíssimo custo, fácil implantação e detecção de eventos como acesso a repositório vazado, cópia de banco ou invasor lendo compartilhamentos de arquivos. O alerta deve apontar onde o token estava e quem o usou, e levar ao playbook de resposta.'),
          sl('Riscos e isolamento', 'Cuidados: o honeypot nunca deve ficar em rede com ativos reais sem segmentação e controles de saída, para que não sirva de trampolim; deve ser patchado e monitorado como qualquer ativo exposto, e não deve conter dados reais, credenciais reais nem informações pessoais. Se o isca for demasiado diferente do ambiente (nome fora do padrão, serviço incomum), um adversário experiente o reconhece. Também há risco de confusão operacional: documente os iscas em um cadastro restrito para que equipes de TI não os desativem nem tratem o alerta como incidente de produção. E mantenha clareza jurídica: um sistema isca não deve induzir a prática de crime, e a coleta de dados de terceiros que o acessem deve respeitar a LGPD e o Marco Civil (visão geral, não substitui orientação jurídica).'),
          sl('Implantação responsável e resposta', 'Passo a passo: escolher o objetivo (detectar movimento lateral, vazamento de credenciais, acesso a dados), posicionar os iscas onde um adversário passaria (bancos, repositórios, compartilhamentos, diretório de contas), tornar os iscas verossímeis e coerentes com o padrão do ambiente, integrar os alertas ao SIEM com severidade alta e um playbook claro (quem recebe? como confirmar? como conter?), testar periodicamente se o alerta realmente chega e revisar o posicionamento depois de cada incidente ou mudança. Meça: quantos alertas, quantos verdadeiros, tempo até o primeiro aviso. Um alerta de isca em ambiente de produção deve ser tratado como incidente até prova em contrário.')
        ]
      },
      questions: [
        mcq('q1', 'Por que um alerta gerado por um honeytoken costuma ter baixa taxa de falso positivo?', 'd', [
          'Porque o honeytoken é monitorado por um algoritmo de aprendizado de máquina que ajusta o limiar automaticamente',
          'Porque invasores externos têm acesso ao ambiente, e funcionários não encontram o honeytoken',
          'Porque o honeytoken é criptografado, e só o atacante tem a chave para abri-lo',
          'Porque nenhum uso legítimo deveria tocar o recurso, então qualquer interação já é suspeita'
        ], 'Como o recurso não tem uso legítimo, a interação é por definição anômala. Não depende de aprendizado de máquina, de ausência de funcionários nem de criptografia.'),
        mcq('q2', 'Qual é a diferença principal entre honeypot de interação baixa e de interação alta?', 'a', [
          'O de baixa emula serviços e é seguro; o de alta é completo, mas mais arriscado',
          'O de baixa fica na internet e o de alta fica dentro do datacenter da empresa',
          'O de baixa registra e-mails, enquanto o de alta registra conexões de rede',
          'O de baixa é pago e o de alta é gratuito, mas ambos oferecem o mesmo nível de risco'
        ], 'A distinção é o grau de realismo e, com ele, de risco e de dados obtidos. Localização, tipo de registro e preço não definem a categoria.'),
        mcq('q3', 'Qual destes é um exemplo de canary token?', 'c', [
          'Um firewall configurado para bloquear o tráfego da internet para a rede interna',
          'Uma senha forte de quinze caracteres guardada em um cofre corporativo',
          'Uma credencial de nuvem fictícia que gera alerta quando alguém tenta usá-la',
          'Um antivírus que executa varreduras agendadas à noite em as estações'
        ], 'Canary token avisa quando é usado. As outras opções são controles comuns, sem a característica de isca que alerta.'),
        fill('q4', 'Complete com o termo do dado isca que não tem uso legítimo e serve para detectar acesso indevido (honey___).', 'honey___ : dado ou credencial falsa usada como isca (ex.: chave de nuvem fictícia)', ['token', 'tokens', 'honeytoken'], 'Honeytoken é um dado isca; quando é um token que avisa ao ser usado, chama-se canary token.'),
        mcq('q5', 'Um honeypot de alta interação foi colocado na mesma rede dos servidores reais, sem restrição de saída. Qual é o risco?', 'b', [
          'Os servidores reais ficarão mais lentos porque dividem a largura de banda da rede',
          'O invasor pode usar o honeypot comprometido como ponto de apoio',
          'O honeypot deixará de registrar conexões, pois a rede local o torna invisível',
          'Não há risco, pois um honeypot é por definição incapaz de ser comprometido'
        ], 'A falta de segmentação e de controle de saída transforma o isca em trampolim. Lentidão e invisibilidade não são o ponto, e honeypots podem ser comprometidos.'),
        mcq('q6', 'Qual cuidado deve ser tomado quanto aos dados dentro de um honeypot?', 'a', [
          'Usar apenas dados fictícios, sem credenciais reais nem dados pessoais',
          'Copiar dados reais de clientes para parecer mais convincente ao invasor',
          'Usar as senhas reais do administrador, com caracteres trocados, para dar realismo',
          'Incluir documentos internos autênticos, protegidos por uma senha simples'
        ], 'O isca deve ser verossímil sem conter nada real. Dados reais ou credenciais parecidas com as verdadeiras criam risco de vazamento e problemas com a LGPD.'),
        mcq('q7', 'Um alerta de honeytoken dispara em produção: uma credencial isca foi usada a partir de um servidor interno. Qual é a postura inicial adequada?', 'b', [
          'Considerar falso positivo e desativar o honeytoken para evitar novos alertas',
          'Tratar como incidente provável, achar a origem e conter o servidor',
          'Aguardar uma semana de observação sem tomar nenhuma ação para ver se ocorre de novo',
          'Reiniciar o servidor de origem e apagar o log do alerta para evitar confusão'
        ], 'Credencial isca usada é indício forte de comprometimento. Desativar, esperar ou apagar logs deixa o intruso agir e destrói evidências.'),
        fill('q8', 'Complete com o nome do sistema isca que parece real e é feito para ser atacado e observado.', '___ : sistema falso que atrai e registra tentativas de ataque (honeypot)', ['honeypot', 'honeypots'], 'Honeypot é um sistema ou serviço isca, que deve ser isolado e monitorado.')
      ]
    },
    {
      id: 'csa-31-gestao-de-crise-e-anpd',
      title: 'Gestão de crise e comunicação à ANPD',
      goal: 'Estruturar a gestão de uma crise cibernética: papéis, comunicação interna e externa, jurídico, imprensa e comunicação de incidente à ANPD e aos titulares em visão geral.',
      xp: 30,
      intro: {
        slides: [
          sl('Incidente não é o mesmo que crise', 'Um incidente é um evento que compromete a segurança e é tratado pela equipe técnica. Crise é quando o impacto passa a ameaçar a organização: operação parada, dados de muita gente expostos, repercussão pública ou risco legal. Na crise, a questão técnica é só uma parte: entram decisões de negócio, comunicação, jurídico e relacionamento com clientes e autoridades. Por isso é preciso um plano de gestão de crise, diferente do plano técnico de resposta (lição de DFIR), mas integrado a ele, e treinado antes: no meio do caos ninguém lê um documento longo pela primeira vez.'),
          sl('Estrutura e papéis', 'Papéis típicos: um comandante de crise (decide, com autoridade da diretoria), um líder técnico (conduz a investigação e a contenção), um responsável jurídico e de privacidade (interpreta obrigações, orienta registros, preserva privilégio de comunicação com advogados), um porta-voz de comunicação (único canal oficial para imprensa e público), um responsável por operações e continuidade do negócio, e o encarregado pelo tratamento de dados pessoais (DPO). Defina suplentes, contatos fora do ambiente comprometido (se o e-mail e o chat caíram, como o time se fala?) e um local único de decisões e registros. Um relator mantém a linha do tempo de fatos e decisões, com hora e responsável.'),
          sl('Comunicação interna e externa', 'Princípios: verdade e tempestividade, sem especular. Diga o que se sabe, o que não se sabe, o que está sendo feito e quando haverá nova atualização. Internamente: oriente funcionários sobre o que fazer e o que não dizer, e a quem encaminhar perguntas de imprensa e de clientes. Externamente: comunicados aprovados por jurídico e direção, coerentes entre si em todos os canais, em linguagem simples, com instruções práticas para as pessoas afetadas (trocar senhas, desconfiar de contatos suspeitos). Evite culpar terceiros sem prova, minimizar o impacto ou prometer o que não pode cumprir. Prepare modelos com antecedência. A comunicação deve ser tratada em canais confiáveis, pois o atacante pode estar lendo o e-mail e o chat da empresa.'),
          sl('LGPD e comunicação à ANPD, em visão geral', 'A LGPD (Lei 13.709/2018) prevê que o controlador comunique à ANPD (Autoridade Nacional de Proteção de Dados) e ao titular a ocorrência de incidente de segurança que possa acarretar risco ou dano relevante aos titulares. Em visão geral, a comunicação descreve a natureza dos dados afetados, os titulares envolvidos, as medidas técnicas e de segurança adotadas, os riscos relacionados e as medidas para reverter ou mitigar os efeitos. A ANPD publica regulamentação e orientações que definem forma e prazo da comunicação; consulte sempre o texto vigente e o seu jurídico, e não confie em memória sobre prazos. O encarregado (DPO) é o canal com a ANPD e com os titulares. Esta lição é uma visão geral e não substitui orientação jurídica.'),
          sl('Jurídico, evidências e relações com terceiros', 'Envolva o jurídico desde o início: preservar evidências (cadeia de custódia, lição de DFIR), avaliar obrigações contratuais (clientes, parceiros, seguro cibernético com exigências de aviso), decidir sobre notificação a autoridades policiais e a reguladores setoriais, e avaliar o que registrar por escrito (a linha do tempo deve ser factual, evitando conclusões prematuras). Em ransomware, qualquer decisão sobre pagamento é de nível executivo, com assessoria jurídica e considerações de sanções, de ética e de eficácia (o pagamento não garante a recuperação dos dados). Mantenha contato com fornecedores e a cadeia: eles também podem ser afetados e têm obrigações.'),
          sl('Treino, aprendizados e erros comuns', 'Realize exercícios de mesa (tabletop) com direção, jurídico, comunicação e TI, usando cenários realistas e fictícios: ninguém sabe bem seu papel até ensaiar. Erros comuns: ausência de um decisor claro, comunicação contraditória, demora em avisar por medo de repercussão, tratar a crise apenas como problema de TI, dependência de ferramentas que o próprio incidente derrubou e esquecer o cuidado com as pessoas da equipe (fadiga em incidentes longos exige revezamento). Depois da crise, faça uma revisão sem culpa: o que funcionou, o que falhou, que ações corrigem, com responsáveis e prazos, e atualize planos e contatos.')
        ]
      },
      questions: [
        mcq('q1', 'Qual é a diferença mais útil entre incidente e crise?', 'd', [
          'Incidente envolve invasores externos, e crise envolve funcionários internos',
          'Incidente dura horas, e crise dura mais de um mês, independentemente do impacto',
          'Não existe diferença, pois os dois termos são sinônimos em qualquer plano',
          'Na crise o impacto ameaça a organização e exige decisões além da técnica'
        ], 'A crise é caracterizada pelo impacto e pela necessidade de decisões multidisciplinares. Origem do ataque e duração não definem a diferença.'),
        mcq('q2', 'Qual é o papel do porta-voz em uma crise cibernética?', 'a', [
          'Ser o canal único e oficial de comunicação externa, usando conteúdo aprovado e coerente',
          'Explicar detalhes técnicos da invasão a qualquer jornalista que ligar para a empresa',
          'Substituir o jurídico na decisão sobre notificar autoridades',
          'Responder a perguntas em redes sociais de forma individual, cada diretor com sua versão'
        ], 'Canal único com mensagens aprovadas evita contradições. O porta-voz não decide obrigações legais nem improvisa.'),
        mcq('q3', 'O e-mail corporativo foi derrubado pelo incidente. Qual cuidado de comunicação interna é o mais adequado?', 'b', [
          'Usar o mesmo e-mail comprometido para discutir a resposta, já que é mais rápido',
          'Ter canais alternativos pré-definidos, fora do ambiente comprometido',
          'Suspender toda comunicação interna até que o ambiente seja totalmente restaurado',
          'Compartilhar detalhes da crise em grupos públicos de mensagens para alcançar a equipe rapidamente'
        ], 'O atacante pode estar lendo o ambiente, então os canais alternativos devem estar previstos. Usar o canal comprometido ou espalhar detalhes em grupos públicos expõe a resposta.'),
        fill('q4', 'Complete com a sigla da autoridade brasileira para quem se comunica o incidente de segurança com dados pessoais de risco relevante.', 'Comunicação de incidente à ___ (Autoridade Nacional de Proteção de Dados)', ['ANPD'], 'A ANPD é a autoridade responsável por fiscalizar e orientar a aplicação da LGPD.'),
        mcq('q5', 'Sobre prazos de comunicação à ANPD, qual atitude é a mais adequada?', 'b', [
          'Memorizar um prazo informado em um curso e aplicá-lo sem conferir a norma atual',
          'Consultar a regulamentação vigente da ANPD e o jurídico para definir a forma e o prazo',
          'Esperar a conclusão total da investigação, mesmo que dure meses, antes de qualquer aviso',
          'Considerar que não há prazo algum e que o aviso é opcional em qualquer caso'
        ], 'Prazos e formas são definidos pela regulamentação, que muda; a consulta ao texto vigente e ao jurídico é essencial. Memória, espera indefinida e considerar opcional são riscos.'),
        mcq('q6', 'Qual conteúdo faz parte, em visão geral, de uma comunicação de incidente a titulares?', 'c', [
          'Uma lista de as vulnerabilidades técnicas da empresa, com detalhes de exploração',
          'Uma mensagem pedindo desculpas, sem explicar o que aconteceu',
          'A natureza dos dados, os riscos, as medidas adotadas e orientações às pessoas',
          'O nome e os dados pessoais dos outros titulares afetados, para dar transparência'
        ], 'A comunicação informa o que ocorreu, os riscos, as medidas e as orientações, em linguagem clara. Expor outras vulnerabilidades ou dados de terceiros é indevido.'),
        mcq('q7', 'Qual prática ajuda mais a preparar a organização para uma crise?', 'd', [
          'Escrever um plano extenso e guardá-lo sem divulgar, para que ninguém o altere',
          'Realizar o treinamento com a equipe técnica, já que ela cuida do incidente',
          'Esperar a primeira crise real para descobrir os papéis de cada área',
          'Fazer exercícios de mesa periódicos com direção, jurídico e TI'
        ], 'O exercício revela lacunas antes da crise real. Planos não conhecidos, treino só técnico e improviso falham sob pressão.'),
        fill('q8', 'Complete com o nome do exercício de simulação em mesa, sem sistemas reais, usado para treinar a gestão de crise (___ exercise).', 'exercício de mesa em inglês: ___ exercise', ['tabletop', 'table-top', 'table top'], 'O exercício de mesa (tabletop) simula uma crise por meio de discussão, para treinar papéis e decisões.')
      ]
    },
    {
      id: 'csa-32-risco-quantitativo-fair',
      title: 'Risco quantitativo com FAIR',
      goal: 'Entender o modelo FAIR em conceito, estimar frequência e magnitude, usar distribuições, simular um exemplo fictício em Python e comunicar o resultado ao negócio.',
      xp: 30,
      intro: {
        slides: [
          sl('Por que quantificar o risco', 'Matrizes de calor com "alto, médio, baixo" são fáceis de montar, porém subjetivas: duas pessoas chamam de "alto" coisas muito diferentes, e a diretoria não consegue comparar com investimento. A análise quantitativa expressa o risco em dinheiro por período, como "perda anual esperada" e "perda no pior cenário razoável", o que permite comparar controles pelo custo-benefício. Ela não elimina a incerteza: expressa a incerteza em faixas e probabilidades, e deixa as premissas à vista, de modo que possam ser discutidas e revistas. Esta lição usa apenas números fictícios.'),
          sl('FAIR em conceito', 'FAIR (Factor Analysis of Information Risk) decompõe o risco em perguntas estimáveis. Risco = frequência de perda x magnitude de perda. Frequência de evento de perda (LEF) depende da frequência de contato ou tentativa de ameaça e da probabilidade de a ameaça ter sucesso (que depende da força da ameaça contra a resistência dos controles, a chamada vulnerabilidade em FAIR). Magnitude de perda (LM) soma perdas primárias (resposta ao incidente, parada de operação, reposição) e secundárias (multas, ações judiciais, perda de clientes, reputação). Decompor ajuda: é mais fácil estimar "quantas vezes por ano esse tipo de evento acontece" e "quanto custa cada vez" do que "qual o risco".'),
          sl('Estimativas calibradas e distribuições', 'Como não temos dados perfeitos, usamos estimativas de especialistas em faixas: mínimo, mais provável e máximo, ou um intervalo de confiança de 90% ("estou 90% certo de que o custo por evento fica entre X e Y"). Calibração é treinar para que esses intervalos sejam honestos, pois pessoas tendem à confiança excessiva e dão faixas estreitas demais. Usam-se distribuições de probabilidade: frequência de eventos costuma ser modelada como contagem (por exemplo Poisson), e custo por evento como uma distribuição assimétrica de cauda longa (por exemplo lognormal), pois a maioria dos eventos é pequena e poucos são enormes. Use dados de incidentes passados, da indústria e de relatórios, com cuidado ao ler fontes (lição de relatórios).'),
          sl('Simulação de Monte Carlo (exemplo fictício)', 'Monte Carlo sorteia milhares de cenários combinando frequência e magnitude para obter uma distribuição de perdas anuais. Exemplo fictício: 5% de chance por mês de um incidente (cerca de 0,6 por ano) e custo por incidente lognormal com mediana em torno de R$ 100 mil. O código abaixo roda 10 mil anos simulados com semente fixa. A saída mostrada foi gerada executando o código de verdade, mas todos os números de entrada são inventados para o exercício: não representam nenhuma empresa nem o mercado.', 'import random\nrandom.seed(42)\nperdas = []\nfor _ in range(10000):\n    eventos = sum(1 for _ in range(12) if random.random() < 0.05)\n    perdas.append(sum(random.lognormvariate(11.5, 0.8) for _ in range(eventos)))\nperdas.sort()\nN = len(perdas)\nprint("media: R$ %.0f" % (sum(perdas) / N))\nprint("percentil 95: R$ %.0f" % perdas[int(N * 0.95)])\n\n# saida real desta execucao:\n# media: R$ 81145\n# percentil 95: R$ 359701\n# anos sem perda: 54.8%'),
          sl('Lendo o resultado', 'Na simulação, a média anual foi em torno de R$ 81 mil, a mediana foi zero (mais da metade dos anos simulados não teve perda) e o percentil 95 ficou acima de R$ 350 mil. Interpretação: a média é a perda anual esperada (útil para orçar e comparar controles), mas ela esconde a cauda; o percentil 95 diz "em 1 ano a cada 20, a perda passa de X", que é o que importa para apetite de risco e seguro. Para comparar um controle: reduza a frequência ou a magnitude no modelo e veja quanto a perda esperada cai; se a queda anual supera o custo anual do controle, ele se paga. Mostre as premissas em uma tabela para a diretoria poder questioná-las.'),
          sl('Comunicação para o negócio e limites', 'Apresente em linguagem de negócio: perda anual esperada, cenário do pior caso razoável, quais controles reduzem quanto e por qual custo. Evite falsa precisão (R$ 81.145,23 sugere exatidão que não existe; arredonde). Registre as premissas, as fontes e as faixas, e atualize quando houver novos dados, como incidentes internos. Limites: o modelo é tão bom quanto as estimativas, eventos raros têm poucos dados, cenários correlacionados (um fornecedor comum que falha para vários) exigem cuidado e a análise não captura todos os impactos intangíveis. O ganho principal é a conversa estruturada sobre premissas, não o número final.')
        ]
      },
      questions: [
        mcq('q1', 'Qual vantagem a análise quantitativa tem sobre uma matriz de calor com níveis alto, médio e baixo?', 'a', [
          'Expressa o risco em dinheiro, permitindo comparar controles por custo-benefício',
          'Elimina a incerteza, entregando um valor exato de perda para cada ameaça',
          'Dispensa o conhecimento de especialistas, pois depende só de ferramentas automáticas',
          'Funciona para riscos de alta probabilidade, que são mais fáceis de medir'
        ], 'Valores monetários e faixas permitem comparar investimentos. A análise não elimina a incerteza, depende de especialistas e funciona para riscos de várias frequências.'),
        mcq('q2', 'No FAIR, de que se compõe o risco em seu nível mais alto?', 'a', [
          'Frequência de eventos de perda combinada com a magnitude da perda',
          'Quantidade de ativos multiplicada pelo número de funcionários da empresa',
          'Soma do custo dos controles com o número de vulnerabilidades encontradas',
          'Probabilidade de a empresa sofrer algum incidente no decorrer de sua existência'
        ], 'FAIR decompõe o risco em frequência e magnitude. As demais combinações não representam o modelo.'),
        mcq('q3', 'Por que a distribuição lognormal é usada com frequência para o custo por evento?', 'a', [
          'Porque tem cauda longa: muitos eventos pequenos e poucos enormes',
          'Porque garante que os custos sejam iguais à média, o que simplifica o cálculo',
          'Porque produz valores negativos, representando economia com os controles',
          'Porque é a única distribuição que o Python consegue sortear'
        ], 'A cauda longa descreve bem a realidade de perdas. Ela não iguala os custos à média, não gera negativos e não é a única opção de sorteio.'),
        fill('q4', 'Complete com o nome da técnica de sorteio de milhares de cenários para obter a distribuição das perdas anuais.', 'Simulação de ___ (sorteia milhares de cenários; nome em duas palavras, o de um cassino de Mônaco)', ['Monte Carlo', 'montecarlo', 'monte-carlo'], 'A simulação de Monte Carlo combina frequência e magnitude em muitos cenários aleatórios.'),
        mcq('q5', 'Na simulação da lição a mediana foi R$ 0 e a média foi de cerca de R$ 81 mil. O que isso indica?', 'b', [
          'Que houve erro na simulação, pois a média e a mediana deveriam ser iguais',
          'Que a maioria dos anos não teve perda, e poucos anos caros elevam a média',
          'Que o custo por evento é zero na maioria dos eventos que ocorrem',
          'Que a empresa não precisa se preocupar com perdas, pois a mediana é zero'
        ], 'Muitos anos sem perda e poucos anos caros produzem mediana baixa e média maior. Isso é esperado e o percentil alto mostra o risco que a mediana esconde.'),
        mcq('q6', 'Qual é o uso mais adequado do percentil 95 da perda anual?', 'b', [
          'Substituir a média no orçamento anual, pois é o valor que será gasto',
          'Indicar a perda excedida em um ano a cada vinte, o que apoia a discussão de apetite de risco e seguro',
          'Mostrar a perda mínima que a empresa certamente terá em os anos',
          'Provar que os controles de segurança atuais são desnecessários'
        ], 'O percentil 95 descreve um cenário ruim porém plausível. Não é gasto garantido nem perda mínima.'),
        mcq('q7', 'Qual é a melhor forma de apresentar o resultado à diretoria?', 'b', [
          'Um único número com centavos, sem explicar as premissas, para parecer mais preciso',
          'Valores arredondados, premissas explícitas e o ganho de cada controle versus seu custo',
          'A nota de risco alto, médio ou baixo, sem valor monetário',
          'O código-fonte e os parâmetros estatísticos, sem interpretação para o negócio'
        ], 'Clareza, premissas e custo-benefício conduzem a decisões. Falsa precisão, notas sem valores e código sem interpretação não ajudam.'),
        fill('q8', 'Complete com a distribuição normalmente usada para modelar a contagem de eventos por período (por exemplo, incidentes por ano).', 'frequência de eventos ~ distribuição de ___ (contagem)', ['Poisson'], 'A distribuição de Poisson modela contagens de eventos independentes em um período.')
      ]
    },
    {
      id: 'csa-33-programa-de-seguranca-e-ciso',
      title: 'Programa de segurança e o papel do CISO',
      goal: 'Construir estratégia, roadmap, maturidade, orçamento e priorização de um programa de segurança, comunicar à diretoria, estruturar equipes e definir apetite de risco.',
      xp: 30,
      intro: {
        slides: [
          sl('Segurança como programa de negócio', 'O CISO (diretor de segurança da informação) não existe para dizer "não", e sim para permitir que o negócio assuma riscos de forma consciente. Um programa de segurança é o conjunto coordenado de pessoas, processos e tecnologia, alinhado aos objetivos da empresa: proteger receita, cumprir obrigações legais (LGPD e normas setoriais), manter a confiança dos clientes e possibilitar novos negócios. Começa entendendo o contexto: o que a empresa faz, quais os ativos críticos, quem são os adversários prováveis, quais as exigências regulatórias e qual a capacidade de investimento.'),
          sl('Estratégia, maturidade e roadmap', 'A estratégia define onde queremos chegar e por quê; o roadmap é a sequência de iniciativas em 12 a 36 meses. Para saber de onde se parte, usa-se um modelo de maturidade ou framework de referência (por exemplo NIST CSF e ISO 27001, vistos nas lições de governança): avalia-se cada área (identificar, proteger, detectar, responder, recuperar) em níveis, e define-se o nível alvo por área segundo o risco, e não "o máximo em tudo". Priorize pelo impacto no risco e pelo esforço: primeiro as lacunas que mais reduzem risco por real investido (identidade forte, backups testados, correção de falhas críticas, visibilidade), depois os temas avançados.'),
          sl('Orçamento e priorização', 'Orçamento de segurança se justifica por risco e por valor: traduza as iniciativas em redução de perdas (lição de FAIR), em habilitação de receita (certificações exigidas por clientes) e em obrigações a cumprir. Separe o custo de operação contínua (pessoas, licenças) do custo de projeto, e considere o custo total de propriedade de ferramentas: muita ferramenta sem pessoas para operá-la vira prateleira. Um método simples de priorização é uma lista ordenada por risco reduzido, esforço, dependências e prazos, revisada a cada trimestre. Faça menos coisas, mas bem feitas e medidas. Aceite que sempre haverá risco residual, e que cabe à gestão aceitá-lo formalmente.'),
          sl('Apetite de risco e aceitação', 'Apetite de risco é o nível de risco que a diretoria aceita assumir para atingir seus objetivos; tolerância é a variação aceitável em torno dele. Deve ser definido pela alta gestão, não pela TI, e traduzido em limites concretos: "perda anual esperada acima de X exige plano", "sistemas críticos devem ter recuperação em até Y horas", "vulnerabilidades críticas expostas à internet devem ser tratadas em Z dias". Quando um risco ficar acima do apetite, há quatro respostas: mitigar (controles), transferir (seguro, contrato), evitar (não fazer a atividade) ou aceitar (com registro, responsável e prazo de revisão). A aceitação sem registro e sem dono é uma falha de governança.'),
          sl('Comunicação com a diretoria', 'A diretoria quer saber: estamos seguros o suficiente para o que fazemos? o que pode nos custar mais? o que preciso decidir? Fale em linguagem de negócio, com poucos indicadores estáveis ao longo do tempo (tendência, e não só foto): exposição a riscos principais em termos financeiros, cobertura de controles críticos, tempos de detecção e de recuperação, situação de conformidade e incidentes relevantes com lições aprendidas. Evite jargão e listas de ferramentas; traga decisões claras ("aprovar X para reduzir Y"). Seja honesto com o que não sabe e com as más notícias, pois uma surpresa pública é muito pior que um alerta antecipado.'),
          sl('Estrutura de equipes', 'Funções comuns: governança, risco e conformidade (GRC); arquitetura e engenharia de segurança; operações de segurança (SOC, resposta a incidentes, gestão de vulnerabilidades); segurança de aplicações e DevSecOps; gestão de identidades e acessos; privacidade (com o encarregado de dados); segurança em nuvem; e conscientização. Em empresas pequenas uma pessoa acumula várias, com apoio de serviços gerenciados (MSSP, MDR). Boas práticas: o CISO com acesso à diretoria e independência de quem opera a TI para evitar conflito de interesses, embeber segurança nos times de produto (campeões de segurança), medir de forma justa e cuidar do time (fadiga e retenção são riscos reais de programa).')
        ]
      },
      questions: [
        mcq('q1', 'Qual é a postura mais adequada de um CISO em relação ao negócio?', 'c', [
          'Vetar qualquer iniciativa que traga risco, pois sua função é eliminar o risco da empresa',
          'Cuidar só de ferramentas e deixar decisões de risco para as equipes de produto',
          'Permitir que o negócio assuma riscos de forma consciente e informada',
          'Evitar contato com a diretoria para não gerar preocupação desnecessária'
        ], 'O CISO apoia decisões informadas de risco. Vetar tudo, abdicar de decisões e evitar a diretoria não funcionam.'),
        mcq('q2', 'Como definir o nível alvo de maturidade em cada área do programa?', 'c', [
          'Buscar o nível máximo em as áreas, independentemente de custo e de risco',
          'Copiar o nível alvo de outra empresa do mesmo setor sem avaliar o próprio contexto',
          'Segundo o risco de cada área, priorizando as lacunas que mais reduzem risco',
          'Evitar definir níveis alvo, para não gerar cobrança sobre a equipe'
        ], 'O alvo depende do risco e do contexto. Máximo em tudo é inviável, copiar sem avaliar ignora diferenças e não ter alvo impede planejamento.'),
        mcq('q3', 'Quem deve definir o apetite de risco da organização?', 'c', [
          'A equipe de TI, por ser a que conhece os sistemas',
          'O fornecedor da ferramenta de segurança mais cara contratada',
          'A alta gestão, com apoio técnico do CISO para traduzi-lo em limites concretos',
          'O time de auditoria externa durante a certificação anual'
        ], 'Apetite é decisão de negócio, de responsabilidade da diretoria. A TI e os auditores informam, mas não decidem o apetite.'),
        fill('q4', 'Complete com a resposta ao risco que consiste em contratar um seguro ou repassar a responsabilidade por contrato (mitigar, transferir, evitar ou aceitar).', 'Respostas ao risco: mitigar, ___, evitar ou aceitar', ['transferir', 'transferencia', 'transferência', 'transfer'], 'Transferir o risco, por exemplo com seguro ou cláusulas contratuais, reduz o impacto financeiro mas não elimina o risco em si.'),
        mcq('q5', 'Um risco acima do apetite não pode ser mitigado agora, e a diretoria decide conviver com ele. Qual é o procedimento correto?', 'c', [
          'Ignorar o risco, sem registro, para não gerar discussão futura',
          'Mover o risco para a lista de riscos da TI, que deverá resolvê-lo sozinha',
          'Aceitar formalmente, com registro, responsável e data de revisão',
          'Alterar o apetite de risco no documento para que o risco apareça dentro do limite'
        ], 'Aceitação deve ser consciente e documentada. Ignorar, empurrar para a TI ou mexer no apetite para mascarar são falhas de governança.'),
        mcq('q6', 'Qual conjunto de informações é mais útil em um relatório trimestral à diretoria?', 'c', [
          'A lista completa de os alertas do SIEM, com horários e endereços IP',
          'O nome das ferramentas compradas e a quantidade de licenças de cada uma',
          'Poucos indicadores estáveis, como exposição financeira, tempos de resposta e decisões necessárias',
          'Notícias de incidentes ocorridos em outras empresas, sem relação com a própria'
        ], 'Indicadores de negócio, tendência e decisões claras apoiam a gestão. Dados brutos, inventário de ferramentas e notícias externas não bastam.'),
        mcq('q7', 'Por que muita ferramenta sem pessoas para operá-la é um problema de programa?', 'c', [
          'Porque ferramentas de segurança só funcionam se forem desativadas à noite',
          'Porque o número de licenças reduz automaticamente a necessidade de treinamento',
          'Sem operação, os alertas são ignorados e a ferramenta vira custo',
          'Porque ferramentas diferentes se anulam entre si e deixam o ambiente exposto'
        ], 'Sem operação, a ferramenta não protege e vira custo. As demais afirmações são falsas.'),
        fill('q8', 'Complete com a sigla do cargo de direção responsável pela segurança da informação (Chief Information Security Officer).', '___ : Chief Information Security Officer', ['CISO'], 'CISO é o executivo que lidera o programa de segurança da informação.')
      ]
    },
    {
      id: 'csa-34-grc-auditoria-terceiros',
      title: 'GRC, auditoria e risco de terceiros',
      goal: 'Entender GRC, auditoria interna e externa, controles e evidências, gestão de risco de terceiros (TPRM), cláusulas contratuais de segurança e due diligence.',
      xp: 30,
      intro: {
        slides: [
          sl('GRC: governança, risco e conformidade', 'GRC integra três coisas. Governança: quem decide, com que responsabilidades e políticas. Risco: identificar, avaliar e tratar o que pode atrapalhar os objetivos. Conformidade (compliance): demonstrar que se cumprem leis, normas e contratos (LGPD, normas setoriais, ISO 27001, exigências de clientes). Conformidade não é igual a segurança: é possível estar em conformidade e ainda assim ser invadido, e a recíproca também vale. A conformidade verifica que controles existem e funcionam; a segurança é o resultado real. O bom programa usa a conformidade como alicerce e a gestão de risco para ir além do mínimo exigido.'),
          sl('Controles e evidências', 'Um controle é uma medida que reduz risco: preventivo (impede, como MFA), detectivo (descobre, como alertas de SIEM) ou corretivo (repara, como restauração de backup). Cada controle tem um responsável, uma frequência e uma evidência: o registro que prova que ele funciona (relatório de revisão de acessos assinado, log de aprovação de mudança, captura de configuração, resultado de teste de restauração). Sem evidência, para o auditor, o controle não existe. Boas práticas: coletar evidências de forma automática e contínua sempre que possível, definir o controle de modo que seja testável, e mapear um controle a vários requisitos (framework comum) para não repetir trabalho entre normas diferentes.'),
          sl('Auditoria interna e externa', 'Auditoria interna: feita por área independente da empresa, avalia controles e riscos e relata à alta gestão (e ao comitê de auditoria), para melhorar antes que alguém de fora aponte. Auditoria externa: feita por terceiros para certificação ou atestação (por exemplo, ISO 27001 ou relatórios de controles de provedores de serviço) ou exigida por clientes e reguladores. Passos comuns: planejar o escopo, entender os controles, testar amostras (desenho e efetividade operacional), registrar constatações, discutir plano de ação e acompanhar a correção. A independência é essencial: quem opera o controle não deve ser o único a avaliá-lo. Trate constatações como oportunidade de melhoria com responsáveis e prazos, e não como acusação.'),
          sl('Gestão de risco de terceiros (TPRM)', 'Fornecedores têm acesso a dados e sistemas, e incidentes neles viram incidentes seus. TPRM (third-party risk management) é o ciclo: classificar os fornecedores por criticidade (acesso a dados pessoais ou sensíveis, impacto na operação, conectividade), fazer a avaliação proporcional ao risco (questionário de segurança, evidências, certificações, testes quando justificável), contratar com cláusulas adequadas, monitorar continuamente (mudanças, incidentes públicos, desempenho) e planejar a saída (como recuperar os dados e trocar de fornecedor). Os fornecedores mais críticos merecem reavaliação periódica; os de risco baixo, controles leves. Lembre-se também dos subcontratados (quarta parte) e da concentração em um único fornecedor.'),
          sl('Cláusulas de segurança e due diligence', 'Em contratos, em visão geral: papéis de controlador e operador no tratamento de dados pessoais, finalidade e limites de uso dos dados, medidas de segurança mínimas, obrigação de notificar incidentes em prazo definido, direito de auditoria ou de receber relatórios independentes, tratamento de subcontratados, local de armazenamento e transferência internacional, retenção e devolução ou eliminação de dados ao término, continuidade e recuperação (SLA) e responsabilidade e indenização. Due diligence: antes de contratar (e antes de fusões e aquisições), investigar a postura de segurança, o histórico de incidentes, a situação financeira e o cumprimento da lei. A redação final deve passar pelo jurídico; este texto não substitui orientação jurídica.')
        ]
      },
      questions: [
        mcq('q1', 'Qual afirmação sobre conformidade e segurança é a mais precisa?', 'd', [
          'Estar em conformidade com uma norma garante que a empresa não será invadida',
          'A conformidade é desnecessária quando existe um bom time técnico de segurança',
          'Segurança e conformidade são idênticas, pois as normas cobrem as ameaças',
          'Conformidade mostra que controles existem, mas não garante segurança'
        ], 'A conformidade é um alicerce, porém um ambiente pode cumprir requisitos e continuar vulnerável. As demais afirmações exageram ou negam a relação.'),
        mcq('q2', 'Um auditor pergunta como a empresa prova que revisa os acessos de usuários a cada trimestre. O que é a melhor evidência?', 'a', [
          'Relatórios de revisão datados e aprovados pelos responsáveis',
          'A declaração verbal do gestor dizendo que a revisão é feita',
          'O texto da política de acessos, sem registro de execução',
          'Uma lista dos usuários ativos atuais, sem data e sem aprovação'
        ], 'Evidência é registro datado e rastreável da execução. Declaração verbal, política sem registro e lista sem data não provam funcionamento.'),
        mcq('q3', 'Qual é o papel da auditoria interna?', 'c', [
          'Operar os controles de segurança no dia a dia, como atender os alertas',
          'Emitir certificados que substituem as auditorias externas exigidas por clientes',
          'Avaliar com independência controles e riscos e relatar à alta gestão',
          'Aprovar as mudanças em sistemas antes de elas irem para produção'
        ], 'A auditoria interna avalia com independência. Operar controles ou aprovar mudanças é função de quem executa e de quem gere.'),
        fill('q4', 'Complete com a sigla de gestão de risco de terceiros (third-party risk management).', '___ : Third-Party Risk Management', ['TPRM'], 'TPRM é o ciclo de classificar, avaliar, contratar, monitorar e encerrar relações com fornecedores.'),
        mcq('q5', 'Como definir a profundidade da avaliação de um fornecedor?', 'c', [
          'Aplicando o mesmo questionário extenso aos fornecedores de qualquer porte, sem distinção',
          'Avaliando só os fornecedores mais baratos, pois são os mais arriscados',
          'De forma proporcional à criticidade do fornecedor',
          'Confiando na reputação da marca do fornecedor e dispensando a avaliação'
        ], 'A avaliação deve ser proporcional ao risco. Tratar todos igual desperdiça esforço, preço não mede risco e reputação não dispensa avaliação.'),
        mcq('q6', 'Qual cláusula é importante em um contrato com um operador de dados pessoais, em visão geral?', 'a', [
          'Notificação de incidentes em prazo definido, segurança, subcontratados e eliminação dos dados no fim',
          'Permitir que o operador use os dados para qualquer finalidade própria, como marketing ou venda a terceiros',
          'Isentar o operador de qualquer responsabilidade em caso de incidente de segurança',
          'Dispensar o operador de manter qualquer registro de acesso aos dados'
        ], 'Notificação de incidentes, segurança, subcontratação e término são pontos centrais. Uso livre dos dados e isenção total de responsabilidade são inadequados. Não substitui orientação jurídica.'),
        mcq('q7', 'Por que planejar a saída do fornecedor (exit plan) faz parte do TPRM?', 'a', [
          'Para recuperar dados e manter a operação se for preciso trocar de fornecedor',
          'Porque contratos terminam em menos de um ano, e a troca é obrigatória',
          'Porque o fornecedor deixa de ter responsabilidades assim que o contrato acaba, sem exceção',
          'Porque a LGPD proíbe qualquer contrato com mais de um fornecedor para o mesmo serviço'
        ], 'O plano de saída evita dependência e perda de dados. As demais afirmações são falsas.'),
        fill('q8', 'Complete com o tipo de controle que descobre um problema depois que ele ocorre, como um alerta de SIEM (preventivo, ___ ou corretivo).', 'tipos de controle: preventivo, ___ e corretivo', ['detectivo', 'detective'], 'Controles detectivos identificam o evento; os preventivos o impedem e os corretivos reparam o dano.')
      ]
    },
    {
      id: 'csa-35-privacidade-avancada-pets-dpo',
      title: 'Privacidade avançada: PETs, RIPD e DPO',
      goal: 'Compreender anonimização, pseudonimização e privacidade diferencial em conceito, o RIPD, privacidade por design, o papel do DPO e a transferência internacional em visão geral.',
      xp: 30,
      intro: {
        slides: [
          sl('Da proteção do dado à privacidade como engenharia', 'Privacidade vai além de segurança: segurança protege contra acesso indevido; privacidade trata de usar dados pessoais de forma legítima, proporcional e transparente. A LGPD (Lei 13.709/2018) traz princípios como finalidade, adequação, necessidade (usar o mínimo), livre acesso, qualidade, transparência, segurança, prevenção, não discriminação e responsabilização. As PETs (tecnologias de reforço da privacidade) são técnicas que permitem extrair valor dos dados com menos exposição das pessoas. Este conteúdo é uma visão geral técnica e não substitui orientação jurídica.'),
          sl('Pseudonimização e anonimização', 'Pseudonimização troca identificadores diretos (nome, CPF) por códigos, mantendo a possibilidade de reverter com uma informação adicional guardada separadamente (a tabela de correspondência). Continua sendo dado pessoal, e precisa de proteção, mas reduz risco em análises e testes. Anonimização torna a reidentificação irreversível por meios razoáveis; o dado anonimizado, em geral, sai do escopo da LGPD. Cuidado: remover o nome não basta. Combinações de atributos (CEP, data de nascimento, sexo) podem reidentificar pessoas, o que se chama de risco de reidentificação por quasi-identificadores. Técnicas de generalização, como k-anonimato (cada combinação aparece em pelo menos k pessoas), reduzem esse risco, mas têm limites.', '# exemplo fictício de generalização\n# antes : CEP 01310-100, nascimento 1990-04-12\n# depois: CEP 013**-***, faixa etária 30-39'),
          sl('Privacidade diferencial em conceito', 'Privacidade diferencial é uma garantia matemática: o resultado de uma análise estatística quase não muda se os dados de qualquer pessoa forem incluídos ou removidos. Consegue-se acrescentando ruído calibrado aos resultados. O parâmetro epsilon controla o equilíbrio: epsilon menor significa mais privacidade e menos precisão. Uso típico: publicar estatísticas agregadas ou treinar modelos sem permitir inferir se uma pessoa específica estava nos dados. Limites: o ruído reduz a utilidade em grupos pequenos, e cada consulta consome um orçamento de privacidade, então não se pode perguntar indefinidamente. Outras PETs: computação multipartidária segura, criptografia homomórfica e aprendizado federado, todas em evolução, com custo e complexidade maiores.'),
          sl('Privacidade por design e RIPD', 'Privacidade por design (e por padrão) significa pensar na proteção desde a concepção do produto: coletar o mínimo, definir a finalidade antes, usar configurações padrão mais protetoras, separar identificadores, definir retenção e eliminação, e registrar o tratamento. O RIPD (Relatório de Impacto à Proteção de Dados Pessoais) documenta os tratamentos de maior risco: descrição do tratamento, finalidade, necessidade e proporcionalidade, riscos aos titulares e medidas de mitigação. Faz sentido elaborá-lo antes de lançar o tratamento (por exemplo, uso de dados sensíveis, monitoramento em larga escala ou uso de IA com dados pessoais). A ANPD pode solicitá-lo; consulte a regulamentação vigente com o jurídico.'),
          sl('O papel do encarregado (DPO)', 'O encarregado pelo tratamento de dados pessoais (conhecido como DPO) é o canal de comunicação entre a organização, os titulares e a ANPD. Atribuições, em visão geral: receber reclamações e pedidos dos titulares, orientar a equipe sobre boas práticas, aceitar comunicações da autoridade e apoiar a elaboração de documentos como o RIPD. Para exercer bem a função, o encarregado precisa de acesso à direção, independência, recursos e conhecimento de privacidade e segurança. Evite conflito de interesses, por exemplo acumular com a decisão sobre os próprios tratamentos. Em segurança, o DPO trabalha junto ao CISO e ao jurídico, principalmente na resposta a incidentes (lição de gestão de crise).'),
          sl('Transferência internacional e pedidos de titulares', 'Enviar dados pessoais para fora do Brasil (incluindo armazenamento em nuvem em outro país e acesso remoto por equipe estrangeira) é transferência internacional, e a LGPD a permite apenas em hipóteses previstas, como países com nível adequado de proteção, cláusulas contratuais específicas ou outros mecanismos reconhecidos, entre outras. Na prática: mapeie onde os dados estão e para onde fluem, avalie os fornecedores e as cláusulas, e consulte a regulamentação atual e o jurídico antes de decidir. Para os direitos dos titulares (acesso, correção, eliminação, portabilidade), tenha processo para localizar os dados do titular em todos os sistemas, validar a identidade de quem pede e responder dentro dos prazos legais vigentes.')
        ]
      },
      questions: [
        mcq('q1', 'Qual é a diferença essencial entre pseudonimização e anonimização?', 'b', [
          'Pseudonimização remove os dados do banco e os apaga dos backups, enquanto anonimização esconde parte deles',
          'Pseudonimização é reversível com informação à parte; anonimização não deveria ser',
          'Pseudonimização só é permitida para dados de menores de idade, e anonimização, para dados de adultos',
          'Não há diferença, pois ambas tornam o dado público e livre de qualquer proteção'
        ], 'A pseudonimização é reversível com a chave separada e continua sendo dado pessoal; a anonimização busca ser irreversível. As demais descrições estão incorretas.'),
        mcq('q2', 'Uma base remove nomes, mas mantém CEP completo, data de nascimento e sexo. Qual é o risco?', 'a', [
          'A combinação desses atributos pode reidentificar pessoas, e a base não está de fato anonimizada',
          'Não há risco, pois sem o nome a pessoa não pode ser identificada',
          'O risco é de desempenho, porque o banco ficará mais lento com tantos campos',
          'O risco é que o CEP deixe de ser válido após a remoção dos nomes'
        ], 'Quasi-identificadores combinados permitem reidentificação. Remover só o nome é insuficiente.'),
        mcq('q3', 'O que o parâmetro epsilon controla na privacidade diferencial?', 'b', [
          'A velocidade de processamento da consulta no servidor de dados',
          'O equilíbrio entre privacidade e precisão: menor epsilon, mais ruído e mais privacidade',
          'O número de pessoas que podem acessar os resultados publicados',
          'O tamanho da chave criptográfica que protege o banco'
        ], 'Epsilon regula a quantidade de ruído: menor valor protege mais e reduz a precisão. Não se relaciona com velocidade, acesso ou chave.'),
        fill('q4', 'Complete com a sigla do relatório que documenta tratamentos de maior risco, com riscos aos titulares e medidas de mitigação.', '___ : Relatório de Impacto à Proteção de Dados Pessoais', ['RIPD'], 'O RIPD descreve o tratamento, avalia riscos e define mitigações; é apropriado antes de lançar tratamentos de maior risco.'),
        mcq('q5', 'Qual das opções é um exemplo de privacidade por padrão?', 'c', [
          'Coletar os dados possíveis agora e decidir a finalidade quando houver alguma necessidade futura do negócio',
          'Deixar as opções de compartilhamento ativadas e pedir ao usuário que desative o que não quiser',
          'Configuração inicial que compartilha o mínimo de dados',
          'Guardar os dados por tempo indeterminado, pois eliminá-los pode ser um risco para o negócio'
        ], 'Por padrão, o menor compartilhamento é o ponto de partida. As demais opções contrariam a necessidade, a finalidade e a retenção limitada.'),
        mcq('q6', 'Qual é uma atribuição típica do encarregado (DPO), em visão geral?', 'b', [
          'Decidir sozinho as medidas técnicas de segurança da empresa',
          'Ser o canal com titulares e ANPD e orientar a equipe',
          'Substituir o jurídico em todas as decisões sobre contratos e processos',
          'Operar o SOC e responder pelos alertas fora do horário de expediente'
        ], 'O encarregado atua como canal de comunicação e orientação. Ele não substitui o CISO, o jurídico nem o SOC.'),
        mcq('q7', 'Uma empresa decide guardar os dados dos clientes em uma nuvem de outro país. Qual é a postura adequada?', 'd', [
          'Considerar que dados guardados na nuvem deixam de ser dados pessoais e, por isso, dispensar análises',
          'Evitar documentar o local de armazenamento, para não gerar questionamentos',
          'Aceitar qualquer cláusula padrão do fornecedor sem análise, pois todas são equivalentes',
          'Mapear o fluxo, avaliar o fornecedor e a base legal, e consultar o jurídico'
        ], 'Transferência internacional exige análise de base legal, de cláusulas e do fornecedor. As outras opções ignoram obrigações. Não substitui orientação jurídica.'),
        fill('q8', 'Complete com o nome da técnica que acrescenta ruído calibrado aos resultados para proteger indivíduos (privacidade ___).', 'privacidade ___ : garantia matemática com ruído calibrado e parâmetro epsilon', ['diferencial', 'differential'], 'A privacidade diferencial limita o quanto o resultado revela sobre qualquer pessoa específica.')
      ]
    },
    {
      id: 'csa-36-resiliencia-e-recuperacao',
      title: 'Resiliência e recuperação de ransomware',
      goal: 'Projetar resiliência cibernética: backups imutáveis, recuperação de ransomware, reconstrução de AD, exercícios, engenharia do caos em segurança e lições de recuperação.',
      xp: 30,
      intro: {
        slides: [
          sl('Resiliência: assumir que vai acontecer', 'Resiliência cibernética é a capacidade de continuar entregando serviços essenciais durante e depois de um ataque, recuperando-se rapidamente. Parte da premissa de assumir o comprometimento: prevenção reduz a probabilidade, mas a recuperação limita o impacto. Dois números orientam o projeto: RTO (tempo máximo tolerável para restaurar o serviço) e RPO (quantidade máxima de dados que se aceita perder, medida em tempo). Eles vêm da análise de impacto no negócio e determinam a arquitetura de backup, de replicação e de redundância. Sistemas diferentes têm metas diferentes, e é preciso priorizar a ordem de recuperação.'),
          sl('Backups: regra 3-2-1 e imutabilidade', 'A regra 3-2-1 sugere: três cópias dos dados, em duas mídias ou tipos de armazenamento diferentes, com uma cópia fora do local (ou fora de linha). Em ransomware, o adversário tenta destruir os backups antes de cifrar os dados, apagando catálogos, cifrando repositórios ou usando credenciais administrativas. Defesas: backup imutável (a cópia não pode ser alterada nem apagada durante o período de retenção, mesmo por um administrador, usando recursos como o bloqueio de objetos em nuvem ou mídia fora de linha), contas de backup separadas do domínio principal, MFA para acesso, rede de gerenciamento isolada e alertas para tentativas de exclusão. Backup que nunca foi restaurado em teste não deve ser considerado um backup confiável.'),
          sl('Recuperação de ransomware', 'Sequência típica: (1) conter, isolando segmentos afetados e preservando evidências; (2) avaliar o escopo e entender como o adversário entrou, para não restaurar sobre um ambiente ainda comprometido; (3) erradicar a persistência e as contas comprometidas, trocando credenciais, inclusive de contas de serviço; (4) restaurar em ordem de prioridade, a partir de backups verificados anteriores à intrusão, em ambiente limpo e isolado, e escanear antes de reconectar; (5) monitorar de forma intensificada após o retorno; (6) comunicar conforme as obrigações (lição de crise e ANPD). Pagar o resgate não garante a recuperação nem impede nova extorsão, e a decisão envolve questões legais; trate-a no nível executivo, com assessoria jurídica.'),
          sl('Reconstrução do Active Directory', 'O AD é o centro da confiança em muitos ambientes (lição de AD). Se um adversário obteve privilégios de domínio, todas as credenciais devem ser consideradas comprometidas. A recuperação pode exigir restaurar os controladores de domínio a partir de backup limpo e conhecido, ou reconstruir uma floresta nova e migrar. Pontos conceituais: planejar a recuperação do AD antes de precisar (documentação, backups do estado do sistema testados, ordem de restauração), redefinir segredos de contas especiais, em particular as de serviço e de domínio, reemitir certificados quando a infraestrutura de chaves foi afetada, adotar camadas administrativas (administradores de domínio só em máquinas dedicadas) e revisar delegações. Trata-se de um projeto especializado, que merece ensaio.'),
          sl('Exercícios e engenharia do caos', 'Um plano não testado é uma hipótese. Faça exercícios de mesa (decisões) e exercícios técnicos de restauração (tempo real de recuperar um sistema crítico, comparado ao RTO). Engenharia do caos aplicada à segurança injeta falhas de forma controlada e planejada para verificar se a resiliência e a detecção funcionam: desligar um componente de registro para ver se alguém percebe, revogar uma credencial para testar a rotação, simular perda de uma região da nuvem. Regras: começar pequeno em ambiente de teste, ter hipótese clara, limites de impacto e botão de parada, comunicar às áreas envolvidas e registrar o aprendizado. É um complemento ao purple team (lição de emulação).'),
          sl('Lições de recuperação', 'Aprendizados recorrentes em recuperações públicas, em alto nível: a recuperação demora mais do que o previsto; faltam inventário e ordem de dependências (o que sobe primeiro?); backups existem, mas não estão isolados ou nunca foram restaurados; ferramentas de comunicação e de gestão ficam indisponíveis junto com o resto; credenciais administrativas são o ponto frágil; e há pouca documentação offline. Ações práticas: imprimir ou guardar fora de linha os contatos, os procedimentos e os diagramas críticos; manter ambiente de recuperação limpo e testado; definir critérios de retorno ao serviço; e, depois da crise, revisar e investir nas causas, não só nos sintomas.')
        ]
      },
      questions: [
        mcq('q1', 'O que representa o RPO de um sistema?', 'b', [
          'O tempo máximo que o sistema pode ficar fora do ar',
          'A quantidade máxima de dados que se aceita perder, medida em tempo',
          'O número de pessoas necessárias para restaurar o sistema',
          'O custo total do backup durante um ano de operação'
        ], 'RPO mede a perda de dados aceitável. O tempo máximo de indisponibilidade é o RTO.'),
        mcq('q2', 'Qual característica torna um backup resistente a ransomware?', 'd', [
          'Estar montado como unidade de rede acessível a os servidores do domínio',
          'Usar a mesma conta administrativa do domínio, para simplificar a rotina',
          'Ser armazenado no mesmo servidor dos dados, para a restauração ser mais rápida',
          'Ser imutável ou fora de linha, com credenciais separadas'
        ], 'Imutabilidade, isolamento de credenciais e testes impedem que o adversário apague as cópias. As demais práticas expõem os backups ao mesmo comprometimento.'),
        mcq('q3', 'Por que descobrir como o adversário entrou antes de restaurar os sistemas?', 'b', [
          'Porque a restauração só funciona depois do relatório forense completo, sem exceção',
          'Para não restaurar sobre um ambiente ainda comprometido e sofrer nova cifragem',
          'Porque o adversário vai pedir resgate depois da restauração terminar',
          'Porque o backup é inválido se a causa raiz não for publicada ao mercado'
        ], 'Sem tratar a causa e a persistência, o ataque pode se repetir. As outras afirmações não têm fundamento.'),
        fill('q4', 'Complete com a sigla do tempo máximo tolerável para restaurar um serviço (Recovery Time Objective).', '___ : Recovery Time Objective', ['RTO'], 'O RTO define quanto tempo o serviço pode ficar indisponível até a recuperação.'),
        mcq('q5', 'Na regra 3-2-1 de backup, o que significa o número 1?', 'a', [
          'Uma cópia fora do local ou fora de linha',
          'Uma única pessoa autorizada a executar a restauração',
          'Um único dia de retenção mínima por cópia de segurança',
          'Uma única mídia usada para as cópias, para facilitar a gestão'
        ], 'O 1 representa a cópia fora do local ou isolada. As demais interpretações não correspondem à regra.'),
        mcq('q6', 'Se um adversário obteve privilégios de domínio, qual premissa é a mais prudente na recuperação do AD?', 'b', [
          'Que a conta do administrador usada no ataque foi a única afetada',
          'Que todas as credenciais podem estar comprometidas e precisam ser redefinidas',
          'Que o AD se recupera sozinho após reiniciar os controladores de domínio',
          'Que o comprometimento do AD não afeta certificados nem contas de serviço'
        ], 'Com privilégios de domínio, os segredos precisam ser tratados como expostos. Reiniciar não resolve e certificados e contas de serviço também podem ser afetados.'),
        mcq('q7', 'Qual é uma boa prática em um experimento de engenharia do caos em segurança?', 'd', [
          'Executar primeiro em produção crítica, sem avisar ninguém, para obter resultados mais realistas',
          'Injetar falhas sem hipótese, observando o que acontece de inesperado',
          'Remover o botão de parada, para que o time reaja como em uma crise real',
          'Começar pequeno, com hipótese, limites e forma de parar'
        ], 'Experimentos controlados exigem hipótese, limites e parada. Testar às cegas em produção ou sem parada cria incidentes reais.'),
        fill('q8', 'Complete com o termo do backup que não pode ser alterado nem apagado durante o período de retenção.', 'backup ___ : não pode ser alterado nem apagado até o fim da retenção', ['imutável', 'imutavel', 'immutable'], 'Backups imutáveis resistem a tentativas de destruição por ransomware, desde que as credenciais e o acesso administrativo também sejam isolados.')
      ]
    },
    {
      id: 'csa-37-estudos-de-caso',
      title: 'Estudos de caso de incidentes públicos',
      goal: 'Analisar, em alto nível, categorias de incidentes públicos famosos (cadeia de suprimentos, biblioteca amplamente usada, ransomware em infraestrutura) e quais controles teriam ajudado.',
      xp: 30,
      intro: {
        slides: [
          sl('Como estudar um caso', 'Estudo de caso serve para aprender padrões, e não para apontar culpados. Use uma estrutura: o que aconteceu (em alto nível), como o adversário obteve acesso, o que permitiu o impacto, o que falhou (técnica, processo, pessoas) e quais controles teriam reduzido o dano ou acelerado a detecção. Aqui os casos são tratados por categoria e a partir de fatos públicos de alto nível, sem datas, valores ou estatísticas. Para detalhes, consulte sempre os relatórios oficiais e as análises das próprias organizações afetadas. Lembre-se de que o relato público costuma ser incompleto e de que se aprende mais com o padrão do que com o nome do incidente.'),
          sl('Categoria 1: comprometimento da cadeia de suprimentos de software', 'Padrão público conhecido: o adversário invadiu o ambiente de build ou distribuição de um fornecedor de software de uso amplo e fez com que atualizações legítimas e assinadas carregassem código malicioso; clientes que confiavam no fornecedor instalaram a atualização normalmente. O que falhou: confiança implícita em atualizações assinadas, pipeline de build com proteção insuficiente, pouca visibilidade sobre comportamento de software de terceiros dentro da rede. Controles que ajudam: proteção e isolamento do pipeline de build (lição de SLSA), builds reproduzíveis e assinatura com chaves protegidas, segmentação e menor privilégio para ferramentas de gestão, monitoramento de comportamento anômalo de software de gestão (conexões de saída incomuns), inventário de componentes (SBOM) e plano de resposta para comprometimento de fornecedor.'),
          sl('Categoria 2: vulnerabilidade em biblioteca amplamente usada', 'Padrão público conhecido: uma falha grave em uma biblioteca de uso muito difundido, presente em inúmeros produtos, muitas vezes de modo embutido, sem que as organizações soubessem que a usavam. O que falhou: falta de inventário de dependências (ninguém sabia onde a biblioteca estava), dificuldade de atualizar componentes embutidos em produtos de terceiros, sistemas expostos à internet sem camadas de proteção adicionais e dependência de mantenedores com poucos recursos. Controles que ajudam: SBOM e gestão de vulnerabilidades com priorização por exposição, capacidade de procurar rapidamente a presença de um componente, atualização rápida de itens críticos, defesa em profundidade (segmentação, filtro de saída de rede, menor privilégio) e processo de comunicação com fornecedores sobre status de correção.'),
          sl('Categoria 3: ransomware em infraestrutura essencial', 'Padrão público conhecido: um grupo de ransomware obteve acesso por credenciais comprometidas, serviço remoto exposto ou phishing, avançou pela rede, cifrou sistemas e interrompeu operações essenciais, em alguns casos com extorsão pela ameaça de divulgar dados. Em alguns episódios a organização desligou sistemas operacionais por precaução, por não ter certeza de que a parte de TI estava separada da operação, mostrando o efeito da convergência TI-OT. O que falhou: ausência de MFA em acesso remoto, rede plana, backups acessíveis ao adversário, pouca detecção de movimento lateral e recuperação não ensaiada. Controles: MFA resistente a phishing, segmentação e IDMZ (lição de OT), backups imutáveis, EDR e monitoramento de identidade, tabletop e plano de continuidade.'),
          sl('Padrões que se repetem', 'Comparando as categorias, aparecem temas estáveis: identidade e credenciais como porta de entrada mais comum; excesso de confiança em terceiros e em atualizações; visibilidade insuficiente (não saber o que se tem, nem o que acontece); segmentação fraca, que permite espalhar; backups e recuperação não testados; e comunicação de crise improvisada. Outro padrão: depois do incidente, a empresa investe no que falhou, mas o próximo ataque costuma vir por outro caminho; por isso, programas maduros investem em fundamentos (inventário, identidade, segmentação, detecção, recuperação) e em exercícios, e não em reação ao último caso.'),
          sl('Como usar o aprendizado', 'Transforme cada caso em perguntas para a sua organização: se o fornecedor X for comprometido, saberíamos detectar? Conseguimos listar em horas onde roda uma biblioteca Y? Se nossa rede de TI for cifrada, a operação continua? Cada resposta "não sei" vira uma ação no roadmap. Cuidado com vieses: casos famosos são os que viraram notícia, e não os mais comuns; copiar a defesa do último incidente pode custar caro sem reduzir o risco prioritário; e relatos públicos podem conter erros e interesses de quem os escreve (lição de relatórios). Use casos como ponto de partida para exercícios de mesa, sempre com cenário fictício adaptado à sua realidade.')
        ]
      },
      questions: [
        mcq('q1', 'No padrão de comprometimento da cadeia de suprimentos de software, o que permitiu o amplo alcance?', 'a', [
          'A confiança em atualizações assinadas que passaram a carregar código malicioso',
          'A ausência de qualquer antivírus nos computadores dos clientes finais',
          'O uso de senhas fracas pelos usuários finais dos produtos afetados',
          'A impossibilidade técnica de assinar atualizações de software'
        ], 'O adversário usou o canal legítimo de atualização, que os clientes confiavam. As outras causas não descrevem esse padrão.'),
        mcq('q2', 'Qual controle ajuda diretamente quando surge uma falha grave em biblioteca embutida em muitos produtos?', 'c', [
          'Desativar as atualizações automáticas dos sistemas para evitar surpresas',
          'Aguardar que os clientes finais reportem problemas antes de começar a procurar',
          'Inventário de componentes (SBOM) para localizar onde ela é usada',
          'Trocar a marca do antivírus corporativo por outra mais recente'
        ], 'Sem inventário, a empresa não sabe onde está exposta. As demais opções não ajudam a localizar nem a corrigir.'),
        mcq('q3', 'Em ataques de ransomware a infraestrutura essencial, qual combinação de falhas é comum nos relatos públicos?', 'd', [
          'MFA resistente a phishing em os acessos e segmentação rigorosa de redes',
          'Backups imutáveis testados e plano de continuidade ensaiado',
          'Monitoramento completo de identidade e resposta imediata a anomalias',
          'Acesso remoto sem MFA, rede plana e backups acessíveis ao adversário'
        ], 'Essas lacunas são as que aparecem de forma repetida. As demais alternativas descrevem controles que reduzem o dano.'),
        fill('q4', 'Complete com a sigla do inventário de componentes de software que ajuda a localizar uma biblioteca vulnerável.', 'consultar o ___ de cada produto para achar a biblioteca afetada', ['SBOM'], 'O SBOM lista componentes e versões, permitindo identificar rapidamente produtos afetados.'),
        mcq('q5', 'Por que algumas organizações desligaram sistemas operacionais por precaução durante um ataque de ransomware na TI?', 'b', [
          'Porque a lei obriga o desligamento da operação que há um incidente',
          'Porque não tinham certeza de que a TI estava separada da operação',
          'Porque o ransomware cifra equipamentos industriais por padrão, sem exceção',
          'Porque o desligamento é a única forma de recuperar os dados cifrados'
        ], 'A incerteza sobre a segmentação levou à contenção preventiva. As demais explicações são falsas ou exageradas.'),
        mcq('q6', 'Qual é um viés a evitar ao aprender com incidentes famosos?', 'c', [
          'Comparar os casos em busca de padrões repetidos entre categorias',
          'Consultar os relatórios oficiais das organizações afetadas',
          'Copiar só a defesa do último incidente famoso, sem avaliar o próprio risco',
          'Transformar o caso em perguntas e exercícios de mesa para a própria empresa'
        ], 'Copiar a defesa do último caso ignora o contexto e o risco real. As outras atitudes são boas práticas.'),
        mcq('q7', 'Qual investimento é mais coerente com os padrões que se repetem nos casos?', 'd', [
          'Concentrar o orçamento em uma única ferramenta, comprada após o último incidente da mídia',
          'Reduzir o investimento em recuperação, pois o foco deve ser prevenir os ataques',
          'Evitar exercícios de mesa, que consomem tempo e não alteram o resultado real',
          'Fundamentos como inventário, identidade, segmentação e recuperação testada'
        ], 'Fundamentos tratam as falhas recorrentes. Uma única ferramenta, nenhuma recuperação e nenhum exercício repetem as lacunas.'),
        fill('q8', 'Complete com a sigla do tipo de autenticação adicional que, quando ausente em acessos remotos, aparece como falha comum em casos públicos (autenticação multifator).', 'sem ___ no acesso remoto, uma credencial roubada basta para entrar', ['MFA', '2FA'], 'MFA reduz o valor de uma senha roubada; versões resistentes a phishing são ainda mais fortes.')
      ]
    },
    {
      id: 'csa-42-atribuicao-e-geopolitica-cibernetica',
      title: 'Atribuição e geopolítica cibernética',
      goal: 'Entender atores estatais e APTs, a diferença entre atribuição técnica e política, níveis de confiança, vieses e operações de influência, as normas internacionais em visão geral e o que uma organização privada pode concluir.',
      xp: 30,
      intro: {
        slides: [
          sl(
            'Atores e APTs',
            'Os atores de ameaça se distinguem por motivação e recursos: criminosos buscam lucro, hacktivistas buscam visibilidade e causa, insiders agem a partir de acesso legítimo e atores ligados a Estados buscam espionagem, influência, prejuízo estratégico ou pré-posicionamento em infraestruturas. O termo APT (Advanced Persistent Threat, ameaça persistente avançada) descreve campanhas de longa duração, com objetivos definidos, recursos e disciplina operacional, que se mantêm no ambiente da vítima por meses. Cuidado com dois pontos: primeiro, APT descreve o comportamento, e nem toda APT é estatal; segundo, cada fornecedor e pesquisador dá seus próprios nomes e agrupamentos, então um mesmo conjunto de atividade pode ter vários nomes e não há tabela universal. Nesta lição não se aponta nenhum país ou grupo específico: o foco é o método.'
          ),
          sl(
            'Atribuição técnica: evidências fortes e fracas',
            'Atribuir é ligar uma atividade maliciosa a quem a praticou. A atribuição técnica examina evidências: infraestrutura (domínios, servidores e sua reutilização), código de malware (reaproveitamento e estilo), táticas, técnicas e procedimentos (TTPs), horários de atividade, alvos escolhidos, idioma e erros operacionais. O problema é que muitas evidências são fracas: ferramentas comerciais ou vazadas são usadas por muitos grupos, a infraestrutura pode ser alugada ou comprometida de terceiros, e um adversário pode plantar pistas falsas (false flag), como textos em outro idioma ou fusos horários enganosos. Por isso o trabalho técnico normalmente avança por níveis: primeiro agrupar a atividade em um conjunto (cluster), depois relacioná-lo a um grupo conhecido e só então, com muito mais evidência, falar de um patrocinador.',
            'atividade observada -> cluster -> grupo -> patrocinador\n(a cada passo, mais evidencia e mais cautela)'
          ),
          sl(
            'Níveis de confiança e método',
            'Uma boa conclusão de atribuição informa o grau de confiança: baixo (poucas evidências, fracas ou explicações alternativas igualmente plausíveis), moderado (evidências consistentes, mas com lacunas) ou alto (várias linhas independentes de evidência convergindo). Ferramentas de método: o Modelo do Diamante organiza a análise em adversário, capacidade, infraestrutura e vítima, e mostra as ligações entre eles; a análise de hipóteses concorrentes (ACH) lista hipóteses alternativas e procura a que tem MENOS evidência contrária, em vez de procurar apenas confirmações. Escreva as premissas, registre as lacunas e esteja pronto para revisar a conclusão se surgirem dados novos. Linguagem como "é possível", "provável" e "quase certo" precisa ser usada com critério consistente, e não por impressão.'
          ),
          sl(
            'Atribuição política x atribuição técnica',
            'Quando um governo atribui publicamente um ataque a outro Estado, a decisão é política, além de técnica: considera inteligência que não é pública, aliados, consequências diplomáticas e o objetivo de dissuasão. Isso significa que a atribuição política pode ter mais informação do que a técnica (fontes sigilosas) e, ao mesmo tempo, pode ser motivada por interesses que não aparecem nas evidências. Já a atribuição técnica de uma empresa trabalha apenas com o que ela observa e deve declarar seus limites. Entender a diferença evita dois erros: tratar um comunicado oficial como se fosse prova técnica verificável e tratar um relatório técnico como se fosse veredito político. A atribuição também não precisa ser pública para ser útil: compartilhar indicadores com pares do setor e com equipes de resposta a incidentes é muitas vezes mais valioso.'
          ),
          sl(
            'Viés, desinformação e operações de influência',
            'Vieses atrapalham: o viés de confirmação procura evidências que sustentem a hipótese inicial; a ancoragem prende a análise na primeira explicação; a narrativa geopolítica do momento faz parecer óbvio quem seria o culpado. Adversários exploram isso com pistas plantadas e com a pressa da imprensa. Operações de influência são campanhas coordenadas para moldar percepções: contas falsas, redes de amplificação, conteúdo manipulado e, às vezes, o vazamento seletivo de informações reais ou adulteradas (hack-and-leak) para criar impacto político. Para a defesa de uma organização, o relevante é: verificar a fonte antes de repetir, buscar confirmação independente, observar sinais de coordenação (contas novas, mensagens idênticas, picos artificiais), ter um plano de comunicação para quando a marca ou o executivo forem alvo de desinformação e não amplificar o material falso sem necessidade.'
          ),
          sl(
            'Normas internacionais em visão geral',
            'O ciberespaço não é uma zona sem regras, mas as regras estão em evolução. Em visão geral: discute-se, em fóruns multilaterais, que o direito internacional existente se aplica ao comportamento dos Estados no ciberespaço; há normas voluntárias de comportamento responsável, como não atacar infraestruturas críticas civis em tempo de paz e cooperar em investigações; medidas de transparência e de construção de confiança entre países; e acordos de cooperação em cibercrime, como a Convenção de Budapeste, voltada à cooperação entre autoridades. Há debates em aberto, por exemplo, sobre quando uma operação cibernética configura uso de força e como definir a responsabilidade do Estado. Para uma organização privada, o ponto prático é saber que essas normas existem, que a resposta a atores estatais envolve governo e autoridades, e que ela não é a instância para fazer valer essas regras.'
          ),
          sl(
            'O que uma organização privada deve (e não deve) concluir',
            'DEVE: descrever o que observou (indicadores, TTPs, linha do tempo); relacionar a atividade a clusters e grupos conhecidos com o grau de confiança declarado; usar a inteligência para melhorar detecção e mitigação, que é o que muda o resultado; compartilhar indicadores com CSIRTs, parceiros do setor e autoridades pelos canais apropriados; envolver o jurídico e a comunicação antes de qualquer declaração externa. NÃO DEVE: acusar publicamente um Estado ou uma pessoa com base em indícios técnicos; afirmar certeza onde há apenas hipótese; retaliar ou invadir sistemas de terceiros (o chamado hack back), que pode configurar crime, como prevê a Lei 12.737/2012 em visão geral, além de atingir vítimas inocentes cujos sistemas foram usados como intermediários; expor endereços IP e dados pessoais de terceiros sem necessidade, pois podem ser dados pessoais sob a LGPD. Lembre-se: a atribuição raramente muda o que é preciso fazer para conter e se recuperar. Este material é educacional e não substitui orientação jurídica.'
          )
        ]
      },
      questions: [
        mcq('q1', 'Um relatório observa textos em um idioma específico dentro de um malware e conclui que o autor é de determinado país. Qual é a crítica mais adequada?', 'a', [
          'O idioma é indício fraco: pode ser plantado como pista falsa (false flag)',
          'O idioma é a evidência mais forte possível, e dispensa qualquer outra linha de análise',
          'Textos em malware são irrelevantes, e devem ser descartados da análise por completo',
          'O idioma só importa se o malware for cifrado, o que torna o texto legível'
        ], 'Idioma e fuso são indícios fracos e fáceis de forjar. Eles podem compor o quadro, mas não bastam; não são nem a prova máxima nem totalmente irrelevantes.'),
        mcq('q2', 'Qual é a diferença central entre uma atribuição política e uma atribuição técnica?', 'c', [
          'A política usa dados públicos, enquanto a técnica depende de informação sigilosa',
          'A técnica é decidida por governos, e a política por empresas privadas do setor',
          'A política envolve inteligência não pública e consequências diplomáticas; a técnica se limita ao que a equipe observa',
          'Não existe diferença, pois ambas seguem exatamente o mesmo processo e as mesmas motivações'
        ], 'A atribuição política pode ter fontes sigilosas e objetivos diplomáticos, enquanto a técnica trabalha com os dados observáveis e deve declarar limites. A afirmação inversa sobre quem decide e sobre dados está trocada.'),
        mcq('q3', 'Dois analistas discordam sobre o autor de uma campanha. Uma abordagem metodológica adequada é:', 'b', [
          'Votar e adotar a hipótese da maioria, sem registrar a discordância',
          'Listar hipóteses concorrentes e priorizar a de menor evidência contrária',
          'Escolher a hipótese mais conhecida pela imprensa, que tem maior aceitação pública',
          'Esperar o fim do incidente para só então começar a levantar evidências'
        ], 'A análise de hipóteses concorrentes combate o viés de confirmação. Votação, popularidade na imprensa e adiar a coleta de evidências não são métodos analíticos sólidos.'),
        fill('q4', 'Complete o termo para o grau que informa quão forte é a conclusão de uma atribuição.', 'Toda conclusão de atribuição deve declarar o nível de ___ (baixo, moderado ou alto).', ['confiança', 'confianca'], 'O nível de confiança comunica ao leitor o peso das evidências e das lacunas, evitando passar uma hipótese por fato.'),
        mcq('q5', 'Uma equipe de resposta a incidentes de uma empresa privada identifica TTPs que lembram um grupo conhecido. O que é mais adequado concluir e fazer?', 'd', [
          'Divulgar nas redes que determinado país é o responsável, para alertar o mercado',
          'Invadir a infraestrutura do suposto atacante para coletar provas e interromper a campanha',
          'Descartar a informação, já que atribuição não ajuda a defesa',
          'Registrar a semelhança com grau de confiança declarado, usar os TTPs para melhorar a detecção e compartilhar por canais apropriados'
        ], 'O valor está em usar os TTPs na defesa e compartilhar com cautela. Acusar publicamente, retaliar (hack back, que pode ser crime e atingir vítimas) ou descartar a informação são erros.'),
        mcq('q6', 'Qual característica descreve uma operação de influência?', 'a', [
          'Campanha coordenada, com contas falsas ou conteúdo manipulado',
          'Falha de software que permite execução de código remoto em servidores',
          'Ataque que cifra arquivos e exige pagamento para devolvê-los',
          'Atualização de segurança distribuída por um fabricante a seus clientes'
        ], 'Operações de influência atuam sobre a percepção pública por meio de coordenação e manipulação. As demais opções descrevem vulnerabilidade, ransomware e correção de software.'),
        mcq('q7', 'Uma empresa quer publicar em seu relatório os endereços IP de terceiros envolvidos em um incidente. Qual cuidado é adequado?', 'c', [
          'Não há cuidado especial, pois endereços IP são públicos e, portanto, não são dados pessoais',
          'Publicar também os nomes dos titulares das linhas, para facilitar a identificação do culpado',
          'Avaliar necessidade e risco: IPs podem ser dados pessoais e pertencer a vítimas',
          'Publicar se a LGPD não existir no país em que a empresa atua'
        ], 'Um IP pode identificar uma pessoa e pertencer a uma vítima cujo sistema foi usado como intermediário, então se avalia necessidade e risco com o jurídico. Publicar nomes agrava o problema, e a LGPD existe no Brasil.'),
        fill('q8', 'Complete a sigla que designa campanhas de longa duração, com objetivos definidos, recursos e persistência no ambiente da vítima.', 'Ameaça persistente avançada: ___ (Advanced Persistent Threat).', ['APT', 'apt'], 'APT descreve o comportamento da campanha (persistente, direcionada e com recursos), e não implica que o autor seja um Estado.')
      ]
    },
    {
      id: 'csa-38-lendo-relatorios-e-tendencias',
      title: 'Lendo relatórios e tendências',
      goal: 'Ler relatórios de incidentes e avisos de segurança com senso crítico, reconhecer vieses de fonte e estatísticas, e identificar tendências estáveis.',
      xp: 30,
      intro: {
        slides: [
          sl('Por que ler relatórios com método', 'Relatórios de ameaças, avisos de vulnerabilidade e análises de incidentes orientam decisões de investimento e de prioridade. Mas cada um foi escrito por alguém com objetivos, dados e limites próprios. Ler com método significa perguntar: quem publicou e por quê? Que dados sustentam a conclusão? Quão representativa é a amostra? A conclusão se aplica ao meu contexto? Ler passivamente leva a copiar prioridades que não são suas e a ser influenciado por quem quer vender algo. Esta lição ensina a fazer essas perguntas e identificar tendências estáveis, sem citar números específicos que mudam.'),
          sl('Tipos de fonte e seus vieses', 'Fornecedores de segurança publicam relatórios com dados de seus clientes: a amostra é de quem os contrata (viés de seleção), e a conclusão muitas vezes favorece o tipo de produto vendido. Relatórios de resposta a incidentes veem quem teve incidente grave e chamou ajuda. Pesquisas de opinião refletem percepções e não fatos. Órgãos governamentais e centros de resposta (CERTs) publicam avisos mais neutros, mas com foco em seu público. Pesquisadores independentes e comunidade abrem detalhes técnicos, com variação de qualidade. Nenhuma fonte tem a visão completa; combine várias e identifique pontos de convergência. Desconfie de manchetes que usam termos como "recorde" sem mostrar a base de comparação.'),
          sl('Pensando criticamente sobre estatísticas', 'Perguntas úteis: qual é o denominador? (um aumento de 100% de um número pequeno é pouco relevante); a amostra representa o meu setor e porte?; a definição mudou entre os anos (o que conta como incidente)?; correlação não implica causa; médias escondem distribuições (um tempo médio de detecção pode ser puxado por poucos casos longos); e o que não aparece nos dados, como incidentes não detectados ou não relatados (viés de sobrevivência e de relato). Cuidado com a falsa precisão ("73,4%") e com gráficos de eixo truncado. Prefira tendências e ordens de grandeza a valores exatos, e verifique a metodologia, que costuma estar no apêndice.'),
          sl('Avisos de segurança e vulnerabilidades', 'Um aviso de vulnerabilidade traz identificação (CVE), descrição, produtos e versões afetados, severidade (por exemplo CVSS) e correção ou mitigação. Priorização real combina: a severidade técnica, a exposição do seu ativo (está na internet?), a existência de exploração ativa conhecida (catálogos públicos de vulnerabilidades exploradas ajudam), a criticidade do sistema e as defesas existentes. Severidade alta não significa que a falha seja a mais urgente para você; uma média em sistema exposto e com exploração ativa pode ser mais urgente que uma crítica em sistema isolado. Leia o aviso do fabricante, e não apenas resumos de terceiros, e registre a decisão e o prazo.'),
          sl('Tendências estáveis', 'Em vez de decorar números, observe direções que se mantêm entre relatórios sérios: identidade é a principal superfície (credenciais roubadas, phishing, abuso de sessões e de contas privilegiadas); a nuvem desloca o risco para configuração e identidade; a cadeia de suprimentos de software e de serviços é um vetor crescente; ransomware e extorsão seguem como ameaça persistente de impacto alto; IA aumenta a escala do phishing e da engenharia social e também ajuda a defesa; passkeys e autenticação resistente a phishing avançam como resposta; e a transição para criptografia pós-quântica começa a ser planejada (lição de cripto avançada). Use tendências para direcionar o roadmap, e não como previsão exata.'),
          sl('Rotina de leitura e decisão', 'Monte uma rotina leve: algumas fontes confiáveis e variadas (avisos oficiais de CERT, fabricantes dos produtos que você usa e uma ou duas análises independentes), um registro curto do que é relevante para o seu ambiente, uma pergunta fixa ("o que isso muda no nosso risco?") e um ritual de transformar achados em ações (ticket, ajuste de regra, item de roadmap, tema de exercício). Compartilhe resumos objetivos com as equipes e a diretoria. E mantenha humildade: relatórios mostram o passado de outros; o seu risco depende do seu ambiente, das suas defesas e dos seus adversários prováveis.')
        ]
      },
      questions: [
        mcq('q1', 'Um relatório de um fornecedor de segurança mostra que 90% dos incidentes de seus clientes envolveram um certo vetor. Qual cautela é a mais adequada?', 'b', [
          'Aceitar o número como representativo de o mercado, pois o fornecedor tem muitos dados',
          'Considerar o viés de seleção da amostra e comparar com outras fontes',
          'Descartar o relatório inteiro, pois fornecedores não publicam informação útil',
          'Usar o número como meta de investimento exata para a própria empresa'
        ], 'A amostra é formada por clientes do fornecedor, o que limita a generalização. Descartar tudo ou aceitar sem crítica são extremos.'),
        mcq('q2', 'Uma notícia diz que ataques "aumentaram 200%". Qual é a primeira pergunta crítica?', 'd', [
          'Qual é a cor do gráfico usado na reportagem?',
          'Quantas páginas tem o relatório original?',
          'Quem foi o primeiro a divulgar o número na imprensa?',
          'Qual é o número de base (denominador) e a definição do que foi contado?'
        ], 'Sem base e definição, a variação percentual pode enganar. As outras perguntas não avaliam o dado.'),
        mcq('q3', 'O que é viés de sobrevivência ou de relato em estatísticas de incidentes?', 'a', [
          'Só entram nos dados os incidentes detectados e relatados',
          'A tendência de relatórios mencionarem incidentes em empresas pequenas',
          'O fato de as estatísticas serem produzidas por governos',
          'A obrigação de que todo incidente seja divulgado em até uma semana'
        ], 'O que não é detectado ou relatado não entra nos números, o que distorce a visão. As demais opções não descrevem o viés.'),
        fill('q4', 'Complete com a sigla do identificador padronizado de vulnerabilidades publicamente conhecidas (Common Vulnerabilities and Exposures).', 'aviso de vulnerabilidade com identificador ___-ANO-NUMERO', ['CVE'], 'CVE é o identificador padrão de vulnerabilidades, usado em avisos e em bases públicas.'),
        mcq('q5', 'Duas vulnerabilidades: uma crítica em sistema isolado, sem exposição, e uma média em sistema na internet com exploração ativa conhecida. Qual priorização é coerente?', 'd', [
          'A crítica primeiro, porque a severidade é o único critério confiável',
          'Ignorar ambas até que o fabricante publique um relatório adicional',
          'Corrigir primeiro a que o fornecedor de segurança mais divulgar',
          'Considerar exposição e exploração ativa, que podem tornar a média mais urgente'
        ], 'A priorização combina severidade, exposição, exploração e criticidade. Severidade isolada não basta.'),
        mcq('q6', 'Qual afirmação sobre tendências é a mais adequada?', 'b', [
          'Tendências são previsões exatas e devem ser usadas para fixar o orçamento ao centavo',
          'Tendências estáveis orientam o roadmap, sem substituir a análise do seu risco',
          'Tendências valem se vierem acompanhadas de percentuais com duas casas decimais',
          'Tendências não têm utilidade, pois cada incidente é único'
        ], 'Tendências indicam direção, não previsão exata. Ainda assim, o roadmap deve refletir o risco da própria organização.'),
        mcq('q7', 'Qual prática compõe uma boa rotina de leitura de fontes?', 'c', [
          'Seguir uma única fonte, a mais popular, e aplicar tudo o que ela recomendar',
          'Ler as manchetes, para economizar tempo, e agir por impulso',
          'Poucas fontes variadas e transformação dos achados em ações',
          'Evitar compartilhar resumos com as equipes, para não gerar alarme'
        ], 'Fontes variadas e conversão em ação tornam a leitura útil. As demais práticas aumentam vieses e inação.'),
        fill('q8', 'Complete com o nome do sistema de pontuação de severidade de vulnerabilidades usado em muitos avisos (Common Vulnerability Scoring System).', 'severidade técnica de uma vulnerabilidade: pontuação ___', ['CVSS'], 'CVSS padroniza a severidade técnica, mas não leva em conta o seu contexto de exposição e de exploração.')
      ]
    },
    {
      id: 'csa-39-projeto-integrador-soc',
      title: 'Projeto integrador: programa de detecção e resposta',
      goal: 'Integrar o curso desenhando o programa de detecção e resposta de uma empresa fictícia: fontes de log, regras, playbooks, métricas e LGPD.',
      xp: 30,
      intro: {
        slides: [
          sl('O cenário fictício', 'A empresa Aurora Pagamentos (inteiramente fictícia) é uma fintech com 600 funcionários, um aplicativo móvel e um portal web para clientes, parte da infraestrutura em nuvem pública e parte em datacenter próprio, um Active Directory híbrido, um fornecedor externo de processamento de cartões e dados pessoais de clientes (nomes, documentos, transações). Não há SOC: apenas uma equipe de TI que olha alertas de antivírus. A diretoria quer um programa de detecção e resposta em 12 meses, com orçamento limitado. Seu papel é desenhar o programa, justificar prioridades e preparar a comunicação. Nenhum dado real é usado; todos os nomes e números são inventados.'),
          sl('Passo 1: ativos, ameaças e fontes de log', 'Comece pelos ativos críticos (plataforma de pagamentos, banco de dados de clientes, identidade) e pelos cenários prováveis, derivados do ATT&CK (lição de táticas): credenciais roubadas e acesso a contas privilegiadas, ransomware via phishing, abuso de configuração em nuvem, comprometimento de fornecedor, fraude por conta de cliente tomada. Fontes de log prioritárias: provedor de identidade e AD (autenticações, mudanças de grupo), nuvem (logs de controle e de acesso a dados), EDR nos servidores e estações, e-mail, proxy e DNS, firewall e VPN, aplicação (autenticação do portal, transações incomuns) e registros do fornecedor, quando disponíveis. Defina retenção, sincronização de relógio, proteção contra adulteração e mascaramento de dados pessoais nos logs (minimização, LGPD).'),
          sl('Passo 2: regras de detecção e engenharia', 'Priorize detecções de alto valor e baixo ruído: login de conta privilegiada fora do padrão, desativação de logs, criação de credenciais ou chaves na nuvem, uso de honeytokens (lição de deception), execução suspeita de scripts em servidores, volume incomum de leitura de dados de clientes, mudanças em grupos privilegiados e tentativas de MFA repetidas. Trate regras como código: versionadas, revisadas, testadas, com dono, mapeadas ao ATT&CK e com critério de ajuste (lição de engenharia de detecção). Meça a cobertura com emulações de purple team (lição de emulação). Comece com poucas regras bem afinadas, em vez de centenas que ninguém entende.'),
          sl('Passo 3: playbooks e operação', 'Playbooks iniciais: credencial comprometida (revogar sessões, redefinir segredos, revisar atividade), phishing relatado (analisar, remover mensagens, bloquear indicadores), ransomware (isolar, preservar evidências, decidir sobre contenção em conjunto com negócio), vazamento de dados pessoais (acionar jurídico e encarregado, avaliar comunicação à ANPD e aos titulares conforme a regulamentação vigente), comprometimento de fornecedor e incidente em nuvem. Modelo operacional: começar com serviço gerenciado de detecção e resposta (MDR) fora do horário e uma pequena equipe interna que conhece o negócio; níveis de autonomia graduados para automação (lição de IA no SOC); escalonamento claro e papéis de crise (lição de gestão de crise).'),
          sl('Passo 4: métricas, melhoria e privacidade', 'Métricas: tempo para detectar e para responder, percentual de ativos críticos com logs e EDR, proporção de alertas acionáveis, cobertura das técnicas prioritárias, tempo de restauração versus RTO e lacunas fechadas por trimestre. Relate à diretoria com tendência e decisões (lição de CISO), e estime o ganho em perda esperada (lição de FAIR). Privacidade: logs e investigações tratam dados pessoais, então se aplicam finalidade, minimização, acesso restrito, retenção definida e registro das operações; monitoramento de funcionários exige transparência e base legal; contratos com MSSP e MDR precisam de cláusulas de operador (lição de TPRM). Consulte o jurídico e o encarregado; isso não substitui orientação jurídica.'),
          sl('Roteiro de 12 meses e decisões integradas', 'Roteiro sugerido: meses 1 a 3, inventário de ativos críticos, MFA forte e logs de identidade e nuvem no SIEM, MDR contratado e primeiros playbooks; meses 4 a 6, EDR em servidores, detecções prioritárias e honeytokens, backups imutáveis e teste de restauração; meses 7 a 9, purple team, segmentação e acesso privilegiado (PAM), exercício de mesa de crise; meses 10 a 12, automação limitada, TPRM dos fornecedores críticos, revisão de métricas e do plano. Decisões típicas: o que priorizar com orçamento limitado (identidade, backup e visibilidade antes de tecnologia sofisticada); o que terceirizar; quanto de autonomia dar à automação; como comunicar riscos remanescentes. Documente e peça aceite formal.')
        ]
      },
      questions: [
        mcq('q1', 'Com orçamento limitado e sem SOC, qual conjunto de prioridades iniciais é mais coerente para a empresa fictícia?', 'd', [
          'Comprar a plataforma de IA mais cara e adiar a coleta de logs para o segundo ano',
          'Investir em treinamento e em campanhas de phishing, sem tecnologia de detecção',
          'Contratar muitas ferramentas diferentes sem pessoas para operá-las',
          'MFA forte, logs de identidade e nuvem, serviço gerenciado de detecção e backup testado'
        ], 'Identidade, visibilidade e recuperação reduzem mais risco por real investido. Tecnologia sofisticada sem logs, só treinamento ou ferramentas sem operação deixam lacunas.'),
        mcq('q2', 'Por que mascarar dados pessoais nos logs enviados ao SIEM, quando possível?', 'a', [
          'Por minimização: reduz a exposição e mantém o valor investigativo',
          'Porque o SIEM não consegue armazenar campos de texto com nomes de pessoas',
          'Porque mascarar elimina a necessidade de qualquer controle de acesso aos logs',
          'Porque a LGPD proíbe o uso de logs em qualquer investigação de segurança'
        ], 'A minimização limita a exposição sem impedir a investigação. O mascaramento não elimina o controle de acesso, e a LGPD não proíbe logs de segurança. Não substitui orientação jurídica.'),
        mcq('q3', 'Qual é a melhor forma de tratar as regras de detecção no programa?', 'b', [
          'Como configurações informais mantidas na memória do analista mais antigo',
          'Como código: versionadas, revisadas, testadas, com dono e mapeadas ao ATT&CK',
          'Como itens que devem ser criados em grande número, sem revisão, para cobrir tudo',
          'Como arquivos que só podem ser alterados pelo fornecedor do SIEM'
        ], 'Tratar regras como código dá rastreabilidade e qualidade. Informalidade e volume sem revisão geram ruído e lacunas.'),
        fill('q4', 'Complete com a sigla do serviço gerenciado de detecção e resposta que pode cobrir o horário em que a equipe interna não está presente.', '___ : Managed Detection and Response', ['MDR'], 'O MDR é um serviço gerenciado que monitora e responde a ameaças; deve vir com cláusulas contratuais adequadas, inclusive de proteção de dados.'),
        mcq('q5', 'Um funcionário relata que clicou em um link e digitou a senha em uma página falsa. Qual é a primeira ação do playbook?', 'c', [
          'Aguardar para ver se há sinais de abuso antes de tomar qualquer providência',
          'Punir o funcionário publicamente para desencorajar novos casos',
          'Revogar sessões, redefinir a senha e revisar a atividade da conta',
          'Reiniciar o computador do funcionário e considerar o assunto encerrado'
        ], 'A resposta rápida limita o uso da credencial roubada. Esperar, punir ou apenas reiniciar não contém o risco e desincentivam relatos.'),
        mcq('q6', 'Um incidente expõe dados pessoais de clientes da empresa fictícia. Qual postura reflete bem as lições do curso?', 'd', [
          'Decidir sozinho na equipe técnica e comunicar a ANPD com base em um prazo lembrado de memória',
          'Esconder o caso e rever a necessidade de comunicação se houver reclamação pública',
          'Pedir ao fornecedor de cartões que assuma a responsabilidade de comunicar qualquer incidente',
          'Acionar jurídico e encarregado e avaliar a comunicação conforme a norma vigente'
        ], 'A decisão é conjunta e baseada na norma vigente. Memória de prazo, esconder o caso ou terceirizar a responsabilidade são riscos. Não substitui orientação jurídica.'),
        mcq('q7', 'Qual conjunto de métricas é mais adequado para a diretoria acompanhar a evolução do programa?', 'c', [
          'Número total de alertas gerados no mês, sem distinguir os acionáveis',
          'Quantidade de ferramentas instaladas e de licenças em uso',
          'Tempos de detecção e resposta, cobertura de logs e restauração versus RTO',
          'Número de e-mails de phishing bloqueados no mês, apresentado isoladamente como se fosse a medida de segurança da empresa'
        ], 'Métricas de resultado e cobertura mostram evolução do risco. Volumes brutos, inventário de ferramentas e contagens isoladas induzem a conclusões erradas.'),
        fill('q8', 'Complete com o termo do tipo de exercício que reúne direção, jurídico, comunicação e TI para treinar decisões de crise sem sistemas reais (exercício de ___).', 'exercício de ___ : simulação por discussão para treinar a gestão de crise', ['mesa', 'tabletop'], 'O exercício de mesa treina papéis e decisões antes da crise real.')
      ]
    },
  ]
};
