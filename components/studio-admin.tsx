"use client";

import { FormEvent, useState } from "react";
import { putFile } from "@/lib/files";
import { useApp } from "@/lib/store";
import type { PracticeQuiz, Studio } from "@/lib/types";

export function StudioAdmin() {
  const { db, saveStudio, answerTeacher } = useApp();
  const studio = db.studio;
  const [note, setNote] = useState("");

  function write(next: Studio) {
    const result = saveStudio(next);
    setNote(result.ok ? "Enregistré." : result.error);
  }

  return (
    <section className="grid gap-4">
      <h2 className="font-display text-2xl">Contenus à publier</h2>
      <p className="text-sm text-[var(--ink-soft)]">Rien n'est affiché aux élèves tant que tu ne l'enregistres pas. Pas de statistique ni d'avis inventé.</p>
      {note && <p className="text-sm">{note}</p>}
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={studio.questionsOuvertes}
          onChange={(event) => write({ ...studio, questionsOuvertes: event.target.checked })}
        />
        Autoriser « Poser une question à Maître »
      </label>
      <Media studio={studio} onSave={write} />
      <FaqForm studio={studio} onSave={write} />
      <SimpleList
        title="Erreurs qui font perdre des points"
        onAdd={(titre, faux, juste, noteText) => write({
          ...studio,
          mistakes: [...studio.mistakes, { id: crypto.randomUUID(), titre, faux, juste, note: noteText }],
        })}
        rows={studio.mistakes.map((item) => item.titre)}
        onRemove={(index) => write({ ...studio, mistakes: studio.mistakes.filter((_, i) => i !== index) })}
      />
      <WritingForm studio={studio} onSave={write} />
      <PathForm studio={studio} onSave={write} />
      <QuizForm studio={studio} onSave={write} />
      <div className="grid gap-2">
        <h3 className="font-display text-xl">Questions des élèves</h3>
        {studio.questions.length === 0 && <p className="text-sm text-[var(--ink-soft)]">Aucune question.</p>}
        {studio.questions.map((item) => (
          <Question key={item.id} texte={item.texte} reponse={item.reponse} prenom={item.prenom} onSave={(reponse) => answerTeacher(item.id, reponse)} />
        ))}
      </div>
    </section>
  );
}

function Media({ studio, onSave }: { studio: Studio; onSave: (studio: Studio) => void }) {
  return (
    <div className="card grid gap-2 p-4">
      <h3 className="font-display text-xl">Photo et vidéo de bienvenue</h3>
      <p className="text-sm text-[var(--ink-soft)]">Sans nouveau fichier, le portrait déjà déposé reste affiché. La vidéo n'apparaît que si tu en déposes une.</p>
      <input type="file" accept="image/*" onChange={async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const id = `welcome_photo_${crypto.randomUUID()}`;
        await putFile(id, file);
        onSave({ ...studio, welcomePhotoId: id });
      }} />
      <input type="file" accept="video/*" onChange={async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const id = `welcome_video_${crypto.randomUUID()}`;
        await putFile(id, file);
        onSave({ ...studio, welcomeVideoId: id });
      }} />
    </div>
  );
}

function FaqForm({ studio, onSave }: { studio: Studio; onSave: (studio: Studio) => void }) {
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const [qAr, setQAr] = useState("");
  const [aAr, setAAr] = useState("");
  return (
    <form className="card grid gap-2 p-4" onSubmit={(event: FormEvent) => {
      event.preventDefault();
      if (!q.trim() || !a.trim()) return;
      onSave({ ...studio, faq: [...studio.faq, { id: crypto.randomUUID(), q, a, qAr, aAr }] });
      setQ(""); setA(""); setQAr(""); setAAr("");
    }}>
      <h3 className="font-display text-xl">FAQ supplémentaire</h3>
      <input className="field" placeholder="Question" value={q} onChange={(event) => setQ(event.target.value)} />
      <textarea className="field" placeholder="Réponse" value={a} onChange={(event) => setA(event.target.value)} />
      <input className="field" placeholder="السؤال" dir="rtl" value={qAr} onChange={(event) => setQAr(event.target.value)} />
      <textarea className="field" placeholder="الجواب" dir="rtl" value={aAr} onChange={(event) => setAAr(event.target.value)} />
      <button className="btn btn-soft w-fit" type="submit">Ajouter</button>
      {studio.faq.map((item, index) => (
        <button key={item.id} type="button" className="text-start text-sm" onClick={() => onSave({ ...studio, faq: studio.faq.filter((_, i) => i !== index) })}>
          Retirer · {item.q}
        </button>
      ))}
    </form>
  );
}

function SimpleList({
  title, onAdd, rows, onRemove,
}: {
  title: string;
  onAdd: (titre: string, faux: string, juste: string, note: string) => void;
  rows: string[];
  onRemove: (index: number) => void;
}) {
  const [titre, setTitre] = useState("");
  const [faux, setFaux] = useState("");
  const [juste, setJuste] = useState("");
  const [note, setNote] = useState("");
  return (
    <form className="card grid gap-2 p-4" onSubmit={(event) => {
      event.preventDefault();
      if (!titre.trim() || !faux.trim() || !juste.trim()) return;
      onAdd(titre, faux, juste, note);
      setTitre(""); setFaux(""); setJuste(""); setNote("");
    }}>
      <h3 className="font-display text-xl">{title}</h3>
      <input className="field" placeholder="Titre" value={titre} onChange={(event) => setTitre(event.target.value)} />
      <textarea className="field" placeholder="Exemple à corriger" value={faux} onChange={(event) => setFaux(event.target.value)} />
      <textarea className="field" placeholder="Correction" value={juste} onChange={(event) => setJuste(event.target.value)} />
      <input className="field" placeholder="Commentaire" value={note} onChange={(event) => setNote(event.target.value)} />
      <button className="btn btn-soft w-fit" type="submit">Ajouter</button>
      {rows.map((row, index) => (
        <button key={row} type="button" className="text-start text-sm" onClick={() => onRemove(index)}>Retirer · {row}</button>
      ))}
    </form>
  );
}

function WritingForm({ studio, onSave }: { studio: Studio; onSave: (studio: Studio) => void }) {
  const [titre, setTitre] = useState("");
  const [copie, setCopie] = useState("");
  const [commentaire, setCommentaire] = useState("");
  return (
    <form className="card grid gap-2 p-4" onSubmit={(event) => {
      event.preventDefault();
      if (!titre.trim() || !copie.trim() || !commentaire.trim()) return;
      onSave({ ...studio, writings: [...studio.writings, { id: crypto.randomUUID(), titre, copie, commentaire }] });
      setTitre(""); setCopie(""); setCommentaire("");
    }}>
      <h3 className="font-display text-xl">Copies d'exemple</h3>
      <input className="field" placeholder="Titre" value={titre} onChange={(event) => setTitre(event.target.value)} />
      <textarea className="field" placeholder="Copie" value={copie} onChange={(event) => setCopie(event.target.value)} />
      <textarea className="field" placeholder="Commentaire pédagogique" value={commentaire} onChange={(event) => setCommentaire(event.target.value)} />
      <button className="btn btn-soft w-fit" type="submit">Ajouter</button>
    </form>
  );
}

function PathForm({ studio, onSave }: { studio: Studio; onSave: (studio: Studio) => void }) {
  const [jours, setJours] = useState<7 | 15 | 30>(7);
  const [codes, setCodes] = useState("");
  return (
    <form className="card grid gap-2 p-4" onSubmit={(event) => {
      event.preventDefault();
      const list = codes.split(/[\s,]+/).map((item) => item.trim().toUpperCase()).filter(Boolean);
      if (list.length === 0) return;
      onSave({ ...studio, paths: [...studio.paths, { id: crypto.randomUUID(), jours, codes: list }] });
      setCodes("");
    }}>
      <h3 className="font-display text-xl">Parcours 7, 15 ou 30 jours</h3>
      <select className="field" value={jours} onChange={(event) => setJours(Number(event.target.value) as 7 | 15 | 30)}>
        <option value={7}>7 jours</option>
        <option value={15}>15 jours</option>
        <option value={30}>30 jours</option>
      </select>
      <input className="field" placeholder="Codes existants, par exemple BAM-01 LAN-02" value={codes} onChange={(event) => setCodes(event.target.value)} />
      <button className="btn btn-soft w-fit" type="submit">Ajouter</button>
    </form>
  );
}

function QuizForm({ studio, onSave }: { studio: Studio; onSave: (studio: Studio) => void }) {
  const [kind, setKind] = useState<PracticeQuiz["kind"]>("teste");
  const [titre, setTitre] = useState("");
  const [prompt, setPrompt] = useState("");
  const [choices, setChoices] = useState("");
  const [answer, setAnswer] = useState("1");
  const [why, setWhy] = useState("");
  return (
    <form className="card grid gap-2 p-4" onSubmit={(event) => {
      event.preventDefault();
      const options = choices.split("\n").map((item) => item.trim()).filter(Boolean);
      const index = Number(answer) - 1;
      if (!prompt.trim() || options.length < 2 || index < 0 || index >= options.length || !why.trim()) return;
      const question = { prompt, choices: options, answer: index, why };
      const existing = studio.quizzes.find((quiz) => quiz.kind === kind);
      onSave({
        ...studio,
        quizzes: existing
          ? studio.quizzes.map((quiz) => (quiz.kind === kind ? { ...quiz, titre: titre || quiz.titre, questions: [...quiz.questions, question] } : quiz))
          : [...studio.quizzes, { id: crypto.randomUUID(), kind, titre: titre || prompt, questions: [question] }],
      });
      setPrompt(""); setChoices(""); setWhy("");
    }}>
      <h3 className="font-display text-xl">QCM administrable</h3>
      <select className="field" value={kind} onChange={(event) => setKind(event.target.value as PracticeQuiz["kind"])}>
        <option value="teste">Teste-toi</option>
        <option value="defi">Défi du jour (5 questions minimum pour l'afficher)</option>
        <option value="decouverte">Examen de découverte</option>
      </select>
      <input className="field" placeholder="Titre" value={titre} onChange={(event) => setTitre(event.target.value)} />
      <textarea className="field" placeholder="Question" value={prompt} onChange={(event) => setPrompt(event.target.value)} />
      <textarea className="field" placeholder={"Choix, un par ligne"} value={choices} onChange={(event) => setChoices(event.target.value)} />
      <input className="field" inputMode="numeric" aria-label="Numéro de la bonne réponse" value={answer} onChange={(event) => setAnswer(event.target.value)} />
      <textarea className="field" placeholder="Explication" value={why} onChange={(event) => setWhy(event.target.value)} />
      <button className="btn btn-soft w-fit" type="submit">Ajouter cette question</button>
    </form>
  );
}

function Question({ texte, reponse, prenom, onSave }: { texte: string; reponse: string; prenom: string; onSave: (reponse: string) => void }) {
  const [value, setValue] = useState(reponse);
  return (
    <form className="card grid gap-2 p-3" onSubmit={(event) => { event.preventDefault(); onSave(value); }}>
      <p className="text-sm"><strong>{prenom}</strong> · {texte}</p>
      <textarea className="field" value={value} onChange={(event) => setValue(event.target.value)} />
      <button className="btn btn-soft w-fit" type="submit">Répondre</button>
    </form>
  );
}
