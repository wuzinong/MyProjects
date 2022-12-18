import { useState } from "react";
import ReactDOM from "react-dom/client";

//vite 热更新相关
//console.log(import.meta.hot)

function App() {
  const [num] = useState(100);
  return <div>{num}</div>;
}

function Child() {
  return <span>react</span>;
}
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App />
);
