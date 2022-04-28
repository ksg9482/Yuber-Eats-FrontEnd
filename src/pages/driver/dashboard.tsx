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

//const Driver: React.FC<IDriverProps> = () => <div className="text-lg">🚖</div>;

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
    } //gps값 변하면 자동으로 상태 갱신
  }, [driverCoords.lat, driverCoords.lng]);

  const onApiLoaded = ({ map, maps }: { map: any; maps: any }) => {
    map.panTo(new google.maps.LatLng(driverCoords.lat, driverCoords.lng));
    setMap(map);
    setMaps(maps);
  };
  //map은 내가있는 지도정보, maps는 google maps의 객체

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

//google map은 로드되면 maps 객체가 이미 window에 있기 때문에 state에 있는 map객체는 필요하지 않다


/*
TravelModes
길찾기를 계산할 때 사용할 교통 수단을 지정합니다.
한국에서는 travelMode: google.maps.TravelMode.DRIVING을 사용할 수 없고, TRANSIT만 사용가능. (한국 외의 나라에서는 다른 모드도 사용 가능)
https://developers.google.com/maps/documentation/javascript/directions?hl=en
*/
