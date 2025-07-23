export default class Global {
  token = '';
  apiKey = '';
  apiId = '';
  static setToken = (token) => {
    this.token = token;
  };

  static getToken = () => {
    return this.token;
  };

  static setApiKey = (apiKey) => {
    this.apiKey = apiKey;
  };

  static getApiKey = () => {
    return this.apiKey;
  };

  static setApiId = (apiId) => {
    this.apiId = apiId;
  };

  static getApiId = () => {
    return this.apiId;
  };
}
