import KafkaModel from '../models/KafkaModel';
import HealthModelFunc from '../models/HealthModel';
import { Pool } from 'pg';
import GrafanaAPIKeyModel from '../models/GrafanaAPIKeyModel';

interface fetchData {
  mongoFetch: (serviceName: string) => Promise<Array<{ [key: string]: any[] }>>;
  postgresFetch: (serviceName: string, pool: Pool) => Promise<Array<{ [key: string]: any[] }>>;
}

const aggregator: any[] = [
  {
    $setWindowFields: {
      partitionBy: '$metric',
      sortBy: {
        time: -1,
      },
      output: {
        rowNumber: {
          $documentNumber: {},
        },
      },
    },
  },
  {
    $match: {
      rowNumber: { $lte: 50 },
    },
  },
];

const mongoFetch = async (
  serviceName: string
): Promise<Array<{ [key: string]: any[] }> | undefined> => {
  try {
    //We are creating models to populate with data for each service
    const testModel = HealthModelFunc(serviceName);
    const grafanaAPIKey = await GrafanaAPIKeyModel.find({});
    let result = await testModel.aggregate(aggregator);
    console.log({result})
    for (let i = 0; i < result.length; i++) {
      result[i].token = grafanaAPIKey[0].token;
    }
    result = [{ [serviceName]: result }];
    return result;
  } catch (error) {
    console.log('Aggregation error in mongoFetch(): ', error);
  }
};

const postgresFetch = async (
  serviceName: string,
  pool: Pool
): Promise<Array<{ [key: string]: any[] }> | undefined> => {
  const query = `
    WITH temp AS (
        SELECT
          metric, value, category, time,
          row_number() OVER(PARTITION BY metric ORDER BY time DESC) AS rowNumber
        FROM
          ${serviceName}
    )
    SELECT
      metric, value, category, time
    FROM
      temp
    WHERE
      rowNumber <= 50
  ;`;

  try {
    let result = await pool.query(query);
    result = result.rows;
    result = [{ [serviceName]: result }];
    return result;
  } catch (error) {
    console.log('Query error in postgresFetch(): ', error);
  }
};

const fetchData = {
  mongoFetch,
  postgresFetch,
};

export { fetchData };
