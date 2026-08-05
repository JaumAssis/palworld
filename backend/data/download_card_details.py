"""
Baixa os detalhes COMPLETOS de cada carta (efeito, elemento, work suitability, flavor text, etc)
direto da página individual de cada carta na API do palworldtcg.gg.

Uso: coloque este script na mesma pasta do palworld_all_cards.json e rode:
    pip install requests
    python download_card_details.py
"""
import json
import re
import time
import requests

INPUT_JSON = "palworld_all_cards.json"
OUTPUT_JSON = "palworld_card_details.json"
BASE_URL = "https://palworldtcg.gg/api/v1/cards/"


def slugify(text):
    text = text.lower().replace("–", "-").replace("!", "").replace("?", "")
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def main():
    with open(INPUT_JSON, encoding="utf-8") as f:
        cards = json.load(f)

    results = {}
    total = len(cards)

    for i, card in enumerate(cards, 1):
        card_number = card["card_number"]
        slug = f"{card_number.lower()}-{slugify(card['name'])}"
        url = BASE_URL + slug

        try:
            resp = requests.get(url, timeout=15)
            if resp.status_code == 200:
                results[card_number] = resp.json()
                print(f"[{i}/{total}] OK: {card_number}")
            else:
                print(f"[{i}/{total}] FALHOU ({resp.status_code}): {card_number} -> {url}")
        except Exception as e:
            print(f"[{i}/{total}] ERRO: {card_number} -> {e}")

        time.sleep(0.15)  # não sobrecarregar o servidor

    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\nConcluído: {len(results)}/{total} cartas salvas em {OUTPUT_JSON}")
    if results:
        first_key = next(iter(results))
        print(f"\nExemplo de campos disponíveis (carta {first_key}):")
        print(list(results[first_key].keys()))


if __name__ == "__main__":
    main()