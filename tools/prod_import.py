#!/usr/bin/env python3
"""Import production Christici — charge un fichier SQL d'INSERT dans la D1 de
production via `gsk hosted d1_execute`, par lots, sans passer par le shell
(subprocess avec liste d'arguments => aucun problème d'échappement).

Usage : python3 tools/prod_import.py --file /tmp/import_togo.sql --batch 100
"""
import argparse
import json
import subprocess
import sys


def run_gsk(sql: str) -> dict:
    """Exécute un lot SQL en production et retourne l'enveloppe JSON."""
    proc = subprocess.run(
        ["gsk", "hosted", "d1_execute", "--sql", sql],
        capture_output=True, text=True, timeout=180,
    )
    out = proc.stdout
    # gsk imprime parfois une ligne [INFO] avant le JSON
    start = out.find("{")
    if start == -1:
        return {"code": "parse_error", "message": out[-500:] + proc.stderr[-500:]}
    try:
        return json.loads(out[start:])
    except json.JSONDecodeError:
        return {"code": "parse_error", "message": out[-500:] + proc.stderr[-500:]}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--file", required=True)
    ap.add_argument("--batch", type=int, default=100)
    args = ap.parse_args()

    with open(args.file, encoding="utf-8") as fh:
        stmts = [
            line.strip()
            for line in fh
            if line.strip().upper().startswith("INSERT")
        ]
    total = len(stmts)
    print(f"{total} instructions INSERT à charger (lots de {args.batch}).")

    inserted = 0
    for i in range(0, total, args.batch):
        chunk = stmts[i : i + args.batch]
        sql = "\n".join(chunk)
        resp = run_gsk(sql)
        data = resp.get("data", resp)
        code = data.get("code")
        if code not in ("ok", "completed"):
            print(f"ÉCHEC lot {i}-{i + len(chunk)} : code={code}")
            print(json.dumps(data, ensure_ascii=False)[:1200])
            return 1
        inserted += len(chunk)
        print(f"  lot {i + 1}-{i + len(chunk)} OK ({inserted}/{total})")

    print(f"TERMINÉ : {inserted}/{total} instructions envoyées avec succès.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
