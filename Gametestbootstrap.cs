using UnityEngine;
using System.Collections.Generic;
using System.Linq;

/// Script de TESTE. Coloque num GameObject vazio na cena junto com o TurnManager.
/// Aperte ESPAÇO para avançar de fase e ver tudo no Console.
public class GameTestBootstrap : MonoBehaviour
{
    public TurnManager turnManager;
    public CardDatabase cardDatabase; // arraste o CardDatabase.asset aqui no Inspector

    void Start()
    {
        if (turnManager == null)
            turnManager = GetComponent<TurnManager>();

        Debug.Log("TurnManager: " + turnManager);
        Debug.Log("CardDatabase: " + cardDatabase);

        PlayerState p1 = BuildTestPlayer("Jogador 1");
        PlayerState p2 = BuildTestPlayer("Jogador 2");

        turnManager.SetupGame(p1, p2, true);
    }

    void Update()
    {
        if (Input.GetKeyDown(KeyCode.Space))
        {
            Debug.Log(">>> Avançando fase (ESPAÇO pressionado) <<<");
            turnManager.AdvancePhase();
        }

        // Tecla A: ataca com o primeiro Pal Standing do jogador ativo
        if (Input.GetKeyDown(KeyCode.A))
        {
            var attacker = turnManager.ActivePlayer.base_Pals.FirstOrDefault(p => p.isStanding);
            if (attacker != null)
                turnManager.AttackPlayer(attacker);
            else
                Debug.Log("Nenhum Pal Standing disponível pra atacar.");
        }

        // Tecla D: tenta deployar o primeiro Pal da mão
        if (Input.GetKeyDown(KeyCode.D))
        {
            var pal = turnManager.ActivePlayer.hand.FirstOrDefault(c => c.cardType == CardType.Pal);
            if (pal != null)
                turnManager.ActivePlayer.TryDeployPal(pal);
            else
                Debug.Log("Nenhum Pal na mão pra deployar.");
        }
    }

    /// Monta um jogador de teste com deck embaralhado e Soul Deck simples
    private PlayerState BuildTestPlayer(string name)
    {
        var p = new PlayerState { playerName = name };

        // pega 50 cartas quaisquer do database só pra teste (não segue as regras de deck ainda)
        var allPals = cardDatabase.GetByType(CardType.Pal);
        var pool = allPals.Concat(cardDatabase.GetByType(CardType.Event))
                           .Concat(cardDatabase.GetByType(CardType.Structure))
                           .ToList();

        p.deck = ShuffleForTest(pool).Take(50).ToList();

        // Soul Deck: 10 cartas quaisquer (idealmente seriam cartas "Soul" reais)
        p.soulDeck = ShuffleForTest(pool).Take(10).ToList();

        return p;
    }

    private List<CardData> ShuffleForTest(List<CardData> list)
    {
        return list.OrderBy(x => Random.value).ToList();
    }
}