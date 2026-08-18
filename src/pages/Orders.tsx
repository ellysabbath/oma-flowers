// src/pages/Orders.tsx
import React from 'react';
import { Package, Truck, CheckCircle, Clock, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const Orders: React.FC = () => {
  const orders = [
    { id: 'OMA-2026-0001', date: '2026-07-15', status: 'Delivered', total: 157000, items: 2 },
    { id: 'OMA-2026-0002', date: '2026-07-10', status: 'Processing', total: 340000, items: 3 },
    { id: 'OMA-2026-0003', date: '2026-07-05', status: 'Shipped', total: 250000, items: 1 },
  ];

  const statusIcons = {
    'Delivered': <CheckCircle className="text-green-500" size={18} />,
    'Processing': <Clock className="text-blue-500" size={18} />,
    'Shipped': <Truck className="text-purple-500" size={18} />,
    'Pending': <Package className="text-yellow-500" size={18} />,
  };

  const statusColors = {
    'Delivered': 'bg-green-100 text-green-700',
    'Processing': 'bg-blue-100 text-blue-700',
    'Shipped': 'bg-purple-100 text-purple-700',
    'Pending': 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div className="min-h-screen bg-amber-50/30 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package size={64} className="text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">No Orders Yet</h2>
            <p className="text-gray-500 mt-2">Start shopping to see your orders here</p>
            <Link to="/shop" className="inline-block mt-6 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Order #{order.id}</p>
                    <p className="text-sm text-gray-500">{order.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusIcons[order.status as keyof typeof statusIcons]}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status as keyof typeof statusColors]}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-amber-600">TSh {order.total.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{order.items} items</p>
                  </div>
                  <button className="px-4 py-2 border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors flex items-center gap-2">
                    <Eye size={16} />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;