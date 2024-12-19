import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/react';
import MapComponent from '../../components/MapComponent'; // Import your MapComponent


const MapPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Map</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {/* Add the MapComponent here */}
        <MapComponent />
      </IonContent>
    </IonPage>
  );
};

export default MapPage;
