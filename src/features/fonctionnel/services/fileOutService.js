import http from "../../../services/http";

export function getFileOuts() {
  return http.get("/fileout");
}