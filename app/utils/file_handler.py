
import os
import pandas as pd

def ensure_upload_folder(upload_folder):
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)

def save_uploaded_file(file):
    if file.filename == '':
        raise ValueError("No selected file")
    ensure_upload_folder('uploads')
    file_path = os.path.join('uploads', file.filename)
    file.save(file_path)
    return file_path

def generate_excel_report(df, filename):
    df.to_excel(filename, index=False)
