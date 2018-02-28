import { queryMusixiser, removeMusixiser, addMusixiser } from '../services/api';

export default {
  namespace: 'musixiser',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryMusixiser, payload);
      // 缺少分页信息！
      const formatterResponse = { list: response, pagination: {} };
      yield put({
        type: 'save',
        payload: formatterResponse,
      });
    },
    *add({ payload, callback }, { call, put }) {
      const response = yield call(addMusixiser, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback();
    },
    *remove({ payload }, { call }) {
      yield call(removeMusixiser, payload);
      // const response = yield call(removeMusixiser, payload);
      // yield put({
      //   type: 'save',
      //   payload: response,
      // });
      // if (callback) callback();
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  },
};
