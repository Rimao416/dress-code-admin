"use client"
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Image from 'next/image'
import { 
  Package, 
  MapPin, 
  CreditCard, 
  Truck,
  User,
  Phone,
  Mail,
  Calendar,
  Hash,
  ShoppingBag,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ChevronRight,
  Edit,
  Printer,
  Download,
  DollarSign,
  TrendingUp,
  Box
} from 'lucide-react'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import PageHeader from '@/components/common/PageHeader'
import { useOrder } from '@/hooks/orders/useOrder'
import { useMessages } from '@/context/useMessage'
import { useTheme } from '@/context/ThemeContext'

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { isDarkMode } = useTheme()
  const orderId = String(params.id)
 
  useEffect(() => {
    if (!orderId || orderId === 'undefined') {
      router.push('/dashboard/orders')
    }
  }, [orderId, router])
 
  const { setMessage } = useMessages()

  const {
    data: order,
    isLoading,
    error,
  } = useOrder(orderId)

  useEffect(() => {
    if (error) {
      setMessage('Commande non trouvée', 'error')
      router.push('/dashboard/orders')
    }
  }, [error, router, setMessage])

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; icon: any; label: string; bgLight: string; bgDark: string }> = {
      PENDING: { 
        color: 'text-yellow-600', 
        icon: Clock, 
        label: 'En attente',
        bgLight: 'bg-yellow-50 border-yellow-200',
        bgDark: 'bg-yellow-500/10 border-yellow-500/30'
      },
      CONFIRMED: { 
        color: 'text-blue-600', 
        icon: CheckCircle, 
        label: 'Confirmée',
        bgLight: 'bg-blue-50 border-blue-200',
        bgDark: 'bg-blue-500/10 border-blue-500/30'
      },
      PROCESSING: { 
        color: 'text-purple-600', 
        icon: Package, 
        label: 'En préparation',
        bgLight: 'bg-purple-50 border-purple-200',
        bgDark: 'bg-purple-500/10 border-purple-500/30'
      },
      SHIPPED: { 
        color: 'text-indigo-600', 
        icon: Truck, 
        label: 'Expédiée',
        bgLight: 'bg-indigo-50 border-indigo-200',
        bgDark: 'bg-indigo-500/10 border-indigo-500/30'
      },
      DELIVERED: { 
        color: 'text-green-600', 
        icon: CheckCircle, 
        label: 'Livrée',
        bgLight: 'bg-green-50 border-green-200',
        bgDark: 'bg-green-500/10 border-green-500/30'
      },
      CANCELLED: { 
        color: 'text-red-600', 
        icon: XCircle, 
        label: 'Annulée',
        bgLight: 'bg-red-50 border-red-200',
        bgDark: 'bg-red-500/10 border-red-500/30'
      }
    }
    return configs[status] || configs.PENDING
  }

  const getPaymentStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      PENDING: { color: 'yellow', label: 'En attente' },
      PAID: { color: 'green', label: 'Payée' },
      FAILED: { color: 'red', label: 'Échouée' },
      REFUNDED: { color: 'gray', label: 'Remboursée' }
    }
    return configs[status] || configs.PENDING
  }

  const SkeletonLoader = () => (
    <div className="animate-pulse space-y-6">
      <div className={`h-32 rounded-2xl ${isDarkMode ? 'bg-slate-700' : 'bg-gray-300'}`}></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`h-64 rounded-2xl ${isDarkMode ? 'bg-slate-700' : 'bg-gray-300'}`}></div>
        <div className={`h-64 rounded-2xl ${isDarkMode ? 'bg-slate-700' : 'bg-gray-300'}`}></div>
        <div className={`h-64 rounded-2xl ${isDarkMode ? 'bg-slate-700' : 'bg-gray-300'}`}></div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <PageHeader
            breadcrumb={["Commandes", "Détails de la commande"]}
            title="Gestion des commandes"
          />
          <SkeletonLoader />
        </div>
      </DashboardLayout>
    )
  }

  if (!order) return null

  const statusConfig = getStatusConfig(order.status)
  const StatusIcon = statusConfig.icon
  const paymentConfig = getPaymentStatusConfig(order.paymentStatus)

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          breadcrumb={["Commandes", `#${order.orderNumber}`]}
          title="Détails de la commande"
        />

        {/* En-tête de commande */}
        <div className={`rounded-2xl border overflow-hidden ${
          isDarkMode 
            ? 'bg-slate-800/50 border-slate-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className={`p-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Commande #{order.orderNumber}
                  </h1>
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${
                    isDarkMode 
                      ? statusConfig.bgDark
                      : statusConfig.bgLight
                  }`}>
                    <StatusIcon size={16} className={statusConfig.color} />
                    <span className={`text-sm font-semibold ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <span className={`flex items-center space-x-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    <Calendar size={14} />
                    <span>Créée le {format(new Date(order.createdAt), 'd MMMM yyyy à HH:mm', { locale: fr })}</span>
                  </span>
                  <span className={`flex items-center space-x-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    <Package size={14} />
                    <span>{order._count?.items ?? 0} article{(order._count?.items ?? 0) > 1 ? 's' : ''}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Résumé financier */}
          <div className="p-6 grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className={`text-xs uppercase tracking-wide mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                Sous-total
              </p>
              <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {order.subtotal.toFixed(2)} €
              </p>
            </div>
            <div>
              <p className={`text-xs uppercase tracking-wide mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                Livraison
              </p>
              <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {order.shippingCost.toFixed(2)} €
              </p>
            </div>
            <div>
              <p className={`text-xs uppercase tracking-wide mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                Taxes
              </p>
              <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {order.taxAmount.toFixed(2)} €
              </p>
            </div>
            <div>
              <p className={`text-xs uppercase tracking-wide mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                Réduction
              </p>
              <p className={`text-lg font-bold text-green-600`}>
                -{order.discountAmount.toFixed(2)} €
              </p>
            </div>
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
              <p className={`text-xs uppercase tracking-wide mb-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                Total
              </p>
              <p className={`text-2xl font-black ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                {order.totalAmount.toFixed(2)} €
              </p>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations client */}
          {order.client && (
            <div className={`rounded-2xl border p-6 ${
              isDarkMode 
                ? 'bg-slate-800/50 border-slate-700' 
                : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg font-bold mb-4 flex items-center space-x-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <User size={20} className="text-blue-500" />
                <span>Informations client</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    {order.client.firstName} {order.client.lastName}
                  </p>
                  <div className={`text-sm space-y-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    {order.client.user?.email && (
                      <div className="flex items-center space-x-2">
                        <Mail size={14} />
                        <span>{order.client.user.email}</span>
                      </div>
                    )}
                    {order.client.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone size={14} />
                        <span>{order.client.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Adresse de livraison */}
          {order.shippingAddress && (
            <div className={`rounded-2xl border p-6 ${
              isDarkMode 
                ? 'bg-slate-800/50 border-slate-700' 
                : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg font-bold mb-4 flex items-center space-x-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <MapPin size={20} className="text-green-500" />
                <span>Adresse de livraison</span>
              </h3>
              <div className={`text-sm space-y-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.postalCode} {order.shippingAddress.city}</p>
                <p>{order.shippingAddress.state}</p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && (
                  <p className="pt-2 flex items-center space-x-2">
                    <Phone size={14} />
                    <span>{order.shippingAddress.phone}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Adresse de facturation */}
          {order.billingAddress && (
            <div className={`rounded-2xl border p-6 ${
              isDarkMode 
                ? 'bg-slate-800/50 border-slate-700' 
                : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg font-bold mb-4 flex items-center space-x-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <FileText size={20} className="text-purple-500" />
                <span>Adresse de facturation</span>
              </h3>
              <div className={`text-sm space-y-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                <p>{order.billingAddress.street}</p>
                <p>{order.billingAddress.postalCode} {order.billingAddress.city}</p>
                <p>{order.billingAddress.state}</p>
                <p>{order.billingAddress.country}</p>
                {order.billingAddress.phone && (
                  <p className="pt-2 flex items-center space-x-2">
                    <Phone size={14} />
                    <span>{order.billingAddress.phone}</span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Paiement et suivi */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informations de paiement */}
          <div className={`rounded-2xl border p-6 ${
            isDarkMode 
              ? 'bg-slate-800/50 border-slate-700' 
              : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-bold mb-4 flex items-center space-x-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <CreditCard size={20} className="text-blue-500" />
              <span>Informations de paiement</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  Statut du paiement
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  paymentConfig.color === 'green' 
                    ? `${isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'}`
                    : paymentConfig.color === 'yellow'
                    ? `${isDarkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}`
                    : paymentConfig.color === 'red'
                    ? `${isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'}`
                    : `${isDarkMode ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-700'}`
                }`}>
                  {paymentConfig.label}
                </span>
              </div>
              {order.paymentMethod && (
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    Méthode de paiement
                  </span>
                  <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {order.paymentMethod}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Suivi de commande */}
          <div className={`rounded-2xl border p-6 ${
            isDarkMode 
              ? 'bg-slate-800/50 border-slate-700' 
              : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-bold mb-4 flex items-center space-x-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <Truck size={20} className="text-indigo-500" />
              <span>Suivi de la commande</span>
            </h3>
            {order.tracking && order.tracking.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {order.tracking.map((track, idx) => (
                  <div key={track.id} className={`flex space-x-3 ${idx !== order.tracking!.length - 1 ? 'pb-3 border-b' : ''} ${
                    isDarkMode ? 'border-slate-700' : 'border-gray-200'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      idx === 0 ? 'bg-blue-500' : isDarkMode ? 'bg-slate-600' : 'bg-gray-300'
                    }`}></div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {track.status}
                      </p>
                      {track.description && (
                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                          {track.description}
                        </p>
                      )}
                      {track.location && (
                        <p className={`text-xs flex items-center space-x-1 mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                          <MapPin size={12} />
                          <span>{track.location}</span>
                        </p>
                      )}
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                        {format(new Date(track.createdAt), 'd MMM yyyy à HH:mm', { locale: fr })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                Aucune information de suivi disponible
              </p>
            )}
          </div>
        </div>

        {/* Articles commandés */}
        {order.items && order.items.length > 0 && (
          <div className={`rounded-2xl border ${
            isDarkMode 
              ? 'bg-slate-800/50 border-slate-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-bold flex items-center space-x-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <ShoppingBag size={20} className="text-blue-500" />
                <span>Articles commandés ({order.items.length})</span>
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div 
                    key={item.id}
                    className={`flex items-center space-x-4 p-4 rounded-xl border transition-all hover:shadow-md ${
                      isDarkMode 
                        ? 'border-slate-700 hover:bg-slate-700/30' 
                        : 'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 ${
                      isDarkMode ? 'bg-slate-700' : 'bg-gray-100'
                    }`}>
                      {item.product?.images && item.product.images.length > 0 ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Box size={32} className={isDarkMode ? 'text-slate-500' : 'text-gray-400'} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item.productName}
                      </h4>
                      <p className={`text-xs mb-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                        SKU: {item.productSku}
                      </p>
                      {item.variant && (
                        <div className="flex items-center space-x-3 text-xs">
                          {item.variant.size && (
                            <span className={`px-2 py-1 rounded ${
                              isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-700'
                            }`}>
                              Taille: {item.variant.size}
                            </span>
                          )}
                          {item.variant.color && (
                            <span className={`px-2 py-1 rounded flex items-center space-x-1 ${
                              isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-700'
                            }`}>
                              <span>{item.variant.color}</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                        Quantité: {item.quantity}
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                        Prix unitaire: {item.unitPrice.toFixed(2)} €
                      </p>
                      <p className={`text-lg font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item.totalPrice.toFixed(2)} €
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {order.notes && (
          <div className={`rounded-2xl border p-6 ${
            isDarkMode 
              ? 'bg-slate-800/50 border-slate-700' 
              : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-bold mb-3 flex items-center space-x-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <AlertCircle size={20} className="text-orange-500" />
              <span>Notes de commande</span>
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              {order.notes}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}