import * as path from 'path';
import * as fs from 'fs';

export function readPrivateKey() {
  return fs.readFileSync(path.join(__dirname, './private.pem')).toString();
}

export function readPublicKey() {
  return fs.readFileSync(path.join(__dirname, './public.pem')).toString();
}
