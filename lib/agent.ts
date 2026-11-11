import type { AgentSource } from "./types";

const STOP = new Set(
  "les des une aux pour que qui quoi dans avec sans est pas plus tres très mon ton tes ses son sur par une du au ce cet cette cela comme quand mais donc car oui non".split(" "),
);

function words(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2 && !STOP.has(word));
}

function sentences(text: string) {
  return text
    .split(/(?=Question\s*:)/i)
    .flatMap((chunk) => {
      const trimmed = chunk.trim();
      if (!trimmed) return [];
      if (/^Question\s*:/i.test(trimmed)) return [trimmed];
      return trimmed
        .split(/(?<=[.!?])\s+|\n+/)
        .map((sentence) => sentence.trim())
        .filter((sentence) => sentence.length > 12);
    });
}

export function askAgent(question: string, sources: AgentSource[], lessonCode: string) {
  const asked = question.trim();
  if (asked.length < 2) return "Écris ta question.";
  if (/^(bonjour|salut|salam|hello|bonsoir)\b/i.test(asked) && words(asked).length < 2) {
    return sources.length
      ? `Je suis l'agent de ${lessonCode}. Pose ta question : je réponds avec le cours et la correction déposés par l'admin.`
      : `Je suis l'agent de ${lessonCode}. L'admin n'a pas encore déposé de PDF ni de correction.`;
  }
  if (sources.length === 0) {
    return `Cette leçon n'a pas encore de document. L'admin peut déposer le PDF et la correction.`;
  }

  const wantsCorrection = /\b(corrig\w*|r[ée]ponses?|solution|exercice)s?\b/i.test(asked);
  const askedWords = words(asked);
  const hits = sources.flatMap((source) => {
    const kindBoost = wantsCorrection ? (source.kind === "correction" ? 3 : 0) : source.kind === "cours" ? 1 : 0;
    return sentences(source.texte).map((sentence) => {
      const known = new Set(words(sentence));
      let score = kindBoost;
      for (const word of askedWords) if (known.has(word)) score += 2;
      return { score, sentence, source };
    });
  });
  hits.sort((a, b) => b.score - a.score);
  const preferred = wantsCorrection ? hits.filter((hit) => hit.source.kind === "correction") : hits;
  const best = (preferred.some((hit) => hit.score >= 2) ? preferred : hits).filter((hit) => hit.score >= 2).slice(0, 3);
  if (best.length === 0) {
    return `Je ne trouve pas ça dans les documents de ${lessonCode}. Reformule, ou demande à l'admin d'ajouter la page.`;
  }

  const lines = best.map((hit) => {
    const label = hit.source.kind === "correction" ? "La correction" : "Le cours";
    return `${label} « ${hit.source.titre} » : ${hit.sentence}`;
  });
  const close = wantsCorrection
    ? "Vérifie avec ta copie avant de recopier."
    : "Appuie-toi sur ces phrases pour répondre avec tes mots.";
  return [`Voici ce que je lis pour ${lessonCode}.`, ...lines, close].join("\n\n");
}
