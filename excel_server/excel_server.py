from typing import Any
import pandas as pd
from openpyxl import load_workbook
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("excel_server")

@mcp.tool()  # <-- Add parentheses
def read_excel(file_path: str, sheet_name: str = None) -> list[dict[str, Any]]:
    """Reads an Excel file and returns its contents as a list of dictionaries."""
    try:
        if sheet_name:
            df = pd.read_excel(file_path, sheet_name=sheet_name)
        else:
            # If no sheet_name is provided, read the first sheet
            df = pd.read_excel(file_path)
        
        return df.to_dict(orient="records")
    except Exception as e:
        return {"error": f"Failed to read Excel file: {str(e)}"}

@mcp.tool()  # <-- Add parentheses
def write_excel(data: list[dict[str, Any]], file_path: str) -> dict:
    """Creates an Excel file from the given data and saves it."""
    try:
        # Convert the list of dictionaries into a pandas DataFrame
        df = pd.DataFrame(data)

        # Save the DataFrame to an Excel file
        df.to_excel(file_path, index=False)

        return {"status": "success", "message": f"File saved to {file_path}"}
    
    except Exception as e:
        return {"error": f"Failed to write Excel file: {str(e)}"}

if __name__ == "__main__":
    mcp.run()
