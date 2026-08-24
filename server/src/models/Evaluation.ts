import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IEvaluation extends Document {
  userId: Types.ObjectId;
  topic: string;
  transcript: string;
  grammarScore: number;
  vocabularyScore: number;
  overallScore: number;
  suggestions: string[];
  createdAt: Date;
}

const evaluationSchema: Schema<IEvaluation> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    transcript: {
      type: String,
      required: true,
    },
    grammarScore: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    vocabularyScore: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    suggestions: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const Evaluation: Model<IEvaluation> = mongoose.model<IEvaluation>(
  "Evaluation",
  evaluationSchema
);

export default Evaluation;