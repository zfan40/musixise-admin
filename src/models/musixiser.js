import { queryMusixiser, removeMusixiser, addMusixiser, getMusixiserById } from '../services/api';

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
    *getById({ payload }, { call, put }) {
      const response = yield call(getMusixiserById, payload);
      yield put({
        type: 'save',
        payload: { list: response },
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

    *update({ payload }, { call, put}) {
      console.log(payload);
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
