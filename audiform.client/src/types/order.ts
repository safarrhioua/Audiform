export type OrderStatus =
  | 'nieuw'
  | 'ontvangen'
  | 'in productie'
  | 'gereed'
  | 'verzonden'
  | 'afgeleverd'  
  | 'geannuleerd'
  | 'traditioneel'
  | '3D print'
  | 'afgewezen'


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