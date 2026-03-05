/** 네이버 지도 API v3 전역 타입 선언 */
declare namespace naver.maps {
  class LatLng {
    constructor(lat: number, lng: number);
  }

  class Point {
    constructor(x: number, y: number);
  }

  class Size {
    constructor(width: number, height: number);
  }

  interface MapOptions {
    center?: LatLng;
    zoom?: number;
    scrollWheel?: boolean;
    draggable?: boolean;
    zoomControl?: boolean;
  }

  class Map {
    constructor(element: string | HTMLElement, options?: MapOptions);
    setCenter(center: LatLng): void;
  }

  interface MarkerOptions {
    position: LatLng;
    map?: Map;
    icon?: string | object;
  }

  class Marker {
    constructor(options: MarkerOptions);
    setMap(map: Map | null): void;
    getPosition(): LatLng;
  }

  class OverlayView {
    getPanes(): { overlayLayer: HTMLElement };
    getProjection(): {
      fromCoordToOffset(coord: LatLng): Point;
    };
    getMap(): Map | null;
    getPosition(): LatLng;
  }

  class Event {
    static addListener(
      target: object,
      eventName: string,
      listener: () => void
    ): void;
  }
}

declare global {
  interface Window {
    naver: typeof naver;
    navermap_authFailure?: () => void;
  }
}

export {};
