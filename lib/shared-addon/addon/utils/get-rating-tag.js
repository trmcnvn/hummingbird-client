export default function getRatingTag(rating) {
  if (rating > 0 && rating < 4) {
    return 'awful';
  } else if (rating >= 4 && rating < 7) {
    return 'meh';
  } else if (rating >= 7 && rating < 10) {
    return 'good';
  }
  return 'great';
}
