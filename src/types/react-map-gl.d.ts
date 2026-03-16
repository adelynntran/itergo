declare module "react-map-gl/mapbox" {
  import { ComponentType, ReactNode, Ref } from "react";

  export interface ViewState {
    latitude: number;
    longitude: number;
    zoom: number;
    bearing?: number;
    pitch?: number;
  }

  export interface MapProps {
    ref?: Ref<any>;
    initialViewState?: ViewState;
    style?: React.CSSProperties;
    mapStyle?: string;
    mapboxAccessToken?: string;
    onClick?: (e: any) => void;
    children?: ReactNode;
    [key: string]: any;
  }

  export interface MarkerProps {
    latitude: number;
    longitude: number;
    anchor?: string;
    onClick?: (e: { originalEvent: MouseEvent }) => void;
    children?: ReactNode;
    [key: string]: any;
  }

  export interface NavigationControlProps {
    position?: string;
    [key: string]: any;
  }

  const Map: ComponentType<MapProps>;
  export const Marker: ComponentType<MarkerProps>;
  export const NavigationControl: ComponentType<NavigationControlProps>;
  export default Map;
}
