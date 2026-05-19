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
  orderNumber: number;
  patientName: string;
  patientNumber: string;
  clientId: number;
  orderDate: string;
  askedDeliveryDate: string;
  stateId: number;
  state: OrderState;
}