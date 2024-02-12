import mongoose, { Schema } from "mongoose";

const TestModels = new Schema({
  username: String,
  firstName: String,
  lastName: String,
});

export default mongoose.models.TestModels ||
  mongoose.model("TestModel", TestModels);
