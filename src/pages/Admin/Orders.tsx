// src/pages/admin/Orders.tsx
import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  ChevronDown,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ShoppingBag,
  User,
  Calendar,
  DollarSign,
  MapPin
} from 'lucide-react';

// Order data based on OMA Flowers business model
interface OrderItem {
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  price: number;
  bv: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    avatar: string;
  };
  items: OrderItem[];
  totalAmount: number;
  totalBV: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentStatus: 'Paid' | 'Unpaid' | 'Partial';
  shippingAddress: {
    street: string;
    city: string;
    region: string;
    country: string;
    zipCode: string;
  };
  orderDate: string;
  deliveryDate?: string;
  notes?: string;
  distributor?: string;
}

// Sample order data
const ordersData: Order[] = [
  {
    id: '1',
    orderNumber: 'OMA-2026-0001',
    customer: {
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+255 712 345 678',
      avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=amber&color=fff'
    },
    items: [
      { productId: '1', productName: 'Classic Class A Flower', productCode: 'CCA', quantity: 2, price: 56000, bv: 6 },
      { productId: '3', productName: 'Classic Class C Flower', productCode: 'CCC', quantity: 3, price: 15000, bv: 2 }
    ],
    totalAmount: 157000,
    totalBV: 18,
    status: 'Delivered',
    paymentStatus: 'Paid',
    shippingAddress: {
      street: '123 Main Street',
      city: 'Dar es Salaam',
      region: 'Kinondoni',
      country: 'Tanzania',
      zipCode: '14101'
    },
    orderDate: '2026-07-15',
    deliveryDate: '2026-07-18',
    notes: 'Leave at the gate',
    distributor: 'Sarah Smith'
  },
  {
    id: '2',
    orderNumber: 'OMA-2026-0002',
    customer: {
      name: 'Sarah Smith',
      email: 'sarah.smith@email.com',
      phone: '+255 765 432 100',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Smith&background=amber&color=fff'
    },
    items: [
      { productId: '4', productName: 'Luxury Class A Flower', productCode: 'LCA', quantity: 1, price: 250000, bv: 20 },
      { productId: '5', productName: 'Luxury Class B Flower', productCode: 'LCB', quantity: 2, price: 160000, bv: 14 }
    ],
    totalAmount: 570000,
    totalBV: 48,
    status: 'Shipped',
    paymentStatus: 'Paid',
    shippingAddress: {
      street: '45 Garden Avenue',
      city: 'Arusha',
      region: 'Arusha City',
      country: 'Tanzania',
      zipCode: '23102'
    },
    orderDate: '2026-07-16',
    deliveryDate: '2026-07-20',
    distributor: 'John Doe'
  },
  {
    id: '3',
    orderNumber: 'OMA-2026-0003',
    customer: {
      name: 'Mike Johnson',
      email: 'mike.johnson@email.com',
      phone: '+255 698 765 432',
      avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=amber&color=fff'
    },
    items: [
      { productId: '2', productName: 'Classic Class B Flower', productCode: 'CCB', quantity: 5, price: 34000, bv: 4 }
    ],
    totalAmount: 170000,
    totalBV: 20,
    status: 'Processing',
    paymentStatus: 'Unpaid',
    shippingAddress: {
      street: '789 Lake Road',
      city: 'Mwanza',
      region: 'Mwanza City',
      country: 'Tanzania',
      zipCode: '33102'
    },
    orderDate: '2026-07-17',
    notes: 'Requested priority delivery',
    distributor: 'Peter Wilson'
  },
  {
    id: '4',
    orderNumber: 'OMA-2026-0004',
    customer: {
      name: 'Jane Brown',
      email: 'jane.brown@email.com',
      phone: '+255 754 321 987',
      avatar: 'https://ui-avatars.com/api/?name=Jane+Brown&background=amber&color=fff'
    },
    items: [
      { productId: '6', productName: 'Luxury Class C Flower', productCode: 'LCC', quantity: 2, price: 120000, bv: 10 },
      { productId: '1', productName: 'Classic Class A Flower', productCode: 'CCA', quantity: 1, price: 56000, bv: 6 }
    ],
    totalAmount: 296000,
    totalBV: 26,
    status: 'Pending',
    paymentStatus: 'Partial',
    shippingAddress: {
      street: '12 Ocean View',
      city: 'Tanga',
      region: 'Tanga City',
      country: 'Tanzania',
      zipCode: '21101'
    },
    orderDate: '2026-07-18',
    notes: 'Customer requested specific delivery time',
    distributor: 'Robert Davis'
  },
  {
    id: '5',
    orderNumber: 'OMA-2026-0005',
    customer: {
      name: 'Peter Wilson',
      email: 'peter.wilson@email.com',
      phone: '+255 745 678 123',
      avatar: 'https://ui-avatars.com/api/?name=Peter+Wilson&background=amber&color=fff'
    },
    items: [
      { productId: '5', productName: 'Luxury Class B Flower', productCode: 'LCB', quantity: 3, price: 160000, bv: 14 },
      { productId: '3', productName: 'Classic Class C Flower', productCode: 'CCC', quantity: 4, price: 15000, bv: 2 }
    ],
    totalAmount: 540000,
    totalBV: 50,
    status: 'Cancelled',
    paymentStatus: 'Unpaid',
    shippingAddress: {
      street: '67 Mountain Street',
      city: 'Moshi',
      region: 'Kilimanjaro',
      country: 'Tanzania',
      zipCode: '25102'
    },
    orderDate: '2026-07-14',
    notes: 'Customer cancelled order',
    distributor: 'Mike Johnson'
  },
  {
    id: '6',
    orderNumber: 'OMA-2026-0006',
    customer: {
      name: 'Alice Mwangi',
      email: 'alice.mwangi@email.com',
      phone: '+255 756 789 123',
      avatar: 'https://ui-avatars.com/api/?name=Alice+&background=amber&color=fff'
    },
    items: [
      { productId: '4', productName: 'Luxury Class A Flower', productCode: 'LCA', quantity: 1, price: 250000, bv: 20 }
    ],
    totalAmount: 250000,
    totalBV: 20,
    status: 'Delivered',
    paymentStatus: 'Paid',
    shippingAddress: {
      street: '34 Green Park',
      city: 'Dar es Salaam',
      region: 'Ubungo',
      country: 'Tanzania',
      zipCode: '14102'
    },
    orderDate: '2026-07-12',
    deliveryDate: '2026-07-15',
    distributor: 'James Kariuki'
  }
];

// Status colors
const statusColors: Record<string, string> = {
  'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-300',
  'Processing': 'bg-blue-100 text-blue-700 border-blue-300',
  'Shipped': 'bg-purple-100 text-purple-700 border-purple-300',
  'Delivered': 'bg-green-100 text-green-700 border-green-300',
  'Cancelled': 'bg-red-100 text-red-700 border-red-300'
};

const statusIcons: Record<string, React.ReactNode> = {
  'Pending': <Clock size={14} className="text-yellow-500" />,
  'Processing': <Package size={14} className="text-blue-500" />,
  'Shipped': <Truck size={14} className="text-purple-500" />,
  'Delivered': <CheckCircle size={14} className="text-green-500" />,
  'Cancelled': <XCircle size={14} className="text-red-500" />
};

const paymentColors: Record<string, string> = {
  'Paid': 'bg-green-100 text-green-700',
  'Unpaid': 'bg-red-100 text-red-700',
  'Partial': 'bg-yellow-100 text-yellow-700'
};

const Orders: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPayment, setFilterPayment] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filter orders
  const filteredOrders = ordersData.filter(o => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         o.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         o.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || o.status === filterStatus;
    const matchesPayment = filterPayment === 'All' || o.paymentStatus === filterPayment;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Stats
  const totalOrders = ordersData.length;
  const pendingOrders = ordersData.filter(o => o.status === 'Pending').length;
  const processingOrders = ordersData.filter(o => o.status === 'Processing').length;
  const deliveredOrders = ordersData.filter(o => o.status === 'Delivered').length;
  const totalRevenue = ordersData.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalBV = ordersData.reduce((sum, o) => sum + o.totalBV, 0);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Manage customer orders and track deliveries</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium">
          <ShoppingBag size={16} />
          Create Order
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <h3 className="text-2xl font-bold text-gray-800">{totalOrders}</h3>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-lg">
              <Package className="text-amber-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <h3 className="text-2xl font-bold text-yellow-600">{pendingOrders}</h3>
            </div>
            <div className="p-2.5 bg-yellow-50 rounded-lg">
              <Clock className="text-yellow-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Processing</p>
              <h3 className="text-2xl font-bold text-blue-600">{processingOrders}</h3>
            </div>
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <Package className="text-blue-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Delivered</p>
              <h3 className="text-2xl font-bold text-green-600">{deliveredOrders}</h3>
            </div>
            <div className="p-2.5 bg-green-50 rounded-lg">
              <CheckCircle className="text-green-500" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <h3 className="text-2xl font-bold text-green-600">TSh {totalRevenue.toLocaleString()}</h3>
            </div>
            <div className="p-2.5 bg-green-50 rounded-lg">
              <DollarSign className="text-green-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total BV</p>
              <h3 className="text-2xl font-bold text-purple-600">{totalBV}</h3>
            </div>
            <div className="p-2.5 bg-purple-50 rounded-lg">
              <AlertCircle className="text-purple-500" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by order number or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white min-w-[150px]"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <select
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white min-w-[150px]"
        >
          <option value="All">All Payment</option>
          <option value="Paid">Paid</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Partial">Partial</option>
        </select>
        <button className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-amber-50/50 border-b border-amber-200/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Items</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">BV</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Payment</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100/30">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-amber-50/30 transition-colors cursor-pointer" onClick={() => setSelectedOrder(order)}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{order.orderNumber}</p>
                      <p className="text-xs text-gray-400">{order.orderDate}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <img src={order.customer.avatar} alt={order.customer.name} className="w-8 h-8 rounded-full" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{order.customer.name}</p>
                        <p className="text-xs text-gray-400">{order.customer.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">
                    {order.items.length} items
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">{order.totalBV}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1 ${statusColors[order.status]}`}>
                      {statusIcons[order.status]}
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${paymentColors[order.paymentStatus]}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className="text-sm font-bold text-amber-600">TSh {order.totalAmount.toLocaleString()}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors">
                        <Eye size={16} className="text-gray-400 hover:text-amber-600" />
                      </button>
                      <button className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors">
                        <Edit size={16} className="text-gray-400 hover:text-amber-600" />
                      </button>
                      <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} className="text-gray-400 hover:text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-amber-100/30 flex items-center justify-between text-sm text-gray-500">
          <span>Showing {filteredOrders.length} of {ordersData.length} orders</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 rounded-lg hover:bg-amber-50 transition-colors">Previous</button>
            <button className="px-3 py-1 rounded-lg bg-amber-500 text-white">1</button>
            <button className="px-3 py-1 rounded-lg hover:bg-amber-50 transition-colors">2</button>
            <button className="px-3 py-1 rounded-lg hover:bg-amber-50 transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-amber-100/50 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Order Details</h3>
                <p className="text-sm text-amber-600">{selectedOrder.orderNumber}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-amber-50 rounded-lg transition-colors">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Bar */}
              <div className="flex items-center gap-4 p-3 bg-amber-50/50 rounded-lg">
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium border inline-flex items-center gap-2 ${statusColors[selectedOrder.status]}`}>
                  {statusIcons[selectedOrder.status]}
                  {selectedOrder.status}
                </span>
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${paymentColors[selectedOrder.paymentStatus]}`}>
                  {selectedOrder.paymentStatus}
                </span>
                <span className="text-sm text-gray-500">Order Date: {selectedOrder.orderDate}</span>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <User size={16} /> Customer
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <img src={selectedOrder.customer.avatar} alt={selectedOrder.customer.name} className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-medium text-gray-800">{selectedOrder.customer.name}</p>
                      <p className="text-sm text-gray-500">{selectedOrder.customer.email}</p>
                      <p className="text-sm text-gray-500">{selectedOrder.customer.phone}</p>
                    </div>
                  </div>
                  {selectedOrder.distributor && (
                    <p className="text-sm text-gray-500 mt-2">Distributor: {selectedOrder.distributor}</p>
                  )}
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <MapPin size={16} /> Shipping Address
                  </p>
                  <div className="mt-2">
                    <p className="text-sm text-gray-700">{selectedOrder.shippingAddress.street}</p>
                    <p className="text-sm text-gray-700">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.region}</p>
                    <p className="text-sm text-gray-700">{selectedOrder.shippingAddress.country} - {selectedOrder.shippingAddress.zipCode}</p>
                  </div>
                  {selectedOrder.deliveryDate && (
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                      <CheckCircle size={14} /> Delivered on: {selectedOrder.deliveryDate}
                    </p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <p className="text-sm font-medium text-gray-500 mb-3">Order Items</p>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Quantity</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">BV</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Price</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2">
                            <p className="text-sm font-medium text-gray-700">{item.productName}</p>
                            <p className="text-xs text-gray-400">{item.productCode}</p>
                          </td>
                          <td className="px-4 py-2 text-center text-sm text-gray-600">{item.quantity}</td>
                          <td className="px-4 py-2 text-center text-sm text-gray-600">{item.bv}</td>
                          <td className="px-4 py-2 text-right text-sm text-gray-600">TSh {item.price.toLocaleString()}</td>
                          <td className="px-4 py-2 text-right text-sm font-medium text-amber-600">TSh {(item.price * item.quantity).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-100">
                      <tr>
                        <td colSpan={3} className="px-4 py-2 text-right font-medium text-gray-700">Total BV: {selectedOrder.totalBV}</td>
                        <td colSpan={2} className="px-4 py-2 text-right font-bold text-amber-600">TSh {selectedOrder.totalAmount.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="p-4 bg-yellow-50/50 rounded-lg border border-yellow-200/30">
                  <p className="text-sm font-medium text-gray-500">Notes</p>
                  <p className="text-sm text-gray-700 mt-1">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="border-t border-amber-100/30 pt-4 flex gap-3">
                <button className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
                  Update Status
                </button>
                <button className="flex-1 px-4 py-2 border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors">
                  Print Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;