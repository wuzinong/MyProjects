import reactDomConfig from "./react-dom.config";
import reactCofing from "./react.config";

export default () => {
  return [...reactCofing, ...reactDomConfig];
};
