import json

def convertir_archivo(input_file, output_file):
    with open(input_file, "r", encoding="utf-8") as f:
        raw_all = f.read()

    # Cada línea es un registro completo
    records_raw = [line.strip() for line in raw_all.splitlines() if line.strip()]
    all_records = []

    for rec in records_raw:
        parts = rec.split("\t")
        sections = []
        for p in parts:
            try:
                obj = json.loads(p)
                sections.append(obj)
            except Exception:
                sections.append(p.strip())
        record_obj = {
            "site": sections[0] if len(sections) > 0 else None,
            "location_data": sections[1] if len(sections) > 1 else None,
            "additional_locations": sections[2] if len(sections) > 2 else None,
            "site_texts": sections[3] if len(sections) > 3 else None,
            "business_data": sections[4] if len(sections) > 4 else None,
            "site_images": sections[5] if len(sections) > 5 else None,
            "results": sections[6] if len(sections) > 6 else None,
            "catalog": sections[7] if len(sections) > 7 else None
        }
        all_records.append(record_obj)

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(all_records, f, ensure_ascii=False, indent=4)

    print(f"✅ Conversión completada. Archivo guardado en: {output_file}")


if __name__ == "__main__":
    # Cambia los nombres si tu archivo de entrada/salida es diferente
    convertir_archivo("nueva_info.txt", "nueva_info_ordenado.json")
