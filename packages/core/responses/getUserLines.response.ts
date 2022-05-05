import { Line } from "../models/line.model";

export default class GetUserLinesResponse {
  constructor(public lines: Line[]) {}
}
