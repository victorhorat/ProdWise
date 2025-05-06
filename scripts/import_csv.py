import sys
from pathlib import Path
import pandas as pd
from datetime import datetime

# Adiciona o diretório raiz ao Python path
project_root = Path(__file__).resolve().parent.parent
sys.path.append(str(project_root))

from app.models.base import Base
from app.core.database import engine, SessionLocal
from app.models.dados import DadosConsolidados

def importar_dados():
    # 1. Cria a estrutura do banco usando SQLAlchemy
    Base.metadata.create_all(bind=engine)
    
    # 2. Carrega e limpa os dados usando caminho absoluto
    csv_path = project_root / "data" / "base.csv"
    df = pd.read_csv(csv_path, encoding='utf-8')
    
    # 3. Processamento dos dados
    # Converte datas para formato date (ajustado para o modelo)
    df['Data'] = pd.to_datetime(df['Data'], format='%Y-%m').dt.date
    
    # Lista de colunas para tratamento numérico
    colunas = [
        'Gasolina', 'Etanol', 'IPCA', 'Salario Minimo', 'PIB',
        'Dolar - abertura', 'ESTOQUE(produto A)', 'VENDAS(produto A (mil litros))',
        'ESTOQUE(produto B)', 'VENDAS(produto B (mil litros))', 'Taxa desemprego'
    ]
    
    # Limpeza e conversão de valores numéricos
    for col in colunas:
        df[col] = (
            df[col]
            .astype(str)
            .str.replace(r'[^\d,]', '', regex=True)  # Remove tudo exceto números e vírgula
            .str.replace(',', '.')
            .astype(float)
        )
    
    # Ajuste percentual
    df['Taxa desemprego'] = df['Taxa desemprego'] / 100
    
    # 4. Renomeia colunas para match com o modelo
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
    
    # 5. Importa para o banco usando ORM do SQLAlchemy
    with SessionLocal() as session:
        try:
            # Converte cada linha do DataFrame para objetos DadosConsolidados
            records = [DadosConsolidados(**row) for row in df.to_dict('records')]
            session.bulk_save_objects(records)
            session.commit()
            print(f"✅ Dados importados com sucesso! Total: {len(df)} registros")
        except Exception as e:
            session.rollback()
            print(f"❌ Erro ao importar dados: {str(e)}")
            raise

if __name__ == "__main__":
    importar_dados()