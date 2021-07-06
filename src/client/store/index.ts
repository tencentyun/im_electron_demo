import { createStore } from "redux";
import counter from './reducer';

const store = createStore(counter);

export default store;