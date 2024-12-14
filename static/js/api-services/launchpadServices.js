import http from "./httpService";
import config from "../config/apiConfig.json";

const { apiUrl } = config;

const apiEndpoint = apiUrl + "/launchpads";

// GET //
export function fetchStatus() {
  return http.get(apiEndpoint + "/status");
}
export function fetchLaunchpads(filter, page, perPage) {
  return http.get(apiEndpoint + `?filter=${filter}&page=${page}&perPage=${perPage}`);
}
export function fetchLaunchpad(launchpadAddress) {
  return http.get(apiEndpoint + `/${launchpadAddress}`);
}
export function fetchSearchedLaunchpads(query) {
  return http.get(apiEndpoint + `/search?q=${query}`);
}
export function contributorsDataLink(launchpadAddress, chainId) {
  return apiEndpoint + `/contributors-data?launchpadAddress=${launchpadAddress}&chainId=${chainId}`;
}

// POST //
export function updateUserLaunchpads(launchpadId, userAddress) {
  return http.put(apiEndpoint + "/purchased", { userAddress, launchpadId });
}
export function saveLaunchpad(launchpad, txHash, chainId) {
  return http.post(apiEndpoint + `?chainId=${chainId}&txHash=${txHash}`, launchpad);
}

// External API calls //
export function getTokenPairs(apiSlug, tokenAddress) {
  return http.get(
    `https://tradingstrategy.ai/api/token/details?chain_slug=${apiSlug}&address=${tokenAddress}`
  );
}
