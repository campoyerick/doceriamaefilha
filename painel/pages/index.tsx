import Head from 'next/head';
import OrderList from '../components/OrderList';
import { useState } from 'react';

export default function Home() {
  const [user, setUser] = useState({
    name: 'Administrador',
    avatar: '/avatar-placeholder.png', // URL da imagem do avatar
  });

  return (
    <>
      <Head>
        <title>Painel de Pedidos - Doceria</title>
        <meta name="description" content="Painel de gerenciamento de pedidos" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center">
                  <div className="bg-purple-600 text-white h-10 w-10 rounded-full flex items-center justify-center text-lg font-bold">
                    DC
                  </div>
                  <span className="ml-3 text-xl font-bold text-gray-900 hidden sm:block">
                    Doceria Mãe e Filha
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947z" clipRule="evenodd" />
                  </svg>
                  Configurações
                </button>
                
                <div className="relative">
                  <div className="bg-gray-200 border-2 border-dashed rounded-full w-10 h-10" />
                  <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-green-400"></span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Título da página */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-white">Painel de Pedidos</h1>
            <p className="mt-2 text-lg text-purple-200">
              Gerencie pedidos em tempo real
            </p>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <OrderList />
          </div>
        </main>

        {/* Footer fixo no rodapé */}
        <footer className="mt-auto bg-white border-t">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-500">
              © {new Date().getFullYear()} Doceria Mãe e Filha. Todos os direitos reservados.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}