import os
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sqlalchemy.orm import Session
from sklearn.preprocessing import MinMaxScaler
from typing import Dict, List, Tuple, Optional, Union
from datetime import datetime, timedelta
from sklearn.neighbors import KNeighborsRegressor

from app.models.dados import DadosConsolidados

class MLService:
    def __init__(self, db: Session = None):
        self.db = db
        self.project_root = Path(__file__).resolve().parent.parent.parent
        self.models_dir = self.project_root / "models"
        
        # Criar diretório de modelos se não existir
        os.makedirs(self.models_dir, exist_ok=True)
        
        # Caminhos para os scalers
        self.features_scaler_path = self.models_dir / "features_scaler.joblib"
        self.target_scalers_path = self.models_dir / "target_scalers.joblib"
        
        # Inicializar ou carregar scalers
        self._initialize_scalers()
    
    def _initialize_scalers(self):
        """Inicializa ou carrega os scalers existentes"""
        # Scaler para features
        if os.path.exists(self.features_scaler_path):
            self.features_scaler = joblib.load(self.features_scaler_path)
        else:
            self.features_scaler = MinMaxScaler()
        
        # Scalers para targets (um para cada variável alvo)
        self.target_scalers = {}
        if os.path.exists(self.target_scalers_path):
            self.target_scalers = joblib.load(self.target_scalers_path)
        
    def _get_data_from_db(self) -> pd.DataFrame:
        """Obtém todos os dados da base e converte para DataFrame"""
        dados = self.db.query(DadosConsolidados).all()
        
        # Converter para dicionário e depois para DataFrame
        data_list = []
        for item in dados:
            data_dict = {
                'data': item.data,
                'gasolina': item.gasolina,
                'etanol': item.etanol,
                'ipca': item.ipca,
                'salario_minimo': item.salario_minimo,
                'pib': item.pib,
                'dolar_abertura': item.dolar_abertura,
                'taxa_desemprego': item.taxa_desemprego,
                'estoque_a': item.estoque_a,
                'vendas_a': item.vendas_a,
                'estoque_b': item.estoque_b,
                'vendas_b': item.vendas_b
            }
            data_list.append(data_dict)
            
        return pd.DataFrame(data_list)
    
    def normalize_data(self, update_scalers: bool = False) -> Dict[str, pd.DataFrame]:
        """
        Normaliza todos os dados e atualiza os scalers se solicitado.
        
        Args:
            update_scalers: Se True, treina novos scalers com os dados atuais
            
        Returns:
            Dict com DataFrames normalizados divididos em features e targets
        """
        # Obter dados do DB
        df = self._get_data_from_db()
        
        # Definir colunas de features e targets
        date_col = ['data']
        feature_cols = [
            'gasolina', 'etanol', 'ipca', 'salario_minimo', 'pib', 
            'dolar_abertura', 'taxa_desemprego'
        ]
        target_cols = ['estoque_a', 'vendas_a', 'estoque_b', 'vendas_b']
        
        # Extrair dados
        dates = df[date_col].copy()
        features = df[feature_cols].copy()
        targets = df[target_cols].copy()
        
        # Normalizar features
        if update_scalers:
            # Treinar novo scaler com os dados atuais
            self.features_scaler = MinMaxScaler().fit(features)
            joblib.dump(self.features_scaler, self.features_scaler_path)
        
        normalized_features = pd.DataFrame(
            self.features_scaler.transform(features),
            columns=feature_cols,
            index=features.index
        )
        
        # Normalizar cada target separadamente
        normalized_targets = pd.DataFrame(index=targets.index)
        for col in target_cols:
            if update_scalers:
                scaler = MinMaxScaler().fit(targets[[col]])
                self.target_scalers[col] = scaler
            else:
                # Criar scaler se não existir
                if col not in self.target_scalers:
                    scaler = MinMaxScaler().fit(targets[[col]])
                    self.target_scalers[col] = scaler
                else:
                    scaler = self.target_scalers[col]
            
            # Aplicar normalização
            col_values = targets[[col]].values
            normalized_targets[col] = scaler.transform(col_values).flatten()
        
        if update_scalers:
            # Salvar todos os target_scalers
            joblib.dump(self.target_scalers, self.target_scalers_path)
        
        # Recombinar com as datas
        normalized_features = pd.concat([dates, normalized_features], axis=1)
        normalized_targets = pd.concat([dates.copy(), normalized_targets], axis=1)
        
        return {
            'features': normalized_features,
            'targets': normalized_targets,
            'original': df
        }
    
    def inverse_transform_features(self, normalized_data: Union[pd.DataFrame, np.ndarray]) -> Union[pd.DataFrame, np.ndarray]:
        """Converte features normalizadas de volta para a escala original"""
        if isinstance(normalized_data, pd.DataFrame):
            feature_cols = normalized_data.columns.tolist()
            if 'data' in feature_cols:
                # Preservar a coluna de data
                date_col = normalized_data[['data']].copy()
                feature_cols.remove('data')
                features_only = normalized_data[feature_cols].copy()
                
                # Inverter normalização
                original_scale = pd.DataFrame(
                    self.features_scaler.inverse_transform(features_only),
                    columns=feature_cols,
                    index=features_only.index
                )
                
                # Recombinar com data
                return pd.concat([date_col, original_scale], axis=1)
            else:
                return pd.DataFrame(
                    self.features_scaler.inverse_transform(normalized_data),
                    columns=feature_cols,
                    index=normalized_data.index
                )
        else:
            return self.features_scaler.inverse_transform(normalized_data)
    
    def inverse_transform_target(self, normalized_data: Union[pd.DataFrame, np.ndarray], target_col: str) -> Union[pd.DataFrame, np.ndarray]:
        """Converte um target normalizado de volta para a escala original"""
        if target_col not in self.target_scalers:
            raise ValueError(f"Não há scaler para a coluna target '{target_col}'")
            
        scaler = self.target_scalers[target_col]
        
        if isinstance(normalized_data, pd.DataFrame):
            # Se é DataFrame, assumir que contém apenas a coluna alvo
            if target_col in normalized_data.columns:
                # Reshape para formato esperado pelo scaler (nx1)
                values = normalized_data[[target_col]].values
                original_values = scaler.inverse_transform(values)
                
                # Criar novo DataFrame com valores originais
                result = normalized_data.copy()
                result[target_col] = original_values
                return result
            else:
                raise ValueError(f"A coluna '{target_col}' não está presente nos dados")
        else:
            # Para arrays, reshape para o formato (n, 1) esperado pelo scaler
            if normalized_data.ndim == 1:
                normalized_data = normalized_data.reshape(-1, 1)
            return scaler.inverse_transform(normalized_data)

    def get_normalized_product_data(self, product_id: str, update_scalers: bool = False) -> pd.DataFrame:
        """
        Retorna dados normalizados específicos para um produto
        
        Args:
            product_id: 'a' ou 'b'
            update_scalers: Se deve atualizar os scalers
            
        Returns:
            DataFrame com features normalizadas e dados do produto
        """
        if product_id.lower() not in ['a', 'b']:
            raise ValueError("ID do produto deve ser 'a' ou 'b'")
            
        # Normalizar todos os dados
        data_dict = self.normalize_data(update_scalers=update_scalers)
        
        # Selecionar colunas relevantes para o produto
        features = data_dict['features']
        product_cols = [f'estoque_{product_id.lower()}', f'vendas_{product_id.lower()}']
        targets = data_dict['targets'][product_cols]
        
        # Juntar features e targets do produto específico
        return pd.concat([features, targets], axis=1)
    
    # Até aqui normalização -----------------------------------------------

    
    def _create_future_dates(self, start_year: int = 2025, start_month: int = 1, periods: int = 12) -> pd.DataFrame:
        """
        Cria dataframe com datas futuras para previsão, sempre no primeiro dia de cada mês
        
        Args:
            start_year: Ano inicial das previsões
            start_month: Mês inicial das previsões (1 = Janeiro)
            periods: Número de meses a serem gerados
        
        Returns:
            DataFrame com coluna 'data' contendo os primeiros dias de cada mês
        """
        # Criar um range de datas mensais começando em start_year-start_month
        start_date = pd.Timestamp(year=start_year, month=start_month, day=1)
        dates = pd.date_range(start=start_date, periods=periods, freq='MS')  # MS = Month Start
        
        return pd.DataFrame({'data': dates})
    
    def train_knn_model(self, product_id: str, k: int = 8) -> dict:
        """
        Treina um modelo KNN para prever vendas do produto especificado
        usando dados de 2016 a 2024
        
        Args:
            product_id: 'a' ou 'b'
            k: número de vizinhos para o KNN
            
        Returns:
            Dicionário com informações sobre o treinamento
        """
        if product_id.lower() not in ['a', 'b']:
            raise ValueError("ID do produto deve ser 'a' ou 'b'")
        
        # Obter dados normalizados
        data = self.normalize_data(update_scalers=False)
        
        # Filtrar dados de 2016 a 2024
        data_features = data['features'].copy()
        data_targets = data['targets'].copy()
        
        # Converter datas
        data_features['data'] = pd.to_datetime(data_features['data'])
        data_targets['data'] = pd.to_datetime(data_targets['data'])
        
        # Filtrar período de interesse
        data_features = data_features[
            (data_features['data'] >= pd.Timestamp('2016-01-01')) & 
            (data_features['data'] < pd.Timestamp('2025-01-01'))
        ]
        
        data_targets = data_targets[
            (data_targets['data'] >= pd.Timestamp('2016-01-01')) & 
            (data_targets['data'] < pd.Timestamp('2025-01-01'))
        ]
        
        # Preparar features e target
        target_col = f'vendas_{product_id.lower()}'
        
        # Remover a coluna de data das features
        features = data_features.drop('data', axis=1).values
        target = data_targets[target_col].values
        
        # Treinar modelo KNN
        knn_model = KNeighborsRegressor(n_neighbors=k, weights='distance')
        knn_model.fit(features, target)
        
        # Salvar o modelo treinado
        model_path = self.models_dir / f"knn_vendas_{product_id.lower()}.joblib"
        joblib.dump(knn_model, model_path)
        
        return {
            "model_type": "KNN Regressor",
            "product": product_id,
            "k_neighbors": k,
            "features_count": features.shape[1],
            "training_samples": features.shape[0],
            "model_saved": str(model_path),
            "period": "2016-2024"
        }
        
    def _generate_feature_predictions_for_2025(self) -> pd.DataFrame:
        """
        Gera previsões para as features econômicas para 2025
        usando uma abordagem baseada em tendências de 2016 a 2024
        
        Returns:
            DataFrame com features previstas para 2025
        """
        # Obter dados originais
        original_data = self._get_data_from_db()
        
        # Converter datas e ordenar
        original_data['data'] = pd.to_datetime(original_data['data'])
        original_data = original_data.sort_values('data')
        
        # Filtrar para obter dados de 2016 até o presente
        filtered_data = original_data[
            (original_data['data'] >= pd.Timestamp('2016-01-01')) & 
            (original_data['data'] < pd.Timestamp('2025-01-01'))
        ]
        
        # Calcular a taxa de crescimento mensal média para cada feature
        feature_cols = [
            'gasolina', 'etanol', 'ipca', 'salario_minimo', 'pib', 
            'dolar_abertura', 'taxa_desemprego'
        ]
        
        # Pegar os valores do último mês como base
        last_values = filtered_data[feature_cols].iloc[-1].to_dict()
        last_date = filtered_data['data'].iloc[-1]
        
        # Calcular tendências médias mensais com base em todo o período
        growth_rates = {}
        for col in feature_cols:
            # Calcular a taxa de crescimento média com base em todos os dados disponíveis
            values = filtered_data[col].values
            # Evitar divisão por zero
            start_val = values[0] if values[0] != 0 else 0.001
            end_val = values[-1]
            
            # Calcular o número de meses no dataset
            start_date = filtered_data['data'].iloc[0]
            end_date = filtered_data['data'].iloc[-1]
            num_months = (end_date.year - start_date.year) * 12 + (end_date.month - start_date.month)
            
            # Taxa de crescimento mensal média (geométrica)
            if num_months > 0:
                monthly_rate = (end_val / start_val) ** (1/num_months) - 1
            else:
                monthly_rate = 0
                
            growth_rates[col] = monthly_rate
        
        # Gerar datas para 2025
        future_dates_df = self._create_future_dates(
            start_year=2025,
            start_month=1, 
            periods=12
        )
        
        # Gerar previsões para cada feature
        for col in feature_cols:
            base_value = last_values[col]
            monthly_growth = growth_rates[col]
            
            # Gerar valores projetados
            projected_values = []
            for i in range(12):
                # Número de meses desde o último dado real
                months_from_last = i + 1
                projected_value = base_value * ((1 + monthly_growth) ** months_from_last)
                projected_values.append(projected_value)
                
            future_dates_df[col] = projected_values
            
        # Normalizar as features projetadas usando o mesmo scaler
        feature_values = future_dates_df[feature_cols].values
        normalized_features = self.features_scaler.transform(feature_values)
        
        # Substituir pelos valores normalizados
        future_dates_df[feature_cols] = normalized_features
        
        return future_dates_df
    
    def predict_sales_for_2025(self, product_id: str, k_neighbors: int = 1) -> pd.DataFrame:
        """
        Prevê vendas mensais para o ano de 2025 usando KNN Regressor.
        
        Args:
            product_id: 'a' ou 'b' para o produto específico
            k_neighbors: número de vizinhos a considerar no KNN
            
        Returns:
            DataFrame com previsões de vendas para 2025
        """
        product_id = product_id.lower()
        if product_id not in ['a', 'b']:
            raise ValueError("ID do produto deve ser 'a' ou 'b'")
        
        # 1. Obter dados do banco
        df = self._get_data_from_db()
        
        # Converter coluna de data para datetime (se necessário)
        df['data'] = pd.to_datetime(df['data'])
        
        # 2. Usar todos os dados disponíveis para treino
        train_data = df.copy()
        
        # 3. Definir qual coluna é o target com base no produto selecionado
        if product_id == 'a':
            target_col = 'vendas_a'
            other_product = 'b'
        else:  # product_id == 'b'
            target_col = 'vendas_b'
            other_product = 'a'
        
        # 4. Definir colunas a serem removidas:
        cols_para_remover = [
            'data',                      # Não usar data como feature
            target_col,                  # Remover o target (será nosso y)
            f'vendas_{other_product}',   # Remover vendas do outro produto
            f'estoque_{product_id}',     # Remover estoque do produto atual
            f'estoque_{other_product}'   # Remover estoque do outro produto
        ]
        
        # 5. Separar features (X) e target (y)
        X_train = train_data.drop(columns=cols_para_remover)
        y_train = train_data[target_col]
        
        # 6. Treinar o modelo KNN
        model = KNeighborsRegressor(n_neighbors=k_neighbors)
        model.fit(X_train, y_train)
        
        # 7. Criar dados para 2025
        future_dates = self._create_future_dates()
        
        # 8. Criar features para 2025 baseadas nos dois últimos anos (2023-2024)
        # Filtramos apenas os dados dos últimos 2 anos
        data_2023_2024 = df[df['data'].dt.year >= 2023]

        # Extrair mês de cada data
        data_2023_2024['mes'] = data_2023_2024['data'].dt.month

        # Criar DataFrame para armazenar as features mensais para 2025
        X_future = pd.DataFrame(index=range(12), columns=X_train.columns)

        # Para cada mês de 2025, calcular as features baseadas na média desse mesmo mês nos últimos 2 anos
        for month in range(1, 13):
            # Filtrar dados dos últimos 2 anos para este mês específico
            month_data = data_2023_2024[data_2023_2024['mes'] == month]
            
            # Obter apenas as colunas de features
            month_features = month_data.drop(columns=cols_para_remover + ['mes'])
            
            # Calcular a média de cada feature para este mês nos últimos 2 anos
            if len(month_features) > 0:  # Verificar se temos dados para este mês
                month_avg_features = month_features.mean().to_dict()
                
                # Atribuir os valores médios ao mês correspondente em X_future
                for col in X_train.columns:
                    X_future.loc[month-1, col] = month_avg_features.get(col, 0)

        # 9. Fazer previsão para 2025
        predictions = model.predict(X_future)

        # 10. Criar DataFrame final com data e vendas
        result = pd.DataFrame({
            'data': future_dates['data'],
            target_col: predictions  # Usar o nome correto da coluna para compatibilidade
        })

        return result
    
    
    def get_previsoes_produto(self, product_id: str, limit: int = 3) -> list[dict]:
        """
        Retorna as últimas previsões desnormalizadas do produto A ou B
        """
        product_id = product_id.lower()
        df = self.predict_sales_for_2025(product_id)

        target_col = f'vendas_{product_id}'
        ultimos = df.sort_values("data", ascending=False).head(limit)

        # Desnormalizar os valores
        df_denorm = self.inverse_transform_target(ultimos[[target_col]], target_col)
        valores_reais = df_denorm[target_col].values.tolist()

        return [
            {
                "data": d.strftime("%Y-%m-%d"),
                "produto": product_id.upper(),
                "previsao": round(v, 2)
            }
            for d, v in zip(ultimos["data"], valores_reais)
        ]