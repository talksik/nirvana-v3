import { Line } from "../models/line.model";
import MasterLineData from "../models/masterLineData.model";

export default class GetUserLinesResponse {
  constructor(public masterLines: MasterLineData[]) {}
}
