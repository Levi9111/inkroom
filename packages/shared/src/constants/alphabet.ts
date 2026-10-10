/**
 * Unambiguous alphabet excluding glyphs easily confused by teachers and students
 * (0/O, 1/I/L).
 */
export const ROOM_CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

export function generateRoomCode(length = 8): string {
  let result = '';
  const alphabetLength = ROOM_CODE_ALPHABET.length;
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * alphabetLength);
    result += ROOM_CODE_ALPHABET[randomIndex];
  }
  return result;
}

export function sanitizeRoomCode(code: string): string {
  return code.toUpperCase().replace(/[\s-]/g, '');
}
