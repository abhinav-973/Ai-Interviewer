import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./app/store";
import { configureApiClientAuth } from "./services/apiClient";
import {
  logout,
  refreshAccessTokenSuccess,
} from "./features/auth/authSlice";

configureApiClientAuth({
  getToken: () => store.getState().auth.token || localStorage.getItem("token"),
  handleTokenRefresh: (accessToken) =>
    store.dispatch(refreshAccessTokenSuccess(accessToken)),
  handleAuthFailure: () => store.dispatch(logout()),
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>
);
