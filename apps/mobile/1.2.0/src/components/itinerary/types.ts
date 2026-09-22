import { Address } from "@/components/modals/LocationPickerModal";

export type HeaderType = "header1" | "header2" | "header3";

export interface HeaderBlock {
  id: string;
  type: HeaderType;
  value: string;
}
export interface TextBlock {
  id: string;
  type: "text";
  value: string;
}
export interface LocationBlockData {
  id: string;
  type: "location";
  latitude: number;
  longitude: number;
  locationName: string;
  address: Address;
}
export interface ChecklistBlock {
  id: string;
  type: "toggle";
  value: string;
  checked: boolean;
}
export interface DividerBlock {
  id: string;
  type: "divider";
}
export type ItineraryBlock = HeaderBlock | TextBlock | LocationBlockData | ChecklistBlock | DividerBlock;
