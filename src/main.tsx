import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./index.css";
import { Analytics } from "@vercel/analytics/react";
import { Bounce, ToastContainer } from "react-toastify";
import { AppKitProvider } from "./AppKitProvider";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <AppKitProvider>
    <App />
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover={false}
      theme="dark"
      transition={Bounce}
      toastClassName={"font-mono border-cyber-green/60"}
    />
    <Analytics />
  </AppKitProvider>
);
