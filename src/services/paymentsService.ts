import { api } from './api';

export type Payment = {
  id: number;
  reservationId: number;
  paymentDate: string;
  paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'BANK_TRANSFER';
  amount: number;
  status: 'PENDING' | 'PAID' | 'CANCELED';
};

export class PaymentsService {
  /**
   * Get paginated list of payments
   */
  static async getPayments(page: number = 0, size: number = 20): Promise<any> {
    const response = await api.get(`/payments?page=${page}&size=${size}`);
    return response.data;
  }

  /**
   * Get payment by id
   */
  static async getPaymentById(id: number): Promise<any> {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  }

  /**
   * Create new payment
   */
  static async createPayment(paymentData: Partial<Payment>): Promise<any> {
    const response = await api.post('/payments', paymentData);
    return response.data;
  }

  /**
   * Update payment data (full update)
   */
  static async updatePayment(id: number, updateData: Partial<Payment>): Promise<any> {
    const response = await api.put(`/payments/${id}`, updateData);
    return response.data;
  }

  /**
   * Update payment status only
   */
  static async updatePaymentStatus(id: number, status: Payment['status']): Promise<any> {
    const response = await api.patch(`/payments/${id}/status?status=${status}`);
    return response.data;
  }

  /**
   * Delete payment
   */
  static async deletePayment(id: number): Promise<void> {
    await api.delete(`/payments/${id}`);
  }
}

export const paymentsService = new PaymentsService();
