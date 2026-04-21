import "./index.css";
import App from "./App";
import { createRoot } from "react-dom/client";
import { installTextNodePatch } from "./lib/translator";

// Install the text-node patch BEFORE React mounts so every render goes through it.
installTextNodePatch();

createRoot(document.getElementById("root")!).render(<App />);
