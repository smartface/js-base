const Application = {};
const services    = [];

Application.addService = function (name, service) {
  services[name] = service;
};

Application.getService = function (names) {
};