from sqlalchemy import Column, Integer, Float, Date
from .base import Base
from datetime import date  # Alterado de datetime para date

class DadosConsolidados(Base):
    __tablename__ = "dados_consolidados"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    data = Column(Date)  # Alterado de String para Date
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

    def __repr__(self):
        return f"<Dados {self.data}>"