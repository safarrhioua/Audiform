export type OrderStatus =
  | 'nieuw'
  | 'ontvangen'
  | 'in productie'
  | 'gereed'
  | 'verzonden'
  | 'afgeleverd'  
  | 'geannuleerd'

export interface OrderState {
  id: number;
  stateName: string;
}

export interface Order {
  id: number;
  orderNumber: string
  patientName: string | null;
  patientNumber: string
  orderDate: string;
  deliveryDate: string;
  state: OrderState;
}