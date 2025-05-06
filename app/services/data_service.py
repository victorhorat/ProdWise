from sqlalchemy.orm import Session
from app.models.dados import DadosConsolidados
from datetime import date
from typing import List, Dict

class DataService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_all_data(self) -> List[DadosConsolidados]:
        """Retorna todos os dados consolidados"""
        return self.db.query(DadosConsolidados).all()
    
    def get_product_data(self, product_id: str) -> List[Dict]:
        """Busca dados específicos de um produto"""
        if product_id not in ["a", "b"]:
            raise ValueError("Produto inválido. Use 'a' ou 'b'")
        
        fields = [
            DadosConsolidados.data,
            getattr(DadosConsolidados, f"estoque_{product_id}"),
            getattr(DadosConsolidados, f"vendas_{product_id}")
        ]
        
        results = self.db.query(*fields).all()
        return [{
            "data": data,
            "estoque": estoque,
            "vendas": vendas
        } for data, estoque, vendas in results]
    
    def add_data(self, data: dict):
        """Adiciona novos dados ao banco"""
        new_entry = DadosConsolidados(**data)
        self.db.add(new_entry)
        self.db.commit()
        return new_entry