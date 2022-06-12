const BACKEND_API = "http://localhost:3200";

const httpRequest = async (route, method, body) => {
  try {
    const path = BACKEND_API + route;
    const options = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (method) Object.assign(options, { method: method });
    if (body) Object.assign(options, { body: JSON.stringify(body) });

    const response = await fetch(path, options);
    const responseData = method ? {} : await response.json();

    return {
      status: response.status,
      statusText: response.statusText,
      data: responseData,
    };
  } catch (error) {
    return error.message;
  }
};

const getRequests = async () => {
  const response = await httpRequest("/requests");
  return response;
};

const addRequest = async (body) => {
  const response = await httpRequest("/request", "POST", body);
  return response;
};

const updateStatus = async (body) => {
  const response = await httpRequest("/updateStatus", "POST", body);
  return response;
};

const addAnswer = async (body) => {
  const response = await httpRequest("/addAnswer", "POST", body);
  return response;
};

const resetRequest = async (body) => {
  const response = await httpRequest("/resetRequest", "POST", body);
  return response;
};

module.exports = {
  getRequests,
  addRequest,
  updateStatus,
  addAnswer,
  resetRequest,
};
