"use client"
import { useEffect } from "react";

const FloatingAIChat = () => {
  useEffect(() => {
    const injectScript = document.createElement("script");
    injectScript.src = "https://cdn.botpress.cloud/webchat/v3.6/inject.js";
    injectScript.async = true;
    
    injectScript.onload = () => {
      const botScript = document.createElement("script");
      botScript.src = "https://files.bpcontent.cloud/2026/02/11/07/20260211071116-H41669K8.js";
      botScript.defer = true;
      botScript.onload = () => {
        // Check and ensure it's visible
        const ensureVisible = () => {
          if (window.botpressWebChat) {
            window.botpressWebChat.sendEvent({ type: "show" });
          } else {
            setTimeout(ensureVisible, 500);
          }
        };
        ensureVisible();
      };
      document.body.appendChild(botScript);
    };

    document.body.appendChild(injectScript);
  }, []);

  return null;
};

export default FloatingAIChat;
