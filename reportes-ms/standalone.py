import pysolr
import pandas as pd
from fpdf import FPDF

# Configuración de Solr
SOLR_URL = "http://10.10.10.2:8983/solr/ProyectoFinal"  # Cambia por tu URL y core de Solr
solr = pysolr.Solr(SOLR_URL, always_commit=True)

# Función para consultar Solr y convertir los resultados en un DataFrame
def fetch_data_from_solr(query="*:*", rows=100):
    results = solr.search(query, **{"rows": rows})
    data = [doc for doc in results]
    return pd.DataFrame(data)

# Función para generar un archivo Excel
def generate_excel_report(data, filename="reporte.xlsx"):
    data.to_excel(filename, index=False, engine="openpyxl")
    print(f"Reporte Excel generado: {filename}")

# Función para generar un archivo PDF
def generate_pdf_report(data, filename="reporte.pdf"):
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font("Arial", size=12)

    # Título del reporte
    pdf.set_font("Arial", style="B", size=14)
    pdf.cell(200, 10, txt="Reporte de Datos", ln=True, align="C")
    pdf.ln(10)

    # Añadir los datos al PDF
    pdf.set_font("Arial", size=10)
    col_width = pdf.w / len(data.columns)  # Ancho de columna ajustado
    row_height = pdf.font_size + 2

    # Escribir encabezados
    for column in data.columns:
        pdf.cell(col_width, row_height, txt=column, border=1)
    pdf.ln(row_height)

    # Escribir filas
    for _, row in data.iterrows():
        for value in row:
            pdf.cell(col_width, row_height, txt=str(value), border=1)
        pdf.ln(row_height)

    pdf.output(filename)
    print(f"Reporte PDF generado: {filename}")

# Main
if __name__ == "__main__":
    try:
        # Obtener datos de Solr
        df = fetch_data_from_solr(query="*:*", rows=100)

        if not df.empty:
            # Generar reportes
            generate_excel_report(df, "reporte_solr.xlsx")
            #generate_pdf_report(df, "reporte_solr.pdf")
        else:
            print("No se encontraron datos en Solr.")

    except Exception as e:
        print(f"Error al generar reportes: {e}")
