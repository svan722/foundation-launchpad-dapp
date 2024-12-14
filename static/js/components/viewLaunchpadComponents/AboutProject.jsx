const AboutProject = ({ launchpad }) => {
  return (
    <div className="bg-offBlack px-3 ps-md-4 mb-4 overflowHidden">
      <div className="d-flex align-items-start justify-content-between ">
        <div className="d-inline-flex align-items-center mt-4">
          <img src={launchpad.logo} className="me-2" />
          <div className="">
            <p className="fw-semibold">{launchpad.tokenName}</p>
            <p className="offText">Token</p>
          </div>
        </div>
        <div className="d-flex justify-content-md-center justify-content-between px-2 h-100">
          {["website", "twitter", "telegram", "discord", "reddit"].map((social, i) => {
            return (
              launchpad[social] && (
                <a
                  key={i}
                  href={launchpad[social]}
                  target="_blank"
                  className="my-2 mx-md-0 mx-sm-0 mx-3"
                >
                  <img src={`/images/${social}.svg`} />
                </a>
              )
            );
          })}
        </div>
      </div>
      <div>
        <p className="py-3 max-w-600">{launchpad.description}</p>
      </div>
    </div>
  );
};

export default AboutProject;
