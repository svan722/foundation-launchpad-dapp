import { Link } from "react-router-dom";
import Button from "../components/common/Button";

const PageNotFound = () => {
  return (
    <div className="d-flex justify-content-center flex-column align-items-center">
      <h4 className="mt-5 text-center">404 - Page not Nound</h4>
      <Link to="/">
        <Button className={"btn btnYellow mt-2"} btnLabel={"Go Back"} />
      </Link>
    </div>
  );
};

export default PageNotFound;
