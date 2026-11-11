export function isOpeningChapter(
  lesson: { partId: string; ordre: number },
  lessons: { partId: string; ordre: number }[],
) {
  const siblings = lessons.filter((item) => item.partId === lesson.partId);
  const first = Math.min(...siblings.map((item) => item.ordre));
  return lesson.ordre === first;
}

export function hasFullBook(student: { acces?: "chapitre" | "complet" } | null) {
  return Boolean(student) && student?.acces !== "chapitre";
}

export function isStory(code: string) {
  return code === "BAM" || code === "ANT" || code === "DJC";
}
