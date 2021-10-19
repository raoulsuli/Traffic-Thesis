import './App.css';
import React, {useEffect, useState} from 'react';
import Web3 from 'web3';
import TrafficEvents from './contracts/TrafficEvents.json';
import Map from './components/map';

function App() {
  const [address, setAddress] = useState('');
  const [contract, setContract] = useState(null);
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
        const ev = await contract.methods.getEvent(i).call();
        events.push({
          id: ev.id,
          date: ev.date,
          eventType: ev.eventType,
          latitude: parseFloat(ev.latitude),
          longitude: parseFloat(ev.longitude),
          owner: ev.owner,
          speed: ev.speed
        });
      }

      setAddress(accounts[0]);
      setContract(contract);
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
    <>
    {events && <Map events={events} account={address} contract={contract} refreshEvents={loadWeb3}/>}
    </>
  );
}

export default App;
