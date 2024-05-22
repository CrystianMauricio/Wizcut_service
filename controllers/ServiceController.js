import { findServiceById } from "../models/service.js";

export const getAssistant = async (serviceId) => {
  try {
    return await findServiceById(serviceId);
  } catch (err) {
    console.log('error in get assistant in service controller: ', err);
    throw new Error(err);
  }
};