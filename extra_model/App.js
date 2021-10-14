import React, { Component } from "react";
import TrafficEvents from "./contracts/TrafficEvents.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { web3: null, accounts: null, contract: null, eventCount: 0, events: null };

  componentDidMount = async () => {
    try {
      const web3 = await getWeb3();

      const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});

      const networkId = await web3.eth.net.getId();
      const deployedNetwork = TrafficEvents.networks[networkId];
      const instance = new web3.eth.Contract(
        TrafficEvents.abi,
        deployedNetwork && deployedNetwork.address,
      );
      const eventCount = await instance.methods.eventCount().call();
      const events = [];
      for (let i = 0; i < eventCount; i++) {
        const ev = await instance.methods.getEvent(i);
        events.push(ev);
      }

      this.setState({ web3, accounts, contract: instance, eventCount, events });
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };



  createEvent = async () => {
    // const eventType = $('#newEventType').val();
    //     navigator.geolocation.getCurrentPosition((position) => { // coords.speed
    //         fetch(`https://api.opencagedata.com/geocode/v1/json?q=${position.coords.latitude}+${position.coords.longitude}&key=0f3f68ec31b64ba38034b2e9339ef280`)
    //         .then(response => response.json())
    //         .then(async(resp) => {
    //             await App.contract.createEvent(eventType, getCurrentDate(), resp.results[0].formatted, position.coords.speed * 3.6, {from: App.accounts[0]});
    //             window.location.reload();
    //         });
    //     });
  };

  renderEvents(event, index) {
    return (
      <tr key={index}>
        <td>{event.type}</td>
        <td>{event.location}</td>
        <td>{event.date}</td>
        <td>{event.speed} km/h</td>
      </tr>
    );
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <nav className="navbar navbar-dark bg-dark py-0 px-3">
          <div className="navbar-brand">Traffic Events</div>
          <span style={{color: 'white'}}>{this.state.accounts[0]}</span>
        </nav>

        <table className="table table-striped text-center">
          <thead className="table-secondary">
            <tr>
              <th scope="col">#</th>
              <th scope="col">Event Type</th>
              <th scope="col">Location</th>
              <th scope="col">Date</th>
              <th scope="col">Speed</th>
              <th><i className="bi bi-plus-circle" style={{fontSize: '18px', cursor: 'pointer'}} data-bs-toggle="modal" data-bs-target="#createEventModal"></i></th>
            </tr>
          </thead>
          <tbody>
            {this.state.events.map(this.renderEvents)}
          </tbody>
        </table>
        <div className="modal fade" id="createEventModal" tabIndex="-1" aria-labelledby="createEventModalLabel" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="createEventModalLabel">Add new event</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <div className="container-fluid">
                  <div className="row d-flex justify-content-center">
                    <div className="col-8">
                      <form>
                        <label htmlFor="newEventType" className="mb-1">Select Event Type</label>
                        <select id="newEventType" name="newEventType" className="form-select" aria-label="Select Event Type" required>
                          <option value="Accident">Accident</option>
                          <option value="Road under construction">Road under construction</option>
                        </select>
                        <input type="submit" hidden=""/>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer d-flex justify-content-center">
                <button type="button" className="btn btn-danger" data-bs-dismiss="modal">Close</button>
                <button type="button" className="btn btn-success">Save changes</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function getCurrentDate() {
  const today = new Date();
  const formatDate = (item) => {
      return (item <= 9) ? `0${item}` : item;
  }

  return formatDate(today.getDay()) + '/' + formatDate(today.getMonth()) + '/' +
  today.getFullYear() + ', ' + formatDate(today.getHours()) + ':' +
  formatDate(today.getMinutes()) + ':' + formatDate(today.getSeconds());
}

export default App;
