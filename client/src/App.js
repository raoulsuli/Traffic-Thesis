import "./App.css";
import React, { useEffect, useState } from "react";
import Web3 from "web3";
import TrafficEvents from "./contracts/TrafficEvents.json";
import Map from "./components/map";
import utils from "./constants/utils";

function App() {
  const [address, setAddress] = useState("");
  const [contract, setContract] = useState(null);
  const [events, setEvents] = useState(null);
  const [requests, setRequests] = useState([]);
  const transactions = [];
  const delete_transactions = [];

  async function loadWeb3() {
    try {
      window.web3 = new Web3(window.ethereum);

      const networkId = await window.web3.eth.net.getId();
      const deployedNetwork = TrafficEvents.networks[networkId];
      const contract = new window.web3.eth.Contract(
        TrafficEvents.abi,
        deployedNetwork && deployedNetwork.address
      );

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const eventCount = await contract.methods.eventCount().call();
      const events = [];

      for (let i = 0; i < eventCount; i++) {
        const ev = await contract.methods.getEvent(i).call();

        let date = new Date(ev.date);
        date = new Date(date.getTime() + utils.EXPIRATION_HOURS * 3600000);

        if (new Date() >= date && ev.owner.toLowerCase() === address)
          deleteEvent(ev);
        else {
          events.push({
            id: ev.id,
            date: ev.date,
            eventType: ev.eventType,
            latitude: parseFloat(ev.latitude),
            longitude: parseFloat(ev.longitude),
            owner: ev.owner,
            speed: ev.speed,
          });
        }
      }

      setContract(contract);
      setAddress(accounts[0]);
      setEvents(events);
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  }

  async function updateBlockchain(request) {
    if (contract) {
      const accepts = request.answered.filter((r) => r.answer === true);
      const refuses = request.answered.filter((r) => r.answer === false);
      if (accepts.length >= request.answered.length / 2 + 1)
        addToBlockchain(request, 1);
      else if (
        accepts.length >= refuses.length - utils.REPUTATION_ERROR_THRESHOLD &&
        request.reputation >= 5
      ) {
        addToBlockchain(request, 0);
      } else updateDatabase(request, -1);
    }
  }

  async function addToBlockchain(request, reputation) {
    if (!transactions.includes(request._id)) {
      transactions.push(request._id);
      await contract.methods
        .createEvent(
          request.eventType,
          request.date,
          request.longitude.toString(),
          request.latitude.toString(),
          request.speed
        )
        .send({ from: request.address })
        .then(() => {
          loadWeb3();
          updateDatabase(request, reputation);
        })
        .catch(() => updateDatabase(request, -1));
    }
  }

  async function updateDatabase(request, sign) {
    if (!request.already_in && sign !== 0) {
      await fetch(`${utils.API_PATH}/location`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: request.address, reputation: sign }),
      });
    }

    await fetch(`${utils.API_PATH}/request`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: request._id,
        status: sign !== -1 ? utils.ACCEPTED : utils.REFUSED,
      }),
    });
  }

  async function deleteEvent(event) {
    if (!delete_transactions.includes(event.id)) {
      delete_transactions.push(event.id);
      contract &&
        (await contract.methods
          .deleteEvent(event.id)
          .send({ from: address })
          .then(async () => {
            await fetch(`${utils.API_PATH}/deleteEvent`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                address: event.owner,
                longitude: event.longitude,
                latitude: event.latitude,
                eventType: event.eventType,
                date: event.date,
              }),
            }).then(() => getRequests());
          })
          .catch(() => {}));
    }
  }

  async function getRequests() {
    loadWeb3();
    await fetch(`${utils.API_PATH}/request`)
      .then((data) => data.json())
      .then((data) => {
        setRequests(data);
        data.forEach(async (d) => {
          let date = new Date(d.date);
          date = new Date(date.getTime() + utils.REQUESTS_ADD_TIME * 60000);
          if (
            new Date() >= date &&
            d.status === utils.PENDING &&
            d.address === address
          ) {
            updateBlockchain(d);
          }
        });
      });
  }

  useEffect(() => {
    getRequests();
    const interval = setInterval(
      () => getRequests(),
      utils.REQUESTS_REFRESH_TIME
    );
    return () => clearInterval(interval);
  }, [address]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {events && (
        <Map
          events={events}
          requests={requests}
          account={address}
          contract={contract}
          refresh={getRequests}
        />
      )}
    </>
  );
}

export default App;
