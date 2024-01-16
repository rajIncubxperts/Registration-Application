import {
  legacy_createStore as createStore,
  applyMiddleware,
  combineReducers,
} from "redux";
import thunk from "redux-thunk";
import studentReducer from "../reducers/studentReducer";

const rootReducer = combineReducers({
  studentReducer,
});

const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;
