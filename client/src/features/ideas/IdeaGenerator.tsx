import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Lightbulb,
  Bookmark,
  BookmarkCheck,
  Filter,
  Check,
  Tag,
  DollarSign,
  Info,
} from 'lucide-react';
import type { SavedEvent, Idea } from '../../types';
import { generateLocalIdeas } from '../../services/localPlanningEngine';
import { generateIdeasAPI } from '../../services/api';

interface IdeaGeneratorProps {
  event: SavedEvent;
  onUpdateEvent: (updated: SavedEvent) => void;
}

const PREFERENCE_CONTROLS = [
  { id: 'all', label: 'All Styles' },
  { id: 'affordable', label: 'More Affordable' },
  { id: 'elegant', label: 'More Elegant' },
  { id: 'traditional', label: 'More Traditional' },
  { id: 'modern', label: 'More Modern' },
  { id: 'eco-friendly', label: 'More Eco-Friendly' },
  { id: 'family-friendly', label: 'More Family-Friendly' },
];

const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'themes', label: 'Themes' },
  { id: 'decorations', label: 'Decorations' },
  { id: 'menu', label: 'Menu & Catering' },
  { id: 'activities', label: 'Guest Activities' },
];

export function IdeaGenerator({ event, onUpdateEvent }: IdeaGeneratorProps) {
  const [selectedPreference, setSelectedPreference] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [savedIdeaTitles, setSavedIdeaTitles] = useState<Set<string>>(
    new Set((event.ideas || []).filter(i => i.saved).map(i => i.title))
  );

  useEffect(() => {
    loadIdeas();
  }, [selectedPreference, selectedCategory]);

  const loadIdeas = async () => {
    setIsLoading(true);
    const cat = selectedCategory === 'all' ? undefined : selectedCategory;
    const pref = selectedPreference === 'all' ? undefined : selectedPreference;

    try {
      // Attempt backend API, fall back to local rule engine
      const apiRes = await generateIdeasAPI(event.context, cat, pref);
      if (apiRes && apiRes.ideas) {
        setIdeas(apiRes.ideas);
      } else {
        const local = generateLocalIdeas(event.context, cat, pref);
        setIdeas(local.ideas);
      }
    } catch {
      const local = generateLocalIdeas(event.context, cat, pref);
      setIdeas(local.ideas);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBookmark = (idea: Idea) => {
    const isBookmarked = savedIdeaTitles.has(idea.title);
    const updatedSet = new Set(savedIdeaTitles);

    let updatedSavedIdeas = [...(event.ideas || [])];

    if (isBookmarked) {
      updatedSet.delete(idea.title);
      updatedSavedIdeas = updatedSavedIdeas.filter(i => i.title !== idea.title);
    } else {
      updatedSet.add(idea.title);
      updatedSavedIdeas.push({ ...idea, saved: true });
    }

    setSavedIdeaTitles(updatedSet);
    onUpdateEvent({
      ...event,
      ideas: updatedSavedIdeas,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="card p-6 border border-stone-200">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-primary-600" />
          <h3 className="font-bold text-stone-900 text-base">Personalized Idea Inspiration Engine</h3>
        </div>
        <p className="text-xs text-stone-500 mb-5">
          Dynamic theme, decor, menu, and activity recommendations tuned to your {event.context.basics.eventType} for {event.context.basics.guestCount} guests. Pick aesthetic focus pills to re-rank ideas instantly.
        </p>

        {/* Preference Controls */}
        <div className="space-y-3">
          <div>
            <div className="text-[11px] font-semibold text-stone-600 mb-1.5 uppercase tracking-wider">
              Aesthetic & Budget Focus Controls:
            </div>
            <div className="flex flex-wrap gap-2">
              {PREFERENCE_CONTROLS.map(ctrl => {
                const active = selectedPreference === ctrl.id;
                return (
                  <button
                    key={ctrl.id}
                    onClick={() => setSelectedPreference(ctrl.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                      active
                        ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {active && <Check className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />}
                    {ctrl.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Tabs */}
          <div>
            <div className="text-[11px] font-semibold text-stone-600 mb-1.5 uppercase tracking-wider">
              Category Scope:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(cat => {
                const active = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                      active
                        ? 'bg-accent-600 text-white border-accent-600'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Ideas Grid */}
      {isLoading ? (
        <div className="card text-center py-12">
          <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-stone-500">Refining personalized ideas...</p>
        </div>
      ) : ideas.length === 0 ? (
        <div className="card text-center py-12 text-stone-400 text-xs">
          No ideas found matching these filters. Try choosing "All Styles".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ideas.map((idea, idx) => {
            const isBookmarked = savedIdeaTitles.has(idea.title);
            return (
              <div
                key={idx}
                className="card p-5 border border-stone-200 bg-white hover:border-primary-300 transition shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent-700 bg-accent-50 px-2 py-0.5 rounded">
                      {idea.category}
                    </span>
                    <button
                      onClick={() => toggleBookmark(idea)}
                      className={`p-1 rounded hover:bg-stone-100 transition ${
                        isBookmarked ? 'text-primary-600' : 'text-stone-300 hover:text-stone-500'
                      }`}
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark idea'}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="w-4 h-4 text-primary-600 fill-primary-600" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <h4 className="font-bold text-stone-900 text-sm mb-1.5">{idea.title}</h4>
                  <p className="text-xs text-stone-600 leading-relaxed mb-3">{idea.description}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <div className="text-[11px] text-stone-500 bg-stone-50 p-2 rounded-lg border border-stone-100">
                    <span className="font-semibold text-stone-700">Why it fits: </span>
                    {idea.whyItFits}
                  </div>

                  <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                    <span className="font-medium text-primary-700 text-[11px]">
                      Est. Cost: {idea.estimatedCost}
                    </span>
                    <div className="flex gap-1">
                      {idea.tags.slice(0, 2).map((t, tidx) => (
                        <span
                          key={tidx}
                          className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
