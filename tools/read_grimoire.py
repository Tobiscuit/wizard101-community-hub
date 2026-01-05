
import fitz  # PyMuPDF
import sys

def extract_text(pdf_path):
    try:
        doc = fitz.open(pdf_path)
        text = ""
        # Read the first few pages which likely contain the TOC or Intro on serialization
        for i in range(min(50, len(doc))): 
            text += doc[i].get_text()
        
        # Identify key sections for BINd
        bind_section = ""
        start_capture = False
        
        # Simple keyword search for sections relevant to our decoder
        keywords = ["BINd", "Serialization", "Binary", "Structure", "Header"]
        
        print("--- EXTRACTED PDF CONTENT (Sample) ---")
        # Just print relevant lines to avoid context overflow
        for line in text.split('\n'):
             if any(k in line for k in keywords) or start_capture:
                # Basic context window preservation
                if len(bind_section) < 5000: 
                    bind_section += line + "\n"
                    start_capture = True
        
        if not bind_section:
            print("No specific 'BINd' instructions found in first 50 pages. Printing Intro:")
            print(text[:2000])
        else:
            print(bind_section)
            
    except Exception as e:
        print(f"Error reading PDF: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: py read_pdf.py <path>")
    else:
        extract_text(sys.argv[1])
