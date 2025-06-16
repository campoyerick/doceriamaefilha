import { useState, useEffect } from 'react';
import OrderItem from './OrderItem';

const OrderList = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulação de carregamento de dados
    const fetchOrders = async () => {
      try {
        // Em uma aplicação real, isso viria de uma API
        await new Promise(resolve => setTimeout(resolve, 1500));
        setOrders([]); // Simula nenhum pedido
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {orders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <OrderItem key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="mt-6 text-xl font-medium text-gray-900">
            Nenhum pedido recebido ainda
          </h3>
          <p className="mt-2 text-gray-500 max-w-md mx-auto">
            Os pedidos aparecerão aqui automaticamente quando forem recebidos pelo WhatsApp.
          </p>
          <div className="mt-8 bg-gray-50 rounded-lg p-6 border border-gray-200 max-w-md mx-auto">
            <p className="text-sm text-gray-600">
              Aguardando novos pedidos... Enquanto isso, você pode:
            </p>
            <div className="mt-4 flex justify-center space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none">
                Ver Estatísticas
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                Configurar Notificações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;