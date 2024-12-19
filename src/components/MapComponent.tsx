import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

const MapComponent = () => {
  const [apiData, setApiData] = useState<any>(null);
  const [states, setStates] = useState<string[]>(['Johor', 'Selangor', 'Kedah']); // Add your state options
  const [districts, setDistricts] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const mapRef = useRef<any>(null);
  const mapInstance = useRef<any>(null);

  // Initialize the map only once
  useEffect(() => {
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([1.5, 103.0], 100);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance.current);
    }
  }, []);



  // Fetch and render polygons when state or district changes
  useEffect(() => {
    const fetchPolygons = async () => {
      let apiUrl = 'http://192.168.99.139:6699/sli/get_geomap?type=all';
      if (selectedState) {
        apiUrl = `http://192.168.99.139:6699/sli/get_geomap?level=state&name=${selectedState}`;
      }
      if (selectedDistrict) {
        apiUrl = `http://192.168.99.139:6699/sli/get_geomap?level=district&name=${selectedDistrict}`;
      }

      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        setApiData(data);
        console.log('Fetched API Data:', data);
      } catch (error) {
        console.error('Error fetching API data:', error);
      }
    };

    fetchPolygons();
  }, [selectedState, selectedDistrict]);

  // Render polygons on the map
  useEffect(() => {
    if (apiData && mapInstance.current) {
      const map = mapInstance.current;

      // Clear existing polygons
      map.eachLayer((layer: any) => {
        if (layer instanceof L.Polygon) {
          map.removeLayer(layer);
        }
      });

      // Check if there are features to render
      if (apiData.features && apiData.features.length > 0) {
        const polygons: L.Polygon[] = [];

        apiData.features.forEach((feature: any) => {
          if (feature.geometry && feature.geometry.coordinates) {
            try {
              // Handle GeoJSON MultiPolygon or Polygon
              const coordinates = feature.geometry.coordinates;

              const latLngs =
                feature.geometry.type === 'Polygon'
                  ? coordinates[0].map((coord: any) => [coord[1], coord[0]]) // [longitude, latitude] -> [latitude, longitude]
                  : feature.geometry.type === 'MultiPolygon'
                    ? coordinates.map((polygon: any) =>
                      polygon[0].map((coord: any) => [coord[1], coord[0]])
                    )
                    : [];

              // Create and add the polygon
              const polygon = L.polygon(latLngs, {
                color: 'blue',
                weight: 2,
                fillColor: 'blue',
                fillOpacity: 0.4,
              })
                .addTo(map)
                .bindPopup(`District: ${feature.properties.code_district}`);
              polygons.push(polygon);
            } catch (error) {
              console.error('Error rendering polygon:', error);
            }
          }
        });

        // Adjust map bounds to fit all polygons
        if (polygons.length > 0) {
          const bounds = L.featureGroup(polygons).getBounds();
          map.fitBounds(bounds);
        }
      } else {
        console.warn('No features available in the API data');
      }
    }
  }, [apiData]);


  // Fetch districts when a state is selected
  useEffect(() => {
    if (selectedState) {
      const fetchDistricts = async () => {
        const response = await fetch(`http://192.168.99.139:6699/sli/get_geomap?level=district&state=${selectedState}`);
        const data = await response.json();
        const districtNames = data.features.map((feature: any) => feature.properties.code_district);
        setDistricts(districtNames);
      };

      fetchDistricts();
    } else {
      setDistricts([]);
    }
  }, [selectedState]);

  return (
    <div>
      <div>
        <label>
          State:
          <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)}>
            <option value="">Select State</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </label>

        <label>
          District:
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            disabled={!selectedState}
          >
            <option value="">Select District</option>
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div id="map" ref={mapRef} style={{ height: '680px', width: '100%' }} />
    </div>
  );
};

export default MapComponent;
