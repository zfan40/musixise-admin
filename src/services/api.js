import { stringify } from 'qs';
import request from '../utils/request';

const headers = { 'Access-Control-Allow-Origin': '*' };
const token = localStorage.getItem('token');
if (token) {
  headers.Authorization = `Bearer ${token}`;
}

export async function queryProjectNotice() {
  return request('/api/project/notice');
}

export async function queryActivities() {
  return request('/api/activities');
}

export async function queryRule(params) {
  return request(`/api/rule?${stringify(params)}`);
}

export async function removeRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'delete',
    },
  });
}

export async function addRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

export async function fakeSubmitForm(params) {
  return request('/api/forms', {
    method: 'POST',
    body: params,
  });
}

export async function fakeChartData() {
  return request('/api/fake_chart_data');
}

export async function queryTags() {
  return request('/api/tags');
}

export async function queryBasicProfile() {
  return request('/api/profile/basic');
}

export async function queryAdvancedProfile() {
  return request('/api/profile/advanced');
}

export async function queryFakeList(params) {
  return request(`/api/fake_list?${stringify(params)}`);
}

export async function fakeAccountLogin(params) {
  // return request('/api/login/account', {
  //   method: 'POST',
  //   body: params,
  // });
  // ===================================
  // params貌似要加一个rememberMe:true,
  const newtoken = await request('http://api.musixise.com/api/authenticate', {
    method: 'POST',
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: params,
  });
  localStorage.setItem('token', newtoken.id_token);
  console.log(newtoken);
  if (newtoken) {
    headers.Authorization = `Bearer ${newtoken.id_token}`;
    return request('http://api.musixise.com/api/account', {
      headers,
      body: {},
    });
  } else {
    return false;
  }
}

export async function fakeRegister(params) {
  return request('/api/register', {
    method: 'POST',
    body: params,
  });
}

export async function queryNotices() {
  return request('/api/notices');
}

export async function queryWork() {
  return request('//api.musixise.com/api/work-lists?page=0&size=20&sort=id,asc', { headers });
}

export async function removeWork(params) {
  return request(`//api.musixise.com/api/work-lists/${params.id}`, {
    method: 'DELETE',
    headers,
    body: {
      ...params,
      method: 'delete',
    },
  });
}

export async function addWork(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}
