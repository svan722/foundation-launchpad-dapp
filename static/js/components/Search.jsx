import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";

const Search = ({ filter, handleFilter, handleSearch, search }) => {
  const [filters, setFilters] = useState([]);

  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (isConnected) {
      setFilters(["all", "upcoming", "live", "ended", "mine"]);
    } else {
      setFilters(["all", "upcoming", "live", "ended"]);
    }
  }, [isConnected]);

  return (
    <div className="px-md-5 px-3 py-2 mb-3 mt-4 filterButtons">
      <div className="row align-items-center">
        <div className="col mb-md-0 mb-3">
          <div className="w-100 relative filterButtonsǎ ">
            <input
              onChange={handleSearch}
              value={search}
              className="form-control border-bottom-search"
              placeholder="Search by Token Name or Address"
            />
            <img className="fixedSearch" src="images/search.svg" />
          </div>
        </div>
        <div className="col-auto d-inline-flex align-items-center">
          <Link to="/create">
            <button className="btn btnYellowOutline mx-2" type="submit">
              Create Launchpad
            </button>
          </Link>

          <div className="btn-group">
            {/* <button type="button" className="btn btnYellowOutline mx-2 d-flex align-items-center">
              Filter By
              <img className="ms-2" src="images/filter.svg" />
            </button>
            <ul className="dropdown-menu">
              {filterDropdown.map((filter) => (
                <li>
                  <a className="dropdown-item" href="#">
                    {filter}
                  </a>
                </li>
              ))}
            </ul> */}
            <select
              className="btn btnYellowOutline mx-2 d-flex align-items-center"
              onChange={handleFilter}
              value={filter}
              name={"filterLaunchpads"}
              id={"filterLaunchpads"}
            >
              {filters.map((option, index) => {
                return (
                  <option key={index} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
