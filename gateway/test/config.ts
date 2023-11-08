import * as dotenv from 'dotenv';
import * as path from 'path';

module.exports = async () => {
  dotenv.config({
    path: path.join(__dirname, '.env.test'),
  });
};
