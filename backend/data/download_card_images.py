"""
Baixa as imagens de TODAS as cartas: 149 bases (palworld_all_cards.json)
+ 59 variantes Altered Art (bp01_variants.json + td02_variants.json).

Uso: coloque este script na mesma pasta dos 3 arquivos JSON acima e rode:
    pip install requests
    python download_card_images.py
"""
import json
import os
import requests
import time

OUTPUT_DIR = "CardArt"
SUPABASE_BASE = "https://sqftyennjqxlnfpoidah.supabase.co/storage/v1/object/public/card-images/official"


def load_cards():
    cards = []

    with open("palworld_all_cards.json", encoding="utf-8") as f:
        base_cards = json.load(f)
    cards.extend(base_cards)

    for filename in ["bp01_variants.json", "td02_variants.json"]:
        if not os.path.exists(filename):
            print(f"Aviso: {filename} não encontrado, pulando variantes desse arquivo.")
            continue
        with open(filename, encoding="utf-8") as f:
            variants = json.load(f)
        for v in variants:
            v["image_url"] = f"{SUPABASE_BASE}/{v['set_code']}/{v['card_number']}.png"
            cards.append(v)

    return cards


def main():
    cards = load_cards()
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    total = len(cards)
    ok, fail = 0, 0

    for i, card in enumerate(cards, 1):
        url = card.get("image_url")
        card_number = card.get("card_number", f"card_{i}")
        if not url:
            print(f"[{i}/{total}] SEM image_url: {card_number}")
            fail += 1
            continue

        filename = f"{card_number}.png"
        filepath = os.path.join(OUTPUT_DIR, filename)

        if os.path.exists(filepath):
            print(f"[{i}/{total}] já existe: {filename}")
            ok += 1
            continue

        try:
            resp = requests.get(url, timeout=15)
            resp.raise_for_status()
            with open(filepath, "wb") as img_file:
                img_file.write(resp.content)
            print(f"[{i}/{total}] OK: {filename}")
            ok += 1
        except Exception as e:
            print(f"[{i}/{total}] FALHOU: {filename} -> {e}")
            fail += 1

        time.sleep(0.1)

    print(f"\nConcluído: {ok} baixadas, {fail} falharam. Pasta: {OUTPUT_DIR}/ (esperado: 208 = 149 bases + 59 variantes)")


if __name__ == "__main__":
    main()