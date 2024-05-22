import axios from 'axios';

const intervals = [
    { from: 1, to: 4 },
    { from: 5, to: 8 },
    { from: 9, to: 20 },
    { from: 21, to: 50 },
    { from: 50, to: 100 },
    { from: 101, to: 300 }
  ]

export const getStorage = async (location, surface) => {
    try {
      let minSqm = 0;
      let maxSqm = 0;
  
      for (let i = 0; i < intervals.length; i++) {
        if (surface >= intervals[i].from && surface < intervals[i].to) {
          minSqm = intervals[i].from;
          maxSqm = intervals[i].to;
          break;
        }
      }
      const res = await axios.get(`https://cron7.costockage.fr/city_score_json.php?city=${location}&min_sqm=${minSqm}&max_sqm=${maxSqm}&limit=5`);
      const resArr = [];
      const resData = res.data;
  
      for (let i = 0; i < res.data.length; i++) {
        if (resData[i].spaces) {
          for (let j = 0; j < resData[i].spaces.length; j++) {
            resArr.push({
              ...resData[i].spaces[j],
              nom: resData[i].nom,
            });
          }
        } else {
          resArr.push(resData[i]);
        }
      }
  
      return resArr;
    } catch (err) {
      console.log('error in get surface: ', err);
      return [];
    }
}