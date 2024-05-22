import axios from "axios";

export const getCurrentTime = async (location) => {
    try {
        const res = await axios.get(`https://worldtimeapi.org/api/timezone/Europe/${location.toLowerCase()}`);
        return res.data.datetime;
    } catch (err) {
        console.log('error in get current time service: ', err);
        return null;
    }
}