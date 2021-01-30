import mongoose from "mongoose";

const connectDB = (uri: string) => {
  return mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });
};

export const setupMongoose = async (URI: string) => {
  if (process.env["MONGODB_DEBUG"]) {
    mongoose.set("debug", true);
  }

  if (!URI) {
    throw new Error("Please add Mongodb URI to connect to");
  }

  await connectDB(URI);

  return function cleanup(): void {
    mongoose.connection.close();
  };
};
