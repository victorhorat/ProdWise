from sqlalchemy import Column, Integer, Float, String
from .database import Base

class DadosConsolidados(Base):
    __tablename__ = "dados_consolidados"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    data = Column(String)
    gasolina = Column(Float)
    etanol = Column(Float)
    ipca = Column(Float)
    salario_minimo = Column(Float)
    pib = Column(Float)
    dolar_abertura = Column(Float)
    taxa_desemprego = Column(Float)
    estoque_a = Column(Float)
    vendas_a = Column(Float)
    estoque_b = Column(Float)
    vendas_b = Column(Float)