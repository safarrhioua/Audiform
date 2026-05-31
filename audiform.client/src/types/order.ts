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
  //stateName: string;
}

export interface Order {
  id: number;
  patient_name: string;
  patient_number: string;
  order_date: string;
  delivery_date: string;
  status: string;
}