'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Order } from '@/types/order.type';
import { OrderStatus, PaymentStatus } from '@/generated/prisma';
import { X, Check } from 'lucide-react';

interface OrderStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onConfirm: (orderId: string, status: OrderStatus, paymentStatus: PaymentStatus) => void;
  isLoading?: boolean;
}

const statusOptions = Object.entries({
  [OrderStatus.PENDING]: 'En attente',
  [OrderStatus.CONFIRMED]: 'Confirmée',
  [OrderStatus.PROCESSING]: 'En traitement',
  [OrderStatus.SHIPPED]: 'Expédiée',
  [OrderStatus.DELIVERED]: 'Livrée',
  [OrderStatus.CANCELLED]: 'Annulée',
  [OrderStatus.REFUNDED]: 'Remboursée',
}).map(([value, label]) => ({ value: value as OrderStatus, label }));

const paymentStatusOptions = Object.entries({
  [PaymentStatus.PENDING]: 'En attente',
  [PaymentStatus.COMPLETED]: 'Complétée',
  [PaymentStatus.FAILED]: 'Échouée',
  [PaymentStatus.REFUNDED]: 'Remboursée',
}).map(([value, label]) => ({ value: value as PaymentStatus, label }));

export default function OrderStatusModal({
  isOpen,
  onClose,
  order,
  onConfirm,
  isLoading = false,
}: OrderStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(order?.status || null);
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<PaymentStatus | null>(
    order?.paymentStatus || null
  );

  React.useEffect(() => {
    if (order) {
      setSelectedStatus(order.status);
      setSelectedPaymentStatus(order.paymentStatus);
    }
  }, [order, isOpen]);

  const handleConfirm = () => {
    if (selectedStatus && selectedPaymentStatus && order) {
      onConfirm(order.id, selectedStatus, selectedPaymentStatus);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Mettre à jour la commande
                </h2>
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {order && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    Commande: <span className="font-semibold text-gray-900">{order.orderNumber}</span>
                  </div>
                )}

                {/* Order Status Section */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Statut de la commande
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {statusOptions.map((option) => (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedStatus(option.value)}
                        disabled={isLoading}
                        className={`p-3 rounded-lg text-sm font-medium transition-all ${
                          selectedStatus === option.value
                            ? 'bg-blue-100 text-blue-900 border-2 border-blue-500 shadow-md'
                            : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                        } disabled:opacity-50`}
                      >
                        {selectedStatus === option.value && (
                          <Check className="w-3 h-3 inline mr-1" />
                        )}
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Payment Status Section */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Statut du paiement
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {paymentStatusOptions.map((option) => (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedPaymentStatus(option.value)}
                        disabled={isLoading}
                        className={`p-3 rounded-lg text-sm font-medium transition-all ${
                          selectedPaymentStatus === option.value
                            ? 'bg-green-100 text-green-900 border-2 border-green-500 shadow-md'
                            : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                        } disabled:opacity-50`}
                      >
                        {selectedPaymentStatus === option.value && (
                          <Check className="w-3 h-3 inline mr-1" />
                        )}
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50"
              >
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading || !selectedStatus || !selectedPaymentStatus}
                  className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Confirmer
                    </>
                  )}
                </button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}