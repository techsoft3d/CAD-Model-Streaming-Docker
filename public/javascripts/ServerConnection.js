class ServerConnection {
  constructor(endpoint) {
    this._endpoint = endpoint;
  }

  connect() {
    var _this = this;
    var request = new XMLHttpRequest();
    request.open("POST", this._endpoint + "/api/spawn");
    request.overrideMimeType("application/json");
    request.setRequestHeader("Content-Type", "application/json");
    request.timeout = 60000;

    var promise = new Promise(function (resolve, reject) {
      request.onreadystatechange = function () {
        if (request.readyState == 4) {
          if (request.status == 200) {
            resolve(_this.parseServerSuccessResponse(request.responseText));
          } else {
            reject(alert("Couldn't Connect"));
          }
        }
      };

      request.send('{"class":"csr_session","params":{}}');
    });

    return promise;
  }

  parseServerSuccessResponse(text) {
    this._jsonResponse = JSON.parse(text);
    const rawUri = this._jsonResponse.endpoints["ws"];

    console.log("Raw WS URI from spawn response:", rawUri);

    // Extract port from "ws://127.0.0.1:11000"
    const match = rawUri.match(/^ws:\/\/[^:]+:(\d+)/);
    if (match) {
      const port = match[1];
      const host = window.location.hostname;

      // ✅ Use your reverse proxy to connect
      this._endpointuri = `wss://${host}/wsproxy/${port}`;
      console.log("Rewritten endpoint:", this._endpointuri);
    } else {
      throw new Error("Invalid WebSocket URI in spawn response: " + rawUri);
    }
  }
}
