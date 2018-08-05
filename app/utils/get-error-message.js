import { capitalize } from "@orbit/utils";

export default function getErrorMessage(exception) {
  const { data } = exception;
  const { errors } = data;
  if (!errors || errors.length === 0) { return null; }

  const [error] = errors;
  const { title, detail } = error;
  if (!title && !detail) { return null; }

  return title || capitalize(detail);
}
