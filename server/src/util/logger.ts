import log4js from "log4js";

const config = {
  appenders: {
    dateFile: {
      type: "dateFile",
      filename: "./logs/api",
      pattern: "yyyyMMdd.log",
      alwaysIncludePattern: true,
      keepFileExt: true,
      maxLogSize: 1048576,
      backups: 5,
      layout: {
        type: "pattern",
        pattern: "[%d] %z %p - %m",
      },
    },
    err: {
      type: "stderr",
    },
    out: {
      type: "stdout",
    },
  },
  categories: {
    default: {
      appenders: ["out"],
      level: "info",
    },
    api: {
      appenders: ["dateFile", "out"],
      level: "info",
    },
  },
};

log4js.configure(config);

export default log4js.getLogger("api");
