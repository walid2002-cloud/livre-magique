export type ExamChoice = { id: string; label: string };

export type ExamQuestion = {
  id: string;
  prompt: string;
  choices: ExamChoice[];
  answer: string;
  why: string;
};

export type Exam = {
  title: string;
  intro: string;
  questions: ExamQuestion[];
};

export function studyUnit(code: string) {
  if (code === "LAN" || code === "PE") return { one: "Leçon", many: "leçons" };
  if (code === "EX") return { one: "Sujet", many: "sujets" };
  return { one: "Chapitre", many: "chapitres" };
}

const q = (
  id: string,
  prompt: string,
  answer: string,
  why: string,
  choices: [string, string, string, string],
): ExamQuestion => ({
  id,
  prompt,
  answer,
  why,
  choices: choices.map((label, index) => ({ id: String.fromCharCode(97 + index), label })),
});

const EXAMS: Record<string, Exam> = {
  BAM: {
    title: "Examen sur La Boîte à merveilles",
    intro: "Six questions sur toute l'œuvre. Choisis une réponse : l'agent te dit tout de suite si elle tient.",
    questions: [
      q(
        "bam-1",
        "Qui raconte La Boîte à merveilles ?",
        "b",
        "Le récit est porté par un enfant de Fès, qui se souvient. Ce n'est pas un narrateur extérieur, ni la mère.",
        [
          "Un narrateur extérieur, qui ne participe pas à l'histoire",
          "Un enfant de Fès, qui raconte ses souvenirs",
          "Lalla Zoubida, la mère",
          "Un adulte qui visite la ville pour la première fois",
        ],
      ),
      q(
        "bam-2",
        "À quoi sert la boîte à merveilles ?",
        "a",
        "Les objets sont pauvres aux yeux d'un adulte. Pour l'enfant, ils gardent l'émerveillement et la mémoire.",
        [
          "Elle garde de petits objets qui deviennent des souvenirs",
          "Elle sert à cacher l'argent du père",
          "C'est une boîte à bijoux que la mère veut vendre",
          "Elle contient le journal intime du narrateur",
        ],
      ),
      q(
        "bam-3",
        "Quel espace compte le plus dans le regard de l'enfant ?",
        "c",
        "La maison, la terrasse et le quartier ne sont pas un décor. L'enfant y apprend le monde.",
        [
          "L'école française, seulement",
          "La campagne, loin de Fès",
          "La maison, la terrasse et le quartier",
          "Le palais, où la famille est invitée",
        ],
      ),
      q(
        "bam-4",
        "Comment le livre montre-t-il la mère ?",
        "d",
        "Lalla Zoubida est la tendresse et le quotidien. Le livre ne la réduit pas à un personnage comique.",
        [
          "Comme une femme indifférente à son fils",
          "Comme une étrangère de passage",
          "Comme la narratrice du roman",
          "Comme une présence tendre, au cœur du quotidien",
        ],
      ),
      q(
        "bam-5",
        "Que révèle la pauvreté dans le roman ?",
        "b",
        "L'argent manque, et avec lui vient la honte. Le père tient à sa dignité malgré cela.",
        [
          "Elle n'a aucune importance : la famille est à l'aise",
          "Elle blesse la dignité du père et pèse sur la maison",
          "Elle est racontée comme une aventure joyeuse",
          "Elle concerne seulement les voisins",
        ],
      ),
      q(
        "bam-6",
        "Quel passage le livre fait-il vivre au narrateur ?",
        "a",
        "On va de la merveille enfantine vers un réel plus dur. Le roman ne reste pas dans le seul jeu.",
        [
          "De l'émerveillement de l'enfance vers un réel plus dur",
          "D'une vie riche vers un exil volontaire",
          "De Fès vers Paris, dès le premier chapitre",
          "D'un récit fantastique vers un conte",
        ],
      ),
    ],
  },
  ANT: {
    title: "Examen sur Antigone",
    intro: "Six questions sur toute la pièce. Une seule réponse convient. L'agent corrige dès que tu as choisi.",
    questions: [
      q(
        "ant-1",
        "Que fait le prologue ?",
        "c",
        "Le prologue présente les personnages et dit déjà la fin. Dans la tragédie, personne n'échappe à son rôle.",
        [
          "Il raconte la guerre de Troie en détail",
          "Il laisse le spectateur découvrir la fin sans indice",
          "Il présente les personnages et annonce que leur sort est déjà fixé",
          "Il est prononcé par Créon seul, après la mort d'Antigone",
        ],
      ),
      q(
        "ant-2",
        "Pourquoi Antigone veut-elle enterrer Polynice ?",
        "a",
        "Elle enterre son frère par devoir, contre l'édit de Créon. Ce n'est pas une manœuvre pour prendre le pouvoir.",
        [
          "Par devoir envers son frère, malgré l'interdiction",
          "Pour devenir reine à la place de Créon",
          "Parce qu'Ismène le lui a ordonné",
          "Pour fuir Thèbes avec Hémon",
        ],
      ),
      q(
        "ant-3",
        "Que représente Créon face à Antigone ?",
        "b",
        "Créon dit oui à l'ordre et au bonheur possible. Antigone dit non. Le conflit est là.",
        [
          "Il partage le refus d'Antigone dès la première scène",
          "Il défend l'ordre de la cité et le « oui » à la vie comme elle est",
          "Il est le chœur, et ne décide de rien",
          "Il ignore l'édit et laisse enterrer Polynice",
        ],
      ),
      q(
        "ant-4",
        "Quelle est l'attitude d'Ismène ?",
        "d",
        "Ismène a peur et refuse d'abord. Plus tard, elle voudra partager le sort de sa sœur. Antigone ne la laisse pas faire.",
        [
          "Elle enterre Polynice avant Antigone",
          "Elle tue Créon pour sauver sa sœur",
          "Elle quitte Thèbes sans rien dire",
          "Elle refuse d'abord, par peur, puis veut partager la faute",
        ],
      ),
      q(
        "ant-5",
        "Que refuse Antigone dans le dialogue avec Créon ?",
        "c",
        "Créon lui propose de vivre, de se marier, d'être heureuse. Elle refuse ce bonheur-là. Elle veut « tout, tout de suite ».",
        [
          "Elle refuse de revoir Ismène",
          "Elle refuse que Hémon soit son fiancé",
          "Elle refuse le bonheur raisonnable que Créon lui propose",
          "Elle refuse de dire son nom",
        ],
      ),
      q(
        "ant-6",
        "Comment la pièce se termine-t-elle pour la ville ?",
        "b",
        "Antigone, Hémon et Eurydice meurent. Les gardes reprennent leur partie. La vie ordinaire continue, et c'est cela qui est tragique.",
        [
          "Créon pardonne, et Antigone épouse Hémon",
          "Les morts s'accumulent, puis la vie ordinaire reprend",
          "Le chœur annule l'édit et enterre Polynice en public",
          "Ismène devient reine et clôt la tragédie",
        ],
      ),
    ],
  },
  DJC: {
    title: "Examen sur Le Dernier Jour d'un condamné",
    intro: "Six questions sur tout le récit. L'agent te reprend si la réponse glisse à côté du texte.",
    questions: [
      q(
        "djc-1",
        "Pourquoi le condamné n'a-t-il pas de nom ?",
        "a",
        "Sans nom, il peut être n'importe quel homme. Hugo ne veut pas d'un fait divers : il vise la peine elle-même.",
        [
          "Pour que tout lecteur puisse se mettre à sa place",
          "Parce que Hugo a oublié de le nommer",
          "Parce que le récit est un rapport de police",
          "Parce que le personnage est un enfant",
        ],
      ),
      q(
        "djc-2",
        "Contre quoi ce livre est-il écrit ?",
        "c",
        "Le journal des dernières heures est un réquisitoire contre la peine de mort, pas un roman d'évasion.",
        [
          "Contre l'école de la IIIe République",
          "Contre le roman réaliste",
          "Contre la peine de mort",
          "Contre la presse, seulement",
        ],
      ),
      q(
        "djc-3",
        "Quelle forme Hugo choisit-il ?",
        "b",
        "On lit le journal intérieur d'un homme qui compte les heures. Ce n'est ni un plaidoyer d'avocat au tribunal, ni une biographie de Hugo.",
        [
          "Une pièce de théâtre en cinq actes",
          "Le journal d'un homme qui attend l'exécution",
          "Une lettre ouverte adressée au roi, chapitre après chapitre",
          "Un conte fantastique",
        ],
      ),
      q(
        "djc-4",
        "Que fait le récit du crime ?",
        "d",
        "Hugo refuse le spectacle du crime. Si l'on connaissait le détail, on jugerait l'homme au lieu de juger le supplice.",
        [
          "Il le raconte dès la première page, avec précision",
          "Il innocente le condamné grâce à un témoin",
          "Il le fait avouer devant le prêtre, en détail",
          "Il le laisse dans l'ombre, pour qu'on juge la peine et non le fait divers",
        ],
      ),
      q(
        "djc-5",
        "À quoi sert la scène avec la petite fille ?",
        "a",
        "La visite rend concret ce que la mort va couper : un lien, une enfant, une vie qui continue sans lui.",
        [
          "Elle montre ce que le condamné va perdre",
          "Elle prouve qu'il est innocent",
          "Elle annonce que l'exécution est annulée",
          "Elle sert de scène comique avant la fin",
        ],
      ),
      q(
        "djc-6",
        "Comment le texte s'achève-t-il ?",
        "c",
        "Le journal s'interrompt à l'heure dite. Il n'y a ni pardon ni description complaisante de l'échafaud.",
        [
          "Par un acquittement",
          "Par un long discours du bourreau",
          "Par l'heure de l'exécution, sans récit du supplice",
          "Par le mariage de sa fille",
        ],
      ),
    ],
  },
  LAN: {
    title: "Examen de langue",
    intro: "Cinq questions sur les outils du cours. Une réponse juste, puis la correction.",
    questions: [
      q(
        "lan-1",
        "Dans « Elle affirme qu'elle viendra », comment la parole est-elle rapportée ?",
        "b",
        "La parole est intégrée à la phrase, avec « que ». Ce n'est pas du discours direct : il n'y a ni deux-points ni guillemets.",
        [
          "Au discours direct",
          "Au discours indirect",
          "Au discours indirect libre, sans verbe introducteur",
          "Ce n'est pas une parole rapportée",
        ],
      ),
      q(
        "lan-2",
        "Quelle phrase exprime le but ?",
        "a",
        "« Pour que » vise un résultat visé, avec le subjonctif. « Parce que » donne la cause. « Bien que » donne la concession.",
        [
          "Il répète pour que la règle reste en mémoire.",
          "Il répète parce que la règle est difficile.",
          "Il répète bien que la règle soit simple.",
          "Il répète, donc il progresse.",
        ],
      ),
      q(
        "lan-3",
        "« Bien qu'il soit fatigué, il finit le devoir. » Quel rapport logique ?",
        "c",
        "La fatigue devrait l'arrêter, et pourtant il continue. C'est une concession. « Bien que » demande le subjonctif.",
        [
          "La cause",
          "La conséquence",
          "La concession",
          "Le but",
        ],
      ),
      q(
        "lan-4",
        "Quelle reformulation nominalise l'idée « Les élèves protestent » ?",
        "d",
        "Le verbe « protester » devient le nom « protestation ». La phrase gagne en densité, sans changer le fait.",
        [
          "Les élèves sont en train de protester.",
          "Pourquoi les élèves protestent-ils ?",
          "Les élèves protestent beaucoup.",
          "La protestation des élèves surprend le professeur.",
        ],
      ),
      q(
        "lan-5",
        "« Cet argument est fragile. » Le mot « fragile » est surtout…",
        "b",
        "« Fragile » juge la solidité de l'argument. Ce n'est pas un simple synonyme de « long » ou de « nouveau ».",
        [
          "Un connecteur logique",
          "Un mot du jugement",
          "Une conjonction de but",
          "Un verbe de parole",
        ],
      ),
    ],
  },
  PE: {
    title: "Examen de production écrite",
    intro: "Cinq questions de méthode. L'agent vérifie que tu sais construire la copie, pas seulement la commencer.",
    questions: [
      q(
        "pe-1",
        "Que faut-il repérer en premier dans un sujet ?",
        "b",
        "Avant d'écrire, tu identifies le thème, la consigne et le type de texte demandé. Le premier exemple venu ne suffit pas.",
        [
          "Le nombre de lignes déjà écrites par les autres",
          "Le thème, la consigne et le type de texte",
          "Uniquement le premier mot du sujet",
          "La conclusion, que tu recopies ensuite dans l'introduction",
        ],
      ),
      q(
        "pe-2",
        "Dans un plan dialectique, quel ordre est juste ?",
        "a",
        "Thèse, antithèse, puis une synthèse qui dépasse l'opposition. La synthèse n'est pas une répétition de la thèse.",
        [
          "Thèse, antithèse, synthèse",
          "Exemple, titre, dictionnaire",
          "Conclusion, puis introduction, puis récit",
          "Antithèse seule, sans thèse",
        ],
      ),
      q(
        "pe-3",
        "Que contient un paragraphe développé ?",
        "c",
        "Une idée, expliquée, appuyée par un exemple, puis un bref retour au sujet. Une seule phrase ne fait pas un paragraphe.",
        [
          "Une citation sans lien avec le sujet",
          "Seulement des exemples, sans idée directrice",
          "Une idée, son explication, un exemple et un retour au sujet",
          "La reprise mot pour mot de l'introduction",
        ],
      ),
      q(
        "pe-4",
        "À quoi sert l'introduction ?",
        "d",
        "Tu entres dans le sujet, tu poses le problème et tu annonces le plan. Tu ne donnes pas encore toute la réponse.",
        [
          "À raconter ta journée",
          "À donner la réponse finale dès la première ligne",
          "À copier le sujet sans rien ajouter",
          "À amener le sujet, poser le problème et annoncer le plan",
        ],
      ),
      q(
        "pe-5",
        "Que doit faire la conclusion ?",
        "a",
        "Tu replies le devoir : un bilan, puis une ouverture. Tu ne recommences pas l'introduction telle quelle.",
        [
          "Faire le bilan et ouvrir, sans recopier l'introduction",
          "Ajouter un nouvel argument jamais annoncé",
          "Changer de sujet pour surprendre le correcteur",
          "S'arrêter au milieu d'un exemple",
        ],
      ),
    ],
  },
  EX: {
    title: "Examen de méthode",
    intro: "Cinq questions pour l'examen régional. La méthode compte autant que le cours.",
    questions: [
      q(
        "ex-1",
        "Par quoi commencer le jour de l'examen ?",
        "c",
        "Tu lis tout le sujet, tu repères les barèmes et tu répartis le temps. Tu n'écris pas avant d'avoir vu l'ensemble.",
        [
          "Par la rédaction, avant de lire les questions",
          "Par la question qui semble la plus longue, sans regarder le reste",
          "Par une lecture complète du sujet et un partage du temps",
          "Par une page recopiée depuis le brouillon du voisin",
        ],
      ),
      q(
        "ex-2",
        "Dans une question sur un texte, que faut-il faire ?",
        "a",
        "Tu cites le passage utile, puis tu l'expliques. Une citation seule, ou un avis sans le texte, ne répond pas à la question.",
        [
          "Citer le texte, puis expliquer ce que la citation montre",
          "Donner ton avis sans revenir au texte",
          "Résumer ta vie à la place du passage",
          "Recopier tout le texte, ligne après ligne",
        ],
      ),
      q(
        "ex-3",
        "Comment annoncer un développement ?",
        "b",
        "Le plan se voit dès l'introduction. Le correcteur doit savoir où tu vas avant les exemples.",
        [
          "En cachant le plan jusqu'à la conclusion",
          "En annonçant clairement les étapes du devoir",
          "En changeant d'avis à chaque paragraphe",
          "En écrivant une seule phrase pour tout le sujet",
        ],
      ),
      q(
        "ex-4",
        "Une question de langue se traite comment ?",
        "d",
        "Tu nommes l'outil, tu montres la forme dans la phrase, puis tu donnes le sens ou l'effet. La définition seule ne suffit pas.",
        [
          "En donnant seulement un synonyme, sans la phrase",
          "En sautant la question : elle ne compte pas",
          "En racontant la leçon entière, sans exemple",
          "En nommant l'outil, en le montrant dans la phrase et en disant son effet",
        ],
      ),
      q(
        "ex-5",
        "Que faire dans les dernières minutes ?",
        "a",
        "Tu relis, tu corriges la syntaxe et les oublis. Tu ne réécris pas tout le devoir à la hâte.",
        [
          "Relire, corriger les fautes et vérifier que chaque question a une réponse",
          "Changer de sujet",
          "Effacer l'introduction",
          "Ajouter une page hors sujet pour allonger la copie",
        ],
      ),
    ],
  },
};

export function examFor(code: string) {
  return EXAMS[code.toUpperCase()] ?? null;
}
