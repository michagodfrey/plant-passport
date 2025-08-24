from pathlib import Path
from typing import Optional

from supabase import Client, create_client

# Supabase connection details - replace with your actual values
SUPABASE_URL = "https://onmrkraetqksxitxyykh.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ubXJrcmFldHFrc3hpdHh5eWtoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTkwOTY1OCwiZXhwIjoyMDcxNDg1NjU4fQ.THdXZdhdNCNc1SnAgGC7gxgsmuj1iVhNlton67byZD4"

# Format: (IR_number, title, start_page, end_page, is_revoked)
import_requirements = [
    ("1", "Fruit Fly Host Produce - Area Freedom", 0, 0, False),
    (
        "2",
        "Fruit Fly Host Produce - Disinfestation with Methyl Bromide",
        1,
        3,
        False,
    ),
    ("3", "Fruit Fly Host Produce - Disinfestation by Cold Storage", 4, 4, False),
    (
        "4",
        "Fruit Fly Host Produce - Disinfestation of Mango and Papaya with Heat",
        5,
        5,
        False,
    ),
    ("5", "Fruit Fly Host Produce - Hard Green or Similar Condition", 6, 7, False),
    ("6", "Fruit Fly Host Produce - Irradiation", 8, 8, False),
    (
        "7",
        "Queensland Fruit Fly Host Produce - Systems Approaches for Citrus and Strawberries",
        9,
        9,
        False,
    ),
    (
        "8A",
        "Queensland Fruit Fly Host Produce - Treatment with Dimethoate",
        10,
        11,
        False,
    ),
    (
        "8B",
        "REVOKED (Fruit Fly Host Produce - Post-harvest Treatment with Fenthion)",
        12,
        12,
        True,
    ),
    ("9", "Potatoes - Import Conditions", 13, 15, False),
    ("10", "Grape Phylloxera - Hosts and Vectors", 16, 19, False),
    (
        "11",
        "Onion Smut and Iris Yellow Spot Tospovirus (IYSV) - Hosts and Vectors",
        20,
        21,
        False,
    ),
    ("12", "Pea Weevil - Hosts and Vectors", 22, 23, False),
    ("13", "REVOKED (Boil Smut - Hosts)", 24, 24, True),
    ("14", "REVOKED (Hosts of Chrysanthemum White Rust)", 25, 25, True),
    ("15", "Red Imported Fire Ant - Carriers", 26, 28, False),
    ("16", "REVOKED (Hosts of San Jose Scale)", 29, 29, True),
    ("17", "REVOKED (Hosts of Tobacco Blue Mould Fungus)", 30, 30, True),
    ("18", "Fire Blight - Hosts", 31, 32, False),
    ("19", "REVOKED (Hosts of Western Flower Thrips)", 33, 33, True),
    ("20", "REVOKED (Hosts of Melon Thrips)", 34, 34, True),
    ("21", "REVOKED (Pyrethrum Seed)", 35, 35, True),
    ("22", "Lupin Anthracnose Disease - Hosts and Vectors", 36, 37, False),
    ("23", "REVOKED (Hosts of Spiralling Whitefly)", 38, 38, True),
    ("24", "REVOKED (Hosts of Ash Whitefly)", 39, 39, True),
    ("25", "REVOKED (Green Snail - Vector Import Controls)", 40, 40, True),
    ("26", "REVOKED (Argentine Ant)", 41, 41, True),
    ("27", "Chickpea Blight - Hosts and Vectors", 42, 43, False),
    ("28", "REVOKED (Blueberry Rust - Hosts and Carriers)", 44, 44, True),
    (
        "29",
        "Plants and Plant Products, other than Potatoes, from Potato Cyst Nematode infested areas within Victoria",
        45,
        45,
        False,
    ),
    (
        "30",
        "Grain and Grain Products Intended for Animal Feed - Import Conditions",
        46,
        52,
        False,
    ),
    ("31", "REVOKED (Hosts and Vectors - Citrus Canker)", 53, 53, True),
    (
        "32",
        "Canola Seed and Grain - Freedom from Genetically Modified (GM) Brassicaceae Seed",
        54,
        54,
        False,
    ),
    (
        "33",
        "Hosts of Silverleaf Whitefly and Tomato Yellow Leaf Curl Virus",
        55,
        56,
        False,
    ),
    ("34", "REVOKED (Hosts of Impatiens Downy Mildew)", 57, 57, True),
    ("35", "REVOKED (Hosts of Pepper Anthracnose)", 58, 58, True),
    ("36", "Seeds for Sowing", 59, 63, False),
    (
        "37",
        "Biosecurity Matter for the Purpose of Laboratory Analysis or Diagnosis",
        64,
        65,
        False,
    ),
    ("38", "Nursery Stock", 66, 66, False),
    ("38A", "Treatment of Nursery Stock", 67, 69, False),
    (
        "38B",
        "Importation of Nursery Stock by Best Practice Biosecurity",
        70,
        72,
        False,
    ),
    (
        "38C",
        "REVOKED (Importation of Nursery Stock to Registered quarantine place)",
        73,
        73,
        True,
    ),
    ("38D", "Importation of Nursery Stock by Special Approval", 74, 74, False),
    (
        "38E",
        "Importation of Nursery Stock by a BioSecure HACCP Entry Condition Compliance Procedure",
        75,
        79,
        False,
    ),
    (
        "39",
        "Agricultural Equipment, Machinery and Vehicles (New and Used)",
        80,
        81,
        False,
    ),
    ("40", "European House Borer - Vectors", 82, 83, False),
    ("41", "Fruit Fly Host Produce - Splitting and Reconsigning", 84, 84, False),
    (
        "42",
        "Fruit Fly Host Produce - Pre-harvest Treatment and Inspection of Table Grapes",
        85,
        85,
        False,
    ),
    (
        "43",
        "REVOKED (Fruit Fly Host Produce - Pre-harvest Treatment and Inspection of Stone Fruit, Pome Fruit, Persimmons and Blueberries)",
        86,
        86,
        True,
    ),
    (
        "44",
        "Fruit Fly Host Produce - Pre-harvest Treatment and Inspection of Tomatoes, Capsicums, Chillies and Eggplants",
        87,
        87,
        False,
    ),
    (
        "45",
        "Fruit Fly and Grape Phylloxera Host Produce - Repacking and Composite Lots",
        88,
        88,
        False,
    ),
    ("46", "Tomato Potato Psyllid - Hosts and Carriers", 89, 93, False),
]


def read_markdown_content(ir_number: str) -> Optional[str]:
    """Read the content of a markdown file for the given import requirement number."""
    markdown_file = Path("splits") / f"Import Requirement {ir_number}.md"

    try:
        with open(markdown_file, "r", encoding="utf-8") as file:
            return file.read()
    except FileNotFoundError:
        print(f"Warning: Markdown file not found for IR {ir_number}: {markdown_file}")
        return None
    except Exception as e:
        print(f"Error reading markdown file for IR {ir_number}: {e}")
        return None


def import_requirements_to_supabase():
    """Import all non-revoked import requirements to Supabase."""

    # Initialize Supabase client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Filter out revoked requirements
    active_requirements = [req for req in import_requirements if not req[4]]

    print(f"Found {len(active_requirements)} active import requirements to import...")

    success_count = 0
    error_count = 0

    for ir_number, title, _, _, _ in active_requirements:
        print(f"Processing IR {ir_number}: {title}")

        # Read markdown content
        content = read_markdown_content(ir_number)
        if content is None:
            error_count += 1
            continue

        # Prepare data for insertion
        data = {"number": ir_number, "name": title, "content": content}

        try:
            # Insert into Supabase
            supabase.table("import_requirement").insert(data).execute()
            print(f"✓ Successfully imported IR {ir_number}")
            success_count += 1
        except Exception as e:
            print(f"✗ Error importing IR {ir_number}: {e}")
            error_count += 1

    print("\nImport completed:")
    print(f"  Successfully imported: {success_count}")
    print(f"  Errors: {error_count}")
    print(f"  Total processed: {success_count + error_count}")


if __name__ == "__main__":
    print("Starting import of requirements to Supabase...")
    print(
        "Make sure to update SUPABASE_URL and SUPABASE_KEY with your actual credentials"
    )
    print()

    import_requirements_to_supabase()
