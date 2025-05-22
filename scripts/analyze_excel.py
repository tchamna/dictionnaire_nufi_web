import pandas as pd
import json
import os

def analyze_excel_file(file_path):
    print(f"Analyzing Excel file: {file_path}")
    
    # Check if file exists
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} does not exist")
        return
    
    # Load the Excel file
    try:
        xl = pd.ExcelFile(file_path)
        sheet_names = xl.sheet_names
        print(f"Found sheets: {sheet_names}")
        
        # Check for audio_mapping sheet
        if 'audio_mapping' in sheet_names:
            print("Found 'audio_mapping' sheet!")
            df = pd.read_excel(file_path, sheet_name='audio_mapping')
            print(f"Columns in audio_mapping sheet: {df.columns.tolist()}")
            
            # Check for required columns
            if 'Keyword' in df.columns and 'clafrica' in df.columns:
                print("Found required columns: 'Keyword' and 'clafrica'")
                
                # Create audio mapping
                audio_map = {}
                for _, row in df.iterrows():
                    keyword = str(row['Keyword']).strip().lower()
                    audio_file = str(row['clafrica']).strip()
                    if keyword and audio_file and keyword != 'nan' and audio_file != 'nan':
                        audio_map[keyword] = audio_file
                
                print(f"Found {len(audio_map)} audio mappings")
                
                # Save to JSON file
                output_file = os.path.join(os.path.dirname(file_path), 'extracted_audio_map.json')
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(audio_map, f, indent=2, ensure_ascii=False)
                print(f"Saved audio mappings to {output_file}")
                
                # Show some examples
                print("\nExample mappings:")
                for i, (k, v) in enumerate(list(audio_map.items())[:10]):
                    print(f"  {k} -> {v}")
            else:
                print("Error: Required columns not found in 'audio_mapping' sheet")
        else:
            print("No 'audio_mapping' sheet found")
            
            # Check other sheets for potential mapping data
            for sheet in sheet_names:
                df = pd.read_excel(file_path, sheet_name=sheet)
                print(f"\nAnalyzing sheet '{sheet}'")
                print(f"Columns: {df.columns.tolist()}")
                print(f"Sample data (first 5 rows):")
                print(df.head())
    
    except Exception as e:
        print(f"Error analyzing Excel file: {e}")

if __name__ == "__main__":
    # Path to the Excel file
    excel_file = r"c:\Users\ryahj\CascadeProjects\online-dictionary\old-nufu\dictionnaire_nufi_web-main\src\data\sample_Dictionnaire_Nufi_Francais_Nufi_.xlsx"
    analyze_excel_file(excel_file)
