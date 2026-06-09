/**
 * locationContent.ts
 *
 * Editorial descriptions for city and neighborhood pages.
 * Voice: Popeye / Casa Brutus — atmospheric, informational, no AI buzzwords,
 * no em dashes, no punchy one-liner closers.
 *
 * To add or edit a description, find the city/neighborhood key below and update the string.
 * Keys must match exactly what is stored in the DB (case-sensitive).
 */

// ---------------------------------------------------------------------------
// CITY DESCRIPTIONS
// ---------------------------------------------------------------------------

export const CITY_DESCRIPTIONS: Record<string, string> = {
  Tokyo:
    'The scale takes time to reckon with. What looks on a map like a single city is really dozens of distinct neighborhoods, each with its own rhythm and character, connected by one of the world\'s most efficient train systems. The vintage and fashion scene is spread across all of it, from the collector-grade boutiques of Harajuku and Daikanyama to the dense secondhand circuits of Shimokitazawa and Koenji to the quieter, more specific stores tucked into neighborhoods most visitors never reach.',

  Osaka:
    'Japan\'s second city and genuinely its own thing. The pace is different, people are louder and friendlier, and the streets around Amerika-mura feel more improvised than anything comparable in the capital. Shinsaibashi has the main shopping corridor; Horie, just west of it, is where the more interesting independent stores and cafes have settled. The food alone justifies the trip.',

  Kyoto:
    'Slower and more specific than any other city on this list. The fashion scene is small but the stores that exist tend to have a clear point of view around Japanese craft, natural materials, and older things made well. The city\'s aesthetic sensibility runs through everything, from the machiya storefronts to the way things are packaged. Worth a half day on foot through Shimogyo and the lanes off Kawaramachi.',

  Fukuoka:
    'Japan\'s gateway to Asia and a city that moves faster than most people expect. The fashion scene concentrates around Tenjin and the Daimyo district, where the streets pack in an impressive density of streetwear stores, select shops, and vintage alongside the restaurants and bars that make Fukuoka a genuinely good city to spend time in. Smaller than Tokyo or Osaka but with its own strong sense of style.',

  Nagoya:
    'Often overlooked in favor of Tokyo and Osaka but worth paying attention to. The Osu shopping district is where most of the fashion activity concentrates, a dense covered arcade that mixes electronics, vintage, streetwear, and food in a way that feels genuinely chaotic and alive. The city has a strong manufacturing and craft heritage that shows up in some of the stores.',

  Sapporo:
    'Japan\'s northernmost major city and a different experience from anything further south. The winters shape the culture here in visible ways, from the clothing people wear to the indoor shopping networks that connect much of the city center. The fashion scene is smaller but specific, with a cluster of interesting stores in the Susukino and Odori areas.',

  Kobe:
    'A port city with a long history of international influence, which shows up in the fashion scene in subtle ways. The Kitano and Tor Road areas have some of the city\'s more interesting independent stores. More relaxed than Osaka, with a European-influenced streetscape that gives the shopping a different character from the rest of Kansai.',

  Kanazawa:
    'A well-preserved city with a strong craft tradition and a fashion scene that reflects it. The stores here tend toward quality materials and Japanese production, set against a backdrop of historic streets and traditional architecture. Compact and walkable, with enough to fill a full day alongside the Kenroku-en garden and the Higashi Chaya district.',

  Hiroshima:
    'A modern, forward-looking city that sits alongside its history rather than being defined by it. The fashion scene is smaller than the major cities but there are good independent stores scattered across the Hondori shopping area and the streets around it. A pleasant city to spend an afternoon moving between stores and the riverside.',

  Sendai:
    'The largest city in the Tohoku region, with a fashion scene anchored around the Ichibancho shopping district. More compact than the major cities but with a solid selection of independent stores and vintage shops that make it worth an afternoon if you\'re passing through the north.',

  'Kanagawa / Yokohama':
    'Yokohama sits just south of Tokyo and functions as its own distinct city rather than a suburb. The Motomachi and Chinatown areas hold the most interesting independent retail, with a mix of vintage, craft, and international goods that reflects the port city\'s history. Closer to Tokyo than most visitors realize.',

  Niigata:
    'A coastal city on the Sea of Japan with a strong food culture and a small but solid independent retail scene. The fashion stores concentrate around the Furumachi and Bandai areas, with a mix of local brands and vintage stores that serve the city\'s student population.',

  Kawasaki:
    'An industrial city between Tokyo and Yokohama with a commercial center around the main station. A small independent and vintage scene exists in the streets around Kawasaki station, worth checking for anyone commuting between the two cities.',

  Saitama:
    'The capital of Saitama prefecture, directly north of Tokyo and accessible in under thirty minutes from the city center. The area around Omiya has the highest concentration of fashion stores in the region, with a mix of vintage and independent shops alongside the mainstream retail.',

  Chiba:
    'Large city east of Tokyo with a commercial center around Chiba station. A handful of vintage and independent stores exist within a mostly mainstream retail landscape, mainly relevant for those living or staying on the eastern side of the metropolitan area.',

  Okayama:
    'A mid-sized city in the Chugoku region with a compact commercial center and good connections to both Hiroshima and Kyoto. The fashion scene is modest, but the proximity to Kojima, Japan\'s denim heartland, makes the wider area worth exploring for anyone interested in Japanese workwear and craft manufacturing.',

  Kojima:
    'A town in Okayama prefecture with a long history of denim and workwear manufacturing. Several stores here stock Japanese-made denim and workwear, some produced in the surrounding factories. A specific destination for anyone serious about the craft behind Japanese denim.',

  Shizuoka:
    'A mid-sized city between Tokyo and Nagoya with a commercial center around the station area. A small selection of independent and vintage stores exists alongside the mainstream retail, with the city\'s position on the Tokaido Line making it an easy stop between the major cities.',

  Takamatsu:
    'The main city on Shikoku island, accessible from Honshu via the Seto Ohashi Bridge. A small but specific fashion scene exists alongside the local craft and food culture the city is better known for. The covered Marche shopping street holds most of the independent retail.',

  Toyama:
    'A small city on the Japan Sea coast, better known for its pharmaceutical industry and the surrounding mountain scenery. A modest local fashion scene exists in the city center, with a handful of independent stores worth checking if you\'re using the city as a base for the Tateyama Kurobe Alpine Route.',

  Gunma:
    'A prefecture north of Tokyo, primarily known for its hot springs and silk production history. The fashion scene is dispersed across several cities, with Maebashi and Takasaki holding the main commercial areas. Worth a detour for anyone interested in the region\'s textile heritage.',

  Kochi:
    'A Pacific coast city on Shikoku island, known for its market culture and outdoor lifestyle. The fashion scene is small, centered around the Obiyamachi shopping arcade, but the Sunday Ichi market on Otesuji Boulevard gives a strong sense of the city\'s local character.',

  Fukushima:
    'A mid-sized city in the Tohoku region with a local retail scene centered around the main station area. A handful of independent stores serve the local population, mainly relevant for visitors exploring the wider Tohoku region.',

};

// ---------------------------------------------------------------------------
// NEIGHBORHOOD DESCRIPTIONS
// ---------------------------------------------------------------------------

export const NEIGHBORHOOD_DESCRIPTIONS: Record<string, Record<string, string>> = {
  Tokyo: {
    Harajuku:
      'Two neighborhoods living inside one name. Takeshita-dori pulls in the weekend crowds; everything worth finding is in Ura-Harajuku, the quieter residential stretch behind the main drag where small boutiques and design studios sit between family restaurants and convenience stores. Cat Street runs through the middle of it. The energy is unhurried for somewhere with this much happening.',

    Shimokitazawa:
      'A short train from Shibuya and Shinjuku but a different pace entirely. The station opens onto narrow streets packed with record shops, vintage stores, live music venues, and cafes that look like they\'ve barely changed since the 80s. Most places don\'t open until noon and the neighborhood doesn\'t really come alive until mid-afternoon, when the streets fill with students, musicians, and people who seem to have nowhere specific to be. After dark the bars fill up and the live houses start their sets.',

    Koenji:
      'Grittier and more lived-in than most of Tokyo\'s fashion neighborhoods. The streets around the south exit run dense with vintage stores, record shops, and izakayas, with the occasional rehearsal studio leaking sound through a thin wall. There\'s a longstanding alternative culture here that predates the vintage trend and the stores and the crowd reflect that.',

    Daikanyama:
      'One of Tokyo\'s quieter fashion neighborhoods, spread across low-rise streets that feel more like a village than a district of one of the world\'s largest cities. The stores here run toward the considered and expensive end of things, alongside independent cafes and restaurants that draw a crowd that lives and works nearby. The Tsutaya flagship bookstore complex is here and worth an hour on its own.',

    Nakameguro:
      'The canal that runs through the center sets the scene. The streets on either side are packed with small restaurants, coffee shops, and select stores, with more tucked into the side streets and up on the hillsides above. One of the more pleasant neighborhoods to walk around in Tokyo, particularly in spring when the cherry blossoms line the water.',

    Shibuya:
      'The crossing is real and worth seeing once. Beyond that, Shibuya holds an enormous concentration of shopping spread across department stores, underground malls, and the streets that fan out from the station. The fashion scene ranges from mass market to serious collector depending on which direction you walk from the exit.',

    Shinjuku:
      'Tokyo\'s most vertically dense neighborhood. The east side runs around Kabukicho and the streets behind it; the west side has the skyscrapers and business hotels. The vintage and fashion scene sits mostly in the east, in the covered arcades and smaller streets around Shinjuku-sanchome. Isetan is here and worth visiting for the menswear floors.',

    Omotesando:
      'The main boulevard functions as Tokyo\'s answer to a European fashion avenue, with the flagship stores of most international luxury brands lined up along tree-shaded streets. The more interesting shopping is in the lanes and backstreets, particularly the small streets leading toward Aoyama and the Spiral building.',

    Aoyama:
      'Quieter and more residential than the streets closer to Omotesando, with a strong concentration of Japanese designer stores and galleries. The area around Minami-Aoyama and Kotto-dori has some of the city\'s better vintage and antique stores alongside contemporary design studios.',

    Ebisu:
      'Comfortable and unhurried, the streets around Ebisu skew toward well-made things over flash. Yebisu Garden Place anchors the neighborhood, but the more interesting shops are scattered in the residential streets around it. A good place to spend a few hours without the intensity of Harajuku or Shibuya.',

    Ginza:
      'Tokyo\'s traditional luxury shopping district, rebuilt for the contemporary era. The flagship stores here represent the most established end of fashion, from Japanese heritage brands to international houses. Worth visiting for the department stores, particularly the older Mitsukoshi and the newer Ginza Six complex.',

    Ueno:
      'A different pace from the fashion neighborhoods further south. Ueno is anchored by the park, the museums, and the Ameyoko market, a covered arcade stretching south from the station that\'s been selling surplus goods, food, and clothing since the postwar years. The vintage scene here runs toward the practical and affordable end.',

    Kichijoji:
      'Popular with the university crowd and consistently one of Tokyo\'s most livable neighborhoods. The area around Harmonica Yokocho has the best concentration of small bars and restaurants; the shopping runs through the arcade toward Inokashira Park. A solid vintage scene is scattered through the backstreets around the north exit.',

    Sangenjaya:
      'One of the better examples of a Tokyo neighborhood that has stayed affordable and local while becoming better known. The streets around the station are dense with small bars, restaurants, and independent shops. The fashion scene is relaxed and less self-conscious than in neighborhoods closer to the center.',

    Nakano:
      'The covered shopping arcade running north from the station holds a mix of vintage, used goods, and the famous Nakano Broadway complex, which is dense with anime, manga, and subculture stores across four floors. Less visited by international tourists than most Tokyo fashion neighborhoods, and the pricing reflects that.',

    Jinbocho:
      'The bookseller\'s district. Most of the stores here deal in used and rare books, but there\'s a small cluster of vintage and workwear stores that fits the neighborhood\'s overall sensibility around old things in good condition. Worth an afternoon if you\'re interested in books and browsing in equal measure.',

    Asagaya:
      'A quieter stop on the Chuo Line between Koenji and Ogikubo. The shopping streets north of the station have a laid-back, residential quality. A small vintage scene, less well-known than Koenji but with a similar general sensibility and prices that haven\'t caught up with the neighborhood\'s growing reputation.',

    Asakusa:
      'Tokyo\'s most traditional neighborhood and one of its most visited. The streets around Senso-ji are dense with souvenir shops, but the areas further out, particularly around Kappabashi and the smaller streets near the Sumida River, have some of the city\'s better craft and independent stores. Worth staying longer than most visitors do.',

    Kuramae:
      'Sitting between Asakusa and Akihabara, Kuramae has developed over the past decade into one of the more interesting neighborhoods for design and independent retail. The area around Edo-dori has a high concentration of craft studios, independent cafes, and select stores. Less crowded than Asakusa, with a quieter and more focused energy.',

    'Kiyosumi-shirakawa':
      'Better known for coffee than fashion, but the neighborhood around the station has a small cluster of interesting independent stores alongside the specialty coffee shops that put it on the map. The area has a converted-warehouse quality that suits its mix of creative studios and independent retail.',

    'Yanaka Ginza':
      'One of the few Tokyo neighborhoods where the postwar shopping street survived largely intact. The covered arcade is small and local, with food stalls, craft stores, and a few vintage spots tucked in. The surrounding streets have the feel of an older Tokyo that\'s increasingly rare to find.',

    Jiyugaoka:
      'Known for its European-influenced streets and patisseries, Jiyugaoka also has a solid collection of independent boutiques and select stores spread through the backstreets. The neighborhood has a relaxed, domestic quality that distinguishes it from Tokyo\'s more high-profile fashion districts.',

    Yutenji:
      'A quiet residential neighborhood on the Tokyu Toyoko Line between Nakameguro and Jiyugaoka. A small selection of vintage and independent stores has opened here as the area\'s profile has grown, drawing visitors who have already covered the more obvious neighborhoods on the same line.',

    Ikebukuro:
      'Tokyo\'s third major commercial hub after Shibuya and Shinjuku. The Sunshine City complex and the Seibu and Tobu department stores dominate the east and west sides respectively. A strong subculture scene exists alongside the mainstream retail, with several floors of character goods and animation merchandise that rival Nakano Broadway.',

    Akasaka:
      'A business and hotel district with a small collection of select stores scattered around the main commercial streets. Quieter on weekends when the office crowd thins out, with a handful of independent stores in the side streets worth checking if you\'re staying in the area.',

    Azabujuban:
      'A neighborhood with a strong international character, situated between Roppongi and Mita. The shopping street that runs through its center has a local, almost European feel at odds with its central Tokyo location. A small selection of independent boutiques alongside the cafes and restaurants the neighborhood is known for.',

    Roppongi:
      'Better known for its nightlife and art galleries than for fashion. The Roppongi Hills and Tokyo Midtown complexes bring international retail, and there are a few independent stores in the surrounding streets worth checking. The Mori Art Museum and National Art Center are both here.',

    Asakusabashi:
      'Primarily known as Tokyo\'s wholesale district for craft materials, beads, and dolls. A few independent and vintage stores have established themselves in the surrounding streets, alongside the craft supply shops that the neighborhood is built around. An unusual destination with a specific appeal.',

    'Setagaya City':
      'A large residential ward in western Tokyo that encompasses several distinct shopping streets and neighborhoods. Less a single destination than a collection of quieter local stores spread across a broad area, with Shimokitazawa and Sangenjaya as its best-known fashion destinations.',

    Yoyogi:
      'Sits between Harajuku and Shinjuku, anchored by the large park that occupies much of its space. The shopping streets north of the park have a neighborhood feel distinct from the intensity of its neighbors on either side, with a small selection of independent stores and cafes.',

    Hiroo:
      'A quiet, international neighborhood with a small selection of upscale independent stores and cafes serving the expat and diplomatic communities in the area. Less busy than neighboring Ebisu and Roppongi, with a relaxed pace suited to an afternoon of unhurried browsing.',

    'Meguro City':
      'A broad residential area anchored by the main Meguro station, with shopping streets extending in several directions. The area along the Meguro River toward Nakameguro has the highest concentration of independent stores, while the streets closer to the station have a more local, everyday character.',

    'Chiyoda City':
      'The administrative heart of Tokyo, home to the Imperial Palace and government ministries. The shopping around Kanda and the fringes of the ward holds some of the city\'s better used book and vintage stores, particularly along the Jinbocho book street.',

    'Ikejiri-Ohashi':
      'A quiet residential stop between Sangenjaya and Nakameguro on the Tokyu Den-en-toshi Line. A few independent stores have opened here, drawing visitors from the better-known neighborhoods nearby. Worth checking for anyone who has already covered Nakameguro and Daikanyama.',

    'Gakugei-Daigaku':
      'A student neighborhood with a local shopping street that covers everyday needs. A small vintage and used clothing scene serves the local university population, mainly useful as a stop between other destinations on the Tokyu Toyoko Line.',

    'Toritsu-Daigaku':
      'A quiet residential neighborhood with a modest local shopping street. Less visited than neighboring Jiyugaoka and Nakameguro but with a small selection of independent stores worth checking if you\'re in the area.',

    Kinshicho:
      'A commercial neighborhood east of the Sumida River with a local shopping arcade and a handful of vintage stores. More residential in character than the fashion neighborhoods on the west side of the city, with lower prices and less foot traffic from out-of-area visitors.',

    'Koto City':
      'A large waterfront ward in eastern Tokyo, encompassing areas from Kiyosumi-shirakawa down to the bay. The fashion scene is dispersed, with a handful of interesting independent stores among the more residential and industrial character of the ward.',

    Kyobashi:
      'Sits between Ginza and Tokyo station, with a mix of art galleries and corporate buildings. A small selection of stores in the surrounding streets caters to the gallery and office crowd.',

    Tsukiji:
      'Better known for the former fish market than for fashion, Tsukiji has a local character shaped by the food culture around it. A handful of independent stores exist in the surrounding streets, mainly relevant for visitors already in the area for the outer market.',

    Yurakucho:
      'An entertainment and business district south of Tokyo station, with a mix of retail under the elevated train tracks and in the surrounding office buildings. A few select stores exist here, alongside the cinemas and international press clubs the area is known for.',

    'Bunkyo City':
      'A residential and academic ward in central Tokyo, home to Tokyo University and several major hospitals. A small selection of independent stores serves the local student and academic population, with the Hongo area holding the most interesting independent retail.',

    'Edogawa City':
      'A large residential ward in eastern Tokyo, primarily suburban in character. A handful of vintage and independent stores serve the local population, mainly relevant for residents of the ward rather than visitors from further afield.',

    Kokubunji:
      'A city on the western Chuo Line with a small but dedicated vintage scene that has developed around the local student population. Less well-known than Koenji or Shimokitazawa but with similar sensibilities and lower prices.',

    Nishitokyo:
      'A suburban city in western Tokyo with a local shopping scene centered around the Tanashi and Hoya station areas. A handful of vintage and independent stores serve the local population.',

    'Ota City':
      'A large ward in southern Tokyo, primarily industrial and residential in character. The Kamata area around the station has the most interesting local shopping, with a handful of vintage stores among the everyday retail.',

    'Sumida City':
      'A ward east of the Sumida River, known for the Tokyo Skytree. A small selection of independent stores exists alongside the tourist infrastructure, with the streets around Oshiage and Kinshicho holding the most interesting retail.',

    Tachikawa:
      'A major commercial hub in western Tokyo, with a large concentration of mainstream retail around the station. A handful of independent and vintage stores exist in the surrounding streets, mainly serving the western suburbs.',

    'Taito City':
      'A central ward encompassing Ueno, Asakusa, and the streets between them. The mix of tourist areas and local neighborhoods gives it a varied character, with vintage stores and craft shops scattered throughout.',

    Takadanobaba:
      'A student neighborhood on the Yamanote Line north of Shinjuku, with a local shopping street and a small vintage scene. The large student population from Waseda University gives the area its character.',

    Waseda:
      'The university neighborhood surrounding Waseda University, with a local shopping street catering mainly to students. A handful of secondhand and vintage stores serve the student population.',

    Chofu:
      'A city on the Keio Line west of Shinjuku, with a local shopping scene centered around the station area. A small vintage and independent retail scene exists for those living on the western commuter lines.',

    Komae:
      'A small city on the Odakyu Line between Shinjuku and Odawara. A handful of local stores serve the residential population, primarily relevant for those living in the southwestern suburbs.',

    Odaiba:
      'A waterfront entertainment district on reclaimed land in Tokyo Bay, dominated by large shopping malls and exhibition spaces. Less interesting for independent or vintage retail, more relevant for large-scale commercial shopping.',

    'Tokyo Dome':
      'An entertainment complex in Bunkyo City centered around the baseball stadium, with a mall and amusement park in the surrounding area. The retail here is mainly mainstream, relevant for visitors attending events at the venue.',

    Umegaoka:
      'A quiet residential station on the Odakyu Line in Setagaya. A small selection of local stores serves the neighborhood, primarily relevant for nearby residents.',

    'Shinagawa City':
      'A ward in southern Tokyo anchored by Shinagawa station, one of the city\'s major transport hubs. The shopping is mainly mainstream and business-oriented, with a handful of independent stores in the surrounding residential streets.',
  },

  Osaka: {
    Shinsaibashi:
      'The commercial spine of Osaka, running from the upscale department stores at the Mido-suji end down to the denser, younger energy of Amerika-mura in the south. The covered Shinsaibashi-suji arcade connects it all, with side streets that hold some of the city\'s better independent stores. The variety here is hard to match anywhere else in Osaka.',

    Horie:
      'Sits just west of Shinsaibashi and operates at a calmer register. The streets are low-rise and walkable, with a mix of select boutiques, independent cafes, and design studios that attract a crowd more interested in the experience than the transaction. One of Osaka\'s better neighborhoods for an afternoon of unhurried browsing.',

    Umeda:
      'Osaka\'s main transport hub and the densest concentration of retail in the city. The department stores here — Hankyu, Hanshin, Lucua — are worth navigating for their scale and breadth. The underground shopping network connects much of it. Less interesting for independent or vintage stores, more relevant for the established end of the market.',

    Nakazakicho:
      'A small neighborhood north of Umeda where old machiya townhouses have been converted into cafes, galleries, vintage stores, and independent shops over the past two decades. One of Osaka\'s more pleasant places to walk around, with a relaxed pace that contrasts with the commercial intensity of Shinsaibashi.',

    Nakatsu:
      'Sits between Umeda and Tenjin-Bashi-suji, with a small concentration of independent stores and cafes developing in recent years. A neighborhood in transition, with the mix of old and new that comes with increasing interest from the creative and fashion communities.',

    Sakai:
      'A city in its own right south of Osaka proper, with a long history of craft and manufacturing, particularly in traditional bladed tools and textiles. A small independent retail scene exists alongside the city\'s industrial heritage.',
  },

  Nagoya: {
    Osu:
      'Nagoya\'s most interesting shopping district, built around a covered arcade system that runs through the Osu Kannon temple area. The mix here is genuinely eclectic — electronics, vintage clothing, shrine stalls, streetwear, and food vendors competing for space in a way that feels closer to a traditional market than a shopping district. One of the better arguments for spending more time in Nagoya.',

    Sakae:
      'Nagoya\'s main commercial district, anchored by the Mitsukoshi and Matsuzakaya department stores and the Oasis 21 complex. The fashion scene runs toward the established end of things, with the more interesting independent stores in the side streets away from the main boulevard.',
  },

  'Kanagawa / Yokohama': {
    Atsugi:
      'A mid-sized city in Kanagawa inland from Yokohama, with a local shopping scene centered around the station area. A handful of vintage stores serve the local population.',

    Hakone:
      'Better known as a hot spring resort destination than a fashion destination. A small selection of craft and souvenir stores exists alongside the ryokan and tourist infrastructure. Worth a visit for the mountain scenery and the Hakone Open Air Museum.',
  },

  Nagano: {
    Ueda:
      'A castle town in Nagano with a modest local shopping street and a small selection of independent stores. The city sits on the Hokuriku Shinkansen line and makes a reasonable stop if you\'re traveling between Tokyo and Kanazawa.',
  },
};
