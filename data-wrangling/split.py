import os
import sys

import pymupdf


def split_biosecurity_manual(input_pdf_path, output_directory="split_pdfs"):
    """
    Split the Tasmania Plant Biosecurity Manual PDF into individual Import Requirements

    Args:
        input_pdf_path (str): Path to the input PDF file
        output_directory (str): Directory where split PDFs will be saved
    """

    # Create output directory if it doesn't exist
    if not os.path.exists(output_directory):
        os.makedirs(output_directory)

    # Define all split points for Import Requirements
    # Format: (IR_number, title, start_page, end_page, is_revoked)
    # Note: Pages are 0-indexed in PyMuPDF, so we subtract 1 from the document page numbers
    all_split_points = [
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

    # Filter out revoked import requirements
    split_points = [
        (ir_num, title, start, end)
        for ir_num, title, start, end, is_revoked in all_split_points
        if not is_revoked
    ]

    print(f"Found {len(all_split_points)} total import requirements")
    print(
        f"Processing {len(split_points)} active import requirements (skipping revoked ones)"
    )
    print()

    try:
        # Open the input PDF
        doc = pymupdf.open(input_pdf_path)
        print(f"Successfully opened PDF with {doc.page_count} pages")

        # Split the document according to the split points
        for ir_number, title, start_page, end_page in split_points:
            # Create a new document for this import requirement
            new_doc = pymupdf.open()

            # Add pages from start_page to end_page (inclusive)
            for page_num in range(start_page, end_page + 1):
                if page_num < doc.page_count:
                    new_doc.insert_pdf(doc, from_page=page_num, to_page=page_num)
                else:
                    print(
                        f"Warning: Page {page_num + 1} does not exist in the source document"
                    )

            # Clean filename by removing problematic characters
            clean_filename = f"Import Requirement {ir_number}.pdf"
            # Replace characters that might cause issues in filenames
            clean_filename = (
                clean_filename.replace("/", "-").replace("\\", "-").replace(":", "-")
            )
            clean_filename = (
                clean_filename.replace("*", "").replace("?", "").replace('"', "'")
            )
            clean_filename = (
                clean_filename.replace("<", "").replace(">", "").replace("|", "")
            )

            output_path = os.path.join(output_directory, clean_filename)

            # Save the new document
            new_doc.save(output_path)
            new_doc.close()

            print(f"Created: {clean_filename} (Pages {start_page + 1}-{end_page + 1})")

        # Close the original document
        doc.close()
        print(
            f"\nSuccessfully split PDF into {len(split_points)} active import requirement files in '{output_directory}' directory"
        )
        print(
            f"Skipped {len(all_split_points) - len(split_points)} revoked import requirements"
        )

    except Exception as e:
        print(f"Error processing PDF: {str(e)}")
        return False

    return True


def main():
    # Get input file path from command line argument or use default
    if len(sys.argv) > 1:
        input_pdf = sys.argv[1]
    else:
        input_pdf = "source.pdf"  # Default filename

    # Get output directory from command line argument or use default
    if len(sys.argv) > 2:
        output_dir = sys.argv[2]
    else:
        output_dir = "splits"

    # Check if input file exists
    if not os.path.exists(input_pdf):
        print(f"Error: Input file '{input_pdf}' not found.")
        print("Usage: python script.py <input_pdf_file> [output_directory]")
        return

    print(f"Splitting PDF: {input_pdf}")
    print(f"Output directory: {output_dir}")
    print("-" * 50)

    success = split_biosecurity_manual(input_pdf, output_dir)

    if success:
        print("\nPDF splitting completed successfully!")
    else:
        print("\nPDF splitting failed. Please check the error messages above.")


if __name__ == "__main__":
    main()
