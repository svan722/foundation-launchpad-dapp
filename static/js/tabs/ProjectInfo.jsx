import { useState } from "react";
import { toastError, toastInfo, toastSuccess } from "../utils/toastWrapper";
import Input from "../components/common/input";
import { boolean, number, object, string } from "yup"; // Import Yup for validation
import { truncateStr } from "../utils/truncate";
import OverlayLoader from "../components/common/OverlayLoader";
const { Web3Storage } = require("web3.storage");
const client = new Web3Storage({
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGI2QTRCNTg3NzkxNGYzOUU3MDFkNWViNDhmMjRkNzZFOWUwOGMxZGMiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NDQ4MTMxMTU1MzksIm5hbWUiOiJuZnRwb2MifQ.QXhHNlGOxpDOh_vTPYTmUtJ8kvP9Zll0dzzb75MJN8c",
});

const socials = [
  { label: `Facebook`, name: "facebook", placeholder: "https://www.facebook.com/project-name" },
  { label: `Twitter`, name: "twitter", placeholder: "https://twitter.com/project-name" },
  { label: `Telegram`, name: "telegram", placeholder: "https://t.me/project-name" },
  { label: `Discord`, name: "discord", placeholder: "https://discord.com/project-name" },
  { label: `Reddit`, name: "reddit", placeholder: "https://www.reddit.com//project-name" },
  { label: `Github`, name: "github", placeholder: "https://github.com/project-name" },
  {
    label: `Instagram`,
    name: "instagram",
    placeholder: "https://www.instagram.com/project-name",
  },
];

const ProjectInfo = ({
  handlePrev,
  handleSubmit,
  launchpadDetails,
  handleChange,
  errors,
  setLogo,
}) => {
  const { logo } = launchpadDetails;

  const [waitUploadingLogo, setWaitUploadingLogo] = useState(false);

  const maxSizeInBytes = 2097152; // 2MB
  const supportedTypes = ["image/png", "image/jpg", "image/jpeg", "image/gif"];

  const socialsSchema = {};

  socials.forEach((social) => {
    const exampleUrl = social.placeholder.replace("project-name", "");
    socialsSchema[social.name] = string().test(
      social.name,
      `url must start with ${exampleUrl}`,
      (value) => {
        if (value) {
          return value.startsWith(exampleUrl);
        }
        return true;
      }
    );
  });

  // Schema
  const projectInfoSchema = object({
    logo: string().required("Please upload a logo Image"),
    website: string().url().required(),
    description: string().min(100).max(500).required(),
    ...socialsSchema,
  });

  console.log(logo);

  const handleFileChange = async (e) => {
    try {
      const file = e.target.files[0];

      if (!file) return;

      if (file && file.size > maxSizeInBytes) {
        return toastError("Image file size exceeds 2mb");
      }

      if (!supportedTypes.includes(file.type)) {
        return toastError(`Does not support file type ${file.type}`);
      }
      const formData = new FormData();
      formData.append("project-logo", file);

      toastInfo("Uploading Project logo to IPFS");

      setWaitUploadingLogo(true);
      const cid = await client.put([file]);
      const ipfsLogoUrl = `https://ipfs.io/ipfs/${cid}/${file.name}`;
      setWaitUploadingLogo(false);

      setLogo(ipfsLogoUrl);
      toastSuccess("Image Uploaded successfully");
    } catch (error) {
      toastError("Image Upload Failed");
      setWaitUploadingLogo(false);
    }
  };

  return (
    <div
      className="tab-pane fade show active"
      id="nav-contact"
      role="tabpanel"
      aria-labelledby="nav-contact-tab"
    >
      <h3 className="tabTitle">
        <span>Add Additional Info : </span>Let people know who you are
      </h3>
      <form className="row">
        <div className="col-6 mb-3">
          <label htmlFor="staticEmail2" className="lbl">
            {!logo ? "Project Logo*" : "Change Logo"}
          </label>
          <input
            onChange={handleFileChange}
            type="file"
            className="form-control"
            id="inputGroupFile01"
          />
          {errors["logo"] && <div style={{ color: "red" }}>{errors["logo"]}</div>}
          <small>only png,jpg,jpeg or gif</small>
          {logo && (
            <div className="mb-2 colorYellow">
              Logo Uploaded -{" "}
              <a target="_blank" href={logo}>
                {truncateStr(logo, 25)}
              </a>
            </div>
          )}
        </div>
        <div className="col-6 mb-3">
          <Input
            onChange={(e) => handleChange(e, projectInfoSchema)}
            value={launchpadDetails["website"]}
            label="Website*"
            name={"website"}
            placeholder={"https://www.project.com"}
            error={errors["website"]}
          />
        </div>
        <div className="col-12 mb-3">
          <label htmlFor="staticEmail2" className="lbl">
            Description*
          </label>
          <textarea
            type="text"
            className="form-control"
            id="staticEmail2"
            onChange={(e) => handleChange(e, projectInfoSchema)}
            value={launchpadDetails["description"]}
            name="description"
            placeholder="paste a description here"
          ></textarea>
          {errors["description"] && <div style={{ color: "red" }}>{errors["description"]}</div>}
        </div>
        {socials.map(({ label, name, additionalInfo, placeholder }, i) => {
          const className = i === socials.length - 1 && i % 2 === 0 ? "col-12 mb-3" : "col-6 mb-3";
          return (
            <div key={i} className={className}>
              <Input
                onChange={(e) => handleChange(e, projectInfoSchema)}
                value={launchpadDetails[name]}
                label={label || ""}
                name={name}
                placeholder={placeholder || ""}
                error={errors[name] || ""}
              />
            </div>
          );
        })}
      </form>
      <div className="pagiNtion">
        <button onClick={handlePrev} style={{ padding: "10px 30px" }} className="btnYellow">
          Back
        </button>
        <button
          onClick={() => handleSubmit(projectInfoSchema)}
          style={{ padding: "10px 30px" }}
          className="btnYellow"
        >
          Submit
        </button>
      </div>
      <OverlayLoader size={32} loading={waitUploadingLogo} />
    </div>
  );
};

export default ProjectInfo;
