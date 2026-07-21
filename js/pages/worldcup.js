// ================================================================
// World Cup 2026: groups/fixtures data, live countdown, match status, champion celebration + fireworks.
// Part of the Fairouz World FM app scripts — loaded in this exact
// order from preview-2026.html (all files share the same global
// scope, same as the original single inline <script>).
// ================================================================

// ── World Cup 2026 ──
const WC_TEAMS = {
  GER:{en:'Germany',ar:'ألمانيا',iso:'de'}, PAR:{en:'Paraguay',ar:'باراغواي',iso:'py'},
  NED:{en:'Netherlands',ar:'هولندا',iso:'nl'}, MAR:{en:'Morocco',ar:'المغرب',iso:'ma'},
  CIV:{en:'Ivory Coast',ar:'ساحل العاج',iso:'ci'}, NOR:{en:'Norway',ar:'النرويج',iso:'no'},
  FRA:{en:'France',ar:'فرنسا',iso:'fr'}, SWE:{en:'Sweden',ar:'السويد',iso:'se'},
  MEX:{en:'Mexico',ar:'المكسيك',iso:'mx'}, ECU:{en:'Ecuador',ar:'الإكوادور',iso:'ec'},
  ENG:{en:'England',ar:'إنجلترا',iso:'gb-eng'}, COD:{en:'Congo DR',ar:'الكونغو الديمقراطية',iso:'cd'},
  BEL:{en:'Belgium',ar:'بليجكا',iso:'be'}, SEN:{en:'Senegal',ar:'السنغال',iso:'sn'},
  USA:{en:'USA',ar:'الولايات المتحدة',iso:'us'}, BIH:{en:'Bosnia & Herzegovina',ar:'البوسنة والهرسك',iso:'ba'},
  ESP:{en:'Spain',ar:'إسبانيا',iso:'es'}, AUT:{en:'Austria',ar:'النمسا',iso:'at'},
  POR:{en:'Portugal',ar:'البرتغال',iso:'pt'}, CRO:{en:'Croatia',ar:'كرواتيا',iso:'hr'},
  SUI:{en:'Switzerland',ar:'سويسرا',iso:'ch'}, DZA:{en:'Algeria',ar:'الجزائر',iso:'dz'},
  AUS:{en:'Australia',ar:'أستراليا',iso:'au'}, EGY:{en:'Egypt',ar:'مصر',iso:'eg'},
  ARG:{en:'Argentina',ar:'الأرجنتين',iso:'ar'}, CPV:{en:'Cape Verde',ar:'الرأس الأخضر',iso:'cv'},
  COL:{en:'Colombia',ar:'كولومبيا',iso:'co'}, GHA:{en:'Ghana',ar:'غانا',iso:'gh'},
  CAN:{en:'Canada',ar:'كندا',iso:'ca'}, BRA:{en:'Brazil',ar:'البرازيل',iso:'br'},
  RSA:{en:'South Africa',ar:'جنوب أفريقيا',iso:'za'}, JPN:{en:'Japan',ar:'اليابان',iso:'jp'},
  KOR:{en:'South Korea',ar:'كوريا الجنوبية',iso:'kr'}, CZE:{en:'Czechia',ar:'التشيك',iso:'cz'},
  QAT:{en:'Qatar',ar:'قطر',iso:'qa'},
  SCO:{en:'Scotland',ar:'اسكتلندا',iso:'gb-sct'}, HAI:{en:'Haiti',ar:'هايتي',iso:'ht'},
  TUR:{en:'Türkiye',ar:'تركيا',iso:'tr'},
  CUW:{en:'Curaçao',ar:'كوراساو',iso:'cw'},
  TUN:{en:'Tunisia',ar:'تونس',iso:'tn'},
  W83:{en:'TBD',ar:'يُحدد لاحقًا',iso:null}
};

const WC_MATCHES = [
  // ── Group A ──
  {id:'wcA1',stage:{en:'Group A · Matchday 1',ar:'المجموعة A · الجولة 1'},home:'MEX',away:'RSA',kickoff:'2026-06-11T19:00:00Z',status:'final',score:{home:2,away:0},note:{en:'Quiñones (9) and Jiménez (67) scored for Mexico; South Africa had three players sent off (Sithole 49, Zwane 73) and Mexico\'s Montes was also dismissed in the 92nd minute',ar:'كينيونيس (9) وخيمينيز (67) سجلا للمكسيك، وطُرد لاعبان من جنوب أفريقيا (سيتهولي 49، وزواني 73) بينما طُرد مونتيس من المكسيك في الدقيقة 92'},free:false,venue:{stadium:{en:'Estadio Azteca',ar:'استاد أزتيكا'},country:{en:'Mexico',ar:'المكسيك'}}},

  {id:'wcA2',stage:{en:'Group A · Matchday 1',ar:'المجموعة A · الجولة 1'},home:'KOR',away:'CZE',kickoff:'2026-06-12T02:00:00Z',status:'final',score:{home:2,away:1},note:{en:'Krejčí (59) put Czechia ahead before Hwang In-beom (67) and Oh Hyeon-gyu (80) completed South Korea\'s comeback',ar:'كريتشي (59) قدّم التشيك بالتسجيل، قبل أن يكمل هوانج إن-بيوم (67) وأوه هيون-جيو (80) عودة كوريا الجنوبية'},free:false,venue:{stadium:{en:'Estadio Akron',ar:'استاد أكرون'},country:{en:'Mexico',ar:'المكسيك'}}},

  {id:'wcA3',stage:{en:'Group A · Matchday 2',ar:'المجموعة A · الجولة 2'},home:'CZE',away:'RSA',kickoff:'2026-06-18T16:00:00Z',status:'final',score:{home:1,away:1},note:{en:'Sadílek (6) put Czechia ahead early; Mokoena converted a penalty (83) to earn South Africa a draw',ar:'ساديليك (6) قدّم التشيك مبكرًا، وأدرك موكوينا التعادل لجنوب أفريقيا من ركلة جزاء (83)'},free:false,venue:{stadium:{en:'Mercedes-Benz Stadium',ar:'ملعب مرسيدس-بنز'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'wcA4',stage:{en:'Group A · Matchday 2',ar:'المجموعة A · الجولة 2'},home:'MEX',away:'KOR',kickoff:'2026-06-18T19:00:00Z',status:'final',score:{home:1,away:0},note:{en:'Romo (50) scored the only goal after a goalkeeping error, sending Mexico through as the first team to reach the round of 32',ar:'رومو (50) سجل الهدف الوحيد بعد خطأ من حارس مرمى كوريا، ليصبح المنتخب المكسيكي أول منتخب يتأهل رسميًا لدور الـ32'},free:false,venue:{stadium:{en:'Estadio Akron',ar:'استاد أكرون'},country:{en:'Mexico',ar:'المكسيك'}}},

  {id:'wcA5',stage:{en:'Group A · Matchday 3',ar:'المجموعة A · الجولة 3'},home:'CZE',away:'MEX',kickoff:'2026-06-25T01:00:00Z',status:'final',score:{home:0,away:3},note:{en:'Chávez (55), Quiñones (61) and substitute Fidalgo (90+4) scored as Mexico won all three group games for the first time in their history',ar:'تشافيز (55) وكينيونيس (61) والبديل فيدالجو (90+4) سجلوا، لتفوز المكسيك بمبارياتها الثلاث في دور المجموعات لأول مرة في تاريخها'},free:false,venue:{stadium:{en:'Estadio Azteca',ar:'استاد أزتيكا'},country:{en:'Mexico',ar:'المكسيك'}}},

  {id:'wcA6',stage:{en:'Group A · Matchday 3',ar:'المجموعة A · الجولة 3'},home:'RSA',away:'KOR',kickoff:'2026-06-25T01:00:00Z',status:'final',score:{home:1,away:0},note:{en:'Maseko (63) scored the only goal, sending South Africa through as Group A runners-up and eliminating South Korea',ar:'ماسيكو (63) سجل الهدف الوحيد، ليتأهل منتخب جنوب أفريقيا وصيفًا للمجموعة A ويُخرج كوريا الجنوبية من البطولة'},free:false,venue:{stadium:{en:'Estadio BBVA',ar:'استاد بي بي في إيه'},country:{en:'Mexico',ar:'المكسيك'}}},

  // ── Group B ──
  {id:'wcB1',stage:{en:'Group B · Matchday 1',ar:'المجموعة B · الجولة 1'},home:'CAN',away:'BIH',kickoff:'2026-06-12T19:00:00Z',status:'final',score:{home:1,away:1},note:{en:'Lukić (21) put Bosnia ahead before substitute Larin (78) earned Canada their first-ever World Cup point',ar:'لوكيتش (21) قدّم البوسنة بالتسجيل، قبل أن يدرك البديل لارين (78) لكندا أول نقطة لها في تاريخ كأس العالم'},free:false,venue:{stadium:{en:'BMO Field',ar:'ملعب بي إم أو'},country:{en:'Canada',ar:'كندا'}}},

  {id:'wcB2',stage:{en:'Group B · Matchday 1',ar:'المجموعة B · الجولة 1'},home:'QAT',away:'SUI',kickoff:'2026-06-13T19:00:00Z',status:'final',score:{home:1,away:1},note:{en:'Embolo converted a penalty (17) for Switzerland; Qatar leveled deep into stoppage time (90+4) via a Muheim own goal for their first-ever World Cup point',ar:'إمبولو سجل من ركلة جزاء (17) لسويسرا، وأدركت قطر التعادل في الوقت بدل الضائع (90+4) بهدف في مرمى سويسرا (مهيم)، لتحقق أول نقطة لها في تاريخ كأس العالم'},free:false,venue:{stadium:{en:"Levi's Stadium",ar:'ملعب ليفايز'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'wcB3',stage:{en:'Group B · Matchday 2',ar:'المجموعة B · الجولة 2'},home:'SUI',away:'BIH',kickoff:'2026-06-18T19:00:00Z',status:'final',score:{home:4,away:1},note:{en:'Substitute Manzambi (74, 90) and Vargas (84) struck after Bosnia\'s Muharemović was sent off (80); Xhaka added a stoppage-time penalty (90+7), with Mahmić (90+3) replying for ten-man Bosnia',ar:'البديل مانزامبي (74، 90) وفارغاس (84) سجلوا بعد طرد موحاريموفيتش من البوسنة (80)، وأضاف تشاكا ركلة جزاء في الوقت بدل الضائع (90+7)، وسجل ماهميتش (90+3) هدف البوسنة صاحبة العشرة لاعبين'},free:false,venue:{stadium:{en:'SoFi Stadium',ar:'ملعب سوفاي'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'wcB4',stage:{en:'Group B · Matchday 2',ar:'المجموعة B · الجولة 2'},home:'CAN',away:'QAT',kickoff:'2026-06-18T22:00:00Z',status:'final',score:{home:6,away:0},note:{en:'Larin (16) and a Jonathan David hat-trick (29, 45+3, 90+2) led Canada\'s first-ever World Cup win, with Saliba (64) and a Manai own goal (75) completing the rout of nine-man Qatar; Canada\'s Koné suffered a serious leg injury after a challenge by Madibo, who was sent off along with Ahmed',ar:'لارين (16) وهاتريك لجوناثان ديفيد (29، 45+3، 90+2) قادا كندا لأول فوز لها في تاريخ كأس العالم، وأضاف ساليبا (64) وهدف عكسي (ماناي، 75) لتكتمل الإبادة أمام قطر صاحبة التسعة لاعبين؛ الكندي كونيه تعرّض لإصابة خطيرة في الساق إثر تدخل من مضيبو الذي طُرد مع أحمد'},free:false,venue:{stadium:{en:'BC Place',ar:'ملعب بي سي بليس'},country:{en:'Canada',ar:'كندا'}}},

  {id:'wcB5',stage:{en:'Group B · Matchday 3',ar:'المجموعة B · الجولة 3'},home:'SUI',away:'CAN',kickoff:'2026-06-24T19:00:00Z',status:'final',score:{home:2,away:1},note:{en:'Vargas (46) and Manzambi (57) put Switzerland in control to win Group B; substitute Promise David (76) pulled one back for co-hosts Canada, who finished runners-up',ar:'فارغاس (46) ومانزامبي (57) قدّما سويسرا للسيطرة والتتويج بصدارة المجموعة B، وقلّص البديل بروميس ديفيد (76) الفارق لكندا المضيفة التي أنهت المجموعة وصيفة'},free:false,venue:{stadium:{en:'BC Place',ar:'ملعب بي سي بليس'},country:{en:'Canada',ar:'كندا'}}},

  {id:'wcB6',stage:{en:'Group B · Matchday 3',ar:'المجموعة B · الجولة 3'},home:'BIH',away:'QAT',kickoff:'2026-06-24T23:00:00Z',status:'final',score:{home:3,away:1},note:{en:'Teenager Alajbegović (29) and an Abunada own goal (34) put Bosnia in control before Al-Haydos (42) replied for Qatar; Mahmić (80) sealed a third-place finish for Bosnia and elimination for Qatar',ar:'الشاب علاييغوفيتش (29) وهدف عكسي (أبو نضة، 34) قدّما البوسنة، ثم قلّص الحيدوس (42) الفارق لقطر، قبل أن يحسم ماهميتش (80) تأهل البوسنة ثالثة وخروج قطر من البطولة'},free:false,venue:{stadium:{en:'Lumen Field',ar:'ملعب لومين فيلد'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  // ── Group C ──
  {id:'wcC1',stage:{en:'Group C · Matchday 1',ar:'المجموعة C · الجولة 1'},home:'BRA',away:'MAR',kickoff:'2026-06-13T22:00:00Z',status:'final',score:{home:1,away:1},note:{en:'Saibari (21) put Morocco ahead before Vinícius Jr (32) leveled for Brazil in a heavyweight draw',ar:'الصيباري (21) قدّم المغرب بالتسجيل، وأدرك فينيسيوس جونيور (32) التعادل للبرازيل في مواجهة الثقلين'},free:false,venue:{stadium:{en:'MetLife Stadium',ar:'ملعب ميتلايف'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'wcC2',stage:{en:'Group C · Matchday 1',ar:'المجموعة C · الجولة 1'},home:'HAI',away:'SCO',kickoff:'2026-06-14T01:00:00Z',status:'final',score:{home:0,away:1},note:{en:'McGinn (28) scored a deflected winner, Scotland\'s first World Cup victory in 36 years',ar:'ماكغين (28) سجل هدف الفوز بتسديدة مرتدة، محققًا أول فوز لاسكتلندا في كأس العالم منذ 36 عامًا'},free:false,venue:{stadium:{en:'Gillette Stadium',ar:'ملعب جيليت'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'wcC3',stage:{en:'Group C · Matchday 2',ar:'المجموعة C · الجولة 2'},home:'SCO',away:'MAR',kickoff:'2026-06-19T22:00:00Z',status:'final',score:{home:0,away:1},note:{en:'Saibari (2) scored Morocco\'s fastest-ever World Cup goal to seal all three points',ar:'الصيباري (2) سجل أسرع هدف للمغرب في تاريخ كأس العالم ليحسم النقاط الثلاث'},free:false,venue:{stadium:{en:'Gillette Stadium',ar:'ملعب جيليت'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'wcC4',stage:{en:'Group C · Matchday 2',ar:'المجموعة C · الجولة 2'},home:'BRA',away:'HAI',kickoff:'2026-06-20T01:00:00Z',status:'final',score:{home:3,away:0},note:{en:'A Cunha double (23, 36) and a Vinícius Jr strike (45+3) eliminated Haiti from contention',ar:'ثنائية لكونها (23، 36) وهدف لفينيسيوس جونيور (45+3) أخرجت هايتي من المنافسة على التأهل'},free:false,venue:{stadium:{en:'Lincoln Financial Field',ar:'ملعب لينكولن فايننشال فيلد'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'wcC5',stage:{en:'Group C · Matchday 3',ar:'المجموعة C · الجولة 3'},home:'SCO',away:'BRA',kickoff:'2026-06-24T22:00:00Z',status:'final',score:{home:0,away:3},note:{en:'Vinícius Jr (7, 45+3) and Cunha (60) secured top spot in the group for Brazil and left Scotland relying on other results',ar:'فينيسيوس جونيور (7، 45+3) وكونها (60) حسموا صدارة المجموعة للبرازيل، وتركوا اسكتلندا في انتظار نتائج المجموعات الأخرى'},free:false,venue:{stadium:{en:'Hard Rock Stadium',ar:'ملعب هارد روك'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'wcC6',stage:{en:'Group C · Matchday 3',ar:'المجموعة C · الجولة 3'},home:'MAR',away:'HAI',kickoff:'2026-06-24T22:00:00Z',status:'final',score:{home:4,away:2},note:{en:'Haiti scored their first World Cup goals in 52 years through a Bounou own goal (10) and Isidor (43); Morocco fought back through Hakimi (39), Saibari (45+1) and substitutes Rahimi (78) and Yassine (89) to advance as runners-up',ar:'سجلت هايتي أول أهدافها في كأس العالم منذ 52 عامًا عبر هدف في مرمى بونو (10) وهدف إيسيدور (43)، لكن المغرب ردّ عبر حكيمي (39) والصيباري (45+1) والبديلين رحيمي (78) وياسين (89) ليتأهل وصيفًا'},free:false,venue:{stadium:{en:'Mercedes-Benz Stadium',ar:'ملعب مرسيدس-بنز'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  // ── Group D ──
  {id:'wcD1',stage:{en:'Group D · Matchday 1',ar:'المجموعة D · الجولة 1'},home:'USA',away:'PAR',kickoff:'2026-06-13T01:00:00Z',status:'final',score:{home:4,away:1},note:{en:'A Bobadilla own goal (7) and a Balogun double (31, 45+5) put co-hosts USA in control; Mauricio (73) pulled one back before Reyna (90+8) completed the rout',ar:'هدف عكسي (بوباديّا، 7) وثنائية لبالوغون (31، 45+5) قدّما المضيف الأمريكي، وقلّص ماوريسيو الفارق (73)، قبل أن يكمل رينا الإبادة (90+8)'},free:true,venue:{stadium:{en:'SoFi Stadium',ar:'ملعب سوفاي'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'wcD2',stage:{en:'Group D · Matchday 1',ar:'المجموعة D · الجولة 1'},home:'AUS',away:'TUR',kickoff:'2026-06-14T04:00:00Z',status:'final',score:{home:2,away:0},note:{en:'Irankunda (27) and Metcalfe (75) scored on the counter as Australia stunned Türkiye',ar:'إيرانكوندا (27) وميتكالف (75) سجلا في هجمات مرتدة ليفاجئ المنتخب الأسترالي تركيا'},free:false,venue:{stadium:{en:'BC Place',ar:'ملعب بي سي بليس'},country:{en:'Canada',ar:'كندا'}}},

  {id:'wcD3',stage:{en:'Group D · Matchday 2',ar:'المجموعة D · الجولة 2'},home:'USA',away:'AUS',kickoff:'2026-06-19T19:00:00Z',status:'final',score:{home:2,away:0},note:{en:'A Burgess own goal (11) and a Freeman header (43) sent co-hosts USA into the round of 32 with a game to spare',ar:'هدف عكسي (بيرغيس، 11) ورأسية لفريمان (43) أهّلا المضيف الأمريكي لدور الـ32 قبل نهاية دور المجموعات'},free:true,venue:{stadium:{en:'Lumen Field',ar:'ملعب لومين فيلد'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'wcD4',stage:{en:'Group D · Matchday 2',ar:'المجموعة D · الجولة 2'},home:'TUR',away:'PAR',kickoff:'2026-06-20T04:00:00Z',status:'final',score:{home:0,away:1},note:{en:'Galarza scored after just 64 seconds, the tournament\'s fastest goal at the time, to hand Türkiye a second straight defeat',ar:'غالارثا سجل بعد 64 ثانية فقط من الصافرة، وهو أسرع هدف في البطولة حتى تلك اللحظة، ليمنح باراغواي فوزًا ألحق بتركيا خسارتها الثانية على التوالي'},free:false,venue:{stadium:{en:"Levi's Stadium",ar:'ملعب ليفايز'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'wcD5',stage:{en:'Group D · Matchday 3',ar:'المجموعة D · الجولة 3'},home:'TUR',away:'USA',kickoff:'2026-06-26T02:00:00Z',status:'final',score:{home:3,away:2},note:{en:'Trusty (3) and Berhalter (49) scored for a much-changed USA side who had already won the group; Güler (10), Kökçü (31) and a stoppage-time winner from Ayhan (90+8) gave already-eliminated Türkiye a consolation victory',ar:'تراستي (3) وبيرهالتر (49) سجلا لتشكيلة أمريكية مُبدَّلة كانت قد حسمت صدارة المجموعة، بينما سجل غولر (10) وكوكشو (31) وهدف الفوز في الوقت بدل الضائع لأيهان (90+8)، ليحقق المنتخب التركي المودَّع من البطولة فوزًا تعويضيًا'},free:false,venue:{stadium:{en:'SoFi Stadium',ar:'ملعب سوفاي'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'wcD6',stage:{en:'Group D · Matchday 3',ar:'المجموعة D · الجولة 3'},home:'PAR',away:'AUS',kickoff:'2026-06-26T02:00:00Z',status:'final',score:{home:0,away:0},note:{en:'A goalless draw sent Australia through as group runners-up and left Paraguay waiting on other results to advance as one of the best third-placed teams',ar:'التعادل السلبي أهّل أستراليا وصيفة للمجموعة، وتركَ باراغواي في انتظار نتائج المجموعات الأخرى للتأهل كأحد أفضل المنتخبات الثالثة'},free:false,venue:{stadium:{en:"Levi's Stadium",ar:'ملعب ليفايز'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  // ── Group E ──
  {id:'wcE1',stage:{en:'Group E · Matchday 1',ar:'المجموعة E · الجولة 1'},home:'GER',away:'CUW',kickoff:'2026-06-14T17:00:00Z',status:'final',score:{home:7,away:1},note:{en:'Nmecha (6), Schlotterbeck (38), a Havertz penalty (45+5), Musiala (47), Brown (68), Undav (78) and a second Havertz goal (88) routed World Cup debutants Curaçao, who replied through Comenencia (21) — the smallest nation ever at a World Cup scoring its first-ever goal',ar:'نميشا (6) وشلوتربيك (38) وهافرتز من ركلة جزاء (45+5) وموسيالا (47) وبراون (68) وأونداف (78) وهافرتز مجددًا (88) سحقوا كوراساو في أول ظهور لها بكأس العالم، وردّت عبر كومينينسيا (21) في أول هدف لأصغر دولة تشارك في تاريخ البطولة'},free:false,venue:{stadium:{en:'NRG Stadium',ar:'ملعب إن آر جي'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'wcE2',stage:{en:'Group E · Matchday 1',ar:'المجموعة E · الجولة 1'},home:'CIV',away:'ECU',kickoff:'2026-06-14T19:00:00Z',status:'final',score:{home:1,away:0},note:{en:'Substitute Amad Diallo scored a stoppage-time-adjacent winner (90) after Ecuador twice struck the woodwork',ar:'البديل أماد ديالو سجل هدف الفوز قرب نهاية الوقت الأصلي (90) بعدما ارتطمت الكرة بالعارضة مرتين لصالح الإكوادور'},free:false,venue:{stadium:{en:'Lincoln Financial Field',ar:'ملعب لينكولن فايننشال فيلد'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'wcE3',stage:{en:'Group E · Matchday 2',ar:'المجموعة E · الجولة 2'},home:'GER',away:'CIV',kickoff:'2026-06-20T20:00:00Z',status:'final',score:{home:2,away:1},note:{en:'Kessié (30) put Ivory Coast ahead before substitute Undav scored twice (68, 90+4) to send Germany through with a game to spare',ar:'كيسييه (30) قدّم ساحل العاج بالتسجيل، قبل أن يسجل البديل أونداف مرتين (68، 90+4) ليتأهل المنتخب الألماني قبل نهاية دور المجموعات'},free:false,venue:{stadium:{en:'BMO Field',ar:'ملعب بي إم أو'},country:{en:'Canada',ar:'كندا'}}},

  {id:'wcE4',stage:{en:'Group E · Matchday 2',ar:'المجموعة E · الجولة 2'},home:'ECU',away:'CUW',kickoff:'2026-06-20T19:00:00Z',status:'final',score:{home:0,away:0},note:{en:'Curaçao goalkeeper Eloy Room made a tournament-record 15 saves to earn his nation\'s first-ever World Cup point despite Ecuador\'s dominance',ar:'حارس كوراساو إيلوي روم قدّم 15 تصديًا في رقم قياسي بالبطولة، ليمنح بلاده أول نقطة في تاريخها بكأس العالم رغم سيطرة الإكوادور'},free:false,venue:{stadium:{en:'Arrowhead Stadium',ar:'ملعب أروهيد'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'wcE5',stage:{en:'Group E · Matchday 3',ar:'المجموعة E · الجولة 3'},home:'CUW',away:'CIV',kickoff:'2026-06-25T20:00:00Z',status:'final',score:{home:0,away:2},note:{en:'A Nicolas Pépé brace (7, 64) sent Ivory Coast into the knockout stage for the first time in their history, ending Curaçao\'s historic debut campaign',ar:'ثنائية لنيكولا بيبيه (7، 64) أهّلت ساحل العاج لدور الإقصاء لأول مرة في تاريخه، لتنتهي مشاركة كوراساو الأولى التاريخية في كأس العالم'},free:false,venue:{stadium:{en:'Lincoln Financial Field',ar:'ملعب لينكولن فايننشال فيلد'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'wcE6',stage:{en:'Group E · Matchday 3',ar:'المجموعة E · الجولة 3'},home:'ECU',away:'GER',kickoff:'2026-06-25T20:00:00Z',status:'final',score:{home:2,away:1},note:{en:'Sané\'s early strike (2) put already-qualified Germany ahead, but Angulo (9) and a late Plata goal (77) completed a stunning Ecuador comeback that sent them through as one of the best third-placed teams',ar:'هدف سانيه المبكر (2) قدّم ألمانيا المتأهلة أصلًا، لكن أنغولو (9) وهدف بلاتا المتأخر (77) أكملا عودة إكوادورية مذهلة أهّلتها كأحد أفضل المنتخبات الثالثة'},free:false,venue:{stadium:{en:'MetLife Stadium',ar:'ملعب ميتلايف'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  // ── Group F ──
  {id:'wcF1',stage:{en:'Group F · Matchday 1',ar:'المجموعة F · الجولة 1'},home:'NED',away:'JPN',kickoff:'2026-06-14T20:00:00Z',status:'final',score:{home:2,away:2},note:{en:'Van Dijk (50) and Summerville (64) put the Netherlands ahead twice, but Nakamura (57) and a late deflected header credited to Kamada (89) earned Japan a share of the points',ar:'فان دايك (50) وسومرفيل (64) قدّما هولندا مرتين، لكن ناكامورا (57) وهدف متأخر محتسب لكامادا بعد ارتطام (89) منحا اليابان نقطة التعادل'},free:false,venue:{stadium:{en:'AT&T Stadium',ar:'ملعب إيه تي آند تي'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'wcF2',stage:{en:'Group F · Matchday 1',ar:'المجموعة F · الجولة 1'},home:'SWE',away:'TUN',kickoff:'2026-06-14T20:00:00Z',status:'final',score:{home:5,away:1},note:{en:'Ayari struck twice from distance (7, 90+6) either side of goals from Isak (30) and Gyökeres (59); substitute Svanberg (84) scored 18 seconds after coming on, with Rekik (43) replying for Tunisia',ar:'أياري سجل مرتين من بعيد (7، 90+6) بين هدفين لإيزاك (30) وجوكيريش (59)، وأضاف البديل سفانبيرغ (84) هدفًا بعد 18 ثانية من دخوله، وسجل ريكيك (43) هدف تونس'},free:false,venue:{stadium:{en:'Estadio BBVA',ar:'استاد بي بي في إيه'},country:{en:'Mexico',ar:'المكسيك'}}},

  {id:'wcF3',stage:{en:'Group F · Matchday 2',ar:'المجموعة F · الجولة 2'},home:'NED',away:'SWE',kickoff:'2026-06-20T17:00:00Z',status:'final',score:{home:5,away:1},note:{en:'A Brobbey brace (5, 17) and a Gakpo double (47, 54) put the Netherlands in full control before substitute Elanga (59) and Summerville (89) completed the scoring',ar:'ثنائية لبروبي (5، 17) وأخرى لخاكبو (47، 54) قدّمتا هولندا بقوة، وأضاف البديل إيلانغا (59) هدف السويد قبل أن يختم سومرفيل التسجيل (89)'},free:false,venue:{stadium:{en:'NRG Stadium',ar:'ملعب إن آر جي'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'wcF4',stage:{en:'Group F · Matchday 2',ar:'المجموعة F · الجولة 2'},home:'TUN',away:'JPN',kickoff:'2026-06-21T03:00:00Z',status:'final',score:{home:0,away:4},note:{en:'Kamada\'s fourth-minute strike was Japan\'s fastest-ever World Cup goal; Ueda added a brace (31, 83) either side of Ito (69) to eliminate Tunisia in the tournament\'s 1,000th match',ar:'هدف كامادا في الدقيقة الرابعة كان أسرع هدف لليابان في تاريخ كأس العالم، وأضاف أويدا ثنائية (31، 83) بين هدفين لإيتو (69)، ليُقصى المنتخب التونسي في المباراة رقم 1000 في تاريخ البطولة'},free:false,venue:{stadium:{en:'Estadio BBVA',ar:'استاد بي بي في إيه'},country:{en:'Mexico',ar:'المكسيك'}}},

  {id:'wcF5',stage:{en:'Group F · Matchday 3',ar:'المجموعة F · الجولة 3'},home:'JPN',away:'SWE',kickoff:'2026-06-25T23:00:00Z',status:'final',score:{home:1,away:1},note:{en:'Maeda (56) put Japan ahead before Elanga (62) leveled to send both sides through to the round of 32',ar:'مايدا (56) قدّم اليابان بالتسجيل، وأدرك إيلانغا التعادل (62) ليتأهل الفريقان معًا لدور الـ32'},free:false,venue:{stadium:{en:'AT&T Stadium',ar:'ملعب إيه تي آند تي'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'wcF6',stage:{en:'Group F · Matchday 3',ar:'المجموعة F · الجولة 3'},home:'TUN',away:'NED',kickoff:'2026-06-25T23:00:00Z',status:'final',score:{home:1,away:3},note:{en:'A Skhiri own goal (3) and Brobbey (7) put the Netherlands in control; Mastouri (54) briefly gave Tunisia hope before a Van Hecke header (62) sealed top spot in the group for the Dutch',ar:'هدف عكسي (سخيري، 3) وهدف بروبي (7) قدّما هولندا، وقلّص ماستوري الفارق (54) قبل أن تحسم رأسية فان هيكه (62) صدارة المجموعة للمنتخب الهولندي'},free:false,venue:{stadium:{en:'Arrowhead Stadium',ar:'ملعب أروهيد'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'53452539',stage:{en:'Round of 32',ar:'دور الـ32'},home:'RSA',away:'CAN',kickoff:'2026-06-28T19:00:00Z',status:'final',score:{home:0,away:1},note:{en:'Eustáquio scored the only goal (90+2)',ar:'يوستاكيو سجل الهدف الوحيد في الدقيقة (90+2)'},free:false,venue:{stadium:{en:'SoFi Stadium',ar:'ملعب سوفاي'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'53452545',stage:{en:'Round of 32',ar:'دور الـ32'},home:'BRA',away:'JPN',kickoff:'2026-06-29T17:00:00Z',status:'final',score:{home:2,away:1},note:{en:'Sano (29) for Japan; Casemiro (56) and Martinelli (90+6) for Brazil',ar:'سانو (29) لليابان، وكاسيميرو (56) ومارتينيلي (90+6) للبرازيل'},free:false,venue:{stadium:{en:'NRG Stadium',ar:'ملعب إن آر جي'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'53452541',stage:{en:'Round of 32',ar:'دور الـ32'},home:'GER',away:'PAR',kickoff:'2026-06-29T20:30:00Z',status:'final',score:{home:1,away:1},pens:{home:3,away:4},note:{en:'Enciso (42) for Paraguay, Havertz (54) for Germany; PAR won 4-3 on penalties',ar:'إنسيسو (42) لباراغواي، وهافرتز (54) لألمانيا؛ باراغواي فازت 4-3 بركلات الترجيح'},free:false,venue:{stadium:{en:'Gillette Stadium',ar:'ملعب جيليت'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'53452547',stage:{en:'Round of 32',ar:'دور الـ32'},home:'NED',away:'MAR',kickoff:'2026-06-30T01:00:00Z',status:'final',score:{home:1,away:1},pens:{home:2,away:3},note:{en:'Gakpo (72) for Netherlands, Diop (90+1) for Morocco; MAR won 3-2 on penalties',ar:'غاكبو (72) لهولندا، وديوب (90+1) للمغرب؛ المغرب فاز 3-2 بركلات الترجيح'},free:false,venue:{stadium:{en:'Estadio BBVA',ar:'استاد بي بي في إيه'},country:{en:'Mexico',ar:'المكسيك'}}},

  {id:'53452561',stage:{en:'Round of 32',ar:'دور الـ32'},home:'CIV',away:'NOR',kickoff:'2026-06-30T17:00:00Z',status:'final',score:{home:1,away:2},note:{en:'Nusa (39) and Haaland (86) for Norway; Diallo (74) for Ivory Coast',ar:'نوسا (39) وهالاند (86) للنرويج، وديالو (74) لساحل العاج'},free:false,venue:{stadium:{en:'AT&T Stadium',ar:'ملعب إيه تي آند تي'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'53452543',stage:{en:'Round of 32',ar:'دور الـ32'},home:'FRA',away:'SWE',kickoff:'2026-06-30T21:00:00Z',status:'final',score:{home:3,away:0},note:{en:'Mbappé (45, 74) and Barcola (53) scored for France',ar:'مبابي (45، 74) وباركولا (53) سجلوا لفرنسا'},free:false,venue:{stadium:{en:'MetLife Stadium',ar:'ملعب ميتلايف'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'53452563',stage:{en:'Round of 32',ar:'دور الـ32'},home:'MEX',away:'ECU',kickoff:'2026-07-01T02:00:00Z',status:'final',score:{home:2,away:0},note:{en:'Quiñones (22) and Jiménez (31) scored for Mexico',ar:'كينيونيس (22) وخيمينيز (31) سجلا للمكسيك'},free:true,venue:{stadium:{en:'Estadio Azteca',ar:'استاد أزتيكا'},country:{en:'Mexico',ar:'المكسيك'}}},

  {id:'53452565',stage:{en:'Round of 32',ar:'دور الـ32'},home:'ENG',away:'COD',kickoff:'2026-07-01T16:00:00Z',status:'final',score:{home:2,away:1},note:{en:'Cipenga (7) for Congo DR; Kane (75, 86) scored twice for England',ar:'سيبينغا (7) للكونغو الديمقراطية؛ كين (75، 86) سجل مرتين لإنجلترا'},free:false,venue:{stadium:{en:'Mercedes-Benz Stadium',ar:'ملعب مرسيدس-بنز'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'53452555',stage:{en:'Round of 32',ar:'دور الـ32'},home:'BEL',away:'SEN',kickoff:'2026-07-01T20:00:00Z',status:'final',score:{home:3,away:2},note:{en:'Diarra (25) and Sarr (51) put Senegal 2-0 up; Lukaku (86) and Tielemans (89, then a 120+5 penalty) completed Belgium\'s extra-time comeback',ar:'ديارا (25) وسار (51) قدّما السنغال بهدفين؛ ثم لوكاكو (86) وتيليمانس (89، وركلة جزاء في الدقيقة 120+5) أكملا عودة بلجيكا في الوقت الإضافي'},free:false,venue:{stadium:{en:'Lumen Field',ar:'ملعب لومين فيلد'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'53452553',stage:{en:'Round of 32',ar:'دور الـ32'},home:'USA',away:'BIH',kickoff:'2026-07-02T00:00:00Z',status:'final',score:{home:2,away:0},note:{en:'Balogun (45) and Tillman (82) scored for the USA',ar:'بالوغون (45) وتيلمان (82) سجلا لأمريكا'},free:true,venue:{stadium:{en:"Levi's Stadium",ar:'ملعب ليفايز'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'53452551',stage:{en:'Round of 32',ar:'دور الـ32'},home:'ESP',away:'AUT',kickoff:'2026-07-02T19:00:00Z',status:'final',score:{home:3,away:0},note:{en:'Oyarzabal (36, 89) and Porro (66) scored for Spain',ar:'أويارثابال (36، 89) وبورو (66) سجلا لإسبانيا'},free:false,venue:{stadium:{en:'SoFi Stadium',ar:'ملعب سوفاي'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'53452549',stage:{en:'Round of 32',ar:'دور الـ32'},home:'POR',away:'CRO',kickoff:'2026-07-02T23:00:00Z',status:'final',score:{home:2,away:1},note:{en:'Perisic (53) for Croatia; Ronaldo penalty (68) and Ramos (90+4) won it for Portugal',ar:'بيريسيتش (53) لكرواتيا؛ ثم ركلة جزاء رونالدو (68) وهدف راموش (90+4) منحا الفوز للبرتغال'},free:false,venue:{stadium:{en:'BMO Field',ar:'ملعب بي إم أو'},country:{en:'Canada',ar:'كندا'}}},

  {id:'53452505',stage:{en:'Round of 32',ar:'دور الـ32'},home:'SUI',away:'DZA',kickoff:'2026-07-03T03:00:00Z',status:'final',score:{home:2,away:0},note:{en:'Embolo (10) and Ndoye (46) scored for Switzerland',ar:'إمبولو (10) وندوي (46) سجلا لسويسرا'},free:true,channels:['beIN SPORTS (free) + beIN SPORTS MAX'],venue:{stadium:{en:'BC Place',ar:'ملعب بي سي بليس'},country:{en:'Canada',ar:'كندا'}}},

  {id:'53452503',stage:{en:'Round of 32',ar:'دور الـ32'},home:'AUS',away:'EGY',kickoff:'2026-07-03T18:00:00Z',status:'final',score:{home:1,away:1},pens:{home:2,away:4},note:{en:'Ashour (13) for Egypt, Hany own goal (55) for Australia; EGY won 4-2 on penalties',ar:'عاشور (13) لمصر، وهدف حاني في مرماه (55) لأستراليا؛ مصر فازت 4-2 بركلات الترجيح'},free:true,channels:['beIN SPORTS (free) + beIN SPORTS MAX'],venue:{stadium:{en:'AT&T Stadium',ar:'ملعب إيه تي آند تي'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'53452569',stage:{en:'Round of 32',ar:'دور الـ32'},home:'ARG',away:'CPV',kickoff:'2026-07-03T22:00:00Z',status:'final',score:{home:3,away:2},note:{en:'Messi (29) and Duarte (59) traded goals, then extra time saw L. Martínez (92) and Lopes Cabral (103) level again before a Borges own goal (111) won it for Argentina',ar:'تبادل ميسي (29) ودوارتي (59) الأهداف، وفي الوقت الإضافي تعادل الفريقان مجددًا عبر ل. مارتينيز (92) ولوبيز كابرال (103)، قبل أن يمنح هدف بورغيس في مرماه (111) الفوز للأرجنتين'},free:false,channels:['beIN SPORTS MAX 2 + beIN SPORTS MAX 4'],venue:{stadium:{en:'Hard Rock Stadium',ar:'ملعب هارد روك'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'53452507',stage:{en:'Round of 32',ar:'دور الـ32'},home:'COL',away:'GHA',kickoff:'2026-07-04T01:30:00Z',status:'final',score:{home:1,away:0},note:{en:'Arias (14) scored the only goal for Colombia',ar:'أرياس (14) سجل الهدف الوحيد لكولومبيا'},free:true,channels:['beIN SPORTS MAX 1 + beIN SPORTS MAX 3 (free)'],venue:{stadium:{en:'Arrowhead Stadium',ar:'ملعب أروهيد'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'53452511',stage:{en:'Round of 16',ar:'دور الـ16'},home:'CAN',away:'MAR',kickoff:'2026-07-04T17:00:00Z',status:'final',score:{home:0,away:3},note:{en:'Ounahi (50, 82) and Rahimi (90+8) scored for Morocco',ar:'أوناحي (50، 82) وراحيمي (90+8) سجلوا للمغرب'},free:false,venue:{stadium:{en:'NRG Stadium',ar:'ملعب إن آر جي'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'53452509',stage:{en:'Round of 16',ar:'دور الـ16'},home:'PAR',away:'FRA',kickoff:'2026-07-04T21:00:00Z',status:'final',score:{home:0,away:1},note:{en:'Mbappé converted a penalty (70) for France\'s winner',ar:'مبابي سجل من ركلة جزاء (70) هدف فوز فرنسا'},free:false,venue:{stadium:{en:'Lincoln Financial Field',ar:'ملعب لينكولن فايننشال فيلد'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'53452517',stage:{en:'Round of 16',ar:'دور الـ16'},home:'BRA',away:'NOR',kickoff:'2026-07-05T20:00:00Z',status:'final',score:{home:1,away:2},note:{en:'Haaland (79, 90) put Norway through; Neymar penalty (90+10) was Brazil\'s late consolation',ar:'هالاند (79، 90) قاد النرويج للتأهل، وسجل نيمار ركلة جزاء (90+10) هدف تقليص متأخر للبرازيل'},free:false,venue:{stadium:{en:'MetLife Stadium',ar:'ملعب ميتلايف'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'53452519',stage:{en:'Round of 16',ar:'دور الـ16'},home:'MEX',away:'ENG',kickoff:'2026-07-06T00:00:00Z',status:'final',score:{home:2,away:3},note:{en:'Bellingham (36, 38) and a Kane penalty (60) for England; Quiñones (42) and a Jiménez penalty for Mexico',ar:'بيلينغهام (36، 38) وركلة جزاء كين (60) لإنجلترا، وكينيونيس (42) وركلة جزاء خيمينيز للمكسيك'},free:false,venue:{stadium:{en:'Estadio Azteca',ar:'استاد أزتيكا'},country:{en:'Mexico',ar:'المكسيك'}}},

  {id:'53452513',stage:{en:'Round of 16',ar:'دور الـ16'},home:'POR',away:'ESP',kickoff:'2026-07-06T19:00:00Z',status:'final',score:{home:0,away:1},note:{en:'Merino scored the winner in stoppage time',ar:'ميرينو سجل هدف الفوز في الوقت بدل الضائع'},free:false,venue:{stadium:{en:'AT&T Stadium',ar:'ملعب إيه تي آند تي'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'53452515',stage:{en:'Round of 16',ar:'دور الـ16'},home:'USA',away:'BEL',kickoff:'2026-07-07T00:00:00Z',status:'final',score:{home:1,away:4},note:{en:'De Ketelaere (9, 33) and Vanaken (57) put Belgium in control; Tillman (31) briefly leveled for the USA before Lukaku (90+3) sealed it',ar:'دي كيتيلاره (9، 33) وفاناكن (57) منحوا بلجيكا السيطرة، وتيلمان (31) عادل النتيجة مؤقتًا لأمريكا قبل أن يحسم لوكاكو (90+3) النتيجة'},free:false,venue:{stadium:{en:'Lumen Field',ar:'ملعب لومين فيلد'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'53452521',stage:{en:'Round of 16',ar:'دور الـ16'},home:'ARG',away:'EGY',kickoff:'2026-07-07T16:00:00Z',status:'final',score:{home:3,away:2},dispute:{en:'(Egypt exited amid a major refereeing/VAR controversy)',ar:'(مصر خرجت وسط جدل تحكيمي واسع حول قرارات الفار)'},note:{en:'Ibrahim (15) and Zico (67) put Egypt 2-0 up; Romero (79), Messi (83) and Fernández (90+2) completed Argentina\'s comeback',ar:'إبراهيم (15) وزيكو (67) قدّما مصر بهدفين نظيفين، ثم أكمل روميرو (79) وميسي (83) وفرنانديز (90+2) عودة الأرجنتين المذهلة'},free:false,channels:['beIN SPORTS MAX'],venue:{stadium:{en:'Mercedes-Benz Stadium',ar:'ملعب مرسيدس-بنز'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'53452523',stage:{en:'Round of 16',ar:'دور الـ16'},home:'SUI',away:'COL',kickoff:'2026-07-07T20:00:00Z',status:'final',score:{home:0,away:0},pens:{home:4,away:3},note:{en:'Goalless after 120 minutes; Switzerland won 4-3 on penalties, R. Vargas scoring the decisive spot-kick',ar:'تعادل سلبي بعد 120 دقيقة؛ سويسرا فازت 4-3 بركلات الترجيح، وسجل ر. فارغاس ركلة الحسم'},free:false,channels:['beIN SPORTS MAX'],venue:{stadium:{en:'BC Place',ar:'ملعب بي سي بليس'},country:{en:'Canada',ar:'كندا'}}},

  {id:'wcQF1',stage:{en:'Quarterfinal',ar:'ربع النهائي'},home:'MAR',away:'FRA',kickoff:'2026-07-09T16:00:00Z',status:'final',score:{home:0,away:2},note:{en:'Mbappé (60) and Dembélé (66) sent France through; Mbappé had also missed a first-half penalty, saved by Bounou',ar:'مبابي (60) وديمبلي (66) قادا فرنسا لنصف النهائي، بعدما أهدر مبابي ركلة جزاء تصدى لها بونو في الشوط الأول'},free:false,channels:['beIN SPORTS MAX'],venue:{stadium:{en:'Gillette Stadium',ar:'ملعب جيليت'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'wcQF2',stage:{en:'Quarterfinal',ar:'ربع النهائي'},home:'BEL',away:'ESP',kickoff:'2026-07-10T19:00:00Z',status:'final',score:{home:1,away:2},note:{en:'Ruiz (30) put Spain ahead before De Ketelaere (45) leveled for Belgium; substitute Merino (88) scored the winner after a goalkeeping error by Belgium\'s Lammens, sending Spain through to face France',ar:'رويز (30) قدّم إسبانيا بالتسجيل، وأدرك دي كيتيلاريه (45) التعادل لبلجيكا، قبل أن يسجل البديل مرينو (88) هدف الفوز إثر خطأ من حارس بلجيكا البديل لامنس، ليتأهل المنتخب الإسباني لمواجهة فرنسا في نصف النهائي'},free:false,venue:{stadium:{en:'SoFi Stadium',ar:'ملعب سوفاي'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'wcQF3',stage:{en:'Quarterfinal',ar:'ربع النهائي'},home:'NOR',away:'ENG',kickoff:'2026-07-11T21:00:00Z',status:'final',score:{home:1,away:2},note:{en:'Schjelderup (35) shocked England with the opener before Bellingham leveled in first-half stoppage time (45+2) and struck the extra-time winner (93); Norway also had a goal by Heggem disallowed for a Haaland foul in the buildup',ar:'شيلدروب (35) فاجأ إنجلترا بهدف التقدم، قبل أن يدرك بيلينغهام التعادل في الوقت بدل الضائع الأول (45+2) ثم يسجل هدف الفوز في الوقت الإضافي (93)؛ كما أُلغي هدف ثانٍ لهيغم بداعي خطأ من هالاند قبل التسجيل'},free:false,venue:{stadium:{en:'Hard Rock Stadium',ar:'ملعب هارد روك'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'wcQF4',stage:{en:'Quarterfinal',ar:'ربع النهائي'},home:'ARG',away:'SUI',kickoff:'2026-07-12T01:00:00Z',status:'final',score:{home:3,away:1},note:{en:'Mac Allister (10) headed Argentina ahead from a Messi corner; Ndoye (67) leveled for Switzerland before Embolo was sent off (72) for simulation after a VAR review; Alvarez\'s stunning long-range strike (112) and a late Lautaro Martínez goal (120+1) sent Argentina through',ar:'ماك أليستر (10) قدّم الأرجنتين برأسية من ركنية نفذها ميسي، وأدرك ندوي (67) التعادل لسويسرا قبل طرد إمبولو (72) بعد مراجعة الفار لمحاكاته الإصابة، ثم حسم ألفاريز الأمر بتسديدة رائعة من بعيد (112) وأضاف لاوتارو مارتينيز هدفًا متأخرًا (120+1) ليتأهل المنتخب الأرجنتيني'},free:false,venue:{stadium:{en:'Arrowhead Stadium',ar:'ملعب أروهيد'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'wcSF1',stage:{en:'Semifinal',ar:'نصف النهائي'},home:'FRA',away:'ESP',kickoff:'2026-07-14T19:00:00Z',status:'scheduled',free:false,venue:{stadium:{en:'AT&T Stadium',ar:'ملعب إيه تي آند تي'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'wcSF2',stage:{en:'Semifinal',ar:'نصف النهائي'},home:'ENG',away:'ARG',kickoff:'2026-07-15T19:00:00Z',status:'scheduled',free:false,venue:{stadium:{en:'Mercedes-Benz Stadium',ar:'ملعب مرسيدس-بنز'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'wcThird2026',stage:{en:'Third place',ar:'مباراة تحديد المركز الثالث'},home:'W83',away:'W83',kickoff:'2026-07-18T21:00:00Z',status:'scheduled',free:true,note:{en:'Contested by the two semifinal losers',ar:'تجمع بين خاسرَي مباراتَي نصف النهائي'},venue:{stadium:{en:'Hard Rock Stadium',ar:'ملعب هارد روك'},country:{en:'USA',ar:'الولايات المتحدة'}}},

  {id:'wcFinal2026',stage:{en:'Final',ar:'النهائي'},home:'W83',away:'W83',kickoff:'2026-07-19T19:00:00Z',status:'scheduled',free:true,winner:null,venue:{stadium:{en:'MetLife Stadium',ar:'ملعب ميتلايف'},country:{en:'USA',ar:'الولايات المتحدة'}}}

];
const WC_FINAL_MATCH_ID = 'wcFinal2026';
let wcTimerHandle = null;
let wcCurrentFilter = 'upcoming';
let wcInitialized = false;

// لا يوجد أي اتصال بأي API خارجي هنا. كل بيانات المباريات (المواعيد، النتائج،
// القنوات الناقلة) تُقرأ مباشرة من مصفوفة WC_MATCHES بالأسفل، وبالتالي الصفحة
// تتحدّث فورًا لكل الزوار بمجرد تعديل هذه المصفوفة، بدون أي طلب شبكة أو مفتاح API.

function wcMatchWindow(m){
  const start = new Date(m.kickoff);
  const end = new Date(start.getTime() + 180*60000); 
  return {start,end};
}

function wcStatusOf(m, now){
  // لا وجود لحالة "مباشر": المباراة إما "قادمة" أو "منتهية" (بعد إدخال نتيجتها يدويًا في WC_MATCHES).
  return m.status==='final' ? 'finished' : 'upcoming';
}

function wcFmtClock(d, lang){
  return toLatinDigits(d.toLocaleTimeString(lang==='ar'?'ar-EG':'en-US',{hour:'2-digit',minute:'2-digit'}));
}

function wcFmtDate(d, lang){
  return toLatinDigits(d.toLocaleDateString(lang==='ar'?'ar-EG':'en-US',{weekday:'short',day:'numeric',month:'short'}));
}

function wcCountdownStr(ms, lang){
  if(ms<=0) return lang==='ar' ? 'بدأت المباراة' : 'Kicked off';
  const total = Math.floor(ms/1000);
  const h = String(Math.floor(total/3600)).padStart(2,'0');
  const mnt = String(Math.floor((total%3600)/60)).padStart(2,'0');
  const s = String(total%60).padStart(2,'0');
  return h+':'+mnt+':'+s;
}

function wcFinalDayIsOver(m, now){
  const k = new Date(m.kickoff);
  const dayEnd = new Date(k.getFullYear(), k.getMonth(), k.getDate()+1, 0, 0, 0, 0);
  return now >= dayEnd;
}

// دالة الرندرة
function wcRenderFixtures(){
  const wrap = document.getElementById('wcFixtures');
  if(!wrap) return;
  const lang = currentLang;
  const now = new Date();
  wrap.innerHTML = '';
  let cardIndex = 0;
  let lastDateKey = null;

  WC_MATCHES.slice().sort((a,b)=> (wcCurrentFilter==='upcoming' || wcCurrentFilter==='all')
    ? new Date(a.kickoff) - new Date(b.kickoff)
    : new Date(b.kickoff) - new Date(a.kickoff)
  ).forEach(m=>{
    const st = wcStatusOf(m, now);
    const isFinalMatch = (m.id === WC_FINAL_MATCH_ID);
    if(isFinalMatch){
      const dayOver = wcFinalDayIsOver(m, now);
      if(wcCurrentFilter === 'final'){
        // always visible in the Final tab, before and after the match
      } else if(wcCurrentFilter === 'all' && dayOver){
        // once its day has fully passed, it also counts as part of "All"
      } else {
        return;
      }
    } else if(wcCurrentFilter === 'final'){
      return;
    } else if(wcCurrentFilter!=='all' && wcCurrentFilter!==st){
      return;
    }
    const home = WC_TEAMS[m.home], away = WC_TEAMS[m.away];
    const kickoff = new Date(m.kickoff);

    const dateKey = kickoff.getFullYear()+'-'+kickoff.getMonth()+'-'+kickoff.getDate();
    if(dateKey!==lastDateKey){
      lastDateKey = dateKey;
      const heading = document.createElement('div');
      heading.className = 'wc-date-heading';
      heading.textContent = '📅 ' + wcFmtDate(kickoff, lang);
      wrap.appendChild(heading);
    }

    const card = document.createElement('div');
    card.className = 'wc-match-card';
    card.dataset.matchId = m.id;
    card.dataset.status = st;
    if(isFinalMatch) card.dataset.final = 'true';
    card.style.setProperty('--wc-delay', (Math.min(cardIndex,10) * 0.06) + 's');
    cardIndex++;

    // شارة "النهائي" تظهر بدل شارة "قادمة" على مباراة النهائي طالما لم تُلعب بعد
    const badge = st==='finished' ? '<span class="wc-badge wc-badge-finished">'+(lang==='ar'?'انتهت':'Finished')+'</span>'
      : isFinalMatch ? '<span class="wc-badge wc-badge-final">🏆 '+(lang==='ar'?'النهائي':'Final')+'</span>'
      : '<span class="wc-badge wc-badge-upcoming">'+(lang==='ar'?'قادمة':'Upcoming')+'</span>';

    const pensLabel = (st==='finished' && m.pens)
      ? '<div class="wc-pens-label">'+(lang==='ar'
          ? '(ركلات الترجيح '+m.pens.home+'-'+m.pens.away+')'
          : '(Penalties '+m.pens.home+'-'+m.pens.away+')')+'</div>'
      : '';
    const disputeLabel = (st==='finished' && m.dispute)
      ? '<div class="wc-dispute-label">'+(lang==='ar'?m.dispute.ar:m.dispute.en)+'</div>'
      : '';
    const scoreOrVs = st==='finished'
      ? '<div class="wc-score-col">'+pensLabel+'<div class="wc-score">'+(m.score.home+' — '+m.score.away)+'</div>'+disputeLabel+'</div>'
      : '<div class="wc-vs">'+wcFmtClock(kickoff,lang)+'</div>';

    const noteHtml = m.note
      ? '<div class="wc-note" dir="auto">'+(lang==='ar'?m.note.ar:m.note.en)+'</div>' : '';

    const venueHtml = m.venue
      ? '<div class="wc-venue">🏟 '+(lang==='ar'?m.venue.stadium.ar:m.venue.stadium.en)+' ('+(lang==='ar'?m.venue.country.ar:m.venue.country.en)+')</div>'
      : '';

    let channelText = (m.channels && m.channels.length) ? m.channels.join(' + ') : (m.free ? (lang==='ar' ? 'beIN SPORTS المفتوحة + beIN SPORTS MAX' : 'beIN SPORTS (free) + beIN SPORTS MAX') : 'beIN SPORTS MAX');

    let countdownHtml = '';
    if(st==='upcoming'){
      countdownHtml = '<div class="wc-countdown" data-kickoff="'+m.kickoff+'">⏱ '+wcCountdownStr(kickoff-now, lang)+'</div>';
    }

    const homeFlag = home.iso ? '<img class="wc-flag-img" src="https://flagcdn.com/40x30/'+home.iso+'.png" alt="'+(lang==='ar'?home.ar:home.en)+'" loading="lazy">' : '<span class="wc-flag-placeholder">?</span>';
    const awayFlag = away.iso ? '<img class="wc-flag-img" src="https://flagcdn.com/40x30/'+away.iso+'.png" alt="'+(lang==='ar'?away.ar:away.en)+'" loading="lazy">' : '<span class="wc-flag-placeholder">?</span>';

    card.innerHTML =
      '<div class="wc-match-top"><span class="wc-match-stage">'+(lang==='ar'?m.stage.ar:m.stage.en)+'</span>'+badge+'</div>'+
      '<div class="wc-match-mid">'+
        '<div class="wc-team">'+homeFlag+'<span>'+(lang==='ar'?home.ar:home.en)+'</span></div>'+
        scoreOrVs+
        '<div class="wc-team right"><span>'+(lang==='ar'?away.ar:away.en)+'</span>'+awayFlag+'</div>'+
      '</div>'+
      noteHtml+
      '<div class="wc-match-bottom">'+
        '<div class="wc-datetime">📅 '+wcFmtDate(kickoff,lang)+' — '+wcFmtClock(kickoff,lang)+' ('+(lang==='ar'?'بتوقيت القاهرة':'Cairo time')+')</div>'+
        venueHtml+
        countdownHtml+
        '<div class="wc-channel"><span class="ic">📺</span>'+channelText+'</div>'+
      '</div>';
    wrap.appendChild(card);
  });
  if(!wrap.children.length){
    wrap.innerHTML = '<div class="wc-datetime" style="padding:12px 0;">'+(lang==='ar'?'لا توجد مباريات في هذا القسم حاليًا.':'No matches in this section right now.')+'</div>';
  }
  wcSyncFinalTabFireworks();
}

// ... باقي الدوال (wcGetFinalMatch, wcApplyLifecycle, wcStartFireworks, etc.) كما هي ...
// تأكد من بقاء الدوال الأخيرة initWorldCupPage و load كما هي في ملفك الأصلي

function wcGetFinalMatch(){
  return WC_MATCHES.find(m=>m.id===WC_FINAL_MATCH_ID);
}

function wcLifecyclePhase(now){
  const final = wcGetFinalMatch();
  if(!final || final.status!=='final' || !final.winner) return {phase:'ongoing'};
  const {end} = wcMatchWindow(final);
  const daysSince = (now - end) / 86400000;
  if(daysSince < 3) return {phase:'champion', final, daysSince};
  return {phase:'removed', final, daysSince};
}

function wcRenderChampion(final){
  const lang = currentLang;
  const winner = WC_TEAMS[final.winner];
  if(!winner) return;
  const flagEl = document.getElementById('wcChampionFlag');
  if(flagEl) {
    flagEl.src = winner.iso ? 'https://flagcdn.com/160x120/'+winner.iso+'.png' : '';
    flagEl.alt = lang==='ar' ? winner.ar : winner.en;
  }
  const name = lang==='ar' ? winner.ar : winner.en;
  const titleEl = document.getElementById('wcChampionTitle');
  if(titleEl) {
    titleEl.textContent = lang==='ar'
      ? ('🎉 مبروك لـ ' + name + ' بطلة كأس العالم 2026 🎉')
      : ('🎉 Congratulations ' + name + ' — 2026 World Cup Champions 🎉');
  }
}

function wcApplyLifecycle(){
  const now = new Date();
  const {phase, final} = wcLifecyclePhase(now);
  const navBtns = document.querySelectorAll('.nav-item[data-page="worldcup"]');
  const pageEl = document.getElementById('page-worldcup');
  const normalEl = document.getElementById('wcNormalContent');
  const champEl = document.getElementById('wcChampionSection');

  if(phase==='removed'){
    navBtns.forEach(b=>b.style.display='none');
    if(pageEl){
      pageEl.style.display='none';
      if(pageEl.style.display==='none' && document.querySelector('.nav-item[data-page="worldcup"].active')){
        const homeBtn = document.querySelector('.nav-item[data-page="home"]');
        if(homeBtn) homeBtn.click();
      }
    }
    wcStopFireworks('wcFireworksCanvas');
    wcStopFireworks('wcFinalTabFireworks');
    return false;
  }

  navBtns.forEach(b=>b.style.display='');
  if(phase==='champion'){
    if(normalEl) normalEl.style.display='none';
    if(champEl) champEl.style.display='flex';
    wcRenderChampion(final);
    wcStartFireworks('wcFireworksCanvas');
  } else {
    if(normalEl) normalEl.style.display='';
    if(champEl) champEl.style.display='none';
    wcStopFireworks('wcFireworksCanvas');
  }
  return true;
}

// مجموعة ألوان الألعاب النارية الحقيقية — كل فرقعة بتاخد كذا لون منها مع بعض
const WC_FW_COLOR_POOL = [
  '#ffd166', // gold
  '#ff5c5c', // red
  '#ff9d5c', // amber/orange
  '#7ee8fa', // ice blue
  '#5ce1e6', // cyan
  '#b98bff', // violet
  '#ff6b8b', // pink
  '#8bffb0', // emerald green
  '#ffffff', // white sparkle
  '#ffe066'  // yellow
];

function wcPickBurstColors(){
  const pool = WC_FW_COLOR_POOL.slice();
  const picks = [];
  const n = 3 + Math.floor(Math.random()*2); // 3 أو 4 ألوان مختلفة في نفس الفرقعة
  for(let i=0;i<n;i++){
    const idx = Math.floor(Math.random()*pool.length);
    picks.push(pool.splice(idx,1)[0]);
  }
  return picks;
}

// كل كانفاس بيشتغل بمحرك مستقل (جزيئات، حلقة رسم، متابعة الحجم) خاص بيه لوحده،
// عشان تشغيل/إيقاف كانفاس معين ما يأثرش خالص على التاني ولا يحتاج ريفرش للصفحة.
class WCFireworksEngine{
  constructor(canvas){
    this.canvas = canvas;
    this.ctx = null;
    this.particles = [];
    this.raf = null;
    this.running = false;
    this.nextSpawnAt = 0;
    this.ro = null;
    this._onResize = this._onResize.bind(this);
    this._loop = this._loop.bind(this);
  }
  _onResize(){
    if(!this.canvas) return;
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    if(this.canvas.width !== w) this.canvas.width = w;
    if(this.canvas.height !== h) this.canvas.height = h;
  }
  start(){
    if(!this.canvas) return;
    if(this.running) return; // already running — never let a second call reset live particles
    this.running = true;
    this.canvas.classList.add('wc-fw-fullscreen'); // fireworks fill the whole screen, not just their box
    this.ctx = this.canvas.getContext('2d');
    this._onResize();
    window.addEventListener('resize', this._onResize);
    if(window.ResizeObserver && !this.ro){
      // catches layout/orientation/RTL-LTR changes too, not just window resize —
      // so the canvas never gets stuck at a stale 0×0 size needing a page refresh
      this.ro = new ResizeObserver(this._onResize);
      this.ro.observe(this.canvas);
    }
    this.particles = [];
    this.nextSpawnAt = 0;
    this.raf = requestAnimationFrame(this._loop);
  }
  stop(){
    this.running = false;
    if(this.raf){ cancelAnimationFrame(this.raf); this.raf=null; }
    window.removeEventListener('resize', this._onResize);
    if(this.ro){ this.ro.disconnect(); this.ro=null; }
    if(this.ctx && this.canvas) this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    if(this.canvas) this.canvas.classList.remove('wc-fw-fullscreen');
    this.particles = [];
  }
  spawnBurst(cw,ch,forcedX,forcedY){
    const colors = wcPickBurstColors();
    let x = forcedX!=null ? forcedX : cw*(0.1+Math.random()*0.8);
    const y = forcedY!=null ? forcedY : ch*(0.1+Math.random()*0.5);
    if(forcedX==null && this._lastX!=null){
      // nudge away from wherever the last shell went up, so two bursts don't land on top of each other
      let tries=0;
      while(Math.abs(x-this._lastX) < cw*0.28 && tries<6){ x = cw*(0.1+Math.random()*0.8); tries++; }
    }
    this._lastX = x;
    // scale burst size with canvas width so it reaches far and feels big and real on mobile & desktop alike
    const scale = Math.max(1.0, Math.min(2.0, cw/760));
    const shapeRoll = Math.random();
    const isRing = shapeRoll < 0.22;
    const isWillow = !isRing && shapeRoll < 0.5;
    const isCrossette = !isRing && !isWillow && shapeRoll < 0.62;
    const count = Math.floor((isRing ? 60 : isCrossette ? 52 : 68) + Math.random()*36);

    for(let i=0;i<count;i++){
      const angle = (Math.PI*2*i)/count + Math.random()*0.15;
      let speed = (isRing ? 4.2 : 3.1) + Math.random()*(isRing?1.0:3.8);
      if(isWillow) speed *= 0.8;
      const color = colors[Math.floor(Math.random()*colors.length)];
      this.particles.push({
        x, y, px:x, py:y,
        vx: Math.cos(angle)*speed*scale,
        vy: Math.sin(angle)*speed*scale,
        life: 1,
        // ~1.8-2.6s for normal bursts, ~3-4.5s for willow trails — long enough to actually be seen
        decay: isWillow ? (0.0037+Math.random()*0.0022) : (0.0064+Math.random()*0.0042),
        drag: isWillow ? 0.992 : 0.978,
        gravity: isWillow ? 0.017 : 0.03,
        color,
        size: (isRing ? 1.5 : 1.8) + Math.random()*1.7,
        spark: Math.random() < 0.55,
        crossette: isCrossette && i%4===0,
        exploded: false
      });
    }
    // brief soft flash, mixes the burst's own colors — a real spark of light, not a flat disc
    this.particles.push({x,y,px:x,py:y,vx:0,vy:0,life:1,decay:0.09,drag:1,gravity:0,color:'#ffffff',size:15*scale,flash:true});
  }
  spawnCrossette(x,y,color,cw){
    const scale = Math.max(0.6, Math.min(1.2, cw/1000));
    const n = 4 + Math.floor(Math.random()*3);
    for(let i=0;i<n;i++){
      const angle = Math.random()*Math.PI*2;
      const speed = 1.1+Math.random()*1.8;
      this.particles.push({
        x, y, px:x, py:y,
        vx: Math.cos(angle)*speed*scale, vy: Math.sin(angle)*speed*scale,
        life: 1, decay: 0.018+Math.random()*0.012, drag: 0.97, gravity: 0.028,
        color, size: 1+Math.random(), spark:true, exploded:true
      });
    }
  }
  _loop(){
    if(!this.running || !this.ctx){ return; }
    try{
      const ctx = this.ctx, canvas = this.canvas;
      const cw = canvas.width, ch = canvas.height;

      // fully transparent each frame — this canvas sits above real page content
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0,0,cw,ch);

      if(cw > 0 && ch > 0){
        const now = performance.now();
        // mostly one shell at a time, occasionally two spaced well apart in time — a real show has gaps
        if(now >= this.nextSpawnAt && this.particles.length < 700){
          const shells = Math.random()<0.22 ? 2 : 1;
          for(let i=0;i<shells;i++){
            const delay = i*(420+Math.random()*380);
            setTimeout(()=>{ if(this.running) this.spawnBurst(canvas.width, canvas.height); }, delay);
          }
          this.nextSpawnAt = now + 1100 + Math.random()*1100;
        }

        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        const survivors = [];
        for(const p of this.particles){
          if(p.flash){
            p.life -= p.decay;
            if(p.life > 0){
              const r = p.size*(1.3-p.life*0.3);
              const grad = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r);
              grad.addColorStop(0, 'rgba(255,255,255,'+(p.life*0.85)+')');
              grad.addColorStop(0.5, 'rgba(255,255,255,'+(p.life*0.28)+')');
              grad.addColorStop(1, 'rgba(255,255,255,0)');
              ctx.globalAlpha = 1;
              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(p.x,p.y,r,0,Math.PI*2);
              ctx.fill();
              survivors.push(p);
            }
            continue;
          }
          p.px = p.x; p.py = p.y;
          p.vx *= p.drag; p.vy *= p.drag; p.vy += p.gravity;
          p.x += p.vx; p.y += p.vy;
          p.life -= p.decay;
          if(p.crossette && !p.exploded && p.life < 0.5){
            p.exploded = true;
            this.spawnCrossette(p.x,p.y,p.color,cw);
          }
          if(p.life > 0){
            const flicker = p.spark ? (0.55+Math.random()*0.45) : 1;
            const alpha = Math.max(p.life,0)*flicker;
            ctx.globalAlpha = alpha;
            // short glowing streak in the direction of motion — reads as a real spark, not a flat dot
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.size*0.85;
            ctx.beginPath();
            ctx.moveTo(p.px,p.py);
            ctx.lineTo(p.x,p.y);
            ctx.stroke();
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x,p.y,p.size*0.55,0,Math.PI*2);
            ctx.fill();
            survivors.push(p);
          }
        }
        this.particles = survivors;
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      }
    }catch(e){
      // log only — never wipe live particles just because one frame hiccuped,
      // otherwise bursts get cut off mid-animation instead of finishing naturally
      console.error('fireworks frame error:', e);
    }
    if(this.running) this.raf = requestAnimationFrame(this._loop);
  }
}

let wcChampionFwEngine = null, wcFinalTabFwEngine = null;
function wcGetFwEngine(canvasId){
  const id = canvasId || 'wcFireworksCanvas';
  if(id === 'wcFinalTabFireworks'){
    if(!wcFinalTabFwEngine){
      const el = document.getElementById('wcFinalTabFireworks');
      if(el) wcFinalTabFwEngine = new WCFireworksEngine(el);
    }
    return wcFinalTabFwEngine;
  }
  if(!wcChampionFwEngine){
    const el = document.getElementById('wcFireworksCanvas');
    if(el) wcChampionFwEngine = new WCFireworksEngine(el);
  }
  return wcChampionFwEngine;
}
function wcStartFireworks(canvasId){
  const engine = wcGetFwEngine(canvasId);
  if(engine) engine.start();
}
function wcStopFireworks(canvasId){
  const engine = wcGetFwEngine(canvasId);
  if(engine) engine.stop();
}

// تشغيل/إيقاف الألعاب النارية الخاصة بتبويب "النهائي" حسب الفلتر المفعّل حاليًا،
// بدون التأثير على الألعاب النارية الخاصة بشاشة الاحتفال بالبطل (تستخدم كانفاس ومحرك مختلف تمامًا).
function wcSyncFinalTabFireworks(){
  const finalCanvas = document.getElementById('wcFinalTabFireworks');
  if(!finalCanvas) return;
  const normalEl = document.getElementById('wcNormalContent');
  const isVisible = !normalEl || normalEl.style.display !== 'none';
  if(wcCurrentFilter === 'final' && isVisible){
    finalCanvas.style.display = '';
    wcStartFireworks('wcFinalTabFireworks');
  } else {
    finalCanvas.style.display = 'none';
    wcStopFireworks('wcFinalTabFireworks');
  }
}

// شبكة أمان إضافية: لو المستخدم رجع لتبويب المتصفح ده تاني (بعد ما كان في تبويب/تطبيق تاني)
// أو رجع للصفحة من الكاش، بنعيد مزامنة الألعاب النارية فورًا من غير ما يحتاج يعمل ريفرش.
document.addEventListener('visibilitychange', () => {
  if(document.visibilityState === 'visible'){
    wcApplyLifecycle();
    wcSyncFinalTabFireworks();
  }
});
window.addEventListener('pageshow', () => {
  wcApplyLifecycle();
  wcSyncFinalTabFireworks();
});

// ترتيب تبويبات الفلاتر: طبيعي = Upcoming, Results, Final, All.
// بمجرد الوصول لموعد المباراة النهائية (آخر البطولة)، ينتقل تبويب "النهائي"
// ليصبح أول تبويب: Final, Upcoming, Results, All — ويبقى كذلك بعدها.
let wcFinalTabAtFront = false;
function wcSyncFinalTabOrder(){
  const final = wcGetFinalMatch();
  const filtersEl = document.getElementById('wcFilters');
  if(!final || !filtersEl) return;
  const now = new Date();
  const shouldBeFirst = now >= new Date(final.kickoff);
  if(shouldBeFirst === wcFinalTabAtFront) return;
  wcFinalTabAtFront = shouldBeFirst;
  const finalBtn = filtersEl.querySelector('[data-filter="final"]');
  if(!finalBtn) return;
  if(shouldBeFirst){
    filtersEl.insertBefore(finalBtn, filtersEl.firstChild);
  } else {
    const finishedBtn = filtersEl.querySelector('[data-filter="finished"]');
    if(finishedBtn) finishedBtn.insertAdjacentElement('afterend', finalBtn);
  }
}

// تحديث العدّاد التنازلي كل ثانية لكل المباريات القادمة المعروضة حاليًا،
// بدون أي طلب شبكة — كله حساب محلي بناءً على وقت الجهاز.
function wcTick(){
  const now = new Date();
  document.querySelectorAll('.wc-countdown[data-kickoff]').forEach(el=>{
    const kickoff = new Date(el.dataset.kickoff);
    const diff = kickoff - now;
    el.textContent = '⏱ ' + wcCountdownStr(diff, currentLang);
  });
  wcSyncFinalTabOrder();
  wcSyncFinalTabFireworks(); // start()/stop() are no-ops when already in the right state
}

function initWorldCupPage(){
  const stillActive = wcApplyLifecycle();
  if(!stillActive) return; 
  
  wcSyncFinalTabOrder();
  wcRenderFixtures();
  
  if(!wcInitialized){
    const filtersEl = document.getElementById('wcFilters');
    if(filtersEl){
      filtersEl.addEventListener('click', e=>{
        const btn = e.target.closest('.wc-filter-btn');
        if(!btn) return;
        document.querySelectorAll('.wc-filter-btn').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        wcCurrentFilter = btn.dataset.filter;
        wcRenderFixtures();
      });
    }
    wcInitialized = true;
  }
  
  if(wcTimerHandle) clearInterval(wcTimerHandle);
  wcTimerHandle = setInterval(wcTick, 1000);
}

window.addEventListener('load', () => {
  (window.whenIdle || setTimeout)(() => {
    wcApplyLifecycle();
    initWorldCupPage();
  }, 1500);
});

setInterval(() => { if(wcApplyLifecycle()) wcSyncFinalTabFireworks(); }, 60 * 60 * 1000);

