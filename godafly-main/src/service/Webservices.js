import axios from 'axios';
import {config, logDisplay} from '../utils/constants';

const APP_JSON = 'application/json';
const CONTENT_TYPE = 'multipart/form-data';
const AUTH_TYPE = 'Bearer ';

export const getServiceCall = async (endpoint, params, auth = false) => {
  const getUserData = await config.getUserData();
  const token = getUserData?.token ?? null;

  var headers = {
    Accept: APP_JSON,
    'Content-Type': CONTENT_TYPE,
  };
  if (!auth) {
    headers = {
      Authorization: AUTH_TYPE + token,
      Accept: APP_JSON,
      'Content-Type': CONTENT_TYPE,
    };
  }

  logDisplay('URL:>>>>>>>> ', JSON.stringify(endpoint));
  logDisplay('PARAMS:>>>>>>>> ', JSON.stringify(params));
  logDisplay('HEADER:>>>>>>>> ', JSON.stringify(headers));

  return axios
    .get(endpoint, {
      headers: headers,
      params,
    })
    .then(response => {
      logDisplay('RESPONSE:', JSON.stringify(response.data));
      return response.data;
    })
    .catch(({response}) => {
      logDisplay('ERROR:', JSON.stringify(response?.data));
      throw response?.data;
    });
};

export const postServiceCall = async (endpoint, params, auth = false) => {
  const getUserData = await config.getUserData();
  const token = getUserData?.token ?? null;

  var headers = {
    Accept: APP_JSON,
    'Content-Type': CONTENT_TYPE,
  };
  if (!auth) {
    headers = {
      Authorization: AUTH_TYPE + token,
      Accept: APP_JSON,
      'Content-Type': CONTENT_TYPE,
    };
  }

  logDisplay('URL:>>>>>>>> ', JSON.stringify(endpoint));
  logDisplay('PARAMS:>>>>>>>> ', JSON.stringify(params));
  logDisplay('HEADER:>>>>>>>> ', JSON.stringify(headers));

  return axios
    .post(endpoint, params, {
      headers: headers,
    })
    .then(response => {
      logDisplay('RESPONSE:', JSON.stringify(response.data));
      return response.data;
    })
    .catch(({response}) => {
      logDisplay('ERROR:', JSON.stringify(response?.data));
      throw response?.data;
    });
};
