import qrimg from "assets/img/qrcode.jpg";

import style from "./footer.module.scss";
const Footer = () => {
  return (
    <footer>
      <div className={style.wrapper}>
        <div className={style.aboutus}>
          <div className={style.des}>
            <h3>XX科技</h3>
            <p>
              如果您希望了解更多我们的项目，或有研发和知识产权的问题，请随时联系我们
            </p>
            <a className={style["contact"]} href="/contact">
              联系我们
            </a>
          </div>
          <img alt="" src={qrimg} />
        </div>
        <div className={style["copyRights"]}>
          <p>© 2022 XX科技 </p>
          <p>
            <a
              href="https://beian.miit.gov.cn"
              rel="noopener noreferrer"
              target="_blank"
            >
              沪ICP备2022014168号
            </a>
          </p>
        </div>
      </div>

      <div className={style["footerHeader"]}>
        <svg
          preserveAspectRatio="none"
          viewBox="0 0 1200 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M1200 100H0V0l400 77.2L1200 0z"></path>
        </svg>
      </div>
    </footer>
  );
};

export default Footer;
