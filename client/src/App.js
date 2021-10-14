import './App.css';
import React, {useEffect, useState} from 'react';
import Web3 from 'web3';
import TrafficEvents from './contracts/TrafficEvents.json';
import ReactMapGL, {GeolocateControl, Marker} from 'react-map-gl';
import { BsCircleFill } from "react-icons/bs";

function App() {
  const [address, setAddress] = useState('');
  const [contract, setContract] = useState(null);
  const [eventCount, setEventCount] = useState(0);
  const [events, setEvents] = useState(null);

  async function loadWeb3() {
    try {
      window.web3 = new Web3(window.ethereum);

      const networkId = await window.web3.eth.net.getId();
      const deployedNetwork = TrafficEvents.networks[networkId];
      const contract = new window.web3.eth.Contract(TrafficEvents.abi, deployedNetwork && deployedNetwork.address);

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const eventCount = await contract.methods.eventCount().call();
      const events = [];

      for (let i = 0; i < eventCount; i++) {
        const ev = await contract.methods.getEvent(i);
        events.push(ev);
      }

      setAddress(accounts[0]);
      setContract(contract);
      setEventCount(eventCount);
      setEvents(events);
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  }

  useEffect(() => {
    loadWeb3();
  }, []);

  return (
    <Map data={[{name: 'a', longitude: 26.1016, latitude: 44.4356}]}></Map>
  );
}

function Map(props) {
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    latitude: 44.4356,
    longitude: 26.1016
  });

  const markers = React.useMemo(() => props.data.map(
    marker => (
      <Marker key={marker.name} longitude={marker.longitude} latitude={marker.latitude} >
        <BsCircleFill style={{color: 'red'}}/>
        {/* https://visgl.github.io/react-map-gl/docs/api-reference/popup */}
      </Marker>
    )
  ), [props.data]);

  useEffect(() => {
    window.addEventListener('resize', () => setViewport({width: window.innerWidth, height: window.innerHeight}));
    return () => window.removeEventListener('resize', () => setViewport({width: window.innerWidth, height: window.innerHeight}));
  }, []);

  return (
    <ReactMapGL
    {...viewport}
    mapboxApiAccessToken="pk.eyJ1IjoicmFvdWxzdWxpIiwiYSI6ImNrdXFvdG1ocDE0YmUyb3FyZTJ3YnFvaWkifQ.ggE3-QrZyztX66PsodWWSA"
    onViewportChange={(viewport) => setViewport(viewport)}
    >
      <GeolocateControl
      style={{right: 10, top: 10}}
      positionOptions={{enableHighAccuracy: true}}
      trackUserLocation={true}
      auto/>
      {markers}
    </ReactMapGL>
  );
}

export default App;
