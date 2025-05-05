import sys
from pathlib import Path
import pandas as pd

# Adiciona o diretório raiz ao Python path
project_root = Path(__file__).resolve().parent.parent
sys.path.append(str(project_root))

from app.models import Base
from app.database import engine

def importar_dados():
    # 1. Cria a estrutura do banco usando SQLAlchemy
    Base.metadata.create_all(bind=engine)
    
    # 2. Carrega e limpa os dados usando caminho absoluto
    csv_path = project_root / "data" / "base.csv"
    df = pd.read_csv(csv_path, encoding='utf-8')
    
    # Converte datas
    # No tratamento dos dados, adicione:
    df['Data'] = pd.to_datetime(df['Data'], format='%Y-%m').dt.strftime('%Y-%m-%d')
    
    
    # Lista de colunas para tratamento
    colunas = [
        'Gasolina', 'Etanol', 'IPCA', 'Salario Minimo', 'PIB',
        'Dolar - abertura', 'ESTOQUE(produto A)', 'VENDAS(produto A (mil litros))',
        'ESTOQUE(produto B)', 'VENDAS(produto B (mil litros))', 'Taxa desemprego'
    ]
    
    # Aplica o mesmo tratamento do Colab
    for col in colunas:
        df[col] = (
            df[col]
            .astype(str)
            .str.replace(' ', '')
            .str.replace('.', '')
            .str.replace(',', '.')
            .str.extract(r'([0-9.]+)')[0]
            .astype(float)
        )
    
    df['Taxa desemprego'] = df['Taxa desemprego'] / 100
    
    # 3. Renomeia colunas para match com o modelo
    df = df.rename(columns={
        "Data": "data",
        "Gasolina": "gasolina",
        "Etanol": "etanol",
        "IPCA": "ipca",
        "Salario Minimo": "salario_minimo",
        "PIB": "pib",
        "Dolar - abertura": "dolar_abertura",
        "Taxa desemprego": "taxa_desemprego",
        "ESTOQUE(produto A)": "estoque_a",
        "VENDAS(produto A (mil litros))": "vendas_a",
        "ESTOQUE(produto B)": "estoque_b",
        "VENDAS(produto B (mil litros))": "vendas_b"
    })
    
    # 4. Importa para o banco
    with engine.connect() as conn:
        df.to_sql(
            name="dados_consolidados",
            con=conn,
            if_exists="append",
            index=False
        )
    
    print("✅ Dados importados com sucesso!")

if __name__ == "__main__":
    importar_dados()