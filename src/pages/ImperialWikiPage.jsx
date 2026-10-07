import React, { useState, useMemo } from 'react';
import { SubsystemTopBanner } from '../components/navigation/SubsystemTopBanner.jsx';
import { useNavigation } from '../components/navigation/NavigationContext.jsx';
import { WikiSearchHeader } from '../components/wiki/WikiSearchHeader.jsx';
import { WikiNavigationSidebar } from '../components/wiki/WikiNavigationSidebar.jsx';
import { WikiArticleView } from '../components/wiki/WikiArticleView.jsx';
import { WIKI_CATEGORIES, WIKI_ENTRIES } from '../data/wikiData.js';

/**
 * ImperialWikiPage — Pantalla completa orquestadora de la Gran Enciclopedia Imperial
 */
const ImperialWikiPage = ({
  state,
  currentPlanet,
  production,
  fmt
}) => {
  const { navigateTo, navigateBack } = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeEntryId, setActiveEntryId] = useState(WIKI_ENTRIES[0]?.id || '');

  // Chips sugeridos rápidos
  const recentChips = useMemo(() => [
    'metal', 'deuterio', 'nanobots', 'amm', 'fuego rapido', 'biomas', 'ministerios'
  ], []);

  // Filtrado reactivo de artículos
  const filteredEntries = useMemo(() => {
    return WIKI_ENTRIES.filter((entry) => {
      // Filtro por categoría
      if (activeCategory !== 'all' && entry.category !== activeCategory) {
        return false;
      }

      // Filtro por búsqueda
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const matchTitle = entry.title?.toLowerCase().includes(q);
      const matchSubtitle = entry.subtitle?.toLowerCase().includes(q);
      const matchSummary = entry.summary?.toLowerCase().includes(q);
      const matchGuide = entry.guide?.toLowerCase().includes(q);
      const matchTags = entry.tags?.some(t => t.toLowerCase().includes(q));

      return matchTitle || matchSubtitle || matchSummary || matchGuide || matchTags;
    });
  }, [searchQuery, activeCategory]);

  // Si el artículo activo no está en la lista filtrada, seleccionar el primero disponible
  const currentEntry = useMemo(() => {
    const found = filteredEntries.find(e => e.id === activeEntryId);
    if (found) return found;
    return filteredEntries[0] || null;
  }, [filteredEntries, activeEntryId]);

  return (
    <div className="space-y-5 view-enter w-full pb-16">
      {/* Top Banner Estandarizado */}
      <SubsystemTopBanner
        state={state}
        currentPlanet={currentPlanet}
        production={production}
        fmt={fmt}
        breadcrumbTitle="Gran Enciclopedia Imperial (Codex Magnus)"
        breadcrumbIcon="📚"
        parentHub="imperial_hub"
        backButtonLabelTop="VOLVER A"
        backButtonLabelBottom="Mando Imperial"
        backButtonIcon="👑"
        onBackToAltoMando={() => {
          if (navigateBack) navigateBack();
        }}
        rightSlot={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigateTo && navigateTo('stats')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 text-xs font-mono text-cyan-300 transition-colors cursor-pointer"
              title="Abrir panel histórico de telemetría y estadísticas"
            >
              <span>📊</span>
              <span>Telemetría y Stats</span>
            </button>
          </div>
        }
      />

      {/* Cabecera del Buscador y Categorías */}
      <WikiSearchHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        categories={WIKI_CATEGORIES}
        totalResults={filteredEntries.length}
        totalEntries={WIKI_ENTRIES.length}
        recentChips={recentChips}
        onSelectChip={(chip) => setSearchQuery(chip)}
      />

      {/* Grid de 2 Columnas: Índice y Visor de Artículo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Columna Izquierda (Índice / 30% aprox - lg:col-span-4) */}
        <div className="lg:col-span-4 w-full">
          <WikiNavigationSidebar
            entries={filteredEntries}
            activeEntryId={currentEntry?.id}
            onSelectEntry={setActiveEntryId}
            activeCategory={activeCategory}
            categories={WIKI_CATEGORIES}
          />
        </div>

        {/* Columna Derecha (Visor de Artículo / 70% aprox - lg:col-span-8) */}
        <div className="lg:col-span-8 w-full">
          <WikiArticleView
            entry={currentEntry}
            onTagClick={(tag) => setSearchQuery(tag)}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(ImperialWikiPage);
