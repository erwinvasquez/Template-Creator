export type ShippingMethodKind =
  | "none"
  | "localMap"
  | "intercity"
  | "nationalFleet"
  | "nationalFleetDepartment"
  | "nationalCourier"
  | "pickup";

export interface ShippingMethodViewModel {
  id: string;
  kind: ShippingMethodKind;
  label: string;
  description?: string | null;
  priceDisplay?: string | null;
  estimatedDaysLabel?: string | null;
}

export interface PickupBranchViewModel {
  id: string;
  name: string;
  addressLabel: string;
  scheduleLabel?: string | null;
}

export interface FulfillmentPromiseViewModel {
  label: string;
  detail?: string | null;
}
