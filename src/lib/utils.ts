import strftime from "strftime";

const utc = strftime.utc(); // YAML dates are in UTC

export function formatTime(format: string, date: Date | string): string {
  return utc(format, new Date(date));
}

// A soft-hide switch for content frontmatter: set `visible: false` to pull
// something off the live site without deleting the file. Defaults to visible
// when the field is omitted entirely.
export function isVisible(data: { visible?: boolean }): boolean {
  return data.visible !== false;
}
