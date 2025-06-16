import { useState } from 'react';
import axios from 'axios';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  rescheduling: 'bg-blue-100 text-blue-800',
  rescheduled: 'bg-purple-100 text-purple-800',
  canceled: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  rescheduling: 'Aguardando Reagendamento',
  rescheduled: 'Reagendado',
  canceled: 'Cancelado',
};

const OrderItem = ({ order, onStatusChange }: { 
  order: any, 
  onStatusChange: (id: string, status: string) => void 
}) => {
  const [currentStatus, setCurrentStatus] = useState(order.status);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus);
    onStatusChange(order.id, newStatus);
  };

  const handleRescheduleClick = () => {
    setIsRescheduling(true);
    handleStatusChange('rescheduling');
  };

  const handleConfirmReschedule = async () => {
    if (!newDate || !newTime) return;
    
    setIsSending(true);
    const newDateTime = `${newDate} ${newTime}`;
    
    try {
      // Enviar nova data para o bot
      await axios.post('/api/bot/reschedule', {
        customerId: order.customerId,
        orderId: order.id,
        newDateTime
      });
      
      // Atualizar status no painel
      handleStatusChange('rescheduled');
      setIsRescheduling(false);
      
    } catch (error) {
      console.error('Erro ao reagendar:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="card mb-6">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{order.customerName}</h2>
            <p className="text-gray-600">{order.customerPhone}</p>
          </div>
          
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[currentStatus]}`}>
            {statusLabels[currentStatus]}
          </span>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-500">
            {new Date(order.timestamp).toLocaleString('pt-BR')}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            ID: {order.id}
          </p>
        </div>
        
        <div className="mb-4">
          <h3 className="font-semibold text-gray-700 mb-2">Itens:</h3>
          <ul className="space-y-1">
            {order.items.map((item: string, index: number) => (
              <li key={index} className="text-gray-600">• {item}</li>
            ))}
          </ul>
        </div>
        
        <div className="border-t border-gray-100 pt-4">
          <div className="flex justify-between items-center mb-3">
            <span className="font-medium text-gray-700">Total:</span>
            <span className="font-bold text-lg">R$ {order.total.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center mb-3">
            <span className="font-medium text-gray-700">Data de Entrega:</span>
            <span className="font-medium">
              {order.deliveryDate || 'A definir'}
            </span>
          </div>
          
          {order.paymentMethod && (
            <div className="flex justify-between items-center mb-3">
              <span className="font-medium text-gray-700">Pagamento:</span>
              <span className="font-medium">{order.paymentMethod}</span>
            </div>
          )}
          
          {order.note && (
            <div className="mt-3">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Observação:</span> {order.note}
              </p>
            </div>
          )}
        </div>
        
        {currentStatus === 'pending' && (
          <div className="mt-4 flex flex-wrap gap-3">
            <button 
              onClick={() => handleStatusChange('confirmed')}
              className="btn-primary flex-1 py-2"
            >
              Confirmar Horário
            </button>
            
            <button 
              onClick={handleRescheduleClick}
              className="btn-outline flex-1 py-2"
            >
              Reagendar
            </button>
          </div>
        )}
        
        {isRescheduling && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-3">Selecione nova data e horário:</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setIsRescheduling(false)}
                className="btn-outline flex-1 py-2"
              >
                Cancelar
              </button>
              
              <button 
                onClick={handleConfirmReschedule}
                disabled={isSending || !newDate || !newTime}
                className="btn-primary flex-1 py-2 disabled:opacity-50"
              >
                {isSending ? 'Enviando...' : 'Confirmar Reagendamento'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderItem;