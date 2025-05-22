import pandas as pd
import json
import os

def csv_to_audio_json(file_path):
    print(f"Reading Excel file: {file_path}")
    
    try:
        # Get all sheet names
        xls = pd.ExcelFile(file_path)
        sheet_names = xls.sheet_names
        print(f"Available sheets: {sheet_names}")
        
        # Look for the audio_mapping sheet
        audio_mapping_sheet = None
        for sheet in sheet_names:
            if "audio" in sheet.lower() or "mapping" in sheet.lower():
                audio_mapping_sheet = sheet
                break
        
        if not audio_mapping_sheet:
            print("Warning: Could not find a sheet with 'audio' or 'mapping' in the name.")
            print("Using the first sheet as a fallback.")
            audio_mapping_sheet = sheet_names[0]
        
        print(f"Using sheet: {audio_mapping_sheet}")
        
        # Read the Excel file
        df = pd.read_excel(file_path, sheet_name=audio_mapping_sheet)
        
        # Print column names to help debug
        print(f"Columns in the sheet: {df.columns.tolist()}")
        
        # Look for keyword and audio columns
        keyword_col = None
        audio_col = None
        
        for col in df.columns:
            col_lower = col.lower()
            if "keyword" in col_lower or "word" in col_lower:
                keyword_col = col
            elif "audio" in col_lower or "clafrica" in col_lower or "file" in col_lower:
                audio_col = col
        
        if not keyword_col or not audio_col:
            print("Error: Could not identify keyword and audio columns.")
            print("Please specify the column names manually.")
            return None
        
        print(f"Using columns: Keyword={keyword_col}, Audio={audio_col}")
        
        # Strip any leading and trailing whitespace
        df[keyword_col] = df[keyword_col].astype(str).str.strip()
        df[audio_col] = df[audio_col].astype(str).str.strip()
        
        # Drop rows with missing values
        df = df.dropna(subset=[keyword_col, audio_col])
        
        # Convert to the required JSON structure
        audio_json = {row[keyword_col]: f"/audio/{row[audio_col]}.mp3" 
                      for _, row in df.iterrows()}
        
        # Add number mappings as in the original script
        number_dict_audio = {
            "0": "/audio/ne1he3.mp3",
            "1": "/audio/nshuu1_g.mp3",
            "2": "/audio/puaf2.mp3",
            "3": "/audio/taa3.mp3",
            "4": "/audio/kwaf1.mp3",
            "5": "/audio/ti5.mp3",
            "6": "/audio/nto1ho3.mp3",
            "7": "/audio/seu11mbuuaf2.mp3",
            "8": "/audio/heu1eu3.mp3",
            "9": "/audio/vuu1_guu3.mp3",
            "10": "/audio/gha7m.mp3",
        }
        
        audio_json.update(number_dict_audio)
        
        # Save the result to a JSON file
        output_file = os.path.join(os.path.dirname(file_path), 'nufi_audio_map.json')
        with open(output_file, 'w', encoding='utf-8') as file:
            json.dump(audio_json, file, indent=2, ensure_ascii=False)
        
        print(f"JSON file saved as {output_file}")
        print(f"Generated {len(audio_json)} audio mappings")
        
        # Print a few examples
        print("\nExample mappings:")
        items = list(audio_json.items())
        for k, v in items[:5]:
            print(f"  {k}: {v}")
        
        return output_file
    
    except Exception as e:
        print(f"Error processing Excel file: {e}")
        return None

if __name__ == "__main__":
    # Path to the Excel file
    file_path = "../old-nufu/dictionnaire_nufi_web-main/src/data/sample_Dictionnaire_Nufi_Francais_Nufi_.xlsx"
    
    # Get absolute path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(current_dir, file_path)
    
    # Generate the audio map
    output_file = csv_to_audio_json(file_path)
    
    if output_file:
        print(f"\nNext steps:")
        print(f"1. Copy {output_file} to your project's src/data directory")
        print(f"2. Update the audioService.ts file to use this mapping")
    else:
        print("\nFailed to generate audio map. Please check the errors above.")
