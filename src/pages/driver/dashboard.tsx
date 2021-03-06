import React, { useEffect, useState } from "react";
import GoogleMapReact from "google-map-react";
import { gql, useMutation, useSubscription } from "@apollo/client";
import { FULL_ORDER_FRAGMENT } from "../../fragment";
import { cookedOrder } from "../../__generated__/cookedOrder";
import { useHistory } from "react-router-dom";
import { takeOrder, takeOrderVariables } from "../../__generated__/takeOrder";

const COOCKED_ORDERS_SUBSCRIPTION = gql`
  subscription cookedOrder {
    cookedOrder {
      ...FullOrderParts
    }
  }
  ${FULL_ORDER_FRAGMENT}
`;

const TAKE_ORDER_MUTATION = gql`
  mutation takeOrder($input: TakeOrderInput!) {
    takeOrder(input: $input) {
      ok
      error
    }
  }
`;

interface ICoords {
  lat: number;
  lng: number;
};

// interface IDriverProps {
//   lat: number;
//   lng: number;
//   $hover?: any;
// }

//const Driver: React.FC<IDriverProps> = () => <div className="text-lg">π</div>;

export const DashBoard = () => {
  const [driverCoords, setDriverCoords] = useState<ICoords>({ lng: 0, lat: 0 });
  const [map, setMap] = useState<google.maps.Map>();
  const [maps, setMaps] = useState<any>();


  const history = useHistory();

 // @ts-ignore
 const onSucces = ({ coords: { latitude, longitude } }: Position) => {
  setDriverCoords({ lat: latitude, lng: longitude });
};
// @ts-ignore
const onError = (error: PositionError) => {
  //console.log(error);
};

  useEffect(() => {
    navigator.geolocation.watchPosition(onSucces, onError, {
      enableHighAccuracy: true
    });
  }, []);
  useEffect(() => {
    if (map /*&& maps*/) {
      map.panTo(new google.maps.LatLng(driverCoords.lat, driverCoords.lng));
      /* const geocoder = new google.maps.Geocoder();
            geocoder.geocode(
              {
                location: new google.maps.LatLng(driverCoords.lat, driverCoords.lng),
              },
              (results, status) => {
                console.log(status, results);
              }
            ); */
    } //gpsκ° λ³νλ©΄ μλμΌλ‘ μν κ°±μ 
  }, [driverCoords.lat, driverCoords.lng]);

  const onApiLoaded = ({ map, maps }: { map: any; maps: any }) => {
    map.panTo(new google.maps.LatLng(driverCoords.lat, driverCoords.lng));
    setMap(map);
    setMaps(maps);
  };
  //mapμ λ΄κ°μλ μ§λμ λ³΄, mapsλ google mapsμ κ°μ²΄

  const makeRoute = () => {
    if (map) {
      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer({
        polylineOptions: {
          strokeColor: "#000",
          strokeOpacity: 1,
          strokeWeight: 3,
        },
      });
      directionsRenderer.setMap(map);
      directionsService.route(
        {
          origin: {
            location: new google.maps.LatLng(
              driverCoords.lat,
              driverCoords.lng
            ),
          },
          destination: {
            location: new google.maps.LatLng(
              driverCoords.lat + 0.05,
              driverCoords.lng + 0.05
            ),
          },
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result) => {
          directionsRenderer.setDirections(result);
        }
      );
    }
  };
  const { data: cookedOrdersData } = useSubscription<cookedOrder>(
    COOCKED_ORDERS_SUBSCRIPTION
  );
  //console.log(cookedOrdersData)
  useEffect(() => {
    if (cookedOrdersData?.cookedOrder.id) {
      //console.log(cookedOrdersData)
      makeRoute();
    }
  }, [cookedOrdersData]);


  const onCompleted = (data: takeOrder) => {
    if (data.takeOrder.ok) {
      history.push(`/orders/${cookedOrdersData?.cookedOrder.id}`);
    }
  };

  const [takeOrderMutation] = useMutation<
    takeOrder,
    takeOrderVariables
  >(TAKE_ORDER_MUTATION, {
    onCompleted
  });

  const triggerMutation = (orderId: number) => {
    takeOrderMutation({
      variables: {
        input: {
          id: orderId
        }
      }
    })
  };

  return  (
    <div>
      <div
        className="overflow-hidden"
        style={{ width: window.innerWidth, height: "50vh" }}
      >
         <GoogleMapReact
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={onApiLoaded}
          defaultZoom={16}
          draggable={true}
          defaultCenter={{
            lat: 36.58,
            lng: 125.95
          }}
          bootstrapURLKeys={{ key: "AIzaSyDDOHNKASINHVtFzyVTtjs4OADOb5i48Eo" }}
        >
        </GoogleMapReact> 
        
      
        
      </div>
      <div className=" max-w-screen-sm mx-auto bg-white relative -top-10 shadow-lg py-8 px-5">
        {cookedOrdersData?.cookedOrder.restaurant ? (
          <>
            <h1 className="text-center  text-3xl font-medium">
              New Coocked Order
            </h1>
            <h1 className="text-center my-3 text-2xl font-medium">
              Pick it up soon @{" "}
              {cookedOrdersData?.cookedOrder.restaurant?.name}
            </h1>
            <button
              onClick={() =>
                triggerMutation(cookedOrdersData?.cookedOrder.id)
              }
              className="btn w-full  block  text-center mt-5"
            >
              Accept Challenge &rarr;
            </button>
          </>
        ) : (
          <h1 className="text-center  text-3xl font-medium">
            No orders yet...
          </h1>
        )}
      </div>
    </div>
  );
};

//google mapμ λ‘λλλ©΄ maps κ°μ²΄κ° μ΄λ―Έ windowμ μκΈ° λλ¬Έμ stateμ μλ mapκ°μ²΄λ νμνμ§ μλ€


/*
TravelModes
κΈΈμ°ΎκΈ°λ₯Ό κ³μ°ν  λ μ¬μ©ν  κ΅ν΅ μλ¨μ μ§μ ν©λλ€.
νκ΅­μμλ travelMode: google.maps.TravelMode.DRIVINGμ μ¬μ©ν  μ μκ³ , TRANSITλ§ μ¬μ©κ°λ₯. (νκ΅­ μΈμ λλΌμμλ λ€λ₯Έ λͺ¨λλ μ¬μ© κ°λ₯)
https://developers.google.com/maps/documentation/javascript/directions?hl=en
*/
