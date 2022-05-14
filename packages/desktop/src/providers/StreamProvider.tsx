/**
 * take in the rooms
 * which ones am I in
 * on mounting, call all other folks
 *
 * on someone untuning from a line and they are not in any other lines
 * if they are in the peer connections that we have stored, then destroy them and remove them
 *
 * on someone tuning into a line, they are seen in the list of ids for me
 * if they are not in my local peers storage then I want to initiate connections so that I can communicate with them
 *
 *
 * on me untuning from a line, we need to destroy the right one from the store of peers and destroy the connection
 *
 *
 * on me changing my media devices, I need to replace stream for all peer connections so that they get a whole new set
 *
 *
 * listen for any calls to me, as well as any answers back to me
 */
