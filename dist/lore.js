/* Autorskie streszczenia. Daty: Trzecia Era, rachuba używana w Dodatku B.
   Współrzędne są przybliżeniem do stylizowanej mapy, nie pomiarem geograficznym. */

export const editorialNotes = {
  canon: 'Opowieść prowadzi przez książki J.R.R. Tolkiena. Architektura i światło są autorską interpretacją z filmowym rozmachem; różnice między tekstem a ekranem zaznaczono w kronice.',
  chronology: 'Daty zapisano według Trzeciej Ery. Szlaki obejmują główne etapy podróży, także powroty; nie są katalogiem każdego postoju.',
  geography: 'Kierunki dróg, położenie rzek i sąsiedztwo krain odczytano z map oraz opisów Tolkiena. Rzeźbione karty skracają dalekie drogi, aby pomieścić je w księdze; nie zachowują jednej skali mil dla każdej lokacji. Układ nieopisanych sal i zabudowań jest interpretacją. Nota przy każdej karcie wyjaśnia jej zasięg.',
};

export const regions = [
  {
    id: 'shire', title: 'Shire', subtitle: 'Kraina okrągłych drzwi', elvish: 'Shire · Eriador', kicker: 'I · Dom, który warto ocalić', coordinates: [-30, -14],
    summary: 'Bag End jest rozległą, jednopoziomową siedzibą we Wzgórzu. Za zielonymi, okrągłymi drzwiami z mosiężną gałką biegnie wyłożony boazerią korytarz; po jego lewej stronie okna patrzą na ogród i łąki nad rzeką.',
    history: [
      'Hobbici osiedlili się tu w 1601 roku Trzeciej Ery, za zgodą króla Argeleba II. Od tej chwili liczą własną rachubę lat. Cztery ćwiartki Shire tworzą mozaikę pól, wsi i rodzinnych tradycji.',
      'Bilbo wyrusza stąd do Ereboru, a Frodo niesie Pierścień ku Mordorowi. W książce powrót prowadzi przez Porządki w Shire: hobbici sami wyzwalają zniszczoną ojczyznę i odbudowują jej ogrody.',
    ],
    characters: ['Bilbo Baggins — gospodarz Bag End i kronikarz', 'Frodo Baggins — powiernik Pierścienia', 'Sam Gamgee — ogrodnik, towarzysz i odnowiciel Shire', 'Merry i Pippin — przyjaciele, którzy dorastają w drodze'],
    facts: ['W Bag End wszystkie pokoje są na jednym poziomie; spiżarnie, kuchnie i garderoby są osobnymi pomieszczeniami.', 'Najlepsze pokoje leżą po lewej stronie korytarza, idąc od wejścia; mają głęboko osadzone okrągłe okna.', 'Filmowa trylogia pomija książkowe Porządki w Shire.'],
    storyboard: [
      { title: 'Próg', text: 'Okrągłe zielone drzwi. Za nimi bezpieczeństwo; przed nimi droga, której końca nie widać.' },
      { title: 'Odejście', text: 'Bilbo zostawia wygody. Pokolenie później Frodo zostawia je, aby inni mogli do nich wrócić.' },
      { title: 'Ogród po wojnie', text: 'Sam sadzi na nowo. Małe codzienne czynności stają się ostatnim aktem wielkiej wyprawy.' },
    ],
  },
  {
    id: 'bree', title: 'Bree', subtitle: 'Światło gospody na skrzyżowaniu dróg', elvish: 'Bree · Eriador', kicker: 'II · Na granicy znanego', coordinates: [-19, -13],
    summary: 'Kamienne domy wspinają się po zboczu; hobbickie nory zajmują wyższe partie wzgórza. W gospodzie Pod Rozbrykanym Kucykiem spotykają się plotka, gościnność i niebezpieczeństwo.',
    history: [
      'Bree stoi przy przecięciu Wielkiego Gościńca Wschodniego i Zielonej Drogi. Ludzie i hobbici od dawna mieszkają tu obok siebie, zachowując własne obyczaje. Po upadku północnego królestwa osada nadal daje schronienie wędrowcom.',
      'We wrześniu 3018 Frodo spotyka tu Obieżyświata. Niepozorny strażnik okazuje się Aragornem. Zaufanie zawarte przy świetle kominka pozwala hobbitom przetrwać dalszą drogę ku Rivendell.',
    ],
    characters: ['Barliman Butterbur — gospodarz Kucyka', 'Aragorn — Obieżyświat, strażnik Północy', 'Nob — pomocnik w gospodzie', 'Bill Ferny — mieszkaniec uwikłany w knowania'],
    facts: ['Bree-land obejmuje także Staddle, Combe i Archet.', 'Gospoda przyjmuje zarówno ludzi, jak i hobbitów.', 'Gandalf zostawił Butterburowi list dla Froda; gospodarz opóźnił jego przekazanie.'],
    storyboard: [
      { title: 'Brama po zmroku', text: 'Za żywopłotem widać okna. Przybycie do Bree jest pierwszym zetknięciem z większym światem ludzi.' },
      { title: 'Człowiek w cieniu', text: 'Aragorn obserwuje salę. Droga potrzebuje przewodnika, ale najpierw trzeba rozpoznać przyjaciela.' },
      { title: 'Puste łóżka', text: 'Nocny napad trafia w opuszczone pokoje. O świcie hobbici ruszają pod opieką strażnika.' },
    ],
  },
  {
    id: 'rivendell', title: 'Rivendell', subtitle: 'Ostatni Przyjazny Dom', elvish: 'Imladris', kicker: 'III · Dolina pamięci', coordinates: [1, -22],
    summary: 'Ukryta dolina pod zachodnimi zboczami Gór Mglistych. W szumie Bruinenu pieśń i wiedza dawnych epok spotykają troskę o tych, którzy dopiero mają wyruszyć.',
    history: [
      'Elrond założył Imladris w 1697 roku Drugiej Ery, jako schronienie podczas wojny z Sauronem. Dom chronił uchodźców i pamięć Eregionu; później wychowywali się tu spadkobiercy Isildura.',
      'Bilbo poznaje tu elfy i odczytaną przez Elronda tajemnicę mapy Thorina. W 3018 Rada Elronda postanawia zniszczyć Jedyny Pierścień. Dziewięciu towarzyszy wychodzi z doliny 25 grudnia.',
    ],
    characters: ['Elrond — gospodarz Imladris', 'Arwen — córka Elronda', 'Glorfindel — obrońca i przewodnik', 'Bilbo — poeta i badacz elfickich opowieści'],
    facts: ['Imladris jest sindarińską nazwą Rivendell.', 'Elrond nosi Vilyę, jeden z Trzech Pierścieni Elfów.', 'W książce to Glorfindel pomaga Frodowi dotrzeć do brodu; film powierza tę rolę Arwen.'],
    storyboard: [
      { title: 'Woda i jesienne liście', text: 'Dolina otwiera się pod stopami przybysza. Po trudach drogi można znów usłyszeć własne myśli.' },
      { title: 'Krąg rady', text: 'Różne ludy składają fragmenty jednej historii. Frodo przyjmuje zadanie, którego nikt nie potrafi zagwarantować.' },
      { title: 'Dziewięć cieni', text: 'Drużyna opuszcza dom Elronda. Jej siłą staje się przyjaźń ludzi, elfów, krasnoludów i hobbitów.' },
    ],
  },
  {
    id: 'gondor', title: 'Gondor', subtitle: 'Białe Miasto i pamięć Númenoru', elvish: 'Gondor · Minas Tirith', kicker: 'IV · Kamień i nadzieja', coordinates: [17, 28],
    summary: 'Na zboczu Mindolluinu wyrasta Minas Tirith. Siedem poziomów miasta patrzy ku Anduinie i wschodniemu cieniowi; za murami rozciąga się całe królestwo, od gór po morze.',
    history: [
      'Gondor założyli Isildur i Anárion w 3320 roku Drugiej Ery. Początkowo jego stolicą było Osgiliath. Wojny i upływ wieków osłabiły królestwo; w czasach Wojny o Pierścień władają nim namiestnicy.',
      'Oblężenie Minas Tirith i bitwa na Polach Pelennoru stawiają obrońców przed utratą wszystkiego. Zwycięstwo otwiera drogę powrotowi króla: Aragorn zostaje koronowany jako Elessar 1 maja 3019.',
    ],
    characters: ['Denethor — namiestnik Gondoru', 'Boromir i Faramir — synowie namiestnika', 'Aragorn — dziedzic Isildura i król Elessar', 'Imrahil — książę Dol Amroth'],
    facts: ['Minas Tirith nazywano wcześniej Minas Anor.', 'Białe Drzewo łączy Gondor z dziedzictwem Númenoru.', 'Gondor jest królestwem; rekonstrukcja skupia się na jego stolicy, Minas Tirith.'],
    storyboard: [
      { title: 'Siedem kręgów', text: 'Biała skała rozcina pierścienie murów. Miasto zdaje się wyrosłe z góry, której musi bronić.' },
      { title: 'Rogi o świcie', text: 'Na Pelennorze pojawiają się jeźdźcy Rohanu. Pomoc przychodzi przez spełnioną przysięgę.' },
      { title: 'Nowy pęd', text: 'Korona powraca do prawowitego dziedzica. Odradzające się Białe Drzewo zapowiada czas odbudowy.' },
    ],
  },
  {
    id: 'rohan', title: 'Rohan', subtitle: 'Królestwo koni i wysokich traw', elvish: 'Riddermark · Edoras', kicker: 'V · Przysięga jeźdźców', coordinates: [5, 15],
    summary: 'Wiatr przechodzi po równinie jak fala. Nad trawami stoi Edoras, a na jego wzgórzu złoty dach Meduseld — dom królów, pieśni i pamięci przodków.',
    history: [
      'W 2510 roku Trzeciej Ery Eorl Młody przybył na pomoc Gondorowi. Namiestnik Cirion oddał jego ludowi Calenardhon; przysięga obu władców związała nowe królestwo z południowym sąsiadem.',
      'Za Théodena Rohan staje przeciw wojskom Sarumana. Po obronie Rogatego Grodu jeźdźcy ruszają do Gondoru. Théoden ginie na Pelennorze; Éomer obejmuje tron, a Éowyn wybiera przyszłość u boku Faramira.',
    ],
    characters: ['Théoden — król Rohanu', 'Éomer — marszałek i przyszły król', 'Éowyn — obrończyni, która staje przeciw Wodzowi Nazgûli', 'Eorl Młody — założyciel królestwa'],
    facts: ['Stolicą Rohanu jest Edoras; Meduseld to królewska hala.', 'Rohirrim utrzymują się także z hodowli i rolnictwa.', 'Helmowy Jar mieści twierdzę Hornburg, zwaną Rogatym Grodem.'],
    storyboard: [
      { title: 'Złoty dach', text: 'Meduseld jaśnieje ponad drewnianymi domami. Wnętrze nosi opowieść o Eorlu i pierwszych jeźdźcach.' },
      { title: 'Noc pod murem', text: 'Deszcz i dźwięk rogów. Obrona Helmowego Jaru wystawia Rohan na próbę wytrwałości.' },
      { title: 'Przysięga w galopie', text: 'Théoden prowadzi odsiecz ku Minas Tirith. Sojusz sprzed pięciu stuleci znów staje się czynem.' },
    ],
  },
  {
    id: 'mordor', title: 'Mordor', subtitle: 'Kraina w cieniu Gór Popielnych', elvish: 'Gorgoroth · Orodruin', kicker: 'VI · Ostatnia droga', coordinates: [33, 23],
    summary: 'Góry zamykają horyzont, a nad Gorgoroth unosi się popiół Orodruiny. Na północnym wschodzie wyrasta Barad-dûr: potęga oparta na jednym małym przedmiocie.',
    history: [
      'Sauron obrał Mordor za swoją siedzibę w Drugiej Erze i wykuł tu Jedyny Pierścień. Ostatni Sojusz obalił jego potęgę, lecz ocalony Pierścień pozwolił zagrożeniu z czasem powrócić.',
      'W marcu 3019 Frodo i Sam przekraczają góry przez Cirith Ungol. Docierają do Szczelin Zagłady 25 marca. Upadek Golluma z Pierścieniem niszczy fundament władzy Saurona i kończy jego panowanie.',
    ],
    characters: ['Sauron — władca Mordoru', 'Frodo i Sam — dwaj hobbici w sercu cienia', 'Gollum — przewodnik, którego pragnienie domyka wyprawę', 'Nazgûle — słudzy Dziewięciu Pierścieni'],
    facts: ['Orodruin jest Górą Przeznaczenia.', 'Ephel Dúath i Ered Lithui osłaniają zachód i północ Mordoru.', 'Południowy Nurn ma pola uprawne; Mordor nie jest w całości pustkowiem.'],
    storyboard: [
      { title: 'Zamknięta brama', text: 'Morannon strzeże wejścia dla armii. Dla dwóch hobbitów potrzebna jest droga, której wróg nie oczekuje.' },
      { title: 'Ciężar', text: 'Na Gorgoroth świat kurczy się do następnego kroku. Sam pomaga nieść tego, który niesie Pierścień.' },
      { title: 'Pęknięcie świata', text: 'Pierścień wpada w ogień. Wieża rozpada się, a hobbici czekają na skalnym zboczu pośród erupcji.' },
    ],
  },
  {
    id: 'eye', title: 'Oko Saurona', subtitle: 'Spojrzenie, które szuka Pierścienia', elvish: 'Barad-dûr', kicker: 'VII · Czujność Czarnej Wieży', coordinates: [35, 18],
    summary: 'Czerwień ognia otacza pionową źrenicę. Ta osobna wizja ukazuje niepokój Powiernika i złowrogą wolę, która usiłuje przeniknąć każdą zasłonę.',
    history: [
      'W książce Oko jest znakiem Saurona i obrazem jego przenikliwego spojrzenia: Frodo doświadcza go między innymi w Zwierciadle Galadrieli i na Amon Hen. Nie należy utożsamiać całej istoty Saurona z samą gałką oka.',
      'Filmowa adaptacja przedstawia monumentalne płonące Oko pomiędzy szczytami Barad-dûr. Rekonstrukcja korzysta z tej filmowej metafory, oddzielając ją od geografii i książkowego opisu Władcy Ciemności.',
    ],
    characters: ['Sauron — wola za spojrzeniem', 'Frodo — nosiciel przedmiotu, którego Oko szuka', 'Galadriela — strażniczka Zwierciadła', 'Gandalf — przeciwnik Saurona w walce woli'],
    facts: ['Czerwone Oko jest także godłem na wyposażeniu sług Mordoru.', 'Filmowe Oko obserwuje krainę jak snop światła.', 'Sauron nie przewiduje, że jego przeciwnicy zechcą zniszczyć Pierścień.'],
    storyboard: [
      { title: 'Zwierciadło', text: 'W spokojnej wodzie ukazuje się szukające Oko. Wizja odsłania zagrożenie ukryte za pięknem Lórien.' },
      { title: 'Odwrócona uwaga', text: 'Armia Zachodu staje pod Morannonem. Sauron patrzy na wielkie wyzwanie, gdy rozstrzygnięcie nadchodzi cicho.' },
      { title: 'Wygaszenie', text: 'Wraz ze zniszczeniem Pierścienia Czarna Wieża upada. W tej filmowej wizji płomień Oka gaśnie.' },
    ],
  },
  {
    id: 'misty', title: 'Góry Mgliste', subtitle: 'Wysoka Przełęcz', elvish: 'Hithaeglir', kicker: 'VIII · Ponad chmurami', coordinates: [5, -25],
    summary: 'Strome skalne grzbiety odcinają Eriador od dzikich krain na wschodzie. Bilbo i krasnoludy szukają przejścia wysoko ponad dolinami.',
    history: ['Wysoka Przełęcz prowadzi z okolic Rivendell na wschodnią stronę pasma. To przez nią wiedzie wyprawa Thorina w 2941 roku.', 'Burza zmusza kompanię do wejścia w pozornie bezpieczną jaskinię. Pod ziemią zaczyna się następny rozdział drogi.'],
    characters: ['Bilbo — pierwszy raz pośród wielkich gór', 'Thorin i kompania — wędrowcy na wschód', 'Gandalf — przewodnik', 'Wielkie orły — wybawcy'],
    facts: ['Wysoka Przełęcz leży na północ od Morii.', 'Frodo próbuje przejścia przez Caradhras; Bilbo korzysta z innej przełęczy.', 'Autorska ilustracja Tolkiena pokazuje zachodni widok od gniazd orłów ku Gobliniej Bramie.'],
    storyboard: [{title:'Burza',text:'Błyskawica przecina chmurę. Wąska ścieżka zdaje się niknąć na granicy skały i powietrza.'},{title:'Jaskinia',text:'Schronienie przynosi sen. Szczelina w głębi kamienia okazuje się drzwiami do cudzej krainy.'},{title:'Skrzydła',text:'Po ciemności podziemi Bilbo znów widzi rozległy świat, tym razem z wysokości orlego gniazda.'}],
  },
  {
    id: 'goblintown', title: 'Goblin-town', subtitle: 'Pod Wysoką Przełęczą', elvish: 'Goblinia osada', kicker: 'IX · Zagadki w ciemności', coordinates: [6, -26],
    summary: 'Tunele wiją się pod górami ku sali Wielkiego Goblina. Jeszcze głębiej, nad podziemnym jeziorem, Gollum żyje z dala od światła.',
    history: ['Gobliny chwytają kompanię w górskiej jaskini i prowadzą ją do swego władcy. Gandalf umożliwia ucieczkę, lecz Bilbo gubi towarzyszy.', 'Hobbit znajduje Pierścień i spotyka Golluma. Rozwiązując zagadki, a później okazując litość, nieświadomie zmienia przyszłość całego Śródziemia.'],
    characters: ['Wielki Goblin — władca podziemi', 'Gollum — mieszkaniec głębokiego jeziora', 'Bilbo — zagadki i niewidzialność', 'Gandalf — ratunek kompanii'],
    facts: ['Jezioro Golluma znajduje się głębiej niż główna osada.', 'Goblin-town i krasnoludzka Moria są osobnymi miejscami.', 'Film rozbudowuje osadę o drewniane mosty i rusztowania.'],
    storyboard: [{title:'Pochodnie',text:'Światło odsłania tłum i ogromną salę. Droga ku Ereborowi skręca nagle w dół.'},{title:'Jezioro',text:'Ciszę rozcina cichy ruch łódki. Dwaj rozmówcy próbują ocalić to, co uważają za swoje.'},{title:'Litość',text:'Bilbo mógłby uderzyć. Wybiera skok ponad przeciwnikiem, a skutki wyboru sięgają daleko poza tę jaskinię.'}],
  },
  {
    id: 'beorn', title: 'Dom Beorna', subtitle: 'Ogień pośród dębów', elvish: 'Dolina Anduiny', kicker: 'X · Niezwykła gościna', coordinates: [13, -26],
    summary: 'Za dębami i cierniowym żywopłotem stoi długa, niska drewniana siedziba. Dziedziniec, ogród, ule i zabudowania gospodarskie tworzą dom Beorna.',
    history: ['Beorn mieszka na wschód od Anduiny, blisko Carrocku. Jest człowiekiem zdolnym przyjmować postać wielkiego niedźwiedzia.', 'Przyjmuje kompanię i wyposaża ją na drogę do puszczy. Później przybywa na Bitwę Pięciu Armii; Bilbo i Gandalf wracają do niego na zimę.'],
    characters: ['Beorn — gospodarz i zmiennoskóry', 'Bilbo — gość', 'Gandalf — ostrożny negocjator', 'Zwierzęta gospodarstwa — niezwykli pomocnicy'],
    facts: ['Dwa długie skrzydła domu obejmują dziedziniec.', 'Wysoki żywopłot ma szeroką drewnianą bramę od północy.', 'Słomiane ule przypominają dzwony i stoją na południu obejścia.'],
    storyboard: [{title:'Brama',text:'Gandalf przedstawia przybyszów stopniowo. Zaufanie rośnie pośród opowieści o trudach ostatnich dni.'},{title:'Palenisko',text:'Ogień wyznacza środek długiej hali. Po kamieniu i ciemności wraca ciepło prawdziwego domu.'},{title:'W drogę',text:'Zapasy i przestroga zostają z kompanią. Beorn nie prowadzi ich do puszczy, lecz pomaga przekroczyć jej próg.'}],
  },
  {
    id: 'mirkwood', title: 'Mroczna Puszcza', subtitle: 'Nie schodźcie ze ścieżki', elvish: 'Dawna Zielona Puszcza', kicker: 'XI · Pod zamkniętą koroną', coordinates: [22, -18],
    summary: 'Gęste korony odbierają światło leśnej ścieżce. Kompania przekracza północną puszczę: zaczarowaną rzekę, pajęczyny i obcy świat leśnych elfów.',
    history: ['Dawniej nazywano ją Wielką Zieloną Puszczą. Rozrastający się cień Dol Guldur zmienił zarówno las, jak i jego nazwę.', 'W 2941 roku Bilbo ratuje krasnoludy przed pająkami. Gandalf pozostawia kompanię, by wraz z Białą Radą zająć się zagrożeniem na południu.'],
    characters: ['Bilbo — wybawca krasnoludów', 'Thranduil — król północnych leśnych elfów', 'Wielkie pająki — drapieżcy puszczy', 'Gandalf — uczestnik działań Białej Rady'],
    facts: ['Dol Guldur leży na południu, daleko od sal Thranduila.', 'Elficka ścieżka i zaczarowana rzeka należą do północnego szlaku Bilba.', 'Po Wojnie o Pierścień puszcza otrzymuje nazwę Eryn Lasgalen.'],
    storyboard: [{title:'Ostatni promień',text:'Pożegnanie z Gandalfem zamyka jasny rozdział. Za linią drzew droga staje się tunelem.'},{title:'Nad liśćmi',text:'Bilbo wspina się ponad korony. Na chwilę wraca niebo, ale z dołu nie widać końca lasu.'},{title:'Żądło',text:'Pajęczyny pękają pod ostrzem. Hobbit przejmuje inicjatywę, gdy kompanię opuszcza siła.'}],
  },
  {
    id: 'thranduil', title: 'Sale Thranduila', subtitle: 'Brama leśnego króla', elvish: 'Północna Mroczna Puszcza', kicker: 'XII · Rzeka pod pałacem', coordinates: [23, -29],
    summary: 'Kamienne drzwi prowadzą ze skraju lasu do wykutych w skale sal. Pod pałacem rzeka niesie beczki z piwnic ku jezioru.',
    history: ['Thranduil rządzi elfami północnej puszczy. Podziemna siedziba służy jako pałac, skarbiec i schronienie, podczas gdy wielu poddanych żyje w lesie.', 'Krasnoludy odmawiają zdradzenia celu wyprawy i trafiają do cel. Bilbo pozostaje niewidoczny; odnajduje piwnice i przygotowuje ucieczkę w beczkach.'],
    characters: ['Thranduil — leśny król', 'Bilbo — niewidzialny gość', 'Galion — królewski podczaszy', 'Thorin — więzień, który milczy'],
    facts: ['Brama leży nad Leśną Rzeką w północno-wschodniej puszczy.', 'Piwnice znajdują się na najniższym poziomie, nad podziemnym nurtem.', 'Legolas jest synem Thranduila; nie pojawia się w książkowym Hobbicie.'],
    storyboard: [{title:'Kamienne drzwi',text:'Most prowadzi ku zamkniętej bramie. Po drodze przez dziki las przychodzi spotkanie z władzą.'},{title:'Piwnice',text:'Bilbo słucha kroków i szuka wyjścia. Handel z Esgaroth podsuwa niezwykły sposób ratunku.'},{title:'Beczki',text:'Krata otwiera się nad wodą. Rzeka wynosi kompanię poza kamień i cień drzew.'}],
  },
  {
    id: 'laketown', title: 'Miasto na Jeziorze', subtitle: 'Esgaroth', elvish: 'Długie Jezioro', kicker: 'XIII · Domy ponad wodą', coordinates: [25, -26],
    summary: 'Drewniane domy i pomosty stoją na palach nad spokojną zatoką. Długi most łączy Esgaroth z lądem, a wodny rynek jest sercem osady.',
    history: ['Esgaroth żyje z handlu między leśnymi elfami, ludźmi i ziemiami na północy. Mieszkańcy pamiętają legendę o powrocie Króla pod Górą.', 'Przyjęcie Thorina przynosi nadzieję, lecz Smaug niszczy miasto. Bard zabija smoka i prowadzi ocalałych ku odbudowie życia.'],
    characters: ['Bard — obrońca i łucznik', 'Zarządca Esgaroth — przywódca miasta', 'Thorin — przybysz z królewskim roszczeniem', 'Bilbo — towarzysz kompanii'],
    facts: ['Osada stoi przy zachodnim brzegu Długiego Jeziora.', 'Rynek otacza okrągły basen połączony kanałem z jeziorem.', 'Miasto jest drewniane, a jego most można odciąć od lądu.'],
    storyboard: [{title:'Przybycie',text:'Z beczek wyłaniają się podróżni. Pieśni mieszkańców wyprzedzają to, co naprawdę zdoła zrobić kompania.'},{title:'Ogień nad wodą',text:'Smok przecina nocne niebo. Ocalenie zależy od pojedynczego łucznika i wiadomości z wnętrza Góry.'},{title:'Brzeg',text:'Ocalałe rodziny gromadzą się na lądzie. Żądanie pomocy bierze się z utraty domów.'}],
  },
  {
    id: 'erebor', title: 'Erebor', subtitle: 'Samotna Góra', elvish: 'Królestwo pod Górą', kicker: 'XIV · Skarb i odpowiedzialność', coordinates: [25, -33],
    summary: 'Samotny masyw góruje nad Dale i Długim Jeziorem. Spod wielkiej Przedniej Bramy wypływa rzeka; małe zachodnie drzwi otwierają inną drogę ku skarbowi.',
    history: ['Krasnoludy rozwinęły pod Górą królestwo rzemiosła i handlu. W 2770 roku Smaug zagarnął ich siedzibę i zniszczył Dale.', 'Wyprawa Thorina dociera tu w 2941. Po śmierci smoka spór o bogactwo ustępuje wspólnej obronie; Dáin zostaje królem odbudowywanego Ereboru.'],
    characters: ['Thorin — dziedzic królestwa', 'Smaug — władca skarbu', 'Bilbo — rozmówca smoka', 'Dáin — król po Bitwie Pięciu Armii'],
    facts: ['Rzeka Running wypływa z Przedniej Bramy na południu Góry.', 'Tajne wejście leży na zachodniej ścianie i otwiera się kluczem Thorina.', 'Arcyklejnot staje się narzędziem rokowań, gdy Bilbo oddaje go przeciwnikom Thorina.'],
    storyboard: [{title:'Ostatni promień',text:'Światło odsłania zamek w gładkim kamieniu. Długa droga znajduje małe, prawie niewidoczne zakończenie.'},{title:'Smok i hobbit',text:'Bilbo ukrywa imię za zagadką. Wśród skarbu zauważa szczegół ważniejszy od złota.'},{title:'Pojednanie',text:'W cieniu bitwy skarb traci znaczenie. Ostatnia rozmowa z Thorinem przywraca wartość przyjaźni.'}],
  },
];

export const characters = [
  {
    id: 'bilbo', title: 'Bilbo Baggins', subtitle: 'Włamywacz · poeta · autor podróży',
    summary: 'Hobbit, który kocha wygodę, odkrywa w sobie odwagę bez utraty łagodności. Jego najważniejszym skarbem staje się opowieść, choć z drogi przywozi także Pierścień.',
    history: ['W 2941 wyrusza z Gandalfem i trzynastoma krasnoludami do Ereboru. W podziemiach Gór Mglistych znajduje Pierścień i oszczędza Golluma. Pod Samotną Górą próbuje zapobiec wojnie o skarb.', 'Po powrocie zapisuje wspomnienia. W 3001 opuszcza Shire, zostawiając Frodowi dom i Pierścień. W Rivendell pracuje nad dawnymi opowieściami; w 3021 odpływa z Szarych Przystani.'],
    facts: ['W dniu wielkiego przyjęcia kończy 111 lat.', 'Żądło i mithrilowa kolczuga przechodzą później do Froda.', 'Bilbo jest krewnym i przybranym opiekunem Froda.'],
    storyboard: [{ title: 'Nieoczekiwani goście', text: 'Krasnoludy zajmują spokojną jadalnię. Z rozmowy przy stole wyrasta wyprawa do smoka.' }, { title: 'Litość w ciemności', text: 'Bilbo może zabić Golluma, lecz wybiera oszczędzenie go. Konsekwencje sięgają daleko poza Hobbita.' }, { title: 'Czerwona Księga', text: 'Przeżyta droga staje się pamięcią dla następnego pokolenia.' }],
  },
  {
    id: 'frodo', title: 'Frodo Baggins', subtitle: 'Powiernik Pierścienia',
    summary: 'Wrażliwy i wytrwały hobbit podejmuje zadanie, którego nie rozstrzyga siła miecza. Im bliżej celu, tym większą cenę płaci za ocalenie domu.',
    history: ['Po Bilbie dziedziczy Bag End i Jedyny Pierścień. Na Radzie Elronda zgłasza się, by zanieść go do Mordoru. Po rozpadzie Drużyny podróżuje z Samem, a później również z Gollumem.', 'Doprowadza Pierścień do Szczelin Zagłady, ale nie potrafi go dobrowolnie oddać. Gollum odbiera go i wpada w ogień. Frodo wraca do Shire; trwałe rany skłaniają go do odpłynięcia na Zachód.'],
    facts: ['Frodo i Bilbo obchodzą urodziny 22 września.', 'Wyruszając z Bag End w 3018, Frodo ma 50 lat.', 'Rejs na Zachód daje nadzieję na uzdrowienie; nie czyni śmiertelnika nieśmiertelnym.'],
    storyboard: [{ title: 'Dobrowolny ciężar', text: 'W Rivendell Frodo przyjmuje zadanie. Wielkie moce mogą doradzać, lecz tę decyzję podejmuje on sam.' }, { title: 'Dwie sylwetki', text: 'Po Amon Hen Frodo i Sam ruszają na wschód. Wierność przyjaciela staje się oparciem wyprawy.' }, { title: 'Biały statek', text: 'Dom został ocalony. Frodo musi szukać spokoju dalej, za morzem.' }],
  },
  {
    id: 'gandalf', title: 'Gandalf', subtitle: 'Mithrandir · Szary Pielgrzym',
    summary: 'Wędrowny doradca dostrzega nadzieję tam, gdzie inni widzą małość. Laska, kapelusz i fajka ukrywają posłańca obdarzonego znacznie starszą pamięcią.',
    history: ['Gandalf należy do Istarich wysłanych, by pomagać ludom Śródziemia przeciw Sauronowi. Zachęca Bilba do wyprawy, rozpoznaje Jedyny Pierścień i prowadzi Drużynę przez pierwszą część jej drogi.', 'Po walce z Balrogiem umiera i zostaje odesłany jako Gandalf Biały. Pomaga Théodenowi, wspiera obronę Minas Tirith i uczestniczy w ostatnim wyzwaniu pod Czarną Bramą. Po zakończeniu zadania odpływa na Zachód.'],
    facts: ['Mithrandir oznacza Szarego Pielgrzyma.', 'Jego dawnym imieniem jest Olórin.', 'Nosi Naryę, Pierścień Ognia, przekazany mu przez Círdana.'],
    storyboard: [{ title: 'Iskra', text: 'Gandalf przekracza próg Bag End. Rozpoznaje w hobbitach odwagę, którą ich sąsiedzi przeoczają.' }, { title: 'Most', text: 'Na moście Khazad-dûm zatrzymuje Balroga, dając przyjaciołom czas na ucieczkę.' }, { title: 'Biel', text: 'Powraca z większą odpowiedzialnością. Jego siła służy obudzeniu odwagi innych.' }],
  },
];

const step = (title, region, date, coords, text) => ({ title, region, date, coords, text });

export const journeys = {
  frodo: {
    title: 'Droga Powiernika',
    summary: 'Od Bag End do Orodruiny, a potem do domu i ku morzu. Główne etapy książkowej podróży Froda; po Amon Hen idzie z nim Sam.',
    steps: [
      step('Bag End', 'shire', '23 września 3018', [-30,-14], 'Frodo opuszcza dom z Samem i Pippinem. Czarni Jeźdźcy już szukają nazwiska Baggins.'),
      step('Prom i Crickhollow', 'shire', '25 września 3018', [-26,-13], 'Przyjaciele przekraczają Brandywinę. Merry ujawnia, że zna sekret podróży i zamierza pomóc.'),
      step('Stary Las', 'shire', '26 września 3018', [-24,-12], 'Ścieżki sprowadzają hobbitów do Starej Wierzby. Tom Bombadil ratuje ich i zaprasza do domu.'),
      step('Kurhany', 'bree', '28 września 3018', [-22,-12], 'Upiór więzi wędrowców pod ziemią. Bombadil znów przychodzi z pomocą; hobbici otrzymują dawne ostrza.'),
      step('Pod Rozbrykanym Kucykiem', 'bree', '29 września 3018', [-19,-13], 'Frodo spotyka Aragorna. Od świtu strażnik prowadzi hobbitów bocznymi drogami.'),
      step('Wichrowy Czub', 'bree', '6 października 3018', [-13,-16], 'Nazgûle atakują pod Amon Sûl. Ostrze Morgulu rani Froda; czas zaczyna działać przeciw niemu.'),
      step('Bród Bruinenu', 'rivendell', '20 października 3018', [-1,-21], 'Frodo dociera do brodu na koniu Glorfindela. Wezbrana rzeka powstrzymuje ścigających Nazgûli.'),
      step('Rada Elronda', 'rivendell', '25 października 3018', [1,-22], 'Zapada decyzja: Pierścień trzeba zniszczyć tam, gdzie został wykuty. Frodo przyjmuje zadanie.'),
      step('Wymarsz Dziewięciu', 'rivendell', '25 grudnia 3018', [1,-22], 'Drużyna opuszcza dolinę i kieruje się na południe wzdłuż Gór Mglistych.'),
      step('Caradhras', 'rivendell', '11–12 stycznia 3019', [0,-6], 'Śnieg zamyka wysoką przełęcz. Nieudana przeprawa skłania Drużynę do zejścia ku Morii.'),
      step('Moria', 'rivendell', '13–15 stycznia 3019', [1,-3], 'Podziemna droga prowadzi przez opuszczone krasnoludzkie sale. Gandalf spada z mostu podczas walki z Balrogiem.'),
      step('Lothlórien', 'rivendell', 'styczeń–16 lutego 3019', [7,-2], 'Galadriela i Celeborn dają schronienie. Elfy wyposażają podróżnych i ofiarują łodzie do dalszej drogi.'),
      step('Wielka Rzeka', 'rohan', '16–25 lutego 3019', [13,4], 'Drużyna płynie Anduiną. Mija królewskie posągi Argonathu i dociera do jeziora Nen Hithoel.'),
      step('Amon Hen', 'rohan', '26 lutego 3019', [17,10], 'Boromir ulega pokusie i ginie broniąc hobbitów. Frodo z Samem przekraczają rzekę; Drużyna się rozdziela.'),
      step('Emyn Muil', 'mordor', '26–29 lutego 3019', [20,9], 'Skalny labirynt spowalnia hobbitów. Spotykają Golluma i przyjmują jego przewodnictwo.'),
      step('Martwe Bagna', 'mordor', '1–2 marca 3019', [24,10], 'Gollum prowadzi pomiędzy wodami i widmowymi światłami. Mokradła skrywają pamięć dawnych bitew.'),
      step('Czarna Brama', 'mordor', '5 marca 3019', [26,12], 'Morannon jest zbyt pilnie strzeżony. Gollum proponuje ukrytą drogę przez góry na południu.'),
      step('Ithilien', 'gondor', '7–8 marca 3019', [23,21], 'W zielonej krainie Frodo spotyka Faramira. W książce nie zostaje zabrany do Osgiliath.'),
      step('Minas Morgul', 'mordor', '10 marca 3019', [26,27], 'W dolinie twierdzy Frodo widzi wymarsz armii. Hobbici wybierają schody powyżej głównej drogi.'),
      step('Cirith Ungol', 'mordor', '12–14 marca 3019', [28,26], 'Szeloba obezwładnia Froda. Sam odpiera ją, a później uwalnia przyjaciela z wieży orków.'),
      step('Morgai i Gorgoroth', 'mordor', '15–24 marca 3019', [29,17], 'Hobbici idą najpierw na północ, potem ku Orodruinie. Odrzucają zbędny ciężar; pozostaje Pierścień.'),
      step('Szczeliny Zagłady', 'mordor', '25 marca 3019', [31,21], 'Frodo zatrzymuje Pierścień dla siebie. Gollum odbiera go i wpada w ogień; władza Saurona upada.'),
      step('Cormallen', 'gondor', '8 kwietnia 3019', [23,22], 'Orły wynoszą hobbitów z ognia. Na polach Cormallen zostają uhonorowani przez Aragorna i wolne ludy.'),
      step('Minas Tirith', 'gondor', 'wiosna–lato 3019', [17,28], 'Przyjaciele spotykają się ponownie. Frodo uczestniczy w początku panowania Elessara i przygotowuje powrót.'),
      step('Powrót przez Edoras', 'rohan', 'sierpień 3019', [5,15], 'Orszak odprowadza Théodena do Rohanu. Żałoba i pożegnania towarzyszą drodze na północ.'),
      step('Isengard', 'rohan', '22 sierpnia 3019', [-6,11], 'Podróżni docierają do zniszczonej siedziby Sarumana. Każdy wraca już z inną historią.'),
      step('Znów w Rivendell', 'rivendell', '21 września 3019', [1,-22], 'Frodo spotyka Bilba i świętuje z nim urodziny. Potem rusza na zachód.'),
      step('Znów w Bree', 'bree', '28 października 3019', [-19,-13], 'Butterbur widzi przemianę dawnych gości. Gandalf wkrótce pozostawia hobbitom sprawy ich ojczyzny.'),
      step('Porządki w Shire', 'shire', 'listopad 3019', [-30,-14], 'Powracający wyzwalają dom spod rządów Sarumana. Frodo próbuje ograniczyć zemstę; Sam pomaga odbudować kraj.'),
      step('Szare Przystanie', 'shire', '29 września 3021', [-42,-14], 'Frodo odpływa z Bilbem, Gandalfem, Elrondem i Galadrielą. Sam wraca do rodziny i Shire.'),
    ],
  },
  bilbo: {
    title: 'Tam i z powrotem',
    summary: 'Wyprawa Bilba i kompanii Thorina do Samotnej Góry w latach 2941–2942. Główne etapy książkowego Hobbita, wraz z drogą powrotną.',
    steps: [
      step('Bag End i Zielony Smok', 'shire', 'wiosna 2941', [-30,-14], 'Gandalf i trzynastu krasnoludów zabierają Bilba w wyprawę, której celem jest odzyskanie Ereboru.'),
      step('Pustkowia i trollowy las', 'bree', 'wiosna 2941', [-7,-20], 'Kompania przecina Eriador. Po spotkaniu z trollami znajduje w ich jaskini dawne elfickie ostrza.'),
      step('Odpoczynek u Elronda', 'rivendell', 'czerwiec 2941', [1,-22], 'W Rivendell Elrond odczytuje księżycowe litery na mapie Thorina i wyjaśnia zagadkę ukrytych drzwi.'),
      step('Wysoka Przełęcz', 'misty', 'lato 2941', [5,-25], 'Burza zmusza podróżnych do schronienia w jaskini. Przejście prowadzi w pułapkę goblinów.'),
      step('Goblin-town', 'goblintown', 'lato 2941', [6,-26], 'Gandalf pomaga kompanii uciec z podziemi. Bilbo zostaje oddzielony od przyjaciół.'),
      step('Zagadki w ciemności', 'goblintown', 'lato 2941', [6,-26], 'Bilbo znajduje Pierścień, spotyka Golluma i rozwiązuje zagadki. Ucieka, oszczędzając swego przeciwnika.'),
      step('Gniazda orłów', 'misty', 'lato 2941', [8,-25], 'Orły ratują kompanię przed goblinami i wargami. Następnego dnia przenoszą ją ku Carrockowi.'),
      step('Carrock i dom Beorna', 'beorn', 'lato 2941', [13,-26], 'Beorn daje gościnę, zapasy i radę na drogę do Mrocznej Puszczy.'),
      step('Próg Mrocznej Puszczy', 'mirkwood', 'lato 2941', [13,-30], 'Gandalf opuszcza kompanię, by zająć się zagrożeniem z Dol Guldur. Bilbo idzie dalej z krasnoludami.'),
      step('Elficka ścieżka', 'mirkwood', 'lato 2941', [20,-27], 'Ciemny las, zaczarowana rzeka i brak zapasów wystawiają kompanię na próbę. Pająki chwytają krasnoludów.'),
      step('Żądło i pajęczyny', 'mirkwood', 'lato 2941', [22,-28], 'Bilbo nadaje ostrzu imię Żądło. Uwalnia towarzyszy dzięki pomysłowości i niewidzialności.'),
      step('Sale leśnego króla', 'thranduil', 'lato–jesień 2941', [23,-29], 'Elfy więżą krasnoludów. Niezauważony Bilbo odnajduje drogę ucieczki przez rzeczne piwnice.'),
      step('Beczki na Leśnej Rzece', 'thranduil', 'wrzesień 2941', [24,-27], 'Krasnoludy płyną w beczkach, a Bilbo trzyma się drewna. Rzeka wyprowadza ich z puszczy.'),
      step('Esgaroth', 'laketown', '22 września 2941', [25,-26], 'Miasto na Jeziorze przyjmuje Thorina. Po odpoczynku mieszkańcy wyposażają kompanię na ostatni odcinek.'),
      step('Pustkowie Smauga', 'erebor', 'jesień 2941', [25,-30], 'Podróżni mijają zniszczone ziemie Dale. Szukają ukrytego wejścia na zboczu Samotnej Góry.'),
      step('Drzwi w Dniu Durina', 'erebor', 'jesień 2941', [25,-33], 'Drozd i ostatni promień słońca ujawniają zamek. Klucz Thorina otwiera drogę pod górę.'),
      step('Rozmowa ze Smaugiem', 'erebor', 'jesień 2941', [25,-33], 'Bilbo dostrzega nieosłonięte miejsce na piersi smoka. Ta wiadomość dociera do Barda.'),
      step('Śmierć smoka', 'erebor', 'jesień 2941', [25,-33], 'Bilbo pozostaje pod Górą, gdy Smaug napada na Esgaroth. Bard zabija smoka; narasta spór o skarb.'),
      step('Arcyklejnot', 'erebor', 'jesień 2941', [25,-33], 'Bilbo przekazuje klejnot Bardowi i leśnemu królowi jako narzędzie rokowań, ryzykując gniew Thorina.'),
      step('Bitwa Pięciu Armii', 'erebor', 'jesień 2941', [25,-32], 'Ludzie, elfy i krasnoludy łączą siły przeciw goblinom i wargom. Thorin, Fíli i Kíli giną.'),
      step('Droga wokół puszczy', 'mirkwood', 'późna jesień 2941', [18,-35], 'Bilbo wraca z Gandalfem i Beornem. Wybierają drogę wokół północnego skraju Mrocznej Puszczy.'),
      step('Zima u Beorna', 'beorn', 'przełom 2941–2942', [13,-26], 'Podróżni spędzają zimowy okres w domu Beorna. Potem ruszają przez Góry Mgliste.'),
      step('Rivendell na powrót', 'rivendell', 'wiosna 2942', [1,-22], 'Bilbo znów słucha elfickich pieśni. Po odpoczynku on i Gandalf kierują się ku Shire.'),
      step('Trollowy skarb', 'bree', 'wiosna 2942', [-7,-20], 'Na drodze powrotnej odnajdują schowany wcześniej skarb trolli. Bilbo jest już innym wędrowcem.'),
      step('Dom i aukcja', 'shire', 'czerwiec 2942', [-30,-14], 'Bilbo zastaje wyprzedaż własnego dobytku: uznano go za zmarłego. Odzyskuje dom i zaczyna spisywać przygodę.'),
    ],
  },
  fellowship: {
    title: 'Drużyna i rozchodzące się drogi',
    summary: 'Wspólny szlak Dziewięciu, potem trzy równoległe opowieści: Powiernik, ocalenie hobbitów i wojna wolnych ludów. Kolejne kadry oznaczają wydarzenia, nie jedną ciągłą trasę całej Drużyny.',
    steps: [
      step('Dziewięciu z Rivendell', 'rivendell', '25 grudnia 3018', [1,-22], 'Gandalf, Aragorn, Boromir, Legolas, Gimli i czterej hobbici rozpoczynają wspólną drogę.'),
      step('Caradhras i Moria', 'rivendell', 'styczeń 3019', [1,-3], 'Góry odmawiają przejścia. Droga pod ziemią przynosi utratę Gandalfa i zmienia przywództwo Drużyny.'),
      step('Lórien i Anduina', 'rohan', 'styczeń–luty 3019', [7,-2], 'Po odpoczynku u Galadrieli przyjaciele płyną na południe, ku granicy wyboru.'),
      step('Rozpad przy Amon Hen', 'rohan', '26 lutego 3019', [17,10], 'Frodo i Sam ruszają do Mordoru. Merry i Pippin zostają porwani; Boromir ginie w ich obronie.'),
      step('Pogoń Trzech Łowców', 'rohan', 'koniec lutego 3019', [8,7], 'Aragorn, Legolas i Gimli biegną za oddziałem orków, stawiając ratunek przyjaciół przed pościgiem za Pierścieniem.'),
      step('Fangorn', 'rohan', '29 lutego–1 marca 3019', [1,6], 'Merry i Pippin spotykają Drzewca. Trzej Łowcy odnajdują Gandalfa, który powrócił jako Biały.'),
      step('Edoras', 'rohan', '2 marca 3019', [5,15], 'Gandalf pomaga Théodenowi odzyskać wolę działania. Rohan przygotowuje obronę przed Sarumanem.'),
      step('Helmowy Jar', 'rohan', '3–4 marca 3019', [-3,15], 'Aragorn, Legolas i Gimli walczą przy Théodenie. O świcie przybywa pomoc zgromadzona przez Gandalfa.'),
      step('Isengard i entowie', 'rohan', 'marzec 3019', [-6,11], 'Entowie obalają przemysłową potęgę Sarumana. Przyjaciele spotykają Merry’ego i Pippina pośród ruin.'),
      step('Aragorn: Ścieżki Umarłych', 'gondor', '8 marca 3019', [3,23], 'Aragorn, Legolas i Gimli wzywają Wiarołomców do spełnienia dawnej przysięgi i ruszają ku Pelargirowi.'),
      step('Gandalf i Pippin: Minas Tirith', 'gondor', '9 marca 3019', [17,28], 'Po spojrzeniu Pippina w palantír Gandalf zabiera go do Gondoru, aby wesprzeć zagrożone miasto.'),
      step('Merry: odsiecz Rohanu', 'gondor', '15 marca 3019', [17,27], 'Merry jedzie z Éowyn. Na Pelennorze oboje uczestniczą w zgładzeniu Wodza Nazgûli.'),
      step('Aragorn: flota z Pelargiru', 'gondor', '15 marca 3019', [17,28], 'Zdobyte okręty niosą posiłki do Minas Tirith. W książce Umarli zostają zwolnieni jeszcze w Pelargirze.'),
      step('Ostatnie wyzwanie', 'mordor', '25 marca 3019', [26,12], 'Armia Zachodu staje przed Czarną Bramą, by odwrócić uwagę Saurona od Froda i Sama.'),
      step('Spotkanie na Cormallen', 'gondor', '8 kwietnia 3019', [23,22], 'Ocalali przyjaciele znów są razem. Drużyna osiągnęła cel poprzez różne drogi i wspólną wierność.'),
    ],
  },
};

// Post-quest rescue and recovery begin Frodo's return; the voyage of 3021 is a later epilogue.
function markJourneyPhases(journey, returnStart, epilogueStart = Infinity) {
  journey.steps.forEach((entry, index) => {
    entry.phase = index >= epilogueStart ? 'epilogue' : index >= returnStart ? 'return' : 'outbound';
  });
}
markJourneyPhases(journeys.frodo, 22, 29);
markJourneyPhases(journeys.bilbo, 20);

export const sources = [
  { title: 'J.R.R. Tolkien — Władca Pierścieni (opis Tolkien Estate)', url: 'https://www.tolkienestate.com/writing/the-lord-of-the-rings/' },
  { title: 'J.R.R. Tolkien — ilustracje Hobbita (Tolkien Estate)', url: 'https://www.tolkienestate.com/painting/the-hobbit/' },
  { title: 'Tolkien Gateway — Shire', url: 'https://tolkiengateway.net/wiki/The_Shire' },
  { title: 'Tolkien Gateway — Bree', url: 'https://tolkiengateway.net/wiki/Bree' },
  { title: 'Tolkien Gateway — Rivendell', url: 'https://tolkiengateway.net/wiki/Rivendell' },
  { title: 'Tolkien Gateway — Gondor', url: 'https://tolkiengateway.net/wiki/Gondor' },
  { title: 'Tolkien Gateway — Minas Tirith', url: 'https://tolkiengateway.net/wiki/Minas_Tirith' },
  { title: 'Tolkien Gateway — Rohan', url: 'https://tolkiengateway.net/wiki/Rohan' },
  { title: 'Tolkien Gateway — Mordor', url: 'https://tolkiengateway.net/wiki/Mordor' },
  { title: 'Tolkien Gateway — Oko Saurona i adaptacje', url: 'https://tolkiengateway.net/wiki/Eye_of_Sauron' },
  { title: 'Tolkien Gateway — Bilbo Baggins', url: 'https://tolkiengateway.net/wiki/Bilbo_Baggins' },
  { title: 'Tolkien Gateway — Frodo Baggins', url: 'https://tolkiengateway.net/wiki/Frodo_Baggins' },
  { title: 'Tolkien Gateway — Gandalf', url: 'https://tolkiengateway.net/wiki/Gandalf' },
  { title: 'Tolkien Gateway — lata 3018 i 3019, odsyłacze do Dodatku B', url: 'https://tolkiengateway.net/wiki/Third_Age_3019' },
  { title: 'Tolkien Gateway — początek wyprawy Froda, rok 3018', url: 'https://tolkiengateway.net/wiki/Third_Age_3018' },
  { title: 'Tolkien Gateway — wyprawa do Ereboru', url: 'https://tolkiengateway.net/wiki/Quest_of_Erebor' },
  { title: 'Tolkien Gateway — rok 2941', url: 'https://tolkiengateway.net/wiki/Third_Age_2941' },
  { title: 'Tolkien Gateway — rok 2942', url: 'https://tolkiengateway.net/wiki/Third_Age_2942' },
  { title: 'Tolkien Gateway — kompania Thorina', url: 'https://tolkiengateway.net/wiki/Thorin_and_Company' },
  { title: 'Tolkien Gateway — Samotna Góra', url: 'https://tolkiengateway.net/wiki/Lonely_Mountain' },
  { title: 'Tolkien Gateway — Mroczna Puszcza', url: 'https://tolkiengateway.net/wiki/Mirkwood' },
  { title: 'Tolkien Gateway — Drużyna Pierścienia', url: 'https://tolkiengateway.net/wiki/Fellowship_of_the_Ring' },
  { title: 'Tolkien Gateway — wyprawa Pierścienia', url: 'https://tolkiengateway.net/wiki/Quest_of_the_Ring' },
  { title: 'Tolkien Gateway — Moria', url: 'https://tolkiengateway.net/wiki/Moria' },
  { title: 'Tolkien Gateway — Lothlórien', url: 'https://tolkiengateway.net/wiki/Lothl%C3%B3rien' },
  { title: 'Tolkien Gateway — Ithilien', url: 'https://tolkiengateway.net/wiki/Ithilien' },
  { title: 'Tolkien Gateway — Cirith Ungol', url: 'https://tolkiengateway.net/wiki/Cirith_Ungol' },
  { title: 'Tolkien Gateway — Martwe Bagna', url: 'https://tolkiengateway.net/wiki/Dead_Marshes' },
];

/* Referencje rozdzielają tekst książek, rysunki autora i projekty ekranizacji.
   Adresy ilustracji zostały odczytane z rzeczywistych galerii źródłowych.
   Credits identyfikują autorstwo; nie oznaczają licencji na redystrybucję. */
const estateHobbit = 'https://www.tolkienestate.com/painting/the-hobbit/';
const estateRings = 'https://www.tolkienestate.com/painting/the-lord-of-the-rings/';
const estateCredit = 'J.R.R. Tolkien · © The Tolkien Estate Limited';
const wetaCredit = 'Wētā Workshop · oficjalna miniatura projektu filmowego';
const source = (title, url) => ({ title, url });
const artwork = (title, url, pageUrl, credit = estateCredit) => ({ title, url, pageUrl, credit });
const filmSmaug = 'https://www.wetafx.co.nz/films/filmography/the-hobbit-the-desolation-of-smaug';
const filmJourney = 'https://www.wetafx.co.nz/films/filmography/the-hobbit-an-unexpected-journey';

export const visualReferences = {
  shire: {
    description: 'Bag End według początku Hobbita: przestronny dom w zboczu Wzgórza, z niemal prostym, tunelowym holem i licznymi pokojami po obu stronach. Jednolity poziom podłogi oraz okna od strony ogrodu są podstawą układu. Rysunek Tolkiena przedstawia sam korytarz; filmowa fasada i krajobraz Hobbitonu są osobną interpretacją.',
    bookDetails: [
      'Drzwi idealnie okrągłe i zielone; żółta, wypolerowana mosiężna gałka dokładnie pośrodku.',
      'Hol ma boazerię, posadzkę z płytek, dywaniki, wypolerowane krzesła i wiele wieszaków na kapelusze oraz płaszcze.',
      'Okrągłe drzwi prowadzą do sypialni, łazienek, licznych spiżarni, garderób, kuchni i jadalni; nie ma piętra.',
      'Najlepsze pokoje są po lewej stronie od wejścia. Głęboko osadzone okrągłe okna wychodzą na ogród i łąki opadające ku rzece.',
    ],
    filmDetails: ['Wētā odtwarza rozległą siedzibę pod Wzgórzem z dużym dębem, korzeniami, bujnym ogrodem i śladami codziennego życia.', 'Filmowy Bag End w Hobbitonie jest fasadą z początkowym odcinkiem wejścia. Udostępnione pełne wnętrza Bagshot Row należą do innych hobbickich domów.'],
    sources: [source('Hobbit, rozdział 1 — fragment udostępniony przez wydawcę', 'https://penguinrandomhousesecondaryeducation.com/book/?isbn=9780345339683'), source('Tolkien Estate — autorskie rysunki Hobbitonu i holu', estateHobbit), source('Wētā Workshop — Bag End', 'https://www.wetanz.com/nz/bag-end-hobbit-hole'), source('Hobbiton — informacje o filmowym Bag End', 'https://www.hobbitontours.com/plan-visit/frequently-asked-questions/'), source('Hobbiton — wnętrza Bagshot Row', 'https://www.hobbitontours.com/discover/bagshot/')],
    images: [artwork('J.R.R. Tolkien · The Hill: Hobbiton-across-the Water, 1937', 'https://jrrtestate.wpenginepowered.com/wp-content/uploads/2021/04/509azz0047.jpg', estateHobbit), artwork('J.R.R. Tolkien · The Hall at Bag-End, 1937', 'https://jrrtestate.wpenginepowered.com/wp-content/uploads/2021/04/586colourjpg.jpg', estateHobbit), artwork('Wētā Workshop · Bag End, interpretacja filmowa', 'https://www.wetanz.com/media/catalog/product/8/6/86-10-03829_lotr_hobbithole_bagend_001.png?optimize=high&fit=bounds&height=440&width=285', 'https://www.wetanz.com/nz/bag-end-hobbit-hole', wetaCredit)],
  },
  bree: {
    description: 'Osada na zboczu Bree-hill, z drogą i gospodą o rozpoznawalnym planie. Autorski szkic Tolkiena pozwala kontrolować układ ulic, wzgórza i bram.',
    bookDetails: ['Bree ma kamienne domy na zboczu i hobbickie nory wyżej; osadę osłaniają rów i żywopłot.', 'Pod Rozbrykanym Kucykiem to duży, trzykondygnacyjny dom: front przy drodze, dwa skrzydła odchodzące pod górę i dziedziniec pomiędzy nimi.', 'Łuk prowadzi na dziedziniec; z lewej kilka stopni wiedzie do drzwi. Tylne pokoje drugiej kondygnacji stykają się z podnoszącym się gruntem.', 'Szyld przedstawia rozbrykanego kucyka; światło lampy, kominek i belki wyznaczają charakter gospody.'],
    filmDetails: ['Ekranizacja wzmacnia nastrój mokrego, nocnego pogranicza, ciasnymi ulicami, ciężką bramą i ciepłym światłem gospody. To warstwa scenograficzna ponad książkowym planem.'],
    sources: [source('Bree — opis osady i przypisy do książki', 'https://tolkiengateway.net/wiki/Bree'), source('Pod Rozbrykanym Kucykiem — opis budynku', 'https://tolkiengateway.net/wiki/The_Prancing_Pony'), source('Autorski Plan Bree — dokumentacja ilustracji', 'https://tolkiengateway.net/wiki/File:J.R.R._Tolkien_-_Plan_of_Bree.jpeg'), source('Tolkien Art Index — Plan Bree', 'https://tai.tolkienists.org/tai/147/')],
    images: [artwork('J.R.R. Tolkien · Plan of Bree', 'https://tolkiengateway.net/w/images/b/b0/J.R.R._Tolkien_-_Plan_of_Bree.jpeg', 'https://tolkiengateway.net/wiki/File:J.R.R._Tolkien_-_Plan_of_Bree.jpeg')],
  },
  rivendell: {
    description: 'Dom Elronda leży w głębokiej, ukrytej dolinie Bruinenu pod zachodnim zboczem Gór Mglistych. Rysunki Tolkiena są punktem odniesienia dla topografii; film rozwija dom w rozległy zespół tarasów, dachów i przejść.',
    bookDetails: ['Do dna doliny schodzi się stromą, wijącą się ścieżką; wąwóz otacza siedzibę.', 'Na dole rosną między innymi dęby i buki, ponad nimi las i zbocza gór.', 'Bruinen oraz most stanowią czytelne elementy krajobrazu obok domu Elronda.', 'Dwa autorskie widoki Rivendell pokazują dolinę z przeciwnych kierunków; nie są planem filmowego pałacu.'],
    filmDetails: ['Filmy budują wielopoziomową architekturę elfów: balkony, łuki, ażurowe detale i wodospady.', 'Wētā zaznacza, że ekranowy układ zmieniał się pomiędzy ujęciami; miniatura opiera się na szerokim ujęciu ustanawiającym, a dziedziniec Rady na dokumentacji planu.'],
    sources: [source('Tolkien Estate — dwa widoki Rivendell', estateHobbit), source('Rivendell — opis i książkowe odniesienia', 'https://tolkiengateway.net/wiki/Rivendell'), source('Wētā Workshop — filmowa architektura Rivendell', 'https://www.wetanz.com/us/shop/environments/rivendell-environment-placeholder')],
    images: [artwork('J.R.R. Tolkien · Rivendell looking West', 'https://jrrtestate.wpenginepowered.com/wp-content/uploads/2021/04/518azz0045.jpg', estateHobbit), artwork('J.R.R. Tolkien · Rivendell looking East', 'https://jrrtestate.wpenginepowered.com/wp-content/uploads/2021/10/520-large.jpg', estateHobbit), artwork('Wētā Workshop · Rivendell, układ filmowy', 'https://www.wetanz.com/media/catalog/product/_/l/_lotr_rivendell2026_001_1_1.png?optimize=high&fit=bounds&height=440&width=285', 'https://www.wetanz.com/us/shop/environments/rivendell-environment-placeholder', wetaCredit)],
  },
  gondor: {
    description: 'Rekonstrukcja Gondoru skupia się na Minas Tirith. Miasto ma siedem rosnących poziomów, a skalny występ w kształcie dziobu okrętu kieruje się na wschód ku Pelennorowi.',
    bookDetails: ['Siedem poziomów oddzielają mury. Droga pnie się pomiędzy bramami, umieszczanymi naprzemiennie po północnej i południowej stronie.', 'Wielka Brama jest na wschodzie; druga brama na południowym wschodzie, trzecia na północnym wschodzie.', 'Najniższy mur, Othram, jest czarny i bardzo twardy; jaśniejszy kamień charakteryzuje wyższe poziomy.', 'Na szczycie stoją cytadela i wieża Ectheliona. Dziedziniec z fontanną i Białym Drzewem jest odrębną przestrzenią.'],
    filmDetails: ['Wētā odtwarza siedem poziomów, występ skalny, bramy, dachy i uliczki w wielkiej miniaturze miasta.', 'Filmowa dominanta białego kamienia, także przy dolnym obwodzie, upraszcza książkowy kontrast czarnego Othramu.'],
    sources: [source('Minas Tirith — poziomy, bramy i materiały; przypisy do Powrotu króla', 'https://tolkiengateway.net/wiki/Minas_Tirith'), source('Wētā Workshop — Minas Tirith', 'https://www.wetanz.com/us/shop/environments/minas-tirith')],
    images: [artwork('Wētā Workshop · Minas Tirith, miniatura filmowego miasta', 'https://www.wetanz.com/media/catalog/product/_/l/_lotr_minastirith2022_001.png?optimize=high&fit=bounds&height=440&width=285', 'https://www.wetanz.com/us/shop/environments/minas-tirith', wetaCredit)],
  },
  rohan: {
    description: 'Edoras wyrasta ponad równinę na wzgórzu. Meduseld jest dużą, długą drewnianą halą na szczycie: dach przypomina złoto, a rzeźbione słupy i malowidła opowiadają o rodzie Eorla.',
    bookDetails: ['Meduseld stoi na kamiennym tarasie ponad szerokimi schodami; wejście znajduje się od północy.', 'Długi środkowy ogień ma otwór dymny ponad sobą. Wysokie okna leżą pod okapem po wschodniej stronie.', 'Rzeźbione i malowane filary, kamienna posadzka z plecionymi wzorami oraz tkaniny przedstawiające Eorla zdobią halę.', 'Królewski tron stoi na południu, na podwyższeniu o trzech stopniach, naprzeciw wejścia.'],
    filmDetails: ['Projekt Edoras obejmuje drewnianą palisadę, kryte strzechą domy, stajnie i ścieżki na zboczu.', 'Oficjalna miniatura Wētā korzysta z dokumentacji oryginalnego planu, zdjęć i danych położenia. Górskie tło jest ważną częścią filmowej kompozycji.'],
    sources: [source('Meduseld — opis hali z Dwóch wież', 'https://tolkiengateway.net/wiki/Meduseld'), source('Wētā Workshop — Edoras i oryginalna dokumentacja planu', 'https://www.wetanz.com/us/shop/environments/limited-edition-edoras')],
    images: [artwork('Wētā Workshop · Edoras z halą Meduseld', 'https://www.wetanz.com/media/catalog/product/_/l/_lotr_edoraslimited_001.png?optimize=high&fit=bounds&height=440&width=285', 'https://www.wetanz.com/us/shop/environments/limited-edition-edoras', wetaCredit)],
  },
  mordor: {
    description: 'Mordor jest krainą, nie jedną wulkaniczną sceną. Ered Lithui zamykają północ, Ephel Dúath zachód i południe; w Gorgoroth Orodruin oraz Barad-dûr pozostają osobnymi punktami.',
    bookDetails: ['Morannon prowadzi z Dagorladu do Udûnu na północnym zachodzie.', 'Orodruin leży na południowy zachód od Barad-dûr; fortecy nie należy osadzać na tym samym stożku wulkanu.', 'Gorgoroth jest suchym, spustoszonym płaskowyżem. Rolniczy Nurn zajmuje południe.', 'Autorski obraz Barad-dûr pokazuje ciężką warownię z kamienia i ceglastego materiału.'],
    filmDetails: ['Filmowa Czarna Brama ma ogromne zębate skrzydła między wieżami, a Barad-dûr przybiera strzelistą, ostro zakończoną sylwetkę.', 'Płonące Oko na szczycie jest rozwinięciem ekranizacji; autorski obraz wieży pozwala zobaczyć wcześniejszą, odmienną wizję.'],
    sources: [source('Tolkien Estate — Barad-dûr', estateRings), source('Mordor — geografia i książkowe odsyłacze', 'https://tolkiengateway.net/wiki/Mordor'), source('Wētā Workshop — Czarna Brama', 'https://www.wetanz.com/us/shop/environments/the-black-gate'), source('Wētā Workshop — Barad-dûr', 'https://www.wetanz.com/us/shop/environments/tower-of-barad-dur')],
    images: [artwork('J.R.R. Tolkien · Barad-dûr: The Fortress of Sauron, około 1944', 'https://jrrtestate.wpenginepowered.com/wp-content/uploads/2021/04/719azz0063.jpg', estateRings), artwork('Wētā Workshop · Czarna Brama', 'https://www.wetanz.com/media/catalog/product/_/l/_lotr_blackgates_001_1.png?optimize=high&fit=bounds&height=440&width=285', 'https://www.wetanz.com/us/shop/environments/the-black-gate', wetaCredit), artwork('Wētā Workshop · filmowa Barad-dûr', 'https://www.wetanz.com/media/catalog/product/_/l/_lotr_baradurmini_001_1.png?optimize=high&fit=bounds&height=440&width=285', 'https://www.wetanz.com/us/shop/environments/tower-of-barad-dur', wetaCredit)],
  },
  eye: {
    description: 'Osobna rekonstrukcja Oka korzysta z filmowego obrazu płomienia z pionową źrenicą pomiędzy szczytami Barad-dûr. Książkowe Oko jest znakiem i wizją przenikliwej woli Saurona.',
    bookDetails: ['Frodo doświadcza Oka w Zwierciadle Galadrieli oraz na Amon Hen.', 'Czerwone Oko występuje także jako godło sług Mordoru.', 'Płonąca gałka oka nad wieżą nie stanowi kompletnego książkowego opisu cielesnej postaci Saurona.'],
    filmDetails: ['Światło, płomień i pionowa źrenica tworzą ekranową metaforę poszukiwania Pierścienia.', 'Filmowe ujęcia wiążą Oko z rozwidlonym zwieńczeniem ogromnej Czarnej Wieży.'],
    sources: [source('Oko Saurona — tekst i adaptacje', 'https://tolkiengateway.net/wiki/Eye_of_Sauron'), source('Wētā Workshop — filmowa Barad-dûr', 'https://www.wetanz.com/us/shop/environments/tower-of-barad-dur')],
    images: [artwork('Wētā Workshop · wieża pod filmowym Okiem', 'https://www.wetanz.com/media/catalog/product/_/l/_lotr_baradurmini_001_1.png?optimize=high&fit=bounds&height=440&width=285', 'https://www.wetanz.com/us/shop/environments/tower-of-barad-dur', wetaCredit)],
  },
  misty: {
    description: 'Wysoka Przełęcz Bilba jest odrębnym miejscem od Caradhrasu. Ostre grzbiety, górska ścieżka, jaskinia i odległe gniazda orłów określają tę scenę.',
    bookDetails: ['Kompania kieruje się na wschód przez pasmo, po opuszczeniu Rivendell.', 'Burza i zmagania kamiennych olbrzymów skłaniają wędrowców do schronienia.', 'Rysunek Tolkiena pokazuje widok ku zachodowi od orlich gniazd w stronę Gobliniej Bramy.'],
    filmDetails: ['Film rozbudowuje burzę w widowisko z wielkimi kamiennymi olbrzymami.', 'Skalny krajobraz i podziemia są częścią projektów cyfrowych opisanych przez Wētā FX.'],
    sources: [source('Tolkien Estate — Góry Mgliste w ilustracjach Hobbita', estateHobbit), source('Wysoka Przełęcz — odniesienia do Hobbita', 'https://tolkiengateway.net/wiki/High_Pass'), source('Wētā FX — Niezwykła podróż', filmJourney)],
    images: [artwork('J.R.R. Tolkien · Misty Mountains looking West from the Eyrie towards Goblin Gate', 'https://jrrtestate.wpenginepowered.com/wp-content/uploads/2021/04/534-large.jpg', estateHobbit), artwork('J.R.R. Tolkien · Bilbo woke with the early sun in his eyes', 'https://jrrtestate.wpenginepowered.com/wp-content/uploads/2020/11/eagle-cropped.jpg', estateHobbit)],
  },
  goblintown: {
    description: 'Goblinia osada jest siecią skalnych przejść pod Wysoką Przełęczą. Główna sala i głębokie jezioro Golluma tworzą oddzielne wnętrza.',
    bookDetails: ['Ukryte przejście w jaskini prowadzi do tuneli i wielkiej sali władcy goblinów.', 'Gollum mieszka głębiej przy jeziorze; jego łódka i wyspa nie należą do głównej hali.', 'Zewnętrzny krajobraz Gobliniej Bramy widać na autorskim rysunku gór.'],
    filmDetails: ['Ekranizacja tworzy wielkie drewniane pomosty, mosty i rusztowania w ogromnej komorze.', 'Wētā FX opisuje złożone cyfrowe jaskinie jako część prac nad Niezwykłą podróżą.'],
    sources: [source('Goblin-town — opis i przypisy do Hobbita', 'https://tolkiengateway.net/wiki/Goblin-town'), source('Tolkien Estate — widok ku Gobliniej Bramie', estateHobbit), source('Wētā FX — film i środowiska cyfrowe', filmJourney)],
    images: [artwork('J.R.R. Tolkien · krajobraz wokół Gobliniej Bramy', 'https://jrrtestate.wpenginepowered.com/wp-content/uploads/2021/04/534-large.jpg', estateHobbit)],
  },
  beorn: {
    description: 'Wielka drewniana siedziba Beorna ma długi, niski korpus, dwa skrzydła i dziedziniec. Obejście jest gospodarstwem wśród dębów, osłoniętym cierniowym żywopłotem.',
    bookDetails: ['Brama wejściowa stoi od północy; słomiane, dzwonowate ule od południa.', 'Długi dom otaczają ogród, stajnie, stodoły i inne zabudowania.', 'W hali palenisko zajmuje środek; dym wychodzi otworem w dachu, drewniane słupy i ławy prowadzą ku stołom.', 'Autorska ilustracja pokazuje światło ognia oraz konstrukcję wnętrza.'],
    filmDetails: ['Filmowa scenografia silnie akcentuje wielką skalę gospodarza i surowe drewno.', 'Dokładny plan filmu stanowi interpretację; książkowe dwa skrzydła, dziedziniec i obejście pozostają podstawą opisu.'],
    sources: [source('Dom Beorna — opis z rozdziału Niezwykłe mieszkanie', 'https://tolkiengateway.net/wiki/Beorn%27s_house'), source('Tolkien Estate — Firelight in Beorn’s House', estateHobbit)],
    images: [artwork('J.R.R. Tolkien · Firelight in Beorn’s House, 1937', 'https://jrrtestate.wpenginepowered.com/wp-content/uploads/2021/04/540-large.jpg', estateHobbit)],
  },
  mirkwood: {
    description: 'Północna leśna droga Bilba biegnie pod niemal zamkniętą koroną drzew. Gęsty cień, zaczarowana rzeka, pajęczyny i elficka obecność wyznaczają jej odrębność.',
    bookDetails: ['Niebezpieczeństwo zejścia ze ścieżki jest zasadą prowadzącą kompanię.', 'Zaczarowana rzeka przecina szlak; wielkie pająki żyją w północnej puszczy.', 'Pałac Thranduila leży na północnym wschodzie; Dol Guldur jest daleko na południu.', 'Autorska plansza Mirkwood ukazała się w pierwszym wydaniu Hobbita w 1937 roku.'],
    filmDetails: ['Wētā FX opracowało cyfrowe pająki i leśne sekwencje Pustkowia Smauga.', 'Film wzmacnia dezorientację barwą, mgłą i zmianami punktu widzenia; są to środki ekranowego opowiadania.'],
    sources: [source('Mroczna Puszcza — historia i topografia', 'https://tolkiengateway.net/wiki/Mirkwood'), source('Autorska plansza Mirkwood — dokumentacja', 'https://tolkiengateway.net/wiki/File:J.R.R._Tolkien_-_Mirkwood.jpg'), source('Wētā FX — pająki i puszcza', filmSmaug)],
    images: [artwork('J.R.R. Tolkien · Mirkwood, plansza z Hobbita, 1937', 'https://tolkiengateway.net/w/images/a/a4/J.R.R._Tolkien_-_Mirkwood.jpg', 'https://tolkiengateway.net/wiki/File:J.R.R._Tolkien_-_Mirkwood.jpg')],
  },
  thranduil: {
    description: 'Przez most nad Leśną Rzeką dociera się do dużych kamiennych drzwi w skalnym stoku. Za nimi leżą wykute sale, cele oraz najniższe piwnice nad nurtem rzeki.',
    bookDetails: ['Siedziba leży na północnym brzegu Leśnej Rzeki w północno-wschodniej puszczy.', 'Duża sala ma kolumny wykute z żywej skały; pałac jest też skarbcem i schronieniem.', 'Rzeczna piwnica ma kratę zamykającą wylot, którym opuszcza się beczki.', 'Wiele leśnych elfów mieszka w lesie; nie całe królestwo jest podziemnym miastem.'],
    filmDetails: ['Film rozbudowuje wnętrza w monumentalną organiczną architekturę i tarasy nad przepaścią.', 'Oficjalny materiał Wētā FX Thranduil’s Realm dokumentuje tę interpretację cyfrową.'],
    sources: [source('Sale leśnego króla — przypisy do Hobbita', 'https://tolkiengateway.net/wiki/Elvenking%27s_Halls'), source('Tolkien Estate — The Elvenking’s Gate', estateHobbit), source('Wētā FX — Thranduil’s Realm', filmSmaug)],
    images: [artwork('J.R.R. Tolkien · The Elvenking’s Gate, 1936', 'https://jrrtestate.wpenginepowered.com/wp-content/uploads/2021/04/554-croppedjpg.jpg', estateHobbit), artwork('J.R.R. Tolkien · Bilbo comes to the Huts of the Raft-elves', 'https://jrrtestate.wpenginepowered.com/wp-content/uploads/2021/04/559azz0050.jpg', estateHobbit)],
  },
  laketown: {
    description: 'Esgaroth jest całkowicie drewnianą osadą na palach przy zachodnim brzegu Długiego Jeziora. Długi most prowadzi od lądu ku bramie; wodny rynek organizuje środek miasta.',
    bookDetails: ['Miasto stoi w osłoniętej zatoce nieco na północ od ujścia Leśnej Rzeki.', 'Okrągły basen rynku łączy kanał z otwartym jeziorem; wokół są nabrzeża, schody i drabiny.', 'Większy dom zarządcy góruje nad drewnianą zabudową.', 'Długi most ma strażnicę przy lądzie i może zostać odłączony.'],
    filmDetails: ['Wētā FX rozbudowało Lake-town w szczegółową cyfrową osadę pełną pomostów i zabudowy.', 'Oficjalny materiał Laketown: The Devil is in the Details pozwala porównać ekranową gęstość miasta z autorskim rysunkiem.'],
    sources: [source('Lake-town — książkowy opis osady', 'https://tolkiengateway.net/wiki/Lake-town'), source('J.R.R. Tolkien — rysunek Esgaroth, dokumentacja', 'https://tolkiengateway.net/wiki/File:J.R.R._Tolkien_-_Lake_Town.jpg'), source('Wētā FX — cyfrowe Lake-town', filmSmaug)],
    images: [artwork('J.R.R. Tolkien · Lake Town, Hobbit, 1937', 'https://tolkiengateway.net/w/images/b/bf/J.R.R._Tolkien_-_Lake_Town.jpg', 'https://tolkiengateway.net/wiki/File:J.R.R._Tolkien_-_Lake_Town.jpg'), artwork('J.R.R. Tolkien · Death of Smaug, około 1936', 'https://jrrtestate.wpenginepowered.com/wp-content/uploads/2021/04/582azz0161.jpg', estateHobbit)],
  },
  erebor: {
    description: 'Samotny masyw z wieloma skalnymi ramionami kryje krasnoludzkie królestwo. Monumentalna południowa Przednia Brama i małe zachodnie tajne drzwi pełnią odmienne funkcje.',
    bookDetails: ['River Running wypływa spod Przedniej Bramy i kieruje się ku Dale i Długiemu Jezioru.', 'Za bramą droga prowadzi w głąb Góry w pobliżu rzeki, do sal, komnat i magazynów.', 'Małe wejście na zachodniej ścianie prowadzi tajnym tunelem ku dolnej komorze skarbu.', 'Rysunki Przedniej Bramy i rozmowy ze Smaugiem pokazują autorską skalę skały, wnętrza oraz skarbu.'],
    filmDetails: ['Film rozwija geometrię krasnoludzką w kolosalne kolumny, mosty, tarasy i głębokie komory.', 'Wētā FX dokumentuje cyfrowy Erebor; filmowa walka krasnoludów ze Smaugiem i złoty posąg są dodatkami adaptacji.'],
    sources: [source('Tolkien Estate — Przednia Brama i Conversation with Smaug', estateHobbit), source('Samotna Góra — książkowa geografia i historia', 'https://tolkiengateway.net/wiki/Lonely_Mountain'), source('Wētā FX — Erebor', filmSmaug)],
    images: [artwork('J.R.R. Tolkien · The Front Gate, 1936', 'https://jrrtestate.wpenginepowered.com/wp-content/uploads/2021/04/564dhv0021.jpg', estateHobbit), artwork('J.R.R. Tolkien · Conversation with Smaug, 1937', 'https://jrrtestate.wpenginepowered.com/wp-content/uploads/2021/04/571azz0051.jpg', estateHobbit)],
  },
};

for (const refs of Object.values(visualReferences)) {
  for (const entry of refs.sources) {
    if (!sources.some(existing => existing.url === entry.url)) sources.push(entry);
  }
}

export const geographicNotes = {
  shire: {
    title: 'Od Wzgórza ku Wodzie',
    summary: 'Wzgórze wznosi się na północ od Wody. Bag End leży wysoko, Bagshot Row na jego południowym stoku, a niżej rozciąga się Pole Przyjęcia. Hobbiton zajmuje oba brzegi rzeki.',
    landmarks: ['Stary Młyn stoi na północnym brzegu, blisko mostu.', 'Droga od mostu wspina się ku Wzgórzu; Old Grange leży po jej zachodniej stronie.', 'Bywater jest osobną wsią na południowy wschód; dalej na południe biegnie Wielki Gościniec Wschodni.'],
    scope: 'Karta zbliża okolice Hobbitonu. Shire obejmuje wiele innych wzgórz, wsi i pól, których nie należy skupiać przy samym Bag End.',
    sources: [source('Hobbiton — geografia i odsyłacze do książek', 'https://tolkiengateway.net/wiki/Hobbiton'), source('The Hill — autorski widok Hobbitonu', estateHobbit)],
  },
  bree: {
    title: 'Droga wokół wzgórza',
    summary: 'Bree zajmuje zachodnie zbocze Bree-hill. Kamienne domy leżą ponad drogą, hobbickie nory jeszcze wyżej; rów i żywopłot biegną łukiem od wzgórza z powrotem ku niemu.',
    landmarks: ['East Road wchodzi bramą zachodnią, obiega podnóże i wychodzi bramą południową.', 'Za południową bramą droga znów skręca na wschód.', 'Greenway przecina East Road na zachód od osady.'],
    scope: 'Zachowano główny przebieg dróg i położenie zbocza. Rozkład każdego domu nie jest kompletnym planem poświadczonym w opowieści.',
    sources: [source('Bree — bramy, droga i zbocze', 'https://tolkiengateway.net/wiki/Bree'), source('Greenway — skrzyżowanie na zachód od Bree', 'https://tolkiengateway.net/wiki/Greenway')],
  },
  rivendell: {
    title: 'Dom poniżej wrzosowisk',
    summary: 'Imladris leży w głębokiej, osłoniętej dolinie Bruinenu pod zachodnimi podnóżami Gór Mglistych. Dom Elronda jest nisko wobec wyżyny, z której schodzi wędrowiec.',
    landmarks: ['Kręta ścieżka zstępuje stromo ku dolinie.', 'Wąski most i nurt wody leżą przy drodze do domu.', 'Dno doliny jest zalesione; grzbiety i strome ściany zamykają widok.'],
    scope: 'Rysunki autora ustalają charakter doliny. Tarasy i rozbudowane skrzydła domu czerpią z ekranizacji; nawet filmowy układ zmieniał się między ujęciami.',
    sources: [source('Rivendell — wąwóz i położenie', 'https://tolkiengateway.net/wiki/Rivendell'), source('Tolkien Estate — widoki doliny', estateHobbit), source('Wētā — granice pewności filmowego planu', 'https://www.wetanz.com/us/shop/environments/rivendell-environment-placeholder')],
  },
  gondor: {
    title: 'Miasto, pola i wielka rzeka',
    summary: 'Mindolluin stoi na zachód od Minas Tirith. Miasto zwraca się ku wschodowi, na Pelennor i dalszą dolinę Anduiny; skalny dziób wskazuje tę samą stronę.',
    landmarks: ['Siedem poziomów łączy wspinająca się droga; bramy powyżej Wielkiej Bramy są naprzemiennie po stronie północnej i południowej.', 'Rammas Echor obejmuje pola, farmy, sady i pastwiska poza miastem.', 'Drogi prowadzą ku Rohanowi, Pelargirowi i Osgiliath nad Anduiną.'],
    scope: 'Karta pokazuje stolicę i jej przedpole. Rammas Echor jest odległym murem ziem uprawnych, a nie ciasnym ósmym kręgiem Minas Tirith; cała Anduina nie płynie tuż pod bramą miasta.',
    sources: [source('Minas Tirith — miasto i Mindolluin', 'https://tolkiengateway.net/wiki/Minas_Tirith'), source('Rammas Echor — rozległy obwód pól i drogi', 'https://tolkiengateway.net/wiki/Rammas_Echor'), source('Pelennor — położenie i ziemie uprawne', 'https://tolkiengateway.net/wiki/Pelennor_Fields')],
  },
  rohan: {
    title: 'Wzgórze przy wyjściu z Harrowdale',
    summary: 'Edoras stoi na wzgórzu przy północnym ujściu Harrowdale. Góry Białe wznoszą się na południu, a równina otwiera przed miastem. Meduseld zajmuje szczyt.',
    landmarks: ['Droga do bramy przechodzi pomiędzy dwiema grupami królewskich kurhanów.', 'Snowbourn płynie z Harrowdale na północ obok Edoras, potem skręca na wschód ku Entwash.', 'Dojście do Meduseld wspina się przez miasto ku tarasowi i północnemu wejściu hali.'],
    scope: 'Edoras jest jednym miejscem w rozległym Rohanie. Hornburg, Isengard i Dunharrow wymagają własnych odległych odcinków drogi.',
    sources: [source('Snowbourn — kierunek według mapy i Powrotu króla', 'https://tolkiengateway.net/wiki/Snowbourn'), source('Barrowfield — droga pomiędzy kurhanami', 'https://tolkiengateway.net/wiki/Barrowfield'), source('Meduseld — wejście i taras', 'https://tolkiengateway.net/wiki/Meduseld')],
  },
  mordor: {
    title: 'Brama, kotlina i płaskowyż',
    summary: 'Od Morannonu na północnym zachodzie droga prowadzi przez Udûn i Isenmouthe na Gorgoroth. Barad-dûr wyrasta z odnogi Ered Lithui na wschód od samotnej Orodruiny.',
    landmarks: ['Ephel Dúath i Morgai osłaniają zachodni skraj; Ered Lithui zamykają północ.', 'Orodruin oraz Barad-dûr są odrębnymi miejscami oddzielonymi wieloma milami.', 'Południowy Nurn i jego jezioro należą do innego, mniej spustoszonego krajobrazu.'],
    scope: 'Karta skraca wielkie odległości, lecz zachowuje kolejność przejść. Wieża i wulkan nie są jednym masywem; mapa filmowa często przybliża je dla widoczności.',
    sources: [source('Gorgoroth — przejścia i granice płaskowyżu', 'https://tolkiengateway.net/wiki/Gorgoroth'), source('Orodruin — samotny wulkan i droga Saurona', 'https://tolkiengateway.net/wiki/Mount_Doom'), source('Barad-dûr — położenie i filmowa kompresja', 'https://tolkiengateway.net/wiki/Barad-d%C3%BBr'), source('Nurn — kraina na południu', 'https://tolkiengateway.net/wiki/Nurn')],
  },
  eye: {
    title: 'Spojrzenie z Czarnej Wieży',
    summary: 'Oko nie wyznacza osobnej ziemi. Filmowa wizja płonie ponad Barad-dûr, której położenie pozostaje położeniem fortecy we wschodniej części Gorgoroth.',
    landmarks: ['Barad-dûr leży daleko za Udûnem i Czarną Bramą.', 'Książkowe Oko jest znakiem oraz doświadczeniem złowrogiego spojrzenia.', 'Płomienna postać na zwieńczeniu wieży pochodzi z ekranizacji.'],
    scope: 'Osobna karta jest zbliżeniem filmowej wizji. Jej widoczność z każdej odległej krainy nie stanowi książkowego pomiaru terenu.',
    sources: [source('Oko — tekst i ekranizacja', 'https://tolkiengateway.net/wiki/Eye_of_Sauron'), source('Barad-dûr — odległość od Morannonu i filmowa kompresja', 'https://tolkiengateway.net/wiki/Barad-d%C3%BBr')],
  },
  misty: {
    title: 'Przez pasmo na wschód',
    summary: 'Góry Mgliste ciągną się z północy na południe. Eriador i Rivendell są po stronie zachodniej, dolina Anduiny po wschodniej; Wysoka Przełęcz przecina pasmo w drodze Bilba.',
    landmarks: ['Szlak wznosi się od Rivendell ku grzbietowi i schodzi ku Wilderlandowi.', 'Caradhras i Moria leżą dalej na południe, na innym szlaku.', 'Goblinie przejścia przebijają góry pod Wysoką Przełęczą.'],
    scope: 'Karta zbliża północne przejście Bilba. Całe pasmo jest znacznie dłuższe niż ukazany grzbiet.',
    sources: [source('Góry Mgliste — przebieg pasma', 'https://tolkiengateway.net/wiki/Misty_Mountains'), source('Wysoka Przełęcz — szlak koło Rivendell', 'https://tolkiengateway.net/wiki/High_Pass')],
  },
  goblintown: {
    title: 'Dwa wejścia, głęboki odgałęziony świat',
    summary: 'Front Porch otwiera się wysoko przy szlaku przełęczy. Goblin-town biegnie wewnątrz pasma, a niższa Goblinia Brama wychodzi na wschód ku Wilderlandowi.',
    landmarks: ['Szczelina za schronieniem prowadzi do goblinich tuneli.', 'Sala Wielkiego Goblina jest częścią osady, a jezioro Golluma głębszym odgałęzieniem.', 'Wyjście na wschodzie prowadzi w stronę krajobrazu pod gniazdami orłów.'],
    scope: 'Książka podaje relacje pomiędzy wejściami i odgałęzieniami, lecz nie kompletny plan tuneli. Drewniane mosty i pomosty rozwija film.',
    sources: [source('Front Porch — wejście przy Wysokiej Przełęczy', 'https://tolkiengateway.net/wiki/Front_Porch'), source('Goblin-town — przejścia przez pasmo', 'https://tolkiengateway.net/wiki/Goblin-town'), source('Goblinia Brama — niższy wschodni wylot', 'https://tolkiengateway.net/wiki/Goblin-gate')],
  },
  beorn: {
    title: 'Pomiędzy rzeką a puszczą',
    summary: 'Siedziba Beorna leży na wschód od Anduiny, blisko Carrocku, i na zachód od Mrocznej Puszczy. Dom otaczają otwarte pastwiska oraz gospodarstwo.',
    landmarks: ['Carrock jest skalną wyspą w Anduinie, na północ od Starego Brodu.', 'Północna brama żywopłotu prowadzi na dziedziniec; ule stoją po południowej stronie obejścia.', 'Kompania jedzie od domu na północ do Forest Gate; ta podróż zajmuje kilka dni.'],
    scope: 'Rzeka, gospodarstwo i odległy las tworzą szerszy pejzaż. Forest Gate nie znajduje się bezpośrednio za ogrodem.',
    sources: [source('Dom Beorna — położenie i obejście', 'https://tolkiengateway.net/wiki/Beorn%27s_house'), source('Carrock — wyspa w Anduinie', 'https://tolkiengateway.net/wiki/Carrock'), source('Forest Gate — droga na północ od domu', 'https://tolkiengateway.net/wiki/Forest_Gate')],
  },
  laketown: {
    title: 'Zatoka przy zachodnim brzegu',
    summary: 'Esgaroth stoi na wodzie przy zachodnim brzegu Długiego Jeziora, nieco na północ od ujścia Leśnej Rzeki. Skalny cypel osłania spokojną zatokę od nurtu.',
    landmarks: ['Długi most wychodzi z lądu do bramy drewnianego miasta.', 'Centralny basen rynku łączy kanał z otwartym jeziorem.', 'Erebor i Dale leżą na północy; Running zasila jezioro i odpływa z niego na południu przez wodospad.'],
    scope: 'Miasto zajmuje małą część rozległego jeziora. Woda sięga daleko za nabrzeża, a Erebor nie stoi przy drugim końcu mostu.',
    sources: [source('Esgaroth — zatoka, most i rynek', 'https://tolkiengateway.net/wiki/Lake-town'), source('Długie Jezioro — dopływy i odpływ', 'https://tolkiengateway.net/wiki/Long_Lake')],
  },
  erebor: {
    title: 'Ramiona Góry i dolina Dale',
    summary: 'Przednia Brama leży na południu, u głowy doliny pomiędzy dwoma ramionami Samotnej Góry. Rzeka wypływa spod bramy i prowadzi ku Dale oraz Długiemu Jezioru.',
    landmarks: ['Ravenhill zajmuje zakończenie południowo-zachodniego grzbietu.', 'Tajne drzwi leżą w małej dolince po zachodniej stronie Góry.', 'Mapa Throra pokazuje rozchodzące się ramiona masywu; na tej mapie wschód znajduje się u góry.'],
    scope: 'Dale jest osobnym miastem w dolinie przed Górą; podczas wyprawy Bilba leży w ruinie. Nie podano kompletnego planu wszystkich podziemnych sal.',
    sources: [source('Przednia Brama — południowa dolina i rzeka', 'https://tolkiengateway.net/wiki/Front_Gate'), source('Dale — miasto i drogi', 'https://tolkiengateway.net/wiki/Dale'), source('Samotna Góra — grzbiety i tajna droga', 'https://tolkiengateway.net/wiki/Lonely_Mountain'), source('Mapa Throra — orientacja z wschodem u góry', 'https://tolkiengateway.net/wiki/Thr%C3%B3r%27s_Map')],
  },
  mirkwood: {
    title: 'Północna droga pod liśćmi',
    summary: 'Elficka ścieżka przekracza północną Mroczną Puszczę od Forest Gate na zachodzie ku salom leśnego króla i wschodniej granicy lasu.',
    landmarks: ['Zaczarowana rzeka przecina szlak mniej więcej pośrodku.', 'Później wędrowcy wchodzą w jaśniejsze partie bukowego lasu.', 'Leśna Rzeka biegnie przez północ puszczy ku jezioru; Dol Guldur leży daleko na południu.'],
    scope: 'Leśna karta zbliża szlak Bilba, a nie całą puszczę. Pałac, pajęcze łowiska i południowy cień nie są sąsiadującymi polanami.',
    sources: [source('Elf-path — zachodnie wejście, rzeka i wschodni odcinek', 'https://tolkiengateway.net/wiki/Elf-path'), source('Mroczna Puszcza — północ i południe lasu', 'https://tolkiengateway.net/wiki/Mirkwood')],
  },
  thranduil: {
    title: 'Brama nad Leśną Rzeką',
    summary: 'Sale Thranduila wykuto w lesistym wzgórzu na północnym brzegu Leśnej Rzeki, blisko wschodniego krańca puszczy. Most prowadzi ku wielkim kamiennym wrotom.',
    landmarks: ['Najniższe piwnice leżą nad podziemnym nurtem.', 'Osobny zakratowany wylot pozwala wypuszczać beczki na rzekę.', 'Dalszy nurt wiedzie przez wschodnie mokradła i osady rzecznych elfów ku Długiemu Jezioru.'],
    scope: 'Wejście, rzeka i piwnice są opisane w opowieści. Dokładne rozłożenie wszystkich kolumn, schodów i cel pozostaje interpretacją.',
    sources: [source('Sale leśnego króla — brzeg, wrota i piwnice', 'https://tolkiengateway.net/wiki/Elvenking%27s_Halls'), source('Elficka ścieżka — wschodni skraj lasu', 'https://tolkiengateway.net/wiki/Elf-path'), source('Brama i osady rzecznych elfów — ilustracje autora', estateHobbit)],
  },
};

for (const [id, note] of Object.entries(geographicNotes)) {
  visualReferences[id].geography = note;
  for (const entry of note.sources) {
    if (!visualReferences[id].sources.some(existing => existing.url === entry.url)) visualReferences[id].sources.push(entry);
    if (!sources.some(existing => existing.url === entry.url)) sources.push(entry);
  }
}
