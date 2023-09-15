import logo from "assets/img/logo.svg";
import wagedown from "assets/img/wave.svg";
import shallow from "zustand/shallow";

import { useGlobalStore } from "stores/global";

import style from "./header.module.scss";

export default function Header() {
  const { isSignIn } = useGlobalStore(
    (state) => ({ isSignIn: state.isSignIn }),
    shallow
  );

  return (
    <header>
      <div className={style["wrapper"]}>
        <a href="#">
          <img src={logo} />
        </a>
        <nav>
          <ul>
            <li>
              <a href="#">首页</a>
            </li>
            <li>
              <a href="#">关于XX</a>
            </li>
            <li>
              <a href="#">聚焦领域</a>
            </li>
            <li>
              <a href="#">科技赋能</a>
            </li>
            <li>
              <a href="#">知识产权运营</a>
            </li>
            <li>
              <a href="#">最新动态</a>
            </li>
            <li>
              <a href="#">联系我们</a>
            </li>
          </ul>
        </nav>
      </div>

      <div>
        <h1>智能制造</h1>
      </div>

      <div className={style["headerBottom"]}>
        <svg
          preserveAspectRatio="none"
          viewBox="0 0 1200 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M1200 100H0V0l400 77.2L1200 0z"></path>
        </svg>
      </div>
    </header>
  );
}
