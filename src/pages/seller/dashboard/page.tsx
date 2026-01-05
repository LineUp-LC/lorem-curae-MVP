import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/feature/Navbar';
import Footer from '../../../components/feature/Footer';

export default function SellerDashboardPage() {
  const [stats] = useState({
    totalSales: 2847,
    monthlyRevenue: 12450,
    activeListings: 24,
    pendingOrders: 8,
    totalViews: 15620,
    conversionRate: 3.2
  });

  const [recentOrders] = useState([
    {
      id: 'ORD-001',
      product: 'Vitamin C Serum',
      customer: 'Sarah Johnson',
      amount: 45.99,
      status: 'pending',
      date: '2024-01-15'
    },
    {
      id: 'ORD-002',
      product: 'Hyaluronic Acid',
      customer: 'Michael Chen',
      amount: 29.99,
      status: 'shipped',
      date: '2024-01-14'
    },
    {
      id: 'ORD-003',
      product: 'Niacinamide Treatment',
      customer: 'Emma Davis',
      amount: 39.99,
      status: 'delivered',
      date: '2024-01-13'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-taupe-100 text-taupe-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Seller Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
            </div>
            <Link
              to="/seller/products/add"
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium whitespace-nowrap"
            >
              <i className="ri-add-line mr-2"></i>
              Add Product
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSales}</p>
              </div>
              <div className="w-12 h-12 bg-taupe-100 rounded-lg flex items-center justify-center">
                <i className="ri-line-chart-line text-taupe text-xl"></i>
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-taupe font-medium">+12%</span>
              <span className="text-gray-600 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats.monthlyRevenue}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="ri-money-dollar-circle-line text-blue-600 text-xl"></i>
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-taupe font-medium">+8%</span>
              <span className="text-gray-600 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Listings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeListings}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="ri-product-hunt-line text-purple-600 text-xl"></i>
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-600">2 pending approval</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <i className="ri-time-line text-orange-600 text-xl"></i>
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-orange-600 font-medium">Needs attention</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <i className="ri-eye-line text-teal-600 text-xl"></i>
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-taupe font-medium">+15%</span>
              <span className="text-gray-600 ml-1">from last week</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <i className="ri-target-line text-indigo-600 text-xl"></i>
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-taupe font-medium">+0.3%</span>
              <span className="text-gray-600 ml-1">from last month</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                  <Link to="/seller/orders" className="text-teal-600 hover:text-teal-700 font-medium text-sm whitespace-nowrap">
                    View All Orders
                  </Link>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{order.product}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{order.customer} • {order.date}</p>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="font-semibold text-gray-900">${order.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/seller/products/add"
                  className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="ri-add-line text-teal-600"></i>
                  </div>
                  <span className="font-medium text-gray-900">Add New Product</span>
                </Link>

                <Link
                  to="/seller/orders"
                  className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="ri-shopping-bag-line text-blue-600"></i>
                  </div>
                  <span className="font-medium text-gray-900">Manage Orders</span>
                </Link>

                <Link
                  to="/seller/analytics"
                  className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="ri-bar-chart-line text-purple-600"></i>
                  </div>
                  <span className="font-medium text-gray-900">View Analytics</span>
                </Link>

                <Link
                  to="/seller/settings"
                  className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="ri-settings-line text-gray-600"></i>
                  </div>
                  <span className="font-medium text-gray-900">Store Settings</span>
                </Link>
              </div>
            </div>

            {/* Performance Tips */}
            <div className="bg-gradient-to-br from-teal-50 to-taupe-50 rounded-lg p-6 border border-teal-200">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center mr-3">
                  <i className="ri-lightbulb-line text-white text-sm"></i>
                </div>
                <h3 className="font-semibold text-gray-900">Performance Tip</h3>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                Products with detailed descriptions and high-quality images get 40% more views. 
                Consider updating your product photos!
              </p>
              <Link
                to="/seller/products"
                className="text-teal-600 hover:text-teal-700 font-medium text-sm whitespace-nowrap"
              >
                Update Products →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}