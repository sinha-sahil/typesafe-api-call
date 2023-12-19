import { isJSON, decodeNumber, decodeString } from 'type-decoder';

export type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

export function decodePost(rawInput: unknown): Post | null {
  if (isJSON(rawInput)) {
    const userId =  decodeNumber(rawInput.userId);
    const id =  decodeNumber(rawInput.id);
    const title =  decodeString(rawInput.title);
    const body =  decodeString(rawInput.body);

    if (
      userId === null ||
      id === null ||
      title === null ||
      body === null
    ) {
      return null;
    }

    return {
      userId,
      id,
      title,
      body,
    };
  }
  return null;
}

export type CreatePostResponse = {
  id: number;
};

export function decodeCreatePostResponse(rawInput: unknown): CreatePostResponse | null {
  if (isJSON(rawInput)) {
    const id =  decodeNumber(rawInput.id);

    if (
      id === null
    ) {
      return null;
    }

    return {
      id,
    };
  }
  return null;
}



