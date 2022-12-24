import { useState } from "react";
import ReactDOM from "react-dom/client";

//vite 热更新相关
//console.log(import.meta.hot)
function Child() {
  return <span>react</span>;
}
function App() {
  const [num, setNum] = useState(3);
  console.log("num ", num);
  return <div onClick={() => setNum(111)}>{num}</div>;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App />
);
