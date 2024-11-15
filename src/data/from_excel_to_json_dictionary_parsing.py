import pandas as pd
import json
from natsort import natsorted
import icu  # PyICU for international sorting

# icu can be installed from wheels on Windows
# pip install PyICU-2.13-cp311-cp311-win_amd64.whl

# Initialize the ICU collator for locale-aware sorting
collator = icu.Collator.createInstance(icu.Locale('de_DE.UTF-8'))  # Adjust locale as needed

# AUDIO PARSING

def csv_to_audio_json(file_path):
    # Read the CSV file
    # df = pd.read_csv(audi_path)
    df = pd.read_excel(file_path, sheet_name="audio_mapping")

    # Strip any leading and trailing whitespace in 'Keyword' and 'Audio_file_name' columns
    df['Keyword'] = df['Keyword'].str.strip()
    df['clafrica'] = df['clafrica'].str.strip()    
    df = df[["Keyword", "clafrica"]]
    df = df.dropna()

    # This line of code is optional
    # Sort alphabetically with ICU collator 
    # because sort and natsorted doesnt work for tonal languages sort
    df = df.sort_values(by="Keyword", key=lambda x: x.map(collator.getSortKey))

    # Convert to the required JSON structure
    audio_json = {row['Keyword']: f"/audio/{row['clafrica']}.mp3" 
                  for _, row in df.iterrows()}
    
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
    output_file = 'nufi_audio_map.json'
    with open(output_file, 'w', encoding='utf-8') as file:
        json.dump(audio_json, file, indent=2, ensure_ascii=False)
    
    return f"JSON file saved as {output_file}"

def nufi_dict_to_jason_data(file_path):
        
    
    # Load the sheet and relevant columns
    df = pd.read_excel(file_path, sheet_name="MainDictionary")

    #Extract Only Nufi --> French Part
    Number_of_Words_from_Nufi_to_French = 8900
    Number_of_Words_from_Nufi_to_French = len(df)
    df = df.iloc[:Number_of_Words_from_Nufi_to_French][["Keyword", "Pronunciation", "Meaning"]]


    # Limit to the first 100 rows for testing
    # df_ = df.iloc[:100]

    # Initialize an empty list to store words
    dictionary_data = []

    # Iterate over each row in the DataFrame
    for index, row in df.iterrows():
        # Initialize a dictionary for each word entry
        word_entry = {
            "word": str(row["Keyword"]), 
            **({"part_of_speech": row["Pronunciation"]} if pd.notna(row["Pronunciation"]) and row["Pronunciation"] else {}),
            "definitions": []
        }

        # Process multiple definitions and examples within the Meaning field
        if pd.notna(row["Meaning"]):
            # Split by numbered definitions (assuming the format '1.', '2.', etc. or similar structure)
            definitions = [defn.strip() for defn in row["Meaning"].split("<tag_bullet>") if defn.strip()]
            
            for definition_text in definitions:
                # Separate the definition text and examples
                example_sentences = []
                
                # Extract examples for this specific definition
                examples = definition_text.split("ex.")
                main_definition = examples[0].strip()
                
                for example in examples[1:]:  # Skip the first split part, as it is the main definition text
                    if ":" in example:
                        native, french = example.split(":", 1)
                        example_sentences.append({
                            "native": native.strip(),
                            "french": french.strip()
                        })
                
                # Add the definition with examples to the word entry
                word_entry["definitions"].append({
                    "text": main_definition,
                    "examples": example_sentences
                })

        # Append the word entry to the dictionary data
        dictionary_data.append(word_entry)

    # Save the result to a JSON file
    output_file = 'nufi_dictionary_data.json'
    with open(output_file, 'w', encoding='utf-8') as json_file:
        json.dump(dictionary_data, json_file, ensure_ascii=False, indent=4)

    print(f"Data has been successfully converted and saved to {output_file}.")


# def nufi_dict_to_jason_data(file_path):
#     # Load the sheet and relevant columns
#     df = pd.read_excel(file_path, sheet_name="MainDictionary")

#     # Extract only Nufi → French part (assuming you have a length requirement)
#     Number_of_Words_from_Nufi_to_French = 8900
#     Number_of_Words_from_Nufi_to_French = len(df)
#     df = df.iloc[:Number_of_Words_from_Nufi_to_French][["Keyword", "Pronunciation", "Meaning"]]

#     # Initialize an empty list to store words
#     dictionary_data = []

#     # Iterate over each row in the DataFrame
#     for index, row in df.iterrows():
#         # Initialize a dictionary for each word entry
#         word_entry = {
#             "word": str(row["Keyword"]), 
#             **({"part_of_speech": row["Pronunciation"]} if pd.notna(row["Pronunciation"]) and row["Pronunciation"] else {}),
#             "definitions": []
#         }

#         # Process multiple definitions and examples within the Meaning field
#         if pd.notna(row["Meaning"]):
#             # Split by numbered definitions (assuming a "<tag_bullet>" delimiter)
#             definitions = [defn.strip() for defn in row["Meaning"].split("<tag_bullet>") if defn.strip()]
            
#             for definition_text in definitions:
#                 # Separate the definition text and examples using regex for case-insensitive matching of "ex."
#                 example_sentences = []
                
#                 # Use regular expression to split on "ex." or "Ex." with optional whitespace
#                 examples = re.split(r'\bex\.\s*', definition_text, flags=re.IGNORECASE)
#                 main_definition = examples[0].strip()  # The first part is the main definition
                
#                 for example in examples[1:]:  # Process remaining parts as examples
#                     if ":" in example:
#                         native, french = example.split(":", 1)
#                         example_sentences.append({
#                             "native": native.strip(),
#                             "french": french.strip()
#                         })
                
#                 # Add the definition with examples to the word entry
#                 word_entry["definitions"].append({
#                     "text": main_definition,
#                     "examples": example_sentences
#                 })

#         # Append the word entry to the dictionary data
#         dictionary_data.append(word_entry)

#     # Save the result to a JSON file
#     output_file = 'nufi_dictionary_data.json'
#     with open(output_file, 'w', encoding='utf-8') as json_file:
#         json.dump(dictionary_data, json_file, ensure_ascii=False, indent=4)

#     print(f"Data has been successfully converted and saved to {output_file}.")

###############################

if __name__ == "__main__":
    # Load the Excel file
    file_path = r"G:\My Drive\Mbú'ŋwɑ̀'nì\Livres Nufi\Ŋwɑ̀'nǐpàhsì\Dictionnaire_Nufi_Francais_Nufi_updated_2024.xlsx" 

    nufi_dict_to_jason_data(file_path)
    csv_to_audio_json(file_path)
