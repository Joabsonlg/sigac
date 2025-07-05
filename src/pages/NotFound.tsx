
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-16 w-16 text-sigac-blue" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Página não encontrada</h1>
        <p className="text-gray-600 mb-6">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link to="/">
          <Button className="bg-sigac-blue hover:bg-blue-700">
            Voltar para o Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
