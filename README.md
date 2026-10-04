# Atlas Śródziemia

Interaktywna księga w języku polskim: dwa atlasy, 14 lokacji, szlaki Bilba i Froda, osobne sceny 3D, sześć portretów, kronika oraz zwiedzanie. Animowane karty mają pamięć ostatniego rozdziału i etapów wypraw w bieżącej sesji.

Oprawa przedstawia zamknięty tom w zielonej skórze, a po otwarciu dwie karty na stole: tekst po lewej i interaktywną ilustrację po prawej. Grzbiet, kapitałka, warstwy papieru, folia i wystające zakładki zachowują wspólną formę księgi. Mapy zajmują rozkładówkę. Przewracana karta ma przód i odwrocie i obraca się wokół grzbietu; ograniczony ruch pomija tę animację. Na telefonie ilustracja i tekst są osobnymi widokami tej samej karty, przełączanymi przyciskiem Czytaj kartę.

Shire obejmuje jeden wielki Pagórek z Bag End na górnym stoku, trzema domami Bagshot Row poniżej i trzema dodatkowymi bocznymi norami. Rozgałęzione, sklepione wnętrze Bag End znajduje się pod ziemią; przekrój odsłania hall i pokoje. Niżej leży Hobbiton po obu stronach Wody, z mostem i Starym Młynem.

Przebudowane osady mają rozległe obszary zabudowane: ulice i podwórza Bree na zachodnim zboczu, siedem dzielnic Minas Tirith z naprzemiennymi bramami i tunelami przez skalny dziób, tarasy Wielkiego Domu w Rivendell oraz drogę przez Edoras ku Meduseld. Esgaroth zajmuje wspólny pokład z kwartałami, wodnym rynkiem, kanałem dla łodzi i długim mostem na ląd. Erebor, Goblin-town i Sale Thranduila mają wielopoziomowe zespoły sal, połączonych korytarzy i funkcjonalnie odrębnych pomieszczeń. Szczegółowe parcele i plany wnętrz są interpretacją opartą na opisanych relacjach przestrzennych, nie zachowanymi planami kanonicznymi.

## Podgląd

Z katalogu projektu uruchom: `npm run preview`. Otwórz http://127.0.0.1:4173. Biblioteka Three.js i fonty są zapisane lokalnie w dist; przeglądarka wymaga WebGL2.

## Sterowanie

Przeciąganie obraca kamerę, kółko przybliża, prawy przycisk przesuwa kadr. Wybierz Zwiedzaj, by przejść przez konkretne punkty lokacji. Przycisk Cała kraina pokazuje szerszy pejzaż, a Plan krainy z góry kadruje cały obszar zabudowany. W podziemnych kompleksach plan odsłania sale i korytarze, po wyjściu przywracając sklepienia. Bag End ma dodatkowy przekrój. Tryb immersyjny chowa oprawę księgi; Escape ją przywraca. Modele można pobierać do Blendera jako GLB, a kadry jako obrazy 4K. Efekty ekranowe i zachowania animacji nie są eksportowane do GLB.

Bohaterowie otwierają ostatnio wybrany portret. Sześć przycisków wyboru pozostaje przy scenie również na telefonie; podczas oglądania z bliska ustępuje panelowi spaceru.

Na mapie wybierz Wyrusz z Bilbem lub Frodem. Etapy są klikalne, a znacznik i szeroki pas atramentu pokazują postęp. Panel kroniki zawiera datę, opowieść i wejście do krainy; po zwiedzaniu można wrócić do zapamiętanego etapu. Odtwarzanie ma cztery tempa oraz opcję podążania kamerą. Suwak, lista etapów i strzałki klawiatury służą do przewijania. Wyprawa, powrót i epilog są rozróżnione; powtórne wizyty w tych samych okolicach mają osobny wybór.

## Opracowanie i źródła

Opisy są autorskimi polskimi parafrazami opartymi na źródłach książkowych. Różnice między tekstem i adaptacjami zaznaczono w zakładce Źródła i ilustracje. Każda lokacja zawiera też notę o geografii, relacjach punktów orientacyjnych i zakresie interpretacji. Kolofon zawiera wykaz źródeł.

Kartografia: Pauline Baynes, mapa stworzona w konsultacji z Tolkienem; źródło Bodleian Libraries/Museoteca, © HarperCollins Publishers Ltd. Oryginalne ilustracje i robocze mapy J.R.R. Tolkiena: Tolkien Estate, podpisane przy obrazach. Ilustracje filmowe i modele referencyjne: Wētā, z podpisami. Relief, modele, korytarze i wysokości są opracowaniem artystycznym; projekcje szlaków przybliżono do ilustracyjnej mapy.

Okładka: ImageGen (wbudowane narzędzie); prompt w ASSET-PROMPTS.txt. Ambient jest oryginalną syntezą dźwięku.

## Pliki

`dist/app.js` — interakcje i renderowanie; `cartography.js` — mapy; `regions.js` i `bonus-regions.js` — proceduralne sceny; `extra-characters.js` — Legolas, Elrond i Smaug; `lore.js` — kronika i źródła.

Jakość Ultra używa wysokiej rozdzielczości i cieni 4096px. Tryb Lekka ogranicza obciążenie. Modele są stylizowanymi autorskimi rekonstrukcjami, nie skanami aktorów ani oryginalnymi modelami produkcyjnymi.

## Płynność i dostępność

Domyślny tryb Automatyczna dopasowuje rozdzielczość do czasu klatek, zachowując geometrię modeli. Ultra pozostaje dostępna jako ręczny wybór. Cienie ruchomych obiektów są odświeżane do ośmiu razy na sekundę, a cienie nieruchomych scen po zmianach oświetlenia lub przekroju. Zamknięta i niewidoczna księga zatrzymuje pętlę; nieruchoma mapa renderuje się po zmianie kadru. Kamera, obrót i drzwi uwzględniają czas klatki. Ostatnie trzy dioramy są przechowywane w pamięci; starsze zwalniają geometrię, materiały i tekstury.

Miniatury opowieści powstają pojedynczo w osobnym małym buforze obrazu. Wygenerowanie ich nie zmienia rozmiaru widocznego reliefu. Karty rozdziałów mają czytelniejsze etykiety i obsługę strzałek w zakładkach. Mobilny spis można zamknąć przyciskiem, kliknięciem poza kartą albo Escape. Preferencja ograniczonego ruchu wyłącza automatyczne animacje i przewracanie stron.
