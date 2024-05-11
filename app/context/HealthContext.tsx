import React, { useCallback, useState } from 'react';
import Electron from 'electron';
import { healthTransformer } from './helpers';
const { ipcRenderer } = window.require('electron');

export const HealthContext = React.createContext<any>(null);

/**
 * MANAGES THE FOLLOWING DATA AND ACTIONS:
 * @property  {Object} healthData
 * @method    setServices
 * @method    setHealthData
 * @method    fetchHealthData
 */

interface Props {
  children: any;
}

interface MetricObject {
  category: string;
  metric: string;
  rowNumber: number;
  time: string;
  value: number;
  __v: number;
  _id: string;
  token: string;
}
interface HealthDataObject {
  [key: string]: MetricObject[];
}

const HealthContextProvider: React.FC<Props> = React.memo(({ children }) => {
  const [healthData, setHealthData] = useState<any>({ healthDataList: [], healthTimeList: [] });
  const [services, setServices] = useState<Array<string>>([]);

  function tryParseJSON(jsonString: any) {
    try {
      const o = JSON.parse(jsonString);
      if (o && typeof o === 'object') {
        return o;
      }
    } catch (e) {
      let errorString = 'Not valid JSON: ' + e.message;
      // console.log(errorString);
      new Error(errorString);
    }
    return false;
  }

  /**
   * @function fetchEventData - sending a request to the backend to retrieve data.
   * Data is then parsed and setHealthData is called with the transformed information.
   */

  const fetchHealthData = useCallback(async servers => {
    ipcRenderer.removeAllListeners('healthResponse');

    let temp: HealthDataObject[] = [];
    await Promise.all(servers.map( async (service: string) => {
      //NOT WORKING HERE
      try {
        const newPromise: any = await new Promise((resolve, reject) => {
          ipcRenderer.send('healthRequest', `${service}`);
          ipcRenderer.on('healthResponse', (event: Electron.Event, data: string) => {
            let result: object[];
            // console.log({data})
            if (JSON.stringify(data) !== '{}' && tryParseJSON(data)) {
              result = JSON.parse(data);
              // console.log({result})
              // console.log('HealthContext.tsx line 68 result: ', result, 'service', service, 'Obj key', Object.keys(result[0])[0]);
              //result exists, has a length prop, and the service name and database name are same
              if (result && result.length && `${service}` === Object.keys(result[0])[0]) {
                resolve(result[0]);
              }
            }
          });
        })
        temp.push(newPromise);
        // console.log('HealthContext.tsx line 80 temp populates?: ', temp, serv)
        if (checkServicesComplete(temp, [`${service}`])) {
          setServices([`${service}`]);
          let transformedData: any = {};
          // console.log('original healthData before transformation: ', temp);
          // transformedData = {
          //   healthDataList: [1,2,3,4,5],
          //   healthTimeList: [1,2,3,4,5]
          // } //testing typescript, transformedDATA of type 2 arrays with basic entries?
          transformedData = healthTransformer(temp); //must match the setHealthData STATE format
          // console.log('healthData after tranformation: ', transformedData);
          setHealthData(transformedData);
        }
        } catch (err) {
        // console.log("healthcontext.tsx ERROR: ", err);
      };
    }
    ))
    } , []);

  const checkServicesComplete = (temp: any[], servers: string[]) => {
    if (temp.length !== servers.length) {
      return false;
    }
    const arr1: string[] = [];
    for (let i = 0; i < temp.length; i++) {
      arr1.push(Object.keys(temp[i])[0]);
    }
    // console.log('in checkServicesComplete line 139: ', arr1);
    return arr1.sort().toString() === servers.sort().toString();
  };

  return (
    <HealthContext.Provider
      value={{
        setHealthData,
        fetchHealthData,
        healthData,
        services,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
});

export default HealthContextProvider;
