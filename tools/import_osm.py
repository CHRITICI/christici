#!/usr/bin/env python3
"""
Pipeline d'import Christici — églises réelles depuis OpenStreetMap (licence ODbL).

Source  : extrait Geofabrik (.osm.pbf) d'un pays, ex. https://download.geofabrik.de/africa/togo-latest.osm.pbf
Filtre  : amenity=place_of_worship + religion=christian (données cartographiées par des contributeurs terrain).
Chaque  : fiche conserve sa provenance (source='OpenStreetMap', source_ref=node/way/relation OSM)
          et démarre au statut 'a_verifier' (aucune donnée n'est présentée comme vérifiée d'office).

Usage :
  python3 tools/import_osm.py --pbf /tmp/togo.osm.pbf --country Togo --iso TG \
      --out /tmp/import_togo.sql --report /tmp/report_togo.json
  # mode dry-run : ne génère que le rapport (aucune écriture SQL)
  python3 tools/import_osm.py --pbf /tmp/togo.osm.pbf --country Togo --iso TG --dry-run
"""
import argparse
import json
import re
import sys
import unicodedata

import osmium


def slugify(text: str, max_len: int = 80) -> str:
    text = unicodedata.normalize("NFKD", text or "")
    text = text.encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return (text[:max_len].strip("-") or "eglise")


def esc(text) -> str:
    if text is None:
        return "NULL"
    s = str(text).replace("'", "''")
    return f"'{s}'"


def norm_phone(raw: str) -> str | None:
    if not raw:
        return None
    # garde chiffres et +, supprime le reste ; limite raisonnable
    p = re.sub(r"[^\d+]", "", raw)
    if p.count("+") > 1:
        p = "+" + p.replace("+", "")
    return p[:30] if len(p) >= 6 else None


class ChurchCollector(osmium.SimpleHandler):
    def __init__(self):
        super().__init__()
        self.items = []  # dicts bruts

    def _collect(self, tags, lat, lon, osm_type, osm_id):
        if tags.get("amenity") != "place_of_worship":
            return
        if (tags.get("religion") or "").lower() != "christian":
            return
        name = (tags.get("name") or "").strip()
        if not name or len(name) < 2:
            return  # sans nom réel, la fiche n'est pas exploitable -> on ne crée rien
        self.items.append(
            {
                "osm_type": osm_type,
                "osm_id": osm_id,
                "source_ref": f"{osm_type}/{osm_id}",
                "name": name[:200],
                "denomination": (tags.get("denomination") or "").strip()[:120] or None,
                "address": self._address(tags),
                "phone": norm_phone(tags.get("phone") or tags.get("contact:phone") or ""),
                "website": (tags.get("website") or tags.get("contact:website") or "").strip()[:200] or None,
                "email": (tags.get("email") or tags.get("contact:email") or "").strip()[:150] or None,
                "opening_hours": (tags.get("opening_hours") or "").strip()[:200] or None,
                "latitude": round(lat, 7) if lat is not None else None,
                "longitude": round(lon, 7) if lon is not None else None,
            }
        )

    @staticmethod
    def _address(tags) -> str | None:
        parts = []
        if tags.get("addr:housenumber"):
            parts.append(tags["addr:housenumber"])
        if tags.get("addr:street"):
            parts.append(tags["addr:street"])
        if tags.get("addr:city"):
            parts.append(tags["addr:city"])
        addr = ", ".join(parts).strip()
        return addr[:200] if addr else None

    def node(self, n):
        self._collect(n.tags, n.location.lat, n.location.lon, "node", n.id)

    def way(self, w):
        # centroïde approximatif = moyenne des nœuds (largement suffisant pour une carte)
        lats = [nd.lat for nd in w.nodes if nd.location.valid()]
        lons = [nd.lon for nd in w.nodes if nd.location.valid()]
        if not lats:
            return
        self._collect(
            w.tags,
            sum(lats) / len(lats),
            sum(lons) / len(lons),
            "way",
            w.id,
        )

    def relation(self, r):
        # les relations n'ont pas de géométrie directe fiable sans assemblage : on les ignore
        return


def dedupe(items):
    """Déduponnage : (1) clé source identique, (2) nom normalisé identique + proximité ~100 m."""
    seen_ref = {}
    out = []
    dups = 0
    for it in items:
        key_ref = it["source_ref"]
        if key_ref in seen_ref:
            dups += 1
            continue
        is_dup = False
        for o in out:
            if (
                o["name"].strip().lower() == it["name"].strip().lower()
                and o["latitude"] is not None
                and it["latitude"] is not None
                and abs(o["latitude"] - it["latitude"]) < 0.001  # ~110 m
                and abs(o["longitude"] - it["longitude"]) < 0.001
            ):
                is_dup = True
                break
        if is_dup:
            dups += 1
            continue
        seen_ref[key_ref] = True
        out.append(it)
    return out, dups


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pbf", required=True)
    ap.add_argument("--country", required=True)
    ap.add_argument("--iso", required=True)
    ap.add_argument("--out", help="fichier SQL de sortie")
    ap.add_argument("--report", help="fichier rapport JSON")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    handler = ChurchCollector()
    handler.apply_file(args.pbf, locations=True)

    items, dups = dedupe(handler.items)

    # stats utiles pour le rapport
    denom_stats = {}
    with_coords = with_phone = with_website = 0
    for it in items:
        d = it["denomination"] or "(non précisée)"
        denom_stats[d] = denom_stats.get(d, 0) + 1
        if it["latitude"] is not None:
            with_coords += 1
        if it["phone"]:
            with_phone += 1
        if it["website"]:
            with_website += 1

    report = {
        "source": "OpenStreetMap",
        "license": "ODbL 1.0 — https://www.openstreetmap.org/copyright",
        "attribution": "© OpenStreetMap contributors",
        "country": args.country,
        "iso": args.iso,
        "raw_candidates": len(handler.items),
        "duplicates_removed": dups,
        "records_ready": len(items),
        "with_coordinates": with_coords,
        "with_phone": with_phone,
        "with_website": with_website,
        "denominations": dict(sorted(denom_stats.items(), key=lambda kv: -kv[1])[:20]),
        "status_assigned": "a_verifier",
        "note": "Aucune fiche n'est créée si le nom réel est absent. Données à vérifier par la communauté / les responsables.",
    }

    if args.report:
        with open(args.report, "w", encoding="utf-8") as f:
            json.dump(report, f, ensure_ascii=False, indent=2)

    print(json.dumps(report, ensure_ascii=False, indent=2))

    if args.dry_run or not args.out:
        return 0

    used_slugs = {}
    lines = [
        "-- Import Christici — OpenStreetMap (ODbL) — " + args.country,
        "-- Statut initial : a_verifier. Provenance conservée (source + source_ref).",
    ]
    for it in items:
        base = slugify(it["name"])
        slug = base
        i = used_slugs.get(base, 0)
        if i:
            slug = f"{base}-{i+1}"
        used_slugs[base] = i + 1

        lat = "NULL" if it["latitude"] is None else str(it["latitude"])
        lon = "NULL" if it["longitude"] is None else str(it["longitude"])
        lines.append(
            "INSERT OR IGNORE INTO churches "
            "(name, slug, denomination, description, country, region, city, district, address, phone, email, website, "
            "latitude, longitude, pastor_name, service_times, featured, published, status, source, source_ref) VALUES ("
            + ", ".join(
                [
                    esc(it["name"]),
                    esc(slug),
                    esc(it["denomination"]),
                    esc(it["opening_hours"]),
                    esc(args.country),
                    "NULL",
                    "NULL",
                    "NULL",
                    esc(it["address"]),
                    esc(it["phone"]),
                    esc(it["email"]),
                    esc(it["website"]),
                    lat,
                    lon,
                    "NULL",
                    esc(it["opening_hours"]),
                    "0",
                    "1",
                    "'a_verifier'",
                    "'OpenStreetMap'",
                    esc(it["source_ref"]),
                ]
            )
            + ");"
        )

    with open(args.out, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")

    print(f"\nSQL écrit : {args.out} ({len(items)} INSERT)", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
