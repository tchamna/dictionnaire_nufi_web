# import json
# import os
# from google.cloud import firestore

# servivceAuthPath = r"C:\Users\tcham\OneDrive\Documents\Workspace_Codes\DictionnaireNufi\ReactDict\dictionnaire_nufi_web\serviceAccountKey_dictionnaire-nufi-firebase-adminsdk.json"

# # Set the path to your Firebase service account key
# os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = servivceAuthPath

# # Initialize Firestore client
# db = firestore.Client()

# # Load JSON data from file
# data_path = r"C:\Users\tcham\OneDrive\Documents\Workspace_Codes\DictionnaireNufi\ReactDict\dictionnaire_nufi_web\src\data\nufi_dictionary_data.json"
# with open(data_path) as f:
#     nufi_dictionary_data = json.load(f)

# # Function to upload data to Firestore
# def upload_data(collection_name, data):
#     collection_ref = db.collection(collection_name)
    
#     for entry in data:
#         try:
#             # Add each entry as a new document
#             doc_ref = collection_ref.add(entry)
#             print(f"Uploaded document with ID: {doc_ref.id}")
#         except Exception as e:
#             print(f"Error uploading entry {entry}: {e}")

# # Run the upload function
# upload_data("nufi_dictionary", nufi_dictionary_data)
##############################################################################
# USING BATCH UPLOADS

import json
import os
from google.cloud import firestore

# Path to your Firebase service account key
service_auth_path = r"C:\Users\tcham\OneDrive\Documents\Workspace_Codes\DictionnaireNufi\ReactDict\dictionnaire_nufi_web\serviceAccountKey_dictionnaire-nufi-firebase-adminsdk.json"
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = service_auth_path

# Initialize Firestore client
db = firestore.Client()

# Load JSON data from file
data_path = r"C:\Users\tcham\OneDrive\Documents\Workspace_Codes\DictionnaireNufi\ReactDict\dictionnaire_nufi_web\src\data\nufi_dictionary_data.json"
with open(data_path) as f:
    nufi_dictionary_data = json.load(f)

# Function to upload data in batches to Firestore
def upload_data_in_batches(collection_name, data, batch_size=500):
    collection_ref = db.collection(collection_name)
    batch = db.batch()
    count = 0

    for i, entry in enumerate(data):
        try:
            # Reference for a new document
            doc_ref = collection_ref.document()
            # Add the set operation to the batch
            batch.set(doc_ref, entry)
            count += 1

            # Commit the batch if it reaches the batch_size or it's the last entry
            if count == batch_size or i == len(data) - 1:
                batch.commit()
                print(f"Uploaded {count} documents in batch.")
                # Reset batch and counter
                batch = db.batch()
                count = 0
        except Exception as e:
            print(f"Error uploading entry {entry}: {e}")

# Run the batch upload function
upload_data_in_batches("nufi_dictionary", nufi_dictionary_data)
