import { ObjectId } from 'mongodb';

export interface IContent {
  id?: ObjectId;

  creatorUserId: string;
  contentUrl: string; // remote resource of file/media
  createdDate: Date;

  // visitCount
}

// ? persist length of clip for easier read access for others...
// ? they have to load it anyway and will get metadata anyway?
export class ContentBlock implements IContent {
  constructor(
    public creatorUserId: string,
    public contentUrl: string,

    public contentType: ContentType,
    public blobType: string,

    public createdDate = new Date(),

    public metadata?: object,
    public id?: ObjectId,
  ) {}
}

export enum ContentType {
  audio = 'audio',
  link = 'link',
  image = 'image',
  code = 'code',
}

export function isUrlImage(url: string) {
  return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
}
