import React from "react";
import { useMapEvents } from "react-leaflet";

interface MapComponentProps {
  setLatClicked: (lat: number) => void;
  setLngClicked: (lng: number) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({
  setLatClicked,
  setLngClicked,
}) => {
  const map = useMapEvents({
    click: (e) => {
      console.log(e.latlng.lat);
      console.log(e.latlng.lng);
      setLatClicked(e.latlng.lat);
      setLngClicked(e.latlng.lng);
    },
  });
  return null;
};

export default MapComponent;
