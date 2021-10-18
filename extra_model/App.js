  createEvent = async () => {
    const eventType = $('#newEventType').val();
        navigator.geolocation.getCurrentPosition((position) => { // coords.speed
            fetch(`https://api.opencagedata.com/geocode/v1/json?q=${position.coords.latitude}+${position.coords.longitude}&key=0f3f68ec31b64ba38034b2e9339ef280`)
            .then(response => response.json())
            .then(async(resp) => {
                await App.contract.createEvent(eventType, getCurrentDate(), resp.results[0].formatted, position.coords.speed * 3.6, {from: App.accounts[0]});
                window.location.reload();
            });
        });
  };

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
