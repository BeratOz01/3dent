import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Bounce, ToastContainer } from "react-toastify";
import { WagmiProvider } from "wagmi";
import { config } from "./config";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<WagmiProvider config={config}>
		<QueryClientProvider client={queryClient}>
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
		</QueryClientProvider>
	</WagmiProvider>,
);
