import { OrderBookData, Order } from '../types';

const ORDER_BOOK_LEVELS = 10; // Number of bids/asks to show

class OrderBookService {
  private orderBooks: Map<string, OrderBookData> = new Map();
  private listeners: Map<string, Set<(data: OrderBookData) => void>> = new Map();
  private intervalId: number | null = null;

  constructor() {
    this.init();
  }

  public init(): void {
    if (this.intervalId) return;
    this.intervalId = window.setInterval(() => this.simulateUpdates(), 1500);
  }

  private generateInitialData(symbol: string, basePrice: number): OrderBookData {
    const bids: Order[] = [];
    const asks: Order[] = [];
    let currentBid = basePrice * 0.999;
    let currentAsk = basePrice * 1.001;
    const spread = basePrice * 0.0001;

    for (let i = 0; i < ORDER_BOOK_LEVELS; i++) {
      const bidQuantity = Math.random() * 5 + 0.1;
      bids.push({
        price: parseFloat(currentBid.toFixed(4)),
        quantity: parseFloat(bidQuantity.toFixed(4)),
        total: parseFloat((currentBid * bidQuantity).toFixed(2)),
      });
      currentBid -= spread * (Math.random() * 2 + 0.5);

      const askQuantity = Math.random() * 5 + 0.1;
      asks.push({
        price: parseFloat(currentAsk.toFixed(4)),
        quantity: parseFloat(askQuantity.toFixed(4)),
        total: parseFloat((currentAsk * askQuantity).toFixed(2)),
      });
      currentAsk += spread * (Math.random() * 2 + 0.5);
    }
    
    return { bids, asks };
  }
  
  private simulateUpdates(): void {
      this.listeners.forEach((symbolListeners, symbol) => {
          if (!this.orderBooks.has(symbol)) return;
          
          const currentData = this.orderBooks.get(symbol)!;
          
          const updateSide = (orders: Order[]): Order[] => {
              return orders.map(order => {
                  if (Math.random() > 0.7) { // 30% chance to update a level
                      const quantityChange = (Math.random() - 0.5) * 0.5;
                      const newQuantity = Math.max(0.01, order.quantity + quantityChange);
                      return {
                          ...order,
                          quantity: parseFloat(newQuantity.toFixed(4)),
                          total: parseFloat((order.price * newQuantity).toFixed(2)),
                      };
                  }
                  return order;
              });
          };

          const updatedData = {
              bids: updateSide(currentData.bids),
              asks: updateSide(currentData.asks),
          };
          
          this.orderBooks.set(symbol, updatedData);
          
          symbolListeners.forEach(callback => callback(updatedData));
      });
  }

  public subscribe(symbol: string, basePrice: number, callback: (data: OrderBookData) => void) {
    if (!this.listeners.has(symbol)) {
      this.listeners.set(symbol, new Set());
    }
    
    if (!this.orderBooks.has(symbol)) {
        const initialData = this.generateInitialData(symbol, basePrice);
        this.orderBooks.set(symbol, initialData);
    }

    this.listeners.get(symbol)!.add(callback);
    callback(this.orderBooks.get(symbol)!);
  }

  public unsubscribe(symbol: string, callback: (data: OrderBookData) => void) {
    if (this.listeners.has(symbol)) {
      this.listeners.get(symbol)!.delete(callback);
      if (this.listeners.get(symbol)!.size === 0) {
          this.listeners.delete(symbol);
          this.orderBooks.delete(symbol);
      }
    }
  }
}

export const orderBookService = new OrderBookService();
