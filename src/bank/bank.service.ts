import { Injectable } from '@nestjs/common';

@Injectable()
export class BankService {
  async authorizePayment() {
    const random = Math.random();

    await this.simulateDelay();

    if (random < 0.85) {
      return {
        success: true,
        authorizationCode:
          'AUTH_' + Date.now(),
      };
    }

    if (random < 0.93) {
      return {
        success: false,
        errorCode: 'INSUFFICIENT_FUNDS',
      };
    }

    if (random < 0.95) {
      return {
        success: false,
        errorCode: 'INVALID_CARD',
      };
    }

    if (random < 0.97) {
      return {
        success: false,
        errorCode: 'CARD_EXPIRED',
      };
    }

    if (random < 0.99) {
      return {
        success: false,
        errorCode: 'NETWORK_TIMEOUT',
      };
    }

    return {
      success: false,
      errorCode: 'RATE_LIMIT_EXCEEDED',
    };
  }

  private async simulateDelay() {
    const delay =
      Math.floor(Math.random() * 3000) + 100;

    return new Promise((resolve) =>
      setTimeout(resolve, delay),
    );
  }
}