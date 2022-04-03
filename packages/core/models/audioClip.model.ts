import { ObjectId } from "mongodb";

export default class AudioClip {
  constructor(
    public _id: ObjectId,

    public url: string,

    public createdDate: Date = new Date(),
    public duration?: number
  ) {}
}
