import { useEffect, useState } from 'react';
import { TipologiaDistribuicao } from '../../TipologiaDistribuicao';
import { logger } from '../../../utils/logger';

function TipologiaInsights() {
  const [distribuicao, setDistribuicao] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTipologias();
  }, []);

  const loadTipologias = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/tipologia/distribuicao');
      const data = await response.json();
      if (data.success) {
        setDistribuicao(data);
      }
      setLoading(false);
    } catch (error) {
      logger.error('Erro ao carregar tipologias', error as Error);
      setLoading(false);
    }
  };

  return (
    <TipologiaDistribuicao
      distribuicao={distribuicao?.distribuicao || []}
      total={distribuicao?.total || 0}
      loading={loading}
    />
  );
}

export default TipologiaInsights;
