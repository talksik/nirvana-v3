import { ObjectId } from "mongodb";

export default class Content {
  constructor(
    public relationshipId: string, // if it's a one on one, this will be the relationship Id
    public sentDate: Date,
    public contentUrl: string,
    public contentData: string,
    public contentType: ContentType,
    public _id?: ObjectId,
    public listenedDate?: Date
  ) {}
}

export enum ContentType {
  link = "LINK",
  audioClip = "AUDIO_CLIP",
  text = "TEXT",
}
