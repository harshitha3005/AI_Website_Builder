// import { configureStore } from '@reduxjs/toolkit'
// import userSlice from "./userSlice"

// export const store = configureStore({
//   reducer: {
//     user:userSlice
//   },
// })


import {combineReducers, configureStore} from "@reduxjs/toolkit";
import userSlice from "./userSlice"

import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'

// Use localStorage directly - return Promises for redux-persist compatibility
const storage = {
  getItem: (key) => {
    return new Promise((resolve, reject) => {
      try {
        const value = localStorage.getItem(key)
        resolve(value)
      } catch (e) {
        reject(e)
      }
    })
  },
  setItem: (key, value) => {
    return new Promise((resolve, reject) => {
      try {
        localStorage.setItem(key, value)
        resolve()
      } catch (e) {
        reject(e)
      }
    })
  },
  removeItem: (key) => {
    return new Promise((resolve, reject) => {
      try {
        localStorage.removeItem(key)
        resolve()
      } catch (e) {
        reject(e)
      }
    })
  },
}


const persistConfig = {
    key: 'ai-website-builder',
    version: 1,
    storage,
  }
  const rootReducer = combineReducers({
    user:userSlice,
  })
  const persistedReducer = persistReducer(persistConfig, rootReducer)


const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
});
export default store;