// TODO: enforce this or the other sort of thing for the class
// type INirvanaResponse<T> =
//   | {
//       data: T;
//       error?: Error;
//     }
//   | { data?: T; error: Error };

export default class NirvanaResponse<T> {
  data?: T;
  error?: Error;

  constructor(_data: T, _error?: Error) {
    this.data = _data;
    this.error = _error;
  }
}
