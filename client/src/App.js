import { useState, useEffect } from "react";
import Web3 from "web3";
import TrafficEvents from "./contracts/TrafficEvents.json";
import { Map } from "./components/Map";

const App = () => {
  const [address, setAddress] = useState(null);
  const [contract, setContract] = useState(null);

  const loadWeb3 = async () => {
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

      setContract(contract);
      setAddress(accounts[0]);
    } catch (error) {
      alert("Failed to load web3, accounts, or contract. Check console.");
      console.error(error);
    }
  };

  useEffect(() => loadWeb3(), []);

  return <>{address && <Map address={address} contract={contract} />}</>;
};

export default App;
