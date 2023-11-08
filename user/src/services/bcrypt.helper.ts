import { compare, hash } from 'bcrypt';

export class Bcrypt {
  private static readonly SALT_ROUNDS: number = 10;

  public static async hash(target: string): Promise<string> {
    return await hash(target, this.SALT_ROUNDS);
  }

  public static async compare(
    target: string,
    hashed: string,
  ): Promise<boolean> {
    return await compare(target, hashed);
  }
}
