import { createRoot } from "react-dom/client";
import NuiDemo from "./components";

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<NuiDemo />);
}
