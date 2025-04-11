import { useEffect } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "appkit-account-button": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

export function useWebComponents() {
  useEffect(() => {
    // You might need to load the web components script here if it's not already loaded
    // For example:
    // const script = document.createElement('script');
    // script.src = 'path-to-your-web-components.js';
    // document.body.appendChild(script);
  }, []);
}
