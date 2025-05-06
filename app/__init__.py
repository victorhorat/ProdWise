"""
Módulo principal da aplicação ProdWise
"""
from .core import settings  # Importa configurações globais

__version__ = "0.1.0"
__all__ = ["settings"]  # Controla o que é exportado quando alguém faz 'from app import *'

# Inicialização opcional de componentes
def init_app():
    """Função de inicialização para configurações complexas"""
    from .core.database import engine, Base
    # Código de inicialização pode ser adicionado aqui
    # Ex: Base.metadata.create_all(bind=engine)