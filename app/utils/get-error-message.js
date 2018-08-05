import { capitalize } from "@orbit/utils";

export default function getErrorMessage(exception) {
  try {
    const { data } = exception;
    if (!data) { return null; }

    const { errors } = data;
    if (!errors || errors.length === 0) { return null; }

    const [error] = errors;
    const { title, detail } = error;
    if (!title && !detail) { return null; }

    return title || capitalize(detail);
  } catch (error) {
    return null;
  }
}
