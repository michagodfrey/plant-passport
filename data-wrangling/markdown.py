"""
Convert PDF files in the splits directory to Markdown format using pymupdf.
"""

from pathlib import Path

import pymupdf


def convert_pdf_to_markdown(pdf_path: Path, output_path: Path) -> bool:
    """
    Convert a PDF file to Markdown format.

    Args:
        pdf_path: Path to the source PDF file
        output_path: Path where the Markdown file should be saved

    Returns:
        True if conversion was successful, False otherwise
    """
    try:
        # Open the PDF document
        doc = pymupdf.open(str(pdf_path))

        # Extract text from all pages and format as markdown
        md_text = ""
        for page_num in range(len(doc)):
            page = doc[page_num]
            page_text = page.get_text()

            # Add page header for multi-page documents
            if len(doc) > 1:
                md_text += f"# Page {page_num + 1}\n\n"

            # Add the page content
            md_text += page_text + "\n\n"

        # Close the document
        doc.close()

        # Write markdown to file
        output_path.write_text(md_text, encoding="utf-8")
        return True
    except Exception as e:
        print(f"Error converting {pdf_path.name}: {e}")
        return False


def main() -> None:
    """Main function to process all PDF files in the splits directory."""
    # Define paths
    splits_dir = Path("splits")

    # Check if splits directory exists
    if not splits_dir.exists():
        print(f"Error: Directory '{splits_dir}' does not exist.")
        return

    # Find all PDF files in the splits directory
    pdf_files = list(splits_dir.glob("*.pdf"))

    if not pdf_files:
        print("No PDF files found in the splits directory.")
        return

    print(f"Found {len(pdf_files)} PDF files to convert.")
    print("-" * 50)

    successful_conversions = 0

    # Process each PDF file
    for i, pdf_path in enumerate(pdf_files, 1):
        print(f"[{i}/{len(pdf_files)}] Converting: {pdf_path.name}")

        # Create output path with .md extension
        output_path = splits_dir / f"{pdf_path.stem}.md"

        # Convert PDF to Markdown
        if convert_pdf_to_markdown(pdf_path, output_path):
            print(f"✓ Successfully saved: {output_path.name}")
            successful_conversions += 1
        else:
            print(f"✗ Failed to convert: {pdf_path.name}")

        print()  # Add blank line for readability

    print("-" * 50)
    print("Conversion complete!")
    print(f"Successfully converted: {successful_conversions}/{len(pdf_files)} files")


if __name__ == "__main__":
    main()
