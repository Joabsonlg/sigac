import { api } from './api';
import { 
  Promotion, 
  PromotionCreateData, 
  PromotionUpdateData
} from '../types';

export class PromotionsService {
  
  /**
   * Get paginated list of promotions
   */
  static async getPromotions(
    page: number = 0, 
    size: number = 20, 
    status?: string
  ): Promise<any> {
    let url = `/api/promotions?page=${page}&size=${size}`;
    if (status) {
      url += `&status=${status}`;
    }
    
    const response = await api.get(url);
    return response.data;
  }

  /**
   * Get promotion by code
   */
  static async getPromotionByCode(code: number): Promise<any> {
    const response = await api.get(`/api/promotions/${code}`);
    return response.data;
  }

  /**
   * Create new promotion
   */
  static async createPromotion(promotionData: PromotionCreateData): Promise<any> {
    const response = await api.post('/api/promotions', promotionData);
    return response.data;
  }

  /**
   * Update promotion data
   */
  static async updatePromotion(code: number, updateData: PromotionUpdateData): Promise<any> {
    const response = await api.put(`/api/promotions/${code}`, updateData);
    return response.data;
  }

  /**
   * Delete promotion
   */
  static async deletePromotion(code: number): Promise<void> {
    await api.delete(`/api/promotions/${code}`);
  }

  /**
   * Activate promotion
   */
  static async activatePromotion(code: number): Promise<any> {
    const response = await api.patch(`/api/promotions/${code}/activate`);
    return response.data;
  }

  /**
   * Deactivate promotion
   */
  static async deactivatePromotion(code: number): Promise<any> {
    const response = await api.patch(`/api/promotions/${code}/deactivate`);
    return response.data;
  }

  /**
   * Get active promotions
   */
  static async getActivePromotions(): Promise<any> {
    const response = await api.get('/api/promotions/active');
    return response.data;
  }

  /**
   * Get promotions by status
   */
  static async getPromotionsByStatus(status: string): Promise<any> {
    const response = await api.get(`/api/promotions/status/${status}`);
    return response.data;
  }
}

export const promotionsService = new PromotionsService();
