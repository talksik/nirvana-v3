// TODO: enforce this or the other sort of thing for the class
// type INirvanaResponse<T> =
//   | {
//       data: T;
//       error?: Error;
//     }
//   | { data?: T; error: Error };

export interface INirvanaResponse<T> {
  data?: T;
  error?: Error;
  message?: string;
}

export default class NirvanaResponse<T> implements INirvanaResponse<T> {
  data?: T;
  error?: Error;
  message?: string;

  constructor(_data: T, _error?: Error, _message?: string) {
    this.data = _data;
    this.error = _error;

    this.message = _message;
  }
}
