import { Link } from "react-router-dom";
import Countdown from "react-countdown";
import ProgressBar from "../components/common/ProgressBar";
import { fetchLaunchpads, fetchSearchedLaunchpads } from "../api-services/launchpadServices";
import { useEffect, useState } from "react";
import { getCurrentTime } from "../utils/getCurrentTime";
import Search from "../components/Search";
import Loader from "../components/common/Loader";
import { toastError } from "../utils/toastWrapper";
import supportedChains from "../config/supportedChains.json";
import Button from "../components/common/Button";
import { formatNumber } from "../utils/formatNumber";
import { useAccount } from "wagmi";
import { getIsCancelled, getTotalRaised } from "../contract-hooks/launchpad";

const LaunchpadList = () => {
  const [launchpads, setLaunchpads] = useState([]);
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loadingLaunchpads, setLoadingLaunchpads] = useState(false);
  const [loadMoreBtn, setLoadMoreBtn] = useState(true);
  const perPage = 12;

  const { address } = useAccount();

  useEffect(() => {
    fetchCustomLaunchpads(filter, page);
  }, []);

  useEffect(() => {
    if (address && filter === "mine") {
      setPage(0);
      fetchCustomLaunchpads(filter, 0);
    }
  }, [address]);

  const fetchCustomLaunchpads = async (filter, page) => {
    try {
      const tLaunchpads = await fetchingLaunchpads(filter, page);
      setLaunchpads([...tLaunchpads]);
    } catch (e) {
      toastError("Fetch Launchpads Failed");
    }
  };

  const handleFilter = async (e) => {
    setFilter(e.target.value);
    setPage(0);

    setLaunchpads([]);
    const tLaunchpads = await fetchingLaunchpads(e.target.value, 0);
    setLaunchpads(tLaunchpads);
  };

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    const tLaunchpads = await fetchingLaunchpads(filter, nextPage);
    setPage(nextPage);
    setLaunchpads([...launchpads, ...tLaunchpads]);
  };

  const fetchingLaunchpads = async (filter, page) => {
    try {
      if (filter === "mine") filter = address;

      setLoadingLaunchpads(true);
      let loadedLaunchpads = (await fetchLaunchpads(filter, page, perPage)).data;
      loadedLaunchpads = await formatLaunchpadData(loadedLaunchpads);

      if (loadedLaunchpads.length < perPage) setLoadMoreBtn(false);
      else setLoadMoreBtn(true);

      setLoadingLaunchpads(false);
      return loadedLaunchpads;
    } catch (error) {
      toastError("Fetch launchpads Failed, Please Reload");
      setLoadingLaunchpads(false);
    }
  };

  const formatLaunchpadData = async (launchpadData) => {
    launchpadData = launchpadData.map((launchpad) => {
      let status;

      if (launchpad.startTime > getCurrentTime()) status = "upcoming";
      else if (launchpad.endTime <= getCurrentTime()) status = "ended";
      else status = "live";

      return { ...launchpad, status };
    });

    const promises = launchpadData.map(async (l) => {
      l.totalRaised = await getTotalRaised(l.chainId, l.address);
      l.cancelled = await getIsCancelled(l.chainId, l.address);
      return l;
    });

    return Promise.all(promises);
  };

  const handleSearch = async (e) => {
    try {
      const query = e.target.value;
      setSearch(query);

      setLoadMoreBtn(false);
      setFilter("all");
      setPage(0);

      if (query === "") {
        return fetchCustomLaunchpads("all", 0);
      }

      setLoadingLaunchpads(true);
      let searchedLaunchpads = (await fetchSearchedLaunchpads(query)).data;
      searchedLaunchpads = await formatLaunchpadData(searchedLaunchpads);

      setLoadingLaunchpads(false);
      setLaunchpads(searchedLaunchpads);
    } catch (error) {
      toastError("Fetching Launchpads Failed, Please Reload");
    }
  };

  const handleCountdownComplete = (index, status) => {
    let allLaunchpads = [...launchpads];
    allLaunchpads[index].status = status;
    setLaunchpads(allLaunchpads);
  };

  const renderLaunchpadType = (launchpad) => {
    if (launchpad.type === "IDO") {
      if (launchpad.autoDexListing) {
        return "IDO";
      } else {
        return "Sale";
      }
    } else {
      return "Sale";
    }
  };

  return (
    <>
      <Search
        handleFilter={handleFilter}
        filter={filter}
        search={search}
        handleSearch={handleSearch}
      />
      <div className="px-md-5 px-3">
        <div className="row">
          {launchpads?.length
            ? launchpads.map((launchpad, index) => (
                <div key={index} className="col-lg-4 col-md-6 col-sm-12">
                  <div className="card_ liSt mobileCard">
                    <div className="card_Title">
                      <div className="cryLogo">
                        <img src={launchpad.logo} />
                        <div>
                          <h3>
                            {launchpad.tokenName} <span>{launchpad.tokenSymbol}</span>
                          </h3>
                          <h4>
                            1 {launchpad.currency} = {launchpad.rate} {launchpad.tokenSymbol}
                          </h4>
                        </div>
                      </div>
                      <div>
                        <button
                          disabled={true}
                          className={`btnYellow tag ${
                            supportedChains[launchpad.chainId].smallName.includes("BSC")
                              ? "tag--yellow"
                              : "tag--blue"
                          }`}
                        >
                          {supportedChains[launchpad.chainId].smallName}
                        </button>
                        <button disabled={true} className="btnYellow">
                          {!launchpad.cancelled
                            ? launchpad.status === "ended" &&
                              parseFloat(launchpad.totalRaised) >= parseFloat(launchpad.softcap)
                              ? "SUCCESS"
                              : launchpad.status?.toUpperCase()
                            : "CANCELLED"}
                        </button>
                      </div>
                    </div>
                    <div className="card_body">
                      <ProgressBar
                        percent={
                          (parseFloat(launchpad.totalRaised) / parseFloat(launchpad.hardcap)) * 100
                        }
                        currentValue={`${formatNumber(launchpad.totalRaised, 5) || "0"}  ${
                          launchpad.currency
                        }`}
                        endValue={`${formatNumber(launchpad.hardcap, 5)} ${launchpad.currency}`}
                      />
                      <ul>
                        <li>
                          <small>Launchpad Type</small>
                          <h3>{renderLaunchpadType(launchpad)}</h3>
                        </li>
                        <li>
                          <small>Soft Cap</small>
                          <h3>
                            {launchpad.softcap} <small>{launchpad.currency}</small>
                          </h3>
                        </li>
                        <li>
                          <small>{launchpad.autoDexListing ? "Dex Liquidity %" : "Hardcap"}</small>

                          {launchpad.autoDexListing ? (
                            <h3>{`${launchpad.dexLiquidityPercentage}%`}</h3>
                          ) : (
                            <h3>
                              {launchpad.hardcap}
                              <small className="mx-1">{launchpad.currency}</small>
                            </h3>
                          )}
                        </li>
                        <li>
                          <small>
                            {launchpad.autoDexListing ? "Dex Liquidity" : "Tokens For Sale"}
                          </small>
                          <h3>
                            {launchpad.autoDexListing ? "Locked Forever" : launchpad.tokensForSale}
                          </h3>
                        </li>
                      </ul>
                    </div>
                    <div className="card_footer">
                      <div className="saleTime">
                        {!launchpad.cancelled ? (
                          launchpad.status !== "ended" ? (
                            launchpad.status === "upcoming" ? (
                              <Countdown
                                onComplete={() => handleCountdownComplete(index, "live")}
                                date={launchpad.startTime * 1000}
                                renderer={({ days, hours, minutes, seconds }) => (
                                  <h3>
                                    Sale Starts In -{" "}
                                    <span>
                                      {days}:{hours}:{minutes}:{seconds}
                                    </span>
                                  </h3>
                                )}
                              />
                            ) : (
                              <Countdown
                                onComplete={() => {
                                  handleCountdownComplete(index, "ended");
                                }}
                                date={launchpad.endTime * 1000}
                                renderer={({ days, hours, minutes, seconds }) => (
                                  <h3>
                                    Sale Ends In -{" "}
                                    <span>
                                      {days}:{hours}:{minutes}:{seconds}
                                    </span>
                                  </h3>
                                )}
                              />
                            )
                          ) : (
                            <h3>Sale Has Ended</h3>
                          )
                        ) : (
                          <h3>Sale Was Cancelled</h3>
                        )}
                      </div>

                      <div className="share">
                        {address === launchpad.ownerAddress && (
                          <img
                            style={{ width: "25px", margin: "0 5px" }}
                            src="/images/key.svg"
                            alt=""
                          />
                        )}
                        <Link to={`/launchpads/${launchpad.address}`}>
                          <a className="btn_view">
                            view <img src="./images/Arrow-right-up-Line.svg" />
                          </a>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            : !loadingLaunchpads && <div className="text-center">{`No ${filter} Launchpads`}</div>}
          {loadingLaunchpads ? (
            <div className="my-2">
              <Loader size={25} loading={loadingLaunchpads} />
            </div>
          ) : (
            loadMoreBtn && (
              <Button
                onClick={handleLoadMore}
                btnLabel={"Load More Launchpads"}
                className="btn btnYellowOutline my-2"
              />
            )
          )}
        </div>
      </div>
    </>
  );
};

export default LaunchpadList;
