# SHINOBI GENESIS

## End-to-End Product, Game Design, and Technical Implementation Plan

**Document type:** Implementation specification for an AI coding agent\
**Project type:** Browser-based Naruto-inspired RNG character generator
and battle simulator\
**Target deployment:** GitHub Pages (static hosting)\
**Working stack:** React, Vite, TypeScript, CSS, SVG, JSON\
**Persistence:** Browser LocalStorage, with import/export\
**Backend/API requirement:** None for the core product\
**Status:** Product and technical blueprint; do not begin implementation
until this plan has been reviewed.

------------------------------------------------------------------------

# 0. Instructions to the Coding Agent

Treat this document as the source of truth for the project. Implement
the product in small, testable phases. Do not replace specified systems
with superficial mockups, generic placeholder cards, or a single
random-number function.

## Mandatory implementation rules

1.  **Inspect the repository first.** Identify existing framework,
    package manager, scripts, routes, assets, and deployment
    configuration. Preserve working project conventions unless they
    conflict with this plan.
2.  **Do not start by generating the entire application in one pass.**
    Build the foundation, data model, RNG engine, validation, and tests
    before building all screens.
3.  **Separate game logic from presentation.** The RNG engine,
    compatibility rules, character calculations, battle simulation, and
    persistence must be independent TypeScript modules. UI components
    must not contain business rules.
4.  **No backend is required.** The core game must work as a static
    website on GitHub Pages. Do not add authentication, a database
    server, paid API, or mandatory AI service.
5.  **No runtime dependence on remote data.** Core game data must be
    bundled as local JSON/TypeScript data. The game must remain usable
    offline after the site has loaded, subject to normal browser
    caching.
6.  **Use deterministic, testable RNG.** Support a seeded random source
    so the same seed and same game-data version can reproduce the same
    generation. Do not use `Math.random()` directly throughout
    components.
7.  **A wheel is a presentation of a result, not the RNG engine.**
    Select and validate the result first; then animate the wheel to the
    selected result. Animation must never decide the result.
8.  **Validate every generated combination.** Era, village, clan,
    heritage, bloodline, dojutsu, rank, affiliation, chakra, fighting
    style, summoning, and power must obey explicit compatibility rules.
    Do not silently accept impossible combinations.
9.  **Do not confuse rarity with power.** A rare title or unusual
    heritage does not automatically make a character stronger. Power
    must come from defined abilities, attributes, training, and rules.
10. **Canon, original content, and alternate-universe content must be
    distinguishable.** Never present an invented OC clan, technique,
    event, or title as official Naruto canon.
11. **Keep the UI responsive and accessible.** Prioritize mobile browser
    usability, keyboard navigation, readable contrast, reduced-motion
    support, and clear loading/error/empty states.
12. **Avoid AI-generated filler.** Every screen, control, statistic, and
    data field must have a defined purpose. Do not add fake features or
    meaningless numbers to make the interface look complex.
13. **Write tests with each system.** Do not postpone all testing until
    the end.
14. **Do not invent content facts.** If a canon fact is uncertain, mark
    it as unverified or keep it out of the canon dataset until reviewed.
15. **Keep the project lightweight.** Avoid large animation/game-engine
    dependencies unless there is a demonstrated need. Prefer CSS and SVG
    for wheel and interface effects.

## Definition of done

A feature is not complete merely because it renders. It is complete
when: - its data schema is defined; - valid and invalid cases are
documented; - the game logic is implemented outside the UI; - tests
cover normal, boundary, and invalid cases; - the interface communicates
the result and any limitations; - it works on a GitHub Pages base
path; - it persists and restores data where relevant; - it does not
break existing features.

------------------------------------------------------------------------

# 1. Product Vision

**Shinobi Genesis** is a browser-based Naruto-universe character
creation game. Players generate a shinobi by spinning individual wheels
for identity, era, alignment, origin, heritage, abilities, personality,
combat specialization, weaknesses, destiny, and other attributes. The
final output is a coherent character dossier, not a random pile of
disconnected traits.

The game combines: - collection and discovery through RNG; -
character-building and role identity; - Naruto/Boruto lore-aware
generation; - an advanced but understandable power system; - lightweight
1v1 battle simulation; - saving, comparing, and collecting generated
characters.

The experience should feel like a polished character-creation game with
a premium hybrid visual language: Naruto-inspired atmosphere, modern
web-app clarity, strong typography, layered panels, restrained effects,
and purposeful animation.

## Product principles

1.  **Coherent randomness:** unexpected combinations are welcome;
    contradictions are not.
2.  **Player agency:** individual rerolls and full rerolls let players
    shape a character without removing the RNG identity.
3.  **Readable depth:** advanced mechanics must be understandable
    through labels, explanations, and tooltips.
4.  **Lore awareness:** timeline and heritage rules should prevent
    obvious contradictions.
5.  **Distinct character identity:** personality, title, alignment,
    fate, and weakness should influence the dossier and narrative, not
    only decorate it.
6.  **Gameplay relevance:** battle stats and abilities must have
    explainable effects.
7.  **Static-first:** no account or server is necessary to create, save,
    or battle characters locally.

------------------------------------------------------------------------

# 2. Scope and Boundaries

## 2.1 Core release (MVP)

The first complete playable release must include:

-   Home/dashboard.
-   Character Generator with individual attribute spins.
-   Instant random name generation (no wheel animation for names),
    manual name entry, and regenerate.
-   Era Spin.
-   Alignment Spin.
-   Title Spin with exactly 100 initial title entries.
-   Village/Origin Spin.
-   Clan Spin.
-   Heritage/Bloodline Status Spin.
-   Bloodline Trait / Inherited Ability generation.
-   Dojutsu Spin.
-   Chakra Nature Spin.
-   Fighting Style Spin.
-   Rank / Power Tier Spin.
-   Affiliation Spin.
-   Summoning Spin.
-   Personality Spin.
-   Weakness Spin.
-   Fate Spin.
-   Reputation generation.
-   Final Character Reveal and complete character dossier.
-   Individual reroll and full reroll.
-   Collection: save, rename, delete, inspect, compare.
-   LocalStorage persistence.
-   JSON export/import for saved characters.
-   Basic 1v1 battle simulation using generated combat data.
-   Settings for animation, reduced motion, sound toggle (sound may be
    deferred), and data reset.
-   Mobile-first responsive layouts for phones, tablets, and desktop.
-   Unit tests for RNG, compatibility, character generation, and battle
    calculations.

## 2.2 Deferred features

Do not implement these before the MVP is stable:

-   Multiplayer or online accounts.
-   Cloud saves and cross-device synchronization.
-   Real-time PvP.
-   Live AI-generated stories or dialogue.
-   Paid APIs or mandatory external services.
-   Full open-world exploration.
-   Complex campaign mode with branching quests.
-   Large-scale team battles.
-   User-created public marketplace or sharing network.
-   Full manga panel or anime footage integration.
-   Advanced character editor that can freely override every generated
    field.
-   Live canon database synchronization.

These can be considered later, but they must not complicate the static
MVP.

## 2.3 Limited custom content

Custom content is allowed but constrained: - Players may enter a
character name. - Players may create or edit a small set of allowed
descriptive fields where supported. - OC (original character) data may
exist in the bundled dataset. - Custom content must be labeled `OC` or
`custom`. - Players must not be able to create arbitrary combinations
that bypass compatibility validation in the standard generator. - A
future advanced editor may offer an explicit "Alternative Universe /
Unrestricted" mode, clearly separated from lore-valid generation.

------------------------------------------------------------------------

# 3. Target Users and Main Use Cases

## Main users

-   Naruto and Boruto fans who enjoy random character creation.
-   Players who like collecting unusual character combinations.
-   Users who want to compare generated shinobi in simulated battles.
-   Users who create OCs and want a structured starting point.

## Primary user journeys

### Journey A: Generate a character

1.  Open Generator.
2.  Choose default or custom generation settings.
3.  Enter a name or use instant random name.
4.  Spin attributes individually or use "Generate All".
5.  Watch each wheel reveal its preselected result.
6.  Review warnings, compatibility notes, and generated stats.
7.  Reveal the final dossier.
8.  Save the character to Collection.

### Journey B: Reroll one result

1.  Open a generated character.
2.  Select a field such as Title, Personality, or Weakness.
3.  Press Reroll.
4.  The engine selects a new compatible result.
5.  Dependent fields are revalidated.
6.  The UI explains if another field had to be recalculated.
7.  Save or discard the revision.

### Journey C: Compare and battle

1.  Select two saved characters.
2.  Open Arena.
3.  Review both character summaries.
4.  Run a deterministic or seeded battle simulation.
5.  See winner, battle log, decisive factors, and matchup explanation.
6.  Run a rematch with a new seed if desired.

### Journey D: Save and move data

1.  Save characters locally.
2.  Export collection to JSON.
3.  Import the JSON on another browser/device.
4.  Validate imported schema and data version before accepting it.

------------------------------------------------------------------------

# 4. Information Architecture and Navigation

Main navigation: 1. **Home** -- overview, recent characters, quick
actions. 2. **Generator** -- all spins and generation controls. 3.
**Character Profile** -- full dossier for one character. 4. **Arena** --
1v1 matchup and battle results. 5. **Collection** -- saved characters,
filters, sorting, compare. 6. **Settings** -- preferences, data
management, credits/about.

## Page responsibilities

### Home

-   Short project introduction.
-   "Create Character" primary action.
-   Recent saved characters.
-   Collection count.
-   Quick links to Generator and Arena.
-   No fake live statistics.

### Generator

-   Clear sequence of spin categories.
-   Each spin has a label, concise explanation, current result,
    rarity/weight where useful, and reroll control.
-   Group related spins into collapsible sections.
-   Provide `Generate All`, `Reveal Character`, `Reset Draft`, and
    `Save`.
-   Show compatibility warnings near the affected field.
-   Avoid placing every possible spin in one overwhelming unstructured
    column.

### Character Profile

Organize information into: - Identity. - Era and history. - Alignment
and motivation. - Origin and affiliation. - Clan and heritage. -
Abilities and chakra. - Fighting style. - Personality. - Weaknesses. -
Title and reputation. - Fate and narrative hooks. - Combat attributes. -
Compatibility / canon status.

### Arena

-   Select two characters from Collection.
-   Display combat-relevant stats and abilities.
-   Start battle, rematch, and inspect battle log.
-   Explain the result without claiming that a simulation is an official
    canon power ranking.

### Collection

-   Search by name.
-   Filter by era, alignment, village, clan, rank, and rarity.
-   Sort by creation date, name, or combat rating.
-   Multi-select for comparison.
-   Delete requires confirmation.
-   Export/import collection.

### Settings

-   Animation intensity and reduced-motion option.
-   Theme preference if more than one theme is implemented.
-   Data export/import.
-   Clear local data with confirmation.
-   App version and dataset version.

------------------------------------------------------------------------

# 5. Complete Spin Catalogue

All spins must be data-driven. A spin definition includes its ID,
display name, description, options, weights, eligibility rules,
dependencies, and whether it affects combat.

## 5.1 Name Generation (not a wheel)

-   Allow manual name entry.
-   Provide an instant random name button.
-   Random name appears immediately; do not animate a wheel for the
    name.
-   Provide regenerate.
-   Name generator must use curated name pools and avoid presenting a
    generated name as a canon character unless it exactly references a
    canon entity.
-   Store `nameSource: manual | generated`.

## 5.2 Era Spin

Initial era options: 1. Ancient Era. 2. Sage of Six Paths Era. 3.
Warring States Era. 4. Hidden Village Founding Era. 5. First Shinobi
World War. 6. Second Shinobi World War. 7. Third Shinobi World War. 8.
Pre-Naruto Era. 9. Naruto Part I Era. 10. Shippuden Era. 11. Fourth
Shinobi World War. 12. Blank Period. 13. The Last Era. 14. Boruto Era.
15. Two Blue Vortex Era.

Rules: - Each era has a chronological start/end or a defined relative
period where exact dates are uncertain. - Era affects which canon
people, organizations, technology, and historical events can be
available. - Do not infer exact birth/death dates when the source is
uncertain. - An OC may be placed in any era if its attributes are
compatible. - A canon character's timeline must be validated against
known appearances and life status. - If the user intentionally enables
unrestricted AU mode, timeline restrictions may be relaxed and the
character must be marked AU.

## 5.3 Alignment Spin

Six options: - Hero. - Villain. - Anti-Hero. - Anti-Villain. -
Neutral. - Chaotic.

Each alignment must define: - core motivation; - moral approach; -
typical goals; - relationship to authority and villages; - possible
narrative conflicts; - whether alignment is fixed at generation or can
evolve through story progression.

Alignment is not a combat stat and must not directly grant arbitrary
power. It may influence narrative hooks, reputation, affiliations, and
relationship descriptions.

## 5.4 Title Spin --- exactly 100 initial titles

Store these 100 entries as individual data records. Do not silently
change spelling or count. Titles are flavor/identity labels by default
and do not automatically add power.

### Legendary

1.  The Unforgotten
2.  The Last Shinobi
3.  The Eternal Shadow
4.  The Crimson Sovereign
5.  The Godless Warrior
6.  The Silent Calamity
7.  The Immortal Wanderer
8.  The Forgotten Legend
9.  The World's Last Hope
10. The Unrivaled One

### Dark

11. The Demon of Destruction
12. The Blood Moon
13. The Black Reaper
14. The Hollow King
15. The Death Bringer
16. The Forsaken Soul
17. The Shadow of Ruin
18. The Crimson Nightmare
19. The King of Ashes
20. The Sinful Saint

### Combat

21. The Unbroken Fist
22. The Battlefield Tyrant
23. The Iron Phantom
24. The Storm Reaper
25. The Blade of Silence
26. The Thousandfold Slayer
27. The Warborn Beast
28. The Relentless Fang
29. The Last Executioner
30. The Crimson Blade

### Intelligence and Strategy

31. The Grand Strategist
32. The Shadow Tactician
33. The Thousand-Move Master
34. The Silent Architect
35. The Mind Behind Chaos
36. The Unseen Puppeteer
37. The Master of Deception
38. The Forbidden Scholar
39. The Perfect Calculator
40. The Keeper of Secrets

### Chakra and Elements

41. The Storm Sovereign
42. The Flame Emperor
43. The Frozen Monarch
44. The Thunder Saint
45. The Void Walker
46. The Ocean's Wrath
47. The Celestial Flame
48. The Earthshaker
49. The Wind Requiem
50. The Chakra Devourer

### Dojutsu and Mysticism

51. The Crimson-Eyed One
52. The Celestial Observer
53. The Eye of Eternity
54. The Moonlit Seer
55. The Beyond-Sighted
56. The Divine Witness
57. The Keeper of the Void
58. The Thousand-Eyed Phantom
59. The Astral Sovereign
60. The One Who Sees All

### Leadership and Politics

61. The Fallen Kage
62. The Nameless Daimyo
63. The Shadow Regent
64. The Crownless King
65. The People's Guardian
66. The Last Commander
67. The Iron Chancellor
68. The Hidden Sovereign
69. The Rebel Lord
70. The Uncrowned Emperor

### Nature and Beasts

71. The Ninefold Wanderer
72. The Tailed Beast's Wrath
73. The Serpent King
74. The Wolf of the Hidden Mist
75. The White Fox
76. The Dragon's Heir
77. The Crow's Omen
78. The Beast Unchained
79. The Sage of the Wild
80. The Predator of Shadows

### Tragic and Mysterious

81. The Child Without a Home
82. The Last of His Bloodline
83. The Broken Halo
84. The Nameless Ghost
85. The Boy Who Lost Tomorrow
86. The Forgotten Prodigy
87. The One Who Defied Fate
88. The Heir of Ruins
89. The Lonely Star
90. The Burdened Savior

### Unique

91. The Anomaly
92. The World's Error
93. The Unwritten Fate
94. The Paradox
95. The Living Catastrophe
96. The Walking Forbidden Technique
97. The Impossible Shinobi
98. The Boundary Breaker
99. The One Beyond Limits
100. The Final Variable

Title rules: - Each entry has a stable ID, category, optional rarity,
description, and optional eligibility tags. - Rarity labels: Common,
Rare, Epic, Legendary, Mythic. These are presentation/collection
classifications, not automatic combat multipliers. - Some titles may be
contextually weighted by alignment, combat style, era, or story traits,
but all weights must be explicit and tested. - A title may be rerolled
independently. - Keep title history if the player chooses to preserve
previous rolls. - Do not assign a title that asserts a canon achievement
the generated character has not earned. For example, a title implying
Kage status should be treated as a descriptive epithet or require an
appropriate rank/history.

## 5.5 Village / Origin Spin

Include the five great hidden villages: - Konohagakure. - Sunagakure. -
Kirigakure. - Kumogakure. - Iwagakure.

Also include other established settlements/regions where the dataset can
support them, such as Amegakure, Otogakure, Takigakure, Kusagakure,
Uzushiogakure (historical), and independent regions.

Rules: - Separate `birthplace`, `raisedIn`, and `currentAffiliation`;
they are not necessarily the same. - Era determines whether a village
exists in its known form. - Do not assume every character born in a
village remains loyal to it. - OC settlements must be labeled custom/OC.

## 5.6 Clan Spin

Include established clans where supported by the lore dataset, such
as: - Uzumaki. - Uchiha. - Senju. - Hyuga. - Nara. - Akimichi. -
Yamanaka. - Aburame. - Inuzuka. - Sarutobi. - Hatake. - Kaguya. -
Hozuki. - Yuki. - Other verified canon clans.

Rules: - Clan and village are separate attributes. - Clan availability
is era-aware. - Clan membership does not automatically grant every known
clan technique. - Clanless / unknown lineage must be valid outcomes. -
OC clan entries must be explicitly labeled OC.

## 5.7 Heritage / Bloodline Status Spin (NEW --- REQUIRED)

This spin describes the character's ancestry and inherited legacy. It is
distinct from the Clan Spin and the Bloodline Trait Spin.

Initial status categories: - Pure Clan Lineage --- known descent within
one clan line. - Mixed Clan Heritage --- ancestry from two or more
clans. - Distant Clan Descendant --- remote ancestry with uncertain or
diluted inheritance. - Hidden / Concealed Lineage --- ancestry
intentionally hidden or unknown to the character. - Lost Bloodline --- a
lineage with very few or no known surviving members. - Adopted /
Non-Biological Heir --- raised within a clan or family without
biological descent. - Civilian / Non-Clan Heritage --- no known shinobi
clan lineage. - Noble Family Heritage --- ancestry from a recognized
political or noble family. - Ancient / Mythic Ancestry --- exceptional
ancient lineage; must be rare and lore-validated. - Artificially Altered
Heritage --- lineage altered through a documented experiment or
fictional procedure; use sparingly and do not make this a default
option. - Unknown Heritage --- no reliable information. - OC Heritage
--- original lineage, explicitly labeled custom.

Rules: - Heritage status does not automatically grant a Kekkei Genkai,
Dojutsu, or high power. - Mixed heritage does not mean the character
receives every ability from every ancestor. - Adopted status affects
family identity and narrative, not biological inheritance. -
Artificially altered status requires a specific data-backed origin
explanation. - Ancient/mythic ancestry must have strict eligibility and
low weighting; do not use it as a shortcut to god-tier power. - Heritage
must be consistent with the selected clan, family, era, and bloodline
traits. - Support `heritageConfidence`: confirmed, probable, rumored,
unknown. - Support `heritageNotes` for short explanations.

## 5.8 Bloodline Trait / Inherited Ability Spin

This is separate from Heritage Status: - Heritage answers "what is the
character's ancestry/status?" - Bloodline Trait answers "what inherited
ability or genetic trait, if any, does the character actually express?"

Possible outcomes: - No inherited special ability. - Dormant inherited
trait. - Clan technique affinity (not necessarily a Kekkei Genkai). -
Verified Kekkei Genkai. - Verified Kekkei Tota where lore supports it. -
Dojutsu inheritance, subject to separate Dojutsu validation. - OC
inherited ability, explicitly labeled OC. - Artificially acquired trait,
clearly distinguished from natural inheritance.

Rules: - Do not grant every member of a clan every rare ability. - A
bloodline trait may be absent, dormant, awakened, or mastered. -
Separate inherited potential from current mastery. - Avoid treating
learned techniques as genetic traits. - Validate canon and OC traits
separately.

## 5.9 Dojutsu Spin

Possible outcomes include: - None. - Byakugan. - Sharingan stages where
appropriate. - Mangekyo Sharingan, with awakening requirements and
limits. - Rinnegan, only under strict lore/eligibility rules. -
Tenseigan, only under strict lore/eligibility rules. - Other verified
eye abilities supported by the curated dataset. - OC Dojutsu, clearly
labeled.

Rules: - Dojutsu must be compatible with heritage, timeline, and source
rules. - Do not automatically grant advanced stages. - Eye stage,
mastery, stamina cost, and limitations must be separate fields. - If a
character is ineligible, reroll or produce a valid lower-tier/none
result; do not silently override constraints.

## 5.10 Chakra Nature Spin

Support: - Fire Release. - Wind Release. - Lightning Release. - Earth
Release. - Water Release. - Yin Release. - Yang Release. - Yin--Yang
Release only when justified by strict rules. - Combined nature
transformations where supported by verified lore. - OC nature
transformation, labeled OC.

Rules: - Distinguish basic chakra affinity from learned proficiency. - A
character can have primary and secondary natures. - Do not assume all
characters can use all five basic elements. - Combined releases require
explicit prerequisite traits and validation. - Chakra nature is not a
direct substitute for combat skill.

## 5.11 Fighting Style Spin (NEW --- REQUIRED)

This spin determines how the character approaches combat. It must affect
combat calculations and battle narration.

Core styles: - Taijutsu Specialist. - Ninjutsu Specialist. - Genjutsu
Specialist. - Kenjutsu Specialist. - Bukijutsu / Weapon Specialist. -
Fūinjutsu Specialist. - Medical Ninjutsu Specialist. - Puppetry
Specialist. - Sensor / Tracking Specialist. - Barrier / Defensive
Specialist. - Tactical / Support Specialist. - Balanced Shinobi. -
Hybrid Specialist (two or more compatible disciplines). - Unorthodox /
Improvised Fighter. - OC Fighting Style.

Rules: - Allow one primary style and optionally one secondary style. - A
hybrid style must define how the disciplines interact; do not simply add
all bonuses. - Style describes training and approach, not automatic rank
or power. - Character abilities must support the selected style. - Some
styles require equipment, training, or techniques; mark these
requirements. - Combat logic must use style as a modifier to action
preferences, matchup strengths, and technique selection. - Do not make
one style universally superior.

## 5.12 Rank / Power Tier Spin

Use two distinct concepts: - **Shinobi rank/status:** Academy Student,
Genin, Chunin, Jonin, Tokubetsu Jonin, ANBU (role/organization rather
than a universal rank), Kage, missing-nin, civilian, etc. - **Combat
tier:** a game-specific estimate based on stats, abilities, mastery, and
feats.

Do not combine them into one misleading scale. A character's political
position or formal rank does not necessarily equal combat strength.

Suggested combat tiers: - Tier 1: Academy / beginner. - Tier 2:
Genin-level. - Tier 3: Chunin-level. - Tier 4: Jonin-level. - Tier 5:
Elite / Kage-level. - Tier 6: Legendary. - Tier 7: Six Paths /
exceptional mythic tier.

These are game categories, not official universal canon rankings.
Explain this in the UI.

## 5.13 Affiliation Spin

Possible affiliations: - Hidden village forces. - ANBU. - Akatsuki. -
Seven Ninja Swordsmen of the Mist. - Allied Shinobi Forces. -
Independent shinobi. - Missing-nin. - Clan militia / family faction. -
Research or medical division. - OC organization.

Rules: - Affiliation must be era-aware. - A character may have past and
current affiliations. - Alignment and affiliation are related but not
identical. A villain may serve a village; a hero may be a missing-nin. -
Canon organizations must only be assigned where timeline and membership
make sense.

## 5.14 Summoning Spin

Possible outcomes: - None. - Toad. - Snake. - Slug. - Monkey. - Dog /
ninken. - Hawk / bird. - Other verified animal contracts. - OC summon
contract.

Rules: - Summoning contract is not automatically mastered. - Store
contract type, relationship, summoning proficiency, and any special
limitations. - Do not assign an established character's unique contract
to an OC as a canon fact. - OC contracts must be labeled.

## 5.15 Personality Spin (NEW --- REQUIRED)

Personality must be multi-dimensional rather than one adjective.
Generate a compact profile with: - Primary trait. - Secondary trait. -
Social tendency. - Decision-making tendency. - Emotional control. - Core
motivation or fear (can connect to Alignment/Fate).

Suggested trait pool (curated, combinable, and balanced): - Calm. -
Analytical. - Compassionate. - Ambitious. - Proud. - Humble. -
Reserved. - Charismatic. - Stoic. - Impulsive. - Reckless. - Cautious. -
Curious. - Suspicious. - Loyal. - Independent. - Protective. -
Vengeful. - Idealistic. - Cynical. - Disciplined. - Playful. -
Sarcastic. - Patient. - Stubborn. - Adaptable. - Manipulative. -
Honest. - Secretive. - Competitive. - Fearful. - Courageous. -
Self-sacrificing. - Detached. - Empathetic. - Arrogant. - Insecure. -
Optimistic. - Pessimistic. - Perfectionist.

Rules: - Avoid contradictory combinations unless the profile explains
the tension (for example, "reserved but fiercely protective"). -
Personality must not be a moral alignment. A compassionate person can be
a villain; a cold person can be a hero. - Personality can influence
battle decision tendencies and narrative text, but should not grant
arbitrary stat bonuses. - Provide short explanations so traits are
understandable. - Store personality as structured fields, not one long
generated sentence.

## 5.16 Weakness Spin (NEW --- REQUIRED)

Weaknesses make characters distinct and prevent overpowered
combinations. Generate one primary weakness and optionally a secondary
weakness.

Weakness categories: - Physical limitation (low endurance, reduced
mobility, etc.). - Chakra limitation (low reserves, inefficient control,
high technique cost). - Mental limitation (poor focus under pressure,
tunnel vision). - Emotional vulnerability (anger, guilt, attachment,
fear). - Tactical weakness (predictable patterns, poor adaptability). -
Environmental weakness (specific terrain or conditions). - Technique
limitation (setup time, range restriction, recoil, cooldown). - Sensory
limitation (limited detection or vulnerability to deception). - Social /
narrative weakness (trust issues, duty conflict, reputation). -
Heritage-related limitation (only where supported by the character's
actual trait). - OC-specific weakness.

Rules: - Weakness must be meaningful and actionable in battle or
narrative. - Avoid random debilitating conditions that do not fit the
character. - A weakness must have a description, trigger/condition, and
gameplay effect if it affects combat. - Do not make weaknesses merely
cosmetic. - Do not assign a weakness that directly contradicts a
verified ability without explanation. - Stronger builds may have more
consequential limitations, but do not use a simplistic "powerful equals
severe weakness" formula. - Weakness can be rerolled independently, but
dependent abilities must be checked. - A weakness should create
counterplay, not make the character unusable.

## 5.17 Fate Spin

Suggested fate hooks: - The Chosen One. - Cursed Destiny. - The
Forgotten Heir. - Last Survivor. - A Fate Yet Unwritten. - Destined for
Greatness. - The Unwanted Child. - The Reincarnated Soul. - The World's
Greatest Threat. - The One Who Defied Fate. - The Reluctant Successor. -
The Guardian of a Lost Legacy. - The Name Erased from History. - The One
Who Must Choose. - The Survivor of a Broken Era.

Fate is narrative metadata, not a guaranteed prophecy or stat
multiplier. Some results should be rare and era/heritage-aware.

## 5.18 Reputation

Generate reputation from alignment, deeds/history fields, village,
affiliation, title, and narrative events. Do not infer reputation from
alignment alone.

Possible labels: - Unknown. - Respected. - Feared. - Admired. -
Disgraced. - Wanted. - Misunderstood. - Legendary. - Controversial.

Reputation can vary by region or faction in a future expansion.

------------------------------------------------------------------------

# 6. RNG, Rarity, and Reroll Design

## 6.1 Weighted RNG

Each option may have a weight. Weight is not a promise of exact
probability unless the eligible option pool is unchanged.

The selection process: 1. Receive spin ID and current character draft.
2. Load eligible options. 3. Apply hard constraints. 4. Apply contextual
weights. 5. Normalize weights. 6. Select using the injected seeded
random source. 7. Return result plus explanation and metadata. 8. Store
seed and data version for reproducibility.

Do not apply hidden weight multipliers without documenting them.

## 6.2 Rarity

Suggested labels: - Common. - Uncommon. - Rare. - Epic. - Legendary. -
Mythic.

Rarity should describe how unusual an option is in the game dataset. It
must not automatically mean stronger. A rare personality or title may
have no combat advantage.

## 6.3 Individual reroll

-   Each spin has its own reroll action.
-   Reroll must exclude the current result when at least one alternative
    eligible result exists.
-   If no alternative exists, explain why and disable the reroll.
-   Rerolling a parent field must revalidate dependent fields.
-   If dependent results become invalid, either preserve them with an
    explicit warning when possible or reroll only the invalid dependent
    fields. Explain the chosen behavior.
-   Never silently erase a player's manual name.

## 6.4 Full reroll

-   Recreate all RNG-controlled fields.
-   Preserve manual name unless the player explicitly chooses to reroll
    the name.
-   Preserve user settings.
-   Show confirmation if the current draft has unsaved edits.
-   Generate all results from one seed and store the seed.

## 6.5 Spin order and dependency graph

Recommended generation order: 1. Era. 2. Name. 3. Alignment. 4.
Birthplace / Village / Origin. 5. Clan. 6. Heritage Status. 7. Bloodline
Trait. 8. Dojutsu. 9. Chakra Nature. 10. Affiliation. 11. Fighting
Style. 12. Summoning. 13. Shinobi Rank. 14. Combat Tier calculation. 15.
Personality. 16. Weakness. 17. Fate. 18. Title. 19. Reputation. 20.
Final derived stats and dossier.

The order is a default dependency order, not a forced animation order.
The player can still reroll a field individually.

## 6.6 Dependency validation

Create a rule engine with explicit rule types: - `requires`: an option
requires another trait. - `excludes`: two options cannot coexist in
strict mode. - `eraRange`: option is only available in an era range. -
`originRange`: option is restricted by origin. - `heritageMatch`: option
needs a compatible heritage. - `masteryGate`: advanced ability requires
mastery/awakening conditions. - `customOnly`: option only exists in
OC/AU mode. - `warningOnly`: combination is unusual but not invalid.

The validator must return structured messages: - error:
impossible/blocked; - warning: unusual or uncertain; - info: explanatory
note.

Provide a "Why this result?" explanation for important constrained
outcomes.

------------------------------------------------------------------------

# 7. Character Statistics and Power System

Use clear, normalized attributes. Avoid dozens of decorative stats.

Suggested core attributes (0--100): - Ninjutsu. - Taijutsu. -
Genjutsu. - Kenjutsu / Bukijutsu. - Chakra Control. - Chakra Reserves. -
Speed. - Strength. - Durability. - Intelligence / Tactics. -
Perception. - Stamina.

Also store: - mastery level for each relevant ability; - known
techniques; - technique cost; - range; - setup time; - limitations; -
combat role; - primary and secondary fighting style.

## Stat generation

Stats should derive from: - rank and experience; - training and
specialization; - actual abilities; - heritage only where it provides a
defined advantage; - personality only where a defined tactical effect is
justified; - weaknesses and limitations.

Do not let rarity directly inflate all stats. Do not assign maximum
values merely because a character has a rare Dojutsu.

## Combat rating

Create a transparent combat rating derived from relevant stats and
abilities. Show a short breakdown of what contributes to it. Do not
treat it as an objective canon ranking.

## Power consistency

-   Strong abilities need explicit costs, limits, counters, or mastery
    requirements.
-   A character may have high potential but low current mastery.
-   A character can be strategically dangerous without having the
    highest raw stats.
-   Distinguish `potential`, `currentPower`, and `mastery`.
-   Avoid stacking multiple top-tier abilities without strict
    eligibility and balancing.

------------------------------------------------------------------------

# 8. Battle Arena --- MVP 1v1

The Arena is a lightweight turn-based simulation, not a real-time action
game.

## Battle loop

1.  Validate both character builds.
2.  Create battle state from the two character snapshots and a battle
    seed.
3.  Determine initiative using speed/perception and a controlled random
    factor.
4.  Select an action based on fighting style, available techniques,
    current resources, personality tendencies, and tactical state.
5.  Check range, costs, hit/avoid/defense, status effects, and weakness
    interactions.
6.  Apply damage/effects.
7.  Record a readable battle-log event.
8.  Continue until a win condition or turn limit.
9.  Produce result summary and explanation.

## Action types

-   Basic attack.
-   Specialized attack.
-   Defensive action.
-   Evasion.
-   Setup / charge.
-   Genjutsu or disruption.
-   Support / recovery where valid.
-   Summoning action where available.

## Battle rules

-   Use deterministic seeded simulation for reproducibility.
-   Do not decide the winner solely from combat rating.
-   Fighting style must influence action choice and matchup.
-   Weaknesses must create real counterplay.
-   Chakra and stamina must be managed.
-   Strong techniques must have meaningful costs and limitations.
-   Provide a maximum turn count to prevent infinite battles.
-   If the result is close, explain the decisive factors.
-   Clearly label the result as a game simulation, not canon fact.

## Battle log

Each event should contain: - turn number; - actor; - action; - target; -
result; - resource cost; - damage/effect; - concise explanation.

------------------------------------------------------------------------

# 9. Character Dossier Data Model

Use versioned, strongly typed data. Suggested top-level shape:

``` ts
type Character = {
  id: string;
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
  generationSeed: string;
  datasetVersion: string;
  name: string;
  nameSource: "manual" | "generated";
  canonStatus: "canon" | "oc" | "au" | "unverified";
  era: SpinResult;
  alignment: SpinResult;
  title: SpinResult;
  origin: OriginData;
  clan: SpinResult;
  heritage: HeritageData;
  bloodline: BloodlineData;
  dojutsu: DojutsuData;
  chakra: ChakraData;
  affiliation: AffiliationData[];
  fightingStyle: FightingStyleData;
  summoning: SummoningData;
  rank: RankData;
  personality: PersonalityData;
  weaknesses: WeaknessData[];
  fate: SpinResult;
  reputation: ReputationData;
  abilities: Ability[];
  stats: CharacterStats;
  combatRating: CombatRating;
  validation: ValidationReport;
  history: CharacterHistoryEntry[];
};
```

This is a conceptual schema. Refine types during implementation, but
preserve the separation of concerns.

## Data modeling requirements

-   Every spin result has stable `optionId`, `label`, `category`,
    `rarity`, and `sourceStatus`.
-   Avoid using display labels as IDs.
-   Keep `canonStatus` separate from `sourceStatus`.
-   Store the seed, dataset version, and schema version.
-   Store structured personality and weakness fields.
-   Keep current affiliation separate from past affiliation.
-   Keep heritage status separate from actual expressed bloodline
    abilities.
-   Keep formal rank separate from combat tier.
-   Keep potential separate from mastery and current power.
-   Store validation warnings so the profile can explain unusual
    results.

## Example supporting types

``` ts
type SpinResult = {
  spinId: string;
  optionId: string;
  label: string;
  rarity: Rarity;
  sourceStatus: "canon" | "oc" | "game-original" | "unverified";
  explanation?: string;
};

type HeritageData = {
  status: string;
  confidence: "confirmed" | "probable" | "rumored" | "unknown";
  ancestryIds: string[];
  notes: string;
};

type PersonalityData = {
  primaryTrait: string;
  secondaryTraits: string[];
  socialTendency: string;
  decisionStyle: string;
  emotionalControl: string;
  motivation: string;
  fearOrConflict?: string;
};

type WeaknessData = {
  id: string;
  category: string;
  label: string;
  description: string;
  trigger?: string;
  gameplayEffect?: string;
  severity: "minor" | "moderate" | "major";
};
```

------------------------------------------------------------------------

# 10. Data Architecture

Keep data separate from code.

Suggested data folders: - `src/data/eras.json` -
`src/data/titles.json` - `src/data/alignments.json` -
`src/data/villages.json` - `src/data/clans.json` -
`src/data/heritage-statuses.json` - `src/data/bloodline-traits.json` -
`src/data/dojutsu.json` - `src/data/chakra-natures.json` -
`src/data/fighting-styles.json` - `src/data/personalities.json` -
`src/data/weaknesses.json` - `src/data/affiliations.json` -
`src/data/summonings.json` - `src/data/ranks.json` -
`src/data/fates.json` - `src/data/reputations.json` -
`src/data/abilities.json` - `src/data/compatibility-rules.json`

Each data record should support: - stable ID; - display label; -
description; - rarity/weight; - tags; - source status; - era
eligibility; - prerequisites; - exclusions; - combat effect, if any; -
narrative effect, if any.

Do not store the same compatibility rule in multiple files. Prefer a
single rule registry or clearly defined rule modules.

------------------------------------------------------------------------

# 11. Technical Architecture

## Stack

-   React.
-   Vite.
-   TypeScript with strict mode.
-   CSS Modules or a consistent component styling approach.
-   SVG/CSS for wheel graphics.
-   JSON for curated game data.
-   Vitest for unit tests.
-   Playwright for core browser journeys if practical.
-   GitHub Pages for static deployment.

Do not add a heavy game engine for the MVP.

## Suggested project structure

``` text
/
├── public/
│   ├── favicon/
│   └── assets/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   └── providers/
│   ├── components/
│   │   ├── layout/
│   │   ├── wheel/
│   │   ├── character/
│   │   ├── cards/
│   │   ├── feedback/
│   │   └── common/
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── GeneratorPage.tsx
│   │   ├── CharacterPage.tsx
│   │   ├── ArenaPage.tsx
│   │   ├── CollectionPage.tsx
│   │   └── SettingsPage.tsx
│   ├── features/
│   │   ├── generation/
│   │   ├── validation/
│   │   ├── character/
│   │   ├── battle/
│   │   ├── collection/
│   │   └── settings/
│   ├── engine/
│   │   ├── rng/
│   │   ├── rules/
│   │   ├── stats/
│   │   └── battle/
│   ├── data/
│   ├── hooks/
│   ├── lib/
│   ├── styles/
│   ├── types/
│   └── test/
├── PLAN.md
├── README.md
├── package.json
├── vite.config.ts
└── tsconfig.json
```

Adapt the structure to the existing repository rather than blindly
duplicating it.

## Module contracts

### RNG module

Input: - eligible options; - weights; - seed/random source; - current
draft context.

Output: - selected option; - normalized probability metadata where
useful; - seed/state metadata; - explanation.

Must not import React or UI components.

### Validation module

Input: - partial or complete character; - rule registry; - mode
(`strict` or `au`).

Output: - `valid` boolean; - errors; - warnings; - informational
messages; - invalid field IDs; - suggested resolution actions.

Must be deterministic and side-effect free.

### Generation module

Input: - generation settings; - seed; - optional existing draft.

Output: - complete or partial character draft; - generation history; -
validation report.

Must use the RNG and validation modules, not duplicate their logic.

### Stats module

Input: - abilities; - rank; - mastery; - fighting style; - weaknesses; -
training/experience.

Output: - normalized stats; - potential; - current power; - combat
rating with explanation.

### Battle module

Input: - two validated character snapshots; - battle seed; - battle
configuration.

Output: - winner/draw; - event log; - remaining resources; - summary; -
decisive factors.

Must not import React.

### Persistence module

Responsibilities: - save/load collection; - migrate old schema
versions; - validate imported JSON; - export data; - handle quota or
corrupted-data errors gracefully.

------------------------------------------------------------------------

# 12. Wheel and Interaction Design

## Wheel behavior

-   The engine selects the result before animation begins.
-   The wheel animates to the selected segment.
-   The same seed should produce the same selected result even if
    animation duration changes.
-   Respect reduced-motion settings.
-   Provide a non-animated reveal mode.
-   Show the result clearly after the animation.
-   Prevent double-spins while a spin is in progress.
-   Do not make the wheel animation excessively long.

## Spin card content

Each spin card should show: - spin title; - one-line description; -
current result or "Not rolled" state; - rarity label if applicable; -
Spin/Reroll button; - "Why this result?" details where useful; -
compatibility indicator.

## Generator layout

Group the spins: 1. Identity & Timeline. 2. Origin & Heritage. 3. Powers
& Abilities. 4. Combat Profile. 5. Personality & Weakness. 6. Destiny &
Reputation.

Use a hybrid layout: visually rich wheel/result panels combined with
compact data panels. On mobile, stack sections and keep the primary
action easy to reach.

## Final reveal

The final reveal should present: - character name; - title; - era; -
alignment; - village/origin; - clan and heritage; - signature
abilities; - fighting style; - personality summary; - weakness; - rank
and combat tier; - combat rating; - canon/OC/AU status; - validation
notes.

The reveal must not hide warnings or present uncertain canon details as
fact.

------------------------------------------------------------------------

# 13. Visual Design Direction

## Desired visual character

-   Premium, polished, Naruto-inspired interface.
-   Hybrid between an immersive game dashboard and a clean modern web
    application.
-   Strong hierarchy and carefully controlled density.
-   Dark-first visual direction is acceptable, with restrained accent
    colors inspired by chakra/element themes.
-   Use texture, subtle gradients, borders, and depth sparingly.
-   Wheel results should be the visual focus during spinning.
-   Character dossiers should prioritize readability over decorative
    effects.

## Avoid

-   Generic AI-generated dashboard appearance.
-   Excessive neon glow on every component.
-   Random gradients without meaning.
-   Emoji as the main icon system.
-   Huge cards for every small data point.
-   Constant animations.
-   Fake 3D effects that reduce readability.
-   Copying Naruto official game UI or artwork directly.

## Asset and copyright handling

-   Do not scrape or bundle copyrighted manga pages, anime footage,
    music, or proprietary game assets.
-   Prefer original UI artwork, original icons, CSS/SVG effects, and
    user-provided assets with permission.
-   Use text references to canon names and concepts carefully; do not
    imply official affiliation with the Naruto rights holders.
-   Add a clear fan-project disclaimer and credits page.
-   Keep third-party asset licenses documented.

------------------------------------------------------------------------

# 14. Persistence and Data Safety

-   Use LocalStorage for MVP collection and settings.
-   Namespace keys, e.g. `shinobi-genesis:collection:v1`.
-   Store a schema version.
-   Validate every record when loading.
-   If data is corrupt, do not crash the application; offer
    recovery/export where possible.
-   Import must validate file size, JSON shape, schema version,
    duplicate IDs, and required fields.
-   Do not execute imported content as code.
-   Export should include app version, schema version, dataset version,
    and export timestamp.
-   Ask for confirmation before destructive deletion.
-   Provide a "Reset local data" action with a clear warning.

------------------------------------------------------------------------

# 15. Performance, Compatibility, and Deployment

## Performance

-   Keep the initial bundle small.
-   Lazy-load nonessential pages if useful.
-   Avoid rendering the entire dataset in every component.
-   Memoize expensive calculations only when profiling justifies it.
-   Keep wheel animation smooth on ordinary mobile devices.
-   Do not depend on a powerful GPU.

## Browser support

Target current versions of: - Chrome/Chromium. - Edge. - Firefox. -
Safari where practical.

## GitHub Pages

-   Configure Vite `base` correctly for the repository path.
-   Ensure client-side routing works with static hosting. Prefer hash
    routing or a verified fallback strategy to avoid 404s on refresh.
-   Add a GitHub Actions deployment workflow if the repository does not
    already have one.
-   Verify asset paths after deployment.
-   The app must not assume it is hosted at `/`.

------------------------------------------------------------------------


# 15A. Mobile-First and Phone Support (MANDATORY)

The website must fully support smartphones. Mobile support is a release requirement, not an optional responsive polish task. The product must work in a mobile browser on both Android and iOS, including narrow screens and touch input. Do not build a desktop-only interface and shrink it to fit a phone.

## Mobile design requirements
- Use a mobile-first responsive layout. Design and verify the smallest supported phone viewport first, then enhance for tablet and desktop.
- Support narrow viewports from approximately 320 CSS pixels wide without horizontal page scrolling. Content may scroll vertically.
- Use fluid sizing and responsive breakpoints; avoid fixed-width panels and desktop-only multi-column layouts.
- On phones, use a compact navigation pattern such as a bottom navigation bar or accessible menu. Keep primary actions reachable without covering content.
- Stack generator sections and result panels vertically. Use collapsible groups for long spin categories so the generator remains navigable.
- Wheel components must resize to the available width, keep labels readable, and remain usable with touch. Do not require hover to reveal controls or explanations.
- Provide touch targets of approximately 44 by 44 CSS pixels or larger for primary interactive controls, with sufficient spacing to prevent accidental taps.
- Keep buttons, inputs, selects, dialogs, tabs, and reroll controls usable with touch and the on-screen keyboard.
- Prevent the on-screen keyboard from hiding the active name input, save action, or other essential controls.
- Character dossiers, stat panels, battle logs, and collection cards must reflow into readable single-column layouts on phones. Tables must have a mobile-friendly alternative such as stacked key/value rows or contained horizontal scrolling.
- Arena must remain usable on a phone: stack the two fighter panels, keep the battle action visible, and make the battle log readable without requiring a wide screen.
- Use responsive images and avoid oversized assets that unnecessarily increase mobile data usage.
- Respect safe-area insets on devices with rounded corners, notches, or home indicators where fixed navigation is used.
- Support portrait orientation. Landscape may be enhanced, but must not be required for core gameplay.
- Respect `prefers-reduced-motion`; provide a setting to reduce or disable wheel and reveal animations.
- Ensure text remains legible at normal zoom and that the interface does not depend on tiny text, precise pointer movement, or hover states.
- Test touch scrolling, wheel interaction, dialogs, navigation, import/export, and LocalStorage flows on actual or emulated mobile browsers.

## Required mobile verification
Test at minimum these viewport sizes: 320×568, 360×800, 390×844, and 430×932 CSS pixels, plus a tablet viewport. Verify both Android Chrome and iOS Safari where available. Check for: horizontal overflow, clipped controls, overlapping fixed navigation, unreadable wheel labels, keyboard obstruction, broken dialogs, and inaccessible actions.

A mobile layout is not accepted solely because the page technically loads. Every core journey in Section 3 must be completable on a phone: create a character, spin and reroll attributes, reveal the dossier, save to Collection, reopen after refresh, export/import data, and run a 1v1 battle.

# 16. Security and Privacy

-   No login or personal information is required.
-   No analytics or tracking by default.
-   No secrets or API keys should be embedded in the client.
-   Treat imported JSON as untrusted input.
-   Validate and sanitize user-entered names and custom text before
    rendering.
-   Avoid unsafe HTML injection.
-   Do not load arbitrary remote scripts.
-   Explain that LocalStorage data is stored in the user's browser and
    may be lost when browser data is cleared.

------------------------------------------------------------------------

# 17. Testing Strategy

## Unit tests

### RNG

-   Same seed and input produce same result.
-   Different seeds can produce different results.
-   Zero/negative weights are rejected or handled according to
    documented rules.
-   Empty eligible pool returns a structured error.
-   Weight normalization is correct.
-   Current result is excluded during reroll when alternatives exist.

### Compatibility

-   Era restrictions work.
-   Heritage and bloodline constraints work.
-   Dojutsu prerequisites work.
-   Affiliation timeline restrictions work.
-   Strict mode blocks invalid combinations.
-   AU mode relaxes only the intended rules.
-   Warning-only rules do not block generation.

### Character generation

-   Full generation produces all required fields.
-   Partial generation is supported.
-   Same seed and dataset version reproduce the same character.
-   Manual name survives full reroll.
-   Individual reroll updates dependent fields safely.
-   Heritage status and inherited trait remain distinct.
-   Personality and weakness are structured objects.

### Stats and battle

-   Stats remain within defined bounds.
-   Rarity does not directly inflate stats.
-   Weaknesses have defined effects.
-   Fighting style influences action selection.
-   Resource costs are applied.
-   Battle ends within the turn limit.
-   Same battle seed and same character snapshots produce the same
    log/result.

### Persistence

-   Save/load round trip works.
-   Invalid imports are rejected safely.
-   Old schema migration works.
-   Duplicate IDs are handled.
-   Corrupted LocalStorage does not crash the app.

## Integration / browser tests

-   Generate a character from start to finish.
-   Reroll one field and validate dependencies.
-   Save character and find it in Collection.
-   Refresh page and verify persistence.
-   Export and re-import collection.
-   Select two characters and run a battle.
-   Verify mobile layout and keyboard controls.
-   Verify GitHub Pages base path and refresh behavior.

------------------------------------------------------------------------

# 18. Acceptance Criteria

The MVP is accepted only when all of the following are true:

1.  The site deploys successfully to GitHub Pages.
2.  All primary pages are navigable.
3.  A user can create a character without an account or API.
4.  Name can be entered manually or generated instantly without wheel
    animation.
5.  The generator includes every required spin in this plan.
6.  Title Spin contains exactly 100 initial titles.
7.  Heritage Status, Bloodline Trait, Personality, Fighting Style, and
    Weakness are separate, working systems.
8.  Era and compatibility rules prevent obvious timeline contradictions
    in strict mode.
9.  Each spin can be rerolled independently.
10. Full reroll works and preserves a manual name.
11. Results are reproducible from seed and dataset version.
12. The final dossier explains the generated character.
13. Canon, OC, AU, and unverified content are visibly distinguished.
14. Rarity does not automatically grant combat power.
15. Stats are derived through documented rules.
16. Weaknesses and fighting styles influence battle simulation.
17. Two saved characters can fight in the 1v1 Arena.
18. Collection persists after refresh.
19. Collection can be exported and imported safely.
20. Automated tests cover the core engine.
21. The application handles invalid data and empty states gracefully.
22. Mobile layout is fully usable on Android and iOS phones, including all core journeys and touch interactions.
23. Tablet and desktop layouts remain usable without degrading the phone experience.
24. Reduced-motion preference is respected.
25. No mandatory backend, subscription, or paid API is required.

------------------------------------------------------------------------

# 19. Implementation Roadmap

## Phase 0 --- Repository audit

-   Inspect current files and dependencies.
-   Confirm project name and deployment target.
-   Identify existing work to preserve.
-   Report gaps against this plan.
-   Do not rewrite working code without reason.

**Deliverable:** short repository audit and implementation checklist.

## Phase 1 --- Foundation

-   Configure TypeScript strict mode.
-   Establish routes and layout.
-   Set up design tokens and responsive shell.
-   Configure tests.
-   Verify local build and GitHub Pages base path.

**Deliverable:** navigable application shell.

## Phase 2 --- Data schemas and curated data

-   Define spin option types.
-   Add initial spin datasets.
-   Add the 100 titles and verify exact count.
-   Add source-status and rarity metadata.
-   Add data validation tests.

**Deliverable:** typed, validated game-data layer.

## Phase 3 --- RNG and compatibility engine

-   Implement seeded random source.
-   Implement weighted selection.
-   Implement eligibility filters.
-   Implement dependency rules and validation reports.
-   Implement individual and full reroll behavior.

**Deliverable:** tested headless character-generation engine.

## Phase 4 --- Character generation

-   Implement generation pipeline.
-   Add name generator.
-   Add every required spin.
-   Build generator UI and wheel animation.
-   Add final reveal and dossier.

**Deliverable:** complete character generator.

## Phase 5 --- Collection and persistence

-   Save, edit allowed fields, rename, delete.
-   Add filters and sorting.
-   Add import/export and schema migration.

**Deliverable:** reliable local collection.

## Phase 6 --- Stats and Arena

-   Implement stat derivation.
-   Implement combat rating breakdown.
-   Implement turn-based battle engine.
-   Implement battle log and matchup UI.

**Deliverable:** playable 1v1 simulation.

## Phase 7 --- Polish and quality

-   Responsive testing.
-   Accessibility and reduced motion.
-   Performance checks.
-   Error and empty states.
-   Copyright/disclaimer/credits.
-   Full regression tests.

**Deliverable:** release candidate.

## Phase 8 --- Deployment

-   Configure GitHub Actions if needed.
-   Deploy to GitHub Pages.
-   Verify production routes and assets.
-   Test refresh, LocalStorage, import/export, and mobile behavior.

**Deliverable:** public static website.

------------------------------------------------------------------------

# 20. Required Final Report from the Coding Agent

When implementation is complete, provide: 1. Features completed. 2.
Features deferred and why. 3. Final folder structure. 4. Important
architecture decisions. 5. RNG and compatibility rules implemented. 6.
Test commands and test results. 7. Build command and build result. 8.
GitHub Pages deployment steps. 9. Known limitations. 10. Any canon data
marked uncertain or requiring human review.

Do not claim a test passed unless it was actually run. Do not claim
deployment succeeded unless the deployed site was verified.

------------------------------------------------------------------------

# 21. Final Product Definition

Shinobi Genesis is not simply a wheel that randomly assigns Naruto
attributes. It is a lore-aware character-generation system with a
structured identity model, heritage and inherited traits, personality,
fighting specialization, meaningful weaknesses, a coherent timeline, a
transparent power model, a collectible character dossier, and a
lightweight battle simulator.

The core quality bar is **coherent depth**: a generated character should
feel like someone who could plausibly exist in the selected version of
the shinobi world, or be clearly labeled as an OC/AU when it cannot.

Build the engine and data rules first. Build the visual experience
around those reliable systems. Never sacrifice correctness and clarity
merely to make the interface look more impressive.
