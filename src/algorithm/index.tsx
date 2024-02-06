import React, { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Station {
  _id: string;
  name: string;
  lat: number;
  long: number;
  connection: string[];
}

interface FareCalculatorProps {
  startStation: Station;
  endStation: Station;
  stationParameter: string;
}

const FareCalculator: FC<FareCalculatorProps> = ({
  startStation,
  endStation,
  stationParameter,
}) => {
  const [station, setStation] = useState<Station[] | null>(null);
  const [stationPage, setStationPage] = useState<Station | null>(null);
  const api = process.env.REACT_APP_API_KEY;
  const navigate = useNavigate();

  // function addConnection(station: Station, connectedStationId: string): void {
  //   station.connection.push(connectedStationId);
  // }

  function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  function findPath(
    start: Station,
    end: Station,
    stations: Station[]
  ): { stations: Station[]; distance: number } | null {
    const visited: Set<string> = new Set();
    const queue: { station: Station; path: Station[] }[] = [
      { station: start, path: [] },
    ];

    while (queue.length > 0) {
      const { station, path } = queue.shift()!;
      visited.add(station._id);

      if (station._id === end._id) {
        return {
          stations: path.concat(station),
          distance: calculatePathDistance(path.concat(station)),
        };
      }

      for (const connectionId of station.connection) {
        const connection = stations.find((s) => s._id === connectionId);
        if (connection && !visited.has(connection._id)) {
          queue.push({ station: connection, path: path.concat(station) });
        }
      }
    }

    return null;
  }

  function calculatePathDistance(path: Station[]): number {
    let totalDistance = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const { lat: lat1, long: lon1 } = path[i];
      const { lat: lat2, long: lon2 } = path[i + 1];
      totalDistance += calculateDistance(lat1, lon1, lat2, lon2);
    }
    return totalDistance;
  }

  const fetchData = async () => {
    const response = await fetch(`${api}/api/stations`, {
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();
    if (response.ok) {
      setStation(data);
    } else {
      throw new Error("Failed to fetch data");
    }
  };

  const checkConnection = () => {
    if (station) {
      if (station.length > 0) {
        const matchedStation = station.find(
          (station) => station.name === stationParameter
        );
        if (matchedStation) {
          setStationPage(matchedStation);
        } else {
          navigate("/");
        }
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (station) {
      checkConnection();
    }
  }, [station]);

  if (station && stationPage) {
    const startStation = stationPage;
    const endStation = station[2];

    const result = findPath(startStation, endStation, station);
    if (result) {
      console.log("Path found:");
      result.stations.forEach((station) => console.log(station.name));
      console.log("Total distance:", result.distance.toFixed(2), "meters");
    } else {
      console.log("No path found between the stations.");
    }
  }

  return null;
};

export default FareCalculator;
