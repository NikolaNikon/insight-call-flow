
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Filter } from 'lucide-react';
import { KeywordTrackerList } from '@/components/keyword-trackers/KeywordTrackerList';
import { KeywordTrackerModal } from '@/components/keyword-trackers/KeywordTrackerModal';
import { AnimatedSearchInput } from '@/components/ui/animated-search-input';
import { useKeywordTrackersApi } from '@/hooks/useKeywordTrackersApi';

const KeywordTrackers = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingTracker, setEditingTracker] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const { trackers, categories, isLoading, refetch } = useKeywordTrackersApi({
    include_stats: true,
    category: selectedCategory || undefined
  });

  const filteredTrackers = trackers?.filter(tracker => 
    tracker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tracker.keywords.some(keyword => 
      keyword.toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) || [];

  const groupedTrackers = filteredTrackers.reduce((acc, tracker) => {
    const category = tracker.category || 'Общие';
    if (!acc[category]) acc[category] = [];
    acc[category].push(tracker);
    return acc;
  }, {} as Record<string, typeof trackers>);

  const handleCreateTracker = () => {
    setEditingTracker(null);
    setShowModal(true);
  };

  const handleEditTracker = (tracker: any) => {
    setEditingTracker(tracker);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingTracker(null);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Трекеры ключевых слов</h1>
          <p className="text-gray-600 mt-1">
            Отслеживайте важные фразы в разговорах с клиентами
          </p>
        </div>
        <Button onClick={handleCreateTracker} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Создать трекер
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <AnimatedSearchInput
                placeholder="Поиск трекеров и ключевых слов..."
                value={searchTerm}
                onChange={setSearchTerm}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('')}
              >
                Все категории
              </Button>
              {categories?.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{trackers?.length || 0}</div>
            <div className="text-sm text-gray-600">Всего трекеров</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{categories?.length || 0}</div>
            <div className="text-sm text-gray-600">Категорий</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {trackers?.filter(t => t.is_active).length || 0}
            </div>
            <div className="text-sm text-gray-600">Активных</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {trackers?.reduce((sum, t) => sum + (t.mentions_count || 0), 0) || 0}
            </div>
            <div className="text-sm text-gray-600">Всего упоминаний</div>
          </CardContent>
        </Card>
      </div>

      {/* Trackers List */}
      {Object.keys(groupedTrackers).length === 0 ? (
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">🧠</div>
            <h3 className="text-xl font-semibold mb-2">Трекеры не настроены</h3>
            <p className="text-gray-600 mb-6">
              Создайте первый трекер для отслеживания ключевых слов в разговорах
            </p>
            <Button onClick={handleCreateTracker} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Создать трекер
            </Button>
          </CardContent>
        </Card>
      ) : (
        <KeywordTrackerList
          groupedTrackers={groupedTrackers}
          onEdit={handleEditTracker}
          onRefresh={refetch}
        />
      )}

      {/* Modal */}
      <KeywordTrackerModal
        open={showModal}
        onClose={handleModalClose}
        tracker={editingTracker}
      />
    </div>
  );
};

export default KeywordTrackers;
