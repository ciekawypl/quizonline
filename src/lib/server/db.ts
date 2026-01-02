import {PrismaClient} from '../../../generated/prisma/client'
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

import path from "path";

const connectionString = `file:${path.resolve("dev.db")}`;


const adapter = new PrismaBetterSqlite3({ url: connectionString });
const db = new PrismaClient({ adapter });

export default db