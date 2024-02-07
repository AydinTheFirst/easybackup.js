import { MongoDB } from "./classes/mongodb";
import { Postgres } from "./classes/postgres";
import { MariaDB } from "./classes/mariadb";
import { MySQL } from "./classes/mysql";

const Easybackup = {
  mongodb: new MongoDB(),
  postgres: new Postgres(),
  mariadb: new MariaDB(),
  mysql: new MySQL(),
};

export default Easybackup;
export { MongoDB, Postgres, MariaDB, MySQL };
