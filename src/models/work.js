import { queryWork, removeWork, addWork } from '../services/api';

export default {
  namespace: 'work',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryWork, payload);
      // 缺少分页信息！
      const formatterResponse = { list: response, pagination: {} };
      yield put({
        type: 'save',
        payload: formatterResponse,
      });
    },
    *add({ payload, callback }, { call, put }) {
      const response = yield call(addWork, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback();
    },
    *remove({ payload, callback }, { call, put }) {
      const response = yield call(removeWork, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback();
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
