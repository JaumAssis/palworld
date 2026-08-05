"""
Percorre palworld_card_details.json e, pra cada carta do tipo Pal, mostra o nome
e pergunta os tipos elementais (ex: fire, dragon). Salva como "typepal": ["fire", "dragon"].

Uso:
    python assign_pal_types.py

Comandos durante a digitação:
    - Digite os tipos separados por vírgula (ex: fire, dragon)
    - Aperte ENTER vazio pra pular essa carta (fica sem tipo, pergunta de novo depois)
    - Digite "sair" pra salvar e encerrar a qualquer momento
"""
import json
import os

INPUT_FILE = "palworld_card_details.json"


def main():
    if not os.path.exists(INPUT_FILE):
        print(f"Arquivo {INPUT_FILE} não encontrado nessa pasta.")
        return

    with open(INPUT_FILE, encoding="utf-8") as f:
        cards = json.load(f)

    pal_entries = [
        (card_number, entry) for card_number, entry in cards.items()
        if entry.get("data", {}).get("card_type") == "Pal"
    ]

    pending = [(num, e) for num, e in pal_entries if "typepal" not in e["data"]]
    total_pals = len(pal_entries)
    already_done = total_pals - len(pending)

    print(f"Total de Pals: {total_pals} | Já classificados: {already_done} | Faltam: {len(pending)}\n")

    for i, (card_number, entry) in enumerate(pending, 1):
        data = entry["data"]
        name = data.get("name", card_number)

        print(f"[{i}/{len(pending)}] {card_number} — {name}")
        raw = input("  Tipos (separados por vírgula, ENTER pula, 'sair' salva e encerra): ").strip()

        if raw.lower() == "sair":
            print("Encerrando e salvando o que já foi feito...")
            break

        if raw == "":
            print("  Pulado.\n")
            continue

        types = [t.strip().lower() for t in raw.split(",") if t.strip()]
        data["typepal"] = types
        print(f"  Salvo: {types}\n")

        # salva a cada carta, pra não perder progresso se fechar no meio
        with open(INPUT_FILE, "w", encoding="utf-8") as f:
            json.dump(cards, f, ensure_ascii=False, indent=2)

    with open(INPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(cards, f, ensure_ascii=False, indent=2)

    done_now = sum(1 for _, e in pal_entries if "typepal" in e["data"])
    print(f"\nConcluído por enquanto: {done_now}/{total_pals} Pals com typepal definido.")


if __name__ == "__main__":
    main()
    