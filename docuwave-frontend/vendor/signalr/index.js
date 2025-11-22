class SimpleHubConnection {
  constructor(url, options = {}) {
    this.url = url;
    this.options = options;
    this.handlers = {};
    this.state = HubConnectionState.Disconnected;
  }

  on(event, callback) {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event].push(callback);
  }

  off(event, callback) {
    if (!this.handlers[event]) return;
    this.handlers[event] = this.handlers[event].filter((cb) => cb !== callback);
  }

  async start() {
    this.state = HubConnectionState.Connected;
    return Promise.resolve();
  }

  async stop() {
    this.state = HubConnectionState.Disconnected;
    return Promise.resolve();
  }

  async invoke(event, ...args) {
    if (this.handlers[event]) {
      this.handlers[event].forEach((cb) => cb(...args));
    }
    return Promise.resolve();
  }

  async send(event, ...args) {
    return this.invoke(event, ...args);
  }
}

class HubConnectionBuilder {
  constructor() {
    this.url = '';
    this.options = {};
  }

  withUrl(url, options = {}) {
    this.url = url;
    this.options = options;
    return this;
  }

  withAutomaticReconnect() {
    return this;
  }

  configureLogging() {
    return this;
  }

  build() {
    return new SimpleHubConnection(this.url, this.options);
  }
}

const LogLevel = {
  None: 0,
  Critical: 1,
  Error: 2,
  Warning: 3,
  Information: 4,
  Debug: 5,
  Trace: 6
};

const HubConnectionState = {
  Disconnected: 'Disconnected',
  Connecting: 'Connecting',
  Connected: 'Connected',
  Reconnecting: 'Reconnecting'
};

module.exports = {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel
};
