import request from '../utils/request';

const headers = { 'Access-Control-Allow-Origin': '*' };
const token = localStorage.getItem('token');

if (token) {
  headers.Authorization = `Bearer ${token}`;
}

export async function query() {
  return request('/api/users');
}

export async function queryCurrent() {
  return request('http://api.musixise.com/api/account', { // TODO: 貌似格式不一样
    headers,
    body: {},
  });
  // return request('/api/currentUser', { headers }); // this is mock
}
