/**
 * Smart Classroom Lecture Database
 * Contains pre-recorded vector stroke paths, timestamps, English transcripts, 
 * preserved technical terms, and multilingual translations (Hindi, Bangla, Arabic, Spanish, French).
 */

const LECTURE_DATA = [
  {
    id: "cs101-recursion",
    title: "CS101: Recursion & Binary Search Trees",
    instructor: "Prof. A. Sharma",
    course: "Computer Science 101",
    date: "Today (Live Session)",
    isLive: true,
    durationSeconds: 45,
    technicalTerms: ["recursion", "base case", "call stack", "binary search tree", "root node", "leaf node", "time complexity", "O(log n)"],
    segments: [
      {
        id: "seg-1",
        startTime: 0,
        endTime: 7,
        englishText: "Welcome everyone. Today we are exploring recursion and how base case conditions stop infinite loops.",
        translations: {
          hi: "आप सभी का स्वागत है। आज हम recursion और यह समझने जा रहे हैं कि base case स्थितियां अनंत लूप को कैसे रोकती हैं।",
          bn: "সবাইকে স্বাগতম। আজ আমরা recursion এবং কীভাবে base case পরিস্থিতি অনন্ত লুপ বন্ধ করে তা অন্বেষণ করছি।",
          ar: "مرحباً بالجميع. اليوم نستكشف recursion وكيف تمنع شروط base case التكرار اللانهائي.",
          es: "Bienvenidos a todos. Hoy exploramos recursion y cómo las condiciones de base case detienen bucles infinitos.",
          fr: "Bienvenue à tous. Aujourd'hui nous explorons recursion et comment les conditions de base case arrêtent les boucles infinies."
        },
        strokes: [
          // Title text drawing simulation: "RECURSION"
          { tool: "pen", color: "#38bdf8", size: 3, points: [[50, 40], [50, 90]] },
          { tool: "pen", color: "#38bdf8", size: 3, points: [[50, 40], [75, 40], [75, 65], [50, 65]] },
          { tool: "pen", color: "#38bdf8", size: 3, points: [[65, 65], [78, 90]] },
          { tool: "pen", color: "#38bdf8", size: 3, points: [[90, 40], [90, 90], [115, 90]] },
          { tool: "pen", color: "#38bdf8", size: 3, points: [[90, 40], [115, 40]] },
          { tool: "pen", color: "#38bdf8", size: 3, points: [[90, 65], [110, 65]] }
        ]
      },
      {
        id: "seg-2",
        startTime: 7,
        endTime: 16,
        englishText: "Let us visualize a binary search tree. Notice how the root node 10 splits left and right.",
        translations: {
          hi: "आइए एक binary search tree की कल्पना करें। ध्यान दें कि root node 10 बाएं और दाएं में कैसे विभाजित होता है।",
          bn: "আসুন একটি binary search tree কল্পনা করি। লক্ষ্য করুন কীভাবে root node 10 বাম এবং ডানে বিভক্ত হয়।",
          ar: "دعونا نتخيل binary search tree. لاحظ كيف تنقسم root node 10 إلى اليسار واليمين.",
          es: "Visualicemos un binary search tree. Note cómo la root node 10 se divide a la izquierda y a la derecha.",
          fr: "Visualisons un binary search tree. Remarquez comment la root node 10 se divise à gauche et à droite."
        },
        strokes: [
          // Root Circle
          { tool: "pen", color: "#a855f7", size: 3, points: [[250, 60], [270, 50], [290, 60], [290, 80], [270, 90], [250, 80], [250, 60]] },
          { tool: "pen", color: "#f8fafc", size: 2, points: [[263, 64], [263, 80]] }, // "1"
          { tool: "pen", color: "#f8fafc", size: 2, points: [[273, 64], [280, 64], [280, 80], [273, 80], [273, 64]] }, // "0"
          // Branch Left to Node 5
          { tool: "pen", color: "#64748b", size: 2, points: [[255, 85], [180, 135]] },
          // Branch Right to Node 15
          { tool: "pen", color: "#64748b", size: 2, points: [[285, 85], [360, 135]] },
          // Left Node (5)
          { tool: "pen", color: "#a855f7", size: 3, points: [[165, 135], [185, 125], [205, 135], [205, 155], [185, 165], [165, 155], [165, 135]] },
          { tool: "pen", color: "#f8fafc", size: 2, points: [[180, 138], [190, 138], [180, 147], [190, 155]] }, // "5"
          // Right Node (15)
          { tool: "pen", color: "#a855f7", size: 3, points: [[345, 135], [365, 125], [385, 135], [385, 155], [365, 165], [345, 155], [345, 135]] },
          { tool: "pen", color: "#f8fafc", size: 2, points: [[358, 138], [358, 154]] }, // "1"
          { tool: "pen", color: "#f8fafc", size: 2, points: [[368, 138], [375, 138], [368, 147], [375, 155]] } // "5"
        ]
      },
      {
        id: "seg-3",
        startTime: 16,
        endTime: 25,
        englishText: "When we traverse down to a leaf node, each recursive call pushes a frame onto the call stack.",
        translations: {
          hi: "जब हम एक leaf node तक नीचे जाते हैं, तो प्रत्येक रिकर्सिव कॉल call stack पर एक फ्रेम पुश करती है।",
          bn: "আমরা যখন leaf node পর্যন্ত নিচে নেমে যাই, প্রতিটি রিকার্সিভ কল call stack-এ একটি ফ্রেম পুশ করে।",
          ar: "عندما ننتقل للأسفل إلى leaf node، تقوم كل استدعاء تكراري بدفع إطار على call stack.",
          es: "Cuando descendemos hasta una leaf node, cada llamada recursiva coloca un marco en el call stack.",
          fr: "Lorsque nous descendons vers une leaf node, chaque appel récursif empile une trame sur le call stack."
        },
        strokes: [
          // Sub-branches to leaves 2, 7, 12, 20
          { tool: "pen", color: "#64748b", size: 2, points: [[170, 160], [120, 210]] },
          { tool: "pen", color: "#64748b", size: 2, points: [[195, 160], [230, 210]] },
          { tool: "pen", color: "#64748b", size: 2, points: [[355, 160], [310, 210]] },
          { tool: "pen", color: "#64748b", size: 2, points: [[375, 160], [420, 210]] },
          // Leaf nodes
          { tool: "pen", color: "#34d399", size: 3, points: [[105, 210], [120, 200], [135, 210], [135, 225], [120, 235], [105, 225], [105, 210]] }, // 2
          { tool: "pen", color: "#34d399", size: 3, points: [[215, 210], [230, 200], [245, 210], [245, 225], [230, 235], [215, 225], [215, 210]] }, // 7
          { tool: "pen", color: "#34d399", size: 3, points: [[295, 210], [310, 200], [325, 210], [325, 225], [310, 235], [295, 225], [295, 210]] }, // 12
          { tool: "pen", color: "#34d399", size: 3, points: [[405, 210], [420, 200], [435, 210], [435, 225], [420, 235], [405, 225], [405, 210]] }  // 20
        ]
      },
      {
        id: "seg-4",
        startTime: 25,
        endTime: 35,
        englishText: "Here is the call stack box on the right. Notice `search(7)` pushes 10 -> 5 -> 7 until the base case matches.",
        translations: {
          hi: "दाईं ओर call stack बॉक्स है। ध्यान दें कि `search(7)` 10 -> 5 -> 7 को तब तक पुश करता है जब तक base case मेल न खा जाए।",
          bn: "ডানপাশে call stack বক্সটি দেখুন। লক্ষ্য করুন `search(7)` base case মিলে না যাওয়া পর্যন্ত 10 -> 5 -> 7 পুশ করে।",
          ar: "إليك صندوق call stack على اليمين. لاحظ أن `search(7)` يدفع 10 -> 5 -> 7 حتى يتطابق base case.",
          es: "Aquí está la caja del call stack a la derecha. Note que `search(7)` empuja 10 -> 5 -> 7 hasta que coincide el base case.",
          fr: "Voici le rectangle de call stack sur la droite. Remarquez que `search(7)` empile 10 -> 5 -> 7 jusqu'à ce que le base case corresponde."
        },
        strokes: [
          // Call Stack container box
          { tool: "pen", color: "#f59e0b", size: 2, points: [[480, 50], [600, 50], [600, 240], [480, 240], [480, 50]] },
          { tool: "pen", color: "#f59e0b", size: 2, points: [[480, 90], [600, 90]] },
          { tool: "pen", color: "#f59e0b", size: 2, points: [[480, 140], [600, 140]] },
          { tool: "pen", color: "#f59e0b", size: 2, points: [[480, 190], [600, 190]] },
          // Text inside stack
          { tool: "pen", color: "#f8fafc", size: 2, points: [[490, 65], [580, 65]] }, // Frame 3: search(7)
          { tool: "pen", color: "#f8fafc", size: 2, points: [[490, 115], [570, 115]] }, // Frame 2: search(5)
          { tool: "pen", color: "#f8fafc", size: 2, points: [[490, 165], [575, 165]] }, // Frame 1: search(10)
          { tool: "pen", color: "#34d399", size: 2, points: [[490, 215], [590, 215]] }  // Base Case match!
        ]
      },
      {
        id: "seg-5",
        startTime: 35,
        endTime: 45,
        englishText: "Because the tree is balanced, our time complexity for search is optimal at O(log n).",
        translations: {
          hi: "क्योंकि पेड़ संतुलित है, खोज के लिए हमारी time complexity O(log n) पर इष्टतम है।",
          bn: "যেহেতু গাছটি সুষম, অনুসন্ধানের জন্য আমাদের time complexity O(log n)-এ সর্বোত্তম।",
          ar: "نظرًا لأن الشجرة متوازنة، فإن time complexity للبحث هي الأفضل عند O(log n).",
          es: "Debido a que el árbol está balanceado, nuestra time complexity para buscar es óptima en O(log n).",
          fr: "Parce que l'arbre est équilibré, notre time complexity pour la recherche est optimale à O(log n)."
        },
        strokes: [
          // Formula writing: T(n) = O(log n)
          { tool: "pen", color: "#ec4899", size: 4, points: [[50, 270], [80, 270], [65, 270], [65, 310]] }, // T
          { tool: "pen", color: "#ec4899", size: 3, points: [[90, 280], [85, 290], [90, 300]] }, // (
          { tool: "pen", color: "#ec4899", size: 3, points: [[95, 280], [95, 300], [105, 300], [105, 280]] }, // n
          { tool: "pen", color: "#ec4899", size: 3, points: [[110, 280], [115, 290], [110, 300]] }, // )
          { tool: "pen", color: "#ec4899", size: 3, points: [[125, 285], [140, 285]] }, // =
          { tool: "pen", color: "#ec4899", size: 3, points: [[125, 295], [140, 295]] },
          { tool: "pen", color: "#ec4899", size: 4, points: [[160, 270], [150, 290], [160, 310], [170, 290], [160, 270]] }, // O
          { tool: "pen", color: "#ec4899", size: 3, points: [[180, 270], [240, 270], [240, 310], [180, 310], [180, 270]] } // log n box
        ]
      }
    ]
  },
  {
    id: "cs202-polymorphism",
    title: "CS202: Object Oriented Design & Polymorphism",
    instructor: "Dr. R. Mehta",
    course: "Computer Science 202",
    date: "Yesterday",
    isLive: false,
    durationSeconds: 38,
    technicalTerms: ["polymorphism", "inheritance", "virtual method", "vtable", "abstract class", "override"],
    segments: [
      {
        id: "p-seg-1",
        startTime: 0,
        endTime: 10,
        englishText: "Polymorphism lets a derived class override a virtual method defined in an abstract class.",
        translations: {
          hi: "Polymorphism एक डिराइव्ड क्लास को abstract class में परिभाषित virtual method को override करने की अनुमति देता है।",
          bn: "Polymorphism একটি ডেরিভড ক্লাসকে abstract class-এ সংজ্ঞায়িত virtual method ওভাররাইড করতে দেয়।",
          ar: "يسمح Polymorphism لفئة مشتقة بتجاوز virtual method المعرفة في abstract class.",
          es: "Polymorphism permite que una clase derivada sobrescriba un virtual method definido en una abstract class.",
          fr: "Le Polymorphism permet à une classe dérivée de redéfinir une virtual method définie dans une abstract class."
        },
        strokes: [
          // Class diagram: Base Shape class
          { tool: "pen", color: "#38bdf8", size: 3, points: [[200, 30], [380, 30], [380, 100], [200, 100], [200, 30]] },
          { tool: "pen", color: "#38bdf8", size: 2, points: [[200, 60], [380, 60]] },
          { tool: "pen", color: "#f8fafc", size: 2, points: [[240, 48], [340, 48]] }, // Shape (Abstract)
          { tool: "pen", color: "#34d399", size: 2, points: [[210, 80], [360, 80]] }  // + draw(): virtual
        ]
      },
      {
        id: "p-seg-2",
        startTime: 10,
        endTime: 24,
        englishText: "Notice how Circle and Rectangle inherit from Shape, each providing their custom implementation.",
        translations: {
          hi: "ध्यान दें कि कैसे Circle और Rectangle Shape से inherit करते हैं, प्रत्येक अपना कस्टम इम्प्लीमेंटेशन प्रदान करता है।",
          bn: "লক্ষ্য করুন কীভাবে Circle এবং Rectangle Shape থেকে ইনহেরিট করে, প্রতিটি তাদের কাস্টম ইমপ্লিমেন্টেশন প্রদান করে।",
          ar: "لاحظ كيف يرث Circle و Rectangle من Shape، ويرسم كل منهما تنفيذه الخاص.",
          es: "Observe cómo Circle y Rectangle heredan de Shape, proporcionando cada uno su implementación personalizada.",
          fr: "Remarquez comment Circle et Rectangle héritent de Shape, chacun fournissant sa propre implémentation."
        },
        strokes: [
          // Inheritance Arrows
          { tool: "pen", color: "#64748b", size: 2, points: [[240, 100], [130, 160]] },
          { tool: "pen", color: "#64748b", size: 2, points: [[340, 100], [450, 160]] },
          // Derived Circle Class Box
          { tool: "pen", color: "#a855f7", size: 3, points: [[50, 160], [210, 160], [210, 230], [50, 230], [50, 160]] },
          { tool: "pen", color: "#a855f7", size: 2, points: [[50, 190], [210, 190]] },
          { tool: "pen", color: "#f8fafc", size: 2, points: [[80, 178], [180, 178]] }, // Circle
          { tool: "pen", color: "#f8fafc", size: 2, points: [[60, 210], [195, 210]] }, // + draw() override
          // Derived Rectangle Class Box
          { tool: "pen", color: "#a855f7", size: 3, points: [[370, 160], [550, 160], [550, 230], [370, 230], [370, 160]] },
          { tool: "pen", color: "#a855f7", size: 2, points: [[370, 190], [550, 190]] },
          { tool: "pen", color: "#f8fafc", size: 2, points: [[390, 178], [520, 178]] }, // Rectangle
          { tool: "pen", color: "#f8fafc", size: 2, points: [[380, 210], [535, 210]] }  // + draw() override
        ]
      },
      {
        id: "p-seg-3",
        startTime: 24,
        endTime: 38,
        englishText: "At runtime, the compiler resolves function pointers through the vtable structure.",
        translations: {
          hi: "रनटाइम पर, संकलक vtable संरचना के माध्यम से फ़ंक्शन पॉइंटर्स को हल करता है।",
          bn: "রানটাইমে, কম্পাইলার vtable কাঠামোর মাধ্যমে ফাংশন পয়েন্টার সমাধান করে।",
          ar: "في وقت التشغيل، يقوم المترجم بحل مؤشرات الوظائف من خلال بنية vtable.",
          es: "En tiempo de ejecución, el compilador resuelve los punteros de función a través de la estructura vtable.",
          fr: "Au moment de l'exécution, le compilateur résout les pointeurs de fonction via la structure vtable."
        },
        strokes: [
          // vtable Diagram
          { tool: "pen", color: "#f59e0b", size: 2, points: [[200, 260], [400, 260], [400, 320], [200, 320], [200, 260]] },
          { tool: "pen", color: "#f59e0b", size: 2, points: [[300, 260], [300, 320]] },
          { tool: "pen", color: "#38bdf8", size: 2, points: [[210, 290], [290, 290]] }, // vptr
          { tool: "pen", color: "#34d399", size: 2, points: [[310, 290], [390, 290]] }  // fn_ptr -> Circle::draw
        ]
      }
    ]
  },
  {
    id: "cs305-os-locks",
    title: "CS305: Operating Systems - Mutex Locks & Semaphores",
    instructor: "Prof. K. Patel",
    course: "Computer Science 305",
    date: "3 Days Ago",
    isLive: false,
    durationSeconds: 30,
    technicalTerms: ["semaphore", "mutex lock", "deadlock", "race condition", "critical section", "thread pool"],
    segments: [
      {
        id: "os-seg-1",
        startTime: 0,
        endTime: 12,
        englishText: "To prevent a race condition, threads must acquire a mutex lock before entering a critical section.",
        translations: {
          hi: "race condition को रोकने के लिए, थ्रेड्स को critical section में प्रवेश करने से पहले एक mutex lock प्राप्त करना होगा।",
          bn: "একটি race condition প্রতিরোধ করতে, থ্রেডগুলিকে একটি critical section-এ প্রবেশের আগে অবশ্যই একটি mutex lock অর্জন করতে হবে।",
          ar: "من أجل منع race condition، يجب على السلاسل الحصول على mutex lock قبل دخول critical section.",
          es: "Para evitar una race condition, los hilos deben adquirir un mutex lock antes de ingresar a una critical section.",
          fr: "Pour éviter une race condition, les threads doivent acquérir un mutex lock avant d'entrer dans une critical section."
        },
        strokes: [
          // Critical section Box
          { tool: "pen", color: "#ef4444", size: 3, points: [[150, 60], [450, 60], [450, 160], [150, 160], [150, 60]] },
          { tool: "pen", color: "#f8fafc", size: 2, points: [[200, 110], [400, 110]] }, // CRITICAL SECTION
          // Padlock Icon Drawing
          { tool: "pen", color: "#f59e0b", size: 3, points: [[80, 90], [120, 90], [120, 140], [80, 140], [80, 90]] },
          { tool: "pen", color: "#f59e0b", size: 3, points: [[90, 90], [90, 70], [110, 70], [110, 90]] }
        ]
      },
      {
        id: "os-seg-2",
        startTime: 12,
        endTime: 30,
        englishText: "A counting semaphore allows N threads concurrently, guarding against deadlock scenarios.",
        translations: {
          hi: "एक counting semaphore एन थ्रेड्स को एक साथ अनुमति देता है, जिससे deadlock परिदृश्यों से सुरक्षा मिलती है।",
          bn: "একটি counting semaphore এন থ্রেডকে একসাথে অনুমোদন করে, deadlock পরিস্থিতি রক্ষা করে।",
          ar: "يسمح counting semaphore لعدد N من السلاسل بالتزامن، مما يحمي من سيناريوهات deadlock.",
          es: "Un counting semaphore permite N hilos simultáneamente, protegiendo contra escenarios de deadlock.",
          fr: "Un counting semaphore autorise N threads simultanément, protégeant contre les scénarios de deadlock."
        },
        strokes: [
          // Semaphore Counter Queue
          { tool: "pen", color: "#38bdf8", size: 2, points: [[100, 200], [500, 200]] },
          { tool: "pen", color: "#38bdf8", size: 2, points: [[100, 260], [500, 260]] },
          { tool: "pen", color: "#38bdf8", size: 2, points: [[200, 200], [200, 260]] },
          { tool: "pen", color: "#38bdf8", size: 2, points: [[300, 200], [300, 260]] },
          { tool: "pen", color: "#38bdf8", size: 2, points: [[400, 200], [400, 260]] },
          // Threads T1, T2, T3 in Queue
          { tool: "pen", color: "#34d399", size: 2, points: [[130, 230], [170, 230]] },
          { tool: "pen", color: "#34d399", size: 2, points: [[230, 230], [270, 230]] },
          { tool: "pen", color: "#34d399", size: 2, points: [[330, 230], [370, 230]] }
        ]
      }
    ]
  }
];

const SUPPORTED_LANGUAGES = [
  { code: "hi", name: "हिन्दी (Hindi)", flag: "🇮🇳", ttsCode: "hi-IN" },
  { code: "bn", name: "বাংলা (Bangla)", flag: "🇧🇩", ttsCode: "bn-BD" },
  { code: "ar", name: "العربية (Arabic)", flag: "🇸🇦", ttsCode: "ar-SA" },
  { code: "es", name: "Español (Spanish)", flag: "🇪🇸", ttsCode: "es-ES" },
  { code: "fr", name: "Français (French)", flag: "🇫🇷", ttsCode: "fr-FR" },
  { code: "en", name: "English (Original)", flag: "🇬🇧", ttsCode: "en-US" }
];
