import api from "./api";

const getLabels = async () => {
  const response = await api.get("/labels");
  return response.data.data?.labels || [];
};

const labelService = {
  getLabels,
};
export default labelService;
