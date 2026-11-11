export type Figure = { nom: string; nomAr: string; fr: string; ar: string };
export type ChapterNote = { fr: string; ar: string; figures: Figure[] };

const NOTES: Record<string, ChapterNote> = {
  "BAM-01": {
    fr: "Ahmed Sefrioui ouvre le livre sur Fès, vue par un enfant et racontée par l'adulte qui s'en souvient. La ville n'est pas un décor : ruelles, seuils, voix et lumière forment le monde où tout va se jouer. Ce chapitre pose le pacte du récit. On entre dans une mémoire, pas dans un reportage. Le merveilleux commence parce que le regard de l'enfant agrandit ce que les grandes personnes traversent sans s'arrêter.",
    ar: "يفتتح أحمد الصفريوي الكتاب على فاس كما يراها طفل ويرويها الراشد الذي يتذكّر. المدينة ليست ديكورًا: الأزقّة والعتبات والأصوات والضوء هي العالم الذي ستجري فيه الحكاية. يضع هذا الفصل ميثاق السرد. ندخل ذاكرة، لا تحقيقًا صحفيًا. يبدأ العجب لأن نظرة الطفل تكبّر ما يمرّ به الكبار دون أن يتوقّفوا.",
    figures: [
      { nom: "Métaphore", nomAr: "استعارة", fr: "On dit une chose par une autre, sans outil de comparaison. Exemple : « Fès est un livre dont l'enfant tourne les pages avec ses pas. »", ar: "نقول شيئًا بشيء آخر من غير أداة تشبيه. مثال: « فاس كتاب يقلّب الطفل صفحاته بخطواته. »" },
      { nom: "Comparaison", nomAr: "تشبيه", fr: "On rapproche deux éléments avec un mot outil. Exemple : « Les ruelles se plient comme des rubans trop longs pour la main. »", ar: "نقرّب عنصرين بأداة. مثال: « تنثني الأزقّة كأشرطة أطول من اليد. »" },
      { nom: "Personnification", nomAr: "تشخيص", fr: "Une chose reçoit un geste humain. Exemple : « La ville veille sur ceux qui rentrent avant la nuit. »", ar: "يُمنح الشيء فعلًا إنسانيًا. مثال: « تسهر المدينة على من يعود قبل الليل. »" },
    ],
  },
  "BAM-02": {
    fr: "Le narrateur est encore un enfant. Il ne comprend pas tout, et c'est précisément cette limite qui fait la vérité du chapitre. Il voit grand ce qui est petit, il prend au sérieux un bruit, une peur, une promesse. L'adulte qui écrit ne corrige pas ce regard : il le protège. Le lecteur apprend ainsi à distinguer le monde des grandes personnes et le monde, plus vaste, de l'enfance.",
    ar: "السارد ما زال طفلًا. لا يفهم كل شيء، وهذا الحدّ بالذات هو صدق الفصل. يرى الصغير كبيرًا، ويأخذ على محمل الجد ضجة أو خوفًا أو وعدًا. الراشد الذي يكتب لا يصحّح هذه النظرة: يحميها. يتعلّم القارئ أن يفرّق بين عالم الكبار وعالم الطفولة الأوسع.",
    figures: [
      { nom: "Hyperbole", nomAr: "مبالغة", fr: "On grossit un sentiment pour le rendre juste à hauteur d'enfant. Exemple : « Une minute d'attente pesait plus lourd qu'une année. »", ar: "نضخّم شعورًا ليصير صادقًا بمقدار الطفل. مثال: « كانت دقيقة الانتظار أثقل من سنة. »" },
      { nom: "Antithèse", nomAr: "طباق", fr: "Deux idées contraires se font face. Exemple : « Les grandes personnes passent, l'enfant demeure. »", ar: "تتعارض فكرتان. مثال: « الكبار يمرّون، والطفل يمكث. »" },
      { nom: "Anaphore", nomAr: "تكرار صدري", fr: "Le même départ de phrase insiste. Exemple : « Il croyait le bruit. Il croyait l'ombre. Il croyait la promesse. »", ar: "تتكرّر بداية الجملة للتوكيد. مثال: « كان يصدّق الضجّة. كان يصدّق الظلّ. كان يصدّق الوعد. »" },
    ],
  },
  "BAM-03": {
    fr: "La maison, la terrasse et le quartier dessinent trois cercles autour de l'enfant. Dedans, on est à l'abri. Sur la terrasse, on regarde sans être encore dans la rue. Dehors, le quartier bruit, juge, appelle. Le chapitre apprend à lire l'espace : chaque seuil change la voix, le corps et la liberté. Fès se construit ici pièce par pièce, avant même que l'intrigue s'alourdisse.",
    ar: "البيت والسطح والحيّ ثلاث دوائر حول الطفل. في الداخل الأمان. على السطح ينظر دون أن يكون بعد في الشارع. في الخارج يضجّ الحيّ ويحكم وينادي. يعلّم الفصل قراءة المكان: كل عتبة تغيّر الصوت والجسد والحرّية. تُبنى فاس هنا غرفةً غرفة، قبل أن تثقل الحكاية.",
    figures: [
      { nom: "Métonymie", nomAr: "مجاز مرسل", fr: "Le lieu désigne ceux qui l'habitent. Exemple : « Toute la maison retenait son souffle. »", ar: "يدلّ المكان على ساكنيه. مثال: « حبس البيت كلّه أنفاسه. »" },
      { nom: "Gradation", nomAr: "تدرّج", fr: "On avance par degrés. Exemple : « De la chambre à la terrasse, de la terrasse à la ruelle. »", ar: "نتقدّم درجةً درجة. مثال: « من الغرفة إلى السطح، ومن السطح إلى الزقاق. »" },
      { nom: "Comparaison", nomAr: "تشبيه", fr: "Exemple : « La terrasse était comme un balcon posé entre le secret et la rue. »", ar: "مثال: « كان السطح كشرفة بين السرّ والشارع. »" },
    ],
  },
  "BAM-04": {
    fr: "La boîte ne vaut rien au marché. Pour l'enfant, elle vaut un monde. Il y garde des objets menus, sans prix pour les adultes, et chacun devient une merveille parce qu'il l'a choisi. Le chapitre ne demande pas la liste exacte du trésor : il demande ce que le trésor fait. La boîte est un refuge, une mémoire et un royaume que la pauvreté ne peut pas taxer. Qui la méprise ne voit que du fer-blanc. Qui la comprend voit l'enfance.",
    ar: "العلبة لا تساوي شيئًا في السوق. عند الطفل تساوي عالمًا. يضع فيها أشياء صغيرة لا ثمن لها عند الكبار، ويصير كل شيء عجيبة لأنه هو الذي اختاره. لا يطلب الفصل جردًا دقيقًا للكنز: يطلب ما يفعله الكنز. العلبة ملجأ وذاكرة ومملكة لا تستطيع الفاقة أن تفرض عليها ضريبة. من يحتقرها لا يرى إلا صفيحًا. من يفهمها يرى الطفولة.",
    figures: [
      { nom: "Métaphore", nomAr: "استعارة", fr: "Exemple : « Sa boîte est un royaume que personne ne ferme à clé. »", ar: "مثال: « علبته مملكة لا يغلقها أحد بالمفتاح. »" },
      { nom: "Antithèse", nomAr: "طباق", fr: "Le rien des adultes s'oppose au tout de l'enfant. Exemple : « Rien pour le marché, tout pour lui. »", ar: "لا شيء عند الكبار يقابل كل شيء عند الطفل. مثال: « لا شيء للسوق، وكل شيء له. »" },
      { nom: "Hyperbole", nomAr: "مبالغة", fr: "Exemple : « Un bouton, dans cette boîte, éclairait la chambre mieux qu'une lampe. »", ar: "مثال: « زرّ واحد في هذه العلبة أضاء الغرفة أكثر من قنديل. »" },
    ],
  },
  "BAM-05": {
    fr: "Lalla Zoubida est la mère, donc la chaleur de la maison. Elle protège, elle croit, elle prie, elle devine la peur de l'enfant avant qu'il sache la nommer. Sa tendresse n'est pas un décor : c'est une force, parfois naïve aux yeux d'un adulte, toujours juste aux yeux du fils. Le chapitre montre comment une mère tient un monde quand l'argent manque et quand le réel menace. Le prénom, à lui seul, devient un abri.",
    ar: "لالة زبيدة هي الأم، أي دفء البيت. تحمي وتؤمن وتدعو، وتحدس خوف الطفل قبل أن يعرف اسمه. حنانها ليس زينة: هو قوّة، قد تبدو ساذجة للكبار، وهي صادقة دائمًا في عين الابن. يُظهر الفصل كيف تمسك أمّ بعالم حين ينقص المال ويهدّد الواقع. الاسم وحده يصير مأوى.",
    figures: [
      { nom: "Personnification", nomAr: "تشخيص", fr: "Exemple : « Sa voix refermait la porte sur le froid. »", ar: "مثال: « كان صوتها يغلق الباب على البرد. »" },
      { nom: "Comparaison", nomAr: "تشبيه", fr: "Exemple : « Lalla Zoubida veillait comme une lampe qu'on n'ose pas souffler. »", ar: "مثال: « كانت لالة زبيدة تسهر كقنديل لا يجرؤ أحد على إطفائه. »" },
      { nom: "Euphémisme", nomAr: "تلطيف", fr: "On adoucit une dureté. Exemple : « La maison avait moins de pain, et elle disait : nous avons encore le jour. »", ar: "نلطّف قسوة. مثال: « نقص الخبز في البيت، فقالت: ما زال لدينا النهار. »" },
    ],
  },
  "BAM-06": {
    fr: "Le père porte l'argent qui manque et la honte qui ne se dit pas. Il travaille, il se tait, il veut que la maison reste droite aux yeux du quartier. La maladie, quand elle approche, n'est pas un détail : elle menace le pain, le nom et la fierté. L'enfant comprend mal les chiffres et comprend trop bien les silences. Ce chapitre oppose l'honneur qu'on montre et la peur qu'on cache.",
    ar: "يحمل الأب المال الناقص والعار الذي لا يُقال. يعمل ويصمت، ويريد أن يبقى البيت مستقيمًا في أعين الحيّ. المرض، حين يقترب، ليس تفصيلًا: يهدّد الخبز والاسم والكرامة. يفهم الطفل الأرقام بصعوبة، ويفهم الصمت أكثر مما ينبغي. يقابل هذا الفصل بين الشرف الذي يُظهر والخوف الذي يُخفى.",
    figures: [
      { nom: "Antithèse", nomAr: "طباق", fr: "Exemple : « Debout dans la rue, plié dans la maison. »", ar: "مثال: « قائم في الشارع، منحنٍ في البيت. »" },
      { nom: "Litote", nomAr: "تلطيف بالنفي", fr: "On dit moins pour faire entendre plus. Exemple : « Ce n'était pas un jour facile. »", ar: "نقول أقل لنُسمع أكثر. مثال: « لم يكن يومًا هيّنًا. »" },
      { nom: "Métonymie", nomAr: "مجاز مرسل", fr: "L'argent désigne la survie. Exemple : « Le pain a baissé les yeux devant le père. »", ar: "يدلّ المال على البقاء. مثال: « أطرق الخبز أمام الأب. »" },
    ],
  },
  "BAM-07": {
    fr: "Le hammam, la rue et le voisinage sortent l'enfant de la seule maison. Au hammam, les corps, la vapeur et les voix des femmes forment un autre royaume, chaud et sans pudeur calculée. Dans la rue, il faut savoir qui saluer et devant qui se taire. Le voisinage regarde, commente, protège ou blesse. Le chapitre est une école du regard social : l'enfant apprend qu'on n'est jamais seul, même quand on se croit caché.",
    ar: "يُخرج الحمّام والشارع والجوار الطفل من البيت وحده. في الحمّام تشكّل الأجساد والبخار وأصوات النساء مملكة أخرى، دافئة بلا حشمة محسوبة. في الشارع يجب أن يعرف من يسلّم عليه ومن يصمت أمامه. الجوار ينظر ويعلّق ويحمي أو يجرح. الفصل مدرسة للنظرة الاجتماعية: يتعلّم الطفل أنه ليس وحيدًا أبدًا، حتى حين يظنّ أنه مختبئ.",
    figures: [
      { nom: "Hypotypose", nomAr: "وصف حسّي", fr: "On fait voir, entendre, sentir. Exemple : « La vapeur collait aux cils, et l'eau chantait sur la pierre. »", ar: "نجعل القارئ يرى ويسمع ويشمّ. مثال: « لصق البخار بالأهداب، وغنّى الماء على الحجر. »" },
      { nom: "Accumulation", nomAr: "تراكم", fr: "Les sensations s'ajoutent. Exemple : « Cris, seaux, rires, chaleur, pas mouillés. »", ar: "تتراكم الأحاسيس. مثال: « صراخ، دلاء، ضحك، حرّ، خطوات مبلّلة. »" },
      { nom: "Comparaison", nomAr: "تشبيه", fr: "Exemple : « La rue bruissait comme un marché qui n'a pas d'heure de fermeture. »", ar: "مثال: « كان الشارع يهمس كسوق لا ساعة لإغلاقه. »" },
    ],
  },
  "BAM-08": {
    fr: "La fête et le moussem remplissent la ville de couleur, de sucre et de foule. L'enfant y entre comme dans un songe autorisé. Pourtant la joie publique ne paie pas la maison. Le chapitre tient ensemble le rire du quartier et l'inquiétude qui attend au retour. La fête agrandit le merveilleux, puis elle le rend plus fragile : on sait déjà qu'il faudra rentrer.",
    ar: "تملأ الحفلة والموسم المدينة لونًا وسكّرًا وزحامًا. يدخل الطفل إليهما كحلم مسموح. لكن فرح الناس لا يدفع ثمن البيت. يجمع الفصل ضحك الحيّ والقلق الذي ينتظر عند العودة. تكبّر الحفلة العجيب، ثم تجعله أشدّ هشاشة: نعرف سلفًا أنه لا بدّ من الرجوع.",
    figures: [
      { nom: "Antithèse", nomAr: "طباق", fr: "Exemple : « Dehors la fête, dedans la note à payer. »", ar: "مثال: « في الخارج الحفلة، وفي الداخل الحساب. »" },
      { nom: "Hyperbole", nomAr: "مبالغة", fr: "Exemple : « La ville entière tenait dans un tambour. »", ar: "مثال: « كانت المدينة كلّها في طبل واحد. »" },
      { nom: "Ironie", nomAr: "تهكّم", fr: "L'éclat de la fête souligne ce qu'elle ne répare pas. Exemple : « On avait des lanternes pour tout le monde, et du pain pour plus tard. »", ar: "بريق الحفلة يبرز ما لا تصلحه. مثال: « كانت الفوانيس للجميع، والخبز لوقت لاحق. »" },
    ],
  },
  "BAM-09": {
    fr: "L'école et le maître ouvrent un monde de règles. Il faut réciter, se taire, craindre la faute et aimer malgré tout le savoir qui se donne à voix haute. L'enfant passe du jeu à l'obéissance sans cesser d'être lui-même. Le maître est une autorité, parfois dure, parfois juste, toujours plus grande que la chaise qu'il occupe. Ce chapitre montre l'apprentissage comme un seuil : on quitte un peu la boîte pour entrer dans la langue des adultes.",
    ar: "تفتح المدرسة والمعلّم عالم القواعد. يجب أن يحفظ ويتلو ويصمت ويخاف الخطأ، وأن يحبّ مع ذلك العلم الذي يُعطى بصوت عال. ينتقل الطفل من اللعب إلى الطاعة دون أن يكفّ عن كونه نفسه. المعلّم سلطة، قاسية أحيانًا وعادلة أحيانًا، وأكبر دائمًا من الكرسي الذي يجلس عليه. يُظهر الفصل التعلّم عتبة: نغادر العلبة قليلًا لندخل لغة الكبار.",
    figures: [
      { nom: "Antithèse", nomAr: "طباق", fr: "Exemple : « Le jeu au-dehors, la règle au-dedans. »", ar: "مثال: « اللعب في الخارج، والقاعدة في الداخل. »" },
      { nom: "Métaphore", nomAr: "استعارة", fr: "Exemple : « La leçon était une porte, et la peur en était la clé. »", ar: "مثال: « كان الدرس بابًا، وكان الخوف مفتاحه. »" },
      { nom: "Anaphore", nomAr: "تكرار صدري", fr: "La répétition imite la récitation. Exemple : « Il reprit le vers. Il reprit le souffle. Il reprit courage. »", ar: "يحاكي التكرار التلاوة. مثال: « أعاد البيت. أعاد النَفَس. أعاد الشجاعة. »" },
    ],
  },
  "BAM-10": {
    fr: "Le dernier mouvement quitte la merveille pour le réel. La maladie, le manque et le regard des autres empêchent l'enfant de vivre seulement dans sa boîte. Rien n'efface les objets choisis : ils deviennent le souvenir de ce que le réel ne sait pas garder. Le chapitre ferme le livre sans trahir l'enfance. Il dit que grandir, c'est apprendre la perte, et que raconter, c'est rendre la boîte à ceux qui viendront.",
    ar: "تغادر الحركة الأخيرة العجيب نحو الواقع. المرض والنقص ونظرات الآخرين تمنع الطفل من أن يعيش في علبته وحدها. لا شيء يمحو الأشياء التي اختارها: تصير ذكرى ما لا يحسن الواقع حفظه. يغلق الفصل الكتاب دون أن يخون الطفولة. يقول إن الكبر هو تعلّم الفقد، وإن الحكي هو إعادة العلبة إلى من سيأتي.",
    figures: [
      { nom: "Antithèse", nomAr: "طباق", fr: "Exemple : « La merveille tenait dans la main, le réel tenait toute la rue. »", ar: "مثال: « كان العجيب في الكفّ، وكان الواقع يملك الشارع كلّه. »" },
      { nom: "Métaphore", nomAr: "استعارة", fr: "Exemple : « La magie baissa la voix, sans quitter la maison. »", ar: "مثال: « خفّض السحر صوته، دون أن يغادر البيت. »" },
      { nom: "Gradation", nomAr: "تدرّج", fr: "Exemple : « D'abord le jeu, puis la peur, puis le jour sans jeu. »", ar: "مثال: « أولًا اللعب، ثم الخوف، ثم يوم بلا لعب. »" },
    ],
  },
  "ANT-01": {
    fr: "Jean Anouilh reprend le mythe d'Antigone et l'habille en tragédie d'aujourd'hui. L'histoire est ancienne : une sœur enterre un frère malgré l'interdit du roi. La pièce, elle, parle à un temps où dire non a un prix. Ce chapitre présente l'auteur, le mythe et la question du bac : que devient un geste antique quand il est joué devant nous, sans costume de marbre ?",
    ar: "يعيد جان أنوي أسطورة أنتيغون ويلبسها مأساة اليوم. الحكاية قديمة: أخت تدفن أخًا رغم منع الملك. أمّا المسرحية فتخاطب زمنًا يكون لقول « لا » ثمن. يقدّم الفصل الكاتب والأسطورة وسؤال الباك: ماذا يصير الفعل القديم حين يُمثَّل أمامنا بلا ثوب من رخام؟",
    figures: [
      { nom: "Périphrase", nomAr: "كناية بالوصف", fr: "On désigne sans nommer d'un seul mot. Exemple : « Celle qui dit non au roi. »", ar: "ندلّ من غير أن نسمّي بكلمة واحدة. مثال: « تلك التي تقول لا للملك. »" },
      { nom: "Métaphore", nomAr: "استعارة", fr: "Exemple : « Le mythe est un miroir que la pièce tend à la salle. »", ar: "مثال: « الأسطورة مرآة تمدّها المسرحية إلى القاعة. »" },
      { nom: "Antithèse", nomAr: "طباق", fr: "Exemple : « Un tombeau antique, une phrase d'aujourd'hui. »", ar: "مثال: « قبر قديم، وجملة من اليوم. »" },
    ],
  },
  "ANT-02": {
    fr: "Le prologue et le chœur savent déjà la fin. Ils présentent les personnages, ils annoncent les morts, ils expliquent la machine. La tragédie, dit le chœur, est propre : dès que le ressort est remonté, elle va jusqu'au bout. Le chapitre apprend à lire ces voix qui ne jouent pas l'intrigue mais la commentent. Le suspense n'est pas « qui meurt ». Il est « comment un être libre marche vers ce qui est déjà écrit ».",
    ar: "يعرف التقديم والجوقة النهاية سلفًا. يعرّفان بالأشخاص، ويعلنان الموتى، ويشرحان الآلة. المأساة، تقول الجوقة، نظيفة: ما إن يُملأ النابض حتى تمضي إلى الآخر. يعلّم الفصل قراءة هذه الأصوات التي لا تلعب العقدة بل تعلّق عليها. التشويق ليس « من يموت ». هو « كيف يمشي كائن حرّ نحو ما كُتب من قبل ».",
    figures: [
      { nom: "Personnification", nomAr: "تشخيص", fr: "Exemple : « La tragédie se met en marche toute seule. »", ar: "مثال: « تنطلق المأساة وحدها. »" },
      { nom: "Métaphore", nomAr: "استعارة", fr: "Exemple : « Le ressort, une fois remonté, ne demande plus la permission. »", ar: "مثال: « النابض، ما إن يُملأ، لا يستأذن أحدًا. »" },
      { nom: "Anaphore", nomAr: "تكرار صدري", fr: "Exemple : « Il mourra. Elle mourra. Le roi restera. »", ar: "مثال: « سيموت. ستموت. وسيبقى الملك. »" },
    ],
  },
  "ANT-03": {
    fr: "Antigone et Ismène sont sœurs, pas ennemies. L'une choisit le geste interdit, l'autre choisit la vie possible. Ismène aime aussi le frère mort, mais elle refuse de mourir pour un rite. Antigone ne sait pas calculer ce prix. Le chapitre est un dialogue de deux sagesses : la prudence qui protège, l'absolu qui ne partage pas. Aucune des deux n'est une caricature.",
    ar: "أنتيغون وإيسمين أختان، لا عدوّتان. تختار واحدة الفعل الممنوع، وتختار الأخرى الحياة الممكنة. تحبّ إيسمين الأخ الميّت أيضًا، لكنها ترفض أن تموت من أجل طقس. لا تحسن أنتيغون حساب هذا الثمن. الفصل حوار بين حكمتين: الحذر الذي يحمي، والمطلق الذي لا يقتسم. ليست إحداهما صورة هزلية.",
    figures: [
      { nom: "Antithèse", nomAr: "طباق", fr: "Exemple : « Vivre en se taisant, ou mourir en disant non. »", ar: "مثال: « أن تعيش صامتًا، أو تموت قائلًا لا. »" },
      { nom: "Ironie", nomAr: "تهكّم", fr: "Le conseil raisonnable sonne faux devant l'absolu. Exemple : « Sois sage, et laisse ton frère sans terre. »", ar: "تبدو النصيحة العاقلة زائفة أمام المطلق. مثال: « كوني عاقلة، واتركي أخاك بلا تراب. »" },
      { nom: "Chiasme", nomAr: "طرد وعكس", fr: "L'ordre des termes se croise. Exemple : « Elle veut le rite, le rite la veut tout entière. »", ar: "يتقاطع ترتيب الألفاظ. مثال: « تريد الطقس، ويريدها الطقس كلّها. »" },
    ],
  },
  "ANT-04": {
    fr: "Le dialogue avec Créon est le cœur de la pièce. Le roi défend l'ordre : un mort contre la ville, c'est un exemple, pas une tendresse. Antigone défend une loi qui ne s'écrit pas sur un décret. Créon n'est pas un monstre facile. Il est fatigué, il gouverne, il propose même une sortie. Elle ne la prend pas. Le chapitre demande de suivre les arguments, pas seulement de choisir un camp.",
    ar: "الحوار مع كريون قلب المسرحية. يدافع الملك عن النظام: ميّت ضد المدينة عبرة، لا حنان. تدافع أنتيغون عن قانون لا يُكتب في مرسوم. كريون ليس وحشًا سهلًا. هو متعب، يحكم، ويعرض حتى مخرجًا. هي لا تأخذه. يطلب الفصل تتبّع الحجج، لا اختيار معسكر فقط.",
    figures: [
      { nom: "Interrogation rhétorique", nomAr: "استفهام بلاغي", fr: "La question n'attend pas une fiche. Exemple : « Enterrer un frère, est-ce donc renverser une ville ? »", ar: "السؤال لا ينتظر جوابًا في ورقة. مثال: « أدفن أخًا يقلب مدينة؟ »" },
      { nom: "Antithèse", nomAr: "طباق", fr: "Exemple : « La loi du décret, la loi sans décret. »", ar: "مثال: « قانون المرسوم، وقانون بلا مرسوم. »" },
      { nom: "Ironie", nomAr: "تهكّم", fr: "Exemple : « Un roi tout-puissant, obligé de discuter avec une petite fille. »", ar: "مثال: « ملك قادر على كل شيء، مضطر إلى النقاش مع بنت صغيرة. »" },
    ],
  },
  "ANT-05": {
    fr: "Créon offre le bonheur : un mari, un matin ordinaire, une vie qui continue. Antigone le refuse. Elle ne méprise pas les gens heureux. Elle dit que ce bonheur-là est trop petit pour elle, qu'elle veut tout, tout de suite, ou rien. Le chapitre étudie ce refus. Ce n'est pas un caprice. C'est le choix de ne pas devenir raisonnable au prix de soi.",
    ar: "يعرض كريون السعادة: زوجًا، وصباحًا عاديًا، وحياة تستمر. ترفضها أنتيغون. لا تحتقر السعداء. تقول إن هذه السعادة أصغر منها، وإنها تريد كل شيء فورًا أو لا شيء. يدرس الفصل هذا الرفض. ليس نزوة. هو اختيار ألا تصير عاقلة بثمن نفسها.",
    figures: [
      { nom: "Oxymore", nomAr: "تناقض ظاهري", fr: "Deux mots qui se heurtent disent une vérité. Exemple : « Un bonheur insupportable. »", ar: "كلمتان تتصادمان تقولان حقيقة. مثال: « سعادة لا تُطاق. »" },
      { nom: "Antithèse", nomAr: "طباق", fr: "Exemple : « Tout, tout de suite, ou rien. »", ar: "مثال: « كل شيء فورًا، أو لا شيء. »" },
      { nom: "Hyperbole", nomAr: "مبالغة", fr: "L'absolu grossit la demande jusqu'à l'impossible. Exemple : « Elle voulait le monde avant le déjeuner. »", ar: "مثال: « كانت تريد العالم قبل الغداء. »" },
    ],
  },
  "ANT-06": {
    fr: "Hémon est le fils de Créon et l'aimé d'Antigone. Il tient les deux bouts d'une chaîne qui casse. Aimer son père, c'est entendre la loi. Aimer Antigone, c'est entendre le refus. Le chapitre le montre sans en faire un simple messager : il est le tragique de ceux qui veulent rester fidèles à deux voix. Quand les deux voix ne peuvent plus habiter la même maison, il n'a plus de place.",
    ar: "هيمون ابن كريون وحبيب أنتيغون. يمسك طرفي سلسلة تنقطع. حبّ الأب يعني سماع القانون. حبّ أنتيغون يعني سماع الرفض. يُظهره الفصل من غير أن يجعله رسولًا بسيطًا: هو مأساة من يريد أن يبقى وفيًا لصوتين. حين لا يعود الصوتان قادرين على سكنى البيت نفسه، لا يبقى له مكان.",
    figures: [
      { nom: "Antithèse", nomAr: "طباق", fr: "Exemple : « La loi du père, l'amour de la fille. »", ar: "مثال: « قانون الأب، وحبّ الفتاة. »" },
      { nom: "Chiasme", nomAr: "طرد وعكس", fr: "Exemple : « Il défend le père devant elle, et elle devant le père. »", ar: "مثال: « يدافع عن الأب أمامها، وعنها أمام الأب. »" },
      { nom: "Gradation", nomAr: "تدرّج", fr: "Exemple : « D'abord le respect, puis la plainte, puis la rupture. »", ar: "مثال: « أولًا الاحترام، ثم الشكوى، ثم القطيعة. »" },
    ],
  },
  "ANT-07": {
    fr: "La garde n'est pas un héros. Il a peur, il veut sa place, il parle comme on parle à la cantine. Pourtant c'est lui qui trouve le geste d'Antigone et le livre au roi. Le chapitre étudie le tragique ordinaire : le mal n'a pas toujours un grand visage. Parfois il a la voix de quelqu'un qui dit seulement « je n'y suis pour rien ». Le comique de ses phrases rend la machine plus froide.",
    ar: "الحارس ليس بطلًا. يخاف، ويريد مكانه، ويتكلّم كما يُتكلَّم في المقصف. ومع ذلك هو الذي يجد فعل أنتيغون ويسلّمه إلى الملك. يدرس الفصل المأساوي العادي: ليس للشر دائمًا وجه كبير. أحيانًا له صوت من يقول فقط « لا دخل لي ». فكاهة جمله تجعل الآلة أبرد.",
    figures: [
      { nom: "Ironie", nomAr: "تهكّم", fr: "Exemple : « Un homme sans importance décide de l'importante. »", ar: "مثال: « رجل بلا أهمية يقرّر أمر الأهم. »" },
      { nom: "Antiphrase", nomAr: "عكس الظاهر", fr: "On dit le contraire de ce qu'il faut entendre. Exemple : « Belle affaire, vraiment, qu'un cadavre au soleil. »", ar: "نقول عكس ما يجب فهمه. مثال: « أمر جميل حقًا، جثّة في الشمس. »" },
      { nom: "Contraste de registres", nomAr: "تقابل الأساليب", fr: "Le familier touche le tragique. Exemple : « Il parle de soupe pendant qu'une ville juge une sœur. »", ar: "الأسلوب اليومي يلامس المأساوي. مثال: « يتكلّم عن الحساء بينما مدينة تحاكم أختًا. »" },
    ],
  },
  "ANT-08": {
    fr: "La pièce reste une tragédie, mais elle n'a plus besoin des dieux pour avancer. Le « non » est humain, le pouvoir est humain, la fatigue du roi est humaine. Une fois le geste fait, la machine va au bout : Antigone, Hémon, le prix payé par ceux qui restent. Le chapitre relie le mythe à notre lecture. Refuser n'est pas gratuit. Accepter l'ordre non plus. Anouilh laisse les deux notes, sans morale collée sur le rideau.",
    ar: "تبقى المسرحية مأساة، لكنها لم تعد تحتاج إلى الآلهة لتتقدّم. « لا » إنسانية، والسلطة إنسانية، وتعب الملك إنساني. ما إن يقع الفعل حتى تمضي الآلة إلى الآخر: أنتيغون، هيمون، والثمن الذي يدفعه من يبقى. يصل الفصل الأسطورة بقراءتنا. الرفض ليس مجانيًا. وقبول النظام ليس مجانيًا أيضًا. يترك أنوي النغمتين، بلا عبرة تُلصق على الستار.",
    figures: [
      { nom: "Métaphore", nomAr: "استعارة", fr: "Exemple : « La machine, une fois lancée, ne connaît plus les prénoms. »", ar: "مثال: « الآلة، ما إن تنطلق، لا تعرف الأسماء. »" },
      { nom: "Anaphore", nomAr: "تكرار صدري", fr: "Exemple : « Non au décret. Non au petit bonheur. Non au silence. »", ar: "مثال: « لا للمرسوم. لا للسعادة الصغيرة. لا للصمت. »" },
      { nom: "Antithèse", nomAr: "طباق", fr: "Exemple : « La pureté d'un geste, l'ordre d'une ville. »", ar: "مثال: « طهر فعل واحد، ونظام مدينة. »" },
    ],
  },
  "DJC-01": {
    fr: "Victor Hugo écrit contre l'échafaud. Le Dernier Jour d'un condamné n'est pas un roman d'aventures : c'est un plaidoyer. Le lecteur est mis dans la cellule, à la place d'un homme qui attend la mort légale. Le chapitre présente le projet de 1829. Hugo ne demande pas d'abord « qu'a-t-il fait ? ». Il demande ce que la société fait quand elle tue au nom de la justice.",
    ar: "يكتب فيكتور هوغو ضد المقصلة. « آخر يوم لمحكوم عليه » ليس رواية مغامرات: هو مرافعة. يوضع القارئ في الزنزانة، مكان رجل ينتظر موتًا قانونيًا. يقدّم الفصل مشروع سنة 1829. لا يسأل هوغو أولًا « ماذا فعل؟ ». يسأل ماذا يفعل المجتمع حين يقتل باسم العدالة.",
    figures: [
      { nom: "Apostrophe", nomAr: "نداء", fr: "On adresse la parole à quelqu'un qui doit entendre. Exemple : « Vous qui jugez, entrez dans la cellule. »", ar: "نوجّه الكلام إلى من يجب أن يسمع. مثال: « أنتم الذين تحكمون، ادخلوا الزنزانة. »" },
      { nom: "Métaphore", nomAr: "استعارة", fr: "Exemple : « Le livre est une tribune portée dans une poche. »", ar: "مثال: « الكتاب منبر يُحمل في جيب. »" },
      { nom: "Antithèse", nomAr: "طباق", fr: "Exemple : « La justice au nom de la loi, la hache au nom de la justice. »", ar: "مثال: « العدالة باسم القانون، والفأس باسم العدالة. »" },
    ],
  },
  "DJC-02": {
    fr: "L'homme n'a pas de nom, et son crime n'est pas raconté. Hugo retire les excuses faciles. Si le lecteur connaissait le forfait, il trierait les condamnés en « méritants » et en « pitoyables ». Sans nom, le prisonnier devient chacun. Le chapitre montre ce choix d'écriture : un journal intime, un « je » nu, une peine de mort impossible à ranger dans un fait divers.",
    ar: "الرجل بلا اسم، وجريمته لا تُروى. يسحب هوغو الأعذار السهلة. لو عرف القارئ الجرم لفرز المحكومين إلى « مستحقّين » و« يُرثى لهم ». بلا اسم يصير السجين كل أحد. يُظهر الفصل هذا الاختيار في الكتابة: يوميات حميمة، و« أنا » عارية، وعقوبة إعدام لا تُرتَّب في خبر حوادث.",
    figures: [
      { nom: "Périphrase", nomAr: "كناية بالوصف", fr: "Exemple : « Un homme que la loi a déjà rayé du monde. »", ar: "مثال: « رجل محاه القانون من العالم سلفًا. »" },
      { nom: "Métonymie", nomAr: "مجاز مرسل", fr: "Exemple : « La cellule pense, parce que l'homme n'a plus que quatre murs. »", ar: "مثال: « الزنزانة تفكّر، لأن الرجل لم يبقَ له إلا أربعة جدران. »" },
      { nom: "Antiphrase", nomAr: "عكس الظاهر", fr: "Exemple : « Une belle égalité : le même matin pour tous. »", ar: "مثال: « مساواة جميلة: الصباح نفسه للجميع. »" },
    ],
  },
  "DJC-03": {
    fr: "Compter les heures, c'est tout ce qui reste de liberté. Le temps, richesse des vivants, devient un compte à rebours. Chaque bruit dans le couloir peut être le pas décisif. Le chapitre suit cette attente. Hugo fait de la montre un personnage plus cruel que les juges, parce qu'elle ne se trompe pas et ne pardonne pas.",
    ar: "عدّ الساعات هو كل ما بقي من الحرّية. الوقت، ثروة الأحياء، يصير عدًّا تنازليًا. كل ضجّة في الرواق قد تكون الخطوة الحاسمة. يتتبّع الفصل هذا الانتظار. يجعل هوغو من الساعة شخصًا أقسى من القضاة، لأنها لا تخطئ ولا تغفر.",
    figures: [
      { nom: "Personnification", nomAr: "تشخيص", fr: "Exemple : « L'horloge mangeait les minutes sans lever les yeux. »", ar: "مثال: « كانت الساعة تأكل الدقائق دون أن ترفع عينيها. »" },
      { nom: "Gradation", nomAr: "تدرّج", fr: "Exemple : « Une heure, puis un quart, puis le pas dans le couloir. »", ar: "مثال: « ساعة، ثم ربع، ثم الخطوة في الرواق. »" },
      { nom: "Hyperbole", nomAr: "مبالغة", fr: "Exemple : « Une seconde pesait comme une année de bagne. »", ar: "مثال: « كانت الثانية تثقل كثقل سنة في السجن. »" },
    ],
  },
  "DJC-04": {
    fr: "Le préau et le bagne montrent la peine avant la peine dernière. La chaîne des forçats, le spectacle, la foule qui regarde des hommes liés : Hugo décrit pour que l'on ne puisse plus dire « je ne savais pas ». Le chapitre est visuel. Le corps collectif des condamnés devient une seule masse, et le lecteur entend le fer autant qu'il le voit. L'échafaud n'est plus une idée. Il a une cour, un bruit, une attente.",
    ar: "يُظهر الفناء والأشغال الشاقّة العقوبة قبل العقوبة الأخيرة. سلسلة المحكومين، والفرجة، والناس الذين ينظرون إلى رجال مقيّدين: يصف هوغو كي لا يعود أحد قادرًا على القول « لم أكن أعلم ». الفصل بصري. يصير جسد المحكومين كتلة واحدة، ويسمع القارئ الحديد بقدر ما يراه. المقصلة لم تعد فكرة. لها ساحة وضجّة وانتظار.",
    figures: [
      { nom: "Hypotypose", nomAr: "وصف حسّي", fr: "Exemple : « Le fer sonnait sur la pierre, et la file n'avait plus qu'un dos. »", ar: "مثال: « رنّ الحديد على الحجر، ولم يبقَ للصف إلا ظهر واحد. »" },
      { nom: "Accumulation", nomAr: "تراكم", fr: "Exemple : « Fers, cris, boue, numéros, regards, rires. »", ar: "مثال: « قيود، صراخ، وحل، أرقام، نظرات، ضحك. »" },
      { nom: "Comparaison", nomAr: "تشبيه", fr: "Exemple : « La chaîne avançait comme un seul animal malade. »", ar: "مثال: « كانت السلسلة تتقدّم كحيوان واحد مريض. »" },
    ],
  },
  "DJC-05": {
    fr: "La visite de la petite fille est la scène la plus humaine, donc la plus cruelle. L'enfant vient, et elle ne reconnaît pas son père. Il est « un monsieur ». L'amour n'a pas disparu : il n'a plus de visage où se poser. Le chapitre n'a pas besoin d'un long discours. Un mot d'enfant suffit à mesurer ce que la peine a déjà détruit, avant même le matin de l'exécution.",
    ar: "زيارة الطفلة الصغيرة هي المشهد الأكثر إنسانية، إذن الأكثر قسوة. تأتي الطفلة ولا تعرف أباها. هو « سيّد ». الحبّ لم يختفِ: لم يبقَ له وجه يحلّ فيه. لا يحتاج الفصل إلى خطاب طويل. كلمة طفل تكفي لقياس ما دمّرته العقوبة من قبل، حتى قبل صباح التنفيذ.",
    figures: [
      { nom: "Euphémisme", nomAr: "تلطيف", fr: "Le mot doux cache la coupure. Exemple : « Pour elle, ce n'était qu'un monsieur. »", ar: "الكلمة اللطيفة تخفي القطع. مثال: « عندها، لم يكن إلا سيّدًا. »" },
      { nom: "Antithèse", nomAr: "طباق", fr: "Exemple : « Un père dans la cellule, un étranger pour sa fille. »", ar: "مثال: « أب في الزنزانة، وغريب عند ابنته. »" },
      { nom: "Litote", nomAr: "تلطيف بالنفي", fr: "Exemple : « Elle ne lui a pas dit papa. »", ar: "مثال: « لم تقل له بابا. »" },
    ],
  },
  "DJC-06": {
    fr: "Le prêtre vient offrir un secours, une prière, un sens. Le condamné ne trouve pas dans ces mots la paix qu'on lui promet. Le chapitre n'insulte pas la foi : il montre un homme à qui l'heure parle plus fort que le ciel. Le refus, ou l'impuissance à recevoir la consolation, laisse le lecteur seul avec la question. Que vaut une parole de salut au bord d'une mort décidée par d'autres ?",
    ar: "يأتي الكاهن يعرض عونًا وصلاة ومعنًى. لا يجد المحكوم في هذه الكلمات السلام الموعود. لا يهين الفصل الإيمان: يُظهر رجلًا تخاطبه الساعة أعلى من السماء. الرفض، أو العجز عن قبول العزاء، يترك القارئ وحده مع السؤال. ماذا تساوي كلمة خلاص على حافّة موت قرّره آخرون؟",
    figures: [
      { nom: "Antithèse", nomAr: "طباق", fr: "Exemple : « Le ciel proposé, le cachot certain. »", ar: "مثال: « السماء معروضة، والزنزانة مؤكّدة. »" },
      { nom: "Interrogation rhétorique", nomAr: "استفهام بلاغي", fr: "Exemple : « Quelle prière couvre le bruit d'une hache ? »", ar: "مثال: « أي صلاة تغطّي صوت فأس؟ »" },
      { nom: "Ironie", nomAr: "تهكّم", fr: "Exemple : « On lui laisse l'éternité, puisqu'on lui prend le matin. »", ar: "مثال: « يتركون له الأبد، ما داموا يأخذون منه الصباح. »" },
    ],
  },
  "DJC-07": {
    fr: "Le condamné n'a pas de tribune. Personne ne lui tend le barreau des avocats au moment où la peur est la plus nette. Le livre parle à sa place, et c'est déjà le geste de Hugo : donner la parole à celui qu'on réduit au silence. Le chapitre lit cette plaidoirie sans salle. Chaque page est une phrase dite debout, adressée non aux juges d'un procès fini, mais aux lecteurs qui peuvent encore empêcher le suivant.",
    ar: "المحكوم بلا منبر. لا أحد يمدّ له قفص المحامين في اللحظة التي يكون فيها الخوف أوضح. يتكلّم الكتاب مكانه، وهذا أصلًا فعل هوغو: إعطاء الكلام لمن يُختزل إلى الصمت. يقرأ الفصل هذه المرافعة بلا قاعة. كل صفحة جملة تُقال واقفًا، لا إلى قضاة محاكمة انتهت، بل إلى قرّاء ما زالوا قادرين على منع التالية.",
    figures: [
      { nom: "Apostrophe", nomAr: "نداء", fr: "Exemple : « Écoutez-le, vous qui tournerez la page et rentrerez dîner. »", ar: "مثال: « اسمعوه، أنتم الذين ستقلبون الصفحة وتعودون إلى العشاء. »" },
      { nom: "Métaphore", nomAr: "استعارة", fr: "Exemple : « Une plaidoirie sans barreau, seulement des feuilles. »", ar: "مثال: « مرافعة بلا قفص، أوراق فقط. »" },
      { nom: "Anaphore", nomAr: "تكرار صدري", fr: "Exemple : « Il demande l'heure. Il demande un délai. Il demande qu'on le voie. »", ar: "مثال: « يطلب الساعة. يطلب مهلة. يطلب أن يُرى. »" },
    ],
  },
  "DJC-08": {
    fr: "Lire le réquisitoire, c'est accepter d'être juré. Hugo ne ferme pas le livre sur une morale facile ni sur le détail d'un crime qu'il a refusé de raconter. Il laisse le lecteur avec la mécanique de la peine : l'attente, le spectacle, l'enfant, le prêtre, le matin. Le dernier chapitre rassemble ces preuves. La question reste ouverte, et c'est voulu. Une société qui tue dans l'ordre doit pouvoir soutenir le regard de cet homme sans nom.",
    ar: "قراءة قرار الاتهام تعني قبول أن تكون عضوًا في الهيئة. لا يغلق هوغو الكتاب على عبرة سهلة ولا على تفصيل جريمة رفض أن يرويها. يترك القارئ مع آلة العقوبة: الانتظار، والفرجة، والطفلة، والكاهن، والصباح. يجمع الفصل الأخير هذه الأدلّة. يبقى السؤال مفتوحًا، وهذا مقصود. مجتمع يقتل بنظام يجب أن يقدر على تحمّل نظرة هذا الرجل بلا اسم.",
    figures: [
      { nom: "Interrogation rhétorique", nomAr: "استفهام بلاغي", fr: "Exemple : « Au nom de quelle paix coupe-t-on une tête ? »", ar: "مثال: « باسم أي سلام يُقطع رأس؟ »" },
      { nom: "Gradation", nomAr: "تدرّج", fr: "Exemple : « L'heure, le préau, l'enfant, le prêtre, le silence. »", ar: "مثال: « الساعة، الفناء، الطفلة، الكاهن، الصمت. »" },
      { nom: "Antithèse", nomAr: "طباق", fr: "Exemple : « L'ordre de la loi, le désordre d'un matin. »", ar: "مثال: « نظام القانون، وفوضى صباح. »" },
    ],
  },
};

export function noteFor(code: string) {
  return NOTES[code.toUpperCase()];
}
