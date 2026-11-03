import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wheel } from '@/components/Wheel';
import { generateCharacter } from '@/engine/generation';
import { dataContext } from '@/hooks/useGeneration';
import { SeededRandom, weightedSelect } from '@/engine/rng';
import { loadCollection, saveCharacter } from '@/engine/persistence';
import { useTheme, type DataMode } from '@/theme/ThemeContext';
import {
  bloodlineTraits,
  clans,
  fightingStyles,
  heritageStatuses,
  ranks,
} from '@/data/index';
import type { Character, SpinOption } from '@/types';

type StageKey = 'name' | 'clan' | 'heritage' | 'bloodline' | 'rank' | 'style' | 'result';
type SpinStageKey = Exclude<StageKey, 'name' | 'result'>;

type StageMeta = {
  eyebrow: string;
  title: string;
  category: string;
  prompt: string;
  hint: string;
  noun: string;
  options: SpinOption[];
};

const STAGE_ORDER: StageKey[] = ['name', 'clan', 'heritage', 'bloodline', 'rank', 'style', 'result'];

const STAGES: Record<SpinStageKey, StageMeta> = {
  clan: {
    eyebrow: 'Tahap 02 · Klan',
    title: 'Klan',
    category: 'Klan',
    prompt: 'Klan apa yang mengalir di darahmu?',
    hint: 'Klan menentukan predileksi awal. Irisan yang lebih lebar punya peluang lebih besar untuk keluar.',
    noun: 'klan',
    options: clans,
  },
  heritage: {
    eyebrow: 'Tahap 03 · Warisan · 1/2',
    title: 'Status warisan',
    category: 'Status warisan',
    prompt: 'Bagaimana garis keturunanmu?',
    hint: 'Status warisan memengaruhi kepercayaan dunia terhadap darah dan masa lalu klanmu.',
    noun: 'status warisan',
    options: heritageStatuses,
  },
  bloodline: {
    eyebrow: 'Tahap 03 · Warisan · 2/2',
    title: 'Sifat darah',
    category: 'Sifat darah',
    prompt: 'Sifat apa yang diwariskan darahmu?',
    hint: 'Tidak semua shinobi mewarisi kekuatan khusus. Kebanyakan justru tidak punya kemampuan bawaan.',
    noun: 'sifat darah',
    options: bloodlineTraits,
  },
  rank: {
    eyebrow: 'Tahap 04 · Ranga & gaya · 1/2',
    title: 'Ranga',
    category: 'Ranga',
    prompt: 'Sejauh mana reputasi militermu?',
    hint: 'Ranga menentukan kedudukan awal, bukan batas akhir kekuatan.',
    noun: 'ranga',
    options: ranks,
  },
  style: {
    eyebrow: 'Tahap 04 · Ranga & gaya · 2/2',
    title: 'Gaya bertarung',
    category: 'Gaya bertarung',
    prompt: 'Bagaimana kamu menghadapi lawan?',
    hint: 'Gaya bertarung memberi arah statistik dan menentukan teknik dasar yang kamu bawa.',
    noun: 'gaya',
    options: fightingStyles,
  },
};

const GROUPS: { id: string; label: string; keys: StageKey[] }[] = [
  { id: 'name', label: 'Nama', keys: ['name'] },
  { id: 'clan', label: 'Klan', keys: ['clan'] },
  { id: 'heritage', label: 'Warisan', keys: ['heritage', 'bloodline'] },
  { id: 'rank', label: 'Ranga', keys: ['rank', 'style'] },
  { id: 'result', label: 'Hasil', keys: ['result'] },
];

const FIRST_NAMES = ['Hikari', 'Ren', 'Sora', 'Kaito', 'Emi', 'Daiki', 'Mei', 'Ryo', 'Yua', 'Jin', 'Akira', 'Haru', 'Nao', 'Shin', 'Yuki', 'Kaede', 'Tsubaki', 'Itsuki'];
const LAST_NAMES = ['Kazane', 'Shirogane', 'Amagiri', 'Tsukimori', 'Kurogane', 'Hoshizora', 'Mizukawa', 'Tachibana', 'Fuyuki', 'Kagerou', 'Sakimori', 'Amane'];

const STAT_LABELS: [keyof Character['stats'], string][] = [
  ['ninjutsu', 'Ninjutsu'],
  ['taijutsu', 'Taijutsu'],
  ['genjutsu', 'Genjutsu'],
  ['chakraControl', 'Kontrol'],
  ['chakraReserves', 'Cadangan'],
  ['speed', 'Kecepatan'],
  ['strength', 'Kekuatan'],
  ['intelligence', 'Intel'],
];

function eligible(options: SpinOption[], mode: DataMode): SpinOption[] {
  return options.filter(
    (option) => option.weight > 0 && (mode === 'au' || option.sourceStatus !== 'oc')
  );
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function powerClass(tier: number): string {
  if (tier >= 5) return 'Kelas Kage';
  if (tier >= 4) return 'Elit Jōnin';
  if (tier >= 3) return 'Chūnin';
  if (tier >= 2) return 'Genin';
  if (tier >= 1) return 'Akademi';
  return 'Sipil';
}

export default function GeneratorPage() {
  const navigate = useNavigate();
  const { reducedMotion, mode } = useTheme();

  const [stageKey, setStageKey] = useState<StageKey>('name');
  const [name, setName] = useState('');
  const [answers, setAnswers] = useState<Partial<Record<SpinStageKey, SpinOption>>>({});
  const [pending, setPending] = useState<SpinOption | null>(null);
  const [spinToken, setSpinToken] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [character, setCharacter] = useState<Character | null>(null);
  const [saved, setSaved] = useState(false);
  const [leaderboard, setLeaderboard] = useState<Character[]>([]);
  const [error, setError] = useState<string | null>(null);
  const modeRef = useRef(mode);

  useEffect(() => {
    if (modeRef.current === mode) return;
    modeRef.current = mode;
    setAnswers({});
    setPending(null);
    setSpinning(false);
    setCharacter(null);
    setSaved(false);
    setError(null);
    setStageKey((previous) => (previous === 'name' ? 'name' : 'clan'));
  }, [mode]);

  const refreshLeaderboard = useCallback(() => {
    const sorted = [...loadCollection()]
      .sort((a, b) => (b.combatRating?.score ?? 0) - (a.combatRating?.score ?? 0))
      .slice(0, 12);
    setLeaderboard(sorted);
  }, []);

  useEffect(() => {
    refreshLeaderboard();
  }, [refreshLeaderboard]);

  const wheelOptions = useMemo(() => {
    if (stageKey === 'clan') return eligible(STAGES.clan.options, mode);
    if (stageKey === 'heritage') return eligible(STAGES.heritage.options, mode);
    if (stageKey === 'bloodline') return eligible(STAGES.bloodline.options, mode);
    if (stageKey === 'rank') return eligible(STAGES.rank.options, mode);
    if (stageKey === 'style') return eligible(STAGES.style.options, mode);
    return [];
  }, [stageKey, mode]);

  const displayOptions = useMemo(() => {
    if (stageKey === 'name' || stageKey === 'result') return eligible(STAGES.clan.options, mode);
    return wheelOptions;
  }, [stageKey, wheelOptions, mode]);

  const currentAnswer = stageKey !== 'name' && stageKey !== 'result' ? answers[stageKey] : undefined;
  const currentStage = stageKey !== 'name' && stageKey !== 'result' ? STAGES[stageKey] : null;
  const activeGroupIndex = GROUPS.findIndex((group) => group.keys.includes(stageKey));

  const rolls = useMemo(() => {
    const rows: { category: string; result: string }[] = [];
    if (name.trim() && stageKey !== 'name') {
      rows.push({ category: 'Nama', result: name.trim() });
    }
    (['clan', 'heritage', 'bloodline', 'rank', 'style'] as SpinStageKey[]).forEach((key) => {
      const answer = answers[key];
      if (answer) rows.push({ category: STAGES[key].category, result: answer.label });
    });
    return rows;
  }, [name, answers, stageKey]);

  const commitName = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setName(trimmed);
    setStageKey('clan');
  }, [name]);

  const rollName = useCallback(() => {
    setName(`${pickRandom(FIRST_NAMES)} ${pickRandom(LAST_NAMES)}`);
  }, []);

  const handleSpin = useCallback(() => {
    if (spinning || stageKey === 'name' || stageKey === 'result') return;
    if (answers[stageKey]) return;
    if (wheelOptions.length === 0) return;

    const rng = new SeededRandom(`wheel-${stageKey}-${Date.now()}-${Math.random()}`);
    const picked = weightedSelect(
      rng,
      wheelOptions.map((option) => ({ item: option, weight: option.weight }))
    ).item;

    setPending(picked);
    setSpinToken((token) => token + 1);
    setSpinning(true);
    setError(null);
  }, [answers, spinning, stageKey, wheelOptions]);

  const handleSpinEnd = useCallback(() => {
    if (pending && stageKey !== 'name' && stageKey !== 'result') {
      setAnswers((previous) => ({ ...previous, [stageKey]: pending }));
      setCharacter(null);
      setSaved(false);
    }
    setSpinning(false);
    setPending(null);
  }, [pending, stageKey]);

  const handleReroll = useCallback(() => {
    if (stageKey === 'name' || stageKey === 'result') return;
    setAnswers((previous) => {
      const next = { ...previous };
      delete next[stageKey];
      return next;
    });
    setPending(null);
    setSpinning(false);
    setCharacter(null);
    setSaved(false);
  }, [stageKey]);

  const handleNext = useCallback(() => {
    const index = STAGE_ORDER.indexOf(stageKey);
    if (index < 0 || index >= STAGE_ORDER.length - 1) return;
    setStageKey(STAGE_ORDER[index + 1]);
  }, [stageKey]);

  const finalizeCharacter = useCallback(() => {
    const trimmed = name.trim();
    const seed = `wheel-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

    try {
      const generated = generateCharacter(
        {
          mode,
          name: trimmed || undefined,
          nameSource: trimmed ? 'manual' : 'generated',
          seed,
          clanId: answers.clan?.id,
          heritageId: answers.heritage?.id,
          bloodlineId: answers.bloodline?.id,
          rankId: answers.rank?.id,
          fightingStyleId: answers.style?.id,
        },
        dataContext
      );
      setCharacter(generated);
      setSaved(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mewujudkan karakter.');
    }
  }, [answers, name, mode]);

  const persistCharacter = useCallback((): boolean => {
    if (!character) return false;
    try {
      saveCharacter(character);
      setSaved(true);
      refreshLeaderboard();
      setError(null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan karakter.');
      return false;
    }
  }, [character, refreshLeaderboard]);

  const saveAndOpen = useCallback(() => {
    if (persistCharacter()) {
      navigate(`/character/${character?.id}`);
    }
  }, [character?.id, navigate, persistCharacter]);

  const reset = useCallback(() => {
    setStageKey('name');
    setName('');
    setAnswers({});
    setPending(null);
    setSpinning(false);
    setSpinToken(0);
    setCharacter(null);
    setSaved(false);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const totalWeight = displayOptions.reduce((sum, option) => sum + option.weight, 0);
  const highlightId =
    stageKey === 'result'
      ? answers.clan?.id ?? null
      : currentAnswer?.id ?? null;

  const centerLabel =
    stageKey === 'name' ? 'NAMA' : stageKey === 'result' ? 'HASIL' : 'PUTAR';

  return (
    <div className="sg-page">
      <div className="steps" aria-label="Tahap pembuatan karakter">
        {GROUPS.map((group, index) => {
          const active = group.keys.includes(stageKey);
          const done = group.keys.every((key) => {
            if (key === 'name') return stageKey !== 'name';
            if (key === 'result') return Boolean(character);
            return Boolean(answers[key]);
          });
          return (
            <span
              key={group.id}
              className={active ? 'active' : done ? 'done' : undefined}
              aria-current={active ? 'step' : undefined}
            >
              {String(index + 1).padStart(2, '0')} {group.label}
            </span>
          );
        })}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="sg-main">
        <section className="wheel-card" aria-label="Roda undian">
          <Wheel
            key={stageKey}
            options={displayOptions.map((option) => ({
              id: option.id,
              label: option.label,
              weight: option.weight,
            }))}
            targetId={pending?.id ?? null}
            highlightId={highlightId}
            spinToken={spinToken}
            spinning={spinning}
            onSpinEnd={handleSpinEnd}
            onSpin={
              stageKey === 'name'
                ? () => document.getElementById('sg-name-input')?.focus()
                : stageKey === 'result'
                  ? undefined
                  : handleSpin
            }
            reducedMotion={reducedMotion}
            disabled={
              spinning ||
              stageKey === 'result' ||
              Boolean(currentAnswer) ||
              (stageKey !== 'name' && displayOptions.length === 0)
            }
            centerLabel={centerLabel}
            centerSubLabel={
              stageKey === 'name'
                ? 'MULAI'
                : stageKey === 'result'
                  ? 'SELESAI'
                  : currentAnswer
                    ? 'TERKUNCI'
                    : 'KLIK'
            }
          />
        </section>

        <aside className="side-panel" aria-live="polite">
          {stageKey === 'name' && (
            <>
              <div className="eyebrow">Tahap 01 · Nama</div>
              <h1 className="stage-title">Namai shinobi-mu</h1>
              <div className="result-box">
                <strong>{name.trim() || 'Siapa namamu?'}</strong>
                <small>
                  {name.trim()
                    ? 'Tekan Simpan Nama untuk membuka roda klan.'
                    : 'Nama akan tercatat di dossier dan leaderboard lokal.'}
                </small>
              </div>

              <div className="name-controls">
                <label className="sr-only" htmlFor="sg-name-input">Nama shinobi</label>
                <input
                  id="sg-name-input"
                  className="form-input"
                  type="text"
                  maxLength={28}
                  autoComplete="off"
                  placeholder="Nama shinobi"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') commitName();
                  }}
                />
                <div className="name-actions">
                  <button type="button" className="btn btn-primary" onClick={commitName} disabled={!name.trim()}>
                    Simpan Nama
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={rollName}>
                    Acak Nama
                  </button>
                </div>
              </div>

              <p className="hint">
                Roda pertama menentukan klan. Setiap klan membawa predileksi dan buff yang berbeda.
              </p>
            </>
          )}

          {currentStage && (
            <>
              <div className="eyebrow">{currentStage.eyebrow}</div>
              <h1 className="stage-title">{currentStage.title}</h1>
              <div className="result-box">
                <strong>
                  {spinning
                    ? 'Mengundi…'
                    : currentAnswer
                      ? currentAnswer.label
                      : currentStage.prompt}
                </strong>
                <small>
                  {spinning
                    ? 'Roda takdir sedang berputar.'
                    : currentAnswer
                      ? currentAnswer.description || 'Hasil tersimpan. Lanjut ke tahap berikutnya.'
                      : 'Tekan PUTAR di tengah roda atau tombol di bawah.'}
                </small>
              </div>

              <div className="panel-actions">
                {currentAnswer ? (
                  <>
                    <button type="button" className="btn btn-primary" onClick={handleNext}>
                      Lanjut →
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={handleReroll}>
                      Ulangi undian
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSpin}
                    disabled={spinning}
                  >
                    {spinning ? 'Berputar…' : `Putar ${currentStage.noun}`}
                  </button>
                )}
              </div>

              <p className="hint">{currentStage.hint}</p>

              <div className="chips" aria-label="Daftar pilihan dan peluang">
                {displayOptions.map((option) => (
                  <span className="chip" key={option.id}>
                    {option.label}
                    <b>{((option.weight / totalWeight) * 100).toFixed(2)}%</b>
                  </span>
                ))}
              </div>
            </>
          )}

          {stageKey === 'result' && (
            <>
              <div className="eyebrow">Tahap 05 · Hasil</div>
              <h1 className="stage-title">{character ? character.name : 'Wujudkan karakter'}</h1>
              <div className="result-box">
                <strong>
                  {character ? character.title.label : 'Semua unsur sudah terkumpul.'}
                </strong>
                <small>
                  {character
                    ? `${character.era.label} · ${character.rank.rank.label} · ${character.fightingStyle.primary.label}`
                    : 'Tekan tombol di bawah untuk mengunci takdir dan menghitung kekuatan.'}
                </small>
              </div>

              {character ? (
                <>
                  <div className="result-tags">
                    <span>{character.clan.label}</span>
                    <span>{character.heritage.status.label}</span>
                    <span>{character.bloodline.trait.label}</span>
                    <span>{character.chakra.primary.label}</span>
                    <span>{character.dojutsu.eye.label}</span>
                  </div>

                  <div className="panel-actions">
                    <button type="button" className="btn btn-primary" onClick={saveAndOpen}>
                      {saved ? 'Buka Detail →' : 'Simpan & Lihat Detail'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={persistCharacter}
                      disabled={saved}
                    >
                      {saved ? 'Tersimpan ✓' : 'Simpan ke Koleksi'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="panel-actions">
                  <button type="button" className="btn btn-primary" onClick={finalizeCharacter}>
                    Wujudkan Karakter
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setStageKey('style')}>
                    Kembali ke gaya
                  </button>
                </div>
              )}

              <p className="hint">
                Karakter disimpan di browser ini. Ekspor JSON dari halaman Data &amp; penyimpanan
                untuk memindahkannya ke perangkat lain.
              </p>
            </>
          )}
        </aside>

        <div className="info-stack">
        <aside className="info-panel saved-results" aria-labelledby="sg-rolls-title">
          <h2 id="sg-rolls-title">Undianmu</h2>
          <table className="rolls-table">
            <thead>
              <tr>
                <th scope="col">Kategori</th>
                <th scope="col">Hasil</th>
              </tr>
            </thead>
            <tbody aria-live="polite">
              {rolls.length === 0 ? (
                <tr>
                  <td colSpan={2} className="panel-empty">Belum ada undian.</td>
                </tr>
              ) : (
                rolls.map((row) => (
                  <tr key={row.category}>
                    <th scope="row">{row.category}</th>
                    <td>{row.result}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </aside>

        <aside className="info-panel leaderboard" aria-labelledby="sg-leaderboard-title">
          <h2 id="sg-leaderboard-title">Leaderboard karakter</h2>
          {leaderboard.length === 0 ? (
            <p className="panel-empty">
              Selesaikan karakter pertamamu, lalu simpan ke koleksi untuk masuk leaderboard.
            </p>
          ) : (
            <div className="leader-list" aria-live="polite">
              {leaderboard.map((entry, index) => (
                <button
                  type="button"
                  className="leader-item"
                  key={entry.id}
                  onClick={() => navigate(`/character/${entry.id}`)}
                >
                  <span className="leader-rank">{String(index + 1).padStart(2, '0')}</span>
                  <span className="leader-name">{entry.name}</span>
                  <span className="leader-power">{Math.round(entry.combatRating.score)}</span>
                  <span className="leader-clan">
                    {entry.clan.label} · {entry.rank.rank.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </aside>
        </div>
      </div>

      {character && (
        <section className="power-summary" aria-live="polite">
          <div className="power-head">
            <div>
              <div className="eyebrow">Kekuatan keseluruhan</div>
              <strong className="power-score">{Math.round(character.combatRating.score)}</strong>
            </div>
            <div className="power-copy">
              <div className="power-class">{powerClass(character.rank.combatTier)}</div>
              <p>
                {character.abilities.length} kemampuan · {character.weaknesses.length} kelemahan ·
                {' '}{character.chakra.primary.label} · {character.dojutsu.eye.label}
              </p>
            </div>
          </div>

          <div className="stat-grid">
            {STAT_LABELS.map(([key, label]) => (
              <div className="stat-item" key={key}>
                <span>{label}</span>
                <strong>{character.stats[key]}</strong>
              </div>
            ))}
          </div>

          <p className="power-note">
            Skor buatan game dari 12 statistik inti, bonus kemampuan, dan penalti kelemahan.
            Bukan skala resmi Naruto.
          </p>

          <div className="power-abilities">
            {character.abilities.map((ability) => (
              <span className="ability-pill" key={ability.id}>{ability.name}</span>
            ))}
            {character.weaknesses.map((weakness) => (
              <span className="ability-pill is-weakness" key={weakness.id}>{weakness.label}</span>
            ))}
          </div>
        </section>
      )}

      <div className="sg-bottom">
        <button type="button" className="btn btn-secondary reset-button" onClick={reset}>
          Mulai dari awal
        </button>

        <details className="catalog">
          <summary>Katalog, sumber, dan aturan dunia</summary>
          <p>
            Katalog ini menggabungkan entri Naruto, Boruto, dan Two Blue Vortex dengan beberapa
            opsi orisinal game. Bobot roda adalah keseimbangan buatan, bukan persentase resmi.
          </p>
          <p>
            {mode === 'au'
              ? 'Mode alternatif (AU) mengaktifkan opsi OC di roda. Hasil tetap ditentukan engine terlebih dahulu, lalu roda berhenti pada hasil tersebut.'
              : 'Mode lore ketat menyaring opsi bertanda OC dari roda. Hasil ditentukan engine terlebih dahulu, lalu roda berhenti pada hasil tersebut.'}
          </p>
          <div className="catalog-grid">
            <span>100 title awal</span>
            <span>{eligible(clans, mode).length} klan</span>
            <span>{eligible(heritageStatuses, mode).length} status warisan</span>
            <span>{eligible(bloodlineTraits, mode).length} sifat darah</span>
            <span>{eligible(ranks, mode).length} ranga</span>
            <span>{eligible(fightingStyles, mode).length} gaya</span>
          </div>
        </details>
      </div>
    </div>
  );
}
